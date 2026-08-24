-- supabase/migrations/007_testimonials.sql
-- Testimonials table

CREATE TABLE IF NOT EXISTS testimonials (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote               TEXT NOT NULL,
  author_name         TEXT NOT NULL,
  author_role         TEXT,
  author_organization TEXT,
  author_avatar       TEXT,
  rating              INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,
  service_id          UUID REFERENCES services(id) ON DELETE SET NULL,
  featured            BOOLEAN NOT NULL DEFAULT false,
  status              TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
