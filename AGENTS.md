# THE WITNESS — hướng dẫn cho AI agent

Áp dụng cho repository này. Yêu cầu hiện tại của người dùng xác định phạm vi;
hướng dẫn này giúp thực hiện và đối chiếu, không tự cấp quyền publish/xóa dữ liệu.

## Bắt đầu mỗi công việc

1. Đọc [đầu mối nguồn chuẩn](docs/agent/README.md), [trạng thái](docs/agent/status.md)
   và `git status --short`. Giữ mọi thay đổi có sẵn; không reset, clean hoặc ghi đè
   để có cây làm việc sạch. Không dùng dự án cha làm nguồn thay thế.
2. Tra bảng sở hữu trong README để đọc đúng nguồn và code hiện hành. Thiết kế,
   hành vi đang chạy và bằng chứng nghiệm thu là ba loại khác nhau. Nếu lệch nhau,
   dùng [quy trình xử lý](docs/agent/workflow.md), không tự chọn bản mới nhất.
3. Đọc skill theo công việc (đường dẫn tương đối từ gốc repository):

   | Công việc | Skill cần đọc |
   | --- | --- |
   | Sửa lỗi, phát triển tính năng, tổ chức mã và tài liệu | [.agents/skills/witness-change/SKILL.md](.agents/skills/witness-change/SKILL.md) |
   | Truyện, quest, Kinh Thánh, continuity, dữ liệu campaign | [.agents/skills/witness-content/SKILL.md](.agents/skills/witness-content/SKILL.md) |
   | Cảnh 3D, kiến trúc, asset, renderer, âm thanh | [.agents/skills/witness-environment/SKILL.md](.agents/skills/witness-environment/SKILL.md) |
   | Build, kiểm thử phát hành, đóng gói, triển khai được yêu cầu | [.agents/skills/witness-release/SKILL.md](.agents/skills/witness-release/SKILL.md) |

   Các skill là quy trình; không sao chép luật sản phẩm vào skill. Có thể cần
   nhiều skill cho một việc. Nếu hệ thống chưa liệt kê skill cục bộ, đọc trực tiếp
   các đường dẫn trên; không giả định việc khám phá tự động đã xảy ra.

## Quy tắc bắt buộc khi thay đổi

- Nêu mục tiêu, nguồn đối chiếu, file sẽ sửa và cách xác nhận trước khi sửa.
  Việc nhỏ có thể ghi trong cập nhật chat; việc nhiều bước dùng worklog hiện có.
- Mở rộng file/module hiện có trước khi thêm file. File nguồn mới phải có lý do,
  chủ sở hữu và được đăng ký trong [registry](docs/agent/registry.json), theo
  [chính sách repository](docs/agent/repository-policy.md). Không tạo `final2`,
  `backup`, bản sao timestamp hoặc một bộ hướng dẫn cạnh tranh ở gốc.
- Không sửa trực tiếp bản sinh: `dist/`, `witness-sw.js`, phần engine sinh trong
  `vendor/adventure-3d.js`, `vendor/witness-q01-gi-data.js`. Sửa nguồn và dùng đúng
  builder; xem [bản đồ kiến trúc](docs/agent/architecture.md).
- Không tự nâng phiên bản save, đổi ID quest/evidence, ghi đè save, tắt kiểm tra
  nguồn, hoặc đánh dấu G3 đạt để làm test xanh. Đổi hợp đồng cần cập nhật nguồn,
  đối chiếu tương thích và kiểm tra tác động theo workflow.
- Giữ nhãn [K]/[L]/[G]/[H]/[C]; bảo toàn canon và phân quyền ba tầng.
- Hợp đồng chỉ biên tập/đọc từ `docs/the-witness/`; không tái tạo hai JSON
  contract ở gốc. Tài liệu `docs/archive/` chỉ là lịch sử, không là nguồn chỉ đạo.
- Chạy kiểm tra theo [ma trận](docs/agent/verification.md), gồm
  `node tools/check-agent-governance.cjs`. Sửa lỗi do thay đổi của mình; ghi rõ lỗi
  có sẵn và phần chưa kiểm chứng. Không chứng nhận art/playtest/deploy từ unit test.
- Kết thúc: cập nhật tài liệu sở hữu cùng thay đổi; cập nhật status/worklog nếu
  trạng thái hoặc giới hạn thay đổi; rà diff và khai báo file mới/bản sinh.

Không tự di chuyển/xóa tài liệu cũ, asset, output hay thay đổi đang dở chỉ vì
chúng có vẻ thừa. Tra consumer và kế hoạch lưu giữ trước. Chỉ push/publish khi
phạm vi người dùng đã cho phép, và xác nhận kết quả thực tế.
Các file đã dọn và đường khôi phục ở `docs/agent/cleanup-record.json`; không
tái tạo nguồn đã nghỉ chỉ để làm consumer cũ chạy được, hãy sửa consumer.
