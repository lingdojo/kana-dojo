type RedisCommand = Array<string | number>;

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export function hasRedisConfig(): boolean {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

async function redisFetch<T>(body: unknown): Promise<T> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Redis config missing.');
  }

  const response = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Redis request failed: ${response.status} ${text}`);
  }

  return (await response.json()) as T;
}

export async function redisPipeline(commands: RedisCommand[]) {
  const payload = commands.map(command => command.map(String));
  return redisFetch<Array<{ result: unknown; error?: string }>>(payload);
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  const results = await redisPipeline([['GET', key]]);
  const result = results[0]?.result;
  if (result == null) return null;

  if (typeof result === 'string') {
    return JSON.parse(result) as T;
  }

  return result as T;
}

export async function redisSetJson(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  const payload = JSON.stringify(value);
  await redisPipeline([
    ['SET', key, payload, 'EX', ttlSeconds],
  ]);
}
