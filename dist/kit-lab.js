(()=>{'use strict';
 const T=Adventure3D.getCore(),stage=document.querySelector('#stage'),renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.AgXToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;stage.append(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#758c95');scene.fog=new T.FogExp2('#aab1a3',.004);
 const hemi=new T.HemisphereLight('#d7e7ff','#7c6243',1.9),sun=new T.DirectionalLight('#ffe3b3',3.2);
 sun.position.set(-12,18,15);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,far:180});sun.shadow.normalBias=.035;scene.add(hemi,sun,sun.target);
 const floor=new T.Mesh(new T.PlaneGeometry(220,180),new T.MeshStandardMaterial({color:'#8c8270',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.012;floor.receiveShadow=true;scene.add(floor);
 const camera=new T.PerspectiveCamera(43,1,.08,400);let yaw=.6,pitch=.21,distance=7.8,target=new T.Vector3(0,1.4,0),scope,latest=0,ready=false,frame=0,paused=false;
 const kit=WitnessKit.create(T,renderer),status=document.querySelector('#status');
 function resize(){const r=stage.getBoundingClientRect();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(stage);resize();
 function position(){camera.position.set(target.x+Math.sin(yaw)*Math.cos(pitch)*distance,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*Math.cos(pitch)*distance);camera.lookAt(target);}
 function reset(){const n=Number(document.querySelector('#count').value);target.set(n===200?45:0,n===200?0:1.4,n===200?20:0);distance=n===200?115:7.8;yaw=n===200?.65:.6;pitch=n===200?.55:.21;position();}
 async function mount(quality=document.querySelector('#quality').value,count=Number(document.querySelector('#count').value)){
  const serial=++latest;ready=false;scope?.close();scope=kit.createScope(scene);const current=scope,started=performance.now();document.querySelector('#error').textContent='';status.textContent='Đang mở gói '+quality+'…';
  const transforms=Array.from({length:count},(_,i)=>({position:count===1?[0,0,0]:[(i%20)*5,0,Math.floor(i/20)*5]}));
  try{const result=await current.mount('./assets/environment-kit/cae/manifest-v2.json',{quality,transforms});if(serial!==latest)return;
   ready=true;const material=result.models[0].mesh.material,texture=material.map;
   status.textContent=`${count} module · ${quality}\nTexture ${texture.image?.width??512} px · ${texture.isCompressedTexture?'nén GPU':'pixel gốc'}\nTải và giải mã: ${(performance.now()-started).toFixed(1)} ms\nFootprint: ${result.solids.length}`;
   window.KitLab.model=result;window.KitLab.quality=quality;window.KitLab.loadMs=performance.now()-started;
  }catch(error){if(error.name!=='AbortError'){document.querySelector('#error').textContent=error.message;throw error;}}
 }
 function render(){if(!paused){position();renderer.info.autoReset=false;renderer.info.reset();renderer.render(scene,camera);}frame=requestAnimationFrame(render);}
 let drag;renderer.domElement.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId);});
 renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.008;pitch=Math.max(-.1,Math.min(1.3,pitch+(e.clientY-drag[1])*.006));drag=[e.clientX,e.clientY];});
 renderer.domElement.addEventListener('pointerup',()=>drag=null);renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(3,Math.min(180,distance*Math.exp(e.deltaY*.001)));},{passive:false});
 document.querySelector('#quality').addEventListener('change',()=>mount().catch(()=>{}));document.querySelector('#count').addEventListener('change',()=>{reset();mount().catch(()=>{});});document.querySelector('#reset').onclick=reset;
 window.KitLab={T,renderer,scene,camera,kit,mount,reset,get ready(){return ready},pause(value){paused=value},draw(){position();renderer.info.reset();renderer.render(scene,camera)},dispose:async()=>{cancelAnimationFrame(frame);scope?.close();await kit.dispose();floor.geometry.dispose();floor.material.dispose();sun.shadow.dispose();renderer.dispose();}};
 reset();render();mount().catch(()=>{});
})();
