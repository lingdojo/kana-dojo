import { readFileSync } from 'fs';
import { join } from 'path';
import { Random } from 'random-js';

let factsCache: string[] | null = null;

/**
 * Server-side function to get all Japan facts
 * Reads from the file system for optimal performance
 */
export function getAllFacts(): string[] {
  if (factsCache) return factsCache;

  const factsPath = join(
    process.cwd(),
    'community',
    'content',
    'japan-facts.json',
  );
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
