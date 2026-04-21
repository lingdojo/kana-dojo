import { Random } from 'random-js';
import localforage from 'localforage';

/**
 * Adaptive Weighted Selection System
 *
 * This selector is intentionally time-free.
 *
 * It prioritizes each key using:
 * 1. Historical accuracy (persisted)
 * 2. Current-session accuracy (resets per session)
 * 3. Session recency measured as "selection events back"
 * 4. Session frequency balancing (under-shown keys are boosted)
 */

const random = new Random();

// Storage key prefix for localforage
const STORAGE_KEY = 'kanadojo-adaptive-weights';

export interface CharacterWeight {
  historicalCorrect: number;
  historicalWrong: number;
  sessionCorrect: number;
  sessionWrong: number;
  seenCountInSession: number;
  lastSeenSelectionIndex: number | null;
}

interface FormatPerformance {
  correct: number;
  wrong: number;
  pendingWrong: boolean;
}

interface PersistedCharacterWeight {
  correct: number;
  wrong: number;
}

// Serializable format for storage
interface StoredWeights {
  version: number;
  weights: Record<string, PersistedCharacterWeight>;
}

// Legacy v1 payload support
interface LegacyStoredWeights {
  version?: number;
  weights?: Record<
    string,
    {
      correct?: number;
      wrong?: number;
    }
  >;
}

/**
 * Creates a new adaptive selection instance with optional persistence.
 * Each instance maintains its own weight tracking, allowing different
 * game modes to have independent tracking.
 */
export function createAdaptiveSelector(storageKey?: string) {
  // Combined historical + session tracking
  const characterWeights: Map<string, CharacterWeight> = new Map();
  let isLoaded = false;
  let loadPromise: Promise<void> | null = null;
  const persistKey = storageKey ? `${STORAGE_KEY}-${storageKey}` : STORAGE_KEY;
  let currentSessionToken: string | null = null;

  // Track a selection event counter for session recency/frequency.
  let sessionSelectionIndex = 0;

  // Track how many answers have been submitted in the current session.
  let sessionAnswerCount = 0;

  // Track total shown items in this session (for expected frequency balancing).
  let totalSelectionsInSession = 0;

  // Prevent immediate duplicates.
  let lastSelectedCharacter: string | null = null;
  const sessionFormatPerformance: Map<string, Map<string, FormatPerformance>> =
    new Map();

  // Coalesced persistence without timers.
  let persistInFlight: Promise<void> | null = null;
  let persistQueued = false;

  const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

  const createEmptyWeight = (): CharacterWeight => ({
    historicalCorrect: 0,
    historicalWrong: 0,
    sessionCorrect: 0,
    sessionWrong: 0,
    seenCountInSession: 0,
    lastSeenSelectionIndex: null,
  });

  const getOrCreateWeight = (char: string): CharacterWeight => {
    const existing = characterWeights.get(char);
    if (existing) return existing;
    const initial = createEmptyWeight();
    characterWeights.set(char, initial);
    return initial;
  };

  const resetSessionState = (): void => {
    sessionSelectionIndex = 0;
    sessionAnswerCount = 0;
    totalSelectionsInSession = 0;
    lastSelectedCharacter = null;

    characterWeights.forEach(weight => {
      weight.sessionCorrect = 0;
      weight.sessionWrong = 0;
      weight.seenCountInSession = 0;
      weight.lastSeenSelectionIndex = null;
    });
    sessionFormatPerformance.clear();
  };

  const getOrCreateFormatPerformance = (
    word: string,
    format: string,
  ): FormatPerformance => {
    const normalizedWord = word.trim();
    const normalizedFormat = format.trim();
    if (!normalizedWord || !normalizedFormat) {
      return { correct: 0, wrong: 0, pendingWrong: false };
    }

    let formatMap = sessionFormatPerformance.get(normalizedWord);
    if (!formatMap) {
      formatMap = new Map();
      sessionFormatPerformance.set(normalizedWord, formatMap);
    }

    const existing = formatMap.get(normalizedFormat);
    if (existing) return existing;

    const initial: FormatPerformance = { correct: 0, wrong: 0, pendingWrong: false };
    formatMap.set(normalizedFormat, initial);
    return initial;
  };

  const persistHistorical = async (): Promise<void> => {
    if (persistInFlight) {
      persistQueued = true;
      return;
    }

    do {
      persistQueued = false;
      const stored: StoredWeights = {
        version: 2,
        weights: Object.fromEntries(
          Array.from(characterWeights.entries()).map(([char, weight]) => [
            char,
            {
              correct: weight.historicalCorrect,
              wrong: weight.historicalWrong,
            },
          ]),
        ),
      };

      persistInFlight = localforage
        .setItem(persistKey, stored)
        .then(() => undefined)
        .catch(error => {
          console.warn('[AdaptiveSelection] Failed to save to storage:', error);
        });
      await persistInFlight;
      persistInFlight = null;
    } while (persistQueued);
  };

  /**
   * Load weights from persistent storage
   */
  const loadFromStorage = async (): Promise<void> => {
    if (isLoaded) return;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      try {
        const stored = await localforage.getItem<
          StoredWeights | LegacyStoredWeights
        >(persistKey);

        if (stored && typeof stored === 'object' && stored.weights) {
          Object.entries(stored.weights).forEach(([char, raw]) => {
            const correct = Math.max(0, raw?.correct ?? 0);
            const wrong = Math.max(0, raw?.wrong ?? 0);

            characterWeights.set(char, {
              ...createEmptyWeight(),
              historicalCorrect: correct,
              historicalWrong: wrong,
            });
          });
        }
      } catch (error) {
        console.warn('[AdaptiveSelection] Failed to load from storage:', error);
      }
      isLoaded = true;
    })();

    return loadPromise;
  };

  const toAccuracyWeight = (
    correct: number,
    wrong: number,
    {
      minWeight,
      maxWeight,
      priorCorrect,
      priorWrong,
      scale,
      neutralAccuracy,
    }: {
      minWeight: number;
      maxWeight: number;
      priorCorrect: number;
      priorWrong: number;
      scale: number;
      neutralAccuracy: number;
    },
  ): number => {
    const attempts = correct + wrong;
    const accuracy =
      (correct + priorCorrect) / (attempts + priorCorrect + priorWrong);
    return clamp(1 + (neutralAccuracy - accuracy) * scale, minWeight, maxWeight);
  };

  // Calculate adaptive weight for a character
  const calculateWeight = (char: string, allChars: string[]): number => {
    const weight = characterWeights.get(char);

    // Base weight for new/unseen characters
    if (!weight) {
      return 1.0;
    }

    const {
      historicalCorrect,
      historicalWrong,
      sessionCorrect,
      sessionWrong,
      seenCountInSession,
      lastSeenSelectionIndex,
    } = weight;

    // Factor 1: Historical difficulty (persisted all-time signal)
    const historicalWeight = toAccuracyWeight(historicalCorrect, historicalWrong, {
      minWeight: 0.65,
      maxWeight: 2.0,
      priorCorrect: 2,
      priorWrong: 2,
      scale: 1.4,
      neutralAccuracy: 0.74,
    });

    // Factor 2: Session difficulty (short-term adaptation signal)
    const sessionAttempts = sessionCorrect + sessionWrong;
    const sessionRawWeight = toAccuracyWeight(sessionCorrect, sessionWrong, {
      minWeight: 0.6,
      maxWeight: 2.4,
      priorCorrect: 1,
      priorWrong: 1,
      scale: 2.0,
      neutralAccuracy: 0.72,
    });
    const sessionConfidence = sessionAttempts / (sessionAttempts + 4);
    const sessionWeight = 1 + (sessionRawWeight - 1) * sessionConfidence;

    // Factor 3: Recency by selection-events-back (not wall-clock time)
    const recencyWeight = (() => {
      if (lastSeenSelectionIndex === null) return 1.35;

      const selectionsBack = sessionSelectionIndex - lastSeenSelectionIndex;
      if (selectionsBack <= 0) return 0.2;
      if (selectionsBack === 1) return 0.35;
      if (selectionsBack === 2) return 0.55;
      if (selectionsBack <= 4) return 0.8;
      if (selectionsBack <= 8) return 1.0;
      if (selectionsBack <= 16) return 1.15;
      return 1.3;
    })();

    // Factor 4: Session frequency balancing (coverage/fairness)
    const expectedSeenCount =
      totalSelectionsInSession / Math.max(1, allChars.length);
    const frequencyGap = expectedSeenCount - seenCountInSession;
    const frequencyWeight = clamp(1 + frequencyGap * 0.45, 0.55, 2.2);

    // Factor 5: Exploration noise (small, symmetric jitter)
    const explorationWeight = 0.94 + 0.12 * random.real(0, 1);

    const finalWeight =
      historicalWeight *
      sessionWeight *
      recencyWeight *
      frequencyWeight *
      explorationWeight;

    // Keep every key selectable while allowing strong prioritization.
    return clamp(finalWeight, 0.08, 6.0);
  };

  /**
   * Select a character using weighted random selection.
   * Characters the user struggles with have higher probability of being selected.
   * Automatically excludes the previously selected character to prevent the same
   * exercise from appearing twice in a row.
   *
   * @param chars - Array of available characters to select from
   * @param excludeChar - Optional additional character to exclude (e.g., current character)
   * @returns The selected character
   */
  const selectWeightedCharacter = (
    chars: string[],
    excludeChar?: string,
  ): string => {
    const uniqueChars = Array.from(new Set(chars));
    if (uniqueChars.length === 0) return '';

    // Exclude both the explicit excludeChar and the last selected character
    // to prevent the same exercise from appearing twice in a row
    let availableChars = uniqueChars;

    if (excludeChar) {
      availableChars = availableChars.filter(c => c !== excludeChar);
    }

    // Only exclude last selected if we have more than 1 option remaining
    if (lastSelectedCharacter && availableChars.length > 1) {
      availableChars = availableChars.filter(c => c !== lastSelectedCharacter);
    }

    if (availableChars.length === 0) {
      // Fallback: if all filtered out, use original chars
      const selected = uniqueChars[0];
      lastSelectedCharacter = selected;
      return selected;
    }

    if (availableChars.length === 1) {
      const selected = availableChars[0];
      lastSelectedCharacter = selected;
      return selected;
    }

    // Calculate weights for all available characters
    const weights = availableChars.map(char => ({
      char,
      weight: calculateWeight(char, uniqueChars),
    }));

    // Calculate total weight
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

    // Weighted random selection
    let randomValue = random.real(0, totalWeight);
    for (const { char, weight } of weights) {
      randomValue -= weight;
      if (randomValue <= 0) {
        lastSelectedCharacter = char;
        return char;
      }
    }

    // Fallback (shouldn't happen)
    const fallback =
      availableChars[random.integer(0, availableChars.length - 1)];
    lastSelectedCharacter = fallback;
    return fallback;
  };

  /**
   * Update character weight after an answer.
   * Call this after the user answers correctly or incorrectly.
   *
   * @param char - The character that was answered
   * @param isCorrect - Whether the answer was correct
   */
  const updateCharacterWeight = (char: string, isCorrect: boolean): void => {
    if (!char) return;
    const entry = getOrCreateWeight(char);
    if (isCorrect) {
      entry.historicalCorrect += 1;
      entry.sessionCorrect += 1;
    } else {
      entry.historicalWrong += 1;
      entry.sessionWrong += 1;
    }
    sessionAnswerCount += 1;
    void persistHistorical();
  };

  /**
   * Mark a character as seen (updates lastSeen timestamp).
   * Call this when a new character is displayed to the user.
   *
   * @param char - The character being displayed
   */
  const markCharacterSeen = (char: string): void => {
    if (!char) return;
    const entry = getOrCreateWeight(char);
    entry.seenCountInSession += 1;
    entry.lastSeenSelectionIndex = sessionSelectionIndex;
    sessionSelectionIndex += 1;
    totalSelectionsInSession += 1;
  };

  /**
   * Reset all character weights.
   * Useful when starting a new training session.
   */
  const reset = async (): Promise<void> => {
    characterWeights.clear();
    resetSessionState();
    currentSessionToken = null;
    try {
      await localforage.removeItem(persistKey);
    } catch (error) {
      console.warn('[AdaptiveSelection] Failed to clear storage:', error);
    }
  };

  /**
   * Get current weight data for a character (for debugging/analytics).
   *
   * @param char - The character to get weight for
   * @returns The character's weight data or undefined if not tracked
   */
  const getCharacterWeight = (char: string): CharacterWeight | undefined => {
    return characterWeights.get(char);
  };

  /**
   * Get statistics about the current weight data.
   */
  const getStats = () => {
    const entries = Array.from(characterWeights.entries());
    const totalHistoricalCorrect = entries.reduce(
      (sum, [, w]) => sum + w.historicalCorrect,
      0,
    );
    const totalHistoricalWrong = entries.reduce(
      (sum, [, w]) => sum + w.historicalWrong,
      0,
    );
    const totalSessionCorrect = entries.reduce(
      (sum, [, w]) => sum + w.sessionCorrect,
      0,
    );
    const totalSessionWrong = entries.reduce(
      (sum, [, w]) => sum + w.sessionWrong,
      0,
    );

    return {
      totalCharacters: characterWeights.size,
      totalHistoricalCorrect,
      totalHistoricalWrong,
      historicalAccuracy:
        totalHistoricalCorrect + totalHistoricalWrong > 0
          ? totalHistoricalCorrect /
            (totalHistoricalCorrect + totalHistoricalWrong)
          : 0,
      totalSessionCorrect,
      totalSessionWrong,
      sessionAccuracy:
        totalSessionCorrect + totalSessionWrong > 0
          ? totalSessionCorrect / (totalSessionCorrect + totalSessionWrong)
          : 0,
      sessionAnswerCount,
      totalSelectionsInSession,
    };
  };

  /**
   * Ensure weights are loaded from storage before use.
   * Call this during app initialization.
   */
  const ensureLoaded = async (): Promise<void> => {
    await loadFromStorage();
  };

  /**
   * Force an immediate save to storage.
   */
  const forceSave = async (): Promise<void> => {
    await persistHistorical();
  };

  /**
   * Start or switch to a new session token.
   * This resets only session-scoped adaptation signals and keeps historical stats.
   */
  const startSession = (sessionToken?: string): void => {
    const normalizedToken = sessionToken ?? null;
    if (currentSessionToken === normalizedToken) return;
    currentSessionToken = normalizedToken;
    resetSessionState();
  };

  const registerQuestionFormatResult = (
    word: string,
    format: string,
    isCorrect: boolean,
  ): void => {
    if (!word || !format) return;
    const performance = getOrCreateFormatPerformance(word, format);
    if (isCorrect) {
      performance.correct += 1;
      performance.pendingWrong = false;
      return;
    }

    performance.wrong += 1;
    performance.pendingWrong = true;
  };

  const getPreferredLockedFormat = (
    word: string,
    candidateFormats: string[],
  ): string | null => {
    if (!word || candidateFormats.length === 0) return null;
    const formatMap = sessionFormatPerformance.get(word);
    if (!formatMap) return null;

    const scored = candidateFormats
      .map((format, index) => {
        const perf = formatMap.get(format);
        if (!perf || !perf.pendingWrong) return null;
        const attempts = perf.correct + perf.wrong;
        const accuracy = attempts > 0 ? perf.correct / attempts : 1;
        return { format, index, accuracy, wrong: perf.wrong };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    if (scored.length === 0) return null;

    scored.sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      if (a.wrong !== b.wrong) return b.wrong - a.wrong;
      return a.index - b.index;
    });

    return scored[0].format;
  };

  return {
    selectWeightedCharacter,
    updateCharacterWeight,
    markCharacterSeen,
    reset,
    getCharacterWeight,
    getStats,
    ensureLoaded,
    forceSave,
    startSession,
    registerQuestionFormatResult,
    getPreferredLockedFormat,
  };
}

// Type for the adaptive selector instance
export type AdaptiveSelector = ReturnType<typeof createAdaptiveSelector>;

// Global selector instance for shared state across components
// This ensures weights persist when switching between game modes in the same session
let globalSelector: AdaptiveSelector | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Get the global adaptive selector instance.
 * Creates one if it doesn't exist and loads persisted data.
 * Use this for shared state across game modes in the same training session.
 */
export function getGlobalAdaptiveSelector(): AdaptiveSelector {
  if (!globalSelector) {
    globalSelector = createAdaptiveSelector('global');
    // Start loading in background (non-blocking)
    initPromise = globalSelector.ensureLoaded();
  }
  return globalSelector;
}

/**
 * Wait for the global selector to finish loading persisted data.
 * Call this during app initialization if you need to ensure data is loaded.
 */
export async function waitForAdaptiveSelectorReady(): Promise<void> {
  if (!globalSelector) {
    getGlobalAdaptiveSelector();
  }
  if (initPromise) {
    await initPromise;
  }
}

/**
 * Reset the global adaptive selector.
 * Call this when starting a completely new training session.
 */
export async function resetGlobalAdaptiveSelector(): Promise<void> {
  if (globalSelector) {
    await globalSelector.reset();
  }
}
