import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {browserDriver,delay} from './browser-driver.mjs';
const out=path.resolve(process.env.WITNESS_Q01_OUT||'outputs/agent-work/q01-pr05');fs.mkdirSync(out,{recursive:true});
const report={status:'running',scope:'New character through campaign UI; actual controller/actor paths, dialogue, save/reload and Q02. No seed, reducer calls, position setters or completion shortcuts. Accelerated animation is not a timing/FPS or human/art acceptance.',hashPolicy:'Runtime UTF-8 text normalized to LF, matching the build producer; standalone SHA256 uses literal bytes.',runs:[],sources:{}};
const sourceHash=f=>crypto.createHash('sha256').update(fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n')).digest('hex');
const sourceRoot=process.env.WITNESS_Q01_SOURCE_ROOT||'.';report.sourceRoot=sourceRoot;
let runTrace=[],audioProof=null,presentation=[],presentationPrefix='';
const traceSource=fs.readFileSync('test/q01-geometry-guard.cjs','utf8')+`\n(()=>{
 globalThis.pr05Trace=[];let owner=null,previous=null,boxes=[],structural=[],ray,T,ar;
 setInterval(()=>{const q=globalThis.WitnessQ01Campaign?.presenter;if(!q)return;
  if(q!==owner){owner=q;previous=null;T=q.mounted.T;ar=q.mounted.ar;const group=q.mounted.group.getObjectByName('q01-pr05-structure');group.updateWorldMatrix(true,true);structural=[...group.children];boxes=[];
   for(const m of structural)for(const p of WitnessGeometryGuard.partBoxes(m)||[])boxes.push({id:p.id,box:new T.Box3(new T.Vector3(...p.min),new T.Vector3(...p.max)).applyMatrix4(group.matrixWorld)});
   for(const p of ar.parts.filter(p=>p.dynamic))structural.push(q.mounted.base.group.getObjectByName(p.id));ray=new T.Raycaster();
  }
  const p=q.engine.spatial(),camera=q.engine.cameraState(),actors=Object.fromEntries(['titus','simeon','apprentice','natan'].map(id=>[id,q.actorPoint(id)])),now=performance.now(),errors=[];if(!p)return;
  q.mounted.base.group.updateWorldMatrix(true,true);
  const dynamic=ar.parts.filter(p=>p.dynamic).map(p=>{const m=q.mounted.base.group.getObjectByName(p.id);return m.visible?{id:p.id,box:new T.Box3().setFromObject(m,true)}:null;}).filter(Boolean);
  for(const b of [...boxes,...dynamic])for(const e of WitnessGeometryGuard.boxErrors(b.box,p,camera.position))errors.push(e+':'+b.id);
  ray.set(new T.Vector3(p.x,p.y+.065,p.z),new T.Vector3(0,-1,0));ray.far=.12;const hit=ray.intersectObjects(structural.filter(m=>m.visible),false)[0];if(!hit||Math.abs(hit.point.y-p.y)>.018)errors.push('feet');
  if(ar.collides(p))errors.push('capsule');
  if(previous){const dt=(now-previous.t)/1000;if(Math.hypot(p.x-previous.p.x,p.y-previous.p.y,p.z-previous.p.z)>24*dt+.3)errors.push('avatar-jump');for(const [id,a]of Object.entries(actors)){const old=previous.actors[id];if(Math.hypot(a.x-old.x,a.y-old.y,a.z-old.z)>18*dt+.3)errors.push('actor-jump:'+id);}}
  const sample={t:now,p,actors,errors};pr05Trace.push(sample);previous=sample;
 },160);
})()`;
async function collectTrace(){const trace=await b.evaluate('globalThis.pr05Trace||[]');runTrace.push(...trace);await b.evaluate('globalThis.pr05Trace=[]');}
for(const f of ['witness-q01-campaign.js','witness-q01-art.js','witness-q01-interaction.js','witness-q01-greybox.js','witness-q01.js','witness-model.js','witness-world.js','witness-app.js','witness-ambience.js','witness-audio.js','witness-audio-library.js','vendor/adventure-3d.js','vendor/adventure-visuals.js','vendor/adventure-character.js','vendor/character-cloth.js','vendor/character-detail.js'])report.sources[f]=sourceHash(path.join(sourceRoot,f));
const packageRoot=process.env.WITNESS_Q01_PACKAGE_ROOT;
if(packageRoot){report.build=JSON.parse(fs.readFileSync(path.join(packageRoot,'build-info.json')));report.shippedSources=Object.fromEntries(Object.keys(report.sources).map(f=>[f,sourceHash(path.join(packageRoot,f))]));assert.deepEqual(report.shippedSources,report.sources,'Packaged candidate differs from the runtime being verified');}
if(process.env.WITNESS_Q01_OFFLINE==='1'){const f=process.env.WITNESS_Q01_OFFLINE_PATH||'dist/ban-choi-ngoai-tuyen.html';report.offline={file:f,sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),blockedHTTP:true};}
const b=await browserDriver(out,19873,{hardware:true,width:1440,height:900,blockHttp:process.env.WITNESS_Q01_OFFLINE==='1'});
report.environment={node:process.version,platform:process.platform,browser:await b.send('Browser.getVersion'),render:await b.evaluate('(()=>{const gl=document.querySelector("canvas").getContext("webgl2"),ext=gl.getExtension("WEBGL_debug_renderer_info");return {width:innerWidth,height:innerHeight,pixelRatio:devicePixelRatio,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};})()')};
const state=()=>b.evaluate('WitnessQ01Campaign.presenter?.readState()');
async function tap(selector){
 const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});
}
async function soundCheckpoint(label){if(!audioProof)return;const a=await b.evaluate('WitnessAudioSession.debug()');assert.equal(a.context,'running',label+' audio context');assert.deepEqual(a.failedFiles,[],label+' missing audio');audioProof.checkpoints.push({label,context:a.context,sources:a.sources,beds:a.beds,rms:a.rms,stats:a.stats});}
const runtime=()=>b.evaluate('(()=>{const q=WitnessQ01Campaign.presenter;if(!q)return null;const solid=id=>q.mounted.ar.solids.find(s=>s.id===id),cart=solid("counterweight-cart");return {p:q.engine.spatial(),nav:q.engine.navigationState(),actors:Object.fromEntries(Object.keys(q.mounted.actors).map(id=>[id,q.actorPoint(id)])),goal:document.querySelector("#q01-route-guide")?.dataset.goal,errors:q.errors,ui:q.ui&&{key:q.ui.key,index:q.ui.index,choices:q.ui.choices},preview:q.mounted.ar.preview,barriers:{sideGate:solid("rescue-side-gate").enabled!==false,mainBeam:solid("rescue-main-beam").enabled!==false,cartX:(cart.min[0]+cart.max[0])/2},fireVisible:q.mounted.group.getObjectByName("q01-contained-fire").visible,time:q.mounted.scene.userData.q01Time}})()');
async function talk(){for(let i=0;i<40;i++){if(!(await b.evaluate('!!document.querySelector("#q01-presenter:not([hidden]) [data-q01=next]")')))return;
 const night=await b.evaluate('(()=>{const u=WitnessQ01Campaign.presenter.ui;return u.key==="night"?u.pages[u.index][0]:null})()');
 if(night&&!presentation.some(p=>p.speaker===night)){
  await b.wait('WitnessQ01Campaign.presenter.mounted.actors.natan.object.getObjectByName("thigh_l").rotation.x < -1',15000);
  const pose=await b.evaluate('(()=>{const q=WitnessQ01Campaign.presenter,actor=q.mounted.actors.natan,a=actor.object,T=q.mounted.T,c=q.engine.cameraState(),head=a.getObjectByName("head").getWorldPosition(new T.Vector3()),toward=new T.Vector3(head.x-c.position.x,head.y-c.position.y,head.z-c.position.z).normalize(),look=new T.Vector3(c.look.x-c.position.x,c.look.y-c.position.y,c.look.z-c.position.z).normalize(),cape=actor.cloth.find(l=>l.mesh.name==="cloth-wool-mantle"),p=new T.Vector3();let cloakMaxY=-Infinity;for(let i=0;i<cape.positions.length;i+=3)cloakMaxY=Math.max(cloakMaxY,p.fromArray(cape.positions,i).applyMatrix4(a.matrixWorld).y);return {speaker:q.ui.pages[q.ui.index][0],pelvis:a.getObjectByName("pelvis").getWorldPosition(new T.Vector3()).toArray(),thighX:a.getObjectByName("thigh_l").rotation.x,mouth:a.getObjectByName("anatomical-body").morphTargetInfluences[2],feet:["foot_l","foot_r"].map(n=>a.getObjectByName(n).getWorldPosition(new T.Vector3()).toArray()),bench:q.mounted.ar.solids.find(s=>s.id==="rest-bench"),cloakMaxY,head:head.toArray(),headVisible:q.mounted.ar.visible(c.position,{x:head.x,y:head.y,z:head.z}),facing:look.dot(toward),camera:c};})()');
  assert(pose.thighX<-1&&pose.thighX>-1.6,'Natan is standing or his seated thigh folds into the torso');if(night!=='natan')assert.equal(pose.mouth,0,'Natan speaks while listening to someone else');
  assert.equal(pose.headVisible,true,'The night speaker is hidden behind a wall');assert(pose.facing>.8,'The night speaker is outside the conversation framing');
  assert(pose.cloakMaxY<pose.head[1]-.04,'The mantle remains above the seated shoulder and covers the face');
  for(const foot of pose.feet)assert(foot[1]>-.03&&foot[1]<.13,'Seated feet must rest at the actual ground');
  for(const k of [0,2])assert(pose.pelvis[k]>pose.bench.min[k]-.08&&pose.pelvis[k]<pose.bench.max[k]+.08,'The seated pelvis misses the bench');
  assert(pose.pelvis[1]>pose.bench.max[1]-.08&&pose.pelvis[1]<pose.bench.max[1]+.2,'The seated pelvis floats above or falls through the bench');
  pose.screenshot=presentationPrefix+'-07-night-'+night+'.png';await b.shot(pose.screenshot);presentation.push(pose);
 }
 if(audioProof){const v=await b.evaluate('(()=>{const u=WitnessQ01Campaign.presenter.ui,[who,line]=u.pages[u.index],entry=WitnessAudio.recorded(who,line);return entry?{who,line,entry}:null;})()');if(v){await b.wait('WitnessAudioSession.debug().voice?.status==="playing"&&WitnessAudioSession.debug().voice?.kind==="recorded"',20000);await b.wait('!WitnessAudioSession.debug().voice',20000);audioProof.sentences.push(v);}}
 await b.click('[data-q01=next]');await delay(90);}throw Error('Dialogue did not return control');}
async function go(){
 assert.equal(await b.evaluate('document.querySelector("#q01-route-guide").getClientRects().length>0&&!document.querySelector("#q01-route-guide").hidden'),true,'Walking guide must actually be available to the player');
 const goal=await b.evaluate('document.querySelector("#q01-route-guide").dataset.goal');console.log('WALK '+goal);
 await b.click('[data-q01-guide=walk]');await b.wait(`WitnessQ01Campaign.presenter.engine.within('q01:${goal}')&&!WitnessQ01Campaign.presenter.engine.navigationState()`,90000);
 const q=await runtime();assert.equal(q.p.supportId.startsWith('q01-step'),false,'Arrival stopped on a stair, not the interaction floor');return goal;
}
async function interact(){
 const overlaps=await b.evaluate('(()=>{const q=WitnessQ01Campaign.presenter,c=q.engine.cameraState();if(c.view!=="first")return [];return Object.entries(q.mounted.actors).filter(([id,a])=>a.object.visible&&Math.abs(c.position.y-(a.object.position.y+1.55))<.4&&Math.hypot(c.position.x-a.object.position.x,c.position.z-a.object.position.z)<.43).map(([id])=>id);})()');
 assert.deepEqual(overlaps,[],'An actor occupies the first-person interaction point');await b.click('[data-q01-guide=interact]');await delay(180);
}
async function step(){await go();await interact();await talk();}
async function reload(label){
 const before=await state();await soundCheckpoint(label);await collectTrace();await b.evaluate('globalThis.pr05Navigating=true');await b.send('Page.reload',{ignoreCache:true});await b.wait('!globalThis.pr05Navigating&&!!document.querySelector("#title-actions [data-act=continue]")',60000);if(audioProof)await tap('#title-actions [data-act=continue]');else await b.click('#title-actions [data-act=continue]');await b.wait('!!WitnessQ01Campaign.presenter&&!document.querySelector("#title-screen").hidden===false',60000);
 const after=await state();assert.deepEqual(after.sceneProgress.Q01,before.sceneProgress.Q01,label);assert.deepEqual(after.resources,before.resources,label+' resources');assert.deepEqual(after.evidence,before.evidence,label+' evidence');if(after.sceneProgress.Q01.beat>0)assert.equal(await b.evaluate('document.querySelector("#subtitle").textContent.includes("Sóng dưới chân kè")'),false,'Restore repeated the boat-arrival cue after that beat');console.log('RELOAD '+label);return after;
}
async function assertBeat(n){assert.equal((await state()).sceneProgress.Q01.beat,n);}
async function loadWork(mode){
 await b.wait('!document.querySelector("#field-work").hidden',15000);
 if(mode==='board'){
  await b.click('[data-act=field-board]');for(const value of ['block','unload','brace','lash','test','remove'])await b.click(`[data-act=depth-step][data-value=${value}]`);await b.click('[data-act=depth-commit]');
 }else{
  for(const value of ['block','unload','brace','lash','test','remove']){await b.click(`[data-act=field-go][data-id="field:${value}"]`);await b.wait(`WitnessQ01Campaign.presenter.readState().workshop.drafts['Q01.LOAD'].payload.order.includes('${value}')`,45000);}
  await b.click('[data-act=field-handoff]');
 }
 await b.wait('WitnessQ01Campaign.presenter.readState().quests.Q01.done.includes("brace")',45000);
 if(await b.evaluate('!!document.querySelector("dialog [data-act=close]")'))await b.click('dialog [data-act=close]');
}
async function run(route,plan,view,mode){
 runTrace=[];presentation=[];presentationPrefix=[route,plan,view,mode].join('-');audioProof=process.env.WITNESS_Q01_AUDIO==='1'?{sentences:[],checkpoints:[],scope:'Actual audio decoding, output signal and recorded sentence playback; no human listening approval.'}:null;
 console.log('RUN '+[route,plan,view,mode].join('/'));
 await b.click('[data-act=new]');await b.click('[data-act=create]');await b.wait('!!WitnessQ01Campaign.presenter',60000);await delay(500);
 if(audioProof){await b.click('#hud-top [data-act=settings]');await tap('#setting-sound');await tap('[data-act=settings-save]');await b.wait('WitnessAudioSession.debug().context==="running"&&WitnessAudioSession.debug().beds>0&&WitnessAudioSession.debug().rms>.00001',20000);await soundCheckpoint('harbour-enabled');}
 assert.equal(await b.evaluate('!!WitnessQ01Campaign.presenter.mounted.scene.getObjectByName("witness-ambience")'),false,'Generic meadow ambience repopulates the paved harbour');
 if((view==='third'&&mode==='board')||(view==='first'&&mode==='field')){
  const at=(await runtime()).p;await b.click('[data-q01-guide=arrival]');await b.wait('WitnessQ01Campaign.presenter.introduction');
  if(view==='first')await b.click('[data-q01=take-control]');else{await delay(850);await b.shot([route,plan,view,mode,'00-arrival'].join('-')+'.png');}
  await b.wait('!WitnessQ01Campaign.presenter.introduction',45000);assert.deepEqual((await runtime()).p,at,'The opening camera moved the avatar');await assertBeat(0);
 }
 if(view==='first'){await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'v',code:'KeyV',windowsVirtualKeyCode:86});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'v',code:'KeyV',windowsVirtualKeyCode:86});}
 assert.equal(await b.evaluate('WitnessQ01Campaign.presenter.engine.cameraState().view'),view);
 if(view==='first'&&mode==='board'){
  await b.click('#hud-top [data-act=settings]');await b.click('#setting-motion');await b.click('[data-act=settings-save]');await reload('first-person-full-motion');
  assert.equal(await b.evaluate('WitnessQ01Campaign.presenter.introduction'),false,'First-person restore must keep control instead of starting the boat camera');
  assert.equal(await b.evaluate('WitnessQ01Campaign.presenter.engine.cameraState().view'),'first');
 }
 await step();await assertBeat(1);await go();await interact();await talk();
 if(view==='first'){await b.click('[data-q01=follow]');await go();await b.wait('WitnessQ01Campaign.presenter.mounted.strangerHidden(WitnessQ01Campaign.presenter.engine.spatial())',25000);await interact();await talk();}
 else{await b.click('[data-q01=investigate]');await talk();}await assertBeat(2);
 await go();await interact();await talk();await loadWork(mode);assert((await state()).workshop.records['Q01.LOAD']);
 await go();await b.wait('!WitnessQ01Campaign.presenter.jobs.has("natan")&&WitnessQ01Interaction.near(WitnessQ01Campaign.presenter.actorPoint("natan"),WitnessQ01Greybox.anchors.ledger,3)',45000);await interact();
 while((await runtime()).ui?.key==='ledger')await b.click('[data-q01=next]');
 assert.equal((await state()).quests.Q01.done.includes('ledger'),true);assert.equal((await state()).sceneProgress.Q01.ledgerSeamObserved,false);await b.click('[data-q01=leave]');await reload('book-received-before-seam');await interact();await talk();
 await assertBeat(3);assert.equal((await state()).events.filter(e=>e.type==='ActionCompleted'&&e.action==='ledger').length,1);await b.shot([route,plan,view,mode,'02-ledger'].join('-')+'.png');
 await step();await assertBeat(4);await interact();await talk();await b.click(`[data-q01=${route}]`);
 await go();await interact();await talk();
 if(route==='mechanical'){
  for(let i=0;i<12&&!(await state()).sceneProgress.Q01.rescue.steps.includes('cart');i++){await delay(600);await interact();await talk();}
  await b.wait('WitnessQ01Campaign.presenter.readState().sceneProgress.Q01.rescue.steps.includes("cart")',12000);
 }else{
  await go();await b.wait('WitnessQ01Interaction.near(WitnessQ01Campaign.presenter.actorPoint("worker1"),WitnessQ01Greybox.anchors.lever,3)&&WitnessQ01Interaction.near(WitnessQ01Campaign.presenter.actorPoint("worker2"),WitnessQ01Greybox.anchors.lever,3)&&WitnessQ01Interaction.near(WitnessQ01Campaign.presenter.actorPoint("titus"),WitnessQ01Greybox.anchors.lever,4)',45000);await interact();await b.wait('WitnessQ01Campaign.presenter.readState().sceneProgress.Q01.rescue.steps.includes("workers")',12000);
 }
 await go();await interact();await talk();await b.wait('WitnessQ01Campaign.presenter.readState().sceneProgress.Q01.rescue.steps.length===2',16000);
 await b.shot([route,plan,view,mode,'04-mechanism'].join('-')+'.png');await reload('after-route-open');
 await go();await b.wait('WitnessQ01Interaction.near(WitnessQ01Campaign.presenter.actorPoint("titus"),WitnessQ01Greybox.anchors.commonDoor,2.8)',45000);await interact();await b.wait('WitnessQ01Campaign.presenter.commonOpen',12000);
 await go();await b.wait('WitnessQ01Interaction.near(WitnessQ01Campaign.presenter.actorPoint("titus"),WitnessQ01Greybox.anchors.reception,2.6)',45000);await interact();await talk();await b.wait('WitnessQ01Campaign.presenter.roofChecked',12000);
 await go();await interact();assert((await state()).sceneProgress.Q01.rescue.steps.includes('exit'));
 await reload('before-extraction');await interact();await talk();await go();await b.wait('WitnessQ01Interaction.near(WitnessQ01Campaign.presenter.actorPoint("simeon"),WitnessQ01Greybox.anchors.reception,1.8)&&WitnessQ01Interaction.near(WitnessQ01Campaign.presenter.actorPoint("apprentice"),WitnessQ01Greybox.anchors.reception,1.8)',45000);await interact();await talk();await assertBeat(5);
 const safe=await runtime();for(const id of ['titus','simeon','apprentice'])assert(safe.actors[id].y>5);
 await b.shot([route,plan,view,mode,'05-safe'].join('-')+'.png');
 await step();await assertBeat(6);await step();await assertBeat(7);await step();await go();await interact();await talk();await b.click(`[data-q01=plan-${plan}]`);await talk();
 if(plan==='meal')await step();
 assert.deepEqual((await state()).resources,{money:3,food:3,tools:1});await reload('night-plan-unpaid');
 await go();await b.wait('!WitnessQ01Campaign.presenter.jobs.has("natan")&&WitnessQ01Interaction.near(WitnessQ01Campaign.presenter.actorPoint("natan"),WitnessQ01Greybox.anchors.rest,3)',45000);await interact();await talk();await b.click('[data-q01=rest]');await b.wait('WitnessQ01Campaign.presenter.readState().sceneProgress.Q01.beat===8',16000);
 await b.shot([route,plan,view,mode,'08-dawn'].join('-')+'.png');await step();assert.equal((await state()).sceneProgress.Q01.b06PreliminaryObserved,true);assert.deepEqual((await state()).evidence,[]);
 assert.equal((await runtime()).fireVisible,false);assert.equal((await runtime()).time.phase,'dawn');
 await reload('after-B06-before-payment');await step();const committed=await state();assert.equal(committed.quests.Q01.route,plan);assert.equal(committed.events.filter(e=>e.type==='Q01.COMMITTED').length,1);
 await b.click('#hud-top [data-act=journal]:not([data-tab])');await b.click('dialog [data-act=journal][data-tab=log]');
 assert(await b.evaluate('document.querySelector("dialog").textContent.includes("Hai vật được giữ riêng")&&document.querySelector("dialog").textContent.includes("Giới hạn Yosef đặt ra")&&document.querySelector("dialog").textContent.includes("Quan sát riêng từ mái")'));await b.click('dialog [data-act=close]');
 assert.deepEqual(committed.resources,{money:plan==='lodging'?2:3,food:plan==='meal'?2:3,tools:1});assert.deepEqual(committed.evidence,[]);assert.deepEqual(committed.consent,{});
 const consequence=await runtime();assert.equal(consequence.preview.route,route);assert.equal(consequence.preview.common,true);assert.equal(consequence.preview.opened,true);assert.equal(committed.sceneProgress.Q01.world.cart,route==='mechanical'?'chocked':'none');assert.equal(committed.sceneProgress.Q01.world.beam,route==='manual'?'moved':'broken');
 assert.equal(consequence.barriers.sideGate,route==='manual');assert.equal(consequence.barriers.mainBeam,route==='mechanical');assert(Math.abs(consequence.barriers.cartX-(route==='mechanical'?-30.9:-32.8))<.001);
 await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'e',code:'KeyE',windowsVirtualKeyCode:69});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'e',code:'KeyE',windowsVirtualKeyCode:69});await talk();assert.deepEqual((await state()).resources,committed.resources);assert.equal((await state()).events.filter(e=>e.type==='Q01.COMMITTED').length,1);
 await reload('committed-no-repeat-cost');assert.deepEqual((await state()).resources,committed.resources);await go();await interact();await b.click('dialog [data-act=advance]');await b.wait('!!document.querySelector("dialog")&&document.querySelector("#chapter-name").textContent.includes("Những tên")',60000);
 const nextChapter=await b.read();assert.equal(nextChapter.chapter,1);assert(nextChapter.quests.Q01.done.includes('ledger'),'Q02 lost custody of the intact family book');assert.equal(nextChapter.events.filter(e=>e.type==='ActionCompleted'&&e.action==='ledger').length,1);assert.deepEqual(nextChapter.sceneProgress.Q01,committed.sceneProgress.Q01);assert.deepEqual(nextChapter.resources,committed.resources);assert.deepEqual(nextChapter.evidence,committed.evidence);assert.deepEqual(nextChapter.consent,committed.consent);assert.equal(b.errors.length,0,b.errors.join('\n'));
 await collectTrace();const geometryErrors=runTrace.filter(f=>f.errors.length);fs.writeFileSync(path.join(out,[route,plan,view,mode,'trace'].join('-')+'.json'),JSON.stringify(runTrace));assert.deepEqual(consequence.errors,[]);assert.deepEqual(geometryErrors.slice(0,5),[],'Rendered geometry/controller/continuity trace');
 if(audioProof){await soundCheckpoint('Q02-open');assert.equal(audioProof.sentences.filter(v=>v.who==='natan').length,5,'Every produced Natan night sentence must actually play');}
 report.runs.push({route,plan,view,mode,status:'passed',world:committed.sceneProgress.Q01.world,physicalConsequences:consequence.barriers,resources:committed.resources,actorErrors:consequence.errors,frames:runTrace.length,geometryErrors:geometryErrors.length,presentation,...(audioProof?{audio:audioProof}:{})});fs.writeFileSync(path.join(out,'campaign-report.json'),JSON.stringify(report,null,2));
 if(await b.evaluate('!!document.querySelector("dialog [data-act=close]")'))await b.click('dialog [data-act=close]');await b.click('[data-act=pause]');await b.click('[data-act=title]');
}
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'const pr05RAF=requestAnimationFrame.bind(globalThis);globalThis.requestAnimationFrame=callback=>pr05RAF(t=>callback(t*4));'});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:traceSource});await b.evaluate(traceSource);
 // A fresh form is used every run. Never inject a save/model state to reach Q01.
 if(process.env.WITNESS_Q01_SMOKE==='1')await run(process.env.WITNESS_Q01_ROUTE||'mechanical',process.env.WITNESS_Q01_PLAN||'lodging',process.env.WITNESS_Q01_VIEW||'third',process.env.WITNESS_Q01_MODE||'board');
 else for(const plan of ['lodging','meal'])for(const view of ['third','first'])for(const mode of ['board','field'])for(const route of ['mechanical','manual'])await run(route,plan,view,mode);
 report.status='passed';
}catch(error){report.status='failed';report.error=error.stack;report.runtime=await runtime().catch(()=>null);await collectTrace().catch(()=>{});fs.writeFileSync(path.join(out,'failed-run-trace.json'),JSON.stringify(runTrace));await b.shot('campaign-failure.png');console.error(error.stack);process.exitCode=1;}
finally{report.errors=b.errors;if(report.status==='passed')try{assert.deepEqual(Object.fromEntries(Object.keys(report.sources).map(f=>[f,sourceHash(path.join(sourceRoot,f))])),report.sources,'Sources changed during acceptance');}catch(error){report.status='failed';report.error=error.stack;process.exitCode=1;}fs.writeFileSync(path.join(out,'campaign-report.json'),JSON.stringify(report,null,2));b.close();}
