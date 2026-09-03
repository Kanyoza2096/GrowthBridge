import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Growthbridge',
  description: 'Learn how Growthbridge connects youth talent, technology and practical delivery to create measurable impact.',
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
