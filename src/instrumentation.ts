/**
 * Server startup hook. Registers in-process optional integrations once per
 * application instance. KDO delivery is durable: handlers enqueue to Supabase
 * and a protected dispatcher delivers/retries independently.
 */
import { registerAutonomousPlatformEventHandlers } from '@/events/handlers/autonomous-platform.handler';
import { registerAdminNotificationHandlers } from '@/events/handlers/admin-notifications.handler';
import { registerKdoWebsiteEventHandler } from '@/events/handlers/kdo-website.handler';

export function register() {
  registerAutonomousPlatformEventHandlers();
  registerAdminNotificationHandlers();
  registerKdoWebsiteEventHandler();
}
