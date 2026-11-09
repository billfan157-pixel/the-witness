import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';
import {browserDriver,delay} from './browser-driver.mjs';import M from '../witness-model.js';
const out=path.resolve('outputs/environment-kit/phase3');fs.mkdirSync(out,{recursive:true});
const b=await browserDriver(out,19706,{hardware:true,width:1100,height:800});
const report={checks:[],runs:[],scope:'Actual gameplay movement in the Q01 blockout; scripted input, hardware WebGL, not human playtesting'};
const hook=`let api;Object.defineProperty(globalThis,'Adventure3D',{configurable:true,get(){return api},set(v){api=v;const make=v.create;v.create=options=>{const e=make({...options,status(next){globalThis.phase3Last=next;const ar=globalThis.WitnessWorld?.getContext()?.scene.userData.architecture,p=next.spatial;if(ar&&p){const cam=e.cameraState(),eye={x:p.x,y:p.y+1.45,z:p.z},clip=ar.camera(eye,cam.position);globalThis.phase3Trace??=[];phase3Trace.push({t:performance.now(),...p,camera:cam.position,view:cam.view,collision:ar.collides(p),cameraError:Math.hypot(clip.x-cam.position.x,clip.y-cam.position.y,clip.z-cam.position.z)});}options.status?.(next);}});globalThis.phase3Engine=e;return e;}}});`;
async function key(key,code,down){await b.send('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key,code,windowsVirtualKeyCode:key.toUpperCase().charCodeAt(0)});}
async function go(id){await b.click('[data-act=map]');await b.wait('!!document.querySelector("[data-act=explore-place]")');await b.click(`[data-act=explore-place][data-id="${id}"]`);}
async function reached(id,limit=70000){await b.wait(`phase3Engine.within(${JSON.stringify(id)})&&!phase3Last.walking`,limit);}
async function trace(name){const frames=await b.evaluate('phase3Trace');assert(frames.length>20,'No real movement trace');
 const collisions=frames.filter(x=>x.collision),camera=frames.filter(x=>x.cameraError>.025);assert.deepEqual(collisions,[],name+' capsule penetrates a collider');assert.deepEqual(camera,[],name+' camera penetrates its clearance volume');
 const geometry=await b.evaluate('globalThis.phase3GeometryErrors??[]');assert.deepEqual(geometry,[],name+' collision against actual rendered geometry');
 const support=[...new Set(frames.map(x=>x.supportId))],steps=support.filter(x=>x.startsWith('q01-step'));assert.equal(steps.length,18,name+' did not traverse all steps');assert(support.includes('q01-room'));assert(support.some(x=>x.startsWith('q01-roof')));
 fs.writeFileSync(path.join(out,name+'-trace.json'),JSON.stringify(frames));report.runs.push({name,frames:frames.length,supports:support,cameraCollisions:camera.length,bodyCollisions:collisions.length,independentGeometryErrors:geometry.length});return frames;
}
async function continueAfterReload(){await b.evaluate('globalThis.__nav=true');await b.send('Page.reload',{ignoreCache:false});await b.wait('!globalThis.__nav&&!!globalThis.phase3Engine&&!!document.querySelector("#title-actions [data-act=continue]")',45000);await b.click('#title-actions [data-act=continue]');await b.wait('!!document.querySelector("dialog")');await b.click('dialog [data-act=close]');await delay(200);}
async function reloadAt(name){await key('w','KeyW',false);await delay(180);const before=await b.evaluate('phase3Engine.spatial()');await continueAfterReload();const after=await b.evaluate('phase3Engine.spatial()');assert.equal(after.supportId,before.supportId,name);assert(Math.hypot(before.x-after.x,before.y-after.y,before.z-after.z)<.04,name+' restored at another position');await b.shot(name+'.png');report.checks.push({name:'reload '+name,before,after});}
async function walkKeys(goal){
 let previous=Infinity,stuck=0;
 await key('w','KeyW',true);
 try{for(let n=0;n<500;n++){
  const pos=await b.evaluate('({...phase3Engine.spatial(),yaw:phase3Last.yaw})'),dx=goal.x-pos.x,dz=goal.z-pos.z,d=Math.hypot(dx,dz);
  if(d<.045&&Math.abs(pos.y-goal.y)<.24)return;
  if(Math.abs(previous-d)<.002)stuck++;else stuck=0;if(stuck>25)throw Error('Keyboard movement stuck: '+JSON.stringify({pos,goal}));previous=d;
  const yaw=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(yaw-pos.yaw),Math.cos(yaw-pos.yaw));await b.evaluate(`phase3Engine.rotate(${delta})`);await delay(65);
 }}finally{await key('w','KeyW',false);await delay(70);}
 throw Error('Keyboard waypoint timeout');
}
try{
 const geometryHook=`
  const originalHook=AdventureVisuals.createPipeline;
  AdventureVisuals.createPipeline=(T,renderer,quality)=>{
   const pipeline=originalHook(T,renderer,quality),render=pipeline.render.bind(pipeline);let frame=0,lastGroup,boxes=[];
   const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0),v=new T.Vector3();
   pipeline.render=(scene,camera,...rest)=>{const result=render(scene,camera,...rest),ar=scene.userData.architecture,p=globalThis.phase3Engine?.spatial();
    if(ar&&p&&++frame%8===0){
     if(lastGroup!==ar.group){lastGroup=ar.group;boxes=[];ar.group.traverse(o=>{if(o.isMesh)boxes.push({name:o.name,box:new T.Box3().setFromObject(o,true)});});}
     const errors=[];v.copy(camera.position);
     for(const {name,box}of boxes){
      if(box.distanceToPoint(v)<.16)errors.push('camera:'+name);
      if(box.max.y<=p.y+.23||box.min.y>=p.y+1.65||box.max.y<=p.y+.32)continue;
      const dx=p.x-Math.max(box.min.x,Math.min(box.max.x,p.x)),dz=p.z-Math.max(box.min.z,Math.min(box.max.z,p.z));if(dx*dx+dz*dz<.28**2)errors.push('torso:'+name);
     }
     ray.set(new T.Vector3(p.x,p.y+.07,p.z),down);ray.far=.12;const ground=scene.getObjectByName('witness-terrain'),hit=ray.intersectObjects([ground,ar.group],true)[0];
     if(!hit||Math.abs(hit.point.y-p.y)>.025)errors.push('unsupported-feet');
     if(errors.length){globalThis.phase3GeometryErrors??=[];phase3GeometryErrors.push({p,camera:{...camera.position},errors});}
    }return result;};return pipeline;
  };`;
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:hook.replace('const e=make',geometryHook+';const e=make')});await b.seed(M.fresh());
 const before=await b.read(),stable=s=>({quests:s.quests,evidence:s.evidence,consent:s.consent,skills:s.skills,resources:s.resources});
 await b.evaluate('phase3Trace=[]');await go('architecture:roof-rack');await reached('architecture:roof-rack');
 await b.shot('third-roof.png');await trace('third-up');
 await b.click('[data-act=interact]');await b.wait('document.querySelector("#dialog-title")?.textContent==="Dây phơi trên mái"');await b.shot('roof-interaction.png');await b.click('dialog [data-act=close]');
 assert.deepEqual(stable(await b.read()),stable(before),'Architecture inspection granted campaign state');report.checks.push({name:'normal map guidance climbs the stairs and roof inspection grants no campaign rewards',passed:true});
 await reloadAt('roof-resume');
 await b.evaluate('phase3Trace=[]');await go('architecture:store-entry');await reached('architecture:store-entry');await trace('third-down');await b.shot('third-doorway.png');
 // Manual W input through the same doorway and stair flight, with no position setter.
 await key('v','KeyV',true);await key('v','KeyV',false);assert.equal(await b.evaluate('phase3Engine.cameraState().view'),'first');
 await b.evaluate('phase3Trace=[]');let nodes=await b.evaluate('WitnessWorld.getContext().scene.userData.architecture.nodes');
 await walkKeys(nodes[1]);await walkKeys(nodes[3]);await b.shot('first-stairs-bottom.png');
 await walkKeys(nodes[12]);await reloadAt('stairs-resume');
 // A reload starts a fresh trace; continue physically to roof and back for a complete recorded loop.
 nodes=await b.evaluate('WitnessWorld.getContext().scene.userData.architecture.nodes');await b.evaluate('phase3Trace=[]');
 for(const node of [nodes[22],nodes[23],nodes[24]])await walkKeys(node);
 await b.shot('first-roof.png');assert(await b.evaluate(`phase3Engine.within('architecture:roof-rack')`));
 const manualReturn=await b.evaluate(`(()=>{const ar=WitnessWorld.getContext().scene.userData.architecture;return ar.route(phase3Engine.spatial(),ar.nodes[0]);})()`);for(const node of manualReturn)await walkKeys(node);
 await trace('first-roof-return');await b.shot('first-doorway.png');
 report.checks.push({name:'first-person W movement, stair checkpoint, full descent and doorway return',passed:true});
 // Two spatially stacked positions are tested without changing the main walking proof.
 const p=await b.evaluate('WitnessWorld.getContext().scene.userData.architecture.snapshot()');
 const legacy=M.fresh();legacy.positions['Q01.mortal']=[-24.4,-14.45];delete legacy.spatialPositions;await b.seed(legacy);
 assert.equal(await b.evaluate('phase3Engine.spatial().supportId'),'q01-room');assert.equal(await b.evaluate(`phase3Engine.within('architecture:roof-rack')`),false);
 assert.equal(await b.evaluate(`!document.querySelector('[data-world-target="architecture:roof-rack"]')||document.querySelector('[data-world-target="architecture:roof-rack"]').hidden`),true);
 await b.shot('room-below-roof.png');report.checks.push({name:'legacy planar save stays downstairs; upstairs target is hidden and cannot be activated through ceiling',passed:true});
 // A real mission target must still be reached and performed after returning from the building.
 await b.evaluate(`phase3Engine.walkTarget('load',()=>globalThis.backAtLoad=true,1.2)`);await b.wait('!!globalThis.backAtLoad',60000);
 await b.click('[data-world-target="load"]');await b.wait('!!document.querySelector("[data-act=perform]")');await b.shot('quest-after-traversal.png');await b.click('dialog [data-act=close]');
 report.checks.push({name:'Q01 mission interaction remains reachable after architecture traversal',passed:true});
 // Cold standalone: network URLs are blocked before opening the built file.
 await b.send('Network.setBlockedURLs',{urls:['http://*','https://*']});
 await b.evaluate('globalThis.__nav=true');await b.send('Page.navigate',{url:pathToFileURL(path.resolve('dist/ban-choi-ngoai-tuyen.html')).href});await b.wait('!globalThis.__nav&&!!globalThis.phase3Engine&&!!document.querySelector("canvas")',45000);
 await b.seed(M.fresh());
 for(const view of ['third','first']){
  await b.evaluate(`phase3Engine.view(${JSON.stringify(view)});phase3Trace=[]`);await go('architecture:roof-rack');await reached('architecture:roof-rack');await b.shot('offline-'+view+'-roof.png');await trace('offline-'+view+'-up');
  await b.evaluate('phase3Trace=[]');await go('architecture:store-entry');await reached('architecture:store-entry');await trace('offline-'+view+'-down');
 }
 const resources=await b.evaluate('performance.getEntriesByType("resource").filter(r=>/^https?:/.test(r.name)).map(r=>r.name)');assert.deepEqual(resources,[]);
 report.checks.push({name:'cold standalone completes both camera routes with all HTTP blocked',httpResources:resources});
 assert.deepEqual(b.errors,[]);report.status='passed';report.architecture=p;
 report.hashes=Object.fromEntries(['witness-architecture.js','vendor/adventure-3d.js','witness-world.js','witness-model.js','witness-app.js'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks,runs:report.runs}));
}catch(error){report.error=error.stack;report.errors=b.errors;report.last=await b.evaluate('({spatial:globalThis.phase3Engine?.spatial(),toast:document.querySelector("#toast")?.textContent,dialog:document.querySelector("dialog")?.innerText})').catch(()=>null);fs.writeFileSync(path.join(out,'browser-failure.json'),JSON.stringify(report,null,2));await b.shot('failure.png');throw error;}finally{b.close();}
