import { describe, expect, it, vi } from 'vitest';
import { EventPublisher } from '@/events/publisher';

describe('EventPublisher delivery guarantees', () => {
  it('propagates failures from awaited durable handlers', async () => {
    const publisher = new EventPublisher();
    publisher.subscribe('blog.published', async () => {
      throw new Error('outbox database unavailable');
    }, { awaitCompletion: true });

    await expect(
      publisher.publish('blog.published', { id: 'post-1' })
    ).rejects.toThrow('outbox database unavailable');
  });

  it('keeps non-awaited handlers best-effort', async () => {
    const publisher = new EventPublisher();
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    publisher.subscribe('blog.published', async () => {
      throw new Error('optional notification failed');
    });

    await expect(
      publisher.publish('blog.published', { id: 'post-1' })
    ).resolves.toBeUndefined();

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
