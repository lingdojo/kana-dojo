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
  const options: string[] = [];

  for (const candidate of candidates) {
    if (options.length >= count) break;
    if (seen.has(candidate)) continue;

    seen.add(candidate);
    options.push(candidate);
  }

  return options;
};
