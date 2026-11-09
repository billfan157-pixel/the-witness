import fs from 'node:fs';import path from 'node:path';
import {createRequire} from 'node:module';
import {browserDriver,delay} from './browser-driver.mjs';
const require=createRequire(import.meta.url),M=require('../witness-model.js'),D=require('../witness-content.js'),C=require('../witness-craft.js');
const out=path.resolve(import.meta.dirname,'artifacts/craft');fs.mkdirSync(out,{recursive:true});
const b=await browserDriver(out);const {seed,click,wait,evaluate,read}=b;
function stateAt(chapter,action,plan=null){const s=M.fresh();s.chapter=chapter;s.quests[D.chapters[chapter].id].plan=plan;const q=D.chapters[chapter];s.quests[q.id].done=q.tasks.map(a=>a.id).filter(id=>id!==action&&id!=='choose');if(plan){const steps=q.execution[plan]||[],index=steps.findIndex(a=>a.id===action);s.quests[q.id].done.push(...steps.slice(0,Math.max(0,index)).map(a=>a.id));}const a=M.actions(s).find(a=>a.id===action);const at=C.origin(s,a);s.positions[q.id+'.mortal']=[at[0],at[1]+1.1];return s;}
try{
  const s=stateAt(4,'audit','open_audit');
  const target=M.actions(s).find(a=>a.id==='audit').target;
  await seed(s);
  await click(`[data-world-target="${target}"]`);await wait('!!document.querySelector("[data-act=perform]")');await click('[data-act=perform]');await wait('!document.querySelector("#field-work").hidden');
  const before=await evaluate(`(()=>{const p=WitnessWorld.getContext().scene.getObjectByName('player');return [p.position.x,p.position.z];})()`);
  await click('[data-act=field-go][data-id="field:received"]');
  await delay(9000);
  const arrived=await evaluate(`!!document.querySelector('[data-act=field-number][data-id="field:received"]')`);
  const after=await evaluate(`(()=>{const p=WitnessWorld.getContext().scene.getObjectByName('player');return [p.position.x,p.position.z];})()`);
  const info=await evaluate(`(()=>{const s=JSON.parse(localStorage.getItem(WitnessModel.STORE));const pl=WitnessWorld.plan(s);return {col:pl.objects.filter(o=>o.id&&o.id.startsWith('col-')).map(o=>[o.id,o.solids.length]),nodeSolids:pl.objects.filter(o=>o.solids&&!o.id.startsWith('col-')).map(o=>[o.id,o.at,o.solids])};})()`);
  console.log(JSON.stringify({target,before,after,arrived,info},null,1));
}finally{b.close();}