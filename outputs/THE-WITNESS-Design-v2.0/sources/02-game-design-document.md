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

Phạm vi mục tiêu bản lớn: 12 nhiệm vụ chính, 6 nhiệm vụ quan hệ, 5 Legends, 4 Veil; 3 hub; 4 companion, 8 NPC tái xuất quan trọng; 3 archetype combat và biến thể trang bị. Không coi nhân vật nền là companion. Khung thời lượng dựng thử v2 được cộng minh bạch ở mục 16; chưa chốt thời lượng phát hành.

Slice đạt chuẩn khi người mới tự tìm hai cách giải; nêu được đánh đổi của quyết định; thấy phản ứng của NPC và thay đổi hub; phân biệt cảnh mơ với bản văn; có thể hoàn thành bằng tay cầm và bàn phím, dùng subtitle và tắt rung. Chỉ tiêu số cụ thể và quy trình đo ở hồ sơ 09; không dùng từ “đạt” trước khi thử.

## 12. Revision 2 — Mỗi chương có cấu trúc chơi riêng

[H] Q01 là thao tác có tải và nhờ giúp; Q02 điều tra đi cùng bảo vệ; Q03 đọc tuyến và kiểm nhận định; Q04 phân tải/mở lối; Q05 tái dựng lượt phân phối và cách công bố; Q06 tiếp cận/giới hạn đối đầu; Q07 thương lượng lời hứa; Q08 chuẩn bị/cứu hộ; Q09 xin phạm vi lời chứng; Q10 đối chiếu/nhận trách nhiệm; Q11 phân công/diễn tập; Q12 thực hiện một kế hoạch. [Hồ sơ 11](11-chapter-dossiers.md) ghi scene, route và dấu quay lại của từng chương.

Hai chương liền nhau không dùng cùng động từ chủ đạo và cùng kiểu cản đường. Đối thoại không trở thành nút mở mọi thứ: trong Q08 phải đặt/kiểm neo; ở Q10 thao tác đặt bản cạnh nhau làm lộ khác biệt; ở Q11 việc đi thử đường bàn giao thay một màn chọn đội hình trừu tượng. Combat chỉ phục vụ nơi có xung đột thể chất thật, không đặt thêm kẻ địch vào một cảnh xin gặp để đủ tỷ lệ.

Mỗi Q cần **một lối cơ bản** không đòi companion/kỹ năng cao, **một lối khác đổi hành động**, **một hệ quả tức thời** và **một callback chơi được**. Lối khác có thể dùng cùng sân khác thời điểm/vai, không cần nhân đôi map. Một đoạn yên cho việc nhân vật muốn làm ngoài vụ án nằm trong mỗi Q; không bắt người chơi nghe cả banter mới được tiến.

## 13. Điều tra: nối claim với nguồn

Sổ v2 có ba thao tác: chọn điều muốn xác nhận → đặt nguồn liên quan cạnh nhau → chọn câu phát biểu đúng phạm vi. Không mini-game nối mọi vật với mọi vật để đoán đáp án ẩn. Người chơi có thể giữ giả thuyết trái chiều, xem vì sao một nguồn chưa đủ và sửa bằng thông tin mới. Gợi ý cấp cao chỉ tới nguồn cần tìm hoặc tự trình bày đối chiếu; không giảm quyền có ending.

Trạng thái vật và trạng thái claim tách nhau. Thấy một tờ giấy đã sửa là chắc về lớp giấy, chưa chắc về tác giả. Ba bản sao cùng gốc không tăng số nguồn độc lập. Không hiển thị “87% Hanan có tội”. Khi lập bản trình, hệ thống cho câu “chưa được giải trình” nếu thiếu căn cứ cho “đã xác nhận”; người chơi vẫn có thể cố ý phát biểu sai qua một lựa chọn có nghĩa rõ và hậu quả.

P01–P04, E01–E10 và lineage được định nghĩa ở hồ sơ 12. Mẫu G17 dùng 24/18/2/4 để kiểm logic; B06 là lượt địa phương riêng. Số và ký hiệu trong UI là bản dịch phục vụ chơi, chưa là bản phục dựng kế toán cổ. Một NPC có thiện cảm không được làm sai phép đối chiếu cho avatar.

## 14. Áp lực có thể đọc, chuẩn bị có ích

**Lượt công việc:** Q03/Q07 dùng lượt logic sau khi người chơi chọn bắt đầu; trước đó cho biết ai sẽ chuyển ca/chỗ gặp. Đọc journal, pause, dùng phụ đề hoặc hỗ trợ không tiêu lượt. Hạn tác động vào cách tiếp cận/việc cần bù, không âm thầm giết người ngoài màn hình. Chế độ thoải mái giữ cùng kết quả thiết kế, giảm yêu cầu thao tác đúng lúc.

**Chuẩn bị cứu hộ Q08:** kiểm neo, người giữ bờ, người nhận và cách bọc giấy. Có mỗi dụng cụ tốt chưa đủ nếu không kiểm nơi đặt; thiếu dụng cụ tốt vẫn có lối vòng/người hỗ trợ với công chuẩn bị khác. Người chơi được nhìn điều kiện còn thiếu bằng cảnh và mục tiêu cụ thể. Nếu chuẩn bị đủ, cứu được người lẫn giấy; không ép mất mát vì tác giả muốn bi kịch.

**Tự vệ Q06:** rút lui là trạng thái hoàn tất một pha, không thua tức thì. Khi đối phương hết đe dọa, tránh auto-target/animation nối đòn làm avatar vô tình trả thù trong cinematic. Hành động gây hại có chủ đích cần prompt đúng nghĩa. Không thưởng chiến thuật gây tổn hại rồi xin lỗi để farm quan hệ.

**Nguồn hỗ trợ:** thức ăn, dụng cụ, người nhận ca và địa điểm tạo điều kiện cục bộ; không gộp thành tiền tệ “cộng đồng”. Mỗi món có chủ, nơi giữ, công dụng, điểm đã tiêu. Chọn `food` ở Q04 giảm một việc hậu cần Q11; chọn `tools` đổi cách dựng neo Q08. Không đòi có cả hai để mở ending đầy đủ.

## 15. Lời hứa, tự chủ companion và công bố

Lời hứa ghi người nhận, hành động, lượt hẹn, điều kiện và revision. Trạng thái: đã nói → được nhận → bắt đầu → hoàn tất/bàn giao → giữ hoặc thương lượng lại; bỏ mặc là trạng thái riêng. Người nhận có thể từ chối người được giao thay. Quan hệ không đổi chỉ vì avatar chọn câu “tôi hứa” nhiều lần.

Vai kế hoạch như giữ cửa/giữ bờ/giữ bản có điều kiện năng lực và đồng ý. Companion tin cậy cao vẫn có việc phải ở lại. UI báo vai còn thiếu và cách tìm người thay trong cộng đồng; không cần một người cụ thể để kết truyện. Vai vắng không được lấp bằng clone, teleport hoặc thoại của người không có mặt.

Khi công bố, kiểm claim + nguồn cho dùng + scope từng người + tình trạng an toàn đã biết. Danh sách xem trước cho thấy đúng người nhận sẽ thấy gì; tên ẩn trong giấy nhưng lộ ở phụ đề vẫn là lỗi. Mỗi lần thay từ nhóm kín sang sân chung cần xác nhận lại scope. Quy tắc này là thiết kế [H] để làm rõ trách nhiệm, không mô phỏng một hệ luật hiện đại ở Giuđê.

Q12 có ba đoạn gameplay: điều phối sân công khai; giao hồ sơ phân tán; hộ tống/bàn giao. Chọn ở Q11 là kế hoạch, hoàn tất ở Q12 mới là kết. Trong mỗi đoạn có một tình huống gây áp lực đã được báo/diễn tập, dùng khả năng đã học; không đặt puzzle mới ở phút cuối để phủ định 20 giờ quyết định.

## 16. Ngân sách chiều sâu và nhịp cảnh

V2 tăng độ cụ thể của phạm vi cũ, không tăng số hub/Q/L/V/B/companion. Chương dùng 4–5 beat chính, một đoạn yên và biến thể theo state; beat không đồng nghĩa mỗi cái là cinematic riêng. Tối đa một không gian/set-piece mới đắt ở một Q; còn lại tái dùng với công năng đã đổi. Ba nhánh ending dùng ba đoạn thực hiện riêng và chung sân hậu truyện, thay vì hứa hàng chục ending độc lập.

**Cộng ngân sách dựng thử:** 12 Q × 45–80 phút = 540–960 phút; 5 L = 71–97 phút theo phạm vi ngắn L03; 4 V = 24–35 phút; di chuyển liên vùng/về hub ngoài Q = 120–240 phút [H]. Tổng khoảng **13–22 giờ**, chỉ là biên ước lượng trên giấy, không thời lượng đã đo. Đoạn yên nằm trong Q, không cộng lần nữa. Sáu B và khám phá thêm chưa đủ dữ liệu để chốt tổng thời lượng hoàn thành mọi việc. Mục tiêu v1 18–24/28–35 giờ không còn dùng như một cam kết v2.

Nếu nhánh yêu cầu thêm một địa điểm, nhân vật tái xuất hoặc cơ chế ngoài ngân sách, phải ghi chi phí và cắt một phần tương ứng trước khi dựng. Không mặc định “AAA” cho phép mọi nhánh có motion capture riêng. Kết quả greybox và độ nhớ nhân vật quyết định cảnh nào đáng nâng mức diễn xuất.

## 17. Cổng chiều sâu theo chương

**D1 — Dễ hiểu:** người mới nói được việc muốn làm, hai điều đã biết và một điều còn chưa biết. **D2 — Có chủ động:** hoàn tất được với nền kỹ năng thấp/vắng companion, hai cách chính đổi ít nhất một thao tác hoặc cách tiếp cận. **D3 — Nhớ người:** kể được điều một NPC muốn ngoài việc giúp avatar. **D4 — Có hệ quả:** thấy một đổi chỗ/vai/đường/đồ trong chương sau đúng việc đã làm. **D5 — Trung thực nguồn:** không nhầm V thành bằng chứng, không nghĩ mình sửa kết cục L.

Trong vòng thử định tính, hỏi mở trước, chỉ sau đó mới hỏi cụ thể. Ghi số người và câu trả lời thực, không chấm bằng việc họ chọn route tác giả thích. Thất bại D3 cần sửa nhu cầu/cảnh sống; thất bại D4 cần sửa callback; không giải quyết cả hai bằng thêm một đoạn codex. Dùng tám tình huống continuity ở hồ sơ 12 làm ca kiểm khi có build. Chưa tuyên bố các cổng này đã qua bằng kiểm tra văn bản.
