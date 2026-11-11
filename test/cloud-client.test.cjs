const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../witness-model.js'),{create}=require('../witness-cloud.js');
function memory(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),get length(){return map.size;},key:i=>[...map.keys()][i]};}
function service(){
  const slots=new Map(),mutations=new Map();let offline=false,loseAck=false,held=null,user='account-one';
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
  const fetch=async(path,init={})=>{
    if(offline)throw Error('offline');
    if(path==='/api/session')return reply({authenticated:!!user,user:user?{id:user}:null});
    if(init.headers['x-witness-account']!==user)return reply({error:{code:'ACCOUNT_CHANGED',message:'account changed'}},401);
    const slot=Number(path.split('/')[3]),key=user+':'+slot;
    if(init.method!=='PUT')return reply({save:slots.get(key)||null});
    const input=JSON.parse(init.body);
    if(held){const hold=held;held=null;await hold;}
    if(mutations.has(input.mutationId))return reply({save:mutations.get(input.mutationId),replayed:true});
    const old=slots.get(key);if((old?.revision||0)!==input.baseRevision)return reply({error:{code:'SAVE_CONFLICT',message:'conflict',remote:old}},409);
    const save={slot,revision:input.baseRevision+1,state:M.restore(input.state),clientId:input.clientId,updatedAt:new Date().toISOString()};slots.set(key,save);mutations.set(input.mutationId,save);
    if(loseAck){loseAck=false;throw Error('ack lost');}return reply({save});
  };
  return {fetch,slots,setOffline:v=>offline=v,loseAck:()=>loseAck=true,hold:p=>held=p,setUser:v=>user=v};
}
const fresh=name=>M.fresh({name});
test('guest progress is separate from authenticated account and explicit import is possible',async()=>{
  const storage=memory(),server=service();M.save(fresh('Guest'),storage);const c=create({model:M,storage,sessionStorage:memory(),fetch:server.fetch});
  try{await c.init();assert.equal(c.localState(),null);assert.equal(c.guest().profile.name,'Guest');await c.importGuest();assert.equal(c.info().mode,'synced');assert.equal(server.slots.get('account-one:1').state.profile.name,'Guest');}finally{c.dispose();}
});
test('lost acknowledgement is retried with the same mutation after a reload',async()=>{
  const storage=memory(),session=memory(),server=service();let c=create({model:M,storage,sessionStorage:session,fetch:server.fetch});
  try{await c.init();c.capture(fresh('Checkpoint'));server.loseAck();await c.flush();assert.equal(c.info().pending,true);assert.equal(server.slots.get('account-one:1').revision,1);c.dispose();
    c=create({model:M,storage,sessionStorage:session,fetch:server.fetch});await c.init();assert.equal(c.info().pending,false);assert.equal(c.info().revision,1);assert.equal(server.slots.get('account-one:1').revision,1);
  }finally{c.dispose();}
});
test('changes made during an in-flight save are sent in a second revision',async()=>{
  const server=service(),c=create({model:M,storage:memory(),sessionStorage:memory(),fetch:server.fetch});
  try{await c.init();c.capture(fresh('Before'));let release;server.hold(new Promise(r=>release=r));const sending=c.flush();await new Promise(r=>setImmediate(r));c.capture(fresh('After'));release();await sending;await c.flush();assert.equal(server.slots.get('account-one:1').state.profile.name,'After');assert.equal(c.info().revision,2);}finally{c.dispose();}
});
test('offline outbox resumes and does not upload a save twice while stationary',async()=>{
  const server=service(),c=create({model:M,storage:memory(),sessionStorage:memory(),fetch:server.fetch});
  try{await c.init();server.setOffline(true);const s=fresh('Offline');c.capture(s);await c.flush();assert.equal(c.info().pending,true);server.setOffline(false);await c.refresh();assert.equal(c.info().mode,'synced');s.lastSaved=new Date().toISOString();c.capture(s);await c.flush();assert.equal(server.slots.get('account-one:1').revision,1);}finally{c.dispose();}
});
test('two devices conflict safely and a chosen local snapshot creates a new revision',async()=>{
  const server=service(),a=create({model:M,storage:memory(),sessionStorage:memory(),fetch:server.fetch}),b=create({model:M,storage:memory(),sessionStorage:memory(),fetch:server.fetch});
  try{await a.init();await b.init();a.capture(fresh('A'));b.capture(fresh('B'));await a.flush();await b.flush();assert.equal(b.info().mode,'conflict');assert.equal(b.localState().profile.name,'B');assert.equal(server.slots.get('account-one:1').state.profile.name,'A');await b.chooseLocal();assert.equal(server.slots.get('account-one:1').revision,2);assert.equal(server.slots.get('account-one:1').state.profile.name,'B');await a.refresh();assert.equal(a.localState().profile.name,'B');}finally{a.dispose();b.dispose();}
});
test('same-browser tabs retain separate pending copies instead of replacing each other',async()=>{
  const server=service(),storage=memory(),a=create({model:M,storage,sessionStorage:memory(),fetch:server.fetch}),b=create({model:M,storage,sessionStorage:memory(),fetch:server.fetch});
  try{await a.init();await b.init();server.setOffline(true);a.capture(fresh('Tab A'));b.capture(fresh('Tab B'));assert.equal(a.copies().length,2);assert.deepEqual(a.copies().map(x=>x.pending.profile.name).sort(),['Tab A','Tab B']);}finally{a.dispose();b.dispose();}
});
test('switching accounts loads only that account; switching slots preserves other saves',async()=>{
  const server=service(),storage=memory(),c=create({model:M,storage,sessionStorage:memory(),fetch:server.fetch});
  try{await c.init();c.capture(fresh('Account A'));await c.flush();await c.switchSlot(2);assert.equal(c.localState(),null);c.capture(fresh('Slot 2'));await c.flush();await c.switchSlot(1);assert.equal(c.localState().profile.name,'Account A');server.setUser('account-two');await c.init();assert.equal(c.localState(),null);c.capture(fresh('Account B'));await c.flush();server.setUser('account-one');await c.init();assert.equal(c.localState().profile.name,'Account A');}finally{c.dispose();}
});
test('a pending tab retains its original base revision after another tab updates shared metadata',async()=>{
  const server=service(),storage=memory(),sessionA=memory(),sessionB=memory();
  const a=create({model:M,storage,sessionStorage:sessionA,fetch:server.fetch});let b=create({model:M,storage,sessionStorage:sessionB,fetch:server.fetch});
  try{await a.init();await b.init();b.capture(fresh('Pending B'));a.capture(fresh('Uploaded A'));await a.flush();b.dispose();b=create({model:M,storage,sessionStorage:sessionB,fetch:server.fetch});await b.init();assert.equal(b.info().mode,'conflict');assert.equal(server.slots.get('account-one:1').state.profile.name,'Uploaded A');assert.equal(b.localState().profile.name,'Pending B');}finally{a.dispose();b.dispose();}
});
test('account change in another tab cannot upload the prior player snapshot into the new account',async()=>{
  const server=service(),c=create({model:M,storage:memory(),sessionStorage:memory(),fetch:server.fetch});
  try{await c.init();c.capture(fresh('Belongs to A'));server.setUser('account-two');await c.flush();assert.equal(server.slots.size,0);assert.equal(c.info().verified,false);await c.refresh();assert.equal(c.info().user.id,'account-two');assert.equal(c.localState(),null);}finally{c.dispose();}
});
test('a clean focus refresh does not restart the active game scene',async()=>{
  const server=service();let applied=0;const c=create({model:M,storage:memory(),sessionStorage:memory(),fetch:server.fetch,onState:()=>applied++});
  try{await c.init();c.capture(fresh('Still Playing'));await c.flush();const previous=applied;await c.refresh();await c.refresh();assert.equal(applied,previous);}finally{c.dispose();}
});
test('a failed initial session check can recover without discarding guest progress',async()=>{
  const server=service(),storage=memory();M.save(fresh('Kept Guest'),storage);server.setUser(null);server.setOffline(true);let applied=0;
  const c=create({model:M,storage,sessionStorage:memory(),fetch:server.fetch,onState:()=>applied++});
  try{await c.init();assert.equal(c.info().mode,'offline');assert.equal(c.localState().profile.name,'Kept Guest');const previous=applied;server.setOffline(false);await c.refresh();assert.equal(c.info().mode,'guest');assert.equal(c.localState().profile.name,'Kept Guest');assert.equal(applied,previous);}finally{c.dispose();}
});
const SCENE_SEQ=[['disembark'],['stranger',{response:'follow'}],['ledgerSeam'],['fire'],['rescueRoute',{route:'mechanical'}],['rescueStep',{step:'cart'}],['rescueStep',{step:'pulley'}],['rescueStep',{step:'exit'}],['rescueStep',{step:'extract'}],['rooftop'],['yosefPrivacy'],['recallT05'],['observeB06']];
function sceneState(name,seq){let s=M.beginQ01Scene(fresh(name));for(const [e,p] of (seq||SCENE_SEQ))s=M.q01SceneEvent(s,e,p);return s;}
test('Q01 v6 scene progress survives cloud sync and a reload without losing fields',async()=>{
  const storage=memory(),session=memory(),server=service(),s=sceneState('Scene');
  let c=create({model:M,storage,sessionStorage:session,fetch:server.fetch});
  try{await c.init();c.capture(s);await c.flush();assert.equal(c.info().mode,'synced');
    assert.deepEqual(server.slots.get('account-one:1').state.sceneProgress.Q01,s.sceneProgress.Q01);
    c.dispose();c=create({model:M,storage,sessionStorage:session,fetch:server.fetch});await c.init();
    assert.deepEqual(c.localState().sceneProgress.Q01,s.sceneProgress.Q01);
    assert.equal(c.localState().sceneProgress.Q01.world.cart,'chocked');
  }finally{c.dispose();}
});
test('Q01 v6 scene state survives offline outbox and a lost acknowledgement',async()=>{
  const storage=memory(),session=memory(),server=service(),s=sceneState('Outbox',SCENE_SEQ.slice(0,2));
  let c=create({model:M,storage,sessionStorage:session,fetch:server.fetch});
  try{await c.init();server.setOffline(true);c.capture(s);await c.flush();assert.equal(c.info().pending,true);
    server.setOffline(false);server.loseAck();await c.flush();assert.equal(c.info().pending,true);
    assert.equal(server.slots.get('account-one:1').revision,1);
    assert.deepEqual(server.slots.get('account-one:1').state.sceneProgress.Q01,s.sceneProgress.Q01);
    c.dispose();c=create({model:M,storage,sessionStorage:session,fetch:server.fetch});await c.init();
    assert.equal(c.info().pending,false);assert.equal(c.info().revision,1);
    assert.deepEqual(c.localState().sceneProgress.Q01,s.sceneProgress.Q01);
  }finally{c.dispose();}
});
test('Q01 v6 scene state survives a CAS conflict and chooseLocal',async()=>{
  const server=service(),a=create({model:M,storage:memory(),sessionStorage:memory(),fetch:server.fetch}),b=create({model:M,storage:memory(),sessionStorage:memory(),fetch:server.fetch});
  try{await a.init();await b.init();
    const sa=sceneState('A',SCENE_SEQ.slice(0,1)),sb=sceneState('B',SCENE_SEQ.slice(0,2));
    a.capture(sa);b.capture(sb);await a.flush();await b.flush();
    assert.equal(b.info().mode,'conflict');assert.deepEqual(b.localState().sceneProgress.Q01,sb.sceneProgress.Q01);
    await b.chooseLocal();const remote=server.slots.get('account-one:1').state;
    assert.deepEqual(remote.sceneProgress.Q01,sb.sceneProgress.Q01);
    assert.equal(remote.sceneProgress.Q01.beat,2);assert.equal(remote.sceneProgress.Q01.strangerResponse,'follow');
  }finally{a.dispose();b.dispose();}
});
