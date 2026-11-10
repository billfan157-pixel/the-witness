import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {browserDriver,delay} from '../test/browser-driver.mjs';
const root=path.resolve(import.meta.dirname,'..');
const contract=JSON.parse(fs.readFileSync(path.join(root,'docs/the-witness/design-contract.json'),'utf8'));
const edition=contract.depthExpansion?.revision||contract.documentVersion;
const output=path.join(root,'outputs',`THE-WITNESS-Design-v${edition}`);
const report=JSON.parse(fs.readFileSync(path.join(output,'validation.json'),'utf8'));
const b=await browserDriver(output,19672,{url:pathToFileURL(path.join(output,'THE-WITNESS-Design-Compendium.html')).href,ready:'!!document.querySelector("[data-chapter]")',width:1440,height:1000});
let checks=0;
const check=(value,message)=>{assert(value,message);checks++;};
try{
 check(await b.evaluate(`document.querySelectorAll('[data-chapter]').length===${contract.documentFiles.length}`),'Every current manifest document renders');
 check(await b.evaluate(`(()=>{const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);return ids.length===new Set(ids).size;})()`),'No duplicate section or heading IDs');
 check(await b.evaluate(`![...document.querySelectorAll('a[href^="#"]')].some(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1))))`),'Internal anchors resolve');
 check(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Desktop has no page overflow');
 check(await b.evaluate(`document.querySelectorAll('#quest-jump option[value]:not([value=""])').length===12`),'Twelve Q routes');
 check(await b.evaluate(`document.querySelectorAll('#legend-jump option[value]:not([value=""])').length===3`),'Three required Legends');
 await b.shot('reader-desktop.png');
 const filtered=await b.evaluate(`(()=>{search.value='gieremia';search.dispatchEvent(new Event('input'));return [...document.querySelectorAll('[data-chapter]')].filter(e=>!e.hidden).length;})()`);
 check(filtered>0&&filtered<contract.documentFiles.length,'Unaccented search filters current content');
 for(const [selector,value,target] of [['#quest-jump','#chapter-11-q08','chapter-11-q08'],['#legend-jump','#chapter-14-l01','chapter-14-l01']]){
  await b.select(selector,value);await delay(150);
  check(await b.evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(target)});return !!e&&!e.closest('[data-chapter]').hidden&&Math.abs(e.getBoundingClientRect().top)<100;})()`),'Route opens source after filtering');
 }
 const local=await b.evaluate(`([...document.querySelectorAll('a[href^="sources/"]')].map(a=>a.getAttribute('href')))`);
 for(const link of local)check(fs.existsSync(path.join(output,decodeURIComponent(link.split('#')[0]))),'Exported local reference exists: '+link);
 await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await delay(150);
 check(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Mobile has no page overflow');await b.shot('reader-mobile.png');
 await b.send('Page.navigate',{url:pathToFileURL(path.join(output,'THE-WITNESS-v3-Pitch.html')).href});await delay(300);
 check(await b.evaluate('!!document.querySelector(".pitch-page")&&document.documentElement.scrollWidth<=innerWidth'),'Pitch opens on mobile');await b.shot('pitch-mobile.png');
 check(b.errors.length===0,'No browser runtime exceptions');
 const result={status:'passed',scope:'documentation reader only; no gameplay/art acceptance',checks,documents:contract.documentFiles.length,core:report.coreDocuments};
 fs.writeFileSync(path.join(output,'reader-qa.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{b.close();}
