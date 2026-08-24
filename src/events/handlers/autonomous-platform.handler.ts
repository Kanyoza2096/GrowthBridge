// src/events/handlers/autonomous-platform.handler.ts
import { eventPublisher } from '../publisher';
import { autonomousPlatformClient } from '@/integrations/autonomous-platform/client';

export function registerAutonomousPlatformEventHandlers() {
  // Subscribe to blog.published event -> trigger AI social content generation
  eventPublisher.subscribe('blog.published', async (event) => {
    try {
      await autonomousPlatformClient.executeWorkflow('blog-social-syndication', {
        postId: event.payload.id,
        title: event.payload.title,
        slug: event.payload.slug,
        excerpt: event.payload.excerpt,
      });
    } catch (err) {
      console.warn('[AutonomousPlatformHandler] Failed to handle blog.published:', err);
    }
  });

  // Subscribe to application.created -> trigger AI candidate evaluation
  eventPublisher.subscribe('application.created', async (event) => {
    try {
      await autonomousPlatformClient.analyzeApplication(event.payload.id, event.payload);
    } catch (err) {
      console.warn('[AutonomousPlatformHandler] Failed to handle application.created:', err);
    }
  });
}
