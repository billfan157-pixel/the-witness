(function(root){
  'use strict';
  // Authored [H] finishing on PR-04's exact structural/collision envelopes.
  // Shared PBR maps retain their existing credits; procedural meshes, particles,
  // water and signs are original game assets, not archaeological measurements.
  function mount(T,scene,ar,state){
    const G=root.WitnessQ01Greybox,base=G.mount(T,scene,ar),group=new T.Group();group.name='q01-campaign-art';group.userData={artAccepted:false,assetId:'CAE-Q01-PR05',evidence:'H'};scene.add(group);
    base.setAnnotations(false);Object.values(base.actors).forEach(o=>o.visible=false);base.water.visible=false;
    const get=root.WitnessQ01.surfaces(T,state.settings.graphics==='balanced'||!!root.WitnessKitOfflineQuality),ownedMaterials=new Set(),actors={},lamps=[],flames=[],smoke=[];
    const mat=(c,roughness=.8,extra={})=>{const m=new T.MeshStandardMaterial({color:c,roughness,...extra});ownedMaterials.add(m);return m;};
    const wood=get('wood','#b7a58b'),stone=get('stone','#c4b494'),plaster=get('plaster','#dfd0b0'),floor=get('floor','#bdaf94'),iron=mat('#494842',.68,{metalness:.65}),rope=mat('#ad956b'),paper=mat('#d0bc8c'),dark=mat('#51463a');
    const material=p=>p.id.includes('beam')||p.id.includes('cart')||p.id.includes('load-frame')||/^(boat|arrival-pier|pier-edge)/.test(p.id)||p.kind==='guard'||p.color==='#a48b6d'?wood:p.kind==='floor'||p.kind==='step'?floor:p.kind==='wall'?plaster:stone;
    function uv(geo,x=0,y=0,z=0,tile=2){const p=geo.attributes.position,n=geo.attributes.kitProjection||geo.attributes.normal,u=geo.attributes.uv;for(let i=0;i<p.count;i++){const px=p.getX(i)+x,py=p.getY(i)+y,pz=p.getZ(i)+z;if(Math.abs(n.getY(i))>.5)u.setXY(i,px/tile,pz/tile);else if(Math.abs(n.getX(i))>.5)u.setXY(i,pz/tile,py/tile);else u.setXY(i,px/tile,py/tile);}geo.deleteAttribute?.('kitProjection');geo.setAttribute('uv1',u.clone());return geo;}
    for(const mesh of base.group.children)if(mesh.name.startsWith('greybox-static-'))mesh.visible=false;
    const structure=new T.Group();structure.name='q01-pr05-structure';group.add(structure);
    const bevelRadius=(w,h,d)=>Math.min(.024,w*.10,h*.10,d*.10);
    for(const p of ar.parts){const w=p.max[0]-p.min[0],h=p.max[1]-p.min[1],d=p.max[2]-p.min[2],x=(p.max[0]+p.min[0])/2,y=(p.max[1]+p.min[1])/2,z=(p.max[2]+p.min[2])/2;
      if(p.dynamic){
        const m=base.group.getObjectByName(p.id);m.geometry=uv(new T.BoxGeometry(1,1,1),0,0,0,1);m.material=material(p);
        if(p.id==='counterweight-cart'){
          for(const sx of [-.34,.34])for(const sz of [-.43,.43]){const wh=new T.Mesh(new T.CylinderGeometry(.11,.11,.06,12),iron);wh.rotation.x=Math.PI/2;wh.position.set(sx,-.38,sz);m.add(wh);}
          for(const [bx,by,bz,bw,bh,bd,mt]of [[0,.12,0,.92,.48,.96,stone],[-.45,.18,0,.04,.55,1.02,iron],[.45,.18,0,.04,.55,1.02,iron],[.47,.06,0,.06,.14,.16,iron]]){const bm=new T.Mesh(new T.BoxGeometry(bw,bh,bd),mt);bm.position.set(bx,by,bz);m.add(bm);}
        }
        continue;
      }
      if(p.kind==='wall'&&h>=2.2&&p.min[1]<=.05){
        const plinthH=.56,upperH=h-plinthH;
        const plinthGeo=uv(new T.BoxGeometry(w,plinthH,d),x,p.min[1]+plinthH/2,z,2.4);
        const plinth=new T.Mesh(plinthGeo,stone);plinth.name=p.id;plinth.position.set(x,p.min[1]+plinthH/2,z);plinth.castShadow=plinth.receiveShadow=true;structure.add(plinth);
        const upperGeo=uv(new T.BoxGeometry(w,upperH,d),x,p.min[1]+plinthH+upperH/2,z,2.2);
        const upper=new T.Mesh(upperGeo,material(p));upper.name=p.id;upper.position.set(x,p.min[1]+plinthH+upperH/2,z);upper.castShadow=upper.receiveShadow=true;structure.add(upper);
        continue;
      }
      const rounded=!['floor','step','ceiling','wall'].includes(p.kind)&&root.WitnessModularKit&&Math.max(w,h,d)<4;
      const shape=rounded?root.WitnessModularKit.bevelBox(T,w,h,d,bevelRadius(w,h,d),2):new T.BoxGeometry(w,h,d);
      const geo=uv(shape,x,y,z,2);
      const m=new T.Mesh(geo,material(p));m.name=p.id;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;structure.add(m);
    }
    root.WitnessQ01.batch(T,structure);
    const scenery=new T.Group();scenery.name='q01-static-dressing';group.add(scenery);
    function mesh(geo,m,x,y,z,name=''){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.name=name;scenery.add(o);return o;}
    function box(x,y,z,w,h,d,m=wood,name=''){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,name);}
    function rod(a,b,r,m=wood){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),o=mesh(new T.CylinderGeometry(r,r,v.length(),8),m,...av.add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
    for(const x of [-27,-24,-18,-15.4]){rod([x,2.58,-19.9],[x,2.58,-13.6],.075);rod([x,4.82,-20.5],[x,4.82,-7.7],.10);}
    for(const z of [-19.8,-17.9,-15.8])rod([-28.1,4.73,z],[-14.9,4.73,z],.10);
    // Restrained cargo, oars and cloth establish lived-in working places.
    for(const [x,z]of [[-26,-10],[-24,-9.6],[1,-20],[-3,-22],[-14,3]]){
      const sack=mesh(new T.SphereGeometry(.36,12,8),mat('#9d8d6d'),x,.42,z,'grain-sack');sack.scale.set(1,1.3,.8);rod([x,.75,z],[x+.05,.9,z],.028,rope);
    }
    for(const x of [-6.3,-5.8]){rod([x,.2,3.7],[x+.4,2.6,3.7],.035);const blade=box(x+.37,2.28,3.7,.2,.6,.035,wood);blade.rotation.z=-.17;}
    const wet=box(-5.25,.916,-.1,1.15,.014,.52,mat('#817e6a'),'damp-transport-wrap');wet.rotation.y=.09;
    base.group.getObjectByName('intact-family-book').visible=false;
    const greyCover=base.group.getObjectByName('separate-folded-cover');if(greyCover)greyCover.visible=false;
    const bookTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#5c4c3c';ctx.fillRect(0,0,256,256);ctx.fillStyle='#45372b';ctx.fillRect(0,0,34,256);ctx.fillStyle='#3b3024';ctx.beginPath();ctx.arc(178,190,42,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a7926b';ctx.lineWidth=3;ctx.strokeRect(42,18,198,220);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;})();
    const bookMat=mat('#ffffff',.82,{map:bookTex});
    const book=new T.Group();book.name='q01-intact-family-book';group.add(book);book.position.set(-5.55,.93,-.12);
    for(const y of [-.014,.014]){const o=new T.Mesh(new T.BoxGeometry(.215,.010,.165),bookMat);o.position.y=y;o.castShadow=true;book.add(o);}
    book.add(new T.Mesh(new T.BoxGeometry(.198,.024,.152),paper));
    for(let i=0;i<6;i++){const stitch=new T.Mesh(new T.TorusGeometry(.007,.0022,4,8),rope);stitch.position.set(-.105,(i%2?.003:-.003),-.058+i*.023);stitch.rotation.y=Math.PI/2;book.add(stitch);}
    const looseCover=new T.Group();looseCover.name='q01-loose-folded-cover';group.add(looseCover);looseCover.position.set(-4.58,.924,-.08);looseCover.rotation.y=-.14;
    for(const [dy,rz,c]of [[0,.02,'#c7b892'],[.006,-.03,'#d7caaa']]){const fl=new T.Mesh(new T.BoxGeometry(.22,.005,.165),mat(c,.9));fl.position.y=dy;fl.rotation.z=rz;looseCover.add(fl);}
    // B06 remains at this desk; raking light exposes fibres without granting E02.
    const b06=base.group.getObjectByName('b06-register');b06.material=paper;
    const dryLining=base.group.getObjectByName('dry-lining');if(dryLining)dryLining.material=mat('#9e9580',.95);
    for(let i=0;i<6;i++){const line=box(-20.51,.964,-4.34+i*.046,.38,.002,.006,mat(i===3?'#7e7666':'#565047'));line.rotation.y=.025;}
    const overlay=box(-20.39,.966,-4.14,.2,.002,.1,mat('#d9c9a5'));overlay.rotation.y=.03;
    const halos=[],flameGlowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(255,244,206,1)');g.addColorStop(.28,'rgba(255,182,82,.68)');g.addColorStop(.65,'rgba(232,102,28,.18)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;return tx;})();
    function sign(text,x,y,z,width){const w=Math.min(width,1.18),c=document.createElement('canvas');c.width=512;c.height=112;const ctx=c.getContext('2d');ctx.fillStyle='#4a3b2a';ctx.fillRect(0,0,512,112);ctx.fillStyle='#3b2e20';for(let r=0;r<12;r++)ctx.fillRect(0,r*9,512,2);ctx.strokeStyle='#b49a68';ctx.lineWidth=4;ctx.strokeRect(8,8,496,96);ctx.fillStyle='#efe3c7';ctx.font='600 34px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,57,464);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const m=mat('#ffffff',.84,{map:tx}),h=w*112/512;box(x,y-.22,z,w+.07,h+.07,.032,dark,'diegetic-sign-frame');box(x,y-.22,z+.014,w,h,.022,m,'diegetic-sign');for(const sx of [-w*.42,w*.42])box(x+sx,y-.22,z+.024,.025,.025,.024,iron,'sign-stud');}
    sign('XƯỞNG NATAN',-5.5,2.78,-1.97,1.08);sign('KHO PHÍA TÂY',-23.0,3.26,-9.32,1.22);sign('BẾP CHUNG',7.0,1.62,5.55,.98);
    function lamp(x,y,z){const clay=mat('#935d38',.78),soot=mat('#2c241d',.92);const body=mesh(new T.SphereGeometry(.095,14,9),clay,x,y+.026,z);body.scale.set(1.08,.42,.74);const nozzle=mesh(new T.CylinderGeometry(.018,.032,.075,8),soot,x+.078,y+.034,z);nozzle.rotation.z=-Math.PI/2.3;const handle=mesh(new T.TorusGeometry(.034,.009,6,14,Math.PI*1.3),clay,x-.088,y+.032,z);handle.rotation.y=Math.PI/2;const f=mesh(new T.SphereGeometry(.016,8,6),mat('#ffdc9c',.15,{emissive:'#ff9c3b',emissiveIntensity:2.6}),x+.095,y+.068,z);group.attach(f);f.scale.set(.85,2.1,.85);flames.push(f);const haloMat=new T.SpriteMaterial({map:flameGlowTex,color:'#ffb85e',transparent:true,opacity:.48,blending:T.AdditiveBlending,depthWrite:false});ownedMaterials.add(haloMat);const halo=new T.Sprite(haloMat);halo.position.set(x+.095,y+.078,z);halo.scale.set(.32,.36,1);group.add(halo);halos.push(halo);const l=new T.PointLight('#ffb768',2.2,5.6,2);l.position.set(x+.04,y+.24,z);l.userData.baseX=l.position.x;l.userData.baseY=l.position.y;group.add(l);lamps.push(l);}
    lamp(-4.1,.91,-.1);lamp(-3.04,.47,5.75);box(13.6,.42,6.2,.24,.84,.24,wood,'lodging-lamp-post');box(13.6,.85,6.2,.34,.06,.34,stone,'lodging-lamp-cap');lamp(13.6,.88,6.2);lamp(7.8,.91,5);box(-27,2.72,-15.8,.42,.42,.42,wood,'warehouse-lamp-crate');lamp(-27,2.93,-15.8);
    // Seated night props: earthen water cup and coiled rope beside Natan.
    const cupMat=mat('#7f593f',.52);mesh(new T.LatheGeometry([[0,0],[.042,0],[.054,.045],[.048,.095],[.052,.11]].map(p=>new T.Vector2(...p)),14),cupMat,-2.72,.462,5.76,'q01-night-cup');
    const handRope=new T.Group();handRope.name='q01-natan-rope';for(let k=0;k<3;k++){const coil=new T.Mesh(new T.TorusGeometry(.055+k*.008,.007,6,18),rope);coil.rotation.x=Math.PI/2+k*.08;coil.position.y=k*.006;handRope.add(coil);}handRope.position.set(-2.72,.472,5.88);group.add(handRope);
    // Original [H] hull below the unchanged boat/pier support planes.
    // The open deck and all three guard volumes remain the PR-04 geometry.
    const arrivalHull=mesh(new T.LatheGeometry([[0,-1.1],[.65,-1],[1.25,-.65],[1.43,-.12],[1.4,-.04]].map(p=>new T.Vector2(...p)),32),wood,-6,0,-30.5,'arrival-boat-hull');arrivalHull.scale.z=1.6;
    const sailTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#cfc2a3';ctx.fillRect(0,0,256,256);ctx.strokeStyle='#b6a887';ctx.lineWidth=2;for(let y=32;y<256;y+=52){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}for(let x=48;x<256;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,256);ctx.stroke();}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;})();
    const canvas=mat('#ffffff',.94,{map:sailTex,side:T.DoubleSide});
    function sailGeometry(topW,botW,h,belly){const g=new T.PlaneGeometry(1,h,8,6),p=g.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i)+.5,v=(p.getY(i)/h)+.5;p.setX(i,(u-.5)*(botW+(topW-botW)*v));p.setZ(i,Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*belly);}g.computeVertexNormals();return g;}
    const horizon=new T.Group();horizon.name='q01-harbour-silhouette';group.add(horizon);
    for(let i=0;i<16;i++){const x=-45+i*5.4,z=25+Math.sin(i)*2,h=3.5+(i%4)*.6;const o=box(x,h/2,z,5,h,5,plaster);horizon.attach(o);const cap=box(x,h+.12,z,5.3,.24,5.3,stone);horizon.attach(cap);}
    for(let i=0;i<10;i++){const x=30+i*2.7;const col=mesh(new T.CylinderGeometry(.25,.29,4.1,12),stone,x,2.05,-8);horizon.attach(col);const cap=box(x,4.1,-8,.85,.25,.85,stone);horizon.attach(cap);}
    for(const x of [-45,39]){const mast=rod([x,-.7,-48],[x,7.6,-48],.07,dark);horizon.attach(mast);const yard=rod([x-1.7,6.4,-48],[x+1.7,6.4,-48],.045,dark);horizon.attach(yard);const boom=rod([x-2.1,2.2,-48],[x+2.1,2.2,-48],.04,dark);horizon.attach(boom);const sail=mesh(sailGeometry(3.2,4.0,4.2,.55),canvas,x,4.3,-47.9);horizon.attach(sail);}
    // The harbour has depth beyond the walkable quay: two protective arms,
    // moored hulls and a distant light. All of this stays outside the playable
    // boundary, clear of the rooftop's limited rear-alley sightline [H].
    for(const line of [[[-40,-25],[-46,-45],[-44,-62],[-34,-70]],[[30,-25],[34,-44],[28,-62],[18,-68]]])for(let i=1;i<line.length;i++){
      const [ax,az]=line[i-1],[bx,bz]=line[i],length=Math.hypot(bx-ax,bz-az),count=Math.ceil(length/2.4);
      for(let j=0;j<count;j++){const k=(j+.5)/count,x=ax+(bx-ax)*k,z=az+(bz-az)*k;const block=box(x,-.05,z,3.8,1.45,length/count+.08,stone);block.rotation.y=Math.atan2(bx-ax,bz-az);horizon.attach(block);const cap=box(x,.77,z,4,.18,length/count+.1,stone);cap.rotation.y=block.rotation.y;horizon.attach(cap);}
    }
    const clay=mat('#a4714f');
    for(const [index,x,z,yaw]of [[0,-18,-34,.2],[1,10,-38,-.3],[2,-30,-46,.6],[3,21,-51,-.5]]){
      const boat=new T.Group();boat.position.set(x,-.65,z);boat.rotation.y=yaw;horizon.add(boat);
      const hull=new T.Mesh(new T.LatheGeometry([[0,-.38],[.65,-.3],[1.14,.05],[1.28,.46],[1.18,.54],[1.06,.39],[.65,-.16],[0,-.19]].map(p=>new T.Vector2(...p)),18),wood);hull.scale.z=2.6;hull.castShadow=hull.receiveShadow=true;boat.add(hull);
      for(let j=0;j<11;j++){const plank=new T.Mesh(new T.BoxGeometry(1.82,.07,.43),wood);plank.position.set(0,.18,-2.25+j*.45);plank.receiveShadow=true;boat.add(plank);}
      for(const dz of [-1.7,0,1.7]){const seat=new T.Mesh(new T.BoxGeometry(2.0,.09,.26),dark);seat.position.set(0,.43,dz);boat.add(seat);}
      const mast=new T.Mesh(new T.CylinderGeometry(.05,.075,5.1,8),dark);mast.position.set(0,2.65,-.3);boat.add(mast);
      const yard=new T.Mesh(new T.CylinderGeometry(.032,.038,2.5,8),dark);yard.rotation.z=Math.PI/2;yard.rotation.y=.22;yard.position.set(0,4.65,-.3);boat.add(yard);
      const boom=new T.Mesh(new T.CylinderGeometry(.028,.032,3.15,8),dark);boom.rotation.z=Math.PI/2;boom.rotation.y=.22;boom.position.set(0,1.75,-.3);boat.add(boom);
      const sail=new T.Mesh(sailGeometry(2.3,3.0,2.9,.42),canvas);sail.position.set(0,3.2,-.22);sail.rotation.y=.22;boat.add(sail);
      for(let j=0;j<3;j++){const jar=new T.Mesh(new T.LatheGeometry([[0,0],[.16,.04],[.26,.36],[.2,.52],[.08,.63],[.09,.7]].map(p=>new T.Vector2(...p)),10),clay);jar.position.set(-.4+j*.35,.22,1.4);boat.add(jar);}
    }
    const tower=mesh(new T.CylinderGeometry(1.45,1.8,8.5,10),stone,-39,3.7,-66,'harbour-light-tower');horizon.attach(tower);
    const crown=box(-39,8.3,-66,3.4,.35,3.4,stone);horizon.attach(crown);for(const x of [-40.2,-37.8])for(const z of [-67.2,-64.8]){const post=box(x,9.1,z,.24,1.5,.24,stone);horizon.attach(post);}const lid=box(-39,10,-66,3.4,.26,3.4,stone);horizon.attach(lid);
    root.WitnessQ01.batch(T,horizon);
    root.WitnessQ01.batch(T,scenery);
    const ocean=root.AdventureVisuals.water(T,'#316b72',320,160,false,'shore',{foamEdge:.09,waveScale:.032,fragmentWaves:true,whitecapStrength:.07}),sea=ocean.water,seaMaterial=sea.material;
    sea.position.set(0,-.62,-104);sea.name='q01-harbour-sea';group.add(sea);
    const fireGroup=new T.Group();fireGroup.name='q01-contained-fire';group.add(fireGroup);
    const flameMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{time:{value:0},strength:{value:1}},vertexShader:'varying vec2 v;uniform float time;void main(){v=uv;vec3 p=position;p.x+=sin(uv.y*9.+time*5.+position.x)*uv.y*.09;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'varying vec2 v;uniform float time;uniform float strength;void main(){float edge=1.-abs(v.x-.5)*2.;float f=smoothstep(0.,.45,edge)*(1.-v.y)*(.7+.3*sin(v.y*17.-time*5.));float a=smoothstep(.04,.65,f)*strength;gl_FragColor=vec4(mix(vec3(.7,.10,.014),vec3(1.,.64,.16),f),a*.75);}' });ownedMaterials.add(flameMaterial);
    for(let i=0;i<12;i++){const o=new T.Mesh(new T.PlaneGeometry(.65,1.8),flameMaterial);o.position.set(-26.4+(i%4)*.42,.85,-10.4+Math.floor(i/4)*.48);o.rotation.y=i*1.79;fireGroup.add(o);}
    const fireLight=new T.PointLight('#ff993e',24,10,2);fireLight.position.set(-25.5,1.1,-9.8);fireGroup.add(fireLight);
    const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),grad=ctx.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(173,166,151,.25)');grad.addColorStop(.5,'rgba(128,124,115,.13)');grad.addColorStop(1,'rgba(95,95,90,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);const smokeTexture=new T.CanvasTexture(c);
    const smokeMaterial=new T.SpriteMaterial({map:smokeTexture,transparent:true,depthWrite:false,opacity:.4,color:'#77756c'});ownedMaterials.add(smokeMaterial);
    for(let i=0;i<22;i++){const o=new T.Sprite(smokeMaterial);o.name='q01-smoke';group.add(o);smoke.push(o);}
    base.group.getObjectByName('contained-fire-volume').visible=false;
    const profiles={titus:'wt-titus',natan:'wt-natan',yosef:'wt-yosef',rina:'wt-rina',simeon:'traveler',apprentice:'craft-apprentice',worker1:'disciple',worker2:'traveler',dockworker:'traveler',sawyer:'traveler',deskkeeper:'traveler'};
    const starts={titus:G.anchors.titus,natan:{x:-4,y:0,z:1,supportId:'world'},yosef:{x:-2,y:0,z:-12,supportId:'world'},rina:{x:8.7,y:0,z:4.2,supportId:'world'},simeon:G.anchors.simeon,apprentice:G.anchors.apprentice,worker1:{x:-22.5,y:0,z:-1,supportId:'world'},worker2:{x:-21,y:0,z:-1,supportId:'world'},dockworker:{x:-7.8,y:0,z:-22.5,supportId:'world'},sawyer:{x:-11.2,y:0,z:-9.5,supportId:'world'},deskkeeper:{x:15.5,y:0,z:5.9,supportId:'world'}};
    if(!state.quests.Q01.done.includes('brace'))starts.natan={x:-11.2,y:0,z:6,supportId:'world'};
    const supporting={simeon:{tunic:'#947356',mantle:'#635d49',age:.48,beard:.045,build:1.04},apprentice:{tunic:'#7d9389',mantle:'#a39775',age:.18,beard:0,build:.88,height:.94},worker1:{tunic:'#6c8188',mantle:'#8b7c64',age:.34,beard:.02},worker2:{tunic:'#a18b69',mantle:'#675d50',headcover:'shawl',age:.42,beard:.035},dockworker:{tunic:'#a07354',mantle:'#7e7459',beard:.03,age:.42},sawyer:{tunic:'#718774',mantle:'#968b70',beard:.02,age:.33},deskkeeper:{tunic:'#a89c80',mantle:'#706656',age:.57,beard:.055,hairColor:'#817366'}};
    for(const [id,profile]of Object.entries(profiles)){const look=root.CharacterProfiles.get(profile),model=root.AdventureCharacter.create(T,id==='rina'?'magdalene':'andrew',{appearance:profile,overrides:{...look,...supporting[id],id:'q01-'+id,name:id,kind:'fictional',ornament:'none',item:id==='titus'?'rope':id==='rina'?'basket':null}}),p=starts[id];model.object.name='q01-actor-'+id;model.object.position.set(p.x,p.y,p.z);model.object.userData.supportId=p.supportId;model.object.userData.heightAt=(x,z)=>ar.supports(x,z).filter(s=>Math.abs(s.y-model.object.position.y)<.3).sort((a,b)=>Math.abs(a.y-model.object.position.y)-Math.abs(b.y-model.object.position.y))[0]?.y??model.object.position.y;scene.add(model.object);actors[id]={...model,moving:false,posture:'idle'};}
    function silhouette(id,x,z){const baseLook=root.CharacterProfiles.get('traveler'),fig=root.AdventureCharacter.create(T,'andrew',{appearance:'traveler',overrides:{...baseLook,tunic:'#5d5548',mantle:'#322f2a',cloak:'shoulder',cloth:'wool',headcover:'shawl',beard:.015,hem:.34,item:null,ornament:'none',id:'q01-'+id,name:id,kind:'fictional'}});fig.object.name='q01-'+id;fig.object.position.set(x,0,z);group.add(fig.object);return fig;}
    const strangerRig=silhouette('stranger',G.anchors.stranger.x,G.anchors.stranger.z),rearRig=silhouette('rear',-26,-23);
    const stranger=strangerRig.object,rear=rearRig.object;let departing=0,strangerPath=[],rearMoving=0,speaking=null,latest=state,currentPhase='afternoon',phaseFrom=null,performanceKind=null;
    stranger.userData.supportId='world';
    rear.visible=false;let viewer=null,crafted=root.WitnessCraftRenderer?.create({T,scene,height:()=>0});crafted?.update(state);
    const bookRest=(()=>{const player=scene.getObjectByName('player');return player?[-.185,.86,.06]:[-5.55,.93,-.12];})();
    const dockBookOnHip=()=>{book.position.set(-.185,.86,.06);book.rotation.set(.14,.18,Math.PI/2-.16);};
    const setNightRopeRest=laid=>{if(!handRope)return;if(laid){group.add(handRope);handRope.position.set(-2.58,.472,5.79);handRope.rotation.set(0,.4,0);}else{const nHand=actors.natan?.object?.getObjectByName('hand_r');if(nHand){nHand.add(handRope);handRope.position.set(0,-.04,.04);handRope.rotation.set(.4,0,.2);}else{group.add(handRope);handRope.position.set(-2.58,.472,5.79);}}};
    const palettes={
      afternoon:{top:'#2f6386',bottom:'#e8cfa3',glow:'#ffdba0',sun:'#ffe4b2',sunPos:[-26,15,-24],intensity:3.15,ambient:1.22,hemi:'#d8e6f4',ground:'#827358',rim:'#9cc0dc',rimInt:.34,fog:.0022,lamp:.45,halo:.22,deep:'#1d4b58',shallow:'#3e7b77',cloud:'#fff2da',cloudDensity:.42,stars:0,exposure:[1.06,1.82,1.35],lut:[1.05,1.03,0.12]},
      evening:{top:'#1b2c49',bottom:'#b4785d',glow:'#ec9456',sun:'#f3b584',sunPos:[-28,9,-18],intensity:1.22,ambient:.84,hemi:'#9ab0cb',ground:'#4b4953',rim:'#6f8cb5',rimInt:.28,fog:.0038,lamp:2.55,halo:.78,deep:'#142e3b',shallow:'#2d4e5a',cloud:'#e89d72',cloudDensity:.52,stars:.18,exposure:[1.08,1.52,1.36],lut:[1.02,1.04,0.22]},
      night:{top:'#070e1c',bottom:'#1d2d44',glow:'#324966',sun:'#9dc0e8',sunPos:[18,26,-20],intensity:.42,ambient:.54,hemi:'#7c98be',ground:'#232933',rim:'#7fa4d4',rimInt:.22,fog:.0034,lamp:1.45,halo:.86,deep:'#0a1724',shallow:'#152c3b',cloud:'#283b56',cloudDensity:.34,stars:.92,exposure:[1.24,1.38,1.42],lut:[0.92,1.03,-0.22]},
      dawn:{top:'#3c688a',bottom:'#f0be96',glow:'#ffd29e',sun:'#ffdcb0',sunPos:[26,11,-15],intensity:2.15,ambient:1.12,hemi:'#dce8f3',ground:'#70746e',rim:'#b7cce0',rimInt:.32,fog:.0026,lamp:.55,halo:.25,deep:'#214c5c',shallow:'#427478',cloud:'#ffd7b2',cloudDensity:.38,stars:.04,exposure:[1.05,1.72,1.34],lut:[1.04,1.02,0.18]}
    };
    scene.fog=new T.FogExp2(palettes.afternoon.bottom,.0022);scene.background=new T.Color(palettes.afternoon.bottom);
    const sky=scene.children.find(o=>o.name==='greybox-sky');
    let aaaSky=null,aaaBeacon=null,aaaRegistry=null,activePhase='afternoon',fromPalette=palettes.afternoon,toPalette=palettes.afternoon,phaseMix=1;
    function ensureSkyAndRim(){
      if(aaaSky)return;
      if(sky)sky.visible=false;
      const skyGeo=new T.SphereGeometry(95,40,24);
      const skyMat=new T.ShaderMaterial({
        side:T.BackSide,depthWrite:false,fog:false,
        uniforms:{
          uTop:{value:new T.Color(palettes.afternoon.top)},
          uBottom:{value:new T.Color(palettes.afternoon.bottom)},
          uGlow:{value:new T.Color(palettes.afternoon.glow)},
          uCloudTint:{value:new T.Color(palettes.afternoon.cloud)},
          uSunDir:{value:new T.Vector3(-.64,.37,-.59).normalize()},
          uTime:{value:0},uCloudDensity:{value:.42},uStars:{value:0}
        },
        vertexShader:`varying vec3 vDir; void main(){ vDir = normalize(position); vec3 wp = position + vec3(cameraPosition.x, 0.0, cameraPosition.z); gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0); }`,
        fragmentShader:`
          uniform vec3 uTop,uBottom,uGlow,uCloudTint,uSunDir;
          uniform float uTime,uCloudDensity,uStars;
          varying vec3 vDir;
          float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
          float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+1.),f.x),f.y); }
          float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<4;i++){ s+=a*vnoise(p); p=mat2(.8,-.6,.6,.8)*p*2.03; a*=.5; } return s; }
          void main(){
            vec3 d = normalize(vDir);
            float h = clamp(d.y, 0., 1.);
            vec3 col = mix(uBottom, uTop, pow(h, .52));
            float sunDot = max(0., dot(d, normalize(uSunDir)));
            float horizonBand = exp(-abs(d.y) * 6.5);
            col += uGlow * (pow(sunDot, 7.0) * .42 + pow(sunDot, 120.0) * .95) * (1. - uStars * .65);
            col = mix(col, uGlow, horizonBand * .32 * pow(max(0., dot(normalize(vec3(d.x,0.,d.z)), normalize(vec3(uSunDir.x,0.,uSunDir.z)))), 2.));
            if(d.y > .02){
              vec2 uv = d.xz / (d.y + .18) * 1.15 + vec2(uTime * .009, uTime * .004);
              float n = fbm(uv);
              float c = smoothstep(.52 - uCloudDensity * .24, .82, n) * smoothstep(.02, .22, d.y);
              vec3 cCol = mix(col * 1.1 + vec3(.04), uCloudTint * (1. + pow(sunDot, 5.) * .45), .75);
              col = mix(col, cCol, c * .58 * smoothstep(.03, .18, uCloudDensity + .15));
            }
            if(uStars > .01 && d.y > .06){
              vec2 suv = floor(d.xz / (d.y + .3) * 190.);
              float star = step(.9962, h21(suv)) * smoothstep(.06, .35, d.y);
              float twinkle = .55 + .45 * sin(uTime * 1.8 + h21(suv + 9.1) * 40.);
              col += vec3(.86, .91, 1.0) * star * twinkle * uStars * .9;
            }
            if(d.y < 0.) col = mix(uBottom, uTop * .45, clamp(-d.y * 4., 0., 1.));
            gl_FragColor = vec4(col, 1.);
          }`
      });
      ownedMaterials.add(skyMat);
      aaaSky=new T.Mesh(skyGeo,skyMat);aaaSky.name='q01-aaa-sky';aaaSky.renderOrder=-10;aaaSky.frustumCulled=false;group.add(aaaSky);
    }
    const sunDirVec=new T.Vector3(),cTmp=new T.Color();
    function applyAtmosphere(from,to,rawAlpha){
      ensureSkyAndRim();
      const s=Math.max(0,Math.min(1,rawAlpha)),alpha=s*s*(3-2*s);
      const col=k=>new T.Color(from[k]).lerp(new T.Color(to[k]),alpha);
      const val=k=>from[k]+(to[k]-from[k])*alpha;
      const sx=from.sunPos[0]+(to.sunPos[0]-from.sunPos[0])*alpha,sy=from.sunPos[1]+(to.sunPos[1]-from.sunPos[1])*alpha,sz=from.sunPos[2]+(to.sunPos[2]-from.sunPos[2])*alpha;
      sunDirVec.set(sx,sy,sz).normalize();
      const u=aaaSky.material.uniforms;
      u.uTop.value.copy(col('top'));u.uBottom.value.copy(col('bottom'));u.uGlow.value.copy(col('glow'));
      u.uCloudTint.value.copy(col('cloud'));u.uSunDir.value.copy(sunDirVec);
      u.uCloudDensity.value=val('cloudDensity');u.uStars.value=val('stars');
      scene.background.copy(col('bottom'));scene.fog.color.copy(col('bottom'));scene.fog.density=val('fog');
      let main=true;
      for(const l of scene.children){
        if(l.isHemisphereLight){l.intensity=val('ambient');l.color.copy(col('hemi'));l.groundColor.copy(col('ground'));}
        else if(l.isDirectionalLight){
          if(main){l.intensity=val('intensity');l.color.copy(col('sun'));l.position.set(sx,sy,sz);l.shadow.needsUpdate=true;main=false;}
          else{l.intensity=val('rimInt');l.color.copy(col('rim'));l.position.set(-sx*.8,Math.max(12,sy+4),-sz*.8);}
        }
      }
      const li=val('lamp'),hi=val('halo');
      lamps.forEach(l=>{l.userData.targetIntensity=li;l.intensity=li;});
      halos.forEach(h=>{h.material.opacity=hi;h.visible=hi>.05;});
      if(aaaBeacon){const nightK=Math.min(1,li/2.6);aaaBeacon.light.intensity=nightK*16;aaaBeacon.flame.scale.setScalar(.85+nightK*.55);}
      seaMaterial.uniforms.waterColor.value.copy(col('deep'));
      seaMaterial.uniforms.shallowColor.value.copy(col('shallow'));
      seaMaterial.uniforms.skyColor.value.copy(col('top'));
      seaMaterial.uniforms.horizonColor.value.copy(col('bottom'));
      seaMaterial.uniforms.sunlight.value.copy(col('sun'));
      seaMaterial.uniforms.fogColor.value.copy(col('bottom'));
      if(seaMaterial.uniforms.sun)seaMaterial.uniforms.sun.value.copy(sunDirVec);
      if(seaMaterial.uniforms.uWhitecapStrength)seaMaterial.uniforms.uWhitecapStrength.value=to===palettes.night?.26:.42;
      scene.userData.q01Time={phase:activePhase,transition:rawAlpha};
      scene.userData.q01Exposure={outside:from.exposure[0]+(to.exposure[0]-from.exposure[0])*alpha,insideDay:from.exposure[1]+(to.exposure[1]-from.exposure[1])*alpha,insideEvening:from.exposure[2]+(to.exposure[2]-from.exposure[2])*alpha};
      const graphics=scene.userData.graphics;
      if(graphics){
        graphics.fogDensity=val('fog');graphics.fogFalloff=.18;graphics.fogColor?.copy(col('bottom'));
        if(root.WitnessGraphics?.lut){
          const targetKey='Q01-'+activePhase;
          if(alpha>.98&&graphics.lutKey!==targetKey){
            const [sat,con,warm]=to.lut;
            graphics.lut=root.WitnessGraphics.lut(T,targetKey,{saturation:sat,contrast:con,shadows:[warm*.004,.001,-warm*.006],highlights:[warm*.014,.004,-warm*.009]});
            graphics.lutKey=targetKey;
          }
        }
      }
    }
    function setTime(phase,alpha=1){
      if(phase!==activePhase){fromPalette=toPalette||palettes[activePhase];activePhase=phase;toPalette=palettes[phase];}
      phaseMix=alpha;
      applyAtmosphere(fromPalette,toPalette,alpha);
    }
    // AAA Harbour, Sea Bathymetry, VFX & Levantine Architecture Extensions
    const ownedTextures=new Set([flameGlowTex,sailTex,bookTex,smokeTexture]),winchSheaves=[];
    const fireEmberCount=48,fireEmberData=Array.from({length:fireEmberCount},(_,i)=>({phase:i/fireEmberCount,rad:.15+((i*37)%100)/100*.65,ang:i*2.39996,speed:.45+((i*19)%10)/20}));
    let fireEmbers=null,aaaVfx=null,sunBeams=[],airMotes=null,boatRigGroup=null;
    const hideLeakedFoliage=()=>{const own=o=>{let cur=o;while(cur){if(cur===group||cur===base.group||cur===crafted?.group)return true;cur=cur.parent;}return false;};scene.traverse(o=>{if(o.isInstancedMesh&&!own(o))o.visible=false;});};
    const patchSeaShader=()=>{
      const frag=seaMaterial?.fragmentShader;if(!frag||frag.includes('q01ShoreDepth'))return;
      let next=frag
        .replace(
          '// Dual scrolling normal maps moving against each other.\n          vec3 n1 = texture2D(uNormalMap, point * .16 + vec2(time * .023, time * .017)).xyz * 2. - 1.;\n          vec3 n2 = texture2D(uNormalMap, point * .37 - vec2(time * .031, time * .013)).xyz * 2. - 1.;\n          vec2 detail = n1.xy * .55 + n2.xy * .45;\n          float detailGain = .45 / (1. + viewDist * .032);',
          '// Rotated + domain-warped multi-octave capillary normals eliminate specular grid tiling.\n          vec2 warp = vec2(fbmNoise(point * .085 + vec2(time * .011, -time * .009)), fbmNoise(point * .085 + vec2(4.7 - time * .010, time * .012))) * .36;\n          vec2 p1 = mat2(.838, -.545, .545, .838) * (point * .135 + warp * .22) + vec2(time * .021, time * .015);\n          vec2 p2 = mat2(-.391, .920, -.920, -.391) * (point * .275 - warp * .18) - vec2(time * .027, time * .011);\n          vec2 p3 = mat2(.624, .781, -.781, .624) * (point * .52 + warp * .09) + vec2(time * .014, -time * .017);\n          vec3 n1 = texture2D(uNormalMap, p1).xyz * 2. - 1.;\n          vec3 n2 = texture2D(uNormalMap, p2).xyz * 2. - 1.;\n          vec3 n3 = texture2D(uNormalMap, p3).xyz * 2. - 1.;\n          vec2 detail = n1.xy * .48 + n2.xy * .34 + n3.xy * .18;\n          float detailGain = (.38 + .10 * uWhitecapStrength) / (1. + viewDist * .038);'
        )
        .replace(
          '// Beer-Lambert extinction over measured bed depth.\n          float depth = bedDepth(point);',
          '// Beer-Lambert extinction with Caesarea quay, jetty & breakwater bathymetry (q01ShoreDepth).\n          float depth = bedDepth(point);\n          if (uHasBed < .5) {\n            float quayDist = max(0., -24.1 - point.y) + max(0., abs(point.x + 2.5) - 34.);\n            float jettyDist = length(max(abs(point - vec2(-6.0, -27.8)) - vec2(1.5, 4.3), 0.));\n            float bwWest = max(0., abs(point.x + 42.5) - 2.6) + max(0., abs(point.y + 47.) - 22.);\n            float bwEast = max(0., abs(point.x - 28.5) - 2.6) + max(0., abs(point.y + 46.) - 21.);\n            float stoneDist = min(min(quayDist, jettyDist), min(bwWest, bwEast));\n            float washNoise = (fbmNoise(point * .58 + vec2(0., time * .04)) - .5) * .55;\n            depth = clamp(.22 + stoneDist * .44 + washNoise * smoothstep(2.6, 0., stoneDist) + max(0., -point.y - 32.) * .08, .08, 3.6);\n          }'
        )
        .replace(
          'float foam = shore * smoothstep(.30, .72, foamNoise + lap * .38);',
          'float foam = shore * smoothstep(.42, .82, foamNoise + lap * .26) * .58;'
        );
      if(next!==frag){seaMaterial.fragmentShader=next;seaMaterial.needsUpdate=true;}
    };
    const makeLinenTex=()=>{
      const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d');
      ctx.fillStyle='#a69d88';ctx.fillRect(0,0,128,128);
      for(let y=0;y<128;y+=3){ctx.fillStyle=y%6===0?'rgba(255,248,232,.07)':'rgba(48,40,28,.06)';ctx.fillRect(0,y,128,1);}
      for(let x=0;x<128;x+=4){ctx.fillStyle=x%8===0?'rgba(255,248,232,.05)':'rgba(48,40,28,.05)';ctx.fillRect(x,0,1,128);}
      const tx=new T.CanvasTexture(c);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(4,2);tx.colorSpace=T.SRGBColorSpace;ownedTextures.add(tx);return tx;
    };
    const makeRadialSpriteTex=(inner,mid)=>{
      const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,2,32,32,30);
      g.addColorStop(0,inner);g.addColorStop(.45,mid);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
      const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;ownedTextures.add(tx);return tx;
    };
    function initAAAExtensions(){
      hideLeakedFoliage();
      patchSeaShader();
      // Matte woven linen on Natan's drying cloth prevents glare blowouts
      if(dryLining)dryLining.material=mat('#ffffff',.96,{map:makeLinenTex()});
      // Replace basic greybox mechanism materials on moving cables/drum/lever with PBR materials
      for(const id of ['hand-rope','rope-to-drum','rope-to-outrigger','panel-rope','load-rope']){const m=base.group.getObjectByName(id);if(m)m.material=rope;}
      for(const id of ['winch-drum','winch-trestle','winch-outrigger','lever-pole']){const m=base.group.getObjectByName(id);if(m)m.material=id==='lever-pole'?dark:wood;}
      // 1) Harbor Quay Apron, Bollards, Pilings, Boat Stem/Mast/Hawsers & Horizon Expansion
      const aaaHarbor=new T.Group();aaaHarbor.name='q01-pr05-harbor';group.add(aaaHarbor);
      const hMesh=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;aaaHarbor.add(o);return o;};
      const hBox=(x,y,z,w,h,d,m=stone)=>hMesh(new T.BoxGeometry(w,h,d),m,x,y,z);
      const hRod=(a,b,r,m=dark,parent=aaaHarbor)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),o=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),8),m);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
      // Battered stone quay seawall west & east of arrival-pier plus oak mooring pilings
      hBox(-21.8,-.75,-24.25,28.8,1.5,.45,stone);hBox(10,-.75,-24.25,29.8,1.5,.45,stone);
      for(const bx of [-13,-7.75,-4.25,2,10.5,18]){
        hMesh(new T.CylinderGeometry(.17,.2,.75,10),stone,bx,.37,-24.2);
        hMesh(new T.TorusGeometry(.16,.03,6,14),iron,bx,.66,-24.2).rotation.x=Math.PI/2;
      }
      for(const px of [-32,-26,-20,-14,-9.2,-2.8,3,9,16,22]){
        const pile=hMesh(new T.CylinderGeometry(.15,.18,2.1,9),dark,px,-.35,-24.58);
        hMesh(new T.CylinderGeometry(.165,.165,.08,9),iron,px,.52,-24.58);
        if(pile)pile.rotation.z=(px%2)?.02:-.02;
      }
      // Curved merchant boat bow stempost, gunwale rub-rails, port derrick mast & mooring hawsers outside deck bounds
      boatRigGroup=new T.Group();boatRigGroup.name='q01-boat-trim';aaaHarbor.add(boatRigGroup);
      hRod([-6,-.08,-32.0],[-6,1.15,-33.55],.11,dark,boatRigGroup);
      hRod([-6,.88,-32.85],[-6,1.28,-34.1],.065,wood,boatRigGroup);
      for(const sx of [-7.42,-4.58]){
        hRod([sx,.32,-28.9],[sx,.42,-32.15],.075,dark,boatRigGroup);
        hRod([sx,.42,-32.15],[-6,.38,-32.85],.07,dark,boatRigGroup);
      }
      // Stepped cedar mast & furled yard on starboard-aft quarter (frames left edge without blocking deck or harbor)
      hRod([-4.50,.25,-31.85],[-4.50,5.65,-31.75],.065,dark,boatRigGroup);
      hRod([-5.35,4.65,-31.75],[-3.65,4.78,-31.75],.042,wood,boatRigGroup);
      hRod([-4.50,5.4,-31.75],[-4.55,.78,-33.0],.018,rope,boatRigGroup);
      hRod([-4.50,5.25,-31.75],[-4.50,.45,-29.2],.018,rope,boatRigGroup);
      const furledSail=new T.Mesh(new T.CylinderGeometry(.12,.14,1.65,10),mat('#d6cab0',.94));furledSail.rotation.z=Math.PI/2-.06;furledSail.position.set(-4.48,4.61,-31.75);furledSail.castShadow=true;boatRigGroup.add(furledSail);
      // Catenary mooring lines tying cleats to quay bollards
      for(const [ax,az,bx,bz]of [[-7.35,-29.3,-7.75,-24.2],[-4.65,-29.3,-4.25,-24.2]]){
        const midY=.12,pts=[new T.Vector3(ax,.34,az),new T.Vector3((ax+bx)/2,midY,(az+bz)/2),new T.Vector3(bx,.66,bz)];
        const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),12,.026,6,false),rope);m.castShadow=true;aaaHarbor.add(m);
      }
      // Drusion lighthouse brazier & beacon light
      const bFlame=new T.Mesh(new T.ConeGeometry(.42,1.25,8),mat('#ffbe5a',.2,{emissive:'#ff8b26',emissiveIntensity:3}));bFlame.position.set(-39,9.25,-66);aaaHarbor.add(bFlame);
      const bHalo=new T.Sprite(new T.SpriteMaterial({map:flameGlowTex,color:'#ffab48',transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false}));bHalo.position.set(-39,9.3,-66);bHalo.scale.set(2.8,2.8,1);aaaHarbor.add(bHalo);ownedMaterials.add(bHalo.material);
      const bLight=new T.PointLight('#ff9c3c',0,36,1.8);bLight.position.set(-39,9.4,-66);aaaHarbor.add(bLight);
      aaaBeacon={light:bLight,flame:bFlame};
      // Expanded eastern/southern Caesarea town quarters & soft low northern bay headland (no sharp low-poly ramps)
      const farStone=mat('#a79a82',.92),headlandMat=mat('#878b90',.98);
      for(let i=0;i<14;i++){
        const x=29+i*3.2,z=-22+i*3.1,h=3.6+(i%3)*1.1;
        hBox(x,h/2,z,4.8,h,4.4,i%2?plaster:farStone);hBox(x,h+.12,z,5.1,.24,4.7,stone);
      }
      for(let i=0;i<7;i++){const x=-46+i*15;hBox(x,3.2,29.5,6.8,6.4,5.4,farStone);hBox(x,6.5,29.5,7.2,.28,5.8,stone);}
      for(const [hx,hy,hz,rw,rh,rd]of [[-4,.2,-132,190,1.35,16]]){
        const hill=hMesh(new T.SphereGeometry(1,20,8,0,Math.PI*2,0,Math.PI*.5),headlandMat,hx,-.2,hz);if(hill)hill.scale.set(rw,rh,rd);
      }
      // 2) Architectural & Narrative Scene Dressing (static, batched outside navigation & sightlines)
      const aaaDressing=new T.Group();aaaDressing.name='q01-pr05-dressing';group.add(aaaDressing);
      const dMesh=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;aaaDressing.add(o);return o;};
      const dBox=(x,y,z,w,h,d,m=stone)=>dMesh(new T.BoxGeometry(w,h,d),m,x,y,z);
      const dRod=(a,b,r,m=dark)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),o=dMesh(new T.CylinderGeometry(r,r,v.length(),8),m,...av.add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;};
      // Sloped stair carriage stringers under every flight so steps are structurally grounded (eliminates floating steps!)
      for(const [sx,sy,sz,dir,w]of [[-17.7,0,-8.6,1,1.8],[-21.2,2.52,-14.5,1,1.8],[-31,0,-8.6,1,1.8],[-12,2.52,-14.5,1,1.8],[-9,0,-18.98,-1,1.8]]){
        const y0=sy+.02,y1=sy+14*.18-.10,z0=sz-.16*dir,z1=sz-13.5*.32*dir;
        for(const side of [-(w/2-.22),w/2-.22])dRod([sx+side,y0,z0],[sx+side,y1,z1],.095,dark);
      }
      dBox(-9,.65,-16.8,1.2,1.3,.38,stone);dBox(-31,.65,-10.8,1.2,1.3,.38,stone);
      // Warehouse limestone pilasters, door lintels, projecting roof rafter tails & parapet copings
      for(const [px,pz]of [[-28.45,-20.95],[-21.5,-20.95],[-14.55,-20.95],[-28.45,-7.05],[-19.2,-7.05],[-14.55,-7.05]])dBox(px,2.52,pz,.48,5.04,.46,stone);
      dBox(-17.7,2.45,-7.15,2.85,.24,.44,stone);dBox(-28.35,4.96,-14.4,.44,.22,2.55,stone);
      for(let rz=-20;rz<=-8;rz+=2){dBox(-28.62,4.95,rz,.34,.14,.16,dark);dBox(-14.38,4.95,rz,.34,.14,.16,dark);}
      // Pulley structural wall corbel brackets & lever fulcrum block (mechanisms anchored to stone, not floating!)
      dRod([-28.35,5.95,-5.1],[-29.4,6.54,-5.1],.075,iron);dRod([-28.35,6.54,-5.1],[-29.4,6.54,-5.1],.08,dark);
      dBox(-29.4,.12,-5.1,.28,.24,.28,iron);dMesh(new T.TorusGeometry(.09,.022,6,12),iron,-29.4,.28,-5.1).rotation.x=Math.PI/2;
      dRod([-28.35,5.04,-8.05],[-31,6.54,-8.05],.07,iron);dBox(-18.1,.3,-6.05,.46,.6,.46,stone);
      // Workshop pilasters, roof eave rafters, stone parapet coping & Mediterranean cedar-shuttered window on back wall
      for(const wx of [-9.55,-1.45])for(const wz of [-2.05,4.05])dBox(wx,1.55,wz,.34,3.1,.34,stone);
      for(let x=-9.1;x<=-1.9;x+=1.2){dBox(x,3.04,-2.15,.12,.14,.42,dark);dBox(x,3.04,4.15,.12,.14,.42,dark);}
      dBox(-5.5,3.16,4.08,8.3,.12,.38,stone);
      dBox(-4.35,1.62,4.13,1.25,.88,.08,dark);dBox(-4.35,1.62,4.16,.96,.68,.06,mat('#28221b',.92));dBox(-4.35,2.08,4.15,1.42,.12,.16,stone);dBox(-4.35,1.16,4.15,1.38,.10,.16,stone);
      for(let sx=-4.75;sx<=-3.95;sx+=.2)dBox(sx,1.62,4.18,.04,.64,.04,wood);
      // Carpentry plane, wood shavings, chisel & compass dividers on Natan's bench (clear of book & looseCover)
      dBox(-4.22,.93,-.20,.22,.055,.065,dark);dBox(-4.20,.965,-.20,.05,.04,.022,iron);
      for(let i=0;i<4;i++){const sh=dMesh(new T.TorusGeometry(.032,.007,5,10,Math.PI*1.3),wood,-4.42+i*.055,.916,.06+(i%2)*.04);sh.rotation.set(Math.PI/2,i*.9,.3);}
      for(let i=0;i<3;i++)dBox(-8.65,.12+i*.11,3.35,.14,.09,1.1,wood);
      dBox(-9.28,1.52,1.65,.06,.14,1.1,dark);dRod([-9.25,1.25,1.3],[-9.25,1.85,1.35],.018,iron);
      // B06 parchment scroll, inkwell & raking brass oil burner on east corner of B06 table
      dMesh(new T.CylinderGeometry(.034,.034,.28,10),paper,-20.08,.94,-4.05).rotation.set(Math.PI/2,0,.45);
      dMesh(new T.CylinderGeometry(.028,.034,.06,8),mat('#2a2623',.65),-19.95,.93,-4.32);
      dRod([-20.12,.915,-4.32],[-19.94,.93,-4.22],.006,dark);
      // Yosef porch shaded reed pergola slats & amphora jars by north post
      for(let x=-5.6;x<=-.4;x+=.45)dBox(x,2.92,-12,.14,.06,3.8,wood);
      for(const [ax,az,sc]of [[-5.45,-13.45,1],[-5.15,-13.6,0.82]]){
        const jar=dMesh(new T.LatheGeometry([[0,0],[.15,.04],[.24,.34],[.19,.50],[.08,.60],[.10,.67]].map(p=>new T.Vector2(...p)),10),clay,ax,0,az);if(jar)jar.scale.setScalar(sc);
      }
      // Rina's kitchen hearth: sculpted domed Levantine clay tabun oven (East of bench clearzone) & meal bread bowls
      const tabunBody=dMesh(new T.SphereGeometry(.68,14,10,0,Math.PI*2,0,Math.PI*.62),mat('#9a6948',.88),10.35,.06,5.8);if(tabunBody)tabunBody.scale.set(1,1.15,1);
      dBox(10.35,.32,5.8,1.45,.64,1.45,stone);
      dMesh(new T.CircleGeometry(.22,10),mat('#ff6b22',.4,{emissive:'#ff5514',emissiveIntensity:1.8}),9.64,.42,5.8).rotation.y=-Math.PI/2;
      dMesh(new T.CylinderGeometry(.32,.28,.06,12),mat('#b99768',.9),6.35,.935,5.0);
      for(const dx of [-.08,.09])dMesh(new T.SphereGeometry(.095,10,6),mat('#cfa162',.85),6.35+dx,.97,5.0).scale.set(1,.42,1);
      dMesh(new T.LatheGeometry([[0,0],[.07,0],[.12,.06],[.13,.09]].map(p=>new T.Vector2(...p)),12),clay,7.45,.905,4.85);
      // Mediterranean coastal olive trees outside playable courtyard perimeter (clustered twisted boughs, no lollipop spheres)
      const trunkM=mat('#5d4e3d',.92),oliveA=mat('#627253',.9),oliveB=mat('#768664',.88);
      for(const [tx,tz,s]of [[-22,22,1.15],[-5,22.5,1.0],[11,22,1.2],[27.5,2,1.1],[27.5,-13,1.0]]){
        dRod([tx,0,tz],[tx+.18,1.9*s,tz-.1],.17*s,trunkM);dRod([tx+.15,1.7*s,tz-.08],[tx-.55*s,2.85*s,tz+.3*s],.09*s,trunkM);dRod([tx+.18,1.75*s,tz-.08],[tx+.65*s,2.75*s,tz-.35*s],.08*s,trunkM);
        for(const [k,[cx,cy,cz,rx,ry,rz]]of [[0,[0,3.25*s,0,.85,.45,.82]],[1,[-.68*s,2.95*s,.34*s,.72,.4,.68]],[2,[.7*s,2.9*s,-.32*s,.76,.42,.7]],[3,[.18*s,3.05*s,.62*s,.62,.36,.58]],[4,[-.25*s,3.15*s,-.52*s,.64,.38,.6]]].entries()){
          const crn=dMesh(new T.SphereGeometry(s,7,5),k%2?oliveA:oliveB,tx+cx,cy,tz+cz);if(crn){crn.scale.set(rx,ry,rz);crn.rotation.y=k*1.1+tx;}
        }
      }
      root.WitnessQ01.batch(T,aaaDressing);
      // 3) Animated Iron/Bronze Pulley Sheaves (unbatched so they spin with winch/pulley progress)
      const aaaMech=new T.Group();aaaMech.name='q01-pr05-mechanism';group.add(aaaMech);
      for(const [rx,ry,rz,axis]of [[-29.4,G.ROOF+1.5,-5.1,'z'],[-25.3,G.ROOF+1.1,-10.6,'x'],[-31,G.ROOF+1.5,-8.05,'z']]){
        const sh=new T.Group();sh.position.set(rx,ry,rz);
        const rim=new T.Mesh(new T.CylinderGeometry(.19,.19,.075,16),iron),ax=new T.Mesh(new T.CylinderGeometry(.04,.04,.16,10),iron);
        rim.rotation[axis==='x'?'z':'x']=Math.PI/2;ax.rotation[axis==='x'?'z':'x']=Math.PI/2;
        sh.add(rim,ax);sh.userData.axis=axis;aaaMech.add(sh);winchSheaves.push(sh);
      }
      // 4) Upgrade Contained Fire with Charred Coal Bed + 48 Spiral Ember Particles
      const coals=new T.Mesh(new T.CylinderGeometry(1.05,1.2,.18,12),mat('#261710',.92,{emissive:'#ff4d12',emissiveIntensity:1.4}));coals.position.set(-25.8,.10,-9.85);fireGroup.add(coals);
      for(let i=0;i<3;i++){const lg=new T.Mesh(new T.CylinderGeometry(.13,.15,1.5,8),mat('#241a14',.94,{emissive:'#8a2508',emissiveIntensity:.6}));lg.position.set(-25.8+(i-1)*.35,.22,-9.85);lg.rotation.set(Math.PI/2,.4+i*.7,Math.PI/2-.18);fireGroup.add(lg);}
      const ePos=new Float32Array(fireEmberCount*3),eGeo=new T.BufferGeometry();eGeo.setAttribute('position',new T.BufferAttribute(ePos,3));
      const eMat=new T.PointsMaterial({map:makeRadialSpriteTex('rgba(255,244,185,1)','rgba(255,112,24,.75)'),size:.19,transparent:true,opacity:.92,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
      ownedMaterials.add(eMat);fireEmbers=new T.Points(eGeo,eMat);fireEmbers.name='q01-fire-embers';fireGroup.add(fireEmbers);
      // 5) Volumetric Doorway Sunbeams & Ambient Salt/Courtyard Air Motes
      aaaVfx=new T.Group();aaaVfx.name='q01-pr05-vfx';group.add(aaaVfx);
      const beamTex=makeRadialSpriteTex('rgba(255,236,196,.42)','rgba(255,212,148,.12)');
      for(const [bx,by,bz,bw,bh,ry,rz]of [[-5.5,1.75,-.8,2.6,3.4,0,-.18],[-20.5,1.85,-4.2,2.1,3.1,.35,.42]]){
        const bm=new T.Mesh(new T.PlaneGeometry(bw,bh),new T.MeshBasicMaterial({map:beamTex,transparent:true,opacity:.26,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,color:'#ffe4b5'}));
        bm.position.set(bx,by,bz);bm.rotation.set(.38,ry,rz);ownedMaterials.add(bm.material);aaaVfx.add(bm);sunBeams.push(bm);
      }
      const mCount=90,mPos=new Float32Array(mCount*3);
      for(let i=0;i<mCount;i++){mPos[i*3]=-30+((i*73)%52);mPos[i*3+1]=.4+((i*17)%38)/10;mPos[i*3+2]=-23+((i*41)%32);}
      const mGeo=new T.BufferGeometry();mGeo.setAttribute('position',new T.BufferAttribute(mPos,3));
      const mMat=new T.PointsMaterial({map:beamTex,size:.12,transparent:true,opacity:.32,blending:T.AdditiveBlending,depthWrite:false,color:'#ffefd4'});
      ownedMaterials.add(mMat);airMotes=new T.Points(mGeo,mMat);airMotes.name='q01-air-motes';aaaVfx.add(airMotes);
    }
    initAAAExtensions();
    function sync(s){latest=s;crafted?.update(s);const q=s.sceneProgress.Q01;
      if(s.quests.Q01.done.includes('ledger')){const player=scene.getObjectByName('player');if(player&&book.parent!==player){player.add(book);dockBookOnHip();}}
      book.visible=true;stranger.visible=(q.beat===1||departing>0&&departing<1)&&departing<1;const flame=q.beat===3||q.beat===4;fireGroup.visible=flame;smoke.forEach(o=>o.visible=q.beat>=3&&q.beat<=6);base.group.getObjectByName('contained-fire-volume').visible=false;
      if(q.beat!==7)setNightRopeRest(true);}
    function tick(t,dt){
      base.tick(t);seaMaterial.uniforms.time.value=t;flameMaterial.uniforms.time.value=t;
      if(aaaSky)aaaSky.material.uniforms.uTime.value=t;
      fireLight.intensity=18+Math.sin(t*5.3)*3.2+Math.sin(t*9.7)*2.1;
      // Gentle buoy/hull swell on hero boat rigging
      if(boatRigGroup)boatRigGroup.position.y=Math.sin(t*.85)*.016;
      // Organic warm oil-lamp & halo micro-flicker around current targetIntensity
      for(let i=0;i<lamps.length;i++){const l=lamps[i],baseI=l.userData.targetIntensity??l.intensity,fl=Math.sin(t*6.7+i*2.1)*.07+Math.sin(t*11.3+i)*.04;l.intensity=Math.max(0,baseI*(1+fl));}
      for(let i=0;i<smoke.length;i++){const o=smoke[i],k=((t*.13+i/22)%1),size=.55+k*2.6;o.position.set(-25.8+k*2.1+Math.sin(i*2.3+k*4)*.32,1.2+k*6.8,-9.8+Math.sin(i*1.9)*.5+k*.65);o.scale.set(size,size,1);o.material.opacity=latest.sceneProgress.Q01.beat===4?.36:.14;}
      flames.forEach((o,i)=>{const s=.92+.18*Math.sin(t*7.2+i*1.7)+.08*Math.sin(t*13+i);o.scale.set(.85*s,2.1*s,.85*s);});
      if(fireEmbers&&fireGroup.visible){
        const pos=fireEmbers.geometry.attributes.position;
        for(let i=0;i<fireEmberCount;i++){const d=fireEmberData[i],k=(d.phase+t*d.speed)%1,a=d.ang+k*4.5;pos.setXYZ(i,-25.8+Math.cos(a)*d.rad*(.4+k*.9),.25+k*4.8,-9.85+Math.sin(a)*d.rad*(.4+k*.9));}
        pos.needsUpdate=true;
      }
      const beamVis=activePhase==='night'?0:activePhase==='evening'?.14:.26;
      sunBeams.forEach((b,i)=>{b.material.opacity=beamVis*(i===1&&activePhase==='dawn'?1.4:1);b.visible=beamVis>.02;});
      if(airMotes){airMotes.position.y=Math.sin(t*.4)*.15;airMotes.material.opacity=activePhase==='night'?.08:.30;}
      let sMoving=false;
      if(departing>0&&departing<1){
        const p={x:stranger.position.x,y:stranger.position.y,z:stranger.position.z,supportId:stranger.userData.supportId};
        while(strangerPath.length&&Math.hypot(p.x-strangerPath[0].x,p.z-strangerPath[0].z)<.05)strangerPath.shift();
        if(!strangerPath.length){departing=1;stranger.visible=false;}
        else{const to=strangerPath[0],d=Math.hypot(to.x-p.x,to.z-p.z),step=Math.min(d,dt*1.85),next=ar.move(p,(to.x-p.x)/d*step,(to.z-p.z)/d*step);stranger.position.set(next.x,next.y,next.z);stranger.userData.supportId=next.supportId;stranger.rotation.y=Math.atan2(to.x-next.x,to.z-next.z);sMoving=step>.0001;}
      }
      if(stranger.visible)strangerRig.animate(t,sMoving?.9:0,stranger.rotation.y,'idle',0,{speechSeed:19});
      if(rearMoving>0&&rearMoving<1){rearMoving=Math.min(1,rearMoving+dt*.13);rear.position.set(-26+rearMoving*9,0,-23);rear.rotation.y=Math.PI/2;rear.visible=rearMoving<.98;}
      if(rear.visible)rearRig.animate(t,rearMoving>0&&rearMoving<1?.95:0,rear.rotation.y,'idle',0,{speechSeed:23});
      const brDone=latest.quests.Q01.done.includes('brace');
      for(const [id,a]of Object.entries(actors)){
        const onBench=id==='natan'&&latest.sceneProgress.Q01.beat===7&&!a.moving;
        const distV=viewer?Math.hypot(viewer.x-a.object.position.x,viewer.z-a.object.position.z):99;
        if((speaking===id||onBench)&&viewer&&!a.moving){const angle=onBench?0:Math.atan2(viewer.x-a.object.position.x,viewer.z-a.object.position.z),delta=Math.atan2(Math.sin(angle-a.object.rotation.y),Math.cos(angle-a.object.rotation.y));a.object.rotation.y+=delta*Math.min(1,dt*5);}
        const workingPre=!brDone&&id==='natan'&&!a.moving&&speaking!==id&&!onBench;
        const workingSaw=id==='sawyer'&&!a.moving&&speaking!==id;
        const workingHeave=!!performanceKind&&['titus','worker1','worker2'].includes(id)&&!a.moving&&speaking!==id;
        const workingHearth=id==='rina'&&!a.moving&&speaking!==id;
        const posture=a.moving?'idle':onBench?(speaking===id?'seated-talk':'seated-idle'):speaking===id?'talk':workingPre||workingSaw||workingHearth?'tend':workingHeave?'offer':'idle';
        const poseOpts={speechSeed:id.charCodeAt(0)*13+id.length*7};
        if(onBench)poseOpts.seatOffset=[0,.092,-.41];
        if(workingPre)poseOpts.work='plane';
        else if(workingSaw)poseOpts.work='saw';
        else if(workingHeave)poseOpts.work='heave';
        else if(workingHearth){poseOpts.work='hearth';poseOpts.headPitch=-.07;}
        else if(speaking===id&&distV<8){poseOpts.headPitch=-.04;}
        else if(!a.moving&&viewer&&distV<6.2&&!onBench){const ang=Math.atan2(viewer.x-a.object.position.x,viewer.z-a.object.position.z),dYaw=Math.atan2(Math.sin(ang-a.object.rotation.y),Math.cos(ang-a.object.rotation.y));poseOpts.headYaw=Math.max(-.32,Math.min(.32,dYaw));}
        a.animate(t,a.moving?1:0,a.object.rotation.y,posture,0,poseOpts);a.moving=false;
      }
      crafted?.tick(t);
    }
    function dispose(){
      sea.userData.disposeWater?.();crafted?.dispose?.();
      book.removeFromParent();handRope.removeFromParent();
      strangerRig.dispose?.();rearRig.dispose?.();
      for(const a of Object.values(actors)){a.object.removeFromParent();a.dispose?.();}
      const geos=new Set(),mats=new Set(),textures=new Set(ownedTextures);
      for(const rootNode of [group,book]){
        rootNode.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.isInstancedMesh)o.dispose();for(const m of [o.material].flat().filter(Boolean)){mats.add(m);if(m.map&&!m.map.userData.sharedMap)textures.add(m.map);}});
      }
      ownedMaterials.forEach(m=>mats.add(m));
      group.removeFromParent();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());base.dispose();
    }
    sync(state);setTime(state.sceneProgress.Q01.phase);
    return {group,base,actors,ar,tick,sync,setTime,dispose,setViewer(p){viewer=p;},setNightRopeRest,inspectBook(step=0){const player=scene.getObjectByName('player');if(player){player.add(book);book.position.set(.08,1.18,.28);book.rotation.set(.42,-.38-step*.22,.28);}book.updateWorldMatrix(true,true);return book.getWorldPosition(new T.Vector3());},speak(who){speaking=who;if(!who&&latest.quests.Q01.done.includes('ledger'))dockBookOnHip();},perform(kind,on,fraction=0){performanceKind=on?kind:null;ar.animateMechanism(kind,fraction);winchSheaves.forEach((s,idx)=>{s.rotation[s.userData.axis]=fraction*Math.PI*6*(idx%2?1:-1);});},lookout(){rear.visible=true;rearMoving=.001;},departStranger(){strangerPath=ar.route({...G.anchors.stranger},G.anchors.strangerGone)||[];departing=.001;},strangerHidden(p){return departing>=1||!ar.visible({...p,y:p.y+1.5},{x:stranger.position.x,y:stranger.position.y+1.4,z:stranger.position.z});}};
  }
  root.WitnessQ01Art={mount};
})(globalThis);
