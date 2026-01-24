/**
 * Godan Verb Conjugation Engine
 *
 * This module implements conjugation for Godan (五段) verbs, also known as u-verbs.
 * Godan verbs conjugate across five vowel sounds (a, i, u, e, o).
 *
 * Requirements: 2.1, 4.1-4.6
 */

import type { VerbInfo, ConjugationForm } from '../../types';
import { GODAN_ENDINGS } from '../../data/verbData';
import { CONJUGATION_FORMS } from '../../data/conjugationForms';
import { hiraganaToRomaji } from './classifyVerb';

// ============================================================================
// Types
// ============================================================================

/**
 * Godan stem grades for conjugation
 */
export type GodanGrade = 'a' | 'i' | 'u' | 'e' | 'o' | 'te' | 'ta';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the stem with a specific vowel grade for a Godan verb
 *
 * @param verb - The VerbInfo object
 * @param grade - The vowel grade to use
 * @returns The stem with the appropriate ending
 */
export function getGodanStem(verb: VerbInfo, grade: GodanGrade): string {
  const endingMap = GODAN_ENDINGS[verb.ending];
  if (!endingMap) {
    throw new Error(`Unknown Godan ending: ${verb.ending}`);
  }

  // For 'u' grade, return the dictionary form
  if (grade === 'u') {
    return verb.dictionaryForm;
  }

  // For te/ta forms, return stem + te/ta ending
  if (grade === 'te' || grade === 'ta') {
    return verb.stem + endingMap[grade];
  }

  // For vowel grades, return stem + vowel-grade ending
  return verb.stem + endingMap[grade];
}

/**
 * Special handling for 行く (iku) te-form
 * 行く is irregular: te-form is 行って (not 行いて)
 *
 * Requirements: 4.4
 */
function isIkuVerb(verb: VerbInfo): boolean {
  return (
    verb.dictionaryForm === '行く' ||
    verb.dictionaryForm === 'いく' ||
    (verb.irregularType === 'iku' && verb.type === 'irregular')
  );
}

/**
 * Get te-form for a Godan verb with proper sound changes
 *
 * Requirements: 4.1-4.6
 * - う/つ/る → って
 * - む/ぶ/ぬ → んで
 * - く → いて (except 行く → 行って)
 * - ぐ → いで
 * - す → して
 */
export function getGodanTeForm(verb: VerbInfo): string {
  // Special case for 行く
  if (isIkuVerb(verb)) {
    return verb.stem + 'って';
  }

  return getGodanStem(verb, 'te');
}

/**
 * Get ta-form (past) for a Godan verb with proper sound changes
 * Same rules as te-form but with た/だ instead of て/で
 */
export function getGodanTaForm(verb: VerbInfo): string {
  // Special case for 行く
  if (isIkuVerb(verb)) {
    return verb.stem + 'った';
  }

  return getGodanStem(verb, 'ta');
}

// ============================================================================
// Form Generation Functions
// ============================================================================

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
 * Conjugate a Godan verb to all forms
 *
 * @param verb - The VerbInfo object for a Godan verb
 * @returns Array of all conjugated forms
 *
 * Requirements: 2.1, 4.1-4.6
 */
export function conjugateGodan(verb: VerbInfo): ConjugationForm[] {
  if (verb.type !== 'godan') {
    throw new Error('conjugateGodan called with non-Godan verb');
  }

  const forms: ConjugationForm[] = [];

  // ============================================================================
  // Basic Forms (Requirements: 3.1)
  // ============================================================================

  // Dictionary form (u-grade)
  forms.push(createForm('dictionary', verb.dictionaryForm));

  // Te-form (Requirements: 4.1-4.6)
  forms.push(createForm('te', getGodanTeForm(verb)));

  // ============================================================================
  // Polite Forms (Requirements: 3.2)
  // ============================================================================

  // Masu form (i-grade + ます)
  const masuStem = getGodanStem(verb, 'i');
  forms.push(createForm('masu', masuStem + 'ます'));

  // Masen (i-grade + ません)
  forms.push(createForm('masen', masuStem + 'ません'));

  // Mashita (i-grade + ました)
  forms.push(createForm('mashita', masuStem + 'ました'));

  // Masen deshita (i-grade + ませんでした)
  forms.push(createForm('masen-deshita', masuStem + 'ませんでした'));

  // ============================================================================
  // Negative Forms (Requirements: 3.1)
  // ============================================================================

  // Nai form (a-grade + ない)
  const naiStem = getGodanStem(verb, 'a');
  forms.push(createForm('nai', naiStem + 'ない'));

  // Nakatta form (a-grade + なかった)
  forms.push(createForm('nakatta', naiStem + 'なかった'));

  // ============================================================================
  // Past Forms (Requirements: 3.1)
  // ============================================================================

  // Ta form
  forms.push(createForm('ta', getGodanTaForm(verb)));

  // ============================================================================
  // Volitional Forms (Requirements: 3.3)
  // ============================================================================

  // Plain volitional (o-grade + う)
  const volitionalStem = getGodanStem(verb, 'o');
  forms.push(createForm('volitional-plain', volitionalStem + 'う'));

  // Polite volitional (i-grade + ましょう)
  forms.push(createForm('volitional-polite', masuStem + 'ましょう'));

  // ============================================================================
  // Potential Forms (Requirements: 3.4)
  // ============================================================================

  // Plain potential (e-grade + る)
  const potentialStem = getGodanStem(verb, 'e');
  forms.push(createForm('potential-plain', potentialStem + 'る'));

  // Polite potential (e-grade + ます)
  forms.push(createForm('potential-polite', potentialStem + 'ます'));

  // Negative potential (e-grade + ない)
  forms.push(createForm('potential-negative', potentialStem + 'ない'));

  // ============================================================================
  // Passive Forms (Requirements: 3.5)
  // ============================================================================

  // Plain passive (a-grade + れる)
  forms.push(createForm('passive-plain', naiStem + 'れる'));

  // Polite passive (a-grade + れます)
  forms.push(createForm('passive-polite', naiStem + 'れます'));

  // ============================================================================
  // Causative Forms (Requirements: 3.6)
  // ============================================================================

  // Plain causative (a-grade + せる)
  forms.push(createForm('causative-plain', naiStem + 'せる'));

  // Polite causative (a-grade + せます)
  forms.push(createForm('causative-polite', naiStem + 'せます'));

  // ============================================================================
  // Causative-Passive Forms (Requirements: 3.7)
  // ============================================================================

  // Plain causative-passive (a-grade + せられる)
  forms.push(createForm('causative-passive-plain', naiStem + 'せられる'));

  // Polite causative-passive (a-grade + せられます)
  forms.push(createForm('causative-passive-polite', naiStem + 'せられます'));

  // ============================================================================
  // Imperative Forms (Requirements: 3.8)
  // ============================================================================

  // Plain imperative (e-grade)
  forms.push(createForm('imperative-plain', potentialStem));

  // Polite imperative (te-form + ください)
  forms.push(
    createForm('imperative-polite', getGodanTeForm(verb) + 'ください'),
  );

  // Negative imperative (dictionary + な)
  forms.push(createForm('imperative-negative', verb.dictionaryForm + 'な'));

  // ============================================================================
  // Conditional Forms (Requirements: 3.9, 3.10)
  // ============================================================================

  // Ba form (e-grade + ば)
  forms.push(createForm('conditional-ba', potentialStem + 'ば'));

  // Tara form (ta-form + ら)
  forms.push(createForm('conditional-tara', getGodanTaForm(verb) + 'ら'));

  // Nara form (dictionary + なら)
  forms.push(createForm('conditional-nara', verb.dictionaryForm + 'なら'));

  // ============================================================================
  // Tai-form (Requirements: 3.11)
  // ============================================================================

  // Tai (i-grade + たい)
  forms.push(createForm('tai', masuStem + 'たい'));

  // Takunai (i-grade + たくない)
  forms.push(createForm('takunai', masuStem + 'たくない'));

  // Takatta (i-grade + たかった)
  forms.push(createForm('takatta', masuStem + 'たかった'));

  // Takunakatta (i-grade + たくなかった)
  forms.push(createForm('takunakatta', masuStem + 'たくなかった'));

  // ============================================================================
  // Progressive Forms (Requirements: 3.12)
  // ============================================================================

  // Te-iru (te-form + いる)
  forms.push(createForm('progressive-present', getGodanTeForm(verb) + 'いる'));

  // Te-ita (te-form + いた)
  forms.push(createForm('progressive-past', getGodanTeForm(verb) + 'いた'));

  // ============================================================================
  // Honorific Forms (Requirements: 3.13)
  // ============================================================================

  // Respectful (お + i-grade + になる)
  forms.push(createForm('honorific-respectful', 'お' + masuStem + 'になる'));

  // Humble (お + i-grade + する)
  forms.push(createForm('honorific-humble', 'お' + masuStem + 'する'));

  return forms;
}
