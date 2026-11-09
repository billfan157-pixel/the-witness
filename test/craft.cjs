const assert=require('node:assert/strict');
const M=require('../witness-model.js'),D=require('../witness-content.js'),X=require('../witness-depth.js'),C=require('../witness-craft.js'),R=require('../witness-relationships.js');
const copy=x=>JSON.parse(JSON.stringify(x));let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
const physical=s=>({quests:s.quests,evidence:s.evidence,resources:s.resources,consent:s.consent,flags:s.flags,relationships:s.relationships,bonds:s.bonds,skills:s.skills,skillXp:s.skillXp,events:s.events,finished:s.finished});
function ready(id){let s=M.fresh();for(let i=0;i<=D.legends[id].after;i++){s.chapter=i;s.quests[D.chapters[i].id].route=Object.keys(D.chapters[i].execution)[0];const prev=D.spine.find(k=>D.legends[k].after===i&&k!==id);if(prev){s=M.openLayer(s,'legend',prev,'accessible_summary');while(s.layer.summaryIndex<D.legends[prev].beats.length)s=M.summaryStep(s);s=M.closeLayer(s);}}return s;}
function setup(d,choice=null){
  let s=M.fresh();s.evidence=Object.keys(D.evidence);s.consent.witness1={scope:'private_group',voluntary:true,safe:true};s.flags.finalPlan='public';
  if(d.owner.startsWith('B')){s.chapter=10;s=M.startBond(s,d.owner,choice||D.bonds.find(b=>b.id===d.owner).choices[0][0]);return s;}
  if(d.owner.startsWith('Q')){
    s.chapter=D.chapters.findIndex(q=>q.id===d.owner);const q=M.chapter(s),task=q.tasks.find(a=>d.actions.includes(a.id));
    if(!task)s.quests[q.id].plan=Object.keys(q.execution).find(k=>q.execution[k].some(a=>d.actions.includes(a.id)));
    s.quests[q.id].done=[...q.tasks,...Object.values(q.execution).flat()].map(a=>a.id).filter(id=>!d.actions.includes(id)&&id!=='choose');return s;
  }
  const kind=d.owner.startsWith('L')?'legend':'veil',src=kind==='legend'?D.legends[d.owner]:D.veils[d.owner];
  if(src.required)s=ready(d.owner);else s.chapter=D.chapters.findIndex(q=>(kind==='legend'?q.legend:q.veil)===d.owner);
  s=M.openLayer(s,kind,d.owner);
  while(!d.actions.includes(M.actions(s)[0].id)){
    const a=M.actions(s)[0],def=X.encounter(s,a);s=M.layerStep(s,a.id,{position:a.at,choice:'near',order:a.order,acknowledged:true,work:def?X.guided(s,def):undefined});
  }
  return s;
}
function use(s,key,extra={}){const spot=C.fieldSpots(s).find(p=>p.key===key);assert(spot,key);const result=M.fieldAct(s,spot.id,{position:spot.at,...extra});assert(result.ok,result.message);return result.state;}
function enact(base,d){
  const a=M.actions(base).find(a=>X.encounter(base,a)?.id===d.id);assert(a,d.id);const answer=X.guided(base,d);let s=M.fieldStart(base,a.id);
  if(d.type==='sequence')for(const id of answer.order)s=use(s,id);
  else if(d.type==='route')for(const id of answer.path.slice(1))s=use(s,id);
  else if(d.type==='ledger')for(const [id,value]of Object.entries(answer.numbers))for(let i=0;i<Number(value);i++)s=use(s,id,{delta:1});
  else if(d.type==='inference')for(const [id,value]of Object.entries(answer.claims)){s=use(s,id,{status:value.status});for(const card of value.cards){s=M.fieldSelect(s,card);s=use(s,id);}}
  else for(const [id,st]of Object.entries(answer.assignments)){s=M.fieldSelect(s,id);s=use(s,st);}
  assert.deepEqual(physical(s),physical(base),d.id+' drafting changed campaign state');
  assert(X.evaluate(s,d,C.field(s).payload).ok,d.id);
  const board=base.layer?M.layerStep(base,a.id,{position:a.at,work:answer}):M.act(base,a.id,{puzzle:{work:answer}}),done=M.fieldFinish(s,C.field(s).origin);
  assert.deepEqual(physical(done),physical(board),d.id+' field/board mismatch');return done;
}

test('Every existing scene has authored physical details; relationship work adds six distinct sites',()=>{
  assert.equal(Object.keys(C.scenes).length,27);assert.equal(R.catalog.length,6);assert.equal(X.all().length,31);
  for(const id of [...D.chapters.map(q=>q.id),...Object.keys(D.legends),...Object.keys(D.veils),...D.bonds.map(b=>b.id)])assert(C.scenes[id]?.length,id);
  assert.equal(C.allDetailIds().length,new Set(C.allDetailIds()).size);
});
test('All 25 chapter activities and six relationship tasks reach the same result through field and board play',()=>{
  for(const d of X.all()){const s=enact(setup(d),d),stash=s.layer?.workshop||s.workshop;assert(stash.records[d.id],d.id);assert.deepEqual(M.restore(JSON.stringify(s)),s,d.id+' save round trip');}
});
test('Both choices of every relationship keep agency, source boundaries and non-repeatable work',()=>{
  for(const b of D.bonds)for(const [choice]of b.choices){const d=R.catalog.find(d=>d.owner===b.id),base=setup(d,choice),s=enact(base,d);assert.equal(s.bonds[b.id],choice);assert.deepEqual(s.evidence,base.evidence);assert.deepEqual(s.resources,base.resources);assert.equal(s.craft.lastWork.bond,b.id);assert(C.details(s).some(x=>x.owner===b.id&&x.done));assert.throws(()=>M.startBond(s,b.id,choice));}
});
test('Apprentice presence and remembered sources follow the selected relationship route',()=>{
  const b=R.catalog.find(d=>d.owner==='B04'),shared=setup(b,'share_real_task'),alone=setup(b,'work_alone_with_limits');
  assert(C.augment(shared,{objects:[],targets:[]}).objects.some(o=>o.id==='craft-apprentice'));assert(!C.augment(alone,{objects:[],targets:[]}).objects.some(o=>o.id==='craft-apprentice'));
  const stage=C.augment(shared,{objects:[],targets:[]}),joint=C.details(shared).find(d=>d.owner==='B04'),learner=stage.objects.find(o=>o.id==='craft-apprentice');assert(Math.abs(learner.at[0]-joint.at[0])>1.25,'Learner must stand beside the bench rather than inside its tabletop');
  const memories=R.catalog.find(d=>d.owner==='B05'),s=setup(memories,'repair_and_listen'),d=X.materialize(s,memories);assert.equal(d.cards[0].lineage,d.cards[1].lineage);assert(d.claims[1].label.includes('Natan'));
});
test('Field operations reject remote, malformed and stale positions without changing state',()=>{
  const s=M.fieldStart(M.fresh(),'brace'),spot=C.fieldSpots(s).find(p=>p.key==='block'),before=copy(s);
  for(const position of [[99,99],[NaN,1],null,[spot.at[0]]])assert.throws(()=>M.fieldAct(s,spot.id,{position}));assert.deepEqual(s,before);
  assert.throws(()=>M.fieldFinish(s,[99,99]));assert.throws(()=>M.fieldSelect(s,'not-a-person'));assert.throws(()=>M.fieldAct(s,'field:invented',{position:spot.at}));
});
test('Unsafe preparation is refused, undo stays free and handoff is explicit',()=>{
  let s=M.fieldStart(M.fresh(),'brace');const remove=C.fieldSpots(s).find(p=>p.key==='remove'),bad=M.fieldAct(s,remove.id,{position:remove.at});assert(!bad.ok);assert.deepEqual(bad.state,s);
  s=use(s,'block');s=use(s,'lash');s=M.fieldReset(s,true);assert.deepEqual(C.field(s).payload.order,['block']);assert(!s.quests.Q01.done.includes('brace'));s=M.fieldStop(s);assert.deepEqual(s.workshop.drafts['Q01.LOAD'].payload.order,['block']);s=M.fieldStart(M.restore(JSON.stringify(s)),'brace');assert.deepEqual(C.field(s).payload.order,['block']);
});
test('Routes require graph continuity even when a player physically reaches the wrong landmark',()=>{
  const d=X.catalog.find(d=>d.id==='Q03.TRACK');let s=M.fieldStart(setup(d),'trace');const p=C.fieldSpots(s).find(p=>p.key==='porch');const result=M.fieldAct(s,p.id,{position:p.at});assert(!result.ok);assert.deepEqual(C.field(result.state).payload.path,['yard']);
  s=use(s,'wall');s=use(s,'tie');s=use(s,'porch');assert(X.evaluate(s,d,C.field(s).payload).ok);
});
test('Every field target ID is unique, in bounds, and does not collide with a step named handoff',()=>{
  for(const d of X.all()){let s=setup(d),a=M.actions(s).find(a=>X.encounter(s,a)?.id===d.id);s=M.fieldStart(s,a.id);const pts=C.fieldSpots(s);assert.equal(pts.length,new Set(pts.map(p=>p.id)).size,d.id);for(const pt of pts){assert(pt.at.every(Number.isFinite));assert(pt.at[0]>=-39&&pt.at[0]<=39&&pt.at[1]>=-37&&pt.at[1]<=29,d.id+' '+pt.key);}assert(pts.some(p=>p.key==='handoff-work'&&p.op.kind==='handoff'));}
});
test('Layer inspection and work retain their checkpoint without writing to mortal memories or inventory',()=>{
  const d=X.catalog.find(d=>d.id==='L01.AXLE');let s=setup(d),a=M.actions(s)[0],base=physical(s),detail=C.details(s)[0];s=M.inspectDetail(s,detail.id,detail.at);s=M.fieldStart(s,a.id);s=use(s,'calm');s=M.closeLayer(s,{skip:true});assert.deepEqual(physical(s),base);s=M.openLayer(M.restore(JSON.stringify(s)),'legend','L01');assert.deepEqual(C.field(s).payload.order,['calm']);assert(s.layer.craft.looked.includes(detail.id));assert.equal(s.craft.looked.length,0);
});
test('Inspecting a paper flap records an observation and view without awarding evidence, skill or consent',()=>{
  let s=M.fresh();s.chapter=1;const detail=C.details(s).find(x=>x.kind==='paper'),before=physical(s);assert.throws(()=>M.inspectDetail(s,detail.id,[30,20]));s=M.detailView(s,detail.id,detail.at,{lift:true,light:1});assert.deepEqual(physical(s),before);assert(s.craft.looked.includes(detail.id));assert(s.craft.views[detail.id].lift);assert.deepEqual(M.restore(JSON.stringify(s)),s);
});
test('Old saves gain no phantom past observations or relationship records',()=>{
  const old=M.fresh();delete old.craft;old.bonds.B04='work_alone_with_limits';const s=M.restore(old);assert.deepEqual(s.craft,{looked:[],field:null});assert(!s.workshop.records['B04.WORK']);assert(!C.details(s).some(d=>d.owner==='B04'));
});
test('Malformed craft state cannot select an unknown detail or use a made-up activity',()=>{
  const s=M.fresh();s.craft={looked:['<script>','craft:Q01-axle'],views:{bad:{lift:true},'craft:Q01-axle':{light:999,lift:'yes'}},field:{encounter:'not-a-task',action:'brace'},lastWork:{bond:'B99',chapter:0}};const restored=M.restore(s);assert.deepEqual(restored.craft.looked,['craft:Q01-axle']);assert.equal(restored.craft.field,null);assert.deepEqual(restored.craft.views['craft:Q01-axle'],{light:0,lift:false});assert(!restored.craft.lastWork);
});
test('World plans retain one primary target and replace a generic prop rather than stacking models',()=>{
  const s=M.fieldStart(M.fresh(),'brace'),plan=C.augment(s,{objects:[{id:'load',kind:'prop',variant:'supplies',at:[-10,6]}],targets:[{id:'load',at:[-10,6],main:true}]});assert.equal(plan.objects.find(o=>o.id==='load').kind,'craft-anchor');assert.equal(plan.targets.filter(t=>t.main).length,1);assert.equal(plan.targets.length,new Set(plan.targets.map(x=>x.id)).size);
});
console.log(JSON.stringify({status:'passed',checks,physicalDetails:C.allDetailIds().length,scenes:27,activities:31,relationshipVariants:12,scope:'scene-craft-field-model-and-regression; browser and human tests separate'}));
