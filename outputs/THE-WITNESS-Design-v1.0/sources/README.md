# THE WITNESS — Legacy of the Covenant
## Chứng Nhân: Di Sản Giao Ước

“Across the ages, every life bears witness.”  
Qua các thời đại, mỗi cuộc đời đều để lại một lời chứng.

**Bộ hồ sơ tiền sản xuất v1.0 • 07/11/2026 • Ngôn ngữ gốc: tiếng Việt**

Đây là thiết kế đề xuất cho hướng phát triển mới do chủ dự án xác lập: RPG phiêu lưu điện ảnh, khám phá lịch sử Kinh Thánh, nhập vai nhiều nhân vật và trải nghiệm siêu nhiên. Ba tầng THE MORTAL WORLD, LEGENDS OF SCRIPTURE và THE INNER VEIL là yêu cầu đã xác nhận. Các quyết định cụ thể về thời đại, nhân vật hư cấu, cơ chế, quy mô, nền tảng và cốt truyện dưới đây là phương án thiết kế v1, có thể điều chỉnh qua prototype; chúng chưa phải quyết định đã được chủ dự án duyệt.

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

**Bản đọc liền mạch:** `THE-WITNESS-Design-Compendium.html` trong thư mục đầu ra; có mục lục, tìm kiếm và chế độ in. Markdown là nguồn biên tập chính. Số phiên bản này áp dụng cho cả bộ.

## Quy tắc dùng hồ sơ

- **[K]**: dữ kiện được bản văn Kinh Thánh nêu; không đồng nghĩa khảo cổ đã kiểm chứng độc lập.
- **[L]**: dữ kiện lịch sử/hiện vật có nguồn, phạm vi và niên đại xác định.
- **[G]**: giáo huấn hoặc nguyên tắc giải thích Công giáo có nguồn.
- **[H]**: sáng tác nhân vật, lời thoại, cơ chế hoặc bố cục nghệ thuật.
- **[C]**: giả thuyết còn cần kiểm tra; không dùng làm lời khẳng định trong codex phát hành.

Các mã S01…S19 dẫn đến nguồn trong hồ sơ 10. Những đề xuất thiết kế không mang mã nguồn là sáng tác [H], không phải kết luận của tài liệu tham khảo. Lời thoại trong kịch bản mẫu do dự án sáng tác; không trình bày như trích dẫn Kinh Thánh. Chưa sao chép bản dịch Kinh Thánh tiếng Việt để phát hành.

## Quyết định nền tảng v1

- Một nhân vật hư cấu có thể tùy biến, sống trong một thời đại; không luân hồi và không du hành thời gian.
- Thế giới chính đặt khoảng 58–60 CN ở Galilê, Giêrusalem và Xêdarê: **khung sáng tác dự kiến**, không chốt niên biểu mọi sự kiện Tân Ước.
- Năm chương Legends cho Môsê, Đavít, Giêrêmia, Phêrô, Phaolô là các phần chơi chuyển thể có khung bản văn riêng.
- Bốn chương Inner Veil là giấc mơ/ẩn dụ có nhãn rõ; không cung cấp bằng chứng điều tra, tiết lộ tương lai thật hay tạo học thuyết mới.
- Hậu quả làm thay đổi người và nơi hư cấu; kết cục các biến cố Kinh Thánh không do người chơi viết lại.
- Một game single-player theo vùng mở, tránh bắt đầu bằng bản đồ khổng lồ trải khắp các thiên niên kỷ.

## Trạng thái chuyên môn

Đã nghiên cứu nguồn công khai và chuyển thành các quy tắc thiết kế có thể kiểm tra. Chưa có thẩm định của chuyên gia Kinh Thánh, khảo cổ, thần học, ngôn ngữ cổ hoặc pháp lý. Bản v1 đủ làm nền thảo luận và prototype; kịch bản sản xuất hoàn chỉnh cho mọi nhiệm vụ, storyboard từng shot, mọi hội thoại điều kiện và hồ sơ hiện vật từng asset thuộc giai đoạn tiếp theo, được ghi rõ trong kế hoạch sản xuất.
