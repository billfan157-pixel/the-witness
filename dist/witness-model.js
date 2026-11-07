(function(root){
  'use strict';
  const D=root.WitnessContent||(typeof require!=='undefined'?require('./witness-content.js'):null);
  if(typeof require!=='undefined')require('./witness-spine.js');
  const STORE='the-witness.spine.v3', BACKUP=STORE+'.backup',LEGACY='the-witness.campaign.v2';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const error=message=>{throw new Error(message);};
  const unique=a=>[...new Set(a)];
  function fresh(profile={}){
    return {schema:2,contentVersion:'3.0',campaignId:'the-witness-spine-v3',chapter:0,
      profile:{name:String(profile.name||'Người Chứng').trim().slice(0,28)||'Người Chứng',gender:['male','female'].includes(profile.gender)?profile.gender:'male',origin:['port','scribe','road'].includes(profile.origin)?profile.origin:'scribe',attire:['sand','green','blue'].includes(profile.attire)?profile.attire:'sand'},
      quests:Object.fromEntries(D.chapters.map(q=>[q.id,{done:[],plan:null,route:null,decisions:{}}])),evidence:[],consent:{},flags:{},resources:{money:3,food:3,tools:1},
      relationships:{miriam:0,damar:0,lea:0,titus:0},bonds:{},legends:{},veils:{},events:[],layer:null,positions:{},pendingEscort:null,finished:false,
      pendingBond:null,campaignProgress:{requiredLegends:{}},unlockedBridgeContext:[],migration:null,settings:{text:1,motion:'calm',sound:false,guide:true,comfort:true},lastSaved:null};
  }
  const chapter=s=>D.chapters[Math.min(s.chapter,D.chapters.length-1)];
  const quest=s=>s.quests[chapter(s).id];
  function log(s,type,data={}){s.events.push({seq:s.events.length+1,type,quest:chapter(s).id,...data});}
  function relation(s,who,amount){s.relationships[who]=Math.max(-2,Math.min(2,(s.relationships[who]||0)+amount));}
  function condition(s,key){const q=quest(s);return key==='pressure'?!!s.flags.pressure:key==='needs'?!s.flags.needsHeard&&!s.flags.pressure:key==='anonymous-unprotected'?s.quests.Q02.route==='anonymous'&&!s.flags.yosefSafe:true;}
  function actions(s){
    if(s.finished&&!s.layer)return [];
    if(s.layer){const l=s.layer,src=l.kind==='legend'?D.legends[l.id]:D.veils[l.id];if(l.format==='accessible_summary')return [{id:'read-summary',target:'layer-summary',title:'Tiếp tục bản tóm tắt',text:src.ref,at:src.start||[-7,4],layer:true}];const step=src.steps[l.step];const main=step?{id:step[0],target:'layer-'+l.step,title:step[1],text:step[2],at:layerAt(l.step,s),layer:true,kind:step.kind||'observe',choices:step.choices,order:step.order,orderLabels:step.orderLabels,beat:step.beat,reference:step.reference}:{id:'return',target:'layer-return',title:'Khép chương và trở về',text:src.bridge||'Trở lại với người đang sống',at:src.returnAt||[13,-10],layer:true};return [main,...(src.discoveries||[]).filter(d=>!(l.discovered||[]).includes(d.id)).map(d=>({id:'discover:'+d.id,target:'discovery-'+d.id,title:d.title,text:d.text,at:d.at,layer:true,kind:'discovery'}))];}
    const ch=chapter(s),q=quest(s);
    if(q.route){const due=dueLegend(s);return [...(s.chapter===2&&condition(s,'anonymous-unprotected')?[ch.tasks[0]]:[]),due?{id:'legend-gate',target:'gate',legend:due,title:D.legends[due].name+' — '+D.legends[due].title,text:'Chương chính · Chơi hoặc xem tóm tắt đủ nội dung để tiếp tục.',needs:[]}:{id:'advance',target:'gate',title:s.chapter===11?'Nhìn lại bến sau cuộc nói':'Tiếp tục hành trình',text:ch.ending[q.route]||ch.quiet,needs:[]},...bondAction(s)];}
    const source=q.plan?(ch.execution[q.plan]||[]):ch.tasks;
    let result=source.filter(a=>!q.done.includes(a.id)&&(a.needs||[]).every(id=>q.done.includes(id))&&(!a.when||condition(s,a.when)));
    if(q.plan){
      result=result.filter(a=>a.id!=='choose');
      if(s.chapter===7)result=[...ch.tasks.filter(a=>['anchor','support','wrap'].includes(a.id)&&!q.done.includes(a.id)&&a.needs.every(id=>q.done.includes(id))),...result];
    }
    if(s.chapter===2&&condition(s,'anonymous-unprotected')&&!q.done.includes('protect'))result=[ch.tasks[0],...result.filter(a=>a.id!=='protect')];
    return [...result,...bondAction(s)];
  }
  function bondAction(s){const pending=s.pendingBond;if(!pending)return [];const b=D.bonds.find(b=>b.id===pending.id);if(!b||s.bonds[b.id])return [];return [{id:'bond-work',target:'bond-work',title:'Cùng thực hiện: '+b.title,text:b.choices.find(c=>c[0]===pending.choice)?.[2]||b.text,puzzle:['natan','titus','damar'].includes(b.person)?'brace':b.person==='rina'?'supplies':b.person==='lea'?'copy':'claims',bond:b.id,success:b.callback,needs:[]}];}
  function layerAt(i,s){const l=s?.layer,src=l&&(l.kind==='legend'?D.legends[l.id]:D.veils[l.id]),step=src?.steps[i];return step?.routeAt?.[l.route||'near']||(Array.isArray(step?.at)?step.at:null)||[[-7,4],[0,-3],[9,-8]][i]||src?.returnAt||[13,-10];}
  function legendComplete(s,id){const src=D.legends[id],r=s.legends[id];return !!(src?.required&&r?.status==='committed'&&r.revision===src.revision&&r.finalAcknowledged&&r.receipts?.length===src.beats.length&&r.receipts.every((b,i)=>b.beat===src.beats[i].id&&b.revision===src.revision&&['interactive','accessible_summary'].includes(b.format)));}
  function dueLegend(s){return D.spine.find(id=>{const l=D.legends[id];return !legendComplete(s,id)&&(s.chapter>l.after||s.chapter===l.after&&!!s.quests[D.chapters[l.after].id].route);})||null;}
  const allLegends=s=>D.spine.every(id=>legendComplete(s,id));
  function planAllowed(s,route){
    const q=quest(s),ch=chapter(s),a=ch.tasks.find(a=>a.plan);
    if(!a||!a.choices.some(c=>c[0]===route))return false;
    if(ch.id==='Q02'&&route==='consented')return !!s.flags.needsHeard&&!s.flags.pressure;
    if(ch.id==='Q03'&&route==='paid')return s.resources.money>=1;
    if(ch.id==='Q08'&&route==='prepared_rescue')return ['anchor','support','wrap'].every(x=>q.done.includes(x));
    return true;
  }
  function checkPuzzle(s,a,p={}){
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
  function addEvidence(s,id){if(id&&!s.evidence.includes(id)){s.evidence.push(id);log(s,'EvidenceRecorded',{evidence:id,lineage:D.evidence[id].lineage});}}
  function effects(s,a,choice){
    const ch=chapter(s),q=quest(s);
    if(a.evidence&&!(ch.id==='Q09'&&choice==='decline'))addEvidence(s,a.evidence);
    if(ch.id==='Q01'&&a.id==='ledger')s.flags.ledger=true;
    if(ch.id==='Q02'){
      if(a.id==='meet'){s.flags.yosefMet=true;s.flags.pressure=choice==='pressure';if(choice==='listen'){s.flags.needsHeard=true;q.done=unique([...q.done,'needs']);}if(choice==='pressure'){relation(s,'miriam',-1);log(s,'PressureUsed',{actor:'yosef'});}}
      if(a.id==='repair-pressure'){s.flags.pressure=false;log(s,'PressureRepaired',{actor:'yosef'});}
      if(a.id==='needs')s.flags.needsHeard=true;
      if(a.id==='consent'){s.consent.yosef={scope:'private_group',voluntary:true,safe:true};log(s,'ConsentChanged',{actor:'yosef',scope:'private_group'});}
    }
    if(ch.id==='Q03'&&a.id==='bridge')s.flags.bridge=choice==='repair';
    if(ch.id==='Q03'&&a.id==='protect'){s.flags.yosefSafe=true;log(s,'WitnessProtected',{actor:'yosef'});}
    if(ch.id==='Q09'&&a.id==='statement'){s.consent.witness1={scope:choice==='decline'?'withheld':choice,voluntary:choice!=='decline',safe:false};log(s,'ConsentChanged',{actor:'witness1',scope:s.consent.witness1.scope});}
    if(ch.id==='Q11'&&a.id==='scope'){s.consent.witness1={scope:choice,voluntary:true,safe:true};log(s,'ConsentChanged',{actor:'witness1',scope:choice});}
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
    if(state.layer)error('Hãy hoàn tất hoặc rời trải nghiệm hiện tại trước.');
    const s=clone(state),ch=chapter(s),q=quest(s);const a=actions(s).find(x=>x.id===id);if(!a)error('Việc này chưa sẵn sàng hoặc đã hoàn tất.');
    if(a.legend)error('Hãy mở chương chính bằng phần chơi hoặc bản tóm tắt.');
    if(a.bond){if(!checkPuzzle(s,a,options.puzzle))error('Hãy hoàn tất phần cùng làm trước khi ghi nhận.');return bond(s,a.bond,s.pendingBond.choice,{completedWork:true});}
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
    if(a.escort){const destination=ch.nodes.find(n=>n.id===a.destination)?.at;const p=options.position;if(!s.pendingEscort||s.pendingEscort.id!==a.id||!Array.isArray(p)||Math.hypot(p[0]-destination[0],p[1]-destination[1])>5)error('Cần đi cùng và tới nơi đã có người nhận trước khi ghi hoàn tất.');}
    q.done=unique([...q.done,id]);if(a.escort)s.pendingEscort=null;if(options.choice)q.decisions[id]=options.choice;
    effects(s,a,options.choice);log(s,'ActionCompleted',{action:id,choice:options.choice||null});
    if(a.commit)commit(s,a,options.choice);
    return s;
  }
  function chooseAgain(state){const s=clone(state),ch=chapter(s),q=quest(s);if(q.route||s.pendingEscort)error('Hãy hoàn tất đoạn đang thực hiện trước.');const original=new Set(ch.tasks.map(a=>a.id));q.done=q.done.filter(id=>original.has(id));q.plan=null;log(s,'PlanRevised');return s;}
  function escort(state,id){const s=clone(state),a=actions(s).find(a=>a.id===id&&a.escort);if(!a)error('Đoạn đi cùng chưa sẵn sàng.');s.pendingEscort={id,chapter:chapter(s).id,target:a.target,destination:a.destination};log(s,'EscortStarted',{action:id});return s;}
  function rememberLayer(s){const l=s.layer;if(!l||l.kind!=='legend'||!D.legends[l.id].required||l.replay)return;s.legends[l.id]={...s.legends[l.id],status:'in_progress',completed:false,revision:D.legends[l.id].revision,receipts:clone(l.receipts||[]),discovered:clone(l.discovered||[]),checkpoint:clone(l)};}
  function openLayer(state,kind,id,format=null){
    const s=clone(state),ch=chapter(s),source=kind==='legend'?D.legends:D.veils,src=source[id];
    if(s.layer||!src||!['legend','veil'].includes(kind))error('Trải nghiệm này chưa mở trong hành trình.');
    const required=kind==='legend'&&src.required,replay=required?legendComplete(s,id):!!s[kind==='legend'?'legends':'veils'][id]?.completed;
    if(required){const earlier=D.spine.slice(0,D.spine.indexOf(id));if(!replay&&(dueLegend(s)!==id||!s.quests[D.chapters[src.after].id].route||!earlier.every(k=>legendComplete(s,k))))error('Chương này mở sau phần chuẩn bị và chương nguồn trước nó.');}else if((kind==='legend'?ch.legend:ch.veil)!==id)error('Trải nghiệm này chưa mở trong hành trình.');
    if(format&&(!['interactive','accessible_summary'].includes(format)||format==='accessible_summary'&&!required))error('Định dạng không hợp lệ.');
    const checkpoint=required&&!replay?s.legends[id]?.checkpoint:null;
    s.layer=checkpoint?clone(checkpoint):{kind,id,step:0,reflection:null,format:'interactive',summaryIndex:0,receipts:[],discovered:[],route:'near'};s.layer.replay=replay;if(replay)delete s.positions[ch.id+'.'+id];
    if(format&&format!==s.layer.format)return switchLayer(s,format);
    rememberLayer(s);return s;
  }
  function addReceipt(s,beat){const l=s.layer,src=D.legends[l.id];if(l.receipts.some(r=>r.beat===beat))return;const expected=src.beats[l.receipts.length];if(expected?.id!==beat)error('Nội dung nguồn cần được tiếp nhận theo thứ tự.');l.receipts.push({beat,revision:src.revision,format:l.format});if(!l.replay)log(s,'CoreBeatPresented',{legend:l.id,beat,format:l.format,revision:src.revision});}
  function layerStep(state,id,options={}){
    const s=clone(state),l=s.layer;if(!l||l.format==='accessible_summary')error('Hãy tiếp tục phần trình bày đang mở.');const src=l.kind==='legend'?D.legends[l.id]:D.veils[l.id],a=actions(s).find(a=>a.id===id);if(!a||id==='return')error('Cần đi theo mạch của cảnh.');
    if(src.required){const at=options.position;if(!Array.isArray(at)||at.length!==2||!at.every(Number.isFinite)||Math.hypot(at[0]-a.at[0],at[1]-a.at[1])>4)error('Hãy tới địa vật trước khi thực hiện.');}
    if(a.kind==='discovery'){l.discovered=unique([...(l.discovered||[]),id.slice(9)]);rememberLayer(s);return s;}
    if(a.kind==='route'){if(!a.choices.some(c=>c[0]===options.choice))error('Hãy chọn một lối để khảo sát.');l.route=options.choice;}
    if(a.kind==='order'&&JSON.stringify(options.order)!==JSON.stringify(a.order))error('Cần chuẩn bị, giữ vật rồi kiểm lại. Có thể dùng hướng dẫn từng bước.');
    if(a.kind==='source'){if(!options.acknowledged)error('Hãy tiếp nhận phần nguồn rồi chọn tiếp tục.');addReceipt(s,a.beat);}
    l.step++;rememberLayer(s);return s;
  }
  function switchLayer(state,format){const s=clone(state),l=s.layer,src=l&&D.legends[l.id];if(!l||l.kind!=='legend'||!src.required||!['interactive','accessible_summary'].includes(format))error('Không thể đổi định dạng ở đây.');l.format=format;if(format==='accessible_summary')l.summaryIndex=l.receipts.length;else{const next=src.beats[l.receipts.length]?.id;l.step=next?src.steps.findIndex(a=>a.beat===next):src.steps.length;}rememberLayer(s);return s;}
  function summaryStep(state,direction=1){const s=clone(state),l=s.layer,src=l&&D.legends[l.id];if(!src?.required||l.format!=='accessible_summary')error('Chưa mở bản tóm tắt.');if(direction===-1){l.summaryIndex=Math.max(0,l.summaryIndex-1);}else if(direction===1&&l.summaryIndex<src.summaryPages.length){addReceipt(s,src.summaryPages[l.summaryIndex].id);l.summaryIndex++;}else error('Trang tóm tắt không hợp lệ.');rememberLayer(s);return s;}
  function closeLayer(state,{skip=false,reflection=null}={}){
    const s=clone(state),l=s.layer;if(!l)error('Không có trải nghiệm đang mở.');const source=l.kind==='legend'?D.legends[l.id]:D.veils[l.id];
    if(l.kind==='legend'&&source.required){if(skip){rememberLayer(s);s.layer=null;return s;}const ended=l.format==='accessible_summary'?l.summaryIndex===source.summaryPages.length:l.step===source.steps.length;if(!ended||l.receipts.length!==source.beats.length||!l.receipts.every((r,i)=>r.beat===source.beats[i].id&&r.revision===source.revision))error('Chương còn nội dung chính chưa tới phần kết.');if(!l.replay){s.legends[l.id]={status:'committed',completed:true,revision:source.revision,receipts:clone(l.receipts),discovered:clone(l.discovered),finalAcknowledged:true,format:l.receipts.every(r=>r.format===l.format)?l.format:'mixed',reflection:typeof reflection==='string'?reflection.slice(0,180):null};s.campaignProgress.requiredLegends[l.id]=source.revision;s.unlockedBridgeContext=unique([...s.unlockedBridgeContext,l.id]);log(s,'LegendCommitted',{legend:l.id,revision:source.revision,format:s.legends[l.id].format});}s.layer=null;if(s.migration?.wasFinished&&s.quests.Q12.route&&allLegends(s)){s.finished=true;log(s,'CAMPAIGN.V3.COMMITTED',{migrated:true});}return s;}
    if(!skip&&l.step<source.steps.length)error('Cảnh còn phần chưa hoàn tất.');
    if(l.kind==='legend')s.legends[l.id]={completed:true,skipped:skip};else s.veils[l.id]={completed:true,skipped:skip,reflection:!skip&&source.answers.includes(reflection)?reflection:null};
    s.layer=null;return s;
  }
  function startBond(state,id,choice){const s=clone(state),b=D.bonds.find(x=>x.id===id);if(s.layer||!b||b.from>s.chapter||s.bonds[id]||!b.choices.some(c=>c[0]===choice))error('Việc cùng nhân vật chưa sẵn sàng.');if(s.pendingBond)error('Hãy hoàn tất phần việc riêng đang nhận trước.');s.pendingBond={id,choice};log(s,'RelationshipTaskPlanned',{bond:id,choice});return s;}
  function bond(state,id,choice,{completedWork=false}={}){const s=clone(state),b=D.bonds.find(x=>x.id===id);if(!completedWork||s.pendingBond?.id!==id||s.pendingBond?.choice!==choice||s.layer||!b||b.from>s.chapter||s.bonds[id]||!b.choices.some(c=>c[0]===choice))error('Việc cùng nhân vật chưa hoàn tất.');s.bonds[id]=choice;s.pendingBond=null;log(s,'RelationshipTaskCompleted',{bond:id,choice});if(Object.hasOwn(s.relationships,b.person))relation(s,b.person,1);return s;}
  function hasClaim(s,id,audience='private_group'){
    const c=D.claims[id];if(!c||!c.requires.every(e=>s.evidence.includes(e)))return false;
    if(c.any){const usable=c.any.filter(e=>s.evidence.includes(e)&&(e!=='E09'||s.consent.witness1?.voluntary&&(audience==='private_group'||['anonymous_summary','public_named'].includes(s.consent.witness1?.scope))));if(!usable.length)return false;}
    return true;
  }
  const allowedClaims=(s,audience='private_group')=>Object.keys(D.claims).filter(id=>hasClaim(s,id,audience));
  function release(s,audience='public'){
    const named=s.consent.witness1?.scope==='public_named'&&s.consent.witness1?.voluntary&&s.consent.witness1?.safe;
    return {claims:allowedClaims(s,audience).map(id=>({id,title:D.claims[id].title,text:D.claims[id].text})),witness:named?'Người nhận lệnh tự nguyện đứng tên':'Nội dung nhân chứng được giữ ẩn danh hoặc không đưa vào bản này.',father:s.flags.fatherConcealment?'Phần tự nhận của Haddai đã bị bỏ khỏi bản trao; cần đính chính trước nhóm.':'Haddai có trách nhiệm về việc ký trước. Không có kết luận ông lấy toàn bộ phần thiếu.'};
  }
  function callbacks(s){const items=[];
    if(s.quests.Q01.route)items.push(s.quests.Q01.route==='lodging'?'Góc bàn đã thuê còn là nơi sao giấy và gửi lời.':'Có người nhận ca từ bữa bạn đã góp dầu.');
    if(s.quests.Q02.route)items.push(s.flags.yosefSafe?'Người chuyển bao đã có nơi nhận an toàn.':'Bản ẩn danh đã được giao; việc bảo vệ còn cần hoàn tất.');
    if(s.flags.bridge)items.push('Lối qua rãnh đã sửa trở thành đường có thể dùng lại.');
    if(s.quests.Q04.route)items.push(s.quests.Q04.route==='tools'?'Bộ neo giữ lại từ đêm kho đóng có mặt trên tuyến đồi.':'Phần thực phẩm dự phòng giảm công huy động bữa khi trở về.');
    if(s.quests.Q05.route)items.push(s.quests.Q05.route==='open_audit'?'Cuộc kiểm lượng công khai mở lời giới thiệu qua sân chung.':'Nguồn đối chiếu riêng mở đường gặp kín.');
    if(s.flags.amonInjured)items.push('Amon còn cần chăm sóc sau lần kéo cùng tải.');
    if(s.flags.paperIntegrity==='partial')items.push('Phần bản phụ bị ướt vẫn được ghi là không đọc được.');
    if(s.flags.fatherCorrected)items.push('Nhóm đã nhận bản đính chính; lần giấu trước vẫn được nhớ.');
    for(const b of D.bonds)if(s.bonds[b.id])items.push(b.callback);
    return items;
  }
  function restore(raw){
    if(typeof raw==='string'){if(raw.length>2000000)error('Bản lưu vượt dung lượng cho phép.');try{raw=JSON.parse(raw);}catch{error('Không đọc được bản lưu JSON.');}}
    const legacy=raw?.schema===1&&raw.campaignId==='the-witness-legacy'&&raw.contentVersion==='2.0';
    if(!raw||!legacy&&(raw.schema!==2||raw.campaignId!=='the-witness-spine-v3'||raw.contentVersion!=='3.0'))error('Bản lưu không thuộc chiến dịch Chứng Nhân được hỗ trợ.');
    if(!Number.isInteger(raw.chapter)||raw.chapter<0||raw.chapter>11)error('Mốc chương trong bản lưu không hợp lệ.');
    const s=fresh(raw.profile);s.chapter=raw.chapter;
    for(const ch of D.chapters){const q=raw.quests?.[ch.id];if(!q||!Array.isArray(q.done)||q.done.length>80)error('Thiếu tiến độ chương trong bản lưu.');const routes=[...Object.keys(ch.execution),'corrected'];if(q.plan&&!Object.keys(ch.execution).includes(q.plan)||q.route&&!routes.includes(q.route))error('Phương án trong bản lưu không hợp lệ.');s.quests[ch.id]={done:unique(q.done.filter(x=>typeof x==='string'&&x.length<80)),plan:q.plan||null,route:q.route||null,decisions:q.decisions&&typeof q.decisions==='object'?clone(q.decisions):{}};}
    s.evidence=unique((raw.evidence||[]).filter(id=>Object.hasOwn(D.evidence,id)));
    for(const key of ['consent','flags','resources','relationships','bonds','legends','veils','positions','settings'])if(raw[key]&&typeof raw[key]==='object'&&!Array.isArray(raw[key]))s[key]={...s[key],...clone(raw[key])};
    for(const id of Object.keys(s.consent)){const c=s.consent[id];if(!c||!['private_group','anonymous_summary','public_named','withheld'].includes(c.scope))delete s.consent[id];}
    const validReceipts=(id,list)=>Array.isArray(list)&&list.length<=D.legends[id].beats.length&&list.every((r,i)=>r?.beat===D.legends[id].beats[i].id&&r.revision===D.legends[id].revision&&['interactive','accessible_summary'].includes(r.format));
    s.legends=Object.fromEntries(Object.entries(s.legends).filter(([id])=>Object.hasOwn(D.legends,id)));
    s.veils=Object.fromEntries(Object.entries(s.veils).filter(([id])=>Object.hasOwn(D.veils,id)));
    for(const id of D.spine){const r=s.legends[id];if(legacy){s.legends[id]={status:'needs_revisit',completed:false,receipts:[],revision:D.coreRevision};continue;}if(r&&!validReceipts(id,r.receipts))error('Tiến độ bản văn trong bản lưu không hợp lệ.');const cp=r?.checkpoint;if(cp&&(cp.kind!=='legend'||cp.id!==id||!Number.isInteger(cp.step)||cp.step<0||cp.step>D.legends[id].steps.length||!validReceipts(id,cp.receipts)||!['interactive','accessible_summary'].includes(cp.format)||!Number.isInteger(cp.summaryIndex)||cp.summaryIndex<0||cp.summaryIndex>D.legends[id].beats.length))error('Điểm dừng chương trong bản lưu không hợp lệ.');if(r?.status==='committed'&&!legendComplete(s,id))error('Chương được đánh dấu xong nhưng chưa đủ nội dung.');if(legendComplete(s,id)){s.campaignProgress.requiredLegends[id]=D.coreRevision;s.unlockedBridgeContext.push(id);}}
    if(raw.layer&&['legend','veil'].includes(raw.layer.kind)){const src=raw.layer.kind==='legend'?D.legends:D.veils,l=raw.layer;if(!src[l.id]||!Number.isInteger(l.step)||l.step<0||l.step>src[l.id].steps.length)error('Cảnh trải nghiệm trong bản lưu không hợp lệ.');if(!(legacy&&src[l.id].required)){if(src[l.id].required&&(!validReceipts(l.id,l.receipts)||!['interactive','accessible_summary'].includes(l.format)||!Number.isInteger(l.summaryIndex)||l.summaryIndex<0||l.summaryIndex>src[l.id].beats.length))error('Trang nguồn trong bản lưu không hợp lệ.');s.layer=clone(l);}}
    for(const key of ['money','food','tools'])if(!Number.isFinite(s.resources[key])||s.resources[key]<0||s.resources[key]>100)error('Tài nguyên trong bản lưu không hợp lệ.');
    s.events=Array.isArray(raw.events)?raw.events.filter(e=>e&&typeof e.type==='string').slice(-4000):[];s.finished=!!raw.finished&&!!s.quests.Q12.route&&allLegends(s);s.pendingEscort=raw.pendingEscort&&raw.pendingEscort.chapter===chapter(s).id?clone(raw.pendingEscort):null;
    s.migration=legacy?{from:'2.0',wasFinished:!!raw.finished,legacyLegends:clone(raw.legends||{}),message:'Tiến độ đời thường được giữ. Ba chương chính cần được tiếp nhận theo nội dung mới.'}:raw.migration||null;
    s.pendingBond=raw.pendingBond&&D.bonds.some(b=>b.id===raw.pendingBond.id&&b.choices.some(c=>c[0]===raw.pendingBond.choice))?clone(raw.pendingBond):null;s.lastSaved=typeof raw.lastSaved==='string'?raw.lastSaved:null;return s;
  }
  function save(state,storage=root.localStorage){const s=clone(state);s.lastSaved=new Date().toISOString();try{const previous=storage.getItem(STORE);if(previous){try{restore(previous);storage.setItem(BACKUP,previous);}catch{}}storage.setItem(STORE,JSON.stringify(s));return {state:s,persisted:true};}catch{return {state:s,persisted:false};}}
  function load(storage=root.localStorage){try{const text=storage.getItem(STORE);if(!text){const old=storage.getItem(LEGACY);return old?{state:restore(old),recovered:false,migrated:true}:{state:null,recovered:false};}try{return {state:restore(text),recovered:false};}catch{const b=storage.getItem(BACKUP);if(b)return {state:restore(b),recovered:true};return {state:null,recovered:false,corrupt:true};}}catch{return {state:null,recovered:false,unavailable:true};}}
  const Model={fresh,chapter,quest,actions,planAllowed,checkPuzzle,act,chooseAgain,escort,openLayer,layerStep,closeLayer,switchLayer,summaryStep,legendComplete,dueLegend,allLegends,startBond,bond,hasClaim,allowedClaims,release,callbacks,restore,save,load,layerAt,STORE,BACKUP,LEGACY};
  root.WitnessModel=Model;if(typeof module!=='undefined')module.exports=Model;
})(globalThis);
