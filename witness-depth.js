(function(root){
  'use strict';
  const D=root.WitnessContent||(typeof require!=='undefined'?require('./witness-spine.js'):null);
  const copy=x=>JSON.parse(JSON.stringify(x));
  const catalog=[];
  const add=(id,owner,actions,type,title,brief,data)=>{
    const entry={id,owner,actions,type,title,brief,revision:1,label:'[H] Tình huống và luật chơi do game sáng tác',...data};
    catalog.push(entry);return entry;
  };
  const item=(id,label,detail,extra={})=>({id,label,detail,...extra});
  const station=(id,label,detail,extra={})=>({id,label,detail,...extra});
  const seq=(id,owner,actions,title,brief,steps,example,extra={})=>add(id,owner,actions,'sequence',title,brief,{steps,example:{order:example},...extra});
  const assign=(id,owner,actions,title,brief,items,stations,example,extra={})=>add(id,owner,actions,'allocation',title,brief,{items,stations,example:{assignments:example},...extra});
  const route=(id,owner,actions,title,brief,nodes,edges,example,extra={})=>add(id,owner,actions,'route',title,brief,{nodes,edges,start:nodes[0].id,end:nodes[nodes.length-1].id,example:{path:example},...extra});
  const n=(id,label,x,y,detail,extra={})=>({id,label,x,y,detail,...extra});
  const e=(from,to,noise=0,light=0,detail='')=>({from,to,noise,light,detail});

  seq('Q01.LOAD','Q01',['brace'],'Gánh nào đang giữ gánh nào?',
    'Natan muốn thay chốt xe. Cần tạo một đường chịu lực mới trước khi tháo chốt cũ; dây chằng và phần hàng phía trên đều có vai trò riêng.',[
      item('block','Chèn bánh xe','Bánh không còn trôi khi chuyển tải.'),
      item('unload','Hạ hai vò trên cùng','Hạ trọng tâm, cần bánh đã được chèn.',{needs:['block']}),
      item('brace','Đặt đòn kê dưới trục','Đòn kê nhận tải sau khi đã hạ hai vò.',{needs:['unload']}),
      item('lash','Giữ dây chằng sang cọc','Dây ngăn xe nghiêng; có thể làm trước hoặc sau khi kê.',{needs:['block']}),
      item('test','Thử tải bằng một nhịp ngắn','Chỉ thử khi cả đòn kê và dây chằng đã sẵn sàng.',{needs:['brace','lash']}),
      item('remove','Tháo chốt cũ','Chỉ tháo sau khi đường chịu lực mới đã qua thử.',{needs:['test']})
    ],['block','unload','brace','lash','test','remove'],{
      observations:[['Vết xước dưới bánh','Bánh còn có thể trôi theo dốc.'],['Vò nước ở tầng trên','Hai vò làm xe nghiêng về bên chưa có người đỡ.'],['Chốt đã nứt','Chốt vẫn đang chịu tải, chưa được rút.']],
      rules:['Thực hiện đủ sáu thao tác; quan hệ chịu tải quyết định thứ tự.','Kê trục và chằng dây có thể đổi thứ tự sau khi đã đáp ứng điều kiện.'],
      hints:['Theo đường tải từ vò nước xuống trục và bánh.','Chèn bánh trước; thử tải sau cả kê và chằng.'],
      outcome:'Chốt cũ nằm trên bàn; xe còn đứng nhờ đường chịu lực bạn đã kiểm.',callback:'Q04: Titus nhận ra cách bạn thử tải trước khi tháo chốt, rồi nhờ bạn kiểm cửa kho theo cùng nguyên tắc.',sources:['S26']
    });

  add('Q02.PALIMPSEST','Q02',['patch'],'inference','Một trang sửa nói được đến đâu?',
    'Đặt các dấu quan sát cạnh nhận định. Một trang ghi B06 bị sửa chưa tự nói điều gì về lô G17.',{
      cards:[item('fiber','Thớ giấy bị bóc','Mé sợi dựng dưới lớp dán.',{lineage:'B06'}),item('ink','Nét mực chồng','Nét mới đè phần ghi lượng cũ.',{lineage:'B06'}),item('copy','Bản chép cùng trang','Sao lại chữ trên B06, không có người chép chứng kiến lúc sửa.',{lineage:'B06'}),item('cloth','Vải bọc phổ biến','Nhiều người ở bến dùng cùng loại vải.',{lineage:'cloth'})],
      claims:[{id:'altered',label:'B06 có dấu can thiệp sau khi ghi.',status:'supported',sets:[['fiber','ink']],why:'Hai dấu vật lý trên trang cùng củng cố việc trang bị sửa; không xác định người sửa.'},{id:'author',label:'Hanan là người trực tiếp sửa trang.',status:'open',sets:[[]],why:'Chưa có dấu quan sát nào gắn bàn tay một người với lần sửa.'},{id:'lot',label:'Chỗ sửa này giải trình đủ hàng G17.',status:'open',sets:[[]],why:'B06 và G17 là hai lượt khác nhau. Không ghép mã chỉ vì cùng nằm trong kho.'}],
      example:{claims:{altered:{status:'supported',cards:['fiber','ink']},author:{status:'open',cards:[]},lot:{status:'open',cards:[]}}},
      rules:['Mỗi nhận định nhận tối đa hai dấu.','“Chưa đủ căn cứ” cũng là một kết luận có giá trị; bản chép không thành nguồn độc lập.'],hints:['Xem mã lượt trước khi đọc chữ sửa.','Chỉ nhận định về dấu sửa có đủ hai dấu vật lý; hai nhận định còn lại vẫn mở.'],outcome:'Bạn lưu dấu can thiệp trên B06 và giữ hai câu hỏi còn mở.',callback:'Q06: bản sao chỉ giữ nội dung một nguồn; không nhân đôi số người đã thấy sự việc.',sources:['S23','S26']
    });

  route('Q03.TRACK','Q03',['trace'],'Đường xe trước cổng kho',
    'Tìm đường xe có thể qua, ghé nơi đổi dây và chỗ nhận hàng. Vệt bánh chỉ cho phép dựng tuyến, chưa chỉ tên người chuyển.',[
      n('yard','Sân xuất',60,130,'Vệt hai bánh bắt đầu tại mép sân.'),n('steps','Bậc hẹp',200,45,'Bậc cao, không đủ bề ngang cho xe hai bánh.',{blocked:true}),
      n('well','Giếng',205,135,'Nút dây mới nằm cạnh chỗ dừng lấy nước.'),n('wall','Ven tường',210,235,'Nền cứng, lối vòng đủ cho xe.'),
      n('tie','Chỗ đổi dây',360,135,'Sợi dây cũ có dấu tì cùng hướng với vệt bánh.'),n('porch','Hiên nhận',500,135,'Có dấu đặt bao; lượng nhận phải hỏi riêng.')
    ],[e('yard','steps'),e('steps','porch'),e('yard','well'),e('yard','wall'),e('well','tie'),e('wall','tie'),e('tie','porch')],['yard','well','tie','porch'],{
      required:['tie'],rules:['Tuyến phải liền mạch từ sân xuất đến hiên nhận.','Xe không đi qua bậc hẹp; cần kiểm điểm đổi dây.'],hints:['Lối ngắn trên bản đồ có thể không dành cho xe.','Cả giếng và ven tường đều tới được chỗ đổi dây.'],outcome:'Tuyến vận chuyển có thể kiểm tiếp đã được dựng, chưa có tên thủ phạm.',callback:'Q05: hỏi người ở hiên về lượng thực nhận thay vì suy tên từ nút dây.',sources:['S26']
    });

  assign('Q04.NIGHTSHIFT','Q04',['people'],'Ca cuối trước cửa kho',
    'Mỗi người chỉ nhận một vị trí. Người đi cuối cần đèn và người nhận; cửa kho cần cả tay nghề lẫn người giữ tải.',[
      item('titus','Titus','Biết kiểm then; nhận việc ở cửa hoặc hỗ trợ đoàn.',{tags:['craft'],allowed:['gate','tail']}),
      item('miriam','Miriam','Biết các hộ đi cuối, có thể gọi đáp hoặc nhận người.',{tags:['care'],allowed:['tail','receive']}),
      item('mattai','Mattai','Giữ sổ ca, có thể kiểm cửa hoặc gọi đáp.',{tags:['record'],allowed:['gate','tail']}),
      item('rina','Rina','Có bữa đang chờ, chỉ nhận ở đầu bàn giao.',{tags:['care'],allowed:['receive']}),
      item('player','Bạn','Có thể giữ tải cửa hoặc đi cùng khóa đuôi.',{tags:['support'],allowed:['gate','tail']}),
      item('lamp','Đèn chắn gió','Phải theo nhóm cuối, không được để trong kho.',{tags:['light'],allowed:['tail'],weight:0})
    ],[station('gate','Cửa kho','Hai người: một kiểm then, một giữ tải.',{min:2,max:2,tags:['craft','support']}),station('tail','Nhóm cuối','Có người gọi đáp và đèn.',{min:2,max:3,tags:['care','light']}),station('receive','Điểm nhận','Rina giữ bữa, có thể có thêm người.',{min:1,max:2,tags:['care']})],{titus:'gate',miriam:'tail',mattai:'tail',rina:'receive',player:'gate',lamp:'tail'}, {
      rules:['Không giao hai vị trí cùng lúc cho một người.','Cửa có hai người với hai vai; nhóm cuối không bị mất đèn.'],hints:['Titus và bạn đủ hai vai ở cửa.','Miriam và đèn đi cuối; Rina chờ ở điểm nhận; Mattai có thể theo nhóm cuối.'],outcome:'Ca cuối có người gọi đáp, giữ cửa và nhận bàn giao; không ai chỉ tồn tại như một con số.',callback:'Q11: lần phân vai cuối giữ lại nguyên tắc mỗi người nhận một việc vừa sức.',sources:['S26','S29']
    });

  add('Q05.RECONCILE','Q05',['audit','check'],'ledger','Bốn bao nằm ở dòng nào?',
    'Ghép ba ghi nhận của G17 vào sổ đối chiếu. Đừng gộp lượng xuất, lượng nhận và lượng hỏng thành một khoản thiếu duy nhất.',{
      observations:[['Sổ xuất Xêdarê','G17 xuất 24 bao.'],['Người nhận Galilê','Trực tiếp nhận 18 bao của G17.'],['Biên nhận hỏng','Hai bao G17 hỏng, ghi riêng; không nằm trong 18 bao đã nhận.']],
      fields:[{id:'received',label:'Đã nhận tại Galilê',expected:18},{id:'damaged',label:'Hỏng có ghi riêng',expected:2},{id:'unexplained',label:'Chưa giải trình đường nhận',expected:4}],total:24,
      example:{numbers:{received:18,damaged:2,unexplained:4}},rules:['Ba khoản cộng lại phải bằng 24.','Số chưa giải trình chưa phải bằng chứng về ý định của ai.'],hints:['Tách hai bao hỏng khỏi 18 bao người nhận đã đếm.','24 trừ 18 trừ 2 để lại một khoản cần tìm đường.'],outcome:'Sổ giữ ba khoản riêng: 18 nhận, 2 hỏng, 4 cần đối chiếu tiếp.',callback:'Q10: chữ ký nhận trước của Haddai không tự giải trình bốn bao này.',sources:['S23']
    });

  add('Q06.LINEAGE','Q06',['custody','copy','counter'],'inference','Ba tờ giấy, mấy nguồn gốc?',
    'So hồ sơ đang giữ với một lời xác nhận trực tiếp về sân phụ. Tìm nguồn cho từng nhận định mà không biến bản chép thành người chứng kiến.',{
      cards:[item('original','E04 · Sổ vận chuyển','G17 xuất 24; hai bao hỏng ghi riêng.',{lineage:'dispatch'}),item('copy','Bản chép đang lập','Chép từ E04; không quan sát việc nhận.',{lineage:'dispatch'}),item('memory','Lời nhớ số đã đọc','Người nói đã đọc E04, không tự đếm.',{lineage:'dispatch'}),item('yard','E06 · Thẻ sân phụ','Ghi riêng bốn bao được đặt ở sân phụ.',{lineage:'sideyard'})],
      claims:[{id:'dispatch',label:'G17 được ghi xuất 24 bao.',status:'supported',sets:[['original'],['copy'],['memory']],why:'Có thể dùng bản ghi hoặc dẫn xuất đúng phạm vi để nói nội dung sổ.'},{id:'independent',label:'E04 và bản chép là hai lần đếm độc lập.',status:'open',sets:[[]],why:'Bản chép bắt nguồn từ E04, không có lần đếm mới.'},{id:'sideyard',label:'Có ghi nhận riêng về bốn bao ở sân phụ.',status:'supported',sets:[['yard']],why:'Nguồn sân phụ có phạm vi riêng; chưa tự gắn người chỉ đạo.'}],
      example:{claims:{dispatch:{status:'supported',cards:['original']},independent:{status:'open',cards:[]},sideyard:{status:'supported',cards:['yard']}}},rules:['Một nhận định chỉ dùng nguồn có trực tiếp hỗ trợ nội dung ấy.','Không thêm thủ phạm hoặc ý định vào điều nguồn chưa kể.'],hints:['Nhìn đường đi của thông tin, đừng đếm số tờ giấy.','E04, bản chép và lời nhớ cùng gốc; E06 nói riêng về sân phụ.'],outcome:'Bản gốc, bản chép và lời nhớ được giữ đúng quan hệ; ghi nhận sân phụ đứng riêng.',callback:'Q11: sổ ca E10 có giá trị vì trực tiếp ghi việc riêng, không vì thêm một tờ giấy.',sources:['S23','S26']
    });

  assign('Q07.PROMISE','Q07',['conversation','new-promise','handoff'],'Một lời hứa có người nhận',
    'Sela chỉ rảnh một cuộc nói ngắn, Miriam cần giữ bữa đã nhận. Xếp lại người và vật để lời hứa có thể thực hiện mà không bắt một người ôm hết việc.',[
      item('player','Bạn','Có thể cùng nói hoặc giữ bữa thay.',{tags:['listener'],allowed:['talk','meal']}),item('miriam','Miriam','Đã nhận giữ bữa; chỉ đổi khi bạn đứng nhận thay.',{tags:['listener'],allowed:['talk','meal']}),item('sela','Sela','Đồng ý một cuộc nói ở chỗ yên; không nhận việc khác.',{tags:['recipient'],allowed:['talk']}),item('rina','Rina','Giữ bếp trong bữa.',{tags:['cook'],allowed:['meal']}),item('note','Mảnh ghi phạm vi','Ghi điều đã hẹn, không phải lời hứa thay người nhận.',{tags:['scope'],allowed:['talk'],weight:0})
    ],[station('talk','Chỗ nói yên','Sela, một người nghe và mảnh phạm vi.',{min:3,max:3,tags:['recipient','listener','scope']}),station('meal','Bữa đã nhận','Rina và một người nhận phần Miriam để lại.',{min:2,max:2,tags:['cook','listener']})],{player:'talk',miriam:'meal',sela:'talk',rina:'meal',note:'talk'}, {
      rules:['Có thể tự đi nói hoặc đổi việc với Miriam khi người nhận đồng ý.','Mỗi người một vị trí, bữa chung vẫn có người giữ.'],hints:['Cả cuộc nói và bữa đều cần một người biết lắng nghe.','Bạn và Miriam có thể đổi chỗ; Sela cùng mảnh phạm vi ở chỗ nói, Rina ở bếp.'],outcome:'Có người đứng nhận việc, có chỗ nói được đồng ý, và bữa chung vẫn tiếp tục.',callback:'Q12: giữ lời bằng cách bàn giao phần việc, không chỉ đọc một câu hứa.',sources:['S23','S29']
    });

  route('Q08.BANK','Q08',['read-bank'],'Đọc bờ trước khi bước xuống',
    'Khảo sát lối tới chỗ Amon đứng và đường về nơi có người nhận. Nền gần nước bị xói; tuyến vòng dài hơn nhưng có chỗ đứng và neo.',[
      n('start','Bờ trên',55,140,'Nền khô, nơi bắt đầu.'),n('plank','Ván lệch',200,40,'Đầu ván đã rời gối kê.',{blocked:true}),n('ledge','Bờ rộng',195,145,'Đủ chỗ cho người giữ dây.'),n('tree','Gốc neo',330,145,'Gốc có thể kiểm phía nền khô.'),n('detour','Lối vòng',330,245,'Dài hơn, vẫn nối nơi nhận.'),n('receiver','Người nhận',480,145,'Có người đứng nhận trước khi nhóm quay về.'),n('amon','Chỗ Amon',590,145,'Đích khảo sát; việc cứu hộ được làm ở bước sau.')
    ],[e('start','plank'),e('plank','amon'),e('start','ledge'),e('ledge','tree'),e('tree','receiver'),e('ledge','detour'),e('detour','tree'),e('receiver','amon')],['start','ledge','tree','receiver','amon'],{
      required:['tree','receiver'],rules:['Không dùng ván đã rời gối kê.','Kiểm gốc neo và điểm nhận trước khi tới Amon.'],hints:['Đọc chỗ có thể đứng, không chỉ khoảng cách tới người.','Bờ rộng nối gốc neo; từ đó qua người nhận rồi mới tới Amon.'],outcome:'Bạn biết đường neo, chỗ đứng và người nhận trước khi chọn phương án cứu hộ.',callback:'Q08: kế hoạch cứu đã chuẩn bị vẫn cần neo, người hỗ trợ và bọc giấy ở ngoài cảnh.',sources:['S26']
    });
  seq('Q08.RESCUE','Q08',['rescue'],'Một nhịp kéo có ba đầu',
    'Thử phối hợp trước khi thực hiện kế hoạch đã chọn. Giấy và thương tích vẫn theo lựa chọn ngoài cảnh; thử sai trên bàn không làm ai bị nạn.',[
      item('anchor','Kiểm người giữ neo','Phần neo đã kiểm phải có người trực tiếp giữ.'),item('receive','Gọi đáp người nhận','Người nhận có thể chuẩn bị đồng thời với neo.'),item('signal','Thống nhất một dấu gọi','Cần cả neo lẫn người nhận đã đáp.',{needs:['anchor','receive']}),item('slack','Thu dây chùng vừa tay','Chỉ sau khi mọi đầu hiểu dấu gọi.',{needs:['signal']}),item('move','Đưa người qua từng nhịp','Theo nhịp đã thử, không giật dây.',{needs:['slack']}),item('handoff','Xác nhận người đã được nhận','Kết thúc sau bàn giao, không ở lúc bắt đầu kéo.',{needs:['move']})
    ],['anchor','receive','signal','slack','move','handoff'],{rules:['Neo và người nhận có thể chuẩn bị theo hai thứ tự.','Phải thử nhịp chung trước khi chuyển người.'],hints:['Đừng bắt đầu từ động tác kéo.','Hai đầu đáp → dấu gọi → thu chùng → chuyển người → bàn giao.'],outcome:'Bạn giữ được một nhịp có người đứng nhận ở cả hai đầu.',callback:'Q12: bàn giao tới người thật, không kết thúc ở dấu trên bản đồ.',sources:['S26']});

  function dispatch(id,owner,actions,title,brief){
    return add(id,owner,actions,'dispatch',title,brief,{
      rules:['Mỗi mảnh nội dung có một nơi nhận cụ thể.','Dữ kiện được đối chiếu có thể công bố; dấu nhận diện phụ thuộc phạm vi người ấy đã đồng ý.','Nội dung chưa có nguồn phải giữ lại, kể cả khi có lợi cho gia đình bạn.'],
      hints:['Đọc phạm vi người nhận ở đầu mỗi phong bì.','Ẩn danh vẫn giữ mã lô và lượng; giữ riêng tên, chỗ ở và mô tả nhận diện khi chưa có phép công bố.'],
      outcome:'Bản giao giữ đủ nội dung được phép, còn thông tin riêng có nơi giữ cụ thể.',callback:'Lần nói sau vẫn cần hỏi lại phạm vi; một bản giao hôm nay không cho quyền dùng tên mãi mãi.',sources:['S23']
    });
  }
  dispatch('Q09.READBACK','Q09',['readback','mediate'],'Đọc lại đúng nơi nhận','Người cung cấp đã chọn phạm vi ở cuộc nói trước. Chuẩn bị bản đối chiếu để họ có thể kiểm lại mà không lộ dấu nhận diện ra sân.');

  add('Q10.RESPONSIBILITY','Q10',['compare'],'inference','Hai phần trách nhiệm trên một bàn',
    'Đặt lá thư của Haddai cạnh lượng nhận và sân phụ. Giữ điều bất lợi cho cha mà vẫn phân biệt những việc chưa được chứng minh.',{
      cards:[item('signed','E01 · Biên nhận gốc','Biên nhận có chữ ký Haddai xác thực theo phạm vi đã kiểm.',{lineage:'origin-sign'}),item('letter','E08 · Thư Haddai','Tự nhận ký trước khi đếm đủ.',{lineage:'haddai'}),item('receipt','E05 · Lượng nhận','18 bao nhận tại Galilê.',{lineage:'arrival'}),item('yard','E06 · Sân phụ','Có ghi nhận riêng về bốn bao.',{lineage:'sideyard'}),item('dispatch','E04 · Sổ vận chuyển','24 bao xuất G17, hai bao hỏng ghi riêng.',{lineage:'dispatch'})],
      claims:[{id:'signed',label:'Haddai có trách nhiệm vì ký trước khi đếm.',status:'supported',sets:[['signed','letter']],why:'Biên nhận gốc xác nhận chữ ký và thư tự nhận việc ký trước; thiện ý không xóa việc đã làm.'},{id:'missing',label:'Lượng chưa tới Galilê cần tách khỏi hai bao hỏng.',status:'supported',sets:[['dispatch','receipt']],why:'Phải đối chiếu hai đầu để thấy khoản còn lại.'},{id:'intent',label:'Chỉ lá thư đủ chứng minh Haddai chủ ý chuyển bốn bao.',status:'open',sets:[[]],why:'Tự nhận ký sai không tự chứng minh ý định chuyển hàng.'}],
      example:{claims:{signed:{status:'supported',cards:['signed','letter']},missing:{status:'supported',cards:['dispatch','receipt']},intent:{status:'open',cards:[]}}},rules:['Mỗi nhận định nhận tối đa hai nguồn.','Không bỏ lá thư chỉ vì bất lợi, cũng không suy thêm ý định từ nó.'],hints:['Tách hành động đã tự nhận khỏi nguyên nhân của phần hàng khác.','Biên nhận gốc + thư → ký trước; sổ tuyến + lượng nhận → khoản cần tách; ý định vẫn mở.'],outcome:'Chữ ký sai được giữ nguyên; phần chuyển hàng vẫn cần đúng nguồn và đúng người chịu trách nhiệm.',callback:'Q12: bạn có thể nhận lỗi của cha mà không nhận thay mọi cáo buộc.',sources:['S22','S23']
    });

  assign('Q11.SUPPLIES','Q11',['supplies'],'Bữa hôm nay và người lên đường',
    'Bốn phần bữa, một đèn và một bộ đồ cần tới đúng nơi. Hai phần đã có người chờ; dự trữ vẫn cần giữ một phần cho ca sau.',[
      item('meal1','Phần bữa đã hẹn 1','Có người đang chờ.',{allowed:['meal'],weight:1}),item('meal2','Phần bữa đã hẹn 2','Có người đang chờ.',{allowed:['meal'],weight:1}),item('reserve1','Phần dự trữ 1','Có thể chia cho chuyến đi hoặc ca sau.',{allowed:['road','reserve'],weight:1}),item('reserve2','Phần dự trữ 2','Có thể chia cho chuyến đi hoặc ca sau.',{allowed:['road','reserve'],weight:1}),item('lamp','Đèn chắn gió','Theo người đi lúc tối.',{tags:['light'],allowed:['road'],weight:0}),item('kit','Bộ đồ sửa','Ở lại để mở bếp ca sau.',{tags:['craft'],allowed:['reserve'],weight:0})
    ],[station('meal','Bữa đang chờ','Giữ hai phần đã nhận.',{min:2,max:2,minLoad:2,maxLoad:2}),station('road','Người lên đường','Một phần bữa và một đèn.',{min:2,max:2,minLoad:1,maxLoad:1,tags:['light']}),station('reserve','Ca sau','Một phần dự trữ và bộ đồ sửa.',{min:2,max:2,minLoad:1,maxLoad:1,tags:['craft']})],{meal1:'meal',meal2:'meal',reserve1:'road',reserve2:'reserve',lamp:'road',kit:'reserve'}, {
      rules:['Không lấy phần người đang chờ để tăng dự trữ.','Hai phần dự trữ đổi vai được; một phần đi, một phần ở lại.'],hints:['Đồ dùng không phải phần bữa: đèn đi đường, bộ đồ ở ca sau.','Giữ hai phần đã hẹn tại bàn; chia đôi hai phần dự trữ cho đường đi và ca sau.'],outcome:'Bữa hiện tại vẫn đủ; người đi có đèn, người ở lại có phần mở ca.',callback:'Q12: kế hoạch còn người tiếp tục chăm bữa sau cuộc nói.',sources:['S23','S29']
    });
  dispatch('Q12.RELEASE','Q12',['speak','separate','send-copy'],'Bản sẽ tới tay người nào?','Trước khi trao bản cuối, xếp mỗi mảnh nội dung vào đúng nơi nhận. Phương án công khai, phân tán hay đưa người đi có phạm vi khác nhau.');

  seq('L01.AXLE','L01',['clear'],'Xe cuối đoàn trong gió',
    'Bạn giúp một nhóm hư cấu chuẩn bị xe. Công việc chỉ giữ người và vật đời thường; con đường qua biển thuộc hành động Thiên Chúa trong Xh 14.',[
      item('calm','Đưa đàn vật khỏi phía nêm','Tránh chen vào nơi kê trục.'),item('unload','Chuyển vò sang người nhận','Người nhận đứng trên nền cứng.'),item('brace','Đưa đòn kê vào nền chắc','Sau khi đàn vật đã lùi và vò đã hạ.',{needs:['calm','unload']}),item('hold','Phân người giữ xe','Có thể chuẩn bị song song với việc hạ vò.'),item('test','Thử tải trên đòn kê','Cần đòn kê và người giữ.',{needs:['brace','hold']}),item('move','Chuyển xe về hàng cuối','Chỉ sau khi thử xong.',{needs:['test']})
    ],['calm','unload','brace','hold','test','move'],{rules:['Có nhiều thứ tự chuẩn bị hợp lệ; cả người nhận và người giữ đều phải sẵn sàng.','Không thao tác nào điều khiển gió, nước hoặc kết cục trình thuật.'],hints:['Việc có thể chuẩn bị song song thì không phải học thuộc một chuỗi duy nhất.','Dọn đàn vật + hạ vò → kê; kê + người giữ → thử → chuyển xe.'],outcome:'Xe hư cấu được chuẩn bị để theo đoàn; nhịp nguồn Kinh Thánh tiếp tục nguyên vẹn.',sources:['S05','S26']});

  assign('L01.REARGUARD','L01',['gather'],'Những đốm đèn nối khóa đuôi',
    'Đội cuối có một người nghe kém và một xe đi chậm. Phân người nhìn mốc, người giữ đèn và người đón thay vì chỉ đếm số người đã qua.',[
      item('family','Gia đình đi chậm','Cần người đi kèm tại khóa đuôi.',{tags:['family'],allowed:['tail']}),item('guide','Người dẫn','Có thể đi kèm hoặc đứng đón.',{tags:['guide'],allowed:['tail','receive']}),item('helper','Người phụ','Có thể đi kèm hoặc đứng đón.',{tags:['guide'],allowed:['tail','receive']}),item('lamp','Đèn che gió','Giữ tầm nhìn cho người nghe kém.',{tags:['light'],allowed:['tail'],weight:0}),item('receiver','Người đón','Giữ chỗ ở đầu bên kia.',{tags:['receiver'],allowed:['receive']})
    ],[station('tail','Khóa đuôi','Gia đình + một người kèm + đèn.',{min:3,max:3,tags:['family','guide','light']}),station('receive','Điểm hội','Người đón và một người nối tín hiệu.',{min:2,max:2,tags:['receiver','guide']})],{family:'tail',guide:'tail',helper:'receive',lamp:'tail',receiver:'receive'}, {
      rules:['Đổi người dẫn và người phụ được, nhưng hai đầu đều phải có người nối tín hiệu.','Sơ đồ các hộ và vị trí đèn là [H], không là chi tiết được bản văn xác nhận.'],hints:['Đặt đèn cạnh người cần nhìn thay cho nghe.','Gia đình và đèn ở khóa đuôi; chia hai người dẫn cho hai đầu.'],outcome:'Hai đầu còn nhìn thấy tín hiệu của nhau; không phát sinh vật phẩm hoặc chứng cứ đời thường.',sources:['S05','S17']
    });

  route('L02.ACOUSTICS','L02',['approach'],'Đường êm trong lòng hang',
    'Đọc sơ đồ tiếng dội và luồng sáng. Chọn một đường lui cho toán hư cấu mà không tới gần Saun hoặc thay quyết định của Đavít.',[
      n('start','Góc toán',55,140,'Bắt đầu trong hốc sâu.'),n('gravel','Sỏi rời',200,45,'Tiếng lăn dội ra cửa.'),n('wall','Vách nhẵn',200,145,'Bước êm, bóng tối không che mất chữ trên sơ đồ.'),n('upper','Gờ cao',200,245,'Xa luồng sáng, thêm một nhịp vòng.'),n('mark','Mốc dây',360,145,'Mốc quay lại cho cả toán.'),n('mouth','Vệt nắng',420,40,'Bị nhìn thấy từ cửa.',{blocked:true}),n('return','Hốc quay về',550,145,'Chỗ hội toán, không phải vị trí Saun.')
    ],[e('start','gravel',4,0,'Sỏi tạo 4 nhịp tiếng dội.'),e('gravel','mark',2),e('start','wall',1),e('start','upper',1),e('wall','mark',1),e('upper','mark',1),e('mark','mouth',0,4),e('mouth','return'),e('mark','return',1)],['start','wall','mark','return'],{
      required:['mark'],noiseBudget:3,lightBudget:1,rules:['Tổng tiếng dội không quá 3 nhịp, không đi vào vệt nắng.','Luôn qua mốc dây trước hốc quay về; có hai lối êm.'],hints:['Sỏi rời và ánh sáng gây hai kiểu lộ khác nhau.','Vách nhẵn hoặc gờ cao → mốc dây → hốc quay về.'],outcome:'Toán có đường lui được kiểm bằng cả tiếng và ánh sáng.',sources:['S06','S30','S17']
    });
  assign('L02.RESTRAINT','L02',['return-group'],'Giữ một khoảng lùi',
    'Sau lời cấm của Đavít trong trình thuật, toán hư cấu cần về chỗ chờ. Chia người giữ mốc, đi cùng người nóng nảy và giữ nước; không dùng bạo lực để “kiềm chế”.',[
      item('restless','Người đang nóng nảy','Tự đồng ý lùi vào chỗ chờ với một bạn đi cùng.',{tags:['restless'],allowed:['wait']}),item('friend','Bạn cùng toán','Có thể đi kèm hoặc giữ mốc.',{tags:['companion'],allowed:['wait','mark']}),item('player','Bạn','Có thể đi kèm hoặc giữ mốc.',{tags:['companion'],allowed:['wait','mark']}),item('water','Bầu nước','Để ở chỗ chờ, không gây tiếng va.',{tags:['water'],allowed:['wait'],weight:0}),item('keeper','Người giữ dây','Ở mốc đường lui.',{tags:['keeper'],allowed:['mark']})
    ],[station('wait','Chỗ chờ','Người nóng nảy, người đi kèm và nước.',{min:3,max:3,tags:['restless','companion','water']}),station('mark','Mốc đường lui','Người giữ dây và người nối tín hiệu.',{min:2,max:2,tags:['keeper','companion']})],{restless:'wait',friend:'wait',player:'mark',water:'wait',keeper:'mark'}, {
      rules:['Không giao lệnh thay Đavít, không tự cắt áo hay tấn công Saun.','Bạn và người cùng toán đổi vai được khi hai điểm vẫn đủ người.'],hints:['Người nóng nảy cần người đi cùng, không cần bị khóa lại.','Giữ nước ở chỗ chờ và chia hai người đồng hành cho hai điểm.'],outcome:'Khoảng lùi được giữ bằng sự cùng ở lại; canon của Đavít không đổi.',sources:['S06','S23']
    });

  seq('L03.CLOTH','L03',['cloth'],'Vải mềm giữa dây và vai',
    'Gr 38,7–13 kể Ebed-melech dùng vải cũ lót nơi dây tì khi đưa Giêrêmia lên. Người phụ hư cấu chuẩn bị phần việc theo trình tự, không “mua” kết quả bằng điểm.',[
      item('answer','Gọi đáp dưới hố','Xác nhận người dưới hố nghe được.'),item('cloth','Chuyển vải mềm xuống trước','Vải được đưa tới người dưới hố.',{needs:['answer']}),item('pad','Chờ xác nhận vải đã lót','Chờ lời đáp về chỗ dây tì.',{needs:['cloth']}),item('team','Phân người giữ dây','Có thể chuẩn bị trong khi đưa vải xuống.'),item('lift','Cùng đưa lên theo nhịp','Chỉ sau khi vải đã lót và người giữ đã sẵn sàng.',{needs:['pad','team']})
    ],['answer','cloth','pad','team','lift'],{rules:['Lót vải trước khi mang tải.','Không có bộ đếm gây tổn thương khi bạn đang học thao tác.'],hints:['Vật liệu nhỏ thay đổi chỗ lực tì lên người.','Gọi đáp → chuyển vải → chờ xác nhận; có đủ người giữ rồi mới chuyển tải.'],outcome:'Vải được đặt đúng chỗ trước khi chuyển tải; trình thuật cứu Giêrêmia giữ nguyên.',sources:['S07']});

  seq('L04.NET','L04',['net'],'Lưới chưa thả, dây đã phải rõ',
    'Chuẩn bị dụng cụ trong đêm trắng tay. Gỡ dây chỉ là việc con người; kết quả mẻ cá trong Ga 21 không phụ thuộc điểm tối ưu.',[
      item('spread','Trải phần lưới đang rối','Nhìn thấy hai đầu dây.'),item('float','Tách mép nổi','Sau khi trải, nhận mép nổi bằng nút đánh dấu.',{needs:['spread']}),item('weight','Tách mép chì','Sau khi trải, nhận phần mang tải.',{needs:['spread']}),item('coil','Cuộn dây mạn khỏi lối chân','Không cần chờ xong cả hai mép.'),item('check','Kiểm đường thả không vướng chân','Cần đủ mép nổi, mép chì và dây mạn.',{needs:['float','weight','coil']})
    ],['spread','float','weight','coil','check'],{rules:['Hai mép có thể gỡ theo hai thứ tự; dây mạn cũng có thể chuẩn bị sớm.','Bản văn không xác định cấu tạo lưới ba lớp; mọi lớp và nút thao tác ở đây là [H].'],hints:['Tìm hai mép trước khi xét lưới có thể thả.','Trải → tách hai mép; cuộn dây mạn; kiểm sau cùng.'],outcome:'Đường thao tác được dọn, không thay đổi việc đêm ấy các môn đệ không bắt được cá.',sources:['S09','S31']});
  assign('L04.LANDING','L04',['land'],'Ba việc bên mạn thuyền',
    'Sau mẻ cá theo trình thuật, nhóm hư cấu giữ thuyền và lối lên bờ. Chia lực ở hai bên và giữ dây giữa; không có nhánh làm lưới Kinh Thánh bị rách.',[
      item('helper1','Người phụ thứ nhất','Một đơn vị giữ thăng bằng.',{weight:1,tags:['balance'],allowed:['left','right']}),item('helper2','Người phụ thứ hai','Một đơn vị giữ thăng bằng.',{weight:1,tags:['balance'],allowed:['left','right']}),item('player','Bạn','Giữ đường dây giữa.',{weight:0,tags:['rope'],allowed:['middle']}),item('receiver','Người nhận trên bờ','Giữ lối bước lên, không dồn ra một mạn.',{weight:0,tags:['receive'],allowed:['shore']})
    ],[station('left','Mạn trái','Một người giữ cân.',{min:1,max:1,minLoad:1,maxLoad:1}),station('right','Mạn phải','Một người giữ cân.',{min:1,max:1,minLoad:1,maxLoad:1}),station('middle','Dây giữa','Một người giữ dây khỏi lối chân.',{min:1,max:1,tags:['rope']}),station('shore','Lối lên bờ','Người nhận đứng chờ.',{min:1,max:1,tags:['receive']})],{helper1:'left',helper2:'right',player:'middle',receiver:'shore'}, {
      rules:['Hai người phụ đổi mạn được; lực hai bên phải cân.','Đơn vị tải là mô hình game, không là tải trọng đo từ thuyền Ginosar.'],hints:['Đừng dồn cả hai người giữ cân về cùng mạn.','Mỗi mạn một người; bạn giữ dây giữa; người nhận ở bờ.'],outcome:'Lối lên bờ có người nhận; trình thuật chuyển sang bếp than và bữa sáng.',sources:['S09','S31']
    });

  assign('L05.REMAIN','L05',['remain'],'Đứng lại trong nhà giam',
    'Cv 16,25–34 không trở thành màn vượt ngục. Sau nhịp nguồn, nhóm người phụ hư cấu giữ tầm nhìn và gọi đáp để không ai suy rằng mọi người đã chạy.',[
      item('player','Bạn','Có thể giữ đèn hoặc gọi đáp.',{tags:['voice'],allowed:['door','group']}),item('helper','Người cùng buồng','Có thể giữ đèn hoặc gọi đáp.',{tags:['voice'],allowed:['door','group']}),item('lamp','Đèn','Giữ ở cửa nhìn vào trong.',{tags:['light'],allowed:['door'],weight:0}),item('group','Nhóm đang ở lại','Ở cùng nhau trong tầm đáp.',{tags:['people'],allowed:['group']})
    ],[station('door','Chỗ giữ ánh sáng','Đèn và một người gọi đáp.',{min:2,max:2,tags:['light','voice']}),station('group','Cùng ở lại','Nhóm và một người nối lời đáp.',{min:2,max:2,tags:['people','voice']})],{player:'door',helper:'group',lamp:'door',group:'group'}, {
      rules:['Không điều khiển Phaolô nói lời mới.','Chấn động và lời can ngăn thuộc bản văn; mô hình phân người là [H].'],hints:['Ánh sáng phải nối được với tiếng trả lời.','Chia hai người biết gọi đáp cho cửa và nhóm; đèn ở cửa.'],outcome:'Nhóm hư cấu còn hiện diện trong tầm nhìn và tiếng đáp.',sources:['S10']
    });

  function arrangement(id,owner,action,title,brief,items,stations,outcome){
    return add(id,owner,[action],'arrangement',title,brief,{items,stations,rules:['Có thể để trống hoặc sắp đặt theo cách bạn muốn.','Không có đáp án đạo đức, điểm đức tin hay lời tiên báo.'],hints:['Chỉ thử một cách đặt rồi nhìn lại cảm giác của bạn.','Bạn có thể xóa bố cục hoặc tiếp tục mà không ghi một lời phản tư.'],example:{assignments:{}},outcome,sources:[]});
  }
  arrangement('V01.PAGES','V01','place','Những trang chưa mang tên','Đây là giấc mơ hư cấu. Đặt các trang vào nơi bạn muốn giữ, trao hoặc để chờ; bố cục không tiết lộ danh tính ngoài đời.',[item('warm','Trang còn hơi ấm','Gợi một cuộc gặp chưa đặt tên.'),item('fold','Trang gấp đôi','Một điều bạn chưa muốn mở.'),item('blank','Trang trắng','Một khoảng chưa cần lấp.')],[station('keep','Tự giữ','Giữ trong tầm tay.'),station('offer','Để người kia tự nhận','Không đặt hộ vào tay họ.'),station('wait','Để chờ','Một việc chưa đến lúc nói.')],'Bạn rời bố cục bằng lựa chọn riêng; game không giải nghĩa thay bạn.');
  assign('V02.BALANCE','V02',['share'],'Những nhịp cầu chia tải','Ẩn dụ hư cấu có luật cân bằng vật lý đơn giản: chuyển bốn khối để hai bệ cùng chịu hai đơn vị. Không dùng kết quả để chấm con người.',[
    item('a','Khối đá A','Một đơn vị tải.',{weight:1}),item('b','Khối đá B','Một đơn vị tải.',{weight:1}),item('c','Khối đá C','Một đơn vị tải.',{weight:1}),item('d','Khối đá D','Một đơn vị tải.',{weight:1})
  ],[station('left','Bệ trái','Chịu hai đơn vị.',{minLoad:2,maxLoad:2}),station('right','Bệ phải','Chịu hai đơn vị.',{minLoad:2,maxLoad:2})],{a:'left',b:'left',c:'right',d:'right'}, {rules:['Mỗi khối một nơi; mỗi bệ hai đơn vị.','Mọi cách chia cân bằng đều được chấp nhận; phản tư được để trống.'],hints:['Không có khối nào đặc biệt hơn khối khác.','Đặt hai khối lên mỗi bệ.'],outcome:'Mặt cầu trong giấc mơ cân bằng; ngoài đời vẫn cần mở lời với người thật.',sources:[]});
  arrangement('V03.STRINGS','V03','release','Bàn tay đang giữ dây','Không có nhân vật thật bị điều khiển ở đây. Thử đặt ba sợi dây vào tay, lên cành hoặc xuống đất; ý nghĩa được để mở.',[item('fear','Sợi dây lo sợ','Một điều bạn đang muốn nắm chắc.'),item('care','Sợi dây chăm sóc','Một ý muốn giúp người khác.'),item('expect','Sợi dây mong đợi','Một kết quả bạn đang chờ.')],[station('hand','Trong tay','Tiếp tục giữ.'),station('branch','Trên cành','Đặt sang một điểm khác.'),station('ground','Dưới đất','Để dây được nghỉ.')],'Game lưu bố cục nếu bạn muốn, không kết luận bạn đã biết buông hay chưa.');
  arrangement('V04.TABLE','V04','sit','Một bàn còn chỗ trống','Giấc mơ không gọi người đã khuất trở về để trả lời điều tra. Đặt vài vật quen vào bàn, kệ hoặc túi rồi trở lại với người đang sống.',[item('cup','Chén đất','Một bữa từng có người ngồi.'),item('thread','Cuộn chỉ','Một việc còn có thể làm tiếp.'),item('lamp','Đèn nhỏ','Một khoảng sáng vừa đủ.')],[station('table','Trên bàn','Một chỗ còn để dành.'),station('shelf','Trên kệ','Một điều cất lại.'),station('bag','Trong túi','Một vật muốn mang theo trong ký ức.')],'Bố cục có thể còn dang dở; bạn vẫn được trở về và tiếp tục sống.');

  function encounter(s,a){
    if(!a||a.bond)return null;
    const owner=s.layer?s.layer.id:D.chapters[s.chapter]?.id;
    return catalog.find(x=>x.owner===owner&&x.actions.includes(a.id))||null;
  }
  function dispatchData(s,def){
    const last=def.owner==='Q12',plan=s.flags.finalPlan||s.quests.Q11?.route||'relocate';
    const publicPlan=last&&plan==='public';
    const c=s.consent.witness1;
    const named=publicPlan&&c?.scope==='public_named'&&c.voluntary&&c.safe;
    const anonymous=s.evidence.includes('E09')&&c?.voluntary&&['anonymous_summary','public_named','private_group'].includes(c.scope);
    const has=id=>s.evidence.includes(id);
    const facts=last?has('E04')&&has('E05'):has('E06');
    const items=[
      item('lot','Mã lô và lượng đã đối chiếu',last?'Chỉ phần G17 có nguồn trong túi hồ sơ.':'Ghi nhận vật thể sân phụ; không phải lời nói của người vừa gặp.',{allowed:facts?[publicPlan?'public':'group']:['hold']}),
      item('name','Tên người cung cấp','Cần quyền dùng tên đúng đối tượng nghe.',{allowed:named?['public','private','hold']:['private','hold']}),
      item('home','Chỗ người thân đang ở','Không cần để đối chiếu hàng; không thuộc phạm vi công bố tên.',{allowed:['private','hold']}),
      item('detail','Dấu nhận diện có thể tìm lại người','Tên đã ẩn không làm mô tả nhận diện trở nên vô hại.',{allowed:['private','hold']}),
      item('statement','Nội dung lời chứng','Theo phạm vi đã được đồng ý; người từ chối vẫn được từ chối.',{allowed:anonymous?[c.scope==='private_group'?'group':publicPlan?'public':'group','hold']:['hold']}),
      item('rumor','Kết luận ý định từ lời đồn','Chưa có nguồn kiểm được.',{allowed:['hold']})
    ];
    if(last)items.push(item('father','Phần Haddai tự nhận ký trước','Giữ phần bất lợi khi có lá thư, không sửa thành lời minh oan.',{allowed:has('E08')?[publicPlan?'public':'group']:['hold']}));
    return {items,stations:[station('public','Sân công khai','Ai ở sân cũng có thể nghe; không chứa địa chỉ.'),station('group','Nhóm đối chiếu','Nhóm nhận bản có giới hạn, không phát tán.'),station('private','Hồ sơ riêng','Giữ thông tin nhận diện riêng khỏi bản giao.'),station('hold','Chưa trao','Chưa có nguồn, chưa được phép hoặc tự chọn giữ lại.')],context:`Phương án: ${last?(plan==='public'?'nói trước sân':plan==='distributed'?'gửi các người giữ bản':'gửi hồ sơ sau khi đưa người đi'):'đọc lại trong nhóm'}. Phạm vi người cung cấp: ${c?.scope||'chưa có đồng ý'}${c?.safe?' · đã bố trí bảo vệ':''}.`};
  }
  const voices={
    Q01:['Natan','Con nhìn chốt nứt trước rồi hãy nhìn phần trên xe. Chú vẫn đang nghe tiếng trục chịu tải.'],
    Q02:['Miriam','Tôi muốn giữ điều mình thực sự nhìn thấy, kể cả khi nó chưa giúp ta chỉ được một cái tên.'],
    Q03:['Amon','Tôi nhớ nơi xe dừng để đổi dây. Còn ai nhận bao sau đó, bạn phải hỏi người ở đầu kia.'],
    Q04:['Mattai','Khi tôi khép sổ ca, tôi cần biết ai còn ở ngoài và ai sẽ đứng nhận họ.'],
    Q05:['Người nhận ở Galilê','Tôi đếm thứ đã tới tay mình. Đừng bắt con số ấy nói thay chuyện xảy ra ở dọc đường.'],
    Q06:['Damar','Tôi từng nghĩ giữ được vật gốc là xong. Lea hỏi một câu khó hơn: vật ấy thực sự cho ta biết điều gì?'],
    Q07:['Sela','Tôi có thể nhận một cuộc nói ngắn. Phần việc còn lại cần có người đứng nhận, đừng hứa thay tôi.'],
    Q08:['Amon','Tôi còn nghe được bạn. Hãy để người giữ dây và người nhận gọi đáp với nhau trước.'],
    Q09:['Người giữ bản','Bản này sẽ rời bàn của chúng ta. Bạn muốn người ở đầu kia có quyền đọc đến đâu?'],
    Q10:['Lea','Giữ cùng một thước đo cho cha mình là phần khó. Tôi sẽ ngồi đây đối chiếu cùng bạn.'],
    Q11:['Rina','Hai phần bữa kia đã có người chờ. Bạn chia phần dự trữ, nhớ để ca mai còn mở được bếp.'],
    Q12:['Natan','Con cứ đọc điều mình đã kiểm. Những người đang ngồi đây không cần con nói thay phần họ chưa trao.'],
    L01:['Người cùng khóa đuôi · [H]','Tôi sẽ đi chậm cùng xe. Hãy để lại một đốm sáng mà người đi thấp nhất vẫn nhìn thấy.'],
    L02:['Người cùng toán · [H]','Tôi không muốn tiếng bước mình kéo cả nhóm về phía cửa. Cho tôi một mốc để quay lại.'],
    L03:['Người phụ cùng nhóm · [H]','Vải đã tới dưới hố. Chúng ta còn chờ một tiếng đáp trước khi cùng mang tải.'],
    L04:['Người phụ việc · [H]','Tôi nhận phần dây này. Bạn xem lối chân còn vướng gì rồi mình cùng thu xếp.'],
    L05:['Người cùng buồng · [H]','Tôi còn ở đây. Giữ đèn để người bên cửa nhìn thấy chúng ta.' ]
  };
  function materialize(s,def){
    def=catalog.find(x=>x.id===def.id)||def;
    const d={...def,...(def.type==='dispatch'?dispatchData(s,def):{}),voice:voices[def.owner]||null,sourceRef:D.legends[def.owner]?.ref||null};
    if(def.id==='Q07.PROMISE'){
      const plan=s.quests.Q07?.plan;
      if(plan==='personally_keep'){
        d.brief='Miriam giữ lời gặp Sela trực tiếp. Bạn đứng nhận phần việc ở bữa để hai chị em có một cuộc nói vừa sức.';
        d.items=def.items.map(x=>({...x,allowed:x.id==='miriam'?['talk']:x.id==='player'?['meal']:x.allowed}));
        d.rules=['Miriam và Sela trực tiếp có mặt ở chỗ nói; không cử người khác thay.','Bạn nhận phần giữ bữa cùng Rina; mảnh phạm vi ở chỗ nói.'];
        d.example={assignments:{player:'meal',miriam:'talk',sela:'talk',rina:'meal',note:'talk'}};
      }else if(plan==='delegated'){
        d.brief='Người chuyển lời đã tự nguyện nhận phạm vi ở bước trước. Giữ cuộc bàn giao giữa người ấy và Sela, còn Miriam cùng bạn tiếp tục phần bữa.';
        d.items=[...def.items.map(x=>({...x,allowed:['miriam','player'].includes(x.id)?['meal']:x.allowed})),item('courier','Người đã nhận chuyển lời','Đã nhận ở bước trước, chỉ chuyển đúng phạm vi.',{tags:['listener'],allowed:['talk']})];
        d.stations=def.stations.map(x=>x.id==='meal'?{...x,min:3,max:3,detail:'Rina giữ bếp; Miriam và bạn tiếp tục phần bữa.'}:x);
        d.rules=['Người đã nhận chuyển lời và Sela có mặt ở bàn giao.','Miriam không bị ghi là đã trực tiếp nói khi chọn phương án chuyển lời.'];
        d.example={assignments:{player:'meal',miriam:'meal',sela:'talk',rina:'meal',note:'talk',courier:'talk'}};
      }
    }
    if(def.id==='Q11.SUPPLIES'){
      const stock=Math.max(0,Math.floor(s.flags.finalMealStock??s.resources.food)),road=stock>0?1:0,left=Math.max(0,stock-road);
      d.brief=`Hai phần đã có người chờ thuộc bữa hiện tại. Bạn còn ${stock} phần bữa dự trữ: dành ${road} phần cho người lên đường và ghi đúng ${left} phần còn lại cho ca sau. Đèn đi đường, bộ đồ sửa ở lại.`;
      d.items=def.items.filter(x=>!((x.id==='reserve1'&&!road)||(x.id==='reserve2'&&!left))).map(x=>x.id==='reserve2'?{...x,label:'Phần dự trữ còn lại ('+left+')',detail:'Gộp '+left+' phần còn lại, phải giữ đúng lượng.',weight:left}:x);
      d.stations=def.stations.map(x=>x.id==='road'?{...x,min:1+road,max:1+road,minLoad:road,maxLoad:road,detail:road?'Một phần dự trữ và đèn.':'Chỉ có đèn; chưa có phần bữa dự trữ để giao.'}:x.id==='reserve'?{...x,min:1+(left?1:0),max:1+(left?1:0),minLoad:left,maxLoad:left,detail:left?left+' phần dự trữ và bộ đồ sửa.':'Bộ đồ sửa ở lại; ca sau chưa có phần bữa dự trữ.'}:x);
      d.rules=['Hai phần đang có người chờ không nằm trong kho dự trữ để chia lại.','Giữ đúng lượng thực có; chuyển một phần dự trữ khi còn, không tự thêm bữa.'];
      d.example={assignments:{meal1:'meal',meal2:'meal',lamp:'road',kit:'reserve',...(road?{reserve1:'road'}:{}),...(left?{reserve2:'reserve'}:{})}};
      d.outcome=road?`Hai phần đã hẹn được giữ; một phần dự trữ cùng đèn theo người đi, ca sau còn ${left} phần và bộ đồ sửa.`:'Hai phần đã hẹn được giữ; đèn và bộ đồ có nơi nhận, còn thiếu phần bữa dự trữ cho người đi và ca sau.';
    }
    return d;
  }
  function context(s){
    if(s.layer)return [];
    const q=D.chapters[s.chapter]?.id,r=s.workshop?.records||{},lines=[];
    if(q==='Q04'&&r['Q01.LOAD'])lines.push('Natan để chốt nứt cũ cạnh bàn. Titus hỏi bạn kiểm đường chịu tải mới trước khi tháo phần đang giữ cửa.');
    if(q==='Q05'&&r['Q03.TRACK'])lines.push('Sơ đồ của Amon còn đánh dấu '+(r['Q03.TRACK'].payload.path.includes('wall')?'lối ven tường':'chỗ giếng')+'. Đến Galilê, nhóm phải hỏi riêng người thực sự đã nhận bao.');
    if(q==='Q09'&&r['Q06.LINEAGE'])lines.push('Bản chép vẫn dẫn về một gốc. Người giữ bản dành một khoảng riêng cho lời người trực tiếp biết việc, nếu người ấy muốn trao.');
    if(q==='Q10'&&r['Q05.RECONCILE'])lines.push('Bảng ba khoản của bạn vẫn còn: 18 bao nhận, hai bao hỏng, bốn bao cần tìm đường. Lá thư của cha phải được đặt cạnh từng khoản ấy.');
    if(q==='Q11'&&r['Q07.PROMISE']){
      const p=r['Q07.PROMISE'].payload.assignments;
      lines.push(p.courier?'Mảnh bàn giao cho người chuyển lời còn được giữ với phạm vi đã nhận.':p.miriam==='talk'?'Miriam đã có mặt bên Sela vì bạn nhận phần bữa cùng Rina.':'Miriam và bạn đã phân lại phần việc để cuộc hẹn với Sela có người đứng nhận.');
    }
    if(q==='Q12'&&r['Q11.SUPPLIES'])lines.push('Rina đã giữ hai phần đang có người chờ. '+(s.flags.finalMealStock>0?'Một phần dự trữ đã theo người đi; ca sau còn '+Math.max(0,s.flags.finalMealStock-1)+' phần và bộ đồ sửa.':'Bộ đồ sửa ở lại, nhưng chưa có phần dự trữ cho chuyến đi hay ca sau.'));
    return lines;
  }
  function empty(def){return def.type==='sequence'?{order:[]}:def.type==='route'?{path:[def.start]}:def.type==='ledger'?{numbers:{}}:def.type==='inference'?{claims:{}}:{assignments:{}};}
  function guided(s,def){
    const d=materialize(s,def);
    return d.type==='dispatch'?{assignments:Object.fromEntries(d.items.map(x=>[x.id,x.allowed[0]]))}:copy(d.example);
  }
  function evaluate(s,def,payload={}){
    const d=materialize(s,def),issues=[],notes=[],fail=t=>issues.push(t);
    if(!payload||typeof payload!=='object'||Array.isArray(payload))payload={};
    if(d.type==='sequence'){
      const order=Array.isArray(payload.order)?payload.order:[],known=new Set(d.steps.map(x=>x.id)),seen=new Set();
      if(order.length!==d.steps.length||new Set(order).size!==order.length||order.some(id=>!known.has(id)))fail('Mỗi thao tác cần xuất hiện đúng một lần; có thể xóa và xếp lại.');
      for(const id of order){const x=d.steps.find(x=>x.id===id);if(!x)continue;const missing=(x.needs||[]).filter(id=>!seen.has(id));if(missing.length)fail(x.label+': cần '+missing.map(id=>d.steps.find(x=>x.id===id).label.toLowerCase()).join(', ')+' trước.');seen.add(id);}
      if(!issues.length)notes.push('Các quan hệ chuẩn bị và chịu tải đều được giữ.');
    }else if(d.type==='allocation'||d.type==='dispatch'||d.type==='arrangement'){
      const a=payload.assignments&&typeof payload.assignments==='object'&&!Array.isArray(payload.assignments)?payload.assignments:{};
      for(const x of d.items){const to=d.stations.find(y=>y.id===a[x.id]);if(!to){if(d.type!=='arrangement')fail('Chưa đặt '+x.label.toLowerCase()+' vào nơi nhận.');continue;}if(x.allowed&&!x.allowed.includes(to.id))fail(x.label+': '+to.label.toLowerCase()+' không đáp ứng phạm vi hoặc điều kiện đã nêu.');}
      for(const st of d.stations){const group=d.items.filter(x=>a[x.id]===st.id),load=group.reduce((n,x)=>n+(x.weight??1),0),tags=new Set(group.flatMap(x=>x.tags||[]));
        if(st.min!=null&&group.length<st.min)fail(st.label+': cần ít nhất '+st.min+' người/vật.');if(st.max!=null&&group.length>st.max)fail(st.label+': vượt '+st.max+' vị trí.');
        if(st.minLoad!=null&&load<st.minLoad)fail(st.label+': thiếu tải/phần cần nhận ('+load+'/'+st.minLoad+').');if(st.maxLoad!=null&&load>st.maxLoad)fail(st.label+': quá mức '+st.maxLoad+' ('+load+').');
        if((st.tags||[]).some(tag=>!tags.has(tag)))fail(st.label+': còn thiếu vai được mô tả ở điểm này.');notes.push(st.label+': '+group.length+' người/vật'+(st.minLoad!=null?' · '+load+' đơn vị':'')+'.');}
    }else if(d.type==='route'){
      const p=Array.isArray(payload.path)?payload.path:[];let noise=0,light=0;
      if(p[0]!==d.start||p[p.length-1]!==d.end)fail('Tuyến cần nối từ điểm bắt đầu tới đích.');
      if(new Set(p).size!==p.length)fail('Tuyến không cần quay vòng; hãy lùi một mốc để thử nhánh khác.');
      for(let i=0;i<p.length;i++){const node=d.nodes.find(n=>n.id===p[i]);if(!node){fail('Tuyến có mốc không thuộc sơ đồ.');continue;}if(node.blocked)fail(node.label+': '+node.detail);if(i){const edge=d.edges.find(e=>e.from===p[i-1]&&e.to===p[i]);if(!edge)fail('Hai mốc '+p[i-1]+' và '+p[i]+' không nối nhau.');else{noise+=edge.noise;light+=edge.light;}}}
      for(const id of d.required||[])if(!p.includes(id))fail('Còn thiếu điểm kiểm '+d.nodes.find(n=>n.id===id).label.toLowerCase()+'.');
      if(d.noiseBudget!=null&&noise>d.noiseBudget)fail('Tiếng dội '+noise+' vượt giới hạn '+d.noiseBudget+'.');if(d.lightBudget!=null&&light>d.lightBudget)fail('Lộ sáng '+light+' vượt giới hạn '+d.lightBudget+'.');
      if(d.noiseBudget!=null)notes.push('Tiếng dội: '+noise+'/'+d.noiseBudget+' · lộ sáng: '+light+'/'+d.lightBudget+'.');
    }else if(d.type==='ledger'){
      const nums=payload.numbers||{};let total=0;
      for(const f of d.fields){const v=nums[f.id];if(v===''||v==null||!Number.isInteger(Number(v))||Number(v)<0||Number(v)>24){fail(f.label+': cần một lượng nguyên từ 0 đến 24.');continue;}total+=Number(v);if(Number(v)!==f.expected)fail(f.label+': chưa khớp ghi nhận; xem lại nguồn ở bàn.');}
      if(total!==d.total)fail('Ba khoản hiện cộng thành '+total+', sổ xuất là '+d.total+'.');notes.push('Tổng đối chiếu: '+total+'/'+d.total+'.');
    }else if(d.type==='inference'){
      for(const c of d.claims){const claim=payload.claims?.[c.id],cards=Array.isArray(claim?.cards)?claim.cards:[];
        if(!claim||claim.status!==c.status){fail(c.label+' '+c.why);continue;}
        if(cards.length>2||new Set(cards).size!==cards.length||!c.sets.some(set=>set.length===cards.length&&set.every(id=>cards.includes(id))))fail(c.label+' Nguồn đang ghép chưa hỗ trợ đúng phạm vi. '+c.why);
      }
    }
    return {ok:issues.length===0,issues:[...new Set(issues)].slice(0,12),notes,summary:d.outcome+' '+describe(s,d,payload)};
  }
  function describe(s,def,payload){
    const d=materialize(s,def),p=normalize(d,payload);
    if(d.type==='sequence')return 'Thứ tự đã chọn: '+p.order.map(id=>d.steps.find(x=>x.id===id).label.toLowerCase()).join(' → ')+'.';
    if(d.type==='route')return 'Tuyến đã chọn: '+p.path.map(id=>d.nodes.find(x=>x.id===id).label).join(' → ')+'.';
    if(d.type==='ledger')return d.fields.map(f=>f.label+': '+(p.numbers[f.id]||0)).join(' · ')+'.';
    if(d.type==='inference')return d.claims.map(c=>c.label+' '+(p.claims[c.id]?.status==='supported'?'Đã có nguồn đúng phạm vi.':'Còn để mở.')).join(' ');
    const groups=d.stations.map(st=>{const names=d.items.filter(x=>p.assignments[x.id]===st.id).map(x=>x.label);return names.length?st.label+': '+names.join(', '):null;}).filter(Boolean);
    return groups.length?groups.join(' · ')+'.':'Bố cục được để trống.';
  }
  function normalize(def,payload){
    if(!payload||typeof payload!=='object'||Array.isArray(payload)||JSON.stringify(payload).length>10000)return empty(def);
    const p=copy(payload),known=(list,id)=>list.some(x=>x.id===id);
    if(def.type==='sequence')return {order:Array.isArray(p.order)?p.order.filter(id=>known(def.steps,id)).slice(0,def.steps.length):[]};
    if(def.type==='route')return {path:Array.isArray(p.path)?p.path.filter(id=>known(def.nodes,id)).slice(0,def.nodes.length):[def.start]};
    if(def.type==='ledger')return {numbers:Object.fromEntries(def.fields.map(f=>[f.id,typeof p.numbers?.[f.id]==='number'||typeof p.numbers?.[f.id]==='string'?String(p.numbers[f.id]).slice(0,4):'']))};
    if(def.type==='inference')return {claims:Object.fromEntries(def.claims.map(c=>[c.id,{status:['supported','open'].includes(p.claims?.[c.id]?.status)?p.claims[c.id].status:'',cards:Array.isArray(p.claims?.[c.id]?.cards)?p.claims[c.id].cards.filter(id=>known(def.cards,id)).slice(0,2):[]}]))};
    const items=def.items||[],stations=def.stations||[];
    return {assignments:Object.fromEntries(items.filter(x=>known(stations,p.assignments?.[x.id])).map(x=>[x.id,p.assignments[x.id]]))};
  }
  // These bindings replace the old confirmation only at existing scene locations.
  // Source beats, route choices, consent choices and ending commitments stay owned by the base campaign.
  for(const def of catalog){
    const q=D.chapters.find(q=>q.id===def.owner);if(!q)continue;
    for(const a of [...q.tasks,...Object.values(q.execution).flat()])if(def.actions.includes(a.id)){a.depth=def.id;a.puzzle='depth';}
  }
  const api={catalog,encounter,materialize,dispatchData,empty,guided,evaluate,normalize,describe,context};
  root.WitnessDepth=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
