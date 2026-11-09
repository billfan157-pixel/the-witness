(function(){
  'use strict';
  const D=WitnessContent,M=WitnessModel,W=WitnessWorld,C=WitnessCompass,X=WitnessDepth,U=WitnessWorkshop,CRAFT=WitnessCraft,FUI=WitnessFieldUI,$=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // HUD cập nhật mỗi khung hình: chỉ ghi xuống DOM khi nội dung thật sự đổi.
  const hudCache=new Map(),sessionLog=[];
  function setText(sel,value){const el=$(sel);if(!el)return;const key='t:'+sel;if(hudCache.get(key)===value)return;hudCache.set(key,value);el.textContent=value;}
  function setHTML(sel,value,tag){const el=$(sel);if(!el)return;const key='h:'+sel+':'+tag;if(hudCache.get(key)===value)return;hudCache.set(key,value);el.innerHTML=value;}
  function pushLog(speaker,line){
    if(!line)return;
    const text=String(line).trim();if(!text)return;
    const prev=sessionLog[0];
    if(prev&&prev.speaker===speaker&&prev.text===text)return;
    sessionLog.unshift({speaker:speaker||'Hành trình',text,time:new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})});
    if(sessionLog.length>40)sessionLog.pop();
  }

  const loaded=M.load();
  let state=loaded.state,engine,controls,title=true,dialog=null,last=null,activePuzzle=null,toastTimer,subTimer,checkpointTime=0,walking=false,escortLive=false,storageWarning=false,currentTarget=null,audioOn=false,legendOrder=[],legendHint=0,attuneChosen=false;
  const cloud=WitnessCloud.create({model:M,onStatus(info){
    const text=info.storageFailed?'Bộ nhớ máy đã đầy · hãy xuất bản lưu':info.message;
    setText('#save-status',text);setText('#cloud-title-status',text);
    document.documentElement.dataset.cloud=info.mode;
    for(const b of document.querySelectorAll('#title-actions [data-act]'))b.disabled=!info.ready;
  },onState(next){state=next;title=true;if(dialog)close();if(engine)launchWorld();}});
  globalThis.WitnessCloudSession=cloud;
  const initial=()=>state||M.fresh();
  let fieldMessage='',fieldTested=false,fieldCache='',fieldNearest=null,fieldFocus=null;
  const assetUrl=f=>globalThis.AdventureCast?.asset?.(f)||'./assets/'+f;
  const SKILL_ICONS={
    observe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M12 6v-2M12 20v-2"/></svg>',
    craft:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16v-5L9 4 4 9l11 11"/><path d="M7 12l2-2M11 16l2-2"/></svg>',
    commune:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 20v-9M12 11c-3-4-7-4-8-1 2.5 1 5.5 2 8 1ZM12 11c3-4 7-4 8-1-2.5 1-5.5 2-8 1ZM12 7c-2-3-5-4-6-2M12 7c2-3 5-4 6-2"/></svg>',
    defend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3.2 8.7-7 10-3.8-1.3-7-5-7-10V6l7-3Z"/><path d="M12 7v10"/></svg>'
  };
  const KIT_ICONS={
    lamp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3c1.5 2 1.5 3.5 0 5-1.5-1.5-1.5-3 0-5Z"/><path d="M6 12h11c0 4-2.5 6-5.5 6S6 16 6 12Z"/><path d="M17 12c2 0 3 1 3 2.5S19 17 17 17"/><path d="M8 20h8"/></svg>',
    tablet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4M12 3v18" opacity=".65"/></svg>',
    rope:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M16 17l4 4"/></svg>',
    wrap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 7c0-2 3-3 7-3s7 1 7 3v10c0 2-3 3-7 3s-7-1-7-3V7Z"/><path d="M5 10h14M10 4v16"/></svg>',
    sandals:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 18c-2 0-3-2-2.5-5S7 4 9.5 4s4 4 4.5 9c.4 3.5-1 5-3.5 5H7Z"/><path d="M6 10h6M16 19c1.5 0 2.5-1.5 2-4s-1.5-5-3-5"/></svg>',
    kitbag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 9h16l-1 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 9Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/><path d="M4 13h16M12 11v4"/></svg>'
  };
  const TAB_ICONS={
    quests:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    evidence:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3v18M6 21h12M4 8h16M7 8l-3 6a3 3 0 0 0 6 0L7 8ZM17 8l-3 6a3 3 0 0 0 6 0l-3-6Z"/></svg>',
    skills:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3l7 3v5c0 5-3.2 8.7-7 10-3.8-1.3-7-5-7-10V6l7-3Z"/><circle cx="12" cy="11" r="2"/></svg>',
    people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    world:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5"/></svg>',
    scripture:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    log:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  };

  let currentVoice=null;
  const audio=WitnessAudio.create({
    locate:id=>engine?.locate(id),
    onCaption(text){const el=$('#audio-caption');if(!el)return;el.textContent=text;el.hidden=false;clearTimeout(el._audioTimer);el._audioTimer=setTimeout(()=>{if(!audio.debug().voice||audio.debug().voice.status!=='playing')el.hidden=true;},6500);},
    onVoice(info){
      currentVoice=info;
      const label=dialog?.querySelector('[data-voice-status]');
      if(label)label.textContent=!info?'Có thể nghe lại':info.status==='loading'?'Đang mở bản thoại…':info.status==='playing'?(info.kind==='system'?'Giọng máy tiếng Việt · ':'Đang nói · ')+info.name:info.kind==='no-vietnamese'?'Máy chưa có giọng tiếng Việt':'Câu này chưa có bản thu';
      const stop=dialog?.querySelector('[data-act="audio-stop"]');if(stop)stop.disabled=!info||info.status==='unavailable';
      if(!info){const el=$('#audio-caption');if(el)el.hidden=true;}
    }
  });
  globalThis.WitnessAudioSession=audio;
  const FeedbackAudio={click:()=>audio.ui('click'),choice:()=>audio.ui('choice'),page:()=>audio.ui('page'),seal:()=>audio.ui('seal'),accomplish:()=>audio.ui('accomplish'),material:(kind,at)=>audio.material(kind,at)};
  const audioCaption=document.createElement('div');audioCaption.id='audio-caption';audioCaption.className='audio-caption';audioCaption.hidden=true;audioCaption.setAttribute('role','status');$('#game').append(audioCaption);
  function voiced(person,text,label){
    if(!dialog||!text)return;
    const strip=document.createElement('div');strip.className='voice-controls';
    strip.innerHTML='<span data-voice-status>Nhấn để nghe thoại</span><button class="text-link" data-act="audio-repeat">Nghe lại</button><button class="text-link" data-act="audio-stop" disabled>Dừng giọng</button>';
    dialog.querySelector('.dialog-content').append(strip);
    strip._voice={person,text,label};
    if(state?.settings?.autoVoice!==false)audio.speak(person,text,{label});
  }

  function speakerBanner(personId,roleFallback=''){
    if(!personId)return roleFallback?`<span class="speaker">${esc(roleFallback.toUpperCase())}</span>`:'';
    const p=D.people[personId];if(!p)return '';
    const initial=p.name?p.name.charAt(0):'W',color=p.color||'#dcbe80';
    return `<div class="npc-banner"><div class="npc-seal" style="border-color:${color};color:${color}"><span class="npc-initial">${initial}</span></div><div class="npc-info"><span class="speaker">${esc(p.name.toUpperCase())}</span><span class="npc-sub">${esc(p.role)} · ${esc(p.place||'Xêdarê')}</span></div>${p.register?`<div class="npc-register-badge"><span class="reg-label">XƯNG HÔ</span><span class="reg-val">${esc(p.register)}</span></div>`:''}</div>`;
  }

  function toast(message){
    clearTimeout(toastTimer);
    $('#toast').textContent=message;$('#toast').classList.add('visible');
    if(dialog){
      let alert=dialog.querySelector('.inline-alert');
      if(!alert){alert=document.createElement('p');alert.className='notice warning inline-alert';alert.setAttribute('role','alert');dialog.querySelector('.dialog-body').append(alert);}
      alert.textContent=message;
    }
    toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500);
  }
  function save(){
    if(!state)return;
    const result=M.save(state,cloud.storage);state=result.state;
    cloud.capture(state);
    if(!result.persisted)$('#save-status').textContent='Chưa lưu được trên máy · hãy xuất bản lưu';
    if(!result.persisted&&!storageWarning){storageWarning=true;toast('Máy chưa cho lưu tiến độ. Bạn có thể xuất bản lưu từ menu.');}
  }
  function update(next){state=next;save();W.setState(state);refresh();}
  function stopMotion(){controls?.enable(false);engine?.controls(0,0);}
  function applyView(){
    if(!state)return;
    const mode=state.settings.cameraMode||'third';
    document.documentElement.dataset.view=mode;
    engine?.view?.(mode,{bob:state.settings.motion!=='calm'});
  }
  function toggleView(){
    if(!state||title||!engine)return;
    state.settings.cameraMode=(state.settings.cameraMode==='first')?'third':'first';
    save();applyView();
    toast(state.settings.cameraMode==='first'?'Góc nhìn thứ nhất · nhấn V để trở lại. Kéo hoặc bấm chuột để nhìn, WASD để đi.':'Góc nhìn thứ ba.');
  }
  function close(){audio.stopVoice();audio.setMode(title?'title':'world');if(dialog){dialog.close();dialog.remove();dialog=null;}document.body.classList.remove('inspect-active');activePuzzle=null;if(engine){engine.pause(title);if(!title)controls?.enable(true);}refreshField();}
  function show(label,content,footer='',wide=false){
    audio.stopVoice();audio.setMode('dialogue');
    document.body.classList.remove('inspect-active');
    $('#field-work').hidden=true;
    if(dialog){dialog.close();dialog.remove();}
    stopMotion();
    engine?.pause(true,currentTarget?engine.locate(currentTarget):null,{actor:currentTarget,aside:true});
    dialog=document.createElement('dialog');dialog.className=wide?'wide':'';dialog.setAttribute('aria-labelledby','dialog-title');
    dialog.innerHTML=`<div class="dialog-body"><div class="dialog-head"><div><span class="eyebrow">${esc(label)}</span><h2 id="dialog-title"></h2></div><button class="close-dialog" data-act="close" aria-label="Đóng">×</button></div><div class="dialog-content">${content}</div>${footer?`<div class="dialog-footer">${footer}</div>`:''}</div>`;
    $('#modal-host').append(dialog);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.showModal();return dialog;
  }
  const heading=t=>{dialog.querySelector('#dialog-title').textContent=t;};
  const primary=(label,act,extra='')=>`<button class="primary" data-act="${act}" ${extra}>${esc(label)} <span aria-hidden="true">→</span></button>`;
  function transition(label,name,detail,callback){
    const el=$('#transition');el.querySelector('span').textContent=label;el.querySelector('h2').textContent=name;el.querySelector('p').textContent=detail;
    el.classList.add('show');stopMotion();
    setTimeout(()=>{try{callback();}catch(e){toast(e.message);}setTimeout(()=>el.classList.remove('show'),250);},220);
  }

  function focusGoal(){
    if(title||dialog||!state||!engine)return;
    const a=M.actions(state)[0];
    const at=state.layer?a?.at:M.chapter(state).nodes.find(n=>n.id===a?.target)?.at;
    if(at&&engine.focus){engine.focus(at);subline('Đã hướng góc nhìn về mục tiêu hiện tại.');}
    else engine.recenter();
  }

  function launchWorld(){
    const s=initial(),desc=W.descriptor(s);W.setState(s);currentTarget=null;last=null;walking=false;escortLive=false;
    try{
      if(!engine){
        engine=Adventure3D.create({
          quality:s.settings?.graphics||'ultra',
          select:interact,status:onStatus,
          unreachable(){walking=false;toast('Lối này có vật chắn. Thử đi vòng hoặc dùng hướng dẫn trên bản đồ.');},
          lost(){stopMotion();toast('Kết nối 3D tạm gián đoạn. Bản lưu vẫn ở trên máy.');},
          restored(){launchWorld();}
        });
        controls=W.makeController(engine,{interact:()=>interact(),journal:()=>journal(),map:()=>map(),guide:()=>guide(),focus:()=>focusGoal(),view:()=>toggleView(),pause:()=>pause(),escape:()=>{if(!dialog&&CRAFT.field(state))pause();else close();}});
      }
      audio.configure(s.settings);audio.setScene(s);audio.setMode(title?'title':'world');
      engine.cue=kind=>audio.ui(kind);
      engine.toggleSound=async()=>{state.settings.sound=!state.settings.sound;audio.configure(state.settings);await audio.unlock();return state.settings.sound;};
      const key=M.chapter(s).id+'.'+(s.layer?.id||'mortal');
      let point=s.positions[key];if(!Array.isArray(point)||point.length!==2||!point.every(Number.isFinite))point=null;
      if(s.pendingEscort){const n=M.chapter(s).nodes.find(n=>n.id===s.pendingEscort.target);point=n?[n.at[0]-1,n.at[1]+1]:null;}
      engine.load(desc.base,point,W.layout(s),true);W.decorate(s);engine.restoreSpatial?.(s.spatialPositions?.[key]);engine.mount($('#world'),$('.adv-markers'));
      const p=W.plan(s);engine.update(p.objects,p.targets,{carrying:!!s.pendingEscort});
      engine.pause(title);controls.enable(!title);applyView();
      audioOn=!!s.settings.sound;
      refresh();
    }catch(e){
      console.error(e);
      show('MỞ THẾ GIỚI CHƠI',`<p>Trình duyệt chưa mở được thế giới 3D.</p><p class="notice">${esc(e.message)}</p>`,primary('Thử mở lại','retry'));
      heading('Cần hỗ trợ đồ họa 3D');
    }
  }

  function refresh(){
    if(!engine)return;
    const s=initial();W.setState(s);audio.configure(s.settings);audio.setScene(s);audio.setMode(title?'title':dialog?'dialogue':'world');const p=W.plan(s);
    const activeAction=M.actions(s)[0];
    const carrying=!!(!s.layer&&(s.pendingEscort||['load','give-oil','supplies'].includes(activeAction?.id)));
    engine.update(p.objects,p.targets,{carrying});
    refreshField();
    document.documentElement.style.setProperty('--scale',s.settings.text);
    document.documentElement.dataset.motion=s.settings.motion;
    document.documentElement.dataset.guide=s.settings.guideMode||'full';
    document.documentElement.dataset.stick=s.settings.stickSide||'left';
    document.documentElement.dataset.view=s.settings.cameraMode||'third';
    $('#subtitle').classList.toggle('plain-sub',s.settings.subtitleBg===false);

    $('#title-screen').hidden=!title;$('#hud-top').hidden=title;$('#hud-bottom').hidden=title;$('#objective').hidden=title;
    const sceneLight=$('#q01-light-toggle');
    if(sceneLight){sceneLight.hidden=title||!globalThis.WitnessQ01?.active(s);sceneLight.querySelector('.tool-label').textContent=s.settings.q01Lighting==='evening'?'Ban ngày':'Buổi tối';sceneLight.setAttribute('aria-label',s.settings.q01Lighting==='evening'?'Chuyển Q01 sang ban ngày':'Chuyển Q01 sang buổi tối');}
    const coarse=matchMedia('(pointer: coarse)').matches||matchMedia('(any-pointer: coarse)').matches;
    $('#touch-controls').hidden=title||!coarse;
    if(title){
      let snap='';
      if(state){
        const ch=M.chapter(state),actions=M.actions(state),a=actions[0],desc=W.descriptor(state);
        snap=`<div class="title-snapshot"><div class="snapshot-header"><span class="snapshot-badge">TIẾN ĐỘ HIỆN TẠI</span><span class="snapshot-act">HỒI ${esc(ch?.act||'I')} · ${esc(ch?.id||'Q01')}</span></div><div class="snapshot-body"><strong class="snapshot-title">${esc(ch?.title||'Bến không chờ người về')}</strong><div class="snapshot-meta"><span class="snapshot-place">📍 ${esc(desc?.name||'Xêdarê')}</span><span class="snapshot-task">✦ ${esc(a?.title||'Lời chứng còn ở lại')}</span></div></div></div>`;
      }
      $('#title-actions').innerHTML=snap+(state?primary(state.finished?'Xem đoạn kết':'Tiếp tục hành trình','continue')+'<button class="secondary" data-act="new">Hành trình mới</button>':primary('Bắt đầu hành trình','new'));
      for(const b of $('#title-actions').querySelectorAll('[data-act]'))b.disabled=!cloud.info().ready;
      return;
    }

    const ch=M.chapter(s),q=M.quest(s),actions=M.actions(s),desc=W.descriptor(s),a=actions[0];
    $('#region-name').textContent=s.layer?(s.layer.kind==='legend'?'LEGENDS OF SCRIPTURE':'THE INNER VEIL'):desc.name.toUpperCase();
    $('#chapter-name').textContent=s.layer?(s.layer.kind==='legend'?D.legends[s.layer.id].ref:'Giấc mơ hư cấu'):ch.title;
    $('#quest-number').textContent=s.layer?(s.layer.kind==='legend'?D.legends[s.layer.id].name.toUpperCase()+' · '+(D.legends[s.layer.id].witnessRole||'CHỨNG NHÂN'):'ẨN DỤ TRONG GIẤC MƠ'):`${ch.id} · ${ch.act}`;
    $('#objective-title').textContent=s.pendingEscort?'Đi cùng tới nơi nhận':a?.title||'Lời chứng còn ở lại';
    $('#objective-detail').textContent=s.layer?a?.text:a?.legend?a.text:q.route?(ch.ending[q.route]||ch.quiet):s.pendingEscort?'Theo sát người đi cùng. Bạn có thể dừng và chờ nhau.':a?.text||ch.lead;

    const quietBtn=$('#quiet-trigger');
    if(quietBtn)quietBtn.hidden=!!s.layer||!ch.quietScene;

    const ws=$('#witness-status');
    if(ws){
      if(s.layer?.kind==='legend'){
        const lsrc=D.legends[s.layer.id],att=M.attunement(s,s.layer.id),comp=s.layer.composure??84;
        ws.hidden=false;
        setHTML('#witness-status',`<strong>${esc(lsrc.witnessRole||'Chứng nhân Vô danh')}</strong><span>${esc(lsrc.composureName||'Độ gắn kết nhóm')}: ${comp}%</span><div class="witness-meter"><i style="width:${comp}%"></i></div>${att.active.length?`<div class="witness-pills">${att.active.map(k=>`<span class="witness-pill">${esc(k.name)} ${'I'.repeat(k.tier)}</span>`).join('')}</div>`:'<span>Thấu cảm nền · Giữ nhịp cùng đoàn</span>'}`,s.layer.id+':'+comp+':'+att.active.length);
      }else{
        const activeTenet=M.activeTenetForChapter(s);
        if(activeTenet){
          ws.hidden=false;
          setHTML('#witness-status',`<strong>Nguyên lý · ${esc(activeTenet.title)}</strong><span>${esc(activeTenet.resonanceTitle)}</span>`,activeTenet.id);
        }else{
          ws.hidden=true;
        }
      }
    }

    const ls=s.layer&&(s.layer.kind==='legend'?D.legends[s.layer.id]:D.veils[s.layer.id]);
    const total=s.layer?ls.steps.length:ch.tasks.filter(a=>!a.when).length+(q.plan?(ch.execution[q.plan]?.length||0):2);
    const done=s.layer?s.layer.step:q.done.length;
    $('#quest-progress').innerHTML=Array.from({length:Math.min(16,total)},(_,i)=>`<i class="${i<done?'done':''}"></i>`).join('');
    const currentLegend=D.spine[Math.min(2,Math.floor(s.chapter/4))];
    $('#spine-status').textContent=s.layer?`${s.layer.kind==='legend'?'Chương Kinh Thánh':'Giấc mơ'} · ${s.layer.kind==='legend'?(s.layer.receipts?.length||0)+' / '+(ls.beats?.length||3)+' nhịp nguồn':''}`:`Hành trình ${Math.floor(s.chapter/4)+1} · ${D.legends[currentLegend].name} · ${M.legendComplete(s,currentLegend)?'Tiếp nối':M.dueLegend(s)===currentLegend?'Chương chính đang chờ':'Chuẩn bị'}`;
    if(s.finished&&!s.layer)ending();
  }

  function onStatus(next){
    audio.tick(next,state);
    refreshField(next);
    last=next;if(title||!state)return;
    if(next.spatial){state.spatialPositions??={};state.spatialPositions[M.chapter(state).id+'.'+(state.layer?.id||'mortal')]={schema:1,...next.spatial};}
    walking=!!next.walking;
    const combat=next.combat;const combatHud=$('#combat-hud');
    if(combatHud.hidden!==!combat)combatHud.hidden=!combat;
    if(combat){
      setText('#combat-state','Thế đứng '+combat.health+'/5 · Sức bền '+combat.stamina+' · Nhịp đối phương '+combat.rival+'/'+combat.rivalMax);
      setText('#combat-tell',combat.phase==='windup'?'Quan sát: '+combat.tell:combat.phase==='recover'?'Có khoảng trống để hành động':'Giữ khoảng cách và đọc tín hiệu');
    }
    const target=next.nearest,action=M.actions(state)[0],node=state.layer?{at:action?.at,name:action?.title}:M.chapter(state).nodes.find(n=>n.id===action?.target);
    const interactBtn=$('#interact-button');
    if(interactBtn)interactBtn.classList.toggle('is-ready',!!target);
    if(target){
      setText('#interact-label',target.name);
      setText('#distance-label','Trong tầm · '+(state.pendingEscort?'Đi cùng':'E để tương tác'));
      currentTarget=target.id;
    }else{
      const goal=next.guide?.at||node?.at;
      const d=goal?Math.round(Math.hypot(goal[0]-next.position[0],goal[1]-next.position[1])):0;
      setText('#interact-label',next.guide||walking?'Đang đi tới…':'Đi tới mục tiêu');
      setText('#distance-label',node?`${d} m · ${node.name}`:'Khám phá xung quanh');
      currentTarget=null;
    }
    const ch=M.chapter(state);
    const nearPerson=next.npc?.appearance?.startsWith('wt-')?D.people[next.npc.appearance.slice(3)]:null;
    const activeCompanion=!nearPerson&&ch.companion?D.people[ch.companion]:null;
    const shownPerson=nearPerson||activeCompanion;
    const companion=$('#companion-hud');
    const companionHidden=!shownPerson||!!dialog||!!state.layer;
    if(companion.hidden!==companionHidden)companion.hidden=companionHidden;
    if(shownPerson){
      const subText=nearPerson?shownPerson.role:(ch.companionLine||shownPerson.role);
      const seal=`<span class="companion-seal" aria-hidden="true">${esc(shownPerson.name.charAt(0).toUpperCase())}</span>`;
      setHTML('#companion-hud',`${seal}<div><strong>${esc(shownPerson.name)}</strong><p>${esc(subText)}</p></div>`,shownPerson.name+':'+subText);
    }
    updateCompass(next);
    const now=performance.now();
    if(now-checkpointTime>5000&&!dialog&&!state.pendingEscort){checkpointTime=now;state.positions[M.chapter(state).id+'.'+(state.layer?.id||'mortal')]=next.position;save();}
  }

  // La bàn mục tiêu: kim chỉ về việc đang cần làm, tính từ hướng nhìn hiện tại.
  function updateCompass(next){
    const dial=$('#compass');if(!dial||typeof next.yaw!=='number')return;
    if(state.settings?.guideMode==='off'){if(!dial.hidden)dial.hidden=true;return;}
    const action=M.actions(state)[0];
    const goal=CRAFT.field(state)?W.plan(state).targets.find(t=>t.main)?.at:state.layer?action?.at:M.chapter(state).nodes.find(n=>n.id===action?.target)?.at;
    if(!goal||!next.position){if(!dial.hidden)dial.hidden=true;return;}
    if(dial.hidden)dial.hidden=false;
    const needle=dial.querySelector('i');
    if(needle){const value='rotate('+C.angleTo(next.yaw,next.position,goal).toFixed(3)+'rad)';if(needle.style.transform!==value)needle.style.transform=value;}
  }

  // "Nhận ra": dấu vết gần đây được làm nổi bật để người chơi tự tìm tới.
  function sense(){
    if(title||dialog||!state||!engine)return;
    const found=engine.sense();
    engine.cue?.('read');
    if(!found){
      const amb=!state.layer?D.regions[M.chapter(state).region]?.ambient:null;
      subline(amb||'Chưa nhận ra dấu vết nào quanh đây.');
      return;
    }
    const id=String(found.id||'');
    const echo=id.startsWith('trace-')?M.echoes(state).find(e=>'trace-'+e.id===id):null;
    subline(echo?`${echo.name}. ${echo.line}`:`Bạn nhận ra: ${found.name||'một dấu vết gần đây'}.`);
  }

  function introChapter(){
    const ch=M.chapter(state),tenet=M.activeTenetForChapter(state),amb=D.regions[ch.region]?.ambient;
    pushLog(ch.title,ch.lead);
    show(ch.act,`${amb?`<span class="sound-cue">${esc(amb)}</span>`:''}<p>${esc(ch.lead)}</p><p class="notice"><strong>Mục tiêu chương:</strong> ${ch.tasks.map(t=>esc(t.title)).join(' → ')}</p><p class="notice">${esc(ch.quiet)}</p>${X.context(state).map(line=>`<p class="notice">${esc(line)}</p>`).join('')}${tenet?`<div class="notice tenet"><strong>Nguyên lý Chứng Nhân · ${esc(tenet.title)}</strong><br>${esc(tenet.resonance)}</div>`:''}`,primary('Bước vào câu chuyện','close'));
    heading(ch.title);
  }

  function start(){
    title=false;close();
    transition('DI SẢN GIAO ƯỚC',M.chapter(state).title,D.regions[M.chapter(state).region].name,()=>{
      launchWorld();
      if(state.finished&&!state.layer)ending();
      else if(state.layer?.format==='accessible_summary'){summary();}
      else if(state.layer){
        const src=state.layer.kind==='legend'?D.legends[state.layer.id]:D.veils[state.layer.id];
        show(state.layer.kind==='legend'?'CHƯƠNG CHUYỂN THỂ':'GIẤC MƠ HƯ CẤU',`<p>${esc(src.summary||src.question)}</p>`,primary('Tiếp tục cảnh đang dở','close'));
        heading(src.title);
      }else introChapter();
    });
  }

  function newGame(){
    show('MỘT CUỘC ĐỜI TRONG THẾ GIỚI NÀY',`<p>Bạn là người chuyển thư kiêm sao chép sổ, trở về bến Xêdarê sau khi cha mất. Xuất thân khởi đầu bậc II ở một kỹ năng đời thường và truyền sang các chương Kinh Thánh qua Sự Thấu Cảm của Người Nghe.</p>${state?'<p class="notice warning">Bắt đầu mới sẽ thay tiến độ đang tiếp tục. Bạn có thể xuất bản lưu trước.</p>':''}<form id="character-form"><label class="field">Tên được gọi<input name="name" value="Người Chứng" maxlength="28" required autocomplete="off"></label><div class="field-row"><label class="field">Diện mạo<select name="gender"><option value="male">Nam</option><option value="female">Nữ</option></select></label><label class="field">Màu áo<select name="attire"><option value="sand">Vải cát</option><option value="green">Xanh lá trầm</option><option value="blue">Xanh biển</option></select></label></div><label class="field">Xuất thân &amp; Kỹ năng khởi đầu<select name="origin"><option value="scribe">Người học chép — Quan sát Bậc II (đối chiếu sổ &amp; đọc địa hình)</option><option value="port">Thợ bến — Thủ công Bậc II (kê tải, dây neo &amp; ngư cụ)</option><option value="road">Người giữ đường — Tự vệ Bậc II (mở lối &amp; giữ thế đứng)</option></select></label></form>`,(state?'<button class="text-link" data-act="export">Xuất tiến độ trước</button>':'')+primary('Bắt đầu','create'));
    heading('Người Chứng');
  }

  function actionById(id){return M.actions(state).find(a=>a.id===id);}

  function personTopicButtons(personId){
    if(!personId)return '';
    const topics=M.talkTopics(state,personId);
    if(!topics.length)return '';
    return `<div class="topic-section"><div class="topic-section-head"><span class="section-icon" aria-hidden="true">💬</span><strong>Chủ đề đàm thoại</strong></div><div class="choices">${topics.map(t=>`<button class="choice topic-choice" data-act="talk-topic" data-person="${personId}" data-topic="${t.id}"><span class="choice-icon" aria-hidden="true">💬</span><div class="choice-text"><strong>${esc(t.label)}${t.heard?' <span class="tag-heard">Đã nghe</span>':' <span class="tag-new">Mới</span>'}</strong><small>Trò chuyện đời thường · Xưng hô: ${esc(D.people[personId].register||'Đối thoại trực tiếp')}</small></div></button>`).join('')}</div></div>`;
  }

  function showPersonDialog(personId,titleFallback='Bến cảng'){
    const p=personId?D.people[personId]:null,ch=M.chapter(state);
    const b=personId?D.bonds.find(b=>b.person===personId&&b.from<=state.chapter&&!state.bonds[b.id]):null;
    const banner=speakerBanner(personId,p?p.role:'ĐỜI SỐNG VẪN TIẾP DIỄN');
    const companionCard=ch.companion===personId&&ch.companionLine?`<div class="companion-callout"><span class="callout-glyph" aria-hidden="true">“</span><p>${esc(ch.companionLine)}</p><span class="callout-tag">Lời đồng hành cùng chương</span></div>`:'';
    const bondCard=b?`<div class="notice bond-notice"><strong>Việc riêng thâm tình · ${esc(b.title)}</strong><br>Có thể thảo luận để chia sẻ việc và cùng chịu trách nhiệm.</div>`:'';
    show(p?p.role:'ĐỜI SỐNG VẪN TIẾP DIỄN',`${banner}<div class="dialog-prose"><p>${esc(p?p.detail:ch.quiet)}</p></div>${companionCard}${personTopicButtons(personId)}${bondCard}`,b?primary('Hỏi việc còn riêng','bond',`data-id="${b.id}"`):primary('Trở lại','close'));
    heading(p?p.name:titleFallback);
    const greeting=M.talkTopics(state,personId).find(t=>t.id==='current-work');
    if(greeting){const line=document.createElement('p');line.className='voice-greeting';line.textContent=greeting.line;dialog.querySelector('.dialog-prose').append(line);voiced(personId,greeting.line);}
  }

  function interact(id){
    if(title||dialog)return;
    if(state.layer?.format==='accessible_summary'){summary();return;}
    const a=M.actions(state)[0];const target=id||last?.nearest?.id||engine.nearest()?.id;
    if(!target){guide();return;}
    if(!engine.within(target)){guide(target,true);return;}
    currentTarget=target;
    if(String(target).startsWith('architecture:')){const d=WitnessArchitecture.describe(target);show('KHÔNG GIAN BẾN CẢNG',`<p>${esc(d.body)}</p>`,primary('Trở lại','close'));heading(d.title);return;}
    if(String(target).startsWith('craft:')){inspectSceneDetail(target);return;}
    if(String(target).startsWith('field:')){operateField(target);return;}
    if(String(target).startsWith('trace-')){readTrace(target);return;}
    if(String(target).startsWith('companion-')){showPersonDialog(target.slice(10));return;}
    if(state.layer){
      const selected=M.actions(state).find(x=>x.target===target)||a;
      if(selected.id==='return'){layerConclusion();return;}
      layerAction(selected);return;
    }
    const ch=M.chapter(state),n=ch.nodes.find(n=>n.id===target);
    const choices=M.actions(state).filter(a=>a.target===target);
    if(target==='training'){training();return;}
    if(target==='rest'){rest();return;}
    if(choices.length===1){showAction(choices[0].id);return;}
    const b=D.bonds.find(b=>b.person===n?.person&&b.from<=state.chapter&&!state.bonds[b.id]);
    if(choices.length){
      show('THẾ GIỚI CON NGƯỜI',`<div class="choices">${choices.map((a,i)=>`<button class="choice" data-act="action" data-id="${a.id}"><strong><span class="ordinal">${i+1}</span>${esc(a.title)}</strong><small>${esc(a.text)}</small></button>`).join('')}</div>${n?.person?personTopicButtons(n.person):''}${b?`<div class="dialog-footer">${primary('Hỏi chuyện '+b.title,'bond',`data-id="${b.id}"`)}</div>`:''}`);
      heading(n?.name||'Một việc cần làm');return;
    }
    showPersonDialog(n?.person,n?.name||'Bến cảng');
  }

  // Dấu vết để lại: có hình dạng ở nơi cũ, có lời mô tả và có phần ghi lại quyết định.
  function readTrace(target){
    const id=String(target).replace(/^trace-/,'');
    const echo=M.echoes(state).find(e=>e.id===id);
    if(!echo){toast('Dấu vết này không còn ở đây.');return;}
    engine?.cue?.('read');
    show('DẤU VẾT ĐỂ LẠI',`<span class="speaker">${esc(echo.name)}</span><p>${esc(echo.line)}</p><p>${esc(echo.text)}</p><p class="notice">Dấu này ở lại đúng vùng bạn đã để nó. Quay lại là thấy.</p>`,primary('Trở lại','close'));
    heading(echo.name);
  }

  function showAction(id){
    const a=actionById(id);if(!a){close();return;}
    if(a.legend){layerIntro('legend',a.legend);return;}
    if(id==='advance'){advance();return;}
    const ch=M.chapter(state),n=ch.nodes.find(n=>n.id===a.target),person=n?.person?D.people[n.person]:null;
    const tenet=a.tenetNote&&state.unlockedBridgeContext?.includes(a.tenetNote)?D.tenets?.[a.tenetNote]:null;
    const buttons=a.choices?`<div class="choices">${a.choices.map((c,i)=>{const permitted=!a.plan||M.planAllowed(state,c[0]);return `<button class="choice" data-act="choose" data-id="${a.id}" data-choice="${c[0]}" ${permitted?'':'disabled'}><span class="choice-icon" aria-hidden="true">✦</span><div class="choice-text"><strong><span class="ordinal">${i+1}</span>${esc(c[1])}</strong><small>${esc(c[2])}${permitted?'':' — Cần hoàn tất phần chuẩn bị trước.'}</small></div></button>`;}).join('')}</div>`:'';
    const extraTalk=person&&!a.choices&&M.talkTopics(state,n.person).length?`<button class="text-link" data-act="person-talk" data-person="${n.person}">Hỏi thăm thêm ${esc(person.name)}</button>`:'';
    const banner=person?speakerBanner(n.person,person.role):'';
    show(person?.role||'MỖI HÀNH ĐỘNG ĐỂ LẠI DẤU',`${banner}<div class="dialog-prose"><p>${esc(a.text)}</p></div>${tenet?`<div class="notice tenet"><div class="tenet-header"><span class="tenet-glyph" aria-hidden="true">✦</span><strong>Nguyên lý Chứng Nhân · ${esc(tenet.title)}</strong></div><p>${esc(tenet.resonance)}</p></div>`:''}${buttons}`,a.choices?extraTalk:extraTalk+primary(a.escort?'Bắt đầu đi cùng':a.puzzle?'Bắt đầu kiểm tra':'Thực hiện','perform',`data-id="${a.id}"`));
    heading(a.title);
    const spoken=[...a.text.matchAll(/“([^”]+)”/g)].map(x=>x[1]).join(' ');
    if(spoken&&n?.person&&a.id!=='repair-pressure')voiced(n.person,spoken);
    if(M.quest(state).plan&&!a.commit)dialog.querySelector('.dialog-content').insertAdjacentHTML('beforeend','<button class="text-link" data-act="revise">Xem lại kế hoạch</button>');
  }

  function execute(id,options={}){
    const a=actionById(id);if(!a)return;
    try{
      const before=M.quest(state).route;
      const prevSkills={...(state.skills||{})};
      update(M.act(state,id,options));
      engine.pose(a.puzzle==='rope'?'offer':'talk');
      engine.cue(a.commit?'finish':'read');
      const depth=X.encounter(state,a);
      const outcomeText=(depth?CRAFT.response(state,depth,true)+' '+X.materialize(state,depth).outcome+' ':'')+(a.commit?(M.chapter(state).ending[M.quest(state).route]||a.success||a.text):a.success||a.choices?.find(c=>c[0]===options.choice)?.[2]||a.text);
      pushLog(a.speaker?D.people[a.speaker]?.name:a.title,outcomeText);
      const upgraded=Object.keys(D.skills||{}).find(k=>(state.skills?.[k]||1)>(prevSkills[k]||1));
      if(state.finished){close();ending();return;}
      show(before?'VIỆC ĐÃ GHI':'DẤU VẾT ĐÃ ĐƯỢC GIỮ',`<p>${esc(outcomeText)}</p>${a.evidence&&state.evidence.includes(a.evidence)?`<div class="notice"><strong>${esc(D.evidence[a.evidence].name)}</strong><br>${esc(D.evidence[a.evidence].text)}</div>`:''}${upgraded?`<div class="notice tenet"><strong>Kỹ năng trưởng thành · ${esc(D.skills[upgraded].name)} Bậc ${'I'.repeat(state.skills[upgraded])}</strong><br>${esc(D.skills[upgraded].tiers[state.skills[upgraded]-1])}</div>`:''}`,primary('Tiếp tục khám phá','close'));
      heading(a.commit?'Một việc đã hoàn tất':a.title);
    }catch(e){toast(e.message);}
  }

  function perform(id){const a=actionById(id);if(!a)return;if(a.escort){beginEscort(a);return;}if(a.puzzle){puzzle(id);return;}execute(id);}

  function beginEscort(a){
    try{
      if(!state.pendingEscort)update(M.escort(state,a.id));
      close();
      const ch=M.chapter(state),start=engine.locate(a.target)||ch.nodes.find(n=>n.id===a.target).at,dest=ch.nodes.find(n=>n.id===a.destination).at;
      escortLive=true;
      const route=[start,[start[0],start[1]+3],[(start[0]+dest[0])/2,2],dest];
      if(!engine.startGuide(a.target,route,()=>{
        escortLive=false;
        try{update(M.act(state,a.id,{position:engine.at()}));toast('Cả nhóm đã tới nơi. Hãy xác nhận bàn giao với người nhận.');}
        catch(e){toast(e.message);}
      })){escortLive=false;toast('Hãy đứng gần người sẽ đi cùng rồi thử lại.');}
      else{subline('Đi cùng và giữ gần nhau. Người dẫn sẽ chờ nếu bạn cần dừng.');}
    }catch(e){toast(e.message);}
  }

  // Gợi ý 3 cấp: nhẹ (chỉ nguyên tắc) → nửa (đầu và cuối) → đầy (cả thứ tự).
  const PUZZLE_HINTS={brace:'Đừng tháo phần cũ trước khi phần mới đã chịu tải.',rope:'Một sợi dây chưa buộc chắc thì chưa mang tải.',rescue:'Không ai kéo trước khi người giữ neo và người nhận đã sẵn sàng.'};
  function puzzle(id){
    const a=actionById(id);if(!a)return;if(X.encounter(state,a)){if(state.settings.workMode==='field')startField(a.id);else workshop(a);return;}const type=a.puzzle;activePuzzle={id,order:[],hint:0,type};
    let html=`<p>${esc(a.text)}</p>`,footer=primary('Xác nhận đối chiếu','solve',`data-id="${id}"`);
    if(['brace','rope','rescue'].includes(type)){
      const steps=type==='brace'?[['support','Kê phần đang chịu tải'],['secure','Giữ chốt và thử độ chắc'],['release','Mới tháo phần cũ']]:type==='rope'?[['anchor','Chọn điểm neo chắc'],['bind','Buộc và bọc chỗ tì'],['test','Thử tải trước khi dùng']]:[['anchor','Xác nhận người giữ neo'],['receive','Chờ người nhận sẵn sàng'],['pull','Phối hợp đưa người qua']];
      activePuzzle.steps=steps;
      const craftBonus=(state.skills?.craft||1)>=2&&type!=='rescue'||(state.skills?.defend||1)>=2&&type==='rescue';
      html+=`<div class="puzzle-stage"><h3>${type==='rescue'?'Một việc cần nhiều người':'Thứ tự làm thay đổi kết quả'}</h3><p>Chọn ba bước theo thứ tự an toàn. Thử lại không mất tài nguyên.${craftBonus?' Kỹ năng của bạn giúp nhận ra bước chịu lực đầu tiên rất rõ.':''}</p><div class="puzzle-steps"><span></span><span></span><span></span></div><div class="choices">${[...steps].reverse().map(c=>`<button class="choice" data-act="puzzle-step" data-value="${c[0]}"><strong>${c[1]}</strong></button>`).join('')}</div><p id="order-feedback"></p></div>`;
      footer='<button class="text-link" data-act="puzzle-hint">Xem thứ tự gợi ý</button>'+footer;
    }else if(type==='patch')html+=`<div class="paper"><small>GHI NHẬN LƯỢT B06</small><p>Lượng đã nhận: <span class="covered" id="paper-patch">Ghi đủ theo lượt</span></p><button class="text-link" data-act="lift-paper">Nâng mép dán để quan sát</button></div><div class="choices"><button class="choice" data-act="puzzle-answer" data-value="amended"><strong>Trang này đã được sửa, chưa biết ai sửa.</strong></button><button class="choice" data-act="puzzle-answer" data-value="guilty"><strong>Dấu sửa tự chứng minh Hanan có tội.</strong></button></div>`;
    else if(type==='count'){const first=state.chapter<4;html+=`<div class="figure-numbers"><div><strong>24</strong><small>Xuất kho G17</small></div>${first?'':`<div><strong>18</strong><small>Nhận ở Galilê</small></div>`}<div><strong>2</strong><small>Hỏng có ghi</small></div></div><label class="field">${first?'Sau khi tách hai bao hỏng, còn bao nhiêu bao cần kiểm đường nhận?':'Còn bao nhiêu bao chưa được giải trình?'}<input id="puzzle-number" type="number" min="0" max="24" inputmode="numeric" placeholder="Điền lượng"></label>`;}
    else if(type==='copy')html+=`<div class="record-grid"><div class="paper"><small>VẬT GỐC / NGUỒN THAY</small><br>G17<br>Bốn bao<br>Sân phụ</div><div class="paper"><small>BẢN ĐỐI CHIẾU</small><br>G17<br>Bốn bao<br>Sân phụ</div></div>${[['lot','Đã đối mã lô'],['amount','Đã đối lượng'],['place','Đã đối nơi nhận']].map(c=>`<label class="check"><input type="checkbox" name="copy-field" value="${c[0]}">${c[1]}</label>`).join('')}<p class="credits">Một bản chép vẫn thuộc cùng nguồn, không thành một nhân chứng độc lập.</p>`;
    else if(type==='redact')html+=`<div class="paper"><small>BẢN LÀM VIỆC · CHƯA TRAO</small><p>Mã lô và lượng nhận được giữ lại để đối chiếu.</p></div><p>Chọn các mục phải bỏ trước khi giao một bản ẩn danh:</p>${[['name','Tên người cung cấp'],['address','Địa chỉ/chỗ người thân ở'],['description','Mô tả nhận diện có thể tìm lại người'],['lot','Mã lô hàng'],['count','Lượng thực nhận']].map(c=>`<label class="check"><input type="checkbox" name="remove-field" value="${c[0]}">${c[1]}</label>`).join('')}`;
    else if(type==='supplies')html+=`<p class="notice">Giữ hai phần cho bữa đang có người chờ. Một phần dự trữ có thể dành cho kế hoạch; không hủy bữa để tăng phần thưởng.</p><label class="field">Số phần dành từ dự trữ<input id="puzzle-reserve" type="number" min="0" max="3" inputmode="numeric" placeholder="0–3"></label>`;
    else if(type==='release'){const r=M.release(state,'public');html+=`<div class="paper"><small>BẢN ĐỌC TRƯỚC SÂN</small>${r.claims.map(c=>`<p><strong>${esc(c.title)}</strong><br>${esc(c.text)}</p>`).join('')}<p>${esc(r.witness)}</p><p>${esc(r.father)}</p></div><label class="check"><input id="release-confirmed" type="checkbox">Chỉ trình phần đã kiểm, trong phạm vi đã được cho dùng.</label>`;}
    else{
      const choices=a.bond?[['limited','Giữ đúng phần đã hứa và để người kia tự chọn.'],['perfect','Làm thay mọi việc rồi coi như đã giải xong.']]:type==='trace'?[['route','Các dấu chỉ một tuyến cần kiểm, chưa xác định ai lấy hàng.'],['culprit','Nút dây giống nhau nên cùng một người làm.']]:type==='consent'?[['agree','Người ấy tự nguyện cho nói trong nhóm đã bố trí.'],['decline','Người ấy chưa đồng ý — xem lại kế hoạch.']]:type==='water'?[['outer','Chọn bờ rộng và kiểm lối vòng trước.'],['weak','Bước lên ván đang lệch để tiết kiệm đường.']]:[['limited','Haddai ký trước; cần tách việc ấy khỏi phần hàng bị chuyển.'],['perfect','Chỉ cần một bản sửa là cha hoàn toàn vô can.']];
      html+=`<div class="choices">${choices.map(c=>`<button class="choice" data-act="puzzle-answer" data-value="${c[0]}"><strong>${c[1]}</strong></button>`).join('')}</div>`;
    }
    const keep=activePuzzle;show('KIỂM CHỨNG BẰNG HÀNH ĐỘNG',html,footer);activePuzzle=keep;heading(a.title);
  }

  function solve(id){
    const a=actionById(id);if(!a||!activePuzzle)return;const type=a.puzzle;let payload={};
    if(['brace','rope','rescue'].includes(type))payload={order:activePuzzle.order};
    else if(type==='count')payload={answer:$('#puzzle-number')?.value};
    else if(type==='supplies')payload={reserve:$('#puzzle-reserve')?.value};
    else if(type==='copy')payload={fields:[...document.querySelectorAll('[name="copy-field"]:checked')].map(i=>i.value)};
    else if(type==='redact')payload={remove:[...document.querySelectorAll('[name="remove-field"]:checked')].map(i=>i.value)};
    else if(type==='release')payload={confirmed:$('#release-confirmed')?.checked};
    else payload={answer:activePuzzle.answer};
    if(type==='consent'&&payload.answer==='decline'){
      try{update(M.chooseAgain(state));close();toast('Lời từ chối được giữ. Bạn có thể chọn nơi trú hoặc bản ẩn danh.');}catch(e){toast(e.message);}
      return;
    }
    execute(id,{puzzle:payload});
  }

  function workshop(a){
    const def=X.encounter(state,a);if(!def)return;
    const draft=M.workshopState(state).drafts[def.id];
    activePuzzle={id:a.id,type:'depth',def,work:draft?.payload||X.empty(X.materialize(state,def)),hint:0,feedback:null};
    renderWorkshop();
  }
  function renderWorkshop(focus=null){
    const keep=activePuzzle;if(!keep||keep.type!=='depth')return;
    const scroll=dialog?.scrollTop||0,d=X.materialize(state,keep.def),content=U.render(d,keep.work,keep.feedback);
    if(dialog?.dataset.workshop===d.id)dialog.querySelector('.dialog-content').innerHTML=content;
    else{
      show('QUAN SÁT · THỬ · HIỂU',content,
        primary('Thao tác trong cảnh','field-start',`data-id="${keep.id}"`)+'<button class="text-link" data-act="depth-hint">Gợi ý từng mức</button><button class="secondary" data-act="depth-reset">Làm lại bố cục</button><button class="secondary" data-act="depth-test">Thử phương án</button>'+primary(d.type==='arrangement'?'Giữ bố cục và tiếp tục':'Thực hiện phương án','depth-commit'),true);
      dialog.dataset.workshop=d.id;dialog.classList.add('depth-dialog');
    }
    heading(d.title);activePuzzle=keep;dialog.scrollTop=scroll;
    if(focus)dialog.querySelector('#'+CSS.escape(focus))?.focus({preventScroll:true});
  }
  function editWorkshop(action,key,value,checked=false,focus=null){
    const p=activePuzzle;if(!p||p.type!=='depth')return;
    p.work=U.reduce(p.work,X.materialize(state,p.def),action,key,value,checked);p.feedback=null;
    state=M.workshopDraft(state,p.id,p.work);save();refresh();
    if(action==='number'){const fb=dialog?.querySelector('#depth-feedback');if(fb){fb.classList.remove('ok');fb.textContent='Đã giữ khoản bạn vừa sửa. Chọn thử phương án để đối chiếu.';}return;}
    renderWorkshop(focus);
  }
  function commitWorkshop(){
    const p=activePuzzle;if(!p||p.type!=='depth')return;
    const result=X.evaluate(state,p.def,p.work);p.feedback=result;
    if(!result.ok){p.feedback={...result,notes:[CRAFT.response(state,p.def,false)]};renderWorkshop();dialog.querySelector('#depth-feedback')?.scrollIntoView({block:'nearest'});return;}
    state=M.workshopDraft(state,p.id,p.work);save();
    if(state.layer){
      checkpointPosition();
      update(M.layerStep(state,p.id,{position:last?.position,work:p.work}));
      pushLog(p.def.title,result.summary);engine?.cue?.('read');close();
      const src=state.layer.kind==='legend'?D.legends[state.layer.id]:D.veils[state.layer.id];
      if(state.layer.step===src.steps.length)layerConclusion();
    }else execute(p.id,{puzzle:{work:p.work}});
  }

  function refreshField(snapshot=null){
    const panel=$('#field-work');if(!panel)return;
    const f=state&&CRAFT.field(state),visible=!!(f&&!title&&!dialog);
    panel.hidden=!visible;document.body.classList.toggle('field-active',visible);if(!visible)return;
    if(snapshot?.position){
      const spots=CRAFT.fieldSpots(state).map(p=>({p,dist:Math.hypot(p.at[0]-snapshot.position[0],p.at[1]-snapshot.position[1])})).filter(x=>x.dist<2.8&&engine.within(x.p.id)).sort((a,b)=>a.dist-b.dist);
      fieldNearest=spots.find(x=>x.p.id===fieldFocus)?.p.id||spots.find(x=>x.p.id===snapshot.nearest?.id)?.p.id||spots[0]?.p.id||null;
    }
    const key=JSON.stringify([f.def.id,f.payload,f.selected,fieldNearest,fieldMessage,fieldTested]);if(key===fieldCache)return;fieldCache=key;
    const top=panel.scrollTop,active=panel.contains(document.activeElement)?document.activeElement:null;
    const focus=active?{domId:active.id,button:active.matches('button[data-act]'),summary:active.tagName==='SUMMARY'?active.parentElement.className:null,...active.dataset}:null;
    const expanded=panel.dataset.encounter===f.def.id?[...panel.querySelectorAll('details[open]')].map(el=>el.className):[];
    panel.dataset.encounter=f.def.id;panel.innerHTML=FUI.render(state,f,{near:fieldNearest,message:fieldMessage,tested:fieldTested});
    for(const el of panel.querySelectorAll('details'))el.open=expanded.includes(el.className);
    panel.scrollTop=top;
    if(focus){
      const target=focus.domId?panel.querySelector('#'+CSS.escape(focus.domId)):focus.button?[...panel.querySelectorAll('button[data-act]')].find(el=>['act','id','delta','value'].every(key=>el.dataset[key]===focus[key])):focus.summary?[...panel.querySelectorAll('details')].find(el=>el.className===focus.summary)?.querySelector('summary'):null;
      target?.focus({preventScroll:true});
    }
  }
  function startField(id){
    try{
      checkpointPosition();const next=M.fieldStart(state,id);next.settings.workMode='field';close();
      fieldMessage='Tới điểm trong cảnh, quan sát rồi nhấn E hoặc nút tương tác. Bạn vẫn có thể mở bảng để đối chiếu.';fieldTested=false;fieldNearest=null;fieldFocus=null;fieldCache='';update(next);engine?.cue?.('read');
    }catch(err){toast(err.message);}
  }
  function operateField(id,extra={}){
    const f=CRAFT.field(state),spot=CRAFT.fieldSpots(state).find(x=>x.id===id);if(!f||!spot)return;
    if(spot.op.kind==='handoff'){finishField();return;}
    if((spot.op.kind==='number'||spot.op.kind==='claim')&&!extra.status&&!extra.delta&&!extra.place){
      fieldNearest=id;fieldFocus=id;fieldMessage=spot.detail;fieldCache='';refreshField();return;
    }
    try{
      const result=M.fieldAct(state,id,{position:last?.position||engine.at(),...extra});fieldNearest=id;fieldFocus=id;fieldMessage=result.message;fieldTested=!result.ok;fieldCache='';
      if(result.ok){
        const kind=spot.op.kind==='route'?'gravel':['inference','dispatch'].includes(f.def.type)?'paper':f.def.type==='ledger'?'ceramic':f.def.id.includes('NET')||f.def.id.includes('RESCUE')||f.def.id.includes('CLOTH')?'rope':'wood';
        fieldMessage=result.message+' '+({wood:'[Tiếng gỗ chịu tải và chạm khẽ]',rope:'[Tiếng sợi dây tì và được giữ]',paper:'[Tiếng giấy sột soạt]',ceramic:'[Tiếng bát và vật đếm chạm khẽ]',gravel:'[Tiếng bước chân trên nền đang khảo sát]'}[kind]);update(result.state);engine.pose(spot.op.kind==='station'?'offer':'tend');FeedbackAudio.material(kind,spot.at);
      }
      else{refreshField();subline(CRAFT.response(state,f.def,false));}
    }catch(err){fieldMessage=err.message;fieldCache='';refreshField();guide(id,true);}
  }
  function finishField(){
    const f=CRAFT.field(state);if(!f)return;
    const point=last?.position||engine.at();if(!point||Math.hypot(point[0]-f.origin[0],point[1]-f.origin[1])>3.4){guide('field:handoff-work',true);return;}
    try{
      checkpointPosition();const next=M.fieldFinish(state,point),line=CRAFT.response(next,f.def,true);fieldMessage='';fieldCache='';fieldNearest=null;update(next);engine.pose('offer');engine.cue('read');pushLog(f.def.voice?.[0]||f.def.title,line);subline(line);toast('Phần việc đã có người nhận. Bạn có thể quan sát lại nơi vừa làm.');
      if(state.finished){ending();return;}if(state.layer){const src=state.layer.kind==='legend'?D.legends[state.layer.id]:D.veils[state.layer.id];if(state.layer.step===src.steps.length)layerConclusion();}
    }catch(err){fieldMessage=err.message;fieldTested=true;fieldCache='';refreshField();subline(CRAFT.response(state,f.def,false));}
  }
  function inspectSceneDetail(id){
    const detail=CRAFT.details(state).find(x=>x.id===id);if(!detail)return;
    try{
      update(M.inspectDetail(state,id,last?.position||engine.at()));const view=CRAFT.stores(state).views?.[id]||{lift:false,light:0};
      show('NHÌN GẦN MỘT CHI TIẾT',`<p>${esc(detail.body)}</p><p class="credits">${detail.owner.startsWith('V')?'Giấc mơ hư cấu; bố cục không cung cấp chứng cứ.':'Quan sát và phần việc được ghi riêng. Chưa tự thêm chứng cứ hoặc quyền dùng lời người khác.'}</p>`,`${detail.kind==='paper'?`<button class="secondary" data-act="detail-lift" data-id="${id}">${view.lift?'Đặt mép dán xuống':'Nâng mép dán'}</button>`:''}<button class="secondary" data-act="detail-light" data-id="${id}">Đổi góc nhìn / ánh sáng</button><button class="primary" data-act="close">Trở lại cảnh</button>`);
      heading(detail.title);dialog.classList.add('inspection-dialog');document.body.classList.add('inspect-active');engine.inspect(detail.at,{height:({paper:.86,cart:.7,roof:1.6,joinery:1.02,net:.2,tracks:.15,lantern:1.15}[detail.kind]??.8),distance:detail.kind==='paper'?2.15:2.7,bearing:detail.kind==='paper'?[0,.3,-.3][view.light]:.6+view.light*.85});
    }catch(err){toast(err.message);}
  }

  function guide(target,autoOpen=false){
    if(title||dialog||!state)return;
    const s=state,a=M.actions(s)[0],plan=W.plan(s);const id=target||(CRAFT.field(s)?plan.targets.find(t=>t.main)?.id:a?.target);if(!id)return;
    const at=engine.locate(id)||plan.targets.find(t=>t.id===id)?.at||(s.layer?a?.at:M.chapter(s).nodes.find(n=>n.id===id)?.at);if(!at)return;
    const arrived=()=>{
      walking=false;
      if(autoOpen&&engine.within(id))interact(id);
      else subline('Đã tới gần. Nhấn E hoặc chạm nút tương tác để tự chọn điều muốn làm.');
    };
    walking=engine.walkTarget?engine.walkTarget(id,arrived,1.6):engine.walk(at,arrived,1.6);
    if(!walking)toast('Hãy đi vòng vật chắn; bản đồ cho biết nơi đang cần tới.');
  }

  function advance(){
    const due=M.dueLegend(state);if(due){layerIntro('legend',due);return;}
    const old=M.chapter(state);const next=D.chapters[state.chapter+1];if(!next)return;
    show('TRƯỚC KHI ĐI TIẾP',`<p>${esc(old.ending[M.quest(state).route]||old.quiet)}</p><div class="notice">Tiến độ đã lưu. Bạn có thể trở lại đọc mọi dấu và quyết định trong sổ.</div>`,primary('Đi tiếp: '+next.title,'advance'));
    heading('Một con đường mới');
  }

  function rest(){
    const ch=M.chapter(state),qs=ch.quietScene;
    state=M.recordQuiet(state);save();refresh();
    engine?.cue?.('read');
    if(qs?.sound)pushLog('Khoảng yên · '+ch.id,qs.body);
    show('KHOẢNG YÊN CỦA MỘT CUỘC ĐỜI',`${qs?.sound?`<span class="sound-cue">${esc(qs.sound)}</span>`:''}<p>${esc(qs?.body||ch.quiet)}</p>${qs?`<p class="notice">${esc(ch.quiet)}</p>`:''}<div class="choices">${ch.legend?`<button class="choice" data-act="layer-intro" data-kind="legend" data-id="${ch.legend}"><strong>${esc(D.legends[ch.legend].title)}</strong><small>Chuyển thể ${esc(D.legends[ch.legend].ref)} · Vai: ${esc(D.legends[ch.legend].witnessRole||'Chứng nhân')} · ${state.legends[ch.legend]?'Đã trải nghiệm':'Có thể chơi hoặc đọc tóm tắt'}</small></button>`:''}${ch.veil?`<button class="choice" data-act="layer-intro" data-kind="veil" data-id="${ch.veil}"><strong>${esc(D.veils[ch.veil].title)}</strong><small>Giấc mơ hư cấu · không cung cấp bằng chứng</small></button>`:''}</div>`,primary('Trở lại bến','close'));
    heading('Một việc nhỏ đủ để nhớ');audio.cue(qs?.sound||'');voiced('narrator',qs?.body||ch.quiet,'Người dẫn chuyện');
  }

  function layerIntro(kind,id){
    const src=kind==='legend'?D.legends[id]:D.veils[id];if(!src)return;
    const required=kind==='legend'&&src.required,allowed=!required||M.legendComplete(state,id)||M.dueLegend(state)===id,disabled=allowed?'':'disabled';
    const att=kind==='legend'?M.attunement(state,id):null;
    show(kind==='legend'?'LEGENDS OF SCRIPTURE':'THE INNER VEIL',`${required?`<span class="tag">CHƯƠNG CHÍNH · HỒI ${src.act}</span>`:''}${kind==='legend'&&src.witnessRole?`<span class="tag ok">VAI CỦA BẠN: ${esc(src.witnessRole.toUpperCase())}</span>`:''}${required?`<p><strong>${esc(src.narrator)}</strong>: “${esc(src.narration)}”</p>`:''}<p>${esc(kind==='legend'?src.summary:src.question)}</p>${att&&att.active.length?`<div class="attune-box"><strong>Sự Thấu Cảm của Người Nghe (Kỹ năng kế thừa)</strong><span>${att.active.map(x=>`${esc(x.name)} Bậc ${'I'.repeat(x.tier)}`).join(' · ')} — hỗ trợ nhịp gắn kết trong cảnh.</span></div>`:''}<p class="notice">${kind==='legend'?`Chuyển thể ${esc(src.ref)} theo kiến trúc Nhân vật Hai tầng: các nhân vật Kinh Thánh giữ nguyên mạch nguồn, bạn đồng hành trong vai chứng nhân đời thường.`:'Giấc mơ hư cấu — ẩn dụ nghệ thuật, không thuộc bản văn Kinh Thánh.'}</p>${required?`<p>${allowed?'Chơi tương tác hoặc đọc đủ bản tóm tắt đều mở cùng một cổng hành trình. Để sau sẽ giữ nguyên điểm dừng.':'Chương mở sau phần chuẩn bị tương ứng và chương chính trước đó.'}</p>`:''}`, `<button class="text-link" data-act="layer-skip" data-kind="${kind}" data-id="${id}" ${disabled}>${required?'Xem bản tóm tắt':'Đọc tóm tắt và bỏ phần chơi'}</button>`+primary(required&&state.legends[id]?.checkpoint?'Tiếp tục chương':'Bước vào','layer-open',`data-kind="${kind}" data-id="${id}" ${disabled}`));
    heading(src.name?src.name+' — '+src.title:src.title);
  }

  function openLayer(kind,id,format=null){
    try{
      checkpointPosition();state=M.openLayer(state,kind,id,format);save();close();
      transition(kind==='legend'?'LEGENDS OF SCRIPTURE':'THE INNER VEIL',W.descriptor(state).name,kind==='legend'?D.legends[id].ref+' · '+(D.legends[id].witnessRole||''):'Giấc mơ hư cấu',()=>{
        launchWorld();
        if(state.layer?.format==='accessible_summary')summary();
      });
    }catch(e){toast(e.message);}
  }

  function layerAction(a){
    if(X.encounter(state,a)){if(state.settings.workMode==='field')startField(a.id);else workshop(a);return;}
    legendOrder=[];legendHint=0;
    const skillTier=a.attune?(state.skills?.[a.attune.skill]||1):1;
    attuneChosen=skillTier>=2;
    if(a.sound)subline(a.sound);
    pushLog(a.reference||a.title,a.text);
    const sacredHeader=a.reference?`<div class="sacred-banner"><div class="sacred-halo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5" stroke-dasharray="2 2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg></div><div class="sacred-meta"><span class="sacred-eyebrow">TẦNG THÁNH · TRÌNH THUẬT KINH THÁNH 100%</span><strong class="sacred-ref">${esc(a.reference)} · DIỄN Ý THEO NGUỒN</strong></div></div>`:'';
    let html=`${sacredHeader}${a.reference?`<span class="tag" style="display:none">${esc(a.reference)} · DIỄN Ý THEO NGUỒN</span>`:''}${a.scene?`<span class="tag">${esc(a.scene)}</span>`:''}${a.sound?`<span class="sound-cue"><svg class="cue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg> ${esc(a.sound)}</span>`:''}<div class="dialog-prose"><p class="scripture-prose">${esc(a.text)}</p></div>`;
    if(a.attune){
      html+=`<div class="attune-box" id="attune-panel"><div class="attune-head"><span class="attune-glyph" aria-hidden="true">✦</span><strong>${esc(a.attune.label)}</strong></div><p style="margin:4px 0">${esc(a.attune.effect)}</p>${skillTier>=2?`<span class="tag ok">ĐÃ KÍCH HOẠT TỰ ĐỘNG TỪ KỸ NĂNG BẬC ${'I'.repeat(skillTier)}</span>`:`<button class="text-link" data-act="layer-attune">Chú tâm thực hiện thao tác thấu cảm này</button>`}</div>`;
    }
    let footer=primary(a.kind==='source'?'Tiếp tục trình thuật':a.title,'layer-step',`data-id="${a.id}"`);
    if(a.kind==='route'){
      html+=`<div class="choices">${a.choices.map(c=>`<button class="choice" data-act="layer-choice" data-id="${a.id}" data-choice="${c[0]}"><span class="choice-icon" aria-hidden="true">↗</span><div class="choice-text"><strong>${esc(c[1])}</strong><small>${esc(c[2])}</small></div></button>`).join('')}</div>`;
      footer='';
    }
    if(a.kind==='order'){
      html+=`<div class="puzzle-stage"><div class="choices">${a.order.map((key,i)=>`<button class="choice" data-act="legend-order" data-value="${key}"><span class="choice-icon" aria-hidden="true">✦</span><div class="choice-text"><strong>${esc(a.orderLabels[i])}</strong></div></button>`).join('')}</div><p id="legend-order-feedback" role="status">Chọn từng thao tác theo thứ tự.</p><button class="text-link" data-act="legend-order-hint">Hướng dẫn thao tác</button></div>`;
    }
    show(a.kind==='source'?'TRÌNH THUẬT KINH THÁNH':a.kind==='discovery'?'KHÁM PHÁ · PHẦN DỰNG CỦA GAME':'CHỨNG NHÂN TRONG CẢNH',html,footer);
    heading(a.title);audio.cue(a.sound||'');voiced('narrator',a.text,a.reference?'Diễn ý theo nguồn · '+a.reference:'Người dẫn chuyện');
  }

  function summary(){
    const l=state.layer,src=l&&D.legends[l.id];if(!src?.required)return;
    if(l.summaryIndex>=src.summaryPages.length){layerConclusion();return;}
    const page=src.summaryPages[l.summaryIndex];
    pushLog(src.name+' · '+page.reference,page.text);
    show('CHƯƠNG CHÍNH · BẢN TÓM TẮT',`<span class="tag">${l.summaryIndex+1} / ${src.summaryPages.length} · ${esc(page.reference)}</span>${src.witnessRole?`<span class="tag ok">${esc(src.witnessRole)}</span>`:''}<p class="source-story">${esc(page.text)}</p><p class="credits">Diễn ý theo phân đoạn nguồn. Không có câu hỏi kiểm tra hoặc thời gian đọc tối thiểu.</p>`,(l.summaryIndex?'<button class="text-link" data-act="summary-prev">Trang trước</button>':'')+primary(l.summaryIndex===src.summaryPages.length-1?'Tới phần kết':'Tiếp tục','summary-next'));
    heading(src.name+' — '+page.title);voiced('narrator',page.text,'Diễn ý theo nguồn · '+page.reference);
  }

  function layerConclusion(){
    const l=state.layer;if(!l)return;
    const src=l.kind==='legend'?D.legends[l.id]:D.veils[l.id];
    const tenet=l.kind==='legend'&&src.tenetId?D.tenets?.[src.tenetId]:null;
    if(l.kind==='veil'){
      show('PHẢN TƯ — KHÔNG PHẢI MỘT ĐÁP ÁN',`<p>${esc(src.question)}</p><div class="choices">${src.answers.map((a,i)=>`<button class="choice" data-act="layer-return" data-reflection="${i}"><strong>${esc(a)}</strong></button>`).join('')}</div>`, '<button class="text-link" data-act="layer-return">Trở lại mà chưa chọn lời phản tư</button>');
      heading(src.title);
    }else{
      show('PHẦN KẾT · NGUỒN VÀ CHUYỂN THỂ',`${tenet?`<div class="notice tenet"><strong>Nguyên lý Chứng Nhân được mở khóa · ${esc(tenet.title)}</strong><br>${esc(tenet.summary)}</div>`:''}<div class="entry"><h3>Nguồn giữ điều gì</h3><p>${esc(src.source)}</p></div><div class="entry"><h3>Game đã thêm gì</h3><p>${esc(src.added)}</p></div>${src.required?`<p><strong>${esc(src.reflection)}</strong></p><label class="field">Phản tư riêng, không bắt buộc<select id="legend-reflection"><option value="">Chưa trả lời</option><option>Tôi muốn giữ câu hỏi này để nghĩ tiếp.</option><option>Tôi muốn trở lại xem người nào đang cần cùng làm.</option><option>Tôi nhớ phần việc của người đi cuối đoàn.</option></select></label><p class="notice">${esc(src.bridge)}</p>`:''}<p><a href="${src.url}" target="_blank" rel="noopener noreferrer">Mở phân đoạn nguồn · ${esc(src.ref)}</a></p>`,primary('Khép chương và trở về','layer-return'));
      heading(src.name?src.name+' — '+src.title:src.title);
    }
  }

  function returnLayer(skip=false,reflectionIndex=null){
    try{
      checkpointPosition();
      const l=state.layer,src=l.kind==='legend'?D.legends[l.id]:D.veils[l.id],reflection=l.kind==='veil'&&reflectionIndex!==null?src.answers[Number(reflectionIndex)]:$('#legend-reflection')?.value||null;
      state=M.closeLayer(state,{skip,reflection});save();close();
      engine?.cue?.(skip?'read':'finish');
      transition('THE MORTAL WORLD',M.chapter(state).title,skip?'Đã giữ điểm dừng. Chương chính chưa kết vẫn cần tiếp tục.':src.bridge||'Câu hỏi còn đó. Dữ kiện của bạn không đổi.',launchWorld);
    }catch(e){toast(e.message);}
  }

  function spineCards(){
    return `<div class="spine-cards">${D.spine.map(id=>{const l=D.legends[id],complete=M.legendComplete(state,id),due=M.dueLegend(state)===id;return `<button class="choice ${complete?'spine-complete':''}" data-act="layer-intro" data-kind="legend" data-id="${id}"><small>HỒI ${l.act} · ${complete?'ĐÃ KHÉP CHƯƠNG':due?'ĐANG CHỜ TIẾP TỤC':'CHUẨN BỊ'}</small><strong>${esc(l.name)} — ${esc(l.title)}</strong><small>${esc(l.ref)} · ${esc(l.witnessRole||'Chứng nhân')}</small></button>`;}).join('')}</div>`;
  }

  function renderEvidenceBoard(){
    const b=state.board||{claim:'P01',audience:'private_group',slots:{P01:[],P02:[],P03:[],P04:[]}};
    const activeId=b.claim||'P01',aud=b.audience||'private_group';
    const evalActive=M.evaluateBoardClaim(state,activeId,aud);
    const col1=Object.keys(D.claims).map(cid=>{
      const ev=M.evaluateBoardClaim(state,cid,aud);
      const badge=ev.verified?'ĐÃ XÁC THỰC':ev.claimReadyInInventory?'ĐỦ NGUỒN — CHỜ GHÉP':'ĐANG THU THẬP';
      return `<button class="board-claim ${cid===activeId?'active':''}" data-act="board-claim" data-id="${cid}"><strong>${cid} · ${esc(D.claims[cid].title)}</strong><small>${badge}</small></button>`;
    }).join('');

    const col2=state.evidence.length
      ?state.evidence.map(eid=>{
        const item=D.evidence[eid],slotted=evalActive.slotted.includes(eid),cb=M.consentBadge(state,eid);
        return `<button class="slot-chip ${slotted?'slotted':''}" data-act="board-slot" data-claim="${activeId}" data-id="${eid}"><span><strong>${eid} · ${esc(item.name)}</strong><br><small>${esc(item.sourceNote||item.lineage)}</small></span><span class="tag ${cb.tone}">${slotted?'ĐÃ ĐẶT':'ĐẶT'}</span></button>`;
      }).join('')+`<button class="text-link" data-act="board-autofill" data-id="${activeId}">Tự động ghép nguồn hợp lệ cho ${activeId}</button>`
      :'<p>Chưa thu thập chứng cứ nào. Hãy quan sát sổ ghi và lắng nghe nhân chứng ngoài bến.</p>';

    const col3=`<div class="audience-switch"><button class="${aud==='private_group'?'active':''}" data-act="board-audience" data-value="private_group">Nhóm đối chiếu kín</button><button class="${aud==='public'?'active':''}" data-act="board-audience" data-value="public">Trước sân kho chung</button></div><p><strong>${esc(evalActive.title)}</strong></p><p>${esc(evalActive.scopeHint)}</p>${evalActive.lineageWarning?`<div class="notice warning">${esc(evalActive.lineageWarning)}</div>`:''}${evalActive.consentWarning?`<div class="notice warning">${esc(evalActive.consentWarning)}</div>`:''}<div class="notice ${evalActive.verified&&!evalActive.lineageWarning&&!evalActive.consentWarning?'tenet':''}"><strong>Trạng thái phát biểu (${aud==='public'?'Công khai sân kho':'Nhóm kín'}):</strong><br>${M.hasClaim(state,activeId,aud)?esc(evalActive.text):'Chưa đủ nguồn độc lập hoặc phạm vi đồng ý cho đối tượng nghe này.'}</div>`;

    return `<div class="board-grid"><div class="board-col"><h3>1. Nhận định cần kiểm</h3>${col1}</div><div class="board-col"><h3>2. Ghép nguồn độc lập (${activeId})</h3>${col2}</div><div class="board-col"><h3>3. Phạm vi đồng ý &amp; Công bố</h3>${col3}</div></div>`;
  }

  function journal(tab='quests'){
    if(!state)return;
    const tabs=[['quests','Hành trình'],['evidence','Dấu vết & Đối chiếu'],['workshop','Việc đã tự làm'],['skills','Kỹ năng & Hành trang'],['people','Con người'],['world','Thế giới đã đổi'],['scripture','Kinh Thánh & Nguyên lý'],['log','Nhật ký thoại']];
    let html=`<div class="tabs">${tabs.map(([id,name])=>`<button class="${id===tab?'active':''}" data-act="journal" data-tab="${id}"><span class="tab-glyph" aria-hidden="true">${TAB_ICONS[id]||''}</span><span>${name}</span></button>`).join('')}</div>`;
    if(tab==='quests'){
      html+=spineCards()+'<h3>Chuẩn bị và tiếp nối</h3>'+D.chapters.slice(0,state.chapter+1).map(ch=>`<div class="entry"><small>${ch.id} · ${esc(D.regions[ch.region].name)}</small><h3>${esc(ch.title)}</h3><p>${esc(state.quests[ch.id].route?ch.ending[state.quests[ch.id].route]||'Đã hoàn tất':'Đang diễn ra')}</p>${state.quests[ch.id].plan?`<span class="tag">${state.quests[ch.id].route?'ĐÃ THỰC HIỆN':'KẾ HOẠCH CHƯA HOÀN TẤT'}</span>`:''}</div>`).join('');
    }
    if(tab==='evidence'){
      html+=renderEvidenceBoard();
      html+='<h3>Hồ sơ chứng cứ đã ghi nhận</h3>';
      html+=state.evidence.length?state.evidence.map(id=>{const cb=M.consentBadge(state,id);return `<div class="entry"><small>${D.evidence[id].kind==='physical'?'VẬT CHỨNG':'LỜI CHỨNG'} · ${D.evidence[id].quest}</small><span class="tag ${cb.tone}">${esc(cb.label)}</span><h3>${id} · ${esc(D.evidence[id].name)}</h3><p>${esc(D.evidence[id].text)}</p></div>`;}).join(''):'<p>Bạn sẽ ghi dấu qua việc quan sát và đối chiếu. Sổ chưa tự biết ai có tội.</p>';
    }
    if(tab==='workshop'){
      const records={...(state.workshop?.records||{})};
      for(const l of [...Object.values(state.legends),...Object.values(state.veils)])Object.assign(records,l.workshop?.records||{});
      if(state.layer)Object.assign(records,state.layer.workshop?.records||{});
      const list=X.all().filter(d=>records[d.id]);
      html+='<p>Những phương án bạn đã thực hiện. Thử và sửa trên bàn không làm mất tài nguyên; dùng gợi ý vẫn có cùng quyền đi tiếp.</p>';
      html+=list.length?list.map(d=>`<div class="entry"><small>${esc(d.owner)} · ${records[d.id].assisted?'ĐÃ DÙNG HƯỚNG DẪN':'ĐÃ TỰ THAO TÁC'}</small><h3>${esc(d.title)}</h3><p>${esc(records[d.id].summary)}</p>${d.callback?`<p class="notice">${esc(d.callback)}</p>`:''}</div>`).join(''):'<p>Chưa có phương án đã thực hiện. Bản nháp ở từng bàn sẽ được giữ khi bạn quay lại.</p>';
    }
    if(tab==='skills'){
      const sk=state.skills||{observe:1,craft:1,commune:1,defend:1};
      html+=`<p>Nguồn lực hiện có: <strong>Tiền công ${state.resources.money}</strong> · <strong>Phần bữa dự trữ ${state.resources.food}</strong> · <strong>Bộ dụng cụ ${state.resources.tools}</strong></p>`;
      html+=`<div class="skills-grid">${Object.values(D.skills).map(k=>{const tier=sk[k.id]||1;return `<div class="skill-card"><div class="card-top"><span class="badge-glyph" aria-hidden="true">${SKILL_ICONS[k.id]||''}</span><div><small>${esc(k.subtitle)}</small><h3>${esc(k.name)} · Bậc ${'I'.repeat(tier)}</h3></div></div><div class="skill-bars"><i class="${tier>=1?'on':''}"></i><i class="${tier>=2?'on':''}"></i><i class="${tier>=3?'on':''}"></i></div><p>${esc(k.tiers[tier-1])}</p><small>${esc(k.attunement)}</small></div>`;}).join('')}</div>`;
      html+=`<h3>Túi hành trang 6 ngăn của Người Chứng</h3><div class="kit-grid">${M.kitStatus(state).map(item=>`<div class="kit-slot"><div class="card-top"><span class="badge-glyph small" aria-hidden="true">${KIT_ICONS[item.id]||''}</span><div><small>NGĂN ${item.slot}</small><strong>${esc(item.name)}</strong></div></div><p style="margin:6px 0 4px">${esc(item.detail)}</p><small>${esc(item.note)}</small></div>`).join('')}</div>`;
    }
    if(tab==='people'){
      html+=['miriam','damar','lea','titus','natan','yosef','rina','mattai','amon','hanan','sela'].map(id=>{const p=D.people[id];if(!p)return '';const b=D.bonds.find(b=>b.person===id);return `<div class="entry"><small>NHÂN VẬT HƯ CẤU · ${esc(p.role)}${p.register?' · '+esc(p.register):''}</small><h3>${esc(p.name)}</h3><p>${esc(p.detail)}</p>${Object.hasOwn(state.relationships,id)?`<span class="tag">${state.relationships[id]>0?'Đã cùng giữ lời':state.relationships[id]<0?'Còn điều rạn nứt':'Đang tìm hiểu nhau'}</span>`:''}${b&&b.from<=state.chapter?`<button class="text-link" data-act="bond" data-id="${b.id}">${esc(b.title)}${state.bonds[b.id]?' · Đã cùng làm':''}</button>`:''}</div>`;}).join('');
    }
    if(tab==='world'){
      const list=M.echoes(state);
      html+=list.length?list.map(e=>`<div class="entry"><small>${esc(D.regions[e.region]?D.regions[e.region].name:e.region)}</small><h3>${esc(e.name)}</h3><p>${esc(e.line)}</p><p>${esc(e.text)}</p></div>`).join(''):'<p>Bến vẫn đang làm việc. Những lựa chọn của bạn sẽ để lại dấu tại đây.</p>';
    }
    if(tab==='scripture'){
      html+=spineCards();
      html+='<h3>Nguyên lý Chứng Nhân (Witness Tenets)</h3>'+M.tenets(state).map(t=>`<div class="entry"><small>${esc(t.subtitle)} · ${t.unlocked?'ĐÃ MỞ KHÓA':'CHƯA TỚI MỐC'}</small><h3>${esc(t.title)}</h3><p>${t.unlocked?esc(t.summary):'Hoàn thành chương Kinh Thánh tương ứng để mở nguyên lý soi sáng hành trình đời thường.'}</p>${t.unlocked?`<p class="notice tenet">${esc(t.resonance)}</p>`:''}</div>`).join('');
      html+='<h3>Trải nghiệm đã lưu</h3>';
      html+=Object.entries(state.legends).map(([id,l])=>`<div class="entry"><small>LEGENDS · ${esc(D.legends[id].ref)} · ${esc(D.legends[id].witnessRole||'Chứng nhân')}</small><h3>${esc(D.legends[id].title)}</h3><p>${esc(D.legends[id].summary)}</p>${l.reflection?`<p><em>Phản tư đã ghi: “${esc(l.reflection)}”</em></p>`:''}<a class="text-link" href="${D.legends[id].url}" target="_blank" rel="noopener noreferrer">Mở phân đoạn nguồn</a></div>`).join('');
      html+=Object.entries(state.veils).map(([id,v])=>`<div class="entry"><small>GIẤC MƠ HƯ CẤU</small><h3>${esc(D.veils[id].title)}</h3><p>${v.reflection?esc(v.reflection):'Chưa chọn một lời phản tư. Game không gán câu trả lời thay bạn.'}</p></div>`).join('');
    }
    if(tab==='log'){
      html+=sessionLog.length?sessionLog.map(item=>`<div class="entry"><small>${esc(item.time)} · ${esc(item.speaker)}</small><p>${esc(item.text)}</p></div>`).join(''):'<p>Các đoạn đối thoại, nhịp nguồn Kinh Thánh và âm thanh không gian trong phiên chơi sẽ được lưu lại tại đây để bạn đọc lại bất cứ lúc nào.</p>';
    }
    show('GIỮ ĐIỀU ĐÃ XẢY RA',html,primary('Trở lại hành trình','close'),true);
    heading('Sổ của '+state.profile.name);
  }

  function map(){
    if(!state)return;
    if(state.layer?.kind==='legend'&&D.legends[state.layer.id].required){legendMap();return;}
    const region=M.chapter(state).region;
    const vistas=[
      {id:'caesarea',name:'Xêdarê & Đường Dọc',file:'land-city.jpg',active:region==='caesarea'||region==='road',note:'Hải cảng đá vôi & kho vận chuyển'},
      {id:'galilee',name:'Biển Hồ Galilê',file:'land-lake.jpg',active:region==='galilee'||region==='ravine',note:'Bờ đá bazan & triền rãnh nước'},
      {id:'jerusalem',name:'Giêrusalem',file:'land-dawn.jpg',active:region==='jerusalem',note:'Phố đá cao & sân đối chiếu chung'}
    ];
    const strip=`<div class="region-vistas">${vistas.map(v=>`<figure class="region-vista ${v.active?'active':''}"><img src="${esc(assetUrl(v.file))}" alt="${esc(v.name)}" loading="lazy"><figcaption><small>${v.active?'VÙNG HIỆN TẠI':'TUYẾN HÀNH TRÌNH'}</small><strong>${esc(v.name)}</strong><span>${esc(v.note)}</span></figcaption></figure>`).join('')}</div>`;
    const exploration=!state.layer&&M.chapter(state).id==='Q01'?`<div class="entry"><h3>Khám phá kho phía tây</h3><p>Đi qua cửa kho, lên cầu thang và nhìn lại bến cảng từ sân mái.</p><div class="choices"><button class="choice" data-act="explore-place" data-id="architecture:store-entry">Đi tới cửa kho</button><button class="choice" data-act="explore-place" data-id="architecture:roof-rack">Đi lên sân mái</button></div></div>`:'';
    show('NHỮNG VÙNG ĐÃ ĐI QUA',`${strip}<div class="map"><svg viewBox="0 0 700 270" role="img" aria-label="Sơ đồ nghệ thuật tuyến Xêdarê, Galilê, Giêrusalem"><path d="M0 0H125Q170 70 123 140T130 270H0" fill="#93ada5"/><path d="M180 130Q290 80 440 58L505 203Q380 240 180 130" fill="none" stroke="#8b774f" stroke-width="2.4" stroke-dasharray="6 6"/><g fill="#586f59" stroke="#f5ebd1" stroke-width="3"><circle cx="180" cy="130" r="${region==='caesarea'||region==='road'?10:6}"/><circle cx="440" cy="58" r="${region==='galilee'||region==='ravine'?10:6}"/><circle cx="505" cy="203" r="${region==='jerusalem'?10:6}"/></g><text x="195" y="122" class="map-label">XÊDARÊ</text><text x="456" y="53" class="map-label">GALILÊ</text><text x="521" y="207" class="map-label">GIÊRUSALEM</text><text x="22" y="30" class="map-label">ĐỊA TRUNG HẢI</text></svg></div><p class="credits">Sơ đồ tuyến được nén và sáng tác, không phải bản đồ tỷ lệ hoặc phục dựng khảo cổ.</p>${exploration}<div class="timeline">${D.chapters.map((ch,i)=>`<div class="chapter-tile ${i===state.chapter?'current':''}"><small>${ch.id} · ${i<state.chapter?'ĐÃ QUA':i===state.chapter?'ĐANG Ở ĐÂY':'CHƯA ĐI TỚI'}</small><strong>${esc(ch.title)}</strong></div>`).join('')}</div>`,primary('Trở lại và chỉ hướng','map-guide'),true);
    heading('Một hành trình qua ba vùng');
  }

  function legendMap(){
    const src=D.legends[state.layer.id],main=src.steps.map((_,i)=>M.layerAt(i,state)),point=a=>[(a[0]+34)*10,(a[1]+34)*5];
    const path=main.map(a=>point(a).join(',')).join(' ');
    show('KHÔNG GIAN CHƯƠNG KINH THÁNH',`<p><strong>Vai của bạn:</strong> ${esc(src.witnessRole||'Chứng nhân Vô danh')} · ${esc(src.mapNote)}</p><div class="map"><svg viewBox="0 0 700 350" role="img" aria-label="Sơ đồ nghệ thuật các mốc trong chương"><polyline points="${path}" fill="none" stroke="#8c7750" stroke-width="3"/>${main.map((at,i)=>{const [x,y]=point(at);return `<circle cx="${x}" cy="${y}" r="${i===state.layer.step?8:4}" fill="${i<state.layer.step?'#617f63':'#b5945c'}"/>`;}).join('')}${src.discoveries.map(d=>{const [x,y]=point(d.at);return `<circle cx="${x}" cy="${y}" r="4" fill="#8cabb0"/>`;}).join('')}</svg></div><p class="credits">Mốc vàng: tuyến trình thuật. Mốc xanh: địa vật khám phá (${state.layer.discovered?.length||0}/${src.discoveries.length}). Sơ đồ nén và sáng tác.</p><div class="entries">${src.discoveries.map(d=>`<div class="entry"><h3>${esc(d.title)}</h3><p>${state.layer.discovered?.includes(d.id)?esc(d.text):'Có thể tìm/quan sát trong không gian chương.'}</p></div>`).join('')}</div>`,primary('Trở lại và chỉ hướng','map-guide'),true);
    heading(src.name+' — '+src.title);
  }

  function bond(id){
    const b=D.bonds.find(b=>b.id===id);if(!b||b.from>state.chapter)return;
    if(state.bonds[id]){show(D.people[b.person].name,`<p>${esc(b.callback)}</p>`,primary('Trở lại','close'));heading(b.title);return;}
    show('MỘT ĐỜI SỐNG NGOÀI VỤ ÁN',`<span class="speaker">${esc(D.people[b.person].name)}</span><p>${esc(b.text)}</p><div class="choices">${b.choices.map(c=>`<button class="choice" data-act="bond-plan" data-id="${id}" data-choice="${c[0]}"><strong>${esc(c[1])}</strong><small>${esc(c[2])}</small></button>`).join('')}</div>`);
    heading(b.title);
  }

  function bondPerform(id,choice){
    try{update(M.startBond(state,id,choice));close();toast('Đã nhận phần việc riêng. Hãy tới bàn làm việc ở lối bên để cùng thực hiện.');guide('bond-work');}
    catch(e){toast(e.message);}
  }

  function settings(){
    if(!state)return;
    const gMode=state.settings.guideMode||'full',gfx=state.settings.graphics||'ultra';
    show('CHƠI THEO CÁCH PHÙ HỢP VỚI BẠN',`<div class="field-row"><label class="field">Chất lượng đồ họa 3D<select id="setting-graphics"><option value="ultra" ${gfx==='ultra'?'selected':''}>Siêu nét (HDR, Bloom &amp; Tán xạ)</option><option value="high" ${gfx==='high'?'selected':''}>Cao (HDR &amp; Ánh sáng vật lý)</option><option value="balanced" ${gfx==='balanced'?'selected':''}>Cân bằng (Ưu tiên tốc độ)</option></select></label><label class="field">Góc nhìn<select id="setting-camera"><option value="third" ${(state.settings.cameraMode||'third')==='third'?'selected':''}>Người thứ ba (quan sát đoàn)</option><option value="first" ${state.settings.cameraMode==='first'?'selected':''}>Người thứ nhất (đắm mình · phím V)</option></select></label><label class="field">Cỡ chữ<select id="setting-text"><option value="1" ${state.settings.text===1?'selected':''}>Vừa</option><option value="1.15" ${state.settings.text===1.15?'selected':''}>Lớn</option><option value="1.3" ${state.settings.text===1.3?'selected':''}>Rất lớn</option></select></label></div><div class="field-row"><label class="field">Mức chỉ dẫn không gian<select id="setting-guide"><option value="full" ${gMode==='full'?'selected':''}>Đầy đủ (La bàn &amp; mọi mốc)</option><option value="objective" ${gMode==='objective'?'selected':''}>Chỉ mục tiêu chính</option><option value="off" ${gMode==='off'?'selected':''}>Tắt mốc nổi (Tự đọc địa vật)</option></select></label><label class="field">Vị trí cần di chuyển cảm ứng<select id="setting-stick"><option value="left" ${(state.settings.stickSide||'left')==='left'?'selected':''}>Bên trái màn hình</option><option value="right" ${state.settings.stickSide==='right'?'selected':''}>Bên phải màn hình</option></select></label></div><label class="field">Chế độ bước nhanh (Shift)<select id="setting-sprint"><option value="hold" ${!state.settings.sprintToggle?'selected':''}>Giữ phím Shift</option><option value="toggle" ${state.settings.sprintToggle?'selected':''}>Bấm bật / tắt</option></select></label><label class="check"><input id="setting-motion" type="checkbox" ${state.settings.motion==='calm'?'checked':''}>Giảm chuyển động khi đổi cảnh</label><label class="check"><input id="setting-comfort" type="checkbox" ${state.settings.comfort!==false?'checked':''}>Chế độ thư thái (giữ nhịp ổn định cao trong Legends)</label><label class="check"><input id="setting-subbg" type="checkbox" ${state.settings.subtitleBg!==false?'checked':''}>Nền tối rõ chữ cho dòng phụ đề và âm thanh mô tả</label>${audioSettings()}<p class="notice">Phím WASD để đi, kéo để nhìn, Q/R xoay góc, V đổi góc nhìn thứ nhất/thứ ba, Z nhìn về mục tiêu, X nhận dấu vết, C đặt lại góc, E tương tác, J mở sổ &amp; bảng đối chiếu. Chạm vào mốc ở xa để tự bước tới.</p>`,primary('Lưu tùy chỉnh','settings-save'));
    heading('Tùy chỉnh & Tiếp cận');
  }

  function audioSettings(){
    const s=WitnessAudio.settings(state.settings);
    const sliders=[['masterVolume','Âm lượng chung'],['ambienceVolume','Môi trường'],['effectsVolume','Bước chân & vật liệu'],['voiceVolume','Giọng nhân vật'],['uiVolume','Thao tác giao diện']];
    return `<fieldset class="audio-settings"><legend>Âm thanh & giọng nói</legend><label class="check"><input id="setting-sound" type="checkbox" ${s.sound?'checked':''}>Bật âm thanh</label><div class="audio-sliders">${sliders.map(([key,label])=>`<label class="audio-slider" for="audio-${key}"><span>${label}</span><input type="range" id="audio-${key}" min="0" max="100" step="1" value="${Math.round(s[key]*100)}"><output for="audio-${key}">${Math.round(s[key]*100)}%</output></label>`).join('')}</div><div class="field-row"><label class="field">Cách đọc thoại<select id="setting-voice-mode"><option value="recorded" ${s.voiceMode==='recorded'?'selected':''}>Giọng thu sẵn theo nhân vật</option><option value="system" ${s.voiceMode==='system'?'selected':''}>Thu sẵn + giọng máy tiếng Việt khi thiếu</option><option value="off" ${s.voiceMode==='off'?'selected':''}>Chỉ đọc phụ đề</option></select></label><label class="field">Khoảng âm lượng<select id="setting-audio-range"><option value="natural" ${s.audioRange==='natural'?'selected':''}>Tự nhiên</option><option value="night" ${s.audioRange==='night'?'selected':''}>Êm cho loa nhỏ / ban đêm</option></select></label></div><label class="check"><input id="setting-auto-voice" type="checkbox" ${s.autoVoice?'checked':''}>Tự đọc khi mở lời thoại</label><label class="check"><input id="setting-audio-spatial" type="checkbox" ${s.audioSpatial?'checked':''}>Âm thanh theo hướng và khoảng cách (nên dùng tai nghe)</label><label class="check"><input id="setting-audio-captions" type="checkbox" ${s.audioCaptions?'checked':''}>Hiện mô tả tiếng động và người đang nói</label><p class="credits">Giọng tạo bằng AI từ lời có sẵn trong game. Phần diễn ý Kinh Thánh dùng người dẫn chuyện. Bạn có thể dừng, nghe lại hoặc đi tiếp bất cứ lúc nào.</p></fieldset>`;
  }

  function pause(){
    if(!state||title)return;
    if(state.layer){
      const src=state.layer.kind==='legend'?D.legends[state.layer.id]:D.veils[state.layer.id];
      show('GIỮ ĐIỂM DỪNG',`<p>${esc(src.title)}${src.witnessRole?' · '+esc(src.witnessRole):''}</p><p>${src.required?'Để sau giữ nguyên tiến độ. Chương chính chưa kết sẽ tiếp tục tại điểm dừng; bản tóm tắt giữ cùng nội dung nguồn.':'Có thể rời phần trải nghiệm tự chọn này bất cứ lúc nào.'}</p>`,primary('Tiếp tục cảnh','layer-resume')+(src.required?`<button class="secondary" data-act="layer-format">${state.layer.format==='accessible_summary'?'Đổi sang phần chơi':'Đổi sang bản tóm tắt'}</button>`:'')+'<button class="secondary" data-act="layer-exit">Để sau và trở về</button>');
      heading('Một khoảng dừng');return;
    }
    show('DI SẢN GIAO ƯỚC',spineCards()+`<div class="choices"><button class="choice" data-act="journal"><strong>Sổ hành trình &amp; Kỹ năng</strong></button><button class="choice" data-act="journal" data-tab="evidence"><strong>Bảng đối chiếu chứng cứ (P01–P04)</strong></button><button class="choice" data-act="quiet-moment"><strong>Khoảng yên của chương này</strong></button><button class="choice" data-act="export"><strong>Xuất bản lưu</strong></button><button class="choice" data-act="import"><strong>Nhập bản lưu</strong></button><button class="choice" data-act="settings"><strong>Tùy chỉnh &amp; Tiếp cận</strong></button><button class="choice" data-act="training-spawn"><strong>Sân luyện gậy tự chọn</strong></button><button class="choice" data-act="title"><strong>Màn hình đầu</strong></button></div>`,primary('Tiếp tục','close'));
    heading('Hành trình của '+state.profile.name);
  }

  const cloudDate=value=>value?new Date(value).toLocaleString('vi-VN'):'Chưa có';
  function cloudDialog(content,actions=''){
    show('HÀNH TRÌNH CỦA BẠN',content,actions+'<button class="secondary" data-act="close">Trở lại game</button>');heading('Tài khoản & Lưu đám mây');
    dialog.dataset.cloud='true';
  }
  async function cloudPanel(){
    const info=cloud.info();
    if(!info.user){
      cloudDialog(`<p>Chơi khách vẫn giữ tiến trình trên trình duyệt này. Đăng nhập để tiếp tục hành trình trên thiết bị khác.</p><p class="notice">${esc(info.message)}</p><p>Đăng nhập bằng tài khoản ChatGPT. Bản chơi khách hiện tại được giữ riêng; bạn có thể đưa nó vào tài khoản sau khi đăng nhập.</p><p class="cloud-privacy">Dữ liệu lưu gồm nhân vật, lựa chọn, điểm dừng và thiết lập game. Game không lưu mật khẩu hay địa chỉ email của bạn.</p>`,location.protocol==='file:'?'<p class="notice">Mở bản web để dùng lưu đám mây.</p>':'<a class="primary" href="/signin-with-chatgpt?return_to=%2F" target="_top">Đăng nhập để lưu đám mây</a><button class="secondary" data-cloud="retry">Kiểm tra kết nối</button>');return;
    }
    cloudDialog('<p role="status">Đang tải các ô lưu…</p>');
    try{
      const account=await cloud.api('/api/account'),current=cloud.info();
      const slots=[1,2,3].map(slot=>{const item=account.slots.find(s=>s.slot===slot);return `<article class="cloud-slot${slot===current.slot?' active':''}"><div><strong>Ô ${slot}${slot===current.slot?' · đang dùng':''}</strong><p>${item&&!item.deleted?esc(item.characterName)+' · '+esc(D.chapters[item.chapter]?.id||''):'Chưa có hành trình'}</p><small>${item?'Phiên bản '+item.revision+' · '+esc(cloudDate(item.updatedAt)):''}</small></div>${slot!==current.slot?`<button class="secondary" data-cloud="slot" data-slot="${slot}">Chuyển sang ô ${slot}</button>`:''}</article>`;}).join('');
      const local=cloud.localState(),copies=cloud.copies();
      const conflict=current.conflict?`<section class="cloud-conflict" role="alert"><h3>Hai thiết bị có tiến trình khác nhau</h3><p>Bản trên máy và bản đám mây đều được giữ. Chọn một bản để tiếp tục; thay bản đám mây sẽ tạo phiên bản mới.</p><button class="primary" data-cloud="remote">Dùng bản đám mây</button><button class="secondary" data-cloud="local-confirm">Dùng bản trên máy</button></section>`:'';
      cloudDialog(`<p class="notice" role="status">${esc(current.message)}</p>${conflict}<form id="cloud-profile" class="cloud-profile"><label for="cloud-name">Tên tài khoản trong game</label><div><input id="cloud-name" name="displayName" maxlength="40" value="${esc(account.profile.display_name)}" autocomplete="nickname"><button class="secondary" data-cloud="profile" type="button">Lưu tên</button></div></form><div class="cloud-slots">${slots}</div><div class="cloud-actions"><button class="primary" data-cloud="sync">Lưu &amp; kiểm tra ngay</button><button class="secondary" data-cloud="history">Lịch sử ô ${current.slot}</button>${cloud.guest()?'<button class="secondary" data-cloud="guest-confirm">Đưa bản chơi khách vào ô này</button>':''}<button class="secondary" data-cloud="export">Tải dữ liệu tài khoản</button>${local?'<button class="secondary" data-cloud="delete-confirm">Xóa ô lưu hiện tại</button>':''}</div>${copies.length?`<details class="cloud-copies"><summary>Bản chờ trên máy (${copies.length})</summary><p>Các bản lưu chưa nhận được xác nhận từ máy chủ được giữ riêng để có thể lấy lại.</p>${copies.map((c,i)=>`<button class="choice" data-cloud="copy-confirm" data-copy="${i}"><strong>${esc((c.pending||c.request?.state)?.profile?.name||'Người Chứng')}</strong><small>${esc(cloudDate(c.updatedAt))}</small></button>`).join('')}</details>`:''}<details class="cloud-privacy"><summary>Lưu trữ và quyền riêng tư</summary><p>Mỗi tài khoản có 3 ô lưu. Mỗi ô giữ 10 phiên bản gần nhất và bản cuối của từng ngày trong 14 ngày (theo UTC). Tiến trình lưu riêng theo tài khoản. Khi mất mạng, bản trên máy được giữ và tự gửi lại khi kết nối phục hồi. Chỉ khi có thông báo «Đã lưu đám mây» thì thiết bị khác mới tải được tiến trình mới nhất.</p><p>Bản chơi khách nằm trong trình duyệt; xóa dữ liệu trình duyệt có thể làm mất bản này. Bạn có thể tải dữ liệu tài khoản và xuất bản JSON riêng từ menu.</p><button class="text-link" data-cloud="erase-confirm">Xóa toàn bộ dữ liệu tài khoản trong game</button></details>`,'<button class="text-link" data-cloud="signout">Đăng xuất</button>');
    }catch(error){cloudDialog(`<p class="notice" role="alert">${esc(error.message)}</p><p>Bản trên máy được giữ. Bạn vẫn có thể tiếp tục chơi và xuất bản lưu từ menu.</p>`,'<button class="primary" data-cloud="retry">Kết nối lại</button><a class="secondary" href="/signin-with-chatgpt?return_to=%2F" target="_top">Đăng nhập lại</a>');}
  }
  let cloudRestoreState=null;
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button[data-cloud]');if(!button||button.disabled)return;event.preventDefault();button.disabled=true;
    try{
      const action=button.dataset.cloud;
      if(action==='profile'){await cloud.api('/api/account',{method:'PUT',body:JSON.stringify({displayName:$('#cloud-name').value})});toast('Đã lưu tên tài khoản.');}
      else if(action==='sync'||action==='retry'){await cloud.refresh();await cloudPanel();}
      else if(action==='slot'){await cloud.switchSlot(Number(button.dataset.slot));await cloudPanel();}
      else if(action==='remote'){await cloud.chooseRemote();await cloudPanel();}
      else if(['local-confirm','guest-confirm','copy-confirm'].includes(action)){
        cloudRestoreState=action==='guest-confirm'?cloud.guest():action==='copy-confirm'?(cloud.copies()[Number(button.dataset.copy)]?.pending||cloud.copies()[Number(button.dataset.copy)]?.request?.state):cloud.localState();
        cloudDialog(`<p>Bạn chọn ${esc(cloudRestoreState?.profile?.name||'bản lưu trên máy')} · ${esc(D.chapters[cloudRestoreState?.chapter]?.title||'')}.</p><p class="notice">Bản này sẽ thay tiến trình đang dùng trong ô ${cloud.info().slot}. Máy chủ giữ phiên bản cũ trong lịch sử khôi phục.</p>`,'<button class="primary" data-cloud="restore">Xác nhận dùng bản này</button><button class="secondary" data-cloud="panel">Hủy</button>');
      }
      else if(action==='restore'){await cloud.chooseLocal(cloudRestoreState);cloudRestoreState=null;await cloudPanel();}
      else if(action==='history'){
        const result=await cloud.api('/api/saves/'+cloud.info().slot+'/history');
        cloudDialog(`<p>Chọn bản cũ để khôi phục thành một phiên bản mới trong ô ${cloud.info().slot}.</p><div class="cloud-history">${result.revisions.map(r=>`<article class="cloud-slot"><div><strong>Phiên bản ${r.revision} · ${esc(r.characterName||'Ô đã xóa')}</strong><p>${esc(cloudDate(r.updatedAt))}${r.deleted?' · Đã xóa':''}</p></div>${!r.deleted?`<button class="secondary" data-cloud="history-select" data-revision="${r.revision}">Xem &amp; khôi phục</button>`:''}</article>`).join('')||'<p>Chưa có lịch sử lưu.</p>'}</div>`,'<button class="secondary" data-cloud="panel">Các ô lưu</button>');
      }
      else if(action==='history-select'){
        const result=await cloud.api('/api/saves/'+cloud.info().slot+'/history/'+button.dataset.revision);cloudRestoreState=result.save.state;
        cloudDialog(`<p>${esc(cloudRestoreState.profile.name)} · ${esc(D.chapters[cloudRestoreState.chapter].title)}</p><p class="notice">Khôi phục phiên bản ${Number(button.dataset.revision)} sẽ tạo bản lưu mới. Tiến trình hiện tại vẫn có trong lịch sử.</p>`,'<button class="primary" data-cloud="restore">Khôi phục bản này</button><button class="secondary" data-cloud="history">Hủy</button>');
      }
      else if(action==='export'){
        const result=await cloud.api('/api/account/export'),url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));
        const a=document.createElement('a');a.href=url;a.download='chung-nhan-tai-khoan-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Đã xuất dữ liệu tài khoản.');
      }
      else if(action==='delete-confirm')cloudDialog('<p class="notice">Xóa ô hiện tại sẽ đưa bạn về màn hình bắt đầu. Bạn vẫn có thể khôi phục phiên bản gần đây trong lịch sử.</p>','<button class="primary" data-cloud="delete">Xóa ô '+cloud.info().slot+'</button><button class="secondary" data-cloud="panel">Hủy</button>');
      else if(action==='delete'){await cloud.removeSlot();await cloudPanel();}
      else if(action==='erase-confirm')cloudDialog('<p class="notice">Xóa tất cả ô lưu, lịch sử, tên tài khoản trong game và bản chờ của tài khoản này trên máy. Thao tác này không thể khôi phục từ game.</p><label for="cloud-erase">Nhập XOA để xác nhận</label><input id="cloud-erase" autocomplete="off">','<button class="primary" data-cloud="erase">Xóa dữ liệu tài khoản</button><button class="secondary" data-cloud="panel">Hủy</button>');
      else if(action==='erase'){if($('#cloud-erase').value!=='XOA')throw Error('Hãy nhập XOA để xác nhận.');await cloud.erase();await cloudPanel();}
      else if(action==='signout'){
        await cloud.flush();if(cloud.info().pending)cloudDialog('<p class="notice">Còn thay đổi đang chờ đồng bộ. Đăng xuất lúc này sẽ giữ bản chờ trên máy, nhưng thiết bị khác chưa nhận được.</p>','<button class="primary" data-cloud="signout-now">Đăng xuất và giữ bản chờ</button><button class="secondary" data-cloud="panel">Ở lại</button>');
        else {await cloud.signOut();window.top.location.href='/signout-with-chatgpt?return_to=%2F';}
      }
      else if(action==='signout-now'){await cloud.signOut();window.top.location.href='/signout-with-chatgpt?return_to=%2F';}
      else if(action==='panel')await cloudPanel();
    }catch(error){toast(error.message);}finally{if(button.isConnected)button.disabled=false;}
  });

  function training(){
    show('TỰ VỆ VÀ BIẾT DỪNG',`<p>Đọc tín hiệu, giữ sức bền, đỡ và tạo khoảng trống. Đây là sân tập hư cấu tùy chọn rèn kỹ năng Tự vệ, không phải nhiệm vụ trừng phạt.</p><div class="choices">${[['steady','Giữ nhịp','Đòn rõ, khoảng nghỉ rộng.'],['pressing','Chịu áp lực','Đối phương tiến nhanh, cần chọn lúc rút.'],['feint','Đọc hướng đòn','Có động tác nhử; đừng đánh chỉ vì thấy người ấy cử động.']].map(c=>`<button class="choice" data-act="trial-start" data-profile="${c[0]}"><strong>${c[1]}</strong><small>${c[2]}</small></button>`).join('')}</div><p class="notice">K đánh, giữ H đỡ, Space né. Nút trên màn hình hỗ trợ cảm ứng. Ra khỏi vòng hoặc chọn dừng sẽ kết thúc buổi tập.</p>`);
    heading('Sân luyện gậy');
  }

  function startTrial(profile){
    close();
    const started=engine.startTrial('training',profile,result=>{
      $('#combat-hud').hidden=true;
      state.flags.practiceCompleted=[...new Set([...(state.flags.practiceCompleted||[]),...(result.won?[profile]:[])])];
      if(result.won&&state.skills){state.skillXp.defend=Math.min(20,(state.skillXp.defend||0)+2);if(state.skillXp.defend>=7)state.skills.defend=3;else if(state.skillXp.defend>=3&&state.skills.defend<2)state.skills.defend=2;}
      save();
      show('MỘT BUỔI TẬP ĐÃ KẾT',`<p>${result.won?'Bạn đã đọc được nhịp và giữ thế đứng điềm tĩnh.':'Bạn chủ động dừng hoặc mất thế đứng. Có thể nghỉ và thử lại, không mất tiến độ truyện.'}</p><p class="notice">Buổi tập không thay chứng cứ, quan hệ hoặc điểm đức tin.</p>`,primary('Trở lại hành trình','close'));
      heading(result.won?'Giữ được khoảng trống':'Biết dừng để thử lại');
    });
    if(!started)toast('Hãy tới gần người hướng dẫn trước khi bắt đầu tập.');
  }

  function about(){
    show('UNSEALED WITNESS · LEGACY OF THE COVENANT',`<figure class="about-hero"><img src="${esc(assetUrl('journey-cover.webp'))}" alt="Chứng nhân trên hành trình"><figcaption>XÊDARÊ — GALILÊ — GIÊRUSALEM · NĂM 58–60 SCN</figcaption></figure><p>Game phiêu lưu – điều tra – nhập vai lấy Kinh Thánh làm trục xương sống theo hồ sơ kiến trúc v3.1: ba hồi Môsê (Xh 14), Đavít (1 Sm 24), Phêrô (Ga 21); 12 chương cầu nối đời thường năm 58–60 SCN, hai Legend mở rộng (Gr 38, Cv 16), bốn giấc mơ Inner Veil và sáu câu chuyện đồng hành.</p><p><strong>Kiến trúc Nhân vật Hai tầng (Dual-Tier Persona):</strong> Các nhân vật Kinh Thánh được giữ nguyên vẹn trong mạch nguồn trang nghiêm; người chơi hóa thân thành Chứng nhân Vô danh ở tầng con người với 4 kỹ năng đời thường (Quan sát, Thủ công, Giao tiếp, Tự vệ), Bảng Đối Chiếu Chứng Cứ 3 cột và 3 Nguyên lý Chứng Nhân.</p><p class="notice">Tuyến đời thường là hư cấu lịch sử. Legends có nguồn Kinh Thánh riêng; các đường đi và tương tác chứng nhân là chuyển thể nghệ thuật. Inner Veil là giấc mơ ẩn dụ, không phải mặc khải mới. Nội dung chưa qua hội đồng chuyên gia duyệt.</p><p class="credits">Tạo hình sử dụng bộ dựng Three.js PBR, HDR Post-Processing và nền nhân vật từ dự án Hành Trình Lời Chúa; diễn giải nghệ thuật, không khẳng định chân dung lịch sử. Phông Lora và Manrope theo SIL Open Font License. Bản 0.5.0 · 31 phần việc trực tiếp / hồ sơ 3.2.</p>`,primary('Trở lại','close'));
    heading('Mỗi cuộc đời đều để lại một lời chứng');
  }

  function ending(){
    if(!state?.finished)return;
    const q=state.quests.Q12,claims=M.allowedClaims(state,'public'),unlockedTenets=M.tenets(state).filter(t=>t.unlocked);
    show('MỘT LỜI CHỨNG KHÔNG THUỘC RIÊNG AI',`${spineCards()}<h3 class="ending-title">${esc(D.chapters[11].ending[q.route])}</h3><p>${esc(q.route==='public'?'Sân kho đã nghe điều nhóm có thể chứng minh. Không mọi mất mát được lấy lại, nhưng việc kiểm lượt sau không còn nằm trọn trong một bàn tay.':q.route==='distributed'?'Những bản ghi được giữ tại nhiều nơi, danh tính nhạy cảm được tách riêng. Sức ép chưa đủ thay cả hệ thống, nhưng một người không còn giữ tất cả.':'Những người gặp nguy hiểm đã có nơi nhận. Một phần hàng chưa chặn kịp và một phần sự thật còn chờ, nhưng người còn sống được tự quyết lần nói sau.')}</p><div class="notice">${claims.includes('P04')?'Có nguồn đối chiếu độc lập về chỉ dẫn chuyển bốn bao.':'Còn phần chỉ dẫn chưa đủ căn cứ để cáo buộc chắc chắn.'} ${state.flags.fatherConcealment?'Phần che giấu về Haddai vẫn cần được sửa trước những người đã nhận bản thiếu.':'Haddai không bị tẩy sạch lỗi đã ký trước, cũng không phải gánh toàn bộ cáo buộc thiếu hàng.'}</div>${unlockedTenets.length?`<div class="notice tenet"><strong>Ba Nguyên lý Chứng Nhân đồng hành tới cuối đường:</strong><br>${unlockedTenets.map(t=>esc(t.title)).join(' · ')}</div>`:''}${M.callbacks(state).slice(-7).map(t=>`<div class="entry"><p>${esc(t)}</p></div>`).join('')}<p><em>“Chú nhớ một buổi con đã dừng tay lại nghe người yếu thế nói hết câu, khi cả bến chỉ muốn thúc cho xong việc.”</em></p>`,primary('Giữ lại bản lưu','export')+'<button class="secondary" data-act="title">Trở về bến mở đầu</button>',true);
    heading('Điều còn lại sau một lời nói');
  }

  function checkpointPosition(){if(state&&last){const key=M.chapter(state).id+'.'+(state.layer?.id||'mortal');state.positions[key]=last.position;const p=engine?.spatial?.();if(p){state.spatialPositions??={};state.spatialPositions[key]={schema:1,...p};}}}
  function exportSave(){
    if(!state)return;checkpointPosition();save();
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='Chung-Nhan-ban-luu-'+new Date().toISOString().slice(0,10)+'.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Đã tạo tệp bản lưu để mang theo.');
  }
  function subline(text){clearTimeout(subTimer);$('#subtitle').textContent=text;subTimer=setTimeout(()=>$('#subtitle').textContent='',6500);}

  // Chạm vào mốc địa vật ở xa sẽ tự động bước tới và mở tương tác khi vào tầm.
  $('.adv-markers')?.addEventListener('click',e=>{
    const marker=e.target.closest('[data-world-target]');
    if(!marker||title||dialog||!state||!engine)return;
    const id=marker.dataset.worldTarget;
    if(!id||engine.within(id))return;
    guide(id,true);
  });

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-act]');if(!button||button.disabled)return;
    const {act,id,choice,kind,value,tab,reflection,person,topic,claim}=button.dataset;
    try{
      if(['new','continue','create','import'].includes(act)&&!cloud.info().ready){toast('Đang kiểm tra bản lưu. Hãy đợi một chút.');return;}
      if(act==='cloud'){if(state&&!title){checkpointPosition();save();}cloudPanel().catch(e=>toast(e.message));}
      else if(act==='close'){FeedbackAudio.page();close();}
      else if(act==='new'){FeedbackAudio.page();newGame();}
      else if(act==='about'){FeedbackAudio.page();about();}
      else if(act==='continue'){FeedbackAudio.page();start();}
      else if(act==='create'){FeedbackAudio.page();const f=new FormData($('#character-form'));state=M.fresh(Object.fromEntries(f.entries()));save();start();}
      else if(act==='interact'){FeedbackAudio.choice();interact();}
      else if(act==='action'){FeedbackAudio.choice();showAction(id);}
      else if(act==='perform'){FeedbackAudio.click();perform(id);}
      else if(act.startsWith('field-')){
        const f=CRAFT.field(state);
        if(act==='field-start')startField(id);
        else if(act==='field-exit'&&f){update(M.fieldStop(state));fieldCache='';subline('Bản nháp được giữ; bạn có thể quay lại điểm cùng làm.');}
        else if(act==='field-board'&&f){const a=f.a;state=M.fieldStop(state);state.settings.workMode='board';save();refresh();workshop(a);}
        else if(act==='field-go'){fieldFocus=id;guide(id,true);}
        else if(act==='field-operate')operateField(id,{place:true});
        else if(act==='field-number')operateField(id,{delta:Number(button.dataset.delta)});
        else if(act==='field-verdict')operateField(id,{status:value});
        else if(act==='field-handoff')finishField();
        else if(act==='field-test'&&f){fieldMessage=CRAFT.response(state,f.def,X.evaluate(state,f.def,f.payload).ok);fieldTested=true;fieldCache='';refreshField();}
        else if((act==='field-back'||act==='field-reset')&&f){update(M.fieldReset(state,act==='field-back'));fieldMessage='Bản nháp đã được sửa. Phần việc ngoài truyện chưa được ghi hoàn tất.';fieldTested=false;fieldCache='';refreshField();}
      }
      else if(act==='detail-lift'||act==='detail-light'){
        const view=CRAFT.stores(state).views?.[id]||{lift:false,light:0};update(M.detailView(state,id,last?.position||engine.at(),act==='detail-lift'?{lift:!view.lift}:{light:(view.light+1)%3}));FeedbackAudio.material('paper');inspectSceneDetail(id);
      }
      else if(act.startsWith('depth-')&&activePuzzle?.type==='depth'){
        FeedbackAudio.click();
        if(act==='depth-commit')commitWorkshop();
        else if(act==='depth-test'){activePuzzle.feedback=X.evaluate(state,activePuzzle.def,activePuzzle.work);renderWorkshop();dialog.querySelector('#depth-feedback')?.scrollIntoView({block:'nearest'});}
        else if(act==='depth-reset'){activePuzzle.work=X.empty(activePuzzle.def);activePuzzle.feedback=null;state=M.workshopDraft(state,activePuzzle.id,activePuzzle.work);save();renderWorkshop();}
        else if(act==='depth-hint'){
          const p=activePuzzle;p.hint=Math.min(3,p.hint+1);
          if(p.hint===3){p.work=X.guided(state,p.def);state=M.workshopDraft(state,p.id,p.work,{assisted:true});save();p.feedback={ok:true,issues:[],notes:['Đã đặt một phương án mẫu. Bạn vẫn tự chọn thực hiện hoặc sửa lại.']};}
          else p.feedback={ok:true,issues:[],notes:['Gợi ý '+p.hint+'/3: '+p.def.hints[p.hint-1]]};
          renderWorkshop();dialog.querySelector('#depth-feedback')?.scrollIntoView({block:'nearest'});
        }else editWorkshop(act,null,value);
      }
      else if(act==='audio-repeat'){const v=button.closest('.voice-controls')._voice;audio.speak(v.person,v.text,{label:v.label});}
      else if(act==='audio-stop')audio.stopVoice();
      else if(act==='person-talk'){FeedbackAudio.choice();showPersonDialog(person);}
      else if(act==='talk-topic'){
        const t=M.talkTopics(state,person).find(x=>x.id===topic);
        if(t){
          update(M.recordTalk(state,person,topic));
          engine?.cue?.('read');
          FeedbackAudio.choice();
          pushLog(D.people[person].name,t.line);
          const banner=speakerBanner(person,D.people[person].role);
          show(D.people[person].role,`${banner}<div class="dialog-prose"><p>${esc(t.line)}</p></div>`,primary('Trở lại cuộc trò chuyện','person-talk',`data-person="${person}"`)+'<button class="secondary" data-act="close">Khép lại</button>');
          heading(t.label);voiced(person,t.line);
        }
      }
      else if(act==='title-sound'){
        if(!state)state=initial();
        state.settings.sound=!state.settings.sound;
        save();
        audioOn=state.settings.sound;audio.configure(state.settings);audio.unlock();
        FeedbackAudio.choice();
        const icon=$('.title-sound-toggle .sound-toggle-icon');
        if(icon)icon.textContent=state.settings.sound?'🔊':'🔇';
        toast(state.settings.sound?'Đã bật âm thanh môi trường':'Đã tắt âm thanh');
      }
      else if(act==='quiet-moment'){close();rest();}
      else if(act==='choose'){
        FeedbackAudio.choice();
        const a=actionById(id);
        if(a?.plan){update(M.act(state,id,{choice}));close();subline('Kế hoạch đã chọn. Hãy thực hiện việc chuẩn bị và bàn giao.');}
        else execute(id,{choice});
      }
      else if(act==='puzzle-step'&&activePuzzle){
        FeedbackAudio.click();
        if(activePuzzle.order.includes(value))return;
        activePuzzle.order.push(value);button.disabled=true;
        [...dialog.querySelectorAll('.puzzle-steps span')].forEach((n,i)=>n.classList.toggle('done',i<activePuzzle.order.length));
        $('#order-feedback').textContent=activePuzzle.order.map(v=>activePuzzle.steps.find(x=>x[0]===v)[1]).join(' → ');
      }
      else if(act==='puzzle-hint'&&activePuzzle){
        FeedbackAudio.click();
        activePuzzle.hint=Math.min(3,(activePuzzle.hint||0)+1);
        const labels=activePuzzle.steps.map(x=>x[1]),feedback=$('#order-feedback');
        if(activePuzzle.hint>=3){activePuzzle.order=activePuzzle.steps.map(x=>x[0]);dialog.querySelectorAll('.puzzle-steps span').forEach(n=>n.classList.add('done'));feedback.textContent=labels.join(' → ');}
        else if(activePuzzle.hint===2)feedback.textContent='Nửa gợi ý: bắt đầu bằng «'+labels[0]+'», kết thúc bằng «'+labels[labels.length-1]+'». Bước giữa còn bạn tự xếp.';
        else feedback.textContent='Gợi ý nhẹ: '+(PUZZLE_HINTS[activePuzzle.type]||'Việc cần người khác sẵn sàng thì để sau.');
        const btn=dialog.querySelector('[data-act="puzzle-hint"]');
        if(btn)btn.textContent=activePuzzle.hint>=3?'Đã hiện đủ thứ tự':'Gợi ý tiếp theo ('+(activePuzzle.hint+1)+'/3)';
      }
      else if(act==='puzzle-answer'&&activePuzzle){
        FeedbackAudio.choice();
        activePuzzle.answer=value;
        dialog.querySelectorAll('[data-act="puzzle-answer"]').forEach(n=>{n.style.borderColor=n===button?'#556f55':'';n.setAttribute('aria-pressed',String(n===button));});
      }
      else if(act==='lift-paper'){$('#paper-patch').classList.toggle('lifted');FeedbackAudio.click();}
      else if(act==='solve'){FeedbackAudio.seal();solve(id);}
      else if(act==='revise'){update(M.chooseAgain(state));close();}
      else if(act==='advance'){
        FeedbackAudio.accomplish();
        const next=M.act(state,'advance');close();state=next;save();
        transition(M.chapter(state).act,M.chapter(state).title,D.regions[M.chapter(state).region].name,()=>{launchWorld();introChapter();});
      }
      else if(act==='journal'){FeedbackAudio.page();journal(tab||'quests');}
      else if(act==='board-claim'){FeedbackAudio.click();state=M.selectBoardClaim(state,id);save();journal('evidence');}
      else if(act==='board-slot'){FeedbackAudio.click();state=M.toggleBoardSlot(state,claim,id);save();journal('evidence');}
      else if(act==='board-autofill'){FeedbackAudio.accomplish();state=M.autoFillClaim(state,id);save();journal('evidence');}
      else if(act==='board-audience'){FeedbackAudio.click();state=M.setBoardAudience(state,value);save();journal('evidence');}
      else if(act==='map')map();
      else if(act==='explore-place'){close();guide(id);}
      else if(act==='map-guide'){close();guide();}
      else if(act==='guide')guide();
      else if(act==='focus-goal')focusGoal();
      else if(act==='pause')pause();
      else if(act==='settings')settings();
      else if(act==='q01-light'){
        if(globalThis.WitnessQ01?.active(state)){
          const yaw=last?.yaw;checkpointPosition();
          state.settings.q01Lighting=state.settings.q01Lighting==='evening'?'day':'evening';save();close();launchWorld();
          if(Number.isFinite(yaw))engine.rotate(yaw+.26);
          toast(state.settings.q01Lighting==='evening'?'Bến cảng buổi tối · đèn dầu đã thắp.':'Bến cảng ban ngày.');
        }
      }
      else if(act==='settings-save'){
        const sound=$('#setting-sound').checked,gfx=$('#setting-graphics')?.value||'ultra';
        state.settings.graphics=['ultra','high','balanced'].includes(gfx)?gfx:'ultra';
        engine?.setQuality?.(state.settings.graphics);
        state.settings.text=Number($('#setting-text').value);
        state.settings.guideMode=$('#setting-guide').value;
        state.settings.stickSide=$('#setting-stick').value;
        state.settings.sprintToggle=$('#setting-sprint').value==='toggle';
        state.settings.motion=$('#setting-motion').checked?'calm':'full';
        state.settings.comfort=$('#setting-comfort').checked;
        state.settings.subtitleBg=$('#setting-subbg').checked;
        state.settings.cameraMode=$('#setting-camera')?.value==='first'?'first':'third';
        applyView();
        audioOn=sound;
        state.settings.sound=sound;
        for(const key of ['masterVolume','ambienceVolume','effectsVolume','voiceVolume','uiVolume'])state.settings[key]=Number($('#audio-'+key).value)/100;
        state.settings.voiceMode=$('#setting-voice-mode').value;state.settings.autoVoice=$('#setting-auto-voice').checked;state.settings.audioCaptions=$('#setting-audio-captions').checked;state.settings.audioSpatial=$('#setting-audio-spatial').checked;state.settings.audioRange=$('#setting-audio-range').value;
        audio.configure(state.settings);audio.unlock();save();close();refresh();
      }
      else if(act==='layer-intro')layerIntro(kind,id);
      else if(act==='layer-open')openLayer(kind,id);
      else if(act==='layer-skip'){
        if(kind==='legend'&&D.legends[id].required)openLayer(kind,id,'accessible_summary');
        else{update(M.closeLayer(M.openLayer(state,kind,id),{skip:true}));close();toast('Đã rời phần tự chọn; không gán phản tư.');}
      }
      else if(act==='layer-attune'){
        attuneChosen=true;
        const box=$('#attune-panel');
        if(box)box.insertAdjacentHTML('beforeend','<span class="tag ok">ĐÃ CHỌN THẤU CẢM CHO BƯỚC NÀY</span>');
        button.remove();
      }
      else if(act==='layer-step'||act==='layer-choice'){
        const a=M.actions(state).find(a=>a.id===id);
        checkpointPosition();
        try{
          update(M.layerStep(state,id,{position:last?.position,acknowledged:a?.kind==='source',choice,order:legendOrder,attune:attuneChosen}));
          engine?.cue?.(a?.kind==='source'?'finish':'read');
          close();
          if(a?.kind==='route')launchWorld();
          const src=state.layer.kind==='legend'?D.legends[state.layer.id]:D.veils[state.layer.id];
          if(state.layer.step===src.steps.length)layerConclusion();
        }catch(err){
          if(a?.kind==='order'){
            state=M.adjustComposure(state,-5);save();refresh();
            legendOrder=[];
            dialog?.querySelectorAll('[data-act="legend-order"]').forEach(b=>{b.disabled=false;});
            const fb=$('#legend-order-feedback');
            if(fb)fb.textContent='Nhịp phối hợp hơi chùng xuống. Đã đặt lại các bước để bạn chọn lại bình tĩnh hoặc dùng gợi ý.';
          }
          toast(err.message);
        }
      }
      else if(act==='legend-order'){
        if(!legendOrder.includes(value))legendOrder.push(value);
        button.disabled=true;
        $('#legend-order-feedback').textContent=legendOrder.map(v=>M.actions(state)[0].orderLabels[M.actions(state)[0].order.indexOf(v)]).join(' → ');
      }
      else if(act==='legend-order-hint'){
        const a=M.actions(state)[0];legendHint=Math.min(3,legendHint+1);const feedback=$('#legend-order-feedback');
        if(legendHint>=3){legendOrder=[...a.order];feedback.textContent=a.orderLabels.join(' → ');}
        else if(legendHint===2)feedback.textContent='Nửa gợi ý: bắt đầu bằng «'+a.orderLabels[0]+'», kết thúc bằng «'+a.orderLabels[a.orderLabels.length-1]+'». Phần giữa còn bạn tự xếp.';
        else feedback.textContent='Gợi ý nhẹ: thao tác nào cần người khác đã sẵn sàng thì đừng làm trước.';
        const btn=dialog.querySelector('[data-act="legend-order-hint"]');
        if(btn)btn.textContent=legendHint>=3?'Đã hiện đủ thứ tự':'Gợi ý tiếp theo ('+(legendHint+1)+'/3)';
      }
      else if(act==='summary-next'||act==='summary-prev'){update(M.summaryStep(state,act==='summary-prev'?-1:1));summary();}
      else if(act==='layer-resume'){close();if(state.layer?.format==='accessible_summary')summary();}
      else if(act==='layer-format'){state=M.switchLayer(state,state.layer.format==='interactive'?'accessible_summary':'interactive');save();close();launchWorld();if(state.layer.format==='accessible_summary')summary();}
      else if(act==='layer-return')returnLayer(false,reflection??null);
      else if(act==='layer-exit')returnLayer(true);
      else if(act==='bond')bond(id);
      else if(act==='bond-plan')bondPerform(id,choice);
      else if(act==='bond-complete'){update(M.bond(state,id,choice));show(D.people[D.bonds.find(b=>b.id===id).person].name,`<p>${esc(D.bonds.find(b=>b.id===id).callback)}</p>`,primary('Trở lại','close'));heading('Một phần việc đã cùng làm');}
      else if(act==='export')exportSave();
      else if(act==='import')$('#import-file').click();
      else if(act==='title'){checkpointPosition();save();close();title=true;launchWorld();}
      else if(act==='retry'){close();launchWorld();}
      else if(act==='training-spawn'){state.flags.trainingSpawned=true;save();close();refresh();guide('training');}
      else if(act==='trial-start')startTrial(button.dataset.profile);
      else if(act==='strike')engine.action('strike');
      else if(act==='dodge')engine.action('dodge');
      else if(act==='stop-trial'){engine.stopTrial();$('#combat-hud').hidden=true;toast('Đã dừng tập. Tiến độ câu chuyện không đổi.');}
      else if(act==='sense')sense();
      else if(act==='recenter')engine.recenter();
      else if(act==='zoom-in'||act==='zoom-out')$('#world canvas')?.dispatchEvent(new WheelEvent('wheel',{deltaY:act==='zoom-in'?-130:130,cancelable:true}));
    }catch(e){toast(e.message);}
  });

  document.addEventListener('change',e=>{
    const input=e.target;if(input.matches?.('[data-field-select]')){try{update(M.fieldSelect(state,input.value));fieldCache='';refreshField();}catch(err){toast(err.message);}return;}if(!input.matches?.('[data-depth-input]')||activePuzzle?.type!=='depth')return;
    editWorkshop(input.dataset.kind,input.dataset.key,input.value,input.checked,input.id||null);
  });
  document.addEventListener('input',e=>{
    const input=e.target;if(input.id?.startsWith('audio-')){const out=input.parentElement.querySelector('output');if(out)out.textContent=input.value+'%';return;}if(input.matches?.('[data-depth-input][data-kind="number"]')&&activePuzzle?.type==='depth')editWorkshop('number',input.dataset.key,input.value);
  });
  $('#import-file').addEventListener('change',async e=>{
    const file=e.target.files[0];e.target.value='';if(!file)return;
    try{
      if(file.size>2000000)throw new Error('Tệp bản lưu quá lớn.');
      const imported=M.restore(await file.text());
      show('BẢN LƯU ĐÃ KIỂM TRA',`<p>${esc(imported.profile.name)} · ${esc(D.chapters[imported.chapter].title)}</p><p class="notice">Tiếp tục với bản này sẽ thay bản đang hoạt động. Bạn có thể xuất bản đang có trước.</p>`,primary('Dùng bản đã nhập','confirm-import')+(state?'<button class="secondary" data-act="export">Xuất bản hiện tại</button>':''));
      heading('Nhập hành trình');
      const b=dialog.querySelector('[data-act="confirm-import"]');
      b.addEventListener('click',()=>{state=imported;save();start();});
    }catch(err){toast(err.message);}
  });

  document.addEventListener('pointerdown',e=>{if(e.target.closest('[data-act="guard"]')){e.preventDefault();engine?.action('guard',true);}});
  document.addEventListener('pointerup',()=>engine?.action('guard',false));
  document.addEventListener('keydown',e=>{if(e.target.matches?.('input,select,textarea'))return;if(e.repeat||e.metaKey||e.ctrlKey||e.altKey)return;if(e.key==='x'||e.key==='X')sense();});
  window.addEventListener('pagehide',()=>{audio.visibility(true);checkpointPosition();save();cloud.flush({keepalive:true});});
  window.addEventListener('pageshow',()=>audio.visibility(document.hidden));
  document.addEventListener('pointerdown',()=>{if(state?.settings.sound)audio.unlock();},{capture:true});
  document.addEventListener('keydown',()=>{if(state?.settings.sound)audio.unlock();},{capture:true});
  document.addEventListener('visibilitychange',()=>{audio.visibility(document.hidden);if(document.hidden){checkpointPosition();save();cloud.flush({keepalive:true});stopMotion();}else if(!title&&!dialog)controls?.enable(true);});
  window.addEventListener('online',()=>cloud.refresh());
  window.addEventListener('focus',()=>{if(cloud.info().ready)cloud.refresh();});

  launchWorld();
  cloud.init();
  if(loaded.migrated)toast('Đã giữ tiến độ đời thường từ v2. Ba chương chính cần tiếp nhận theo nội dung mới; bản lưu cũ vẫn còn.');
  if(loaded.recovered)toast('Đã khôi phục từ bản dự phòng trên máy.');
  if(loaded.corrupt)toast('Bản lưu không đọc được. Tệp cũ được giữ để bạn có thể kiểm tra hoặc nhập lại.');
  if('serviceWorker' in navigator&&location.protocol!=='file:'&&!['127.0.0.1','localhost'].includes(location.hostname))navigator.serviceWorker.register('./witness-sw.js').catch(()=>{});
})();
