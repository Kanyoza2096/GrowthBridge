-- supabase/migrations/004_projects.sql
-- Projects table matching Project domain model

CREATE TABLE IF NOT EXISTS projects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  client            TEXT NOT NULL,
  category          TEXT NOT NULL,
  description       TEXT NOT NULL,
  short_description TEXT,
  image             TEXT,
  gallery           JSONB NOT NULL DEFAULT '[]'::jsonb,
  technologies      JSONB NOT NULL DEFAULT '[]'::jsonb,
  impact            JSONB,
  testimonial       JSONB,
  service_division  TEXT,
  featured          BOOLEAN NOT NULL DEFAULT false,
  status            TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  start_date        TEXT,
  completed_at      TEXT,
  url               TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at      TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
