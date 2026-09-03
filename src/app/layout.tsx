import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ShortlistProvider } from '@/components/talent/TalentShortlistDrawer';
import GlobalErrorBoundary from '@/components/shared/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeFlashScript } from '@/components/providers/ThemeFlashScript';
import { PublicShell } from '@/components/layout/PublicShell';
import { defaultSeo } from '@/lib/constants/seo';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  preload: true,
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.growthbridge.org'),
  title: defaultSeo.title,
  description: defaultSeo.description,
  openGraph: defaultSeo.openGraph,
  twitter: defaultSeo.twitter,
  applicationName: 'Growthbridge',
  authors: [{ name: 'Growthbridge', url: 'https://www.growthbridge.org' }],
  creator: 'Growthbridge',
  publisher: 'Growthbridge',
  category: 'technology',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/*
          Applies the correct theme BEFORE paint:
          - Public routes → light by default (gb_theme), dark optional
          - Admin routes  → dark by default (gb_admin_theme), light optional
        */}
        <ThemeFlashScript />
      </head>
      <body
        className={`${montserrat.variable} antialiased min-h-screen flex flex-col transition-colors duration-300 bg-[var(--surface-page)] text-[var(--text-primary)]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Growthbridge Virtual Organization',
              url: 'https://www.growthbridge.org',
              description: defaultSeo.description,
              slogan: 'Bridging Skills. Driving Growth.',
            }),
          }}
        />
        {/* Public-scoped theme (default light). Admin layout nests its own provider. */}
        <ThemeProvider scope="public">
          <QueryProvider>
            <ToastProvider>
              <ShortlistProvider>
                <GlobalErrorBoundary>
                  <PublicShell>{children}</PublicShell>
                </GlobalErrorBoundary>
              </ShortlistProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
