import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ShortlistProvider } from '@/components/talent/TalentShortlistDrawer';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AIAssistantButton } from '@/components/shared/AIAssistantButton';
import GlobalErrorBoundary from '@/components/shared/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeFlashScript } from '@/components/providers/ThemeFlashScript';
import { defaultSeo } from '@/lib/constants/seo';

export const metadata: Metadata = {
  title: defaultSeo.title,
  description: defaultSeo.description,
  openGraph: defaultSeo.openGraph,
  twitter: defaultSeo.twitter,
  applicationName: 'Growthbridge',
  authors: [{ name: 'Growthbridge', url: 'https://www.growthbridge.org' }],
  creator: 'Growthbridge',
  publisher: 'Growthbridge',
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth"
    >
      <head>
        <ThemeFlashScript scope="public" />
      </head>
      <body className="antialiased min-h-screen flex flex-col transition-colors duration-300">
        <ThemeProvider scope="public">
          <QueryProvider>
            <ToastProvider>
              <ShortlistProvider>
                <GlobalErrorBoundary>
                  <Header />
                  <main className="flex-1 pt-24">{children}</main>
                  <Footer />
                  <AIAssistantButton />
                </GlobalErrorBoundary>
              </ShortlistProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
