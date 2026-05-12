import { NextResponse } from 'next/server';

const WORKFLOW_FILE = 'hourly-community-issue.yml';
const REPO_OWNER = 'lingdojo';
const REPO_NAME = 'kana-dojo';
const GITHUB_DISPATCH_TIMEOUT_MS = 8000;

export const runtime = 'edge';

/**
 * POST /api/trigger-community-issue
 *
 * Called by Vercel Cron every 15 minutes.
 * Vercel automatically attaches: Authorization: Bearer <CRON_SECRET>
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
      body: JSON.stringify({ ref: 'main' }),
      signal: AbortSignal.timeout(GITHUB_DISPATCH_TIMEOUT_MS),
    });
  } catch (error) {
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

  return NextResponse.json({ ok: true }, { status: 200 });
}
