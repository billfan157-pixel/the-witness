# Trạng thái và quyết định cần biết

Mốc tái cấu trúc: **10/11/2026**. Chỉ ghi trạng thái ảnh hưởng công việc tiếp
theo; số đo/evidence và gate vẫn ở nguồn sở hữu. Code đang dùng và thiết kế cần
được kiểm lại khi bắt đầu một tác vụ.

<a id="open"></a>
## Khoảng cách còn mở

| ID | Đang lệch/chưa xác nhận | Hành động khi chạm miền |
| --- | --- | --- |
| A01 | T01–T13/E01–E12/P01–P05 là thiết kế truyện v6 đã chọn; runtime/contract vẫn 10 evidence/4 claims. Q01 có state foundation và greybox PR-04 riêng; presenter/gameplay chín Beat thuộc PR-05 | Phân biệt thiết kế, không gian đã dựng và gameplay chờ gắn; nâng cấp phải đồng bộ content/model/UI/restore/server và kiểm tương thích, không chỉ thêm ID vào JSON |
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

- **D014 — Q01: một kịch bản bàn giao AI (11/11/2026).** Theo yêu cầu rà chín
  Beat, 07 phần 1–2 sở hữu phân cảnh/thoại/camera/sáng-tối/tri thức và ánh xạ state;
  03/06/11 dẫn về cùng bản, 05/18/22 và STORY được đối chiếu. Checkout chuyển từ
  `106ed916` sang `a6c264baacbc096f11a104359b1063fcc57e6406` do công việc có sẵn
  được commit trong lúc rà; đã đọc lại nguồn và giữ nguyên Q03/L01 ngoài phạm vi.
  Đích Q01 là 42 phút, khoảng 40–45 chưa đo. One-shot là dàn dựng liền mạch mặc
  định, nén đêm có thông báo trong cùng khung và giữ ngoại lệ tiếp cận/load.
  T05 ở 07 là ký ức riêng, Natan không tự biết chữ ký quá sớm; Yosef không biết
  nguyên nhân cháy/cái chết Haddai; Titus chưa biết âm mưu công cụ. Tách Q01.LOAD
  với xe cứu hộ, giữ dấu xe/xà đúng route. `choose` ở 07 chỉ đặt phần việc; execution
  cũ ở 08 sau B06 mới commit/trừ phí một lần. Không đổi ID/schema/task/runtime.
  H02 được dùng cho biên tập Beat/thoại; H01 geometry, H03 action/restore, H04
  renderer và H05 candidate là trigger phải xử lý khi giao triển khai phần tương
  ứng, không được suy đã xong từ bản kịch bản. Scene foundation vẫn là PR-03,
  gameplay/presenter/lighting Q01 v6 và G3/G4 vẫn còn mở.

- **D015 — Hiệu chỉnh bàn giao Q01 theo góp ý (11/11/2026).** Xác nhận ba điểm
  thiếu chặt về vật trao tay/field cửa/vị trí Titus; nhận góp ý biên tập tăng đời
  sống riêng Yosef và sức nặng mất cha ở Beat 07. T06/12 khóa hai vật vốn rời:
  avatar nhận nguyên sổ/gáy, Natan giữ tờ bìa hồ sơ kẹp E01 tới Q04; không tháo/
  khâu lại gáy trước Q10. 07 phân biệt bọc vận chuyển ẩm với vải lót khô, ghi
  rõ hai người chứng kiến và xử lý load giữa nhận sổ/quan sát. `sideExit` giữ tên
  cũ, chỉ đường chung gác–mái đã mở/kiểm; manual không mở cánh ngăn cơ học. Titus
  cùng avatar kiểm mái, ở lại điểm nhận, avatar quay xuống C1 trước khi chốt
  `exit`; bảng checkpoint không cho nhân đôi actor hoặc snap vị trí mỗi frame.
  Mẹ/chậu cây của Yosef dùng đời sống đã có ở 11/Q02, không thêm nguồn/consent;
  Natan có nỗi nhớ bạn riêng, T05 vẫn chỉ được người chơi tiếp nhận. Đồng bộ
  03/05/06/11 và STORY theo nguồn 07/12, giữ phần khác của bản bàn giao D014.
  Tuyến chính vẫn content/H02; H03 chỉ cần khi triển khai binding/restore, H01/
  H04 khi dựng không gian/hình ảnh thực. Đợt này là sửa kịch bản, không đổi code,
  ID/schema/cổng hoặc nhận art/deploy; cảm xúc chưa được coi là đã qua playtest.

- **D016 — Khóa tiền đề task/vị trí Q01 v6 theo Mục 2.9–2.10 (H03, 11/11/2026).**
  Kích hoạt ràng buộc liên miền giữa model chiến dịch và `WitnessQ01State`:
  1) `requireGroundWork` mở rộng kiểm tra các mặt sàn cao độ `roof|step|mezzanine|landing`;
     whitelist `restore` mở rộng nhận `q01-drain|q01-mezzanine|q01-landing`.
  2) `actions(s)` khóa thứ tự xuất hiện task Q01 theo Beat khi chạy v6 (`brace`/`ledger`
     tại Beat >= 2, `meal`/`choose` tại Beat >= 7, bàn giao `pay-lodging`/`give-oil` tại Beat 8
     sau khi `b06PreliminaryObserved`). Save cũ (`sceneProgress.Q01 === null`) giữ nguyên 100% v3.
  3) `q01SceneEvent` kiểm tra điều kiện hoàn tất task trước khi chốt `ledgerSeam` (`brace` + `ledger`)
     và `recallT05` (`meal` + `plan`).
  Đã cập nhật đồng bộ các bài kiểm tra consumer (`test/campaign.cjs`, `test/backend.test.mjs`,
  `test/cloud-client.test.cjs`) và đóng gói lại `dist/`. Đạt 100% checks: `check:agents`, `npm test`,
  `test:backend`, `test:build-output`, `test:agents`. Chưa dựng hình học 3D mezzanine/landing (H01).

- **D017 — Q01 PR-04 spatial candidate (11/11/2026).** Theo yêu cầu trực tiếp
  dựng không gian chơi được, chọn environment; H01 geometry, H04 mesh/lighting,
  H05 candidate được kích hoạt. Đối chiếu H03 để giữ nguyên support ID/schema
  và chiếu state PR-03; không sửa model/server. Không triển khai trigger H02
  về thoại/chốt Beat trong đợt này. `witness-q01-greybox.js` sở hữu blueprint,
  anchors đủ 00–08, mesh/collision và adapter đọc `rescue.route/steps` hiện hành;
  `q01-greybox.html` + lab dùng cùng engine/capsule, có hai tuyến cơ cấu độc lập,
  kiểm đường ba proxy actor, kho trệt/gác, cửa chung/mái, thang xuống và rãnh
  tự chọn. Kho v3 mặc định và Q01.LOAD được giữ; không tự kích hoạt v6 hoặc ghi
  save/quest/evidence/consent từ lab. Bố trí/API bàn giao PR-05 thuộc hồ sơ cảnh
  `docs/environment-kit/phase-b.md`; artAccepted false, G3/G4 giữ nguyên.
  Kiểm model không thay choreography, thoại, nguồn cảm xúc hoặc art approval.

- **D018 — Kiểm lại candidate PR-04 trên `764dc8a` (12/11/2026).** Chạy lại nhóm ki
  release trên checkout sạch `764dc8a` và đối chiếu candidate `e5bf8b4d1450`: greybox
  web/ngoại tuyến cho kết quả tương đương (8 lượt, 0 lỗi hình học/camera, tập support
  trùng từng id, lifecycle WebGL giống), `test:graphics` và `test:backend` đạt, build
  cho revision `469e18d00673` đúng revision đã commit. Đồng thời xác nhận phần render
  mới của commit (batching tĩnh trong `witness-architecture.js`) làm
  `test:architecture-browser` đỏ: cổng đo AABB theo mesh nên gộp mesh theo vật liệu
  biến thành va chạm thân giả ở mái; candidate PR-04 trước batching vẫn pass cùng
  máy cùng ngày. Không sửa cổng ki để né, không hạ điều kiện kiểm, không sửa collision;
  ghi nhận là hồi quy cần xử lý ở commit sau. Thêm: checkout mới trên Windows không
  build được vì hash guard GI phụ thuộc byte và không có `.gitattributes`; `dist/` đã
  commit chỉ lệch CR-at-EOL so với bản build mới; chuỗi script `npm` bị treo trên máy
  kiểm nên kết quả được lấy bằng cách chạy từng file script. Bằng chứng gắn SHA ở
  `docs/environment-kit/validation/q01-pr04-764dc8a/`. Chưa push/deploy, chưa duyệt
  G3/G4, chưa có playtest người thật.

- **D019 — Đo va chạm theo thành phần sau batching (PR-04.1A, 12/11/2026).** Batching tĩnh
  trong `witness-architecture.js` gộp mọi mesh theo vật liệu thành một mesh, nên cổng
  `test:architecture-browser` đo một AABB gộp phủ cả kho và báo va chạm thân giả ở mái
  (`q01-batched-q01-b-rubble`, `q01-batched-q01-b-stone`). Sửa: producer `WitnessQ01.batch`
  giữ hộp của từng mesh thành phần trong `userData.batchParts` (không gian của group);
  batching, số draw call và hình học render không đổi. Cổng đo theo các hộp thành phần
  với đúng ngưỡng cũ (thân 0,28 m, dải thân 0,23–1,65 m, camera 0,16 m) và dùng chung
  một phép đo ở `test/q01-geometry-guard.cjs`. Đối chứng: `test/q01-geometry.cjs` chứng minh
  hộp gộp là động giả còn hộp thành phần thì không, và người chơi ở trong một thành phần
  vẫn bị báo; ngay trong scene thật mỗi lượt đi kiểm một va chạm cố ý và một va chạm 6 m.
  Cổng xanh trên chính commit có batching: 7 lượt, 0 lỗi mesh/body/camera/sàn, giữ
  checkpoint mái/bậc và cold HTML chặn HTTP. Không hạ điều kiện kiểm, không sửa collision,
  không đổi schema/ID/canon; art G3/G4 vẫn chưa duyệt, chưa push/deploy. Khoảng cách EOL
  (F02/F03) và treo script npm (F04) vẫn mở cho PR-04.1B và PR-04.1C.

- **D020 — Chuẩn hóa EOL và build tái lập theo byte (PR-04.1B, 12/11/2026).** Hai phát hiện
  của đợt kiểm lại `764dc8a` được xử lý tại nguồn: `core.autocrlf=true` không có
  `.gitattributes` làm checkout Windows đổi byte của file text và phá hash guard của GI
  bake cùng pin của engine build; `dist/` đã commit lệch byte với bản build mới chỉ ở
  CR-at-EOL. Sửa: thêm `.gitattributes` (`* text=auto eol=lf`, nhị phân giữ nguyên byte);
  `tools/bake-q01-gi.cjs` và `tools/environment-kit/build-engine.cjs` so hash trên nội dung
  đã chuẩn hóa EOL nên cổng ki giữ nguyên dưới mọi chính sách checkout; `tools/build.cjs`
  chép và nhúng nguồn text với LF, tính revision trên nội dung đã chuẩn hóa và nhúng asset
  text (giấy phép, manifest nguồn) bằng cùng byte. GI được bake lại bằng quy trình chính
  thức, engine runtime được dựng lại, `dist/` được đóng gói lại. Kiểm: hai checkout sạch
  (LF theo `.gitattributes` và một bản legacy ép CRLF) đều build qua cả 6 bước; sau khi
  bake chính thức, mọi file so sánh có hash giống nhau và cùng revision `d2e18a6b8ffc`
  với bản build trong repo. Không đổi ID/schema/canon, không đổi hình học hay gameplay.
  Phát hiện F04 (chuỗi script `npm` bị treo) được giải quyết ở PR-04.1C.

- **D021 — Chuỗi kiểm tra không treo và cấu hình CI (PR-04.1C, 12/11/2026).** Phát hiện F04
  (chuỗi script `npm` dùng toán tử shell `&&` bị treo trên cmd.exe của máy Windows) được xử lý
  ở tầng công cụ: thêm `tools/run-checks.cjs` điều phối tuần tự từng bước kiểm tra từ tiến trình Node,
  giữ mã exit thực và dừng chuỗi ngay khi có bước thất bại. `package.json` chuyển các script nhóm
  (`test`, `build`, `browser`, `craft-details`, `build:kit`) sang gọi qua runner này. Thiết lập GitHub
  Actions `.github/workflows/ci.yml` kiểm tra hợp đồng, governance, unit, backend, reader export, build,
  output pipeline và nhóm cổng browser trên bộ rasteriser phần mềm SwiftShader (`WITNESS_QA_HARDWARE='0'`),
  kèm job kiểm tra build sạch trên Windows runner; tách cổng kiểm tra hình học nặng của Q01 sang
  `.github/workflows/architecture-gate.yml` chạy theo `workflow_dispatch`. Thêm `test/ci-workflow.cjs`
  kiểm tra tĩnh tính hợp lệ của workflow, cấm nuốt lỗi và bảo đảm mọi lệnh gọi npm/đường dẫn đều tồn tại.
  Đã đăng ký các file mới trong `docs/agent/registry.json`. Không đổi schema, ID, canon hay trạng thái art.

- **D022 — Xác minh candidate cuối trên SHA c93d1a5 (PR-04.1D, 12/11/2026).** Toàn bộ các
  công việc của PR-04.1A, 1B và 1C được gom thành commit candidate duy nhất
  `c93d1a50ecd411e2310cc4cb1aa82d5aed2e168b`. Quy trình xác minh độc lập được thực thi
  bằng cách clone và checkout tách rời sạch từ đúng SHA này sang `local/checkouts/pr04-1d-candidate`,
  liên kết dependencies và chạy toàn bộ ma trận kiểm tra phát hành (unit, governance, backend,
  build, output pipeline và cả ba cổng browser với 1.972 frame kiến trúc, 8 lượt greybox, 4 scene graphics).
  Toàn bộ 9/9 nhóm kiểm tra đều đạt với mã exit 0, build tái lập chuẩn xác revision `d2e18a6b8ffc`.
  Không có bất kỳ lỗi hồi quy nào. Bằng chứng được lưu tại `docs/environment-kit/validation/q01-pr04-1d/verification.json`.
  Không tự duyệt G3/G4, không push hay deploy production.

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

**Kiểm bản bàn giao Q01/D014:** governance đạt, `test:agents` đạt 39 ca và
validator v3 đạt 581 assertions. Đối chiếu biên tập đủ Beat 00–08/tổng 42 phút;
phần Q03/L01 trong 07 được giữ nguyên byte nội dung. Bốn tổ hợp model PR-03
`mechanical/manual × lodging/meal` đều giữ đặt trước ở đêm, chặn execution trước
B06, restore được plan, commit/trừ phí một lần và không cấp evidence/consent.
Đây là kiểm khả năng tương thích của tiến trình hiện hữu với lịch bàn giao;
không chứng minh đã dựng thoại/camera/ánh sáng hoặc 16 tổ hợp gameplay 3D yêu cầu.
Không thay runtime/contract nên không chạy browser nhân vật/GPU như nghiệm thu
cho những cảnh còn chưa triển khai. Bản bàn giao riêng được trích từ nguồn 07,
bộ reader được xuất lại theo producer và kiểm hash/freshness.

**Kiểm hiệu chỉnh D015:** `check:agents`/39 ca `test:agents` đạt; validator giữ
581 assertions; 16 ca `test:q01-state` đạt. Kiểm thêm bốn tổ hợp cứu hộ/sinh hoạt
qua restore từng prefix: `exit` mở đường nhưng chưa sơ tán người, hai tuyến không
trộn bước, chi phí một lần và chưa có evidence/consent. Save giữa `ledger` và
`ledgerSeam` giữ task đã nhận sổ nhưng chưa xác nhận quan sát, không cấp E01.
Đối chiếu đủ chín Beat/tổng đích 42 phút và giữ nguyên phần Q03/L01 trong 07;
không đổi runtime/contract. Choreography/mesh cửa/vật thể trong game và sức nặng
cảm xúc vẫn là yêu cầu dựng/duyệt, không phải kết quả đã được các ca model chứng minh.

**Kiểm PR-04:** candidate cục bộ `e5bf8b4d1450`, đóng gói trong
`local/checkouts/q01-pr04-20261111/dist` để giữ nguyên `dist/` và service worker
đang có của công việc khác. Nguồn runtime candidate được đối chiếu byte với
checkout. `npm test` đạt, gồm 10 ca greybox/17.451 bước controller mô hình;
`test:backend` đạt 28, `test:agents` 39, `test:build-output` 9, contract 581
assertions và GI freshness/self-test đạt. Suite greybox dùng engine thật trên
Chrome/Intel Arc D3D11 ở 1440×900: 8 lượt hai route × hai view × web/HTML mở
lạnh chặn HTTP, 16 tổ hợp ảnh ngày/tối; 13.827 mẫu không lỗi body/support/camera.
Mô phỏng animation 4×, không đo thời lượng chơi hoặc FPS. Bốn vòng mount/dispose
trả allocation WebGL tạm về 0; 8.592 tam giác/77 drawable mesh ở level (không
đồng nhất drawable mesh với tổng draw calls nhiều pass). Bằng chứng/hash/scope
ở `docs/environment-kit/validation/q01-pr04/verification.json`. Đã kiểm góc
khuất Beat 01, đường nhìn Beat 05 và giữ mọi support ID trong whitelist cũ.
Mesh top cap của kho legacy được sửa tại producer, có probe trước/sau và ca
kiểm sát mép 1 mm; không hạ điều kiện kiểm hoặc sửa collision để né mesh.
Thoại/choreography/chốt Beat/camera-sáng theo truyện thuộc PR-05; chưa có
human playtest, chưa duyệt G3/G4, chưa push/deploy. Bản reader được xuất lại
riêng từ nguồn; build/push không được suy thành trạng thái production.

Hồi quy trên cùng build đạt: `test:architecture-browser` 7 tuyến/1.915 mẫu,
0 lỗi mesh/body/camera/sàn, giữ đúng tọa độ khi tải lại mái/bậc và cold HTML;
`test:graphics` đạt các cảnh/mức chất lượng, probe AO và cold standalone;
Phase B `--quick` đạt 20 ảnh tại 5 điểm × hai góc × ngày/tối; `test:kit-lifecycle`
đạt 14 kiểm, gồm 24 lượt đổi full/lite, cache thực và KTX2/Meshopt/WASM ngoại
tuyến. Những kết quả này kiểm tương thích kỹ thuật, không đóng nghiệm thu art.


**Kiểm lại trên checkout sạch `764dc8a` (12/11/2026):** chạy lại nhóm ki của release
trên checkout sạch đúng SHA này rồi so với candidate PR-04. `npm test` đạt 11/11 file
script; `test:backend` 28; `test:build-output` 9; `test:agents` 39; build cho revision
`469e18d00673` đúng revision đã commit. Suite greybox đạt 8/8 lượt web + ngoại tuyến, 0
lỗi hình học/camera, tập support 22 id trùng khớp từng id với PR-04, vị trí ba actor
lệch tối đa 4,2 cm, vòng đời WebGL giống hệt (8.592 tam giác/77 mesh, giải phóng về 0);
`test:graphics` đạt 5/5 với `glError` 0. **Cổng `test:architecture-browser` đỏ:**
batching tĩnh mới trong `witness-architecture.js` gộp mọi mesh theo vật liệu thành một
mesh, cổng đo AABB theo mesh nên báo va chạm thân ở mái (`q01-batched-q01-b-rubble`,
`q01-batched-q01-b-stone`); A/B cùng máy cùng ngày cho thấy candidate PR-04 (chưa có
batching) vẫn pass 7 lượt/1.918 mẫu/0 lỗi. Ba phát hiện còn lại: checkout mới trên
Windows không qua được hash guard GI vì CRLF và không có `.gitattributes`; `dist/` đã
commit lệch byte với bản build mới chỉ ở CR-at-EOL (nội dung giống); chuỗi script
`npm` bị treo trên máy này nên kết quả lấy bằng cách chạy từng file script. Bằng chứng
ở `docs/environment-kit/validation/q01-pr04-764dc8a/`, ảnh/trace/log ở
`outputs/agent-work/verify-764dc8a-20261112/`. Không có playtest người thật, không
duyệt G3/G4, không push/deploy; commit này chưa đủ điều kiện làm candidate phát hành.

**Kiểm PR-04.1A (sửa đo va chạm sau batching):** cổng `test:architecture-browser` xanh trên
chính commit có batching — 7 lượt (2.966 frame), 0 lỗi mesh/body/camera/sàn, 21–22 support
mỗi lượt, giữ đúng tọa độ khi tải lại mái/bậc, cold HTML chặn HTTP vẫn đi trọn hai góc
camera, vật liệu Q01 nhúng 512 px. Bảy đối chứng trong scene thật (một va chạm cố ý và một
va chạm 6 m cho mỗi lượt) đều đạt, nên phép đo theo thành phần vẫn bắt được va chạm thật.
Đối chứng ở mức producer (`test/q01-geometry.cjs`) chứng minh hộp gộp là động giả. Build
lại cho revision `ffe9f4976a90`; `check:agents` và `test:agents` đạt. Bằng chứng gắn SHA ở
`docs/environment-kit/validation/q01-pr04-1a/verification.json`, ảnh/trace/log ở
`outputs/agent-work/pr04-1a/`. Không có playtest người thật, không duyệt art, không
push/deploy.

**Kiểm PR-04.1B (EOL và build):** thêm `.gitattributes` (text luôn LF, nhị phân giữ
nguyên byte) và chuẩn hóa EOL trong ba hash guard (GI bake, pin engine, revision của
build) cùng trong bản build (chép/nhúng nguồn text và asset text). GI được bake lại và
engine runtime dựng lại bằng quy trình chính thức; `dist/` đóng gói lại, revision
`d2e18a6b8ffc`. Kiểm trên hai checkout sạch dựng từ cây có thay đổi: bản LF theo
`.gitattributes` và bản legacy ép toàn bộ file text thành CRLF — cả hai đều qua đủ 6 bước
build (GI check, engine, architecture, kit budget, build, build cloud) với mã exit 0;
sau khi bake chính thức chạy trong bản legacy, tám file so sánh (GI asset, build-info,
witness-q01.js, witness-sw.js, index.html, standalone, greybox offline) có hash giống
nhau và cùng revision với bản build trong repo. Bằng chứng ở
`outputs/agent-work/pr04-1a/pr04-1b-fresh-summary.json` và
`outputs/agent-work/pr04-1a/pr04-1b-reproducible.json`. Không có playtest người thật,
không duyệt art, không push/deploy.

**Kiểm PR-04.1C (quy trình npm và CI):** `npm test` chạy trọn vẹn 13 nhóm kiểm tra qua
`tools/run-checks.cjs` mà không bị treo hay cần can thiệp thủ công (toàn bộ 13 bước PASS, exit 0);
`test/ci-workflow.cjs` xác nhận 2 workflow, 23 bước kiểm, đủ 9 script bắt buộc và 3 bước software
rendering. Governance `check:agents` và `test:agents` đạt 39/39 ca kiểm; `test:backend` đạt 28/28 ca.
Cấu hình CI sẵn sàng chạy ổn định trên hạ tầng GitHub Actions.

**Kiểm PR-04.1D (xác minh candidate cuối trên SHA c93d1a5):** clone và checkout sạch
tách rời từ đúng SHA `c93d1a50ecd411e2310cc4cb1aa82d5aed2e168b` sang thư mục riêng,
chạy trọn vẹn 9/9 bước kiểm tra ma trận phát hành với mã exit 0: `npm test` (29,6 s),
`test:agents` (18,1 s, 39 ca), `test:backend` (8,5 s, 28 ca), `check:agents` (1,2 s, 0 lỗi/cảnh báo),
`build` (7,3 s, tái lập đúng revision `d2e18a6b8ffc`), `test:build-output` (0,7 s),
`test:architecture-browser` (237,8 s, 7 lượt/1.972 frame, 0 va chạm, 15 kiểm tra, 7 đối chứng va chạm cố ý,
cold standalone chặn HTTP đạt), `test:graphics` (394,4 s, 4 scene, glError null) và
`test:q01-greybox-browser` (713,9 s, 8 lượt web + offline, vòng đời WebGL giải phóng sạch về 0).
Không có hồi quy; SHA và revision được ghi nhận vào `docs/environment-kit/validation/q01-pr04-1d/verification.json`.
Working tree sạch, không push/deploy, giữ nguyên trạng thái G3/G4 (`awaiting_visual_review` / `in_progress`).

**Giới hạn checkout tại lúc bàn giao:** sau khi candidate đã kiểm xong, có
thay đổi render đồng thời trong `witness-architecture.js` (thêm batch ở
`install`), `witness-q01.js`, `witness-world.js`, `vendor/adventure-visuals.js`
và `vendor/witness-graphics.js`. Chúng được giữ nguyên, không ghi đè bằng
candidate. Prefix physics/blueprint của architecture vẫn giống bản đã kiểm;
báo cáo và hồi quy ở trên chứng nhận **gói e5bf8b4d1450**, không tự chứng nhận
các chỉnh render mới này. Bản mở chơi/HTML bàn giao lấy từ gói cố định đó.
