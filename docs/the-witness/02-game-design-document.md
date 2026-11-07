# 02 • Game Design Document

## 1. Thông số nền

Game phiêu lưu thám hiểm có yếu tố RPG, góc nhìn thứ ba; single-player, chơi offline sau cài đặt. **V3 lấy ba Legends làm tuyến truyện chính**, các Q Mortal là cầu nối. Động từ ưu tiên: đọc không gian, tìm đường, quan sát, thao tác cùng người khác; combat là công cụ phụ ở cảnh hư cấu thích hợp. Bàn phím/chuột và tay cầm là mục tiêu. PC là nền prototype; browser là bản thử truyện, chưa chứng minh chất lượng sản xuất lớn. Nền tảng thương mại, console và mô hình trả phí chưa khóa.

Nhân vật chính mang tên người chơi chọn; tên dùng trong văn bản là **Người Chứng**. Tùy biến ngoại hình, giọng, tên và xuất thân. Căn tính nghề nghiệp mặc định là người chuyển thư kiêm sao chép sổ sách. Xuất thân chọn một trong ba: thợ bến cảng, người học chép, người giữ đường; thay điểm khởi đầu và cách tiếp cận, không thay toàn bộ cốt truyện. Bốn bạn đồng hành có thể đi cùng; chỉ một người hoạt động cùng lúc trong slice, mục tiêu tối đa hai trong bản lớn nếu AI đạt chuẩn.

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

Q12 có ba route thực hiện riêng: điều phối sân công khai; giao hồ sơ phân tán; hoặc hộ tống/bàn giao. Người chơi thực hiện route đã chuẩn bị, không phải chơi cả ba. L04 là cao trào nguồn trước đó; Q11–Q12 là đáp lại và hậu truyện. Dùng khả năng đã học, không boss Hanan/cú lật mặc khải hay puzzle mới lấn chương Kinh Thánh.

## 16. Ngân sách chiều sâu và nhịp cảnh

**Ngân sách v3, mục tiêu chưa đo:** tuyến mẫu 720 phút / 12 giờ ở định dạng tương tác. Không cộng lại đoạn yên hoặc di chuyển đã nằm trong scene. Các Q vẫn giữ scene/route nhưng rút độ dài và dùng không gian chung; nếu không dựng được trong budget thì sửa scene trước khi cam kết phạm vi.

| Thành phần | Phút mục tiêu | Cách tính |
|---|---:|---|
| L01 / L02 / L04 | 80 + 70 + 66 = **216** | Ba chương bắt buộc, tương tác |
| Q01–Q04 | 32 + 40 + 34 + 32 = 138 | Cầu nối hồi I |
| Q05–Q08 | 40 + 34 + 32 + 36 = 142 | Cầu nối hồi II |
| Q09–Q12 | 34 + 32 + 30 + 26 = 122 | Cầu nối hồi III |
| Đi giữa vùng/điểm, ngoài Q | 22 + 24 + 20 = 66 | Không đếm hai lần |
| Veil tự chọn trên tuyến mẫu | 8 + 10 + 8 + 10 = 36 | Bỏ hết vẫn hoàn tất được |
| **Tổng** | **720** | Legends **30%**, Mortal **65%**, Veil **5%** |

Không vào Veil: 684 phút, Legends 31,6%. Dùng cả ba tóm tắt: thay 216 bằng 8+7+8=23, tuyến mẫu 527 phút; không Veil là 491. Không ép bản tóm tắt dài thêm để giữ 30%. L03 18 phút, L05 24 phút, sáu B và đi sâu tùy chọn nằm ngoài mẫu này; chưa có cam kết thời lượng hoàn thành tất cả.

Đo lần chơi đầu, loại pause/idle, retry và replay; ghi riêng định dạng, đường đi và hỗ trợ. Tỷ lệ mục tiêu chấp nhận để thử là khoảng 27–33% ở tuyến tương tác chuẩn; lệch thì điều chỉnh phần cầu nối/cảnh nguồn, không đếm chờ hoặc lượt chết. Thời lượng chưa nói được Legends có là lõi: vẫn phải qua protocol hồi tưởng và trải nghiệm ở hồ sơ 07.

Ngân sách cinematic ưu tiên ba level Legends. Kho/cứu hộ/công bố dùng bộ cảnh chung, không thêm set-piece đắt cho mỗi Q. Mọi nhánh cần địa điểm/nhân vật mới phải có phương án bù phạm vi và đo chi phí thật sau greybox.

## 17. Cổng chiều sâu theo chương

**D1 — Dễ hiểu:** người mới nói được việc muốn làm, hai điều đã biết và một điều còn chưa biết. **D2 — Có chủ động:** hoàn tất được với nền kỹ năng thấp/vắng companion, hai cách chính đổi ít nhất một thao tác hoặc cách tiếp cận. **D3 — Nhớ người:** kể được điều một NPC muốn ngoài việc giúp avatar. **D4 — Có hệ quả:** thấy một đổi chỗ/vai/đường/đồ trong chương sau đúng việc đã làm. **D5 — Trung thực nguồn:** không nhầm V thành bằng chứng, không nghĩ mình sửa kết cục L.

Trong vòng thử định tính, hỏi mở trước, chỉ sau đó mới hỏi cụ thể. Ghi số người và câu trả lời thực, không chấm bằng việc họ chọn route tác giả thích. Thất bại D3 cần sửa nhu cầu/cảnh sống; thất bại D4 cần sửa callback; không giải quyết cả hai bằng thêm một đoạn codex. Dùng tám tình huống continuity ở hồ sơ 12 làm ca kiểm khi có build. Chưa tuyên bố các cổng này đã qua bằng kiểm tra văn bản.

**D6 — Legends là lõi:** người thử tự nhận diện mốc bản văn là trung tâm, kể được hoạt động khám phá và hiểu cổng truyện. **D7 — Định dạng tương đương:** tóm tắt giữ đủ beat/cơ hội, thoát giữa chừng không mở cổng. Các cổng D1–D7 là yêu cầu dựng tiếp, không tính năng đã được bản chơi 0.1.0 chứng minh.
