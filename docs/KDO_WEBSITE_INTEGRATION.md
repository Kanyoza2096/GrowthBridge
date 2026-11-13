# KDO Website Integration

GrowthBridge sends selected domain events to KDO through the canonical
Website Integration endpoint. KDO remains responsible for orchestration and
governed actions; GrowthBridge remains the source of truth for business data.

## Required server-only environment

- `KDO_WEBSITE_INTEGRATION_ID`: the integration ID registered in KDO.
- `KDO_WEBSITE_EVENTS_URL`: the full HTTPS endpoint,
  `https://<kdo-host>/api/v1/website-integrations/<integration-id>/events`.
- `KDO_WEBSITE_INTEGRATION_TOKEN`: a KDO workspace API token authorized as a
  workspace operator. This credential is used only by GrowthBridge to send
  inbound events to KDO.
- `KDO_WEBSITE_DISPATCH_SECRET`: a separate high-entropy secret used to
  protect the GrowthBridge dispatch endpoint.

Never reuse the website API token stored in KDO for the reverse
KDO-to-GrowthBridge WebsiteConnector direction. Do not expose any of these
values through `NEXT_PUBLIC_*` variables.

## Delivery

When configured, the event handler attempts to enqueue domain events in
`kdo_website_event_outbox` and the publisher awaits handler completion before
returning. The core business operation remains available if enqueueing fails;
such failures are logged and require operational monitoring. A Postgres claim function leases rows with
`FOR UPDATE SKIP LOCKED`, allowing concurrent dispatch invocations without
double-claiming active rows. The dispatcher sends the canonical KDO event
envelope and retries transient failures with capped exponential backoff.
KDO's event ledger provides a second idempotency boundary using the stable
event ID. Permanent 4xx responses and events exceeding ten attempts are
marked failed for operator review.

Invoke `POST /api/kdo/events/dispatch` with
`Authorization: Bearer <KDO_WEBSITE_DISPATCH_SECRET>` from a trusted scheduler.
This PR does not configure a scheduler or deploy the application.

## Data minimization and safety

The outbound payload includes a resource identifier and type. Blog events may
also include bounded public title, slug, excerpt, and publication timestamp.
Contact, application, and partnership personal data is never forwarded.
Events are accepted only when their type is enabled on the KDO integration.
The KDO token must belong to the intended workspace and have workspace
operator authority.

Apply migration `026_kdo_website_event_outbox.sql` before enabling the
environment variables. No production registration, credentials, migration,
or deployment is performed by this code change.

## KDO -> GrowthBridge publishing

The reverse WebsiteConnector path is `POST /api/kdo/content`. Configure these
server-only GrowthBridge environment variables:

- `KDO_WEBSITE_CONNECTOR_TOKEN`: bearer token configured on the KDO Website
  Integration's canonical website account. This is not the token GrowthBridge
  uses to call KDO.
- `KDO_WEBSITE_CONNECTOR_WORKSPACE_ID`: the exact KDO workspace ID permitted
  to publish to this GrowthBridge instance.

The endpoint accepts title, content, optional slug, image_url, status
(`publish` or `draft`), and workspace_id. It validates the workspace against
the server-side allowlist, requires a bearer credential, limits request size,
and requires an Idempotency-Key. A Postgres function creates the blog post and
stores the idempotent response in one transaction. Reusing a key with the same
payload returns the original result; reusing it with a different payload is a
conflict. Only the service role can execute the function or read the ledger.

Apply migration `027_kdo_content_idempotency.sql` before enabling the endpoint.
KDO registration now defaults its `publish_status` to `draft`. The KDO
registration must explicitly include the `PUBLISH_ARTICLE` capability and set
`publish_status: "publish"` before public publishing is enabled. The KDO service
rejects a publish mode that is not covered by the registered capability.
This code does not set credentials or change KDO connector configuration.

## Scheduled event dispatch

The repository includes `.github/workflows/kdo-website-outbox.yml`, which
dispatches a small batch every five minutes after the workflow is merged to the
default branch. Configure these GitHub repository settings before enabling it:

- Repository variable `GROWTHBRIDGE_KDO_DISPATCH_URL`: the deployed HTTPS URL
  ending in `/api/kdo/events/dispatch`.
- Repository secret `KDO_WEBSITE_DISPATCH_SECRET`: the same high-entropy value
  configured as the GrowthBridge server environment variable.

The workflow skips safely when either setting is absent and can also be run
manually through GitHub Actions. It does not contain credentials in source.

## KDO automation rule names

KDO emits inbound events onto its Unified Event Bus using the exact name
`website.integration.<event_type>`. For example, GrowthBridge's
`blog.published` event becomes
`website.integration.blog.published`. Configure KDO Business Automation rules
against those exact names in the registered workspace. Registration and event
delivery do not create or auto-approve automation rules; the existing
workspace-scoped Business Automation engine and governed execution router
remain responsible for admission. The Director does not directly generate or
publish GrowthBridge content.
