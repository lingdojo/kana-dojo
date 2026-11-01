/**
 * Wallpaper Image Processing Script
 *
 * Reads source images from data/wallpapers-source/ and generates:
 * 1. Optimized AVIF + WebP versions at multiple sizes in .generated/wallpapers/
 * 2. A TypeScript manifest file that the app imports to know which wallpapers exist
 * 3. A build state and upload plan for smart R2 publishing
 */
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  mkdir,
  readFile,
  readdir,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { extname, join, parse } from 'node:path';
import sharp from 'sharp';
import {
  OUTPUT_WIDTHS,
  SHARP_AVIF_OPTIONS,
  SHARP_WEBP_OPTIONS,
  SUPPORTED_EXTENSIONS,
  WALLPAPER_PREVIEW_WIDTH,
  formatBytes,
  toDisplayName,
} from '../features/Preferences/config/imageProcessing.js';

const SOURCE_DIR = 'data/wallpapers-source';
const OUTPUT_DIR = '.generated/wallpapers';
const MANIFEST_PATH =
  'features/Preferences/data/wallpapers/wallpapers.generated.ts';
const BUILD_STATE_PATH = `${OUTPUT_DIR}/wallpaper-build-state.json`;
const UPLOAD_PLAN_PATH = `${OUTPUT_DIR}/wallpaper-upload-plan.json`;
const R2_ASSET_BASE_URL = (
  process.env.WALLPAPER_ASSET_BASE_URL || 'https://assets.kanadojo.com'
).replace(/\/$/, '');
const R2_WALLPAPER_PREFIX = (
  process.env.WALLPAPER_R2_PREFIX || 'wallpapers'
).replace(/^\/|\/$/g, '');

const forceReprocess = process.argv.includes('--force');
const MANIFEST_WIDTH_PREFERENCE = [2560, 1920, 3840] as const;
const SOURCE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface OutputFile {
  file: string;
  path: string;
  objectKey: string;
  publicUrl: string;
  size: number;
  sha256: string;
  format: 'avif' | 'webp';
  width: number;
}

interface SourceFingerprint {
  source: string;
  baseName: string;
  sourceSize: number;
  sourceSha256: string;
  width: number;
  height: number;
  outputs: string[];
  outputWidths: number[];
  avifOptions: typeof SHARP_AVIF_OPTIONS;
  webpOptions: typeof SHARP_WEBP_OPTIONS;
  r2Prefix: string;
  assetBaseUrl: string;
}

interface BuildState {
  version: 2;
  generatedAt: string;
  sources: Record<string, SourceFingerprint>;
}

interface ProcessResult {
  source: string;
  baseName: string;
  displayName: string;
  outputs: OutputFile[];
  expectedOutputs: OutputFile[];
  fingerprint?: SourceFingerprint;
  originalSize: number;
  skipped?: boolean;
  reason?: string;
  error?: string;
}

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

async function readBuildState(): Promise<BuildState> {
  try {
    const raw = await readFile(BUILD_STATE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as BuildState;
    if (parsed.version === 2 && parsed.sources) return parsed;
  } catch {
    // Missing or invalid state means a conservative first run.
  }

  return { version: 2, generatedAt: new Date(0).toISOString(), sources: {} };
}

async function getSourceImages(): Promise<string[]> {
  try {
    const entries = await readdir(SOURCE_DIR);
    return entries
      .filter(file => SUPPORTED_EXTENSIONS.has(extname(file).toLowerCase()))
      .sort();
  } catch {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }
}

function validateSourceFilenames(files: string[]): void {
  const ids = new Map<string, string[]>();
  const invalid: string[] = [];

  for (const file of files) {
    const baseName = parse(file).name;
    if (!SOURCE_ID_PATTERN.test(baseName)) invalid.push(file);
    const matches = ids.get(baseName) ?? [];
    matches.push(file);
    ids.set(baseName, matches);
  }

  const duplicates = [...ids.entries()].filter(([, matches]) => matches.length > 1);
  if (invalid.length === 0 && duplicates.length === 0) return;

  console.error('\nInvalid wallpaper source filenames.');
  for (const file of invalid) {
    const suggested = parse(file)
      .name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    console.error(`  ${file} -> rename to ${suggested}${extname(file).toLowerCase()}`);
  }
  for (const [id, matches] of duplicates) {
    console.error(`  Duplicate wallpaper ID "${id}": ${matches.join(', ')}`);
  }
  process.exit(1);
}

function getExpectedOutputNames(baseName: string, sourceWidth: number): string[] {
  const outputs: string[] = [];
  for (const width of OUTPUT_WIDTHS) {
    if (width > sourceWidth) continue;
    outputs.push(`${baseName}-${width}w.avif`);
    outputs.push(`${baseName}-${width}w.webp`);
  }
  return outputs;
}

async function getOutputFile(file: string): Promise<OutputFile> {
  const outputPath = join(OUTPUT_DIR, file);
  const fileStat = await stat(outputPath);
  const match = file.match(/^(.+)-(\d+)w\.(avif|webp)$/);
  if (!match) throw new Error(`Unexpected output filename: ${file}`);

  return {
    file,
    path: outputPath.replace(/\\/g, '/'),
    objectKey: `${R2_WALLPAPER_PREFIX}/${file}`,
    publicUrl: `${R2_ASSET_BASE_URL}/${R2_WALLPAPER_PREFIX}/${file}`,
    size: fileStat.size,
    sha256: await sha256File(outputPath),
    format: match[3] as 'avif' | 'webp',
    width: Number(match[2]),
  };
}

async function getExpectedOutputFiles(
  baseName: string,
  sourceWidth: number,
): Promise<OutputFile[]> {
  const files: OutputFile[] = [];
  for (const file of getExpectedOutputNames(baseName, sourceWidth)) {
    files.push(await getOutputFile(file));
  }
  return files;
}

async function getSourceFingerprint(
  filename: string,
): Promise<SourceFingerprint> {
  const sourcePath = join(SOURCE_DIR, filename);
  const fileStat = await stat(sourcePath);
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions');
  }
  if (metadata.width < WALLPAPER_PREVIEW_WIDTH) {
    throw new Error(
      `Source must be at least ${WALLPAPER_PREVIEW_WIDTH}px wide to generate a theme preview`,
    );
  }

  const baseName = parse(filename).name;
  const outputWidths = OUTPUT_WIDTHS.filter(width => width <= metadata.width);

  return {
    source: filename,
    baseName,
    sourceSize: fileStat.size,
    sourceSha256: await sha256File(sourcePath),
    width: metadata.width,
    height: metadata.height,
    outputs: getExpectedOutputNames(baseName, metadata.width),
    outputWidths,
    avifOptions: SHARP_AVIF_OPTIONS,
    webpOptions: SHARP_WEBP_OPTIONS,
    r2Prefix: R2_WALLPAPER_PREFIX,
    assetBaseUrl: R2_ASSET_BASE_URL,
  };
}

async function outputsExist(outputs: string[]): Promise<boolean> {
  for (const output of outputs) {
    try {
      await stat(join(OUTPUT_DIR, output));
    } catch {
      return false;
    }
  }
  return true;
}

function sameFingerprint(
  previous: SourceFingerprint | undefined,
  current: SourceFingerprint,
): boolean {
  if (!previous) return false;
  return JSON.stringify(previous) === JSON.stringify(current);
}

async function processImage(
  filename: string,
  fingerprint: SourceFingerprint,
): Promise<ProcessResult> {
  const sourcePath = join(SOURCE_DIR, filename);
  const result: ProcessResult = {
    source: filename,
    baseName: fingerprint.baseName,
    displayName: toDisplayName(fingerprint.baseName),
    outputs: [],
    expectedOutputs: [],
    originalSize: fingerprint.sourceSize,
    fingerprint,
  };

  try {
    console.log(
      `  Processing: ${filename} (${fingerprint.width}x${fingerprint.height})`,
    );

    for (const width of OUTPUT_WIDTHS) {
      if (width > fingerprint.width) {
        console.log(`    Skipping ${width}w (larger than source)`);
        continue;
      }

      const avifName = `${fingerprint.baseName}-${width}w.avif`;
      const avifInfo = await sharp(sourcePath)
        .resize(width, undefined, { withoutEnlargement: true })
        .avif(SHARP_AVIF_OPTIONS)
        .toFile(join(OUTPUT_DIR, avifName));
      const avifOutput = await getOutputFile(avifName);
      avifOutput.size = avifInfo.size;
      result.outputs.push(avifOutput);

      const webpName = `${fingerprint.baseName}-${width}w.webp`;
      const webpInfo = await sharp(sourcePath)
        .resize(width, undefined, { withoutEnlargement: true })
        .webp(SHARP_WEBP_OPTIONS)
        .toFile(join(OUTPUT_DIR, webpName));
      const webpOutput = await getOutputFile(webpName);
      webpOutput.size = webpInfo.size;
      result.outputs.push(webpOutput);
    }

    result.expectedOutputs = await getExpectedOutputFiles(
      fingerprint.baseName,
      fingerprint.width,
    );
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return result;
}

async function getAvailableWidthsByBaseName(): Promise<Map<string, Set<number>>> {
  const map = new Map<string, Set<number>>();

  try {
    const outputFiles = await readdir(OUTPUT_DIR);
    for (const file of outputFiles) {
      const match = file.match(/^(.+)-(\d+)w\.(avif|webp)$/);
      if (!match) continue;

      const baseName = match[1];
      const width = Number(match[2]);
      if (!Number.isFinite(width)) continue;

      const widths = map.get(baseName) ?? new Set<number>();
      widths.add(width);
      map.set(baseName, widths);
    }
  } catch {
    // Output dir might not exist yet.
  }

  return map;
}

function selectManifestWidth(
  baseName: string,
  availableWidths: Map<string, Set<number>>,
): number {
  const widths = availableWidths.get(baseName);
  if (!widths || widths.size === 0) return 2560;

  for (const preferred of MANIFEST_WIDTH_PREFERENCE) {
    if (widths.has(preferred)) return preferred;
  }

  return Math.max(...widths);
}

function selectPreviewWidth(
  baseName: string,
  availableWidths: Map<string, Set<number>>,
): number {
  const widths = availableWidths.get(baseName);
  if (!widths?.has(WALLPAPER_PREVIEW_WIDTH)) {
    throw new Error(
      `Missing ${WALLPAPER_PREVIEW_WIDTH}px preview output for ${baseName}`,
    );
  }
  return WALLPAPER_PREVIEW_WIDTH;
}

function generateManifest(
  results: ProcessResult[],
  availableWidths: Map<string, Set<number>>,
): string {
  const successful = results.filter(r => !r.error);

  const entries = successful
    .map(r => {
      const selectedWidth = selectManifestWidth(r.baseName, availableWidths);
      const previewWidth = selectPreviewWidth(r.baseName, availableWidths);
      return `  {
    id: '${r.baseName}',
    name: '${r.displayName}',
    url: '${R2_ASSET_BASE_URL}/${R2_WALLPAPER_PREFIX}/${r.baseName}-${selectedWidth}w.avif',
    urlWebp: '${R2_ASSET_BASE_URL}/${R2_WALLPAPER_PREFIX}/${r.baseName}-${selectedWidth}w.webp',
    previewUrl: '${R2_ASSET_BASE_URL}/${R2_WALLPAPER_PREFIX}/${r.baseName}-${previewWidth}w.avif',
    previewUrlWebp: '${R2_ASSET_BASE_URL}/${R2_WALLPAPER_PREFIX}/${r.baseName}-${previewWidth}w.webp',
  },`;
    })
    .join('\n');

  return `/**
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 *
 * Generated by: npm run images:process
 * Source: data/wallpapers-source/
 *
 * Each entry corresponds to a source image that was processed into
 * AVIF + WebP at responsive widths in .generated/wallpapers/
 * and published to Cloudflare R2.
 */

export interface GeneratedWallpaper {
  /** Unique ID derived from source filename (kebab-case) */
  id: string;
  /** Human-readable display name (auto-generated from filename) */
  name: string;
  /** Primary AVIF URL */
  url: string;
  /** WebP fallback URL */
  urlWebp: string;
  /** Small AVIF URL used only by theme-picker cards */
  previewUrl?: string;
  /** Small WebP fallback URL used only by theme-picker cards */
  previewUrlWebp?: string;
}

/**
 * All available wallpapers, dynamically generated from source images.
 * The number of entries here directly determines the number of Premium themes.
 */
export const GENERATED_WALLPAPERS: GeneratedWallpaper[] = [
${entries}
];
`;
}

async function cleanOrphanedOutputs(
  sourceBaseNames: Set<string>,
): Promise<string[]> {
  const removed: string[] = [];

  try {
    const outputFiles = await readdir(OUTPUT_DIR);
    for (const file of outputFiles) {
      const match = file.match(/^(.+)-\d+w\.(avif|webp)$/);
      if (!match) continue;
      if (sourceBaseNames.has(match[1])) continue;

      await unlink(join(OUTPUT_DIR, file));
      removed.push(file);
    }
  } catch {
    // Output dir might not exist yet.
  }

  return removed;
}

function toPlanFile(result: ProcessResult, output: OutputFile): UploadPlanFile {
  return {
    ...output,
    source: result.source,
    wallpaperId: result.baseName,
  };
}

function makeManifestUrls(
  results: ProcessResult[],
  availableWidths: Map<string, Set<number>>,
): UploadPlan['manifestUrls'] {
  return results
    .filter(result => !result.error)
    .map(result => {
      const width = selectManifestWidth(result.baseName, availableWidths);
      const previewWidth = selectPreviewWidth(result.baseName, availableWidths);
      return {
        wallpaperId: result.baseName,
        avif: `${R2_ASSET_BASE_URL}/${R2_WALLPAPER_PREFIX}/${result.baseName}-${width}w.avif`,
        webp: `${R2_ASSET_BASE_URL}/${R2_WALLPAPER_PREFIX}/${result.baseName}-${width}w.webp`,
        previewAvif: `${R2_ASSET_BASE_URL}/${R2_WALLPAPER_PREFIX}/${result.baseName}-${previewWidth}w.avif`,
        previewWebp: `${R2_ASSET_BASE_URL}/${R2_WALLPAPER_PREFIX}/${result.baseName}-${previewWidth}w.webp`,
      };
    });
}

async function main() {
  console.log('Wallpaper Image Processor');
  console.log('-'.repeat(50));

  if (forceReprocess) console.log('Force mode: reprocessing all images\n');

  await mkdir(OUTPUT_DIR, { recursive: true });

  const sourceFiles = await getSourceImages();
  validateSourceFilenames(sourceFiles);

  if (sourceFiles.length === 0) {
    await writeFile(MANIFEST_PATH, generateManifest([], new Map()), 'utf-8');
    await writeFile(
      UPLOAD_PLAN_PATH,
      JSON.stringify(
        {
          version: 2,
          generatedAt: new Date().toISOString(),
          assetBaseUrl: R2_ASSET_BASE_URL,
          r2Prefix: R2_WALLPAPER_PREFIX,
          manifestPath: MANIFEST_PATH,
          buildStatePath: BUILD_STATE_PATH,
          uploadFiles: [],
          unchangedFiles: [],
          removedSources: [],
          remoteCleanupCandidates: [],
          manifestUrls: [],
          errors: [],
          summary: {
            sourceCount: 0,
            processedCount: 0,
            skippedCount: 0,
            uploadFileCount: 0,
            removedSourceCount: 0,
            errorCount: 0,
            force: forceReprocess,
          },
        } satisfies UploadPlan,
        null,
        2,
      ),
      'utf-8',
    );
    console.log(`No source images found in ${SOURCE_DIR}`);
    return;
  }

  const previousState = await readBuildState();
  const nextSources: Record<string, SourceFingerprint> = {};
  const removedSources = Object.keys(previousState.sources).filter(
    id => !sourceFiles.some(file => parse(file).name === id),
  );
  const sourceBaseNames = new Set(sourceFiles.map(file => parse(file).name));
  const orphansRemoved = await cleanOrphanedOutputs(sourceBaseNames);

  console.log(`Found ${sourceFiles.length} source image(s)`);
  if (orphansRemoved.length > 0) {
    console.log(`Cleaned ${orphansRemoved.length} orphaned output(s)`);
  }

  const results: ProcessResult[] = [];
  const toProcess: { file: string; fingerprint: SourceFingerprint; reason: string }[] = [];

  for (const file of sourceFiles) {
    try {
      const fingerprint = await getSourceFingerprint(file);
      const previous = previousState.sources[fingerprint.baseName];
      const exists = await outputsExist(fingerprint.outputs);
      const canBootstrapExistingOutputs = !previous && exists;
      const unchanged =
        !forceReprocess &&
        exists &&
        (sameFingerprint(previous, fingerprint) || canBootstrapExistingOutputs);

      if (unchanged) {
        const expectedOutputs = await getExpectedOutputFiles(
          fingerprint.baseName,
          fingerprint.width,
        );
        results.push({
          source: file,
          baseName: fingerprint.baseName,
          displayName: toDisplayName(fingerprint.baseName),
          outputs: [],
          expectedOutputs,
          originalSize: fingerprint.sourceSize,
          fingerprint,
          skipped: true,
          reason: canBootstrapExistingOutputs
            ? 'bootstrapped from existing outputs'
            : 'fingerprint unchanged',
        });
        nextSources[fingerprint.baseName] = fingerprint;
      } else {
        const reason = forceReprocess
          ? 'force'
          : !previous
            ? 'new source'
            : !exists
              ? 'missing output'
              : 'fingerprint changed';
        toProcess.push({ file, fingerprint, reason });
      }
    } catch (err) {
      results.push({
        source: file,
        baseName: parse(file).name,
        displayName: toDisplayName(parse(file).name),
        outputs: [],
        expectedOutputs: [],
        originalSize: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log(`Skipped: ${results.filter(result => result.skipped).length}`);
  console.log(`To process: ${toProcess.length}`);

  for (const item of toProcess) {
    console.log(`\nReason: ${item.reason}`);
    const result = await processImage(item.file, item.fingerprint);
    results.push(result);
    if (!result.error) nextSources[item.fingerprint.baseName] = item.fingerprint;
  }

  results.sort((a, b) => a.baseName.localeCompare(b.baseName));
  const availableWidths = await getAvailableWidthsByBaseName();
  const manifest = generateManifest(results, availableWidths);
  await writeFile(MANIFEST_PATH, manifest, 'utf-8');

  const buildState: BuildState = {
    version: 2,
    generatedAt: new Date().toISOString(),
    sources: nextSources,
  };
  await writeFile(BUILD_STATE_PATH, JSON.stringify(buildState, null, 2), 'utf-8');

  const uploadFiles = results.flatMap(result => {
    if (!result.skipped) {
      return result.outputs.map(output => toPlanFile(result, output));
    }

    // A versioned pipeline upgrade can bootstrap pre-generated files locally.
    // The new 480px preview objects still need their first R2 publication.
    return result.reason === 'bootstrapped from existing outputs'
      ? result.expectedOutputs
          .filter(output => output.width === WALLPAPER_PREVIEW_WIDTH)
          .map(output => toPlanFile(result, output))
      : [];
  });
  const unchangedFiles = results.flatMap(result =>
    result.skipped
      ? result.expectedOutputs.map(output => toPlanFile(result, output))
      : [],
  );
  const remoteCleanupCandidates = [
    ...orphansRemoved.map(file => `${R2_WALLPAPER_PREFIX}/${file}`),
  ];

  const plan: UploadPlan = {
    version: 2,
    generatedAt: new Date().toISOString(),
    assetBaseUrl: R2_ASSET_BASE_URL,
    r2Prefix: R2_WALLPAPER_PREFIX,
    manifestPath: MANIFEST_PATH,
    buildStatePath: BUILD_STATE_PATH,
    uploadFiles,
    unchangedFiles,
    removedSources,
    remoteCleanupCandidates,
    manifestUrls: makeManifestUrls(results, availableWidths),
    errors: results
      .filter(result => result.error)
      .map(result => ({ source: result.source, error: result.error ?? '' })),
    summary: {
      sourceCount: sourceFiles.length,
      processedCount: results.filter(result => !result.skipped && !result.error)
        .length,
      skippedCount: results.filter(result => result.skipped).length,
      uploadFileCount: uploadFiles.length,
      removedSourceCount: removedSources.length,
      errorCount: results.filter(result => result.error).length,
      force: forceReprocess,
    },
  };
  await writeFile(UPLOAD_PLAN_PATH, JSON.stringify(plan, null, 2), 'utf-8');

  console.log('\n' + '-'.repeat(50));
  console.log('Summary');
  console.log('-'.repeat(50));
  for (const result of results) {
    if (result.error) {
      console.log(`  ERROR ${result.source}: ${result.error}`);
    } else if (result.skipped) {
      console.log(`  SKIP  ${result.source} (${result.reason})`);
    } else {
      console.log(`  DONE  ${result.source} (${formatBytes(result.originalSize)})`);
      for (const output of result.outputs) {
        console.log(`        ${output.file}: ${formatBytes(output.size)}`);
      }
    }
  }

  console.log(`\nSource images: ${sourceFiles.length}`);
  console.log(`Processed: ${plan.summary.processedCount}`);
  console.log(`Skipped: ${plan.summary.skippedCount}`);
  console.log(`Upload plan files: ${plan.summary.uploadFileCount}`);
  console.log(`Generated manifest: ${MANIFEST_PATH}`);
  console.log(`Wrote build state: ${BUILD_STATE_PATH}`);
  console.log(`Wrote upload plan: ${UPLOAD_PLAN_PATH}`);

  if (plan.summary.errorCount > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
