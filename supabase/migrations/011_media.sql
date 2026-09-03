-- supabase/migrations/011_media.sql
-- Media folders and files table

CREATE TABLE IF NOT EXISTS media_folders (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  parent_id  UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  url         TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  BIGINT NOT NULL,
  width       INTEGER,
  height      INTEGER,
  folder_id   UUID REFERENCES media_folders(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  alt_text    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
