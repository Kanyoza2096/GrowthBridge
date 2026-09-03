import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | Growthbridge',
  description: 'Digital products, technology services and practical business solutions delivered through the Growthbridge ecosystem.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
