// src/services/contact.service.ts
import 'server-only';
import { ContactRepository } from '@/repositories/contact.repository';
import { eventPublisher } from '@/events/publisher';
import type { ContactFormData, PartnershipData, ApiResponse } from '@/lib/types/common';

export class ContactService {
  private repo = new ContactRepository();

  async submitContact(data: ContactFormData): Promise<ApiResponse> {
    const res = await this.repo.submitContact(data);
    if (res.success) {
      await eventPublisher.publish('contact.submitted', data);
    }
    return res;
  }

  async submitPartnership(data: PartnershipData): Promise<ApiResponse> {
    const res = await this.repo.submitPartnership(data);
    if (res.success) {
      await eventPublisher.publish('partnership.requested', data);
    }
    return res;
  }
}

export const contactService = new ContactService();
