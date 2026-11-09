// Modular photogrammetry-style architecture kit.
// Geometry is authored procedurally with beveled arrises and a vertex mask
// (R=cavity dirt, G=arris wear, B=ground moisture/moss) so the same source
// exports to Draco/Meshopt+KTX2 .glb (tools/environment-kit/build-arch-kit.cjs)
// and builds instantly offline. Physics colliders stay in witness-architecture.
(function(root){
 'use strict';
 const TILE=3;
 function rng(seed){let s=seed>>>0;return()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296);}

 function bevelBox(T,w,h,d,r=.02,seg=3,sharpTop=false){
  const g=new T.BoxGeometry(w,h,d,seg,seg,seg),p=g.attributes.position,n=g.attributes.normal;
  const half=new T.Vector3(w/2,h/2,d/2),q=new T.Vector3(),core=new T.Vector3(),dir=new T.Vector3();
  for(let i=0;i<p.count;i++){
   q.set(p.getX(i),p.getY(i),p.getZ(i));
   // Walkable slabs keep a full-extent sharp top: rounding the top arris would
   // drop the rendered surface below the physics plane at the tread edge.
   const cy=sharpTop&&q.y>half.y-r?q.y:Math.max(-half.y+r,Math.min(half.y-r,q.y));
   core.set(Math.max(-half.x+r,Math.min(half.x-r,q.x)),cy,Math.max(-half.z+r,Math.min(half.z-r,q.z)));
   dir.copy(q).sub(core);
   if(dir.lengthSq()>1e-10){dir.normalize();q.copy(core).addScaledVector(dir,r);n.setXYZ(i,dir.x,dir.y,dir.z);}
   p.setXYZ(i,q.x,q.y,q.z);
  }
  return g;
 }

 // Concatenate indexed geometries carrying position/normal/uv/aMask.
 function merge(T,parts){
  const names=['position','normal','uv','aMask'],sizes={position:3,normal:3,uv:2,aMask:3};
  const total=parts.reduce((n,g)=>n+g.attributes.position.count,0);
  const arrays={},index=[];let offset=0;
  for(const name of names)arrays[name]=new Float32Array(total*sizes[name]);
  for(const g of parts){
   const count=g.attributes.position.count;
   for(const name of names){
    const attr=g.attributes[name];
    if(attr)arrays[name].set(attr.array,offset*sizes[name]);
    else if(name==='aMask')arrays[name].fill(0,offset*3,(offset+count)*3);
   }
   const idx=g.index;
   if(idx)for(let i=0;i<idx.count;i++)index.push(idx.getX(i)+offset);
   else for(let i=0;i<count;i++)index.push(i+offset);
   offset+=count;g.dispose();
  }
  const out=new T.BufferGeometry();
  for(const name of names)out.setAttribute(name,new T.BufferAttribute(arrays[name],sizes[name]));
  out.setIndex(index);out.computeBoundingSphere();
  return out;
 }

 function worldUV(T,g,ox,oz,jitter=0){
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i)+ox,y=p.getY(i),z=p.getZ(i)+oz;
   if(Math.abs(n.getY(i))>.5)uv.setXY(i,x/TILE+jitter,z/TILE+jitter);
   else if(Math.abs(n.getX(i))>.5)uv.setXY(i,z/TILE+jitter,y/TILE+jitter);
   else uv.setXY(i,x/TILE+jitter,y/TILE+jitter);
  }
  return g;
 }

 function maskAttr(T,g,fn){
  const p=g.attributes.position,n=g.attributes.normal,arr=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++)fn(arr,i*3,p.getX(i),p.getY(i),p.getZ(i),n,i);
  g.setAttribute('aMask',new T.BufferAttribute(arr,3));
  return g;
 }

 // Ashlar wall module, pivot at base centre. Authored at real course sizes so
 // blocks never stretch; the .glb export uses the reference 4 x 3 m module.
 function ashlarWall(T,seed=7,width=4,height=3){
  const rand=rng(seed),parts=[];
  // Centred on the collider envelope: blocks must never protrude past the
  // physics thickness or the walking capsule visually clips into the wall.
  const backing=bevelBox(T,width-.04,height-.04,.30,.015,2);backing.translate(0,height/2,-.05);
  maskAttr(T,backing,(a,o)=>{a[o]=.85;a[o+1]=0;a[o+2]=.25;});
  parts.push(worldUV(T,backing,0,0));
  const rows=Math.max(2,Math.round(height/.5)),cols=Math.max(1,Math.round(width/1));
  const rowH=height/rows,blockW=width/cols;
  for(let row=0;row<rows;row++){
   const y=row*rowH+rowH/2,offset=(row%2)*.5;
   for(let col=0;col<cols;col++){
    const bw=blockW-.03-rand()*.04,x=-width/2+blockW*(col+.5)+(offset?blockW*.5:0);
    const lo=-width/2+.015,hi=width/2-.015;
    const cx0=Math.max(lo,x-bw/2),cx1=Math.min(hi,x+bw/2),w=cx1-cx0,cx=(cx0+cx1)/2;
    if(w<.12)continue;
    const block=bevelBox(T,w,rowH-.03,.40,.022,2);
    const p=block.attributes.position;
    const chip=rand()<.3?Math.floor(rand()*p.count):-1;
    for(let i=0;i<p.count;i++){
     if(i===chip||i===chip+1){p.setXYZ(i,p.getX(i)+(rand()-.5)*.05,p.getY(i)-.03,p.getZ(i)+(rand()-.5)*.04);}
    }
    block.translate(cx,y,0);
    maskAttr(T,block,(a,o,px,py,pz,n,i)=>{
     const localX=px-cx,localY=py-y;
     const edge=Math.max(Math.abs(localX)/(w/2),Math.abs(localY)/(rowH/2));
     a[o]=Math.max(0,edge-.72)*2.2;                       // mortar-line cavity dirt
     a[o+1]=Math.max(0,edge-.86)*3+(n.getY(i)>.5?.25:0);  // arris wear + top dust
     a[o+2]=Math.max(0,1-py/1.1)*.9;                      // rising damp / moss zone
    });
    parts.push(worldUV(T,block,x,y,rand()*.6));
   }
  }
  return merge(T,parts);
 }

 // Roman column with entasis, flutes, base moulding and capital; pivot at foot.
 function column(T,h=4.6,r=.33,seed=3){
  const rand=rng(seed),parts=[];
  const plinth=bevelBox(T,r*2.9,.30,r*2.9,.03,3);plinth.translate(0,.15,0);
  maskAttr(T,plinth,(a,o,x,y)=>{a[o]=.3;a[o+1]=.35;a[o+2]=Math.max(0,1-y/.6);});
  parts.push(worldUV(T,plinth,0,0,rand()*.5));
  const torus=new T.TorusGeometry(r*1.16,r*.20,8,24);torus.rotateX(Math.PI/2);torus.translate(0,.36,0);
  maskAttr(T,torus,(a,o,x,y)=>{a[o]=.4;a[o+1]=.3;a[o+2]=Math.max(0,1-y/.7);});
  parts.push(worldUV(T,torus,0,0,rand()*.5));
  const shaftH=h-1.05,profile=[];
  for(let i=0;i<=10;i++){
   const t=i/10;
   profile.push(new T.Vector2(r*(1+.055*Math.sin(Math.PI*t))*(1-.16*t),.44+shaftH*t));
  }
  const shaft=new T.LatheGeometry(profile,24);
  const sp=shaft.attributes.position;
  for(let i=0;i<sp.count;i++){
   const x=sp.getX(i),z=sp.getZ(i),a=Math.atan2(z,x);
   const flute=1-.035*Math.pow(Math.max(0,Math.cos(a*20)),2);
   sp.setX(i,x*flute);sp.setZ(i,z*flute);
  }
  shaft.computeVertexNormals();
  maskAttr(T,shaft,(a,o,x,y,z,n)=>{
   const ang=Math.atan2(z,x);
   a[o]=Math.pow(Math.max(0,Math.cos(ang*20)),2)*.5;
   a[o+1]=.12;
   a[o+2]=Math.max(0,1-y/1.2)*.8;
  });
  parts.push(worldUV(T,shaft,0,0,rand()*.5));
  const echinus=new T.CylinderGeometry(r*1.34,r*.86,.26,24);echinus.translate(0,h-.48,0);
  const abacus=bevelBox(T,r*2.8,.20,r*2.8,.025,3);abacus.translate(0,h-.25,0);
  for(const g of [echinus,abacus]){maskAttr(T,g,(a,o,x,y)=>{a[o]=.22;a[o+1]=.5;a[o+2]=0;});parts.push(worldUV(T,g,0,0,rand()*.5));}
  return merge(T,parts);
 }

 // Cornice / parapet cap with beveled drip edge; pivot at centre.
 function cap(T,w,h,d,seed=5,r=Math.min(.03,h*.3)){
  const rand=rng(seed);
  const g=bevelBox(T,w,h,d,r,3,true);
  maskAttr(T,g,(a,o,x,y,z,n,i)=>{a[o]=n.getY(i)<-.5?.5:.1;a[o+1]=n.getY(i)>.5?.45:.15;a[o+2]=0;});
  return worldUV(T,g,0,0,rand()*.6);
 }

 // Walkable tread with a worn nose; pivot at centre of the step volume.
 function step(T,w,h,d,seed=9){
  const rand=rng(seed);
  const g=bevelBox(T,w,h,d,Math.min(.008,h*.3),3,true);
  maskAttr(T,g,(a,o,x,y,z,n,i)=>{
   a[o]=.15;a[o+1]=(n.getY(i)>.5&&z>d*.2)?.6:.15;a[o+2]=Math.max(0,-y/h)*.5;
  });
  return worldUV(T,g,0,0,rand()*.6);
 }

 // Mask-driven weathering over the shared PBR stone maps. Works on authored
 // geometry and on loaded glTF materials alike (KTX2 maps stay bound).
 function applyMaskShader(material){
  if(material.userData.kitMask)return material;
  material.userData.kitMask=true;
  const baseKey=material.customProgramCacheKey?.()??'kit';
  material.customProgramCacheKey=()=>baseKey+'-kitmask-1';
  const inner=material.onBeforeCompile;
  material.onBeforeCompile=(shader,renderer)=>{
   inner?.(shader,renderer);
   shader.vertexShader=shader.vertexShader
    .replace('#include <common>',`#include <common>
      attribute vec3 aMask;varying vec3 vKitMask;varying float vKitY;varying vec3 vKitWorld;`)
    .replace('#include <begin_vertex>',`#include <begin_vertex>
      vKitMask=aMask;vKitY=position.y;
      vec4 kitPoint=vec4(transformed,1.);
      #ifdef USE_INSTANCING
        kitPoint=instanceMatrix*kitPoint;
      #endif
      vKitWorld=(modelMatrix*kitPoint).xyz;`);
   shader.fragmentShader=shader.fragmentShader
    .replace('#include <common>',`#include <common>
      varying vec3 vKitMask;varying float vKitY;varying vec3 vKitWorld;
      float kitHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float kitNoise(vec2 p){vec2 c=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(kitHash(c),kitHash(c+vec2(1.,0.)),f.x),mix(kitHash(c+vec2(0.,1.)),kitHash(c+vec2(1.,1.)),f.x),f.y);}`)
    .replace('#include <color_fragment>',`#include <color_fragment>
      float kitMacro=kitNoise(vKitWorld.xz*.33);
      float kitMoss=vKitMask.b*smoothstep(1.05,.12,vKitY)*(.45+.55*kitMacro);
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.60,.67,.47),clamp(kitMoss,0.,.7));
      diffuseColor.rgb*=1.-vKitMask.r*.30;
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.14+vec3(.030,.027,.019),vKitMask.g*.45);
      diffuseColor.rgb*=.93+.14*kitMacro;`)
    .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+kitMoss*.12-vKitMask.g*.08,.3,1.);`);
  };
  return material;
 }

 const matCache=new WeakMap();
 function material(T,lite=false){
  let byTier=matCache.get(T);
  if(!byTier){byTier=new Map();matCache.set(T,byTier);}
  const key=lite?'lite':'full';
  if(byTier.has(key))return byTier.get(key);
  const get=root.WitnessQ01?.surfaces(T,lite);
  const m=get?get('stone','#dfd0b2'):new T.MeshStandardMaterial({color:'#dfd0b2',roughness:.92});
  const clone=m.clone();clone.name='kit-limestone';
  applyMaskShader(clone);
  byTier.set(key,clone);
  return clone;
 }

 // Mesh for one physics part, sized to its collider envelope.
 function partMesh(T,part,lite=false){
  const w=part.max[0]-part.min[0],h=part.max[1]-part.min[1],d=part.max[2]-part.min[2];
  const x=(part.min[0]+part.max[0])/2,y=(part.min[1]+part.max[1])/2,z=(part.min[2]+part.max[2])/2;
  let g,dims=null;
  if(part.kind==='step')g=step(T,w,h,d,part.id.length*13);
  // Walkable slabs (floor and roof ceilings) keep a tiny arris so the rendered
  // top stays within the physics plane tolerance even at the slab edge.
  else if(part.kind==='ceiling'||part.kind==='floor')g=cap(T,w,h,d,part.id.length*7,Math.min(.008,h*.3));
  else if(part.kind==='guard')g=bevelBox(T,w,h,d,Math.min(.02,w*.2,h*.2),2);
  else{
   const horiz=Math.max(w,d),thick=Math.min(w,d),yaw=d>w?Math.PI/2:0;
   g=ashlarWall(T,part.id.length*31+5,horiz,h);
   g.scale(1,1,thick/.4);
   if(yaw)g.rotateY(yaw);
   dims={horiz,thick,h,yaw};
  }
  const m=new T.Mesh(g,material(T,lite));
  m.name='kit-'+part.id;m.position.set(x,part.kind==='wall'?part.min[1]:y,z);
  if(part.kind==='wall'){m.userData.kitWall=true;m.userData.kitDims=dims;}
  m.castShadow=m.receiveShadow=true;
  return m;
 }

 let activeMounted=null;
 // Upgrade authored walls to the compressed .glb kit when the loader is live.
 async function mountGLB({T,scene,group,quality}){
  if(!root.WitnessKit||!root.AdventureVisuals)return null;
  if(root.WitnessKitOfflineQuality&&!root.WitnessKitAssets?.['assets/environment-kit/arch/manifest-v2.json'])return null;
  const renderer=root.AdventureVisuals.getRenderer?.();
  if(!renderer)return null;
  const walls=[];
  group.traverse(o=>{if(o.isMesh&&o.userData.kitWall&&!o.userData.kitReplaced)walls.push(o);});
  if(!walls.length)return null;
  try{
   const kit=root.WitnessKit.init(T,renderer);
   const scope=kit.createScope(scene);
   const transforms=[];
   for(const m of walls){
    const {horiz,thick,h,yaw}=m.userData.kitDims;
    const n=Math.max(1,Math.round(horiz/4)),seg=horiz/n;
    for(let i=0;i<n;i++){
     const off=-horiz/2+seg*(i+.5);
     transforms.push({position:[m.position.x+(yaw?0:off),m.position.y,m.position.z+(yaw?off:0)],
       yaw,scale:[seg/4,h/3,thick/.4]});
    }
   }
   const mounted=await scope.mount('./assets/environment-kit/arch/manifest-v2.json',{quality:quality==='balanced'?'lite':'full',transforms});
   if(!group.parent){mounted.release();scope.close();return null;}
   activeMounted?.release();activeMounted=mounted;
   const model=mounted.models[0];
   if(model?.mesh){
    model.mesh.traverse(o=>{
     if(!o.isMesh)return;
     if(o.geometry.attributes.color&&!o.geometry.attributes.aMask){
      o.geometry.setAttribute('aMask',o.geometry.attributes.color);
      o.geometry.deleteAttribute('color');
     }
     // COLOR_0 carries the weathering mask, not a tint: disable vertex colours.
     o.material.vertexColors=false;
     o.material=applyMaskShader(o.material);
     o.material.needsUpdate=true;
     o.castShadow=o.receiveShadow=true;
    });
    for(const wall of walls){wall.visible=false;wall.userData.kitReplaced=true;}
    group.add(model.mesh);
    group.userData.kitMounted=mounted;
   }
   return mounted;
  }catch(error){
   if(error.name!=='AbortError')console.warn('Witness modular kit GLB unavailable, authored kit retained:',error.message);
   return null;
  }
 }
 function releaseMounted(){activeMounted?.release();activeMounted=null;}

 root.WitnessModularKit={ashlarWall,column,cap,step,material,applyMaskShader,partMesh,mountGLB,releaseMounted,bevelBox,merge,worldUV,maskAttr};
 if(typeof module!=='undefined')module.exports=root.WitnessModularKit;
})(globalThis);