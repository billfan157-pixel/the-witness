import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const M=require('../witness-model.js');
const tag=process.argv[2]||'trees';
const chapter=Number(process.argv[3]??2);
const out=path.resolve(import.meta.dirname,'artifacts');fs.mkdirSync(out,{recursive:true});
const port=Number(process.env.WITNESS_QA_PORT||19561);
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'witness-trees-qa-'));
const child=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--enable-unsafe-swiftshader','--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let socket;
try{
  let endpoint;for(let i=0;i<60;i++){try{endpoint=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x=>x.type==='page')?.webSocketDebuggerUrl;if(endpoint)break;}catch{}await delay(200);}assert(endpoint);
  socket=new WebSocket(endpoint);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  let seq=0;const pending=new Map(),errors=[];
  socket.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p?.reject(Error(JSON.stringify(d.error))):p?.resolve(d.result);}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const waitFor=async(expression,max=20000)=>{for(let t=0;t<max;t+=200){if(await evaluate(expression))return;await delay(200);}await shot(tag+'-failure.png');throw Error('Timed out: '+expression);};
  const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name),Buffer.from(r.data,'base64'));};
  const hold=async(key,ms)=>{await evaluate(`document.body.dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(key)},bubbles:true}))`);await delay(ms);await evaluate(`document.body.dispatchEvent(new KeyboardEvent('keyup',{key:${JSON.stringify(key)},bubbles:true}))`);await delay(150);};
  const closeDialog=async()=>{if(await evaluate(`!!document.querySelector('dialog [data-act="close"]')`)){await evaluate(`document.querySelector('dialog [data-act="close"]').click()`);await delay(400);}};
  await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
  let state=M.fresh();state.chapter=chapter;state.settings={...state.settings,graphics:'balanced'};
  const hook=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('the-witness.spine.v3',${JSON.stringify(JSON.stringify(state))});`});
  await send('Page.navigate',{url:'http://127.0.0.1:8034/'});
  await waitFor(`!!document.querySelector('#title-actions [data-act="continue"]')`);
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:hook.identifier});
  await evaluate(`document.querySelector('#title-actions [data-act="continue"]').click()`);
  await waitFor(`!!document.querySelector('canvas')`);
  await waitFor(`!!document.querySelector('dialog [data-act="close"]')`);
  await closeDialog();await closeDialog();
  await delay(1800);
  await shot(tag+'-0-overview.png');
  for(let i=1;i<=4;i++){await hold('r',430);await delay(250);await shot(`${tag}-${i}-turn.png`);}
  await hold('w',1500);await delay(300);await shot(tag+'-5-walk.png');
  for(let i=6;i<=8;i++){await hold('r',430);await delay(250);await shot(`${tag}-${i}-turn.png`);}
  await hold('w',1200);await delay(300);await shot(tag+'-9-walk.png');
  console.log(JSON.stringify({tag,chapter,errors:errors.slice(0,3),errorCount:errors.length,shots:fs.readdirSync(out).filter(f=>f.startsWith(tag+'-')).length}));
}finally{socket?.close();child.kill();}