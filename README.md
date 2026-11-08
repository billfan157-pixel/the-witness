# Chứng Nhân: Di Sản Giao Ước (UNSEALED WITNESS: Legacy of the Covenant)

Bản **0.4.0 / phụ lục thiết kế 3.2** đầu tư vào chi tiết và luật chơi: **25 tình huống tại 21 chương/cảnh**, bảy họ thao tác, bản nháp có thể sửa và sáu dấu trở lại theo việc đã làm. Người chơi đối chiếu nguồn, phân người/vật, đọc tuyến, tính riêng các khoản và chuẩn bị bản giao theo phạm vi thực tế. Các tương tác nằm tại địa vật hiện hữu; không có khu vực mới chỉ để tăng độ rộng.

Bộ tài liệu mới bắt đầu ở [nghiên cứu chiều sâu](docs/the-witness/16-depth-research.md), [atlas 25 tình huống](docs/the-witness/17-encounter-atlas.md), [kịch bản chi tiết và thoại](docs/the-witness/18-scene-craft-and-dialogue.md), [protocol playtest](docs/the-witness/19-depth-playtest.md). Bản đọc đầy đủ và gói nguồn nằm trong `outputs/THE-WITNESS-Design-v3.2/`. Bàn thao tác là mô hình luật trong cảnh 3D, chưa là mô phỏng dây, đám đông hoặc tải thuyền; chưa có playtest người thật.


Nền 0.3.0 triển khai sâu kiến trúc v3.1 trên runtime 3D: **Kinh Thánh là cốt truyện chính (Legends 30% / 216 phút thiết kế)**, ba biến cố trọng tâm 7 cảnh (`S01–S07`) với vai **Nhân Chứng Vô Danh** cùng sự hiện diện trực quan của **Tầng Thánh (Sacred Tier)** trong không gian 3D, mở khóa trọn vẹn **4 kỹ năng RPG**, **Bộ dụng cụ 6 món**, **3 Tín điều Nhân chứng (Witness Tenets)**, **Bảng Đối Chiếu Chứng Cứ 3 Cột tương tác** và 12 cầu nối đời thường thế kỷ I tại Xêdarê.

## Điểm cốt lõi của Kiến trúc v3.1

- **Nguyên lý Hai Tầng (Dual-Tier Persona):**
  - *Tầng Thánh (Canon Lock 100%):* Môsê, Đavít, Phêrô và Đức Giêsu được bảo toàn nguyên vẹn 100% theo bản văn Kinh Thánh (không chế lời, không biến phép lạ thành mana/skill, không thay đổi kết cục lịch sử).
  - *Tầng Người (Player Agency & RPG):* Người chơi nhập vai **Nhân Chứng Vô Danh** có mặt tại hiện trường: Người hộ vệ khóa đuôi (Xh 14), Trinh sát hang En Ghêđi (1 Sm 24), Người phụ việc chài lưới hồ Galilê (Ga 21). Người chơi sử dụng trọn vẹn 4 năng lực RPG: **Quan sát, Thủ công, Giao tiếp, Tự vệ** để cứu hộ, gia cố phương tiện và kiềm chế bạo lực.
- **Ba Exploration Loop chuyên sâu trong 216 phút Legends:**
  - *L01 (Xuất Hành 14):* Quản lý Đội hình & Đọc Địa hình Gió/Nước (Caravan Cohesion & Terrain Reading).
  - *L02 (1 Samuel 24):* Thám hiểm Âm thanh, Ánh sáng & Kiềm chế Đồng đội (Acoustic Stealth & Group Restraint).
  - *L04 (Gioan 21):* Phối hợp Thao tác Thuyền/Lưới & Đọc Dấu hiệu Mặt nước (Seamanship & Relational Observation) theo mô hình thuyền cổ Ginosar.
- **Tài liệu Single Source of Truth (SSOT):** Bảng nguyên tắc và Mẫu chống chỉ định (Design Tenets & Anti-Patterns Matrix) đóng khung ở đầu GDD; các bảng Sự thật nền (T01–T08), Chứng cứ (E01–E10), Mệnh đề (P01–P04) và Nhịp cốt lõi (B01–B06) được tích hợp trực tiếp giúp các cuốn Bible có thể đọc độc lập.
- **Định danh thương hiệu mới:** **UNSEALED WITNESS: Legacy of the Covenant** giúp phân biệt sản phẩm với tựa game giải đố The Witness (2016); chưa có thẩm định nhãn hiệu.

## Chơi

Chạy `npm run dev`, mở địa chỉ Local được in ra. Bản đóng gói nằm ở `dist/ban-choi-ngoai-tuyen.html`; có thể mở trực tiếp mà không cần mạng hoặc cài thư viện.

WASD đi, kéo chuột nhìn, Q/R xoay, C đặt lại góc, E tương tác, F dẫn hướng, J mở sổ, M bản đồ, Escape menu. Cảm ứng dùng nửa trái để đi, nửa phải để nhìn. Tay cầm hỗ trợ cần trái/phải, A tương tác, Y sổ, Start menu. Sân luyện dùng K đánh, H đỡ, Space né; có nút cảm ứng và ba nhịp đối phương.

## Phần đã triển khai (v0.3.0 / Architecture v3.1)

- **Nguyên lý Hai Tầng 3D (Dual-Tier Persona in 3D):** Người chơi luôn điều khiển **Nhân Chứng Vô Danh** (Tầng Người) trong cả 5 Legend (`L01–L05`), trong khi các nhân vật Kinh Thánh chuẩn mực (**Tầng Thánh**: Môsê, Đavít, Saun, Đức Giêsu Phục Sinh, Phêrô, Người môn đệ được yêu mến, Giêrêmia, Ebed-melech, Phaolô, Xila) được dàn dựng trang trọng trong cảnh 3D theo từng nhịp.
- **Ba cổng bắt buộc 7 cảnh (`S01–S07`):** Q03 → Môsê / Xh 14 (`L01`) → Q04; Q06 → Đavít / 1 Sm 24 (`L02`) → Q07; Q10 → Phêrô / Ga 21 (`L04`) → Q11. Kết campaign cần đủ cả ba.
- **16 nhịp nguồn bằng lời diễn ý có tham chiếu:** Không chế lời Đức Giêsu như trích dẫn. Mỗi chương có đường khám phá, 6 địa vật tự chọn, thao tác, phần nguồn, chỉ số **Độ gắn kết đoàn / Kỷ luật im lặng / Nhịp đồng tâm (Group Composure)** và kết.
- **4 Kỹ năng RPG (`Quan sát, Thủ công, Giao tiếp, Tự vệ`) & Bộ dụng cụ 6 món:** Khởi tạo theo xuất thân (`Lục sự / Bến cảng / Đường bộ`), thăng cấp tự nhiên ở đời thường và chuyển hóa thành **Sự Nhạy Bén Của Người Nghe (Listener's Attunement)** trong Legends mà không vi phạm ranh giới sandbox.
- **3 Tín điều Nhân chứng (Witness Tenets):** Mở khóa sau `L01`, `L02`, `L04` và vang vọng tại `Q04`, `Q07`, `Q11–Q12` mà không thay thế chứng cứ thực địa.
- **Bảng Đối Chiếu Chứng Cứ 3 Cột tương tác (Interactive 3-Column Evidence Board):** Cho phép gán trực tiếp tối đa 2 chứng cứ vào từng mệnh đề `P01–P04`, tự động phát hiện nguồn trùng gốc (`E04`/`E07` cùng nhánh vận chuyển), kiểm tra điều kiện công bố công khai và hiển thị huy hiệu đồng thuận 4 trạng thái.
- **Xưng hô Việt ngữ chuẩn mực & Đối thoại đa chủ đề:** Xưng hô Natan – Người Chứng chuẩn `"Chú – Con"`, Miriam – Sela `"Chị – Em"`, ghi chú Haddai `"Cha – Con"`, đối thoại nhiều chủ đề với NPC, bạn đồng hành hiện diện trong vùng 3D và **Khoảnh khắc Lắng đọng (Quiet Moments)** cho cả 12 chương.
- **Chơi hoặc tóm tắt từng trang có cùng quyền mở cổng:** Chọn tóm tắt/thoát chưa hoàn thành; đổi định dạng và tiếp tục giữ nhịp đã tiếp nhận.
- **12 cầu nối đời thường & 6 nhiệm vụ quan hệ:** Có điều kiện, kế hoạch, hành động thực hiện tại bàn làm việc và commit riêng; ba tuyến hậu truyện.
- **Hai Legend mở rộng (`L03` Giêrêmia 38, `L05` Công vụ 16) và bốn giấc mơ tự chọn (`V01–V04`):** Có thể bỏ hẳn; có địa vật khám phá riêng và giữ nguyên ranh giới sandbox tuyệt đối.
- **Ký ức lựa chọn (18 Echo Marks):** Cứu người/giấy/thương tích để lại dấu tích vật lý trong 3D và sổ tay.
- **Vùng lưu v3 (`0.3.0`), bản dự phòng và xuất/nhập JSON:** Tương thích ngược với save `0.2.0` và di trú an toàn từ save v2; tách riêng hoàn toàn khỏi Hành Trình Lời Chúa.
- **Điều khiển & Trợ năng nâng cao:** Chuột/bàn phím (kèm click-to-walk tới điểm tương tác, `Z` khóa hướng mục tiêu), cảm ứng (dead-zone `10px`, leash `64px`, đổi bên cần ảo trái/phải), tay cầm (cần trái/phải + D-pad + RB chạy), 3 chế độ dẫn đường (`Đầy đủ / Chỉ mục tiêu / Tắt`), chế độ dịu chuyển động và nền phụ đề.
- **Bản HTML tự chứa (`dist/ban-choi-ngoai-tuyen.html`) và cache Service Worker offline.**

## Phạm vi còn lại của sản xuất

Trục, core nguồn 7 cảnh và các hệ thống RPG/Evidence Board/Dual-Tier Persona v3.1 đã vào nền `0.3.0`; các bàn chiều sâu vào `0.4.0`; thời lượng thực tế trên trình duyệt còn phụ thuộc tốc độ đọc/khám phá của người chơi so với mục tiêu thiết kế 80/70/66 phút (216/720 phút = 30%). Còn asset mỹ thuật 3D độc bản cuối cùng, đám đông/diễn xuất/cinematic thu âm, bản dịch Kinh Thánh có cấp phép chính thức, bảy vị trí duyệt chuyên môn (`R01–R07`) và playtest người thật theo protocol 12 người.

## Kiểm tra và đóng gói

`npm test` kiểm campaign, core spine, bảng mã tiếng Việt NFC, bố cục dấu tích 3D các hệ thống kiến trúc v3.1 (`test/v31-systems.cjs`) và 21 nhóm kiểm luật/nhánh/lưu chiều sâu (`test/depth.cjs`). `python tools/validate-witness-contracts.py` kiểm 534 điều kiện hợp đồng thiết kế. `node tools/build-depth-atlas.cjs` cập nhật atlas và hợp đồng chiều sâu từ luật thực thi. `npm run test:browser` (`node test/browser.mjs && node test/scene.mjs && node test/spine-browser.mjs && node test/depth-browser.mjs`) kiểm điều khiển, WebGL 2, Q02, ba level Legends, summary/cổng trên desktop/mobile và bản offline. `npm run build` tạo `dist/`, cập nhật Service Worker và đóng gói HTML offline.

Nguồn sở hữu thiết kế: `docs/the-witness/`. Các file vendor và asset được sao riêng từ bản game hiện hữu, không sửa bundle gốc. Mở rộng không gian/nhân vật dùng các điểm tích hợp công khai trong bộ dựng. Thư mục này có dự án và Site riêng, hoàn toàn độc lập với game Hành Trình Lời Chúa nằm ở thư mục anh em `../hanh-trinh-loi-chua/`.
