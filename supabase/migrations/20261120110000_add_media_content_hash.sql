-- Content hashes prevent duplicate media objects without relying on filenames.
ALTER TABLE public.media
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS media_content_hash_unique
  ON public.media (content_hash)
  WHERE content_hash IS NOT NULL;
