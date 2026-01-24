/**
 * Conjugator Store
 *
 * Zustand store for managing the Japanese Verb Conjugator state.
 * Includes input handling, conjugation results, UI state, and history persistence.
 *
 * Requirements: 1.1, 5.2, 8.1-8.4
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ConjugationResult,
  ConjugationForm,
  ConjugationCategory,
  ConjugationError,
  HistoryEntry,
  VerbType,
} from '../types';
import { ALL_CONJUGATION_CATEGORIES } from '../types';
import { conjugate } from '../lib/engine/conjugate';

// ============================================================================
// Constants
// ============================================================================

/** Maximum number of history entries to keep */
const MAX_HISTORY_ENTRIES = 50;

/** Storage key for persisted state */
const STORAGE_KEY = 'kanadojo-conjugator';

// ============================================================================
// Store Interface
// ============================================================================

interface ConjugatorState {
  // Input state
  inputText: string;

  // Results state
  result: ConjugationResult | null;

  // UI state
  isLoading: boolean;
  error: ConjugationError | null;
  expandedCategories: ConjugationCategory[];

  // History state (persisted)
  history: HistoryEntry[];

  // Input actions
  setInputText: (text: string) => void;

  // Conjugation actions
  conjugate: () => void;

  // Category actions (Requirements: 5.2)
  toggleCategory: (category: ConjugationCategory) => void;
  expandAllCategories: () => void;
  collapseAllCategories: () => void;

  // Copy actions
  copyForm: (form: ConjugationForm) => Promise<void>;
  copyAllForms: () => Promise<void>;

  // History actions (Requirements: 8.1-8.4)
  addToHistory: (result: ConjugationResult) => void;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
  restoreFromHistory: (entry: HistoryEntry) => void;

  // URL parameter handling
  initFromUrlParams: (params: { verb?: string }) => boolean;

  // Reset actions
  reset: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique ID for history entries
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a history entry from a conjugation result
 */
function createHistoryEntry(result: ConjugationResult): HistoryEntry {
  return {
    id: generateId(),
    verb: result.verb.dictionaryForm,
    verbType: result.verb.type,
    timestamp: result.timestamp,
  };
}

/**
 * Format all conjugation forms for clipboard
 */
function formatFormsForClipboard(result: ConjugationResult): string {
  const lines: string[] = [];

  // Header with verb info
  lines.push(`${result.verb.dictionaryForm} (${result.verb.romaji})`);
  lines.push(`Type: ${result.verb.type}`);
  lines.push(`Stem: ${result.verb.stem}`);
  lines.push('');

  // Group forms by category
  const formsByCategory = new Map<ConjugationCategory, ConjugationForm[]>();
  for (const form of result.forms) {
    const existing = formsByCategory.get(form.category) || [];
    existing.push(form);
    formsByCategory.set(form.category, existing);
  }

  // Output each category
  for (const category of ALL_CONJUGATION_CATEGORIES) {
    const forms = formsByCategory.get(category);
    if (forms && forms.length > 0) {
      lines.push(`=== ${category.toUpperCase()} ===`);
      for (const form of forms) {
        lines.push(
          `${form.name}: ${form.kanji} (${form.hiragana}) [${form.romaji}]`,
        );
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ============================================================================
// Store Creation
// ============================================================================

const useConjugatorStore = create<ConjugatorState>()(
  persist(
    (set, get) => ({
      // Initial state
      inputText: '',
      result: null,
      isLoading: false,
      error: null,
      expandedCategories: ['basic', 'polite'], // Default expanded categories
      history: [],

      // Input actions
      setInputText: (text: string) => {
        set({ inputText: text, error: null });
      },

      // Conjugation action (Requirements: 1.1)
      conjugate: () => {
        const { inputText, addToHistory } = get();

        // Set loading state
        set({ isLoading: true, error: null });

        try {
          // Perform conjugation
          const conjugateResult = conjugate(inputText);

          if (conjugateResult.success) {
            // Success - update result and add to history
            set({
              result: conjugateResult.result,
              isLoading: false,
              error: null,
            });
            addToHistory(conjugateResult.result);
          } else {
            // Error - update error state
            set({
              result: null,
              isLoading: false,
              error: conjugateResult.error,
            });
          }
        } catch (err) {
          // Unexpected error
          set({
            result: null,
            isLoading: false,
            error: {
              code: 'CONJUGATION_FAILED',
              message:
                err instanceof Error
                  ? err.message
                  : 'An unexpected error occurred',
            },
          });
        }
      },

      // Category actions (Requirements: 5.2)
      toggleCategory: (category: ConjugationCategory) => {
        set(state => {
          const expanded = [...state.expandedCategories];
          const index = expanded.indexOf(category);
          if (index >= 0) {
            expanded.splice(index, 1);
          } else {
            expanded.push(category);
          }
          return { expandedCategories: expanded };
        });
      },

      expandAllCategories: () => {
        set({ expandedCategories: [...ALL_CONJUGATION_CATEGORIES] });
      },

      collapseAllCategories: () => {
        set({ expandedCategories: [] });
      },

      // Copy actions
      copyForm: async (form: ConjugationForm) => {
        try {
          const text = `${form.kanji} (${form.hiragana}) [${form.romaji}]`;
          await navigator.clipboard.writeText(text);
        } catch {
          // Clipboard API not available - fail silently
          console.warn('Clipboard API not available');
        }
      },

      copyAllForms: async () => {
        const { result } = get();
        if (!result) return;

        try {
          const text = formatFormsForClipboard(result);
          await navigator.clipboard.writeText(text);
        } catch {
          // Clipboard API not available - fail silently
          console.warn('Clipboard API not available');
        }
      },

      // History actions (Requirements: 8.1-8.4)
      addToHistory: (result: ConjugationResult) => {
        set(state => {
          // Check if verb already exists in history
          const existingIndex = state.history.findIndex(
            entry => entry.verb === result.verb.dictionaryForm,
          );

          let newHistory: HistoryEntry[];

          if (existingIndex >= 0) {
            // Move existing entry to front with updated timestamp
            const existing = state.history[existingIndex];
            newHistory = [
              { ...existing, timestamp: result.timestamp },
              ...state.history.slice(0, existingIndex),
              ...state.history.slice(existingIndex + 1),
            ];
          } else {
            // Add new entry at front
            const newEntry = createHistoryEntry(result);
            newHistory = [newEntry, ...state.history];
          }

          // Cap history size
          if (newHistory.length > MAX_HISTORY_ENTRIES) {
            newHistory = newHistory.slice(0, MAX_HISTORY_ENTRIES);
          }

          return { history: newHistory };
        });
      },

      deleteFromHistory: (id: string) => {
        set(state => ({
          history: state.history.filter(entry => entry.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      restoreFromHistory: (entry: HistoryEntry) => {
        const { setInputText, conjugate: doConjugate } = get();
        setInputText(entry.verb);
        doConjugate();
      },

      // URL parameter handling
      initFromUrlParams: (params: { verb?: string }) => {
        if (params.verb) {
          const { setInputText, conjugate: doConjugate } = get();
          setInputText(params.verb);
          doConjugate();
          return true;
        }
        return false;
      },

      // Reset action
      reset: () => {
        set({
          inputText: '',
          result: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      // Only persist history
      partialize: state => ({
        history: state.history,
      }),
      // Merge persisted state with current state
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | Partial<ConjugatorState>
          | undefined;
        return {
          ...currentState,
          history: persisted?.history ?? [],
        };
      },
    },
  ),
);

export default useConjugatorStore;

// ============================================================================
// Selector Hooks (for optimized re-renders)
// ============================================================================

/**
 * Select only the input text
 */
export const useInputText = () => useConjugatorStore(state => state.inputText);

/**
 * Select only the conjugation result
 */
export const useConjugationResult = () =>
  useConjugatorStore(state => state.result);

/**
 * Select only the loading state
 */
export const useIsLoading = () => useConjugatorStore(state => state.isLoading);

/**
 * Select only the error state
 */
export const useError = () => useConjugatorStore(state => state.error);

/**
 * Select only the history
 */
export const useHistory = () => useConjugatorStore(state => state.history);

/**
 * Check if a category is expanded
 */
export const useIsCategoryExpanded = (category: ConjugationCategory) =>
  useConjugatorStore(state => state.expandedCategories.includes(category));
