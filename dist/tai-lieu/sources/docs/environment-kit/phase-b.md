# Giai đoạn B — Q01 Environment Art

Phạm vi: chất lượng nhất quán trên tuyến chơi Q01, gồm sân hàng và các điểm
nhiệm vụ chính, vùng chuyển vào kho phía tây, cửa, nội thất, thang, mái, bến.
Kế thừa va chạm nhiều tầng và tiến trình; không mở quyền đi vào các kho nền.
Mỹ thuật là phục dựng [H] có [hồ sơ nguồn](research/q01-phase-b-materials.md).

## PR-04 — Không gian Q01 v6 có thể đi kiểm

Nguồn không gian mới là `witness-q01-greybox.js`; mở `q01-greybox.html`
từ liên kết trên màn hình đầu. Đây là level dùng cùng engine/Three/controller
và capsule của game, có đi bộ theo phím hoặc chọn điểm đến. Candidate này
không tự kích hoạt v6, gọi reducer truyện hoặc ghi bản lưu campaign.
`tools/build.cjs` đóng gói cùng bản web/cloud và tạo `q01-greybox-offline.html`.
Kho Phase B cũ vẫn phục vụ campaign v3; phép kiểm lịch sử bên dưới không
chứng nhận level PR-04.

Blueprint có bốn vùng chức năng, không phải bốn tầng nhà xếp chồng:

| Vùng | Cao độ, kích thước sử dụng | Kết nối và công việc |
| --- | --- | --- |
| C0 | Sân 61 × 44 m, mốc 0; sàn thuyền +0,18 m | Ván thật, hẻm/xưởng, Q01.LOAD, bàn Natan, xe cứu hộ riêng, tay dây tới được từ sân, thợ/đòn, hiên Yosef, bếp/chỗ nghỉ, B06/bàn giao |
| C1 | Kho 14 × 14 m; gác +2,52 m | Cửa chính rộng 2,4 m, cao thông thủy 2,35 m; xà gãy chặn lối; lối phụ qua cửa gác; hai người chờ, cùng chiếu nghỉ lên mái |
| C−1 | Rãnh rộng 2,2 m, đáy −1,26 m | 7 bậc, nhánh cụt khảo sát; không có vật bắt buộc hoặc tuyến cứu hộ thứ ba |
| C+1 | Sân mái +5,04 m, có giếng thang và lan can | Sàn tời/đường dây, điểm nhận đủ ba dấu người, điểm nhìn hẻm sau/bến nhỏ, cầu nối sang thang xuống C0 |

Mỗi flight cứu hộ/thang trên có 14 bậc, cao 0,18 m, mặt 0,32 m, rộng
1,8 m. Đường xuống ngoài có hai flight và chiếu đổi hướng. Tất cả độ cao
là bố trí sáng tác [H] đã kiểm với capsule, không là số đo khảo cổ hoặc
tiêu chuẩn xây dựng. Render và collision dùng cùng hộp nguồn; tường/cửa,
trần, khoảng giếng, rãnh và sàn thật thay cho nền trang trí. Phần tĩnh được
instance theo vật liệu; vật động giữ riêng để mesh và volume thay cùng lúc.

**Hợp đồng nối PR-05:** `WitnessQ01Greybox.create()` trả physics cùng
`anchors`, `beats`, `setPreview()` và `projectScene(sceneProgress.Q01)`;
`mount(T, scene, physics)` dùng đúng Three instance, trả `actors`,
`tick`, `setAnnotations`, `dispose`. `beats` là điểm gắn đủ 00–08, không phải
completion. `projectScene` đọc cấu trúc `rescue.route/steps` thật của PR-03,
không mutate state và không gọi `q01SceneEvent`. Module có sẵn trong web và
standalone game để presenter dùng; PR-05 còn sở hữu tích hợp mặc định,
blocking/thoại/diễn xuất, điều kiện chốt hành động và camera/sáng theo Beat.

`mechanical`: chuẩn bị xe → kéo tời tại C0 → chỉ mở cánh ngăn lối phụ;
xà lối chính vẫn chắn. `manual`: tập hợp thợ → kê/chèn xà vào chỗ tựa →
chỉ mở lối chính; xe và cánh ngăn cơ học không đổi. Hai tuyến tới cùng
gác; cửa chung lên mái và chốt thang ngoài mở riêng. `world.sideExit=open`
chỉ chiếu lên đường chung, không tự mở cánh ngăn cơ học. Cánh nâng có hộp
va chạm tại vị trí giữ cao; xà đã dịch vẫn hiện và có volume tại chỗ kê.
Chốt chân thang ngoài ngăn việc đi tắt tới người mắc kẹt trước cứu hộ.

Giữ nguyên họ support ID đã được model/server chấp nhận (`q01-room`,
`q01-quay`, `q01-drain`, `q01-mezzanine`, `q01-landing`, `q01-roof-main`,
`q01-step-0..13`). ID bậc có thể dùng ở nhiều flight: x/y/z + support ID
xác định đúng patch khi restore. Không nâng schema/namespace, không sửa
model hay bake GI cũ. Khi PR-05 chọn topology v6, phải dùng checkpoint hợp
lệ của cảnh mới; không nạp mù cao độ mái 3,24 m của kho v3 vào mái 5,04 m.
Titus/Simeon/người học việc trong lab là proxy tỷ lệ; lệnh thử nhóm cho
đi đường thật, không chứng nhận choreography/điều kiện `exit`/`extract` của
truyện đã được PR-05 triển khai.

Kiểm tái lập: `npm run test:q01-greybox` và
`npm run test:q01-greybox-browser`. Browser test nhận `WITNESS_GREYBOX_URL`,
`WITNESS_GREYBOX_OFFLINE`, `WITNESS_GREYBOX_OUT`; mặc định xuất trace/ảnh/hash
vào `outputs/agent-work/q01-pr04-evidence`. `WEB_ONLY=1` và `SMOKE=1` dưới
prefix `WITNESS_GREYBOX_` chỉ dùng vòng sửa nhanh; không coi đó là matrix đầy đủ.
Driver tăng đồng hồ animation 4× để rút thời gian chạy ma trận; mỗi frame vẫn
qua controller/capsule và render thật. Không dùng số giây này để đo thời lượng
chơi hoặc FPS. Trace kiểm mesh/sàn/camera mỗi 40 ms thời gian thực.
Nhãn/mốc dựng cảnh mặc định ẩn, bật bằng “Hiện nhãn không gian”; không đặt
bảng debug vào góc nhìn xuống hẻm. Góc nhìn Beat 05 qua lan can có khe thật,
vẫn chặn capsule. Ca unit kiểm cả góc khuất Beat 01 và hai tia tới hẻm/bến nhỏ.

Kiểm hồi quy phát hiện mép top cap bo vào khoảng vài mm ở bậc kho Phase B cũ,
trong khi volume/surface giữ nguyên footprint. Producer `geometry()` nay giữ
X/Z gốc của toàn top cap; `test/q01-env.cjs` bắn tia cách mỗi mép 1 mm. Không
sửa volume để che khe hoặc hạ yêu cầu của browser test. Probe trước/sau lưu
ở `outputs/agent-work/q01-pr04-evidence/legacy-top-edge.json`. Bake proxy AABB
không đổi; kiểm freshness GI vẫn phải đạt trên candidate cuối.
Kết quả đúng candidate được ghi ở STATUS sau khi chạy; G3/G4 không tự đóng.
Snapshot máy kiểm của candidate hiện tại ở
[verification PR-04](validation/q01-pr04/verification.json); trace/ảnh gốc ở
`outputs/agent-work/q01-pr04-evidence`, giữ hash bản HTML ngoại tuyến và nguồn.

## Bộ kit và vật liệu

### PR-05 — Nối vào campaign và hoàn thiện candidate

`witness-q01-campaign.js` dùng trực tiếp blueprint/physics PR-04, thay entry
greybox độc lập bằng tuyến tạo nhân vật mới trong campaign. Model và
`witness-q01-interaction.js` kiểm khoảng cách/cao độ, người cùng làm và tiền đề
của bước; presenter không ghi trực tiếp rescue completion, vật chứng hoặc chi phí.
Hai người được cứu, Titus và Natan dùng đường đi capsule, có điểm đứng riêng;
load chỉ dàn lại cả nhóm tại các checkpoint được 07 cho phép.
Người lạ vòng qua cửa/góc xưởng bằng cùng controller. Nhật ký riêng suy từ
task và scene flag đã lưu, nên nhận sổ trước quan sát, bốn giới hạn từ mái và
yêu cầu giữ kín vẫn đọc lại được sau restore, không cần tạo evidence hoặc consent.

`witness-q01-art.js` giữ cùng vỏ va chạm, bổ sung vật liệu PBR đã có nguồn,
nhân vật rig, đạo cụ sổ/bìa/bọc/vải riêng, biển trong thế giới, đèn dầu, khói/lửa
cục bộ và hậu cảnh cảng [H]. Mặt nước dùng shader sóng/normal/reflection sẵn có;
cảnh có bốn bộ ánh sáng chiều/chạng vạng/đêm/rạng sáng và chuyển sau chọn nghỉ.
Không sử dụng GI nướng của kho v3 cho không gian mới. Hậu cảnh không mở lối đi
ngoài boundary hoặc xác nhận một phục dựng khảo cổ.
Lớp ambience đồng cỏ cũ không sinh lại trong sân lát của candidate. Cú máy mở
bến dài 4,8 giây chỉ đổi camera gần thuyền, dùng swept clearance hiện hành;
không đổi vị trí avatar hoặc tự chốt `disembark`. Chế độ giảm chuyển động/góc
nhìn thứ nhất nhận điều khiển ngay; có nút mở cảnh tùy chọn và nhận điều khiển sớm.
Bảng dẫn đường nhường chỗ cho đối thoại và phần việc hiện trường.
Mặt nước lớn dùng normal/đỉnh sóng tính tại fragment để tránh hiện lưới tam giác
của mesh xa; bọt trong lòng cảng được giảm riêng, không đổi các vùng cũ.
Producer normal chỉ tạo bốn lattice một lần thay vì lặp cho từng pixel; đối
chứng byte ở `outputs/agent-work/q01-pr05-final/water-normal-producer.json`
giữ nguyên 262.144 byte. Số đo CPU đó không là chứng nhận FPS.
Camera mở bến đi ở ngoài mạn/lái rồi nâng lên vai, sweep từ vị trí camera trước
để không bị lan can ép vào chân avatar. Lời nhắc sau load đọc phần việc hiện tại.
Điểm tiếp cận Titus/hai thợ/điểm nhận tách khỏi vị trí đứng của họ nhưng vẫn
trong tiền đề model tại anchor gốc. Titus đứng riêng với hai thợ ở đòn bẩy;
nhóm xuống thang ngoài lần lượt để giữ khoảng cách. Bài kiểm góc nhìn thứ nhất
từ chối chốt lượt nếu camera nằm trong đầu NPC tại điểm tương tác.
Mép các khối đặc không đi được được bo trong envelope gốc; mặt đi/bậc/cơ cấu
động giữ nguyên. Trang trí tĩnh được batch riêng khỏi lửa/đèn/nhân vật và sổ
đang cầm. Thân thuyền [H] nằm dưới mặt sàn; góc mở bến nhìn qua lan can từ cao
độ đủ thấy avatar. Ở cảnh đêm, Natan ngồi cả khi nói lẫn nghe; chỉ khẩu hình
người đang nói hoạt động. Rig ngồi lùi lên đúng ghế trong khi capsule đứng ở
phía trước; cloth pins nhận cùng độ dịch xương, không dời root qua vật cản.
Điểm nói chuyện ở phía sau xưởng, có điều kiện tầm nhìn tới Natan ở cả presenter
và model. Góc nhìn thứ nhất quay về người đang trò chuyện mà không dời avatar;
ảnh gameplay đêm và phép kiểm đầu nhân vật không bị tường che đi cùng lượt cuối.
Rig ngồi thay nghiệm IK đứng, tránh cộng hai lần góc gập chân. Neo áo choàng
lấy đầy đủ biến đổi xương cha; cả CPU/GPU cloth nhận cùng rest-frame và capsule
cơ thể. Vải đã có normal/roughness riêng, không chồng relief địa hình lên áo.

Âm thanh nằm ở `assets/audio/q01/`: producer `tools/prepare-q01-sound.cjs`
sinh 11 file ambience/foley/nhạc ngắn cùng ledger hash. Bản thoại Natan có năm
câu ở Beat 07, nguồn/giới hạn ở `voice-sources.json`; các vai còn lại chưa đủ bản
thu vì dịch vụ tạo thoại báo bận. Không gọi đó là full voice acting.

`npm run test:q01-campaign-browser` kiểm ma trận 16 tổ hợp bằng form tạo mới,
nút trong game và controller thật. Nó kiểm nhận sổ trước chốt đường khâu,
prefix hai tuyến, hộ tống, đặt phần việc chưa trả phí, B06, commit và mở Q02;
trace độc lập đo mesh/body/camera/dấu chân và bước nhảy vị trí.
`WITNESS_Q01_SMOKE=1` chọn một tổ hợp chơi trọn chương; một lượt đơn chỉ xác
nhận tổ hợp ấy. Cổng quyết định phải gồm cả hai tuyến trên cùng candidate.
Kết quả phải gắn đúng hash/candidate;
không suy nghiệm thu từ mã bài kiểm. G3/G4 và artAccepted giữ nguồn duyệt cũ.

- Phân vai đá xây được sửa mặt, lõi đá thô, vữa vôi, mặt lát chịu mài mòn,
  mái trát, gỗ, dây, sắt và đất nén. Hai bộ PBR bổ sung có nguồn, giấy phép,
  hash và pipeline tái tạo trong `assets/architecture/phase-b/sources.json`.
- Tường kho có chân đá theo hàng và lớp trát với mép không đều. Các kho nền
  dùng cùng tỷ lệ hàng đá, mái phẳng, đá đỉnh, khung cửa và cửa chớp; không
  kéo giãn một module GLB 4 m thành mọi kích thước tường.
- Cửa chính gồm từng ván, khe, thanh ngang, đai và đinh sắt, vòng kéo. Mặt
  gỗ và đá có biến thiên lớn theo vị trí thế giới; normal/ORM giữ đúng màu
  tuyến tính, albedo sRGB. Dấu ẩm, muối và mài mòn thay đổi theo chức năng.
- Mặt lát so le, đá rìa rời, chân tường tiếp đất, bao hàng, mảnh đá nhỏ và
  đá neo làm rõ các vùng tiếp xúc. Props lớn có thể tích va chạm tương ứng.
- Đường bờ được biên tập riêng, có đá móng, mặt kè, đá đỉnh và nền biển dốc;
  mặt nước chồng vào vùng bờ theo độ sâu. Địa hình và lối đi tiếp nối từ sân
  hàng qua các điểm nhiệm vụ đến kho và mép bến.
- Mặt bằng cảng được san nối qua cả vùng camera phía sau nhân vật; không
  dùng các mảng nền phẳng rời giữa đồi cũ. Cỏ, đá và prefab khởi tạo từ
  địa hình cũ được dọn khỏi khu làm việc, giữ hai cây ôliu có chủ đích.
- Mái che, các kho đóng và hàng cột có va chạm 3D cho camera và nhân vật.
  Điều hướng ngoài trời kiểm tra quét từng đoạn với cùng bộ giải capsule,
  tránh kẹt vào thân cây nằm giữa hai nút lưới vốn đều thông thoáng.
- Hai ô thông sáng cao ở tường sau có lỗ hình học/va chạm và tham gia bake;
  kế hoạch, kích thước và chi tiết khung là [H]. Chúng không mở lối cho người.

## GI tĩnh

`tools/bake-q01-gi.cjs` tạo hai bộ irradiance SH9 cho thể tích nội thất kho.
550 probe mỗi trạng thái, 512 hướng Fibonacci/probe, ba lần phản xạ khuếch
tán; visibility kiểm bằng AABB của kết cấu, dầm và các proxy hàng hóa. Sky
visibility, ánh mặt trời/mặt trăng và đèn dầu phản xạ được tính lúc bake.
Ánh trực tiếp vẫn dùng đèn runtime; bỏ đèn bù điểm cũ trong kho.
Phơi sáng thích nghi theo camera khi đi vào/ra nội thất; giá trị mỹ thuật
được khai báo riêng, không thay dữ liệu radiance đã bake.

Shader nội suy trường đã bake theo vị trí và normal, thay ánh môi trường
không che khuất bên trong kho. Chuyển ngày/tối chọn dữ liệu tương ứng.
Tập dữ liệu đi cùng JavaScript của bản ngoại tuyến; build kiểm hash đầu vào
và từ chối dữ liệu cũ. Không có bước dò tia hoặc bounce mỗi frame.

Đây là diffuse probe GI có proxy AABB và albedo trung bình, không phải
lightmap tam giác siêu phân giải hoặc GI thời gian thực. Bề mặt chuyển động
nhận ánh tĩnh nhưng không được bake thành vật cản; thể tích probe chỉ bao
kho. Cảnh ngoài trời giữ ánh trời/PMREM, bóng trực tiếp và contact AO.
Chi tiết toán học, độ lượng tử và giới hạn nằm trong `gi-bake.json`.

## Nghiệm thu toàn tuyến

`test/q01-phase-b-browser.mjs` đi liên tục bằng controller, ghi vị trí và
camera chơi ở từng điểm. Không dùng camera quảng bá hoặc dịch chuyển qua
tường để thay lượt đi. Các điểm bao gồm:

1. Sân hàng Titus; lối vào kho; ngưỡng cửa.
2. Góc hàng trong kho; nhìn ngược về cửa; chân thang; giữa thang.
3. Chiếu nghỉ mái; nhìn ra cảng từ mái; vùng tiếp bến; mép bến.
4. Xe hàng; sân Natan; Rina; chỗ trọ; cổng; góc tới bến.

Mỗi điểm có góc nhìn thứ nhất/thứ ba, ban ngày/buổi tối. Trang
`outputs/q01-phase-b/review.html` lọc theo điểm, thời điểm và góc nhìn;
bốn contact sheet thể hiện toàn tuyến, ảnh gốc giữ nguyên UI chơi.
Kiểm thêm tuyến thang bằng phím, va chạm camera, lưu/tải tầng, tương tác
nhiệm vụ, bản HTML khi chặn HTTP và chất lượng đồ họa ngoài Q01.

Kết quả và trạng thái mỹ thuật cuối nằm ở
`validation/phase-b/verification.json`. Kết quả scripted không tự chứng nhận
chất lượng AAA hoặc thay playtest và phê duyệt hình ảnh của người dùng.
