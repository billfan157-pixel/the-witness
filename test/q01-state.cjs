const assert=require('node:assert/strict');
const Q=require('../witness-q01-state.js');
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
const snapshot=x=>JSON.parse(JSON.stringify(x));

// Drive the full 9-beat sequence for a chosen rescue route.
function fullScene(route='mechanical',response='follow'){
  let s=Q.fresh();
  s=Q.reduce(s,'disembark');
  s=Q.reduce(s,'stranger',{response});
  s=Q.reduce(s,'ledgerSeam');
  s=Q.reduce(s,'fire');
  s=Q.reduce(s,'rescueRoute',{route});
  for(const step of Q.ROUTE_STEPS[route])s=Q.reduce(s,'rescueStep',{step});
  s=Q.reduce(s,'rooftop');
  s=Q.reduce(s,'yosefPrivacy');
  s=Q.reduce(s,'recallT05');
  s=Q.reduce(s,'observeB06');
  return s;
}
// Advance to the start of a given beat (0..8) along the mechanical route.
function toBeat(beat){
  let s=Q.fresh();
  const seq=[['disembark'],['stranger',{response:'follow'}],['ledgerSeam'],['fire'],['rescueRoute',{route:'mechanical'}],
    ...Q.ROUTE_STEPS.mechanical.map(step=>['rescueStep',{step}]),['rooftop'],['yosefPrivacy'],['recallT05'],['observeB06']];
  for(const [event,payload] of seq){if(s.beat>=beat)break;s=Q.reduce(s,event,payload);}
  return s;
}
function rescueReady(route='mechanical'){
  let s=toBeat(4);
  s=Q.reduce(s,'rescueRoute',{route});
  return s;
}

test('1. fresh scene is a valid version-1 state at beat 00',()=>{
  const s=Q.fresh();
  assert.equal(s.version,1);assert.equal(s.beat,0);assert.equal(s.phase,'afternoon');
  assert.equal(s.strangerResponse,null);assert.equal(s.ledgerSeamObserved,false);
  assert.deepEqual(s.rescue,{route:null,steps:[],peopleSafe:false});
  assert.deepEqual(s.world,{fire:'none',cart:'none',beam:'intact',sideExit:'closed'});
  assert.equal(s.rooftopSeen,false);assert.equal(s.yosefPrivacyRequested,false);
  assert.equal(s.t05Recalled,false);assert.equal(s.b06PreliminaryObserved,false);
  assert.equal(Q.canCommit(s),false);assert.doesNotThrow(()=>Q.restore(snapshot(s)));
});

test('2. nine beats progress strictly in order 00 -> 08',()=>{
  let s=Q.fresh();assert.equal(s.beat,0);
  s=Q.reduce(s,'disembark');assert.equal(s.beat,1);
  s=Q.reduce(s,'stranger',{response:'investigate'});assert.equal(s.beat,2);assert.equal(s.strangerResponse,'investigate');
  s=Q.reduce(s,'ledgerSeam');assert.equal(s.beat,3);assert.equal(s.ledgerSeamObserved,true);
  s=Q.reduce(s,'fire');assert.equal(s.beat,4);assert.equal(s.world.fire,'burning');assert.equal(s.world.beam,'broken');
  s=Q.reduce(s,'rescueRoute',{route:'mechanical'});
  for(const step of Q.ROUTE_STEPS.mechanical)s=Q.reduce(s,'rescueStep',{step});
  assert.equal(s.beat,5);assert.equal(s.rescue.peopleSafe,true);
  s=Q.reduce(s,'rooftop');assert.equal(s.beat,6);assert.equal(s.rooftopSeen,true);
  s=Q.reduce(s,'yosefPrivacy');assert.equal(s.beat,7);assert.equal(s.yosefPrivacyRequested,true);
  s=Q.reduce(s,'recallT05');assert.equal(s.beat,8);assert.equal(s.t05Recalled,true);
  s=Q.reduce(s,'observeB06');assert.equal(s.beat,8);assert.equal(s.b06PreliminaryObserved,true);
  assert.equal(Q.canCommit(s),true);
});

test('3. out-of-order events are rejected',()=>{
  assert.throws(()=>Q.reduce(Q.fresh(),'stranger',{response:'follow'}));
  assert.throws(()=>Q.reduce(Q.fresh(),'ledgerSeam'));
  assert.throws(()=>Q.reduce(Q.fresh(),'fire'));
  assert.throws(()=>Q.reduce(Q.fresh(),'rescueRoute',{route:'mechanical'}));
  assert.throws(()=>Q.reduce(Q.fresh(),'observeB06'));
  assert.throws(()=>Q.reduce(toBeat(3),'rescueRoute',{route:'mechanical'}));
  assert.throws(()=>Q.reduce(toBeat(4),'rooftop'));
  assert.throws(()=>Q.reduce(toBeat(4),'recallT05'));
  let s=rescueReady('mechanical');
  assert.throws(()=>Q.reduce(s,'rooftop'));
  s=Q.reduce(s,'rescueStep',{step:'cart'});
  assert.throws(()=>Q.reduce(s,'rescueStep',{step:'exit'}));
});

test('4. repeated events never double their effect',()=>{
  let s=Q.reduce(Q.fresh(),'disembark');
  assert.deepEqual(Q.reduce(s,'disembark'),s);
  s=Q.reduce(s,'stranger',{response:'follow'});
  assert.deepEqual(Q.reduce(s,'stranger',{response:'investigate'}),s);
  assert.equal(s.strangerResponse,'follow');
  s=Q.reduce(s,'ledgerSeam');assert.deepEqual(Q.reduce(s,'ledgerSeam'),s);
  s=Q.reduce(s,'fire');assert.deepEqual(Q.reduce(s,'fire'),s);
  s=Q.reduce(s,'rescueRoute',{route:'mechanical'});
  assert.deepEqual(Q.reduce(s,'rescueRoute',{route:'mechanical'}),s);
  s=Q.reduce(s,'rescueStep',{step:'cart'});
  const once=snapshot(s);
  assert.deepEqual(Q.reduce(s,'rescueStep',{step:'cart'}),once);
  assert.equal(s.rescue.steps.length,1);
  for(const step of ['pulley','exit','extract'])s=Q.reduce(s,'rescueStep',{step});
  assert.deepEqual(Q.reduce(s,'rescueStep',{step:'extract'}),s);
  assert.equal(s.rescue.steps.length,4);assert.equal(s.beat,5);
  s=Q.reduce(s,'rooftop');assert.deepEqual(Q.reduce(s,'rooftop'),s);
  s=Q.reduce(s,'yosefPrivacy');assert.deepEqual(Q.reduce(s,'yosefPrivacy'),s);
  s=Q.reduce(s,'recallT05');assert.deepEqual(Q.reduce(s,'recallT05'),s);
  s=Q.reduce(s,'observeB06');assert.deepEqual(Q.reduce(s,'observeB06'),s);
  assert.equal(s.b06PreliminaryObserved,true);
});

test('5. both rescue routes complete independently',()=>{
  for(const route of ['mechanical','manual']){
    const s=fullScene(route);
    assert.equal(s.rescue.route,route);
    assert.deepEqual(s.rescue.steps,[...Q.ROUTE_STEPS[route]]);
    assert.equal(s.rescue.peopleSafe,true);
    assert.equal(s.beat,8);assert.equal(Q.canCommit(s),true);
    assert.equal(s.world.sideExit,'open');
  }
});

test('6. steps cannot be mixed between routes',()=>{
  let m=rescueReady('mechanical');
  assert.throws(()=>Q.reduce(m,'rescueStep',{step:'workers'}));
  assert.throws(()=>Q.reduce(m,'rescueStep',{step:'lever'}));
  let n=rescueReady('manual');
  assert.throws(()=>Q.reduce(n,'rescueStep',{step:'cart'}));
  assert.throws(()=>Q.reduce(n,'rescueStep',{step:'pulley'}));
  assert.throws(()=>Q.reduce(n,'rescueStep',{step:'unknown'}));
});

test('7. people cannot be rescued before the mandatory steps',()=>{
  let s=rescueReady('mechanical');
  assert.throws(()=>Q.reduce(s,'rescueStep',{step:'extract'}));
  assert.equal(s.rescue.peopleSafe,false);
  s=Q.reduce(s,'rescueStep',{step:'cart'});
  assert.throws(()=>Q.reduce(s,'rescueStep',{step:'extract'}));
  s=Q.reduce(s,'rescueStep',{step:'pulley'});
  assert.throws(()=>Q.reduce(s,'rescueStep',{step:'extract'}));
  s=Q.reduce(s,'rescueStep',{step:'exit'});
  assert.equal(s.rescue.peopleSafe,false);
  s=Q.reduce(s,'rescueStep',{step:'extract'});
  assert.equal(s.rescue.peopleSafe,true);
  let n=rescueReady('manual');
  assert.throws(()=>Q.reduce(n,'rescueStep',{step:'extract'}));
});

test('8. route cannot be changed once started',()=>{
  let s=rescueReady('mechanical');
  assert.throws(()=>Q.reduce(s,'rescueRoute',{route:'manual'}));
  s=Q.reduce(s,'rescueStep',{step:'cart'});
  assert.throws(()=>Q.reduce(s,'rescueRoute',{route:'manual'}));
  assert.equal(s.rescue.route,'mechanical');
  let n=rescueReady('manual');
  assert.throws(()=>Q.reduce(n,'rescueRoute',{route:'mechanical'}));
  assert.throws(()=>Q.reduce(fullScene('mechanical'),'rescueRoute',{route:'manual'}));
});

test('9. world consequences are recorded exactly per route',()=>{
  let m=rescueReady('mechanical');
  m=Q.reduce(m,'rescueStep',{step:'cart'});assert.equal(m.world.cart,'chocked');assert.equal(m.world.beam,'broken');
  m=Q.reduce(m,'rescueStep',{step:'pulley'});assert.equal(m.world.sideExit,'closed');
  m=Q.reduce(m,'rescueStep',{step:'exit'});assert.equal(m.world.sideExit,'open');
  m=Q.reduce(m,'rescueStep',{step:'extract'});assert.equal(m.world.fire,'controlled');
  const mech=fullScene('mechanical');
  assert.deepEqual(mech.world,{fire:'cold',cart:'chocked',beam:'broken',sideExit:'open'});
  let n=rescueReady('manual');
  n=Q.reduce(n,'rescueStep',{step:'workers'});assert.equal(n.world.beam,'broken');assert.equal(n.world.cart,'none');
  n=Q.reduce(n,'rescueStep',{step:'lever'});assert.equal(n.world.beam,'moved');
  n=Q.reduce(n,'rescueStep',{step:'exit'});assert.equal(n.world.sideExit,'open');
  const man=fullScene('manual');
  assert.deepEqual(man.world,{fire:'cold',cart:'none',beam:'moved',sideExit:'open'});
  assert.equal(fullScene('mechanical').world.fire,'cold');
});

test('10. beat 05 records limited observation, never a culprit',()=>{
  let s=fullScene('mechanical');
  const text=JSON.stringify(s);
  for(const forbidden of ['culprit','arsonist','suspect','Rufus','Varro','identity','killer'])
    assert(!text.includes(forbidden),'scene must not name a culprit: '+forbidden);
  assert.equal(s.rooftopSeen,true);
  assert(['follow','investigate'].includes(s.strangerResponse));
  assert(!Object.hasOwn(s,'culprit'));
});

test('11. Yosef privacy request never becomes a publication right',()=>{
  const s=fullScene('manual');
  assert.equal(s.yosefPrivacyRequested,true);
  const text=JSON.stringify(s);
  for(const forbidden of ['consent','public_named','publication','yosefPublic','scope'])
    assert(!text.includes(forbidden),'privacy request must not grant disclosure: '+forbidden);
  assert(!Object.hasOwn(s,'consent'));
});

test('12. Q01 scene never grants E02 or any evidence',()=>{
  const s=fullScene('mechanical');
  assert.equal(s.b06PreliminaryObserved,true);
  assert(!Object.hasOwn(s,'evidence'));
  assert(!JSON.stringify(s).includes('E02'));
  assert(!JSON.stringify(s).includes('E01'));
});

test('13. scene cannot commit early',()=>{
  for(let beat=0;beat<=7;beat++){
    const s=toBeat(beat);
    assert.equal(Q.canCommit(s),false,'beat '+beat+' must not be committable');
  }
  let s=rescueReady('mechanical');
  for(const step of Q.ROUTE_STEPS.mechanical)s=Q.reduce(s,'rescueStep',{step});
  s=Q.reduce(s,'rooftop');s=Q.reduce(s,'yosefPrivacy');s=Q.reduce(s,'recallT05');
  assert.equal(s.beat,8);assert.equal(s.b06PreliminaryObserved,false);
  assert.equal(Q.canCommit(s),false);
  s=Q.reduce(s,'observeB06');assert.equal(Q.canCommit(s),true);
});

test('14. valid scenes survive a save/restore round-trip at every stage',()=>{
  const stages=[Q.fresh()];
  let s=Q.fresh();
  for(const [event,payload] of [['disembark'],['stranger',{response:'follow'}],['ledgerSeam'],['fire'],['rescueRoute',{route:'manual'}]]){
    s=Q.reduce(s,event,payload);stages.push(snapshot(s));
  }
  for(const step of Q.ROUTE_STEPS.manual){s=Q.reduce(s,'rescueStep',{step});stages.push(snapshot(s));}
  for(const event of ['rooftop','yosefPrivacy','recallT05','observeB06']){s=Q.reduce(s,event);stages.push(snapshot(s));}
  for(const stage of stages){
    const restored=Q.restore(JSON.parse(JSON.stringify(stage)));
    assert.deepEqual(restored,stage);
  }
  assert.deepEqual(Q.restore(snapshot(fullScene('mechanical'))),fullScene('mechanical'));
});

test('15. fake or inconsistent state is rejected',()=>{
  const base=()=>snapshot(fullScene('mechanical'));
  assert.throws(()=>Q.restore(null));
  assert.throws(()=>Q.restore({}));
  assert.throws(()=>Q.restore({...base(),version:2}));
  assert.throws(()=>Q.restore({...base(),beat:9}));
  assert.throws(()=>Q.restore({...base(),beat:-1}));
  assert.throws(()=>Q.restore({...base(),beat:1.5}));
  assert.throws(()=>Q.restore({...base(),phase:'midnight'}));
  assert.throws(()=>Q.restore({...base(),phase:'afternoon'}));
  assert.throws(()=>Q.restore({...base(),strangerResponse:'accuse'}));
  assert.throws(()=>Q.restore({...base(),ledgerSeamObserved:'yes'}));
  const badRoute=base();badRoute.rescue.route='magic';assert.throws(()=>Q.restore(badRoute));
  const badSteps=base();badSteps.rescue.steps=['cart','exit','pulley','extract'];assert.throws(()=>Q.restore(badSteps));
  const mixSteps=base();mixSteps.rescue.steps=['cart','workers','exit','extract'];assert.throws(()=>Q.restore(mixSteps));
  const earlySafe=base();earlySafe.rescue.steps=['cart'];earlySafe.rescue.peopleSafe=true;assert.throws(()=>Q.restore(earlySafe));
  const badFire=base();badFire.world.fire='ash';assert.throws(()=>Q.restore(badFire));
  const badCart=base();badCart.world.cart='parked';assert.throws(()=>Q.restore(badCart));
  const badBeam=base();badBeam.world.beam='gone';assert.throws(()=>Q.restore(badBeam));
  const badExit=base();badExit.world.sideExit='ajar';assert.throws(()=>Q.restore(badExit));
  const earlyStranger={...snapshot(Q.fresh()),beat:1,phase:'afternoon',strangerResponse:'follow'};assert.throws(()=>Q.restore(earlyStranger));
  const earlySeam={...snapshot(toBeat(2)),ledgerSeamObserved:true};assert.throws(()=>Q.restore(earlySeam));
  const earlyRescue={...snapshot(toBeat(3)),rescue:{route:'mechanical',steps:[],peopleSafe:false}};assert.throws(()=>Q.restore(earlyRescue));
  const earlyFire={...snapshot(toBeat(3)),world:{fire:'burning',cart:'none',beam:'broken',sideExit:'closed'}};assert.throws(()=>Q.restore(earlyFire));
  const earlyRoof={...snapshot(toBeat(5)),rooftopSeen:true};assert.throws(()=>Q.restore(earlyRoof));
  const earlyYosef={...snapshot(toBeat(6)),yosefPrivacyRequested:true};assert.throws(()=>Q.restore(earlyYosef));
  const earlyT05={...snapshot(toBeat(7)),t05Recalled:true};assert.throws(()=>Q.restore(earlyT05));
  const inconsistent=base();inconsistent.beat=5;inconsistent.phase='evening';inconsistent.rescue.peopleSafe=false;assert.throws(()=>Q.restore(inconsistent));
  const earlyB06=base();earlyB06.beat=7;earlyB06.phase='night';earlyB06.b06PreliminaryObserved=true;earlyB06.t05Recalled=false;assert.throws(()=>Q.restore(earlyB06));
  const wrongCart=base();wrongCart.rescue.route='manual';wrongCart.world.cart='chocked';wrongCart.world.beam='moved';assert.throws(()=>Q.restore(wrongCart));
  assert.throws(()=>Q.reduce(Q.fresh(),'teleport'));
  assert.throws(()=>Q.reduce(toBeat(1),'stranger',{response:'shout'}));
  assert.throws(()=>Q.reduce(toBeat(4),'rescueRoute',{route:'magic'}));
});

test('16. reducer never mutates its input and maps phases to beats',()=>{
  const s=Q.fresh(),frozen=snapshot(s);
  Q.reduce(s,'disembark');
  assert.deepEqual(s,frozen);
  const mid=fullScene('mechanical'),midSnapshot=snapshot(mid);
  Q.reduce(mid,'observeB06');
  assert.deepEqual(mid,midSnapshot);
  assert.equal(Q.phase(Q.fresh()),'afternoon');
  assert.equal(Q.phase(toBeat(3)),'evening');
  assert.equal(Q.phase(toBeat(7)),'night');
  assert.equal(Q.phase(fullScene('manual')),'dawn');
});

console.log(JSON.stringify({status:'passed',checks,module:'witness-q01-state',beats:9,routes:2}));