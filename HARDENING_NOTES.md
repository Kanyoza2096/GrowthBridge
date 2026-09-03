# GrowthBridge Hardening & Improvements

## Round 1 — Core security
- Extracted rate limiting into `src/lib/security/rate-limit.ts`
- Stricter limits on public forms + admin login
- Wired Zod schemas + sanitization into `/api/contact`, `/api/apply`, `/api/partner`
- Expanded `.env.example` with production secrets
- Expanded `docs/SECURITY.md`

## Round 2 — Remaining improvements

### Distributed rate limiting (Upstash)
- When `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set, the middleware
  uses Upstash Redis (REST) for fixed-window counters.
- Otherwise falls back to the in-memory store (local / single instance).
- Fail-open on Redis outage so the site stays available (logged).
- No extra npm dependency — uses native `fetch`.

### Soft-delete purge
- Migration `supabase/migrations/019_soft_delete_purge.sql` adds
  `purge_soft_deleted(retention_days DEFAULT 180)`.
- Admin API `POST /api/admin/purge` (super_admin only) to run it manually.
- Schedule via Supabase cron / Render cron for production.

### Admin UI modularization
- Extracted `ApplicationCard` + `StatusSelect` from the large applications page
  into `src/components/admin/ApplicationCard.tsx`.
- Applications page reduced from ~620 lines to ~235 lines.

### Unit tests (Vitest)
- `src/__tests__/rate-limit.test.ts`
- `src/__tests__/validate.test.ts`
- `src/__tests__/rbac.test.ts`
- `src/__tests__/sanitize.test.ts`

Run: `npm test`

## How to enable Upstash in production
1. Create a Redis database at upstash.com
2. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your host secrets
3. Redeploy — no code change required

## Soft-delete schedule example (Supabase)
```sql
-- After enabling pg_cron
SELECT cron.schedule(
  'purge-soft-deleted-weekly',
  '0 3 * * 0',  -- Sundays 03:00 UTC
  $$SELECT * FROM purge_soft_deleted(180)$$
);
```

## Round 3 — Production security remediation

### Critical authorization fixes
- Signup metadata can no longer choose a profile role; new profiles start as `growthbridge_analyst` and inactive.
- Added `profiles.is_active`; existing profiles are activated during migration and new accounts require explicit activation.
- Removed self-service profile updates, including role changes.
- Replaced broad admin RLS with granular `has_admin_permission(resource, action)` policies.
- Removed public access to profiles, settings, applications, talent, audit logs, media metadata, and other private admin tables.
- Added a safe `public_people` view that excludes email/phone from the public directory.
- Restricted `soft_delete_record()` and `purge_soft_deleted()` to `service_role` and hardened the purge retention bounds.

### Admin API fixes
- Centralized resource/action authorization in `src/lib/auth/admin-authorization.ts`.
- Content/project/recruiter permissions now distinguish read from create/update/delete.
- Removed client-authored audit log creation; mutations generate server-side audit records.
- Added JSON request size/depth/array limits and resource payload validation.
- Fixed settings deep-merge behavior and records `updated_by`.
- Fixed repository updates so empty strings/arrays can intentionally clear fields.
- Repository read/delete errors now surface instead of silently becoming empty data or success=false responses.

### Media/storage fixes
- Admin media uploads now write the actual file to Supabase Storage.
- Added 10 MB limit, MIME/signature validation, safe generated filenames, folder resolution, and uploader tracking.
- Media deletion removes the Storage object before deleting its database metadata.
- Configured the `media` Storage bucket and service-role-only writes.

### Client/server boundary fixes
- Replaced the browser `apiClient` implementation so client bundles no longer import server repositories/service-role code.
- Admin settings now uses the admin API rather than importing server providers into a client component.
- Fixed the BackendUnavailable `apiUrl`/`supabaseUrl` mismatch.
- Added public-safe people/member data mapping.

### Reliability/deployment fixes
- Removed fabricated production dashboard/impact metrics.
- Added CI workflow covering install, typecheck, lint, tests, and build.
- Removed the stale static Cloudflare Pages `wrangler.toml` configuration.
- Updated Next.js from 15.5.2 to 15.5.21 to receive current 15.x security patches.
- Added production configuration validation for Supabase public connection settings.

## Verification status
- Static TypeScript parsing of the changed TypeScript files passes when external dependency-resolution errors are filtered out.
- Full `npm run typecheck` / build could not be completed in this environment because `node_modules` is absent and registry access timed out; generate/commit `package-lock.json` in a network-enabled environment and run the complete CI pipeline before deployment.

## Round 2 — database/API boundary hardening

- Added `supabase/migrations/021_production_hardening_followup.sql`.
- Revoked direct Data API access to private/admin tables for `anon` and `authenticated`; public submissions now go through server-side validated APIs.
- Removed the unrestricted `applications` INSERT policy.
- Re-pinned all SECURITY DEFINER helpers to `search_path = ''` and schema-qualified references.
- Restricted dangerous functions to `service_role`.
- Added default privilege revocation for newly-created public functions.
- Tightened settings validation so arbitrary API keys/secrets cannot be introduced through the generic settings payload.
- Hardened the purge endpoint against `NaN`, strings, and out-of-range retention values.
- Removed detailed database error messages from the admin debug endpoint.
- Added `scripts/check-security-migrations.js` and included it in `npm run validate`.

### Verification

- Security migration static checks: PASS.
- JavaScript syntax check for the new security script: PASS.
- `package.json` parse: PASS.
- Full npm test/typecheck/build: NOT RUN because dependencies are not installed and npm dependency resolution timed out in this environment.

## Round 3 — security, abuse resistance, and dependency hardening

- Added bounded JSON request parsing for public forms and admin login.
- Removed duplicate form/login rate-limit consumption from route handlers; middleware remains the global IP limiter and login adds an account+IP limiter.
- Added `Cache-Control: no-store` to authentication responses.
- Public talent application responses no longer return stored applicant PII.
- Admin mutation schemas now strip unknown fields instead of passing arbitrary properties through.
- Restricted public media uploads to image formats because the media bucket is public; PDFs are no longer accepted.
- Added safe media metadata length limits.
- Added final SQL migration pinning SECURITY DEFINER functions to an empty search path and revoking remote execution of trigger/maintenance helpers.
- Prevented anonymous/authenticated enumeration of the public media Storage bucket.
- Added regression tests for RBAC and arbitrary admin-field injection.
- Updated Next.js to 15.5.24 and React/React DOM to 19.2.7. Next.js 15.5.24 is the current 15.x Maintenance LTS security patch as of August 25, 2026. React's current 19.2 line also avoids the older React Server Components vulnerabilities documented by the React team.

Validation remains dependency-limited in this environment because npm package installation times out. The source was checked with the globally available TypeScript parser/compiler; remaining compiler output is dominated by unavailable project dependencies/types rather than a completed dependency-backed build.

## Final verification pass — 2026-08-30

- React/react-dom pinned to 19.2.8 (React Server Functions DoS fix).
- Next.js pinned to 15.5.24 (August 2026 security release / Maintenance LTS).
- Added migration 023 for explicit client table privilege cleanup and removal of persisted API-key material from general settings.
- Fixed admin People Directory navigation permission mapping.
- Fixed admin login oversized-body response to return HTTP 413.
- Settings repository now strips API keys from admin responses and prevents them from being re-persisted through the general settings object.
- Added `npm run production:check` static production gate.
- `security:check` passes all 23 migrations.
- `production:check` passes; lockfile is still required before deployment.
- Full dependency-backed typecheck/lint/test/build remains blocked in this environment because npm registry access times out.

## Round 4 — Operational hardening (no Redis hard-dependency)

- Admin `/api/admin/debug` returns 404 in production (no config surface leakage).
- People repository gained explicit `getPublicAll` / `getPublicBySlug` that query the
  `public_people` view and strip email/phone. Public service methods default to these.
- Browser `mapPerson` also forces `email`/`phone` to `undefined` as defense-in-depth.
- Production readiness script emits a **strong warning** when Upstash is not configured,
  but never fails the build. Rate limiting continues to fail-open / fall back to
  in-memory when Redis is missing or unreachable — the site stays available.
- Login rate limit now also enforces a pure-IP ceiling (via the emergency in-memory
  store) to mitigate credential stuffing across many accounts from one IP.

## Round 5 — Build & CSP / regression hardening

- `next.config.ts`: TypeScript and ESLint errors now **fail production builds**
  (`ignoreDuringBuilds` / `ignoreBuildErrors` only in non-production). Also disables
  `X-Powered-By` and keeps compression on.
- CSP tightened in middleware and `public/_headers`:
  - `frame-src 'none'`
  - `worker-src 'self' blob:`
  - `manifest-src 'self'`
  - (script-src still allows `'unsafe-inline'` for Next.js compatibility; full nonce
    migration is a follow-up when the team is ready.)
- Expanded `supabase/tests/security-regression.sql`:
  - public_people must not expose email/phone columns
  - RLS enabled on all domain tables
  - no direct INSERT/UPDATE/DELETE for public content tables from anon/authenticated
- Expanded `src/__tests__/security-regressions.test.ts`:
  - asserts public people PII stripping
  - asserts debug endpoint production gate
  - asserts rate-limiter Redis graceful fallback
  - extra RBAC coverage for super-admin vs analyst
