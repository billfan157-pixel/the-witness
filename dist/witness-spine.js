(function(root){
  'use strict';
  const D=root.WitnessContent||(typeof require!=='undefined'?require('./witness-content.js'):null);
  const make=(id,title,text,at,kind='observe',extra={})=>Object.assign([id,title,text],{at,kind,...extra});
  const order=(id,title,text,at)=>make(id,title,text,at,'order',{order:['prepare','secure','check'],orderLabels:['Chuẩn bị chỗ thao tác','Giữ vật / phân người nhận','Kiểm lại trước khi tiếp tục']});
  const route=(at)=>make('route','Đọc hai lối trong không gian','Chọn cách khảo sát. Cả hai gặp lại trên mạch bản văn; bạn vẫn có thể khám phá các địa vật khác.',at,'route',{choices:[['near','Lối nền thấp','Đi gần công việc và dấu người qua.'],['overlook','Lối nhìn xa','Đi vòng để có góc nhìn toàn cảnh.']]});
  const beat=(id,ref,title,text,at)=>make('source-'+id,title,text,at,'source',{beat:id,reference:ref});
  const discover=(id,title,at,text,variant='waystone')=>({id,title,at,text,variant});
  const m=D.legends.L01,d=D.legends.L02,p=D.legends.L04;
  Object.assign(m,{title:'Bờ trước mặt',ref:'Xh 14,1–31',required:true,act:1,after:2,before:3,revision:'3.0.0',returnAt:[22,-25],start:[-16,15],narrator:'Natan',narration:'Tôi nhớ một câu chuyện bắt đầu ở nơi người ta chẳng nhìn thấy đường ra.',reflection:'Khi chưa thấy đường, bạn muốn hỏi ai đang ở phía sau?',bridge:'Trở lại sân kho: khảo sát lối ra, kiểm người cuối và bàn giao. Câu chuyện nguồn không làm thay những việc ấy.',mapNote:'Trại → điểm tập hợp → bờ → hành lang qua → bờ bên kia. Bố cục nghệ thuật, chưa định vị địa điểm vượt biển.',steps:[
    beat('L01.B01','Xh 14,1–10','Giữa trại và bờ','Đoàn dân đóng trại; quân đuổi theo tới gần. Tình thế đặt họ trước biển và nỗi sợ. Bản văn không trao cho Môsê một lối thoát do tài thao lược riêng.',[-15,12]),
    route([-12,8]),
    make('survey','Tìm điểm nhìn của nhóm','Theo dấu tải hoặc đi lên mép nhìn. Hãy xác định nơi các nhóm có thể gặp lại.',[-8,3],'observe',{routeAt:{near:[-8,3],overlook:[-24,3]}}),
    order('clear','Dời kiện vướng lối','Đây là thao tác dựng thêm: chuẩn bị chỗ đứng, giữ tải rồi kiểm lối. Không kiểm đếm giá trị hay số phận người trong bản văn.',[-5,6]),
    beat('L01.B02','Xh 14,10–14','Tiếng sợ và lời đáp','Dân hoảng sợ và kêu lên. Môsê đáp lại trong tình thế không do ông làm chủ. Lời trấn an hướng tới hành động của Đức Chúa, không một cam kết rằng người chơi có thể điều khiển mọi điều.',[-1,4]),
    make('gather','Đứng cùng người đang chờ','Từ mốc vải tới bờ, tìm vị trí nhìn được nhóm sau. Các nhân vật nền và bố cục nhóm là sáng tác.',[1,0]),
    beat('L01.B03','Xh 14,15–20','Sáng kiến cứu thoát','Đức Chúa truyền cho Môsê dẫn dân tiến đi. Trình thuật đặt sự che chở và lối mở trong hành động của Thiên Chúa. Động tác của Môsê thuộc mạch lời được trao, không là nút gọi phép lạ.',[4,-4]),
    make('passage','Đọc tuyến vừa mở','Theo các mốc người đi trước. Có thể qua nền phẳng hoặc tới mép quan sát rồi trở lại; không có đồng hồ buộc dân phải chết.',[11,-9],'observe',{routeAt:{near:[11,-9],overlook:[-5,-12]}}),
    beat('L01.B04','Xh 14,21–25','Con đường qua biển','Gió và nước nằm trong diễn tiến nguồn; dân đi qua trên đất khô, quân đuổi theo tiến vào. Cảnh chơi giúp theo dõi khoảng cách và dòng người, không giải thích biến cố thành công nghệ của Môsê.',[14,-14]),
    make('far-bank','Đi tới bờ bên kia','Đi theo đường đang mở tới điểm nhìn an toàn. Bạn có thể dừng để đọc cảnh; thao tác không quyết định kết cục Kinh Thánh.',[19,-19]),
    beat('L01.B05','Xh 14,26–29','Nước trở lại','Phần sau cuộc vượt giữ sự nghiêm trọng của trình thuật. Môsê thực hiện hành động trong nguồn; nước trở lại và dân đã qua. Game không biến cái chết thành điểm số, cuộc truy sát hoặc chiến lợi phẩm.',[21,-21]),
    beat('L01.B06','Xh 14,30–31','Nhìn lại sự cứu thoát','Bản văn khép lại bằng việc dân nhận biết điều đã xảy ra và tin vào Đức Chúa cùng Môsê, tôi trung của Người. Khoảng nhìn lại này là phần kết của chương, không bảng thành tích của người chơi.',[22,-24])
  ],discoveries:[
    discover('cloth','Mép vải trong gió',[-20,9],'[H] Vải sáng tạo mốc để người ở thấp vẫn nhìn thấy điểm tập hợp. Chi tiết giúp đọc đường, không chứng minh màu lều trong lịch sử.','cloth'),
    discover('load','Dấu tải trên nền',[-8,11],'[H] Vệt kéo không đi thẳng tới bờ: những kiện lớn cần khoảng vòng. Thử đọc một tuyến bằng dấu vật thay vì mũi tên.','supplies'),
    discover('lookout','Góc nhìn ven đá',[-24,0],'[H/C] Từ đây thấy các cụm và chỗ hội tụ. Địa hình được nén cho chơi, không xác nhận một tuyến Xuất Hành thật.'),
    discover('memory','Dấu người đi trước',[6,-15],'[H] Mốc thấp giúp nối tầm nhìn khi không thấy cả đoàn. Không vật nào trong chương được mang sang đời thường.')
  ]});
  Object.assign(d,{title:'Khoảng cách trong hang',required:true,act:2,after:5,before:6,revision:'3.0.0',returnAt:[16,15],start:[-17,15],narrator:'Damar',narration:'Ta thường nhớ lúc một người tiến lên. Tôi muốn nghe đoạn họ quay lại.',reflection:'Điều gì làm bạn dừng lại khi đã ở rất gần?',bridge:'Trở lại để nghe đúng lời hứa, giới hạn của người nhận và việc cần bàn giao. Trách nhiệm Q06 vẫn được giữ.',mapNote:'Khe đá → hai lối trong hang → quay về nhóm → bước ra đối diện → rời đi. Không xác nhận hang khảo cổ cụ thể.',steps:[
    beat('L02.B01','1 Sm 24,1–4','Một cuộc gặp trong hang','Saun tìm Đavít ở vùng En-Ghedi. Khi Saun vào hang, Đavít và người của ông ở sâu bên trong. Không gian đặt Đavít gần người đang truy đuổi mình.',[-15,12]),
    route([-11,8]),
    make('approach','Tìm đường vào và đường về','Chọn nền thấp hoặc mép vòng. Nhớ một địa vật để quay về với nhóm; bóng tối không là bài kiểm tra thị lực.',[-4,-1],'observe',{routeAt:{near:[-4,-1],overlook:[-17,-6]}}),
    make('mark','Đọc mốc trên đường về','Quan sát vệt sáng ở miệng hang và khối đá chia hai lối. Cách bố trí này do game dựng.',[-3,-7]),
    beat('L02.B02','1 Sm 24,5–6','Mảnh áo và sự hối hận','Đavít cắt vạt áo Saun rồi thấy lòng mình áy náy vì việc ấy. Cảnh giữ cả hành động và sự hối hận, không trao mảnh áo như phần thưởng cho một pha lẻn thành công.',[1,-11]),
    make('return-group','Quay lại với nhóm','Đi theo mốc đã thấy hoặc tuyến vòng. Chủ động quay lại là một phần hành trình, không cuộc chạy trốn chấm tốc độ.',[-5,-2],'observe',{routeAt:{near:[-5,-2],overlook:[-15,0]}}),
    beat('L02.B03','1 Sm 24,7–8','Giới hạn với người đi cùng','Đavít không chấp nhận ra tay với người được Đức Chúa xức dầu và ngăn người của mình tấn công Saun. Không có nhánh giết Saun hoặc nút làm đồng đội giết thay.',[-6,3]),
    make('emerge','Tìm lối bước ra','Tới khoảng sáng ngoài hang. Từ chỗ có thể ẩn mình sang chỗ được nhìn thấy, khoảng cách có ý nghĩa khác.',[5,9]),
    beat('L02.B04','1 Sm 24,9–16','Lời trước khoảng cách','Đavít bước ra và nói với Saun, cho thấy việc mình đã không giết ông. Cuộc đối diện giữ phạm vi bản văn, không thành kiểm tra thuyết phục bằng chỉ số.',[9,12]),
    beat('L02.B05','1 Sm 24,17–23','Lời đáp, cam kết và rời đi','Saun đáp lại; phần cam kết liên quan tới hậu duệ được giữ trước khi hai phía rời đi. Câu chuyện không khép bằng một lời tuyên bố rằng mọi nguy hiểm hoặc xung đột đã biến mất.',[15,14])
  ],discoveries:[
    discover('mouth','Vệt sáng miệng hang',[-10,11],'[H] Một mốc đọc được từ cả hai hướng, hữu ích khi quay về. Không phải bằng chứng xác nhận đây là hang của 1 Sm 24.'),
    discover('ledge','Mép nhìn vòng',[-18,-9],'[H] Đi xa hơn đổi góc nhìn chứ không mở một kết cục khác. Có thể dùng đường nền thấp và hỗ trợ định hướng.'),
    discover('garment','Đồ vật không phải chiến lợi phẩm',[4,-12],'[K/H] Tấm áo có vai trò trong nguồn; vị trí trưng bày ở đây là cách kể của game. Không nhặt thành loot.','cloth'),
    discover('outside','Khoảng ngoài hang',[12,7],'[H] Đứng ở đây thấy khác biệt giữa nhìn và được nhìn. Không có giáo lấy từ trình thuật chương 26.')
  ]});
  Object.assign(p,{title:'Một buổi sáng được trao lại',required:true,act:3,after:9,before:10,revision:'3.0.0',returnAt:[18,14],start:[-17,-13],narrator:'Miriam',narration:'Có những buổi sáng người ta vẫn phải ngồi lại với nhau, trước khi nhận việc tiếp.',reflection:'Bạn sẵn lòng nhận việc gì, và cần ai cùng nhận?',bridge:'Trở về cùng nhận vai có người thật đồng ý, đi thử đường bàn giao và làm điều đã nhận. Hanan không trở thành cao trào thay chương nguồn.',mapNote:'Thuyền → mặt hồ → bờ/bữa ăn → hai dải nền ven bờ → lắng nghe việc được trao. Bố cục nghệ thuật, chưa định vị bờ chính xác.',steps:[
    beat('L04.B01','Ga 21,1–3','Đêm trên hồ','Phêrô cùng những người khác ra đánh cá; đêm ấy họ không bắt được gì. Công việc chung là điểm mở của trình thuật, không một thất bại do người chơi buộc lưới chưa đủ giỏi.',[-16,-12]),
    order('net','Thu xếp dây và chỗ thao tác','Chọn thứ tự chuẩn bị, giữ chỗ và kiểm lại. Thao tác mô phỏng công việc chung; làm đúng không sinh cá trước mốc nguồn.',[-12,-11]),
    make('watch','Đổi góc nhìn từ thuyền','Đi tới đầu quan sát của vùng thuyền dựng thử. Chế độ hỗ trợ không bắt bơi, giữ thăng bằng hay bấm nhanh.',[-7,-15]),
    beat('L04.B02','Ga 21,4–8','Nhận ra trong buổi sáng','Đức Giêsu hiện diện trên bờ và hướng dẫn; các môn đệ nhận ra Người trong diễn tiến nguồn. Không có phép lạ do kỹ năng hay mức tin cậy của player kích hoạt.',[-4,-10]),
    make('land','Tới bờ cùng người khác','Theo tuyến dựng từ thuyền vào bờ. Không yêu cầu thu đủ 153 vật phẩm để qua chương.',[1,-4]),
    beat('L04.B03','Ga 21,9–14','Bữa ăn trên bờ','Bếp than, bánh và cá nằm trong cuộc gặp Đức Kitô Phục Sinh. Bữa ăn giữ ý nghĩa hiện diện và chia sẻ của nguồn; các vật tương tác chỉ giúp đọc không gian.',[5,2]),
    route([7,5]),
    make('shore-walk','Khám phá một đoạn bờ','Lối nền chắc đưa gần đồ nghề; lối ven đá đổi góc nhìn bữa ăn. Cả hai trở lại khoảng lắng.',[14,5],'observe',{routeAt:{near:[14,5],overlook:[16,-1]}}),
    beat('L04.B04','Ga 21,15–17','Trách nhiệm được trao','Cuộc đối thoại trao cho Phêrô trách nhiệm chăm sóc được giữ trong văn cảnh Phục Sinh. Game kể theo nguồn, không chế lời Đức Giêsu và không chấm tình yêu thành ba cấp.',[11,10]),
    beat('L04.B05','Ga 21,18–19','Tiếp tục theo','Đoạn nguồn còn hướng tới tương lai của Phêrô và lời gọi theo. Chương kết ở hướng đi ấy, không phong một cấp kỹ năng hoặc thẩm quyền Tông đồ cho avatar hư cấu.',[17,13])
  ],discoveries:[
    discover('rope','Chỗ dây cọ trên gỗ',[-18,-9],'[H] Đọc dấu mòn giúp hiểu vị trí làm việc cùng nhau. Mô hình không được gọi là chính thuyền Phêrô.','net'),
    discover('boat','Thuyền theo vùng và thời kỳ',[-10,-17],'[L/H] Thuyền Ginosar tại Yigal Allon Centre là tham chiếu vật thể theo niên đại rộng. Bản dựng này được thu gọn, không xác nhận danh tính thuyền.','boat'),
    discover('meal','Đồ vật quanh bữa ăn',[8,0],'[K/H] Vai trò đồ ăn theo nguồn; kiểu bát, khoảng ngồi và đường đi là dựng nghệ thuật. Không đưa vật này vào inventory Mortal.','table'),
    discover('shore','Hai dải nền bên bờ',[18,1],'[H] Có thể nhìn về công việc hoặc nhìn lại nơi cùng ngồi. Không có nhà thờ/địa danh hiện đại dùng làm bằng chứng xác định điểm bờ.')
  ]});
  for(const l of [m,d,p]){l.beats=l.steps.filter(s=>s.kind==='source').map(s=>({id:s.beat,reference:s.reference,title:s[1],text:s[2]}));l.summaryPages=l.beats;l.source='Các nhịp có phân đoạn tham chiếu giữ trình tự, chủ thể và phần kết của bản văn. Lời kể trong game là diễn ý, không trích nguyên văn một bản dịch Việt.';l.added='Đường đi, các địa vật, thao tác công cụ, nhóm nền và chuyển cảnh là sáng tác. Chưa được chuyên gia duyệt, không tự nhận phục dựng khảo cổ.';}
  D.chapters[2].legend='L01';delete D.chapters[3].legend;delete D.chapters[6].legend;D.chapters[9].legend='L04';
  D.chapters.forEach((q,i)=>{q.act=['I · Con đường chưa thấy','II · Khoảng cách phải giữ','III · Buổi sáng và việc được nhận'][Math.floor(i/4)];});
  D.spine=['L01','L02','L04'];D.version='3.0';D.release='0.2.0';D.coreRevision='3.0.0';
  root.WitnessContent=D;if(typeof module!=='undefined')module.exports=D;
})(globalThis);
