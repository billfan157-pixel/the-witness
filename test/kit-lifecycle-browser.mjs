import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {browserDriver} from './browser-driver.mjs';
const out=path.resolve(process.env.WITNESS_KIT_LIFECYCLE_OUT||'outputs/environment-kit/phase12-proof');fs.mkdirSync(out,{recursive:true});
const b=await browserDriver(out,19586,{hardware:true,serviceWorker:true,url:'http://127.0.0.1:8034/kit-lab.html',width:1200,height:850,ready:'!!globalThis.KitLab?.ready'});
const report={checks:[],runtime:'hardware WebGL functional checks; performance measured separately'};
try{
 const results=await b.evaluate(`(${(async function(){
  const {T,renderer,scene,camera}=KitLab;KitLab.pause(true);await KitLab.kit.dispose();
  const verify=(condition,message)=>{if(!condition)throw Error(message);};
  const manifest=await(await fetch('./assets/environment-kit/cae/manifest-v2.json')).json();
  const variants=manifest.pieces[0].variants,results=[];
  const idle=async kit=>{await kit.whenIdle();const s=kit.snapshot();verify(s.resources===0&&s.entries===0&&s.leases===0&&s.pending===0&&s.decodes===0,'Resources retained: '+JSON.stringify(s));return s;};
  const api=WitnessKit.create(T,renderer);
  const pixels=[];
  for(const quality of ['raw','full','lite']){
   const scope=api.createScope(scene),mounted=await scope.mount('./assets/environment-kit/cae/manifest-v2.json',{quality});
   const mesh=mounted.models[0].mesh,material=mesh.material;
   verify(mesh instanceof T.InstancedMesh,'Duplicated Three core');
   verify(material.map.colorSpace===T.SRGBColorSpace,'Albedo is not sRGB');
   verify(material.normalMap.colorSpace!==T.SRGBColorSpace&&material.roughnessMap.colorSpace!==T.SRGBColorSpace,'Data texture incorrectly marked sRGB');
   if(quality==='full')verify(material.map.isCompressedTexture&&material.normalMap.isCompressedTexture,'KTX2 did not transcode to GPU texture');
   verify(material.metalness===0,'Limestone became metallic');
   const target=new T.WebGLRenderTarget(320,256);renderer.setRenderTarget(target);renderer.render(scene,camera);
   const data=new Uint8Array(320*256*4);renderer.readRenderTargetPixels(target,0,0,320,256,data);pixels.push(Array.from(data));
   renderer.setRenderTarget(null);target.dispose();
   results.push({quality,compressed:!!material.map.isCompressedTexture,textureWidth:material.map.image.width,mips:material.map.mipmaps.length,footprints:mounted.solids.length});
   scope.close();await idle(api);
  }
  let mse=0;for(let i=0;i<pixels[0].length;i++)if(i%4!==3)mse+=(pixels[0][i]-pixels[1][i])**2;
  const rmse=Math.sqrt(mse/(pixels[0].length*.75));verify(rmse<13,'Compressed image diverges excessively: '+rmse);
  results.push({name:'raw versus KTX2 render comparison',rmseByteRGB:rmse});
  const lease=await api.acquire(variants.full.url,{sha256:variants.full.sha256});
  const transformed=api.instances(lease.asset,[{position:[10,0,20],yaw:Math.PI/2,scale:[2,1,1]}]);
  verify(Math.abs(transformed.solids[0][0]-10)<.001&&Math.abs(transformed.solids[0][1]-23)<.001&&Math.abs(transformed.solids[0][2]-1.1)<.001,'Compression changed footprint coordinate space');
  transformed.dispose();lease.release();await idle(api);
  results.push({name:'compressed geometry retains authored collision space',passed:true});
  // Shared request: cancelling one waiter must preserve another consumer's load.
  const controller=new AbortController();
  const first=api.acquire(variants.full.url,{signal:controller.signal}).then(()=> 'unexpected',e=>e.name);
  const second=api.acquire(variants.full.url);controller.abort();const other=await second;
  verify(await first==='AbortError','Cancelled waiter resolved');verify(other.asset.scene,'Other subscriber was cancelled');other.release();await idle(api);
  results.push({name:'independent abort of shared request',passed:true});
  // A scene closes after a complete GPU-decodable asset is parsed, before mounting.
  let enter,unblock;const entered=new Promise(r=>enter=r),gate=new Promise(r=>unblock=r);
  const late=WitnessKit.create(T,renderer,{processAsset:async()=>{enter();await gate;}});
  const destination=new T.Scene(),scope=late.createScope(destination);
  const pending=scope.mount('./assets/environment-kit/cae/manifest-v2.json').then(()=> 'unexpected',e=>e.name);
  await entered;scope.close();unblock();verify(await pending==='AbortError','Disposed scene mounted a late asset');await idle(late);verify(destination.children.length===0,'Stale scene contains a model');await late.dispose();
  results.push({name:'scene-close during decode/postprocess leaves no late attachment or resources',passed:true});
  let failOnce=true;
  const retry=WitnessKit.create(T,renderer,{fetch:async(url,opts)=>{if(failOnce&&String(url).endsWith('.glb')){failOnce=false;return new Response('retry',{status:503});}return fetch(url,opts);}});
  verify(await retry.acquire(variants.lite.url).then(()=>false,()=>true),'503 was accepted');
  const retried=await retry.acquire(variants.lite.url);retried.release();await idle(retry);await retry.dispose();
  results.push({name:'failed load evicted and retried successfully',passed:true});
  verify(await api.acquire(variants.full.url,{sha256:'0'.repeat(64)}).then(()=>false,e=>e.message.includes('integrity')),'Corrupt hash accepted');await idle(api);
  const invalid=WitnessKit.create(T,renderer,{fetch:async()=>new Response(new Uint8Array(12))});
  verify(await invalid.acquire('./invalid.glb').then(()=>false,e=>e.message.includes('Invalid GLB')),'Invalid GLB accepted');await idle(invalid);await invalid.dispose();
  results.push({name:'integrity mismatch and truncated GLB rejected without GPU resources',passed:true});
  const partial=WitnessKit.create(T,renderer,{fetch:async(url,opts)=>String(url).endsWith('broken-pack.json')?new Response(JSON.stringify({schemaVersion:2,pieces:[{variants:{full:variants.full}},{variants:{full:{url:'./assets/environment-kit/missing.glb'}}}]})):fetch(url,opts)});
  verify(await partial.loadPack('./broken-pack.json').then(()=>false,()=>true),'Partial broken pack accepted');await idle(partial);await partial.dispose();
  results.push({name:'partial pack failure releases successful sibling assets',passed:true});
  const a=api.createScope(scene),c=api.createScope(scene);
  const [ma,mc]=await Promise.all([a.mount('./assets/environment-kit/cae/manifest-v2.json'),c.mount('./assets/environment-kit/cae/manifest-v2.json')]);
  const shared=ma.models[0].mesh.geometry;let prematurelyDisposed=false;shared.addEventListener('dispose',()=>prematurelyDisposed=true);
  verify(shared===mc.models[0].mesh.geometry,'Identical requests did not share a geometry');
  a.close();verify(!prematurelyDisposed,'Closing one scene disposed resources of another');renderer.render(scene,camera);c.close();verify(prematurelyDisposed,'Final scene did not dispose its geometry');await idle(api);
  const multiLease=await api.acquire(variants.lite.url),copy=multiLease.asset.scene.clone(true);copy.add(copy.children[0].clone(true));
  const multi=api.instances({scene:copy},[{position:[0,0,0]}]);scene.add(multi.mesh);multi.dispose();verify(!multi.mesh.parent,'Multi-mesh root remained in disposed scene');multiLease.release();await idle(api);
  results.push({name:'shared live scenes retain resources until last owner; multi-mesh roots detach',passed:true});
  const memory=[];
  for(let i=0;i<24;i++){
   const s=api.createScope(scene);await s.mount('./assets/environment-kit/cae/manifest-v2.json',{quality:i%2?'full':'lite'});
   renderer.render(scene,camera);s.close();await idle(api);renderer.render(scene,camera);
   memory.push({...renderer.info.memory,programs:renderer.info.programs.length});
  }
  const stable=memory.slice(4);verify(new Set(stable.map(m=>m.geometries)).size===1&&new Set(stable.map(m=>m.textures)).size===1,'GPU resource counters grow across scene changes');
  results.push({name:'24 full/lite scene changes return to stable GPU baseline',memory});
  verify(renderer.getContext().getError()===0,'WebGL error after lifecycle test');
  await api.dispose();return results;
 }).toString()})()`);
 report.checks.push(...results);
 // Warm the actual generated service worker, then reload with all HTTP offline.
 await b.evaluate('globalThis.__navigationBarrier=true');await b.send('Page.reload',{ignoreCache:false});await b.wait('!globalThis.__navigationBarrier&&!!globalThis.KitLab?.ready',45000);
 await b.evaluate(`(async()=>{await navigator.serviceWorker.register('./witness-sw.js');await navigator.serviceWorker.ready;})()`);
 await b.wait('!!navigator.serviceWorker.controller',45000);
 await b.evaluate('globalThis.__navigationBarrier=true');await b.send('Page.reload',{ignoreCache:false});await b.wait('!globalThis.__navigationBarrier&&!!globalThis.KitLab?.ready',45000);
 await b.wait(`(async()=>{const c=await caches.open('witness-kit-r187-v2');return (await c.keys()).some(r=>r.url.endsWith('basis_transcoder.wasm'))})()`,12000);
 const cached=await b.evaluate(`(async()=>{const c=await caches.open('witness-kit-r187-v2');return (await c.keys()).map(r=>r.url)})()`);
 assert(cached.some(k=>k.endsWith('basis_transcoder.wasm')),JSON.stringify(cached));assert(cached.some(k=>k.includes('wall-pbr-full-')));
 await b.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 await b.evaluate('globalThis.__navigationBarrier=true');await b.send('Page.reload',{ignoreCache:false});await b.wait('!globalThis.__navigationBarrier&&!!globalThis.KitLab?.ready',45000);await b.shot('web-runtime-cache-offline.png');
 report.checks.push({name:'real service worker cold dependencies cached and rendered on offline reload',cached});
 await b.send('Network.setBlockedURLs',{urls:['http://*','https://*']});
 const file=path.resolve(process.env.WITNESS_KIT_OFFLINE_FILE??'dist/kit-lab-offline.html');
 await b.evaluate('globalThis.__navigationBarrier=true');await b.send('Page.navigate',{url:pathToFileURL(file).href});await b.wait('!globalThis.__navigationBarrier&&!!globalThis.KitLab?.ready',45000);
 const offline=await b.evaluate('({quality:KitLab.quality,compressed:!!KitLab.model.models[0].mesh.material.map.isCompressedTexture,http:performance.getEntriesByType("resource").filter(x=>/^https?:/.test(x.name)).map(x=>x.name)})');
 assert.equal(offline.quality,'full');assert.equal(offline.compressed,true);assert.deepEqual(offline.http,[]);await b.shot('ktx2-file-offline.png');
 report.checks.push({name:'cold standalone KTX2 + Meshopt + WASM without network',...offline});
 assert.deepEqual(b.errors,[]);report.status='passed';fs.writeFileSync(path.join(out,'lifecycle.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({status:'passed',checks:report.checks.map(x=>x.name??x.quality)}));
}catch(error){report.error=error.stack;report.errors=b.errors;fs.writeFileSync(path.join(out,'lifecycle-failure.json'),JSON.stringify(report,null,2));await b.shot('failure.png');throw error;}finally{b.close();}
