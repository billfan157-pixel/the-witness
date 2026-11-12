'use strict';
const assert=require('node:assert/strict'),G=require('../witness-q01-greybox.js'),Q=require('../witness-q01-state.js');
const M=require('../witness-model.js');
let count=0,frames=0;const reports=[];
function test(name,fn){fn();count++;console.log('PASS '+name);}
function walk(ar,from,to){
 const route=ar.route(from,to);assert(route?.length,'No physical route: '+JSON.stringify({from,to,preview:ar.preview}));let p={...from};
 for(const waypoint of route){let n=0;while(Math.hypot(p.x-waypoint.x,p.z-waypoint.z)>.008){assert(++n<10000,'Movement stuck');const dx=waypoint.x-p.x,dz=waypoint.z-p.z,d=Math.hypot(dx,dz),step=Math.min(.055,d),q=ar.move(p,dx/d*step,dz/d*step);assert(Math.hypot(q.x-p.x,q.z-p.z)>.00001,'Route disagrees with controller: '+JSON.stringify({p,waypoint}));assert(!ar.collides(q),'Capsule intersects '+ar.collides(q));assert(ar.supports(q.x,q.z).some(s=>s.supportId===q.supportId&&Math.abs(s.y-q.y)<.001),'Unsupported feet');p=q;frames++;}assert(Math.abs(p.y-waypoint.y)<.025,'Wrong elevation');}
 assert(Math.hypot(p.x-to.x,p.y-to.y,p.z-to.z)<.025,'Wrong destination');return p;
}
test('Nine Beat hooks name real, supported, collision-free standing positions',()=>{
 const ar=G.create();assert.deepEqual(G.beats.map(b=>b.beat),[0,1,2,3,4,5,6,7,8]);
 for(const beat of G.beats)for(const id of beat.anchors){const p=ar.anchors[id];assert(p,id);assert(!ar.collides(p),id+' is inside '+ar.collides(p));assert(ar.supports(p.x,p.z).some(s=>Math.abs(s.y-p.y)<.001),id+' is unsupported');}
 assert.equal(G.MEZZ,14*G.RISE);assert.equal(G.ROOF,28*G.RISE);
});
test('Arrival, both stranger approaches, workshop, LOAD, all C0 handoffs and optional drain are walkable',()=>{
 const ar=G.create();let p=ar.anchors.boat;
 for(const id of ['disembark','alley','stranger','follow','alley','load','ledger','titus','cart','rope','workers','lever','drainMouth','drain','drainMouth','yosef','rest','meal','lodging','b06','handoff'])p=walk(ar,p,ar.anchors[id]);
});
test('Fire blocks both rescue entries; neither the drain nor external escape bypasses the rescue',()=>{
 const ar=G.create();ar.setPreview({fire:true});
 assert.equal(ar.route(ar.anchors.titus,ar.anchors.mezzanine),null);
 assert.equal(ar.route(ar.anchors.drain,ar.anchors.mezzanine),null);
 assert.equal(ar.route(ar.anchors.yosef,ar.anchors.reception),null);
 assert.equal(ar.route(ar.anchors.titus,ar.anchors.descentTop),null);
 assert.throws(()=>ar.setPreview({opened:true}),/Prepare/);
});
for(const route of ['mechanical','manual'])test(route+' performs the complete check / return / extraction / exterior descent without teleporting',()=>{
 const ar=G.create();ar.setPreview({fire:true,route});let p=ar.anchors.titus;
 p=walk(ar,p,ar.anchors[route==='mechanical'?'cart':'workers']);ar.setPreview({prepared:true});
 assert.equal(ar.route(p,ar.anchors.mezzanine),null,'Preparation alone opened the route');
 p=walk(ar,p,ar.anchors[route==='mechanical'?'rope':'lever']);ar.setPreview({opened:true});
 const beam=ar.solids.find(s=>s.id==='rescue-main-beam'),gate=ar.solids.find(s=>s.id==='rescue-side-gate');
 assert.equal(beam.enabled,route==='mechanical');assert.equal(gate.enabled,route!=='mechanical');
 p=walk(ar,p,ar.anchors.mezzanine);p=walk(ar,p,ar.anchors.commonDoor);
 assert.equal(ar.route(p,ar.anchors.reception),null,'Common roof door bypassed');ar.setPreview({common:true});
 for(const id of ['reception','lookout','winch','mezzanine','mainBottom','mezzanine','simeon','apprentice','reception','roofExit','descentTop','yosef','ledger','b06','meal','lodging','handoff'])p=walk(ar,p,ar.anchors[id]);
 assert.equal(beam.enabled,route==='mechanical','Common exit opened unrelated main beam');
 assert.equal(gate.enabled,route!=='mechanical','Common exit opened unrelated mechanical panel');
 reports.push({route,final:p,solids:ar.solids.length,surfaces:ar.surfaces.length});
});
test('Room, mezzanine and roof can occupy the same XZ without cross-floor interaction or camera leakage',()=>{
 const ar=G.create(),roof=ar.anchors.reception,room={...roof,y:0,supportId:'q01-room'},mezz={...roof,y:G.MEZZ,supportId:'q01-mezzanine'},target={at:[roof.x,roof.z],floorY:roof.y,range:2};
 assert(!ar.reachable(room,target));assert(!ar.reachable(mezz,target));assert(ar.reachable(roof,target));
 assert(!ar.visible({...mezz,y:mezz.y+1.5},{...roof,y:roof.y+1.5}));
 const camera=ar.camera({...room,y:1.45},{...room,y:7});assert(camera.y<G.MEZZ-.18);
 for(const p of [room,mezz,roof])assert.deepEqual(ar.restore(p,ar.anchors.boat),p);
 assert.deepEqual(ar.restore({...roof,supportId:'invented'},roof),roof,'Invalid record dropped the current roof fallback through the building');
 assert.deepEqual(ar.restore(null,mezz),mezz,'Missing record changed floors');
});
test('Every authored support round-trips the existing campaign spatial validator without new schema or IDs',()=>{
 const ar=G.create();for(const support of ar.surfaces){const [x0,x1,z0,z1]=support.rect,x=(x0+x1)/2,z=(z0+z1)/2,y=typeof support.y==='function'?support.y(x,z):support.y;
  const p={schema:1,x,y,z,supportId:support.id},s=M.fresh();s.spatialPositions['Q01.mortal']=p;assert.deepEqual(M.restore(s).spatialPositions['Q01.mortal'],p,support.id);}
});
test('Full capsule cannot leave the roof / pier or cross drain side walls',()=>{
 const ar=G.create();ar.setPreview({fire:true,route:'manual',prepared:true,opened:true,common:true});
 const q=ar.move(ar.anchors.lookout,-8,0);assert(q.x>-28.2);assert.equal(q.y,G.ROOF);
 const boat=ar.move(ar.anchors.boat,20,0);assert(boat.x<-4.9);assert.equal(boat.y,.18);
 const drain=ar.move(ar.anchors.drain,10,0);assert(drain.x<-33.1);assert.equal(drain.y,-1.26);
});
test('Beat 01 loses line of sight at a real corner; Beat 05 sees the rear alley and small berth through a safe rail aperture',()=>{
 const ar=G.create(),eye=p=>({...p,y:p.y+1.58}),look=eye(ar.anchors.lookout);
 assert(ar.visible(eye(ar.anchors.alley),eye(ar.anchors.stranger)),'Arrival cannot see the stranger');
 assert(!ar.visible(eye(ar.anchors.follow),eye(ar.anchors.strangerGone)),'The stranger never disappears behind a corner');
 walk(ar,ar.anchors.stranger,ar.anchors.strangerGone);
 for(const id of ['rearAlley','smallBerth'])assert(ar.visible(look,eye(ar.anchors[id])),'Rooftop sightline blocked: '+id);
 walk(ar,ar.anchors.rearAlley,ar.anchors.smallBerth);
 const stopped=ar.move(ar.anchors.lookout,0,-10);assert(stopped.z>-20.6);assert.equal(stopped.y,G.ROOF,'Sight aperture lets the capsule leave the roof');
});
test('Every PR-03 route prefix projects deterministically; manual sideExit never opens the pulley panel',()=>{
 for(const route of ['mechanical','manual']){
  let s=Q.fresh();for(const [event,payload]of [['disembark'],['stranger',{response:'investigate'}],['ledgerSeam'],['fire'],['rescueRoute',{route}]])s=Q.reduce(s,event,payload);
  const ar=G.create();for(const step of [null,...Q.ROUTE_STEPS[route]]){
   if(step)s=Q.reduce(s,'rescueStep',{step});const copy=structuredClone(s);ar.projectScene(s);assert.deepEqual(s,copy,'Geometry mutated story state');
   const reloaded=G.create();reloaded.projectScene(Q.restore(s));assert.deepEqual(reloaded.preview,ar.preview);
   assert.equal(ar.solids.find(b=>b.id==='rescue-side-gate').enabled,!(route==='mechanical'&&s.rescue.steps.includes('pulley')));
   assert.equal(ar.solids.find(b=>b.id==='rescue-main-beam').enabled,!(route==='manual'&&s.rescue.steps.includes('lever')));
  }
 }
});
console.log(JSON.stringify({status:'passed',checks:count,controllerFrames:frames,routes:reports,version:G.VERSION,scope:'Spatial/physics tests; no narrative gameplay, art approval or human playtest'}));
