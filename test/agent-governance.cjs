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
function knowledgeFixture(name) {
  const f = fixture(name);
  write(f.root, 'docs/core.md', '# Core\n<a id="entry"></a>\nCanonical guidance.\n');
  write(f.root, 'docs/check.cjs', '// fixture checker\n');
  write(f.root, '.agents/skills/example/SKILL.md', '---\nname: example\ndescription: A fixture skill.\n---\nRead [core](../../../docs/core.md#entry).\n');
  f.registry.version = 2;
  f.registry.knownFiles.push('docs/core.md', 'docs/check.cjs');
  f.registry.requiredFiles.push('docs/core.md');
  f.registry.knowledge = {
    version: 2, coreDocuments: ['docs/core.md'],
    roles: [{ path: 'docs/core.md', role: 'canonical', owner: 'engineering', value: 'Own the fixture contract' }],
    domains: [{ id: 'engineering', authority: 'docs/core.md#entry' }], evaluation: [],
    tasks: [{ id: 'change', skill: '.agents/skills/example/SKILL.md', required: ['docs/core.md#entry'], details: ['docs/core.md'], implementation: ['docs/check.cjs'], checks: [{ command: 'node docs/check.cjs', when: 'fixture change' }], updates: ['docs/core.md'] }],
    handoffs: []
  };
  f.save(); return f;
}
function handoffFixture(name) {
  const f = knowledgeFixture(name);
  write(f.root, 'docs/story.md', '# Story\n<a id="ownership"></a>\nStory ownership.\n');
  write(f.root, 'docs/screenplay.md', '# Screenplay\nScreenplay blocking.\n');
  write(f.root, 'docs/env.md', '# Environment\nEnvironment standards.\n');
  write(f.root, 'docs/save.md', '# Save\n<a id="save"></a>\nSave specs.\n');
  write(f.root, 'docs/check-arch.cjs', '// arch check\n');
  write(f.root, '.agents/skills/env/SKILL.md', '---\nname: env\ndescription: Environment skill.\n---\nRead [core](../../../docs/core.md#entry).\nH01 (q01-geometry) handoff available.\n');
  write(f.root, '.agents/skills/content/SKILL.md', '---\nname: content\ndescription: Content skill.\n---\nRead [core](../../../docs/core.md#entry).\nH02 (q01-gameplay) handoff available.\n');

  f.registry.skills.push('.agents/skills/env/SKILL.md', '.agents/skills/content/SKILL.md');
  f.registry.knownFiles.push(
    'docs/story.md', 'docs/screenplay.md', 'docs/env.md', 'docs/save.md', 'docs/check-arch.cjs',
    '.agents/skills/env/SKILL.md', '.agents/skills/content/SKILL.md'
  );
  f.registry.knowledge.roles.push(
    { path: 'docs/story.md', role: 'specification', owner: 'story', value: 'Story spec' },
    { path: 'docs/screenplay.md', role: 'specification', owner: 'content', value: 'Screenplay spec' },
    { path: 'docs/env.md', role: 'specification', owner: 'environment', value: 'Environment spec' },
    { path: 'docs/save.md', role: 'specification', owner: 'engineering', value: 'Save spec' }
  );
  f.registry.knowledge.tasks.push(
    { id: 'environment', skill: '.agents/skills/env/SKILL.md', required: ['docs/core.md#entry'], details: ['docs/core.md'], implementation: ['docs/check.cjs'], checks: [{ command: 'node docs/check.cjs', when: 'env change' }], updates: ['docs/core.md'] },
    { id: 'content', skill: '.agents/skills/content/SKILL.md', required: ['docs/core.md#entry'], details: ['docs/core.md'], implementation: ['docs/check.cjs'], checks: [{ command: 'node docs/check.cjs', when: 'content change' }], updates: ['docs/core.md'] }
  );
  f.registry.knowledge.handoffs = [
    {
      id: 'H01',
      trigger: 'q01-geometry',
      primaryTask: 'environment',
      partnerTasks: ['content', 'change'],
      when: 'geometry change',
      required: [
        'docs/story.md#ownership',
        'docs/screenplay.md',
        'docs/env.md',
        'docs/save.md#save'
      ],
      implementation: ['docs/check.cjs'],
      checks: [{ command: 'node docs/check-arch.cjs', when: 'test geometry' }],
      updates: ['docs/core.md'],
      requiredOwners: ['story', 'content', 'environment', 'engineering']
    }
  ];
  f.save();
  return f;
}
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
  test('knowledge routes return the same direct reading map used by skills', () => {
    const f = knowledgeFixture('knowledge'); assert.deepEqual(inspect(f.root).errors, []);
    const result = spawnSync(process.execPath, [path.resolve(__dirname, '../tools/check-agent-governance.cjs'), '--root', f.root, '--task', 'change', '--json'], { encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0); assert.deepEqual(JSON.parse(result.stdout).context.required, ['docs/core.md#entry']);
  });
  test('a skill cannot silently omit its required source or refer to a missing anchor', () => {
    const f = knowledgeFixture('read-route');
    f.registry.knowledge.tasks[0].required = ['docs/core.md#missing']; f.save();
    expectCode(f, 'ROUTE_READ'); expectCode(f, 'ROUTE_REF');
  });
  test('duplicate authority and orphan documentation are rejected', () => {
    const f = knowledgeFixture('authority');
    f.registry.knowledge.domains.push({ id: 'other', authority: 'docs/core.md#entry' });
    f.registry.admissions.push({ path: 'docs/orphan.md', owner: 'docs', reason: 'Missing role on purpose' });
    write(f.root, 'docs/orphan.md', '# Unrouted document'); f.save();
    expectCode(f, 'AUTHORITY'); expectCode(f, 'DOC_COVERAGE');
  });
  test('a route needs update targets and checks that actually exist', () => {
    const f = knowledgeFixture('route-actions');
    f.registry.knowledge.tasks[0].updates = []; f.save(); expectCode(f, 'TASK');
    f.registry.knowledge.tasks[0].updates = ['docs/core.md'];
    f.registry.knowledge.tasks[0].checks = [{ command: 'node docs/missing.cjs', when: 'change' }]; f.save();
    expectCode(f, 'CHECK_COMMAND');
  });

  const repoRoot = path.resolve(__dirname, '..');
  const cliScript = path.resolve(__dirname, '../tools/check-agent-governance.cjs');
  const runCli = args => spawnSync(process.execPath, [cliScript, ...args], { encoding: 'utf8', windowsHide: true });

  // Nhóm test dương tính
  test('1. registry with five valid handoffs is accepted', () => {
    const report = inspect(repoRoot);
    assert.deepEqual(report.errors, []);
    const reg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/agent/registry.json'), 'utf8'));
    assert.equal(reg.knowledge?.handoffs?.length, 5);
  });
  test('2. CLI without handoff preserves legacy output', () => {
    const res = runCli(['--root', repoRoot, '--task', 'content', '--json']);
    assert.equal(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert.equal(data.context.id, 'content');
    assert.equal(data.handoff, undefined);
  });
  test('3. CLI H01 returns environment context with story/content/engineering sources', () => {
    const res = runCli(['--root', repoRoot, '--task', 'environment', '--handoff', 'H01', '--json']);
    assert.equal(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert.equal(data.handoff.id, 'H01');
    assert(data.readingOrder.includes('docs/the-witness/03-narrative-bible.md'));
    assert(data.readingOrder.includes('docs/the-witness/07-vertical-slice-screenplay.md'));
    assert(data.readingOrder.includes('docs/ENGINEERING.md#save'));
  });
  test('4. CLI H02 preserves canon/continuity requirements', () => {
    const res = runCli(['--root', repoRoot, '--task', 'content', '--handoff', 'H02', '--json']);
    assert.equal(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert.equal(data.handoff.id, 'H02');
    assert(data.readingOrder.includes('docs/the-witness/12-continuity-and-state.md'));
    assert(data.readingOrder.includes('docs/PRODUCT.md#invariants'));
  });
  test('5. CLI H03 includes restore/cloud/backend consumers', () => {
    const res = runCli(['--root', repoRoot, '--task', 'change', '--handoff', 'H03', '--json']);
    assert.equal(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert.equal(data.handoff.id, 'H03');
    assert(data.implementation.includes('witness-cloud.js'));
    assert(data.implementation.includes('test/backend.test.mjs'));
    assert(data.implementation.includes('server/api.mjs'));
  });
  test('6. CLI H04 includes GI/asset/offline checks', () => {
    const res = runCli(['--root', repoRoot, '--task', 'environment', '--handoff', 'H04', '--json']);
    assert.equal(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert.equal(data.handoff.id, 'H04');
    assert(data.checks.some(c => c.command === 'npm run test:graphics'));
    assert(data.checks.some(c => c.command === 'npm run test:kit-cache'));
    assert(data.checks.some(c => c.command === 'npm run test:kit-lifecycle'));
  });
  test('7. CLI H05 has candidate and release check conditions', () => {
    const res = runCli(['--root', repoRoot, '--task', 'release', '--handoff', 'H05', '--json']);
    assert.equal(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert.equal(data.handoff.id, 'H05');
    assert(data.checks.some(c => c.command === 'npm run test:build-output'));
    assert(data.checks.some(c => c.command === 'npm run test:architecture-browser'));
    assert(data.checks.some(c => c.command === 'npm run test:backend'));
  });
  test('8. --json has deterministic deduplicated reading order', () => {
    const res = runCli(['--root', repoRoot, '--task', 'environment', '--handoff', 'H01', '--json']);
    assert.equal(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert(Array.isArray(data.readingOrder));
    assert.equal(new Set(data.readingOrder).size, data.readingOrder.length);
  });
  test('9. checker does not modify registry or working tree', () => {
    const regFile = path.join(repoRoot, 'docs/agent/registry.json');
    const before = fs.readFileSync(regFile);
    inspect(repoRoot);
    const after = fs.readFileSync(regFile);
    assert(before.equals(after));
  });

  // Nhóm test âm tính bắt buộc
  test('10. duplicate H01 is rejected', () => {
    const f = handoffFixture('dup-h01');
    f.registry.knowledge.handoffs.push({ ...f.registry.knowledge.handoffs[0] });
    f.save();
    expectCode(f, 'HANDOFF_DUPLICATE');
  });
  test('11. duplicate trigger is rejected', () => {
    const f = handoffFixture('dup-trigger');
    f.registry.knowledge.handoffs.push({ ...f.registry.knowledge.handoffs[0], id: 'H02' });
    f.save();
    expectCode(f, 'HANDOFF_DUPLICATE');
  });
  test('12. unknown primary task is rejected', () => {
    const f = handoffFixture('bad-primary');
    f.registry.knowledge.handoffs[0].primaryTask = 'unknown-task';
    f.save();
    expectCode(f, 'HANDOFF_TASK');
  });
  test('13. partner task cannot be primary or unknown', () => {
    const f = handoffFixture('bad-partner');
    f.registry.knowledge.handoffs[0].partnerTasks = ['environment'];
    f.save();
    expectCode(f, 'HANDOFF_TASK');
  });
  test('14. missing file or anchor in required is rejected', () => {
    const f = handoffFixture('missing-req');
    f.registry.knowledge.handoffs[0].required = ['docs/missing.md'];
    f.save();
    expectCode(f, 'HANDOFF_REF');
  });
  test('15. missing required owner is rejected', () => {
    const f = handoffFixture('missing-owner');
    f.registry.knowledge.handoffs[0].requiredOwners.push('nonexistent');
    f.save();
    expectCode(f, 'HANDOFF_OWNER');
    f.registry.knowledge.handoffs[0].requiredOwners = ['story', 'content', 'environment', 'engineering', 'status'];
    f.save();
    expectCode(f, 'HANDOFF_OWNER');
  });
  test('16. missing implementation file is rejected', () => {
    const f = handoffFixture('missing-impl');
    f.registry.knowledge.handoffs[0].implementation = ['docs/missing.js'];
    f.save();
    expectCode(f, 'HANDOFF_IMPL');
  });
  test('17. unsupported or missing check command is rejected', () => {
    const f = handoffFixture('bad-check');
    f.registry.knowledge.handoffs[0].checks = [{ command: 'node docs/missing.cjs', when: 'change' }];
    f.save();
    expectCode(f, 'HANDOFF_CHECK');
  });
  test('18. primary skill missing handoff declaration is rejected', () => {
    const f = handoffFixture('missing-route');
    write(f.root, '.agents/skills/env/SKILL.md', '---\nname: env\ndescription: Env skill.\n---\nRead [core](../../../docs/core.md#entry).\n');
    expectCode(f, 'HANDOFF_ROUTE');
  });
  test('19. CLI mismatch between handoff and primary task returns exit code 1', () => {
    const res = runCli(['--root', repoRoot, '--task', 'content', '--handoff', 'H01', '--json']);
    assert.equal(res.status, 1);
    assert(JSON.parse(res.stdout).errors.some(e => e.code === 'HANDOFF_MISMATCH'));
  });
  test('20. CLI unknown handoff returns exit code 1', () => {
    const res = runCli(['--root', repoRoot, '--task', 'content', '--handoff', 'H99', '--json']);
    assert.equal(res.status, 1);
    assert(JSON.parse(res.stdout).errors.some(e => e.code === 'HANDOFF_UNKNOWN'));
  });
  test('21. CLI with --handoff but missing --task returns exit code 2', () => {
    const res = runCli(['--handoff', 'H01']);
    assert.equal(res.status, 2);
  });
  test('22. handoffs retain core contract references', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/agent/registry.json'), 'utf8'));
    const h1 = reg.knowledge.handoffs.find(h => h.id === 'H01');
    const h2 = reg.knowledge.handoffs.find(h => h.id === 'H02');
    const h3 = reg.knowledge.handoffs.find(h => h.id === 'H03');
    const h4 = reg.knowledge.handoffs.find(h => h.id === 'H04');
    const h5 = reg.knowledge.handoffs.find(h => h.id === 'H05');
    assert(h1.required.includes('docs/the-witness/03-narrative-bible.md'));
    assert(h1.required.includes('docs/the-witness/07-vertical-slice-screenplay.md'));
    assert(h2.required.includes('docs/the-witness/12-continuity-and-state.md'));
    assert(h2.required.includes('docs/environment-kit/standards.md'));
    assert(h3.required.includes('docs/the-witness/23-backend-and-cloud-saves.md'));
    assert(h3.implementation.includes('witness-cloud.js'));
    assert(h4.checks.some(c => c.command === 'npm run test:graphics'));
    assert(h5.checks.some(c => c.command === 'npm run test:build-output'));
  });
  console.log(JSON.stringify({ status: 'passed', checks, scope: 'governance-checker-in-isolated-repositories' }));
} finally {
  const resolved = fs.realpathSync(base);
  const intended = path.resolve(os.tmpdir()) + path.sep;
  if (!resolved.startsWith(intended) || !path.basename(resolved).startsWith('witness-governance-')) throw Error('Unsafe fixture cleanup path');
  fs.rmSync(resolved, { recursive: true, force: true });
}
