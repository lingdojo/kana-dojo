import { NextResponse } from 'next/server';
import {
  claimIfDue,
  getSchedulerConfig,
  isRandomSchedulerEnabled,
  releaseSchedulerClaim,
} from './scheduler';

const WORKFLOW_FILE = 'hourly-community-issue.yml';
const REPO_OWNER = 'lingdojo';
const REPO_NAME = 'kana-dojo';
const GITHUB_DISPATCH_TIMEOUT_MS = 8000;

export const runtime = 'edge';

/**
 * POST /api/trigger-community-issue
 *
 * Called by cron-job.org. Vercel Cron automatically attaches the same header
 * when used as a trigger.
 *
 * Dispatches the community-issue GitHub Actions workflow via workflow_dispatch,
 * providing a reliable external trigger that bypasses GitHub's unreliable scheduler.
 *
 * Required env vars:
 *   CRON_SECRET  — must match the secret configured in Vercel project settings
 *   GITHUB_PAT   — fine-grained PAT with Actions: Read & Write on this repo
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const githubPat = process.env.GITHUB_PAT;

  if (!githubPat) {
    return NextResponse.json(
      { error: 'GITHUB_PAT not configured' },
      { status: 500 },
    );
  }

  const randomSchedulerEnabled = isRandomSchedulerEnabled();
  let schedulerRunId: string | undefined;
  if (randomSchedulerEnabled) {
    try {
      if (!process.env.COMMUNITY_ISSUE_SCHEDULER_CALLBACK_SECRET) {
        throw new Error('COMMUNITY_ISSUE_SCHEDULER_CALLBACK_SECRET is not configured.');
      }
      // Validate configuration before claiming so a bad deployment cannot
      // strand a due run behind a lease.
      getSchedulerConfig();
      schedulerRunId = crypto.randomUUID();
      const claim = await claimIfDue(schedulerRunId);
      if (!claim) {
        return NextResponse.json({ ok: true, dispatched: false, reason: 'not_due_or_claimed' });
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`[trigger-community-issue] Scheduler claim failed: ${detail}`);
      return NextResponse.json({ error: 'Scheduler unavailable', detail }, { status: 503 });
    }
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubPat}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        ...(schedulerRunId
          ? {
              inputs: {
                scheduler_run_id: schedulerRunId,
              },
            }
          : {}),
      }),
      signal: AbortSignal.timeout(GITHUB_DISPATCH_TIMEOUT_MS),
    });
  } catch (error) {
    if (schedulerRunId) await releaseSchedulerClaim(schedulerRunId).catch(() => undefined);
    const detail = error instanceof Error ? error.message : String(error);
    console.error(
      `[trigger-community-issue] GitHub dispatch request failed: ${detail}`,
    );
    return NextResponse.json(
      { error: 'GitHub dispatch request failed', detail },
      { status: 504 },
    );
  }

  if (!response.ok) {
    if (schedulerRunId) await releaseSchedulerClaim(schedulerRunId).catch(() => undefined);
    const body = await response.text().catch(() => '');
    console.error(
      `[trigger-community-issue] GitHub API error ${response.status}: ${body}`,
    );
    return NextResponse.json(
      {
        error: 'GitHub API error',
        githubStatus: response.status,
        githubBody: body,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, dispatched: true }, { status: 200 });
}
