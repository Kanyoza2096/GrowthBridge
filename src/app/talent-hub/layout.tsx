import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Talent Hub | Growthbridge',
  description: 'Connect with Growthbridge opportunities, programs and pathways for emerging digital talent.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
