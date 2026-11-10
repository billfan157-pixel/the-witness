---
name: witness-release
description: Build, xác minh candidate, đóng gói và triển khai THE WITNESS khi được giao; giữ tương thích save, D1 và phân biệt build với deployment.
---

# Build và phát hành

Đọc `docs/agent/architecture.md`, `verification.md`, `repository-policy.md`
và status. Nếu có cloud/schema, đọc `docs/the-witness/23-backend-and-cloud-saves.md`.
Quy trình không tự cấp quyền push/publish hoặc sửa database production.

1. Xác định candidate nguồn và phạm vi phát hành từ yêu cầu. Kiểm diff có sẵn.
   Với cây đang bẩn hoặc nhiều việc song song, dùng checkout build riêng hoặc
   staging đã kiểm kê, chứa đúng các thay đổi được giao; giữ nguyên cây gốc.
2. Kiểm Node 22.13+, lockfile gốc và kit khi dùng. Đọc scripts hiện tại; build
   ghi root witness-sw, engine bundle và dist. Không chạy để kiểm tài liệu thuần.
3. Build dọn vùng sinh qua tools/build-output.cjs và từ chối reader lệch nguồn;
   không khôi phục reader cũ để bỏ qua kiểm tra. Chạy checks theo ma trận,
   test:build-output, governance và `npm run build` trong candidate phù
   hợp. Kiểm GI freshness, asset budget, payload không có file tồn dư và source
   provenance. Đọc builder docs nếu cần reader; không xuất lại hồ sơ vô cớ.
4. Cloud: schema ở db, migration mới thêm ở drizzle; không sửa migration đã
   áp dụng. Giữ auth identity từ nền tảng, CAS/tombstone/history/outbox và guest
   separation; chạy test:backend và checks model khi liên quan. Không đưa demo
   identity của dev server vào Worker. Không rollback thành static làm mất save.
5. Kiểm web đúng URL và standalone đúng dist; WITNESS_BASE_URL không chuyển
   đường offline. Evidence cần build/hash, môi trường, lệnh và giới hạn. Không
   sửa report cũ thành pass hoặc coi deploy từ phiên trước là candidate hiện tại.
6. Nếu được giao deploy, dùng hướng dẫn hosting/tool hiện hành và kiểm kết quả
   deployment, health, session và save/reload phù hợp. Không ghi secret/save thật
   trong report. Nếu chưa được giao, bàn giao candidate cục bộ và giới hạn.

Cập nhật hồ sơ miền, status/worklog và kết quả thực tế. Push thành công, build
thành công, deploy thành công và nghiệm thu art là các claim riêng.
