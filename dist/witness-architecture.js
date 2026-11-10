(function(root){
 'use strict';
 // Original playable reconstruction [H]. Units are metres, Y up. No jump/parkour.
 const RADIUS=.29,HEIGHT=1.7,STEP=.22,DROP=.25,EPS=1e-5;
 const inside=(x,z,r,margin=0)=>x>=r[0]+margin&&x<=r[1]-margin&&z>=r[2]+margin&&z<=r[3]-margin;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
 const point=(x,y,z,supportId='world')=>({x,y,z,supportId});
 const family=id=>id?.startsWith('q01-roof')?'roof':id?.startsWith('q01-step')?'stairs':id==='q01-room'?'room':'world';
 function terrainSampler(mesh){
  const g=mesh.geometry,p=g.attributes.position,nx=g.parameters.widthSegments,nz=g.parameters.heightSegments,stride=nx+1;
  if(!nx||!nz||p.count!==stride*(nz+1))throw Error('Terrain sampler requires the regular authored terrain grid');
  const x0=p.getX(0),x1=p.getX(nx),z0=p.getZ(0),z1=p.getZ(nz*stride);
  return (x,z)=>{const u=Math.max(0,Math.min(nx-1e-8,(x-x0)/(x1-x0)*nx)),v=Math.max(0,Math.min(nz-1e-8,(z-z0)/(z1-z0)*nz)),ix=Math.floor(u),iz=Math.floor(v),fx=u-ix,fz=v-iz,a=ix+iz*stride;
   const ha=p.getY(a),hb=p.getY(a+stride),hc=p.getY(a+stride+1),hd=p.getY(a+1);
   return fx+fz<=1?ha+(hd-ha)*fx+(hb-ha)*fz:hc+(hb-hc)*(1-fx)+(hd-hc)*(1-fz);
  };
 }
 function create({height=()=>0,outdoorAllowed=()=>true}={}){
  const bounds=[-27.5,-18.5,-17.5,-9.5],base=height(-23,-9.25)+.12,roof=base+3.24,solids=[],surfaces=[],parts=[];
  function box(id,x,y,z,w,h,d,color='#c4b89e',kind='wall'){
   const b={id,min:[x-w/2,y-h/2,z-d/2],max:[x+w/2,y+h/2,z+d/2],kind};solids.push(b);parts.push({...b,color});return b;
  }
  function surface(id,r,y){surfaces.push({id,rect:r,y});}
  box('foundation',-23,base-.34,-13.5,9,.68,8,'#978b74','floor');surface('q01-room',[-27.22,-18.78,-17.22,-9.5],base);
  box('west-wall',-27.36,base+1.62,-13.5,.28,3.24,8);
  box('east-wall',-18.64,base+1.62,-13.5,.28,3.24,8);
  // Small high vents admit real daylight while remaining far too narrow/high
  // for a standing capsule. Their frames and proxy bake share these openings.
  box('back-wall-base',-23,base+1.075,-17.36,9,2.15,.28);
  box('back-wall-head',-23,base+2.995,-17.36,9,.49,.28);
  for(const [i,lo,hi]of [[0,-27.5,-26.325],[1,-25.275,-23.625],[2,-22.575,-18.5]])box('back-wall-pier-'+i,(lo+hi)/2,base+2.45,-17.36,hi-lo,.60,.28);
  box('door-left',-25.725,base+1.62,-9.64,3.55,3.24,.28);
  box('door-right',-20.275,base+1.62,-9.64,3.55,3.24,.28);
  box('lintel',-23,base+2.77,-9.64,1.9,.94,.28,'#ad9d80');
  // Three roof pieces leave a real opening over the complete stair flight.
  box('roof-main',-24.1,roof-.11,-13.5,6.8,.22,8,'#b9ad91','ceiling');surface('q01-roof-main',[-27.5,-20.7,-17.5,-9.5],roof);
  box('roof-back',-19.6,roof-.11,-16.775,2.2,.22,1.45,'#b9ad91','ceiling');surface('q01-roof-back',[-20.7,-18.5,-17.5,-16.05],roof);
  box('roof-front',-19.6,roof-.11,-10.075,2.2,.22,1.15,'#b9ad91','ceiling');surface('q01-roof-front',[-20.7,-18.5,-10.65,-9.5],roof);
  for(let i=0;i<18;i++){
   const y=base+(i+1)*.18,z=-10.65-(i+.5)*.3;
   box('step-'+i,-19.8,(base+y)/2,z,1.7,y-base,.3,'#b5a78d','step');surface('q01-step-'+i,[-20.65,-18.95,z-.15,z+.15],y);
  }
  // Roof parapets and well guard are physical, with a gap only at the top landing.
  for(const [id,x,z,w,d]of [['parapet-west',-27.36,-13.5,.28,8],['parapet-east',-18.64,-13.5,.28,8],['parapet-back',-23,-17.36,9,.28],['parapet-front',-23,-9.64,9,.28]])box(id,x,roof+.47,z,w,.94,d);
  box('well-guard',-20.77,roof+.45,-13.35,.14,.9,5.3,'#7c6750','guard');
  box('well-front-guard',-19.6,roof+.45,-10.62,2.2,.9,.12,'#7c6750','guard');
  for(let i=2;i<18;i++)box('stair-rail-'+i,-20.67,base+(i+.5)*.18+.72,-10.65-(i+.5)*.3,.10,.15,.32,'#7c6750','guard');
  solids.push({id:'drying-rack-volume',min:[-25.3,roof,-13.8],max:[-23.5,roof+1.25,-12.8],kind:'prop'});
  function supports(x,z){
   const out=surfaces.filter(s=>inside(x,z,s.rect)&&(!s.contains||s.contains(x,z))).map(s=>point(x,typeof s.y==='function'?s.y(x,z):s.y,z,s.id));
   if(!inside(x,z,bounds)&&!out.some(s=>s.supportId==='q01-quay'))out.push(point(x,height(x,z),z));return out;
  }
  function collides(p,r=RADIUS,h=HEIGHT){
   for(const b of solids){
    if(b.max[1]<=p.y+STEP+EPS||b.min[1]>=p.y+h-EPS)continue;
    const dx=p.x-Math.max(b.min[0],Math.min(b.max[0],p.x)),dz=p.z-Math.max(b.min[2],Math.min(b.max[2],p.z));
    const lower=p.y+r,upper=p.y+h-r,dy=b.max[1]<lower?lower-b.max[1]:b.min[1]>upper?b.min[1]-upper:0;
    if(dx*dx+dy*dy+dz*dz<(r-EPS)**2)return b.id;
   }return null;
  }
  function candidate(from,x,z){
   if(!outdoorAllowed(x,z))return null;
   return supports(x,z).filter(p=>p.y<=from.y+STEP+EPS&&p.y>=from.y-DROP-EPS).sort((a,b)=>Math.abs(a.y-from.y)-Math.abs(b.y-from.y)).find(p=>!collides(p))??null;
  }
  function move(from,dx,dz){
   let p={...from};const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.075));
   for(let i=0;i<count;i++){
    const sx=dx/count,sz=dz/count,next=candidate(p,p.x+sx,p.z+sz);
    if(next){p=next;continue;}
    const horizontal=candidate(p,p.x+sx,p.z);if(horizontal)p=horizontal;
    const vertical=candidate(p,p.x,p.z+sz);if(vertical)p=vertical;
   }return p;
  }
  function restore(saved,fallback){
   if(saved&&[saved.x,saved.y,saved.z].every(Number.isFinite)&&Math.abs(saved.x)<80&&Math.abs(saved.z)<80){
    const p=supports(saved.x,saved.z).find(p=>p.supportId===saved.supportId&&Math.abs(p.y-saved.y)<.24);
    if(p&&outdoorAllowed(p.x,p.z)&&!collides(p))return p;
   }
   const g=supports(fallback.x,fallback.z).filter(p=>p.supportId==='world'||p.supportId==='q01-room').find(p=>!collides(p));
   return g??point(-23,height(-23,-8.6),-8.6);
  }
  function lineBox(a,b,box,pad=0){
   let near=0,far=1;
   for(let axis=0;axis<3;axis++){
    const origin=[a.x,a.y,a.z][axis],delta=[b.x-a.x,b.y-a.y,b.z-a.z][axis],lo=box.min[axis]-pad,hi=box.max[axis]+pad;
    if(Math.abs(delta)<EPS){if(origin<lo||origin>hi)return null;continue;}
    let t0=(lo-origin)/delta,t1=(hi-origin)/delta;if(t0>t1)[t0,t1]=[t1,t0];near=Math.max(near,t0);far=Math.min(far,t1);if(near>far)return null;
   }return near;
  }
  function visible(a,b,ignoreId){return !solids.some(s=>{if(s.id===ignoreId)return false;const t=lineBox(a,b,s);return t!==null&&t>EPS&&t<1-EPS;});}
  function targetPoint(target){return point(target.at[0],Number.isFinite(target.floorY)?target.floorY:height(...target.at),target.at[1],target.surfaceId??'world');}
  function reachable(from,target){const to=targetPoint(target);return Math.abs(from.y-to.y)<1.05&&distance(from,to)<(target.range??2.5)&&visible({...from,y:from.y+1.3},{...to,y:to.y+.8},target.colliderId);}
  function camera(origin,wanted,radius=.18){
   let t=1;for(const s of solids){const hit=lineBox(origin,wanted,s,radius);if(hit!==null)t=Math.min(t,Math.max(0,hit-.018));}
   return point(origin.x+(wanted.x-origin.x)*t,origin.y+(wanted.y-origin.y)*t,origin.z+(wanted.z-origin.z)*t);
  }
  function walkLine(a,b){
   const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.075);let p=a;
   for(let i=1;i<=n;i++){const next=candidate(p,a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n);if(!next)return false;p=next;}
   return Math.abs(p.y-b.y)<.12;
  }
  const nodes=[point(-23,height(-23,-8.6),-8.6),point(-23,base,-10.25,'q01-room'),point(-23,base,-11.1,'q01-room'),point(-19.8,base,-10.25,'q01-room'),
   ...Array.from({length:18},(_,i)=>point(-19.8,base+(i+1)*.18,-10.65-(i+.5)*.3,'q01-step-'+i)),point(-19.8,roof,-16.6,'q01-roof-back'),point(-21.35,roof,-16.6,'q01-roof-main'),point(-24.4,roof,-14.45,'q01-roof-main')];
  function route(start,goal,planarPath){
   const all=[start,...nodes,goal],last=all.length-1,adj=all.map(()=>[]);
   function edge(a,b,path){if(!path?.length)return;const cost=path.reduce((n,p,i)=>n+distance(i?path[i-1]:all[a],p),0);adj[a].push({to:b,cost,path});}
   const outdoor=p=>family(p.supportId)==='world'&&!inside(p.x,p.z,[-29,-17,-18,-7]);
   for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
    if(outdoor(all[i])||outdoor(all[j]))continue;
    if(walkLine(all[i],all[j]))edge(i,j,[all[j]]);if(walkLine(all[j],all[i]))edge(j,i,[all[i]]);
   }
   for(const k of [0,last])if(outdoor(all[k])){
    const path=planarPath?.([all[k].x,all[k].z],[nodes[0].x,nodes[0].z]);
    if(path?.length){const points=path.map(at=>point(at[0],height(...at),at[1]));edge(k,1,points);edge(1,k,[...points].reverse().slice(1).concat(all[k]));}
   }
   if(outdoor(start)&&outdoor(goal)){const path=planarPath?.([start.x,start.z],[goal.x,goal.z]);if(path?.length)edge(0,last,path.map(at=>point(at[0],height(...at),at[1])));}
   const costs=all.map(()=>Infinity),previous=[],open=new Set([0]);costs[0]=0;
   while(open.size){let at=[...open].reduce((a,b)=>costs[a]<costs[b]?a:b);open.delete(at);if(at===last)break;
    for(const e of adj[at])if(costs[at]+e.cost<costs[e.to]){costs[e.to]=costs[at]+e.cost;previous[e.to]={from:at,path:e.path};open.add(e.to);}}
   if(!Number.isFinite(costs[last]))return null;const chunks=[];for(let at=last;at;at=previous[at].from)chunks.unshift(previous[at].path);return chunks.flat();
  }
  function groundClear(x,z){return !!candidate(point(x,inside(x,z,bounds)?base:height(x,z),z),x,z);}
  return {id:'Q01-WEST-STORE',base,roof,bounds,solids,surfaces,parts,nodes,supports,collides,move,restore,visible,reachable,targetPoint,camera,route,groundClear,walkLine,
   setOutdoorAllowed(fn){outdoorAllowed=fn;},height,
   contains:(x,z)=>inside(x,z,[-29,-17,-18,-7]),snapshot:()=>({id:'Q01-WEST-STORE',base,roof,surfaces:surfaces.length,solids:solids.length})};
 }
 function install({T,scene,height,outdoorAllowed,ground,state}){
  const physics=create({height,outdoorAllowed}),group=new T.Group();group.name='q01-playable-store';const materials=new Map();
  if(ground){const p=ground.geometry.attributes.position;for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getZ(i),r=physics.bounds,edge=Math.max(r[0]-x,x-r[1],r[2]-z,z-r[3]),weight=Math.max(0,Math.min(1,(1.5-edge)/1.5));
   if(weight>0)p.setY(i,p.getY(i)*(1-weight)+(physics.base-.06)*weight);
  }p.needsUpdate=true;ground.geometry.computeVertexNormals();ground.geometry.computeBoundingSphere();}
  const material=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.94}));return materials.get(color);};
  const lite=state?.settings?.graphics==='balanced'||!!root.WitnessKitOfflineQuality;
  const finish=root.WitnessQ01?.architectureMaterial(T,lite);
  const phaseB=root.WitnessQ01Environment?.enabled,phaseBMaterials=phaseB?root.WitnessQ01.surfaces(T,lite):null;
  function mesh(name,x,y,z,w,h,d,color,finishMaterial){const mat=finishMaterial||material(color),g=root.WitnessQ01?root.WitnessQ01.uvBox(T,w,h,d,x,y,z,mat.userData.tileMeters||2):new T.BoxGeometry(w,h,d);const m=new T.Mesh(g,mat);m.name=name;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m;}
  for(const p of physics.parts){
   if(phaseB){group.add(root.WitnessQ01Environment.partMesh(T,p,lite,phaseBMaterials));}
   else if(root.WitnessModularKit&&['wall','step','ceiling','floor'].includes(p.kind)){
    group.add(root.WitnessModularKit.partMesh(T,p,lite));
   }else mesh(p.id,(p.min[0]+p.max[0])/2,(p.min[1]+p.max[1])/2,(p.min[2]+p.max[2])/2,p.max[0]-p.min[0],p.max[1]-p.min[1],p.max[2]-p.min[2],p.color,finish?.(p));
  }
  if(root.WitnessModularKit&&!phaseB)root.WitnessModularKit.mountGLB({T,scene,group,quality:state?.settings?.graphics}).catch(()=>{});
  // An ordinary drying rack is inspectable upstairs; it grants no evidence or quest credit.
  for(const x of [-25.25,-23.55])for(const z of [-13.75,-12.85])mesh('rack-post',x,physics.roof+.6,z,.07,1.2,.07,'#745d43');
  for(let i=0;i<7;i++)mesh('drying-line',-24.4,physics.roof+1.18,-13.75+i*.15,1.7,.025,.025,'#ac9872');
  mesh('entry-lamp-bracket',-24.15,physics.base+1.8,-9.4,.12,.25,.4,'#745d43');
  group.userData={assetId:phaseB?'CAE-STORE-PB-05':'CAE-STORE-GOLD-04',evidence:'H',access:['interior','stairs','roof'],artAccepted:false};
  scene.add(group);physics.group=group;scene.userData.architecture=physics;return physics;
 }
 function targets(physics){return [{id:'architecture:store-entry',at:[-23,-8.65],floorY:physics?physics.height(-23,-8.65):0,surfaceId:'world',name:'Kho phía tây · Lối lên mái',range:2.3,elevation:1.1,symbol:'↗'},
  {id:'architecture:roof-rack',at:[-24.4,-13.3],approach:[-24.4,-14.45],colliderId:'drying-rack-volume',floorY:physics?.roof??3.24,surfaceId:'q01-roof-main',name:'Dây phơi trên mái',range:1.9,elevation:1.15,symbol:'○'}];}
 function describe(id){return id==='architecture:roof-rack'?{title:'Dây phơi trên mái',body:'Những sợi dây đã được căng lại giữa các cọc gỗ. Từ khoảng mái này, bạn nhìn thấy đường bến và lối mình vừa đi qua. Cầu thang ở góc đông đưa bạn trở lại căn phòng và cửa kho.'}:{title:'Kho phía tây',body:'Cửa kho mở ra một căn phòng thấp. Men theo tường phía đông tới chân cầu thang, bạn có thể đi lên sân mái rồi trở lại bằng chính lối ấy.'};}
 const api={create,install,terrainSampler,targets,describe,family,dimensions:{radius:RADIUS,height:HEIGHT,maxStep:STEP,maxDrop:DROP}};
 root.WitnessArchitecture=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
