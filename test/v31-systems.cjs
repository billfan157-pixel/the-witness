const assert=require('node:assert/strict');
const D=require('../witness-content.js'),M=require('../witness-model.js');
globalThis.WitnessContent=D;globalThis.WitnessModel=M;
let lastCreatedOptions=null;
globalThis.AdventureVisuals={sky:()=>()=>{}};
globalThis.AdventureCharacter={create:(T,role,options={})=>{lastCreatedOptions=options;return {role,options};}};
globalThis.CharacterProfiles={profiles:{},get:id=>({id,kind:'biblical'})};
globalThis.Adventure3D={layoutFor:()=>({})};
delete require.cache[require.resolve('../witness-world.js')];
require('../witness-world.js');
const W=globalThis.WitnessWorld;
function summary(s,id){s=M.openLayer(s,'legend',id,'accessible_summary');while(s.layer.summaryIndex<D.legends[id].beats.length)s=M.summaryStep(s);return M.closeLayer(s);}
function ready(id){let s=M.fresh();const target=D.legends[id];for(let i=0;i<=target.after;i++){s.chapter=i;s.quests[D.chapters[i].id].route=Object.keys(D.chapters[i].execution)[0];const earlier=D.spine.find(k=>D.legends[k].after===i&&k!==id);if(earlier)s=summary(s,earlier);}return s;}
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}

test('Dual-Tier Persona keeps player avatar as Anonymous Witness in all 5 Legends',()=>{
  const forbidden=new Set(['moses','david','jesus','peter','isaiah','paul']);
  for(const [id,chapterIdx] of [['L01',2],['L02',5],['L03',1],['L04',9],['L05',10]]){
    let s=D.legends[id].required?ready(id):M.fresh();
    if(!D.legends[id].required)s.chapter=chapterIdx;
    s=M.openLayer(s,'legend',id,'interactive');
    W.setState(s);
    globalThis.AdventureCharacter.create({},'player',{});
    assert(lastCreatedOptions?.overrides,'overrides must exist for '+id);
    assert.equal(lastCreatedOptions.overrides.kind,'fictional',id+' avatar must belong to Human Tier');
    assert(lastCreatedOptions.overrides.id.startsWith('witness-legend-'),id+' avatar ID must be witness-legend-*');
    assert(!forbidden.has(lastCreatedOptions.overrides.id),id+' must never assign canonical figure as player');
  }
});

test('Sacred Tier canonical figures are staged in Legend scenes without blocking step waypoints',()=>{
  for(const id of D.spine){
    let s=M.openLayer(ready(id),'legend',id,'interactive');
    for(let step=0;step<D.legends[id].steps.length;step++){
      s.layer.step=step;
      const p=W.plan(s);
      const npcs=p.objects.filter(o=>o.kind==='npc');
      assert(npcs.some(n=>n.id.startsWith('sacred-')),'Sacred canonical figure present in '+id+' step '+step);
      const activeAt=M.layerAt(step,s);
      for(const npc of npcs){
        const d=Math.hypot(npc.at[0]-activeAt[0],npc.at[1]-activeAt[1]);
        assert(d>=2.8,`${id} step ${step}: NPC ${npc.id} too close (${d.toFixed(2)}m) to waypoint`);
      }
    }
  }
  for(let i=0;i<D.chapters.length;i++){
    const s=M.fresh();s.chapter=i;
    const p=W.plan(s);
    for(const t of p.targets.filter(t=>t.companionSpot)){
      assert(Math.hypot(t.at[0]+15,t.at[1]-12)>=6,`Chapter ${i} companion spot clear of spawn`);
      for(const n of D.chapters[i].nodes){
        assert(Math.hypot(t.at[0]-n.at[0],t.at[1]-n.at[1])>=5,`Chapter ${i} companion clear of node ${n.id}`);
      }
    }
  }
});

test('4 RPG Skills initialize from origin, grow in Mortal World and carry into Listener Attunement',()=>{
  const scribe=M.fresh({origin:'scribe'}),port=M.fresh({origin:'port'}),road=M.fresh({origin:'road'});
  assert.equal(scribe.skills.observe,2);
  assert.equal(port.skills.craft,2);
  assert.equal(road.skills.defend,2);
  assert.equal(M.kitStatus(port).length,6);
  let s=port;
  s=M.act(s,'brace',{puzzle:{work:require('../witness-depth.js').guided(s,require('../witness-depth.js').catalog[0])}});
  assert(s.skillXp.craft>=5,'Craft XP increases from Mortal rigging puzzle');
  const att=M.attunement(s,'L01');
  assert(att.active.some(k=>k.id==='craft'&&k.tier>=2),'Craft Tier II+ carries into Listener Attunement');
});

test('Group Composure updates inside Legend layer without mutating Mortal state',()=>{
  const base=ready('L01');
  base.skills.observe=2;
  const mortalBefore=JSON.stringify({quests:base.quests,evidence:base.evidence,resources:base.resources,skills:base.skills});
  let s=M.openLayer(base,'legend','L01','interactive');
  const initialComp=s.layer.composure;
  s=M.adjustComposure(s,-40);
  assert(s.layer.composure>=60,'Comfort mode keeps gentle composure floor');
  s.settings.comfort=false;
  s=M.adjustComposure(s,-40);
  assert(s.layer.composure>=40,'Standard mode keeps non-lethal composure floor');
  while(s.layer.step<D.legends.L01.steps.length){
    const a=M.actions(s)[0];
    s=M.layerStep(s,a.id,{position:a.at,choice:'near',order:a.order,acknowledged:true,work:require('../witness-depth.js').encounter(s,a)?require('../witness-depth.js').guided(s,require('../witness-depth.js').encounter(s,a)):undefined});
  }
  assert(s.layer.attunements.length>=1,'Skill attunement recorded during L01');
  s=M.closeLayer(s);
  assert.equal(JSON.stringify({quests:s.quests,evidence:s.evidence,resources:s.resources,skills:s.skills}),mortalBefore);
  assert(initialComp>=82);
});

test('Interactive 3-Column Evidence Board detects duplicate lineage and enforces public consent',()=>{
  let s=M.fresh();
  s.evidence=['E04','E05','E06','E07','E09'];
  s.consent.witness1={scope:'private_group',voluntary:true,safe:false};
  s=M.selectBoardClaim(s,'P02');
  s=M.toggleBoardSlot(s,'P02','E04');
  s=M.toggleBoardSlot(s,'P02','E07');
  let ev=M.evaluateBoardClaim(s,'P02');
  assert(ev.lineageWarning&&ev.lineageWarning.includes('E04')&&ev.lineageWarning.includes('E07'),'Detects duplicate transit chain E04+E07');
  s=M.autoFillClaim(s,'P04');
  assert(M.evaluateBoardClaim(s,'P04','private_group').verified,'P04 verified in private_group with E09');
  s=M.setBoardAudience(s,'public');
  ev=M.evaluateBoardClaim(s,'P04');
  assert(ev.consentWarning,'Warns that private_group E09 cannot be read in public');
  assert(!ev.verified,'Public verification blocked without E10 or public consent');
});

test('Witness Tenets unlock in spine order and resonate at Q04, Q07 and Q11',()=>{
  let s=ready('L01');
  assert.equal(M.tenets(s).filter(t=>t.unlocked).length,0);
  s=summary(s,'L01');
  s=M.act(s,'advance');
  assert.equal(M.chapter(s).id,'Q04');
  assert.equal(M.activeTenetForChapter(s)?.id,'L01');
  s=summary(ready('L02'),'L02');
  s=M.act(s,'advance');
  assert.equal(M.chapter(s).id,'Q07');
  assert.equal(M.activeTenetForChapter(s)?.id,'L02');
  s=summary(ready('L04'),'L04');
  s=M.act(s,'advance');
  assert.equal(M.chapter(s).id,'Q11');
  assert.equal(M.activeTenetForChapter(s)?.id,'L04');
});

test('Vietnamese register (Chú – Con), multi-turn NPC conversations and Quiet Moments round-trip cleanly',()=>{
  let s=M.fresh();
  assert.equal(D.people.natan.register,'Chú – Con');
  assert(D.chapters[0].tasks[1].text.includes('Chú đã hứa với cha con'));
  const topics=M.talkTopics(s,'natan');
  assert(topics.length>=1);
  s=M.recordTalk(s,'natan',topics[0].id);
  assert(M.talkTopics(s,'natan')[0].heard);
  s=M.recordQuiet(s);
  assert(s.quietSeen.includes('Q01'));
  assert.deepEqual(M.restore(JSON.stringify(s)),s);
});

console.log(JSON.stringify({status:'passed',checks,scope:'v3.1-architecture-systems'}));
