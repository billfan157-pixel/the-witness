import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {browserDriver,delay} from './browser-driver.mjs';import M from '../witness-model.js';
const require=createRequire(import.meta.url),sharp=require('../tools/environment-kit/node_modules/sharp');
const out=path.resolve('outputs/q01-phase-b/lighting'),b=await browserDriver(out,19865,{hardware:true,width:1440,height:900}),report={build:JSON.parse(fs.readFileSync('dist/build-info.json')).revision,states:[]};
async function diagnostic(){return b.evaluate(`(()=>{const r=AdventureVisuals.getRenderer(),gl=r.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return {gi:WitnessWorld.getContext().scene.userData.q01GI,spatial:lightEngine.spatial(),glError:gl.getError(),gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),failed:r.info.programs.filter(p=>p.diagnostics&&!p.diagnostics.runnable).map(p=>p.diagnostics)};})()`);}
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`let api;Object.defineProperty(globalThis,'Adventure3D',{configurable:true,get(){return api},set(v){api=v;const make=v.create;v.create=o=>{const e=make({...o,status(s){globalThis.lightLast=s;o.status?.(s);}});globalThis.lightEngine=e;return e;};}});`});
 const s=M.fresh();s.positions['Q01.mortal']=[-23,-8.4];s.settings.cameraMode='first';await b.seed(s);
 await b.click('[data-act=settings]');await b.select('#setting-graphics','ultra');await b.click('[data-act=settings-save]');
 report.geometry=await b.evaluate(`(()=>{const s=WitnessWorld.getContext().scene,tri=g=>{let n=0;g.traverse(o=>{if(o.isMesh)n+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1)});return n};return {warehouse:tri(s.userData.architecture.group),phaseBQuayAndDressing:tri(s.userData.q01PhaseB.group),inheritedHarborFinish:tri(s.userData.q01.group),scope:'asset geometry only; not shadow/reflection/postprocessing frame totals'};})()`);
 await b.evaluate(`(()=>{const a=WitnessWorld.getContext().scene.userData.architecture;lightArrived=false;lightEngine.walk([-23,-11.5],()=>lightArrived=true,.08,{at:[-23,-11.5],floorY:a.base,surfaceId:'q01-room'});})()`);await b.wait('!!globalThis.lightArrived',60000);
 for(const [i,lighting]of ['day','evening','day','evening'].entries()){
  if(i){await b.click('[data-act=q01-light]');await delay(900);}
  await b.evaluate(`(()=>{const e=lightEngine,p=e.spatial();e.view('first');e.rotate(Math.atan2(-(-26.5-p.x),-(-14.5-p.z))-lightLast.yaw);})()`);await delay(1000);
  const d=await diagnostic();report.states.push({...d,lighting});await b.shot(`${i}-${lighting}.png`);
  assert.equal(d.failed.length,0,'Shader compilation failed: '+JSON.stringify(d.failed));assert.equal(d.glError,0,'GL error at '+lighting);
  if(i===0){
   await b.evaluate('WitnessWorld.getContext().scene.userData.q01GIDebug.setEnabled(false)');await delay(500);await b.shot('control-unoccluded-ambient.png');
   await b.evaluate('WitnessWorld.getContext().scene.userData.q01GIDebug.setEnabled(true)');await delay(500);
   const clip={left:380,top:330,width:660,height:350};const [on,off]=await Promise.all(['0-day.png','control-unoccluded-ambient.png'].map(f=>sharp(path.join(out,f)).extract(clip).removeAlpha().raw().toBuffer()));
   let delta=0;for(let k=0;k<on.length;k++)delta+=Math.abs(on[k]-off[k]);report.giImageMeanAbsoluteDelta=delta/on.length;assert(report.giImageMeanAbsoluteDelta>2,'Baked GI had no visible effect');
  }
 }
 report.frameCadence=await b.evaluate(`new Promise(resolve=>{const samples=[],start=performance.now();function tick(t){samples.push(t);if(performance.now()-start<2600)requestAnimationFrame(tick);else{const d=samples.slice(1).map((v,i)=>v-samples[i]).sort((a,b)=>a-b);resolve({samples:d.length,medianMs:d[Math.floor(d.length*.5)],p95Ms:d[Math.floor(d.length*.95)],scope:'warm headless requestAnimationFrame cadence on this GPU, including active scene simulation; no display or physical phone certification'});}}requestAnimationFrame(tick);})`);
 assert.deepEqual(b.errors,[]);report.status='passed';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,states:report.states.length,imageDelta:report.giImageMeanAbsoluteDelta,cadence:report.frameCadence}));
}catch(e){report.status='failed';report.error=e.stack;report.errors=b.errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await b.shot('failure.png');throw e;}finally{b.close();}
