import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { join } from 'path';

describe('theme contrast (WCAG AA)', () => {
  it('passes automated token contrast checks for light and dark themes', () => {
    const script = join(process.cwd(), 'scripts/check-contrast.js');
    const output = execFileSync(process.execPath, [script], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    expect(output).toContain('Contrast check passed');
  });
});
