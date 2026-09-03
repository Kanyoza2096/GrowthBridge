# Security & Hardening Guide

## Security Controls

1. **Row Level Security (RLS)**  
   Enforced directly at PostgreSQL level. Unauthenticated users cannot read non-public tables or execute mutations. Admin policies use the granular `has_admin_permission(resource, action)` helper; public policies are limited to intentionally public content.

2. **Server-Only Secrets**  
   `SUPABASE_SERVICE_ROLE_KEY` and `AUTONOMOUS_PLATFORM_API_KEY` must never be prefixed with `NEXT_PUBLIC_` and should be loaded only on the server.

3. **CSRF Protection**  
   All mutating admin routes require an `X-CSRF-Token` header that matches the `gb_csrf_token` HttpOnly cookie.

4. **Rate Limiting**  
   - Global API limit (`RATE_LIMIT_REQUESTS_PER_MINUTE`, default 60).  
   - Stricter limit on public form endpoints (`RATE_LIMIT_FORM_REQUESTS_PER_MINUTE`, default 10).  
   - Very strict limit on admin login (`RATE_LIMIT_ADMIN_LOGIN_PER_IP`, default 5).  
   - Implementation lives in `src/lib/security/rate-limit.ts`.  
   - **Production requirement**: Replace the in-memory store with a distributed backend (Upstash Redis, Redis, Cloudflare Rate Limiting, etc.) before scaling beyond a single instance.

5. **Hardened HTTP Headers**  
   CSP, HSTS (2 years + preload), X-Frame-Options DENY, Permissions-Policy, X-Content-Type-Options nosniff, COOP, CORP, Origin-Agent-Cluster.

6. **Input Sanitization & Validation**  
   - Public form endpoints (`/api/contact`, `/api/apply`, `/api/partner`) use Zod schemas from `src/lib/security/validate.ts`.  
   - All user-controlled strings are passed through `sanitizePlainText` before persistence.  
   - Admin routes should continue to validate with the same schemas or equivalent.

7. **Authentication**  
   Supabase Auth with cookie-based SSR sessions. Admin pages and `/api/admin/data/*` require a valid session. Login attempts are rate-limited per IP.

## Soft-delete & Data Retention

Most domain tables use `deleted_at` for soft deletes.  
Recommended operational practice:

- Keep soft-deleted rows for 90–180 days for audit / recovery.
- Add a scheduled job (Supabase cron, Render cron, or external worker) that hard-deletes rows older than the retention window after writing an audit log entry.
- Never hard-delete without an audit trail entry.

## Production Checklist

- [ ] All secrets set in the hosting platform secret store (never in the repo).
- [ ] `NODE_ENV=production`.
- [ ] Distributed rate limiter configured (or single long-lived instance documented).
- [ ] HTTPS only + HSTS verified.
- [ ] CSP does not contain unnecessary `unsafe-inline` in production if possible.
- [ ] Supabase RLS policies re-tested after any schema change.
- [ ] Admin login rate-limit and form rate-limits verified under load.
- [ ] CSRF tokens are required and rejected when missing/mismatched.
- [ ] Soft-delete retention job scheduled.
- [ ] No secrets appear in client bundles or public logs.

## Distributed Rate Limiting

Set both environment variables to activate Upstash:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

If unset, the in-memory store is used (single instance only).

## Soft-delete purge

Apply migration `020_production_hardening.sql` (which hardens the purge function), then either:

- Call `SELECT * FROM purge_soft_deleted(180);` on a schedule, or
- `POST /api/admin/purge` with body `{ "retentionDays": 180 }` as super_admin
  (CSRF + session required).


## Authorization boundary

The browser never receives the Supabase service-role key. Admin API routes authenticate the Supabase session and authorize every resource/action using centralized RBAC before calling privileged repositories. Database RLS independently enforces the same role boundaries for authenticated direct access. New profiles are inactive by default, and signup metadata cannot select an admin role.
