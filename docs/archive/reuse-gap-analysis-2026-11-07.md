# Nghiên cứu tái dụng — từ *Hành Trình Lời Chúa* sang *The Witness*

> **LƯU TRỮ — phân tích tại mốc 07/11/2026.** Không dùng các kết luận về thiếu
> test, API chưa được dùng, số dòng hoặc kế hoạch port trong file này làm trạng
> thái hiện tại. Repository đã phát triển tiếp. Nguồn hiện hành ở
> `docs/agent/README.md`; cần kiểm mã trước khi tái sử dụng một nhận định cũ.


Ngày: 07/11/2026 · Phạm vi: hai project đã tách ở `C:\hanh-trinh-loi-chua\`
`hanh-trinh-loi-chua\` = game *Hành Trình Lời Chúa* (gọi tắt **HTLC**)
`the-witness\` = game *Chứng Nhân — Di Sản Giao Ước* (gọi tắt **WIT**)

Mọi khẳng định trong tài liệu này đều kèm `file:dòng`. Những mục chưa xác nhận được đánh dấu rõ.

---

## 0. Kết luận nhanh

Hai game **không phải là hai sản phẩm độc lập** — chúng dùng chung một engine 3D, một bộ nhân vật, một hệ hình ảnh. Kết quả là:

> **~80% giá trị tái dụng nằm ở tầng *game-level*, không nằm ở tầng kỹ thuật.**
> Engine đã có sẵn gần như mọi thứ Witness còn thiếu; vấn đề là Witness **chưa gọi** các API đó.

Ba phát hiện lớn nhất:

1. **Hệ thống "echo"** của HTLC (**30 quy tắc khai báo, trải trên 14 chặng đích**) cho phép lựa chọn ở chặng này **sinh vật thể vật lý** ở chặng sau. WIT chỉ có `M.callbacks()` trả về **chuỗi văn bản**, dựng thành tối đa 5 chiếc bình giống hệt nhau (`witness-world.js:104`). Đây là mất mát chất lượng lớn nhất.
2. **Bộ test 43 mục của HTLC** (`test/run.js`) test đúng những gì Witness đang dùng: engine 3D dùng chung, pipeline nhân vật, hệ điều khiển. Witness có 37 test nhưng **gần như toàn bộ ở tầng model**, không test engine, không test input, không test hình ảnh.
3. **`water-case.js` của HTLC** là một *case điều tra* hoàn chỉnh (bằng chứng dạng bitmask → giả thuyết → lựa chọn → lời khai thay đổi theo trạng thái). Đúng là cơ chế "đọc dấu vết → diễn giải" mà hồ sơ thiết kế Witness hứa nhưng chưa có — và hiện file này **có 0 kiểm thử**, kể cả ở phía HTLC.
4. **`expedition-controls.js`** của HTLC là một **bản nâng cấp sẵn có** cho lớp điều khiển đang nằm gọn trong `witness-world.js:114-128` (chỉ 13 dòng, danh sách phím viết cứng, không lưu cài đặt, không pinch-zoom, không D-pad, không haptic). Bản HTLC gộp bàn phím + cảm ứng + tay cầm thành một vector, có dead-zone, và **8/43 mục kiểm thử của cả dự án dành riêng cho file này**.

---

## 1. Hai game đã chia sẻ gì (nền tảng để tái dụng)

### 1.1 File dùng chung

Đối chiếu SHA-256 sau khi tách:

| Nhóm | Số | Trạng thái |
|---|---|---|
| `vendor/*.js` (trừ `adventure-3d.js`) + `assets/*` | 19 | **byte-identical** |
| `campaign-contract.json`, `design-contract.json` | 2 | **byte-identical** |
| `vendor/adventure-3d.js` | 1 | **đã phân kỳ có chủ đích** |

`vendor/adventure-3d.js` của WIT đã có patch `n.clearLegacyProps?[]:` (`vendor/adventure-3d.js:4243`) do `witness-world.js:20` yêu cầu (mặt đất phẳng + dọn vật cũ cho cảnh Legends). Bản HTLC giữ nguyên bản gốc.

> ⚠ **Không được** viết script đồng bộ vendor một cách máy móc — sẽ xoá mất patch này và làm hỏng các cảnh Legends.

### 1.2 API dùng chung và mức sử dụng

| Module | API công khai | HTLC dùng | WIT dùng |
|---|---|---|---|
| `adventure-3d.js` (815 KB) | `globalThis.Adventure3D` (`adventure-3d.js:4340`) | `load/layoutFor/expeditionFor/characterViewer` | `layoutFor/load/mount/update` (`witness-app.js:24`, `witness-world.js:20`) |
| `adventure-visuals.js` | `AdventureVisuals{atmosphere,light,sky,ridges,surface,rocks,treeTrunk,canopy,grass,vegetation,water,tent,accessory}` (`adventure-visuals.js:572`) | gọi qua engine: `surface`×4, `vegetation`×4, `grass`×2, `canopy`×2, `treeTrunk`, `rocks`, `tent`, `water`, `ridges`, `light` | chỉ `sky` (`witness-world.js:6-7`) |
| `adventure-character.js` | `AdventureCharacter.create` (`adventure-character.js:1171`) | có | có, bọc lại để đổi ngoại hình theo chương/Legend (`witness-world.js:8-17`) |
| `character-detail.js` | `CharacterDetail{sculpt,expressions,skin,groom,maps,mantle,spring,batchGarments}` (`character-detail.js:520`) | có | gián tiếp |
| `character-profiles.js` | `CharacterProfiles{profiles,eras,get,resolve,version}` (`character-profiles.js:210`) | có | có, tự sinh profile `wt-*` (`witness-world.js:10`) |
| `adventure-cast.js` | `AdventureCast{people,portrait,asset}` (`adventure-cast.js:72`) | có | có |

---

## 2. Bản đồ năng lực: engine đã có gì mà Witness chưa dùng

Đây là bảng trung tâm của nghiên cứu. "Engine có" = đã hiện thực trong `vendor/adventure-3d.js`, có thể gọi ngay.

| Năng lực trong engine | HTLC dùng ở đâu | WIT có dùng không |
|---|---|---|
| **NPC tự tuần tra theo route** (`route` ×16, `work` ×38, `rest` ×60 trong engine) | `water-case.js:135` (`route: person.rounds`), `expedition-companion.js` | ❌ **mọi NPC WIT đều `fixed:true, pose:'idle'`** (`witness-world.js:23,28,34`) |
| **`sense()` — phát hiện vật gần đang chưa đọc** | `story-ui.js:929` | ❌ chưa dùng |
| **`startGuide(target, route[], cb)` — dẫn đường nhiều chặng** | `story-ui.js:752,902` | chỉ dùng cho hộ tống (`witness-app.js:75`); dẫn đường thường dùng `engine.walk` 1 điểm (`witness-app.js:100`) |
| **`cue()` — âm thanh theo loại việc** (`read`/`walk`/`finish`/`impact`) | `story-ui.js:614,678,757,806,846,866,879,902` | chỉ `finish`/`read` (`witness-app.js:73`) |
| **`variants` — vật thể đổi hình theo trạng thái** | `water-case.js:138` (`water-rack-0/1/2`, `water-recovered`) | có nhưng chỉ theo beat, không theo *kết quả lựa chọn* |
| **`solids` — vật cản va chạm** | `water-case.js:141,145` | ❌ chưa dùng |
| **`focus()` / `setRole()`** | — | ❌ chưa dùng |
| `pose()` (talk/tend/idle) | `story-ui.js:718` | có (`witness-app.js:73`) |
| `nearest()` / `within()` / `locate()` | `story-ui.js:935,969` | có (`witness-app.js:53-55`) |
| `toggleSound()` | `story-ui.js` | có (`witness-app.js:24,141`) |

**Nhận xét cốt lõi:** WIT đang dùng khoảng **60%** API của engine. Phần còn lại — đặc biệt là NPC sống động, `sense()`, `variants` theo trạng thái, `solids` — đã được HTLC chứng minh là chạy được và là nơi HTLC "cảm" hơn hẳn WIT.

---

## 2b. Khoảng trống cụ thể của Witness — và cách lấp từ HTLC

Bảng này đối chiếu **hồ sơ thiết kế của chính Witness** (`docs/the-witness/`) với mã hiện tại, rồi chỉ đường lấp.

| # | Khoảng trống của Witness | Bằng chứng | Lấp từ đâu |
|---|---|---|---|
| 1 | **La bàn mục tiêu ngoài màn hình** + trạng thái "đang đi tới" đúng | `witness-app.js:39-45` chỉ đọc `nearest`/`npc`/`combat`; engine **đã xác nhận** có `arrow: _e` (góc tới mục tiêu chính), `walking: U.some(Boolean)||!!C||Qt>0`, `sensed: re?.until>K?re.at:null`, `guide: {step,total,waiting,at}`, `npc[].activity` (`rest`/`walk`/`idle`) trong payload `status`; hồ sơ `14-input-and-ux-research.md:175,177` (E1/E3) | **Không cần mượn** — nối `status.arrow` đã có sẵn. Rẻ nhất trong danh sách |
| 2 | **"Nhận ra" bằng `engine.sense()`** — làm nổi bật vật gần để đọc đường | engine có `sense()` + `status.sensed`; **đã xác nhận** engine còn tự bật/tắt class `is-sensed` trên marker 3D — nhưng `witness.css` chưa style class này; hồ sơ `14-input-and-ux-research.md:176,222`; `04-world-bible.md:59` | **Không cần mượn** — nối API có sẵn + thêm CSS `.is-sensed` |
| 3 | **Lớp input thống nhất**: remap, hold/toggle, đảo trục, độ nhạy, dead-zone/leash/curve | `witness-world.js:118` touch **ghi đè hoàn toàn** bàn phím; `:125` joystick không dead-zone; `:120` sprint chỉ khi đang vịn cần; **`witness-input.js` mà hồ sơ `:192-206` mô tả là không tồn tại**, `index.html` không load | `expedition-controls.js`: `sprintToggle` (`:27`), `radialDeadZone` (`:72`), `state.runToggle` (`:149,212,328`), gamepad mapping (`:301-320`) |
| 4 | **NPC tự tuần tra** | `witness-world.js:23,28,34` — mọi NPC `fixed:true`, không `route`; engine đọc `route`/`waypoint`/`rest` và trả `status.npc[].activity` | `expedition-plan.js:10-13` bảng `roaming` + `loop()` tạo route 3 điểm (`:15`) + cách gán `route`/`fixed` (`:75,:93`) |
| 5 | **Sổ điều tra 3 thao tác**: chọn claim → đặt nguồn cạnh nhau → chọn phát biểu đúng phạm vi | `witness-app.js:113` chỉ **render read-only**; hồ sơ `02-game-design-document.md:102,104`; `12-continuity-and-state.md:48` | Dựng trên `witness-model.js:156-161` (`hasClaim`/`allowedClaims`) đã có sẵn + mẫu `water-case.js` |
| 6 | **Hội thoại nhiều lượt, banter có điều kiện, `knownBy[actor]`, arc 2 hành động + callback** | mọi tương tác NPC là `show()` + nút (`witness-app.js:61-62`); hồ sơ `05-character-bible.md:99,111`; `12-continuity-and-state.md:56` | `expedition-companion.js` (schema `trait/stake/ask/options/mark/outcome/farewell/recall`) + `expedition-bond.js` (`trust/marks/met/choices`) |
| 7 | **Phụ đề + lịch sử hội thoại**; 3 stem âm thanh; leitmotif; cue có caption | chỉ 4 tone blip + noise nền (`witness-app.js:73`); hồ sơ `02:82`, `04-world-bible.md:69,71`, `15-source-world-packets.md:59` | `story-ui.js` (lớp thoại) + `adventure-rpg.css` — nhưng **CSS phải viết lại** |
| 8 | **Hệ quả 2 tầng**; cờ `disclosedWithoutConsent`, `harm.rashAccusation` | hồ sơ `02:66`, `11-chapter-dossiers.md:29,65`, `12-continuity-and-state.md:66` | Pattern nhánh của `expedition-branch.js` (46 KB) |
| 9 | **Vòng kế hoạch 7 trạng thái** (`available→proposed→prepared→executing→completed→committed`) | `witness-model.js:26,112` chỉ có `q.plan` + `q.done`; hồ sơ `12-continuity-and-state.md:90` | State machine kế hoạch của `expedition-plan.js` |
| 10 | **Năng lực 4×3 bậc + 6 ô đồ dùng** | `witness-model.js:14` `resources` chỉ money/food/tools; hồ sơ `02:54,58` | `expedition-field.js` (inventory) |

### 2b.1 Những thứ **không mượn được** — phải cắt phạm vi

- **Thời lượng 216/720 phút** (`02-game-design-document.md:132-144`, `campaign-contract.json` `timeBudget.requiredLegendMinutes=216`) là khoảng trống lớn nhất nhưng **không mượn từ game khác được**. `09-production-technical-plan.md:85` yêu cầu **cắt L03/L05/Veil/cinematic kho trước**, tức phải *giảm phạm vi* chứ không bù bằng code.
- **Camera pitch**: cả hai bản engine đều `rotate(B){G+=B}` — chỉ yaw, **không có API pitch**. Vì vậy "cúi / bám mép" của GDD:21 không làm được với engine hiện tại.
- **Chiến đấu trong cốt truyện** (né/đỡ/đẩy/đánh có lực/rút lui, 3 archetype, sức bền 100/20/15/25/15): engine **đã có** `action('strike'/'dodge'/'guard')` + `startTrial`, nhưng ngân sách lớn và cần `adventure-rpg.css` cho HUD combat.

### 2b.2 Lỗi kỹ thuật phát hiện trong Witness (cần sửa, không phải mượn)

| Lỗi | Bằng chứng | Mức |
|---|---|---|
| **`engine.pose('listen')` là no-op** — engine nhận dạng `talk/seated-talk/offer/gesture`, `kneel/prayer`, `seated*`; `'listen'` không có → rơi về idle, "pose lắng nghe" không chạy | `witness-app.js:73` | Cao — người chơi không thấy NPC phản ứng |
| **Gợi ý lộ toàn bộ đáp án** (3 bước điền sẵn; `legend-order-hint` tương tự) — vi phạm yêu cầu "gợi ý 3 cấp: mời → nửa → đầy" | `witness-app.js:81,136,145` vs `14-input-and-ux-research.md:186,224` | Cao |
| **`onStatus` chạy mỗi khung hình và ghi `innerHTML` `#companion-hud`** — vi phạm "chỉ ghi DOM khi giá trị thực sự đổi" | `witness-app.js:43` vs `14-input-and-ux-research.md:230` | TB (hiệu năng) |
| **App tự đặt cờ `walking`** thay vì dùng `status.walking` của engine | `witness-app.js:4,42` vs `14-input-and-ux-research.md:177` | TB |
| **`npm test` không chạy 3 test browser** (`browser.mjs`, `spine-browser.mjs`, `scene.mjs` không nằm trong `package.json:6`) | `package.json:6` | Cao (hồi quy không được bảo vệ) |
| **Không có test tiếng Việt có dấu**: đếm `\u00C0-\u1EF9` → campaign.cjs 0, spine.cjs 10, browser.mjs 4, scene.mjs 0; **không có** test normalize/NFC/charset | `test/*` | Cao cho game tiếng Việt |
| **8 ca kiểm continuity A–H** (`12-continuity-and-state.md:96-112`) và **10 ca ma trận chặn lỗi** (`09:68-79`) chưa chạy | hồ sơ | TB–Cao |
| **Veil V01–V04 là stub** (3 bước, 0 beat, 0 địa vật); **Q12 có 0 task** (chỉ 3 execution route); mỗi Q **thiếu đoạn yên** | `witness-spine.js`, `witness-content.js` | Cao (nội dung) |
| **`settings.guide` / `settings.comfort` khai báo nhưng không nơi nào dùng** | `witness-model.js:14` | Thấp |

---

## 3. NHÓM A — Tái dùng được ngay (chi phí thấp, tác động cao)

### A1. Hệ thống echo: lựa chọn → vật thể vật lý ở chặng sau ⭐ ưu tiên 1

**HTLC** (`expedition-world.js:20`) khai báo **30 quy tắc** trong 14 nhóm theo **chặng đích** (`moses`, `nathan`, `isaiah`, `shepherd`, `andrew`, `mount`, `loaves`, `neighbor`, `supper`, `garden`, `cross`, `magdalene`, `emmaus`, `sent`). Mỗi quy tắc có đủ 7 trường:
```js
{ from:"abram", choice:"ridge",                                   // chặng nguồn + mã lựa chọn
  add:{ variant:"cairn", kind:"prop", anchor:"n0", offset:[2.6,1.5] }, // vật thể 3D + neo + lệch
  name:"Chồng đá trắng",                                           // tên hiển thị
  line:"Trên lối lên núi có một chồng đá ai đó dựng…",             // lời văn đọc được trong thế giới
  note:"Dấu từ chặng Kharan: đã dựng chồng đá trắng…" }            // ghi chú trong sổ
```
Cơ chế đọc (`expedition-world.js:296-312`):
```js
function forChapter(bond, chapterId){
  const list = echoes[chapterId]; if(!list?.length) return [];
  return list.filter(rule => chose(bond, rule.from, rule.choice)).map(rule => ({
    id:"echo-"+rule.from+"-"+rule.choice, from:rule.from, choice:rule.choice,
    name:rule.name, line:rule.line, note:rule.note,
    variant:rule.add.variant, kind:rule.add.kind ?? "prop", anchor:rule.add.anchor ?? null, … }));
}
```
Điểm thiết kế đáng chú ý: `mark` (dấu vết) và `choice` (quyết định) là **hai kho riêng**, `chose()` nhận cả hai → một lựa chọn nhánh *và* một đường đi dọc đường đều kích hoạt được echo.
Có test bảo vệ: `test/run.js:251` (mọi quy tắc trỏ về chặng/lựa chọn có thật), `test/run.js:265` (chọn ở chặng trước → vật thể xuất hiện ở chặng sau), `test/run.js:276` (vật thể 3D **chạm vào đọc được**), `test/run.js:335` (mọi quy tắc có đường đi đều trỏ về điểm có thật).

**WIT**: `witness-model.js:166` `callbacks(s)` trả về **mảng chuỗi văn bản**; `witness-world.js:104` biến chúng thành ≤5 chiếc bình giống hệt nhau:
```js
const echoes=M.callbacks(s);
for(let i=0;i<Math.min(5,echoes.length);i++) jar(-17+i*.8,14,.55);
```
→ Người chơi **đọc được** dấu vết trong sổ, nhưng **không thấy** nó trong thế giới.

**Đề xuất**: nâng `callbacks()` từ `string[]` → `[{variant, kind, anchor, offset, name, line, note}][]`, thêm bảng quy tắc echo theo mẫu HTLC (bắt đầu từ 30 quy tắc, phủ 12 chương + 5 Legends), và dựng prop thật ở `witness-world.js:104`. Chi phí: ~1 ngày cho cơ chế + ~2 ngày cho 30 mục nội dung. Tác động: biến "lựa chọn của tôi đã để lại dấu" từ lời hứa trong sổ thành **hiện tượng nhìn thấy được** — đúng triết lý của The Witness.

### A2. Bộ test của HTLC là bộ hồi quy cho engine dùng chung ⭐ ưu tiên 2

`test/run.js` (43 mục) test **chính các file vendor mà WIT đang dùng**:

| Nhóm test | Dòng | Phủ cái gì |
|---|---|---|
| Echo + thế giới phản ứng | 251, 265, 276, 335 | đúng mục A1 |
| NPC + hồi ký + dấu vết nhớ lại | 112, 120, 128, 137, 150, 161, 291, 345 | "người nhớ bạn thì dẫn đường được ngay" |
| Nhân vật & đồ họa | 421, 434, 445, 458, 473, 486, 512 | mesh giải phẫu, trọng số da, giác mạc/mi mắt, SSS, tóc/vải ổn định, căn cứ Kinh Thánh cho hồ sơ nhân vật, đạo cụ khảo cổ học |
| Điều khiển | 524, 536, 551, 559, 587, 599, 612, 625, 648 | cần cảm ứng có vùng chết, tay cầm chuẩn hoá, gộp bàn phím+cảm ứng+tay cầm, xoay camera, Q giữ đỡ, khoá phím khi bảng mở |
| Nhất quán build | 355 | danh sách `?rev=` khớp `ASSETS` của `sw.js` |

**WIT** có 37 test (`test/campaign.cjs` 20 + `test/spine.cjs` 17) — **gần như toàn bộ ở tầng model**, không test engine, không test input, không test hình ảnh.

**Đề xuất**: chuyển các test không phụ thuộc nội dung HTLC sang WIT (nhóm điều khiển + nhóm nhân vật/hình ảnh + test 355). Chi phí ~0.5 ngày. Tác động: lần đầu có hồi quy cho engine dùng chung → an toàn khi nâng cấp vendor.

**Mấu chốt của bộ test này là `fakeLayout()`** (`test/run.js:63-78`): nó giả lập **đúng hình dạng layout của `adventure-3d.js`** đủ để dựng cảnh **mà không cần engine 3D**. Nhờ đó test kiểm được echo có thật sự xuất hiện trong scene plan (`:276-289`), NPC ở mốc quyết định xuất hiện rồi **biến mất** sau khi chọn (`:291-301`), và lựa chọn thứ ba vẫn chạy sau save/load (`:314-333`). Đây là **seam** để unit-test mọi scene-builder của WIT mà không cần chạy game.

**Lưu ý khi port**: harness nạp file bằng `new Function(src)()` theo thứ tự cố định (`test/run.js:35-42`); mọi module là IIFE gán `globalThis.*` và **đọc global khác ngay lúc nạp** (vd `expedition-engine.js:4` đọc `StoryContent`). Khi port sang Witness phải **giữ đúng thứ tự này** hoặc chuyển sang lazy-init.

### A3. `water-case.js` — mẫu "case điều tra" hoàn chỉnh ⭐ ưu tiên 3

`water-case.js` (161 dòng) là một case điều tra khép kín:

| Thành phần | Dòng | Ghi chú |
|---|---|---|
| Người + lộ trình tuần tra | 6-10 | `rounds` — NPC tự đi vòng |
| Dấu vết có vật thể 3D + vị trí + gợi ý "đi tìm ở đâu" + lời văn | 12-23 | `model`, `at`, `where`, `text` |
| Giả thuyết + cặp bằng chứng bắt buộc | 25-34 | `theories[].evidence` |
| Lựa chọn + cái giá + kết quả + điều kiện | 35-50 | `paths[].cost/result/needs/reserve` |
| Trạng thái bitmask + khôi phục có kiểm tra | 51-72 | `clues & bit(id)`, `restore()` chặn giá trị giả |
| Reducer thuần, chặn mọi hành vi sai | 74-88 | `act()` trả false nếu chưa đủ điều kiện |
| **Lời khai đổi theo trạng thái** | 90-104 | `testimony(state, who)` — cùng một NPC nói khác đi tùy bạn đã tìm/đã suy luận |
| Hướng dẫn bước kế tiếp | 106-115 | `nextTarget(state)` |
| Sinh plan 3D (vật thể + mục tiêu + vùng tương tác) | 117-148 | `plan()` |
| Định tuyến | 150-158 | `routes` |

**WIT** có `evidence`/`claims` nhưng là **mảng phẳng** (`witness-model.js:65` `addEvidence` chỉ push id; `witness-content.js:28,40` khai báo dữ liệu tĩnh). Hồ sơ thiết kế Witness lại đòi "10 nguồn chứng cứ, 4 kết luận theo nguồn độc lập, phân biệt lô G17 và B06" — cơ chế `water-case.js` là bản mẫu đúng bài.

**Đề xuất**: dùng `water-case.js` làm **khuôn** cho một case điều tra trong WIT (ví dụ vụ "bản chép không phải nhân chứng độc lập" — `witness-content.js` đã có `copy` puzzle nhưng chưa có bước điều tra ngoài hiện trường). Chi phí ~2 ngày cho 1 case hoàn chỉnh + 1 case mẫu.

### A4. Khung cài đặt (settings) có kiểm tra kiểu ⭐ ưu tiên 4

**HTLC** `expedition-controls.js:26-56`:
```js
const DEFAULTS = Object.freeze({ sprintToggle:false, stickSide:"left", stickSize:1, waypoint:"objective" }); // "off"|"objective"|"full"
const merged = { ...DEFAULTS };
for (const key of Object.keys(DEFAULTS))
  if (saved[key] !== undefined && typeof saved[key] === typeof DEFAULTS[key]) merged[key] = saved[key];
```
Có `readSettings()` (:90), lưu có kiểm tra (:123), và UI `story-ui.js:1038 settingsMarkup()` với 4 nhóm tuỳ chọn thật (chạy, mức dẫn đường 3 bậc, vị trí cần cảm ứng, kích thước cần).

**WIT** `witness-app.js:123` chỉ có 3 tuỳ chọn (cỡ chữ 3 mức, giảm chuyển động, âm thanh), lưu trong `state.settings`.

**Đề xuất**: lấy khung `DEFAULTS` + merge kiểu + `waypoint` 3 mức. Đặc biệt **mức dẫn đường 3 bậc** rất hợp với Witness vì game có nhiều lớp "chọn để tiếp tục" (interactive ↔ summary, guide, escort) — `witness-app.js:100` hiện chỉ có một hành vi dẫn đường. Chi phí ~0.5 ngày.

### A5. NPC sống động: route + work + pose ⭐ ưu tiên 5

Engine đã có đủ (`work` ×38, `rest` ×60, `route` ×16 trong `adventure-3d.js`), và HTLC dùng ở `water-case.js:135`:
```js
add(key, person.name, { id:"water-"+key, at, kind:"npc", variant:person.variant,
  route: outcome ? null : person.rounds, fixed: Boolean(outcome), work: true, appearance:key }, {who:key});
```
**WIT** đóng đinh mọi NPC: `objects.push({id, at, kind:'npc', variant:…, appearance:…, fixed:true, pose:'idle'})` (`witness-world.js:23,28,34`). NPC chỉ đứng yên, không đi, không làm việc, không quay mặt khi nói.

**Đề xuất**: cho `witness-content.js` khai báo `rounds` cho NPC quan trọng (Hanan, Yosef, Amon…) và bỏ `fixed:true`; engine sẽ tự cho họ tuần tra, có `work` pose, và `pose:'talk'` khi người chơi đứng gần (`adventure-3d.js:4340` xử lý `wt==='talk'`). Chi phí ~1 ngày (chỉ cần sửa `witness-world.js:23-35` + bổ sung `rounds` vào dữ liệu).

### A6. Bộ dựng nhân vật sinh tự động ⭐ ưu tiên 6

`tools/character-source/` giữ nguồn MakeHuman/MPFB CC0: `base.obj` (1,8 MB), `rig.json` (42 KB), `weights.json` (3,1 MB), `groups.json` (87 KB), `targets/` (21 file `.target.gz`), `LICENSE-CC0.txt`. `tools/build-characters.js` đọc chúng và sinh `assets/human-topology.js` (dòng 178-180).

**WIT** chỉ dùng bản sinh sẵn. Không có pipeline để **tạo nhân vật mới** khi thêm chương/Legend.

**Đề xuất**: giữ pipeline ở HTLC (đã ở đúng chỗ) và dùng nó như "dịch vụ": chạy `node tools/build-characters.js` sau khi chỉnh `rig/weights/targets`, rồi copy `assets/human-topology.js` sang `the-witness/assets/`. Cần **ghi rõ quy trình** trong README của WIT (hiện WIT không có pipeline này).

### A7. Lớp điều khiển thống nhất — bản nâng cấp sẵn có ⭐ ưu tiên 7

**WIT** đang có controller gọn trong `witness-world.js:114-128` (13 dòng): danh sách phím viết cứng, dead-zone `0.22` nhúng thẳng trong biểu thức, không lưu cài đặt, không haptic, không pinch-zoom, không D-pad, không khoá input khi bảng mở.

**HTLC** `expedition-controls.js` (22,6 KB) gộp bàn phím + cần cảm ứng nổi + gamepad thành **một vector di chuyển duy nhất**, có:
- dead-zone + kéo-theo-ngón khi trượt ra ngoài vòng, pinch 2 ngón → kênh `zoom` → `WheelEvent` đẩy thẳng vào engine 3D (đã kiểm chứng bằng `tools/mobile-qa.mjs:76-96`),
- `navigator.vibrate` + `vibrationActuator` (`:539-555`), D-pad, rumble,
- `setEnabled()` để **khoá input khi bảng mở** (`:579`),
- `documentElement.dataset.expText/expMotion` để CSS phản ứng với cỡ chữ/chuyển động (`:114-115`),
- lưu cài đặt vào localStorage (`STORE` `:24`) với kiểm tra kiểu.

**8/43 mục kiểm thử của cả HTLC dành riêng cho file này** (`test/run.js:524-671`) — tỉ lệ kiểm thử cao nhất dự án.

**Đề xuất**: copy `expedition-controls.js`, sửa 3 hằng số (`STORE` → `the-witness.controls.v1`, tên dataset CSS, selector chặn sự kiện `.exp-sheet,.exp-overlay,.adv-marker`), thay `makeController` trong `witness-world.js:114-128` nhưng **giữ nguyên API `enable()/destroy()`** để không phá `witness-app.js:21`. Chi phí ~1 ngày.

### A8. Độ bền lưu trữ & offline — hai thứ WIT đang thiếu

| Cơ chế | HTLC | WIT | Đề xuất |
|---|---|---|---|
| Serialize ghi đa tab | `navigator.locks.request(STORE)` (`app.js:134-144`) — tránh race khi mở nhiều tab | ❌ ghi thẳng `localStorage.setItem` | port `mutate()` từ `app.js:117-148` — ~0.5 ngày |
| Ghim phiên bản cache cũ cho tab đã mở | `LEGACY` 11 phiên bản (`sw.js:58-80`, `:113-116`) | ❌ `witness-sw.js` chỉ 1 dòng | port cơ chế LEGACY — ~0.5 ngày |
| Guard "JS trả về HTML → fail install" | `sw.js:88-91` | ❌ | port — rất rẻ, tránh SW cài đặt hỏng âm thầm |
| Fallback kho lưu cũ | `app.js:88` đọc STORE mới → fallback STORE cũ | chỉ có LEGACY ở tầng `load()` | port — rẻ |
| `manifest.webmanifest` | có (theme `#111e1b`, 2 icon) | ❌ **WIT không có** | tạo mới cho WIT — rẻ |

Lưu ý: WIT đã mạnh hơn ở **backup + migrate schema + validation** (`witness-model.js:198-199`, `:178-187`) — không cần port gì ở phần đó. Nhưng còn thiếu đúng 4 kỹ thuật bền vững ở bảng trên.

### A9. Migration save ngầm — kỹ thuật đáng port nhất

`Expedition.restore` (`expedition-engine.js:76-116`) làm hai việc mà WIT chưa có:
1. **Vòng lặp fixpoint** dựng lại danh sách nhiệm vụ đã hoàn thành (`:85-93`) — chịu được bản lưu bị cắt bớt.
2. **Tái tạo `bond.choices` từ bản lưu cũ chỉ có `route`** (`:94-102`) — migration không cần phiên bản file, chỉ cần dữ liệu còn lại.

WIT có `witness-model.js:178-187` (backup + migrate schema 1→2) nhưng **không có** kiểu "bản lưu cũ thiếu trường → dựng lại quyết định từ dữ liệu còn lại". Kỹ thuật này rẻ và tăng độ tin cậy khi game đã có người chơi thật.

---

## 4. NHÓM B — Tái dùng được sau khi sửa vừa

### B1. Vỏ UI (`story-ui.js`, 76 KB)
40+ hàm đã hoàn thiện: `showPanel/closePanel/redrawPanel/sheetContent` (:1079,:1160,:1178,:1205), `mapMarkup` (:996), `journal` (:204), `campaign` (:118), `game` (:170), `statusMessage` (:303), `checkpoint` (:366), `readyHint` (:382), `worldStatus/worldError` (:397,:528), `applyControlSettings/syncControls` (:255,:247), `zoomCamera` (:268), `crossGate` (:597), `observeAt` (:718), `perform` (:729), `startTrial` (:912), `sense` (:927), `approachTarget/approach/interact` (:935,:950,:969), `bondInfo` (:29), `dialogueMarkup` (:55), `routeNote` (:64), `writeMotion/resetMotion` (:234,:238), `saveTrail` (:358), `updatePlan` (:323), `stamp` (:313).

**WIT** có phiên bản rút gọn trong `witness-app.js` (`show` :11, `journal` :110, `map` :119, `settings` :123, `pause` :124, `toast` :6, `transition` :17).

> ⚠ **Không port nguyên văn.** `story-ui.js` phụ thuộc nặng `adventure.css` (391 lần class `.exp-`) + `adventure-rpg.css` (297 lần `.exp-`) = **688 lần**; `styles.css` có **0** class `.exp-`/`.adv-` nên là shell của chế độ quiz, không phải UI kit. WIT dùng `witness.css` (16,6 KB) với hệ class hoàn toàn khác → phải viết lại lớp CSS. Chỉ giữ được **cấu trúc**: `showPanel/closePanel/redrawPanel`, focus-trap Tab + Esc (`story-ui.js:1326-1345`), `inert` HUD khi mở bảng (`:1190`), `syncControls()` khoá input khi bảng mở (`:247-252`).

→ **Tái dùng được**: `readyHint` (gợi ý dẫn dắt), `worldStatus/worldError` (báo lỗi trạng thái thế giới), `checkpoint` + `saveTrail` (điểm dừng nhiều mốc — Witness hiện chỉ có `checkpointPosition` ở `witness-app.js:129`), `bondInfo`/`routeNote` (hiển thị quan hệ & ghi chú tuyến), và **cấu trúc** panel/focus-trap.
→ **Không lấy**: `app.js` (`choices:365`, `orderBoard:378`, `matchBoard:395`, `solution:414`, `showFeedback:421`, `lessonIntro:572`, `checkDay:788`) — thuộc môn học Kinh Thánh của HTLC, không liên quan.

### B2. Đồng hành & dấu vết nhớ lại (`expedition-companion.js`)
Mỗi NPC có `role`, `trait`, `stake` (việc riêng của họ), `ask` (lời nhờ), hai `reply` (đi cùng / tự lo), `farewell`, và **dấu vết họ để lại trong thế giết, được nhớ lại ở chặng sau** (chú thích `:10`, dữ liệu `:19-102`).
**WIT** có `bonds` (`witness-content.js` `bonds`, `witness-model.js:154 startBond`) nhưng là "phần việc riêng" đơn giản, không có `trait`/`stake`/`farewell`/dấu vết nối chặng.
→ **Tái dùng được**: thêm `stake` + `farewell` + `trace` cho 6 quan hệ của WIT; mở rộng `M.callbacks` theo mẫu A1.

### B3. Âm thanh theo ngữ cảnh
`world.cue("read"/"walk"/"finish"/"impact")` — HTLC dùng ở 8 chỗ (`story-ui.js:614,678,757,806,846,866,879,902`). WIT chỉ dùng `cue(a.commit?'finish':'read')` (`witness-app.js:73`).
→ Bổ sung cue `walk` (bước chân), `impact` (va chạm), `discover` (phát hiện dấu vết) — engine đã có sẵn, chỉ cần gọi.

### B4. Vật thể đổi hình theo trạng thái
`water-case.js:138-145`: `water-rack-0/1/2`, `water-recovered`, `water-marked`; `solids` cho va chạm (:141,:145).
→ Dùng cho prop của WIT: ví dụ "bản ẩn danh đã giao" (con dấu đỏ trên thùng) hiện tại dùng `variant` theo beat (`witness-world.js:23`) — chuyển sang đổi theo **kết quả lựa chọn** sẽ mạnh hơn.

### B5. Bảng tương tác dùng chung (order / match)
`app.js:378 orderBoard`, `:395 matchBoard`, `:414 solution`, `:421 showFeedback` — UI bảng dữ liệu-driven cho 65 câu hỏi (`questions.js`: 46 `choice`, 11 `order`, 8 `match`).
**WIT** có 29 puzzle / 13 loại, mỗi loại một khối HTML viết tay trong `witness-app.js:76-91` và một nhánh payload riêng trong `solve()` (:94-97).
→ **Tái dùng được phần UI**: tách `orderBoard`/`matchBoard` thành component dùng chung, thay 3 puzzle `brace/rope/rescue` đang tự dựng (`witness-app.js:79-81`) và giúp thêm puzzle mới không phải sửa 2 hàm.
→ **Không lấy**: nội dung 65 câu hỏi giáo lý.

---

## 5. NHÓM C — Không tái dụng được, phải viết lại

| Thành phần HTLC | Lý do |
|---|---|
| `questions.js` (65 câu hỏi) | nội dung giáo lý MCQ theo bài học Kinh Thánh; không khớp triết lý Witness |
| `engine.js` → `JourneyEngine` (`:329`) | vòng lặp "bài học theo ngày", hạng/badge, `dayKey/offsetDay/checkDay` — mô hình tiến trình khác hẳn |
| `story-data.js` (142 KB) | nội dung riêng của HTLC |
| `expedition-field.js`, `expedition-plan.js` | gắn với cấu trúc chặng của HTLC |
| `sw.js` (chiến lược cache nhiều thế hệ, `:59-76`) | WIT đã có `witness-sw.js` riêng, đủ dùng |
| `build-standalone.js` | WIT đã có `tools/build.cjs` riêng (tốt hơn: sinh cache + HTML offline) |
| `app.js` `reviewPage/choices/orderBoard/matchBoard/solution` | thuộc môn học giáo lý |

---

## 6. Xếp hạng theo (ảnh hưởng chất lượng) ÷ (chi phí)

| # | Hạng mục | Ảnh hưởng | Chi phí | Bằng chứng |
|---|---|---|---|---|
| 1 | Echo → vật thể vật lý trong cảnh (30 quy tắc) | ★★★★★ | ~3 ngày | `expedition-world.js:20-312` vs `witness-world.js:104` |
| 2 | NPC tuần tra + `work` + `talk` (bảng `roaming` có sẵn) | ★★★★★ | ~1 ngày | `expedition-plan.js:10-15` vs `witness-world.js:23,28,34` |
| 3 | Lớp điều khiển thống nhất (bản nâng cấp có sẵn) | ★★★★☆ | ~1 ngày | `expedition-controls.js` vs `witness-world.js:114-128` |
| 4 | **`status.arrow` + `status.walking` + `sense()`** — API có sẵn, app không gọi | ★★★★☆ | **~0.5 ngày** | `witness-app.js:39-45` vs `14-input-and-ux-research.md:175,176` |
| 5 | Sổ điều tra 3 thao tác (claim → nguồn → phạm vi) | ★★★★☆ | ~2 ngày | `witness-app.js:113` vs `02:102`; nền `witness-model.js:156-161` |
| 6 | `sense()`/`sense` highlight + hội thoại nhiều lượt + banter | ★★★★☆ | ~2 ngày | `water-case.js:90-104`; `expedition-companion.js` |
| 7 | Bộ test hồi quy + seam `fakeLayout()` + đưa 3 test browser vào `npm test` | ★★★★☆ | ~1 ngày | `test/run.js:63-78,251-648`; `package.json:6` |
| 8 | Case điều tra mẫu (`water-case.js`) | ★★★★☆ | ~2 ngày | `water-case.js:25-115` |
| 9 | Sửa lỗi: `pose('listen')`, gợi ý lộ đáp án, `onStatus` ghi DOM mỗi khung hình, test tiếng Việt có dấu | ★★★★☆ | ~1 ngày | §2b.2 |
| 10 | Khung cài đặt + dẫn đường 3 mức + `waypoint` | ★★★☆☆ | ~0.5 ngày | `expedition-controls.js:26-56`; `story-ui.js:1038` |
| 11 | Migration save ngầm (fixpoint + tái tạo quyết định) | ★★★☆☆ | ~0.5 ngày | `expedition-engine.js:85-102` |
| 12 | `navigator.locks` + sw.js LEGACY + guard + manifest | ★★★☆☆ | ~1 ngày | `app.js:134-144`, `sw.js:58-91` |
| 13 | `cue()` đủ ngữ cảnh + caption | ★★★☆☆ | ~0.5 ngày | `story-ui.js:614-902` |
| 14 | `solids` va chạm cho vật thể | ★★★☆☆ | ~1 ngày | `water-case.js:141` |
| 15 | Vật thể đổi hình theo kết quả lựa chọn | ★★★☆☆ | ~1 ngày | `water-case.js:138-145` |
| 16 | Component bảng order/match dùng chung | ★★☆☆☆ | ~1 ngày | `app.js:378,395` vs `witness-app.js:79-97` |
| 17 | `readyHint` / `checkpoint` / `worldError` | ★★☆☆☆ | ~0.5 ngày | `story-ui.js:366,382,528` |
| 18 | `stake`/`farewell`/trace cho quan hệ | ★★☆☆☆ | ~1 ngày | `expedition-companion.js:19-102` |
| 19 | Vòng kế hoạch 7 trạng thái + hệ quả 2 tầng + năng lực/đồ dùng | ★★☆☆☆ | ~2 ngày | `expedition-plan.js`, `expedition-branch.js`, `expedition-field.js` |
| — | **Thời lượng 216/720 phút** | ★★★★★ | **không mượn được** | phải cắt scope theo `09-production-technical-plan.md:85` |

---

## 7. Kế hoạch triển khai đề xuất

**Giai đoạn 0 — "Nối API đang có sẵn" (~1,5 ngày, rủi ro thấp nhất, ROI cao nhất)**
1. Nối `status.arrow` (la bàn mục tiêu), `status.walking`, `status.sensed` trong `witness-app.js:39-45` — engine đã có sẵn.
2. Bật `engine.sense()` cho thao tác "Nhận ra".
3. Sửa `engine.pose('listen')` → `talk`/`offer` (`witness-app.js:73`).
4. Sửa gợi ý 3 cấp (đừng điền sẵn cả 3 bước) ở `witness-app.js:81,136,145`.
5. `onStatus` chỉ ghi DOM khi giá trị đổi (`witness-app.js:43`).
6. Đưa `browser.mjs`, `spine-browser.mjs`, `scene.mjs` vào `npm test` (`package.json:6`).
7. Thêm test tiếng Việt có dấu (normalize/NFC).
→ *Kết quả:* một loạt cải thiện cảm nhận rõ mà không đụng tới nội dung.

**Giai đoạn 1 — Nền tảng kiểm thử (~1 ngày)**
1. Port `test/run.js` + `fakeLayout()` vào `the-witness/test/`, giữ thứ tự nạp file.
2. Port 8 mục kiểm thử điều khiển (`test/run.js:524-671`) + nhóm nhân vật/hình ảnh (`:421-512`) + test nhất quán SW (`:355`).
→ *Kết quả:* có hồi quy cho engine dùng chung trước khi đụng vào bất cứ thứ gì.

**Giai đoạn 2 — "Thế giới nhớ" (~3 ngày, tác động cao nhất)**
1. Mở rộng `M.callbacks()` → trả về `{variant, kind, anchor, offset, name, line, note}` (giữ mảng chuỗi cũ để tương thích).
2. Thêm bảng quy tắc echo (mục tiêu 30 quy tắc, phủ 12 chương + 5 Legends).
3. `witness-world.js:104` dựng prop thật thay vì bình giống nhau.
4. Bổ sung 3 test kiểu `test/run.js:251,265,335`.
→ *Kết quả:* lựa chọn của người chơi xuất hiện trong thế giới — trục cột của triết lý The Witness.

**Giai đoạn 3 — "Người sống" (~2 ngày)**
1. Cho NPC có `rounds` (dùng bảng `roaming` + `loop()` của `expedition-plan.js:10-15`) + bỏ `fixed:true`; thêm `pose:'talk'` khi đứng gần.
2. Thêm cue `walk` / `discover` / `impact`.
3. Port `expedition-controls.js` thay `witness-world.js:114-128` (giữ API `enable()/destroy()`).

**Giai đoạn 4 — "Luật chơi & độ bền" (~3 ngày)**
1. Sổ điều tra 3 thao tác (claim → nguồn → phạm vi) + trạng thái claim `observed/reported/corroborated/contested`.
2. Port cơ chế `water-case.js` thành module "case" tổng quát, thay `witness-model.js:48-64` (`checkPuzzle` 13 nhánh `if` cứng) và `D.claims[].requires` (danh sách ID viết tay). Kèm test — hiện `water-case.js` có **0** test.
3. Hội thoại nhiều lượt + banter + `knownBy[actor]` (schema `expedition-companion.js`).
4. Vòng kế hoạch 7 trạng thái + hệ quả 2 tầng.
5. Port `navigator.locks`, cơ chế sw.js `LEGACY`, guard "JS trả HTML", fallback kho cũ, tạo `manifest.webmanifest`.
6. Khung settings `DEFAULTS` + merge kiểu + `waypoint` 3 mức.
7. Tách `orderBoard`/`matchBoard` thành component.

**Song song (rủi ro vận hành)**
- Viết `the-witness/tools/sync-vendor.mjs` với **danh sách loại trừ** `vendor/adventure-3d.js` + `assets/mark.svg`; chế độ `--check` exit≠0 khi lệch; gắn vào `npm test`. Việc này chặn việc đồng bộ máy móc xoá mất patch `clearLegacyProps`.
- Thêm `.gitattributes` chốt line ending (hiện `core.autocrlf=true` làm file vendor đổi LF↔CRLF giữa các lần commit — đã quan sát thấy `vendor/adventure-3d.js` bị đổi 815.192 → 819.569 byte).

---

## 8. Rủi ro cần biết

1. **Patch vendor**: `vendor/adventure-3d.js` của WIT khác bản HTLC (`clearLegacyProps`). Mọi quy trình đồng bộ phải loại trừ file này.
2. **Chỉ port cơ chế, không port nội dung**: `expedition-campaign.js`, `expedition-companion.js`, `expedition-branch.js` của HTLC là **sáng tác minh họa** đặt cạnh các chặng Kinh Thánh (chú thích `expedition-campaign.js:13`: "Fictional encounters staged beside the sourced chapters"). WIT có hợp đồng kiểm định nội dung riêng (`campaign-contract.json` 45 KB, `design-contract.json`, `tools/validate-witness-contracts.py`, `tools/check-witness-docs.mjs`) — **port nội dung sẽ vi phạm hợp đồng**. Chỉ port cơ chế, viết lại bảng dữ liệu.
3. **Thứ tự nạp module**: mọi module là IIFE gán `globalThis.*` và đọc global khác **ngay lúc nạp**. Port sang WIT phải giữ thứ tự hoặc chuyển lazy-init.
4. **CSS không port được**: `story-ui.js` cần 688 lần class `.exp-`; `witness.css` dùng hệ class riêng → phải viết lại lớp CSS, chỉ giữ được cấu trúc.
5. **Phiên làm việc song song**: trong lúc nghiên cứu này, một phiên khác đang sửa `the-witness/docs/the-witness/**`, `outputs/THE-WITNESS-Design-v3.0/**`, `witness-model.js`, `witness-world.js`. Cần thống nhất trước khi bắt đầu triển khai GĐ1 để không va chạm.
6. **Chi phí nội dung**: các hạng mục #1, #6, #15 đòi hỏi **viết nội dung mới**, không chỉ dán code. Đây là phần tốn thời gian thật.
7. **Số liệu hồ sơ không khớp thực tế**: hồ sơ thiết kế Witness tự ghi "chưa có AI đồng hành tự do / chiến đấu, chưa triển khai toàn bộ phản ứng địa hình, chưa có motion capture" — những hạng mục #2 và #6 là cách rẻ nhất để bắt đầu lấp đúng những lỗ hổng đó.
8. **Chưa xác nhận**: `adventure-3d.js` là bundle tối ưu 815 KB — chỉ public API được đối chiếu qua chỗ dùng. Trước khi port `world.pause(true, at, {aside, actor})` hay `AdventureCast.portrait()`, cần kiểm lại trực tiếp trong `vendor/adventure-3d.js`.

---

## Phụ lục — Bảng tra nhanh API engine

```
Adventure3D.create / layoutFor / expeditionFor / characterViewer   adventure-3d.js:4340
AdventureVisuals.{atmosphere,light,sky,ridges,surface,rocks,
  treeTrunk,canopy,grass,vegetation,water,tent,accessory}           adventure-visuals.js:572
AdventureCharacter.create                                            adventure-character.js:1171
AdventureCast.{people,portrait,asset}                                adventure-cast.js:72
CharacterProfiles.{profiles,eras,get,resolve,version}               character-profiles.js:210
CharacterDetail.{sculpt,expressions,skin,groom,maps,mantle,
  spring,batchGarments}                                              character-detail.js:520
```

| Hàm engine chưa dùng trong WIT | Lợi ích |
|---|---|
| `engine.sense(nearby)` | phát hiện vật chưa đọc trong tầm |
| `engine.focus(target)` | đổi tiêu điểm tương tác |
| `engine.setRole(role)` | đổi vai trò NPC |
| `solids` trong object plan | vật thể có va chạm |
| `variants` theo trạng thái | prop đổi hình sau lựa chọn |
| `route` / `work` / `rest` | NPC tự đi, tự làm việc, nghỉ |

---

## Phần đã triển khai (commit `3918f4b`)

Bảng dưới đây ghi rõ cái gì đã dùng, cái gì đã bỏ, và vì sao. Mọi thứ đều được
điều chỉnh cho cốt truyện Chứng Nhân, không bê nguyên si từ Hành Trình Lời Chúa.

| # | Khoảng trống đã nêu | Đã làm | Bằng chứng |
|---|---|---|---|
| 1 | Echo vô hình (một hàng bình gốc ở `decorate()`) | **Cơ chế echo thật**: mỗi quyết định đã xong sinh ra một vật thể ở đúng vùng đã tạo ra nó, có tên, lời mô tả và phần ghi lại quyết định. Bảng `echoMarks` ở `witness-content.js`, điều kiện ở `witness-model.js`, dựng vật thể ở `witness-world.js`. `callbacks()` giờ suy ra từ `echoes()` nên **không đổi một chữ nào** của sổ quyết định | `test/scene-plan.cjs` (14 kiểm tra) |
| 2 | Chưa dùng `status.arrow` / `status.sensed` / `status.guide` | **La bàn mục tiêu** (`witness-compass.js`): kim chỉ về việc đang cần làm; **Nhận ra** (phím `X` + nút cảm ứng) dùng `engine.sense()` và cờ `unread` của engine; nhãn "Đang đi tới…" dùng `status.guide` | `test/browser.mjs` (2 kiểm tra mới) + ảnh `test/artifacts/game-desktop.png` |
| 3 | `engine.pose('listen')` là no-op | Đổi thành `'talk'` (đúng tập tư thế `adventure-character.js` chấp nhận) | `test/browser.mjs` |
| 4 | `onStatus` ghi DOM mỗi khung hình | Chỉ ghi khi nội dung thật sự đổi (cache theo khoá) | `test/browser.mjs` |
| 5 | Gợi ý lộ đáp án ngay | **Gợi ý 3 cấp**: nhẹ (chỉ nguyên tắc) → nửa (đầu và cuối) → đầy (cả thứ tự), cho cả câu đối chiếu lẫn thao tác trong chương | `test/browser.mjs` + `test/spine-browser.mjs` |
| 6 | 0 kiểm thử tiếng Việt có dấu | `test/charset.cjs`: NFC, không mojibake, không dấu thanh tách lẻ, không ba chấm trong chuỗi hiển thị | `test/charset.cjs` (6 kiểm tra) |
| 7 | Chưa có seam để kiểm thử scene plan | `test/scene-plan.cjs` nạp `witness-world.js` với kẹp tối giản, kiểm tra vị trí dấu vết, biến thể prop, quyền `main` | `test/scene-plan.cjs` |
| 8 | Nút cảm ứng hiện cả trên desktop | Chỉ hiện khi thiết bị có con trỏ thô (`pointer: coarse`) | `test/browser.mjs` |

### Cố ý không dùng

- **`scroll` trong nhánh Veil**: đã kiểm lại danh mục prop thật của engine — `scroll`
  **hợp lệ** (nằm trong `props` của chính layout engine). Không sửa.
- **Thời lượng 216/720 phút, camera pitch, `story-ui.js`**: thuộc về kiến trúc và nội
  dung riêng của Hành Trình Lời Chúa, ghép vào đây sẽ phá hồ sơ v3.0.
- **Toàn bộ nội dung minh họa** (companion, branch, campaign): chỉ mượn **cơ chế**,
  không mượn một câu chữ hay một nhân vật nào.

### Ghi chú kỹ thuật đã kiểm chứng

- Engine đặt camera sau người chơi tại `player + (sin yaw, cos yaw)`, nên **hướng
  nhìn = `yaw + PI`**. La bàn của Hành Trình Lời Chúa dùng `yaw` trực tiếp → lệch
  180°. Bản ở đây dùng đúng quy ước của engine.
- `engine.sense()` chỉ nhận target có cờ `unread`; game phải tự đặt cờ này (game cha
  làm vậy ở `water-case.js`). Dấu vết ở đây luôn `unread` nên "Nhận ra" dùng được.
- `status.arrow` bằng 0 vừa khi "mục tiêu thẳng phía trước" vừa khi "không có mục
  tiêu", nên bản này tự tính góc từ `position` + `yaw` thay vì dùng `arrow`.

