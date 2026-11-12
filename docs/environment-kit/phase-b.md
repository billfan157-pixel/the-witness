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
