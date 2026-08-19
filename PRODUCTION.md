# GrowthBridge production runbook

## 1. Backend contract

The admin server-side proxy expects the Kanyoza backend to expose:

- `POST /api/v1/growthbridge/admin/verify-password`
- CRUD resources under `/api/v1/growthbridge/admin/{resource}`
- item operations under `/api/v1/growthbridge/admin/{resource}/{id}`
- `POST /api/v1/growthbridge/admin/media` for multipart uploads

Set `NEXT_PUBLIC_ADMIN_API_BASE_PATH` if the backend uses a different admin prefix. Do not expose `MASTER_API_TOKEN` to the browser.

## 2. Required secrets

Set these in the hosting platform's server-side secret store:

- `ADMIN_SESSION_SECRET` — random, at least 64 characters
- `ADMIN_HASH_PEPPER` — random, at least 32 characters
- `MASTER_API_TOKEN` — server-to-server backend token

Optional SMTP variables are documented in `.env.example`.

## 3. Public variables

Set:

- `NEXT_PUBLIC_SITE_URL=https://growthbridge.org`
- `NEXT_PUBLIC_API_URL=https://api.growthbridge.org`
- `NEXT_PUBLIC_BACKEND_PROVIDER=kanyoza`
- `NEXT_PUBLIC_USE_MOCK_DATA=false`
- `NEXT_PUBLIC_ADMIN_API_BASE_PATH=/api/v1/growthbridge/admin`

## 4. Security requirements

- Never set `NEXT_PUBLIC_*` on secrets.
- Keep `NEXT_PUBLIC_USE_MOCK_DATA=false` in production.
- Use HTTPS only.
- Configure the backend to accept requests from the production origin.
- Rotate `MASTER_API_TOKEN` if it is ever exposed.
- Use a distributed rate limiter at the edge/backend for multi-instance production deployments.

## 5. Build

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

The environment must be present during the production build. The repository intentionally does not contain secrets. After the first dependency install, commit the generated `package-lock.json` and switch CI to `npm ci` for deterministic builds.

## 6. Cloudflare Pages

The repository retains `wrangler.toml` for Cloudflare Pages. Configure server secrets using the platform secret mechanism; do not put them in the committed TOML file.

If the selected Cloudflare runtime cannot support the configured Next.js server runtime, deploy the same application to a Node-compatible Next.js host (for example, Vercel or a Node container) rather than weakening authentication.

## 7. Final smoke test

After deployment, verify:

1. `/` loads without mock content.
2. `/services`, `/projects`, `/blog`, and `/team` return backend data.
3. `/admin/login` rejects invalid credentials.
4. Successful login creates an HttpOnly session.
5. `/api/admin/session` reports the authenticated user.
6. Admin CRUD writes reach the backend and survive a page refresh.
7. Media upload stores a real file and returns a usable URL.
8. Logout invalidates the session.
9. `/robots.txt` and `/sitemap.xml` use the canonical production domain.
10. Production logs contain no secrets or passwords.
