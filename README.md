# Chứng Nhân: Di Sản Giao Ước

**UNSEALED WITNESS: Legacy of the Covenant** — game thám hiểm một người chơi.

- Phát triển bằng AI: bắt đầu ở [AGENTS](AGENTS.md).
- Nguồn chuẩn, thiết kế và tài liệu: [docs/README](docs/README.md).
- Phần đã triển khai/chưa duyệt: [STATUS](docs/STATUS.md).

## Chạy và kiểm

Node tối thiểu theo `package.json`; cài dependency bằng `npm ci`.
`npm run dev` mở bản tĩnh trên loopback 8034; `npm run dev:cloud` mở bản thử
cloud cục bộ 8035. `npm run build` tạo web, Worker và HTML ngoại tuyến ở dist.
`npm test` kiểm model; browser/backend có các lệnh riêng theo OPERATIONS.

`npm run agent:context -- content` in nguồn cần đọc, code, kiểm tra và nơi cập
nhật (đổi content thành change/environment/release theo nhiệm vụ).
`npm run check:agents` là cổng cấu trúc tài liệu/skill trước test và build.

Reader có thể sinh bằng `python tools/build-witness-docs.py` (cần Python Markdown).
Nguồn biên tập là docs; outputs/archive không là nguồn điều hành song song.
Dự án Hành Trình Lời Chúa ở thư mục anh em là sản phẩm riêng.
