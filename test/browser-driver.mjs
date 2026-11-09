import {spawn} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import assert from 'node:assert/strict';
export const delay=ms=>new Promise(r=>setTimeout(r,ms));
export async function browserDriver(out,port=19551){
  fs.mkdirSync(out,{recursive:true});const profile=fs.mkdtempSync(path.join(os.tmpdir(),'witness-craft-qa-'));
  const child=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--enable-unsafe-swiftshader','--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true});
  let socket;try{
    let endpoint;for(let i=0;i<50;i++){try{endpoint=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x=>x.type==='page')?.webSocketDebuggerUrl;if(endpoint)break;}catch{}await delay(200);}assert(endpoint);socket=new WebSocket(endpoint);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
    let sequence=0;const pending=new Map(),errors=[];socket.addEventListener('message',event=>{const d=JSON.parse(event.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);});
    const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
    const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name),Buffer.from(r.data,'base64'));};
    const wait=async(expression,ms=18000)=>{for(let t=0;t<ms;t+=150){if(await evaluate(expression))return;await delay(150);}await shot('failure.png');throw Error('Timed out: '+expression+'\n'+JSON.stringify(await evaluate('({dialog:document.querySelector("dialog")?.innerText,field:document.querySelector("#field-work")?.innerText,toast:document.querySelector("#toast")?.innerText})')));};
    const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    const select=(selector,value)=>evaluate(`(()=>{const x=document.querySelector(${JSON.stringify(selector)});x.value=${JSON.stringify(value)};x.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    const read=()=>evaluate('JSON.parse(localStorage.getItem(WitnessModel.STORE))');
    await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await send('Page.addScriptToEvaluateOnNewDocument',{source:'Object.defineProperty(navigator,"deviceMemory",{get:()=>4});'});
    await send('Page.navigate',{url:'http://127.0.0.1:8034/'});await wait('!!globalThis.WitnessCraft&&!!document.querySelector("canvas")');
    const seed=async state=>{const s=JSON.parse(JSON.stringify(state));s.settings.graphics='balanced';const hook=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('the-witness.spine.v3',${JSON.stringify(JSON.stringify(s))});`});await send('Page.reload',{ignoreCache:true});await wait('!!document.querySelector("#title-actions [data-act=continue]")');await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:hook.identifier});await click('#title-actions [data-act=continue]');await wait('!!document.querySelector("dialog")');await click('dialog [data-act=close]');await delay(350);};
    return {send,evaluate,shot,wait,click,select,read,seed,errors,close(){socket.close();child.kill();}};
  }catch(e){socket?.close();child.kill();throw e;}
}
