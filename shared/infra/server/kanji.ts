import { readFileSync } from 'fs';
import { join } from 'path';

type RawKanjiEntry = {
  kanjiChar: string;
};

let kanjiCharsCache: string[] | null = null;

/**
 * Server-side function to get kanji characters from N5, N4, N3 levels
 * Reads from the file system for optimal performance
 */
export function getKanjiChars(): string[] {
  if (kanjiCharsCache) return kanjiCharsCache;

  const levels = ['N5', 'N4', 'N3'] as const;
  const allKanji: string[] = [];

  for (const level of levels) {
    const kanjiPath = join(
      process.cwd(),
      'public',
      'data-kanji',
      `${level}.json`,
    );
    const kanjiData = readFileSync(kanjiPath, 'utf-8');
    const entries = JSON.parse(kanjiData) as RawKanjiEntry[];
    allKanji.push(...entries.map(entry => entry.kanjiChar));
  }

  kanjiCharsCache = allKanji;
  return allKanji;
}
