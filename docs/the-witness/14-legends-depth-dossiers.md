# 14 • Hồ sơ chiều sâu Legends — Ba chương trục truyện

**Thiết kế truyện v6 • Rà soát 11/11/2026 • [H] có ràng buộc nguồn • Chưa được thẩm định chuyên gia hoặc playtest**

Hồ sơ này là nguồn scene/level cho L01, L02, L04, có độ chi tiết tương ứng các cầu nối Q trong [hồ sơ 11](11-chapter-dossiers.md). Giữ ID, thứ tự core và cổng của [campaign-contract](campaign-contract.json); các bảng scene dưới đây là đích dàn dựng v6, không tự thay receipt/checkpoint runtime. Thời lượng thiết kế lấy [GDD mục 16](02-game-design-document.md#16-ngan-sach-chieu-sau-va-tai-can-bang-thoi-luong-pacing--duration-rebalancing): 55 + 48 + 42 = 145 phút. Baseline v3 và khoảng cách triển khai theo [STATUS A08](../STATUS.md#open). [Packet 15](15-source-world-packets.md) quyết định phần nào có căn cứ để dựng. Tất cả kích thước, đường đi, thao tác và nhân vật nền dưới đây là bố cục nghệ thuật [H]; không gọi là phục dựng chính xác.

## 1. Hợp đồng trải nghiệm chung

Người chơi điều khiển **Nhân Chứng Vô Danh [H]**, một vai phụ ở rìa hiện trường chuyển thể; các nhân vật Kinh Thánh giữ hành động, lời và kết cục theo bản văn. Vai phụ không thay Môsê, Đavít, Phêrô hoặc trở thành một môn đệ được nguồn xác định. Không tạo bản sao của Người Chứng trong quá khứ. Đầu chương hiện tên sách, phân đoạn, nhãn chuyển thể và nút chọn định dạng; không hiện như phụ bản thưởng. Journal xếp tên Legend và câu hỏi hành trình ở đầu; công việc Mortal hiện dưới nhãn “Chuẩn bị / Tiếp nối”.

Mỗi chương có bảy scene, một đồ thị không gian, ít nhất hai cách khám phá có công năng, một đoạn yên và một trở lại đời thường có việc làm. Đường khác đổi thứ tự quan sát hoặc thao tác; chúng hội tụ ở diễn tiến bản văn. Không ghi lựa chọn “đúng đạo” hoặc mở lịch sử thay thế. Nhánh khám phá không đưa vật Kinh Thánh vào túi avatar.

**Hoàn thành:** đủ beat cốt lõi theo thứ tự, đúng revision, đã trình bày phần kết và người chơi chọn tiếp tục. Xem tóm tắt có cùng beat và cùng quyền mở cổng. Chỉ chọn định dạng, xem trang đầu, thoát game hoặc xem replay không đủ. Việc bấm tiếp xác nhận phần trình bày đã tới cuối, không chứng minh hiểu/đồng ý; game không suy đoán đức tin. Phản tư có thể để trống. Cổng mở là thay đổi tiến độ, còn hành động đời thường vẫn cần thực hiện.

**Trạng thái tiếp tục:** checkpoint ghi scene, beat đã trình bày, định dạng từng beat và phần tương tác đang làm. Đổi định dạng đi tới beat đầu chưa có, vẫn cho đọc lại từ đầu. Các đoạn tương tác trước beat đó có thể rút gọn khi đổi sang tóm tắt. Không cộng hai lượt bắt đầu thành một lượt hoàn tất. Replay dùng snapshot riêng.

## L01 — Môsê: Bờ trước mặt & Đêm vượt biển

### Câu chuyện, vị trí và đường cảm xúc

**Nguồn:** S05, Xh 14,1–31. **Vào:** Q03 đã commit. **Ra:** `GATE.L01` mở Q04.  
**Tầng Thánh (Canon Lock 100%):** Môsê đứng ở tiền phương theo lệnh Đức Chúa giơ gậy trên biển; cột mây/lửa chắn giữa quân Ai Cập và dân Israel.  
**Vai điều khiển (Player Agency):** **Người Hộ Vệ Khóa Đuôi** — một thanh niên bọc hậu của chi tộc Giuđa; sử dụng trọn vẹn 4 kỹ năng (Quan sát, Thủ công, Giao tiếp, Tự vệ).  
**Ngân sách thiết kế v6:** 55 phút tương tác (khoảng hiệu chỉnh 50–60 phút) hoặc khoảng 8 phút tóm tắt; chưa đo bằng người chơi thật.

**Trọng tâm đức tin:** Sáng kiến cứu thoát của Thiên Chúa trước sự bế tắc tuyệt đối của con người.  
**Xung đột trải nghiệm [H]:** Nỗi sợ hãi tột cùng của đoàn người yếu thế khi nghe tiếng chiến xa Ai Cập đuổi sát phía sau; áp lực giữ vững trật tự bọc hậu giữa cuồng phong gió đông.  
**Exploration Loop đặc thù: Quản lý Đội hình & Đọc Địa hình Gió/Nước (Caravan Cohesion & Terrain Reading):**
- *Khảo sát luồng di chuyển:* Đọc dấu chân, bùn lún và gờ đá nông ven bờ để dẫn xe thồ vượt qua.
- *Gia cố hậu cần:* Chèn đá vào bánh xe lún, chằng buộc gia tài, dựng cột dây an toàn giữa gió lốc.
- *Duy trì liên lạc đội hình:* Giữ đèn hiệu chắn gió, dùng tiếng còi/tù và truyền hiệu lệnh kết nối các cụm gia đình.
- *Đẩy lùi hỗn loạn:* Ngăn cản gia súc hoảng loạn dẫm đạp người già/trẻ nhỏ ven hành lang vượt biển.

### Không gian có thể chơi

Blockout gồm **A — mép trại hậu phương**, **B — tuyến vách đá gồ ghề**, **C — điểm tập kết xe thồ**, **D — bãi triều trước biển**, **E — hành lang lòng biển rẽ đôi**, **F — bờ bên kia**. A↔B↔C và A↔C tạo vòng khảo sát; C→D là điểm hội tụ; D→E→F theo diễn tiến lịch sử. Không gian A–D khoảng 180×220 m; E là đại cảnh lòng biển sâu với vách nước hai bên và nền đất khô cứng theo luồng gió đông.

### Chuỗi scene và hành động chi tiết

*(Chi tiết kịch bản phân cảnh 5 nhịp điện ảnh Nhịp 01–05, thiết kế âm thanh diegetic, tương tác cơ học giải cứu xe tải cộng hưởng từ Q03 và hiệu ứng cọc tiêu ánh sáng xem tại [hồ sơ 07](07-vertical-slice-screenplay.md)).*

| Scene / phút | Việc người chơi thực hiện (Nhân chứng vô danh) [H] | Biến cố Kinh Thánh quan sát được [K] | Điểm lưu |
|---|---|---|---|
| L01.S01 / 5 | Nhận tín hiệu và đèn [H]; đi tuần mép trại A; kiểm các gia đình chậm chân | Quân Ai Cập truy đuổi, dân ở trại ven biển (B01, tiếp ở S02) | Lưu trại A |
| L01.S02 / 10 | Khảo sát hai tuyến A–C/B–C; kích bánh xe lún, đặt ván; giữ hai cách đi có công năng | Dân sợ hãi; Môsê trấn an dân (B01–B02) | Lưu điểm C |
| L01.S03 / 10 | Điều phối các gia đình tại C; trấn an trẻ; giữ khoảng trống cho người và đàn vật | Khoảng thao tác [H] trong tình thế đã trình bày; không thêm lời nguồn | Checkpoint D |
| L01.S04 / 7 | Tập kết tại D; quan sát từ bên lề, không thao tác để kích phép lạ | Lệnh tiến lên; cột mây ngăn hai đoàn; Môsê đưa tay, biển mở theo hành động của Đức Chúa (B03, mở đầu B04) | Lưu cửa biển |
| L01.S05 / 12 | Dẫn nhóm khóa đuôi trên nền khô; dùng đèn giữ cự ly xe; không tìm đủ vật để được qua | Dân đi trên đất khô; quân Ai Cập đuổi theo và lâm cảnh rối loạn (B04) | Lưu giữa biển |
| L01.S06 / 7 | Hỗ trợ xe cuối lên bờ F; nhường góc nhìn cho phần kết nguồn | Môsê đưa tay theo lệnh Đức Chúa; biển trở lại, cuộc truy đuổi chấm dứt (B05) | Lưu bờ F |
| L01.S07 / 4 | Cùng nhóm đứng nhìn lại; giữ khoảng yên rồi tiếp tục | Israel được cứu, kính sợ và tin Đức Chúa cùng Môsê (14,30–31; B06) | Commit L01 |

Tổng bảng: **5 + 10 + 10 + 7 + 12 + 7 + 4 = 55 phút**. Co phần tuần tra/khảo sát lặp, giữ hai tuyến, core và khoảng yên. Các phút gồm quan sát, thao tác và phần trình bày; không kéo dài bằng chạy vòng, tìm đủ chum hoặc chờ AI. Không suy tỷ lệ hoạt động thực từ dự toán; cần đo ở blockout/playtest. Bài ca Môsê thuộc Xh 15, ngoài phân đoạn L01 đang khóa; không gán bài ca cho B06 hoặc tự thêm nó vào core.

### Canon lock và quyền chủ động

Beat bắt buộc: **B01** (14,1–10), **B02** (10–14), **B03** (15–20), **B04** (21–25), **B05** (26–29), **B06** (30–31). Tên nhịp và điều kiện trong contract là chỉ mục, không là lời Kinh Thánh để thu âm. Phần trình bày phải giữ trình tự và chủ thể hành động của nguồn [S05].

Không xác định Pharaô, tọa độ hay năm Xuất Hành bằng asset. Không dùng bản đồ hiện đại để tuyên bố đã tìm thấy địa điểm thật. Môsê không tự tìm được kỹ thuật giải thích hoặc kiểm soát phép lạ. Thao tác hụt ở E phục hồi checkpoint gần nhất; không dựng kết “đoàn chết vì người chơi chậm”. Chế độ không thao tác tay có auto-traverse, mô tả cảnh và cùng beat cuối.

### Cầu nối có người và việc

**Người kể:** Natan, tại nơi nghỉ sau Q03. Ông gắn câu chuyện với việc phải cùng lên đường, không tuyên bố Người Chứng được chọn làm Môsê mới. Lời dẫn hư cấu đề xuất: “Tôi nhớ một câu chuyện bắt đầu ở nơi người ta chẳng nhìn thấy đường ra.” Sau đó thẻ nguồn tách giọng kể địa phương khỏi chương game.

**Phản tư:** “Khi chưa thấy đường, bạn muốn hỏi ai đang ở phía sau?” Người chơi có thể viết, chọn một ý riêng hoặc “Chưa trả lời”. NPC chỉ biết phần đã được avatar nói ra sau khi trở lại; không đọc `reflection` riêng.

**Chồng lớp:** gió qua vải ở trại nối tiếng gió qua mái kho; vị trí tay buông gậy cắt sang tay đặt dây. Đây là montage. Chế độ giảm chuyển động dùng hai ảnh tĩnh và thẻ địa điểm/thời đại.

**Tiếp nối Q04 & Cơ chế Mở khóa Nhận thức (Knowledge-Gating):**
L01 không ban tặng vật phẩm hay kỹ năng siêu nhiên sang Mortal World (bảo toàn Invariant 2 của [PRODUCT](../PRODUCT.md#invariants)). Thay vào đó, L01 đóng vai trò là trường học nhận thức cho chính người chơi:
1. *Quy tắc chắn đèn bấc trước gió nghịch:* Cách cầm đèn hạ thấp trọng tâm, dùng vạt áo hoặc khiên gỗ chắn luồng khí lùa từ biển để giữ ngọn lửa không bị thổi tắt và không hắt bóng lên vách cao.
2. *Quy tắc dò nền đá nén dưới bùn lún:* Quan sát độ phản chiếu ánh sáng của mặt nước và lớp cát mịn để phân biệt bùn lầy nguy hiểm với dải đá sỏi nén chặt chịu được tải trọng.
3. *Vận dụng không marker tại Q04:* Khi trở lại bến cảng Sebastos trong đêm siết kiểm tra (Q04), hệ thống **tuyệt đối không hiển thị waypoint hay nút bấm Phương án Thứ Ba trên giao diện UI**. Người chơi phải tự vận dụng tri thức nhận thức đã học ở L01: quan sát luồng gió biển đập vào chân tường kho C1, che ngọn đèn bấc để di chuyển trong bóng tối, và lần theo gờ đá nén để luồn vào rãnh thông gió bảo trì C-1 mà lính tuần bỏ quên. Hành động tự thân này kích hoạt Phương án Thứ Ba (The Third Way) một cách tự nhiên và đầy thuyết phục.

### Tóm tắt, chi phí và tiêu chí nhận

Sáu trang tương ứng B01–B06, có bản chữ đầy đủ, phụ đề/đọc nếu thu âm được cấp quyền, ảnh tĩnh không bắt giữ âm thanh; điều hướng trước/sau và phần kết. Hình dựng chỉ dùng sau duyệt; greybox dùng sơ đồ trung tính. Chọn “Để sau” giữ cổng; nút “Trở lại hành trình” chỉ xuất hiện ở phần cuối. Không đếm ngược 8 phút.

Asset tối thiểu: một bộ trại mô-đun, bộ vải/dây/kiện; một cảnh quan bờ với hai trạng thái; tuyến vượt dựng thủ công; đám đông proxy ba cụm với mức chi tiết phù hợp. VFX nước là hạng mục rủi ro lớn, phải có phương án dựng giới hạn tầm nhìn trước production. Không làm hệ mô phỏng biển toàn diện để chứng minh một scene.

Nhận greybox khi người mới tìm hai lối A–C, hiểu không thao tác nào “nạp phép”, giữ được định hướng sau trở lại, và không mở Q04 nếu chỉ bắt đầu rồi thoát. Nhận nội dung cuối khi R01–R07 có duyệt đúng phạm vi; hiện tất cả chưa phân công.

## L02 — Đavít: Khoảng cách trong hang & Khe đá En Ghêđi

### Câu chuyện, vị trí và đường cảm xúc

**Nguồn:** S06, 1 Sm 24 toàn chương. **Vào:** Q06 đã commit, kể cả route `reconstruct`. **Ra:** `GATE.L02` mở Q07.  
**Tầng Thánh (Canon Lock 100%):** Đavít cùng các cận vệ ẩn nấp trong đáy hang; Saun vào hang một mình; Đavít tiến lại cắt vạt áo Saun rồi lương tâm cắn rứt; Đavít ngăn cản các người theo mình không được hại vua; Đavít bước ra ánh sáng cúi lạy và đối thoại với Saun.  
**Vai điều khiển (Player Agency):** **Người Trinh Sát Đội Đavít** — một chiến binh đi theo Đavít nhiều năm; mở khóa trọn vẹn 4 kỹ năng RPG.  
**Ngân sách thiết kế v6:** 48 phút tương tác (khoảng hiệu chỉnh 45–50 phút) hoặc khoảng 7 phút tóm tắt; chưa đo bằng người chơi thật.

**Xung đột trải nghiệm [H]:** Mối thù sâu sắc giữa nghĩa quân Đavít và quân triều đình; sự cám dỗ tột cùng muốn ra tay hạ sát Saun để chấm dứt chuỗi ngày trốn chạy; thử thách kiềm chế bản thân và giữ trật tự nội bộ.  
**Exploration Loop đặc thù: Thám hiểm Âm thanh, Ánh sáng & Kiềm chế Đồng đội (Acoustic Stealth & Group Restraint):**
- *Khảo sát địa hình En Ghêđi:* Trèo qua các vách đá dựng đứng, khe suối cạn và hốc đá vôi [En Gedi](https://static.parks.org.il/wp-content/uploads/2022/12/engedi-eng.pdf) để dẫn đường.
- *Âm học hang tối (Acoustic Stealth):* Lắng nghe tiếng bước chân, tiếng giáp sắt và tiếng vọng âm thanh của quân lính Saun bên ngoài và trước cửa hang.
- *Giữ khoảng cách với toán phụ [H]:* Dùng lời thì thầm, tín hiệu và đường lùi để người nóng nảy tự đồng ý hạ tay; không khóa/siết người, không có thước đo đức hạnh. Chính Đavít ngăn quân mình hại Saun theo bản văn.
- *Cảnh giới và lộ diện:* Giữ nhóm phụ ở vị trí an toàn, quan sát Đavít tự bước ra đối thoại; không cần người chơi hộ tống mới xảy ra biến cố nguồn.

### Không gian có thể chơi

**A — khe đá ngoài En Ghêđi**, **B — vòm miệng hang**, **C — hốc tối sâu đáy hang**, **D — gờ đá trên cao (đường vòng quan sát)**, **E — điểm tập kết nghĩa quân**, **F — bãi đá đối diện ngoài hang**, **G — tuyến rút lui an toàn**. Không gian khoảng 100×160 m; hang vôi có nhiều tầng cao độ, ánh sáng gián tiếp từ miệng hang tương phản với bóng tối dày đặc bên trong.

### Chuỗi scene và hành động chi tiết

| Scene / phút | Việc người chơi thực hiện (Trinh sát hang) [H] | Biến cố Kinh Thánh quan sát được [K] | Điểm lưu |
|---|---|---|---|
| L02.S01 / 5 | Do thám vách đá A; báo nhóm phụ rút vào B; không suy được quân số từ dấu chân | Saun tìm Đavít với ba nghìn người theo nguồn (B01) | Lưu khe A |
| L02.S02 / 10 | Khảo sát ngách C và gờ D; giăng dây định hướng; giữ hai tuyến âm học có công năng | Đavít và người của ông ở sâu trong hang; Saun đi vào (B01) | Lưu đáy hang C |
| L02.S03 / 8 | Giữ nhóm phụ yên, quan sát từ khoảng cách; không đi thay hoặc ra lệnh cho Đavít | Người của Đavít thúc giục; Đavít cắt vạt áo rồi áy náy (B02) | Checkpoint vạt áo |
| L02.S04 / 7 | Thì thầm với một người phụ [H], để họ tự lùi về điểm dây; không quyết định việc tha Saun | Đavít ngăn người của mình hại vua; Saun rời hang (B03) | Lưu điểm E |
| L02.S05 / 6 | Chuẩn bị nước, người nối tín hiệu và đường về cho nhóm phụ | Khoảng thao tác [H] sau B03; không đặt thêm cổng cho hành động của Đavít | Lưu trước cửa hang |
| L02.S06 / 8 | Cảnh giới từ B; giữ khoảng yên nghe cuộc đối thoại | Đavít bước ra, cúi mình và trình bày; Saun đáp lại (B04, đầu B05) | Lưu miệng hang B |
| L02.S07 / 4 | Đi cùng toán phụ về G; giữ khoảng nghe và quan sát đoạn kết, không quyết định lời thề của Đavít | Đavít thề; Saun trở về nhà, Đavít và người của ông về nơi ẩn náu (B05) | Commit L02 |

Tổng bảng: **5 + 10 + 8 + 7 + 6 + 8 + 4 = 48 phút**. Co khảo sát lặp và phần chờ của toán phụ; giữ lời nguồn, hai tuyến và đoạn rút lui. Không suy tỷ lệ hoạt động thực từ dự toán. Nếu thoại theo bản dịch dài hơn, đo lại và cân đối toàn hồi.

### Canon lock, căng thẳng và lỗi thao tác

**B01:** 24,1–4. **B02:** 5–6. **B03:** 7–8. **B04:** 9–16. **B05:** 17–23. Không hòa 1 Sm 26 và chi tiết cây giáo vào chương. Không bỏ B02 hoặc B05 chỉ giữ cảnh “tha mạng”. Phần khác biệt đánh số của bản dịch phải được R04 lập bảng đối chiếu trước khóa thoại.

Tấm áo không là trophy, người chơi không được chọn làm ngơ trước sự hối hận đã có trong nguồn. Không giao mục tiêu “không bị phát hiện để nhận thưởng đạo đức”. Tension đến từ góc nhìn, khoảng cách và việc quay lại, không từ một đồng hồ có thể khiến canon hỏng. Nếu đi lạc, mốc/địa vật và aid dẫn về; rơi khỏi tuyến trở lại checkpoint. Không ghép một nhánh bạo lực người chơi có thể làm trong Q06 vào quá khứ của Đavít.

### Cầu nối và phần tiếp nối

**Người kể:** Damar sau Q06, có thể là người còn bất đồng với avatar. Nếu anh vắng, đầu mối địa phương giới thiệu thẻ nguồn; không ép tuyển lại companion. Lời dẫn [H]: “Ta thường nhớ lúc một người tiến lên. Tôi muốn nghe đoạn họ quay lại.” Không tuyên bố anh nhớ mọi chi tiết nguyên văn hoặc là người chứng kiến.

**Phản tư:** “Điều gì làm bạn dừng lại khi đã ở rất gần?” Cho phép phản đối cách liên hệ hoặc chưa trả lời; không gán động cơ từ dữ liệu bấm nút. **Chồng lớp:** đường sáng ở miệng hang nối khe cửa xưởng; âm bước chân trở về trên nền thật. Không mang mảnh áo ra ngoài lớp chuyển thể.

**Q07 & Cơ chế Mở khóa Nhận thức (Knowledge-Gating sang Q07):**
L02 huấn luyện người chơi quy tắc đọc môi trường thính giác đặc thù:
1. *Quy tắc Điểm mù Âm thanh Vách đá (Acoustic Blindspot):* Cấu trúc vòm đá vôi phản xạ tiếng gió rít bên ngoài nhưng tạo ra vùng lặng âm thanh tuyệt đối (dead zone) dọc theo vết nứt thạch nhũ nơi tiếng bước chân bị triệt tiêu hoàn toàn bởi tiếng giọt nước nhỏ đều.
2. *Vận dụng không marker tại Q07:* Khi trở về xưởng thuộc da của Lea trong bầu không khí ngột ngạt nghi kỵ, thay vì một lựa chọn menu cứng nhắc, người chơi quan sát không gian 3D, nhận diện điểm mù âm thanh giữa các giàn phơi da nặng và vách đá xưởng để tiếp cận góc riêng tư. Điều này tạo không gian an toàn không sợ bị tai vách mạch rừng nghe lén, giúp Lea trải lòng thú nhận việc bị đe dọa sinh kế gia đình (T11) mà không bị dồn vào chân tường, mở ra Phương án Thứ Ba độc quyền mà không có marker dẫn đường.

### Tóm tắt và tiêu chí nhận

Năm trang B01–B05, khoảng 7 phút mục tiêu, không ép tốc độ. Mỗi trang có nguồn và mô tả chuyển cảnh, phần kết gồm cả rời đi. Không biến tóm tắt thành một câu “Đavít tha thứ nên hãy tha thứ”. Được đổi sang định dạng này trong hang khi gặp khó điều hướng.

Asset: một bộ đá/hang có giới hạn cao độ, ánh sáng gián tiếp và lối ra dễ đọc; nhóm nhân vật tối thiểu, phục trang theo packet; animation dừng/ra hiệu/đi ra và phần nguồn khóa. Không cần AI săn đuổi toàn bản đồ. Greybox đạt khi hai lối đều có ích, người chơi hiểu mình được điều khiển điều gì, và vẫn nhớ đoạn quay lại nhóm cùng đoạn ngoài hang. Duyệt chuyên môn hiện chưa có người nhận.

## L04 — Phêrô: Một buổi sáng được trao lại & Bờ hồ Ti-bê-ri-a

### Câu chuyện, vị trí và đường cảm xúc

**Nguồn:** S09, Ga 21,1–19. **Vào:** Q10 đã commit. **Ra:** `GATE.L04` mở Q11.  
**Tầng Thánh (Canon Lock 100%):** Nhóm môn đệ đánh cá trắng tay trong đêm; rạng sáng Đức Giêsu đứng trên bờ. Sau lời chỉ dẫn và mẻ cá, người môn đệ được Đức Giêsu yêu mến nhận ra Người; Phêrô xuống nước. Phêrô kéo lưới có 153 cá lớn lên bờ mà lưới không rách. Giữ bữa ăn, ba câu hỏi và lời trao nhiệm vụ/theo Thầy cho Phêrô. Đây là tóm tắt nguồn, không phải bản lời thoại được duyệt để thu âm.
**Vai điều khiển (Player Agency):** **Người Phụ Lưới Hồ Galilê** — người thợ phụ cùng đồng hành trên thuyền chài; vận dụng trọn vẹn 4 kỹ năng RPG.  
**Ngân sách thiết kế v6:** 42 phút tương tác (khoảng hiệu chỉnh 40–45 phút) hoặc khoảng 8 phút tóm tắt; chưa đo bằng người chơi thật.

**Trọng tâm đức tin:** Sự hiện diện đầy yêu thương và tha thứ của Đấng Phục Sinh, trao lại trách nhiệm cho những con người từng vấp ngã.  
**Xung đột trải nghiệm [H]:** Nỗi đau đớn, mất phương hướng và cảm giác tội lỗi của các môn đệ sau cuộc khổ nạn; sự mệt mỏi thể xác sau đêm dài quăng quật trên sóng lạnh mà không có kết quả.  
**Exploration Loop đặc thù: Phối hợp Thao tác Thuyền/Lưới & Đọc Dấu hiệu Mặt nước (Seamanship & Relational Observation):**
- *Thao tác thuyền tham chiếu [Ginosar](https://yigal-allon-centre.org.il/en/the-museum/the-ancient-boat/):* Điều phối phần việc phụ, đọc hướng gió và giữ thăng bằng. Thuyền khảo cổ khoảng 8 m là tham chiếu vật thể theo packet 15; bố trí gameplay là [H], không gọi là chính thuyền Phêrô.
- *Chuẩn bị mép lưới [H], không chốt cấu tạo từ Ga 21:* Thả lưới, thăm dò độ chìm của phao chì, gỡ mắt lưới mắc đá ngầm, cùng kéo lưới trong bóng đêm.
- *Đọc dấu hiệu mặt nước:* Quan sát gợn sóng đêm, luồng lạch cá theo mùa và ánh bình minh hé rạng trên rặng núi phía đông.
- *Lao tác cộng đồng [H]:* Chuẩn bị mép dây và nơi nhận ở bờ; quan sát bếp than đã có sẵn theo nguồn. Không yêu cầu người chơi nhóm bếp mới xảy ra bữa ăn.

### Không gian có thể chơi

**A — bến neo thuyền lúc hoàng hôn**, **B — khu thao tác thuyền sáng tác, tham chiếu S31**, **C — vị trí buông lưới ngoài khơi đêm**, **D — tuyến về bờ lúc rạng đông**, **E — bãi có bếp than**, **F — dải bờ dàn dựng phần theo Thầy [H]**. A↔B làm quen; B→C đêm trắng tay; C→D tiếng gọi và nhận ra Chúa; D→E về bờ; E↔F nghe trao nhiệm vụ. Vai phụ không tăng số người trong nhóm được Ga 21,2 liệt kê; chi tiết vị trí/góc nhìn phải được duyệt như chuyển thể, không là căn tính mới được nguồn xác nhận.

### Chuỗi scene và hành động chi tiết

| Scene / phút | Việc người chơi thực hiện (Phụ việc thuyền) [H] | Biến cố Kinh Thánh quan sát được [K] | Điểm lưu |
|---|---|---|---|
| L04.S01 / 4 | Kiểm chốt chèo, dây neo và mép lưới [H] ở bến; làm quen thao tác phụ | Phêrô cùng nhóm môn đệ đi đánh cá (B01) | Lưu bến A |
| L04.S02 / 9 | Chuẩn bị dây, gỡ rối mép lưới [H]; một lượt phối hợp đủ, không kéo dài bằng chờ cá | Nhóm không bắt được gì trong đêm; không gán nội tâm suy đoán thành lời nguồn (B01) | Lưu giữa hồ C |
| L04.S03 / 5 | Quan sát bờ lúc sáng, lắng nghe; không thay người đáp lời nguồn | Đức Giêsu hỏi và chỉ dẫn thả lưới; nhóm chưa nhận ra Người (đầu B02) | Lưu rạng đông |
| L04.S04 / 7 | Giữ phần dây phụ gọn, chứng kiến; thao tác người chơi không làm mẻ cá xảy ra | Các môn đệ thả lưới bên phải; người môn đệ được yêu nhận ra Chúa; Phêrô xuống nước (B02) | Checkpoint kéo lưới |
| L04.S05 / 6 | Phối hợp phần nhận dây ở bờ [H]; không có mục tiêu nhập/đếm đủ 153 | Bếp than, bánh và cá; Phêrô kéo lưới lên bờ, 153 cá lớn và lưới không rách (B03) | Lưu bờ hồ E |
| L04.S06 / 7 | Lùi ra rìa bữa ăn; giao diện công việc hạ xuống, giữ khoảng nghe | Đức Giêsu trao bánh/cá (B03), rồi hỏi và trao nhiệm vụ cho Phêrô (B04) | Lưu bữa ăn |
| L04.S07 / 4 | Quan sát Phêrô đứng dậy bước theo Chúa dọc dải bờ F; ghi nhớ lời trao phó sứ vụ; commit L04 | Lời báo trước và mệnh lệnh tối hậu: "Hãy theo Thầy!" (B05); hoàn tất ba chương trục | Commit L04 |

Tổng bảng: **4 + 9 + 5 + 7 + 6 + 7 + 4 = 42 phút**. Co lượt chèo/thả lưới lặp; giữ đêm trắng tay, nhận ra Chúa, bữa ăn, lời trao nhiệm vụ và đoạn theo. Không suy tỷ lệ hoạt động thực từ dự toán. Vai phụ và bố trí thuyền là [H], không thêm một Tông đồ vào nhóm nguồn. Chỉ giữ vật tương tác khi giúp hiểu công việc/không gian; không biến 153 thành collectible hoặc câu đố.

### Canon lock và ranh giới nhân vật

**B01:** 21,1–3. **B02:** 4–8. **B03:** 9–14. **B04:** 15–17. **B05:** 18–19. Giữ trung tâm Phục Sinh và trao nhiệm vụ, không thay bằng màn hòa giải hư cấu. Các từ yêu thương trong chú giải S09 không làm cơ sở ba cấp skill. Không dùng con số cá làm danh sách đồ sưu tầm. Không có failure “không đủ yêu nên không được trao việc”.

Tạo hình, biểu cảm và giọng Đức Giêsu là một quyết định chuyển thể cần R01/R02/R04/R05 duyệt riêng. Greybox dùng blocking, nhãn nguồn và chỉ dẫn câu; chưa viết lời mới để lấp khoảng trống. Phêrô có căn tính và quá khứ của mình, không dùng lỗi cha avatar làm lời giải trực tiếp cho Tông đồ. Không tuyên bố trải nghiệm hư cấu tương đương thẩm quyền trong đoạn nguồn.

### Cầu nối và kết cấu hồi cuối

**Người kể:** Miriam sau Q10, qua một câu chuyện được truyền lại; không khẳng định cô sở hữu Phúc Âm Gioan hoàn chỉnh vào 58–60 CN. Chương game trình bày đầy đủ với thẻ nguồn tách biệt. Lời dẫn [H]: “Có những buổi sáng người ta vẫn phải ngồi lại với nhau, trước khi nhận việc tiếp.” Đây là lời của Miriam về đời sống cô, không lời Đức Giêsu.

**Phản tư:** “Bạn sẵn lòng nhận việc gì, và cần ai cùng nhận?” Không bắt avatar nói mình được tha thứ, cũng không ép một lời tuyên xưng để qua cổng. **Chồng lớp:** tiếng vật đặt lên nền gỗ nối thao tác đặt bát ở nhà chung; thẻ địa điểm đưa trở lại Giêrusalem. Không một con cá/chùm sáng hiện ở đời thực để xác nhận phép lạ.

**Q11–Q12 & Cơ chế Mở khóa Nhận thức (Knowledge-Gating sang Hồi III):**
L04 truyền thụ cho người chơi quy tắc đọc dòng chảy ngầm và sức căng mạn thuyền:
1. *Quy tắc Dòng chảy & Độ chùng Mạn thuyền:* Nhận biết các dòng xoáy ngầm tĩnh lặng qua vệt gợn sóng ngược triều và cảm nhận sự phân bổ trọng lượng mạn thuyền khi chịu tải nặng.
2. *Vận dụng không marker tại Q11–Q12:* Trong đêm trở lại bến cảng Sebastos bị thiết quân luật gắt gao (Q11–Q12), người chơi tự áp dụng quy tắc này để điều hướng thuyền nhỏ luồn lách qua các bãi cọc ngầm và vùng nước xoáy mà tàu tuần tra La Mã tránh né, tiếp cận an toàn chân cầu cảng C0 mà không cần bất kỳ mũi tên HUD chỉ dẫn nào.

### Tóm tắt và tiêu chí nhận

Năm trang tương ứng B01–B05, giữ bữa ăn, trao việc và đoạn theo, không chỉ tóm “Phêrô được phục hồi”. Bản chữ có hướng dẫn người nói và nguồn, ảnh tĩnh có mô tả. Dùng tóm tắt không bỏ vai hỗ trợ Q11, không tự thêm companion đã rời và không mất cảnh hồi tưởng cuối game.

Asset: một thuyền khu vực chơi nhỏ, bộ lưới/dây có thao tác ổn định, bờ hồ giới hạn, bếp/bát/đồ ăn với quyền hình ảnh rõ. Tham chiếu thuyền S31 chỉ hỗ trợ kiểu vật thể theo niên đại rộng; không gọi là chính thuyền Phêrô. Greybox đạt khi người chơi nêu được điều khám phá ngoài việc chọn thoại, nhớ trung tâm Phục Sinh/trao việc, và hiểu Q11 là sự đáp lại riêng của người thường.

## 2. Nghĩa vụ nối cả ba hồi

Mỗi lần mở game ở checkpoint, màn tiếp tục hiển thị **Legend hiện tại → việc chuẩn bị/tiếp nối**. Hồi tưởng cuối dùng ba mốc nguồn theo thứ tự, sau đó mới nối các hành động Mortal thực sự đã làm. Không đưa ảnh Veil thành tư liệu Kinh Thánh. Mốc B đã xem không đồng nghĩa NPC đã biết điều người chơi xem; `unlockedBridgeContext` chỉ cho phép một cuộc nói chuyện, `ReflectionShared` mới truyền nội dung được chọn.

Ngân sách cinematic lớn dành trước cho bờ/vượt biển, hang/đối diện, thuyền/bữa sáng. Kho, cứu hộ và công bố dùng không gian mô-đun và blocking tiết chế. Nếu phải cắt phạm vi, giảm tuyến kho và Veil trước khi bỏ một beat của ba chương trục. Thay thời lượng thiết kế phải cập nhật bảng GDD v6 và tổng scene tại đây; thay baseline contract là một đợt triển khai riêng có kiểm tương thích. Không giữ tỷ trọng bằng thời gian chờ.

**Tình trạng giao sản xuất:** thiết kế để dựng thử, không là screenplay thu âm hoàn chỉnh. Bản dịch, câu nguồn, asset lịch sử và người duyệt chưa khóa. Mọi cổng chuyên môn, kiểm thực thi và đo người chơi đều còn phải chạy; kiểm dữ liệu tài liệu chỉ chứng minh cấu trúc có thể kiểm tra.
