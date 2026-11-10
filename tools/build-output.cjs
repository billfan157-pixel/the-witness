'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Only known generated directories can be cleared. Never follow a junction out
// of the checkout, or accept an arbitrary deletion target from an argument.
function prepareOutput(root, relative) {
  root = fs.realpathSync(root);
  if (!['dist', 'dist/client', 'dist/server', 'dist/.openai'].includes(relative)) throw Error('Unsupported build output: ' + relative);
  if (!fs.statSync(path.join(root, 'package.json')).isFile()) throw Error('Missing repository package.json');
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw Error('Output escapes repository');
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (fs.existsSync(current)) {
      if (fs.lstatSync(current).isSymbolicLink()) throw Error('Refusing linked build output: ' + current);
      const real = fs.realpathSync(current);
      if (!real.startsWith(root + path.sep)) throw Error('Output escapes repository');
    }
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  return target;
}

// An optional reader must describe the current editorial sources. Stale export
// folders are not silently copied into a new release.
function verifiedDossier(root) {
  const source = path.join(root, 'docs/the-witness');
  const contract = JSON.parse(fs.readFileSync(path.join(source, 'design-contract.json'), 'utf8'));
  const edition = contract.depthExpansion?.revision || contract.documentVersion;
  if (!/^\d+\.\d+$/.test(edition)) throw Error('Invalid dossier edition');
  const folder = path.join(root, 'outputs', 'THE-WITNESS-Design-v' + edition);
  if (!fs.existsSync(folder)) return null;
  const guidance = 'Rebuild the reader with tools/build-witness-docs.py or remove the stale generated export.';
  try {
    const report = JSON.parse(fs.readFileSync(path.join(folder, 'validation.json'), 'utf8'));
    const modern = report.format === 2;
    const docBase = contract.documentationRoot === '..' ? 'docs/' : 'docs/the-witness/';
    const expected = modern ? [...contract.documentFiles.map(f => docBase + f), ...['design', 'campaign', 'depth', 'craft'].map(n => 'docs/the-witness/' + n + '-contract.json')] : [...contract.documentFiles, 'design-contract.json', 'campaign-contract.json', 'depth-contract.json', 'craft-contract.json'];
    const files = modern ? Object.keys(report.sourceSha256 || {}) : expected;
    if (expected.some(f => !files.includes(f))) throw Error('Reader source manifest is incomplete');
    for (const file of files) {
      if (modern ? (!/^(?:docs|assets)\//.test(file) || file.includes('\\') || file.split('/').some(p => !p || p === '.' || p === '..')) : path.basename(file) !== file) throw Error('Invalid dossier source path');
      const bytes = fs.readFileSync(path.join(modern ? root : source, file));
      const hash = crypto.createHash('sha256').update(bytes).digest('hex');
      if (report.sourceSha256?.[file] !== hash || !bytes.equals(fs.readFileSync(path.join(folder, 'sources', file)))) {
        throw Error('Stale dossier source: ' + file);
      }
    }
    for (const file of ['THE-WITNESS-Design-Compendium.html', 'THE-WITNESS-v3-Pitch.html']) {
      if (!fs.statSync(path.join(folder, file)).isFile()) throw Error('Missing reader: ' + file);
    }
  } catch (e) { throw Error(e.message + '. ' + guidance); }
  return folder;
}
module.exports = { prepareOutput, verifiedDossier };
