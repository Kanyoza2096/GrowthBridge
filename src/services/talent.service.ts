// src/services/talent.service.ts
import { TalentRepository } from '@/repositories/talent.repository';
import { eventPublisher } from '@/events/publisher';
import type { TalentProfile } from '@/lib/types/admin';

export class TalentService {
  private repo = new TalentRepository();

  async getAll(): Promise<TalentProfile[]> {
    return this.repo.getAll();
  }

  async getById(id: string): Promise<TalentProfile | null> {
    return this.repo.getById(id);
  }

  async createTalentProfile(data: Partial<TalentProfile>): Promise<TalentProfile> {
    const profile = await this.repo.create(data);
    await eventPublisher.publish('talent.profile.created', profile);
    return profile;
  }

  async updateTalentProfile(id: string, updates: Partial<TalentProfile>): Promise<TalentProfile> {
    return this.repo.update(id, updates);
  }

  async deleteTalentProfile(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export const talentService = new TalentService();
