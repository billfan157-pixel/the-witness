'use strict';

// Read-only repository admission/link/mirror checks. No network, builds or fixes.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function inspect(root) {
  root = fs.realpathSync(root);
  const errors = [];
  const warnings = [];
  const fail = (code, detail) => errors.push({ code, detail });
  const validPath = p => typeof p === 'string' && p.length > 0 &&
    !p.includes('\\') && !p.includes('\0') && !p.includes(':') &&
    !path.posix.isAbsolute(p) && p.split('/').every(x => x && x !== '.' && x !== '..');
  const resolve = p => {
    if (!validPath(p)) throw Error('Unsafe repository path: ' + p);
    const absolute = path.resolve(root, ...p.split('/'));
    // Check the nearest existing ancestor as well, so missing descendants cannot
    // escape the checkout through a parent symlink/junction.
    let ancestor = absolute;
    while (!fs.existsSync(ancestor) && ancestor !== root) ancestor = path.dirname(ancestor);
    const real = fs.realpathSync(ancestor);
    if (real !== root && !real.startsWith(root + path.sep)) throw Error('Path escapes repository: ' + p);
    return absolute;
  };
  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(resolve('docs/agent/registry.json'), 'utf8'));
  } catch (e) {
    fail('REGISTRY', e.message);
    return { errors, warnings, checkedFiles: 0 };
  }
  if (registry.version !== 1) fail('SCHEMA', 'Unsupported registry version');
  const arrays = ['rootFiles', 'groups', 'knownFiles', 'admissions', 'requiredFiles', 'skills', 'mirrors', 'linkDocuments'];
  for (const key of arrays) {
    if (!Array.isArray(registry[key])) fail('SCHEMA', key + ' must be an array');
  }
  if (errors.length) return { errors, warnings, checkedFiles: 0 };
  const uniquePaths = (items, field, code) => {
    const seen = new Set();
    for (const item of items) {
      const p = field ? item?.[field] : item;
      if (!validPath(p)) { fail(code, 'Invalid path: ' + p); continue; }
      if (seen.has(p)) fail(code, 'Duplicate: ' + p);
      seen.add(p);
    }
    return seen;
  };
  const roots = uniquePaths(registry.rootFiles, null, 'ROOT_REGISTRY');
  const known = uniquePaths(registry.knownFiles, null, 'KNOWN_FILES');
  const admitted = uniquePaths(registry.admissions, 'path', 'ADMISSION');
  const required = uniquePaths(registry.requiredFiles, null, 'REQUIRED');
  uniquePaths(registry.linkDocuments, null, 'LINK_DOCUMENTS');
  const retired = new Set();
  if (registry.retirementLedger) {
    try {
      const ledger = JSON.parse(fs.readFileSync(resolve(registry.retirementLedger), 'utf8'));
      if (ledger.version !== 1 || !Array.isArray(ledger.entries)) throw Error('Invalid retirement ledger');
      for (const row of ledger.entries) {
        if (!validPath(row.path) || retired.has(row.path) || !['remove', 'archive'].includes(row.action) ||
            !row.reason?.trim() || !/^[0-9a-f]{64}$/.test(row.sha256) || !/^[0-9a-f]{40}$/.test(row.gitObject)) throw Error('Invalid retirement entry: ' + row.path);
        retired.add(row.path);
        if (row.forbidRecreation && fs.existsSync(resolve(row.path))) fail('RETIRED_PRESENT', 'Retired source was recreated: ' + row.path);
        if (row.action === 'archive' && (!validPath(row.replacement) || !fs.existsSync(resolve(row.replacement)))) fail('RETIREMENT', 'Missing archived replacement for ' + row.path);
      }
    } catch (e) { fail('RETIREMENT', e.message); }
  }
  const groupNames = new Set();
  for (const g of registry.groups) {
    if (!g || typeof g.prefix !== 'string' || !g.prefix.endsWith('/') ||
        !validPath(g.prefix.slice(0, -1)) || !g.owner?.trim() || !g.kind?.trim() ||
        typeof g.admission !== 'boolean' || !g.reason?.trim()) {
      fail('GROUP', 'Group needs safe prefix, owner, kind, admission and reason');
      continue;
    }
    if (groupNames.has(g.prefix)) fail('GROUP', 'Duplicate prefix: ' + g.prefix);
    groupNames.add(g.prefix);
  }
  if (errors.length) return { errors, warnings, checkedFiles: 0 };
  const groups = [...registry.groups].sort((a, b) => b.prefix.length - a.prefix.length);
  const groupFor = p => groups.find(g => p.startsWith(g.prefix));
  const checkExists = (p, code) => {
    try {
      if (!fs.statSync(resolve(p)).isFile()) fail(code, p + ' is not a regular file');
    } catch (e) { fail(code, p + ': ' + e.message); }
  };
  for (const p of required) checkExists(p, 'REQUIRED');
  for (const a of registry.admissions) {
    if (!a.owner?.trim() || !a.reason?.trim()) fail('ADMISSION', a.path + ' needs owner and reason');
    if (known.has(a.path)) fail('ADMISSION', a.path + ' already belongs to baseline; do not duplicate');
    checkExists(a.path, 'ADMISSION');
    if (validPath(a.path) && !a.path.includes('/') && !roots.has(a.path)) fail('ROOT_FILE', a.path + ' must also be in rootFiles');
  }
  let files;
  try {
    files = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024 }).split('\0').filter(Boolean))].sort();
  } catch (e) {
    fail('INVENTORY', 'Cannot read Git inventory: ' + e.message);
    return { errors, warnings, checkedFiles: 0 };
  }
  for (const p of files) {
    if (!validPath(p)) { fail('PATH', 'Invalid Git path: ' + p); continue; }
    try {
      const absolute = resolve(p);
      // Deleted tracked paths are still in Git's index. Required/consumer checks
      // above catch critical removals; general removal review remains human work.
      if (!fs.existsSync(absolute)) continue;
      if (!fs.statSync(absolute).isFile()) { fail('PATH', 'Not a regular file: ' + p); continue; }
    } catch (e) { fail('PATH', e.message); continue; }
    const group = groupFor(p);
    if (p.startsWith('.agents/skills/') && p.endsWith('/SKILL.md') && !registry.skills.includes(p)) {
      fail('SKILL', 'Skill is missing from skills registry: ' + p);
    }
    if (p.startsWith('docs/agent/') && p.endsWith('.md') && !registry.linkDocuments.includes(p)) {
      fail('LINK_DOCUMENTS', 'Governed document is missing from linkDocuments: ' + p);
    }
    if (!p.includes('/')) {
      if (!roots.has(p)) fail('ROOT_FILE', 'Unregistered root file: ' + p);
      if (!known.has(p) && !admitted.has(p)) fail('NEW_SOURCE', 'Missing admission: ' + p);
    } else if (!group) fail('GROUP', 'No registered group for ' + p);
    else if (group.admission && !known.has(p) && !admitted.has(p)) fail('NEW_SOURCE', 'Missing admission: ' + p);
  }
  for (const pair of registry.mirrors) {
    try {
      if (!validPath(pair.source) || !validPath(pair.target)) throw Error('Invalid mirror path');
      const source = fs.readFileSync(resolve(pair.source));
      const target = fs.readFileSync(resolve(pair.target));
      JSON.parse(source.toString('utf8')); JSON.parse(target.toString('utf8'));
      if (!source.equals(target)) fail('MIRROR', pair.target + ' differs from ' + pair.source);
    } catch (e) { fail('MIRROR', e.message); }
  }
  const skillNames = new Set();
  for (const p of registry.skills) {
    try {
      const content = fs.readFileSync(resolve(p), 'utf8');
      const front = /^---\r?\n([\s\S]+?)\r?\n---(?:\r?\n|$)/.exec(content)?.[1];
      const name = /^name:\s*([a-z0-9-]+)\s*$/m.exec(front || '')?.[1];
      const description = /^description:\s*(\S[^\r\n]*)$/m.exec(front || '')?.[1];
      if (!name || name.length > 64 || name !== path.posix.basename(path.posix.dirname(p)) || !description) {
        fail('SKILL', p + ' needs matching name and a one-line description');
      }
      if (skillNames.has(name)) fail('SKILL', 'Duplicate skill name: ' + name);
      skillNames.add(name);
      if (/<(?:TODO|TBD)>|\[TODO(?:[:\]])/i.test(content)) fail('SKILL', 'Unfinished scaffold: ' + p);
    } catch (e) { fail('SKILL', p + ': ' + e.message); }
  }
  for (const p of registry.linkDocuments) {
    try {
      const content = fs.readFileSync(resolve(p), 'utf8');
      // The governed docs use inline Markdown links. Anchor meaning and legacy
      // Bible links are deliberately outside this file-existence check.
      for (const match of content.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
        const raw = match[1].replace(/^<|>$/g, '');
        if (/^(?:https?:|mailto:|#)/i.test(raw)) continue;
        if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) { fail('LINK', p + ' has unsupported link: ' + raw); continue; }
        const target = decodeURIComponent(raw.split(/[?#]/)[0]);
        if (!target) continue;
        if (path.posix.isAbsolute(target) || target.includes('\\')) { fail('LINK', p + ' has non-relative link: ' + raw); continue; }
        const relative = path.posix.normalize(path.posix.join(path.posix.dirname(p), target));
        if (!validPath(relative)) { fail('LINK', p + ' points outside repository: ' + raw); continue; }
        try {
          if (!fs.existsSync(resolve(relative))) fail('LINK', p + ' -> ' + raw);
        } catch (e) { fail('LINK', p + ': ' + e.message); }
      }
    } catch (e) { fail('LINK', p + ': ' + e.message); }
  }
  const present = new Set(files);
  for (const p of known) if (!present.has(p) && !retired.has(p)) warnings.push({ code: 'BASELINE_REMOVED', detail: p + ' no longer in Git inventory; review consumers before pruning registry' });
  return { errors, warnings, checkedFiles: files.length, skills: registry.skills.length, mirrors: registry.mirrors.length };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let requestedRoot;
  let invalid = false;
  let json = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json' && !json) json = true;
    else if (args[i] === '--root' && requestedRoot === undefined && args[i + 1] && !args[i + 1].startsWith('--')) requestedRoot = args[++i];
    else invalid = true;
  }
  if (invalid) {
    console.error('Usage: node tools/check-agent-governance.cjs [--root PATH] [--json]');
    process.exitCode = 2;
  } else {
    let report;
    try { report = inspect(requestedRoot === undefined ? path.resolve(__dirname, '..') : requestedRoot); }
    catch (e) { report = { errors: [{ code: 'CHECKER', detail: e.message }], warnings: [], checkedFiles: 0 }; }
    if (json) console.log(JSON.stringify(report, null, 2));
    else {
      for (const issue of report.errors) console.error('FAIL [' + issue.code + '] ' + issue.detail);
      for (const issue of report.warnings) console.warn('WARN [' + issue.code + '] ' + issue.detail);
      console.log(`${report.errors.length ? 'FAIL' : 'PASS'} agent governance: ${report.checkedFiles} files, ${report.skills || 0} skills, ${report.mirrors || 0} mirrors; ${report.errors.length} errors, ${report.warnings.length} warnings`);
    }
    process.exitCode = report.errors.length ? 1 : 0;
  }
}

module.exports = { inspect };
