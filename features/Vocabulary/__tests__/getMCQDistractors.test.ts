import { describe, expect, it } from 'vitest';
import type { IVocabObj } from '@/entities/vocabulary';
import { getMCQDistractors } from '@/features/Vocabulary/lib/getMCQDistractors';

// ---------------------------------------------------------------------------
// Shared fixtures – mirror the real n5.json entries that triggered issue #32148
// ---------------------------------------------------------------------------
const aku: IVocabObj = {
  word: '開く',
  reading: 'あく',
  meanings: ['to open', 'to become open'],
};
const akeru: IVocabObj = {
  word: '開ける',
  reading: 'あける',
  meanings: ['to open'],
};
const ageru: IVocabObj = {
  word: '上げる',
  reading: 'あげる',
  meanings: ['to give'],
};
const miru: IVocabObj = {
  word: '見る',
  reading: 'みる',
  meanings: ['to see'],
};

const pool = [aku, akeru, ageru, miru];

// ---------------------------------------------------------------------------
// Regression test for issue #32148
// ---------------------------------------------------------------------------
describe('getMCQDistractors — duplicate-distractor guard (issue #32148)', () => {
  it('excludes a distractor whose meaning[0] equals the correct answer', () => {
    // correctWord = 開ける, targetValue = "to open"
    // Without the fix, 開く would appear as a distractor (also "to open").
    const distractors = getMCQDistractors(
      pool,
      '開ける',
      'to open',
      'meaning',
      false,
    );

    expect(distractors).not.toContain('to open');
  });

  it('still returns valid non-colliding distractors', () => {
    const distractors = getMCQDistractors(
      pool,
      '開ける',
      'to open',
      'meaning',
      false,
    );

    expect(distractors).toContain('to give');
  });

  it('works symmetrically when 開く is the correct word', () => {
    // correctWord = 開く, targetValue = "to open"
    // 開ける should also be excluded because its meanings[0] is "to open".
    const distractors = getMCQDistractors(
      pool,
      '開く',
      'to open',
      'meaning',
      false,
    );

    expect(distractors).not.toContain('to open');
  });
});

// ---------------------------------------------------------------------------
// Normal-mode meaning quiz
// ---------------------------------------------------------------------------
describe('getMCQDistractors — meaning quiz (normal mode)', () => {
  it('returns up to `limit` distractors that differ from targetValue', () => {
    const distractors = getMCQDistractors(
      pool,
      '上げる',
      'to give',
      'meaning',
      false,
    );

    expect(distractors.length).toBeLessThanOrEqual(2);
    expect(distractors).not.toContain('to give');
  });

  it('maps candidates to meanings[0]', () => {
    // correct = 見る (to see), so pool without 見る = [開く, 開ける, 上げる]
    // meanings[0] values: "to open", "to open", "to give"
    // "to open" === targetValue "to see" → false, so both included before dedup
    const distractors = getMCQDistractors(
      pool,
      '見る',
      'to see',
      'meaning',
      false,
    );

    // All three remaining words have meanings[0] != "to see", but limit = 2
    expect(distractors.length).toBe(2);
    expect(distractors).not.toContain('to see');
  });
});

// ---------------------------------------------------------------------------
// Reverse mode (show meaning, pick Japanese word)
// ---------------------------------------------------------------------------
describe('getMCQDistractors — meaning quiz (reverse mode)', () => {
  it('maps candidates to obj.word in reverse mode', () => {
    // correct = 開ける, show meaning "to open", pick the word
    // targetValue = "開ける"
    // others: 開く → "開く", 上げる → "上げる", 見る → "見る"
    const distractors = getMCQDistractors(
      pool,
      '開ける',
      '開ける',
      'meaning',
      true,
    );

    expect(distractors).not.toContain('開ける');
    distractors.forEach(d => expect(typeof d).toBe('string'));
  });
});

// ---------------------------------------------------------------------------
// Reading quiz
// ---------------------------------------------------------------------------
describe('getMCQDistractors — reading quiz', () => {
  it('maps candidates to obj.reading', () => {
    // correct = 開ける (あける), targetValue = "あける"
    const distractors = getMCQDistractors(
      pool,
      '開ける',
      'あける',
      'reading',
      false,
    );

    expect(distractors).not.toContain('あける');
    expect(distractors.length).toBeGreaterThan(0);
  });

  it('excludes a reading distractor that equals targetValue', () => {
    // Simulate two words with the same reading (edge case)
    const twin: IVocabObj = {
      word: '明ける',
      reading: 'あける', // same kana as 開ける
      meanings: ['to end (the night)'],
    };
    const smallPool = [akeru, twin, ageru];

    const distractors = getMCQDistractors(
      smallPool,
      '開ける',
      'あける',
      'reading',
      false,
    );

    expect(distractors).not.toContain('あける');
    // Only 上げる → あげる is left
    expect(distractors).toContain('あげる');
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('getMCQDistractors — edge cases', () => {
  it('returns an empty array when no non-colliding distractors exist', () => {
    // Only two words in pool, and they share a meaning
    const tinyPool = [akeru, aku];
    const distractors = getMCQDistractors(
      tinyPool,
      '開ける',
      'to open',
      'meaning',
      false,
    );

    expect(distractors).toHaveLength(0);
  });

  it('respects the limit parameter', () => {
    const distractors = getMCQDistractors(
      pool,
      '上げる',
      'to give',
      'meaning',
      false,
      1,
    );

    expect(distractors.length).toBeLessThanOrEqual(1);
  });

  it('deduplicates distractors from each other when pool contains multiple words sharing a meaning', () => {
    // Target is 見る ("to see")
    // Pool contains BOTH 開く ("to open") and 開ける ("to open")
    // Distractors must NOT contain duplicate "to open"
    const distractors = getMCQDistractors(
      pool,
      '見る',
      'to see',
      'meaning',
      false,
      3,
    );

    const openCount = distractors.filter(d => d === 'to open').length;
    expect(openCount).toBe(1);
    expect(new Set(distractors).size).toBe(distractors.length);
  });

  it('safely handles empty or missing meanings without leaking undefined', () => {
    const emptyMeaningWord: IVocabObj = {
      word: '謎',
      reading: 'なぞ',
      meanings: [],
    };
    const poolWithEmpty = [akeru, emptyMeaningWord, ageru];
    const distractors = getMCQDistractors(
      poolWithEmpty,
      '開ける',
      'to open',
      'meaning',
      false,
    );

    expect(distractors).not.toContain(undefined);
    expect(distractors).not.toContain('');
    expect(distractors).toEqual(['to give']);
  });

  it('returns fewer than limit distractors when pool has only one valid candidate', () => {
    // Only 開ける ("to open") and 上げる ("to give")
    // Quizzing 開ける ("to open") leaves only 上げる ("to give")
    const smallPool = [akeru, ageru];
    const distractors = getMCQDistractors(
      smallPool,
      '開ける',
      'to open',
      'meaning',
      false,
      2,
    );

    expect(distractors).toHaveLength(1);
    expect(distractors).toEqual(['to give']);
  });

  it('returns an empty array for unknown quizType', () => {
    // @ts-expect-error Testing runtime fallback for unexpected quizType
    const distractors = getMCQDistractors(
      pool,
      '開ける',
      'to open',
      'unknown',
      false,
    );

    expect(distractors).toEqual([]);
  });
});
