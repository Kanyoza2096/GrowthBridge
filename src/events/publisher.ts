// src/events/publisher.ts
import type { DomainEvent, DomainEventType, DomainEventHandler } from './event-types';

type RegisteredHandler = {
  handler: DomainEventHandler;
  awaitCompletion: boolean;
};

export class EventPublisher {
  private handlers: Map<DomainEventType, Set<RegisteredHandler>> = new Map();

  subscribe<T = any>(
    type: DomainEventType,
    handler: DomainEventHandler<T>,
    options?: { awaitCompletion?: boolean }
  ) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    const registration: RegisteredHandler = {
      handler: handler as DomainEventHandler,
      awaitCompletion: options?.awaitCompletion === true,
    };
    this.handlers.get(type)!.add(registration);
    return () => this.handlers.get(type)?.delete(registration);
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
    if (!targetHandlers || targetHandlers.size === 0) return;

    const registrations = Array.from(targetHandlers);
    const awaited = registrations.filter((item) => item.awaitCompletion);
    const background = registrations.filter((item) => !item.awaitCompletion);

    // Optional handlers remain best-effort. Durable enqueue handlers must
    // propagate failures so callers cannot mistake an unqueued event for success.
    const runBackground = async (registration: RegisteredHandler) => {
      try {
        await registration.handler(event);
      } catch (err) {
        console.error(`[EventPublisher] Error executing background handler for event "${type}":`, err);
      }
    };

    void Promise.allSettled(background.map(runBackground));
    await Promise.all(awaited.map((registration) => registration.handler(event)));
  }
}

export const eventPublisher = new EventPublisher();
