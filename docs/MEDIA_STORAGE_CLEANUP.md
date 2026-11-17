# Media Storage Cleanup

GrowthBridge media deletion uses a transactional database outbox so a failed Supabase Storage request cannot leave the media row and object in an inconsistent state.

## Deployment order

1. Apply `supabase/migrations/030_media_storage_cleanup_outbox.sql` to the Supabase project.
2. Deploy the application containing the cleanup route.
3. Configure the same high-entropy secret in both places:
   - GrowthBridge server environment: `MEDIA_STORAGE_CLEANUP_SECRET`
   - GitHub Actions repository secret: `MEDIA_STORAGE_CLEANUP_SECRET`
4. Add the GitHub Actions repository variable `GROWTHBRIDGE_MEDIA_CLEANUP_URL`, set to the deployed HTTPS URL ending in `/api/cron/media-storage-cleanup`.
5. Enable the `GrowthBridge Media Storage Cleanup` workflow.

The workflow runs every ten minutes and can also be started manually. It skips safely when its URL or secret is not configured.

## Delivery behavior

- The database transaction deletes the media metadata and inserts a leased cleanup job together.
- The application attempts the object deletion immediately.
- If Storage deletion or job finalization fails, the lease expires and the scheduled worker retries the job.
- Jobs use lease tokens to prevent stale workers from finalizing work claimed by a newer worker.
- Retries use bounded exponential backoff and stop after ten attempts; exhausted jobs remain visible with status `failed` for operator investigation.
- The worker is service-role-only and requires a bearer secret. It only removes objects from the `media` bucket and only accepts the app's `uploads/<filename>` object path shape.

No production migration, secret, or workflow configuration is applied by this source change.
