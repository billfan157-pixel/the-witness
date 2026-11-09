import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {browserDriver} from './browser-driver.mjs';
const require=createRequire(import.meta.url),M=require('../witness-model.js'),D=require('../witness-content.js'),C=require('../witness-craft.js');
const out=path.resolve(import.meta.dirname,'artifacts/field-keyboard'),b=await browserDriver(out,19652);
try{
  let s=M.fresh();s.chapter=4;s.quests.Q05.plan='open_audit';s.quests.Q05.done=D.chapters[4].tasks.map(a=>a.id).filter(id=>id!=='choose'&&id!=='audit');
  s=M.fieldStart(s,'audit');const point=C.fieldSpots(s).find(p=>p.key==='received');s.positions['Q05.mortal']=point.at;
  await b.seed(s);await b.wait(`!!document.querySelector('[data-act=field-number][data-delta="1"]')`);
  await b.click('.field-brief > summary');await b.click('.field-destinations > summary');
  await b.evaluate(`document.querySelector('[data-act=field-number][data-delta="1"]').focus()`);
  for(let count=1;count<=2;count++){
    await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await b.wait(`Number(JSON.parse(localStorage.getItem(WitnessModel.STORE)).workshop.drafts['Q05.RECONCILE'].payload.numbers.received)===${count}`);
    assert(await b.evaluate('document.activeElement.dataset.act==="field-number"&&document.activeElement.dataset.delta==="1"'));
    assert(await b.evaluate('document.querySelector(".field-brief").open&&document.querySelector(".field-destinations").open'));
  }
  assert(!(await b.read()).quests.Q05.done.includes('audit'));assert.deepEqual(b.errors,[]);await b.shot('keyboard-count-focus.png');
  const report={status:'passed',checks:['Native Enter can increment twice across field redraws while keeping the same button focused','Open instructions and destinations stay open through draft changes','Keyboard preparation does not commit the audit'],errors:b.errors};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{b.close();}
