import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/montserrat';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ShortlistProvider } from '@/components/talent/TalentShortlistDrawer';
import GlobalErrorBoundary from '@/components/shared/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeFlashScript } from '@/components/providers/ThemeFlashScript';
import { PublicShell } from '@/components/layout/PublicShell';
import { ServiceWorkerRegistration } from '@/components/providers/ServiceWorkerRegistration';
import { defaultSeo } from '@/lib/constants/seo';
import { publicConfig } from '@/lib/config/public';


export const viewport: Viewport = {
  themeColor: '#123b5d',
  colorScheme: 'light',
};

export const metadata: Metadata = {
  metadataBase: new URL(publicConfig.NEXT_PUBLIC_SITE_URL),
  title: defaultSeo.title,
  description: defaultSeo.description,
  openGraph: defaultSeo.openGraph,
  twitter: defaultSeo.twitter,
  applicationName: 'Growthbridge',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'GrowthBridge' },
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', type: 'image/svg+xml', sizes: '192x192' },
      { url: '/icons/icon-512.svg', type: 'image/svg+xml', sizes: '512x512' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  authors: [{ name: 'Growthbridge', url: publicConfig.NEXT_PUBLIC_SITE_URL }],
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
        className="antialiased min-h-screen flex flex-col transition-colors duration-300 bg-[var(--surface-page)] text-[var(--text-primary)]"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Growthbridge Virtual Organization',
              url: publicConfig.NEXT_PUBLIC_SITE_URL,
              description: defaultSeo.description,
              slogan: 'Bridging Skills. Driving Growth.',
            }),
          }}
        />
        {/* Public-scoped theme (default light). Admin layout nests its own provider. */}
        <ServiceWorkerRegistration />
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
