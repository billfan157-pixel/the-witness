# THE WITNESS — Legacy of the Covenant
## Chứng Nhân: Di Sản Giao Ước

“Across the ages, every life bears witness.”  
Qua các thời đại, mỗi cuộc đời đều để lại một lời chứng.

**Bộ hồ sơ tiền sản xuất v3.0 • 07/11/2026 • Ngôn ngữ gốc: tiếng Việt**

**Legends là xương sống; nội dung Kinh Thánh là cốt truyện chính; thám hiểm là lối chơi chủ đạo.** V3 sửa hướng v2 theo quyết định của chủ dự án: ba hồi có L01 Môsê, L02 Đavít, L04 Phêrô bắt buộc, khoảng 30% thời lượng tuyến chuẩn. Mortal World nối các chương qua người kể, phản tư và hành động đời thường; Veil và hai Legend mở rộng vẫn tự chọn. Đọc [pitch/bất biến một trang](13-legends-spine-charter.md) trước các bible.

**Tầm nhìn AAA là đích chất lượng dài hạn.** Bộ hồ sơ không chứng minh đã có đội ngũ/ngân sách/chất lượng ấy. 0.1.0 là baseline v2; prototype 0.2.0 đã triển khai core/cổng v3, đã qua kiểm model/UI trước đóng gói. Chưa hoàn thành thời lượng, level art/cinematic và thẩm định của hồ sơ. Bộ v1/v2 và dữ liệu chơi cũ được giữ riêng.

## Đọc theo nhu cầu

1. [Tổng quan sáng tạo và nghiên cứu](01-vision-research.md): luận đề sản phẩm, so sánh tham chiếu, phương pháp và phát hiện.
2. [Game Design Document](02-game-design-document.md): vòng chơi, chiến đấu, điều tra, tiến triển, quan hệ, UI và phạm vi.
3. [Narrative Bible](03-narrative-bible.md): cốt truyện xuyên suốt, ba tầng, chủ đề, hồi, nhánh và kết thúc.
4. [World Bible](04-world-bible.md): địa lý, thời đại, đời sống, văn hóa, mỹ thuật và âm thanh.
5. [Character Bible](05-character-bible.md): nhân vật trung tâm, bạn đồng hành, đối trọng và các vai Kinh Thánh.
6. [Chiến dịch và thiết kế nhiệm vụ](06-campaign-quest-bible.md): ba chương trục, 12 cầu nối, hai Legend mở rộng, bốn Veil và sáu quest quan hệ.
7. [Kịch bản vertical slice](07-vertical-slice-screenplay.md): mẫu 90 phút lấy L01 làm lõi, đo “Legends là lõi hay phụ”.
8. [Kinh Thánh và quy tắc chuyển thể](08-scripture-reference.md): ma trận phân đoạn, điều bất biến, quyền chủ động và giới hạn.
9. [Sản xuất và kiến trúc hệ thống](09-production-technical-plan.md): cổng chất lượng, backlog, save, pipeline và rủi ro.
10. [Nguồn nghiên cứu và sổ luận cứ](10-source-register.md): nguồn sơ cấp, mức xác minh, giới hạn, các việc cần nghiên cứu tiếp.
11. [Đặc tả dữ liệu mẫu](design-contract.json): hợp đồng trạng thái để đội kỹ thuật triển khai thử.
12. [Hồ sơ chiều sâu 12 chương](11-chapter-dossiers.md): động cơ, chuỗi cảnh, lối giải, khoảng yên, callback và tiêu chí dựng thử từng chương.
13. [Sự thật nền và continuity](12-continuity-and-state.md): vụ hàng thực sự xảy ra thế nào, ai biết gì, phạm vi lời chứng và chuỗi hệ quả.
14. [Hợp đồng campaign](campaign-contract.json): 12 Q, các route, cổng commit và callback ở dạng dữ liệu thiết kế.
15. [Pitch và bất biến](13-legends-spine-charter.md): một trang quyết định hướng v3.
16. [Hồ sơ chiều sâu Legends](14-legends-depth-dossiers.md): ba chương, đồ thị thám hiểm, chuỗi cảnh, canon lock, hai định dạng và cầu nối.
17. [Packet nguồn, thế giới và duyệt](15-source-world-packets.md): sáu packet, 15 nhóm asset và bảy vị trí duyệt chưa phân công.

**Bản đọc liền mạch:** `THE-WITNESS-Design-Compendium.html` trong thư mục đầu ra; có mục lục, tìm kiếm và chế độ in. Markdown là nguồn biên tập chính. Số phiên bản này áp dụng cho cả bộ.

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

**Nguồn sở hữu quyết định:** 13 cho định hướng; 08/15 cho giới hạn nguồn; 14 cho scene Legends; 12 cho sự thật hư cấu; 11 cho scene cầu nối; 02 cho hệ thống; campaign-contract cho ID/cổng/phút; 07 cho slice rút gọn không ghi save campaign. Mâu thuẫn phải được sửa ở nguồn, không xử bằng một câu ghi đè cuối tài liệu.

## Trạng thái chuyên môn

Đã có nguồn công khai, sáu packet và tiêu chí dựng thử. Bảy vị trí duyệt đều **chưa phân công**, chưa có phê chuẩn chuyên môn hay playtest v3. Kiểm JSON/bản đọc chỉ kiểm thiết kế. Thời lượng 216/720 phút là mục tiêu, chưa đo. Kiểm chơi 0.1.0 trước đây không chứng minh các gate mới. Chưa khóa lời thu âm, tạo hình lịch sử, kinh phí hoặc ngày phát hành.
