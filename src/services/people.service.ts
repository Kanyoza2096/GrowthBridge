// src/services/people.service.ts
import { PeopleRepository } from '@/repositories/people.repository';
import type { Person, PeopleQueryParams } from '@/lib/types/person';

export class PeopleService {
  private repo = new PeopleRepository();

  /** Public directory — never returns email/phone. */
  async getPublicPeople(params?: PeopleQueryParams): Promise<Person[]> {
    return this.repo.getPublicAll(params);
  }

  /** Public single person by slug — never returns email/phone. */
  async getPublicPersonBySlug(slug: string): Promise<Person | null> {
    return this.repo.getPublicBySlug(slug);
  }

  /**
   * Convenience wrapper used by public providers.
   * Defaults to public-safe methods unless explicitly requesting inactive records
   * (admin directory use-case).
   */
  async getPeople(params?: PeopleQueryParams): Promise<Person[]> {
    // Admin directory explicitly asks for inactive records.
    if (params?.onlyActive === false) {
      return this.repo.getAll(params);
    }
    return this.repo.getPublicAll(params);
  }

  async getPersonBySlug(slug: string): Promise<Person | null> {
    // Prefer the public view so PII is never leaked on public routes.
    return this.repo.getPublicBySlug(slug);
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
