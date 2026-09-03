# GrowthBridge production runbook

## 1. Architecture

GrowthBridge uses a single authoritative backend:

- Next.js application and server-side admin API
- Supabase Auth for sessions
- Supabase PostgreSQL for application data and RLS
- Supabase Storage for media assets
- Upstash Redis (recommended) for distributed rate limiting

The browser must never receive `SUPABASE_SERVICE_ROLE_KEY` or any other server secret.

## 2. Required environment

Public:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_CONTACT_EMAIL`

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`

Recommended for multi-instance production:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional:

- SMTP variables from `.env.example`
- `AUTONOMOUS_PLATFORM_URL` and `AUTONOMOUS_PLATFORM_API_KEY` only if the autonomous platform integration is actually enabled

Do not configure obsolete Kanyoza admin API variables such as `MASTER_API_TOKEN`, `NEXT_PUBLIC_ADMIN_API_BASE_PATH`, or `NEXT_PUBLIC_BACKEND_PROVIDER`.

## 3. Database deployment

Apply all Supabase migrations, including `020_production_hardening.sql`.

The hardening migration:

- prevents signup metadata from selecting privileged roles
- starts newly-created profiles inactive
- prevents users from updating their own role
- enforces granular admin RLS
- removes public access to private profile/settings/application data
- exposes only safe fields through `public_people`
- restricts privileged database functions to `service_role`
- configures the media Storage bucket

Existing profiles are marked active by the migration. Review the resulting user list before opening the admin portal publicly.

## 4. Admin access

Admin API authorization is enforced server-side using resource + action permissions. UI permissions are not a security boundary.

Provision users explicitly and deactivate accounts that should no longer have access. Do not rely on arbitrary Supabase signup metadata for admin roles.

## 5. Media

Uploads are limited to 10 MB and validated by MIME type and file signature. Allowed types are JPEG, PNG, WebP, GIF, and PDF. SVG uploads are intentionally disabled until a dedicated SVG sanitization pipeline is added.

Media files are stored in the Supabase `media` bucket and the database record is written only after the Storage upload succeeds.

## 6. Rate limiting and CSRF

The middleware applies:

- global API rate limiting
- stricter public-form limits
- stricter admin-login limits
- CSRF validation on mutating admin endpoints

Use a distributed Redis limiter for multi-instance production. An emergency in-process login limiter remains active if Redis becomes unavailable.

## 7. Build and verification

Use a committed lockfile and deterministic CI:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

The current repository does not include a lockfile because dependency installation is environment-dependent; generate and commit `package-lock.json` in a network-enabled development/CI environment before the first production release.

## 8. Deployment target

This application contains Next.js server routes, middleware, server-side Supabase clients, and privileged API operations. Deploy it to a runtime that supports the full Next.js server application.

Do not use a static-only Pages deployment configuration for the full application unless a supported Next.js server adapter is explicitly configured and tested.

## 9. Final smoke test

Verify:

1. Public pages load real Supabase content.
2. `/admin/login` rejects invalid credentials and throttles repeated attempts.
3. An inactive/new Supabase account cannot enter the admin application.
4. A content manager can edit content but cannot modify services/projects.
5. A project manager cannot modify partners/settings.
6. A recruiter cannot access applications outside their permission set.
7. Normal users cannot update their profile role through Supabase.
8. Anonymous clients cannot read `profiles`, `site_settings`, `applications`, `talent_profiles`, or audit logs.
9. Public people data does not contain email/phone fields.
10. Media upload stores a real object and database metadata.
11. Media deletion removes both Storage and database records.
12. Every admin mutation creates a server-generated audit record.
13. Logout invalidates the Supabase session and CSRF token.
14. Production logs contain no passwords, tokens, or service-role keys.

## Final production gate

Before deployment, run in a network-enabled CI/production build environment:

```bash
npm install
npm ci
npm run security:check
npm run production:check
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Commit the generated `package-lock.json` and use `npm ci` for reproducible builds. The current repository intentionally does not fabricate a lockfile when registry access is unavailable.
