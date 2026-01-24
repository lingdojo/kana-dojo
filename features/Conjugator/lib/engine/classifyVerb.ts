/**
 * Japanese Verb Classification Engine
 *
 * This module implements verb type detection and stem extraction for Japanese verbs.
 * It handles Godan, Ichidan, and irregular verbs including compound verbs.
 *
 * Requirements: 9.1, 9.2, 2.1-2.8
 */

import type { VerbInfo, VerbType, IrregularType } from '../../types';
import {
  IRREGULAR_VERBS,
  GODAN_ENDINGS,
  GODAN_ENDING_CHARS,
  ICHIDAN_PRECEDING_CHARS,
  FALSE_ICHIDAN_VERBS,
  KNOWN_ICHIDAN_VERBS,
  SURU_COMPOUND_SUFFIXES,
  KURU_COMPOUND_SUFFIXES,
  HIRAGANA_TO_ROMAJI,
  HIRAGANA_COMBINATIONS,
} from '../../data/verbData';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert hiragana string to romaji
 */
export function hiraganaToRomaji(hiragana: string): string {
  let result = '';
  let i = 0;

  while (i < hiragana.length) {
    // Check for small tsu (っ) - doubles the next consonant
    if (hiragana[i] === 'っ' && i + 1 < hiragana.length) {
      const nextChar = hiragana[i + 1];
      // Check for combination first
      if (i + 2 < hiragana.length) {
        const combo = hiragana.slice(i + 1, i + 3);
        if (HIRAGANA_COMBINATIONS[combo]) {
          result += HIRAGANA_COMBINATIONS[combo][0]; // Double the first consonant
          i++;
          continue;
        }
      }
      const nextRomaji = HIRAGANA_TO_ROMAJI[nextChar];
      if (nextRomaji && nextRomaji.length > 0) {
        result += nextRomaji[0]; // Double the first consonant
      }
      i++;
      continue;
    }

    // Check for two-character combinations (きゃ, しゅ, etc.)
    if (i + 1 < hiragana.length) {
      const combo = hiragana.slice(i, i + 2);
      if (HIRAGANA_COMBINATIONS[combo]) {
        result += HIRAGANA_COMBINATIONS[combo];
        i += 2;
        continue;
      }
    }

    // Single character
    const romaji = HIRAGANA_TO_ROMAJI[hiragana[i]];
    if (romaji !== undefined) {
      result += romaji;
    } else {
      // Keep non-hiragana characters as-is (kanji, etc.)
      result += hiragana[i];
    }
    i++;
  }

  return result;
}

/**
 * Check if a character is hiragana
 */
export function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309f;
}

/**
 * Check if a character is katakana
 */
export function isKatakana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x30a0 && code <= 0x30ff;
}

/**
 * Check if a character is kanji
 */
export function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) // CJK Unified Ideographs Extension A
  );
}

/**
 * Check if a string contains only Japanese characters (hiragana, katakana, kanji)
 */
export function isJapanese(str: string): boolean {
  for (const char of str) {
    if (!isHiragana(char) && !isKatakana(char) && !isKanji(char)) {
      return false;
    }
  }
  return str.length > 0;
}

/**
 * Get the last character of a string
 */
function getLastChar(str: string): string {
  return str.slice(-1);
}

/**
 * Get all but the last character of a string
 */
function getStem(str: string): string {
  return str.slice(0, -1);
}

// ============================================================================
// Compound Verb Detection
// ============================================================================

/**
 * Check if a verb is a する-compound verb (e.g., 勉強する)
 * Returns the prefix if it is, null otherwise
 */
export function detectSuruCompound(verb: string): string | null {
  for (const suffix of SURU_COMPOUND_SUFFIXES) {
    if (verb.endsWith(suffix) && verb.length > suffix.length) {
      return verb.slice(0, -suffix.length);
    }
  }
  return null;
}

/**
 * Check if a verb is a 来る-compound verb (e.g., 持ってくる)
 * Returns the prefix if it is, null otherwise
 */
export function detectKuruCompound(verb: string): string | null {
  for (const suffix of KURU_COMPOUND_SUFFIXES) {
    if (verb.endsWith(suffix) && verb.length > suffix.length) {
      return verb.slice(0, -suffix.length);
    }
  }
  return null;
}

// ============================================================================
// Verb Type Detection
// ============================================================================

/**
 * Check if a verb is in the irregular verbs list
 */
function getIrregularType(verb: string): IrregularType | null {
  return IRREGULAR_VERBS[verb] || null;
}

/**
 * Check if a verb looks like an Ichidan verb (ends in -iru or -eru pattern)
 * For kanji verbs, we check if the verb is in the known Ichidan list
 */
function looksLikeIchidan(verb: string): boolean {
  if (verb.length < 2) return false;

  const lastChar = getLastChar(verb);
  if (lastChar !== 'る') return false;

  const secondLastChar = verb.slice(-2, -1);

  // If the second-to-last character is hiragana, check directly
  if (isHiragana(secondLastChar)) {
    return ICHIDAN_PRECEDING_CHARS.includes(secondLastChar);
  }

  // If it's kanji, we can't determine from the form alone
  // Check if it's in our known Ichidan list
  if (KNOWN_ICHIDAN_VERBS.includes(verb)) {
    return true;
  }

  // Check if it's in our known false Ichidan (Godan) list
  if (FALSE_ICHIDAN_VERBS.includes(verb)) {
    return false;
  }

  // For unknown kanji verbs ending in る, default to Godan
  // (safer assumption - user can correct if needed)
  return false;
}

/**
 * Determine if a verb that looks like Ichidan is actually Ichidan or Godan
 */
function isActuallyIchidan(verb: string): boolean {
  // Check if it's a known false Ichidan (actually Godan)
  if (FALSE_ICHIDAN_VERBS.includes(verb)) {
    return false;
  }

  // Check if it's a known Ichidan verb
  if (KNOWN_ICHIDAN_VERBS.includes(verb)) {
    return true;
  }

  // Default heuristic: if it looks like Ichidan and isn't in the false list,
  // assume it's Ichidan (this is the more common case for -iru/-eru verbs)
  return true;
}

/**
 * Check if a verb is a Godan verb
 */
function isGodanVerb(verb: string): boolean {
  const lastChar = getLastChar(verb);
  return GODAN_ENDING_CHARS.includes(lastChar);
}

// ============================================================================
// Main Classification Function
// ============================================================================

/**
 * Classify a Japanese verb and extract its components
 *
 * @param input - The verb in dictionary form (kanji, hiragana, or mixed)
 * @returns VerbInfo object with classification details
 * @throws Error if the input is not a valid Japanese verb
 *
 * Requirements: 9.1, 9.2, 2.1-2.8
 */
export function classifyVerb(input: string): VerbInfo {
  // Validate input
  if (!input || input.trim().length === 0) {
    throw new Error('EMPTY_INPUT: Please enter a Japanese verb');
  }

  const verb = input.trim();

  if (!isJapanese(verb)) {
    throw new Error(
      'INVALID_CHARACTERS: Please enter a valid Japanese verb using hiragana, katakana, or kanji',
    );
  }

  // Check for compound verbs first (Requirements 2.7, 2.8)
  const suruPrefix = detectSuruCompound(verb);
  if (suruPrefix !== null) {
    const suruPart = verb.slice(suruPrefix.length);
    return {
      dictionaryForm: verb,
      reading: verb, // In real implementation, would need kanji->hiragana conversion
      romaji: hiraganaToRomaji(verb),
      type: 'irregular',
      stem: suruPrefix,
      ending: suruPart,
      irregularType: 'suru',
      compoundPrefix: suruPrefix,
    };
  }

  const kuruPrefix = detectKuruCompound(verb);
  if (kuruPrefix !== null) {
    const kuruPart = verb.slice(kuruPrefix.length);
    return {
      dictionaryForm: verb,
      reading: verb,
      romaji: hiraganaToRomaji(verb),
      type: 'irregular',
      stem: kuruPrefix,
      ending: kuruPart,
      irregularType: 'kuru',
      compoundPrefix: kuruPrefix,
    };
  }

  // Check for irregular verbs (Requirements 2.3-2.6)
  const irregularType = getIrregularType(verb);
  if (irregularType !== null) {
    return {
      dictionaryForm: verb,
      reading: verb,
      romaji: hiraganaToRomaji(verb),
      type: 'irregular',
      stem: getStem(verb),
      ending: getLastChar(verb),
      irregularType,
    };
  }

  // Check for Ichidan verbs (Requirements 2.2)
  if (looksLikeIchidan(verb) && isActuallyIchidan(verb)) {
    return {
      dictionaryForm: verb,
      reading: verb,
      romaji: hiraganaToRomaji(verb),
      type: 'ichidan',
      stem: getStem(verb),
      ending: 'る',
    };
  }

  // Check for Godan verbs (Requirements 2.1)
  if (isGodanVerb(verb)) {
    return {
      dictionaryForm: verb,
      reading: verb,
      romaji: hiraganaToRomaji(verb),
      type: 'godan',
      stem: getStem(verb),
      ending: getLastChar(verb),
    };
  }

  // If we can't classify it, throw an error
  throw new Error(
    'UNKNOWN_VERB: This verb is not recognized. Please check the spelling or try the dictionary form',
  );
}

/**
 * Get the Godan conjugation map for a verb ending
 */
export function getGodanMap(
  ending: string,
): (typeof GODAN_ENDINGS)[string] | null {
  return GODAN_ENDINGS[ending] || null;
}
