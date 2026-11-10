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
  if (![1, 2].includes(registry.version)) fail('SCHEMA', 'Unsupported registry version');
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
  if (registry.version === 2) {
    const map = registry.knowledge;
    if (!map || map.version !== 2 || !['coreDocuments', 'roles', 'tasks', 'domains', 'evaluation'].every(k => Array.isArray(map[k]))) {
      fail('KNOWLEDGE', 'Registry v2 requires a complete knowledge map');
    } else {
      const roles = new Map();
      const allowedRoles = new Set(['canonical', 'specification', 'research', 'index']);
      for (const row of map.roles) {
        if (!validPath(row.path) || !allowedRoles.has(row.role) || !row.owner?.trim() || !row.value?.trim()) {
          fail('DOC_ROLE', 'Document needs path, role, owner and retained value'); continue;
        }
        if (roles.has(row.path)) fail('DOC_ROLE', 'Ambiguous role: ' + row.path);
        roles.set(row.path, row);
        checkExists(row.path, 'DOC_ROLE');
      }
      const checkReference = (ref, code) => {
        if (typeof ref !== 'string') { fail(code, 'Reference must be a string'); return; }
        const [file, anchor] = ref.split('#');
        if (!roles.has(file)) { fail(code, 'Unclassified documentation reference: ' + ref); return; }
        try {
          const body = fs.readFileSync(resolve(file), 'utf8');
          if (anchor && !body.includes('id="' + anchor + '"')) fail(code, 'Missing explicit anchor: ' + ref);
        } catch (e) { fail(code, ref + ': ' + e.message); }
      };
      for (const p of map.coreDocuments) {
        if (roles.get(p)?.role !== 'canonical') fail('CORE', p + ' is not canonical');
        if (!required.has(p)) fail('CORE', p + ' is not required');
      }
      for (const row of roles.values()) if (row.role === 'canonical' && !map.coreDocuments.includes(row.path)) fail('CORE', 'Undeclared core: ' + row.path);
      const domainIds = new Set(), authorities = new Set();
      for (const domain of map.domains) {
        if (!domain.id || domainIds.has(domain.id)) fail('AUTHORITY', 'Duplicate/missing domain');
        if (authorities.has(domain.authority)) fail('AUTHORITY', 'Conflicting ownership: ' + domain.authority);
        domainIds.add(domain.id); authorities.add(domain.authority); checkReference(domain.authority, 'AUTHORITY');
      }
      const taskIds = new Set(), routedSkills = new Set(), reached = new Set(['docs/README.md']);
      for (const task of map.tasks) {
        if (!/^[a-z0-9-]+$/.test(task.id || '') || taskIds.has(task.id)) fail('TASK', 'Duplicate/invalid task: ' + task.id);
        taskIds.add(task.id);
        if (!registry.skills.includes(task.skill) || routedSkills.has(task.skill)) fail('TASK', 'Missing/duplicate skill route: ' + task.skill);
        routedSkills.add(task.skill);
        if (!['required', 'details', 'implementation', 'checks', 'updates'].every(k => Array.isArray(task[k]) && task[k].length)) {
          fail('TASK', task.id + ' requires reading, implementation, checks and updates'); continue;
        }
        let skillLinks = [];
        try {
          skillLinks = [...fs.readFileSync(resolve(task.skill), 'utf8').matchAll(/\]\(([^)]+)\)/g)].map(m => {
            const [file, anchor] = m[1].split('#');
            return path.posix.normalize(path.posix.join(path.posix.dirname(task.skill), file)) + (anchor ? '#' + anchor : '');
          });
        } catch (e) { fail('TASK', e.message); }
        for (const ref of task.required) if (!skillLinks.includes(ref)) fail('ROUTE_READ', task.skill + ' must directly link ' + ref);
        for (const ref of [...task.required, ...task.details, ...task.updates]) {
          checkReference(ref, 'ROUTE_REF'); reached.add(ref.split('#')[0]);
        }
        for (const p of task.implementation) checkExists(p, 'IMPLEMENTATION');
        for (const check of task.checks) {
          if (!check.command?.trim() || !check.when?.trim()) { fail('CHECK_COMMAND', task.id + ' requires command and condition'); continue; }
          const npm = /^npm (?:run ([\w:.-]+)|(test))$/.exec(check.command);
          const script = /^(?:node|python) ([\w./-]+)(?:\s|$)/.exec(check.command);
          if (npm) {
            try { if (!JSON.parse(fs.readFileSync(resolve('package.json'), 'utf8')).scripts?.[npm[1] || npm[2]]) fail('CHECK_COMMAND', 'Missing npm script: ' + check.command); }
            catch (e) { fail('CHECK_COMMAND', e.message); }
          } else if (script) checkExists(script[1], 'CHECK_COMMAND');
          else fail('CHECK_COMMAND', 'Unsupported check command: ' + check.command);
        }
      }
      for (const p of registry.skills) if (!routedSkills.has(p)) fail('TASK', 'Unrouted skill: ' + p);
      for (const row of roles.values()) if (!reached.has(row.path) && row.role !== 'index') fail('DOC_COVERAGE', 'No task reaches ' + row.path);
      for (const p of files) if (p.startsWith('docs/') && p.endsWith('.md') &&
          !/^docs\/(?:archive\/|environment-kit\/validation\/)/.test(p) && fs.existsSync(resolve(p)) && !roles.has(p)) {
        fail('DOC_COVERAGE', 'Active document has no role/owner: ' + p);
      }
      if (map.handoffs !== undefined) {
        if (!Array.isArray(map.handoffs)) {
          fail('HANDOFF_SCHEMA', 'Registry v2 requires a handoffs array');
        } else {
          const handoffIds = new Set();
          const handoffTriggers = new Set();
          const knownOwners = new Set([...roles.values()].map(r => r.owner));
          for (const h of map.handoffs) {
            if (!h || typeof h.id !== 'string' || !/^H[0-9]{2}$/.test(h.id) ||
                typeof h.trigger !== 'string' || !/^[a-z0-9-]+$/.test(h.trigger) ||
                typeof h.primaryTask !== 'string' || !Array.isArray(h.partnerTasks) ||
                typeof h.when !== 'string' || !h.when.trim() ||
                !Array.isArray(h.required) || !h.required.length ||
                !Array.isArray(h.implementation) || !h.implementation.length ||
                !Array.isArray(h.checks) || !h.checks.length ||
                !Array.isArray(h.updates) || !h.updates.length ||
                !Array.isArray(h.requiredOwners) || !h.requiredOwners.length) {
              fail('HANDOFF_SCHEMA', 'Invalid handoff schema: ' + (h?.id || 'unknown'));
              continue;
            }
            if (handoffIds.has(h.id)) fail('HANDOFF_DUPLICATE', 'Duplicate handoff ID: ' + h.id);
            handoffIds.add(h.id);
            if (handoffTriggers.has(h.trigger)) fail('HANDOFF_DUPLICATE', 'Duplicate handoff trigger: ' + h.trigger);
            handoffTriggers.add(h.trigger);

            if (!taskIds.has(h.primaryTask)) {
              fail('HANDOFF_TASK', 'Unknown primary task: ' + h.primaryTask);
            }
            const partnerSet = new Set();
            for (const p of h.partnerTasks) {
              if (p === h.primaryTask) fail('HANDOFF_TASK', 'Partner task cannot be primary: ' + p);
              if (!taskIds.has(p)) fail('HANDOFF_TASK', 'Unknown partner task: ' + p);
              if (partnerSet.has(p)) fail('HANDOFF_TASK', 'Duplicate partner task: ' + p);
              partnerSet.add(p);
            }

            for (const ref of h.required) {
              checkReference(ref, 'HANDOFF_REF');
              reached.add(ref.split('#')[0]);
            }
            for (const ref of h.updates) {
              checkReference(ref, 'HANDOFF_UPDATE');
            }

            for (const owner of h.requiredOwners) {
              if (!knownOwners.has(owner)) fail('HANDOFF_OWNER', 'Unknown owner in requiredOwners: ' + owner);
              const represented = h.required.some(ref => roles.get(ref.split('#')[0])?.owner === owner);
              if (!represented) fail('HANDOFF_OWNER', 'Owner ' + owner + ' has no representative in required references of ' + h.id);
            }

            for (const p of h.implementation) {
              checkExists(p, 'HANDOFF_IMPL');
            }

            for (const chk of h.checks) {
              if (!chk || typeof chk.command !== 'string' || !chk.command.trim() ||
                  typeof chk.when !== 'string' || !chk.when.trim()) {
                fail('HANDOFF_CHECK', h.id + ' requires command and condition');
                continue;
              }
              const npm = /^npm (?:run ([\w:.-]+)|(test))$/.exec(chk.command);
              const script = /^(?:node|python) ([\w./-]+)(?:\s|$)/.exec(chk.command);
              if (npm) {
                try {
                  if (!JSON.parse(fs.readFileSync(resolve('package.json'), 'utf8')).scripts?.[npm[1] || npm[2]]) {
                    fail('HANDOFF_CHECK', 'Missing npm script: ' + chk.command);
                  }
                } catch (e) { fail('HANDOFF_CHECK', e.message); }
              } else if (script) {
                checkExists(script[1], 'HANDOFF_CHECK');
              } else {
                fail('HANDOFF_CHECK', 'Unsupported check command: ' + chk.command);
              }
            }

            const primary = map.tasks.find(t => t.id === h.primaryTask);
            if (primary) {
              try {
                const skillContent = fs.readFileSync(resolve(primary.skill), 'utf8');
                if (!skillContent.includes(h.id) && !skillContent.includes(h.trigger)) {
                  fail('HANDOFF_ROUTE', 'Skill ' + primary.skill + ' must declare handoff ' + h.id + ' or trigger ' + h.trigger);
                }
              } catch (e) { fail('HANDOFF_ROUTE', e.message); }
            }
          }
        }
      }
    }
  }
  const present = new Set(files);
  for (const p of known) if (!present.has(p) && !retired.has(p)) warnings.push({ code: 'BASELINE_REMOVED', detail: p + ' no longer in Git inventory; review consumers before pruning registry' });
  return { errors, warnings, checkedFiles: files.length, skills: registry.skills.length, mirrors: registry.mirrors.length };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let requestedRoot;
  let taskId;
  let handoffId;
  let invalid = false;
  let json = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json' && !json) json = true;
    else if (args[i] === '--root' && requestedRoot === undefined && args[i + 1] && !args[i + 1].startsWith('--')) requestedRoot = args[++i];
    else if (args[i] === '--task' && taskId === undefined && args[i + 1] && !args[i + 1].startsWith('--')) taskId = args[++i];
    else if (args[i] === '--handoff' && handoffId === undefined && args[i + 1] && !args[i + 1].startsWith('--')) handoffId = args[++i];
    else invalid = true;
  }
  if (invalid || (handoffId !== undefined && taskId === undefined)) {
    console.error('Usage: node tools/check-agent-governance.cjs [--root PATH] [--task TASK [--handoff ID]] [--json]');
    process.exitCode = 2;
  } else {
    let report;
    try { report = inspect(requestedRoot === undefined ? path.resolve(__dirname, '..') : requestedRoot); }
    catch (e) { report = { errors: [{ code: 'CHECKER', detail: e.message }], warnings: [], checkedFiles: 0 }; }
    let context;
    let handoff;
    let readingOrder;
    let implementation;
    let checks;
    let updates;
    if (taskId && !report.errors.length) {
      const regPath = path.join(requestedRoot || path.resolve(__dirname, '..'), 'docs/agent/registry.json');
      const registry = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      context = registry.knowledge?.tasks?.find(t => t.id === taskId);
      if (!context) report.errors.push({ code: 'TASK', detail: 'Unknown task: ' + taskId });
      if (handoffId) {
        handoff = registry.knowledge?.handoffs?.find(h => h.id === handoffId || h.trigger === handoffId);
        if (!handoff) {
          report.errors.push({ code: 'HANDOFF_UNKNOWN', detail: 'Unknown handoff: ' + handoffId });
        } else if (handoff.primaryTask !== taskId) {
          report.errors.push({ code: 'HANDOFF_MISMATCH', detail: 'Handoff ' + handoff.id + ' primary task is ' + handoff.primaryTask + ', but requested task is ' + taskId });
        } else if (context) {
          const dedupe = arr => [...new Set(arr)];
          readingOrder = dedupe([...context.required, ...handoff.required]);
          implementation = dedupe([...context.implementation, ...handoff.implementation]);
          updates = dedupe([...context.updates, ...handoff.updates]);
          const seenCmds = new Set();
          checks = [];
          for (const chk of [...context.checks, ...handoff.checks]) {
            if (!seenCmds.has(chk.command)) {
              seenCmds.add(chk.command);
              checks.push(chk);
            }
          }
        }
      }
    }
    if (json) {
      if (report.errors.length) console.log(JSON.stringify(report, null, 2));
      else if (context && handoff) console.log(JSON.stringify({ ...report, context, handoff, readingOrder, implementation, checks, updates }, null, 2));
      else if (context) console.log(JSON.stringify({ ...report, context }, null, 2));
      else console.log(JSON.stringify(report, null, 2));
    } else if (context && handoff && !report.errors.length) {
      console.log('Task: ' + context.id + '\nSkill: ' + context.skill);
      console.log('Handoff: ' + handoff.id + ' (' + handoff.trigger + ')');
      console.log('When: ' + handoff.when);
      console.log('Partners: ' + handoff.partnerTasks.join(', '));
      console.log('\nreadingOrder:');
      for (const row of readingOrder) console.log('- ' + row);
      console.log('\nimplementation:');
      for (const row of implementation) console.log('- ' + row);
      console.log('\nchecks:');
      for (const row of checks) console.log('- ' + row.command + ' — ' + row.when);
      console.log('\nupdates:');
      for (const row of updates) console.log('- ' + row);
    } else if (context && !report.errors.length) {
      console.log('Task: ' + context.id + '\nSkill: ' + context.skill);
      for (const key of ['required', 'details', 'implementation', 'checks', 'updates']) {
        console.log('\n' + key + (key === 'details' ? ' (load only when relevant)' : '') + ':');
        for (const row of context[key]) console.log('- ' + (typeof row === 'string' ? row : row.command + ' — ' + row.when));
      }
    } else {
      for (const issue of report.errors) console.error('FAIL [' + issue.code + '] ' + issue.detail);
      for (const issue of report.warnings) console.warn('WARN [' + issue.code + '] ' + issue.detail);
      if (!taskId) {
        console.log(`${report.errors.length ? 'FAIL' : 'PASS'} agent governance: ${report.checkedFiles} files, ${report.skills || 0} skills, ${report.mirrors || 0} mirrors; ${report.errors.length} errors, ${report.warnings.length} warnings`);
      }
    }
    process.exitCode = report.errors.length ? 1 : 0;
  }
}

module.exports = { inspect };
