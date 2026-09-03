import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist or has been moved.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--gb-brand-green)]/10 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 gb-responsive-glow w-[min(28rem,120vw)] h-[min(28rem,120vw)] bg-[var(--gb-brand-navy)]/30 blur-3xl rounded-full opacity-40" />
      </div>

      <Container size="sm" className="relative z-10">
        <Card variant="glass" className="max-w-2xl mx-auto text-center space-y-8 p-6 sm:p-10 md:p-14 border-l-4 border-l-[var(--gb-brand-green)]">
          <div>
            <p className="text-[clamp(5.5rem,28vw,10rem)] font-black leading-none bg-gradient-to-br from-[var(--gb-brand-green)] to-[var(--gb-brand-navy)] bg-clip-text text-transparent select-none">
              404
            </p>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Page not found
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist, has been moved, or the link is broken.
              Let&apos;s get you back to something useful.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/">
              <Button variant="primary" size="lg">
                ← Back to Home
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="lg">
                Contact Support
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
              If you followed a link from within our website, please let us know so we can fix it.
              <br />
              Growthbridge — Bridging Skills. Driving Growth.
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}
