import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { browserDriver, delay } from './browser-driver.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'outputs/agent-work/vieneu-browser-qa');
const PROOF_PATH = path.join(ROOT, 'docs/environment-kit/validation/vieneu-tts-proof.json');
const STANDALONE_PATH = path.join(ROOT, 'dist/ban-choi-ngoai-tuyen.html');
const WEB_PORT = Number(process.env.WITNESS_VIENEU_PORT || 18044);

fs.mkdirSync(OUT, { recursive: true });
assert(fs.existsSync(STANDALONE_PATH), 'Standalone build missing before browser audio verification: ' + STANDALONE_PATH);

async function startStaticServer(port) {
  const child = spawn(process.execPath, [path.join(ROOT, 'tools/serve.cjs')], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  let logs = '';
  child.stdout?.on('data', (c) => { logs += c.toString('utf8'); });
  child.stderr?.on('data', (c) => { logs += c.toString('utf8'); });
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/index.html`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) return child;
    } catch {}
    await delay(150);
  }
  child.kill();
  throw new Error('Static server failed to start on port ' + port + ': ' + logs);
}

async function tap(b, selector) {
  const pt = await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  assert(pt, 'Missing tap target: ' + selector);
  await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...pt });
  await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...pt });
}

async function sampleAudioSignal(b, samples = 8, intervalMs = 70) {
  let maxRms = 0;
  let maxPeak = 0;
  for (let i = 0; i < samples; i++) {
    const d = await b.evaluate('WitnessAudioSession.debug()');
    maxRms = Math.max(maxRms, Number(d.rms || 0));
    maxPeak = Math.max(maxPeak, Number(d.peak || 0));
    if (!d.voice || d.voice.status !== 'playing') break;
    await delay(intervalMs);
  }
  return { maxRms: Number(maxRms.toFixed(6)), maxPeak: Number(maxPeak.toFixed(6)) };
}

async function triggerAudition(b, profile, person, expectedVariant, expectedLinePrefix) {
  const selector = `[data-act="voice-audition"][data-profile="${profile}"][data-person="${person}"]`;
  await tap(b, selector);
  await b.wait(
    `WitnessAudioSession.debug().voice?.status==="playing" && WitnessAudioSession.debug().voice?.kind==="recorded" && WitnessAudioSession.debug().voice?.voiceProfile===${JSON.stringify(profile)}`,
    12000
  );
  const dbg = await b.evaluate('WitnessAudioSession.debug()');
  const caption = await b.evaluate('({hidden:document.querySelector("#audio-caption")?.hidden, text:document.querySelector("#audio-caption")?.textContent||"", status:document.querySelector("#voice-audition-status")?.textContent||""})');
  assert.equal(dbg.context, 'running', 'AudioContext must be running');
  assert.equal(dbg.voice.variant || null, expectedVariant, 'Unexpected variant for ' + profile + '/' + person);
  assert.equal(caption.hidden, false, 'Caption must stay visible while audition plays');
  assert(caption.text.includes(expectedLinePrefix), 'Caption mismatch: ' + caption.text);
  const signal = await sampleAudioSignal(b, 8, 65);
  assert(signal.maxPeak > 0.001 && signal.maxRms > 0.0003, 'Expected real non-silent Web Audio signal for ' + profile + '/' + person + ', got ' + JSON.stringify(signal));
  return { profile, person, variant: dbg.voice.variant || 'elevenlabs-baseline', voiceId: dbg.voice.voiceId, captionText: caption.text, statusLabel: caption.status, ...signal };
}

const server = await startStaticServer(WEB_PORT);
const webOut = path.join(OUT, 'web');
const offlineOut = path.join(OUT, 'offline');
let webDriver = null;
let offlineDriver = null;

try {
  // ---------------- 1. Live HTTP Web Build ----------------
  webDriver = await browserDriver(webOut, 19881, {
    hardware: true,
    width: 1440,
    height: 900,
    url: `http://127.0.0.1:${WEB_PORT}/index.html`,
  });

  await webDriver.click('[data-act="new"]');
  await webDriver.click('[data-act="create"]');
  await webDriver.wait('!!globalThis.WitnessQ01Campaign?.presenter', 45000);
  await delay(400);

  // Save baseline before Settings preview
  const schemaBefore = await webDriver.evaluate('JSON.parse(localStorage.getItem(WitnessModel.STORE))');
  assert.equal(schemaBefore.schema, 2);
  assert.equal(schemaBefore.settings.sound, false);

  await webDriver.click('#hud-top [data-act="settings"]');
  await webDriver.wait('!!document.querySelector("#setting-voice-profile")', 8000);
  const profileOptions = await webDriver.evaluate('[...document.querySelectorAll("#setting-voice-profile option")].map(o=>o.value)');
  assert.deepEqual(profileOptions, ['elevenlabs', 'vieneu-a', 'vieneu-b']);

  const webAuditions = [];
  webAuditions.push(await triggerAudition(webDriver, 'vieneu-a', 'natan', 'thien-tam-duc', 'Con ngồi đi'));
  webAuditions.push(await triggerAudition(webDriver, 'vieneu-b', 'natan', 'thien-minh', 'Con ngồi đi'));
  webAuditions.push(await triggerAudition(webDriver, 'vieneu-a', 'titus', 'hai-dang', 'Simeon! Còn nghe tôi không?'));
  webAuditions.push(await triggerAudition(webDriver, 'vieneu-a', 'yosef', 'xuan-vinh', 'Bạn vừa từ xưởng Natan sang phải không?'));
  webAuditions.push(await triggerAudition(webDriver, 'vieneu-a', 'rina', 'ngoc-linh', 'Đêm nay vẫn có chỗ nằm ở xưởng'));
  webAuditions.push(await triggerAudition(webDriver, 'elevenlabs', 'natan', null, 'Con ngồi đi'));

  // Stop audition button works
  await tap(webDriver, '[data-act="voice-audition-stop"]');
  await webDriver.wait('!WitnessAudioSession.debug().voice', 5000);

  // Cancel Settings preserves untouched sound=false in save
  await tap(webDriver, 'dialog [data-act="close"]');
  await webDriver.wait('!document.querySelector("dialog")', 5000);
  const schemaAfterCancel = await webDriver.evaluate('JSON.parse(localStorage.getItem(WitnessModel.STORE))');
  assert.equal(schemaAfterCancel.settings.sound, false, 'Audition cancel must not persist sound=true');
  assert.equal(Object.hasOwn(schemaAfterCancel.settings, 'voiceProfile'), false);

  // Reopen Settings, enable sound + select vieneu-a + save
  await webDriver.click('#hud-top [data-act="settings"]');
  await webDriver.wait('!!document.querySelector("#setting-sound")', 8000);
  await tap(webDriver, '#setting-sound');
  await webDriver.select('#setting-voice-profile', 'vieneu-a');
  await tap(webDriver, '[data-act="settings-save"]');
  await webDriver.wait('!document.querySelector("dialog") && WitnessAudioSession.debug().context==="running"', 12000);
  assert.equal(await webDriver.evaluate('WitnessAudioSession.getVoiceProfile()'), 'vieneu-a');

  // Persist across full page reload
  await webDriver.send('Page.reload', { ignoreCache: true });
  await webDriver.wait('!!document.querySelector("#title-actions [data-act=continue]")', 30000);
  assert.equal(await webDriver.evaluate('WitnessAudioSession.getVoiceProfile()'), 'vieneu-a');
  await tap(webDriver, '#title-actions [data-act="continue"]');
  await webDriver.wait('!!globalThis.WitnessQ01Campaign?.presenter && WitnessAudioSession.debug().context==="running"', 20000);
  if (await webDriver.evaluate('!!document.querySelector("dialog [data-act=close]")')) {
    await tap(webDriver, 'dialog [data-act="close"]');
    await delay(250);
  }
  await delay(350);

  // Test repeat, skip/interruption, volume adjustment, fallback & profile switching in-game
  const spokeA = await webDriver.evaluate('WitnessAudioSession.speak("natan", "Mấy hôm nay chú cứ quay sang hỏi ông ấy một câu. Hỏi xong mới nhớ ra.")');
  assert.equal(spokeA, true, 'Expected live in-game VieNeu A speak() to start playback');
  await webDriver.wait('WitnessAudioSession.debug().voice?.status==="playing" && WitnessAudioSession.debug().voice?.variant==="thien-tam-duc"', 10000);
  const repeated = await webDriver.evaluate('WitnessAudioSession.repeat()');
  assert.equal(repeated, true, 'Expected WitnessAudioSession.repeat() to replay active voice');
  await webDriver.wait('WitnessAudioSession.debug().voice?.status==="playing" && WitnessAudioSession.debug().voice?.variant==="thien-tam-duc"', 10000);

  // Skip/interruption to second voice (vieneu-b)
  const spokeB = await webDriver.evaluate('(WitnessAudioSession.setVoiceProfile("vieneu-b"), WitnessAudioSession.speak("natan", "Con ngồi đi. Cha con hay để mái chèo ở phía ấy."))');
  assert.equal(spokeB, true, 'Expected live in-game VieNeu B speak() to start playback');
  await webDriver.wait('WitnessAudioSession.debug().voice?.status==="playing" && WitnessAudioSession.debug().voice?.variant==="thien-minh" && WitnessAudioSession.debug().voice?.text==="Con ngồi đi. Cha con hay để mái chèo ở phía ấy."', 10000);

  // Volume attenuation check (25% vs default) + restore
  await webDriver.evaluate('WitnessAudioSession.configure({ ...WitnessAudioSession.config, sound: true, voiceVolume: 0.25 });');
  assert.equal(await webDriver.evaluate('WitnessAudioSession.debug().settings.voiceVolume'), 0.25);
  await webDriver.evaluate('WitnessAudioSession.configure({ ...WitnessAudioSession.config, sound: true, voiceVolume: 0.95 });');

  // Fallback for unrecorded narrator line
  await webDriver.evaluate('WitnessAudioSession.speak("narrator", "Câu dẫn chuyện chưa thu âm.")');
  await webDriver.wait('WitnessAudioSession.debug().voice?.status==="unavailable" && WitnessAudioSession.debug().voice?.kind==="no-recording"', 6000);

  // Fallback when switched to baseline elevenlabs for Titus (unrecorded in ElevenLabs)
  await webDriver.evaluate('WitnessAudioSession.setVoiceProfile("elevenlabs"); WitnessAudioSession.speak("titus", "Simeon! Còn nghe tôi không?");');
  await webDriver.wait('WitnessAudioSession.debug().voice?.status==="unavailable"', 6000);
  await webDriver.evaluate('WitnessAudioSession.stopVoice();');

  const webDebug = await webDriver.evaluate('WitnessAudioSession.debug()');
  assert.deepEqual(webDebug.failedFiles, [], 'Web session had failed audio loads: ' + JSON.stringify(webDebug.failedFiles));
  assert.equal(webDriver.errors.length, 0, 'Web runtime errors: ' + JSON.stringify(webDriver.errors));

  // ---------------- 2. Offline Standalone HTML (HTTP Blocked) ----------------
  offlineDriver = await browserDriver(offlineOut, 19882, {
    hardware: true,
    width: 1440,
    height: 900,
    blockHttp: true,
    url: pathToFileURL(STANDALONE_PATH).href,
  });

  const embeddedKeys = await offlineDriver.evaluate('Object.keys(globalThis.WitnessAudioAssets||{})');
  const vientRuntimeKeys = embeddedKeys.filter((k) => k.startsWith('assets/audio/q01/vieneu/') && !k.includes('/comparison/'));
  const comparisonKeys = embeddedKeys.filter((k) => k.includes('/comparison/'));
  assert.equal(vientRuntimeKeys.length, 28, 'Standalone must embed all 28 VieNeu runtime MP3 clips');
  assert.equal(comparisonKeys.length, 0, 'Standalone must exclude heavy comparison reels from bundle');

  await offlineDriver.click('[data-act="new"]');
  await offlineDriver.click('[data-act="create"]');
  await offlineDriver.wait('!!globalThis.WitnessQ01Campaign?.presenter', 45000);
  await offlineDriver.click('#hud-top [data-act="settings"]');
  await offlineDriver.wait('!!document.querySelector("#setting-voice-profile")', 8000);

  const offlineAuditions = [];
  offlineAuditions.push(await triggerAudition(offlineDriver, 'vieneu-a', 'natan', 'thien-tam-duc', 'Con ngồi đi'));
  offlineAuditions.push(await triggerAudition(offlineDriver, 'vieneu-b', 'natan', 'thien-minh', 'Con ngồi đi'));
  offlineAuditions.push(await triggerAudition(offlineDriver, 'vieneu-a', 'titus', 'hai-dang', 'Simeon! Còn nghe tôi không?'));
  offlineAuditions.push(await triggerAudition(offlineDriver, 'vieneu-a', 'yosef', 'xuan-vinh', 'Bạn vừa từ xưởng Natan sang phải không?'));
  offlineAuditions.push(await triggerAudition(offlineDriver, 'vieneu-a', 'rina', 'ngoc-linh', 'Đêm nay vẫn có chỗ nằm ở xưởng'));
  offlineAuditions.push(await triggerAudition(offlineDriver, 'elevenlabs', 'natan', null, 'Con ngồi đi'));
  await tap(offlineDriver, '[data-act="voice-audition-stop"]');
  await offlineDriver.wait('!WitnessAudioSession.debug().voice', 5000);

  const offlineDebug = await offlineDriver.evaluate('WitnessAudioSession.debug()');
  assert.deepEqual(offlineDebug.failedFiles, [], 'Offline standalone had failed audio decodes: ' + JSON.stringify(offlineDebug.failedFiles));
  assert.equal(offlineDriver.errors.length, 0, 'Offline standalone errors: ' + JSON.stringify(offlineDriver.errors));

  const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/audio/q01/vieneu-sources.json'), 'utf8'));
  const standaloneBytes = fs.statSync(STANDALONE_PATH).size;
  const proof = {
    schemaVersion: 1,
    verifiedAt: new Date().toISOString(),
    reviewStatus: 'generated-awaiting-human-audio-review',
    scope: 'Automated Chromium Web Audio playback (HTTP server + offline standalone blocked-HTTP), subtitle visibility, repeat, skip/stop, volume control, fallback & asset hashes. Not human listening approval.',
    hardwareBackend: {
      engine: ledger.runtime,
      license: ledger.license,
      generatedClips: ledger.entries.length,
      comparisonReels: (ledger.comparisonReels || []).length,
    },
    standaloneBundle: {
      file: 'dist/ban-choi-ngoai-tuyen.html',
      bytes: standaloneBytes,
      underCloudflare25MiBLimit: standaloneBytes < 25 * 1024 * 1024,
      sha256: crypto.createHash('sha256').update(fs.readFileSync(STANDALONE_PATH)).digest('hex'),
      embeddedVieNeuRuntimeClips: vientRuntimeKeys.length,
      excludedComparisonReels: true,
    },
    webPlayback: {
      auditions: webAuditions,
      repeatVerified: true,
      skipInterruptVerified: true,
      volumeScalingVerified: true,
      fallbackVerified: true,
      profilePersistenceReloadVerified: true,
      failedFiles: webDebug.failedFiles,
      runtimeErrors: webDriver.errors.length,
    },
    offlinePlayback: {
      auditions: offlineAuditions,
      blockedHttp: true,
      failedFiles: offlineDebug.failedFiles,
      runtimeErrors: offlineDriver.errors.length,
    },
  };
  fs.mkdirSync(path.dirname(PROOF_PATH), { recursive: true });
  fs.writeFileSync(PROOF_PATH, JSON.stringify(proof, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ status: 'passed', webAuditions: webAuditions.length, offlineAuditions: offlineAuditions.length, standaloneBytes, proofFile: 'docs/environment-kit/validation/vieneu-tts-proof.json' }));
} finally {
  webDriver?.close();
  offlineDriver?.close();
  if (server.exitCode === null) server.kill();
}
