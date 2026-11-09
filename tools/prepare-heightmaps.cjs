// Reproducible 16-bit terrain heightmaps for Galilea, Jerusalem and Caesarea.
// Base macro-shape + droplet hydraulic erosion + thermal talus weathering —
// the same simulation class Gaea/World Machine run internally. External
// 16-bit RAW exports from those tools can replace the simulated maps:
//   node tools/prepare-heightmaps.cjs --external
// (place {region}.r16 little-endian uint16, optional {region}.json {min,max}
//  in assets/terrain/heightmaps/ first; default elevation range is -4..4 m).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'assets', 'terrain', 'heightmaps');
const N = 257;                       // texels per side; finer than the 152x130 terrain grid
const EXTENT = [-78, 78, -67, 67];   // world metres, matches PlaneGeometry(156,134)
const CELL_X = (EXTENT[1] - EXTENT[0]) / (N - 1);
const CELL_Z = (EXTENT[3] - EXTENT[2]) / (N - 1);

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Gradient noise (Perlin-style) with fade interpolation; deterministic per seed.
function makeNoise(seed) {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  const base = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
  const grad = (hash, x, y) => {
    switch (hash & 7) {
      case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y;
      case 4: return x; case 5: return -x; case 6: return y; default: return -y;
    }
  };
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y) => {
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = perm[perm[xi] + yi], ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi], bb = perm[perm[xi + 1] + yi + 1];
    const x1 = grad(aa, xf, yf) + (grad(ba, xf - 1, yf) - grad(aa, xf, yf)) * u;
    const x2 = grad(ab, xf, yf - 1) + (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1)) * u;
    return (x1 + (x2 - x1) * v) * .7071; // ~[-1,1]
  };
}

function fbm(noise, x, y, octaves, lacunarity = 2.05, gain = .5) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise(x * freq, y * freq) * amp;
    norm += amp; amp *= gain; freq *= lacunarity;
  }
  return sum / norm;
}

const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const worldX = i => EXTENT[0] + i * CELL_X;
const worldZ = j => EXTENT[2] + j * CELL_Z;

// Meandering drainage channel inherited from the authored relief, now eroded.
function wadiChannel(x, z, centerX, depth, width) {
  const channel = x - (centerX + Math.sin(z * .071) * 7 + Math.sin(z * .17) * 1.8);
  return -depth * Math.exp(-channel * channel / width)
    + depth * .27 * Math.exp(-Math.pow(Math.abs(channel) - 5.8, 2) / 8);
}

const REGION_SPECS = {
  galilee: {
    seed: 1187, droplets: 95000, talus: .78, thermalPasses: 5,
    base(noise, x, z) {
      let h = fbm(noise, x / 52 + 3.1, z / 52 - 1.7, 5) * 2.9 + .45;
      h += fbm(noise, x / 14 + 9.2, z / 14 + 4.4, 3) * .5;
      // Lake Galilee basin south of the shoreline village.
      const lake = smooth(-19, -34, z);
      h = h * (1 - lake) + (-2.5 + fbm(noise, x / 30, z / 30, 2) * .3) * lake;
      // Ravine stream course on the eastern hill route.
      h += wadiChannel(x, z, 20, 1.35, 10) * (1 - lake);
      return h;
    },
    erosionMask(x, z) { return 1 - smooth(-19, -26, z); }
  },
  jerusalem: {
    seed: 2941, droplets: 110000, talus: .66, thermalPasses: 7,
    base(noise, x, z) {
      const ridge = 1 - Math.abs(fbm(noise, x / 44 + 7.7, z / 44 - 3.3, 4));
      let h = ridge * ridge * 3.6 - .7;
      h += fbm(noise, x / 12 + 1.3, z / 12 + 8.8, 4) * .55;
      // Kidron-style drainage on the east side.
      h += wadiChannel(x, z, 30, 1.1, 14);
      return h;
    },
    erosionMask() { return 1; }
  },
  caesarea: {
    seed: 4073, droplets: 80000, talus: .84, thermalPasses: 4,
    base(noise, x, z) {
      let h = fbm(noise, x / 60 - 2.2, z / 60 + 5.1, 4) * 2.3 + .3;
      // Kurkar sandstone ridge parallel to the coast.
      h += 1.9 * Math.exp(-Math.pow((z + 2) / 12, 2)) * (.6 + .4 * fbm(noise, x / 25, z / 25, 3));
      // Flat Herodian harbour shelf south of the seawall.
      const shelf = smooth(-17, -23, z);
      h = h * (1 - shelf) + (-.55 + fbm(noise, x / 40, z / 40, 2) * .12) * shelf;
      h += wadiChannel(x, z, 11, 1.65, 12) * (1 - shelf);
      return h;
    },
    erosionMask(x, z) { return 1 - smooth(-17, -23, z); }
  }
};

function sampleBilinear(map, x, y) {
  const cx = Math.max(0, Math.min(N - 1.0001, x)), cy = Math.max(0, Math.min(N - 1.0001, y));
  const ix = Math.floor(cx), iy = Math.floor(cy), fx = cx - ix, fy = cy - iy;
  const i = iy * N + ix;
  const h00 = map[i], h10 = map[i + 1], h01 = map[i + N], h11 = map[i + N + 1];
  return {
    height: h00 * (1 - fx) * (1 - fy) + h10 * fx * (1 - fy) + h01 * (1 - fx) * fy + h11 * fx * fy,
    gradX: (h10 - h00) * (1 - fy) + (h11 - h01) * fy,
    gradY: (h01 - h00) * (1 - fx) + (h11 - h10) * fx,
    ix, iy, fx, fy
  };
}

// Droplet hydraulic erosion (Lague-style): inertia, sediment capacity,
// slope-driven erosion/deposition, evaporation; brush-radius node erosion.
function hydraulicErosion(map, spec, rand, mask) {
  const radius = 2;
  const brush = [];
  let brushSum = 0;
  for (let dz = -radius; dz <= radius; dz++) for (let dx = -radius; dx <= radius; dx++) {
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d <= radius) { const w = Math.max(0, radius - d); brush.push({ dx, dz, w }); brushSum += w; }
  }
  for (const b of brush) b.w /= brushSum;
  const inertia = .06, capacityFactor = 3.6, minCapacity = .012;
  const depositRate = .28, erodeRate = .34, evaporate = .024, gravity = 4;
  for (let drop = 0; drop < spec.droplets; drop++) {
    let px = 1 + rand() * (N - 3), py = 1 + rand() * (N - 3);
    let dx = 0, dy = 0, speed = 1, water = 1, sediment = 0;
    for (let step = 0; step < 30; step++) {
      const s = sampleBilinear(map, px, py);
      const cellX = s.ix, cellY = s.iy;
      const maskHere = mask(worldX(cellX), worldZ(cellY));
      dx = dx * inertia - s.gradX * (1 - inertia);
      dy = dy * inertia - s.gradY * (1 - inertia);
      const len = Math.hypot(dx, dy);
      if (len < 1e-6) { const a = rand() * Math.PI * 2; dx = Math.cos(a); dy = Math.sin(a); }
      else { dx /= len; dy /= len; }
      const nx = px + dx, ny = py + dy;
      if (nx < 1 || ny < 1 || nx > N - 2 || ny > N - 2) break;
      const newH = sampleBilinear(map, nx, ny).height;
      const deltaH = newH - s.height;
      const capacity = Math.max(-deltaH, .01) * speed * water * capacityFactor;
      if (sediment > capacity || deltaH > 0) {
        const amount = deltaH > 0 ? Math.min(deltaH, sediment) : (sediment - capacity) * depositRate;
        sediment -= amount;
        const i = cellY * N + cellX;
        map[i] += amount * (1 - s.fx) * (1 - s.fy);
        map[i + 1] += amount * s.fx * (1 - s.fy);
        map[i + N] += amount * (1 - s.fx) * s.fy;
        map[i + N + 1] += amount * s.fx * s.fy;
      } else if (maskHere > .01) {
        const amount = Math.min((capacity - sediment) * erodeRate * maskHere, -deltaH);
        for (const b of brush) {
          const bx = cellX + b.dx, by = cellY + b.dz;
          if (bx < 0 || by < 0 || bx >= N || by >= N) continue;
          const i = by * N + bx;
          const take = Math.min(map[i] - (spec.floor ?? -8), amount * b.w);
          if (take > 0) { map[i] -= take; sediment += take; }
        }
      }
      speed = Math.sqrt(Math.max(0, speed * speed - deltaH * gravity));
      water *= 1 - evaporate;
      px = nx; py = ny;
      if (water < .02) break;
    }
  }
}

// Thermal weathering: material above the talus angle slumps downhill.
function thermalErosion(map, spec) {
  const talus = spec.talus * Math.min(CELL_X, CELL_Z);
  const tmp = new Float64Array(N * N);
  for (let pass = 0; pass < spec.thermalPasses; pass++) {
    tmp.set(map);
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const i = y * N + x, h = map[i];
      let maxSlope = 0, target = -1;
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const j = (y + oy) * N + x + ox;
        const dist = Math.hypot(ox * CELL_X, oy * CELL_Z);
        const slope = (h - map[j]) / dist;
        if (slope > maxSlope) { maxSlope = slope; target = j; }
      }
      if (target >= 0 && maxSlope > spec.talus) {
        const move = (maxSlope - spec.talus) * Math.min(CELL_X, CELL_Z) * .22;
        tmp[i] -= move; tmp[target] += move;
      }
    }
    map.set(tmp);
  }
  return talus;
}

function simulateRegion(name) {
  const spec = REGION_SPECS[name];
  const noise = makeNoise(spec.seed);
  const rand = mulberry32(spec.seed ^ 0x9E3779B9);
  const map = new Float64Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++)
    map[j * N + i] = spec.base(noise, worldX(i), worldZ(j));
  const base = Float64Array.from(map);
  hydraulicErosion(map, spec, rand, spec.erosionMask);
  thermalErosion(map, spec);
  // Limit incision so gullies stay eroded banks, not quarry pits.
  for (let i = 0; i < map.length; i++) {
    const limit = base[i] - 2.4;
    if (map[i] < limit) map[i] = limit + (map[i] - limit) * .25;
  }
  // Re-assert authored macro constraints after erosion (lake/harbour shelf).
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = worldX(i), z = worldZ(j), jIdx = j * N + i;
    if (name === 'galilee') {
      const lake = smooth(-21, -30, z);
      map[jIdx] = map[jIdx] * (1 - lake) + Math.min(map[jIdx], -1.9) * lake;
    } else if (name === 'caesarea') {
      const shelf = smooth(-19, -24, z);
      map[jIdx] = map[jIdx] * (1 - shelf) + Math.min(map[jIdx], -.35) * shelf;
    }
  }
  return map;
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 255];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// 16-bit grayscale PNG (big-endian samples) for tool interop and inspection.
function png16(u16) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4);
  ihdr[8] = 16; ihdr[9] = 0;
  const raw = Buffer.alloc(N * (1 + N * 2));
  for (let y = 0; y < N; y++) {
    const row = y * (1 + N * 2);
    raw[row] = 0;
    for (let x = 0; x < N; x++) raw.writeUInt16BE(u16[y * N + x], row + 1 + x * 2);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
  ]);
}

function quantize(map) {
  let min = Infinity, max = -Infinity;
  for (const h of map) { if (h < min) min = h; if (h > max) max = h; }
  const u16 = new Uint16Array(N * N);
  const span = Math.max(1e-6, max - min);
  for (let i = 0; i < map.length; i++) u16[i] = Math.round((map[i] - min) / span * 65535);
  return { min, max, u16 };
}

function main() {
  const external = process.argv.includes('--external');
  fs.mkdirSync(outDir, { recursive: true });
  const regions = {};
  for (const name of Object.keys(REGION_SPECS)) {
    let map;
    if (external) {
      const file = path.join(outDir, name + '.r16');
      const data = fs.readFileSync(file);
      if (data.length !== N * N * 2) throw Error(`${file}: expected ${N * N * 2} bytes (uint16 LE, ${N}x${N})`);
      const u16 = new Uint16Array(data.buffer, data.byteOffset, N * N);
      let min = -4, max = 4;
      const sidecar = path.join(outDir, name + '.json');
      if (fs.existsSync(sidecar)) ({ min, max } = JSON.parse(fs.readFileSync(sidecar, 'utf8')));
      map = Float64Array.from(u16, v => min + v / 65535 * (max - min));
      console.log(`Imported external ${name}.r16 (${min}..${max} m)`);
    } else {
      map = simulateRegion(name);
    }
    const { min, max, u16 } = quantize(map);
    const r16 = Buffer.from(u16.buffer);
    fs.writeFileSync(path.join(outDir, name + '.r16'), r16);
    fs.writeFileSync(path.join(outDir, name + '.png'), png16(u16));
    fs.writeFileSync(path.join(outDir, name + '.json'), JSON.stringify({ min, max, size: N, format: 'uint16-le', metres: true }, null, 2) + '\n');
    regions[name] = { min, max, data: r16.toString('base64') };
    console.log(`${name}: range ${min.toFixed(2)}..${max.toFixed(2)} m, ${r16.length} bytes raw`);
  }
  const bundle = 'globalThis.WitnessHeightmaps=' + JSON.stringify({
    format: 'uint16-le', size: N, extent: EXTENT,
    source: 'tools/prepare-heightmaps.cjs', regions
  }) + ';\n';
  fs.writeFileSync(path.join(root, 'vendor', 'witness-heightmaps.js'), bundle);
  const provenance = {
    generator: 'tools/prepare-heightmaps.cjs',
    algorithm: 'gradient-noise macro shape + droplet hydraulic erosion (Lague) + thermal talus weathering',
    note: 'Procedural stand-in for Gaea/World Machine erosion exports. Drop real 16-bit .r16 exports into assets/terrain/heightmaps/ and rerun with --external.',
    size: N, extent: EXTENT, units: 'metres',
    regions: Object.fromEntries(Object.entries(REGION_SPECS).map(([name, spec]) => [name, {
      seed: spec.seed, droplets: spec.droplets, talusSlope: spec.talus, thermalPasses: spec.thermalPasses
    }]))
  };
  fs.writeFileSync(path.join(outDir, 'sources.json'), JSON.stringify(provenance, null, 2) + '\n');
  console.log('Bundle: vendor/witness-heightmaps.js', Buffer.byteLength(bundle), 'bytes');
}

main();