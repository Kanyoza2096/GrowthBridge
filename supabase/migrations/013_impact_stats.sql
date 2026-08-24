-- supabase/migrations/013_impact_stats.sql
-- Impact stats single-row or aggregate table

CREATE TABLE IF NOT EXISTS impact_stats (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projects_completed  INTEGER NOT NULL DEFAULT 48,
  youth_empowered     INTEGER NOT NULL DEFAULT 1250,
  communities_served  INTEGER NOT NULL DEFAULT 35,
  client_satisfaction INTEGER NOT NULL DEFAULT 98,
  active_members      INTEGER NOT NULL DEFAULT 120,
  events_hosted       INTEGER NOT NULL DEFAULT 24,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default impact stats row
INSERT INTO impact_stats (id, projects_completed, youth_empowered, communities_served, client_satisfaction, active_members, events_hosted)
VALUES ('00000000-0000-0000-0000-000000000001', 48, 1250, 35, 98, 120, 24)
ON CONFLICT (id) DO NOTHING;
