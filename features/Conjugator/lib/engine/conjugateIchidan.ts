/**
 * Ichidan Verb Conjugation Engine
 *
 * This module implements conjugation for Ichidan (一段) verbs, also known as ru-verbs.
 * Ichidan verbs conjugate by removing the final る and adding the appropriate suffix.
 *
 * Requirements: 2.2, 4.9
 */

import type { VerbInfo, ConjugationForm } from '../../types';
import { CONJUGATION_FORMS } from '../../data/conjugationForms';
import { hiraganaToRomaji } from './classifyVerb';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the stem of an Ichidan verb (remove final る)
 *
 * @param verb - The VerbInfo object
 * @returns The stem without the final る
 */
export function getIchidanStem(verb: VerbInfo): string {
  return verb.stem;
}

/**
 * Create a ConjugationForm object
 */
function createForm(
  id: string,
  hiragana: string,
  kanji: string = hiragana,
): ConjugationForm {
  const formDef = CONJUGATION_FORMS.find(f => f.id === id);
  if (!formDef) {
    throw new Error(`Unknown form ID: ${id}`);
  }

  return {
    id,
    name: formDef.name,
    nameJapanese: formDef.nameJa,
    kanji,
    hiragana,
    romaji: hiraganaToRomaji(hiragana),
    formality: formDef.formality,
    category: formDef.category,
  };
}

// ============================================================================
// Main Conjugation Function
// ============================================================================

/**
 * Conjugate an Ichidan verb to all forms
 *
 * @param verb - The VerbInfo object for an Ichidan verb
 * @returns Array of all conjugated forms
 *
 * Requirements: 2.2, 4.9
 */
export function conjugateIchidan(verb: VerbInfo): ConjugationForm[] {
  if (verb.type !== 'ichidan') {
    throw new Error('conjugateIchidan called with non-Ichidan verb');
  }

  const forms: ConjugationForm[] = [];
  const stem = getIchidanStem(verb);

  // ============================================================================
  // Basic Forms (Requirements: 3.1)
  // ============================================================================

  // Dictionary form
  forms.push(createForm('dictionary', verb.dictionaryForm));

  // Te-form (stem + て)
  forms.push(createForm('te', stem + 'て'));

  // ============================================================================
  // Polite Forms (Requirements: 3.2)
  // ============================================================================

  // Masu form (stem + ます)
  forms.push(createForm('masu', stem + 'ます'));

  // Masen (stem + ません)
  forms.push(createForm('masen', stem + 'ません'));

  // Mashita (stem + ました)
  forms.push(createForm('mashita', stem + 'ました'));

  // Masen deshita (stem + ませんでした)
  forms.push(createForm('masen-deshita', stem + 'ませんでした'));

  // ============================================================================
  // Negative Forms (Requirements: 3.1)
  // ============================================================================

  // Nai form (stem + ない)
  forms.push(createForm('nai', stem + 'ない'));

  // Nakatta form (stem + なかった)
  forms.push(createForm('nakatta', stem + 'なかった'));

  // ============================================================================
  // Past Forms (Requirements: 3.1)
  // ============================================================================

  // Ta form (stem + た)
  forms.push(createForm('ta', stem + 'た'));

  // ============================================================================
  // Volitional Forms (Requirements: 3.3)
  // ============================================================================

  // Plain volitional (stem + よう)
  forms.push(createForm('volitional-plain', stem + 'よう'));

  // Polite volitional (stem + ましょう)
  forms.push(createForm('volitional-polite', stem + 'ましょう'));

  // ============================================================================
  // Potential Forms (Requirements: 3.4, 4.9)
  // Both traditional (-られる) and colloquial (-れる) forms
  // ============================================================================

  // Plain potential - traditional form (stem + られる)
  // Note: We include both forms as per Requirements 4.9
  // The primary form is the traditional -られる
  forms.push(createForm('potential-plain', stem + 'られる'));

  // Polite potential (stem + られます)
  forms.push(createForm('potential-polite', stem + 'られます'));

  // Negative potential (stem + られない)
  forms.push(createForm('potential-negative', stem + 'られない'));

  // ============================================================================
  // Passive Forms (Requirements: 3.5)
  // ============================================================================

  // Plain passive (stem + られる)
  forms.push(createForm('passive-plain', stem + 'られる'));

  // Polite passive (stem + られます)
  forms.push(createForm('passive-polite', stem + 'られます'));

  // ============================================================================
  // Causative Forms (Requirements: 3.6)
  // ============================================================================

  // Plain causative (stem + させる)
  forms.push(createForm('causative-plain', stem + 'させる'));

  // Polite causative (stem + させます)
  forms.push(createForm('causative-polite', stem + 'させます'));

  // ============================================================================
  // Causative-Passive Forms (Requirements: 3.7)
  // ============================================================================

  // Plain causative-passive (stem + させられる)
  forms.push(createForm('causative-passive-plain', stem + 'させられる'));

  // Polite causative-passive (stem + させられます)
  forms.push(createForm('causative-passive-polite', stem + 'させられます'));

  // ============================================================================
  // Imperative Forms (Requirements: 3.8)
  // ============================================================================

  // Plain imperative (stem + ろ or stem + よ)
  // Most common is ろ for Ichidan verbs
  forms.push(createForm('imperative-plain', stem + 'ろ'));

  // Polite imperative (te-form + ください)
  forms.push(createForm('imperative-polite', stem + 'てください'));

  // Negative imperative (dictionary + な)
  forms.push(createForm('imperative-negative', verb.dictionaryForm + 'な'));

  // ============================================================================
  // Conditional Forms (Requirements: 3.9, 3.10)
  // ============================================================================

  // Ba form (stem + れば)
  forms.push(createForm('conditional-ba', stem + 'れば'));

  // Tara form (ta-form + ら = stem + たら)
  forms.push(createForm('conditional-tara', stem + 'たら'));

  // Nara form (dictionary + なら)
  forms.push(createForm('conditional-nara', verb.dictionaryForm + 'なら'));

  // ============================================================================
  // Tai-form (Requirements: 3.11)
  // ============================================================================

  // Tai (stem + たい)
  forms.push(createForm('tai', stem + 'たい'));

  // Takunai (stem + たくない)
  forms.push(createForm('takunai', stem + 'たくない'));

  // Takatta (stem + たかった)
  forms.push(createForm('takatta', stem + 'たかった'));

  // Takunakatta (stem + たくなかった)
  forms.push(createForm('takunakatta', stem + 'たくなかった'));

  // ============================================================================
  // Progressive Forms (Requirements: 3.12)
  // ============================================================================

  // Te-iru (te-form + いる = stem + ている)
  forms.push(createForm('progressive-present', stem + 'ている'));

  // Te-ita (te-form + いた = stem + ていた)
  forms.push(createForm('progressive-past', stem + 'ていた'));

  // ============================================================================
  // Honorific Forms (Requirements: 3.13)
  // ============================================================================

  // Respectful (お + stem + になる)
  forms.push(createForm('honorific-respectful', 'お' + stem + 'になる'));

  // Humble (お + stem + する)
  forms.push(createForm('honorific-humble', 'お' + stem + 'する'));

  return forms;
}

// ============================================================================
// Colloquial Potential Form Helper
// ============================================================================

/**
 * Get the colloquial potential form for an Ichidan verb
 * This is the shortened -れる form instead of -られる
 *
 * Requirements: 4.9
 *
 * @param verb - The VerbInfo object for an Ichidan verb
 * @returns The colloquial potential form (stem + れる)
 */
export function getIchidanColloquialPotential(verb: VerbInfo): string {
  if (verb.type !== 'ichidan') {
    throw new Error(
      'getIchidanColloquialPotential called with non-Ichidan verb',
    );
  }
  return verb.stem + 'れる';
}

/**
 * Get the traditional potential form for an Ichidan verb
 *
 * Requirements: 4.9
 *
 * @param verb - The VerbInfo object for an Ichidan verb
 * @returns The traditional potential form (stem + られる)
 */
export function getIchidanTraditionalPotential(verb: VerbInfo): string {
  if (verb.type !== 'ichidan') {
    throw new Error(
      'getIchidanTraditionalPotential called with non-Ichidan verb',
    );
  }
  return verb.stem + 'られる';
}

/**
 * Check if a potential form is the colloquial variant
 *
 * @param potentialForm - The potential form to check
 * @param stem - The verb stem
 * @returns true if it's the colloquial form (れる), false if traditional (られる)
 */
export function isColloquialPotential(
  potentialForm: string,
  stem: string,
): boolean {
  // Colloquial: stem + れる
  // Traditional: stem + られる
  const colloquialEnding = stem + 'れる';
  const traditionalEnding = stem + 'られる';

  if (potentialForm === colloquialEnding) {
    return true;
  }
  if (potentialForm === traditionalEnding) {
    return false;
  }

  // Check by ending pattern
  return potentialForm.endsWith('れる') && !potentialForm.endsWith('られる');
}
