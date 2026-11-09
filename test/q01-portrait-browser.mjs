import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {browserDriver,delay} from './browser-driver.mjs';
import M from '../witness-model.js';
const offline=process.argv.includes('--offline');
const out=path.resolve('outputs/q01-gold/'+(offline?'offline-portrait':'portrait'));
const b=await browserDriver(out,offline?19737:19736,{hardware:true,width:1440,height:960,...(offline?{url:pathToFileURL(path.resolve('dist/ban-choi-ngoai-tuyen.html')).href,blockHttp:true}:{})});
const report={checks:[],scope:'Targeted final Titus eye fitting, real rendered character and day/evening images; scripted QA'};
async function eyes(){return b.evaluate(`(()=>{
 const {T,scene}=WitnessWorld.getContext(),actor=scene.getObjectByName('companion-titus'),out=[];
 actor.updateWorldMatrix(true,true);let removed=0;
 actor.traverse(o=>{
  if(o.name==='anatomical-body')removed=o.geometry.userData.q01EyeApertureTriangles;
  if(o.geometry?.parameters?.radius===.0022){
   const center=new T.Vector3().fromBufferAttribute(o.geometry.attributes.position,0).applyMatrix4(o.matrixWorld),direction=new T.Vector3(0,0,1).applyQuaternion(o.getWorldQuaternion(new T.Quaternion())),ray=new T.Raycaster(center.clone().addScaledVector(direction,.15),direction.clone().negate(),0,.19);
   const hits=ray.intersectObject(actor,true).filter(h=>!h.object.material?.transparent);
   out.push({first:hits[0]?.object.name||hits[0]?.object.geometry?.type,firstRadius:hits[0]?.object.geometry?.parameters?.radius,bodyDistance:hits.find(h=>h.object.name==='anatomical-body')?.distance??null});
  }
 });return {removed,eyes:out};
})()`);}
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`let api;Object.defineProperty(globalThis,'Adventure3D',{configurable:true,get(){return api},set(v){api=v;const create=v.create;v.create=o=>{const e=create({...o,status(s){globalThis.portraitStatus=s;o.status?.(s);}});globalThis.portraitEngine=e;return e;};}});`});
 const state=M.fresh();state.positions['Q01.mortal']=[-23,5.7];state.settings.cameraMode='first';
 await b.seed(state);
 // Recenter the actual walking camera on Titus without replacing the character with a render/photo.
 await b.evaluate(`(()=>{const e=portraitEngine,p=e.spatial(),c=e.cameraState(),yaw=Math.atan2(-(c.look.x-c.position.x),-(c.look.z-c.position.z)),wanted=Math.atan2(-(-23-p.x),-(4-p.z));e.view('first');e.rotate(wanted-yaw);e.pitch(.055);})()`);
 await delay(600);
 for(let i=0;i<15;i++){report.day=await eyes();if(report.day.eyes.every(e=>e.firstRadius===.0022))break;await delay(120);}
 assert(report.day.removed>0);assert.equal(report.day.eyes.length,2);
 assert(report.day.eyes.every(e=>e.firstRadius===.0022),'Facial skin still obscures the pupils: '+JSON.stringify(report.day));
 await b.shot('day-first-titus.png');report.checks.push('both pupils are visible through anatomical skin openings');
 await b.click('[data-act=q01-light]');await delay(1200);report.evening=await eyes();
 assert(report.evening.eyes.every(e=>e.first!=='anatomical-body'));
 await b.shot('evening-first-titus.png');
 await b.click('[data-act=settings]');await b.select('#setting-graphics','ultra');await b.click('[data-act=settings-save]');
 await b.click('[data-act=q01-light]');await delay(1000);
 await b.evaluate(`portraitEngine.inspect([-23,4],{height:1.55,distance:1.6,bearing:.10})`);await delay(400);await b.shot('day-ultra-titus.png');
 await b.evaluate('portraitEngine.pause(false)');await b.click('[data-act=q01-light]');await delay(1000);
 await b.evaluate(`portraitEngine.inspect([-23,4],{height:1.55,distance:1.6,bearing:.10})`);await delay(400);await b.shot('evening-ultra-titus.png');
 report.checks.push('final hero rendered in first-person and close inspection, day/evening, balanced/ultra');
 async function go(id){await b.evaluate(`portraitEngine.pause(false);portraitEngine.walkTarget(${JSON.stringify(id)},()=>{},1.3)`);await b.wait(`portraitEngine.within(${JSON.stringify(id)})&&!portraitStatus.walking`,90000);}
 async function face(x,z,view){await b.evaluate(`(()=>{const e=portraitEngine,p=e.spatial(),yaw=Math.atan2(-(${x}-p.x),-(${z}-p.z));e.view(${JSON.stringify(view)});e.rotate(yaw-portraitStatus.yaw);})()`);await delay(500);}
 await go('architecture:store-entry');await face(-23,-13,'third');await b.shot('evening-warehouse-final.png');
 await b.click('[data-act=q01-light]');await delay(700);await face(-23,-13,'third');await b.shot('day-warehouse-final.png');
 await go('architecture:roof-rack');await face(-6,-34,'first');await b.shot('day-first-harbor-final.png');await face(-6,-34,'third');await b.shot('day-harbor-final.png');
 await b.click('[data-act=q01-light]');await delay(700);await face(-6,-34,'first');await b.shot('evening-first-harbor-final.png');await face(-6,-34,'third');await b.shot('evening-harbor-final.png');
 report.checks.push('final lamp scale and placements captured at warehouse and harbor; actual walking to roof');
 if(offline){report.httpResources=await b.evaluate('performance.getEntriesByType("resource").filter(x=>/^https?:/.test(x.name)).map(x=>x.name)');assert.deepEqual(report.httpResources,[]);report.checks.push('cold final standalone has no HTTP resources');}
 assert.deepEqual(b.errors,[]);report.status='passed';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=e.stack;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await b.shot('failure.png');throw e;}finally{b.close();}
