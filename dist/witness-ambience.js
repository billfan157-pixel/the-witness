// Nâng cấp đồ họa: hệ sinh thái sống động cho thế giới 3D.
// Tích hợp qua điểm công khai AdventureVisuals.sky + WitnessWorld.decorate, không sửa bundle gốc.
// Mỗi nhóm sinh vật/hạt là một draw call điều khiển bằng shader; hoa dại dùng InstancedMesh.
(function(root){
  'use strict';
  const AV=root.AdventureVisuals,W=root.WitnessWorld;
  if(!AV||!W||typeof matchMedia==='undefined')return;

  const motionOK=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(pointer: coarse)').matches;
  const scaleCount=n=>Math.max(1,Math.round(n*(coarse?.6:1)));
  const pixelRatio=Math.min(root.devicePixelRatio||1,2);
  const rand=(a,b)=>a+Math.random()*(b-a);

  let ctx=null,active=null;

  // Lấy cao độ địa hình từ lưới đỉnh của mặt đất (PlaneGeometry 156x134, 152x130 đoạn, xoay -90° X).
  function heightSampler(scene){
    if(typeof scene.userData.terrainHeight==='function')return scene.userData.terrainHeight;
    const floor=scene.children.find(c=>c.isMesh&&c.geometry?.parameters?.width===156);
    const pos=floor?.geometry?.attributes?.position;
    if(!pos)return()=>0;
    const cols=153;
    return(x,z)=>{
      let ix=Math.round((x+78)/156*152),iy=Math.round((z+67)/134*130);
      ix=Math.max(0,Math.min(152,ix));iy=Math.max(0,Math.min(130,iy));
      return pos.getY(iy*cols+ix);
    };
  }

  // Chim bay lượn theo đàn: thân + hai cánh vỗ trong shader, glide theo nhịp chậm.
  function birds(T,climate,few){
    const n=scaleCount(few?4:7);
    const pos=[],data=[];
    const push=(x,y,z,r,h,sp,ph)=>{pos.push(x,y,z);data.push(r,h,sp,ph);};
    for(let i=0;i<n;i++){
      const r=rand(20,38),h=rand(16,27),sp=rand(.12,.22)*(Math.random()<.5?1:-1),ph=rand(0,6.28);
      // thân
      push(.3,0,0,r,h,sp,ph);push(-.24,0,.05,r,h,sp,ph);push(-.24,0,-.05,r,h,sp,ph);
      // cánh trái
      push(.06,0,-.05,r,h,sp,ph);push(-.06,0,-.72,r,h,sp,ph);push(-.22,0,-.06,r,h,sp,ph);
      // cánh phải
      push(.06,0,.05,r,h,sp,ph);push(-.22,0,.06,r,h,sp,ph);push(-.06,0,.72,r,h,sp,ph);
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    geo.setAttribute('aData',new T.Float32BufferAttribute(data,4));
    const mat=new T.ShaderMaterial({
      uniforms:{uTime:{value:0},uColor:{value:new T.Color(climate.night?'#1c2733':'#2b3540')},uOpacity:{value:.82}},
      transparent:true,depthWrite:false,side:T.DoubleSide,
      vertexShader:`
        attribute vec4 aData;uniform float uTime;varying float vShade;
        void main(){
          float ang=uTime*aData.z+aData.w;
          float glide=smoothstep(.25,.75,sin(uTime*.31+aData.w*1.7)*.5+.5);
          float flap=sin(uTime*8.5+aData.w*6.)*mix(.16,.95,glide);
          vec3 p=position;float span=p.z;
          p.y+=span*sin(flap);p.z=span*cos(flap);
          vec3 center=vec3(cos(ang)*aData.x,aData.y+sin(uTime*.45+aData.w)*1.2,sin(ang)*aData.x-5.);
          vec3 fwd=vec3(-sin(ang),0.,cos(ang));vec3 right=vec3(cos(ang),0.,sin(ang));
          vec3 world=center+fwd*p.x+vec3(0.,1.,0.)*p.y+right*p.z;
          vShade=.72+.28*glide;
          gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
        }`,
      fragmentShader:`
        uniform vec3 uColor;uniform float uOpacity;varying float vShade;
        void main(){gl_FragColor=vec4(uColor*vShade,uOpacity);}`
    });
    const mesh=new T.Mesh(geo,mat);mesh.frustumCulled=false;
    return{object:mesh,tick:t=>{mat.uniforms.uTime.value=t;},dispose:[geo,mat]};
  }

  // Bướm dập dờn ban ngày: đường bay tổng hợp nhiều sóng, cánh vỗ nhanh.
  function butterflies(T){
    const n=scaleCount(6);
    const palette=['#f2ead6','#e8a24c','#7fa8d8','#e6cf6a','#d98ab0'];
    const pos=[],data=[],col=[];
    const push=(x,y,z,d,c)=>{pos.push(x,y,z);data.push(...d);col.push(c.r,c.g,c.b);};
    for(let i=0;i<n;i++){
      const d=[rand(6,13),rand(6,12),rand(.5,.9),rand(0,6.28)];
      const c=new T.Color(palette[i%palette.length]);
      // thân
      push(.09,0,0,d,c);push(-.09,0,.015,d,c);push(-.09,0,-.015,d,c);
      // cánh trái (2 tam giác)
      push(.03,0,-.02,d,c);push(-.02,0,-.18,d,c);push(-.09,0,-.03,d,c);
      push(.03,0,-.02,d,c);push(.02,0,-.15,d,c);push(-.02,0,-.18,d,c);
      // cánh phải
      push(.03,0,.02,d,c);push(-.09,0,.03,d,c);push(-.02,0,.18,d,c);
      push(.03,0,.02,d,c);push(-.02,0,.18,d,c);push(.02,0,.15,d,c);
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    geo.setAttribute('aData',new T.Float32BufferAttribute(data,4));
    geo.setAttribute('aColor',new T.Float32BufferAttribute(col,3));
    const mat=new T.ShaderMaterial({
      uniforms:{uTime:{value:0}},transparent:true,depthWrite:false,side:T.DoubleSide,
      vertexShader:`
        attribute vec4 aData;attribute vec3 aColor;uniform float uTime;varying vec3 vColor;
        void main(){
          float t=uTime*aData.z+aData.w;
          vec3 center=vec3(sin(t*.9)*aData.x+sin(t*2.3+aData.w)*1.4,
            1.1+sin(t*2.7+aData.w*3.)*.55+cos(t*1.9)*.3,
            cos(t*.7)*aData.y+cos(t*2.1+aData.w)*1.4-2.);
          float flap=sin(uTime*20.+aData.w*9.)*1.15;
          vec3 p=position;float span=p.z;p.y+=span*sin(flap);p.z=span*cos(flap);
          float heading=t*.9+1.57;
          vec3 fwd=vec3(-sin(heading),0.,cos(heading));vec3 right=vec3(cos(heading),0.,sin(heading));
          vec3 world=center+fwd*p.x+vec3(0.,1.,0.)*p.y+right*p.z;
          vColor=aColor;
          gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
        }`,
      fragmentShader:`varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,.92);}`
    });
    const mesh=new T.Mesh(geo,mat);mesh.frustumCulled=false;
    return{object:mesh,tick:t=>{mat.uniforms.uTime.value=t;},dispose:[geo,mat]};
  }

  // Đom đóm / hạt phấn: Points phát quang additive, nhấp nháy theo pha riêng.
  function motes(T,{count:cn,color,opacity,sizeMin,sizeMax,spread,yMin,yMax,blink,drift}){
    const n=scaleCount(cn);
    const pos=new Float32Array(n*3),phase=new Float32Array(n),size=new Float32Array(n);
    for(let i=0;i<n;i++){
      pos[i*3]=rand(-spread,spread);pos[i*3+1]=rand(yMin,yMax);pos[i*3+2]=rand(-spread,spread*.8)-2;
      phase[i]=Math.random();size[i]=rand(sizeMin,sizeMax);
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.BufferAttribute(pos,3));
    geo.setAttribute('aPhase',new T.BufferAttribute(phase,1));
    geo.setAttribute('aSize',new T.BufferAttribute(size,1));
    const mat=new T.ShaderMaterial({
      uniforms:{uTime:{value:0},uColor:{value:new T.Color(color)},uOpacity:{value:opacity},uPixelRatio:{value:pixelRatio},uBlink:{value:blink?1:0},uDrift:{value:drift}},
      transparent:true,depthWrite:false,blending:T.AdditiveBlending,
      vertexShader:`
        attribute float aPhase;attribute float aSize;
        uniform float uTime,uPixelRatio,uBlink,uDrift;varying float vGlow;
        void main(){
          vec3 p=position;
          p.x+=sin(uTime*.22*uDrift+aPhase*6.28)*1.5;
          p.y+=sin(uTime*.3*uDrift+aPhase*9.)*.6;
          p.z+=cos(uTime*.2*uDrift+aPhase*5.)*1.5;
          float tw=.55+.45*sin(uTime*(uBlink>.5?1.8:.9)+aPhase*(uBlink>.5?20.:15.));
          vGlow=uBlink>.5?smoothstep(.35,.95,tw):tw;
          vec4 mv=viewMatrix*vec4(p,1.);
          float depth=max(1.,-mv.z);
          gl_PointSize=clamp(aSize*uPixelRatio*((uBlink>.5?60.:50.)/depth)*(.6+.4*vGlow),1.,20.);
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader:`
        uniform vec3 uColor;uniform float uOpacity;varying float vGlow;
        void main(){
          float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d);a*=a;
          gl_FragColor=vec4(uColor,a*vGlow*uOpacity);
        }`
    });
    const pts=new T.Points(geo,mat);pts.frustumCulled=false;
    return{object:pts,tick:t=>{mat.uniforms.uTime.value=t;},dispose:[geo,mat]};
  }

  // Đọc vị trí tán cây thật từ InstancedMesh của engine (material canopy) để lá chỉ rơi dưới gốc có cây.
  function canopySources(T,scene){
    const sources=[];
    const m=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();
    scene.traverse(o=>{
      if(!o.isInstancedMesh||!o.visible)return;
      if(o.material?.customProgramCacheKey?.()!=='journey-canopy-3')return;
      for(let i=0;i<o.count;i++){
        o.getMatrixAt(i,m);m.decompose(p,q,s);
        sources.push({x:p.x,y:p.y,z:p.z,r:Math.max(.4,s.x)});
      }
    });
    return sources;
  }

  // Lá rơi: chỉ sinh ra từ tán cây thật, thưa và chậm, có dáng lá + gân, nằm lại trên đất một thoáng rồi tan.
  function leaves(T,heightAt,sources){
    if(!sources.length)return null;
    const n=Math.min(scaleCount(16),sources.length);
    const pos=[],uv=[],data=[],phase=[],idx=[];
    for(let i=0;i<n;i++){
      const src=sources[Math.floor(Math.random()*sources.length)];
      const ox=src.x+rand(-src.r*.7,src.r*.7),oz=src.z+rand(-src.r*.7,src.r*.7);
      const oy=src.y+rand(-.3,.35),gy=heightAt(ox,oz),ph=Math.random();
      const b=pos.length/3;
      pos.push(-.5,-.5,0, .5,-.5,0, .5,.5,0, -.5,.5,0);
      uv.push(0,0, 1,0, 1,1, 0,1);
      for(let k=0;k<4;k++){data.push(ox,oy,oz,gy);phase.push(ph);}
      idx.push(b,b+1,b+2,b,b+2,b+3);
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geo.setAttribute('aData',new T.Float32BufferAttribute(data,4));
    geo.setAttribute('aPhase',new T.Float32BufferAttribute(phase,1));
    geo.setIndex(idx);
    const mat=new T.ShaderMaterial({
      uniforms:{uTime:{value:0},uColorA:{value:new T.Color('#6f7a3f')},uColorB:{value:new T.Color('#b7923f')},uColorC:{value:new T.Color('#8a6a3a')}},
      transparent:true,depthWrite:false,side:T.DoubleSide,
      vertexShader:`
        attribute vec4 aData;attribute float aPhase;
        uniform float uTime;uniform vec3 uColorA,uColorB,uColorC;
        varying float vFade;varying vec3 vColor;varying vec2 vUv;
        void main(){
          vUv=uv;
          float speed=.06+fract(aPhase*7.13)*.06;
          float c=fract(uTime*speed+aPhase);
          float fallT=clamp(c/.5,0.,1.);
          float groundT=clamp((c-.5)/.18,0.,1.);
          float alive=1.-step(.68,c);
          float sway=sin(uTime*1.4+aPhase*12.)*.32+sin(uTime*2.7+aPhase*5.)*.12;
          float x=aData.x+sway*fallT+fallT*fallT*.6;
          float z=aData.z+cos(uTime*1.1+aPhase*9.)*.28*fallT;
          float y=mix(aData.y,aData.w+.02,fallT);
          float rot=uTime*(1.2+fract(aPhase*5.)*1.6)+aPhase*20.;
          float cr=cos(rot),sr=sin(rot);vec2 corner=position.xy;
          vec2 rc=vec2(corner.x*cr-corner.y*sr,corner.x*sr+corner.y*cr);
          float tilt=sin(uTime*2.2+aPhase*7.)*.6;
          vec3 world=vec3(x+rc.x*.11,y+rc.y*.11*cos(tilt),z+rc.y*.11*sin(tilt));
          vFade=alive*smoothstep(0.,.06,fallT)*(1.-groundT);
          vColor=mix(mix(uColorA,uColorB,fract(aPhase*11.)),uColorC,fract(aPhase*3.7)*.5);
          gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
        }`,
      fragmentShader:`
        varying float vFade;varying vec3 vColor;varying vec2 vUv;
        void main(){
          vec2 p=vUv*2.-1.;
          float width=1.35+.9*abs(p.y);
          float r=length(vec2(p.x*width,p.y));
          float mask=smoothstep(1.,.86,r);
          if(mask*vFade<.02)discard;
          float rib=mix(1.,.78,smoothstep(.10,.0,abs(p.x)));
          gl_FragColor=vec4(vColor*rib,mask*vFade*.9);
        }`
    });
    const mesh=new T.Mesh(geo,mat);mesh.frustumCulled=false;
    return{object:mesh,tick:t=>{mat.uniforms.uTime.value=t;},dispose:[geo,mat]};
  }

  // Hoa dại và bụi cỏ theo chunk: mỗi chunk một cặp InstancedMesh LOD0/LOD1
  // (HLOD + frustum culling theo bounding sphere), gió simplex và tương tác
  // đẩy nghiêng khi nhân vật bước qua chạy trong vertex shader.
  function flowerGeometry(T,detail){
    const pos=[],col=[],idx=[];
    if(detail){
      const petals=5;
      for(let i=0;i<petals;i++){
        const a=i/petals*Math.PI*2,ax=Math.cos(a),az=Math.sin(a),px=-az,pz=ax;
        const b=pos.length/3,r0=.02,r1=.085,w0=.018,w1=.032;
        pos.push(ax*r0+px*w0,.012,az*r0+pz*w0, ax*r0-px*w0,.012,az*r0-pz*w0,
          ax*r1-px*w1,.032,az*r1-pz*w1, ax*r1+px*w1,.032,az*r1+pz*w1);
        for(let k=0;k<4;k++)col.push(1,1,1);
        idx.push(b,b+1,b+2,b,b+2,b+3);
      }
      const cb=pos.length/3;
      pos.push(0,.038,0);col.push(1,.82,.28);
      for(let i=0;i<petals;i++){
        const a0=i/petals*Math.PI*2,a1=(i+1)/petals*Math.PI*2,b=pos.length/3;
        pos.push(Math.cos(a0)*.03,.032,Math.sin(a0)*.03, Math.cos(a1)*.03,.032,Math.sin(a1)*.03);
        col.push(1,.82,.28,1,.82,.28);
        idx.push(cb,b,b+1);
      }
    }else{
      for(const a of [0,Math.PI/2]){
        const dx=Math.cos(a),dz=Math.sin(a),b=pos.length/3;
        pos.push(-dx*.07,0,-dz*.07, dx*.07,0,dz*.07, dx*.07,.11,dz*.07, -dx*.07,.11,-dz*.07);
        for(let k=0;k<4;k++)col.push(1,1,1);
        idx.push(b,b+1,b+2,b,b+2,b+3);
      }
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    geo.setAttribute('color',new T.Float32BufferAttribute(col,3));
    geo.setIndex(idx);geo.computeVertexNormals();
    return geo;
  }
  function grassGeometry(T,blades,segs){
    const pos=[],col=[],idx=[];
    for(let b=0;b<blades;b++){
      const a=b/blades*Math.PI,dx=Math.cos(a),dz=Math.sin(a);
      const h=.30+(b%2)*.09,w=.045,base=pos.length/3;
      for(let s=0;s<=segs;s++){
        const t=s/segs,y=h*t,bend=t*t*.12,ww=w*(1-t*.8),px=-dz*ww,pz=dx*ww;
        pos.push(dx*bend+px,y,dz*bend+pz, dx*bend-px,y,dz*bend-pz);
        const g=.75+.25*t;
        col.push(.30*g,.42*g,.20*g, .34*g,.46*g,.22*g);
      }
      for(let s=0;s<segs;s++){const r=base+s*2;idx.push(r,r+1,r+2, r+1,r+3,r+2);}
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    geo.setAttribute('color',new T.Float32BufferAttribute(col,3));
    geo.setIndex(idx);geo.computeVertexNormals();
    return geo;
  }
  function floraSystem(T,heightAt,blocked,kind){
    const n=scaleCount(kind==='flower'?150:240);
    const geo0=kind==='flower'?flowerGeometry(T,true):grassGeometry(T,3,2);
    const geo1=kind==='flower'?flowerGeometry(T,false):grassGeometry(T,2,1);
    const shared=AV.windUniforms(T);
    const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0,side:T.DoubleSide});
    mat.customProgramCacheKey=()=> 'witness-flora-'+kind+'-1';
    mat.onBeforeCompile=shader=>{
      shader.uniforms.uWindTime=shared.uWindTime;
      shader.uniforms.uTrail=shared.uTrail;
      shader.vertexShader=shader.vertexShader
        .replace('#include <common>',`#include <common>\n${AV.windGLSL}`)
        .replace('#include <begin_vertex>',`#include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 floraBase=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
          #else
            vec3 floraBase=(modelMatrix*vec4(0.,0.,0.,1.)).xyz;
          #endif
          float floraFlex=${kind==='flower'?'clamp(position.y*8.,0.,1.)':'position.y*position.y*2.6'};
          vec2 fw=windGust(floraBase.xz)*${kind==='flower'?'.02':'.06'};
          vec2 fp=windPush(floraBase.xz)*${kind==='flower'?'.12':'.34'};
          transformed.x+=(fw.x+fp.x)*floraFlex;
          transformed.z+=(fw.y+fp.y)*floraFlex;
          transformed.y-=length(fp)*.12*floraFlex;`);
    };
    const chunks=new Map();
    const dummy=new T.Object3D(),color=new T.Color();
    const palette=['#f4efe2','#e9c95d','#9a7fb8','#cf6f5f','#e3a0b0'];
    let placed=0,guard=0;
    while(placed<n&&guard++<n*6){
      const x=rand(-30,30),z=rand(-20,18),y=heightAt(x,z);
      if(y<-.15||blocked(x,z))continue;
      const key=Math.floor(x/16)+','+Math.floor(z/16);
      if(!chunks.has(key))chunks.set(key,{items:[],cx:Math.floor(x/16)*16+8,cz:Math.floor(z/16)*16+8});
      chunks.get(key).items.push({x,y,z,s:rand(.8,1.6),yaw:kind==='flower'?rand(0,6.28):0,c:palette[Math.floor(Math.random()*palette.length)]});
      placed++;
    }
    const group=new T.Group();group.name='witness-flora-'+kind;
    const pairs=[];
    for(const chunk of chunks.values()){
      const meshes=[geo0,geo1].map((geo,level)=>{
        const mesh=new T.InstancedMesh(geo,mat,chunk.items.length);
        chunk.items.forEach((item,i)=>{
          dummy.position.set(item.x,item.y+(kind==='flower'?.1:.02),item.z);
          dummy.rotation.set(0,item.yaw,0);
          dummy.scale.setScalar(item.s);
          dummy.updateMatrix();
          mesh.setMatrixAt(i,dummy.matrix);
          if(kind==='flower')mesh.setColorAt(i,color.set(item.c));
        });
        mesh.instanceMatrix.needsUpdate=true;
        if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
        mesh.receiveShadow=true;
        mesh.computeBoundingSphere();
        mesh.visible=level===0;
        group.add(mesh);
        return mesh;
      });
      pairs.push({chunk,meshes});
    }
    return {
      object:group,
      tick:(t,player)=>{
        for(const {chunk,meshes} of pairs){
          const d=player?Math.hypot(player.x-chunk.cx,player.z-chunk.cz):0;
          meshes[0].visible=d<26;
          meshes[1].visible=d>=26&&d<90;
        }
      },
      dispose:[geo0,geo1,mat]
    };
  }

  function build(state){
    if(!ctx)return;
    const {T,scene,biome}=ctx;
    if(active){active.group.removeFromParent();for(const d of active.dispose)d.dispose?.();active=null;}
    const climate=AV.atmosphere(biome);
    const layer=state?.layer?.id||null;
    const night=!!climate.night;
    const indoor=['L02','L03','L05','V01','V04'].includes(layer);
    const desert=biome==='desert',room=biome==='room';
    const group=new T.Group();group.name='witness-ambience';
    const ticks=[],dispose=[];
    const add=part=>{if(!part)return;group.add(part.object);if(part.tick)ticks.push(part.tick);dispose.push(...part.dispose);};
    const heightAt=heightSampler(scene);

    if(indoor){
      if(motionOK)add(motes(T,{count:24,color:'#cfd8e0',opacity:.2,sizeMin:1.2,sizeMax:2.4,spread:13,yMin:.4,yMax:4.5,blink:false,drift:.6}));
    }else if(night){
      if(motionOK&&['olive','field','evening','dawn'].includes(biome))
        add(motes(T,{count:biome==='olive'||biome==='field'?46:18,color:'#cfe87a',opacity:.9,sizeMin:2.5,sizeMax:5,spread:20,yMin:.4,yMax:2.6,blink:true,drift:1}));
    }else{
      if(motionOK){
        add(birds(T,climate,desert));
        if(!desert&&!room)add(butterflies(T));
        if(!desert&&!room&&!layer)add(leaves(T,heightAt,canopySources(T,scene)));
        add(motes(T,{count:desert?40:60,color:desert?'#e8cf9a':'#ffe6b0',opacity:desert?.3:.34,sizeMin:1.4,sizeMax:2.8,spread:16,yMin:.3,yMax:4.5,blink:false,drift:1}));
      }
      if(!layer&&!desert&&!room&&['lands','spring','shore','hill','dawn','evening'].includes(biome)){
        const blocked=(x,z)=>{const r=scene.userData.architecture?.bounds;return !!scene.userData.q01&&root.WitnessQ01.clearVegetation(x,z)||!!r&&x>r[0]-.3&&x<r[1]+.3&&z>r[2]-.3&&z<r[3]+.3;};
        add(floraSystem(T,heightAt,blocked,'flower'));
        add(floraSystem(T,heightAt,blocked,'grass'));
      }
    }

    scene.add(group);
    const shared=AV.windUniforms(T);
    let trailCursor=0,lastAt=null,lastRecord=-1;
    active={group,tick:t=>{
      shared.uWindTime.value=t;
      const player=scene.getObjectByName('player')?.position??null;
      if(player&&t-lastRecord>.12&&(!lastAt||Math.hypot(player.x-lastAt[0],player.z-lastAt[1])>.25)){
        shared.uTrail.value[trailCursor].set(player.x,player.y,player.z,t);
        trailCursor=(trailCursor+1)%5;lastAt=[player.x,player.z];lastRecord=t;
      }
      for(const f of ticks)f(t,player);
    },dispose};
  }

  const innerSky=AV.sky;
  AV.sky=function(T,scene,biome){
    const tick=innerSky(T,scene,biome);
    ctx={T,scene,biome};
    return time=>{tick(time);active?.tick(time);};
  };

  const innerDecorate=W.decorate;
  W.decorate=function(state){innerDecorate(state);build(state);};
})(globalThis);
