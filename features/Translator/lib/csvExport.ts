import type { TranslationEntry } from '../types';

/**
 * Convert translation history to CSV format
 */
export function translateHistoryToCSV(entries: TranslationEntry[]): string {
  if (entries.length === 0) {
    return '';
  }

  // CSV headers
  const headers = [
    'Timestamp',
    'Source Language',
    'Target Language',
    'Source Text',
    'Translated Text',
    'Romanization'
  ];

  // Create CSV rows
  const rows = entries.map(entry => {
    const date = new Date(entry.timestamp).toLocaleString();
    return [
      date,
      entry.sourceLanguage === 'en' ? 'English' : 'Japanese',
      entry.targetLanguage === 'en' ? 'English' : 'Japanese',
      escapeCSVField(entry.sourceText),
      escapeCSVField(entry.translatedText),
      entry.romanization ? escapeCSVField(entry.romanization) : ''
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
}

/**
 * Escape CSV field (handle quotes and commas)
 */
function escapeCSVField(field: string): string {
  // If field contains comma, newline, or quote, wrap in quotes and escape existing quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'translation-history.csv'): void {
  // Create blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export translation history to CSV file
 */
export function exportHistoryToCSV(entries: TranslationEntry[]): void {
  const csv = translateHistoryToCSV(entries);

  if (csv) {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `kanadojo-translations-${timestamp}.csv`;
    downloadCSV(csv, filename);
  }
}
