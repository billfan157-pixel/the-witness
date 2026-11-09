import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {browserDriver} from './browser-driver.mjs';
const require=createRequire(import.meta.url),M=require('../witness-model.js'),C=require('../witness-craft.js'),X=require('../witness-depth.js');
const out=path.resolve(import.meta.dirname,'artifacts/craft-details'),b=await browserDriver(out,19651),checks=[];
try{
  let s=M.fresh();s.chapter=1;
  const paper=C.details(s).find(d=>d.kind==='paper');s.positions['Q02.mortal']=[paper.at[0],paper.at[1]+1.2];
  await b.seed(s);await b.click(`[data-world-target="${paper.id}"]`);await b.wait('!!document.querySelector("dialog.inspection-dialog")');
  await b.click('[data-act=detail-lift]');await b.click('[data-act=detail-light]');
  assert.equal((await b.read()).evidence.length,0);
  assert(await b.evaluate('(()=>{const g=WitnessWorld.getContext().scene.getObjectByName("craft:Q02-patch");let readable=false;g.traverse(o=>{if(o.userData.craftTexture&&o.material.isMeshBasicMaterial&&o.material.map.image.width>=768)readable=true});return readable})()'));
  await b.shot('q02-paper-closeup.png');checks.push('Paper inspection retains readable ink, a lifted flap and zero new evidence');
  for(const [id,choice]of [['B02','work_with_representative'],['B04','share_real_task']]){
    s=M.fresh();s.chapter=10;s=M.startBond(s,id,choice);const a=M.actions(s).find(a=>a.bond===id);
    s=M.act(s,a.id,{puzzle:{work:X.guided(s,X.encounter(s,a))}});
    const detail=C.details(s).find(d=>d.owner===id);s.positions['Q11.mortal']=[detail.at[0],detail.at[1]+1.2];
    await b.seed(s);await b.click(`[data-world-target="${detail.id}"]`);await b.wait('!!document.querySelector("dialog.inspection-dialog")');
    assert(await b.evaluate(`WitnessWorld.getContext().scene.getObjectByName(${JSON.stringify(detail.id)}).userData.committed`));
    if(id==='B04')assert(await b.evaluate('!!WitnessWorld.getContext().scene.getObjectByName("actor-craft-apprentice")||WitnessWorld.plan(JSON.parse(localStorage.getItem(WitnessModel.STORE))).objects.some(o=>o.id==="craft-apprentice")'));
    await b.shot(id.toLowerCase()+'-completed-closeup.png');checks.push(id+' completed work remains inspectable beside the participant');
  }
  await b.send('Page.navigate',{url:pathToFileURL(path.resolve(import.meta.dirname,'../dist/ban-choi-ngoai-tuyen.html')).href});
  await b.wait('!!globalThis.WitnessCraft&&WitnessDepth.all().length===31&&!!document.querySelector("canvas")');
  s=M.fresh();s.positions['Q01.mortal']=[-10,6.1];await b.seed(s);
  await b.click('[data-world-target="load"]');await b.wait('!!document.querySelector("[data-act=perform]")');await b.click('[data-act=perform]');
  await b.wait('!document.querySelector("#field-work").hidden');await b.click('[data-act=field-go][data-id="field:block"]');
  await b.wait('JSON.parse(localStorage.getItem(WitnessModel.STORE)).workshop.drafts["Q01.LOAD"].payload.order.includes("block")',30000);
  assert(!(await b.read()).quests.Q01.done.includes('brace'));await b.shot('offline-field-work.png');checks.push('Standalone file embeds all 31 activities and performs field preparation without committing early');
  assert.deepEqual(b.errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'passed',checks,errors:b.errors,scope:'automated browser inspection and offline interaction; visual screenshots reviewed separately'},null,2));
  console.log(JSON.stringify({status:'passed',checks}));
}finally{b.close();}
