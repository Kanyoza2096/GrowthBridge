# Security & Hardening Guide

## Security Controls
1. **Row Level Security (RLS)**: Enforced directly at PostgreSQL level. Unauthenticated users cannot read non-public tables or execute mutations.
2. **Server-Only Secrets**: `SUPABASE_SERVICE_ROLE_KEY` and `AUTONOMOUS_PLATFORM_API_KEY` are protected by `import 'server-only'`.
3. **CSRF Protection**: All mutating admin routes require `X-CSRF-Token` headers matched against secure cookies.
4. **Rate Limiting**: Sliding window rate-limiting at `middleware.ts` for all API endpoints and login attempts.
5. **Hardened HTTP Headers**: CSP, HSTS, X-Frame-Options (DENY), Permissions-Policy, X-Content-Type-Options (nosniff).
6. **Input Sanitization & Validation**: Zod schema validation across all form inputs and endpoints.
