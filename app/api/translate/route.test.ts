import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockCheckTranslateRateLimit = vi.fn();
const mockCheckTranslateUsageLimit = vi.fn();
const mockGetRedisCachedJson = vi.fn();
const mockSetRedisCachedJson = vi.fn();

vi.mock('@/shared/infra/server/rateLimit', () => ({
  checkTranslateRateLimit: (...args: unknown[]) =>
    mockCheckTranslateRateLimit(...args),
  checkTranslateUsageLimit: (...args: unknown[]) =>
    mockCheckTranslateUsageLimit(...args),
  createRateLimitHeaders: (result: { remaining: number; resetAt: number }) => {
    const headers = new Headers();
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));
    return headers;
  },
  createTranslateUsageHeaders: (result: {
    remainingDailyChars: number;
    remainingMonthlyChars: number;
    remainingGlobalMonthlyChars: number;
    retryAfter?: number;
  }) => {
    const headers = new Headers();
    headers.set(
      'X-Translate-CharLimit-Remaining',
      String(result.remainingDailyChars),
    );
    headers.set(
      'X-Translate-Monthly-Remaining',
      String(result.remainingMonthlyChars),
    );
    headers.set(
      'X-Translate-Global-Monthly-Remaining',
      String(result.remainingGlobalMonthlyChars),
    );
    if (result.retryAfter) {
      headers.set('Retry-After', String(result.retryAfter));
    }
    return headers;
  },
  getClientIP: () => '127.0.0.1',
}));

vi.mock('@/shared/infra/server/apiCache', () => ({
  getRedisCachedJson: (...args: unknown[]) => mockGetRedisCachedJson(...args),
  setRedisCachedJson: (...args: unknown[]) => mockSetRedisCachedJson(...args),
}));

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new Request('http://localhost/api/translate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0',
      ...headers,
    },
    body: JSON.stringify(body),
  }) as NextRequest;
}

async function callPost(body: unknown, headers?: Record<string, string>) {
  const { POST } = await import('./route');
  return POST(makeRequest(body, headers));
}

function allowedRateLimitResult() {
  return {
    allowed: true,
    remaining: 9,
    resetAt: Date.now() + 60_000,
  };
}

function allowedUsageResult() {
  return {
    allowed: true,
    requiresVerification: false,
    remainingDailyChars: 19_990,
    remainingMonthlyChars: 99_990,
    remainingGlobalMonthlyChars: 449_990,
    resetAt: Date.now() + 86_400_000,
  };
}

describe('POST /api/translate', () => {
  beforeEach(() => {
    vi.resetModules();
    mockCheckTranslateRateLimit.mockReset();
    mockCheckTranslateUsageLimit.mockReset();
    mockGetRedisCachedJson.mockReset();
    mockSetRedisCachedJson.mockReset();
    vi.stubEnv('GOOGLE_TRANSLATE_API_KEY', 'test-key');
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');

    mockCheckTranslateRateLimit.mockResolvedValue(allowedRateLimitResult());
    mockCheckTranslateUsageLimit.mockResolvedValue(allowedUsageResult());
    mockGetRedisCachedJson.mockResolvedValue(null);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            translations: [{ translatedText: 'hello' }],
          },
        }),
      }),
    );
  });

  it('returns cached translations before rate or character quota checks', async () => {
    mockGetRedisCachedJson.mockResolvedValue({
      translatedText: 'hello',
    });

    const response = await callPost({
      text: 'こんにちは',
      sourceLanguage: 'ja',
      targetLanguage: 'en',
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as { cached: boolean };
    expect(data.cached).toBe(true);
    expect(mockCheckTranslateRateLimit).not.toHaveBeenCalled();
    expect(mockCheckTranslateUsageLimit).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('blocks obvious bot user agents before Google is called', async () => {
    const response = await callPost(
      {
        text: 'こんにちは',
        sourceLanguage: 'ja',
        targetLanguage: 'en',
      },
      { 'user-agent': 'Googlebot/2.1' },
    );

    expect(response.status).toBe(429);
    expect(mockCheckTranslateUsageLimit).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('blocks over-budget uncached requests before Google is called', async () => {
    mockCheckTranslateUsageLimit.mockResolvedValue({
      allowed: false,
      requiresVerification: false,
      remainingDailyChars: 0,
      remainingMonthlyChars: 99_000,
      remainingGlobalMonthlyChars: 449_000,
      resetAt: Date.now() + 86_400_000,
      retryAfter: 60,
      reason: 'daily_char_quota',
    });

    const response = await callPost({
      text: 'こんにちは',
      sourceLanguage: 'ja',
      targetLanguage: 'en',
    });

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('requires a click for long URL-prefill translations', async () => {
    const response = await callPost({
      text: 'あ'.repeat(301),
      sourceLanguage: 'ja',
      targetLanguage: 'en',
      requestContext: 'url-prefill',
    });

    expect(response.status).toBe(403);
    const data = (await response.json()) as { code: string };
    expect(data.code).toBe('VERIFICATION_REQUIRED');
    expect(mockCheckTranslateRateLimit).not.toHaveBeenCalled();
    expect(mockCheckTranslateUsageLimit).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls Google and records usage for normal uncached requests', async () => {
    const response = await callPost({
      text: 'こんにちは',
      sourceLanguage: 'ja',
      targetLanguage: 'en',
    });

    expect(response.status).toBe(200);
    expect(mockCheckTranslateRateLimit).toHaveBeenCalledWith('127.0.0.1');
    expect(mockCheckTranslateUsageLimit).toHaveBeenCalledWith(
      '127.0.0.1',
      5,
      { verified: false },
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mockSetRedisCachedJson).toHaveBeenCalledTimes(1);
  });
});
