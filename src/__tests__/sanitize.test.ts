import { describe, it, expect } from 'vitest';
import { sanitizeHtml, stripHtml, sanitizePlainText } from '@/lib/security/sanitize';

describe('sanitize', () => {
  it('sanitizeHtml escapes special characters', () => {
    expect(sanitizeHtml(`<script>alert("x")</script>`)).toContain('&lt;script&gt;');
    expect(sanitizeHtml(`a & b`)).toBe('a &amp; b');
  });

  it('stripHtml removes tags', () => {
    expect(stripHtml('<b>Hello</b> world')).toBe('Hello world');
  });

  it('sanitizePlainText collapses whitespace and strips tags', () => {
    expect(sanitizePlainText('  <b>Hi</b>\n\tthere  ')).toBe('Hi there');
  });
});
