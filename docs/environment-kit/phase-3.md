# Kiến trúc đi lại được tại Q01

Phase 3 dựng một kho phía tây ở Q01 thành tuyến bến → cửa → phòng → cầu
thang → sân mái → trở về bến. Đây là mô hình thô có công năng, thuộc sáng tác
[H], không phải bản phục dựng một căn nhà khảo cổ cụ thể. Mẫu mỹ thuật và
vật liệu cuối thuộc phase 4. Các nhà ngoài tuyến vẫn khai báo phạm vi đóng.

Trong bản chơi, mở Bản đồ rồi chọn **Khám phá kho phía tây**. Có thể chỉ
hướng tới cửa hoặc sân mái; WASD, cảm ứng và góc nhìn thứ nhất/thứ ba dùng
chung hệ di chuyển. Vật trên mái chỉ mở phần quan sát, không cấp chứng cứ,
đồng thuận, kỹ năng, phần thưởng hoặc hoàn tất nhiệm vụ.

## Hình học và kích thước

Kho rộng 9 m, sâu 8 m. Cửa rộng 1,9 m, cao thông thủy 2,3 m. Mái cao
3,24 m tính từ sàn phòng; lớp mái dày 0,22 m, khoảng trống dưới trần 3,02 m.
Mười tám bậc cao 0,18 m, sâu 0,30 m; lòng thang rộng 1,70 m. Chiếu nghỉ
sau sâu 1,45 m, có khoảng trống trước chân thang để quay lại. Mép mái có
tường chắn cao 0,94 m; khoảng mở cầu thang có chắn riêng và lối thông ở đầu
chiếu nghỉ. Những kích thước này là lựa chọn cho gameplay [H].

Các tường, sàn, trần, bậc, lan can và vật tương tác đều được dựng từ dữ liệu
trong `witness-architecture.js`. Mesh và collider dùng chung thông số. Nền
đất được san dưới nhà và chuyển tiếp ở cửa; cây/cỏ sinh tự động không chiếm
lòng nhà. Không dùng một khối nhà kín hoặc một texture cầu thang thay tuyến.

## Di chuyển và dẫn đường

Nhân vật dùng capsule đứng cao 1,70 m, bán kính 0,29 m. Kiểm tra capsule
với thể tích AABB có xét cả phần đầu và chân tròn. Chuyển động chia thành
bước tối đa 0,075 m, thử trượt dọc tường khi bị chặn. Ngưỡng lên bậc 0,22 m,
xuống bậc 0,25 m. Mỗi bước phải còn sàn đỡ và đủ chỗ cho thân người.

Sàn phòng, từng bậc và từng phần mái có support ID riêng. Hai mặt sàn cùng
x,z vẫn tồn tại độc lập; controller chọn sàn theo độ cao đang đứng và khoảng
bậc cho phép. Chưa có nhảy, parkour hoặc vật thể động chở người. Bước ra
vùng thiếu sàn đỡ hoặc xuống quá ngưỡng bị chặn; mép mái có chắn vật lý.

Tuyến ngoài nhà dùng bộ tìm đường mặt bằng hiện có; tuyến trong nhà nối qua
cửa, chân thang, các bậc và chiếu nghỉ. Mỗi liên kết được thử bằng chuyển
động có sàn đỡ, thay vì nối hai tọa độ gần nhau qua tầng. Điểm chuyển hướng
trong nhà phải được tiếp cận đủ gần trước khi rẽ. Vật trên mái có điểm đứng
quan sát tách khỏi thể tích vật cản.

NPC và nhiệm vụ hiện có nằm ngoài tuyến mới; phase 3 không bổ sung nhiệm vụ
đưa NPC lên mái. Bộ đặt nhân vật và bộ va chạm chia sẻ thông tin độ cao;
việc thêm một NPC có đích trên mái sau này vẫn phải khai báo tuyến, tầng và
điều kiện tương tác cho NPC đó rồi kiểm tra riêng.

## Camera và tương tác

Camera góc ba được chặn bằng đoạn quét có khoảng hở 0,18 m với tường,
trần, mái và vật cản. Kiểm tra diễn ra sau khi nội suy camera, nên nội suy
không kéo camera xuyên trần. Trong phòng hẹp camera thu gần, ẩn mô hình
nhân vật khi che tầm nhìn. Góc nhất giữ điểm mắt theo độ cao sàn thực tế.

Điểm tương tác có độ cao sàn và support ID. Cần đủ gần trong 3D, chênh độ
cao hợp lệ và có đường nhìn không xuyên vật cản. Marker trên mái không hiển
thị xuyên trần cho người ở trong phòng. Kiểm tra thao tác trong model cũng
từ chối dùng các việc tầng dưới khi snapshot đang ở mái hoặc trên thang.

## Bản lưu và địa hình

Giữ `positions` dạng [x,z] để tương thích dữ liệu cũ. Trường mới
`spatialPositions` lưu schema 1, x/y/z và support ID theo từng cảnh/lớp.
Dữ liệu nhập được giới hạn số lượng, tọa độ và tập ID; không chấp nhận NaN,
Infinity hoặc sàn bịa. Khi khôi phục, đối chiếu mặt sàn và khoảng trống thật.
Snapshot sai không thể đặt người trong tường, dưới sàn hoặc lên mái tùy ý.

Lưu giữa cầu thang giữ đúng bậc; lưu trên mái giữ đúng mái. Bản lưu cũ chỉ
có [x,z] chọn mặt đất/sàn phòng an toàn. Rời chương hoặc lớp vẫn dùng khóa
cảnh riêng, không ghi vị trí mái thành vị trí của một chương khác.

Độ cao nền được nội suy theo đúng tam giác của lưới địa hình cuối cùng,
sau khi chỉnh đáy biển và san nền, thay cho hàm đồi giải tích trước đó.
Sampler này dùng chung cho nhân vật, vật thể và các điểm neo hiện trường.

## Nguồn thực thi và bằng chứng

- `witness-architecture.js`: dữ liệu nhà, mesh, support, capsule, đường đi,
  camera, marker và nội dung quan sát [H].
- `tools/environment-kit/engine-runtime.js`: nguồn đọc được của player runtime.
  `build-engine.cjs` ghép vào lõi Three r187 đã pin, kiểm hash phần lõi trước
  khi build; không đưa một Three khác vào game.
- `witness-world.js`: thay riêng công trình Q01, chuẩn hóa độ cao nền và đặt
  công trình vào cảnh thật. `witness-app.js` nối bản đồ, tương tác và lưu vị trí.
- `witness-model.js`: di trú/sàng lọc snapshot và chặn thao tác xuyên tầng.
- `test/architecture.cjs`: tuyến liên tục, chống xuyên nhanh, khoảng bậc,
  góc lintel, trần, camera, sàn chồng, dữ liệu nhập và tương thích save cũ.
- `test/architecture-browser.mjs`: đi thật trong engine bằng dẫn đường và W,
  cả hai camera, lưu/tải giữa thang và trên mái, kiểm nhiệm vụ Q01 và lặp tuyến
  trong file tự chứa khi mọi HTTP bị chặn. Dấu vết từng frame và ảnh được lưu
  dưới `outputs/environment-kit/phase3/`.

Kiểm nghiệm thêm trực tiếp với Box3 và raycast của mesh hiển thị; không chỉ
đọc kết quả từ hàm collider. Kết quả cuối cùng và mã nguồn tương ứng được ghi
trong `validation/phase3/`. Kiểm tra scripted không là playtest người thật
hoặc số đo hiệu năng điện thoại. Không tính blockout này thành mỹ thuật cuối.
