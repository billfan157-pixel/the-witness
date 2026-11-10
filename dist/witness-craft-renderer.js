(function(root){
  'use strict';
  // Cú giật của vật bị từ chối: app ghi, instance đang render tiêu thụ rồi tự tắt dần.
  const jolts=new Map(),loadTests=new Map();
  function create({T,scene,height}){
    const C=root.WitnessCraft,X=root.WitnessDepth,stage=new T.Group(),materials=new Map(),entries=new Map(),work=new Map(),motions=[],ambient=[];
    stage.name='witness-crafted-scenes';scene.add(stage);let current=null,signature='';
    // Separate normal/roughness/metalness maps per surface family, generated
    // once and shared by every crafted prop of that kind.
    const propMapCache=new Map();
    function propMaps(kind){
      if(propMapCache.has(kind))return propMapCache.get(kind);
      const size=256,height=new Float32Array(size*size),rough=new Float32Array(size*size),metal=new Float32Array(size*size);
      let seed=kind.split('').reduce((n,c)=>n*31+c.charCodeAt(0)>>>0,7);
      const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
      const lattice=(freq,sd)=>{const g=new Float32Array(freq*freq);let s=sd;for(let i=0;i<g.length;i++){s=Math.imul(s,1664525)+1013904223>>>0;g[i]=s/4294967296;}
        return(u,v)=>{const gx=u*freq,gy=v*freq,x0=Math.floor(gx)%freq,y0=Math.floor(gy)%freq,fx=gx-Math.floor(gx),fy=gy-Math.floor(gy),sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
          const at=(x,y)=>g[((y+freq)%freq)*freq+((x+freq)%freq)];
          return at(x0,y0)*(1-sx)*(1-sy)+at(x0+1,y0)*sx*(1-sy)+at(x0,y0+1)*(1-sx)*sy+at(x0+1,y0+1)*sx*sy;};};
      const n1=lattice(8,seed),n2=lattice(32,seed^99),n3=lattice(64,seed^7);
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=x/size,v=y/size,i=y*size+x,fine=n3(u,v);
        let h=.5,r=.85,m=0;
        if(kind==='terracotta'){
          const rings=Math.sin(v*Math.PI*46+n1(u,v)*3)*.5+.5;
          h=rings*.32+fine*.24+n2(u,v)*.2;
          r=.78+rings*.12+(fine-.5)*.14;
        }else if(kind==='bronze'){
          const hammer=n2(u,v)*.6+n3(u,v)*.4;
          const patina=n1(u*1.4,v*1.4)>.62;
          h=hammer*.3+(patina?.12:0);
          r=patina?.86:.38+hammer*.2;
          m=patina?.12:1;
        }else if(kind==='linen'){
          const weave=(Math.sin(u*Math.PI*96)*.5+.5)*(Math.sin(v*Math.PI*96)*.5+.5);
          h=weave*.4+fine*.3;
          r=.86+weave*.1;
        }else if(kind==='stone'){
          h=n1(u,v)*.4+n2(u,v)*.35+fine*.25;
          r=.82+(n2(u,v)-.5)*.2;
        }else{
          const grain=Math.sin(v*Math.PI*34+n1(u*2,v)*7+u*3)*.5+.5;
          h=grain*.34+fine*.22;
          r=.8+(grain-.5)*.16;
        }
        height[i]=h;rough[i]=Math.max(.05,Math.min(1,r));metal[i]=m;
      }
      const canvasOf=fill=>{const cv=document.createElement('canvas');cv.width=cv.height=size;const ctx=cv.getContext('2d');const img=ctx.createImageData(size,size);fill(img.data);ctx.putImageData(img,0,0);
        const tex=new T.CanvasTexture(cv);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.NoColorSpace;tex.anisotropy=4;return tex;};
      const strength=kind==='linen'?1.6:kind==='bronze'?1.2:2.2;
      const at=(x,y)=>height[((y+size)%size)*size+((x+size)%size)];
      const maps={
        normalMap:canvasOf(d=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++){
          const dx=(at(x-1,y)-at(x+1,y))*strength,dy=(at(x,y-1)-at(x,y+1))*strength,len=Math.sqrt(dx*dx+dy*dy+1),i=(y*size+x)*4;
          d[i]=(dx/len*.5+.5)*255;d[i+1]=(dy/len*.5+.5)*255;d[i+2]=(1/len*.5+.5)*255;d[i+3]=255;}}),
        roughnessMap:canvasOf(d=>{for(let i=0;i<size*size;i++){d[i*4]=d[i*4+1]=d[i*4+2]=rough[i]*255;d[i*4+3]=255;}}),
        metalnessMap:kind==='bronze'?canvasOf(d=>{for(let i=0;i<size*size;i++){d[i*4]=d[i*4+1]=d[i*4+2]=metal[i]*255;d[i*4+3]=255;}}):null
      };
      propMapCache.set(kind,maps);return maps;
    }
    const material=(color,kind='wood',extra={})=>{
      const key=color+kind+JSON.stringify({...extra,map:extra.map?.uuid});if(!materials.has(key)){
        const m=new T.MeshStandardMaterial({color,roughness:.88,...extra});
        if(!extra.map){
          root.AdventureVisuals?.surface?.(m,kind);
          if(['terracotta','bronze','linen','stone','wood'].includes(kind)&&typeof document!=='undefined'){
            const maps=propMaps(kind);
            m.normalMap=maps.normalMap;m.normalScale=new T.Vector2(.55,.55);
            m.roughnessMap=maps.roughnessMap;m.roughness=1;
            if(maps.metalnessMap){m.metalnessMap=maps.metalnessMap;m.metalness=1;}
          }
        }
        materials.set(key,m);
      }return materials.get(key);
    };
    const mesh=(parent,geo,color,at=[0,0,0],kind='wood',extra={})=>{const m=new T.Mesh(geo,material(color,kind,extra));m.position.set(...at);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
    const box=(p,c,x,y,z,w,h,d,kind='wood')=>mesh(p,new T.BoxGeometry(w,h,d),c,[x,y,z],kind);
    const cyl=(p,c,x,y,z,r,h,kind='wood')=>mesh(p,new T.CylinderGeometry(r,r*.94,h,Math.max(32,Math.min(64,Math.round(r*600)))),c,[x,y,z],kind);
    const group=(parent,name)=>{const g=new T.Group();g.name=name;parent.add(g);return g;};
    const ground=(g,at)=>g.position.set(at[0],height(...at)+.035,at[1]);
    function cord(p,points,r=.025,color='#8c7655'){
      return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),Math.max(16,points.length*6),r,8,false),color,[0,0,0],'linen');
    }
    // Shared papyrus/parchment grain normal map (fibres + laid lines).
    let grainNormal=null;
    function papyrusGrain(){
      if(grainNormal)return grainNormal;
      const w=512,h=256,height=new Float32Array(w*h);
      let seed=811;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        let v=.5+.06*Math.sin(y*.9)+.04*Math.sin(x*.22+y*.05);
        v+=(rand()-.5)*.16;
        height[y*w+x]=v;
      }
      for(let f=0;f<420;f++){
        const x0=rand()*w,y0=rand()*h,len=8+rand()*40,ang=(rand()-.5)*.9+(rand()<.5?0:Math.PI/2);
        const dx=Math.cos(ang),dy=Math.sin(ang),amp=(rand()-.5)*.3;
        for(let s=0;s<len;s++){
          const x=Math.round(x0+dx*s)%w,y=Math.round(y0+dy*s)%h;
          if(x<0||y<0||x>=w||y>=h)continue;
          height[((y+h)%h)*w+((x+w)%w)]+=amp*(1-s/len);
        }
      }
      const cv=document.createElement('canvas');cv.width=w;cv.height=h;const ctx=cv.getContext('2d');
      const img=ctx.createImageData(w,h),at=(x,y)=>height[((y+h)%h)*w+((x+w)%w)];
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const dx=(at(x-1,y)-at(x+1,y))*2.6,dy=(at(x,y-1)-at(x,y+1))*2.6,len=Math.sqrt(dx*dx+dy*dy+1),i=(y*w+x)*4;
        img.data[i]=(dx/len*.5+.5)*255;img.data[i+1]=(dy/len*.5+.5)*255;img.data[i+2]=(1/len*.5+.5)*255;img.data[i+3]=255;
      }
      ctx.putImageData(img,0,0);
      grainNormal=new T.CanvasTexture(cv);grainNormal.wrapS=grainNormal.wrapT=T.RepeatWrapping;grainNormal.colorSpace=T.NoColorSpace;
      return grainNormal;
    }
    function text(p,lines,x=0,y=1.02,z=0,w=1.8,h=1.2,flat=true){
      const W=2048,H=1024,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
      let seed=lines.join('').split('').reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,13);
      const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
      // Torn parchment silhouette: jittered edge, alpha-cutout in the material.
      const inset=30,amp=16,steps=48;
      ctx.beginPath();
      const edge=(x0,y0,x1,y1)=>{for(let i=0;i<=steps;i++){const t=i/steps,j=(rand()-.5)*2*amp*(i===0||i===steps?.3:1);
        const nx=-(y1-y0),ny=x1-x0,nl=Math.hypot(nx,ny)||1;
        ctx.lineTo(x0+(x1-x0)*t+nx/nl*j,y0+(y1-y0)*t+ny/nl*j);}};
      ctx.moveTo(inset,inset);
      edge(inset,inset,W-inset,inset);edge(W-inset,inset,W-inset,H-inset);
      edge(W-inset,H-inset,inset,H-inset);edge(inset,H-inset,inset,inset);
      ctx.closePath();
      ctx.fillStyle='#e0d0ad';ctx.fill();
      ctx.save();ctx.clip();
      // Age blotches and fibre grain.
      for(let i=0;i<26;i++){
        const bx=rand()*W,by=rand()*H,br=40+rand()*160;
        const g=ctx.createRadialGradient(bx,by,0,bx,by,br);
        g.addColorStop(0,`rgba(146,116,72,${.04+rand()*.07})`);g.addColorStop(1,'rgba(146,116,72,0)');
        ctx.fillStyle=g;ctx.fillRect(bx-br,by-br,br*2,br*2);
      }
      ctx.globalAlpha=.1;
      for(let i=0;i<900;i++){
        ctx.strokeStyle=rand()<.5?'#c9b58c':'#efe2c2';ctx.lineWidth=1+rand()*1.5;
        const fx=rand()*W,fy=rand()*H,fa=(rand()-.5)*.7+(rand()<.5?0:Math.PI/2),fl=14+rand()*70;
        ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+Math.cos(fa)*fl,fy+Math.sin(fa)*fl);ctx.stroke();
      }
      ctx.globalAlpha=1;
      const edgeShade=ctx.createLinearGradient(0,0,0,H);
      edgeShade.addColorStop(0,'rgba(120,92,52,.20)');edgeShade.addColorStop(.12,'rgba(120,92,52,0)');
      edgeShade.addColorStop(.88,'rgba(120,92,52,0)');edgeShade.addColorStop(1,'rgba(120,92,52,.24)');
      ctx.fillStyle=edgeShade;ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='#ae9876';ctx.lineWidth=16;ctx.strokeRect(40,40,W-80,H-80);
      ctx.fillStyle='#31291f';ctx.font='170px Georgia, serif';ctx.textBaseline='top';
      const rows=[];for(const line of lines){let row='';for(const word of String(line).split(' ')){const next=row?(row+' '+word):word;if(ctx.measureText(next).width>1780&&row){rows.push(row);row=word;}else row=next;}rows.push(row);}
      let yy=Math.max(85,(H-Math.min(rows.length,6)*192)/2);for(const row of rows.slice(0,6)){ctx.fillText(row,117,yy);yy+=192;}
      ctx.restore();
      const texture=new T.CanvasTexture(canvas);if(T.SRGBColorSpace)texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
      const mat=new T.MeshStandardMaterial({map:texture,normalMap:papyrusGrain(),normalScale:new T.Vector2(.4,.4),
        alphaTest:.4,side:T.DoubleSide,roughness:.92,metalness:0,emissive:'#ffffff',emissiveMap:texture,emissiveIntensity:.16});
      const plane=new T.Mesh(new T.PlaneGeometry(w,h),mat);plane.position.set(x,y,z);p.add(plane);if(flat)plane.rotation.x=-Math.PI/2;plane.userData.craftTexture=texture;return plane;
    }
    function table(p){box(p,'#745439',0,.74,0,2,.16,1.35);for(const x of [-.78,.78])for(const z of [-.46,.46])box(p,'#62492f',x,.35,z,.12,.7,.12);}
    function bowl(p,x=0,y=.86,z=0,full=true){
      const b=mesh(p,new T.LatheGeometry([[.03,0],[.12,.02],[.22,.11],[.27,.22],[.25,.25]].map(a=>new T.Vector2(...a)),40),'#a7633c',[x,y,z],'terracotta');
      const food=mesh(p,new T.CircleGeometry(.225,32),'#a58d52',[x,y+.205,z],'stone');food.rotation.x=-Math.PI/2;food.visible=full;return {b,food};
    }
    function jar(p,x=0,y=.9,z=0){return mesh(p,new T.LatheGeometry([[.04,0],[.18,.03],[.26,.28],[.22,.49],[.11,.57],[.13,.64]].map(a=>new T.Vector2(...a)),48),'#ac704b',[x,y,z],'terracotta');}
    function lantern(p,x=0,z=0){
      const g=group(p,'lamp');g.position.set(x,0,z);cyl(g,'#685036',0,.64,0,.055,1.28);bowl(g,0,1.25,0,false);
      const flame=mesh(g,new T.SphereGeometry(.09,8,6),'#ffe0a0',[0,1.57,0],'linen',{emissive:'#d8944d',emissiveIntensity:1.25});flame.scale.y=1.5;
      const light=new T.PointLight('#ffd09a',2.8,5,2);light.position.set(0,1.6,0);g.add(light);ambient.push(t=>{if(!current?.settings?.motion||current.settings.motion==='calm')return;flame.scale.y=1.5+Math.sin(t*5.2)*.14;});return {group:g,light};
    }
    function sack(p,x,y,z,wet=false){const m=mesh(p,new T.SphereGeometry(.22,20,14),wet?'#6d6e56':'#a18b64',[x,y,z],'linen');m.scale.set(1,.85,.7);return m;}
    function tool(p){box(p,'#6d5034',0,.3,0,1.3,.18,.8);for(let i=0;i<3;i++){const h=cyl(p,'#82623f',-.35+i*.32,.47,0,.035,.62);h.rotation.z=Math.PI/2;box(p,'#4c5149',-.52+i*.32,.49,.13,.18,.08,.3,'bronze');}}
    function model(kind,title){
      const g=group(stage,'crafted-'+kind),m={g,kind};
      if(kind==='cart'){
        const body=group(g,'cart-load');m.body=body;box(body,'#82613f',0,.76,0,2.15,.24,1.3);box(body,'#5c452d',0,.5,0,.13,.15,1.8);
        box(g,'#423a2b',-.26,.02,-.82,.72,.015,.18,'stone');
        box(body,'#6a4c2e',-.01,.88,0,1.8,.04,1.05);
        for(const x of [-.75,.75])box(body,'#584027',x,.96,0,.08,.16,.98);
        for(const z of [-.76,.76]){const wheel=mesh(body,new T.TorusGeometry(.48,.065,10,40),'#60452c',[0,.47,z]);for(let i=0;i<4;i++){const spoke=box(body,'#7a5c3c',0,.47,z,.055,.89,.04);spoke.rotation.z=i*Math.PI/4;}cyl(body,'#51422e',0,.47,z,.10,.13);}
        for(const x of [-.85,.85])for(const z of [-.55,.55])box(body,'#684b31',x,1.04,z,.075,.46,.075);
        m.vessels=[jar(body,-.42,1.04,0),jar(body,.4,1.04,0)];
        m.peg=group(g,'old-split-peg');const pin=cyl(m.peg,'#705237',0,.45,.87,.055,.44);pin.rotation.z=.22;
        box(m.peg,'#2b2217',.015,.52,.9,.014,.21,.01);
        box(m.peg,'#90714b',-.02,.48,.86,.01,.14,.01);
        const pegRest=group(g,'peg-rest-table');box(pegRest,'#684f35',1.5,.18,-.1,.48,.36,.42);box(pegRest,'#ded3b6',1.5,.37,-.1,.56,.025,.5,'linen');
        m.brace=box(g,'#b7a078',0,.32,-.05,1.6,.14,.32);m.brace.rotation.z=-.24;m.brace.visible=false;
        m.rope=cord(g,[[-1,.1,-1.3],[-.8,.7,-.6],[.2,1.14,.55],[1.35,.1,1.35]],.034);m.rope.visible=false;
        const wedge=box(g,'#9c8058',-.28,.12,-.83,.4,.18,.3);wedge.rotation.z=.16;m.wedge=wedge;
        const stake=cyl(g,'#6b5335',1.35,.42,1.35,.075,.84);stake.rotation.z=.05;box(g,'#5d4830',1.35,.86,1.35,.11,.06,.11);m.stake=stake;
        m.dustPuffs=[];
        for(const pos of [[-.28,.14,-.83],[0,.45,.87],[-.1,.25,-.6]]){
          const puff=mesh(g,new T.SphereGeometry(.14,10,8),'#d6cbaf',pos,'linen',{transparent:true,opacity:0,depthWrite:false});
          puff.scale.set(0,0,0);m.dustPuffs.push({mesh:puff,basePos:pos});
        }
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
        const pot=mesh(g,new T.SphereGeometry(.34,24,18),'#6b4d37',[-1.5,.45,0],'terracotta');pot.scale.y=.85;
        const wisps=[];for(let i=0;i<4;i++){const w=mesh(g,new T.PlaneGeometry(.16,.28),'#f1ead8',[-1.5,.9+i*.15,0],'linen',{transparent:true,opacity:.1,side:T.DoubleSide,depthWrite:false});wisps.push(w);}ambient.push(t=>{for(let i=0;i<wisps.length;i++)wisps[i].position.y=.9+((t*.12+i*.17)%.7);});
      }else if(kind==='net'){
        m.net=group(g,'net-edges');for(let i=0;i<9;i++)cord(m.net,[[-.9+i*.22,.2,-.75],[-.9+i*.22,.3,0],[-.9+i*.22,.2,.75]],.012,'#8d8c68');for(let i=0;i<8;i++)cord(m.net,[[-.9,.2,-.75+i*.21],[0,.3,-.75+i*.21],[.9,.2,-.75+i*.21]],.012,'#8d8c68');
        for(let i=0;i<6;i++){cyl(g,'#6d786a',-.8+i*.32,.15,.9,.065,.12,'stone');const cork=cyl(g,'#b5a17e',-.8+i*.32,.16,-.9,.07,.12);cork.rotation.z=Math.PI/2;}
        m.coil=group(g,'side-line');for(let i=0;i<4;i++){const ring=mesh(m.coil,new T.TorusGeometry(.18+i*.05,.018,8,32),'#887458',[0,.08+i*.01,0],'linen');ring.rotation.x=Math.PI/2;}m.coil.position.set(.1,0,.1);
      }else if(['rope','padding','strings'].includes(kind)){
        box(g,'#8d7758',0,.13,0,1.8,.24,1.1,'stone');m.line=cord(g,[[-.75,.23,0],[-.4,.8,.1],[.3,1.1,0],[.8,.25,-.2]],.04);m.pad=box(g,'#b9b099',.15,.76,0,.58,.1,.46,'linen');m.pad.rotation.z=.22;
        if(kind==='padding'){const rim=mesh(g,new T.TorusGeometry(.66,.14,12,40),'#8c7c61',[0,.2,1.1],'stone');rim.rotation.x=Math.PI/2;const hole=mesh(g,new T.CircleGeometry(.56,32),'#232921',[0,.17,1.1],'stone');hole.rotation.x=-Math.PI/2;}
        if(kind==='strings'){m.line.visible=false;for(let i=0;i<3;i++)cord(g,[[-.65+i*.6,1.7,0],[-.55+i*.55,.8,.13],[-.3+i*.5,.12,.3]],.022,['#8c725b','#9d9c79','#797c74'][i]);}
      }else if(kind==='tracks'){
        m.stones=[];
        box(g,'#3d3326',0,.012,.1,1.7,.02,2.8,'stone');
        for(const side of [-.38,.38]){
          const strip=mesh(g,new T.PlaneGeometry(.14,2.7),'#2e2419',[side,.023,.1],'stone');strip.rotation.x=-Math.PI/2;
          cord(g,[[side,.03,-1.25],[side,.03,0],[side+.12,.03,1.35]],.036,'#433729');
          box(g,'#4f4231',side+(side>0?.09:-.09),.032,.1,.05,.025,2.7,'stone');
          for(let j=0;j<8;j++){
            const rib=box(g,'#221a11',side,.027,-1.05+j*.33,.12,.006,.045,'stone');
            rib.rotation.y=.18;
          }
        }
        const ruler=cyl(g,'#7a5f40',0,.068,.15,.02,1.2,'wood');ruler.rotation.z=Math.PI/2;
        for(let i=0;i<12;i++){
          const rock=mesh(g,new T.DodecahedronGeometry(.08+(i%3)*.03),'#706b5a',[-.9+(i%4)*.52,.055,Math.floor(i/4)*.58-.65],'stone');
          rock.scale.y=.42;m.stones.push(rock);
        }
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
        // Độ nghiêng do tick() sở hữu để còn cộng thêm nhịp cựa và cú giật khi bị từ chối.
        m.loaded=!supported;m.brace.visible=supported;m.rope.visible=steps.some(x=>['lash','hold','signal'].includes(x))||done;m.wedge.visible=steps.includes('block')||done;
        for(let i=0;i<m.vessels.length;i++)move(m.vessels[i],lowered?[-1.35+i*.6,.15,1.1]:[-.42+i*.82,1.04,0],s.settings.motion==='calm');
        move(m.peg,steps.includes('remove')||done&&detail.owner==='Q01'?[1.5,.41,-.1]:[0,0,0],s.settings.motion==='calm');
        if(m.peg){
          const isRemoved=steps.includes('remove')||(done&&detail.owner==='Q01');
          m.peg.rotation.z=isRemoved?0:(supported?0:.22);
        }
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
      for(const spot of f.spots){
        const n=group(g,'field-point-'+spot.key);
        if(spot.hosted){
          // Neo vào bộ phận thật của vật: không bệ đá, không tấm biển, chỉ một vòng sáng
          // đúng tầm cao của bộ phận đó để chính vật ấy là đích tương tác.
          n.position.set(spot.at[0],height(...spot.at)+(spot.elevation||0),spot.at[1]);
          const ring=mesh(n,new T.TorusGeometry(.13,.015,8,32),'#e6d6a6',[0,0,0],'bronze',{emissive:'#c8a24c',emissiveIntensity:.6,transparent:true,opacity:.92,depthWrite:false});
          ring.rotation.x=Math.PI/2;ring.castShadow=false;ring.receiveShadow=false;
          const pip=mesh(n,new T.SphereGeometry(.024,10,8),'#fff3d2',[0,0,0],'linen',{emissive:'#ffd894',emissiveIntensity:1.2});pip.castShadow=false;pip.receiveShadow=false;
          obj.nodes.set(spot.key,{g:n,ring});
        }else if(f.def.id==='Q03.TRACK'){
          ground(n,spot.at);
          const base=mesh(n,new T.CylinderGeometry(.42,.46,.07,32),'#786e58',[0,.035,0],'stone');
          const plaque=text(n,[spot.label],0,.24,0,.72,.48);
          obj.nodes.set(spot.key,{g:n,base,plaque});
          if(spot.key==='yard'){
            mesh(n,new T.CylinderGeometry(1.25,1.35,.025,18),'#3c3224',[0,.015,0],'stone');
            for(const side of [-.38,.38]){
              box(n,'#2b2216',side,.026,0,.11,.022,1.9,'stone');
              box(n,'#493d2d',side+(side>0?.08:-.08),.034,0,.05,.03,1.9,'stone');
            }
            box(n,'#6d5438',-.65,.04,-.25,.55,.06,.95,'wood');
            sack(n,-.65,.15,-.25);
            for(let i=0;i<4;i++)mesh(n,new T.DodecahedronGeometry(.06+i*.015),'#645e4e',[-.68+i*.38,.045,.6-(i%2)*.4],'stone').scale.y=.5;
          }else if(spot.key==='steps'){
            for(let i=0;i<3;i++)box(n,'#847c69',0,.08+i*.1,-.28+i*.28,1.05,.1,.3,'stone');
            box(n,'#6c6655',-.68,.42,0,.32,.82,.82,'stone');
            box(n,'#6c6655',.68,.42,0,.32,.82,.82,'stone');
            box(n,'#484234',-.51,.32,-.16,.09,.12,.12,'stone');
            for(let i=0;i<3;i++)mesh(n,new T.DodecahedronGeometry(.05+i*.02),'#5a5445',[-.32+i*.22,.06,-.38],'stone').scale.y=.4;
          }else if(spot.key==='well'){
            mesh(n,new T.CylinderGeometry(.62,.68,.54,16,1,true),'#7e7766',[0,.27,0],'stone');
            const water=mesh(n,new T.CircleGeometry(.57,16),'#1a2422',[0,.25,0],'stone');water.rotation.x=-Math.PI/2;
            box(n,'#664c32',-.55,.7,0,.08,1.08,.08,'wood');
            box(n,'#664c32',.55,.7,0,.08,1.08,.08,'wood');
            box(n,'#75593a',0,1.22,0,1.28,.08,.08,'wood');
            const drum=cyl(n,'#876b4a',0,.96,0,.08,.8);drum.rotation.z=Math.PI/2;
            cord(n,[[-.2,.96,0],[-.2,.42,.1],[-.15,.06,.42]],.022,'#c2ab7f');
            mesh(n,new T.SphereGeometry(.045,8,6),'#d6c49a',[-.15,.06,.42],'linen');
            jar(n,.44,.38,.28);
          }else if(spot.key==='wall'){
            box(n,'#7b7463',-.76,.58,0,.32,1.15,2.45,'stone');
            box(n,'#8c8572',-.76,1.18,0,.38,.08,2.5,'stone');
            const gravel=mesh(n,new T.PlaneGeometry(1.5,2.45),'#999481',[.08,.018,0],'stone',{depthWrite:false});gravel.rotation.x=-Math.PI/2;
            for(const side of [-.24,.48])cord(n,[[side,.026,-1.15],[side,.026,0],[side,.026,1.15]],.032,'#746f5e');
            mesh(n,new T.CylinderGeometry(.11,.15,.36,8),'#8a836f',[.68,.18,-.75],'stone');
          }else if(spot.key==='tie'){
            cyl(n,'#5c432b',0,.5,0,.13,.98,'wood');
            const groove=mesh(n,new T.TorusGeometry(.135,.018,8,24),'#312316',[0,.54,0],'wood');groove.rotation.x=Math.PI/2;
            cord(n,[[0,.54,.14],[.14,.54,0],[0,.54,-.14],[-.14,.52,.05],[.1,.26,.2],[.28,.04,.36]],.024,'#8c7759');
            const sackDep=mesh(n,new T.CircleGeometry(.32,16),'#413626',[-.44,.018,.1],'stone');sackDep.rotation.x=-Math.PI/2;
            for(let i=0;i<3;i++)box(n,'#3b3223',.26+(i%2*.1),.02,-.3+i*.25,.08,.01,.18,'stone').rotation.y=i*.3;
          }else if(spot.key==='porch'){
            box(n,'#89816f',0,.11,0,1.95,.2,1.75,'stone');
            box(n,'#644930',-.84,.92,-.68,.11,1.84,.11,'wood');
            box(n,'#543d27',-.84,1.82,0,.11,.11,1.55,'wood');
            for(let i=0;i<4;i++){
              const ring=mesh(n,new T.RingGeometry(.14,.21,16),'#5e5647',[-.36+(i%2)*.68,.212,-.32+Math.floor(i/2)*.62],'stone');
              ring.rotation.x=-Math.PI/2;
            }
            sack(n,.35,.29,-.32);sack(n,.38,.29,.3);
            const slate=box(n,'#3c3329',-.74,.39,-.6,.26,.42,.035,'wood');
            slate.rotation.y=.35;slate.rotation.z=-.12;
          }
        }else{
          ground(n,spot.at);const base=mesh(n,new T.CylinderGeometry(.46,.51,.1,40),'#8a785c',[0,.08,0],'stone');const plaque=text(n,[spot.label],0,.17,0,.82,.55);obj.nodes.set(spot.key,{g:n,base,plaque});
        }
      }
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
          for(let i=1;i<route.length;i++){
            const a=route[i-1],b=route[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
            if(f.def.id==='Q03.TRACK'){
              const angle=Math.atan2(b[0]-a[0],b[1]-a[1]),nx=Math.cos(angle)*.38,nz=-Math.sin(angle)*.38,n=Math.ceil(len/.28);
              for(let j=0;j<=n;j++){
                const t=j/n,cx=a[0]+(b[0]-a[0])*t,cz=a[1]+(b[1]-a[1])*t;
                const lx=cx-nx,lz=cz-nz,rx=cx+nx,rz=cz+nz;
                const leftRut=box(m.path,'#3e3424',lx,height(lx,lz)+.038,lz,.1,.014,.28,'stone');leftRut.rotation.y=angle;
                const rightRut=box(m.path,'#3e3424',rx,height(rx,rz)+.038,rz,.1,.014,.28,'stone');rightRut.rotation.y=angle;
                const footX=cx+(j%2?.06:-.06),footZ=cz;
                const foot=box(m.path,'#584e3c',footX,height(footX,footZ)+.042,footZ,.08,.01,.16,'stone');foot.rotation.y=angle;
              }
            }else{
              const n=Math.ceil(len/.32);for(let j=0;j<=n;j++){const t=j/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,foot=box(m.path,'#655f49',x+(j%2?.09:-.09),height(x,z)+.045,z,.09,.012,.2,'stone');foot.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);}
            }
          }
        }
        m.g.userData.committed=f.committed;m.g.userData.payload=clone(f.payload);
      }
      stage.userData.snapshot={owner:C.owner(s),details:ds.map(d=>({id:d.id,kind:d.kind,seen:d.seen,done:d.done})),works:fs.map(f=>({id:f.def.id,committed:f.committed,payload:clone(f.payload)}))};
    }
    function clone(v){return JSON.parse(JSON.stringify(v));}
    function tick(t,dt=.016){
      const calm=current?.settings?.motion==='calm';
      for(const o of motions){const to=o.userData.targetPosition;if(!to)continue;o.position.lerp(new T.Vector3(...to),calm?1:Math.min(1,dt*6));}
      for(const [id,m] of entries){
        if(m.kind!=='cart'||!m.body)continue;
        let tilt=m.loaded?.18:0,pitch=m.loaded?-.045:0,dip=0;
        const j=jolts.get(id);
        if(j){
          j.t+=dt;
          if(j.t>=1.1){
            jolts.delete(id);
            if(m.dustPuffs)for(const p of m.dustPuffs){p.mesh.scale.set(0,0,0);p.mesh.material.opacity=0;}
          }else{
            const decay=1-j.t/1.1;
            tilt+=j.amount*decay*Math.abs(Math.sin(j.t*22));
            pitch+=j.amount*.45*decay*Math.sin(j.t*18);
            if(m.dustPuffs){
              const prog=Math.min(1,j.t/.75);
              for(const p of m.dustPuffs){
                p.mesh.scale.setScalar(prog*1.5);
                p.mesh.material.opacity=(1-prog)*.6;
                p.mesh.position.y=p.basePos[1]+prog*.15;
              }
            }
          }
        }
        const lt=loadTests.get(id);
        if(lt){
          lt.t+=dt;
          if(lt.t>=.75)loadTests.delete(id);
          else{
            dip=Math.sin(lt.t/.75*Math.PI)*.035;
            tilt-=dip*.35;
          }
        }
        if(m.loaded&&!calm){
          tilt+=Math.sin(t*1.3)*.012+Math.sin(t*3.7)*.004;
          pitch+=Math.sin(t*1.6)*.004;
        }
        m.body.rotation.z=tilt;
        m.body.rotation.x=pitch;
        m.body.position.y=.76-dip;
      }
      if(!calm)for(const m of work.values())for(const n of m.nodes.values())if(n.ring)n.g.scale.setScalar(1+Math.sin(t*2.3)*.09);
      for(const fn of ambient)fn(t);
    }
    return {update,tick,root:stage};
  }
  root.WitnessCraftRenderer={create,jolt:(id,amount=.14)=>{jolts.set(id,{amount,t:0});},testLoad:(id)=>{loadTests.set(id,{t:0});}};if(typeof module!=='undefined')module.exports=root.WitnessCraftRenderer;
})(globalThis);
