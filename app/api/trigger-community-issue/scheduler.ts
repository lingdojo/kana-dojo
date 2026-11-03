import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

function getSchedulerClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase scheduler configuration is missing.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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
  const { data, error } = await getSchedulerClient().rpc(
    'community_issue_scheduler_claim_due',
    { p_run_id: runId, p_lease_seconds: CLAIM_TTL_SECONDS },
  );
  if (error) throw new Error(`Could not claim scheduler run: ${error.message}`);

  const rows = data as Array<{ claim_status: string; due_at: string }> | null;
  const row = rows?.[0];
  if (!row) throw new Error('Unexpected response claiming scheduler run.');
  if (row.claim_status !== 'claimed_by_us') return null;

  const nextRunAt = Date.parse(row.due_at);
  if (!Number.isFinite(nextRunAt)) throw new Error('Scheduler returned an invalid due time.');
  return { runId, nextRunAt };
}

export async function completeSchedulerRun(
  runId: string,
  outcome: 'created' | 'no_issue' | 'failed',
  config: SchedulerConfig,
): Promise<boolean> {
  const interval = outcome === 'created'
    ? pickRandomInterval(config)
    : config.noIssueRetryMinutes;
  const { data, error } = await getSchedulerClient().rpc(
    'community_issue_scheduler_complete',
    { p_run_id: runId, p_outcome: outcome, p_interval_minutes: interval },
  );
  if (error) throw new Error(`Could not complete scheduler run: ${error.message}`);
  return data === true;
}

export async function releaseSchedulerClaim(runId: string): Promise<void> {
  const { error } = await getSchedulerClient().rpc(
    'community_issue_scheduler_release',
    { p_run_id: runId },
  );
  if (error) throw new Error(`Could not release scheduler claim: ${error.message}`);
}
