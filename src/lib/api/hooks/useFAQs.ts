import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface PublicFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export function useFAQs() {
  return useQuery({
    queryKey: ['public-faqs'],
    queryFn: async (): Promise<PublicFAQ[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('faqs')
        .select('id, question, answer, category, display_order')
        .eq('status', 'published')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[useFAQs] Unable to load published FAQs', error);
        throw new Error('We could not load the help centre right now.');
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        category: row.category || 'General',
        order: row.display_order ?? 0,
      }));
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
