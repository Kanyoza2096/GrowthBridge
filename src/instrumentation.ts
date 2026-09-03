/**
 * Server startup hook. Registers in-process optional integrations once per
 * application instance. Durable workflows should eventually move to an
 * outbox/queue worker; this hook only wires the graceful, best-effort bridge.
 */
import { registerAutonomousPlatformEventHandlers } from '@/events/handlers/autonomous-platform.handler';
import { registerAdminNotificationHandlers } from '@/events/handlers/admin-notifications.handler';

export function register() {
  registerAutonomousPlatformEventHandlers();
  registerAdminNotificationHandlers();
}
