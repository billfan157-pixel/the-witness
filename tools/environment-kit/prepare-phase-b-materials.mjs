import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

// PBR comparison surfaces, not archaeological captures or measured kurkar.
// Run from any directory: node tools/environment-kit/prepare-phase-b-materials.mjs
const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'assets/architecture/phase-b');
const manifestPath = path.join(out, 'sources.json');
const previous = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
const sha = (data, algorithm = 'sha256') => crypto.createHash(algorithm).update(data).digest('hex');
const cropSize = 224;
// Pixel rectangles inspected in the 2048 px source Diffuse, safely inside faces.
// Identical crops and weights are used for all three PBR maps; no rotation.
const faceCrops = [
  [88, 90], [530, 90], [960, 90], [1400, 90],
  [720, 400], [320, 725], [1060, 725], [40, 1050]
].map(([left, top]) => ({ left, top, width: cropSize, height: cropSize }));
const specs = [
  { slot: 'ashlar', asset: 'sandstone_blocks_05', roughnessMin: .68, normalScale: .28, tileMeters: 1.5,
    md5: { albedo: '486e2b51beffc6c050d1e2b25fa47cbd', normal: '585dd95edff8637ac64e4f7999869bff', orm: 'a2fffaca583158f6927b45d4ce04040e' },
    interpretation: 'Mortar-free stone-face quilt for separately modelled ashlar blocks and trim. Derived from a modern sandstone comparison; not an identification of Caesarea kurkar or a historic block dimension.' },
  { slot: 'rubble', asset: 'stone_wall_03', roughnessMin: .72, normalScale: .42, tileMeters: 2.17,
    md5: { albedo: 'fae0ef9ba98456fabc1c78e4a781a173', normal: 'b303216d22a90cbb68f32f7a73bb208f', orm: 'ee65ea85315f7395575648414b9db83b' },
    interpretation: 'Coarse exposed mineral/aggregate comparison for small rubble-core and broken-edge patches. Modern scanned surface; not a claim of Roman concrete composition, binder, stone species or archaeological provenance.' }
];
const linear = Float64Array.from({ length: 256 }, (_, n) => {
  const c = n / 255;
  return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
});
function srgb(v) {
  v = Math.max(0, Math.min(1, v));
  return Math.round(255 * (v <= .0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - .055));
}
async function json(url) {
  const r = await fetch(url); if (!r.ok) throw Error(`HTTP ${r.status}: ${url}`);
  return r.json();
}
async function sourceMap(spec, name, metadata) {
  if (metadata.md5 !== spec.md5[name]) throw Error(`Official API source pin changed: ${spec.slot}/${name}`);
  const r = await fetch(metadata.url); if (!r.ok) throw Error(`HTTP ${r.status}: ${metadata.url}`);
  const bytes = Buffer.from(await r.arrayBuffer());
  if (sha(bytes, 'md5') !== spec.md5[name]) throw Error(`Downloaded MD5 mismatch: ${spec.slot}/${name}`);
  const record = { url: metadata.url, sourceBytes: bytes.length, md5: sha(bytes, 'md5'), sha256: sha(bytes) };
  const locked = previous?.surfaces?.find(s => s.slot === spec.slot)?.maps?.[name];
  if (locked?.sha256 && locked.sha256 !== record.sha256) throw Error(`Previous SHA-256 pin changed: ${spec.slot}/${name}`);
  return { bytes, record };
}
function normalize(data) {
  for (let i = 0; i < data.length; i += 3) {
    const x = data[i] / 127.5 - 1, y = data[i + 1] / 127.5 - 1, z = data[i + 2] / 127.5 - 1;
    const len = Math.hypot(x, y, z) || 1;
    data[i] = Math.round((x / len * .5 + .5) * 255);
    data[i + 1] = Math.round((y / len * .5 + .5) * 255);
    data[i + 2] = Math.round((z / len * .5 + .5) * 255);
  }
  return data;
}
async function quilt(bytes, map) {
  const size = 1024, step = 256, patch = 384;
  const faces = await Promise.all(faceCrops.map(crop => {
    let im = sharp(bytes).removeAlpha().extract(crop);
    if (map === 'albedo') im = im.gamma();
    return im.resize(patch, patch, { kernel: 'lanczos3' }).raw().toBuffer();
  }));
  const sum = new Float64Array(size * size * 3), weights = new Float64Array(size * size);
  const selection = [0, 4, 2, 6, 3, 1, 7, 5, 6, 2, 5, 0, 1, 7, 4, 3];
  const window = Float64Array.from({ length: patch }, (_, i) => Math.sin(Math.PI * (i + .5) / patch) ** 2);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const face = faces[selection[row * 4 + col]];
    for (let y = 0; y < patch; y++) for (let x = 0; x < patch; x++) {
      const dest = ((row * step + y - 64 + size) % size) * size + (col * step + x - 64 + size) % size;
      const src = (y * patch + x) * 3, w = window[x] * window[y];
      weights[dest] += w;
      for (let c = 0; c < 3; c++) sum[dest * 3 + c] += w * (map === 'albedo' ? linear[face[src + c]] : face[src + c]);
    }
  }
  const result = Buffer.alloc(size * size * 3);
  for (let p = 0; p < weights.length; p++) for (let c = 0; c < 3; c++) {
    const v = sum[p * 3 + c] / weights[p]; result[p * 3 + c] = map === 'albedo' ? srgb(v) : Math.round(v);
  }
  return result;
}
function periodicEdges(data, size) {
  // The quilt is toroidal; equal endpoint texels also survive lossless encoding.
  for (let i = 0; i < size; i++) for (let c = 0; c < 3; c++) {
    for (const [a, b] of [[(i * size) * 3 + c, (i * size + size - 1) * 3 + c], [(i * 3) + c, ((size - 1) * size + i) * 3 + c]]) {
      const avg = Math.round((data[a] + data[b]) * .5); data[a] = avg; data[b] = avg;
    }
  }
}
for (const quality of ['full', 'lite']) fs.mkdirSync(path.join(out, quality), { recursive: true });
const surfaces = [];
for (const spec of specs) {
  const [info, files] = await Promise.all(['info', 'files'].map(k => json(`https://api.polyhaven.com/${k}/${spec.asset}`)));
  const selection = { albedo: files.Diffuse['2k'].jpg, normal: files.nor_gl['2k'].png, orm: files.arm['2k'].png };
  const maps = Object.fromEntries(await Promise.all(Object.entries(selection).map(async ([name, meta]) => [name, await sourceMap(spec, name, meta)])));
  const base = {};
  for (const name of ['albedo', 'normal', 'orm']) {
    if (spec.slot === 'ashlar') base[name] = await quilt(maps[name].bytes, name);
    else {
      let im = sharp(maps[name].bytes).removeAlpha(); if (name === 'albedo') im = im.gamma();
      base[name] = await im.resize(1024, 1024, { kernel: 'lanczos3' }).raw().toBuffer();
    }
  }
  const outputs = {};
  for (const [quality, size] of [['full', 1024], ['lite', 512]]) {
    outputs[quality] = {};
    for (const name of ['albedo', 'normal', 'orm']) {
      let raw = Buffer.from(base[name]);
      if (size !== 1024) {
        let im = sharp(raw, { raw: { width: 1024, height: 1024, channels: 3 } });
        if (name === 'albedo') im = im.gamma();
        raw = await im.resize(size, size, { kernel: 'lanczos3' }).raw().toBuffer();
      }
      periodicEdges(raw, size);
      if (name === 'normal') normalize(raw);
      if (name === 'orm') for (let i = 0; i < raw.length; i += 3) {
        raw[i + 1] = Math.max(raw[i + 1], Math.ceil(spec.roughnessMin * 255)); raw[i + 2] = 0;
      }
      const data = await sharp(raw, { raw: { width: size, height: size, channels: 3 } }).webp({ lossless: true, effort: 5 }).toBuffer();
      const filename = `${spec.slot}-${name}.webp`; fs.writeFileSync(path.join(out, quality, filename), data);
      outputs[quality][name] = { path: `assets/architecture/phase-b/${quality}/${filename}`, bytes: data.length, sha256: sha(data), width: size, height: size };
    }
  }
  const { md5, ...publicSpec } = spec;
  surfaces.push({ ...publicSpec, title: info.name, authors: info.authors, source: `https://polyhaven.com/a/${spec.asset}`,
    api: { info: `https://api.polyhaven.com/info/${spec.asset}`, files: `https://api.polyhaven.com/files/${spec.asset}` },
    sourceResolution: '2k', sourceDimensionsMillimeters: info.dimensions, license: 'CC0-1.0',
    processing: spec.slot === 'ashlar' ? { type: 'project-authored toroidal multi-face quilt', faceCrops, patchPixels: 384, cellPixels: 256, linearLightAlbedoBlend: true, rotateOrMirror: false } : { type: 'whole modern comparison surface, gamma-aware downsample; no tint or added lighting' },
    maps: Object.fromEntries(Object.entries(maps).map(([name, m]) => [name, m.record])), outputs });
  console.log(`Prepared ${spec.slot}: 6 WebP maps`);
}
const validation = { images: 12, metallicNonzero: 0, maxNormalUnitLengthError: 0, roughnessRanges: {}, edgeMeanAbsoluteDifference: {}, visualReview: 'pending final sheet inspection' };
for (const s of surfaces) for (const quality of ['full', 'lite']) for (const name of ['albedo', 'normal', 'orm']) {
  const file = s.outputs[quality][name], raw = await sharp(path.join(root, file.path)).removeAlpha().raw().toBuffer();
  let lo = 255, hi = 0, edge = 0;
  for (let i = 0; i < raw.length; i += 3) {
    if (name === 'orm') { if (raw[i + 2]) validation.metallicNonzero++; lo = Math.min(lo, raw[i + 1]); hi = Math.max(hi, raw[i + 1]); }
    if (name === 'normal') validation.maxNormalUnitLengthError = Math.max(validation.maxNormalUnitLengthError, Math.abs(Math.hypot(raw[i] / 127.5 - 1, raw[i + 1] / 127.5 - 1, raw[i + 2] / 127.5 - 1) - 1));
  }
  for (let i = 0; i < file.width; i++) for (let c = 0; c < 3; c++) {
    edge += Math.abs(raw[(i * file.width) * 3 + c] - raw[(i * file.width + file.width - 1) * 3 + c]);
    edge += Math.abs(raw[i * 3 + c] - raw[((file.width - 1) * file.width + i) * 3 + c]);
  }
  validation.edgeMeanAbsoluteDifference[`${s.slot}/${quality}/${name}`] = edge / (file.width * 6);
  if (name === 'orm') validation.roughnessRanges[`${s.slot}/${quality}`] = [lo / 255, hi / 255];
}
if (validation.metallicNonzero || validation.maxNormalUnitLengthError > .008) throw Error('PBR channel validation failed');
const width = 960, cell = 320, row = 350, height = 760, composite = [];
const label = Buffer.from(`<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="#e9e3d3"/><style>text{font:16px sans-serif;fill:#302f26}</style><text x="12" y="24">Phase B comparison materials · albedo / OpenGL normal / AO-roughness-metalness</text>${surfaces.map((s, i) => `<text x="12" y="${58 + i * row}">${s.slot}: ${s.asset} · 1024 full / 512 lite · [H]</text>`).join('')}</svg>`);
composite.push({ input: label, left: 0, top: 0 });
for (const [i, s] of surfaces.entries()) for (const [j, name] of ['albedo', 'normal', 'orm'].entries()) composite.push({ input: await sharp(path.join(root, s.outputs.full[name].path)).resize(cell, cell).png().toBuffer(), left: j * cell, top: 68 + i * row });
await sharp({ create: { width, height, channels: 3, background: '#e9e3d3' } }).composite(composite).webp({ quality: 88 }).toFile(path.join(out, 'material-review.webp'));
const totals = Object.fromEntries(['full', 'lite'].map(q => [q, surfaces.reduce((n, s) => n + Object.values(s.outputs[q]).reduce((a, f) => a + f.bytes, 0), 0)]));
const record = { schemaVersion: 1, retrieved: '2026-11-10', provider: 'Poly Haven', license: 'CC0-1.0', licenseUrl: 'https://polyhaven.com/license',
  generator: 'tools/environment-kit/prepare-phase-b-materials.mjs',
  conventions: { albedo: 'sRGB source Diffuse; linear-light quilt and gamma-aware resize; no recolour or added directional lighting', normal: 'OpenGL tangent-space +Y; linear resize/blend then normalize; lossless 8-bit WebP', orm: 'Linear RGB = AO, roughness, metalness; roughness minimum per family; B exactly 0; lossless WebP', uv: 'Periodic edge texels; ashlar has no architectural mortar joints. tileMeters is an artistic recommendation, not a measured ancient dimension.', shader: 'Albedo SRGBColorSpace; normal and ORM NoColorSpace. Keep roughness factor 1 to preserve minima.' },
  limitations: ['Both families are modern CC0 comparison textures and [H] project processing, not archaeological images.', 'No exact Caesarea stone species, Roman concrete composition or first-century building plan is claimed.', 'Ashlar has blended crop detail; rubble is for exposed-core accents, not a substitute for separately modelled rubble silhouette.', 'Review with actual geometry, GI, scale, oblique camera angles and lite tier before art acceptance.'],
  reviewImage: 'assets/architecture/phase-b/material-review.webp', totals, surfaces, validation };
fs.writeFileSync(manifestPath, JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ status: 'prepared', textures: 12, totals, validation }));
