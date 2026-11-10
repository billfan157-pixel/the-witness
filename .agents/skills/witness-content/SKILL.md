---
name: witness-content
description: Sửa truyện, quest, chứng cứ, Legends, chuyển thể Kinh Thánh và contracts của THE WITNESS; bảo toàn canon, continuity và tương thích tiến trình.
---

# Nội dung và hợp đồng campaign

Đọc `docs/agent/README.md` để chọn nguồn sở hữu; đọc status A01 trước thay đổi
quest/evidence. Mọi đường dẫn dưới tính từ gốc repo.

- Canon/ba tầng: `docs/the-witness/13-legends-spine-charter.md`,
  `08-scripture-reference.md`, `15-source-world-packets.md` cùng thư mục.
- Sự thật vụ hàng: `12-continuity-and-state.md`; truyện tổng thể:
  `03-narrative-bible.md`; quest: `11-chapter-dossiers.md`/`06-campaign-quest-bible.md`.
- Luật/ID/cổng: GDD 02 và bốn contracts ở `docs/the-witness/`; thực thi:
  `witness-content.js`, spine/depth/craft/relationships và `witness-model.js`.

Xác định phần thiết kế đang được yêu cầu triển khai. Ghi bảng tác động ngắn
(ID/route/claim, điều kiện, consumer, save cũ), trong worklog nếu việc nhiều bước.
Không thay runtime 10 evidence/4 claims bằng v6 chỉ vì thấy E11/E12/P05 trong
Bible; khi nhiệm vụ đã giao chuyển đổi, cập nhật cả nguồn lẫn consumer liên quan.

Giữ nhãn [K]/[L]/[G]/[H]/[C], nguồn và phạm vi chứng cứ. Không chế lời Đức Giêsu,
đổi kết cục canon hoặc dùng Legends/Veil cấp evidence/consent/vật phẩm ở Mortal.
Chơi và tóm tắt đủ beat có cùng quyền mở cổng; partial/thoát chưa hoàn tất,
reflection có thể trống. Không thêm điểm cứu độ hoặc ép phát biểu đức tin.

Nếu cần dữ kiện lịch sử/Kinh Thánh mới, dùng source register và nguồn sơ cấp;
phân biệt nghiên cứu mới với nhận định đã có. Không sao chép toàn văn bản dịch
chưa có quyền. Tác vụ dùng lại contract không mặc định phải nghiên cứu lại mạng.

Consumer đọc design/campaign contract trực tiếp từ docs; không tái tạo bản sao
ở gốc đã được loại bỏ. Chạy design
validator và governance; chạy npm test, backend khi chạm restore/schema và
browser liên quan theo verification matrix. Báo riêng thiết kế, phần đã chạy
và phần đã nghiệm thu; không kết luận v6 được phủ hết từ validator v3.
