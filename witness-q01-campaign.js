(function(root){
  'use strict';
  // PR-05: campaign staging. Q01State/Model retain every durable decision.
  // Actor paths and dialogue cursors are intentionally transient; load uses the
  // screenplay's whole-group checkpoints, never frame-by-frame position snaps.
  const I=root.WitnessQ01Interaction,G=root.WitnessQ01Greybox;
  const active=s=>!!s?.sceneProgress?.Q01&&s.chapter===0&&!s.layer;
  const copy=x=>structuredClone(x),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names={avatar:'Người Chứng',natan:'Natan',titus:'Titus',yosef:'Yosef',rina:'Rina',worker1:'Thợ bến',dockworker:'Thợ bến',deskkeeper:'Người giữ bàn',simeon:'Simeon',sawyer:'Thợ cưa',private:'Ký ức riêng',description:'Quan sát'};
  const dialogue={
    arrival:[['dockworker','Chờ tôi đặt bao xuống… Rồi, bạn qua đi.'],['avatar','Xưởng của chú Natan còn ở lối cũ chứ?'],['dockworker','Theo tiếng bào, qua hẻm bên kia.']],
    stranger:[['description','Một người mặc áo thô đứng nhìn cửa xưởng rồi quay về phía góc hẻm. Bạn chưa biết họ là ai.']],
    investigate:[['avatar','Bạn có biết người vừa đứng trước cửa không?'],['sawyer','Tôi chỉ thấy người ấy đứng đó một lúc. Gọi thì họ đi. Tôi không biết tên.']],
    follow:[['description','Tiếng chân khuất sau góc tường. Bạn mất tầm nhìn; chưa có căn cứ nối người ấy với một việc khác.']],
    loadGreeting:[['natan','Con về rồi. Khoan, giữ giúp chú bên này.'],['avatar','Chốt nứt rồi.'],['natan','Ừ. Con xem phần nặng đang tựa vào đâu đã.']],
    ledger:[['description','Natan buông tay, xoa vai rồi mở bọc vận chuyển còn ẩm trên tấm vải lót khô. Cuốn sổ đóng liền và tờ bìa hồ sơ gấp đã rời nhau từ trước.'],['natan','Chú đã hứa đưa tận tay người nhà. Khăn ngoài còn ẩm. Con cầm nguyên cuốn sổ này; tờ bìa gấp rời này chú giữ lại hong.'],['avatar','Cuốn sổ đi với con. Tờ bìa rời ở lại đây với chú?'],['natan','Ừ. Chú không tháo gì khỏi gáy sổ.']],
    seam:[['avatar','Đường chỉ này không ăn vào lỗ cũ.'],['natan','Chú thấy chỗ ấy rồi. Cứ giữ nguyên, đừng tháo thêm.'],['description','Gáy nguyên cuốn sổ có vết ố, lỗ cũ và đường khâu không trùng. Tờ bìa hồ sơ rời vẫn nằm trên vải bên Natan; chưa mở tới biên nhận.']],
    fire:[['titus','Simeon! Còn nghe tôi không?'],['simeon','Còn. Có người học việc ở đây với tôi.'],['titus','Tôi nghe hai người ở gác. Xà chặn thang rồi.'],['avatar','Còn lối nào tới họ?'],['titus','Bộ tời còn đường dây xuống sân. Hoặc gọi hai người nâng xà, rồi chèn nó lại. Bạn muốn bắt đầu bên nào?']],
    cart:[['titus','Tôi giữ dây. Bạn đưa xe tới cữ ấy, rồi chèn bánh.']],
    pulley:[['titus','Được. Mình mở cánh ngăn bên kia.']],
    workers:[['avatar','Còn hai người ở trên gác. Hai bạn giữ giúp đầu đòn này được không?'],['worker1','Được. Cho chúng tôi thấy chỗ đặt nó.']],
    lever:[['titus','Nâng một nhịp. Giữ… Đặt nêm vào rồi mới buông.']],
    receive:[['titus','Tôi nhận họ ở đây. Bạn xuống đi cùng họ lên.']],
    extract:[['avatar','Đường lên đã kiểm rồi. Tôi đi cùng hai người.'],['simeon','Chúng tôi theo bạn. Chậm một chút ở bậc thang.']],
    rooftop:[['description','Một người rời hẻm sau kho về phía bến nhỏ, trước khi nhóm chữa cháy tới cửa trước. Áo ngắn có đường viền sẫm; cự ly và khói che mặt, không đọc được tuổi.'],['avatar','Có người vừa ra phía sau kho.'],['titus','Bạn thấy gì?'],['avatar','Một dáng áo. Xa quá, tôi không thấy mặt.']],
    yosef:[['yosef','Bạn vừa từ xưởng Natan sang phải không?'],['avatar','Tôi là con Haddai. Bạn cần gặp tôi?'],['yosef','Tôi từng khuân hàng qua cửa này. Mình nói ở dưới hiên được không?'],['avatar','Bạn có thấy lửa bắt đầu ở đâu không?'],['yosef','Không. Lúc tôi quay lại đã có khói rồi. Tôi chỉ biết những chuyến mình đã khuân. Cuốn sổ bên trong, tôi không cầm.'],['avatar','Nếu sáng mai tôi cần hỏi một chuyến hàng?'],['yosef','Hỏi tôi trước. Nhưng xin đừng gọi tên tôi giữa sân, hay đưa tên tôi cho người khác. Tôi còn phải trở lại làm ở đây.'],['yosef','Mẹ tôi vẫn để mấy chậu cây ngoài bậc cửa, đợi tôi về mới chịu mang vào. Tôi không muốn tối nay bà phải ra bến tìm.'],['description','Yosef sửa nút áo rồi dừng. Bạn hạ tay, bước sang bên chừa lối ra.'],['avatar','Tôi nghe rồi. Tối nay mình dừng ở đây. Bạn về đi.'],['yosef','Mai… nếu bạn còn cần hỏi, cứ nói nhỏ như thế này.']],
    meal:[['rina','Đêm nay vẫn có chỗ nằm ở xưởng. Lượt bếp sáng cần thêm phần dầu.']],
    lodgingPrompt:[['deskkeeper','Nhà nghỉ đêm vẫn còn góc bàn có đèn cho sáng mai, hoặc bạn có thể sang góp phần cho lượt bếp sáng cùng Rina.']],
    lodging:[['avatar','Tôi xin để dành góc bàn có đèn. Sáng mai tôi quay lại bàn giao.']],
    mealPlan:[['avatar','Để tôi nhận phần góp cho lượt bếp sáng. Tôi sẽ mang tới.'],['rina','Được. Tôi ghi phần bạn nhận; chưa tính là đã trao.']],
    night:[['natan','Con ngồi đi. Cha con hay để mái chèo ở phía ấy.'],['description','Natan quay nửa nhịp như định hỏi người ngồi cạnh, rồi nhìn lại đầu dây đang se dở.'],['avatar','Chú vẫn quen có cha ở đây.'],['natan','Mấy hôm nay chú cứ quay sang hỏi ông ấy một câu. Hỏi xong mới nhớ ra.'],['avatar','Con cứ nghĩ, về tới cửa này thì vẫn còn kịp.'],['description','Natan đặt đoạn dây chưa se xong xuống; ông ngồi cùng, không lấp khoảng im bằng lời khuyên.'],['natan','Chú cũng chưa quen.'],['avatar','Con còn một chuyện chưa nói với cha.'],['natan','Nếu con muốn nói, chú nghe.'],['avatar','Con chưa biết nói thế nào.'],['natan','Đèn còn dầu. Con cứ ngồi.'],['private','Chỉ cần nói: “Chưa kiểm xong.” Mình đã không nói.'],['description','Bạn nhớ bàn tay Haddai ký khi hàng chưa được kiểm, và chính mình đã im vì sợ mất việc. Ký ức ấy chỉ thuộc về bạn; Natan chưa được nghe.']],
    b06:[['description','Người kiểm kho chỉ vành an toàn: “Bàn kiểm nhận bên này đi được rồi. Phần trong kia còn rào lại.”'],['avatar','B06… Chỗ này có nét ghi đè.'],['description','Dưới ánh xiên, mã B06 nằm cạnh bề mặt xơ/cạo và nét ghi chồng. Giấy ở lại bàn. Chưa biết ai làm và lượng nhận có khớp không.']],
    paid:[['description','Bạn đặt đúng phần tiền đã dành. Người giữ bàn nhận, để lại góc làm việc có đèn.'],['deskkeeper','Tôi nhận phần bạn gửi. Góc bàn ấy để bạn làm việc.']],
    contributed:[['description','Bạn bàn giao phần góp cho bếp sáng. Rina kiểm phần nhận rồi châm đèn.'],['rina','Tôi nhận rồi. Người tới ca sau biết phần này ở đâu.']],
    outro:[['description','Âm bến bắt đầu lại. Hai người đã được đưa ra khỏi kho; dấu xe và xà còn ở đúng nơi bạn đã làm.'],['avatar','Ai đang làm hồ sơ thay đổi, và vì sao nhân chứng sợ nói?']]
  };
  let mounted=null,session=null;
  function notes(s){
    const q=s?.sceneProgress?.Q01;if(!q)return [];const entries=[],add=(title,text)=>entries.push({title,text});
    if(q.strangerResponse)add('Người trước cửa xưởng',q.strangerResponse==='follow'?'Đã theo tới góc rẽ rồi mất tầm nhìn. Chưa biết tên hoặc lý do người ấy có mặt.':'Người thợ chỉ thấy họ đứng một lúc rồi rời đi; không biết tên.');
    if(s.quests.Q01.done.includes('ledger'))add('Hai vật được giữ riêng','Mình giữ nguyên cuốn sổ gia đình, gồm bìa gắn và gáy khâu. Natan giữ tờ bìa hồ sơ rời còn ẩm ở xưởng. Chưa mở hoặc xác thực biên nhận.');
    if(q.ledgerSeamObserved)add('Gáy sổ','Đường khâu lệch khỏi các lỗ cũ; giữ nguyên chỉ và gáy để đối chiếu về sau. Dấu ấy chưa xác định người đã sửa.');
    if(q.rescue.peopleSafe)add('Hai người đã ra khỏi khói',q.rescue.route==='mechanical'?'Xe đối trọng đã chèn tại cữ, bộ tời mở lối phụ. Xà vẫn chắn lối chính. Titus nhận đủ Simeon và người học việc trên mái.':'Nhóm đã kê, dịch xà tới chỗ tựa và chèn lại. Xe đối trọng ở vị trí cũ; cánh ngăn cơ học vẫn đóng. Titus nhận đủ Simeon và người học việc trên mái.');
    if(q.rooftopSeen)add('Quan sát riêng từ mái','Hướng: về bến nhỏ. Thứ tự: trước khi nhóm chữa cháy tới cửa trước. Dáng áo: ngắn, viền sẫm. Giới hạn: khói và cự ly che mặt, không đọc được tuổi. Chưa nối người này với người trước xưởng hoặc nguyên nhân cháy.');
    if(q.yosefPrivacyRequested)add('Giới hạn Yosef đặt ra','Yosef yêu cầu được hỏi trước và giữ kín tên. Anh chỉ biết những chuyến mình đã khuân; lúc quay lại đã thấy khói. Chưa có quyền trích lời hoặc công bố danh tính.');
    if(q.t05Recalled)add('Ký ức chỉ mình biết','Mình đã thấy Haddai ký lúc hàng chưa kiểm xong, nhưng im vì sợ mất việc. Natan chỉ nghe rằng mình còn điều chưa nói; chú chưa được nghe nội dung ký ức này.');
    if(q.b06PreliminaryObserved)add('B06 sáng hôm sau','Thấy vùng bề mặt xơ/cạo và nét ghi chồng. Giấy vẫn ở bàn kiểm nhận. Chưa biết ai làm, chưa đối chiếu lượng thực nhận; cần kiểm tiếp tại Q02.');
    return entries;
  }
  function goal(s){
    const q=s.sceneProgress.Q01,r=q.rescue,done=s.quests.Q01.done;
    if(s.quests.Q01.route)return ['handoff','Đối chiếu B06 vào ngày mới','Tới lối sau kho để bước vào Q02.'];
    if(q.beat===0)return ['disembark','Đặt chân lên bến','Đi qua ván xuống sân. Theo tiếng bào tới xưởng Natan.'];
    if(q.beat===1)return [session?.followingStranger?'follow':'alley','Người trước cửa xưởng',session?.followingStranger?'Tự theo tới góc hẻm; đừng đoán danh tính.':'Tới hẻm, chọn theo dấu hoặc hỏi người thợ.'];
    if(q.beat===2)return !done.includes('brace')?['load','Cùng Natan giữ khung hàng','Tạo đường chịu lực mới trước khi tháo chốt cũ.']:['ledger',done.includes('ledger')?'Xem đường khâu của sổ':'Nhận nguyên cuốn sổ','Tới bàn Natan; giữ riêng cuốn sổ và tờ bìa hồ sơ.'];
    if(q.beat===3)return ['titus','Tiếng gãy phía kho tây','Chuông và khói ở bên kia sân. Tới gặp Titus.'];
    if(q.beat===4){
      if(!r.route)return ['titus','Một đường tới hai người','Khảo sát bộ tời hoặc phương án nâng xà, rồi bắt đầu cùng Titus.'];
      const n=r.steps.length;
      if(n===0){
        if(r.route==='mechanical')return ['cart','Đẩy xe đối trọng tới cữ','Đưa xe cuối ray, chèn hai nêm bánh và kiểm độ căng dây cùng Titus.'];
        return [session?.rescue?.workersBriefed?'lever':'workers',session?.rescue?.workersBriefed?'Đặt điểm kê cùng nhóm thợ':'Mời hai thợ tới chỗ kê xà',session?.rescue?.workersBriefed?'Chờ đủ hai thợ và Titus tại chỗ kê xà, đặt điểm kê đúng thế.':'Nói với hai thợ ở sân để họ cùng Titus tới điểm nâng xà.'];
      }
      if(n===1)return [r.route==='mechanical'?'rope':'lever',r.route==='mechanical'?'Kéo tời và cài chốt giữ cánh':'Cùng nâng xà, chèn nêm rồi kiểm vững',r.route==='mechanical'?'Phối hợp với Titus kéo hết nhịp dây ở sân rồi gài chốt khóa cánh ngăn.':'Cùng nhóm nâng xà hết nhịp, đặt nêm gỗ rồi kiểm độ ổn định trước khi buông.'];
      if(n===2)return !session?.commonOpen?['commonDoor','Cùng Titus kiểm đường lên mái','Đi qua tuyến đã mở tới gác, chờ nhau rồi mở cửa chung.']:!session?.roofChecked?['reception','Kiểm điểm nhận ngoài khói','Đi cùng Titus tới sân mái; xác nhận điểm nhận.']:['mezzanine','Quay xuống đón hai người','Titus ở lại trên mái. Tự quay xuống gác và gọi đáp.'];
      return session?.activity==='extract'?['reception','Hộ tống Simeon và người học việc','Chờ cả hai lên hết thang tới chỗ Titus trên mái rồi xác nhận.']:['mezzanine','Gọi hai người đi cùng','Titus đang chờ ở điểm nhận trên mái.'];
    }
    if(q.beat===5)return ['lookout','Một người rời hẻm','Tới lan can, chủ động quan sát. Không đọc được mặt.'];
    if(q.beat===6)return ['yosef','Một chỗ nói nhỏ','Theo thang ngoài xuống sân, gặp Yosef dưới mái hiên.'];
    if(q.beat===7)return !done.includes('meal')?['meal','Phần việc bếp sáng','Nghe Rina, rồi đặt một phần việc cho sáng mai.']:!s.quests.Q01.plan?session?.pendingPlan==='meal'?['meal','Nhận phần góp bếp sáng','Tới Rina để đặt phần việc; chưa trao tài nguyên.']:['lodging','Dành một phần việc cho sáng mai','Chọn góc bàn hoặc phần góp bếp; chưa bàn giao tài nguyên.']:['rest','Một chỗ đặt cuốn sổ','Về xưởng, ngồi cùng Natan. Chỉ nghỉ khi bạn đã sẵn sàng.'];
    return !q.b06PreliminaryObserved?['b06','Điều còn đọc được sáng hôm sau','Trở lại vành kho an toàn, xem B06 dưới ánh xiên.']:[s.quests.Q01.plan==='lodging'?'lodging':'meal','Bàn giao phần đã nhận','Tự tới người nhận. Chỉ bàn giao lần này mới trừ phần tiền hoặc thực phẩm.'];
  }
  function plan(s){
    const approach={reception:[.9,1.3],titus:[1.2,.6],workers:[0,1.2],rest:[1.15,2.0]};
    const main=goal(s)[0],targets=Object.entries(G.anchors).filter(([id])=>!['stranger','strangerGone','rearAlley','smallBerth','simeon','apprentice','winch','boat'].includes(id)).map(([id,p])=>({id:'q01:'+id,at:[p.x+(approach[id]?.[0]||0),p.z+(approach[id]?.[1]||0)],floorY:p.y,surfaceId:p.supportId,name:id===main?goal(s)[1]:({ledger:'Bàn Natan',load:'Khung hàng',titus:'Titus',yosef:'Mái hiên Yosef',meal:'Bếp của Rina',rest:'Ghế bên xưởng',lodging:'Góc bàn',reception:'Điểm nhận',commonDoor:'Cửa chung',lookout:'Lan can nhìn hẻm',cart:'Xe đối trọng',rope:'Tay dây',lever:'Tới chỗ kê xà',workers:'Hai người thợ',b06:'Bàn B06'}[id]||'Đường đi'),range:id==='reception'||id==='rest'?.5:approach[id]?1.1:2.25,main:id===main,elevation:.8,symbol:id===main?'◇':'·'}));
    return root.WitnessCraft.augment(s,{objects:[],targets});
  }
  function mount(context,s){
    if(mounted)mounted.dispose();
    const {T,scene}=context,retired=[],lightTargets=new Set(scene.children.filter(o=>o.isLight&&o.target).map(o=>o.target));for(const o of [...scene.children])if(!o.isLight&&o.name!=='player'&&!lightTargets.has(o)){retired.push(o);scene.remove(o);}
    root.WitnessQ01Environment.enabled=false;
    const ar=G.create();ar.projectScene(s.sceneProgress.Q01);
    const art=root.WitnessQ01Art.mount(T,scene,ar,s);
    scene.userData.architecture=ar;scene.userData.terrainHeight=()=>0;
    mounted={...art,ar,scene,T,dispose(){art.dispose();for(const o of retired)scene.add(o);}};return mounted;
  }
  function createPresenter(options){
    session?.dispose();if(!mounted)throw Error('Chưa có không gian campaign Q01.');
    const {engine,getState,write,toast,audio,refresh,onAdvance}=options,{ar,actors}=mounted;
    const resetRescue=(steps,briefed=false)=>{
      const s=steps||[];
      return {
        cartProgress:s.includes('cart')?1:0,
        cartChocked:s.includes('cart'),
        loadTested:s.includes('cart'),
        pulleyProgress:s.includes('pulley')?1:0,
        gateSecured:s.includes('pulley'),
        workersBriefed:s.includes('workers'),
        fulcrumPlaced:s.includes('workers'),
        leverProgress:s.includes('lever')?1:0,
        beamWedged:s.includes('lever'),
        beamSettled:s.includes('lever'),
        extractBriefed:s.includes('exit')&&briefed
      };
    };
    const jobs=new Map(),errors=[],history=[],node=document.createElement('section');node.id='q01-presenter';node.className='q01-presenter';node.hidden=true;node.setAttribute('aria-label','Đối thoại tại cảnh');document.querySelector('#game').append(node);
    const workNode=document.createElement('section');workNode.id='q01-rescue-work';workNode.className='q01-rescue-work';workNode.hidden=true;workNode.setAttribute('aria-label','Thao tác cứu hộ 3D');document.querySelector('#game').append(workNode);
    const escortNode=document.createElement('aside');escortNode.id='q01-escort-bar';escortNode.className='q01-escort-bar';escortNode.hidden=true;escortNode.setAttribute('aria-live','polite');document.querySelector('#game').append(escortNode);
    const panel=document.createElement('aside');panel.id='q01-route-guide';panel.className='q01-route-guide';document.querySelector('#game').append(panel);
    let ui=null,work=null,drag=null,last=0,disposed=false,paused=false,projection='',lightKey='',resting=null,intro=null,lastPlane=0,alarm=false,lastWorkSfx=0;
    const api={activity:null,followingStranger:false,commonOpen:false,roofChecked:false,rescue:resetRescue(),seenIntro:{},jobs,errors,history,get ui(){return ui},get work(){return work},get introduction(){return !!intro},get blocking(){return !!(ui||work||resting||intro)},get mounted(){return mounted}};session=api;
    const point=id=>G.anchors[id],actorPoint=id=>{const a=actors[id];return a?{x:a.object.position.x,y:a.object.position.y,z:a.object.position.z,supportId:a.object.userData.supportId}:null;};
    const snapshot=()=>Object.fromEntries(Object.keys(actors).map(id=>[id,actorPoint(id)]));
    const natanVisible=()=>{const p=engine.spatial(),n=actorPoint('natan');return ar.visible({...p,y:p.y+1.45},{...n,y:n.y+1.05});};
    const stateWithPosition=()=>{const s=getState();s.spatialPositions['Q01.mortal']={schema:1,...engine.spatial()};return s;};
    function event(id,payload){
      const s=stateWithPosition(),next=root.WitnessModel.q01SceneEvent(s,id,payload,{actors:snapshot(),rescue:copy(api.rescue),commonOpen:api.commonOpen,roofChecked:api.roofChecked,extractBriefed:api.rescue.extractBriefed,strangerHidden:mounted.strangerHidden(engine.spatial()),natanVisible:natanVisible()});
      write(next);history.push({event:id,payload:copy(payload||{}),p:engine.spatial(),actors:snapshot()});
      if(id==='rescueRoute'||(id==='rescueStep'&&['cart','pulley','workers','lever'].includes(payload?.step)))api.rescue=resetRescue(next.sceneProgress.Q01.rescue.steps,!!api.activity);
      sync();
    }
    function action(id,opts){write(root.WitnessModel.act(stateWithPosition(),id,opts));sync();}
    function place(id,p){const a=actors[id];a.object.position.set(p.x,p.y,p.z);a.object.userData.supportId=p.supportId;}
    function walk(id,where,following=false){
      if(!actors[id])return false;const p=actorPoint(id),path=ar.route(p,where);if(!path){errors.push('Không có đường cho '+id);toast('Lối đi cùng đang vướng. Mọi người dừng chờ; bạn có thể trở lại chỗ bắt đầu.');return false;}
      jobs.set(id,{path:copy(path),goal:copy(where),following,stuck:0});return true;
    }
    function chain(id,places,delay=0){let first=true;const next=()=>{if(!places.length)return;const p=places.shift();if(walk(id,p)){const job=jobs.get(id);job.wait=first?delay:0;first=false;job.done=next;}};next();}
    function close(){if(resting)return;ui=null;node.hidden=true;audio?.stopVoice();audio?.setMode('world');mounted.speak(null);engine.pause(false);options.resume?.();refresh();}
    const aimAt=(tx,ty,tz)=>{const c=engine.cameraState(),dx=tx-c.position.x,dz=tz-c.position.z,current=Math.atan2(c.position.x-c.look.x,c.position.z-c.look.z),wanted=Math.atan2(-dx,-dz),pitch=Math.atan2(c.look.y-c.position.y,Math.hypot(c.look.x-c.position.x,c.look.z-c.position.z));engine.rotate(Math.atan2(Math.sin(wanted-current),Math.cos(wanted-current)));engine.pitch(Math.atan2(ty-c.position.y,Math.hypot(dx,dz))-pitch);};
    const speakerRoles={avatar:'Ghi chép hiện trường',natan:'Thợ mộc · Xưởng Natan',titus:'Chỉ huy cứu hỏa',yosef:'Phu bến kho tây',rina:'Bếp chung',worker1:'Thợ bến',worker2:'Thợ bến',dockworker:'Thợ bến cảng',deskkeeper:'Người giữ bàn nghỉ',simeon:'Nhân chứng · Gác mái',sawyer:'Thợ cưa ngoài hẻm',private:'Độc thoại nội tâm',description:'Quan sát chi tiết'};
    function frameDialogue(p,player,dist=2.35,heightOff=1.32,angleOff=.26){
      const dx=player.x-p.x,dz=player.z-p.z,base=Math.atan2(dx,dz);
      for(const [d,ang]of [[dist,base+angleOff],[dist,base-angleOff],[1.85,base+angleOff],[1.55,base]]){
        const cx=p.x+Math.sin(ang)*d,cz=p.z+Math.cos(ang)*d,cy=p.y+1.48;
        if(ar.visible({x:p.x,y:p.y+heightOff,z:p.z},{x:cx,y:cy,z:cz}))return engine.inspect([p.x,p.z],{height:p.y+heightOff,camera:[cx,cy,cz],showPlayer:true});
      }
      engine.inspect([p.x,p.z],{height:p.y+heightOff,distance:Math.min(dist,2.2),bearing:base+angleOff,showPlayer:true});
    }
    function show(key,done,choices){
      ui={key,pages:dialogue[key],index:0,done,choices};node.hidden=false;panel.hidden=true;options.stop?.();engine.controls(0,0);engine.pause(true);
      const first=engine.cameraState().view==='first';
      if(key==='seam'&&!first){const p=mounted.inspectBook(0);engine.inspect([p.x,p.z],{height:p.y,distance:1.42,bearing:.62,showPlayer:true});}
      else if(key==='b06'&&!first)engine.inspect([-20.48,-4.2],{height:.93,distance:1.38,bearing:.84});
      else if(key==='night'){
        if(!first)engine.inspect([-2.3,5.88],{height:.96,camera:[-.55,1.46,8.25],showPlayer:true});
        else{const head=actors.natan.object.getObjectByName('head').getWorldPosition(new mounted.T.Vector3());aimAt(head.x,head.y,head.z);}
      }
      else if(key==='rooftop'){
        if(!first)engine.inspect([-21.5,-22.5],{height:1.15,camera:[-25.5,6.45,-19.2],showPlayer:false});
        else aimAt(-22.5,1.0,-23.0);
      }
      else if(key==='outro'&&!first){const p=engine.spatial();engine.inspect([-6,-18],{height:1.45,camera:[p.x+1.1,p.y+1.95,p.z+2.9],showPlayer:true});}
      else if(!first){
        const person={arrival:'dockworker',stranger:'sawyer',investigate:'sawyer',loadGreeting:'natan',ledger:'natan',fire:'titus',cart:'titus',pulley:'titus',workers:'worker1',lever:'titus',receive:'titus',extract:'simeon',yosef:'yosef',meal:'rina',mealPlan:'rina',lodgingPrompt:'deskkeeper',paid:'deskkeeper',contributed:'rina'}[key],p=person&&actorPoint(person),player=engine.spatial();
        if(p)frameDialogue(p,player);
      }
      renderPage();
    }
    function renderPage(){
      if(!ui)return;const [who,line]=ui.pages[ui.index],lastPage=ui.index===ui.pages.length-1,role=speakerRoles[who]||'';
      const pips=ui.pages.length>1?`<span class="q01-pips" aria-hidden="true">${ui.pages.map((_,idx)=>`<i${idx===ui.index?' class="is-on"':idx<ui.index?' class="is-done"':''}></i>`).join('')}</span>`:'';
      node.dataset.speaker=who;node.innerHTML=`<div class="q01-dialogue-head"><span>${esc(who==='avatar'?getState().profile.name:names[who]||who)}${role?` <em>· ${esc(role)}</em>`:''}</span>${pips}<small>${ui.index+1} / ${ui.pages.length}</small><button data-q01="leave" aria-label="Tạm dừng cuộc nói">×</button></div><p class="q01-spoken" aria-live="polite">${esc(line)}</p><div class="q01-dialogue-actions"><button data-q01="back" ${ui.index?'':'disabled'}>Đọc lại</button><button data-q01="repeat">Nghe lại</button>${lastPage&&ui.choices?ui.choices.map(([id,label])=>`<button class="primary" data-q01="${esc(id)}">${esc(label)}</button>`).join(''):`<button class="primary" data-q01="next">${lastPage?'Tiếp tục':'Câu tiếp'}</button>`}</div>`;
      mounted.speak(who,line);
      if(ui.key==='seam'&&engine.cameraState().view!=='first'){const bp=mounted.inspectBook(ui.index);engine.inspect([bp.x,bp.z],{height:bp.y,distance:1.42,bearing:.62+ui.index*.08,showPlayer:true});}
      if(ui.key==='night')mounted.setNightRopeRest(ui.index>=5);
      if(ui.key==='night'&&ui.index===5)audio?.material('rope',[-2.6,5.8]);
      else if(ui.key==='yosef'&&ui.index===8)audio?.material('cloth',[-2,-12]);
      else if(['ledger','seam','b06'].includes(ui.key)&&ui.index===0)audio?.material('paper',[engine.spatial().x,engine.spatial().z]);
      else if(ui.key==='arrival'&&ui.index===0)audio?.material('wood',[-6,-28]);
      audio?.setMode(who==='private'?'quiet':'dialogue');if(!['description','private'].includes(who)&&getState().settings.autoVoice!==false)audio?.speak(who,line,{label:names[who]});else audio?.stopVoice();
      history.push({dialogue:ui.key,page:ui.index,speaker:who});options.log?.(names[who],line);
    }
    function next(){if(!ui)return;if(ui.index+1<ui.pages.length){ui.index++;renderPage();}else{const done=ui.done;close();done?.();}}
    function spatialNear(id,r=2.6){return I.near(engine.spatial(),point(id),r);}
    function gather(id){const p=point(id);walk('titus',{...p,x:p.x+(id==='lever'?1.8:.95),z:p.z+1.05});}
    function interact(full){
      if(disposed||resting||work||intro)return true;if(ui)return true;const id=String(full).replace(/^q01:/,'');if(!point(id)||!engine.within('q01:'+id))return false;
      const s=getState(),q=s.sceneProgress.Q01,r=q.rescue,done=s.quests.Q01.done;
      if(s.quests.Q01.route){if(id==='handoff')onAdvance();else show('outro');return true;}
      if(q.beat===0&&id==='disembark'){show('arrival',()=>event('disembark'));return true;}
      if(q.beat===1){
        if(id==='alley')show('stranger',null,[['investigate','Quan sát rồi hỏi người thợ'],['follow','Tự đi theo tới góc hẻm']]);
        else if(id==='follow'&&api.followingStranger){if(!mounted.strangerHidden(engine.spatial()))toast('Người ấy đang đi tới góc xưởng. Bạn vẫn còn nhìn thấy họ.');else show('follow',()=>{event('stranger',{response:'follow'});api.followingStranger=false;});}
        else toast('Tới cửa xưởng để tự chọn cách tiếp cận người lạ.');return true;
      }
      if(q.beat===2){
        if(id==='load'&&!done.includes('brace')){show('loadGreeting',()=>options.load());return true;}
        if(id==='ledger'&&done.includes('brace')){
          if(!I.near(actorPoint('natan'),point('ledger'),3)){toast('Natan đang trở về bàn sổ. Đi cùng chú qua lối xưởng.');return true;}
          if(!done.includes('ledger'))show('ledger',()=>{action('ledger');show('seam',()=>event('ledgerSeam'));});
          else show('seam',()=>event('ledgerSeam'));return true;
        }
      }
      if(q.beat===3&&id==='titus'){show('fire',()=>event('fire'));return true;}
      if(q.beat===4){
        if(!r.route&&id==='titus'){show('fire',null,[['mechanical','Bắt đầu cùng Titus ở bộ tời'],['manual','Bắt đầu cùng nhóm nâng xà']]);return true;}
        if(!r.route){toast(id==='cart'||id==='rope'?'Xe có cữ và dây giữ. Tay dây vận hành từ sân; cần chèn xe trước.':'Xà chắn lối chính. Hai thợ có thể cùng kê, nâng và chèn lại. Hỏi Titus để bắt đầu.');return true;}
        if(r.steps.length===0&&r.route==='mechanical'){
          if(id==='rope'){audio?.effect?.('cart-block',{at:[point('cart').x,.5,point('cart').z],gain:.45});toast('Xe đối trọng còn lỏng trên ray. Đẩy xe tới cữ và chèn bánh trước khi kéo tời.');return true;}
          if(id==='cart'){
            gather('cart');if(!I.near(actorPoint('titus'),point('cart'),4)){toast('Titus đang tới giữ dây. Chờ anh ấy rồi bắt đầu.');return true;}
            if(!api.seenIntro.cart){api.seenIntro.cart=true;show('cart',()=>openWork('cart'));}else openWork('cart');
            return true;
          }
        }
        if(r.steps.length===0&&r.route==='manual'){
          if(id==='workers'){
            show('workers',()=>{api.activity='workers';api.rescue.workersBriefed=true;walk('worker1',{...point('lever'),x:point('lever').x-1.25});walk('worker2',{...point('lever'),x:point('lever').x+1.15});gather('lever');sync();});return true;
          }
          if(id==='lever'){
            if(!api.rescue.workersBriefed){toast('Xà quá nặng để làm một mình. Mời hai thợ và Titus tới cùng kê xà trước.');return true;}
            if(!I.near(actorPoint('worker1'),point('lever'),3)||!I.near(actorPoint('worker2'),point('lever'),3)||!I.near(actorPoint('titus'),point('lever'),4)){
              if(!jobs.has('worker1'))walk('worker1',{...point('lever'),x:point('lever').x-1.25});
              if(!jobs.has('worker2'))walk('worker2',{...point('lever'),x:point('lever').x+1.15});
              if(!jobs.has('titus'))gather('lever');
              toast('Đang chờ hai thợ và Titus cùng vào vị trí kê xà.');return true;
            }
            openWork('workers');return true;
          }
        }
        if(r.steps.length===1){
          if(r.route==='mechanical'&&id==='rope'){
            gather('rope');if(!I.near(actorPoint('titus'),point('rope'),4)){toast('Chờ Titus vào vị trí cùng kéo dây.');return true;}
            if(!api.seenIntro.pulley){api.seenIntro.pulley=true;show('pulley',()=>openWork('pulley'));}else openWork('pulley');
            return true;
          }
          if(r.route==='manual'&&id==='lever'){
            gather('lever');
            if(!I.near(actorPoint('worker1'),point('lever'),3)||!I.near(actorPoint('worker2'),point('lever'),3)||!I.near(actorPoint('titus'),point('lever'),4)){
              if(!jobs.has('worker1'))walk('worker1',{...point('lever'),x:point('lever').x-1.25});
              if(!jobs.has('worker2'))walk('worker2',{...point('lever'),x:point('lever').x+1.15});
              toast('Chờ đủ nhóm giữ đầu đòn tại xà.');return true;
            }
            if(!api.seenIntro.lever){api.seenIntro.lever=true;show('lever',()=>openWork('lever'));}else openWork('lever');
            return true;
          }
        }
        if(r.steps.length===2){
          if(id==='commonDoor'&&!api.commonOpen){
            if(!I.near(actorPoint('titus'),point('commonDoor'),3)){toast('Chờ Titus lên cùng tới cửa gác.');return true;}
            api.commonOpen=true;ar.setPreview({common:true});audio?.effect?.('wood-slide',{at:[point(id).x,G.MEZZ,point(id).z],gain:.5});audio?.material('wood',[point(id).x,point(id).z]);sync();return true;
          }
          if(id==='reception'&&api.commonOpen&&!api.roofChecked){
            if(!I.near(actorPoint('titus'),point('reception'),2.8)){toast('Chờ Titus cùng kiểm điểm nhận.');return true;}
            api.roofChecked=true;walk('titus',{...point('reception'),x:point('reception').x+.25,z:point('reception').z+.55});show('receive',()=>sync());return true;
          }
          if(id==='reception'&&api.roofChecked){toast('Titus đã giữ điểm nhận. Hãy xuống tầng gác C1 đón Simeon và người học việc.');return true;}
          if(id==='mezzanine'&&api.roofChecked){
            if(!I.near(actorPoint('titus'),point('reception'),1.6)){walk('titus',{...point('reception'),x:point('reception').x+.25,z:point('reception').z+.55});toast('Chờ Titus đứng ổn định tại điểm nhận trên mái trước.');return true;}
            event('rescueStep',{step:'exit'});return true;
          }
        }
        if(r.steps.length===3){
          if(id==='mezzanine'&&!api.activity){show('extract',()=>{api.activity='extract';api.rescue.extractBriefed=true;sync();});return true;}
          if(id==='reception'){
            if(!api.activity||!api.rescue.extractBriefed){toast('Xuống gác gọi Simeon và người học việc cùng đi lên trước.');return true;}
            const rp=point('reception');
            if(!I.near(actorPoint('simeon'),rp,1.8)||!I.near(actorPoint('apprentice'),rp,1.8)){
              walk('simeon',{...rp,x:rp.x-.95,z:rp.z-.55});walk('apprentice',{...rp,x:rp.x+.70,z:rp.z-.65});
              toast('Chờ cả Simeon và người học việc lên tới điểm nhận trên mái rồi mới xác nhận.');sync();return true;
            }
            event('rescueStep',{step:'extract'});api.activity=null;api.extractSettling=false;sync();return true;
          }
        }
      }
      if(q.beat===5&&id==='lookout'){mounted.lookout();show('rooftop',()=>event('rooftop'));return true;}
      if(q.beat===6&&id==='yosef'){show('yosef',()=>event('yosefPrivacy'));return true;}
      if(q.beat===7){
        if(id==='meal'&&!done.includes('meal')){show('meal',()=>action('meal'));return true;}
        if(id==='meal'&&done.includes('meal')&&!s.quests.Q01.plan&&api.pendingPlan==='meal'){show('mealPlan',()=>{action('choose',{choice:'meal'});api.pendingPlan=null;});return true;}
        if(id==='lodging'&&done.includes('meal')&&!s.quests.Q01.plan){
          const choices=['lodging','meal'].filter(c=>root.WitnessModel.planAllowed(s,c)).map(c=>[c==='lodging'?'plan-lodging':'plan-meal',c==='lodging'?'Dành góc bàn có đèn':'Nhận phần góp bếp sáng']);show('lodgingPrompt',null,choices);return true;
        }
        if(id==='rest'&&s.quests.Q01.plan){if(jobs.has('natan')||!I.near(actorPoint('natan'),point('rest'),3)){toast('Natan đang ra chỗ ngồi. Chờ chú rồi cùng nói chuyện.');return true;}if(!natanVisible()){toast('Đi vòng ra ghế phía sau xưởng để ngồi cùng Natan.');return true;}show('night',null,[['rest','Nghỉ, sáng mai trở lại kho'],['stay','Ngồi lại một lát']]);return true;}
      }
      if(q.beat===8){
        if(id==='b06'&&!q.b06PreliminaryObserved){show('b06',()=>event('observeB06'));return true;}
        if(q.b06PreliminaryObserved&&id===(s.quests.Q01.plan==='lodging'?'lodging':'meal')){
          show(s.quests.Q01.plan==='lodging'?'paid':'contributed',()=>{action(s.quests.Q01.plan==='lodging'?'pay-lodging':'give-oil');show('outro');});return true;
        }
      }
      toast(goal(s)[2]);return true;
    }
    function safeInteract(id){try{return interact(id);}catch(err){toast(err.message);return true;}}
    const workSpecs={
      cart:{title:'Xe đối trọng · Đường ray C0',hint:'Kéo/nhấn giữ (hoặc W/D/kéo trên cảnh 3D) để đẩy xe tới cữ, chèn hai nêm bánh rồi kiểm dây tải.',target:[ -31.9,.6,-4.6],key:'cartProgress',audio:'cart-rumble',stepAudio:'wood-slide',stepLabel:'Đẩy xe tới (+25%)',holdLabel:'Giữ đẩy xe tới cữ',backLabel:'Kéo lùi'},
      pulley:{title:'Bộ tời tay dây · Lối phụ',hint:'Cùng Titus giữ nhịp kéo dây (W/D hoặc kéo xuống trên cảnh) đưa cánh ngăn lên hết cữ, sau đó gài chốt khóa.',target:[-30.5,2.2,-7.8],key:'pulleyProgress',audio:'rope-friction',stepAudio:'rope-friction',stepLabel:'Kéo một nhịp cùng Titus (+25%)',holdLabel:'Giữ để kéo tời',backLabel:'Nới dây'},
      workers:{title:'Kê điểm tựa · Nhóm bốn người',hint:'Đủ Titus và hai thợ đã đứng vào hàng. Đặt điểm kê gỗ vào đá đỡ và gài đầu đòn trước khi nâng.',target:[-18.4,.55,-6.4],key:null},
      lever:{title:'Nâng xà · Đặt nêm và kiểm vững',hint:'Cùng nhóm nâng nhịp (W/D hoặc kéo) đưa xà lên gối tựa, chèn nêm gỗ rồi kiểm độ đứng vững trước khi buông.',target:[-18.8,.75,-6.5],key:'leverProgress',audio:'wood-strain',stepAudio:'wood-creak',stepLabel:'Cùng nâng một nhịp (+25%)',holdLabel:'Giữ để cùng nâng đòn',backLabel:'Hạ nhẹ'}
    };
    function applyWorkVisual(kind,active=true){
      const r=api.rescue,frac=kind==='cart'?r.cartProgress:kind==='pulley'?r.pulleyProgress:r.leverProgress||0;
      mounted.perform(kind==='workers'?'lever':kind,active,frac,{chocked:r.cartChocked,testPulse:work?.pulse||0,secured:r.gateSecured,fulcrum:r.fulcrumPlaced,wedged:r.beamWedged,settled:r.beamSettled});
    }
    function aimWorkCamera(kind){
      const spec=workSpecs[kind],frac=spec.key?api.rescue[spec.key]:0;
      if(engine.cameraState().view==='first'){if(work&&!work.aimed){work.aimed=true;aimAt(...spec.target);}return;}
      if(getState().settings.motion==='calm')return;
      if(kind==='cart')engine.inspect([-32.8+1.9*frac,-4.6],{height:.62,camera:[-30.1,1.95,-1.95],showPlayer:true,cameraTracking:true});
      else if(kind==='pulley')engine.inspect([-30.4,-7.9],{height:2.1+frac*1.3,camera:[-27.4,2.15,-2.9],showPlayer:true,cameraTracking:true});
      else engine.inspect([-18.4,-6.5],{height:.88,camera:[-20.8,2.05,-2.9],showPlayer:true,cameraTracking:true});
    }
    function playWorkAudio(id,at){
      const now=performance.now();if(now-lastWorkSfx<320)return;
      lastWorkSfx=now;audio?.effect?.(id,{at,gain:.44,cooldown:240});
    }
    function updateWorkMeters(){
      if(!work)return;
      const spec=workSpecs[work.kind],pct=spec.key?Math.round(api.rescue[spec.key]*100):100;
      const fill=workNode.querySelector('.q01-work-fill'),out=workNode.querySelector('.q01-work-pct'),slider=workNode.querySelector('[data-q01-slider]');
      if(fill)fill.style.width=pct+'%';
      if(out)out.textContent=pct+'%';
      if(slider&&document.activeElement!==slider)slider.value=String(pct);
      const r=api.rescue;
      const chockBtn=workNode.querySelector('[data-q01-work=cart-chock]');if(chockBtn)chockBtn.disabled=r.cartChocked;
      const latchBtn=workNode.querySelector('[data-q01-work=pulley-latch]');if(latchBtn)latchBtn.disabled=r.gateSecured;
      const wedgeBtn=workNode.querySelector('[data-q01-work=lever-wedge]');if(wedgeBtn)wedgeBtn.disabled=r.beamWedged;
    }
    function renderWork(){
      if(!work){workNode.hidden=true;return;}
      const k=work.kind,spec=workSpecs[k],r=api.rescue,pct=spec.key?Math.round(r[spec.key]*100):0;
      const chip=(ok,text)=>`<span class="q01-work-chip${ok?' is-done':''}">${ok?'✓':'·'} ${esc(text)}</span>`;
      const chips=k==='cart'
        ?chip(r.cartProgress>=.98,`Xe tại cữ (${pct}%)`)+chip(r.cartChocked,'Hai nêm bánh')+chip(r.loadTested,'Kiểm dây tải')
        :k==='pulley'
        ?chip(r.pulleyProgress>=.98,`Kéo tời (${pct}%)`)+chip(r.gateSecured,'Chốt giữ cánh')
        :k==='workers'
        ?chip(r.workersBriefed,'Titus & 2 thợ')+chip(r.fulcrumPlaced,'Điểm kê dưới xà')
        :chip(r.leverProgress>=.98,`Nâng xà (${pct}%)`)+chip(r.beamWedged,'Nêm gỗ dưới xà')+chip(r.beamSettled,'Độ vững kết cấu');
      const controls=k==='workers'
        ?`<div class="q01-work-buttons"><button class="${r.fulcrumPlaced?'':'primary'}" data-q01-work="lever-fulcrum" ${r.fulcrumPlaced?'disabled':''}>Đặt điểm kê và gài đầu đòn</button><button class="${r.fulcrumPlaced?'primary':''}" data-q01-work="workers-confirm">Xác nhận đủ nhóm và điểm kê</button></div>`
        :`<div class="q01-work-track"><div class="q01-work-bar"><div class="q01-work-fill" style="width:${pct}%"></div></div><strong class="q01-work-pct">${pct}%</strong></div><label class="q01-work-slider"><span>Kéo / trượt chỉnh trực tiếp (hoặc kéo trực tiếp trên cảnh 3D)</span><input type="range" min="0" max="100" value="${pct}" data-q01-slider aria-label="${esc(spec.title)}"></label><div class="q01-work-buttons"><button data-q01-work="back">${esc(spec.backLabel)}</button><button data-q01-hold="forward">${esc(spec.holdLabel)}</button><button class="${(k==='cart'?r.cartProgress:k==='pulley'?r.pulleyProgress:r.leverProgress)<.98?'primary':''}" data-q01-work="step">${esc(spec.stepLabel)}</button>${k==='cart'?`<button class="${r.cartProgress>=.98&&!r.cartChocked?'primary':''}" data-q01-work="cart-chock" ${r.cartChocked?'disabled':''}>Chèn hai nêm bánh xe</button><button class="${r.cartChocked?'primary':''}" data-q01-work="cart-test">Kiểm dây tải &amp; Xác nhận</button>`:k==='pulley'?`<button class="${r.pulleyProgress>=.98&&!r.gateSecured?'primary':''}" data-q01-work="pulley-latch" ${r.gateSecured?'disabled':''}>Gài chốt giữ cánh ngăn</button><button class="${r.gateSecured?'primary':''}" data-q01-work="pulley-confirm">Xác nhận lối phụ an toàn</button>`:`<button class="${r.leverProgress>=.98&&!r.beamWedged?'primary':''}" data-q01-work="lever-wedge" ${r.beamWedged?'disabled':''}>Chèn nêm dưới xà</button><button class="${r.beamWedged?'primary':''}" data-q01-work="lever-settle">Kiểm độ vững &amp; Xác nhận</button>`}</div>`;
      workNode.hidden=false;
      workNode.innerHTML=`<div class="q01-dialogue-head"><span>${esc(spec.title)}</span><button data-q01-work="close" aria-label="Tạm rời tay">×</button></div><p class="q01-work-hint">${esc(spec.hint)}</p><div class="q01-work-chips">${chips}</div>${work.msg?`<p class="q01-work-msg" role="status">${esc(work.msg)}</p>`:''}${controls}`;
    }
    function setWorkProgress(nextVal){
      if(!work)return;const spec=workSpecs[work.kind];if(!spec.key)return;
      const clamped=Math.max(0,Math.min(1,nextVal));
      if(Math.abs(clamped-api.rescue[spec.key])<.0001)return;
      api.rescue[spec.key]=clamped;
      if(clamped<.98){if(work.kind==='cart')api.rescue.cartChocked=false;if(work.kind==='pulley')api.rescue.gateSecured=false;if(work.kind==='lever')api.rescue.beamWedged=false;}
      applyWorkVisual(work.kind,true);aimWorkCamera(work.kind);updateWorkMeters();
    }
    function closeWork(restoreProjection=true){
      if(!work)return;const kind=work.kind;work=null;drag=null;workNode.hidden=true;
      mounted.perform(kind==='workers'?'lever':kind,false,1,{chocked:api.rescue.cartChocked,secured:api.rescue.gateSecured,fulcrum:api.rescue.fulcrumPlaced,wedged:api.rescue.beamWedged,settled:api.rescue.beamSettled});
      if(restoreProjection){ar.projectScene(getState().sceneProgress.Q01);mounted.sync(getState());}
      engine.pause(false);options.resume?.();sync();
    }
    function openWork(kind){
      close();options.stop?.();engine.controls(0,0);engine.pause(true);
      work={kind,pushing:0,msg:'',pulse:0,slipTimer:0,aimed:false};panel.hidden=true;
      applyWorkVisual(kind,true);aimWorkCamera(kind);renderWork();refresh?.();
    }
    function workSlip(kind,progressKey,backAmount,message){
      api.rescue[progressKey]=Math.max(0,(api.rescue[progressKey]||0)-backAmount);
      work.msg=message;work.pulse=1;work.slipTimer=.4;
      audio?.effect?.('wood-jolt',{at:[engine.spatial().x,.7,engine.spatial().z],gain:.62});
      if(kind==='cart')audio?.effect?.('cart-rumble',{at:[point('cart').x,.4,point('cart').z],gain:.55});
      applyWorkVisual(kind,true);renderWork();
    }
    function finishWorkStep(step){
      const finishedKind=work?.kind;work=null;drag=null;workNode.hidden=true;
      if(finishedKind)mounted.perform(finishedKind==='workers'?'lever':finishedKind,false,1,{chocked:api.rescue.cartChocked,secured:api.rescue.gateSecured,fulcrum:api.rescue.fulcrumPlaced,wedged:api.rescue.beamWedged,settled:api.rescue.beamSettled});
      engine.pause(false);options.resume?.();
      try{event('rescueStep',{step});}
      catch(err){ar.projectScene(getState().sceneProgress.Q01);mounted.sync(getState());toast(err.message);}
      sync();
    }
    function handleWorkAction(id){
      if(!work)return;const k=work.kind,r=api.rescue,p=engine.spatial();work.msg='';
      if(id==='close'){closeWork();return;}
      if(id==='step'||id==='back'){
        const spec=workSpecs[k];if(!spec.key)return;
        playWorkAudio(spec.stepAudio,[p.x,.7,p.z]);
        setWorkProgress(r[spec.key]+(id==='step'?.25:-.25));
        if(r[spec.key]>=.98)renderWork();
        return;
      }
      if(id==='cart-chock'){
        if(r.cartProgress<.98){audio?.effect?.('cart-block',{at:[p.x,.4,p.z],gain:.45});work.msg='Xe chưa tới sát cữ cuối ray (-30.9m); đẩy hết cữ trước rồi mới đặt nêm.';renderWork();return;}
        r.cartChocked=true;work.msg='Đã chèn đủ hai nêm bánh xe. Hãy kiểm dây tải.';audio?.effect?.('wood-brace',{at:[p.x,.4,p.z],gain:.55});applyWorkVisual('cart',true);renderWork();return;
      }
      if(id==='cart-test'){
        if(r.cartProgress<.98){work.msg='Đưa xe tới sát cữ ở cuối ray trước đã.';renderWork();return;}
        if(!r.cartChocked){workSlip('cart','cartProgress',.45,'Khoan! Xe vừa trượt ngược lại trên ray vì chưa chèn nêm bánh! Hãy đẩy lại sát cữ rồi chèn nêm.');return;}
        r.loadTested=true;work.pulse=.6;audio?.effect?.('rope-friction',{at:[p.x,.8,p.z],gain:.5});audio?.effect?.('wood-thud',{at:[p.x,.4,p.z],gain:.5});
        finishWorkStep('cart');toast('Xe đối trọng đã ăn nêm chắc. Sang tay dây ở sân cùng Titus.');return;
      }
      if(id==='pulley-latch'){
        if(r.pulleyProgress<.98){audio?.effect?.('rope-friction',{at:[p.x,1,p.z],gain:.45});work.msg='Kéo cánh ngăn lên hết hành trình (100%) mới cài được chốt giữ.';renderWork();return;}
        r.gateSecured=true;work.msg='Chốt giữ cánh ngăn đã ăn khớp.';audio?.effect?.('wood-brace',{at:[p.x,1.5,p.z],gain:.55});applyWorkVisual('pulley',true);renderWork();return;
      }
      if(id==='pulley-confirm'){
        if(r.pulleyProgress<.98){work.msg='Cánh ngăn chưa lên hết cữ. Giữ nhịp kéo cùng Titus tới 100%.';renderWork();return;}
        if(!r.gateSecured){workSlip('pulley','pulleyProgress',.28,'Chưa cài chốt giữ cánh! Cánh ngăn vừa tụt xuống một nhịp.');return;}
        audio?.effect?.('wood-thud',{at:[p.x,1.5,p.z],gain:.55});finishWorkStep('pulley');toast('Cánh ngăn lối phụ đã được giữ chốt an toàn. Cùng Titus lên thang phụ.');return;
      }
      if(id==='lever-fulcrum'){
        r.fulcrumPlaced=true;work.msg='Điểm kê và đầu đòn đã nằm đúng dưới gầm xà.';audio?.effect?.('wood-thud',{at:[p.x,.4,p.z],gain:.5});applyWorkVisual('workers',true);renderWork();return;
      }
      if(id==='workers-confirm'){
        if(!r.fulcrumPlaced){audio?.effect?.('wood-thud',{at:[p.x,.4,p.z],gain:.4});work.msg='Đặt điểm kê và gài đầu đòn vào gầm xà trước khi nâng.';renderWork();return;}
        finishWorkStep('workers');if(!api.seenIntro.lever){api.seenIntro.lever=true;show('lever',()=>openWork('lever'));}else openWork('lever');return;
      }
      if(id==='lever-wedge'){
        if(r.leverProgress<.98){audio?.effect?.('wood-strain',{at:[p.x,.6,p.z],gain:.45});work.msg='Phải nâng xà hết nhịp vào gối tựa (100%) mới chèn được nêm dưới xà.';renderWork();return;}
        r.beamWedged=true;work.msg='Đã chèn hai nêm gỗ chặt dưới xà.';audio?.effect?.('wood-brace',{at:[p.x,.4,p.z],gain:.55});applyWorkVisual('lever',true);renderWork();return;
      }
      if(id==='lever-settle'){
        if(r.leverProgress<.98){work.msg='Xà chưa vào hết gối tựa. Tiếp tục nâng nhịp cùng Titus và hai thợ.';renderWork();return;}
        if(!r.beamWedged){workSlip('lever','leverProgress',.35,'Khoan buông! Chưa đặt nêm gỗ dưới xà — nhóm vừa phải ghì lại đầu đòn!');return;}
        r.beamSettled=true;audio?.effect?.('shoulder-test',{at:[p.x,.6,p.z],gain:.5});audio?.effect?.('wood-thud',{at:[p.x,.4,p.z],gain:.55});
        finishWorkStep('lever');toast('Xà đã yên trên gối tựa và ăn nêm chắc. Đường chính lên gác đã mở.');
      }
    }
    function renderEscort(){
      const s=getState(),q=s.sceneProgress.Q01,showBar=!disposed&&!ui&&!work&&!resting&&!intro&&q.beat===4&&q.rescue.steps.length===3&&api.activity==='extract';
      escortNode.hidden=!showBar;if(!showBar)return;
      const rp=point('reception'),label=id=>I.near(actorPoint(id),rp,1.8)?'Trên mái ✓':actorPoint(id)?.y>4.5?'Sân mái':'C1 · Theo sau';
      escortNode.innerHTML=`<span><strong>Titus</strong>: Chờ ở điểm nhận ✓</span><span><strong>Simeon</strong>: ${esc(label('simeon'))}</span><span><strong>Học việc</strong>: ${esc(label('apprentice'))}</span><button data-q01-escort="regroup">Gọi giữ nhịp</button>`;
    }
    escortNode.addEventListener('click',e=>{
      const b=e.target.closest('[data-q01-escort=regroup]');if(!b)return;
      const target=I.near(engine.spatial(),point('reception'),2.6)?point('reception'):engine.spatial();
      walk('simeon',{...target,x:target.x-.75,z:target.z-.45});walk('apprentice',{...target,x:target.x+.65,z:target.z-.55});
      toast('Đã gọi Simeon và người học việc đi sát theo bạn.');renderEscort();
    });
    workNode.addEventListener('click',e=>{const b=e.target.closest('[data-q01-work]');if(!b||b.disabled)return;handleWorkAction(b.dataset.q01Work);});
    workNode.addEventListener('input',e=>{const sl=e.target.closest('[data-q01-slider]');if(!sl||!work)return;const spec=workSpecs[work.kind];if(!spec.key)return;playWorkAudio(spec.stepAudio,[engine.spatial().x,.7,engine.spatial().z]);setWorkProgress(Number(sl.value)/100);if(Number(sl.value)>=98)renderWork();});
    const stopHold=()=>{if(work)work.pushing=0;};
    workNode.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-q01-hold]');if(!b||!work)return;work.pushing=b.dataset.q01Hold==='forward'?1:-1;});
    window.addEventListener('pointerup',stopHold);window.addEventListener('pointercancel',stopHold);
    const worldEl=document.querySelector('#world');
    const onWorldDown=e=>{if(!work||!workSpecs[work.kind].key||e.target.closest('#q01-rescue-work,button,input,dialog'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,base:api.rescue[workSpecs[work.kind].key]||0};};
    const onWorldMove=e=>{if(!work||drag?.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,delta=work.kind==='pulley'?(dy*.85+dx*.35)/180:(dx-dy)/200;setWorkProgress(drag.base+delta);playWorkAudio(workSpecs[work.kind].audio,[engine.spatial().x,.7,engine.spatial().z]);};
    const onWorldUp=e=>{if(drag?.id===e.pointerId){const spec=workSpecs[work?.kind];drag=null;if(spec?.key&&api.rescue[spec.key]>=.98)renderWork();}};
    worldEl?.addEventListener('pointerdown',onWorldDown);worldEl?.addEventListener('pointermove',onWorldMove);worldEl?.addEventListener('pointerup',onWorldUp);worldEl?.addEventListener('pointercancel',onWorldUp);
    function startRest(){
      close();options.stop?.();engine.pause(true);resting={t:0,seconds:getState().settings.motion==='calm'?1.2:7};node.hidden=false;panel.hidden=true;node.innerHTML='<div class="q01-dialogue-head"><span>Đêm ở xưởng</span></div><p class="q01-spoken">Sáng hôm sau</p><div class="q01-dialogue-actions"><button data-q01="wake">Tiếp tục sáng hôm sau</button></div>';audio?.stopVoice();audio?.setMode('quiet');
      if(engine.cameraState().view!=='first')engine.inspect([-2.3,5.88],{height:1.05,camera:[-.45,1.56,8.55],showPlayer:true,cameraTracking:true});
    }
    function wake(){if(!resting)return;mounted.setTime('dawn',1);resting=null;node.hidden=true;engine.pause(false);options.resume?.();event('recallT05');walk('natan',{x:-4,y:0,z:1,supportId:'world'});toast('Sáng hôm sau · Trở lại vành kho an toàn.');}
    function startIntro(){
      if(getState().sceneProgress.Q01.beat!==0||!I.near(engine.spatial(),point('boat'),.5)||getState().settings.cameraMode==='first'||engine.cameraState().view==='first')return;
      intro={t:0,seconds:4.8,p:{...engine.spatial()}};options.stop?.();engine.pause(true);panel.hidden=true;node.hidden=false;
      node.innerHTML='<div class="q01-dialogue-head"><span>Xêdarê · Chiều muộn</span></div><p class="q01-spoken">Sóng dưới chân kè. Tiếng bào vọng ra từ hẻm.</p><div class="q01-dialogue-actions"><button data-q01="take-control">Nhận điều khiển</button></div>';
    }
    function finishIntro(){if(!intro)return;intro=null;node.hidden=true;engine.pause(false);options.resume?.();sync();}
    const onKeyDown=e=>{
      if(intro&&/^(Key[WASDVE]|Arrow(Up|Down|Left|Right)|Escape)$/.test(e.code)){finishIntro();return;}
      if(!work||options.isPaused?.())return;
      if(e.code==='Escape'){e.preventDefault();e.stopPropagation();closeWork();return;}
      if(['KeyW','ArrowUp','KeyD','ArrowRight'].includes(e.code)){e.preventDefault();e.stopPropagation();work.pushing=1;return;}
      if(['KeyS','ArrowDown','KeyA','ArrowLeft'].includes(e.code)){e.preventDefault();e.stopPropagation();work.pushing=-1;return;}
      if(!e.repeat&&(e.code==='KeyE'||(e.code==='Space'&&!e.target.closest('button')))){
        e.preventDefault();e.stopPropagation();const k=work.kind,r=api.rescue;
        if(k==='workers')handleWorkAction(r.fulcrumPlaced?'workers-confirm':'lever-fulcrum');
        else if(k==='cart')handleWorkAction(r.cartProgress<.98?'step':r.cartChocked?'cart-test':'cart-chock');
        else if(k==='pulley')handleWorkAction(r.pulleyProgress<.98?'step':r.gateSecured?'pulley-confirm':'pulley-latch');
        else if(k==='lever')handleWorkAction(r.leverProgress<.98?'step':r.beamWedged?'lever-settle':'lever-wedge');
      }
    };
    const onKeyUp=e=>{if(work&&['KeyW','ArrowUp','KeyD','ArrowRight','KeyS','ArrowDown','KeyA','ArrowLeft'].includes(e.code))work.pushing=0;};
    document.addEventListener('keydown',onKeyDown,true);document.addEventListener('keyup',onKeyUp,true);
    node.addEventListener('click',e=>{const b=e.target.closest('[data-q01]');if(!b||b.disabled)return;const id=b.dataset.q01;try{
      if(id==='next')next();else if(id==='back'&&ui?.index){ui.index--;renderPage();}else if(id==='repeat'&&ui?.pages?.length)renderPage();else if(id==='leave')close();
      else if(id==='investigate'){mounted.departStranger();close();show('investigate',()=>event('stranger',{response:'investigate'}));}
      else if(id==='follow'){api.followingStranger=true;mounted.departStranger();close();sync();}
      else if(id==='mechanical'||id==='manual'){close();event('rescueRoute',{route:id});gather(id==='mechanical'?'cart':'lever');}
      else if(id==='plan-lodging'||id==='plan-meal'){const choice=id==='plan-lodging'?'lodging':'meal';close();if(choice==='meal'){api.pendingPlan='meal';sync();}else show('lodging',()=>action('choose',{choice}));}
      else if(id==='rest')startRest();else if(id==='stay')close();else if(id==='wake')wake();else if(id==='take-control')finishIntro();
    }catch(err){toast(err.message);}});
    panel.addEventListener('click',e=>{const b=e.target.closest('[data-q01-guide]');if(!b)return;if(b.dataset.q01Guide==='walk'){close();const id='q01:'+goal(getState())[0];if(!engine.walkTarget(id,()=>toast('Đã tới điểm làm việc.'),.3))toast('Chưa có đường thông. Kiểm cửa và người đi cùng.');}else if(b.dataset.q01Guide==='interact')safeInteract('q01:'+goal(getState())[0]);else if(b.dataset.q01Guide==='arrival')startIntro();});
    function checkpoint(){
      const s=getState(),q=s.sceneProgress.Q01,r=q.rescue;
      api.rescue=resetRescue(r?.steps);api.extractSettling=false;
      if(q.beat===0)return point('boat');
      if(q.beat===4){
        if(r.steps.includes('exit')){place('titus',{...point('reception'),x:point('reception').x+.25,z:point('reception').z+.55});api.commonOpen=true;api.roofChecked=true;return point('mezzanine');}
        if(r.steps.includes('workers')){place('worker1',{...point('lever'),x:point('lever').x-1.25});place('worker2',{...point('lever'),x:point('lever').x+1.15});}
        // No partial actor positions were persisted. Restart the whole unfinished
        // route check from C0, offset slightly so avatar never overlaps Titus.
        place('titus',point('titus'));return {...point('titus'),x:point('titus').x+.95,z:point('titus').z+.55};
      }
      if(q.beat>=5){const rp=point('reception');place('titus',{...rp,x:rp.x+.25,z:rp.z+.55});place('simeon',{...rp,x:rp.x-.95,z:rp.z-.55});place('apprentice',{...rp,x:rp.x+.70,z:rp.z-.65});}
      if(q.beat>=7)for(const [i,id]of ['titus','simeon','apprentice'].entries())place(id,{x:-16+i*1.05,y:0,z:-1,supportId:'world'});
      if(q.beat>=8)place('natan',{x:-4,y:0,z:1,supportId:'world'});
      return s.spatialPositions['Q01.mortal']||point(q.beat===1?'alley':q.beat===2?'load':q.beat===3?'titus':q.beat===5||q.beat===6?'reception':q.beat===7?'rest':'rest');
    }
    function sync(){
      if(disposed||!active(getState()))return;const s=getState(),q=s.sceneProgress.Q01;
      const key=JSON.stringify([q.world,q.rescue]);if(key!==projection){projection=key;ar.projectScene(q);if(api.commonOpen&&!ar.preview.common)ar.setPreview({common:true});mounted.sync(s);}
      if(lightKey!==q.phase){lightKey=q.phase;if(!resting)mounted.setTime(q.phase);}
      if(q.beat===3&&!alarm){alarm=true;audio?.effect('wood-strain',{at:[-25,2,-10],gain:.35});audio?.effect('q01-bell',{at:[-25,3,-10],gain:.4});}
      const [id,title,detail]=goal(s);panel.innerHTML=`<span class="q01-chapter-label">XÊDARÊ · CHƯƠNG I</span><strong>${esc(title)}</strong><p>${esc(detail)}</p><div><button data-q01-guide="walk">Đi theo lối tới điểm này</button><button data-q01-guide="interact">Thao tác tại chỗ</button>${q.beat===0&&I.near(engine.spatial(),point('boat'),.5)&&engine.cameraState().view!=='first'?'<button data-q01-guide="arrival">Mở cảnh bến cảng</button>':''}</div>`;
      panel.dataset.goal=id;panel.hidden=!!options.isTitle?.()||s.settings.guideMode==='off'||!!root.WitnessCraft.field(s)||!!(ui||work||resting||intro);
      renderEscort();mounted.sync(s);
      if(q.beat>=6&&!mounted.descending){mounted.descending=true;for(const [i,id]of ['titus','simeon','apprentice'].entries())if(actorPoint(id).y>4){chain(id,[point('roofExit'),point('descentTop'),{x:-12,y:2.52,z:-13.5,supportId:'q01-landing'},{x:-9,y:2.52,z:-13.5,supportId:'q01-landing'},{x:-9,y:0,z:-19.6,supportId:'world'},{x:-16+i*1.05,y:0,z:-1,supportId:'world'}],i*2);}}
      if(q.beat===7&&!mounted.nightWalk){mounted.nightWalk=true;walk('natan',{...point('rest'),x:-2.35,z:6.42});}
      if(q.beat===2&&s.quests.Q01.done.includes('brace')&&!mounted.natanToDesk){mounted.natanToDesk=true;walk('natan',{x:-4,y:0,z:1,supportId:'world'});}
      refresh?.();
    }
    function follow(id,dt,target=null){
      const p=actorPoint(id),player=target||engine.spatial();if(!p||!player)return;
      if(Math.hypot(p.x-player.x,p.z-player.z)>1.05||Math.abs(p.y-player.y)>.35){const job=jobs.get(id);if(!job||!job.following||Math.hypot(job.goal.x-player.x,job.goal.z-player.z)>1.3)walk(id,player,true);}
      else if(jobs.get(id)?.following)jobs.delete(id);
    }
    function tick(t){
      if(disposed)return;const rawDt=Math.min(2,Math.max(0,t-last)||0),dt=Math.min(.05,rawDt);last=t;if(paused||options.isTitle?.()||options.isPaused?.())return;
      const q=getState().sceneProgress.Q01;
      if(intro){
        intro.t+=dt;const k=Math.min(1,intro.t/intro.seconds),ease=v=>v*v*(3-2*v),rise=ease(Math.min(1,k*1.85)),settle=ease(Math.max(0,k*1.65-.65)),p=intro.p;
        engine.inspect([p.x-.3*(1-settle),p.z+settle*1.45],{height:1.15+settle*.32,camera:[p.x-2.6*(1-settle)+Math.sin(k*Math.PI)*.45,1.62+rise*1.05+settle*1.45,p.z-2.75-settle*4.95],showPlayer:true,cameraTracking:true});
        if(k===1)finishIntro();
      }
      if(q.beat<3&&t-lastPlane>8){lastPlane=t;audio?.material('wood',[-10,6]);}
      if(work){
        if(work.slipTimer>0){work.slipTimer=Math.max(0,work.slipTimer-dt);if(work.slipTimer===0){work.pulse=0;applyWorkVisual(work.kind,true);}}
        if(work.pushing&&workSpecs[work.kind].key){
          const spec=workSpecs[work.kind],prev=api.rescue[spec.key];
          setWorkProgress(prev+work.pushing*dt*.65);
          if(Math.abs(api.rescue[spec.key]-prev)>.0001){playWorkAudio(spec.audio,[engine.spatial().x,.7,engine.spatial().z]);if((prev<.98&&api.rescue[spec.key]>=.98)||(prev>=.98&&api.rescue[spec.key]<.98))renderWork();}
        }
      }
      if(resting){resting.t+=rawDt;mounted.setTime('dawn',Math.min(1,resting.t/resting.seconds));if(resting.t>=resting.seconds)wake();}
      if(!ui&&!work&&!resting&&q.beat===4&&q.rescue.steps.length===2&&!api.roofChecked)follow('titus',dt);
      if(!ui&&q.beat===4&&q.rescue.steps.length===3&&api.activity==='extract'){
        if(!api.extractSettling&&I.near(engine.spatial(),point('reception'),2)){api.extractSettling=true;const rp=point('reception');walk('simeon',{...rp,x:rp.x-.95,z:rp.z-.55});walk('apprentice',{...rp,x:rp.x+.70,z:rp.z-.65});}
        if(!api.extractSettling){follow('simeon',dt);follow('apprentice',dt,actorPoint('simeon'));}
        if((tick.escortStamp=(tick.escortStamp||0)+dt)>.35){tick.escortStamp=0;renderEscort();}
      }
      for(const [id,j]of jobs){if(j.wait>0){j.wait-=dt;continue;}const p=actorPoint(id);while(j.path.length&&Math.hypot(p.x-j.path[0].x,p.z-j.path[0].z)<.06&&Math.abs(p.y-j.path[0].y)<.23)j.path.shift();
        if(!j.path.length){jobs.delete(id);j.done?.();continue;}const to=j.path[0],d=Math.hypot(to.x-p.x,to.z-p.z),step=Math.min(d,dt*2.25),next=ar.move(p,(to.x-p.x)/Math.max(.001,d)*step,(to.z-p.z)/Math.max(.001,d)*step);place(id,next);
        actors[id].object.rotation.y=Math.atan2(to.x-next.x,to.z-next.z);actors[id].moving=step>.0001;
        j.stuck=Math.hypot(next.x-p.x,next.z-p.z)<.00001?j.stuck+dt:0;if(j.stuck>3){errors.push('Actor kẹt: '+id);jobs.delete(id);toast(id+' đang chờ vì lối vướng. Trở lại và thử đi cùng.');}
      }
      mounted.setViewer(engine.spatial());mounted.tick(t,dt);
    }
    const initial=checkpoint();engine.restoreSpatial(initial);if(getState().sceneProgress.Q01.beat===0)engine.rotate(Math.PI+.26);mounted.sync(getState());
    api.engine=engine;api.readState=()=>copy(getState());api.interact=safeInteract;api.sync=sync;api.tick=tick;api.close=close;api.stateWithPosition=stateWithPosition;api.actorPoint=actorPoint;
    api.setPaused=value=>{paused=value;};api.dispose=()=>{disposed=true;document.removeEventListener('keydown',onKeyDown,true);document.removeEventListener('keyup',onKeyUp,true);window.removeEventListener('pointerup',stopHold);window.removeEventListener('pointercancel',stopHold);worldEl?.removeEventListener('pointerdown',onWorldDown);worldEl?.removeEventListener('pointermove',onWorldMove);worldEl?.removeEventListener('pointerup',onWorldUp);worldEl?.removeEventListener('pointercancel',onWorldUp);node.remove();workNode.remove();escortNode.remove();panel.remove();audio?.stopVoice();jobs.clear();if(session===api)session=null;};
    sync();if(getState().sceneProgress.Q01.beat===0&&getState().settings.motion!=='calm')startIntro();return api;
  }
  root.WitnessQ01Campaign={active,goal,plan,mount,createPresenter,notes,script:dialogue,release(){session?.dispose();mounted?.dispose();mounted=null;},get mounted(){return mounted},get presenter(){return session}};
})(globalThis);
