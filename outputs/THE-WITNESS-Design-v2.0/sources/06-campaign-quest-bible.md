# 06 • Chiến dịch và nhiệm vụ

## 1. Hợp đồng nhiệm vụ

Mỗi quest có ID bền, tiền điều kiện, trigger, objective, phương án giải, trạng thái kết, hệ quả, nguồn và đường phục hồi. “Người chơi chọn” chỉ có nghĩa khi thay việc có thể làm hoặc việc xảy ra tiếp. Tất cả Q/B là [H]. L/V dùng quy tắc nguồn của hồ sơ 08. Thời lượng là mục tiêu blockout, không phải kết quả playtest.

Mười hai nhiệm vụ chính là các cụm nhiều scene, không phải 12 cuộc nói chuyện. Mỗi cụm dự kiến 45–80 phút; GDD mục 16 cộng riêng phần liên vùng/L/V thành khung thử khoảng 13–22 giờ, chưa đo. **Revision 2:** [hồ sơ 11](11-chapter-dossiers.md) là nguồn scene/route chi tiết, [hồ sơ 12](12-continuity-and-state.md) là nguồn sự thật/tri thức. Các đoạn dưới đây là tóm tắt cần đọc cùng hai hồ sơ đó.

## 2. Hồi I

### Q01 — Bến không chờ người về

**Vào:** game mới, hoàn tất tạo nhân vật. **Mục tiêu:** nhận di vật từ Natan, giúp mở lối bị hàng chắn, tìm nơi ngủ. Tutorial đi/nhìn/tương tác trong một nhu cầu thật. **Hai cách:** dùng đòn bẩy theo nghề hoặc nhờ hai người cùng chuyển; không khóa tiến độ theo xuất thân. **Quyết định:** dành tiền cho chỗ ở hay đưa trước cho bữa chung; cả hai có nơi nghỉ cơ bản, nhưng tiện ích và người sẵn lòng giúp khác. **Ra:** `ledger.found=true`; mở Q02. Natan không đưa lời giải vụ án.

### Q02 — Những tên không được đọc

**Vào:** có sổ, đã gặp Miriam. **Mục tiêu:** xác minh một đường chuyển bao và bảo vệ Yosef. Tìm mép sổ bị sửa, xác nhận qua bữa chung và một người chuyển hàng. **Ba phương án kết:** di chuyển Yosef trước và giữ tên kín; nộp chứng cứ ẩn danh qua trung gian; xin Yosef đồng thuận nêu tên sau khi có bảo vệ. Không có lựa chọn tự gọi là “đúng”. **Hệ quả:** chỗ trú, lối vào kho và mức tin Miriam khác nhau. **Tầng:** L03, V01 trong slice. **Ra:** Q03 luôn mở; chất lượng lời chứng và nguồn tiếp cận khác nhau. Kịch bản ở hồ sơ 07.

### Q03 — Một bao thiếu, ba người nhớ

**Vào:** Q02 kết. **Mục tiêu:** đi tuyến ngoài thành, đối chiếu lượng xuất/nhận. **Gameplay:** theo dấu vật lý, sửa lối qua rãnh hoặc vòng đồi, gặp Amon. **Twist:** dấu vải cùng loại được dùng ở nhiều kho; không đủ buộc tội. **Chọn:** trả công Amon để xem sổ hoặc giúp sửa phương tiện và đợi. Một bên tốn nguồn, một bên tốn thời gian có báo trước. **Ra:** `evidence.route=verified`; nguồn người làm chứng có thể chưa chắc.

### Q04 — Đêm kho đóng cửa

**Vào:** đã biết tuyến chuyển. **Mục tiêu:** đưa thực phẩm hợp lệ ra khỏi kho trước đợt đóng đã thông báo. **Lối:** đàm phán với Mattai; sửa cổng phụ; chống nhóm cản đường để rút. **Chọn:** ưu tiên hàng hay dụng cụ cho chặng sau, không ép bỏ người bất lực. **Hệ quả:** kho bữa chung có nguồn dự phòng hoặc đội đi đường có dụng cụ; thiếu vẫn có đường thay. **Tầng:** L01, V02. **Ra:** trang ký thật của cha, mở hành trình Galilê; báo rõ đây là mốc thay hồi trước khi đi.

## 3. Hồi II

### Q05 — Lưới rách còn người vá

**Mục tiêu:** tìm người nhận hàng ở làng hư cấu Galilê. **Lối:** giúp vá lưới để được nghe, theo chứng từ hoặc hỏi người giữ bữa. **Chọn:** mời kiểm lượng công khai đúng phạm vi hay đối chiếu riêng; cố buộc tội người vá bao khi chưa đủ nguồn là hành động gây hại có nhánh sửa lời/đền công. **Ra:** biết Hanan kiểm soát một phần phân phối, chưa đủ chứng minh lệnh chuyển bốn bao hoặc mọi khoản thiếu do ông.

### Q06 — Chỗ đứng của lưỡi gậy

**Mục tiêu:** đối diện người từng đánh cha đang giữ một vật đối chiếu. **Lối:** trao đổi, tiếp cận kín lấy bản chà dấu hoặc tự vệ nếu bị gây hại. **Chọn chính:** giữ vật gốc với biên nhận hay làm bản sao có người chứng kiến; mất tiếp cận thì dựng lại từ nguồn thay. Trả đũa người đã hết đe dọa là tổn hại riêng, ảnh hưởng Damar/quyền gặp. **Tầng:** L02. **Ra:** vật hoặc nguồn đối chiếu còn đường tiếp tục; không thưởng bạo lực như đường nhanh sạch hậu quả.

### Q07 — Một lời hứa còn thiếu

**Mục tiêu:** thực hiện một lời hứa với companion trong khi nhóm cần lên đường. **Lối:** chia người có đồng thuận; chờ; nhờ người trong vùng với bảo đảm cụ thể. **Chọn:** tự mình giữ hứa hay thừa nhận không thể và thương lượng lại. **Hệ quả:** không chỉ điểm tin, mà companion có/không tham gia lối tiếp cận Q08. **Tầng:** L04 sau đổ vỡ hoặc cuộc nói thật; không buộc phải làm quan hệ rạn để mở chương.

### Q08 — Trang sổ trong nước

**Mục tiêu:** khủng hoảng đường đi khi nước dâng cắt lối và Amon mang bản phụ bị kẹt. **Lối:** neo dây đúng, nhờ hỗ trợ đã gây dựng, lối vòng an toàn. Chuẩn bị đủ cho phép cứu người lẫn giấy. **Chọn trong nhánh thiếu chuẩn bị:** bỏ túi giấy để cứu sớm hay kéo cả tải gây thương tích; không thưởng bỏ người lấy giấy. **Hệ quả:** `evidence.integrity=partial/full`, thương tích và cách tiếp cận nguồn sau; integrity không thay độ chắc của từng claim. **Tầng:** V03. **Ra:** đầu mối Giêrusalem đã được nghe/giữ khô, mọi route còn đường tiếp tục.

## 4. Hồi III

### Q09 — Quyền được im lặng

**Mục tiêu:** gặp các người có tên trong sổ. **Lối:** xin giới thiệu qua quan hệ, giúp công việc cộng đồng, trình bày bằng chứng đã ẩn tên. **Chọn:** chấp nhận một người từ chối hay ép bằng áp lực xã hội. **Hệ quả:** `consent` theo từng người, không có chỉ số đồng thuận chung thay quyền cá nhân. **Ra:** tập lời chứng có phạm vi, không phải danh sách mọi người đều ủng hộ.

### Q10 — Bản sao không nguyên vẹn

**Mục tiêu:** lấy bản đối chiếu của cha, xác định phần cha đã ký sai và phần bị vu cáo. **Gameplay:** đọc hai nguồn không trùng nhau, hỏi người giữ bản, bảo vệ cuộc gặp khỏi kẻ đe dọa hư cấu. **Chọn:** nói phần bất lợi về cha ngay với nhóm hay giấu rồi bị đối chiếu phát hiện. **Hệ quả:** độ tin đối với người chơi, phạm vi phát biểu có thể làm ở Q12. **Ra:** không thể dùng kết “cha hoàn toàn vô can”.

### Q11 — Những người cùng ở lại

**Mục tiêu:** trở về Xêdarê chuẩn bị lời chứng và bảo vệ người sẽ lên tiếng. **Lối:** phương án công khai, bảo mật hoặc di chuyển người trước; đều cần thực phẩm, nơi trú và nguồn đối chiếu phù hợp. **Tầng:** L05, V04. **Chọn:** đích chuẩn bị, đổi phương án còn được cho tới lúc chốt; UI nêu điều kiện và hậu quả đã biết. **Ra:** snapshot kế hoạch, lưu tay tự động trước point of no return.

### Q12 — Điều còn lại sau một lời nói

**Mục tiêu:** thực hiện kế hoạch Q11. **Gameplay:** sắp người, trao bản sao đúng đối tượng, giải tình huống gây áp lực; không thành một menu chọn ending. **Điều kiện:** chỉ nêu tên người đồng thuận và còn an toàn; chứng cứ thiếu thì giảm phạm vi cáo buộc. **Thất bại thao tác:** checkpoint, không âm thầm đổi sang kết “đã bán đứng mọi người”. **Ra:** một trong ba khung kết hồ sơ 03, biến thể bằng chứng và quan hệ; montage chỉ dùng sự kiện đã log.

## 5. Các chương Legends

- **L01 / Môsê / Xh 14,10–31 [S05]:** hướng dòng người, nhận chỉ dẫn, theo hành động giơ tay trong trình thuật; 18–25 phút. Phép lạ không do thanh mana. Cơ chế crowd là sáng tác, không biến số dân thành số liệu nguồn.
- **L02 / Đavít / 1 Sm 24 [S06]:** không gian hang, tiếp cận yên lặng, ngăn bạn đi cùng và bước ra đối diện; 15–20 phút. Không ghép lén trại và lấy giáo ở 1 Sm 26 vào cảnh này.
- **L03 / Giêrêmia / Gr 38,1–13 [S07]:** bị giới hạn cử động, nghe Ebed-melech, đệm vải và phối hợp kéo; 8–12 phút. Chỉ rút đoạn này làm slice; toàn chương mở rộng 15–20 phút nếu được duyệt.
- **L04 / Phêrô / Ga 21,1–19 [S09]:** thao tác ngư cụ đơn giản và đối thoại có khoảng lắng; 15–20 phút. Không cho chấm điểm tình yêu bằng nút trả lời đúng.
- **L05 / Phaolô / Cv 16,22–40 [S11]:** nghe người cùng tù, ở lại sau biến cố và lên tiếng ngăn người cai ngục tự hại; 15–20 phút. Không dùng QTE cầu nguyện để kích hoạt động đất.

## 6. Inner Veil

- **V01 — Hố của những cái tên:** sau L03, 5–7 phút. Đặt mảnh ghi xuống để mở lối cho hình người không tên; ép đọc mọi tên làm căn phòng chật hơn. Không có người thật bị giấc mơ quyết định số phận.
- **V02 — Biển không bờ:** sau Q04, 7–10 phút. Chia tải giữa các bệ khiến lối hiện; bỏ qua puzzle có tóm tắt, không thưởng thua.
- **V03 — Những mặt nạ giữ kho:** sau Q08, 7–10 phút. Chọn bỏ quyền điều khiển một hình nhân để cửa mở; không suy diễn thành giáo lý về tự do.
- **V04 — Chiếc ghế trống:** sau chuẩn bị Q11, 5–8 phút. Người chơi tự chọn câu mình sẵn lòng nhận trách nhiệm, hoặc chưa nói. Không phải cuộc gọi với linh hồn cha.

## 7. Sáu nhiệm vụ quan hệ

**B01** Miriam và món đồ gia đình; **B02** Damar và giới hạn được người bị hại đặt ra; **B03** Lea và tên đã xóa; **B04** Titus và người học việc; **B05** Natan và lời hứa với cha; **B06** Rina và cách phân bữa khi phần ăn thiếu. B01–B04 theo hồ sơ nhân vật. B05 mở một bản nhớ khác về cha, không chứng cứ toàn tri. B06 chọn cách ưu tiên minh bạch và mời cộng đồng cùng chịu trách nhiệm; không puzzle tối ưu giá trị một mạng người.

Mỗi B có tối thiểu hai cách tiếp cận và một hậu quả ở hub hoặc nhiệm vụ chính. Bỏ qua B không khóa kết thúc tuyến chính, nhưng làm mất nguồn hỗ trợ cụ thể. Không có romance hoặc thu thập quà tăng tin vô hạn trong phạm vi v1.

## 8. Quy tắc QA nhánh

Mỗi quest kiểm tra: không companion; chứng cứ thiếu; đã mất tiền; chọn ngược lời khuyên; bỏ qua L/V; load trước/sau quyết định; dùng hỗ trợ tiếp cận. Một thông tin quan trọng không chỉ nằm trong lời thoại có thể bị bỏ lỡ. Khi NPC từ chối, journal ghi việc cần làm tiếp có thể hiểu được. Một nhánh hội tụ phải giữ biến và callback, không reset mọi lựa chọn về cùng trạng thái.
