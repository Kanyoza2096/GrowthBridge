// src/lib/security/sanitize.ts

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>?/gm, '').trim();
}

export function sanitizePlainText(input: string): string {
  return stripHtml(input).replace(/[\r\n\t]+/g, ' ').trim();
}
