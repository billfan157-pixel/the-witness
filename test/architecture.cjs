const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=require('../witness-architecture.js'),M=require('../witness-model.js');
const tests=[];function check(name,fn){fn();tests.push(name);console.log('PASS '+name);}
const p=A.create(),entry=p.nodes[0],roof=p.nodes.at(-1);
function follow(from,route){let current=from,steps=new Set();for(const goal of route){let count=0;while(Math.hypot(current.x-goal.x,current.z-goal.z)>.025){const d=Math.hypot(goal.x-current.x,goal.z-current.z),next=p.move(current,(goal.x-current.x)/d*Math.min(d,.07),(goal.z-current.z)/d*Math.min(d,.07));assert(Math.abs(next.y-current.y)<=A.dimensions.maxStep+1e-4);assert(!p.collides(next));assert(++count<3000,'Unreachable route waypoint');current=next;if(next.supportId.startsWith('q01-step'))steps.add(next.supportId);}}return {current,steps};}
check('Door, interior, all eighteen steps, landing, roof and return use continuous supported motion',()=>{
 const route=p.route(entry,roof);assert(route);const up=follow(entry,route);assert.equal(up.steps.size,18);assert(Math.abs(up.current.y-p.roof)<1e-5);
 const down=follow(up.current,p.route(up.current,entry));assert.equal(down.steps.size,18);assert(Math.abs(down.current.y-entry.y)<1e-5);
});
check('Swept capsule blocks fast wall crossings, parapets, stairwell sides and excessive drops',()=>{
 const room={x:-24,y:p.base,z:-12,supportId:'q01-room'};
 const wall=p.move(room,-20,0);assert(wall.x>-27.22+.28);
 const west=p.move(roof,-40,0);assert(west.x>-27.22+.28);assert.equal(west.y,p.roof);
 const well=p.move({x:-22,y:p.roof,z:-13,supportId:'q01-roof-main'},5,0);assert(well.x<-20.8);assert.equal(well.y,p.roof);
 const edge=p.move({x:-24,y:p.roof,z:-13,supportId:'q01-roof-main'},0,30);assert(edge.z<-9.7);assert.equal(edge.y,p.roof);
 const rack=p.move(roof,0,4);assert(rack.z<-14.08,'Body entered the drying rack');
});
check('Controller waypoint tolerance cannot cut across the bottom step on the return route',()=>{
 let current=roof,route=p.route(roof,entry),count=0;
 while(route.length){const goal=route[0],d=Math.hypot(current.x-goal.x,current.z-goal.z);
  if(d<.06&&Math.abs(current.y-goal.y)<.23){route.shift();continue;}
  current=p.move(current,(goal.x-current.x)/Math.max(1,d)*2.35/30,(goal.z-current.z)/Math.max(1,d)*2.35/30);
  assert(++count<3000,'Controller became stuck at a transition');
 }
 assert(Math.hypot(current.x-entry.x,current.z-entry.z)<.07);assert.equal(current.supportId,'world');
});
check('Doorway admits a standing capsule and solid lintel/ceiling reject body penetration',()=>{
 const inside=follow(entry,[p.nodes[1]]).current;assert.equal(inside.supportId,'q01-room');
 assert(p.collides({x:-24,y:p.roof-1.5,z:-12,supportId:'q01-room'}));
 assert(p.collides({x:-23,y:p.base+1,z:-9.64,supportId:'world'}));
 assert.equal(p.collides({x:-23,y:p.base+.65,z:-9.23}),null,'Rounded capsule head should clear the lintel corner');
 assert.equal(p.collides({x:-23,y:p.base+.65,z:-9.5}),'lintel','Capsule head must hit the lintel directly overhead');
});
check('Q01 outdoor guide reaches its turn before cutting past a loaded workbench',()=>{
 const ar=A.create({outdoorAllowed:(x,z)=>Math.hypot(x+25.1,z-3.7)>=1.18}),waypoints=[[-24,6],[-25,6],[-26,6],[-27,6],[-23,-8.6]];
 let pos={x:-23,y:0,z:5.7,supportId:'world'},i=0;
 for(let n=0;n<3000&&i<waypoints.length;n++){
  const [x,z]=waypoints[i],d=Math.hypot(x-pos.x,z-pos.z);
  if(d<.05){i++;continue;}
  pos=ar.move(pos,(x-pos.x)/Math.max(1,d)*2.35/60,(z-pos.z)/Math.max(1,d)*2.35/60);
 }
 assert.equal(i,waypoints.length,'Guide caught the workbench corner');
 assert(Math.hypot(pos.x+23,pos.z+8.6)<.06);
});
check('Same x,z on floor and roof retain separate support and cannot interact through the slab',()=>{
 const under={x:roof.x,y:p.base,z:roof.z,supportId:'q01-room'},target=A.targets(p)[1];
 assert(!p.reachable(under,target));assert(p.reachable(roof,target));
 assert(!p.visible({...under,y:under.y+1.58},{...roof,y:roof.y+1.15}));
 assert.equal(p.restore(under,entry).supportId,'q01-room');assert.equal(p.restore(roof,entry).supportId,'q01-roof-main');
 assert(p.restore({...roof,supportId:'q01-room'},entry).y<p.roof);
});
check('Camera sweeps its near-plane clearance against walls and opaque ceilings',()=>{
 const eye={x:-24,y:p.base+1.45,z:-12},wanted={x:-24,y:8,z:-12},c=p.camera(eye,wanted);
 assert(c.y<=p.roof-.22-.18);assert(c.y>eye.y);
 const side=p.camera(eye,{x:-40,y:eye.y,z:eye.z});assert(side.x>-27.22+.18);
});
check('Spatial snapshots round-trip floor identity and reject malformed/foreign records',()=>{
 const s=M.fresh();s.spatialPositions['Q01.mortal']={schema:1,...roof};const restored=M.restore(s);
 assert.deepEqual(restored.spatialPositions['Q01.mortal'],s.spatialPositions['Q01.mortal']);
 const bad=M.fresh();bad.spatialPositions={'bad':{schema:1,...roof},'Q01.mortal':{schema:1,...roof,y:NaN},'Q02.mortal':{schema:1,...roof,supportId:'invented'}};
 assert.deepEqual(M.restore(bad).spatialPositions,{});const old=M.fresh();delete old.spatialPositions;assert.deepEqual(M.restore(old).spatialPositions,{});
});
check('Domain work cannot be performed from the roof using forged planar proximity',()=>{
 const s=M.fresh();s.spatialPositions['Q01.mortal']={schema:1,...roof};assert.throws(()=>M.act(s,'brace'),/đúng tầng/);assert.throws(()=>M.fieldStart(s,'brace'),/đúng tầng/);
 const copy=structuredClone(s);M.restore(s);assert.deepEqual(s,copy);
});
check('Terrain heights reproduce the triangle mesh rather than bilinear interpolation or an older analytic hill',()=>{
 const ys=[0,2,4,10],xs=[0,1,0,1],zs=[0,0,1,1],mesh={geometry:{parameters:{widthSegments:1,heightSegments:1},attributes:{position:{count:4,getX:i=>xs[i],getY:i=>ys[i],getZ:i=>zs[i]}}}};
 const h=A.terrainSampler(mesh);assert.equal(h(.25,.25),1.5);assert.equal(h(.75,.75),6.5);ys[3]=14;assert.equal(h(.75,.75),8.5);
});
const out=path.resolve(process.env.WITNESS_ARCH_MODEL_OUT||'outputs/environment-kit/phase3');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'model.json'),JSON.stringify({status:'passed',checks:tests,dimensions:A.dimensions,architecture:p.snapshot()},null,2));
