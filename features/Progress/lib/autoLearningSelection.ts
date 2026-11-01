export interface AutoLearningSet<T> {
  id: string;
  payload: T;
  mastered: boolean;
}

export interface AutoLearningSelection<T> {
  selected: AutoLearningSet<T>[];
  core: AutoLearningSet<T> | null;
  preview: AutoLearningSet<T> | null;
  reviews: AutoLearningSet<T>[];
  nextReviewCursor: number;
}

const MAX_AUTO_SELECTED_SETS = 3;

export function selectAutoLearningSets<T>(
  orderedSets: AutoLearningSet<T>[],
  reviewCursor: number,
): AutoLearningSelection<T> {
  const coreIndex = orderedSets.findIndex(set => !set.mastered);
  const core = coreIndex >= 0 ? orderedSets[coreIndex] : null;
  const preview =
    coreIndex >= 0
      ? (orderedSets.slice(coreIndex + 1).find(set => !set.mastered) ?? null)
      : null;
  const reviewCandidateIndices = orderedSets
    .map((set, index) => ({ set, index }))
    .filter(({ set, index }) =>
      coreIndex >= 0 ? index < coreIndex && set.mastered : set.mastered,
    );
  const fixedSelection = [core, preview].filter(
    (set): set is AutoLearningSet<T> => set !== null,
  );
  const reviewSlots = Math.min(
    MAX_AUTO_SELECTED_SETS - fixedSelection.length,
    reviewCandidateIndices.length,
  );
  const reviews: AutoLearningSet<T>[] = [];
  let nextReviewCursor = reviewCursor;

  if (reviewSlots > 0 && orderedSets.length > 0) {
    const normalizedCursor =
      ((reviewCursor % orderedSets.length) + orderedSets.length) %
      orderedSets.length;
    const candidatesInRotationOrder = [...reviewCandidateIndices].sort(
      (left, right) =>
        ((left.index - normalizedCursor + orderedSets.length) %
          orderedSets.length) -
        ((right.index - normalizedCursor + orderedSets.length) %
          orderedSets.length),
    );
    const selectedReviews = candidatesInRotationOrder.slice(0, reviewSlots);
    reviews.push(...selectedReviews.map(candidate => candidate.set));

    const lastReview = selectedReviews.at(-1);
    if (lastReview) {
      nextReviewCursor = (lastReview.index + 1) % orderedSets.length;
    }
  }

  return {
    selected: [...fixedSelection, ...reviews],
    core,
    preview,
    reviews,
    nextReviewCursor,
  };
}
