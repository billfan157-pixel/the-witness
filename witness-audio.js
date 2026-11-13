/* One mixer for the world, material foley, interface and dialogue. No live generation. */
(function(root){
  'use strict';
  const DEFAULTS={sound:false,masterVolume:.8,ambienceVolume:.55,effectsVolume:.75,voiceVolume:.95,uiVolume:.4,voiceMode:'recorded',autoVoice:true,audioCaptions:true,audioRange:'natural',audioSpatial:true};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const cleanText=text=>String(text||'').normalize('NFC').replace(/[“”‘’]/g,'').replace(/\s+/g,' ').trim();
  function settings(raw={}){
    const s={...DEFAULTS};
    for(const k of ['sound','autoVoice','audioCaptions','audioSpatial'])if(typeof raw[k]==='boolean')s[k]=raw[k];
    for(const k of ['masterVolume','ambienceVolume','effectsVolume','voiceVolume','uiVolume'])if(typeof raw[k]==='number'&&Number.isFinite(raw[k]))s[k]=clamp(raw[k],0,1);
    if(['recorded','system','off'].includes(raw.voiceMode))s.voiceMode=raw.voiceMode;
    if(['natural','night'].includes(raw.audioRange))s.audioRange=raw.audioRange;
    return s;
  }
  const soundNames={wood:'Gỗ chịu tải, thớ gỗ khẽ dịch',rope:'Sợi dây gai cọ và siết tải',paper:'Giấy cói sột soạt',ceramic:'Bát đất chạm mặt gỗ',cloth:'Vải lanh cọ nhẹ',oar:'Mái chèo khua nước',splash:'Nước vỗ sỏi',metal:'Then sắt chạm khẽ',fire:'Than hồng lép bép',harbor:'Sóng vỗ kè cảng',lake:'Nước hồ vỗ nhẹ ven bờ',wind:'Gió lùa qua cỏ khô',cave:'Giọt nước dội trong vòm đá',flood:'Nước chảy dưới khe đá',courtyard:'Gió chiều trong sân đá','wood-strain':'Tiếng trục gỗ chịu tải cọt kẹt','wood-creak':'Thớ gỗ cựa mình dưới sức nặng','wood-jolt':'Thùng xe giật chấn động, gỗ kêu răng rắc','wood-thud':'Vật nặng chạm đất chắc chắn','wood-brace':'Đòn kê ăn khớp vững chãi dưới gầm trục','wood-slide':'Chốt gỗ trượt nhẹ ra khỏi khớp','shoulder-test':'Sức vai tì thử vào thùng xe','mud-squelch':'Tiếng lội bùn đất sét nhão','gravel-crunch':'Tiếng sỏi nén lạo xạo ven tường','stone-steps':'Tiếng bước chân gõ cộc trên bậc đá','rope-friction':'Tiếng dây gai siết cọ vào thớ đá','cart-rumble':'Tiếng trục xe gỗ lăn bánh êm đều trên đường','cart-block':'Tiếng bánh xe va kẹt vào vách đá hẹp'};
  const cast={natan:{rate:.9,pitch:.88},miriam:{rate:.96,pitch:1.04},damar:{rate:.92,pitch:.86},lea:{rate:.97,pitch:1.08},titus:{rate:.96,pitch:.9},yosef:{rate:.94,pitch:1},rina:{rate:.94,pitch:.97},mattai:{rate:.9,pitch:.9},amon:{rate:.91,pitch:.92},hanan:{rate:.99,pitch:.94},sela:{rate:1.01,pitch:1.08},narrator:{rate:.93,pitch:1}};
  function profile(state){
    const id=state?.layer?.id||root.WitnessContent?.chapters?.[state?.chapter||0]?.region||'caesarea';
    const bed=(sound,gain,at=null,ref=8)=>({sound,gain,at,ref});
    const profiles={
      caesarea:{surface:'stone',decay:.28,beds:[bed('harbor',.58,[0,.2,-26],16),bed('wind',.13)]},
      road:{surface:'gravel',decay:.18,beds:[bed('wind',.5)]},
      galilee:{surface:'gravel',decay:.22,beds:[bed('lake',.65,[0,.1,-25],14),bed('wind',.1)]},
      ravine:{surface:'gravel',decay:.55,beds:[bed('flood',.65,[20,.1,-4],8),bed('wind',.28)]},
      jerusalem:{surface:'stone',decay:.65,beds:[bed('courtyard',.55)]},
      L01:{surface:'sand',decay:.18,beds:[bed('wind',.62),bed('harbor',.32,[0,.1,-30],14)]},
      L02:{surface:'stone',decay:1.45,beds:[bed('cave',.62)]},
      L03:{surface:'sand',decay:1.1,beds:[bed('cave',.4),bed('wind',.15,[0,10,-3],8)]},
      L04:{surface:'gravel',decay:.22,beds:[bed('lake',.64,[0,.1,-17],14),bed('fire',.24,[5.2,.3,2.1],1.8)]},
      L05:{surface:'stone',decay:.95,beds:[bed('cave',.22),bed('wind',.12)]}
    };
    if(state?.flags?.q01Campaign&&state.chapter===0&&!state.layer){const q=state.sceneProgress.Q01,night=q.phase==='night',evening=q.phase==='evening',dawn=q.phase==='dawn',rescue=q.beat===3||q.beat===4,roof=q.beat===5;
      const decay=night?.28:rescue?.44:evening?.34:.38;
      const harborGain=night?.26:evening?.38:dawn?.48:.52;
      const windGain=roof?.24:rescue?.18:night?.05:evening?.09:.13;
      return {id:'caesarea',variant:'q01:'+q.phase+':'+q.beat,surface:'stone',decay,beds:[bed('harbor',harborGain,[-6,.1,-28],14),bed('wind',windGain),...(rescue?[bed('fire',q.beat===4?.52:.44,[-25.5,1,-9.8],3.4)]:[]),...(night?[bed('q01-quiet-score',.18)]:[])]};}
    return {id,...(profiles[id]||{surface:'stone',decay:.65,beds:[bed('wind',.16)]})};
  }
  function surfaceAt(state,point){
    const p=profile(state),[x,z]=point||[0,0];
    if(state?.flags?.q01Campaign&&state.chapter===0&&!state.layer){const y=state.spatialPositions?.['Q01.mortal']?.y||0;return (x>=-7.4&&x<=-4.6&&z<-23.5)||(y>2.3&&y<2.9)?'wood':'stone';}
    // These rectangles follow the visible decks in WitnessWorld.decorate.
    if(p.id==='L04'&&x>=-17.4&&x<=-6.2&&z>=-17.8&&z<=-4.2)return 'wood';
    if(p.id==='caesarea'&&x>=11&&x<=23&&z>=-28&&z<=-20)return 'wood';
    if(p.id==='galilee'&&x>=4.8&&x<=7.2&&z>=-25.75&&z<=-19.25)return 'wood';
    if(!state?.layer&&state?.flags?.bridge&&x>=-4&&x<=0&&z>=-1.95&&z<=-.05)return 'wood';
    if(p.id==='ravine'&&x>=11&&x<=15&&z>=-9.5&&z<=-6.5)return 'wood';
    return p.surface;
  }
  function recorded(person,text){
    const key=cleanText(text);
    return (root.WitnessAudioLibrary?.voices||[]).find(v=>v.person===person&&cleanText(v.text)===key)||null;
  }
  function create(options={}){
    let cfg=settings(),ctx=null,buses={},master,compressor,limiter,analyser,scene=null,state=null,mode='title',hidden=false,unlocked=false,revision=0,voiceRevision=0,voiceSource=null,voiceTimer=null,voiceRequest=null,voiceInfo=null,ducked=false;
    let previous=null,stride=0,foot=0,lastCaption=0,activeCaption='',lastTick=0,cacheBytes=0,nextWork=0;
    const cache=new Map(),inflight=new Map(),active=new Set(),beds=new Set(),lastTake=new Map(),cooldown=new Map(),reverbs=new Map(),failures=new Set();
    const stats={played:0,footsteps:0,voiceStarts:0,missing:0,steals:0,peak:0};
    const library=()=>root.WitnessAudioLibrary||{sounds:{},voices:[]};
    const time=()=>root.performance?.now?.()||Date.now();
    function ramp(param,value,seconds=.12){if(!ctx||!param)return;param.cancelScheduledValues(ctx.currentTime);param.setTargetAtTime(value,ctx.currentTime,Math.max(.006,seconds/3));}
    function emitVoice(info){voiceInfo=info;options.onVoice?.(info);}
    function caption(text,priority=false){
      if(!cfg.audioCaptions||hidden||!text)return;
      const now=time();if(!priority&&now-lastCaption<3500)return;
      lastCaption=now;activeCaption=text;options.onCaption?.(text);
    }
    function mix(){
      if(!ctx)return;
      const enabled=cfg.sound&&unlocked&&!hidden;
      ramp(master.gain,enabled?cfg.masterVolume:0,.08);
      const world=mode==='title'||mode==='menu'?0:mode==='dialogue'?.32:1;
      ramp(buses.ambience.gain,cfg.ambienceVolume*world*(ducked?.4:1),.32);
      ramp(buses.effects.gain,cfg.effectsVolume*(mode==='world'?1:.55)*(ducked?.6:1));
      ramp(buses.voice.gain,cfg.voiceVolume);
      ramp(buses.ui.gain,cfg.uiVolume);
      compressor.threshold.value=cfg.audioRange==='night'?-24:-12;
      compressor.ratio.value=cfg.audioRange==='night'?4:1.5;
    }
    function ensure(){
      if(ctx)return ctx;
      const AC=root.AudioContext||root.webkitAudioContext;if(!AC)return null;
      ctx=new AC({latencyHint:'interactive'});master=ctx.createGain();master.gain.value=0;
      compressor=ctx.createDynamicsCompressor();compressor.knee.value=12;compressor.attack.value=.012;compressor.release.value=.22;
      limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-3;limiter.knee.value=0;limiter.ratio.value=20;limiter.attack.value=.003;limiter.release.value=.12;
      analyser=ctx.createAnalyser();analyser.fftSize=512;
      for(const k of ['ambience','effects','voice','ui']){buses[k]=ctx.createGain();buses[k].gain.value=0;buses[k].connect(compressor);}
      compressor.connect(master).connect(limiter).connect(analyser).connect(ctx.destination);mix();return ctx;
    }
    async function unlock(){
      if(!cfg.sound||hidden)return false;
      const c=ensure();if(!c)return false;
      try{await c.resume();unlocked=c.state==='running';mix();if(unlocked&&!beds.size&&mode!=='title'&&mode!=='menu')startBeds();return unlocked;}catch{return false;}
    }
    function drop(item,fade=.035){
      if(!item||item.stopped)return;item.stopped=true;
      if(ctx){ramp(item.gain.gain,0,fade);try{item.source.stop(ctx.currentTime+fade+.015);}catch{}}
      active.delete(item);beds.delete(item);
    }
    function clearWorld(){revision++;for(const item of [...active])if(item.bus!=='voice'&&item.bus!=='ui')drop(item,.22);beds.clear();previous=null;stride=0;}
    function take(id){
      const entries=library().sounds[id]?.files||[];if(!entries.length)return null;
      let n=Math.floor(Math.random()*entries.length);if(entries.length>1&&n===lastTake.get(id))n=(n+1+Math.floor(Math.random()*(entries.length-1)))%entries.length;
      lastTake.set(id,n);return entries[n];
    }
    async function buffer(file){
      if(cache.has(file)){const item=cache.get(file);cache.delete(file);cache.set(file,item);return item.buffer;}
      if(inflight.has(file))return inflight.get(file);
      const job=(async()=>{const url=root.WitnessAudioAssets?.[file]||'./'+file;const res=await fetch(url);if(!res.ok)throw Error('Audio '+res.status);const result=await ctx.decodeAudioData(await res.arrayBuffer());
        const bytes=result.length*result.numberOfChannels*4;
        while(cacheBytes+bytes>24*1024*1024&&cache.size){const key=cache.keys().next().value;cacheBytes-=cache.get(key).bytes;cache.delete(key);}
        cache.set(file,{buffer:result,bytes});cacheBytes+=bytes;return result;
      })();inflight.set(file,job);
      try{return await job;}finally{inflight.delete(file);}
    }
    function reverb(bus){
      if(!scene||!ctx)return null;
      const key=bus+':'+scene.decay;if(reverbs.has(key))return reverbs.get(key);
      const conv=ctx.createConvolver(),seconds=scene.decay,size=Math.ceil(ctx.sampleRate*seconds),ir=ctx.createBuffer(2,size,ctx.sampleRate);
      let seed=73421;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
      for(let ch=0;ch<2;ch++){const data=ir.getChannelData(ch);let low=0;for(let i=0;i<size;i++){low=.65*low+.35*rnd();data[i]=low*Math.pow(1-i/size,2.8)*(i>ctx.sampleRate*.018?1:0);}}
      conv.buffer=ir;conv.connect(buses[bus]);reverbs.set(key,conv);return conv;
    }
    async function play(file,opt={}){
      if(!cfg.sound||!unlocked||hidden||!ctx||!file)return null;
      const bus=opt.bus||'effects',rev=revision,token=voiceRevision;
      try{
        const data=await buffer(file);
        if(!cfg.sound||hidden||!unlocked||rev!==revision||(bus==='voice'&&token!==voiceRevision))return null;
        if(active.size>=28){const old=[...active].find(x=>!x.loop&&x.bus!=='voice'&&x.bus!=='ui');if(old){drop(old);stats.steals++;}else if(bus!=='voice')return null;}
        const src=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();src.buffer=data;src.loop=!!opt.loop;src.playbackRate.value=opt.rate||1;filter.type='lowpass';filter.frequency.value=opt.lowpass||18000;
        const nodes=[src,filter,gain];src.connect(filter).connect(gain);
        const level=clamp(opt.gain??.5,0,1);gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(level,ctx.currentTime+(opt.loop?.7:.015));
        let end=gain;
        if(opt.at&&cfg.audioSpatial){const p=ctx.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=opt.ref||2;p.maxDistance=90;p.rolloffFactor=.85;p.positionX.value=opt.at[0];p.positionY.value=opt.at[1];p.positionZ.value=opt.at[2];gain.connect(p);nodes.push(p);end=p;}
        end.connect(buses[bus]);
        if(bus==='effects'||bus==='voice'){const conv=reverb(bus);if(conv){const send=ctx.createGain();send.gain.value=bus==='voice'?.025:scene.decay>.8?.2:.055;end.connect(send).connect(conv);nodes.push(send);}}
        const item={source:src,gain,bus,loop:!!opt.loop,nodes,stopped:false};active.add(item);if(item.loop)beds.add(item);
        src.onended=()=>{active.delete(item);beds.delete(item);for(const n of nodes)try{n.disconnect();}catch{}opt.onended?.();};
        const offset=opt.loop?Math.random()*Math.max(0,data.duration-.1):clamp(opt.start||0,0,Math.max(0,data.duration-.01));
        if(!opt.loop&&Number.isFinite(opt.end))src.start(0,offset,Math.max(.01,Math.min(data.duration,opt.end)-offset));else src.start(0,offset);stats.played++;return item;
      }catch(e){if(!failures.has(file)){failures.add(file);stats.missing++;}return null;}
    }
    async function startBeds(){
      if(!scene||!cfg.sound||!unlocked||hidden||mode==='title'||mode==='menu')return;
      // Reserve an epoch while decoding, so status ticks cannot start duplicate beds.
      const rev=revision;if(startBeds.pending===rev)return;startBeds.pending=rev;
      for(const b of scene.beds){if(rev!==revision)return;const file=take(b.sound);if(file)await play(file,{bus:'ambience',loop:true,gain:b.gain,at:b.at,ref:b.ref});}
      if(startBeds.pending===rev)startBeds.pending=null;
    }
    function setScene(next){
      state=next;const p=profile(next),key=p.id+':'+(p.variant||(next?.layer?.step>=7&&p.id==='L01'?'passage':'base'));
      if(scene?.key===key)return;
      clearWorld();stopVoice();for(const n of reverbs.values())n.disconnect();reverbs.clear();scene={...p,key};nextWork=0;
      if(p.id==='L01'&&next?.layer?.step>=7)scene.beds=[{sound:'wind',gain:.48},{sound:'flood',gain:.32,at:[-28,.3,-18],ref:10},{sound:'flood',gain:.32,at:[28,.3,-18],ref:10}];
      mix();startBeds();
    }
    function configure(raw){
      const old=cfg;cfg=settings(raw);if(!cfg.sound||cfg.voiceMode==='off'||cfg.voiceVolume===0)stopVoice();
      if(old.audioSpatial!==cfg.audioSpatial){clearWorld();startBeds();}
      if(!cfg.sound){clearWorld();if(ctx)ctx.suspend().catch(()=>{});unlocked=false;}mix();return {...cfg};
    }
    function setMode(next){
      if(mode===next)return;mode=next;previous=null;stride=0;
      if(next==='title'||next==='menu'){stopVoice();clearWorld();}else if(!beds.size)startBeds();mix();
    }
    function duck(on){ducked=on;mix();}
    function stopVoice(){
      voiceRevision++;clearTimeout(voiceTimer);voiceTimer=null;
      const old=voiceSource;voiceSource=null;if(old)drop(old,.025);
      if(root.speechSynthesis?.speaking||root.speechSynthesis?.pending)root.speechSynthesis.cancel();
      duck(false);emitVoice(null);
    }
    function systemVoices(){return (root.speechSynthesis?.getVoices()||[]).filter(v=>/^vi(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>Number(b.localService)-Number(a.localService)||a.name.localeCompare(b.name));}
    async function speak(person,text,opt={}){
      stopVoice();voiceRequest={person,text,opt};
      if(!cfg.sound||cfg.voiceMode==='off'||cfg.voiceVolume<=0||hidden||!cleanText(text))return false;
      if(!await unlock())return false;
      const token=voiceRevision,entry=recorded(person,text),name=opt.label||root.WitnessContent?.people?.[person]?.name||'Người dẫn chuyện';
      const finish=()=>{if(token!==voiceRevision)return;voiceSource=null;clearTimeout(voiceTimer);duck(false);emitVoice(null);options.onSpeechEnd?.();};
      if(entry){
        duck(true);emitVoice({person,name,status:'loading',kind:'recorded',text});
        const source=await play(entry.file,{bus:'voice',gain:.83,start:entry.start,end:entry.end,onended:finish});
        if(token!==voiceRevision){drop(source);return false;}
        if(source){voiceSource=source;stats.voiceStarts++;emitVoice({person,name,status:'playing',kind:'recorded',text});caption(name+': '+text,true);return true;}
      }
      if(token!==voiceRevision)return false;
      const voices=cfg.voiceMode==='system'?systemVoices():[];
      if(!voices.length){duck(false);emitVoice({person,name,status:'unavailable',kind:cfg.voiceMode==='system'?'no-vietnamese':'no-recording',text});return false;}
      const u=new root.SpeechSynthesisUtterance(cleanText(text)),p=cast[person]||cast.narrator;u.lang='vi-VN';u.voice=voices[person==='miriam'||person==='lea'||person==='rina'?Math.min(1,voices.length-1):0];u.rate=p.rate;u.pitch=p.pitch;u.volume=cfg.masterVolume*cfg.voiceVolume;
      u.onstart=()=>{if(token!==voiceRevision)return;stats.voiceStarts++;duck(true);emitVoice({person,name,status:'playing',kind:'system',text});caption(name+': '+text,true);};u.onend=finish;u.onerror=finish;
      root.speechSynthesis.speak(u);voiceTimer=setTimeout(()=>{if(token===voiceRevision)stopVoice();},Math.max(18000,cleanText(text).length*160));return true;
    }
    function synthesize(id,opt={}){
      if(!ctx||!cfg.sound||!unlocked||hidden||mode==='title')return;
      const t=ctx.currentTime,bus=buses[opt.bus||'effects'];if(!bus)return;
      const gain=ctx.createGain(),level=clamp((opt.gain??.5)*.72,0,1);
      gain.gain.setValueAtTime(level,t);let end=gain;
      if(opt.at&&cfg.audioSpatial){
        const p=ctx.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=opt.ref||2;
        p.positionX.value=opt.at[0];p.positionY.value=opt.at[1];p.positionZ.value=opt.at[2];gain.connect(p);end=p;
      }
      end.connect(bus);
      if(id.startsWith('wood-strain')||id==='wood-creak'){
        const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter();
        osc.type='sawtooth';osc.frequency.setValueAtTime(115+Math.random()*30,t);
        osc.frequency.exponentialRampToValueAtTime(82+Math.random()*20,t+.36);
        filter.type='bandpass';filter.frequency.setValueAtTime(440,t);filter.Q.value=5.5;
        gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level,t+.04);gain.gain.exponentialRampToValueAtTime(.001,t+.4);
        osc.connect(filter).connect(gain);osc.start(t);osc.stop(t+.42);
      }else if(id==='wood-jolt'){
        const osc=ctx.createOscillator(),noiseBuffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.35),ctx.sampleRate);
        const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.05));
        const noise=ctx.createBufferSource();noise.buffer=noiseBuffer;
        const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.setValueAtTime(720,t);filter.Q.value=4;
        osc.type='triangle';osc.frequency.setValueAtTime(160,t);osc.frequency.exponentialRampToValueAtTime(48,t+.28);
        gain.gain.setValueAtTime(level*1.2,t);gain.gain.exponentialRampToValueAtTime(.001,t+.34);
        osc.connect(gain);noise.connect(filter).connect(gain);osc.start(t);osc.stop(t+.35);noise.start(t);noise.stop(t+.35);
      }else if(id==='wood-thud'||id==='wood-brace'){
        const osc=ctx.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(125,t);osc.frequency.exponentialRampToValueAtTime(36,t+.22);
        gain.gain.setValueAtTime(level*1.1,t);gain.gain.exponentialRampToValueAtTime(.001,t+.24);
        osc.connect(gain);osc.start(t);osc.stop(t+.25);
      }else if(id==='shoulder-test'){
        const osc=ctx.createOscillator();osc.type='triangle';osc.frequency.setValueAtTime(88,t);osc.frequency.exponentialRampToValueAtTime(62,t+.45);
        gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level,t+.07);gain.gain.exponentialRampToValueAtTime(.001,t+.48);
        osc.connect(gain);osc.start(t);osc.stop(t+.5);
      }else if(id==='wood-slide'){
        const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter();
        osc.type='sawtooth';osc.frequency.setValueAtTime(240,t);osc.frequency.linearRampToValueAtTime(175,t+.24);
        filter.type='lowpass';filter.frequency.setValueAtTime(580,t);gain.gain.setValueAtTime(level*.7,t);gain.gain.exponentialRampToValueAtTime(.001,t+.28);
        osc.connect(filter).connect(gain);osc.start(t);osc.stop(t+.3);
      }else if(id==='mud-squelch'){
        const osc=ctx.createOscillator(),noiseBuffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.2),ctx.sampleRate);
        const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.04));
        const noise=ctx.createBufferSource();noise.buffer=noiseBuffer;
        const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.setValueAtTime(380,t);filter.Q.value=3;
        osc.type='sine';osc.frequency.setValueAtTime(110,t);osc.frequency.exponentialRampToValueAtTime(38,t+.18);
        gain.gain.setValueAtTime(level*1.1,t);gain.gain.exponentialRampToValueAtTime(.001,t+.2);
        osc.connect(gain);noise.connect(filter).connect(gain);osc.start(t);osc.stop(t+.22);noise.start(t);noise.stop(t+.22);
      }else if(id==='gravel-crunch'){
        const noiseBuffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.16),ctx.sampleRate);
        const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.04));
        const noise=ctx.createBufferSource();noise.buffer=noiseBuffer;
        const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.setValueAtTime(1750,t);filter.Q.value=2.4;
        gain.gain.setValueAtTime(level*.9,t);gain.gain.exponentialRampToValueAtTime(.001,t+.16);
        noise.connect(filter).connect(gain);noise.start(t);noise.stop(t+.17);
      }else if(id==='stone-steps'){
        const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter();
        osc.type='triangle';osc.frequency.setValueAtTime(160,t);osc.frequency.exponentialRampToValueAtTime(80,t+.15);
        filter.type='bandpass';filter.frequency.setValueAtTime(850,t);filter.Q.value=4.5;
        gain.gain.setValueAtTime(level,t);gain.gain.exponentialRampToValueAtTime(.001,t+.18);
        osc.connect(filter).connect(gain);osc.start(t);osc.stop(t+.2);
      }else if(id==='rope-friction'){
        const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter();
        osc.type='sawtooth';osc.frequency.setValueAtTime(280,t);osc.frequency.exponentialRampToValueAtTime(190,t+.25);
        filter.type='bandpass';filter.frequency.setValueAtTime(950,t);filter.Q.value=3.5;
        gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level*.85,t+.04);gain.gain.exponentialRampToValueAtTime(.001,t+.28);
        osc.connect(filter).connect(gain);osc.start(t);osc.stop(t+.3);
      }else if(id==='cart-rumble'){
        const osc=ctx.createOscillator(),lfo=ctx.createOscillator(),lfoGain=ctx.createGain();
        osc.type='triangle';osc.frequency.setValueAtTime(52,t);
        lfo.frequency.setValueAtTime(6.5,t);lfoGain.gain.setValueAtTime(14,t);lfo.connect(lfoGain);lfoGain.connect(osc.frequency);
        gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level*.95,t+.18);gain.gain.exponentialRampToValueAtTime(.001,t+.75);
        osc.connect(gain);lfo.start(t);osc.start(t);lfo.stop(t+.8);osc.stop(t+.8);
      }else if(id==='cart-block'){
        const osc=ctx.createOscillator(),noiseBuffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.26),ctx.sampleRate);
        const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.05));
        const noise=ctx.createBufferSource();noise.buffer=noiseBuffer;
        const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.setValueAtTime(1250,t);filter.Q.value=3.8;
        osc.type='square';osc.frequency.setValueAtTime(210,t);osc.frequency.exponentialRampToValueAtTime(45,t+.24);
        gain.gain.setValueAtTime(level*1.3,t);gain.gain.exponentialRampToValueAtTime(.001,t+.28);
        osc.connect(gain);noise.connect(filter).connect(gain);osc.start(t);osc.stop(t+.3);noise.start(t);noise.stop(t+.3);
      }else{
        const osc=ctx.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(id==='rope'?280:180,t);
        osc.frequency.exponentialRampToValueAtTime(50,t+.12);gain.gain.setValueAtTime(level,t);gain.gain.exponentialRampToValueAtTime(.001,t+.14);
        osc.connect(gain);osc.start(t);osc.stop(t+.15);
      }
    }
    function effect(id,opt={}){
      if(!cfg.sound||!unlocked||hidden||mode==='title')return;
      const now=time(),key=opt.cooldownKey||id;if(now-(cooldown.get(key)||-Infinity)<(opt.cooldown??95))return;cooldown.set(key,now);
      const file=take(id);
      if(file){
        play(file,{gain:opt.gain??.48,at:opt.at,ref:opt.ref||2,rate:opt.rate||(.975+Math.random()*.05),lowpass:opt.lowpass,bus:opt.bus||'effects'});
      }else{
        synthesize(id,opt);
      }
      if(opt.caption!==false)caption(opt.caption||soundNames[id]);
    }
    function ui(kind){const map={click:'wood',choice:'cloth',page:'paper',seal:'ceramic',accomplish:'wood',read:'paper',finish:'wood',impact:'wood',walk:'cloth'};effect(map[kind]||'cloth',{bus:'ui',gain:kind==='click'?.1:.17,caption:false,cooldown:120,cooldownKey:'ui'});}
    function material(kind='wood',at){effect(kind==='gravel'?'step-gravel':kind,{at:at?[at[0],.55,at[1]]:null,gain:.57});}
    function cue(text){
      caption(String(text||'').replace(/^\[|\]$/g,''),true);
      const rules=[[/mái chèo|chèo gỗ/i,'oar'],[/dây gai|sợi dây|dây neo|dây lều/i,'rope'],[/giấy|sợi cói|bút|sổ/i,'paper'],[/lưới ướt|cá quẫy|nước tung/i,'splash'],[/then|áo giáp|lưỡi gươm/i,'metal'],[/đòn gỗ|bánh xe|ván thuyền/i,'wood'],[/vải|sợi len/i,'cloth']];
      const match=rules.find(([test])=>test.test(text));if(match)effect(match[1],{gain:.4,caption:false,cooldown:1500,cooldownKey:'scene-cue'});
    }
    function tick(frame,nextState){
      state=nextState||state;if(!frame?.position||!state)return;
      if(!scene||profile(state).id!==scene.id)setScene(state);
      const now=time(),point=frame.position,paused=mode!=='world'||!!frame.audio?.paused;
      if(ctx&&unlocked&&!hidden){
        const listener=ctx.listener,cam=frame.audio?.camera||[point[0],1.6,point[1]],look=frame.audio?.look||[cam[0]-Math.sin(frame.yaw||0),cam[1],cam[2]-Math.cos(frame.yaw||0)];
        let direction=look.map((v,i)=>v-cam[i]),length=Math.hypot(...direction)||1;direction=direction.map(v=>v/length);
        ['X','Y','Z'].forEach((axis,i)=>{ramp(listener['position'+axis],cam[i],.06);ramp(listener['forward'+axis],direction[i],.06);ramp(listener['up'+axis],i===1?1:0,.06);});
        if(!beds.size&&!startBeds.pending&&mode!=='menu'&&mode!=='title')startBeds();
      }
      if(!previous||paused||hidden){previous=[...point];stride=0;lastTick=now;return;}
      const distance=Math.hypot(point[0]-previous[0],point[1]-previous[1]),dt=clamp((now-lastTick)/1000,.001,.2);previous=[...point];lastTick=now;
      if(distance<.002||distance>2.5||!frame.walking)return;
      stride+=distance;const running=distance/dt>4.1,step=running?1.05:.76;
      if(stride>=step){
        stride%=step;foot^=1;const surface=surfaceAt(state,point),yaw=frame.yaw||0,side=(foot?1:-1)*.13;
        effect('step-'+surface,{gain:running?.42:.29,at:[point[0]+Math.cos(yaw)*side,frame.audio?.ground??.05,point[1]-Math.sin(yaw)*side],ref:1.5,caption:false,cooldown:140,cooldownKey:'footstep',rate:.96+Math.random()*.08});stats.footsteps++;
      }
      // Work foley belongs to a nearby worker, and is suppressed while reading.
      if(now>nextWork&&frame.npc?.activity==='rest'&&frame.npc.distance<4.5){
        nextWork=now+8000+Math.random()*9000;
        const person=frame.npc.appearance?.replace(/^wt-/,''),id={natan:'wood',titus:'wood',lea:'paper',miriam:'ceramic',rina:'ceramic',amon:'rope',recipient:'rope'}[person];
        const at=options.locate?.(frame.npc.id);if(id&&at)effect(id,{gain:.23,at:[at[0],.8,at[1]],caption:soundNames[id]});
      }
      // Q01 mechanical strain proximity audio
      if(!state.layer&&state.chapter===0&&Math.hypot(point[0]-(-14.1),point[1]-3.5)<4.2){
        const isBraced=!!state.workshop?.records?.['Q01.LOAD']||(state.workshop?.drafts?.['Q01.LOAD']?.payload?.order||[]).includes('brace');
        if(!isBraced&&now>(tick.nextCreak||0)){
          tick.nextCreak=now+5500+Math.random()*4000;
          effect('wood-strain',{at:[-14.1,.7,3.5],gain:.38,caption:soundNames['wood-strain'],cooldown:4000,cooldownKey:'cart-strain'});
        }
      }
    }
    function visibility(value){
      hidden=!!value;previous=null;stride=0;
      if(hidden){stopVoice();clearWorld();mix();ctx?.suspend().catch(()=>{});}else if(cfg.sound&&unlocked){ctx?.resume().then(()=>{mix();startBeds();}).catch(()=>{});}
    }
    function debug(){
      let rms=0,peak=0;if(analyser){const samples=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(samples);for(const v of samples){rms+=v*v;peak=Math.max(peak,Math.abs(v));}rms=Math.sqrt(rms/samples.length);stats.peak=Math.max(stats.peak,peak);}
      return {context:ctx?.state||'uninitialized',unlocked,mode,hidden,scene:scene?.id,settings:{...cfg},sources:active.size,beds:beds.size,cacheBytes,pending:inflight.size,voice:voiceInfo,ducked,caption:activeCaption,rms,peak,stats:{...stats},failedFiles:[...failures]};
    }
    function dispose(){stopVoice();clearWorld();for(const item of [...active])drop(item,0);for(const n of reverbs.values())n.disconnect();reverbs.clear();cache.clear();cacheBytes=0;ctx?.close();}
    const api={configure,unlock,setScene,setMode,tick,ui,material,effect,synthesize,cue,speak,stopVoice,visibility,debug,dispose,repeat(){return voiceRequest?speak(voiceRequest.person,voiceRequest.text,voiceRequest.opt):Promise.resolve(false);},get config(){return {...cfg};}};
    return api;
  }
  const API={create,settings,profile,surfaceAt,cleanText,recorded,DEFAULTS};root.WitnessAudio=API;
  if(typeof module!=='undefined')module.exports=API;
})(globalThis);
