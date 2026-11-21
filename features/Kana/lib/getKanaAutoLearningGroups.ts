/**
 * Filters the kana auto-learning pool to a single script while keeping the
 * original source indices intact. The handoff stored for /kana/learn and the
 * game state both consume global kana indices, so reindexing filtered groups
 * would break the session selection.
 */
export type KanaScript = 'hiragana' | 'katakana';

export function getKanaAutoLearningGroups<T extends { groupName: string }>(
  groups: T[],
  script: KanaScript,
): Array<{ group: T; index: number }> {
  const prefix = script === 'hiragana' ? 'h.' : 'k.';

  return groups
    .map((group, index) => ({ group, index }))
    .filter(({ group }) => group.groupName.startsWith(prefix));
}

export function normalizeKanaReviewCursor(
  reviewCursor: number,
  setCount: number,
): number {
  if (setCount <= 0) {
    return 0;
  }

  return ((reviewCursor % setCount) + setCount) % setCount;
}
