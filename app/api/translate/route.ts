import { NextRequest, NextResponse } from 'next/server';
import {
  checkTranslateUsageLimit,
  checkTranslateRateLimit,
  getClientIP,
  createRateLimitHeaders,
  createTranslateUsageHeaders,
} from '@/shared/infra/server/rateLimit';
import {
  getRedisCachedJson,
  setRedisCachedJson,
} from '@/shared/infra/server/apiCache';
import { captureServerEvent } from '@/shared/analytics/posthog-server';

// Per-route kill switch for translate-route PostHog events.
// Currently disabled to stay under the PostHog free plan event quota.
// Flip to `true` to re-enable all events emitted by this route.
// Other server-side PostHog callers are unaffected.
const TRANSLATE_ANALYTICS_ENABLED = false;
const trackTranslate: (
  event: string,
  properties?: Record<string, unknown>,
) => void = TRANSLATE_ANALYTICS_ENABLED
  ? captureServerEvent
  : () => {};

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
  verificationToken?: string;
  requestContext?: 'manual' | 'url-prefill';
}

interface GoogleTranslateResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

interface AzureTranslateResponseItem {
  detectedLanguage?: {
    language: string;
    score: number;
  };
  translations: Array<{
    text: string;
    to: string;
  }>;
}

interface TranslationProviderResult {
  translatedText: string;
  detectedSourceLanguage?: string;
  provider: 'azure' | 'google';
}

class TranslationProviderError extends Error {
  constructor(
    message: string,
    readonly provider: 'azure' | 'google',
    readonly status?: number,
    readonly authError = false,
  ) {
    super(message);
    this.name = 'TranslationProviderError';
  }
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
  VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED',
  API_ERROR: 'API_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|crawling|preview|facebookexternalhit|slurp|bingpreview|whatsapp|telegram|discord|headless/i;
const URL_AUTOTRANSLATE_CHAR_LIMIT = 300;

function isLikelyBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

async function verifyTurnstileToken(
  token: string | undefined,
  request: NextRequest,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) {
    return false;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: getClientIP(request),
        }),
      },
    );
    const data = (await response.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

async function translateWithAzure({
  text,
  sourceLanguage,
  targetLanguage,
}: {
  text: string;
  sourceLanguage: 'en' | 'ja';
  targetLanguage: 'en' | 'ja';
}): Promise<TranslationProviderResult> {
  const apiKey = process.env.AZURE_TRANSLATOR_KEY;
  if (!apiKey) {
    throw new TranslationProviderError(
      'AZURE_TRANSLATOR_KEY is not configured',
      'azure',
      500,
      true,
    );
  }

  const endpoint =
    process.env.AZURE_TRANSLATOR_ENDPOINT ||
    'https://api.cognitive.microsofttranslator.com';
  const region = process.env.AZURE_TRANSLATOR_REGION;
  const azureApiUrl = new URL('/translate', endpoint);
  azureApiUrl.searchParams.set('api-version', '3.0');
  azureApiUrl.searchParams.set('from', sourceLanguage);
  azureApiUrl.searchParams.set('to', targetLanguage);
  azureApiUrl.searchParams.set('textType', 'plain');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': apiKey,
  };
  if (region) {
    headers['Ocp-Apim-Subscription-Region'] = region;
  }

  const azureResponse = await fetch(azureApiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify([{ Text: text }]),
  });

  if (!azureResponse.ok) {
    throw new TranslationProviderError(
      `Azure Translator error: ${azureResponse.status}`,
      'azure',
      azureResponse.status,
      azureResponse.status === 401 || azureResponse.status === 403,
    );
  }

  const data = (await azureResponse.json()) as AzureTranslateResponseItem[];
  const translation = data[0]?.translations[0];
  if (!translation?.text) {
    throw new TranslationProviderError(
      'Azure Translator returned an empty translation',
      'azure',
      502,
    );
  }

  return {
    translatedText: translation.text,
    detectedSourceLanguage: data[0]?.detectedLanguage?.language,
    provider: 'azure',
  };
}

async function translateWithGoogle({
  text,
  sourceLanguage,
  targetLanguage,
}: {
  text: string;
  sourceLanguage: 'en' | 'ja';
  targetLanguage: 'en' | 'ja';
}): Promise<TranslationProviderResult> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    throw new TranslationProviderError(
      'GOOGLE_TRANSLATE_API_KEY is not configured',
      'google',
      500,
      true,
    );
  }

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

  if (!googleResponse.ok) {
    throw new TranslationProviderError(
      `Google Translate error: ${googleResponse.status}`,
      'google',
      googleResponse.status,
      googleResponse.status === 401 || googleResponse.status === 403,
    );
  }

  const data = (await googleResponse.json()) as GoogleTranslateResponse;
  const translation = data.data.translations[0];
  if (!translation?.translatedText) {
    throw new TranslationProviderError(
      'Google Translate returned an empty translation',
      'google',
      502,
    );
  }

  return {
    translatedText: translation.translatedText,
    detectedSourceLanguage: translation.detectedSourceLanguage,
    provider: 'google',
  };
}

async function translateWithFallback({
  text,
  sourceLanguage,
  targetLanguage,
}: {
  text: string;
  sourceLanguage: 'en' | 'ja';
  targetLanguage: 'en' | 'ja';
}): Promise<TranslationProviderResult> {
  try {
    return await translateWithAzure({ text, sourceLanguage, targetLanguage });
  } catch (azureError) {
    const status =
      azureError instanceof TranslationProviderError
        ? azureError.status
        : undefined;
    console.error('Azure Translator failed, falling back to Google:', status);
    return translateWithGoogle({ text, sourceLanguage, targetLanguage });
  }
}

/**
 * POST /api/translate
 * Translates text between English and Japanese using Azure Translator first,
 * with Google Cloud Translation as a secondary fallback.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = (await request.json()) as TranslationRequestBody;
    const {
      text,
      sourceLanguage,
      targetLanguage,
      verificationToken,
      requestContext = 'manual',
    } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      trackTranslate('translate_rejected', {
        reason: 'invalid_input',
        status: 400,
        char_count: 0,
      });
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
      trackTranslate('translate_rejected', {
        reason: 'invalid_input',
        status: 400,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: 0,
      });
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
      trackTranslate('translate_rejected', {
        reason: 'invalid_input',
        status: 400,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: text.length,
      });
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
      trackTranslate('translate_rejected', {
        reason: 'invalid_input',
        status: 400,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: text.length,
      });
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

    if (sourceLanguage === targetLanguage) {
      trackTranslate('translate_rejected', {
        reason: 'invalid_input',
        status: 400,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: text.length,
      });
      return NextResponse.json(
        {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Please choose different source and target languages.',
          error: 'Please choose different source and target languages.',
          status: 400,
        },
        { status: 400 },
      );
    }

    // Check cache first to reduce API calls
    const normalizedText = text.trim();
    const cacheKey = getCacheKey(
      normalizedText,
      sourceLanguage,
      targetLanguage,
    );
    const redisCached = await getRedisCachedJson<{
      translatedText: string;
      romanization?: string;
    }>('translate', cacheKey);
    if (redisCached) {
      cacheHits++;
      trackTranslate('translate_cache_hit', {
        cache_layer: 'redis',
        source: sourceLanguage,
        target: targetLanguage,
        char_count: normalizedText.length,
        request_context: requestContext,
      });
      const response = NextResponse.json({
        translatedText: redisCached.translatedText,
        romanization: redisCached.romanization,
        cached: true,
      });
      response.headers.set('Cache-Control', 'private, max-age=3600');
      return response;
    }

    const cached = translationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      cacheHits++;
      trackTranslate('translate_cache_hit', {
        cache_layer: 'memory',
        source: sourceLanguage,
        target: targetLanguage,
        char_count: normalizedText.length,
        request_context: requestContext,
      });
      const response = NextResponse.json({
        translatedText: cached.translatedText,
        romanization: cached.romanization,
        cached: true,
      });
      // Allow browser to cache translation results for 1 hour
      response.headers.set('Cache-Control', 'private, max-age=3600');
      return response;
    }

    if (isLikelyBot(request)) {
      trackTranslate('translate_rejected', {
        reason: 'bot',
        status: 429,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: normalizedText.length,
        request_context: requestContext,
      });
      return NextResponse.json(
        {
          code: ERROR_CODES.RATE_LIMIT,
          message: 'Translation is unavailable for automated requests.',
          error: 'Translation is unavailable for automated requests.',
          status: 429,
        },
        { status: 429 },
      );
    }

    if (
      requestContext === 'url-prefill' &&
      normalizedText.length > URL_AUTOTRANSLATE_CHAR_LIMIT
    ) {
      trackTranslate('translate_rejected', {
        reason: 'verification_required',
        status: 403,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: normalizedText.length,
        request_context: requestContext,
      });
      return NextResponse.json(
        {
          code: ERROR_CODES.VERIFICATION_REQUIRED,
          message: 'Please use the translate button for longer text.',
          error: 'Please use the translate button for longer text.',
          status: 403,
        },
        { status: 403 },
      );
    }

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

      trackTranslate('translate_rejected', {
        reason: 'rate_limit',
        status: 429,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: normalizedText.length,
        request_context: requestContext,
        rate_limit_reason: rateLimitResult.reason,
      });
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

    const verified = await verifyTurnstileToken(verificationToken, request);
    const usageResult = await checkTranslateUsageLimit(
      clientIP,
      normalizedText.length,
      { verified },
    );
    const usageHeaders = createTranslateUsageHeaders(usageResult);

    if (!usageResult.allowed) {
      const message =
        usageResult.reason === 'global_monthly_char_quota'
          ? 'Service is experiencing high demand. Please try again later.'
          : 'Daily translation limit reached. Please try again later.';

      trackTranslate('translate_rejected', {
        reason: 'usage_limit',
        status: 429,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: normalizedText.length,
        request_context: requestContext,
        rate_limit_reason: usageResult.reason,
      });
      return NextResponse.json(
        {
          code: ERROR_CODES.RATE_LIMIT,
          message,
          error: message,
          status: 429,
          retryAfter: usageResult.retryAfter,
        },
        { status: 429, headers: usageHeaders },
      );
    }

    if (
      usageResult.requiresVerification &&
      process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    ) {
      trackTranslate('translate_rejected', {
        reason: 'verification_required',
        status: 403,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: normalizedText.length,
        request_context: requestContext,
      });
      return NextResponse.json(
        {
          code: ERROR_CODES.VERIFICATION_REQUIRED,
          message: 'Please verify before translating more text.',
          error: 'Please verify before translating more text.',
          status: 403,
        },
        { status: 403, headers: usageHeaders },
      );
    }

    // Cache miss - will call the translation provider.
    cacheMisses++;

    let translation: TranslationProviderResult;
    try {
      translation = await translateWithFallback({
        text: normalizedText,
        sourceLanguage,
        targetLanguage,
      });
    } catch (error) {
      const providerError =
        error instanceof TranslationProviderError ? error : null;
      const status = providerError?.status || 500;
      const errorCategory = providerError?.authError
        ? 'auth'
        : providerError?.status === 429
          ? 'rate_limit'
          : 'api';

      trackTranslate('translate_provider_error', {
        error_category: errorCategory,
        status,
        latency_ms: Date.now() - startTime,
        source: sourceLanguage,
        target: targetLanguage,
        char_count: normalizedText.length,
        request_context: requestContext,
      });

      if (providerError?.status === 429) {
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

      if (providerError?.authError) {
        console.error('Translation provider authentication error:', status);
        return NextResponse.json(
          {
            code: ERROR_CODES.AUTH_ERROR,
            message: 'Translation service configuration error.',
            error: 'Translation service configuration error.',
            status,
          },
          { status },
        );
      }

      console.error('Translation provider error:', status);
      return NextResponse.json(
        {
          code: ERROR_CODES.API_ERROR,
          message: 'Translation service is temporarily unavailable.',
          error: 'Translation service is temporarily unavailable.',
          status,
        },
        { status },
      );
    }

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

    trackTranslate('translate_success', {
      provider: translation.provider,
      latency_ms: Date.now() - startTime,
      source: sourceLanguage,
      target: targetLanguage,
      char_count: normalizedText.length,
      request_context: requestContext,
    });

    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
    const response = NextResponse.json({
      translatedText: translation.translatedText,
      detectedSourceLanguage: translation.detectedSourceLanguage,
      romanization,
      provider: translation.provider,
    });
    // Allow browser to cache translation results for 1 hour
    response.headers.set('Cache-Control', 'private, max-age=3600');
    // Include rate limit info
    rateLimitHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    usageHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('Translation API error:', error);

    const isNetworkError =
      error instanceof TypeError && error.message.includes('fetch');

    trackTranslate('translate_unhandled_error', {
      error_category: isNetworkError ? 'network' : 'unknown',
      status: isNetworkError ? 503 : 500,
      latency_ms: Date.now() - startTime,
    });

    // Check if it's a network error
    if (isNetworkError) {
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
