// Runtime source, bundled with the exact r187 addons by build-kit.cjs.
export function createKit(T, renderer, {GLTFLoader,KTX2Loader,MeshoptDecoder}, options={}) {
 const entries=new Map(),resourceRefs=new Map(),scopes=new Set(),legacy=new Set(),decodes=new Set();
 const metrics={requests:0,parses:0,releases:0,aborts:0,disposedResources:0,cacheHits:0};
 let closed=false;
 const abortError=()=>new DOMException('Kit operation cancelled','AbortError');
 const check=signal=>{if(closed)throw Error('WitnessKit is disposed');if(signal?.aborted)throw abortError();};
 const keyOf=path=>new URL(path,location.href).href;
 function embedded(url){
  const key=String(url).replace(/\\/g,'/').match(/(?:^|\/)((?:assets\/environment-kit|vendor\/basis)\/[^?#]*)/)?.[1];
  return globalThis.WitnessKitAssets?.[key];
 }
 const manager=new T.LoadingManager();manager.setURLModifier(url=>embedded(url)??url);
 const ktx=renderer?new KTX2Loader(manager).setTranscoderPath('./vendor/basis/').setWorkerLimit(2).detectSupport(renderer):null;
 function decoder(){const loader=new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);if(ktx)loader.setKTX2Loader(ktx);return loader;}
 const fetcher=options.fetch??globalThis.fetch.bind(globalThis);
 async function bytes(path,{signal,sha256}={}){
  check(signal);metrics.requests++;
  const response=await fetcher(embedded(path)??path,{signal});
  if(!response.ok)throw Error(`Kit fetch failed (${response.status}): ${path}`);
  const buffer=await response.arrayBuffer();check(signal);
  if(sha256){const digest=await crypto.subtle.digest('SHA-256',buffer);const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
   if(hash!==sha256)throw Error('Kit integrity mismatch: '+path);}
  return buffer;
 }
 function resources(asset){
  const set=new Set();asset.scene.traverse(o=>{
   if(o.geometry)set.add(o.geometry);
   for(const material of [o.material].flat().filter(Boolean)){
    set.add(material);for(const value of Object.values(material))if(value?.isTexture){set.add(value);const images=[value.image].flat();for(const image of images)if(typeof image?.close==='function')set.add(image);}
   }
  });return set;
 }
 function hold(asset){for(const r of resources(asset))resourceRefs.set(r,(resourceRefs.get(r)??0)+1);}
 function drop(asset){for(const r of resources(asset)){const n=(resourceRefs.get(r)??1)-1;if(n>0)resourceRefs.set(r,n);else{resourceRefs.delete(r);if(r.dispose)r.dispose();else r.close?.();metrics.disposedResources++;}}}
 function collect(entry){
  if(entry.waiters||entry.refs)return;
  if(entries.get(entry.key)===entry)entries.delete(entry.key);
  if(entry.asset){drop(entry.asset);entry.asset=null;}
  else if(!entry.controller.signal.aborted){entry.controller.abort();metrics.aborts++;}
 }
 function entryFor(path,hash){
  const key=keyOf(path)+'#'+(hash??'');let entry=entries.get(key);
  if(entry){metrics.cacheHits++;return entry;}
  entry={key,refs:0,waiters:0,asset:null,controller:new AbortController()};entries.set(key,entry);
  entry.promise=(async()=>{
   const data=await bytes(path,{signal:entry.controller.signal,sha256:hash});
   const view=new DataView(data);if(data.byteLength<20||view.getUint32(0,true)!==0x46546c67)throw Error('Invalid GLB header');
   if(options.beforeParse)await options.beforeParse(path);
   check(entry.controller.signal);metrics.parses++;
   const loader=decoder();let parser;
   loader.register(value=>{parser=value;return {name:'WitnessKitResourceOwnership'};});
   let asset;
   try{asset=await loader.parseAsync(data,new URL('.',keyOf(path)).href);}
   catch(error){
    // Clean already-created dependencies after an incomplete glTF parse as well.
    const pending=[];
    for(const type of ['texture','material','mesh'])for(let i=0;i<(parser?.json[type==='mesh'?'meshes':type+'s']?.length??0);i++){
     const cached=parser.cache.get(type+':'+i);if(cached)pending.push(Promise.resolve(cached));
    }
    const values=await Promise.allSettled(pending),temp=new T.Group(),extra=[];
    for(const result of values)if(result.status==='fulfilled'){
     const value=result.value;if(value?.isObject3D)temp.add(value);else if(value?.isMaterial)extra.push(value);else if(value?.isTexture)extra.push(new T.MeshBasicMaterial({map:value}));
    }
    if(extra.length)temp.add(new T.Mesh(new T.BufferGeometry(),extra));
    const partial={scene:temp};hold(partial);drop(partial);throw error;
   }
   hold(asset);entry.asset=asset;
   if(options.processAsset)await options.processAsset(asset);
   if(closed||entry.controller.signal.aborted||(!entry.waiters&&!entry.refs)){collect(entry);throw abortError();}
   return asset;
  })().catch(error=>{if(entries.get(key)===entry)entries.delete(key);throw error;});
  // An aborted subscriber can leave a non-cancellable texture/mesh decode finishing later.
  decodes.add(entry.promise);entry.promise.then(()=>decodes.delete(entry.promise),()=>decodes.delete(entry.promise));
  entry.promise.catch(()=>{});return entry;
 }
 function acquire(path,{signal,sha256}={}){
  try{check(signal);}catch(error){return Promise.reject(error);}
  const entry=entryFor(path,sha256);entry.waiters++;
  return new Promise((resolve,reject)=>{
   let settled=false;
   function finish(){if(settled)return false;settled=true;entry.waiters--;signal?.removeEventListener('abort',cancel);return true;}
   function cancel(){if(!finish())return;collect(entry);reject(abortError());}
   signal?.addEventListener('abort',cancel,{once:true});
   entry.promise.then(asset=>{
    if(!finish())return;
    if(signal?.aborted||closed){collect(entry);reject(abortError());return;}
    entry.refs++;let released=false;
    resolve({asset,release(){if(released)return;released=true;entry.refs--;metrics.releases++;collect(entry);}});
   },error=>{if(finish()){collect(entry);reject(error);}});
  });
 }
 async function loadPack(path,{signal,quality=globalThis.WitnessKitOfflineQuality??'full'}={}){
  check(signal);const data=await bytes(path,{signal});let manifest;
  try{manifest=JSON.parse(new TextDecoder().decode(data));}catch{throw Error('Invalid kit manifest JSON');}
  if(![1,2].includes(manifest.schemaVersion)||!Array.isArray(manifest.pieces)||manifest.pieces.length>256)throw Error('Unsupported kit manifest');
  const jobs=manifest.pieces.map(piece=>{
   const variant=piece.variants?.[quality]??(piece.url?{url:piece.url}:null);
   if(!variant?.url)throw Error('Missing kit quality variant: '+quality);
   return variant;
  });
  const results=await Promise.allSettled(jobs.map(v=>acquire(v.url,{signal,sha256:v.sha256})));
  const leases=results.filter(r=>r.status==='fulfilled').map(r=>r.value),failure=results.find(r=>r.status==='rejected');
  if(failure||signal?.aborted||closed){leases.forEach(l=>l.release());throw failure?.reason??abortError();}
  let released=false;const pack={manifest,assets:leases.map(l=>l.asset),quality,
   release(){if(released)return;released=true;legacy.delete(pack);leases.forEach(l=>l.release());}};
  legacy.add(pack);return pack;
 }
 function instances(asset,transforms){
  const sources=[];asset.scene.updateMatrixWorld(true);asset.scene.traverse(o=>{if(o.isMesh)sources.push(o);});
  if(!sources.length)throw Error('Kit has no renderable mesh');
  const group=new T.Group(),solids=[],instanced=[];
  for(const source of sources){
   const mesh=new T.InstancedMesh(source.geometry,source.material,transforms.length);mesh.name=source.name;
   transforms.forEach((item,i)=>{
    const o=new T.Object3D();o.position.fromArray(item.position??[0,0,0]);o.rotation.y=item.yaw??0;o.scale.fromArray(item.scale??[1,1,1]);o.updateMatrix();
    const matrix=o.matrix.clone().multiply(source.matrixWorld);mesh.setMatrixAt(i,matrix);
    const footprints=asset.scene.userData.footprintSpace==='asset'?[]:source.userData.footprint??source.parent?.userData.footprint??[];
    for(const [x,z,r]of footprints){const p=new T.Vector3(x,0,z).applyMatrix4(matrix);
     const sx=new T.Vector3().setFromMatrixColumn(matrix,0).length(),sz=new T.Vector3().setFromMatrixColumn(matrix,2).length();
     solids.push([p.x,p.z,r*Math.max(sx,sz)]);}
   });
   mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);instanced.push(mesh);
  }
  if(asset.scene.userData.footprintSpace==='asset')for(const item of transforms){
   const o=new T.Object3D();o.position.fromArray(item.position??[0,0,0]);o.rotation.y=item.yaw??0;o.scale.fromArray(item.scale??[1,1,1]);o.updateMatrix();
   for(const [x,z,r]of asset.scene.userData.footprint??[]){const p=new T.Vector3(x,0,z).applyMatrix4(o.matrix);solids.push([p.x,p.z,r*Math.max(Math.abs(o.scale.x),Math.abs(o.scale.z))]);}
  }
  return {mesh:sources.length===1?instanced[0]:group,solids,dispose(){group.removeFromParent();for(const m of instanced){m.removeFromParent();m.dispose();}}};
 }
 function createScope(scene,{signal}={}){
  check(signal);const controller=new AbortController(),mounts=new Set();let ended=false;
  const scope={
   async mount(path,{quality=globalThis.WitnessKitOfflineQuality??'full',transforms}={}){
    if(ended)throw abortError();const pack=await loadPack(path,{signal:controller.signal,quality});
    if(ended){pack.release();throw abortError();}
    const models=[];
    try{for(let i=0;i<pack.assets.length;i++){
     const piece=pack.manifest.pieces[i],model=instances(pack.assets[i],transforms??piece.instances??[{position:piece.position??[0,0,0],yaw:piece.yaw??0,scale:piece.scale??[1,1,1]}]);
     models.push(model);scene.add(model.mesh);
    }}catch(error){models.forEach(m=>m.dispose());pack.release();throw error;}
    let released=false;const mounted={models,solids:models.flatMap(m=>m.solids),release(){if(released)return;released=true;models.forEach(m=>m.dispose());pack.release();mounts.delete(mounted);}};
    mounts.add(mounted);return mounted;
   },
   close(){if(ended)return;ended=true;controller.abort();for(const m of [...mounts])m.release();scopes.delete(scope);scene.userData.kitScopes?.delete(scope);signal?.removeEventListener('abort',scope.close);}
  };
  signal?.addEventListener('abort',scope.close,{once:true});scopes.add(scope);scene.userData.kitScopes??=new Set();scene.userData.kitScopes.add(scope);return scope;
 }
 async function load(path,opts){const lease=await acquire(path,opts);const owner={release(){legacy.delete(owner);lease.release();}};legacy.add(owner);return lease.asset;}
 function snapshot(){return {...metrics,entries:entries.size,resources:resourceRefs.size,leases:[...entries.values()].reduce((n,e)=>n+e.refs,0),pending:[...entries.values()].reduce((n,e)=>n+e.waiters,0),decodes:decodes.size,scopes:scopes.size,closed};}
 async function whenIdle(){while(decodes.size)await Promise.allSettled([...decodes]);}
 function dispose(){if(closed)return;closed=true;for(const s of [...scopes])s.close();for(const owner of [...legacy])owner.release();
  for(const e of entries.values()){e.controller.abort();if(e.asset){drop(e.asset);e.asset=null;}}entries.clear();return whenIdle().then(()=>ktx?.dispose());}
 return {load,loadPack,acquire,instances,createScope,snapshot,whenIdle,dispose};
}
