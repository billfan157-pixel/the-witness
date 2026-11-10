# 06 • Chiến dịch và nhiệm vụ

## 1. Hợp đồng nhiệm vụ

Mỗi quest có ID bền, tiền điều kiện, trigger, objective, phương án giải, trạng thái kết, hệ quả, nguồn và đường phục hồi. “Người chơi chọn” chỉ có nghĩa khi thay việc có thể làm hoặc việc xảy ra tiếp. Tất cả Q/B là [H]. L/V dùng quy tắc nguồn của hồ sơ 08. Thời lượng là mục tiêu blockout, không phải kết quả playtest.

**V3:** ba Legend bắt buộc là trục; 12 Q là cầu nối nhiều scene, mục tiêu 26–40 phút/Q. [Hồ sơ 14](14-legends-depth-dossiers.md) sở hữu scene/level Legends, [hồ sơ 11](11-chapter-dossiers.md) sở hữu Q và [hồ sơ 12](12-continuity-and-state.md) sở hữu sự thật hư cấu. Tuyến mẫu 720 phút, Legends 216 phút; chưa đo. Không bỏ trắng L01/L02/L04 để đi tiếp.

| Hồi | Chuẩn bị | Legend bắt buộc / cổng | Tiếp nối | Mở rộng tự chọn |
|---|---|---|---|---|
| I | Q01–Q03 | L01 sau Q03, trước Q04 | Q04 | L03, V01, V02 |
| II | Q05–Q06 | L02 sau Q06, trước Q07 | Q07–Q08 | V03 |
| III | Q09–Q10 | L04 sau Q10, trước Q11 | Q11–Q12 | L05, V04 |

## 2. Hồi I — Người bị buộc im lặng (Q01–Q04 + L01)

### Q01 — Bến không chờ người về (Vertical Slice Mở Màn — One-Shot Camera)

**Vào:** Game mới, cập bến cảng Sebastos (Xêdarê) cuối thập niên 50 AD; không dùng đoạn chơi thử 6 phút L01 ở đầu game để bảo toàn trọng tâm tâm lý cha con.  
**Cấu trúc 9 nhịp phân cảnh (Beats 00–08):**
* *Beat 00 (Cập bến & Invisible Tutorial):* Góc máy sát mặt nước lướt lên vai Người Chứng khi ván gỗ hạ xuống; trao quyền điều khiển tức thì không cắt cảnh; làm quen di chuyển qua phu khuân vác.
* *Beat 01 (Bóng người lạ):* Bố cục hẻm đá đóng khung bóng người lạ dò xét xưởng Natan; lẩn đi khi bị nhìn; không marker chỉ định; tự do bám theo hoặc hỏi thợ cưa gỗ.
* *Beat 02 (Natan & 3D Close Inspection):* Nhận sổ gia đình; xoay vật thể 3D dưới ánh sáng xiên phát hiện vết ẩm lạnh và đường khâu gáy lệch bất thường; khóa suy diễn tại chỗ.
* *Beat 03 (Cháy kho phía tây & Titus):* Đà gỗ gãy, chuông báo dập dồn, khói đen bốc lên; gặp Titus — thợ sửa trục/ròng rọc; tập trung cứu hộ người mắc kẹt, loại bỏ combat giả tạo.
* *Beat 04 (Hiện trường kho 3 tầng & Đa tuyến vật lý):* Tuyến 1 (Cơ học cùng Titus): tháo chốt xe hàng nặng trượt chèn cửa sập, tời cáp mở lối phụ. Tuyến 2 (Sức người): gọi hai thợ cảng hợp lực đòn bẩy nâng xà sồi đè ngang cầu thang.
* *Beat 05 (Góc nhìn giới hạn từ sân mái):* Bung cửa sân mái lộng gió; nhìn xuống hẻm khuất sau kho ghi nhận 4 thuộc tính giới hạn của bóng người tháo chạy (hướng bến tàu tuần, thời điểm, áo choàng ngắn viền da, cự ly làm mờ mặt).
* *Beat 06 (Yosef & Mầm Consent):* Xuống đất ngổn ngang tro tàn; Yosef thì thầm về hồ sơ bị ém nhẹm và khẩn nài không được gọi tên anh giữa đám đông để bảo toàn mạng sống.
* *Beat 07 (Lựa chọn tài nguyên & Cảnh thoại Natan A):* Quyết định `lodging` (bàn riêng) vs `meal` (góp dầu bếp chung). Đối diện quá khứ tại xưởng Natan: câu nói về chữ ký vội của Haddai; Người Chứng đối mặt ký ức mình từng thấy cha ký trước biên nhận nhưng im lặng vì sợ mất việc (T05).
* *Beat 08 (Dấu vết B06 & Kho sau cháy bền vững):* Hiện trường giữ nguyên trạng thái sau cháy; tìm thấy tờ B06 có vết cạo sửa mực; camera nâng cao qua mái cháy sém nhìn ra vịnh sương đêm mở ra câu hỏi vào Q02: *"Ai đang làm hồ sơ thay đổi và vì sao nhân chứng sợ nói?"*.  
**Ra:** `ledger.found=true`; `evidence.b06_scraped=found`; mở Q02.

### Q02 — Những tên không được đọc
* **TÍCH HỢP v6:** Mép dán B06 được quan sát in-world dưới ánh xiên tại khu sao chép sát bến. Miriam dẫn vào sân bữa bằng công việc hỗ trợ, không dùng điểm quan hệ để ép Yosef. B06 luôn tách biệt G17.
* **Vào:** Có sổ gia đình, đã gặp Miriam.
* **Mục tiêu:** Xác minh đợt thiếu 2 bao của bữa chung B06 hôm nay và bảo vệ Yosef.
* **Ba route:** `shelter` (đưa Yosef và mẹ vào nơi an toàn trước), `anonymous` (bỏ định danh qua trung gian), `consented` (lắng nghe nhu cầu, giải tỏa áp lực, bố trí người bảo vệ và chỉ nhận lời chứng tự nguyện).
* **Tầng:** L03 và V01 tự chọn. **Ra:** Q03 luôn mở sau route hợp lệ; liên kết sang đầu mối tuyến vận tải G17.

### Q03 — Con đường biến mất
* **TÍCH HỢP v6:** Kịch bản phân cảnh 5 nhịp điện ảnh chi tiết tại [hồ sơ 07](07-vertical-slice-screenplay.md): Tuyến Antipatris bài toán đa cao độ: (A) Vượt rãnh đá dọn vật cản và đọc ma sát thừng gai; (B) Tuyến đường vòng sườn đồi thoai thoải qua trạm dừng chân an toàn; (C) Lối tắt kỹ thuật dùng `tools` vượt ghềnh cao. Đọc dấu bùn lún 24 bao bác bỏ lối bậc hẹp 1.05m không vừa trục xe 1.75m có vết mẻ đá va quẹt; sửa xe gãy trục cùng Amon chống softlock; đối chiếu độc lập E04 (24 xuất, 2 hỏng, 18 Galilê chờ Q05); Natan kể Biển Đỏ bên lửa trại mở cổng L01.
* **Vào:** Q02 kết thúc.
* **Mục tiêu:** Đi tuyến đường đồi ngoài thành, lần theo vệt bánh xe lún sâu dưới tải trọng 24 bao.
* **Sự thật:** 24 bao rời bến, nhưng 2 bao bị hỏng trên đường có biên bản riêng; 18 bao đi Galilê (chỉ xác nhận trực tiếp ở Q05).
* **Chọn:** Trả công Amon để xem sổ ngay hoặc giúp sửa chốt phương tiện và đợi. Thiếu tiền không softlock.
* **Ra:** `evidence.route=verified` (E04). Amon bị đe dọa và rời bỏ tuyến sau đó.

**Cổng chính sau Q03:** L01 mở; Q04 chờ L01 đủ core và phần kết.

### Q04 — Đêm kho đóng cửa
* **TÍCH HỢP v6:** Cảnh đóng kho tái sử dụng lối thoát nước và cầu nổi đã nhìn thấy ở Q01; L01 củng cố cách phối hợp nhóm/đèn/dây. Giữ quyết định food/tools và kiểm chữ ký E01 ở mốc Q04.
* **Vào:** Q03 và L01 đã commit ở revision hiện hành.
* **Mục tiêu:** Tiếp nối bằng khảo sát lối, kiểm người, bàn giao thực phẩm hợp lệ trước mốc đóng kho và đối chiếu tờ bìa đã làm khô.
* **Lối:** Trao đổi với Mattai, sửa then phụ hoặc dùng cầu đã sửa.
* **Chọn:** `food` / `tools` cho phần tải thêm, chuẩn bị cho Q08/Q11.
* **Twist:** Natan mở tờ bìa đã khô; nét chữ ký trên biên nhận gốc (E01) đúng là chữ ký thật của Haddai; không thể minh oan bằng cách chối bỏ chữ ký. Amon vắng mặt không rõ tung tích.
* **Tầng:** V02 tự chọn. **Ra:** Đầu mối Galilê và cộng đồng được bàn giao.

## 3. Hồi II — Dấu ấn quyền lực (Q05–Q08 + L02)

### Q05 — Những người còn chờ bữa
* **TÍCH HỢP v6:** Làng chài mở ba lớp bờ – sân lưới – bếp chung. Miriam giúp gặp người chứ không mở khóa lời khai. Chỉ tại Q05 mới đối chiếu 18 bao thực nhận E05; NPC chịu callback của tuyến thực phẩm.
* **Mục tiêu:** Tìm người nhận hàng ở làng chài Galilê, kiểm 18 bao thực nhận.
* **Gameplay:** Phụ vá lưới để làm quen dân bản địa, hỏi người nhận bữa, kiểm tra số lượng thực nhận (E05) chỉ có 18 bao; phân biệt vải niêm.
* **Chạm trán Hanan:** Chứng kiến ông vừa có năng lực cứu đói cho dân vừa dùng quyền phân phối để kiểm soát họ; phát hiện kênh sân phụ.
* **Chọn:** `open_audit` mời kiểm lượng công khai đúng phạm vi hay `private_check` đối chiếu kín; cáo buộc không đủ nguồn có nhánh đền công và sửa lời. **Ra:** Mở Q06.

### Q06 — Cái giá của một tờ giấy
* **TÍCH HỢP v6:** Sân phụ có đường vòng, cổng khóa, chốt cơ học và bóng canh. Đây là lần GIỚI THIỆU cơ chế ánh sáng/tiếng động bằng vật thể và dấu vết; **KHÔNG coi L02 (chỉ mở sau Q06) là điều kiện để qua Q06.**
* **Mục tiêu:** Tiếp cận sân phụ để tìm chứng từ chuyển 4 bao (E06); phát hiện công cụ của Titus từng sửa khóa then kho. Nhóm bị theo dõi do rò rỉ thông tin lộ trình.
* **Lối:** Lẻn theo tuyến, thương lượng, đọc ca trực, tự vệ không sát thương khi thật cần.
* **Chọn:** `take_original` / `witnessed_copy` / `reconstruct`.
* **Ra:** Q06 commit trước, sau đó L02 bắt buộc; đủ beat/phần kết mới mở Q07.

**Cổng chính sau Q06:** L02 mở; Q07 chờ L02 đủ core và phần kết.

### Q07 — Một lời hứa còn thiếu
* **TÍCH HỢP v6:** Giữ Q07.PROMISE và nhiệm vụ của Miriam/Sela đầy đủ; thêm cú lật về Lea vào đoạn giữa chương, với nhánh tìm hiểu, sửa tổn hại và không ép tha thứ. L02 làm sâu cách kiềm chế, không tự nâng skill.
* **Vào:** L02 đã commit.
* **Mục tiêu:** Tiếp nối bài học tự chế của Đavít bằng việc đối thoại trách nhiệm trong nội bộ nhóm.
* **Twist:** Lea thú nhận từng tiết lộ một phần lịch trình di chuyển cho người của Varro/Hanan do sinh kế gia đình bị đe dọa (tách biệt với việc từng xóa tên một người để cứu họ trước đây).
* **Gameplay & Lựa chọn:** Đối thoại trên cơ sở sự thật, thiết lập ranh giới an toàn mới, giữ Lea ở vai trò phù hợp mà không ép buộc avatar phải tha thứ giả tạo. **Hệ quả:** Xác lập phương án bảo vệ cho Q08/Q11.

### Q08 — Trang sổ trong nước
* **TÍCH HỢP v6:** Wadi có ba vùng cao độ W0, W1, W2, cảnh báo nước dâng, lối bọc neo và tuyến cứu Amon. Trải nghiệm L01 giúp người chơi hiểu bài toán dây/gió/nước đã từng tập, nhưng vẫn có hướng dẫn cơ bản và giải pháp cứu cả người lẫn E07 khi chuẩn bị đủ.
* **Mục tiêu:** Khủng hoảng trên đường đồi khi nước dâng tràn qua hẻm đá wadi hiểm trở; phát hiện Amon còn sống nhưng đang mắc kẹt cùng túi tài liệu phụ.
* **Gameplay:** Đọc dòng chảy, bố trí người giữ neo, thử tải dây cáp.
* **Chọn:** Chuẩn bị tốt có thể cứu cả Amon lẫn giấy (`prepared_rescue`); thiếu chuẩn bị buộc phải ưu tiên cứu người trước (`person_first`), chấp nhận giấy bị mờ nhòe (`integrity=partial`).
* **Tiết lộ:** Amon còn sống và xác nhận lộ trình G17 nếu được cứu an toàn.
* **Tầng:** V03 tự chọn. **Ra:** Mở đường đến Giêrusalem.

## 4. Hồi III — Hai bản sửa, một lời chứng (Q09–Q12 + L04)

### Q09 — Người có quyền im lặng
* **TÍCH HỢP v6:** Giêrusalem dùng sân nhà sao lục J0, xưởng sửa papyrus J1, nơi niêm J2 và phòng đối chiếu J3; dựng chain-of-custody E09/E12 bằng tìm đường và gặp người đúng phạm vi. Không dùng “xưởng làm giấy” công nghệ về sau.
* **Mục tiêu:** Đến Giêrusalem, tìm những người trực tiếp nghe hoặc biết chỉ dẫn chuyển 4 bao.
* **Gameplay:** Tự tìm nơi gặp qua dấu đời sống, đối chiếu người gửi–nhận thư, trình bày dữ liệu ẩn danh, bố trí lối vào kín.
* **Chọn:** Lắng nghe giới hạn của từng người; xác lập phạm vi đồng thuận (`consent` scopes: private, anonymous, public); từ chối của nhân chứng được giữ nguyên.
* **Thu thập:** E09 (lời chứng người nghe lệnh) và củng cố căn cứ vạch trần Hanan. **Ra:** Tập lời chứng có ranh giới rõ ràng.

### Q10 — Hai bản sửa
* **TÍCH HỢP v6:** Hai bản sửa E08/E11 được so bằng thớ papyrus/da viết, nếp gấp, tay sao, niêm và tuyến người giữ. So màu mực không đủ để kết luận tác giả; giữ nguyên Q10.RESPONSIBILITY về lỗi thật của Haddai.
* **Mục tiêu:** Tìm gói tài liệu Haddai gửi về Giêrusalem; đối mặt với cú lật tài liệu lớn nhất của chiến dịch.
* **Twist:** Xuất hiện **Bản sửa giả (E11)** do Varro chỉ đạo ngụy tạo, quy hết mọi tội chiếm đoạt cho Haddai và kéo các nhân chứng thành đồng phạm; đồng thời tìm ra **Bản sửa thật của Haddai (E08)** nhận lỗi ký trước nhưng yêu cầu đối chiếu 2 khoản rõ ràng.
* **Gameplay:** Đọc nét mực, nếp giấy, kiểm tra chuỗi xuất xứ (E12).
* **Chọn:** `disclose` (nói rõ phần sai lầm của cha với nhóm) hay `conceal` (cố giấu phần bất lợi rồi bị đối chiếu).
* **Ra:** Không thể dùng kết "cha hoàn toàn vô can"; chuẩn bị tinh thần cho L04.

**Cổng chính sau Q10:** L04 mở; Q11 chờ L04 đủ core và phần kết.

### Q11 — Những người cùng ở lại
* **TÍCH HỢP v6:** Trở lại cảng ở áp lực cấp 3, gặp cổng niêm và trạm gác mới; những đường đã tìm ở Q01 trở thành lối tắt tùy chọn. Giữ phân bổ bữa, dụng cụ và E10/Mattai; snapshot trước Q12 có diễn tập.
* **Mục tiêu:** Trở về Xêdarê; củng cố liên minh, chuẩn bị phương án làm chứng có trách nhiệm và đối chiếu nguồn E10 từ sổ ca trực của Mattai.
* **Lối:** Chọn một trong ba phương án chiến lược (`public`, `distributed`, `relocate`).
* **Nhận thức:** Varro đã thao túng khâu niêm phong và giấy tờ tại cảng; hồ sơ còn thiếu thì phải thừa nhận thiếu.
* **Chọn:** Hoàn tất chuẩn bị trước point of no return.
* **Tầng:** L05, V04 tự chọn. **Ra:** Snapshot kế hoạch toàn diện.

### Q12 — Điều còn lại sau một lời nói
* **TÍCH HỢP v6:** Màn kết là set-piece đa tuyến: phối hợp lối/nhân chứng/hồ sơ rồi tiếp nhận chứng cứ. Đối chất P01–P05 chỉ bằng nguồn đủ và scope hợp lệ; camera blend in-world, không đổi sự thật bằng QTE.
* **Mục tiêu:** Thực hiện kế hoạch đã chuẩn bị tại cảng Xêdarê; không có boss fight.
* **Gameplay:** Điều phối nhân sự, trao bản sao đúng scope, đối chất công khai dựa trên các claim đã đủ nguồn độc lập; avatar tự dũng cảm nói ra điều mình đã chứng kiến (T05).
* **Ba tuyến kết thúc:**
  * *Tuyến A (Công khai có bảo vệ):* Sức ép lớn, vạch trần sai phạm, nhân chứng tự nguyện đứng tên, ẩn danh phần nhạy cảm.
  * *Tuyến B (Lời chứng được che chở):* Phân tán tài liệu qua mạng lưới người giữ bản độc lập, bảo vệ con người bền vững.
  * *Tuyến C (Bảo vệ con người trước):* Đưa người yếu thế rời vùng đe dọa, giữ hồ sơ an toàn, làm chứng phần đủ chắc.
* **Hậu truyện:** Bến cảng đổi thay thực tế theo việc người chơi đã làm; không có màn phán quyết đạo đức.

## 5. Các chương Legends: Nhân vật Thánh và Cơ chế Thám hiểm

Mỗi chương Legends là một không gian thám hiểm cô đọng, mật độ cao (40–60 phút tương tác), nơi người chơi nhập vai một **Nhân Chứng Vô Danh** đồng hành sát cánh bên các bậc thánh nhân mà không làm xáo trộn bản văn Kinh Thánh (Canon Lock 100%):

- **L01 / Môsê / Xuất Hành 14,1–31 [S05] (Trục bắt buộc Hồi I):**
  * *Thời lượng:* 50–60 phút tương tác hoặc khoảng 8 phút tóm tắt. Cổng Q03 $\rightarrow$ Q04. Sáu nhịp cốt lõi B01–B06.
  * *Vai điều khiển:* **Người Hộ Vệ Khóa Đuôi** (Caravan Rearguard Defender). Môsê đứng ở tiền phương theo lệnh Chúa giơ gậy rẽ biển.
  * *Cơ chế đặc thù (Caravan Cohesion & Terrain Reading):* Đọc hướng gió đông và dấu chân bãi triều; dùng kỹ năng *Thủ công* kích bánh xe lún bùn và lát ván qua sình lầy; dùng đèn bão duy trì liên lạc; dùng *Tự vệ* ngăn gia súc hoảng loạn dẫm đạp người già/trẻ nhỏ.
  * *Kịch bản phân cảnh 5 nhịp điện ảnh:* Chi tiết tại [hồ sơ 07](07-vertical-slice-screenplay.md): Nhịp 01 Trại đêm gió lớn kiểm tra lều cuối; Nhịp 02 Tuyến đi cuối đoàn (triền cát cao vs khe đá thấp); Nhịp 03 Giải cứu xe tải sụp cát bằng đòn bẩy cộng hưởng từ Q03; Nhịp 04 Leo mỏm đá truyền tín hiệu đèn cọc tiêu sống; Nhịp 05 Đại cảnh vượt biển trên cát khô ráo và dư âm dội sang Q04.
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

## 9. Phụ lục tích hợp — Sự thật nền (T01–T13) và Sổ chứng cứ (E01–E12 / P01–P05)

### 9.1. Mười ba sự thật nền (Ground Truths T01–T13)
- **T01:** Lô hàng `G17` rời kho Xêdarê với 24 bao. 2 bao bị hỏng trên đường Amon vận chuyển (có biên bản riêng); 18 bao đến điểm chia bữa tại Galilê; 4 bao còn lại bị chuyển vào sân phụ do Hanan kiểm soát ($24 = 2 + 18 + 4$).
- **T02:** Haddai (cha của nhân vật chính) đã ký trước biên nhận "đã nhận đủ tại điểm chia" khi hàng chưa tới nơi nhằm giữ lời cam kết cung cấp bữa ăn không bị gián đoạn. Đây là lỗi nghiệp vụ thực tế của ông.
- **T03:** Hanan là người trực tiếp chỉ dẫn chuyển 4 bao vào sân phụ để tích trữ và kiểm soát nguồn cung, đồng thời lợi dụng chữ ký trước của Haddai để đổ toàn bộ trách nhiệm mất 6 bao lên ông. Varro hỗ trợ che đậy bằng thủ tục và niêm phong cảng.
- **T04:** Khi phát hiện sai lệch, Haddai đã soạn bản sửa tự nhận lỗi ký trước và gửi tới một người giữ giấy ở Giêrusalem, nhưng bản sửa bị ngăn chặn và ông lâm bệnh mất.
- **T05:** Nhân vật chính (Người Chứng) từng chứng kiến việc chưa kiểm đủ hàng nhưng đã giữ im lặng vì sợ mất việc làm.
- **T06:** Natan (thợ đóng thuyền) giữ sổ hộ gia đình và bìa có biên nhận gốc, giao sổ ở Q01 và giao bản gốc ở Q04.
- **T07:** Sự cố thiếu 2 bao bữa chung tại Xêdarê (`B06` trong Q02) là sự việc xảy ra ở hiện tại, cho thấy quy trình sửa sổ để trục lợi vẫn đang tiếp diễn.
- **T08:** Điểm lưu giữ bản sửa là Giêrusalem; người giữ sân Galilê chỉ nhận 18 bao; Rina ở Xêdarê chỉ làm chứng cho đợt B06 mà bà trực tiếp trải qua.
- **T09:** Varro là nhân vật hư cấu kiểm soát thủ tục niêm phong chứng từ tại cảng Xêdarê; đặt làm Bản sửa giả (E11) quy hết tội chiếm đoạt cho Haddai và kéo người làm chứng thành đồng phạm.
- **T10:** Rufus phụ trách đội bảo vệ thuê; vụ cháy kho tại Q01 là sự cố ngoài ý muốn trong một lần thu hồi tài liệu vội vã.
- **T11:** Lea có hai trách nhiệm riêng biệt: từng xóa một tên để cứu người; sau đó dưới áp lực sinh kế gia đình đã tiết lộ một phần lịch trình di chuyển.
- **T12:** Amon rời bỏ tuyến sau khi bị đe dọa, được cứu sống tại wadi Q08 và có thể trực tiếp làm chứng về lộ trình G17 nếu an toàn.
- **T13:** Hai bản sửa đối lập: Bản sửa thật của Haddai (E08) gửi Giêrusalem vs Bản sửa giả của Varro (E11) làm sai lệch sự thật.

### 9.2. Mười hai nguồn chứng cứ độc lập (Evidences E01–E12)
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
| **E11** | Bản sửa giả quy tội `[Đề xuất v5.0]` (Q10) | Tồn tại văn bản giả mạo đổ tội cho Haddai | Chưa tự chứng minh người chủ mưu đặt làm |
| **E12** | Dấu đường chuyển thư của bản giả `[Đề xuất v5.0]` (Q09–Q11) | Chuỗi trạm chuyển thư và dấu niêm cảng | Cần chuỗi giữ độc lập để chứng minh Varro |

### 9.3. Năm mệnh đề kết luận (Claims P01–P05)
- **P01 — B06 không khớp:** Yêu cầu `E02` + `E03`. Kết luận số lượng bữa chung bị hụt do can thiệp sổ sách; không quy chụp cho vụ G17.
- **P02 — G17 thiếu 4 bao chưa được giải trình tại điểm chia:** Yêu cầu `E04` + `E05`. Tách riêng 2 bao hỏng do vận chuyển khỏi 4 bao bị chuyển lệch.
- **P03 — Haddai chịu trách nhiệm việc ký trước, không có căn cứ nói ông lấy 4 bao:** Yêu cầu `E01` + `E08` đối chiếu với `E04`/`E05`.
- **P04 — Hanan chỉ dẫn chuyển 4 bao ngoài danh sách phân phối:** Yêu cầu `E06` kết hợp nguồn độc lập `E09` hoặc `E10`, trên nền tảng `E04`/`E05`.
- **P05 — Varro can thiệp chứng từ và đặt bản sửa giả `[Đề xuất v5.0]`:** Yêu cầu `E11` + `E12` với chuỗi người giữ độc lập. Nếu chưa đủ nguồn, chỉ nêu nghi vấn thủ tục tại cảng, không tuyên bố án hình sự.

---

## 10. Liên Kết 5 Trụ Cột Chiến Lược Vào Chuỗi Chiến Dịch (Campaign Integration)

> [!NOTE]
> Toàn bộ đặc tả chi tiết và quy chuẩn kiến trúc của 5 Trụ cột Chiến lược Scene Systems thuộc quyền sở hữu duy nhất của **[03 Narrative Bible — Phần II: Scene Systems v6.0](03-narrative-bible.md#phan-ii-scene-systems-c-v60-thiet-ke-canh-co-che-moi-tich-hop)**.

Dưới đây là ma trận ánh xạ 5 Trụ cột Chiến lược vào tiến trình 12 nhiệm vụ cầu nối và 3 Legends trục:

| Trụ cột Chiến lược | Ứng dụng cụ thể trong Chuỗi Chiến dịch Q01–Q12 & L01–L04 | Nguồn Master SSOT |
|---|---|---|
| **1. Khảo cổ Hiện trường Đa tầng** | • Q01–Q04: Hệ thống 4 tầng bến cảng Sebastos (`C0, C1, C-1, C+1`).<br>• Q03: Ba tuyến hình học Antipatris (`Tuyến A/B/C`), vết lún bùn 24 bao vs bậc hẹp 1.05m.<br>• Q08: Ba cao độ hẻm đá Wadi (`W0, W1, W2`), cứu Amon và giữ trọn vẹn E07.<br>• Q09–Q10: Bốn trạm pháo đài thủ tục Giêrusalem (`J0, J1, J2, J3`), đối chiếu hai bản sửa E08/E11. | [Doc 03 · Mục 14](03-narrative-bible.md#14-khao-co-hien-truong-da-tang-world-first-investigation) |
| **2. Khám phá Đồng hành** | • Titus (cơ học/kết cấu): Q01, Q04, Q06, Q08.<br>• Lea (giám định văn thư/sợi gai): Q02, Q05, Q07, Q09, Q10.<br>• Damar (địa hình/leo trèo/né tuần tra): Q03, Q06, Q08, Q11, Q12.<br>• Miriam (cộng đồng/hậu cần/bảo vệ người): Q02, Q05, Q07, Q11, Q12.<br>• Quy trình tương tác 6 bước: `Spot → Propose → Prepare → Execute → Commit → Fallback`. | [Doc 03 · Mục 15](03-narrative-bible.md#15-companion-driven-traversal-bon-cach-doc-cung-mot-the-gioi) |
| **3. Cộng hưởng Cơ chế Chơi** | • L01 (Xuất Hành 14 — bão cát/đèn bão/cứu xe sụp cát) $\rightarrow$ Q04 & Q08 lũ quét.<br>• L02 (1 Samuel 24 — âm học vách đá/mảng tối) $\rightarrow$ Q06 & Q07 hành lang đêm.<br>• L04 (Gioan 21 — nhịp chèo rạng đông/kéo lưới) $\rightarrow$ Q11 & Q12 đối chất ngày trở về. | [Doc 03 · Mục 16](03-narrative-bible.md#16-mechanical-resonance-legends-day-ngon-ngu-moi-truong) |
| **4. World Callback Động** | • Bốn nấc Milestone Pressure (Cấp 0: Bình thường $\rightarrow$ Cấp 1: Rà sổ sau Q04 $\rightarrow$ Cấp 2: Trạm gác Rufus sau Q08 $\rightarrow$ Cấp 3: Kiểm soát gắt gao trước Q12).<br>• Nhân quả thế giới lưu giữ bền vững: nhánh Yosef Q02, tải đồ Q04, Amon Q08, consent Q09. | [Doc 03 · Mục 17](03-narrative-bible.md#17-dynamic-world-callback-ba-moc-ap-luc-hanh-chinh) |
| **5. Q12 Interactive Set-Piece** | • Màn kết thời gian thực 6 nhịp (`B0 Chuẩn bị → B1 Tiếp cận → B2 Giữ an toàn → B3 Bàn giao → B4 Đối chất P01–P05 → B5 Hậu quả`).<br>• Ba Route kết thúc độc lập: Route A (Công khai), Route B (Che chở), Route C (Bảo vệ con người). | [Doc 03 · Mục 18](03-narrative-bible.md#18-q12-interactive-set-piece-da-tuyen) |
