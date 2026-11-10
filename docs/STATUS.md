# Trạng thái và quyết định cần biết

Mốc tái cấu trúc: **10/11/2026**. Chỉ ghi trạng thái ảnh hưởng công việc tiếp
theo; số đo/evidence và gate vẫn ở nguồn sở hữu. Code đang dùng và thiết kế cần
được kiểm lại khi bắt đầu một tác vụ.

<a id="open"></a>
## Khoảng cách còn mở

| ID | Đang lệch/chưa xác nhận | Hành động khi chạm miền |
| --- | --- | --- |
| A01 | Bible v6 có E11/E12/P05, T09–T13 và scene mới; runtime/contract vẫn 10 evidence/4 claims | Lập tác động ID/route/save và triển khai trong phạm vi được giao; không gọi validator v3 là nghiệm thu v6 |
| A02 | Q01 G3 awaiting_visual_review; G4 in_progress | Duyệt góc gameplay, giữ artAccepted false nếu chưa có xác nhận |
| A05 | Report Phase B được nhắc nhưng chưa có trong checkout khi audit; gold/phase3 là mốc cũ | Kiểm file/hash/build trước khi dùng claim; không tạo báo cáo giả |
| A07 | Chưa kiểm lại production trong các tác vụ quản trị | Không suy deploy từ build/push; kiểm live riêng khi được giao |
| A08 | Thời lượng: GDD v6 nhắm 145 phút Legends (~580m campaign), contract giữ baseline 216/720 phút | 216/720m là unmeasured-blockout-target của hợp đồng v3, 145/580m là đích nhịp biên kịch v6 (chênh lệch ~71m là độ co giãn thiết kế, không phải buffer đã nghiệm thu); chỉ khóa cam kết phát hành sau playtest người thật |
| A09 | GDD v6 nhấn zero lethal combat, runtime vẫn có bốn skill và sân luyện | Không tự xóa defend/training hoặc diễn giải thành combat giết người; quyết định gameplay cần scope rõ |

Các file chapter/screenplay/campaign/Legends có thay đổi chưa commit từ công
việc khác trước lần tái cấu trúc; chúng được giữ làm chi tiết thiết kế hiện hành.
Không sao chép bản HEAD cũ đè lên chúng để “chuẩn hóa”.

<a id="decisions"></a>
## Quyết định tổ chức đang áp dụng

- **D007 — Sáu trang lõi, đọc theo nhiệm vụ.** Người dùng yêu cầu đánh giá lại giá
  trị và xây hệ thống gọn, khoa học, gắn skill. AGENTS chỉ dẫn skill; skill dẫn
  trực tiếp tới core và chi tiết cần dùng; registry là bản đồ máy kiểm được.
- **D008 — Phân loại trước khi nạp.** Canonical sở hữu quyết định; specification
  sở hữu chi tiết được ủy quyền; research giải thích căn cứ; generated lấy từ code;
  evidence xác nhận scope; historical dùng truy nguyên. Không xếp mọi Markdown là SSOT.
- **D009 — Gộp thao tác, giữ chi tiết có giá trị.** Quy trình/file policy/verification/
  architecture cũ chuyển vào các trang lõi. Nghiên cứu vision/depth gộp ở source
  register; nghiên cứu camera gộp ở input research. Atlas/implementation sinh khi
  cần vào outputs/reference. Các nội dung chi tiết truyện đang sửa không bị cắt.
- **D010 — Điều hòa thiết kế v6 và hợp đồng runtime v3 (PR-01).** Narrative Bible v6
  và đặc tả cảnh v6 là đích thiết kế cốt truyện/scene chính thức, trong khi v3 vẫn
  là hợp đồng runtime/save được bảo vệ nghiêm ngặt. Phân vùng không gian Q01 được
  chuẩn hóa thành bốn vùng chức năng cao độ (C0 = cầu cảng/sân hàng, C1 = kho trệt
  và gác lửng cứu hộ, C-1 = rãnh bảo trì ngầm, C+1 = sàn tời và sân mái; không phải
  bốn tầng nhà độc lập xếp chồng). Giữ nguyên Q01.LOAD, lựa chọn lodging/meal, cờ
  Q01.COMMITTED và các callback sẵn có. Tách biệt quan sát sơ bộ B06 tại Q01 với việc
  thu thập/xác minh E02 tại Q02; P01 yêu cầu E02 + E03 và không tự suy ra thủ phạm/nguyên nhân.
  Giữ ranh giới tri thức E04/Q03 và E05/Q05. Hồ sơ 12 sở hữu sự thật, điều kiện claim,
  lineage và consent; hồ sơ 03/06 chỉ là tham chiếu diễn giải. Ngân sách 90m slice,
  32m hay 40–45m Q01, 145/216m Legends và 580/720m chiến dịch đều là ước tính thiết kế
  chưa đo đạc, không thay thế lẫn nhau. Không tuyên bố v6 đã chạy, Phase B đã nghiệm thu,
  G3 đã duyệt hay dự án sẵn sàng phát hành.
- **Phát hiện hậu PR-01 (PR-01.1):** Rà soát và khóa sai lệch: E01 thuộc Q04 thay vì Q03 (P02 cần E04 + E05); B06 tại Q01 là quan sát hiện tượng sơ bộ, không dùng pseudo-fields (`observation.b06_scraped`, `evidence.patch`); ánh sáng outro Q01 chuyển rạng sáng (chưa có preset runtime `dawn`/`night`); làm rõ hiện trạng Phase B/G3 và bản chất chưa đo của các ngân sách thời lượng.
- **D011 — Conditional cross-domain handoffs (PR-02).** Bổ sung cơ chế handoff
  có điều kiện H01–H05 trong `registry.knowledge.handoffs` cho các tác vụ giao thoa
  giữa 3D environment, content kịch bản, change/save và release. Handoff bổ sung
  tuyến đọc bắt buộc, consumer đối chiếu tác động và bài kiểm bắt buộc khi trigger
  được kích hoạt. Handoff là cơ chế đọc/kiểm liên miền có cấu trúc, không phải bằng
  chứng semantic correctness và tuyệt đối không cho phép tự ý mở rộng phạm vi chỉnh sửa.

Nguồn và phép đánh giá từng file, vị trí thay thế, hash gốc và luận cứ phương
pháp nằm trong `registry.knowledge`. Mốc trước ở Git và cleanup-record; không
cần đọc lịch sử đó để sửa một lỗi nhỏ.

<a id="validation"></a>
## Phạm vi kiểm chứng

Tái cấu trúc không đổi gameplay, schema hoặc gate. Đã kiểm: 17 ca governance,
9 ca output pipeline, 580 assertions hợp đồng, npm test và reader desktop/mobile.
Full build nguồn hiện tại trong staging pass; hai báo cáo sinh được tạo đúng
outputs/reference, không tái tạo tài liệu nguồn đã nghỉ. Xác minh gói có reader
và freshness guard được thực hiện trước bàn giao.

Đã đưa 6 Git checkout về local/checkouts và 5 bản Word về docs/archive/imports.
Sau đó đã xóa hai gói deploy cũ và thư mục Phase 3 rỗng; gói Q01 còn dùng để duyệt được giữ ở local/releases. Hash/nội dung và trạng thái
Git của cả 6 checkout được đối chiếu không đổi; preview cổng 8052 trả 200 ở
vị trí mới. Local là kho cục bộ được ignore, không là nguồn build chính.

Trạng thái nghiệm thu sản phẩm vẫn theo nguồn miền; chưa deploy hoặc chạy lại
toàn bộ browser gameplay/playtest. Danh sách và phép kiểm chi tiết ở cleanup-record.
