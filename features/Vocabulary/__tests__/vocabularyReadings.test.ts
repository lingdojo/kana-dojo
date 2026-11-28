import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { IVocabObj } from '@/entities/vocabulary';
import { isVocabularyMeaningAnswerCorrect } from '@/features/Vocabulary/lib/isVocabularyMeaningAnswerCorrect';
import {
  attachAlternateReadings,
  getAcceptedVocabularyReadings,
  isVocabularyReadingAnswerCorrect,
} from '@/features/Vocabulary/lib/vocabularyReadings';

const iku: IVocabObj = { word: '行く', reading: 'いく', meanings: ['to go'] };
const yuku: IVocabObj = { word: '行く', reading: 'ゆく', meanings: ['to go'] };
const watakushi: IVocabObj = {
  word: '私',
  reading: 'わたくし',
  meanings: ['I', 'myself'],
};
const watashi: IVocabObj = {
  word: '私',
  reading: 'わたし',
  meanings: ['I', 'myself'],
};
const sakana: IVocabObj = { word: '魚', reading: 'さかな', meanings: ['fish'] };

describe('attachAlternateReadings', () => {
  it('collects every reading of the same kanji form', () => {
    const [ikuOut, sakanaOut, yukuOut] = attachAlternateReadings([
      iku,
      sakana,
      yuku,
    ]);

    expect(ikuOut.readings).toEqual(['いく', 'ゆく']);
    expect(yukuOut.readings).toEqual(['いく', 'ゆく']);
    expect(sakanaOut.readings).toBeUndefined();
  });

  it('does not change words with a single reading', () => {
    expect(attachAlternateReadings([sakana])).toEqual([sakana]);
  });
});

describe('isVocabularyReadingAnswerCorrect', () => {
  // #27187: 行く asked with the ゆく entry, learner types いく.
  it('accepts いく for 行く when the ゆく entry is asked (different sets)', () => {
    const [, yukuWithReadings] = attachAlternateReadings([iku, yuku]);

    expect(isVocabularyReadingAnswerCorrect(yukuWithReadings, 'いく')).toBe(
      true,
    );
    expect(isVocabularyReadingAnswerCorrect(yukuWithReadings, 'ゆく')).toBe(
      true,
    );
    expect(isVocabularyReadingAnswerCorrect(yukuWithReadings, 'iku')).toBe(
      true,
    );
  });

  // #27186: 私 (わたくし / わたし) sit in the same set; the first entry is
  // always picked, so わたし used to be rejected.
  it('accepts わたし for 私 using entries from the same set', () => {
    expect(
      isVocabularyReadingAnswerCorrect(watakushi, 'わたし', [
        watakushi,
        watashi,
      ]),
    ).toBe(true);
  });

  it('lists attached readings in data order for the feedback text', () => {
    const [, yukuWithReadings] = attachAlternateReadings([iku, yuku]);

    expect(getAcceptedVocabularyReadings(yukuWithReadings).join(' / ')).toBe(
      'いく / ゆく',
    );
  });

  it('falls back to the pool when readings were not attached (old cache)', () => {
    expect(getAcceptedVocabularyReadings(yuku, [iku, yuku, sakana])).toEqual([
      'ゆく',
      'いく',
    ]);
  });

  it('still rejects readings of a different word', () => {
    const [ikuWithReadings] = attachAlternateReadings([iku, yuku, sakana]);

    expect(isVocabularyReadingAnswerCorrect(ikuWithReadings, 'さかな')).toBe(
      false,
    );
    expect(isVocabularyReadingAnswerCorrect(ikuWithReadings, '')).toBe(false);
  });

  it('keeps accepting katakana and romaji input', () => {
    expect(isVocabularyReadingAnswerCorrect(sakana, 'サカナ')).toBe(true);
    expect(isVocabularyReadingAnswerCorrect(sakana, ' sakana ')).toBe(true);
  });
});

describe('reverse meaning mode', () => {
  it('accepts any attached reading when answering with kana', () => {
    const [, yukuWithReadings] = attachAlternateReadings([iku, yuku]);

    expect(
      isVocabularyMeaningAnswerCorrect(yukuWithReadings, 'いく', true),
    ).toBe(true);
    expect(
      isVocabularyMeaningAnswerCorrect(yukuWithReadings, '行く', true),
    ).toBe(true);
  });
});

describe('vocab data', () => {
  it('N5 data has 行く with both いく and ゆく', () => {
    const raw = JSON.parse(
      readFileSync(
        path.join(process.cwd(), 'public/data-vocab/n5.json'),
        'utf8',
      ),
    ) as { kana: string; kanji: string; waller_definition: string }[];

    const words = attachAlternateReadings(
      raw.map(entry => ({
        word: entry.kanji?.trim() || entry.kana,
        reading: entry.kana.trim(),
        meanings: [entry.waller_definition],
      })),
    );

    const yukuEntry = words.find(
      w => w.word === '行く' && w.reading === 'ゆく',
    );
    expect(yukuEntry?.readings).toEqual(
      expect.arrayContaining(['いく', 'ゆく']),
    );
    expect(isVocabularyReadingAnswerCorrect(yukuEntry!, 'いく')).toBe(true);
  });
});
