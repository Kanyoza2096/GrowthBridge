'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[PublicError]', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center py-24">
      <Container size="sm">
        <Card variant="glass" className="public-card p-7 sm:p-10 text-center space-y-6 border-l-4 border-l-[var(--gb-green-600)]">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--chip-green-bg)] text-[var(--chip-green-text)] grid place-items-center text-xl font-black" aria-hidden="true">!</div>
          <div className="space-y-2">
            <p className="public-kicker">Temporary interruption</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">We couldn&apos;t load this page.</h1>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">The content service may be temporarily unavailable. Try again, or continue to another part of Growthbridge.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" variant="primary" onClick={() => reset()}>Try again</Button>
            <Link href="/"><Button size="lg" variant="ghost">Go home</Button></Link>
          </div>
        </Card>
      </Container>
    </main>
  );
}
