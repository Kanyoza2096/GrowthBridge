# Deployment Guide (Render + Supabase)

## Render Deployment Setup
1. **Repository**: Connect your GitHub repository to Render as a **Web Service**.
2. **Runtime**: Node.
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm run start`

## Environment Variables on Render
Set the following environment variables in Render's dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTONOMOUS_PLATFORM_URL` (optional)
- `AUTONOMOUS_PLATFORM_API_KEY` (optional)
