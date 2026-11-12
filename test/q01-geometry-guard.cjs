'use strict';
// Component-aware collision measurement shared by the Q01 architecture gate and its controls.
// A batched mesh merges every mesh that shares a material, so one envelope covers the whole
// store and reports collisions that no authored mesh occupies. The producer keeps every merged
// mesh's own box (userData.batchParts, group-local); consumers measure those boxes, which is
// the same measurement the gate applied before batching.
const BODY_RADIUS=.28,BODY_LOW=.23,BODY_HIGH=1.65,BODY_LOW2=.32,CAMERA_CLEARANCE=.16;
// Returns the per-mesh boxes of a batched mesh, or null when the mesh was never batched.
function partBoxes(mesh){
  const parts=mesh&&mesh.userData&&mesh.userData.batchParts;
  if(!Array.isArray(parts)||!parts.length)return null;
  return parts.map((part,index)=>({id:part.id||String(index),min:part.min,max:part.max}));
}
function distanceToBox(box,p){
  const dx=Math.max(box.min.x-p.x,0,p.x-box.max.x),dy=Math.max(box.min.y-p.y,0,p.y-box.max.y),dz=Math.max(box.min.z-p.z,0,p.z-box.max.z);
  return Math.hypot(dx,dy,dz);
}
function cameraOverlap(box,cp){return distanceToBox(box,cp)<CAMERA_CLEARANCE;}
// Boxes entirely below the feet, above the head or under the ankles never touch the body.
function outsideBodyBand(box,p){return box.max.y<=p.y+BODY_LOW||box.min.y>=p.y+BODY_HIGH||box.max.y<=p.y+BODY_LOW2;}
function torsoOverlap(box,p){
  const dx=p.x-Math.max(box.min.x,Math.min(box.max.x,p.x)),dz=p.z-Math.max(box.min.z,Math.min(box.max.z,p.z));
  return dx*dx+dz*dz<BODY_RADIUS*BODY_RADIUS;
}
// Every error a measured box produces against one player position.
function boxErrors(box,p,cp){
  const errors=[];
  if(cp&&cameraOverlap(box,cp))errors.push('camera');
  if(outsideBodyBand(box,p))return errors;
  if(torsoOverlap(box,p))errors.push('torso');
  return errors;
}
const guard={partBoxes,distanceToBox,cameraOverlap,outsideBodyBand,torsoOverlap,boxErrors,BODY_RADIUS,CAMERA_CLEARANCE};
if(typeof module!=='undefined'&&module.exports)module.exports=guard;
if(typeof globalThis!=='undefined')globalThis.WitnessGeometryGuard=guard;
