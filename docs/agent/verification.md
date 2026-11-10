# Ma trận kiểm chứng

Chạy từ gốc repository. `package.json` yêu cầu Node **22.13+**; audit dùng Node
24.14.1. Dependency gốc: `npm ci`; công cụ kit có lockfile riêng, dùng
`npm ci --prefix tools/environment-kit` khi cần. Không chạy cài đặt lại vô cớ.

Lệnh tiện dùng: `npm run check:agents`, `npm run test:agents`. Checker được gắn
vào `pretest`/`prebuild`, vì vậy `npm test` và `npm run build` dừng nếu cấu trúc
quản trị sai. Gọi trực tiếp script Node không chạy các hook npm này.

| Thay đổi | Kiểm cần chọn | Điều kết quả chứng minh |
| --- | --- | --- |
| Quản trị/tài liệu/skill/path | `node tools/check-agent-governance.cjs`; `node test/agent-governance.cjs`; `npm run test:build-output` khi chạm pipeline; validator skill theo môi trường nếu có | Cấu trúc, links, retirements, file placement và hành vi checker; không kiểm ngữ nghĩa mọi Bible |
| Thiết kế/campaign contract | `python tools/validate-witness-contracts.py`; governance; `npm test` nếu chạm luật/runtime | Hợp đồng v3 và model thiết kế; validator hiện chưa phủ ngữ nghĩa scene v6 |
| Model/quest/state/UI luật | `npm test`; browser suite tương ứng khi có tương tác UI | `npm test` không chứa backend hoặc browser |
| UI/camera/craft/tiến trình trong game | `npm run dev`, rồi `npm run test:browser`; `npm run test:craft-details` khi liên quan | Chrome script ở URL đang phục vụ; không thay playtest |
| Collision/địa hình/Q01 | `npm run test:architecture`; `npm run test:architecture-browser`; `node test/q01-env.cjs`; Phase B route nếu chạm cảnh | Unit + tuyến đi thực, camera, tầng, save và standalone theo suite |
| Phase B/GI/vật liệu | `node tools/bake-q01-gi.cjs --check`; `node tools/bake-q01-gi.cjs --self-test`; `node test/q01-phase-b-browser.mjs`; `node test/q01-phase-b-light-browser.mjs` | Freshness/math, tuyến gameplay và ánh sáng; art chờ người dùng duyệt |
| Renderer/nhân vật | `npm run test:graphics`; `npm run test:character` khi chạm nhân vật | Tiers và hồi quy theo cảnh test; không chứng nhận toàn bộ game |
| Kit loader/pack/lifecycle | `npm run test:kit-budget`; `npm run test:kit-cache`; `npm run test:kit-lifecycle` | Ngân sách, cache và ownership; profile dùng `npm run test:kit-profile` trên GPU thật khi đo hiệu năng |
| Save/cloud/API/schema | `npm run test:backend`; `npm test` khi chạm model; kiểm sign-in/save/reload phù hợp trong môi trường thử | Workerd/D1 và state machine cục bộ; không chứng minh backend production |
| Build/release | `npm run test:build-output`, các test liên quan + `npm run build`; smoke web, cloud và cold standalone | Build tạo được; phát hành thật cần trạng thái deploy/health/phiên và save thật riêng |

`npm run build` có tác dụng ghi: kiểm GI, ghép engine, kiểm architecture/budget,
static/standalone, Worker. Tài liệu đơn thuần không cần chạy build nếu sẽ gây ghi
đè bản sinh đang dở; kiểm cú pháp và các suite liên quan đủ theo phạm vi thay đổi.

## Môi trường browser và evidence

`test/browser-driver.mjs` hiện dùng đường Chrome Windows cố định. Browser mặc
định vào `http://127.0.0.1:8034/`; `WITNESS_BASE_URL` đổi URL web nhưng **không đổi
đường file offline** trong checkout. Một số script cũ tự quản driver/port; đọc
đầu file test trước khi chạy. Đừng suy đoán mọi test nhận cùng biến môi trường.

Để kiểm cold offline: build đúng checkout, mở `dist/ban-choi-ngoai-tuyen.html`
với HTTP bị chặn theo suite. Phase B có
`node test/q01-phase-b-browser.mjs --offline`. Kiểm trực tiếp ít nhất save/load,
route và quest liên quan. Không dùng cache có sẵn làm bằng chứng tự chứa.

Không chạy nhiều benchmark/browser GPU cùng lúc khi lấy số đo. Report cần ghi:
nguồn/commit hoặc hash, revision từ `dist/build-info.json`, lệnh/URL, môi trường,
scope, pass/fail, artifact path, và giới hạn. Không lưu token, cookie, save người
chơi hay thông tin nhận diện trong report công khai.

## Điều kiện kết thúc

- Chỉnh sửa thông thường: tiêu chí hành vi đạt, governance không có lỗi mới,
  checks liên quan pass hoặc phần bị chặn được nêu rõ, tài liệu đã đồng bộ.
- Art: đối chiếu góc gameplay first/third, ngày/tối, tuyến và tầng; G3 vẫn chờ
  người dùng duyệt nếu chưa có xác nhận. Unit/browser pass không tự đóng gate.
- Release: source/build/evidence phải cùng candidate; giữ tương thích DB/save,
  payload không có file lạc; ghi kết quả deployment riêng. Không gắn nhãn đã
  triển khai nếu chỉ đóng gói hoặc đẩy Git thành công.
