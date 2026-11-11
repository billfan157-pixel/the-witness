# Trạng thái và quyết định cần biết

Mốc tái cấu trúc: **10/11/2026**. Chỉ ghi trạng thái ảnh hưởng công việc tiếp
theo; số đo/evidence và gate vẫn ở nguồn sở hữu. Code đang dùng và thiết kế cần
được kiểm lại khi bắt đầu một tác vụ.

<a id="open"></a>
## Khoảng cách còn mở

| ID | Đang lệch/chưa xác nhận | Hành động khi chạm miền |
| --- | --- | --- |
| A01 | T01–T13/E01–E12/P01–P05 là thiết kế truyện v6 đã chọn; runtime/contract vẫn 10 evidence/4 claims, Q01 mới có state foundation | Phân biệt thiết kế với chờ triển khai; nâng cấp phải đồng bộ content/model/UI/restore/server và kiểm tương thích, không chỉ thêm ID vào JSON |
| A02 | Q01 G3 awaiting_visual_review; G4 in_progress | Duyệt góc gameplay, giữ artAccepted false nếu chưa có xác nhận |
| A05 | Report Phase B được nhắc nhưng chưa có trong checkout khi audit; gold/phase3 là mốc cũ | Kiểm file/hash/build trước khi dùng claim; không tạo báo cáo giả |
| A07 | Chưa kiểm lại production trong các tác vụ quản trị | Không suy deploy từ build/push; kiểm live riêng khi được giao |
| A08 | Đích v6 đã đồng bộ: L01/L02/L04 = 55/48/42 phút (145/580m); contract giữ baseline v3 216/720m; cả hai chưa đo | GDD sở hữu đích biên tập, hồ sơ 14 phải cộng đúng; baseline hợp đồng không phải đích v6 hoặc buffer đã nghiệm thu. Chỉ khóa thời lượng phát hành sau playtest người thật |
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
- **D012 — Q01 v6 state foundation (PR-03).** Runtime có module thuần `witness-q01-state.js`
  (`fresh/restore/reduce/canCommit/phase`) và `sceneProgress.Q01` trong `witness-model.js`
  (`beginQ01Scene/q01SceneEvent/q01SceneReady`). `null` = v6 chưa kích hoạt, gameplay v3
  giữ nguyên; khi kích hoạt, commit Q01 bị chặn tới khi scene đủ điều kiện và vẫn dùng
  hàm commit cũ (trừ tài nguyên một lần, không tạo nguồn completion thứ hai). Scene state
  đi qua `Model.restore` nên local save/backup và Worker/D1 cùng validate; giữ schema 2,
  contentVersion 3.0, campaignId, API v1, D1 schema và namespace. 9 Beat (00–08) và hai
  route cứu hộ `mechanical`/`manual` có bước độc lập, không trộn/đổi route, hậu quả thế
  giới riêng (`world.fire/cart/beam/sideExit`); không cấp evidence/E02, không suy thủ phạm,
  không biến yêu cầu giữ kín của Yosef thành quyền công bố. `phase` là giai đoạn logic tự
  truyện, không phải preset ánh sáng runtime (`night`/`dawn` chưa có). Đã kiểm: unit
  `test/q01-state.cjs`, regression `test/campaign.cjs`, cloud/Worker `test:backend`. Chưa
  dựng gameplay 3D Q01 v6, chưa đóng G3/G4, chưa deploy; phần đó thuộc PR-04/05.

- **D013 — Rà soát nhận định đồng bộ truyện (11/11/2026).** Đối chiếu bản nhận định
  đính kèm với checkout `106ed91654a98496f7573c80f81b7503c9e29429` và hai thay đổi
  cục bộ có sẵn (registry + ghi chú production). Sửa các mâu thuẫn biên tập ở nguồn
  sở hữu; v6 là thiết kế đã chọn, v3 tiếp tục sở hữu runtime/save. Không tự nâng ID,
  schema, gate hoặc triển khai v6 qua một lần sửa JSON. H01–H05 đã được xét: đợt này
  chỉ sửa tài liệu/manifest đọc, không thay geometry, Beat/hành vi Q01, state/save,
  lighting/asset hoặc candidate game nên không kích hoạt handoff triển khai.

<a id="story-review-2026-11-11"></a>
### Kết quả đối chiếu bản nhận định

| Điểm được nêu | Kết luận từ checkout | Khắc phục / nguồn sở hữu |
| --- | --- | --- |
| 14: điều khiển nhân vật Kinh Thánh | Đúng ở câu mở, trái chi tiết vai phụ và PRODUCT; runtime đã có `witnessRole` | Sửa vai Nhân Chứng Vô Danh; giữ hành động nguồn cho nhân vật Kinh Thánh |
| 14: bảng 80/70/66 trái ngân sách tinh gọn | Đúng; các bảng chưa theo đích GDD | Tổng scene mới 55/48/42; giữ core, hai tuyến, khoảng yên; mọi phút vẫn là dự toán |
| 12: E11/E12/P05 vừa là truth vừa bị gọi đề xuất | Đúng về nhãn mơ hồ; không có bằng chứng tính năng đã chạy | Chốt rõ thiết kế v6, ghi riêng chưa triển khai v3; không xóa giới hạn thực thi |
| 02: lưới ba lớp | Đúng: ba chỗ viết “lưới rê 3 lớp” | Đổi sang mép lưới/dây sáng tác [H], không lấy Ga 21 xác nhận cấu tạo |
| 02: hai ngân sách thời lượng | Là hai phạm vi có chủ đích theo D010, không phải phép cộng sai giữa hai hợp đồng | GDD giữ một bảng đích v6; baseline v3 dẫn về A08, không ép đổi contract |
| 03/06: nhãn mới/đề xuất/hoãn | Đúng về trạng thái thiết kế; cảnh báo chờ triển khai vẫn cần | Đồng bộ nhãn thiết kế v6 và dẫn điều kiện claim về 12; sửa biểu thức P04 dễ đọc sai |
| 07: 124–149 phút so với 90 phút; ghi chú kỹ thuật xen cảnh | Đúng về lẫn phạm vi; đầu file đã có phân biệt nhưng mục 5 vẫn gọi cùng gói 90 phút | Đổi mục 5 thành khung trục Hồi I; phân biệt mẫu v3 Q03/Q04/L01 với đặc tả Q01/Q03/L01; chuyển preset/GI sang 22 |
| 11: nhãn v3 và thiếu nối vụ cháy ở Q02 | Đúng; Q01 đã đổi nhưng Q02 thiếu dấu tiếp nối | Revision truyện v6, thêm mở cảnh tro kho/giữ kín; Q01 không cấp E02 hoặc nhận diện thủ phạm |
| 18: tên Q03/Q06/Q10 cũ, chưa có E11/E12 | Đúng về tên/đích v6; phần “Đã chơi được” là snapshot runtime 0.4 | Dùng tên v6, giữ snapshot và tách rõ cảnh đối chiếu hai bản còn phải dựng |
| JSON: dừng E10/P04, `character` còn tên nhân vật nguồn | Đúng về dữ liệu v3; không đủ cơ sở gọi đây là lỗi runtime hoặc đổi `character` thành vai chơi | Giữ catalog/save hiện hành; `witnessRole` đã tách vai điều khiển trong content/spine; chỉ cập nhật manifest xuất tài liệu |

**Phát hiện thêm đã sửa:** L01.B06 từng gán bài ca Xh 15 cho Xh 14,30–31;
cột mây và một số hành động L02/L04 bị đặt sai nhịp/chủ thể trong bảng 14.
Đã đối chiếu nguồn công khai, ghi phạm vi/403 ở sổ 10. E12/P05 được làm rõ tuyến
Q09–Q11 và yêu cầu nguồn độc lập trực tiếp; lời nhận lỗi của avatar không chứng minh
Varro đặt bản giả. Ghi chú production có sẵn được giữ làm chỉ mục và sửa các claim
nghiệm thu v6, bệnh phổi/nhịn đói của Haddai, “chữ ký nghề nghiệp” của thủ phạm và
việc nhầm bảy vai chuyên môn với người chơi thử. File này thiếu role/route khiến
`agent:context` lỗi `DOC_COVERAGE` ở baseline; đã bổ sung phân loại/route, giữ admission
có sẵn. Không tạo thêm nguồn điều hành hoặc báo cáo nghiệm thu độc lập.

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

**Kiểm của đợt rà soát truyện 11/11/2026:** `check:agents` đạt, không lỗi/cảnh báo;
`test:agents` đạt 39 ca; validator hợp đồng đạt 581 assertions/320 đường chính sách
v3 (thêm một tài liệu vào manifest, không thêm ca nghiệm thu v6); `npm test` đạt;
`test:build-output` đạt chín ca. Đối chiếu biên tập xác nhận bảy scene mỗi Legend
cộng thành 55/48/42 phút và tên cả 12 Q ở hồ sơ 11/18 khớp nhau. Contract campaign
không đổi; design-contract chỉ thêm tài liệu có sẵn vào manifest. Bản xuất được
tạo lại từ producer, hash nguồn nằm trong `validation.json` của gói tài liệu.
Không chạy build/deploy game, kiểm GPU, duyệt chuyên môn hoặc playtest người thật
trong phạm vi này; các khoảng cách A01/A02/A08/A09 vẫn giữ đúng giới hạn của chúng.
