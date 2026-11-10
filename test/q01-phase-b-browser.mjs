import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {browserDriver,delay} from './browser-driver.mjs';
import M from '../witness-model.js';
const baseline=process.argv.includes('--baseline'),offline=process.argv.includes('--offline'),quick=process.argv.includes('--quick');
const variant=baseline?'baseline':offline?'offline':quick?'smoke':'candidate',out=path.resolve('outputs/q01-phase-b',variant);
const b=await browserDriver(out,19861,{hardware:true,width:1440,height:900,...(offline?{url:pathToFileURL(path.resolve('dist/ban-choi-ngoai-tuyen.html')).href,blockHttp:true}:{})});
const report={variant,build:fs.existsSync('dist/build-info.json')?JSON.parse(fs.readFileSync('dist/build-info.json')).revision:null,scope:'Continuous Q01 gameplay cameras; no teleport or cinematic inspection camera',shots:[],checks:[]};
async function walk(p){
 const accepted=await b.evaluate(`(()=>{const p=${JSON.stringify(p)};phaseBArrived=false;phaseBEngine.pause(false);return phaseBEngine.walk([p.x,p.z],()=>phaseBArrived=true,.08,{at:[p.x,p.z],floorY:p.y,surfaceId:p.supportId});})()`);assert(accepted,'No navigable route to '+p.id);
 try{await b.wait('!!globalThis.phaseBArrived',90000);}catch(e){report.navigationFailure=await b.evaluate('({spatial:phaseBEngine.spatial(),nav:phaseBEngine.navigationState()})');report.navigationFailure.goal=p;throw e;}
 const at=await b.evaluate('phaseBEngine.spatial()');assert(Math.hypot(at.x-p.x,at.z-p.z)<.20,'Waypoint '+JSON.stringify({p,at}));
}
async function capture(point,lighting){
 for(const view of ['first','third']){
  await b.evaluate(`(()=>{const e=phaseBEngine,p=e.spatial();e.view(${JSON.stringify(view)});const target=Math.atan2(-(${point.look[0]}-p.x),-(${point.look[1]}-p.z));e.rotate(target-phaseBLast.yaw);})()`);
  await delay(550);const file=`${lighting}-${point.id}-${view}.png`;await b.shot(file);
  report.shots.push({point:point.id,lighting,view,file,...await b.evaluate('({spatial:phaseBEngine.spatial(),camera:phaseBEngine.cameraState()})')});
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({...report,status:'running'},null,2));
 }
 console.log('CAPTURE '+lighting+' '+point.id);
}
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`let api;Object.defineProperty(globalThis,'Adventure3D',{configurable:true,get(){return api},set(v){api=v;const make=v.create;v.create=o=>{const e=make({...o,status(s){globalThis.phaseBLast=s;o.status?.(s);}});globalThis.phaseBEngine=e;return e;};}});`});
 const s=M.fresh();s.positions['Q01.mortal']=[-23,6.4];s.settings.cameraMode='first';await b.seed(s);await delay(1000);
 if(!baseline&&!offline){await b.click('[data-act=settings]');await b.select('#setting-graphics','ultra');await b.click('[data-act=settings-save]');await delay(800);}
 const points=await b.evaluate(`(()=>{const a=WitnessWorld.getContext().scene.userData.architecture,h=WitnessWorld.getContext().scene.userData.terrainHeight;return [
  {id:'cargo-court',x:-23,z:6.4,y:h(-23,6.4),supportId:'world',look:[-23,2]},
  {id:'warehouse-approach',x:-23,z:-4,y:h(-23,-4),supportId:'world',look:[-23,-12]},
  {id:'door-threshold',x:-23,z:-8.4,y:h(-23,-8.4),supportId:'world',look:[-23,-13]},
  {id:'interior-goods',x:-23,z:-11.5,y:a.base,supportId:'q01-room',look:[-26.5,-14.5]},
  {id:'interior-return',x:-23,z:-15.3,y:a.base,supportId:'q01-room',look:[-23,-8]},
  {id:'stair-foot',...a.nodes[3],look:[-19.8,-16.6]},
  {id:'stair-middle',...a.nodes[12],look:[-19.8,-17]},
  {id:'roof-landing',...a.nodes[22],look:[-24.5,-14]},
  {id:'roof-harbor',...a.nodes[24],look:[-6,-35]},
  ...(${baseline||offline}?[]:[
   {id:'quay-transition',x:-30.8,z:-20,y:h(-30.8,-20),supportId:'world',look:[-25,-13]},
   {id:'quay-edge',x:-31,z:WitnessQ01Environment.shore(-31)+.61,y:a.supports(-31,WitnessQ01Environment.shore(-31)+.61).find(p=>p.supportId==='q01-quay').y,supportId:'q01-quay',look:[12,-32]},
   {id:'cart-handoff',x:-10,z:8.4,y:h(-10,8.4),supportId:'world',look:[-10,6]},
   {id:'natan-court',x:-5,z:1.5,y:h(-5,1.5),supportId:'world',look:[-5,-1]},
   {id:'rina-court',x:8,z:6.2,y:h(8,6.2),supportId:'world',look:[8,4]},
   {id:'lodging-front',x:15,z:-3.7,y:h(15,-3.7),supportId:'world',look:[15,-6]},
   {id:'gate-return',x:20,z:9.3,y:h(20,9.3),supportId:'world',look:[20,7]},
   {id:'arrival-vista',x:0,z:20,y:h(0,20),supportId:'world',look:[-6,-17]}
  ])
 ];})()`);
 const selected=quick?[points[0],points[2],points[3],points[7],points[8]]:points;
 report.points=selected;report.quality=offline||baseline?'balanced':'ultra';
 for(const lighting of ['day','evening']){
  if(lighting==='evening'){await b.click('[data-act=q01-light]');await delay(1000);}
  const route=lighting==='day'?selected:[...selected].reverse();
  for(const p of route){await walk(p);await capture(p,lighting);
   if(p.id==='quay-edge'&&lighting==='day'){
    const before=await b.evaluate('phaseBEngine.spatial()');await b.evaluate('globalThis.__quayReload=true');await b.send('Page.reload',{ignoreCache:false});await b.wait('!globalThis.__quayReload&&!!document.querySelector("#title-actions [data-act=continue]")',45000);await b.click('#title-actions [data-act=continue]');await b.wait('!!document.querySelector("dialog")');await b.click('dialog [data-act=close]');await delay(400);
    const after=await b.evaluate('phaseBEngine.spatial()');assert.equal(after.supportId,'q01-quay');assert(Math.hypot(before.x-after.x,before.y-after.y,before.z-after.z)<.04);report.quayReload={before,after};
   }
  }
 }
 if(!baseline&&!quick){
  assert(await b.evaluate(`phaseBEngine.walkTarget('load',()=>globalThis.phaseBLoad=true,1.2)`));await b.wait('!!globalThis.phaseBLoad',90000);
  await b.click('[data-world-target="load"]');await b.wait('!!document.querySelector("dialog [data-act=perform]")');await b.click('dialog [data-act=perform]');await b.wait('!document.querySelector("#field-work").hidden');
  for(const id of ['block','lash','unload','brace','test','remove']){await b.click(`[data-act=field-go][data-id="field:${id}"]`);await b.wait(`JSON.parse(localStorage.getItem(WitnessModel.STORE)).workshop.drafts['Q01.LOAD'].payload.order.includes('${id}')`,60000);}
  await b.click('[data-act=field-handoff]');await b.wait(`JSON.parse(localStorage.getItem(WitnessModel.STORE)).quests.Q01.done.includes('brace')`,60000);await b.shot('physical-cart-complete.png');report.checks.push('Actual Q01 cart encounter completed by walking every field station and handing off the work');
 }
 report.scene=await b.evaluate(`(()=>{const {T,scene}=WitnessWorld.getContext(),materials=new Set(),bad=[];scene.traverse(o=>{if(o.isMesh){for(const m of [o.material].flat().filter(Boolean))materials.add(m);const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)if(!Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i))){bad.push(o.name);break;}}});const {group,...phaseB}=scene.userData.q01PhaseB||{};return {phaseB:scene.userData.q01PhaseB?phaseB:null,gi:scene.userData.q01GI??null,materials:[...materials].filter(m=>m.userData.phaseB).map(m=>m.userData.phaseB),bad,shaderFailures:AdventureVisuals.getRenderer().info.programs.filter(p=>p.diagnostics&&!p.diagnostics.runnable).length,glError:AdventureVisuals.getRenderer().getContext().getError()};})()`);
 assert.deepEqual(report.scene.bad,[]);assert.equal(report.scene.glError,0);assert.equal(report.scene.shaderFailures,0);assert.deepEqual(b.errors,[]);
 if(!baseline){assert(report.scene.phaseB,'Missing Phase B environment');assert(report.scene.gi?.baked,'Missing static GI');report.checks.push('Phase B environment and baked GI loaded with finite geometry and no GL/runtime errors');}
 if(!baseline){report.legacyFloatingRoots=await b.evaluate(`WitnessWorld.getContext().scene.children.filter(o=>o.visible&&o.isGroup&&!o.name&&Math.hypot(o.position.x,o.position.z)>1&&WitnessQ01Environment.clear(o.position.x,o.position.z)).map(o=>o.position.toArray())`);assert.deepEqual(report.legacyFloatingRoots,[],'Starter prefabs retain obsolete terrain heights');report.checks.push('No visible anonymous starter prefab roots retain the obsolete terrain heights inside the authored port');}
 if(offline){report.httpResources=await b.evaluate('performance.getEntriesByType("resource").filter(r=>/^https?:/.test(r.name)).map(r=>r.name)');assert.deepEqual(report.httpResources,[]);}
 report.checks.push('All '+selected.length+' critical stops walked continuously, both gameplay views, day and evening');
 report.status='passed';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,shots:report.shots.length}));
}catch(e){report.status='failed';report.error=e.stack;report.runtimeErrors=b.errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await b.shot('failure.png');throw e;}finally{b.close();}
