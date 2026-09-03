-- supabase/migrations/014_contact_submissions.sql
-- Form submissions tables

CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'partnership', 'talent')),
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived', 'replied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partnership_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  contact_person    TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  partnership_type  TEXT NOT NULL DEFAULT 'other',
  message           TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'approved', 'declined')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
