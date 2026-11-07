# 14 — Nghiên cứu điều khiển và trải nghiệm người dùng

**Phạm vi:** bản dựng trình duyệt của *Chứng Nhân — Di Sản Giao Ước* (the-witness v0.1.0).
**Mục đích:** nghiên cứu cách các game nhập vai thám hiểm có NPC (adventure / exploration RPG) thiết kế
điều khiển và cơ chế chơi trên **máy tính** và **điện thoại**, đối chiếu với bản dựng hiện tại, rồi
sửa những chỗ lệch khỏi hồ sơ thiết kế v2.0.

Tài liệu này là hồ sơ đối chiếu, không phải chứng nhận. Mọi kết luận "đã đạt" dưới đây đều cần
thử người chơi theo cỡ mẫu trước khi khóa (xem `09-production-technical-plan.md` §6).

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
