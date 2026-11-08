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

## 5. Các chương Legends: Nhân vật Thánh và Cơ chế Thám hiểm

Mỗi chương Legends là một không gian thám hiểm cô đọng, mật độ cao (40–60 phút tương tác), nơi người chơi nhập vai một **Nhân Chứng Vô Danh** đồng hành sát cánh bên các bậc thánh nhân mà không làm xáo trộn bản văn Kinh Thánh (Canon Lock 100%):

- **L01 / Môsê / Xuất Hành 14,1–31 [S05] (Trục bắt buộc Hồi I):**
  * *Thời lượng:* 50–60 phút tương tác hoặc khoảng 8 phút tóm tắt. Cổng Q03 $\rightarrow$ Q04. Sáu nhịp cốt lõi B01–B06.
  * *Vai điều khiển:* **Người Hộ Vệ Khóa Đuôi** (Caravan Rearguard Defender). Môsê đứng ở tiền phương theo lệnh Chúa giơ gậy rẽ biển.
  * *Cơ chế đặc thù (Caravan Cohesion & Terrain Reading):* Đọc hướng gió đông và dấu chân bãi triều; dùng kỹ năng *Thủ công* kích bánh xe lún bùn và lát ván qua sình lầy; dùng đèn bão duy trì liên lạc; dùng *Tự vệ* ngăn gia súc hoảng loạn dẫm đạp người già/trẻ nhỏ.
- **L02 / Đavít / 1 Samuel 24 [S06] (Trục bắt buộc Hồi II):**
  * *Thời lượng:* 45–50 phút tương tác hoặc khoảng 7 phút tóm tắt. Cổng Q06 $\rightarrow$ Q07. Năm nhịp cốt lõi B01–B05.
  * *Vai điều khiển:* **Người Trinh Sát Đội Đavít** (En Gedi Cave Scout). Đavít ở trung tâm biến cố cắt vạt áo Saun và kiềm chế không hại vua.
  * *Cơ chế đặc thù (Acoustic Stealth & Group Restraint):* Khảo sát vách đá hiểm trở [En Gedi](https://static.parks.org.il/wp-content/uploads/2022/12/engedi-eng.pdf); đọc tiếng bước chân vọng trong hang tối; di chuyển lén lút tiếp cận thì thầm và giữ chặt tay kiếm của đồng đội nóng giận; hộ tống Đavít bước ra ánh sáng đối thoại công chính với Saun.
- **L03 / Giêrêmia / Gr 38,1–13 [S07] (Tự chọn Hồi I):**
  * *Thời lượng:* 18 phút tương tác hoặc khoảng 4 phút tóm tắt. Độc lập, không chặn cổng chính. Giữ Ebed-melech và hành động đặt giẻ rách lót nách kéo ngôn sứ khỏi bùn lầy giếng cạn.
- **L04 / Phêrô / Gioan 21,1–19 [S09] (Trục bắt buộc Hồi III):**
  * *Thời lượng:* 40–45 phút tương tác hoặc khoảng 8 phút tóm tắt. Cổng Q10 $\rightarrow$ Q11. Năm nhịp cốt lõi B01–B05.
  * *Vai điều khiển:* **Người Phụ Lưới Hồ Galilê** (Galilean Boat-hand). Chúa Giêsu Phục Sinh và Phêrô hiện diện chuẩn mực theo Phúc Âm.
  * *Cơ chế đặc thù (Seamanship & Relational Observation):* Thao tác trên thuyền hư cấu có tham chiếu vật thể [Ginosar](https://yigal-allon-centre.org.il/en/the-museum/the-ancient-boat/); điều phối nhịp chèo đôi; gỡ mép lưới và giữ dây khỏi lối chân trong đêm lạnh [H]; bản văn không xác định cấu tạo lưới; trải nghiệm khoảng lặng tâm lý sau cuộc khổ nạn; phối hợp kéo mẻ lưới 153 con cá lớn rạng đông và phụ việc bên bếp than hồng.
- **L05 / Phaolô / Cv 16,22–40 [S11] (Tự chọn Hồi III):**
  * *Thời lượng:* 24 phút tương tác hoặc khoảng 4 phút tóm tắt. Giữ trọn bối cảnh ngục Philipphê, động đất lúc nửa đêm, ngăn viên cai ngục tự sát và lời công bố tin mừng.

## 6. Inner Veil

- **V01 — Hố của những cái tên:** sau Q02, mục tiêu 8 phút, độc lập với việc có vào L03. Đặt trang để mở lối; không quyết định số phận người thật.
- **V02 — Biển không bờ:** sau Q04, 10 phút. Chia tải, có thể bỏ hẳn; không thay L01.
- **V03 — Những mặt nạ giữ kho:** sau Q08, 8 phút. Thay cách điều khiển hình nhân, không xác định thủ phạm.
- **V04 — Chiếc ghế trống:** sau chuẩn bị Q11, 10 phút. Câu hỏi tự chọn/để trống, không gọi linh hồn cha. Cả bốn V đều là giấc mơ hư cấu tự chọn, phản ánh nội tâm nhân vật Người Chứng.

## 7. Sáu nhiệm vụ quan hệ

**B01** Miriam và món đồ gia đình; **B02** Damar và giới hạn được người bị hại đặt ra; **B03** Lea và tên đã xóa; **B04** Titus và người học việc; **B05** Natan và lời hứa với cha; **B06** Rina và cách phân bữa khi phần ăn thiếu. B01–B04 theo hồ sơ nhân vật. B05 mở một bản nhớ khác về cha, không chứng cứ toàn tri. B06 chọn cách ưu tiên minh bạch và mời cộng đồng cùng chịu trách nhiệm; không puzzle tối ưu giá trị một mạng người.

Mỗi B có tối thiểu hai cách tiếp cận và một hậu quả ở hub hoặc nhiệm vụ chính. Bỏ qua B không khóa kết thúc tuyến chính, nhưng làm mất nguồn hỗ trợ cụ thể.

## 8. Quy tắc QA nhánh

Mỗi quest kiểm tra vắng companion, thiếu tiền/chứng cứ, chọn ngược lời khuyên, load/replay và hỗ trợ. Kiểm riêng **tóm tắt đủ chương bắt buộc**, **thoát giữa chương giữ cổng**, **bỏ L/V tự chọn không phạt ending**. Không có ca bỏ trắng tất cả L vẫn kết campaign. Khi NPC từ chối, journal ghi bước tiếp làm được. Hội tụ giữ biến/callback, không reset lịch sử.

## 9. Phụ lục tích hợp — Sự thật nền (T01–T08) và Sổ chứng cứ (E01–E10 / P01–P04)

### 9.1. Tám sự thật nền (Ground Truths T01–T08)
- **T01:** Lô hàng `G17` rời kho Xêdarê với 24 bao. 2 bao bị hỏng trên đường Amon vận chuyển (có biên bản riêng); 18 bao đến điểm chia bữa tại Galilê; 4 bao còn lại bị chuyển vào sân phụ do Hanan kiểm soát ($24 = 2 + 18 + 4$).
- **T02:** Haddai (cha của nhân vật chính) đã ký trước biên nhận "đã nhận đủ tại điểm chia" khi hàng chưa tới nơi nhằm giữ lời cam kết cung cấp bữa ăn không bị gián đoạn. Đây là lỗi nghiệp vụ thực tế của ông.
- **T03:** Hanan là người trực tiếp chỉ dẫn chuyển 4 bao vào sân phụ để tích trữ và kiểm soát nguồn cung, đồng thời lợi dụng chữ ký trước của Haddai để đổ toàn bộ trách nhiệm mất 6 bao lên ông.
- **T04:** Khi phát hiện sai lệch, Haddai đã soạn bản sửa tự nhận lỗi ký trước và gửi tới một người giữ giấy ở Giêrusalem, nhưng bản sửa chưa kịp đến tay những người có trách nhiệm thì ông lâm bệnh mất.
- **T05:** Nhân vật chính (Người Chứng) từng chứng kiến việc chưa kiểm đủ hàng nhưng đã giữ im lặng vì sợ mất việc làm.
- **T06:** Natan (thợ đóng thuyền) giữ sổ hộ gia đình và bìa có biên nhận gốc, giao sổ ở Q01 và giao bản gốc ở Q04.
- **T07:** Sự cố thiếu 2 bao bữa chung tại Xêdarê (`B06` trong Q02) là sự việc xảy ra ở hiện tại, cho thấy quy trình sửa sổ để trục lợi vẫn đang tiếp diễn.
- **T08:** Điểm lưu giữ bản sửa là Giêrusalem; người giữ sân Galilê chỉ nhận 18 bao; Rina ở Xêdarê chỉ làm chứng cho đợt B06 mà bà trực tiếp trải qua.

### 9.2. Mười nguồn chứng cứ độc lập (Evidences E01–E10)
| Mã | Nguồn thu thập | Dữ kiện xác nhận được | Giới hạn chứng minh |
|---|---|---|---|
| **E01** | Biên nhận gốc G17 (Natan/Q04) | Haddai thực sự đã ký nhận đủ 24 bao | Chưa chứng minh ông chiếm đoạt hay cất giấu 4 bao |
| **E02** | Mép sổ sửa B06 (Q02) | Tồn tại lớp cạo mực sửa số lượng | Chưa xác định ai là người sửa và động cơ |
| **E03** | Lời chứng của Rina (Q02) | Lượng thực nhận tại bến Xêdarê không khớp sổ | Chưa chứng minh ai ra lệnh chuyển hàng |
| **E04** | Ghi chép xuất/hỏng của Amon (Q03) | 24 bao rời bến; 2 bao hỏng trên đường | Không biết các điểm dừng rẽ nhánh sau đó |
| **E05** | Biên nhận tại điểm chia Galilê (Q05) | 18 bao thực phẩm đã đến điểm chia | Chưa biết ai đứng sau sân phụ |
| **E06** | Thẻ kho 4 bao tại sân phụ (Q06) | 4 bao G17 thực tế được đưa vào sân phụ | Dấu niêm phong chung chưa đủ quy kết Hanan |
| **E07** | Bản phụ phục hồi từ nước (Q08) | Các chi tiết giao nhận còn đọc được | Chỗ nhòe mực không được suy diễn chủ quan |
| **E08** | Bản sửa của Haddai tại Giêrusalem (Q10) | Haddai tự nhận lỗi ký trước và đề nghị đối chiếu | Lời tự thuật cần đối chiếu với các nguồn khác |
| **E09** | Lời chứng người trực tiếp nhận lệnh (Q09) | Lệnh chuyển hàng họ nghe thấy (tùy scope) | Điều họ không trực tiếp chứng kiến |
| **E10** | Sổ bàn giao ca của Mattai (Q11) | Chỉ dẫn mở kho của Hanan trong ca trực | Cần kết hợp đối chiếu với E06/E09 |

### 9.3. Bốn mệnh đề kết luận (Claims P01–P04)
- **P01 — B06 không khớp:** Yêu cầu `E02` + `E03`. Kết luận số lượng bữa chung bị hụt do can thiệp sổ sách; không quy chụp cho vụ G17.
- **P02 — G17 thiếu 4 bao chưa được giải trình tại điểm chia:** Yêu cầu `E04` + `E05`. Tách riêng 2 bao hỏng do vận chuyển khỏi 4 bao bị chuyển lệch.
- **P03 — Haddai chịu trách nhiệm việc ký trước, không có căn cứ nói ông lấy 4 bao:** Yêu cầu `E01` + `E08` đối chiếu với `E04`/`E05`.
- **P04 — Hanan chỉ dẫn chuyển 4 bao ngoài danh sách phân phối:** Yêu cầu `E06` kết hợp nguồn độc lập `E09` hoặc `E10`, trên nền tảng `E04`/`E05`. Nếu chưa đủ nguồn độc lập thứ hai, chỉ được nêu nghi vấn, không được khẳng định tuyệt đối.
