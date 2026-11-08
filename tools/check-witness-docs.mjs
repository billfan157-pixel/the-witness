// Local document-reader QA with a dedicated headless browser profile.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const contract=JSON.parse(fs.readFileSync(path.join(root,'docs','the-witness','design-contract.json'),'utf8'));
const output=path.join(root,'outputs',`THE-WITNESS-Design-v${(contract.depthExpansion?.revision||contract.documentVersion)}`);
const expectedChapters=contract.documentFiles.length;
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'witness-doc-qa-'));
const port=19437;
const child=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',[
  '--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',
  `--remote-debugging-port=${port}`,'--remote-debugging-address=127.0.0.1',
  `--user-data-dir=${profile}`,'about:blank'
],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let socket;
try{
  let endpoint;
  for(let i=0;i<40;i++){
    try{endpoint=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x=>x.type==='page')?.webSocketDebuggerUrl;if(endpoint)break;}catch{}
    await delay(250);
  }
  assert(endpoint,'Browser endpoint');
  socket=new WebSocket(endpoint);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  let seq=0;const pending=new Map();const errors=[];
  socket.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);if(d.error)p?.reject(new Error(JSON.stringify(d.error)));else p?.resolve(d.result);}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:pathToFileURL(path.join(output,'THE-WITNESS-Design-Compendium.html')).href});
  await delay(700);
  const initial=await evaluate(`({chapters:document.querySelectorAll('[data-chapter]').length,overflow:document.documentElement.scrollWidth>innerWidth,brokenAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).length})`);
  assert.equal(initial.chapters,expectedChapters);assert.equal(initial.overflow,false);assert.equal(initial.brokenAnchors,0);
  assert.equal(await evaluate(`document.querySelectorAll('#quest-jump option[value]:not([value=""])').length`),12);
  assert.equal(await evaluate(`document.querySelectorAll('#legend-jump option[value]:not([value=""])').length`),3);
  const screenshot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name),Buffer.from(r.data,'base64'));};
  await screenshot('reader-desktop.png');
  const filter=await evaluate(`(()=>{const i=document.getElementById('search');i.value='gieremia';i.dispatchEvent(new Event('input'));return [...document.querySelectorAll('[data-chapter]')].filter(x=>!x.hidden).length})()`);
  assert(filter>0&&filter<expectedChapters,'Search filters chapters without Vietnamese accents');
  await evaluate(`document.querySelector('nav a[href="#chapter-08"]').click()`);await delay(300);
  assert.equal(await evaluate(`document.querySelectorAll('[data-chapter][hidden]').length`),0);
  assert((await evaluate(`Math.abs(document.getElementById('chapter-08').getBoundingClientRect().top)`))<100,'Navigation scrolls to requested chapter after resetting filter');
  await screenshot('reader-scripture.png');
  await evaluate(`(()=>{const s=document.getElementById('quest-jump');s.value='#chapter-11-q08';s.dispatchEvent(new Event('change'));})()`);await delay(200);
  assert((await evaluate(`Math.abs(document.getElementById('chapter-11-q08').getBoundingClientRect().top)`))<100,'Quest selector opens Q08 dossier');
  assert.equal(await evaluate(`document.querySelectorAll('[data-chapter][hidden]').length`),0);
  await screenshot('reader-chapter-q08.png');
  for(const lid of ['l01','l02','l04']){
    await evaluate(`(()=>{const s=document.getElementById('legend-jump');s.value='#chapter-14-${lid}';s.dispatchEvent(new Event('change'));})()`);await delay(100);
    assert((await evaluate(`Math.abs(document.getElementById('chapter-14-${lid}').getBoundingClientRect().top)`))<100,'Legend selector opens '+lid);
  }
  await screenshot('reader-legend-peter.png');
  assert.equal(await evaluate(`document.querySelectorAll('h2[id^="chapter-15-l"]').length`),6,'Six source/world packet anchors');
  const jsonLinks=await evaluate(`([...document.querySelectorAll('a[href$=".json"]')].map(a=>a.getAttribute('href')))`);
  assert(jsonLinks.length>=2);for(const link of jsonLinks)assert(fs.existsSync(path.join(output,link)),'Packaged JSON link resolves');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate(`window.scrollTo(0,0)`);await delay(200);
  assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`),false);
  await screenshot('reader-mobile.png');
  await evaluate(`(()=>{const s=document.getElementById('quest-jump');s.value='#chapter-11-q08';s.dispatchEvent(new Event('change'));})()`);await delay(200);
  assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`),false);
  await screenshot('reader-mobile-chapter.png');
  await evaluate(`(()=>{const s=document.getElementById('legend-jump');s.value='#chapter-14-l01';s.dispatchEvent(new Event('change'));})()`);await delay(150);
  assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`),false,'Legend dossier fits mobile');
  await screenshot('reader-mobile-legend.png');
  for(const id of ['16','17','18','19']){
    await evaluate(`document.querySelector('nav a[href="#chapter-${id}"]').click()`);await delay(150);
    assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`),false,'Depth chapter '+id+' fits mobile');
  }
  await evaluate(`document.querySelector('nav a[href="#chapter-17"]').click()`);await delay(150);await screenshot('reader-depth-mobile.png');
  await evaluate(`(()=>{const i=document.getElementById('search');i.value='motcumkhongtontai987';i.dispatchEvent(new Event('input'));document.querySelector('nav a[href="#chapter-03"]').click();})()`);await delay(200);
  assert.equal(await evaluate(`document.querySelectorAll('[data-chapter][hidden]').length`),0,'Navigation recovers from no-match search');
  await send('Emulation.setDeviceMetricsOverride',{width:1000,height:1250,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:pathToFileURL(path.join(output,'THE-WITNESS-v3-Pitch.html')).href});await delay(300);
  await send('Emulation.setEmulatedMedia',{media:'print'});
  const pitch=await evaluate(`(()=>{const p=document.querySelector('.pitch-page'),r=p.getBoundingClientRect(),last=p.lastElementChild.getBoundingClientRect();return {width:r.width,height:r.height,scroll:p.scrollHeight,client:p.clientHeight,contentBottom:last.bottom-r.top,links:[...p.querySelectorAll('a')].map(a=>a.getAttribute('href'))}})()`);
  assert(pitch.height>1120&&pitch.height<1125,'Pitch uses an A4 page');
  assert(pitch.scroll<=pitch.client+1,'Pitch content fits one A4 page');
  assert(pitch.contentBottom<pitch.height-20,'Pitch has bottom breathing room');
  for(const link of pitch.links)assert(fs.existsSync(path.join(output,link.split('#')[0])),'Pitch link resolves');
  await screenshot('pitch-a4.png');
  await send('Emulation.setEmulatedMedia',{media:''});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await delay(100);
  assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`),false,'Pitch fits mobile');
  await screenshot('pitch-mobile.png');
  assert.equal(errors.length,0);
  const report={version:contract.depthExpansion?.revision||contract.documentVersion,status:'passed',scope:'document-reader-and-pitch-only; not gameplay',checks:[`${expectedChapters} documents render`,'all internal anchors resolve','no desktop page overflow','accent-insensitive search filters documents','navigation resets search and scrolls to correct document','three required-Legend selector targets open correctly','six source/world packet anchors resolve','12-bridge selector opens correct dossier','all three packaged JSON links resolve','no mobile page overflow on cover, bridge, Legend and four depth chapters','navigation recovers from no-match search','pitch fits one A4 CSS page and all links resolve','pitch fits mobile','no JavaScript exceptions'],pitchA4:pitch,viewportDesktop:[1440,1000],viewportMobile:[390,844]};
  fs.writeFileSync(path.join(output,'reader-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{socket?.close();child.kill();}
