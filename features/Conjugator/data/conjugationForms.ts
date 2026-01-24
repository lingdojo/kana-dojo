/**
 * Japanese Verb Conjugation Form Definitions
 *
 * This module defines all 30+ conjugation forms organized by category.
 * Each form definition includes metadata for display and categorization.
 *
 * Requirements: 3.1-3.13
 */

import type { FormDefinition, ConjugationCategory, Formality } from '../types';

// ============================================================================
// Form Definitions
// ============================================================================

/**
 * All conjugation form definitions organized by category
 * Requirements: 3.1-3.13
 */
export const CONJUGATION_FORMS: FormDefinition[] = [
  // ============================================================================
  // Basic Forms (Requirements: 3.1)
  // ============================================================================
  {
    id: 'dictionary',
    category: 'basic',
    name: 'Dictionary Form',
    nameJa: '辞書形',
    formality: 'plain',
  },
  {
    id: 'te',
    category: 'basic',
    name: 'Te Form',
    nameJa: 'て形',
    formality: 'plain',
  },

  // ============================================================================
  // Polite Forms (Requirements: 3.2)
  // ============================================================================
  {
    id: 'masu',
    category: 'polite',
    name: 'Masu Form',
    nameJa: 'ます形',
    formality: 'polite',
  },
  {
    id: 'masen',
    category: 'polite',
    name: 'Masen (Polite Negative)',
    nameJa: 'ません',
    formality: 'polite',
  },
  {
    id: 'mashita',
    category: 'polite',
    name: 'Mashita (Polite Past)',
    nameJa: 'ました',
    formality: 'polite',
  },
  {
    id: 'masen-deshita',
    category: 'polite',
    name: 'Masen Deshita (Polite Past Negative)',
    nameJa: 'ませんでした',
    formality: 'polite',
  },

  // ============================================================================
  // Negative Forms (Requirements: 3.1)
  // ============================================================================
  {
    id: 'nai',
    category: 'negative',
    name: 'Nai Form (Negative)',
    nameJa: 'ない形',
    formality: 'plain',
  },
  {
    id: 'nakatta',
    category: 'negative',
    name: 'Nakatta Form (Past Negative)',
    nameJa: 'なかった形',
    formality: 'plain',
  },

  // ============================================================================
  // Past Forms (Requirements: 3.1)
  // ============================================================================
  {
    id: 'ta',
    category: 'past',
    name: 'Ta Form (Past)',
    nameJa: 'た形',
    formality: 'plain',
  },

  // ============================================================================
  // Volitional Forms (Requirements: 3.3)
  // ============================================================================
  {
    id: 'volitional-plain',
    category: 'volitional',
    name: 'Volitional (Plain)',
    nameJa: '意向形',
    formality: 'plain',
  },
  {
    id: 'volitional-polite',
    category: 'volitional',
    name: 'Volitional (Polite)',
    nameJa: 'ましょう',
    formality: 'polite',
  },

  // ============================================================================
  // Potential Forms (Requirements: 3.4)
  // ============================================================================
  {
    id: 'potential-plain',
    category: 'potential',
    name: 'Potential (Plain)',
    nameJa: '可能形',
    formality: 'plain',
  },
  {
    id: 'potential-polite',
    category: 'potential',
    name: 'Potential (Polite)',
    nameJa: '可能形丁寧',
    formality: 'polite',
  },
  {
    id: 'potential-negative',
    category: 'potential',
    name: 'Potential (Negative)',
    nameJa: '可能形否定',
    formality: 'plain',
  },

  // ============================================================================
  // Passive Forms (Requirements: 3.5)
  // ============================================================================
  {
    id: 'passive-plain',
    category: 'passive',
    name: 'Passive (Plain)',
    nameJa: '受身形',
    formality: 'plain',
  },
  {
    id: 'passive-polite',
    category: 'passive',
    name: 'Passive (Polite)',
    nameJa: '受身形丁寧',
    formality: 'polite',
  },

  // ============================================================================
  // Causative Forms (Requirements: 3.6)
  // ============================================================================
  {
    id: 'causative-plain',
    category: 'causative',
    name: 'Causative (Plain)',
    nameJa: '使役形',
    formality: 'plain',
  },
  {
    id: 'causative-polite',
    category: 'causative',
    name: 'Causative (Polite)',
    nameJa: '使役形丁寧',
    formality: 'polite',
  },

  // ============================================================================
  // Causative-Passive Forms (Requirements: 3.7)
  // ============================================================================
  {
    id: 'causative-passive-plain',
    category: 'causative-passive',
    name: 'Causative-Passive (Plain)',
    nameJa: '使役受身形',
    formality: 'plain',
  },
  {
    id: 'causative-passive-polite',
    category: 'causative-passive',
    name: 'Causative-Passive (Polite)',
    nameJa: '使役受身形丁寧',
    formality: 'polite',
  },

  // ============================================================================
  // Imperative Forms (Requirements: 3.8)
  // ============================================================================
  {
    id: 'imperative-plain',
    category: 'imperative',
    name: 'Imperative (Plain)',
    nameJa: '命令形',
    formality: 'plain',
  },
  {
    id: 'imperative-polite',
    category: 'imperative',
    name: 'Imperative (Polite)',
    nameJa: 'てください',
    formality: 'polite',
  },
  {
    id: 'imperative-negative',
    category: 'imperative',
    name: 'Negative Imperative',
    nameJa: '禁止形',
    formality: 'plain',
  },

  // ============================================================================
  // Conditional Forms (Requirements: 3.9, 3.10)
  // ============================================================================
  {
    id: 'conditional-ba',
    category: 'conditional',
    name: 'Ba Form (Conditional)',
    nameJa: 'ば形',
    formality: 'plain',
  },
  {
    id: 'conditional-tara',
    category: 'conditional',
    name: 'Tara Form (Conditional)',
    nameJa: 'たら形',
    formality: 'plain',
  },
  {
    id: 'conditional-nara',
    category: 'conditional',
    name: 'Nara Form (Conditional)',
    nameJa: 'なら形',
    formality: 'plain',
  },

  // ============================================================================
  // Tai-form (Want to) (Requirements: 3.11)
  // ============================================================================
  {
    id: 'tai',
    category: 'tai-form',
    name: 'Tai Form (Want to)',
    nameJa: 'たい形',
    formality: 'plain',
  },
  {
    id: 'takunai',
    category: 'tai-form',
    name: "Takunai (Don't want to)",
    nameJa: 'たくない',
    formality: 'plain',
  },
  {
    id: 'takatta',
    category: 'tai-form',
    name: 'Takatta (Wanted to)',
    nameJa: 'たかった',
    formality: 'plain',
  },
  {
    id: 'takunakatta',
    category: 'tai-form',
    name: "Takunakatta (Didn't want to)",
    nameJa: 'たくなかった',
    formality: 'plain',
  },

  // ============================================================================
  // Progressive Forms (Requirements: 3.12)
  // ============================================================================
  {
    id: 'progressive-present',
    category: 'progressive',
    name: 'Te-iru (Continuous)',
    nameJa: 'ている',
    formality: 'plain',
  },
  {
    id: 'progressive-past',
    category: 'progressive',
    name: 'Te-ita (Past Continuous)',
    nameJa: 'ていた',
    formality: 'plain',
  },

  // ============================================================================
  // Honorific Forms (Requirements: 3.13)
  // ============================================================================
  {
    id: 'honorific-respectful',
    category: 'honorific',
    name: 'Respectful (O-verb-ni-naru)',
    nameJa: 'お〜になる',
    formality: 'polite',
  },
  {
    id: 'honorific-humble',
    category: 'honorific',
    name: 'Humble (O-verb-suru)',
    nameJa: 'お〜する',
    formality: 'polite',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all form definitions for a specific category
 */
export function getFormsByCategory(
  category: ConjugationCategory,
): FormDefinition[] {
  return CONJUGATION_FORMS.filter(form => form.category === category);
}

/**
 * Get a form definition by its ID
 */
export function getFormById(id: string): FormDefinition | undefined {
  return CONJUGATION_FORMS.find(form => form.id === id);
}

/**
 * Get all form definitions for a specific formality level
 */
export function getFormsByFormality(formality: Formality): FormDefinition[] {
  return CONJUGATION_FORMS.filter(form => form.formality === formality);
}

/**
 * Get all unique categories from the form definitions
 */
export function getAllCategories(): ConjugationCategory[] {
  const categories = new Set<ConjugationCategory>();
  CONJUGATION_FORMS.forEach(form => categories.add(form.category));
  return Array.from(categories);
}

/**
 * Category display names in English and Japanese
 */
export const CATEGORY_NAMES: Record<
  ConjugationCategory,
  { en: string; ja: string }
> = {
  basic: { en: 'Basic Forms', ja: '基本形' },
  polite: { en: 'Polite Forms', ja: '丁寧形' },
  negative: { en: 'Negative Forms', ja: '否定形' },
  past: { en: 'Past Forms', ja: '過去形' },
  volitional: { en: 'Volitional Forms', ja: '意向形' },
  potential: { en: 'Potential Forms', ja: '可能形' },
  passive: { en: 'Passive Forms', ja: '受身形' },
  causative: { en: 'Causative Forms', ja: '使役形' },
  'causative-passive': { en: 'Causative-Passive Forms', ja: '使役受身形' },
  imperative: { en: 'Imperative Forms', ja: '命令形' },
  conditional: { en: 'Conditional Forms', ja: '条件形' },
  'tai-form': { en: 'Desire Forms (Tai)', ja: 'たい形' },
  progressive: { en: 'Progressive Forms', ja: '進行形' },
  honorific: { en: 'Honorific Forms', ja: '敬語' },
};

/**
 * Order of categories for display
 */
export const CATEGORY_ORDER: ConjugationCategory[] = [
  'basic',
  'polite',
  'negative',
  'past',
  'volitional',
  'potential',
  'passive',
  'causative',
  'causative-passive',
  'imperative',
  'conditional',
  'tai-form',
  'progressive',
  'honorific',
];
