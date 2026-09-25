import { describe, expect, it } from 'vitest';
import type { IVocabObj } from '@/entities/vocabulary';
import { isAmbiguousVocabularyOption } from '@/features/Vocabulary/lib/isAmbiguousVocabularyOption';

const hashiru = {
  word: '走る',
  reading: 'はしる',
  meanings: ['to run'],
} as IVocabObj;

const kakeru = {
  word: '駆ける',
  reading: 'かける',
  meanings: ['to run', 'to dash'],
} as IVocabObj;

const taberu = {
  word: '食べる',
  reading: 'たべる',
  meanings: ['to eat'],
} as IVocabObj;

describe('isAmbiguousVocabularyOption', () => {
  it('flags a word sharing the prompted meaning in reverse mode', () => {
    expect(isAmbiguousVocabularyOption(hashiru, kakeru, true)).toBe(true);
  });

  it('flags a meaning that is also a meaning of the prompted word', () => {
    expect(isAmbiguousVocabularyOption(kakeru, hashiru, false)).toBe(true);
  });

  it('uses the same normalization as answer checking', () => {
    const run = { ...taberu, word: '走行', meanings: ['Run'] };

    expect(isAmbiguousVocabularyOption(hashiru, run, false)).toBe(true);
  });

  it.each([true, false])(
    'does not flag an unrelated word (isReverse: %s)',
    isReverse => {
      expect(isAmbiguousVocabularyOption(hashiru, taberu, isReverse)).toBe(
        false,
      );
    },
  );
});
