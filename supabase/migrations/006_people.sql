-- supabase/migrations/006_people.sql
-- People & Team members table

CREATE TABLE IF NOT EXISTS people (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug           TEXT NOT NULL UNIQUE,
  category       TEXT NOT NULL DEFAULT 'team' CHECK (category IN ('team', 'advisor', 'board', 'alumni', 'partner_rep', 'contributor')),
  full_name      TEXT NOT NULL,
  title          TEXT NOT NULL,
  department     TEXT,
  bio            TEXT NOT NULL DEFAULT '',
  short_bio      TEXT,
  photo          TEXT,
  email          TEXT,
  phone          TEXT,
  location       TEXT,
  joined_at      TEXT,
  skills         JSONB NOT NULL DEFAULT '[]'::jsonb,
  certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  social_links   JSONB NOT NULL DEFAULT '{}'::jsonb,
  projects       JSONB NOT NULL DEFAULT '[]'::jsonb,
  articles       JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order  INTEGER NOT NULL DEFAULT 999,
  featured       BOOLEAN NOT NULL DEFAULT false,
  active         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);

CREATE TRIGGER people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
