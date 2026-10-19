import { hasRedisConfig, redisPipeline } from '@/shared/infra/server/redis';

const NEXT_RUN_KEY = 'community-issue:scheduler:next-run-at';
const CLAIM_KEY = 'community-issue:scheduler:claim';
const CLAIM_TTL_SECONDS = 15 * 60;

// Set to false to restore dispatch-on-every-request behavior. Changing this
// constant requires a redeployment.
export const COMMUNITY_ISSUE_RANDOM_SCHEDULER_ENABLED = true;

export interface SchedulerConfig {
  minIntervalMinutes: number;
  maxIntervalMinutes: number;
  noIssueRetryMinutes: number;
}

export interface SchedulerClaim {
  runId: string;
  nextRunAt: number;
}

const CLAIM_DUE_RUN_SCRIPT = `
local now = tonumber(ARGV[1])
local run_id = ARGV[2]
local lease_seconds = tonumber(ARGV[3])
local next_run_at = redis.call('GET', KEYS[1])
if not next_run_at then
  redis.call('SET', KEYS[1], now)
  next_run_at = tostring(now)
end
if tonumber(next_run_at) > now then
  return { 'not_due', next_run_at }
end
if redis.call('EXISTS', KEYS[2]) == 1 then
  return { 'claimed', next_run_at }
end
redis.call('SET', KEYS[2], run_id, 'EX', lease_seconds)
return { 'claimed_by_us', next_run_at }
`;

const COMPLETE_RUN_SCRIPT = `
local run_id = ARGV[1]
local outcome = ARGV[2]
local now = tonumber(ARGV[3])
local interval_minutes = tonumber(ARGV[4])
if redis.call('GET', KEYS[2]) ~= run_id then
  return 'stale'
end
if outcome == 'created' then
  redis.call('SET', KEYS[1], now + interval_minutes * 60000)
elseif outcome == 'no_issue' then
  redis.call('SET', KEYS[1], now + interval_minutes * 60000)
end
redis.call('DEL', KEYS[2])
return 'completed'
`;

const RELEASE_CLAIM_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  redis.call('DEL', KEYS[1])
  return 1
end
return 0
`;

function redisResult<T>(result: unknown): T {
  if (result && typeof result === 'object' && 'result' in result) {
    return (result as { result: T }).result;
  }
  return result as T;
}

function readIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  if (!/^\d+$/.test(raw)) throw new Error(`${name} must be a whole number.`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) throw new Error(`${name} is out of range.`);
  return value;
}

export function isRandomSchedulerEnabled(): boolean {
  return COMMUNITY_ISSUE_RANDOM_SCHEDULER_ENABLED;
}

export function getSchedulerConfig(): SchedulerConfig {
  const config = {
    minIntervalMinutes: readIntEnv('COMMUNITY_ISSUE_RANDOM_INTERVAL_MINUTES_MIN', 30),
    maxIntervalMinutes: readIntEnv('COMMUNITY_ISSUE_RANDOM_INTERVAL_MINUTES_MAX', 65),
    noIssueRetryMinutes: readIntEnv('COMMUNITY_ISSUE_NO_ITEM_RETRY_MINUTES', 10),
  };

  if (config.minIntervalMinutes < 1 || config.maxIntervalMinutes < config.minIntervalMinutes) {
    throw new Error('Random scheduler interval bounds must satisfy 1 <= min <= max.');
  }
  if (config.noIssueRetryMinutes < 1) {
    throw new Error('No-item retry interval must be at least one minute.');
  }

  return config;
}

export function pickRandomInterval(config: SchedulerConfig): number {
  const intervalCount = config.maxIntervalMinutes - config.minIntervalMinutes + 1;
  const uint32Range = 0x1_0000_0000;
  if (intervalCount > uint32Range) {
    throw new Error('Random scheduler interval range must not exceed 2^32 values.');
  }

  // Rejection sampling avoids modulo bias, giving each whole-minute interval
  // the same probability when backed by the platform CSPRNG.
  const acceptedLimit = Math.floor(uint32Range / intervalCount) * intervalCount;
  const sample = new Uint32Array(1);
  do {
    crypto.getRandomValues(sample);
  } while (sample[0] >= acceptedLimit);

  return config.minIntervalMinutes + (sample[0] % intervalCount);
}

export async function claimIfDue(runId: string): Promise<SchedulerClaim | null> {
  if (!hasRedisConfig()) throw new Error('Upstash Redis is not configured.');

  const now = Date.now();
  const results = await redisPipeline([[
    'EVAL', CLAIM_DUE_RUN_SCRIPT, 2, NEXT_RUN_KEY, CLAIM_KEY,
    now, runId, CLAIM_TTL_SECONDS,
  ]]);
  const value = redisResult<unknown>(results[0]?.result);
  if (!Array.isArray(value)) throw new Error('Unexpected response claiming scheduler run.');

  const [status, nextRunAt] = value.map(String);
  if (status !== 'claimed_by_us') return null;

  return { runId, nextRunAt: Number(nextRunAt) };
}

export async function completeSchedulerRun(
  runId: string,
  outcome: 'created' | 'no_issue' | 'failed',
  config: SchedulerConfig,
): Promise<boolean> {
  const interval = outcome === 'created'
    ? pickRandomInterval(config)
    : config.noIssueRetryMinutes;
  const results = await redisPipeline([[
    'EVAL', COMPLETE_RUN_SCRIPT, 2, NEXT_RUN_KEY, CLAIM_KEY,
    runId, outcome, Date.now(), interval,
  ]]);

  return redisResult<string>(results[0]?.result) === 'completed';
}

export async function releaseSchedulerClaim(runId: string): Promise<void> {
  await redisPipeline([['EVAL', RELEASE_CLAIM_SCRIPT, 1, CLAIM_KEY, runId]]);
}
