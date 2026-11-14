#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const CAST_PATH = path.join(__dirname, 'vieneu-cast.json');
const LEDGER_PATH = path.join(ROOT, 'assets/audio/q01/vieneu-sources.json');
const LIBRARY_PATH = path.join(ROOT, 'witness-audio-library.js');
const WORKER_PATH = path.join(__dirname, 'vieneu-tts-worker.py');
const COMPARE_LOCAL_DIR = path.join(ROOT, 'outputs/agent-work/vieneu-comparison');
const COMPARE_ASSET_DIR = path.join(ROOT, 'assets/audio/q01/vieneu/comparison');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(String(text || ''), 'utf8').digest('hex');
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function normalizeLine(text) {
  return String(text || '').normalize('NFC').replace(/[“”‘’]/g, '').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyPronunciationLexicon(text, lexicon = {}) {
  let out = normalizeLine(text);
  for (const [term, spoken] of Object.entries(lexicon)) {
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(term)}(?![\\p{L}\\p{N}_])`, 'gu');
    out = out.replace(pattern, spoken);
  }
  return out;
}

function stableJobSeed(baseSeed, lineId) {
  const hash = crypto.createHash('sha256').update(`${baseSeed}:${lineId}`, 'utf8').digest();
  return Number(baseSeed) + (hash.readUInt32BE(0) % 10000);
}

function lineSlug(lineId) {
  return String(lineId).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function formatLineSlug(lineId) {
  return lineSlug(lineId).replace(/-(\d)$/, '-0$1');
}

function extractDialogueLines(rootDir = ROOT) {
  const content = require(path.join(rootDir, 'witness-content.js'));
  require(path.join(rootDir, 'witness-q01-campaign.js'));
  const q01 = globalThis.WitnessQ01Campaign;
  const people = content?.people || {};
  const lines = [];
  const seenKeys = new Set();

  const pushLine = (entry) => {
    const normalizedText = normalizeLine(entry.sourceText);
    if (!normalizedText) return;
    const dedupeKey = `${entry.person}::${normalizedText}`;
    if (seenKeys.has(dedupeKey)) return;
    seenKeys.add(dedupeKey);
    lines.push({
      lineId: entry.lineId,
      person: entry.person,
      characterName: people[entry.person]?.name || entry.person,
      characterRole: people[entry.person]?.role || '',
      beat: entry.beat,
      sourceKind: entry.sourceKind,
      sourceLocation: entry.sourceLocation,
      sourceText: entry.sourceText,
      normalizedText,
      sourceTextSha256: sha256Text(normalizedText),
    });
  };

  if (q01?.script) {
    for (const [beat, rows] of Object.entries(q01.script)) {
      if (!Array.isArray(rows)) continue;
      rows.forEach((row, index) => {
        if (!Array.isArray(row) || row.length < 2) return;
        const [who, rawText] = row;
        if (!who || who === 'description' || who === 'avatar') return;
        pushLine({
          lineId: `q01.${beat}.${index}`,
          person: who,
          beat,
          sourceKind: 'q01-campaign-script',
          sourceLocation: `witness-q01-campaign.js#script.${beat}[${index}]`,
          sourceText: rawText,
        });
      });
    }
  }

  for (const [personId, person] of Object.entries(people)) {
    for (const topic of person?.topics || []) {
      if (!topic?.line) continue;
      pushLine({
        lineId: `topic.${personId}.${topic.id}`,
        person: personId,
        beat: 'topics',
        sourceKind: 'person-topic',
        sourceLocation: `witness-content.js#people.${personId}.topics.${topic.id}`,
        sourceText: topic.line,
      });
    }
  }

  for (const ch of content?.chapters || []) {
    const nodeByTarget = Object.fromEntries((ch.nodes || []).filter((n) => n?.id).map((n) => [n.id, n]));
    for (const task of ch.tasks || []) {
      const node = nodeByTarget[task.target];
      const speaker = task.speaker || node?.person;
      if (!speaker || !task.text) continue;
      for (const m of String(task.text).matchAll(/“([^”]+)”/g)) {
        pushLine({
          lineId: `chapter.${ch.id}.task.${task.id}`,
          person: speaker,
          beat: ch.id,
          sourceKind: 'chapter-task-quote',
          sourceLocation: `witness-content.js#chapters.${ch.id}.tasks.${task.id}`,
          sourceText: m[1],
        });
      }
    }
  }

  return lines;
}

function buildTargetTakes(cast, extractedLines, filters = {}) {
  const lexicon = cast.pronunciationLexicon || {};
  const lexiconHash = sha256Text(JSON.stringify(lexicon));
  const byPerson = new Map();
  for (const line of extractedLines) {
    if (!byPerson.has(line.person)) byPerson.set(line.person, []);
    byPerson.get(line.person).push(line);
  }

  const takes = [];
  const onlyChars = filters.characters?.length ? new Set(filters.characters) : null;
  const onlyVoices = filters.voices?.length ? new Set(filters.voices) : null;
  const onlyBeats = filters.beats?.length ? new Set(filters.beats) : null;
  const onlyLines = filters.lines?.length ? new Set(filters.lines) : null;

  for (const [personId, profile] of Object.entries(cast.characterProfiles || {})) {
    if (onlyChars && !onlyChars.has(personId)) continue;
    const personLines = byPerson.get(personId) || [];
    const audition = profile.audition || {};
    const wantedBeats = new Set(audition.q01Beats || []);
    const wantedTopics = new Set((audition.topicIds || []).map((id) => `topic.${personId}.${id}`));

    const selectedLines = personLines.filter((line) => {
      if (filters.scope === 'all') return true;
      if (filters.scope === 'q01') return line.sourceKind === 'q01-campaign-script';
      if (line.sourceKind === 'q01-campaign-script') return wantedBeats.has(line.beat);
      return wantedTopics.has(line.lineId);
    });

    for (const variant of profile.variants || []) {
      if (onlyVoices && !onlyVoices.has(variant.id) && !onlyVoices.has(variant.voiceId)) continue;
      for (const line of selectedLines) {
        if (onlyBeats && !onlyBeats.has(line.beat)) continue;
        if (onlyLines && !onlyLines.has(line.lineId)) continue;
        const ttsText = applyPronunciationLexicon(line.sourceText, lexicon);
        const relDir = `assets/audio/q01/vieneu/${personId}-${variant.id}`;
        const relPath = `${relDir}/${formatLineSlug(line.lineId)}.mp3`;
        const takeId = `${personId}/${variant.id}/${line.lineId}`;
        takes.push({
          id: takeId,
          lineId: line.lineId,
          person: personId,
          characterName: line.characterName,
          characterRole: line.characterRole,
          beat: line.beat,
          sourceKind: line.sourceKind,
          sourceLocation: line.sourceLocation,
          variant: variant.id,
          voiceId: variant.voiceId,
          voiceLabel: variant.label,
          rationale: variant.rationale,
          seed: stableJobSeed(variant.seedBase || 4000, line.lineId),
          sourceText: line.sourceText,
          normalizedText: line.normalizedText,
          sourceTextSha256: line.sourceTextSha256,
          ttsText,
          ttsInputSha256: sha256Text(`${variant.voiceId}|${lexiconHash}|${ttsText}`),
          relPath,
          outPath: path.join(ROOT, relPath),
          comparisonWavRelPath: `outputs/agent-work/vieneu-comparison/${personId}-${variant.id}/${formatLineSlug(line.lineId)}.wav`,
          comparisonWavPath: path.join(COMPARE_LOCAL_DIR, `${personId}-${variant.id}`, `${formatLineSlug(line.lineId)}.wav`),
        });
      }
    }
  }
  return takes;
}

function evaluateTakeState(take, existingEntry, engineMeta, precision, rootDir = ROOT) {
  if (!existingEntry) return { needsRegen: true, reason: 'missing_ledger_entry' };
  const absFile = path.join(rootDir, take.relPath);
  if (!fs.existsSync(absFile)) return { needsRegen: true, reason: 'missing_audio_file' };
  const diskSha = sha256File(absFile);
  if (existingEntry.audioSha256 !== diskSha) return { needsRegen: true, reason: 'audio_hash_mismatch' };
  if (existingEntry.sourceTextSha256 !== take.sourceTextSha256) return { needsRegen: true, reason: 'source_text_changed' };
  if (existingEntry.ttsInputSha256 !== take.ttsInputSha256) return { needsRegen: true, reason: 'tts_text_or_lexicon_changed' };
  if (existingEntry.voiceId !== take.voiceId) return { needsRegen: true, reason: 'voice_changed' };
  if (existingEntry.modelRepo !== engineMeta.hfModelRepo || existingEntry.hfModelRevision !== engineMeta.hfModelRevision) {
    return { needsRegen: true, reason: 'model_version_changed' };
  }
  if (existingEntry.precision !== precision) return { needsRegen: true, reason: 'precision_changed' };
  if (!existingEntry.qc?.passed) return { needsRegen: true, reason: 'qc_failed' };
  return { needsRegen: false, reason: 'up_to_date' };
}

function resolvePythonExecutable(rootDir = ROOT) {
  if (process.env.VIENEU_PYTHON && fs.existsSync(process.env.VIENEU_PYTHON)) {
    return process.env.VIENEU_PYTHON;
  }
  const candidates = [
    path.join(rootDir, 'local/vieneu-venv/Scripts/python.exe'),
    path.join(rootDir, 'local/vieneu-venv/bin/python'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('VieNeu Python venv not found at local/vieneu-venv. Set VIENEU_PYTHON or create local/vieneu-venv.');
}

function buildComparisonReels(cast, allTakes, existingById) {
  const natanProfile = cast.characterProfiles?.natan;
  if (!natanProfile) return [];
  const gapSeconds = cast.comparisonCadence?.gapSeconds || [0.66, 0.80, 0.23, 0.51];
  const reels = [];
  for (const variant of natanProfile.variants || []) {
    const nightTakes = allTakes
      .filter((t) => t.person === 'natan' && t.variant === variant.id && t.beat === 'night')
      .sort((a, b) => Number(a.lineId.split('.').pop()) - Number(b.lineId.split('.').pop()));
    if (nightTakes.length !== 5) continue;
    const mp3RelPath = `assets/audio/q01/vieneu/comparison/natan-beat07-${variant.id}.mp3`;
    const wavRelPath = `outputs/agent-work/vieneu-comparison/natan-beat07-${variant.id}.wav`;
    reels.push({
      id: `natan-beat07-${variant.id}`,
      variant: variant.id,
      voiceId: variant.voiceId,
      mp3RelPath,
      mp3OutPath: path.join(ROOT, mp3RelPath),
      wavRelPath,
      wavOutPath: path.join(ROOT, wavRelPath),
      gapSeconds,
      items: nightTakes.map((t) => ({
        jobId: t.id,
        text: t.normalizedText,
        audioPath: path.join(ROOT, existingById.get(t.id)?.file || t.relPath),
      })),
    });
  }
  return reels;
}

function buildLibrarySource(cast, ledger, rootDir = ROOT) {
  const procPath = path.join(rootDir, 'assets/audio/q01/procedural-sources.json');
  const proc = readJson(procPath);
  const soundIds = (proc.entries || []).map((e) => e.id);
  const elevenVoices = [
    ['Con ngồi đi. Cha con hay để mái chèo ở phía ấy.', 0.14, 3.15],
    ['Mấy hôm nay chú cứ quay sang hỏi ông ấy một câu. Hỏi xong mới nhớ ra.', 3.81, 8.20],
    ['Chú cũng chưa quen.', 9.00, 10.16],
    ['Nếu con muốn nói, chú nghe.', 10.39, 11.95],
    ['Đèn còn dầu. Con cứ ngồi.', 12.46, 14.24],
  ];

  const experimentalVoices = (ledger.entries || []).map((e) => ({
    id: e.id,
    lineId: e.lineId,
    person: e.person,
    variant: e.variant,
    voiceId: e.voiceId,
    modelVersion: e.modelVersion,
    beat: e.beat,
    text: e.sourceText,
    sourceTextSha256: e.sourceTextSha256,
    audioSha256: e.audioSha256,
    file: e.file,
    durationSeconds: e.durationSeconds,
    reviewStatus: e.reviewStatus,
  }));

  const voiceProfiles = Object.fromEntries(
    Object.entries(cast.voiceProfiles || {}).map(([id, prof]) => [
      id,
      {
        label: prof.label,
        engine: prof.engine,
        reviewStatus: prof.reviewStatus,
        description: prof.description,
        fallbackToElevenLabs: prof.fallbackToElevenLabs !== false,
        characters: prof.characters || {},
      },
    ])
  );

  return [
    '// Generated by tools/vieneu-tts.cjs — do not edit manually; re-run `npm run audio:tts:regen` or `node tools/vieneu-tts.cjs --sync`.',
    "(function(root){'use strict';",
    `const sounds=Object.fromEntries(${JSON.stringify(soundIds)}.map(id=>[id,{files:['assets/audio/q01/'+id+'.wav']}]));`,
    "const file='assets/audio/q01/natan-night.mp3';",
    `const voices=${JSON.stringify(elevenVoices, null, 1)}.map(([text,start,end])=>({person:'natan',text,file,start,end}));`,
    `const voiceProfiles=${JSON.stringify(voiceProfiles, null, 1)};`,
    `const experimentalVoices=${JSON.stringify(experimentalVoices, null, 1)};`,
    "const library={version:3,sounds,voices,voiceProfiles,experimentalVoices};root.WitnessAudioLibrary=library;if(typeof module!=='undefined')module.exports=library;",
    '})(globalThis);\n',
  ].join('\n');
}

function writeComparisonBundle(cast, ledger, rootDir = ROOT) {
  fs.mkdirSync(COMPARE_LOCAL_DIR, { recursive: true });
  fs.mkdirSync(COMPARE_ASSET_DIR, { recursive: true });
  const elevenSrc = path.join(rootDir, cast.comparisonCadence?.natanNightReference || 'assets/audio/q01/natan-night.mp3');
  const elevenDest = path.join(COMPARE_LOCAL_DIR, 'natan-beat07-elevenlabs-reference.mp3');
  if (fs.existsSync(elevenSrc)) fs.copyFileSync(elevenSrc, elevenDest);

  const voiceSourcePath = path.join(rootDir, 'assets/audio/q01/voice-sources.json');
  const voiceSource = fs.existsSync(voiceSourcePath) ? readJson(voiceSourcePath) : null;

  const summary = {
    generatedAt: ledger.generatedAt,
    reviewStatus: ledger.reviewStatus,
    note: 'Natan Beat 07 side-by-side listening comparison against untouched ElevenLabs reference; Titus, Yosef, and Rina samples generated via VieNeu-TTS v3 Turbo.',
    reference: voiceSource ? {
      engine: voiceSource.engine,
      model: voiceSource.model,
      voice: voiceSource.voice,
      file: voiceSource.file,
      localCopy: 'outputs/agent-work/vieneu-comparison/natan-beat07-elevenlabs-reference.mp3',
      durationSeconds: voiceSource.durationSeconds,
      sha256: voiceSource.sha256,
    } : null,
    natanReels: ledger.comparisonReels || [],
    characterSamples: Object.fromEntries(
      ['natan', 'titus', 'yosef', 'rina'].map((personId) => [
        personId,
        (ledger.entries || []).filter((e) => e.person === personId).map((e) => ({
          id: e.id,
          variant: e.variant,
          voiceId: e.voiceId,
          beat: e.beat,
          sourceText: e.sourceText,
          file: e.file,
          durationSeconds: e.durationSeconds,
          rmsDbfs: e.qc?.rmsDbfs,
          peakDbfs: e.qc?.peakDbfs,
          audioSha256: e.audioSha256,
        })),
      ])
    ),
  };
  fs.writeFileSync(path.join(COMPARE_LOCAL_DIR, 'comparison-report.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(COMPARE_ASSET_DIR, 'comparison-manifest.json'), JSON.stringify({
    generatedAt: ledger.generatedAt,
    reviewStatus: ledger.reviewStatus,
    reference: 'assets/audio/q01/natan-night.mp3',
    natanReels: ledger.comparisonReels || [],
  }, null, 2) + '\n', 'utf8');
}

function parseArgs(argv) {
  const opts = {
    mode: 'changed-only',
    scope: 'audition',
    precision: null,
    backend: null,
    threads: 0,
    characters: [],
    voices: [],
    beats: [],
    lines: [],
    out: null,
    dryRun: false,
    compare: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--extract') opts.mode = 'extract';
    else if (a === '--check') opts.mode = 'check';
    else if (a === '--changed-only' || a === '--regen') opts.mode = 'changed-only';
    else if (a === '--all') opts.mode = 'all';
    else if (a === '--sync') opts.mode = 'sync';
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--compare') opts.compare = true;
    else if (a === '--scope' && argv[i + 1]) opts.scope = argv[++i];
    else if (a === '--precision' && argv[i + 1]) opts.precision = argv[++i];
    else if (a === '--backend' && argv[i + 1]) opts.backend = argv[++i];
    else if (a === '--threads' && argv[i + 1]) opts.threads = Number(argv[++i]) || 0;
    else if (a === '--character' && argv[i + 1]) opts.characters.push(...argv[++i].split(',').filter(Boolean));
    else if (a === '--voice' && argv[i + 1]) opts.voices.push(...argv[++i].split(',').filter(Boolean));
    else if (a === '--beat' && argv[i + 1]) opts.beats.push(...argv[++i].split(',').filter(Boolean));
    else if (a === '--line' && argv[i + 1]) opts.lines.push(...argv[++i].split(',').filter(Boolean));
    else if (a === '--out' && argv[i + 1]) opts.out = path.resolve(argv[++i]);
    else if (a === '--help' || a === '-h') opts.mode = 'help';
    else throw new Error(`Unknown or incomplete option: ${a}`);
  }
  return opts;
}

function verifyIntegrity(rootDir = ROOT) {
  const cast = readJson(path.join(rootDir, 'tools/vieneu-cast.json'));
  const ledgerPath = path.join(rootDir, 'assets/audio/q01/vieneu-sources.json');
  if (!fs.existsSync(ledgerPath)) {
    return { ok: false, errors: ['Missing assets/audio/q01/vieneu-sources.json'] };
  }
  const ledger = readJson(ledgerPath);
  const extracted = extractDialogueLines(rootDir);
  const takes = buildTargetTakes(cast, extracted, { scope: 'audition' });
  const existingById = new Map((ledger.entries || []).map((e) => [e.id, e]));
  const precision = ledger.runtime?.precision || cast.engine.preferredPrecision || 'fp32';
  const errors = [];

  for (const take of takes) {
    const state = evaluateTakeState(take, existingById.get(take.id), cast.engine, precision, rootDir);
    if (state.needsRegen) {
      errors.push(`${take.id}: ${state.reason}`);
    }
    const entry = existingById.get(take.id);
    if (entry && entry.reviewStatus !== 'generated-awaiting-human-audio-review') {
      errors.push(`${take.id}: unexpected reviewStatus '${entry.reviewStatus}'`);
    }
  }

  for (const reel of ledger.comparisonReels || []) {
    const mp3Abs = path.join(rootDir, reel.mp3File);
    if (!fs.existsSync(mp3Abs)) errors.push(`Missing comparison reel ${reel.mp3File}`);
    else if (sha256File(mp3Abs) !== reel.mp3Sha256) errors.push(`Hash mismatch on comparison reel ${reel.mp3File}`);
  }

  const expectedLib = buildLibrarySource(cast, ledger, rootDir).replace(/\r\n/g, '\n');
  const actualLib = fs.readFileSync(path.join(rootDir, 'witness-audio-library.js'), 'utf8').replace(/\r\n/g, '\n');
  if (expectedLib !== actualLib) {
    errors.push('witness-audio-library.js is out of sync with vieneu-sources.json (run `node tools/vieneu-tts.cjs --sync`)');
  }

  return { ok: errors.length === 0, errors, checkedEntries: takes.length, ledgerEntries: (ledger.entries || []).length };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.mode === 'help') {
    console.log([
      'Usage: node tools/vieneu-tts.cjs [mode] [filters]',
      'Modes:',
      '  --extract       Extract canonical dialogue inventory from JS scripts',
      '  --check         Verify hashes, QC pass status, source text sync & library sync',
      '  --changed-only  Generate only missing or modified lines (default)',
      '  --all           Force regenerate all targeted takes',
      '  --sync          Regenerate witness-audio-library.js from vieneu-sources.json without inference',
      'Filters:',
      '  --character <id[,id…]>     Filter characters (e.g. natan,titus)',
      '  --voice <id[,id…]>         Filter voice variant or preset name',
      '  --beat <beat[,beat…]>      Filter beat key (e.g. night,fire,yosef)',
      '  --line <lineId[,id…]>      Filter exact lineId',
      '  --scope <audition|q01|all> Line scope (default: audition)',
      '  --precision <fp32|int8>    CPU ONNX precision (default: fp32)',
      '  --compare                  Write 48 kHz comparison WAVs + report into outputs/agent-work/vieneu-comparison',
      '  --dry-run                  Show plan without modifying files or running synthesis',
    ].join('\n'));
    return;
  }

  const cast = readJson(CAST_PATH);
  const precision = opts.precision || cast.engine.preferredPrecision || 'fp32';
  const backend = opts.backend || cast.engine.preferredBackend || 'onnx';

  if (opts.mode === 'extract') {
    const lines = extractDialogueLines(ROOT);
    const payload = {
      extractedAt: new Date().toISOString(),
      totalLines: lines.length,
      lines,
    };
    if (opts.out) {
      fs.mkdirSync(path.dirname(opts.out), { recursive: true });
      fs.writeFileSync(opts.out, JSON.stringify(payload, null, 2) + '\n', 'utf8');
      console.log(JSON.stringify({ status: 'extracted', totalLines: lines.length, out: path.relative(ROOT, opts.out) }));
    } else {
      console.log(JSON.stringify(payload, null, 2));
    }
    return;
  }

  if (opts.mode === 'check') {
    const result = verifyIntegrity(ROOT);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
    return;
  }

  if (opts.mode === 'sync') {
    const ledger = readJson(LEDGER_PATH);
    fs.writeFileSync(LIBRARY_PATH, buildLibrarySource(cast, ledger, ROOT), 'utf8');
    console.log(JSON.stringify({ status: 'synced', entries: ledger.entries?.length || 0, library: 'witness-audio-library.js' }));
    return;
  }

  const extracted = extractDialogueLines(ROOT);
  const fullAuditionTakes = buildTargetTakes(cast, extracted, { scope: 'audition' });
  const filteredTakes = buildTargetTakes(cast, extracted, {
    scope: opts.scope,
    characters: opts.characters,
    voices: opts.voices,
    beats: opts.beats,
    lines: opts.lines,
  });

  const existingLedger = fs.existsSync(LEDGER_PATH) ? readJson(LEDGER_PATH) : { entries: [] };
  const existingById = new Map((existingLedger.entries || []).map((e) => [e.id, e]));

  const plan = filteredTakes.map((take) => {
    if (opts.mode === 'all') return { take, needsRegen: true, reason: 'forced' };
    const st = evaluateTakeState(take, existingById.get(take.id), cast.engine, precision, ROOT);
    return { take, ...st };
  });

  const queued = plan.filter((p) => p.needsRegen);
  if (opts.dryRun) {
    console.log(JSON.stringify({
      status: 'dry-run',
      totalTargeted: plan.length,
      toGenerate: queued.length,
      skippedUpToDate: plan.length - queued.length,
      queue: queued.map((q) => ({ id: q.take.id, voiceId: q.take.voiceId, reason: q.reason, sourceText: q.take.sourceText })),
    }, null, 2));
    return;
  }

  let workerReport = { runtime: existingLedger.runtime || {}, jobs: [], comparisonReels: existingLedger.comparisonReels || [] };
  const allTargetsForReels = opts.scope === 'audition' ? fullAuditionTakes : filteredTakes;
  const reelsToBuild = buildComparisonReels(cast, allTargetsForReels, existingById);
  const missingReelFile = reelsToBuild.some((r) => !fs.existsSync(r.mp3OutPath) || (opts.compare && !fs.existsSync(r.wavOutPath)));

  if (queued.length > 0 || missingReelFile || opts.compare) {
    const tmpDir = path.join(ROOT, 'outputs/agent-work/vieneu-tmp');
    fs.mkdirSync(tmpDir, { recursive: true });
    const manifestPath = path.join(tmpDir, 'worker-manifest.json');
    const reportPath = path.join(tmpDir, 'worker-report.json');
    const pythonExe = resolvePythonExecutable(ROOT);

    const workerManifest = {
      allowVoiceCloning: false,
      backend,
      precision,
      threads: opts.threads,
      hfModelRepo: cast.engine.hfModelRepo,
      codecRepo: cast.engine.codecRepo,
      mp3CompressionLevel: cast.engine.mp3CompressionLevel,
      qcThresholds: cast.qcThresholds,
      jobs: queued.map((q) => ({
        id: q.take.id,
        voiceId: q.take.voiceId,
        seed: q.take.seed,
        ttsText: q.take.ttsText,
        relPath: q.take.relPath,
        outPath: q.take.outPath,
        comparisonWavRelPath: opts.compare ? q.take.comparisonWavRelPath : null,
        comparisonWavPath: opts.compare ? q.take.comparisonWavPath : null,
      })),
      comparisonReels: (queued.some((q) => q.take.person === 'natan' && q.take.beat === 'night') || missingReelFile || opts.compare)
        ? reelsToBuild
        : [],
    };

    fs.writeFileSync(manifestPath, JSON.stringify(workerManifest, null, 2), 'utf8');
    const res = spawnSync(pythonExe, [WORKER_PATH, '--manifest', manifestPath, '--report', reportPath], {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, PYTHONUTF8: '1' },
    });
    if (res.status !== 0) {
      throw new Error(`VieNeu worker failed with exit code ${res.status}`);
    }
    workerReport = readJson(reportPath);
  }

  const now = new Date().toISOString();
  const jobResultById = new Map((workerReport.jobs || []).map((j) => [j.id, j]));
  const updatedById = new Map(existingById);

  for (const take of filteredTakes) {
    const fresh = jobResultById.get(take.id);
    if (!fresh) continue;
    const sdkVersion = workerReport.runtime?.sdkVersion || 'unknown';
    const hfRev = (cast.engine.hfModelRevision || '').slice(0, 8);
    updatedById.set(take.id, {
      id: take.id,
      lineId: take.lineId,
      person: take.person,
      characterName: take.characterName,
      characterRole: take.characterRole,
      beat: take.beat,
      sourceKind: take.sourceKind,
      sourceLocation: take.sourceLocation,
      variant: take.variant,
      voiceId: take.voiceId,
      voiceLabel: take.voiceLabel,
      model: cast.engine.name,
      modelRepo: cast.engine.hfModelRepo,
      hfModelRevision: cast.engine.hfModelRevision,
      modelVersion: `VieNeu-TTS-v3-Turbo (vieneu ${sdkVersion}${hfRev ? ' · ' + hfRev : ''})`,
      codecRepo: cast.engine.codecRepo,
      codecRevision: cast.engine.codecRevision,
      license: cast.engine.license,
      backend: workerReport.runtime?.backend || backend,
      precision: workerReport.runtime?.precision || precision,
      seed: fresh.seedUsed,
      sourceText: take.sourceText,
      normalizedText: take.normalizedText,
      sourceTextSha256: take.sourceTextSha256,
      ttsText: take.ttsText,
      ttsInputSha256: take.ttsInputSha256,
      file: fresh.file,
      audioSha256: fresh.audioSha256,
      bytes: fresh.bytes,
      sampleRate: fresh.qc?.sampleRate || 48000,
      channels: fresh.qc?.channels || 1,
      durationSeconds: fresh.qc?.durationSeconds || 0,
      generationSeconds: fresh.generationSeconds,
      rtf: fresh.rtf,
      rawMetrics: fresh.rawMetrics,
      qc: fresh.qc,
      reviewStatus: 'generated-awaiting-human-audio-review',
      generatedAt: now,
    });
  }

  const orderedEntries = [...updatedById.values()].sort((a, b) => a.id.localeCompare(b.id));
  const reelsOut = workerReport.comparisonReels?.length
    ? workerReport.comparisonReels
    : (existingLedger.comparisonReels || []);

  const ledger = {
    schemaVersion: 1,
    generatedAt: now,
    reviewStatus: 'generated-awaiting-human-audio-review',
    license: {
      spdx: cast.engine.license,
      upstreamRepo: cast.engine.upstreamRepo,
      hfModelRepo: cast.engine.hfModelRepo,
      hfModelRevision: cast.engine.hfModelRevision,
      codecRepo: cast.engine.codecRepo,
      codecRevision: cast.engine.codecRevision,
      allowVoiceCloning: false,
      note: cast.engine.voiceConsentNote,
    },
    runtime: workerReport.runtime || existingLedger.runtime || {},
    entries: orderedEntries,
    comparisonReels: reelsOut,
  };

  fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true });
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n', 'utf8');
  fs.writeFileSync(LIBRARY_PATH, buildLibrarySource(cast, ledger, ROOT), 'utf8');
  writeComparisonBundle(cast, ledger, ROOT);

  console.log(JSON.stringify({
    status: 'completed',
    generatedCount: queued.length,
    totalEntries: orderedEntries.length,
    comparisonReels: reelsOut.length,
    ledger: 'assets/audio/q01/vieneu-sources.json',
    library: 'witness-audio-library.js',
    reviewStatus: 'generated-awaiting-human-audio-review',
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err?.stack || String(err));
    process.exit(1);
  }
}

module.exports = {
  normalizeLine,
  applyPronunciationLexicon,
  extractDialogueLines,
  buildTargetTakes,
  evaluateTakeState,
  buildLibrarySource,
  verifyIntegrity,
};
