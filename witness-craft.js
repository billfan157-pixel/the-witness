(function(root){
  'use strict';
  const D=root.WitnessContent||(typeof require!=='undefined'?require('./witness-spine.js'):null),X=root.WitnessDepth||(typeof require!=='undefined'?require('./witness-depth.js'):null);
  const clone=x=>JSON.parse(JSON.stringify(x)),chapter=s=>D.chapters[s.chapter],owner=s=>s.layer?.id||chapter(s).id;
  const stores=s=>s.layer?(s.layer.craft||{}):(s.craft||{});
  const records=s=>s.layer?(s.layer.workshop?.records||{}):(s.workshop?.records||{});
  const row=(key,anchor,offset,kind,title,before,after=null,encounter=null)=>({key,anchor,offset,kind,title,before,after,encounter});
  const scenes={
    Q01:[row('axle','load',[1.9,-.5],'cart','Chốt nứt và đường tải','Vết xước xuống dốc vẫn còn mới. Chốt nứt đang giữ tải; hai vò trên cao khiến xe nghiêng.','Hai vò đã được hạ, đòn kê nhận tải và chốt cũ nằm riêng trên tấm vải.','Q01.LOAD'),row('handovers','natan',[-2,1.9],'tools','Bàn tay người tới ca sau','Natan để dụng cụ thành từng phần có người nhận, không gom vào một túi của riêng mình.')],
    Q02:[row('patch','register',[2,1.7],'paper','Mép dán B06','Thớ giấy dựng ở mép dán, nét mực mới đè phần cũ. Mã B06 vẫn đọc được. Dấu này chưa cho biết ai sửa.','Mép dán đã được soi riêng. Ghi chú giữ dấu sửa, chưa điền tên người sửa hay đổi B06 thành G17.','Q02.PALIMPSEST'),row('pot','rina',[-2.5,-.8],'meal','Nồi bữa ở đầu sân khác','Phần đếm của Rina đến từ bữa đã nấu. Rina không đứng nhìn người sửa sổ.')],
    Q03:[row('rut','route',[1.8,1.7],'tracks','Vệt bánh bị người qua lại xóa bớt','Chỗ đổi dây và vệt bánh có thể dựng một tuyến xe. Nút dây dùng chung không chỉ được tên người chuyển.','Một tuyến đã được kiểm; đoạn không còn dấu vẫn được giữ như khoảng cần hỏi tiếp.','Q03.TRACK'),row('width','bridge',[-2,1.4],'plank','Khoảng ngang để xe đi qua','Bậc hẹp không nhận đủ hai bánh. Lối vòng dài hơn vẫn có nền đứng cho người nhận xe.')],
    Q04:[row('lamp','people',[1.9,1.5],'lantern','Đèn của người đi cuối','Một đèn để trong kho chỉ làm sáng cửa. Người đi thấp ở cuối đoàn cần nhìn thấy một mốc ở cùng phía mình.','Đèn đi cùng nhóm cuối, phía nhận có người gọi đáp. Dòng cuối sổ ca không còn bị khép trước người.','Q04.NIGHTSHIFT'),row('peg','gatework',[-2,-1.8],'peg','Chốt cũ trên mép bàn',s=>s.workshop?.records?.['Q01.LOAD']?'Chốt nứt đã tháo ở Q01 còn trên vải. Titus dùng nó để chỉ chỗ tải đi qua trước khi tháo then.':'Titus đặt một chốt đã nứt làm mẫu để chỉ đường tải; chưa có ai nhận thử phần giữ cửa.')],
    Q05:[row('counts','record',[1.8,1.7],'ledger','Ba khoản có chỗ riêng','18 bao đã tới Galilê. Hai bao hỏng có ghi ở tuyến Amon. Khoản chưa giải trình không được trộn vào phần hỏng.','Các khoản nhận, hỏng và chưa giải trình nằm riêng. Khoảng chưa rõ vẫn là khoảng chưa rõ.','Q05.RECONCILE'),row('net','net',[-2.1,1.9],'net','Mép lưới có người đang vá','Mắt lưới cần được giữ phẳng trong khi người vá tiếp tục việc của mình; công việc không dừng để làm nền cho vụ hàng.')],
    Q06:[row('lineage','token',[1.8,1.7],'copies','Một gốc, những bản được chép','Dòng dẫn trên bản chép quay về E04. Thẻ sân phụ E06 có phạm vi riêng; dấu kho dùng chung chưa chỉ tên người ra lệnh.','Bản chép giữ dòng dẫn gốc. Số bản được giữ không bị đếm thành số lần tự chứng kiến.','Q06.LINEAGE'),row('staff','damar',[-2.2,1.7],'staff','Gậy được đặt khỏi lối rời','Damar đặt gậy ra khỏi mép bàn. Người đang nói còn một đường rời mà không phải đi qua tay người giữ đường.')],
    Q07:[row('seats','sela',[2,-1.5],'seats','Hai chỗ ngồi và một lối ra','Sela nhận một cuộc nói vừa sức; lời đã nhận không buộc một cuộc tha thứ ngay.','Chỗ có mặt và người nhận bữa theo đúng phương án đã thực hiện. Lối ra vẫn còn.','Q07.PROMISE'),row('scope','miriam',[-2,1.8],'letter','Mảnh hẹn chỉ một ca','Phần được nhận là một ca và một điểm gặp, không phải cả tuần ai đó đã hứa thay.')],
    Q08:[row('rope','anchor',[-2.0,1.5],'rope','Chỗ dây tì được bọc','Neo cần có người giữ và đầu kia cần có người nhận. Tới gần Amon chưa có nghĩa đã có đường đưa về.','Dấu gọi và hai đầu đã được kiểm trước khi chuyển người.','Q08.RESCUE'),row('wet','wrap',[-2,-1.6],'wetpaper','Phần bản phụ qua nước',s=>s.flags.paperIntegrity==='partial'?'Mép giấy còn khoảng không đọc được. Phần ấy để trống; không tự hong thành một chữ đoán.':'Vải bọc và phần giấy đọc được được đặt riêng. Người giữ hồ sơ chưa được đoán chữ bị nước xóa.')],
    Q09:[row('envelopes','keeper',[2,1.8],'envelopes','Bản giao và bìa giữ riêng','Một tên bị bỏ đi chưa làm địa chỉ hay mô tả nhận diện trở nên an toàn để đọc chung.','Bản tới nhóm và bìa nhận diện có nơi giữ riêng, theo phạm vi người cung cấp đã trao.','Q09.READBACK'),row('door','door',[-2,1.7],'door','Cánh cửa được phép khép','Người bên trong chưa nhận nói. Cánh cửa khép không được dùng như một dấu đáng ngờ.')],
    Q10:[row('letter','letter',[1.8,1.7],'letter','Lá thư còn chỗ sửa',s=>s.quests.Q10.done.includes('letter')?'Haddai tự nhận ký trước khi kiểm đủ. Nét sửa không tự xác minh mọi điều ông kể; cần đặt thư cạnh biên nhận và lượng nhận.':'Gói còn đường niêm và người giữ. Cần kiểm xuất xứ trước khi đọc lời tự nhận trong thư.','Phần bất lợi trong thư còn cạnh biên nhận và các khoản đã đối chiếu.','Q10.RESPONSIBILITY'),row('pair','compare',[-2.1,1.6],'copies','Hai nguồn ở hai phía bàn','Lea chừa khoảng giữa hai nguồn để người đọc không chép một điều chưa chắc từ nguồn này sang nguồn kia.')],
    Q11:[row('meal','supplies',[2,1.6],'meal','Bữa đã hẹn và kệ dự trữ',s=>'Hai phần đã có người chờ được giữ riêng. Kho dự trữ hiện có '+(s.flags.finalMealStock??s.resources.food)+' phần; đèn và bộ đồ sửa không làm tăng lượng ăn.','Một phần được giao khi thực có. Phần còn lại cho ca sau được ghi đúng lượng.','Q11.SUPPLIES'),row('shift','planning',[-2,1.5],'tools','Dụng cụ để mở được ca sau','Bộ đồ sửa ở lại với người nhận ca, không đi theo một bản phát hành chỉ vì cùng được gọi là chuẩn bị.')],
    Q12:[row('exit','public',[-2.1,1.8],'seats','Lối rời không đi qua Hanan','Người tự nguyện có thể rời sân. Người nghe không bị dồn phải đi qua người đang bị chất vấn.','Sau cuộc nói, lối rời và phần việc ca sau vẫn có người giữ.','Q12.RELEASE'),row('copies','copy1',[-2,1.5],'envelopes','Hai nơi nhận và phần chưa trao',s=>s.flags.finalPlan==='distributed'?'Hai người giữ bản có phần việc riêng, không ai nhận cả danh tính lẫn mọi bản đối chiếu.':s.flags.finalPlan==='relocate'?'Hồ sơ gửi sau việc đưa người tới nơi nhận. Phần chưa thể nói được ghi đúng như vậy.':'Chỉ phần đủ nguồn và đúng phạm vi được đặt vào bản đọc trước sân.')],
    L01:[row('cart','clear',[2,1.4],'cart','Xe ở cuối đoàn','Đàn vật cần lùi khỏi chỗ kê. Có người nhận vò nước trên nền cứng; việc giúp xe không điều khiển biển.','Xe có đường tải mới và người cuối vẫn có đốm sáng để nhìn.','L01.AXLE'),row('light','gather',[-2,1.6],'lantern','Đốm sáng ở tầm người đi thấp','Người đi thấp nhìn thấy mốc ở cùng phía đoàn; đèn không chỉ làm đẹp đỉnh một cọc cao.','Người dẫn và người nối tín hiệu đứng ở hai đầu theo cách đã phân.','L01.REARGUARD')],
    L02:[row('gravel','approach',[2,1.5],'tracks','Sỏi rời và vách bước êm','Mặt sỏi có tiếng dội; vách nhẵn có lối vòng. Bóng tối không thay được một mốc quay về.','Tuyến đã chọn giữ cả ngưỡng tiếng, ánh sáng và mốc đường lui.','L02.ACOUSTICS'),row('water','return-group',[-2,1.7],'rope','Nước đặt cạnh chỗ chờ','Người nóng nảy tự đồng ý lùi với người đi cùng; dây chỉ giữ mốc, không dùng trói người.','Người kèm, nước và người giữ dây đứng theo phần đã nhận.','L02.RESTRAINT')],
    L03:[row('cloth','cloth',[1.8,1.6],'padding','Vải cũ ở chỗ dây tì','Vải được đưa xuống trước và người dưới hố tự lót. Người phụ chờ một tiếng xác nhận trước khi mang tải.','Vải ở giữa người và dây trước khi chuyển tải; không là vật phẩm hồi máu.','L03.CLOTH'),row('rim','ready',[-2,1.3],'rope','Phần dây còn được giữ ở miệng hố','Người giữ dây có vị trí và người nhận. Việc phối hợp của người phụ nằm trong ranh giới sáng tác [H].')],
    L04:[row('net','net',[2,1.6],'net','Hai mép lưới và lối chân','Mép nổi, mép mang tải và dây mạn được nhìn riêng. Cấu tạo này là mô hình game, không được bản văn Ga 21 xác định.','Dây được cuộn khỏi lối chân; không có nhánh làm mẻ cá nguồn thất bại hoặc lưới nguồn rách.','L04.NET'),row('breakfast','land',[-2,1.6],'meal','Lối lên bãi sỏi và bữa sáng','Người nhận đứng trên bờ; người phụ lùi lại để khoảng bếp than được yên.','Hai mạn có người giữ, dây giữa và lối lên bờ có người nhận.','L04.LANDING')],
    L05:[row('light','remain',[1.8,1.5],'lantern','Ánh đèn nhìn vào trong','Cửa mở không là lời yêu cầu trốn. Tiếng đáp từ nhóm ở lại và ánh sáng cùng làm rõ sự hiện diện.','Nhóm còn hiện diện trong tầm đáp; không đặt một đồng hồ gây hại lên việc này.','L05.REMAIN'),row('threshold','call',[-1.9,1.6],'door','Một ngưỡng cửa còn tiếng người','Công việc người phụ diễn ra sau nhịp an toàn nguồn, không quyết định thay lời Phaolô.')],
    V01:[row('pages','place',[2,1.4],'pages','Trang còn hơi ấm','Các trang không tiết lộ tên ngoài đời. Bạn có thể giữ, để người kia tự nhận hoặc để chờ.','Bố cục được giữ theo cách bạn đặt, kể cả chưa đặt gì.','V01.PAGES')],
    V02:[row('balance','share',[2,1.4],'balance','Những khối bằng nhau','Bốn khối cùng tải, không có khối thần bí. Hai bệ có thể cùng nhận phần.','Chỉ mặt cầu trong giấc mơ cân bằng; không suy ra điểm đức tin hoặc phẩm chất người chơi.','V02.BALANCE')],
    V03:[row('strings','release',[2,1.3],'strings','Những sợi dây có thể nghỉ','Giữ một sợi trong tay không là một đáp án xấu. Ý nghĩa của bố cục được để mở.','Game giữ cách đặt, không kết luận bạn đã biết buông hay chưa.','V03.STRINGS')],
    V04:[row('chair','sit',[2,1.3],'memory','Bàn còn một chỗ trống','Chén, chỉ, đèn có thể đặt hoặc để nguyên. Không có giọng người đã khuất giải vụ hàng.','Khoảng dang dở vẫn được phép có mặt khi bạn trở về.','V04.TABLE')],
    B01:[row('meeting','bond-work',[1.7,1.6],'seats','Một chỗ nói còn lối ra','Miriam tự đứng nhận câu chuyện. Giúp bố trí không cho avatar quyền trả lời thay.','Miriam đã tự nói, bữa còn người nhận, còn phản ứng của Sela được để mở.','B01.WORK')],
    B02:[row('roof','bond-work',[1.8,1.4],'roof','Mái hiên và ranh giới cửa nhà','Khe giáp cần được sửa qua người gia đình chấp nhận. Không có cuộc gặp được đổi lấy bằng công sửa.','Phần giáp đã được người đại diện nhận, lối nhà vẫn đúng ranh giới.','B02.WORK')],
    B03:[row('limits','bond-work',[1.8,1.5],'private-record','Dòng trống có lý do','Ghi được nội dung không đồng nghĩa có quyền tự điền tên. Người đọc sau cần biết cả giới hạn.','Dòng trống còn lời giải thích phạm vi, không bị lấp bằng một danh tính đoán thêm.','B03.WORK')],
    B04:[row('joint','bond-work',[1.9,1.3],'joinery','Mối nối do người nhận tự làm','Người học cần một việc thật khi Titus đã nhận giao. Người giữ tải không giành luôn dụng cụ.','Chốt có lần thử tải và người thực hiện đúng với phương án Titus đã nhận.','B04.WORK')],
    B05:[row('memories','bond-work',[1.8,1.4],'memory','Mối ván và hai lát cắt ký ức','Chuyện nghề của Haddai được nhớ ở những hoàn cảnh riêng. Thương mến không thành chứng từ xóa trách nhiệm.','Những lát cắt nhỏ được giữ mà không đổi thành lời minh oan vụ hàng.','B05.WORK')],
    B06:[row('next','bond-work',[1.8,1.5],'meal','Bữa đang phục vụ và người nhận lượt sau','Bát này đã được dọn cho người cần nghỉ; nó không phải một đơn vị tùy ý lấy từ kho dự trữ.','Người nhận bữa và người nhận công việc đều có chỗ đứng cụ thể.','B06.WORK')]
  };
  const agendas={
    natan:{pose:'tend',line:'Chú đang thử một mối nối. Con có thể nhìn mặt gỗ trước khi cầm dụng cụ.'},rina:{pose:'tend',line:'Tôi đang giữ nồi cho lượt tiếp. Bạn đứng bên này để lối mang bát còn trống.'},mattai:{pose:'read',line:'Tôi đang đối lại người nhận ca. Phần tôi ghi là việc ở cửa này.'},amon:{pose:'tend',line:'Tôi còn kiểm dây của chuyến mình chở; đoạn sau cần hỏi người đã nhận.'},lea:{pose:'read',line:'Tôi để hai nguồn tách nhau để người đọc còn thấy chỗ chưa thể ghép.'},titus:{pose:'tend',line:'Tôi đang thử chỗ tựa của then; đừng đứng vào phía nó còn có thể trượt.'},miriam:{pose:'tend',line:'Tôi đã nhận một phần bữa, đang tìm người đứng nhận phần còn lại.'},damar:{pose:'idle',line:'Tôi để gậy khỏi lối ra. Người tới nói vẫn có thể chọn rời.'},sela:{pose:'idle',line:'Tôi chỉ nhận ca đã nói. Những ca còn lại hãy hỏi tôi lại.'}
  };
  function origin(s,a){if(s.layer)return a.at;return a.bond?[-16,-4]:chapter(s).nodes.find(n=>n.id===a.target)?.at||[-8,4];}
  function anchor(s,key){
    if(key==='bond-work')return [-16,-4];
    if(s.layer){const src=s.layer.kind==='legend'?D.legends[s.layer.id]:D.veils[s.layer.id],i=src.steps.findIndex(a=>a[0]===key);return i>=0?(root.WitnessModel?.layerAt(i,s)||src.steps[i].at||[-7,4]):[-7,4];}
    return chapter(s).nodes.find(n=>n.id===key)?.at||[-8,4];
  }
  function details(s){
    const recent=!s.layer&&s.craft?.lastWork?.chapter===s.chapter?s.craft.lastWork.bond:null,bond=!s.layer?(s.pendingBond?.id||recent):null;
    const list=[...(scenes[owner(s)]||[]).map(r=>({...r,sceneOwner:owner(s)})),...(bond?(scenes[bond]||[]).map(r=>({...r,sceneOwner:bond})):[])];
    return list.map(r=>{
      const base=anchor(s,r.anchor);let at=[Math.max(-34,Math.min(24,base[0]+r.offset[0])),Math.max(-26,Math.min(24,base[1]+r.offset[1]))];
      const stash=s.layer?.workshop||s.workshop,entry=r.encounter&&(stash?.records?.[r.encounter]||stash?.drafts?.[r.encounter]);
      if(r.kind==='lantern'&&entry?.payload?.assignments?.lamp){const def=X.all().find(d=>d.id===r.encounter),a=def&&binding(s,def);if(a){const f={a,def:X.materialize(s,def),payload:entry.payload,origin:origin(s,a)},st=spots(s,f).find(p=>p.op.value===entry.payload.assignments.lamp);if(st)at=[st.at[0]-.6,st.at[1]+.6];}}
      const done=!!(r.encounter&&records(s)[r.encounter]),id='craft:'+r.sceneOwner+'-'+r.key;
      return {...r,id,owner:r.sceneOwner,at,done,body:done&&r.after?r.after:typeof r.before==='function'?r.before(s):r.before,seen:(stores(s).looked||[]).includes(id)};
    });
  }
  function field(s){
    const f=stores(s).field;if(!f)return null;
    const a=root.WitnessModel?.actions(s).find(a=>a.id===f.action&&X.encounter(s,a)?.id===f.encounter),def=X.encounter(s,a);if(!a||!def)return null;
    const d=X.materialize(s,def),payload=root.WitnessModel.workshopState(s).drafts[def.id]?.payload||X.empty(d);
    return {a,def:d,payload,selected:f.selected||null,origin:origin(s,a)};
  }
  function fieldSpots(s){
    const f=field(s);if(!f)return [];
    return spots(s,f);
  }
  function spots(s,f){
    const d=f.def,p=f.payload,c=[Math.max(-25,Math.min(17,f.origin[0])),Math.max(-17,Math.min(18,f.origin[1]))],pts=[];
    const point=(key,label,at,op,detail)=>pts.push({id:'field:'+key,key,label,at,op,detail,encounter:d.id});
    if(d.type==='route'){
      const minX=Math.min(...d.nodes.map(n=>n.x)),maxX=Math.max(...d.nodes.map(n=>n.x)),minY=Math.min(...d.nodes.map(n=>n.y)),maxY=Math.max(...d.nodes.map(n=>n.y));
      for(const n of d.nodes){const at=[c[0]+(n.x-minX)/Math.max(1,maxX-minX)*8-4,c[1]+(n.y-minY)/Math.max(1,maxY-minY)*6-3];point(n.id,n.label,at,{kind:'route',value:n.id},n.detail);}
    }else{
      const list=d.type==='sequence'?d.steps:d.type==='ledger'?d.fields:d.type==='inference'?d.claims:d.stations;
      for(let i=0;i<list.length;i++){const x=list[i],theta=Math.PI*2*i/list.length-Math.PI/2,at=[c[0]+Math.cos(theta)*3.3,c[1]+Math.sin(theta)*3.0];
        point(x.id,x.label,at,{kind:d.type==='sequence'?'step':d.type==='ledger'?'number':d.type==='inference'?'claim':'station',value:x.id},x.detail||x.why||'');}
    }
    point('handoff-work','Bàn giao phần việc',f.origin,{kind:'handoff'},'Về điểm nhận, kiểm phương án rồi tự chọn thực hiện.');
    return pts;
  }
  function binding(s,def){
    if(def.owner.startsWith('B'))return {id:'bond-work',bond:def.owner,target:'bond-work',at:[-16,-4]};
    if(s.layer){const src=s.layer.kind==='legend'?D.legends[s.layer.id]:D.veils[s.layer.id],i=src.steps.findIndex(x=>def.actions.includes(x[0]));return i<0?null:{id:src.steps[i][0],target:'layer-'+i,at:root.WitnessModel.layerAt(i,s)};}
    const ch=chapter(s),q=s.quests[ch.id],list=[...(ch.execution[q.plan]||[]),...ch.tasks,...Object.values(ch.execution).flat()];return list.find(a=>def.actions.includes(a.id))||null;
  }
  function workScenes(s){
    const active=field(s),out=[];
    for(const def of X.all()){
      if(def.owner!==owner(s)&&!(s.pendingBond?.id===def.owner)&&!(!s.layer&&s.craft?.lastWork?.bond===def.owner&&s.craft.lastWork.chapter===s.chapter))continue;
      const a=binding(s,def);if(!a)continue;
      const stash=s.layer?s.layer.workshop:s.workshop,entry=stash?.records?.[def.id]||stash?.drafts?.[def.id];
      if(!entry&&active?.def.id!==def.id)continue;
      const f={a,def:X.materialize(s,def),payload:active?.def.id===def.id?active.payload:entry.payload,origin:origin(s,a),committed:!!stash?.records?.[def.id]};
      out.push({...f,spots:spots(s,f)});
    }
    return out;
  }
  function validPrefix(def,p){const done=[];for(const id of p.order||[]){const step=def.steps?.find(x=>x.id===id);if(!step||(step.needs||[]).some(x=>!done.includes(x)))break;if(!done.includes(id))done.push(id);}return done;}
  function reduceField(s,spot,options={}){
    const f=field(s),d=f?.def;if(!f)return {ok:false,message:'Phần việc này không còn ở cảnh hiện tại.'};
    const p=clone(f.payload),op=spot.op;
    if(op.kind==='step'){
      p.order||=[];const step=d.steps.find(x=>x.id===op.value),missing=(step.needs||[]).filter(x=>!p.order.includes(x));
      if(missing.length)return {ok:false,message:step.label+': cần '+missing.map(id=>d.steps.find(x=>x.id===id).label.toLowerCase()).join(', ')+' trước.'};
      if(!p.order.includes(op.value))p.order.push(op.value);
    }else if(op.kind==='route'){
      p.path||=[d.start];const last=p.path[p.path.length-1];
      if(op.value===last)return {ok:false,message:spot.detail};
      if(!d.edges.some(e=>e.from===last&&e.to===op.value)||p.path.includes(op.value))return {ok:false,message:'Hãy theo một đoạn nối từ mốc đang giữ, hoặc lùi một mốc để khảo sát lại.'};p.path.push(op.value);
    }else if(op.kind==='station'){
      if(!d.items.some(x=>x.id===f.selected))return {ok:false,message:'Chọn người hoặc vật đang cùng làm trước khi tới điểm nhận.'};p.assignments||={};p.assignments[f.selected]=op.value;
    }else if(op.kind==='number'){
      p.numbers||={};const n=Number(p.numbers[op.value]||0),delta=options.delta===-1?-1:options.delta===1?1:0;
      if(!delta)return {ok:false,message:'Kiểm dấu nguồn rồi tăng hoặc bớt một đơn vị trên khoản này.'};p.numbers[op.value]=String(Math.min(24,Math.max(0,n+delta)));
    }else if(op.kind==='claim'){
      p.claims||={};p.claims[op.value]||={status:'',cards:[]};
      if(options.status){if(!['supported','open'].includes(options.status))return {ok:false,message:'Mức kết luận không hợp lệ.'};p.claims[op.value].status=options.status;}
      else{if(!d.cards.some(x=>x.id===f.selected))return {ok:false,message:'Chọn dấu hoặc nguồn đang đối chiếu trước.'};const cards=p.claims[op.value].cards;p.claims[op.value].cards=cards.includes(f.selected)?cards.filter(x=>x!==f.selected):[...cards,f.selected].slice(-2);}
    }else return {ok:false,message:'Chọn bàn giao để thực hiện phần việc đã kiểm.'};
    return {ok:true,payload:X.normalize(d,p),message:spot.label+'. '+(op.kind==='step'?'Phần chuẩn bị đã có, thao tác được giữ.':op.kind==='route'?spot.detail:'Bạn có thể nhìn lại cách đã đặt trước khi bàn giao.')};
  }
  function response(s,def,valid){
    const owner=def.owner;
    const lines={Q01:['Chú chưa bảo con bỏ cái chốt. Chú hỏi lúc bỏ nó thì phần nặng sẽ tựa vào đâu.','Ừ, bây giờ tháo được. Con giữ cái nứt này lại, lát nữa còn chỉ cho người tới ca sau.'],Q02:['Ta có thể giữ câu hỏi ấy. Đừng đặt nó vào miệng người chỉ nhìn thấy một trang giấy.','Dấu sửa được giữ, còn tên người sửa vẫn là câu hỏi.'],Q03:['Tôi chỉ nhận đoạn đường mình đã thấy. Đầu kia còn người nhận xe.','Giờ bạn có một tuyến để hỏi tiếp, không phải một cái tên để buộc tội.'],Q04:['Tôi khép cửa được. Tôi chưa khép dòng cuối được.','Đã có người gọi đáp và người đứng nhận ca cuối.'],Q05:['Tôi giữ con số mình đã đếm; đoạn hỏng có người khác ghi riêng.','Từng khoản còn đúng chỗ, việc ở mép lưới của tôi còn làm tiếp được.'],Q06:['Chép cho khỏi mất là một việc. Có thêm người tự thấy là một việc khác.','Bản này còn đường dẫn gốc cho người sau kiểm lại.'],Q07:['Một ca thôi. Phần người nào đã nhận, hãy để đúng người ấy có mặt.','Cuộc nói có người đứng nhận; Sela vẫn có thể cần thêm thời gian.'],Q08:['Hãy để người giữ dây và người nhận gọi đáp với nhau trước.','Người đã tới nơi nhận. Phần giấy không đọc được cứ để trống.'],Q09:['Tên đã bỏ mà địa chỉ còn thì người ấy vẫn có thể bị tìm lại.','Bản này chỉ tới đúng nơi người cung cấp đã trao quyền.'],Q10:['Giữ cùng một thước đo cho cha mình là phần khó. Tôi sẽ ngồi đây đối chiếu cùng bạn.','Phần cha bạn tự nhận vẫn ở đây. Nó không nói thay phần chưa được kiểm.'],Q11:['Hai phần kia có người đang chờ. Bạn chia dự trữ, đừng lấy nhầm phần ấy.','Cuộc nói sẽ kết thúc. Ca bếp thì sang người khác; phần để lại đã được ghi rõ.'],Q12:['Con cứ đọc điều mình đã kiểm, trong phần người khác đã trao.','Giờ còn người nhận ca sau; mình để bàn cho họ làm tiếp.']};
    return lines[owner]?.[valid?1:0]|| (valid?def.outcome:def.voice?.[1]||'Còn một phần chuẩn bị cần được giữ trước.');
  }
  function augment(s,plan){
    const objects=plan.objects.map(o=>({...o})),targets=plan.targets.map(t=>({...t}));
    for(const detail of details(s)){
      const replaced=objects.find(o=>o.id===detail.anchor&&o.kind==='prop');
      if(replaced&&['cart','paper','wetpaper','letter','copies','ledger','net','peg'].includes(detail.kind)){replaced.kind='craft-anchor';replaced.variant=undefined;}
      objects.push({id:detail.id,at:detail.at,kind:'craft-anchor',fixed:true,solids:[...(['tracks','plank','pages','strings'].includes(detail.kind)?[]:[[...detail.at,.55]])]});
      targets.push({id:detail.id,actor:detail.id,at:detail.at,name:detail.title,range:2.8,elevation:1.1,symbol:'·',main:false,unread:!detail.seen,craft:true});
    }
    if(!s.layer){
      for(const object of objects){const pid=object.appearance?.replace(/^wt-/,''),job=agendas[pid];if(!job||object.id===s.pendingEscort?.target)continue;
        if(!object.pose||object.pose==='idle')object.pose=job.pose;
        if(object.work&&!object.route){object.fixed=false;object.route=[object.at,[object.at[0]+.6,object.at[1]+.8],object.at];}
      }
    }
    if(!s.layer){
      const bondId=s.pendingBond?.id||(s.craft?.lastWork?.chapter===s.chapter?s.craft.lastWork.bond:null),b=D.bonds.find(b=>b.id===bondId);
      if(b){
        const partner=objects.find(o=>o.appearance==='wt-'+b.person),at=b.id==='B04'?[-15.65,-2.7]:[-18,-3];
        if(partner){partner.fixed=false;partner.route=[at];partner.routeStop=true;partner.work=false;partner.pose='tend';}
        else{const id='companion-'+b.person;objects.push({id,at,kind:'npc',variant:D.people[b.person].model,appearance:'wt-'+b.person,fixed:true,pose:'tend'});targets.push({id,actor:id,at,name:D.people[b.person].name+' · Cùng làm',range:2.9,person:b.person,symbol:'·'});}
        if(b.id==='B04'&&(s.pendingBond?.choice||s.bonds.B04)==='share_real_task')objects.push({id:'craft-apprentice',at:[-12.7,-2.7],kind:'npc',variant:'man',appearance:'craft-apprentice',fixed:true,pose:'tend'});
      }
    }
    const f=field(s);
    if(f){
      for(const t of targets)t.main=false;
      const spots=fieldSpots(s),d=f.def,p=f.payload;
      let next=spots.find(x=>x.op.kind==='handoff'&&X.evaluate(s,d,p).ok);
      if(!next)next=spots.find(x=>x.op.kind==='step'&&!(p.order||[]).includes(x.op.value)&&(d.steps.find(y=>y.id===x.op.value)?.needs||[]).every(id=>(p.order||[]).includes(id)))||spots.find(x=>x.op.kind==='route'&&d.edges.some(e=>e.from===(p.path||[d.start]).at(-1)&&e.to===x.op.value)&&!(p.path||[]).includes(x.op.value))||spots[0];
      for(const pt of spots)targets.push({id:pt.id,at:pt.at,name:pt.label,range:2.8,elevation:.8,main:pt.id===next?.id,symbol:pt.id===next?.id?'◆':'·',field:true});
    }
    for(const work of workScenes(s)){
      if(!['allocation','arrangement','dispatch'].includes(work.def.type))continue;
      for(const [i,item]of work.def.items.entries()){
        const person=D.people[item.id],anonymous=/^(helper\d*|receiver|guide|friend|family|group|restless|tired|courier)$/.test(item.id);
        if(item.id==='player'||(!person&&!anonymous))continue;
        const st=work.spots.find(x=>x.op.value===work.payload.assignments?.[item.id]),at=st?[st.at[0]+(i%2?-.55:.55),st.at[1]+.6]:[work.origin[0]-3+(i%3)*1.1,work.origin[1]+2.5+Math.floor(i/3)*1.1];
        const actual=person?objects.find(o=>o.appearance==='wt-'+item.id):null;
        if(actual){actual.fixed=false;actual.route=st?[at]:undefined;actual.routeStop=true;actual.work=false;actual.pose=st?'idle':'talk';}
        else{const spawn=[work.origin[0]-3+(i%3)*1.1,work.origin[1]+2.5+Math.floor(i/3)*1.1];objects.push({id:'craft-helper-'+work.def.id+'-'+item.id,at:spawn,kind:'npc',variant:person?.model||'man',appearance:person?'wt-'+item.id:s.layer?.kind==='legend'?'craft-helper-'+s.layer.id:'traveler',fixed:false,route:st?[at]:undefined,routeStop:true,pose:'idle'});}
      }
    }
    return {objects,targets};
  }
  function allDetailIds(){return Object.entries(scenes).flatMap(([id,list])=>list.map(x=>'craft:'+id+'-'+x.key));}
  const api={scenes,agendas,owner,stores,records,details,field,fieldSpots,spots,binding,workScenes,validPrefix,origin,reduceField,response,augment,allDetailIds};
  root.WitnessCraft=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
