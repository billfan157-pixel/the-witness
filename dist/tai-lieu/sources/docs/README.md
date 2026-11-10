# Nguồn chuẩn của THE WITNESS

<a id="start"></a>
## Bắt đầu theo công việc

Chọn **một** skill ở AGENTS, đọc [trạng thái](STATUS.md), rồi đọc đúng phần nguồn
được skill dẫn tới. Không đọc cả kho Bible trước mọi lần sửa. Có thể lấy tuyến
đọc và kiểm tra bằng `npm run agent:context -- content` (hoặc change/environment/release).

| Câu hỏi | Nguồn sở hữu |
| --- | --- |
| Game là gì, điều gì không được đổi tùy tiện? | [PRODUCT](PRODUCT.md) |
| Ai biết gì, quest/canon/chứng cứ phải theo đâu? | [STORY](STORY.md) |
| Code, save, asset và build hiện hoạt động ra sao? | [ENGINEERING](ENGINEERING.md) |
| Phải sửa, kiểm chứng, tạo file và cập nhật như thế nào? | [OPERATIONS](OPERATIONS.md) |
| Đang lệch gì, chưa được duyệt gì? | [STATUS](STATUS.md) |

<a id="authority"></a>
## Một khẳng định, một nơi sở hữu

Sáu trang này là lớp điều hành. Hồ sơ chi tiết được **ủy quyền theo chủ đề** trong
STORY/ENGINEERING, không được tự mở rộng quyền sở hữu sang mọi miền khác. Một
đoạn trong hồ sơ cũ ghi “SSOT”, “đã đạt” hoặc có số version cao hơn không tự
ghi đè nguồn sở hữu hiện tại.

- **Quy tắc sản phẩm:** PRODUCT và giới hạn nguồn ở hồ sơ 08/15.
- **Thiết kế chi tiết:** các Bible/scene được STORY chỉ định; trạng thái triển khai
  đối chiếu STATUS. Không coi thiết kế là hành vi đã chạy.
- **Hiện trạng:** code/schema/manifest và phép kiểm có phạm vi xác định.
- **Nghiệm thu:** report đúng hash/build, gate và xác nhận duyệt thật.
- **Nghiên cứu:** luận cứ để ra quyết định; số đo và kết luận cũ cần đối chiếu lại.
- **Bản sinh/lịch sử:** outputs, validation và archive; không biên tập thành nguồn mới.

<a id="map"></a>
## Bản đồ máy kiểm được

`docs/agent/registry.json` chứa `knowledge`: các chủ đề, nguồn chi tiết, đường mã,
lệnh kiểm, tài liệu cần cập nhật và phân loại giá trị từng tài liệu. Đây là cùng
bản đồ được checker và lệnh context sử dụng; không duy trì bảng tuyến đọc cạnh tranh.
`cleanup-record.json` cùng thư mục là sổ phục hồi file cũ, chỉ đọc khi cần truy nguyên.

Tổ chức này phân biệt hướng dẫn thực hiện với dữ liệu tham chiếu theo
[Diátaxis](https://diataxis.fr/start-here/) và chỉ nạp chi tiết khi cần theo
[Agent Skills](https://agentskills.io/specification#progressive-disclosure).
Đây là phương pháp tổ chức, không phải bằng chứng game đã đạt chất lượng.
