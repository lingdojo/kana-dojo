import { afterEach, describe, expect, it, vi } from 'vitest';

const mockHasRedisConfig = vi.fn(() => true);
const mockRedisPipeline = vi.fn();

vi.mock('@/shared/infra/server/redis', () => ({
  hasRedisConfig: () => mockHasRedisConfig(),
  redisPipeline: (...args: unknown[]) => mockRedisPipeline(...args),
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
    mockHasRedisConfig.mockReturnValue(true);
    mockRedisPipeline.mockReset();
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
    mockRedisPipeline.mockResolvedValueOnce([{ result: ['claimed_by_us', String(Date.now())] }]);
    const claim = await claimIfDue('run-1');
    expect(claim?.runId).toBe('run-1');

    mockRedisPipeline.mockResolvedValueOnce([{ result: ['not_due', String(Date.now() + 60_000)] }]);
    expect(await claimIfDue('run-2')).toBeNull();
  });

  it('does not claim when Redis is unavailable', async () => {
    mockHasRedisConfig.mockReturnValue(false);
    await expect(claimIfDue('run-1')).rejects.toThrow('Upstash Redis is not configured');
  });

  it('completes only the matching run and releases claims after dispatch errors', async () => {
    mockRedisPipeline.mockResolvedValueOnce([{ result: 'completed' }]);
    await expect(completeSchedulerRun('run-1', 'created', getSchedulerConfig())).resolves.toBe(true);

    mockRedisPipeline.mockResolvedValueOnce([{ result: 'stale' }]);
    await expect(completeSchedulerRun('run-1', 'failed', getSchedulerConfig())).resolves.toBe(false);

    mockRedisPipeline.mockResolvedValueOnce([{ result: 1 }]);
    await expect(releaseSchedulerClaim('run-1')).resolves.toBeUndefined();
  });
});
