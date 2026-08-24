'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Production error reporting
// Replace this with your actual error tracking service (Sentry, LogRocket, etc.)
// ---------------------------------------------------------------------------
async function reportErrorToService(error: Error, errorInfo: ErrorInfo): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Example: send to a logging endpoint
    // await fetch('/api/log-error', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     message: error.message,
    //     stack: error.stack,
    //     componentStack: errorInfo.componentStack,
    //     url: window.location.href,
    //     timestamp: new Date().toISOString(),
    //   }),
    // });

    // For now, log to console. In production, this should go to Sentry/similar.
    console.error('[ErrorBoundary]', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    });
  } catch {
    // Best-effort — don't throw from the error reporter
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------
class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report to monitoring service
    reportErrorToService(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center space-y-6 p-8 sm:p-10 rounded-2xl bg-[var(--card-surface)] border border-[var(--card-border)] shadow-xl border-l-4 border-l-amber-500">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
                Something went wrong
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                An unexpected error occurred while rendering this page.
                Please try reloading or return to the home page.
              </p>
            </div>

            {/* Error details hidden in production, visible in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-xs text-left bg-[var(--surface-subtle)] border border-[var(--border-subtle)] rounded-xl p-4 max-h-32 overflow-y-auto">
                <p className="font-semibold text-[var(--text-secondary)] mb-1">Error:</p>
                <code className="text-red-600 dark:text-red-400 break-all">
                  {String(this.state.error.message || 'Unknown error')}
                </code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Link href="/">
                <Button variant="ghost" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
