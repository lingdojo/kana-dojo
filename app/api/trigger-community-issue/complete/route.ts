import { NextResponse } from 'next/server';
import {
  completeSchedulerRun,
  getSchedulerConfig,
} from '../scheduler';

export const runtime = 'edge';

export async function POST(request: Request) {
  const callbackSecret = process.env.COMMUNITY_ISSUE_SCHEDULER_CALLBACK_SECRET;
  if (!callbackSecret) {
    return NextResponse.json({ error: 'Scheduler callback not configured' }, { status: 503 });
  }

  if (request.headers.get('authorization') !== `Bearer ${callbackSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { runId?: unknown; outcome?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const runId = typeof body.runId === 'string' ? body.runId : '';
  const outcome = body.outcome;
  if (!runId || !['created', 'no_issue', 'failed'].includes(String(outcome))) {
    return NextResponse.json({ error: 'runId and a valid outcome are required' }, { status: 400 });
  }

  try {
    const completed = await completeSchedulerRun(
      runId,
      outcome as 'created' | 'no_issue' | 'failed',
      getSchedulerConfig(),
    );

    if (!completed) {
      return NextResponse.json({ ok: true, stale: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`[trigger-community-issue] Scheduler completion failed: ${detail}`);
    return NextResponse.json({ error: 'Scheduler completion failed' }, { status: 503 });
  }
}
