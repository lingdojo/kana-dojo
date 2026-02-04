import { NextRequest, NextResponse } from 'next/server';
import {
  checkAnalyzeRateLimit,
  getClientIP,
  createRateLimitHeaders,
} from '@/shared/lib/rateLimit';
import {
  getRedisCachedJson,
  setRedisCachedJson,
} from '@/shared/lib/apiCache';
import type { ApiErrorResponse } from '@/shared/types/api';

// Type for kuromoji token
interface KuromojiToken {
  surface_form: string; // The actual text
  pos: string; // Part of speech
  pos_detail_1: string; // POS detail 1
  pos_detail_2: string; // POS detail 2
  pos_detail_3: string; // POS detail 3
  conjugated_type: string; // Conjugation type
  conjugated_form: string; // Conjugation form
  basic_form: string; // Dictionary form
  reading: string; // Katakana reading
  pronunciation: string; // Pronunciation
}

// Simplified token for client
export interface AnalyzedToken {
  surface: string; // The displayed text
  reading?: string; // Hiragana reading
  basicForm?: string; // Dictionary form
  pos: string; // Part of speech tag
  posDetail: string; // Detailed POS info
  translation?: string; // English meaning (if available)
}

const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  RATE_LIMIT: 'RATE_LIMIT',
  API_ERROR: 'API_ERROR',
} as const;

// Cache for analyzed text
const analysisCache = new Map<
  string,
  { tokens: AnalyzedToken[]; timestamp: number }
>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 200;
const CLEANUP_INTERVAL = 1000 * 60 * 5; // Cleanup every 5 minutes
let lastCleanupTime = 0;

/**
 * Clean up expired cache entries
 * Runs periodically and when cache exceeds max size
 */
function cleanupCache() {
  const now = Date.now();

  // Run TTL cleanup periodically
  if (now - lastCleanupTime > CLEANUP_INTERVAL) {
    lastCleanupTime = now;
    for (const [key, value] of analysisCache) {
      if (now - value.timestamp > CACHE_TTL) {
        analysisCache.delete(key);
      }
    }
  }

  // If still too large, remove oldest entries (LRU-style eviction)
  if (analysisCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(analysisCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE / 2);
    toRemove.forEach(([key]) => analysisCache.delete(key));
  }
}

// Type for kuroshiro instance
type KuroshiroInstance = {
  _analyzer: {
    parse: (text: string) => Promise<KuromojiToken[]>;
  };
};

// Singleton kuroshiro instance
let kuroshiroInstance: KuroshiroInstance | null = null;

/**
 * Get or initialize kuroshiro with kuromoji analyzer
 */
async function getKuroshiro(): Promise<KuroshiroInstance> {
  if (kuroshiroInstance) {
    return kuroshiroInstance;
  }

  const [{ default: Kuroshiro }, { default: KuromojiAnalyzer }] =
    await Promise.all([
      import('kuroshiro'),
      import('kuroshiro-analyzer-kuromoji'),
    ]);

  const kuroshiro = new Kuroshiro();
  const analyzer = new KuromojiAnalyzer();
  await kuroshiro.init(analyzer);
  kuroshiroInstance = kuroshiro as unknown as KuroshiroInstance;
  return kuroshiroInstance;
}

/**
 * Convert katakana reading to hiragana
 */
function katakanaToHiragana(katakana: string): string {
  if (!katakana) return '';
  return katakana.replace(/[\u30A1-\u30F6]/g, match => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * Get simplified POS tag (more readable)
 */
function getSimplifiedPOS(pos: string, _posDetail1: string): string {
  const posMap: Record<string, string> = {
    名詞: 'Noun',
    動詞: 'Verb',
    形容詞: 'Adjective',
    形容動詞: 'Na-adjective',
    副詞: 'Adverb',
    助詞: 'Particle',
    助動詞: 'Auxiliary',
    接続詞: 'Conjunction',
    連体詞: 'Pre-noun',
    感動詞: 'Interjection',
    記号: 'Symbol',
    フィラー: 'Filler',
    接頭詞: 'Prefix',
    接尾辞: 'Suffix',
  };

  return posMap[pos] || pos;
}

/**
 * Get POS detail information
 */
function getPOSDetail(token: KuromojiToken): string {
  const details: string[] = [];

  // Add conjugation info for verbs/adjectives
  if (token.conjugated_type !== '*') {
    details.push(token.conjugated_type);
  }
  if (token.conjugated_form !== '*') {
    details.push(token.conjugated_form);
  }

  // Add pos details
  if (token.pos_detail_1 !== '*') {
    details.push(token.pos_detail_1);
  }

  return details.join(', ') || 'No additional info';
}

/**
 * POST /api/analyze-text
 * Analyzes Japanese text using Kuromoji to extract word-by-word information
 */
export async function POST(request: NextRequest) {
  // Rate limiting check - protect against abuse
  const clientIP = getClientIP(request);
  const rateLimitResult = await checkAnalyzeRateLimit(clientIP);

  if (!rateLimitResult.allowed) {
    const headers = createRateLimitHeaders(rateLimitResult);

    let message: string;
    if (rateLimitResult.reason === 'daily_quota') {
      message = 'Daily analysis limit reached. Please try again tomorrow.';
    } else if (rateLimitResult.reason === 'global_limit') {
      message =
        'Service is experiencing high demand. Please try again in a moment.';
    } else {
      message = `Too many requests. Please wait ${rateLimitResult.retryAfter} seconds.`;
    }

    return NextResponse.json(
      {
        error: message,
        message,
        code: ERROR_CODES.RATE_LIMIT,
        status: 429,
        retryAfter: rateLimitResult.retryAfter,
      } satisfies ApiErrorResponse,
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const { text } = body as { text: string };

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Please provide valid text to analyze.',
          message: 'Please provide valid text to analyze.',
          code: ERROR_CODES.INVALID_INPUT,
          status: 400,
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          error: 'Text exceeds maximum length of 5000 characters.',
          message: 'Text exceeds maximum length of 5000 characters.',
          code: ERROR_CODES.INVALID_INPUT,
          status: 400,
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    // Check cache
    const redisCached = await getRedisCachedJson<{
      tokens: AnalyzedToken[];
    }>('analyze', text);
    if (redisCached) {
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
      const response = NextResponse.json({
        tokens: redisCached.tokens,
        cached: true,
      });
      rateLimitHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    }

    const cached = analysisCache.get(text);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
      const response = NextResponse.json({
        tokens: cached.tokens,
        cached: true,
      });
      rateLimitHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Get kuroshiro instance with kuromoji
    const kuroshiro = await getKuroshiro();

    // Parse text into tokens using kuromoji
    const kuromojiTokens = await kuroshiro._analyzer.parse(text);

    // Convert to simplified format
    const analyzedTokens: AnalyzedToken[] = kuromojiTokens.map(token => ({
      surface: token.surface_form,
      reading: katakanaToHiragana(token.reading),
      basicForm: token.basic_form !== '*' ? token.basic_form : undefined,
      pos: getSimplifiedPOS(token.pos, token.pos_detail_1),
      posDetail: getPOSDetail(token),
    }));

    // Cache the result
    await setRedisCachedJson(
      'analyze',
      text,
      { tokens: analyzedTokens },
      Math.ceil(CACHE_TTL / 1000),
    );

    analysisCache.set(text, {
      tokens: analyzedTokens,
      timestamp: Date.now(),
    });
    cleanupCache();

    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
    const response = NextResponse.json({ tokens: analyzedTokens });
    rateLimitHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('Text analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze text. Please try again.',
        message: 'Failed to analyze text. Please try again.',
        code: ERROR_CODES.API_ERROR,
        status: 500,
      } satisfies ApiErrorResponse,
      { status: 500 },
    );
  }
}
