// src/services/applications.service.ts
import { ApplicationsRepository } from '@/repositories/applications.repository';
import { eventPublisher } from '@/events/publisher';
import type { Application } from '@/lib/types/admin';

export class ApplicationsService {
  private repo = new ApplicationsRepository();

  async getApplications(): Promise<Application[]> {
    return this.repo.getAll();
  }

  async getApplicationById(id: string): Promise<Application | null> {
    return this.repo.getById(id);
  }

  async createApplication(data: Partial<Application>): Promise<Application> {
    const app = await this.repo.create(data);
    await eventPublisher.publish('application.created', app);
    return app;
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    const updated = await this.repo.update(id, updates);
    await eventPublisher.publish('application.updated', updated);
    return updated;
  }

  async deleteApplication(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export const applicationsService = new ApplicationsService();
