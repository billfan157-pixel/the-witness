import fs from 'node:fs';import path from 'node:path';
import {createRequire} from 'node:module';
import {browserDriver,delay} from './browser-driver.mjs';
const require=createRequire(import.meta.url),M=require('../witness-model.js'),D=require('../witness-content.js'),C=require('../witness-craft.js');
const out=path.resolve(import.meta.dirname,'artifacts/craft');fs.mkdirSync(out,{recursive:true});
const b=await browserDriver(out,19571);const {seed,evaluate}=b;
const hold=async(key,ms)=>{await evaluate(`document.body.dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(key)},bubbles:true}))`);await delay(ms);await evaluate(`document.body.dispatchEvent(new KeyboardEvent('keyup',{key:${JSON.stringify(key)},bubbles:true}))`);await delay(120);};
function stateAt(chapter,action,plan=null){const s=M.fresh();s.chapter=chapter;s.quests[D.chapters[chapter].id].plan=plan;const q=D.chapters[chapter];s.quests[q.id].done=q.tasks.map(a=>a.id).filter(id=>id!==action&&id!=='choose');if(plan){const steps=q.execution[plan]||[],index=steps.findIndex(a=>a.id===action);s.quests[q.id].done.push(...steps.slice(0,Math.max(0,index)).map(a=>a.id));}const a=M.actions(s).find(a=>a.id===action);const at=C.origin(s,a);s.positions[q.id+'.mortal']=[at[0],at[1]+1.1];return s;}
try{
  const s=stateAt(4,'audit','open_audit');await seed(s);
  const npc=await evaluate(`WitnessWorld.plan(JSON.parse(localStorage.getItem(WitnessModel.STORE))).objects.find(o=>o.id==='recipient').at`);
  const start=await evaluate(`(()=>{const p=WitnessWorld.getContext().scene.getObjectByName('player');return [p.position.x,p.position.z];})()`);
  await hold('w',2500);
  const end=await evaluate(`(()=>{const p=WitnessWorld.getContext().scene.getObjectByName('player');return [p.position.x,p.position.z];})()`);
  const d=Math.hypot(end[0]-npc[0],end[1]-npc[1]);
  const mb=await evaluate(`window.__mb||null`);
  console.log(JSON.stringify({npc,start,end,distToNpc:+d.toFixed(2),blocked:d<0.9,mb}));
}finally{b.close();}