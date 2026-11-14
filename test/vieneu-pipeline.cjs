'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const TTS = require('../tools/vieneu-tts.cjs');
const A = require('../witness-audio.js');
const L = require('../witness-audio-library.js');
const M = require('../witness-model.js');
const cast = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/vieneu-cast.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/audio/q01/vieneu-sources.json'), 'utf8'));

// 1. Canonical dialogue extraction + pronunciation normalization without mutating canonical script text
const extracted = TTS.extractDialogueLines(ROOT);
assert(extracted.length >= 60, 'Expected >= 60 extracted Q01/script lines, got ' + extracted.length);
const beat07Natan = extracted.filter((l) => l.person === 'natan' && l.beat === 'night');
assert.equal(beat07Natan.length, 5, 'Beat 07 must extract 5 Natan lines');
for (const v of L.voices) {
  assert(beat07Natan.some((l) => TTS.normalizeLine(l.sourceText) === TTS.normalizeLine(v.text)), 'Missing Beat 07 line: ' + v.text);
}
assert.equal(
  TTS.applyPronunciationLexicon('Natan nói với Simeon tại xưởng.', cast.pronunciationLexicon),
  'Na-tan nói với Xi-mê-ôn tại xưởng.'
);

// 2. Non-cloning & license governance assertions
assert.equal(cast.engine.license, 'Apache-2.0');
assert.equal(cast.engine.allowVoiceCloning, false);
assert.equal(ledger.license.spdx, 'Apache-2.0');
assert.equal(ledger.license.allowVoiceCloning, false);
assert.equal(ledger.reviewStatus, 'generated-awaiting-human-audio-review');

// 3. Full integrity verification of all 28 clips + comparison reels + witness-audio-library.js sync
const integrity = TTS.verifyIntegrity(ROOT);
assert.equal(integrity.ok, true, 'VieNeu integrity check failed: ' + JSON.stringify(integrity.errors));
assert.equal(integrity.checkedEntries, 28, 'Expected 28 verified VieNeu audio entries');

// 4. Incremental regeneration change-detection (pure in-memory mutation test on real targets)
const takes = TTS.buildTargetTakes(cast, extracted, { scope: 'audition' });
assert.equal(takes.length, 28, 'Expected 28 target audition takes (Natan x2x5 + Titus x8 + Yosef x6 + Rina x4)');
const ledgerById = new Map(ledger.entries.map((e) => [e.id, { ...e }]));
const precision = ledger.runtime?.precision || cast.engine.preferredPrecision || 'fp32';
for (const take of takes) {
  const res = TTS.evaluateTakeState(take, ledgerById.get(take.id), cast.engine, precision, ROOT);
  assert.equal(res.needsRegen, false, 'Expected unchanged take to be up_to_date: ' + take.id + ' (' + res.reason + ')');
}

const sampleTake = takes.find((t) => t.id === 'natan/thien-tam-duc/q01.night.0');
assert(sampleTake, 'Sample take natan/thien-tam-duc/q01.night.0 must exist');
const sampleEntry = ledgerById.get(sampleTake.id);

const mutatedTextTake = { ...sampleTake, sourceTextSha256: crypto.createHash('sha256').update('changed line').digest('hex') };
assert.equal(TTS.evaluateTakeState(mutatedTextTake, sampleEntry, cast.engine, precision, ROOT).reason, 'source_text_changed');

const mutatedLexiconTake = { ...sampleTake, ttsInputSha256: crypto.createHash('sha256').update('changed lexicon').digest('hex') };
assert.equal(TTS.evaluateTakeState(mutatedLexiconTake, sampleEntry, cast.engine, precision, ROOT).reason, 'tts_text_or_lexicon_changed');

const mutatedVoiceTake = { ...sampleTake, voiceId: 'Giọng Khác' };
assert.equal(TTS.evaluateTakeState(mutatedVoiceTake, sampleEntry, cast.engine, precision, ROOT).reason, 'voice_changed');

const mutatedModelEntry = { ...sampleEntry, hfModelRevision: 'deadbeef' };
assert.equal(TTS.evaluateTakeState(sampleTake, mutatedModelEntry, cast.engine, precision, ROOT).reason, 'model_version_changed');

const corruptedAudioEntry = { ...sampleEntry, audioSha256: '0000' };
assert.equal(TTS.evaluateTakeState(sampleTake, corruptedAudioEntry, cast.engine, precision, ROOT).reason, 'audio_hash_mismatch');

const missingFileTake = { ...sampleTake, relPath: 'assets/audio/q01/vieneu/does-not-exist.mp3' };
assert.equal(TTS.evaluateTakeState(missingFileTake, sampleEntry, cast.engine, precision, ROOT).reason, 'missing_audio_file');

// 5. Required NPC samples & Natan Beat 07 A/B comparison assets
const natanA = L.experimentalVoices.filter((v) => v.person === 'natan' && v.variant === 'thien-tam-duc');
const natanB = L.experimentalVoices.filter((v) => v.person === 'natan' && v.variant === 'thien-minh');
const titus = L.experimentalVoices.filter((v) => v.person === 'titus');
const yosef = L.experimentalVoices.filter((v) => v.person === 'yosef');
const rina = L.experimentalVoices.filter((v) => v.person === 'rina');
assert.equal(natanA.length, 5);
assert.equal(natanB.length, 5);
assert(titus.length >= 1, 'Titus must have sample clips');
assert(yosef.length >= 1, 'Yosef must have sample clips');
assert(rina.length >= 1, 'Rina must have sample clips');
for (const item of L.experimentalVoices) {
  assert.equal(item.reviewStatus, 'generated-awaiting-human-audio-review');
  assert(item.voiceId && item.modelVersion && item.sourceTextSha256 && item.audioSha256, 'Complete metadata required on ' + item.id);
}
for (const reel of ledger.comparisonReels || []) {
  assert(fs.existsSync(path.join(ROOT, reel.mp3File)), 'Comparison MP3 missing: ' + reel.mp3File);
  assert(fs.statSync(path.join(ROOT, reel.mp3File)).size > 20000, 'Comparison MP3 too small: ' + reel.mp3File);
}

// 6. Runtime profile selection & baseline ElevenLabs / save-schema preservation
const baseLine = 'Con ngồi đi. Cha con hay để mái chèo ở phía ấy.';
assert.equal(A.recorded('natan', baseLine)?.file, 'assets/audio/q01/natan-night.mp3');
assert.equal(A.recorded('natan', baseLine, { voiceProfile: 'vieneu-a' })?.variant, 'thien-tam-duc');
assert.equal(A.recorded('natan', baseLine, { voiceProfile: 'vieneu-b' })?.variant, 'thien-minh');
assert.equal(A.recorded('titus', 'Simeon! Còn nghe tôi không?', { voiceProfile: 'vieneu-a' })?.variant, 'hai-dang');
assert.equal(A.recorded('yosef', 'Bạn vừa từ xưởng Natan sang phải không?', { voiceProfile: 'vieneu-a' })?.variant, 'xuan-vinh');
assert.equal(A.recorded('rina', 'Đêm nay vẫn có chỗ nằm ở xưởng. Lượt bếp sáng cần thêm phần dầu.', { voiceProfile: 'vieneu-a' })?.variant, 'ngoc-linh');
assert.equal(A.recorded('titus', 'Simeon! Còn nghe tôi không?', { voiceProfile: 'elevenlabs' }), null);
const freshState = M.fresh();
assert.equal(freshState.schema, 2, 'Save schema must remain version 2');
assert.equal(freshState.contentVersion, '3.0', 'Content version must remain 3.0');
assert.equal(Object.hasOwn(freshState.settings, 'voiceProfile'), false, 'Save settings must not be mutated for voiceProfile preview');

console.log(JSON.stringify({
  status: 'passed',
  extractedLines: extracted.length,
  checkedEntries: integrity.checkedEntries,
  natanVariants: ['thien-tam-duc', 'thien-minh'],
  npcCounts: { natanA: natanA.length, natanB: natanB.length, titus: titus.length, yosef: yosef.length, rina: rina.length },
  comparisonReels: (ledger.comparisonReels || []).length,
  scope: 'Extraction, pronunciation lexicon, incremental hash change detection, non-cloning governance, metadata & WitnessAudio profile selection/fallback'
}));
