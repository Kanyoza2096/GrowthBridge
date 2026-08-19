'use client';

import { noFlashThemeScript } from '@/components/providers/ThemeProvider';

export function ThemeFlashScript({ scope }: { scope: 'public' | 'admin' }) {
  const script = noFlashThemeScript(scope);
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
