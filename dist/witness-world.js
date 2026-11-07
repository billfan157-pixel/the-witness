(function(root){
  'use strict';
  const D=root.WitnessContent,M=root.WitnessModel;
  root.ExpeditionCampaign={bounds:{left:-39,right:39,far:-37,near:29}};
  let context=null,current=null,decor=null,water=null,reactive=[];
  const sky=root.AdventureVisuals.sky;
  root.AdventureVisuals.sky=function(T,scene,biome){context={T,scene,biome};const tick=sky(T,scene,biome);return time=>{tick(time);if(water){water.material.opacity=.78+Math.sin(time*.4)*.035;water.position.y=water.userData.base+Math.sin(time*.6)*.035;}if(decor)for(const item of decor.children)if(item.userData.sway)item.rotation.z=Math.sin(time*.8+item.position.x)*.015;};};
  const createCharacter=root.AdventureCharacter.create;
  const fiction=Object.entries(D.people);
  fiction.forEach(([id,p],index)=>{const female=p.model==='woman';root.CharacterProfiles.profiles['wt-'+id]={...root.CharacterProfiles.get(female?'sarai':'traveler'),id:'wt-'+id,name:p.name,kind:'fictional',era:'gospel',period:'Thế kỷ I · sáng tác nghệ thuật',age:id==='natan'?.7:.22+(index%4)*.08,gender:female?'female':'male',tunic:p.color,mantle:index%2?'#b7a27d':'#6c6453',headcover:female?'veil':id==='natan'?'shawl':'bare',hairColor:id==='natan'?'#8f8172':'#332a23',beard:female?0:id==='natan'?.065:.027,ornament:'none',belt:'cord',item:id==='lea'?'tablet':id==='titus'?'bag':null,hem:female?.075:.30,build:.95+(index%3)*.035,height:.96+(index%4)*.025,evidence:'Nhân vật hư cấu của THE WITNESS; diện mạo diễn giải nghệ thuật.'};});
  root.AdventureCharacter.create=function(T,role,options={}){
    if(!options.appearance){
      if(!current?.layer){const p=current?.profile||{};options={...options,overrides:{...root.CharacterProfiles.get('traveler'),id:'witness-avatar',name:p.name||'Người Chứng',gender:p.gender||'male',age:.29,kind:'fictional',tunic:{sand:'#b6a07b',green:'#59716b',blue:'#566d83'}[p.attire||'sand'],mantle:'#84735a',hairColor:'#332820',headcover:'bare',hem:p.gender==='female'?.075:.30,beard:p.gender==='female'?0:.025,ornament:'none',item:'bag',belt:'cord'}};}
      else if(current.layer.kind==='legend'){const id={L01:'moses',L02:'david',L03:'isaiah',L04:'peter',L05:'traveler'}[current.layer.id];options={...options,overrides:{...root.CharacterProfiles.get(id),id:'legend-'+current.layer.id,ornament:'none',belt:'cord',headcover:current.layer.id==='L02'?'bare':root.CharacterProfiles.get(id).headcover}};}
    }
    return createCharacter(T,role,options);
  };
  function descriptor(s){if(!s.layer)return {...D.regions[M.chapter(s).region],region:M.chapter(s).region};const src=s.layer.kind==='legend'?D.legends[s.layer.id]:D.veils[s.layer.id];return {base:src.base,biome:src.biome,name:src.title,region:s.layer.id};}
  function layout(s){const d=descriptor(s),base=root.Adventure3D.layoutFor(d.base),nodes=s.layer?[M.layerAt(0),M.layerAt(1),M.layerAt(2)]:M.chapter(s).nodes.map(n=>n.at);return {...base,biome:d.biome,start:s.layer?.id==='L03'?[-9,7]:[-15,12],nodes,mission:nodes,routes:[[[ -15,12],[-9,5],[-2,0],[8,-3],[17,4],[23,9]],...nodes.map(at=>[[-2,0],at])],decoys:[],title:d.name};}
  function plan(s){
    const active=M.actions(s),q=M.quest(s),ch=M.chapter(s),objects=[],targets=[];
    if(s.layer){const src=s.layer.kind==='legend'?D.legends[s.layer.id]:D.veils[s.layer.id];for(let i=0;i<src.steps.length;i++){const at=M.layerAt(i);objects.push({id:'layer-'+i,at,kind:'prop',variant:s.layer.id==='L03'?['lamp','cloth','stakes'][i]:s.layer.id==='L04'?['net','boat','table'][i]:s.layer.kind==='veil'?['scroll','table','lamp'][i]:['waystone','cloth','gate'][i]});}objects.push({id:'layer-return',at:[13,-10],kind:'prop',variant:'gate'});for(const a of active)targets.push({id:a.target,at:a.at,actor:a.target,name:a.id==='return'?'Trở lại đời thường':a.title,range:3,main:true,elevation:1.5,symbol:'◇'});return {objects,targets};}
    for(const n of ch.nodes){
      const id=n.id;let at=n.at;
      const escorted=Object.values(ch.execution).flat().find(a=>a.escort&&a.target===n.id);if(escorted&&q.done.includes(escorted.id))at=ch.nodes.find(n=>n.id===escorted.destination)?.at||at;
      if(ch.id==='Q02'&&n.person==='yosef'&&s.flags.yosefSafe&&q.route)at=[16,7];
      objects.push({id,at,kind:n.person?'npc':'prop',variant:n.person?D.people[n.person].model:n.model,appearance:n.person?'wt-'+n.person:undefined,fixed:true,pose:'idle'});
      const choices=active.filter(a=>a.target===id);const bond=D.bonds.find(b=>b.person===n.person&&b.from<=s.chapter&&!s.bonds[b.id]);
      if(id==='gate'&&!q.route)continue;
      targets.push({id,actor:id,at,name:choices[0]?.title||n.name,range:n.person?2.9:2.6,elevation:n.person?2.0:1.2,main:active[0]?.target===id,symbol:choices.length?'◆':bond?'◇':'·',choices:choices.map(a=>a.id),person:n.person});
    }
    if(s.pendingBond){objects.push({id:'bond-work',at:[-16,-4],kind:'prop',variant:'table'});targets.push({id:'bond-work',actor:'bond-work',at:[-16,-4],name:'Phần việc riêng đã nhận',range:2.8,elevation:1.2,symbol:'◇'});}
    if(s.flags.trainingSpawned){objects.push({id:'training',at:[-21,16],kind:'npc',variant:'man',appearance:'guard',fixed:true});targets.push({id:'training',actor:'training',at:[-21,16],name:'Người hướng dẫn sân gậy',range:2.9,elevation:2,symbol:'◇'});}
    if(ch.legend||ch.veil){const n=ch.nodes.find(n=>n.id==='rest');if(n){const t=targets.find(t=>t.id==='rest');if(t){t.name='Một khoảng dừng để lắng nghe';t.symbol='◇';}}}
    return {objects,targets};
  }
  function decorate(s){
    if(!context)return;current=s;const {T,scene}=context;water=null;reactive=[];
    const ground=scene.children.find(c=>c.isMesh&&c.geometry?.parameters?.width===156);
    if(s.layer)for(const child of scene.children){if(child.isLight||child===ground||child.name==='player'||child.geometry?.parameters?.radius>=100||child.type==='Object3D')continue;child.visible=false;}
    const ray=new T.Raycaster();const down=new T.Vector3(0,-1,0);
    const height=(x,z)=>{if(!ground)return 0;ray.set(new T.Vector3(x,40,z),down);return ray.intersectObject(ground)[0]?.point.y||0;};
    decor=new T.Group();decor.name='witness-place';scene.add(decor);
    const materials=new Map();const mat=(c,opts={})=>{const key=c+JSON.stringify(opts);if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color:c,roughness:.9,...opts}));return materials.get(key);};
    function mesh(geometry,c,x,y,z,opts={}){const o=new T.Mesh(geometry,mat(c,opts));o.position.set(x,height(x,z)+y,z);o.castShadow=true;o.receiveShadow=true;decor.add(o);return o;}
    const box=(c,x,y,z,w,h,d)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z);
    const pole=(x,z,h=2,c='#6b5137')=>mesh(new T.CylinderGeometry(.08,.1,h,8),c,x,h/2,z);
    function house(x,z,w=7,d=5,h=4,c='#c8b695'){
      box(c,x,h/2,z,w,h,d);box('#8c7659',x,h+.15,z,w+.35,.3,d+.35);
      for(let i=0;i<5;i++)box('#66513d',x-w*.42+i*w*.21,h-.2,z+d/2+.18,.17,.28,.42);
      box('#6c5037',x,.98,z+d/2+.035,1.5,1.96,.10);
      box('#9e896b',x,2.08,z+d/2+.11,1.9,.22,.28);
      for(const dx of [-w*.32,w*.32]){box('#534b3e',x+dx,2.25,z+d/2+.05,.63,.85,.08);box('#8c7456',x+dx,2.25,z+d/2+.1,.08,.83,.1);}
    }
    function jar(x,z,scale=1){const o=mesh(new T.LatheGeometry([[0,0],[.25,.05],[.38,.3],[.36,.6],[.17,.78],[.18,.85]].map(p=>new T.Vector2(...p)),12),'#b38561',x,0,z);o.scale.setScalar(scale);return o;}
    function lamp(x,z){pole(x,z,1.8);const o=mesh(new T.SphereGeometry(.14,8,6),'#ffd59b',x,1.9,z,{emissive:'#f6a849',emissiveIntensity:1.3});const light=new T.PointLight('#ffcc83',9,7,2);light.position.copy(o.position);decor.add(light);}
    function cloth(x,z,w=5,c='#a98e65'){pole(x-w/2,z,3);pole(x+w/2,z,3);const o=mesh(new T.PlaneGeometry(w,2.8,6,4),c,x,2.9,z,{side:T.DoubleSide});o.rotation.x=-Math.PI/2+.12;o.userData.sway=true;}
    function sea(z=-25){water=mesh(new T.PlaneGeometry(100,65,20,12),'#4d8b94',6,-.08,z-22,{transparent:true,opacity:.8,roughness:.2,metalness:.23});water.rotation.x=-Math.PI/2;water.castShadow=false;water.userData.base=water.position.y;
      for(let i=0;i<11;i++){const o=box('#a0c3bd',-35+i*7,.02,z-7-i%3*3,3.8,.02,.065);o.castShadow=false;}}
    function boat(x,z,size=1,sail=true){const hull=mesh(new T.SphereGeometry(1,20,12),'#72553d',x,.2,z);hull.scale.set(1.6*size,.6*size,4.1*size);box('#bda27c',x,.55,z,2.6*size,.16,7*size);if(sail){pole(x,z,7*size);const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute([0,0,0,0,5.4*size,0,2.9*size,.6*size,.3],3));geom.computeVertexNormals();const o=mesh(geom,'#d6c8a3',x,1.2,z,{side:T.DoubleSide});o.userData.sway=true;}}
    const desc=descriptor(s),isVeil=s.layer?.kind==='veil';
    if(isVeil){
      scene.fog=new T.FogExp2('#263842',.025);scene.background=new T.Color('#263842');
      for(let i=0;i<8;i++){const x=-18+i*5;box('#66706c',x,.25,-14+(i%2)*4,3.4,.5,3.4);pole(x,-14+(i%2)*4,5,'#6b7772');}
      cloth(-2,-18,10,'#71817b');lamp(-8,4);lamp(8,-8);
      if(s.layer.id==='V04'){box('#746953',0,.7,-3,.9,.18,.9);box('#746953',0,1.2,-3.4,.9,1.1,.12);}
    }else if(s.layer?.id==='L03'){
      scene.fog=new T.FogExp2('#51493d',.022);if(ground)ground.material=new T.MeshStandardMaterial({color:'#746852',roughness:1});
      mesh(new T.CylinderGeometry(18,18,11,64,1,true),'#827159',0,5.5,-3,{side:T.BackSide});
      for(let level=0;level<9;level++){const rim=mesh(new T.TorusGeometry(17.96,.045,4,64),'#675c49',0,level*1.2,-3);rim.rotation.x=Math.PI/2;}
      const lip=mesh(new T.TorusGeometry(18,.45,6,64),'#ab9878',0,11,-3);lip.rotation.x=Math.PI/2;
      const rope=mesh(new T.CylinderGeometry(.055,.055,10,8),'#d0b183',0,5,-4);rope.rotation.z=.045;cloth(0,-5,1.3,'#a59375');const openingLight=new T.PointLight('#f2dcb4',55,32,1.3);openingLight.position.set(0,10,-3);decor.add(openingLight);lamp(-5,4);
    }else if(s.layer?.id==='L05'){
      for(const x of [-15,15])box('#807660',x,3,-3,1.2,7,25);box('#756957',0,3,-16,30,7,1.2);for(let x=-12;x<14;x+=1.1)box('#665a49',x,2.5,-11,.12,5,.12);lamp(-8,5);lamp(9,-9);
    }else if(s.layer?.id==='L02'){
      scene.fog=new T.FogExp2('#5f665e',.027);for(let i=0;i<9;i++){const o=mesh(new T.DodecahedronGeometry(3.5,0),'#8f8874',-18+i*4.6,2,-15);o.scale.y=1.5;}lamp(-9,5);
    }else if(s.layer?.id==='L01'){
      for(const x of [-24,24]){const o=box('#537f88',x,4,-10,8,9,55);o.material=mat('#537f88',{transparent:true,opacity:.7,roughness:.25});}for(let i=0;i<8;i++)box('#bda97c',-15+i*4,.03,-3,1,.05,12);lamp(-10,6);
    }else if(desc.region==='caesarea'){
      sea(-24);house(-23,-13,9,7,5.2);house(-10,-21,8,6,4.5);house(4,-22,10,5,5.2);house(27,-10,6,10,5.5);cloth(6,10,6,'#b69b72');
      for(let i=0;i<6;i++){box('#927554',12+i*2,.25,-24,1.9,.35,8);pole(12+i*2,-21,1.4);}boat(18,-31,1.1);boat(-1,-32,.7,false);
      for(let i=0;i<5;i++){box('#9c805a',-24+i*1.2,.5,2,1,1,.9);jar(19+i*.7,-14,.8);}lamp(-6,7);lamp(16,6);box('#baac8b',27,7.5,-30,4,15,4);
    }else if(desc.region==='galilee'){
      sea(-23);house(-22,-11,7,6,3.6,'#b5ad8f');house(-11,-22,6,5,3.1,'#bfb99c');house(22,-17,8,5,3.4,'#a59e85');boat(6,-27,.75,false);cloth(-10,7,6,'#9d9b7c');
      for(let i=0;i<5;i++){pole(-16+i*1.5,-8,2);box('#746b50',-16+i*1.5,1.3,-8,.07,.07,3);}for(let i=0;i<6;i++)jar(19+i%3,4+Math.floor(i/3),.85);lamp(-4,7);lamp(14,4);
    }else if(desc.region==='jerusalem'){
      house(-24,-5,8,15,6);house(27,-3,8,19,7);house(1,-24,22,6,6.8);cloth(-10,7,7,'#8d786c');
      for(let i=0;i<11;i++)for(let j=0;j<6;j++)box((i+j)%2?'#b7ab8e':'#c0b397',-16+i*3,.015,14-j*4,2.9,.06,3.9);
      for(let i=0;i<4;i++)jar(-19+i*.7,-9,.9);lamp(-7,4);lamp(15,6);box('#c7b38c',-22,8,-26,4,16,4);
    }else if(desc.region==='ravine'){
      const stream=mesh(new T.PlaneGeometry(8,56,8,12),'#729e9e',20,.04,-4,{transparent:true,opacity:.85,roughness:.2});stream.rotation.x=-Math.PI/2;
      for(let i=0;i<7;i++){const o=mesh(new T.DodecahedronGeometry(2.5,0),'#a39173',24+(i%2)*4,1,-24+i*7);o.scale.set(1.4,1.1,1);}
      pole(-3,-2,1.2);pole(12,-9,1.1);box('#927752',13,.2,-8,4,.2,3);lamp(-9,8);
    }else{house(-24,-11,7,5,3);cloth(8,-8,6,'#ab9370');for(let i=0;i<5;i++)jar(17+i*.7,-12,.8);lamp(-11,7);}
    if(!s.layer){
      const echoes=M.callbacks(s);for(let i=0;i<Math.min(5,echoes.length);i++)jar(-17+i*.8,14,.55);
      if(s.flags.bridge)box('#9a805e',-2,.12,-1,4,.22,1.8);
      if(s.quests.Q04.route==='tools'){box('#8c7049',9,.4,10,2,.7,.7);pole(10,10,1.4);}
      if(M.chapter(s).id==='Q01'){pole(-11.4,5.5,2.5);pole(-8.6,5.5,2.5);box('#77583c',-10,2.5,5.5,3,.18,.22);const hanging=box('#9d7954',-10,1.2,5.7,2,.9,1.1);hanging.userData.reactive=true;const apply=next=>{hanging.rotation.z=next.quests.Q01.done.includes('brace')?0:.18;};reactive.push(apply);apply(s);}
    }
    // Group stationary scenery by material to keep the port inexpensive to draw.
    decor.updateMatrixWorld(true);const batches=new Map();
    for(const item of [...decor.children]){if(!item.isMesh||item===water||item.userData.sway||item.userData.reactive||Array.isArray(item.material))continue;const key=item.material.uuid;if(!batches.has(key))batches.set(key,{material:item.material,geometries:[]});const g=(item.geometry.index?item.geometry.toNonIndexed():item.geometry.clone()).applyMatrix4(item.matrix);batches.get(key).geometries.push(g);decor.remove(item);item.geometry.dispose();}
    for(const batch of batches.values()){const merged=new T.BufferGeometry();for(const name of ['position','normal','uv']){const size=name==='uv'?2:3;const length=batch.geometries.reduce((n,g)=>n+g.attributes.position.count*size,0);const array=new Float32Array(length);let offset=0;for(const g of batch.geometries){const attr=g.getAttribute(name);if(attr)array.set(attr.array,offset);offset+=g.attributes.position.count*size;}merged.setAttribute(name,new T.BufferAttribute(array,size));}const mesh=new T.Mesh(merged,batch.material);mesh.castShadow=true;mesh.receiveShadow=true;decor.add(mesh);for(const g of batch.geometries)g.dispose();}
  }
  function makeController(engine,callbacks){
    const held=new Set();let enabled=false,last=0,touch=null,padPrevious=[],frame=0;const stick=document.getElementById('stick'),world=document.getElementById('world');
    function motion(time){frame=requestAnimationFrame(motion);const dt=Math.min(.05,(time-last)/1000||.016);last=time;if(!enabled)return;
      let x=(held.has('d')||held.has('ArrowRight')?1:0)-(held.has('a')||held.has('ArrowLeft')?1:0),y=(held.has('w')||held.has('ArrowUp')?1:0)-(held.has('s')||held.has('ArrowDown')?1:0),run=held.has('Shift');
      if(touch){x=touch.dx/48;y=-touch.dy/48;}let turn=(held.has('r')?1:0)-(held.has('q')?1:0);
      const p=Array.from(navigator.getGamepads?.()||[]).find(Boolean);if(p){const dz=v=>Math.abs(v)>.22?(Math.abs(v)-.22)/.78*Math.sign(v):0;x=x||dz(p.axes[0]||0);y=y||-dz(p.axes[1]||0);turn+=dz(p.axes[2]||0);const btn=p.buttons.map(b=>b.pressed);if(btn[0]&&!padPrevious[0])callbacks.interact();if(btn[3]&&!padPrevious[3])callbacks.journal();if(btn[9]&&!padPrevious[9])callbacks.pause();if(btn[2]&&!padPrevious[2])engine.action('strike');if(btn[1]&&!padPrevious[1])engine.action('dodge');if(btn[4]!==padPrevious[4])engine.action('guard',!!btn[4]);padPrevious=btn;run=run||!!btn[10];}
      const n=Math.hypot(x,y);if(n>1){x/=n;y/=n;}engine.controls(x,y,run||n>.95&&!!touch);if(turn)engine.rotate(turn*dt*1.7);
    }
    document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea'))return;if(!enabled){if(e.key==='Escape')callbacks.escape();return;}const key=e.key.length===1?e.key.toLowerCase():e.key;if(['w','a','s','d','q','r','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift',' '].includes(key)){e.preventDefault();held.add(key);}if(e.repeat)return;if(key==='e')callbacks.interact();if(key==='j')callbacks.journal();if(key==='m')callbacks.map();if(key==='f')callbacks.guide();if(key==='c')engine.recenter();if(key==='Escape')callbacks.pause();if(key===' ')engine.action('dodge');if(key==='k')engine.action('strike');if(key==='h')engine.action('guard',true);});
    document.addEventListener('keyup',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;held.delete(key);if(key==='h')engine.action('guard',false);});window.addEventListener('blur',()=>{held.clear();engine.controls(0,0);engine.action('guard',false);});
    world.addEventListener('pointerdown',e=>{if(!enabled||e.pointerType==='mouse'||e.clientX>innerWidth*.45)return;e.stopImmediatePropagation();e.preventDefault();touch={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};world.setPointerCapture(e.pointerId);stick.style.left=e.clientX+'px';stick.style.top=e.clientY+'px';stick.classList.add('active');},true);
    world.addEventListener('pointermove',e=>{if(touch?.id!==e.pointerId)return;e.stopImmediatePropagation();const dx=e.clientX-touch.x,dy=e.clientY-touch.y,d=Math.max(1,Math.hypot(dx,dy)/48);touch.dx=dx/d;touch.dy=dy/d;stick.firstElementChild.style.transform=`translate(${touch.dx}px,${touch.dy}px)`;},true);
    const release=e=>{if(touch?.id!==e.pointerId)return;e.stopImmediatePropagation();touch=null;stick.classList.remove('active');};world.addEventListener('pointerup',release,true);world.addEventListener('pointercancel',release,true);
    frame=requestAnimationFrame(motion);return {enable(v){enabled=v;if(!v){held.clear();touch=null;stick.classList.remove('active');engine.controls(0,0);}},destroy(){cancelAnimationFrame(frame);}};
  }
  root.WitnessWorld={descriptor,layout,plan,decorate,setState(s){current=s;for(const update of reactive)update(s);},makeController,getContext(){return context;}};
})(globalThis);
