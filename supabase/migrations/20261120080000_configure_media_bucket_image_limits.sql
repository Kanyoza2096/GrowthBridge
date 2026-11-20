-- Keep the public media bucket restricted to lightweight website images.
-- Uploads are authenticated by the server-side service role; public access is read-only.
UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
WHERE id = 'media';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'media') THEN
    RAISE EXCEPTION 'Required Supabase Storage bucket "media" does not exist';
  END IF;
END $$;
