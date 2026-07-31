import { describe, it, expect } from 'vitest';
import { calculateStringMatchScore } from '../lib/searchAlgorithm';

describe('calculateStringMatchScore', () => {
  it('returns 100 for exact matches', () => {
    expect(calculateStringMatchScore('apple', 'apple')).toBe(100);
    expect(calculateStringMatchScore('SUN', 'sun')).toBe(100);
  });

  it('returns 80 for prefix matches', () => {
    expect(calculateStringMatchScore('app', 'apple')).toBe(80);
  });

  it('returns 70 for exact word boundary matches', () => {
    expect(calculateStringMatchScore('sun', 'the sun is hot')).toBe(70);
  });

  it('returns 50 for prefix word boundary matches', () => {
    expect(calculateStringMatchScore('su', 'the sun is hot')).toBe(50);
  });

  it('returns 30 for substring matches', () => {
    expect(calculateStringMatchScore('un', 'sun')).toBe(30);
  });

  it('returns 0 for no match', () => {
    expect(calculateStringMatchScore('moon', 'sun')).toBe(0);
    expect(calculateStringMatchScore('', 'sun')).toBe(0);
  });
});
