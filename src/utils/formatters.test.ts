import { describe, it, expect } from 'vitest';
import { formatDimension, formatCurrency, formatWeight } from './formatters';

describe('formatters utility', () => {
  it('formats dimensions in mm, cm, and m correctly', () => {
    expect(formatDimension(3050, 'mm')).toBe('3050 mm');
    expect(formatDimension(3050, 'cm')).toBe('305.0 cm');
    expect(formatDimension(3050, 'm')).toBe('3.050 m');
    expect(formatDimension(0, 'mm')).toBe('0 mm');
  });

  it('formats currency correctly in EUR', () => {
    const formatted = formatCurrency(1234.5);
    expect(formatted).toContain('1.234,50');
    expect(formatted).toContain('€');
  });

  it('formats weight in kg correctly', () => {
    expect(formatWeight(42.5)).toBe('42.5 kg');
    expect(formatWeight(0)).toBe('0.0 kg');
  });
});
