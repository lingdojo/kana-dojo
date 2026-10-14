import { describe, expect, it } from 'vitest';
import { normalizeKanaForComparison, findAllValidAnswers } from '@/features/Kana/lib/normalizeKanaForComparison';

describe('normalizeKanaForComparison', () => {
  it('converts Katakana to Hiragana', () => {
    expect(normalizeKanaForComparison('リ')).toBe('り');
  });

  it('handles the bug scenario: るリュリ normalizes to same as るリュり', () => {
    expect(normalizeKanaForComparison('るリュリ')).toBe('るりゅり');
    expect(normalizeKanaForComparison('るリュり')).toBe('るりゅり');
  });

  it('converts single Katakana character', () => {
    expect(normalizeKanaForComparison('シ')).toBe('し');
  });

  it('handles whitespace', () => {
    expect(normalizeKanaForComparison(' リ ')).toBe('り');
  });

  it('preserves already Hiragana', () => {
    expect(normalizeKanaForComparison('る')).toBe('る');
  });

  it('handles mixed scripts', () => {
    expect(normalizeKanaForComparison('るリュり')).toBe('るりゅり');
  });
});

describe('findAllValidAnswers', () => {
  it('finds all kana with same romaji', () => {
    const options = ['れ', 'レ', 'る', 'リ', 'ろ'];
    const validAnswers = findAllValidAnswers('れ', options);
    expect(validAnswers).toContain('れ');
    expect(validAnswers).toContain('レ');
    expect(validAnswers).not.toContain('る');
    expect(validAnswers).not.toContain('リ');
    expect(validAnswers).not.toContain('ろ');
  });

  it('handles the bug scenario: finds both り and リ for ri', () => {
    const options = ['り', 'リ', 'る', 'れ', 'ろ'];
    const validAnswers = findAllValidAnswers('り', options);
    expect(validAnswers).toContain('り');
    expect(validAnswers).toContain('リ');
  });

  it('returns empty array if no matches', () => {
    const options = ['あ', 'い', 'う'];
    const validAnswers = findAllValidAnswers('れ', options);
    expect(validAnswers).toHaveLength(0);
  });
});
