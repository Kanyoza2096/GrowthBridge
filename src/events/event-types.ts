// src/events/event-types.ts
export type DomainEventType =
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'service.created'
  | 'service.updated'
  | 'blog.created'
  | 'blog.published'
  | 'application.created'
  | 'application.updated'
  | 'contact.submitted'
  | 'partnership.requested'
  | 'talent.profile.created'
  | 'testimonial.created'
  | 'settings.updated';

export interface DomainEvent<T = any> {
  id: string;
  type: DomainEventType;
  payload: T;
  timestamp: string;
  actorId?: string;
  correlationId?: string;
}

export type DomainEventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;
