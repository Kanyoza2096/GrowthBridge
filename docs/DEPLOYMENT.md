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

## Optional social feed integration

`SOCIAL_FEED_API_URL` is an optional server-side JSON feed endpoint. The public
social aggregator validates its response with Zod and applies a short timeout.
If the endpoint is unset, unavailable, or returns invalid data, the homepage
falls back to published public Growthbridge announcements rather than showing
synthetic social posts or fabricated engagement metrics.

The endpoint must return an array of objects matching the `SocialFeedItem`
shape used by `src/app/api/public/social-feed/route.ts`. Keep the URL server-side;
do not expose provider credentials to the browser.
