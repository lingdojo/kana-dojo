/**
 * Wallpaper Image Processing Script
 *
 * Reads source images from data/wallpapers-source/ and generates:
 * 1. Optimized AVIF + WebP versions at multiple sizes in public/wallpapers/
 * 2. A TypeScript manifest file that the app imports to know which wallpapers exist
 *
 * Premium themes are dynamically generated from whatever images exist in the
 * source folder — no hardcoded wallpaper list needed.
 *
 * Incremental processing: Only new or modified source images are processed.
 * The script uses timestamp-based dependency checking (like `make`) to skip
 * images whose outputs already exist and are up-to-date.
 *
 * Usage:
 *   npm run images:process           # Incremental (skip up-to-date images)
 *   npm run images:process -- --force # Force reprocess all images
 *
 * All configuration values are imported from the shared config to ensure
 * consistency with the browser-side image processor.
 */
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile, unlink } from 'node:fs/promises';
import { join, parse, extname } from 'node:path';
import {
  OUTPUT_WIDTHS,
  SUPPORTED_EXTENSIONS,
  SHARP_AVIF_OPTIONS,
  SHARP_WEBP_OPTIONS,
  formatBytes,
  toDisplayName,
} from '../features/Preferences/config/imageProcessing.js';

// Configuration
const SOURCE_DIR = 'data/wallpapers-source';
const OUTPUT_DIR = 'public/wallpapers';
const MANIFEST_PATH = 'features/Preferences/data/wallpapers.generated.ts';

const forceReprocess = process.argv.includes('--force');

interface ProcessResult {
  source: string;
  baseName: string;
  displayName: string;
  outputs: { file: string; size: number; format: string; width: number }[];
  originalSize: number;
  skipped?: boolean;
  error?: string;
}

async function getSourceImages(): Promise<string[]> {
  try {
    const entries = await readdir(SOURCE_DIR);
    return entries
      .filter(file => {
        const ext = extname(file).toLowerCase();
        return SUPPORTED_EXTENSIONS.has(ext);
      })
      .sort(); // Deterministic order
  } catch {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    console.error(
      '   Create the directory and add source images. See data/wallpapers-source/README.md',
    );
    process.exit(1);
  }
}

/**
 * Get expected output filenames for a given source image base name.
 * Each source image produces AVIF + WebP at each configured width.
 */
function getExpectedOutputs(baseName: string): string[] {
  const outputs: string[] = [];
  for (const width of OUTPUT_WIDTHS) {
    outputs.push(`${baseName}-${width}w.avif`);
    outputs.push(`${baseName}-${width}w.webp`);
  }
  return outputs;
}

/**
 * Check if a source image needs (re)processing using timestamp-based
 * dependency checking — the same strategy used by `make`.
 *
 * Returns true if:
 *   - Any expected output file is missing
 *   - The source file is newer than the oldest output file (source was updated)
 */
async function needsProcessing(filename: string): Promise<boolean> {
  if (forceReprocess) return true;

  const sourcePath = join(SOURCE_DIR, filename);
  const baseName = parse(filename).name;
  const expectedOutputs = getExpectedOutputs(baseName);

  try {
    const sourceStat = await stat(sourcePath);
    const sourceMtime = sourceStat.mtimeMs;

    for (const outputFile of expectedOutputs) {
      const outputPath = join(OUTPUT_DIR, outputFile);
      try {
        const outputStat = await stat(outputPath);
        // Source is newer than this output → needs reprocessing
        if (sourceMtime > outputStat.mtimeMs) {
          return true;
        }
      } catch {
        // Output file doesn't exist → needs processing
        return true;
      }
    }

    // All outputs exist and are newer than source
    return false;
  } catch {
    // Can't stat source → let processImage handle the error
    return true;
  }
}

async function processImage(filename: string): Promise<ProcessResult> {
  const sourcePath = join(SOURCE_DIR, filename);
  const baseName = parse(filename).name;
  const result: ProcessResult = {
    source: filename,
    baseName,
    displayName: toDisplayName(baseName),
    outputs: [],
    originalSize: 0,
  };

  try {
    const fileStat = await stat(sourcePath);
    result.originalSize = fileStat.size;

    const image = sharp(sourcePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      result.error = 'Could not read image dimensions';
      return result;
    }

    console.log(
      `  Processing: ${filename} (${metadata.width}×${metadata.height})`,
    );

    for (const width of OUTPUT_WIDTHS) {
      // Skip sizes larger than original
      if (width > metadata.width) {
        console.log(
          `    Skipping ${width}w (larger than source ${metadata.width}w)`,
        );
        continue;
      }

      // Generate AVIF
      const avifName = `${baseName}-${width}w.avif`;
      const avifPath = join(OUTPUT_DIR, avifName);
      const avifInfo = await sharp(sourcePath)
        .resize(width, undefined, { withoutEnlargement: true })
        .avif(SHARP_AVIF_OPTIONS)
        .toFile(avifPath);

      result.outputs.push({
        file: avifName,
        size: avifInfo.size,
        format: 'avif',
        width,
      });

      // Generate WebP
      const webpName = `${baseName}-${width}w.webp`;
      const webpPath = join(OUTPUT_DIR, webpName);
      const webpInfo = await sharp(sourcePath)
        .resize(width, undefined, { withoutEnlargement: true })
        .webp(SHARP_WEBP_OPTIONS)
        .toFile(webpPath);

      result.outputs.push({
        file: webpName,
        size: webpInfo.size,
        format: 'webp',
        width,
      });
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return result;
}

/**
 * Generate the TypeScript manifest file that the app imports.
 * This is the single source of truth for which wallpapers exist.
 */
function generateManifest(results: ProcessResult[]): string {
  const successful = results.filter(r => !r.error);

  const entries = successful
    .map(r => {
      return `  {
    id: '${r.baseName}',
    name: '${r.displayName}',
    url: '/wallpapers/${r.baseName}-2560w.avif',
    urlWebp: '/wallpapers/${r.baseName}-2560w.webp',
  },`;
    })
    .join('\n');

  return `/**
 * AUTO-GENERATED — DO NOT EDIT MANUALLY
 *
 * Generated by: npm run images:process
 * Source: data/wallpapers-source/
 *
 * Each entry corresponds to a source image that was processed into
 * AVIF + WebP at 1920w, 2560w, and 3840w sizes in public/wallpapers/.
 * 
 * The 2560w size is served by default for optimal quality on modern displays.
 */

export interface GeneratedWallpaper {
  /** Unique ID derived from source filename (kebab-case) */
  id: string;
  /** Human-readable display name (auto-generated from filename) */
  name: string;
  /** Primary AVIF URL (2560w default size) */
  url: string;
  /** WebP fallback URL (2560w default size) */
  urlWebp: string;
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

/**
 * Remove output files from public/wallpapers/ that no longer have a
 * corresponding source image (e.g., the source was deleted).
 */
async function cleanOrphanedOutputs(
  sourceBaseNames: Set<string>,
): Promise<string[]> {
  const removed: string[] = [];

  try {
    const outputFiles = await readdir(OUTPUT_DIR);
    for (const file of outputFiles) {
      // Output files follow the pattern: {baseName}-{width}w.{ext}
      const match = file.match(/^(.+)-\d+w\.(avif|webp)$/);
      if (match) {
        const baseName = match[1];
        if (!sourceBaseNames.has(baseName)) {
          await unlink(join(OUTPUT_DIR, file));
          removed.push(file);
        }
      }
    }
  } catch {
    // Output dir might not exist yet — nothing to clean
  }

  return removed;
}

async function main() {
  console.log('🖼️  Wallpaper Image Processor');
  console.log('━'.repeat(50));

  if (forceReprocess) {
    console.log('⚡ Force mode: reprocessing all images\n');
  }

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  const sourceFiles = await getSourceImages();

  if (sourceFiles.length === 0) {
    console.log(`\n⚠️  No source images found in ${SOURCE_DIR}`);
    console.log('   Add images and run this script again.');
    // Still generate an empty manifest so the app compiles
    const emptyManifest = generateManifest([]);
    await writeFile(MANIFEST_PATH, emptyManifest, 'utf-8');
    console.log(`\n📝 Generated empty manifest: ${MANIFEST_PATH}`);
    return;
  }

  // Clean up orphaned outputs from removed source images
  const sourceBaseNames = new Set(sourceFiles.map(f => parse(f).name));
  const orphansRemoved = await cleanOrphanedOutputs(sourceBaseNames);
  if (orphansRemoved.length > 0) {
    console.log(`\n🧹 Cleaned ${orphansRemoved.length} orphaned output(s):`);
    for (const file of orphansRemoved) {
      console.log(`   × ${file}`);
    }
  }

  console.log(`\n📁 Found ${sourceFiles.length} source image(s)`);

  // Determine which images need processing
  const toProcess: string[] = [];
  const toSkip: string[] = [];

  for (const file of sourceFiles) {
    if (await needsProcessing(file)) {
      toProcess.push(file);
    } else {
      toSkip.push(file);
    }
  }

  if (toSkip.length > 0) {
    console.log(`   ⏭️  ${toSkip.length} already up-to-date (skipped)`);
  }
  if (toProcess.length > 0) {
    console.log(`   🔄 ${toProcess.length} to process\n`);
  } else {
    console.log(`\n✅ All images are up-to-date — nothing to process.`);
  }

  const results: ProcessResult[] = [];
  let totalOutputs = 0;
  let totalOutputSize = 0;
  let totalOriginalSize = 0;
  let errors = 0;

  // Process only images that need it
  for (const file of toProcess) {
    const result = await processImage(file);
    results.push(result);

    if (result.error) {
      console.error(`    ❌ Error: ${result.error}`);
      errors++;
    } else {
      totalOriginalSize += result.originalSize;
      for (const output of result.outputs) {
        totalOutputs++;
        totalOutputSize += output.size;
      }
    }
  }

  // Add skipped images as results (needed for manifest generation)
  for (const file of toSkip) {
    const baseName = parse(file).name;
    results.push({
      source: file,
      baseName,
      displayName: toDisplayName(baseName),
      outputs: [],
      originalSize: 0,
      skipped: true,
    });
  }

  // Sort results by baseName for deterministic manifest output
  results.sort((a, b) => a.baseName.localeCompare(b.baseName));

  // Generate manifest (always — includes all wallpapers)
  const manifest = generateManifest(results);
  await writeFile(MANIFEST_PATH, manifest, 'utf-8');

  // Print summary
  console.log('\n' + '━'.repeat(50));
  console.log('📊 Summary');
  console.log('━'.repeat(50));

  for (const result of results) {
    if (result.error) {
      console.log(`  ❌ ${result.source}: ${result.error}`);
      continue;
    }

    if (result.skipped) {
      console.log(`  ⏭️  ${result.source} (up-to-date)`);
      continue;
    }

    console.log(`  ✅ ${result.source} (${formatBytes(result.originalSize)})`);

    for (const output of result.outputs) {
      const ratio = ((output.size / result.originalSize) * 100).toFixed(1);
      console.log(
        `     → ${output.file}: ${formatBytes(output.size)} (${ratio}% of original)`,
      );
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log(`  Source images: ${sourceFiles.length}`);
  console.log(`  Processed: ${toProcess.length - errors}`);
  console.log(`  Skipped (up-to-date): ${toSkip.length}`);

  if (toProcess.length > 0) {
    console.log(`  Outputs generated: ${totalOutputs}`);
    console.log(`  Total source size: ${formatBytes(totalOriginalSize)}`);
    console.log(`  Total output size: ${formatBytes(totalOutputSize)}`);

    if (totalOriginalSize > 0) {
      const avgRatio = (
        (totalOutputSize / (totalOriginalSize * (totalOutputs / 2))) *
        100
      ).toFixed(1);
      console.log(`  Avg compression ratio: ~${avgRatio}%`);
    }
  }

  if (errors > 0) {
    console.log(`\n  ⚠️  ${errors} file(s) had errors`);
  }

  const successCount = results.filter(r => !r.error).length;
  console.log(`\n📝 Generated manifest: ${MANIFEST_PATH}`);
  console.log(
    `   → ${successCount} wallpaper(s) → ${successCount} Premium theme(s)`,
  );
  console.log('━'.repeat(50));
  console.log('\n✨ Done! Run `npm run dev` to see your Premium themes.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
