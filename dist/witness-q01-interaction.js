(function(root){
  'use strict';
  // Physical preconditions for the campaign presenter. Not a second quest reducer.
  // Shared by browser/model/Worker; no DOM, renderer, timers or persistent actor flags.
  const P=(x,y,z,supportId='world')=>({x,y,z,supportId});
  const at={disembark:P(-6,0,-22),alley:P(-10,0,-9),follow:P(-3,0,-5),load:P(-10,0,6),ledger:P(-5,0,-1),
    titus:P(-24,0,-4),cart:P(-32,0,-3),rope:P(-29.4,0,-5.1),workers:P(-22,0,-1),lever:P(-18,0,-5.6),
    mezzanine:P(-24.6,2.52,-16.5,'q01-mezzanine'),commonDoor:P(-21.2,2.52,-13.6,'q01-mezzanine'),
    reception:P(-24.4,5.04,-17.5,'q01-roof-main'),lookout:P(-26.4,5.04,-20.3,'q01-roof-main'),
    yosef:P(-4,0,-12),rest:P(-2,0,5),b06:P(-20.5,0,-5),meal:P(7,0,4),lodging:P(14,0,5),handoff:P(19,0,8)};
  const near=(p,q,r=2.6)=>!!p&&!!q&&[p.x,p.y,p.z].every(Number.isFinite)&&Math.abs(p.y-q.y)<.35&&Math.hypot(p.x-q.x,p.z-q.z)<=r&&
    (q.y>1? /^q01-(mezzanine|roof|landing)/.test(p.supportId):p.supportId==='world'||p.supportId==='q01-room'||p.supportId==='q01-quay');
  function requireAt(p,q,r){if(!near(p,q,r))throw Error('Hãy đi tới đúng người, vật và mặt sàn trước khi thực hiện.');}
  function assertEvent(s,event,payload={},context={}){
    const p=s.spatialPositions?.['Q01.mortal'],actors=context.actors||{},scene=s.sceneProgress.Q01;
    const actor=(id,q,r=3)=>{if(!near(actors[id],q,r))throw Error('Hãy chờ người đi cùng tới đúng chỗ; chưa thể ghi phần việc này.');};
    const point={disembark:'disembark',stranger:payload.response==='follow'?'follow':'alley',ledgerSeam:'ledger',fire:'titus',rescueRoute:'titus',
      rooftop:'lookout',yosefPrivacy:'yosef',recallT05:'rest',observeB06:'b06'}[event];
    if(point)requireAt(p,at[point],event==='stranger'?3:2.6);
    if(event==='stranger'&&payload.response==='follow'&&!context.strangerHidden)throw Error('Đi tới góc rẽ và quan sát người ấy khuất tầm nhìn trước.');
    if(event==='recallT05'){
      actor('natan',at.rest,3);
      if(!context.natanVisible)throw Error('Tới cùng phía ghế với Natan; chưa thể nói chuyện qua tường xưởng.');
    }
    if(event==='rescueRoute'||event==='fire')actor('titus',at.titus,3.5);
    if(event==='rescueStep'){
      const step=payload.step;
      const point={cart:'cart',pulley:'rope',workers:'lever',lever:'lever',exit:'mezzanine',extract:'reception'}[step];
      if(!point)throw Error('Thao tác cứu hộ không hợp lệ.');requireAt(p,at[point],step==='extract'?2.1:2.8);
      if(step==='cart'||step==='pulley')actor('titus',at[point],4);
      if(step==='workers'||step==='lever'){actor('worker1',at.lever,3);actor('worker2',at.lever,3);actor('titus',at.lever,4);}
      if(step==='exit'){
        actor('titus',at.reception,1.6);
        if(!context.roofChecked||!context.commonOpen)throw Error('Cùng Titus kiểm điểm nhận trên mái rồi quay xuống gác trước.');
      }
      if(step==='extract'){
        if(!scene.rescue.steps.includes('exit'))throw Error('Đường nhận người chưa được kiểm.');
        actor('titus',at.reception,1.6);actor('simeon',at.reception,1.8);actor('apprentice',at.reception,1.8);
      }
    }
  }
  function assertAction(s,id,options={}){
    const key={brace:'load',ledger:'ledger',meal:'meal',choose:options.choice==='meal'?'meal':'lodging','pay-lodging':'lodging','give-oil':'meal',advance:'handoff'}[id];
    if(key)requireAt(s.spatialPositions?.['Q01.mortal'],at[key],2.8);
  }
  const api={at,near,requireAt,assertEvent,assertAction};root.WitnessQ01Interaction=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
