/**
 * Compound Verb Conjugation Engine
 *
 * This module handles conjugation for compound verbs:
 * - する-compound verbs (e.g., 勉強する, 運動する)
 * - 来る-compound verbs (e.g., 持ってくる, 帰ってくる)
 *
 * The key requirement is to preserve the prefix while conjugating
 * only the する or 来る portion.
 *
 * Requirements: 2.7, 2.8
 */

import type { VerbInfo, ConjugationForm } from '../../types';
import { conjugateIrregular } from './conjugateIrregular';
import { classifyVerb } from './classifyVerb';

// ============================================================================
// Compound Verb Detection
// ============================================================================

/**
 * Check if a verb is a する-compound verb
 * Returns the prefix if it is, null otherwise
 *
 * Requirements: 2.7
 */
export function isSuruCompound(verb: string): boolean {
  return (
    verb.endsWith('する') && verb.length > 2 && verb !== 'する' // Exclude the base verb itself
  );
}

/**
 * Check if a verb is a 来る-compound verb
 * Returns the prefix if it is, null otherwise
 *
 * Requirements: 2.8
 */
export function isKuruCompound(verb: string): boolean {
  return (
    (verb.endsWith('くる') || verb.endsWith('来る')) &&
    verb.length > 2 &&
    verb !== 'くる' &&
    verb !== '来る' // Exclude the base verb itself
  );
}

/**
 * Extract the prefix from a する-compound verb
 *
 * @param verb - The compound verb (e.g., 勉強する)
 * @returns The prefix (e.g., 勉強)
 */
export function getSuruCompoundPrefix(verb: string): string {
  if (!isSuruCompound(verb)) {
    throw new Error('Not a する-compound verb');
  }
  return verb.slice(0, -2); // Remove する
}

/**
 * Extract the prefix from a 来る-compound verb
 *
 * @param verb - The compound verb (e.g., 持ってくる)
 * @returns The prefix (e.g., 持って)
 */
export function getKuruCompoundPrefix(verb: string): string {
  if (!isKuruCompound(verb)) {
    throw new Error('Not a 来る-compound verb');
  }
  // Handle both くる and 来る endings
  if (verb.endsWith('来る')) {
    return verb.slice(0, -2);
  }
  return verb.slice(0, -2); // Remove くる
}

// ============================================================================
// Compound Verb Conjugation
// ============================================================================

/**
 * Conjugate a compound verb
 *
 * This function handles both する-compound and 来る-compound verbs.
 * It preserves the prefix while conjugating the する or 来る portion.
 *
 * @param verb - The VerbInfo object for a compound verb
 * @returns Array of all conjugated forms with preserved prefix
 *
 * Requirements: 2.7, 2.8
 */
export function conjugateCompound(verb: VerbInfo): ConjugationForm[] {
  // Compound verbs are handled by conjugateIrregular since they're
  // classified as irregular with compoundPrefix set
  if (verb.type !== 'irregular') {
    throw new Error('conjugateCompound called with non-compound verb');
  }

  if (!verb.compoundPrefix) {
    throw new Error('Verb does not have a compound prefix');
  }

  // Delegate to conjugateIrregular which handles the prefix preservation
  return conjugateIrregular(verb);
}

/**
 * Verify that all conjugated forms preserve the compound prefix
 *
 * @param forms - Array of conjugated forms
 * @param prefix - The expected prefix
 * @returns true if all forms preserve the prefix
 */
export function verifyPrefixPreservation(
  forms: ConjugationForm[],
  prefix: string,
): boolean {
  return forms.every(form => {
    // Check if the hiragana form starts with the prefix
    // Note: Some forms like honorific may have お prefix before the compound prefix
    return (
      form.hiragana.includes(prefix) || form.hiragana.startsWith('お' + prefix)
    );
  });
}

// ============================================================================
// Common Compound Verbs
// ============================================================================

/**
 * Common する-compound verbs for reference and testing
 */
export const COMMON_SURU_COMPOUNDS = [
  '勉強する', // benkyou suru - to study
  '運動する', // undou suru - to exercise
  '料理する', // ryouri suru - to cook
  '掃除する', // souji suru - to clean
  '洗濯する', // sentaku suru - to do laundry
  '買い物する', // kaimono suru - to shop
  '散歩する', // sanpo suru - to take a walk
  '旅行する', // ryokou suru - to travel
  '結婚する', // kekkon suru - to marry
  '卒業する', // sotsugyou suru - to graduate
  '入学する', // nyuugaku suru - to enter school
  '出発する', // shuppatsu suru - to depart
  '到着する', // touchaku suru - to arrive
  '説明する', // setsumei suru - to explain
  '質問する', // shitsumon suru - to ask a question
  '回答する', // kaitou suru - to answer
  '練習する', // renshuu suru - to practice
  '準備する', // junbi suru - to prepare
  '心配する', // shinpai suru - to worry
  '安心する', // anshin suru - to feel relieved
];

/**
 * Common 来る-compound verbs for reference and testing
 */
export const COMMON_KURU_COMPOUNDS = [
  '持ってくる', // motte kuru - to bring
  '帰ってくる', // kaette kuru - to come back
  '戻ってくる', // modotte kuru - to return
  '連れてくる', // tsurete kuru - to bring (a person)
  '送ってくる', // okutte kuru - to send (and it comes)
  '飛んでくる', // tonde kuru - to come flying
  '走ってくる', // hashitte kuru - to come running
  '歩いてくる', // aruite kuru - to come walking
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a VerbInfo object for a compound verb
 *
 * @param verb - The compound verb string
 * @returns VerbInfo object with compound prefix set
 */
export function createCompoundVerbInfo(verb: string): VerbInfo {
  return classifyVerb(verb);
}

/**
 * Get all conjugated forms for a compound verb string
 *
 * @param verb - The compound verb string (e.g., 勉強する)
 * @returns Array of all conjugated forms
 */
export function conjugateCompoundVerb(verb: string): ConjugationForm[] {
  const verbInfo = classifyVerb(verb);
  return conjugateCompound(verbInfo);
}
