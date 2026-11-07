# 06 • Chiến dịch và nhiệm vụ

## 1. Hợp đồng nhiệm vụ

Mỗi quest có ID bền, tiền điều kiện, trigger, objective, phương án giải, trạng thái kết, hệ quả, nguồn và đường phục hồi. “Người chơi chọn” chỉ có nghĩa khi thay việc có thể làm hoặc việc xảy ra tiếp. Tất cả Q/B là [H]. L/V dùng quy tắc nguồn của hồ sơ 08. Thời lượng là mục tiêu blockout, không phải kết quả playtest.

**V3:** ba Legend bắt buộc là trục; 12 Q là cầu nối nhiều scene, mục tiêu 26–40 phút/Q. [Hồ sơ 14](14-legends-depth-dossiers.md) sở hữu scene/level Legends, [hồ sơ 11](11-chapter-dossiers.md) sở hữu Q và [hồ sơ 12](12-continuity-and-state.md) sở hữu sự thật hư cấu. Tuyến mẫu 720 phút, Legends 216 phút; chưa đo. Không bỏ trắng L01/L02/L04 để đi tiếp.

| Hồi | Chuẩn bị | Legend bắt buộc / cổng | Tiếp nối | Mở rộng tự chọn |
|---|---|---|---|---|
| I | Q01–Q03 | L01 sau Q03, trước Q04 | Q04 | L03, V01, V02 |
| II | Q05–Q06 | L02 sau Q06, trước Q07 | Q07–Q08 | V03 |
| III | Q09–Q10 | L04 sau Q10, trước Q11 | Q11–Q12 | L05, V04 |

## 2. Hồi I

### Q01 — Bến không chờ người về

**Vào:** game mới, hoàn tất tạo nhân vật. **Mục tiêu:** nhận di vật từ Natan, giúp mở lối bị hàng chắn, tìm nơi ngủ. Tutorial đi/nhìn/tương tác trong một nhu cầu thật. **Hai cách:** dùng đòn bẩy theo nghề hoặc nhờ hai người cùng chuyển; không khóa tiến độ theo xuất thân. **Quyết định:** dành tiền cho chỗ ở hay đưa trước cho bữa chung; cả hai có nơi nghỉ cơ bản, nhưng tiện ích và người sẵn lòng giúp khác. **Ra:** `ledger.found=true`; mở Q02. Natan không đưa lời giải vụ án.

### Q02 — Những tên không được đọc

**Vào:** có sổ, đã gặp Miriam. **Mục tiêu:** xác minh một đường chuyển bao và bảo vệ Yosef. **Ba route:** `shelter`, `anonymous`, `consented`, với hành động/đồng thuận theo hồ sơ 11/12. **Tầng:** L03 và V01 tự chọn, không còn là lõi slice v3. **Ra:** Q03 luôn mở sau route hợp lệ; không hoàn thành thay L01. Contract Q02 tiếp tục giữ như mẫu consent, tách với slice L01 mới.

### Q03 — Một bao thiếu, ba người nhớ

**Vào:** Q02 kết. **Mục tiêu:** đi tuyến ngoài thành, đối chiếu lượng xuất/nhận. **Gameplay:** theo dấu vật lý, sửa lối qua rãnh hoặc vòng đồi, gặp Amon. **Twist:** dấu vải cùng loại được dùng ở nhiều kho; không đủ buộc tội. **Chọn:** trả công Amon để xem sổ hoặc giúp sửa phương tiện và đợi. Một bên tốn nguồn, một bên tốn thời gian có báo trước. **Ra:** `evidence.route=verified`; nguồn người làm chứng có thể chưa chắc.

### Q04 — Đêm kho đóng cửa

**Vào:** Q03 và L01 đã commit ở revision hiện hành. **Mục tiêu:** tiếp nối bằng khảo sát lối, kiểm người và bàn giao thực phẩm hợp lệ trước mốc đóng đã báo. **Lối:** trao đổi với Mattai, sửa then phụ hoặc dùng cầu đã sửa. **Chọn:** `food`/`tools` cho phần tải thêm. **Hệ quả:** chuẩn bị Q08/Q11; E01 có nguồn Mortal riêng. **Tầng:** V02 tự chọn; L01 đã ở trước Q04. **Ra:** đầu mối Galilê và cộng đồng được bàn giao.

## 3. Hồi II

### Q05 — Lưới rách còn người vá

**Mục tiêu:** tìm người nhận hàng ở làng hư cấu Galilê. **Lối:** giúp vá lưới để được nghe, theo chứng từ hoặc hỏi người giữ bữa. **Chọn:** mời kiểm lượng công khai đúng phạm vi hay đối chiếu riêng; cố buộc tội người vá bao khi chưa đủ nguồn là hành động gây hại có nhánh sửa lời/đền công. **Ra:** biết Hanan kiểm soát một phần phân phối, chưa đủ chứng minh lệnh chuyển bốn bao hoặc mọi khoản thiếu do ông.

### Q06 — Chỗ đứng của lưỡi gậy

**Mục tiêu:** đối diện người từng đánh cha đang giữ một vật đối chiếu. **Lối:** trao đổi, tiếp cận kín hoặc tự vệ nếu bị gây hại. **Chọn:** `take_original`/`witnessed_copy`/`reconstruct`. Trả đũa người hết đe dọa là tổn hại riêng. **Ra:** Q06 commit trước, sau đó L02 bắt buộc; đủ beat/phần kết mới mở Q07. L02 không xóa tổn hại Q06.

### Q07 — Một lời hứa còn thiếu

**Vào:** L02 đã commit. **Mục tiêu:** tiếp nối bằng một lời hứa có đối tượng/giới hạn thật. **Lối:** tự đi, thương lượng lại hoặc bàn giao có người đồng ý. **Hệ quả:** người nhận vai Q08/Q11. Không có L04 tại Q07 trong v3; Phêrô ở hồi III, không khóa theo đổ vỡ quan hệ.

### Q08 — Trang sổ trong nước

**Mục tiêu:** khủng hoảng đường đi khi nước dâng cắt lối và Amon mang bản phụ bị kẹt. **Lối:** neo dây đúng, nhờ hỗ trợ đã gây dựng, lối vòng an toàn. Chuẩn bị đủ cho phép cứu người lẫn giấy. **Chọn trong nhánh thiếu chuẩn bị:** bỏ túi giấy để cứu sớm hay kéo cả tải gây thương tích; không thưởng bỏ người lấy giấy. **Hệ quả:** `evidence.integrity=partial/full`, thương tích và cách tiếp cận nguồn sau; integrity không thay độ chắc của từng claim. **Tầng:** V03. **Ra:** đầu mối Giêrusalem đã được nghe/giữ khô, mọi route còn đường tiếp tục.

## 4. Hồi III

### Q09 — Quyền được im lặng

**Mục tiêu:** gặp các người có tên trong sổ. **Lối:** xin giới thiệu qua quan hệ, giúp công việc cộng đồng, trình bày bằng chứng đã ẩn tên. **Chọn:** chấp nhận một người từ chối hay ép bằng áp lực xã hội. **Hệ quả:** `consent` theo từng người, không có chỉ số đồng thuận chung thay quyền cá nhân. **Ra:** tập lời chứng có phạm vi, không phải danh sách mọi người đều ủng hộ.

### Q10 — Bản sao không nguyên vẹn

**Cổng sau Q10:** sau commit `disclose`/`conceal`/`corrected`, L04 mở qua người kể hoặc journal thay. Cần đủ nội dung nguồn bằng định dạng chọn trước Q11; không buộc avatar nhận lỗi hay tha thứ để vào Ga 21.

**Mục tiêu:** lấy bản đối chiếu của cha, xác định phần cha đã ký sai và phần bị vu cáo. **Gameplay:** đọc hai nguồn không trùng nhau, hỏi người giữ bản, bảo vệ cuộc gặp khỏi kẻ đe dọa hư cấu. **Chọn:** nói phần bất lợi về cha ngay với nhóm hay giấu rồi bị đối chiếu phát hiện. **Hệ quả:** độ tin đối với người chơi, phạm vi phát biểu có thể làm ở Q12. **Ra:** không thể dùng kết “cha hoàn toàn vô can”.

### Q11 — Những người cùng ở lại

**Mục tiêu:** trở về Xêdarê chuẩn bị lời chứng và bảo vệ người sẽ lên tiếng. **Lối:** phương án công khai, bảo mật hoặc di chuyển người trước; đều cần thực phẩm, nơi trú và nguồn đối chiếu phù hợp. **Tầng:** L05, V04. **Chọn:** đích chuẩn bị, đổi phương án còn được cho tới lúc chốt; UI nêu điều kiện và hậu quả đã biết. **Ra:** snapshot kế hoạch, lưu tay tự động trước point of no return.

### Q12 — Điều còn lại sau một lời nói

**Mục tiêu:** thực hiện kế hoạch Q11. **Gameplay:** sắp người, trao bản sao đúng đối tượng, giải tình huống gây áp lực; không thành một menu chọn ending. **Điều kiện:** chỉ nêu tên người đồng thuận và còn an toàn; chứng cứ thiếu thì giảm phạm vi cáo buộc. **Thất bại thao tác:** checkpoint, không âm thầm đổi sang kết “đã bán đứng mọi người”. **Ra:** một trong ba khung kết hồ sơ 03, biến thể bằng chứng và quan hệ; montage chỉ dùng sự kiện đã log.

## 5. Các chương Legends

- **L01 / Môsê / Xh 14,1–31 [S05] / bắt buộc hồi I:** 80 phút tương tác hoặc khoảng 8 phút tóm tắt; trại, bờ, tuyến vượt. Cổng Q03→Q04; sáu core beat.
- **L02 / Đavít / 1 Sm 24 [S06] / bắt buộc hồi II:** 70 hoặc khoảng 7 phút; khe đá, hang, quay về và bước ra. Cổng Q06→Q07; năm core beat, không ghép 1 Sm 26.
- **L03 / Giêrêmia / Gr 38,1–13 [S07] / tự chọn hồi I:** mục tiêu 18 phút, khoảng 4 phút tóm tắt hoặc bỏ hẳn. Giữ Ebed-melech và công việc nhận trợ giúp; không còn là chương lõi của slice v3.
- **L04 / Phêrô / Ga 21,1–19 [S09] / bắt buộc hồi III:** 66 hoặc khoảng 8 phút; thuyền, bờ, bữa ăn, trao việc. Cổng Q10→Q11; năm core beat, không chấm điểm tình yêu.
- **L05 / Phaolô / Cv 16,22–40 [S11] / tự chọn hồi III:** mục tiêu 24 phút, khoảng 4 phút tóm tắt hoặc bỏ hẳn. Giữ người cùng ở đó, phần sau biến cố và việc lên tiếng; không QTE tạo phép lạ.

## 6. Inner Veil

- **V01 — Hố của những cái tên:** sau Q02, mục tiêu 8 phút, độc lập với việc có vào L03. Đặt trang để mở lối; không quyết định số phận người thật.
- **V02 — Biển không bờ:** sau Q04, 10 phút. Chia tải, có thể bỏ hẳn; không thay L01.
- **V03 — Những mặt nạ giữ kho:** sau Q08, 8 phút. Thay cách điều khiển hình nhân, không xác định thủ phạm.
- **V04 — Chiếc ghế trống:** sau chuẩn bị Q11, 10 phút. Câu hỏi tự chọn/để trống, không gọi linh hồn cha. Cả bốn V đều là giấc mơ hư cấu tự chọn, chưa đo phút thực.

## 7. Sáu nhiệm vụ quan hệ

**B01** Miriam và món đồ gia đình; **B02** Damar và giới hạn được người bị hại đặt ra; **B03** Lea và tên đã xóa; **B04** Titus và người học việc; **B05** Natan và lời hứa với cha; **B06** Rina và cách phân bữa khi phần ăn thiếu. B01–B04 theo hồ sơ nhân vật. B05 mở một bản nhớ khác về cha, không chứng cứ toàn tri. B06 chọn cách ưu tiên minh bạch và mời cộng đồng cùng chịu trách nhiệm; không puzzle tối ưu giá trị một mạng người.

Mỗi B có tối thiểu hai cách tiếp cận và một hậu quả ở hub hoặc nhiệm vụ chính. Bỏ qua B không khóa kết thúc tuyến chính, nhưng làm mất nguồn hỗ trợ cụ thể. Không có romance hoặc thu thập quà tăng tin vô hạn trong phạm vi v1.

## 8. Quy tắc QA nhánh

Mỗi quest kiểm tra vắng companion, thiếu tiền/chứng cứ, chọn ngược lời khuyên, load/replay và hỗ trợ. Kiểm riêng **tóm tắt đủ chương bắt buộc**, **thoát giữa chương giữ cổng**, **bỏ L/V tự chọn không phạt ending**. Không có ca bỏ trắng tất cả L vẫn kết campaign. Khi NPC từ chối, journal ghi bước tiếp làm được. Hội tụ giữ biến/callback, không reset lịch sử.
