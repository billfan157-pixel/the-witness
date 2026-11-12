# Hợp đồng sản phẩm

<a id="identity"></a>
## Bản sắc

**UNSEALED WITNESS: Legacy of the Covenant — Chứng Nhân: Di Sản Giao Ước** là
game một người chơi, thám hiểm và điều tra có trục Kinh Thánh. Thế giới hư cấu
thế kỷ I nối ba Legends bắt buộc L01/Xh 14, L02/1 Sm 24, L04/Ga 21. L03/L05
và bốn Inner Veil là nhánh tự chọn. Mốc năm/địa điểm trong truyện là khung
sáng tác, không phải kết luận đã xác minh cho mọi biến cố Kinh Thánh.

Trải nghiệm ưu tiên: quan sát dấu vật chất → thử cách hiểu/cách làm → cùng người
khác thực hiện → bàn giao có điều kiện → nhìn thấy hệ quả. Chiều sâu phải nằm
ở hành động và phản hồi trong thế giới, không chỉ ở văn bản giải thích.

<a id="invariants"></a>
## Những điều phải bảo toàn

1. Người chơi không viết lại kết cục canon, không chế lời Đức Giêsu, không biến
   phép lạ thành mana/kỹ năng và không chấm điểm ơn cứu độ.
2. Mortal giữ hành động vật chất, điều tra, quan hệ và consent. Legends giữ trải
   nghiệm nguồn/receipt; Veil là ẩn dụ có nhãn. Không truyền evidence, inventory,
   guilt hoặc consent từ Legends/Veil sang Mortal.
3. Ba Legends bắt buộc có thứ tự/core/commit. Chơi và tóm tắt đủ core có cùng
   quyền mở cổng; chọn định dạng hoặc thoát chưa hoàn tất không cấp chứng nhận.
   Phản tư có thể trống; không quiz đức tin hoặc yêu cầu đọc đủ số giây.
4. Một lời chứng chỉ được dùng trong phạm vi người ấy biết và cho phép. Bản sao
   không thành nguồn độc lập; sửa sai phải giữ lịch sử và trách nhiệm.
5. Có tuyến tương tác có thể chơi được và cách tiếp cận thay thế phù hợp. Không
   dùng camera quảng bá, teleport hay cờ hoàn tất để thay việc đi/làm thật.
6. Save cũ, lựa chọn và bản dự phòng phải được bảo vệ khi thay nội dung/schema.

Nhãn nguồn: **[K]** bản văn; **[L]** lịch sử/khảo cổ có phạm vi; **[G]** giáo
huấn; **[H]** sáng tác; **[C]** chưa xác minh. Quy trình xác minh/biên dịch nguồn
chi tiết ở [08](the-witness/08-scripture-reference.md) và
[15](the-witness/15-source-world-packets.md).

<a id="scope"></a>
## Phạm vi và thiết kế chi tiết

Runtime hiện khai báo 12 Q, 5 Legends, 4 Veil, 6 quest quan hệ; code/contract
quyết định ID và gate đang dùng, không lấy con số tóm tắt ở đây làm validator.
Thiết kế hệ thống chi tiết ở [GDD](the-witness/02-game-design-document.md);
truyện và chapter ở [STORY](STORY.md). Các đoạn v6 là đích thiết kế cần theo dõi
phần đã triển khai; việc tái cấu trúc tài liệu không phê duyệt tính năng mới.

Q01 là cảnh môi trường bắt buộc; L04 mở rộng sau chất lượng Q01. AI đảm nhận
sản xuất theo phạm vi được giao. Không tự khóa lịch tám tuần, chuyển engine,
mở rộng world hoặc tuyên bố chất lượng AAA từ mô tả thiết kế.

Thời lượng chưa được đo bằng playtest. GDD sở hữu đích biên tập v6; hợp đồng
giữ baseline v3 để đối chiếu (A08 trong STATUS). Không dùng baseline thay đích
thiết kế hoặc dùng bất kỳ dự toán nào làm cam kết phát hành.

<a id="acceptance"></a>
## Điều kiện nhận một thay đổi sản phẩm

Chỉ chuyển thành implemented khi có hành vi/code và phép kiểm tương ứng; verified
phải nêu scope/build/môi trường. Nghiệm thu mỹ thuật, chuyên môn, người chơi thật
và production là các xác nhận riêng. Khi thay bất biến hoặc phạm vi đã chốt,
ghi quyết định cùng lý do và nguồn bị thay ở STATUS, rồi đồng bộ consumer.
