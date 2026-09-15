/**
 * Drops distractor tiles that read the same as the answer.
 *
 * Hiragana and katakana share their romaji, so when both scripts are in play
 * a romaji prompt like "shu" is answered equally well by しゅ and シュ.
 * Excluding tiles by identity alone leaves the other script on the board as a
 * distractor, and the answer check then has to call one of two correct tiles
 * wrong.
 */
export const getKanaTileDistractorPool = (
  candidates: readonly string[],
  answerReadings: readonly string[],
  readingOf: Readonly<Record<string, string>>,
): string[] => {
  const blocked = new Set(answerReadings);

  return candidates.filter(candidate => !blocked.has(readingOf[candidate]));
};
