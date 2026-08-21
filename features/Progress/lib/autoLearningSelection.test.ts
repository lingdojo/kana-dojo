import { describe, expect, it } from 'vitest';

import { selectAutoLearningSets } from './autoLearningSelection';

const createSets = (mastered: boolean[]) =>
  mastered.map((isMastered, index) => ({
    id: `set-${index + 1}`,
    payload: index + 1,
    mastered: isMastered,
  }));

describe('selectAutoLearningSets', () => {
  it('starts with the first two unmastered sets when there is no review', () => {
    const result = selectAutoLearningSets(createSets([false, false, false]), 0);

    expect(result.selected.map(set => set.payload)).toEqual([1, 2]);
    expect(result.reviews).toEqual([]);
    expect(result.nextReviewCursor).toBe(0);
  });

  it('selects core, the next unmastered preview, and a prior mastered review', () => {
    const result = selectAutoLearningSets(
      createSets([true, true, false, true, false]),
      0,
    );

    expect(result.core?.payload).toBe(3);
    expect(result.preview?.payload).toBe(5);
    expect(result.reviews.map(set => set.payload)).toEqual([1]);
    expect(result.selected.map(set => set.payload)).toEqual([3, 5, 1]);
    expect(result.nextReviewCursor).toBe(1);
  });

  it('fills a missing preview slot with a second review', () => {
    const result = selectAutoLearningSets(
      createSets([true, true, true, false]),
      0,
    );

    expect(result.selected.map(set => set.payload)).toEqual([4, 1, 2]);
    expect(result.nextReviewCursor).toBe(2);
  });

  it('rotates three reviews after full mastery and wraps without duplicates', () => {
    const result = selectAutoLearningSets(
      createSets([true, true, true, true]),
      3,
    );

    expect(result.selected.map(set => set.payload)).toEqual([4, 1, 2]);
    expect(result.nextReviewCursor).toBe(2);
  });

  it('returns each available review at most once', () => {
    const result = selectAutoLearningSets(createSets([true, true]), 7);

    expect(result.selected.map(set => set.payload)).toEqual([2, 1]);
    expect(new Set(result.selected.map(set => set.id)).size).toBe(2);
  });
});
