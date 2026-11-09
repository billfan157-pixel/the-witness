import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {browserDriver,delay} from './browser-driver.mjs';
import M from '../witness-model.js';
const out=path.resolve('outputs/q01-gold');
const b=await browserDriver(out,19732,{hardware:true,width:1440,height:900});
const report={scope:'Q01 scripted gameplay and image evidence; artistic approval and human playtest pending',checks:[],images:[],performance:[]};
const hook=`let api;Object.defineProperty(globalThis,'Adventure3D',{configurable:true,get(){return api},set(v){api=v;const create=v.create;v.create=options=>{const e=create({...options,status(s){globalThis.goldLast=s;options.status?.(s);}});globalThis.goldEngine=e;return e;}}});`;
async function shot(name){await delay(650);await b.shot(name+'.png');report.images.push(name+'.png');}
async function go(id){await b.evaluate(`goldEngine.walkTarget(${JSON.stringify(id)},()=>globalThis.goldArrived=true,1.3);goldArrived=false`);await b.wait(`goldEngine.within(${JSON.stringify(id)})&&!goldLast.walking`,90000);}
async function face(at,view='first'){await b.evaluate(`(()=>{const e=goldEngine,p=e.spatial(),yaw=Math.atan2(-(${at[0]}-p.x),-(${at[1]}-p.z));e.view(${JSON.stringify(view)});e.rotate(yaw-goldLast.yaw);})()`);await delay(250);}
async function stats(name){
 await b.evaluate('goldSamples=[];goldCollect=true');await delay(2800);
 const p=await b.evaluate(`(()=>{goldCollect=false;const data=goldSamples,quantile=(k,q)=>{const a=data.map(x=>x[k]).sort((a,b)=>a-b);return a[Math.floor((a.length-1)*q)]},dt=data.slice(1).map((x,i)=>x.t-data[i].t).sort((a,b)=>a-b);return {name:${JSON.stringify(name)},samples:data.length,cpuSubmitMedianMs:quantile('cpuSubmitMs',.5),cpuSubmitP95Ms:quantile('cpuSubmitMs',.95),renderIntervalMedianMs:dt[Math.floor(dt.length*.5)],renderIntervalP95Ms:dt[Math.floor(dt.length*.95)],callsMedian:quantile('calls',.5),callsP95:quantile('calls',.95),trianglesP95:quantile('triangles',.95),...goldStats,position:goldEngine.spatial(),camera:goldEngine.cameraState()};})()`);
 report.performance.push(p);
}
async function toggle(){const before=await b.evaluate('goldEngine.spatial()');await b.click('[data-act=q01-light]');await b.wait('!!WitnessWorld.getContext().scene.userData.q01');await delay(1200);const after=await b.evaluate('goldEngine.spatial()');assert(Math.hypot(before.x-after.x,before.y-after.y,before.z-after.z)<.04);report.checks.push('lighting switch preserves '+before.supportId);}
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:hook});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`let visuals;Object.defineProperty(globalThis,'AdventureVisuals',{configurable:true,get(){return visuals},set(v){visuals=v;const make=v.createPipeline;v.createPipeline=(T,renderer,q)=>{const p=make(T,renderer,q),render=p.render.bind(p);p.render=(scene,camera,...rest)=>{renderer.info.reset();renderer.info.autoReset=false;const t=performance.now(),result=render(scene,camera,...rest),gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');globalThis.goldStats={cpuSubmitMs:performance.now()-t,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,gpu:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),buffer:[renderer.domElement.width,renderer.domElement.height]};if(globalThis.goldCollect){globalThis.goldSamples??=[];goldSamples.push({...goldStats,t:performance.now()});}renderer.info.autoReset=true;return result;};return p;};}});`});
 await b.seed(M.fresh());
 report.assets=await b.evaluate(`(()=>{const scene=WitnessWorld.getContext().scene,actor=scene.getObjectByName('companion-titus'),materials={},triangles={hero:0,architecture:0,finish:0};for(const [key,group]of [['hero',actor],['architecture',scene.userData.architecture.group],['finish',scene.userData.q01.group]])group.traverse(o=>{if(o.isMesh)triangles[key]+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);for(const m of [o.material].flat().filter(Boolean))if(m.map&&m.userData.q01Material)materials[m.userData.q01Material]={width:m.map.image?.width,albedo:m.map.colorSpace,normal:m.normalMap?.colorSpace,orm:m.roughnessMap?.colorSpace};});return {hero:actor.userData.q01Hero,triangles,materials};})()`);
 assert.equal(report.assets.hero.name,'Titus');
 await go('companion-titus');await face([-23,4],'third');await shot('day-third-titus');await face([-23,4]);await shot('day-first-titus');await stats('day balanced hero');
 await b.evaluate(`goldEngine.inspect([-23,4],{height:1.44,distance:1.6,bearing:.23})`);await shot('day-titus-portrait');await b.evaluate('goldEngine.pause(false)');
 await go('architecture:store-entry');await face([-23,-13],'third');await shot('day-third-door');
 await face([-23,-13]);await shot('day-first-door');
 await b.evaluate(`goldEngine.walk([-23,-12],()=>globalThis.inRoom=true,.3,{at:[-23,-12],floorY:WitnessWorld.getContext().scene.userData.architecture.base,surfaceId:'q01-room'})`);await b.wait('!!globalThis.inRoom',30000);await face([-26.4,-13]);await shot('day-first-interior');
 await go('architecture:roof-rack');assert((await b.evaluate('goldEngine.spatial().supportId')).startsWith('q01-roof'));await face([-19,-24]);await shot('day-first-roof');await stats('day balanced roof');
 await toggle();assert.equal(await b.evaluate('WitnessWorld.getContext().scene.userData.q01.lighting'),'evening');await face([-19,-24]);await shot('evening-first-roof');
 await go('architecture:store-entry');await face([-23,-13],'third');await shot('evening-third-door');await stats('evening balanced exterior');
 await go('companion-titus');await b.evaluate(`goldEngine.inspect([-23,4],{height:1.44,distance:1.6,bearing:.23})`);await shot('evening-titus-portrait');await b.evaluate('goldEngine.pause(false)');
 await go('architecture:roof-rack');await face([-19,-24],'third');await shot('evening-third-roof');report.checks.push('both views traverse harbor / door / room / stairs / roof; both lighting states');
 await go('architecture:store-entry');await b.evaluate(`goldEngine.walkTarget('load',()=>globalThis.loadReached=true,1.2)`);await b.wait('!!globalThis.loadReached',90000);await b.click('[data-world-target="load"]');await b.wait('!!document.querySelector("[data-act=perform]")');await shot('quest-preserved');await b.click('dialog [data-act=close]');report.checks.push('Q01 load mission still reachable and interactive');
 await b.click('[data-act=settings]');await b.select('#setting-graphics','ultra');await b.click('[data-act=settings-save]');
 await toggle(); // evening -> daylight also rebuilds with full 1024 px materials.
 await go('architecture:store-entry');await face([-23,-13],'third');await shot('day-ultra-third-door');
 await go('architecture:roof-rack');await face([-18,-28],'third');await shot('day-ultra-third-harbor');await stats('day ultra roof');
 const full=await b.evaluate(`(()=>{const s=WitnessWorld.getContext().scene,found=[];s.userData.architecture.group.traverse(o=>{if(o.material?.map)found.push(o.material.map.image?.width)});return {widths:[...new Set(found)],graphics:s.userData.graphicsStatus};})()`);
 assert.deepEqual(full.widths,[1024]);assert.equal(full.graphics.gtao,true);report.fullQuality=full;
 await go('companion-titus');await b.evaluate(`goldEngine.inspect([-23,4],{height:1.44,distance:1.6,bearing:.23})`);await shot('day-ultra-titus');await b.evaluate('goldEngine.pause(false)');
 await toggle();await b.evaluate(`goldEngine.inspect([-23,4],{height:1.44,distance:1.6,bearing:.23})`);await shot('evening-ultra-titus');await b.evaluate('goldEngine.pause(false)');
 await go('architecture:store-entry');await face([-23,-13],'third');await shot('evening-ultra-third-door');
 report.checks.push('full quality loads 1024 px maps with GTAO and both lighting modes');
 assert.deepEqual(b.errors,[]);report.status='passed';fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=e.stack;report.runtimeErrors=b.errors;fs.writeFileSync(path.join(out,'browser-failure.json'),JSON.stringify(report,null,2));await b.shot('gold-failure.png');throw e;}finally{b.close();}
