const assert=require('node:assert/strict'),vm=require('node:vm');
const worker=require('../tools/service-worker-template.cjs');
(async()=>{
 const handlers={},stores=new Map(),calls=[],warnings=[];let offline=false,quota=false,code=200;
 const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {
  async addAll(names){for(const n of names)data.set(new URL(n,'https://test.invalid/').href,new Response('shell'));},
  async match(req){return data.get(typeof req==='string'?new URL(req,'https://test.invalid/').href:req.url)?.clone();},
  async put(req,res){if(quota)throw new DOMException('Full','QuotaExceededError');data.set(req.url,res.clone());}
 };},async keys(){return [...stores.keys()]},async delete(name){return stores.delete(name)}};
 const context={URL,Response,DOMException,location:{origin:'https://test.invalid'},caches,console:{warn:(...a)=>warnings.push(a)},fetch:async req=>{calls.push(req.url);if(offline)throw Error('Offline');return new Response('pack-'+calls.length,{status:code})},self:{addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}}};
 vm.runInNewContext(worker({revision:'test',files:['./index.html']}),context);
 async function fetchEvent(url,method='GET'){
  const pending=[];let response,dispatching=true;handlers.fetch({request:new Request(url,{method}),waitUntil:p=>{assert(dispatching,'waitUntil called after fetch dispatch without an initial lifetime extension');pending.push(p);},respondWith:p=>response=p});dispatching=false;
  if(!response)return null;const result=await response;await Promise.all(pending);return result;
 }
 let install;handlers.install({waitUntil:p=>install=p});await install;
 const asset='https://test.invalid/assets/environment-kit/cae/hash-full.glb';
 assert.equal(await(await fetchEvent(asset)).text(),'pack-1');offline=true;assert.equal(await(await fetchEvent(asset)).text(),'pack-1');assert.equal(calls.length,1);
 offline=false;const manifest='https://test.invalid/assets/environment-kit/cae/manifest-v2.json';await fetchEvent(manifest);await fetchEvent(manifest);assert.equal(calls.length,3);
 offline=true;assert.equal(await(await fetchEvent(manifest)).text(),'pack-3');
 offline=false;quota=true;assert.equal((await fetchEvent(asset+'?uncached=1')).status,200);assert.equal(warnings.length,1);quota=false;
 code=503;assert.equal((await fetchEvent(asset+'?bad=1')).status,503);code=200;assert.equal((await fetchEvent(asset+'?bad=1')).status,200);
 const before=calls.length;assert.equal(await fetchEvent('https://external.invalid/file'),null);assert.equal(await fetchEvent(asset,'POST'),null);assert.equal(calls.length,before);
 assert.equal((await fetchEvent('https://test.invalid/index.html')).status,200);
 console.log(JSON.stringify({status:'passed',checks:['runtime cache warms on successful response','cached immutable pack survives offline','manifest refreshes online and falls back offline','quota failure keeps fetched response playable','failed responses do not poison cache','cache keys preserve query distinctions','foreign origin and POST ignored','app shell survives offline']}));
})().catch(e=>{console.error(e);process.exitCode=1});
