# 02 • Game Design Document

## 1. Thông số nền

RPG hành động phiêu lưu góc nhìn thứ ba; single-player, chơi offline sau cài đặt. Bàn phím/chuột và tay cầm là mục tiêu ban đầu. PC là nền prototype; console chỉ chốt sau đo hiệu năng và kế hoạch chứng nhận. Điện thoại/browser giữ vai trò prototype truyện và công cụ đọc, không mặc định là nền cho bản chất lượng AAA. Không PvP, live-service, loot box hay cơ chế trả tiền để mạnh hơn trong v1. Mô hình phát hành trả phí một lần là giả định thiết kế kinh tế, chưa phải quyết định thương mại.

Nhân vật chính mang tên người chơi chọn; tên dùng trong văn bản là **Người Chứng**. Tùy biến ngoại hình, giọng, tên và xuất thân. Căn tính nghề nghiệp mặc định là người chuyển thư kiêm sao chép sổ sách. Xuất thân chọn một trong ba: thợ bến cảng, người học chép, người giữ đường; thay điểm khởi đầu và cách tiếp cận, không thay toàn bộ cốt truyện. Bốn bạn đồng hành có thể đi cùng; chỉ một người hoạt động cùng lúc trong slice, mục tiêu tối đa hai trong bản lớn nếu AI đạt chuẩn.

## 2. Vòng chơi

**30–90 giây:** quan sát → xác định vật/người có ích → thao tác → phản hồi nghe/nhìn → lựa chọn tiếp theo. Một manh mối phải có dấu hình thể, lời mô tả và phản ứng kiểm chứng; không chỉ sáng viền.

**10–25 phút:** nhận một nhu cầu có người chịu thiệt → đi theo ít nhất hai hướng điều tra → xử lý trở ngại → chọn hành động → thấy hậu quả cục bộ → mang món nợ hoặc quan hệ về hub.

**Một hồi:** khám phá vùng → nối các lời chứng → Legends mở một câu hỏi đạo đức → Veil tạo hình cho xung đột cá nhân → hành động trong Mortal World thay đổi thế giới hư cấu. Legends và Veil mở bằng tiến độ truyện, không bằng farm điểm đạo đức.

**Toàn chiến dịch:** năng lực tăng giúp người chơi có thêm cách tiếp cận; lựa chọn đã làm khiến một số người tin, sợ, xa lánh hoặc chịu gặp lại. Phần thưởng lớn là quyền tiếp cận, đồng minh và thay đổi cộng đồng, bên cạnh vật dụng hữu ích.

## 3. Động từ và điều khiển

- Di chuyển: đi, chạy ngắn, cúi, bám mép theo tuyến xác định, vượt chướng ngại thấp, kéo người bị thương. Không free-climb mọi bề mặt.
- Tương tác: xem, nghe, hỏi, đối chiếu, mang, đặt, buộc dây, mở lối, giúp đỡ. Một nút tương tác ngữ cảnh; nút riêng để hủy và lùi.
- Điều tra: đánh dấu nguồn, so sánh vật, ghi giả thuyết, hỏi xác nhận. Sổ hỗ trợ ghi nhớ, không tự giải án.
- Xung đột: né, đỡ, đẩy, đánh nhanh, đánh có lực, rút lui, gọi hỗ trợ. Khóa mục tiêu tùy chọn.
- Hội thoại: chọn ý định được diễn đạt rõ; không chọn “nói thẳng” rồi nhân vật tự buột miệng một lời xúc phạm khác nghĩa.
- Tay cầm: cần trái di chuyển, cần phải nhìn, cò trái phòng thủ, cò phải đánh có lực, nút mặt cho tương tác/né/đánh nhanh; toàn bộ được đổi gán. Đây là bố trí đề xuất, kiểm thử công thái học trước khi khóa.

## 4. Khám phá theo vùng

Mỗi vùng gồm hub, 2–3 tuyến hành trình và những không gian nhiệm vụ có chiều sâu. Bản đồ nén khoảng cách có ghi chú; không công bố là tỷ lệ địa lý thật. Điểm mốc dùng hình dáng: tháp cổng, vệt đá trắng, vòm kho, đường chân trời. Nhiệm vụ có hướng dẫn theo địa vật trước, marker là tùy chọn. Một đường chính dễ đọc, một đường khó nhưng yên tĩnh, một lối mở bởi quan hệ là mẫu blockout, không phải khuôn bắt buộc cho mọi level.

Thời gian chuyển theo mốc nhiệm vụ và nghỉ; không có chu kỳ ngày đêm làm NPC quan trọng biến mất vô hạn. Hạn chót chỉ áp dụng khi người chơi đã nhận và xác nhận “bắt đầu giai đoạn có áp lực”. Khám phá tự do không âm thầm giết con tin. Fast travel giữa điểm an toàn đã khám phá; bị khóa ngắn trong đoạn hộ tống có thông báo trước.

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

Trang bị thay chức năng: túi thêm chỗ dụng cụ, dép giảm tiếng bước, áo mưa giảm ảnh hưởng thời tiết. Không áo “+20 thánh thiện”. Hành trang có 6 ô dụng cụ, vật nhiệm vụ không chiếm ô và không thể vô tình bán. Giới hạn này là mục tiêu prototype. Tài nguyên gồm thực phẩm, dầu đèn, vải, dây và tiền quy ước; không giả vờ mô phỏng tỷ giá cổ đại nếu chưa có nguồn.

Kinh tế không cho hủy cứu trợ để farm. Kho đã nhận hàng không bán lại vô hạn; giá theo chương có biên độ rõ. Nghỉ ở nơi an toàn hồi phục cơ bản, thức ăn hỗ trợ chuẩn bị; không bắt grind để được tiếp tục truyện.

## 8. Quan hệ và hệ quả

Quan hệ lưu **tin cậy -2…+2**, **bất đồng theo chủ đề**, **lời hứa**, **hành động đã chứng kiến**. Tin cậy không đồng nghĩa đồng ý; Miriam có thể tin người chơi nhưng phản đối cách công bố danh sách. Giao diện dùng ngôn ngữ: “Cô ấy tin bạn giữ lời”, không “Miriam +5”. Không tồn tại thanh đo mức được Thiên Chúa yêu.

Hệ quả chia theo thời gian: phản ứng ngay; thay đổi điểm chờ sau khi quay hub; thay đổi đường tiếp cận nhiệm vụ sau; một câu và một hình ảnh ở kết thúc. Mỗi lựa chọn lớn cần ít nhất hai tầng hệ quả, một trong số đó có tác động chơi được. Người chơi có thể hối cải và sửa thiệt hại ở nhánh hư cấu; sửa lỗi không xóa ký ức của NPC.

## 9. Luật ba tầng

Mortal World ghi trạng thái thế giới. Legends có loadout riêng, không chuyển vũ khí/tiền; hoàn thành ghi `legend.completed` và mở đối thoại theo chủ đề. Inner Veil nhận biến ký ức đã có để đổi hình ảnh và câu tự vấn; chỉ ghi `veil.completed` và `reflection`, không tạo vật chứng, điểm mạnh thần bí hay phán quyết thiện ác. “Skip” giữ tiến độ hoàn thành nhưng không giả mạo câu trả lời phản tư người chơi chưa chọn.

Trước Legends hiện: “Chương chuyển thể từ [sách, chương, câu]. Bố cục và một phần tương tác được sáng tác.” Trước Veil hiện: “Giấc mơ hư cấu — ẩn dụ nghệ thuật, không thuộc bản văn Kinh Thánh.” Sau cảnh có thể mở so sánh “bản văn / chuyển thể”. Không dùng một nhãn mơ hồ chung cho cả hai.

## 10. UI, âm thanh và tiếp cận

HUD mặc định chỉ có mục tiêu ngắn, sức bền khi dùng, prompt và phản hồi nguy hiểm. Sổ gồm Người / Việc / Dấu vết / Kinh Thánh / Phản tư. Tìm kiếm không bắt nhớ phiên âm. Tên Việt và tên quốc tế ở lần xuất hiện đầu; từ điển theo ngữ cảnh.

Yêu cầu v1 [định hướng từ S17]: phụ đề đổi cỡ và nền, tên người nói, phụ đề âm thanh thiết yếu; remap, hold/toggle, thay mash bằng giữ; không puzzle chỉ dựa vào màu/âm; chỉnh camera, tắt head-bob, rung, blur; pause khi đọc; chế độ thời gian thoải mái; gợi ý 3 cấp; xem lại hội thoại; tự lưu và lưu tay ngoài combat; tùy chọn giảm hình ảnh đau khổ nhưng vẫn giữ ý nghĩa cốt truyện. Cảnh siêu nhiên không dùng nháy chớp làm chìa khóa gameplay.

Độ khó tách combat, điều hướng và puzzle. Chế độ kể chuyện không phạt quyền nhận kết thúc. Ngôn ngữ đầu tiên tiếng Việt; glossary Anh–Việt dùng chung mã, nội dung thiết kế không gắn cứng tên hiển thị vào logic.

## 11. Ngân sách nội dung và tiêu chí

Phạm vi mục tiêu bản lớn: 12 nhiệm vụ chính, 6 nhiệm vụ quan hệ, 5 Legends, 4 Veil; 3 hub; 4 companion, 8 NPC tái xuất quan trọng; 3 archetype combat và biến thể trang bị. Không coi nhân vật nền là companion. 18–24 giờ tuyến chính bao gồm Legends/Veil và đi lại; chỉ là giả định cần đo.

Slice đạt chuẩn khi người mới tự tìm hai cách giải; nêu được đánh đổi của quyết định; thấy phản ứng của NPC và thay đổi hub; phân biệt cảnh mơ với bản văn; có thể hoàn thành bằng tay cầm và bàn phím, dùng subtitle và tắt rung. Chỉ tiêu số cụ thể và quy trình đo ở hồ sơ 09; không dùng từ “đạt” trước khi thử.
