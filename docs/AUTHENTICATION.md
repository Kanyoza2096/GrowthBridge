# Authentication & Authorization (RBAC)

## Authentication Architecture
- **Provider**: Supabase Auth (Email & Password, with OAuth capabilities).
- **Session Management**: Cookie-based SSR sessions via `@supabase/ssr`.
- **Route Guarding**: Next.js `middleware.ts` cryptographically validates user sessions.

## Role-Based Access Control (RBAC)
Roles defined in `user_role` enum:
- `growthbridge_super_admin` — Full permissions across all resources.
- `growthbridge_admin` — Full management except destructive settings.
- `growthbridge_content_manager` — CMS management (blog, services, media, announcements).
- `growthbridge_project_manager` — Portfolio and client management.
- `growthbridge_recruiter` — Talent pool and applicant workflows.
- `growthbridge_analyst` — Read-only analytics and metrics.
