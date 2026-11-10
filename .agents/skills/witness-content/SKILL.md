---
name: witness-content
description: Viết hoặc triển khai truyện, quest, Legends, evidence/claim và contract THE WITNESS; giữ canon, continuity và tương thích tiến trình.
---

# witness-content

Tuyến máy kiểm được: `npm run agent:context -- content`.
Đọc [STATUS](../../../docs/STATUS.md#open), rồi:

- [Bất biến sản phẩm và giới hạn nguồn](../../../docs/PRODUCT.md#invariants)
- [Chọn Bible sở hữu đúng phần đang sửa](../../../docs/STORY.md#ownership)
- [Kiểm chứng và cách cập nhật](../../../docs/OPERATIONS.md#verify)

Đọc A01/A08/A09 ở STATUS. Chọn đúng hàng ownership trong STORY; không đọc
mọi Bible. Trước đổi ID/route/claim, ghi tác động tới tri thức, consent, nguồn,
checkpoint và save. Thiết kế v6 không mặc định là runtime đã chạy. Khi được giao
triển khai, đồng bộ contract/content/model/UI/restore/server bị ảnh hưởng;
chạy checks tuyến content và browser tương ứng. Không tái tạo contract root.
