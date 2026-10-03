import { describe, expect, it } from 'vitest';
import { isKanaGameAnswerCorrect } from './isKanaGameAnswerCorrect';
import { flattenKanaGroups } from './flattenKanaGroup';
import { kana } from '@/features/Kana/data/kana';

const shi = { kana: 'し', romaji: 'shi', altRomanji: ['si'] };
const a = { kana: 'あ', romaji: 'a', altRomanji: [] };
const dzi = { kana: 'ぢ', romaji: 'ji', altRomanji: ['di'] };
const dzu = { kana: 'づ', romaji: 'zu', altRomanji: ['du'] };

const flattenedChar = (groupName: string, kanaChar: string) => {
  const index = kana.findIndex(group => group.groupName === groupName);
  expect(index).toBeGreaterThanOrEqual(0);
  const flattened = flattenKanaGroups([index]);
  return flattened.find(char => char.kana === kanaChar) ?? flattened[0];
};

const STANDARD_ALTERNATES: ReadonlyArray<[string, string, string]> = [
  ['h.d.z', 'じ', 'zi'],
  ['h.b.w', 'を', 'o'],
  ['k.d.z', 'ジ', 'zi'],
  ['k.b.w', 'ヲ', 'o'],
  ['challenge.katakana.sonshitsu', 'シ', 'si'],
  ['challenge.katakana.sonshitsu', 'ツ', 'tu'],
  ['challenge.katakana.sonshitsu', 'ン', 'nn'],
  ['challenge.similar.sachiki', 'ち', 'ti'],
];

describe('isKanaGameAnswerCorrect', () => {
  it('accepts the primary romaji (case- and whitespace-insensitive)', () => {
    expect(isKanaGameAnswerCorrect(shi, 'shi', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(shi, 'SHI', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(shi, ' shi ', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(shi, 's h i', false)).toBe(true);
  });

  it('accepts alternative romanizations in normal mode', () => {
    // Regression: Blitz/Gauntlet previously only accepted the primary romaji,
    // so "si" for し was wrongly marked incorrect while the main Type mode
    // accepted it.
    expect(isKanaGameAnswerCorrect(shi, 'si', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(shi, 'SI', false)).toBe(true);
  });

  it('accepts di/du romanizations for ぢ and づ', () => {
    // Regression #29312: 'di' is the standard keystroke for ぢ and 'du' for づ.
    expect(isKanaGameAnswerCorrect(dzi, 'di', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(dzi, 'ji', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(dzu, 'du', false)).toBe(true);
    expect(isKanaGameAnswerCorrect(dzu, 'zu', false)).toBe(true);
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

  it.each(STANDARD_ALTERNATES)(
    'accepts %s as a standard spelling for %s in %s',
    (groupName, kanaChar, romaji) => {
      expect(
        isKanaGameAnswerCorrect(
          flattenedChar(groupName, kanaChar),
          romaji,
          false,
        ),
      ).toBe(true);
    },
  );

  it.each(STANDARD_ALTERNATES)(
    'keeps accepting the primary romaji for %s in %s',
    (groupName, kanaChar) => {
      const character = flattenedChar(groupName, kanaChar);
      expect(isKanaGameAnswerCorrect(character, character.romaji, false)).toBe(
        true,
      );
    },
  );

  it('still accepts wo for を', () => {
    expect(
      isKanaGameAnswerCorrect(flattenedChar('h.b.w', 'を'), 'wo', false),
    ).toBe(true);
  });
});
