# Kiểm lại candidate PR-04 trên checkout sạch `764dc8a`

Ngày kiểm: 12/11/2026 · SHA: `764dc8a6284734b021415d6ce2ea506d8c5698e9`
(`feat(q01): greybox PR-04 candidate, story/design sync, and graphics Phase 0`)

Bản ghi máy đọc: [`verification.json`](verification.json) (owner `environment-qa`).
Ảnh, trace và log nặng nằm ở `outputs/agent-work/verify-764dc8a-20261112/` (không commit).

## 1. Cách kiểm

| Bước | Lệnh | Kết quả |
| --- | --- | --- |
| Unit/model | `npm test` → 11 script file, chạy theo thứ tự | 11/11 exit 0 (48,3 s) |
| Cloud/save | `npm run test:backend` | 28/28 pass |
| Build | `npm run build` (6 bước) | revision `469e18d00673` |
| Bản sinh | `npm run test:build-output` | 9/9 pass |
| Greybox browser | `npm run test:q01-greybox-browser` (web + ngoại tuyến) | 8/8 pass, 0 lỗi hình học/camera |
| Architecture browser | `npm run test:architecture-browser` | **FAIL** (xem §3) |
| Graphics | `npm run test:graphics` | 5/5 pass, `glError` 0 |

Máy: Windows 10.0.26300, Node v24.14.1, npm 11.11.0, Chrome 157.0.8103.51,
GPU `ANGLE (Intel, Intel(R) Arc(TM) Graphics (0x00007D55) Direct3D11 vs_5_0 ps_5_0, D3D11)`,
khung 1440×900. Web build phục vụ tại `http://127.0.0.1:8035/dist/q01-greybox.html`;
bản ngoại tuyến là `dist/q01-greybox-offline.html` mới build (mọi URL HTTP bị chặn).

## 2. So sánh với candidate PR-04

Candidate PR-04: `local/checkouts/q01-pr04-20261111`, revision `e5bf8b4d1450`,
offline sha256 `7ba70bc0bc8174577…`.

| Hạng mục | PR-04 | `764dc8a` | Kết luận |
| --- | --- | --- | --- |
| Greybox: số lượt chạy | 8 (web + offline × 2 route × 2 view) | 8 | như nhau |
| Greybox: lỗi hình học / camera | 0 / 0 | 0 / 0 | như nhau |
| Greybox: tập support đi được | 22 id giống nhau | 22 id giống nhau | **trùng khớp từng id** |
| Greybox: vị trí 3 actor | — | lệch tối đa **4,2 cm** | trong nhiễu đi bộ scripted |
| Greybox: vòng đời WebGL | 8.592 tam giác / 77 mesh, giải phóng về 0 | 8.592 tam giác / 77 mesh, giải phóng về 0 | như nhau |
| Greybox: tổng frame trace | 13.827 | 15.886 | khác, do nhịp 4× animation, không phải hồi quy |
| Hash nguồn 7 file | — | 6/7 trùng, khác `witness-architecture.js` | commit này thêm batching tĩnh |
| `test:architecture-browser` | pass (7 lượt, 0 lỗi) | **fail** ở lượt đầu | **hồi quy** |

Kết luận: candidate PR-04 và commit `764dc8a` cho **cùng kết quả greybox**, nhưng
`764dc8a` làm hỏng cổng kiểm kiến trúc legacy. Không có bằng chứng nào cho thấy
greybox Q01 bị ảnh hưởng.

## 3. Phát hiện

### F01 — `test:architecture-browser` đỏ trên commit này (chặn)

Commit `764dc8a` thêm gọi `root.WitnessQ01.batch(T,group)` trong
`witness-architecture.js`: mọi mesh dùng chung vật liệu bị gộp thành **một** mesh
(`q01-batched-q01-b-rubble`, `q01-batched-q01-b-stone`…). Cổng kiểm hình học dùng AABB
theo mesh, nên nay nó đo một hộp bao phủ cả kho thay vì từng chi tiết, và báo va chạm
thân người chơi khi đi trên mái:

```
p = { x: -23.6048, y: 3.4643, z: -15.0012, supportId: 'q01-roof-main' }
errors: [ 'torso:q01-batched-q01-b-rubble', 'torso:q01-batched-q01-b-stone' ]
```

A/B cùng máy, cùng ngày: candidate PR-04 (bản **chưa** có batching) chạy lại đúng
script này và **pass** — 7 lượt, 1.918 frame, 0 va chạm thân/camera, 0 lỗi hình học,
8 check (kết quả khớp đúng `verification.json` gốc của PR-04: 7 lượt, 1.915 frame).

Vật lý vẫn dùng danh sách `solids` chưa gộp, nên đây là lỗi **đo đạc của cổng ki**,
chưa chứng minh có va chạm thật trong game. Nhưng cổng ki không đóng được ở commit
này, và commit này **không phải candidate phát hành**.

### F02 — Checkout mới không build được trên Windows (nghiêm trọng)

`core.autocrlf=true` và không có `.gitattributes`, nên `vendor/witness-q01-gi-data.js`
khi checkout mới mang 5 ký tự CRLF (sha256 `d511e08ceeb8aa48…`), còn bằng chứng
`assets/architecture/phase-b/gi-bake.json` ghi hash LF `cf436a107a2ef7f5…`.
`tools/bake-q01-gi.cjs --check` vì thế fail và `npm run build` dừng ngay bước đầu.
Working tree hiện tại byte-identical với blob đã commit nên build chạy được; một
clone mới trên máy này thì không.

### F03 — `dist/` đã commit không tái lập được theo byte

Build lại cho đúng revision đã commit `469e18d00673` nhưng ghi lại 54 file tracked.
`git diff --ignore-cr-at-eol` cho **0** khác biệt: nội dung giống hệt, chỉ khác
CR-at-EOL giữa nguồn LF và bản sinh đã commit.

### F04 — Chuỗi script của `npm` bị treo trên máy này

`npm test` chạy `pretest` xong rồi treo: `cmd.exe` do npm sinh ra không còn tiến trình
con và không kết thúc. Chạy đúng 11 file script theo thứ tự thì tất cả exit 0 trong
48,3 s; các script lệnh đơn (`npm run test:backend`, `npm run test:build-output`,
`npm run test:q01-state`) chạy bình thường. Đây là tương tác môi trường, không phải
lỗi kho mã.

## 4. Giới hạn

Scripted input trên engine dùng chung; không phải playtest người thật, không đo
FPS/thời lượng. Không có xác nhận art, không đóng G3/G4, không nghiệm thu truyện,
không deploy. Cổng ki kiến trúc legacy đang đỏ nên commit `764dc8a` chưa đủ điều kiện
làm candidate phát hành.
