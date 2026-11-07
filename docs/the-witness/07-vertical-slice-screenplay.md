# 07 • Vertical slice v3 — Bờ trước mặt

**Mục tiêu: chứng minh Legends là lõi của game thám hiểm. Chưa dựng hoặc playtest v3.** Slice cũ Q02–L03–V01 được giữ trong gói v2; không dùng kết quả bản chơi 0.1.0 để chấm slice này.

## 1. Hợp đồng lát cắt

**Tuyến A — tương tác:** mục tiêu 90 phút, gồm L01 rút gọn 27 phút (30%), cầu nối 63 phút. **Tuyến B — tóm tắt:** thay 27 phút bằng khoảng 8 phút, tổng khoảng 71 phút; không so tỷ lệ thời gian của B với chuẩn A. Thời lượng chưa đo; không ép người đọc theo đồng hồ. Veil nằm ngoài bài thử chính, chỉ thử phân biệt lớp sau phỏng vấn nếu cần.

**Phạm vi L01:** bản trích có đủ B01–B06 để đo khả năng theo cốt truyện, nhưng rút hoạt động không gian của chương 80 phút. Hiện nhãn “Bản trích dựng thử”. **Không ghi completion vào campaign v3**, không dùng bản 27 phút thay bản đầy đủ trong hợp đồng sản xuất. Namespace `SLICE.L01.SPINE`, điểm ra là kết bài thử. Sau tín hiệu tốt còn phải dựng/đo L01 đủ độ dài.

**Đầu vào:** preset Q03 đã commit, L01 available, chưa có beat; E04 có nguồn Mortal, `reflection=null`, các nguồn E khác giữ đúng preset. Avatar ở điểm nghỉ ngoài Xêdarê, Natan có mặt; có journal thay khi ông vắng. Không bắt chơi Q01–Q03 trước buổi thử. Giới thiệu ngắn nêu việc đời thường đã làm, không nói “Legends là lõi” trước khi hỏi hồi tưởng.

**Blockout:** sân nghỉ 60×70 m, tuyến kiểm đường hai nhánh, sân Q04 dùng lại; L01 theo đồ thị hồ sơ 14 với chiều dài rút. Hình khối, ký hiệu nguồn và âm tạm có quyền; chưa dựng chân dung/giọng cuối. Lời thoại dưới đây là [H]; câu nguồn dùng placeholder sách/câu, không chế lời Thiên Chúa/Môsê để thu âm.

## 2. Tám cụm cảnh — Tuyến tương tác 90 phút

| Cụm | Phút | Mục tiêu/động từ | Event đề xuất |
|---|---:|---|---|
| S01 Đường còn lại | 8 | Xác định nhóm và việc chuẩn bị | `BridgeEntered` |
| S02 Hai cách tới bờ sân | 14 | Tìm đường, kiểm vật cản | `RouteExplored`, `AidUsed` |
| S03 Lời kể trước lúc đi | 4 | Nghe/journal, thẻ nguồn, định dạng | `LegendFormatSelected` |
| S04 L01 — Bờ trước mặt | 27 | Khám phá và đủ beat bản trích | `CoreBeatPresented`, `ExplorationAction` |
| S05 Trở lại với người cuối | 5 | Chồng lớp, phản tư hoặc để trống | `LegendExcerptEnded`, chia sẻ nếu chọn |
| S06 Một lối thực sự đi được | 20 | Kiểm người, mở lối, bàn giao | `PlanPrepared`, `PlanExecuted` |
| S07 Điều mang theo | 9 | Chọn/thực hiện `food` hoặc `tools` | `BridgeCommitted` trong save slice |
| S08 Sau khi sân đã vắng | 3 | Nhìn hệ quả và kết bài thử | `SliceEnded` |

### S01 — Đường còn lại

**EXT. SÂN NGHỈ — CHIỀU.** Quyền đi/nhìn trao sau thẻ ngắn. Hai nhóm thu xếp, một người chưa biết sẽ đi cùng ai. Journal: **“Hành trình I — Bờ trước mặt / Chuẩn bị: xem đường và người cùng đi.”** Không hiện như phụ bản thưởng khi giải vụ hàng.

NATAN: “Chỗ này còn đủ cho người qua. Nhưng anh đã hỏi người cuối cùng sẽ đi với ai chưa?”

Người chơi hỏi ai đang chờ, đi quan sát trước hoặc đọc bảng nhóm. Không câu nào là xác nhận đạo đức; không chọn “quan tâm” để tăng điểm. Chưa bắt đầu hạn giờ.

### S02 — Hai cách tới bờ sân

**A:** theo dấu tải tới cầu cũ, kiểm chốt bằng quan sát và thử tải nhẹ. **B:** qua sân chuyển hàng, hỏi đường làm việc và kiểm then phụ. Cả hai có thao tác; được thăm cả hai. Kỹ năng cơ bản không companion vẫn khảo sát bằng mô tả/hướng dẫn. Một nút xem không tự giải hết kế hoạch.

Đồ đặt đúng chỗ ảnh hưởng người đi sau, nhưng chưa thực hiện Q04. Khi một tuyến đã khảo sát và một nhóm đã hỏi, trở lại điểm nghỉ. Gợi ý ghi cấp/mốc, không trừ điểm hay chặn ending. Đọc chậm không âm thầm bỏ lại một người.

### S03 — Lời kể trước lúc đi

Natan giới thiệu bằng lời hư cấu hồ sơ 14. Thẻ: **“L01 — Môsê / Xh 14,1–31 / Chuyển thể Kinh Thánh — bố cục và tương tác có phần sáng tác / Bản trích dựng thử.”** Cho chọn *Chơi bản trích*, *Xem/nghe tóm tắt*, *Để sau*. Chọn để sau trở lại sân, mốc chưa hết; thử vào đoạn tiếp nối thấy “Tiếp tục L01”, không tự cấp cổng.

Người kể không đưa Kinh Thánh hoàn chỉnh cho avatar; chương game dành cho player có thẻ thời đại riêng. Phân biệt đọc được khi tắt âm.

### S04 — Legend trục

| Nhịp / phút | Nội dung nguồn | Phần chủ động [H] |
|---|---|---|
| A / 3 | B01: Xh 14,1–10 | Chọn điểm nhìn và địa vật trại |
| B / 5 | B02: 14,10–14 | Hai tuyến trại, dời vật vướng lối |
| C / 4 | B03: 14,15–20 | Quan sát/pause, không nạp phép |
| D / 8 | B04: 14,21–25 | Theo dấu người trước, đi/ra hiệu trong hành lang |
| E / 4 | B05: 14,26–29 | Tới điểm an toàn, giảm hình ảnh vẫn đủ ý |
| F / 3 | B06: 14,30–31 | Nhìn lại, mở nguồn, xác nhận kết |

Không đo độ tin/thanh phép/QTE chết dân. Hai đường có góc nhìn/thao tác khác và hội tụ theo canon. Hụt thao tác quay checkpoint, không alternate history. Lời nguồn dùng placeholder `[S05:14:…]` tới khi có bản Việt được phép; không thu giọng cuối từ lời tự chế.

**Tóm tắt:** sáu trang A–F, chữ/ảnh tĩnh/nguồn, khoảng 8 phút dự kiến. Không nút “Hoàn thành ngay”. Trang cuối hiện rồi mới có “Trở lại”, không tối thiểu giây/quiz. Đổi định dạng giữ beat đã trình bày; thoát giữa trang giữ mốc chưa hết. Cả hai chỉ tạo `LegendExcerptEnded` trong namespace slice.

### S05 — Trở lại với người cuối

Gió qua vải nối về mái sân; giảm chuyển động dùng hai ảnh/thẻ địa điểm. Journal có mốc bản trích đã tới cuối và việc tiếp nối. Không thêm vật phẩm.

Phản tư: **“Khi chưa thấy đường, bạn muốn hỏi ai đang ở phía sau?”** Ghi riêng, nói một ý cho Natan hoặc chưa trả lời. Không chia sẻ thì Natan chỉ hỏi việc chuẩn bị; không khen avatar đã hiểu. Cổng dựa vào phần trình bày, không đáp án.

### S06 — Một lối thực sự đi được

Đưa người qua lối đã kiểm và có người nhận đầu kia. Mở then phụ bằng chèn tải, hoặc dùng cầu đã khảo sát có người giữ đầu nhận. Địa vật/mô tả không chỉ dựa màu. Đi trước quá xa khiến nhóm dừng an toàn và nhắc người nhận còn thiếu; không giết NPC.

MATTAI: “Tôi đóng cánh này sau khi nhận đủ người. Ai chờ ở bên kia?”

NGƯỜI CHỨNG: “Để tôi hỏi lại”; “Tôi sẽ đi kiểm trước”; hoặc “Tôi cần người giữ bên này.” Ý định đổi việc. Không câu nào tự spawn người nhận. Vắng companion có người địa phương nhận vai qua bàn giao thật. Không nói avatar là Môsê mới.

### S07 — Điều mang theo

Tải thêm chỉ đủ thực phẩm dự phòng hoặc dụng cụ tốt hơn; bữa/dây cơ bản có ở cả hai. Rina/Titus nêu nhu cầu, không gọi route kia vô đạo.

`food`: giao đúng phần, kiểm người nhận, cất kiện. `tools`: tháo kiện dụng cụ, buộc/thử vị trí trên tải. Chọn menu chưa commit. Hai trạng thái world khác nhau trong slice; bảng callback giả lập chỉ dành người nghiên cứu, không trình như campaign đã chơi. Không trao E01 vì xem L01.

### S08 — Sau khi sân đã vắng

Chỗ chờ trống vì đã bàn giao; vật được dời giữ đúng vị trí. Thấy người nhận ở đầu kia rồi kết bài thử. Không narrator tổng kết bài học/tooltip “Legends là cốt truyện chính” trước phỏng vấn.

## 3. Protocol đo “Legends là lõi hay phụ”

**Mẫu định tính dự kiến:** 12 người lớn tự nguyện chưa chơi v3, có người quen/chưa quen Kinh Thánh; 8 thử tương tác, 4 đồng thuận thử tóm tắt. Không dùng nhóm nhỏ để kết luận thống kê. Ghi nền kiến thức, kinh nghiệm chơi, thiết bị và trợ giúp thật; không chấm người theo quan điểm tôn giáo. Các ngưỡng bên dưới là đề xuất, chưa có kết quả.

Hỏi đúng thứ tự; người dẫn buổi chưa dùng “lõi/phụ” trước ba câu đầu:

1. “Hãy kể lại hành trình vừa chơi theo cách bạn nhớ.” Không nhắc Môsê trước.
2. “Bạn nghĩ game đang đưa mình đi qua câu chuyện gì? Những việc ở sân giúp phần nào trong hành trình đó?”
3. “Trong chương vừa chơi, bạn đã tự tìm hiểu hoặc quyết định cách làm điều gì?” Không gợi đường A/B.
4. “Nếu bỏ hẳn chương ở bờ biển, bạn nghĩ trải nghiệm còn giữ được câu chuyện vừa chơi không? Vì sao?” Đây là giả định phỏng vấn, không đổi chính sách gate.
5. **“Bạn thấy Legends là phần lõi của câu chuyện, một phần phụ, hay chưa rõ? Điều gì khiến bạn nghĩ vậy?”** Cho trả lời tự do trước khi mã hóa.
6. “Nếu chọn để sau khi chưa tới cuối, bạn nghĩ mình đi tiếp được tới đâu? Nếu dùng bản tóm tắt thì sao?”
7. “Phần nào thuộc Kinh Thánh, phần nào do game dựng thêm? Bạn dựa vào đâu?” Không bắt nhớ số câu.

| Chỉ báo | Cách ghi trước thử | Ngưỡng tín hiệu tiếp tục |
|---|---|---|
| C1 Tự nhớ trục | Câu 1 tự nhắc nguồn như mốc hành trình, không chỉ cảnh thưởng | ≥9/12; báo riêng nhóm |
| C2 Cầu nối | Câu 2 có liên hệ việc làm, không “xem để nhận đồ” | ≥8/12 |
| C3 Lõi/phụ | Câu 5 có lý do về truyện/hoạt động, không chỉ cửa khóa | ≥9/12, gồm ≥6/8 tương tác và ≥3/4 tóm tắt |
| E1 Thám hiểm | Kể hai việc khác đi thẳng/xem phim, một tuyến có ích | ≥6/8 tương tác |
| G1 Cổng/định dạng | Phân biệt đủ tóm tắt với thoát giữa chừng | ≥10/12; lỗi UI mở sai cổng là lỗi chặn |
| F1 Theo truyện | Nhóm tóm tắt nhớ mở–chuyển–kết và trung tâm nguồn | ≥3/4; thiếu beat trong nội dung là lỗi chặn |
| S1 Ranh giới | Không coi montage là du hành hay chứng cứ vụ kho | ≥10/12, xử lý hiểu lầm nghiêm trọng còn lại |

Hai người mã hóa độc lập nếu đủ nhân sự; hiện chưa phân công. Lưu bất đồng/câu dẫn chứng, không đổi rubric sau khi xem kết quả để đủ tỷ lệ. Bốn người tóm tắt không chứng minh parity cho mọi nhu cầu; cần thử tiếp nhóm phù hợp trước phát hành.

**Chưa đạt:** C1/C3 thấp → sửa thứ bậc mục tiêu/vị trí chương/hậu quả truyện; E1 thấp → sửa đồ thị và thao tác; C2 thấp → sửa điểm trở về; G1/F1 thấp → sửa tóm tắt/điều kiện; S1 thấp → sửa chuyển cảnh/nội dung. Không chỉ thêm chữ “chính”. Sau sửa thử với người mới; chưa đạt thì chưa mở rộng đủ ba chương.

## 4. Log và thời lượng

Event: `SliceStarted`, `BridgeEntered`, `RouteExplored`, `LegendFormatSelected`, `CoreBeatPresented`, `ExplorationAction`, `AidUsed`, `LegendPaused`, `LegendResumed`, `LegendExcerptEnded`, `ReflectionShared`, `BridgeCommitted`, `SliceEnded`. Payload tối thiểu: session ẩn danh, scene/beat, format, thời điểm hoạt động, assist và revision; không log phản tư riêng. Không suy đạo đức từ thao tác.

Đếm lần đi đầu, tách pause/idle/retry; quan sát thủ công tránh loại nhầm người đọc chậm. Báo trung vị/khoảng, bỏ dở/hỗ trợ và từng định dạng. Slice không chứng minh campaign đã đạt 216/720. Tuyến A thử mục tiêu 27–33%; lệch thì sửa cảnh, không tăng chờ.

## 5. Ma trận thử khi có build

| Ca | Kết quả cần có |
|---|---|
| Tóm tắt rồi thoát trang đầu | Chưa mở tiếp nối, có resume |
| Tương tác đủ 6 beat và kết | Chỉ mở slice, không ghi campaign |
| Tóm tắt đủ 6 trang/kết | Cùng lối/tải cơ bản như tương tác |
| Đổi format B03/B04 | Tiếp beat thiếu, không nhảy kết |
| Replay/load | Không lặp commit/tài nguyên |
| Người kể/companion vắng | Journal thay, lối cơ bản còn đủ |
| Không âm, chữ lớn, không rung/mash | Đủ nguồn/định hướng/cơ hội |
| Phản tư null | Qua cổng khi đủ nguồn, NPC không đọc ý riêng |

Các ca trên chưa chạy gameplay v3. Kiểm tự động hồ sơ chỉ kiểm dữ liệu/cổng ở mô hình đặc tả và khả năng đọc tài liệu.
