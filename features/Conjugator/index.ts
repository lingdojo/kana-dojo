// ============================================================================
// Conjugator Feature - Public API
// ============================================================================

// Types
export * from './types';

// Engine
export {
  classifyVerb,
  getGodanMap,
  hiraganaToRomaji,
  isHiragana,
  isKatakana,
  isKanji,
  isJapanese,
  detectSuruCompound,
  detectKuruCompound,
  getVerbInfo,
  conjugate,
  conjugateOrThrow,
  conjugateToForm,
  isValidVerb,
} from './lib/engine';

// Data
export {
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
} from './data/verbData';

// Store
export { default as useConjugatorStore } from './store/useConjugatorStore';
export {
  useInputText,
  useConjugationResult,
  useIsLoading,
  useError,
  useHistory,
  useIsCategoryExpanded,
} from './store/useConjugatorStore';

// Components
export { default as ConjugatorPage } from './components/ConjugatorPage';
export { default as ConjugatorInput } from './components/ConjugatorInput';
export { default as ConjugationResults } from './components/ConjugationResults';
export { default as ConjugationCategory } from './components/ConjugationCategory';
export { default as ConjugationHistory } from './components/ConjugationHistory';
export { default as VerbInfoCard } from './components/VerbInfoCard';
export { default as SEOContent } from './components/SEOContent';
export { default as FAQ } from './components/FAQ';
export { default as RelatedFeatures } from './components/RelatedFeatures';

// Hooks (will be exported as implemented)
// export { useConjugator } from './hooks/useConjugator';

// SEO - Meta Tags
export {
  generateMeta,
  generateVerbMeta,
  generateCanonicalUrl,
  generateNextMetadata,
  BASE_META,
  type ConjugatorMeta,
  type GenerateMetaOptions,
} from './lib/seo/generateMeta';

// SEO - Structured Data
export {
  generateConjugatorSchema,
  generateVerbSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
  generateWebApplicationSchema,
  CONJUGATOR_FAQ_ITEMS,
  type ConjugatorSchemaGraph,
  type FAQItem,
} from './lib/seo/structuredData';
