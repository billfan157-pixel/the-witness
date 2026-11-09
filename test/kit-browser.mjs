import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {browserDriver,delay} from './browser-driver.mjs';
import M from '../witness-model.js';
const out=path.resolve('outputs/environment-kit/proof');
const b=await browserDriver(out,19581),report={baseline:[],checks:[]};
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`
  globalThis.kitMessages=[];const err=console.error;console.error=(...a)=>{kitMessages.push(a.map(String).join(' '));err(...a);};
  let api;Object.defineProperty(globalThis,'Adventure3D',{configurable:true,get(){return api},set(v){api=v;const make=v.create;v.create=(...a)=>{const e=make(...a);globalThis.kitQAEngine=e;return e;};}});`});
 await b.send('Emulation.setDeviceMetricsOverride',{width:1000,height:720,deviceScaleFactor:1,mobile:false});
 await b.seed(M.fresh());await b.wait('!!globalThis.kitQAEngine');
 // Capture twelve repeatable pre-kit scene views, without stale chapter UI.
 await b.evaluate(`(()=>{const style=document.createElement('style');style.textContent='#game > :not(#world){visibility:hidden!important} .adv-markers{display:none!important}';document.head.append(style);kitQAEngine.setQuality('high');})()`);
 for(const sceneId of ['Q01','L04']){
  const fixture=M.fresh();
  if(sceneId==='L04'){fixture.chapter=9;fixture.layer={kind:'legend',id:'L04',step:0,format:'interactive',summaryIndex:0,receipts:[],discovered:[],route:'near',composure:84,attunements:[],replay:false};}
  const layout=await b.evaluate(`WitnessWorld.layout(${JSON.stringify(fixture)})`);
  const candidates=[layout.start,...layout.nodes];const points=candidates.filter((p,i)=>candidates.findIndex(q=>q[0]===p[0]&&q[1]===p[1])===i).slice(0,6);
  assert.equal(points.length,6,sceneId+' needs six distinct baseline anchors');
  for(let i=0;i<6;i++){
   await b.evaluate(`(()=>{const s=${JSON.stringify(fixture)},e=kitQAEngine;WitnessWorld.setState(s);const d=WitnessWorld.descriptor(s);e.load(d.base,${JSON.stringify(points[i])},WitnessWorld.layout(s),true);WitnessWorld.decorate(s);const p=WitnessWorld.plan(s);e.update(p.objects,p.targets,{});e.view('third');e.recenter();e.rotate(${i*.45});e.pause(false);})()`);
   await delay(650);await b.shot(sceneId+'-'+(i+1)+'.png');
   const actual=await b.evaluate('({...document.querySelector("#world").dataset})');
   report.baseline.push({sceneId,index:i+1,requestedPlayer:points[i],actualPlayer:[Number(actual.playerX),Number(actual.playerZ)],yawOffset:i*.45,view:'third',graphics:'high',viewport:[1000,720],file:sceneId+'-'+(i+1)+'.png'});
  }
  console.log('PASS baseline '+sceneId+' x6');
 }
 await b.evaluate('kitQAEngine.pause(true)');
 const probe=await b.evaluate(`(async()=>{
  const {T}=WitnessWorld.getContext();WitnessKit.init(T);
  const {assets}=await WitnessKit.loadPack('./assets/environment-kit/cae/manifest.json');
  const asset=assets[0],transforms=Array.from({length:200},(_,i)=>({position:[(i%20)*5,0,Math.floor(i/20)*5]}));
  const result=WitnessKit.instances(asset,transforms);
  const rotated=WitnessKit.instances(asset,[{position:[10,0,20],yaw:Math.PI/2,scale:[2,1,1]}]);
  const scene=new T.Scene();scene.background=new T.Color('#303c46');scene.add(result.mesh,new T.HemisphereLight(0xffffff,0x514a3c,2));
  const camera=new T.PerspectiveCamera(45,1.4,.1,300);camera.position.set(110,80,100);camera.lookAt(45,0,20);
  const renderer=new T.WebGLRenderer();renderer.setSize(700,500);renderer.render(scene,camera);
  const target=new T.WebGLRenderTarget(140,100);renderer.setRenderTarget(target);renderer.render(scene,camera);
  const pixels=new Uint8Array(140*100*4);renderer.readRenderTargetPixels(target,0,0,140,100,pixels);
  const unique=new Set();for(let i=0;i<pixels.length;i+=4)unique.add(pixels[i]+','+pixels[i+1]+','+pixels[i+2]);
  const glError=renderer.getContext().getError();
  const answer={sameCore:result.mesh instanceof T.InstancedMesh,count:result.mesh.count,solids:result.solids.length,rotatedCircle:rotated.solids[0],visibleColors:unique.size,glError};
  renderer.setRenderTarget(null);renderer.render(scene,camera);const img=renderer.domElement.toDataURL();
  target.dispose();renderer.dispose();return {...answer,image:img};
 })()`);
 const image=probe.image;delete probe.image;fs.writeFileSync(path.join(out,'wall-200.png'),Buffer.from(image.split(',')[1],'base64'));
 assert.equal(probe.sameCore,true);assert.equal(probe.count,200);assert.equal(probe.solids,800);
 assert(Math.abs(probe.rotatedCircle[0]-10)<.001&&Math.abs(probe.rotatedCircle[1]-23)<.001&&Math.abs(probe.rotatedCircle[2]-1.1)<.001,JSON.stringify(probe));
 assert(probe.visibleColors>3);assert.equal(probe.glError,0);report.checks.push({name:'200 GLB instances, shared core, transformed footprints and rendered image',...probe});
 await b.send('Network.setBlockedURLs',{urls:['http://*','https://*']});
 await b.send('Page.navigate',{url:pathToFileURL(path.resolve('dist/ban-choi-ngoai-tuyen.html')).href});
 await b.wait('!!globalThis.WitnessKit&&!!globalThis.WitnessWorld?.getContext()',45000);
 const offline=await b.evaluate(`(async()=>{const {T}=WitnessWorld.getContext();WitnessKit.init(T);const p=await WitnessKit.loadPack('./assets/environment-kit/cae/manifest.json');return {assets:p.assets.length,valid:p.assets[0].scene instanceof T.Group,embedded:!!WitnessKitAssets['assets/environment-kit/cae/manifest.json'],messages:kitMessages};})()`);
 assert.equal(offline.assets,1);assert.equal(offline.valid,true);assert.equal(offline.embedded,true);assert.deepEqual(offline.messages,[]);
 report.checks.push({name:'Standalone GLB and manifest with network blocked',...offline});assert.deepEqual(b.errors,[]);
 report.status='passed';report.limits=['KTX2 / Meshopt not yet integrated','No 3D traversal acceptance','No physical-device FPS measurement','Baseline fixtures are scene captures, not a campaign playthrough'];
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:'passed',baselines:report.baseline.length,checks:report.checks,limits:report.limits}));
}catch(error){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:error.stack,errors:b.errors,report},null,2));await b.shot('failure.png');throw error;}finally{b.close();}
