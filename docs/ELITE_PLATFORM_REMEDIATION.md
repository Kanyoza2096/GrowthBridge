# GrowthBridge Elite Platform Remediation

Date: 2026-09-02

## Audit position

The current codebase has a strong modular-monolith foundation: Next.js App Router,
TypeScript, Supabase/PostgreSQL, RLS, application RBAC, server-only service-role
operations, security headers, CSRF protection, validation, audit logging, a media
boundary, and a semantic design-token system.

The repository was not rewritten. Changes in this pass are deliberately small and
reviewable, focused on P0/P1 correctness, trust, accessibility, and resilience.

## Findings ranked by impact

| Severity | Finding | Status |
|---|---|---|
| P0 | Public impact metrics were queried directly through a table protected by admin-only RLS | Fixed |
| P0 | Public site settings/partner feature flag read path conflicted with admin-only RLS | Fixed |
| P0 | Blog admin mutations bypassed `BlogService`, so domain events were not reliably emitted | Fixed |
| P0 | Blog publication event could fire on ordinary edits | Fixed |
| P0 | Autonomous event handlers existed but were not registered at server startup | Fixed |
| P1 | Homepage impact stats rendered permanent-looking zeroes when the service failed | Fixed |
| P1 | Public shell had a skip-link utility but no actual skip link | Fixed |
| P1 | Footer linked to `/terms` without a route | Fixed |
| P1 | Social feed contained synthetic posts and fabricated engagement counts | Fixed: configured feed only; empty state when unconfigured |
| P1 | Social/partner custom controls were below the 44px touch-target policy | Fixed |
| P1 | Semantic contrast-token automation already passes 40/40 checks in both themes | Verified |
| P1 | `@/*` already maps to `./src/*` | Verified |
| P1 | Public Supabase Storage image patterns already support Supabase CDN paths | Verified |
| P1 | Package lockfile is missing | Not fixed: dependency installation was unavailable in this environment |

## Important security clarification

The final RLS migrations do **not** revoke execution of
`public.has_admin_permission` from `authenticated`. The authenticated admin
repository reads therefore retain database-level RLS defense-in-depth. The
admin API also performs application-level RBAC before access. This pass does not
replace those reads with service-role access.

Service-role reads were introduced only where a server endpoint intentionally
projects a public-safe subset from a table whose direct Data API access is
admin-only (site settings and impact metrics).

## Phase 0 — Security and correctness

### Public impact metrics

Added `/api/public/impact-stats`.

The browser now calls this endpoint rather than directly querying
`impact_stats`. The endpoint uses a server-side privileged read and returns only
the approved aggregate metrics.

### Public settings

The existing public site-config and partner endpoints now obtain settings through
a server-side privileged read, while preserving the explicit safe projection.
API keys remain stripped.

### Autonomous integration

Added Next.js server startup registration via `src/instrumentation.ts` and made
registration idempotent.

This makes the existing best-effort in-process event integration live when the
application starts. It remains intentionally non-critical to the public site.

### Blog lifecycle

Admin blog create/update paths now use `BlogService`, ensuring domain events are
emitted consistently. Publication events are emitted only when a post transitions
from a non-published state to `published`.

## Phase 1 — Accessibility and UX

### Impact statistics

Loading uses a skeleton; service failure uses an honest unavailable state rather
than displaying misleading zeroes.

### Keyboard navigation

The public shell now includes a real `Skip to main content` link targeting the
main landmark.

### Touch targets

Social platform filters and partner view-mode controls meet the project's 44px
minimum touch target policy.

### Dead-end navigation

Added the `/terms` route because the public footer already exposed that journey.

## Social feed trust model

Synthetic social posts were removed. The endpoint now supports an optional,
server-configured public JSON feed validated with Zod and returns an honest empty state when no provider is configured.

The endpoint validates provider payloads and normalizes optional engagement counts to zero; it never invents
posts or impersonates a social platform.

## Phase 2 — Performance and SEO

### Server-rendered public detail pages

Blog, project, service, and team detail routes now fetch their public-safe record on the
server and pass it into the presentation component. This removes the previous initial
client-side data-fetch waterfall for those high-value indexed pages. The client components
remain isolated so the visual implementation can evolve without changing public URLs.

Each detail route also has dynamic `generateMetadata()` for title, description, canonical URL,
and Open Graph/Twitter metadata. React request memoization prevents duplicate slug reads
between metadata generation and page rendering within the same render.

### Dynamic sitemap

Replaced the build-time static sitemap file with `src/app/sitemap.ts`. It emits static public
routes plus current published blog posts, projects, services, and active people. If the content
database is temporarily unavailable, the sitemap safely falls back to static public routes.

### Image/media payload correctness

The social-feed schema now matches the application's `mediaUrl`/`mediaType` contract instead of
accepting an unused `imageUrl` field.


### Admin operations hardening

The admin inbox now aggregates the real `applications`, `contact_submissions`, and
`partnership_requests` sources instead of silently treating applications as the only
source of leads. Status updates are translated back to each source's native lifecycle.

Notifications now have a durable `admin_notifications` table with per-recipient RLS,
server-side creation, and working read/mark-all/clear operations. Domain events for new
applications, contact messages, and partnership requests fan out to active admin accounts.
This remains an in-process event delivery mechanism; a durable outbox/worker is still
recommended for guaranteed delivery across process restarts.

### CMS publication correctness

Services and projects now carry their persisted draft/published/archived status through the
domain type and repository mapping. New CMS records default to `draft`, while public reads
explicitly require `published`. Admin reads can request unpublished records. Blog status is
also preserved for the admin domain.

## Verification

Static checks executed successfully:

- `node scripts/check-contrast.js` — 40/40 pairs pass
- `node scripts/check-security-migrations.js` — pass, 24 migrations
- `node scripts/check-production-readiness.js` — pass

Full TypeScript/build/test execution could not complete because the uploaded
archive has no `node_modules` and dependency installation timed out. The global
TypeScript compiler was run and exposed dependency-resolution errors as expected;
there was also an existing syntax error in `theme-scope.test.ts`, which was fixed
in this pass.

A production environment with dependencies installed must still run:

```bash
npm install
npm run contrast:check
npm run security:check
npm run production:check
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

For reproducible deployment, generate and commit `package-lock.json` and switch CI
from `npm install` to `npm ci`.

## Dashboard analytics integrity

The admin dashboard now uses server-side aggregate queries for published services/projects and
real lead/application counts. Thirty-day change percentages compare the current 30-day window
with the immediately preceding 30-day window. Application trends are derived from real
application and partnership-request timestamps.

Visitor, service-engagement, and project-engagement charts remain explicitly unavailable until
a first-party analytics source is configured. The UI does not fabricate traffic or engagement
numbers. Dashboard timestamp filters are backed by dedicated database indexes in migration 025.

## Residual high-leverage work

1. Add durable outbox/queue processing for autonomous workflows and notification delivery.
2. Implement server-side pagination/search for admin collections.
3. Add integration tests against a real Supabase staging project, especially RLS.
4. Convert remaining public listing pages (home, blog, projects, services, team) to server-first data fetching where practical, retaining client interactivity only for filters/carousels.
5. Add server-side pagination/search for admin collections and dashboard aggregation instead of placeholder analytics.
6. Separate private talent documents from the public media bucket.
7. Add transactional audit diffs for high-risk mutations.
8. Add real social-provider adapters only when official API credentials/accounts are available; do not fabricate social data.
