import { Container } from '@/components/ui/Container';

export default function Loading() {
  return (
    <main className="min-h-[70vh] flex items-center py-24" aria-busy="true" aria-live="polite">
      <Container size="lg">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-3 w-28 rounded-full bg-[var(--skeleton-base)] skeleton-shimmer" />
          <div className="h-14 sm:h-20 w-11/12 rounded-2xl bg-[var(--skeleton-base)] skeleton-shimmer" />
          <div className="h-5 w-4/5 rounded-lg bg-[var(--skeleton-base)] skeleton-shimmer" />
          <div className="h-64 sm:h-80 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-soft)]" />
        </div>
      </Container>
    </main>
  );
}
