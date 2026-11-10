(function(root){
  'use strict';
  const D=root.WitnessContent,M=root.WitnessModel,C=root.WitnessCraft;
  root.ExpeditionCampaign={bounds:{left:-39,right:39,far:-37,near:29}};
  let context=null,current=null,decor=null,water=null,emberLight=null,reactive=[],animators=[],placeSolids=[];

  // Vết chân nhà theo vùng (khớp các lời gọi house() trong decorate): dùng để né tán cây/cỏ khi rải cảnh.
  const HOUSES={
    caesarea:[[-23,-13,9,7,5.2,'#cbb998',true],[-10,-21,8,6,4.5,'#c7b493'],[4,-22,10,5,5.2,'#d1c0a0',true],[27,-10,6,10,5.5,'#c4b292']],
    galilee:[[-22,-11,7,6,3.6,'#b5ad8f'],[-11,-22,6,5,3.1,'#bfb99c'],[22,-17,8,5,3.4,'#a59e85',true]],
    jerusalem:[[-24,-5,8,15,6,'#d2c1a1'],[27,-3,8,19,7,'#cbb999',true],[1,-24,22,6,6.8,'#d7c7a7']],
    road:[[-24,-11,7,5,3,'#cbb795']]
  };
  function houseFootprints(region){
    const pts=[];
    for(const [x,z,w,d] of (HOUSES[region]||[])){
      const r=Math.min(w,d)*.34;
      const nx=Math.max(2,Math.ceil((w-2*r)/r)+1),nz=Math.max(2,Math.ceil((d-2*r)/r)+1);
      for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)
        pts.push([x-w/2+r+(w-2*r)*(i/(nx-1)), z-d/2+r+(d-2*r)*(j/(nz-1))]);
    }
    return pts;
  }
  // Khối chắn cho cảnh dựng không phải điểm tương tác (nhà, cột, cần cẩu, hải đăng, kiện hàng, xe).
  // Không đặt solids lên nút NPC/prop vì đó là đích đi tới của engine — chắn sẽ kẹt điều hướng.
  function applySolids(objects){
    for(const g of placeSolids)if(g.solids.length)
      objects.push({id:g.id,at:[g.solids[0][0],g.solids[0][1]],kind:'craft-anchor',fixed:true,solids:g.solids});
    return objects;
  }

  const sky=root.AdventureVisuals.sky;
  root.AdventureVisuals.sky=function(T,scene,biome){
    context={T,scene,biome};
    const tick=sky(T,scene,biome);
    return time=>{
      tick(time);
      water?.userData.waterAnimate?.(time);
      if(emberLight){
        emberLight.intensity=8.8+Math.sin(time*4.3)*1.4+Math.cos(time*7.1)*.8;
      }
      for(const fn of animators)fn(time);
      if(decor){
        for(const item of decor.children){
          if(item.userData.sway)item.rotation.z=Math.sin(time*.85+item.position.x)*.022;
          if(item.userData.wallWave)item.position.y=item.userData.baseY+Math.sin(time*1.3+item.position.x*.2)*.08;
          if(item.userData.bob){
            const ph=item.userData.bobPhase||0;
            item.position.y=item.userData.baseY+Math.sin(time*1.25+ph)*.048;
            item.rotation.z=Math.sin(time*1.05+ph)*.028;
            item.rotation.x=Math.cos(time*.88+ph)*.018;
          }
        }
      }
    };
  };

  const createCharacter=root.AdventureCharacter.create;
  const fiction=Object.entries(D.people);
  fiction.forEach(([id,p],index)=>{
    const female=p.model==='woman';
    root.CharacterProfiles.profiles['wt-'+id]={
      ...root.CharacterProfiles.get(female?'sarai':'traveler'),
      id:'wt-'+id,name:p.name,kind:'fictional',era:'gospel',period:'Thế kỷ I · sáng tác nghệ thuật',
      age:id==='natan'||id==='keeper'?.7:id==='sela'?.19:.24+(index%4)*.08,
      gender:female?'female':'male',tunic:p.color,mantle:index%2?'#b7a27d':'#6c6453',
      headcover:female?'veil':id==='natan'||id==='keeper'?'shawl':'bare',
      hairColor:id==='natan'||id==='keeper'?'#8f8172':'#332a23',
      beard:female?0:id==='natan'||id==='keeper'?.065:id==='sela'?.012:.027,
      ornament:'none',belt:'cord',
      item:id==='lea'?'tablet':id==='titus'||id==='amon'?'rope':id==='mattai'?'oil-lamp':id==='rina'?'basket':null,
      hem:female?.075:.30,build:.95+(index%3)*.035,height:.96+(index%4)*.025,
      evidence:'Nhân vật hư cấu của THE WITNESS; diện mạo diễn giải nghệ thuật.'
    };
  });

  // Nhân vật tầng Kinh Thánh (Sacred Tier — Canon Lock) được đặt trang nghiêm trong không gian cảnh,
  // tách biệt hoàn toàn với avatar Chứng nhân Vô danh của người chơi (Dual-Tier Persona v3.1).
  root.CharacterProfiles.profiles['legend-saul']={
    ...root.CharacterProfiles.get('david'),
    id:'legend-saul',name:'Vua Saun',age:.58,tunic:'#646273',mantle:'#755c42',hairColor:'#807260',beard:.065,
    evidence:'Vai trong chuyển thể 1 Sm 24; diện mạo nghệ thuật tạm, chưa thẩm định lịch sử.'
  };
  root.CharacterProfiles.profiles['legend-jeremiah']={
    ...root.CharacterProfiles.get('isaiah'),
    id:'legend-jeremiah',name:'Ngôn sứ Giêrêmia',age:.52,tunic:'#9d8f76',mantle:'#5e5344',item:null,
    evidence:'Vai ngôn sứ trong chuyển thể Gr 38,1–13; không do người chơi điều khiển.'
  };
  root.CharacterProfiles.profiles['legend-ebed']={
    ...root.CharacterProfiles.get('traveler'),
    id:'legend-ebed',name:'Ebed-melech',age:.38,skin:'#7a5239',tunic:'#b8a483',mantle:'#6d7d75',item:'rope',
    evidence:'Quan thái giám người Cush cứu Giêrêmia trong Gr 38,7–13; diện mạo nghệ thuật tôn kính.'
  };
  root.CharacterProfiles.profiles['legend-paul']={
    ...root.CharacterProfiles.get('scholar'),
    id:'legend-paul',name:'Phaolô',age:.46,tunic:'#a8997f',mantle:'#695d4f',item:null,
    evidence:'Vai Phaolô trong chuyển thể Cv 16,22–40; không do người chơi điều khiển.'
  };
  root.CharacterProfiles.profiles['legend-silas']={
    ...root.CharacterProfiles.get('disciple'),
    id:'legend-silas',name:'Xila',age:.36,tunic:'#9c9580',mantle:'#5d696e',item:null,
    evidence:'Vai Xila cầu nguyện cùng Phaolô trong Cv 16,25; diễn giải nghệ thuật.'
  };
  root.CharacterProfiles.profiles['legend-jailer']={
    ...root.CharacterProfiles.get('guard'),
    id:'legend-jailer',name:'Người cai ngục',age:.42,tunic:'#857862',mantle:'#5b5142',item:'oil-lamp',
    evidence:'Người cai ngục tại Philipphê trong Cv 16,27–34; diễn giải nghệ thuật.'
  };

  // Dual-Tier Persona (v3.1): người chơi luôn hóa thân thành Chứng nhân Vô danh ở tầng Con người,
  // không bao giờ nhập vai trực tiếp Môsê, Đavít, Phêrô hay các ngôn sứ.
  const WITNESS_LEGEND_GEAR={
    L01:{role:'Người Hộ Vệ Khóa Đuôi',era:'exodus',tunic:'#a89474',mantle:'#6c5d48',item:'oil-lamp',cloth:'wool',sleeve:.78},
    L02:{role:'Người Trinh Sát Đội Đavít',era:'monarchy',tunic:'#998b70',mantle:'#5f594b',item:'rope',cloth:'wool',sleeve:.68},
    L03:{role:'Người Phụ Việc Kho Cung Đình',era:'monarchy',tunic:'#a7967a',mantle:'#6e6252',item:'oil-lamp',cloth:'linen',sleeve:.72},
    L04:{role:'Người Phụ Lưới Hồ Galilê',era:'gospel',tunic:'#a69f84',mantle:'#62716b',item:'net',cloth:'linen',sleeve:.56},
    L05:{role:'Người Bạn Tù Tại Philipphê',era:'gospel',tunic:'#b2a48d',mantle:'#746a5a',item:null,cloth:'linen',sleeve:.66,cloak:'none'}
  };
  for(const [id,spec]of Object.entries(WITNESS_LEGEND_GEAR))root.CharacterProfiles.profiles['craft-helper-'+id]={
    ...root.CharacterProfiles.get('traveler'),id:'craft-helper-'+id,name:'Người cùng phần việc',kind:'fictional',era:spec.era,tunic:spec.tunic,mantle:spec.mantle,cloth:spec.cloth,item:null,ornament:'none',age:.31,
    evidence:'Nhân vật phụ hư cấu, phục trang diễn giải theo packet của cảnh; không là nhân vật Kinh Thánh mới.'
  };
  root.CharacterProfiles.profiles['craft-apprentice']={...root.CharacterProfiles.get('traveler'),id:'craft-apprentice',name:'Người học việc',kind:'fictional',age:.19,beard:.006,item:null,tunic:'#aca181',mantle:'#758075',ornament:'none',evidence:'Người học việc hư cấu trong câu chuyện của Titus.'};

  root.AdventureCharacter.create=function(T,role,options={}){
    if(!options.appearance){
      const p=current?.profile||{};
      const female=p.gender==='female';
      const base=root.CharacterProfiles.get(female?'magdalene':'traveler');
      if(!current?.layer){
        const originItem=p.origin==='scribe'?'tablet':p.origin==='port'?'rope':'bag';
        options={
          ...options,
          overrides:{
            ...base,
            id:'witness-avatar',name:p.name||'Người Chứng',gender:female?'female':'male',age:.29,kind:'fictional',
            tunic:{sand:'#b6a07b',green:'#59716b',blue:'#566d83'}[p.attire||'sand'],
            mantle:'#84735a',hairColor:'#332820',headcover:female?'veil':'bare',
            hem:female?.085:.30,beard:female?0:.025,ornament:'none',item:originItem,belt:'cord'
          }
        };
      }else if(current.layer.kind==='legend'){
        const spec=WITNESS_LEGEND_GEAR[current.layer.id]||WITNESS_LEGEND_GEAR.L01;
        options={
          ...options,
          overrides:{
            ...base,
            id:'witness-legend-'+current.layer.id,
            name:spec.role,
            era:spec.era,
            gender:female?'female':'male',
            age:.30,
            kind:'fictional',
            tunic:spec.tunic,
            mantle:spec.mantle,
            cloth:spec.cloth,
            cloak:spec.cloak||'shoulder',
            sleeve:spec.sleeve,
            headcover:female?'veil':current.layer.id==='L01'?'shawl':'bare',
            hem:female?.09:.34,
            beard:female?0:.028,
            ornament:'none',
            belt:'cord',
            item:spec.item,
            evidence:'Chứng nhân Vô danh do người chơi điều khiển theo kiến trúc Dual-Tier Persona v3.1.'
          }
        };
      }else{
        options={
          ...options,
          overrides:{
            ...base,
            id:'witness-veil',name:p.name||'Người Chứng',gender:female?'female':'male',age:.29,kind:'fictional',
            tunic:'#8d9996',mantle:'#5d6c6e',headcover:female?'veil':'bare',hem:female?.085:.30,beard:female?0:.02,ornament:'none',item:null,belt:'cord'
          }
        };
      }
    }
    const hero=root.WitnessQ01?.active(current)&&options.appearance==='wt-titus';
    if(hero)options={...options,overrides:root.WitnessQ01.heroLook(root.CharacterProfiles.get('wt-titus'))};
    const character=createCharacter(T,role,options);
    if(hero)root.WitnessQ01.finishHero(T,character);
    return character;
  };

  function descriptor(s){
    root.WitnessQ01?.selectClimate(s);
    if(!s.layer)return {...D.regions[M.chapter(s).region],region:M.chapter(s).region};
    const src=s.layer.kind==='legend'?D.legends[s.layer.id]:D.veils[s.layer.id];
    return {base:src.base,biome:src.biome,name:src.title,region:s.layer.id};
  }

  function layout(s){
    const d=descriptor(s),base=root.Adventure3D.layoutFor(d.base),src=s.layer&&(s.layer.kind==='legend'?D.legends[s.layer.id]:D.veils[s.layer.id]);
    // Terrain heightmap region must be pinned before engine.load displaces the grid.
    const terrainRegion=s.layer?({L01:'jerusalem',L02:'jerusalem',L04:'galilee'}[s.layer.id]||null)
      :({caesarea:'caesarea',road:'caesarea',galilee:'galilee',ravine:'galilee',jerusalem:'jerusalem'}[d.region]||null);
    root.WitnessGraphics?.setRegion(terrainRegion);
    const nodes=s.layer?[...src.steps.map((_,i)=>M.layerAt(i,s)),...(src.discoveries||[]).map(d=>d.at),src.returnAt||[13,-10]]:M.chapter(s).nodes.map(n=>n.at);
    const start=src?.start||(s.layer?.id==='L03'?[-6,5]:[-15,12]);
    return {
      ...base,
      q01Gold:!!root.WitnessQ01?.active(s),
      clearLegacyProps:!!src?.required,
      flatGround:!!src?.required,
      biome:d.biome,
      start,
      nodes,
      mission:nodes,
      routes:[[start,...nodes],...nodes.map(at=>[[-2,0],at]),...(src?.steps||[]).filter(a=>a.routeAt).map(a=>Object.values(a.routeAt))],
      decoys:houseFootprints(d.region),
      title:d.name
    };
  }

  function sacredCastForLayer(s){
    const l=s.layer;if(!l||l.kind!=='legend')return [];
    const step=l.step||0;
    if(l.id==='L01'){
      return [
        {id:'sacred-moses',at:step>=8?[25,-20]:[6,-1],variant:'elder',appearance:'moses',pose:step>=6?'explain':'watch'},
        {id:'source-figure-0',at:[-21,14],variant:'woman',appearance:'sarai',pose:'talk'},
        {id:'source-figure-1',at:[-18,5],variant:'elder',appearance:'abinoam',pose:'watch'},
        {id:'source-figure-2',at:[-2,9],variant:'woman',appearance:'zipporah',pose:'idle'},
        {id:'source-figure-3',at:[16,-22],variant:'man',appearance:'yiftach',pose:'watch'}
      ];
    }
    if(l.id==='L02'){
      return [
        {id:'sacred-david',at:step<5?[-1,-15]:step<7?[-10,2]:[8,16],variant:'man',appearance:'david',pose:step<5?'kneel':step<7?'talk':'explain'},
        {id:'sacred-saul',at:step<6?[6,-12]:[20,10],variant:'elder',appearance:'legend-saul',pose:'watch'},
        {id:'source-figure-0',at:[-11,-3],variant:'man',appearance:'guard',pose:'watch'},
        {id:'source-figure-1',at:[-9,6],variant:'man',appearance:'shepherd',pose:'kneel'}
      ];
    }
    if(l.id==='L04'){
      return [
        ...(step>=3?[{id:'sacred-jesus',at:step>=8?[13,14]:[4,6],variant:'man',appearance:'jesus',pose:'teach'}]:[]),
        {id:'sacred-peter',at:step<4?[-15,-17]:step<8?[8,9]:[10,14],variant:'man',appearance:'peter',pose:step>=5?'listen':'talk'},
        {id:'sacred-beloved',at:step<5?[-11,-16]:[2,5],variant:'man',appearance:'beloved',pose:'watch'},
        {id:'sacred-andrew',at:[-2,-8],variant:'man',appearance:'andrew',pose:'idle',work:true}
      ];
    }
    if(l.id==='L03'){
      return [
        {id:'sacred-jeremiah',at:[3,-6],variant:'elder',appearance:'legend-jeremiah',pose:'kneel'},
        {id:'sacred-ebed',at:[-1,3],variant:'man',appearance:'legend-ebed',pose:'talk'}
      ];
    }
    if(l.id==='L05'){
      return [
        {id:'sacred-paul',at:[-4,-13],variant:'elder',appearance:'legend-paul',pose:'prayer'},
        {id:'sacred-silas',at:[2,-13],variant:'man',appearance:'legend-silas',pose:'prayer'},
        {id:'sacred-jailer',at:[11,-5],variant:'man',appearance:'legend-jailer',pose:step>=2?'kneel':'watch'}
      ];
    }
    return [];
  }

  function plan(s){
    const active=M.actions(s),q=M.quest(s),ch=M.chapter(s),objects=[],targets=[];
    if(s.layer){
      const src=s.layer.kind==='legend'?D.legends[s.layer.id]:D.veils[s.layer.id];
      for(let i=0;i<src.steps.length;i++){
        const at=M.layerAt(i,s);
        const variant=src.required
          ?(src.steps[i].kind==='source'
            ?(s.layer.id==='L04'?['net','net','table','lamp','waystone'][src.beats.findIndex(b=>b.id===src.steps[i].beat)]
              :s.layer.id==='L02'&&src.steps[i].beat==='L02.B02'?'cloth':'waystone')
            :src.steps[i].kind==='order'?'supplies':'stakes')
          :s.layer.id==='L03'?['lamp','cloth','stakes'][i]
          :s.layer.kind==='veil'?['scroll','table','lamp'][i]:'waystone';
        objects.push({id:'layer-'+i,at,kind:'prop',variant});
      }
      for(const d of src.discoveries||[])objects.push({id:'discovery-'+d.id,at:d.at,kind:'prop',variant:d.variant||'waystone'});
      for(const fig of sacredCastForLayer(s)){
        objects.push({id:fig.id,at:fig.at,kind:'npc',variant:fig.variant,appearance:fig.appearance,fixed:!fig.work,work:!!fig.work,pose:fig.pose||'idle'});
      }
      objects.push({id:'layer-return',at:src.returnAt||[13,-10],kind:'prop',variant:'gate'});
      for(const a of active){
        targets.push({id:a.target,at:a.at,actor:a.target,name:a.title,range:3,main:a.kind!=='discovery',elevation:1.5,symbol:a.kind==='discovery'?'○':'◇'});
      }
      const objs=applySolids(objects);
      return C?C.augment(s,{objects:objs,targets}):{objects:objs,targets};
    }

    for(const n of ch.nodes){
      const id=n.id;let at=n.at;
      const escorted=Object.values(ch.execution).flat().find(a=>a.escort&&a.target===n.id);
      if(escorted&&q.done.includes(escorted.id))at=ch.nodes.find(n=>n.id===escorted.destination)?.at||at;
      if(ch.id==='Q02'&&n.person==='yosef'&&s.flags.yosefSafe&&q.route)at=[16,7];
      const isEscortingNow=s.pendingEscort?.target===id;
      objects.push({
        id,at,
        kind:n.person?'npc':'prop',
        variant:n.person?D.people[n.person].model:n.model,
        appearance:n.person?'wt-'+n.person:undefined,
        fixed:!n.work||isEscortingNow,
        work:!!(n.work&&!isEscortingNow),
        pose:n.pose||'idle'
      });
      const choices=active.filter(a=>a.target===id);
      const bond=D.bonds.find(b=>b.person===n.person&&b.from<=s.chapter&&!s.bonds[b.id]);
      if(id==='gate'&&!q.route)continue;
      targets.push({id,actor:id,at,name:choices[0]?.title||n.name,range:n.person?2.9:2.6,elevation:n.person?2.0:1.2,main:active[0]?.target===id,symbol:choices.length?'◆':bond?'◇':'·',choices:choices.map(a=>a.id),person:n.person});
    }

    if(ch.companion&&D.people[ch.companion]&&!ch.nodes.some(n=>n.person===ch.companion)){
      const cid='companion-'+ch.companion,cat=[-23,4],cp=D.people[ch.companion];
      const cbond=D.bonds.find(b=>b.person===ch.companion&&b.from<=s.chapter&&!s.bonds[b.id]);
      objects.push({id:cid,at:cat,kind:'npc',variant:cp.model,appearance:'wt-'+ch.companion,fixed:true,pose:root.WitnessQ01?.active(s)?'idle':'talk'});
      targets.push({id:cid,actor:cid,at:cat,name:cp.name+' · Đồng hành',range:2.9,elevation:2.0,main:false,symbol:cbond?'◇':'·',person:ch.companion,companionSpot:true});
    }

    for(const echo of M.echoes(s)){
      if(echo.region!==ch.region)continue;
      const id='trace-'+echo.id;
      objects.push({id,at:echo.at,kind:'prop',variant:echo.variant});
      targets.push({id,actor:id,at:echo.at,name:echo.name,range:2.9,elevation:1.2,main:false,symbol:'·',unread:true,trace:echo.id});
    }
    if(s.pendingBond){objects.push({id:'bond-work',at:[-16,-4],kind:'prop',variant:'table'});targets.push({id:'bond-work',actor:'bond-work',at:[-16,-4],name:'Phần việc riêng đã nhận',range:2.8,elevation:1.2,symbol:'◇'});}
    if(s.flags.trainingSpawned){objects.push({id:'training',at:[-21,16],kind:'npc',variant:'man',appearance:'guard',fixed:true});targets.push({id:'training',actor:'training',at:[-21,16],name:'Người hướng dẫn sân gậy',range:2.9,elevation:2,symbol:'◇'});}
    if(ch.legend||ch.veil){const n=ch.nodes.find(n=>n.id==='rest');if(n){const t=targets.find(t=>t.id==='rest');if(t){t.name='Một khoảng dừng để lắng nghe';t.symbol='◇';}}}
    if(!s.layer&&ch.id==='Q01'&&root.WitnessArchitecture)targets.push(...root.WitnessArchitecture.targets(context?.scene.userData.architecture));
    const objs=applySolids(objects);
    return C?C.augment(s,{objects:objs,targets}):{objects:objs,targets};
  }

  function decorate(s){
    if(!context)return;current=s;const {T,scene,biome}=context;
    water?.userData?.disposeWater?.();
    root.WitnessModularKit?.releaseMounted?.();
    root.WitnessQ01Environment?.releaseGI?.();
    root.WitnessQ01Environment?.beginScene?.();
    water=null;emberLight=null;reactive=[];animators=[];placeSolids=[];
    root.WitnessGraphics?.setQuality(s.settings?.graphics);
    const AV=root.AdventureVisuals;
    const ground=scene.children.find(c=>c.isMesh&&c.geometry?.parameters?.width===156);
    if(root.WitnessQ01?.active(s)&&ground)root.WitnessQ01.prepareGround(ground);
    if(root.WitnessQ01Environment?.enabled){
      // Retire small starter-engine props left over the newly authored sea.
      // The current harbour boats and quay are added below at the water datum.
      const bb=new T.Box3(),center=new T.Vector3(),extent=new T.Vector3();let pruned=0;
      for(const child of scene.children){
        // Starter prefab roots retain old analytic hill heights. Some populate
        // asynchronously, so test their authored root before inspecting children.
        if(child.isGroup&&!child.name&&Math.hypot(child.position.x,child.position.z)>1&&root.WitnessQ01Environment.clear(child.position.x,child.position.z)){child.visible=false;pruned++;continue;}
        if((!child.children.length&&!child.isMesh)||child===ground||child.isLight||child.isInstancedMesh||child.userData?.isSkyRidge||child.name==='player')continue;
        bb.setFromObject(child,true);if(bb.isEmpty())continue;bb.getCenter(center);bb.getSize(extent);
        if(extent.x<18&&extent.z<18&&bb.max.y<8&&center.z<root.WitnessQ01Environment.shore(center.x)-.4){child.visible=false;pruned++;}
      }
      scene.userData.q01LegacyPruned=pruned;
    }
    if(root.WitnessQ01?.active(s))for(const child of scene.children)if(child.userData.isSkyRidge)child.visible=false;
    const keepOutdoorSky=s.layer&&['L01','L04'].includes(s.layer.id);
    if(s.layer)for(const child of scene.children){if(child.isLight||child===ground||child.name==='player'||child.geometry?.parameters?.radius>=100||child.type==='Object3D'||(keepOutdoorSky&&child.userData?.isSkyRidge))continue;child.visible=false;}
    const ray=new T.Raycaster();const down=new T.Vector3(0,-1,0);
    let terrainSampler=null;
    const height=(x,z)=>{if(terrainSampler)return terrainSampler(x,z);if(!ground)return 0;ray.set(new T.Vector3(x,40,z),down);return ray.intersectObject(ground)[0]?.point.y||0;};
    decor=new T.Group();decor.name='witness-place';scene.add(decor);
    const materials=new Map();
    const q01Surfaces=root.WitnessQ01?.active(s)?root.WitnessQ01.surfaces(T,s.settings.graphics==='balanced'||!!root.WitnessKitOfflineQuality):null;
    const mat=(c,kind='stone',opts={})=>{
      const key=c+'|'+kind+'|'+JSON.stringify(opts);
      if(!materials.has(key)){
        const {noSurface,noCast,...materialOptions}=opts;
        if(q01Surfaces&&!noSurface&&['wood','masonry'].includes(kind)){const qmat=q01Surfaces(kind==='wood'?'wood':'stone',kind==='wood'?'#d0bfa2':'#dfd0b2');materials.set(key,qmat);return qmat;}
        const m=new T.MeshStandardMaterial({color:c,roughness:.88,metalness:0,...materialOptions});
        if(!noSurface)AV?.surface?.(m,kind);
        materials.set(key,m);
      }
      return materials.get(key);
    };
    function mesh(geometry,c,x,y,z,kind='stone',opts={}){
      const o=new T.Mesh(geometry,mat(c,kind,opts));
      o.position.set(x,height(x,z)+y,z);o.castShadow=!opts.noCast;o.receiveShadow=true;decor.add(o);return o;
    }
    const box=(c,x,y,z,w,h,d,kind='masonry',opts={})=>mesh(q01Surfaces&&!opts.noSurface&&['wood','masonry'].includes(kind)?root.WitnessQ01.uvBox(T,w,h,d,x,height(x,z)+y,z,kind==='wood'?1.8:3):new T.BoxGeometry(w,h,d),c,x,y,z,kind,opts);
    const pole=(x,z,h=2,c='#6b5137',r=.09)=>mesh(new T.CylinderGeometry(r*.84,r,h,10),c,x,h/2,z,'wood');
    const solidGroup=id=>{const g={id:'col-'+id,solids:[]};placeSolids.push(g);return (x,z,r)=>g.solids.push([x,z,r]);};

    let sparkTex=null;
    function sparkMap(){
      if(sparkTex)return sparkTex;
      if(typeof document==='undefined')return null;
      const cv=document.createElement('canvas');cv.width=cv.height=32;
      const ctx=cv.getContext('2d');
      if(ctx){
        const g=ctx.createRadialGradient(16,16,0,16,16,16);
        g.addColorStop(0,'rgba(255,255,255,1)');
        g.addColorStop(.32,'rgba(255,232,188,.85)');
        g.addColorStop(.72,'rgba(255,176,92,.24)');
        g.addColorStop(1,'rgba(255,150,70,0)');
        ctx.fillStyle=g;ctx.fillRect(0,0,32,32);
      }
      sparkTex=new T.CanvasTexture(cv);
      return sparkTex;
    }

    function sparkEmitter(x,y,z,count=28,color='#ffb35c',spread=.8,rise=2.6){
      const pos=new Float32Array(count*3),seed=new Float32Array(count);
      for(let i=0;i<count;i++){
        seed[i]=i*1.73;
        pos[i*3]=x+Math.sin(i*4.1)*spread;
        pos[i*3+1]=y+(i/count)*rise;
        pos[i*3+2]=z+Math.cos(i*3.7)*spread;
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute('position',new T.BufferAttribute(pos,3));
      const pt=new T.Points(geo,new T.PointsMaterial({color,size:.14,map:sparkMap(),transparent:true,opacity:.88,blending:T.AdditiveBlending,depthWrite:false}));
      pt.userData.reactive=true;decor.add(pt);
      animators.push(t=>{
        const arr=geo.attributes.position.array;
        for(let i=0;i<count;i++){
          const ph=((t*.42+i/count)%1);
          arr[i*3]=x+Math.sin(t*2.4+seed[i])*(spread*.5+.25*ph);
          arr[i*3+1]=y+ph*rise;
          arr[i*3+2]=z+Math.cos(t*2.1+seed[i])*(spread*.5+.25*ph);
        }
        geo.attributes.position.needsUpdate=true;
      });
      return pt;
    }

    function volumetricShaft(x,y,z,topR,botR,len,tiltZ=0,color='#ffe3ac',opacity=.13){
      const shMat=new T.ShaderMaterial({
        uniforms:{uColor:{value:new T.Color(color)},uOpacity:{value:opacity},uTime:{value:0}},
        transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
        vertexShader:`
          varying vec2 vUv;varying vec3 vN,vV;
          void main(){vUv=uv;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader:`
          varying vec2 vUv;varying vec3 vN,vV;uniform vec3 uColor;uniform float uOpacity,uTime;
          void main(){
            float rim=pow(abs(dot(vN,vV)),1.7);
            float vert=smoothstep(0.,0.35,vUv.y)*smoothstep(1.,0.15,vUv.y);
            float shimmer=.85+.15*sin(vUv.x*18.+uTime*.8+vUv.y*6.);
            gl_FragColor=vec4(uColor,uOpacity*rim*vert*shimmer);
          }`
      });
      const cone=new T.Mesh(new T.CylinderGeometry(topR,botR,len,24,1,true),shMat);
      cone.position.set(x,y,z);cone.rotation.z=tiltZ;cone.userData.reactive=true;decor.add(cone);
      animators.push(t=>{shMat.uniforms.uTime.value=t;});
      return cone;
    }

    function house(x,z,w=7,d=5,h=4,c='#cdb996',lit=false){
      if(root.WitnessQ01?.active(s)&&s.settings.q01Lighting!=='evening')lit=false;
      // Một cao độ nền duy nhất cho cả căn: mọi thành phần bám cùng mặt phẳng,
      // tránh cửa/cửa sổ/mái lệch nhau khi nhà đặt trên sườn dốc.
      const y0=height(x,z);
      const addS=solidGroup('house'+x+','+z);
      const r=Math.min(w,d)*.34;
      const nx=Math.max(2,Math.ceil((w-2*r)/r)+1),nz=Math.max(2,Math.ceil((d-2*r)/r)+1);
      for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)
        addS(x-w/2+r+(w-2*r)*(i/(nx-1)),z-d/2+r+(d-2*r)*(j/(nz-1)),r);
      if(root.WitnessQ01Environment?.enabled)return root.WitnessQ01Environment.house({T,parent:decor,height,x,z,w,d,h,lite:s.settings.graphics==='balanced'||!!root.WitnessKitOfflineQuality});
      const hb=(col,dx,dy,dz,bw,bh,bd,kind='masonry',opts)=>{
        const o=box(col,x+dx,dy,z+dz,bw,bh,bd,kind,opts);o.position.y=y0+dy;return o;
      };
      // Monolithic shell courses become beveled kit masonry with a weathering
      // mask (cavity dirt, arris wear, rising damp) instead of flat boxes.
      const kitShell=(dx,dy,dz,bw,bh,bd)=>{
        if(!root.WitnessModularKit)return hb('#cbb996',dx,dy,dz,bw,bh,bd);
        const K=root.WitnessModularKit,g=K.bevelBox(T,bw,bh,bd,Math.min(.035,bh*.2),3);
        K.maskAttr(T,g,(a,o,px,py,pz,n,i)=>{
          a[o]=.14;a[o+1]=n.getY(i)>.5?.42:.14;
          a[o+2]=Math.max(0,1-(py+bh/2)/1.2)*.8;
        });
        K.worldUV(T,g,x+dx,z+dz);
        const m=new T.Mesh(g,K.material(T,s.settings.graphics==='balanced'||!!root.WitnessKitOfflineQuality));
        m.position.set(x+dx,y0+dy,z+dz);m.castShadow=m.receiveShadow=true;decor.add(m);return m;
      };
      // Móng chìm sâu để nhà bám đất cả phía dốc lẫn phía thấp
      kitShell(0,-.31,0,w+.42,1.5,d+.42);
      kitShell(0,h/2+.3,0,w,h,d);
      kitShell(0,h+.38,0,w+.42,.30,d+.42);
      kitShell(0,h+.58,0,w+.12,.22,d+.12);
      for(const sx of [-1,1])for(const sz of [-1,1])hb('#b2a082',sx*(w/2-.06),h/2+.3,sz*(d/2-.06),.36,h+.1,.36);
      const beams=Math.max(4,Math.round(w/1.4));
      for(let i=0;i<beams;i++)hb('#614833',-w*.42+i*(w*.84/(beams-1)),h-.04,d/2+.16,.16,.24,.46,'wood');
      hb('#918167',0,.15,d/2+.36,2.1,.28,.64,'stone');
      hb('#5a402a',0,1.16,d/2+.04,1.52,2.06,.12,'wood');
      hb('#a89373',0,2.28,d/2+.12,1.98,.26,.30);
      hb('#9b7a43',.42,1.15,d/2+.12,.14,.14,.06,'bronze');
      for(const dx of [-w*.31,w*.31]){
        if(lit)hb('#ffbe6a',dx,2.45,d/2+.04,.64,.86,.08,'linen',{emissive:'#f59a38',emissiveIntensity:1.55,noSurface:true});
        else hb('#473f35',dx,2.45,d/2+.04,.64,.86,.08,'wood');
        hb('#73583c',dx,2.45,d/2+.10,.72,.10,.10,'wood');
        hb('#73583c',dx,2.45,d/2+.10,.09,.88,.10,'wood');
      }
    }

    function colonnade(x1,x2,z,h=4.6,cols=5,c='#c7b694'){
      const span=x2-x1;
      const addS=solidGroup('colonnade'+x1+','+z);
      for(let i=0;i<cols;i++){
        const cx=cols===1?x1:x1+span*(i/(cols-1));
        addS(cx,z,.55);
        if(root.WitnessQ01Environment?.enabled){const y=height(cx,z);root.WitnessQ01Environment.addSolid({id:'q01-column-'+cx+','+z,min:[cx-.46,y,z-.46],max:[cx+.46,y+h+.13,z+.46],kind:'column'});}
        if(root.WitnessModularKit){
          const m=new T.Mesh(root.WitnessModularKit.column(T,h,.34,i*31+7),root.WitnessModularKit.material(T));
          m.position.set(cx,height(cx,z),z);m.castShadow=m.receiveShadow=true;m.userData.reactive=true;decor.add(m);
        }else{
          box('#a8997c',cx,.16,z,.94,.32,.94,'masonry');
          mesh(new T.CylinderGeometry(.30,.36,h-.6,16),c,cx,h/2+.12,z,'masonry');
          box('#b5a385',cx,h-.05,z,.88,.24,.88,'masonry');
        }
      }
      box('#b9a786',x1+span/2,h+.24,z,span+1.4,.46,.98,'masonry');
      if(root.WitnessQ01Environment?.enabled){const y=height(x1+span/2,z);root.WitnessQ01Environment.addSolid({id:'q01-portico-beam',min:[x1-.7,y+h+.01,z-.49],max:[x2+.7,y+h+.47,z+.49],kind:'lintel'});}
    }

    function jar(x,z,scale=1){
      const o=mesh(new T.LatheGeometry([[0,0],[.22,.04],[.38,.28],[.36,.58],[.16,.76],[.20,.86]].map(p=>new T.Vector2(...p)),16),'#b86e49',x,0,z,'terracotta');
      o.scale.setScalar(scale);return o;
    }

    function lamp(x,z){
      if(root.WitnessQ01?.active(s))return null;
      box('#7d705c',x,.12,z,.46,.24,.46,'stone');
      mesh(new T.CylinderGeometry(.065,.09,1.72,10),'#5a4a35',x,.98,z,'bronze');
      const basket=mesh(new T.CylinderGeometry(.20,.14,.18,12),'#4d402c',x,1.88,z,'bronze');
      const flame=mesh(new T.SphereGeometry(.12,10,8),'#ffe29c',x,1.98,z,'linen',{emissive:'#ff9d3b',emissiveIntensity:2.2,noSurface:true,noCast:true});
      flame.userData.reactive=true;
      const light=new T.PointLight('#ffbd6b',11,9.5,1.8);light.position.copy(flame.position);decor.add(light);
      animators.push(t=>{
        const f=1+.12*Math.sin(t*7.2+x)+.08*Math.cos(t*11.4+z);
        flame.scale.set(f*.9,1.1+Math.sin(t*9+x)*.16,f*.9);
        light.intensity=10.5*f;
      });
      return basket;
    }

    function cloth(x,z,w=5,c='#a98e65'){
      pole(x-w/2,z,3.1);pole(x+w/2,z,3.1);
      const geo=new T.PlaneGeometry(w,2.8,10,6);
      const p=geo.attributes.position;
      for(let i=0;i<p.count;i++){
        const u=p.getX(i)/w;
        p.setZ(i,p.getZ(i)-Math.cos(u*Math.PI)*.18);
      }
      geo.computeVertexNormals();
      const o=mesh(geo,c,x,2.95,z,'wool',{side:T.DoubleSide});
      o.rotation.x=-Math.PI/2+.12;o.userData.sway=true;
      if(root.WitnessQ01Environment?.enabled){const y=height(x,z);root.WitnessQ01Environment.addSolid({id:'q01-awning-'+x+','+z,min:[x-w/2,y+2.55,z-1.48],max:[x+w/2,y+3.35,z+1.48],kind:'awning'});}
    }

    function campTent(x,z,yaw=0,c='#9c8868'){
      if(AV?.tent){
        const t=AV.tent(T,c);
        t.position.set(x,height(x,z),z);t.rotation.y=yaw;t.userData.reactive=true;decor.add(t);
      }else{
        cloth(x,z,4.2,c);
      }
    }

    function cart(x,z,tilted=false){
      solidGroup('cart'+x+','+z)(x,z,1.3);
      const grp=new T.Group();grp.position.set(x,height(x,z),z);grp.userData.reactive=true;
      const body=new T.Mesh(new T.BoxGeometry(2.4,.42,1.52),mat('#7e6040','wood'));body.position.y=.72;body.castShadow=true;body.receiveShadow=true;grp.add(body);
      for(const dx of [-1.0,.0,1.0])for(const side of [-.8,.8]){
        const post=new T.Mesh(new T.BoxGeometry(.09,.48,.09),mat('#5a422b','wood'));post.position.set(dx,1.06,side);post.castShadow=true;grp.add(post);
      }
      for(const side of [-.84,.84]){
        const rail=new T.Mesh(new T.BoxGeometry(2.3,.10,.08),mat('#684d31','wood'));rail.position.set(0,1.24,side);grp.add(rail);
        const rim=new T.Mesh(new T.TorusGeometry(.48,.055,8,20),mat('#5a422b','wood'));rim.position.set(0,.48,side);rim.castShadow=true;grp.add(rim);
        const hub=new T.Mesh(new T.CylinderGeometry(.11,.11,.16,10),mat('#493725','bronze'));hub.rotation.x=Math.PI/2;hub.position.set(0,.48,side);grp.add(hub);
        for(let sp=0;sp<4;sp++){
          const spoke=new T.Mesh(new T.BoxGeometry(.05,.88,.04),mat('#684d31','wood'));
          spoke.position.set(0,.48,side);spoke.rotation.z=sp*Math.PI/4;grp.add(spoke);
        }
      }
      for(const sx of [-1,1]){const yoke=new T.Mesh(new T.CylinderGeometry(.04,.05,1.4,6),mat('#5e462f','wood'));yoke.rotation.z=Math.PI/2;yoke.position.set(-1.6,.56,sx*.35);grp.add(yoke);}
      if(tilted)grp.rotation.z=.2;
      decor.add(grp);return grp;
    }

    function carveSeabed(shoreZ,depth=2.2){
      if(!ground?.geometry?.attributes?.position)return;
      const pos=ground.geometry.attributes.position;
      let changed=false;
      for(let i=0;i<pos.count;i++){
        const gx=pos.getX(i),gz=pos.getZ(i);
        const curvedShore=shoreZ+Math.sin(gx*.08)*1.1;
        if(gz<curvedShore){
          const d=Math.min(depth,(curvedShore-gz)*.44);
          pos.setY(i,pos.getY(i)-d);
          changed=true;
        }
      }
      if(changed){pos.needsUpdate=true;ground.geometry.computeVertexNormals();}
    }

    let pendingCoast=null,pendingWater=null;
    function sea(z=-25,tone='#3c7f8c',foamEdge=.085,levelY=-.10,waveScale=.045){
      const night=Boolean(AV?.atmosphere?.(biome)?.night);
      const len=74,cz=z-len*.5+.5;
      pendingCoast=z+.2;
      pendingWater={minX:-92,minZ:cz-len/2,width:184,depth:len,levelY};
      if(AV?.water){
        const w=AV.water(T,tone,184,len,night,biome,{foamEdge,waveScale});
        water=w.water;water.position.set(0,levelY,cz);
        water.userData.reactive=true;water.userData.waterAnimate=w.animate;water.userData.setBed=w.setBed;
        decor.add(water);
      }else{
        water=mesh(new T.PlaneGeometry(184,len,24,16),tone,0,levelY,cz,'stone',{transparent:true,opacity:.84,roughness:.2,metalness:.24});
        water.rotation.x=-Math.PI/2;water.castShadow=false;
      }
    }

    function ginosarBoat(x,z){
      const grp=new T.Group();grp.position.set(x,height(x,z)+.14,z);
      grp.userData.bob=true;grp.userData.baseY=grp.position.y;grp.userData.bobPhase=x*.31;grp.userData.reactive=true;
      const woodMat=mat('#6e4e35','wood'),deckMat=mat('#9e7e57','wood'),trimMat=mat('#4d3522','wood');
      const hull=new T.Mesh(new T.LatheGeometry([[0,-.35],[.95,-.28],[1.42,.04],[1.52,.42],[1.40,.54],[1.24,.50],[.85,-.14],[0,-.18]].map(p=>new T.Vector2(...p)),20),woodMat);
      hull.scale.set(1.05,1,2.7);hull.castShadow=true;hull.receiveShadow=true;grp.add(hull);
      const deck=new T.Mesh(new T.BoxGeometry(2.15,.12,6.2),deckMat);deck.position.y=.22;deck.receiveShadow=true;grp.add(deck);
      for(const dz of [-2.1,-.7,.8,2.2]){const th=new T.Mesh(new T.BoxGeometry(2.5,.09,.32),trimMat);th.position.set(0,.44,dz);th.castShadow=true;grp.add(th);}
      for(const side of [-1.35,1.35])for(const dz of [-1.2,.9]){
        const oar=new T.Mesh(new T.CylinderGeometry(.032,.042,2.1,6),deckMat);
        oar.rotation.z=(side<0?1:-1)*(Math.PI/2-.22);oar.position.set(side*1.15,.36,dz);oar.castShadow=true;grp.add(oar);
      }
      const mast=new T.Mesh(new T.CylinderGeometry(.06,.085,3.8,8),trimMat);mast.position.set(0,2.1,-.7);mast.castShadow=true;grp.add(mast);
      decor.add(grp);return grp;
    }

    function boat(x,z,size=1,sail=true){
      const grp=new T.Group();grp.position.set(x,root.WitnessQ01?.active(s)?.04:height(x,z)+.16,z);
      grp.userData.bob=true;grp.userData.baseY=grp.position.y;grp.userData.bobPhase=x*.25+z*.1;grp.userData.reactive=true;
      const woodMat=mat('#6d4d34','wood'),deckMat=mat('#b0926c','wood'),sailMat=mat('#e5d7b8','linen',{side:T.DoubleSide});
      const hull=new T.Mesh(new T.LatheGeometry([[0,-.4],[1.1,-.32],[1.55,.06],[1.65,.55],[1.42,.66],[.95,-.12],[0,-.2]].map(p=>new T.Vector2(...p)),22),woodMat);
      hull.scale.set(size,size,2.65*size);hull.castShadow=true;hull.receiveShadow=true;grp.add(hull);
      const deck=new T.Mesh(new T.BoxGeometry(2.35*size,.14*size,6.2*size),deckMat);deck.position.y=.35*size;grp.add(deck);
      if(sail){
        const mast=new T.Mesh(new T.CylinderGeometry(.065*size,.095*size,6.8*size,8),woodMat);mast.position.y=3.4*size;mast.castShadow=true;grp.add(mast);
        const yard=new T.Mesh(new T.CylinderGeometry(.045*size,.055*size,4.2*size,7),woodMat);yard.rotation.z=Math.PI/2-.18;yard.position.set(.2*size,5.2*size,0);grp.add(yard);
        const sGeo=new T.PlaneGeometry(3.4*size,4.6*size,8,8);
        const sp=sGeo.attributes.position;
        for(let i=0;i<sp.count;i++){const vx=sp.getX(i),vy=sp.getY(i);sp.setZ(i,Math.cos(vx/(1.7*size)*Math.PI*.5)*Math.cos(vy/(2.3*size)*Math.PI*.5)*.65*size);}
        sGeo.computeVertexNormals();
        const sailM=new T.Mesh(sGeo,sailMat);sailM.position.set(.2*size,3.1*size,.1*size);sailM.castShadow=true;grp.add(sailM);
      }
      decor.add(grp);return grp;
    }

    function caesareaLighthouse(x,z){
      solidGroup('lighthouse'+x+','+z)(x,z,3.1);
      box('#8c7f67',x,.6,z,6.2,1.2,6.2,'masonry');
      box('#a5977b',x,3.8,z,4.8,5.4,4.8,'masonry');
      mesh(new T.CylinderGeometry(1.75,2.15,5.5,8),'#baab8d',x,9.2,z,'masonry');
      mesh(new T.CylinderGeometry(1.38,1.58,2.8,12),'#c6b799',x,13.1,z,'masonry');
      // Open beacon colonnade + golden flame
      for(let i=0;i<6;i++){const a=i*Math.PI/3;box('#c7b79a',x+Math.cos(a)*1.05,15.3,z+Math.sin(a)*1.05,.24,1.6,.24,'masonry');}
      mesh(new T.ConeGeometry(1.48,1.15,12),'#736044',x,16.6,z,'bronze');
      const fire=mesh(new T.SphereGeometry(.42,10,8),'#ffe89c',x,15.3,z,'linen',{emissive:'#ffaa3c',emissiveIntensity:2.8,noSurface:true,noCast:true});
      fire.userData.reactive=true;
      const beacon=new T.PointLight('#ffcc78',36,44,1.5);beacon.position.copy(fire.position);decor.add(beacon);
      animators.push(t=>{beacon.intensity=34+Math.sin(t*6.3)*4.5;});
    }

    const desc=descriptor(s),isVeil=s.layer?.kind==='veil';
    if(isVeil){
      scene.fog=new T.FogExp2('#1d2e38',.011);scene.background=new T.Color('#1d2e38');
      for(let i=0;i<9;i++){
        const x=-20+i*5,z=-14+(i%2)*4;
        box('#5e6d6b',x,.28,z,3.6,.56,3.6,'masonry');
        mesh(new T.CylinderGeometry(.26,.34,5.4,16),'#6c7d78',x,2.9,z,'masonry');
        box('#8f8266',x,5.45,z,.76,.18,.76,'bronze');
      }
      cloth(-2,-18,11,'#677a75');lamp(-8,4);lamp(8,-8);
      sparkEmitter(0,.8,-4,36,'#f6d68f',14,4.5);
      if(s.layer.id==='V02'){for(let i=0;i<5;i++)box('#7d8e8a',-8+i*4,.35,-3,2.8,.22,2.4,'masonry');}
      if(s.layer.id==='V04'){box('#766750',0,.75,-3,1.1,.22,1.1,'masonry');box('#82725a',0,1.35,-3.4,1.0,1.2,.16,'masonry');}
    }else if(s.layer?.id==='L03'){
      scene.fog=new T.FogExp2('#3d352b',.011);
      if(ground){ground.material=mat('#665843','earth');ground.material.roughness=.92;}
      mesh(new T.CylinderGeometry(18,18,11.5,64,1,true),'#827159',0,5.6,-3,'masonry',{side:T.BackSide});
      const lip=mesh(new T.TorusGeometry(18,.52,10,64),'#ad9a7a',0,11.2,-3,'masonry');lip.rotation.x=Math.PI/2;
      // Windlass crossbar beam & taut braided rope hanging into cistern
      box('#5a422b',0,11.4,-4,8,.34,.38,'wood');
      mesh(new T.CylinderGeometry(.28,.28,1.8,12),'#6d5034',0,11.1,-4,'wood').rotation.z=Math.PI/2;
      const rope=mesh(new T.CylinderGeometry(.055,.055,10.8,8),'#d6b785',0,5.4,-4,'linen');rope.rotation.z=.04;
      volumetricShaft(0,5.8,-3.2,4.2,7.2,11.6,0,'#ffe7b8',.16);
      sparkEmitter(0,1.2,-3.2,32,'#ffe4a8',3.4,7.5);
      const openingLight=new T.PointLight('#f5dfb4',64,36,1.25);openingLight.position.set(0,10.8,-3);decor.add(openingLight);
      lamp(-5,4);jar(-7,-1,.88);
    }else if(s.layer?.id==='L05'){
      scene.fog=new T.FogExp2('#292521',.012);
      for(const x of [-15,15])box('#786e5a',x,3.4,-3,1.4,7.4,26,'masonry');
      for(let z=-14;z<=8;z+=5.5){
        box('#695e4c',-14.1,3.4,z,.7,7.4,.9,'masonry');box('#695e4c',14.1,3.4,z,.7,7.4,.9,'masonry');
        box('#736855',0,6.9,z,30,.75,.85,'masonry');
      }
      box('#6e6351',0,3.4,-16,30,7.4,1.4,'masonry');
      for(let x=-12;x<14;x+=1.2){
        const bar=box('#544c44',x,2.5,-11,.13,5.2,.13,'bronze',{metalness:.45,roughness:.55});
        if(Math.abs(x)<2.2){bar.userData.reactive=true;const openBar=next=>{bar.position.x=x+(next.layer?.step>=1?(x<0?-1.1:1.1):0);};reactive.push(openBar);openBar(s);}
      }
      lamp(-8,5);lamp(9,-9);
    }else if(s.layer?.id==='L02'){
      scene.fog=new T.FogExp2('#4b524a',.0085);
      for(let i=0;i<14;i++){const o=mesh(new T.DodecahedronGeometry(3.6,1),'#877f6b',-25+i*4.2,2.1,-17,'stone');o.scale.set(1.1,1.95,1.0);o.rotation.y=i*.4;}
      for(const x of [-25,10])box('#757263',x,3.5,-5,3.4,7.6,25,'stone');
      box('#6c685b',-7,7.3,-8,33,1.6,22,'stone');
      for(let i=0;i<7;i++){const st=mesh(new T.ConeGeometry(.38,1.5+(i%3)*.4,7),'#8d846f',-20+i*4.4,6.1,-9+(i%2)*4,'stone');st.rotation.x=Math.PI;}
      box('#a2987b',-21,.18,1,3.2,.24,18,'masonry');
      volumetricShaft(-6,5.2,9.5,2.4,5.4,12.5,-.42,'#fff0cb',.15);
      volumetricShaft(9,6.2,11.5,3.6,7.5,14.5,-.36,'#fff4d8',.14);
      sparkEmitter(4,1.2,10,28,'#ffeaaf',5.2,5.5);
      const shaft=new T.PointLight('#efe3c2',28,24,1.45);shaft.position.set(-10,7,11);decor.add(shaft);
      const valleySun=new T.PointLight('#fff1cf',42,32,1.3);valleySun.position.set(14,9,13);decor.add(valleySun);
      lamp(-12,5);lamp(0,-9);cloth(2,-13,2,'#9d8764');
      box('#cbb993',13,.04,12,16,.08,12,'stone');
    }else if(s.layer?.id==='L04'){
      sea(-13.8,'#3a7788',.09,.08,.038);
      ginosarBoat(-13,-19);
      box('#8c714d',-11.8,.22,-11,11.2,.28,13.6,'wood');
      cloth(-14,-10,3.2,'#a99d7e');
      for(let i=0;i<8;i++)box('#aba78e',-2+i*2.9,.04,-1,2.5,.07,1.4,'stone');
      for(let i=0;i<6;i++){const rk=mesh(new T.DodecahedronGeometry(1.6+i*.3,1),'#9e9581',18+i*3.2,.4,-13+Math.sin(i*2)*2.4,'stone');rk.scale.set(1.2,.65,1.1);}
      // Bếp than hồng (anthrakia) với ánh than nóng và tàn lửa bốc lên
      box('#746c5e',5.2,.1,2.1,1.45,.20,1.45,'stone');
      const coalMat=new T.MeshStandardMaterial({color:'#8c3b1b',emissive:'#f06a22',emissiveIntensity:2.1,roughness:.75});
      const coals=new T.Mesh(new T.SphereGeometry(.40,14,10),coalMat);coals.position.set(5.2,height(5.2,2.1)+.22,2.1);coals.scale.set(1,.42,1);coals.userData.reactive=true;decor.add(coals);
      sparkEmitter(5.2,height(5.2,2.1)+.35,2.1,18,'#ffaa4a',.32,1.5);
      emberLight=new T.PointLight('#ff9e52',9.5,12,1.7);emberLight.position.set(5.2,height(5.2,2.1)+.9,2.1);decor.add(emberLight);
      box('#c9ab78',6.0,.26,2.2,.46,.10,.36,'linen');box('#7d8785',4.6,.26,2.3,.54,.075,.23,'bronze');
      for(let i=0;i<5;i++)jar(3.8+i*.52,4.1,.45);
      box('#9d8c67',7.2,.42,2,2.4,.18,1.5,'stone');lamp(10,9);
    }else if(s.layer?.id==='L01'){
      scene.fog=new T.FogExp2('#856e57',.0052);
      campTent(-24,15,.4,'#9e8867');campTent(-19,18,-.3,'#8e7a5c');campTent(-11,18,.2,'#a79271');
      cloth(-23,10,5,'#b8a278');cloth(-2,10,4,'#beae8a');
      for(let i=0;i<5;i++)jar(-25+i*.8,13,.8);
      const stuckCart=cart(-6.8,7.8,true);
      const updateCart=next=>{stuckCart.rotation.z=next.layer?.id==='L01'&&next.layer.step>=4?0:.22;};
      reactive.push(updateCart);updateCart(s);
      // Swirling Shader Pillar of Fire & Cloud (step >= 6)
      const pilShader=new T.ShaderMaterial({
        uniforms:{uTime:{value:0},uFire:{value:new T.Color('#ffb854')},uCloud:{value:new T.Color('#f0dec0')}},
        transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
        vertexShader:`varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.x+=sin(uv.y*7.)*.35;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
        fragmentShader:`
          varying vec2 vUv;uniform float uTime;uniform vec3 uFire,uCloud;
          float n2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          void main(){
            float swirl=sin(vUv.x*18.+vUv.y*12.-uTime*3.6)*.5+.5;
            float swirl2=sin(vUv.x*10.-vUv.y*16.-uTime*2.1)*.5+.5;
            float fade=smoothstep(0.,0.15,vUv.y)*smoothstep(1.,0.12,vUv.y);
            vec3 col=mix(uFire*1.4,uCloud,smoothstep(.2,.85,vUv.y)*.65);
            gl_FragColor=vec4(col,fade*(.32+swirl*.28+swirl2*.20));
          }`
      });
      const pillar=new T.Mesh(new T.CylinderGeometry(2.5,4.1,19,24,12,true),pilShader);
      pillar.position.set(-22,9.5,23);pillar.userData.reactive=true;decor.add(pillar);
      const pilCore=mesh(new T.CylinderGeometry(1.1,2.0,18,16,1,true),'#ffe1a6',-22,9,23,'linen',{transparent:true,opacity:.32,emissive:'#ff9d3b',emissiveIntensity:1.8,noSurface:true,noCast:true});
      pilCore.userData.reactive=true;
      const pilSparks=sparkEmitter(-22,1.2,23,44,'#ffc56b',2.8,14);
      const pillarLight=new T.PointLight('#ffbd6e',36,34,1.35);pillarLight.position.set(-22,7,21);decor.add(pillarLight);
      animators.push(t=>{pilShader.uniforms.uTime.value=t;});
      const updatePillar=next=>{const on=next.layer?.id==='L01'&&next.layer.step>=6;pillar.visible=pilCore.visible=pilSparks.visible=pillarLight.visible=on;};
      reactive.push(updatePillar);updatePillar(s);
      // Parted walls of the Red Sea (step >= 7) with churning subsurface wave shader
      const wallShader=new T.ShaderMaterial({
        uniforms:{uTime:{value:0},uDeep:{value:new T.Color('#275f6d')},uCrest:{value:new T.Color('#8ec8cc')}},
        transparent:true,side:T.DoubleSide,
        vertexShader:`
          varying vec2 vUv;uniform float uTime;
          void main(){
            vUv=uv;vec3 p=position;
            p.x+=sin(p.z*.45+uTime*2.1+p.y*.5)*.28;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
          }`,
        fragmentShader:`
          varying vec2 vUv;uniform float uTime;uniform vec3 uDeep,uCrest;
          void main(){
            float curr=sin(vUv.x*22.-uTime*2.4+sin(vUv.y*10.+uTime)*1.4)*.5+.5;
            float foam=smoothstep(.65,.98,vUv.y)+curr*.22;
            vec3 col=mix(uDeep,uCrest,clamp(foam,0.,1.));
            gl_FragColor=vec4(col,.82);
          }`
      });
      animators.push(t=>{wallShader.uniforms.uTime.value=t;});
      for(const x of [-28,28]){
        const wall=new T.Mesh(new T.BoxGeometry(7.8,10.2,38,4,8,16),wallShader);
        wall.position.set(x,height(x,-18)+4.8,-18);wall.userData.reactive=true;wall.userData.wallWave=true;wall.userData.baseY=wall.position.y;decor.add(wall);
        const crest=box('#dff2ef',x+(x<0?3.7:-3.7),.22,-18,.65,.28,36,'linen',{emissive:'#9cc9cc',emissiveIntensity:.35,noSurface:true,noCast:true});
        crest.userData.reactive=true;
        const apply=next=>{const open=next.layer?.id==='L01'&&next.layer.step>=7;wall.visible=open;crest.visible=open;};
        reactive.push(apply);apply(s);
      }
      for(let i=0;i<9;i++)box('#b7a379',-5+i*3.8,.035,-12,1.3,.06,13.5,'stone');
      lamp(-10,6);lamp(2,-2);lamp(18,-20);
    }else if(desc.region==='caesarea'){
      sea(root.WitnessQ01Environment?.enabled?-19.8:-24,'#2d6f7f',.075);
      // Herodian stone seawall & quay walkway
      if(!root.WitnessQ01Environment?.enabled){box('#a5987e',0,.25,-22,68,.55,3.2,'masonry');
      for(let x=-20;x<=20;x+=5)box('#877a63',x,.65,-23.2,.48,.48,.48,'stone');}
      if(M.chapter(s).id!=='Q01'||s.layer)house(-23,-13,9,7,5.2,'#cbb998',true);house(-10,-21,8,6,4.5,'#c7b493');house(4,-22,10,5,5.2,'#d1c0a0',true);house(27,-10,6,10,5.5,'#c4b292');
      colonnade(-4,10,root.WitnessQ01Environment?.enabled?-18.1:-21,root.WitnessQ01Environment?.enabled?4.4:4.6,5,'#cbbba0');
      cloth(6,10,6,'#b69b72');cloth(-6,9,4.5,'#8e9c91');
      if(!root.WitnessQ01Environment?.enabled)for(let i=0;i<6;i++){box('#927554',12+i*2,.25,-24,1.9,.36,8,'wood');pole(12+i*2,-21,1.4);}
      // Roman polyspastos treadwheel harbor crane
      solidGroup('crane')(9,-19,.45);
      pole(9,-19,5.8,'#5e462f',.13);
      const wheel=mesh(new T.TorusGeometry(1.1,.08,8,20),'#6e5237',9.3,1.8,-19,'wood');wheel.rotation.y=Math.PI/2;
      const jib=box('#73563a',9,5.3,-21.4,.24,.24,5.6,'wood');jib.rotation.x=-.35;jib.userData.reactive=true;
      boat(18,-31,1.15,true);boat(-1,-32,.75,false);
      const cargoS=solidGroup('cargo');
      for(let i=0;i<5;i++){box('#9c805a',-24+i*1.2,.5,2,1,1,.9,'wood');cargoS(-24+i*1.2,2,.7);jar(19+i*.7,-14,.82);}
      caesareaLighthouse(27,-30);
      lamp(-6,7);lamp(16,6);
    }else if(desc.region==='galilee'){
      sea(-23,'#3c7f8c',.095);
      house(-22,-11,7,6,3.6,'#b5ad8f');house(-11,-22,6,5,3.1,'#bfb99c');house(22,-17,8,5,3.4,'#a59e85',true);
      box('#7d6143',6,.22,-22.5,2.4,.24,6.5,'wood');
      ginosarBoat(6,-28);cloth(-10,7,6,'#9d9b7c');
      for(let i=0;i<5;i++){pole(-16+i*1.5,-8,2.1);box('#746b50',-16+i*1.5,1.35,-8,.07,.07,3.2,'linen');}
      for(let i=0;i<6;i++)jar(19+i%3,4+Math.floor(i/3),.85);
      lamp(-4,7);lamp(14,4);
    }else if(desc.region==='jerusalem'){
      house(-24,-5,8,15,6,'#d2c1a1');house(27,-3,8,19,7,'#cbb999',true);house(1,-24,22,6,6.8,'#d7c7a7');
      colonnade(-12,14,-21,6.4,7,'#d7c7a8');
      cloth(-10,7,7,'#8d786c');
      for(let i=0;i<11;i++)for(let j=0;j<6;j++)box((i+j)%2?'#bfb193':'#c8ba9d',-16+i*3,.045,14-j*4,2.88,.07,3.88,'masonry');
      for(let i=0;i<4;i++)jar(-19+i*.7,-9,.9);
      lamp(-7,4);lamp(15,6);box('#cbb994',-22,8,-26,4.2,16,4.2,'masonry');box('#a89778',-22,16.2,-26,4.6,.5,4.6,'masonry');
    }else if(desc.region==='ravine'){
      if(AV?.water){
        const st=AV.water(T,'#4d888b',8.5,58,false,biome,{foamEdge:.14,waveScale:.035});
        water=st.water;water.position.set(20,.05,-4);water.userData.reactive=true;
        water.userData.waterAnimate=st.animate;water.userData.setBed=st.setBed;
        pendingWater={minX:20-4.25,minZ:-4-29,width:8.5,depth:58,levelY:.05};
        decor.add(water);
      }else{
        const stream=mesh(new T.PlaneGeometry(8.5,56,8,12),'#6c999b',20,.04,-4,'stone',{transparent:true,opacity:.86,roughness:.2});stream.rotation.x=-Math.PI/2;water=stream;
      }
      for(let i=0;i<7;i++){const o=mesh(new T.DodecahedronGeometry(2.5,1),'#a39173',24+(i%2)*4,1,-24+i*7,'stone');o.scale.set(1.4,1.1,1);}
      pole(-3,-2,1.3);pole(12,-9,1.2);box('#927752',13,.2,-8,4,.2,3,'wood');lamp(-9,8);
    }else{
      house(-24,-11,7,5,3,'#cbb795');cart(4,-9,false);cloth(8,-8,6,'#ab9370');for(let i=0;i<5;i++)jar(17+i*.7,-12,.8);lamp(-11,7);
    }

    if(!s.layer){
      if(s.flags.bridge)box('#8f724d',-2,.14,-1,4,.24,1.9,'wood');
      if(s.quests.Q04.route==='tools'){box('#8c7049',9,.4,10,2,.7,.7,'wood');pole(10,10,1.4);}
      if(M.chapter(s).id==='Q01'&&!root.WitnessCraftRenderer){
        pole(-11.4,5.5,2.5);pole(-8.6,5.5,2.5);box('#6f5136',-10,2.5,5.5,3,.18,.22,'wood');
        const hanging=box('#9d7954',-10,1.2,5.7,2,.9,1.1,'wood');hanging.userData.reactive=true;
        const apply=next=>{hanging.rotation.z=next.quests.Q01.done.includes('brace')?0:.18;};
        reactive.push(apply);apply(s);
      }
    }
    if(pendingCoast!==null&&!root.WitnessQ01Environment?.enabled)carveSeabed(pendingCoast);
    // Real bed depth for Beer-Lambert absorption and shoreline foam, sampled
    // from the displaced terrain grid after the seabed carve.
    if(water?.userData?.setBed&&ground?.geometry?.parameters&&pendingWater&&root.WitnessGraphics?.bedTexture){
      const bed=root.WitnessGraphics.bedTexture(T,ground.geometry,pendingWater.minX,pendingWater.minZ,pendingWater.width,pendingWater.depth);
      water.userData.setBed(bed,pendingWater.levelY);
    }
    if(root.WitnessArchitecture&&ground){terrainSampler=root.WitnessArchitecture.terrainSampler(ground);scene.userData.terrainHeight=height;}
    if(!s.layer&&M.chapter(s).id==='Q01'&&root.WitnessArchitecture){
      const architecture=root.WitnessArchitecture.install({T,scene,height,ground,state:s});
      if(root.WitnessQ01){const finish=root.WitnessQ01.install({T,scene,height,architecture,state:s});placeSolids.push({id:'q01-finish-solids',solids:finish.outdoorSolids});animators.push(time=>finish.tick(time));}
      if(root.WitnessQ01Environment?.enabled)root.WitnessQ01Environment.install({T,scene,height,architecture,state:s});
      // Vegetation generated for the former closed building cannot occupy its new interior.
      const matrix=new T.Matrix4(),position=new T.Vector3(),r=architecture.bounds;
      const instances=[];scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isInstancedMesh&&o.name!=='q01-olive-leaves')instances.push(o);});
      const color=new T.Color();
      for(const batch of instances){
        let count=0;
        for(let i=0;i<batch.count;i++){
          batch.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix).applyMatrix4(batch.matrixWorld);
          if(root.WitnessQ01?.clearVegetation(position.x,position.z)||(position.x>r[0]-.3&&position.x<r[1]+.3&&position.z>r[2]-.3&&position.z<r[3]+.3))continue;
          batch.setMatrixAt(count,matrix);if(batch.instanceColor){batch.getColorAt(i,color);batch.setColorAt(count,color);}count++;
        }
        if(count!==batch.count){batch.count=count;batch.instanceMatrix.needsUpdate=true;if(batch.instanceColor)batch.instanceColor.needsUpdate=true;batch.computeBoundingSphere();}
      }
    }

    // Gộp vật cảnh tĩnh theo vật liệu để giữ tốc độ khung hình mượt mà trên cả thiết bị di động.
    decor.updateMatrixWorld(true);const batches=new Map();
    for(const item of [...decor.children]){
      if(!item.isMesh||item===water||item.userData.sway||item.userData.reactive||item.userData.bob||item.userData.wallWave||Array.isArray(item.material))continue;
      const key=item.material.uuid;if(!batches.has(key))batches.set(key,{material:item.material,geometries:[],cast:item.castShadow});
      const g=(item.geometry.index?item.geometry.toNonIndexed():item.geometry.clone()).applyMatrix4(item.matrix);
      batches.get(key).geometries.push(g);decor.remove(item);item.geometry.dispose();
    }
    for(const batch of batches.values()){
      const merged=new T.BufferGeometry();
      for(const name of ['position','normal','uv','aMask']){
        const size=name==='uv'?2:3;
        const length=batch.geometries.reduce((n,g)=>n+(g.attributes[name]?.count||0)*size,0);
        if(!length||batch.geometries.some(g=>!g.attributes[name]))continue;
        const array=new Float32Array(length);let offset=0;
        for(const g of batch.geometries){const attr=g.getAttribute(name);array.set(attr.array,offset);offset+=attr.count*size;}
        merged.setAttribute(name,new T.BufferAttribute(array,size));
      }
      const m=new T.Mesh(merged,batch.material);m.castShadow=batch.cast;m.receiveShadow=true;decor.add(m);
      for(const g of batch.geometries)g.dispose();
    }
    if(root.WitnessCraftRenderer){
      const crafted=root.WitnessCraftRenderer.create({T,scene,height});crafted.update(s);
      reactive.push(next=>crafted.update(next));animators.push(time=>crafted.tick(time));
    }
    root.WitnessGraphics?.configureScene(T,scene,biome,s.layer?.id??M.chapter(s).id);
    if(root.WitnessQ01?.active(s)&&scene.userData.graphics){scene.userData.graphics.fogDensity=s.settings.q01Lighting==='evening'?.0045:.0027;scene.userData.graphics.fogFalloff=.22;}
  }

  function makeController(engine,callbacks){
    const held=new Set();let enabled=false,last=0,touch=null,sprintLatched=false,padPrevious=[],frame=0,prevPos=null,lastDir=null;
    const stick=document.getElementById('stick'),world=document.getElementById('world');
    const DEADZONE=10,LEASH=64;

    // Chặn đi thủ công xuyên người/đồ vật nhỏ: chỉ dự báo bước kế tiếp từ hướng di chuyển
    // thực tế, không đụng engine.walk tự động (input=0 khi đang dẫn đường).
    function manualBlocked(nx,nz){
      if(!current)return false;
      const sp=engine.spatial?.();if(sp&&root.WitnessArchitecture&&['roof','stairs'].includes(root.WitnessArchitecture.family(sp.supportId)))return false;
      const ch=M.chapter(current);
      for(const nd of ch.nodes){
        if(nd.model==='gate')continue;
        const r=nd.person?.45:.6;
        const at=nd.person?(engine.locate?.(nd.id)||nd.at):nd.at;
        if((nx-at[0])**2+(nz-at[1])**2<r*r)return true;
      }
      if(ch.companion&&!ch.nodes.some(nd=>nd.person===ch.companion)&& (nx+23)**2+(nz-4)**2<.45*.45)return true;
      return false;
    }

    function motion(time){
      frame=requestAnimationFrame(motion);
      const dt=Math.min(.05,(time-last)/1000||.016);last=time;if(!enabled)return;
      let x=(held.has('d')||held.has('ArrowRight')?1:0)-(held.has('a')||held.has('ArrowLeft')?1:0);
      let y=(held.has('w')||held.has('ArrowUp')?1:0)-(held.has('s')||held.has('ArrowDown')?1:0);
      let run=current?.settings?.sprintToggle?sprintLatched:held.has('Shift');

      if(touch){
        const raw=Math.hypot(touch.dx,touch.dy);
        if(raw>DEADZONE){
          const norm=Math.min(1,(raw-DEADZONE)/(LEASH-DEADZONE));
          const curved=Math.pow(norm,1.25);
          x=(touch.dx/raw)*curved;
          y=(-touch.dy/raw)*curved;
          if(norm>.92)run=true;
        }
      }

      let turn=(held.has('r')?1:0)-(held.has('q')?1:0);
      const p=Array.from(navigator.getGamepads?.()||[]).find(Boolean);
      if(p){
        const dz=v=>Math.abs(v)>.2?(Math.abs(v)-.2)/.8*Math.sign(v):0;
        const btn=p.buttons.map(b=>b.pressed);
        const dpadX=(btn[15]?1:0)-(btn[14]?1:0),dpadY=(btn[12]?1:0)-(btn[13]?1:0);
        x=x||dpadX||dz(p.axes[0]||0);
        y=y||dpadY||-dz(p.axes[1]||0);
        turn+=dz(p.axes[2]||0);
        const lookY=dz(p.axes[3]||0);
        if(lookY)engine.pitch(-lookY*dt*1.6);
        if(btn[11]&&!padPrevious[11])callbacks.view?.();
        if(btn[0]&&!padPrevious[0])callbacks.interact();
        if(btn[3]&&!padPrevious[3])callbacks.journal();
        if(btn[5]&&!padPrevious[5])callbacks.guide();
        if(btn[9]&&!padPrevious[9])callbacks.pause();
        if(btn[2]&&!padPrevious[2])engine.action('strike');
        if(btn[1]&&!padPrevious[1])engine.action('dodge');
        if(btn[4]!==padPrevious[4])engine.action('guard',!!btn[4]);
        padPrevious=btn;
        run=run||!!btn[10];
      }
      const n=Math.hypot(x,y);if(n>1){x/=n;y/=n;}
      if(n===0&&current?.settings?.sprintToggle)sprintLatched=false;
      const pos=engine.at?.();
      if(pos){
        if(prevPos){
          const mx=pos[0]-prevPos[0],mz=pos[1]-prevPos[1],ml=Math.hypot(mx,mz);
          if(ml>1e-5)lastDir=[mx/ml,mz/ml];
        }
        if(prevPos&&(x||y)&&lastDir&&manualBlocked(pos[0]+lastDir[0]*.16,pos[1]+lastDir[1]*.16)){
          const tx=-lastDir[1],tz=lastDir[0];
          if(!manualBlocked(pos[0]+tx*.16,pos[1]+tz*.16)){const dot=x*tx+y*tz;x=tx*dot;y=tz*dot;}
          else if(!manualBlocked(pos[0]-tx*.16,pos[1]-tz*.16)){const dot=x*(-tx)+y*(-tz);x=-tx*dot;y=-tz*dot;}
          else{x=0;y=0;}
        }
        prevPos=pos;
      }
      engine.controls(x,y,run);
      if(turn)engine.rotate(turn*dt*1.75);
    }

    document.addEventListener('keydown',e=>{
      if(e.target.matches('input,select,textarea'))return;
      if(!enabled){if(e.key==='Escape')callbacks.escape();return;}
      const key=e.key.length===1?e.key.toLowerCase():e.key;
      if(['w','a','s','d','q','r','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift',' '].includes(key)){e.preventDefault();held.add(key);}
      if(e.repeat)return;
      if(key==='Shift'&&current?.settings?.sprintToggle)sprintLatched=!sprintLatched;
      if(key==='e')callbacks.interact();
      if(key==='j')callbacks.journal();
      if(key==='m')callbacks.map();
      if(key==='f')callbacks.guide();
      if(key==='z'&&callbacks.focus)callbacks.focus();
      if(key==='c')engine.recenter();
      if(key==='v')callbacks.view?.();
      if(key==='Escape')callbacks.pause();
      if(key===' ')engine.action('dodge');
      if(key==='k')engine.action('strike');
      if(key==='h')engine.action('guard',true);
    });
    document.addEventListener('keyup',e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;held.delete(key);if(key==='h')engine.action('guard',false);});
    window.addEventListener('blur',()=>{held.clear();sprintLatched=false;engine.controls(0,0);engine.action('guard',false);});

    world.addEventListener('pointerdown',e=>{
      if(!enabled||e.pointerType==='mouse')return;
      const rightSide=current?.settings?.stickSide==='right';
      const inZone=rightSide?e.clientX>=innerWidth*.55:e.clientX<=innerWidth*.48;
      if(!inZone)return;
      e.stopImmediatePropagation();e.preventDefault();
      touch={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};
      world.setPointerCapture(e.pointerId);
      stick.style.left=e.clientX+'px';stick.style.top=e.clientY+'px';stick.classList.add('active');
    },true);

    world.addEventListener('pointermove',e=>{
      if(touch?.id!==e.pointerId)return;
      e.stopImmediatePropagation();
      const dx=e.clientX-touch.x,dy=e.clientY-touch.y,dist=Math.hypot(dx,dy),scale=dist>LEASH?LEASH/dist:1;
      touch.dx=dx*scale;touch.dy=dy*scale;
      stick.firstElementChild.style.transform=`translate(${touch.dx.toFixed(1)}px,${touch.dy.toFixed(1)}px)`;
    },true);

    const release=e=>{if(touch?.id!==e.pointerId)return;e.stopImmediatePropagation();touch=null;stick.classList.remove('active');stick.firstElementChild.style.transform='';};
    world.addEventListener('pointerup',release,true);world.addEventListener('pointercancel',release,true);

    frame=requestAnimationFrame(motion);
    return {
      enable(v){enabled=v;if(!v){held.clear();sprintLatched=false;touch=null;stick.classList.remove('active');engine.controls(0,0);}},
      destroy(){cancelAnimationFrame(frame);}
    };
  }

  root.WitnessWorld={
    descriptor,layout,plan,decorate,
    setState(s){current=s;for(const update of reactive)update(s);},
    makeController,getContext(){return context;}
  };
})(globalThis);
