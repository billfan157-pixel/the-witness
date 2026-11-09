import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { browserDriver, delay } from './browser-driver.mjs';
const require = createRequire(import.meta.url), M = require('../witness-model.js');
const out = path.resolve('test/artifacts/char-fidelity');
fs.mkdirSync(out, { recursive: true });
const b = await browserDriver(out, 19578);
const report = { checks: [], errors: [] };
try {
  await b.send('Page.addScriptToEvaluateOnNewDocument', { source: `
    globalThis.__charMsgs=[];
    for(const kind of ['warn','error']){const old=console[kind];console[kind]=(...a)=>{__charMsgs.push({kind,text:a.map(x=>x?.message??String(x)).join(' ')});old.apply(console,a);};}
    addEventListener('error',e=>__charMsgs.push({kind:'error',text:'window:'+e.message}));` });
  const state = M.fresh(); state.settings.graphics = 'high';
  const hook = await b.send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem(${JSON.stringify(M.STORE)},${JSON.stringify(JSON.stringify(state))})` });
  await b.send('Page.reload', { ignoreCache: true });
  await b.wait('!!document.querySelector("#title-actions [data-act=continue]")', 45000);
  await b.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: hook.identifier });
  await b.click('#title-actions [data-act=continue]');
  await b.wait('!!document.querySelector("dialog")');
  await b.click('dialog [data-act=close]');
  await b.wait('!!WitnessWorld.getContext()?.scene', 45000);
  await delay(400);

  const result = await b.evaluate(`(() => {
    const { T } = WitnessWorld.getContext();
    const W = 640, H = 720;
    const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(W, H); renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    const scene = new T.Scene(); scene.background = new T.Color('#20242c');
    scene.add(new T.HemisphereLight(0xbfd4ff, 0x3a2f26, 0.6));
    const key = new T.DirectionalLight(0xffe2bb, 1.8); key.position.set(2.2, 3.0, 2.6); key.castShadow = true; scene.add(key);
    const rim = new T.DirectionalLight(0xffd9a8, 1.6); rim.position.set(-2.4, 1.4, -2.0); scene.add(rim);
    const cam = new T.PerspectiveCamera(35, W/H, .05, 80);

    const ch = AdventureCharacter.create(T, 'jesus', { appearance: 'jesus' });
    scene.add(ch.object);
    // Terrain: lateral slope + a stair step, exercising foot IK + cloth ground.
    const heightAt = (x, z) => x * 0.30 + (z > 0.15 ? 0.18 : 0);
    ch.object.userData.heightAt = heightAt;
    ch.object.position.set(0, heightAt(0, 0.4), 0.4);

    const clothMeshes = []; ch.object.traverse(o => { if (/^cloth-/.test(o.name)) clothMeshes.push(o.name); });
    function frame(t, pace, posture) { ch.animate(t, pace, 0, posture || 'idle'); renderer.render(scene, cam); }
    // settle cloth
    for (let i = 0; i < 40; i++) frame(i / 60, 0, 'idle');
    cam.position.set(0.5, 1.5, 3.1); cam.lookAt(0, 1.0, 0.4);
    frame(40 / 60, 0, 'idle');
    const flatUrl = renderer.domElement.toDataURL('image/png');
    cam.position.set(0.4, 1.5, -2.9); cam.lookAt(0, 1.0, 0.4);
    frame(40 / 60, 0, 'idle');
    const backUrl = renderer.domElement.toDataURL('image/png');
    cam.position.set(0.5, 1.5, 3.1); cam.lookAt(0, 1.0, 0.4);
    // walk: capture cloth motion delta + leg IK
    const skirt = ch.object.getObjectByName('cloth-tunic-skirt');
    const before = skirt ? Array.from(skirt.geometry.attributes.position.array.slice(0, 12)) : null;
    for (let i = 0; i < 30; i++) frame(40 / 60 + i / 60, 1.0, 'idle');
    const walkUrl = renderer.domElement.toDataURL('image/png');
    // read simulated cloth positions via the material uniform texture is GPU-side;
    // instead measure via a CPU-forced twin below. Here capture leg bone angles.
    const legAngles = {};
    ch.object.traverse(o => { if (o.isBone && /^(thigh|calf|foot)_[lr]$/.test(o.name)) legAngles[o.name] = +o.rotation.x.toFixed(3); });
    const gl = renderer.getContext(); const glErr = gl.getError();
    const msgs = __charMsgs.filter(m => /Shader|GLSL|VALIDATE|GL_INVALID|ERROR/i.test(m.text));
    ch.dispose(); renderer.dispose();
    return { clothMeshes, legAngles, glErr, msgs, flatUrl, walkUrl, backUrl };
  })()`);
  const { flatUrl, walkUrl, backUrl, ...rest } = result;
  fs.writeFileSync(path.join(out, 'body-flat.png'), Buffer.from(flatUrl.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(out, 'body-walk.png'), Buffer.from(walkUrl.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(out, 'body-back.png'), Buffer.from(backUrl.split(',')[1], 'base64'));
  report.checks.push(rest);
  console.log(JSON.stringify(rest, null, 2));

  // CPU-backend cloth motion proof + GPU backend selection, in a fresh character.
  const clothProof = await b.evaluate(`(() => {
    const { T } = WitnessWorld.getContext();
    const renderer = new T.WebGLRenderer({ antialias: false });
    renderer.setSize(64, 64);
    const scene = new T.Scene(); const cam = new T.PerspectiveCamera(40, 1, .05, 50); cam.position.set(0, 1.2, 2.4); cam.lookAt(0, 1, 0);
    scene.add(new T.HemisphereLight(0xffffff, 0x444444, 1.2));
    const ch = AdventureCharacter.create(T, 'jesus', { appearance: 'jesus' });
    scene.add(ch.object); ch.object.userData.heightAt = () => 0;
    let err = null;
    const mantle = ch.cloth.find(c => c.mesh.name === 'cloth-wool-mantle');
    const skirt = ch.cloth.find(c => c.mesh.name === 'cloth-tunic-skirt');
    const sample = () => mantle ? Array.from(mantle.positions.slice(mantle.positions.length - 12)) : null;
    let before = null, after = null, moved = 0;
    try {
      for (let i = 0; i < 40; i++) { ch.animate(i / 60, i > 12 ? 1 : 0, 0, 'idle'); renderer.render(scene, cam); if (i === 15) before = sample(); }
      after = sample();
      if (before && after) for (let i = 0; i < before.length; i++) moved = Math.max(moved, Math.abs(before[i] - after[i]));
    } catch (e) { err = String(e && e.stack || e); }
    const res = { err, glErr: renderer.getContext().getError(),
      backends: ch.cloth.map(c => ({ name: c.mesh.name, backend: c.backend })),
      mantleMoved: +moved.toFixed(4) };
    ch.dispose(); renderer.dispose();
    return res;
  })()`);
  report.checks.push({ clothBackends: clothProof });
  console.log('CLOTH ' + JSON.stringify(clothProof));
  report.errors = await b.evaluate('globalThis.__charMsgs.filter(m=>m.kind==="error")');
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  if (report.errors.length) { console.error('ERRORS', JSON.stringify(report.errors)); process.exitCode = 1; }
} catch (e) {
  console.error('VERIFY FAIL', e.stack || e);
  await b.shot('verify-failure.png');
  process.exitCode = 1;
} finally { b.close(); }