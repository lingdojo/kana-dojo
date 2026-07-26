import { describe, expect, it } from 'vitest';
import { isKanaGameAnswerCorrect } from './isKanaGameAnswerCorrect';

const shi = { kana: 'し', romaji: 'shi', altRomanji: ['si'] };
const a = { kana: 'あ', romaji: 'a', altRomanji: [] };

describe('isKanaGameAnswerCorrect', () => {
  it('accepts the primary romaji (case- and whitespace-insensitive)', () => {
    expect(isKanaGameAnswerCorrect(shi, 'shi', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(shi, 'SHI', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(shi, ' shi ', false)).toBe(true);
  });

  it('accepts alternative romanizations in normal mode', () => {
    // Regression: Blitz/Gauntlet previously only accepted the primary romaji,
    // so "si" for し was wrongly marked incorrect while the main Type mode
    // accepted it.
    expect(isKanaGameAnswerCorrect(shi, 'si', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(shi, 'SI', false)).toBe(true);
  });

  it('rejects an incorrect romaji', () => {
    expect(isKanaGameAnswerCorrect(shi, 'su', false)).toBe(false);
    expect(isKanaGameAnswerCorrect(a, 'si', false)).toBe(false);
  });

  it('matches the kana character itself in reverse mode', () => {
    expect(isKanaGameAnswerCorrect(shi, 'し', true)).toBe(true);
    expect(isKanaGameAnswerCorrect(shi, ' し ', true)).toBe(true);
    expect(isKanaGameAnswerCorrect(shi, 'shi', true)).toBe(false);
  });
});
