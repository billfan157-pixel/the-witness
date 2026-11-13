# Cách làm việc và cập nhật nguồn

<a id="change"></a>
## Một vòng thay đổi

1. Xem git status/diff; chọn skill và đọc STATUS cùng phần nguồn liên quan.
   Nêu mục tiêu, nguồn sở hữu, file dự kiến và điều kiện xác nhận trước khi sửa.
2. Sửa nguồn nhỏ nhất đủ hoàn thành yêu cầu. Giữ thay đổi của việc khác. Nếu
   thiết kế/code mâu thuẫn, ghi hai phía và tác động; dùng yêu cầu đã có để quyết
   định, không tự chọn version cao nhất hoặc hỏi lại điều đã được giao.
3. Đi qua ranh giới thì cập nhật consumer: ID/schema cần model/client/server;
   module cần index/build; asset cần ledger/loader/offline; tài liệu cần route/export.
4. Chọn kiểm ở dưới và trong tuyến context. Báo lỗi có sẵn chỉ khi có baseline;
   không hạ yêu cầu/test để tạo pass. Build/test/local push không là deploy.
5. Cập nhật nguồn sở hữu cùng thay đổi; STATUS chỉ khi trạng thái/quyết định/
   giới hạn đổi. Rà diff và bàn giao đổi gì, căn cứ, kiểm chứng, phần chưa đạt.

Không tạo worklog/plan/report riêng cho mỗi việc. Kế hoạch ngắn trong chat đủ
cho việc nhỏ; quyết định bền vững hoặc bàn giao còn mở dùng STATUS. Lịch sử chi
tiết lấy từ Git, không nuôi nhiều sổ lặp lại cùng sự kiện.

### Conditional cross-domain handoff

Khi công việc chạm qua ranh giới nhiều miền, sử dụng cơ chế handoff có điều kiện (H01–H05):
1. **Chọn primary skill:** Xác định một skill chính làm nhiệm vụ trung tâm (`change`, `content`, `environment`, `release`).
2. **Phân loại trigger:** Xác định mã trigger tương ứng (`q01-geometry`, `q01-gameplay`, `state-save`, `visual-asset`, `release-candidate`).
3. **Lấy context có handoff:** Chạy `npm run agent:context -- <task> --handoff <id>` để nhận readingOrder, implementation consumers, checks và update targets.
4. **Kiểm owner/consumer và giới hạn phạm vi:** Đọc tài liệu bắt buộc của miền đối tác; chỉ rà soát tác động consumer, không tự mở rộng phạm vi chỉnh sửa.
5. **Sửa nguồn được giao:** Chỉ chỉnh sửa các tệp thuộc phạm vi được giao trong tác vụ hiện tại.
6. **Chạy checks theo tác động:** Chạy các bài kiểm tra được liệt kê trong hợp đồng handoff theo điều kiện `when`.
7. **Báo lại phần đã xác nhận và phần chưa xác nhận:** Minh bạch phần đã kiểm chứng và phần còn chờ visual review, human playtest hoặc đo đạc vật lý.

<a id="files"></a>
## Tạo, sinh và nghỉ một file

- Tìm file/consumer tương tự trước. Nguồn mới cần admission có path/owner/reason
  trong registry; file root mới cần rootFiles. Không thêm vào baseline để né lý do.
- Checkout/phát hành cục bộ từ ngoài dự án giữ nguyên trong `local/checkouts/`
  (ignore, không phải mã active). Đầu vào Word cũ ở `docs/archive/imports/`, có
  provenance; không tự ghi đè Markdown hiện hành từ các bản đó.
- Source theo miền hiện có; skill ở .agents/skills; tài liệu điều hành chỉ sáu
  trang lõi. Chi tiết chỉ tách khi có chủ đề/consumer riêng, được map phân loại.
- Asset theo catalog/credits/ledger; generated theo producer. Tạm ở thư mục
  hệ điều hành hoặc outputs/agent-work, không commit mặc định.
- Trước xóa/di chuyển: kiểm consumer/link/build, save/migration/license, thay đổi
  chưa commit và nơi thay thế. Sổ cleanup giữ hash/Git object nếu cần phục hồi.
  Không dùng xóa để che validation; không ghi đè nhánh/checkouts chưa nhập main.
- Cấm tái tạo hai contract root và nguồn đã nghỉ. Archive chỉ là lịch sử;
  bản reader, báo cáo sinh và evidence không là một bản biên tập song song.

<a id="verify"></a>
## Chọn kiểm theo tác động

| Tác động | Kiểm cần dùng |
| --- | --- |
| Tài liệu/skill/đường dẫn | `npm run check:agents`, `npm run test:agents`; reader check khi đổi export |
| Luật/quest/state | `npm test`; `python tools/validate-witness-contracts.py` nếu đổi contract/design |
| UI/craft/tiến trình | dev rồi test:browser; test:craft-details khi liên quan |
| Collision/Q01 | test:architecture, test:architecture-browser; q01-env và Phase B route khi chạm cảnh |
| GI/renderer/asset | GI --check/--self-test, test:graphics; kit budget/cache/lifecycle khi liên quan |
| Save/API/schema | test:backend; npm test nếu chạm restore/model; kiểm account/slot/reload phù hợp |
| Đóng gói/release | test:build-output, npm run build; smoke web/cloud/cold standalone đúng candidate |

Browser driver hiện dùng Chrome Windows, URL mặc định 8034. WITNESS_BASE_URL
chỉ đổi URL web, không đổi file offline ở checkout. Đọc script trước khi chạy;
không benchmark GPU song song. Evidence phải có build/hash, lệnh, môi trường,
scope và giới hạn. Không đưa token/cookie/save thật vào report.

Q01 PR-05 có cổng riêng `test:q01-campaign-browser`: form nhân vật mới tới Q02,
hai tuyến cứu hộ, lưu/tải và hậu quả/chi phí. Job `q01-campaign-gate` trong CI
chạy trọn chương cho từng tuyến trên gói `dist`, giữ trace/ảnh khi thất bại;
unit/build xanh không thay cổng này. Cấu hình job không phải bằng chứng GitHub
đã thực thi; vẫn ghi kết quả thật và candidate trong bàn giao.

Art cần góc gameplay first/third, ngày/tối và tuyến hoạt động. G3 chỉ đóng khi
có xác nhận người dùng. Playtest người thật theo [protocol 19](the-witness/19-depth-playtest.md);
unit/browser pass không thay art, chuyên môn hoặc thiết bị vật lý. Production
cần kết quả deploy/health/session/save thật riêng khi tác vụ đã cho phép deploy.

<a id="maintain"></a>
## Bảo trì tài liệu cùng skill

Mỗi route trong `registry.knowledge.tasks` có required (đọc đầu), details (tra
khi chạm miền), implementation, checks và updates. Khi đổi nguồn sở hữu, sửa
route, link trong skill, manifest xuất và consumer trong **cùng thay đổi**.
Một tài liệu chỉ được một vai trò; không thêm nguồn active không có owner/route.

Checker kiểm tuyến đọc, anchor, ownership và coverage; pretest/prebuild gọi nó.
Nó không chứng minh ngữ nghĩa toàn truyện, không ép được agent gọi script trực
tiếp và chưa có CI bắt buộc. Ghi rõ các giới hạn, không quảng cáo enforcement tuyệt đối.
