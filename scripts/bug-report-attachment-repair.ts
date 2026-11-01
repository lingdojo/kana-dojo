/* eslint-disable no-console */
import {
  parseTallyBackfillExportFile,
} from '@/shared/infra/server/bugReports/backfill';
import {
  copyAttachmentsToSupabase,
  createSignedUrl,
} from '@/shared/infra/server/bugReports/attachments';
import {
  getGitHubIssue,
  updateGitHubIssueBody,
} from '@/shared/infra/server/bugReports/github';
import { getSupabaseAdminClient } from '@/shared/infra/server/bugReports/supabaseAdmin';

interface Args {
  file: string;
  dryRun: boolean;
}

function readArgs(): Args {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');
  return {
    file: fileIndex >= 0 ? args[fileIndex + 1] : 'tmp/tally-bug-reports.csv',
    dryRun: args.includes('--dry-run'),
  };
}

function replaceAttachmentSection(body: string, links: string[]): string {
  const section = links.length ? links.map((link) => `- ${link}`).join('\n') : 'None.';
  return body.replace(
    /## Attachments\n\n[\s\S]*?(?=\n## Triage Notes)/,
    `## Attachments\n\n${section}`,
  );
}

async function main() {
  const args = readArgs();
  const parsed = await parseTallyBackfillExportFile(args.file);
  const bySubmissionId = new Map(
    parsed.reports.map((report) => [report.sourceSubmissionId, report]),
  );
  const supabase = getSupabaseAdminClient();
  const { data: reports, error } = await supabase
    .from('bug_reports')
    .select('id, source_submission_id, github_issue_number, status, normalized_payload')
    .eq('source', 'tally')
    .eq('status', 'github_created')
    .not('github_issue_number', 'is', null);

  if (error) throw error;

  let affected = 0;
  let repaired = 0;
  let failed = 0;

  for (const report of reports || []) {
    const sourceId = report.source_submission_id as string | null;
    const parsedReport = sourceId ? bySubmissionId.get(sourceId) : undefined;
    const attachments = parsedReport?.normalizedPayload.attachments || [];
    if (!attachments.length) continue;
    affected += 1;

    try {
      const { data: existing, error: attachmentError } = await supabase
        .from('bug_report_attachments')
        .select('id')
        .eq('bug_report_id', report.id as string);
      if (attachmentError) throw attachmentError;

      if (!existing?.length && !args.dryRun) {
        await copyAttachmentsToSupabase({
          bugReportId: report.id as string,
          attachments,
        });
      }

      if (args.dryRun) {
        console.log(`would repair issue #${report.github_issue_number}`);
        continue;
      }

      const { data: stored, error: storedError } = await supabase
        .from('bug_report_attachments')
        .select('original_name, storage_path')
        .eq('bug_report_id', report.id as string)
        .order('created_at', { ascending: true });
      if (storedError) throw storedError;

      const links = (
        await Promise.all(
          (stored || []).map(async (attachment) => {
            const signedUrl = await createSignedUrl(attachment.storage_path as string);
            return signedUrl
              ? `[${attachment.original_name || 'Attachment'}](${signedUrl})`
              : null;
          }),
        )
      ).filter((link): link is string => Boolean(link));
      const issue = await getGitHubIssue(report.github_issue_number as number);
      const updatedBody = replaceAttachmentSection(issue.body, links);
      if (updatedBody === issue.body) {
        throw new Error('GitHub issue has no recognizable attachment section');
      }
      await updateGitHubIssueBody({
        issueNumber: report.github_issue_number as number,
        body: updatedBody,
      });
      repaired += 1;
      console.log(`repaired issue #${report.github_issue_number}`);
    } catch (repairError) {
      failed += 1;
      console.error(`failed issue #${report.github_issue_number}:`, repairError);
    }
  }

  console.log(`affected: ${affected}`);
  console.log(`repaired: ${repaired}`);
  console.log(`failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error('[bug-report-attachment-repair] failed', error);
  process.exit(1);
});
