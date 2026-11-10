---
name: witness-change
description: Sửa lỗi, phát triển hoặc tổ chức mã nguồn THE WITNESS; đối chiếu nguồn kỹ thuật và cập nhật tài liệu cùng thay đổi.
---

# witness-change

Tuyến máy kiểm được: `npm run agent:context -- change`.
Khai báo handoff H03 (`state-save`: `npm run agent:context -- change --handoff H03`) khi thay schema, action list, support ID, restore hoặc lưu trữ offline/cloud. Khi chạm state/save migration, lưu ý: client restore và server cùng tiêu thụ state; support ID mới không thể được chấp nhận chỉ bằng việc đổi regex; thay đổi action list phải có phương án cho save đã hoàn thành hoặc đang dang dở; không tự đổi schema hoặc cloud namespace.
Đọc [STATUS](../../../docs/STATUS.md#open), rồi:

- [Vòng thay đổi, file và kiểm chứng](../../../docs/OPERATIONS.md#change)
- [Điểm sửa và đường sinh](../../../docs/ENGINEERING.md#runtime)

Xác định lỗi/hành vi cần đạt và caller; nếu việc đi vào truyện hoặc cảnh, đọc
thêm skill content/environment. Sửa nguồn sở hữu, giữ diff sẵn; module mới cần
index/build/standalone và admission. Chọn checks theo tác động, không sửa luật
sản phẩm chỉ để test xanh. Cập nhật ENGINEERING khi đổi trách nhiệm/pipeline và
STATUS khi trạng thái đổi; thay đổi chi tiết thì sửa nguồn chi tiết sở hữu.
