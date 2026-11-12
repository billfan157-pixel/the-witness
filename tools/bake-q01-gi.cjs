#!/usr/bin/env node
'use strict';

// Static diffuse transport for the Phase B Q01 store. No rendering dependency.
// Bake: node tools/bake-q01-gi.cjs
// Fast input/asset verification: node tools/bake-q01-gi.cjs --check
// Integrator, SH, occlusion and checked-asset tests: --self-test
// The proxy uses the real architecture's AABBs and authored linear albedos;
// this is deliberately not a claim of full rendered-mesh/texture path tracing.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { performance } = require('node:perf_hooks');

const ROOT = path.resolve(__dirname, '..');
const ASSET = path.join(ROOT, 'vendor', 'witness-q01-gi-data.js');
const EVIDENCE = path.join(ROOT, 'assets', 'architecture', 'phase-b', 'gi-bake.json');
const ALGORITHM = 'q01-aabb-diffuse-pathtrace-sh9-v1';
const GRID = [11, 5, 10];
const MIN = [-27.05, .16, -17.08];
const MAX = [-18.94, 3.03, -9.82];
const BOUNCES = 3;
const RAYS = 512;
const SEED = 0x514f3142;
const EPS = 1e-4;
const PROBE_CLEARANCE = .06;
const LIGHT_RANGE = 3.6;
const LIGHT_RADIUS = .045;
const PI = Math.PI;
const GOLDEN_ANGLE = PI * (3 - Math.sqrt(5));
const CHANNELS = ['directSky', 'bouncedSky', 'bouncedSun', 'bouncedLamps'];
const NORMALS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
// A checkout policy must not change what a recorded hash covers.
const eolNormalised = value => Buffer.from((Buffer.isBuffer(value) ? value.toString('utf8') : String(value)).replace(/\r\n/g, '\n'), 'utf8');
const sum3 = (a, b) => a.map((v, i) => v + b[i]);
const length = v => Math.hypot(...v);
const normalize = v => { const l = length(v); return v.map(x => x / l); };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const luminance = v => .2126 * v[0] + .7152 * v[1] + .0722 * v[2];
const rounded = v => Array.isArray(v) ? v.map(rounded) : Number(v.toPrecision(9));
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  if (typeof value === 'number') return Number.isFinite(value) ? (Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(9)))) : JSON.stringify(value);
  return JSON.stringify(value);
}
function srgb(hex) {
  return [1, 3, 5].map(i => {
    const s = parseInt(hex.slice(i, i + 2), 16) / 255;
    return s <= .04045 ? s / 12.92 : Math.pow((s + .055) / 1.055, 2.4);
  });
}
function sunDirection(elevation, azimuth) {
  const a = elevation * PI / 180;
  // Matches AdventureVisuals.sunDirection, with world Y up.
  return [Math.sin(azimuth) * Math.cos(a), Math.sin(a), -Math.cos(azimuth) * Math.cos(a)];
}
function scenarios(lamps) {
  const make = (elevation, azimuth, intensity, color, zenith, horizon, skyIntensity, powers) => ({
    sun: { elevation, azimuth, intensity, color: srgb(color), direction: sunDirection(elevation, azimuth) },
    sky: { zenith: srgb(zenith), horizon: srgb(horizon), intensity: skyIntensity, gradientExponent: .35 },
    lamps: lamps.map((l, i) => ({ ...l, power: powers[i], color: srgb(i === 2 ? '#ffb974' : '#ffac55'), range: LIGHT_RANGE, radius: LIGHT_RADIUS }))
  });
  return {
    day: make(46, -.82, 3.35, '#fff0d5', '#377fae', '#d0d8cb', .60, [.48, .48, .14]),
    evening: make(19, .64, 1.55, '#afc8e9', '#14253e', '#586478', .18, lamps.map(l => l.power))
  };
}
function loadInputs() {
  const ar = require('../witness-architecture.js').create({ height: () => -.12 });
  const env = require('../witness-q01-environment.js');
  assert.equal(ar.base, 0, 'Bake must use the local building datum');
  const boxes = env.bakeBoxes(ar).map(b => ({ id: b.id, min: [...b.min], max: [...b.max], albedo: [...b.albedo] }));
  for (const b of boxes) {
    assert(b.min.every((v, i) => Number.isFinite(v) && v < b.max[i]), 'Invalid AABB ' + b.id);
    assert(b.albedo.every(v => Number.isFinite(v) && v >= 0 && v <= 1), 'Invalid linear diffuse albedo ' + b.id);
  }
  const lamps = env.lamps.map(l => ({ at: [...l.at], power: l.power }));
  assert.equal(lamps.length, 3, 'Update the explicit scenario lamp mapping if the light count changes');
  const scene = {
    algorithm: ALGORITHM,
    bakerSha256: sha256(eolNormalised(fs.readFileSync(__filename))),
    grid: GRID, min: MIN, max: MAX, bounces: BOUNCES, raysPerProbe: RAYS,
    seed: SEED, rayEpsilon: EPS, probeClearance: PROBE_CLEARANCE,
    primarySamples: 'equal-solid-angle spherical Fibonacci',
    continuation: 'seeded cosine-weighted hemisphere; no roulette',
    directLightExclusion: 'No next-event source evaluation at probes; sky contains no sun disk; emitters have no hittable geometry',
    boxes, exportedLamps: lamps, scenarios: scenarios(lamps)
  };
  return { scene, boxes, sourceHash: sha256(canonical(scene)) };
}
function hash32(x) {
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  return (x ^ (x >>> 16)) >>> 0;
}
const unitRandom = seed => (hash32(seed) + .5) / 4294967296;
function fibonacci(i, count) {
  const y = 1 - 2 * (i + .5) / count, r = Math.sqrt(Math.max(0, 1 - y * y)), a = GOLDEN_ANGLE * i;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
}
function cosineHemisphere(n, seed, bounce) {
  const u = unitRandom(seed ^ Math.imul(bounce + 1, 0x9e3779b9));
  const v = unitRandom(seed ^ Math.imul(bounce + 1, 0x85ebca6b));
  const r = Math.sqrt(u), a = 2 * PI * v, local = [r * Math.cos(a), r * Math.sin(a), Math.sqrt(1 - u)];
  // Every proxy normal is axial; this is a right-handed frame for any unit n.
  const t = Math.abs(n[1]) < .999 ? normalize([n[2], 0, -n[0]]) : [1, 0, 0];
  const b = [n[1] * t[2] - n[2] * t[1], n[2] * t[0] - n[0] * t[2], n[0] * t[1] - n[1] * t[0]];
  return n.map((c, i) => t[i] * local[0] + b[i] * local[1] + c * local[2]);
}
function inside(p, b, padding = 0) {
  return p[0] > b.min[0] - padding && p[0] < b.max[0] + padding &&
    p[1] > b.min[1] - padding && p[1] < b.max[1] + padding &&
    p[2] > b.min[2] - padding && p[2] < b.max[2] + padding;
}
function relocateProbe(original, boxes) {
  if (!boxes.some(b => inside(original, b, PROBE_CLEARANCE))) return [...original];
  // Search projections onto expanded AABB faces, best first. Multiple face
  // projections handle overlapping solid volumes (steps, props, roof beams).
  const queue = [{ p: [...original], d2: 0 }], seen = new Set();
  for (let iteration = 0; queue.length && iteration < 20000; iteration++) {
    queue.sort((a, b) => a.d2 - b.d2);
    const { p } = queue.shift(), key = p.map(v => v.toFixed(8)).join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    const covering = boxes.filter(b => inside(p, b, PROBE_CLEARANCE));
    if (!covering.length) return p;
    for (const b of covering) for (let axis = 0; axis < 3; axis++) for (const v of [b.min[axis] - PROBE_CLEARANCE, b.max[axis] + PROBE_CLEARANCE]) {
      const q = [...p]; q[axis] = v;
      queue.push({ p: q, d2: q.reduce((s, x, i) => s + (x - original[i]) ** 2, 0) });
    }
  }
  throw Error('Could not relocate solid probe ' + original.join(','));
}
function probeLayout(boxes) {
  const probes = [];
  for (let z = 0; z < GRID[2]; z++) for (let y = 0; y < GRID[1]; y++) for (let x = 0; x < GRID[0]; x++) {
    const original = [x, y, z].map((v, i) => MIN[i] + (MAX[i] - MIN[i]) * v / (GRID[i] - 1));
    const at = relocateProbe(original, boxes);
    assert(!boxes.some(b => inside(at, b)), 'Probe remains in a solid');
    probes.push({ index: probes.length, x, y, z, original, at, moved: length(at.map((v, i) => v - original[i])) });
  }
  return probes;
}
function rayBox(origin, direction, box, maxDistance) {
  let near = -Infinity, far = Infinity, enterAxis = 0, exitAxis = 0, enterSign = 1, exitSign = 1;
  for (let a = 0; a < 3; a++) {
    const d = direction[a];
    if (Math.abs(d) < 1e-12) {
      if (origin[a] < box.min[a] || origin[a] > box.max[a]) return null;
      continue;
    }
    let t0 = (box.min[a] - origin[a]) / d, t1 = (box.max[a] - origin[a]) / d;
    let s0 = -1, s1 = 1;
    if (t0 > t1) { [t0, t1] = [t1, t0]; s0 = 1; s1 = -1; }
    if (t0 > near) { near = t0; enterAxis = a; enterSign = s0; }
    if (t1 < far) { far = t1; exitAxis = a; exitSign = s1; }
    if (near > far || far < EPS || near >= maxDistance) return null;
  }
  if (near >= EPS) return { t: near, axis: enterAxis, sign: enterSign };
  if (far >= EPS && far < maxDistance) return { t: far, axis: exitAxis, sign: exitSign };
  return null;
}
function closest(origin, direction, boxes, counters) {
  if (counters) counters.transportRays++;
  let nearest = Infinity, result = null;
  for (const box of boxes) {
    const hit = rayBox(origin, direction, box, nearest);
    if (hit && hit.t < nearest) { nearest = hit.t; result = { ...hit, box }; }
  }
  if (!result) return null;
  const normal = [0, 0, 0]; normal[result.axis] = result.sign;
  return { point: origin.map((v, i) => v + direction[i] * nearest), normal, albedo: result.box.albedo };
}
function occluded(origin, direction, boxes, distance = Infinity, counters) {
  if (counters) counters.shadowRays++;
  for (const box of boxes) if (rayBox(origin, direction, box, distance)) return true;
  return false;
}
function skyRadiance(direction, sky) {
  if (direction[1] <= 0) return [0, 0, 0];
  const t = Math.pow(direction[1], sky.gradientExponent);
  return sky.zenith.map((v, i) => (sky.horizon[i] * (1 - t) + v * t) * sky.intensity);
}
function newCounters() {
  return {
    transportRays: 0, shadowRays: 0, firstSurfaceHits: 0, primaryVisibleSky: 0,
    sunSamples: 0, sunBlocked: 0, lampSamples: 0, lampBlocked: 0,
    sourceRadianceSum: CHANNELS.map(() => [0, 0, 0]),
    depthRadianceSum: Array.from({ length: BOUNCES + 1 }, () => [0, 0, 0])
  };
}
function trace(origin, direction, boxes, scenario, seed, maxBounces = BOUNCES, counters) {
  let o = origin, d = direction, throughput = [1, 1, 1];
  const result = [0, 0, 0];
  function add(value, source, depth) {
    for (let c = 0; c < 3; c++) {
      const v = value[c] * throughput[c]; result[c] += v;
      if (counters) { counters.sourceRadianceSum[source][c] += v; counters.depthRadianceSum[depth][c] += v; }
    }
  }
  for (let depth = 0; depth <= maxBounces; depth++) {
    const hit = closest(o, d, boxes, counters);
    if (!hit) {
      if (counters && depth === 0 && d[1] > 0) counters.primaryVisibleSky++;
      add(skyRadiance(d, scenario.sky), depth === 0 ? 0 : 1, depth);
      break;
    }
    if (counters && depth === 0) counters.firstSurfaceHits++;
    if (depth === maxBounces) break;
    const n = hit.normal, p = hit.point.map((v, i) => v + n[i] * EPS * 3), rho = hit.albedo;
    const sunCos = Math.max(0, dot(n, scenario.sun.direction));
    if (sunCos > 0 && scenario.sun.intensity > 0) {
      if (counters) counters.sunSamples++;
      if (!occluded(p, scenario.sun.direction, boxes, Infinity, counters)) {
        add(rho.map((a, c) => a / PI * sunCos * scenario.sun.intensity * scenario.sun.color[c]), 2, depth + 1);
      } else if (counters) counters.sunBlocked++;
    }
    for (const lamp of scenario.lamps) {
      const vector = lamp.at.map((v, i) => v - p[i]), distance = length(vector);
      if (distance >= lamp.range || distance < EPS || lamp.power <= 0) continue;
      const towards = vector.map(v => v / distance), cosine = Math.max(0, dot(n, towards));
      if (cosine <= 0) continue;
      if (counters) counters.lampSamples++;
      if (occluded(p, towards, boxes, Math.max(EPS, distance - lamp.radius), counters)) {
        if (counters) counters.lampBlocked++;
        continue;
      }
      // Three's physically-correct inverse-square attenuation and smooth range
      // cutoff. A small finite source radius bounds the near-emitter singularity.
      const cutoff = Math.max(0, 1 - (distance / lamp.range) ** 4) ** 2;
      const e = lamp.power * cutoff * cosine / Math.max(distance * distance, lamp.radius * lamp.radius);
      add(rho.map((a, c) => a / PI * e * lamp.color[c]), 3, depth + 1);
    }
    throughput = throughput.map((v, c) => v * rho[c]);
    // Diffuse BRDF rho/pi divided by cosine PDF cos/pi leaves rho.
    o = p; d = cosineHemisphere(n, seed, depth);
  }
  return result;
}
function shBasis(d) {
  const [x, y, z] = d;
  // Three.SphericalHarmonics3 order, radiance coefficients (not irradiance).
  return [.282095, .488603 * y, .488603 * z, .488603 * x,
    1.092548 * x * y, 1.092548 * y * z, .315392 * (3 * z * z - 1),
    1.092548 * x * z, .546274 * (x * x - y * y)];
}
function irradiance(coefficients, n) {
  const [x, y, z] = n, factors = [.886227, 1.023327 * y, 1.023327 * z, 1.023327 * x,
    .858086 * x * y, .858086 * y * z, .247708 * (3 * z * z - 1), .858086 * x * z, .429043 * (x * x - y * y)];
  return [0, 1, 2].map(c => factors.reduce((v, f, i) => v + f * coefficients[i * 3 + c], 0));
}
function projectRadiance(sample, count) {
  const coefficients = new Float64Array(27), weight = 4 * PI / count;
  for (let ray = 0; ray < count; ray++) {
    const d = fibonacci(ray, count), basis = shBasis(d), radiance = sample(d, ray);
    for (let c = 0; c < 9; c++) for (let color = 0; color < 3; color++) coefficients[c * 3 + color] += radiance[color] * basis[c] * weight;
  }
  return coefficients;
}
function encode(coefficients, probes) {
  const scales = Array.from({ length: 9 }, () => [1e-9, 1e-9, 1e-9]);
  for (const coeff of coefficients) for (let c = 0; c < 9; c++) for (let color = 0; color < 3; color++) scales[c][color] = Math.max(scales[c][color], Math.abs(coeff[c * 3 + color]));
  const pixels = Buffer.alloc(GRID[0] * 9 * GRID[1] * GRID[2] * 4);
  let maxQuantizationError = 0;
  for (const probe of probes) for (let c = 0; c < 9; c++) {
    const pixel = ((probe.z * GRID[1] + probe.y) * GRID[0] * 9 + c * GRID[0] + probe.x) * 4;
    for (let color = 0; color < 3; color++) {
      const v = coefficients[probe.index][c * 3 + color], scale = scales[c][color];
      const byte = Math.max(0, Math.min(255, Math.round((v / scale * .5 + .5) * 255)));
      pixels[pixel + color] = byte;
      maxQuantizationError = Math.max(maxQuantizationError, Math.abs((byte / 255 * 2 - 1) * scale - v));
    }
    pixels[pixel + 3] = 255;
  }
  return { pixels: pixels.toString('base64'), scales, maxQuantizationError };
}
function decode(spec, x, y, z) {
  const pixels = Buffer.from(spec.pixels, 'base64'), coefficients = new Float64Array(27);
  for (let c = 0; c < 9; c++) {
    const pixel = ((z * GRID[1] + y) * GRID[0] * 9 + c * GRID[0] + x) * 4;
    for (let color = 0; color < 3; color++) coefficients[c * 3 + color] = (pixels[pixel + color] / 255 * 2 - 1) * spec.scales[c][color];
  }
  return coefficients;
}
function stats(coefficients, counters, probes) {
  const sampleCount = probes.length * RAYS;
  const mean = [0, 0, 0], incoming = [], surfaceIrradiance = [];
  for (const coeff of coefficients) {
    const average = [0, 1, 2].map(c => coeff[c] / (.282095 * 4 * PI));
    for (let c = 0; c < 3; c++) mean[c] += average[c] / probes.length;
    incoming.push(luminance(average));
    for (const n of NORMALS) surfaceIrradiance.push(luminance(irradiance(coeff, n).map(v => Math.max(0, v))));
  }
  assert(coefficients.every(c => [...c].every(Number.isFinite)), 'Non-finite SH coefficient');
  assert(incoming.every(v => v > 0), 'Probes without transported energy: ' + JSON.stringify(probes.filter((p, i) => incoming[i] <= 0).slice(0, 8).map(p => ({ slot: [p.x, p.y, p.z], at: p.at }))));
  assert(Math.max(...incoming) > Math.min(...incoming) * 1.1, 'No meaningful spatial lighting variation');
  assert(counters.sourceRadianceSum[1].some(v => v > 0), 'No bounced sky energy');
  assert(counters.sourceRadianceSum[2].some(v => v > 0), 'No reflected directional source energy');
  assert(counters.sourceRadianceSum[3].some(v => v > 0), 'No reflected lamp energy');
  assert(counters.depthRadianceSum[2].some(v => v > 0), 'No two-bounce transport');
  assert(counters.sunBlocked > 0 && counters.lampBlocked > 0, 'Expected occlusion is missing');
  return {
    transportRays: counters.transportRays, shadowRays: counters.shadowRays,
    primarySamples: sampleCount, primarySurfaceHitFraction: counters.firstSurfaceHits / sampleCount,
    primaryVisibleSkyFraction: counters.primaryVisibleSky / sampleCount,
    sunOcclusionFraction: counters.sunBlocked / counters.sunSamples,
    lampOcclusionFraction: counters.lampBlocked / counters.lampSamples,
    meanIncomingRadianceRGB: rounded(mean),
    meanIncomingRadianceBySourceRGB: Object.fromEntries(CHANNELS.map((n, i) => [n, rounded(counters.sourceRadianceSum[i].map(v => v / sampleCount))])),
    meanIncomingRadianceByDiffuseDepthRGB: counters.depthRadianceSum.map(v => rounded(v.map(x => x / sampleCount))),
    probeIncomingLuminance: rounded([Math.min(...incoming), incoming.reduce((a, b) => a + b, 0) / incoming.length, Math.max(...incoming)]),
    sixAxisIrradianceLuminance: rounded([Math.min(...surfaceIrradiance), surfaceIrradiance.reduce((a, b) => a + b, 0) / surfaceIrradiance.length, Math.max(...surfaceIrradiance)]),
    finiteProbes: coefficients.length, nonzeroProbes: incoming.filter(v => v > 0).length
  };
}
function loadAsset() {
  const context = {};
  vm.runInNewContext(fs.readFileSync(ASSET, 'utf8'), context, { filename: ASSET, timeout: 2000 });
  return context.WitnessQ01GIData;
}
function verifyAsset(inputs, verifyEvidence = true) {
  const data = loadAsset();
  assert.equal(data.algorithm, ALGORITHM, 'Algorithm changed; rebake');
  assert.equal(data.sourceHash, inputs.sourceHash, 'Bake scene, layout, lights or integrator changed; rebake');
  assert.equal(canonical(data.grid), canonical(GRID));
  assert.equal(canonical(data.min), canonical(MIN));
  assert.equal(canonical(data.max), canonical(MAX));
  assert.equal(data.bounces, BOUNCES); assert.equal(data.raysPerProbe, RAYS);
  for (const name of ['day', 'evening']) {
    const spec = data.scenarios[name], pixels = Buffer.from(spec.pixels, 'base64');
    assert.equal(pixels.length, GRID.reduce((a, b) => a * b, 1) * 9 * 4);
    assert.equal(spec.scales.length, 9);
    for (const scale of spec.scales) assert(scale.length === 3 && scale.every(v => v > 0 && Number.isFinite(v)));
    for (let i = 3; i < pixels.length; i += 4) assert.equal(pixels[i], 255);
    assert(Number.isFinite(spec.maxQuantizationError) && spec.maxQuantizationError > 0);
    assert(spec.maxQuantizationError <= Math.max(...spec.scales.flat()) / 255 + 1e-12, 'Signed RGBA8 quantization error exceeds bound');
    const energies = [];
    for (let z = 0; z < GRID[2]; z++) for (let y = 0; y < GRID[1]; y++) for (let x = 0; x < GRID[0]; x++) {
      const coeff = decode(spec, x, y, z);
      assert([...coeff].every(Number.isFinite));
      assert(coeff[0] > 0 && coeff[1] > 0 && coeff[2] > 0, 'Nonpositive mean radiance in checked asset');
      energies.push(luminance([...coeff].slice(0, 3)));
    }
    assert(Math.max(...energies) > Math.min(...energies) * 1.1);
  }
  if (verifyEvidence) {
    const evidence = JSON.parse(fs.readFileSync(EVIDENCE, 'utf8'));
    assert.equal(evidence.sourceHash, inputs.sourceHash);
    assert.equal(evidence.asset.sha256, sha256(eolNormalised(fs.readFileSync(ASSET))));
    for (const name of ['day', 'evening']) assert.equal(evidence.scenarios[name].pixelSha256, sha256(Buffer.from(data.scenarios[name].pixels, 'base64')));
    assert.equal(evidence.selfTest.passed, true);
  }
  return data;
}
async function selfTest(inputs) {
  const constant = projectRadiance(() => [1, 1, 1], 4096), errors = NORMALS.map(n => Math.abs(irradiance(constant, n)[0] - PI));
  const normalizationError = Math.max(...errors);
  assert(normalizationError < .001, 'Unit constant radiance must integrate to pi irradiance');
  const probe = [-23, 1.2, -13.5], doorway = [-23, 1, -9.85];
  assert(occluded(probe, [0, 1, 0], inputs.boxes), 'Actual roof must block upward sky');
  assert(!occluded(doorway, normalize([0, .3, 1]), inputs.boxes), 'Actual doorway must expose sky');
  const slab = [{ min: [-100, -1, -100], max: [100, 0, 100], albedo: [.5, .25, .125] }];
  const empty = { sun: { direction: [0, 1, 0], intensity: 0 }, lamps: [], sky: { zenith: [1, 1, 1], horizon: [1, 1, 1], intensity: 1, gradientExponent: 1 } };
  const reflected = trace([0, 1, 0], [0, -1, 0], slab, empty, SEED, 1);
  reflected.forEach((v, i) => assert(Math.abs(v - slab[0].albedo[i]) < 1e-12, 'Lambertian cosine-PDF normalization failed'));
  const sunOnly = { ...empty, sky: { ...empty.sky, intensity: 0 }, sun: { direction: [0, 1, 0], intensity: 5, color: [1, 1, 1] } };
  assert.deepEqual(trace([0, 1, 0], [0, 1, 0], [], sunOnly, SEED), [0, 0, 0], 'Unoccluded direct sun must not be baked into SH');
  const lampOnly = { ...empty, sky: { ...empty.sky, intensity: 0 }, lamps: [{ at: [0, 2, 0], power: 4.5, color: [1, .5, .1], range: 3.6, radius: .045 }] };
  assert.deepEqual(trace([0, 1, 0], [0, 1, 0], [], lampOnly, SEED), [0, 0, 0], 'Unoccluded direct lamps must not be baked into SH');
  const blocker = { min: [-.2, .8, -.2], max: [.2, 1.2, .2], albedo: [.4, .4, .4] };
  assert(occluded([0, EPS * 3, 0], [0, 1, 0], [blocker], 2));
  assert(!occluded([0, EPS * 3, 0], [0, 1, 0], [], 2));
  const relocated = probeLayout(inputs.boxes), shifts = relocated.filter(p => p.moved > 1e-9);
  assert(shifts.length > 0, 'The authored grid should exercise solid probe relocation');
  assert(relocated.every(p => !inputs.boxes.some(b => inside(p.at, b))), 'Relocation left a probe in a solid');
  // Exercise actual path tracing in both scenarios without rebaking the grid.
  const representative = [[-23, 1.2, -13.5], [-23, 1.2, -10.2], [-19.1, 2.8, -13.2]].map(p => relocateProbe(p, inputs.boxes));
  const testEnergy = {};
  for (const name of ['day', 'evening']) {
    const coeff = representative.map((p, i) => projectRadiance((d, r) => trace(p, d, inputs.boxes, inputs.scene.scenarios[name], hash32(SEED ^ Math.imul(i + 1, 0x9e3779b9) ^ r)), 256));
    assert(coeff.every(v => [...v].every(Number.isFinite) && v[0] > 0 && v[1] > 0 && v[2] > 0));
    testEnergy[name] = coeff.map(v => rounded([...v].slice(0, 3).map(x => x / (.282095 * 4 * PI))));
  }
  let threeComparison = { available: false, reason: 'Optional local Three reference not installed; analytic contract checked' };
  const reference = path.join(ROOT, 'tools', 'environment-kit', 'node_modules', 'three', 'src', 'math', 'SphericalHarmonics3.js');
  if (fs.existsSync(reference)) {
    const { SphericalHarmonics3 } = await import(pathToFileURL(reference).href);
    const { Vector3 } = await import(pathToFileURL(path.join(path.dirname(reference), 'Vector3.js')).href);
    const sh = new SphericalHarmonics3(), coeff = projectRadiance(d => [1 + .3 * d[0], .5 + .2 * d[1], .4 + .1 * d[2]], 1024);
    sh.coefficients.forEach((v, c) => v.set(...coeff.slice(c * 3, c * 3 + 3)));
    let maximumDifference = 0;
    for (const n of [...NORMALS, normalize([1, 2, 3])]) {
      const actual = sh.getIrradianceAt(new Vector3(...n), new Vector3()).toArray(), ours = irradiance(coeff, n);
      actual.forEach((v, c) => maximumDifference = Math.max(maximumDifference, Math.abs(v - ours[c])));
    }
    assert(maximumDifference < 5e-6, 'Shader irradiance convention differs from installed Three');
    threeComparison = { available: true, path: path.relative(ROOT, reference).split(path.sep).join('/'), maximumDifference };
  }
  return {
    passed: true, constantRadiance: 1, expectedIrradiance: PI, constantRadianceMaxIrradianceError: normalizationError,
    shOrder: ['constant', 'y', 'z', 'x', 'xy', 'yz', '3z^2-1', 'xz', 'x^2-y^2'],
    lambertianCosinePDF: 'passed', directSunExcluded: true, directLampsExcluded: true,
    actualRoofOcclusion: true, actualDoorwaySkyVisibility: true, lampBlockerOcclusion: true,
    solidProbeRelocation: true, representativeMeanIncomingRadianceRGB: testEnergy, threeComparison
  };
}
async function bake(inputs) {
  const start = performance.now(), probes = probeLayout(inputs.boxes), selfTestResult = await selfTest(inputs);
  const data = { algorithm: ALGORITHM, sourceHash: inputs.sourceHash, grid: GRID, min: MIN, max: MAX, bounces: BOUNCES, raysPerProbe: RAYS, scenarios: {} };
  const scenarioEvidence = {};
  for (const [name, scenario] of Object.entries(inputs.scene.scenarios)) {
    const scenarioStart = performance.now(), counters = newCounters();
    const coefficients = probes.map(p => projectRadiance((d, ray) => trace(p.at, d, inputs.boxes, scenario, hash32(SEED ^ Math.imul(p.index + 1, 0x9e3779b9) ^ ray), BOUNCES, counters), RAYS));
    const statistics = stats(coefficients, counters, probes), encoded = encode(coefficients, probes);
    data.scenarios[name] = encoded;
    let maxDecodedIrradianceError = 0;
    for (const p of probes) for (const n of NORMALS) {
      const a = irradiance(coefficients[p.index], n), b = irradiance(decode(encoded, p.x, p.y, p.z), n);
      for (let c = 0; c < 3; c++) maxDecodedIrradianceError = Math.max(maxDecodedIrradianceError, Math.abs(a[c] - b[c]));
    }
    scenarioEvidence[name] = {
      seconds: (performance.now() - scenarioStart) / 1000,
      pixelSha256: sha256(Buffer.from(encoded.pixels, 'base64')),
      maxQuantizationError: encoded.maxQuantizationError,
      maxDecodedSixAxisIrradianceError: maxDecodedIrradianceError,
      statistics
    };
    console.log(name + ': ' + probes.length + ' probes, ' + counters.transportRays + ' transport rays, ' + counters.shadowRays + ' shadow rays');
  }
  const source = '/* Generated by tools/bake-q01-gi.cjs. Static AABB diffuse transport; no direct source rays. */\n(function(root){\n\'use strict\';\nroot.WitnessQ01GIData=' + JSON.stringify(data) + ';\n})(globalThis);\n';
  fs.mkdirSync(path.dirname(ASSET), { recursive: true });
  fs.writeFileSync(ASSET, source);
  const moved = probes.filter(p => p.moved > 1e-9), distances = moved.map(p => p.moved);
  const evidence = {
    schemaVersion: 1, algorithm: ALGORITHM, sourceHash: inputs.sourceHash,
    generatedAt: new Date().toISOString(), runtime: { node: process.version, platform: process.platform, architecture: process.arch },
    seconds: (performance.now() - start) / 1000,
    scene: {
      source: 'WitnessArchitecture.create({height:()=>-.12}); WitnessQ01Environment.bakeBoxes(ar); WitnessQ01Environment.lamps',
      bakerSha256: inputs.scene.bakerSha256, sceneInputSha256: sha256(canonical({ boxes: inputs.boxes, lights: inputs.scene.scenarios })),
      datumY: 0, boxCount: inputs.boxes.length, probeCount: probes.length, grid: GRID, min: MIN, max: MAX,
      bounces: BOUNCES, raysPerProbe: RAYS, seed: SEED,
      totalPrimarySamples: probes.length * RAYS * 2,
      hemispherePDF: 'cos(theta)/pi; BRDF rho/pi; path throughput multiplies linear rho',
      sky: 'Upper hemisphere gradient without sun disk; lower escaped hemisphere is black; finite AABB yard reflects sky/sun',
      nextEventEstimation: 'Directional source plus three range-limited inverse-square oil lamps, visibility tested at every diffuse hit',
      directSourceExclusion: inputs.scene.directLightExclusion,
      scenarios: inputs.scene.scenarios
    },
    relocation: {
      method: 'Nearest free projection onto expanded AABB faces, best-first over overlapping solids; coefficients stay in nominal grid slots',
      clearanceMeters: PROBE_CLEARANCE, count: moved.length,
      maximumDistanceMeters: Math.max(0, ...distances), meanDistanceMeters: distances.length ? distances.reduce((a, b) => a + b, 0) / distances.length : 0,
      placementSha256: sha256(canonical(probes.map(p => p.at))),
      examples: moved.slice().sort((a, b) => b.moved - a.moved).slice(0, 4).map(p => ({ slot: [p.x, p.y, p.z], original: rounded(p.original), sampledAt: rounded(p.at), distanceMeters: p.moved }))
    },
    atlas: { width: GRID[0] * 9, height: GRID[1] * GRID[2], bytesPerScenario: GRID.reduce((a, b) => a * b, 1) * 9 * 4,
      encoding: 'Signed SH9 radiance RGB: round((coefficient/scale*.5+.5)*255), alpha=255; one maxAbs scale per coefficient/channel over all probes',
      pixelIndex: '((z*ny+y)*nx*9+c*nx+x)*4', interpolation: 'Runtime trilinear probe sampling and cosine convolution' },
    asset: { path: path.relative(ROOT, ASSET).split(path.sep).join('/'), bytes: Buffer.byteLength(source), sha256: sha256(eolNormalised(source)), lineEndings: 'normalised' },
    selfTest: selfTestResult, scenarios: scenarioEvidence,
    limitations: [
      'Deterministic CPU diffuse path tracing of AABB volumes and material-average linear albedos, not full rendered triangles, individual mortar joints, textures, normal maps, specular transport, caustics or spectral rendering.',
      'Truncated at three diffuse surface events with 512 primary directions per probe. Finite sampling and truncation leave noise and missing higher-order energy; no claim of converged physical radiometry.',
      'The analytic sky brightness and linear material averages are authored approximations, not measured HDR/lux calibration. Evening directional intensity follows the game\'s blue moon artistic setting.',
      'Only the exported bake scene occludes or reflects. Moving characters, doors, vegetation, fine props and external buildings are absent; dynamic direct sources/shadows remain realtime.',
      'Lamps use a point-source next-event approximation with a 4.5 cm near-source bound and 3.6 m smooth cutoff. Their direct illumination is deliberately excluded from the SH field.',
      'A coarse 11x5x10 SH9 volume smooths direction and position. Solid probes relocate to nearby air while retaining nominal atlas slots; interpolation near walls, stairs and openings can leak or blur transport.',
      'Signed RGBA8 has quantization error and SH9 may ring near strong occlusion; runtime clamps reconstructed negative irradiance. Bake verification is computational evidence, not human visual acceptance.'
    ]
  };
  fs.mkdirSync(path.dirname(EVIDENCE), { recursive: true });
  fs.writeFileSync(EVIDENCE, JSON.stringify(evidence, null, 2) + '\n');
  verifyAsset(inputs);
  console.log('Baked ' + ALGORITHM + ' in ' + evidence.seconds.toFixed(2) + 's; input SHA-256 ' + inputs.sourceHash);
  console.log('Asset SHA-256 ' + evidence.asset.sha256 + '; solid probes relocated: ' + moved.length);
}
async function main() {
  const args = new Set(process.argv.slice(2));
  for (const flag of args) assert(['--check', '--self-test'].includes(flag), 'Unknown argument ' + flag);
  const inputs = loadInputs();
  if (!args.size) return bake(inputs);
  if (args.has('--check')) {
    verifyAsset(inputs);
    console.log('GI asset input/hash/schema check passed; no grid rebake. ' + inputs.sourceHash);
  }
  if (args.has('--self-test')) {
    const result = await selfTest(inputs);
    verifyAsset(inputs);
    console.log('GI self-test passed: constant-radiance irradiance error=' + result.constantRadianceMaxIrradianceError.toExponential(3) + ', direct-source exclusion, actual occlusion, relocation and finite sample transport verified.');
  }
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
