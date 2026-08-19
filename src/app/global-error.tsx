'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError] Uncaught application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-[#070F1B] text-slate-100 min-h-screen flex items-center justify-center p-6">
        <Container size="sm">
          <Card variant="glass" className="max-w-lg mx-auto text-center space-y-6 p-8 sm:p-10 border-l-4 border-l-rose-500/60">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-500/20 to-[#123B5D]/40 border border-rose-500/40 flex items-center justify-center">
              <span className="text-3xl">🚨</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-white">System Error</h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                The application encountered an unexpected error. Our engineering team has been notified automatically.
              </p>
            </div>
            {process.env.NODE_ENV !== 'production' && error && (
              <div className="text-xs text-left bg-slate-950/70 border border-slate-800 rounded-xl p-4 max-h-44 overflow-y-auto space-y-1">
                <p className="font-bold text-slate-400 mb-1">Debug Info:</p>
                <code className="text-rose-400 break-all block">
                  {String(error.message || 'Unknown error')}
                </code>
                {error.digest && (
                  <code className="text-slate-500 break-all block text-[10px] mt-1">
                    digest: {error.digest}
                  </code>
                )}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="primary" size="lg" onClick={() => reset()}>
                Try Again
              </Button>
              <Link href="/">
                <Button variant="ghost" size="lg">
                  ← Go Home
                </Button>
              </Link>
            </div>
            <p className="text-[10px] text-slate-500 pt-2">
              Error reference: <code className="text-slate-600">{error.digest || 'E-' + Date.now().toString(36).toUpperCase()}</code>
            </p>
          </Card>
        </Container>
      </body>
    </html>
  );
}
