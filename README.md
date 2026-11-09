# Chứng Nhân: Di Sản Giao Ước (UNSEALED WITNESS: Legacy of the Covenant)

Bản **0.5.0 / hồ sơ thiết kế 3.2** đưa 31 phần việc vào thao tác trực tiếp tại hiện trường, gồm 25 tình huống chương và sáu nhiệm vụ quan hệ với 12 biến thể. Có 44 chi tiết 3D tại 27 chủ cảnh: tải xe, chốt nứt, mép giấy dán, đèn cuối đoàn, đường đi, các khoản hàng, phong bì và phần việc cùng NPC. Bản nháp giữ khi rời hoặc tải lại; chỉ bàn giao hợp lệ mới hoàn tất việc. Bảng đối chiếu vẫn có cùng luật và quyền hoàn tất.

Bộ tài liệu bắt đầu ở [nghiên cứu chiều sâu](docs/the-witness/16-depth-research.md), [atlas 25 tình huống chương](docs/the-witness/17-encounter-atlas.md), [kịch bản chi tiết và thoại](docs/the-witness/18-scene-craft-and-dialogue.md), [protocol playtest](docs/the-witness/19-depth-playtest.md) và [thực thi từng cảnh 0.5.0](docs/the-witness/20-scene-implementation.md). Bản đọc đầy đủ và gói nguồn nằm trong `outputs/THE-WITNESS-Design-v3.2/`. Dàn dựng dùng các trạng thái có điều kiện; chưa là mô phỏng vật lý dây mềm, chất lỏng, đám đông hoặc âm học liên tục. Chưa có playtest người thật.


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

WASD đi, kéo chuột nhìn, Q/R xoay, V đổi góc nhìn thứ nhất/thứ ba, C đặt lại góc, E tương tác, F dẫn hướng, J mở sổ, M bản đồ, Escape menu. Cảm ứng dùng nửa trái để đi, nửa phải để nhìn. Tay cầm hỗ trợ cần trái/phải (cần phải nhìn lên/xuống, nhấn cần phải đổi góc nhìn), A tương tác, Y sổ, Start menu. Sân luyện dùng K đánh, H đỡ, Space né; có nút cảm ứng và ba nhịp đối phương.

Trong phần việc hiện trường, chọn người/vật/nguồn trong bảng gọn, đi tới điểm thao tác rồi thực hiện; dùng danh sách địa điểm để dẫn tới chỗ cần làm. Có thể thử luật, sửa bản nháp hoặc chuyển sang bảng đối chiếu. Điểm bàn giao kiểm lại toàn bộ phương án trước khi ghi truyện. Nhìn gần vật thể chỉ ghi quan sát, không tự cấp chứng cứ hay quyền công bố.

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
- **Góc nhìn thứ nhất tùy chọn (phím V):** Camera đặt tại mắt Nhân Chứng (cao 1,58 m trên mô hình 1,7 m), FOV dọc 71° (~103° ngang ở 16:9), nhìn tự do −72°…+77°, khóa chuột kiểu FPS trên desktop, kéo để nhìn trên cảm ứng, cần phải tay cầm nhìn lên/xuống. Di chuyển, la bàn, dẫn đường và tương tác E dùng chung logic với góc thứ ba; cảnh thoại/cinematic vẫn ưu tiên khung dàn dựng. Head-bob nhẹ chỉ bật khi tắt giảm chuyển động; mặc định tắt để tránh say camera. Nghiên cứu nền: [bài học 3A về góc thứ nhất](docs/the-witness/21-first-person-research.md).
- **Điều khiển & Trợ năng nâng cao:** Chuột/bàn phím (kèm click-to-walk tới điểm tương tác, `Z` khóa hướng mục tiêu), cảm ứng (dead-zone `10px`, leash `64px`, đổi bên cần ảo trái/phải), tay cầm (cần trái/phải + D-pad + RB chạy), 3 chế độ dẫn đường (`Đầy đủ / Chỉ mục tiêu / Tắt`), chế độ dịu chuyển động và nền phụ đề.
- **Bản HTML tự chứa (`dist/ban-choi-ngoai-tuyen.html`) và cache Service Worker offline.**

## Phạm vi còn lại của sản xuất

Trục, core nguồn 7 cảnh và các hệ thống RPG/Evidence Board/Dual-Tier Persona v3.1 đã vào nền `0.3.0`; các bàn chiều sâu vào `0.4.0`; thao tác hiện trường, vật thể và phần việc quan hệ vào `0.5.0`. Thời lượng thực tế chưa được đo theo mục tiêu thiết kế 80/70/66 phút (216/720 phút = 30%). Còn asset mỹ thuật 3D độc bản cuối cùng, đám đông/diễn xuất/cinematic thu âm, bản dịch Kinh Thánh có cấp phép chính thức, bảy vị trí duyệt chuyên môn (`R01–R07`) và playtest người thật theo protocol 12 người.

## Kiểm tra và đóng gói

`npm test` kiểm campaign, core spine, tiếng Việt NFC, dấu tích 3D, hệ thống v3.1, luật chiều sâu và 13 nhóm kiểm hiện trường (`test/craft.cjs`): cùng kết quả với bảng, tất cả nhánh quan hệ, khoảng cách, lưu/khôi phục và ranh giới nguồn. `python tools/validate-witness-contracts.py` kiểm hợp đồng thiết kế và danh mục dàn dựng. `node tools/build-depth-atlas.cjs` và `node tools/build-craft-dossier.cjs` cập nhật hồ sơ từ luật thực thi. `npm run test:browser` kiểm điều khiển, WebGL 2, Q02, ba level Legends, summary/cổng, các thao tác hiện trường trên desktop/mobile và bản offline. `npm run build` tạo `dist/`, cập nhật Service Worker và đóng gói HTML offline.

Sau build, `npm run test:craft-details` chụp góc nhìn gần giấy/mái/mối nối đã làm, kiểm thao tác hiện trường trong file ngoại tuyến và dùng Enter để kiểm giữ focus khi chỉnh khoản. Phần hướng dẫn đang mở và vị trí cuộn được giữ khi sửa bản nháp. Các ảnh là đầu vào để xem lại bố cục; kiểm tự động không thay người chơi thật. Khi chạy song song một vòng QA khác trên cùng máy, có thể đặt `WITNESS_QA_PORT` riêng cho các suite hồi quy để tránh chiếm nhầm phiên trình duyệt.

Nguồn sở hữu thiết kế: `docs/the-witness/`. Vendor và asset là bản sao riêng của dự án. Bộ dựng cục bộ được bổ sung góc nhìn gần và đường NPC dừng tại đích; không sửa game Hành Trình Lời Chúa nằm ở thư mục anh em `../hanh-trinh-loi-chua/`. Dự án và Site của hai game độc lập.
