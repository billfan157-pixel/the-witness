---
name: witness-release
description: Build và xác minh candidate THE WITNESS; commit/push hoặc triển khai khi phạm vi người dùng đã giao, giữ tương thích save/D1.
---

# witness-release

Tuyến máy kiểm được: `npm run agent:context -- release`.
Đọc [STATUS](../../../docs/STATUS.md#open), rồi:

- [Producer và đầu ra được phép dựng lại](../../../docs/ENGINEERING.md#pipeline)
- [Ma trận kiểm và điều kiện phát hành](../../../docs/OPERATIONS.md#verify)

Chốt candidate gồm những nguồn nào; dùng staging nếu cần bảo toàn bản sinh
đang nghiệm thu. Kiểm lockfile, GI freshness, output tests và build; reader cũ
phải tạo lại, không tắt hash guard. Cloud/schema cần hồ sơ 23 và test:backend;
không sửa migration đã áp dụng hay thay identity production bằng demo.
Kiểm web/offline cùng checkout và lưu build/hash/scope. Nếu được giao push/deploy,
làm tới kết quả thực và xác minh remote/health phù hợp; cập nhật STATUS khi có
thay đổi thật. Build, push, deploy, art approval là các kết quả riêng.
