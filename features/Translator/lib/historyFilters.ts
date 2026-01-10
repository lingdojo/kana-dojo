import type { TranslationEntry, Language } from '../types';

export interface HistoryFilters {
  searchQuery: string;
  sourceLanguage: Language | 'all';
  targetLanguage: Language | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

/**
 * Filter translation history based on criteria
 */
export function filterHistory(
  entries: TranslationEntry[],
  filters: HistoryFilters
): TranslationEntry[] {
  let filtered = [...entries];

  // Search filter (searches in source and translated text)
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      entry =>
        entry.sourceText.toLowerCase().includes(query) ||
        entry.translatedText.toLowerCase().includes(query) ||
        (entry.romanization && entry.romanization.toLowerCase().includes(query))
    );
  }

  // Source language filter
  if (filters.sourceLanguage !== 'all') {
    filtered = filtered.filter(
      entry => entry.sourceLanguage === filters.sourceLanguage
    );
  }

  // Target language filter
  if (filters.targetLanguage !== 'all') {
    filtered = filtered.filter(
      entry => entry.targetLanguage === filters.targetLanguage
    );
  }

  // Date range filter
  if (filters.dateRange !== 'all') {
    const now = Date.now();
    const ranges = {
      today: 24 * 60 * 60 * 1000, // 1 day
      week: 7 * 24 * 60 * 60 * 1000, // 7 days
      month: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    const rangeMs = ranges[filters.dateRange];
    const cutoff = now - rangeMs;

    filtered = filtered.filter(entry => entry.timestamp >= cutoff);
  }

  return filtered;
}

/**
 * Get default filters
 */
export function getDefaultFilters(): HistoryFilters {
  return {
    searchQuery: '',
    sourceLanguage: 'all',
    targetLanguage: 'all',
    dateRange: 'all'
  };
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: HistoryFilters): boolean {
  return (
    filters.searchQuery.trim() !== '' ||
    filters.sourceLanguage !== 'all' ||
    filters.targetLanguage !== 'all' ||
    filters.dateRange !== 'all'
  );
}

/**
 * Get filter summary for display
 */
export function getFilterSummary(
  filters: HistoryFilters,
  totalCount: number,
  filteredCount: number
): string {
  if (!hasActiveFilters(filters)) {
    return `${totalCount} ${totalCount === 1 ? 'translation' : 'translations'}`;
  }

  return `${filteredCount} of ${totalCount} ${totalCount === 1 ? 'translation' : 'translations'}`;
}
