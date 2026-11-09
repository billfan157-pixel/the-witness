module.exports=function worker({revision,files}){
 return `const SHELL='witness-shell-${revision}',PACKS='witness-kit-r187-v2',FILES=${JSON.stringify(files)};
const isPack=url=>url.pathname.includes('/assets/environment-kit/')||url.pathname.includes('/vendor/basis/');
async function storePack(request,response){
 if(!response.ok)return;
 try{const cache=await caches.open(PACKS);await cache.put(request,response.clone());}
 catch(error){console.warn('Witness kit cache write failed:',error.name);}
}
self.addEventListener('install',event=>event.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('witness-')&&k!==SHELL&&k!==PACKS).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==location.origin)return;
 if(url.pathname.startsWith('/api/')||['/signin-with-chatgpt','/signout-with-chatgpt','/callback'].includes(url.pathname))return;
 if(isPack(url)){
  event.respondWith((async()=>{
   const cache=await caches.open(PACKS),cached=await cache.match(request);
   const manifest=/manifest[^/]*\\.json$/.test(url.pathname);
   if(cached&&!manifest)return cached;
   try{const response=await fetch(request);if(response.ok){await storePack(request,response);return response;}if(cached)return cached;return response;}
   catch(error){if(cached)return cached;throw error;}
  })());return;
 }
 event.respondWith(caches.open(SHELL).then(async cache=>(await cache.match(request,{ignoreSearch:true}))||fetch(request).catch(()=>request.mode==='navigate'?cache.match('./index.html'):Response.error())));
});`;
};
