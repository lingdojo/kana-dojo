import { NextRequest, NextResponse } from 'next/server';

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

// Cache for analyzed text
const analysisCache = new Map<
  string,
  { tokens: AnalyzedToken[]; timestamp: number }
>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 200;

function cleanupCache() {
  if (analysisCache.size > MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, value] of analysisCache) {
      if (now - value.timestamp > CACHE_TTL) {
        analysisCache.delete(key);
      }
    }
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
    await Promise.all([import('kuroshiro'), import('kuroshiro-analyzer-kuromoji')]);

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
function getSimplifiedPOS(pos: string, posDetail1: string): string {
  const posMap: Record<string, string> = {
    '名詞': 'Noun',
    '動詞': 'Verb',
    '形容詞': 'Adjective',
    '形容動詞': 'Na-adjective',
    '副詞': 'Adverb',
    '助詞': 'Particle',
    '助動詞': 'Auxiliary',
    '接続詞': 'Conjunction',
    '連体詞': 'Pre-noun',
    '感動詞': 'Interjection',
    '記号': 'Symbol',
    'フィラー': 'Filler',
    '接頭詞': 'Prefix',
    '接尾辞': 'Suffix'
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
  try {
    const body = await request.json();
    const { text } = body as { text: string };

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide valid text to analyze.' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 5000 characters.' },
        { status: 400 }
      );
    }

    // Check cache
    const cached = analysisCache.get(text);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ tokens: cached.tokens, cached: true });
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
      posDetail: getPOSDetail(token)
    }));

    // Cache the result
    analysisCache.set(text, {
      tokens: analyzedTokens,
      timestamp: Date.now()
    });
    cleanupCache();

    return NextResponse.json({ tokens: analyzedTokens });
  } catch (error) {
    console.error('Text analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text. Please try again.' },
      { status: 500 }
    );
  }
}
