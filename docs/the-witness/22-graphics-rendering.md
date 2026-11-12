# Graphics rendering upgrade

The existing WebGL renderer and first-person / third-person controls are retained.
The changes live in `vendor/adventure-visuals.js`, `vendor/witness-graphics.js`
and bounded integration points in the bundled `vendor/adventure-3d.js`.

- The HDR `sceneRT` requests up to four MSAA samples, using the actual sample
  counts supported by its color attachment format. Its depth texture is resolved
  with its color attachment before postprocessing.
- High / Ultra use Three.js r187 GTAO with depth-reconstructed normals, a .85 m
  world radius and .8 m thickness. Half-resolution AO uses 12 / 24 horizon
  samples, an eight-tap depth/normal-aware Poisson denoiser and bilateral
  upsampling. Balanced disables AO and bloom but keeps MSAA, LUT and height fog.
- The directional shadow uses a 44 x 44 m orthographic footprint following the
  player and looking five metres ahead. Its light-space center snaps to shadow
  texels to limit swimming. The existing 2048 map is retained. This is a single
  local shadow map, not cascaded shadow maps; distant scenery can fall outside it.
- Each scene selects a cached 16-cubed color-grading LUT. It runs after ACES tone
  mapping, before output color conversion. The grading uses climate, scene ID
  and interior/night treatment. `sceneLooks` provides separate authored grading
  and mist settings for all 12 chapters, five Legends and four Veils.
- Height fog integrates exponential density along the camera-to-surface ray in
  linear HDR. The level-ray case uses a stable expansion. The ordinary
  exponential scene fog remains available if postprocessing falls back.
- Terrain uses three bundled PBR atlases: sRGB albedo, linear OpenGL normals,
  and packed AO / roughness / height. Four normalized splat weights blend soil,
  limestone, grass and paths with height-aware boundaries. Atlas gutters and
  explicit texture gradients limit seams and unstable mip selection.
- Hills and winding dry drainage channels are displaced vertices, sampled by
  the same height function used to place actors and decorations. Relief fades
  near authored routes and activity anchors; required flat Legend scenes stay
  flat. The cistern retains its authored indoor floor material.
- `noSurface` and `noCast` remain scene-building flags and are removed before
  calling `MeshStandardMaterial`.
- The build embeds nested terrain assets in the standalone HTML and includes
  them in the versioned service worker cache.

The source sets, authors, license and source checksums are recorded in
`assets/ART-CREDITS.md` and `assets/terrain/sources.json`. `tools/prepare-terrain.py`
rebuilds all atlases from the checked original map downloads.

Run `npm test`, `npm run test:graphics`, and `npm run build`. The graphics test
checks rendered daytime / night scenes, mobile layout, shader/material console
messages, MSAA capability, shadow bounds, displaced terrain and a controlled
GTAO contact image with quality/size changes. Screenshots and the JSON report
are written to `test/artifacts/graphics/`.

Automated browser checks use desktop Chrome / SwiftShader. They do not establish
physical phone compatibility, device GPU performance or sustained real-device FPS.

<a id="runtime-budget"></a>
## Runtime batching and budget counters

- `WitnessQ01.batch(T, group)` flattens nested static part groups by material and
  bakes their world transform. `witness-architecture.js` applies it to
  `q01-playable-store`; Q01 environment modules reuse the same function. Dynamic
  nodes keep their own draw: lamp flames, drying linen, instanced foliage and
  everything under `witness-crafted-scenes`.
- Each character root receives one shared contact-shade quad
  (`witness-contact-shadow`). It restores the centimetre-scale darkening that the
  2048 directional map cannot resolve, without a screen-space pass. The quads
  share one geometry and one material.
- The scene pass publishes `calls`, `triangles`, `programs`, `textures` and
  `geometries` in `scene.userData.graphicsStatus`; `test:graphics` records them
  per scene. These counters are regression evidence, not a performance
  certification.
- Measured 12/11/2026, Intel Arc iGPU / ANGLE D3D11, 1600x900 ultra, Q01:
  257 calls including the shadow pass, 366 meshes (from 439), 212 materials,
  557k triangles. Batching removed 73 nodes; frame time moved within this
  machine's run-to-run noise, so the counters are the reliable signal.
- Terrain atlas anisotropy is 8. It stays clamped by the device maximum.

<a id="q01-lighting"></a>
## Q01: timeline kịch bản và giới hạn preset

Đối chiếu nguồn ngày 11/11/2026: `witness-q01.js` khai báo `q01-day` và
`q01-evening`, chọn bằng `settings.q01Lighting`; GI dùng dữ liệu nướng tĩnh.
`q01-evening` có thuộc tính `night: true` phục vụ render, nhưng không phải một
preset đêm độc lập hoặc hệ chuyển thời gian tự động theo Beat.

| Nhịp kịch bản 07 | Yêu cầu hình ảnh | Trạng thái kỹ thuật |
| --- | --- | --- |
| Beat 00–02 | Chiều muộn/hoàng hôn | Cần đối chiếu góc cảnh với preset hiện có |
| Beat 03–06 | Chạng vạng/tối, kho cháy | `q01-evening` là mốc render; chưa chứng minh cảnh cháy v6 |
| Beat 07 | Đêm trong xưởng, đèn dầu | Chưa có preset `night` độc lập gắn Beat |
| Beat 08 | Rạng sáng hôm sau | Chưa có preset `dawn` gắn Beat |

Giai đoạn logic trong `sceneProgress.Q01` không tự đổi lighting. Đây là khoảng
cách sản xuất để đối chiếu với [kịch bản 07](07-vertical-slice-screenplay.md),
không là yêu cầu đổi renderer trong đợt rà soát tài liệu. Tình trạng G3/G4
vẫn theo [STATUS](../STATUS.md#open); chuyển ghi chú ra khỏi screenplay không
đóng các cổng đó.

**Đích bàn giao Q01 ngày 11/11/2026:** [07 — hợp đồng camera](07-vertical-slice-screenplay.md#q01-camera)
chốt camera liền mạch mặc định, nén đêm trong cùng khung sau khi người chơi chọn
nghỉ và ghi rõ “Sáng hôm sau”. `recallT05` chỉ chốt sau đoạn nhớ/nghỉ/chuyển sáng,
tránh phase `dawn` xuất hiện giữa cuộc nói ban đêm. Đêm/bình minh phải được dựng
thật và kiểm GI/độ đọc/restore trong tác vụ H04 sau; đổi tên preset hoặc đọc phase
chưa chứng minh đã có chúng. Chế độ giảm chuyển động/load không bị loại vì phá
một yêu cầu “một cú máy không bao giờ ngắt”.
