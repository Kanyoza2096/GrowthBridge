import { eventPublisher } from '../publisher';
import { adminNotificationsRepository } from '@/repositories/admin-notifications.repository';

let registered = false;

export function registerAdminNotificationHandlers() {
  if (registered) return;
  registered = true;

  eventPublisher.subscribe('application.created', async (event: any) => {
    await adminNotificationsRepository.notifyAllActiveAdmins({
      type: 'application',
      title: 'New talent application',
      message: `${event.payload.name || 'A candidate'} submitted an application.`,
      link: '/admin/applications',
    });
  });
  eventPublisher.subscribe('contact.submitted', async (event: any) => {
    await adminNotificationsRepository.notifyAllActiveAdmins({
      type: 'contact',
      title: 'New contact inquiry',
      message: `${event.payload.name || 'A visitor'} sent a new message.`,
      link: '/admin/inquiries',
    });
  });
  eventPublisher.subscribe('partnership.requested', async (event: any) => {
    await adminNotificationsRepository.notifyAllActiveAdmins({
      type: 'partnership',
      title: 'New partnership request',
      message: `${event.payload.organizationName || 'An organization'} requested a partnership.`,
      link: '/admin/inquiries',
    });
  });
}
