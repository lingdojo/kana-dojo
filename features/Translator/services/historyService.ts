import localforage from 'localforage';
import type { TranslationEntry } from '../types';

const STORAGE_KEY = 'kanadojo-translation-history';

// Configure localforage instance for translation history
const historyStore = localforage.createInstance({
  name: 'kanadojo',
  storeName: 'translation_history'
});

/**
 * Load all translation history entries from localforage
 * @returns Promise resolving to array of TranslationEntry, sorted by timestamp descending
 */
export async function loadHistory(): Promise<TranslationEntry[]> {
  try {
    const history = await historyStore.getItem<TranslationEntry[]>(STORAGE_KEY);
    if (!history) {
      return [];
    }
    // Sort by timestamp descending (most recent first)
    return history.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load translation history:', error);
    return [];
  }
}

/**
 * Save a new translation entry to history
 * @param entry The translation entry to save
 * @returns Promise resolving to the updated history array
 */
export async function saveEntry(
  entry: TranslationEntry
): Promise<TranslationEntry[]> {
  try {
    const history = await loadHistory();
    const updatedHistory = [entry, ...history];
    await historyStore.setItem(STORAGE_KEY, updatedHistory);
    return updatedHistory;
  } catch (error) {
    console.error('Failed to save translation entry:', error);
    throw error;
  }
}

/**
 * Delete a specific translation entry from history by ID
 * @param id The ID of the entry to delete
 * @returns Promise resolving to the updated history array
 */
export async function deleteEntry(id: string): Promise<TranslationEntry[]> {
  try {
    const history = await loadHistory();
    const updatedHistory = history.filter(entry => entry.id !== id);
    await historyStore.setItem(STORAGE_KEY, updatedHistory);
    return updatedHistory;
  } catch (error) {
    console.error('Failed to delete translation entry:', error);
    throw error;
  }
}

/**
 * Clear all translation history
 * @returns Promise resolving when history is cleared
 */
export async function clearAll(): Promise<void> {
  try {
    await historyStore.setItem(STORAGE_KEY, []);
  } catch (error) {
    console.error('Failed to clear translation history:', error);
    throw error;
  }
}
