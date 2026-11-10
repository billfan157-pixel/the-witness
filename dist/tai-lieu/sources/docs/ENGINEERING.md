# Nguồn kỹ thuật và pipeline

<a id="runtime"></a>
## Điểm sửa theo trách nhiệm

`index.html` nạp global APIs bằng script defer theo thứ tự; chưa phải toàn bộ
ứng dụng ES module. Runtime có nhánh CommonJS cho test. Thêm module phải cập
nhật thứ tự nạp, builder, standalone và consumer.

| Trách nhiệm | Nguồn code |
| --- | --- |
| Catalog và luật chapter/Legend | witness-content, witness-spine, witness-depth, witness-relationships, witness-craft |
| State, quyền hành động, restore/save | `witness-model.js`; UI không tự bỏ qua model |
| Điều phối và UI | witness-app, workshop-ui, field-ui, craft-renderer, witness.css |
| Thế giới/kiến trúc | witness-world, witness-architecture, witness-q01, witness-q01-environment, witness-modular-kit |
| Engine đọc được | `tools/environment-kit/engine-runtime.js`; build-engine ghép vào vendor/adventure-3d, giữ core pin hash |
| Renderer/nhân vật | các module trong vendor; phần tùy biến ở đó vẫn là nguồn, không tự thay toàn thư mục |
| Âm thanh/dẫn hướng | witness-audio, audio-library, ambience, compass; ghi nguồn/giấy phép của media thật |
| Kit | tools/environment-kit/runtime.mjs và bundle-loader; scope/lease quản ownership |

Tên witness rút gọn trong bảng là file JS ở gốc; tên vendor nằm trong `vendor/`.
Chi tiết renderer ở [22](the-witness/22-graphics-rendering.md); nghiên cứu input
ở [24-input](the-witness/24-input-and-ux-research.md) là tham khảo, không là config.

<a id="save"></a>
## Save, danh tính và database

Save hiện tại schema 2/contentVersion 3.0/campaign the-witness-spine-v3; guest
key the-witness.spine.v3 có backup/legacy path. Đọc `restore` trước khi đổi state.
Cloud dùng namespace account/slot, outbox bền vững, revision/CAS và mutation ID.
Không tự chọn bản thắng bằng đồng hồ client, bỏ tombstone hoặc trộn guest/account.

Worker phân `/api/` sang server/api.mjs, còn lại tới ASSETS. Danh tính production
do nền tảng cấp; demo identity chỉ ở dev. `db/schema.ts` sở hữu schema;
`npm run db:generate` sinh migration mới; không sửa migration đã áp dụng.
API, giới hạn, recovery và kiểm tra bảo mật chi tiết chỉ sở hữu ở
[23 Backend](the-witness/23-backend-and-cloud-saves.md), không chép bảng API vào đây.

<a id="environment"></a>
## Cảnh và asset

Nguồn sở hữu: [standards](environment-kit/standards.md) cho hợp đồng kỹ thuật,
[look-bible](environment-kit/look-bible.md) cho hướng hình ảnh,
[roadmap](environment-kit/roadmap.md) cho phạm vi/gates,
[progress](environment-kit/progress.json) cho trạng thái duyệt;
catalog/ART-CREDITS/source ledgers sở hữu asset/nguồn/license.

Q01 hiện dùng [Phase B](environment-kit/phase-b.md); hồ sơ gold/phase-3 giữ phạm
vi đã kiểm ở các mốc trước, không tự chứng nhận candidate mới. Giữ mét/Y-up,
collision/camera/sàn nhiều tầng, cùng Three instance và scope lifecycle. Không
dispose shared template từ scene. GI đổi đầu vào phải bake rồi kiểm freshness.
Không dùng asset/reference [H] như bản đo khảo cổ.

<a id="pipeline"></a>
## Nguồn → bản sinh

| Producer | Đầu ra |
| --- | --- |
| build-engine | Phần runtime trong vendor/adventure-3d.js |
| bake-q01-gi (`--check` chỉ kiểm) | vendor/witness-q01-gi-data.js và metadata GI |
| build:kit và material builders | GLB/manifests/loader/reference board; đọc phạm vi ghi trước khi chạy |
| tools/build.cjs | dist, standalone và **witness-sw.js ở gốc** |
| tools/build-cloud.mjs | dist/client, dist/server, dist/.openai + migrations |
| build-witness-docs.py | Reader/archive theo manifest hiện hành, có hash các nguồn |
| build-depth-atlas / build-craft-dossier | Báo cáo tra cứu trong outputs/reference + hai contract sinh |

Không sửa bản sinh rồi để build ghi đè. build-output.cjs chỉ dọn vùng sinh đã
giới hạn, từ chối symlink/junction; reader tùy chọn phải còn khớp nguồn. Dùng
staging khi có bản sinh đang nghiệm thu hoặc thay đổi của việc khác.
Node tối thiểu theo package; lockfile gốc và kit riêng. Dev tĩnh mặc định 8034,
cloud 8035; không dùng server thử như cấu hình production.
