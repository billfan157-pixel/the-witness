(function(root){
  'use strict';
  // Q01 v6 scene state foundation (PR-03). Pure reducer: no engine, UI, cloud,
  // evidence or resource access. Quest completion stays owned by witness-model
  // (quests.Q01.route / Q01.COMMITTED); this module only gates it via canCommit.
  // Beat/phase design source: docs/the-witness/07-vertical-slice-screenplay.md.
  const clone=x=>JSON.parse(JSON.stringify(x));
  const error=message=>{throw new Error(message);};

  const PHASES=['afternoon','evening','night','dawn'];
  const STRANGER_RESPONSES=['follow','investigate'];
  const ROUTES=['mechanical','manual'];
  const ROUTE_STEPS=Object.freeze({
    mechanical:Object.freeze(['cart','pulley','exit','extract']),
    manual:Object.freeze(['workers','lever','exit','extract'])
  });
  const FIRE=['none','burning','controlled','cold'];
  const CART=['none','chocked'];
  const BEAM=['intact','broken','moved'];
  const SIDE_EXIT=['closed','open'];
  const OBSERVATION_KEYS=['ledgerSeamObserved','rooftopSeen','yosefPrivacyRequested','t05Recalled','b06PreliminaryObserved'];

  // Logical narrative phase, not a runtime lighting preset: the engine only has
  // q01-day/q01-evening; night/dawn are future art requirements (see STATUS A02).
  const phaseOf=beat=>beat<=2?'afternoon':beat<=6?'evening':beat===7?'night':'dawn';

  function fresh(){
    return {
      version:1,beat:0,phase:phaseOf(0),strangerResponse:null,ledgerSeamObserved:false,
      rescue:{route:null,steps:[],peopleSafe:false},
      rooftopSeen:false,yosefPrivacyRequested:false,t05Recalled:false,b06PreliminaryObserved:false,
      world:{fire:'none',cart:'none',beam:'intact',sideExit:'closed'}
    };
  }

  function validate(scene){
    if(!scene||typeof scene!=='object'||Array.isArray(scene))error('Cảnh Q01 không hợp lệ.');
    if(scene.version!==1)error('Phiên bản cảnh Q01 không được hỗ trợ.');
    if(!Number.isInteger(scene.beat)||scene.beat<0||scene.beat>8)error('Nhịp cảnh Q01 không hợp lệ.');
    if(!PHASES.includes(scene.phase))error('Giai đoạn cảnh Q01 không hợp lệ.');
    if(scene.phase!==phaseOf(scene.beat))error('Giai đoạn không khớp nhịp cảnh.');
    if(scene.strangerResponse!==null&&!STRANGER_RESPONSES.includes(scene.strangerResponse))error('Phản ứng với người lạ không hợp lệ.');
    for(const k of OBSERVATION_KEYS)if(typeof scene[k]!=='boolean')error('Trường quan sát cảnh Q01 không hợp lệ.');
    const r=scene.rescue;
    if(!r||typeof r!=='object'||Array.isArray(r))error('Trạng thái cứu hộ không hợp lệ.');
    if(r.route!==null&&!ROUTES.includes(r.route))error('Phương án cứu hộ không hợp lệ.');
    if(!Array.isArray(r.steps))error('Các bước cứu hộ không hợp lệ.');
    if(typeof r.peopleSafe!=='boolean')error('Trạng thái người được cứu không hợp lệ.');
    if(r.route===null){if(r.steps.length)error('Chưa chọn phương án mà đã có bước cứu hộ.');}
    else{
      const seq=ROUTE_STEPS[r.route];
      if(r.steps.length>seq.length)error('Quá số bước cứu hộ của phương án.');
      for(let i=0;i<r.steps.length;i++)if(r.steps[i]!==seq[i])error('Bước cứu hộ sai thứ tự hoặc trộn phương án.');
    }
    const w=scene.world;
    if(!w||typeof w!=='object'||Array.isArray(w))error('Trạng thái thế giới không hợp lệ.');
    if(!FIRE.includes(w.fire))error('Trạng thái lửa không hợp lệ.');
    if(!CART.includes(w.cart))error('Trạng thái xe hàng không hợp lệ.');
    if(!BEAM.includes(w.beam))error('Trạng thái thanh xà không hợp lệ.');
    if(!SIDE_EXIT.includes(w.sideExit))error('Trạng thái lối thoát không hợp lệ.');
    if(scene.beat<2&&scene.strangerResponse!==null)error('Phản ứng với người lạ trước nhịp 2.');
    if(scene.beat>=2&&scene.strangerResponse===null)error('Nhịp 2 thiếu phản ứng với người lạ.');
    if(scene.beat<3&&scene.ledgerSeamObserved)error('Quan sát gáy sổ trước nhịp 3.');
    if(scene.beat>=3&&!scene.ledgerSeamObserved)error('Nhịp 3 thiếu quan sát đường khâu gáy sổ.');
    if(scene.beat<4){
      if(r.route!==null||r.steps.length||r.peopleSafe)error('Tiến trình cứu hộ trước nhịp 4.');
      if(w.fire!=='none')error('Lửa xuất hiện trước nhịp 4.');
      if(w.beam!=='intact')error('Thanh xà chưa gãy trước nhịp cháy kho.');
      if(w.cart!=='none')error('Xe hàng chưa chèn trước nhịp cháy kho.');
      if(w.sideExit!=='closed')error('Lối thoát mở trước nhịp cháy kho.');
    }
    if(scene.beat>=4&&(w.fire==='none'||w.beam==='intact'))error('Nhịp 4 thiếu biến cố cháy kho.');
    if(scene.beat>=5){
      if(!r.peopleSafe||r.route===null)error('Nhịp 5 chưa hoàn tất cứu hộ.');
      if(r.steps.length!==ROUTE_STEPS[r.route].length)error('Nhịp 5 thiếu bước cứu hộ.');
      if(w.sideExit!=='open')error('Nhịp 5 chưa mở lối thoát.');
    }
    if(scene.beat<6&&scene.rooftopSeen)error('Quan sát sân mái trước nhịp 6.');
    if(scene.beat>=6&&!scene.rooftopSeen)error('Nhịp 6 thiếu quan sát sân mái.');
    if(scene.beat<7&&scene.yosefPrivacyRequested)error('Yêu cầu giữ kín trước nhịp 7.');
    if(scene.beat>=7&&!scene.yosefPrivacyRequested)error('Nhịp 7 thiếu yêu cầu giữ kín của Yosef.');
    if(scene.beat<8&&scene.t05Recalled)error('Ký ức T05 trước nhịp 8.');
    if(scene.beat>=8&&!scene.t05Recalled)error('Nhịp 8 thiếu ký ức T05.');
    if(scene.b06PreliminaryObserved&&scene.beat!==8)error('Quan sát B06 chỉ ghi ở nhịp 8.');
    if(w.fire==='cold'&&!(scene.beat===8&&scene.b06PreliminaryObserved))error('Tro nguội chỉ sau quan sát B06 ở nhịp 8.');
    if(scene.beat===8&&scene.b06PreliminaryObserved&&w.fire!=='cold')error('Nhịp 8 đã quan sát B06 nhưng tro chưa nguội.');
    if(w.fire==='controlled'&&(!r.peopleSafe||scene.beat<5))error('Lửa khống chế trước khi cứu hộ hoàn tất.');
    if(w.fire==='burning'&&scene.beat!==4)error('Lửa đang cháy chỉ ở nhịp cứu hộ.');
    if(r.peopleSafe){
      if(r.route===null||r.steps.length!==ROUTE_STEPS[r.route].length)error('Người được cứu khi chưa đủ bước bắt buộc.');
      if(w.sideExit!=='open')error('Cứu người khi chưa mở lối thoát.');
    }
    if(w.beam==='moved'&&!(r.route==='manual'&&r.steps.includes('lever')))error('Thanh xà dịch chuyển không đúng phương án sức người.');
    if(w.cart==='chocked'&&!(r.route==='mechanical'&&r.steps.includes('cart')))error('Xe hàng chèn cửa không đúng phương án cơ học.');
    if(r.route==='manual'&&w.cart==='chocked')error('Phương án sức người không chèn xe hàng.');
    if(r.route==='mechanical'&&w.beam==='moved')error('Phương án cơ học không dịch chuyển thanh xà.');
    if(r.route==='mechanical'&&r.steps.includes('cart')&&w.cart!=='chocked')error('Thiếu dấu xe hàng đã chèn cửa.');
    if(r.route==='manual'&&r.steps.includes('lever')&&w.beam!=='moved')error('Thiếu dấu thanh xà đã nâng bằng đòn bẩy.');
    return scene;
  }

  function restore(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))error('Cảnh Q01 không hợp lệ.');
    const r=raw.rescue,w=raw.world;
    const scene={
      version:raw.version,beat:raw.beat,phase:raw.phase,strangerResponse:raw.strangerResponse,
      ledgerSeamObserved:raw.ledgerSeamObserved,
      rescue:{route:r?.route,steps:Array.isArray(r?.steps)?r.steps.slice():r?.steps,peopleSafe:r?.peopleSafe},
      rooftopSeen:raw.rooftopSeen,yosefPrivacyRequested:raw.yosefPrivacyRequested,
      t05Recalled:raw.t05Recalled,b06PreliminaryObserved:raw.b06PreliminaryObserved,
      world:{fire:w?.fire,cart:w?.cart,beam:w?.beam,sideExit:w?.sideExit}
    };
    return validate(scene);
  }

  function applyStepWorld(s,step){
    if(step==='cart')s.world.cart='chocked';
    else if(step==='lever')s.world.beam='moved';
    else if(step==='exit')s.world.sideExit='open';
  }

  function reduce(scene,event,payload={}){
    validate(scene);
    const s=clone(scene),p=payload||{};
    switch(event){
      case 'disembark':
        if(s.beat>=1)return s;
        s.beat=1;break;
      case 'stranger':
        if(s.strangerResponse!==null)return s;
        if(s.beat!==1)error('Chưa tới nhịp quan sát người lạ.');
        if(!STRANGER_RESPONSES.includes(p.response))error('Phản ứng với người lạ không hợp lệ.');
        s.strangerResponse=p.response;s.beat=2;break;
      case 'ledgerSeam':
        if(s.ledgerSeamObserved)return s;
        if(s.beat!==2)error('Chưa tới nhịp nhận sổ gia đình.');
        s.ledgerSeamObserved=true;s.beat=3;break;
      case 'fire':
        if(s.beat>=4)return s;
        if(s.beat!==3)error('Chưa tới nhịp cháy kho phía tây.');
        s.world.fire='burning';s.world.beam='broken';s.beat=4;break;
      case 'rescueRoute':
        if(!ROUTES.includes(p.route))error('Phương án cứu hộ không hợp lệ.');
        if(s.rescue.route!==null){
          if(s.rescue.route===p.route)return s;
          error('Không thể đổi phương án cứu hộ khi đã bắt đầu.');
        }
        if(s.beat!==4)error('Chưa tới nhịp cứu hộ.');
        s.rescue.route=p.route;break;
      case 'rescueStep':{
        if(s.rescue.route===null){
          if(s.beat!==4)error('Chưa tới nhịp cứu hộ.');
          error('Hãy chọn phương án cứu hộ trước khi thực hiện bước.');
        }
        if(!ROUTE_STEPS[s.rescue.route].includes(p.step))error('Bước này không thuộc phương án cứu hộ đã chọn.');
        if(s.rescue.steps.includes(p.step))return s;
        if(s.beat!==4)error('Chưa tới nhịp cứu hộ.');
        if(p.step!==ROUTE_STEPS[s.rescue.route][s.rescue.steps.length])error('Bước cứu hộ chưa đúng thứ tự.');
        s.rescue.steps=[...s.rescue.steps,p.step];
        applyStepWorld(s,p.step);
        if(p.step==='extract'){s.rescue.peopleSafe=true;s.world.fire='controlled';s.beat=5;}
        break;
      }
      case 'rooftop':
        if(s.rooftopSeen)return s;
        if(s.beat!==5)error('Chưa tới nhịp quan sát sân mái.');
        s.rooftopSeen=true;s.beat=6;break;
      case 'yosefPrivacy':
        if(s.yosefPrivacyRequested)return s;
        if(s.beat!==6)error('Chưa tới nhịp gặp Yosef.');
        s.yosefPrivacyRequested=true;s.beat=7;break;
      case 'recallT05':
        if(s.t05Recalled)return s;
        if(s.beat!==7)error('Chưa tới nhịp đối diện ký ức T05.');
        s.t05Recalled=true;s.beat=8;break;
      case 'observeB06':
        if(s.b06PreliminaryObserved)return s;
        if(s.beat!==8)error('Chưa tới nhịp quan sát B06.');
        s.b06PreliminaryObserved=true;s.world.fire='cold';break;
      default:error('Sự kiện cảnh Q01 không hợp lệ.');
    }
    s.phase=phaseOf(s.beat);
    return s;
  }

  function canCommit(scene){
    if(!scene||scene.version!==1)return false;
    return scene.beat===8&&scene.b06PreliminaryObserved===true&&scene.rescue?.peopleSafe===true&&
      scene.ledgerSeamObserved===true&&scene.rooftopSeen===true&&scene.yosefPrivacyRequested===true&&
      scene.t05Recalled===true&&scene.strangerResponse!==null;
  }

  function phase(scene){return phaseOf(scene?.beat??0);}

  const enums=Object.freeze({PHASES,STRANGER_RESPONSES,ROUTES,FIRE,CART,BEAM,SIDE_EXIT});
  const Q01State={fresh,restore,reduce,canCommit,phase,ROUTE_STEPS,enums};
  root.WitnessQ01State=Q01State;
  if(typeof module!=='undefined')module.exports=Q01State;
})(globalThis);