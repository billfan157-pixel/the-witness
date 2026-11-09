(function(root){
  'use strict';
  const D=root.WitnessContent||(typeof require!=='undefined'?require('./witness-spine.js'):null);
  const row=(id,label,detail,extra={})=>({id,label,detail,...extra});
  const common=(id,type,title,brief,more)=>({id:id+'.WORK',owner:id,actions:['bond-work'],revision:1,type,title,brief,label:'[H] Việc riêng của nhân vật hư cấu',sources:[],rules:[],hints:[],...more});
  const catalog=[
    common('B01','allocation','Một cuộc nói do Miriam đứng nhận','Miriam nhận phần nói thật với Sela. Bạn chỉ bố trí người và phần bữa để cuộc nói có thể xảy ra; không nói thay chị hoặc buộc Sela tha thứ.',{
      items:[row('miriam','Miriam','Tự nói điều mình đã làm.',{tags:['speaker'],allowed:['talk']}),row('sela','Sela','Đã nhận một cuộc nói, vẫn có quyền cần thời gian.',{tags:['recipient'],allowed:['talk']}),row('player','Bạn','Nhận phần phụ bữa để không ai nói thay Miriam.',{tags:['helper'],allowed:['meal']}),row('rina','Rina','Giữ bếp và xác nhận có người nhận ca.',{tags:['cook'],allowed:['meal']})],
      stations:[row('talk','Chỗ nói có lối ra','Miriam và Sela, không có người trả lời thay.',{min:2,max:2,tags:['speaker','recipient']}),row('meal','Bữa đang có người chờ','Rina và bạn tiếp tục phần bữa.',{min:2,max:2,tags:['helper','cook']})],example:{assignments:{miriam:'talk',sela:'talk',player:'meal',rina:'meal'}},
      rules:['Miriam tự đứng nhận lời đã nói sai.','Giúp bố trí không làm Sela mất quyền chọn phản ứng.'],hints:['Ai có việc cần tự nói thì phải có mặt ở chỗ nói.','Giữ Miriam–Sela ở cuộc nói; bạn nhận bữa cùng Rina.'],outcome:'Miriam tự nói, còn phần bữa có người đứng nhận. Sela chưa bị ghi là đã tha thứ.'
    }),
    common('B02','sequence','Mái hiên được sửa trong phạm vi đã nhận','Gia đình chỉ nhận việc sửa mái qua người họ tin, chưa nhận cuộc gặp. Chuẩn bị, giữ kết cấu và bàn giao đúng phạm vi.',{
      steps:[row('scope','Nhận phạm vi từ người đại diện','Không tự bước qua cửa nhà.'),row('materials','Giao vật liệu cho người được nhận','Vật liệu tới đúng người làm.',{needs:['scope']}),row('support','Giữ phần mái đang chịu tải','Chuẩn bị trước khi thay phần cũ.',{needs:['scope']}),row('repair','Sửa kín phần được nhận','Chỉ sau vật liệu và phần giữ tải.',{needs:['materials','support']}),row('test','Cùng người đại diện thử chỗ giáp','Người nhận kiểm phần việc, không phải hứa tha thứ.',{needs:['repair']}),row('leave','Bàn giao rồi rời lối nhà','Không lấy việc đã sửa để đòi một cuộc gặp.',{needs:['test']})],
      example:{order:['scope','materials','support','repair','test','leave']},rules:['Có thể giao vật liệu và chuẩn bị giữ mái theo hai thứ tự.','Bàn giao công việc không đổi thành quyền gặp gia đình.'],hints:['Ranh giới nơi nhận cần rõ trước cả công việc vật chất.','Phạm vi → vật liệu và giữ mái → sửa → thử cùng người nhận → rời đi.'],outcome:'Phần mái được người đại diện nhận. Lối vào nhà còn đúng ranh giới gia đình đã chọn.'
    }),
    common('B03','inference','Dòng trống và đường dẫn còn nguyên','Lea muốn sửa cách ghi hồ sơ mà vẫn giữ quyền không đứng tên. Ghép điều đã biết với đúng dấu, để điều chưa được trao còn mở.',{
      cards:[row('source','Ghi nhận gốc','Nội dung đã được ghi nhưng người trao chưa cho dùng tên.',{lineage:'private-source'}),row('blank','Khoảng đã bị xóa','Không còn đường dẫn để người kiểm sau biết giới hạn.',{lineage:'draft'}),row('limit','Mảnh ghi phạm vi','Chỉ được dùng nội dung không nhận diện trong nhóm đối chiếu.',{lineage:'permission'})],
      claims:[{id:'content',label:'Có thể giữ nội dung không nhận diện trong nhóm.',status:'supported',sets:[['source','limit']],why:'Cần cả nội dung và phạm vi được trao.'},{id:'identity',label:'Việc giữ nội dung cho phép tự điền lại tên.',status:'open',sets:[[]],why:'Người ấy chưa trao quyền dùng tên.'},{id:'limit',label:'Khoảng trống cần có ghi chú giới hạn cho người kiểm sau.',status:'supported',sets:[['blank','limit']],why:'Ghi giới hạn giữ được đường đối chiếu mà không đoán thêm danh tính.'}],
      example:{claims:{content:{status:'supported',cards:['source','limit']},identity:{status:'open',cards:[]},limit:{status:'supported',cards:['blank','limit']}}},rules:['Khoảng trống có thể đúng; cần giữ lý do và phạm vi.','Không thêm một nguồn vào chứng cứ G17 từ việc riêng này.'],hints:['Nội dung, danh tính và quyền truyền đạt là ba việc khác nhau.','Nguồn + phạm vi hỗ trợ nội dung; tên vẫn mở; khoảng xóa + phạm vi hỗ trợ ghi giới hạn.'],outcome:'Lea giữ được nội dung có giới hạn và lý do dòng trống, không tự điền một danh tính.'
    }),
    common('B04','sequence','Một con chốt thật cho người học việc','Titus cùng người học việc chuẩn bị và thử một mối nối. Avatar giữ phần được nhờ, không giành thao tác của người đang học.',{
      steps:[row('scope','Chốt phần việc và người thực hiện','Nói rõ ai đóng, ai giữ, ai kiểm.'),row('brace','Đặt phần kê trước','Tạo đường tải thay.',{needs:['scope']}),row('tool','Trao dụng cụ cho người thực hiện','Người đã nhận việc tự giữ dụng cụ.',{needs:['scope']}),row('fit','Người nhận tự lắp chốt','Không làm hộ chỉ vì chờ lâu.',{needs:['brace','tool']}),row('test','Titus cùng người ấy thử tải','Thử phần đã làm trước khi bàn giao.',{needs:['fit']}),row('handoff','Bàn giao và nói giới hạn ca','Không nhận thêm mọi ca sau chỉ vì một mối nối đã đạt.',{needs:['test']})],
      example:{order:['scope','tool','brace','fit','test','handoff']},rules:['Đặt kê và trao dụng cụ có thể chuẩn bị song song.','Giữ rõ người thực hiện, không biến học nghề thành xem avatar làm hộ.'],hints:['Giữ tải và trao quyền làm là hai chuẩn bị khác nhau.','Chốt vai → kê và trao dụng cụ → tự lắp → cùng thử → bàn giao.'],outcome:'Mối nối được người nhận tự làm và cùng thử. Giới hạn ca sau được nói rõ.'
    }),
    common('B05','inference','Nhớ cha trong hai lát cắt','Giữ các ký ức nghề nghiệp như ký ức có người kể, không biến thương mến thành bằng chứng xóa trách nhiệm trong vụ hàng.',{
      cards:[row('first','Người thợ buổi đầu','Nhớ Haddai đã đóng lại một mối chốt vì lần thử đầu chưa đạt.',{lineage:'worker-early'}),row('later','Người thợ ca sau','Nhớ lần Haddai ở lại bàn giao dụng cụ.',{lineage:'worker-late'}),row('case','Hồ sơ vụ hàng','Việc ký nhận và lượng hàng cần đúng chứng từ riêng.',{lineage:'case-boundary'})],
      claims:[{id:'first',label:'Có một ký ức về việc Haddai từng chịu sửa tay nghề.',status:'supported',sets:[['first']],why:'Người thợ chỉ kể lần mình đã thấy.'},{id:'later',label:'Một người khác nhớ một lần bàn giao ca.',status:'supported',sets:[['later']],why:'Hai ký ức giữ hai hoàn cảnh riêng.'},{id:'innocent',label:'Hai ký ức nghề nghiệp đủ xóa lỗi ký trước của Haddai.',status:'open',sets:[[]],why:'Ký ức con người không thay chứng từ và trách nhiệm ở vụ hàng.'}],
      example:{claims:{first:{status:'supported',cards:['first']},later:{status:'supported',cards:['later']},innocent:{status:'open',cards:[]}}},rules:['Ghi ai kể điều gì và phạm vi của lát cắt ấy.','Không dùng việc riêng để tạo chứng cứ hoặc minh oan trong điều tra.'],hints:['Bạn đang giữ một con người nhiều lát cắt, không lập chứng từ mới.','Mỗi ký ức ghép đúng người kể; nhận định minh oan vẫn để mở.'],outcome:'Hai lát cắt nghề nghiệp được giữ riêng khỏi vụ hàng. Cha còn được nhớ bằng những việc đời thường.'
    }),
    common('B06','allocation','Bữa này và lượt sau có người nhận','Phân người và vật cho bữa đang phục vụ. Người kiệt sức cần chỗ nghỉ; việc giữ bếp và ghi lượt sau vẫn cần người đứng nhận.',{
      items:[row('tired','Người vừa về ca','Tự nhận chỗ nghỉ ăn trước.',{tags:['guest'],allowed:['rest']}),row('bowl','Phần bữa đã dọn','Đã nằm trong bữa phục vụ, không lấy từ kho dự trữ.',{tags:['meal'],allowed:['rest'],weight:0}),row('rina','Rina','Giữ bếp hoặc bàn giao lượt.',{tags:['keeper'],allowed:['kitchen','next']}),row('player','Bạn','Nhận một trong hai phần còn lại.',{tags:['keeper'],allowed:['kitchen','next']}),row('pot','Nồi đang giữ nóng','Ở bếp để lượt sau còn bữa.',{tags:['cook'],allowed:['kitchen'],weight:0}),row('record','Sổ lượt sau','Có người nhận hỏi lại và kiểm quy tắc tạm.',{tags:['record'],allowed:['next'],weight:0})],
      stations:[row('rest','Chỗ nghỉ','Người vừa về ca và phần đã dọn.',{min:2,max:2,tags:['guest','meal']}),row('kitchen','Bếp','Nồi và một người giữ.',{min:2,max:2,tags:['keeper','cook']}),row('next','Bàn lượt sau','Sổ và một người đứng nhận.',{min:2,max:2,tags:['keeper','record']})],
      example:{assignments:{tired:'rest',bowl:'rest',rina:'kitchen',player:'next',pot:'kitchen',record:'next'}},rules:['Không xếp giá trị con người thành thứ hạng.','Rina và bạn có thể đổi vai khi cả bếp và lượt sau đều có người nhận.'],hints:['Người nhận bữa khác người nhận công việc.','Giữ người mệt với bát; chia Rina và bạn cho nồi bếp và sổ lượt sau.'],outcome:'Bữa đã có người nhận, bếp và lượt sau không còn chỉ là lời hẹn.'
    })
  ];
  function resolve(s,a){return a?.bond?catalog.find(d=>d.owner===a.bond)||null:null;}
  function materialize(s,def){
    def=catalog.find(d=>d.id===def.id)||def;
    const d={...def,voice:[D.people[D.bonds.find(b=>b.id===def.owner).person].name,voice(s,def.owner)]};
    const choice=s.pendingBond?.id===def.owner?s.pendingBond.choice:s.bonds[def.owner];
    if(def.owner==='B01'&&choice==='trace_object_first'){
      d.brief='Người đang giữ món đồ có quyền tiếp tục sở hữu nó. Giữ một người nhận việc hỏi đường món đồ, rồi để Miriam tự nói với Sela; không hứa đòi lại miễn phí.';
      d.items=[...def.items,row('courier','Người nhận hỏi đường món đồ','Đã nhận hỏi đúng phạm vi, không đòi trả miễn phí.',{tags:['courier'],allowed:['object']})];d.stations=[...def.stations,row('object','Chỗ hỏi người giữ vật','Một người hỏi xuất xứ, không cưỡng lấy.',{min:1,max:1,tags:['courier']})];d.example={assignments:{...def.example.assignments,courier:'object'}};
    }
    if(def.owner==='B02'&&choice==='supply_trusted_worker')d.steps=def.steps.map(x=>x.id==='repair'?{...x,label:'Người thợ được tin sửa phần đã nhận',detail:'Damar góp vật và công qua người được gia đình chấp nhận.',needs:['materials','support']}:x);
    if(def.owner==='B04'&&choice==='work_alone_with_limits'){
      d.brief='Titus chưa nhận kèm người học, cũng nói rõ mình không thể nhận mọi ca. Bạn giúp kê và giữ, còn Titus tự làm phần đã nhận.';
      d.steps=def.steps.map(x=>x.id==='fit'?{...x,label:'Titus tự lắp phần chốt đã nhận',detail:'Người học không bị ghi là đã được giao việc.'}:x.id==='tool'?{...x,label:'Để dụng cụ trong tay Titus',detail:'Giữ đúng người đã nhận thực hiện.'}:x);
    }
    if(def.owner==='B05'&&choice==='repair_and_listen'){
      d.brief='Cùng giữ mối ván đã kê để Natan kể hai lát cắt nghề nghiệp. Hai ký ức đến từ cùng một người kể; không gọi đó là hai nguồn độc lập.';
      d.cards=def.cards.map(x=>x.id==='first'?{...x,label:'Natan nhớ lần đầu',lineage:'natan-memory'}:x.id==='later'?{...x,label:'Natan nhớ lần ca sau',lineage:'natan-memory'}:x);
      d.claims=def.claims.map(x=>x.id==='later'?{...x,label:'Natan còn nhớ một lần bàn giao ca khác.',why:'Hai thời điểm của cùng người kể không thành hai nguồn độc lập.'}:x);
    }
    if(def.owner==='B06'&&choice==='temporary_rule_and_review')d.brief='Quy tắc đang dùng là tạm. Phân người giữ bếp và người nhận lượt kiểm lại để điều chưa biết không bị che bằng một lời hứa hoàn hảo.';
    return d;
  }
  function voice(s,id){
    const b=D.bonds.find(b=>b.id===id),done=!!s.bonds[id];
    return done?b.callback:{B01:'Tôi muốn tự nói với Sela. Bạn giúp tôi đừng bỏ phần bữa cho một người khác phải gánh.',B02:'Họ chỉ nhận mái được sửa. Tôi sẽ không lấy phần công ấy để xin một cuộc gặp họ chưa muốn.',B03:'Tôi đã xóa tên quá vội. Tôi muốn giữ được cả lý do dòng trống và đường người sau có thể kiểm.',B04:'Một việc thật cần một người thật đứng nhận. Tôi phải nói rõ hôm nay mình đã sẵn sàng giao đến đâu.',B05:'Con cứ giữ chuyện nhỏ này, không cần bắt nó trả lời hộ chuyện sổ hàng.',B06:'Có người đang cần ngồi xuống ăn. Có người còn phải mở được bếp ca sau.'}[id];
  }
  function topic(s,person){const b=D.bonds.find(b=>b.person===person&&s.bonds[b.id]);return b?{id:'after-'+b.id,label:'Nhắc lại phần việc đã cùng làm',line:voice(s,b.id),minChapter:b.from}:null;}
  const api={catalog,resolve,materialize,topic};root.WitnessRelationships=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
