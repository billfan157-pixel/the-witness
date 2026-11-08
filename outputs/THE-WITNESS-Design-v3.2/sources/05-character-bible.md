# 05 • Character Bible

## 1. Kiến trúc nhân vật và Nguyên lý Hai Tầng (Dual-Tier Persona)

Kiến trúc nhân vật của dự án giải quyết trọn vẹn nghịch lý giữa *Bảo toàn bản văn Kinh Thánh (Canon Lock 100%)* và *Quyền chủ động thám hiểm RPG (Player Agency)* thông qua hệ thống **Hai Tầng Nhân Vật**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TẦNG THÁNH (Canon Lock 100% - Nhân vật Lịch sử & Linh thánh)           │
│ Môsê giơ gậy rẽ biển | Đavít kiềm chế & cắt vạt áo | Chúa Giêsu phục sinh│
│ Lời thoại, hành động và kết cục bất biến theo nguồn Kinh Thánh.       │
└──────────────────────────────────▲─────────────────────────────────────┘
                                   │ (Quan sát trực tiếp / Tương tác ngoại vi)
┌──────────────────────────────────┴─────────────────────────────────────┐
│ TẦNG NGƯỜI (Player Agency - Nhân Chứng Vô Danh Nhập Vai)               │
│ L01: Người Hộ Vệ Khóa Đuôi | L02: Trinh Sát Hang | L04: Người Phụ Lưới │
│ Mở khóa trọn vẹn 4 kỹ năng: Quan sát, Thủ công, Giao tiếp, Tự vệ.     │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Ở Mortal World (65% thời lượng):** Người chơi điều khiển **Người Chứng** — người chuyển thư kiêm sao chép bản thảo thế kỷ I tại Xêdarê, cùng 4 bạn đồng hành điều tra sự thật về chữ ký của cha và bảo vệ các nhân chứng đời thường.
2. **Ở Legends (30% thời lượng — Tuyến trục chính):** Người chơi nhập vai một **Nhân Chứng Vô Danh** có mặt ngay tại tâm điểm biến cố. Môsê, Đavít, Phêrô và Chúa Giêsu hiện diện với sự uy nghiêm và hành động chuẩn mực theo Kinh Thánh, trong khi người chơi dùng toàn bộ hệ thống kỹ năng RPG để khảo sát địa hình, gia cố phương tiện, kiềm chế xung đột nội bộ và hỗ trợ cộng đồng.
3. **Inner Veil (5% thời lượng — Giấc mơ ẩn dụ):** Giấc mơ nội tâm phản chiếu suy tư của Người Chứng, hoàn toàn tự chọn.

## 2. Người Chứng — Vai cầu nối Mortal [H]

**Vai:** người chuyển thư kiêm sao sổ; tuổi trưởng thành, khoảng 23–35 là khung diễn xuất, không khóa tuổi chính xác. Giới tính/ngoại hình/giọng tùy biến trong phạm vi art và voice đã dự toán. Tên mặc định trong script không phải tên canon. Không cho người chơi chọn là con ruột của nhân vật Kinh Thánh.

**Muốn:** chứng minh cha bị vu oan. **Cần:** học cách đứng cùng sự thật ngay cả khi nó làm hình ảnh gia đình kém hoàn hảo. **Sợ:** mình chỉ dũng cảm khi người khác chịu rủi ro. **Quá khứ cố định:** từng im lặng trước một ghi chép sai. **Tự do nhập vai:** tự nhận trách nhiệm hay né tránh; giữ hay phá lời hứa; chuộc lỗi hoặc tiếp tục biện hộ.

**Biểu đạt:** tay quen giữ giấy khỏi gió; khi căng thẳng xếp đồ quá ngay ngắn. Animation này không bắt buộc nếu người chơi muốn avatar bình thản; dùng trong cinematic đã chọn thái độ tương ứng. Động cơ gắn với người cha nhưng người chơi không phải chọn tha thứ để kết thúc.

**Khả năng:** đọc, ghi, đi đường, mang dụng cụ; xuất thân mở một lợi thế. **Không có:** trí nhớ xuyên thế kỷ, khả năng xác nhận phép lạ hoặc quyền phán xét linh hồn.

## 3. Miriam — Người chăm sóc [H]

Nhân vật nữ trưởng thành, đã sống nhiều năm ở khu bến; không đồng nhất với bất kỳ Maria/Miriam nào trong Kinh Thánh. Codex ghi “nhân vật hư cấu”. Làm việc chăm sóc người bệnh và quản lý bữa ăn, không tự xưng có y thuật hiện đại.

**Muốn:** mọi người qua được đợt thiếu hàng. **Cần:** chấp nhận chia trách nhiệm thay vì ôm hết để bảo vệ người khác. **Điều giấu:** từng đổi một món đồ gia đình lấy thức ăn nhưng nói nó bị mất, khiến em trai tưởng mình bị nghi. **Giới hạn:** từ chối dùng người đang kiệt sức làm mồi nhử dù kế hoạch hiệu quả.

**Giọng:** câu ngắn, cụ thể, hỏi người trước khi chạm vào vết thương. Mẫu: “Tôi cần biết ai còn ở trong đó. Chuyện ai đúng nói sau khi họ ra được.” Bản thoại cuối sẽ chọn hệ xưng hô thống nhất theo quan hệ, không mặc định cả game dùng giọng trò chuyện của chủ dự án.

**Gameplay:** ổn định người bị thương, nhận ra dấu thiếu chăm sóc, mở cách tiếp xúc qua việc giúp. Không hồi sinh hoặc chữa bệnh bằng thanh năng lượng. **Thích:** báo trước rủi ro, giữ đồng thuận. **Bất đồng:** công bố tên người chưa sẵn sàng. **Quest B01:** trả lại món đồ gia đình và nói sự thật với em; người chơi có thể giúp sắp cuộc gặp, không nói thay cô.

**Arc:** từ người luôn ở lại một mình tới người tin người khác có thể tiếp ca. Kết tốt không bắt buộc lãng mạn; v1 không có romance system. Nếu tin cậy rạn nứt, cô vẫn cứu người nhưng không đi tiếp với avatar.

## 4. Damar — Người giữ đường [H]

Nhân vật nam trưởng thành, từng hộ tống hàng và dùng bạo lực để giữ công việc. Tên là tên làm việc, cần kiểm tra onomastics trước voice lock. Không gán tên vào một cá nhân lịch sử.

**Muốn:** trả món nợ với gia đình một người từng bị anh đánh. **Cần:** hiểu chuộc lỗi là nghe điều người khác cần, không dựng một hành động anh hùng để tự tha cho mình. **Sợ:** nếu không đánh trước sẽ mất người bên cạnh. **Giới hạn:** không nhận lệnh bỏ người không tự đi được.

**Giọng/cử chỉ:** quan sát cửa ra trước khi ngồi, cắt câu dài bằng câu hỏi đường đi; khi thật sự xấu hổ thì không giễu cợt. Mẫu: “Có lối sau. Nhưng mang ông ấy qua đó sẽ chậm. Chọn đi, tôi sẽ giữ cửa.”

**Gameplay:** nhận diện phục kích và dựng lối rút; combat hỗ trợ đẩy lùi, không tự giết NPC nhiệm vụ. **Quest B02:** gia đình người bị hại chỉ muốn anh sửa chỗ ở và thôi tìm họ; người chơi chọn tôn trọng giới hạn ấy hoặc gây thêm tổn hại bằng ép hòa giải. **Arc:** can đảm chịu không được tha thứ ngay. Có thể rời party nếu người chơi liên tục buộc anh đe dọa nhân chứng.

## 5. Lea — Người học chép [H]

Nhân vật nữ trưởng thành trẻ, làm việc đối chiếu hàng và học nhiều hệ ghi. Khả năng đọc các dạng chữ cụ thể là [C] cần chuyên gia, không “biết mọi ngôn ngữ cổ”. **Muốn:** tạo một bản ghi không thể bị sửa. **Cần:** biết không văn bản nào tự bảo vệ người được ghi trong đó. **Điều giấu:** đã tự xóa tên một người để người ấy tránh rắc rối, làm chuỗi chứng cứ đứt một đoạn.

**Giọng:** chính xác về điều đã thấy, dễ cáu khi người khác nói “chắc là”. Khi phát triển, học nói “Tôi chưa biết”. **Gameplay:** đối chiếu dấu sửa và thứ tự bản sao; không tự giải tất cả khi được tuyển. Kỹ năng của avatar vẫn có ích nếu cô vắng mặt, với thời gian/chi phí khác.

**Quest B03:** tái lập nguồn cho trang bị xóa bằng cách gặp người thật. Người ấy có quyền từ chối xuất hiện công khai. **Arc:** từ kiểm soát bản ghi tới chăm sóc cách bản ghi được dùng. Kết thúc bảo mật có thể hợp với cô, nhưng không tự tăng tin cậy nếu người chơi đã lừa cô.

## 6. Titus — Người sửa vật [H]

Nhân vật nam trưởng thành, người nói tiếng Hy Lạp trong cộng đồng cảng; **không phải thánh Titô**. Tên tạm cần phân biệt trong UI, có thể đổi sau thẩm định để tránh nhầm. Không dùng căn tính La Mã/Hy Lạp làm ký hiệu phản diện.

**Muốn:** mở lại xưởng không bị chủ kho kiểm soát. **Cần:** từ bỏ niềm tin mọi mâu thuẫn đều sửa được bằng một hợp đồng. **Điều giấu:** công cụ của anh đã được dùng sửa khóa trong đêm mất hàng, nhưng việc đó chưa chứng minh anh biết kế hoạch. **Giới hạn:** không phá một cơ cấu nếu người bên dưới chưa được báo.

**Giọng/cử chỉ:** nói bằng tải trọng, mối nối, cách sửa; biết đùa nhưng ngừng ngay khi có người cần nghe. **Gameplay:** đòn bẩy, neo dây, cách tiếp cận qua công trình; không tạo máy móc vượt thời đại. **Quest B04:** chọn làm lại xưởng một mình hoặc nhận người học việc mà gia đình anh không muốn giao du. **Arc:** công việc là quan hệ trách nhiệm, không chỉ đồ vật hoạt động được.

## 7. Nhân vật đối trọng và tái xuất [H]

**Hanan, người trung gian kho:** muốn độc quyền phân phối để “không ai làm hỏng kế hoạch”; sợ thiếu hàng khiến chính gia đình đói. Biện hộ không xóa việc sửa sổ và đe dọa. Giọng luôn nói “chúng ta” khi cần người khác trả giá. Có thể tự giao một phần sổ khi thấy mạng lưới tan, nhưng không được chuyển thành người vô tội chỉ qua một câu thú nhận.

**Natan, thợ đóng thuyền:** giữ trang đầu vì hứa với cha người chơi; không phải ngôn sứ Nathan. Đáng tin về những gì thấy ở xưởng, không biết toàn bộ vụ án. Nhu cầu: con trai không bị kéo vào nợ cũ. Gợi ý đặt tên khác ở bản localization nếu dễ nhầm.

**Yosef, người chuyển bao:** một nhân chứng Q02, muốn sống yên, sợ mất việc; không phải bản sao một nhân vật Kinh Thánh. Biết một đường chuyển hàng, không biết ai ra lệnh cuối. Quyền từ chối nêu tên là trung tâm slice.

**Haddai, cha đã mất:** chỉ hiện qua lời nhớ có nguồn, vật ghi và ký ức tự nhận là ký ức. Không có hồn ma xác nhận sự thật. Những người khác nhớ ông khác nhau; game không cho một đoạn flashback toàn tri sửa sạch mâu thuẫn.

**Rina, người giữ bữa chung:** nhận hàng thật và nhớ số người ăn, giúp kiểm chứng sổ bằng đời sống. **Mattai, người canh kho:** thực thi lệnh nhưng có thể cho mở lối khi được giải thích và có bảo đảm. **Sela, em của Miriam:** muốn được đối xử như người có thể gánh việc. **Amon, chủ phương tiện vận chuyển:** có lợi ích riêng, có thể hợp tác bằng thỏa thuận có điều kiện. Cả bốn là nhân vật hư cấu, không đại diện tập thể tôn giáo.

## 8. Các vai Legends: Nhân vật Thánh [K] và Nhân Chứng Nhập Vai [H]

Hệ thống nhân vật trong Legends được phân định rõ ràng giữa hai vai trò:

### A. Các Nhân vật Thánh (Canon Lock 100% - Nhân vật bất biến)
- **Môsê [K: S05]:** Vị thủ lĩnh đứng trước dân, giơ gậy trên biển theo lệnh Đức Chúa. Lời nói và cử chỉ khóa chặt theo Xh 14. Không có thanh mana, không nâng chỉ số phép thuật.
- **Đavít [K: S06]:** Người được xức dầu lánh nạn trong hang En Ghêđi, vượt qua cơn cám dỗ giết Saun, chỉ cắt vạt áo rồi hối hận vì xúc phạm đấng được xức dầu. Lời nói và kết cục khóa theo 1 Sm 24.
- **Phêrô & Các Môn Đệ [K: S09]:** Những người chài lưới Galilê đối diện sự phục sinh của Thầy tại bờ hồ Ti-bê-ri-a. Lời thoại và việc trao sứ vụ "Hãy chăn dắt chiên của Thầy" khóa theo Ga 21.
- **Đức Giêsu Kitô [K: S09]:** Đấng Phục Sinh hiện diện bên bếp than hồng lúc rạng đông. Lời thoại khóa tuyệt đối theo bản văn Phúc Âm, không ứng tác lời mới.

### B. Ba Nhân Chứng Nhập Vai (Player-Controlled Anonymous Witnesses)
Người chơi điều khiển nhân vật này để trải nghiệm biến cố lịch sử từ cự ly gần và vận dụng trọn vẹn 4 năng lực RPG:

1. **L01: Người Hộ Vệ Khóa Đuôi (Rearguard Guide / Defender):**
   - **Thân phận:** Một người trẻ tuổi có sức khỏe trong chi tộc Giuđa, chịu trách nhiệm bọc hậu cho đoàn người Xuất Hành.
   - **Xung đột tâm lý:** Nỗi kinh hãi trước tiếng xe mã đuổi bén gót của quân Pharaô và tiếng kêu khóc của các gia đình kiệt sức.
   - **Bộ kỹ năng sử dụng:**
     * *Thủ công:* Sửa trục bánh xe thồ, chằng buộc gia tài, lát ván và xếp đá qua các vũng bùn lầy.
     * *Quan sát:* Nhận diện hướng gió đông, đọc địa hình bãi triều, phát hiện tín hiệu đèn/đuốc từ xa.
     * *Giao tiếp:* Giữ bình tĩnh cho các cụm gia đình, hướng dẫn trẻ em và người già theo sát đội hình.
     * *Tự vệ:* Dùng gậy và khiên đẩy lùi sự hỗn loạn của súc vật hoảng loạn, bảo vệ các khe hẹp bọc hậu.

2. **L02: Người Trinh Sát Đội Đavít (Cave Scout / Retinue Companion):**
   - **Thân phận:** Một chiến binh trinh sát trung thành đi theo Đavít trong những năm tháng bị Saun lùng bắt ở hoang địa En Ghêđi.
   - **Xung đột tâm lý:** Mối thù gia đình với triều đình Saun và sự thôi thúc mãnh liệt muốn giải quyết mọi đau khổ bằng một nhát kiếm; giằng xé khi Đavít kiên quyết không tra tay.
   - **Bộ kỹ năng sử dụng:**
     * *Quan sát:* Thính giác định vị tiếng bước chân và tiếng kim khí vang vọng trong hang vôi; nhìn trong bóng tối mờ.
     * *Thủ công:* Bám vách đá dốc, tìm các đường luồn trên cao, dùng dây đưa đồng đội qua vực hang.
     * *Giao tiếp:* Kiềm chế cơn phẫn nộ của các đồng đội nóng nảy; truyền khẩu lệnh thì thầm trong bóng tối.
     * *Tự vệ:* Di chuyển không tiếng động (Acoustic Stealth), tước vũ khí trong im lặng nếu lính tuần Saun tới gần.

3. **L04: Người Phụ Lưới Hồ Galilê (Galilean Boat-hand / Net Assistant):**
   - **Thân phận:** Một thợ phụ trẻ tuổi trên chiếc thuyền đánh cá cổ kiểu Ginosar, cùng các Tông đồ ra khơi trong đêm.
   - **Xung đột tâm lý:** Nỗi bàng hoàng và trống rỗng sau khi Thầy chịu đóng đinh tại Giêrusalem; sự mệt mỏi thể xác sau cả đêm quăng lưới trắng tay.
   - **Bộ kỹ năng sử dụng:**
     * *Thủ công:* Phối hợp nhịp chèo đôi, căng buồm đón gió đêm, gỡ lưới rê ba lớp bị vướng rong đá, vá mắt lưới rách.
     * *Quan sát:* Đọc luồng nước, dòng chảy tầng sâu và ánh rạng đông trên mặt hồ Ti-bê-ri-a.
     * *Giao tiếp:* Chia sẻ sự thinh lặng đầy tâm trạng với Gioan và Phêrô; đón nhận lời chỉ dẫn từ người lạ trên bờ.
     * *Tự vệ / Sức bền:* Hợp lực kéo mẻ lưới nặng 153 con cá lớn mà không làm rách lưới; nhóm bếp than hỗ trợ bữa ăn.

## 9. Quy trình biểu diễn và continuity

Actor brief mỗi cảnh ghi điều nhân vật biết, điều muốn đạt, điều không thể nói và trạng thái cơ thể. Companion không biết kết quả Veil trừ khi avatar chọn kể; lời kể được log là `sharedReflection`, không là `verifiedFact`. Quan hệ đổi ở event đã xảy ra, không đổi vì mở lại menu. Mỗi lần spawn kiểm tra người đã rời nhóm/chưa gặp/bị thương.

V1 chưa quyết định diễn viên, tuổi thật, voice AI hay motion capture. Nếu dùng giọng/mẫu ngoại hình có thật cần quyền sử dụng cụ thể. Không tự gán giọng của một diễn viên nổi tiếng vào nhân vật trong tài liệu đặt hàng.

## 10. Revision 2 — Quan hệ giữa các nhân vật

Toàn bộ bổ sung phần này là [H]. Companion không chỉ phản ứng với avatar. **Miriam ↔ Lea:** Miriam sợ một bản ghi làm người yếu bị tìm thấy; Lea sợ thiếu bản ghi khiến họ lại bị gạt phần. Q02 cho bất đồng, Q08 buộc dùng cả sự cẩn trọng với giấy lẫn chăm người, Q11 có thể tự đề xuất tách danh sách khỏi số liệu. Họ không cần cùng quan điểm mới phối hợp.

**Damar ↔ Titus:** Damar thích lối thoát có thể giữ bằng sức, Titus đòi kiểm vật đang chịu tải. Q04 họ có thể cãi khi mở then phụ; Q08 nếu có cùng mặt, Damar phải đợi thử neo. Nếu một người vắng, không phát thoại đối đáp với khoảng trống. Một cử chỉ chờ tín hiệu chứng minh thay đổi tốt hơn câu tuyên bố “tôi đã học tin tưởng”.

**Miriam ↔ Sela:** chị nhận mọi ca vì sợ em bị trách; em muốn biết việc thật để tự chọn gánh. B01 kết bằng phần việc Sela tự nhận hoặc một khoảng cách chưa hàn, không bằng avatar bắt hai người ôm nhau. **Lea ↔ Yosef:** cô muốn ghi chính xác, anh muốn giữ giới hạn; anh có thể yêu cầu đọc lại và sửa một chi tiết mà không bị mô tả cản trở công lý.

**Natan ↔ Haddai ↔ avatar:** Natan giữ kỷ niệm tốt, bản sửa giữ lỗi thật, avatar quyết cách sống với cả hai. Natan không độc quyền câu cuối về người cha. **Rina ↔ Hanan:** từng nhờ Hanan tìm nguồn hàng trong một đợt thiếu nên hiểu ông làm được gì; chính vì vậy lời phản đối của bà ở Q11 có giá, không là người ngoài chưa từng cần hệ thống. **Mattai ↔ Hanan:** quan hệ công việc, không thề trung thành vô điều kiện; có thể bàn giao đúng và từ chối đe dọa.

Mỗi banter dùng điều kiện gặp, điều đã cùng chứng kiến, trạng thái người đang ở và kênh tin đã tới. Bất đồng giữa companion không tự biến thành quest “chọn một người để bỏ”. Có thể để cuộc tranh luận dở dang rồi họ vẫn làm chung một việc.

## 11. Bốn companion đi qua ba hồi

**Miriam.** Hồi I ở Q02: kiểm avatar có làm điều đã hứa sau khi hỏi tên. Hồi II ở Q07: chính cô phải nói thật với Sela về món đồ và chấp nhận em đặt giới hạn; avatar không chịu hết trách nhiệm hộ cô. Hồi III ở Q11: nếu đã có người nhận ca, cô chọn một vai có giới hạn thay vì cứu hết mọi việc. Dấu thay đổi: tự ngồi ăn trong lúc người khác giữ ca. Nếu tin rạn, cô vẫn chăm người tại bến nhưng không giao thông tin nhạy cảm cho avatar; không đổi nhân cách sang vô cảm để phạt người chơi.

**Damar.** Hồi I ở Q04: có thể đẩy người cản đường nhưng cần nghe lệnh dừng. Hồi II ở Q06/B02: người bị hại không muốn gặp, anh phải sửa phần việc được yêu cầu rồi rời đi. Hồi III: nhận giữ lối ra thay vì đi đối chất thay avatar. Dấu thay đổi: đặt gậy ngoài tầm người đang nói. Nếu không thay, anh có thể rút khỏi chuyến cuối vì không tin mình sẽ giữ được giới hạn; không phải mọi mất companion đều là kết họ ghét avatar.

**Lea.** Hồi I đọc lớp sửa mà không đoán tác giả; Hồi II đối diện việc mình đã xóa tên và đánh dấu chỗ giấy không thể cứu; Hồi III giúp làm hai lớp hồ sơ, số liệu và người, với quyền dùng riêng. Dấu thay đổi: để trống một dòng kèm lý do thay vì ép một câu chắc chắn. Nếu người chơi thích che phần bất lợi, cô không âm thầm sửa mọi bản giúp họ được ending tốt; có cảnh đối chiếu/sửa công khai theo phạm vi.

**Titus.** Hồi I giữ người khỏi cơ cấu có tải; Hồi II học giao người học việc một việc thật thay vì chỉ làm hộ; Hồi III chấp nhận một xưởng ít độc lập hơn nhưng có người cùng chịu trách nhiệm, hoặc tự làm với giới hạn đã nhận. Dấu thay đổi: đưa dụng cụ, đợi người kia làm, không giật lại ngay. Nếu chỉ được dùng như chiếc chìa khóa mở đường, anh từ chối một việc nguy hiểm, không vì avatar thiếu “điểm yêu thích”. Tên Titus vẫn là tên làm việc, chưa khóa localization và không phải thánh Titô.

Không arc nào đạt bằng một câu thoại đúng. Cần ít nhất hai hành động ở các cảnh khác nhau, một lần nhân vật tự lựa chọn và một callback thể hiện hành vi. Tự chủ của companion không được biến thành hệ thống bất ngờ phá kế hoạch mà UI không cho chuẩn bị.

## 12. Sáu nhiệm vụ quan hệ đủ để blockout

**B01 — Món đồ không bị mất.** Mở sau Q02, chuẩn bị cho Q07. Hai lối: Miriam tự gặp Sela trước khi tìm lại đồ; hoặc tìm người giữ món đồ rồi cô giải thích vì sao đã đổi nó. Chủ mới không mắc nợ trả miễn phí. Avatar chỉ bố trí cuộc gặp/chuyển lời được cho phép. Kết: Sela nhận một ca, hoặc cần thêm thời gian; Q07 điều chỉnh vai đã có người nhận. Không làm B vẫn có cuộc thương lượng tối thiểu trong Q07.

**B02 — Một mái không cần lời xin lỗi nữa.** Mở sau Q06. Gia đình bị hại cho sửa mái và yêu cầu không tới tìm họ. Hai lối: Damar sửa cùng người đại diện, hoặc góp vật/công qua một thợ họ chấp nhận. Cố ép gặp là tổn hại mới dù mái xong. Kết không bắt tha thứ; Q08/Q11 thay cách Damar xin nhận vai, không thưởng chỉ số bạo lực.

**B03 — Dòng trống có người sống.** Mở Q05–Q09. Lea tự nhận đã xóa tên. Hai lối: người ấy đồng ý cho ghi lại trong hồ sơ kín, hoặc từ chối ghi tên nhưng cho đối chiếu lượng qua một nguồn khác. Không đứng tên không có nghĩa họ nói sai. Q10 có mô tả nguồn khác nhau, không tự tăng mức chắc vì Lea buồn.

**B04 — Cái chốt người khác đã làm.** Mở sau Q04, tiếp tục tại điểm nghỉ Galilê. Hai lối: Titus trả công người học việc sửa một cơ cấu ít rủi ro rồi thử tải cùng; hoặc tự sửa và thừa nhận chưa sẵn sàng nhận người. Có thể đổi quyết định sau một lần làm việc chung. Không dùng người học việc như vật phải cứu để dạy Titus. Q11 có người làm phụ hay avatar phải tìm người khác; năng lực cơ bản không khóa.

**B05 — Bìa sổ và một chuyến thuyền.** Mở sau Q04, gặp lại Natan Q11. Hai lối: hỏi những người biết Haddai ở hai thời điểm hoặc giúp sửa chiếc thuyền đã cùng làm rồi nghe Natan tự kể. Không biến ký ức thành E08. Kết là một vật để nhớ/một lời chưa nói, đổi câu cuối có nguồn trong montage, không thay sự thật vụ hàng.

**B06 — Ai nhận lượt sau.** Mở sau Q01, có thể tiếp tục Q11. Rina cần phân phần thiếu bằng một quy tắc cộng đồng hiểu. Hai lối: họp nhóm nhỏ hỏi nhu cầu trước rồi thống nhất; hoặc dùng quy tắc đang có trong một lượt và hẹn kiểm lại, công bố điều chưa biết. Không xếp giá trị mạng người, không xác định ai “đáng” ăn bằng quiz. Kết tạo người nhận ca và cách giải thích ở bữa Q12; nếu bỏ qua, Rina vẫn vận hành mức cơ bản với hạn chế thật.

Mỗi B có một đối tượng tiếp tục sống ngoài avatar, một việc hoàn tất hữu hình, hai cách tiếp cận và một callback. Sáu B dùng lại sân/xưởng/điểm nghỉ, không thêm sáu dungeon hoặc sáu tuyến chính trá hình.

## 13. Hanan và những nhân vật không đi cùng

**Hanan có năng lực thật:** biết phối hàng, nhớ ai thiếu dụng cụ, giữ người làm qua một mùa khó. **Cơ chế tự biện hộ:** gọi mọi hàng giữ lại là dự phòng dù không công bố điều kiện phân, gọi mọi người hỏi là nguy cơ gián đoạn. **Lằn ranh:** việc che giấu và dùng phần cứu trợ để ép người không được câu chuyện tha bằng một hồi ức tuổi thơ. Q05 ông thử xem avatar coi trọng số hay bữa; Q11 đề nghị bồi hoàn có điều kiện; Q12 phản ứng theo claim cụ thể, có thể giao bản hoặc mất quyền giữ hàng. Không cần một cảnh ông tự nói toàn bộ tội.

**Natan** muốn con mình không bị cuốn vào lời hứa cũ; có thể giúp chép bản nhưng không đi giữ cửa. **Yosef** muốn mẹ và sinh kế được tính trong kế hoạch, có thể là người tự nguyện ở lại sau khi được bảo vệ; không vĩnh viễn là nạn nhân run rẩy. **Rina** có uy tín nhận bữa nhưng có lúc tính thiếu; bà sửa và báo lại, tạo mẫu người đáng tin dù không toàn hảo. **Mattai** thích ranh giới công việc rõ; bị qua mặt sẽ kiểm chặt, được giải thích có thể chủ động tìm người mắc lại trong sân. **Sela** được quyền nói chị đã làm mình tổn thương, rồi tự chọn việc có thể làm. **Amon** muốn phương tiện còn chạy; làm công giúp ông không tự mua lời chứng đúng ý.

Haddai chỉ hiện theo nguồn nhớ. Một lần avatar nhớ cha dịu dàng không làm mất một lời nhớ khác về lúc ông nóng nảy. Phần nào dựng thành hình phải có nhãn hồi tưởng của ai; không dùng camera toàn tri để hợp thức hóa ký ức làm bằng chứng.

## 14. Giọng nói và actor brief

Mẫu thoại gốc [H], dùng để thử diễn, chưa thu âm: Miriam “Để tôi hỏi người ấy trước.” Damar “Tôi giữ cửa được. Đừng bắt tôi nói hộ.” Lea “Bản này cho thấy chỗ dừng. Chưa cho biết ai ra lệnh.” Titus “Nới bên ấy trước. Có người đứng dưới.” Hanan “Nếu kho ngừng hôm nay, ai mang bữa tới?” Natan “Cha anh sửa cái này hai lần. Lần đầu ông cũng nghĩ là xong.” Rina “Đếm lại cùng tôi, rồi mình quyết.”

Một actor brief phải trả lời: muốn đạt điều gì trong cảnh; biết qua đâu; đang giấu gì; cơ thể đang làm việc gì; avatar vừa làm điều nào khiến giọng đổi. Không hướng dẫn “nói xúc động” chung chung. Từ chối không luôn gắt, nhận lỗi không luôn khóc, tin tưởng không luôn mỉm cười. Chỉ dẫn biểu diễn về mệt/sợ là của nhân vật cụ thể, không định kiến theo giới hoặc căn tính.

Trong Q01 avatar có thể chọn gọi Haddai là “cha tôi”, “ông ấy” hoặc bằng tên theo tình huống; sau đó không tự xưng thân mật ở cảnh họ chưa chọn. Trong Q10 được nói “Tôi cần thời gian” mà không bị hiểu đã tha thứ hoặc phản bội. Khoảng im lặng là lựa chọn có nội dung khi cả cảnh vẫn tiến được, không bài kiểm tra chờ đủ giây để có phần thưởng.

## 15. Gặp gỡ, tham gia và vắng mặt

**Miriam:** gặp bắt buộc như đầu mối công việc Q02, chưa đồng nghĩa đã vào party. Có thể được mời đi sau khi đã có người nhận ca, hoặc ở lại bến và hỗ trợ qua cuộc gặp/thư. Trong slice cô có vai NPC của nhiệm vụ để phản ứng; không ép người chơi phải tuyển cô. **Damar:** thấy ở bến Q01, có thể nhờ hướng tuyến Q03 và thỏa thuận cùng đi; từ chối lần đầu vẫn có thể gặp lại ở điểm nghỉ, không mất cơ hội vì bỏ một câu chào.

**Lea:** có chỗ làm đối chiếu Q02; người chơi cơ bản có bản đối chiếu cạnh đó nên không buộc dùng cô. Lời mời đi sau Q04 cần cô bàn giao công việc, không dùng lời chứng để ép cô thành companion. **Titus:** làm xưởng Q04; có thể nhận chuyến cùng nhóm tới Galilê nếu đã bố trí xưởng, hoặc chỉ cung cấp dịch vụ một lần. B04 mở khi đã có quan hệ công việc, không chỉ sau tuyển.

Tình trạng diễn xuất gồm `available`, `active`, `atHub`, `unavailableForTask`, `left`. `atHub` không phải bị bỏ rơi; `unavailableForTask` không phải ghét avatar. Cảnh mời ghi rõ việc người ấy cần làm xong, năng lực có thể giúp và quyền từ chối. Giới hạn người hoạt động của GDD vẫn áp dụng; những người còn lại ở điểm đã log, không teleport theo mọi cuộc hội thoại.

Trước một lần rời nhóm vì bị buộc gây hại, nhân vật nói rõ việc mình sẽ không làm; người chơi có thể đổi kế hoạch. Nếu vẫn cố tiếp tục, sự rời đi được dàn cảnh và có địa điểm sau đó. Gặp lại không tự hồi quan hệ; việc sửa có thể mở lại trao đổi nhưng người ấy vẫn được không đi tiếp. Các cầu nối có người địa phương/kỹ năng cơ bản thay công năng; bản sắc và quan hệ của companion không được thay bằng một NPC đọc cùng lời.

## 16. Brief chiều sâu cho ba chương trục Legends: Tương tác giữa Nhân vật Thánh và Nhân chứng Nhập vai

### L01 — Môsê [K] & Người Hộ Vệ Khóa Đuôi [H / Nhân vật điều khiển]
- **Môsê [K: S05, Xh 14,1–31]:** Hiện diện ở tiền phương và trên mỏm đá bờ biển. Thân thể mang sức nặng của sự vâng phục; cử chỉ trang nghiêm giơ gậy trên biển; lời nói và lời cầu nguyện khóa theo bản văn Kinh Thánh.
- **Người Hộ Vệ Khóa Đuôi [H / Nhân vật người chơi điều khiển]:**
  * *Mục tiêu cảnh:* Khảo sát lối thoát bọc hậu, gia cố các xe thồ lún bùn, giữ các cụm gia đình không bị tách rời giữa gió đông dữ dội.
  * *Động từ thao tác:* Khảo sát gờ đá nông (Quan sát), chằng dây trục bánh xe (Thủ công), tập hợp các gia đình hoảng loạn (Giao tiếp), chặn gia súc xô đẩy (Tự vệ).
  * *Góc nhìn máy quay:* Đứng từ vị trí người thường nhìn thấy cột mây, gió đông thổi dạt sóng và con đường rẽ ra giữa lòng biển trong sự kinh ngạc khôn xiết.

### L02 — Đavít [K] & Người Trinh Sát Hang [H / Nhân vật điều khiển]
- **Đavít [K: S06, 1 Sm 24]:** Vị thủ lĩnh mang nỗi đau bị săn đuổi nhưng tôn kính Đấng được xức dầu; cử chỉ dừng lại, cắt vạt áo, day dứt lương tâm và bước ra gọi Saun. Khóa 100% bản văn.
- **Người Trinh Sát Hang [H / Nhân vật người chơi điều khiển]:**
  * *Mục tiêu cảnh:* Dẫn đường trong bóng tối của hang En Ghêđi, phát hiện bước chân quân lính Saun, và kiềm chế những đồng đội đang muốn giết Saun.
  * *Động từ thao tác:* Bám vách đá định vị đường luồn trên cao (Thủ công), lắng nghe tiếng bước chân và tiếng kim khí vọng trong hang (Quan sát), can thiệp thì thầm và giữ tay kiếm của đồng đội (Giao tiếp / Kiềm chế).
  * *Góc nhìn máy quay:* Cận cảnh sự căng thẳng tột cùng trong bóng tối khi Saun bước vào một mình; chứng kiến hành động cao thượng của Đavít từ khoảng cách vài mét.

### L04 — Phêrô [K] & Người Phụ Lưới Hồ Galilê [H / Nhân vật điều khiển]
- **Phêrô & Đức Kitô Phục Sinh [K: S09, Ga 21,1–19]:** Đêm đánh cá trắng tay, tiếng gọi từ bờ hồ lúc bình minh, Phêrô nhảy xuống nước bơi vào bờ; Chúa Giêsu trao sứ vụ "Hãy chăn dắt chiên của Thầy" bên bếp than hồng. Khóa 100% bản văn.
- **Người Phụ Lưới Hồ Galilê [H / Nhân vật người chơi điều khiển]:**
  * *Mục tiêu cảnh:* Phối hợp điều khiển thuyền cổ Ginosar, quản lý dây lưới trong đêm, chia sẻ nỗi trĩu nặng của các Tông đồ và hợp lực kéo mẻ lưới 153 con cá lớn.
  * *Động từ thao tác:* Giữ nhịp chèo đôi (Sức bền), gỡ mắt lưới mắc kẹt và đọc dòng chảy đêm (Quan sát / Thủ công), cùng kéo mẻ cá lớn vào bãi cát (Hợp lực), phụ việc nhóm lửa bên bờ hồ.
  * *Góc nhìn máy quay:* Từ sàn thuyền dập dềnh nhìn thấy bóng người lạ đứng trên bờ trong ánh sương mai; cảm nhận sự chuyển biến từ tuyệt vọng sang niềm vui khôn tả của Phục Sinh.

### Người kể, người nghe và điều họ biết

Natan → L01, Damar → L02, Miriam → L04 là ba vị trí kể ưu tiên; journal nguồn của game thay được khi họ vắng. Họ biết điều qua đường truyền trong thế giới hư cấu, không là người đã sống mọi thời đại. Trước/sau chương phải phân biệt giọng nhân vật địa phương với narrator trình bày nguồn.

Nhân vật kể có thể nhớ thiếu; phần chuyển thể tách bằng thẻ nguồn, không dùng lời kể sai làm chân lý của game. Phản tư riêng không chuyển vào tri thức NPC. Muốn dùng câu người chơi tự viết trong đối thoại cần họ chọn chia sẻ, không tự đọc ra trước người khác. Những nguyên tắc này giữ người kể có đời sống, đồng thời không để sự vắng mặt của một companion khóa cốt truyện Kinh Thánh.
