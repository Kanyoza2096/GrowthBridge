# GrowthBridge

Production-oriented Growthbridge Virtual Organization web platform and management console.

## Stack

- Next.js 15.5.x
- React 19
- TypeScript
- Tailwind CSS
- TanStack React Query
- Iron Session
- Zod
- Kanyoza backend API
- Cloudflare Pages configuration included

## Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Public pages can run without backend credentials. Admin authentication and admin CRUD require the Kanyoza backend and server secrets.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

## Production

Read [PRODUCTION.md](./PRODUCTION.md) before deploying. In particular, `MASTER_API_TOKEN`, `ADMIN_SESSION_SECRET`, and `ADMIN_HASH_PEPPER` are server-only secrets and must never be committed or exposed through `NEXT_PUBLIC_*` variables.

Mock data is disabled by default and must remain disabled in production.
