import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('theme scope policy', () => {
  const provider = readFileSync(
    join(process.cwd(), 'src/components/providers/ThemeProvider.tsx'),
    'utf8'
  );
  const flash = readFileSync(
    join(process.cwd(), 'src/components/providers/ThemeFlashScript.tsx'),
    'utf8'
  );
  const rootLayout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
  const adminLayout = readFileSync(join(process.cwd(), 'src/app/admin/layout.tsx'), 'utf8');

  it('defaults public to light and admin to dark', () => {
    expect(provider).toMatch(/public:\s*'light'/);
    expect(provider).toMatch(/admin:\s*'dark'/);
  });

  it('uses separate storage keys for public and admin', () => {
    expect(provider).toContain("gb_theme");
    expect(provider).toContain("gb_admin_theme");
    expect(flash).toContain("gb_theme");
    expect(flash).toContain("gb_admin_theme");
  });

  it('flash script falls back to light on public and dark on admin', () => {
    expect(flash).toMatch(/fallback=admin\?'dark':'light'/);
  });

  it('root layout provides public theme scope', () => {
    expect(rootLayout).toContain('scope="public"');
    expect(rootLayout).toContain('ThemeFlashScript');
  });

  it('admin layout nests an independent admin theme scope', () => {
    expect(adminLayout).toContain('scope="admin"');
  });

  it('marks the public shell as an explicit theme boundary', () => {
    const shell = readFileSync(
      join(process.cwd(), 'src/components/layout/PublicShell.tsx'),
      'utf8'
    );
    expect(shell).toContain('className=\"public-site\"');
  });

  it('does not use invalid CSS background-color syntax for gradients', () => {
    const footer = readFileSync(join(process.cwd(), 'src/components/layout/Footer.tsx'), 'utf8');
    const home = readFileSync(join(process.cwd(), 'src/components/home/HeroSection.tsx'), 'utf8');
    const card = readFileSync(join(process.cwd(), 'src/components/ui/Card.tsx'), 'utf8');
    expect(footer).not.toContain('bg-[var(--gradient-brand)]');
    expect(home).not.toContain('bg-[var(--gradient-brand)]');
    expect(card).not.toContain('bg-[var(--gradient-brand)]');
  });

  it('declares light and dark browser color schemes explicitly', () => {
    const light = readFileSync(join(process.cwd(), 'src/styles/themes/light.css'), 'utf8');
    const dark = readFileSync(join(process.cwd(), 'src/styles/themes/dark.css'), 'utf8');
    expect(light).toContain('color-scheme: light');
    expect(dark).toContain('color-scheme: dark');
  });

  it('does not use OS preference as the product default', () => {
    // Defaults must come from scope policy, not matchMedia
    expect(provider).toContain("DEFAULT_FOR_SCOPE");
    expect(flash).not.toMatch(/matchMedia\s*\(\s*['"]\(prefers-color-scheme/);
  });
});
