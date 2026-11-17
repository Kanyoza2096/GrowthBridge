# Deployment Guide (Render + Supabase)

## Render Deployment Setup
1. **Repository**: Connect your GitHub repository to Render as a **Web Service**.
2. **Runtime**: Node.
3. **Build Command**: `npm ci && npm run build`
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


## Scheduled operations and recovery workers

GrowthBridge uses GitHub Actions as a lightweight scheduler for two authenticated
server-side workers. These workflows are deliberately separate from the web
request lifecycle so a temporary worker outage does not block normal site use.

### Media Storage cleanup

After an admin deletes media, the database transaction removes the media metadata
and writes a durable cleanup job to `media_storage_cleanup_outbox`. The application
attempts the Storage deletion immediately; the scheduled worker retries jobs that
remain pending or whose lease expires.

Configure these GitHub repository settings:

- Repository variable `GROWTHBRIDGE_MEDIA_CLEANUP_URL`: the full HTTPS URL
  `https://<production-host>/api/cron/media-storage-cleanup`.
- Repository secret `MEDIA_STORAGE_CLEANUP_SECRET`: a high-entropy random secret.
  Set the identical value in the deployed application's `MEDIA_STORAGE_CLEANUP_SECRET`
  environment variable.

The `.github/workflows/media-storage-cleanup.yml` workflow runs every 10 minutes
and can also be started manually from GitHub Actions. It processes a bounded batch
of jobs and uses lease tokens to prevent an expired worker from finalizing a newer
worker's claim.

### KDO website event outbox

Configure these independently if the optional KDO integration is enabled:

- Repository variable `GROWTHBRIDGE_KDO_DISPATCH_URL`: the full HTTPS URL for
  the authenticated KDO event dispatch endpoint.
- Repository secret `KDO_WEBSITE_DISPATCH_SECRET`: the same high-entropy secret
  configured on the receiving application.

The `.github/workflows/kdo-website-outbox.yml` workflow runs every 5 minutes
and supports manual dispatch. The receiver must validate the bearer secret and
the outbox uses lease fencing for safe retries.

### Important operational verification

Both workflows intentionally exit successfully with a clear "not configured"
message when their URL or secret is missing. A green workflow run therefore does
**not** prove that jobs are being processed. After configuring the variables and
secrets:

1. Run each workflow manually from **Actions**.
2. Confirm the worker endpoint returns HTTP 200 and a bounded result summary.
3. Confirm a disposable test job is delivered and its outbox row reaches
   `delivered`.
4. Alert on repeated workflow failures, rising pending-job age, expired leases,
   or jobs entering `failed`.
5. Keep the service-role key and worker secrets out of client-side variables and
   application logs.

Apply the media cleanup migration before enabling the media worker. For a
disposable Supabase test database, run
`supabase/tests/media-storage-cleanup.sql` after migrations to verify atomic
metadata deletion, lease rotation, and stale-worker fencing. Run
`supabase/tests/outbox-lease-fencing.sql` on a separate disposable database
for the KDO website event outbox.

## SEO, sitemap, and PWA verification

The sitemap is generated dynamically at request time from the canonical
`NEXT_PUBLIC_SITE_URL` and published database records. After deployment:

- Open `/sitemap.xml` and confirm all URLs use the canonical production host.
- Publish a test public record, then request the sitemap again and confirm its
  public detail URL appears; unpublish it and confirm it disappears.
- Confirm `/robots.txt` references the same canonical sitemap URL.

The public app manifest is served at `/manifest.webmanifest`. Confirm its name,
start URL, scope, display mode, and icon URLs are correct. The production-only
service worker provides a public offline fallback and static-asset caching; it
must never cache admin pages, API responses, authentication routes, or private
Supabase traffic. Test installability and offline navigation in a real browser
on the deployed HTTPS domain. Do not treat a successful build as proof of browser
installability or live offline behavior.
