(function(root){
 'use strict';
 // Q01 PR-04 spatial source [H]. Shared by the playable lab and PR-05's presenter.
 // Positions are metres / Y-up. Nothing here dispatches story events or writes saves.
 const VERSION='q01-greybox-pr04-1',MEZZ=2.52,ROOF=5.04,RISE=.18,RUN=.32;
 const P=(x,y,z,supportId='world')=>({x,y,z,supportId});
 const rect=(x,z,r)=>x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3];
 const colors={stone:'#a7afad',floor:'#b9bfba',wall:'#8d9798',wood:'#a48b6d',metal:'#657176',guard:'#647d80',mechanical:'#d6a961',manual:'#a78072',roof:'#9daea8',drain:'#738c95',water:'#436b7c'};
 const anchors={
  boat:P(-6,.18,-30,'q01-quay'),disembark:P(-6,0,-22),alley:P(-10,0,-9),stranger:P(-7,0,-3),follow:P(-3,0,-5),strangerGone:P(0,0,2),
  load:P(-10,0,6),ledger:P(-5,0,-1),titus:P(-24,0,-4),cart:P(-32,0,-3),rope:P(-29.4,0,-5.1),workers:P(-22,0,-1),lever:P(-18,0,-5.6),
  mainBottom:P(-17.7,0,-8.2,'q01-room'),sideBottom:P(-31,0,-7.5),
  mezzanine:P(-24.6,MEZZ,-16.5,'q01-mezzanine'),simeon:P(-25.8,MEZZ,-18,'q01-mezzanine'),apprentice:P(-24.2,MEZZ,-18,'q01-mezzanine'),
  commonDoor:P(-21.2,MEZZ,-13.6,'q01-mezzanine'),roofLanding:P(-21.2,ROOF,-19.7,'q01-roof-main'),
  reception:P(-24.4,ROOF,-17.5,'q01-roof-main'),lookout:P(-26.4,ROOF,-20.3,'q01-roof-main'),winch:P(-25.3,ROOF,-9.35,'q01-roof-main'),
  roofExit:P(-15.8,ROOF,-19.7,'q01-roof-main'),descentTop:P(-12,ROOF,-19.7,'q01-landing'),
  yosef:P(-4,0,-12),rest:P(-2,0,5),b06:P(-20.5,0,-5),meal:P(7,0,4),lodging:P(14,0,5),handoff:P(19,0,8),
  drainMouth:P(-34,0,7),drain:P(-34,-1.26,-1,'q01-drain'),rearAlley:P(-26,0,-23),smallBerth:P(-17,0,-23)
 };
 const beats=[
  {beat:0,title:'Một con thuyền cập bến',anchors:['boat','disembark'],purpose:'Ván xuống thuyền → C0; chốt bằng vị trí ngoài ván.'},
  {beat:1,title:'Người đứng trước cửa xưởng',anchors:['alley','stranger','follow','strangerGone'],purpose:'Hai nhánh theo tới góc rẽ / quan sát rồi quay về xưởng; góc khuất sau tường xưởng.'},
  {beat:2,title:'Natan và cuốn sổ chưa khô',anchors:['load','ledger'],purpose:'Khung Q01.LOAD độc lập; mặt bàn đủ chỗ cho sổ nguyên gáy và bìa hồ sơ rời.'},
  {beat:3,title:'Tiếng cháy phía tây',anchors:['titus','rope','lever'],purpose:'C0 nhìn được cả đường dây tời và xà lối chính; giữ đường từ xưởng.'},
  {beat:4,title:'Một đường tới hai người',anchors:['cart','workers','mezzanine','commonDoor','reception'],purpose:'Hai tuyến độc lập → C1 → kiểm mái → quay C1 → hộ tống hai người.'},
  {beat:5,title:'Một người rời hẻm',anchors:['lookout','rearAlley','smallBerth'],purpose:'Tầm nhìn qua lan can tới hẻm sau kho và bến nhỏ, không đọc mặt.'},
  {beat:6,title:'Yosef xin một chỗ nói nhỏ',anchors:['roofExit','yosef'],purpose:'Đường xuống C0 và khoảng kín dưới mái hiên, có lối rời hai phía.'},
  {beat:7,title:'Đặt phần việc và nhớ T05',anchors:['rest','meal','lodging'],purpose:'Trở lại xưởng, bàn/bếp, chỗ nghỉ, khoảng ngồi tĩnh cho chuyển đêm.'},
  {beat:8,title:'B06 và bàn giao',anchors:['b06','handoff'],purpose:'Bàn B06 ngoài vành kho, sáng sau tới bàn/bếp rồi cửa bàn giao.'}
 ];
 function blueprint(){
  const nodes=Object.values(anchors).map(p=>({...p}));
  const plan={id:VERSION,base:0,roof:ROOF,bounds:[-28.5,-14.5,-21,-7],spawn:anchors.boat,nodes,
   contains:(x,z)=>rect(x,z,[-36,-7,-22,10]),
   worldAt:(x,z)=>rect(x,z,[-36,25,-24,20])&&!rect(x,z,[-28.5,-14.5,-21,-7])&&!rect(x,z,[-35.1,-32.9,-4.5,6.5])};
  plan.populate=({box,surface,solids,parts})=>{
   function b(id,x,y,z,w,h,d,role='wall',kind='wall'){return box(id,x,y,z,w,h,d,colors[role],kind);}
   function slab(id,r,y,role='floor',supportId=id){b(id,(r[0]+r[1])/2,y-.09,(r[2]+r[3])/2,r[1]-r[0],.18,r[3]-r[2],role,'floor');surface(supportId,r,y);}
   function rail(id,x,y,z,w,d){b(id,x,y+.55,z,w,1.1,d,'guard','guard');}
   function stair(id,x,z,y,count,direction=1,width=1.8){
    nodes.push(P(x,y,z+.45*direction,y===0?'world':y<0?'q01-drain':'q01-landing'));
    for(let i=0;i<count;i++){
     const top=y+(i+1)*RISE,cz=z-(i+.5)*RUN*direction;
     b(id+'-'+i,x,top-.09,cz,width,.18,RUN,'floor','step');surface('q01-step-'+i,[x-width/2,x+width/2,cz-RUN/2,cz+RUN/2],top);
     nodes.push(P(x,top,cz,'q01-step-'+i));
     // Continuous side guards remain outside the capsule and actual treads.
     for(const side of [-1,1])rail(id+'-rail-'+i+'-'+side,x+side*(width/2+.08),top,cz,.10,RUN+.025);
    }
   }
   // C0 is one authored platform. The drain and warehouse have real holes,
   // so neither buried terrain nor a decorative floor can support a false route.
   for(const [i,r]of [[-36,-35.1,-24,20],[-32.9,-28.5,-24,20],[-35.1,-32.9,-24,-4.5],[-35.1,-32.9,6.5,20],[-28.5,-14.5,-24,-21],[-28.5,-14.5,-7,20],[-14.5,25,-24,20]].entries())
    b('c0-paving-'+i,(r[0]+r[1])/2,-.12,(r[2]+r[3])/2,r[1]-r[0],.24,r[3]-r[2],'floor','floor');
   slab('warehouse-floor',[-28.5,-14.5,-21,-7],0,'floor','q01-room');
   // Front entrance has 2.4 m clear width and a 2.35 m lintel.
   b('front-west',-23.85,ROOF/2,-7.15,9.3,ROOF,.3);
   b('front-east',-15.65,ROOF/2,-7.15,2.3,ROOF,.3);
   b('front-lintel',-17.7,(ROOF+2.35)/2,-7.15,2.4,ROOF-2.35,.3);
   b('east-wall',-14.65,ROOF/2,-14,.3,ROOF,14);
   // Mezzanine side door is a physical aperture, not a painted rectangle.
   b('west-wall-lower',-28.35,MEZZ/2,-14,.3,MEZZ,14);
   b('west-wall-front',-28.35,(ROOF+MEZZ)/2,-10.15,.3,ROOF-MEZZ,6.3);
   b('west-wall-back',-28.35,(ROOF+MEZZ)/2,-18.25,.3,ROOF-MEZZ,5.5);
   b('west-door-lintel',-28.35,ROOF-.08,-14.4,.3,.16,2.2);
   b('back-wall',-21.5,ROOF/2,-20.85,14,ROOF,.3);
   slab('mezzanine-deck',[-28.2,-14.8,-20.7,-13.08],MEZZ,'wood','q01-mezzanine');
   rail('mezzanine-front-guard',-23.45,MEZZ,-13.05,9.5,.12);
   // Leave the main stair's approach and top landing clear of the front guard.
   stair('main',-17.7,-8.6,0,14);
   nodes.push(P(-17.7,MEZZ,-13.65,'q01-mezzanine'));
   nodes.push(P(-21.2,MEZZ,-13.65,'q01-mezzanine'));
   // Upper flight has an open well through the roof and 2.34 m headroom.
   stair('upper',-21.2,-14.5,MEZZ,14);
   slab('roof-west',[-28.5,-22.25,-21,-7],ROOF,'roof','q01-roof-main');
   slab('roof-east',[-20.15,-14.5,-21,-7],ROOF,'roof','q01-roof-main');
   slab('roof-south',[-22.25,-20.15,-14.5,-7],ROOF,'roof','q01-roof-main');
   slab('roof-north',[-22.25,-20.15,-21,-18.98],ROOF,'roof','q01-roof-main');
   for(const [id,x,z,w,d]of [['west',-28.35,-14,.3,14],['south',-21.5,-7.15,14,.3],['north-west',-28.25,-20.85,.5,.3],['north-east',-19,-20.85,9,.3],['east-south',-14.65,-12.4,.3,10.5]])rail('roof-parapet-'+id,x,ROOF,z,w,d);
   // Beat 05 needs an actual sight aperture over the rear alley. The curb,
   // posts and top rail still block a capsule; a solid 1.1 m parapet hid it.
   b('lookout-curb',-25.75,ROOF+.15,-20.85,4.5,.3,.10,'guard','guard');
   b('lookout-top-rail',-25.75,ROOF+1.05,-20.85,4.5,.10,.10,'wood','guard');
   for(const x of [-28,-25.75,-23.5])b('lookout-post-'+x,x,ROOF+.55,-20.85,.10,1.1,.10,'wood','guard');
   for(const x of [-22.3,-20.1])rail('roof-well-'+x,x,ROOF,-16.75,.1,4.5);
   rail('roof-well-front',-21.2,ROOF,-14.45,2.2,.1);
   // Side flight and gated opening are independent from the broken main beam.
   stair('side',-31,-8.6,0,14);
   slab('side-landing',[-32.05,-28.2,-15.45,-13.08],MEZZ,'mechanical','q01-landing');
   nodes.push(P(-31,MEZZ,-14.4,'q01-landing'),P(-27.6,MEZZ,-14.4,'q01-mezzanine'));
   rail('side-landing-north',-30.25,MEZZ,-15.45,3.7,.12);
   rail('side-landing-west',-32.05,MEZZ,-14.3,.12,2.3);
   rail('side-landing-front',-29.35,MEZZ,-13.08,2.2,.12);
   for(const x of [-32.05,-29.95])rail('side-choke-'+x,x,0,-7.8,.12,1.5);
   const gate=b('rescue-side-gate',-31,1.12,-8.05,1.94,2.24,.18,'mechanical','door');gate.enabled=true;
   b('rescue-raised-panel',-31,3.57,-8.05,1.94,2.24,.18,'mechanical','door').enabled=false;
   const beam=b('rescue-main-beam',-17.7,.65,-7.2,2.38,1.3,.48,'manual','prop');beam.enabled=false;
   b('rescue-rested-beam',-20.1,.88,-6.5,.48,.8,2.38,'manual','prop').enabled=false;
   b('rescue-common-door',-21.2,MEZZ+1.08,-14.2,1.98,2.16,.14,'roof','door');
   // Two-flight external egress. Bottom latch is released from the roof; it
   // cannot become a third way to reach trapped people before a rescue route.
   slab('egress-bridge',[-14.8,-10.9,-20.6,-18.98],ROOF,'roof','q01-landing');
   rail('egress-bridge-north',-12.85,ROOF,-20.6,3.9,.12);
   stair('egress-upper',-12,-14.5,MEZZ,14);
   slab('egress-mid',[-13.05,-7.95,-14.5,-12.6],MEZZ,'roof','q01-landing');
   // Lower flight climbs south from ground to the switchback landing.
   stair('egress-lower',-9,-18.98,0,14,-1);
   nodes.push(P(-12,MEZZ,-13.5,'q01-landing'),P(-9,MEZZ,-13.5,'q01-landing'),P(-9,0,-19.6));
   b('egress-bottom-latch',-9,1.08,-19.15,1.95,2.16,.16,'roof','door');
   rail('egress-mid-front',-10.5,MEZZ,-12.6,5.1,.12);
   b('egress-mid-support',-10.5,MEZZ/2,-13.5,.24,MEZZ,.24,'guard','prop');
   // Optional C-1 channel, seven ordinary steps; no mandatory object or exit.
   slab('drain-bed',[-35.1,-32.9,-4.5,4.26],-1.26,'drain','q01-drain');
   stair('drain',-34,4.26,-1.26,7,-1,1.9);
   nodes.push(P(-34,-1.26,3.9,'q01-drain'));
   for(const x of [-35.18,-32.82])b('drain-wall-'+x,x,-.5,.85,.16,1.55,11.3,'drain');
   b('drain-end',-34,-.5,-4.5,2.2,1.55,.18,'drain');
   // Piers, a low deck and a real gangplank share collision/support geometry.
   slab('arrival-pier',[-7.1,-4.9,-29,-23.5],0,'wood','q01-quay');
   slab('boat-deck',[-7.3,-4.7,-32,-29],.18,'wood','q01-quay');
   rail('boat-west',-7.3,.18,-30.5,.12,3);rail('boat-east',-4.7,.18,-30.5,.12,3);rail('boat-stern',-6,.18,-32,2.6,.12);
   for(const x of [-7.15,-4.85])rail('pier-edge-'+x,x,0,-26.3,.1,5.2);
   nodes.push(P(-6,0,-28,'q01-quay'),P(-6,0,-24,'q01-quay'));
   for(const [id,x,z,w,d]of [['west',-36, -2,.2,44],['east',25,-2,.2,44],['inland',-5.5,20,61,.2],['quay-west',-21.6,-24,28.8,.2],['quay-east',10,-24,29.8,.2]])rail('boundary-'+id,x,0,z,w,d);
   // Working rooms and private porch are volumes with open, usable thresholds.
   for(const [id,x,z,w,d,h]of [['workshop',-5.5,1,8,6,3.1],['lodging',14,9,6,6,3.1]]){
    b(id+'-back',x,h/2,z+d/2,w,h,.22);for(const dx of [-w/2,w/2])b(id+'-side-'+dx,x+dx,h/2,z,.22,h,d);
    b(id+'-roof',x,h+.09,z,w+.3,.18,d+.3,'roof','ceiling');
   }
   b('yosef-porch',-3,2.8,-12,6,.18,4,'roof','ceiling');
   for(const x of [-5.8,-.2])b('porch-post-'+x,x,1.4,-13.8,.14,2.8,.14,'wood','prop');
   b('yosef-screen',-.2,1,-12,.12,2,2.5,'wood','prop');
   // Cargo stays out of 1.8–2.4 m circulation lanes and has matching volumes.
   for(const [i,x,z,w,d,h]of [[0,-26,-10,2.2,2.1,1.5],[1,-24,-9.6,1.4,1.8,.9],[2,-25.7,-19,2.1,1.2,1.2],[3,-14,3,2,2,1.4],[4,1,-20,2,2,1.1],[5,-3,-22,1.5,1.5,1.2]])b('cargo-'+i,x,h/2,z,w,h,d,'wood','prop');
   // Counterweight trolley and chocks are not the Q01.LOAD frame.
   b('counterweight-cart',-32.8,.48,-4.6,1.35,.96,1.1,'mechanical','prop');
   for(const x of [-33.8,-30.1])b('cart-track-stop-'+x,x,.18,-4.6,.14,.36,1.6,'wood','prop');
   for(const z of [-5.25,-3.95])b('cart-track-'+z,-31.95,.035,z,3.7,.07,.10,'wood','floor');
   b('manual-beam-rest',-20.1,.24,-6.5,.6,.48,1.3,'manual','prop');
   b('winch-bed',-25.3,ROOF+.28,-10.6,2.1,.56,1.25,'mechanical','prop');
   b('ledger-table',-5,.45,-.1,2.4,.9,1,'wood','prop');
   b('b06-table',-20.5,.45,-4.2,2,.9,.85,'wood','prop');
   b('meal-table',7,.45,5,3,.9,1.3,'wood','prop');
   for(const z of [3.4,6.6])b('meal-bench-'+z,7,.23,z,3,.46,.44,'wood','prop');
   b('rest-bench',-2,.23,5.8,2.3,.46,.5,'wood','prop');
   b('load-frame',-10,.95,7.1,3,1.9,.34,'wood','prop');
   // Route nodes turn around real corners instead of cutting through props.
   for(const [x,z]of [[-10,-22],[-11,-16],[-11,-6],[-10,1],[-12,8],[-16,1],[-24,0],[-29,-2],[-31,1],[-29,5],[-31,-6.8],[-18,-4],[-20,-2],[-6,-6],[1,-4],[4,1],[4.8,4],[9.2,4],[11,1],[19,3],[-31,8],[-34,8],[-30,-22],[-11,-23]])nodes.push(P(x,0,z));
   // Natan's table has a solid top. His path out of the workshop must first
   // skirt its east edge and use the open front, then go round the outside.
   for(const [x,z]of [[-2.6,1],[-2.6,-3],[0,-3],[0,5.1],[0,6.8],[-2,6.8]])nodes.push(P(x,0,z));
   for(const [x,z]of [[-27,-12],[-27,-9.35],[-23,-9.35]])nodes.push(P(x,ROOF,z,'q01-roof-main'));
   // Art/physics use these same boxes; dynamic pieces are deliberately unbatched.
   for(const p of parts)if(['rescue-side-gate','rescue-raised-panel','rescue-main-beam','rescue-rested-beam','rescue-common-door','egress-bottom-latch','counterweight-cart'].includes(p.id))p.dynamic=true;
   for(const s of solids)if(s.id==='rescue-main-beam')s.enabled=false;
  };
  return plan;
 }
 function create(){
  const A=root.WitnessArchitecture||(typeof require==='function'?require('./witness-architecture.js'):null),ar=A.create({blueprint:blueprint()});
  ar.anchors=structuredClone(anchors);ar.beats=structuredClone(beats);ar.preview={fire:false,route:null,prepared:false,opened:false,common:false};
  const original=new Map(ar.solids.map(s=>[s.id,structuredClone(s)]));
  ar.setPreview=function(next={}){
   const p={...ar.preview,...next};if(![null,'mechanical','manual'].includes(p.route))throw Error('Unknown rescue route');
   if(p.opened&&!p.prepared)throw Error('Prepare the load / workers before opening a route');
   if(p.opened&&!p.route)throw Error('Choose one rescue route');
   if(p.common&&!p.opened)throw Error('The common roof route follows a rescue route');
   ar.preview=p;
   for(const s of ar.solids){const src=original.get(s.id);if(src)Object.assign(s,structuredClone(src));}
   const solid=id=>ar.solids.find(s=>s.id===id),enable=(id,on)=>{solid(id).enabled=on;};
   enable('rescue-main-beam',p.fire&&!(p.route==='manual'&&p.opened));
   enable('rescue-side-gate',!(p.route==='mechanical'&&p.opened));
   enable('rescue-raised-panel',p.route==='mechanical'&&p.opened);
   enable('rescue-rested-beam',p.route==='manual'&&p.opened);
   enable('rescue-common-door',!p.common);enable('egress-bottom-latch',!p.common);
   if(p.route==='mechanical'&&p.prepared){const c=solid('counterweight-cart');c.min[0]+=1.9;c.max[0]+=1.9;}
   ar.invalidateRoutes();ar.onPreview?.(p);return {...p};
  };
  // Transient controller-driven motion, used while a campaign interaction holds
  // control. A reload discards it and reconstructs the last committed prefix.
  // Each rendered box reads the same moving solid; there is no visual-only gate.
  ar.animateMechanism=function(kind,fraction,detail={}){
   const t=Math.max(0,Math.min(1,fraction)),solid=id=>ar.solids.find(s=>s.id===id),reset=id=>{const s=solid(id);Object.assign(s,structuredClone(original.get(id)));return s;};
   if(kind==='cart'){const s=reset('counterweight-cart');s.min[0]+=1.9*t;s.max[0]+=1.9*t;}
   else if(kind==='pulley'){const s=reset('rescue-side-gate');s.enabled=true;s.min[1]+=2.45*t;s.max[1]+=2.45*t;solid('rescue-raised-panel').enabled=false;}
   else if(kind==='lever'){
    const s=reset('rescue-main-beam'),src=original.get('rescue-main-beam'),dest=original.get('rescue-rested-beam');s.enabled=t<1;
    for(let k=0;k<3;k++){s.min[k]=src.min[k]+(dest.min[k]-src.min[k])*t;s.max[k]=src.max[k]+(dest.max[k]-src.max[k])*t;}
    solid('rescue-rested-beam').enabled=t===1;
   }
   ar.invalidateRoutes();ar.onPreview?.({
    ...ar.preview,
    cartProgress:kind==='cart'?t:undefined,
    pulleyProgress:kind==='pulley'?t:undefined,
    leverProgress:kind==='lever'?t:undefined,
    cartChocked:detail.chocked,
    testPulse:detail.testPulse||0,
    gateSecured:detail.secured,
    fulcrumPlaced:detail.fulcrum,
    beamWedged:detail.wedged,
    beamSettled:detail.settled
   });
   return {kind,fraction:t};
  };
  // PR-03 is the owner of story state. This read-only projection deliberately
  // distinguishes the route-specific panel from world.sideExit's common route.
  ar.projectScene=function(scene){
   if(!scene)return ar.setPreview({fire:false,route:null,prepared:false,opened:false,common:false});
   const steps=scene.rescue?.steps||[],route=scene.rescue?.route;
   return ar.setPreview({fire:!!scene.world&&scene.world.fire!=='none',fireState:scene.world?.fire,route:route||null,
    prepared:steps.includes(route==='mechanical'?'cart':'workers'),opened:steps.includes(route==='mechanical'?'pulley':'lever'),common:scene.world?.sideExit==='open'});
  };
  ar.setPreview();return ar;
 }
 function mount(T,scene,ar){
  const group=new T.Group();group.name='q01-greybox-level';group.userData={assetId:'CAE-Q01-GREYBOX-PR04',evidence:'H',artAccepted:false,version:VERSION};
  const geometry=new T.BoxGeometry(1,1,1),materials=new Map(),batches=new Map(),dynamic=new Map(),matrix=new T.Matrix4();
  const material=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.9}));return materials.get(c);};
  for(const part of ar.parts){if(part.dynamic){const mesh=new T.Mesh(geometry,material(part.color));mesh.name=part.id;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);dynamic.set(part.id,mesh);}else{if(!batches.has(part.color))batches.set(part.color,[]);batches.get(part.color).push(part);}}
  const transform=(p,m)=>m.makeScale(p.max[0]-p.min[0],p.max[1]-p.min[1],p.max[2]-p.min[2]).setPosition((p.min[0]+p.max[0])/2,(p.min[1]+p.max[1])/2,(p.min[2]+p.max[2])/2);
  for(const [color,parts]of batches){const mesh=new T.InstancedMesh(geometry,material(color),parts.length);mesh.name='greybox-static-'+color;parts.forEach((p,i)=>mesh.setMatrixAt(i,transform(p,matrix)));mesh.castShadow=mesh.receiveShadow=true;mesh.userData.colliderIds=parts.map(p=>p.id);group.add(mesh);}
  function box(id,x,y,z,w,h,d,c){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material(c));m.name=id;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m;}
  function rod(id,a,b,r,c){const va=new T.Vector3(...a),vb=new T.Vector3(...b),delta=vb.clone().sub(va),m=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),10),material(c));m.name=id;m.position.copy(va.add(vb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());group.add(m);return m;}
  function label(text,x,y,z,width=3,color='#e6ece6'){
   const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#203033';ctx.fillRect(0,0,768,128);ctx.fillStyle=color;ctx.font='600 41px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,64,732);
   const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const mat=new T.MeshBasicMaterial({map:tex,toneMapped:false}),mesh=new T.Mesh(new T.PlaneGeometry(width,width/6),mat);mesh.position.set(x,y,z+.002);mesh.name='sign-'+text;mesh.userData.annotation=true;group.add(mesh);
   const back=new T.Mesh(mesh.geometry,mat);back.rotation.y=Math.PI;back.position.set(x,y,z-.002);back.name=mesh.name+'-back';back.userData.annotation=true;group.add(back);return mesh;
  }
  label('C1 / KHO PHÍA TÂY',-23.5,3.8,-6.97,5.3);label('C0 / SÂN HÀNG',-13,1.15,12,4.2);
  label('C−1 / RÃNH BẢO TRÌ',-34,1.2,6.5,3.4);label('TỜI · LỐI PHỤ',-31,2.55,-7.9,2.5,'#f2ce93');
  label('XƯỞNG NATAN',-5.5,2.5,-1.99,3.5);label('BẾP / BÀN CHUNG',7,1.65,5.25,3.2);label('CHỖ NGHỈ',14,2.4,5.98,2.5);
  label('C+1 / ĐIỂM NHẬN',-25.5,ROOF+.60,-20.68,2.8);label('LỐI XUỐNG SÂN',-12.85,ROOF+.60,-20.51,2.5);
  // The load path is visible all the way from the C0 hand rope to the roof
  // drum, outrigger, lifting panel and restrained trolley.
  const drum=rod('winch-drum',[-26,ROOF+.95,-10.6],[-24.6,ROOF+.95,-10.6],.22,colors.wood);
  for(const x of [-26,-24.6])rod('winch-trestle',[x,ROOF,-11],[x,ROOF+1.1,-10.6],.07,colors.wood);
  const handRope=rod('hand-rope',[-29.4,.85,-5.1],[-29.4,ROOF+1.5,-5.1],.027,'#dfc395');
  rod('rope-to-drum',[-29.4,ROOF+1.5,-5.1],[-25.3,ROOF+1.1,-10.6],.027,'#dfc395');
  rod('rope-to-outrigger',[-25.3,ROOF+1.1,-10.6],[-31,ROOF+1.5,-8.05],.027,'#dfc395');
  rod('panel-rope',[-31,2.24,-8.05],[-31,ROOF+1.5,-8.05],.027,'#dfc395');
  const loadRope=rod('load-rope',[-32.8,1,-4.6],[-29.4,ROOF+1.5,-5.1],.027,'#dfc395'),loadLength=loadRope.geometry.parameters.height;
  rod('winch-outrigger',[-28.3,ROOF,-8.05],[-31,ROOF+1.5,-8.05],.10,colors.wood);
  const chocks=[box('cart-chock-a',-31.5,.12,-4.35,.30,.24,.35,colors.mechanical),box('cart-chock-b',-31.5,.12,-4.85,.30,.24,.35,colors.mechanical)];
  const gatePin=box('gate-latch-pin',-29.95,2.28,-8.05,.32,.12,.22,colors.mechanical);
  const fulcrumPad=box('lever-fulcrum-pad',-18.1,.63,-6.05,.44,.06,.44,colors.mechanical);
  const wedges=[box('manual-wedge-a',-19.65,.12,-5.85,.36,.18,.22,colors.mechanical),box('manual-wedge-b',-19.65,.12,-6.35,.36,.18,.22,colors.mechanical)];
  const lever=rod('lever-pole',[-19,.32,-5.4],[-17.2,.9,-6.7],.07,colors.wood);
  // The book and folded cover are already separate. Greybox props identify
  // their spatial needs without opening either narrative evidence package.
  box('intact-family-book',-5.55,.935,-.1,.55,.07,.42,'#6a7473');box('separate-folded-cover',-4.55,.934,-.1,.45,.04,.4,'#c5bf9d');
  box('dry-lining',-5,.907,-.1,2,.014,.72,'#e4dfce');box('b06-register',-20.5,.93,-4.2,.7,.06,.43,'#cbc4a9');
  const fire=new T.Group();fire.name='contained-fire-volume';
  const fm=new T.MeshBasicMaterial({color:'#d0884f',transparent:true,opacity:.28,depthWrite:false});
  for(let i=0;i<4;i++){const m=new T.Mesh(new T.ConeGeometry(.4,1.6,5),fm);m.position.set(-26+(i%2)*.8,.8,-10+Math.floor(i/2)*.8);fire.add(m);}group.add(fire);
  const water=new T.Mesh(new T.PlaneGeometry(180,90),new T.MeshStandardMaterial({color:colors.water,roughness:.38,metalness:.2}));water.rotation.x=-Math.PI/2;water.position.set(0,-.65,-69);water.name='greybox-harbour-water';scene.add(water);
  const skyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color('#7893a1')},bottom:{value:new T.Color('#d1d7ce')}},vertexShader:'varying vec3 vSky;void main(){vSky=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vSky;uniform vec3 top,bottom;void main(){float h=smoothstep(-.06,.72,normalize(vSky).y);gl_FragColor=vec4(mix(bottom,top,h),1.);}' });
  const skyDome=new T.Mesh(new T.SphereGeometry(120,24,12),skyMaterial);skyDome.name='greybox-sky';scene.add(skyDome);
  const hull=box('arrival-hull',-6,-.3,-30.5,3,.5,3.3,colors.wood);
  const markers=[];for(const beat of beats){const p=anchors[beat.anchors[0]],ring=new T.Mesh(new T.TorusGeometry(.35,.025,6,24),material('#c9b776'));ring.rotation.x=Math.PI/2;ring.position.set(p.x,p.y+.025,p.z);ring.name='beat-'+beat.beat+'-anchor';ring.userData.annotation=true;group.add(ring);markers.push(ring);}
  function actor(name,p,color){const g=new T.Group();g.name='greybox-actor-'+name;const body=new T.Mesh(new T.CylinderGeometry(.19,.24,1.15,10),material(color));body.position.y=.8;const head=new T.Mesh(new T.SphereGeometry(.15,12,8),material('#c6ba9d'));head.position.y=1.52;g.add(body,head);g.position.set(p.x,p.y,p.z);g.userData.greyboxActor=true;g.userData.supportId=p.supportId;group.add(g);return g;}
  const actors={titus:actor('Titus',anchors.titus,'#7c969b'),simeon:actor('Simeon',anchors.simeon,'#a8b8ad'),apprentice:actor('Apprenti',anchors.apprentice,'#b9a793'),natan:actor('Natan',P(-5,0,1.1),'#a69e8d'),yosef:actor('Yosef',P(-2,0,-12),'#8e9c97'),worker1:actor('Thợ 1',P(-22.5,0,-1),'#a7937c'),worker2:actor('Thợ 2',P(-21,0,-1),'#9b967f')};
  const update=p=>{
   for(const [id,mesh]of dynamic){const s=ar.solids.find(s=>s.id===id);mesh.visible=s.enabled!==false;mesh.matrixAutoUpdate=false;transform(s,mesh.matrix);mesh.matrixWorldNeedsUpdate=true;}
   const cartFrac=Number.isFinite(p.cartProgress)?p.cartProgress:p.route==='mechanical'&&p.prepared?1:0;
   const pulseX=(p.testPulse||0)*-.035;
   const ra=new T.Vector3(-32.8+1.9*cartFrac+pulseX,1,-4.6),rb=new T.Vector3(-29.4,ROOF+1.5,-5.1),rd=rb.clone().sub(ra);
   loadRope.scale.y=rd.length()/loadLength;loadRope.position.copy(ra.add(rb).multiplyScalar(.5));loadRope.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),rd.normalize());
   fire.visible=p.fire&&(!p.fireState||p.fireState==='burning');
   const chocked=!!(p.cartChocked||(p.route==='mechanical'&&p.prepared));
   chocks.forEach((m,i)=>{
    m.visible=p.route==='mechanical'&&(chocked||Number.isFinite(p.cartProgress));
    m.position.set(chocked?-31.5:-32.2,.12,chocked?(i?-4.85:-4.35):(i?-5.45:-3.75));
   });
   const secured=!!(p.gateSecured||(p.route==='mechanical'&&p.opened));
   gatePin.visible=p.route==='mechanical'&&(secured||Number.isFinite(p.pulleyProgress));
   gatePin.position.set(secured?-30.28:-29.88,2.28,-8.05);
   const pulleyFrac=Number.isFinite(p.pulleyProgress)?p.pulleyProgress:p.route==='mechanical'&&p.opened?1:0;
   handRope.position.y=(ROOF+2.35)/2-(pulleyFrac*.18);
   const fulcrumOn=!!(p.fulcrumPlaced||(p.route==='manual'&&p.prepared));
   fulcrumPad.visible=p.route==='manual'&&fulcrumOn;
   const wedged=!!(p.beamWedged||(p.route==='manual'&&p.opened));
   wedges.forEach((m,i)=>{
    m.visible=p.route==='manual'&&(wedged||p.prepared||Number.isFinite(p.leverProgress));
    m.position.set(wedged?-20.1:-19.65,wedged?.53:.12,wedged?(i?-6.85:-6.15):(i?-6.35:-5.85));
   });
   const leverFrac=Number.isFinite(p.leverProgress)?p.leverProgress:p.route==='manual'&&p.opened?1:0;
   lever.rotation.z=p.route==='manual'?(p.opened||p.beamSettled?-.25:-leverFrac*.30):0;
   drum.rotation.z=pulleyFrac*.9+(p.opened?.7:0);
   // The engine caches static shadow maps. Moving a gate / trolley invalidates
   // those maps together with the rendered pose and collision volume.
   for(const light of scene.children)if(light.isLight&&light.shadow)light.shadow.needsUpdate=true;
  };
  ar.onPreview=update;update(ar.preview);scene.add(group);ar.group=group;scene.userData.architecture=ar;
  return {group,actors,water,update,setLighting(evening){skyMaterial.uniforms.top.value.set(evening?'#263c56':'#7893a1');skyMaterial.uniforms.bottom.value.set(evening?'#777e83':'#d1d7ce');},setAnnotations(on){group.traverse(o=>{if(o.userData.annotation)o.visible=on;});},tick(t){water.position.y=-.65+Math.sin(t*.7)*.018;fire.children.forEach((m,i)=>m.scale.y=.94+.06*Math.sin(t*2+i));},dispose(){ar.onPreview=null;const geos=new Set(),mats=new Set(),textures=new Set();for(const parent of [group,water,skyDome])parent.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry)geos.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){mats.add(m);if(m.map&&!m.map.userData.sharedMap)textures.add(m.map);}});textures.forEach(t=>t.dispose());geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());group.removeFromParent();water.removeFromParent();skyDome.removeFromParent();}};
 }
 const api={VERSION,MEZZ,ROOF,RISE,RUN,anchors,beats,blueprint,create,mount};
 root.WitnessQ01Greybox=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
