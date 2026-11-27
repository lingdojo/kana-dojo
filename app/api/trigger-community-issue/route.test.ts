import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockClaimIfDue = vi.fn();
const mockGetSchedulerConfig = vi.fn();
const mockIsRandomSchedulerEnabled = vi.fn();
const mockReleaseSchedulerClaim = vi.fn();

vi.mock('./scheduler', () => ({
  claimIfDue: (...args: unknown[]) => mockClaimIfDue(...args),
  getSchedulerConfig: () => mockGetSchedulerConfig(),
  isRandomSchedulerEnabled: () => mockIsRandomSchedulerEnabled(),
  releaseSchedulerClaim: (...args: unknown[]) => mockReleaseSchedulerClaim(...args),
}));

import { POST } from './route';

const originalFetch = globalThis.fetch;

function makeRequest() {
  return new Request('https://kanadojo.com/api/trigger-community-issue', {
    method: 'POST',
    headers: { authorization: 'Bearer cron-secret' },
  });
}

describe('POST /api/trigger-community-issue', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'cron-secret');
    vi.stubEnv('GITHUB_PAT', 'github-token');
    vi.stubEnv('COMMUNITY_ISSUE_SCHEDULER_CALLBACK_SECRET', 'callback-secret');
    mockIsRandomSchedulerEnabled.mockReset();
    mockGetSchedulerConfig.mockReset();
    mockClaimIfDue.mockReset();
    mockReleaseSchedulerClaim.mockReset();
    mockGetSchedulerConfig.mockReturnValue({});
    mockReleaseSchedulerClaim.mockResolvedValue(undefined);
    mockIsRandomSchedulerEnabled.mockReturnValue(false);
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('preserves deterministic mode by dispatching on every request', async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const init = vi.mocked(globalThis.fetch).mock.calls[0]?.[1];
    expect(JSON.parse(String(init?.body))).toEqual({ ref: 'main' });
    expect(mockClaimIfDue).not.toHaveBeenCalled();
  });

  it('does not dispatch before a random-mode run is due', async () => {
    mockIsRandomSchedulerEnabled.mockReturnValue(true);
    mockClaimIfDue.mockResolvedValue(null);

    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ dispatched: false });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('dispatches a claimed random run with an internal run ID', async () => {
    mockIsRandomSchedulerEnabled.mockReturnValue(true);
    mockClaimIfDue.mockImplementation(async (runId: string) => ({ runId }));

    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    const init = vi.mocked(globalThis.fetch).mock.calls[0]?.[1];
    const body = JSON.parse(String(init?.body)) as { inputs: { scheduler_run_id: string } };
    expect(body.inputs.scheduler_run_id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('releases the claim when GitHub rejects the dispatch', async () => {
    mockIsRandomSchedulerEnabled.mockReturnValue(true);
    mockClaimIfDue.mockImplementation(async (runId: string) => ({ runId }));
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('failure', { status: 500 }));

    const response = await POST(makeRequest());
    expect(response.status).toBe(502);
    expect(mockReleaseSchedulerClaim).toHaveBeenCalledOnce();
  });
});
