# PRODUCTION STATUS, RUNTIME GAPS & VERSION CHANGELOG
## THE WITNESS — Chỉ mục ghi chú kỹ thuật và lịch sử thiết kế

Ghi chú có sẵn này được giữ làm **chỉ mục tham chiếu**, rà soát ngày 11/11/2026; không tạo thêm nguồn sở hữu trạng thái hoặc quyết định. [STATUS](../STATUS.md#open) sở hữu khoảng cách thực thi/quyết định; [OPERATIONS](../OPERATIONS.md#verify) sở hữu điều kiện kiểm; hồ sơ 12 sở hữu sự thật truyện. Các mốc dưới là tóm tắt thiết kế, không phải lịch sử triển khai đã được xác minh từng phiên bản.

> [!NOTE]
> Bible giữ yêu cầu thiết kế và dẫn về nguồn trạng thái khi cần. Chuyển một ghi chú khỏi Bible không biến yêu cầu thành tính năng đã chạy, không đóng gate và không cho phép nâng schema. Lịch sử thay đổi chính xác tra Git cùng evidence của đúng candidate.

---

## 1. Hiện trạng Thực thi Runtime so với Thiết kế v6.0 (Runtime vs. Design v6.0)

| Thành phần | Phạm vi nguồn đang đối chiếu | Đích Thiết kế (v6.0) | Hướng xử lý / nguồn sở hữu |
|---|---|---|---|
| **Hệ thống Chứng cứ & Mệnh đề** | Hợp đồng/runtime v3 có `E01–E10`, `P01–P04`. | Thiết kế v6 có `E01–E12`, `P01–P05`. | E11/E12/P05 đã được chọn trong truyện, chưa được triển khai vào model/UI/restore/server. Theo [hồ sơ 12](12-continuity-and-state.md); chưa có quyết định nâng schema hoặc ngày triển khai. |
| **Q01 Prologue** | Có state foundation PR-03: 9 Beat, hai route và `sceneProgress.Q01`. | Bốn vùng chức năng cao độ và gameplay cứu hộ 3D. | State foundation không chứng minh gameplay 3D đã dựng; phạm vi PR-04/05 và G3/G4 theo STATUS D012/A02. |
| **Bàn thao tác (Craft Encounters)** | Hợp đồng depth/craft ghi 25 hoạt động chương và sáu hoạt động quan hệ. | Góc máy cận cảnh và phản hồi vật thể/âm thanh. | Đây là đích cần dựng/kiểm riêng; chưa có phép đo cho tuyên bố “90% thẩm mỹ 3A / 20% chi phí”. Tra [STORY](../STORY.md#derived). |
| **Sổ tay Đối chiếu (Evidence Board)** | Menu UI bảng 3 cột (`Claims`, `Slots`, `Consent Badge`) hoạt động trên client 2D. | **Bàn làm việc thực thể 3D (In-world Physical Desk)** tại các Hub (xưởng Natan, phòng trọ Q01, phòng J3 Giêrusalem) và Pocket Leather Ledger khi ngoài hiện trường. | Nâng cấp renderer hiển thị cuộn giấy da, thẻ kho đất sét, con dấu sáp và vệt nối than/chỉ đỏ trực tiếp trong không gian 3D. |
| **Thời lượng Chiến dịch** | Baseline kỹ thuật của Hợp đồng v3: 720 phút tổng thể / 216 phút Legends (30%) làm mốc blockout chưa đo đạc. | **Đích nhịp độ biên kịch chính thức v6: 580 phút tổng thể (~9.7 giờ)**, trong đó **145 phút Legends (25%)**. | Chuẩn 580 phút là đích trải nghiệm cốt truyện chính thức của toàn bộ tài liệu thiết kế. Mốc 720 phút được lưu giữ như baseline kỹ thuật trong file kiểm thử hợp đồng `campaign-contract.json`. |

---

## 2. Quản trị Tiến độ và Cổng Chất lượng (Production Gates G2 / G3 / G4)

- **G2 và kiểm hợp đồng:** `validate-witness-contracts.py` kiểm dữ liệu/chính sách v3; số kiểm và kết quả đợt hiện tại tra [STATUS](../STATUS.md#validation). Kết quả đó không nghiệm thu toàn bộ thiết kế v6, không chứng minh mọi xung đột nguồn đã hết và không thay quyết định gate trên candidate. Tra [STATUS](../STATUS.md#open) và [chuẩn môi trường](../environment-kit/standards.md) theo đúng phạm vi.
- **Gate G3 (Art & Environment Review):** Trạng thái hiện tại: `awaiting_visual_review`. Cảnh quan bến cảng Sebastos (Q01) và các góc máy gameplay (first-person 1.58m, third-person orbit) cần được người dùng xác nhận trực tiếp qua browser preview trước khi gỡ cờ `artAccepted: false`.
- **Gate G4:** Theo STATUS: `in_progress`, chưa được đóng trong đợt rà soát này. [Protocol 19](19-depth-playtest.md) đề xuất 12 người chơi; bảy vai R01–R07 ở [packet 15](15-source-world-packets.md) là thẩm định chuyên môn riêng và đều chưa phân công. Kiểm tự động không thay hai loại xác nhận này.

---

## 3. Lịch sử Tiến hóa Phiên bản (Version Evolution Changelog)

### Thiết kế truyện 6.0 (đã chọn hướng; triển khai còn từng phần)
- **Chuẩn hóa Cốt truyện & Sức nặng Nhân sinh:**
  - Giữ công thức G17 `24 = 2 + 18 + 4`. T04 ở hồ sơ 12 xác định Haddai mất sau bệnh thông thường [H]; không có căn cứ chốt bệnh phổi, nhịn đói hoặc chết vì điều tra. Những chi tiết đó trong bản ghi chú trước đã bị loại khỏi phần tóm tắt chuẩn.
  - Q02 tiếp nối tro kho và yêu cầu giữ kín của Yosef theo hồ sơ 11. Không có nguồn cho ký ức Haddai đối chất tại sân hoặc một “chữ ký nghề nghiệp” nhận diện thủ phạm từ B06; vết cạo chỉ là hiện tượng phải đối chiếu.
  - Chuyển "Nguyên lý Chứng Nhân" (Witness Tenet) thành cơ chế Mở khóa Nhận thức (Knowledge-Gating): Người chơi học quy tắc đọc môi trường/tâm lý ở L01 (gió nghịch, chắn đèn bấc, nền đá ngầm), L02 (điểm mù âm thanh vách đá / Acoustic Blindspot), L04 (luồng xoáy ngầm / độ chùng mạn thuyền) để tự kích hoạt Phương án Thứ Ba (The Third Way) tại Q04 và Q07 mà không cần marker dẫn đường.
  - Xây dựng Bảng Giọng Điệu Nhân Vật & Tâm Lý Ngầm (Character Voice & Subtext Matrix), đồng thời thiết lập danh mục cấm kỵ (Taboo Lexicon) triệt tiêu hoàn toàn các thuật ngữ hệ thống trong hội thoại thế kỷ I.
- **Nâng cấp Thiết kế Gameplay:**
  - Đặc tả góc máy cận cảnh và phản hồi âm thanh cho bàn thao tác; chưa coi toàn bộ hệ này đã được dựng.
  - Đặc tả bàn đối chiếu 3D và sổ mang theo; cần xác minh code/bản dựng tương ứng trước khi gọi là đã triển khai.
- **Chuẩn hóa Dữ liệu & Hệ thống:**
  - Chọn 12 hồ sơ chứng cứ và năm mệnh đề trong thiết kế truyện; contract/runtime vẫn giữ 10/bốn tới đợt triển khai có kiểm tương thích.
  - Đồng bộ đích biên tập 580 phút, trong đó Legends 55/48/42 phút; chưa phải số đo chơi thật.
  - Đồng bộ thuật ngữ "mép lưới / ngư cụ sáng tác [H]" và vai điều khiển "Nhân Chứng Vô Danh" trong toàn bộ hồ sơ.
  - Bible dẫn về STATUS cho hiện trạng; tài liệu này chỉ làm chỉ mục ghi chú, không thay sáu trang lõi.

### Phiên bản 5.0
- Tích hợp Kịch bản Phân cảnh Chi tiết 9 nhịp (Beats 00–08) của Vertical Slice Prologue Q01.
- Đề xuất mở rộng hệ thống chứng cứ với `E11`, `E12` và mệnh đề `P05` về sự can thiệp của Varro.
- Tích hợp 5 định hướng nâng cấp chuẩn 3A (Khảo cổ hiện trường đa tầng, Khám phá đồng hành, Cộng hưởng cơ chế chơi, Áp lực cột mốc, Interactive Set-Piece).

### Phiên bản 3.1 & 3.2
- Chuyển vai điều khiển trong Legends sang Nhân Chứng Vô Danh (Anonymous Biblical Witness) tuân thủ Dual-Tier Persona.
- Mở khóa 4 kỹ năng RPG (Quan sát, Thủ công, Giao tiếp, Tự vệ) trong bối cảnh Kinh Thánh.
- Định danh quốc tế chính thức: *UNSEALED WITNESS: Legacy of the Covenant*.
- Bổ sung 25 bàn thao tác tại địa vật hiện hữu (runtime 0.4.0) thay thế cho các tương tác văn bản tĩnh.

### Phiên bản 3.0 & Trước đó
- Tái cấu trúc chiến dịch với 3 Legends bắt buộc (L01, L02, L04) làm trục chính; 12 quest đời thường làm cầu nối.
- Thiết lập hệ thống điều tra đa nguồn độc lập và ma trận bảo toàn ranh giới lời chứng.
- Định hình khung thiết kế thế giới và kỹ thuật nền móng.

---

## 4. Nhật ký Sửa lỗi Kỹ thuật & Nghiên cứu Nền tảng (Technical Notes & Issues)

- **Nguồn bị 403:** Sổ nguồn 10 ghi từng lần đọc/nguồn thay thế và giới hạn. Packet 15 là hồ sơ biên tập, không phải bản sao đầy đủ của tư liệu gốc hoặc bằng chứng đã đọc được mọi nguồn. Không gọi một URL bị chặn là đã xác minh.
- **Đồ họa:** Preset/GI và giới hạn đêm/rạng sáng Q01 ở [hồ sơ 22](22-graphics-rendering.md#q01-lighting). Các claim ngân sách GPU/khả năng WebGPU cần report đúng bản dựng; đợt rà soát tài liệu không kiểm GPU hoặc thiết bị thật.
- **Save & D1:** Schema 2 đang được bảo vệ. Bất kỳ thay đổi sau này phải kiểm model/client/restore/server và recovery theo [ENGINEERING](../ENGINEERING.md#save), không suy có migration hoặc tự động phục hồi chỉ từ thiết kế tính năng tương lai.
