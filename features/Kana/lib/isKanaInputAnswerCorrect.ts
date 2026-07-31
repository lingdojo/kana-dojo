interface KanaInputAnswerOptions {
  inputValue: string;
  correctChar: string;
  targetChar: string;
  isReverse: boolean;
  altRomanjiMap: Map<string, string[]>;
  /**
   * The individual kana parts that make up the prompt (e.g. ['し', 'ぶ']).
   * Required for correct alternative-romanji lookup on multi-character prompts.
   * When omitted the function falls back to the legacy single-key lookup.
   */
  promptParts?: string[];
  /**
   * The primary romaji for each prompt part in the same order as promptParts
   * (e.g. ['shi', 'bu']). Required alongside promptParts.
   */
  answerParts?: string[];
}

/**
 * Builds every valid romaji string for a multi-character prompt by substituting
 * alternative romanisations for any part that has them.
 *
 * Example: ['し', 'ぶ'], ['shi', 'bu'], { し → ['si'] }
 * → ['shibu', 'sibu']
 */
function buildAltCombinations(
  parts: string[],
  primaryAnswers: string[],
  altMap: Map<string, string[]>,
): string[] {
  if (parts.length === 0) return [''];
  const [firstPart, ...restParts] = parts;
  const [firstAnswer, ...restAnswers] = primaryAnswers;
  const options = [firstAnswer, ...(altMap.get(firstPart) ?? [])];
  const suffixes = buildAltCombinations(restParts, restAnswers, altMap);
  return options.flatMap(opt => suffixes.map(suf => opt + suf));
}

export const isKanaInputAnswerCorrect = ({
  inputValue,
  correctChar,
  targetChar,
  isReverse,
  altRomanjiMap,
  promptParts,
  answerParts,
}: KanaInputAnswerOptions): boolean => {
  // Normalize Unicode form and strip ALL whitespace so that input
  // from an IME, copy-paste, or with intentional spaces (e.g. "chi te")
  // is compared on equal footing with the stored answer.
  const normalizedInput = inputValue.replace(/\s+/g, '').normalize('NFC');
  if (!normalizedInput) return false;

  if (isReverse) {
    // Reverse mode: user types the kana character itself.
    return normalizedInput === targetChar.replace(/\s+/g, '').normalize('NFC');
  }

  // Normal mode: user types romaji. Compare case- and Unicode-insensitively.
  const lowerInput = normalizedInput.toLowerCase();
  const lowerTarget = targetChar.toLowerCase().normalize('NFC');

  if (lowerInput === lowerTarget) {
    return true;
  }

  // Check alternative romanisations.
  // For multi-character prompts the altRomanjiMap is keyed by individual kana
  // (e.g. 'し' → ['si']), so looking up the joined correctChar (e.g. 'しぶ')
  // always returns undefined and valid alternatives are silently rejected.
  // When promptParts and answerParts are provided, build every valid full-string
  // combination so alternatives work correctly regardless of prompt length.
  if (
    promptParts &&
    answerParts &&
    promptParts.length > 0 &&
    promptParts.length === answerParts.length
  ) {
    const validAnswers = buildAltCombinations(promptParts, answerParts, altRomanjiMap);
    return validAnswers.some(
      ans => lowerInput === ans.toLowerCase().normalize('NFC'),
    );
  }

  // Legacy single-character fallback (promptParts not provided).
  const alternatives = altRomanjiMap.get(correctChar);
  return alternatives
    ? alternatives.some(alt => lowerInput === alt.toLowerCase().normalize('NFC'))
    : false;
};
