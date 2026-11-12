import {spawn} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import assert from 'node:assert/strict';
export const delay=ms=>new Promise(r=>setTimeout(r,ms));
export async function browserDriver(out,port=19551,options={}){
  fs.mkdirSync(out,{recursive:true});const profile=fs.mkdtempSync(path.join(os.tmpdir(),'witness-craft-qa-'));
  // A CI runner has no hardware GPU and a different browser path; both are explicit here.
  // The software path must really select the SwiftShader backend: --enable-unsafe-swiftshader
  // alone only allows the fallback, so a machine with a GPU would still render on hardware.
  const forceSoftware=process.env.WITNESS_QA_HARDWARE==='0';
  const hardware=!forceSoftware&&(options.hardware||process.env.WITNESS_QA_HARDWARE==='1');
  const gpuArgs=hardware?['--use-angle=d3d11','--disable-software-rasterizer']:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
  // A software rasteriser compiles every shader on the CPU, so a single page evaluation can
  // block far longer than on a GPU. The protocol timeout has to cover that, not the machine.
  const protocolTimeout=Number(process.env.WITNESS_QA_TIMEOUT_MS||(hardware?60000:300000));
  // Every wait a gate asks for is a wall clock budget for the same work, so the software
  // path scales them instead of failing on a fixed threshold that a CPU renderer cannot meet.
  const waitScale=hardware?1:Number(process.env.WITNESS_QA_WAIT_SCALE||10);
  const chrome=process.env.WITNESS_CHROME||(['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(candidate=>fs.existsSync(candidate))||'chrome');
  const child=spawn(chrome,['--headless=new',...gpuArgs,'--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true});
  let socket;
  const closeBrowser=()=>{try{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({id:2147483647,method:'Browser.close'}));}catch{}setTimeout(()=>{socket?.close();child.kill();const resolved=path.resolve(profile),prefix=path.resolve(os.tmpdir())+path.sep+'witness-craft-qa-';if(resolved.startsWith(prefix))try{fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:300});}catch{}},300);};
  try{
    let endpoint;for(let i=0;i<50;i++){try{endpoint=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x=>x.type==='page')?.webSocketDebuggerUrl;if(endpoint)break;}catch{}await delay(200);}assert(endpoint);socket=new WebSocket(endpoint);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
    let sequence=0;const pending=new Map(),errors=[];socket.addEventListener('message',event=>{const d=JSON.parse(event.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p?.reject(Error(JSON.stringify(d.error))):p?.resolve(d.result);}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);});
    const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('Browser protocol timeout: '+method));},protocolTimeout);pending.set(id,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});socket.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
    const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name),Buffer.from(r.data,'base64'));};
    const wait=async(expression,ms=18000)=>{const budget=ms*waitScale,deadline=Date.now()+budget;while(Date.now()<deadline){if(await evaluate(expression))return;await delay(150);}await shot('failure.png');throw Error('Timed out: '+expression+'\n'+JSON.stringify(await evaluate('({dialog:document.querySelector("dialog")?.innerText,field:document.querySelector("#field-work")?.innerText,toast:document.querySelector("#toast")?.innerText})')));};
    const click=async selector=>{for(let n=0;n<120*waitScale;n++){const clicked=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.matches(':disabled')||globalThis.WitnessCloudSession?.info().ready===false)return false;e.click();return true;})()`);if(clicked)return;await delay(150);}throw Error('Click target did not become ready: '+selector);};
    const select=(selector,value)=>evaluate(`(()=>{const x=document.querySelector(${JSON.stringify(selector)});x.value=${JSON.stringify(value)};x.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    const read=()=>evaluate('JSON.parse(localStorage.getItem(WitnessModel.STORE))');
    await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:!options.serviceWorker});await send('Emulation.setDeviceMetricsOverride',{width:Number(process.env.WITNESS_QA_WIDTH)||options.width||1440,height:Number(process.env.WITNESS_QA_HEIGHT)||options.height||1000,deviceScaleFactor:1,mobile:false});await send('Page.addScriptToEvaluateOnNewDocument',{source:'Object.defineProperty(navigator,"deviceMemory",{get:()=>4});'});
    if(options.blockHttp)await send('Network.setBlockedURLs',{urls:['http://*','https://*']});
    await send('Page.navigate',{url:options.url??process.env.WITNESS_BASE_URL??'http://127.0.0.1:8034/'});await wait(options.ready??'!!globalThis.WitnessCraft&&!!document.querySelector("canvas")',options.loadTimeout??(hardware?45000:300000));
    const seed=async state=>{const s=JSON.parse(JSON.stringify(state));s.settings.graphics='balanced';const hook=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('the-witness.spine.v3',${JSON.stringify(JSON.stringify(s))});`});await evaluate('globalThis.__qaSeedNavigation=true');await send('Page.reload',{ignoreCache:true});await wait('!globalThis.__qaSeedNavigation&&!!document.querySelector("#title-actions [data-act=continue]")');await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:hook.identifier});await click('#title-actions [data-act=continue]');await wait('!!document.querySelector("dialog")');await click('dialog [data-act=close]');await delay(350);};
    return {send,evaluate,shot,wait,click,select,read,seed,errors,close:closeBrowser};
  }catch(e){closeBrowser();throw e;}
}
