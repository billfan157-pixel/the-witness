// Component-aware collision measurement for batched Q01 geometry.
// The producer merges every mesh that shares a material; measuring one merged envelope reports
// collisions that no authored mesh occupies. These cases pin the per-mesh measurement and keep
// the gate honest with a negative and a positive control.
const assert=require('node:assert/strict');
const T=require('../tools/environment-kit/node_modules/three');
const G=require('./q01-geometry-guard.cjs');
globalThis.AdventureVisuals={atmosphere:()=>({})};
globalThis.__registerWitnessAtmospheres=()=>{};
require('../witness-q01.js');
const Q01=globalThis.WitnessQ01;
assert(Q01&&typeof Q01.batch==='function','WitnessQ01.batch is not available');

const material=new T.MeshStandardMaterial({color:'#a7afad'});
material.name='q01-b-test';
const group=new T.Group();
group.name='q01-batch-control';
const part=(name,x,y,z)=>{const mesh=new T.Mesh(new T.BoxGeometry(1,1,1),material);mesh.name=name;mesh.position.set(x,y,z);group.add(mesh);return mesh;};
const ground=part('q01-b-ground',0,0,0),roof=part('q01-b-roof',10,3.4,0),skipped=part('q01-oil-flame',-4,0,0);
ground.updateMatrixWorld(true);roof.updateMatrixWorld(true);skipped.updateMatrixWorld(true);
Q01.batch(T,group);

const batched=group.children.filter(o=>o.isMesh&&o.name!=='q01-oil-flame');
assert.equal(batched.length,1,'Batched meshes must be merged per material');
assert.equal(batched[0].name,'q01-batched-q01-b-test');
assert.equal(group.children.filter(o=>o.isMesh&&o.name==='q01-oil-flame').length,1,'Excluded meshes must stay separate');

const parts=G.partBoxes(batched[0]);
assert(parts,'A batched mesh must expose its per-mesh boxes');
assert.equal(parts.length,2,'Every merged mesh must keep its own box');
const byId=Object.fromEntries(parts.map(p=>[p.id,p]));
assert(byId['q01-b-ground']&&byId['q01-b-roof'],'Merged mesh identity must survive batching');
// The kept box is the mesh's own extent, not the envelope of the whole batch.
const near=(actual,expected,tol=1e-4)=>{assert.equal(actual.length,expected.length);actual.forEach((v,i)=>assert(Math.abs(v-expected[i])<=tol,`${v} is not within ${tol} of ${expected[i]}`));};
near(byId['q01-b-ground'].min,[-.5,-.5,-.5]);
near(byId['q01-b-ground'].max,[.5,.5,.5]);
near(byId['q01-b-roof'].min,[9.5,2.9,-.5]);
near(byId['q01-b-roof'].max,[10.5,3.9,.5]);
assert.equal(G.partBoxes(skipped),null,'A mesh that was never batched must fall back to its own extent');

const box=min=>new T.Box3(new T.Vector3(min[0],min[1],min[2]),new T.Vector3(min[3],min[4],min[5]));
const groundBox=box(byId['q01-b-ground'].min.concat(byId['q01-b-ground'].max));
const roofBox=box(byId['q01-b-roof'].min.concat(byId['q01-b-roof'].max));
const player={x:0,y:3.4,z:0};
// Negative control: the merged envelope would blame the player for the roof mesh ten metres away.
const envelope=new T.Box3().union(groundBox).union(roofBox);
assert.deepEqual(G.boxErrors(envelope,player),['torso'],'The merged envelope must still be the reason the gate failed');
assert.deepEqual(G.boxErrors(groundBox,player),[],'A part below the feet must not be a body collision');
assert.deepEqual(G.boxErrors(roofBox,player),[],'A part ten metres away must not be a body collision');
// Positive control: standing inside a part is still a collision.
assert.deepEqual(G.boxErrors(groundBox,{x:0,y:0,z:0}),['torso'],'A body inside a part must be reported');
assert.deepEqual(G.boxErrors(box([-.05,-.05,-.05,.05,.05,.05]),{x:0,y:0,z:0},{x:0,y:0,z:0}),['camera'],'A camera inside a part must be reported');
assert.deepEqual(G.boxErrors(box([5,0,5,6,1,6]),{x:0,y:0,z:0},{x:0,y:0,z:0}),[],'A camera far from every part must stay quiet');
console.log('PASS Batched Q01 geometry keeps per-mesh boxes, and the component-aware guard reports a deliberate overlap while staying quiet on the merged envelope');
