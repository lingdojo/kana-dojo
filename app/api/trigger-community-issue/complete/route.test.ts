import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockCompleteSchedulerRun = vi.fn();
const mockGetSchedulerConfig = vi.fn();

vi.mock('../scheduler', () => ({
  completeSchedulerRun: (...args: unknown[]) => mockCompleteSchedulerRun(...args),
  getSchedulerConfig: () => mockGetSchedulerConfig(),
}));

import { POST } from './route';

function makeRequest(body: unknown, authorization = 'Bearer callback-secret') {
  return new Request('https://kanadojo.com/api/trigger-community-issue/complete', {
    method: 'POST',
    headers: { authorization, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/trigger-community-issue/complete', () => {
  beforeEach(() => {
    vi.stubEnv('COMMUNITY_ISSUE_SCHEDULER_CALLBACK_SECRET', 'callback-secret');
    mockCompleteSchedulerRun.mockReset();
    mockGetSchedulerConfig.mockReset().mockReturnValue({});
    mockCompleteSchedulerRun.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects requests without the callback secret', async () => {
    const response = await POST(makeRequest({ runId: 'run-1', outcome: 'created' }, 'Bearer wrong'));
    expect(response.status).toBe(401);
    expect(mockCompleteSchedulerRun).not.toHaveBeenCalled();
  });

  it('validates and applies a scheduler outcome', async () => {
    const response = await POST(makeRequest({ runId: 'run-1', outcome: 'created' }));
    expect(response.status).toBe(200);
    expect(mockCompleteSchedulerRun).toHaveBeenCalledWith('run-1', 'created', {});
  });

  it('acknowledges stale duplicate callbacks without changing state', async () => {
    mockCompleteSchedulerRun.mockResolvedValue(false);
    const response = await POST(makeRequest({ runId: 'old-run', outcome: 'created' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ stale: true });
  });
});
