export interface AnalyzedToken {
  surface: string; // The displayed text
  reading?: string; // Hiragana reading
  basicForm?: string; // Dictionary form
  pos: string; // Part of speech tag (Noun, Verb, etc.)
  posDetail: string; // Detailed POS info
  translation?: string; // English meaning (if available)
}

interface TextAnalysisResponse {
  tokens: AnalyzedToken[];
  cached?: boolean;
}

// Client-side cache
const clientCache = new Map<
  string,
  { tokens: AnalyzedToken[]; timestamp: number }
>();
const CLIENT_CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const MAX_CLIENT_CACHE_SIZE = 50;

function cleanupClientCache() {
  if (clientCache.size > MAX_CLIENT_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, value] of clientCache) {
      if (now - value.timestamp > CLIENT_CACHE_TTL) {
        clientCache.delete(key);
      }
    }
  }
}

/**
 * Analyze Japanese text to extract word-by-word information
 * @param text Japanese text to analyze
 * @returns Array of analyzed tokens with readings, POS tags, and meanings
 */
export async function analyzeText(text: string): Promise<AnalyzedToken[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Check client cache
  const cached = clientCache.get(text);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.tokens;
  }

  try {
    const response = await fetch('/api/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze text');
    }

    const data: TextAnalysisResponse = await response.json();

    // Cache the result
    clientCache.set(text, {
      tokens: data.tokens,
      timestamp: Date.now()
    });
    cleanupClientCache();

    return data.tokens;
  } catch (error) {
    console.error('Text analysis error:', error);
    return [];
  }
}

/**
 * Check if text contains Japanese characters (needs analysis)
 */
export function needsAnalysis(text: string): boolean {
  // Check for Hiragana, Katakana, or Kanji
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  return japaneseRegex.test(text);
}
