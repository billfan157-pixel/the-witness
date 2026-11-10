---
name: witness-environment
description: Phát triển cảnh 3D, collision, renderer, asset hoặc âm thanh THE WITNESS theo pipeline nguồn và cổng chất lượng hiện hành.
---

# Cảnh và tài nguyên

Đọc `docs/agent/architecture.md`, status, và đúng hồ sơ miền trước khi sửa.
Môi trường dùng `docs/environment-kit/roadmap.md`, `standards.md`,
`look-bible.md`, `progress.json`, `catalog.csv`. Q01 dùng `phase-b.md`,
`q01-gold-scene.md`, `phase-3.md` cùng thư mục; renderer dùng hồ sơ 22 trong
`docs/the-witness/`. Không dùng tên gold/AAA để tự coi đã nghiệm thu.

Chọn điểm sửa theo producer: scene ở world/Q01/environment, collision ở
architecture, engine ở `tools/environment-kit/engine-runtime.js`. Không sửa
phần engine sinh trong vendor hoặc GI data rồi để builder ghi đè. GI đổi đầu
vào phải bake lại và kiểm `--check`; không tắt kiểm freshness.

Trước thêm asset, tra catalog/credits/research và ledger hiện có. Đăng ký ID,
nguồn, license, [K/L/G/H/C], producer và ngân sách. Giữ cùng Three r187, color
space đúng, metre/Y-up, footprint và sàn nhiều tầng riêng; lifecycle qua scope/
lease, không dispose shared template từ scene. Không thay controller bằng
teleport hoặc camera trình diễn để né va chạm.

Âm thanh dùng `witness-audio-library.js`, audio/ambience runtime và credits;
ghi rõ nguồn/voice/license. Không coi bản brief hoặc lời hứa generation là
file audio đã có. Kiểm nghe và fallback offline khi thêm âm thanh thực.

Kiểm theo `docs/agent/verification.md`: tuyến gameplay/quest còn tới được,
first/third-person, ngày/tối, tầng và save/reload; cold standalone khi chạm
asset/pipeline. Kiểm graphics ngoài Q01 khi thay renderer dùng chung. Ghi
build/hash/môi trường, không chạy benchmark GPU đồng thời. Tách pass scripted,
art approval, human playtest và physical-device performance. G3 chỉ đóng khi
có người dùng chấp nhận; report cũ không thay hash của candidate hiện tại.
