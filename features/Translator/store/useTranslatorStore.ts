import { create } from 'zustand';
import type { Language, TranslationEntry, TranslatorState } from '../types';
import { getOppositeLanguage } from '../types';
import {
  loadHistory,
  saveEntry,
  deleteEntry,
  clearAll
} from '../services/historyService';
import {
  translate as translateAPI,
  getErrorMessage
} from '../services/translationAPI';

const useTranslatorStore = create<TranslatorState>()((set, get) => ({
  // Input state
  sourceText: '',
  sourceLanguage: 'en' as Language,
  targetLanguage: 'ja' as Language,

  // Output state
  translatedText: '',
  romanization: null,

  // UI state
  isLoading: false,
  error: null,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,

  // History
  history: [],

  // Actions
  setSourceText: (text: string) => set({ sourceText: text, error: null }),

  setSourceLanguage: (lang: Language) => {
    const targetLang = getOppositeLanguage(lang);
    set({ sourceLanguage: lang, targetLanguage: targetLang, error: null });
  },

  setTargetLanguage: (lang: Language) => set({ targetLanguage: lang }),

  swapLanguages: () => {
    const { sourceLanguage, targetLanguage, sourceText, translatedText } =
      get();
    set({
      sourceLanguage: targetLanguage,
      targetLanguage: sourceLanguage,
      sourceText: translatedText,
      translatedText: sourceText,
      error: null
    });
  },

  translate: async () => {
    const { sourceText, sourceLanguage, targetLanguage } = get();

    // Validate input
    if (!sourceText || sourceText.trim().length === 0) {
      set({ error: 'Please enter text to translate.' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await translateAPI(
        sourceText,
        sourceLanguage,
        targetLanguage
      );

      // Generate unique ID for history entry
      const id = crypto.randomUUID();
      const entry: TranslationEntry = {
        id,
        sourceText,
        translatedText: response.translatedText,
        sourceLanguage,
        targetLanguage,
        romanization: response.romanization,
        timestamp: Date.now()
      };

      // Update state with translation result
      set({
        translatedText: response.translatedText,
        romanization: response.romanization || null,
        isLoading: false,
        error: null
      });

      // Add to history
      await get().addToHistory(entry);
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'code' in error
          ? getErrorMessage((error as { code: string }).code)
          : 'Translation failed. Please try again.';

      set({
        isLoading: false,
        error: errorMessage
      });
    }
  },

  clearInput: () =>
    set({
      sourceText: '',
      translatedText: '',
      romanization: null,
      error: null
    }),

  loadHistory: async () => {
    try {
      const history = await loadHistory();
      set({ history });
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  },

  addToHistory: async (entry: TranslationEntry) => {
    try {
      const updatedHistory = await saveEntry(entry);
      set({ history: updatedHistory });
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  },

  deleteFromHistory: async (id: string) => {
    try {
      const updatedHistory = await deleteEntry(id);
      set({ history: updatedHistory });
    } catch (error) {
      console.error('Failed to delete from history:', error);
    }
  },

  clearHistory: async () => {
    try {
      await clearAll();
      set({ history: [] });
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },

  restoreFromHistory: (entry: TranslationEntry) => {
    set({
      sourceText: entry.sourceText,
      translatedText: entry.translatedText,
      sourceLanguage: entry.sourceLanguage,
      targetLanguage: entry.targetLanguage,
      romanization: entry.romanization || null,
      error: null
    });
  }
}));

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useTranslatorStore.setState({ isOffline: false });
  });
  window.addEventListener('offline', () => {
    useTranslatorStore.setState({ isOffline: true });
  });
}

export default useTranslatorStore;
