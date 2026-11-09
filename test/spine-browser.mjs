import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),D=require('../witness-content.js'),M=require('../witness-model.js');
function ready(id){let s=M.fresh();for(let i=0;i<=D.legends[id].after;i++){s.chapter=i;s.quests[D.chapters[i].id].route=Object.keys(D.chapters[i].execution)[0];const earlier=D.spine.find(k=>D.legends[k].after===i&&k!==id);if(earlier){s=M.openLayer(s,'legend',earlier,'accessible_summary');while(s.layer.summaryIndex<D.legends[earlier].beats.length)s=M.summaryStep(s);s=M.closeLayer(s);}}const gate=D.chapters[s.chapter].nodes.find(n=>n.id==='gate').at;s.positions[D.chapters[s.chapter].id+'.mortal']=[gate[0],gate[1]+1];return s;}
const visualOnly=process.argv.includes('--visual-only');
const out=path.resolve(import.meta.dirname,'artifacts/v3');fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'witness-spine-qa-')),port=Number(process.env.WITNESS_QA_PORT||19544);
const child=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--enable-unsafe-swiftshader','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let socket;
try{
  let endpoint;for(let i=0;i<50;i++){try{endpoint=(await(await fetch('http://127.0.0.1:'+port+'/json/list')).json()).find(x=>x.type==='page')?.webSocketDebuggerUrl;if(endpoint)break;}catch{}await delay(200);}assert(endpoint);
  socket=new WebSocket(endpoint);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map(),errors=[],checks=[];
  socket.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p?.reject(Error(JSON.stringify(d.error))):p?.resolve(d.result);}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{
    // Await cloud/guest bootstrap before synthetic clicks, as the real UI does.
    if(expression.includes('.click()')){
      let ready=false;for(let n=0;n<120;n++){const probe=await send('Runtime.evaluate',{expression:'globalThis.WitnessCloudSession?.info().ready!==false',returnByValue:true});if(probe.result?.value){ready=true;break;}await delay(100);}if(!ready)throw Error('Save bootstrap did not become ready');
    }
    const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;
  };
  const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name),Buffer.from(r.data,'base64'));};
  const waitFor=async(expression,max=25000)=>{for(let t=0;t<max;t+=200){if(await evaluate(expression))return;await delay(200);}await shot('failure.png');console.log(JSON.stringify(await evaluate('({world:{...document.querySelector("#world").dataset},toast:document.querySelector("#toast").textContent,dialog:document.querySelector("dialog")?.innerText})')));throw Error('Timed out: '+expression);};
  const read=()=>evaluate('JSON.parse(localStorage.getItem(WitnessModel.STORE))');
  const click=selector=>evaluate('document.querySelector('+JSON.stringify(selector)+').click()');
  await send('Runtime.enable');await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'Object.defineProperty(navigator,"deviceMemory",{get:()=>4});'});
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:process.env.WITNESS_BASE_URL??'http://127.0.0.1:8034/'});await waitFor('!!document.querySelector("canvas")');
  const seed=async state=>{const hook=await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.setItem("the-witness.spine.v3",'+JSON.stringify(JSON.stringify(state))+');'});await send('Page.reload',{ignoreCache:true});await waitFor('!!document.querySelector("#title-actions [data-act=continue]")');await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:hook.identifier});await click('#title-actions [data-act=continue]');await waitFor('!!document.querySelector("dialog")');if(await evaluate('!document.querySelector("[data-act=summary-next]")'))await click('dialog [data-act=close]');await delay(400);};
  for(const id of (visualOnly?[]:D.spine)){
    await seed(ready(id));await waitFor('!!document.querySelector("[data-world-target=gate]")');await click('[data-world-target=gate]');await waitFor('!!document.querySelector("dialog [data-act=layer-open]")');await click('dialog [data-act=layer-skip]');await waitFor('!!document.querySelector("dialog [data-act=summary-next]")');
    assert.equal((await read()).legends[id].status,'in_progress');
    if(id==='L01'){
      await shot('summary-desktop.png');await click('dialog [data-act=close]');await click('#hud-top [data-act=pause]');await click('dialog [data-act=layer-exit]');await waitFor('JSON.parse(localStorage.getItem(WitnessModel.STORE)).layer===null');
      assert.equal((await read()).legends[id].status,'in_progress');assert.equal((await read()).chapter,2);checks.push('Exit from summary keeps the required gate closed');
      await delay(500);await click('#hud-top [data-act=pause]');await click('dialog [data-act=layer-intro][data-id=L01]');await click('dialog [data-act=layer-skip]');await waitFor('!!document.querySelector("dialog [data-act=summary-next]")');
    }
    for(let i=0;i<D.legends[id].beats.length;i++){await click('dialog [data-act=summary-next]');await delay(70);}
    await waitFor('!!document.querySelector("dialog [data-act=layer-return]")');assert.equal((await read()).legends[id].status,'in_progress');
    await click('dialog [data-act=layer-return]');await waitFor('JSON.parse(localStorage.getItem(WitnessModel.STORE)).layer===null');assert.equal((await read()).legends[id].status,'committed');checks.push(id+' summary delivers all core beats before ending commit');
  }
  for(const id of D.spine){
    const src=D.legends[id];await seed(M.openLayer(ready(id),'legend',id,'interactive'));await delay(500);await shot(id+'-world.png');if(visualOnly){checks.push(id+' source world renders with WebGL');continue;}
    while((await read()).layer?.step<src.steps.length){
      const current=await read(),a=M.actions(current)[0];console.log(JSON.stringify({legend:id,step:current.layer.step,action:a.id}));
      await click('#objective [data-act=guide]');
      await waitFor('(()=>{const p=document.querySelector("#world").dataset;return Math.hypot(Number(p.playerX)-('+a.at[0]+'),Number(p.playerZ)-('+a.at[1]+'))<2.8})()',30000);
      await click('[data-world-target="'+a.target+'"]');if(require('../witness-depth.js').encounter(current,a)){await waitFor('!document.querySelector("#field-work").hidden||!!document.querySelector("[data-workshop]")');if(await evaluate('!document.querySelector("#field-work").hidden'))await click('[data-act=field-board]');}await waitFor('!!document.querySelector("dialog")');
      if(require('../witness-depth.js').encounter(current,a)){await click('dialog [data-act=depth-hint]');assert((await evaluate('document.getElementById("depth-feedback").textContent')).includes('Gợi ý 1/3'));await click('dialog [data-act=depth-hint]');await click('dialog [data-act=depth-hint]');await click('dialog [data-act=depth-commit]');}
      else if(a.kind==='route')await click('dialog [data-act=layer-choice][data-choice=overlook]');
      else{if(a.kind==='order'){await click('dialog [data-act=legend-order-hint]');assert((await evaluate('document.getElementById("legend-order-feedback").textContent')).includes('Gợi ý nhẹ'),'Level one hint must stay vague');await click('dialog [data-act=legend-order-hint]');await click('dialog [data-act=legend-order-hint]');}if(a.kind==='source'&&id==='L02'&&a.beat==='L02.B02')await shot('david-source.png');await click('dialog [data-act=layer-step]');}
      await waitFor('JSON.parse(localStorage.getItem(WitnessModel.STORE)).layer.step>'+current.layer.step);
    }
    await waitFor('!!document.querySelector("dialog [data-act=layer-return]")');await shot(id+'-ending.png');await click('dialog [data-act=layer-return]');await waitFor('JSON.parse(localStorage.getItem(WitnessModel.STORE)).layer===null');
    assert.equal((await read()).legends[id].status,'committed');assert.deepEqual((await read()).evidence,ready(id).evidence);checks.push(id+' physical alternative route, work and source beats complete');
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await seed(M.openLayer(ready('L04'),'legend','L04','accessible_summary'));await waitFor('!!document.querySelector("[data-act=summary-next]")');await shot('summary-mobile.png');assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  await click('dialog [data-act=summary-next]');await seed(await read());assert.equal((await read()).layer.summaryIndex,1);await shot('summary-resume-mobile.png');checks.push('Mobile summary fits screen and reload resumes exact page');
  await click('dialog [data-act=close]');await click('#hud-top [data-act=pause]');await click('dialog [data-act=layer-format]');await waitFor('JSON.parse(localStorage.getItem(WitnessModel.STORE)).layer.format==="interactive"');await delay(500);await shot('peter-mobile.png');assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);checks.push('Format switch resumes first missing source beat');
  assert.equal(errors.length,0);const report={release:D.release,status:'passed',checks,errors,scope:'Browser UI and WebGL with scripted input; no human playtest'};fs.writeFileSync(path.join(out,visualOnly?'visual-browser-report.json':'spine-browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{socket?.close();child.kill();try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:300});}catch{}}
