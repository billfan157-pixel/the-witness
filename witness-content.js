(function (root) {
  'use strict';
  const skills = {
    observe: {
      id: 'observe',
      name: 'Quan sát',
      subtitle: 'Đọc dấu vết, địa hình và mạch nguồn',
      tiers: [
        'Bậc I · Nhận ra mép giấy dán, vết kéo hàng và hướng gió cơ bản.',
        'Bậc II · Đọc sớm dòng chảy ngầm, độ vang vòm đá và điểm mù giữa hai sổ ghi.',
        'Bậc III · Thấu suốt chuỗi chứng cứ độc lập và nhận biết nhịp biến chuyển của cả không gian.'
      ],
      attunement: 'Trong Legends: đọc sớm hướng gió đông (L01), độ dội âm vách đá En-Ghedi (L02) và luồng nước rạng đông trên hồ (L04).'
    },
    craft: {
      id: 'craft',
      name: 'Thủ công',
      subtitle: 'Chèn tải, buộc dây neo và sửa ngư cụ',
      tiers: [
        'Bậc I · Biết kê đòn bẩy cơ bản, chằng kiện hàng và bọc vải chống ẩm.',
        'Bậc II · Nạy trục xe lún bùn, đóng chốt neo vách đá và gỡ mép lưới vững tay.',
        'Bậc III · Phối hợp gia cố tải nặng trong mưa lũ hoặc sóng lớn mà không làm đứt dây.'
      ],
      attunement: 'Trong Legends: nạy bánh xe lương thực lún cát (L01), giăng dây dẫn đường mỏm cao (L02) và gỡ rối mép lưới (L04).'
    },
    commune: {
      id: 'commune',
      name: 'Giao tiếp',
      subtitle: 'Lắng nghe giới hạn, giữ lời và trấn an',
      tiers: [
        'Bậc I · Hỏi đúng điều người đối diện muốn giữ kín trước khi xin lời chứng.',
        'Bậc II · Giữ nhịp bình tĩnh cho gia đình hoảng sợ và thì thầm kìm cơn nóng giận của đồng đội.',
        'Bậc III · Nối lại sự đồng tâm giữa những người đang kiệt sức mà không hứa thay phần họ.'
      ],
      attunement: 'Trong Legends: trấn an các gia đình khóa đuôi (L01), giữ kỷ luật im lặng trong hang (L02) và bắt nhịp chèo đồng tâm (L04).'
    },
    defend: {
      id: 'defend',
      name: 'Tự vệ',
      subtitle: 'Giữ thế đứng, che chắn và biết dừng đúng lúc',
      tiers: [
        'Bậc I · Giữ khoảng cách an toàn bằng gậy đi đường và mở lối lùi cho người yếu.',
        'Bậc II · Cản gia súc hoảng loạn, giữ tay đồng đội khỏi lưỡi kiếm và chịu sức nặng mạn thuyền.',
        'Bậc III · Đứng vững ở điểm khóa đuôi trước sức ép lớn mà không biến tự vệ thành trừng phạt.'
      ],
      attunement: 'Trong Legends: chắn đà lừa thồ hoảng sợ (L01), ngăn đồng đội rút gươm trong hang tối (L02) và ghì dây kéo mẻ lưới nặng (L04).'
    }
  };

  const kit = [
    {id:'kitbag',name:'Túi dụng cụ con thoi',slot:1,detail:'Đựng chốt gỗ, kim khâu lưới và nêm kê tải nhỏ gọn bên hông.'},
    {id:'lamp',name:'Đèn dầu chắn gió',slot:2,detail:'Ngọn bấc nhỏ giữ mốc nhìn trong sương sớm, hốc đá hoặc sân kho lúc đóng cửa.'},
    {id:'rope',name:'Cuộn dây neo gai',slot:3,detail:'Dùng chằng kiện hàng, làm dây dẫn bờ sạt và giữ khoảng cách an toàn khi kéo tải.'},
    {id:'wrap',name:'Vải lanh bọc khô',slot:4,detail:'Phủ kín biên nhận gốc và đệm chỗ dây tì để không cứa vào tay người được kéo.'},
    {id:'tablet',name:'Thẻ ghi và bút sậy',slot:5,detail:'Ghi tách biệt mã lô, lượng thực nhận và phạm vi đồng ý của từng nhân chứng.'},
    {id:'sandals',name:'Dép da khâu kép',slot:6,detail:'Đế êm giúp bước nhẹ trên đá vôi, bến gỗ ướt và đường đồi nhiều sỏi.'}
  ];

  const tenets = {
    L01: {
      id: 'L01',
      title: 'Lối Đi Chưa Thấy',
      subtitle: 'Nguyên lý Chứng Nhân · Hồi I (Xuất Hành 14)',
      witnessRole: 'Người Hộ Vệ Khóa Đuôi',
      summary: 'Khi trước mặt là mặt nước khép kín và phía sau là tiếng đuổi gấp, người giữ khóa đuôi không bỏ mặc người chậm chân để chạy lấy phần an toàn trước.',
      mortalChapter: 'Q04',
      resonanceTitle: 'Nhịp đèn khóa đuôi đêm đóng kho',
      resonance: 'Nhờ ký ức đứng ở khóa đuôi đoàn dân tại bờ biển, trong đêm kho Xêdarê đóng cửa (Q04), bạn biết cách đặt mốc đèn nối tầm nhìn từ góc khuất cuối sân tới cổng phụ để không một người làm ca muộn nào bị bỏ sót trước khi chọn tải lên xe.'
    },
    L02: {
      id: 'L02',
      title: 'Ranh Giới Quyền Lực',
      subtitle: 'Nguyên lý Chứng Nhân · Hồi II (1 Samuel 24)',
      witnessRole: 'Người Trinh Sát Đội Đavít',
      summary: 'Ở đủ gần để ra tay không đồng nghĩa với việc có quyền tước đoạt phẩm giá hay quyết định thay số phận của người khác.',
      mortalChapter: 'Q07',
      resonanceTitle: 'Khoảng lùi tôn trọng trong lời hứa gia đình',
      resonance: 'Nhờ ký ức giữ nhịp thở im lặng trong hang En-Ghedi và nhìn Đavít tự giới hạn mình trước Saun, khi bước vào cuộc thương lượng giữa Miriam và Sela (Q07), bạn biết lùi đúng một bước để người trong cuộc tự nói thật giới hạn của mình mà không dùng áp lực tình cảm ép lời hứa.'
    },
    L04: {
      id: 'L04',
      title: 'Sứ Vụ Được Trao Lại',
      subtitle: 'Nguyên lý Chứng Nhân · Hồi III (Gioan 21)',
      witnessRole: 'Người Phụ Lưới Hồ Galilê',
      summary: 'Sau một đêm trắng tay trên mặt hồ lạnh, công việc chăm sóc nhau được trao lại bên bếp than hồng buổi sớm chứ không đòi hỏi quá khứ không tì vết.',
      mortalChapter: 'Q11',
      resonanceTitle: 'Bếp chung và phần việc được chia sau lời chứng',
      resonance: 'Nhờ ký ức gỡ lưới lúc rạng đông và ngồi bên bếp than trên bờ hồ Galilê, khi chuẩn bị kế hoạch cuối tại Xêdarê (Q11–Q12), bạn biết chăm lo bữa ăn và phân vai giữ lửa hậu kiểm để cộng đoàn vẫn sống tiếp vững vàng sau khi lời chứng được nói ra.'
    }
  };

  const people = {
    natan: {
      name:'Natan', role:'Thợ đóng thuyền lão thành', model:'elder', color:'#aa9072', place:'Xưởng bên bến',
      register:'Chú – Con',
      detail:'Người bạn lâu năm của cha bạn tại xưởng gỗ Xêdarê. Ông giữ lời hứa trao lại sổ gia đình cho con của Haddai và chỉ kể đúng phần mắt mình đã thấy tại bến.',
      topics:[
        {id:'father-hands',label:'Hỏi chú Natan về thói quen làm việc của cha',minChapter:0,line:'“Cha con có tật hay nắn lại mối dây neo hai lần trước khi cho thuyền hạ thủy. Bởi vậy khi nghe người ta đồn ông ấy cẩu thả lấy bớt bốn bao lương, chú biết câu chuyện còn chỗ khuất chưa ai chịu kiểm.”'},
        {id:'harbor-shift',label:'Hỏi về nhịp ca thợ bến lúc giao mùa',minChapter:2,line:'“Bến cảng không dừng vì một đám tang đâu con. Muốn giữ người làm công khỏi bị chèn ép, con phải hiểu sổ ca viết gì và ai là người cầm chìa khóa cổng phụ lúc chạng vạng.”'}
      ]
    },
    miriam: {
      name:'Miriam', role:'Người chăm sóc bữa chung', model:'woman', color:'#657e77', place:'Sân bữa chung',
      register:'Tôi – Bạn (Chị – Em với Sela)',
      detail:'Lo từng suất ăn cho thợ nghèo và gia đình thiếu gạo quanh cảng. Cô tận tụy tới mức quen gánh thay phần việc của em trai Sela, và đang học cách để người khác tự chọn phần trách nhiệm của họ.',
      topics:[
        {id:'soup-pot',label:'Hỏi Miriam về những người chờ bữa chiều',minChapter:1,line:'“Một bao hạt trên giấy chỉ là một con số, nhưng ở sân này nó là mười tám bát cháo nóng cho người gác đêm và mấy bà cụ không còn sức ra bến.”'},
        {id:'sela-worry',label:'Hỏi về nỗi lo dành cho em trai Sela',minChapter:4,line:'“Em ấy cứ bảo: ‘Chị đừng hứa cả tuần thay em.’ Tôi biết Sela nói đúng, nhưng nhìn bàn tay em còn phồng rộp vì kéo dây, tôi lại sợ nói thật sẽ làm em bỏ cuộc.”'}
      ]
    },
    damar: {
      name:'Damar', role:'Người giữ đường hộ tống', model:'man', color:'#9b6d54', place:'Lối ra bến',
      register:'Tôi – Bạn',
      detail:'Thông thuộc các tuyến đồi giữa Xêdarê và Galilê, giỏi che chắn cho người đi cùng. Một cơn nóng giận năm xưa khiến anh luôn dè chừng chính sức mạnh của đôi tay mình.',
      topics:[
        {id:'staff-weight',label:'Hỏi Damar vì sao luôn nhìn lối thoát trước',minChapter:3,line:'“Cây gậy đi đường sinh ra để dò đá sạt và đỡ người trượt chân. Lúc người ta nhìn nó như vũ khí trước tiên, tức là họ đã quên đường rút an toàn rồi.”'},
        {id:'old-debt',label:'Hỏi về mái nhà anh từng làm hỏng trong quá khứ',minChapter:5,line:'“Có những vết nứt người ta chỉ cần mình góp gỗ sửa lại rồi lặng lẽ bước đi, chứ không cần mình đứng trước cửa bắt họ phải nói lời tha thứ.”'}
      ]
    },
    lea: {
      name:'Lea', role:'Người học chép văn thư', model:'woman', color:'#6a7187', place:'Bàn đối chiếu',
      register:'Tôi – Anh/Chị',
      detail:'Tỉ mỉ với từng nét mực sậy và dấu niêm đất sét. Cô từng tin một bản ghi hoàn hảo sẽ tự minh oan cho mọi người, cho tới khi nhận ra con chữ không thể tự che chở người có tên trên giấy.',
      topics:[
        {id:'ink-layers',label:'Hỏi Lea cách phân biệt hai lớp mực sửa',minChapter:3,line:'“Mực pha muội đèn mới bao giờ cũng đọng dày ở mép sợi cói đã xước. Nhưng thấy vết sửa chỉ cho biết tờ giấy từng bị chạm vào, chưa cho phép ta điền tên kẻ gian theo ý mình.”'},
        {id:'blank-line',label:'Hỏi về những khoảng trống phải để nguyên',minChapter:7,line:'“Khi nước cuốn nhòe một dòng chữ, điều trung thực nhất người chép sổ làm được là ghi rõ: ‘Ba chữ không đọc được’. Đừng bao giờ lấy lòng tốt để bịa thêm nét mực.”'}
      ]
    },
    titus: {
      name:'Titus', role:'Thợ sửa trục và ròng rọc', model:'man', color:'#a18c5d', place:'Xưởng sửa bến',
      register:'Tôi – Bạn',
      detail:'Thợ cơ khí lành nghề tại bến tàu, luôn muốn tự tay vặn chặt mọi con chốt vì sợ người học việc làm hỏng. Nhân vật hư cấu thế kỷ I, không phải thánh Titô trong Tân Ước.',
      topics:[
        {id:'pulley-load',label:'Hỏi Titus về cách chia lực trên ròng rọc',minChapter:2,line:'“Một sợi dây đơn dù bện kỹ tới đâu cũng có ngưỡng đứt. Muốn nâng khung gỗ sồi ướt, phải chia tải qua hai con lăn và tin người giữ đầu dây bên kia.”'},
        {id:'apprentice',label:'Hỏi về người thợ trẻ đang xin học nghề',minChapter:6,line:'“Cậu ấy gọt chốt hơi lệch một ly. Tôi cứ muốn giật lấy cái đục làm luôn cho nhanh, nhưng chú Natan bảo ngày xưa tôi cũng làm gãy ba cái nêm trước khi đóng thẳng được một cái.”'}
      ]
    },
    yosef: {
      name:'Yosef', role:'Người khuân bao ca chiều', model:'man', color:'#8d795b', place:'Lối sau kho',
      detail:'Trực tiếp vác các bao hàng qua cổng phụ. Anh muốn nói điều đúng sự thật nhưng cần giữ yên sinh kế và căn phòng trọ thấp nơi mẹ già đang nghỉ.',
      topics:[
        {id:'mother-plant',label:'Hỏi thăm chỗ ở và mẹ của Yosef',minChapter:1,line:'“Mẹ tôi chỉ có chậu bạc hà đặt bên bệ cửa sổ. Nếu phải dọn đi trong đêm mà không ai báo trước, bà sẽ thức trắng vì tưởng tôi vừa gây họa ở bến.”'}
      ]
    },
    rina: {
      name:'Rina', role:'Người coi nồi bữa chung', model:'woman', color:'#9c7664', place:'Sân bữa chung',
      detail:'Đong đếm từng đấu bột qua số bữa thực nấu mỗi chiều. Bà thẳng tính, có uy tín trong xóm thợ và sẵn sàng đếm lại từ đầu nếu thấy nghi ngờ.',
      topics:[
        {id:'measure-bowl',label:'Hỏi Rina cách đong phần ăn lúc thiếu hàng',minChapter:0,line:'“Gáo gỗ của sân bếp mòn vẹt hai mươi năm nay nhưng chưa từng đong gian cho ai. Thiếu hai bao là thiếu đúng hai nồi chiều, không sổ sách nào che được cái bụng đói.”'}
      ]
    },
    mattai: {
      name:'Mattai', role:'Người giữ cổng kho', model:'man', color:'#746a55', place:'Cổng kho',
      detail:'Ghi sổ bàn giao từng ca trực ở cổng kho Xêdarê. Ông nguyên tắc, kiệm lời, nhưng khi kho sắp đóng cửa vẫn tự cầm đèn đi rà lại góc tối tìm người kẹt lại.',
      topics:[
        {id:'night-latch',label:'Hỏi Mattai về nguyên tắc khóa then cổng phụ',minChapter:3,line:'“Then sắt chỉ cài khi người cuối cùng trong ca đã ký nhận ra ngoài. Ai bảo tôi mở sân phụ giữa ca đều phải để lại dấu ca trực trong sổ riêng của tôi.”'}
      ]
    },
    amon: {
      name:'Amon', role:'Người đánh xe tuyến đồi', model:'man', color:'#886c50', place:'Trạm chuyển hàng',
      detail:'Chở chuyến hàng G17 vượt đồi tới Galilê và ghi riêng hai bao rách do mưa. Ông coi mạng sống của cậu học việc đi theo xe quý hơn mọi biên nhận.',
      topics:[
        {id:'hill-rain',label:'Hỏi Amon về cơn mưa trên đường chở lô G17',minChapter:2,line:'“Đoạn dốc đá trơn như đổ mỡ, hai bao ngoài rìa bị cành gai quệt rách lúc ghì phanh. Tôi đã lập biên bản hỏng ngay tại trạm với người làm chứng, không mập mờ một hạt.”'}
      ]
    },
    hanan: {
      name:'Hanan', role:'Người điều phối kho phân phối', model:'man', color:'#566975', place:'Sân phân phối',
      detail:'Từng thức trắng giữ kho vượt qua mùa khan hiếm năm ngoái, nhưng dần tự cho mình quyền tự ý chuyển hướng hàng dự trữ mà không hỏi cộng đoàn.',
      topics:[
        {id:'reserve-logic',label:'Nghe Hanan giải thích chuyện giữ quyền điều phối',minChapter:4,line:'“Ai cũng đòi minh bạch ngay lập tức, nhưng lúc thuyền ngũ cốc trễ hẹn ba tuần liền thì chính những khoản tôi tự giữ lại mới cứu cái sân này khỏi vỡ trận.”'}
      ]
    },
    sela: {
      name:'Sela', role:'Em trai của Miriam', model:'man', color:'#89917a', place:'Sân nhận ca',
      detail:'Trẻ tuổi nhưng tự trọng, muốn chị gái nói thẳng sự thật để tự nhận lấy một ca làm vừa đúng sức mình thay vì bị che chắn như trẻ nhỏ.',
      topics:[
        {id:'one-shift',label:'Hỏi Sela về phần việc cậu muốn tự nhận',minChapter:6,line:'“Em không gánh nổi cả tuần như chị Miriam, nhưng một ca khuân lưới buổi sớm thì em làm trọn được. Chỉ cần chị ấy đừng giấu em chuyện trong nhà.”'}
      ]
    },
    recipient: {name:'Người giữ sân', role:'Người nhận hàng Galilê', model:'woman', color:'#866b55', detail:'Trực tiếp đếm mười tám bao G17 nhập vào sân chia bữa Galilê và vẫn phải tranh thủ vá lưới kiếm sống cho ngày mai.'},
    enforcer: {name:'Người áp tải', role:'Người giữ thẻ giao sân phụ', model:'man', color:'#715449', detail:'Từng dùng gậy xô ngã Haddai trong một cuộc cãi vã ở kho. Việc giữ thẻ đối chiếu không tự xóa đi trách nhiệm về vết thương cũ ấy.'},
    witness1: {name:'Người nhận lệnh', role:'Nhân chứng trực tiếp', model:'woman', color:'#8a836b', detail:'Tận tai nghe chỉ dẫn mở sân phụ cho bốn bao hàng, nhưng giữ toàn quyền quyết định lời mình được đọc ở đâu và có nêu tên hay không.'},
    witness2: {name:'Người thợ', role:'Nhân chứng hỗ trợ', model:'man', color:'#657c80', detail:'Sẵn lòng chỉ đường kiểm nguồn vật chất trong khả năng của mình; lòng tốt ấy không cho ai quyền mượn tên anh vượt quá điều anh biết.'},
    keeper: {name:'Người giữ gói gửi', role:'Thợ lưu trữ Giêrusalem', model:'elder', color:'#907d66', detail:'Giữ nguyên niêm phong gói thư của Haddai suốt nhiều tháng và chỉ trao lại khi kiểm đúng mã nhận diện.'}
  };

  const regions = {
    caesarea:{name:'Xêdarê',subtitle:'Đường người đi, đường hàng đi',base:'andrew',biome:'shore',art:'land-city.jpg',ambient:'[Tiếng sóng đập kè đá cảng Xêdarê và tiếng ròng rọc gỗ kéo tải]'},
    road:{name:'Ngoài thành Xêdarê',subtitle:'Một dấu chân không kể hết một chuyến đi',base:'neighbor',biome:'road',art:'land-dawn.jpg',ambient:'[Tiếng gió lùa qua bụi gai khô và tiếng bánh xe gỗ lăn trên đá dăm]'},
    galilee:{name:'Galilê',subtitle:'Đời sống không đứng chờ người hùng',base:'loaves',biome:'shore',art:'land-lake.jpg',ambient:'[Tiếng nước hồ vỗ nhẹ vào sỏi cuội và tiếng thoi gỗ đan lưới]'},
    ravine:{name:'Tuyến đồi Galilê',subtitle:'Điều có thể giữ, điều phải buông',base:'mount',biome:'hill',art:'land-lake.jpg',ambient:'[Tiếng nước lũ rào rạt dưới khe đá và tiếng dây gai căng tải]'},
    jerusalem:{name:'Giêrusalem',subtitle:'Những điều người ta chưa sẵn lòng nói',base:'sent',biome:'courtyard',art:'land-city.jpg',ambient:'[Tiếng bước chân trên sân đá vôi và tiếng gió chiều qua hành lang hẹp]'}
  };

  const evidence = {
    E01:{name:'Biên nhận gốc G17',kind:'physical',lineage:'original-receipt',chain:'origin-sign',text:'Haddai thực sự ký nhận đủ. Chữ ký chưa cho biết bốn bao đã đi đâu.',quest:'Q04',sourceNote:'Chứng từ vật chất gốc do chú Natan giữ khô.'},
    E02:{name:'Mép sổ B06 đã sửa',kind:'physical',lineage:'b06-register',chain:'b06-paper',text:'Một mảnh dán che lớp ghi cũ. Có sửa chữa, chưa biết người sửa.',quest:'Q02',sourceNote:'Quan sát trực tiếp trên sổ bàn ghi B06.'},
    E03:{name:'Lượng nhận ở bữa chung',kind:'statement',lineage:'rina-b06',chain:'b06-kitchen',consentActor:null,text:'Rina xác nhận lượt B06 thiếu hai bao so với ghi nhận.',quest:'Q02',sourceNote:'Đối chiếu độc lập từ nồi bữa thực nấu của Rina.'},
    E04:{name:'Ghi tuyến và hai bao hỏng',kind:'physical',lineage:'amon-transit',chain:'g17-transit',text:'24 bao G17 rời kho; hai bao hỏng được ghi riêng trên tuyến.',quest:'Q03',sourceNote:'Sổ vận chuyển của Amon trên tuyến đồi.'},
    E05:{name:'Biên nhận tại Galilê',kind:'physical',lineage:'galilee-receipt',chain:'g17-destination',text:'Sân chia bữa nhận 18 bao G17. Không phải tất cả sáu bao chênh lệch đều bị chuyển sai.',quest:'Q05',sourceNote:'Xác nhận đầu nhận độc lập tại làng chài Galilê.'},
    E06:{name:'Thẻ bốn bao ở sân phụ',kind:'physical',lineage:'side-yard-token',chain:'g17-sideyard',text:'Bốn bao G17 được ghi tại sân phụ. Dấu dùng chung chưa tự xác định người ra lệnh.',quest:'Q06',sourceNote:'Thẻ kiểm sân phụ có dấu kho dùng chung.'},
    E07:{name:'Bản phụ qua nước',kind:'physical',lineage:'transit-copy',chain:'g17-transit',copyOf:'E04',text:'Một bản đối chiếu được mang qua tuyến đồi. Phần không đọc được phải được để trống.',quest:'Q08',sourceNote:'Bản sao làm việc cùng nhánh vận chuyển với E04 — không tính là nguồn độc lập thay cho đầu nhận.'},
    E08:{name:'Bản sửa của Haddai',kind:'statement',lineage:'haddai-correction',chain:'haddai-letter',text:'Haddai nhận đã ký trước khi kiểm đủ và đề nghị kiểm hai khoản riêng. Ông đã cố sửa sai.',quest:'Q10',sourceNote:'Thư tự nhận lỗi gửi niêm phong tại Giêrusalem.'},
    E09:{name:'Lời người trực tiếp nhận lệnh',kind:'statement',lineage:'direct-witness',chain:'order-witness',consentActor:'witness1',text:'Một người xác nhận đã nghe chỉ dẫn từ Hanan. Phạm vi sử dụng do người ấy quyết định.',quest:'Q09',sensitive:true,sourceNote:'Lời chứng nhạy cảm — phụ thuộc phạm vi đồng ý của nhân chứng.'},
    E10:{name:'Sổ bàn giao ca của Mattai',kind:'physical',lineage:'mattai-shift',chain:'order-counter',text:'Ghi ca độc lập về lần mở sân theo chỉ dẫn, được Mattai đối chiếu với việc trực tiếp nghe.',quest:'Q11',sourceNote:'Sổ trực cổng độc lập của Mattai tại Xêdarê.'}
  };

  const claims = {
    P01:{title:'Lượt B06 không khớp',requires:['E02','E03'],text:'Lượt nhận tại Xêdarê thiếu hai bao so với sổ. Chưa đủ xác định người chịu trách nhiệm cuối.',scopeHint:'Tách riêng vụ thiếu hai bao ở bữa chung B06 khỏi chuyến hàng G17 đi Galilê.'},
    P02:{title:'G17 còn bốn bao chưa giải trình',requires:['E04','E05'],text:'24 bao xuất, 18 nhận, hai bao hỏng có ghi. Còn bốn bao cần giải trình.',scopeHint:'Cần hai đầu xuất (E04) và nhận (E05) độc lập; bản phụ E07 cùng nhánh vận chuyển không thể tự thay thế E05.'},
    P03:{title:'Phần trách nhiệm của Haddai',requires:['E01','E08','E04','E05'],text:'Haddai đã ký trước khi kiểm đủ. Chưa có căn cứ quy toàn bộ phần thiếu cho việc ông lấy hàng.',scopeHint:'Áp dụng cùng một thước đo trung thực cho cả người cha đã khuất.'},
    P04:{title:'Chỉ dẫn chuyển bốn bao',requires:['E06','E04','E05'],any:['E09','E10'],text:'Hai nguồn độc lập cùng đối chiếu cho thấy Hanan chỉ dẫn chuyển bốn bao ra ngoài phân phối.',scopeHint:'Đòi hỏi thẻ sân phụ (E06) kết hợp với lời chứng đúng phạm vi đồng ý (E09) hoặc sổ ca độc lập của Mattai (E10).'}
  };

  const node = (id,name,at,model='table',person=null,extra={}) => ({id,name,at,model,person,...extra});
  const task = (id,target,title,text,needs=[],extra={}) => ({id,target,title,text,needs,...extra});

  const chapters = [
    {id:'Q01',title:'Bến không chờ người về',region:'caesarea',companion:'titus',companionLine:'Titus đang kiểm lại ròng rọc gần xưởng chú Natan.',act:'I · Những cái tên còn ở lại',lead:'Bạn trở lại Xêdarê sau khi cha mất. Bến cảng vẫn làm việc. Chú Natan đang gồng vai giữ một khung hàng sắp nghiêng chắn lối mang bữa chiều.',quiet:'Tiếng đục gỗ dừng một nhịp. Chú Natan kể về một chuyến thuyền bình thường hai người từng đóng chung, từ trước khi tên cha con gắn với vụ thiếu hàng.',quietScene:{sound:'[Tiếng nước biển vỗ nhẹ vào chân cọc gỗ xưởng thuyền]',body:'Trên băng ghế cạnh xưởng, chú Natan đặt mảnh bào gỗ thơm mùi tuyết tùng xuống cạnh bát nước mát: “Cha con hồi trẻ hay ngồi đúng chỗ này gọt lại mái chèo bị nứt. Chú cháu mình hít một hơi gió biển cho dịu vai đã, rồi tính tiếp việc tối nay.”'},nodes:[node('load','Khung hàng nghiêng',[-10,6],'supplies'),node('natan','Xưởng Natan',[-5,-1],'elder','natan',{pose:'watch'}),node('rina','Bữa chiều',[8,4],'woman','rina',{work:true}),node('lodging','Góc bàn có đèn',[15,-6],'table'),node('gate','Lối sau kho',[20,7],'gate')],tasks:[
      task('brace','load','Giải phóng lối chuyển bữa','Chú Natan đang giữ tải. Một đòn kê đúng chỗ hoặc hai người cùng nâng đều có thể mở lối.',[],{puzzle:'brace',skill:'craft',success:'Khung hàng đứng vững. Lối mang bữa đã mở; chú Natan có thể buông tay xoa lại bả vai.'}),
      task('ledger','natan','Nhận sổ từ chú Natan','“Chú đã hứa với cha con sẽ đưa tận tay cuốn sổ này cho người nhà. Tờ bìa còn dính hơi ẩm trong túi vải; để chú hong khô nó cho con.”',['brace'],{speaker:'natan',skill:'observe',evidence:null,success:'Bạn nhận sổ hộ gia đình từ tay chú Natan. Một dòng ghi nhận đủ hàng có nét chữ quen của cha, nhưng còn phải tìm bản gốc.'}),
      task('meal','rina','Nghe việc còn thiếu trong bữa','“Chỗ nghỉ ở đây có thể đơn sơ, nhưng vẫn có chỗ cho người mới về. Tôi cần thêm dầu thắp cho lượt nấu sau.”',['ledger'],{speaker:'rina',skill:'commune'}),
      task('choose','lodging','Chọn phần việc tối nay','Bạn còn đủ cho một tiện ích: góc bàn riêng để chép, hoặc góp dầu cho bữa chung. Cả hai đều có chỗ ngủ cơ bản.',['meal'],{choices:[['lodging','Thuê góc bàn có đèn','Bạn có nơi sao giấy và gửi thư kín.'],['meal','Góp dầu cho bữa chung','Bạn ngủ ở chỗ chung; một người nhận ca sẽ giúp mở cổng sau.']],plan:true})
    ],execution:{lodging:[task('pay-lodging','lodging','Nhận bàn và bàn giao tiền','Đặt phần tiền đã dành, trải tấm vải khô và cất sổ gia đình khỏi gió biển.',[],{commit:true,skill:'observe'})],meal:[task('give-oil','rina','Đưa dầu tới bữa chung','Bạn cùng Rina châm đèn cho lượt bữa tiếp theo. Một người nhận ca nhờ bạn gọi nếu cần giữ cổng.',[],{commit:true,skill:'commune'})]},ending:{lodging:'Góc bàn sáng còn chỗ cho trang giấy chưa có câu trả lời.',meal:'Nồi bữa được đậy lại. Một người bạn mới nhận ca để người khác có thể nghỉ.'}},

    {id:'Q02',title:'Những tên không được đọc',region:'caesarea',companion:'miriam',companionLine:'Miriam đứng gần sân bếp, lo lắng cho sự an toàn của người khuân bao hơn là tốc độ phá án.',act:'I · Những cái tên còn ở lại',lead:'Hôm nay bữa chung thiếu hai bao. Sổ lại ghi đủ. Miriam muốn tìm điều đã xảy ra mà không biến một người đang sợ thành công cụ.',quiet:'Mẹ người chuyển bao hỏi ai sẽ trông chậu cây nếu phải rời đi. Một nơi trú còn là những điều nhỏ họ phải bỏ lại.',quietScene:{sound:'[Tiếng lá bạc hà lay nhẹ bên bệ đá và tiếng bước chân thợ tan ca]',body:'Bên ghế đá góc sân, Miriam gấp lại tấm khăn phủ giỏ bánh: “Người ta hay nghĩ làm chứng là đứng giữa sân nói thật to. Nhưng nhiều khi giữ được một mái hiên yên cho bà cụ ngủ trọn đêm mới là điều khó nhất.”'},legend:'L03',veil:'V01',nodes:[node('miriam','Sân chăm sóc',[-8,5],'woman','miriam',{pose:'talk'}),node('register','Bàn ghi B06',[-5,-2],'scroll'),node('rina','Chỗ nhận bữa',[6,3],'woman','rina',{work:true}),node('yosef','Lối sau kho',[5,-10],'man','yosef',{pose:'watch'}),node('trail','Dấu tuyến G17',[15,-10],'supplies'),node('shelter','Sân nhận người',[16,7],'shelter'),node('intermediary','Người nhận bản',[21,-1],'man','mattai'),node('rest','Chỗ nghỉ bên sân',[-13,-8],'bench'),node('gate','Đường ngoài thành',[22,10],'gate')],tasks:[
      task('opening','miriam','Hỏi chuyện bữa hôm nay','“Trước khi hỏi tên ai, hãy nghĩ xem sáng mai người ấy còn phải bước qua cánh cổng này để kiếm sống thế nào.”',[],{speaker:'miriam',skill:'commune'}),
      task('patch','register','Xem lớp ghi dưới mép dán','Một đường mực bị che dưới mép giấy. Quan sát lớp nào ở trên, lớp nào có trước.',['opening'],{puzzle:'patch',skill:'observe',evidence:'E02',success:'Bạn xác nhận có sửa ghi trên sổ B06. Chưa xác định người sửa hay động cơ.'}),
      task('meal-count','rina','Đối chiếu lượng thực nhận','Rina chỉ hai vệt bao sạch: “Tôi nhận từng ấy. Không biết thiếu trước hay sau cổng.”',['opening'],{evidence:'E03',speaker:'rina',skill:'observe'}),
      task('meet','yosef','Gặp người chuyển bao','“Tôi chỉ vác bao qua cánh cửa kia theo ca. Chừng ấy là điều tôi biết.”',['patch','meal-count'],{speaker:'yosef',skill:'commune',choices:[['listen','Anh muốn tôi giữ kín điều gì?','“Tên tôi. Và chỗ mẹ tôi đang ở.”'],['demand','Tôi cần anh đứng ra xác nhận.','“Còn tôi cần trở lại làm việc sáng mai mà không bị chặn ở cửa.”'],['pressure','Nếu anh không nói, người khác có thể bị đổ lỗi.','“Đừng đưa nỗi sợ ấy sang tôi rồi gọi là lựa chọn.”']]}),
      task('repair-pressure','yosef','Nhận lại phần áp lực đã gây','“Anh nói đúng. Tôi đã ép anh. Tôi xin rút lại câu vừa rồi, và anh có toàn quyền từ chối.”',['meet'],{when:'pressure',skill:'commune',success:'Lời xin lỗi đã được nghe. Ký ức về áp lực còn đó; bạn phải làm đúng bảo đảm đã nói.'}),
      task('needs','yosef','Hỏi giới hạn và điều người ấy cần','“Chỉ nói trong nhóm tiếp nhận đáng tin. Đừng đưa chỗ mẹ tôi ở vào bất kỳ tờ giấy nào.”',['meet'],{when:'needs',speaker:'yosef',skill:'commune'}),
      task('trail','trail','Kiểm dấu tuyến ở sân phụ','Dấu G17 chỉ một tuyến hàng trước kia tới Galilê. Nó không phải lượt B06 hôm nay.',['meet'],{skill:'observe'}),
      task('choose','miriam','Chọn cách bảo vệ lời chứng','Chọn một kế hoạch rồi tự thực hiện. Nêu tên chỉ trong phạm vi người ấy tự nguyện cho phép.',['trail','needs'],{plan:true,choices:[['shelter','Đưa người chuyển bao và mẹ tới nơi trú','Giữ lời kể riêng, dùng phần dự trữ cho việc di chuyển.'],['anonymous','Gửi dữ kiện đã bỏ tên qua trung gian','Giám sát kho bắt đầu sớm, nhưng người chuyển bao còn cần được bảo vệ.'],['consented','Xin lời chứng trong nhóm có bảo vệ','Cần hết áp lực, có nơi nhận và để người ấy tự nói.']]})
    ],execution:{
      shelter:[task('shelter-arranged','shelter','Bố trí chỗ nhận người','Rina nhờ kiểm cửa vào và chỗ nghỉ trước khi gọi hai mẹ con tới.'),task('supplies','rina','Dành phần bữa cho việc chuyển nơi','Tách phần dự trữ khỏi bữa hôm nay; ghi đúng người giữ.',['shelter-arranged'],{puzzle:'supplies',skill:'craft'}),task('escort','yosef','Đi cùng tới nơi trú','Giữ gần người bạn đang đưa đi. Có thể dừng và chờ nhau.',['supplies'],{escort:true,destination:'shelter',skill:'defend'}),task('handoff','shelter','Bàn giao với người nhận','Người nhận xác nhận có đủ chỗ và bữa. Lời kể vẫn ở trong nhóm.',['escort'],{commit:true})],
      anonymous:[task('redact','register','Chuẩn bị bản ẩn danh','Giữ mã B06 và số nhận. Loại tên, địa chỉ, mô tả có thể tìm lại người.',[],{puzzle:'redact',skill:'observe'}),task('deliver','intermediary','Trao bản dữ kiện đã bỏ tên','Bạn trao bản B06 chỉ có lượng và dấu sửa. Không đọc lời riêng như lời công khai.',['redact'],{commit:true})],
      consented:[task('shelter-arranged','shelter','Bố trí nơi nhận và người đi cùng','Chỗ trú và người nhận được xác nhận trước khi hỏi đồng ý.'),task('consent','yosef','Để người chuyển bao tự quyết','“Chỉ trong nhóm đang ngồi ở đó. Không trước cả sân.”',['shelter-arranged'],{puzzle:'consent',skill:'commune'}),task('escort','yosef','Đi cùng tới cuộc gặp','Bạn cùng đi tới nơi đã có người nhận, không tự nói thay.',['consent'],{escort:true,destination:'shelter',skill:'defend'}),task('handoff','shelter','Hoàn tất bàn giao lời chứng','Người chuyển bao tự nói trong cuộc gặp có giới hạn. Đây chưa phải quyền nêu tên ở sân chung.',['escort'],{commit:true})]
    },ending:{shelter:'Chỗ chờ sau kho trống. Người nhận cho biết hai người đã có nơi nghỉ.',anonymous:'Có kiểm lượng ở kho. Người chuyển bao vẫn chưa thể yên tâm; bạn còn một việc bảo vệ phải làm.',consented:'Một người tự nói tên trong nhóm mình chọn. Bạn đã thực hiện bảo đảm trước khi lấy lời chứng.'}},

    {id:'Q03',title:'Một bao thiếu, ba người nhớ',region:'road',companion:'damar',companionLine:'Damar đi dọc mép rãnh cạn, kiểm độ chắc của đất đá trước mỗi khúc cua.',act:'I · Những cái tên còn ở lại',lead:'Theo tuyến ngoài thành, bạn gặp những lời nhớ không khớp. Amon đang sửa phương tiện trước chuyến mới. Một loại dây có thể đi qua nhiều tay.',quiet:'Amon chỉ một mối nối sắp bung cho người học việc. Ông cũng từng nhìn sót chính chỗ ấy.',quietScene:{sound:'[Tiếng gió chiều thổi qua cỏ khô ven đường lữ hành]',body:'Amon ngồi tựa bánh xe gỗ, đưa bầu nước cho cậu học việc uống trước: “Đi đường đồi sợ nhất là lúc tưởng mình nhớ hết ổ gà. Hai người nhớ lệch ngày nhau chưa chắc có ai gian dối, chỉ là mỗi người nhớ cái dốc làm mình đau lưng nhất thôi.”'},nodes:[node('route','Ngã tuyến hàng',[-9,5],'waystone'),node('bridge','Lối qua rãnh',[-3,-3],'stakes'),node('amon','Trạm Amon',[7,-6],'man','amon',{work:true}),node('record','Ghi tuyến G17',[14,-9],'tablet'),node('shelter','Chỗ nhận người',[6,9],'shelter'),node('gate','Đường về kho',[21,4],'gate')],tasks:[
      task('protect','shelter','Hoàn tất bảo vệ còn dang dở','Nếu đã gửi bản ẩn danh, việc giám sát chưa thay được nơi trú. Bố trí người nhận trước khi đi xa.',[],{when:'anonymous-unprotected',skill:'defend'}),
      task('trace','route','Theo ba dấu của tuyến','Vết kéo, nút dây và lời người giao cùng chỉ một sân. Nút dây được bán ở nhiều nơi.',[],{puzzle:'trace',skill:'observe'}),
      task('bridge','bridge','Chọn lối qua rãnh','Sửa và thử tải để có đường dùng lại, hoặc vòng đồi tới trạm.',['trace'],{skill:'craft',choices:[['repair','Sửa và thử tải','Lối này có thể thành đường rút khi kho đóng.'],['detour','Đi đường vòng an toàn','Bạn đến trạm qua lối dài hơn, không phải liều qua ván yếu.']]}),
      task('choose','amon','Thỏa thuận xem ghi tuyến','“Tôi mở sổ ngay nếu có người trả phần công giữ ca. Hoặc giúp tôi thay chốt trục rồi cùng xem.”',['bridge'],{speaker:'amon',plan:true,choices:[['paid','Trả công để xem ngay','Giữ được lượt làm việc còn lại; dùng một phần nguồn thường.'],['worked','Giúp thay chốt rồi xem','Mất một lượt công có báo trước, không mất nguồn bắt buộc.']]})
    ],execution:{paid:[task('records','record','Đối chiếu ghi xuất và ghi hỏng','24 bao rời kho. Hai bao hỏng có ghi riêng, chưa thể quy tất cả phần thiếu cho việc lấy hàng.',[],{evidence:'E04',puzzle:'count',skill:'observe',commit:true})],worked:[task('repair-cart','amon','Thay chốt và thử tải','Đặt chốt mới, kê phương tiện rồi mới tháo phần chịu lực.',[],{puzzle:'brace',skill:'craft'}),task('records','record','Đọc ghi tuyến cùng Amon','Hai người đang nhớ hai ngày khác nhau. Đối chiếu ngày làm rõ mâu thuẫn, không cần chọn ai là người nói dối.',['repair-cart'],{evidence:'E04',puzzle:'count',skill:'observe',commit:true})]},ending:{paid:'Bạn có bản đối chiếu và một khoản công đã trả rõ.',worked:'Phương tiện chạy lại. Amon hẹn sẽ giúp nếu nhóm cần người giữ dây.'}},

    {id:'Q04',title:'Đêm kho đóng cửa',region:'caesarea',companion:'titus',companionLine:'Titus và chú Natan đang giữ đèn ở mép sân kho chờ lượt kiểm người cuối cùng.',act:'I · Những cái tên còn ở lại',tenet:'L01',lead:'Kho sẽ đóng sau lượt bàn giao. Cần mở lối, đưa người ra và chọn phần tăng thêm mà chiếc xe còn mang được.',quiet:'Mattai quay lại kiểm góc tối sau khi sân vắng. Người giữ cửa cũng đang tìm người còn mắc lại.',quietScene:{sound:'[Tiếng then sắt chạm nhẹ vào khung gỗ và tiếng gió biển đêm]',body:'Dưới ngọn đèn bên sân, Mattai phủi bụi vôi trên chùm chìa khóa: “Làm nghề gác cổng người ta hay nhớ lúc mình đóng cửa, ít ai để ý lúc mình cầm đèn đi gọi người ngủ quên sau đống bao tải.”'},veil:'V02',nodes:[node('mattai','Cổng có người trực',[-8,5],'man','mattai',{pose:'watch'}),node('gatework','Then phụ',[-1,-3],'barrier'),node('people','Điểm tập hợp',[7,4],'camp'),node('cargo','Xe sắp đầy',[13,-5],'supplies'),node('natan','Chú Natan và tờ bìa',[17,-10],'elder','natan',{pose:'talk'}),node('rest','Đèn bên sân',[-12,-8],'lamp'),node('gate','Đường đi Galilê',[23,8],'gate')],tasks:[
      task('closure','mattai','Nhận bàn giao trước giờ đóng','“Cho tôi biết còn ai trong sân. Đã mở lối nào thì phải có người đứng nhận ở đầu lối ấy.”',[],{speaker:'mattai',skill:'commune'}),
      task('open','gatework','Mở lối an toàn','Xin người nhận mở cổng hoặc chèn tải trước khi tháo then phụ.',['closure'],{puzzle:'brace',skill:'craft'}),
      task('people','people','Đưa người ra điểm an toàn','Bạn cùng người nhận ca kiểm lại lượt cuối ở khóa đuôi sân kho. Không ai bị bỏ lại để chở thêm đồ.',['open'],{skill:'defend',tenetNote:'L01'}),
      task('choose','cargo','Chọn tải tăng thêm','Sau khi người đã ra hết an toàn, xe chỉ còn chỗ cho thực phẩm dự phòng hoặc bộ neo và dây tốt hơn.',['people'],{plan:true,tenetNote:'L01',choices:[['food','Chở thực phẩm dự phòng','Giảm công huy động bữa khi trở về, dùng neo cơ bản trên đường.'],['tools','Chở bộ neo và dây tốt','Có cách chuẩn bị cứu hộ khác trên tuyến đồi, cần bù dự trữ khi trở về.']]})
    ],execution:{food:[task('load','cargo','Xếp phần thực phẩm lên xe','Đặt vào phần tải đã kiểm, ghi rõ nơi nhận.',[],{skill:'craft'}),task('signature','natan','Nhận phần gốc đã làm khô','“Chú nhận ra nét chữ của cha con, nhưng hàng đã tới đủ hay chưa thì chú không biết.” Chữ ký là thật; phần còn lại vẫn phải kiểm.',['load'],{evidence:'E01',speaker:'natan',commit:true})],tools:[task('load','cargo','Xếp bộ neo và dây lên xe','Kiểm cuộn dây gai và chốt neo trước khi chằng tải.',[],{skill:'craft'}),task('signature','natan','Xem chữ ký trên phần gốc','Chú Natan đặt túi vải khô cạnh bạn: “Chú cũng ước mình có một điều nhẹ lòng hơn để trao cho con đêm nay.”',['load'],{evidence:'E01',speaker:'natan',commit:true})]},ending:{food:'Phần dự trữ lên đường. Chữ ký cha là thật; câu chuyện chưa thể khép lại bằng hai chữ vô tội.',tools:'Bộ neo đã được giữ lại. Bạn lên đường với một bằng chứng làm mọi việc khó hơn.'}},

    {id:'Q05',title:'Lưới rách còn người vá',region:'galilee',companion:'lea',companionLine:'Lea mở sẵn hai cột sổ trắng bên mép sân phơi lưới để tách số thực đếm khỏi lời đồn.',act:'II · Điều một người giữ lại',lead:'Làng chài vẫn cần sửa lưới, chia bữa và đi làm. Người nhận hàng chỉ có thể kể lượng mình thực nhận. Hanan muốn giữ quyền điều phối.',quiet:'Người vá lưới mời bạn thử một nút rồi tháo ra làm lại. Một việc hỏng chưa nói hết về người làm.',quietScene:{sound:'[Tiếng thoi gỗ luồn qua mắt lưới gai và tiếng chim bói cá ngoài mặt hồ]',body:'Người phụ nữ coi sân đưa cho bạn con thoi gỗ nhẵn bóng: “Thắt sai một mắt lưới thì tháo nút ấy ra đan lại, đừng vội cắt phăng cả tấm lưới mà mất buổi chài sáng mai.”'},nodes:[node('net','Sân vá lưới',[-9,5],'net'),node('recipient','Người giữ sân',[-2,-3],'woman','recipient',{work:true}),node('cloth','Vải vá bao',[6,4],'cloth'),node('hanan','Sân Hanan',[14,-5],'man','hanan',{pose:'talk'}),node('record','Bàn đối chiếu',[14,6],'table'),node('gate','Lối sân đá',[22,9],'gate')],tasks:[
      task('work','net','Cùng sửa một phần lưới','Công việc mưu sinh vẫn tiếp tục trong khi chờ lượt chia hàng.',[],{puzzle:'rope',skill:'craft'}),
      task('received','recipient','Xác nhận lượng hàng thực đến','“Mười tám bao đúng số đã đong. Tôi không biết sáu bao khác ở đâu.” Hai bao hỏng đã có nguồn riêng.',['work'],{evidence:'E05',speaker:'recipient',skill:'observe'}),
      task('cloth','cloth','Kiểm dấu vải thường dùng','Cùng loại vải thô có ở nhiều nhà quanh hồ. Dấu vải không chứng minh ai lấy hàng.',['received'],{skill:'observe'}),
      task('hanan','hanan','Nghe người đang điều phối','“Nếu kho ngừng hôm nay, ai mang bữa tới cho xóm lưới?” Hanan đang thật sự giúp dỡ hàng, rồi đòi giữ trọn quyền mở kho.',['cloth'],{speaker:'hanan',skill:'commune'}),
      task('choose','record','Chọn cách trình chênh lệch','Bạn có thể công khai con số đúng phạm vi hoặc đối chiếu riêng. Chưa có đủ nguồn gọi tên thủ phạm.',['hanan'],{plan:true,choices:[['open_audit','Mời kiểm lượng công khai','Phân phối chậm một lượt; mọi người thấy rõ lý do.'],['private_check','Đối chiếu riêng trước','Giữ nhịp chia bữa; Hanan biết bạn đã kiểm tới đây.']]})
    ],execution:{open_audit:[task('audit','recipient','Mời cùng kiểm, chỉ trình số đã biết','24 xuất, 18 nhận, hai hỏng có ghi: bốn bao chưa giải trình. Không đọc tên người chưa cho phép.',[],{puzzle:'count',skill:'commune',commit:true})],private_check:[task('check','hanan','Đặt hai bản cạnh nhau','Bạn xin giải trình bốn bao còn lại. Hanan trả lời về khoản dự phòng, chưa cho thấy lệnh chuyển.',[],{puzzle:'count',skill:'observe',commit:true})]},ending:{open_audit:'Cuộc kiểm có người cùng chứng kiến. Một con số khác một lời kết tội.',private_check:'Việc chia bữa tiếp tục. Người giữ sân hẹn giới thiệu một đầu mối kín.'}},

    {id:'Q06',title:'Chỗ đứng của lưỡi gậy',region:'galilee',companion:'damar',companionLine:'Damar giữ gậy xuôi theo chân ở lối vào sân phụ, canh chừng để không khóa đường người làm thuê.',act:'II · Điều một người giữ lại',lead:'Người từng đánh cha đang giữ thẻ giao sân phụ. Damar nhìn lối ra trước khi nhìn người ấy. Bạn có thể lấy đối chiếu mà không lấy quyền trừng phạt.',quiet:'Damar hỏi nên trả cây gậy về đâu. Anh đợi câu trả lời thay vì bước tới trước.',quietScene:{sound:'[Tiếng gió lùa qua vách đá vôi và tiếng gậy gỗ đặt nằm xuống thềm]',body:'Damar ngồi ở bậc đá ngoài sân, hai bàn tay đan vào nhau: “Lúc thấy người từng làm cha bạn bị thương, cổ họng tôi nghẹn lại. Nhưng đứng giữ lối cho người làm công đi ra bình an làm tay tôi nhẹ hơn nhiều.”'},legend:'L02',nodes:[node('damar','Lối vào sân',[-9,5],'man','damar',{pose:'watch'}),node('enforcer','Người áp tải',[-1,-4],'man','enforcer',{pose:'watch'}),node('token','Thẻ sân phụ',[8,-8],'tablet'),node('witness','Người chứng kiến',[12,4],'man','mattai'),node('amon','Đầu mối nguồn thay',[17,-3],'man','amon'),node('rest','Chỗ nghỉ',[-12,-7],'bench'),node('gate','Lối về điểm hẹn',[22,9],'gate')],tasks:[
      task('approach','damar','Quan sát hai lối ra','Một người làm thuê còn trong sân. Đừng khóa đường họ chỉ để tách người bạn muốn gặp.',[],{speaker:'damar',skill:'defend'}),
      task('talk','enforcer','Yêu cầu xem vật đối chiếu','“Thẻ vẫn ở đây. Anh muốn lấy nó để đối chiếu hay muốn đòi lại phần đau của cha mình?”',['approach'],{skill:'defend',choices:[['calm','Tôi cần đối chiếu việc chuyển hàng.','Người ấy buông tay khỏi thân gậy. Cuộc gặp vẫn giữ khoảng cách rõ ràng.'],['withdraw','Tôi cần dừng lại trước khi nói tiếp.','Bạn bước ra lối thoáng hít sâu một nhịp, rồi trở lại với một câu hỏi đúng mực.']]}),
      task('choose','token','Chọn cách giữ vật chứng','Vật gốc ngắn chuỗi giữ; bản sao giữ công cụ làm việc cho chủ nhưng cần người đối chiếu.',['talk'],{plan:true,choices:[['take_original','Nhận vật gốc và cấp biên nhận','Ghi rõ đã lấy gì và vì sao.'],['witnessed_copy','Làm bản sao có người chứng kiến','Để vật gốc lại, giữ giới hạn của bản sao.'],['reconstruct','Đi nguồn đối chiếu của người vận chuyển','Thêm một lượt công, không cần buộc người này hợp tác.']]})
    ],execution:{take_original:[task('custody','token','Nhận thẻ và ghi biên nhận','Bốn bao G17 được ghi tại sân phụ. Dấu này dùng chung, chưa tự xác định Hanan.',[],{evidence:'E06',skill:'observe',commit:true})],witnessed_copy:[task('copy','witness','Đối chiếu bản sao trước người chứng kiến','Đặt hai mặt và kiểm lại mã lô. Một bản chép vẫn thuộc cùng nguồn.',[],{puzzle:'copy',evidence:'E06',skill:'observe',commit:true})],reconstruct:[task('counter','amon','Tìm lượt giao từ nguồn thay','Bạn cùng Amon đối lại mã sân phụ, lượng bốn và lượt chuyển.',[],{puzzle:'copy',evidence:'E06',skill:'craft',commit:true})]},ending:{take_original:'Vật gốc được giữ cùng biên nhận. Trách nhiệm về việc đã gây hại còn cần được giải trình.',witnessed_copy:'Chủ còn công cụ, nhóm có bản đối chiếu với giới hạn rõ.',reconstruct:'Nguồn khác mở đường tiếp tục. Bạn đã không ép một người thành chiếc khóa.'}},

    {id:'Q07',title:'Một lời hứa còn thiếu',region:'galilee',companion:'miriam',companionLine:'Miriam đứng lặng trước hiên sân nhận ca, cân nhắc cách mở lời thật lòng với em trai Sela.',act:'II · Điều một người giữ lại',tenet:'L02',lead:'Một cuộc hẹn nguồn tới cùng lúc người trong gia đình Miriam sắp rời đi. Giữ lời có thể bắt đầu bằng việc thừa nhận điều đã đổi.',quiet:'Sela đặt chiếc khăn xuống: “Một ca. Đừng hứa cả tuần thay em.” Miriam để em tự cầm phần việc.',quietScene:{sound:'[Tiếng muôi gỗ chạm thành chum nước và tiếng cười nhỏ của thợ trẻ đổi ca]',body:'Bên bàn nghỉ cuối buổi, Sela tự rót hai chén nước rồi đẩy một chén sang phía chị gái: “Chị Miriam cứ quen đứng chắn gió cho cả nhà, hôm nay chị ngồi xuống uống trước đi.”'},nodes:[node('miriam','Người đã hứa',[-8,4],'woman','miriam',{pose:'talk'}),node('sela','Sân nhận ca',[1,-6],'man','sela',{work:true}),node('courier','Điểm nhận lời',[11,4],'man','mattai'),node('rest','Bữa nghỉ',[15,-7],'table'),node('gate','Lối tuyến đồi',[22,9],'gate')],tasks:[
      task('promise','miriam','Nghe lại điều đã hứa','Miriam đã hứa sẽ giải thích chuyện món đồ gia đình cho em trai trước khi đi tiếp: “Chuyện giữa chị em tôi, xin đừng nói thay.”',[],{speaker:'miriam',skill:'commune',tenetNote:'L02'}),
      task('listen','sela','Hỏi phần người nhận còn muốn gánh','“Em vẫn lo cho chị ấy. Chỉ là em không muốn bị dỗ bằng chuyện không thật.”',['promise'],{speaker:'sela',skill:'commune'}),
      task('choose','miriam','Thương lượng cách thực hiện','Tự mình đi, báo trước để hẹn lại, hoặc giao người khác khi cả hai bên chấp nhận.',['listen'],{plan:true,tenetNote:'L02',choices:[['personally_keep','Tự mình cùng Miriam hoàn tất','Nguồn gửi tóm tắt trước, bạn gặp lại sau.'],['renegotiate','Nói giới hạn và xin hẹn lại','Giữ được hẹn nguồn, không giả vờ đã giữ cách cũ.'],['delegated','Bàn giao có người nhận tự nguyện','Phải giao đúng người và kiểm xác nhận.']]})
    ],execution:{personally_keep:[task('conversation','sela','Để cuộc nói trở lại giữa hai chị em','Miriam nhận mình đã đổi món đồ gia đình lấy lương ăn rồi nói dối là đánh mất. Sela lắng nghe và được quyền cần thêm thời gian.',[],{commit:true,skill:'commune'})],renegotiate:[task('new-promise','sela','Xin lại một cam kết vừa sức','Sela tự chọn một ca làm và điểm gặp mới: “Một ca thôi chị nhé.” Không ai hứa cả tuần thay người ấy.',[],{commit:true,skill:'commune'})],delegated:[task('accept-role','courier','Xin người nhận lời','Người nhận xác nhận rõ phạm vi có thể giúp.'),task('handoff','sela','Bàn giao và hỏi xác nhận','Miriam đã đồng ý cách này; Sela nhận đúng lời chị gửi.',['accept-role'],{commit:true,skill:'commune'})]},ending:{personally_keep:'Lời hứa thành một việc đã làm. Chuyện gia đình chưa cần khép bằng một cái ôm.',renegotiate:'Một giới hạn được nói trước để người khác có thể tự quyết.',delegated:'Có người nhận thật. Chọn giao việc chưa phải hoàn thành việc.'}},

    {id:'Q08',title:'Trang sổ trong nước',region:'ravine',companion:'damar',companionLine:'Damar ghì sẵn cọc neo trên bậc đá khô, ra hiệu kiểm kỹ dây và bọc vải trước khi xuống bờ sạt.',act:'II · Điều một người giữ lại',lead:'Dòng nước dâng đã để vết trên bờ. Amon mang bản phụ qua một lối đang yếu. Chuẩn bị có thể giúp giữ được cả người lẫn giấy.',quiet:'Lea phơi phần giấy còn lại và đánh dấu chỗ không đọc được. Không ánh đèn nào tự biến khoảng mờ thành sự thật.',quietScene:{sound:'[Tiếng suối lũ rút dần qua khe sỏi và tiếng giấy ướt hong bên đèn nhỏ]',body:'Trên tảng đá phẳng cạnh bờ yên, Lea cẩn thận lót vải khô dưới tờ bản phụ nhòe nước: “Cứu được chú Amon lành lặn lên bờ đã là trọn việc lớn nhất hôm nay rồi. Chỗ mực trôi mất, ta sẽ tìm nguồn khác bù lại bằng chân thật.”'},veil:'V03',nodes:[node('bank','Bờ có vết nước',[-10,6],'cairn'),node('anchor','Chỗ đặt neo',[-3,-2],'stakes'),node('support','Người nhận vai',[5,6],'man','damar',{pose:'watch'}),node('wrap','Túi bọc giấy',[9,-3],'supplies'),node('amon','Amon mắc ở bậc thấp',[15,-10],'man','amon'),node('rest','Bờ yên',[-11,-8],'bench'),node('gate','Đường tới Giêrusalem',[23,8],'gate')],tasks:[
      task('read-bank','bank','Đọc vết nước và lối vòng','Bờ đã sạt ở phía thấp. Một đường vòng có chỗ đứng rộng hơn.',[],{puzzle:'water',skill:'observe'}),
      task('anchor','anchor','Kiểm neo trước khi kéo','Bộ dây tốt giúp việc chuẩn bị; neo cơ bản vẫn có thể an toàn nếu chọn đúng điểm tựa.',['read-bank'],{puzzle:'rope',skill:'craft'}),
      task('support','support','Xin người giữ bờ và người nhận','Người nhận vai xác nhận khả năng của mình. Nếu đồng hành vắng, người địa phương được trả công cụ thể.',['read-bank'],{skill:'commune'}),
      task('wrap','wrap','Bọc khô giấy và xác nhận đầu mối','Địa chỉ ở Giêrusalem được giữ trong vỏ khô. Nó cũng đã được nói ở điểm nghỉ.',['read-bank'],{skill:'craft'}),
      task('choose','amon','Chọn cách đưa Amon ra','Amon mắc dưới tải. Xem lại neo, người hỗ trợ và bọc giấy trước khi kéo.',['read-bank'],{plan:true,choices:[['prepared_rescue','Đưa cả người và giấy theo phương án đã kiểm','Cần neo, người nhận và bọc giấy. Có thể quay lại chuẩn bị.'],['person_first','Bỏ túi giấy để đưa người ra sớm','Amon ổn, một phần bản phụ mất trong nước.'],['loaded_rescue','Kéo cùng tải khi chưa đủ bảo đảm','Giữ giấy nhưng Amon bị thương; nhóm phải nhận việc chăm sóc.']]})
    ],execution:{prepared_rescue:[task('rescue','amon','Phối hợp đưa người và giấy qua','Đợi tín hiệu của người giữ bờ rồi cùng kéo nhịp nhàng.',[],{puzzle:'rescue',skill:'defend',commit:true,evidence:'E07'})],person_first:[task('rescue','amon','Gỡ tải và đưa người lên','Bạn để túi trôi khỏi vai, rồi kéo Amon an toàn tới người nhận.',[],{puzzle:'rescue',skill:'defend',commit:true,evidence:'E07'})],loaded_rescue:[task('rescue','amon','Đưa người cùng tải tới bờ','Tải lệch làm Amon bị thương. Bạn đưa được người lên và phải bố trí chăm sóc.',[],{puzzle:'rescue',skill:'defend',commit:true,evidence:'E07'})]},ending:{prepared_rescue:'Neo, người giữ bờ và bọc khô đã có tác dụng. Không mất mát nào bị ép để câu chuyện sâu hơn.',person_first:'Người đã ra. Phần giấy không đọc được vẫn là một mất mát phải thừa nhận.',loaded_rescue:'Giấy còn đủ, nhưng Amon cần được chăm. Hệ quả không biến mất khi qua chương.'}},

    {id:'Q09',title:'Quyền được im lặng',region:'jerusalem',companion:'lea',companionLine:'Lea giữ thẻ ghi khép nửa trang, nhắc ghi rõ phạm vi cho phép trước mỗi lời kể.',act:'III · Một lời chứng không thuộc riêng ai',lead:'Có người chỉ muốn xác nhận riêng, có người sẵn lòng đứng tên, có người từ chối. Bạn không cần đánh bại mọi lời “không” để đi tiếp.',quiet:'Trong sân có người sửa đồ chơi, có người muốn nói về giá dầu. Họ tồn tại ngoài câu chuyện minh oan của bạn.',quietScene:{sound:'[Tiếng trẻ nhỏ lăn vòng gỗ trên sân đá Giêrusalem và tiếng chim sẻ trên mái ngói]',body:'Một bác thợ mộc già ngồi gọt con ngựa gỗ nhỏ bên bậc thềm, chẳng hỏi gì về chuyện sổ kho Xêdarê. Nhìn đời sống bình dị tự trôi qua ngoài vụ án giúp bạn nhớ vì sao không ai đáng bị biến thành phương tiện cho cuộc điều tra của mình.'},nodes:[node('arrival','Sân chung',[-10,5],'table'),node('witness1','Một lời chứng riêng',[-2,-5],'woman','witness1',{pose:'talk'}),node('witness2','Người sẵn lòng gặp',[8,4],'man','witness2',{work:true}),node('door','Một cánh cửa đóng',[15,-6],'shelter'),node('keeper','Xưởng giữ gói gửi',[18,3],'elder','keeper',{pose:'watch'}),node('gate','Lối tới bản đối chiếu',[22,10],'gate')],tasks:[
      task('arrival','arrival','Xin bố trí cuộc gặp','Giới thiệu qua sân chung hoặc người quen kín, tùy cách bạn đã kiểm lượng ở Galilê.',[],{skill:'commune'}),
      task('statement','witness1','Hỏi điều đã trực tiếp nghe','“Tôi đã nghe Hanan bảo mở sân cho bốn bao. Anh muốn dùng lời này ở đâu?”',['arrival'],{skill:'commune',choices:[['private_group','Chỉ trong nhóm đối chiếu','Được giữ riêng; muốn công bố phải xin lại phạm vi.'],['anonymous_summary','Chỉ dùng nội dung, không định danh','Cho phép trình bản tóm tắt đã ẩn danh.'],['decline','Tôi sẽ tôn trọng nếu người ấy chưa muốn ghi lại','Bạn tiếp tục tìm nguồn vật chất.']],evidence:'E09'}),
      task('willing','witness2','Nghe người tự nguyện và giới hạn','Người thợ sẵn lòng nói việc mình biết, không hứa thay người khác.',['arrival'],{skill:'commune'}),
      task('refusal','door','Chấp nhận một lời từ chối','Người bên trong đã được giúp nhưng vẫn không muốn tham gia. Đầu mối gói gửi còn ở xưởng.',['arrival'],{skill:'defend'}),
      task('choose','keeper','Chọn cách tiếp tục xin nguồn','Bạn có thể giữ phạm vi đã cho hoặc xin một người được tin ngồi cùng; người kia vẫn được từ chối.',['statement','willing','refusal'],{plan:true,choices:[['respect_limits','Giữ đúng giới hạn và tìm vật đối chiếu','Không buộc một lời từ chối thành cản đường.'],['seek_mediator','Xin trung gian cho cuộc nói tiếp','Một cuộc gặp khác, không bảo đảm đổi câu trả lời.']]})
    ],execution:{respect_limits:[task('readback','keeper','Đọc lại phạm vi đã ghi','Những người cho lời chứng nghe lại đúng phần mình cho dùng.',[],{commit:true,skill:'observe'})],seek_mediator:[task('mediate','witness1','Gặp cùng người được tin','Người làm chứng giữ quyền nói không. Bạn xác nhận đầu mối gói gửi thay vì ép thêm.',[],{commit:true,skill:'commune'})]},ending:{respect_limits:'Không phải tất cả đều đứng cùng bạn. Hành trình vẫn có đường tiếp tục.',seek_mediator:'Một người được nghe trong điều kiện mình chọn. Phạm vi vẫn là của họ.'}},

    {id:'Q10',title:'Bản sao không nguyên vẹn',region:'jerusalem',companion:'lea',companionLine:'Lea đặt hai bản ghi song song trên mặt bàn đá, chờ quyết định trung thực của chính gia đình bạn.',act:'III · Một lời chứng không thuộc riêng ai',lead:'Gói gửi của Haddai có phần bất lợi cho chính ông. Quy tắc đã dùng với người khác giờ trở lại với gia đình bạn.',quiet:'Một mảnh ghi mua dầu không có giá trị vụ án. Bạn có thể giữ nó chỉ vì đó là nét chữ của cha.',quietScene:{sound:'[Tiếng giấy cói sột soạt khẽ trong gió chiều Giêrusalem]',body:'Ngoài tờ đính chính gửi kho, dưới đáy gói vải còn mảnh giấy nhỏ cha viết riêng: “Con ơi, nhớ nhắc chú Natan đừng thức quá canh hai bên xưởng thuyền, mắt ông ấy kém đèn rồi.” Một dòng nhắn bình thường của người cha không xóa lỗi ký vội, nhưng giữ lại hơi ấm con người thật của ông.'},legend:'L04',nodes:[node('keeper','Người giữ gói',[-9,5],'elder','keeper',{pose:'talk'}),node('letter','Bản sửa của Haddai',[-2,-4],'scroll'),node('compare','Bàn hai nguồn',[7,3],'table'),node('lea','Chỗ cùng đọc',[14,-5],'woman','lea',{pose:'talk'}),node('gate','Đường trở về Xêdarê',[23,8],'gate')],tasks:[
      task('provenance','keeper','Kiểm mã và đường gói đã tới','Dấu niêm là đầu mối, không dấu vân tay. Người giữ gói kể đúng lần đã nhận.',[],{skill:'observe'}),
      task('letter','letter','Đọc phần cha tự nhận lỗi','Trong thư gửi kho, Haddai viết rõ mình đã ký nhận trước khi đếm đủ hàng vì nôn nóng cho kịp chuyến và đề nghị kiểm tách hai khoản. Lời tự nhận không thay việc đối chiếu.',['provenance'],{evidence:'E08',skill:'observe'}),
      task('compare','compare','Ghép các nguồn đã có','18 nhận, hai hỏng, bốn ở sân phụ. Nếu bản qua nước thiếu, dùng nguồn khác và để chỗ chưa rõ.',['letter'],{puzzle:'claims',skill:'observe'}),
      task('choose','lea','Nói với nhóm về phần bất lợi','Lea nhìn thẳng bạn: “Bạn từng muốn tôi giữ nguyên phần không có lợi cho người khác. Giờ bạn có sẵn lòng giữ cùng một thước đo ấy cho cha mình không?”',['compare'],{plan:true,choices:[['disclose','Đọc đủ phần liên quan','Cha đã sai một phần khi ký trước, chưa có căn cứ quy mọi thiếu hụt cho ông.'],['conceal','Giao bản bỏ phần cha tự nhận lỗi','Nhóm còn bản đối chiếu. Bạn có thể sửa lời, nhưng việc giấu sẽ được nhớ.']]})
    ],execution:{disclose:[task('share','lea','Đọc bản đầy đủ cho nhóm','Bạn đọc trọn lá thư và để những người cần biết hỏi lại. Không ai bị ép phải tha thứ ngay.',[],{commit:true,skill:'commune'})],conceal:[task('share','lea','Giao bản thiếu phần tự nhận','Lea đặt bản đối chiếu bên cạnh: “Phần cha bạn tự nhận đã bị lược bỏ. Bạn muốn đính chính ngay trước những người vừa nhận không?”',[],{choices:[['corrected','Sửa và trao lại bản đủ','Giữ sự kiện đã giấu, ghi thêm việc đính chính.'],['conceal','Giữ bản thiếu','Bạn tiếp tục với một khoản trách nhiệm chưa sửa.']],commit:true,skill:'commune'})]},ending:{disclose:'Bạn đã áp cùng một quy tắc với gia đình mình.',conceal:'Một bản thiếu đã tới tay người khác. Việc đối chiếu cuối sẽ nhắc điều ấy.',corrected:'Việc sửa đã tới đúng người nhận. Ký ức về lần che giấu vẫn còn.'}},

    {id:'Q11',title:'Những người cùng ở lại',region:'caesarea',companion:'miriam',companionLine:'Miriam, Lea, Damar và Titus tụ họp quanh sân bữa Xêdarê để chia nhau từng phần việc vừa sức.',act:'III · Một lời chứng không thuộc riêng ai',tenet:'L04',lead:'Bến đã sống tiếp trong lúc bạn đi xa. Một kế hoạch cần người giữ bữa, giữ bản, nhận người và chịu phần việc sau khi cuộc nói kết thúc.',quiet:'Trong bữa trước khi chốt, mỗi người chỉ nói một việc mình có thể làm. Có người chỉ đủ sức châm đèn.',quietScene:{sound:'[Tiếng lửa than tí tách dưới nồi súp ấm và tiếng thìa chạm bát đất nung]',body:'Quanh bàn ăn chiều ở Xêdarê, không ai nói lời thề thốt lớn lao. Rina nhận giữ bếp nóng, Titus nhận kiểm then cổng, chú Natan ngồi khâu lại quai túi vải cho bạn. Sự sống tiếp nối bằng những phần việc nhỏ có người thật đứng nhận.'},legend:'L05',veil:'V04',nodes:[node('return','Sân bữa khi trở về',[-10,5],'woman','rina',{work:true}),node('mattai','Sổ bàn giao ca',[-2,-5],'man','mattai',{pose:'talk'}),node('witness1','Xác nhận phạm vi',[6,4],'woman','witness1',{pose:'talk'}),node('supplies','Kho chuẩn bị',[13,-5],'supplies'),node('planning','Bàn phân việc',[17,5],'table'),node('rest','Bữa trước cuộc nói',[-12,-9],'table'),node('gate','Mốc bắt đầu kế hoạch',[23,9],'gate')],tasks:[
      task('return','return','Đi qua dấu của những lựa chọn cũ','Chỗ chờ, góc bàn và lối đã sửa còn kể việc bạn đã làm.',[],{skill:'observe',tenetNote:'L04'}),
      task('counter','mattai','Đối chiếu sổ ca độc lập','Mattai nhớ lần trực tiếp nhận chỉ dẫn mở sân. Trước đó ông chưa biết lượng đến Galilê.',['return'],{evidence:'E10',puzzle:'copy',skill:'observe'}),
      task('scope','witness1','Xin lại phạm vi cho lần công bố','Đồng ý trong nhóm trước kia chưa phải quyền đọc tên trước sân.',['return'],{skill:'commune',choices:[['anonymous_summary','Giữ nội dung ẩn danh','Người ấy cho dùng nội dung mà không dùng tên.'],['public_named','Xin tự nguyện nói trong sân có bảo vệ','Người ấy tự chọn sau khi đã biết nơi nhận và lối về.'],['private_group','Giữ lời chứng riêng','Bạn vẫn có thể công bố dữ kiện và lời của chính mình.']]}),
      task('supplies','supplies','Chuẩn bị bữa và người nhận','Nguồn đã mang từ Q04 làm công chuẩn bị khác đi. Vẫn có cách bù bằng một việc cụ thể.',['return'],{puzzle:'supplies',skill:'craft'}),
      task('choose','planning','Chọn phương án cùng thực hiện','Có thể công khai dữ kiện đúng phạm vi, gửi nhiều người giữ bản, hoặc đưa người gặp nguy hiểm đi trước.',['counter','scope','supplies'],{plan:true,tenetNote:'L04',choices:[['public','Lời trước sân kho','Tạo sân, lối ra và bản trình có giới hạn.'],['distributed','Những người giữ đèn','Tách danh tính, gửi đối chiếu tới những người giữ bản độc lập.'],['relocate','Con đường chưa đọc hết','Đưa người đi trước; một phần hàng chưa chặn kịp.']]})
    ],execution:{public:[task('rehearse','planning','Diễn tập sân và kiểm bản đọc','Kiểm người nhận, lối ra và dữ kiện được phép trình.',[],{puzzle:'redact',skill:'commune',commit:true})],distributed:[task('rehearse','planning','Chia vai giữ bản và kiểm ẩn danh','Thông tin nhận diện tách khỏi bản đối chiếu; mỗi người biết phạm vi của mình.',[],{puzzle:'redact',skill:'observe',commit:true})],relocate:[task('rehearse','planning','Đi thử lối và xác nhận chỗ nhận','Có người ở đầu kia trả lời, không chỉ một địa điểm trên bản đồ.',[],{puzzle:'rope',skill:'defend',commit:true})]},ending:{public:'Một sân đã sẵn sàng. Chỉ điều đủ nguồn và đúng phạm vi được đọc.',distributed:'Không một người giữ cả hàng lẫn mọi bản ghi.',relocate:'Những người cần đi có một nơi nhận thật. Lời chứng chưa phải chấm hết.'}},

    {id:'Q12',title:'Điều còn lại sau một lời nói',region:'caesarea',companion:'miriam',companionLine:'Cả nhóm giữ đúng vị trí đã nhận quanh sân bến để ngày mai công việc chung vẫn tiếp diễn.',act:'III · Một lời chứng không thuộc riêng ai',tenet:'L04',lead:'Thực hiện kế hoạch mà nhóm đã nhận. Một lời chứng có giá trị trong cách người khác có thể sống sau nó.',quiet:'Một người nhắc chuyện nhỏ bạn đã làm trong bến. Người thân còn có thể được nhớ bằng điều khác ngoài một vụ án.',quietScene:{sound:'[Tiếng hải âu gọi bầy trên mặt biển sáng và tiếng mở cửa kho ca mới]',body:'Chú Natan đứng tựa mạn thuyền gỗ mới xảm nhựa thông, nhìn ra khoảng nước lấp lánh ngoài đê chắn sóng: “Con đã đi trọn một vòng mà không bắt ai phải gánh thay sự thật của mình. Cha con hẳn sẽ mỉm cười khi thấy con còn giữ được đôi tay bình yên bên bến này.”'},nodes:[node('public','Sân làm chứng',[-7,-1],'table'),node('copy1','Người giữ bản thứ nhất',[4,-10],'man','mattai'),node('copy2','Người giữ bản thứ hai',[14,2],'woman','rina'),node('yosef','Nhóm cần di chuyển',[-8,7],'man','yosef'),node('shelter','Nơi nhận an toàn',[17,8],'shelter'),node('hanan','Hanan ở mép sân',[11,-7],'man','hanan'),node('meal','Bữa sau cuộc nói',[1,5],'table'),node('gate','Bến sau một lời chứng',[23,10],'gate')],tasks:[],execution:{
      public:[task('stage','public','Sắp người và kiểm lối ra','Người tự nguyện tự đứng ở chỗ đã chọn. Bản xem trước chỉ chứa điều được phép trình.'),task('speak','public','Trình lời chứng trong giới hạn','Đọc điều đã kiểm. Một chữ ký sai không xóa trách nhiệm chuyển hàng, cũng không làm cha hoàn toàn vô can.',['stage'],{puzzle:'release',skill:'commune'}),task('reply','hanan','Đáp phần chất vấn về Haddai','Hanan hỏi về chữ ký. Bạn trả lời phần đã biết, không đổi phạm vi theo áp lực.',['speak'],{skill:'commune',choices:[['responsible','Cha tôi đã ký sai. Điều ấy không giải trình bốn bao.','Một phần trách nhiệm được nhận, một phần cáo buộc vẫn cần đúng nguồn.'],['limited','Tôi chỉ trình phần đã đối chiếu được.','Bạn không hứa nhiều hơn điều nguồn cho phép.']]}),task('finish','meal','Bàn giao việc kiểm kho sau cuộc nói','Có người nhận giữ bữa và đối chiếu lượt sau.',['reply'],{commit:true})],
      distributed:[task('separate','public','Tách bản đối chiếu khỏi danh tính','Xem lại mã lô, số nhận, nguồn và giới hạn; tên không tự lọt vào bản giao.',[],{puzzle:'redact',skill:'observe'}),task('first-copy','copy1','Trao bản cho người giữ thứ nhất','Người nhận xác nhận sẽ không đòi danh sách gốc.',['separate']),task('second-copy','copy2','Trao bản cho người giữ thứ hai','Hai nơi giữ bản không thành một người nắm hết quyền.',['first-copy']),task('finish','meal','Chia việc kiểm lượt hàng sau','Mỗi nơi giữ việc đã nhận. Sức ép có giới hạn, việc sống vẫn tiếp tục.',['second-copy'],{commit:true})],
      relocate:[task('escort','yosef','Đi cùng nhóm tới nơi nhận','Theo sát nhau và dùng lối đã kiểm; không chỉ đánh dấu trên bản đồ.',[],{escort:true,destination:'shelter',skill:'defend'}),task('receive','shelter','Xác nhận người và bữa đã tới','Người nhận gọi từng lượt trong phạm vi nhóm.',['escort']),task('send-copy','copy1','Gửi bản còn lại để có thể nói sau','Bạn giữ hồ sơ và thừa nhận phần chưa thể công bố.',['receive'],{puzzle:'redact',skill:'observe'}),task('finish','meal','Trở lại phần việc còn nợ','Một phần hàng không chặn kịp. Những người còn sống có thể tự chọn lần nói sau.',['send-copy'],{commit:true})]
    },ending:{public:'LỜI TRƯỚC SÂN KHO',distributed:'NHỮNG NGƯỜI GIỮ ĐÈN',relocate:'CON ĐƯỜNG CHƯA ĐỌC HẾT'}}
  ];

  const legends = {
    L01:{title:'Đường qua biển',name:'Môsê',witnessRole:'Người Hộ Vệ Khóa Đuôi',witnessKit:'Đèn bão chắn gió · Dây chằng xe · Đòn kê trục',composureName:'Độ gắn kết đoàn',tenetId:'L01',base:'moses',biome:'desert',ref:'Xh 14,10–31',url:'https://bible.usccb.org/bible/exodus/14',summary:'Trong vai Người Hộ Vệ Khóa Đuôi đi cuối đoàn dân Israel, bạn giữ đèn hiệu, nạy bánh xe lún cát và trấn an các gia đình khi trình thuật kể Thiên Chúa mở lối cứu thoát qua biển và Môsê đáp lại lời được trao. Phép lạ hoàn toàn thuộc sáng kiến của Thiên Chúa, không thuộc thanh năng lượng hay nút gọi phép của người chơi.',steps:[['listen','Nghe giữa tiếng sợ','Đứng cùng dòng người ở khóa đuôi, nhận ra họ đang nhìn về phía nào.'],['signal','Ra hiệu theo lời được trao','Hành động của Môsê nằm trong mạch trình thuật; bạn chuyển tín hiệu đèn cho đoàn sau.'],['cross','Đi cùng dòng người','Theo lối đã mở đến bờ phía kia, không bỏ người sau cùng để lấy điểm nhanh.']],source:'Nguồn giữ hành động cốt lõi và sáng kiến cứu thoát của Thiên Chúa.',added:'Game thêm góc nhìn Người Hộ Vệ Khóa Đuôi, đường đi, bố cục nhóm, tín hiệu đèn và thao tác hỗ trợ đoàn. Đây chưa là phục dựng khảo cổ.'},
    L02:{title:'Khoảng tối trong hang',name:'Đavít',witnessRole:'Người Trinh Sát Đội Đavít',witnessKit:'Dây thừng leo vách · Bầu nước da · Dép êm',composureName:'Kỷ luật im lặng',tenetId:'L02',base:'neighbor',biome:'road',ref:'1 Sm 24',url:'https://bible.usccb.org/bible/1samuel/24',summary:'Trong vai Người Trinh Sát thuộc toán của Đavít ẩn sâu trong hang đá vôi En-Ghedi, bạn đọc độ dội âm vách đá, giữ kỷ luật im lặng và kìm tay đồng đội đang nóng nảy khi Đavít tự giới hạn mình, không giết vua Saun và bước ra đối diện từ khoảng cách tôn trọng.',steps:[['approach','Tiến qua khoảng tối','Đọc lối ra và độ vang đá vôi trong khi người đi cùng thúc giục.'],['stay','Kiềm người đi cùng','Dừng trước hành vi không còn là tự vệ. Câu chuyện giữ trọn kết cục của bản văn.'],['emerge','Bước ra đối diện','Để khoảng cách còn đó rồi chứng kiến lời đối đáp; không nhặt tấm áo thành chiến lợi phẩm.']],source:'Giữ việc Đavít không giết Saun, sự áy náy khi cắt vạt áo và văn cảnh 1 Sm 24.',added:'Góc nhìn trinh sát vô danh, đường hang, âm học đá vôi và nhịp thao tác là chuyển thể. Không ghép chi tiết lấy cây giáo ở 1 Sm 26 vào cảnh này.'},
    L03:{title:'Dây và vải',name:'Giêrêmia',witnessRole:'Người Phụ Việc Cùng Ebed-melech',witnessKit:'Vải lanh cũ đệm nách · Đèn dầu nhỏ · Dây thừng bện',composureName:'Nhịp đỡ cẩn trọng',base:'supper',biome:'room',ref:'Gr 38,1–13',url:'https://bible.usccb.org/bible/jeremiah/38',summary:'Trong vai một người phụ việc kho cung đình đi theo Ebed-melech tới miệng hố bùn, bạn thả tấm vải lót mềm xuống trước để dây thừng không cứa rách nách ngôn sứ Giêrêmia khi kéo ông lên. Người được cứu không tự thoát bằng sức mạnh cá nhân.',steps:[
      Object.assign(['answer','Nghe tiếng thở dưới đáy hố và gọi đáp','Trong khoảng tối ẩm đặc bùn dưới miệng giếng cạn, tiếng Ebed-melech gọi xuống cho Giêrêmia biết có người đang cẩn trọng tìm cách đưa ông lên.'],{at:[-4,2],sound:'[Tiếng giọt nước rơi vang trong lòng hố bùn sâu]'}),
      Object.assign(['cloth','Thả giẻ rách và vải mềm lót chỗ dây tì','Theo đúng lời dặn của Ebed-melech (Gr 38,11–12), bạn buộc cuộn vải cũ thả xuống trước để lót dưới hai nách ngôn sứ trước khi dây gai chịu tải.'],{at:[0,-3],sound:'[Tiếng vải lanh chạm nhẹ vào thành đá ẩm]'}),
      Object.assign(['ready','Giữ nhịp dây kéo đều tay lên miệng hố','Cùng những người đi theo Ebed-melech kéo dây chậm rãi, giữ thế đứng vững trên vành đá trơn mà không biến nỗi đau thể xác thành trò bấm nút ghi điểm.'],{at:[6,-7],sound:'[Tiếng dây gai căng đều trên vành đá vôi]'})
    ],discoveries:[
      {id:'rags',title:'Cuộn vải cũ từ kho dưới lầu vua',at:[-7,-2],variant:'cloth',text:'[K/H] Gr 38,11 nhắc rõ những mảnh vải cũ và giẻ rách lấy từ kho để lót dây — một chi tiết chăm sóc cụ thể giữa cảnh nguy cấp.'},
      {id:'rim',title:'Vành miệng hố trơn bùn',at:[3,1],variant:'cairn',text:'[H] Bậc đá kê thêm của game giúp người kéo giữ thăng bằng, minh họa sự chuẩn bị trước khi cứu người.'},
      {id:'lamp-niche',title:'Hốc đặt đèn dầu',at:[-2,-7],variant:'lamp',text:'[H] Ngọn đèn đặt khuất gió để soi miệng hố mà không làm chói mắt người vừa từ bóng tối bước lên.'}
    ],returnAt:[11,-9],start:[-6,5],source:'Hố bùn, sự can thiệp của Ebed-melech, dây thừng và vải đệm nách thuộc phân đoạn nguồn Gr 38,1–13.',added:'Góc nhìn người phụ việc, vị trí đặt đèn và nhịp phối hợp kéo dây là sáng tác nghệ thuật. Không thay thế vai Ebed-melech bằng nhân vật của người chơi.'},
    L04:{title:'Bữa trên bờ',name:'Phêrô',witnessRole:'Người Phụ Lưới Hồ Galilê',witnessKit:'Lưới và dây mạn · Đèn dầu mũi thuyền · Dây kéo mạn',composureName:'Nhịp đồng tâm',tenetId:'L04',base:'andrew',biome:'dawn',ref:'Ga 21,1–19',url:'https://bible.usccb.org/bible/john/21',summary:'Trong vai Người Phụ Lưới cùng thức suốt đêm trắng tay trên hồ Têbêria, bạn gỡ lưới, giữ nhịp chèo vào bờ sáng sớm, phụ kéo mẻ cá lớn và lặng lẽ lùi lại giữ khoảng trang nghiêm bên bếp than hồng khi Đức Kitô Phục Sinh trao lại sứ vụ chăm sóc đoàn chiên cho Phêrô.',steps:[['net','Phối hợp ngư cụ','Làm việc cùng những người trong thuyền giữa đêm không bắt được gì.'],['shore','Trở lại bờ','Bước vào khoảng lắng ấm áp của bếp than hồng, bánh và cá trên bờ sáng.'],['listen','Lắng nghe việc được trao','Cảnh dẫn theo nguồn với lòng tôn kính; không chọn đáp án để chấm điểm tình yêu.']],source:'Bản văn Ga 21,1–19 đặt cuộc gặp Đức Giêsu Phục Sinh bên bếp than và ba lần trao trách nhiệm mục tử cho Phêrô.',added:'Game thêm góc nhìn người phụ lưới vô danh, nhịp gỡ ngư cụ và khoảng lùi chứng kiến trên bờ. Không tự viết lời mới rồi gán là nguyên văn Đức Giêsu.'},
    L05:{title:'Những người không rời đi',name:'Phaolô',witnessRole:'Người Bạn Tù Tại Philipphê',witnessKit:'Mảnh gỗ kê chân · Đèn dầu hành lang',composureName:'Sự điềm tĩnh trong tối',base:'supper',biome:'room',ref:'Cv 16,22–40',url:'https://bible.usccb.org/bible/acts/16',summary:'Trong vai một người bị giam ở buồng ngoài nhà ngục Philipphê lúc nửa đêm, bạn lắng nghe tiếng cầu nguyện và ca vịnh của Phaolô cùng Xila, đứng vững khi nền đá rung chuyển mở tung các cửa, và cùng ở lại để tiếng gọi của Phaolô giữ mạng sống cho người cai ngục.',steps:[
      Object.assign(['hear','Lắng nghe lời cầu nguyện và tiếng hát giữa đêm khuya','Từ gian trong bị cùm chân, tiếng cầu nguyện của Phaolô và Xila vang lên trầm tĩnh; các tù nhân khác đều lắng nghe (Cv 16,25), không ai bị biến thành phông nền vô danh cho một màn vượt ngục.'],{at:[-5,3],sound:'[Tiếng hát thánh vịnh trầm ấm vọng qua song gỗ trong đêm]'}),
      Object.assign(['remain','Đứng lại cùng mọi người sau cơn chấn động','Khi nền ngục rung chuyển làm bung chốt cửa và xiềng xích (Cv 16,26), bạn giữ đèn và đứng yên tại ngưỡng cửa cùng các bạn tù thay vì lao ra ngoài trong hỗn loạn.'],{at:[1,-3],sound:'[Tiếng đá rạn lắng dần và tiếng xiềng sắt rơi trên nền đất]'}),
      Object.assign(['call','Giữ ánh đèn khi Phaolô lên tiếng cứu người cai ngục','Từ trong bóng tối, Phaolô hô lớn: “Đừng làm hại mình, chúng tôi còn cả ở đây!” (Cv 16,28). Ngọn đèn được mang tới để sự sống của người giữ cửa được bảo toàn.'],{at:[7,-8],sound:'[Tiếng bước chân vội vã mang đèn tới ngưỡng cửa trong bình an]'})
    ],discoveries:[
      {id:'stocks',title:'Khung cùm gỗ bung chốt',at:[-8,-3],variant:'stakes',text:'[K/H] Cv 16,24–26 nhắc cùm gỗ ở ngục trong và việc dây trói tháo ra; game không biến biến cố này thành trò phá khóa.'},
      {id:'threshold',title:'Ngưỡng cửa mở nhưng không ai chạy trốn',at:[0,-8],variant:'waystone',text:'[K] Việc tất cả tù nhân ở lại là chi tiết cốt lõi cứu mạng người cai ngục trước luật trách nhiệm La Mã.'},
      {id:'water-basin',title:'Chậu nước rửa vết thương',at:[9,-2],variant:'table',text:'[K/H] Cv 16,33 kể người cai ngục đem hai ông lên rửa các vết đòn trong chính đêm ấy.'}
    ],returnAt:[12,-10],start:[-7,6],source:'Giữ Phaolô, Xila, các bạn tù lắng nghe, cơn động đất và việc không ai bỏ trốn giúp cứu người cai ngục (Cv 16,22–34).',added:'Game thêm góc nhìn người bạn tù buồng ngoài, điểm giữ đèn và các địa vật quan sát; không mô phỏng bạo lực hay hành vi tự hại.'}
  };

  const veils = {
    V01:{title:'Hố của những cái tên',base:'supper',biome:'room',question:'Mình đang giữ điều đã xảy ra, hay giữ cả quyền quyết định thay họ?',steps:[
      Object.assign(['carry','Nhận những trang giấy chưa ghi tên','Trong không gian sương mờ như lòng giếng ký ức, những tờ giấy trắng chỉ mang hơi ấm bàn tay người trao chứ không tiết lộ bí mật ngoài đời.'],{at:[-6,3],sound:'[Tiếng giấy mỏng chạm nhau như tiếng lá khô trong sương]'}),
      Object.assign(['place','Đặt trang giấy xuống bệ có người tự giữ','Bóng người phía trước chỉ có thể bước qua nhẹ nhõm khi bạn đặt tờ giấy lại đúng nơi họ tự cầm lấy.'],{at:[1,-3],sound:'[Tiếng nhịp thở nhẹ nhõm vang khẽ giữa mặt nước tĩnh]'}),
      Object.assign(['leave','Bước qua hành lang đã nhường lối','Không có ngọn lửa nào đốt tên hay xóa dấu để giành phần thắng trong giấc mơ này.'],{at:[8,-8],sound:'[Tiếng chuông gió xa xăm mở lối trở về thực tại]'})
    ],discoveries:[
      {id:'echo-scroll',title:'Cuộn giấy gấp đôi',at:[-10,-2],variant:'scroll',text:'Ẩn dụ giấc mơ: một lời kể được gấp lại chờ chính chủ nhân mở ra.'},
      {id:'quiet-lamp',title:'Ngọn đèn không hắt bóng gắt',at:[4,2],variant:'lamp',text:'Ẩn dụ giấc mơ: ánh sáng đủ để nhìn đường đi chung mà không soi xét đời tư.'}
    ],returnAt:[13,-10],start:[-8,6],answers:['Tôi cần hỏi trước.','Tôi sợ chậm sẽ hại thêm người.','Tôi chưa trả lời được.']},

    V02:{title:'Biển không bờ',base:'magdalene',biome:'dawn',question:'Nếu không thể tự mang hết, mình có thể cùng ai đi tiếp?',steps:[
      Object.assign(['load','Nhận ra nhịp cầu đang nghiêng vì một người ôm hết tải','Mặt nước bình minh trải rộng không thấy bờ; một bệ đá đơn lẻ chao nghiêng dưới sức nặng chồng chất.'],{at:[-6,3],sound:'[Tiếng nước dâng chạm mép đá trầm đục]'}),
      Object.assign(['share','San bớt gánh nặng sang những nhịp trụ quanh mình','Khi tải được chia đều cho các bệ đứng cạnh nhau, mặt cầu gỗ dần phẳng lại trên mặt nước êm.'],{at:[1,-3],sound:'[Tiếng gỗ khớp nhịp vững chãi trên mặt sương]'}),
      Object.assign(['pass','Bước qua cây cầu đã cân bằng','Cây cầu chỉ là ẩn dụ của giấc mơ; ngoài đời thực bạn vẫn phải tự mở lời nhờ người thật cùng làm.'],{at:[8,-8],sound:'[Tiếng sóng sớm dịu lại dưới chân cầu]'})
    ],discoveries:[
      {id:'twin-pillar',title:'Hai trụ đá song hành',at:[-9,-4],variant:'waystone',text:'Ẩn dụ giấc mơ: không trụ đơn nào gánh nổi cả nhịp cầu dài.'},
      {id:'shared-basket',title:'Giỏ đan hai quai',at:[5,2],variant:'basket',text:'Ẩn dụ giấc mơ: có những vật dụng ngay từ lúc đan đã dành cho bốn bàn tay cùng nâng.'}
    ],returnAt:[13,-10],start:[-8,6],answers:['Tôi sẽ tìm người cùng nhận việc.','Tôi vẫn sợ để người khác giữ.','Tôi cần thêm thời gian.']},

    V03:{title:'Những mặt nạ giữ kho',base:'garden',biome:'olive',question:'Một lời nói có còn là của họ khi mình quyết thay mọi điều?',steps:[
      Object.assign(['watch','Quan sát những bóng hình lặp lại một động tác','Giữa vườn ô liu phủ sương lam, càng cố ra lệnh dồn dập thì mọi bóng người càng khép kín thành một khuôn cứng nhắc.'],{at:[-6,3],sound:'[Tiếng bước chân đều tắp lặp lại khô khốc trên sỏi]'}),
      Object.assign(['release','Buông tay khỏi sợi dây điều khiển','Khi bạn chịu dừng lại và chờ đợi, một lối rẽ tự nhiên hiện ra giữa hàng cây cổ thụ.'],{at:[1,-3],sound:'[Tiếng lá ô liu xào xạc tự do trong gió đêm]'}),
      Object.assign(['walk','Tự chọn nhịp bước của riêng mình','Giấc mơ không chỉ mặt ai có tội, chỉ nhắc bạn giữ ranh giới giữa dẫn đường và áp đặt.'],{at:[8,-8],sound:'[Tiếng sương đêm nhỏ giọt thanh tĩnh]'})
    ],discoveries:[
      {id:'clay-mask',title:'Chiếc thẻ đất không khắc mặt',at:[-9,-3],variant:'tablet',text:'Ẩn dụ giấc mơ: khi biến người khác thành công cụ, ta chỉ còn thấy vai trò mà quên gương mặt họ.'},
      {id:'open-bench',title:'Ghế đá để trống một nửa',at:[4,3],variant:'bench',text:'Ẩn dụ giấc mơ: chỗ ngồi chờ người đối thoại tự nguyện bước tới.'}
    ],returnAt:[13,-10],start:[-8,6],answers:['Tôi sẽ nói phần mình biết.','Tôi muốn nghe trước khi quyết.','Tôi vẫn chưa buông được.']},

    V04:{title:'Chiếc ghế trống',base:'supper',biome:'room',question:'Khi cha không còn trả lời, phần nào mình sẵn lòng nhận?',steps:[
      Object.assign(['enter','Bước vào căn phòng quen mùi gỗ bến','Chiếc ghế gỗ của cha đặt cạnh bàn đèn như trong ký ức, mộc mạc và lặng lẽ.'],{at:[-6,3],sound:'[Tiếng gió biển xa xăm lùa qua khe cửa gỗ quen thuộc]'}),
      Object.assign(['sit','Ngồi lại một lúc bên chiếc ghế trống','Không có giọng nói siêu nhiên nào vang lên ban lời giải đáp thay cho những chứng cứ bạn đã tự kiểm ngoài đời.'],{at:[0,-3],sound:'[Tiếng bấc đèn dầu cháy đều ấm áp trong phòng tĩnh]'}),
      Object.assign(['door','Mở cửa trở về với những người đang sống','Không phải mọi nỗi niềm với người đã khuất đều cần khép lại trọn vẹn trước khi ta sống tử tế tiếp ngày mai.'],{at:[8,-8],sound:'[Tiếng chốt cửa gỗ mở ra đón nắng sớm ngoài bến]'})
    ],discoveries:[
      {id:'carpenter-mark',title:'Vết thước đo cũ trên mép bàn',at:[-8,-3],variant:'table',text:'Ẩn dụ giấc mơ: ký ức đời thường về người cha thợ bến với cả phần khéo léo lẫn phần lỡ làng.'},
      {id:'warm-lamp',title:'Ngọn đèn chờ người thức dậy',at:[5,2],variant:'lamp',text:'Ẩn dụ giấc mơ: ánh sáng nhỏ dành cho công việc của ngày mai cùng nhóm bạn đồng hành.'}
    ],returnAt:[13,-10],start:[-8,6],answers:['Tôi nhận phần mình đã im lặng.','Tôi chưa biết mình có thể tha thứ chưa.','Tôi muốn trở lại và làm việc đã hứa.']}
  };

  const bonds = [
    {id:'B01',person:'miriam',from:1,title:'Món đồ không bị mất',text:'Miriam đã đổi một món đồ kỷ vật gia đình lấy lương ăn lúc túng ngặt nhưng lại nói với em là đánh mất. Cô muốn tự nói thật với Sela.',choices:[['speak_first','Bố trí để Miriam tự nói trước','Sela được nghe việc thật từ chị rồi tự chọn một ca vừa sức.'],['trace_object_first','Tìm người giữ món đồ trước','Chủ mới không mắc nợ trả miễn phí. Miriam vẫn phải tự giải thích với em.']],callback:'Sela có thể nhận một phần việc; Miriam không còn phải giữ mọi ca.'},
    {id:'B02',person:'damar',from:5,title:'Một mái không cần lời xin lỗi nữa',text:'Gia đình từng chịu thiệt vì cơn nóng giận cũ của Damar chỉ muốn mái hiên được sửa kín mưa và anh thôi tìm gặp họ. Họ chưa sẵn lòng đối diện.',choices:[['work_with_representative','Sửa cùng người đại diện họ chấp nhận','Damar làm trọn phần việc được cho phép rồi lặng lẽ rời đi.'],['supply_trusted_worker','Góp vật và công qua người thợ được tin','Mái nhà được sửa vững mà không ép một cuộc gặp hòa giải gượng gạo.']],callback:'Damar học nhận vai giữ lối thay vì nói hộ người khác.'},
    {id:'B03',person:'lea',from:4,title:'Dòng trống có người sống',text:'Lea thú nhận đã tự ý xóa một cái tên trên bản nháp để người ấy khỏi rắc rối, vô tình làm đứt chuỗi đối chiếu nguồn. Người ấy vốn có quyền không đứng tên.',choices:[['private_record','Xin ghi lại trong hồ sơ kín','Người ấy tự quyết ai được đọc phạm vi của mình.'],['alternative_source','Giữ dòng trống và tìm nguồn khác','Lea ghi rõ lý do giới hạn thay vì tự điền một điều suy đoán.']],callback:'Một dòng trống có lý do, không phải lỗi được phép che bằng suy đoán.'},
    {id:'B04',person:'titus',from:3,title:'Cái chốt người khác đã làm',text:'Titus có một người trẻ xin học nghề sửa trục. Anh luôn lo mình phải gánh hậu quả nếu tay nghề người mới chưa chuẩn.',choices:[['share_real_task','Giao một việc thật rồi thử tải cùng','Anh trao bộ đục và kiên nhẫn đứng cạnh đợi người học việc tự đóng chốt.'],['work_alone_with_limits','Tự sửa và nhận giới hạn nhận việc','Anh chưa nhận kèm người, cũng nói thẳng không thể một mình ôm hết ca bến.']],callback:'Ở chuyến cuối có một cách phân vai khác, thay vì avatar làm hộ mọi người.'},
    {id:'B05',person:'natan',from:3,title:'Bìa sổ và một chuyến thuyền',text:'Chú Natan nhớ Haddai qua những buổi xảm vỏ thuyền cùng nhau tại bến. Ký ức đời thường ấy không dùng để tuyên án hay xóa lỗi.',choices:[['two_memories','Hỏi hai người thợ ở hai thời điểm','Họ nhớ hai lát cắt rất thật và khác nhau về cùng một con người.'],['repair_and_listen','Cùng sửa ván thuyền rồi nghe chú Natan kể','“Lần đầu đóng thuyền, cha con cũng tưởng đóng xong con chốt cuối là hết việc đấy con ạ.”']],callback:'Bạn có thể nhớ cha bằng một việc nhỏ ngoài vụ án.'},
    {id:'B06',person:'rina',from:0,title:'Ai nhận lượt sau',text:'Phần bữa thiếu cần một quy tắc chia phần mà những người chịu ảnh hưởng có thể hiểu và góp tiếng nói. Không ai được đem mạng người ra xếp hạng giá trị.',choices:[['discuss_needs','Hỏi nhu cầu thực rồi cùng thống nhất','Có người khỏe hơn tự nhận lùi ca để người kiệt sức ăn trước.'],['temporary_rule_and_review','Dùng quy tắc tạm và hẹn kiểm lại','Rina nói rõ phần chưa biết, thay vì giả vờ cách chia tạm đã hoàn hảo.']],callback:'Bữa sau cuộc nói có người cùng nhận phần việc, không chỉ lời hứa.'}
  ];

  // Dấu vết để lại trong thế giới đời thường: mỗi mục là một vật thể có hình dạng,
  // một lời mô tả ngắn và một đoạn ghi lại quyết định của người chơi.
  // Chỉ hiện ở đúng vùng đã tạo ra nó. Điều kiện xuất hiện nằm ở witness-model.js.
  const echoMarks=[
    {id:'E-lodging',region:'caesarea',at:[8,-8],variant:'writing-desk',name:'Góc bàn có đèn',line:'Một góc bàn được thuê riêng; giấy vẫn nằm trên mặt bàn sáng.',text:'Góc bàn đã thuê còn là nơi sao giấy và gửi lời.'},
    {id:'E-meal',region:'caesarea',at:[12,7],variant:'lamp',name:'Đèn ở bữa chung',line:'Đèn treo ở sân bữa chung vẫn cháy tới khuya.',text:'Có người nhận ca từ bữa bạn đã góp dầu.'},
    {id:'E-shelter',region:'caesarea',at:[14,10],variant:'bench',name:'Chỗ chờ sau kho',line:'Một ghế dài còn vương vải trùm đêm ở lối sau kho.',text:'Người chuyển bao đã có nơi nhận an toàn.'},
    {id:'E-anonymous',region:'caesarea',at:[19,-4],variant:'basket',name:'Giỏ bản ẩn danh',line:'Trong giỏ có một bản ghi đã bỏ tên, niêm phong lại.',text:'Bản ẩn danh đã được giao; việc bảo vệ còn cần hoàn tất.'},
    {id:'E-bridge',region:'road',at:[-6,-6],variant:'cairn',name:'Đống đá ở lối qua rãnh',line:'Một đống đá nhỏ đánh dấu chỗ ván đã được thay.',text:'Lối qua rãnh đã sửa trở thành đường có thể dùng lại.'},
    {id:'E-tools',region:'caesarea',at:[12,-10],variant:'stakes',name:'Bộ neo chờ trên tuyến',line:'Cọc neo còn dựng ở mép xe, chờ một chuyến đi nữa.',text:'Bộ neo giữ lại từ đêm kho đóng có mặt trên tuyến đồi.'},
    {id:'E-food',region:'caesarea',at:[15,-2],variant:'basket',name:'Giỏ thực phẩm dự phòng',line:'Giỏ lương khô vẫn để trên sàn, đã chia sẵn phần.',text:'Phần thực phẩm dự phòng giảm công huy động bữa khi trở về.'},
    {id:'E-audit',region:'galilee',at:[17,7],variant:'table',name:'Bàn kiểm lượng ở sân',line:'Hai bản số đặt cạnh nhau trên bàn dài ngoài sân.',text:'Cuộc kiểm lượng công khai mở lời giới thiệu qua sân chung.'},
    {id:'E-private',region:'galilee',at:[11,-8],variant:'writing-desk',name:'Bàn đối chiếu riêng',line:'Một bàn kê sau lều, chỉ đủ cho hai người ngồi.',text:'Nguồn đối chiếu riêng mở đường gặp kín.'},
    {id:'E-amon',region:'ravine',at:[18,-12],variant:'hearth',name:'Lửa sưởi bên bờ',line:'Đống lửa nhỏ còn tro ở chỗ kéo người ra.',text:'Amon còn cần chăm sóc sau lần kéo cùng tải.'},
    {id:'E-paper',region:'ravine',at:[12,-6],variant:'tablet',name:'Trang giấy không đọc được',line:'Một trang giấy ướt nằm sấp, chữ đã chảy.',text:'Phần bản phụ bị ướt vẫn được ghi là không đọc được.'},
    {id:'E-father',region:'jerusalem',at:[12,-8],variant:'tablet',name:'Bản đính chính',line:'Một bản ghi mới đặt cạnh bản cũ, dấu đính chính còn rõ.',text:'Nhóm đã nhận bản đính chính; lần giấu trước vẫn được nhớ.'},
    {id:'E-B01',region:'caesarea',at:[-12,2],variant:'cloth',name:'Món đồ đã đổi',line:'Mảnh vải cũ còn gấp ở sân bữa, không ai đòi lại.'},
    {id:'E-B02',region:'galilee',at:[-13,2],variant:'waystone',name:'Lối ra đã mở',line:'Một cọc đá mới đánh dấu lối ra, không còn cần người khác dắt.'},
    {id:'E-B03',region:'galilee',at:[9,8],variant:'writing-desk',name:'Dòng trống có lý do',line:'Trên bàn có một dòng bị bỏ, bên cạnh là lý do được ghi lại.'},
    {id:'E-B04',region:'caesarea',at:[10,-2],variant:'stakes',name:'Cái chốt của người khác',line:'Một chốt mới đóng trên sàn xưởng, ai cũng có thể dùng.'},
    {id:'E-B05',region:'caesarea',at:[-9,-4],variant:'net',name:'Lưới còn ướt',line:'Một tấm lưới phơi cạnh xưởng, vẫn còn mùi biển.'},
    {id:'E-B06',region:'caesarea',at:[4,7],variant:'bread',name:'Bữa chia phần',line:'Bánh đã được chia sẵn, mỗi phần có tên một người nhận.'}
  ];

  const Data={skills,kit,tenets,people,regions,evidence,claims,chapters,legends,veils,bonds,echoMarks,version:'2.0',release:'0.1.0'};
  root.WitnessContent=Data;
  if(typeof module!=='undefined') module.exports=Data;
})(globalThis);
