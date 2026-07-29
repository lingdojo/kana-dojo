import { describe, expect, it } from 'vitest';
import n1Kanji from '@/public/data-kanji/N1.json';
import n2Kanji from '@/public/data-kanji/N2.json';
import n3Kanji from '@/public/data-kanji/N3.json';
import n4Kanji from '@/public/data-kanji/N4.json';
import n5Kanji from '@/public/data-kanji/N5.json';
import type { IKanjiObj } from '@/entities/kanji';

const kanjiByLevel = {
  n1: n1Kanji,
  n2: n2Kanji,
  n3: n3Kanji,
  n4: n4Kanji,
  n5: n5Kanji,
} satisfies Record<string, IKanjiObj[]>;

/**
 * Mirrors the extractKanaFromReading helper in FuriganaText.tsx.
 * Kept in sync manually — if the production implementation changes,
 * update this copy too so the tests remain meaningful.
 */
const extractKanaFromReading = (reading: string): string => {
  if (!reading) return reading;
  const spaceIndex = reading.indexOf(' ');
  if (spaceIndex !== -1) return reading.slice(spaceIndex + 1).trim();
  return reading;
};

describe('kanji readings data', () => {
  it('keeps alternate readings as separate array entries', () => {
    const combinedReadingPattern =
      /\b[a-z][a-z()]*\s+[ァ-ヶーぁ-ゖ]+\s*,\s*[a-z]/i;

    const combinedReadings = Object.entries(kanjiByLevel).flatMap(
      ([level, kanjiList]) =>
        kanjiList.flatMap(kanji =>
          [...kanji.onyomi, ...kanji.kunyomi]
            .filter(reading => combinedReadingPattern.test(reading))
            .map(reading => `${level} ${kanji.kanjiChar}: ${reading}`),
        ),
    );

    expect(combinedReadings).toEqual([]);
  });

  // Regression test for issue #24304: 男 (otoko) was displayed with wrong reading
  it('男 (otoko) has correct kunyomi reading in N5 data', () => {
    const otoko = (n5Kanji as IKanjiObj[]).find(k => k.kanjiChar === '男');
    expect(otoko).toBeDefined();
    expect(otoko?.kunyomi[0]).toBe('otoko おとこ');
    // extractKanaFromReading must return only the kana part, not the romaji prefix
    expect(extractKanaFromReading(otoko!.kunyomi[0])).toBe('おとこ');
  });

  it('extractKanaFromReading strips romaji prefix from readings', () => {
    expect(extractKanaFromReading('otoko おとこ')).toBe('おとこ');
    expect(extractKanaFromReading('dan ダン')).toBe('ダン');
    expect(extractKanaFromReading('watakushi わたくし')).toBe('わたくし');
    // Kana-only entries should be returned unchanged
    expect(extractKanaFromReading('おとこ')).toBe('おとこ');
    // Empty string guard
    expect(extractKanaFromReading('')).toBe('');
  });
});

