# Trạng thái sống và khoảng cách cần theo dõi

Cập nhật mốc quản trị: **10/11/2026**. Đây là chỉ mục điều phối; nguồn chi tiết ở
các đường dẫn dưới. Agent kiểm trạng thái thực trước khi làm; không suy trạng thái
production từ file local. Thêm/cập nhật cùng mục thay vì tạo report rời.

| ID | Trạng thái / phát hiện | Nguồn và hành động khi chạm miền |
| --- | --- | --- |
| A01 | **Mở — thiết kế scene v6 chưa khớp contract/runtime v3** | `03-narrative-bible.md` có E01–E12/P01–P05; `12-continuity-and-state.md` có T09–T13/E11. Contract và `test/campaign.cjs` vẫn 10 evidence/4 claims. GDD cũng mô tả hướng mới. Trước khi triển khai, xác định scope được giao rồi đồng bộ Bible/contract/content/model/save validator/tests; không tự thêm ID để hết cảnh báo |
| A02 | **Mở — nghiệm thu mỹ thuật Q01** | `docs/environment-kit/progress.json`: G3 awaiting_visual_review, G4 in_progress. Gold/Phase B là candidate; không đánh dấu artAccepted nếu thiếu xác nhận người dùng |
| A03 | **Đã xử lý phần dư ngày 10/11 — tiếp tục retention** | Đã dọn bản xuất thiết kế/phát hành cũ, bản reader sai nguồn và evidence trùng byte; ba tài liệu lịch sử chuyển docs/archive. Chi tiết/hash/phục hồi ở cleanup-record.json. Giữ bản sinh đang dùng, báo cáo duy nhất và thay đổi chưa commit; không xóa toàn bộ dist/outputs |
| A04 | **Giới hạn — reader/validator thiết kế phủ manifest cũ** | `docs/the-witness/design-contract.json` có 21 documentFiles; docs thực tế có cả input/UX 14, graphics 22, backend 23… ngoài manifest. Tên hai file 14 khác nhau đang tồn tại; không renumber làm hỏng link. Chưa cập nhật builder trong tác vụ này |
| A05 | **Giới hạn — bằng chứng cũ phụ thuộc hash** | README môi trường trỏ report Phase B; tại audit `docs/environment-kit/validation/phase-b/` chưa có trong checkout này. Có tool tạo report và output khác; không nhận là đã kiểm candidate hiện tại. Giữ các report gold/phase3 như mốc lịch sử |
| A06 | **Đã sửa ngày 10/11 — build sạch và reader freshness** | Hai producer dùng tools/build-output.cjs để dựng lại vùng sinh có giới hạn, từ chối junction/symlink và reader lệch hash. 8 kiểm hành vi + full build trong staging có file tồn dư giả lập đã pass. Cloud output cục bộ cũng đã dựng lại, bỏ 28 bản reader cũ |
| A07 | **Giới hạn — chưa kiểm live trong tác vụ quản trị** | Hosting config và backend source hiện hữu. Audit chỉ chạy test cục bộ; deploy, sign-in thật, D1 production và human playtest không được tái xác minh |

## Mốc kiểm chứng quản trị

- Baseline trước chỉnh quản trị: `npm test` pass; `npm run test:backend` pass 24/24;
  `python tools/validate-witness-contracts.py` pass 545 assertions. Các kiểm này
  không bao phủ đầy đủ thiết kế v6.
- Hệ quản trị: xem kết quả và phạm vi trong [worklog](worklog.md). Các trạng thái đóng A03/A06 ở trên dựa trên tác vụ dọn tiếp theo; checker không
  tự đóng các mục còn mở. Cổng art nằm duy nhất ở progress.json, không ở file này.

Khi đóng một mục, ghi ngày, nguồn đã sửa, kiểm chứng và giới hạn còn lại. Nếu
phạm vi hiện tại không cần giải quyết mục đó, không tự mở rộng nhiệm vụ.
