import { after, NextResponse } from 'next/server';
import {
  verifyBearerToken,
  verifyTallySignature,
} from '@/shared/infra/server/bugReports/auth';
import { processBugReports } from '@/shared/infra/server/bugReports/processor';
import { getSupabaseAdminClient } from '@/shared/infra/server/bugReports/supabaseAdmin';
import { normalizeTallyPayload } from '@/shared/infra/server/bugReports/tally';

export const runtime = 'nodejs';
export const maxDuration = 30;

const WEBHOOK_LOG = '[tally-bug-report-webhook]';

export async function POST(request: Request) {
  if (
    !verifyBearerToken(
      request.headers.get('authorization'),
      process.env.TALLY_WEBHOOK_TOKEN,
    )
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (
    !verifyTallySignature({
      payload,
      signature: request.headers.get('tally-signature'),
      secret: process.env.TALLY_WEBHOOK_SECRET,
    })
  ) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const normalized = normalizeTallyPayload(payload);
  const sourceSubmissionId = normalized.submissionId;

  const { data: existingReport, error: lookupError } = sourceSubmissionId
    ? await supabase
        .from('bug_reports')
        .select('id, github_issue_url')
        .eq('source_submission_id', sourceSubmissionId)
        .maybeSingle()
    : { data: null, error: null };

  if (lookupError) {
    console.error(`${WEBHOOK_LOG} duplicate lookup failed`, lookupError);
    return NextResponse.json(
      { error: 'Failed to check existing report' },
      { status: 500 },
    );
  }

  if (existingReport) {
    return NextResponse.json(
      { ok: true, reportId: existingReport.id, duplicate: true },
      { status: 200 },
    );
  }

  const { data: insertedReport, error: insertError } = await supabase
    .from('bug_reports')
    .insert({
      source: 'tally',
      source_submission_id: sourceSubmissionId,
      status: 'received',
      raw_payload: payload,
      normalized_payload: normalized,
    })
    .select('id')
    .single();

  if (insertError || !insertedReport) {
    console.error(`${WEBHOOK_LOG} insert failed`, insertError);
    return NextResponse.json(
      { error: 'Failed to store report' },
      { status: 500 },
    );
  }

  const reportId = insertedReport.id as string;

  after(async () => {
    try {
      await processBugReports(reportId);
    } catch (error) {
      console.error(`${WEBHOOK_LOG} immediate processing failed`, error);
    }
  });

  return NextResponse.json({ ok: true, reportId }, { status: 200 });
}
