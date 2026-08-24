-- supabase/migrations/008_talent.sql
-- Talent profiles and Applications table

CREATE TABLE IF NOT EXISTS talent_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  bio                 TEXT,
  avatar              TEXT,
  skills              JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience          INTEGER DEFAULT 0,
  experience_level    TEXT DEFAULT 'mid',
  portfolio           TEXT,
  resume_url          TEXT,
  availability        TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'interviewing', 'hired', 'unavailable')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
  categories          JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER talent_profiles_updated_at
  BEFORE UPDATE ON talent_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS applications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type           TEXT NOT NULL DEFAULT 'talent' CHECK (type IN ('talent', 'partnership', 'client', 'volunteer')),
  applicant_name TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  subject        TEXT,
  message        TEXT,
  role           TEXT,
  skills         JSONB NOT NULL DEFAULT '[]'::jsonb,
  portfolio      TEXT,
  status         TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected', 'completed')),
  assignee_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes          JSONB NOT NULL DEFAULT '[]'::jsonb,
  history        JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
