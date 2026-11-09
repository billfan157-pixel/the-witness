# Nghiên cứu góc nhìn thứ nhất từ game 3A nhập vai / thám hiểm / sinh tồn

Tài liệu nền cho chế độ góc nhìn thứ nhất (phím V) của **UNSEALED WITNESS: Legacy of the Covenant**. Ngày nghiên cứu: 2026-11-09. Phạm vi: bài học thiết kế có thể áp dụng ngay cho runtime three.js của dự án, không thay đổi Canon Lock hay cấu trúc chiến dịch.

## 1. Các game khảo sát và bài học rút ra

| Game | Thể loại | Bài học chính | Ứng dụng vào dự án |
|---|---|---|---|
| **The Elder Scrolls V: Skyrim** | Nhập vai thế giới mở | Chuyển first/third tức thời, giữ nguyên hướng nhìn và hành vi khi đổi góc | Phím V chuyển tức thời; yaw `G` dùng chung cho cả hai góc nên hướng nhìn, la bàn, di chuyển không đổi khi chuyển |
| **Subnautica** | Sinh tồn thám hiểm | Kinh ngạc/sợ hãi đến từ việc tự mắt thấy môi trường ở tầm mắt; UI sinh tồn tối thiểu nhưng đủ thông tin | Góc thứ nhất đặt camera 1,58 m để địa vật, dấu vết, NPC hiện diện ở tầm người thật; giữ HUD hiện có, chỉ thêm chấm tâm nhỏ |
| **The Long Dark** | Sinh tồn | Im lặng và góc nhìn hạn chế khiến người chơi "cảm" nhân vật; không cần nhiều chỉ số | Không thêm HUD mới trong góc thứ nhất; dùng lại phụ đề âm thanh mô tả và chế độ dẫn đường `Đầy đủ / Chỉ mục tiêu / Tắt` |
| **Firewatch** | Thám hiểm tự sự | UI diegetic (bản đồ cầm tay, la bàn, bảng kẹp) thay HUD; mọi thứ trên màn hình phải phục vụ cô độc/khám phá | Sổ tay (J), bản đồ (M), bảng đối chiếu vốn là "vật trong thế giới" của game ta — giữ nguyên, không phủ thêm lớp HUD FPS |
| **The Witness (2016)** | Giải đố quan sát | Giao tiếp phi ngôn từ, người chơi tự học bằng quan sát; màn hình sạch tuyệt đối | Chấm tâm nhỏ 5 px là phần thêm duy nhất; mốc nổi vẫn tắt được bằng `guideMode:'off'` |
| **Kingdom Come: Deliverance** | Nhập vai lịch sử | Chỉ góc thứ nhất để đắm mình thời đại; cộng đồng chuộng HUD tối thiểu | Chế độ thứ nhất là *tùy chọn* đắm mình, không bắt buộc; bối cảnh thế kỷ I hưởng lợi từ tầm mắt thật |
| **Outer Wilds** | Thám hiểm | Tri thức là tiến trình; camera tự do nhìn lên/xuống là bắt buộc để đọc thế giới | Pitch mở rộng −72°…+77° (góc thứ ba cũ chỉ nhìn xuống 12°…47°) để đọc bầu trời, vòm hang, mép nước |

## 2. Thông số kỹ thuật áp dụng (theo khuyến nghị First-Person 3Cs)

- **FOV dọc 71°** ≈ 103° ngang ở 16:9, nằm trong dải khuyến nghị 85–110° cho PC; góc thứ ba giữ 51°.
- **Tầm mắt 1,58 m** trên mô hình chuẩn hóa 1,7 m (`Yt(object,1.7)` trong engine).
- **Pitch giới hạn −1,25…+1,35 rad** (~−72°…+77°), tránh lật camera ở ±90°.
- **Near clip 0,13** giữ nguyên — đủ gần để không xuyên địa vật khi đứng sát.
- **Không head-bob mặc định**: bob gây say; chỉ bật (biên độ 2,4 cm dọc / 1,2 cm ngang) khi người chơi tắt "Giảm chuyển động". Camera first-person không làm mượt vị trí (`blend=1`) để tránh cảm giác "bơi".
- **Không kéo camera va chạm** ở góc thứ nhất (không còn boom camera); khung inspect/thoại/cinematic vẫn ưu tiên dàn dựng sẵn.

## 3. Quyết định tương tác

- **Chuột:** bấm vào canvas ở góc thứ nhất → pointer lock kiểu FPS (0,0032 rad/px); vẫn hỗ trợ kéo để nhìn nếu không khóa được. Mở menu/dialog tự thoát pointer lock.
- **Cảm ứng:** nửa phải kéo nhìn như cũ nhưng dấu pitch đảo cho tự nhiên (vuốt lên = ngẩng lên).
- **Tay cầm:** cần phải Y nhìn lên/xuống (mới), nhấn cần phải (R3) đổi góc nhìn.
- **Tương tác E** vốn dựa vào khoảng cách và mốc, không raycast từ camera → hoạt động nguyên vẹn; click-to-walk vẫn raycast từ camera mới.
- **Nhân vật:** ẩn mesh người chơi chỉ trong góc thứ nhất tự do; `Zt()` khôi phục mỗi khung nên thoại/cinematic không bị kẹt ẩn.

## 4. Nguồn tham khảo

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

## 5. Phạm vi chưa làm (gợi ý cho bản sau)

- Viewmodel tay/dụng cụ cầm tay khi thao tác hiện trường (cần asset riêng).
- Bản đồ cầm tay diegetic trong thế giới 3D thay bản đồ toàn màn hình (theo Firewatch).
- Điều chỉnh FOV tùy ý trong tùy chỉnh; vignette khi chạy.
- Kiểm chứng playtest người thật về say camera theo protocol 12 người hiện có.
