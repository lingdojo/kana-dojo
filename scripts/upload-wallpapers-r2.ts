/**
 * Upload planned wallpaper assets to Cloudflare R2.
 *
 * Run after `npm run images:process`.
 */
import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const STAGING_DIR = process.env.WALLPAPER_STAGING_DIR || '.generated/wallpapers';
const PLAN_PATH =
  process.env.WALLPAPER_UPLOAD_PLAN_PATH ||
  join(STAGING_DIR, 'wallpaper-upload-plan.json');
const REPORT_PATH =
  process.env.WALLPAPER_UPLOAD_REPORT_PATH ||
  join(STAGING_DIR, 'wallpaper-upload-report.json');
const VERIFY_DIR = join(STAGING_DIR, '.r2-verify');
const R2_BUCKET = process.env.WALLPAPER_R2_BUCKET || 'kanadojo-wallpapers';
const CACHE_CONTROL =
  process.env.WALLPAPER_R2_CACHE_CONTROL ||
  'public, max-age=31536000, immutable';
const MAX_ATTEMPTS = Number(process.env.WALLPAPER_R2_UPLOAD_ATTEMPTS || 3);

interface UploadPlanFile {
  file: string;
  path: string;
  objectKey: string;
  publicUrl: string;
  size: number;
  sha256: string;
  format: 'avif' | 'webp';
  width: number;
  source: string;
  wallpaperId: string;
}

interface UploadPlan {
  version: 2;
  generatedAt: string;
  assetBaseUrl: string;
  r2Prefix: string;
  manifestPath: string;
  buildStatePath: string;
  uploadFiles: UploadPlanFile[];
  unchangedFiles: UploadPlanFile[];
  removedSources: string[];
  remoteCleanupCandidates: string[];
  manifestUrls: {
    wallpaperId: string;
    avif: string;
    webp: string;
    previewAvif: string;
    previewWebp: string;
  }[];
  errors: { source: string; error: string }[];
  summary: {
    sourceCount: number;
    processedCount: number;
    skippedCount: number;
    uploadFileCount: number;
    removedSourceCount: number;
    errorCount: number;
    force: boolean;
  };
}

interface ReportItem {
  file: string;
  objectKey: string;
  publicUrl: string;
  attempts: number;
  uploaded: boolean;
  remoteVerified: boolean;
  publicVerified: boolean;
  error?: string;
}

interface UploadReport {
  version: 2;
  generatedAt: string;
  planGeneratedAt: string;
  bucket: string;
  cacheControl: string;
  uploaded: ReportItem[];
  skipped: UploadPlanFile[];
  manifestUrlChecks: {
    wallpaperId: string;
    url: string;
    expectedContentType: string;
    ok: boolean;
    status?: number;
    contentType?: string;
    cacheControl?: string;
    error?: string;
  }[];
  remoteCleanupCandidates: string[];
  summary: {
    uploadCount: number;
    skippedCount: number;
    failedCount: number;
    manifestUrlFailureCount: number;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256');
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(path);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

async function readPlan(): Promise<UploadPlan> {
  try {
    const raw = await readFile(PLAN_PATH, 'utf-8');
    const plan = JSON.parse(raw) as UploadPlan;
    if (plan.version !== 2 || !Array.isArray(plan.uploadFiles)) {
      throw new Error('Unsupported upload plan format');
    }
    return plan;
  } catch (err) {
    console.error(`Could not read upload plan: ${PLAN_PATH}`);
    console.error('Run `npm run images:process` before uploading to R2.');
    if (err instanceof Error) console.error(err.message);
    process.exit(1);
  }
}

function runWrangler(args: string[]): { ok: boolean; output: string } {
  const windowsWranglerScript =
    process.env.WRANGLER_PS1_PATH || 'C:\\nvm4w\\nodejs\\wrangler.ps1';
  const usePowerShellWrapper =
    process.platform === 'win32' && existsSync(windowsWranglerScript);
  const command =
    process.platform === 'win32'
      ? usePowerShellWrapper
        ? 'powershell.exe'
        : 'cmd.exe'
      : 'wrangler';
  const commandArgs = (() => {
    if (process.platform !== 'win32') return args;
    if (usePowerShellWrapper) {
      return [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        windowsWranglerScript,
        ...args,
      ];
    }

    const quote = (value: string) => `"${value.replace(/"/g, '\\"')}"`;
    return ['/d', '/s', '/c', ['wrangler', ...args].map(quote).join(' ')];
  })();

  const result = spawnSync(command, commandArgs, {
    encoding: 'utf-8',
  });

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  return {
    ok: !result.error && result.status === 0,
    output: result.error ? result.error.message : output,
  };
}

async function verifyRemoteObject(file: UploadPlanFile): Promise<void> {
  await mkdir(VERIFY_DIR, { recursive: true });
  const verifyPath = join(
    VERIFY_DIR,
    `${file.sha256.slice(0, 12)}-${basename(file.file)}`,
  );

  try {
    await rm(verifyPath, { force: true });
    const result = runWrangler([
      'r2',
      'object',
      'get',
      `${R2_BUCKET}/${file.objectKey}`,
      '--file',
      verifyPath,
      '--remote',
    ]);

    if (!result.ok) {
      throw new Error(result.output || 'wrangler r2 object get failed');
    }

    const remoteStat = await stat(verifyPath);
    if (remoteStat.size !== file.size) {
      throw new Error(
        `remote size mismatch: expected ${file.size}, got ${remoteStat.size}`,
      );
    }

    const remoteHash = await sha256File(verifyPath);
    if (remoteHash !== file.sha256) {
      throw new Error('remote sha256 mismatch');
    }
  } finally {
    await rm(verifyPath, { force: true });
  }
}

async function uploadAndVerify(file: UploadPlanFile): Promise<ReportItem> {
  const localStat = await stat(file.path);
  if (localStat.size !== file.size) {
    return {
      file: file.file,
      objectKey: file.objectKey,
      publicUrl: file.publicUrl,
      attempts: 0,
      uploaded: false,
      remoteVerified: false,
      publicVerified: false,
      error: `local size mismatch: expected ${file.size}, got ${localStat.size}`,
    };
  }

  const localHash = await sha256File(file.path);
  if (localHash !== file.sha256) {
    return {
      file: file.file,
      objectKey: file.objectKey,
      publicUrl: file.publicUrl,
      attempts: 0,
      uploaded: false,
      remoteVerified: false,
      publicVerified: false,
      error: 'local sha256 mismatch',
    };
  }

  let lastError = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`\n${file.file} -> ${file.objectKey} (attempt ${attempt})`);
    const result = runWrangler([
      'r2',
      'object',
      'put',
      `${R2_BUCKET}/${file.objectKey}`,
      '--file',
      file.path,
      '--cache-control',
      CACHE_CONTROL,
      '--remote',
    ]);

    if (!result.ok) {
      lastError = result.output || 'wrangler r2 object put failed';
    } else {
      try {
        await verifyRemoteObject(file);
        return {
          file: file.file,
          objectKey: file.objectKey,
          publicUrl: file.publicUrl,
          attempts: attempt,
          uploaded: true,
          remoteVerified: true,
          publicVerified: false,
        };
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (attempt < MAX_ATTEMPTS) await sleep(1000 * attempt);
  }

  return {
    file: file.file,
    objectKey: file.objectKey,
    publicUrl: file.publicUrl,
    attempts: MAX_ATTEMPTS,
    uploaded: false,
    remoteVerified: false,
    publicVerified: false,
    error: lastError,
  };
}

async function checkPublicUrl(
  wallpaperId: string,
  url: string,
  expectedContentType: string,
): Promise<UploadReport['manifestUrlChecks'][number]> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') ?? undefined;
      const cacheControl = response.headers.get('cache-control') ?? undefined;
      const hasExpectedContentType = contentType?.startsWith(expectedContentType);
      const hasImmutableCacheControl = cacheControl?.includes('immutable');
      const ok = response.ok && hasExpectedContentType && hasImmutableCacheControl;

      if (ok) {
        return {
          wallpaperId,
          url,
          expectedContentType,
          ok: true,
          status: response.status,
          contentType,
          cacheControl,
        };
      }

      if (attempt === MAX_ATTEMPTS) {
        return {
          wallpaperId,
          url,
          expectedContentType,
          ok: false,
          status: response.status,
          contentType,
          cacheControl,
          error: !response.ok
            ? `HTTP ${response.status}`
            : !hasExpectedContentType
              ? `expected ${expectedContentType}, got ${contentType ?? 'no content type'}`
              : 'missing immutable Cache-Control header',
        };
      }
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) {
        return {
          wallpaperId,
          url,
          expectedContentType,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    await sleep(1000 * attempt);
  }

  return {
    wallpaperId,
    url,
    expectedContentType,
    ok: false,
    error: 'unreachable',
  };
}

async function main() {
  console.log('R2 Wallpaper Upload');
  console.log('-'.repeat(50));

  const plan = await readPlan();

  if (plan.errors.length > 0) {
    console.error('Upload plan contains processing errors. Fix them first.');
    for (const error of plan.errors) {
      console.error(`  ${error.source}: ${error.error}`);
    }
    process.exit(1);
  }

  console.log(`Bucket: ${R2_BUCKET}`);
  console.log(`Cache-Control: ${CACHE_CONTROL}`);
  console.log(`Planned uploads: ${plan.uploadFiles.length}`);
  console.log(`Unchanged files: ${plan.unchangedFiles.length}`);

  const uploaded: ReportItem[] = [];
  for (const file of plan.uploadFiles) {
    uploaded.push(await uploadAndVerify(file));
  }

  const manifestUrlChecks: UploadReport['manifestUrlChecks'] = [];
  for (const item of plan.manifestUrls) {
    manifestUrlChecks.push(
      await checkPublicUrl(item.wallpaperId, item.avif, 'image/avif'),
    );
    manifestUrlChecks.push(
      await checkPublicUrl(item.wallpaperId, item.webp, 'image/webp'),
    );
    manifestUrlChecks.push(
      await checkPublicUrl(item.wallpaperId, item.previewAvif, 'image/avif'),
    );
    manifestUrlChecks.push(
      await checkPublicUrl(item.wallpaperId, item.previewWebp, 'image/webp'),
    );
  }

  const failedCount = uploaded.filter(item => !item.remoteVerified).length;
  const manifestUrlFailureCount = manifestUrlChecks.filter(item => !item.ok).length;

  for (const item of uploaded) {
    item.publicVerified = manifestUrlChecks.some(
      check => check.url === item.publicUrl && check.ok,
    );
  }

  const report: UploadReport = {
    version: 2,
    generatedAt: new Date().toISOString(),
    planGeneratedAt: plan.generatedAt,
    bucket: R2_BUCKET,
    cacheControl: CACHE_CONTROL,
    uploaded,
    skipped: plan.unchangedFiles,
    manifestUrlChecks,
    remoteCleanupCandidates: plan.remoteCleanupCandidates,
    summary: {
      uploadCount: uploaded.length,
      skippedCount: plan.unchangedFiles.length,
      failedCount,
      manifestUrlFailureCount,
    },
  };
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n' + '-'.repeat(50));
  console.log('Summary');
  console.log('-'.repeat(50));
  console.log(`Uploaded and remote-verified: ${uploaded.length - failedCount}`);
  console.log(`Skipped unchanged: ${plan.unchangedFiles.length}`);
  console.log(`Public URL failures: ${manifestUrlFailureCount}`);
  console.log(`Wrote report: ${REPORT_PATH}`);

  if (plan.remoteCleanupCandidates.length > 0) {
    console.log('\nRemote cleanup candidates (not deleted automatically):');
    for (const key of plan.remoteCleanupCandidates) console.log(`  ${key}`);
  }

  if (failedCount > 0 || manifestUrlFailureCount > 0) {
    console.error('\nR2 wallpaper upload verification failed.');
    process.exit(1);
  }

  console.log('\nR2 wallpaper upload complete.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
