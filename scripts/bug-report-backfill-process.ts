/* eslint-disable no-console */
import {
  loadPendingBackfillReportIds,
  resetStaleProcessingReports,
} from '@/shared/infra/server/bugReports/backfill';
import { processBugReports } from '@/shared/infra/server/bugReports/processor';

interface ProcessArgs {
  dryRun: boolean;
  limit?: number;
  delayMs: number;
  resetStale: boolean;
  staleMinutes: number;
}

function readArgs(): ProcessArgs {
  const args = process.argv.slice(2);
  const result: ProcessArgs = {
    dryRun: process.env.BUG_REPORT_BACKFILL_DRY_RUN === 'true',
    delayMs: process.env.BUG_REPORT_BACKFILL_DELAY_MS
      ? Number(process.env.BUG_REPORT_BACKFILL_DELAY_MS)
      : 1500,
    limit: process.env.BUG_REPORT_BACKFILL_LIMIT
      ? Number(process.env.BUG_REPORT_BACKFILL_LIMIT)
      : undefined,
    resetStale: process.env.BUG_REPORT_BACKFILL_RESET_STALE === 'true',
    staleMinutes: process.env.BUG_REPORT_BACKFILL_STALE_MINUTES
      ? Number(process.env.BUG_REPORT_BACKFILL_STALE_MINUTES)
      : 30,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg === '--limit') {
      result.limit = Number(args[index + 1]);
      index += 1;
    } else if (arg === '--delay-ms') {
      result.delayMs = Number(args[index + 1]);
      index += 1;
    } else if (arg === '--reset-stale') {
      result.resetStale = true;
    } else if (arg === '--stale-minutes') {
      result.staleMinutes = Number(args[index + 1]);
      index += 1;
    }
  }

  return result;
}

function validatePositiveInteger(name: string, value: number | undefined) {
  if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
    console.error(`${name} must be a positive integer`);
    process.exit(1);
  }
}

async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  const args = readArgs();
  validatePositiveInteger('--limit', args.limit);
  validatePositiveInteger('--delay-ms', args.delayMs);
  validatePositiveInteger('--stale-minutes', args.staleMinutes);

  if (args.resetStale && !args.dryRun) {
    const result = await resetStaleProcessingReports({
      olderThanMinutes: args.staleMinutes,
    });
    console.log(
      `[bug-report-backfill] Reset ${result.reset} stale processing row(s) older than ${result.cutoffIso}`,
    );
  } else if (args.resetStale) {
    console.log(
      `[bug-report-backfill] Dry run requested; stale rows older than ${args.staleMinutes} minutes would be reset before processing`,
    );
  }

  const reportIds = await loadPendingBackfillReportIds({ limit: args.limit });
  console.log(`[bug-report-backfill] Pending reports selected: ${reportIds.length}`);

  if (args.dryRun) {
    for (const reportId of reportIds) {
      console.log(`  would process ${reportId}`);
    }
    return;
  }

  let processed = 0;
  let failed = 0;

  for (const reportId of reportIds) {
    const [result] = await processBugReports(reportId);
    processed += 1;

    if (result?.error) {
      failed += 1;
      console.error(
        `[bug-report-backfill] ${reportId} -> ${result.status}: ${result.error}`,
      );
    } else {
      console.log(
        `[bug-report-backfill] ${reportId} -> ${result?.status || 'not_found'}${result?.githubIssueUrl ? ` (${result.githubIssueUrl})` : ''}`,
      );
    }

    if (args.delayMs > 0 && processed < reportIds.length) {
      await sleep(args.delayMs);
    }
  }

  console.log('\n[bug-report-backfill] Process summary');
  console.log(`  processed: ${processed}`);
  console.log(`  failed:    ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('[bug-report-backfill] failed', error);
  process.exit(1);
});
