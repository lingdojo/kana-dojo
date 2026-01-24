/**
 * Irregular Verb Conjugation Engine
 *
 * This module implements conjugation for irregular Japanese verbs:
 * - する (to do) - Requirements 2.3
 * - 来る (to come) - Requirements 2.4
 * - ある (to exist) - Requirements 2.5
 * - 行く (to go) - Requirements 2.6
 * - Honorific verbs (くださる, なさる, いらっしゃる, おっしゃる, ござる) - Requirements 4.7
 *
 * Requirements: 2.3-2.6, 4.7, 4.8
 */

import type { VerbInfo, ConjugationForm, IrregularType } from '../../types';
import { CONJUGATION_FORMS } from '../../data/conjugationForms';
import { hiraganaToRomaji } from './classifyVerb';

// ============================================================================
// Helper Functions
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
// する (suru) Conjugation - Requirements 2.3
// ============================================================================

/**
 * Conjugate する verb
 */
function conjugateSuru(verb: VerbInfo): ConjugationForm[] {
  const forms: ConjugationForm[] = [];
  const prefix = verb.compoundPrefix || '';

  // Basic Forms
  forms.push(createForm('dictionary', prefix + 'する'));
  forms.push(createForm('te', prefix + 'して'));

  // Polite Forms
  forms.push(createForm('masu', prefix + 'します'));
  forms.push(createForm('masen', prefix + 'しません'));
  forms.push(createForm('mashita', prefix + 'しました'));
  forms.push(createForm('masen-deshita', prefix + 'しませんでした'));

  // Negative Forms
  forms.push(createForm('nai', prefix + 'しない'));
  forms.push(createForm('nakatta', prefix + 'しなかった'));

  // Past Forms
  forms.push(createForm('ta', prefix + 'した'));

  // Volitional Forms
  forms.push(createForm('volitional-plain', prefix + 'しよう'));
  forms.push(createForm('volitional-polite', prefix + 'しましょう'));

  // Potential Forms
  forms.push(createForm('potential-plain', prefix + 'できる'));
  forms.push(createForm('potential-polite', prefix + 'できます'));
  forms.push(createForm('potential-negative', prefix + 'できない'));

  // Passive Forms
  forms.push(createForm('passive-plain', prefix + 'される'));
  forms.push(createForm('passive-polite', prefix + 'されます'));

  // Causative Forms
  forms.push(createForm('causative-plain', prefix + 'させる'));
  forms.push(createForm('causative-polite', prefix + 'させます'));

  // Causative-Passive Forms
  forms.push(createForm('causative-passive-plain', prefix + 'させられる'));
  forms.push(createForm('causative-passive-polite', prefix + 'させられます'));

  // Imperative Forms
  forms.push(createForm('imperative-plain', prefix + 'しろ'));
  forms.push(createForm('imperative-polite', prefix + 'してください'));
  forms.push(createForm('imperative-negative', prefix + 'するな'));

  // Conditional Forms
  forms.push(createForm('conditional-ba', prefix + 'すれば'));
  forms.push(createForm('conditional-tara', prefix + 'したら'));
  forms.push(createForm('conditional-nara', prefix + 'するなら'));

  // Tai-form
  forms.push(createForm('tai', prefix + 'したい'));
  forms.push(createForm('takunai', prefix + 'したくない'));
  forms.push(createForm('takatta', prefix + 'したかった'));
  forms.push(createForm('takunakatta', prefix + 'したくなかった'));

  // Progressive Forms
  forms.push(createForm('progressive-present', prefix + 'している'));
  forms.push(createForm('progressive-past', prefix + 'していた'));

  // Honorific Forms
  forms.push(createForm('honorific-respectful', 'お' + prefix + 'しになる'));
  forms.push(createForm('honorific-humble', 'お' + prefix + 'しする'));

  return forms;
}

// ============================================================================
// 来る (kuru) Conjugation - Requirements 2.4
// ============================================================================

/**
 * Conjugate 来る verb
 */
function conjugateKuru(verb: VerbInfo): ConjugationForm[] {
  const forms: ConjugationForm[] = [];
  const prefix = verb.compoundPrefix || '';

  // Basic Forms - hiragana first, kanji second
  forms.push(createForm('dictionary', prefix + 'くる', prefix + '来る'));
  forms.push(createForm('te', prefix + 'きて', prefix + '来て'));

  // Polite Forms
  forms.push(createForm('masu', prefix + 'きます', prefix + '来ます'));
  forms.push(createForm('masen', prefix + 'きません', prefix + '来ません'));
  forms.push(createForm('mashita', prefix + 'きました', prefix + '来ました'));
  forms.push(
    createForm(
      'masen-deshita',
      prefix + 'きませんでした',
      prefix + '来ませんでした',
    ),
  );

  // Negative Forms
  forms.push(createForm('nai', prefix + 'こない', prefix + '来ない'));
  forms.push(
    createForm('nakatta', prefix + 'こなかった', prefix + '来なかった'),
  );

  // Past Forms
  forms.push(createForm('ta', prefix + 'きた', prefix + '来た'));

  // Volitional Forms
  forms.push(
    createForm('volitional-plain', prefix + 'こよう', prefix + '来よう'),
  );
  forms.push(
    createForm(
      'volitional-polite',
      prefix + 'きましょう',
      prefix + '来ましょう',
    ),
  );

  // Potential Forms
  forms.push(
    createForm('potential-plain', prefix + 'こられる', prefix + '来られる'),
  );
  forms.push(
    createForm(
      'potential-polite',
      prefix + 'こられます',
      prefix + '来られます',
    ),
  );
  forms.push(
    createForm(
      'potential-negative',
      prefix + 'こられない',
      prefix + '来られない',
    ),
  );

  // Passive Forms
  forms.push(
    createForm('passive-plain', prefix + 'こられる', prefix + '来られる'),
  );
  forms.push(
    createForm('passive-polite', prefix + 'こられます', prefix + '来られます'),
  );

  // Causative Forms
  forms.push(
    createForm('causative-plain', prefix + 'こさせる', prefix + '来させる'),
  );
  forms.push(
    createForm(
      'causative-polite',
      prefix + 'こさせます',
      prefix + '来させます',
    ),
  );

  // Causative-Passive Forms
  forms.push(
    createForm(
      'causative-passive-plain',
      prefix + 'こさせられる',
      prefix + '来させられる',
    ),
  );
  forms.push(
    createForm(
      'causative-passive-polite',
      prefix + 'こさせられます',
      prefix + '来させられます',
    ),
  );

  // Imperative Forms
  forms.push(createForm('imperative-plain', prefix + 'こい', prefix + '来い'));
  forms.push(
    createForm(
      'imperative-polite',
      prefix + 'きてください',
      prefix + '来てください',
    ),
  );
  forms.push(
    createForm('imperative-negative', prefix + 'くるな', prefix + '来るな'),
  );

  // Conditional Forms
  forms.push(
    createForm('conditional-ba', prefix + 'くれば', prefix + '来れば'),
  );
  forms.push(
    createForm('conditional-tara', prefix + 'きたら', prefix + '来たら'),
  );
  forms.push(
    createForm('conditional-nara', prefix + 'くるなら', prefix + '来るなら'),
  );

  // Tai-form
  forms.push(createForm('tai', prefix + 'きたい', prefix + '来たい'));
  forms.push(
    createForm('takunai', prefix + 'きたくない', prefix + '来たくない'),
  );
  forms.push(
    createForm('takatta', prefix + 'きたかった', prefix + '来たかった'),
  );
  forms.push(
    createForm(
      'takunakatta',
      prefix + 'きたくなかった',
      prefix + '来たくなかった',
    ),
  );

  // Progressive Forms
  forms.push(
    createForm('progressive-present', prefix + 'きている', prefix + '来ている'),
  );
  forms.push(
    createForm('progressive-past', prefix + 'きていた', prefix + '来ていた'),
  );

  // Honorific Forms
  forms.push(
    createForm(
      'honorific-respectful',
      'お' + prefix + 'きになる',
      'お' + prefix + '来になる',
    ),
  );
  forms.push(
    createForm(
      'honorific-humble',
      'お' + prefix + 'きする',
      'お' + prefix + '来する',
    ),
  );

  return forms;
}

// ============================================================================
// ある (aru) Conjugation - Requirements 2.5, 4.8
// ============================================================================

/**
 * Conjugate ある verb
 * Note: ある has a unique negative form ない (not あらない)
 */
function conjugateAru(_verb: VerbInfo): ConjugationForm[] {
  const forms: ConjugationForm[] = [];

  // Basic Forms
  forms.push(createForm('dictionary', 'ある'));
  forms.push(createForm('te', 'あって'));

  // Polite Forms
  forms.push(createForm('masu', 'あります'));
  forms.push(createForm('masen', 'ありません'));
  forms.push(createForm('mashita', 'ありました'));
  forms.push(createForm('masen-deshita', 'ありませんでした'));

  // Negative Forms - SPECIAL: ある → ない (not あらない) - Requirements 4.8
  forms.push(createForm('nai', 'ない'));
  forms.push(createForm('nakatta', 'なかった'));

  // Past Forms
  forms.push(createForm('ta', 'あった'));

  // Volitional Forms
  forms.push(createForm('volitional-plain', 'あろう'));
  forms.push(createForm('volitional-polite', 'ありましょう'));

  // Potential Forms (ある doesn't really have potential - existence is not an ability)
  // But we include them for completeness
  forms.push(createForm('potential-plain', 'ありえる'));
  forms.push(createForm('potential-polite', 'ありえます'));
  forms.push(createForm('potential-negative', 'ありえない'));

  // Passive Forms (ある doesn't have passive - existence can't be passivized)
  // Include placeholder forms
  forms.push(createForm('passive-plain', 'あられる'));
  forms.push(createForm('passive-polite', 'あられます'));

  // Causative Forms
  forms.push(createForm('causative-plain', 'あらせる'));
  forms.push(createForm('causative-polite', 'あらせます'));

  // Causative-Passive Forms
  forms.push(createForm('causative-passive-plain', 'あらせられる'));
  forms.push(createForm('causative-passive-polite', 'あらせられます'));

  // Imperative Forms (ある doesn't really have imperative)
  forms.push(createForm('imperative-plain', 'あれ'));
  forms.push(createForm('imperative-polite', 'あってください'));
  forms.push(createForm('imperative-negative', 'あるな'));

  // Conditional Forms
  forms.push(createForm('conditional-ba', 'あれば'));
  forms.push(createForm('conditional-tara', 'あったら'));
  forms.push(createForm('conditional-nara', 'あるなら'));

  // Tai-form (ある doesn't really use tai-form)
  forms.push(createForm('tai', 'ありたい'));
  forms.push(createForm('takunai', 'ありたくない'));
  forms.push(createForm('takatta', 'ありたかった'));
  forms.push(createForm('takunakatta', 'ありたくなかった'));

  // Progressive Forms
  forms.push(createForm('progressive-present', 'あっている'));
  forms.push(createForm('progressive-past', 'あっていた'));

  // Honorific Forms
  forms.push(createForm('honorific-respectful', 'おありになる'));
  forms.push(createForm('honorific-humble', 'おありする'));

  return forms;
}

// ============================================================================
// 行く (iku) Conjugation - Requirements 2.6
// ============================================================================

/**
 * Conjugate 行く verb
 * Note: 行く has irregular te-form 行って (not 行いて)
 */
function conjugateIku(_verb: VerbInfo): ConjugationForm[] {
  const forms: ConjugationForm[] = [];

  // Basic Forms - hiragana first, kanji second
  // SPECIAL: te-form is いって (not いいて)
  forms.push(createForm('dictionary', 'いく', '行く'));
  forms.push(createForm('te', 'いって', '行って'));

  // Polite Forms
  forms.push(createForm('masu', 'いきます', '行きます'));
  forms.push(createForm('masen', 'いきません', '行きません'));
  forms.push(createForm('mashita', 'いきました', '行きました'));
  forms.push(
    createForm('masen-deshita', 'いきませんでした', '行きませんでした'),
  );

  // Negative Forms
  forms.push(createForm('nai', 'いかない', '行かない'));
  forms.push(createForm('nakatta', 'いかなかった', '行かなかった'));

  // Past Forms - SPECIAL: ta-form is いった (not いいた)
  forms.push(createForm('ta', 'いった', '行った'));

  // Volitional Forms
  forms.push(createForm('volitional-plain', 'いこう', '行こう'));
  forms.push(createForm('volitional-polite', 'いきましょう', '行きましょう'));

  // Potential Forms
  forms.push(createForm('potential-plain', 'いける', '行ける'));
  forms.push(createForm('potential-polite', 'いけます', '行けます'));
  forms.push(createForm('potential-negative', 'いけない', '行けない'));

  // Passive Forms
  forms.push(createForm('passive-plain', 'いかれる', '行かれる'));
  forms.push(createForm('passive-polite', 'いかれます', '行かれます'));

  // Causative Forms
  forms.push(createForm('causative-plain', 'いかせる', '行かせる'));
  forms.push(createForm('causative-polite', 'いかせます', '行かせます'));

  // Causative-Passive Forms
  forms.push(
    createForm('causative-passive-plain', 'いかせられる', '行かせられる'),
  );
  forms.push(
    createForm('causative-passive-polite', 'いかせられます', '行かせられます'),
  );

  // Imperative Forms
  forms.push(createForm('imperative-plain', 'いけ', '行け'));
  forms.push(
    createForm('imperative-polite', 'いってください', '行ってください'),
  );
  forms.push(createForm('imperative-negative', 'いくな', '行くな'));

  // Conditional Forms
  forms.push(createForm('conditional-ba', 'いけば', '行けば'));
  forms.push(createForm('conditional-tara', 'いったら', '行ったら'));
  forms.push(createForm('conditional-nara', 'いくなら', '行くなら'));

  // Tai-form
  forms.push(createForm('tai', 'いきたい', '行きたい'));
  forms.push(createForm('takunai', 'いきたくない', '行きたくない'));
  forms.push(createForm('takatta', 'いきたかった', '行きたかった'));
  forms.push(createForm('takunakatta', 'いきたくなかった', '行きたくなかった'));

  // Progressive Forms
  forms.push(createForm('progressive-present', 'いっている', '行っている'));
  forms.push(createForm('progressive-past', 'いっていた', '行っていた'));

  // Honorific Forms
  forms.push(
    createForm('honorific-respectful', 'おいきになる', 'お行きになる'),
  );
  forms.push(createForm('honorific-humble', 'おいきする', 'お行きする'));

  return forms;
}

// ============================================================================
// Honorific Verbs Conjugation - Requirements 4.7
// くださる, なさる, いらっしゃる, おっしゃる, ござる
// These have irregular masu-form: ます instead of ります
// ============================================================================

/**
 * Conjugate honorific verbs
 * These verbs have irregular masu-form patterns
 */
function conjugateHonorific(verb: VerbInfo): ConjugationForm[] {
  const forms: ConjugationForm[] = [];
  const stem = verb.stem; // e.g., くださ, なさ, いらっしゃ, おっしゃ, ござ

  // Basic Forms
  forms.push(createForm('dictionary', verb.dictionaryForm));
  forms.push(createForm('te', stem + 'って'));

  // Polite Forms - SPECIAL: ます instead of ります (Requirements 4.7)
  forms.push(createForm('masu', stem + 'います'));
  forms.push(createForm('masen', stem + 'いません'));
  forms.push(createForm('mashita', stem + 'いました'));
  forms.push(createForm('masen-deshita', stem + 'いませんでした'));

  // Negative Forms
  forms.push(createForm('nai', stem + 'らない'));
  forms.push(createForm('nakatta', stem + 'らなかった'));

  // Past Forms
  forms.push(createForm('ta', stem + 'った'));

  // Volitional Forms
  forms.push(createForm('volitional-plain', stem + 'ろう'));
  forms.push(createForm('volitional-polite', stem + 'いましょう'));

  // Potential Forms
  forms.push(createForm('potential-plain', stem + 'れる'));
  forms.push(createForm('potential-polite', stem + 'れます'));
  forms.push(createForm('potential-negative', stem + 'れない'));

  // Passive Forms
  forms.push(createForm('passive-plain', stem + 'られる'));
  forms.push(createForm('passive-polite', stem + 'られます'));

  // Causative Forms
  forms.push(createForm('causative-plain', stem + 'らせる'));
  forms.push(createForm('causative-polite', stem + 'らせます'));

  // Causative-Passive Forms
  forms.push(createForm('causative-passive-plain', stem + 'らせられる'));
  forms.push(createForm('causative-passive-polite', stem + 'らせられます'));

  // Imperative Forms
  forms.push(createForm('imperative-plain', stem + 'い'));
  forms.push(createForm('imperative-polite', stem + 'ってください'));
  forms.push(createForm('imperative-negative', verb.dictionaryForm + 'な'));

  // Conditional Forms
  forms.push(createForm('conditional-ba', stem + 'れば'));
  forms.push(createForm('conditional-tara', stem + 'ったら'));
  forms.push(createForm('conditional-nara', verb.dictionaryForm + 'なら'));

  // Tai-form
  forms.push(createForm('tai', stem + 'いたい'));
  forms.push(createForm('takunai', stem + 'いたくない'));
  forms.push(createForm('takatta', stem + 'いたかった'));
  forms.push(createForm('takunakatta', stem + 'いたくなかった'));

  // Progressive Forms
  forms.push(createForm('progressive-present', stem + 'っている'));
  forms.push(createForm('progressive-past', stem + 'っていた'));

  // Honorific Forms (these are already honorific, but include for completeness)
  forms.push(createForm('honorific-respectful', 'お' + stem + 'いになる'));
  forms.push(createForm('honorific-humble', 'お' + stem + 'いする'));

  return forms;
}

// ============================================================================
// Main Conjugation Function
// ============================================================================

/**
 * Conjugate an irregular verb to all forms
 *
 * @param verb - The VerbInfo object for an irregular verb
 * @returns Array of all conjugated forms
 *
 * Requirements: 2.3-2.6, 4.7, 4.8
 */
export function conjugateIrregular(verb: VerbInfo): ConjugationForm[] {
  if (verb.type !== 'irregular') {
    throw new Error('conjugateIrregular called with non-irregular verb');
  }

  switch (verb.irregularType) {
    case 'suru':
      return conjugateSuru(verb);
    case 'kuru':
      return conjugateKuru(verb);
    case 'aru':
      return conjugateAru(verb);
    case 'iku':
      return conjugateIku(verb);
    case 'honorific':
      return conjugateHonorific(verb);
    default:
      throw new Error(`Unknown irregular type: ${verb.irregularType}`);
  }
}

// ============================================================================
// Exported Helper Functions for Testing
// ============================================================================

/**
 * Get the negative form of ある
 * This is a special case: ある → ない (not あらない)
 */
export function getAruNegative(): string {
  return 'ない';
}

/**
 * Get the te-form of 行く
 * This is a special case: 行く → 行って (not 行いて)
 */
export function getIkuTeForm(): string {
  return '行って';
}

/**
 * Get the masu-form stem for honorific verbs
 * These use い instead of り (e.g., くださいます not くださります)
 */
export function getHonorificMasuStem(stem: string): string {
  return stem + 'い';
}

/**
 * Check if a verb is an honorific verb
 */
export function isHonorificVerb(verb: string): boolean {
  const honorificVerbs = [
    'くださる',
    'なさる',
    'いらっしゃる',
    'おっしゃる',
    'ござる',
  ];
  return honorificVerbs.includes(verb);
}
