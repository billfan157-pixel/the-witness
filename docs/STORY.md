# Nguồn nội dung và thiết kế truyện

<a id="ownership"></a>
## Tra đúng chủ sở hữu

| Nội dung cần sửa | Nguồn chi tiết sở hữu | Đối chiếu |
| --- | --- | --- |
| Cốt truyện tổng thể, cấu trúc scene v6 | [03 Narrative Bible](the-witness/03-narrative-bible.md) | GDD cho hệ thống; STATUS cho khoảng cách thực thi |
| Sự thật vụ hàng, evidence/claim, ai biết gì | [12 Continuity](the-witness/12-continuity-and-state.md) | Contract/runtime hiện vẫn 10 evidence/4 claims |
| Nhân vật, động cơ, tri thức | [05 Character](the-witness/05-character-bible.md) | 12 sở hữu sự thật và quyền biết |
| Chiến dịch tổng thể / cảnh từng Q | [06 Campaign](the-witness/06-campaign-quest-bible.md) / [11 Chapters](the-witness/11-chapter-dossiers.md) | ID/route/gate đang dùng ở campaign-contract |
| Blocking, thoại, trình tự slice Q01/Q03/L01 | [07 Screenplay](the-witness/07-vertical-slice-screenplay.md) | Không mặc định thay campaign save đang chơi |
| Scene Legends / nguồn và thế giới của scene | [14 Legends](the-witness/14-legends-depth-dossiers.md) / [15 Packets](the-witness/15-source-world-packets.md) | Core/order/revision ở contract; canon ở 08 |
| Địa lý, văn hóa và mỹ thuật chung | [04 World](the-witness/04-world-bible.md) | Source register và chuẩn môi trường |
| Thoại/chi tiết cảm xúc bổ sung | [18 Craft & dialogue](the-witness/18-scene-craft-and-dialogue.md) | Là mốc biên tập 0.4; không sở hữu danh mục runtime mới |
| Bản văn, chuyển thể, nguồn nghiên cứu | [08 Scripture](the-witness/08-scripture-reference.md) / [10 Sources](the-witness/10-source-register.md) | Từng claim cần nhãn, nguồn, giới hạn |

Không đọc tất cả các hàng. Chọn hàng theo phần đang sửa; nguồn kia chỉ cần khi
thay đổi đi qua ranh giới sở hữu. Hồ sơ 12 sở hữu độc quyền sự thật nền, điều kiện
chứng cứ/mệnh đề, lineage và consent; các phần tóm tắt trong hồ sơ 03 và 06 chỉ là
hình chiếu tham chiếu phái sinh, không sở hữu luật riêng. Phân biệt quan sát vật lý
sơ bộ B06 ở Q01 với việc xác lập E02 ở Q02; giữ ranh giới E04/Q03 với E05/Q05.
Hạn chế sao chép cùng bảng chứng cứ/cốt truyện sang nhiều Bible; file tổng hợp dẫn link tới bảng sở hữu.

<a id="contracts"></a>
## Dữ liệu và ranh giới thực thi

Các contract ở `docs/the-witness/`:

- `campaign-contract.json`: ID, route, core/gate, callback và ngân sách v3.
- `design-contract.json`: thiết kế progression, scope và manifest tài liệu xuất.
- `depth-contract.json`, `craft-contract.json`: chỉ mục sinh từ module encounter/
  craft. Khi đổi runtime, chạy đúng producer; không sửa số đếm bằng tay để khớp.

Code thực thi là content/spine/depth/relationships/craft/model. Narrative Bible v6
là nguồn thiết kế cốt truyện mới chính thức, nhưng phải tuân thủ tuyệt đối các bất biến
trong PRODUCT (Canon Lock, Dual-Tier Persona, không mana/phép lạ, Legends không truyền
dữ liệu sang Mortal). Chưa có chuyển đổi toàn bộ E11/E12/P05 của v6 vào runtime; các
ID/claim này được hoãn cho tới đợt nâng cấp toàn diện. Cần đọc A01/D010 trước mọi việc thêm quest,
vật chứng, claim hoặc thay cổng. Version truyện, game, tài liệu và save khác miền.

<a id="authoring"></a>
## Cách thay nội dung

1. Nêu chapter/scene/ID, luật đang có và hành vi cần đạt. Tra nguồn sở hữu ở trên.
2. Kiểm tiền đề, ai biết gì, lineage, consent, checkpoint, fallback và callback
   về sau. Phân biệt quan sát vật với evidence đã được model cấp.
3. Nếu là thiết kế chưa triển khai, ghi rõ trạng thái. Nếu được giao triển khai,
   cập nhật contract/content/model/UI/restore và server validator bị ảnh hưởng.
4. Chạy checks từ tuyến `content`; kiểm browser khi đổi thao tác/scene. Thiết kế
   đúng JSON không chứng minh level, nhịp truyện hoặc thời lượng đã chơi được.
5. Cập nhật đúng Bible/contract sở hữu và STATUS nếu khoảng cách thay đổi. Không
   cần tạo thêm một “Bible mới” hay bản báo cáo cho từng tác vụ.

<a id="derived"></a>
## Tra runtime và nghiên cứu theo nhu cầu

Atlas encounter và bảng triển khai cảnh được tạo khi cần bằng
`node tools/build-depth-atlas.cjs` / `node tools/build-craft-dossier.cjs` vào
`outputs/reference/`. Chúng là hình chiếu của code, không phải nguồn luật thứ hai.
Các tool vẫn cập nhật hai contract sinh tương ứng để kiểm đối chiếu.

Nghiên cứu thị giác/điều khiển ở hồ sơ 14-input và nguồn 10 chỉ cung cấp luận cứ;
thông số camera hiện tại lấy từ engine. Các snapshot trong archive và lịch sử Git
không được dùng để ghi đè hồ sơ đang sở hữu nội dung.
