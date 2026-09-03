import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'People & Leadership | Growthbridge',
  description: 'Meet the people, leaders, advisors and contributors building the Growthbridge ecosystem.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
