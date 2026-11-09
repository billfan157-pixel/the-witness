(function(root){
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const signature=s=>{const c=clone(s);c.lastSaved=null;return JSON.stringify(c);};
  const uuid=()=>root.crypto.randomUUID();
  async function hash(value){const data=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');}
  function create(options={}){
    const M=options.model||root.WitnessModel,raw=options.storage||root.localStorage,session=options.sessionStorage||root.sessionStorage;
    const fetcher=options.fetch||root.fetch?.bind(root),callback=options.onStatus||(()=>{}),apply=options.onState||(()=>{});
    const get=key=>{try{return raw.getItem(key);}catch{return null;}};
    const read=key=>{try{return JSON.parse(get(key));}catch{return null;}};
    let storageFailed=false;
    const put=(key,value)=>{try{raw.setItem(key,JSON.stringify(value));return true;}catch{storageFailed=true;return false;}};
    const remove=key=>{try{raw.removeItem(key);}catch{storageFailed=true;}};
    let clientId;try{clientId=session.getItem('witness.cloud.device');if(!clientId){clientId=uuid();session.setItem('witness.cloud.device',clientId);}}catch{clientId=uuid();}
    let user=null,verified=false,ready=false,slot=1,revision=0,pending=null,request=null,conflict=null,timer=null,reconnectTimer=null,busy=null,scopeEpoch=0,latest=null,lastSynced=null,appliedNamespace=null;
    let status={mode:'checking',message:'Đang kiểm tra bản lưu…'},remote=null;
    const namespace=()=>user?M.STORE+'.account.'+encodeURIComponent(user.id)+'.'+slot:M.STORE;
    const metaKey=()=>namespace()+'.cloud-meta',outboxKey=()=>namespace()+'.outbox.'+clientId;
    const local={getItem:key=>get(user?namespace()+key.slice(M.STORE.length):key),
      setItem(key,value){raw.setItem(user?namespace()+key.slice(M.STORE.length):key,value);},
      removeItem:key=>raw.removeItem(user?namespace()+key.slice(M.STORE.length):key)};
    function emit(mode,message){status={mode,message,user,slot,revision,conflict:!!conflict,pending:!!(pending||request),storageFailed,verified,ready};callback({...status});return status;}
    function persist(){if(!user)return;if(pending||request)put(outboxKey(),{owner:user.id,slot,baseRevision:revision,pending,request,updatedAt:new Date().toISOString()});else remove(outboxKey());}
    function schedule(ms=1800){clearTimeout(timer);if(user&&verified&&!conflict&&(pending||request))timer=setTimeout(()=>flush(),ms);}
    async function api(path,init={}){
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
      try{const response=await fetcher(path,{...init,credentials:'same-origin',cache:'no-store',signal:controller.signal,
        headers:{...(user?{'x-witness-account':user.id}:{}),...(init.body?{'content-type':'application/json','x-witness-client':'1'}:{}),...init.headers}});
        const data=await response.json();if(!response.ok){const error=new Error(data.error?.message||'Chưa kết nối được dịch vụ lưu.');Object.assign(error,{status:response.status,code:data.error?.code,data});throw error;}return data;
      }finally{clearTimeout(timeout);}
    }
    async function remember(save){
      revision=save?.revision||0;lastSynced=save?.state?await hash(signature(M.restore(save.state))):null;
      put(metaKey(),{revision,lastSynced});
    }
    function pendingCopies(){
      const prefix=namespace()+'.outbox.',copies=[];
      try{for(let i=0;i<raw.length;i++){const key=raw.key(i);if(key?.startsWith(prefix)){const entry=read(key);if(entry?.owner===user?.id&&(entry.pending||entry.request))copies.push({key,...entry});}}}catch{}
      return copies.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
    }
    function loadLocal(){
      const previous=latest,previousNamespace=appliedNamespace;
      const meta=read(metaKey());revision=meta?.revision||0;lastSynced=meta?.lastSynced||null;
      const out=read(outboxKey());request=out?.request||null;pending=out?.pending||null;
      if(request||pending)revision=out.baseRevision||0;
      const loaded=M.load(local).state;
      latest=pending||(request?.state)||loaded;
      if(latest)latest=M.restore(latest);
      appliedNamespace=namespace();
      if(previousNamespace!==appliedNamespace||(!previous)!==(!latest)||previous&&latest&&signature(previous)!==signature(latest))apply(latest?clone(latest):null,{scopeChanged:true,slot,user});
    }
    function saveLocal(snapshot){
      if(snapshot){const result=M.save(snapshot,local);if(!result.persisted)storageFailed=true;}
      else {local.removeItem(M.STORE);local.removeItem(M.BACKUP);}
      latest=snapshot?clone(snapshot):null;
    }
    async function adopt(save){
      const next=save?.deleted?null:save?.state||null,changed=(!latest)!==(!next)||latest&&next&&signature(M.restore(latest))!==signature(M.restore(next));
      saveLocal(next);await remember(save);pending=null;request=null;conflict=null;persist();
      if(changed)apply(latest?clone(latest):null,{downloaded:true,slot,user});
      emit('synced',save&&!save.deleted?'Đã lưu đám mây · ô '+slot:'Ô '+slot+' chưa có hành trình');
    }
    async function reconcile(){
      const epoch=scopeEpoch,{save}=await api('/api/saves/'+slot);if(epoch!==scopeEpoch)return;
      remote=save;
      const copies=pendingCopies().filter(c=>c.key!==outboxKey());
      if(copies.length&&!latest){pending=clone(copies[0].pending||copies[0].request?.state);latest=clone(pending);saveLocal(latest);apply(clone(latest),{scopeChanged:true,slot,user});revision=copies[0].baseRevision||0;persist();}
      if(request){await flush();return;}
      if(!latest){await adopt(save);return;}
      const localHash=await hash(signature(M.restore(latest)));
      const remoteHash=save?.state?await hash(signature(M.restore(save.state))):null;
      if(localHash===remoteHash){pending=null;await adopt(save);return;}
      if(!pending&&lastSynced&&localHash===lastSynced){await adopt(save);return;}
      if((save?.revision||0)===revision){pending=clone(latest);persist();await flush();return;}
      conflict={remote:save,local:clone(latest)};emit('conflict','Có hai bản tiến trình · chọn bản cần dùng');
    }
    async function init(){
      if(busy)await busy;
      clearTimeout(timer);clearTimeout(reconnectTimer);scopeEpoch++;ready=false;verified=false;
      try{
        if(!fetcher||root.location?.protocol==='file:'){user=null;loadLocal();ready=true;return emit('guest','Đã lưu trên máy · bản ngoại tuyến');}
        const info=await api('/api/session');
        user=info.authenticated?info.user:null;verified=true;put('witness.cloud.last-user',user);
        slot=user?(read(M.STORE+'.active-slot.'+encodeURIComponent(user.id))||1):1;
        if(![1,2,3].includes(slot))slot=1;
        loadLocal();ready=true;
        if(!user)return emit('guest','Chơi khách · tiến trình lưu trên máy');
        emit('checking','Đang đối chiếu bản lưu đám mây…');await reconcile();return status;
      }catch(error){
        console.warn(JSON.stringify({event:'cloud_connection_failed',type:error.name,code:error.code||'CONNECTION_ERROR'}));
        if(!ready){user=read('witness.cloud.last-user');slot=user?(read(M.STORE+'.active-slot.'+encodeURIComponent(user.id))||1):1;if(![1,2,3].includes(slot))slot=1;loadLocal();ready=true;}
        emit('offline',error.status===401?'Cần đăng nhập lại · bản trên máy được giữ':'Đã giữ trên máy · sẽ đồng bộ khi có mạng');
        reconnectTimer=setTimeout(()=>refresh(),15000);return status;
      }
    }
    function capture(snapshot){
      const restored=M.restore(snapshot),unchanged=latest&&signature(latest)===signature(restored);
      latest=restored;
      if(unchanged)return;
      if(!user){emit('guest','Đã lưu trên máy · đăng nhập để lưu đám mây');return;}
      if(pending&&signature(pending)===signature(latest))return;
      pending=clone(latest);persist();
      if(conflict){conflict.local=clone(latest);emit('conflict','Có hai bản tiến trình · chọn bản cần dùng');return;}
      emit('pending',verified?'Đã lưu trên máy · chờ đồng bộ':'Đã giữ trên máy · đang ngoại tuyến');schedule();
    }
    async function flush({keepalive=false}={}){
      clearTimeout(timer);
      if(busy)return busy;
      if(!user||!verified||conflict||(!pending&&!request))return status;
      const epoch=scopeEpoch,activeSlot=slot,owner=user.id;
      busy=(async()=>{
        try{
          if(!request){request={baseRevision:revision,clientId,mutationId:uuid(),state:clone(pending)};persist();}
          const sent=clone(request);emit('saving','Đang lưu lên đám mây…');
          // keepalive is best effort only; the durable outbox remains until an acknowledgement arrives.
          const encoded=JSON.stringify(sent),result=await api('/api/saves/'+activeSlot,{method:'PUT',body:encoded,keepalive:keepalive&&new TextEncoder().encode(encoded).length<60000});
          if(epoch!==scopeEpoch||user?.id!==owner)return;
          await remember(result.save);
          if(pending&&signature(pending)===signature(sent.state))pending=null;
          request=null;persist();
          emit(pending?'pending':'synced',pending?'Đã giữ thay đổi mới · chờ đồng bộ':'Đã lưu đám mây · ô '+slot);
          if(pending)schedule(100);
        }catch(error){
          if(epoch!==scopeEpoch)return;
          if(error.status===409){conflict={remote:error.data?.error?.remote||null,local:clone(pending||request.state)};emit('conflict','Có hai bản tiến trình · chọn bản cần dùng');}
          else if(error.status===401){verified=false;emit('offline','Phiên đăng nhập đã hết · bản trên máy được giữ');}
          else if(error.status===422||error.status===413){emit('error',error.message);}
          else {emit('offline','Đã giữ trên máy · sẽ thử đồng bộ lại');schedule(error.status===429?61000:15000);}
        }finally{busy=null;}
        return status;
      })();return busy;
    }
    async function refresh(){
      if(!verified)return init();
      try{const session=await api('/api/session');if((session.user?.id||null)!==(user?.id||null))return init();}catch{emit('offline','Đã giữ trên máy · sẽ đồng bộ khi có mạng');return status;}
      await flush();if(busy)await busy;
      if(user)try{await reconcile();}catch(error){emit('offline',error.message);}return status;
    }
    async function chooseRemote(){if(busy)await busy;const {save}=await api('/api/saves/'+slot);await adopt(save);}
    async function chooseLocal(snapshot=latest){
      if(!snapshot)throw Error('Chưa có bản trên máy.');if(busy)await busy;
      const {save}=await api('/api/saves/'+slot);revision=save?.revision||0;request=null;pending=M.restore(snapshot);conflict=null;
      const changed=!latest||signature(latest)!==signature(pending);saveLocal(pending);persist();
      if(changed)apply(clone(pending),{downloaded:true,slot,user});await flush();return status;
    }
    async function switchSlot(next){
      if(!user||![1,2,3].includes(next))throw Error('Ô lưu không hợp lệ.');await flush();if(busy)await busy;
      scopeEpoch++;slot=next;put(M.STORE+'.active-slot.'+encodeURIComponent(user.id),slot);conflict=null;pending=null;request=null;remote=null;loadLocal();await reconcile();return status;
    }
    async function removeSlot(){
      if(busy)await busy;const {save}=await api('/api/saves/'+slot);
      const result=await api('/api/saves/'+slot,{method:'DELETE',body:JSON.stringify({baseRevision:save?.revision||0,clientId,mutationId:uuid()})});await adopt(result.save);
    }
    async function importGuest(){const saved=M.load(raw).state;if(!saved)throw Error('Chưa có bản chơi khách trên máy này.');return chooseLocal(saved);}
    async function erase(){
      if(busy)await busy;clearTimeout(timer);await api('/api/account',{method:'DELETE',body:JSON.stringify({confirm:'XOA'})});scopeEpoch++;
      const prefix=M.STORE+'.account.'+encodeURIComponent(user.id)+'.';
      const keys=[];try{for(let i=0;i<raw.length;i++)if(raw.key(i)?.startsWith(prefix))keys.push(raw.key(i));}catch{}
      keys.forEach(remove);revision=0;pending=request=conflict=latest=null;apply(null,{downloaded:true,user,slot});emit('synced','Đã xóa dữ liệu đám mây của bạn');
    }
    function dispose(){clearTimeout(timer);clearTimeout(reconnectTimer);scopeEpoch++;}
    return {init,capture,flush,refresh,chooseRemote,chooseLocal,switchSlot,removeSlot,importGuest,erase,dispose,storage:local,api,
      info:()=>({...status,user,slot,revision,conflict:!!conflict,ready,verified,pending:!!(pending||request),storageFailed}),
      localState:()=>latest?clone(latest):null,copies:()=>pendingCopies(),guest:()=>M.load(raw).state,
      async signOut(){await flush();remove('witness.cloud.last-user');},
    };
  }
  root.WitnessCloud={create};if(typeof module!=='undefined')module.exports=root.WitnessCloud;
})(globalThis);
