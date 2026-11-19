import type { Metadata } from 'next';
import { publicConfig } from '@/lib/config/public';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Growthbridge',
  description: 'Find answers about Growthbridge, our business and digital services, youth talent, partnerships and how to get started.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Frequently Asked Questions | Growthbridge',
    description: 'Clear answers about Growthbridge services, talent, partnerships and getting started.',
    url: new URL('/faq', publicConfig.NEXT_PUBLIC_SITE_URL).toString(),
    type: 'website',
  },
};

export default function FAQLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
