# THE WITNESS — Legacy of the Covenant

> **Chỉ mục hồ sơ chi tiết.** Nguồn điều hành và quyền sở hữu hiện tại ở [docs/README](../README.md); chỉ tra các Bible bên dưới khi task route yêu cầu. Các mô tả phiên bản cũ không tự xác nhận runtime hiện tại.


**AI agent:** bắt đầu ở `AGENTS.md`, `docs/README.md` và
`docs/STATUS.md` từ gốc repository trước khi sửa hồ sơ.
Markdown và contracts bên dưới giữ quyền sở hữu theo miền; bản xuất HTML/DOCX
không là nguồn biên tập song song.

## Chứng Nhân: Di Sản Giao Ước

“Across the ages, every life bears witness.”  
Qua các thời đại, mỗi cuộc đời đều để lại một lời chứng.

**Bộ hồ sơ trục v3.0 + phụ lục chiều sâu v3.2 • 08/11/2026 • Ngôn ngữ gốc: tiếng Việt**

**Legends là xương sống; nội dung Kinh Thánh là cốt truyện chính; thám hiểm là lối chơi chủ đạo.** V3 sửa hướng v2 theo quyết định của chủ dự án: ba hồi có L01 Môsê, L02 Đavít, L04 Phêrô bắt buộc, khoảng 30% thời lượng tuyến chuẩn. Mortal World nối các chương qua người kể, phản tư và hành động đời thường; Veil và hai Legend mở rộng vẫn tự chọn. Đọc [pitch/bất biến một trang](../PRODUCT.md) trước các bible.

**Tầm nhìn AAA là đích chất lượng dài hạn.** Bộ hồ sơ không chứng minh đã có đội ngũ/ngân sách/chất lượng ấy. 0.1.0 là baseline v2; prototype 0.2.0 đã triển khai core/cổng v3, đã qua kiểm model/UI trước đóng gói. Chưa hoàn thành thời lượng, level art/cinematic và thẩm định của hồ sơ. Bộ v1/v2 và dữ liệu chơi cũ được giữ riêng.

## Chiều sâu 3.2 đang triển khai

Bản chơi 0.5.0 có 31 phần việc trực tiếp tại hiện trường, gồm 25 tình huống chương và sáu việc quan hệ; 44 chi tiết 3D tại 27 chủ cảnh. Luật thử/sửa, bản nháp được giữ và sổ ghi đúng phương án đã bàn giao. Bảng đối chiếu là cách chơi thay thế có cùng quyền hoàn tất. Phụ lục không thay mã nguồn truyện hoặc nhận đã đạt ngân sách thời lượng. Đọc [16 • Nghiên cứu](10-source-register.md), [17 • Atlas luật chương](../STORY.md), [18 • Chi tiết cảnh và thoại](18-scene-craft-and-dialogue.md), [19 • Protocol người chơi thật](19-depth-playtest.md), [20 • Thực thi từng cảnh](../STORY.md). [Hợp đồng chiều sâu](depth-contract.json) và [hợp đồng dàn dựng](craft-contract.json) ghi danh mục runtime. Kịch bản 18 giữ mốc nền 0.4.0; hồ sơ 20 ghi phần đã dựng tiếp và giới hạn còn lại.

## Đọc theo nhu cầu

Tài khoản, database và đồng bộ tiến trình dùng [23 • Backend và bản lưu đám mây](23-backend-and-cloud-saves.md), gồm API, chính sách lưu, quy trình khôi phục và giới hạn kiểm chứng của bản 0.7.0.

Phát triển môi trường dùng [lộ trình hiện hành](../environment-kit/roadmap.md),
[tiêu chuẩn](../environment-kit/standards.md), [Look Bible](../environment-kit/look-bible.md)
và trạng thái cổng trong `../environment-kit/progress.json`. Q01 bắt buộc, L04
mở rộng; AI thực hiện build và nghiệm thu theo chất lượng.

1. [Tổng quan sáng tạo và nghiên cứu](10-source-register.md): luận đề sản phẩm, so sánh tham chiếu, phương pháp và phát hiện.
2. [Game Design Document](02-game-design-document.md): vòng chơi, chiến đấu, điều tra, tiến triển, quan hệ, UI và phạm vi.
3. [Narrative Bible](03-narrative-bible.md): Kịch bản tổng hợp & Scene Bible v6.0 (cốt truyện xuyên suốt, ba tầng, chủ đề, hồi, nhánh, kết thúc và đặc tả scene systems).
4. [World Bible](04-world-bible.md): địa lý, thời đại, đời sống, văn hóa, mỹ thuật và âm thanh.
5. [Character Bible](05-character-bible.md): nhân vật trung tâm, bạn đồng hành, đối trọng, các vai Kinh Thánh và quy tắc tri thức v6.0.
6. [Chiến dịch và thiết kế nhiệm vụ](06-campaign-quest-bible.md): ba chương trục, 12 cầu nối, hai Legend mở rộng, bốn Veil, sáu quest quan hệ và tích hợp v6.0.
7. [Kịch bản vertical slice](07-vertical-slice-screenplay.md): kịch bản phân cảnh chi tiết Prologue Q01 (Beats 00–08), Chapter Q03 (Phân cảnh 01–05) và Legend L01 (Nhịp 01–05) chuẩn One-Shot Camera, khảo cổ hiện trường 3D và Canon Lock 100%.
8. [Kinh Thánh và quy tắc chuyển thể](08-scripture-reference.md): ma trận phân đoạn, điều bất biến, quyền chủ động và giới hạn.
9. [Sản xuất và kiến trúc hệ thống](../ENGINEERING.md): cổng chất lượng, backlog, save, pipeline và rủi ro.
10. [Nguồn nghiên cứu và sổ luận cứ](10-source-register.md): nguồn sơ cấp, mức xác minh, giới hạn, các việc cần nghiên cứu tiếp.
11. [Đặc tả dữ liệu mẫu](design-contract.json): hợp đồng trạng thái để đội kỹ thuật triển khai thử.
12. [Hồ sơ chiều sâu 12 chương](11-chapter-dossiers.md): động cơ, chuỗi cảnh, lối giải, khoảng yên, callback và tiêu chí dựng thử từng chương.
13. [Sự thật nền và continuity](12-continuity-and-state.md): vụ hàng thực sự xảy ra thế nào, ai biết gì, phạm vi lời chứng và chuỗi hệ quả.
14. [Hợp đồng campaign](campaign-contract.json): 12 Q, các route, cổng commit và callback ở dạng dữ liệu thiết kế.
15. [Pitch và bất biến](../PRODUCT.md): một trang quyết định hướng v3.
16. [Hồ sơ chiều sâu Legends](14-legends-depth-dossiers.md): ba chương, đồ thị thám hiểm, chuỗi cảnh, canon lock, hai định dạng và cầu nối.
17. [Packet nguồn, thế giới và duyệt](15-source-world-packets.md): sáu packet, 15 nhóm asset và bảy vị trí duyệt chưa phân công.
18. [Nghiên cứu chiều sâu](10-source-register.md): căn cứ chuyển thể và bảy họ cơ chế.
19. [Atlas tình huống chương](../STORY.md): 25 bộ luật, đầu vào, tiền đề và phương án.
20. [Dàn dựng và thoại](18-scene-craft-and-dialogue.md): chi tiết biên tập từ mốc nền 0.4.0.
21. [Protocol playtest chiều sâu](19-depth-playtest.md): tiêu chí đo bằng người chơi thật, chưa chạy.
22. [Thực thi từng cảnh](../STORY.md): hiện trường, 44 vật thể quan sát, sáu việc quan hệ, NPC và giới hạn 0.5.0.
23. [Backend và bản lưu đám mây](23-backend-and-cloud-saves.md): API, chính sách lưu, quy trình khôi phục và giới hạn kiểm chứng 0.7.0.
24. [Nghiên cứu điều khiển và UX](24-input-and-ux-research.md): nghiên cứu điều khiển góc nhìn thứ ba, phím bấm và trải nghiệm đa nền tảng.

**Bản đọc liền mạch:** `THE-WITNESS-Design-Compendium.html` trong thư mục đầu ra; có mục lục, tìm kiếm và chế độ in. Markdown là nguồn biên tập chính. Bản đọc được sinh khi cần bằng `tools/build-witness-docs.py` vào `outputs/THE-WITNESS-Design-v3.2/`, không được giữ như nguồn song song; hợp đồng trục vẫn revision 3.0 để giữ tương thích, phụ lục có revision 3.2.

## Quy tắc dùng hồ sơ

- **[K]**: dữ kiện được bản văn Kinh Thánh nêu; không đồng nghĩa khảo cổ đã kiểm chứng độc lập.
- **[L]**: dữ kiện lịch sử/hiện vật có nguồn, phạm vi và niên đại xác định.
- **[G]**: giáo huấn hoặc nguyên tắc giải thích Công giáo có nguồn.
- **[H]**: sáng tác nhân vật, lời thoại, cơ chế hoặc bố cục nghệ thuật.
- **[C]**: giả thuyết còn cần kiểm tra; không dùng làm lời khẳng định trong codex phát hành.

Các mã S01…S32 dẫn đến hồ sơ 10. V3 đọc lại ba pericope trục và bổ sung S30–S32 cho packet thế giới; không giả định mọi nguồn cũ đã được đọc lại. Những đề xuất không mang mã nguồn là [H]. Lời thoại mẫu hư cấu được phân biệt với placeholder câu nguồn. Chưa chọn/cấp phép bản dịch Kinh Thánh tiếng Việt để phát hành.

## Quyết định nền tảng còn giữ

- Một nhân vật hư cấu có thể tùy biến, sống trong một thời đại; không luân hồi và không du hành thời gian.
- Thế giới chính đặt khoảng 58–60 CN ở Galilê, Giêrusalem và Xêdarê: **khung sáng tác dự kiến**, không chốt niên biểu mọi sự kiện Tân Ước.
- Năm chương Legends cho Môsê, Đavít, Giêrêmia, Phêrô, Phaolô là các phần chơi chuyển thể có khung bản văn riêng.
- Bốn chương Inner Veil là giấc mơ/ẩn dụ có nhãn rõ; không cung cấp bằng chứng điều tra, tiết lộ tương lai thật hay tạo học thuyết mới.
- Hậu quả làm thay đổi người và nơi hư cấu; kết cục các biến cố Kinh Thánh không do người chơi viết lại.
- Một game single-player theo vùng mở, tránh bắt đầu bằng bản đồ khổng lồ trải khắp các thiên niên kỷ.

## Chiều sâu v2 được giữ và đặt lại vai trò

- 12 Q có chuỗi cảnh và động từ khác nhau; nay là cầu nối, với ngân sách rút gọn để nhường trọng tâm cho ba Legends.
- Bốn companion có quan hệ với nhau, ba chặng phát triển và sáu quest quan hệ có hai cách tiếp cận/callback.
- Ba hub có bố cục công năng, dòng hàng/người/tin và dấu thay đổi khi trở lại.
- Vụ hàng có sự thật nền, mười nguồn chứng cứ, bốn claim và scope từng lời chứng; tách lô G17 khỏi B06.
- Năm Legends giữ văn cảnh đức tin riêng; bốn Veil khác ngữ pháp chơi, không giải hộ điều tra.
- Dữ liệu thiết kế, bản đọc HTML, nguồn Markdown và kiểm tra tài liệu được đóng cùng phiên bản. Đã chỉnh chỗ slice hé chữ ký quá sớm và bỏ cam kết thời lượng chưa có cơ sở.

**Bất biến mới:** không bỏ trắng ba chương bắt buộc để đi tiếp. Chơi hoặc xem/nghe tóm tắt đủ beat đều mở cùng cổng; thoát/để sau giữ điểm dừng. Không yêu cầu câu trả lời tôn giáo hay thời gian đọc tối thiểu. Phản tư được để trống. Hoàn tất L được ghi tiến độ và ngữ cảnh, không tạo chứng cứ/đồng thuận/vật phẩm.

**Nguồn sở hữu quyết định:** PRODUCT cho định hướng sản phẩm và bất biến; 08/15 cho giới hạn nguồn; 14 cho scene Legends; 12 cho sự thật hư cấu; 11 cho scene cầu nối; 02 cho hệ thống; campaign-contract cho ID/cổng/phút; 07 cho slice rút gọn không ghi save campaign. Mâu thuẫn phải được sửa ở nguồn, không xử bằng một câu ghi đè cuối tài liệu.

## Trạng thái chuyên môn

Đã có nguồn công khai, sáu packet và tiêu chí dựng thử. Bảy vị trí duyệt đều **chưa phân công**, chưa có phê chuẩn chuyên môn hay playtest v3. Kiểm JSON/bản đọc chỉ kiểm thiết kế. Thời lượng 216/720 phút là khung trần hợp đồng kỹ thuật v3, 145/580 phút là đích nhịp độ biên kịch v6; cả hai chưa qua đo đạc playtest người thật. Kiểm chơi 0.1.0 trước đây không chứng minh các gate mới. Chưa khóa lời thu âm, tạo hình lịch sử, kinh phí hoặc ngày phát hành.
