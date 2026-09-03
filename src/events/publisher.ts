// src/events/publisher.ts
import type { DomainEvent, DomainEventType, DomainEventHandler } from './event-types';

class EventPublisher {
  private handlers: Map<DomainEventType, Set<DomainEventHandler>> = new Map();

  subscribe<T = any>(type: DomainEventType, handler: DomainEventHandler<T>) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as DomainEventHandler);
    return () => {
      this.handlers.get(type)?.delete(handler as DomainEventHandler);
    };
  }

  async publish<T = any>(
    type: DomainEventType,
    payload: T,
    options?: { actorId?: string; correlationId?: string }
  ): Promise<void> {
    const event: DomainEvent<T> = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: new Date().toISOString(),
      actorId: options?.actorId,
      correlationId: options?.correlationId || crypto.randomUUID(),
    };

    const targetHandlers = this.handlers.get(type);
    if (!targetHandlers || targetHandlers.size === 0) {
      return;
    }

    // Execute handlers asynchronously (non-blocking for critical paths)
    const promises = Array.from(targetHandlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventPublisher] Error executing handler for event "${type}":`, err);
      }
    });

    // Don't throw if background handlers fail
    void Promise.allSettled(promises);
  }
}

export const eventPublisher = new EventPublisher();
