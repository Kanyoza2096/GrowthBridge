# Database Schema & Migrations

All migrations live under `supabase/migrations/`:
1. `001_extensions.sql` — PostgreSQL extensions (`uuid-ossp`, `pg_trgm`, `unaccent`).
2. `002_profiles_roles.sql` — Profiles linked to Supabase Auth `auth.users`.
3. `003_services.sql` — Services catalog.
4. `004_projects.sql` — Projects and showcase portfolio.
5. `005_blog.sql` — Blog posts and metadata.
6. `006_people.sql` — Team members, advisors, alumni, board.
7. `007_testimonials.sql` — Client and partner reviews.
8. `008_talent.sql` — Talent profiles and applications.
9. `009_content.sql` — FAQs and Announcements.
10. `010_partners.sql` — Partners registry.
11. `011_media.sql` — Media assets and folders.
12. `012_settings.sql` — Site configurations and feature toggles.
13. `013_impact_stats.sql` — Key performance and impact metrics.
14. `014_contact_submissions.sql` — Form submissions.
15. `015_audit_logs.sql` — Administrative audit trail.
16. `016_rls.sql` — Row Level Security policies.
17. `017_functions.sql` — Database utility triggers.
18. `018_indexes.sql` — Search and performance indexes.
