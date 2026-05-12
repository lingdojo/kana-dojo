import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import {
  buildProgressSyncStorageKey,
  MAX_SYNC_PAYLOAD_BYTES,
  PROGRESS_SYNC_TTL_SECONDS,
} from './lib';

const mockHasRedisConfig = vi.fn();
const mockRedisGetJson = vi.fn();
const mockRedisPipeline = vi.fn();
const mockCheckProgressSyncRateLimit = vi.fn();

vi.mock('@/shared/infra/server/redis', () => ({
  hasRedisConfig: () => mockHasRedisConfig(),
  redisGetJson: (...args: unknown[]) => mockRedisGetJson(...args),
  redisPipeline: (...args: unknown[]) => mockRedisPipeline(...args),
}));

vi.mock('@/shared/infra/server/rateLimit', () => ({
  checkProgressSyncRateLimit: (...args: unknown[]) =>
    mockCheckProgressSyncRateLimit(...args),
  createRateLimitHeaders: (result: {
    remaining: number;
    resetAt: number;
    retryAfter?: number;
  }) => {
    const headers = new Headers();
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));
    if (typeof result.retryAfter === 'number') {
      headers.set('Retry-After', String(result.retryAfter));
    }
    return headers;
  },
  getClientIP: () => '127.0.0.1',
}));

const validSyncKey = 'sync-key-1234567890';
const validBody = {
  updatedAt: '2026-02-20T12:00:00.000Z',
  snapshot: {
    version: '0.1.15',
    createdAt: '2026-02-20T12:00:00.000Z',
    stats: { totalCorrect: 42 },
  },
};

function allowedRateLimitResult() {
  return {
    allowed: true,
    remaining: 19,
    resetAt: Date.now() + 60_000,
  };
}

function makeRequest(
  url: string,
  init?: RequestInit & { headers?: Record<string, string> },
) {
  return new Request(url, init) as NextRequest;
}

describe('GET /api/progress-sync', () => {
  beforeEach(() => {
    mockHasRedisConfig.mockReset();
    mockRedisGetJson.mockReset();
    mockRedisPipeline.mockReset();
    mockCheckProgressSyncRateLimit.mockReset();
    mockHasRedisConfig.mockReturnValue(true);
    mockCheckProgressSyncRateLimit.mockResolvedValue(allowedRateLimitResult());
  });

  it('returns 503 when Redis is unavailable', async () => {
    mockHasRedisConfig.mockReturnValue(false);

    const response = await GET(
      makeRequest('http://localhost/api/progress-sync', {
        headers: { 'x-sync-key': validSyncKey },
      }),
    );

    expect(response.status).toBe(503);
    const data = (await response.json()) as { code: string };
    expect(data.code).toBe('SYNC_UNAVAILABLE');
  });

  it('returns 400 for missing sync key', async () => {
    const response = await GET(
      makeRequest('http://localhost/api/progress-sync'),
    );

    expect(response.status).toBe(400);
    const data = (await response.json()) as { code: string };
    expect(data.code).toBe('INVALID_SYNC_KEY');
  });

  it('returns 429 when request exceeds rate limit', async () => {
    mockCheckProgressSyncRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
      retryAfter: 30,
      reason: 'rate_limit',
    });

    const response = await GET(
      makeRequest('http://localhost/api/progress-sync', {
        headers: { 'x-sync-key': validSyncKey },
      }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('30');
  });

  it('returns 404 when no synced progress exists', async () => {
    mockRedisGetJson.mockResolvedValue(null);

    const response = await GET(
      makeRequest('http://localhost/api/progress-sync', {
        headers: { 'x-sync-key': validSyncKey },
      }),
    );

    expect(response.status).toBe(404);
    const data = (await response.json()) as { code: string };
    expect(data.code).toBe('NOT_FOUND');
    expect(mockRedisGetJson).toHaveBeenCalledWith(
      buildProgressSyncStorageKey(validSyncKey),
    );
  });

  it('returns stored snapshot when found', async () => {
    const storedRecord = {
      schemaVersion: 1 as const,
      updatedAt: '2026-02-20T12:00:00.000Z',
      updatedAtMs: Date.parse('2026-02-20T12:00:00.000Z'),
      serverUpdatedAt: '2026-02-20T12:00:01.000Z',
      snapshot: validBody.snapshot,
    };
    mockRedisGetJson.mockResolvedValue(storedRecord);

    const response = await GET(
      makeRequest('http://localhost/api/progress-sync', {
        headers: { 'x-sync-key': validSyncKey },
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      updatedAt: string;
      snapshot: unknown;
    };
    expect(data.updatedAt).toBe(storedRecord.updatedAt);
    expect(data.snapshot).toEqual(storedRecord.snapshot);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Vary')).toBe('x-sync-key');
  });
});

describe('POST /api/progress-sync', () => {
  beforeEach(() => {
    mockHasRedisConfig.mockReset();
    mockRedisGetJson.mockReset();
    mockRedisPipeline.mockReset();
    mockCheckProgressSyncRateLimit.mockReset();
    mockHasRedisConfig.mockReturnValue(true);
    mockCheckProgressSyncRateLimit.mockResolvedValue(allowedRateLimitResult());
  });

  it('returns 429 when request exceeds rate limit', async () => {
    mockCheckProgressSyncRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
      retryAfter: 30,
      reason: 'rate_limit',
    });

    const response = await POST(
      makeRequest('http://localhost/api/progress-sync', {
        method: 'POST',
        headers: {
          'x-sync-key': validSyncKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(validBody),
      }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('30');
  });

  it('returns 400 for invalid JSON body', async () => {
    const response = await POST(
      makeRequest('http://localhost/api/progress-sync', {
        method: 'POST',
        headers: {
          'x-sync-key': validSyncKey,
          'content-type': 'application/json',
        },
        body: '{"invalid"',
      }),
    );

    expect(response.status).toBe(400);
    const data = (await response.json()) as { code: string };
    expect(data.code).toBe('INVALID_PAYLOAD');
  });

  it('returns 413 when Content-Length exceeds max payload', async () => {
    const jsonSpy = vi.fn();
    const oversizedRequest = {
      headers: new Headers({
        'x-sync-key': validSyncKey,
        'content-length': String(MAX_SYNC_PAYLOAD_BYTES + 1),
      }),
      json: jsonSpy,
    } as unknown as NextRequest;

    const response = await POST(oversizedRequest);

    expect(response.status).toBe(413);
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it('returns 409 when incoming payload is older than remote state', async () => {
    const latestRecord = {
      schemaVersion: 1,
      updatedAt: '2026-02-20T12:30:00.000Z',
      updatedAtMs: Date.parse('2026-02-20T12:30:00.000Z'),
      serverUpdatedAt: '2026-02-20T12:30:01.000Z',
      snapshot: validBody.snapshot,
    };
    mockRedisPipeline.mockResolvedValue([
      {
        result: [0, JSON.stringify(latestRecord)],
      },
    ]);

    const response = await POST(
      makeRequest('http://localhost/api/progress-sync', {
        method: 'POST',
        headers: {
          'x-sync-key': validSyncKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(validBody),
      }),
    );

    expect(response.status).toBe(409);
    const data = (await response.json()) as { code: string; latest?: unknown };
    expect(data.code).toBe('CONFLICT');
    expect(data.latest).toBeTruthy();
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Vary')).toBe('x-sync-key');
  });

  it('stores payload when incoming data is newer', async () => {
    mockRedisPipeline.mockResolvedValue([{ result: [1] }]);

    const response = await POST(
      makeRequest('http://localhost/api/progress-sync', {
        method: 'POST',
        headers: {
          'x-sync-key': validSyncKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(validBody),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockRedisPipeline).toHaveBeenCalledTimes(1);

    const [commands] = mockRedisPipeline.mock.calls[0] as [unknown[][]];
    const command = commands[0];
    expect(command[0]).toBe('EVAL');
    expect(command[3]).toBe(buildProgressSyncStorageKey(validSyncKey));

    const payload = JSON.parse(String(command[4])) as {
      updatedAt: string;
      updatedAtMs: number;
      schemaVersion: number;
      snapshot: unknown;
    };
    expect(payload.updatedAt).toBe(validBody.updatedAt);
    expect(payload.updatedAtMs).toBe(Date.parse(validBody.updatedAt));
    expect(payload.schemaVersion).toBe(1);
    expect(payload.snapshot).toEqual(validBody.snapshot);
    expect(Number(command[6])).toBe(PROGRESS_SYNC_TTL_SECONDS);
  });
});
