# 16 • Nghiên cứu và quyết định phát triển chiều sâu

**Phụ lục thiết kế 3.2 • 08/11/2026 • Bản chơi 0.4.0.** Tài liệu này bổ sung chiều sâu cho chiến dịch hiện hữu. Mã Q/L/V, sự thật nền và cổng Kinh Thánh vẫn có chủ sở hữu tại các hồ sơ 08, 12, 14 và campaign-contract. Luật thao tác thực thi nằm trong `witness-depth.js`; atlas 17 được kết xuất từ đúng dữ liệu ấy. Kịch bản biên tập ở 18 phân biệt rõ phần đã chơi được với phần cần dàn dựng tiếp.

## 1. Vấn đề cần giải quyết

Một chương có tên, phong cảnh, đoạn kể và lựa chọn cuối vẫn có thể thiếu trải nghiệm. Cần xét người chơi thực sự phải hiểu điều gì, làm gì với hiểu biết ấy và nhận ra hậu quả ở đâu. Thêm lời giải thích mà hành động vẫn chỉ là xác nhận không làm câu hỏi của chương sâu hơn.

Rà soát bản nền cho thấy ba điểm cụ thể. Nhiều công việc chỉ yêu cầu chọn một câu đúng hiển nhiên. Nhiều thao tác dùng chung một chuỗi ba bước, bất kể tình huống. Hồ sơ mô tả những vòng thám hiểm phong phú hơn những gì luật chơi thực tế kiểm được. Phụ lục chuyển các công việc tại địa vật hiện hữu thành 25 tình huống có dữ liệu đầu vào, giới hạn, phản hồi và phương án có thể sửa.

Đơn vị chiều sâu của đợt này là **một quyết định có thể giải thích bằng dấu trong cảnh**. Không tính số đoạn văn, số hệ thống hay số phút người chơi phải chờ. Một màn ngắn mà người chơi tự dựng được quan hệ giữa ba chi tiết có thể đạt mục đích tốt hơn một đoạn kể dài.

## 2. Nguồn được đọc lại trong đợt này

Ngày dưới đây là ngày kiểm truy cập, không là ngày công bố. Mã nguồn giữ theo sổ 10. Những quyết định cơ chế là sáng tác [H] của dự án, không phải hướng dẫn được các nguồn chuẩn nhận.

| Nguồn | Phần thực sự truy xuất ngày 08/11 | Điều dùng vào thiết kế | Giới hạn |
| --- | --- | --- | --- |
| S05 • [Nova Vulgata, Exodus](https://www.vatican.va/archive/bible/nova_vulgata/documents/nova-vulgata_vt_exodus_lt.html) | Chương 14 của văn bản trên Vatican; đường USCCB bị 403 trong đợt này | Giữ chủ thể hành động cứu thoát và thứ tự biến cố | Không phải bản dịch tiếng Việt được chọn để phát hành; không dùng để suy tọa độ vượt biển |
| S06 • [USCCB, 1 Samuel 24](https://bible.usccb.org/bible/1samuel/24) | Bản văn và chú thích của chương | Đavít tha Saun và giữ người của mình khỏi tấn công | Không ghép hành động chương 26; sơ đồ hang do game sáng tác |
| S07 • [USCCB, Jeremiah 38](https://bible.usccb.org/bible/jeremiah/38) | Đặc biệt 38,7–13 và chú thích liên quan | Chi tiết vải cũ lót nơi dây tì là hạt nhân tình huống | Chưa khóa số người hay lời dịch để thu âm |
| S09 • [USCCB, John 21](https://bible.usccb.org/bible/john/21) | Bản văn và chú thích, trọng tâm 1–19 | Giữ mẻ cá, lưới không rách, bữa sáng và cuộc trao sứ vụ | Không suy cấu tạo lưới từ câu chuyện; không biến số cá thành mã mở khóa |
| S10 • [Nova Vulgata, Acts](https://www.vatican.va/archive/bible/nova_vulgata/documents/nova-vulgata_nt_actus-apostolorum_lt.html) | Chương 16; đường USCCB bị 403 trong đợt này | Lấy việc ở lại và sự hiện diện làm trọng tâm phần phụ | Không chế lời Phaolô hay cho người chơi quyết định phép lạ |
| S23 • [CCC 2488–2492](https://www.vatican.va/content/catechism/en/part_three/section_two/chapter_two/article_8/iv_respect_for_the_truth.html) | Mục về việc truyền đạt sự thật, kín đáo và đời tư | Phân biệt nội dung đúng với quyền truyền cho người nhận cụ thể | Mô hình phong bì và trường consent là thiết kế game |
| S26 • [Worch & Smith, Environmental Storytelling](https://media.gdcvault.com/gdc10/slides/Smith_Harvey_WhatHappenedHereWeb_Notes.pdf) | Trang PDF 13–34, trọng tâm nối dấu và báo hiệu khả năng hành động | Dấu trong cảnh phải giúp hình thành và thử một giả thuyết | Không tuyên bố đã xem toàn bộ video; không sao chép ví dụ hay asset |
| S17 • [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/full-list/) | Các mục motor/cognitive, thao tác số và phương án cho thời gian chính xác | Không buộc kéo thả, phản xạ nhanh hay nghe âm thanh mới giải được | Chưa có kiểm tra với người dùng công nghệ hỗ trợ |
| S30 • [INPA, En Gedi](https://static.parks.org.il/wp-content/uploads/2022/12/engedi-eng.pdf) | Phần mô tả cảnh quan, vách và khe | Tham chiếu hình thái không gian L02 | Không xác nhận hang Saun; đường tham quan hiện tại không thành đường thời cổ |
| S31 • [Yigal Allon Centre, The Ancient Boat](https://yigal-allon-centre.org.il/en/the-museum/the-ancient-boat/) | Giới thiệu hiện vật tìm năm 1986, kích thước khoảng 8 m | Gợi ý vật thể và mức chật của thao tác cạnh mạn | Không nhận là thuyền Phêrô; không suy tải trọng, kết cấu lưới hoặc quyền ảnh |

Đối với S05/S10, nguồn Latin chỉ dùng đối chiếu mạch biến cố; dự án chưa làm khảo sát ngữ văn đa bản dịch. Một lần truy cập thành công không xóa lịch sử lỗi truy cập của URL khác. Các nguồn S22/S29 vẫn giữ mức đọc đã ghi trong sổ 10, không gắn nhãn “đã đọc lại” cho đợt này.

## 3. Bảy nguyên tắc chuyển nghiên cứu thành luật chơi

**Dấu có việc để làm.** Vết xước bánh xe gợi bánh còn trôi. Mép giấy bị bóc cho thấy can thiệp vào trang. Sợi dây và vệt bánh dựng một tuyến cần kiểm. Mỗi dấu phải thay một lựa chọn hoặc bác một giả thuyết. Trang trí gợi không khí có thể tồn tại riêng, nhưng không được giả làm chứng cứ.

**Tình huống có khoảng trống suy luận.** Không đặt ngay câu trả lời trọn vẹn lên vật cần quan sát. Cho người chơi hai hoặc ba dữ kiện đủ để tìm quan hệ; lời NPC giữ đúng phạm vi họ biết. Phản hồi sau một lần thử giải thích quan hệ còn thiếu, không chỉ báo đúng/sai.

**Luật nhận nhiều cách hợp lệ.** Nhiều việc chuẩn bị làm song song được. Hai người có thể đổi vai khi năng lực và người nhận vẫn đủ. Hai tuyến có thể cùng tránh sỏi và ánh sáng. Không loại phương án chỉ vì nó khác một chuỗi mẫu. Hướng dẫn mức ba chỉ đặt một phương án, không định nghĩa toàn bộ đáp án.

**Thử trên bàn khác thực hiện trong cảnh.** Người chơi chỉnh phương án và kiểm điều kiện miễn phí. Chọn thực hiện mới ghi nhận công việc bằng model chiến dịch. Thử sai không tự gây thương tích, làm cạn thức ăn hay làm vỡ vật Kinh Thánh. Hệ quả người/giấy/thương tích của Q08 vẫn do lựa chọn phương án ngoài cảnh hiện hữu quyết định.

**Thông tin có dòng đi.** Bản chép từ E04 không thành lần đếm mới. B06 không gộp với G17. Đúng lượng không tự chứng minh ý định. Mọi thẻ hỗ trợ một nhận định phải có phạm vi phù hợp; “chưa đủ căn cứ” là kết quả được lưu, không là thất bại nhận thức.

**Người có quyền nhận việc.** Phân vai không biến NPC thành quân cờ không giới hạn. Mỗi người một nơi, có việc đã nhận, có vai không thể bỏ. Rina giữ bếp, Sela chỉ đồng ý một cuộc nói, người đi cuối cần mốc nhìn thấy được. Giao thêm việc phải có người đứng nhận thay.

**Tầng nguồn có biên giới.** Người chơi chuẩn bị một xe, một đường lui hay một thao tác lưới hư cấu. Thao tác không mở biển, không quyết định Đavít có tha Saun, không làm mẻ cá có xảy ra và không làm lưới trong Ga 21 rách. Cách xem tóm tắt đủ nhịp vẫn có cùng quyền mở cổng. Phản tư được để trống.

## 4. Bản sắc lối chơi của các hồi

Hồi I đặt câu hỏi **ai đang còn ở phía sau?** Từ tải của xe ở Q01 đến thông tin bị che ở Q02, tuyến hàng ở Q03 và ca cuối Q04, người chơi học nhìn phần không nằm ngay trước mắt. L01 đưa việc ấy vào một bối cảnh nguồn có quy mô lớn hơn: không ai điều khiển phép lạ, nhưng người phụ có thể giữ sự hiện diện của người đi cuối.

Hồi II hỏi **khoảng cách nào phải giữ?** Khoảng cách giữa xuất và nhận ở Q05, giữa bản gốc và bản chép ở Q06, giữa giúp và làm thay ở Q07, giữa gần một người và có đường nhận thật ở Q08. L02 tạo một ngữ pháp tiếng/ánh sáng/đường lui. Người chơi được gần hoàn cảnh một quyết định mà không chiếm quyết định của Đavít.

Hồi III hỏi **lời chứng sẽ tới tay ai, và ai sống tiếp sau nó?** Q09 đặt quyền nhận thông tin. Q10 buộc giữ sự thật bất lợi cho gia đình. Q11 phân cả phần bữa và ca sau. Q12 đưa hồ sơ tới những người nhận cụ thể. L04 không thưởng người chơi bằng một lời tuyên bố đạo đức; công việc cạnh thuyền và bữa sáng tạo nhịp để trở về nhận việc đời thường.

## 5. Chất liệu lịch sử đi vào chi tiết thế nào

Vật liệu phải có dấu sử dụng: dây tì một cạnh, vò nước làm trọng tâm đổi, nút gỗ có vết tháo, giấy có thớ dựng. Đây là chỉ dẫn mỹ thuật [H], chưa là kết luận khảo cổ. Cùng một vật có thể xuất hiện ở nhiều nơi mà không suy thành cùng một người sở hữu. Dấu kho dùng chung không là chữ ký cá nhân.

Thuyền Ginosar chỉ làm điểm tham chiếu vật thể. Bản cân bằng hai mạn dùng đơn vị trò chơi, không thông số phục dựng. Các cụm từ khẳng định lưới “ba lớp” được bỏ khỏi tên thao tác nguồn L04; bản văn Ga 21 không mô tả cấu tạo ấy. Người chơi được nhìn và sắp mép lưới trong một mô hình sáng tác, được gắn nhãn ngay tại bàn.

Sơ đồ En Gedi dùng hai đường êm và một đường sỏi, nhưng không khẳng định tìm được đường thật của Đavít. Không bắt người chơi phân biệt âm thanh tinh tế hoặc nhìn bóng tối mới biết đường. Chữ mô tả tiếng dội và lộ sáng luôn có mặt cùng sơ đồ; âm thanh 3D có thể bổ sung cảm giác sau này.

## 6. Mức triển khai và điều chưa được chứng minh

Đợt 0.4.0 thực thi 25 tình huống bằng bàn thao tác tại các địa vật đang có trong thế giới 3D: lựa chọn từng thao tác, phân vai bằng điều khiển số, tuyến có kết nối, đối chiếu nhiều khoản, ghép nguồn và chia bản cho nơi nhận. Bản nháp theo cảnh được lưu; sổ giữ phương án thực sự đã làm và ghi việc dùng hướng dẫn.

Các bảng ấy là mô hình luật chơi, chưa là mô phỏng đám đông, dây mềm, âm học hoặc tải thuyền trong thế giới 3D. Phản hồi có căn cứ luật và đường chọn có nhiều cách hợp lệ không tự chứng minh trải nghiệm đã đủ hấp dẫn. Kịch bản 18 chỉ rõ những hoạt cảnh cần dựng tiếp; không tính chúng vào phần đã chạy.

Tài liệu không tăng ngân sách 216/720 phút và không khẳng định đạt mục tiêu ấy. Cần đo thời gian thao tác, hiểu lầm, hành vi sửa phương án và ký ức chi tiết bằng người chơi thật. Protocol 19 có các ngưỡng chấp nhận đề xuất, chưa phải số đo đã có. Bảy vị trí duyệt chuyên môn vẫn chưa phân công.

## 7. Cách duy trì bộ tài liệu

Khi sửa luật, sửa catalog runtime trước rồi kết xuất lại atlas 17 bằng `node tools/build-depth-atlas.cjs`. Người viết kịch bản cập nhật 18 khi thay thông tin NPC biết hoặc hệ quả xuất hiện muộn. Khi sửa sự thật G17/B06 hay phạm vi chứng cứ, sửa hồ sơ 12 và campaign-contract trước, rồi kiểm lại mọi tình huống liên quan.

Không tạo thêm bộ glossary, backlog hoặc hệ thống điểm để che một màn chưa rõ. Mỗi yêu cầu mới phải trả lời được: chi tiết nào người chơi có thể thấy; phương án nào họ tự dựng; lần thử nào bác được một hiểu lầm; lần trở lại nào làm họ thấy việc đã làm còn được nhớ.
