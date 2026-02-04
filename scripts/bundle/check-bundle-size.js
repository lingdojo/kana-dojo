#!/usr/bin/env node
/**
 * Lightweight bundle size check.
 * - Scans .next/static/chunks for JS bundles.
 * - If build output doesn't exist, exits 0 with guidance.
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const chunksDir = path.join(projectRoot, '.next', 'static', 'chunks');

const maxTotalKb = Number(process.env.BUNDLE_TOTAL_KB || 0);
const maxChunkKb = Number(process.env.BUNDLE_MAX_CHUNK_KB || 0);

if (!fs.existsSync(chunksDir)) {
  console.log('ℹ️  .next/static/chunks not found. Run `npm run build` first.');
  process.exit(0);
}

function getAllFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return getAllFiles(fullPath);
    if (!entry.name.endsWith('.js')) return [];
    return [fullPath];
  });
}

const files = getAllFiles(chunksDir);
let totalBytes = 0;
let maxChunk = { file: '', bytes: 0 };

for (const file of files) {
  const stats = fs.statSync(file);
  totalBytes += stats.size;
  if (stats.size > maxChunk.bytes) {
    maxChunk = { file, bytes: stats.size };
  }
}

const totalKb = Math.round(totalBytes / 1024);
const maxChunkKbActual = Math.round(maxChunk.bytes / 1024);

console.log(`Total JS chunk size: ${totalKb} KB`);
console.log(`Largest chunk: ${maxChunkKbActual} KB (${path.relative(projectRoot, maxChunk.file)})`);

if (maxTotalKb > 0 && totalKb > maxTotalKb) {
  console.error(`❌ Total JS size exceeds limit: ${totalKb} KB > ${maxTotalKb} KB`);
  process.exit(1);
}

if (maxChunkKb > 0 && maxChunkKbActual > maxChunkKb) {
  console.error(`❌ Largest chunk exceeds limit: ${maxChunkKbActual} KB > ${maxChunkKb} KB`);
  process.exit(1);
}

console.log('✅ Bundle size check passed');
