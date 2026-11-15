/**
 * Kanji readings are stored as "<romaji> <kana>", with okurigana in
 * parentheses, prefix/suffix hyphens and sometimes dots, e.g.
 * "mana(bu) まな(ぶ)", "-bi -び" or "kaku か.く". Players type the plain
 * reading ("manabu" or "まなぶ"), so every accepted spelling is listed here.
 */
export const getReadingAnswerForms = (reading: string): string[] => {
  const tokens = reading.trim().split(/\s+/).filter(Boolean);
  const forms = new Set<string>();

  tokens.forEach((token, index) => {
    // Keep the stored romaji spelling so existing answers stay valid.
    if (index === 0) forms.add(token);

    const plain = token.replace(/[().\-]/g, '');
    if (plain) forms.add(plain);
  });

  return [...forms];
};

/**
 * Answers accepted in Classic Input (non-reverse): any meaning, or any
 * reading in one of its typeable forms.
 */
export const getKanjiClassicInputTargets = (
  kanji:
    | { meanings?: string[]; kunyomi?: string[]; onyomi?: string[] }
    | undefined,
): string[] => [
  ...(kanji?.meanings ?? []),
  ...(kanji?.kunyomi?.flatMap(getReadingAnswerForms) ?? []),
  ...(kanji?.onyomi?.flatMap(getReadingAnswerForms) ?? []),
];
