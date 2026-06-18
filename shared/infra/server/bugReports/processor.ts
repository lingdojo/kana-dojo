import {
  BUG_REPORT_BATCH_SIZE,
  MAX_BUG_REPORT_ATTEMPTS,
} from './config';
import { copyAttachmentsToSupabase } from './attachments';
import {
  createFallbackCleanedReport,
  formatBugReportWithDeepSeek,
} from './deepseek';
import { createGitHubIssue, formatGitHubIssueBody } from './github';
import { getSupabaseAdminClient } from './supabaseAdmin';
import { normalizeTallyPayload } from './tally';
import type {
  BugReportRow,
  BugReportStatus,
  CleanedBugReport,
  NormalizedBugReport,
} from './types';

const PROCESSOR_LOG = '[bug-report-processor]';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function updateReportStatus({
  reportId,
  status,
  lastError,
}: {
  reportId: string;
  status: BugReportStatus;
  lastError?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('bug_reports')
    .update({
      status,
      last_error: lastError ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) {
    throw error;
  }
}

async function loadReports(reportId?: string): Promise<BugReportRow[]> {
  const supabase = getSupabaseAdminClient();

  if (reportId) {
    const { data, error } = await supabase
      .from('bug_reports')
      .select(
        'id, source_submission_id, status, raw_payload, normalized_payload, attempts',
      )
      .eq('id', reportId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? [data as BugReportRow] : [];
  }

  const { data, error } = await supabase
    .from('bug_reports')
    .select(
      'id, source_submission_id, status, raw_payload, normalized_payload, attempts',
    )
    .in('status', ['received', 'retryable_error'])
    .lt('attempts', MAX_BUG_REPORT_ATTEMPTS)
    .order('created_at', { ascending: true })
    .limit(BUG_REPORT_BATCH_SIZE);

  if (error) {
    throw error;
  }

  return (data || []) as BugReportRow[];
}

async function markAttempt(report: BugReportRow) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('bug_reports')
    .update({
      status: 'processing',
      attempts: report.attempts + 1,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', report.id);

  if (error) {
    throw error;
  }
}

async function saveSuccess({
  reportId,
  normalized,
  cleaned,
  githubIssue,
  notes,
}: {
  reportId: string;
  normalized: NormalizedBugReport;
  cleaned: CleanedBugReport;
  githubIssue: { number: number; htmlUrl: string };
  notes: string[];
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('bug_reports')
    .update({
      status: 'github_created',
      normalized_payload: normalized,
      cleaned_payload: {
        ...cleaned,
        processingNotes: notes,
      },
      title: cleaned.title,
      description: cleaned.summary,
      severity: cleaned.severity,
      labels: cleaned.labels,
      github_issue_number: githubIssue.number,
      github_issue_url: githubIssue.htmlUrl,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) {
    throw error;
  }
}

async function saveRetryableFailure(report: BugReportRow, error: unknown) {
  const nextStatus =
    report.attempts + 1 >= MAX_BUG_REPORT_ATTEMPTS
      ? 'failed'
      : 'retryable_error';

  await updateReportStatus({
    reportId: report.id,
    status: nextStatus,
    lastError: errorMessage(error),
  });
}

export async function processBugReport(report: BugReportRow): Promise<{
  reportId: string;
  status: BugReportStatus;
  githubIssueUrl?: string;
  error?: string;
}> {
  if (report.status === 'github_created' || report.attempts >= MAX_BUG_REPORT_ATTEMPTS) {
    return { reportId: report.id, status: report.status };
  }

  await markAttempt(report);

  try {
    const normalized =
      report.normalized_payload || normalizeTallyPayload(report.raw_payload);
    const processingNotes: string[] = [];

    const { storedAttachments, errors: attachmentErrors } =
      await copyAttachmentsToSupabase({
        bugReportId: report.id,
        attachments: normalized.attachments,
      });
    processingNotes.push(...attachmentErrors);

    let cleaned: CleanedBugReport;
    try {
      const result = await formatBugReportWithDeepSeek(normalized);
      cleaned = result.cleaned;
      if (result.usedFallback) {
        processingNotes.push('DeepSeek formatting used fallback output.');
      }
    } catch (error) {
      console.error(`${PROCESSOR_LOG} DeepSeek failed`, error);
      cleaned = createFallbackCleanedReport(normalized);
      processingNotes.push(`DeepSeek failed: ${errorMessage(error)}`);
    }

    const body = formatGitHubIssueBody({
      reportId: report.id,
      sourceSubmissionId: report.source_submission_id,
      normalized,
      cleaned,
      attachments: storedAttachments,
      processingNotes,
    });

    const githubIssue = await createGitHubIssue({
      title: cleaned.title,
      body,
      labels: cleaned.labels,
    });

    await saveSuccess({
      reportId: report.id,
      normalized,
      cleaned,
      githubIssue,
      notes: processingNotes,
    });

    return {
      reportId: report.id,
      status: 'github_created',
      githubIssueUrl: githubIssue.htmlUrl,
    };
  } catch (error) {
    console.error(`${PROCESSOR_LOG} failed for ${report.id}`, error);
    await saveRetryableFailure(report, error);
    return {
      reportId: report.id,
      status:
        report.attempts + 1 >= MAX_BUG_REPORT_ATTEMPTS
          ? 'failed'
          : 'retryable_error',
      error: errorMessage(error),
    };
  }
}

export async function processBugReports(reportId?: string) {
  const reports = await loadReports(reportId);
  const results = [];

  for (const report of reports) {
    results.push(await processBugReport(report));
  }

  return results;
}
