/**
 * Selects distinct displayed distractors while excluding the displayed
 * correct answer. Candidate order is preserved so callers can shuffle first.
 */
export const getUniqueIncorrectOptions = (
  correctAnswer: string,
  candidates: readonly string[],
  count: number,
): string[] => {
  const seen = new Set([correctAnswer]);

  // Prevent identical-looking kana (へ/ヘ, べ/ベ, ぺ/ペ) from appearing together
  const markIdenticalTwins = (char: string) => {
    if (char === 'へ') seen.add('ヘ');
    if (char === 'ヘ') seen.add('へ');
    if (char === 'べ') seen.add('ベ');
    if (char === 'ベ') seen.add('べ');
    if (char === 'ぺ') seen.add('ペ');
    if (char === 'ペ') seen.add('ぺ');
  };

  markIdenticalTwins(correctAnswer);

  const options: string[] = [];

  for (const candidate of candidates) {
    if (options.length >= count) break;
    if (seen.has(candidate)) continue;

    markIdenticalTwins(candidate);

    seen.add(candidate);
    options.push(candidate);
  }

  return options;
};
