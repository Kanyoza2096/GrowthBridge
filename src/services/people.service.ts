// src/services/people.service.ts
import 'server-only';
import { PeopleRepository } from '@/repositories/people.repository';
import type { Person, PeopleQueryParams } from '@/lib/types/person';

export class PeopleService {
  private repo = new PeopleRepository();

  async getPeople(params?: PeopleQueryParams): Promise<Person[]> {
    return this.repo.getAll(params);
  }

  async getPersonBySlug(slug: string): Promise<Person | null> {
    return this.repo.getBySlug(slug);
  }

  async getPersonById(id: string): Promise<Person | null> {
    return this.repo.getById(id);
  }

  async createPerson(data: Partial<Person>): Promise<Person> {
    return this.repo.create(data);
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    return this.repo.update(id, updates);
  }

  async deletePerson(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export const peopleService = new PeopleService();
