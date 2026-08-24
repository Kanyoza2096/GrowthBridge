// src/services/services.service.ts
import 'server-only';
import { ServicesRepository } from '@/repositories/services.repository';
import { eventPublisher } from '@/events/publisher';
import type { Service } from '@/lib/types/service';

export class ServicesService {
  private repo = new ServicesRepository();

  async getServices(): Promise<Service[]> {
    return this.repo.getAll();
  }

  async getServiceBySlug(slug: string): Promise<Service | null> {
    return this.repo.getBySlug(slug);
  }

  async createService(data: Partial<Service>, actorId?: string): Promise<Service> {
    const service = await this.repo.create(data);
    await eventPublisher.publish('service.created', service, { actorId });
    return service;
  }

  async updateService(id: string, updates: Partial<Service>, actorId?: string): Promise<Service> {
    const updated = await this.repo.update(id, updates);
    await eventPublisher.publish('service.updated', updated, { actorId });
    return updated;
  }

  async deleteService(id: string, actorId?: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export const servicesService = new ServicesService();
