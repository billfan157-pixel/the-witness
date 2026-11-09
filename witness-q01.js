(function(root){
  'use strict';
  // Scene reconstruction [H]; source-specific evidence: research/q01-gold-materials.md.
  const climates={
    'q01-day':{time:'Ban ngày',elevation:46,azimuth:-.82,sky:'#377fae',haze:'#d0d8cb',light:'#fff0d5',bounce:'#85715a',clouds:.63},
    'q01-evening':{time:'Buổi tối',elevation:19,azimuth:.64,sky:'#14253e',haze:'#586478',light:'#afc8e9',bounce:'#393b42',clouds:.72,night:true}
  };
  const AV=root.AdventureVisuals,shoreClimate={...AV.atmosphere('shore')};
  root.__registerWitnessAtmospheres(climates);
  const active=s=>!!s&&!s.layer&&root.WitnessModel.chapter(s).id==='Q01';
  const climate=s=>s?.settings?.q01Lighting==='evening'?'q01-evening':'q01-day';
  function selectClimate(s){root.__registerWitnessAtmospheres({shore:active(s)?climates[climate(s)]:shoreClimate});}
  const clearLand=(x,z)=>x>-30&&x<-17&&z>-22.4&&z<8;
  const clearVegetation=(x,z)=>z<-22.4||clearLand(x,z);
  function prepareGround(ground){
    const p=ground.geometry.attributes.position,splat=ground.geometry.attributes.terrainSplat;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i);
      if(z<-23.0)p.setY(i,Math.min(p.getY(i),-.46+(z+23)*.065));
      const edge=Math.min(x+30,-17-x,z+22.4,8-z),weight=Math.max(0,Math.min(1,edge/2.8));
      if(weight>0){p.setY(i,p.getY(i)*(1-weight)+(.10+(z+10)*.012)*weight);if(splat){const values=[.10,.12,0,.78];for(let c=0;c<4;c++)splat.array[i*4+c]=splat.array[i*4+c]*(1-weight)+values[c]*weight;}}
    }
    p.needsUpdate=true;if(splat)splat.needsUpdate=true;ground.geometry.computeVertexNormals();ground.geometry.computeBoundingSphere();
  }
  const caches=new WeakMap(),tiles={stone:3,plaster:2,wood:1.8,floor:1.8};
  function library(T,lite=false){
    let cache=caches.get(T);if(!cache){cache=new Map();caches.set(T,cache);}
    const tier=lite?'lite':'full';if(cache.has(tier))return cache.get(tier);
    const loader=new T.TextureLoader(),maps={};
    for(const family of Object.keys(tiles)){
      maps[family]={};
      for(const channel of ['albedo','normal','orm']){
        const key=`architecture/${tier}/${family}-${channel}.webp`,texture=loader.load(root.AdventureAssets?.[key]||'./assets/'+key);
        texture.colorSpace=channel==='albedo'?T.SRGBColorSpace:T.NoColorSpace;
        texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;texture.userData.sharedMap=true;
        maps[family][channel]=texture;
      }
    }
    cache.set(tier,maps);return maps;
  }
  function surfaces(T,lite=false){
    const maps=library(T,lite),cache=new Map();
    return (family='plaster',color='#ffffff')=>{
      const key=family+color;if(cache.has(key))return cache.get(key);
      const d=maps[family];
      const m=new T.MeshStandardMaterial(d?{color,map:d.albedo,normalMap:d.normal,roughnessMap:d.orm,aoMap:d.orm,metalnessMap:d.orm,roughness:1,metalness:0,normalScale:new T.Vector2(family==='stone'||family==='floor'?.30:.18)}:{color,roughness:.9});
      m.name='q01-'+family;m.userData.q01Material=family;m.userData.tileMeters=tiles[family]||1;cache.set(key,m);return m;
    };
  }
  function uvBox(T,w,h,d,x,y,z,tile=2){
    const g=new T.BoxGeometry(w,h,d,4,4,4),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,r=Math.min(.014,w*.12,h*.12,d*.12);
    const q=new T.Vector3(),core=new T.Vector3(),half=new T.Vector3(w/2,h/2,d/2),normal=new T.Vector3();
    const remap=(v,h)=>Math.abs(Math.abs(v)-h/2)<.0001?Math.sign(v)*(h-r):v;
    for(let i=0;i<p.count;i++){
      normal.fromBufferAttribute(n,i);q.set(remap(p.getX(i),half.x),remap(p.getY(i),half.y),remap(p.getZ(i),half.z));
      core.set(Math.max(-half.x+r,Math.min(half.x-r,q.x)),Math.max(-half.y+r,Math.min(half.y-r,q.y)),Math.max(-half.z+r,Math.min(half.z-r,q.z)));
      const rounded=q.clone().sub(core).normalize();q.copy(core).addScaledVector(rounded,r);p.setXYZ(i,q.x,q.y,q.z);n.setXYZ(i,rounded.x,rounded.y,rounded.z);
      const px=p.getX(i)+x,py=p.getY(i)+y,pz=p.getZ(i)+z;
      if(Math.abs(normal.y)>.5)uv.setXY(i,px/tile,pz/tile);
      else if(Math.abs(normal.x)>.5)uv.setXY(i,pz/tile,py/tile);
      else uv.setXY(i,px/tile,py/tile);
    }
    g.setAttribute('uv1',uv.clone());return g;
  }
  function architectureMaterial(T,lite){
    const get=surfaces(T,lite);
    return p=>get(p.kind==='step'||p.kind==='floor'?'floor':p.kind==='guard'?'wood':'plaster',p.kind==='guard'?'#aaa096':p.kind==='ceiling'?'#d0c4a9':'#f1dec0');
  }
  function batch(T,group){
    group.updateMatrixWorld(true);const batches=new Map();
    for(const mesh of [...group.children]){
      if(!mesh.isMesh||mesh.isInstancedMesh||mesh.name==='q01-oil-flame'||mesh.name==='q01-drying-linen')continue;
      const key=mesh.material.uuid;if(!batches.has(key))batches.set(key,{material:mesh.material,parts:[]});
      const g=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone()).applyMatrix4(mesh.matrix);
      batches.get(key).parts.push(g);group.remove(mesh);mesh.geometry.dispose();
    }
    for(const {material,parts}of batches.values()){
      const g=new T.BufferGeometry();
      for(const name of ['position','normal','uv']){
        const size=name==='uv'?2:3,arr=new Float32Array(parts.reduce((n,p)=>n+p.attributes.position.count*size,0));let at=0;
        for(const p of parts){const attribute=p.attributes[name];if(attribute)arr.set(attribute.array,at);at+=p.attributes.position.count*size;}g.setAttribute(name,new T.BufferAttribute(arr,size));
      }
      g.setAttribute('uv1',g.attributes.uv.clone());g.computeBoundingSphere();
      const m=new T.Mesh(g,material);m.name='q01-batched-'+material.name;m.castShadow=m.receiveShadow=true;group.add(m);parts.forEach(p=>p.dispose());
    }
  }
  function install({T,scene,height,architecture,state}){
    const group=new T.Group();group.name='q01-harbor-finish';scene.add(group);
    const get=surfaces(T,state.settings.graphics==='balanced'||!!root.WitnessKitOfflineQuality);
    const lamps=[],flames=[],base=architecture.base,roof=architecture.roof;
    function add(g,m,x,y,z,name='detail'){
      const mesh=new T.Mesh(g,m);mesh.name='q01-'+name;mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;
    }
    function box(family,color,x,y,z,w,h,d,name='detail'){
      return add(uvBox(T,w,h,d,x,y,z,tiles[family]||1),get(family,color),x,y,z,name);
    }
    const wood=get('wood','#b4a58e'),ropeMat=get('rope','#aa916a');
    const ceramic=new T.MeshStandardMaterial({color:'#9b5836',roughness:.86});AV.surface(ceramic,'clay');
    const ceramicPale=ceramic.clone();ceramicPale.color.set('#bd966e');
    function beam(from,to,r,mat=wood,name='beam'){
      const a=new T.Vector3(...from),b=new T.Vector3(...to),delta=b.clone().sub(a);
      const m=add(new T.CylinderGeometry(r*.91,r,delta.length(),7),mat,...a.clone().add(b).multiplyScalar(.5).toArray(),name);
      m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;
    }
    function coil(x,y,z,size=.32){
      for(let i=0;i<5;i++){const m=add(new T.TorusGeometry(size+i*.025,.013,5,38),ropeMat,x,y+i*.013,z,'rope-coil');m.rotation.x=Math.PI/2;}
    }
    function amphora(x,y,z,size=1,pale=false){
      const points=[[.015,0],[.065,.06],[.14,.22],[.22,.40],[.245,.63],[.19,.79],[.095,.89],[.085,1.06],[.105,1.08],[.104,1.12],[.066,1.12],[.063,1.05],[.063,.91]].map(([r,h])=>new T.Vector2(r*size,h*size));
      add(new T.LatheGeometry(points,24),pale?ceramicPale:ceramic,x,y,z,'transport-amphora');
      for(const side of [-1,1]){
        const curve=new T.CatmullRomCurve3([new T.Vector3(side*.08,.99,0),new T.Vector3(side*.205,.96,0),new T.Vector3(side*.25,.78,0),new T.Vector3(side*.16,.76,0)].map(p=>p.multiplyScalar(size)));
        add(new T.TubeGeometry(curve,12,.022*size,6,false),pale?ceramicPale:ceramic,x,y,z,'amphora-handle');
      }
    }
    function lamp(x,y,z){
      const size=.38; // About 12 cm long / 4 cm high: comparable object scale, not a large brazier.
      const body=add(new T.SphereGeometry(1,16,8),ceramic,x,y,z,'clay-oil-lamp');body.scale.set(.17*size,.055*size,.12*size);
      const rim=add(new T.TorusGeometry(.065*size,.011*size,5,20),ceramic,x,y+.04*size,z,'lamp-rim');rim.rotation.x=Math.PI/2;
      const nozzle=add(new T.ConeGeometry(.065*size,.15*size,10),ceramic,x,y,z+.14*size,'lamp-nozzle');nozzle.rotation.x=Math.PI/2;
      const flame=add(new T.SphereGeometry(1,8,8),new T.MeshBasicMaterial({color:'#ffcc76',toneMapped:false}),x,y+.09*size,z+.19*size,'oil-flame');
      flame.scale.set(.018*size,.04*size,.018*size);flame.userData.flameSize=size;flame.castShadow=false;flames.push(flame);
      const light=new T.PointLight('#ffac55',0,6.5,2);light.position.set(x,y+.25*size,z+.13*size);group.add(light);lamps.push(light);
    }
    // Separate exposed plinth and plaster. All structure trim stays inside its collider envelope.
    for(const p of architecture.parts.filter(p=>p.kind==='wall'&&p.id!=='lintel'&&!p.id.startsWith('parapet'))){
      const x=(p.min[0]+p.max[0])/2,z=(p.min[2]+p.max[2])/2,w=p.max[0]-p.min[0],d=p.max[2]-p.min[2];
      box('stone','#cbbd9e',x,base+.35,z,w+.012,.70,d+.012,'stone-plinth');
      box('stone','#dfd0b0',x,base+2.98,z,w+.025,.13,d+.025,'cornice');
    }
    for(const x of [-24.025,-21.975])for(let i=0;i<6;i++)box('stone',i%2?'#d8c6a2':'#ddcbaa',x,base+.19+i*.38,-9.62,.14,.37,.34,'door-jamb');
    box('wood','#b7a58b',-23,base+2.37,-9.63,2.16,.14,.32,'door-lintel');
    for(const x of [-25.02,-20.98]){
      box('wood','#9b866a',x,base+1.08,-9.88,1.40,2.13,.10,'open-door');
      architecture.solids.push({id:'q01-door-leaf-'+x,min:[x-.70,base+.015,-9.93],max:[x+.70,base+2.145,-9.83],kind:'door'});
      for(const h of [.34,1.7])box('metal','#51473b',x,base+h,-9.95,1.20,.055,.025,'door-strap');
    }
    for(const z of [-11.25,-13.45,-15.65]){
      box('wood','#8c7b63',-24.05,base+2.88,z,6.3,.20,.17,'ceiling-beam');
      architecture.solids.push({id:'q01-beam-'+z,min:[-27.20,base+2.78,z-.085],max:[-20.90,base+2.98,z+.085],kind:'beam'});
    }
    for(const p of architecture.parts.filter(p=>p.id.startsWith('parapet')))box('stone','#dfd0b2',(p.min[0]+p.max[0])/2,p.max[1]-.04,(p.min[2]+p.max[2])/2,p.max[0]-p.min[0]+.025,.08,p.max[2]-p.min[2]+.025,'parapet-cap');
    // Uneven plaster edges expose the masonry, rather than a mechanically straight paint stripe.
    for(const [left,right]of [[-27.48,-24.03],[-21.97,-18.52]]){
      const vertices=[],uv=[],indices=[],n=18;
      for(let i=0;i<=n;i++){
        const x=left+(right-left)*i/n,bottom=base+.41+.10*Math.sin(i*1.7)+.045*Math.cos(i*3.9);
        vertices.push(x,base+.76,-9.48,x,bottom,-9.48);uv.push(x/2,(base+.76)/2,x/2,bottom/2);
        if(i){const a=i*2;indices.push(a-2,a-1,a,a,a-1,a+1);}
      }
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
      add(g,get('plaster','#f1dec0'),0,0,0,'chipped-plaster-edge');
    }
    // Goods occupy the unused western edge. Matching solids are used by movement and camera.
    function obstacle(id,x,z,w,d,h,y=base){architecture.solids.push({id:'q01-art-'+id,min:[x-w/2,y,z-d/2],max:[x+w/2,y+h,z+d/2],kind:'prop'});}
    for(const [i,x,z] of [[0,-26.65,-11.25],[1,-26.65,-12],[2,-26.65,-12.75],[3,-25.95,-12.3],[4,-26.60,-15.75]])amphora(x,base+.05,z,.69+(i%3)*.08,i%2===0);
    obstacle('amphora-row',-26.5,-12,1.15,2.5,1.1);obstacle('rear-amphora',-26.6,-15.75,.6,.6,1.05);
    box('wood','#ad9877',-25.8,base+.18,-12,.95,.36,2.5,'amphora-dunnage');
    obstacle('dunnage',-25.8,-12,.95,2.5,.36);
    box('wood','#b6a38a',-26.55,base+.81,-14.4,.94,.10,1.7,'workbench');
    for(const x of [-26.88,-26.22])for(const z of [-15.05,-13.75])box('wood','#9a866d',x,base+.4,z,.09,.8,.09,'bench-leg');
    obstacle('bench',-26.55,-14.4,1.04,1.8,.88);coil(-26.45,base+.88,-14.5,.20);lamp(-26.55,base+.885,-13.9);
    for(const z of [-13.1,-15.7]){box('wood','#b29b7e',-27.02,base+1.75,z,.42,.065,1,'wall-shelf');amphora(-27.02,base+1.79,z,.38,true);}
    lamp(-24.18,base+1.95,-9.32);lamp(-19.05,roof+.965,-17.36);
    const cloth=AV.surface(new T.MeshStandardMaterial({color:'#c9b798',roughness:.96,side:T.DoubleSide}),'linen');
    const cg=new T.PlaneGeometry(1.48,.64,18,8),cp=cg.attributes.position;
    for(let i=0;i<cp.count;i++)cp.setZ(i,.05*Math.cos(cp.getX(i)*18)+.04*Math.sin(cp.getY(i)*5));cg.computeVertexNormals();
    const drying=add(cg,cloth,-24.4,roof+.83,-13.17,'drying-linen');drying.rotation.x=-.30;
    // Inlays follow terrain; they do not introduce a raised impassable slab.
    for(let i=0;i<9;i++)for(let j=0;j<4;j++){
      const x=-24.8+j*.92,z=-8.4+i*.96,g=new T.PlaneGeometry(.88,.92,2,2);g.rotateX(-Math.PI/2);
      const p=g.attributes.position,uv=g.attributes.uv;
      for(let k=0;k<p.count;k++){const px=x+p.getX(k),pz=z+p.getZ(k);p.setXYZ(k,px,height(px,pz)+.009,pz);uv.setXY(k,px/1.8,pz/1.8);}g.computeVertexNormals();g.setAttribute('uv1',uv.clone());
      const slab=add(g,get('floor',(i+j)%3?'#c5bba6':'#cbbda7'),0,0,0,'approach-slab');slab.castShadow=false;
    }
    for(const x of [-16,-13,-10]){
      const y=height(x,-20.5);box('wood','#927e61',x,y+.42,-20.5,.20,.84,.20,'mooring-post');
      coil(x,y+.018,-19.95,.22);beam([x,y+.45,-20.5],[x+.52,y+.24,-21.45],.024,ropeMat,'mooring-rope');
    }
    // Titus keeps his real companion identity and dialogue.
    box('wood','#b6a187',-25.10,height(-25.1,3.7)+.67,3.7,1.15,.10,1.7,'harbor-worktable');
    for(const x of [-25.5,-24.7])for(const z of [3.1,4.3])beam([x,height(x,z),z],[x,height(x,z)+.64,z],.04);
    coil(-25.1,height(-25.1,3.7)+.75,3.45,.21);lamp(-25.1,height(-25.1,3.7)+.743,4.1);
    // Construction details on the existing cargo chests; no cardboard-like blank cubes.
    for(let i=0;i<5;i++){
      const x=-24+i*1.2,y=height(x,2);
      for(const dx of [-.39,.39])for(const z of [1.54,2.46])box('wood','#c5b18c',x+dx,y+.50,z,.075,.92,.05,'crate-batten');
      for(const z of [1.54,2.46])for(const h of [.10,.88])box('wood','#c9b592',x,y+h,z,.9,.07,.05,'crate-frame');
      for(const dx of [-.29,.29])beam([x+dx,y+.02,1.51],[x+dx,y+.96,1.51],.012,ropeMat,'cargo-binding');
    }
    // Two authored olive trees frame the working lane; narrow leaves, not oversized polygon clumps.
    function olive(x,z,seed){
      let value=seed;const random=()=>((value=Math.imul(value,1664525)+1013904223>>>0)/4294967296),y=height(x,z);
      const trunk=new T.CatmullRomCurve3([new T.Vector3(x,y,z),new T.Vector3(x+.10,y+1.05,z-.08),new T.Vector3(x-.13,y+2.1,z+.12),new T.Vector3(x+.05,y+2.75,z)]);
      add(new T.TubeGeometry(trunk,14,.105,8,false),wood,0,0,0,'olive-trunk');
      const ends=[];
      for(let i=0;i<8;i++){
        const angle=i*Math.PI/4+.12,tip=[x+Math.cos(angle)*1.25,y+2.65+random()*.6,z+Math.sin(angle)*1.15];ends.push(tip);
        beam([x-.08,y+1.8+random()*.4,z+.08],tip,.025+random()*.013,wood,'olive-branch');
      }
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.020,.047,.006,-.014,.105,.002,0,.14,-.004,.014,.105,.002,.020,.047,.006,0,.067,.012],3));
      g.setIndex([0,1,6,1,2,6,2,3,6,3,4,6,4,5,6,5,0,6]);g.computeVertexNormals();
      const mat=new T.MeshStandardMaterial({color:'#8e9b77',roughness:.84,side:T.DoubleSide});
      const shared=AV.windUniforms(T);
      mat.customProgramCacheKey=()=> 'q01-olive-wind-1';
      mat.onBeforeCompile=shader=>{
        shader.uniforms.uWindTime=shared.uWindTime;shader.uniforms.uTrail=shared.uTrail;
        shader.vertexShader=shader.vertexShader
          .replace('#include <common>',`#include <common>\n${AV.windGLSL}`)
          .replace('#include <begin_vertex>',`#include <begin_vertex>
            #ifdef USE_INSTANCING
              vec3 oliveBase=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
            #else
              vec3 oliveBase=vec3(0.);
            #endif
            vec2 ow=windGust(oliveBase.xz)*.03+windPush(oliveBase.xz)*.10;
            float oflex=clamp(position.y*6.,0.,1.);
            transformed.x+=ow.x*oflex;transformed.z+=ow.y*oflex;`);
      };
      const leaves=new T.InstancedMesh(g,mat,950),dummy=new T.Object3D(),color=new T.Color();
      for(let i=0;i<leaves.count;i++){
        const at=ends[i%ends.length],a=random()*Math.PI*2,r=Math.sqrt(random())*.76;
        dummy.position.set(at[0]+Math.cos(a)*r,at[1]+(random()-.5)*.68,at[2]+Math.sin(a)*r);dummy.rotation.set(random()*2.4,random()*6.28,random()*6.28);dummy.scale.setScalar(.62+random()*.58);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
        color.setHSL(.20+random()*.025,.14+random()*.09,.27+random()*.15);leaves.setColorAt(i,color);
      }
      leaves.castShadow=leaves.receiveShadow=true;leaves.name='q01-olive-leaves';group.add(leaves);
    }
    olive(-29,1,83);olive(-17.5,-4,171);
    const outdoorSolids=[[-25.1,3.7,.94],[-29,1,.17],[-17.5,-4,.17],...[-16,-13,-10].map(x=>[x,-20.5,.17])];
    scene.userData.q01={version:'1',evidence:'H',artApproved:false,lighting:state.settings.q01Lighting||'day',hero:'wt-titus',materials:Object.keys(tiles),lamps:lamps.length,group,outdoorSolids};
    const evening=state.settings.q01Lighting==='evening';
    for(const light of lamps)light.intensity=evening?4.5:.48;for(const flame of flames)flame.visible=evening;
    // Local bounce is an artistic approximation, not global illumination.
    const bounce=new T.PointLight(evening?'#e4b780':'#c4d8e9',evening?1.2:2.8,9,2);bounce.position.set(-23,base+2.35,-11.5);group.add(bounce);
    batch(T,group);
    return {outdoorSolids,tick(time){
      for(let i=0;i<lamps.length;i++)lamps[i].intensity=(evening?4.5:.48)*(1+.055*Math.sin(time*5+i*1.7)+.025*Math.sin(time*11+i));
      for(let i=0;i<flames.length;i++)flames[i].scale.y=(.038+.005*Math.sin(time*7+i))*flames[i].userData.flameSize;drying.rotation.z=Math.sin(time*.9)*.018;
    }};
  }
  function heroLook(base){return {...base,id:'wt-titus',skin:'#aa7859',age:.39,face:'rectangular',faceWidth:.08,cheek:.37,chin:.38,noseBridge:.30,noseWidth:.18,tunic:'#b9ad94',mantle:'#68716b',trim:'#8e806c',hairColor:'#382a23',eyeColor:'#493223',hair:'receding',hairLength:.026,beard:.027,hem:.43,sleeve:.55,cloth:'linen',cloak:'none',headcover:'bare',build:1.055,height:1.015,belt:'leather',item:'rope',ornament:'none',gesture:'listen',evidence:'Titus hư cấu: lanh, len, dép da và dây thực vật là diễn giải H có nguồn so sánh.'};}
  function finishHero(T,model){
    model.object.userData.q01Hero={name:'Titus',fictional:true,approval:'pending',version:1};
    const eyePoints=[];
    model.object.traverse(o=>{if(o.geometry?.parameters?.radius===.0022)eyePoints.push(o.parent.position.clone());});
    let skeleton;
    model.object.traverse(mesh=>{
      if(!mesh.isMesh)return;mesh.receiveShadow=true;
      if(mesh.isSkinnedMesh)skeleton??=mesh.skeleton;
      // The fitted skin must have an aperture: otherwise it covers the iris while
      // leaving only the white corners visible. Preserve the independent blinking lids.
      if(mesh.name==='anatomical-body'&&mesh.geometry.index){
        const g=mesh.geometry,p=g.attributes.position,old=g.index.array,kept=[];
        for(let i=0;i<old.length;i+=3){
          const ids=[old[i],old[i+1],old[i+2]],x=ids.reduce((a,k)=>a+p.getX(k),0)/3,y=ids.reduce((a,k)=>a+p.getY(k),0)/3,z=ids.reduce((a,k)=>a+p.getZ(k),0)/3;
          const coversEye=eyePoints.some(e=>z>e.z+.002&&Math.pow((x-e.x)/.015,2)+Math.pow((y-e.y)/.007,2)<1.35);
          if(!coversEye)kept.push(...ids);
        }
        g.setIndex(kept);g.userData.q01EyeApertureTriangles=(old.length-kept.length)/3;
      }
      if(mesh.geometry?.parameters?.radius===.0134){mesh.material.roughness=.42;mesh.material.clearcoat=.28;mesh.material.envMapIntensity=.38;}
      const garment=mesh.material?.userData?.surface?.startsWith('linen');
      if(garment){
        const p=mesh.geometry.attributes.position,c=mesh.geometry.attributes.color;
        // Relax the shoulder line and give the work tunic broad, subtle wear, not painted highlights.
        for(let i=0;i<p.count;i++){
          const x=p.getX(i),y=p.getY(i),z=p.getZ(i),shoulder=Math.exp(-Math.pow((y-1.47)/.10,2))*Math.min(1,Math.abs(x)/.23);
          p.setY(i,y-shoulder*.018);
          if(c){const dirt=Math.exp(-Math.pow((y-.48)/.11,2))*(.11+.045*Math.sin(x*31+z*15)),tone=1-dirt+.018*Math.sin(x*41+y*19+z*33);c.setXYZ(i,c.getX(i)*tone,c.getY(i)*tone,c.getZ(i)*tone);}
        }
        p.needsUpdate=true;if(c)c.needsUpdate=true;mesh.geometry.computeVertexNormals();
      }
      for(const m of [mesh.material].flat().filter(Boolean)){
        if(m.name==='skin-pore-normal-zone-roughness-sss'){m.roughness=.74;m.envMapIntensity=.75;}
        if(m.userData?.surface?.includes('linen')||m.userData?.surface?.includes('wool')){m.roughness=.95;m.envMapIntensity=.62;}
      }
    });
    if(skeleton){
      const pelvis=skeleton.bones.findIndex(b=>b.name==='pelvis'),leather=AV.surface(new T.MeshStandardMaterial({color:'#65452f',roughness:.86}),'leather',true);
      const stitch=new T.MeshStandardMaterial({color:'#aa9270',roughness:.95});
      function attach(g,mat,name){
        const n=g.attributes.position.count,ids=new Uint16Array(n*4),weights=new Float32Array(n*4);for(let i=0;i<n;i++){ids[i*4]=pelvis;weights[i*4]=1;}
        g.setAttribute('skinIndex',new T.Uint16BufferAttribute(ids,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
        const mesh=new T.SkinnedMesh(g,mat);mesh.name='q01-titus-'+name;model.object.add(mesh);mesh.bind(skeleton);mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;
      }
      const pouch=new T.SphereGeometry(1,20,14);pouch.scale(.080,.095,.043);pouch.translate(-.205,.958,.165);attach(pouch,leather,'tool-pouch');
      const flap=new T.PlaneGeometry(.15,.13,8,8),p=flap.attributes.position;
      for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)-.205,p.getY(i)+1.01,.209+.013*Math.cos(p.getY(i)*19));flap.computeVertexNormals();leather.side=T.DoubleSide;attach(flap,leather,'pouch-flap');
      const curve=new T.CatmullRomCurve3([new T.Vector3(-.271,1.06,.220),new T.Vector3(-.271,.96,.220),new T.Vector3(-.205,.95,.223),new T.Vector3(-.139,.96,.220),new T.Vector3(-.139,1.06,.220)]);
      attach(new T.TubeGeometry(curve,32,.0016,4,false),stitch,'pouch-seam');
    }
  }
  root.WitnessQ01={active,climate,selectClimate,clearLand,clearVegetation,prepareGround,surfaces,uvBox,architectureMaterial,install,heroLook,finishHero,batch};
})(globalThis);
