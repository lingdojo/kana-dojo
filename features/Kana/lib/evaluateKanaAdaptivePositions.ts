interface EvaluateKanaAdaptivePositionsOptions {
  promptChars: string[];
  answerParts: string[];
  inputValue: string;
  isReverse: boolean;
  altRomanjiMap: Map<string, string[]>;
}

export const evaluateKanaAdaptivePositions = ({
  promptChars,
  answerParts,
  inputValue,
  isReverse,
  altRomanjiMap,
}: EvaluateKanaAdaptivePositionsOptions): boolean[] => {
  const normalizedInput = inputValue.trim();
  const results = promptChars.map(() => false);

  if (!normalizedInput) return results;

  if (isReverse) {
    const expectedChars = answerParts.join('');
    const actualChars = normalizedInput;
    for (let i = 0; i < promptChars.length; i++) {
      const expected = expectedChars[i] ?? '';
      const actual = actualChars[i] ?? '';
      results[i] = expected.length > 0 && expected === actual;
    }
    return results;
  }

  const lowerInput = normalizedInput.toLowerCase();
  let cursor = 0;

  for (let i = 0; i < promptChars.length; i++) {
    const promptChar = promptChars[i];
    const primary = (answerParts[i] ?? '').toLowerCase();
    const alternatives = (altRomanjiMap.get(promptChar) ?? []).map(alt =>
      alt.toLowerCase(),
    );
    const options = Array.from(new Set([primary, ...alternatives]))
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    const remaining = lowerInput.slice(cursor);
    const matched = options.find(option => remaining.startsWith(option));

    if (matched) {
      results[i] = true;
      cursor += matched.length;
      continue;
    }

    results[i] = false;
    cursor += primary.length;
  }

  return results;
};
