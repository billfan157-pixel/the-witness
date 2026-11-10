'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { prepareOutput, verifiedDossier } = require('../tools/build-output.cjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'witness-output-'));
const write = (p, data) => { const file = path.join(root, p); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data); };
let checks = 0;
const test = (name, run) => { run(); checks++; console.log('PASS ' + name); };
try {
  write('package.json', '{}'); write('source.js', '// keep');
  test('fresh output removes obsolete files and never changes sources', () => {
    write('dist/retired.html', 'stale'); prepareOutput(root, 'dist');
    assert.deepEqual(fs.readdirSync(path.join(root, 'dist')), []);
    assert.equal(fs.readFileSync(path.join(root, 'source.js'), 'utf8'), '// keep');
  });
  test('nested cloud cleanup is bounded to its own output', () => {
    write('dist/client/retired.json', '{}'); write('dist/index.html', 'static');
    prepareOutput(root, 'dist/client');
    assert(fs.existsSync(path.join(root, 'dist/index.html')));
    assert.deepEqual(fs.readdirSync(path.join(root, 'dist/client')), []);
  });
  test('arbitrary or parent paths are rejected', () => {
    for (const p of ['.', '..', '../dist', 'docs', 'dist/../docs']) assert.throws(() => prepareOutput(root, p));
  });
  test('a junction cannot redirect cleanup to a different folder', () => {
    write('outside/keep.txt', 'keep');
    const link = path.join(root, 'dist/server');
    fs.symlinkSync(path.join(root, 'outside'), link, process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => prepareOutput(root, 'dist/server'), /linked/);
    assert(fs.existsSync(path.join(root, 'outside/keep.txt')));
    fs.unlinkSync(link);
  });
  const names = ['README.md', 'design-contract.json', 'campaign-contract.json', 'depth-contract.json', 'craft-contract.json'];
  const contract = JSON.stringify({ documentVersion: '3.0', depthExpansion: { revision: '3.2' }, documentFiles: ['README.md'] });
  for (const p of names) write('docs/the-witness/' + p, p === 'design-contract.json' ? contract : 'sample');
  test('no optional dossier means no stale documentation is shipped', () => assert.equal(verifiedDossier(root), null));
  const folder = 'outputs/THE-WITNESS-Design-v3.2';
  test('an incomplete optional reader is refused', () => {
    write(folder + '/THE-WITNESS-Design-Compendium.html', 'old');
    assert.throws(() => verifiedDossier(root), /Rebuild the reader/);
  });
  const hashes = {};
  for (const p of names) {
    const bytes = fs.readFileSync(path.join(root, 'docs/the-witness', p));
    hashes[p] = crypto.createHash('sha256').update(bytes).digest('hex'); write(folder + '/sources/' + p, bytes);
  }
  write(folder + '/validation.json', JSON.stringify({ sourceSha256: hashes }));
  write(folder + '/THE-WITNESS-v3-Pitch.html', 'pitch');
  test('current source hashes and matching exported sources are accepted', () => assert.equal(verifiedDossier(root), path.join(root, folder)));
  test('a later editorial change invalidates the export', () => {
    write('docs/the-witness/README.md', 'new source');
    assert.throws(() => verifiedDossier(root), /Stale dossier source/);
  });
  console.log(JSON.stringify({ status: 'passed', checks }));
} finally {
  const resolved = fs.realpathSync(root);
  if (!resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(resolved).startsWith('witness-output-')) throw Error('Unsafe cleanup');
  fs.rmSync(resolved, { recursive: true, force: true });
}
