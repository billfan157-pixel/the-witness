# Giai đoạn B — Q01 Environment Art

Phạm vi: chất lượng nhất quán trên tuyến chơi Q01, gồm sân hàng và các điểm
nhiệm vụ chính, vùng chuyển vào kho phía tây, cửa, nội thất, thang, mái, bến.
Kế thừa va chạm nhiều tầng và tiến trình; không mở quyền đi vào các kho nền.
Mỹ thuật là phục dựng [H] có [hồ sơ nguồn](research/q01-phase-b-materials.md).

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
