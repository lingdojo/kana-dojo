import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockRpc = vi.fn();
const mockCreateClient = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

import {
  claimIfDue,
  completeSchedulerRun,
  getSchedulerConfig,
  isRandomSchedulerEnabled,
  pickRandomInterval,
  releaseSchedulerClaim,
} from './scheduler';

describe('community issue scheduler', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    mockRpc.mockReset();
    mockCreateClient.mockReset().mockReturnValue({ rpc: mockRpc });
  });

  beforeEach(() => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
    mockCreateClient.mockReturnValue({ rpc: mockRpc });
  });

  it('uses the source-controlled mode switch', () => {
    expect(isRandomSchedulerEnabled()).toBe(true);
  });

  it('uses inclusive integer bounds and validates configuration', () => {
    vi.stubEnv('COMMUNITY_ISSUE_RANDOM_INTERVAL_MINUTES_MIN', '30');
    vi.stubEnv('COMMUNITY_ISSUE_RANDOM_INTERVAL_MINUTES_MAX', '65');
    const config = getSchedulerConfig();

    const randomValues = vi.spyOn(crypto, 'getRandomValues');
    randomValues.mockImplementationOnce((array) => {
      (array as Uint32Array)[0] = 0;
      return array;
    });
    expect(pickRandomInterval(config)).toBe(30);
    randomValues.mockImplementationOnce((array) => {
      (array as Uint32Array)[0] = 35;
      return array;
    });
    expect(pickRandomInterval(config)).toBe(65);
    randomValues.mockImplementationOnce((array) => {
      (array as Uint32Array)[0] = 0xffff_ffff;
      return array;
    }).mockImplementationOnce((array) => {
      (array as Uint32Array)[0] = 35;
      return array;
    });
    expect(pickRandomInterval(config)).toBe(65);

    vi.stubEnv('COMMUNITY_ISSUE_RANDOM_INTERVAL_MINUTES_MAX', '29');
    expect(() => getSchedulerConfig()).toThrow('1 <= min <= max');
  });

  it('claims only a due run', async () => {
    mockRpc.mockResolvedValueOnce({
      data: [{ claim_status: 'claimed_by_us', due_at: new Date().toISOString() }],
      error: null,
    });
    const claim = await claimIfDue('run-1');
    expect(claim?.runId).toBe('run-1');

    mockRpc.mockResolvedValueOnce({
      data: [{ claim_status: 'not_due', due_at: new Date(Date.now() + 60_000).toISOString() }],
      error: null,
    });
    expect(await claimIfDue('run-2')).toBeNull();
  });

  it('does not claim when Supabase is unavailable', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    await expect(claimIfDue('run-1')).rejects.toThrow('Supabase scheduler configuration is missing');
  });

  it('completes only the matching run and releases claims after dispatch errors', async () => {
    mockRpc.mockResolvedValueOnce({ data: true, error: null });
    await expect(completeSchedulerRun('run-1', 'created', getSchedulerConfig())).resolves.toBe(true);

    mockRpc.mockResolvedValueOnce({ data: false, error: null });
    await expect(completeSchedulerRun('run-1', 'failed', getSchedulerConfig())).resolves.toBe(false);

    mockRpc.mockResolvedValueOnce({ data: true, error: null });
    await expect(releaseSchedulerClaim('run-1')).resolves.toBeUndefined();
  });
});
