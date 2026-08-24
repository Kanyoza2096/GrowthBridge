-- supabase/migrations/005_blog.sql
-- Blog posts table matching BlogPost domain model

CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  content      TEXT NOT NULL,
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name  TEXT NOT NULL DEFAULT 'GrowthBridge Team',
  cover_image  TEXT,
  tags         JSONB NOT NULL DEFAULT '[]'::jsonb,
  category     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  read_time    INTEGER DEFAULT 5,
  featured     BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
