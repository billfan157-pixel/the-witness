import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';
import {browserDriver,delay} from './browser-driver.mjs';
const out=path.resolve(process.env.WITNESS_GREYBOX_OUT||'outputs/agent-work/q01-pr04-evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.WITNESS_GREYBOX_URL||'http://127.0.0.1:8034/q01-greybox.html';
const offline=path.resolve(process.env.WITNESS_GREYBOX_OFFLINE||'dist/q01-greybox-offline.html');
const report={version:'q01-greybox-pr04-1',url,scope:'Actual shared engine, hardware WebGL, continuous walking and rendered-box/ray checks. Scripted input; 4x animation clock with unchanged controller and capsule substeps. Not a timing/FPS measure, human playtest, final art or production acceptance.',runs:[],checks:[],sources:{}};
for(const file of ['witness-q01-greybox.js','witness-architecture.js','q01-greybox-lab.js','q01-greybox.html','witness-q01-environment.js','witness-q01-state.js','vendor/adventure-3d.js'])report.sources[file]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const b=await browserDriver(out,19861,{url,ready:'!!globalThis.Q01GreyboxLab?.ready',hardware:true,width:1440,height:900});
// Accelerate elapsed animation time, never position or completion. The engine
// still moves through its real swept-capsule controller on every rendered frame.
await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'const qaRAF=globalThis.requestAnimationFrame.bind(globalThis);globalThis.requestAnimationFrame=callback=>qaRAF(t=>callback(t*4));'});
const installTrace=`(()=>{
 const lab=Q01GreyboxLab,{T,ar,engine}=lab,boxes=[],matrix=new T.Matrix4(),ib=new T.Box3(),ray=new T.Raycaster(),down=new T.Vector3(0,-1,0);
 const structural=[];ar.group.traverse(o=>{if(o.name.startsWith('greybox-static-')||ar.parts.some(p=>p.dynamic&&p.id===o.name))structural.push(o);});
 globalThis.greyboxTrace=[];globalThis.greyboxGeometryErrors=[];globalThis.greyboxTraceTimer&&clearInterval(greyboxTraceTimer);
 globalThis.greyboxTraceTimer=setInterval(()=>{
  const p=engine.spatial(),camera=engine.cameraState();if(!p)return;ar.group.updateMatrixWorld(true);boxes.length=0;
  for(const o of structural){if(!o.visible)continue;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
   if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);ib.copy(o.geometry.boundingBox).applyMatrix4(matrix).applyMatrix4(o.matrixWorld);boxes.push({name:o.userData.colliderIds[i],box:ib.clone()});}}
   else boxes.push({name:o.name,box:new T.Box3().setFromObject(o,true)});
  }
  const eye={...p,y:p.y+1.45},clipped=ar.camera(eye,camera.position),cameraError=Math.hypot(clipped.x-camera.position.x,clipped.y-camera.position.y,clipped.z-camera.position.z),errors=[];
  const cp=new T.Vector3(camera.position.x,camera.position.y,camera.position.z);
  for(const {name,box}of boxes){
   if(box.distanceToPoint(cp)<.155)errors.push('camera:'+name);
   if(box.max.y<=p.y+.225||box.min.y>=p.y+1.69)continue;
   const dx=p.x-Math.max(box.min.x,Math.min(box.max.x,p.x)),dz=p.z-Math.max(box.min.z,Math.min(box.max.z,p.z));
   const lo=p.y+.29,hi=p.y+1.7-.29,dy=box.max.y<lo?lo-box.max.y:box.min.y>hi?box.min.y-hi:0;
   if(dx*dx+dy*dy+dz*dz<.278**2)errors.push('body:'+name);
  }
  ray.set(new T.Vector3(p.x,p.y+.065,p.z),down);ray.far=.12;const hit=ray.intersectObjects(structural.filter(o=>o.visible),false)[0];if(!hit||Math.abs(hit.point.y-p.y)>.018)errors.push('feet');
  if(errors.length)greyboxGeometryErrors.push({p,camera:camera.position,errors});
  greyboxTrace.push({t:performance.now(),...p,view:camera.view,camera:camera.position,cameraError,collision:ar.collides(p)});
 },40);
})()`;
async function key(key,down){await b.send('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key,code:'Key'+key.toUpperCase(),windowsVirtualKeyCode:key.toUpperCase().charCodeAt(0)});}
async function go(id){
 const result=await b.evaluate(`(()=>{const lab=Q01GreyboxLab,select=document.querySelector('#destination');select.value=${JSON.stringify(id)};select.dispatchEvent(new Event('change'));lab.engine.controls(0,0);globalThis.greyboxArrived=false;return lab.engine.walkTarget(${JSON.stringify(id)},()=>greyboxArrived=true,.075);})()`);
 assert(result,'No engine path to '+id);const deadline=Date.now()+100000;let prev='',stuck=0;
 while(Date.now()<deadline){const s=await b.evaluate('({done:globalThis.greyboxArrived,p:Q01GreyboxLab.engine.spatial(),nav:Q01GreyboxLab.engine.navigationState()})');if(s.done){assert.equal(await b.evaluate(`Q01GreyboxLab.engine.within(${JSON.stringify(id)})`),true);return;}
  const at=JSON.stringify([s.p.x.toFixed(3),s.p.y.toFixed(3),s.p.z.toFixed(3)]);if(at===prev)stuck++;else stuck=0;assert(stuck<22,'Engine stopped before '+id+': '+JSON.stringify(s));prev=at;await delay(180);
 }throw Error('Walk timeout: '+id);
}
async function interact(id){assert.equal(await b.evaluate(`Q01GreyboxLab.interact(${JSON.stringify(id)})`),true,'Cannot interact at '+id);}
async function capture(name){await delay(150);await b.shot(name+'.png');}
async function reload(nextUrl,blocked){await b.send('Network.setBlockedURLs',{urls:blocked?['http://*','https://*']:[]});await b.evaluate('globalThis.greyboxNavigating=true');await b.send('Page.navigate',{url:nextUrl});await b.wait('!globalThis.greyboxNavigating&&!!globalThis.Q01GreyboxLab?.ready',45000);await b.evaluate(installTrace);}
async function run(route,view,kind){
 const prefix=kind+'-'+route+'-'+view;await reload(kind==='offline'?pathToFileURL(offline).href:url,kind==='offline');
 await b.evaluate(`Q01GreyboxLab.engine.view(${JSON.stringify(view)})`);await capture(prefix+'-00-arrival');
 await b.click('#annotations');assert.equal(await b.evaluate('(()=>{let n=0;Q01GreyboxLab.mounted.group.traverse(o=>{if(o.userData.annotation&&o.visible)n++;});return n>0;})()'),true);
 await b.click('#annotations');assert.equal(await b.evaluate('(()=>{let n=0;Q01GreyboxLab.mounted.group.traverse(o=>{if(o.userData.annotation&&o.visible)n++;});return n;})()'),0);
 // Arrival is also checked with real W input before normal click-to-walk guidance.
 await b.evaluate('document.querySelector("#stage").focus()');await key('w',true);const wDeadline=Date.now()+6000;while(Date.now()<wDeadline){if((await b.evaluate('Q01GreyboxLab.engine.spatial().z'))>-29.9)break;await delay(100);}await key('w',false);
 assert((await b.evaluate('Q01GreyboxLab.engine.spatial().z'))>-29.9,'W did not move along the boat deck');
 for(const id of ['disembark','alley','load','ledger','titus'])await go(id);
 await capture(prefix+'-03-yard');
 await b.click(`[data-route="${route}"]`);
 const prep=route==='mechanical'?'cart':'workers',work=route==='mechanical'?'rope':'lever';await go(prep);await interact(prep);await go(work);await interact(work);
 await capture(prefix+'-04-mechanism');await go('mezzanine');await capture(prefix+'-04-mezzanine');
 await go('commonDoor');assert.equal(await b.evaluate('Q01GreyboxLab.ar.route(Q01GreyboxLab.engine.spatial(),Q01GreyboxLab.ar.anchors.reception)'),null,'Closed common door bypass');await interact('commonDoor');
 await go('reception');await go('lookout');
 await b.evaluate(`(()=>{const lab=Q01GreyboxLab;lab.engine.rotate(-lab.status.yaw);lab.engine.pitch(${view==='first'?-1.1:-.3});})()`);
 await capture(prefix+'-05-roof-day');
 await b.evaluate('Q01GreyboxLab.setLighting("evening")');await capture(prefix+'-05-roof-evening');
 await b.evaluate(`Q01GreyboxLab.engine.pitch(${view==='first'?1.1:.3})`);
 const checkpoint=await b.evaluate('Q01GreyboxLab.engine.spatial()');assert.equal(checkpoint.y,5.04);
 const restored=await b.evaluate(`Q01GreyboxLab.engine.restoreSpatial(${JSON.stringify(checkpoint)})`);assert.deepEqual(restored,checkpoint,'Same-floor spatial restore moved the avatar');
 await go('mezzanine');await go('mainBottom');await capture(prefix+'-04-ground-store');await go('mezzanine');await capture(prefix+'-04-return-for-people');
 await b.click('#actors');await go('reception');await b.wait('Q01GreyboxLab.jobs.size===0',100000);
 const actors=await b.evaluate('Object.fromEntries(["titus","simeon","apprentice"].map(id=>[id,{...Q01GreyboxLab.mounted.actors[id].position}]))');
 for(const p of Object.values(actors))assert.equal(p.y,5.04,'An actor failed to walk to the receiving roof');
 assert.deepEqual(await b.evaluate('Q01GreyboxLab.errorLog'),[]);await capture(prefix+'-04-party-received');
 for(const id of ['roofExit','descentTop','yosef'])await go(id);await capture(prefix+'-06-porch-evening');
 await b.evaluate('Q01GreyboxLab.setLighting("day")');
 for(const id of ['drainMouth','drain','drainMouth','rest','b06','meal','lodging','handoff'])await go(id);
 await capture(prefix+'-08-handoff');
 const data=await b.evaluate('({trace:greyboxTrace,geometryErrors:greyboxGeometryErrors,preview:Q01GreyboxLab.ar.preview,storage:Object.keys(localStorage),renderer:Q01GreyboxLab.engine.cameraState()})');
 assert(data.trace.length>100,'Insufficient real controller trace');assert.deepEqual(data.trace.filter(f=>f.collision),[],'Capsule collided');assert.deepEqual(data.trace.filter(f=>f.cameraError>.03),[],'Camera clearance failed');assert.deepEqual(data.geometryErrors,[],'Rendered geometry disagrees with movement');
 const supports=[...new Set(data.trace.map(f=>f.supportId))];for(const support of ['world','q01-quay','q01-room','q01-mezzanine','q01-landing','q01-roof-main','q01-drain'])assert(supports.includes(support),'Did not walk on '+support);
 assert(supports.filter(id=>id.startsWith('q01-step-')).length>=10,'No continuous stair traversal');
 assert(!data.storage.some(k=>k.includes('the-witness')),'Lab wrote campaign saves');
 fs.writeFileSync(path.join(out,prefix+'-trace.json'),JSON.stringify(data.trace));
 report.runs.push({kind,route,view,frames:data.trace.length,supports,actors,geometryErrors:0,cameraErrors:0,lightsReviewed:['day','evening']});
 console.log('PASS '+prefix+' · '+data.trace.length+' frames');
}
try{
 const modes=process.env.WITNESS_GREYBOX_WEB_ONLY==='1'?['web']:['web','offline'];if(modes.includes('offline')){assert(fs.existsSync(offline),'Build the standalone candidate first');report.offlineSha256=crypto.createHash('sha256').update(fs.readFileSync(offline)).digest('hex');}
 const cases=process.env.WITNESS_GREYBOX_SMOKE==='1'?[['mechanical','third']]:[['mechanical','third'],['manual','first'],['mechanical','first'],['manual','third']];
 for(const mode of modes)for(const [route,view]of cases)await run(route,view,mode);
 report.lifecycle=await b.evaluate(`(async()=>{
  const lab=Q01GreyboxLab,{T,scene,ar}=lab,gl=document.querySelector('canvas').getContext('webgl2'),sets={texture:new Set(),buffer:new Set(),vao:new Set()},restore=[];
  for(const [kind,create,remove]of [['texture','createTexture','deleteTexture'],['buffer','createBuffer','deleteBuffer'],['vao','createVertexArray','deleteVertexArray']]){
   const make=gl[create].bind(gl),drop=gl[remove].bind(gl),oldMake=gl[create],oldDrop=gl[remove];
   gl[create]=(...args)=>{const r=make(...args);sets[kind].add(r);return r;};gl[remove]=r=>{sets[kind].delete(r);return drop(r);};restore.push(()=>{gl[create]=oldMake;gl[remove]=oldDrop;});
  }
  const frame=()=>new Promise(r=>requestAnimationFrame(r)),snapshot=()=>Object.fromEntries(Object.entries(sets).map(([k,s])=>[k,s.size])),runs=[];
  try{for(let i=0;i<4;i++){
   const temporary=WitnessQ01Greybox.mount(T,scene,WitnessQ01Greybox.create());
   const uploadDeadline=Date.now()+8000;
   while(Date.now()<uploadDeadline&&(!sets.texture.size||!sets.buffer.size))await frame();
   const mounted=snapshot();
   let triangles=0,drawMeshes=0;temporary.group.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);drawMeshes++;}});
   temporary.dispose();scene.userData.architecture=ar;
   const releaseDeadline=Date.now()+8000;
   while(Date.now()<releaseDeadline&&Object.values(sets).some(s=>s.size>0))await frame();
   const released=snapshot();
   if(!mounted.texture||!mounted.buffer)throw Error('Temporary level was not uploaded to WebGL');
   if(Object.values(released).some(Boolean))throw Error('Level resources retained: '+JSON.stringify(released));
   if(triangles>24000||drawMeshes>120)throw Error('Greybox geometry budget exceeded');runs.push({mounted,released,triangles,drawMeshes});
  }return {cycles:runs,scope:'Actual WebGL allocations made by the temporary level; all returned to zero while the original scene stayed alive'};
  }finally{restore.forEach(fn=>fn());scene.userData.architecture=ar;}
 })()`);
 const info=await b.evaluate('(()=>{const c=document.querySelector("canvas"),gl=c.getContext("webgl2"),ext=gl.getExtension("WEBGL_debug_renderer_info");return {width:innerWidth,height:innerHeight,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};})()');report.environment=info;
 assert.deepEqual(b.errors,[]);report.status='passed';report.checks.push('W input, continuous guidance and collision-backed mechanisms','Two route-specific physical states remain independent','C0→C1→C+1→C1→C+1→C0 and optional C−1','Three actual proxy actors reach the roof without teleporting','First/third camera, day/evening views, rendered geometry ray checks','No campaign save writes');
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,runs:report.runs.length,visualCombinations:report.runs.length*2,environment:info}));
}catch(error){report.status='failed';report.error=error.stack;report.browserErrors=b.errors;report.last=await b.evaluate('({p:globalThis.Q01GreyboxLab?.engine.spatial(),preview:globalThis.Q01GreyboxLab?.ar.preview,jobs:globalThis.Q01GreyboxLab?[...Q01GreyboxLab.jobs.keys()]:[],message:document.querySelector("#message")?.textContent,geometry:globalThis.greyboxGeometryErrors?.slice(0,5)})').catch(()=>null);fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify(report,null,2));await b.shot('failure.png');throw error;}finally{b.close();}
