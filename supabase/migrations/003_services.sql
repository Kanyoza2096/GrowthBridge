-- supabase/migrations/003_services.sql
-- Services table matching Service domain model

CREATE TABLE IF NOT EXISTS services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  division        TEXT NOT NULL,
  tagline         TEXT,
  description     TEXT NOT NULL,
  icon            TEXT,
  color           TEXT,
  features        JSONB NOT NULL DEFAULT '[]'::jsonb,
  benefits        JSONB NOT NULL DEFAULT '[]'::jsonb,
  process         JSONB NOT NULL DEFAULT '[]'::jsonb,
  image           TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title       TEXT,
  seo_description TEXT,
  seo_keywords    JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at    TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
