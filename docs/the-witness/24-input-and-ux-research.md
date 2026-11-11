# 24 — Nghiên cứu điều khiển và trải nghiệm người dùng

**Phạm vi:** bản dựng trình duyệt của *Chứng Nhân — Di Sản Giao Ước* (the-witness v0.1.0).
**Mục đích:** nghiên cứu cách các game nhập vai thám hiểm có NPC (adventure / exploration RPG) thiết kế
điều khiển và cơ chế chơi trên **máy tính** và **điện thoại**, đối chiếu với bản dựng hiện tại, rồi
sửa những chỗ lệch khỏi hồ sơ thiết kế v2.0.

Tài liệu này là hồ sơ đối chiếu, không phải chứng nhận. Mọi kết luận "đã đạt" dưới đây đều cần
thử người chơi theo cỡ mẫu trước khi khóa (xem [ENGINEERING](../ENGINEERING.md) và [19-depth-playtest.md](19-depth-playtest.md)).

---

## 1. Bối cảnh: hồ sơ thiết kế đã yêu cầu những gì?

Hồ sơ thiết kế v2.0 đã yêu cầu trước các tính năng mà bản dựng 0.1.0 **chưa có**:

| Yêu cầu trong hồ sơ | Nguồn | Trạng thái ở 0.1.0 (trước đợt tối ưu) |
|---|---|---|
| `remap` — đổi gán phím | `01-vision-research.md` §3, `02-GDD` §10 | ❌ Phím cứng trong code |
| `hold/toggle` — giữ hoặc bật/tắt | `02-GDD` §10 | ❌ Chỉ "giữ" |
| `chỉnh camera` — điều chỉnh độ nhạy, đảo trục | `02-GDD` §10 | ❌ Không có |
| Phụ đề đổi cỡ và nền, tên người nói | `02-GDD` §10 | ❌ Chỉ dòng phụ đề trung tính |
| Gợi ý 3 cấp | `02-GDD` §10 | ❌ Nút "gợi ý" lộ ngay đáp án |
| Nút riêng để hủy và lùi | `02-GDD` §3 | ❌ Chỉ Escape |
| Tay cầm: cần trái đi, cần phải nhìn, cò trái phòng thủ, cò phải đánh có lực, đổi gán được | `02-GDD` §3 | ⚠️ Thiếu cò trái/cò phải, cần phải chỉ xoay ngang, không đổi gán |
| Bàn phím/chuột và tay cầm là mục tiêu ban đầu; điện thoại giữ vai trò prototype | `02-GDD` §1 | ⚠️ Điện thoại có cảm ứng nhưng thiếu nhiều thứ cơ bản |

**Kết luận quan trọng:** phần lớn việc tối ưu không phải là thêm tính năng mới theo ý riêng, mà là
**hiện thực hoá các yêu cầu đã có sẵn trong hồ sơ thiết kế**. Đây là cơ sở để ưu tiên.

---

## 2. Nghiên cứu đối chiếu: các mẫu thiết kế phổ biến

### 2.1 Di chuyển tương đối camera (camera-relative)

Quy tắc nhất quán trong mọi hướng dẫn về third-person controller: **WASD phải di chuyển theo hướng
camera đang nhìn, không theo trục thế giới**. Nếu không, người chơi bấm "tiến" mà nhân vật chạy về
hướng bất ngờ.

> "For ALL third-person games, WASD MUST move the player relative to the CAMERA direction, NOT world
> axes. When the camera faces east, pressing W should move the player east." — build-game skill guide

> "The classic bug: forward is world `-Z`, not where the camera looks. … Multiply the input by a basis
> to make it relative." — Swallowtail, *3D character controllers*

> "Ground movement is camera-relative, so pressing W means 'move where the camera is looking'."
> — Roblox dev community post về custom third-person camera

**Đối chiếu bản dựng:** engine đã quay vector đầu vào theo yaw camera (`Q=()=>[U[0]*cos(G)-U[1]*sin(G), …]`).
→ **Đã đúng, giữ nguyên.**

### 2.2 Camera phải phục vụ việc khám phá, không biến thành trò chơi của riêng nó

> "The best approach would be to make the camera support exploration, traversal, combat, lock-on and
> boss fights — without becoming the boss fight itself." — Roblox camera stack write-up

**Đối chiếu:** bản dựng có kéo chuột để nhìn, Q/R xoay, C đặt lại góc — đúng hướng. Nhưng thiếu
**chỉ báo mục tiêu ngoài màn hình**; người chơi phải quay đầu tìm.

### 2.3 Điều khiển gián tiếp (click-to-move) vs trực tiếp

Gamedev phân tích lỗi của point-and-click:

> "People complained about adventure characters moving too slowly. … You have to wait for interactions
> because the player character first needs to walk to the interaction point. … The control scheme takes
> control out of the player's hands." → "**Takeaway #6: Speed up your characters, think about direct controls.**"
> — *Flaws Of An Undead Genre*

> "The player then doesn't have to click on the character, then click on the place where the character
> should go, and then click on the object they want to interact with. … Instead, the player clicks on
> the object, and the character walks over there." — *Shaping Player experience in adventure Games*

**Đối chiếu bản dựng:** có **hai** mô hình cùng lúc nhưng thiếu nhất quán:
- Bấm chuột xuống **nền đất** → engine tự tìm đường đi tới điểm bấm (đã có, tốt).
- Bấm vào **marker** ở xa → **không làm gì** (engine chỉ gọi `select` khi đã ở trong tầm).

Một nút "E" xa mục tiêu thì lại tự đi tới. → **Cùng một ý định, hai hành vi khác nhau.** Đây là điểm
cần sửa: bấm marker xa phải đi tới rồi tương tác, giống bấm nền đất.

### 2.4 Cảm ứng: "play area is the controller"

> "The game that feels great there is the one where the thumb rests **on the play area itself** and
> swipes, holds and pulls, with nothing to hunt for." — Vibes DIY Reference, *Touch games*

> "If your control scheme needs a virtual joystick, make it **float** and reposition to wherever the
> player's thumb first touches down, rather than fixing it to one exact spot — a fixed-position joystick
> assumes the player's thumb lands in exactly the right place every time, which it won't."
> — Kovo, *Designing Touch Controls for Mobile HTML5 Games*

Cùng nguồn, tham số cụ thể đáng dùng:

| Tham số | Giá trị khuyến nghị |
|---|---|
| Dead zone | ~8 px (chống trôi khi ngón đặt yên) |
| Full speed | ~60 px (một bề ngón tay) |
| Leash | ~74 px (tâm cần đi theo ngón khi kéo quá xa) |
| Curve | ~1.35 (kiểm soát tinh vi gần tâm) |
| Kích thước joystick | 11.9–14.6 mm theo nghiên cứu Taobao/UED |
| Vùng thoải mái ngón cái | bán kính 27.5–41.3 mm; vùng phụ 13.8–27.5 mm |

> "Do not create a separate mobile movement system. Touch, keyboard and gamepad should all set the same
> `keys` or `input` state. Then gameplay code does not care where the input came from." — Supagames,
> *Mobile-First Layout for JavaScript Browser Games*

**Đối chiếu bản dựng:**
- Cần nổi **đã** float theo điểm chạm ✓ — nhưng **không có dead zone**, **không có leash**, **không có curve**.
  Ngón đặt yên sẽ khiến nhân vật trôi.
- Touch **ghi đè hoàn toàn** bàn phím (`if(touch){x=touch.dx/48;…}`), phá vỡ nguyên tắc "một đường input".
- Chạy (sprint) chỉ khi stick vẹn tới gần hết (`n>.95`), gần như không làm được.

### 2.5 Chạy: toggle thay vì giữ

Xbox Accessibility Guidelines:

> "For game controls that must typically be held down for longer periods of time like accelerating,
> sprinting, firing a weapon, repetitive jumping, etc., consider allowing players to **toggle** this
> action on permanently."

> "In Call of Duty: Mobile, players can enable options like '**always sprint**', to decrease the number
> of controls needed to play the game."

> "…players should be given the option to **remap all of the controls** … and the ability to **invert
> both the x-axis and y-axis** individually for each control stick … An option to **adjust sensitivity**
> of analog controls individually should be provided at the game level."

**Đối chiếu:** game hiện chỉ có Shift-giữ. Không có toggle, không có remap, không có đảo trục, không có
chỉnh độ nhạy. → Đây là 4 mục thiếu rõ ràng.

### 2.6 Kích thước vùng chạm & không đòi nhiều thao tác nhanh

> "Interactive touch targets should be meaningfully larger than their visual size implies — pad the
> tappable area beyond the visible icon or button edge."

> "Avoid introducing mechanics where a player is required to repeat or execute multiple keystrokes or
> button presses within a short period of time (like **quick-time events**)."

**Đối chiếu:** game đã tránh QTE và mash ✓ (đúng tinh thần hồ sơ: "thay mash bằng giữ"). Nút cảm ứng
hiện 42 px — nên nâng lên ~48 px cho vùng chạm thực tế.

### 2.7 Chơi bằng tay cầm: bố cục chuẩn

GDD §3 đã chốt: *cần trái di chuyển, cần phải nhìn, cò trái phòng thủ, cò phải đánh có lực, nút mặt cho
tương tác/né/đánh nhanh; toàn bộ được đổi gán.*

Mapping chuẩn Gamepad API (button index): 0 A · 1 B · 2 X · 3 Y · 4 LB · 5 RB · 6 LT · 7 RT ·
8 Back · 9 Start · 10 L3 · 11 R3 · 12 D-Pad lên · 13 D-Pad xuống · 14 D-Pad trái · 15 D-Pad phải.

**Đối chiếu bản dựng:** đang dùng `axes[2]` cho xoay ngang (cần phải X), **không dùng cần phải Y cho
nhìn dọc**, không dùng LT/RT, X đang bị dùng cho đánh trong khi Y đã dùng cho sổ → **xung đột vai trò**.
→ Cần bảng gán lại theo GDD và cho người chơi đổi.

**Hạn chế kỹ thuật đã xác minh:** engine đóng gói (`vendor/adventure-3d.js`) chỉ xuất `rotate(B)` cho
**yaw**; **không có API pitch**. Theo quy tắc dự án ("file vendor được sao riêng… không sửa bundle gốc"),
mình **không sửa file vendor**. Hệ quả: cần phải Y không có đường gọi trực tiếp. Xem §3.4 để biết
cách đã xử lý.

### 2.8 Subtitle và hội thoại

`02-GDD` §10: *phụ đề đổi cỡ và nền, tên người nói, phụ đề âm thanh thiết yếu*; §10 nói rõ HUD mặc
định chỉ có mục tiêu ngắn, sức bền khi dùng, prompt và phản hồi nguy hiểm.

**Đối chiếu:** hội thoại nằm trong `dialog` modal với tên người nói, nhưng **không có phụ đề**; và
không có lịch sử để xem lại hội thoại (GDD: "xem lại hội thoại").

---

## 3. Những phát hiện riêng về bản dựng (đọc code, không phải suy đoán)

Đây là các lỗi/khoảng trống phát hiện khi đọc `witness-app.js`, `witness-world.js`,
`vendor/adventure-3d.js`:

| # | Vấn đề | Vị trí | Tác động |
|---|---|---|---|
| E1 | Engine gửi `arrow` (góc tương đối của mục tiêu so với camera) trong `status` nhưng app **không dùng** | `witness-app.js:38` `onStatus` | Mất hoàn toàn chỉ báo mục tiêu ngoài màn hình |
| E2 | Engine có `sense()` (nhận ra vật gần, hiện marker ở khoảng cách 20m trong 6s) nhưng app **không bao giờ gọi** | `vendor/adventure-3d.js` `vi()` | Mất cơ chế "cảm nhận" đặc trưng dạng khám phá |
| E3 | Engine gửi `walking` và `guide` trong `status` nhưng app tự đặt cờ `walking` riêng → **kẹt cờ "Đang đi tới…"** khi người chơi hủy đi bộ bằng phím | `witness-app.js:39,97` | HUD hiển thị sai trạng thái |
| E4 | Marker ở xa không phản ứng khi bấm | engine `Et()` | Trái với kỳ vọng click-to-move |
| E5 | `onStatus` chạy **mỗi khung hình** và ghi DOM liên tục, kể cả `innerHTML` của `#companion-hud` | `witness-app.js:38-44` | Rớt khung hình trên điện thoại |
| E6 | Cần cảm ứng không có dead zone / curve / leash; chạy chỉ khi vẹn cần | `witness-world.js:115-117` | Trôi khi ngón đặt yên; gần như không chạy được |
| E7 | Touch ghi đè bàn phím thay vì dùng chung trạng thái input | `witness-world.js:109` | Vi phạm nguyên tắc một đường input |
| E8 | `document.pointerup` bất kỳ nào cũng thả trạng thái đỡ | `witness-app.js:141` | Đỡ bị hụt ngoài ý muốn |
| E9 | Settings có `guide` và `comfort` nhưng **không nơi nào dùng** | `witness-model.js:13` | Tùy chỉnh giả |
| E10 | `recenter()` của engine reset cả **zoom** về 7.7 | `vendor/adventure-3d.js` | Người chơi đang zoom thì bị giật mình |
| E11 | Không có nút "hủy/lùi" riêng trên cảm ứng lẫn tay cầm | `index.html` | Cảm ứng không thoát được khỏi hộp thoại nhiều tầng |
| E12 | Gợi ý puzzle lộ ngay toàn bộ đáp án | `witness-app.js:129` | Trái "gợi ý 3 cấp" của GDD |

---

## 4. Bản đồ thay đổi đã thực hiện

### 4.1 Lớp input thống nhất — `witness-input.js` (mới)

Nguyên tắc: **hành động, không phải phím thô** ("Input actions first (never raw keys)").

- Bảng hành động trung tâm: `forward/back/left/right, interact, journal, map, guide, focus, sense,
  run, guard, strike, dodge, recenter, zoomIn, zoomOut, cancel, pause`.
- Mặc định phím: WASD/↑↓←→, `E` tương tác, `F` chỉ hướng, `Z` nhìn về mục tiêu, `X` nhận ra,
  `J` sổ, `M` bản đồ, `C` đặt lại góc, `Shift` chạy, `H` đỡ, `K` đánh, `Space` né, `Esc` lùi/pause.
- Mặc định tay cầm (đúng GDD §3): A tương tác · B né · X đánh nhanh · Y sổ · LT đỡ · RT đánh có lực ·
  LB nhìn mục tiêu · RB chỉ hướng · Back lùi · Start tạm dừng · L3 chạy · R3 đặt lại góc ·
  D-pad lên nhận ra · D-pad xuống bản đồ · D-pad trái/phải zoom.
- **Remap** được cho mọi hành động (phím và nút tay cầm), lưu trong bản lưu.
- **Hold/toggle** cho `run` và `guard`.
- **Độ nhạy camera** (0.5–1.8) và **đảo trục Y**.
- Touch dùng **cùng một trạng thái input** với bàn phím/tay cầm.

### 4.2 Cảm ứng

- Cần nổi: dead zone 10 px, hết tốc 56 px, leash 78 px, curve 1.35, cân bằng hướng.
- Đổi tay trái/phải trong Tùy chỉnh.
- **Pinch-zoom** hai ngón trên vùng nhìn.
- Cụm nút hành động cảm ứng: Nhìn · Nhận ra · Chạy · Gợi ý · Lùi (kích thước ≥ 48 px).
- Nút "Chạy" là **toggle**, không cần vẹn cần.

### 4.3 Cơ chế chơi

- **La bàn mục tiêu**: dùng `status.arrow` của engine, vẽ mũi tên luôn chỉ về mục tiêu kể cả khi
  mục tiêu ngoài màn hình; kèm khoảng cách.
- **Nhìn về mục tiêu** (`Z`): quay camera + nhân vật ngắm về mục tiêu; tự thả khi người chơi di chuyển
  hoặc kéo camera.
- **Nhận ra** (`X`): dùng `engine.sense()` — làm nổi bật vật gần để tìm đường trong vùng rộng.
- **Marker xa → đi tới rồi tương tác** (đồng nhất với bấm nền đất và với `E`).
- **Gợi ý 3 cấp**: mời → nửa → đầy.
- **Phụ đề**: tên người nói + lời thoại, đổi cỡ (3 mức) và nền (3 mức); lịch sử hội thoại trong sổ.
- **Nút hủy/lùi** riêng trên cảm ứng và tay cầm.

### 4.4 Hiệu năng

- Chỉ ghi DOM khi giá trị thực sự đổi (E5).
- Dùng `status.walking` của engine thay vì cờ riêng (E3).

---

## 5. Những khoảng trống **chưa** giải quyết (nêu rõ, không giấu)

| Mục | Lý do |
|---|---|
| Nhìn dọc bằng cần phải trên tay cầm | Engine đóng gói không có API pitch và quy tắc dự án cấm sửa `vendor/`. Đã giải quyết bằng: cần phải X xoay ngang, R3 đặt lại góc, LB nhìn mục tiêu. Cần nâng cấp engine ở v2. |
| Tắt rung camera / head-bob | Engine không có rung camera và không có head-bob ở bản này; `settings.motion=calm` đã giảm chuyển động chuyển cảnh. |
| Chế độ "thời gian thoải mái" cho sân luyện | Nhịp đối thủ do engine điều khiển (`trial.advance`), không có tham số chậm. Cần thay đổi engine. |
| Remap tay cầm ở mức *cảm ứng* | Đã có remap phím và nút tay cầm; remap cảm ứng chưa làm (ít giá trị khi đã có bố cục cố định + toggle chạy). |
| Lưu lịch sử hội thoại xuyên phiên | Lịch sử hiện chỉ trong phiên; `schema` bản lưu là `1`, không đổi trong đợt này để tránh hỏng bản lưu cũ. |

---

## 6. Nguồn tham khảo

- Xbox Accessibility Guidelines — *107 Guidelines for Mobile Input* (toggle/hold, remap, invert trục, chỉnh độ nhạy, kích thước vùng chạm).
- Supagames — *Mobile-First Layout for JavaScript Browser Games* (một đường input, dead zone, `pointer-events`).
- Kovo — *Designing Touch Controls for Mobile HTML5 Games* (joystick nổi, vùng chạm, không đòi hai ngón chính xác).
- Vibes DIY Reference — *Touch games: the play area is the controller* (dead zone 8 / full 60 / leash 74 / curve 1.35).
- Cursa — *Touch Controls for Mobile Games* (dead zone, clamp, cho phép đổi tay cầm).
- Taobao UED / ACM (SUI ’21) — kích thước joystick 11.9–14.6 mm, vùng thoải mái ngón cái.
- Swallowtail — *3D character controllers* (camera-relative movement, input actions thay vì phím thô).
- build-game skill guide — ma trận camera/controls theo thể loại.
- Gamedeveloper — *Flaws Of An Undead Genre* (điều khiển gián tiếp làm mất quyền kiểm soát).
- *Extending Experiences: Shaping Player experience in adventure Games* (point-and-click, walk-to).
- Zarf — *How to write a touchscreen adventure game* (tap = khảo sát, drag = hành động, hai ngón để nhìn).
- Roblox Dev — *Smooth movement, cinematic camera* (camera phục vụ khám phá, không trở thành trò chơi của riêng nó).

Nguồn nội bộ: `02-game-design-document.md` §1, §3, §10, §11; `01-vision-research.md` §3;
`09-production-technical-plan.md` §6, §10.


## Phụ lục nghiên cứu góc nhìn thứ nhất

> Các thông số bên dưới là đề xuất nghiên cứu tại mốc cũ; cấu hình hiện hành thuộc engine.

### Nghiên cứu góc nhìn thứ nhất từ game 3A nhập vai / thám hiểm / sinh tồn

Tài liệu nền cho chế độ góc nhìn thứ nhất (phím V) của **UNSEALED WITNESS: Legacy of the Covenant**. Ngày nghiên cứu: 2026-11-09. Phạm vi: bài học thiết kế có thể áp dụng ngay cho runtime three.js của dự án, không thay đổi Canon Lock hay cấu trúc chiến dịch.

#### 1. Các game khảo sát và bài học rút ra

| Game | Thể loại | Bài học chính | Ứng dụng vào dự án |
|---|---|---|---|
| **The Elder Scrolls V: Skyrim** | Nhập vai thế giới mở | Chuyển first/third tức thời, giữ nguyên hướng nhìn và hành vi khi đổi góc | Phím V chuyển tức thời; yaw `G` dùng chung cho cả hai góc nên hướng nhìn, la bàn, di chuyển không đổi khi chuyển |
| **Subnautica** | Sinh tồn thám hiểm | Kinh ngạc/sợ hãi đến từ việc tự mắt thấy môi trường ở tầm mắt; UI sinh tồn tối thiểu nhưng đủ thông tin | Góc thứ nhất đặt camera 1,58 m để địa vật, dấu vết, NPC hiện diện ở tầm người thật; giữ HUD hiện có, chỉ thêm chấm tâm nhỏ |
| **The Long Dark** | Sinh tồn | Im lặng và góc nhìn hạn chế khiến người chơi "cảm" nhân vật; không cần nhiều chỉ số | Không thêm HUD mới trong góc thứ nhất; dùng lại phụ đề âm thanh mô tả và chế độ dẫn đường `Đầy đủ / Chỉ mục tiêu / Tắt` |
| **Firewatch** | Thám hiểm tự sự | UI diegetic (bản đồ cầm tay, la bàn, bảng kẹp) thay HUD; mọi thứ trên màn hình phải phục vụ cô độc/khám phá | Sổ tay (J), bản đồ (M), bảng đối chiếu vốn là "vật trong thế giới" của game ta — giữ nguyên, không phủ thêm lớp HUD FPS |
| **The Witness (2016)** | Giải đố quan sát | Giao tiếp phi ngôn từ, người chơi tự học bằng quan sát; màn hình sạch tuyệt đối | Chấm tâm nhỏ 5 px là phần thêm duy nhất; mốc nổi vẫn tắt được bằng `guideMode:'off'` |
| **Kingdom Come: Deliverance** | Nhập vai lịch sử | Chỉ góc thứ nhất để đắm mình thời đại; cộng đồng chuộng HUD tối thiểu | Chế độ thứ nhất là *tùy chọn* đắm mình, không bắt buộc; bối cảnh thế kỷ I hưởng lợi từ tầm mắt thật |
| **Outer Wilds** | Thám hiểm | Tri thức là tiến trình; camera tự do nhìn lên/xuống là bắt buộc để đọc thế giới | Pitch mở rộng −72°…+77° (góc thứ ba cũ chỉ nhìn xuống 12°…47°) để đọc bầu trời, vòm hang, mép nước |

#### 2. Thông số kỹ thuật áp dụng (theo khuyến nghị First-Person 3Cs)

- **FOV dọc 71°** ≈ 103° ngang ở 16:9, nằm trong dải khuyến nghị 85–110° cho PC; góc thứ ba giữ 51°.
- **Tầm mắt 1,58 m** trên mô hình chuẩn hóa 1,7 m (`Yt(object,1.7)` trong engine).
- **Pitch giới hạn −1,25…+1,35 rad** (~−72°…+77°), tránh lật camera ở ±90°.
- **Near clip 0,13** giữ nguyên — đủ gần để không xuyên địa vật khi đứng sát.
- **Không head-bob mặc định**: bob gây say; chỉ bật (biên độ 2,4 cm dọc / 1,2 cm ngang) khi người chơi tắt "Giảm chuyển động". Camera first-person không làm mượt vị trí (`blend=1`) để tránh cảm giác "bơi".
- **Không kéo camera va chạm** ở góc thứ nhất (không còn boom camera); khung inspect/thoại/cinematic vẫn ưu tiên dàn dựng sẵn.

#### 3. Quyết định tương tác

- **Chuột:** bấm vào canvas ở góc thứ nhất → pointer lock kiểu FPS (0,0032 rad/px); vẫn hỗ trợ kéo để nhìn nếu không khóa được. Mở menu/dialog tự thoát pointer lock.
- **Cảm ứng:** nửa phải kéo nhìn như cũ nhưng dấu pitch đảo cho tự nhiên (vuốt lên = ngẩng lên).
- **Tay cầm:** cần phải Y nhìn lên/xuống (mới), nhấn cần phải (R3) đổi góc nhìn.
- **Tương tác E** vốn dựa vào khoảng cách và mốc, không raycast từ camera → hoạt động nguyên vẹn; click-to-walk vẫn raycast từ camera mới.
- **Nhân vật:** ẩn mesh người chơi chỉ trong góc thứ nhất tự do; `Zt()` khôi phục mỗi khung nên thoại/cinematic không bị kẹt ẩn.

#### 4. Nguồn tham khảo

- [First-Person 3Cs: Camera — Playtank](https://playtank.io/2023/05/12/first-person-3cs-camera/) (FOV, pitch, near clip, head-bob)
- [Building Character Feel in a First Person Game — Game Design Framework](https://gamedesignframework.net/building-character-feel-in-a-first-person-game/) (sway/bob truyền trọng lượng)
- [How Firewatch's UI Enhances Player Immersion — Game Developer](https://www.gamedeveloper.com/design/how-firewatch-s-ui-enhances-player-immersion) (UI diegetic)
- [A Look Inside — Evaluating Camera Angles for Immersion — Game Developer](https://www.gamedeveloper.com/design/a-look-inside-evaluating-camera-angles-for-immersion)
- [First Person vs. Third Person Perspective in Digital Games — ResearchGate](https://www.researchgate.net/publication/280112093_First_Person_vs_Third_Person_Perspective_in_Digital_Games_Do_Player_Preferences_Affect_Immersion)
- [Narrative Design and Emotional Immersion in Subnautica — Medium](https://medium.com/@tht13/beneath-the-surface-narrative-design-and-emotional-immersion-in-subnautica-e314f958a997)
- [The Long Dark Review — Corrosion Hour](https://www.corrosionhour.com/the-long-dark-review/)
- [The Witness (2016) — Wikipedia](https://en.wikipedia.org/wiki/The_Witness_(2016_video_game)) (giao tiếp phi ngôn từ)
- [The Witness: First Impressions — Chordian](https://blog.chordian.net/2016/07/04/the-witness-first-impressions/)
- [Creating Clean & Minimal HUD and Map Mod for KCD — The Art of Dev](https://theartofdev.com/2025/06/12/kcd-clean-minimal-hud-mod/)
- [Playing without HUD is so much more immersive — Steam KCD](https://steamcommunity.com/app/379430/discussions/0/1696040635911601429/?l=french)

#### 5. Phạm vi chưa làm (gợi ý cho bản sau)

- Viewmodel tay/dụng cụ cầm tay khi thao tác hiện trường (cần asset riêng).
- Bản đồ cầm tay diegetic trong thế giới 3D thay bản đồ toàn màn hình (theo Firewatch).
- Điều chỉnh FOV tùy ý trong tùy chỉnh; vignette khi chạy.
- Kiểm chứng playtest người thật về say camera theo protocol 12 người hiện có.

---

## 7. Nghiên cứu Góc máy Cận cảnh Xúc giác (Tactile Diorama) & Bàn Đối chiếu Thực thể 3D

### 7.1 "Góc máy Cận cảnh Xúc giác" (Tactile Diorama Inspector) cho 25 Bàn Thao Tác

Để thu hẹp khoảng cách giữa runtime 0.4.0 và kịch bản v6.0 mà không làm bùng nổ ngân sách lập trình vật lý (soft-body ropes, real-time fluid dynamics):
1. **Thiết kế chuyển tiếp Camera (Smooth Dolly-in):** Khi tương tác với địa vật (xe tải, ròng rọc, cọc neo, bàn giấy), camera tự động trượt mượt mà từ góc nhìn thứ ba/thứ nhất vào góc cận cảnh (tọa độ focus cách cụm cơ cấu 0.8m – 1.2m, FOV hạ từ 45 xuống 30 để tạo độ phẳng điện ảnh và tập trung thị giác).
2. **Tương tác 3D cục bộ (Diorama Interaction):** Lấy cảm hứng từ *The Room* và *Sherlock Holmes*, người chơi không điều khiển toàn thân nhân vật mà điều khiển bàn tay/con trỏ trực tiếp trên cụm chi tiết 3D: xoay góc nhìn cục bộ quanh trục xe, kéo nêm gỗ chèn vào bánh, luồn dây qua khe ròng rọc, tách mép giấy da cạo mực.
3. **Thiết kế âm thanh vi mô (Micro-tactile Audio Palette):** Âm thanh đóng vai trò 50% cảm giác xúc giác (tactile feedback). Sử dụng thư viện âm thanh foley cận cảnh:
   - `mud-squelch`: tiếng bùn nhão hút dính bánh xe khi nâng kích.
   - `rope-friction`: tiếng sợi thừng gai cọ xát ken két trên rãnh gỗ khô.
   - `wood-creak`: tiếng gỗ sồi rạn nứt dưới tải trọng tăng dần.
   - `parchment-rustle`: tiếng sột soạt của thớ giấy da cổ khi lật hoặc miết nhẹ.
4. **Cinematic Kết quả (Result Playback):** Sau khi hoàn tất thao tác logic, kích hoạt đoạn hoạt cảnh ngắn 2–3 giây toàn cảnh xác nhận kết quả (bánh xe lăn êm qua bùn, cổng hạ chốt, kiện hàng phân tải), sau đó camera trả mượt về góc nhìn tự do.

### 7.2 Trực quan hóa Sổ tay Đối chiếu thành Bàn Làm Việc Thực Thể 3D (In-World Desk)

Thay thế UI menu 2D bảng 3 cột phẳng ngắt quãng cảm xúc bằng không gian làm việc thực thể trong thế giới:
1. **Tại các Hub an toàn (Xưởng Natan, Quán trọ Q01, Phòng J3 Giêrusalem):**
   - Người chơi bước tới bàn làm việc và kích hoạt tương tác.
   - Camera hạ xuống mặt bàn gỗ thực thể dưới ánh đèn dầu ấm áp.
   - Các vật chứng E01–E12 hiển thị dưới dạng vật thể 3D có thể cầm nắm: cuộn giấy da cuộn tròn, thẻ kho đất sét nung, mẩu sáp niêm vỡ, sợi thừng gai.
   - Cơ chế nối liên kết: Người chơi dùng que than hoặc dây chỉ đỏ kéo nối giữa hai vật thể độc lập để hình thành mệnh đề (Claims P01–P05).
2. **Ngoài hiện trường (Field Exploration):**
   - Khi chưa về Hub, người chơi mở sổ tay bằng cách hiển thị cuốn sổ da bỏ túi (*Pocket Leather Ledger*) được cầm trực tiếp trên tay nhân vật theo góc nhìn thứ nhất, lật từng trang ghi chép nhanh mà không che kín màn hình hay dừng thời gian của thế giới.
