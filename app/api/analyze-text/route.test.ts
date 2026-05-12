import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockCheckAnalyzeRateLimit = vi.fn();
const mockGetRedisCachedJson = vi.fn();
const mockSetRedisCachedJson = vi.fn();

const mockAnalyzerInit = vi.fn();
const mockAnalyzerParse = vi.fn();

vi.mock('@/shared/infra/server/rateLimit', () => ({
  checkAnalyzeRateLimit: (...args: unknown[]) =>
    mockCheckAnalyzeRateLimit(...args),
  createRateLimitHeaders: () => {
    const headers = new Headers();
    headers.set('X-RateLimit-Remaining', '19');
    headers.set(
      'X-RateLimit-Reset',
      String(Math.floor(Date.now() / 1000) + 60),
    );
    return headers;
  },
  getClientIP: () => '127.0.0.1',
}));

vi.mock('@/shared/infra/client/apiCache', () => ({
  getRedisCachedJson: (...args: unknown[]) => mockGetRedisCachedJson(...args),
  setRedisCachedJson: (...args: unknown[]) => mockSetRedisCachedJson(...args),
}));

class MockKuromojiAnalyzer {
  init = mockAnalyzerInit;
  parse = mockAnalyzerParse;
}

vi.mock('kuroshiro-analyzer-kuromoji', () => ({
  default: MockKuromojiAnalyzer,
}));

function makeRequest(body: unknown): NextRequest {
  return new Request('http://localhost/api/analyze-text', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest;
}

async function callPost(body: unknown) {
  const { POST } = await import('./route');
  return POST(makeRequest(body));
}

function allowedRateLimitResult() {
  return {
    allowed: true,
    remaining: 19,
    resetAt: Date.now() + 60_000,
  };
}

describe('POST /api/analyze-text', () => {
  beforeEach(() => {
    vi.resetModules();
    mockCheckAnalyzeRateLimit.mockReset();
    mockGetRedisCachedJson.mockReset();
    mockSetRedisCachedJson.mockReset();
    mockAnalyzerInit.mockReset();
    mockAnalyzerParse.mockReset();

    mockCheckAnalyzeRateLimit.mockResolvedValue(allowedRateLimitResult());
    mockGetRedisCachedJson.mockResolvedValue(null);
    mockAnalyzerInit.mockResolvedValue(undefined);
  });

  it('returns 400 for empty text payload', async () => {
    const response = await callPost({ text: '' });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { code: string };
    expect(data.code).toBe('INVALID_INPUT');
    expect(mockAnalyzerInit).not.toHaveBeenCalled();
    expect(mockAnalyzerParse).not.toHaveBeenCalled();
  });

  it('parses text via kuromoji analyzer and returns normalized tokens', async () => {
    mockAnalyzerParse.mockResolvedValue([
      {
        surface_form: '日本語',
        pos: '名詞',
        pos_detail_1: '一般',
        pos_detail_2: '*',
        pos_detail_3: '*',
        conjugated_type: '*',
        conjugated_form: '*',
        basic_form: '日本語',
        reading: 'ニホンゴ',
        pronunciation: 'ニホンゴ',
      },
    ]);

    const response = await callPost({ text: '日本語' });

    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      tokens: Array<{ surface: string; reading?: string; pos: string }>;
    };
    expect(data.tokens).toEqual([
      {
        surface: '日本語',
        reading: 'にほんご',
        basicForm: '日本語',
        pos: 'Noun',
        posDetail: '一般',
      },
    ]);
    expect(mockAnalyzerInit).toHaveBeenCalledTimes(1);
    expect(mockAnalyzerParse).toHaveBeenCalledWith('日本語');
    expect(mockSetRedisCachedJson).toHaveBeenCalledTimes(1);
  });

  it('retries analyzer initialization after an init failure', async () => {
    mockAnalyzerInit
      .mockRejectedValueOnce(new Error('init failed'))
      .mockResolvedValue(undefined);
    mockAnalyzerParse.mockResolvedValue([
      {
        surface_form: '学ぶ',
        pos: '動詞',
        pos_detail_1: '自立',
        pos_detail_2: '*',
        pos_detail_3: '*',
        conjugated_type: '五段・バ行',
        conjugated_form: '基本形',
        basic_form: '学ぶ',
        reading: 'マナブ',
        pronunciation: 'マナブ',
      },
    ]);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const failed = await callPost({ text: '初回失敗' });
      expect(failed.status).toBe(500);

      const retried = await callPost({ text: '学ぶ' });
      expect(retried.status).toBe(200);
      expect(mockAnalyzerInit).toHaveBeenCalledTimes(2);
      expect(mockAnalyzerParse).toHaveBeenCalledTimes(1);
    } finally {
      errorSpy.mockRestore();
    }
  });
});
