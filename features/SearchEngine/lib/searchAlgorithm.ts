export function calculateStringMatchScore(
  query: string,
  target: string,
): number {
  if (!query || !target) return 0;

  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (q === t) return 100; // Exact match
  if (t.startsWith(q)) return 80; // Prefix match

  // Word boundary match (e.g., "sun" matches "the sun")
  const words = t.split(/\s+/);
  if (words.some(w => w === q)) return 70;
  if (words.some(w => w.startsWith(q))) return 50;

  if (t.includes(q)) return 30; // Substring match

  return 0; // No match
}

// Simple Romaji to Kana fallback if `wanakana` is not used in the core algorithm,
// but since wanakana is in package.json, we could use it.
// To keep it simple and zero-dep in this file, we will just rely on the dictionarySearch
// to pass the correct target string (e.g. passing the romaji version of onyomi).
