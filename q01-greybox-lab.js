(()=>{
 'use strict';
 const G=WitnessQ01Greybox,T=Adventure3D.getCore(),stage=document.querySelector('#stage'),message=document.querySelector('#message');
 const ar=G.create(),held=new Set(),jobs=new Map();let mounted,scene,lastStatus,nearest,lighting='day',lastTime=0,frame,ready=false;
 const anchors=ar.anchors,visited=new Set(),errorLog=[];
 const notify=text=>{message.textContent=text;};
 // Clear the starter engine's random terrain obstacles only in this authored lab.
 globalThis.WitnessQ01={clearLand:()=>true};
 const makeCharacter=AdventureCharacter.create;AdventureCharacter.create=(core,role,options={})=>makeCharacter(core,role,{...options,overrides:{...CharacterProfiles.get('traveler'),id:'q01-greybox-witness',name:'Người Chứng',kind:'fictional',tunic:'#9bada9',mantle:'#777f78',ornament:'none',item:null}});
 const sky=AdventureVisuals.sky;AdventureVisuals.sky=(core,s,biome)=>{scene=s;return sky(core,s,biome);};
 const engine=Adventure3D.create({quality:'high',select:id=>interact(id),unreachable:()=>notify('Lối đi đang đóng hoặc bị vật cản. Hãy kiểm cơ cấu trước.'),lost:()=>notify('Đồ họa tạm dừng. Đang chờ phục hồi…'),restored:()=>notify('Đã phục hồi hình ảnh.'),status:updateStatus});
 const layout={...Adventure3D.layoutFor('andrew'),biome:'shore',flatGround:true,clearLegacyProps:true,q01Gold:true,start:[-6,-30],nodes:[[-6,-22]],mission:[],routes:[],decoys:[]};
 engine.load('andrew',[-6,-30],layout);
 // Retain the engine's sky, lights, avatar and the same renderer/Three instance.
 // The authored structural floors below replace the starter terrain entirely.
 for(const o of [...scene.children])if(!o.isLight&&o.name!=='player'&&o.type!=='Object3D')o.visible=false;
 mounted=G.mount(T,scene,ar);mounted.setAnnotations(false);scene.userData.terrainHeight=()=>0;scene.background=new T.Color('#9aafb5');scene.fog=new T.FogExp2('#9aafb5',.003);
 engine.restoreSpatial(anchors.boat);engine.mount(stage,stage.querySelector('.adv-markers'));engine.rotate(Math.PI+.26);
 const targets=Object.entries(anchors).filter(([id])=>!['stranger','follow','strangerGone','rearAlley','smallBerth','simeon','apprentice'].includes(id)).map(([id,p])=>({id,at:[p.x,p.z],floorY:p.y,surfaceId:p.supportId,name:id,range:id==='commonDoor'?1.8:2.2}));
 engine.update([],targets);
 const titles={boat:'00 · Thuyền và ván lên bến',disembark:'00 · Sân tiếp bến',alley:'01 · Hẻm tới xưởng',load:'02 · Khung hàng Q01.LOAD',ledger:'02 · Bàn sổ Natan',titus:'03 · Titus / điểm nhìn hai tuyến',cart:'04 · Xe đối trọng',rope:'04 · Tay dây C0',workers:'04 · Hai thợ',lever:'04 · Xà và đòn kê',mainBottom:'04 · Chân thang chính',sideBottom:'04 · Cánh ngăn lối phụ',mezzanine:'04 · Gác / điểm đón hai người',commonDoor:'04 · Cửa chung lên mái',roofLanding:'04 · Chiếu nghỉ sân mái',reception:'04 · Điểm Titus nhận người',lookout:'05 · Điểm nhìn hẻm',winch:'04 · Bộ tời C+1',roofExit:'06 · Cửa đường xuống sân',descentTop:'06 · Thang thoát hiểm',yosef:'06 · Mái hiên Yosef',rest:'07 · Chỗ ngồi / nghỉ',b06:'08 · Bàn B06 ngoài kho',meal:'07–08 · Bếp / bàn chung',lodging:'07–08 · Chỗ nghỉ / người nhận',handoff:'08 · Lối bàn giao',drainMouth:'Nhánh · Miệng rãnh',drain:'Nhánh · Rãnh C−1'};
 const select=document.querySelector('#destination');for(const t of targets){const o=document.createElement('option');o.value=t.id;o.textContent=titles[t.id]||t.id;select.append(o);}select.value='disembark';
 const map=document.querySelector('#map'),NS='http://www.w3.org/2000/svg';
 function svg(tag,attrs){const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);map.append(el);return el;}
 const xy=p=>[15+(p.x+37)*4.3,12+(p.z+33)*4.1];
 svg('rect',{x:20,y:49,width:260,height:181,fill:'#586a6b'});svg('rect',{x:51,y:61,width:60,height:58,fill:'#899590',stroke:'#c9d3c8'});svg('rect',{x:22,y:127,width:10,height:45,fill:'#567b8c'});
 const mapMarkers=new Map();for(const [id,p]of Object.entries(anchors)){const [cx,cy]=xy(p);mapMarkers.set(id,svg('circle',{cx,cy,r:2,fill:'#dcc08d'}));}
 const playerDot=svg('circle',{cx:0,cy:0,r:4,fill:'#f0eddf',stroke:'#243337','stroke-width':1.4});
 const mapLabel=(text,x,y)=>{const el=svg('text',{x,y,fill:'#e1e8e2','font-size':9,'font-family':'system-ui'});el.textContent=text;};mapLabel('C1 / C+1',56,86);mapLabel('C0',185,190);mapLabel('BIỂN / BẾN',90,35);mapLabel('C−1',20,123);
 function describe(){const id=select.value;mapMarkers.forEach((m,key)=>m.setAttribute('r',key===id?4:2));const beat=G.beats.find(b=>b.anchors.includes(id));document.querySelector('#beat-detail').textContent=beat?`${String(beat.beat).padStart(2,'0')} · ${beat.title}. ${beat.purpose}`:'Rãnh bảo trì là nhánh khảo sát tự chọn; không phải tuyến cứu hộ thứ ba.';}
 select.addEventListener('change',describe);describe();
 function motion(){engine.controls((held.has('d')?1:0)-(held.has('a')?1:0),(held.has('w')?1:0)-(held.has('s')?1:0),held.has('shift'));}
 function action(id){const p=ar.preview;if(id==='cart'&&p.route==='mechanical'&&!p.prepared)return ['Chèn xe tại cữ',()=>ar.setPreview({prepared:true})];
  if(id==='rope'&&p.route==='mechanical'&&p.prepared&&!p.opened)return ['Kéo tời · mở cánh ngăn',()=>ar.setPreview({opened:true})];
  if(id==='workers'&&p.route==='manual'&&!p.prepared)return ['Tập hợp hai thợ',()=>ar.setPreview({prepared:true})];
  if(id==='lever'&&p.route==='manual'&&p.prepared&&!p.opened)return ['Dịch xà · đặt lên chỗ chèn',()=>ar.setPreview({opened:true})];
  if(id==='commonDoor'&&p.opened&&!p.common)return ['Mở cửa chung · kiểm đường mái',()=>ar.setPreview({common:true})];return null;
 }
 function interact(id=nearest?.id){if(!id||!engine.within(id))return false;const a=action(id);if(a){a[1]();notify(a[0]+' — đã đổi hình học và va chạm.');refresh();}else notify((titles[id]||id)+' · '+(G.beats.find(b=>b.anchors.includes(id))?.purpose||'Điểm đứng và sàn đã được bố trí.'));return true;}
 function updateStatus(s){lastStatus=s;if(!ready)return;const p=s.spatial,[cx,cy]=xy(p);playerDot.setAttribute('cx',cx);playerDot.setAttribute('cy',cy);nearest=s.nearest;
  const region=p.y<-.25?'C−1 · Rãnh bảo trì':p.y>4.5?'C+1 · Sàn tời / sân mái':p.y>1.7?'C1 · Gác lửng / chiếu nghỉ':p.supportId==='q01-quay'?'Cầu tàu':'C0 · Cầu cảng / sân hàng';
  document.querySelector('#location strong').textContent=region;document.querySelector('#location span').textContent=`Cao độ ${p.y.toFixed(2)} m · ${s.walking?'Đang đi':'Đang quan sát'}`;
  const a=nearest&&action(nearest.id),button=document.querySelector('#interact');button.disabled=!nearest;button.textContent=nearest?'E · '+(a?.[0]||titles[nearest.id]||nearest.id):'Tới gần một điểm thao tác';
  for(const [id,a]of Object.entries(anchors))if(Math.hypot(p.x-a.x,p.y-a.y,p.z-a.z)<1.8)visited.add(id);
 }
 function refresh(){const p=ar.preview;document.querySelectorAll('[data-route]').forEach(b=>{b.disabled=!!p.route;b.setAttribute('aria-pressed',String(b.dataset.route===p.route));});
  const done=[!!p.route,p.prepared,p.opened,p.common,visited.has('reception')];document.querySelectorAll('#checklist li').forEach((el,i)=>el.classList.toggle('done',done[i]));document.querySelector('#actors').disabled=!p.common;}
 document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{ar.setPreview({fire:true,route:b.dataset.route});notify('Đi tới '+(b.dataset.route==='mechanical'?'xe đối trọng, sau đó tay dây cạnh kho.':'hai thợ, sau đó xà trước cửa kho.')+' Dùng E ở từng điểm.');refresh();});
 document.querySelector('#walk').onclick=()=>{const id=select.value;engine.controls(0,0);if(!engine.walkTarget(id,()=>{visited.add(id);refresh();notify('Đã đi tới '+titles[id]);},.14))notify('Chưa có tuyến đi thông tới điểm này. Kiểm cửa, xà và cơ cấu ở C0.');stage.focus();};
 document.querySelector('#view').onclick=()=>{const first=engine.cameraState().view!=='first';engine.view(first?'first':'third');document.querySelector('#view').textContent=first?'Góc thứ ba':'Góc thứ nhất';};
 function setLighting(value){lighting=value;const evening=value==='evening';mounted.setLighting(evening);scene.fog.color.set(evening?'#626e7c':'#aebbb9');scene.background.set(evening?'#626e7c':'#aebbb9');let sun=true;for(const o of scene.children){if(o.isHemisphereLight){o.intensity=evening?.85:1.5;o.color.set('#d5e2e9');o.groundColor.set('#82755e');}if(o.isDirectionalLight){o.intensity=sun?(evening?.7:2.4):(evening?.22:.6);o.color.set(sun?(evening?'#d2b6a0':'#ffe7c5'):'#bacbd9');sun=false;}}document.querySelector('#lighting').textContent=evening?'Chiều muộn':'Chạng vạng';}
 document.querySelector('#lighting').onclick=()=>setLighting(lighting==='day'?'evening':'day');
 document.querySelector('#interact').onclick=()=>interact();document.querySelector('#reset').onclick=()=>location.reload();
 document.querySelector('#annotations').onchange=event=>{mounted.setAnnotations(event.target.checked);stage.focus();};
 function actorPoint(actor){return {...actor.position,supportId:actor.userData.supportId};}
 function walkActor(name,destination){const actor=mounted.actors[name],path=ar.route(actorPoint(actor),destination);if(!path)throw Error('Không có đường đi cho '+name);jobs.set(name,{actor,path:structuredClone(path),stuck:0,last:{...actor.position}});return path.length;}
 document.querySelector('#actors').onclick=()=>{try{walkActor('titus',anchors.reception);walkActor('simeon',{...anchors.reception,x:anchors.reception.x-.7});walkActor('apprentice',{...anchors.reception,x:anchors.reception.x+.7});notify('Ba dấu người đang đi thật qua lối đã mở tới điểm nhận. Có thể đi cùng để kiểm.');}catch(e){notify(e.message);}};
 function tick(now){const dt=Math.min(.05,(now-lastTime)/1000||0);lastTime=now;mounted.tick(now/1000);
  for(const [name,j]of jobs){const p=actorPoint(j.actor);while(j.path.length&&Math.hypot(p.x-j.path[0].x,p.z-j.path[0].z)<.045&&Math.abs(p.y-j.path[0].y)<.23)j.path.shift();if(!j.path.length){jobs.delete(name);notify(name+' đã tới điểm nhận bằng đường đi.');continue;}
   const to=j.path[0],d=Math.hypot(to.x-p.x,to.z-p.z),step=Math.min(d,dt*1.65),q=ar.move(p,(to.x-p.x)/Math.max(.001,d)*step,(to.z-p.z)/Math.max(.001,d)*step);j.actor.position.set(q.x,q.y,q.z);j.actor.userData.supportId=q.supportId;
   if(Math.hypot(q.x-p.x,q.z-p.z)<.0001)j.stuck+=dt;else j.stuck=0;if(j.stuck>2){const err='Actor kẹt: '+name;errorLog.push(err);jobs.delete(name);notify(err);}j.actor.rotation.y=Math.atan2(to.x-q.x,to.z-q.z);
  }frame=requestAnimationFrame(tick);
 }
 window.addEventListener('keydown',e=>{if(e.target.matches('select,input,textarea')&&e.key!=='Escape')return;const key=e.key.toLowerCase();if(['w','a','s','d','shift'].includes(key)){held.add(key);motion();e.preventDefault();}else if(key==='e'){interact();e.preventDefault();}else if(key==='v'){document.querySelector('#view').click();e.preventDefault();}else if(key==='arrowleft')engine.rotate(.12);else if(key==='arrowright')engine.rotate(-.12);});
 window.addEventListener('keyup',e=>{held.delete(e.key.toLowerCase());motion();});window.addEventListener('blur',()=>{held.clear();motion();});
 for(const button of document.querySelectorAll('[data-move]')){button.onpointerdown=e=>{button.setPointerCapture(e.pointerId);held.add(button.dataset.move);motion();};button.onpointerup=button.onpointercancel=()=>{held.delete(button.dataset.move);motion();};}
 window.addEventListener('pagehide',event=>{cancelAnimationFrame(frame);held.clear();motion();if(event.persisted)engine.suspend();else{mounted.dispose();engine.stop();}});
 window.addEventListener('pageshow',event=>{if(event.persisted){lastTime=0;engine.mount(stage,stage.querySelector('.adv-markers'));frame=requestAnimationFrame(tick);}});
 // Test hooks expose the real controller and data; there is no position setter
 // or "complete beat" shortcut. The story reducer is intentionally not loaded.
 globalThis.Q01GreyboxLab={version:G.VERSION,ar,engine,scene,T,mounted,walkActor,jobs,errorLog,interact,setLighting,visited,get status(){return lastStatus},get ready(){return ready}};
 setLighting('day');ready=true;document.querySelector('#loader').hidden=true;refresh();frame=requestAnimationFrame(tick);
})();
