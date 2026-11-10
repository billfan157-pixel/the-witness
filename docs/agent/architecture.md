# Bản đồ kiến trúc và đường sinh dữ liệu

Đối chiếu tĩnh ngày 10/11/2026; tên/quan hệ phải được cập nhật khi đổi cấu trúc.
Đọc module thực tế trước khi sửa. Đây là bản đồ trách nhiệm, không cam kết mọi
tham chiếu chỉ đi theo một chiều.

## Runtime trình duyệt

`index.html` là điểm nạp bằng các script `defer` theo thứ tự, dùng global APIs
và các nhánh CommonJS cho test; đây chưa là ứng dụng module/bundler toàn phần.
Đổi thứ tự nạp cần kiểm ở browser và bản standalone.

| Nhóm | File sở hữu / chức năng |
| --- | --- |
| Catalog và luật | `witness-content.js` khai báo campaign; `witness-spine.js` trục Legends; `witness-depth.js` encounter; `witness-relationships.js` quan hệ; `witness-craft.js` công việc hiện trường |
| State và hành động | `witness-model.js`: fresh/restore, quyền hành động, tiến trình, vị trí và save. UI không được tự ghi state để vượt luật model |
| Giao diện | `witness-app.js` điều phối; `witness-workshop-ui.js`, `witness-field-ui.js`, `witness-craft-renderer.js` dựng và nối tương tác; `witness.css` |
| Không gian | `witness-world.js` dựng cảnh; `witness-architecture.js` collision/nhiều tầng; `witness-q01.js` bố cục; `witness-q01-environment.js` cảnh Phase B; `witness-modular-kit.js` tích hợp asset |
| Engine | Nguồn runtime đọc được: `tools/environment-kit/engine-runtime.js`. `build-engine.cjs` ghép vào `vendor/adventure-3d.js`, giữ prefix Three/core đã pin hash và suffix export |
| Đồ họa/nhân vật | `vendor/adventure-visuals.js`, `witness-graphics.js`, `witness-gtao.js`, bộ character và topology; không coi toàn bộ vendor là thư viện có thể thay vô điều kiện |
| Kit loader | `tools/environment-kit/runtime.mjs`, `bundle-loader.mjs` và bộ JS/WASM trong vendor; cùng Three r187, lifecycle theo scope/lease |
| Âm thanh/dẫn hướng | `witness-audio.js`, `witness-audio-library.js`, `witness-ambience.js`, `witness-compass.js`; tra ledger trước khi thêm media |
| Đồng bộ | `witness-cloud.js`: account/slot namespace, persistent outbox, CAS/retry/conflict; `witness-app.js` kết nối phiên với game |

Tên vendor rút gọn trong bảng nằm trong `vendor/`. `kit-lab.html`/`kit-lab.js`
là xưởng thử kit; `environment-references.html` được builder tạo từ nguồn research.

## Save và server

- Save hiện tại: `schema: 2`, `contentVersion: '3.0'`, campaign
  `the-witness-spine-v3`. Guest key `the-witness.spine.v3`, có backup và nhánh
  nhập legacy; đọc `restore` để biết chính xác dữ liệu được chấp nhận.
- `server/worker.mjs` phân tuyến `/api/` sang `server/api.mjs`, còn lại tới
  binding `ASSETS`. Danh tính production do nền tảng chuyển vào, không do
  payload client chọn. Demo identity chỉ thuộc server phát triển.
- Schema biên tập ở `db/schema.ts`; `drizzle.config.ts`/`db:generate` sinh
  migration trong `drizzle/`. Không sửa migration đã áp dụng để đổi lịch sử.
- `dev` phục vụ nguồn tĩnh trên loopback cổng mặc định 8034; `dev:cloud` dùng
  Miniflare cổng mặc định 8035 và dữ liệu cục bộ `.witness-runtime/`.

## Nguồn → đầu ra

| Nguồn biên tập | Builder / lệnh | Đầu ra, không sửa tay |
| --- | --- | --- |
| `engine-runtime.js` + core pin hiện hữu | `npm run build:engine` | `vendor/adventure-3d.js` (file hỗn hợp: chỉ phần runtime được sinh) |
| `witness-q01*.js` và đầu vào GI khai báo trong baker | `node tools/bake-q01-gi.cjs`; `--check` chỉ kiểm freshness | `vendor/witness-q01-gi-data.js`, `assets/architecture/phase-b/gi-bake.json` |
| Kit sources / atlas / material scripts | `npm run build:kit`, các builder chuyên biệt trong `tools/environment-kit/` | GLB/manifests/loader, board và reference page; đọc script để biết phạm vi ghi trước khi chạy |
| JS/CSS/HTML + assets/vendor | `node tools/build.cjs` (trong `npm run build`) | `dist/`, `dist/ban-choi-ngoai-tuyen.html`, `dist/kit-lab-offline.html`, **`witness-sw.js` ở gốc** |
| Static dist + Worker + migration + hosting | `node tools/build-cloud.mjs` (sau static build) | `dist/client/`, `dist/server/`, `dist/.openai/`; build không phải deploy |
| Markdown + 4 contracts ở `docs/the-witness/` theo `documentFiles` | `python tools/build-witness-docs.py` | `outputs/THE-WITNESS-Design-v3.2/` và archive; Python Markdown cần có |
| Report browser + build/hash | Các tool verify/record hiện có | `docs/environment-kit/validation/` và report ở outputs/test artifacts; không sửa kết quả thành pass bằng tay |

`tools/build-output.cjs` giới hạn việc dọn vào dist và ba thư mục cloud đã biết,
từ chối junction/symlink rồi dựng lại đầu ra. Static build kiểm hash và bản nguồn
của reader tùy chọn trước khi dọn; thiếu export thì không đóng reader, export
lỗi thời thì dừng và yêu cầu tạo lại. Cloud build làm sạch client/server/hosting
để không giữ tài liệu hoặc migration cũ. Thử release ở checkout riêng khi cây
gốc có bản sinh đang dùng để nghiệm thu; không ghi đè phần làm dở vô cớ.

Hai JSON contract trùng ở gốc đã loại bỏ; test đọc trực tiếp `docs/the-witness/`.
Không tự thay bốn loại phiên bản (game/design/narrative/save) cho giống nhau.
