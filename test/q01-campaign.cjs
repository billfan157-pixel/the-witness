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
for(const route of ['mechanical','manual'])for(const plan of ['lodging','meal'])check(`${route}/${plan}: gated actor extraction, round-trip every prefix, single commit and unchanged source boundaries`,()=>{
 let s=opening();s=M.q01SceneEvent(s,'rescueRoute',{route},ctx);
 const c={actors:{titus:I.at[route==='manual'?'lever':'cart'],worker1:I.at.lever,worker2:I.at.lever}};
 const first=route==='mechanical'?'cart':'workers',second=route==='mechanical'?'pulley':'lever';
 s=M.q01SceneEvent(position(s,route==='mechanical'?'cart':'lever'),'rescueStep',{step:first},c);s=M.restore(s);
 c.actors.titus=I.at[route==='mechanical'?'rope':'lever'];s=M.q01SceneEvent(position(s,route==='mechanical'?'rope':'lever'),'rescueStep',{step:second},c);s=M.restore(s);
 position(s,'mezzanine');assert.throws(()=>M.q01SceneEvent(s,'rescueStep',{step:'exit'},{actors:{titus:I.at.reception}}));
 s=M.q01SceneEvent(s,'rescueStep',{step:'exit'},{actors:{titus:I.at.reception},commonOpen:true,roofChecked:true});s=M.restore(s);
 position(s,'reception');assert.throws(()=>M.q01SceneEvent(s,'rescueStep',{step:'extract'},{actors:{titus:I.at.reception,simeon:I.at.mezzanine,apprentice:I.at.reception}}));
 s=M.q01SceneEvent(s,'rescueStep',{step:'extract'},{actors:{titus:I.at.reception,simeon:I.at.reception,apprentice:I.at.reception}});s=M.restore(s);
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
