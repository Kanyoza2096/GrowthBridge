// Formatting helper utilities

function isValidDate(d: Date): boolean {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/**
 * Format a number with commas for display
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || typeof num !== 'number' || Number.isNaN(num)) {
    return '0';
  }
  try {
    return new Intl.NumberFormat('en-US').format(num);
  } catch {
    return String(num);
  }
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  try {
    const d = dateString instanceof Date ? dateString : new Date(dateString);
    if (!isValidDate(d)) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (!isValidDate(date)) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 0) return 'In the future';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return '';
  }
}

/**
 * Calculate estimated read time for content
 */
export function calculateReadTime(content: string | null | undefined): number {
  if (!content || typeof content !== 'string') return 1;
  try {
    const wordsPerMinute = 200;
    const trimmed = content.trim();
    if (!trimmed) return 1;
    const words = trimmed.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  } catch {
    return 1;
  }
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text || typeof text !== 'string') return '';
  if (maxLength <= 0) return '';
  if (text.length <= maxLength) return text;
  try {
    return text.substring(0, maxLength).trimEnd() + '…';
  } catch {
    return text.substring(0, Math.min(maxLength, text.length));
  }
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  try {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  } catch {
    return '';
  }
}
