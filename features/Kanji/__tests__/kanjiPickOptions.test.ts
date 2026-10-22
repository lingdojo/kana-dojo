import { describe, expect, it } from 'vitest';
import n1Kanji from '@/public/data-kanji/N1.json';
import n2Kanji from '@/public/data-kanji/N2.json';
import n3Kanji from '@/public/data-kanji/N3.json';
import n4Kanji from '@/public/data-kanji/N4.json';
import n5Kanji from '@/public/data-kanji/N5.json';
import type { IKanjiObj } from '@/entities/kanji';
import { isKanjiAnswerCorrect } from '@/features/Kanji/lib/isKanjiAnswerCorrect';
import { pickKanjiDistractorMeanings } from '@/features/Kanji/lib/kanjiPickOptions';

const kanji = {
  kanjiChar: '氏',
  meanings: ['family name', 'surname', 'clan'],
  kunyomi: [' uji うじ'],
  onyomi: [' shi し'],
} as IKanjiObj;

describe('pickKanjiDistractorMeanings', () => {
  it('never offers a meaning of the target kanji as a wrong option', () => {
    const candidates = ['clan', 'family name', 'to be unrelated', 'surname'];

    const distractors = pickKanjiDistractorMeanings(candidates, kanji, 3);

    expect(distractors).toEqual(['to be unrelated']);
  });

  it('never offers the same meaning twice', () => {
    const candidates = ['politics', 'government', 'Politics', 'government'];

    const distractors = pickKanjiDistractorMeanings(candidates, kanji, 4);

    expect(distractors).toEqual(['politics', 'government']);
  });

  it('treats meanings that differ only in case or infinitive as the same', () => {
    const candidates = ['Politics', 'to politics', '  POLITICS  '];

    const distractors = pickKanjiDistractorMeanings(candidates, kanji, 3);

    expect(distractors).toEqual(['Politics']);
  });

  it('returns the requested number of distractors when enough are available', () => {
    const candidates = ['politics', 'government', 'society', 'history'];

    const distractors = pickKanjiDistractorMeanings(candidates, kanji, 2);

    expect(distractors).toHaveLength(2);
    expect(distractors).toEqual(['politics', 'government']);
  });

  it('returns fewer distractors when the pool runs out', () => {
    const candidates = ['clan', 'surname'];

    expect(pickKanjiDistractorMeanings(candidates, kanji, 2)).toEqual([]);
  });

  it('skips empty meanings', () => {
    const candidates = ['', '   ', 'politics'];

    expect(pickKanjiDistractorMeanings(candidates, kanji, 2)).toEqual([
      'politics',
    ]);
  });

  it('still removes repeated meanings when the target kanji is unknown', () => {
    const candidates = ['politics', 'politics', 'government'];

    expect(pickKanjiDistractorMeanings(candidates, undefined, 3)).toEqual([
      'politics',
      'government',
    ]);
  });

  it('never offers an option that the answer rules accept as correct', () => {
    const candidates = ['clan', 'politics', 'government'];

    const distractors = pickKanjiDistractorMeanings(candidates, kanji, 3);

    for (const option of distractors) {
      expect(isKanjiAnswerCorrect(kanji, option, false)).toBe(false);
    }
  });
});

describe('pick mode options for the shipped kanji data', () => {
  const levels = {
    n1: n1Kanji,
    n2: n2Kanji,
    n3: n3Kanji,
    n4: n4Kanji,
    n5: n5Kanji,
  } satisfies Record<string, IKanjiObj[]>;

  it.each(Object.entries(levels))(
    'never offers a correct answer as a wrong option in %s',
    (_level, kanjiList) => {
      for (const target of kanjiList) {
        const candidates = kanjiList
          .filter(other => other.kanjiChar !== target.kanjiChar)
          .flatMap(other => other.meanings ?? []);

        const distractors = pickKanjiDistractorMeanings(candidates, target, 2);

        expect(distractors).toHaveLength(2);
        expect(new Set(distractors).size).toBe(distractors.length);
        for (const option of distractors) {
          expect(isKanjiAnswerCorrect(target, option, false)).toBe(false);
        }
      }
    },
  );
});
