(function(root){
  'use strict';
  const D=root.WitnessContent||(typeof require!=='undefined'?require('./witness-content.js'):null);
  if(typeof require!=='undefined')require('./witness-spine.js');
  const X=root.WitnessDepth||(typeof require!=='undefined'?require('./witness-depth.js'):null);
  const R=root.WitnessRelationships||(typeof require!=='undefined'?require('./witness-relationships.js'):null);
  const C=root.WitnessCraft||(typeof require!=='undefined'?require('./witness-craft.js'):null);
  const STORE='the-witness.spine.v3', BACKUP=STORE+'.backup',LEGACY='the-witness.campaign.v2';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const error=message=>{throw new Error(message);};
  const unique=a=>[...new Set(a)];
  function requireGroundWork(state){const p=state.spatialPositions?.[chapter(state).id+'.'+(state.layer?.id||'mortal')];if(p&&/^q01-(roof|step)/.test(p.supportId))error('Hãy trở lại đúng tầng có người hoặc vật trước khi thực hiện.');}
  const SKILL_KEYS=['observe','craft','commune','defend'];

  function baseSkills(origin='scribe'){
    return {
      observe:origin==='scribe'?2:1,
      craft:origin==='port'?2:1,
      commune:1,
      defend:origin==='road'?2:1
    };
  }
  function baseSkillXp(origin='scribe'){
    return {
      observe:origin==='scribe'?3:0,
      craft:origin==='port'?3:0,
      commune:0,
      defend:origin==='road'?3:0
    };
  }
  function defaultBoard(){
    return {claim:'P01',audience:'private_group',slots:{P01:[],P02:[],P03:[],P04:[]}};
  }
  function defaultSettings(){
    return {text:1,motion:'calm',sound:false,masterVolume:.8,ambienceVolume:.55,effectsVolume:.75,voiceVolume:.95,uiVolume:.4,voiceMode:'recorded',autoVoice:true,audioCaptions:true,audioSpatial:true,audioRange:'natural',guide:true,guideMode:'full',comfort:true,sprintToggle:false,stickSide:'left',subtitleBg:true,graphics:'ultra',workMode:'field',cameraMode:'third',q01Lighting:'day'};
  }

  function fresh(profile={}){
    const origin=['port','scribe','road'].includes(profile.origin)?profile.origin:'scribe';
    return {
      schema:2,contentVersion:'3.0',campaignId:'the-witness-spine-v3',chapter:0,
      profile:{
        name:String(profile.name||'Người Chứng').trim().slice(0,28)||'Người Chứng',
        gender:['male','female'].includes(profile.gender)?profile.gender:'male',
        origin,
        attire:['sand','green','blue'].includes(profile.attire)?profile.attire:'sand'
      },
      skills:baseSkills(origin),
      skillXp:baseSkillXp(origin),
      quests:Object.fromEntries(D.chapters.map(q=>[q.id,{done:[],plan:null,route:null,decisions:{}}])),
      evidence:[],consent:{},flags:{},resources:{money:3,food:3,tools:1},
      relationships:{miriam:0,damar:0,lea:0,titus:0},bonds:{},legends:{},veils:{},events:[],layer:null,positions:{},spatialPositions:{},
      pendingEscort:null,finished:false,pendingBond:null,
      campaignProgress:{requiredLegends:{}},unlockedBridgeContext:[],
      board:defaultBoard(),talked:{},quietSeen:[],workshop:{drafts:{},records:{}},craft:{looked:[],field:null},
      migration:null,settings:defaultSettings(),lastSaved:null
    };
  }

  const chapter=s=>D.chapters[Math.min(s.chapter,D.chapters.length-1)];
  const quest=s=>s.quests[chapter(s).id];
  function log(s,type,data={}){s.events.push({seq:s.events.length+1,type,quest:chapter(s).id,...data});}
  function relation(s,who,amount){s.relationships[who]=Math.max(-2,Math.min(2,(s.relationships[who]||0)+amount));}
  function gainSkill(s,key,amount=1){
    if(s.layer||!SKILL_KEYS.includes(key))return;
    if(!s.skills)s.skills=baseSkills(s.profile?.origin);
    if(!s.skillXp)s.skillXp=baseSkillXp(s.profile?.origin);
    s.skillXp[key]=Math.min(20,(s.skillXp[key]||0)+amount);
    const tier=s.skillXp[key]>=7?3:s.skillXp[key]>=3?2:1;
    if(tier>(s.skills[key]||1))s.skills[key]=tier;
  }

  function condition(s,key){
    return key==='pressure'?!!s.flags.pressure:key==='needs'?!s.flags.needsHeard&&!s.flags.pressure:key==='anonymous-unprotected'?s.quests.Q02.route==='anonymous'&&!s.flags.yosefSafe:true;
  }

  function actions(s){
    if(s.finished&&!s.layer)return [];
    if(s.layer){
      const l=s.layer,src=l.kind==='legend'?D.legends[l.id]:D.veils[l.id];
      if(l.format==='accessible_summary')return [{id:'read-summary',target:'layer-summary',title:'Tiếp tục bản tóm tắt',text:src.ref,at:src.start||[-7,4],layer:true}];
      const step=src.steps[l.step];
      const main=step?{
        id:step[0],target:'layer-'+l.step,title:step[1],text:step[2],at:layerAt(l.step,s),layer:true,
        kind:step.kind||'observe',choices:step.choices,order:step.order,orderLabels:step.orderLabels,
        beat:step.beat,reference:step.reference,scene:step.scene||null,sound:step.sound||null,attune:step.attune||null
      }:{id:'return',target:'layer-return',title:'Khép chương và trở về',text:src.bridge||'Trở lại với người đang sống',at:src.returnAt||[13,-10],layer:true};
      return [main,...(src.discoveries||[]).filter(d=>!(l.discovered||[]).includes(d.id)).map(d=>({id:'discover:'+d.id,target:'discovery-'+d.id,title:d.title,text:d.text,at:d.at,layer:true,kind:'discovery'}))];
    }
    const ch=chapter(s),q=quest(s);
    if(q.route){
      const due=dueLegend(s);
      return [
        ...(s.chapter===2&&condition(s,'anonymous-unprotected')?[ch.tasks[0]]:[]),
        due?{id:'legend-gate',target:'gate',legend:due,title:D.legends[due].name+' — '+D.legends[due].title,text:'Chương chính · Chơi hoặc xem tóm tắt đủ nội dung để tiếp tục.',needs:[]}:{id:'advance',target:'gate',title:s.chapter===11?'Nhìn lại bến sau cuộc nói':'Tiếp tục hành trình',text:ch.ending[q.route]||ch.quiet,needs:[]},
        ...bondAction(s)
      ];
    }
    const source=q.plan?(ch.execution[q.plan]||[]):ch.tasks;
    let result=source.filter(a=>!q.done.includes(a.id)&&(a.needs||[]).every(id=>q.done.includes(id))&&(!a.when||condition(s,a.when)));
    if(q.plan){
      result=result.filter(a=>a.id!=='choose');
      if(s.chapter===7)result=[...ch.tasks.filter(a=>['anchor','support','wrap'].includes(a.id)&&!q.done.includes(a.id)&&a.needs.every(id=>q.done.includes(id))),...result];
    }
    if(s.chapter===2&&condition(s,'anonymous-unprotected')&&!q.done.includes('protect'))result=[ch.tasks[0],...result.filter(a=>a.id!=='protect')];
    return [...result,...bondAction(s)];
  }

  function bondAction(s){
    const pending=s.pendingBond;if(!pending)return [];
    const b=D.bonds.find(b=>b.id===pending.id);if(!b||s.bonds[b.id])return [];
    return [{id:'bond-work',target:'bond-work',title:'Cùng thực hiện: '+b.title,text:b.choices.find(c=>c[0]===pending.choice)?.[2]||b.text,puzzle:'depth',depth:R.catalog.find(d=>d.owner===b.id).id,bond:b.id,success:b.callback,needs:[]}];
  }

  function layerAt(i,s){
    const l=s?.layer,src=l&&(l.kind==='legend'?D.legends[l.id]:D.veils[l.id]),step=src?.steps[i];
    return step?.routeAt?.[l.route||'near']||(Array.isArray(step?.at)?step.at:null)||[[-7,4],[0,-3],[9,-8]][i]||src?.returnAt||[13,-10];
  }

  function legendComplete(s,id){
    const src=D.legends[id],r=s.legends[id];
    return !!(src?.required&&r?.status==='committed'&&r.revision===src.revision&&r.finalAcknowledged&&r.receipts?.length===src.beats.length&&r.receipts.every((b,i)=>b.beat===src.beats[i].id&&b.revision===src.revision&&['interactive','accessible_summary'].includes(b.format)));
  }
  function dueLegend(s){return D.spine.find(id=>{const l=D.legends[id];return !legendComplete(s,id)&&(s.chapter>l.after||s.chapter===l.after&&!!s.quests[D.chapters[l.after].id].route);})||null;}
  const allLegends=s=>D.spine.every(id=>legendComplete(s,id));

  function attunement(s,legendId=null){
    const sk=s.skills||baseSkills(s.profile?.origin);
    const id=legendId||s.layer?.id||'L01';
    const active=SKILL_KEYS.filter(k=>(sk[k]||1)>=2).map(k=>({id:k,name:D.skills?.[k]?.name||k,tier:sk[k]||1,detail:D.skills?.[k]?.attunement||''}));
    return {
      legendId:id,
      skills:{...sk},
      active,
      baseComposure:Math.min(94,82+active.length*3),
      hasSkill:(k,min=2)=>(sk[k]||1)>=min
    };
  }

  function kitStatus(s){
    const q=s.quests||{};
    return (D.kit||[]).map(item=>{
      let note='Trang bị nền của Người Chứng';
      if(item.id==='kitbag'&&s.profile?.origin==='port')note='Túi thợ bến quen việc — sẵn nêm gỗ và đục nhỏ';
      if(item.id==='lamp'&&(q.Q01?.route==='meal'||q.Q01?.route==='lodging'))note=q.Q01.route==='lodging'?'Đèn bàn chép sổ đã châm đầy dầu':'Đèn sân bữa chung vừa được sẻ dầu';
      if(item.id==='rope')note=q.Q04?.route==='tools'?'Đã nâng cấp bộ dây gai và chốt neo chịu tải (Q04)':'Dây neo cơ bản theo hành trang';
      if(item.id==='wrap'&&q.Q08?.done?.includes('wrap'))note='Đã dùng bọc kín đầu mối qua dòng nước tuyến đồi (Q08)';
      if(item.id==='tablet'&&s.profile?.origin==='scribe')note='Thẻ ghi chia hai cột đối chiếu của người học chép';
      if(item.id==='sandals'&&s.profile?.origin==='road')note='Dép khâu kép quen đường đồi của người giữ đường';
      return {...item,note};
    });
  }

  function tenets(s){
    const unlocked=new Set(s.unlockedBridgeContext||[]);
    return D.spine.map(id=>({
      ...(D.tenets?.[id]||{id,title:D.legends[id].title}),
      unlocked:unlocked.has(id)||legendComplete(s,id),
      legendTitle:D.legends[id].title,
      ref:D.legends[id].ref
    }));
  }

  function activeTenetForChapter(s){
    const ch=chapter(s);
    if(!ch?.tenet)return null;
    const t=tenets(s).find(x=>x.id===ch.tenet);
    return t?.unlocked?t:null;
  }

  function planAllowed(s,route){
    const q=quest(s),ch=chapter(s),a=ch.tasks.find(a=>a.plan);
    if(!a||!a.choices.some(c=>c[0]===route))return false;
    if(ch.id==='Q02'&&route==='consented')return !!s.flags.needsHeard&&!s.flags.pressure;
    if(ch.id==='Q03'&&route==='paid')return s.resources.money>=1;
    if(ch.id==='Q08'&&route==='prepared_rescue')return ['anchor','support','wrap'].every(x=>q.done.includes(x));
    return true;
  }

  function checkPuzzle(s,a,p={}){
    const depth=X.encounter(s,a);
    if(depth)return X.evaluate(s,depth,p?.work).ok;
    const equal=(value,expected)=>Array.isArray(value)&&value.length===expected.length&&value.every((x,i)=>x===expected[i]);
    if(a.puzzle==='brace')return equal(p.order,['support','secure','release']);
    if(a.puzzle==='rope')return equal(p.order,['anchor','bind','test']);
    if(a.puzzle==='patch')return p.answer==='amended';
    if(a.puzzle==='trace')return p.answer==='route';
    if(a.puzzle==='count')return Number(p.answer)===(s.chapter<4?22:4);
    if(a.puzzle==='copy')return equal([...new Set(p.fields||[])].sort(),['amount','lot','place']);
    if(a.puzzle==='supplies')return Number(p.reserve)===1;
    if(a.puzzle==='redact')return equal([...new Set(p.remove||[])].sort(),['address','description','name']);
    if(a.puzzle==='consent')return p.answer==='agree'&&!s.flags.pressure&&!!s.flags.needsHeard&&quest(s).done.includes('shelter-arranged');
    if(a.puzzle==='water')return p.answer==='outer';
    if(a.puzzle==='rescue')return equal(p.order,['anchor','receive','pull']);
    if(a.puzzle==='claims')return p.answer==='limited';
    if(a.puzzle==='release')return p.confirmed===true;
    return !a.puzzle;
  }

  function addEvidence(s,id){
    if(id&&!s.evidence.includes(id)){
      s.evidence.push(id);
      log(s,'EvidenceRecorded',{evidence:id,lineage:D.evidence[id].lineage});
    }
  }

  function effects(s,a,choice){
    const ch=chapter(s),q=quest(s);
    if(a.skill)gainSkill(s,a.skill,a.puzzle?2:1);
    else if(a.puzzle){
      const map={brace:'craft',rope:'craft',supplies:'craft',rescue:'defend',water:'observe',patch:'observe',trace:'observe',count:'observe',copy:'observe',redact:'observe',claims:'observe',consent:'commune',release:'commune'};
      if(map[a.puzzle])gainSkill(s,map[a.puzzle],2);
    }
    if(a.evidence&&!(ch.id==='Q09'&&choice==='decline'))addEvidence(s,a.evidence);
    if(ch.id==='Q01'&&a.id==='ledger')s.flags.ledger=true;
    if(ch.id==='Q02'){
      if(a.id==='meet'){s.flags.yosefMet=true;s.flags.pressure=choice==='pressure';if(choice==='listen'){s.flags.needsHeard=true;q.done=unique([...q.done,'needs']);gainSkill(s,'commune',1);}if(choice==='pressure'){relation(s,'miriam',-1);log(s,'PressureUsed',{actor:'yosef'});}}
      if(a.id==='repair-pressure'){s.flags.pressure=false;log(s,'PressureRepaired',{actor:'yosef'});}
      if(a.id==='needs')s.flags.needsHeard=true;
      if(a.id==='consent'){s.consent.yosef={scope:'private_group',voluntary:true,safe:true};log(s,'ConsentChanged',{actor:'yosef',scope:'private_group'});}
    }
    if(ch.id==='Q03'&&a.id==='bridge')s.flags.bridge=choice==='repair';
    if(ch.id==='Q03'&&a.id==='protect'){s.flags.yosefSafe=true;log(s,'WitnessProtected',{actor:'yosef'});}
    if(ch.id==='Q09'&&a.id==='statement'){s.consent.witness1={scope:choice==='decline'?'withheld':choice,voluntary:choice!=='decline',safe:false};log(s,'ConsentChanged',{actor:'witness1',scope:s.consent.witness1.scope});}
    if(ch.id==='Q11'&&a.id==='scope'){s.consent.witness1={scope:choice,voluntary:true,safe:true};log(s,'ConsentChanged',{actor:'witness1',scope:choice});}
    if(ch.id==='Q11'&&a.id==='supplies'){
      s.flags.finalMealStock=s.resources.food;s.flags.finalMealShortfall=s.resources.food===0;
      if(s.resources.food>0)s.resources.food--;
    }
  }

  function commit(s,a,choice){
    const q=quest(s),ch=chapter(s);if(q.route)return;
    q.route=ch.id==='Q10'&&q.plan==='conceal'?(choice||'conceal'):q.plan;
    if(ch.id==='Q01'){if(q.route==='lodging')s.resources.money--;else s.resources.food--;}
    if(ch.id==='Q02'){
      s.flags.yosefSafe=q.route!=='anonymous';s.flags.testimony=q.route==='consented'?'named-in-group':q.route==='anonymous'?'anonymous':'private';
      if(q.route!=='consented')s.consent.yosef={scope:q.route==='anonymous'?'anonymous_summary':'private_group',voluntary:false,safe:s.flags.yosefSafe};
      if(q.route==='shelter')s.resources.food=Math.max(0,s.resources.food-1);
      if(q.route!=='anonymous')relation(s,'miriam',1);
    }
    if(ch.id==='Q03'&&q.route==='paid')s.resources.money--;else if(ch.id==='Q03')s.flags.amonSupport=true;
    if(ch.id==='Q04'){if(q.route==='food')s.resources.food+=2;else s.resources.tools+=1;}
    if(ch.id==='Q07'){s.flags.promiseKept=q.route==='personally_keep';s.flags.voluntarySupport=true;relation(s,'miriam',1);}
    if(ch.id==='Q08'){s.flags.paperIntegrity=q.route==='person_first'?'partial':'full';s.flags.amonInjured=q.route==='loaded_rescue';}
    if(ch.id==='Q10'){s.flags.fatherConcealment=q.route==='conceal';s.flags.fatherCorrected=q.route==='corrected';if(q.route==='conceal')relation(s,'lea',-1);if(q.route==='corrected')log(s,'CorrectionDelivered',{subject:'haddai',previousHarmRetained:true});}
    if(ch.id==='Q11'){s.flags.finalPlan=q.route;s.flags.planSnapshot={method:q.route,claims:allowedClaims(s,q.route==='distributed'?'private_group':'public'),consent:clone(s.consent)};}
    if(ch.id==='Q12'){if(!allLegends(s))error('Cần khép đủ ba chương Kinh Thánh chính trước đoạn kết.');s.finished=true;s.flags.ending=q.route;}
    s.pendingEscort=null;log(s,ch.id+'.COMMITTED',{route:q.route});
  }

  function act(state,id,options={}){
    requireGroundWork(state);
    if(state.layer)error('Hãy hoàn tất hoặc rời trải nghiệm hiện tại trước.');
    const s=clone(state),ch=chapter(s),q=quest(s);const a=actions(s).find(x=>x.id===id);if(!a)error('Việc này chưa sẵn sàng hoặc đã hoàn tất.');
    if(a.legend)error('Hãy mở chương chính bằng phần chơi hoặc bản tóm tắt.');
    if(a.bond){if(!checkPuzzle(s,a,options.puzzle))error('Hãy hoàn tất phần cùng làm trước khi ghi nhận.');recordWorkshop(s,a,options.puzzle?.work);s.craft.lastWork={bond:a.bond,chapter:s.chapter};return bond(s,a.bond,s.pendingBond.choice,{completedWork:true});}
    if(id==='advance'){
      if(dueLegend(s))error('Chương Kinh Thánh chính còn dở. Hãy tiếp tục hoặc xem tóm tắt đủ nội dung.');
      if(ch.id==='Q03'&&condition(s,'anonymous-unprotected'))error('Cần bố trí bảo vệ đã hứa trước khi rời vùng.');
      s.chapter++;s.pendingEscort=null;log(s,'ChapterEntered',{chapter:chapter(s).id});
      if(chapter(s).id==='Q12')quest(s).plan=s.flags.finalPlan||'relocate';
      return s;
    }
    if(a.plan){if(!planAllowed(s,options.choice))error('Chưa đủ chuẩn bị cho phương án này. Bạn có thể quay lại làm phần còn thiếu.');q.plan=options.choice;q.decisions[id]=options.choice;log(s,'PlanSelected',{route:q.plan});return s;}
    if(a.choices&&!a.choices.some(c=>c[0]===options.choice))error('Hãy chọn đúng điều bạn muốn nói hoặc thực hiện.');
    if(a.puzzle&&!checkPuzzle(s,a,options.puzzle))error('Cách này còn thiếu một bước. Hãy đối chiếu lại hoặc dùng hướng dẫn.');
    if(a.depth)recordWorkshop(s,a,options.puzzle?.work);
    if(a.escort){const destination=ch.nodes.find(n=>n.id===a.destination)?.at;const p=options.position;if(!s.pendingEscort||s.pendingEscort.id!==a.id||!Array.isArray(p)||Math.hypot(p[0]-destination[0],p[1]-destination[1])>5)error('Cần đi cùng và tới nơi đã có người nhận trước khi ghi hoàn tất.');}
    q.done=unique([...q.done,id]);if(a.escort)s.pendingEscort=null;if(options.choice)q.decisions[id]=options.choice;
    effects(s,a,options.choice);log(s,'ActionCompleted',{action:id,choice:options.choice||null});
    if(a.commit)commit(s,a,options.choice);
    return s;
  }

  function chooseAgain(state){const s=clone(state),ch=chapter(s),q=quest(s);if(q.route||s.pendingEscort)error('Hãy hoàn tất đoạn đang thực hiện trước.');const original=new Set(ch.tasks.map(a=>a.id));q.done=q.done.filter(id=>original.has(id));q.plan=null;log(s,'PlanRevised');return s;}
  function escort(state,id){const s=clone(state),a=actions(s).find(a=>a.id===id&&a.escort);if(!a)error('Đoạn đi cùng chưa sẵn sàng.');s.pendingEscort={id,chapter:chapter(s).id,target:a.target,destination:a.destination};log(s,'EscortStarted',{action:id});return s;}

  function rememberLayer(s){
    const l=s.layer;
    if(!l||l.kind!=='legend'||!D.legends[l.id].required||l.replay)return;
    s.legends[l.id]={...s.legends[l.id],status:'in_progress',completed:false,revision:D.legends[l.id].revision,receipts:clone(l.receipts||[]),discovered:clone(l.discovered||[]),composure:l.composure??84,attunements:clone(l.attunements||[]),checkpoint:clone(l)};
  }

  function openLayer(state,kind,id,format=null){
    const s=clone(state),ch=chapter(s),source=kind==='legend'?D.legends:D.veils,src=source[id];
    if(s.layer||!src||!['legend','veil'].includes(kind))error('Trải nghiệm này chưa mở trong hành trình.');
    const required=kind==='legend'&&src.required,replay=required?legendComplete(s,id):!!s[kind==='legend'?'legends':'veils'][id]?.completed;
    if(required){const earlier=D.spine.slice(0,D.spine.indexOf(id));if(!replay&&(dueLegend(s)!==id||!s.quests[D.chapters[src.after].id].route||!earlier.every(k=>legendComplete(s,k))))error('Chương này mở sau phần chuẩn bị và chương nguồn trước nó.');}else if((kind==='legend'?ch.legend:ch.veil)!==id)error('Trải nghiệm này chưa mở trong hành trình.');
    if(format&&(!['interactive','accessible_summary'].includes(format)||format==='accessible_summary'&&!required))error('Định dạng không hợp lệ.');
    const checkpoint=required&&!replay?s.legends[id]?.checkpoint:null;
    const baseComp=attunement(s,id).baseComposure;
    s.layer=checkpoint?clone(checkpoint):{kind,id,step:0,reflection:null,format:'interactive',summaryIndex:0,receipts:[],discovered:[],route:'near',composure:baseComp,attunements:[]};
    if(typeof s.layer.composure!=='number')s.layer.composure=baseComp;
    if(!Array.isArray(s.layer.attunements))s.layer.attunements=[];
    s.layer.replay=replay;if(replay){delete s.positions[ch.id+'.'+id];delete s.spatialPositions?.[ch.id+'.'+id];}
    if(format&&format!==s.layer.format)return switchLayer(s,format);
    rememberLayer(s);return s;
  }

  function addReceipt(s,beat){
    const l=s.layer,src=D.legends[l.id];
    if(l.receipts.some(r=>r.beat===beat))return;
    const expected=src.beats[l.receipts.length];
    if(expected?.id!==beat)error('Nội dung nguồn cần được tiếp nhận theo thứ tự.');
    l.receipts.push({beat,revision:src.revision,format:l.format});
    if(!l.replay)log(s,'CoreBeatPresented',{legend:l.id,beat,format:l.format,revision:src.revision});
  }

  function adjustComposure(state,delta){
    const s=clone(state),l=s.layer;if(!l)return s;
    const floor=s.settings?.comfort?60:40;
    l.composure=Math.max(floor,Math.min(100,(l.composure??84)+delta));
    rememberLayer(s);return s;
  }

  function layerStep(state,id,options={}){
    const s=clone(state),l=s.layer;if(!l||l.format==='accessible_summary')error('Hãy tiếp tục phần trình bày đang mở.');
    const src=l.kind==='legend'?D.legends[l.id]:D.veils[l.id],a=actions(s).find(a=>a.id===id);
    if(!a||id==='return')error('Cần đi theo mạch của cảnh.');
    if(src.required){const at=options.position;if(!Array.isArray(at)||at.length!==2||!at.every(Number.isFinite)||Math.hypot(at[0]-a.at[0],at[1]-a.at[1])>4)error('Hãy tới địa vật trước khi thực hiện.');}
    if(a.kind==='discovery'){
      l.discovered=unique([...(l.discovered||[]),id.slice(9)]);
      l.composure=Math.min(100,(l.composure??84)+2);
      rememberLayer(s);return s;
    }
    if(a.kind==='route'){if(!a.choices.some(c=>c[0]===options.choice))error('Hãy chọn một lối để khảo sát.');l.route=options.choice;}
    const depth=X.encounter(s,a);
    if(depth){
      const result=X.evaluate(s,depth,options.work);
      if(!result.ok)error(result.issues[0]||'Hãy kiểm lại phương án trên bàn.');
      recordWorkshop(s,a,options.work);
    }else if(a.kind==='order'&&JSON.stringify(options.order)!==JSON.stringify(a.order))error('Cần chuẩn bị, giữ vật rồi kiểm lại. Có thể dùng hướng dẫn từng bước.');
    if(a.kind==='source'){if(!options.acknowledged)error('Hãy tiếp nhận phần nguồn rồi chọn tiếp tục.');addReceipt(s,a.beat);}
    if(a.attune&&(options.attune||(s.skills?.[a.attune.skill]||1)>=2)){
      l.composure=Math.min(100,(l.composure??84)+(a.attune.composure||6));
      l.attunements=unique([...(l.attunements||[]),a.id]);
    }else if(src.required){
      l.composure=Math.min(100,(l.composure??84)+2);
    }
    l.step++;rememberLayer(s);return s;
  }

  function switchLayer(state,format){
    const s=clone(state),l=s.layer,src=l&&D.legends[l.id];
    if(!l||l.kind!=='legend'||!src.required||!['interactive','accessible_summary'].includes(format))error('Không thể đổi định dạng ở đây.');
    l.format=format;
    if(format==='accessible_summary')l.summaryIndex=l.receipts.length;
    else{const next=src.beats[l.receipts.length]?.id;l.step=next?src.steps.findIndex(a=>a.beat===next):src.steps.length;}
    rememberLayer(s);return s;
  }

  function summaryStep(state,direction=1){
    const s=clone(state),l=s.layer,src=l&&D.legends[l.id];
    if(!src?.required||l.format!=='accessible_summary')error('Chưa mở bản tóm tắt.');
    if(direction===-1){l.summaryIndex=Math.max(0,l.summaryIndex-1);}
    else if(direction===1&&l.summaryIndex<src.summaryPages.length){addReceipt(s,src.summaryPages[l.summaryIndex].id);l.summaryIndex++;}
    else error('Trang tóm tắt không hợp lệ.');
    rememberLayer(s);return s;
  }

  function closeLayer(state,{skip=false,reflection=null}={}){
    const s=clone(state),l=s.layer;if(!l)error('Không có trải nghiệm đang mở.');const source=l.kind==='legend'?D.legends[l.id]:D.veils[l.id];
    if(l.kind==='legend'&&source.required){
      if(skip){rememberLayer(s);s.layer=null;return s;}
      const ended=l.format==='accessible_summary'?l.summaryIndex===source.summaryPages.length:l.step===source.steps.length;
      if(!ended||l.receipts.length!==source.beats.length||!l.receipts.every((r,i)=>r.beat===source.beats[i].id&&r.revision===source.revision))error('Chương còn nội dung chính chưa tới phần kết.');
      if(!l.replay){
        s.legends[l.id]={
          status:'committed',completed:true,revision:source.revision,receipts:clone(l.receipts),discovered:clone(l.discovered),
          composure:l.composure??84,attunements:clone(l.attunements||[]),workshop:readWorkshop(l.workshop,s),craft:readCraft(l.craft,l.id,false),
          finalAcknowledged:true,format:l.receipts.every(r=>r.format===l.format)?l.format:'mixed',
          reflection:typeof reflection==='string'?reflection.slice(0,180):null
        };
        s.campaignProgress.requiredLegends[l.id]=source.revision;
        s.unlockedBridgeContext=unique([...s.unlockedBridgeContext,l.id]);
        log(s,'LegendCommitted',{legend:l.id,revision:source.revision,format:s.legends[l.id].format});
      }
      s.layer=null;
      if(s.migration?.wasFinished&&s.quests.Q12.route&&allLegends(s)){s.finished=true;log(s,'CAMPAIGN.V3.COMMITTED',{migrated:true});}
      return s;
    }
    if(!skip&&l.step<source.steps.length)error('Cảnh còn phần chưa hoàn tất.');
    if(!l.replay){
      if(l.kind==='legend')s.legends[l.id]={completed:true,skipped:skip,discovered:clone(l.discovered||[]),workshop:readWorkshop(l.workshop,s),craft:readCraft(l.craft,l.id,false)};
      else s.veils[l.id]={completed:true,skipped:skip,discovered:clone(l.discovered||[]),workshop:readWorkshop(l.workshop,s),craft:readCraft(l.craft,l.id,false),reflection:!skip&&source.answers.includes(reflection)?reflection:null};
    }
    s.layer=null;return s;
  }

  function startBond(state,id,choice){
    const s=clone(state),b=D.bonds.find(x=>x.id===id);
    if(s.layer||!b||b.from>s.chapter||s.bonds[id]||!b.choices.some(c=>c[0]===choice))error('Việc cùng nhân vật chưa sẵn sàng.');
    if(s.pendingBond)error('Hãy hoàn tất phần việc riêng đang nhận trước.');
    s.pendingBond={id,choice};log(s,'RelationshipTaskPlanned',{bond:id,choice});return s;
  }
  function bond(state,id,choice,{completedWork=false}={}){
    const s=clone(state),b=D.bonds.find(x=>x.id===id);
    if(!completedWork||s.pendingBond?.id!==id||s.pendingBond?.choice!==choice||s.layer||!b||b.from>s.chapter||s.bonds[id]||!b.choices.some(c=>c[0]===choice))error('Việc cùng nhân vật chưa hoàn tất.');
    s.bonds[id]=choice;s.pendingBond=null;log(s,'RelationshipTaskCompleted',{bond:id,choice});
    gainSkill(s,['natan','titus'].includes(b.person)?'craft':b.person==='damar'?'defend':b.person==='lea'?'observe':'commune',2);
    if(Object.hasOwn(s.relationships,b.person))relation(s,b.person,1);
    return s;
  }

  function talkTopics(s,personId){
    const p=D.people?.[personId];if(!p?.topics||s.layer)return [];
    const seen=new Set(s.talked?.[personId]||[]);
    const after=R.topic(s,personId);
    const work=C.agendas[personId];
    return [...p.topics.filter(t=>(t.minChapter??0)<=s.chapter),...(work?[{id:'current-work',label:'Hỏi về phần việc đang làm',line:work.line}]:[]),...(after?[after]:[])].map(t=>({...t,heard:seen.has(t.id)}));
  }
  function recordTalk(state,personId,topicId){
    const s=clone(state);if(s.layer)return s;
    const topic=talkTopics(s,personId).find(t=>t.id===topicId);if(!topic)return s;
    if(!s.talked)s.talked={};
    const prev=s.talked[personId]||[];
    if(!prev.includes(topicId)){
      s.talked[personId]=[...prev,topicId];
      gainSkill(s,'commune',1);
    }
    return s;
  }
  function recordQuiet(state){
    const s=clone(state);if(s.layer)return s;
    const id=chapter(s).id;
    if(!Array.isArray(s.quietSeen))s.quietSeen=[];
    if(!s.quietSeen.includes(id)){
      s.quietSeen=[...s.quietSeen,id];
      gainSkill(s,'observe',1);
    }
    return s;
  }

  function consentBadge(s,evidenceId){
    const ev=D.evidence?.[evidenceId];
    if(!ev)return {code:'unknown',label:'CHƯA RÕ',allowedPublic:false,tone:'warn'};
    if(ev.kind==='physical')return {code:'physical',label:'VẬT CHỨNG ĐỐI CHIẾU',allowedPublic:true,tone:'neutral'};
    if(evidenceId==='E09'){
      const c=s.consent?.witness1;
      if(!c)return {code:'pending',label:'CHƯA XIN PHẠM VI',allowedPublic:false,tone:'warn'};
      if(c.scope==='withheld'||!c.voluntary)return {code:'withheld',label:'TỪ CHỐI / ĐÃ DỪNG',allowedPublic:false,tone:'warn'};
      if(c.scope==='private_group')return {code:'private_group',label:'CHỈ TRONG NHÓM KÍN',allowedPublic:false,tone:'private'};
      if(c.scope==='anonymous_summary')return {code:'anonymous_summary',label:'TÓM TẮT ẨN DANH',allowedPublic:true,tone:'ok'};
      if(c.scope==='public_named')return c.safe?{code:'public_named',label:'CÔNG KHAI ĐỨNG TÊN',allowedPublic:true,tone:'ok'}:{code:'unsafe_named',label:'CẦN BẢO ĐẢM AN TOÀN',allowedPublic:false,tone:'warn'};
    }
    return {code:'statement',label:'XÁC NHẬN TRỰC TIẾP',allowedPublic:true,tone:'ok'};
  }

  function hasClaim(s,id,audience='private_group'){
    const c=D.claims[id];if(!c||!c.requires.every(e=>s.evidence.includes(e)))return false;
    if(c.any){const usable=c.any.filter(e=>s.evidence.includes(e)&&(e!=='E09'||s.consent.witness1?.voluntary&&(audience==='private_group'||['anonymous_summary','public_named'].includes(s.consent.witness1?.scope))));if(!usable.length)return false;}
    return true;
  }
  const allowedClaims=(s,audience='private_group')=>Object.keys(D.claims).filter(id=>hasClaim(s,id,audience));

  function evaluateBoardClaim(s,claimId,audience=null){
    const c=D.claims[claimId];if(!c)return null;
    const board=s.board||defaultBoard();
    const aud=audience||board.audience||'private_group';
    const slotted=(board.slots?.[claimId]||[]).filter(id=>s.evidence.includes(id));
    const chains=new Map();let lineageWarning=null;
    for(const id of slotted){
      const chKey=D.evidence[id]?.chain||D.evidence[id]?.lineage||id;
      if(chains.has(chKey)){
        const other=chains.get(chKey);
        lineageWarning=`CẢNH BÁO TRÙNG NHÁNH NGUỒN: ${other} và ${id} cùng thuộc một tuyến chứng từ (${chKey}), không thể thay thế nguồn đối chiếu đầu kia.`;
      }else chains.set(chKey,id);
    }
    let consentWarning=null;
    if(slotted.includes('E09')){
      const badge=consentBadge(s,'E09');
      if(badge.code==='withheld'||badge.code==='pending')consentWarning='GIỚI HẠN ĐỒNG Ý: Lời chứng E09 chưa được sự đồng ý tự nguyện để đưa vào bản đối chiếu.';
      else if(aud==='public'&&!badge.allowedPublic)consentWarning='GIỚI HẠN ĐỒNG Ý: E09 chỉ được cho phép trong nhóm kín, không được đọc trước sân chung nếu chưa xin lại phạm vi.';
    }
    const reqMet=c.requires.every(e=>slotted.includes(e));
    const anyMet=!c.any||c.any.some(e=>slotted.includes(e)&&(e!=='E09'||s.consent.witness1?.voluntary&&(aud==='private_group'||['anonymous_summary','public_named'].includes(s.consent.witness1?.scope))));
    const verified=reqMet&&anyMet&&!lineageWarning&&!(aud==='public'&&slotted.includes('E09')&&!consentBadge(s,'E09').allowedPublic&&!(c.any||[]).includes('E10')||false);
    const claimReadyInInventory=hasClaim(s,claimId,aud);
    return {
      id:claimId,title:c.title,text:c.text,scopeHint:c.scopeHint||'',
      audience:aud,slotted,requiredCount:c.requires.length+(c.any?1:0),
      lineageWarning,consentWarning,
      verified:reqMet&&anyMet,
      claimReadyInInventory
    };
  }

  function selectBoardClaim(state,claimId){
    const s=clone(state);if(!D.claims[claimId])return s;
    if(!s.board)s.board=defaultBoard();
    s.board.claim=claimId;return s;
  }
  function setBoardAudience(state,audience){
    const s=clone(state);if(!['private_group','public'].includes(audience))return s;
    if(!s.board)s.board=defaultBoard();
    s.board.audience=audience;return s;
  }
  function toggleBoardSlot(state,claimId,evidenceId){
    const s=clone(state);if(!D.claims[claimId]||!s.evidence.includes(evidenceId))return s;
    if(!s.board)s.board=defaultBoard();
    const cur=s.board.slots[claimId]||[];
    s.board.slots[claimId]=cur.includes(evidenceId)?cur.filter(x=>x!==evidenceId):[...cur,evidenceId];
    return s;
  }
  function autoFillClaim(state,claimId){
    const s=clone(state),c=D.claims[claimId];if(!c)return s;
    if(!s.board)s.board=defaultBoard();
    const aud=s.board.audience||'private_group';
    const pick=[...c.requires.filter(e=>s.evidence.includes(e))];
    if(c.any){
      const best=c.any.find(e=>s.evidence.includes(e)&&(e!=='E09'||s.consent.witness1?.voluntary&&(aud==='private_group'||['anonymous_summary','public_named'].includes(s.consent.witness1?.scope))))||c.any.find(e=>s.evidence.includes(e));
      if(best)pick.push(best);
    }
    s.board.claim=claimId;
    s.board.slots[claimId]=unique(pick);
    return s;
  }

  function release(s,audience='public'){
    const named=s.consent.witness1?.scope==='public_named'&&s.consent.witness1?.voluntary&&s.consent.witness1?.safe;
    return {claims:allowedClaims(s,audience).map(id=>({id,title:D.claims[id].title,text:D.claims[id].text})),witness:named?'Người nhận lệnh tự nguyện đứng tên':'Nội dung nhân chứng được giữ ẩn danh hoặc không đưa vào bản này.',father:s.flags.fatherConcealment?'Phần tự nhận của Haddai đã bị bỏ khỏi bản trao; cần đính chính trước nhóm.':'Haddai có trách nhiệm về việc ký trước. Không có kết luận ông lấy toàn bộ phần thiếu.'};
  }

  // Dấu vết để lại trong thế giới: mỗi quyết định đã xong sinh ra một vật thể ở đúng vùng
  // của nó. Bảng mô tả nằm ở witness-content.js; điều kiện xuất hiện nằm ở đây.
  function echoes(s){
    const out=[],q=s.quests;
    const add=id=>{const mark=D.echoMarks.find(m=>m.id===id);if(!mark)return;const bond=D.bonds.find(b=>'E-'+b.id===id);out.push(bond?{...mark,text:bond.callback}:{...mark});};
    if(q.Q01.route)add(q.Q01.route==='lodging'?'E-lodging':'E-meal');
    if(q.Q02.route)add(s.flags.yosefSafe?'E-shelter':'E-anonymous');
    if(s.flags.bridge)add('E-bridge');
    if(q.Q04.route)add(q.Q04.route==='tools'?'E-tools':'E-food');
    if(q.Q05.route)add(q.Q05.route==='open_audit'?'E-audit':'E-private');
    if(s.flags.amonInjured)add('E-amon');
    if(s.flags.paperIntegrity==='partial')add('E-paper');
    if(s.flags.fatherCorrected)add('E-father');
    for(const b of D.bonds)if(s.bonds[b.id])add('E-'+b.id);
    return out;
  }
  function callbacks(s){return echoes(s).map(e=>e.text);}

  function restore(raw){
    if(typeof raw==='string'){if(raw.length>2000000)error('Bản lưu vượt dung lượng cho phép.');try{raw=JSON.parse(raw);}catch{error('Không đọc được bản lưu JSON.');}}
    const legacy=raw?.schema===1&&raw.campaignId==='the-witness-legacy'&&raw.contentVersion==='2.0';
    if(!raw||!legacy&&(raw.schema!==2||raw.campaignId!=='the-witness-spine-v3'||raw.contentVersion!=='3.0'))error('Bản lưu không thuộc chiến dịch Chứng Nhân được hỗ trợ.');
    if(!Number.isInteger(raw.chapter)||raw.chapter<0||raw.chapter>11)error('Mốc chương trong bản lưu không hợp lệ.');
    const s=fresh(raw.profile);s.chapter=raw.chapter;
    for(const ch of D.chapters){
      const q=raw.quests?.[ch.id];if(!q||!Array.isArray(q.done)||q.done.length>80)error('Thiếu tiến độ chương trong bản lưu.');
      const routes=[...Object.keys(ch.execution),'corrected'];
      if(q.plan&&!Object.keys(ch.execution).includes(q.plan)||q.route&&!routes.includes(q.route))error('Phương án trong bản lưu không hợp lệ.');
      s.quests[ch.id]={done:unique(q.done.filter(x=>typeof x==='string'&&x.length<80)),plan:q.plan||null,route:q.route||null,decisions:q.decisions&&typeof q.decisions==='object'?clone(q.decisions):{}};
    }
    s.evidence=unique((raw.evidence||[]).filter(id=>Object.hasOwn(D.evidence,id)));
    for(const key of ['consent','flags','resources','relationships','bonds','legends','veils','positions','settings'])if(raw[key]&&typeof raw[key]==='object'&&!Array.isArray(raw[key]))s[key]={...s[key],...clone(raw[key])};
    if(raw.spatialPositions&&typeof raw.spatialPositions==='object'&&!Array.isArray(raw.spatialPositions)){
      for(const [key,p]of Object.entries(raw.spatialPositions).slice(0,48)){
        if(!/^Q(0[1-9]|1[0-2])\.(mortal|L0[1-5]|V0[1-4])$/.test(key)||!p||p.schema!==1||![p.x,p.y,p.z].every(Number.isFinite)||Math.abs(p.x)>78||Math.abs(p.z)>78||Math.abs(p.y)>30||! /^(world|q01-room|q01-roof-(main|back|front)|q01-step-([0-9]|1[0-7]))$/.test(p.supportId))continue;
        s.spatialPositions[key]={schema:1,x:p.x,y:p.y,z:p.z,supportId:p.supportId};
      }
    }
    for(const k of ['masterVolume','ambienceVolume','effectsVolume','voiceVolume','uiVolume'])s.settings[k]=typeof s.settings[k]==='number'&&Number.isFinite(s.settings[k])?Math.max(0,Math.min(1,s.settings[k])):defaultSettings()[k];
    for(const k of ['sound','autoVoice','audioCaptions','audioSpatial'])if(typeof s.settings[k]!=='boolean')s.settings[k]=defaultSettings()[k];
    if(!['recorded','system','off'].includes(s.settings.voiceMode))s.settings.voiceMode='recorded';
    if(!['natural','night'].includes(s.settings.audioRange))s.settings.audioRange='natural';
    if(!['ultra','high','balanced'].includes(s.settings.graphics))s.settings.graphics='ultra';
    if(!['day','evening'].includes(s.settings.q01Lighting))s.settings.q01Lighting='day';
    if(!['third','first'].includes(s.settings.cameraMode))s.settings.cameraMode='third';
    if(!['field','board'].includes(s.settings.workMode))s.settings.workMode='field';
    if(raw.skills&&typeof raw.skills==='object'&&!Array.isArray(raw.skills)){
      for(const k of SKILL_KEYS)if(Number.isInteger(raw.skills[k])&&raw.skills[k]>=1&&raw.skills[k]<=3)s.skills[k]=raw.skills[k];
    }
    if(raw.skillXp&&typeof raw.skillXp==='object'&&!Array.isArray(raw.skillXp)){
      for(const k of SKILL_KEYS)if(Number.isFinite(raw.skillXp[k])&&raw.skillXp[k]>=0&&raw.skillXp[k]<=100)s.skillXp[k]=raw.skillXp[k];
    }
    if(raw.board&&typeof raw.board==='object'&&!Array.isArray(raw.board)){
      const slots=defaultBoard().slots;
      for(const cid of Object.keys(slots)){
        if(Array.isArray(raw.board.slots?.[cid]))slots[cid]=unique(raw.board.slots[cid].filter(id=>Object.hasOwn(D.evidence,id)));
      }
      s.board={
        claim:Object.hasOwn(D.claims,raw.board.claim)?raw.board.claim:'P01',
        audience:['private_group','public'].includes(raw.board.audience)?raw.board.audience:'private_group',
        slots
      };
    }
    if(raw.talked&&typeof raw.talked==='object'&&!Array.isArray(raw.talked)){
      s.talked=Object.fromEntries(Object.entries(raw.talked).filter(([pid,list])=>Object.hasOwn(D.people,pid)&&Array.isArray(list)).map(([pid,list])=>[pid,unique(list.filter(x=>typeof x==='string'&&x.length<40))]));
    }
    if(Array.isArray(raw.quietSeen)){
      s.quietSeen=unique(raw.quietSeen.filter(id=>D.chapters.some(c=>c.id===id)));
    }
    for(const id of Object.keys(s.consent)){const c=s.consent[id];if(!c||!['private_group','anonymous_summary','public_named','withheld'].includes(c.scope))delete s.consent[id];}
    s.workshop=readWorkshop(raw.workshop,s);
    s.craft=readCraft(raw.craft,null,true);
    const validReceipts=(id,list)=>Array.isArray(list)&&list.length<=D.legends[id].beats.length&&list.every((r,i)=>r?.beat===D.legends[id].beats[i].id&&r.revision===D.legends[id].revision&&['interactive','accessible_summary'].includes(r.format));
    s.legends=Object.fromEntries(Object.entries(s.legends).filter(([id])=>Object.hasOwn(D.legends,id)));
    s.veils=Object.fromEntries(Object.entries(s.veils).filter(([id])=>Object.hasOwn(D.veils,id)));
    for(const id of D.spine){
      const r=s.legends[id];
      if(legacy){s.legends[id]={status:'needs_revisit',completed:false,receipts:[],revision:D.coreRevision};continue;}
      if(r&&!validReceipts(id,r.receipts))error('Tiến độ bản văn trong bản lưu không hợp lệ.');
      const cp=r?.checkpoint;
      if(r?.workshop)r.workshop=readWorkshop(r.workshop,s);
      if(cp?.workshop)cp.workshop=readWorkshop(cp.workshop,s);
      if(r?.craft)r.craft=readCraft(r.craft,id,false);
      if(cp?.craft)cp.craft=readCraft(cp.craft,id,true);
      if(cp&&(cp.kind!=='legend'||cp.id!==id||!Number.isInteger(cp.step)||cp.step<0||cp.step>D.legends[id].steps.length||!validReceipts(id,cp.receipts)||!['interactive','accessible_summary'].includes(cp.format)||!Number.isInteger(cp.summaryIndex)||cp.summaryIndex<0||cp.summaryIndex>D.legends[id].beats.length))error('Điểm dừng chương trong bản lưu không hợp lệ.');
      if(r?.status==='committed'&&!legendComplete(s,id))error('Chương được đánh dấu xong nhưng chưa đủ nội dung.');
      if(legendComplete(s,id)){s.campaignProgress.requiredLegends[id]=D.coreRevision;s.unlockedBridgeContext.push(id);}
    }
    if(raw.layer&&['legend','veil'].includes(raw.layer.kind)){
      const src=raw.layer.kind==='legend'?D.legends:D.veils,l=raw.layer;
      if(!src[l.id]||!Number.isInteger(l.step)||l.step<0||l.step>src[l.id].steps.length)error('Cảnh trải nghiệm trong bản lưu không hợp lệ.');
      if(!(legacy&&src[l.id].required)){
        if(src[l.id].required&&(!validReceipts(l.id,l.receipts)||!['interactive','accessible_summary'].includes(l.format)||!Number.isInteger(l.summaryIndex)||l.summaryIndex<0||l.summaryIndex>src[l.id].beats.length))error('Trang nguồn trong bản lưu không hợp lệ.');
        s.layer=clone(l);
        if(s.layer.workshop)s.layer.workshop=readWorkshop(s.layer.workshop,s);
        if(s.layer.craft)s.layer.craft=readCraft(s.layer.craft,s.layer.id,true);
      }
    }
    for(const key of ['money','food','tools'])if(!Number.isFinite(s.resources[key])||s.resources[key]<0||s.resources[key]>100)error('Tài nguyên trong bản lưu không hợp lệ.');
    s.events=Array.isArray(raw.events)?raw.events.filter(e=>e&&typeof e.type==='string').slice(-4000):[];
    s.finished=!!raw.finished&&!!s.quests.Q12.route&&allLegends(s);
    s.pendingEscort=raw.pendingEscort&&raw.pendingEscort.chapter===chapter(s).id?clone(raw.pendingEscort):null;
    s.migration=legacy?{from:'2.0',wasFinished:!!raw.finished,legacyLegends:clone(raw.legends||{}),message:'Tiến độ đời thường được giữ. Ba chương chính cần được tiếp nhận theo nội dung mới.'}:raw.migration||null;
    s.pendingBond=raw.pendingBond&&D.bonds.some(b=>b.id===raw.pendingBond.id&&b.choices.some(c=>c[0]===raw.pendingBond.choice))?clone(raw.pendingBond):null;
    s.lastSaved=typeof raw.lastSaved==='string'?raw.lastSaved:null;
    return s;
  }

  function save(state,storage=root.localStorage){const s=clone(state);s.lastSaved=new Date().toISOString();try{const previous=storage.getItem(STORE);if(previous){try{restore(previous);storage.setItem(BACKUP,previous);}catch{}}storage.setItem(STORE,JSON.stringify(s));return {state:s,persisted:true};}catch{return {state:s,persisted:false};}}
  function load(storage=root.localStorage){try{const text=storage.getItem(STORE);if(!text){const old=storage.getItem(LEGACY);return old?{state:restore(old),recovered:false,migrated:true}:{state:null,recovered:false};}try{return {state:restore(text),recovered:false};}catch{const b=storage.getItem(BACKUP);if(b)return {state:restore(b),recovered:true};return {state:null,recovered:false,corrupt:true};}}catch{return {state:null,recovered:false,unavailable:true};}}

  function workshopState(s){return s.layer?(s.layer.workshop||{drafts:{},records:{}}):(s.workshop||{drafts:{},records:{}});}
  function readWorkshop(raw,s){
    const out={drafts:{},records:{}};
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
    for(const def of X.all()){
      const d=X.materialize(s,def),draft=raw.drafts?.[def.id],record=raw.records?.[def.id];
      if(draft&&typeof draft==='object')out.drafts[def.id]={payload:X.normalize(d,draft.payload),assisted:draft.assisted===true};
      if(record&&record.revision===def.revision)out.records[def.id]={revision:def.revision,payload:X.normalize(d,record.payload),summary:d.outcome+' '+X.describe(s,d,record.payload),assisted:record.assisted===true};
    }
    return out;
  }
  function workshopDraft(state,id,payload,{assisted=false}={}){
    const s=clone(state),a=actions(s).find(a=>a.id===id),def=X.encounter(s,a);
    if(!def)error('Bàn thao tác này không còn ở bước hiện tại.');
    const data=X.normalize(X.materialize(s,def),payload),old=workshopState(s);
    const next={drafts:{...old.drafts,[def.id]:{payload:data,assisted:assisted||old.drafts[def.id]?.assisted===true}},records:{...old.records}};
    if(s.layer){s.layer.workshop=next;rememberLayer(s);}else s.workshop=next;
    return s;
  }
  function recordWorkshop(s,a,payload){
    const def=X.encounter(s,a),old=workshopState(s),p=X.normalize(X.materialize(s,def),payload);
    const next={drafts:{...old.drafts},records:{...old.records,[def.id]:{revision:def.revision,payload:p,summary:X.materialize(s,def).outcome+' '+X.describe(s,def,p),assisted:old.drafts[def.id]?.assisted===true}}};
    delete next.drafts[def.id];
    if(s.layer)s.layer.workshop=next;else s.workshop=next;
    const scope=s.layer||s;if(scope.craft?.field?.encounter===def.id)scope.craft.field=null;
  }
  function readCraft(raw,owner=null,keepField=true){
    const ids=new Set(C.allDetailIds()),out={looked:[],field:null};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
    out.looked=unique((Array.isArray(raw.looked)?raw.looked:[]).filter(id=>ids.has(id)&&(!owner||id.startsWith('craft:'+owner+'-')))).slice(0,100);
    const f=raw.field,d=X.all().find(d=>d.id===f?.encounter);
    if(keepField&&d&&d.actions.includes(f.action)&&(!owner||d.owner===owner)){
      out.field={encounter:d.id,action:f.action,selected:typeof f.selected==='string'&&/^[a-z0-9-]{1,40}$/.test(f.selected)?f.selected:null};
    }
    if(raw.views&&typeof raw.views==='object'&&!Array.isArray(raw.views)){
      out.views={};for(const [id,v]of Object.entries(raw.views))if(ids.has(id)&&(!owner||id.startsWith('craft:'+owner+'-'))&&v&&typeof v==='object')out.views[id]={lift:v.lift===true,light:[0,1,2].includes(v.light)?v.light:0};
    }
    if(!owner&&D.bonds.some(b=>b.id===raw.lastWork?.bond)&&Number.isInteger(raw.lastWork.chapter)&&raw.lastWork.chapter>=0&&raw.lastWork.chapter<12)out.lastWork={bond:raw.lastWork.bond,chapter:raw.lastWork.chapter};
    return out;
  }
  function writeCraft(s,data){if(s.layer){s.layer.craft=data;rememberLayer(s);}else s.craft=data;return s;}
  function inspectDetail(state,id,position){
    requireGroundWork(state);
    const detail=C.details(state).find(d=>d.id===id);if(!detail||!Array.isArray(position)||position.length!==2||!position.every(Number.isFinite)||Math.hypot(position[0]-detail.at[0],position[1]-detail.at[1])>3.2)error('Hãy tới gần chi tiết trước khi quan sát.');
    const s=clone(state),old=C.stores(s);return writeCraft(s,{...old,looked:unique([...(old.looked||[]),id]),field:old.field||null});
  }
  function detailView(state,id,position,options={}){
    const s=inspectDetail(state,id,position),old=C.stores(s),prev=old.views?.[id]||{lift:false,light:0};
    return writeCraft(s,{...old,views:{...(old.views||{}),[id]:{lift:typeof options.lift==='boolean'?options.lift:prev.lift,light:[0,1,2].includes(options.light)?options.light:prev.light}}});
  }
  function fieldStart(state,id){
    requireGroundWork(state);
    let s=clone(state);const a=actions(s).find(a=>a.id===id),def=X.encounter(s,a);if(!def)error('Phần việc này chưa sẵn sàng tại cảnh.');
    const old=C.stores(s);s=writeCraft(s,{...old,looked:old.looked||[],field:{encounter:def.id,action:id,selected:null}});
    const p=workshopState(s).drafts[def.id]?.payload||X.empty(X.materialize(s,def));return workshopDraft(s,id,p);
  }
  function fieldSelect(state,item){
    const f=C.field(state);if(!f||![...(f.def.items||[]),...(f.def.cards||[])].some(x=>x.id===item))error('Người, vật hoặc dấu này không thuộc phần việc hiện tại.');
    const s=clone(state),c=C.stores(s);return writeCraft(s,{...c,field:{...c.field,selected:item}});
  }
  function fieldAct(state,id,options={}){
    requireGroundWork(state);
    const f=C.field(state),spot=C.fieldSpots(state).find(x=>x.id===id),p=options.position;
    if(!f||!spot||!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||Math.hypot(p[0]-spot.at[0],p[1]-spot.at[1])>2.8)error('Hãy tới đúng điểm thao tác trong cảnh trước.');
    const result=C.reduceField(state,spot,options);return {ok:result.ok,message:result.message,state:result.ok?workshopDraft(state,f.a.id,result.payload):state};
  }
  function fieldReset(state,back=false){
    const f=C.field(state);if(!f)error('Chưa có phần việc tại cảnh.');let p=clone(f.payload);
    if(!back)p=X.empty(f.def);else if(f.def.type==='sequence')p.order.pop();else if(f.def.type==='route'){if(p.path.length>1)p.path.pop();}else if(p.assignments&&f.selected)delete p.assignments[f.selected];
    return workshopDraft(state,f.a.id,p);
  }
  function fieldStop(state){const s=clone(state),old=C.stores(s);return writeCraft(s,{...old,looked:old.looked||[],field:null});}
  function fieldFinish(state,position){
    requireGroundWork(state);
    const f=C.field(state);if(!f||!Array.isArray(position)||position.length!==2||!position.every(Number.isFinite)||Math.hypot(position[0]-f.origin[0],position[1]-f.origin[1])>3.4)error('Hãy trở lại điểm bàn giao trước khi thực hiện phương án.');
    const result=X.evaluate(state,f.def,f.payload);if(!result.ok)error(result.issues[0]||'Phương án còn phần cần đối chiếu.');
    const s=fieldStop(state);return s.layer?layerStep(s,f.a.id,{position,work:f.payload}):act(s,f.a.id,{puzzle:{work:f.payload}});
  }

  const Model={
    fresh,chapter,quest,actions,planAllowed,checkPuzzle,act,chooseAgain,escort,workshopState,workshopDraft,inspectDetail,detailView,fieldStart,fieldSelect,fieldAct,fieldReset,fieldStop,fieldFinish,
    openLayer,layerStep,closeLayer,switchLayer,summaryStep,adjustComposure,
    legendComplete,dueLegend,allLegends,attunement,kitStatus,tenets,activeTenetForChapter,
    startBond,bond,talkTopics,recordTalk,recordQuiet,
    consentBadge,hasClaim,allowedClaims,evaluateBoardClaim,selectBoardClaim,setBoardAudience,toggleBoardSlot,autoFillClaim,release,
    echoes,callbacks,restore,save,load,layerAt,STORE,BACKUP,LEGACY
  };
  root.WitnessModel=Model;if(typeof module!=='undefined')module.exports=Model;
})(globalThis);
