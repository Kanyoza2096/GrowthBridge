import { createAdminClient } from '@/lib/supabase/server';
import { eventPublisher } from '@/events/publisher';
import type { DomainEvent, DomainEventType } from '@/events/event-types';

const eventTypes: DomainEventType[] = [
  'project.created','project.updated','project.deleted',
  'service.created','service.updated','blog.created','blog.published',
  'application.created','application.updated','contact.submitted',
  'partnership.requested','talent.profile.created','testimonial.created','settings.updated',
];

let registered = false;

export function buildKdoEventPayload(event: DomainEvent): Record<string, unknown> {
  const source = event.payload && typeof event.payload === 'object' ? event.payload as Record<string, unknown> : {};
  const resourceId = typeof source.id === 'string' || typeof source.id === 'number' ? String(source.id) : undefined;
  const payload: Record<string, unknown> = {
    source: 'growthbridge',
    resource_type: event.type.split('.')[0],
    ...(resourceId ? { resource_id: resourceId } : {}),
  };
  // Only public editorial metadata crosses the boundary; no contact/application PII.
  if (event.type.startsWith('blog.')) {
    for (const key of ['title', 'slug', 'excerpt', 'publishedAt']) {
      const value = source[key];
      if (typeof value === 'string' && value.length <= 2000) payload[key] = value;
    }
  }
  return payload;
}

export function registerKdoWebsiteEventHandler() {
  if (registered || !process.env.KDO_WEBSITE_INTEGRATION_ID?.trim()) return;
  registered = true;
  const integrationId = process.env.KDO_WEBSITE_INTEGRATION_ID.trim();
  const admin = createAdminClient();

  for (const eventType of eventTypes) {
    eventPublisher.subscribe(eventType, async (event) => {
      const { error } = await admin.from('kdo_website_event_outbox').insert({
        integration_id: integrationId,
        event_id: event.id,
        event_type: event.type,
        event_version: '1.0',
        occurred_at: event.timestamp,
        payload: buildKdoEventPayload(event),
      });
      if (error && error.code !== '23505') {
        throw new Error(`KDO event outbox enqueue failed: ${error.message}`);
      }
    }, { awaitCompletion: true });
  }
}
