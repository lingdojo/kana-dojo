/**
 * Cryptographically secure array shuffling utility
 *
 * Uses the Fisher-Yates (Durstenfeld) shuffle algorithm with
 * crypto.getRandomValues() for secure random number generation.
 *
 * This is important for game fairness - predictable shuffles could
 * allow players to anticipate question order.
 */

/**
 * Generate a cryptographically secure random integer in range [0, max)
 */
function secureRandomInt(max: number): number {
  if (max <= 0) return 0;

  // Use crypto.getRandomValues for secure randomness
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);

  // Convert to float in [0, 1) and scale to [0, max)
  return Math.floor((randomBuffer[0] / (0xffffffff + 1)) * max);
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 * with cryptographically secure random numbers.
 *
 * @param array - The array to shuffle (mutates in place)
 * @returns The same array, shuffled
 */
export function shuffleInPlace<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Create a new shuffled copy of an array using Fisher-Yates algorithm
 * with cryptographically secure random numbers.
 *
 * @param array - The array to shuffle (not mutated)
 * @returns A new array with elements in random order
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  return shuffleInPlace(result);
}

/**
 * Pick n random elements from an array
 *
 * @param array - Source array
 * @param n - Number of elements to pick
 * @returns Array of n random elements (or all elements if n >= array.length)
 */
export function pickRandom<T>(array: readonly T[], n: number): T[] {
  if (n >= array.length) {
    return shuffle(array);
  }

  const result: T[] = [];
  const available = [...array];

  for (let i = 0; i < n && available.length > 0; i++) {
    const index = secureRandomInt(available.length);
    result.push(available[index]);
    available.splice(index, 1);
  }

  return result;
}

/**
 * Pick one random element from an array
 *
 * @param array - Source array
 * @returns A random element, or undefined if array is empty
 */
export function pickOne<T>(array: readonly T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[secureRandomInt(array.length)];
}
