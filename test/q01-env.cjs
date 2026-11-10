const assert=require('node:assert/strict');
const T=require('../tools/environment-kit/node_modules/three');
const A=require('../witness-architecture.js'),E=require('../witness-q01-environment.js');
const mats=new Map(),get=role=>{if(!mats.has(role))mats.set(role,new T.MeshStandardMaterial());return mats.get(role);};
global.WitnessQ01={surfaces:()=>get,batch(){}};
const part={id:'test-floor',kind:'floor',min:[-3,-.2,-2],max:[3,0,2]};
const mesh=E.partMesh(T,part,false,get).children[0],p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,uv=mesh.geometry.attributes.uv;
let top=0;for(let i=0;i<p.count;i++)if(n.getY(i)>.99){top++;assert(Math.abs(p.getY(i)-.10)<1e-6);assert(Math.abs(uv.getX(i)-(p.getX(i)+mesh.position.x)/1.8)<1e-6);assert(Math.abs(uv.getY(i)-(p.getZ(i)+mesh.position.z)/1.8)<1e-6);}
assert(top>=16,'Walkable top lost its upward normals');
console.log('PASS Walkable beveled slabs retain a planar top and continuous metre-scaled UVs at every top vertex');
const ar=A.create({height:()=>-.12});
for(const x of [-25.8,-23.1]){
 assert(ar.visible({x,y:2.45,z:-16.9},{x,y:2.45,z:-18}),'Clerestory is visually/physically sealed');
 assert(!ar.visible({x,y:1.45,z:-16.9},{x,y:1.45,z:-18}),'Lower structural wall disappeared');
 const stop=ar.move({x,y:ar.base,z:-16.6,supportId:'q01-room'},0,-5);assert(stop.z>-17.22+.28,'A standing capsule passed through a high light opening');
}
console.log('PASS High light openings admit rays while the lower warehouse wall still blocks a standing capsule');
for(const route of [[-23,6,-10,6],[-10,6,-5,-1],[-5,-1,8,4],[8,4,15,-6],[15,-6,20,7]])for(let i=0;i<=20;i++){const t=i/20,x=route[0]+(route[2]-route[0])*t,z=route[1]+(route[3]-route[1])*t;assert(E.clear(x,z),'Authored working route is not cleared');}
console.log('PASS The actual Q01 quest chain shares the authored traffic corridor rather than isolated presentation pads');
ar.surfaces.push({id:'q01-quay',rect:[-34,-30,-26,-22],contains:(x,z)=>z<-23,y:()=>.18});
const quay=ar.supports(-31,-24);assert.equal(quay.length,1);assert.equal(quay[0].supportId,'q01-quay');assert.equal(quay[0].y,.18);
assert.equal(ar.supports(-31,-22.5)[0].supportId,'world');
const M=require('../witness-model.js'),state=M.fresh();state.spatialPositions={'Q01.mortal':{schema:1,x:-31,y:.18,z:-24,supportId:'q01-quay'}};assert.equal(M.restore(state).spatialPositions['Q01.mortal'].supportId,'q01-quay');
console.log('PASS The quay replaces buried terrain support and round-trips its own floor identity');
const outdoor=A.create({height:()=>0,outdoorAllowed:(x,z)=>Math.hypot(x-.25,z)>.41});
const point=p=>({x:p[0],y:0,z:p[1],supportId:'world'}),sweep=(a,b)=>outdoor.walkLine(point(a),point(b));
assert(!sweep([0,0],[.5,0]),'Narrow trunk fixture should obstruct a link between two clear nodes');
const path=E.findPath([-1,0],[1,0],{allowed:(x,z)=>outdoor.groundClear(x,z),sweep});assert(path?.length,'A route around a narrow trunk was not found');
let from=[-1,0];for(const to of path){assert(sweep(from,to),'Planner returned an obstructed segment');const p=outdoor.move(point(from),to[0]-from[0],to[1]-from[1]);assert(Math.hypot(p.x-to[0],p.z-to[1])<1e-6);from=to;}
assert(Math.hypot(from[0]-1,from[1])<.01);console.log('PASS Outdoor navigation sweeps links and physically walks around a trunk between clear grid nodes');
