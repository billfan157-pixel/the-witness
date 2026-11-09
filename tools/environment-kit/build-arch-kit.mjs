// Reproducible source of the modular architecture kit (.glb, Meshopt + KTX2).
// Geometry comes from the same authored builder the runtime uses offline
// (witness-modular-kit.js), so the compressed pack and the fallback match.
//   node tools/environment-kit/build-arch-kit.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression, KHRTextureBasisu } from '@gltf-transform/extensions';
import { meshopt, cloneDocument } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

const require = createRequire(import.meta.url);
const T = await import('three');
const root = path.resolve(import.meta.dirname, '../..');
const work = path.join(import.meta.dirname, 'work');
const out = path.join(root, 'assets', 'environment-kit', 'arch');
fs.mkdirSync(work, { recursive: true });
fs.mkdirSync(out, { recursive: true });
const K = require('../../witness-modular-kit.js');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');

const encoder = path.join(import.meta.dirname, 'bin/basisu_st.wasm');
if (!fs.existsSync(encoder)) throw Error('Missing pinned encoder. Run node tools/environment-kit/setup-encoder.mjs');
const encoderHash = sha(fs.readFileSync(encoder));
if (encoderHash !== 'b42d951b1bf146133578e8c7927ad4a4a857552846a46a3ee33b541b2a06bc7d') throw Error('Unverified Basis encoder; rerun setup-encoder.mjs');

// Limestone PBR family from the authored architecture library.
const maps = [['albedo', false], ['normal', true], ['orm', true]];
for (const [name, linear] of maps) {
  await sharp(path.join(root, `assets/architecture/full/stone-${name}.webp`)).resize(512, 512).removeAlpha().png()
    .toFile(path.join(work, `arch-${name}.png`));
  const args = ['-file', `/work/tools/environment-kit/work/arch-${name}.png`, '-output_file', `/work/tools/environment-kit/work/arch-${name}.ktx2`,
    '-ktx2', '-mipmap', ...(name === 'normal' ? ['-uastc', '-uastc_level', '2', '-normal_map'] : ['-q', '255', '-comp_level', '2']),
    ...(linear ? ['-linear'] : ['-srgb'])];
  const run = spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(import.meta.dirname, 'basisu-cli.cjs'), ...args],
    { cwd: root, encoding: 'utf8', maxBuffer: 8e6 });
  fs.writeFileSync(path.join(work, `arch-${name}-encode.log`), run.stdout + '\n' + run.stderr);
  if (run.status !== 0) throw Error(`Basis encoding failed (${name}): ${run.stderr.slice(-500)}`);
  console.log('Encoded KTX2', name, fs.statSync(path.join(work, `arch-${name}.ktx2`)).size);
}

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

const pieces = [
  { id: 'ENV_ARCH_AshlarWall_4m_LOD0', geometry: K.ashlarWall(T, 7, 4, 3), footprint: [[-2, 0, .35], [-1, 0, .35], [1, 0, .35], [2, 0, .35]], access: 'closed' },
  { id: 'ENV_ARCH_RomanColumn_4m6_LOD0', geometry: K.column(T, 4.6, .33, 3), footprint: [[0, 0, .55]], access: 'closed' }
];

async function buildDoc(piece) {
  const { Document } = await import('@gltf-transform/core');
  const doc = new Document();
  const buffer = doc.createBuffer();
  const g = piece.geometry;
  const position = doc.createAccessor('POSITION', buffer).setType('VEC3').setArray(g.attributes.position.array);
  const normal = doc.createAccessor('NORMAL', buffer).setType('VEC3').setArray(g.attributes.normal.array);
  const uv = doc.createAccessor('TEXCOORD_0', buffer).setType('VEC2').setArray(g.attributes.uv.array);
  const mask = doc.createAccessor('COLOR_0', buffer).setType('VEC3').setArray(g.attributes.aMask.array);
  const indices = doc.createAccessor('INDICES', buffer).setType('SCALAR')
    .setArray(g.index.array instanceof Uint32Array ? g.index.array : new Uint32Array(g.index.array));
  const material = doc.createMaterial('Limestone modular kit');
  const primitive = doc.createPrimitive().setAttribute('POSITION', position).setAttribute('NORMAL', normal)
    .setAttribute('TEXCOORD_0', uv).setAttribute('COLOR_0', mask).setIndices(indices).setMaterial(material);
  const mesh = doc.createMesh(piece.id).addPrimitive(primitive);
  const node = doc.createNode(piece.id).setMesh(mesh)
    .setExtras({ assetId: piece.id, evidence: 'H', access: piece.access, footprint: piece.footprint, footprintSpace: 'asset',
      maskChannels: { r: 'cavity dirt', g: 'arris wear', b: 'ground moisture/moss' } });
  doc.createScene(piece.id).addChild(node);
  doc.getRoot().setExtras({ assetId: piece.id, footprintSpace: 'asset' });
  return doc;
}

const variantsByPiece = [];
for (const piece of pieces) {
  const base = await buildDoc(piece);
  const variants = {};
  for (const kind of ['raw', 'full', 'lite']) {
    const doc = cloneDocument(base);
    const material = doc.getRoot().listMaterials()[0];
    const textures = {};
    for (const [name] of maps) {
      let data, mime;
      if (kind === 'full') { data = fs.readFileSync(path.join(work, `arch-${name}.ktx2`)); mime = 'image/ktx2'; }
      else if (kind === 'lite') { data = await sharp(path.join(work, `arch-${name}.png`)).resize(256, 256).png().toBuffer(); mime = 'image/png'; }
      else { data = fs.readFileSync(path.join(work, `arch-${name}.png`)); mime = 'image/png'; }
      textures[name] = doc.createTexture(name).setImage(data).setMimeType(mime);
    }
    material.setBaseColorFactor([1, 1, 1, 1]).setBaseColorTexture(textures.albedo)
      .setNormalTexture(textures.normal).setNormalScale(.3)
      .setMetallicRoughnessTexture(textures.orm).setOcclusionTexture(textures.orm)
      .setMetallicFactor(0).setRoughnessFactor(1);
    for (const info of [material.getBaseColorTextureInfo(), material.getNormalTextureInfo(), material.getMetallicRoughnessTextureInfo(), material.getOcclusionTextureInfo()])
      info.setWrapS(10497).setWrapT(10497);
    if (kind === 'full') {
      doc.createExtension(KHRTextureBasisu).setRequired(true);
      doc.createExtension(EXTMeshoptCompression).setRequired(true);
      await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
    }
    const data = await io.writeBinary(doc);
    const hash = sha(data), file = `${piece.id.toLowerCase()}-${kind}-${hash.slice(0, 12)}.glb`;
    fs.writeFileSync(path.join(out, file), data);
    variants[kind] = { url: `./assets/environment-kit/arch/${file}`, sha256: hash, bytes: data.length };
    console.log(piece.id, kind, data.length, 'bytes');
  }
  variantsByPiece.push({ piece, variants });
}

const manifestFor = (list, id) => ({
  schemaVersion: 2, id, region: 'shared', status: 'modular-kit', artAccepted: false,
  pieces: list.map(({ piece, variants }) => ({ id: piece.id, variants, position: [0, 0, 0], yaw: 0,
    source: 'tools/environment-kit/build-arch-kit.mjs', license: 'project-authored geometry + CC0-1.0 Poly Haven limestone', artAccepted: false })),
  material: { source: 'assets/architecture/full (Poly Haven coral_ground_02 study)', license: 'CC0-1.0', evidence: 'H',
    colorSpaces: { albedo: 'srgb', normal: 'linear', orm: 'linear' } },
  build: { three: '0.187.0', encoder: 'Basis Universal v2.50 WASI', encoderSha256: encoderHash, meshoptimizer: '1.3.0',
    source: 'tools/environment-kit/build-arch-kit.mjs' }
});
// Separate manifests: scope.mount applies one transform list to every piece,
// so walls and columns must never share a pack.
fs.writeFileSync(path.join(out, 'manifest-v2.json'),
  JSON.stringify(manifestFor(variantsByPiece.filter(v => v.piece.id.includes('AshlarWall')), 'arch-modular-v1'), null, 2) + '\n');
fs.writeFileSync(path.join(out, 'manifest-columns-v2.json'),
  JSON.stringify(manifestFor(variantsByPiece.filter(v => !v.piece.id.includes('AshlarWall')), 'arch-columns-v1'), null, 2) + '\n');
console.log('Manifests:', path.join(out, 'manifest-v2.json'), path.join(out, 'manifest-columns-v2.json'));