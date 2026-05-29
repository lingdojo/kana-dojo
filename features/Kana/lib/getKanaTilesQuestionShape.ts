const getPreferredTileCount = (wordLength: number): number => {
  if (wordLength <= 1) return 3;
  if (wordLength === 2) return 4;
  return 5;
};

export const getKanaTilesQuestionShape = ({
  wordLength,
  availableCharacterCount,
}: {
  wordLength: number;
  availableCharacterCount: number;
}): { canGenerate: boolean; tileCount: number } => {
  const normalizedWordLength = Math.max(1, Math.floor(wordLength));
  const normalizedAvailableCount = Math.max(
    0,
    Math.floor(availableCharacterCount),
  );

  if (normalizedAvailableCount < normalizedWordLength) {
    return { canGenerate: false, tileCount: 0 };
  }

  return {
    canGenerate: true,
    tileCount: Math.min(
      getPreferredTileCount(normalizedWordLength),
      normalizedAvailableCount,
    ),
  };
};
