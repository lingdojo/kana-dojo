import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { Random } from 'random-js';

let factsCache: string[] | null = null;

function resolveFactsPath(): string {
  const candidates = [
    join(process.cwd(), 'community', 'content', 'japan-facts.json'),
    join(
      process.cwd(),
      'kana-dojo',
      'community',
      'content',
      'japan-facts.json',
    ),
    resolve(__dirname, '../../../community/content/japan-facts.json'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

/**
 * Server-side function to get all Japan facts
 * Reads from the file system for optimal performance
 */
export function getAllFacts(): string[] {
  if (factsCache) return factsCache;

  const factsPath = resolveFactsPath();
  const factsData = readFileSync(factsPath, 'utf-8');
  factsCache = JSON.parse(factsData) as string[];

  return factsCache;
}

/**
 * Server-side function to get a random fact
 * Can be used in Server Components for better performance
 */
export function getRandomFact(): string {
  const facts = getAllFacts();
  const random = new Random();
  const randomIndex = random.integer(0, facts.length - 1);
  return facts[randomIndex];
}
