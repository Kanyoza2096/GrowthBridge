// src/repositories/faqs.repository.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { FAQ } from '@/lib/types/admin';

function mapDbToFAQ(row: any): FAQ {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    order: row.display_order ?? 0,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class FAQsRepository {
  async getAll(): Promise<FAQ[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[FAQsRepository.getAll]', error);
      return [];
    }
    return (data || []).map(mapDbToFAQ);
  }

  async create(faq: Partial<FAQ>): Promise<FAQ> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        question: faq.question!,
        answer: faq.answer!,
        category: faq.category || 'general',
        display_order: faq.order ?? 0,
        status: faq.status || 'published',
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToFAQ(data);
  }

  async update(id: string, updates: Partial<FAQ>): Promise<FAQ> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.question) payload.question = updates.question;
    if (updates.answer) payload.answer = updates.answer;
    if (updates.category) payload.category = updates.category;
    if (updates.order !== undefined) payload.display_order = updates.order;
    if (updates.status) payload.status = updates.status;

    const { data, error } = await supabase
      .from('faqs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToFAQ(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    return !error;
  }
}
