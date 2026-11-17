const normalizeMeaning = (meaning: string): string =>
  meaning.trim().toLowerCase();

/**
 * Builds a meaning -> Japanese lookup used to resolve legacy mastery keys
 * stored as English meanings. A meaning shared by more than one distinct
 * Japanese item is ambiguous and is intentionally left out, so stats are
 * never credited to the wrong word.
 */
export function buildMeaningToJapaneseMap(
  kanjiObjs: ReadonlyArray<{ kanjiChar: string; meanings: string[] }>,
  vocabObjs: ReadonlyArray<{ word: string; meanings: string[] }>,
): Map<string, string> {
  const map = new Map<string, string>();
  const ambiguous = new Set<string>();

  const register = (japanese: string, meanings: string[]) => {
    meanings.forEach(meaning => {
      const key = normalizeMeaning(meaning);
      if (!key || ambiguous.has(key)) return;

      const existing = map.get(key);
      if (existing === undefined) {
        map.set(key, japanese);
      } else if (existing !== japanese) {
        map.delete(key);
        ambiguous.add(key);
      }
    });
  };

  kanjiObjs.forEach(obj => register(obj.kanjiChar, obj.meanings));
  vocabObjs.forEach(obj => register(obj.word, obj.meanings));

  return map;
}
