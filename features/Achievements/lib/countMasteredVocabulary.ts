interface MasteryScore {
  correct: number;
  incorrect: number;
}

export function countMasteredVocabulary(
  vocabularyMastery: Record<string, MasteryScore> | undefined,
  requiredAccuracy: number,
): number {
  return Object.values(vocabularyMastery ?? {}).filter(score => {
    const total = score.correct + score.incorrect;
    return total > 0 && (score.correct / total) * 100 >= requiredAccuracy;
  }).length;
}
