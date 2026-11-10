# Cảnh mẫu Q01 đang chờ duyệt

**AI agent:** bắt đầu từ [bản đồ nguồn chuẩn](../agent/README.md) và
[trạng thái đối chiếu](../agent/status.md); dùng các hồ sơ môi trường dưới đây
làm nguồn sở hữu, không tạo roadmap hoặc catalog song song.

Giai đoạn B đã bổ sung bộ kiến trúc/vật liệu dùng chung, mép bến cong và GI
tĩnh cho kho. Đọc [hồ sơ Phase B](phase-b.md),
[nguồn bổ sung](research/q01-phase-b-materials.md) và kết quả toàn tuyến ở
`validation/phase-b/verification.json`. Bộ ảnh kiểm gồm 17 vị trí chơi,
hai góc nhìn, hai ánh sáng; trạng thái duyệt mỹ thuật vẫn tách khỏi kiểm thử.

Bản cảnh mẫu bến–kho phía tây–Titus đã được sản xuất với hai ánh sáng.
Đọc [hồ sơ cảnh](q01-gold-scene.md) và [nguồn vật liệu](research/q01-gold-materials.md).
Trong Q01, Bản đồ dẫn tới cửa và sân mái; V đổi góc nhìn; nút trên thanh công cụ đổi ngày/tối.
G3 chỉ được đánh dấu đạt sau khi hình ảnh được người dùng chấp thuận.

# Bộ tài nguyên môi trường

Đọc roadmap.md và progress.json trước khi tiếp tục sản xuất. Q01 bắt buộc,
L04 mở rộng; AI thực hiện toàn bộ build. Giai đoạn 1–2 đã có bằng chứng nền
tảng và pipeline. Giai đoạn 3 đã đạt cổng G2: tuyến bến–cửa–phòng–thang–mái
đi lại được trong cả hai góc nhìn, kể cả bản offline chặn mọi HTTP. Việc tiếp
theo là giai đoạn 4: góc look development Q01 trên công trình đã đi lại được.

## Đầu ra dùng để phát triển

- `roadmap.md`, `standards.md`, `look-bible.md`: phạm vi và hợp đồng dựng asset.
- `research/references.json`: 16 quan sát của hai vùng từ 8 nguồn; vị trí đọc,
  niên đại, mức tin cậy, giới hạn và quyền hình. `source-register.md` giải thích
  các điểm sửa về basalt, vữa, công trình muộn và thuyền.
- `environment-references.html` ở gốc dự án: board có sơ đồ [H] và liên kết
  tới ảnh nguồn. Không dùng sơ đồ như bản đo; không chép ảnh hạn chế quyền.
- `kit-lab.html`: xưởng 3D, so raw/full/lite và 1/200 module.
- `catalog.csv`: mẫu pipeline, nền kiến trúc và các asset Q01 đang chờ duyệt mỹ thuật.

Không dùng Coral Ground 02 để kết luận đúng bề mặt kurkar Caesarea. Mẫu tường
có chất liệu rõ nhưng độ đồng đều, lớp trát, mạch và phong hóa cần tác giả
biên tập ở giai đoạn look development. Kho phía tây Q01 kế thừa nền nhiều
tầng đi lại được và đã có bản hoàn thiện hình ảnh chờ duyệt (sáng tác [H]); các công trình khác
vẫn đóng và không được tính là kiến trúc đã nghiệm thu.

## Sản xuất lại

Chạy ở gốc dự án bằng Node 22.13 trở lên (theo `package.json`):

```sh
npm run setup:kit
npm run build:kit
npm run test:kit-budget
npm run test:kit-cache
npm run build
```

`setup:kit` cài dependency từ lockfile và tải encoder WASI đúng SHA256.
`build:kit` tạo GLB nguồn 288 tam giác, UV, albedo sRGB, normal OpenGL và ORM
linear; kênh B height của atlas terrain được đặt về 0 trước khi thành ORM.
Full dùng ETC1S albedo/ORM và UASTC normal, 10 mip, mesh nén Meshopt. Raw PNG
512 là đối chứng; lite PNG 256 không cần transcoder. Addon dùng cùng Three
r187 với engine, không nhúng core thứ hai.

GLB có tên theo hash. Manifest có kích thước, SHA256, nguồn và trạng thái.
Footprint được giữ trong hệ asset để matrix giải lượng tử không làm sai
collision. Đây vẫn chỉ là footprint 2D, chưa là sàn hay collision kiến trúc 3D.

## Quyền sở hữu khi tích hợp

```js
const kit = WitnessKit.create(Adventure3D.getCore(), renderer);
const scope = kit.createScope(scene);
await scope.mount('./assets/environment-kit/cae/manifest-v2.json', {
  quality: 'full', transforms: [{ position: [0, 0, 0] }]
});
// Khi rời cảnh: hủy tải còn chờ, gỡ instance và trả tài nguyên dùng chung.
scope.close();
// Khi đóng cả runtime, chờ decode còn chạy rồi đóng worker pool.
await kit.dispose();
```

Không dispose geometry/material của template từ code cảnh. Các lease còn
sống giữ tài nguyên đến chủ cuối cùng. Cảnh đã close không nhận model đến
muộn. Lỗi một phần pack giải phóng các phần tải thành công; lỗi tải được phép
retry. Nếu chưa thay công trình cũ, giữ builder cũ cho gameplay.

## Bằng chứng và số đo

`validation/kit-proof.json` có 12 góc baseline cùng fixture/camera.
`validation/lifecycle.json` ghi kiểm tra các biến thể, sai màu, sai hash,
truncated GLB, hủy tải chung, đóng cảnh giữa parse và attach, retry, lỗi một
phần, nhiều chủ đồng thời và 24 lần đổi cảnh. Sau khi đóng, bộ đếm ổn định
ở 1 geometry, 3 texture, 3 chương trình của cảnh lab nền.

Cache thực được kiểm bằng service worker và reload khi mất mạng; bản lab
tự chứa được mở bằng file với HTTP bị chặn, vẫn giải mã KTX2/Meshopt/WASM.
Bản chơi standalone nhúng gói lite đang dùng; bản lab nhúng cả ba để so sánh.

`validation/hardware-profile.json` ghi Intel Arc trên ASUS Vivobook S 16,
Core Ultra 7 155H, khoảng 16 GB RAM, driver 32.0.101.6127. Cảnh 200 module,
drawing buffer 1920 × 1080, DPR 1, MSAA 4, shadow 1024; mỗi tier hai lượt,
mỗi lượt 90 frame làm nóng và 240 frame lấy mẫu. GPU timer query đo khoảng
1,61 ms raw và 1,63 ms full ở lượt đã lưu. Ba texture giảm từ khoảng 4 MiB
xuống 1 MiB upload; GLB full khoảng 537 KiB so với raw khoảng 2001 KiB.

Đây là Chrome headless trên GPU thật, không phải SwiftShader; không đo trình
chiếu màn hình, độ trễ điều khiển, điện thoại, tổng VRAM driver hoặc Q01 hoàn
chỉnh. Dữ liệu upload không phải toàn bộ bộ nhớ cư trú GPU. Frame RAF chịu
tác động lịch trình OS và không thay GPU timer.

## Bằng chứng kiến trúc Phase 3

`phase-3.md` mô tả hợp đồng công năng của kho phía tây Q01.
`validation/phase3/model.json` ghi chín kiểm tra unit: tuyến liên tục, capsule
chống xuyên nhanh, khoảng bậc, lintel/trần, sàn chồng cùng x,z, camera,
snapshot không gian và địa hình tam giác. `validation/phase3/browser.json` ghi
bảy lượt đi thật trong engine (1.999 frame): dẫn đường và phím W, cả hai góc
nhìn, lưu/tải giữa thang và trên mái, chặn tương tác xuyên tầng, nhiệm vụ Q01
còn với tới, và bản standalone lạnh đi hết tuyến khi mọi HTTP bị chặn. Mỗi tám
frame, Box3 và raycast trên mesh hiển thị kiểm tra độc lập khoảng hở camera,
thân người và sàn đỡ dưới chân; kết quả 0 lỗi. `validation/phase3/verification.json`
ghi build 1ca87a3f70b6, hash nguồn, standalone 12,97 MB giống hệt bản đã kiểm
tra và toàn bộ hồi quy pass. Ảnh và trace từng frame nằm ở
`outputs/environment-kit/phase3/`.

Chạy lại: `npm run dev` (cổng 8034), `npm run build`, rồi
`npm run test:architecture` và `npm run test:architecture-browser`. Suite browser
mất khoảng vài phút, dùng GPU thật và tự mở bản offline trong dist. Kiểm tra
scripted không là playtest người thật; blockout không là mỹ thuật cuối.

Chạy `npm run dev` ở cổng 8034 rồi `npm run test:kit-lifecycle` để lặp kiểm
chức năng; bản lab offline cần được build trước. `npm run test:kit-profile`
đo phần cứng, từ chối software renderer. Không chạy thêm benchmark/browser
nặng khi lấy mẫu. Với hồi quy game ở server riêng, đặt `WITNESS_BASE_URL`;
biến này không đổi đường file offline được build trong checkout đang kiểm.
