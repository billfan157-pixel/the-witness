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
| Q01 v6 scene state (foundation) | `witness-q01-state.js` thuần reducer; model giữ `sceneProgress.Q01` và chặn commit Q01 |
| Điều phối và UI | witness-app, workshop-ui, field-ui, craft-renderer, witness.css |
| Thế giới/kiến trúc | witness-world, witness-architecture, witness-q01, witness-q01-environment, witness-modular-kit |
| Q01 PR-04 spatial candidate | `witness-q01-greybox.js` sở hữu blueprint/anchors/mesh/cơ cấu; `q01-greybox.html` + `q01-greybox-lab.js` là tuyến đi kiểm bằng engine thật, tách khỏi campaign presenter PR-05 |
| Q01 PR-05 campaign | `witness-q01-campaign.js` nối chín Beat, thoại và choreography vào campaign; `witness-q01-interaction.js` giữ tiền đề vị trí/người tại model; `witness-q01-art.js` dựng hình ảnh trên cùng blueprint PR-04 |
| Engine đọc được | `tools/environment-kit/engine-runtime.js`; build-engine ghép vào vendor/adventure-3d, giữ core pin hash |
| Renderer/nhân vật | các module trong vendor; phần tùy biến ở đó vẫn là nguồn, không tự thay toàn thư mục |
| Âm thanh/dẫn hướng | witness-audio, audio-library, ambience, compass; `tools/vieneu-tts.cjs` + `tools/vieneu-cast.json` + `tools/vieneu-tts-worker.py` (local `local/vieneu-venv`); ghi nguồn/giấy phép của media thật |
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

`sceneProgress.Q01` (PR-03) mang scene state Q01 v6 trong cùng schema 2; `null`
nghĩa là v6 chưa kích hoạt và gameplay v3 giữ nguyên. `Model.restore` validate scene
state nên Worker/D1 tự chấp nhận hoặc từ chối; không đổi schema, contentVersion,
campaignId, API v1 hay namespace. Scene completion chỉ chặn commit, không phải nguồn
quest completion thứ hai (`quests.Q01.route`/`Q01.COMMITTED` vẫn sở hữu ở model);
khi v6 kích hoạt, actions Q01 mở theo nhịp (02: brace/ledger; 07: meal/choose; 08: commit),
và q01SceneEvent kiểm tra hoàn tất task trước khi chốt ledgerSeam/recallT05.

PR-05 bật scene qua `beginQ01Scene(fresh(profile), {campaign:true})` tại form
tạo nhân vật; cờ tùy chọn `flags.q01Campaign` bật tiền đề không gian của model,
không tạo nguồn completion khác. Save scene-null đang đi dở giữ giao diện v3;
save foundation đã có scene được presenter tiếp tục. Không đổi schema/API/D1.
Trong `exit`/`extract` chưa chốt, load phục hồi cả nhóm theo checkpoint của 07,
không hứa lưu từng vị trí actor. Cơ cấu đang chuyển động không được chốt trước
khi tới cữ; đóng menu không tự bỏ khóa tương tác. Hình ảnh v6 dùng ánh trực tiếp,
IBL/AO và đèn cục bộ; không áp trường GI của kho v3 lên topology v6.

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
| tools/vieneu-tts.cjs (`--changed-only` / `--check` / `--sync`) | `assets/audio/q01/vieneu/**`, `assets/audio/q01/vieneu-sources.json` và phần `experimentalVoices`/`voiceProfiles` trong `witness-audio-library.js`; giữ nguyên bản ElevenLabs gốc |
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
