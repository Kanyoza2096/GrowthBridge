import { describe, expect, it } from 'vitest';
import { escapeCsvCell } from '@/lib/utils/csv';

describe('escapeCsvCell', () => {
  it('quotes cells and escapes embedded quotes', () => {
    expect(escapeCsvCell('Growthbridge "Digital"')).toBe('"Growthbridge ""Digital"""');
  });

  it.each(['=HYPERLINK("https://example.com")', '+SUM(1,2)', '-1+2', '@SUM(A1:A2)', '  =1+1', '\t=1+1', '\uFEFF=1+1'])(
    'neutralizes spreadsheet formulas beginning with %s',
    (value) => {
      expect(escapeCsvCell(value)).toBe(`"'${value.replace(/"/g, '""')}"`);
    }
  );

  it('preserves ordinary text and empty cells', () => {
    expect(escapeCsvCell('Jane Doe')).toBe('"Jane Doe"');
    expect(escapeCsvCell(null)).toBe('""');
    expect(escapeCsvCell(undefined)).toBe('""');
  });
});
