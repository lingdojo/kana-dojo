/**
 * Japanese Verb Conjugator - Core Types
 *
 * This module defines all TypeScript interfaces and types for the conjugation engine.
 * The types are designed to support property-based testing and serialization round-trips.
 */

// ============================================================================
// Verb Classification Types
// ============================================================================

/**
 * The three main verb types in Japanese
 * - godan: Five-grade verbs (u-verbs) that conjugate across five vowel sounds
 * - ichidan: One-grade verbs (ru-verbs) ending in -iru or -eru
 * - irregular: Verbs that don't follow standard patterns (する, 来る, etc.)
 */
export type VerbType = 'godan' | 'ichidan' | 'irregular';

/**
 * Specific irregular verb classifications
 * - suru: する and する-compound verbs
 * - kuru: 来る and 来る-compound verbs
 * - aru: ある (existence verb with unique negative)
 * - iku: 行く (irregular te-form)
 * - honorific: くださる, なさる, いらっしゃる, おっしゃる, ござる
 */
export type IrregularType = 'suru' | 'kuru' | 'aru' | 'iku' | 'honorific';

/**
 * Complete information about a verb's classification and structure
 */
export interface VerbInfo {
  /** Original input form (may include kanji) */
  dictionaryForm: string;
  /** Hiragana reading of the verb */
  reading: string;
  /** Romanized pronunciation */
  romaji: string;
  /** Verb classification (godan, ichidan, or irregular) */
  type: VerbType;
  /** The stem portion used for conjugation */
  stem: string;
  /** The final character(s) that determine conjugation pattern */
  ending: string;
  /** Specific irregular type if applicable */
  irregularType?: IrregularType;
  /** For compound verbs, the prefix portion (e.g., 勉強 in 勉強する) */
  compoundPrefix?: string;
}

// ============================================================================
// Conjugation Form Types
// ============================================================================

/**
 * Categories for organizing conjugation forms
 */
export type ConjugationCategory =
  | 'basic'
  | 'polite'
  | 'negative'
  | 'past'
  | 'volitional'
  | 'potential'
  | 'passive'
  | 'causative'
  | 'causative-passive'
  | 'imperative'
  | 'conditional'
  | 'tai-form'
  | 'progressive'
  | 'honorific';

/**
 * Formality level of a conjugation form
 */
export type Formality = 'plain' | 'polite';

/**
 * A single conjugated form of a verb
 */
export interface ConjugationForm {
  /** Unique identifier for the form (e.g., 'te', 'masu', 'potential-plain') */
  id: string;
  /** English name of the form */
  name: string;
  /** Japanese name of the form */
  nameJapanese: string;
  /** Conjugated form (may include kanji) */
  kanji: string;
  /** Hiragana reading of the conjugated form */
  hiragana: string;
  /** Romanized pronunciation */
  romaji: string;
  /** Formality level */
  formality: Formality;
  /** Category this form belongs to */
  category: ConjugationCategory;
}

/**
 * Complete conjugation result for a verb
 */
export interface ConjugationResult {
  /** Information about the input verb */
  verb: VerbInfo;
  /** All conjugated forms */
  forms: ConjugationForm[];
  /** Timestamp when conjugation was performed */
  timestamp: number;
}

// ============================================================================
// History Types
// ============================================================================

/**
 * A history entry for recently conjugated verbs
 */
export interface HistoryEntry {
  /** Unique identifier */
  id: string;
  /** The verb that was conjugated */
  verb: string;
  /** The detected verb type */
  verbType: VerbType;
  /** When the verb was conjugated */
  timestamp: number;
}

// ============================================================================
// Form Definition Types (for internal use)
// ============================================================================

/**
 * Definition of a conjugation form (used for generating forms)
 */
export interface FormDefinition {
  /** Unique identifier */
  id: string;
  /** Category this form belongs to */
  category: ConjugationCategory;
  /** English name */
  name: string;
  /** Japanese name */
  nameJa: string;
  /** Formality level */
  formality: Formality;
}

// ============================================================================
// Godan Conjugation Types
// ============================================================================

/**
 * Mapping of vowel grades for Godan verb conjugation
 */
export interface GodanConjugationMap {
  /** A-grade stem (negative base) */
  a: string;
  /** I-grade stem (masu base) */
  i: string;
  /** E-grade stem (potential/imperative base) */
  e: string;
  /** O-grade stem (volitional base) */
  o: string;
  /** Te-form ending */
  te: string;
  /** Ta-form ending (past) */
  ta: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error codes for conjugation failures
 */
export type ConjugationErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_CHARACTERS'
  | 'UNKNOWN_VERB'
  | 'AMBIGUOUS_VERB'
  | 'CONJUGATION_FAILED';

/**
 * Error result from conjugation attempt
 */
export interface ConjugationError {
  /** Error code for programmatic handling */
  code: ConjugationErrorCode;
  /** Human-readable error message */
  message: string;
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * State interface for the Conjugator Zustand store
 */
export interface ConjugatorState {
  // Input
  inputText: string;

  // Results
  result: ConjugationResult | null;

  // UI State
  isLoading: boolean;
  error: ConjugationError | null;
  expandedCategories: Set<ConjugationCategory>;

  // History
  history: HistoryEntry[];

  // Actions
  setInputText: (text: string) => void;
  conjugate: () => void;
  toggleCategory: (category: ConjugationCategory) => void;
  expandAllCategories: () => void;
  collapseAllCategories: () => void;
  copyForm: (form: ConjugationForm) => void;
  copyAllForms: () => void;
  loadHistory: () => Promise<void>;
  addToHistory: (result: ConjugationResult) => void;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
  restoreFromHistory: (entry: HistoryEntry) => void;
  initFromUrlParams: (params: { verb?: string }) => boolean;
}

// ============================================================================
// Serialization Types
// ============================================================================

/**
 * JSON-serializable version of ConjugationResult
 * (expandedCategories Set is converted to array)
 */
export interface SerializedConjugationResult {
  verb: VerbInfo;
  forms: ConjugationForm[];
  timestamp: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Serialize a ConjugationResult to JSON string
 */
export function serializeResult(result: ConjugationResult): string {
  const serializable: SerializedConjugationResult = {
    verb: result.verb,
    forms: result.forms,
    timestamp: result.timestamp,
  };
  return JSON.stringify(serializable);
}

/**
 * Deserialize a JSON string back to ConjugationResult
 */
export function deserializeResult(json: string): ConjugationResult {
  const parsed: SerializedConjugationResult = JSON.parse(json);
  return {
    verb: parsed.verb,
    forms: parsed.forms,
    timestamp: parsed.timestamp,
  };
}

/**
 * Check if two ConjugationResults are equivalent
 * (used for testing serialization round-trips)
 */
export function areResultsEquivalent(
  a: ConjugationResult,
  b: ConjugationResult,
): boolean {
  // Compare verb info
  if (
    a.verb.dictionaryForm !== b.verb.dictionaryForm ||
    a.verb.reading !== b.verb.reading ||
    a.verb.romaji !== b.verb.romaji ||
    a.verb.type !== b.verb.type ||
    a.verb.stem !== b.verb.stem ||
    a.verb.ending !== b.verb.ending ||
    a.verb.irregularType !== b.verb.irregularType ||
    a.verb.compoundPrefix !== b.verb.compoundPrefix
  ) {
    return false;
  }

  // Compare timestamp
  if (a.timestamp !== b.timestamp) {
    return false;
  }

  // Compare forms count
  if (a.forms.length !== b.forms.length) {
    return false;
  }

  // Compare each form
  for (let i = 0; i < a.forms.length; i++) {
    const formA = a.forms[i];
    const formB = b.forms[i];
    if (
      formA.id !== formB.id ||
      formA.name !== formB.name ||
      formA.nameJapanese !== formB.nameJapanese ||
      formA.kanji !== formB.kanji ||
      formA.hiragana !== formB.hiragana ||
      formA.romaji !== formB.romaji ||
      formA.formality !== formB.formality ||
      formA.category !== formB.category
    ) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// All Conjugation Categories (for iteration)
// ============================================================================

export const ALL_CONJUGATION_CATEGORIES: ConjugationCategory[] = [
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
