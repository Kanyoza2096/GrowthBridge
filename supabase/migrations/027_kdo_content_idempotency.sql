-- Idempotent KDO -> GrowthBridge content publication.
-- The RPC creates the blog post and records its response in one transaction.
CREATE TABLE IF NOT EXISTS public.kdo_content_idempotency (
  idempotency_key TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  request_sha256 TEXT NOT NULL,
  response_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kdo_content_idempotency ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.kdo_content_idempotency FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.kdo_content_idempotency TO service_role;

CREATE OR REPLACE FUNCTION public.publish_kdo_blog_content(
  p_idempotency_key TEXT,
  p_workspace_id TEXT,
  p_request_sha256 TEXT,
  p_title TEXT,
  p_slug TEXT,
  p_content TEXT,
  p_excerpt TEXT,
  p_cover_image TEXT,
  p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  existing public.kdo_content_idempotency%ROWTYPE;
  created_post public.blog_posts%ROWTYPE;
  response JSONB;
BEGIN
  IF p_idempotency_key IS NULL OR length(p_idempotency_key) < 8 OR length(p_idempotency_key) > 200 THEN
    RAISE EXCEPTION 'Invalid idempotency key' USING ERRCODE = '22023';
  END IF;
  IF p_status NOT IN ('draft', 'published') THEN
    RAISE EXCEPTION 'Unsupported publication status' USING ERRCODE = '22023';
  END IF;
  IF p_title IS NULL OR length(trim(p_title)) = 0 OR p_content IS NULL OR length(p_content) = 0 THEN
    RAISE EXCEPTION 'Title and content are required' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_idempotency_key, 0));

  SELECT * INTO existing
    FROM public.kdo_content_idempotency
   WHERE idempotency_key = p_idempotency_key
   FOR UPDATE;

  IF FOUND THEN
    IF existing.workspace_id <> p_workspace_id OR existing.request_sha256 <> p_request_sha256 THEN
      RAISE EXCEPTION 'Idempotency key was already used for a different request' USING ERRCODE = '22023';
    END IF;
    IF existing.response_json IS NOT NULL THEN
      RETURN existing.response_json;
    END IF;
  ELSE
    INSERT INTO public.kdo_content_idempotency (
      idempotency_key, workspace_id, request_sha256
    ) VALUES (
      p_idempotency_key, p_workspace_id, p_request_sha256
    );
  END IF;

  INSERT INTO public.blog_posts (
    slug, title, excerpt, content, author_name, cover_image,
    category, status, published_at
  ) VALUES (
    p_slug, p_title, p_excerpt, p_content, 'KDO', p_cover_image,
    'technology', p_status,
    CASE WHEN p_status = 'published' THEN now() ELSE NULL END
  )
  RETURNING * INTO created_post;

  response := jsonb_build_object(
    'id', created_post.id,
    'post_id', created_post.id,
    'title', created_post.title,
    'slug', created_post.slug,
    'status', created_post.status,
    'url', '/blog/' || created_post.slug
  );

  UPDATE public.kdo_content_idempotency
     SET response_json = response, updated_at = now()
   WHERE idempotency_key = p_idempotency_key;

  RETURN response;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_kdo_blog_content(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_kdo_blog_content(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT)
  TO service_role;
