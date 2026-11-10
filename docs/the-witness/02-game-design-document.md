# 02 • Game Design Document

**Phụ lục chiều sâu 3.2 / runtime 0.4.0:** 25 bàn thao tác tại địa vật hiện hữu đã thay các xác nhận ngắn ở 12 Q, 5 L và 4 V. [Atlas 17](../STORY.md) sở hữu đặc tả phản ánh luật đang chạy; [nghiên cứu 16](10-source-register.md) giải thích căn cứ; [kịch bản 18](18-scene-craft-and-dialogue.md) tách dàn dựng đã có với phần tiếp theo. Các luật gồm tiền đề thao tác, phân người/vật, tuyến có kết nối/ngưỡng, nhiều khoản sổ, ghép nguồn và chia bản theo nơi nhận. Ba bố cục giấc mơ mở không có đáp án đạo đức. “Thử” chỉ phản hồi; “Thực hiện” qua model rồi ghi bước. Bản nháp lưu theo cảnh và ghi chú nằm đúng tầng, không cấp consent hoặc viết lại kết cục nguồn.

## 1. Thông số nền

Game phiêu lưu thám hiểm dẫn truyện điện ảnh (Cinematic Narrative Exploration RPG), hệ thống góc nhìn kép (Dual-Perspective: góc nhìn thứ ba điều hướng mặc định, hỗ trợ góc nhìn thứ nhất đắm mình qua phím V theo thông số tầm mắt 1.58m); single-player, chơi offline sau cài đặt. Tuyến truyện chính lấy **ba biến cố Kinh Thánh trọng tâm (Legends)** làm trục phát triển; 12 chương đời thường (Mortal World) đóng vai trò là những nhịp cầu nối kết, chuẩn bị và đáp lại.

> **Tuyên ngôn trải nghiệm v5.0:**  
> Người chơi đến vì một bí ẩn. Ở lại vì con người và những nơi chốn đáng khám phá. Ra về sau ba trải nghiệm Kinh Thánh có sức nặng riêng — và một quyết định làm chứng mà không ai có thể thực hiện thay họ.

**Logline C+ (Story Bible v5.0):**  
Trong bối cảnh Xêdarê cuối thập niên 50 sau Công nguyên (khoảng 58–60 CN), một người chuyển thư trở về sau cái chết của cha và phát hiện hồ sơ hàng cứu trợ đang bị thao túng, những người liên quan bị gây áp lực giữ im lặng và một bản sửa giả có thể biến người chết thành kẻ gánh tội duy nhất. Người Chứng lần theo dấu vết qua cảng, đường đồi, Galilê và Giêrusalem, rồi đối diện sự thật rằng chính mình từng thấy một sai phạm nhưng chọn im lặng vì sợ hãi. Ba trình thuật Kinh Thánh mở ra những cuộc phiêu lưu độc lập về giải thoát, giới hạn quyền lực và trách nhiệm.

**Cú móc cốt lõi:**  
*“Bạn là nhân chứng mà kẻ thù đã bỏ sót — vì bạn từng tự chọn im lặng.”*

### Kiến trúc hai tầng nhân vật (Dual-Tier Persona):
- **Tầng Thánh (Canon Lock 100%):** Các nhân vật Kinh Thánh (Môsê, Đavít, Phêrô, Đức Giêsu) hiện diện tôn nghiêm, hành động và lời thoại khóa chặt theo văn bản Kinh Thánh.
- **Tầng Người (Player Agency & RPG Skills):** Người chơi điều khiển **Nhân Chứng Vô Danh (Anonymous Biblical Witness)** có mặt trực tiếp tại hiện trường (Hộ vệ khóa đuôi ở Biển Đỏ, Trinh sát hang ở En Ghêđi, Phụ việc thuyền ở hồ Galilê), vận dụng trọn vẹn 4 kỹ năng RPG (Quan sát, Thủ công, Giao tiếp, Tự vệ) để giải quyết các thách thức địa hình, cứu hộ và kiềm chế bạo lực.
- **Ở Mortal World:** Người chơi điều khiển **Người Chứng** (người chuyển thư kiêm sao chép bản thảo năm 58–60 CN tại Xêdarê) cùng 4 bạn đồng hành điều tra minh oan cho cha, vạch trần Bản sửa giả của Varro và bảo vệ các nhân chứng địa phương.

### Vòng lặp Khám phá AAA (Diegetic 3D Exploration Loop):
Thay vì các bảng chọn 2D tĩnh, trải nghiệm khám phá được diễn đạt trực tiếp trong không gian 3D:
1. **Quan sát bất thường trong không gian:** Nhìn thấy tải trọng nghiêng, vết bùn lún sâu ngập bánh, khoảng hở trụ đá hẹp 1.05m vs 1.75m trục xe, vết cạo mực dưới ánh sáng xiên.
2. **Thao tác vật lý & Thử nghiệm thực địa:** Tự tìm đòn nêm chèn bánh, hạ vò nặng đổi trọng tâm, nối vệt bánh kép song song, thử tải bằng vai trước khi rút chốt.
3. **Phản hồi âm thanh & Giác quan sống động:** Tiếng gỗ nứt răng rắc, tiếng bánh xe lún bùn ướt (`mud-squelch`), tiếng sỏi nghiến giòn (`gravel-crunch`), tiếng dây gai cọ cọc gỗ (`rope-friction`), tiếng xe lăn rền vang (`cart-rumble`).
4. **Đối chiếu logic & Ghi nhận có trách nhiệm:** Xác lập claim dựa trên chuỗi nguồn độc lập và phạm vi đồng thuận thực tế của nhân chứng.

### Áp lực Cột mốc (Milestone Pressure):
Thay thế hoàn toàn đồng hồ đếm ngược 21 ngày cứng bằng ba nấc áp lực theo tiến trình câu chuyện: (1) Hồ sơ đang bị rà soát tại cảng; (2) Tuyến chuyển thư bị đóng dần; (3) Điểm tiếp nhận hồ sơ sắp mở. Người chơi tự do khám phá thế giới và xây dựng mối quan hệ mà không sợ game-over vì hết giờ.

### 1.1. Bảng nguyên tắc thiết kế và mẫu chống chỉ định (Design Tenets & Anti-Patterns Matrix)

| Lĩnh vực | Nguyên tắc xác lập (Design Tenets) | Mẫu chống chỉ định (Anti-Patterns tuyệt đối tránh) |
|---|---|---|
| **Bản văn Kinh Thánh** | Bảo toàn 100% diễn tiến, lời thoại và kết cục của bản văn; tôn trọng bối cảnh lịch sử cứu độ. | Chế lời cho Đức Giêsu; biến phép lạ thành mana/skill bấm nút; tạo nhánh lịch sử thay thế (alternate history). |
| **Đức tin & Tâm linh** | Khắc họa sự kinh ngạc, run sợ và niềm hy vọng chân thực của phận người trước công trình Thiên Chúa. | Chấm điểm đạo đức (Karma); thanh đo "mức độ được Thiên Chúa yêu"; dùng câu Kinh Thánh làm mật mã mở khóa cửa. |
| **Quyền chủ động (Agency)** | Quyền chủ động của người chơi nằm ở việc thám hiểm, gia cố công cụ, cứu người yếu thế và kiềm chế bạo lực. | Biến Legends thành Walking Simulator chỉ đi bộ và xem phim; tước bỏ kỹ năng RPG khi vào cảnh Kinh Thánh. |
| **Xung đột & Chiến đấu** | Tự vệ phi sát thương, bảo vệ đồng đội, kiểm soát khoảng cách và rút lui chiến thuật. | Boss fight thanh máu khổng lồ; farm điểm hạ gục (XP farming); bạo lực trả đũa đối thủ đã đầu hàng. |
| **Hệ thống điều tra** | Suy luận dựa trên đối chiếu nguồn độc lập, tôn trọng ranh giới và quyền từ chối của nhân chứng. | Mini-game nối dây bói toán; hiển thị phần trăm tội trạng nhân tạo (87% có tội); ép nhân chứng lộ tên khi chưa đồng thuận. |

## 2. Vòng chơi

**30–90 giây:** quan sát → xác định vật/người có ích → thao tác → phản hồi nghe/nhìn → lựa chọn tiếp theo. Một manh mối phải có dấu hình thể, lời mô tả và phản ứng kiểm chứng; không chỉ sáng viền.

**10–25 phút:** nhận một nhu cầu có người chịu thiệt → đi theo ít nhất hai hướng điều tra → xử lý trở ngại → chọn hành động → thấy hậu quả cục bộ → mang món nợ hoặc quan hệ về hub.

**Một hồi:** chuẩn bị qua thám hiểm đời thường → đi hết Legend trục bằng định dạng phù hợp → phản tư tự chọn/chuyển cảnh → thực hiện việc tiếp nối trong Mortal. Hồi I L01, hồi II L02, hồi III L04; mỗi hồi có một chương bắt buộc. Veil và Legends mở rộng là nhánh tùy chọn, không chặn chuỗi này. Không farm điểm đạo đức để mở bản văn.

**Toàn chiến dịch:** hoàn tất ba mốc bản văn theo thứ tự; giữa chúng, năng lực và quan hệ mở cách thám hiểm/hành động khác. Ba mốc là tiến độ chính, không phần thưởng phụ của vụ kho. Lựa chọn đời thường giữ hệ quả xã hội riêng, không dùng để suy mức đức tin.

## 3. Động từ và điều khiển

- Di chuyển: đi, chạy ngắn, cúi, bám mép theo tuyến xác định, vượt chướng ngại thấp, kéo người bị thương. Không free-climb mọi bề mặt.
- Tương tác: xem, nghe, hỏi, đối chiếu, mang, đặt, buộc dây, mở lối, giúp đỡ. Một nút tương tác ngữ cảnh; nút riêng để hủy và lùi.
- Điều tra: đánh dấu nguồn, so sánh vật, ghi giả thuyết, hỏi xác nhận. Sổ hỗ trợ ghi nhớ, không tự giải án.
- Xung đột: né, đỡ, đẩy, đánh nhanh, đánh có lực, rút lui, gọi hỗ trợ. Khóa mục tiêu tùy chọn.
- Hội thoại: chọn ý định được diễn đạt rõ; không chọn “nói thẳng” rồi nhân vật tự buột miệng một lời xúc phạm khác nghĩa.
- Tay cầm: cần trái di chuyển, cần phải nhìn, cò trái phòng thủ, cò phải đánh có lực, nút mặt cho tương tác/né/đánh nhanh; toàn bộ được đổi gán. Đây là bố trí đề xuất, kiểm thử công thái học trước khi khóa.

## 4. Khám phá theo vùng

Không gian ưu tiên là ba level Legends trong hồ sơ 14: trại–bờ, khe–hang, thuyền–bờ hồ. Mỗi level có vòng khám phá và điểm hội tụ theo nguồn; đường khác thay cách làm/quan sát, không đổi canon. Ba vùng Mortal dùng hub, tuyến hành trình và không gian cầu nối tiết chế. Bản đồ nén có nhãn [H], không công bố tỷ lệ địa lý thật. Mốc hình dáng và mô tả chữ hỗ trợ định hướng; marker tùy chọn. Không kéo dài đường trống để tăng tỷ trọng Legends.

### 4.1. Khung cơ chế Quản lý Trạng thái Nhóm & Môi trường trong Legends (Group Composure Framework)

Để tối ưu hóa kiến trúc kỹ thuật và bảo đảm tính nhất quán trong trải nghiệm, cả 3 chương Legends được vận hành trên **cùng một Core Engine** thống nhất: **Khung Quản lý Trạng thái Nhóm & Đọc Môi trường (Group Composure & Environmental Reading)**. Thay vì viết 3 hệ thống rời rạc, game dùng chung một bộ thông số và động từ tương tác:

| Tham số / Cơ chế | L01: Xuất Hành 14 (Biển Đỏ) | L02: 1 Samuel 24 (Hang En Ghêđi) | L04: Gioan 21 (Hồ Galilê) |
|---|---|---|---|
| **Thanh trạng thái nhóm (Group Composure)** | **Độ gắn kết đoàn (Caravan Cohesion):** Giảm khi xe thồ kẹt bùn, gió lốc tạt tắt đèn bão, hoặc súc vật hoảng loạn. | **Kỷ luật im lặng (Acoustic Restraint):** Giảm khi phát ra tiếng động cơ học hoặc đồng đội nổi giận đòi tuốt gươm. | **Nhịp đồng tâm & Sức bền (Seamanship Sync):** Giảm khi chèo ngược dòng nước lạnh hoặc lưới mắc đá ngầm. |
| **Tương tác Môi trường (Quan sát + Thủ công)** | Soi đèn hiệu tìm dải đá khô; chèn ván gỗ kích trục bánh xe lún; chằng dây neo qua vũng sình. | Lắng nghe tiếng bước chân vọng trong vòm đá; căng dây dẫn đường trên vách đá vôi tối. | Đọc gợn sóng luồng nước sương mù; gỡ mắt lưới rê 3 lớp; giữ căng dây kéo mẻ 153 cá lớn. |
| **Tương tác Con người (Giao tiếp + Tự vệ)** | Hô hiệu lệnh trấn an các gia đình; dùng khiên chắn chặn gia súc chen lấn xô đẩy. | Ra hiệu tay trong tối; dùng tay ghìm chặt bao kiếm của chiến binh cực đoan để ngăn ám sát Saun. | Bắt nhịp hô chèo cùng Phêrô và Gioan; chia sẻ khoảng lặng tâm lý trĩu nặng trên mạn thuyền. |
| **Hình phạt thất bại (Non-Canon Fail State)** | Đoàn bị đứt quãng $\rightarrow$ Màn hình mờ đi trong bão cát, hồi về checkpoint gần nhất (không tạo cảnh dân chết). | Rơi vũ khí gây tiếng vang $\rightarrow$ Bị lính canh phát hiện, hồi về checkpoint trước khi Saun bước vào hang. | Lưới rối hoặc thuyền lệch dòng $\rightarrow$ Thao tác gỡ lại nhịp chèo/kéo từ checkpoint trước đó. |

## 5. Chiến đấu và thoát hiểm

Mục tiêu chiến đấu: tạo khoảng trống để bảo vệ, rút lui hoặc kiểm soát tình huống. Không dùng XP theo số người giết. Nhân vật thường đối đầu 1–3 đối thủ hoạt động; số này là giả định cân bằng cho prototype, không phải chuẩn chất lượng đã đạt.

Hai tài nguyên thân thể: sức khỏe và sức bền. Sức bền dùng cho né/đỡ/đánh nặng; cạn thì phòng thủ yếu đi, không khóa chạy thoát hoàn toàn. Prototype khởi tạo 100 sức bền; né 20, đỡ chịu đòn 15, đánh nặng 25, hồi 15/giây sau 1 giây không hành động. Dùng số này để đo cảm giác, không đưa vào canon thiết kế vĩnh viễn.

Vũ khí v1: gậy, khiên nhỏ và công cụ lao động theo vùng; kiếm chỉ xuất hiện ở encounter đã xét ngữ cảnh. Không phép nguyên tố, không thánh tích tăng sát thương, không “lửa đức tin”. Đòn đẩy có thể làm đối thủ rơi nguy hiểm; non-lethal không được mặc định chỉ vì nút tên “đẩy”. Level phải phân biệt vùng an toàn và vùng chết người.

Ba archetype đối thủ hư cấu: kẻ áp sát dễ lộ đòn; người giữ khiên cần đổi góc; người cảnh giới gọi tiếp viện. Thủ lĩnh kho là người có công cụ gây áp lực, không phải boss có máu lớn. Có phương án né tránh, đàm phán hoặc chia cắt cho encounter chính. Chương Giêrêmia và Phêrô không cấy combat để đủ tỷ lệ.

Thua Mortal World: checkpoint trước encounter; một số nhiệm vụ có trạng thái bị bắt/mất đồ nếu đã viết nhánh hợp lệ. Không tự động mất bạn đồng hành vĩnh viễn do lỗi AI. Thua Legends: phục hồi đoạn chơi trước; không ghi một lịch sử thay thế. Không phát thưởng “săn lính La Mã” theo sắc tộc hoặc tôn giáo.

## 6. Điều tra và đối thoại

Manh mối có loại **vật chứng / lời chứng / suy luận / lời đồn** và nguồn. Sổ thể hiện “đã thấy”, “được kể” và “chưa xác minh”. Người chơi kết nối hai mục để tạo giả thuyết; giả thuyết sai được phép giữ và sửa. Khả năng Quan sát làm rõ chi tiết vật lý; không nhìn thấy linh hồn, thiện ác hay sự thật tuyệt đối.

Một yêu cầu thuyết phục có ba thành phần: thông tin người chơi biết, nhu cầu của NPC và mức an toàn của tình huống. Không tung xúc xắc bí mật khiến câu trả lời đúng bị khóa ngẫu nhiên. Kỹ năng mở cách hỏi hoặc giảm chi phí; một chứng cứ mâu thuẫn không trở thành đúng vì chỉ số cao. Thất bại hỏi chuyện có lối khôi phục bằng hành động hữu ích, nguồn thứ hai hoặc chờ điểm hẹn; không spam cùng câu để tăng tin cậy.

## 7. Tiến triển

Bốn năng lực: **Quan sát**, **Thủ công**, **Giao tiếp**, **Tự vệ**. Mỗi năng lực ba bậc; tổng 8 điểm phát triển trong chiến dịch buộc ưu tiên, có thể học lại tại hub sau hồi I bằng tài nguyên thường. Điểm nhận khi hoàn thành cột mốc, không vì cầu nguyện hay thuộc câu Kinh Thánh.

Ví dụ: Quan sát I phân biệt mép giấy mới/cũ, II phát hiện dấu sửa sổ, III đối chiếu chuỗi nguồn nhanh hơn. Thủ công I buộc dây an toàn, II dựng đòn bẩy, III sửa cơ cấu có tải. Giao tiếp I nêu câu hỏi mở, II tổ chức lời chứng nhiều người, III thương lượng bảo đảm. Tự vệ I đỡ tốt, II giải giữ, III bảo vệ bạn trong lúc rút. Mỗi lối tối thiểu đều phải hoàn thành được với kỹ năng cơ bản.

### 7.1. Kế thừa Kỹ năng giữa Mortal và Legends — Cơ chế "Sự Thấu Cảm của Người Nghe" (Listener's Attunement)

Thay vì tách rời kỹ năng hoặc giải thích bằng yếu tố du hành thời gian giả tưởng, dự án áp dụng cơ chế **Sự Thấu Cảm của Người Nghe (Listener's Attunement / Narrative Lens)**:
- **Logic tự sự:** Các chương Legends được tái hiện thông qua tâm trí và sự hình dung của Người Chứng khi lắng nghe lời kể từ các nhân chứng sống (Natan, Damar, Miriam). Do đó, sự rèn luyện và trình độ kỹ năng thực tế của Người Chứng tại Mortal World (Xêdarê) đóng vai trò là "lăng kính nhận thức" định hình độ nhạy bén và năng lực xoay xở của Nhân Chứng Vô Danh trong biến cố Kinh Thánh.
- **Ma trận kế thừa kỹ năng (Skill Carryover Matrix):**

| Năng lực Người Chứng (Mortal) | Tác động cụ thể lên Nhân Chứng Vô Danh (Legends) |
|---|---|
| **Thủ công I / II / III** | **L01:** Bậc II mở khả năng dựng đòn bẩy kích bánh xe thồ lún bùn nhanh gấp đôi và mở lối tắt qua bãi đá ngầm.<br>**L04:** Bậc II giúp gỡ mắt lưới rê 3 lớp mắc cạn nhanh gấp đôi và giảm 50% thể lực tiêu hao. |
| **Giao tiếp I / II / III** | **L02:** Bậc II mở tùy chọn đối thoại thì thầm thuyết phục đồng đội hạ kiếm xuống mà không gây tiếng động cơ học.<br>**L01:** Bậc II giúp hô hiệu lệnh trấn an lập tức một cụm gia đình đang hoảng loạn, hồi phục Cohesion. |
| **Quan sát I / II / III** | **L02:** Bậc II phát hiện từ sớm tiếng vọng bước chân quân lính Saun trên vách đá vôi, mở đường né tránh trên cao.<br>**L04:** Bậc II đọc được dòng chảy ngầm và gợn sóng đêm để định hướng thuyền không bị trôi dạt. |
| **Tự vệ I / II / III** | **L01:** Bậc II dùng khiên chặn đứng đàn gia súc xô đẩy mà không gây thương tích cho súc vật.<br>**L02:** Bậc II cho phép áp sát khóa tay tước vũ khí lính tuần trong im lặng tuyệt đối nếu bị tiến sát. |

Lợi ích thiết kế: Gắn kết hữu cơ giữa hành trình chuẩn bị đời thường với trải nghiệm trục Kinh Thánh. Người chơi thấy rõ giá trị thực tiễn của từng điểm kỹ năng mình đầu tư tại Xêdarê.

Trang bị thay chức năng: túi thêm chỗ dụng cụ, dép giảm tiếng bước, áo mưa giảm ảnh hưởng thời tiết. Không áo “+20 thánh thiện”. Hành trang có 6 ô dụng cụ, vật nhiệm vụ không chiếm ô và không thể vô tình bán. Giới hạn này là mục tiêu prototype. Tài nguyên gồm thực phẩm, dầu đèn, vải, dây và tiền quy ước; không giả vờ mô phỏng tỷ giá cổ đại nếu chưa có nguồn.

Kinh tế không cho hủy cứu trợ để farm. Kho đã nhận hàng không bán lại vô hạn; giá theo chương có biên độ rõ. Nghỉ ở nơi an toàn hồi phục cơ bản, thức ăn hỗ trợ chuẩn bị; không bắt grind để được tiếp tục truyện.

## 8. Quan hệ và hệ quả

Quan hệ lưu **tin cậy -2…+2**, **bất đồng theo chủ đề**, **lời hứa**, **hành động đã chứng kiến**. Tin cậy không đồng nghĩa đồng ý; Miriam có thể tin người chơi nhưng phản đối cách công bố danh sách. Giao diện dùng ngôn ngữ: “Cô ấy tin bạn giữ lời”, không “Miriam +5”. Không tồn tại thanh đo mức được Thiên Chúa yêu.

Hệ quả chia theo thời gian: phản ứng ngay; thay đổi điểm chờ sau khi quay hub; thay đổi đường tiếp cận nhiệm vụ sau; một câu và một hình ảnh ở kết thúc. Mỗi lựa chọn lớn cần ít nhất hai tầng hệ quả, một trong số đó có tác động chơi được. Người chơi có thể hối cải và sửa thiệt hại ở nhánh hư cấu; sửa lỗi không xóa ký ức của NPC.

## 9. Luật ba tầng

Mortal World ghi trạng thái vật chất, nguồn chứng cứ, quan hệ và đồng thuận. Legends dùng loadout riêng; được ghi `legendProgress`, `campaignProgress.requiredLegends`, `unlockedBridgeContext`. Cổng sau Q03/Q06/Q10 kiểm các beat và phần kết của L01/L02/L04 trước khi mở Q04/Q07/Q11. Chỉ cập nhật một boolean `completed` không đủ hợp đồng v3. Legends không ghi inventory Mortal, chứng cứ, tội NPC, đồng thuận hoặc chỉ số cứu độ.

**Thay bất biến skip:** *Chơi chương* và *Xem/nghe tóm tắt* truyền cùng core beat; đến phần kết và chọn tiếp tục đều đủ cổng. Bấm chọn tóm tắt không tự hoàn thành. *Thoát/để sau* lưu checkpoint, cổng còn thiếu. Không có quiz, yêu cầu chọn ý đúng hoặc thời gian đọc tối thiểu. Phản tư được để trống, không được hệ thống tự gán. Hai Legend mở rộng và bốn Veil được bỏ hẳn; chúng không giảm tập cơ hội ending.

Inner Veil chỉ ghi `veilProgress` và phản tư tự chọn. Không ghi chứng cứ, an toàn nhân chứng, tài nguyên hay tội trạng. Bỏ Veil quay về điểm an toàn; hoàn thành/skip Veil không thay thế Legend bắt buộc. Replay mọi lớp không lặp thưởng, cổng hoặc sự kiện xã hội.

Trước Legends hiện: “Chương chuyển thể từ [sách, chương, câu]. Bố cục và một phần tương tác được sáng tác.” Trước Veil hiện: “Giấc mơ hư cấu — ẩn dụ nghệ thuật, không thuộc bản văn Kinh Thánh.” Sau cảnh có thể mở so sánh “bản văn / chuyển thể”. Không dùng một nhãn mơ hồ chung cho cả hai.

## 10. UI, âm thanh và tiếp cận

HUD mặc định có mục tiêu ngắn, prompt và nguy hiểm khi cần. Sổ đặt **Hành trình Kinh Thánh** trước, hiển thị mốc Legend và phần “Chuẩn bị / Tiếp nối”; các tab Người / Việc / Dấu vết / Nguồn / Phản tư hỗ trợ. Màn tiếp tục và hồi tưởng cuối luôn đọc được ba mốc trục. Tìm kiếm không bắt nhớ phiên âm; tên Việt/quốc tế ở lần xuất hiện đầu. Không gắn nhãn “phụ bản” cho ba Legend bắt buộc.

Yêu cầu v1 [định hướng từ S17]: phụ đề đổi cỡ và nền, tên người nói, phụ đề âm thanh thiết yếu; remap, hold/toggle, thay mash bằng giữ; không puzzle chỉ dựa vào màu/âm; chỉnh camera, tắt head-bob, rung, blur; pause khi đọc; chế độ thời gian thoải mái; gợi ý 3 cấp; xem lại hội thoại; tự lưu và lưu tay ngoài combat; tùy chọn giảm hình ảnh đau khổ nhưng vẫn giữ ý nghĩa cốt truyện. Cảnh siêu nhiên không dùng nháy chớp làm chìa khóa gameplay.

Độ khó tách combat, điều hướng và puzzle. Chế độ kể chuyện không phạt quyền nhận kết thúc. Ngôn ngữ đầu tiên tiếng Việt; glossary Anh–Việt dùng chung mã, nội dung thiết kế không gắn cứng tên hiển thị vào logic.

## 11. Ngân sách nội dung và tiêu chí

Phạm vi: **3 Legend trục + 2 Legend mở rộng**, 12 Q cầu nối, 6 quest quan hệ, 4 Veil tự chọn; 3 hub Mortal, 4 companion và 8 NPC tái xuất. Không tăng số lượng từ v2, nhưng đổi thứ bậc và ngân sách. `bridgeQuests` thay tên trường `mainQuests` trong hợp đồng thiết kế; ID Q/L vẫn bền. Ba archetype combat chỉ là phạm vi tối đa, cắt được nếu thám hiểm cần nguồn lực.

Slice cần chứng minh Legends là lõi qua hồi tưởng không gợi ý, hoạt động thám hiểm có ý nghĩa và câu hỏi cốt truyện; đồng thời giữ hai lối tiếp nối, hỗ trợ và định dạng tóm tắt. Protocol/ngưỡng ở hồ sơ 07/09. Chưa có người chơi thử v3.

## 12. Cấu trúc thiết kế từng chương cầu nối (Q01–Q12)

Mỗi chương cầu nối đời thường được thiết kế với một trọng tâm tương tác và thử thách riêng biệt:
- **Q01 (Vertical Slice Mở màn — One-Shot Camera):** Cập bến cảng Sebastos hoàng hôn Địa Trung Hải; 9 nhịp phân cảnh (Beats 00–08); xoay vật thể 3D Close Inspection phát hiện vết khâu gáy lệch; cứu hộ môi trường tại bốn vùng chức năng cao độ (C0 cầu cảng/sân hàng, C1 kho trệt và gác lửng cứu hộ, C-1 rãnh bảo trì ngầm, C+1 sàn tời và sân mái; không phải bốn tầng nhà độc lập xếp chồng) với đa tuyến (xe tải đối trọng C0 + ròng rọc C+1 cùng Titus hoặc hợp lực thợ cảng nâng xà sồi); quan sát 4 thuộc tính giới hạn từ sân mái C+1 (sự cố ngoài dự tính khi người thuộc mạng lưới Rufus thu hồi tài liệu theo sự thật tác giả T10; avatar tại Q01 chỉ quan sát hiện tượng, chưa thể suy luận danh tính hay vai trò của Rufus); hạt mầm Witness Consent từ Yosef; lựa chọn sinh hoạt lodging/meal; đối thoại cận cảnh Natan (Scene A) và sự thật im lặng T05; trạng thái kho sau cháy bền vững; ghi nhận hiện tượng vết cạo B06 sơ bộ (thu thập và thẩm định vật chứng E02 diễn ra tại Q02); cờ Q01.COMMITTED mở Q02.
- **Q02:** Điều tra thực địa song hành cùng nhiệm vụ bảo vệ nhân chứng yếu thế.
- **Q03:** Khảo sát các tuyến đường ven thành và kiểm chứng nhận định.
- **Q04:** Phân tải vận chuyển và mở lối đi an toàn.
- **Q05:** Tái dựng lịch trình phân phối hàng và lựa chọn phương thức thông báo.
- **Q06:** Tiếp cận mục tiêu và giới hạn xung đột thể chất.
- **Q07:** Đàm phán cam kết và phân công trách nhiệm.
- **Q08:** Chuẩn bị cứu hộ thực địa và chằng buộc bảo toàn tài liệu trong lũ.
- **Q09:** Xin phạm vi cho phép của người làm chứng và bảo vệ quyền từ chối.
- **Q10:** Đối chiếu hai bản chép và nhận diện phần sai lệch của gia đình.
- **Q11:** Phân công đội ngũ và diễn tập kế hoạch công bố.
- **Q12:** Thực thi phương án làm chứng đã chọn.

Hai chương liền kề không lặp lại cùng một động từ chủ đạo hay dạng chướng ngại. Mỗi nhiệm vụ cung cấp một lối đi cơ bản cho mọi cấu hình nhân vật, một lối đi biến thể đòi hỏi phối hợp kỹ năng/đồng đội, và ít nhất một hệ quả cụ thể tác động vào thế giới sau đó.

## 13. Hệ thống điều tra: Nối Claim với Nguồn chứng cứ
*(Nguồn sở hữu duy nhất về sự thật nền, điều kiện evidence/claims, lineage và consent: [Hồ sơ 12 Continuity](12-continuity-and-state.md). Mục này chỉ mô tả đặc tả giao diện và luồng xử lý UI/UX).*

Sổ tay điều tra hoạt động trên nguyên tắc đối chiếu nguồn độc lập:
1. **Xác định mệnh đề cần kiểm chứng (Claim):** Người chơi chọn một nhận định cụ thể (P01–P04).
2. **Thu thập và đối chiếu vật chứng/lời chứng (Evidence & Sources):** Đặt các nguồn độc lập (E01–E10) cạnh nhau để kiểm tra tính nhất quán.
3. **Xác lập kết luận trong phạm vi chứng minh:** Chỉ đưa ra các khẳng định có đủ căn cứ độc lập; phần thiếu được ghi nhận là "chưa được giải trình".

Trạng thái vật lý của đồ vật và giá trị pháp lý/sự thật được phân định rạch ròi. Kỹ năng Quan sát giúp phát hiện các dấu hiệu vật lý (vết cạo mực, mép giấy mới/cũ) nhưng không thay thế cho việc xác minh nhân chứng.

### 13.1. Đặc tả Giao diện Sổ tay & Luồng Đối chiếu Chứng cứ (Evidence Board Specification)

Sổ tay (Journal) là trung tâm điều phối thông tin của toàn bộ chiến dịch. Dưới đây là đặc tả bố cục giao diện (UI Wireframe) và luồng xử lý trạng thái:

```text
+----------------------------------------------------------------------------------------------------+
|                                      SỔ TAY ĐỐI CHIẾU CHỨNG CỨ                                     |
+------------------------------------+---------------------------------------+-----------------------+
| CỘT 1: MỆNH ĐỀ (CLAIMS P01–P04)    | CỘT 2: KHE CẮM NGUỒN ĐỘC LẬP (SLOTS)  | CỘT 3: QUYỀN CÔNG BỐ  |
+------------------------------------+---------------------------------------+-----------------------+
| [•] P01: B06 không khớp số lượng   | [ KHE CẮM A ] : E02 (Mép sổ sửa B06)  | HUY HIỆU CONSENT:     |
| [ ] P02: G17 thiếu 4 bao tại bến   | [ KHE CẮM B ] : E03 (Lời chứng Rina)  | [X] CÔNG KHAI (Named) |
| [ ] P03: Haddai nhận lỗi ký trước  |                                       | [ ] ẨN DANH (Summary) |
| [ ] P04: Hanan ra lệnh chuyển hàng | TÌNH TRẠNG: [ ĐÃ XÁC THỰC ĐỘC LẬP ]   | [ ] TỪ CHỐI (Revoked) |
+------------------------------------+---------------------------------------+-----------------------+
| * CẢNH BÁO KIỂM TRA PHÁP LÝ (SOURCE LINEAGE CHECK):                                                |
| - Nếu người chơi cắm 2 bản sao cùng gốc (ví dụ hai bản chép của thẻ kho E06):                     |
|   -> UI hiển thị cảnh báo đỏ: [CẢNH BÁO: TRÙNG NGUỒN GỐC — CHƯA ĐỦ ĐIỀU KIỆN XÁC THỰC ĐỘC LẬP].   |
| - Mệnh đề chỉ được xác nhận khi có ít nhất 2 nguồn khác nhau về Lineage (Vật chứng + Nhân chứng).   |
+----------------------------------------------------------------------------------------------------+
```

### 13.2. Màn hình Tiến trình Kinh Thánh & Khóa Mở Nguyên Lý (Witness Tenets Screen)

```text
+----------------------------------------------------------------------------------------------------+
|                                TIẾN TRÌNH KINH THÁNH & NGUYÊN LÝ CHỨNG NHÂN                        |
+----------------------------------------------------------------------------------------------------+
| [ĐÃ KHÓA CỔNG] L01: Xuất Hành 14 — Môsê & Biển Đỏ (50–60 phút)                                     |
|  └── NGUYÊN LÝ ĐẠT ĐƯỢC: "LỐI ĐI CHƯA THẤY" (The Path Unseen)                                      |
|      └── Mở khóa: Phương án Thứ Ba (Third Way) giải cứu và phân tải an toàn trong Q04.            |
+----------------------------------------------------------------------------------------------------+
| [ĐÃ KHÓA CỔNG] L02: 1 Samuel 24 — Đavít & Hang En Ghêđi (45–50 phút)                               |
|  └── NGUYÊN LÝ ĐẠT ĐƯỢC: "RANH GIỚI QUYỀN LỰC" (Restraint of Power)                                |
|      └── Mở khóa: Phương án Thứ Ba (Third Way) đàm phán giải trừ bạo lực danh dự trong Q07.       |
+----------------------------------------------------------------------------------------------------+
| [ĐÃ KHÓA CỔNG] L04: Gioan 21 — Phêrô & Bờ Hồ Ti-bê-ri-a (40–45 phút)                               |
|  └── NGUYÊN LÝ ĐẠT ĐƯỢC: "SỨ VỤ ĐƯỢC TRAO LẠI" (The Shared Calling)                                |
|      └── Mở khóa: Phương án Thứ Ba (Third Way) công bố sự thật và hòa giải toàn vẹn trong Q11–Q12.|
+----------------------------------------------------------------------------------------------------+
```

## 14. Hệ thống áp lực thời gian và Chuẩn bị thực địa

- **Lượt công việc hữu hình:** Các giai đoạn có áp lực (như Q03, Q07) áp dụng số lượt logic được báo trước minh bạch; việc tạm dừng, tra cứu sổ hoặc đọc phụ đề không tiêu tốn lượt.
- **Chuẩn bị cứu hộ (Q08):** Kết quả cứu nạn (cứu người và cứu tài liệu) phụ thuộc vào sự chuẩn bị thực tế (điểm neo dây, người giữ bờ, cách bọc da chống nước). Chuẩn bị chu đáo bảo đảm toàn vẹn cả người lẫn hồ sơ mà không ép tạo bi kịch nhân tạo.
- **Tự vệ có kiểm soát (Q06):** Rút lui thành công được tính là hoàn thành pha đụng độ. Khi đối phương không còn đe dọa, hệ thống ngăn chặn các đòn nối vô thức để tránh biến tự vệ thành trả thù.
- **Hậu cần cộng đồng:** Tài nguyên (thực phẩm, dầu đèn, dây thừng, dụng cụ) được gắn với nhu cầu cụ thể của từng địa điểm và con người, thúc đẩy sự phân bổ chiến lược qua các giai đoạn.

## 15. Hệ thống cam kết, Tự chủ companion và Công bố sự thật

- **Hệ thống lời hứa:** Ghi nhận đối tượng, nội dung, thời hạn và điều kiện. Trạng thái cam kết được theo dõi từ khi đề xuất, chấp nhận, thực hiện, tới hoàn tất hoặc thương lượng lại.
- **Quyền tự chủ của bạn đồng hành:** Mỗi người bạn đồng hành giữ vững giới hạn đạo đức và ưu tiên riêng. Họ có quyền từ chối tham gia các hành động vi phạm ranh giới cá nhân mà không làm đổ vỡ cốt truyện chính.
- **Quy trình công bố sự thật (Q12):** Trước khi công bố, hệ thống kiểm tra danh sách chứng cứ, sự đồng thuận của nhân chứng (Consent) và tình trạng an toàn của các bên liên quan. Người chơi lựa chọn giữa: công bố công khai có đồng thuận, bảo mật qua nhóm giám sát tin cậy, hoặc ưu tiên di tản người gặp nguy hiểm.

## 16. Ngân sách chiều sâu và Tái cân bằng Thời lượng (Pacing & Duration Rebalancing)

Để khắc phục triệt để hiệu ứng "kéo giãn nhân tạo" (padding) làm loãng sự tôn nghiêm của bản văn Kinh Thánh, thời lượng của 3 chương Legends được co gọn nhưng tăng cường tối đa mật độ tương tác có ý nghĩa:
- **L01 (Môsê — Xuất Hành 14):** **50–60 phút** (thay vì 80 phút). Đại cảnh quy mô nhất, nhịp độ khẩn trương giữa cuồng phong và rẽ biển. Co gọn để người chơi không phải đi bộ quá lâu trong lòng biển, giữ trọn vẹn cảm giác choáng ngợp và kịch tính.
- **L02 (Đavít — 1 Samuel 24):** **45–50 phút** (thay vì 70 phút). Không gian hang En Ghêđi khép kín, tập trung vào trải nghiệm nín thở (stealth & restraint). Độ dài này lý tưởng để duy trì sự căng thẳng thính giác mà không gây mỏi mắt trong bóng tối.
- **L04 (Phêrô — Gioan 21):** **40–45 phút** (thay vì 66 phút). Không gian lắng đọng, giàu chất thơ và chiều sâu tâm lý. 40 phút là độ dài vàng để chuyển tải trọn vẹn từ đêm lạnh trắng tay sang rạng đông Phục Sinh và bữa điểm tâm trao sứ vụ.

### Định nghĩa "Legends là Cốt truyện chính" bằng Trọng số Quyết định (Narrative Weight):
Không định lượng tầm vóc cốt truyện đơn thuần bằng tỷ lệ số phút (25–30%). Vị thế "trục chính" của Legends được đo bằng **Trọng số Quyết định**: Sau khi hoàn tất mỗi Legend, người chơi nhận được một **"Nguyên lý Chứng Nhân" (Witness Tenet)**. Nguyên lý này trực tiếp mở ra **Phương án Giải quyết Thứ Ba (Third Way Resolution)** ở các nhiệm vụ chốt chặn Mortal World:
- Hoàn tất L01 mở khóa phương án giải cứu chia tải độc quyền ở Q04.
- Hoàn tất L02 mở khóa phương án thương lượng không bạo lực độc quyền ở Q07.
- Hoàn tất L04 mở khóa phương án công bố bảo toàn nhân chứng độc quyền ở Q11–Q12.
Nhờ đó, dù chiếm thời lượng tinh gọn 25–28%, Legends nắm giữ **100% chìa khóa tư tưởng và giải pháp** cho toàn bộ cuộc điều tra thế kỷ I.

### Bảng phân bổ thời lượng chiến dịch chuẩn (Đích nhịp độ biên kịch v6 ~10 giờ):
*(Lưu ý phân tầng: Bảng dưới đây là Đích nhịp độ biên kịch tuyến chính v6 (~580 phút campaign / 145 phút Legends) — mục tiêu nhịp độ v6 chưa đo đạc qua playtest người thật; Hợp đồng v3 duy trì 720 phút / 216 phút Legends làm baseline blockout target của hợp đồng chưa đo. Khoảng chênh ~71 phút cho Legends là độ co giãn thiết kế giữa hai đề xuất biên kịch và blockout, không mặc nhiên là vùng đệm gameplay đã nghiệm thu. Cả hai là ước tính thiết kế chưa qua đo đạc playtest người thật, không thay thế lẫn nhau và không phải cam kết phát hành chính thức).*
| Thành phần | Thời lượng mục tiêu | Tỷ trọng | Vai trò trong trải nghiệm |
|---|---:|---:|---|
| **3 Legends trục (L01, L02, L04)** | 55 + 48 + 42 = **145 phút** | **25%** | **Trục cốt truyện chính:** biến cố Kinh Thánh, thám hiểm nhập vai |
| **12 Quest cầu nối (Q01–Q12)** | 120 + 130 + 110 = **360 phút** | **62%** | Cầu nối thế kỷ I: điều tra, quan hệ cộng đồng, thực thi trách nhiệm |
| **Hành trình & Hub liên kết** | **45 phút** | **8%** | Di chuyển giữa các vùng, đời sống bến cảng và xưởng thợ |
| **Inner Veil tự chọn** | **30 phút** | **5%** | Giấc mơ nội tâm phản tư nghệ thuật (có thể bỏ qua) |
| **Tổng cộng** | **580 phút (~9.7 giờ)** | **100%** | Đích nhịp độ biên kịch tinh gọn, mật độ cao |

### Bảng đối chiếu nhịp cốt lõi Level Beat (Core Beats B01–B06) của 3 Legends trục:

| Mã Beat | Trình thuật & Đoạn Kinh Thánh | Biến cố bản văn [K] | Hành động thám hiểm của Nhân Chứng Vô Danh [H] |
|---|---|---|---|
| **L01.B01** | Xuất Hành 14,1–10 | Quân Ai Cập đuổi sát; dân khiếp sợ | Khảo sát mép trại hậu phương; dò tìm trẻ em và người già chậm chân |
| **L01.B02** | Xuất Hành 14,10–14 | Môsê trấn an dân: "Đừng sợ..." | Dò 2 tuyến địa hình; dùng kỹ năng *Thủ công* kích bánh xe lún |
| **L01.B03** | Xuất Hành 14,15–20 | Cột mây di chuyển bọc hậu; lệnh tiến lên | Điều phối cụm gia đình; dùng *Giao tiếp* trấn an và *Tự vệ* ngăn hỗn loạn |
| **L01.B04** | Xuất Hành 14,21–25 | Gió đông rẽ biển; dân bước ráo chân | Dẫn đoàn khóa đuôi vào lòng biển; soi đèn hiệu giữ cự ly giữa các xe |
| **L01.B05** | Xuất Hành 14,26–29 | Biển ập lại vùi lấp chiến xa Pharaô | Hỗ trợ đẩy xe cuối lên bờ; chứng kiến quyền năng giải thoát |
| **L01.B06** | Xuất Hành 14,30–31 | Dân kính sợ Chúa và tin Môsê | Cùng cộng đoàn cất bài ca tạ ơn trên bờ cao; commit hoàn tất L01 |
| **L02.B01** | 1 Samuel 24,1–4 | Saun vào hang; Đavít ẩn trong đáy hang | Do thám vách đá En Ghêđi; căng dây định hướng trong lòng hang tối |
| **L02.B02** | 1 Samuel 24,5–6 | Đavít cắt vạt áo Saun; lòng áy náy | Dẫn đường áp sát Saun; kiềm chế đồng đội nóng nảy đòi rút gươm sát hại |
| **L02.B03** | 1 Samuel 24,7–8 | Đavít răn đe người mình không được hại vua | Ngăn chặn các chiến binh xông lên; giữ kỷ luật trật tự im lặng tuyệt đối |
| **L02.B04** | 1 Samuel 24,9–16 | Đavít bước ra sấp mình gọi Saun | Canh gác miệng hang; chứng kiến cuộc giãi bày công chính giữa Đavít và Saun |
| **L02.B05** | 1 Samuel 24,17–23 | Saun khóc tạ lỗi; hai bên thề ước hòa bình | Hộ tống Đavít rút lui an toàn lên núi; commit hoàn tất L02 |
| **L04.B01** | Gioan 21,1–3 | Đêm chài lưới trắng tay trên hồ Galilê | Điều phối nhịp chèo đôi; gỡ lưới rê 3 lớp mắc cạn; chia sẻ sự im lặng trĩu nặng |
| **L04.B02** | Gioan 21,4–8 | Tiếng gọi từ bờ; thả lưới bên phải; mẻ cá lớn | Nghe tiếng người lạ chỉ dẫn; quăng lưới bên mạn phải; chứng kiến Phêrô nhảy xuống biển |
| **L04.B03** | Gioan 21,9–14 | Bếp than hồng, bánh và cá nướng; 153 cá lớn | Chèo thuyền cập bến; cùng kéo mẻ cá 153 con vào bờ mà lưới không rách |
| **L04.B04** | Gioan 21,15–17 | Ba câu hỏi: "Con có yêu mến Thầy không?" | Giữ khoảng cách cung kính bên bếp than; chứng kiến việc phục hồi và trao sứ vụ chăn chiên |
| **L04.B05** | Gioan 21,18–19 | Lời tiên báo tương lai và mệnh lệnh: "Hãy theo Thầy!" | Quan sát Phêrô bước theo Chúa dọc dải bờ hồ rạng đông; commit hoàn tất L04 |

## 17. Tiêu chuẩn đánh giá chiều sâu và Cổng chất lượng

- **D1 — Tính mạch lạc:** Người chơi nhận diện rõ mục tiêu cần làm, hai dữ kiện đã xác nhận và một điểm nghẽn cần tháo gỡ.
- **D2 — Quyền chủ động:** Hoàn thành nhiệm vụ linh hoạt qua ít nhất hai hướng tiếp cận thực chất mà không phụ thuộc vào chỉ số may rủi.
- **D3 — Chiều sâu nhân vật:** Nhận diện được động lực và nhu cầu nội tại của NPC vượt ra ngoài vai trò hỗ trợ người chơi.
- **D4 — Tính hệ quả:** Mọi quyết định then chốt đều để lại dấu vết rõ ràng trong hành vi của NPC hoặc bối cảnh thế giới sau đó.
- **D5 — Tính trung thực với nguồn tư liệu:** Phân định rõ ràng giữa biến cố Kinh Thánh lịch sử [K] và tuyến truyện hư cấu đời thường [H].
- **D6 — Trọng tâm Kinh Thánh:** Người chơi tự nhiên cảm nhận ba biến cố Kinh Thánh là xương sống của toàn bộ hành trình trải nghiệm.
- **D7 — Bình đẳng định dạng:** Định dạng tương tác chi tiết và bản tóm tắt tinh gọn đều chuyển tải trọn vẹn các nhịp biến cố và chia sẻ cùng tiêu chuẩn mở cổng tiến độ.

## 18. Lịch sử cập nhật (Changelog)

- **v6.0 (Hiện hành — 10/11/2026):**
  - Tích hợp toàn diện Phần II Scene Systems C+ v6.0: Khảo cổ hiện trường 4 tầng (Sebastos C0–C+1, Antipatris 3 tuyến, Wadi W0–W2, Giêrusalem J0–J3).
  - Chuẩn hóa Companion-Driven Traversal với 6 bước interaction grammar (`spot → propose → prepare → execute → commit → fallback`) và 4 cặp phối hợp đồng hành.
  - Thiết lập Mechanical Resonance 4 lớp đồng bộ (cơ học, hình ảnh, âm thanh, cảm xúc) giữa 3 Legends trục và các thử thách Mortal.
  - Hệ thống hóa Dynamic World Callback qua 4 cấp áp lực Milestone Pressure (Cấp 0–3), bản đồ nhân quả 2 chiều và 3 lớp route topology (công khai, nghề nghiệp, bảo trì).
  - Đạo diễn Q12 thành Interactive Set-Piece 6 nhịp (B0–B5) thời gian thực với 3 route A/B/C.
  - Hoàn thiện Atlas vật chứng E01–E12, bộ lọc claim P01–P05 với provenance và scope nghiêm ngặt.
  - Thiết lập Ma trận bảo toàn cảnh cũ → v6 bảo đảm 100% 44 inspectable details và 31 activities từ doc 20.
  - Định nghĩa Gameplay & Engine Contract với schema độc lập, backlog dọc P0–P5 và tiêu chuẩn kiểm thử playtest khách quan.
- **v5.0:** Tích hợp Kịch bản Phân cảnh Chi tiết 9 nhịp (Beats 00–08) của Vertical Slice Prologue Q01, 5 định hướng chiến lược 3A, E11/E12 và P05.
- **v3.1:** Chuyển vai điều khiển trong Legends sang Nhân Chứng Vô Danh; mở khóa 4 kỹ năng RPG; 3 bộ cơ chế thám hiểm cho 216 phút Legends; Bảng nguyên tắc thiết kế; định danh quốc tế UNSEALED WITNESS: Legacy of the Covenant.
- **v3.0:** Tái cấu trúc chiến dịch với 3 Legends bắt buộc làm trục chính; 12 quest đời thường làm cầu nối.
- **v2.0:** Mở rộng hệ thống điều tra đa nguồn và cơ chế đối chiếu sổ sách.
- **v1.0:** Khung thiết kế ban đầu.

---

## 19. Hệ Thống Scene Systems & Năm Định Hướng Nâng Cấp Thiết Kế 3A (v6.0)

> [!IMPORTANT]
> **Quyền Sở Hữu Chi Tiết & Single Source of Truth (SSOT):**  
> Toàn bộ đặc tả kiến trúc, công thức tính toán, quy tắc cơ học, atlas vật chứng E01–E12 và ma trận bảo toàn cảnh hiện trường của 5 Trụ cột Chiến lược thuộc quyền sở hữu duy nhất của **[03 Narrative Bible — Phần II: Scene Systems v6.0](03-narrative-bible.md#phan-ii-scene-systems-c-v60-thiet-ke-canh-co-che-moi-tich-hop)**.  
> Phần dưới đây chỉ đóng vai trò tóm lược kiến trúc hệ thống và liên kết điều hướng trong Game Design Document.

### 19.1 Bảng Tổng Hợp 5 Trụ Cột Chiến Lược Scene Systems

| Trụ cột Chiến lược | Bản chất Hệ thống Gameplay | Phạm vi Áp dụng | Nguồn Chi tiết SSOT |
|---|---|---|---|
| **1. Khảo cổ Hiện trường Đa tầng** (*World-First Investigation*) | Chuyển hóa việc thu thập chứng cứ E01–E12 thành tương tác không gian kiến trúc và địa chất 3D: Cảng Sebastos 4 tầng (`C0, C1, C-1, C+1`), Đồi Antipatris 3 lựa chọn hình học (`Tuyến A/B/C`, vết lún bùn vs khổ trục 1.05m/1.75m), Wadi 3 cao độ sống (`W0, W1, W2`), Pháo đài thủ tục Giêrusalem 4 trạm (`J0, J1, J2, J3`). | Q01–Q12 | [Doc 03 · Mục 14](03-narrative-bible.md#14-khao-co-hien-truong-da-tang-world-first-investigation) |
| **2. Khám phá Đồng hành** (*Companion-Driven Traversal*) | Chiều sâu thám hiểm không combat dựa trên năng lực vật lý của 4 đồng hành: Titus (kết cấu/đòn bẩy), Lea (giám định văn thư/vải gai), Damar (địa hình/leo trèo/né lính), Miriam (hậu cần/cộng đồng). Vận hành qua quy trình 6 bước: `Spot → Propose → Prepare → Execute → Commit → Fallback`. | Q01–Q12 | [Doc 03 · Mục 15](03-narrative-bible.md#15-companion-driven-traversal-bon-cach-doc-cung-mot-the-gioi) |
| **3. Cộng hưởng Cơ chế Chơi** (*Mechanical Resonance*) | Các chương Legends tuân thủ Canon Lock 100% nhưng trực tiếp huấn luyện người chơi ngôn ngữ tương tác môi trường: L01 (gió đêm/cứu xe sụp cát) $\rightarrow$ Q04 & Q08 lũ quét; L02 (âm học vách đá/mảng tối) $\rightarrow$ Q06 & Q07 hành lang đêm; L04 (lao động tĩnh lặng/kéo lưới) $\rightarrow$ Q11 & Q12 ngày trở về cảng. | L01–L04 $\rightarrow$ Mortal | [Doc 03 · Mục 16](03-narrative-bible.md#16-mechanical-resonance-legends-day-ngon-ngu-moi-truong) |
| **4. World Callback Động theo Áp lực** (*Milestone Pressure*) | Thế giới 3D biến đổi thực thể theo 4 nấc Áp lực Hành chính (Cấp 0: Bình thường; Cấp 1: Rà sổ/niêm chì; Cấp 2: Trạm gác Rufus/đóng đường chính; Cấp 3: Thiết quân luật bến cảng). Luật topology 3 lớp route (công khai, nghề nghiệp, bảo trì). | Hồi I, II, III | [Doc 03 · Mục 17](03-narrative-bible.md#17-dynamic-world-callback-ba-moc-ap-luc-hanh-chinh) |
| **5. Interactive Set-Piece Đa tuyến** (*Q12 Climax*) | Màn kết Q12 diễn ra thời gian thực với 6 nhịp dàn dựng (`B0 Chuẩn bị → B1 Tiếp cận → B2 Giữ an toàn → B3 Bàn giao → B4 Đối chất P01–P05 → B5 Hậu quả`) và 3 Route kết thúc độc lập (`Route A Công khai`, `Route B Che chở`, `Route C Bảo vệ người`). | Q12 Finale | [Doc 03 · Mục 18](03-narrative-bible.md#18-q12-interactive-set-piece-da-tuyen) |

### 19.2 Hệ Chứng Cứ E01–E12 & Bộ Lọc Mệnh Đề P01–P05
Đặc tả chi tiết bộ lọc dữ liệu, cấu trúc vật chứng và các trigger đối chất hợp lệ được quy định tập trung tại **[Doc 03 · Mục 19](03-narrative-bible.md#19-atlas-vat-chung-e01e12-menh-de-p01p05)**:
* **P01 (B06 sai lệch):** Cần `E02 + E03`.
* **P02 (G17 thiếu 4 bao):** Cần `E04 + E05` (`24 - 2 - 18 = 4`).
* **P03 (Trách nhiệm Haddai):** Cần `E01 + E08` trên nền `E04/E05`.
* **P04 (Lệnh Hanan):** Cần `E06 + E09` hoặc `E10` độc lập.
* **P05 (Varro can thiệp & bản giả):** Cần `E11 + E12` qua chuỗi người giữ độc lập.

### 19.3 Bảo Toàn Hiện Trường & Lộ Trình Triển Khai
* **Bảo toàn hiện trường 100%:** Giữ nguyên vẹn 44 vật thể quan sát và 31 hoạt động thực địa ([Doc 03 · Mục 20](03-narrative-bible.md#20-ma-tran-bao-toan-canh-cu-v6)).
* **Lộ trình phân kỳ sản xuất P0–P5:** Chi tiết backlog chia theo lát cắt dọc tại **[Doc 03 · Mục 21.2](03-narrative-bible.md#212-backlog-san-xuat-theo-doc-vertical-slices)**.
