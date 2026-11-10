'use strict';

// Behavioral tests in disposable Git repositories; never mutate this checkout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { inspect } = require('../tools/check-agent-governance.cjs');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'witness-governance-'));
let checks = 0;
const write = (root, p, text) => {
  const file = path.join(root, p);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};
function fixture(name) {
  const root = path.join(base, name);
  fs.mkdirSync(root);
  execFileSync('git', ['init', '--quiet', root], { windowsHide: true });
  const registry = {
    version: 1, rootFiles: ['AGENTS.md', '.gitignore'],
    groups: [
      { prefix: 'docs/', owner: 'docs', kind: 'source', admission: true, reason: 'Guidance' },
      { prefix: '.agents/', owner: 'agent', kind: 'source', admission: true, reason: 'Skills' },
      { prefix: 'outputs/', owner: 'build', kind: 'generated', admission: false, reason: 'Disposable output' }
    ],
    knownFiles: ['AGENTS.md', '.gitignore', 'docs/agent/registry.json', 'docs/canonical.json', 'docs/mirror.json', '.agents/skills/example/SKILL.md'],
    admissions: [], requiredFiles: ['AGENTS.md'],
    linkDocuments: ['AGENTS.md'], skills: ['.agents/skills/example/SKILL.md'],
    mirrors: [{ source: 'docs/canonical.json', target: 'docs/mirror.json' }]
  };
  write(root, 'AGENTS.md', '[Source](docs/canonical.json)\n');
  write(root, '.gitignore', 'outputs/temp/\n');
  write(root, 'docs/canonical.json', '{"version":1}\n');
  write(root, 'docs/mirror.json', '{"version":1}\n');
  write(root, '.agents/skills/example/SKILL.md', '---\nname: example\ndescription: A fixture skill.\n---\nUse source.\n');
  const save = () => write(root, 'docs/agent/registry.json', JSON.stringify(registry));
  save();
  return { root, registry, save };
}
const expectCode = (f, code) => assert(inspect(f.root).errors.some(e => e.code === code), 'Expected ' + code);
function test(name, run) { run(); checks++; console.log('PASS ' + name); }
try {
  test('valid registry is read-only and accepts governed files', () => {
    const f = fixture('valid');
    const before = fs.readFileSync(path.join(f.root, 'docs/agent/registry.json'));
    assert.deepEqual(inspect(f.root).errors, []);
    assert(fs.readFileSync(path.join(f.root, 'docs/agent/registry.json')).equals(before));
  });
  test('untracked root file and nested source require registration', () => {
    const f = fixture('new');
    write(f.root, 'final2.md', 'No admission');
    write(f.root, 'docs/unplanned.md', 'No admission');
    expectCode(f, 'ROOT_FILE'); expectCode(f, 'NEW_SOURCE');
  });
  test('admission requires purpose and owner, then permits a useful source', () => {
    const f = fixture('admit');
    write(f.root, 'docs/new.md', 'A useful source');
    f.registry.admissions.push({ path: 'docs/new.md', owner: 'docs', reason: '' }); f.save();
    expectCode(f, 'ADMISSION');
    f.registry.admissions[0].reason = 'Own a new contract'; f.save();
    assert.deepEqual(inspect(f.root).errors, []);
  });
  test('contract mirror drift and broken guidance links are rejected', () => {
    const f = fixture('drift');
    write(f.root, 'docs/mirror.json', '{"version":2}');
    write(f.root, 'AGENTS.md', '[Missing](docs/missing.md)\n');
    expectCode(f, 'MIRROR'); expectCode(f, 'LINK');
  });
  test('required source deletion and invalid skill metadata are rejected', () => {
    const f = fixture('missing');
    fs.unlinkSync(path.join(f.root, 'AGENTS.md'));
    write(f.root, '.agents/skills/example/SKILL.md', '---\nname: wrong\n---\n');
    expectCode(f, 'REQUIRED'); expectCode(f, 'SKILL');
  });
  test('unsafe registry paths and unknown directories cannot be admitted silently', () => {
    const f = fixture('escape');
    f.registry.requiredFiles.push('../outside.json'); f.save();
    write(f.root, 'another-project/file.md', 'Unexpected directory');
    expectCode(f, 'REQUIRED');
    f.registry.requiredFiles.pop(); f.save();
    expectCode(f, 'GROUP');
  });
  test('generated and ignored scratch outputs do not need source admissions', () => {
    const f = fixture('generated');
    write(f.root, 'outputs/report.json', '{}');
    write(f.root, 'outputs/temp/scratch.md', 'Ignored');
    assert.deepEqual(inspect(f.root).errors, []);
    const inventory = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: f.root, encoding: 'utf8', windowsHide: true });
    assert(!inventory.includes('scratch.md'));
  });
  test('tracked staged additions are checked as well as untracked additions', () => {
    const f = fixture('staged');
    write(f.root, 'docs/staged.md', 'Not admitted');
    execFileSync('git', ['-c', 'core.autocrlf=false', 'add', '.'], { cwd: f.root, windowsHide: true });
    expectCode(f, 'NEW_SOURCE');
  });
  test('existing parent symlink cannot route guidance outside the checkout', () => {
    const f = fixture('symlink');
    const outside = path.join(base, 'outside'); fs.mkdirSync(outside);
    write(outside, 'data.json', '{}');
    fs.symlinkSync(outside, path.join(f.root, 'docs/external'), process.platform === 'win32' ? 'junction' : 'dir');
    f.registry.requiredFiles.push('docs/external/data.json'); f.save();
    expectCode(f, 'REQUIRED');
  });
  test('new skills and governed docs must participate in validation', () => {
    const f = fixture('coverage');
    write(f.root, '.agents/skills/other/SKILL.md', 'A skill not in the skill list');
    write(f.root, 'docs/agent/extra.md', 'A document not in link checks');
    expectCode(f, 'SKILL'); expectCode(f, 'LINK_DOCUMENTS');
  });
  test('CLI returns failure for drift and rejects unknown or incomplete options', () => {
    const f = fixture('cli');
    const script = path.resolve(__dirname, '../tools/check-agent-governance.cjs');
    const run = args => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', windowsHide: true });
    assert.equal(run(['--root', f.root, '--json']).status, 0);
    write(f.root, 'docs/mirror.json', '{}');
    const drift = run(['--root', f.root, '--json']);
    assert.equal(drift.status, 1); assert(JSON.parse(drift.stdout).errors.some(e => e.code === 'MIRROR'));
    assert.equal(run(['--unknown']).status, 2);
    assert.equal(run(['--root']).status, 2);
  });
  test('retirement ledger records missing baseline sources and prevents their recreation', () => {
    const f = fixture('retirement');
    f.registry.retirementLedger = 'docs/agent/retired.json';
    f.registry.knownFiles.push('docs/old.md', 'docs/agent/retired.json');
    f.save();
    write(f.root, 'docs/agent/retired.json', JSON.stringify({ version: 1, entries: [{ path: 'docs/old.md', action: 'remove', reason: 'Replaced by canonical source', sha256: '0'.repeat(64), gitObject: '0'.repeat(40), forbidRecreation: true }] }));
    assert.deepEqual(inspect(f.root).errors, []);
    assert.deepEqual(inspect(f.root).warnings, []);
    write(f.root, 'docs/old.md', 'A duplicate source recreated');
    expectCode(f, 'RETIRED_PRESENT');
  });
  test('archived source must have its preserved replacement', () => {
    const f = fixture('archive');
    f.registry.retirementLedger = 'docs/agent/retired.json';
    f.registry.knownFiles.push('docs/agent/retired.json'); f.save();
    write(f.root, 'docs/agent/retired.json', JSON.stringify({ version: 1, entries: [{ path: 'docs/old.md', replacement: 'docs/archive/old.md', action: 'archive', reason: 'Historical source', sha256: '0'.repeat(64), gitObject: '0'.repeat(40) }] }));
    expectCode(f, 'RETIREMENT');
  });
  console.log(JSON.stringify({ status: 'passed', checks, scope: 'governance-checker-in-isolated-repositories' }));
} finally {
  const resolved = fs.realpathSync(base);
  const intended = path.resolve(os.tmpdir()) + path.sep;
  if (!resolved.startsWith(intended) || !path.basename(resolved).startsWith('witness-governance-')) throw Error('Unsafe fixture cleanup path');
  fs.rmSync(resolved, { recursive: true, force: true });
}
