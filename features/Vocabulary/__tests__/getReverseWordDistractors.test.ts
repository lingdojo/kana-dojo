import { describe, expect, it } from 'vitest';
import type { IVocabObj } from '@/entities/vocabulary';
import { getReverseWordDistractors } from '@/features/Vocabulary/lib/getReverseWordDistractors';

const entry = (word: string, meanings: string[]): IVocabObj =>
  ({ word, reading: word, meanings }) as IVocabObj;

describe('getReverseWordDistractors', () => {
  it('excludes entries sharing the displayed meaning', () => {
    const question = entry('あける', ['to open']);
    const pool = [
      question,
      entry('あく', ['to open']),
      entry('たべる', ['to eat']),
    ];

    expect(getReverseWordDistractors(question, pool)).toEqual(['たべる']);
  });

  it('treats meanings equal after normalization as shared', () => {
    const question = entry('あける', ['to open']);
    const pool = [
      question,
      entry('あく', ['open']),
      entry('はしる', ['to run']),
    ];

    expect(getReverseWordDistractors(question, pool)).toEqual(['はしる']);
  });

  it('keeps unrelated words and always excludes the question word', () => {
    const question = entry('ねこ', ['cat']);
    const pool = [question, entry('いぬ', ['dog']), entry('とり', ['bird'])];

    expect(getReverseWordDistractors(question, pool)).toEqual(['いぬ', 'とり']);
  });

  it('dedupes repeated words', () => {
    const question = entry('ねこ', ['cat']);
    const pool = [question, entry('いぬ', ['dog']), entry('いぬ', ['dog'])];

    expect(getReverseWordDistractors(question, pool)).toEqual(['いぬ']);
  });

  it('returns every other word when the question has no meaning', () => {
    const question = entry('ねこ', []);
    const pool = [question, entry('いぬ', ['dog'])];

    expect(getReverseWordDistractors(question, pool)).toEqual(['いぬ']);
  });

  it('returns an empty list for an empty pool', () => {
    expect(getReverseWordDistractors(entry('ねこ', ['cat']), [])).toEqual([]);
  });

  it('disambiguates transitive/intransitive pairs sharing a meaning', () => {
    // Regression #32148: あく (intransitive) and あける (transitive)
    // share the primary meaning "to open". In reverse Pick mode the
    // prompt shows "to open" either way, so the sibling must not appear
    // as a distractor or the learner has to flip a coin.
    const aku = entry('あく', ['to open', 'to become open']);
    const akeru = entry('あける', ['to open']);
    const pool = [aku, akeru, entry('たべる', ['to eat'])];

    expect(getReverseWordDistractors(aku, pool)).toEqual(['たべる']);
    expect(getReverseWordDistractors(akeru, pool)).toEqual(['たべる']);
  });
});
