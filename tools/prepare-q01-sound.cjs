'use strict';
// Deterministic physical-modeled procedural acoustic assets [H] for Q01.
// Upgrades harbor, workshop, mechanism and nocturnal assets at 22050 Hz mono PCM
// while preserving the exact WAV format, file IDs, peak/energy bounds and ledger schema.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), outDir = path.join(root, 'assets/audio/q01');
fs.mkdirSync(outDir, { recursive: true });
const SR = 22050, TAU = Math.PI * 2;
const clamp = (x, a = -1, b = 1) => Math.max(a, Math.min(b, x));

function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function makeBuf(seconds) { return new Float32Array(Math.round(seconds * SR)); }

function lowpass(src, cutoff) {
  const out = new Float32Array(src.length), a = clamp(1 - Math.exp(-TAU * cutoff / SR), 0.001, 0.99);
  let y = 0;
  for (let i = 0; i < src.length; i++) { y += (src[i] - y) * a; out[i] = y; }
  return out;
}

function bandpass(src, centerHz, q = 2.0) {
  const out = new Float32Array(src.length);
  const w0 = TAU * Math.min(centerHz, SR * 0.45) / SR;
  const alpha = Math.sin(w0) / (2 * Math.max(0.3, q)), cosw = Math.cos(w0);
  const b0 = alpha, b1 = 0, b2 = -alpha, a0 = 1 + alpha, a1 = -2 * cosw, a2 = 1 - alpha;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < src.length; i++) {
    const x0 = src[i];
    const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0; out[i] = y0;
  }
  return out;
}

function roomTail(buf, wet = 0.22, taps = [[0.017, 0.45], [0.031, 0.34], [0.053, 0.25], [0.089, 0.17], [0.137, 0.10]]) {
  const out = new Float32Array(buf);
  for (const [sec, gain] of taps) {
    const d = Math.round(sec * SR);
    for (let i = d; i < out.length; i++) out[i] += buf[i - d] * gain * wet;
  }
  return lowpass(out, 6800).map((v, i) => out[i] * 0.65 + v * 0.35);
}

// Seamless loop renderer: synthesizes extra fade tail and crossfades head/tail smoothly.
function renderLoop(seconds, fadeSec, build) {
  const len = Math.round(seconds * SR), pad = Math.round(fadeSec * SR);
  const raw = build(len + pad);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    if (i < pad) {
      const k = 0.5 - 0.5 * Math.cos(Math.PI * i / pad);
      out[i] = raw[i] * k + raw[len + i] * (1 - k);
    } else {
      out[i] = raw[i];
    }
  }
  return out;
}

// Physical-modeled Karplus-Strong plucked string with cedar soundbox warmth.
function pluckString(buf, startSec, freq, amp, decay = 0.9965, brightness = 0.42, rand) {
  const start = Math.round(startSec * SR), delayLen = Math.max(8, Math.round(SR / freq));
  const ring = new Float32Array(delayLen);
  let lastNoise = 0;
  for (let i = 0; i < delayLen; i++) {
    const pick = Math.sin(Math.PI * (i + 0.5) / delayLen);
    const r = (rand() * 2 - 1) * 0.7 + lastNoise * 0.3; lastNoise = r;
    ring[i] = r * (0.45 + 0.55 * pick);
  }
  let ptr = 0, prev = 0, bodyLp = 0;
  for (let n = 0; n < Math.round(4.6 * SR) && start + n < buf.length; n++) {
    const cur = ring[ptr], next = ring[(ptr + 1) % delayLen];
    const filtered = (cur * (1 - brightness * 0.5) + next * (brightness * 0.5) + prev * 0.12) * (1 / 1.12) * decay;
    prev = cur; ring[ptr] = filtered; ptr = (ptr + 1) % delayLen;
    bodyLp += (cur - bodyLp) * 0.08;
    const env = Math.min(1, n / 120) * Math.exp(-n / (SR * 2.8));
    buf[start + n] += (cur * 0.72 + bodyLp * 0.48) * amp * env;
  }
}

function writeWav(id, samples, targetPeak = 0.65, notes = '') {
  // Remove DC offset before limiting so low-frequency waves never drift.
  let mean = 0;
  for (let i = 0; i < samples.length; i++) mean += samples[i];
  mean /= Math.max(1, samples.length);
  let rawPeak = 0, energy = 0;
  const shaped = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.tanh((samples[i] - mean) * 1.15);
    shaped[i] = v;
    rawPeak = Math.max(rawPeak, Math.abs(v));
  }
  const norm = rawPeak > 1e-6 ? Math.min(0.84, targetPeak) / rawPeak : 1;
  const pcm = Buffer.alloc(44 + shaped.length * 2);
  pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + shaped.length * 2, 4);
  pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16);
  pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
  pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28);
  pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34);
  pcm.write('data', 36); pcm.writeUInt32LE(shaped.length * 2, 40);
  let sumSq = 0, peak = 0;
  for (let i = 0; i < shaped.length; i++) {
    const v = clamp(shaped[i] * norm, -0.88, 0.88);
    sumSq += v * v; peak = Math.max(peak, Math.abs(v));
    pcm.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  const rel = 'assets/audio/q01/' + id + '.wav';
  fs.writeFileSync(path.join(root, rel), pcm);
  return {
    id, file: rel, bytes: pcm.length, durationSeconds: +(shaped.length / SR).toFixed(3),
    rms: +Math.sqrt(sumSq / shaped.length).toFixed(4), peak: +peak.toFixed(4),
    energy: +sumSq.toFixed(2), notes,
    sha256: crypto.createHash('sha256').update(pcm).digest('hex')
  };
}

function buildHarbor() {
  const rand = rng(101);
  return renderLoop(12.0, 1.5, n => {
    const pink = new Float32Array(n), surf = new Float32Array(n);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0;
    for (let i = 0; i < n; i++) {
      const w = rand() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.052;
      b2 = 0.94 * b2 + w * 0.11; b3 = 0.80 * b3 + w * 0.18; b4 = 0.52 * b4 + w * 0.25;
      pink[i] = b0 + b1 + b2 + b3 + b4;
    }
    const deep = lowpass(pink, 185), foam = bandpass(pink, 620, 0.65), shingle = bandpass(pink, 1450, 1.1);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const swell1 = 0.5 + 0.5 * Math.sin(TAU * (t / 6.0) + 0.35 * Math.sin(TAU * t / 12.0));
      const swell2 = 0.5 + 0.5 * Math.sin(TAU * (t / 3.75) + 1.4);
      const lap = Math.pow(Math.max(0, Math.sin(TAU * (t / 2.4) + 0.8)), 3);
      surf[i] = deep[i] * (0.28 + 0.48 * swell1) + foam[i] * (0.14 + 0.32 * swell1 * swell2) + shingle[i] * (0.04 + 0.18 * lap);
    }
    // Gentle moored wooden hull & dock fender rubbing against quay masonry
    for (const at of [1.8, 5.1, 8.9, 11.4]) {
      const start = Math.round(at * SR);
      const pitch = 92 + (rand() - 0.5) * 18;
      for (let j = 0; j < Math.round(0.32 * SR) && start + j < n; j++) {
        const u = j / (0.32 * SR), env = Math.sin(Math.PI * u) * Math.exp(-u * 2.4);
        const stick = Math.sin(TAU * pitch * (j / SR) * (1 + 0.12 * Math.sin(TAU * 9 * u)))
          + 0.45 * Math.sin(TAU * pitch * 2.04 * (j / SR));
        surf[start + j] += stick * env * 0.042;
      }
    }
    return surf;
  });
}

function buildWind() {
  const rand = rng(202);
  return renderLoop(10.0, 1.4, n => {
    const raw = new Float32Array(n), out = new Float32Array(n);
    for (let i = 0; i < n; i++) raw[i] = rand() * 2 - 1;
    const lowBed = lowpass(raw, 190), wallDraftA = bandpass(raw, 310, 2.2), wallDraftB = bandpass(raw, 520, 2.8), airShimmer = bandpass(raw, 1150, 1.4);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const g1 = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(TAU * t / 5.0 + 0.5 * Math.sin(TAU * t / 10.0)));
      const g2 = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(TAU * t / 3.33 + 1.8));
      out[i] = lowBed[i] * (0.36 + 0.25 * g1) + wallDraftA[i] * (0.14 + 0.22 * g1)
        + wallDraftB[i] * (0.09 + 0.16 * g2) + airShimmer[i] * (0.04 + 0.08 * g1 * g2);
    }
    return out;
  });
}

function buildFire() {
  const rand = rng(303);
  return renderLoop(8.0, 1.0, n => {
    const raw = new Float32Array(n), crackle = new Float32Array(n), out = new Float32Array(n);
    let brown = 0;
    for (let i = 0; i < n; i++) {
      const w = rand() * 2 - 1;
      brown = 0.992 * brown + w * 0.06;
      raw[i] = brown;
      if (rand() < 0.0022) {
        const amp = 0.3 + rand() * 0.7;
        for (let k = 0; k < 28 && i + k < n; k++) crackle[i + k] += (rand() * 2 - 1) * amp * Math.exp(-k * 0.26);
      }
    }
    const roar = lowpass(raw, 230), tongue = bandpass(raw, 540, 0.9), snapBody = bandpass(crackle, 1380, 1.6), snapHi = bandpass(crackle, 3400, 1.2);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const flicker = 0.65 + 0.35 * Math.sin(TAU * t * 1.37 + 0.8 * Math.sin(TAU * t * 0.62));
      out[i] = roar[i] * (0.65 + 0.35 * flicker) + tongue[i] * 0.42 * flicker + snapBody[i] * 0.55 + snapHi[i] * 0.38;
    }
    return out;
  });
}

function buildQuietScore() {
  const rand = rng(404);
  return renderLoop(16.0, 1.8, n => {
    const buf = new Float32Array(n);
    // Phrygian / Aeolian midnight contemplation (A2, D3, E3, A3, Bb3, C4, D4, E4)
    const events = [
      [0.15, 110.0, 0.44, 0.9978, 0.30], [0.22, 220.0, 0.28, 0.9970, 0.35],
      [1.35, 329.63, 0.32, 0.9968, 0.38], [2.45, 293.66, 0.30, 0.9968, 0.34],
      [4.10, 146.83, 0.40, 0.9976, 0.30], [4.18, 261.63, 0.28, 0.9970, 0.36],
      [5.55, 233.08, 0.31, 0.9968, 0.32], [6.85, 220.00, 0.32, 0.9972, 0.34],
      [8.20, 110.0, 0.42, 0.9978, 0.28], [8.30, 164.81, 0.28, 0.9974, 0.32],
      [9.40, 261.63, 0.30, 0.9968, 0.36], [10.80, 293.66, 0.31, 0.9968, 0.35],
      [12.35, 233.08, 0.29, 0.9968, 0.31], [13.70, 220.00, 0.33, 0.9972, 0.32]
    ];
    for (const [sec, freq, amp, dec, bright] of events) pluckString(buf, sec, freq, amp, dec, bright, rand);
    // Warm cedar breath bed beneath strings (strictly understated)
    for (let i = 0; i < n; i++) {
      const t = i / SR, breath = 0.025 * Math.sin(TAU * 110 * t) * (0.6 + 0.4 * Math.sin(TAU * t / 8.0));
      buf[i] += breath;
    }
    return roomTail(buf, 0.28);
  });
}

function buildWood() {
  const rand = rng(505), buf = makeBuf(0.68), grain = makeBuf(0.68);
  for (let i = 0; i < grain.length; i++) grain[i] = (rand() * 2 - 1);
  const scrape = bandpass(grain, 920, 1.3), hiss = bandpass(grain, 2600, 0.9);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    // Hand-plane pass (0.04..0.46s) + subtle cedar mallet tap at 0.02s
    const pass = t > 0.03 && t < 0.48 ? Math.sin(Math.PI * (t - 0.03) / 0.45) : 0;
    const chatter = 0.65 + 0.35 * Math.sin(TAU * 36 * t + 0.4 * Math.sin(TAU * 11 * t));
    const tap = Math.exp(-t * 28) * (Math.sin(TAU * 188 * t) * 0.42 + Math.sin(TAU * 430 * t) * 0.18);
    buf[i] = tap + (scrape[i] * 0.55 + hiss[i] * 0.24) * pass * chatter;
  }
  return roomTail(buf, 0.18);
}

function buildRope() {
  const rand = rng(606), buf = makeBuf(0.76), grit = makeBuf(0.76);
  for (let i = 0; i < grit.length; i++) grit[i] = rand() * 2 - 1;
  const fiber = bandpass(grit, 780, 1.5), hiss = bandpass(grit, 2100, 1.2);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR, env = Math.sin(Math.PI * clamp(t / 0.72, 0, 1));
    const creak = Math.sin(TAU * (142 + 48 * Math.sin(TAU * 2.2 * t)) * t + 0.5 * Math.sin(TAU * 19 * t));
    const pulses = Math.pow(0.5 + 0.5 * Math.sin(TAU * 11.5 * t), 2);
    buf[i] = env * (creak * 0.24 * pulses + (fiber[i] * 0.42 + hiss[i] * 0.25) * (0.45 + 0.55 * pulses));
  }
  return roomTail(buf, 0.14);
}

function buildPaper() {
  const rand = rng(707), raw = makeBuf(0.58), buf = makeBuf(0.58);
  for (let i = 0; i < raw.length; i++) raw[i] = rand() * 2 - 1;
  const body = bandpass(raw, 1850, 0.9), crisp = bandpass(raw, 4200, 1.4);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const sweep1 = Math.exp(-Math.pow((t - 0.11) / 0.055, 2)), sweep2 = Math.exp(-Math.pow((t - 0.34) / 0.07, 2)) * 0.72;
    const env = sweep1 + sweep2;
    buf[i] = (body[i] * 0.45 + crisp[i] * 0.65) * env;
  }
  return roomTail(buf, 0.10);
}

function buildCloth() {
  const rand = rng(808), raw = makeBuf(0.58), buf = makeBuf(0.58);
  for (let i = 0; i < raw.length; i++) raw[i] = rand() * 2 - 1;
  const wool = bandpass(raw, 620, 0.75), weave = bandpass(raw, 1550, 1.1);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR, env = Math.sin(Math.PI * clamp(t / 0.52, 0, 1)) * (0.7 + 0.3 * Math.sin(TAU * 5.2 * t));
    buf[i] = (wool[i] * 0.72 + weave[i] * 0.38) * env;
  }
  return roomTail(buf, 0.08);
}

function buildStepStone() {
  const rand = rng(909), raw = makeBuf(0.36), buf = makeBuf(0.36);
  for (let i = 0; i < raw.length; i++) raw[i] = rand() * 2 - 1;
  const grit = bandpass(raw, 2350, 1.3), tap = bandpass(raw, 720, 1.8);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const heel = Math.exp(-t * 42) * (Math.sin(TAU * (112 - 30 * t) * t) * 0.6 + tap[i] * 0.4);
    const toe = t > 0.045 ? Math.exp(-(t - 0.045) * 34) * (Math.sin(TAU * 155 * (t - 0.045)) * 0.25 + grit[i] * 0.55) : 0;
    buf[i] = heel + toe;
  }
  return roomTail(buf, 0.20, [[0.015, 0.40], [0.036, 0.22], [0.068, 0.11]]);
}

function buildStepWood() {
  const rand = rng(1010), raw = makeBuf(0.38), buf = makeBuf(0.38);
  for (let i = 0; i < raw.length; i++) raw[i] = rand() * 2 - 1;
  const creakNoise = bandpass(raw, 960, 1.4);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const hollow = Math.exp(-t * 21) * (Math.sin(TAU * 138 * t) * 0.65 + Math.sin(TAU * 282 * t) * 0.28);
    const plank = Math.exp(-t * 14) * Math.sin(TAU * 74 * t) * 0.35;
    const grain = (t > 0.02 ? Math.exp(-(t - 0.02) * 30) : 0) * creakNoise[i] * 0.25;
    buf[i] = hollow + plank + grain;
  }
  return roomTail(buf, 0.14);
}

function buildBell() {
  const rand = rng(1111), raw = makeBuf(2.9), buf = makeBuf(2.9);
  for (let i = 0; i < raw.length; i++) raw[i] = rand() * 2 - 1;
  const strikeClang = bandpass(raw, 2850, 2.5);
  const f0 = 392.0; // Warm G4 cast-bronze harbor watch bell
  const partials = [[1.0, 0.48, 0.95], [1.189, 0.34, 1.15], [1.502, 0.30, 1.38], [2.004, 0.26, 1.75], [2.385, 0.20, 2.25], [3.012, 0.14, 3.1], [4.16, 0.08, 4.5]];
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    let ring = 0;
    for (const [ratio, amp, damp] of partials) {
      const shimmer = 1 + 0.002 * Math.sin(TAU * 3.1 * t + ratio);
      ring += Math.sin(TAU * f0 * ratio * shimmer * t) * amp * Math.exp(-t * damp);
    }
    const strike = Math.exp(-t * 58) * (Math.sin(TAU * 1420 * t) * 0.35 + strikeClang[i] * 0.55);
    buf[i] = (ring * Math.min(1, t / 0.006) + strike) * Math.min(1, (2.88 - t) / 0.12);
  }
  return roomTail(buf, 0.30);
}

const generators = [
  ['harbor', buildHarbor, 0.56, 'Mediterranean surf swells, shingle retreat and moored boat wood rub loop'],
  ['wind', buildWind, 0.38, 'Caesarea corner drafts and harbor coastal breeze loop'],
  ['fire', buildFire, 0.62, 'Thermal roar and crackling timber splinters loop'],
  ['q01-quiet-score', buildQuietScore, 0.42, 'Karplus-Strong plucked cedar/gut-string contemplation loop'],
  ['wood', buildWood, 0.66, 'Hand-plane shear grain and cedar bench resonance'],
  ['rope', buildRope, 0.64, 'Loaded hemp braid twist and wooden block creak'],
  ['paper', buildPaper, 0.56, 'Parchment leaf turn and quill scrape grain'],
  ['cloth', buildCloth, 0.50, 'Heavy woven wool mantle brush'],
  ['step-stone', buildStepStone, 0.60, 'Limestone quay pavement stride with stone reflection'],
  ['step-wood', buildStepWood, 0.60, 'Seasoned timber deck/stair stride with deck resonance'],
  ['q01-bell', buildBell, 0.72, 'Cast-bronze harbor watch bell with inharmonic bronze partials']
];

const entries = generators.map(([id, fn, peak, notes]) => writeWav(id, fn(), peak, notes));
const ledger = {
  version: 2,
  sampleRate: SR,
  channels: 1,
  format: 'pcm_s16le',
  generatedBy: 'tools/prepare-q01-sound.cjs',
  license: 'Project-original deterministic procedural audio [H]',
  description: 'Physical-modeled ambient beds, material foley and contemplative strings for Q01.',
  entries
};
fs.writeFileSync(path.join(outDir, 'procedural-sources.json'), JSON.stringify(ledger, null, 2));
console.log(JSON.stringify({ status: 'generated', assets: entries.length, sampleRate: SR }));
