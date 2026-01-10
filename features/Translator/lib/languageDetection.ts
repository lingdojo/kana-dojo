import type { LanguageDetectionResult } from '../types';

/**
 * Detect if text is Japanese or English
 * @param text - Text to analyze
 * @returns Detected language with confidence score
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return { language: 'en', confidence: 0 };
  }

  const trimmedText = text.trim();

  // Count Japanese characters
  const hiraganaCount = (trimmedText.match(/[\u3040-\u309F]/g) || []).length;
  const katakanaCount = (trimmedText.match(/[\u30A0-\u30FF]/g) || []).length;
  const kanjiCount = (trimmedText.match(/[\u4E00-\u9FAF]/g) || []).length;
  const japaneseCount = hiraganaCount + katakanaCount + kanjiCount;

  // Count Latin characters (excluding spaces and punctuation)
  const latinCount = (trimmedText.match(/[a-zA-Z]/g) || []).length;

  // Total meaningful characters
  const totalChars = japaneseCount + latinCount;

  if (totalChars === 0) {
    // Only punctuation or numbers
    return { language: 'en', confidence: 0.3 };
  }

  // Calculate Japanese ratio
  const japaneseRatio = japaneseCount / totalChars;

  // Determine language and confidence
  if (japaneseRatio > 0.5) {
    // More than 50% Japanese characters = Japanese
    const confidence = Math.min(0.6 + japaneseRatio * 0.4, 1);
    return { language: 'ja', confidence };
  } else if (japaneseRatio > 0) {
    // Some Japanese characters but less than 50% = likely English with some Japanese
    const confidence = Math.min(0.5 + (1 - japaneseRatio) * 0.5, 1);
    return { language: 'en', confidence };
  } else {
    // No Japanese characters = English
    const confidence = latinCount > 5 ? 0.95 : 0.7;
    return { language: 'en', confidence };
  }
}

/**
 * Format confidence as percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(
  confidence: number
): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}
