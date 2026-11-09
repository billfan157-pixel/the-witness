# Lộ trình phát triển bộ tài nguyên môi trường THE WITNESS

## Quyết định của người dùng ngày 9 tháng 11 năm 2026

Tài liệu này điều chỉnh cách hiểu và triển khai bản Environment Kit Roadmap
8 weeks sau khi nghiên cứu tài liệu và nhận được các quyết định dưới đây.
Đây là lộ trình làm việc chính thức cho việc build tài nguyên môi trường.
Đọc cùng standards.md và look-bible.md; cập nhật catalog.csv khi thêm asset,
progress.json khi có bằng chứng mới. Trạng thái tài liệu không thay thế bằng
chứng runtime. Bản Word đi kèm là phiên bản cập nhật của tài liệu người dùng.

- AI thực hiện toàn bộ phần build dự án. Không lập kế hoạch phụ thuộc vào người
  dùng tự dựng model, làm UV, sửa cảnh hoặc lập trình.
- Chất lượng được ưu tiên hơn việc hoàn thành đúng tám tuần. Q01 là phạm vi bắt
  buộc; L04 là phần mở rộng. Tám tuần là khung tham khảo, không là hạn cứng.
- Bản ngoại tuyến có thể nhẹ hơn bản web.
- Kiến trúc phải có thể trải nghiệm thực sự, không chỉ dùng làm cảnh nền.

Giả định cũ về một người tự sản xuất asset trong 15–20 giờ mỗi tuần không còn
phù hợp. Thay vào đó, tiến độ được quản lý bằng đầu ra kiểm chứng được và các
vòng AI tạo, tích hợp, kiểm tra rồi sửa. AI đảm nhận sản xuất không tự bảo đảm
chất lượng, độ đúng lịch sử hay hiệu năng; những phần này vẫn cần bằng chứng.

## Phạm vi trải nghiệm được đề xuất

Q01 cần một tuyến chơi liên tục đi từ bến cảng vào một công trình, qua cầu
thang lên tầng hoặc mái, tương tác với một vật thể và trở lại đường chính.
Tuyến này phải hoạt động trong gameplay bình thường, bằng cả góc nhìn thứ
nhất và thứ ba, không dùng dịch chuyển xuyên tường để thay cho việc di chuyển.

Công trình nằm trên tuyến phải có cửa đi qua được, mặt sàn đỡ nhân vật, tường
và trần có va chạm, cầu thang đi được và ranh giới mái rõ ràng. Vật thể chỉ có
hình dáng cầu thang nhưng không đi được không đạt yêu cầu.

Điều này chưa có nghĩa mọi nhà hoặc mọi mái trong toàn bộ game đều truy cập
được. Mỗi công trình cần khai báo phạm vi truy cập. Những công trình chưa hỗ
trợ phải thể hiện giới hạn rõ ràng và không được tính là kiến trúc đã nghiệm thu.
Khả năng nhảy, bám mép, leo tường và parkour chưa được người dùng yêu cầu.

## Hiện trạng cần kế thừa

Game đã có MSAA thích ứng tới 4 mẫu, GTAO, bóng bám người chơi, LUT theo cảnh,
height fog, địa hình bốn lớp PBR và sửa các cờ noSurface/noCast truyền nhầm vào
material. Đây là nền tảng để tiếp tục, không phải danh sách việc phải làm lại.

Địa hình hiện tại chưa phải hai heightmap được tác giả biên tập riêng. Pipeline
GLB/KTX2/Meshopt đã có mẫu PBR, codec cục bộ và kiểm tra lifecycle/offline;
kiến trúc di chuyển nhiều tầng vẫn cần phát triển. Collision
mặt bằng kết hợp một hàm độ cao không đủ để biểu diễn hai mặt sàn chồng lên
nhau, chẳng hạn mặt đất và mái nhà ở cùng tọa độ x,z.

## Các giai đoạn và điều kiện chuyển tiếp

### 1 Chốt tiêu chuẩn và baseline

Lập Look Bible, sổ asset và nguồn chứng cứ, quy ước đơn vị, pivot, vật liệu và
collision. Ghi lại ảnh và hành vi Q01/L04 của bản hiện tại. Xác định thiết bị
tham chiếu và ghi rõ phần kiểm tra nào chỉ chạy bằng trình duyệt giả lập.

Đạt khi có baseline tái lập được, phạm vi Q01 rõ và catalog phân biệt tài nguyên
bắt buộc với tài nguyên mở rộng. Không tạo toàn bộ danh mục asset ngay lúc này.

### 2 Chứng minh pipeline asset do AI sản xuất

AI tạo hoặc chuyển đổi asset bằng script có thể chạy lại; lưu nguồn có thể
chỉnh sửa, cấu hình export và manifest. Loader dùng cùng Three instance với
engine. Đóng gói decoder/transcoder và kiểm tra tải lỗi, đổi cảnh khi đang tải,
chia sẻ tài nguyên và giải phóng tài nguyên.

Đạt khi một module thử đi hết đường sản xuất, tải, hiển thị, đặt nhiều instance
và đóng gói ngoại tuyến. Phiên bản nhẹ không được làm gameplay hỏng khi thiếu
asset chất lượng cao. Chưa cần thêm nhiều loại module.

### 3 Chứng minh kiến trúc đi lại được bằng mô hình thô

Làm tuyến bến, cửa, phòng, cầu thang, mái và đường trở lại trước khi trang trí
chi tiết. Triển khai nhân vật có thể được đỡ bởi nhiều mặt sàn, collision 3D,
xử lý bậc thang và dốc, mép mái, camera trong phòng và dưới trần.

Nếu NPC hoặc dẫn đường cần đi qua tuyến, hệ điều hướng phải hiểu tầng, cửa,
cầu thang và liên kết giữa chúng. Không dùng khoảng cách trên mặt bằng để kết
luận mục tiêu ở tầng trên đã nằm trong tầm tương tác.

Đạt khi tuyến hoạt động trong cả hai góc nhìn; nhân vật không xuyên tường,
lọt sàn, mắc ở cửa hoặc tương tác xuyên tầng. Lưu rồi tải lại phải khôi phục
đúng vị trí và tầng. Các nhiệm vụ hiện có vẫn hoạt động.

### 4 Hoàn thiện một góc hình ảnh Q01

Hoàn thiện một khu vực có thể đi lại được với đất, mép bến, chân tường, cửa,
vật dụng và ánh sáng. Đánh giá tại tầm mắt, góc nhìn thứ ba và nhiều khoảng
cách; kiểm tra tỷ lệ, độ lặp texture, đường nối module và tiếp xúc với địa hình.

Đạt khi khu vực này có chất lượng đủ làm mẫu cho phần Q01 còn lại, đồng thời
giữ được các hành vi đã qua ở giai đoạn 3. Không nghiệm thu chỉ bằng một ảnh
đẹp có camera cố định.

### 5 Hoàn thiện Q01 bằng bộ kit tối thiểu

Chỉ bổ sung module, cây, đá và props cần cho tuyến chơi và khung hình Q01.
Giữ mục tiêu tương tác, lối nhiệm vụ và các điểm giao nhận hợp lệ sau khi đổi
model. Tài nguyên đẹp nhưng chưa phục vụ cảnh không được ưu tiên hơn lỗi
gameplay hoặc lỗi hình ảnh trên tuyến chính.

Đạt khi Q01 chơi liên tục được, không còn vật thể tạm trên tuyến nghiệm thu,
có hồ sơ nguồn và có bằng chứng kiểm tra chức năng, hình ảnh và hiệu năng.

### 6 Tối ưu và hoàn thiện bản ngoại tuyến nhẹ

Giảm độ phân giải texture, LOD, mật độ cây cỏ và hiệu ứng trước. Giữ các cửa,
cầu thang, sàn và tương tác cần thiết cho tuyến chơi. Có thể dùng model đơn
giản thay thế, nhưng không biến nhà đi vào được thành khối nhà kín.

Đạt khi bản nhẹ chơi được cùng tuyến và dùng cùng dữ liệu tiến trình; không
phụ thuộc tải mạng lúc chơi. Kiểm tra riêng lần mở đầu, tải lại save, đổi cảnh
và tình huống thiếu tài nguyên. Ngân sách dung lượng phải được xác định từ
bản đóng gói thử, không tự gán một con số chưa đo.

### 7 Mở rộng L04 sau khi Q01 đạt

Tái sử dụng pipeline và nền di chuyển; bổ sung vật liệu basalt, bờ hồ, thuyền,
lưới và các module thật sự cần cho cảnh. Việc đi lên thuyền hoặc thuyền có
chuyển động cần tiêu chí riêng nếu được đưa vào phạm vi; không mặc nhiên xem
đó là khả năng đã có từ kiến trúc nhiều tầng.

Đạt khi L04 có chất lượng nhất quán và không làm hỏng Q01. Khi nguồn lực thực
thi chưa đủ, tiếp tục hoàn thiện Q01 thay vì hạ chất lượng cả hai cảnh.

### 8 Kiểm tra và đóng gói bằng chứng

Chạy các bộ kiểm tra chức năng hiện có cùng kiểm tra đồ họa và tuyến kiến
trúc mới. Lưu ảnh so sánh cố định, video đi qua tuyến nếu công cụ cho phép,
kết quả ngân sách asset và số đo hiệu năng theo thiết bị, độ phân giải, mức
chất lượng. Phân biệt rõ kiểm tra tự động với đánh giá chủ quan và số đo trên
thiết bị thật. Không đặt việc người dùng tự sửa asset thành điều kiện hoàn thành.

Đạt khi lỗi nghiệm thu đã được sửa, giới hạn còn lại được ghi rõ và gói phát
hành tương ứng đúng mã nguồn đã kiểm tra. Các cảnh ngoài Q01/L04 vẫn là backlog.

## Nguyên tắc ưu tiên

Ưu tiên theo thứ tự: tuyến kiến trúc chơi được, chất lượng Q01, sự ổn định và
bản ngoại tuyến nhẹ, sau đó L04 và độ rộng của catalog. Thay đổi thứ tự khi có
bằng chứng kỹ thuật cụ thể, không chỉ vì AI có thể sinh thêm nhiều asset.

Giai đoạn 1–2 đạt phạm vi nền tảng và pipeline: 12 góc baseline, 16 quan sát
tham chiếu từ 8 nguồn, mẫu PBR ba biến thể, kiểm tra hủy tải/quyền sở hữu và
cache/file ngoại tuyến. Cảnh thử 200 module được đo trên GPU Intel Arc của
laptop, drawing buffer 1920 × 1080; đây là chế độ headless, không chứng nhận
hiệu năng Q01 hoàn chỉnh hoặc điện thoại. Xem validation/hardware-profile.json.

Nguồn và board nằm ở research/references.json và environment-references.html.
Sơ đồ board là [H], không phải bản đo; ảnh nguồn hạn chế quyền chỉ liên kết.
Mẫu PBR chưa nghiệm thu mỹ thuật hoặc khẳng định đúng kurkar Caesarea.

Giai đoạn 3 đã đạt cổng G2: kho phía tây Q01 là blockout đi lại được
(bến–cửa–phòng–18 bậc–mái–trở về) trong cả hai góc nhìn, collision capsule 3D,
sàn đỡ riêng theo tầng, camera không xuyên trần, lưu/tải đúng tầng và bản
standalone đi hết tuyến khi mọi HTTP bị chặn. Kiểm chứng độc lập bằng Box3 và
raycast trên mesh hiển thị ghi 0 lỗi trong 1.999 frame của bảy lượt chạy.
Toàn bộ hồi quy campaign, craft, graphics và kit pass trên build 1ca87a3f70b6;
standalone chỉ nhúng asset đang dùng (12,97 MB) và giống hệt bản đã kiểm tra.
Blockout là sáng tác [H], chưa là mỹ thuật cuối; các nhà khác vẫn đóng.
Việc tiếp theo là giai đoạn 4: góc look development trên chính công trình này.
Xem progress.json, phase-3.md và validation/phase3 để biết bằng chứng, cách
chạy lại và giới hạn.
