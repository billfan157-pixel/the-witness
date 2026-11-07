# 15 • Packet nguồn, thế giới và danh sách duyệt

**V3.0 • 07/11/2026 • Sáu packet cho ba chương bắt buộc • Chưa được chuyên gia duyệt**

Các nguồn công khai đã kiểm tra không thay thế người duyệt. Chủ dự án xác nhận hiện chưa có tên người nhận các vai này. Mọi trường người duyệt giữ **chưa phân công**, ngày duyệt trống, không ký thay. Bảng này là danh sách vị trí cần mời, chưa phải lịch hay thỏa thuận tham gia.

## 1. Hồ sơ bàn giao chung

Một packet phải đi cùng revision của beat, bản dịch và scene/asset đang duyệt. Mỗi trích đoạn sản xuất cần `sourceId`, `reference`, `edition`, `language`, `translator`, `rightsStatus`, `approvedTextRevision`, `reviewerDecision`. Các trường chưa có giữ `null`/`pending`, không điền bản tiếng Việt suy đoán. Mã tham chiếu hiện dùng cách đánh câu của nguồn USCCB; trước khóa lời phải đối chiếu bản Việt thực tế.

Các câu trong packet là chỉ dẫn biên tập, không là trích bản dịch để phát hành. Tham khảo văn bản S05/S06/S09 trực tiếp và thiết kế cảnh ở [hồ sơ 14](14-legends-depth-dossiers.md); không lấy mô tả gameplay làm lời nguồn. Phân biệt **[K] bản văn**, **[G] giáo huấn/giải thích**, **[L] lịch sử/hiện vật**, **[H] dựng nghệ thuật**, **[C] chưa xác định** trên từng record.

| Mã packet | Phạm vi | Revision | Người lập | Trạng thái |
|---|---|---|---|---|
| L01.SOURCE | Xh 14,1–31; B01–B06 | 3.0.0 | Bộ hồ sơ dự án | Draft, chưa duyệt |
| L01.WORLD | Trại, bờ, hành lang vượt; LW01–LW05 | 3.0.0 | Bộ hồ sơ dự án | Greybox có điều kiện |
| L02.SOURCE | 1 Sm 24; B01–B05 | 3.0.0 | Bộ hồ sơ dự án | Draft, chưa duyệt |
| L02.WORLD | Khe đá, hang, phục trang; LW06–LW10 | 3.0.0 | Bộ hồ sơ dự án | Greybox có điều kiện |
| L04.SOURCE | Ga 21,1–19; B01–B05 | 3.0.0 | Bộ hồ sơ dự án | Draft, chưa duyệt |
| L04.WORLD | Thuyền, ngư cụ, bờ hồ; LW11–LW15 | 3.0.0 | Bộ hồ sơ dự án | Greybox có điều kiện |

“Greybox có điều kiện” nghĩa là được dựng nội bộ bằng hình khối, nhãn phân đoạn và lời dẫn hư cấu phân biệt rõ; chưa dùng để tuyên bố phục dựng đúng, phát hành câu nguồn, thu âm cuối hoặc khóa tạo hình. Không có dữ liệu người duyệt đồng nghĩa chưa qua cổng chuyên môn, kể cả khi kiểm tài liệu tự động đạt.

## L01.SOURCE — Trình thuật vượt biển

**Nguồn sở hữu:** [S05 — USCCB, Exodus 14](https://bible.usccb.org/bible/exodus/14). Đã mở đọc chương trong đợt v3. **Nguyên tắc giải thích:** S01, *Dei Verbum* 12; giữ văn cảnh và chủ thể, không đồng nhất mức chính xác khảo cổ với ý nghĩa bản văn. S02 về giới hạn mặc khải tư hỗ trợ phân biệt với Veil; không dùng để xác nhận một hình ảnh game là mặc khải.

### Ma trận chuyển thể

| Beat | Phạm vi [K] | Scene nhận | Dựng thêm [H] cần xem xét |
|---|---|---|---|
| L01.B01 | Xh 14,1–10 | S01–S02 | Điểm nhìn và vòng đường trong trại |
| L01.B02 | 14,10–14 | S02–S03 | Nhịp nghe nhiều cụm người; không bịa phát biểu nguồn |
| L01.B03 | 14,15–20 | S04 | Camera, khoảng cách, chuyển ánh sáng |
| L01.B04 | 14,21–25 | S05 | Hành lang chơi và cụm người dẫn theo |
| L01.B05 | 14,26–29 | S06 | Tầm nhìn xa, chế độ giảm hình ảnh đau khổ |
| L01.B06 | 14,30–31 | S07 | Vị trí nhìn lại và chuyển cảnh về đời thường |

**Điều không được cắt:** chủ thể sáng kiến cứu thoát; sự khác biệt giữa việc Môsê thực hiện và điều diễn ra ngoài quyền ông; phần cuối sau khi qua. **Điều không được gán:** avatar có kỹ thuật làm phép; dân cư được cứu tùy phản xạ; Pharaô hay tọa độ đã được nhận diện chắc chắn. Các cảnh chiến tranh không trở thành hoạt động thu chiến lợi phẩm hoặc điểm tiêu diệt.

**Các câu hỏi duyệt cụ thể:** R01 xác nhận khung đầu 1–9 đủ đặt B02 trong văn cảnh chưa; R02 xem camera/interaction có ngầm trao phép cho người chơi không; R04 chọn thuật ngữ Việt cho địa danh và đoạn nước, kiểm cách đánh câu; R06 xem việc giảm hình ảnh vẫn giữ ý nghĩa B05; R07 thử thoát trước B06 và kiểm gate không mở. Không tự xác định đáp án ngôn ngữ/học thuật từ bản tiếng Anh.

**Gói tóm tắt:** sáu trang, mỗi trang một beat; cùng revision và nguồn như bản chơi. Phải có phần kết, thẻ “bố cục được sáng tác”, transcript truy cập được và định dạng tĩnh. Chưa có bản dịch Việt được chọn/cấp phép; `edition`, `translator`, `approvedTextRevision` đều chưa khóa. R05 kiểm quyền riêng của văn bản, ảnh và âm thanh.

**Điều kiện nhận:** đối chiếu cả 6 beat với source, bảng lời nguồn/lời dẫn không lẫn, hai định dạng không mất chủ thể, các yêu cầu R01/R02/R04/R05/R06/R07 đều có quyết định lưu được. Hiện chưa có quyết định ấy.

## L01.WORLD — Trại và bờ chưa định vị

**Khung thời đại:** thế giới trình thuật Xuất Hành; niên đại tuyệt đối, Pharaô và tuyến vượt chưa được dự án xác định [C]. Không lấy việc tham chiếu hiện vật Ai Cập thuộc một thời kỳ làm bằng chứng niên đại biến cố. Greybox dùng tên “bờ”, “trại”, “tuyến ven đá”; không có bản đồ khẳng định “địa điểm thật”.

**Nguồn vật liệu:** [S32 — UCL, Digital Egypt, Items of ancient Egyptian dress](https://www.ucl.ac.uk/museums-static/digitalegypt/textil/dress.html). Trang giới thiệu hiện vật **UC 8980A/B**, tay áo Gurob, New Kingdom, khoảng 1400 TCN; chỉ tham khảo cách ráp/vật liệu trong phạm vi ấy. Các mẫu khác trên cùng trang thuộc niên đại khác, không gom thành một costume chung. Đây không là áo Môsê hay chứng cứ trang phục của đoàn người.

| Asset | Căn cứ và giới hạn | Chỉ dẫn dựng [H] | Việc phải khóa / vai |
|---|---|---|---|
| LW01 Trại ba cụm | [K] khung nguồn; vị trí từng lều [C] | Vải trung tính, kiện tải có lối đi; không đại cảnh thành phố tưởng tượng | R01/R03: vật liệu, silhouette; R06: đọc đường |
| LW02 Áo/quấn và tay áo | [L] S32 UC 8980A/B chỉ để so vật liệu | Sheet riêng từng nhân vật, độ mòn chức năng; chưa chép họa tiết tôn giáo | R03/R05: niên đại, quyền ảnh tham chiếu |
| LW03 Dây, gậy, đồ đựng | Chi tiết cụ thể chưa có context đủ [C] | Proxy gỗ/sợi ít trang trí, ghi “tạm” | R03 tìm corpus đúng thời; không khóa sculpt cuối |
| LW04 Bờ và tuyến qua | [K] nguồn; địa hình đo vẽ [H] | Một vòng trước bờ, một tuyến hội tụ; không scale địa lý | R01/R02: chủ thể; R03: không giả chứng minh tuyến |
| LW05 Ánh sáng/nước/âm | [K] các mốc nguồn; hình thức biểu đạt [H] | VFX giới hạn, camera không chớp; gió/nền bước có caption | R01/R02/R06: ý nghĩa và giảm kích thích |

**Âm nhạc:** dùng nhạc sáng tác có ghi là nhạc nền; chưa gọi nhạc cụ/điệu thức là phục dựng. **Đời sống:** nhóm nền có việc thu xếp, chờ nhau, giữ lối; không kể tiểu sử mới như người có thật trong bản văn. **Loại khỏi board:** tượng/đền/biểu trưng từ nhiều triều đại lẫn nhau; bản đồ tuyến được trình bày như đã được khảo cổ xác nhận; đám đông dùng một mẫu dân tộc làm phe tốt/xấu.

**Đầu ra cần giao:** greybox đồ thị A–F; camera nước hai chế độ; sheet trang phục có niên đại từng reference; sheet “giữ / sửa / chưa rõ” của LW01–LW05; danh sách quyền asset. Chưa có lịch đo thực địa, mẫu material cuối hoặc giấy phép ảnh.

## L02.SOURCE — Đavít và Saun

**Nguồn sở hữu:** [S06 — USCCB, 1 Samuel 24](https://bible.usccb.org/bible/1samuel/24). Đợt v2 từng gặp lỗi truy cập; **v3 đã mở và đối chiếu toàn chương** trên nguồn này. Đây là cập nhật mức truy cập, không là phê chuẩn diễn giải của chuyên gia.

| Beat | Phạm vi [K] theo nguồn hiện dùng | Scene nhận | Dựng thêm [H] cần duyệt |
|---|---|---|---|
| L02.B01 | 24,1–4 | S01–S02 | Đường khe đá và hai góc tiếp cận |
| L02.B02 | 24,5–6 | S03 | Nhịp đi/chạm theo blocking, không trao trophy |
| L02.B03 | 24,7–8 | S04 | Đường quay về nhóm và động tác ra hiệu |
| L02.B04 | 24,9–16 | S05–S06 | Khoảng cách ngoài hang, camera/điểm đứng |
| L02.B05 | 24,17–23 | S06–S07 | Đường rời sau phần đáp/lời cam kết |

**Điều không được cắt:** phần hối hận, giới hạn với người cùng nhóm, cuộc đối diện và phần cuối. Không gộp đồ vật/sự kiện từ 1 Sm 26. Không mở nhánh giết Saun, không mô tả đoạn nguồn như lựa chọn bạo lực được tối ưu bằng chỉ số cao.

**Câu hỏi duyệt:** R01 xem việc không có menu giết có giữ căn tính nhân vật mà vẫn cho chủ động khám phá không; R02 kiểm cách nói về người được xức dầu trong đúng văn cảnh; R04 đối chiếu đánh câu/tên riêng của bản Việt; R06 kiểm căng thẳng không phụ thuộc nhìn trong tối hoặc nghe chính xác một tiếng động. R07 kiểm L02 không xóa việc avatar đã gây hại ở Q06.

**Gói tóm tắt:** năm trang theo B01–B05; giữ cả phần quay lại và rời đi. Không chỉ viết “tha thứ là tốt”. Câu nguồn dùng placeholder phân đoạn tới khi chọn bản dịch/quyền. Thiết kế âm thanh có pause và transcript, chưa có giọng nhân vật được duyệt.

**Điều kiện nhận:** toàn beat hiện diện ở cả hai định dạng, đánh câu có crosswalk bản Việt, tạo hình/đối thoại không ghép 1 Sm 26, cổng mở sau phần cuối. Các quyết định chuyên môn còn pending.

## L02.WORLD — En-Ghedi và hang nghệ thuật

**Khung:** vùng En-Ghedi theo bản văn [K]; hình học hang/cảnh cụ thể do game dựng [H]. Niên biểu tuyệt đối và nhận diện hang chưa khóa [C]. Không áp dụng phục trang thế kỷ I từ Mortal World cho chương này.

**Nguồn cảnh quan:** [S30 — Israel Nature and Parks Authority, En Gedi Nature Reserve, brochure](https://static.parks.org.il/wp-content/uploads/2022/12/engedi-eng.pdf). Tài liệu chính thức mô tả cảnh quan, các dòng suối và các lớp khảo cổ. Dùng để quan sát tương quan vách đá–thung khe–ốc đảo; không lấy lối tham quan hiện đại hoặc tên địa điểm hiện tại làm bản đồ của biến cố. Các di tích muộn trong tài liệu không tự thuộc bối cảnh Đavít.

| Asset | Căn cứ và giới hạn | Chỉ dẫn dựng [H] | Việc phải khóa / vai |
|---|---|---|---|
| LW06 Vách/khe/ốc đảo | [L] S30 cho cảnh quan hiện nay | Địa vật dễ nhớ, không sao đường tham quan/cầu thang | R03 phân biệt hiện đại/cổ, R06 đọc cao độ |
| LW07 Hang bảy nút | [H] toàn bộ đồ thị | Lối thấp và mép vòng hội tụ, có mốc tự chọn | R01 không làm lệch tình thế, R06 không bẫy tối |
| LW08 Áo Saun, mảnh áo | [K] đồ vật trong nguồn; cấu tạo chi tiết [C] | Chưa khóa vải/màu/biểu trưng; không bản sao áo vua điện ảnh | R03 cần corpus phục trang đúng thời; R01 giữ vai trò nguồn |
| LW09 Đạo cụ nhóm | Vũ khí/công cụ cụ thể chưa đủ context [C] | Proxy ít chi tiết; không thêm giáo làm tâm điểm | R01 phân biệt chương 26; R03 duyệt loại vật |
| LW10 Ánh sáng/âm hang | [H], chưa đo âm học địa điểm | Đường đi có tương phản, âm chỉ hỗ trợ; tiếng không tự xác định quân số | R06 accessibility, R05 quyền thu âm/nhạc |

**Đời sống:** dấu nghỉ có mục đích định hướng, không “rương của Đavít”; nền sinh thái không được tuyên bố nguyên trạng cách nay nhiều thiên niên kỷ. **Loại khỏi board:** nhà hội Byzantine, di tích thuộc lớp muộn, trang bị La Mã, lời khẳng định một hang cụ thể là hang của nguồn. Không thêm dân làng biết toàn bộ nội tâm Saun để diễn giải hộ.

**Đầu ra:** blockout A–G với hai tuyến thật đi được; bảng source riêng phục trang; thử độ tối ở phụ đề lớn/không âm; bản vẽ camera đối diện; bảng asset LW06–LW10 với cột niên đại và mức chắc. Chưa có corpus đủ để khóa costume cuối; đây là khoảng trống nghiên cứu cụ thể, không được lấp bằng nhãn chung “cổ đại”.

## L04.SOURCE — Ga 21,1–19

**Nguồn sở hữu:** [S09 — USCCB, John 21](https://bible.usccb.org/bible/john/21), đã đọc văn bản và chú giải liên quan trong đợt v3. Văn cảnh cuộc gặp Đức Kitô Phục Sinh là điều lõi; không dùng lời dẫn Mortal thay thế ý nghĩa ấy. Không chuyển khác biệt từ ngữ chú giải thành cây kỹ năng.

| Beat | Phạm vi [K] | Scene nhận | Dựng thêm [H] cần duyệt |
|---|---|---|---|
| L04.B01 | 21,1–3 | S01–S02 | Công việc dây/lưới trên thuyền |
| L04.B02 | 21,4–8 | S03 | Góc nhìn và nhịp nhận biết |
| L04.B03 | 21,9–14 | S04–S05 | Vòng quan sát ngư cụ/bờ và vị trí ngồi |
| L04.B04 | 21,15–17 | S06 | Blocking và pause, không sửa lời nguồn |
| L04.B05 | 21,18–19 | S07 | Đoạn bờ giới hạn, phần cuối và chuyển cảnh |

**Điều không được cắt:** trung tâm Phục Sinh, bữa ăn, việc trao trách nhiệm và phần hướng tới tương lai. Không tạo cá trước mốc nguồn do kỹ năng; không có 153 collectibles; không lựa chọn tình yêu ba cấp. Không chế lời Đức Giêsu cho một nhánh phụ hoặc câu thuyết phục avatar.

**Câu hỏi duyệt:** R01/R02 xem camera, giọng và hình ảnh có làm lu mờ trung tâm nguồn không; R04 khóa lời của từng người và crosswalk bản Việt; R05 xác nhận quyền bản dịch/lời thu; R06 kiểm bỏ bơi/chuyển động thuyền vẫn đủ diễn tiến; R07 xác nhận L04 không tự phục hồi quan hệ/đồng thuận trong Mortal.

**Gói tóm tắt:** năm trang B01–B05, cùng văn cảnh, chữ có nguồn và người nói. Phần lời Đức Giêsu không có bản phát hành tới khi bản dịch và quyền được xác nhận. Cả game và bản tóm tắt cần cùng revision; sửa một câu nguồn phải kiểm lại cả hai.

**Điều kiện nhận:** các beat có đủ, lời nguồn/lời [H] tách trên từng dòng sản xuất, không cấp kỹ năng siêu nhiên, không bỏ phần trao việc. R01/R02 duyệt tạo hình/diễn xuất riêng; hiện chưa phân công người duyệt.

## L04.WORLD — Thuyền và bờ hồ

**Khung:** Galilê thời Tân Ước theo pericope; ngày/tháng và điểm bờ cụ thể chưa được dự án khóa. Mô hình thuyền tham khảo khảo cổ theo niên đại rộng, không đồng nhất hiện vật với thuyền của nhân vật nguồn.

**Nguồn vật thể:** [S31 — Yigal Allon Centre, The Ancient Boat](https://yigal-allon-centre.org.il/en/the-museum/the-ancient-boat/). Bảo tàng trình bày thuyền gỗ khoảng hai nghìn năm tuổi, tìm gần Ginosar năm 1986, dài khoảng 8 m. Chỉ dùng như ví dụ vật thể theo vùng/thời kỳ rộng; nguồn không chứng minh đây là thuyền Phêrô. Không lấy tên gọi truyền thông làm provenance. S25 Magdala chỉ ở mức abstract, chưa đủ chọn mọi vật nhỏ từ cùng bối cảnh khai quật.

| Asset | Căn cứ và giới hạn | Chỉ dẫn dựng [H] | Việc phải khóa / vai |
|---|---|---|---|
| LW11 Thuyền | [L] S31, chiều dài tham khảo khoảng 8 m | Dựng vùng thao tác nhỏ, ghi phần nới chỗ cho gameplay | R03 chi tiết kết cấu; R05 quyền ảnh/mô hình |
| LW12 Lưới/dây/mái chèo | Loại công việc từ nguồn; cách đan/chốt cụ thể [C] | Ba điểm tương tác có mô tả, không mô phỏng toàn nghề cá | R03 cần context đúng thời; R06 thay mash |
| LW13 Bếp/bát/đồ ăn | [K] vai trò trong nguồn; kiểu bát chi tiết [C] | Proxy giản dị, không dùng đồ Byzantine vì đẹp | R01/R03 duyệt từng nhóm; S25 cần đọc context tiếp |
| LW14 Bờ/đá/điểm ngồi | [H] bố cục, [C] tọa độ | Vòng đi ngắn có hai mặt nền; không gọi là địa điểm chính xác | R01/R03 nhãn; R06 dễ đọc tuyến |
| LW15 Tạo hình/giọng | [H] diễn xuất nghệ thuật, không chân dung xác minh | Board riêng, nguồn mỗi chi tiết; không chế lời | R01/R02/R04/R05, thêm R06 cho phụ đề |

**Âm:** vỗ nước, sợi căng, bước bờ và khoảng yên, có phụ đề âm thiết yếu; nhạc sáng tác ghi rõ. Không dùng một âm thanh “thiêng” để báo đáp án đúng. **Loại khỏi board:** nhà thờ hiện đại như nền thế kỷ I; khẳng định chân dung xác thực; thuyền có chi tiết lấy từ nhiều thế kỷ không ghi nhận; vật từ hiện vật bảo tàng được gọi thánh tích của chính cảnh.

**Đầu ra:** mặt cắt thuyền có vùng tay/camera an toàn, sơ đồ lưới theo thao tác, layout E–F, thử giảm chuyển động, sheet LW11–LW15 và quyền từng ảnh tham khảo. Chưa có bản model cuối được phép dùng.

## 2. Danh sách vị trí cần mời duyệt

| Mã | Vị trí / chuyên môn cần có | Phạm vi quyết định | Người nhận | Phê chuẩn |
|---|---|---|---|---|
| R01 | Chuyên gia chú giải Kinh Thánh | Pericope, canon lock, beat, phần [H] có làm sai ý không | Chưa phân công | Chưa có |
| R02 | Người có chuyên môn thần học Công giáo | Chủ thể phép lạ, Phục Sinh, hình ảnh/giọng, phân biệt Veil | Chưa phân công | Chưa có |
| R03 | Cố vấn lịch sử–khảo cổ, phân chuyên môn theo thời kỳ | Xuất xứ/niên đại artifact, phục trang, cảnh quan; cần người phù hợp từng L | Chưa phân công | Chưa có |
| R04 | Chuyên gia ngôn ngữ/bản dịch | Hípri/Hy Lạp khi cần, bản Việt, thuật ngữ và đánh câu | Chưa phân công | Chưa có |
| R05 | Phụ trách sản xuất và quyền nội dung | Văn bản/ảnh/mô hình/giọng/nhạc, phạm vi sử dụng | Chưa phân công | Chưa có |
| R06 | Thiết kế thám hiểm, UX và tiếp cận | Hoạt động đáng chơi, hai định dạng, camera/điều khiển/chữ | Chưa phân công | Chưa có |
| R07 | QA continuity và tiến độ | Gate, format parity, replay/load, nguồn dữ liệu và lỗi xuyên lớp | Chưa phân công | Chưa có |

R03 là một vị trí điều phối, không ngầm giả định một người thông thạo cả Ai Cập cổ, thời Đavít và Galilê thế kỷ I. Khi mời cần tách chuyên gia theo packet nếu cần. R01/R02 cũng có thể cần hơn một người; chỉ ghi tên sau khi chính người đó nhận vai.

## 3. Thủ tục nhận, sửa và khóa

1. Gửi packet có revision và câu hỏi cụ thể, kèm cảnh chơi/ảnh thực tế; không chỉ gửi pitch để xin “duyệt toàn bộ game”.
2. Ghi từng ý kiến với source/beat/asset, mức cần sửa và lý do. Các trạng thái: `unassigned → invited → reviewing → changes_requested / approved_for_scope`. Mời chưa là đồng ý, đồng ý tham gia chưa là duyệt.
3. Người biên tập sửa, đính bản trước/sau và gửi đúng phần đổi. Khi thay bản dịch, đoạn thoại, camera trao năng lực hoặc thời đại asset, mở lại phạm vi duyệt liên quan.
4. Khóa chữ/thu âm cần R01/R02/R04/R05. Khóa art lịch sử cần R01/R03/R05. Khóa trải nghiệm/gate cần R06/R07 và thử người chơi. Phát hành chương cần đủ các phạm vi ấy, không một chữ ký chung thay tất cả.
5. Lưu reviewer, ngày, revision, phạm vi, điều kiện còn lại và đường dẫn bằng chứng. Contract hiện giữ `assignee:null`, `approval:null`; bộ đọc không được gắn huy hiệu “đã thẩm định”.

**Chưa hoàn thành:** mời người thật, chọn bản dịch Việt/quyền, bổ sung corpus phục trang L02 và đạo cụ nhỏ, dựng/đo greybox, phản biện chuyên môn, thu âm và playtest. **Đã có trong v3:** sáu packet với nguồn sở hữu, khoảng chưa rõ, asset/scene cần duyệt và tiêu chí nhận; có thể giao việc mà không phải đoán ý thiết kế.
