import { NextRequest, NextResponse } from 'next/server';
import {
  checkTranslateRateLimit,
  getClientIP,
  createRateLimitHeaders,
} from '@/shared/lib/rateLimit';
import {
  getRedisCachedJson,
  setRedisCachedJson,
} from '@/shared/lib/apiCache';

// Simple in-memory cache for translations (reduces API calls)
const translationCache = new Map<
  string,
  { translatedText: string; romanization?: string; timestamp: number }
>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache
const MAX_CACHE_SIZE = 500;
const CACHE_CLEANUP_THRESHOLD = 400; // Start cleanup when cache reaches this size
let cacheHits = 0;
let cacheMisses = 0;

function getCacheKey(text: string, source: string, target: string): string {
  return `${source}:${target}:${text}`;
}

/**
 * Clean up expired cache entries
 * Runs when cache size exceeds threshold to maintain performance
 * Uses both TTL expiration and LRU eviction for memory efficiency
 */
function cleanupCache() {
  // Only cleanup if cache is getting large (avoid overhead on every request)
  if (translationCache.size < CACHE_CLEANUP_THRESHOLD) {
    return;
  }

  const now = Date.now();
  let expiredCount = 0;

  // First pass: Remove expired entries
  for (const [key, value] of translationCache) {
    if (now - value.timestamp > CACHE_TTL) {
      translationCache.delete(key);
      expiredCount++;
    }
  }

  // Second pass: If still too large, use LRU eviction
  if (translationCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(translationCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = Math.ceil((translationCache.size - MAX_CACHE_SIZE) * 1.5); // Remove 50% more to reduce frequent cleanups
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      translationCache.delete(entries[i][0]);
    }
  }

  // Log cache statistics in production for monitoring
  if (process.env.NODE_ENV === 'production' && expiredCount > 0) {
    console.warn(
      `Translation cache cleanup: removed ${expiredCount} expired entries, current size: ${translationCache.size}/${MAX_CACHE_SIZE}`,
    );
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
    },
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
        import('kuroshiro-analyzer-kuromoji'),
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
      romajiSystem: 'hepburn',
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
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

/**
 * POST /api/translate
 * Translates text between English and Japanese using Google Cloud Translation API
 */
export async function POST(request: NextRequest) {
  // Rate limiting check - protect against abuse
  const clientIP = getClientIP(request);
  const rateLimitResult = await checkTranslateRateLimit(clientIP);

  if (!rateLimitResult.allowed) {
    const headers = createRateLimitHeaders(rateLimitResult);

    // Provide specific error message based on reason
    let message: string;
    if (rateLimitResult.reason === 'daily_quota') {
      message = 'Daily translation limit reached. Please try again tomorrow.';
    } else if (rateLimitResult.reason === 'global_limit') {
      message =
        'Service is experiencing high demand. Please try again in a moment.';
    } else {
      message = `Too many requests. Please wait ${rateLimitResult.retryAfter} seconds.`;
    }

    return NextResponse.json(
      {
        code: ERROR_CODES.RATE_LIMIT,
        message,
        error: message,
        status: 429,
        retryAfter: rateLimitResult.retryAfter,
      },
      { status: 429, headers },
    );
  }

  try {
    const body = (await request.json()) as TranslationRequestBody;
    const { text, sourceLanguage, targetLanguage } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Please enter valid text to translate.',
          error: 'Please enter valid text to translate.',
          status: 400,
        },
        { status: 400 },
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Please enter text to translate.',
          error: 'Please enter text to translate.',
          status: 400,
        },
        { status: 400 },
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Text exceeds maximum length of 5000 characters.',
          error: 'Text exceeds maximum length of 5000 characters.',
          status: 400,
        },
        { status: 400 },
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
          error: 'Invalid language selection.',
          status: 400,
        },
        { status: 400 },
      );
    }

    // Check cache first to reduce API calls
    const cacheKey = getCacheKey(text.trim(), sourceLanguage, targetLanguage);
    const redisCached = await getRedisCachedJson<{
      translatedText: string;
      romanization?: string;
    }>('translate', cacheKey);
    if (redisCached) {
      cacheHits++;
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
      const response = NextResponse.json({
        translatedText: redisCached.translatedText,
        romanization: redisCached.romanization,
        cached: true,
      });
      response.headers.set('Cache-Control', 'private, max-age=3600');
      rateLimitHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const cached = translationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      cacheHits++;
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
      const response = NextResponse.json({
        translatedText: cached.translatedText,
        romanization: cached.romanization,
        cached: true,
      });
      // Allow browser to cache translation results for 1 hour
      response.headers.set('Cache-Control', 'private, max-age=3600');
      // Include rate limit info
      rateLimitHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Cache miss - will call Google API
    cacheMisses++;

    // Get API key from environment
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_TRANSLATE_API_KEY is not configured');
      return NextResponse.json(
        {
          code: ERROR_CODES.AUTH_ERROR,
          message: 'Translation service configuration error.',
          error: 'Translation service configuration error.',
          status: 500,
        },
        { status: 500 },
      );
    }

    // Call Google Cloud Translation API
    const googleApiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const googleResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text',
      }),
    });

    // Handle rate limiting
    if (googleResponse.status === 429) {
      return NextResponse.json(
        {
          code: ERROR_CODES.RATE_LIMIT,
          message: 'Too many requests. Please wait a moment and try again.',
          error: 'Too many requests. Please wait a moment and try again.',
          status: 429,
        },
        { status: 429 },
      );
    }

    // Handle auth errors
    if (googleResponse.status === 401 || googleResponse.status === 403) {
      console.error('Google API authentication error:', googleResponse.status);
      return NextResponse.json(
        {
          code: ERROR_CODES.AUTH_ERROR,
          message: 'Translation service configuration error.',
          error: 'Translation service configuration error.',
          status: googleResponse.status,
        },
        { status: googleResponse.status },
      );
    }

    // Handle other errors
    if (!googleResponse.ok) {
      console.error('Google API error:', googleResponse.status);
      return NextResponse.json(
        {
          code: ERROR_CODES.API_ERROR,
          message: 'Translation service is temporarily unavailable.',
          error: 'Translation service is temporarily unavailable.',
          status: googleResponse.status,
        },
        { status: googleResponse.status },
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
    await setRedisCachedJson(
      'translate',
      cacheKey,
      {
        translatedText: translation.translatedText,
        romanization,
      },
      Math.ceil(CACHE_TTL / 1000),
    );

    translationCache.set(cacheKey, {
      translatedText: translation.translatedText,
      romanization,
      timestamp: Date.now(),
    });

    // Log cache stats periodically for monitoring (every 100 requests)
    const totalRequests = cacheHits + cacheMisses;
    if (
      process.env.NODE_ENV === 'production' &&
      totalRequests > 0 &&
      totalRequests % 100 === 0
    ) {
      const hitRate = ((cacheHits / totalRequests) * 100).toFixed(1);
      console.warn(
        `Translation cache stats: ${hitRate}% hit rate (${cacheHits} hits, ${cacheMisses} misses), size: ${translationCache.size}/${MAX_CACHE_SIZE}`,
      );
    }

    cleanupCache();

    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
    const response = NextResponse.json({
      translatedText: translation.translatedText,
      detectedSourceLanguage: translation.detectedSourceLanguage,
      romanization,
    });
    // Allow browser to cache translation results for 1 hour
    response.headers.set('Cache-Control', 'private, max-age=3600');
    // Include rate limit info
    rateLimitHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('Translation API error:', error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          code: ERROR_CODES.NETWORK_ERROR,
          message: 'Unable to connect. Please check your internet connection.',
          error: 'Unable to connect. Please check your internet connection.',
          status: 503,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        code: ERROR_CODES.API_ERROR,
        message: 'Translation service is temporarily unavailable.',
        error: 'Translation service is temporarily unavailable.',
        status: 500,
      },
      { status: 500 },
    );
  }
}
