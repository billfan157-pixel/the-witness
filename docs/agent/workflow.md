# Quy trình thay đổi và cập nhật nguồn

## 1. Tiếp nhận và đối chiếu

Đọc AGENTS, bản đồ nguồn và status; xem diff các file sắp chạm. Chốt mục tiêu
quan sát được, giới hạn công việc, tài liệu sở hữu và kiểm tra phù hợp. Không
đổi toàn bộ dự án chỉ vì bắt gặp mã chưa đẹp. Nếu có thay đổi người khác cùng
file, giữ chúng; khi không thể phân biệt an toàn, chọn điểm tích hợp khác hoặc
hỏi đúng phần xung đột.

Việc nhiều bước: thêm/cập nhật **một mục** trong [worklog](worklog.md), gồm yêu
cầu, nguồn, phạm vi file, tiêu chí đạt và phần còn mở. Việc nhỏ có thể dùng chat
và diff, không cần một file kế hoạch riêng.

## 2. Phân biệt ý định và hiện trạng

- Sửa lỗi đúng hợp đồng: tái hiện, sửa nguồn, kiểm hồi quy và cập nhật mô tả nếu
  mô tả sai. Không cần một quyết định mới cho từng chỉnh sửa thông thường.
- Triển khai thiết kế đã được giao: nêu phần nào sẽ chuyển từ planned sang
  implemented. Kiểm tra ID, schema, điều kiện unlock và consumer trước khi sửa.
- Nguồn mâu thuẫn: ghi ID ở status, chỉ ra đoạn/file và lựa chọn có hệ quả. Không
  tự coi nội dung mới chèn là quyết định thay runtime. Nếu yêu cầu người dùng đã
  giải quyết mâu thuẫn, ghi lại quyết định và tiếp tục, không hỏi lại.
- Thay đổi định hướng/contract trong phạm vi được giao: ghi quyết định bền vững
  ở decisions, sửa nguồn sở hữu và consumer. Nếu chưa có quyền quyết định sản
  phẩm hoặc thông tin bắt buộc, hỏi đúng lựa chọn còn thiếu; làm tiếp phần độc lập.

## 3. Thực hiện có kiểm soát

Sửa nguồn nhỏ nhất đủ hoàn thành tiêu chí. Tạo file theo repository-policy.
Thay đổi runtime phải kiểm cả UI/model khi liên quan; thêm script nạp phải
đối chiếu index và danh sách builder. Đổi save phải xét restore/legacy, spatial
checkpoint, namespace/outbox và backend validator. Không thay migration đã áp dụng.

Ghi tài liệu trong cùng thay đổi:

| Loại thay đổi | Nơi cập nhật |
| --- | --- |
| Luật truyện, quest, evidence, canon | Bible sở hữu + contract + catalog/runtime/test bị ảnh hưởng |
| Asset/cảnh/renderer | Hồ sơ cảnh/chuẩn nếu đổi hợp đồng, catalog/credits/ledger + bằng chứng đúng build |
| API/schema/save | Hồ sơ 23 + schema/migration + client/model/server/tests |
| Module/build/path | architecture + registry + script/caller/link |
| Trạng thái công việc, phát hiện drift | status; worklog khi cần bàn giao; quyết định chỉ khi có thay đổi bền vững |

## 4. Kiểm chứng

Chạy governance checker và kiểm tra theo verification matrix. Báo lệnh, kết quả,
môi trường và giới hạn. Lỗi trước thay đổi phải được phân biệt bằng baseline
hoặc tái hiện; không gán là có sẵn nếu chưa có bằng chứng. Không chạy build ở
checkout bẩn rồi ghi đè output đang được người khác sử dụng.

Evidence bị lỗi thời khi hash đầu vào/build khác. Giữ lịch sử, nhưng hạ phạm vi
claim và chạy lại phần cần thiết; không sửa report/hash để giả khớp. Kiểm browser
cần URL đúng checkout và file offline đúng dist. Pass model không thay art review,
playtest, thiết bị vật lý hoặc kết quả deployment.

## 5. Bàn giao

Rà diff, file mới, output ngoài dự kiến và thay đổi có sẵn. Xác nhận tiêu chí
hoàn thành; ghi còn thiếu bằng trạng thái cụ thể, không biến planned thành done.
Cập nhật status/worklog, trỏ tới nguồn đã sửa và báo kiểm chứng ngắn gọn.
Không tự push/publish nếu nhiệm vụ chưa bao gồm; nếu đã được giao thì làm tới
kết quả thực tế và ghi URL/build/health khi xác minh được.

Một bàn giao đủ dùng trả lời: **đổi gì; theo nguồn nào; kiểm thế nào; còn giới
hạn gì**. Không cần sinh thêm bản summary/report trùng với tài liệu sống.
