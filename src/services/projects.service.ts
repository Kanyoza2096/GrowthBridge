// src/services/projects.service.ts
import { ProjectsRepository } from '@/repositories/projects.repository';
import { eventPublisher } from '@/events/publisher';
import type { Project } from '@/lib/types/project';

export class ProjectsService {
  private repo = new ProjectsRepository();

  async getProjects(): Promise<Project[]> {
    return this.repo.getAll();
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    return this.repo.getBySlug(slug);
  }

  async createProject(data: Partial<Project>, actorId?: string): Promise<Project> {
    const project = await this.repo.create(data);
    await eventPublisher.publish('project.created', project, { actorId });
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>, actorId?: string): Promise<Project> {
    const updated = await this.repo.update(id, updates);
    await eventPublisher.publish('project.updated', updated, { actorId });
    return updated;
  }

  async deleteProject(id: string, actorId?: string): Promise<boolean> {
    const deleted = await this.repo.delete(id);
    if (deleted) {
      await eventPublisher.publish('project.deleted', { id }, { actorId });
    }
    return deleted;
  }
}

export const projectsService = new ProjectsService();
