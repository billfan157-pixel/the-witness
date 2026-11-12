(function(root){
 'use strict';
 // Phase B: authored Caesarea reconstruction [H]. Archaeological constraints
 // and comparison textures are recorded in research/q01-phase-b-materials.md.
 const VERSION='q01-phase-b-1';
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const shore=x=>-25.9+1.15*Math.sin((x+8)*.072)+.42*Math.sin(x*.23);
 const lamps=[{at:[-26.55,.98,-13.85],power:4.5},{at:[-24.18,2.05,-9.32],power:4.5},{at:[-21.1,1.77,-15.4],power:4.0}];
 const hash=(x,z=0)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
 const workingRoutes=[[-23,6.4,-10,6],[-10,6,-5,-1],[-5,-1,8,4],[8,4,15,-6],[15,-6,20,7],[0,20,-10,6]];
 function routeDistance(x,z){let best=100;for(const [ax,az,bx,bz]of workingRoutes){const t=clamp(((x-ax)*(bx-ax)+(z-az)*(bz-az))/((bx-ax)**2+(bz-az)**2));best=Math.min(best,Math.hypot(x-ax-t*(bx-ax),z-az-t*(bz-az)));}return best;}
 const clear=(x,z)=>(Math.abs(x)<39&&z>shore(x)-3&&z<32)||routeDistance(x,z)<2.6;
 function clearVolume(x,z,r=0){if(clear(x,z))return true;for(let i=0;i<8;i++){const a=i*Math.PI/4;if(clear(x+Math.cos(a)*(r+.32),z+Math.sin(a)*(r+.32)))return true;}return false;}
 function terrain(ground){
  const p=ground.geometry.attributes.position,s=ground.geometry.attributes.terrainSplat;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getZ(i),d=z-shore(x),w=clamp((43-Math.abs(x))/5)*clamp((37-z)/5);
   // One gently graded urban platform, including the space behind the camera.
   // Feather only beyond the playable port: isolated level pads made steep banks.
   const land=.10+(z+10)*.006+.009*Math.sin(x*.27)*Math.sin(z*.31);
   const target=d>=0?land:-.12-Math.min(-d,18)*.25;
   p.setY(i,p.getY(i)*(1-w)+target*w);
   if(s){const road=clamp((3.2-routeDistance(x,z))/1.8),weights=d<0?[.33,.44,0,.23]:[.28+.04*road,.44+.04*road,0,.28-.08*road];for(let c=0;c<4;c++)s.array[i*4+c]=s.array[i*4+c]*(1-w)+weights[c]*w;}
  }
  p.needsUpdate=true;if(s)s.needsUpdate=true;ground.geometry.computeVertexNormals();ground.geometry.computeBoundingSphere();
 }
 // Each link is swept with the same capsule/support solver as real movement.
 // Node-only grids can put a narrow trunk between two individually clear nodes.
 function findPath(from,to,{allowed,sweep,range=.18,bounds=[-38,38,-29,32],accept=()=>true}={}){
  const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  if(sweep(from,to))return [to];
  const step=.5,key=p=>Math.round(p[0]/step)+','+Math.round(p[1]/step),nodes=new Map(),heap=[];
  const push=n=>{heap.push(n);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p;}heap[i]=n;};
  const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;};
  const start={p:from,g:0,f:dist(from,to),prev:null};push(start);let found;
  for(let count=0;heap.length&&count<26000;count++){
   const n=pop();if(n.closed)continue;n.closed=true;
   if(dist(n.p,to)<=Math.max(.08,range)&&accept(n.p)){found=n;break;}
   if(dist(n.p,to)<2.5&&sweep(n.p,to)){found={p:to,prev:n};break;}
   const gx=Math.round(n.p[0]/step)*step,gz=Math.round(n.p[1]/step)*step;
   for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
    const p=[gx+dx*step,gz+dz*step];if(p[0]<bounds[0]||p[0]>bounds[1]||p[1]<bounds[2]||p[1]>bounds[3]||!allowed(...p))continue;
    const k=key(p),old=nodes.get(k),g=n.g+dist(n.p,p);if(old&&old.g<=g)continue;if(!sweep(n.p,p))continue;
    const next={p,g,f:g+dist(p,to),prev:n};nodes.set(k,next);if(old)old.closed=true;push(next);
   }
  }
  if(!found)return null;const raw=[];for(let n=found;n?.prev;n=n.prev)raw.unshift(n.p);
  const result=[];let at=from;for(let i=0;i<raw.length;){let j=raw.length-1;while(j>i&&!sweep(at,raw[j]))j--;result.push(raw[j]);at=raw[j];i=j+1;}return result;
 }
 let pendingSolids=[];
 function beginScene(){pendingSolids=[];}
 function addSolid(solid){pendingSolids.push(solid);}
 const sourceMaps=new WeakMap();
 function maps(T,lite){
  let all=sourceMaps.get(T);if(!all){all={};sourceMaps.set(T,all);}const tier=lite?'lite':'full';if(all[tier])return all[tier];
  const loader=new T.TextureLoader(),result={};
  for(const family of ['ashlar','rubble']){
   result[family]={};for(const channel of ['albedo','normal','orm']){
    const key=`architecture/phase-b/${tier}/${family}-${channel}.webp`,tex=loader.load(root.AdventureAssets?.[key]||'./assets/'+key);
    tex.colorSpace=channel==='albedo'?T.SRGBColorSpace:T.NoColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=4;tex.userData.sharedMap=true;result[family][channel]=tex;
   }
  }all[tier]=result;return result;
 }
 const roles={
  stone:{source:'ashlar',base:'stone',tint:'#d0bfa0',tile:1.25,rough:.83},
  rubble:{source:'rubble',base:'stone',tint:'#a99677',tile:1.7,rough:.96},
  plaster:{base:'plaster',tint:'#ddd1b7',tile:2,rough:.96},
  roof:{base:'plaster',tint:'#bcad91',tile:2,rough:.98},
  floor:{base:'floor',tint:'#b7aa91',tile:1.8,rough:.87},
  wood:{base:'wood',tint:'#ac9473',tile:1.8,rough:.84},
  rope:{base:null,tint:'#b39e77',tile:1,rough:.98},
  metal:{base:null,tint:'#514d43',tile:1,rough:.81},
  silt:{base:'plaster',tint:'#a89775',tile:2.7,rough:1}
 };
 const macroGLSL=`
 varying vec3 vQBWorld;uniform float qbBaseY;
 float qbHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float qbNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(qbHash(i),qbHash(i+vec2(1.,0.)),f.x),mix(qbHash(i+vec2(0.,1.)),qbHash(i+1.),f.x),f.y);}
 `;
 function finishMaterial(m,role){
  const metal=role==='metal',timber=role==='wood',paving=role==='floor',masonry=['stone','rubble'].includes(role);
  m.name='q01-b-'+role;m.userData.phaseB={version:VERSION,role};
  m.customProgramCacheKey=()=>VERSION+'-'+role;
  m.onBeforeCompile=shader=>{
   shader.uniforms.qbBaseY={value:m.userData.baseY??.2};
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vQBWorld;')
    .replace('#include <worldpos_vertex>',`#include <worldpos_vertex>\nvec4 qbWorld=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nqbWorld=instanceMatrix*qbWorld;\n#endif\nvQBWorld=(modelMatrix*qbWorld).xyz;`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+macroGLSL)
    .replace('#include <color_fragment>',`#include <color_fragment>
     float qbMacro=qbNoise(vQBWorld.xz*.22+vQBWorld.y*.13),qbPatch=qbNoise(vQBWorld.xz*1.17+vQBWorld.y*.61);
     float qbDamp=(1.-smoothstep(qbBaseY-.08,qbBaseY+.7,vQBWorld.y))*(.35+.65*qbPatch);
     float qbWear=${paving?'exp(-pow((vQBWorld.x+23.)/1.05,2.))*.6':'0.'};
     diffuseColor.rgb*=mix(vec3(.90,.88,.84),vec3(1.07,1.05,1.01),qbMacro);
     diffuseColor.rgb*=1.-qbDamp*${timber?'.19':masonry?'.22':'.10'};
     ${masonry?'float qbSalt=exp(-pow((vQBWorld.y-.34)/.12,2.))*.10*qbPatch;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.69,.65,.53),qbSalt);':''}
     ${timber?'diffuseColor.rgb*=.94+.08*qbPatch;':''}`)
    .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor-qbDamp*.12-qbWear*.08,${metal?'.58':'.61'},1.);`);
  };return m;
 }
 function materials(T,lite,base){
  const cache=new Map();let textures;
  return (role='plaster',color)=>{
   if(!roles[role])role='stone';const spec=roles[role],key=role+'|'+(color||'');if(cache.has(key))return cache.get(key);
   const m=spec.base?base(spec.base,'#ffffff').clone():new T.MeshStandardMaterial();
   if(spec.source){textures??=maps(T,lite);const d=textures[spec.source];m.map=d.albedo;m.normalMap=d.normal;m.roughnessMap=m.aoMap=m.metalnessMap=d.orm;}
   // Small palette variation preserves one regional family; it never changes a material's role.
   const tint=new T.Color(spec.tint);if(color)tint.lerp(new T.Color(color),.12);m.color.copy(tint);m.roughness=spec.base?1:spec.rough;m.metalness=role==='metal'?.35:0;
   if(m.normalScale)m.normalScale.setScalar(role==='wood'?.22:role==='rubble'?.40:role==='stone'?.25:.15);
   m.userData={q01Material:spec.base||role,tileMeters:spec.tile};finishMaterial(m,role);cache.set(key,m);return m;
  };
 }
 function geometry(T,w,h,d,r=.014){
  r=Math.min(r,w*.15,h*.15,d*.15);const g=new T.BoxGeometry(w,h,d,3,3,3),p=g.attributes.position,n=g.attributes.normal;
  g.setAttribute('qbProjection',n.clone());
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),cx=clamp(x,-w/2+r,w/2-r),cy=clamp(y,-h/2+r,h/2-r),cz=clamp(z,-d/2+r,d/2-r),dx=x-cx,dy=y-cy,dz=z-cz,len=Math.hypot(dx,dy,dz)||1;
   // Walkable caps keep the full authored footprint. Rounding their X/Z rim
   // left millimetre-wide unsupported strips at otherwise valid stair points.
   if(y>h/2-r)p.setXYZ(i,x,h/2,z);else p.setXYZ(i,cx+dx/len*r,cy+dy/len*r,cz+dz/len*r);
   if(n.getY(i)>.5)n.setXYZ(i,0,1,0);else n.setXYZ(i,dx/len,dy/len,dz/len);
  }return g;
 }
 function uv(T,g,x=0,y=0,z=0,tile=1.25){
  const p=g.attributes.position,n=g.attributes.qbProjection||g.attributes.normal,u=g.attributes.uv;
  for(let i=0;i<p.count;i++){const a=p.getX(i)+x,b=p.getY(i)+y,c=p.getZ(i)+z;
   if(Math.abs(n.getY(i))>.55)u.setXY(i,a/tile,c/tile);else if(Math.abs(n.getX(i))>.55)u.setXY(i,c/tile,b/tile);else u.setXY(i,a/tile,b/tile);
  }g.setAttribute('uv1',u.clone());g.deleteAttribute('qbProjection');return g;
 }
 function box(T,parent,get,role,x,y,z,w,h,d,name,seed=0){
  const spec=roles[role],g=uv(T,geometry(T,w,h,d),x,y,z,spec?.tile||1.8),m=new T.Mesh(g,get(role));
  m.position.set(x,y,z);m.name='q01-b-'+name;m.castShadow=m.receiveShadow=true;parent.add(m);return m;
 }
 function batchStatic(T,group){
  group.updateMatrixWorld(true);const meshes=[];group.traverse(o=>{if(o.isMesh&&o.name!=='q01-oil-flame')meshes.push(o);});
  for(const mesh of meshes)if(mesh.parent!==group)group.attach(mesh);
  root.WitnessQ01.batch(T,group);
 }
 function partMesh(T,p,lite,sharedGet){
  const get=sharedGet||root.WitnessQ01.surfaces(T,lite),w=p.max[0]-p.min[0],h=p.max[1]-p.min[1],d=p.max[2]-p.min[2],x=(p.min[0]+p.max[0])/2,y=(p.min[1]+p.max[1])/2,z=(p.min[2]+p.max[2])/2;
  const group=new T.Group();group.name='q01-b-part-'+p.id;
  if(p.kind!=='wall'){
   const role=p.kind==='floor'||p.kind==='step'?'floor':p.kind==='guard'?'wood':'roof';box(T,group,get,role,x,y,z,w,h,d,p.id);return group;
  }
  const alongX=w>d,length=Math.max(w,d),thick=Math.min(w,d),seed=p.id.length*31;
  // The backing and all render faces stay inside the original physical envelope.
  box(T,group,get,'rubble',x,y,z,alongX?w:thick*.92,h,alongX?thick*.92:d,'masonry-core');
  const parapet=p.id.startsWith('parapet'),header=p.id==='lintel'||h<1.1,course=parapet?.30:.34,rows=parapet||header?Math.ceil(h/course):2;
  for(let row=0;row<rows;row++){
   const rh=Math.min(course,h-row*course);if(rh<=0)continue;
   const count=Math.ceil(length/.82),unit=length/count,offset=row%2?unit/2:0;
   for(let col=-1;col<count;col++){
    const raw=-length/2+col*unit+offset,lo=Math.max(-length/2,raw),hi=Math.min(length/2,raw+unit);if(hi-lo<.05)continue;
    const at=(lo+hi)/2,bw=hi-lo-.012,by=p.min[1]+row*course+rh/2;
    box(T,group,get,'stone',x+(alongX?at:0),by,z+(alongX?0:at),alongX?bw:thick,rh-.009,alongX?thick:bw,'ashlar-course');
   }
  }
  if(!parapet&&!header){
   for(const side of [-1,1]){
    const vertices=[],uvs=[],ids=[],steps=Math.max(3,Math.ceil(length/.32));
    for(let i=0;i<=steps;i++){
     const u=-length/2+length*i/steps,low=p.min[1]+.54+.075*Math.sin(i*1.23+seed)+.032*Math.cos(i*2.71);
     for(const py of [low,p.max[1]-.006]){vertices.push(x+(alongX?u:side*thick/2),py,z+(alongX?side*thick/2:u));uvs.push((u+x+z)/2,py/2);}
     if(i){const a=i*2;ids.push(a-2,a-1,a,a,a-1,a+1);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setAttribute('uv1',g.attributes.uv.clone());g.setIndex(ids);g.computeVertexNormals();
    const material=get('plaster');material.side=T.DoubleSide;const m=new T.Mesh(g,material);m.name='q01-b-lime-plaster';m.castShadow=m.receiveShadow=true;group.add(m);
   }
  }batchStatic(T,group);return group;
 }
 function doorLeaf({T,group,get,x,y,z}){
  for(let i=0;i<7;i++)box(T,group,get,'wood',x-.69+(i+.5)*1.38/7,y+1.08,z,1.38/7-.008,2.13,.095,'door-board');
  for(const dy of [.24,1.04,1.88])box(T,group,get,'wood',x,y+dy,z-.062,1.28,.095,.035,'door-cross-batten');
  for(const dy of [.34,1.7]){
   box(T,group,get,'metal',x,y+dy,z+.06,1.22,.045,.022,'forged-strap');
   for(const dx of [-.53,0,.53]){const n=new T.Mesh(new T.SphereGeometry(.015,7,5),get('metal'));n.position.set(x+dx,y+dy,z+.076);group.add(n);}
  }
  const ring=new T.Mesh(new T.TorusGeometry(.055,.009,6,18),get('metal'));ring.position.set(x+.42,y+1.03,z+.085);group.add(ring);
 }
 function house({T,parent,height,x,z,w,d,h,lite}){
  const get=root.WitnessQ01.surfaces(T,lite),g=new T.Group(),base=height(x,z);g.name='q01-b-closed-store';parent.add(g);
  addSolid({id:'q01-store-'+x+','+z,min:[x-w/2-.19,base-.3,z-d/2-.19],max:[x+w/2+.19,base+h+.45,z+d/2+.26],kind:'closed-store'});
  for(const [id,cx,cz,bw,bd]of [['front',x,z+d/2,w,.38],['back',x,z-d/2,w,.38],['west',x-w/2,z,.38,d],['east',x+w/2,z,.38,d]])g.add(partMesh(T,{id:'closed-'+id,kind:'wall',min:[cx-bw/2,base,cz-bd/2],max:[cx+bw/2,base+h,cz+bd/2]},lite,get));
  box(T,g,get,'rubble',x,base-.62,z,w+.18,1.35,d+.18,'closed-store-footing');
  box(T,g,get,'roof',x,base+h+.07,z,w+.24,.22,d+.24,'flat-roof');
  for(const side of [-1,1])box(T,g,get,'stone',x,base+h+.31,z+side*d/2,w+.20,.26,.34,'roof-coping');
  const front=z+d/2+.20;box(T,g,get,'wood',x,base+1.10,front,1.48,2.17,.07,'closed-door');
  for(let i=0;i<7;i++)box(T,g,get,'wood',x-.74+(i+.5)*1.48/7,base+1.1,front+.04,1.48/7-.009,2.14,.045,'closed-door-plank');
  box(T,g,get,'stone',x,base+2.30,front,1.88,.20,.20,'dressed-door-head');
  for(const sx of [-1,1]){
   box(T,g,get,'stone',x+sx*.86,base+1.1,front,.18,2.2,.20,'dressed-jamb');
   box(T,g,get,'wood',x+sx*w*.3,base+2.65,front-.015,.60,.74,.06,'recessed-shutter');
   for(let i=0;i<4;i++)box(T,g,get,'wood',x+sx*w*.3-.26+i*.17,base+2.65,front+.03,.10,.72,.045,'shutter-slat');
  }
  for(let i=0;i<Math.ceil(w/1.7);i++)box(T,g,get,'wood',x-w*.42+i*w*.84/Math.max(1,Math.ceil(w/1.7)-1),base+h-.13,front,.13,.19,.48,'roof-beam-end');
  batchStatic(T,g);return g;
 }
 function bakeBoxes(ar){
  const boxes=ar.parts.map(p=>({id:p.id,min:p.min.map((v,i)=>i===1?v-ar.base:v),max:p.max.map((v,i)=>i===1?v-ar.base:v),albedo:p.kind==='guard'?[.29,.21,.13]:p.kind==='ceiling'?[.47,.40,.29]:p.kind==='floor'||p.kind==='step'?[.37,.32,.24]:[.63,.57,.44]}));
  const add=(id,x,y,z,w,h,d,albedo)=>boxes.push({id,min:[x-w/2,y,z-d/2],max:[x+w/2,y+h,z+d/2],albedo});
  for(const z of [-11.25,-13.45,-15.65])add('beam',-24.05,2.78,z,6.3,.20,.17,[.26,.18,.10]);
  add('bench',-26.55,0,-14.4,1.04,.88,1.8,[.32,.23,.14]);add('dunnage',-25.8,0,-12,.95,.36,2.5,[.30,.21,.13]);add('amphorae',-26.5,.1,-12,1.15,.9,2.5,[.39,.21,.11]);
  // A ground receiver outside the entrance provides warm reflected daylight.
  add('yard',-23,-.14,-4,24,.08,13,[.44,.37,.25]);
  return boxes;
 }
 function install({T,scene,height,architecture,state,group:finishGroup}){
  const group=new T.Group();group.name='q01-phase-b-environment';scene.add(group);
  const lite=state.settings.graphics==='balanced'||!!root.WitnessKitOfflineQuality,get=root.WitnessQ01.surfaces(T,lite),base=architecture.base;
  architecture.solids.push(...pendingSolids);
  // Staggered paving breaks up at the sand edge instead of ending in a rectangle.
  for(let row=0;row<18;row++)for(let col=0;col<5;col++){
   const x=-25.2+col*.83+(row%2)*.35,z=-8.8+row*.78,edge=col===0||col===4;
   if(edge&&hash(row,col)<.40)continue;
   const w=.72+hash(row+2,col)*.06,d=.64+hash(row,col+2)*.07,g=new T.PlaneGeometry(w,d,2,2);g.rotateX(-Math.PI/2);
   const p=g.attributes.position,u=g.attributes.uv;for(let i=0;i<p.count;i++){const px=x+p.getX(i),pz=z+p.getZ(i);p.setXYZ(i,px,height(px,pz)+.012,pz);u.setXY(i,px/1.8,pz/1.8);}g.computeVertexNormals();g.setAttribute('uv1',u.clone());const m=new T.Mesh(g,get('floor'));m.name='q01-b-worn-approach';m.receiveShadow=true;group.add(m);
  }
  // Finished threshold and stone-to-earth fillets touch the actual ground.
  for(const x of [-25.8,-23.1]){
   for(const sx of [-1,1])box(T,group,get,'wood',x+sx*.51,base+2.45,-17.19,.055,.60,.055,'vent-jamb');
   for(const y of [2.15,2.75])box(T,group,get,'wood',x,base+y,-17.19,1.08,.055,.065,'vent-lintel');
  }
  box(T,group,get,'stone',-23,base-.014,-9.38,1.90,.035,.34,'threshold');
  for(const p of architecture.parts.filter(p=>p.kind==='wall'&&!p.id.startsWith('parapet'))){
   const x=(p.min[0]+p.max[0])/2,z=(p.min[2]+p.max[2])/2,w=p.max[0]-p.min[0],d=p.max[2]-p.min[2];
   box(T,group,get,'rubble',x,base-.035,z,w+.08,.08,d+.08,'wall-ground-fillet');
  }
  // Curved, jointed quay: pale cap, weathered ashlar face and rough sea-side footing.
  const seaSolids=[];
  for(let x=-35;x<35;x+=1.4){
   const z=shore(x+.7),yaw=Math.atan2(shore(x+1.4)-shore(x),1.4),y=height(x+.7,z+.75);
   const segment=new T.Group();segment.position.set(x+.7,0,z);segment.rotation.y=-yaw;group.add(segment);
   box(T,segment,get,'rubble',0,-.48,0,1.43,.8,.70,'quay-footing');
   for(let row=0;row<2;row++)box(T,segment,get,'stone',0,-.31+row*.25,0,1.39,.245,.62,'quay-face');
   box(T,segment,get,'stone',0,y+.025,.30,1.40,.08,.94,'quay-cap');
   // This edge is a solid sea boundary, not an unmarked drop into unplayable water.
   seaSolids.push({id:'q01-quay-edge-'+x,min:[x-.02,-1,z-.48],max:[x+1.43,1.0,z-.12],kind:'sea-boundary'});
  }
  architecture.solids.push(...seaSolids);
  architecture.surfaces.push({id:'q01-quay',rect:[-35,35,-29,-22],contains:(x,z)=>z>=shore(x)+.15&&z<=shore(x)+.77,y:x=>height(x,shore(x)+.75)+.065});
  // Small traffic-polished stones and packed-earth margins continue through
  // the actual quest route, not just the west-store camera composition.
  for(const [leg,route]of workingRoutes.entries()){
   const [ax,az,bx,bz]=route,len=Math.hypot(bx-ax,bz-az),nx=-(bz-az)/len,nz=(bx-ax)/len;
   for(let i=1;i<len/.95;i++){
    if(hash(i,leg)<.25)continue;const t=i*.95/len,side=hash(i+41,leg)<.5?-1:1,x=ax+(bx-ax)*t+nx*side*(.7+hash(i+9,leg)*.7),z=az+(bz-az)*t+nz*side*(.7+hash(i+9,leg)*.7);
    const m=box(T,group,get,'floor',x,height(x,z)-.015,z,.36+hash(i,leg)*.25,.05,.42+hash(i+3,leg)*.17,'road-edge-stone');m.rotation.y=hash(i+5,leg)*.4;
   }
  }
  // Contact dressing stays outside the free walking lane. Larger piles have
  // matching controller/camera volumes; tiny sherds remain passable.
  const sackMat=root.AdventureVisuals.surface(new T.MeshStandardMaterial({color:'#a9997c',roughness:.98}),'linen');
  for(const [i,x,z]of [[0,-27.3,1.2],[1,-27.65,1.5],[2,-27.2,1.8],[3,10.8,6.8]]){
   const y=height(x,z),g=new T.SphereGeometry(1,20,12),p=g.attributes.position;
   for(let k=0;k<p.count;k++){const py=p.getY(k),r=.25+.03*Math.sin(p.getX(k)*11+i);p.setXYZ(k,p.getX(k)*r,Math.max(-.30,py*.42),p.getZ(k)*r*.83);}g.computeVertexNormals();
   const m=new T.Mesh(g,sackMat);m.name='q01-b-sewn-freight-sack';m.position.set(x,y+.31,z);m.castShadow=m.receiveShadow=true;group.add(m);
   architecture.solids.push({id:'q01-b-sack-'+i,min:[x-.28,y,z-.25],max:[x+.28,y+.74,z+.25],kind:'prop'});
  }
  for(let i=0;i<95;i++){
   const x=-33+hash(i,7)*65,z=-22+hash(i,12)*35;if(routeDistance(x,z)<.85||x>-29&&x<-17&&z>-19&&z<-7||z<shore(x)+1.5)continue;
   const g=new T.DodecahedronGeometry(.035+hash(i,4)*.055,0);g.scale(1.4,.25,.72);const m=new T.Mesh(g,get(i%4?'rubble':'stone'));m.position.set(x,height(x,z)+.018,z);m.rotation.y=hash(i,11)*6.28;m.name='q01-b-contact-gravel';m.receiveShadow=true;group.add(m);
  }
  // Low mooring stones use the same weathering and datum as the quay.
  for(const x of [-31,-17,-1,15,29]){const z=shore(x)+.9,y=height(x,z);box(T,group,get,'stone',x,y+.16,z,.42,.32,.44,'mooring-stone');}
  // Door pivots, wall ends and stair hand contacts get geometry detail, not a tint stripe.
  for(const p of architecture.parts.filter(p=>p.id.startsWith('parapet'))){const x=(p.min[0]+p.max[0])/2,z=(p.min[2]+p.max[2])/2;box(T,group,get,'stone',x,p.max[1]-.035,z,p.max[0]-p.min[0],.07,p.max[2]-p.min[2],'dressed-coping');}
  // Additional interior lamp and a supporting niche shelf.
  box(T,group,get,'wood',-21.10,base+1.59,-15.4,.38,.075,.30,'interior-lamp-shelf');
  const clay=new T.MeshStandardMaterial({color:'#a26844',roughness:.90});root.AdventureVisuals.surface(clay,'clay');
  const lamp=new T.Mesh(new T.SphereGeometry(.065,16,8),clay);lamp.scale.set(1,.31,.72);lamp.position.set(-21.10,base+1.65,-15.4);group.add(lamp);
  const glow=new T.PointLight('#ffb974',state.settings.q01Lighting==='evening'?4:.14,3.6,2);glow.position.set(-21.10,base+1.77,-15.4);group.add(glow);
  const flame=new T.Mesh(new T.SphereGeometry(.007,8,6),new T.MeshBasicMaterial({color:'#ffd396',toneMapped:false}));flame.name='q01-oil-flame';flame.scale.y=2.2;flame.position.copy(glow.position);flame.position.y-=.08;flame.visible=state.settings.q01Lighting==='evening';group.add(flame);
  batchStatic(T,group);
  scene.userData.q01PhaseB={version:VERSION,artAccepted:false,shore:'authored curved quay / harbour bed [H]',materialRoles:Object.keys(roles),criticalViews:17,group};
  scene.userData.q01Exposure={outside:1.10,insideDay:2.35,insideEvening:1.45};
  installGI(T,scene,architecture,state);
  return group;
 }
 let activeGITexture=null,giGeneration=0;const originalMaterials=new WeakMap(),activeGIMaterials=new Set();
 function releaseGI(){for(const m of activeGIMaterials){const original=originalMaterials.get(m);if(original){m.onBeforeCompile=original.compile;m.customProgramCacheKey=()=>original.key;m.userData.q01StaticGI=false;m.needsUpdate=true;}}activeGIMaterials.clear();activeGITexture?.dispose();activeGITexture=null;}
 function installGI(T,scene,ar,state){
  const data=root.WitnessQ01GIData;if(!data)return;const generation=++giGeneration;
  const spec=data.scenarios[state.settings.q01Lighting==='evening'?'evening':'day'],bytes=Uint8Array.from(atob(spec.pixels),c=>c.charCodeAt(0));
  releaseGI();const tex=new T.DataTexture(bytes,data.grid[0]*9,data.grid[1]*data.grid[2],T.RGBAFormat);activeGITexture=tex;tex.minFilter=tex.magFilter=T.LinearFilter;tex.generateMipmaps=false;tex.colorSpace=T.NoColorSpace;tex.needsUpdate=true;
  const size=new T.Vector3(...data.grid),lo=new T.Vector3(data.min[0],data.min[1]+ar.base,data.min[2]),hi=new T.Vector3(data.max[0],data.max[1]+ar.base,data.max[2]),scales=spec.scales.map(s=>new T.Vector3(...s));
  const uniform={qbGIMap:{value:tex},qbGISize:{value:size},qbGIMin:{value:lo},qbGIMax:{value:hi},qbGIScale:{value:scales},qbGIEnabled:{value:1}};
  const shaders=[];
  const giCode=`uniform sampler2D qbGIMap;uniform vec3 qbGISize,qbGIMin,qbGIMax,qbGIScale[9];uniform float qbGIEnabled;
   vec3 qbCoefficient(vec3 p,int c){vec3 v=clamp((p-qbGIMin)/(qbGIMax-qbGIMin),0.,1.)*(qbGISize-1.);float z0=floor(v.z),z1=min(z0+1.,qbGISize.z-1.);vec2 a=vec2((float(c)*qbGISize.x+v.x+.5)/(qbGISize.x*9.),(z0*qbGISize.y+v.y+.5)/(qbGISize.y*qbGISize.z));vec2 b=vec2(a.x,(z1*qbGISize.y+v.y+.5)/(qbGISize.y*qbGISize.z));return (mix(texture2D(qbGIMap,a).rgb,texture2D(qbGIMap,b).rgb,fract(v.z))*2.-1.)*qbGIScale[c];}
   vec3 qbIrradiance(vec3 p,vec3 n){return max(vec3(0.),qbCoefficient(p,0)*.886227+qbCoefficient(p,1)*(1.023327*n.y)+qbCoefficient(p,2)*(1.023327*n.z)+qbCoefficient(p,3)*(1.023327*n.x)+qbCoefficient(p,4)*(.858086*n.x*n.y)+qbCoefficient(p,5)*(.858086*n.y*n.z)+qbCoefficient(p,6)*(.247708*(3.*n.z*n.z-1.))+qbCoefficient(p,7)*(.858086*n.x*n.z)+qbCoefficient(p,8)*(.429043*(n.x*n.x-n.y*n.y)));}
  `;
  const seen=new WeakSet(),bounds=new T.Box3(new T.Vector3(-27.25,ar.base,-17.25),new T.Vector3(-18.75,ar.roof,-9.48)),objectBox=new T.Box3(),actorPoint=new T.Vector3();let frames=0;
  function bind(){scene.updateMatrixWorld(true);scene.traverse(o=>{
   if(!o.isMesh||o.isInstancedMesh||o.geometry?.parameters?.width===156)return;
   let actor=o;while(actor.parent&&typeof actor.userData.heightAt!=='function')actor=actor.parent;
   if(typeof actor.userData.heightAt==='function'){actor.getWorldPosition(actorPoint);if(!bounds.containsPoint(actorPoint))return;}
   else{if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();objectBox.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);if(!objectBox.intersectsBox(bounds))return;}
   for(const m of [o.material].flat().filter(Boolean)){
   if(seen.has(m)||(!m.isMeshStandardMaterial&&!m.isMeshPhysicalMaterial))continue;seen.add(m);
   let original=originalMaterials.get(m);if(!original){original={compile:m.onBeforeCompile,key:m.customProgramCacheKey?.()||''};originalMaterials.set(m,original);}const previous=original.compile,key=original.key;m.customProgramCacheKey=()=>key+'-'+VERSION+'-gi-'+generation;
   m.userData.baseY=ar.base;m.userData.q01StaticGI=true;activeGIMaterials.add(m);
   m.onBeforeCompile=(shader,renderer)=>{previous?.(shader,renderer);Object.assign(shader.uniforms,uniform);
    if(!shader.vertexShader.includes('varying vec3 vQBWorld;')){shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vQBWorld;').replace('#include <worldpos_vertex>',`#include <worldpos_vertex>\nvec4 qbW=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nqbW=instanceMatrix*qbW;\n#endif\nvQBWorld=(modelMatrix*qbW).xyz;`);shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vQBWorld;');}
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+giCode).replace('#include <lights_fragment_maps>',`#include <lights_fragment_maps>
     float qbRoom=step(-27.235,vQBWorld.x)*step(vQBWorld.x,-18.765)*step(-17.235,vQBWorld.z)*step(vQBWorld.z,-9.475)*(1.-smoothstep(qbGIMax.y-.05,qbGIMax.y+.20,vQBWorld.y))*qbGIEnabled;
     if(qbRoom>.001){vec3 qbN=normalize(inverseTransformDirection(normal,viewMatrix));irradiance*=1.-qbRoom;iblIrradiance=mix(iblIrradiance,qbIrradiance(vQBWorld,qbN),qbRoom);radiance*=mix(1.,.22,qbRoom);}
    `);shaders.push(shader);
   };m.needsUpdate=true;
  }});}
  const old=scene.onBeforeRender;scene.onBeforeRender=function(...args){old?.apply(this,args);if(frames++%30===0)bind();};
  scene.userData.q01GI={baked:true,algorithm:data.algorithm,sourceHash:data.sourceHash,scenario:state.settings.q01Lighting||'day',probes:data.grid.reduce((a,b)=>a*b),bounces:data.bounces,raysPerProbe:data.raysPerProbe,textureBytes:bytes.length,shOrder:2,quantization:spec.maxQuantizationError,receivers:'warehouse geometry and actors inside; excludes terrain and vegetation'};
  scene.userData.q01GIDebug={setEnabled(on){uniform.qbGIEnabled.value=on?1:0;},texture:tex};
  scene.addEventListener('dispose',()=>tex.dispose());bind();
 }
 const api={VERSION,shore,clear,clearVolume,terrain,findPath,beginScene,addSolid,materials,partMesh,doorLeaf,house,install,bakeBoxes,lamps,releaseGI};
 root.WitnessQ01Environment=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
