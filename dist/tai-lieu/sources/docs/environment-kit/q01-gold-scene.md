# Q01 — bản cảnh mẫu để duyệt hình ảnh

Phạm vi: đoạn bến cảng, kho phía tây và Titus. Đây là bản sản xuất để duyệt
mỹ thuật, chưa tự coi là tiêu chuẩn đã được người dùng chấp thuận. Kiến trúc
và diện mạo nhân vật là sáng tác [H], có đối chiếu khảo cổ theo từng vật liệu.

## Cách trải nghiệm

Chơi Q01 bình thường. **Bản đồ → Khám phá kho phía tây → Đi tới cửa kho /
Đi lên sân mái** dẫn nhân vật qua cửa, phòng, 18 bậc thang và mái. Có thể đi
WASD theo cùng tuyến. **V** đổi góc nhìn thứ nhất/thứ ba; trên cảm ứng chọn
góc nhìn trong Tùy chỉnh. Nút **Buổi tối / Ban ngày** ở thanh trên đổi bộ
ánh sáng và giữ nguyên vị trí, tầng, tiến trình. Titus giữ vai đồng hành,
đối thoại và định danh cũ ở khu hàng phía trước kho.

Không gian mái chỉ là quan sát. Xem dây phơi không cấp chứng cứ, quyền công
bố, vật phẩm hoặc điểm nhiệm vụ. Các nhà khác vẫn đóng; cảnh mẫu không mở
mọi mái nhà hoặc bổ sung nhảy/parkour.

## Nội dung được sản xuất

- Kho dùng albedo, normal OpenGL và ORM tách biệt, UV theo mét; chân đá,
  lớp trát, sàn và gỗ có tỷ lệ riêng. Bề mặt so sánh CC0 từ Poly Haven không
  được gọi là mẫu kurkar cổ đã đo. Phần vật liệu đầy đủ 1024 px, nhẹ 512 px.
- Cạnh khối được bo nhỏ bên trong thể tích va chạm; có chân tường đá, mép
  trát bong, khung cửa, lá cửa mở ép vào tường, đai cửa, dầm trần và nắp tường
  chắn mái. Cửa, dầm, giá hàng và bàn mới có collider theo vị trí thực.
- Vò vận chuyển hai quai, chèn gỗ, kệ, bàn thợ, cuộn dây, đèn dầu đất nung,
  vải phơi, kiện hàng có đai và cọc neo. Cây ôliu lá hẹp được dựng riêng
  ở rìa đường làm việc; không dùng ảnh cây như một mặt phẳng thay cả cây.
- Nền lối kho được biên tập lại; đá lát bám mặt đất. Cây/đá sinh tự động
  dưới biển và trong tuyến kho được loại cùng vật cản và thể tích camera
  tương ứng. Thuyền bám mực nước thay vì đáy biển. Nền núi không bao quanh
  hướng nhìn ra biển của Q01.
- Titus có hồ sơ riêng: mặt và tóc, áo lao động lanh không khoác áo dài khi
  làm việc, đai da, dép, dây và túi dụng cụ có đường khâu gắn với khung xương.
  Phần vai áo và màu sử dụng được chỉnh riêng; tư thế chờ dùng idle, thoại
  dùng diễn xuất của hệ nhân vật. Thân người dùng nguồn MakeHuman CC0 và
  bộ rig/biểu cảm hiện có, không phải chân dung lịch sử đã xác định.
- Ban ngày dùng nắng cao, bóng rõ và ánh trời; buổi tối dùng trời xanh lạnh,
  ánh đèn dầu ấm, ngọn bấc và dao động cường độ nhẹ. Ánh sáng bù trong kho
  là xấp xỉ nghệ thuật; chưa có mô phỏng GI đầy đủ hoặc đo quang học đèn cổ.
- Mesh trang trí tĩnh được gộp theo material; lá ôliu dùng instance. Bản HTML
  ngoại tuyến nhúng trực tiếp vật liệu 512 px và giữ kiến trúc/tương tác.

Nguồn theo vật liệu và giới hạn niên đại:
[q01-gold-materials.md](research/q01-gold-materials.md).
Nguồn quét, giấy phép, kích thước và hash:
[sources.json](../../assets/architecture/sources.json).

## Kiểm tra và duyệt

Chạy `npm test`, `npm run build`, `node test/architecture-browser.mjs`,
`node test/q01-gold-browser.mjs` và `npm run test:graphics` trên cùng snapshot.
`WITNESS_BASE_URL` chọn server; `WITNESS_ARCH_OUT` chọn thư mục bằng chứng
kiến trúc riêng để không ghi đè hồ sơ blockout đã nghiệm thu trước đây.

`validation/q01-gold/verification.json` ghi kết quả thực tế, revision, hash
và giới hạn. Ảnh, trace và số đo chi tiết nằm trong `outputs/q01-gold/` của
checkout phát hành. Không coi kết quả scripted là playtest người thật.

Các góc cần người dùng duyệt: mặt tiền từ người thứ ba; cửa và vật liệu ở
tầm mắt; đi trong kho và qua thang; nhìn lại bến từ mái; Titus ở khoảng
giao tiếp; cùng những góc này lúc tối. Sau khi người dùng chấp thuận mới
đổi `art_accepted` và cổng G3 sang đạt. L04 và các chương khác tiếp tục
ở ngoài phạm vi nâng hình ảnh của bản này.

## Số đo bản cảnh mẫu

Lượt đo trên Intel Arc, Chrome headless, drawing buffer 1440 × 900, sau khi
làm nóng: bốn điểm camera có 168–169 frame mỗi điểm. Khoảng giữa các frame
render trung vị khoảng 16,6–16,7 ms; p95 khoảng 18,3–22 ms. CPU gửi lệnh
trung vị 3,1–4,7 ms; không đồng nghĩa thời gian GPU hoặc độ trễ hiển thị.
Đo trước khi chạy các suite browser khác. Xem browser.json để biết góc nhìn,
chất lượng, vị trí, frame shadow và từng số đo.

Kho khoảng 11.904 tam giác; phần trang trí/cây khoảng 48.088; Titus khoảng
63.210 sau khi bỏ 950 tam giác che mắt. Nhân vật này vượt ngân sách
hero khởi điểm 12.000. Catalog ghi ngoại lệ 70.000 cho mẫu cận cảnh; chưa
coi là đạt mục tiêu mobile hoặc LOD cuối. Đỉnh p95 toàn khung có shadow/AO
khoảng 1,28 triệu tam giác và 417 lệnh vẽ, vượt mục tiêu 250 lệnh. Giữ G4 mở
cho tối ưu/thiết bị thật; không đổi các mục tiêu thành kết quả đạt chỉ vì
máy laptop đang render ổn định. Chưa đo VRAM tổng, thời gian trình chiếu,
độ trễ đầu vào hoặc điện thoại vật lý.
