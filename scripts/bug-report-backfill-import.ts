/* eslint-disable no-console */
import {
  importBackfillReports,
  parseTallyBackfillExportFile,
} from '@/shared/infra/server/bugReports/backfill';

interface ImportArgs {
  file?: string;
  dryRun: boolean;
  insert: boolean;
  limit?: number;
}

function readArgs(): ImportArgs {
  const args = process.argv.slice(2);
  const result: ImportArgs = {
    file: process.env.BUG_REPORT_BACKFILL_FILE,
    dryRun: process.env.BUG_REPORT_BACKFILL_MODE === 'dry-run',
    insert: process.env.BUG_REPORT_BACKFILL_MODE === 'insert',
    limit: process.env.BUG_REPORT_BACKFILL_LIMIT
      ? Number(process.env.BUG_REPORT_BACKFILL_LIMIT)
      : undefined,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--file') {
      result.file = args[index + 1];
      index += 1;
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg === '--insert') {
      result.insert = true;
    } else if (arg === '--limit') {
      result.limit = Number(args[index + 1]);
      index += 1;
    }
  }

  return result;
}

function printUsage() {
  console.error(
    'Usage: tsx scripts/bug-report-backfill-import.ts --file <path> (--dry-run | --insert) [--limit <n>]',
  );
}

async function main() {
  const args = readArgs();

  if (!args.file || args.dryRun === args.insert) {
    printUsage();
    process.exit(1);
  }

  if (args.limit !== undefined && (!Number.isInteger(args.limit) || args.limit < 1)) {
    console.error('--limit must be a positive integer');
    process.exit(1);
  }

  const parsed = await parseTallyBackfillExportFile(args.file);
  const selectedReports = args.limit
    ? parsed.reports.slice(0, args.limit)
    : parsed.reports;

  console.log('[bug-report-backfill] Parsed export');
  console.log(`  valid reports: ${parsed.reports.length}`);
  console.log(`  invalid rows:  ${parsed.invalidRows.length}`);
  console.log(`  selected:      ${selectedReports.length}`);

  if (parsed.invalidRows.length > 0) {
    console.log('\n[bug-report-backfill] Invalid rows');
    for (const row of parsed.invalidRows.slice(0, 20)) {
      console.log(`  row ${row.index}: ${row.reason}`);
    }
    if (parsed.invalidRows.length > 20) {
      console.log(`  ...${parsed.invalidRows.length - 20} more`);
    }
  }

  const result = await importBackfillReports({
    reports: selectedReports,
    dryRun: args.dryRun,
  });

  console.log('\n[bug-report-backfill] Import summary');
  console.log(`  mode:               ${args.dryRun ? 'dry-run' : 'insert'}`);
  console.log(`  parsed:             ${result.parsed}`);
  console.log(`  inserted:           ${result.inserted}`);
  console.log(`  skipped duplicates: ${result.skippedDuplicates}`);
  console.log(`  failed:             ${result.failed}`);

  if (result.failures.length > 0) {
    console.log('\n[bug-report-backfill] Failures');
    for (const failure of result.failures) {
      console.log(`  - ${failure}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('[bug-report-backfill] failed', error);
  process.exit(1);
});
