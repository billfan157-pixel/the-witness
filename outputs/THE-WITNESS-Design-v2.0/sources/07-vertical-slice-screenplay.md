# 07 • Vertical slice — Những tên không được đọc

**Draft kịch bản có thể blockout, đồng bộ v2.0.** Đây là kịch bản mẫu cho một lát cắt, không phải screenplay đầy đủ của toàn chiến dịch. Lời thoại dưới đây do dự án sáng tác [H], kể cả câu diễn ý trong Legends; trước thu âm phải thay các đoạn dùng bản văn bằng bản dịch đã chọn và được phép dùng. Không phát hành các câu diễn ý như nguyên văn Kinh Thánh. Lượt bữa thiếu hai bao là B06; đầu mối G17 là lô khác, không gộp số lượng hay người nhận.

## 1. Mục tiêu và điều kiện đầu

55–70 phút lần đầu: 5 phút vào cảnh, 15 phút điều tra, 8 phút tiếp cận, 10 phút Legends, 6 phút Veil, 10 phút quyết định/thực hiện, 5 phút hậu quả. Các phần cộng khoảng 59 phút; thời lượng phụ thuộc tốc độ đọc và khám phá. Cảnh chiến đấu tùy chọn có thể thêm 3–5 phút. Chưa có playtest.

Không gian: một sân bến và kho 70×90 m; lối sau 25×50 m; phòng yên; hố Legends khoảng 8×8 m có vùng thao tác; Veil dùng 3 buồng tái cấu hình. Kích thước là blockout đề xuất [H], không phục dựng khảo cổ.

Đầu vào: `Q01=complete`, `ledger.found=true`, `evidence.patch=false`, `evidence.meal=false`, `yosef.met=false`, `consent.yosef=unknown`, `route=unset`, `witness.safety=exposed`, Miriam đang có mặt. Yosef là nhân vật hư cấu, không ở trong Gr 38.

## 2. S01 — Cái tên trên mép giấy (0:00–5:00)

**EXT. SÂN KHO — CHIỀU.** Máy quay sau vai Người Chứng. Một bao rách được vá bằng vải khác màu. Tiếng gỗ kéo trên nền đá, người chờ ở xa. Quyền điều khiển trao trong 8 giây đầu mục tiêu; không chặn bằng đoạn mở dài.

MIRIAM đang đếm bát, đặt một bát úp xuống.

MIRIAM: “Hôm nay thiếu hai bao. Sổ lại ghi đủ.”

NGƯỜI CHỨNG: “Ai đã ký?”

MIRIAM: “Một người còn phải làm ở đây ngày mai. Trước khi hỏi tên, nghĩ xem anh sẽ giữ họ an toàn thế nào.”

**Prompt:** Xem sổ / Hỏi về bữa chung / Xem chỗ nhận bao. Thứ tự tự do. Camera chỉ quay nhẹ theo ánh nhìn khi người chơi chọn; có thể tắt.

Nếu người chơi đi thẳng tới cửa kho, MATTAI nói: “Chưa có người xác nhận, ta không mở.” Journal thêm “Tìm dữ kiện về lượt giao hôm nay”, không thất bại quest. Nếu hỏi tên ngay, Miriam đáp: “Tôi sẽ hỏi họ có muốn gặp anh không.” Không phát lộ tên tự động.

## 3. S02 — Hai việc không khớp (5:00–20:00)

**Nút A: Sổ giao hàng.** Người chơi xoay vật dưới đèn; thấy một mảnh dán che vết mực. Prompt có mô tả văn bản cho người không nhìn rõ. Quan sát II cho biết thứ tự lớp mực nhanh; mức cơ bản có thể hỏi Lea hoặc dùng bản đối chiếu bên cạnh. Không mini-game cào giấy có thể phá vật vĩnh viễn.

NGƯỜI CHỨNG: “Có một lớp ghi khác ở dưới.”

LEA nếu có mặt: “Chúng ta biết trang này đã sửa. Chưa biết ai sửa, cũng chưa biết vì sao.”

Ghi `evidence.patch=true`; journal: “Vật chứng: trang được sửa. Chưa xác định người sửa.” Không tự ghi Hanan có tội.

**Nút B: Bữa chung.** Rina chỉ hai vệt bao sạch ở góc nơi ba bao thường đặt. Người chơi đếm không bắt bấm từng hạt hay trả lời quiz.

RINA: “Tôi nhận từng ấy. Không biết bao đã thiếu trước hay sau cổng.”

Ghi `evidence.meal=true`; đây là lời chứng về số nhận, không chứng minh toàn tuyến. Cần hai cờ A+B để hỏi đối chiếu chính; nếu chỉ có một, objective nêu nguồn còn thiếu bằng dấu địa vật, không marker mọi lúc.

**Nút C tùy chọn:** sửa dây giữ mái giúp một người chuyển bao nhận ra mình được nghe. Mở đường gặp Yosef sớm, không thay hai nguồn bắt buộc. Nếu không làm, Miriam giới thiệu sau khi hai nguồn đủ.

## 4. S03 — Một người chưa sẵn lòng (20:00–28:00)

**EXT. LỐI SAU KHO.** Yosef đứng cách cửa một tầm chạy. Không close-up ép vào mặt ngay; khi người chơi hạ dụng cụ mới tiến gần.

YOSEF: “Tôi mang bao qua cửa kia. Chừng ấy là điều tôi biết.”

**D01 / các ý định hiển thị đúng lời sẽ nói:**

- A: “Anh muốn tôi giữ kín điều gì?” → YOSEF: “Tên tôi. Và chỗ mẹ tôi đang ở.” Mở điều kiện bảo vệ; `yosef.heard=true`.
- B: “Tôi cần anh đứng ra xác nhận.” → YOSEF: “Còn tôi cần trở lại làm việc mà không bị chặn ở cửa.” Không khóa quest; mở yêu cầu bảo đảm.
- C: “Nếu anh không nói, người khác có thể bị đổ lỗi.” → YOSEF: “Đừng đưa nỗi sợ ấy sang tôi rồi gọi là lựa chọn.” Miriam phản đối; `pressure.used=true`. Có câu sửa: “Anh nói đúng. Tôi đã ép anh.” Việc xin lỗi mở lại đối thoại nhưng không xóa log áp lực.

Yosef kể đã chuyển bao theo lệnh miệng sang một sân khác. Lời kể không chỉ ra ai ra lệnh cuối. Người chơi ghi tuyến [lời chứng chưa đối chiếu]. Mattai đi ngang; Yosef dừng nói. Không biến Mattai tự động thành kẻ ác vì xuất hiện đúng lúc.

**Đường tiếp cận kho phụ:** thỏa thuận mở cùng người giám sát; hoặc sửa then phụ và xin người dùng lối cho phép; hoặc tránh nhóm đòi phí trái phép. Nếu chọn combat, kẻ đòi phí là nhóm hư cấu không đồng nhất quân đội/tôn giáo. Mục tiêu là mở đường thoát, không hạ mọi người. Cả ba tìm được dấu tuyến G17; nó chưa ghi lượng bốn bao và không phải thẻ sân phụ E06 lấy ở Q06. Không lấy được vũ khí thần bí.

## 5. S04 — Một việc nhỏ đủ để nhớ (28:00–30:00)

**INT. CHỖ NGHỈ BÊN SÂN.** Miriam giặt một mảnh vải. Người Chứng nói còn chưa biết nên làm gì với tên trong sổ.

MIRIAM: “Có chuyện người ta cứu một người khỏi hố. Họ không chỉ đem dây. Họ còn đem vải để dây đừng cứa vào người ấy.”

Đây là lời diễn ý [H] dẫn tới Gr 38, không là trích dẫn. Không khẳng định Miriam sở hữu một bản sách hiện đại.

**Thẻ chuyển cảnh:** “LEGENDS OF SCRIPTURE — Giêrêmia. Chuyển thể Gr 38,1–13. Dàn cảnh và tương tác có yếu tố sáng tác.” Nút Chơi / Xem tóm tắt. Tóm tắt dẫn cùng trạng thái hoàn thành nhưng không gán người chơi đã chọn phản tư.

## 6. S05 — Dây và vải (30:00–40:00)

**INT. HỐ — ÁNH SÁNG TỪ TRÊN.** Điều khiển Giêrêmia. Không hành trang Mortal. Camera vừa tầm, không nghiêng liên tục. Tay cử động trong phạm vi hẹp; có chế độ camera giảm ngột ngạt.

**Beat 1 / khoảng 2 phút:** nghe bước chân, nhận biết phía ánh sáng. Hành động giữ tư thế và gọi đáp lại; thất bại chỉ lặp ngắn, không để nhà tiên tri chết khác bản văn. Tránh game hóa đau khổ thành thanh điểm chịu đựng để khoe thành tích.

**Beat 2 / 3 phút:** dây và vải được hạ xuống. Tiếng Ebed-melech diễn ý chỉ dẫn đệm vải dưới dây. Nhân vật này giữ vai trò cứu giúp được bản văn nêu [K; S07]. Không đổi thành Miriam hay Người Chứng. Hình ảnh bên trên không đòi số người kéo cụ thể vì bản dịch/chi tiết cần thẩm định.

Prompt tuần tự: Nhận vải → Đặt vải ở chỗ dây tì → Ra hiệu sẵn sàng. Tương tác một lần hoặc giữ tùy cài đặt; không button mash. Nếu ra hiệu quá sớm: âm thanh dây căng, cảnh dừng trước tổn thương; prompt nhắc vải. Gợi ý cao nhất tự đặt vải mà vẫn cho người chơi ra hiệu.

**Beat 3 / 3 phút:** phối hợp lên khỏi hố, nghe âm thanh đổi từ tù đọng sang sân; phần lớn nâng do người bên trên, người chơi điều chỉnh tư thế. Không có quỷ trong bùn để đánh. Sự trợ giúp không bị lấn át bởi một animation Giêrêmia tự phóng lên.

**Beat 4 / 2 phút:** chân chạm nền, được đỡ ra khỏi miệng hố; không tiếp tục thành vượt ngục. Fade nhẹ. Codex mở hai cột “Nguồn nói gì / Game bổ sung gì”: nguồn có hố, Ebed-melech, dây và vải; game thêm camera, nhịp thao tác và cảm giác không gian. Nội dung tóm tắt giữ ngắn, không sao chép nguyên đoạn Kinh Thánh.

Ghi `legend.jeremiah.completed=true`, không ghi `virtue+=10`.

## 7. S06 — Hố của những cái tên (40:00–46:00)

**Trước cảnh:** nhân vật chợp mắt tại chỗ nghỉ. Thẻ “THE INNER VEIL — Giấc mơ hư cấu, ẩn dụ nghệ thuật; không thuộc bản văn Kinh Thánh.” Có thể bỏ qua toàn bộ.

Sàn là những trang lớn. Bốn hình người đứng sau các khe sáng. Tên trên trang không dùng tên thật Yosef hay một NPC để tránh hàm ý giấc mơ tiết lộ nguy cơ có thật. Một hình người có cánh hư cấu chỉ hướng bàn tay, không nói thay Thiên Chúa; không đặt tên hoặc mô tả như thiên thần đã được Kinh Thánh chứng thực.

**Cơ chế:** mang tất cả trang làm lối hẹp hơn; đặt một trang xuống bàn cho hình người có đường đi. Không đốt hay xóa tên để “chiến thắng”. Người chơi có thể thử, reset ngay, không bị phạt. Lối cuối mở khi để trang tại nơi có người giữ, diễn đạt phân chia trách nhiệm.

**Giọng nội tâm của avatar, tùy chọn bật:** “Mình đang giữ điều đã xảy ra… hay đang giữ cả quyền quyết định thay họ?” Đây là tự vấn, không phán quyết siêu nhiên.

**R01:** chọn phản tư “Tôi cần hỏi trước”, “Tôi sợ chậm sẽ hại thêm người” hoặc “Tôi chưa trả lời được”. Ghi `reflection` tương ứng; không đổi chứng cứ hoặc độ an toàn. Nếu skip, ghi `reflection=null` và không phát câu khẳng định người chơi đã chọn.

## 8. S07 — Quyết định có người chịu giá (46:00–56:00)

**Trở lại bến.** Người chơi điều khiển, đi tìm Yosef; sổ vẫn là sổ cũ, giấc mơ không thêm trang. Miriam hỏi: “Giờ anh định làm gì?” Không nhắc một phản tư nếu người chơi chưa chia sẻ.

**D02 có ba kế hoạch, UI nêu chi phí trước khi chốt:**

**A / Đưa Yosef và mẹ sang chỗ trú trước.** Cần giúp Rina chuẩn bị lối và dành phần đồ dự trữ. Người chơi tổ chức di chuyển 3 phút. Giữ tên kín; `route=shelter`, `safety=sheltered`, `consent=withheld`, `testimony=private`. Mất phần đồ dự trữ cho một tuyến tùy chọn Q03, có đường vòng miễn phí. Miriam tin hơn vì đã giữ lời, không vì đã “chọn đáp án đạo”.

**B / Nộp dữ kiện đã ẩn danh qua người trung gian.** Chỉ dùng A+B vật chứng đã xác minh; không ghi lời Yosef như lời công khai. Người chơi chọn bản sao đã bỏ tên và trực tiếp giao; `route=anonymous`, `safety=exposed`, `consent=withheld`, `testimony=anonymous`. Có giám sát kho sớm nhưng Yosef còn cần được giúp sau; Q03 mở thêm nhiệm vụ bảo vệ thay vì tuyên bố an toàn rồi bỏ quên.

**C / Xin đồng thuận đứng tên với bảo vệ.** Chỉ mở sau đã hỏi nhu cầu, không còn áp lực đang chưa sửa, và đã bố trí chỗ trú + người đưa đi. Yosef được một câu từ chối cuối, không check Giao tiếp để cưỡng ép. Nếu đồng ý: `route=consented`, `safety=escorted`, `consent=granted`, `testimony=named`. Người chơi đưa tới nơi gặp, bàn giao rồi rời; nguồn hàng đến nhanh hơn nhưng tên được biết trong phạm vi nhóm tiếp nhận. Đây là trạng thái hư cấu, không mẫu thủ tục tòa án lịch sử.

Nếu thiếu điều kiện C, UI nói thiếu gì và cho quay làm; không giấu phương án sau một chỉ số vô hình. Nếu người chơi cố chọn nêu tên trái ý qua một hành động ở sổ, cảnh cảnh báo nghĩa cụ thể và chuyển nhánh phục hồi, không xem nó là C hợp lệ.

## 9. S08 — Sân kho lúc lên đèn (56:00–61:00)

**A:** chỗ Yosef đứng trống, có dấu anh đã tới nơi; Rina cho biết đồ trú đã nhận. MIRIAM: “Giờ tôi có thể đi cùng anh một đoạn. Có người nhận ca rồi.”

**B:** có bảng kiểm lô mới; Yosef vẫn ở lối sau, nói “Tôi chưa thể yên tâm.” Companion không mừng như đã cứu xong. Quest Q03 ghi việc cần bố trí cho anh trước khi rời hồi.

**C:** Yosef tự nói tên ở cuộc gặp, không để avatar phát ngôn hộ. Sau đó nơi trú xác nhận đã đón; một lối vào kho mở qua người giám sát. MIRIAM: “Anh đã hỏi, rồi đã làm điều anh hứa. Hãy giữ như vậy.”

**Kết slice:** người chơi cầm bản sao có nét chữ trông quen, chưa có biên nhận gốc để xác nhận. NGƯỜI CHỨNG, nếu thái độ nhận trách nhiệm: “Giống chữ ông ấy. Mình cần xem bản gốc.” Nếu thái độ phòng thủ: “Một nét chữ chưa kể hết chuyện.” Fade để tiếp tục Q03, không tuyên án Hanan. Q04 mới xác nhận chữ ký qua phần gốc Natan đã làm khô từ Q01.

## 10. Ghi chú triển khai và kiểm thử

Tự lưu trước D02, sau hoàn tất kế hoạch và sau callback; commit route sau hành động, không ngay lúc hover lựa chọn. Đang hộ tống mà quit thì load tại checkpoint có cùng vai trò NPC. Không ghi completion L/V trùng khi xem lại. Không đưa dialogue ID vào text để dịch dễ.

Cần kiểm tra 3 nhánh D01 × 3 route hợp lệ D02; thêm skip L, skip V, skip cả hai, mất companion, mất nguồn đồ dự trữ và chơi lại sau load. Với các nhánh không đủ điều kiện, kiểm tra thông báo và đường khôi phục thay vì ép cho mọi tổ hợp đều hợp lệ. So sánh lời cuối với trạng thái đã commit; screenshot sân thay đổi là bằng chứng tốt hơn chỉ kiểm tra một cờ.
