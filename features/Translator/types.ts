/**
 * Language type for translation source and target
 */
export type Language = 'en' | 'ja';

/**
 * Translation history entry stored in localforage
 */
export interface TranslationEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  romanization?: string;
  timestamp: number;
}

/**
 * Language detection result
 */
export interface LanguageDetectionResult {
  language: Language;
  confidence: number;
}

/**
 * Translator store state interface
 */
export interface TranslatorState {
  // Input state
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;

  // Output state
  translatedText: string;
  romanization: string | null;

  // UI state
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;

  // Auto detection
  autoDetect: boolean;
  detectedLanguage: LanguageDetectionResult | null;

  // History
  history: TranslationEntry[];

  // Actions
  setSourceText: (text: string) => void;
  setSourceLanguage: (lang: Language) => void;
  setTargetLanguage: (lang: Language) => void;
  toggleAutoDetect: () => void;
  swapLanguages: () => void;
  translate: () => Promise<void>;
  clearInput: () => void;
  loadHistory: () => Promise<void>;
  addToHistory: (entry: TranslationEntry) => Promise<void>;
  deleteFromHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  restoreFromHistory: (entry: TranslationEntry) => void;
  initFromUrlParams: (params: {
    text?: string;
    from?: string;
    to?: string;
    q?: string;
  }) => boolean;
}

/**
 * API response from translation service
 */
export interface TranslationAPIResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
  romanization?: string;
}

/**
 * API error response
 */
export interface TranslationAPIError {
  code: string;
  message: string;
  status: number;
}

/**
 * Request body for translation API
 */
export interface TranslationRequest {
  text: string;
  sourceLanguage: Language;
  targetLanguage: Language;
}

/**
 * Helper function to get the opposite language
 */
export function getOppositeLanguage(lang: Language): Language {
  return lang === 'en' ? 'ja' : 'en';
}
