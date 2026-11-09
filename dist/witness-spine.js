(function(root){
  'use strict';
  const D=root.WitnessContent||(typeof require!=='undefined'?require('./witness-content.js'):null);
  const make=(id,title,text,at,kind='observe',extra={})=>Object.assign([id,title,text],{at,kind,...extra});
  const order=(id,title,text,at,labels=null,extra={})=>make(id,title,text,at,'order',{
    order:['prepare','secure','check'],
    orderLabels:labels||['Chuẩn bị chỗ thao tác','Giữ vật / phân người nhận','Kiểm lại trước khi tiếp tục'],
    ...extra
  });
  const route=(at,nearDesc,farDesc,extra={})=>make('route','Đọc hai lối trong không gian','Chọn tuyến khảo sát của Chứng nhân Vô danh. Cả hai đều hội tụ về mạch trình thuật Kinh Thánh; bạn vẫn tự do khám phá mọi địa vật.',at,'route',{
    choices:[
      ['near','Lối nền thấp sát đoàn',nearDesc||'Đi gần công việc cứu trợ và dấu chân người đi trước.'],
      ['overlook','Lối gờ cao quan sát',farDesc||'Vòng lên gờ đá thoáng để đọc toàn cảnh địa hình và khoảng cách.']
    ],
    ...extra
  });
  const beat=(id,ref,title,text,at,extra={})=>make('source-'+id,title,text,at,'source',{beat:id,reference:ref,...extra});
  const discover=(id,title,at,text,variant='waystone')=>({id,title,at,text,variant});

  const m=D.legends.L01,d=D.legends.L02,p=D.legends.L04;

  Object.assign(m,{
    title:'Bờ trước mặt',
    ref:'Xh 14,1–31',
    required:true,
    act:1,
    after:2,
    before:3,
    revision:'3.0.0',
    witnessRole:'Người Hộ Vệ Khóa Đuôi',
    witnessKit:'Đèn bão chắn gió · Dây chằng xe · Đòn gỗ kê trục',
    composureName:'Độ gắn kết đoàn',
    tenetId:'L01',
    returnAt:[22,-25],
    start:[-16,15],
    narrator:'Chú Natan',
    narration:'Chú nhớ một trình thuật bắt đầu ở đúng nơi người đi cuối đoàn chẳng nhìn thấy lối thoát nào trước mặt ngoài mặt nước tối.',
    reflection:'Khi chưa thấy đường mở ra phía trước, bạn chọn đứng lại hỏi han ai đang tụt lại phía sau?',
    bridge:'Trở về sân kho Xêdarê đêm đóng cửa: đặt mốc đèn khóa đuôi, kiểm người làm ca cuối và bàn giao trọn vẹn. Câu chuyện nguồn soi sáng cách bạn giữ người, không làm thay phần việc ấy.',
    mapNote:'Trại đóng đêm (S01) → Điểm tập hợp khóa đuôi (S02–S03) → Mép bờ & Cột mây (S04) → Hành lang gió đông qua biển (S05) → Bờ đông an toàn & Bình minh (S06–S07). Bố cục nghệ thuật, không định vị khảo cổ điểm vượt biển.',
    steps:[
      beat('L01.B01','Xh 14,1–10','Giữa trại đêm và tiếng quân đuổi','Đoàn dân Israel hạ trại trước biển; từ phía hoàng hôn bụi mù dâng lên khi chiến xa Ai Cập tiến gần. Trong vai Người Hộ Vệ Khóa Đuôi đứng ở rìa trại sau cùng, bạn chứng kiến nỗi kinh hoàng ập xuống cả đoàn. Bản văn không trao cho Môsê hay bất kỳ ai một lối thoát do tài thao lược quân sự.',[-15,12],{
        scene:'L01.S01–S02',
        sound:'[Tiếng gió đêm phần phật qua vải lều và tiếng bánh chiến xa vọng từ xa]'
      }),
      route([-12,8],'Đi sát dãy xe thồ lương thực để giữ nhịp cho các hộ gia đình có người già và trẻ nhỏ.','Men lên gờ đá chắn gió để đọc hướng lốc cát và tìm điểm hội tụ cho khóa đuôi.',{
        scene:'L01.S02',
        sound:'[Tiếng dây lều căng rít và tiếng gọi nhau tìm người thân trong trại]'
      }),
      make('survey','Đọc hướng gió và định vị cụm gia đình tụt lại','Quan sát vệt bánh xe lún cát và dải vải mốc sáng. Sự thấu cảm kỹ năng Quan sát giúp bạn nhận ra luồng gió đông bắt đầu đổi chiều và chỗ hai gia đình còn kẹt lại.',[-8,3],'observe',{
        scene:'L01.S03',
        routeAt:{near:[-8,3],overlook:[-24,3]},
        attune:{skill:'observe',label:'Thấu cảm Quan sát · Đọc hướng gió đông và rãnh cát cứng',effect:'Nhận diện sớm nền sỏi chịu lực cho xe thồ và giữ vững Độ gắn kết đoàn (+8).',composure:8},
        sound:'[Tiếng lừa thồ hí vang trong bụi cát và tiếng trẻ nhỏ khóc tìm mẹ]'
      }),
      order('clear','Nạy bánh xe lương thực lún cát và che chắn đàn vật','Một chiếc xe chở bột và nước uống bị sập trục xuống hố cát ướt khiến lừa thồ hoảng loạn. Hãy kê đòn gỗ, ghì dây giữ đàn vật rồi kiểm lại lối đi — thao tác của chứng nhân đời thường, không định đoạt phép lạ Kinh Thánh.',[-5,6],[
        'Kê đòn gỗ dưới trục xe đang lún (Thủ công)',
        'Ghì dây chắn đàn vật và phân người đỡ tải (Tự vệ)',
        'Kiểm lại khoảng trống cho gia đình đi cuối bước qua'
      ],{
        scene:'L01.S03',
        attune:{skill:'craft',label:'Thấu cảm Thủ công · Đệm nêm gỗ chuẩn xác dưới gầm trục',effect:'Bánh xe thoát lún êm ái không làm đổ vò nước dự trữ (+8 Độ gắn kết đoàn).',composure:8},
        sound:'[Tiếng đòn gỗ bẩy trục xe kẽo kẹt và tiếng thở phào của người đánh xe]'
      }),
      beat('L01.B02','Xh 14,10–14','Tiếng kêu sợ hãi và lời trấn an của Môsê','Dân chúng hoảng sợ kêu cứu lên Đức Chúa và trách móc Môsê giữa cơn túng quẫn. Từ mô đất phía trước, Môsê đứng vững nói lời trấn an: “Đừng sợ, cứ đứng vững mà xem ơn cứu độ Đức Chúa sẽ thực hiện hôm nay.” Lời ấy hướng trọn về hành động của Thiên Chúa, không hứa hẹn người chơi có nút điều khiển biển cả.',[-1,4],{
        scene:'L01.S02–S03',
        sound:'[Tiếng xôn xao lắng xuống trước giọng nói điềm tĩnh từ phía bờ nước]'
      }),
      make('gather','Chuyển tín hiệu đèn bão và giữ nhịp khóa đuôi','Nâng đèn dầu chắn gió làm mốc sáng nối tầm nhìn từ cụm lều cuối tới bờ biển, trấn an những người đi chậm rằng không ai bị bỏ lại phía sau.',[1,0],'observe',{
        scene:'L01.S04',
        attune:{skill:'commune',label:'Thấu cảm Giao tiếp · Trấn an các gia đình khóa đuôi',effect:'Giọng nói bình tĩnh giúp hàng người không xô đẩy nhau trước mép nước (+8 Độ gắn kết đoàn).',composure:8},
        sound:'[Tiếng bấc đèn bão cháy sáng ấm áp giữa luồng gió biển lạnh]'
      }),
      beat('L01.B03','Xh 14,15–20','Sáng kiến cứu thoát và bóng che phía sau đoàn','Đức Chúa truyền bảo dân nhổ trại tiến đi. Cột mây chuyển từ phía trước ra đứng chắn phía sau giữa trại Ai Cập và trại Israel suốt đêm tối, trong khi Môsê giơ tay trên mặt biển theo lời được trao — một hành vi vâng phục trong trình thuật, không phải kỹ năng triệu hồi.',[4,-4],{
        scene:'L01.S04',
        sound:'[Tiếng gió đông thổi mạnh suốt đêm làm mặt nước rẽ đôi ầm vang]'
      }),
      make('passage','Đọc dải đất khô vừa lộ ra giữa hai vách nước','Theo các cọc mốc và dấu chân đoàn đi trước tiến xuống lòng biển cạn sỏi đá. Không có đồng hồ đếm ngược ép ai phải bỏ người yếu để chạy thoát.',[11,-9],'observe',{
        scene:'L01.S05',
        routeAt:{near:[11,-9],overlook:[-5,-12]},
        attune:{skill:'defend',label:'Thấu cảm Tự vệ · Đi kèm mép gió chắn bọt sóng cho cụ già',effect:'Giữ nhịp bước đều đặn qua gờ đá ướt cho toán cuối cùng (+6 Độ gắn kết đoàn).',composure:6},
        sound:'[Tiếng vách nước dựng đứng rì rầm hai bên và tiếng dép da đạp trên sỏi khô]'
      }),
      beat('L01.B04','Xh 14,21–25','Con đường đất khô giữa lòng biển','Suốt đêm gió đông thổi dồn nước thành hai bức tường tả hữu; đoàn dân Israel đi qua giữa lòng biển trên đất khô, còn chiến xa quân đuổi theo tiến vào bị trật bánh nặng nề. Trải nghiệm giữ khoảng cách chứng kiến trang nghiêm, không biến biến cố thành trò bẫy chiến thuật.',[14,-14],{
        scene:'L01.S05',
        sound:'[Tiếng bước chân hàng ngàn người đi trên nền đá cạn giữa hơi sương mặn]'
      }),
      make('far-bank','Đỡ bước người cuối cùng lên dốc bờ bên kia','Đứng ở bậc đá mép bờ đông, đưa tay kéo chiếc xe nhẹ và cụ già cuối khóa đuôi lên nền đất cao an toàn trước khi quay nhìn lại.',[19,-19],'observe',{
        scene:'L01.S06',
        attune:{skill:'craft',label:'Thấu cảm Thủ công · Chèn đá giữ bánh xe trên dốc bờ đông',effect:'Cả toán khóa đuôi lên tới dốc khô nguyên vẹn (+6 Độ gắn kết đoàn).',composure:6},
        sound:'[Tiếng thở dốc nhẹ nhõm khi bàn chân chạm nền cát khô bờ bên kia]'
      }),
      beat('L01.B05','Xh 14,26–29','Mặt nước khép lại lúc rạng đông','Khi dân đã sang bờ an toàn, Môsê giơ tay theo lệnh Đức Chúa và mặt biển trở lại vị trí cũ lúc tảng sáng. Trình thuật giữ nguyên sự nghiêm trọng của Kinh Thánh: không có tiếng reo hò tính điểm hạ gục, không nhặt chiến lợi phẩm.',[21,-21],{
        scene:'L01.S06',
        sound:'[Tiếng sóng lớn khép lại trầm hùng rồi trả lại mặt biển mênh mông]'
      }),
      beat('L01.B06','Xh 14,30–31','Khoảng lặng nhận biết bên bờ sáng','Ánh bình minh chiếu trên bờ đông. Dân thấy quyền năng lớn lao Đức Chúa đã thực hiện để cứu thoát họ, lòng kính sợ và tin vào Đức Chúa cùng tôi trung Môsê. Khoảng lặng này trao lại cho bạn Nguyên lý Chứng Nhân: Lối Đi Chưa Thấy.',[22,-24],{
        scene:'L01.S07',
        sound:'[Tiếng gió sớm dịu êm trên mặt biển phẳng và nhịp thở bình an của đoàn dân]'
      })
    ],
    discoveries:[
      discover('cloth','Dải vải mốc sáng trong gió',[-20,9],'[H] Tấm vải dệt sáng buộc cao làm mốc để người đi thấp ở khóa đuôi vẫn thấy điểm hội quân. Chi tiết phục vụ đọc không gian, không khẳng định màu cờ lịch sử.','cloth'),
      discover('load','Vệt bánh xe vòng tránh hố cát',[-8,11],'[H] Vệt kéo nặng uốn vòng qua nền sỏi cứng: những xe chở người già và nước uống cần khoảng cua rộng thay vì lao thẳng.','supplies'),
      discover('lookout','Gờ đá nhìn xuống toàn đoàn',[-24,0],'[H/C] Từ mỏm đá này thấy rõ đội hình khóa đuôi nối với mô đất của Môsê phía bờ. Không gian đã được nén nghệ thuật, không định vị bản đồ Xuất Hành.'),
      discover('pillar-glow','Ranh giới sáng tối phía sau trại',[-14,16],'[K/H] Xh 14,19–20 kể cột mây đứng chắn giữa hai trại suốt đêm, bên tối bên sáng — game thể hiện bằng dải sương sáng trang nghiêm phía hậu cảnh.','lamp'),
      discover('memory','Cọc mốc người đi trước cắm lại',[6,-15],'[H] Dấu mốc thấp nối tầm nhìn giữa sương nước mù mịt. Không một vật phẩm nào trong chương nguồn được mang sang túi đồ đời thường.'),
      discover('dry-ridge','Sống đá khô giữa lòng nước',[15,-18],'[K/H] Xh 14,21–22 nhấn mạnh nền đất khô giữa biển; gờ sỏi đá ở đây giúp người chơi cảm nhận bước chân vững chãi của đoàn dân.','cairn')
    ]
  });

  Object.assign(d,{
    title:'Khoảng cách trong hang',
    ref:'1 Sm 24,1–23',
    required:true,
    act:2,
    after:5,
    before:6,
    revision:'3.0.0',
    witnessRole:'Người Trinh Sát Đội Đavít',
    witnessKit:'Dây thừng leo vách · Bầu nước da · Dép êm đi đá',
    composureName:'Kỷ luật im lặng',
    tenetId:'L02',
    returnAt:[16,15],
    start:[-17,15],
    narrator:'Damar',
    narration:'Người đời hay kể lúc một chiến binh rút gươm lao tới. Tôi muốn nghe đoạn khó hơn nhiều: lúc họ nắm chặt cán gươm rồi tự dừng tay lại.',
    reflection:'Điều gì giữ bàn tay bạn dừng lại khi người từng gây hại đang ở ngay trong tầm với?',
    bridge:'Trở về Galilê với câu chuyện của Miriam và Sela: giữ khoảng lùi tôn trọng, nghe đúng giới hạn của người nhận và bàn giao minh bạch. Trách nhiệm từ Q06 vẫn nguyên vẹn.',
    mapNote:'Hẻm núi Dê Rừng (S01) → Lòng hang đá vôi hai tầng (S02–S03) → Góc khuất vạt áo & Kìm giữ đồng đội (S04–S05) → Miệng hang rực nắng & Lời đối diện qua thung lũng (S06–S07). Không gán với một hang khảo cổ cụ thể.',
    steps:[
      beat('L02.B01','1 Sm 24,1–4','Bước chân vua Saun tiến vào hang tối','Saun đem ba ngàn quân tinh nhuệ truy lùng Đavít trên vùng đá Dê Rừng hoang địa En-Ghedi. Khi Saun một mình bước vào đúng cửa hang nơi Đavít và toán người của ông đang ẩn sâu bên trong, bóng tối đá vôi bỗng đặt kẻ bị săn đuổi sát cạnh người truy sát mình.',[-15,12],{
        scene:'L02.S01–S02',
        sound:'[Tiếng đá sỏi lạo xạo ngoài hẻm núi nắng gắt và tiếng giọt nước dội âm trong vòm hang]'
      }),
      route([-11,8],'Men theo hốc đá thấp sát vách ẩm để giữ hơi thở êm cạnh toán hộ tống.','Leo lên gờ đá vòng trên cao để đọc luồng sáng miệng hang và bố trí dây dẫn rút lui.',{
        scene:'L02.S02',
        sound:'[Tiếng áo giáp đồng chạm khẽ ngoài cửa hang làm cả toán nín thở]'
      }),
      make('approach','Đọc âm học vòm đá và buộc dây dẫn đường rút','Trong vòm đá vôi kín, chỉ một viên sỏi lăn cũng dội tiếng vang tới cửa hang. Hãy quan sát luồng sáng và định vị mốc quay về cho cả toán mà không biến bóng tối thành bài thi thị lực.',[-4,-1],'observe',{
        scene:'L02.S03',
        routeAt:{near:[-4,-1],overlook:[-17,-6]},
        attune:{skill:'observe',label:'Thấu cảm Quan sát · Đọc hốc tiêu âm trên vách đá vôi',effect:'Tìm được gờ đá phẳng không có sỏi rời cho cả toán di chuyển êm (+8 Kỷ luật im lặng).',composure:8},
        sound:'[Tiếng gió luồn qua khe nứt trên trần hang cao rít nhẹ]'
      }),
      order('mark','Giăng dây mốc an toàn và ra hiệu giữ trật tự cho toán','Những người đi cùng bắt đầu thì thầm giục Đavít tận dụng cơ hội ra tay. Trong vai trinh sát giữ sườn, hãy cố định dây dẫn trên gờ đá, ra hiệu hạ thấp vũ khí và kiểm lại lối lùi.',[-3,-7],[
        'Cố định đầu dây gai vào mỏm đá chắc (Thủ công)',
        'Chạm vai đồng đội ra hiệu giữ nhịp thở êm (Giao tiếp)',
        'Kiểm lại vệt sáng miệng hang làm mốc quay lui'
      ],{
        scene:'L02.S03',
        attune:{skill:'craft',label:'Thấu cảm Thủ công · Quấn vải lót nút dây không phát tiếng động',effect:'Đường dây dẫn hướng căng êm dọc vách trong (+8 Kỷ luật im lặng).',composure:8},
        sound:'[Tiếng dây gai siết êm vào mỏm đá và tiếng thở nén lại trong bóng râm]'
      }),
      beat('L02.B02','1 Sm 24,5–6','Mảnh vạt áo choàng và nỗi áy náy lương tâm','Giữa tiếng người đi cùng thúc giục, Đavít lặng lẽ tiến lại cắt lấy một chéo vạt áo choàng của Saun. Nhưng ngay sau đó lòng Đavít bồn chồn áy náy vì đã chạm tới áo của người được Đức Chúa xức dầu. Mảnh vải được giữ như dấu chứng tự giới hạn, tuyệt đối không phải chiến lợi phẩm của một pha ám sát lén lút.',[1,-11],{
        scene:'L02.S04',
        sound:'[Tiếng lưỡi dao lướt khẽ qua sợi len thô rồi dừng hẳn trong im lặng]'
      }),
      make('return-group','Lùi êm về vị trí toán và kìm tay đồng đội nóng nảy','Một người lính trẻ cạnh bạn siết chặt cán gươm định lao lên khi thấy Saun chưa hay biết. Hãy đặt tay giữ cổ tay anh ta lại và dẫn nhau lùi êm về hốc đá sâu.',[-5,-2],'observe',{
        scene:'L02.S04–S05',
        routeAt:{near:[-5,-2],overlook:[-15,0]},
        attune:{skill:'defend',label:'Thấu cảm Tự vệ & Giao tiếp · Đặt tay chặn cán gươm đồng đội',effect:'Cơn bốc đồng lắng xuống mà không phát ra một tiếng chạm kim loại nào (+10 Kỷ luật im lặng).',composure:10},
        sound:'[Tiếng thì thầm dứt khoát trong hốc đá giữ cho lưỡi gươm nằm yên trong vỏ]'
      }),
      beat('L02.B03','1 Sm 24,7–8','Lời nghiêm cấm của Đavít giữ ranh giới cho cả toán','Đavít nói rõ với người của mình rằng xin Đức Chúa đừng để ông ra tay hại đấng đã được xức dầu, rồi dùng lời lẽ kiềm chế không cho phép bất kỳ ai tấn công Saun. Vua Saun đứng dậy rời hang bình an. Không tồn tại nhánh rẽ lịch sử thay thế hay nút bấm ra đòn.',[-6,3],{
        scene:'L02.S05',
        sound:'[Tiếng bước chân Saun rời khỏi cửa hang bước ra nắng chói ngoài hẻm núi]'
      }),
      make('emerge','Bước từ bóng tối lòng hang ra gờ đá sáng ngoài thung lũng','Theo sau Đavít tiến ra khoảng nắng rực rỡ ở cửa hang En-Ghedi. Từ chỗ ẩn mình nắm thế chủ động bước ra nơi đứng dưới ánh sáng đối diện, khoảng cách giữa hai sườn núi mang một phẩm giá hoàn toàn khác.',[5,9],'observe',{
        scene:'L02.S06',
        attune:{skill:'commune',label:'Thấu cảm Giao tiếp · Giữ thế đứng mở, không giương vũ khí phía sau Đavít',effect:'Làm rõ thiện chí hòa giải của toán người trên gờ đá sáng (+6 Kỷ luật im lặng).',composure:6},
        sound:'[Tiếng gió sa mạc khô nóng ùa tới cùng ánh nắng trắng trên vách đá vôi]'
      }),
      beat('L02.B04','1 Sm 24,9–16','Lời lên tiếng giữa khoảng cách hai sườn đá','Đavít bước ra gọi theo Saun, nghiêng mình kính cẩn và giơ vạt áo choàng làm bằng chứng rằng ông đã ở sát bên mà từ chối giết vua, đặt sự phân xử lại trong tay Đức Chúa. Cuộc đối thoại giữ trọn văn cảnh Kinh Thánh, không quy thành chỉ số thuyết phục của người chơi.',[9,12],{
        scene:'L02.S06',
        sound:'[Giọng nói vang rõ qua lòng khe núi tĩnh lặng giữa hai sườn đá]'
      }),
      beat('L02.B05','1 Sm 24,17–23','Giọt nước mắt nhìn nhận, lời thề và hai ngả đường rời đi','Saun xúc động bật khóc nhận ra Đavít đã lấy điều lành đáp trả điều dữ, rồi xin lời cam kết không tuyệt diệt dòng dõi mình trước khi Saun trở về nhà còn Đavít cùng người của ông rút lên đồn núi hiểm. Câu chuyện không tô hồng rằng hiểm nguy truy đuổi sẽ biến mất vĩnh viễn, nhưng khắc sâu Nguyên lý Chứng Nhân: Ranh Giới Quyền Lực.',[15,14],{
        scene:'L02.S07',
        sound:'[Tiếng gió chiều ngân dài qua thung lũng đá khi hai đoàn người tách về hai hướng]'
      })
    ],
    discoveries:[
      discover('mouth','Khe sáng cửa hang đá vôi',[-10,11],'[H] Luồng sáng tự nhiên giúp định hướng cả lối vào lẫn lối rút về mà không cần mũi tên chỉ đường nhân tạo. Không xác nhận đây là hang lịch sử duy nhất của 1 Sm 24.'),
      discover('ledge','Gờ đá vòng tầng trên',[-18,-9],'[H] Tuyến trinh sát trên cao đổi góc quan sát âm học lòng hang chứ không mở ra một kết cục bạo lực thay thế.'),
      discover('water-spring','Mạch nước rỉ trên vách En-Ghedi',[-14,2],'[L/H] Ốc đảo En-Ghedi nổi tiếng bởi các mạch suối đá vôi giữa hoang địa Giuđa; tiếng giọt nước nhỏ đều tạo nền âm thanh che tiếng thở của toán người.','cairn'),
      discover('garment','Chéo vạt áo — dấu chứng tự giới hạn',[4,-12],'[K/H] Trong bản văn 1 Sm 24,5–12, mảnh áo là bằng chứng Đavít đã dừng tay kèm nỗi áy náy sâu sắc; không phải vật phẩm chiến lợi phẩm để thu nhặt.','cloth'),
      discover('scabbard','Giá tựa gậy và bao gươm đóng kín',[-8,-5],'[H] Hình ảnh những lưỡi gươm nằm yên trong vỏ nhắc nhớ kỷ luật kiềm chế của cả toán người đi cùng Đavít.','stakes'),
      discover('outside','Mỏm đá nắng ngoài hẻm núi',[12,7],'[H] Đứng nơi ánh sáng chiếu thẳng mới cảm nhận trọn vẹn sự can đảm của người từ bỏ lợi thế ẩn kích. Tuyệt đối không trộn lẫn chi tiết cây giáo của 1 Sm 26.')
    ]
  });

  Object.assign(p,{
    title:'Một buổi sáng được trao lại',
    ref:'Ga 21,1–19',
    required:true,
    act:3,
    after:9,
    before:10,
    revision:'3.0.0',
    witnessRole:'Người Phụ Lưới Hồ Galilê',
    witnessKit:'Lưới và dây mạn · Đèn dầu mũi thuyền · Dây kéo mạn',
    composureName:'Nhịp đồng tâm',
    tenetId:'L04',
    returnAt:[18,14],
    start:[-17,-13],
    narrator:'Miriam',
    narration:'Có những buổi sáng sau một đêm thức trắng chẳng được gì, người ta cần ngồi xuống bên bếp than ấm cùng nhau trước khi dám nhận lại một phần việc mới.',
    reflection:'Sau những lần lỡ dở hay mỏi mệt, bạn sẵn lòng nhận lại phần việc nhỏ nào, và cần ai cùng giữ bếp với mình?',
    bridge:'Trở về bến Xêdarê (Q11–Q12): xác nhận lại phạm vi đồng ý của từng nhân chứng, diễn tập đường đi an toàn và chia nhau giữ bếp hậu kiểm sau lời chứng.',
    mapNote:'Mạn thuyền đêm trên hồ Têbêria (S01–S02) → Mẻ lưới rạng đông & Bờ sỏi cạn (S03–S04) → Bếp than hồng, bánh và cá (S05) → Dải bờ lặng lẽ & Ba lần trao sứ vụ chăm sóc (S06–S07). Bố cục nghệ thuật, không định vị địa danh đền thờ hiện đại.',
    steps:[
      beat('L04.B01','Ga 21,1–3','Đêm trắng tay trên mặt hồ Têbêria','Simôn Phêrô cùng Tôma, Nathanaen, hai người con ông Dêbêđê và các bạn chài xuống thuyền ra khơi; nhưng suốt đêm ấy họ vất vả thả lưới mà không bắt được con cá nào. Trong vai Người Phụ Lưới giữ mạn thuyền, bạn sẻ chia cái mỏi nhừ của đôi tay ướt lạnh — đây là điểm mở của trình thuật, không phải lỗi thao tác kém của người chơi.',[-16,-12],{
        scene:'L04.S01',
        sound:'[Tiếng mái chèo gỗ khua nước đêm tĩnh mịch và tiếng lưới ướt kéo lên mạn thuyền rỗng]'
      }),
      order('net','Gỡ rối mép lưới và thu xếp dây mạn thuyền','Giữa hơi sương lạnh cuối canh tư, tấm lưới trammel vướng rong và xoắn dây chì. Hãy rũ sạch rong, xếp lại phao bần và kiểm dây kéo mạn để giữ Nhịp đồng tâm của anh em trên thuyền — làm chuẩn không tự sinh ra cá trước mốc nguồn.',[-12,-11],[
        'Rũ rong và gỡ lớp lưới mắt nhỏ bị xoắn (Thủ công)',
        'Xếp đều dây chì và phao bần dọc be thuyền (Quan sát)',
        'Kiểm lại chạc chèo cùng bạn thuyền chờ rạng sáng (Giao tiếp)'
      ],{
        scene:'L04.S02',
        attune:{skill:'craft',label:'Thấu cảm Thủ công · Gỡ nút thắt dây chì bằng tay quen việc bến',effect:'Các mép lưới được trải phẳng gọn gàng, giữ ấm tinh thần cả thuyền (+8 Nhịp đồng tâm).',composure:8},
        sound:'[Tiếng phao gỗ chạm nhẹ vào ván thuyền sồi và tiếng nước rỏ đều xuống lòng thuyền]'
      }),
      make('watch','Đứng ở mũi thuyền đọc làn sương rạng đông dần tan','Bước lên mũi thuyền gỗ nhìn về dải bờ sỏi xám đang ửng hồng ánh hừng đông. Chế độ hỗ trợ luôn giữ bước chân vững vàng, không đòi hỏi giữ thăng bằng hay bấm phím liên hồi.',[-7,-15],'observe',{
        scene:'L04.S02–S03',
        attune:{skill:'observe',label:'Thấu cảm Quan sát · Nhận ra bóng Người đứng tĩnh lặng trên bờ sớm',effect:'Ánh nhìn tập trung hướng cả thuyền về phía tiếng gọi ấm áp từ bờ (+8 Nhịp đồng tâm).',composure:8},
        sound:'[Tiếng gió hừng đông làm tan lớp sương mù mỏng trên mặt hồ phẳng lặng]'
      }),
      beat('L04.B02','Ga 21,4–8','Tiếng gọi lúc tảng sáng và lời nhận ra: “Chúa đó!”','Khi trời vừa hửng sáng, Đức Giêsu đứng trên bãi nhưng các môn đệ chưa nhận ra. Theo lời chỉ dẫn thả lưới bên phải mạn thuyền, mẻ cá đầy tràn tới mức không kéo lên nổi; người môn đệ Đức Giêsu yêu mến thốt lên với Phêrô: “Chúa đó!” Phêrô khoác áo nhảy xuống nước vào bờ trước, còn bạn cùng các anh em trên thuyền con chèo kéo tấm lưới cá vào bãi cách bờ khoảng hai trăm thước.',[-4,-10],{
        scene:'L04.S03–S04',
        sound:'[Tiếng nước tung trắng xóa bên mạn phải và tiếng reo nghẹn ngào giữa ánh bình minh]'
      }),
      make('land','Phụ ghì dây kéo mẻ lưới lớn vào bãi sỏi nông','Bì bõm trên làn nước cạn ấm nắng sớm, phối hợp từng nhịp kéo đều với các môn đệ để đưa tấm lưới trăm năm mươi ba cá lớn vào bờ mà lưới không hề rách. Không có trò đếm nhặt đủ 153 món đồ để qua màn.',[1,-4],'observe',{
        scene:'L04.S04',
        attune:{skill:'defend',label:'Thấu cảm Tự vệ & Thủ công · Chịu lực đều ở giềng lưới chính',effect:'Cả toán kéo lưới lên sỏi êm ái, giữ trọn Nhịp đồng tâm (+10).',composure:10},
        sound:'[Tiếng sỏi cuội lạo xạo dưới chân và tiếng cá quẫy khỏe trong làn nước trong]'
      }),
      beat('L04.B03','Ga 21,9–14','Bếp than hồng, bánh nướng và lời mời ăn buổi sáng','Bước lên bờ, mọi người thấy có sẵn bếp than hồng với cá đang nướng và bánh mì. Đức Giêsu bảo đem thêm cá vừa bắt được tới, rồi chính Người cầm lấy bánh và cá trao cho họ ăn giữa buổi sáng trang nghiêm thinh lặng — không ai dám hỏi “Ông là ai?”, vì đều biết rõ là Chúa.',[5,2],{
        scene:'L04.S05',
        sound:'[Tiếng than hồng nổ lép bép dịu ấm và hương bánh nướng lan nhẹ trong gió hồ]'
      }),
      route([7,5],'Men theo dải sỏi thấp thu dọn giỏ lưới để giữ khoảng riêng tư trang nghiêm cho cuộc trò chuyện phía trước.','Bước chậm lên gờ đá thoai thoải nhìn bao quát bếp than hồng và mặt hồ sáng trong.',{
        scene:'L04.S06',
        sound:'[Tiếng sóng hồ buổi sớm vỗ êm đềm vào bờ cát sỏi]'
      }),
      make('shore-walk','Lùi lại ở khoảng cách chứng kiến đầy tôn kính bên bờ hồ','Trong vai người phụ lưới vô danh, bạn không chen vào giữa cuộc đối thoại thiêng liêng mà lặng lẽ xếp gọn mái chèo từ xa, lắng nghe bằng sự thấu cảm khiêm nhường.',[14,5],'observe',{
        scene:'L04.S06',
        routeAt:{near:[14,5],overlook:[16,-1]},
        attune:{skill:'commune',label:'Thấu cảm Giao tiếp · Giữ khoảng lặng tôn nghiêm bên rìa bãi',effect:'Sự hiện diện khiêm cung kết nối trọn vẹn tâm thế chứng nhân (+6 Nhịp đồng tâm).',composure:6},
        sound:'[Tiếng gió mai khẽ lay rặng sậy ven hồ trong khoảng lặng sau bữa ăn]'
      }),
      beat('L04.B04','Ga 21,15–17','Ba lần hỏi và trách nhiệm chăn dắt đoàn chiên được trao lại','Sau bữa ăn sáng, Đức Giêsu ba lần hỏi Simôn con ông Gioan về tình yêu mến và ba lần trao phó cho ông sứ mạng: “Hãy chăn dắt chiên của Thầy.” Game trình bày trung thành theo mạch nguồn Phục Sinh: không tự bịa lời thoại mới gán cho Đức Giêsu, không biến tình yêu thành thanh điểm ba cấp.',[11,10],{
        scene:'L04.S06',
        sound:'[Giọng trao gửi trầm ấm vang nhẹ bên bờ hồ giữa ánh nắng mai trong trẻo]'
      }),
      beat('L04.B05','Ga 21,18–19','Lời báo trước đường hy sinh và tiếng gọi: “Hãy theo Thầy”','Trình thuật mở ra chặng đường tương lai khi Phêrô sẽ giang tay để người khác thắt lưng dẫn đi, và khép lại bằng lời mời gọi dứt khoát: “Hãy theo Thầy.” Chương kết ở hướng bước đi ấy — không phong chức Tông đồ cho nhân vật người chơi, nhưng khắc ghi Nguyên lý Chứng Nhân: Sứ Vụ Được Trao Lại.',[17,13],{
        scene:'L04.S07',
        sound:'[Tiếng bước chân đi dọc bờ hồ sáng rực mở ra hành trình trở về với đời sống]'
      })
    ],
    discoveries:[
      discover('rope','Vết dây thừng mòn bóng trên be thuyền',[-18,-9],'[H] Rãnh gỗ nhẵn bóng cho thấy bao đêm nhiều bàn tay đã cùng tì vai kéo lưới tại đúng vị trí này. Mô hình thuyền mang tính tham khảo nghệ thuật, không tự nhận là di vật của Phêrô.','net'),
      discover('boat','Dáng thuyền đánh cá Galilê thế kỷ I',[-10,-17],'[L/H] Tham chiếu tỷ lệ thân thuyền gỗ Ginosar (khoảng 8,2m × 2,3m, bốn tay chèo và sàn lái) theo niên đại rộng thế kỷ I TCN – thế kỷ I SCN, dựng tối giản phục vụ trải nghiệm.','boat'),
      discover('net-weights','Chì lưới và phao bần xếp gọn',[-3,-3],'[H] Mép lưới, quả nặng và phao được xếp riêng để người phụ nhìn rõ đường dây. Ga 21 không xác định cấu tạo lưới; bố trí ngư cụ ở đây là mô hình sáng tác.','supplies'),
      discover('meal','Bếp than hồng, bánh và cá trên bãi đá',[8,0],'[K/H] Hình ảnh bếp than hồng (anthrakia trong Ga 21,9) gợi chiều sâu hoà giải sau đêm tối; không một vật nào quanh bữa ăn được nhặt thành tài nguyên đời thường.','table'),
      discover('reeds','Rặng sậy chắn gió đầu bãi',[13,-4],'[H] Vùng nước nông có sậy mọc giúp thuyền nhỏ cặp bãi êm mà không va đáy gỗ vào đá ngầm.','cairn'),
      discover('shore','Hai bậc thềm sỏi ven bờ hồ',[18,1],'[H] Khoảng đứng lùi cho phép chứng nhân nhìn lại bếp than ấm và mặt hồ rộng mà không áp đặt công trình kiến trúc thời sau lên cảnh Kinh Thánh.')
    ]
  });

  for(const l of [m,d,p]){
    l.beats=l.steps.filter(s=>s.kind==='source').map(s=>({id:s.beat,reference:s.reference,title:s[1],text:s[2],scene:s.scene||null}));
    l.summaryPages=l.beats;
    l.source='Các nhịp có phân đoạn tham chiếu giữ nguyên trình tự, chủ thể thiêng liêng và phần kết của bản văn Kinh Thánh. Lời kể trong game là diễn ý tôn kính, không trích nguyên văn bản dịch thương mại và không tự chế lời thoại trực tiếp gán cho Đức Giêsu.';
    l.added='Góc nhìn Chứng nhân Vô danh (Dual-Tier Persona), đường khảo sát hai lối, sự thấu cảm 4 kỹ năng đời thường, nhịp gắn kết nhóm và các địa vật không gian là phần chuyển thể nghệ thuật (v3.1). Chưa qua hội đồng chuyên gia duyệt, không tự nhận phục dựng khảo cổ.';
  }

  D.chapters[2].legend='L01';delete D.chapters[3].legend;delete D.chapters[6].legend;D.chapters[9].legend='L04';
  D.chapters.forEach((q,i)=>{q.act=['I · Con đường chưa thấy','II · Khoảng cách phải giữ','III · Buổi sáng và việc được nhận'][Math.floor(i/4)];});
  D.spine=['L01','L02','L04'];D.version='3.0';D.release='0.5.0';D.coreRevision='3.0.0';
  root.WitnessContent=D;if(typeof module!=='undefined')module.exports=D;
})(globalThis);
