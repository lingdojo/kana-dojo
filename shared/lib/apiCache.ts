import { createHash } from 'crypto';
import { hasRedisConfig, redisGetJson, redisSetJson } from '@/shared/lib/redis';

export function buildHashedCacheKey(prefix: string, rawKey: string): string {
  const hash = createHash('sha256').update(rawKey).digest('hex');
  return `${prefix}:${hash}`;
}

export async function getRedisCachedJson<T>(
  prefix: string,
  rawKey: string,
): Promise<T | null> {
  if (!hasRedisConfig()) {
    return null;
  }

  try {
    return await redisGetJson<T>(buildHashedCacheKey(prefix, rawKey));
  } catch {
    return null;
  }
}

export async function setRedisCachedJson(
  prefix: string,
  rawKey: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  if (!hasRedisConfig()) {
    return;
  }

  try {
    await redisSetJson(buildHashedCacheKey(prefix, rawKey), value, ttlSeconds);
  } catch {
    // Ignore Redis failures and allow in-memory fallback.
  }
}
