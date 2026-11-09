import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';
import {browserDriver} from './browser-driver.mjs';import M from '../witness-model.js';
const offline=process.argv.includes('--offline'),out=path.resolve('outputs/q01-gold/'+(offline?'offline-inference':'inference-regression'));
const b=await browserDriver(out,offline?19740:19739,{hardware:true,width:390,height:844,...(offline?{url:pathToFileURL(path.resolve('dist/ban-choi-ngoai-tuyen.html')).href,blockHttp:true}:{})});
const report={snapshots:[]};
try{
 if(offline){
  await b.wait(`(()=>{const s=WitnessWorld.getContext().scene,maps={};s.traverse(o=>{if(o.material?.userData.q01Material&&o.material.map)maps[o.material.userData.q01Material]=[o.material.map,o.material.normalMap,o.material.roughnessMap].every(t=>t.image?.width===512&&t.image.src.startsWith('data:'));});return ['wood','plaster','floor','stone'].every(k=>maps[k]);})()`,30000);
  report.standaloneSHA256=crypto.createHash('sha256').update(fs.readFileSync(path.resolve('dist/ban-choi-ngoai-tuyen.html'))).digest('hex');report.q01EmbeddedMaterialPixels=512;
 }
 const s=M.fresh();s.chapter=1;const ch=M.chapter(s);s.quests.Q02.done=ch.tasks.map(t=>t.id).filter(x=>x!=='patch'&&x!=='choose');const a=M.actions(s).find(a=>a.id==='patch');assert(a);const at=ch.nodes.find(n=>n.id===a.target).at;s.positions['Q02.mortal']=[at[0],at[1]+1];
 await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await b.seed(s);
 await b.click(`[data-world-target="${a.target}"]`);await b.wait('!!document.querySelector("[data-act=perform]")');await b.click('[data-act=perform]');if(await b.evaluate('!document.querySelector("#field-work").hidden'))await b.click('[data-act=field-board]');await b.wait('!!document.querySelector("[data-workshop]")');
 await b.evaluate(`globalThis.inferenceEvents=[];for(const type of ['click','change'])document.addEventListener(type,e=>{if(e.target.matches('[data-depth-input]'))inferenceEvents.push({type,kind:e.target.dataset.kind,key:e.target.dataset.key,value:e.target.value,checked:e.target.checked,defaultPrevented:e.defaultPrevented});});`);
 async function snap(name){const st=await b.read();report.snapshots.push({name,claims:st.workshop.drafts['Q02.PALIMPSEST']?.payload.claims,dom:await b.evaluate(`[...document.querySelectorAll('[data-kind=card][data-key=altered]')].map(x=>({tag:x.tagName,type:x.type,value:x.value,checked:x.checked,disabled:x.matches(':disabled'),inModal:document.querySelector('dialog:modal')?.contains(x),html:x.outerHTML,parent:x.parentElement.outerHTML}))`)});}
 await b.select('#depth-status-altered','supported');await snap('status');
 await b.click('[data-kind=card][data-key=altered][value=fiber]');await snap('fiber');
 await b.click('[data-kind=card][data-key=altered][value=ink]');await snap('ink');
 await b.select('#depth-status-author','open');await b.select('#depth-status-lot','open');await snap('open claims');
 report.events=await b.evaluate('inferenceEvents');
 assert.deepEqual(report.snapshots.at(-1).claims.altered.cards,['fiber','ink']);
 await b.click('[data-act=depth-commit]');await b.wait('!!JSON.parse(localStorage.getItem(WitnessModel.STORE)).workshop.records["Q02.PALIMPSEST"]');
 if(offline){report.httpResources=await b.evaluate('performance.getEntriesByType("resource").filter(x=>/^https?:/.test(x.name)).map(x=>x.name)');assert.deepEqual(report.httpResources,[]);}
 assert.deepEqual(b.errors,[]);report.status='passed';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}catch(e){report.error=e.stack;report.status='failed';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await b.shot('failure.png');throw e;}finally{b.close();}
