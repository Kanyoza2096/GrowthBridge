# Growthbridge Production QA — v12

## Scope
Final static QA and resilience hardening across public and admin surfaces.

## Completed in v12
- Added IP-based form throttling to public contact, partnership, and talent application endpoints.
- Added HTTP 429 responses with `Retry-After` and rate-limit headers.
- Preserved the existing distributed Upstash limiter with in-memory fallback behavior.
- Removed the global error screen's unsupported claim that engineering is automatically notified.
- Removed a non-deterministic generated error reference when no digest exists.
- Reworked the route loading skeleton to use a restrained shimmer with reduced-motion support.
- Re-ran contrast, security-migration, and production-readiness checks.

## Deliberately not claimed
A full `typecheck`, lint, Vitest, Playwright, or Next production build requires the project's installed dependency tree. The release environment used for this audit does not contain `node_modules`, so those checks are not represented as passing.

## Deployment gates
Before production deployment:
1. Run `npm install` and commit the generated `package-lock.json`.
2. Run `npm run validate` in CI.
3. Configure Upstash Redis for multi-instance/serverless rate limiting.
4. Verify Supabase migrations against a staging project.
5. Execute Playwright against the deployed staging URL, including admin auth and public form flows.
6. Confirm storage buckets and policies for public media versus private talent documents.
7. Configure external error monitoring if operational alerting is required; the application does not claim to provide this automatically.
