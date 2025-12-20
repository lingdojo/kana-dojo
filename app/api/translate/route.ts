import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for translations (reduces API calls)
const translationCache = new Map<
  string,
  { translatedText: string; romanization?: string; timestamp: number }
>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache
const MAX_CACHE_SIZE = 500;

function getCacheKey(text: string, source: string, target: string): string {
  return `${source}:${target}:${text}`;
}

function cleanupCache() {
  if (translationCache.size > MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, value] of translationCache) {
      if (now - value.timestamp > CACHE_TTL) {
        translationCache.delete(key);
      }
    }
    // If still too large, remove oldest entries
    if (translationCache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(translationCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE / 2);
      toRemove.forEach(([key]) => translationCache.delete(key));
    }
  }
}

interface TranslationRequestBody {
  text: string;
  sourceLanguage: 'en' | 'ja';
  targetLanguage: 'en' | 'ja';
}

interface GoogleTranslateResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

// Type for kuroshiro instance (using type assertion since it's dynamically imported)
type KuroshiroInstance = {
  convert: (
    text: string,
    options: {
      to: 'hiragana' | 'katakana' | 'romaji';
      mode?: 'normal' | 'spaced' | 'okurigana' | 'furigana';
      romajiSystem?: 'nippon' | 'passport' | 'hepburn';
    }
  ) => Promise<string>;
};

// Singleton kuroshiro instance for reuse across requests
let kuroshiroInstance: KuroshiroInstance | null = null;
let kuroshiroInitPromise: Promise<KuroshiroInstance> | null = null;

/**
 * Get or initialize the kuroshiro instance
 * Uses singleton pattern to avoid reinitializing on every request
 * LAZY LOADED: Only imports kuroshiro packages when actually needed (828KB savings if not used)
 */
async function getKuroshiro(): Promise<KuroshiroInstance> {
  if (kuroshiroInstance) {
    return kuroshiroInstance;
  }

  if (kuroshiroInitPromise) {
    return kuroshiroInitPromise;
  }

  kuroshiroInitPromise = (async () => {
    // Lazy load kuroshiro and analyzer (only when romanization is needed)
    const [{ default: Kuroshiro }, { default: KuromojiAnalyzer }] =
      await Promise.all([
        import('kuroshiro'),
        import('kuroshiro-analyzer-kuromoji')
      ]);

    const kuroshiro = new Kuroshiro();
    const analyzer = new KuromojiAnalyzer();
    await kuroshiro.init(analyzer);
    // Type assertion: kuroshiro is a JS library without types, but matches our interface
    kuroshiroInstance = kuroshiro as KuroshiroInstance;
    kuroshiroInitPromise = null;
    return kuroshiro as KuroshiroInstance;
  })();

  return kuroshiroInitPromise;
}

/**
 * Generate romanization (romaji) for Japanese text
 * Uses kuroshiro with kuromoji analyzer for full kanji support
 */
async function generateRomanization(japaneseText: string): Promise<string> {
  if (!japaneseText) {
    return '';
  }

  try {
    const kuroshiro = await getKuroshiro();
    const romaji = await kuroshiro.convert(japaneseText, {
      to: 'romaji',
      mode: 'spaced',
      romajiSystem: 'hepburn'
    });
    return romaji;
  } catch (error) {
    console.error('Kuroshiro conversion error:', error);
    return '';
  }
}

/**
 * Error codes for translation API
 */
const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  RATE_LIMIT: 'RATE_LIMIT',
  API_ERROR: 'API_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

/**
 * POST /api/translate
 * Translates text between English and Japanese using Google Cloud Translation API
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TranslationRequestBody;
    const { text, sourceLanguage, targetLanguage } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Please enter valid text to translate.',
          status: 400
        },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Please enter text to translate.',
          status: 400
        },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Text exceeds maximum length of 5000 characters.',
          status: 400
        },
        { status: 400 }
      );
    }

    // Validate languages
    const validLanguages = ['en', 'ja'];
    if (
      !validLanguages.includes(sourceLanguage) ||
      !validLanguages.includes(targetLanguage)
    ) {
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Invalid language selection.',
          status: 400
        },
        { status: 400 }
      );
    }

    // Check cache first to reduce API calls
    const cacheKey = getCacheKey(text.trim(), sourceLanguage, targetLanguage);
    const cached = translationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        translatedText: cached.translatedText,
        romanization: cached.romanization,
        cached: true
      });
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_TRANSLATE_API_KEY is not configured');
      return NextResponse.json(
        {
          code: ERROR_CODES.AUTH_ERROR,
          message: 'Translation service configuration error.',
          status: 500
        },
        { status: 500 }
      );
    }

    // Call Google Cloud Translation API
    const googleApiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const googleResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      })
    });

    // Handle rate limiting
    if (googleResponse.status === 429) {
      return NextResponse.json(
        {
          code: ERROR_CODES.RATE_LIMIT,
          message: 'Too many requests. Please wait a moment and try again.',
          status: 429
        },
        { status: 429 }
      );
    }

    // Handle auth errors
    if (googleResponse.status === 401 || googleResponse.status === 403) {
      console.error('Google API authentication error:', googleResponse.status);
      return NextResponse.json(
        {
          code: ERROR_CODES.AUTH_ERROR,
          message: 'Translation service configuration error.',
          status: googleResponse.status
        },
        { status: googleResponse.status }
      );
    }

    // Handle other errors
    if (!googleResponse.ok) {
      console.error('Google API error:', googleResponse.status);
      return NextResponse.json(
        {
          code: ERROR_CODES.API_ERROR,
          message: 'Translation service is temporarily unavailable.',
          status: googleResponse.status
        },
        { status: googleResponse.status }
      );
    }

    const data = (await googleResponse.json()) as GoogleTranslateResponse;
    const translation = data.data.translations[0];

    // Generate romanization when translating TO Japanese
    let romanization: string | undefined;
    if (targetLanguage === 'ja') {
      romanization = await generateRomanization(translation.translatedText);
      // Only include if we got a non-empty result
      if (!romanization) {
        romanization = undefined;
      }
    }

    // Cache the result
    translationCache.set(cacheKey, {
      translatedText: translation.translatedText,
      romanization,
      timestamp: Date.now()
    });
    cleanupCache();

    return NextResponse.json({
      translatedText: translation.translatedText,
      detectedSourceLanguage: translation.detectedSourceLanguage,
      romanization
    });
  } catch (error) {
    console.error('Translation API error:', error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          code: ERROR_CODES.NETWORK_ERROR,
          message: 'Unable to connect. Please check your internet connection.',
          status: 503
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        code: ERROR_CODES.API_ERROR,
        message: 'Translation service is temporarily unavailable.',
        status: 500
      },
      { status: 500 }
    );
  }
}
