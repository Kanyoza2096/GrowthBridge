-- supabase/migrations/010_partners.sql
-- Partners table

CREATE TABLE IF NOT EXISTS partners (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name      TEXT NOT NULL,
  contact_person         TEXT NOT NULL,
  email                  TEXT NOT NULL,
  phone                  TEXT,
  website                TEXT,
  logo                   TEXT,
  industry               TEXT,
  description            TEXT,
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('prospect', 'active', 'inactive', 'terminated')),
  partnership_type       TEXT NOT NULL DEFAULT 'collaborator' CHECK (partnership_type IN ('sponsor', 'client', 'collaborator', 'vendor')),
  partnership_start_date TEXT,
  partnership_end_date   TEXT,
  address                TEXT,
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
