---
name: witness-change
description: Phát triển, sửa lỗi hoặc tổ chức nguồn THE WITNESS theo nguồn sở hữu, kiểm soát file và cập nhật tài liệu; dùng trong repository này.
---

# Thay đổi có đối chiếu

Đọc `AGENTS.md`, `docs/agent/README.md`, `docs/agent/status.md`; dùng đường dẫn
từ gốc repository. Quy trình chi tiết: `docs/agent/workflow.md`. Không nạp toàn
bộ Bible nếu chỉ sửa một miền.

1. Xem status/diff file định chạm, xác định tiêu chí hành vi và nguồn sở hữu.
   Giữ phần làm dở có sẵn; không reset hay tạo một bản project song song.
2. Phân biệt lỗi thực thi với thiết kế chưa triển khai. Khi chạm A01, tra cả
   Bible và contract/runtime, không tự giải quyết bằng đổi ID hay test expected.
3. Sửa nguồn hiện có trước. File mới dùng admission theo
   `docs/agent/repository-policy.md`; cập nhật caller và architecture khi cần.
   Tra `docs/agent/cleanup-record.json` trước khi khôi phục file cũ; không tái
   tạo nguồn đã nghỉ hoặc dùng nghiên cứu trong docs/archive như trạng thái mới.
4. Chọn kiểm từ `docs/agent/verification.md`. Đọc skill content/environment/
   release khi công việc đi vào miền tương ứng. Chỉ đọc skill cần dùng.
5. Cập nhật nguồn sở hữu trong cùng thay đổi, chạy
   `node tools/check-agent-governance.cjs`, rà diff và bàn giao kết quả/giới hạn.

Yêu cầu nhỏ không cần file kế hoạch mới. Công việc nhiều bước dùng một mục trong
`docs/agent/worklog.md`; quyết định bền vững ở decisions, trạng thái mở ở status.
