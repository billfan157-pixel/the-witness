(function(root){
  'use strict';
  function create({T,scene,height}){
    const C=root.WitnessCraft,X=root.WitnessDepth,stage=new T.Group(),materials=new Map(),entries=new Map(),work=new Map(),motions=[],ambient=[];
    stage.name='witness-crafted-scenes';scene.add(stage);let current=null,signature='';
    const material=(color,kind='wood',extra={})=>{
      const key=color+kind+JSON.stringify({...extra,map:extra.map?.uuid});if(!materials.has(key)){const m=new T.MeshStandardMaterial({color,roughness:.88,...extra});if(!extra.map)root.AdventureVisuals?.surface?.(m,kind);materials.set(key,m);}return materials.get(key);
    };
    const mesh=(parent,geo,color,at=[0,0,0],kind='wood',extra={})=>{const m=new T.Mesh(geo,material(color,kind,extra));m.position.set(...at);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
    const box=(p,c,x,y,z,w,h,d,kind='wood')=>mesh(p,new T.BoxGeometry(w,h,d),c,[x,y,z],kind);
    const cyl=(p,c,x,y,z,r,h,kind='wood')=>mesh(p,new T.CylinderGeometry(r,r*.94,h,12),c,[x,y,z],kind);
    const group=(parent,name)=>{const g=new T.Group();g.name=name;parent.add(g);return g;};
    const ground=(g,at)=>g.position.set(at[0],height(...at)+.035,at[1]);
    function cord(p,points,r=.025,color='#8c7655'){
      return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),Math.max(8,points.length*4),r,5,false),color,[0,0,0],'linen');
    }
    function text(p,lines,x=0,y=1.02,z=0,w=1.8,h=1.2,flat=true){
      const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;const ctx=canvas.getContext('2d');
      ctx.fillStyle='#e0d0ad';ctx.fillRect(0,0,768,512);ctx.strokeStyle='#ae9876';ctx.lineWidth=7;ctx.strokeRect(12,12,744,488);
      ctx.fillStyle='#31291f';ctx.font='64px Georgia, serif';ctx.textBaseline='top';
      const rows=[];for(const line of lines){let row='';for(const word of String(line).split(' ')){const next=row?(row+' '+word):word;if(ctx.measureText(next).width>670&&row){rows.push(row);row=word;}else row=next;}rows.push(row);}
      let yy=Math.max(32,(512-Math.min(rows.length,6)*72)/2);for(const row of rows.slice(0,6)){ctx.fillText(row,44,yy);yy+=72;}
      const texture=new T.CanvasTexture(canvas);if(T.SRGBColorSpace)texture.colorSpace=T.SRGBColorSpace;
      const plane=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide,toneMapped:false}));plane.position.set(x,y,z);p.add(plane);if(flat)plane.rotation.x=-Math.PI/2;plane.userData.craftTexture=texture;return plane;
    }
    function table(p){box(p,'#745439',0,.74,0,2,.16,1.35);for(const x of [-.78,.78])for(const z of [-.46,.46])box(p,'#62492f',x,.35,z,.12,.7,.12);}
    function bowl(p,x=0,y=.86,z=0,full=true){
      const b=mesh(p,new T.LatheGeometry([[.03,0],[.12,.02],[.22,.11],[.27,.22],[.25,.25]].map(a=>new T.Vector2(...a)),12),'#a7633c',[x,y,z],'terracotta');
      const food=mesh(p,new T.CircleGeometry(.225,16),'#a58d52',[x,y+.205,z],'stone');food.rotation.x=-Math.PI/2;food.visible=full;return {b,food};
    }
    function jar(p,x=0,y=.9,z=0){return mesh(p,new T.LatheGeometry([[.04,0],[.18,.03],[.26,.28],[.22,.49],[.11,.57],[.13,.64]].map(a=>new T.Vector2(...a)),14),'#ac704b',[x,y,z],'terracotta');}
    function lantern(p,x=0,z=0){
      const g=group(p,'lamp');g.position.set(x,0,z);cyl(g,'#685036',0,.64,0,.055,1.28);bowl(g,0,1.25,0,false);
      const flame=mesh(g,new T.SphereGeometry(.09,8,6),'#ffe0a0',[0,1.57,0],'linen',{emissive:'#d8944d',emissiveIntensity:1.25});flame.scale.y=1.5;
      const light=new T.PointLight('#ffd09a',2.8,5,2);light.position.set(0,1.6,0);g.add(light);ambient.push(t=>{if(!current?.settings?.motion||current.settings.motion==='calm')return;flame.scale.y=1.5+Math.sin(t*5.2)*.14;});return {group:g,light};
    }
    function sack(p,x,y,z,wet=false){const m=mesh(p,new T.SphereGeometry(.22,9,7),wet?'#6d6e56':'#a18b64',[x,y,z],'linen');m.scale.set(1,.85,.7);return m;}
    function tool(p){box(p,'#6d5034',0,.3,0,1.3,.18,.8);for(let i=0;i<3;i++){const h=cyl(p,'#82623f',-.35+i*.32,.47,0,.035,.62);h.rotation.z=Math.PI/2;box(p,'#4c5149',-.52+i*.32,.49,.13,.18,.08,.3,'bronze');}}
    function model(kind,title){
      const g=group(stage,'crafted-'+kind),m={g,kind};
      if(kind==='cart'){
        const body=group(g,'cart-load');m.body=body;box(body,'#82613f',0,.76,0,2.15,.24,1.3);box(body,'#5c452d',0,.5,0,.13,.15,1.8);
        for(const z of [-.76,.76]){const wheel=mesh(body,new T.TorusGeometry(.48,.065,6,20),'#60452c',[0,.47,z]);for(let i=0;i<4;i++){const spoke=box(body,'#7a5c3c',0,.47,z,.055,.89,.04);spoke.rotation.z=i*Math.PI/4;}cyl(body,'#51422e',0,.47,z,.10,.13);}
        for(const x of [-.85,.85])for(const z of [-.55,.55])box(body,'#684b31',x,1.04,z,.075,.46,.075);
        m.vessels=[jar(body,-.42,.91,0),jar(body,.4,.91,0)];m.peg=group(g,'old-split-peg');const pin=cyl(m.peg,'#705237',0,.45,.87,.055,.44);pin.rotation.z=.22;box(m.peg,'#30291d',.015,.52,.9,.014,.19,.008);
        m.brace=box(g,'#b7a078',0,.32,-.05,1.6,.14,.32);m.brace.rotation.z=-.24;m.brace.visible=false;
        m.rope=cord(g,[[-1,.1,-1.3],[-.8,.7,-.6],[.2,1.14,.55],[1.35,.1,1.35]],.034);m.rope.visible=false;
        const wedge=box(g,'#9c8058',-.28,.12,-.83,.4,.18,.3);wedge.rotation.z=.16;m.wedge=wedge;
      }else if(['paper','wetpaper','letter','copies','envelopes','ledger','private-record'].includes(kind)){
        table(g);m.pages=[];
        if(kind==='ledger'){
          const labels=['Nhận','Hỏng','Chưa rõ'];for(let i=0;i<3;i++){text(g,[labels[i]],-.63+i*.63,.84,-.32,.55,.32);const items=[];for(let n=0;n<24;n++)items.push(sack(g,-.82+i*.63+(n%3)*.14,.9+Math.floor(n/6)*.08,.03+Math.floor((n%6)/3)*.21,i===1));m.pages.push(items);}
        }else{
          const texts=kind==='paper'?['B06','Ghi nhận lượt','[chỗ ghi lượng cũ]']:kind==='letter'?['Haddai','Bản gửi có sửa','Giữ phần chưa kiểm riêng']:kind==='private-record'?['Nguồn riêng','Dòng chưa dùng tên','Giữ lý do giới hạn']:kind==='copies'?['E04 → bản chép','Cùng gốc thông tin','E06 · thẻ sân phụ']:kind==='envelopes'?['Nội dung đối chiếu','Bìa nhận diện riêng','Phần chưa được trao']:['Bản phụ qua nước','[khoảng không đọc được]'];
          for(let i=0;i<(kind==='copies'||kind==='envelopes'?3:1);i++)m.pages.push(text(g,[texts[i]||texts[0],...(kind==='copies'||kind==='envelopes'?[]:texts.slice(1))],(i-1)*.54*(kind==='copies'||kind==='envelopes'?1:0),.84+i*.008,0,kind==='paper'?1.25:.7,1));
          if(kind==='paper'){
            const hinge=group(g,'pasted-edge');hinge.position.set(0,.86,-.17);const flap=text(hinge,['Ghi đủ theo lượt'],0,0,.24,.76,.48);flap.material.side=T.FrontSide;
            const reverse=new T.Mesh(new T.PlaneGeometry(.76,.48),new T.MeshBasicMaterial({color:'#dfcfae',side:T.BackSide,toneMapped:false}));reverse.position.copy(flap.position);reverse.rotation.copy(flap.rotation);hinge.add(reverse);m.flap=hinge;
            for(let i=0;i<7;i++){const fiber=box(g,'#b9ab8b',-.38+i*.12,.86,.065,.004,.004,.08,'linen');fiber.rotation.y=(i%2?.6:-.5);}
            const light=new T.PointLight('#fff1cf',1.2,3,2);light.position.set(-1.6,1.15,.6);g.add(light);m.raking=light;
          }
          if(kind==='wetpaper'){for(let i=0;i<4;i++){const stain=mesh(g,new T.CircleGeometry(.12+i*.025,9),'#697574',[-.25+i*.16,.87,.18],'linen',{transparent:true,opacity:.34});stain.rotation.x=-Math.PI/2;}m.unread=text(g,['[không đọc được]'],0,.88,.15,.55,.28);}
          if(kind==='envelopes')for(const x of [-.58,0,.58])box(g,'#4e5b4c',x,.87,.13,.4,.018,.13,'linen');
        }
      }else if(kind==='meal'){
        table(g);m.bowls=[];for(let i=0;i<6;i++){const b=bowl(g,-.62+(i%3)*.62,.83,-.3+Math.floor(i/3)*.58);m.bowls.push(b);}
        m.stock=group(g,'reserve-shelf');m.stock.position.set(1.7,0,0);box(m.stock,'#775638',0,.65,0,.9,.11,1.3);m.portions=[];for(let i=0;i<10;i++)m.portions.push(sack(m.stock,(i%2)*.35-.17,.83+Math.floor(i/4)*.18,Math.floor((i%4)/2)*.4-.22));
        const pot=mesh(g,new T.SphereGeometry(.34,12,9),'#6b4d37',[-1.5,.45,0],'terracotta');pot.scale.y=.85;
        const wisps=[];for(let i=0;i<4;i++){const w=mesh(g,new T.PlaneGeometry(.16,.28),'#f1ead8',[-1.5,.9+i*.15,0],'linen',{transparent:true,opacity:.1,side:T.DoubleSide,depthWrite:false});wisps.push(w);}ambient.push(t=>{for(let i=0;i<wisps.length;i++)wisps[i].position.y=.9+((t*.12+i*.17)%.7);});
      }else if(kind==='net'){
        m.net=group(g,'net-edges');for(let i=0;i<9;i++)cord(m.net,[[-.9+i*.22,.2,-.75],[-.9+i*.22,.3,0],[-.9+i*.22,.2,.75]],.012,'#8d8c68');for(let i=0;i<8;i++)cord(m.net,[[-.9,.2,-.75+i*.21],[0,.3,-.75+i*.21],[.9,.2,-.75+i*.21]],.012,'#8d8c68');
        for(let i=0;i<6;i++){cyl(g,'#6d786a',-.8+i*.32,.15,.9,.065,.12,'stone');const cork=cyl(g,'#b5a17e',-.8+i*.32,.16,-.9,.07,.12);cork.rotation.z=Math.PI/2;}
        m.coil=group(g,'side-line');for(let i=0;i<4;i++){const ring=mesh(m.coil,new T.TorusGeometry(.18+i*.05,.018,5,16),'#887458',[0,.08+i*.01,0],'linen');ring.rotation.x=Math.PI/2;}m.coil.position.set(.1,0,.1);
      }else if(['rope','padding','strings'].includes(kind)){
        box(g,'#8d7758',0,.13,0,1.8,.24,1.1,'stone');m.line=cord(g,[[-.75,.23,0],[-.4,.8,.1],[.3,1.1,0],[.8,.25,-.2]],.04);m.pad=box(g,'#b9b099',.15,.76,0,.58,.1,.46,'linen');m.pad.rotation.z=.22;
        if(kind==='padding'){const rim=mesh(g,new T.TorusGeometry(.66,.14,8,24),'#8c7c61',[0,.2,1.1],'stone');rim.rotation.x=Math.PI/2;const hole=mesh(g,new T.CircleGeometry(.56,24),'#232921',[0,.17,1.1],'stone');hole.rotation.x=-Math.PI/2;}
        if(kind==='strings'){m.line.visible=false;for(let i=0;i<3;i++)cord(g,[[-.65+i*.6,1.7,0],[-.55+i*.55,.8,.13],[-.3+i*.5,.12,.3]],.022,['#8c725b','#9d9c79','#797c74'][i]);}
      }else if(kind==='tracks'){
        m.stones=[];for(let i=0;i<10;i++){const rock=mesh(g,new T.DodecahedronGeometry(.09+i%3*.025),'#7d7865',[-.8+(i%4)*.46,.07,Math.floor(i/4)*.53-.6],'stone');rock.scale.y=.45;m.stones.push(rock);}for(let side of [-.35,.35])cord(g,[[side,.025,-1],[side,.025,0],[side+.2,.025,1.3]],.035,'#625f49');
      }else if(kind==='lantern'){m.lamp=lantern(g);}
      else if(kind==='roof'){
        for(const x of [-.85,.85])box(g,'#7d5d3d',x,.8,0,.13,1.6,.13);box(g,'#987e55',0,1.67,0,2,.14,.14);
        m.cover=group(g,'roof-joint');m.cover.position.set(0,1.72,0);for(let i=0;i<4;i++)box(m.cover,'#8b7751',-.73+i*.48,0,.3,.41,.1,1.25).rotation.x=.16;
        m.repair=box(m.cover,'#a18a61',.02,.06,.3,.23,.08,1.3);m.repair.visible=false;m.support=box(g,'#b4a17b',.1,.8,.2,.08,1.65,.09);m.support.rotation.z=.13;m.support.visible=false;
      }else if(kind==='joinery'){
        table(g);box(g,'#9c8057',-.2,.9,0,1.4,.17,.26);box(g,'#886a47',.3,1,0,.28,.17,1.05);m.peg=cyl(g,'#b7a178',.3,1.18,0,.065,.42);m.peg.rotation.z=.23;m.support=box(g,'#bba77e',0,.45,0,1.3,.15,.4);m.support.visible=false;
      }else if(kind==='balance'){
        m.beds=[];for(const x of [-.9,.9]){const bed=group(g,'balance-bed');bed.position.set(x,.35,0);box(bed,'#8d8065',0,0,0,1.25,.16,1.2,'stone');m.beds.push(bed);}m.blocks=[];for(let i=0;i<4;i++)m.blocks.push(box(g,'#a6a084',-.8+i*.5,.55,0,.38,.38,.38,'stone'));
      }else if(['seats','memory','door','plank','peg','staff','tools','pages'].includes(kind)){
        if(kind==='seats'||kind==='memory'){for(const x of [-.85,.85]){box(g,'#83633f',x,.48,0,.65,.12,.65);for(const dx of [-.22,.22])for(const dz of [-.22,.22])box(g,'#674b32',x+dx,.24,dz,.08,.48,.08);}if(kind==='memory'){box(g,'#826443',-.85,.85,-.28,.62,.7,.08);m.items=[jar(g,.4,.55,0),cyl(g,'#a59d79',.9,.65,.1,.12,.3,'linen')];}}
        else if(kind==='door'){for(const x of [-.8,.8])box(g,'#8e7a59',x,.9,0,.2,1.8,.3,'stone');box(g,'#8d7b5c',0,1.85,0,1.8,.2,.35,'stone');box(g,'#705338',.23,.87,.14,1.25,1.65,.1).rotation.y=.28;}
        else if(kind==='plank'){for(let i=0;i<3;i++)box(g,'#8e7350',-.7+i*.55,.13,0,.5,.14,1.9).rotation.x=i===2?.18:0;}
        else if(kind==='staff'){const staff=cyl(g,'#705238',0,.08,0,.04,1.8);staff.rotation.z=Math.PI/2;}
        else if(kind==='pages'){m.pages=[];for(let i=0;i<3;i++)m.pages.push(text(g,['Trang chưa mang tên'],i*.58-.58,.4+i*.14,0,.5,.7));}
        else{table(g);tool(g);if(kind==='peg'){box(g,'#dbcfac',0,.86,0,1.15,.025,.75,'linen');const peg=cyl(g,'#745333',0,.94,0,.06,.8);peg.rotation.z=Math.PI/2;}}
      }
      g.userData.detailKind=kind;return m;
    }
    function move(object,to,snap=false){if(!object)return;if(snap){object.position.set(...to);return;}object.userData.targetPosition=to;if(!motions.includes(object))motions.push(object);}
    function updateDetail(m,detail,s){
      const stash=s.layer?.workshop||s.workshop,entry=detail.encounter&&(stash?.records?.[detail.encounter]||stash?.drafts?.[detail.encounter]),base=X.all().find(x=>x.id===detail.encounter),d=base?X.materialize(s,base):null,p=entry?.payload||{},steps=d?C.validPrefix(d,p):[],done=!!stash?.records?.[detail.encounter];
      m.g.userData.read=detail.seen;m.g.userData.committed=done;
      if(m.kind==='cart'){
        const lowered=steps.includes('unload')||done,supported=steps.includes('brace')||steps.includes('support')||done;
        m.body.rotation.z=supported?0:.15;m.brace.visible=supported;m.rope.visible=steps.some(x=>['lash','hold','signal'].includes(x))||done;m.wedge.visible=steps.includes('block')||done;
        for(let i=0;i<m.vessels.length;i++)move(m.vessels[i],lowered?[-1.35+i*.6,.15,1.1]:[-.42+i*.82,.91,0],s.settings.motion==='calm');
        move(m.peg,steps.includes('remove')||done&&detail.owner==='Q01'?[1.5,.45,-.1]:[0,0,0],s.settings.motion==='calm');
      }
      if(m.kind==='paper'){const view=C.stores(s).views?.[detail.id];m.flap.rotation.x=view?.lift?-1.15:0;m.raking.intensity=view?.light===1?3.2:1.2;m.raking.position.set(view?.light===2?1.5:-1.6,view?.light===1?.95:1.5,.6);}
      if(m.kind==='wetpaper'&&m.unread)m.unread.visible=s.flags.paperIntegrity==='partial'||!s.flags.paperIntegrity;
      if(m.kind==='ledger'){for(let i=0;i<m.pages.length;i++)for(let j=0;j<m.pages[i].length;j++)m.pages[i][j].visible=i<2?j<[18,2][i]:false;}
      if(m.kind==='meal'){
        const stock=s.flags.finalMealStock??s.resources.food??0;for(let i=0;i<m.bowls.length;i++){m.bowls[i].b.visible=i<2;m.bowls[i].food.visible=i<2;}
        for(let i=0;i<m.portions.length;i++)m.portions[i].visible=i<Math.min(10,stock);m.stock.visible=detail.owner!=='B06';m.g.userData.reservePortions=stock;
      }
      if(m.kind==='net'){const clear=steps.includes('check')||steps.includes('coil')||done;move(m.coil,clear?[1.5,.05,.65]:[.1,0,.1],s.settings.motion==='calm');m.net.scale.z=steps.includes('spread')||done?1:.6;}
      if(m.kind==='padding')m.pad.position.y=(steps.includes('pad')||steps.includes('lift')||done)? .38:.76;
      if(m.kind==='roof'){m.support.visible=steps.includes('support')||done;m.repair.visible=steps.includes('repair')||done;}
      if(m.kind==='joinery'){m.support.visible=steps.includes('brace')||done;m.peg.position.y=steps.includes('fit')||done?1.06:1.18;m.peg.rotation.z=steps.includes('fit')||done?0:.23;}
      if(m.kind==='balance'&&base){const a=p.assignments||{};for(let i=0;i<m.blocks.length;i++){const st=a[['a','b','c','d'][i]],side=st==='left'?-.9:st==='right'?.9:0;move(m.blocks[i],[side+(i%2?-.24:.24),.62+Math.floor(i/2)*.02,st?i<2?-.24:.24:1],s.settings.motion==='calm');}const l=Object.values(a).filter(x=>x==='left').length,r=Object.values(a).filter(x=>x==='right').length;m.beds[0].rotation.z=(l-r)*.07;m.beds[1].rotation.z=(l-r)*.07;}
    }
    function fieldModel(f){
      const g=group(stage,'field-work-'+f.def.id),obj={g,key:f.def.id,items:new Map(),nodes:new Map(),path:null};
      for(const spot of f.spots){const n=group(g,'field-point-'+spot.key);ground(n,spot.at);const base=mesh(n,new T.CylinderGeometry(.46,.51,.1,12),'#8a785c',[0,.08,0],'stone');const plaque=text(n,[spot.label],0,.17,0,.82,.55);obj.nodes.set(spot.key,{g:n,base,plaque});}
      if(f.def.items)for(const [i,item]of f.def.items.entries()){
        const n=group(g,'field-item-'+item.id),lamp=(item.tags||[]).includes('light'),food=/^(meal|reserve|bowl)/.test(item.id);
        const ownsLamp=C.scenes[f.def.owner]?.some(r=>r.encounter===f.def.id&&r.kind==='lantern');
        if(lamp){if(!ownsLamp)lantern(n);}
        else if(f.def.owner==='V01')text(n,[item.label],0,.3,0,.48,.65);
        else if(f.def.owner==='V03')cord(n,[[-.2,.05,0],[.12,.35,.15],[.25,.7,0]],.023,['#927557','#8b9372','#64797b'][i]);
        else if(f.def.owner==='V04'){if(item.id==='cup')bowl(n,0,.1,0,false);else if(item.id==='thread')cyl(n,'#a49c74',0,.2,0,.13,.32,'linen');else lantern(n).group.scale.setScalar(.4);}
        else if(f.def.owner==='V02')box(n,'#8d8065',0,.06,0,.26,.08,.26,'stone');
        else if(food){bowl(n,0,.1,0);sack(n,0,.22,.1);}else if((item.tags||[]).includes('craft'))tool(n);else if(f.def.type==='dispatch')text(n,[item.id==='name'||item.id==='home'||item.id==='detail'?'[phần nhận diện]':item.label],0,.3,0,.62,.45);else if(!root.WitnessContent.people[item.id]&&!/^(helper\d*|receiver|guide|friend|family|group|restless|tired|courier|player)$/.test(item.id))sack(n,0,.2,0);else box(n,'#927d5b',0,.05,0,.36,.08,.5);
        obj.items.set(item.id,{g:n,index:i});
      }
      return obj;
    }
    function disposeGroup(g){g.traverse(o=>{if(o.isMesh){o.geometry?.dispose();if(o.userData.craftTexture){o.userData.craftTexture.dispose();o.material.dispose();}}});g.removeFromParent();}
    function update(s){
      current=s;const ds=C.details(s),fs=C.workScenes(s),key=JSON.stringify([ds.map(d=>[d.id,d.seen,d.done]),fs.map(f=>[f.def.id,f.payload,f.committed]),C.stores(s).views,s.resources.food,s.flags.paperIntegrity,s.settings.motion]);if(key===signature)return;signature=key;
      const ids=new Set(ds.map(d=>d.id));for(const [id,m]of entries)if(!ids.has(id)){disposeGroup(m.g);entries.delete(id);}
      for(const detail of ds){if(!entries.has(detail.id)){const m=model(detail.kind,detail.title);m.g.name=detail.id;ground(m.g,detail.at);entries.set(detail.id,m);}const m=entries.get(detail.id);move(m.g,[detail.at[0],height(...detail.at)+.035,detail.at[1]],s.settings.motion==='calm');updateDetail(m,detail,s);}
      const activeIds=new Set(fs.map(f=>f.def.id));for(const [id,m]of work)if(!activeIds.has(id)){disposeGroup(m.g);work.delete(id);}
      for(const f of fs){let m=work.get(f.def.id);const shape=(f.def.items||[]).map(x=>x.id).join('|');if(m&&m.shape!==shape){disposeGroup(m.g);work.delete(f.def.id);m=null;}if(!m){m=fieldModel(f);m.shape=shape;work.set(f.def.id,m);}
        for(const [id,visual]of m.items){const to=f.spots.find(x=>x.op.value===f.payload.assignments?.[id]),i=visual.index,at=to?[to.at[0]+(i%2?-.6:.6),to.at[1]+.5+Math.floor(i/2)*.1]:[f.origin[0]-2+(i%4)*.85,f.origin[1]+2+Math.floor(i/4)*.7];move(visual.g,[at[0],height(...at)+.1,at[1]],s.settings.motion==='calm');}
        if(f.def.type==='route'){
          if(m.path)disposeGroup(m.path);m.path=group(m.g,'chosen-footsteps');const route=(f.payload.path||[]).map(id=>f.spots.find(x=>x.key===id)?.at).filter(Boolean);
          for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/.32);for(let j=0;j<=n;j++){const t=j/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,foot=box(m.path,'#655f49',x+(j%2?.09:-.09),height(x,z)+.045,z,.09,.012,.2,'stone');foot.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);}}
        }
        m.g.userData.committed=f.committed;m.g.userData.payload=clone(f.payload);
      }
      stage.userData.snapshot={owner:C.owner(s),details:ds.map(d=>({id:d.id,kind:d.kind,seen:d.seen,done:d.done})),works:fs.map(f=>({id:f.def.id,committed:f.committed,payload:clone(f.payload)}))};
    }
    function clone(v){return JSON.parse(JSON.stringify(v));}
    function tick(t,dt=.016){
      for(const o of motions){const to=o.userData.targetPosition;if(!to)continue;o.position.lerp(new T.Vector3(...to),current?.settings?.motion==='calm'?1:Math.min(1,dt*6));}
      for(const fn of ambient)fn(t);
    }
    return {update,tick,root:stage};
  }
  root.WitnessCraftRenderer={create};if(typeof module!=='undefined')module.exports=root.WitnessCraftRenderer;
})(globalThis);
