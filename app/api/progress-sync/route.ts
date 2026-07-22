import { NextRequest, NextResponse } from 'next/server';
import {
  hasRedisConfig,
  redisGetJson,
  redisPipeline,
} from '@/shared/infra/server/redis';
import {
  checkProgressSyncRateLimit,
  createRateLimitHeaders,
  getClientIP,
} from '@/shared/infra/server/rateLimit';
import type { ApiErrorResponse } from '@/shared/types/api';
import {
  buildProgressSyncStorageKey,
  getProgressUpdatedAtMs,
  isProgressSyncRecord,
  normalizeSyncKey,
  MAX_SYNC_PAYLOAD_BYTES,
  PROGRESS_SYNC_TTL_SECONDS,
  validateProgressSyncRequestBody,
  type ProgressSyncRecord,
} from './lib';

const ERROR_CODES = {
  INVALID_SYNC_KEY: 'INVALID_SYNC_KEY',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  RATE_LIMIT: 'RATE_LIMIT',
  CONFLICT: 'CONFLICT',
  NOT_FOUND: 'NOT_FOUND',
  SYNC_UNAVAILABLE: 'SYNC_UNAVAILABLE',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

type ProgressSyncRateLimitResult = Awaited<
  ReturnType<typeof checkProgressSyncRateLimit>
>;

const UPSERT_PROGRESS_SYNC_RECORD_LUA = `
local key = KEYS[1]
local incoming_payload = ARGV[1]
local incoming_ts = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])

if incoming_ts == nil then
  return {err = 'invalid incoming timestamp'}
end

local current_raw = redis.call('GET', key)
if current_raw then
  local ok, current = pcall(cjson.decode, current_raw)
  if ok and current and current.updatedAtMs ~= nil then
    local current_ts = tonumber(current.updatedAtMs)
    if current_ts ~= nil and incoming_ts < current_ts then
      return {0, current_raw}
    end
  end
end

redis.call('SET', key, incoming_payload, 'EX', ttl)
return {1}
`;

function createErrorResponse(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      status,
      code,
      message,
      error: message,
      ...extra,
    } satisfies ApiErrorResponse & Record<string, unknown>,
    { status },
  );
}

function applyPrivateSyncHeaders(
  response: NextResponse,
  varyBySyncKey: boolean = false,
): NextResponse {
  response.headers.set('Cache-Control', 'no-store');
  if (varyBySyncKey) {
    response.headers.set('Vary', 'x-sync-key');
  }
  return response;
}

function resolveSyncKey(request: Request): string | null {
  return normalizeSyncKey(request.headers.get('x-sync-key'));
}

function ensureSyncAvailable(): NextResponse | null {
  if (!hasRedisConfig()) {
    return applyPrivateSyncHeaders(
      createErrorResponse(
        503,
        ERROR_CODES.SYNC_UNAVAILABLE,
        'Progress sync backend is not configured.',
      ),
      true,
    );
  }
  return null;
}

function createRateLimitErrorResponse(
  rateLimitResult: ProgressSyncRateLimitResult,
): NextResponse {
  const headers = createRateLimitHeaders(rateLimitResult);

  let message: string;
  if (rateLimitResult.reason === 'daily_quota') {
    message = 'Daily progress sync limit reached. Please try again tomorrow.';
  } else if (rateLimitResult.reason === 'global_limit') {
    message =
      'Service is experiencing high demand. Please try again in a moment.';
  } else {
    message = `Too many requests. Please wait ${rateLimitResult.retryAfter} seconds.`;
  }

  const response = createErrorResponse(429, ERROR_CODES.RATE_LIMIT, message, {
    retryAfter: rateLimitResult.retryAfter,
  });

  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return applyPrivateSyncHeaders(response, true);
}

async function enforceRateLimit(
  request: NextRequest,
): Promise<NextResponse | null> {
  const clientIP = getClientIP(request);
  const rateLimitResult = await checkProgressSyncRateLimit(clientIP);
  if (rateLimitResult.allowed) {
    return null;
  }
  return createRateLimitErrorResponse(rateLimitResult);
}

async function upsertProgressSyncRecordAtomically(
  storageKey: string,
  record: ProgressSyncRecord,
): Promise<
  { stored: true } | { stored: false; latest: ProgressSyncRecord | null }
> {
  const pipelineResults = await redisPipeline([
    [
      'EVAL',
      UPSERT_PROGRESS_SYNC_RECORD_LUA,
      1,
      storageKey,
      JSON.stringify(record),
      record.updatedAtMs ?? 0,
      PROGRESS_SYNC_TTL_SECONDS,
    ],
  ]);

  const evalResult = pipelineResults[0];
  if (evalResult?.error) {
    throw new Error(`Redis EVAL failed: ${evalResult.error}`);
  }

  const result = evalResult?.result;
  if (Array.isArray(result) && Number(result[0]) === 1) {
    return { stored: true };
  }

  if (Array.isArray(result) && Number(result[0]) === 0) {
    const latestRaw = result[1];
    if (typeof latestRaw === 'string') {
      try {
        const parsed = JSON.parse(latestRaw) as unknown;
        if (isProgressSyncRecord(parsed)) {
          return { stored: false, latest: parsed };
        }
      } catch {
        // Ignore parse failures and return generic conflict response.
      }
    }

    return { stored: false, latest: null };
  }

  throw new Error('Unexpected Redis EVAL result.');
}

export async function GET(request: NextRequest) {
  const unavailableResponse = ensureSyncAvailable();
  if (unavailableResponse) return unavailableResponse;

  const rateLimitResponse = await enforceRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const syncKey = resolveSyncKey(request);
  if (!syncKey) {
    return applyPrivateSyncHeaders(
      createErrorResponse(
        400,
        ERROR_CODES.INVALID_SYNC_KEY,
        'x-sync-key is missing or invalid.',
      ),
      true,
    );
  }

  const storageKey = buildProgressSyncStorageKey(syncKey);

  try {
    const stored = await redisGetJson<unknown>(storageKey);
    if (!isProgressSyncRecord(stored)) {
      return applyPrivateSyncHeaders(
        createErrorResponse(
          404,
          ERROR_CODES.NOT_FOUND,
          'No synced progress found for this key.',
        ),
        true,
      );
    }

    return applyPrivateSyncHeaders(
      NextResponse.json(
        {
          updatedAt: stored.updatedAt,
          serverUpdatedAt: stored.serverUpdatedAt,
          snapshot: stored.snapshot,
        },
        { status: 200 },
      ),
      true,
    );
  } catch (error) {
    console.error('[progress-sync] GET failed:', error);
    return applyPrivateSyncHeaders(
      createErrorResponse(
        500,
        ERROR_CODES.SERVER_ERROR,
        'Failed to fetch synced progress.',
      ),
      true,
    );
  }
}

export async function POST(request: NextRequest) {
  const unavailableResponse = ensureSyncAvailable();
  if (unavailableResponse) return unavailableResponse;

  const rateLimitResponse = await enforceRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const syncKey = resolveSyncKey(request);
  if (!syncKey) {
    return createErrorResponse(
      400,
      ERROR_CODES.INVALID_SYNC_KEY,
      'x-sync-key is missing or invalid.',
    );
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const contentLengthBytes = Number(contentLength);
    if (
      Number.isFinite(contentLengthBytes) &&
      contentLengthBytes > MAX_SYNC_PAYLOAD_BYTES
    ) {
      return createErrorResponse(
        413,
        ERROR_CODES.PAYLOAD_TOO_LARGE,
        `Payload exceeds ${MAX_SYNC_PAYLOAD_BYTES} bytes.`,
      );
    }
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return createErrorResponse(
      400,
      ERROR_CODES.INVALID_PAYLOAD,
      'Request body must be valid JSON.',
    );
  }

  const validation = validateProgressSyncRequestBody(requestBody);
  if (!validation.ok) {
    return createErrorResponse(
      validation.error.code === 'PAYLOAD_TOO_LARGE' ? 413 : 400,
      ERROR_CODES[validation.error.code],
      validation.error.message,
    );
  }

  const storageKey = buildProgressSyncStorageKey(syncKey);
  const incomingUpdatedAtMs = getProgressUpdatedAtMs({
    updatedAt: validation.value.updatedAt,
  });
  if (incomingUpdatedAtMs === null) {
    return createErrorResponse(
      400,
      ERROR_CODES.INVALID_PAYLOAD,
      'updatedAt must be a valid ISO-8601 date string.',
    );
  }

  try {
    const nextRecord: ProgressSyncRecord = {
      schemaVersion: 1,
      updatedAt: validation.value.updatedAt,
      updatedAtMs: incomingUpdatedAtMs,
      snapshot: validation.value.snapshot,
      serverUpdatedAt: new Date().toISOString(),
    };

    const upsertResult = await upsertProgressSyncRecordAtomically(
      storageKey,
      nextRecord,
    );

    if (!upsertResult.stored) {
      const latest = upsertResult.latest;
      return applyPrivateSyncHeaders(
        createErrorResponse(409, ERROR_CODES.CONFLICT, 'Sync conflict.', {
          latest: latest
            ? {
                updatedAt: latest.updatedAt,
                serverUpdatedAt: latest.serverUpdatedAt,
                snapshot: latest.snapshot,
              }
            : undefined,
        }),
        true,
      );
    }

    return NextResponse.json(
      {
        synced: true,
        updatedAt: nextRecord.updatedAt,
        serverUpdatedAt: nextRecord.serverUpdatedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[progress-sync] POST failed:', error);
    return createErrorResponse(
      500,
      ERROR_CODES.SERVER_ERROR,
      'Failed to sync progress.',
    );
  }
}
