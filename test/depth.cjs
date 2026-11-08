const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../witness-model.js'),D=require('../witness-content.js'),X=require('../witness-depth.js'),U=require('../witness-workshop-ui.js');
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name);},copy=x=>JSON.parse(JSON.stringify(x)),def=id=>X.catalog.find(d=>d.id===id);
const physical=s=>JSON.stringify({quests:s.quests,evidence:s.evidence,resources:s.resources,consent:s.consent,relationships:s.relationships,flags:s.flags,events:s.events});
function full(){const s=M.fresh();s.evidence=Object.keys(D.evidence);s.consent.witness1={scope:'private_group',voluntary:true,safe:true};s.flags.finalPlan='public';return s;}
function ready(id){let s=M.fresh();for(let i=0;i<=D.legends[id].after;i++){s.chapter=i;s.quests[D.chapters[i].id].route=Object.keys(D.chapters[i].execution)[0];const earlier=D.spine.find(k=>D.legends[k].after===i&&k!==id);if(earlier){s=M.openLayer(s,'legend',earlier,'accessible_summary');while(s.layer.summaryIndex<D.legends[earlier].beats.length)s=M.summaryStep(s);s=M.closeLayer(s);}}return s;}
function step(s){const a=M.actions(s)[0],d=X.encounter(s,a);return M.layerStep(s,a.id,{position:a.at,choice:'near',order:a.order,acknowledged:true,work:d?X.guided(s,d):undefined});}

test('25 encounters cover every existing Q, L and V without adding chapters or source beats',()=>{
  assert.equal(X.catalog.length,25);assert.equal(new Set(X.catalog.map(x=>x.id)).size,25);
  assert.deepEqual(new Set(X.catalog.map(x=>x.owner)),new Set([...D.chapters.map(q=>q.id),...Object.keys(D.legends),...Object.keys(D.veils)]));
  assert.equal(new Set(X.catalog.map(x=>x.type)).size,7);
  for(const d of X.catalog){assert(d.rules.length&&d.hints.length===2&&d.outcome);const q=D.chapters.find(x=>x.id===d.owner),actions=q?[...q.tasks,...Object.values(q.execution).flat()].map(x=>x.id):(D.legends[d.owner]||D.veils[d.owner]).steps.map(x=>x[0]);assert(d.actions.every(id=>actions.includes(id)),d.id);}
  const contract=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/the-witness/depth-contract.json')));
  assert.deepEqual(contract.encounters.map(d=>[d.id,d.owner,d.actions,d.type]),X.catalog.map(d=>[d.id,d.owner,d.actions,d.type]));
});
test('Guidance yields an executable plan, and empty non-interpretive boards cannot certify work',()=>{
  for(const d of X.catalog){const s=full();assert(X.evaluate(s,d,X.guided(s,d)).ok,d.id);assert.equal(X.evaluate(s,d,X.empty(d)).ok,d.type==='arrangement',d.id);}
});
test('Preparation uses dependency relationships rather than one hardcoded order',()=>{
  const s=full(),d=def('Q01.LOAD');
  assert(X.evaluate(s,d,{order:['block','lash','unload','brace','test','remove']}).ok);
  const bad=X.evaluate(s,d,{order:['block','remove','unload','brace','lash','test']});assert(!bad.ok);assert(bad.issues.some(x=>x.includes('Tháo chốt cũ')));
  assert(!X.evaluate(s,d,{order:['block','block','unload','brace','test','remove']}).ok);
  for(const d of X.catalog.filter(x=>x.type==='sequence'))assert(!X.evaluate(s,d,{order:[...d.example.order].reverse()}).ok,d.id);
});
test('Both surveyed cart routes work while a disconnected or impassable route fails',()=>{
  const s=full(),d=def('Q03.TRACK');assert(X.evaluate(s,d,{path:['yard','wall','tie','porch']}).ok);assert(X.evaluate(s,d,{path:['yard','well','tie','porch']}).ok);
  assert(!X.evaluate(s,d,{path:['yard','steps','porch']}).ok);assert(!X.evaluate(s,d,{path:['yard','tie','porch']}).ok);assert(!X.evaluate(s,d,{path:['yard','well','porch']}).ok);
});
test('Cave routing enforces cumulative sound, light and return landmark independently',()=>{
  const s=full(),d=def('L02.ACOUSTICS');assert(X.evaluate(s,d,{path:['start','upper','mark','return']}).ok);assert(X.evaluate(s,d,{path:['start','wall','mark','return']}).ok);
  assert(X.evaluate(s,d,{path:['start','gravel','mark','return']}).issues.some(x=>x.includes('Tiếng dội')));
  assert(X.evaluate(s,d,{path:['start','wall','mark','mouth','return']}).issues.some(x=>x.includes('Lộ sáng')));
});
test('The ravine route needs an anchor and receiver, not merely proximity to Amon',()=>{
  const s=full(),d=def('Q08.BANK');assert(!X.evaluate(s,d,{path:['start','plank','amon']}).ok);assert(!X.evaluate(s,d,{path:['start','ledge','tree','amon']}).ok);
  assert(X.evaluate(s,d,{path:['start','ledge','detour','tree','receiver','amon']}).ok);
});
test('Allocation accepts equivalent people and rejects dropping a recipient or doubling a station',()=>{
  for(const [id,a,b]of [['L01.REARGUARD','guide','helper'],['L02.RESTRAINT','friend','player'],['L04.LANDING','helper1','helper2'],['L05.REMAIN','player','helper']]){
    const s=full(),d=def(id),p=X.guided(s,d);[p.assignments[a],p.assignments[b]]=[p.assignments[b],p.assignments[a]];assert(X.evaluate(s,d,p).ok,id);
    delete p.assignments[d.items[0].id];assert(!X.evaluate(s,d,p).ok,id);
  }
  const d=def('L04.LANDING'),p=X.guided(full(),d);p.assignments.helper2='left';assert(!X.evaluate(full(),d,p).ok);
});
test('All three promise branches preserve who really speaks and who accepted delegated work',()=>{
  for(const plan of ['personally_keep','renegotiate','delegated']){const s=full();s.quests.Q07.plan=plan;const d=def('Q07.PROMISE'),p=X.guided(s,d);assert(X.evaluate(s,d,p).ok,plan);
    if(plan==='personally_keep'){p.assignments.miriam='meal';p.assignments.player='talk';assert(!X.evaluate(s,d,p).ok);}
    if(plan==='delegated'){assert.equal(p.assignments.courier,'talk');delete p.assignments.courier;assert(!X.evaluate(s,d,p).ok);}
    assert.equal(X.materialize(s,X.materialize(s,d)).items.length,X.materialize(s,d).items.length);
  }
});
test('Conserved totals with the wrong categories cannot hide damage or unexplained bags',()=>{
  const d=def('Q05.RECONCILE'),s=full();for(const numbers of [{received:18,damaged:0,unexplained:6},{received:18,damaged:6,unexplained:0},{received:'',damaged:2,unexplained:22},{received:18,damaged:2,unexplained:-4}])assert(!X.evaluate(s,d,{numbers}).ok);
  assert(X.evaluate(s,d,{numbers:{received:'18',damaged:'2',unexplained:'4'}}).ok);
});
test('Final meal preparation follows actual reserve stock and spends at most one real portion once',()=>{
  for(const stock of [0,1,2,5]){
    let s=full();s.chapter=10;s.resources.food=stock;s.quests.Q11.done=['return'];const d=def('Q11.SUPPLIES'),p=X.guided(s,d);
    assert(X.evaluate(s,d,p).ok);if(stock===2){[p.assignments.reserve1,p.assignments.reserve2]=[p.assignments.reserve2,p.assignments.reserve1];assert(X.evaluate(s,d,p).ok);}
    s=M.act(s,'supplies',{puzzle:{work:p}});assert.equal(s.resources.food,Math.max(0,stock-1));assert.equal(s.flags.finalMealStock,stock);assert.equal(s.flags.finalMealShortfall,stock===0);assert.throws(()=>M.act(s,'supplies',{puzzle:{work:p}}));assert.deepEqual(M.restore(JSON.stringify(s)),s);
  }
});
test('Alteration on B06 cannot prove an author or become a G17 finding',()=>{
  const s=full(),d=def('Q02.PALIMPSEST'),p=X.guided(s,d);p.claims.author={status:'supported',cards:['cloth','copy']};assert(!X.evaluate(s,d,p).ok);p.claims.author={status:'open',cards:[]};p.claims.lot={status:'supported',cards:['fiber','ink']};assert(!X.evaluate(s,d,p).ok);
});
test('Copy lineage and the fathers acknowledged act stay separate from unproved intent',()=>{
  const s=full(),d=def('Q06.LINEAGE'),p=X.guided(s,d);p.claims.independent={status:'supported',cards:['original','copy']};assert(!X.evaluate(s,d,p).ok);
  const father=def('Q10.RESPONSIBILITY'),f=X.guided(s,father);f.claims.intent={status:'supported',cards:['letter']};assert(!X.evaluate(s,father,f).ok);
  f.claims.intent={status:'open',cards:[]};f.claims.missing={status:'supported',cards:['dispatch','dispatch']};assert(!X.evaluate(s,father,f).ok);
});
test('Public, distributed and relocation envelopes recompute evidence and consent at submission',()=>{
  for(const plan of ['public','distributed','relocate'])for(const scope of ['withheld','private_group','anonymous_summary','public_named'])for(const safe of [false,true]){
    const s=full();s.flags.finalPlan=plan;s.consent.witness1={scope,voluntary:scope!=='withheld',safe};const d=def('Q12.RELEASE'),p=X.guided(s,d);assert(X.evaluate(s,d,p).ok,JSON.stringify({plan,scope,safe}));
    p.assignments.home='public';assert(!X.evaluate(s,d,p).ok);p.assignments.home='private';p.assignments.name='public';assert.equal(X.evaluate(s,d,p).ok,plan==='public'&&scope==='public_named'&&safe);
  }
});
test('Refused or uncollected testimony cannot be used despite unrelated physical records',()=>{
  const s=full(),d=def('Q09.READBACK');s.consent.witness1={scope:'withheld',voluntary:false,safe:false};let p=X.guided(s,d);p.assignments.statement='group';assert(!X.evaluate(s,d,p).ok);
  s.consent.witness1={scope:'public_named',voluntary:true,safe:true};s.evidence=s.evidence.filter(x=>x!=='E09');p=X.guided(s,d);assert.equal(p.assignments.statement,'hold');
  const publicDef=def('Q12.RELEASE');s.evidence=s.evidence.filter(x=>!['E04','E05','E08'].includes(x));p=X.guided(s,publicDef);assert.equal(p.assignments.lot,'hold');assert.equal(p.assignments.father,'hold');
});
test('Drafts survive export/import but never finish a quest, spend supplies or grant evidence',()=>{
  let s=M.fresh(),before=physical(s);s=M.workshopDraft(s,'brace',{order:['block','lash']});assert.equal(physical(s),before);assert.deepEqual(M.restore(JSON.stringify(s)),s);assert(!s.quests.Q01.done.includes('brace'));assert.throws(()=>M.act(s,'brace',{puzzle:{work:s.workshop.drafts['Q01.LOAD'].payload}}));
  s=M.act(s,'brace',{puzzle:{work:X.guided(s,def('Q01.LOAD'))}});assert(s.workshop.records['Q01.LOAD']);assert(!s.workshop.drafts['Q01.LOAD']);assert.throws(()=>M.act(s,'brace',{puzzle:{work:X.guided(s,def('Q01.LOAD'))}}));
});
test('Legacy 0.3 saves and assisted plans keep compatibility without inventing old completions',()=>{
  const raw=M.fresh();delete raw.workshop;const restored=M.restore(raw);assert.deepEqual(restored.workshop,{drafts:{},records:{}});
  let s=M.workshopDraft(restored,'brace',X.guided(restored,def('Q01.LOAD')),{assisted:true});s=M.act(s,'brace',{puzzle:{work:s.workshop.drafts['Q01.LOAD'].payload}});assert(s.workshop.records['Q01.LOAD'].assisted);assert.deepEqual(M.restore(JSON.stringify(s)),s);
});
test('Required source checkpoints retain partial work and keep all physical campaign state isolated',()=>{
  let s=M.openLayer(ready('L01'),'legend','L01');while(M.actions(s)[0].id!=='clear')s=step(s);const before=physical(s);
  s=M.workshopDraft(s,'clear',{order:['calm','hold']});s=M.closeLayer(s,{skip:true});s=M.restore(JSON.stringify(s));s=M.openLayer(s,'legend','L01');assert.deepEqual(s.layer.workshop.drafts['L01.AXLE'].payload.order,['calm','hold']);assert.equal(physical(s),before);
  s=step(s);assert(s.layer.workshop.records['L01.AXLE']);assert.equal(physical(s),before);
});
test('Interpretive dreams accept empty and divergent arrangements with no spiritual score',()=>{
  for(const id of ['V01.PAGES','V03.STRINGS','V04.TABLE']){const d=def(id),s=full();assert(X.evaluate(s,d,{assignments:{}}).ok);for(const station of d.stations){const p={assignments:Object.fromEntries(d.items.map(x=>[x.id,station.id]))};assert(X.evaluate(s,d,p).ok);}}
});
test('Saved notes describe the actual alternative and callbacks read those choices',()=>{
  const s=full();s.chapter=4;s.workshop.records['Q03.TRACK']={payload:{path:['yard','wall','tie','porch']}};assert(X.context(s)[0].includes('ven tường'));s.workshop.records['Q03.TRACK'].payload.path=['yard','well','tie','porch'];assert(X.context(s)[0].includes('giếng'));
  assert(X.describe(s,def('Q03.TRACK'),{path:['yard','wall','tie','porch']}).includes('Ven tường'));
});
test('Malformed workshop data is bounded and never becomes a campaign action',()=>{
  const s=M.fresh();s.workshop={drafts:{'unknown':{payload:{order:['block']}},'Q01.LOAD':{payload:{order:['unknown','block']}}},records:{unknown:{revision:1}}};const r=M.restore(s);assert(!r.workshop.drafts.unknown);assert.deepEqual(r.workshop.drafts['Q01.LOAD'].payload.order,['block']);assert.equal(r.quests.Q01.done.length,0);
  for(const d of X.catalog)for(const p of [null,[],{order:['bad'],path:['bad'],assignments:{'<x>':'nope'},numbers:{received:'NaN'},claims:{}}])assert.doesNotThrow(()=>X.evaluate(full(),d,p),d.id);
});
test('Every rendered control is labelled and values from imported drafts are escaped',()=>{
  const d=X.materialize(full(),def('Q05.RECONCILE')),html=U.render(d,{numbers:{received:'"><script>x</script>'}});assert(!html.includes('<script>'));assert(html.includes('for="depth-received"'));assert(html.includes('data-depth-input'));assert(html.includes('aria-live="polite"'));
});
console.log(JSON.stringify({status:'passed',checks,encounters:X.catalog.length,owners:21,scope:'depth-rules-state-and-accessible-rendering; human playtest separate'}));
