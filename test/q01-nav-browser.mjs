import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {browserDriver,delay} from './browser-driver.mjs';import M from '../witness-model.js';
const out=path.resolve('outputs/q01-gold/navigation'),b=await browserDriver(out,19738,{hardware:true,width:1100,height:800});
const report={trace:[]};
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`let api;Object.defineProperty(globalThis,'Adventure3D',{configurable:true,get(){return api},set(v){api=v;const make=v.create;v.create=o=>{const e=make(o);globalThis.navEngine=e;return e;};}});`});
 const state=M.fresh();state.positions['Q01.mortal']=[-23,5.7];await b.seed(state);
 assert(await b.evaluate(`navEngine.walkTarget('architecture:store-entry',()=>globalThis.navArrived=true,1.3)`));
 for(let i=0;i<150;i++){
  const next=await b.evaluate(`(()=>{const e=navEngine,p=e.spatial(),ar=WitnessWorld.getContext().scene.userData.architecture;return {p,route:e.navigationState(),arrived:!!globalThis.navArrived,collision:ar.collides(p)};})()`);report.trace.push(next);
  if(next.arrived)break;
  if(i>15&&report.trace.slice(-12).every(t=>Math.hypot(t.p.x-next.p.x,t.p.z-next.p.z)<.003)){report.stuck=next;break;}
  await delay(180);
 }
 assert(report.trace.at(-1).arrived,'Navigation stuck: '+JSON.stringify(report.stuck||report.trace.at(-1)));
 report.status='passed';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,frames:report.trace.length}));
}catch(e){report.error=e.stack;report.status='failed';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await b.shot('failure.png');throw e;}finally{b.close();}
