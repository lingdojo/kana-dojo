interface KanaInputAnswerOptions {
  inputValue: string;
  correctChar: string;
  targetChar: string;
  isReverse: boolean;
  altRomanjiMap: Map<string, string[]>;
}

export const isKanaInputAnswerCorrect = ({
  inputValue,
  correctChar,
  targetChar,
  isReverse,
  altRomanjiMap,
}: KanaInputAnswerOptions): boolean => {
  const normalizedInput = inputValue.trim();
  if (!normalizedInput) return false;

  if (isReverse) {
    return normalizedInput === targetChar;
  }

  const lowerInput = normalizedInput.toLowerCase();
  if (lowerInput === targetChar || normalizedInput === correctChar) {
    return true;
  }

  const alternatives = altRomanjiMap.get(correctChar);
  return alternatives
    ? alternatives.some(alt => lowerInput === alt.toLowerCase())
    : false;
};
