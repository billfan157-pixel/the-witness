import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),D=require('../witness-content.js'),M=require('../witness-model.js');
function seedUntil(stop,policy={}){let s=M.fresh(),limit=200;while(!stop(s)){const a=M.actions(s)[0];assert(a);let o={};if(a.choices)o.choice=a.choices.find(c=>c[0]===(a.plan?policy[M.chapter(s).id]:policy[a.id])&&(!a.plan||M.planAllowed(s,c[0])))?.[0]||a.choices.find(c=>!a.plan||M.planAllowed(s,c[0]))[0];if(a.puzzle)o.puzzle=a.puzzle==='brace'?{order:['support','secure','release']}:a.puzzle==='rope'?{order:['anchor','bind','test']}:a.puzzle==='rescue'?{order:['anchor','receive','pull']}:a.puzzle==='copy'?{fields:['amount','lot','place']}:a.puzzle==='redact'?{remove:['name','address','description']}:a.puzzle==='count'?{answer:s.chapter<4?22:4}:a.puzzle==='supplies'?{reserve:1}:a.puzzle==='release'?{confirmed:true}:{answer:{patch:'amended',trace:'route',consent:'agree',water:'outer',claims:'limited'}[a.puzzle]};if(a.escort){s=M.escort(s,a.id);o.position=M.chapter(s).nodes.find(n=>n.id===a.destination).at;}s=M.act(s,a.id,o);assert(--limit>0);}return s;}
const out=path.resolve(import.meta.dirname,'artifacts');fs.mkdirSync(out,{recursive:true});
const port=19543,profile=fs.mkdtempSync(path.join(os.tmpdir(),'witness-game-qa-'));
const child=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--enable-unsafe-swiftshader','--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let socket;
try{
  let endpoint;for(let i=0;i<50;i++){try{endpoint=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x=>x.type==='page')?.webSocketDebuggerUrl;if(endpoint)break;}catch{}await delay(200);}assert(endpoint);
  socket=new WebSocket(endpoint);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map(),errors=[];
  socket.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p?.reject(Error(JSON.stringify(d.error))):p?.resolve(d.result);}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const waitFor=async(expression,max=16000)=>{for(let t=0;t<max;t+=200){if(await evaluate(expression))return;await delay(200);}await shot('failure.png');console.log(JSON.stringify(await evaluate(`({world:{...document.querySelector('#world').dataset},label:document.getElementById('distance-label').textContent,toast:document.getElementById('toast').textContent,dialog:document.querySelector('dialog')?.innerText,errors:${JSON.stringify(errors)}})`)));throw Error('Timed out: '+expression);};
  const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name),Buffer.from(r.data,'base64'));};
  await send('Runtime.enable');await send('Page.enable');await send('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(navigator,'deviceMemory',{get:()=>4});"});await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
  let state=M.fresh();state.chapter=1;state=M.openLayer(state,'legend','L03');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('the-witness.campaign.v2',${JSON.stringify(JSON.stringify(state))});`});
  await send('Page.navigate',{url:'http://127.0.0.1:8034/'});
  await waitFor(`!!document.querySelector('#title-actions [data-act="continue"]')`);
  await evaluate(`document.querySelector('[data-act="continue"]').click()`);
  await waitFor(`document.getElementById('region-name').textContent==='LEGENDS OF SCRIPTURE'&&!!document.querySelector('dialog')`);
  await evaluate(`document.querySelector('dialog [data-act="close"]').click()`);
  await delay(1500);await shot('legend-jeremiah-final.png');
  assert.equal(errors.length,0);console.log(JSON.stringify({status:'passed',scene:'L03',errors}));

}finally{socket?.close();child.kill();}
