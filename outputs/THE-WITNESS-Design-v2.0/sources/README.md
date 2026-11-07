# THE WITNESS — Legacy of the Covenant
## Chứng Nhân: Di Sản Giao Ước

“Across the ages, every life bears witness.”  
Qua các thời đại, mỗi cuộc đời đều để lại một lời chứng.

**Bộ hồ sơ tiền sản xuất v2.0 • 07/11/2026 • Ngôn ngữ gốc: tiếng Việt**

Đây là thiết kế đề xuất cho hướng phát triển mới do chủ dự án xác lập: RPG phiêu lưu điện ảnh, khám phá lịch sử Kinh Thánh, nhập vai nhiều nhân vật và trải nghiệm siêu nhiên. Ba tầng THE MORTAL WORLD, LEGENDS OF SCRIPTURE và THE INNER VEIL là yêu cầu đã xác nhận. V2 tiếp tục phương án v1 bằng cấu trúc cảnh, quan hệ và hệ quả xuyên 12 chương; các quyết định về thời đại, nhân vật hư cấu, cơ chế, quy mô và nền tảng vẫn cần thử qua prototype, chưa phải mọi chi tiết đã được chủ dự án duyệt.

**Tầm nhìn AAA là đích chất lượng và quy mô dài hạn.** Bộ hồ sơ này không chứng minh đã có đội ngũ, ngân sách, công nghệ hay chất lượng AAA. Sản phẩm hiện tại là nghiên cứu và tài liệu thiết kế, chưa phải bản game mới. Không đổi tên giao diện, sửa save, xóa bản cũ hoặc triển khai lại game trong đợt này.

## Đọc theo nhu cầu

1. [Tổng quan sáng tạo và nghiên cứu](01-vision-research.md): luận đề sản phẩm, so sánh tham chiếu, phương pháp và phát hiện.
2. [Game Design Document](02-game-design-document.md): vòng chơi, chiến đấu, điều tra, tiến triển, quan hệ, UI và phạm vi.
3. [Narrative Bible](03-narrative-bible.md): cốt truyện xuyên suốt, ba tầng, chủ đề, hồi, nhánh và kết thúc.
4. [World Bible](04-world-bible.md): địa lý, thời đại, đời sống, văn hóa, mỹ thuật và âm thanh.
5. [Character Bible](05-character-bible.md): nhân vật trung tâm, bạn đồng hành, đối trọng và các vai Kinh Thánh.
6. [Chiến dịch và thiết kế nhiệm vụ](06-campaign-quest-bible.md): 12 nhiệm vụ chính, 5 Legends, 4 Veil và nhiệm vụ quan hệ.
7. [Kịch bản vertical slice](07-vertical-slice-screenplay.md): mẫu chơi 55–70 phút, lời thoại gốc, blocking, nhánh và điều kiện.
8. [Kinh Thánh và quy tắc chuyển thể](08-scripture-reference.md): ma trận phân đoạn, điều bất biến, quyền chủ động và giới hạn.
9. [Sản xuất và kiến trúc hệ thống](09-production-technical-plan.md): cổng chất lượng, backlog, save, pipeline và rủi ro.
10. [Nguồn nghiên cứu và sổ luận cứ](10-source-register.md): nguồn sơ cấp, mức xác minh, giới hạn, các việc cần nghiên cứu tiếp.
11. [Đặc tả dữ liệu mẫu](design-contract.json): hợp đồng trạng thái để đội kỹ thuật triển khai thử.
12. [Hồ sơ chiều sâu 12 chương](11-chapter-dossiers.md): động cơ, chuỗi cảnh, lối giải, khoảng yên, callback và tiêu chí dựng thử từng chương.
13. [Sự thật nền và continuity](12-continuity-and-state.md): vụ hàng thực sự xảy ra thế nào, ai biết gì, phạm vi lời chứng và chuỗi hệ quả.
14. [Hợp đồng campaign](campaign-contract.json): 12 Q, các route, cổng commit và callback ở dạng dữ liệu thiết kế.

**Bản đọc liền mạch:** `THE-WITNESS-Design-Compendium.html` trong thư mục đầu ra; có mục lục, tìm kiếm và chế độ in. Markdown là nguồn biên tập chính. Số phiên bản này áp dụng cho cả bộ.

## Quy tắc dùng hồ sơ

- **[K]**: dữ kiện được bản văn Kinh Thánh nêu; không đồng nghĩa khảo cổ đã kiểm chứng độc lập.
- **[L]**: dữ kiện lịch sử/hiện vật có nguồn, phạm vi và niên đại xác định.
- **[G]**: giáo huấn hoặc nguyên tắc giải thích Công giáo có nguồn.
- **[H]**: sáng tác nhân vật, lời thoại, cơ chế hoặc bố cục nghệ thuật.
- **[C]**: giả thuyết còn cần kiểm tra; không dùng làm lời khẳng định trong codex phát hành.

Các mã S01…S29 dẫn đến nguồn trong hồ sơ 10. S22–S29 được tra cứu bổ sung trong đợt v2; các nguồn v1 giữ mức truy cập đã ghi, không giả định tất cả được đọc lại toàn văn. Những đề xuất thiết kế không mang mã nguồn là sáng tác [H], không phải kết luận của tài liệu tham khảo. Lời thoại trong kịch bản mẫu do dự án sáng tác; không trình bày như trích dẫn Kinh Thánh. Chưa sao chép bản dịch Kinh Thánh tiếng Việt để phát hành.

## Quyết định nền tảng v1

- Một nhân vật hư cấu có thể tùy biến, sống trong một thời đại; không luân hồi và không du hành thời gian.
- Thế giới chính đặt khoảng 58–60 CN ở Galilê, Giêrusalem và Xêdarê: **khung sáng tác dự kiến**, không chốt niên biểu mọi sự kiện Tân Ước.
- Năm chương Legends cho Môsê, Đavít, Giêrêmia, Phêrô, Phaolô là các phần chơi chuyển thể có khung bản văn riêng.
- Bốn chương Inner Veil là giấc mơ/ẩn dụ có nhãn rõ; không cung cấp bằng chứng điều tra, tiết lộ tương lai thật hay tạo học thuyết mới.
- Hậu quả làm thay đổi người và nơi hư cấu; kết cục các biến cố Kinh Thánh không do người chơi viết lại.
- Một game single-player theo vùng mở, tránh bắt đầu bằng bản đồ khổng lồ trải khắp các thiên niên kỷ.

## Phần phát triển thêm trong v2

- 12 chương có chuỗi cảnh và động từ chủ đạo khác nhau; lựa chọn thay việc phải làm, không chỉ câu đáp.
- Bốn companion có quan hệ với nhau, ba chặng phát triển và sáu quest quan hệ có hai cách tiếp cận/callback.
- Ba hub có bố cục công năng, dòng hàng/người/tin và dấu thay đổi khi trở lại.
- Vụ hàng có sự thật nền, mười nguồn chứng cứ, bốn claim và scope từng lời chứng; tách lô G17 khỏi B06.
- Năm Legends giữ văn cảnh đức tin riêng; bốn Veil khác ngữ pháp chơi, không giải hộ điều tra.
- Dữ liệu thiết kế, bản đọc HTML, nguồn Markdown và kiểm tra tài liệu được đóng cùng phiên bản. Đã chỉnh chỗ slice hé chữ ký quá sớm và bỏ cam kết thời lượng chưa có cơ sở.

**Thứ tự dùng khi có khác biệt:** hồ sơ 08 quyết định giới hạn chuyển thể; hồ sơ 12 quyết định sự thật/tri thức; hồ sơ 11 quyết định scene/route chi tiết; hồ sơ 02 quyết định luật hệ thống; 06 là chỉ mục, 07 là slice Q02. Không dùng quy tắc này để bỏ qua mâu thuẫn—phải sửa nguồn ngay khi phát hiện.

## Trạng thái chuyên môn

Đã nghiên cứu nguồn công khai và chuyển thành các quy tắc thiết kế có thể kiểm tra. Chưa có thẩm định của chuyên gia Kinh Thánh, khảo cổ, thần học, ngôn ngữ cổ hoặc pháp lý. V2 đủ cụ thể để chuẩn bị narrative greybox theo chương; chưa có toàn bộ lời thoại điều kiện, storyboard từng shot, asset packet đã duyệt hoặc kết quả playtest. Các nhánh và callback đang là đặc tả, chưa được triển khai vào game hiện tại. Bản xuất v1.0 được giữ riêng để đối chiếu.
