import { describe, expect, it } from 'vitest';
import n1Kanji from '@/public/data-kanji/N1.json';
import n2Kanji from '@/public/data-kanji/N2.json';
import n3Kanji from '@/public/data-kanji/N3.json';
import n4Kanji from '@/public/data-kanji/N4.json';
import n5Kanji from '@/public/data-kanji/N5.json';
import { getReadingAnswerForms } from '@/features/Kanji/lib/getReadingAnswerForms';

describe('getReadingAnswerForms', () => {
  it.each([
    ['mana(bu) まな(ぶ)', ['mana(bu)', 'manabu', 'まなぶ']],
    ['gaku ガク', ['gaku', 'ガク']],
    ['to- と-', ['to-', 'to', 'と']],
    ['-bi -び', ['-bi', 'bi', 'び']],
    ['kaku か.く', ['kaku', 'かく']],
    ['-o(ri) -お(り)', ['-o(ri)', 'ori', 'おり']],
    ['kou (コウ)', ['kou', 'コウ']],
    ['ずきん', ['ずきん']],
  ])('lists the typeable forms of %s', (reading, forms) => {
    expect(getReadingAnswerForms(reading)).toEqual(forms);
  });

  it('returns nothing for an empty reading', () => {
    expect(getReadingAnswerForms('')).toEqual([]);
  });

  it('gives every reading in the data a form without markup', () => {
    const readings = [n1Kanji, n2Kanji, n3Kanji, n4Kanji, n5Kanji]
      .flat()
      .flatMap(kanji => [...kanji.kunyomi, ...kanji.onyomi])
      .filter(reading => reading.trim());

    const untypeable = readings.filter(
      reading =>
        !getReadingAnswerForms(reading).some(form => !/[().\-]/.test(form)),
    );

    expect(untypeable).toEqual([]);
  });
});
