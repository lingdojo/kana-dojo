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
});
