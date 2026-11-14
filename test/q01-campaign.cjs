'use strict';
const assert=require('node:assert/strict'),M=require('../witness-model.js'),I=require('../witness-q01-interaction.js'),G=require('../witness-q01-greybox.js'),X=require('../witness-depth.js');
require('../witness-q01-campaign.js');const Campaign=globalThis.WitnessQ01Campaign;
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
const clone=x=>structuredClone(x),position=(s,id)=>{s.spatialPositions['Q01.mortal']={schema:1,...I.at[id]};return s;};
const ctx={actors:{titus:I.at.titus}};
function opening(){let s=M.beginQ01Scene(M.fresh(),{campaign:true});s=M.q01SceneEvent(position(s,'disembark'),'disembark');s=M.q01SceneEvent(position(s,'alley'),'stranger',{response:'investigate'});const a=M.actions(s).find(a=>a.id==='brace');s=M.act(position(s,'load'),'brace',{puzzle:{work:X.guided(s,X.encounter(s,a))}});s=M.act(position(s,'ledger'),'ledger');s=M.q01SceneEvent(s,'ledgerSeam');return M.q01SceneEvent(position(s,'titus'),'fire',{},ctx);}
check('PR-05 activation is explicit; old/partially played saves retain their original route',()=>{
 assert.equal(M.fresh().sceneProgress.Q01,null);let s=M.fresh();s.quests.Q01.done=['brace'];assert.throws(()=>M.beginQ01Scene(s,{campaign:true}));
 assert.equal(M.beginQ01Scene(M.fresh(),{campaign:true}).flags.q01Campaign,true);
});
check('Physical bindings match PR-04 anchors exactly and never invent floor IDs',()=>{for(const [id,p]of Object.entries(I.at))assert.deepEqual(p,G.anchors[id],id);});
check('Natan can skirt his solid worktable, leave by the open front and reach the night bench',()=>{
 const ar=G.create(),from={x:-4,y:0,z:1,supportId:'world'},to={x:-2,y:0,z:6.45,supportId:'world'},route=ar.route(from,to);assert(route&&route.length);
 let p=from;for(const q of route){let frames=0;while(Math.hypot(q.x-p.x,q.z-p.z)>.06&&frames++<3000){const d=Math.hypot(q.x-p.x,q.z-p.z),step=Math.min(.045,d);p=ar.move(p,(q.x-p.x)/d*step,(q.z-p.z)/d*step);}assert(frames<3000,'Natan stuck');assert(!ar.collides(p));}assert(I.near(p,to,.15));
});
check('The night approach shares the bench side of the workshop wall; the old indoor approach is occluded',()=>{
 const ar=G.create(),s=M.beginQ01Scene(M.fresh(),{campaign:true}),target=Campaign.plan(s).targets.find(t=>t.id==='q01:rest');
 const p={x:target.at[0],y:0,z:target.at[1],supportId:'world'},head={x:-2,y:1.1,z:5.8};
 assert(!ar.collides(p));assert(I.near(p,I.at.rest,2.6));assert(ar.visible({...p,y:1.45},head));
 assert(!ar.visible({x:-2,y:1.45,z:3.2},head),'The real rear wall must reject the former interaction point');
});
check('The stranger rounds the open workshop front and east corner instead of walking through its wall',()=>{
 const ar=G.create(),route=ar.route(G.anchors.stranger,G.anchors.strangerGone);assert(route&&route.length);let p=G.anchors.stranger;
 for(const q of route){let frames=0;while(Math.hypot(q.x-p.x,q.z-p.z)>.05&&frames++<3000){const d=Math.hypot(q.x-p.x,q.z-p.z),step=Math.min(.04,d);p=ar.move(p,(q.x-p.x)/d*step,(q.z-p.z)/d*step);assert(!ar.collides(p));}assert(frames<3000);}assert(I.near(p,G.anchors.strangerGone,.15));
});
check('Remote/other-floor scene events and payload position forgeries cannot advance campaign Q01',()=>{
 let s=M.beginQ01Scene(M.fresh(),{campaign:true});assert.throws(()=>M.q01SceneEvent(s,'disembark',{position:I.at.disembark}));
 s=position(s,'disembark');s.spatialPositions['Q01.mortal'].y=5.04;s.spatialPositions['Q01.mortal'].supportId='q01-roof-main';assert.throws(()=>M.q01SceneEvent(s,'disembark'));
});
check('Quest actions use the same position authority; missing Titus cannot start a fire/rescue interaction',()=>{
 let s=M.beginQ01Scene(M.fresh(),{campaign:true});s=M.q01SceneEvent(position(s,'disembark'),'disembark');s=M.q01SceneEvent(position(s,'alley'),'stranger',{response:'investigate'});
 assert.throws(()=>M.act(s,'ledger'));const ready=opening();assert.throws(()=>M.q01SceneEvent(ready,'rescueRoute',{route:'manual'}));
});
check('Beat 04 rescue guards block premature steps, wrong routes, missing workers, wrong floor and unsealed mechanisms',()=>{
 const ar=G.create();
 let mech=M.q01SceneEvent(opening(),'rescueRoute',{route:'mechanical'},ctx);
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'cart'),'rescueStep',{step:'workers'},{actors:{titus:I.at.cart,worker1:I.at.lever,worker2:I.at.lever},workersBriefed:true,fulcrumPlaced:true}));
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'rope'),'rescueStep',{step:'pulley'},{actors:{titus:I.at.rope},pulleyProgress:1,gateSecured:true}),'Must block pulley before cart');
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'cart'),'rescueStep',{step:'cart'},{actors:{titus:I.at.titus},cartProgress:1,cartChocked:true,loadTested:true}),'Missing Titus at cart');
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'cart'),'rescueStep',{step:'cart'},{actors:{titus:I.at.cart},cartProgress:.8,cartChocked:true,loadTested:true}),'Unfinished cart travel');
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'cart'),'rescueStep',{step:'cart'},{actors:{titus:I.at.cart},cartProgress:1,cartChocked:false,loadTested:true}),'Unchocked cart');
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'cart'),'rescueStep',{step:'cart'},{actors:{titus:I.at.cart},cartProgress:1,cartChocked:true,loadTested:false}),'Untested cart load');
 mech=M.q01SceneEvent(position(mech,'cart'),'rescueStep',{step:'cart'},{actors:{titus:I.at.cart},cartProgress:1,cartChocked:true,loadTested:true});
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'rope'),'rescueStep',{step:'pulley'},{actors:{titus:I.at.rope},pulleyProgress:.9,gateSecured:true}));
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'rope'),'rescueStep',{step:'pulley'},{actors:{titus:I.at.rope},pulleyProgress:1,gateSecured:false}));
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'mezzanine'),'rescueStep',{step:'exit'},{actors:{titus:I.at.reception},commonOpen:true,roofChecked:true}),'Must block exit before pulley');
 mech=M.q01SceneEvent(position(mech,'rope'),'rescueStep',{step:'pulley'},{actors:{titus:I.at.rope},pulleyProgress:1,gateSecured:true});
 assert.throws(()=>M.q01SceneEvent(position(clone(mech),'reception'),'rescueStep',{step:'exit'},{actors:{titus:I.at.reception},commonOpen:true,roofChecked:true}),'Wrong floor for exit');
 const cartX=()=>{const c=ar.solids.find(s=>s.id==='counterweight-cart');return (c.min[0]+c.max[0])/2;};
 ar.projectScene(mech.sceneProgress.Q01);assert.equal(ar.solids.find(s=>s.id==='rescue-side-gate').enabled,false);assert.equal(ar.solids.find(s=>s.id==='rescue-raised-panel').enabled,true);assert.equal(ar.solids.find(s=>s.id==='rescue-main-beam').enabled,true);assert(Math.abs(cartX()-(-30.9))<.001);

 let man=M.q01SceneEvent(opening(),'rescueRoute',{route:'manual'},ctx);
 assert.throws(()=>M.q01SceneEvent(position(clone(man),'lever'),'rescueStep',{step:'cart'},{actors:{titus:I.at.lever},cartProgress:1,cartChocked:true,loadTested:true}));
 assert.throws(()=>M.q01SceneEvent(position(clone(man),'lever'),'rescueStep',{step:'lever'},{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},leverProgress:1,beamWedged:true,beamSettled:true}),'Must block lever before workers');
 assert.throws(()=>M.q01SceneEvent(position(clone(man),'lever'),'rescueStep',{step:'workers'},{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.workers},workersBriefed:true,fulcrumPlaced:true}),'Missing worker2');
 assert.throws(()=>M.q01SceneEvent(position(clone(man),'lever'),'rescueStep',{step:'workers'},{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},workersBriefed:false,fulcrumPlaced:true}),'Unbriefed workers');
 assert.throws(()=>M.q01SceneEvent(position(clone(man),'lever'),'rescueStep',{step:'workers'},{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},workersBriefed:true,fulcrumPlaced:false}),'Missing fulcrum');
 man=M.q01SceneEvent(position(man,'lever'),'rescueStep',{step:'workers'},{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},workersBriefed:true,fulcrumPlaced:true});
 assert.throws(()=>M.q01SceneEvent(position(clone(man),'lever'),'rescueStep',{step:'lever'},{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},leverProgress:.9,beamWedged:true,beamSettled:true}));
 assert.throws(()=>M.q01SceneEvent(position(clone(man),'lever'),'rescueStep',{step:'lever'},{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},leverProgress:1,beamWedged:false,beamSettled:true}));
 assert.throws(()=>M.q01SceneEvent(position(clone(man),'lever'),'rescueStep',{step:'lever'},{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},leverProgress:1,beamWedged:true,beamSettled:false}));
 man=M.q01SceneEvent(position(man,'lever'),'rescueStep',{step:'lever'},{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},leverProgress:1,beamWedged:true,beamSettled:true});
 ar.projectScene(man.sceneProgress.Q01);assert.equal(ar.solids.find(s=>s.id==='rescue-side-gate').enabled,true,'Manual route must never open mechanical side gate');assert.equal(ar.solids.find(s=>s.id==='rescue-raised-panel').enabled,false);assert.equal(ar.solids.find(s=>s.id==='rescue-rested-beam').enabled,true);assert(Math.abs(cartX()-(-32.8))<.001);
});
for(const route of ['mechanical','manual'])for(const plan of ['lodging','meal'])check(`${route}/${plan}: gated actor extraction, round-trip every prefix, single commit and unchanged source boundaries`,()=>{
 let s=opening();s=M.q01SceneEvent(s,'rescueRoute',{route},ctx);
 const c=route==='mechanical'?{actors:{titus:I.at.cart},cartProgress:1,cartChocked:true,loadTested:true}:{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},workersBriefed:true,fulcrumPlaced:true};
 const first=route==='mechanical'?'cart':'workers',second=route==='mechanical'?'pulley':'lever';
 s=M.q01SceneEvent(position(s,route==='mechanical'?'cart':'lever'),'rescueStep',{step:first},c);s=M.restore(s);
 const c2=route==='mechanical'?{actors:{titus:I.at.rope},pulleyProgress:1,gateSecured:true}:{actors:{titus:I.at.lever,worker1:I.at.lever,worker2:I.at.lever},leverProgress:1,beamWedged:true,beamSettled:true};
 s=M.q01SceneEvent(position(s,route==='mechanical'?'rope':'lever'),'rescueStep',{step:second},c2);s=M.restore(s);
 position(s,'mezzanine');assert.throws(()=>M.q01SceneEvent(s,'rescueStep',{step:'exit'},{actors:{titus:I.at.reception}}));
 assert.throws(()=>M.q01SceneEvent(position(clone(s),'reception'),'rescueStep',{step:'extract'},{actors:{titus:I.at.reception,simeon:I.at.reception,apprentice:I.at.reception},extractBriefed:true}),'Must block extract before exit');
 s=M.q01SceneEvent(s,'rescueStep',{step:'exit'},{actors:{titus:I.at.reception},commonOpen:true,roofChecked:true});s=M.restore(s);
 position(s,'reception');assert.throws(()=>M.q01SceneEvent(s,'rescueStep',{step:'extract'},{actors:{titus:I.at.reception,simeon:I.at.reception,apprentice:I.at.reception},extractBriefed:false}),'Must brief extract at mezzanine first');
 assert.throws(()=>M.q01SceneEvent(s,'rescueStep',{step:'extract'},{actors:{titus:I.at.reception,simeon:I.at.mezzanine,apprentice:I.at.reception},extractBriefed:true}));
 s=M.q01SceneEvent(s,'rescueStep',{step:'extract'},{actors:{titus:I.at.reception,simeon:I.at.reception,apprentice:I.at.reception},extractBriefed:true});s=M.restore(s);
 s=M.q01SceneEvent(position(s,'lookout'),'rooftop');s=M.q01SceneEvent(position(s,'yosef'),'yosefPrivacy');
 s=M.act(position(s,'meal'),'meal');s=M.act(position(s,plan==='meal'?'meal':'lodging'),'choose',{choice:plan});assert.deepEqual(s.resources,{money:3,food:3,tools:1});
 position(s,'rest');assert.throws(()=>M.q01SceneEvent(s,'recallT05',{},{}),'Missing Natan must block the night handoff');
 assert.throws(()=>M.q01SceneEvent(s,'recallT05',{},{actors:{natan:I.at.rest},natanVisible:false}),'A workshop wall must block the night handoff');
 s=M.q01SceneEvent(s,'recallT05',{},{actors:{natan:I.at.rest},natanVisible:true});s=M.restore(s);s=M.q01SceneEvent(position(s,'b06'),'observeB06');s=M.restore(s);
 const action=plan==='lodging'?'pay-lodging':'give-oil';s=M.act(position(s,plan==='lodging'?'lodging':'meal'),action);s=M.restore(s);
 assert.equal(s.events.filter(e=>e.type==='Q01.COMMITTED').length,1);assert.throws(()=>M.act(s,action));assert.deepEqual(s.resources,{money:plan==='lodging'?2:3,food:plan==='meal'?2:3,tools:1});assert.deepEqual(s.evidence,[]);assert.deepEqual(s.consent,{});
 assert.equal(s.sceneProgress.Q01.world.cart,route==='mechanical'?'chocked':'none');assert.equal(s.sceneProgress.Q01.world.beam,route==='manual'?'moved':'broken');
 assert.equal(Campaign.notes(s).length,8);assert.deepEqual(Campaign.notes(M.restore(s)),Campaign.notes(s));assert.deepEqual(s.evidence,[]);assert.deepEqual(s.consent,{});
 assert.equal(M.act(position(s,'handoff'),'advance').chapter,1);
});
check('Malformed activation cannot turn a scene-null import into a v6 campaign',()=>{let s=M.fresh();s.flags.q01Campaign=true;assert.throws(()=>M.restore(s));s.flags.q01Campaign='yes';assert.throws(()=>M.restore(s));});
console.log(JSON.stringify({status:'passed',checks,scope:'Model and shared physical preconditions; actual traversal is separately required by q01-campaign-browser.mjs'}));
