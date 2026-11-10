# Đầu mối nguồn chuẩn cho THE WITNESS

Hệ thống quản trị có hiệu lực từ **10/11/2026**. Đây là bản đồ tới nguồn sở hữu,
không thay thế các Bible, code hoặc hồ sơ nghiệm thu. Đọc [status](status.md)
trước khi tiếp tục việc đang dở. [Audit ban đầu](audit-2026-11-10.md) là ảnh chụp
đánh giá, không phải trạng thái sống.

## Hiểu đúng nguồn chuẩn

| Câu hỏi | Nguồn trả lời |
| --- | --- |
| Người dùng đang yêu cầu làm gì? | Yêu cầu hiện tại và các quyết định đã xác nhận trong cùng công việc |
| Sản phẩm phải theo nguyên tắc nào? | Nguồn thiết kế sở hữu từng miền bên dưới; quyết định liên miền ở [decisions](decisions.md) |
| Hiện đã chạy được gì? | Code nguồn và kiểm thử hành vi; đối chiếu [architecture](architecture.md) |
| Đã đạt nghiệm thu nào? | Báo cáo có phạm vi, build/hash, môi trường và giới hạn; gate môi trường ở `docs/environment-kit/progress.json` |
| File thuộc đâu, có được tạo mới không? | [repository-policy](repository-policy.md) và [registry.json](registry.json) |
| Làm và xác minh như thế nào? | [workflow](workflow.md), [verification](verification.md), các skill trong `AGENTS.md` |

Mã nguồn chứng minh hiện trạng, không tự phê chuẩn thiết kế. Bible mô tả đích,
không chứng minh triển khai. Báo cáo test cũ không chứng minh checkout hiện tại.
Không dùng ngày sửa, số v6/v3/0.7 hoặc dòng ghi đè cuối tài liệu để xử mâu thuẫn.

## Bảng sở hữu quyết định

Đường dẫn trong bảng tính từ gốc repository. Chỉ đọc các miền liên quan.

| Miền | Nguồn sở hữu cần sửa trước/cùng code | Đối chiếu thực thi và bằng chứng |
| --- | --- | --- |
| Tầm nhìn, canon lock, vai người chơi | `docs/the-witness/13-legends-spine-charter.md`; `08-scripture-reference.md`, `15-source-world-packets.md` cùng thư mục | `witness-spine.js`, test spine/v31; nguồn nghiên cứu ở `10-source-register.md` |
| Luật hệ thống RPG và gameplay | `docs/the-witness/02-game-design-document.md` | `witness-model.js`, `witness-content.js`, `witness-depth.js`, `witness-craft.js` |
| Cốt truyện tổng thể và các mở rộng scene v6 | `docs/the-witness/03-narrative-bible.md` | Các chương runtime và contracts; xem khoảng cách A01 ở status |
| Sự thật vụ hàng, ai biết gì, phạm vi chứng cứ | `docs/the-witness/12-continuity-and-state.md` | `witness-content.js`, `witness-model.js`, campaign tests |
| Nhân vật / thế giới / chương cầu nối | `05-character-bible.md` / `04-world-bible.md` / `11-chapter-dossiers.md` trong `docs/the-witness/` | Content, relationships, world; `06-campaign-quest-bible.md` tổng hợp chiến dịch |
| ID, route, cổng Legends và dữ liệu thiết kế | `docs/the-witness/campaign-contract.json`, `design-contract.json` | Consumer đọc trực tiếp nguồn trong docs; hai bản sao ở gốc đã loại bỏ sau khi chuyển test |
| Slice Q01 được viết trong hồ sơ | `docs/the-witness/07-vertical-slice-screenplay.md` | Đây là thiết kế slice; không mặc định đã thay campaign/save đang chơi |
| Nhịp Legends / encounter / dàn dựng | `14-legends-depth-dossiers.md` / `17-encounter-atlas.md` / `18-scene-craft-and-dialogue.md`, `20-scene-implementation.md` trong `docs/the-witness/` | Spine, depth, craft; `depth-contract.json`, `craft-contract.json`; 19 là protocol playtest |
| Điều khiển và rendering | `docs/the-witness/14-input-and-ux-research.md`, `21-first-person-research.md`, `22-graphics-rendering.md` | Engine source, graphics, app, CSS; browser tests |
| Asset và kiến trúc cảnh | `docs/environment-kit/standards.md`, `look-bible.md`, `roadmap.md`, `catalog.csv` cùng thư mục | Asset ledger, builders, architecture, world; nguồn ở `research/` |
| Q01 hiện hành / gate hình ảnh | `docs/environment-kit/phase-b.md`, `q01-gold-scene.md`, `phase-3.md`, `progress.json` | `validation/phase-b/` nếu tồn tại và còn đúng hash; Q01 gold/phase3 là các mốc riêng |
| Backend, tài khoản, save | `docs/the-witness/23-backend-and-cloud-saves.md`; `db/schema.ts` sở hữu schema | `server/api.mjs`, `server/worker.mjs`, `witness-cloud.js`, model.restore; migration `drizzle/` |
| Lệnh, dependency, hosting | `package.json`, hai lockfile tương ứng, `.openai/hosting.json` | `tools/build.cjs`, `tools/build-cloud.mjs`, `tools/serve*.mjs/cjs`; không lấy cấu hình từ output cũ |

Tên file rút gọn trong một ô giữ cùng thư mục đã nêu. Các tài liệu 01/09/16 và
nguồn nghiên cứu cung cấp bối cảnh; README dẫn đường; bản HTML/DOCX/ZIP ở outputs
là xuất bản của nguồn, không là nơi biên tập song song.

Nghiên cứu HTLC, so sánh tái dụng ngày 07/11 và bản Word mốc Phase 3 nằm ở
`docs/archive/`; chúng là tài liệu lịch sử, không điều hành phát triển hiện tại.
Danh sách file đã dọn, lý do và Git object để phục hồi ở
[cleanup-record.json](cleanup-record.json).

## Khi có mâu thuẫn

Ghi rõ hai nguồn, tác động và trạng thái ở [status](status.md). Nếu chỉ là mô tả
cũ, sửa mô tả theo bằng chứng. Nếu đụng cốt truyện, schema, ID hoặc phạm vi đã
được chốt, đưa phương án cụ thể theo workflow; tiếp tục phần độc lập, không tự
chọn một hướng sáng tạo mới. Quyết định đã được người dùng chấp nhận hoặc quy
ước kỹ thuật trong phạm vi được giao được ghi ở [decisions](decisions.md).

## Bảo trì hệ thống này

Một luật chỉ có một nơi sở hữu. Skill dẫn tới quy trình; README dẫn tới nguồn;
registry chỉ chứa đường dẫn/chủ sở hữu/chính sách máy kiểm được. Cập nhật chúng
trong cùng thay đổi khi đổi cấu trúc. Không cần thêm tài liệu hay nhật ký riêng
cho từng lần sửa nhỏ. [worklog](worklog.md) giữ các việc nhiều bước và bàn giao.
