import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KANADOJO_ROOT = path.resolve(__dirname, '..');
const MONKEYTYPE_SOUND_ROOT = path.resolve(
  KANADOJO_ROOT,
  '..',
  'monkeytype',
  'frontend',
  'static',
  'sound',
);
const TARGET_ROOT = path.join(
  KANADOJO_ROOT,
  'public',
  'sounds',
  'monkeytype-pack',
);
const MANIFEST_PATH = path.join(TARGET_ROOT, 'manifest.json');

const fileBackedMap = [
  { id: '1', source: 'click1', slug: 'click', label: 'click' },
  { id: '2', source: 'click2', slug: 'beep', label: 'beep' },
  { id: '3', source: 'click3', slug: 'pop', label: 'pop' },
  { id: '4', source: 'click4', slug: 'nk-creams', label: 'nk creams' },
  { id: '5', source: 'click5', slug: 'typewriter', label: 'typewriter' },
  { id: '6', source: 'click6', slug: 'osu', label: 'osu' },
  { id: '7', source: 'click7', slug: 'hitmarker', label: 'hitmarker' },
  { id: '14', source: 'click14', slug: 'fist-fight', label: 'fist fight' },
  {
    id: '15',
    source: 'click15',
    slug: 'rubber-keys',
    label: 'rubber keys',
  },
  { id: '16', source: 'click16', slug: 'fart', label: 'fart' },
];

const monkeytypeSyntheticMap = [
  { id: '8', slug: 'sine', label: 'sine' },
  { id: '9', slug: 'sawtooth', label: 'sawtooth' },
  { id: '10', slug: 'square', label: 'square' },
  { id: '11', slug: 'triangle', label: 'triangle' },
  { id: '12', slug: 'pentatonic', label: 'pentatonic' },
  { id: '13', slug: 'wholetone', label: 'wholetone' },
];

const extraSyntheticMap = [
  { id: 'x17', slug: 'chaos-burst', label: 'chaos burst' },
  { id: 'x18', slug: 'reverse-suck', label: 'reverse suck' },
  { id: 'x19', slug: 'ringmod-zap', label: 'ringmod zap' },
  { id: 'x20', slug: 'granular-shatter', label: 'granular shatter' },
  { id: 'x21', slug: 'subdrop-thud', label: 'subdrop thud' },
  { id: 'x22', slug: 'silk-chime', label: 'silk chime' },
  { id: 'x23', slug: 'amber-pluck', label: 'amber pluck' },
  { id: 'x24', slug: 'velvet-tap', label: 'velvet tap' },
  { id: 'x25', slug: 'aqua-bloom', label: 'aqua bloom' },
  { id: 'x26', slug: 'luna-glint', label: 'luna glint' },
  { id: 'x27', slug: 'bamboo-whisper', label: 'bamboo whisper' },
  { id: 'x28', slug: 'ceramic-kiss', label: 'ceramic kiss' },
  { id: 'x29', slug: 'rain-glass', label: 'rain glass' },
  { id: 'x30', slug: 'satin-droplet', label: 'satin droplet' },
  { id: 'x31', slug: 'starlit-ting', label: 'starlit ting' },
];

const sampleRate = 44100;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function removeDirIfExists(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeWavMono16(filePath, samples, sampleRateHz = sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRateHz * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * 2;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  buffer.write('RIFF', offset);
  offset += 4;
  buffer.writeUInt32LE(36 + dataSize, offset);
  offset += 4;
  buffer.write('WAVE', offset);
  offset += 4;

  buffer.write('fmt ', offset);
  offset += 4;
  buffer.writeUInt32LE(16, offset);
  offset += 4;
  buffer.writeUInt16LE(1, offset);
  offset += 2;
  buffer.writeUInt16LE(numChannels, offset);
  offset += 2;
  buffer.writeUInt32LE(sampleRateHz, offset);
  offset += 4;
  buffer.writeUInt32LE(byteRate, offset);
  offset += 4;
  buffer.writeUInt16LE(blockAlign, offset);
  offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset);
  offset += 2;

  buffer.write('data', offset);
  offset += 4;
  buffer.writeUInt32LE(dataSize, offset);
  offset += 4;

  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(v * 32767), offset);
    offset += 2;
  }

  fs.writeFileSync(filePath, buffer);
}

function envelope(t, duration, attack = 0.003, releaseFactor = 0.42) {
  const release = Math.max(0.012, duration * releaseFactor);
  if (t < attack) return t / attack;
  if (t > duration - release) return Math.max(0, (duration - t) / release);
  return 1;
}

function waveformSample(type, phase) {
  const twoPi = Math.PI * 2;
  const wrapped = ((phase % twoPi) + twoPi) % twoPi;

  if (type === 'sine') return Math.sin(wrapped);
  if (type === 'sawtooth') return wrapped / Math.PI - 1;
  if (type === 'square') return wrapped < Math.PI ? 1 : -1;
  if (type === 'triangle') {
    return (
      1 -
      4 *
        Math.abs(Math.round(wrapped / (2 * Math.PI)) - wrapped / (2 * Math.PI))
    );
  }
  return Math.sin(wrapped);
}

function renderTone({
  freq,
  durationSec,
  wave = 'sine',
  amp = 0.5,
  attack = 0.003,
  releaseFactor = 0.42,
  pitchDrop = 0,
  fm = null,
}) {
  const total = Math.floor(sampleRate * durationSec);
  const out = new Float32Array(total);
  let phase = 0;

  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    const drop = pitchDrop > 0 ? 1 - pitchDrop * (t / durationSec) : 1;
    const baseFreq = freq * Math.max(0.2, drop);
    const baseInc = (2 * Math.PI * baseFreq) / sampleRate;

    let fmShift = 0;
    if (fm) {
      fmShift = Math.sin(2 * Math.PI * fm.freq * t) * fm.depth;
    }

    phase += baseInc;
    const value = waveformSample(wave, phase + fmShift);
    out[i] = value * envelope(t, durationSec, attack, releaseFactor) * amp;
  }

  return out;
}

function addNoise(samples, amount = 0.03) {
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() * 2 - 1) * amount;
  }
  return samples;
}

function lowPass(samples, cutoffHz = 6000) {
  const out = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);
  let prev = 0;
  for (let i = 0; i < samples.length; i++) {
    prev = prev + alpha * (samples[i] - prev);
    out[i] = prev;
  }
  return out;
}

function highPass(samples, cutoffHz = 2000) {
  const out = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);
  let prevOut = 0;
  let prevIn = samples[0] ?? 0;
  for (let i = 0; i < samples.length; i++) {
    out[i] = alpha * (prevOut + samples[i] - prevIn);
    prevOut = out[i];
    prevIn = samples[i];
  }
  return out;
}

function mix(buffers) {
  const maxLen = Math.max(...buffers.map(b => b.length));
  const out = new Float32Array(maxLen);
  buffers.forEach(buf => {
    for (let i = 0; i < buf.length; i++) {
      out[i] += buf[i];
    }
  });
  return out;
}

function normalize(samples, target = 0.86) {
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    max = Math.max(max, Math.abs(samples[i]));
  }
  if (max <= 0) return samples;
  const gain = target / max;
  for (let i = 0; i < samples.length; i++) {
    samples[i] *= gain;
  }
  return samples;
}

function concatenate(buffers) {
  const total = buffers.reduce((acc, b) => acc + b.length, 0);
  const out = new Float32Array(total);
  let cursor = 0;
  buffers.forEach(b => {
    out.set(b, cursor);
    cursor += b.length;
  });
  return out;
}

function silence(ms) {
  return new Float32Array(Math.floor((sampleRate * ms) / 1000));
}

function makeMonkeytypeSyntheticEntries() {
  const entries = [];
  const simpleFreqs = [220, 246.94, 261.63, 293.66, 329.63, 392, 440, 493.88, 523.25, 587.33];
  const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.26, 783.99];
  const wholetone = [261.63, 293.66, 329.63, 369.99, 415.3, 466.16, 523.25, 587.33];

  for (const map of monkeytypeSyntheticMap) {
    const targetDir = path.join(TARGET_ROOT, map.slug);
    ensureDir(targetDir);
    const variants = [];

    if (['sine', 'sawtooth', 'square', 'triangle'].includes(map.slug)) {
      for (let i = 0; i < simpleFreqs.length; i++) {
        const freq = simpleFreqs[i];
        const duration = 0.045 + (i % 3) * 0.008;
        const samples = renderTone({
          freq,
          durationSec: duration,
          wave: map.slug,
          amp: 0.48,
        });
        const fileName = `${map.slug}_${String(i + 1).padStart(2, '0')}.wav`;
        writeWavMono16(path.join(targetDir, fileName), samples);
        variants.push(fileName.replace(/\.wav$/i, ''));
      }
    } else {
      const scale = map.slug === 'pentatonic' ? pentatonic : wholetone;
      for (let i = 0; i < 8; i++) {
        const rotated = scale.slice(i).concat(scale.slice(0, i));
        const notes = rotated.slice(0, 6).map(freq =>
          renderTone({ freq, durationSec: 0.06, wave: 'sine', amp: 0.42 }),
        );
        const withGaps = [];
        notes.forEach(n => {
          withGaps.push(n);
          withGaps.push(silence(6));
        });
        const samples = concatenate(withGaps);
        const fileName = `${map.slug}_${String(i + 1).padStart(2, '0')}.wav`;
        writeWavMono16(path.join(targetDir, fileName), samples);
        variants.push(fileName.replace(/\.wav$/i, ''));
      }
    }

    entries.push({
      id: map.id,
      label: map.label,
      slug: map.slug,
      sourceType: 'synthetic-generated',
      monkeytypeSourceFolder: null,
      variants,
    });
  }

  return entries;
}

function synthByName(name, index) {
  const v = index + 1;

  if (name === 'pulse-soft') {
    const a = renderTone({ freq: 320 + v * 8, durationSec: 0.052, wave: 'square', amp: 0.3 });
    return normalize(lowPass(a, 2800));
  }

  if (name === 'fm-glass') {
    const a = renderTone({
      freq: 560 + v * 12,
      durationSec: 0.06,
      wave: 'sine',
      amp: 0.45,
      fm: { freq: 1120 + v * 10, depth: 2.2 },
    });
    return normalize(highPass(a, 1200));
  }

  if (name === 'analog-thock') {
    const body = renderTone({ freq: 170 + v * 3, durationSec: 0.085, wave: 'triangle', amp: 0.42, pitchDrop: 0.45 });
    const click = renderTone({ freq: 1800 + v * 20, durationSec: 0.012, wave: 'sine', amp: 0.16 });
    return normalize(lowPass(mix([body, click]), 2200));
  }

  if (name === 'bit-crunch') {
    const a = renderTone({ freq: 420 + v * 15, durationSec: 0.04, wave: 'square', amp: 0.45 });
    for (let i = 0; i < a.length; i += 3) {
      const hold = a[i];
      a[i + 1] = hold;
      if (i + 2 < a.length) a[i + 2] = hold;
    }
    return normalize(addNoise(a, 0.01));
  }

  if (name === 'woodblock') {
    const a = renderTone({ freq: 460 + v * 18, durationSec: 0.05, wave: 'triangle', amp: 0.4, pitchDrop: 0.25 });
    return normalize(highPass(a, 900));
  }

  if (name === 'marimba-mini') {
    const fundamental = renderTone({ freq: 330 + v * 6, durationSec: 0.08, wave: 'sine', amp: 0.35 });
    const overtone = renderTone({ freq: (330 + v * 6) * 2.9, durationSec: 0.055, wave: 'sine', amp: 0.18 });
    return normalize(mix([fundamental, overtone]));
  }

  if (name === 'kalimba-tine') {
    const detune = 1 + ((v % 3) - 1) * 0.008;
    const a = renderTone({ freq: (520 + v * 7) * detune, durationSec: 0.09, wave: 'triangle', amp: 0.34 });
    const b = renderTone({ freq: (520 + v * 7) * 2.01, durationSec: 0.06, wave: 'sine', amp: 0.12 });
    return normalize(mix([a, b]));
  }

  if (name === 'bubble-pop') {
    return normalize(
      renderTone({
        freq: 260 + v * 8,
        durationSec: 0.055,
        wave: 'sine',
        amp: 0.45,
        pitchDrop: -0.5,
      }),
    );
  }

  if (name === 'laser-pew-micro') {
    return normalize(
      renderTone({
        freq: 1200 + v * 35,
        durationSec: 0.05,
        wave: 'sawtooth',
        amp: 0.25,
        pitchDrop: 0.65,
      }),
    );
  }

  if (name === 'vinyl-tick') {
    const tick = renderTone({ freq: 2000 + v * 40, durationSec: 0.012, wave: 'square', amp: 0.12 });
    return normalize(highPass(addNoise(tick, 0.08), 3500));
  }

  if (name === 'hollow-clack') {
    const a = renderTone({ freq: 480 + v * 9, durationSec: 0.05, wave: 'sine', amp: 0.3 });
    const b = renderTone({ freq: 960 + v * 14, durationSec: 0.04, wave: 'triangle', amp: 0.2 });
    return normalize(highPass(mix([a, b]), 700));
  }

  if (name === 'zen-bell-short') {
    const f = 420 + v * 4;
    const a = renderTone({ freq: f, durationSec: 0.11, wave: 'sine', amp: 0.26, releaseFactor: 0.7 });
    const b = renderTone({ freq: f * 2.7, durationSec: 0.08, wave: 'sine', amp: 0.12, releaseFactor: 0.7 });
    return normalize(mix([a, b]));
  }

  if (name === 'typebar-metal') {
    const a = renderTone({ freq: 860 + v * 10, durationSec: 0.03, wave: 'square', amp: 0.2 });
    const b = renderTone({ freq: 420 + v * 6, durationSec: 0.06, wave: 'triangle', amp: 0.2 });
    return normalize(highPass(mix([a, b]), 1200));
  }

  if (name === 'spring-click') {
    const head = renderTone({ freq: 700 + v * 12, durationSec: 0.022, wave: 'square', amp: 0.2 });
    const tail1 = renderTone({ freq: 280 + v * 6, durationSec: 0.08, wave: 'sine', amp: 0.22, releaseFactor: 0.85 });
    const tail2 = renderTone({ freq: 340 + v * 6, durationSec: 0.075, wave: 'sine', amp: 0.16, releaseFactor: 0.8 });
    return normalize(mix([head, tail1, tail2]));
  }

  if (name === 'heartbeat-tap') {
    const beat1 = renderTone({ freq: 170 + v * 2, durationSec: 0.035, wave: 'triangle', amp: 0.35 });
    const beat2 = renderTone({ freq: 150 + v * 2, durationSec: 0.038, wave: 'triangle', amp: 0.26 });
    return normalize(concatenate([beat1, silence(24), beat2]));
  }

  if (name === 'glitch-blip') {
    const parts = [];
    for (let i = 0; i < 3; i++) {
      parts.push(
        renderTone({
          freq: 900 + v * 28 + i * 190,
          durationSec: 0.012,
          wave: i % 2 ? 'square' : 'sawtooth',
          amp: 0.2,
        }),
      );
      parts.push(silence(4));
    }
    return normalize(highPass(addNoise(concatenate(parts), 0.015), 1400));
  }

  if (name === 'chaos-burst') {
    const durationSec = 0.065;
    const total = Math.floor(sampleRate * durationSec);
    const out = new Float32Array(total);
    let x = 0.23 + v * 0.011;
    const r = 3.84 + (v % 4) * 0.03;
    for (let i = 0; i < total; i++) {
      x = r * x * (1 - x);
      const t = i / sampleRate;
      const amp = envelope(t, durationSec, 0.001, 0.35);
      out[i] = (x * 2 - 1) * amp * 0.6;
    }
    return normalize(highPass(out, 900));
  }

  if (name === 'reverse-suck') {
    const durationSec = 0.095;
    const total = Math.floor(sampleRate * durationSec);
    const out = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const t = i / sampleRate;
      const prog = i / (total - 1);
      const freq = 180 + prog * (2000 + v * 25);
      const phase = 2 * Math.PI * freq * t;
      const reverseEnv = Math.pow(prog, 2.2);
      out[i] = Math.sin(phase) * reverseEnv * 0.45;
    }
    return normalize(highPass(out, 350));
  }

  if (name === 'ringmod-zap') {
    const carrier = renderTone({
      freq: 420 + v * 30,
      durationSec: 0.07,
      wave: 'sine',
      amp: 0.55,
      pitchDrop: 0.2,
    });
    const total = carrier.length;
    const out = new Float32Array(total);
    const modFreq = 75 + v * 8;
    for (let i = 0; i < total; i++) {
      const t = i / sampleRate;
      const mod = Math.sin(2 * Math.PI * modFreq * t);
      out[i] = carrier[i] * mod;
    }
    return normalize(highPass(out, 800));
  }

  if (name === 'granular-shatter') {
    const durationSec = 0.09;
    const total = Math.floor(sampleRate * durationSec);
    const out = new Float32Array(total);
    const grains = 13 + (v % 4);
    for (let g = 0; g < grains; g++) {
      const start = Math.floor(((g + 1) / (grains + 2)) * total);
      const grainLen = Math.floor(sampleRate * (0.003 + ((g + v) % 3) * 0.002));
      const f = 700 + g * 230 + v * 15;
      for (let i = 0; i < grainLen; i++) {
        const idx = start + i;
        if (idx >= total) break;
        const localT = i / sampleRate;
        const localEnv = 1 - i / grainLen;
        out[idx] += Math.sin(2 * Math.PI * f * localT) * localEnv * 0.2;
      }
    }
    return normalize(highPass(addNoise(out, 0.02), 1300));
  }

  if (name === 'subdrop-thud') {
    const durationSec = 0.12;
    const total = Math.floor(sampleRate * durationSec);
    const out = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const t = i / sampleRate;
      const prog = i / (total - 1);
      const freq = 140 - prog * (105 + v * 1.2);
      const phase = 2 * Math.PI * Math.max(22, freq) * t;
      const env = Math.exp(-9.2 * prog);
      out[i] = Math.sin(phase) * env * 0.8;
    }
    return normalize(lowPass(out, 280));
  }

  if (name === 'silk-chime') {
    const f = 640 + v * 6;
    const a = renderTone({
      freq: f,
      durationSec: 0.11,
      wave: 'sine',
      amp: 0.24,
      attack: 0.004,
      releaseFactor: 0.72,
    });
    const b = renderTone({
      freq: f * 2.01,
      durationSec: 0.09,
      wave: 'sine',
      amp: 0.1,
      attack: 0.003,
      releaseFactor: 0.7,
    });
    return normalize(lowPass(mix([a, b]), 4200));
  }

  if (name === 'amber-pluck') {
    const f = 300 + v * 4;
    const a = renderTone({
      freq: f,
      durationSec: 0.085,
      wave: 'triangle',
      amp: 0.32,
      attack: 0.0025,
      releaseFactor: 0.58,
    });
    const b = renderTone({
      freq: f * 2.5,
      durationSec: 0.055,
      wave: 'sine',
      amp: 0.12,
      attack: 0.002,
      releaseFactor: 0.52,
    });
    return normalize(lowPass(mix([a, b]), 3600));
  }

  if (name === 'velvet-tap') {
    const body = renderTone({
      freq: 210 + v * 3,
      durationSec: 0.075,
      wave: 'sine',
      amp: 0.3,
      attack: 0.0035,
      releaseFactor: 0.6,
      pitchDrop: 0.2,
    });
    const tick = renderTone({
      freq: 1200 + v * 10,
      durationSec: 0.012,
      wave: 'sine',
      amp: 0.06,
      attack: 0.0015,
      releaseFactor: 0.5,
    });
    return normalize(lowPass(mix([body, tick]), 2400));
  }

  if (name === 'aqua-bloom') {
    const a = renderTone({
      freq: 260 + v * 5,
      durationSec: 0.095,
      wave: 'sine',
      amp: 0.26,
      attack: 0.004,
      releaseFactor: 0.76,
      pitchDrop: -0.22,
    });
    const b = renderTone({
      freq: 390 + v * 4,
      durationSec: 0.07,
      wave: 'triangle',
      amp: 0.1,
      attack: 0.003,
      releaseFactor: 0.7,
    });
    return normalize(lowPass(mix([a, b]), 3100));
  }

  if (name === 'luna-glint') {
    const f = 520 + v * 7;
    const a = renderTone({
      freq: f,
      durationSec: 0.08,
      wave: 'sine',
      amp: 0.2,
      attack: 0.003,
      releaseFactor: 0.66,
    });
    const b = renderTone({
      freq: f * 3.12,
      durationSec: 0.05,
      wave: 'sine',
      amp: 0.08,
      attack: 0.002,
      releaseFactor: 0.62,
    });
    const c = renderTone({
      freq: f * 1.5,
      durationSec: 0.04,
      wave: 'triangle',
      amp: 0.07,
      attack: 0.002,
      releaseFactor: 0.6,
    });
    return normalize(lowPass(mix([a, b, c]), 5000));
  }

  if (name === 'bamboo-whisper') {
    const base = 230 + v * 2.6;
    const body = renderTone({
      freq: base,
      durationSec: 0.085,
      wave: 'triangle',
      amp: 0.22,
      attack: 0.0035,
      releaseFactor: 0.76,
      pitchDrop: 0.28,
    });
    const grain = renderTone({
      freq: base * 4.8,
      durationSec: 0.02,
      wave: 'sine',
      amp: 0.04,
      attack: 0.0015,
      releaseFactor: 0.45,
    });
    return normalize(lowPass(mix([body, grain]), 2200));
  }

  if (name === 'ceramic-kiss') {
    const f = 710 + v * 6.5;
    const ping = renderTone({
      freq: f,
      durationSec: 0.078,
      wave: 'sine',
      amp: 0.2,
      attack: 0.002,
      releaseFactor: 0.75,
    });
    const overtone = renderTone({
      freq: f * 2.92,
      durationSec: 0.055,
      wave: 'sine',
      amp: 0.085,
      attack: 0.0016,
      releaseFactor: 0.72,
    });
    return normalize(lowPass(mix([ping, overtone]), 4100));
  }

  if (name === 'rain-glass') {
    const f = 520 + v * 5.1;
    const dropletA = renderTone({
      freq: f,
      durationSec: 0.034,
      wave: 'sine',
      amp: 0.17,
      attack: 0.0018,
      releaseFactor: 0.66,
    });
    const dropletB = renderTone({
      freq: f * 1.33,
      durationSec: 0.03,
      wave: 'sine',
      amp: 0.11,
      attack: 0.0015,
      releaseFactor: 0.62,
    });
    const tail = renderTone({
      freq: 260 + v * 2.7,
      durationSec: 0.06,
      wave: 'triangle',
      amp: 0.08,
      attack: 0.003,
      releaseFactor: 0.78,
    });
    return normalize(lowPass(concatenate([mix([dropletA, dropletB]), tail]), 3200));
  }

  if (name === 'satin-droplet') {
    const f = 285 + v * 3.4;
    const bloom = renderTone({
      freq: f,
      durationSec: 0.092,
      wave: 'sine',
      amp: 0.22,
      attack: 0.004,
      releaseFactor: 0.82,
      pitchDrop: -0.2,
    });
    const sheen = renderTone({
      freq: f * 2.36,
      durationSec: 0.05,
      wave: 'triangle',
      amp: 0.06,
      attack: 0.002,
      releaseFactor: 0.7,
    });
    return normalize(lowPass(mix([bloom, sheen]), 3000));
  }

  if (name === 'starlit-ting') {
    const f = 840 + v * 7.2;
    const core = renderTone({
      freq: f,
      durationSec: 0.07,
      wave: 'sine',
      amp: 0.18,
      attack: 0.0018,
      releaseFactor: 0.7,
    });
    const shimmer1 = renderTone({
      freq: f * 2.04,
      durationSec: 0.046,
      wave: 'sine',
      amp: 0.075,
      attack: 0.0015,
      releaseFactor: 0.64,
    });
    const shimmer2 = renderTone({
      freq: f * 3.05,
      durationSec: 0.033,
      wave: 'sine',
      amp: 0.045,
      attack: 0.0012,
      releaseFactor: 0.58,
    });
    return normalize(lowPass(mix([core, shimmer1, shimmer2]), 5200));
  }

  return renderTone({ freq: 440, durationSec: 0.05, wave: 'sine', amp: 0.3 });
}

function makeExtraSyntheticEntries() {
  const entries = [];
  for (const map of extraSyntheticMap) {
    const targetDir = path.join(TARGET_ROOT, map.slug);
    ensureDir(targetDir);

    const variants = [];
    for (let i = 0; i < 10; i++) {
      const samples = synthByName(map.slug, i);
      const fileName = `${map.slug}_${String(i + 1).padStart(2, '0')}.wav`;
      writeWavMono16(path.join(targetDir, fileName), samples);
      variants.push(fileName.replace(/\.wav$/i, ''));
    }

    entries.push({
      id: map.id,
      label: map.label,
      slug: map.slug,
      sourceType: 'synthetic-generated',
      monkeytypeSourceFolder: null,
      variants,
    });
  }
  return entries;
}

function copyFileBacked() {
  const entries = [];

  for (const map of fileBackedMap) {
    const sourceDir = path.join(MONKEYTYPE_SOUND_ROOT, map.source);
    const targetDir = path.join(TARGET_ROOT, map.slug);
    ensureDir(targetDir);

    const files = fs
      .readdirSync(sourceDir)
      .filter(name => name.toLowerCase().endsWith('.wav'))
      .sort((a, b) => a.localeCompare(b, 'en'));

    files.forEach(name => {
      fs.copyFileSync(path.join(sourceDir, name), path.join(targetDir, name));
    });

    entries.push({
      id: map.id,
      label: map.label,
      slug: map.slug,
      sourceType: 'file',
      monkeytypeSourceFolder: map.source,
      variants: files.map(name => name.replace(/\.wav$/i, '')),
    });
  }

  return entries;
}

function main() {
  if (!fs.existsSync(MONKEYTYPE_SOUND_ROOT)) {
    throw new Error(
      `Monkeytype sound directory not found: ${MONKEYTYPE_SOUND_ROOT}`,
    );
  }

  removeDirIfExists(TARGET_ROOT);
  ensureDir(TARGET_ROOT);

  const fileBacked = copyFileBacked();
  const monkeytypeSynthetic = makeMonkeytypeSyntheticEntries();
  const extraSynthetic = makeExtraSyntheticEntries();

  const order = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    'x17',
    'x18',
    'x19',
    'x20',
    'x21',
    'x22',
    'x23',
    'x24',
    'x25',
    'x26',
    'x27',
    'x28',
    'x29',
    'x30',
    'x31',
  ];
  const all = [...fileBacked, ...monkeytypeSynthetic, ...extraSynthetic].sort(
    (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
  );

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: {
      monkeytypeSoundRoot: MONKEYTYPE_SOUND_ROOT,
      notes: 'Names follow Monkeytype click sound labels plus KanaDojo synthetic expansion pack.',
    },
    sounds: all,
  };

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const summary = all.map(
    s => `${s.id.padStart(3, '0')} ${s.label}: ${s.variants.length} variants (${s.sourceType})`,
  );
  console.warn('Created monkeytype sound pack at:', TARGET_ROOT);
  summary.forEach(line => console.warn(line));
}

main();
