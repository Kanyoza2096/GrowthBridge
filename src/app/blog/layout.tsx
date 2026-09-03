import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Hub | Growthbridge',
  description: 'Insights on technology, skills development, entrepreneurship, community impact and Growthbridge case studies.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
