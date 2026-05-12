import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PACK_ROOT = path.join(ROOT, 'public', 'sounds', 'monkeytype-pack');
const MANIFEST_PATH = path.join(PACK_ROOT, 'manifest.json');

function readWav16Mono(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`Invalid WAV: ${filePath}`);
  }

  let offset = 12;
  let sampleRate = 44100;
  let channels = 1;
  let bitsPerSample = 16;
  let dataStart = -1;
  let dataSize = 0;

  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const body = offset + 8;

    if (id === 'fmt ') {
      channels = buf.readUInt16LE(body + 2);
      sampleRate = buf.readUInt32LE(body + 4);
      bitsPerSample = buf.readUInt16LE(body + 14);
    } else if (id === 'data') {
      dataStart = body;
      dataSize = size;
      break;
    }

    offset = body + size + (size % 2);
  }

  if (dataStart < 0) throw new Error(`No data chunk: ${filePath}`);
  if (bitsPerSample !== 16) throw new Error(`Unsupported bit depth (${bitsPerSample}) in ${filePath}`);

  const frameCount = Math.floor(dataSize / (bitsPerSample / 8) / channels);
  const out = new Float32Array(frameCount);

  for (let i = 0; i < frameCount; i++) {
    const base = dataStart + i * channels * 2;
    let sum = 0;
    for (let c = 0; c < channels; c++) {
      const v = buf.readInt16LE(base + c * 2) / 32768;
      sum += v;
    }
    out[i] = sum / channels;
  }

  return { sampleRate, samples: out };
}

function naiveSpectrum(samples, sampleRate, fftSize = 512, frames = 8) {
  const mags = new Float64Array(fftSize / 2);
  const hop = Math.max(1, Math.floor((samples.length - fftSize) / Math.max(1, frames - 1)));
  let used = 0;

  for (let f = 0; f < frames; f++) {
    const start = f * hop;
    if (start + fftSize > samples.length) break;
    used++;

    for (let k = 0; k < fftSize / 2; k++) {
      let re = 0;
      let im = 0;
      for (let n = 0; n < fftSize; n++) {
        const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (fftSize - 1));
        const x = samples[start + n] * w;
        const a = (2 * Math.PI * k * n) / fftSize;
        re += x * Math.cos(a);
        im -= x * Math.sin(a);
      }
      mags[k] += Math.sqrt(re * re + im * im);
    }
  }

  if (used > 0) {
    for (let i = 0; i < mags.length; i++) mags[i] /= used;
  }

  const binHz = sampleRate / fftSize;
  return { mags, binHz };
}

function extractFeatures(samples, sampleRate) {
  const n = samples.length;
  const duration = n / sampleRate;

  let sumSq = 0;
  let sumAbs = 0;
  let peak = 0;
  let zc = 0;

  for (let i = 0; i < n; i++) {
    const x = samples[i];
    sumSq += x * x;
    sumAbs += Math.abs(x);
    peak = Math.max(peak, Math.abs(x));
    if (i > 0) {
      const p = samples[i - 1];
      if ((x >= 0 && p < 0) || (x < 0 && p >= 0)) zc++;
    }
  }

  const rms = Math.sqrt(sumSq / Math.max(1, n));
  const zcr = zc / Math.max(1, n - 1);

  const { mags, binHz } = naiveSpectrum(samples, sampleRate);
  let magSum = 0;
  let weighted = 0;
  let maxMag = 0;

  for (let i = 0; i < mags.length; i++) {
    const m = mags[i];
    magSum += m;
    weighted += m * (i * binHz);
    maxMag = Math.max(maxMag, m);
  }

  const centroid = magSum > 0 ? weighted / magSum : 0;

  let bwNum = 0;
  for (let i = 0; i < mags.length; i++) {
    const freq = i * binHz;
    const d = freq - centroid;
    bwNum += mags[i] * d * d;
  }
  const bandwidth = magSum > 0 ? Math.sqrt(bwNum / magSum) : 0;

  const rollTarget = magSum * 0.85;
  let acc = 0;
  let rolloff = 0;
  for (let i = 0; i < mags.length; i++) {
    acc += mags[i];
    if (acc >= rollTarget) {
      rolloff = i * binHz;
      break;
    }
  }

  let gsum = 0;
  let lsum = 0;
  const eps = 1e-12;
  for (let i = 0; i < mags.length; i++) {
    const m = Math.max(eps, mags[i]);
    gsum += Math.log(m);
    lsum += m;
  }
  const flatness = Math.exp(gsum / mags.length) / (lsum / mags.length);

  const target = rms * 0.8;
  let attackIdx = n - 1;
  let env = 0;
  const envAlpha = 0.02;
  for (let i = 0; i < n; i++) {
    env = env + envAlpha * (Math.abs(samples[i]) - env);
    if (env >= target) {
      attackIdx = i;
      break;
    }
  }
  const attackSec = attackIdx / sampleRate;

  return {
    duration,
    rms,
    absMean: sumAbs / Math.max(1, n),
    peak,
    crest: peak / Math.max(1e-6, rms),
    zcr,
    centroid,
    bandwidth,
    rolloff,
    flatness,
    attackSec,
  };
}

function meanVectors(vectors) {
  const out = {};
  const keys = Object.keys(vectors[0]);
  for (const k of keys) {
    out[k] = vectors.reduce((a, v) => a + v[k], 0) / vectors.length;
  }
  return out;
}

function zNormalize(rows) {
  const keys = Object.keys(rows[0].features);
  const stats = {};

  for (const k of keys) {
    const vals = rows.map(r => r.features[k]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const varr = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
    const std = Math.sqrt(varr) || 1;
    stats[k] = { mean, std };
  }

  for (const row of rows) {
    row.vec = keys.map(k => (row.features[k] - stats[k].mean) / stats[k].std);
  }
}

function cosineDistance(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return 1 - dot / denom;
}

function unionFind(n) {
  const p = Array.from({ length: n }, (_, i) => i);
  const find = x => {
    while (p[x] !== x) {
      p[x] = p[p[x]];
      x = p[x];
    }
    return x;
  };
  const unite = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) p[rb] = ra;
  };
  return { find, unite };
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const synthetic = manifest.sounds.filter(s => /^x/.test(s.id));

  const rows = synthetic.map(sound => {
    const dir = path.join(PACK_ROOT, sound.slug);
    const wavs = fs.readdirSync(dir).filter(f => f.endsWith('.wav')).sort();
    const featureList = wavs.map(w => {
      const { sampleRate, samples } = readWav16Mono(path.join(dir, w));
      return extractFeatures(samples, sampleRate);
    });

    return {
      id: sound.id,
      slug: sound.slug,
      label: sound.label,
      features: meanVectors(featureList),
      vec: [],
    };
  });

  zNormalize(rows);

  const n = rows.length;
  const dmat = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = cosineDistance(rows[i].vec, rows[j].vec);
      dmat[i][j] = d;
      dmat[j][i] = d;
    }
  }

  // aggressive duplicate threshold (overestimates duplicates)
  const DUP_THRESHOLD = 0.36;
  const uf = unionFind(n);
  const dupPairs = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (dmat[i][j] < DUP_THRESHOLD) {
        uf.unite(i, j);
        dupPairs.push({ a: rows[i].slug, b: rows[j].slug, d: dmat[i][j] });
      }
    }
  }

  const groups = new Map();
  for (let i = 0; i < n; i++) {
    const r = uf.find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(i);
  }

  const keep = [];
  const remove = [];

  for (const idxs of groups.values()) {
    if (idxs.length === 1) {
      keep.push(rows[idxs[0]].slug);
      continue;
    }

    // keep the member with highest avg distance to others in cluster
    let best = idxs[0];
    let bestScore = -Infinity;
    for (const i of idxs) {
      let s = 0;
      for (const j of idxs) if (i !== j) s += dmat[i][j];
      const avg = s / (idxs.length - 1);
      if (avg > bestScore) {
        bestScore = avg;
        best = i;
      }
    }

    keep.push(rows[best].slug);
    for (const i of idxs) {
      if (i !== best) remove.push(rows[i].slug);
    }
  }

  keep.sort();
  remove.sort();
  dupPairs.sort((x, y) => x.d - y.d);

  const report = {
    threshold: DUP_THRESHOLD,
    syntheticCount: rows.length,
    duplicatePairs: dupPairs,
    keep,
    remove,
  };

  const outPath = path.join(ROOT, 'scripts', 'synthetic-uniqueness-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.warn('Synthetic uniqueness report written:', outPath);
  console.warn('Keep:', keep.join(', '));
  console.warn('Remove:', remove.join(', '));
}

main();
