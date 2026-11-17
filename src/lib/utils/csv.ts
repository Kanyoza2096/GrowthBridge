/**
 * Escape a CSV cell for spreadsheet-safe exports.
 *
 * Quoting prevents CSV structure injection. Prefixing formula-like values
 * prevents spreadsheet applications from evaluating user-controlled cells.
 */
export function escapeCsvCell(value: unknown): string {
  const text = String(value ?? '');
  const safeText = /^[\u0000-\u0020]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}
