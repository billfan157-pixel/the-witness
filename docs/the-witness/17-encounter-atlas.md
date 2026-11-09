# 17 • Atlas 25 tình huống đang chơi được

**Kết xuất từ luật runtime • Phụ lục 3.2 • 08/11/2026.** Chạy `node tools/build-depth-atlas.cjs` khi sửa catalog. Đây là tài liệu triển khai: tên biến là mã dữ liệu, không cần đưa lên giao diện người chơi. Tất cả bố cục và cơ chế là [H]; các nguồn Sxx chỉ giới hạn dữ kiện và cách chuyển thể.

25 tình huống gồm 13 bàn ở 12 chương đời thường, 8 bàn ở 5 Legends và 4 tương tác trong Veil. Các biến thể Q07 và phong bì theo phạm vi dùng dữ liệu hiện tại của chiến dịch. Bản mẫu hướng dẫn không phải đáp án duy nhất ở những màn có thể đổi thứ tự, đổi người hoặc đổi tuyến.

## Danh mục nhanh

| ID | Loại thao tác | Tên |
| --- | --- | --- |
| Q01.LOAD | Thao tác có tiền đề | Gánh nào đang giữ gánh nào? |
| Q02.PALIMPSEST | Ghép nguồn và giữ mức kết luận | Một trang sửa nói được đến đâu? |
| Q03.TRACK | Đọc tuyến có kết nối | Đường xe trước cổng kho |
| Q04.NIGHTSHIFT | Phân người / vật theo giới hạn | Ca cuối trước cửa kho |
| Q05.RECONCILE | Đối chiếu nhiều khoản | Bốn bao nằm ở dòng nào? |
| Q06.LINEAGE | Ghép nguồn và giữ mức kết luận | Ba tờ giấy, mấy nguồn gốc? |
| Q07.PROMISE | Phân người / vật theo giới hạn | Một lời hứa có người nhận |
| Q08.BANK | Đọc tuyến có kết nối | Đọc bờ trước khi bước xuống |
| Q08.RESCUE | Thao tác có tiền đề | Một nhịp kéo có ba đầu |
| Q09.READBACK | Chia nội dung theo nơi nhận | Đọc lại đúng nơi nhận |
| Q10.RESPONSIBILITY | Ghép nguồn và giữ mức kết luận | Hai phần trách nhiệm trên một bàn |
| Q11.SUPPLIES | Phân người / vật theo giới hạn | Bữa hôm nay và người lên đường |
| Q12.RELEASE | Chia nội dung theo nơi nhận | Bản sẽ tới tay người nào? |
| L01.AXLE | Thao tác có tiền đề | Xe cuối đoàn trong gió |
| L01.REARGUARD | Phân người / vật theo giới hạn | Những đốm đèn nối khóa đuôi |
| L02.ACOUSTICS | Đọc tuyến có kết nối | Đường êm trong lòng hang |
| L02.RESTRAINT | Phân người / vật theo giới hạn | Giữ một khoảng lùi |
| L03.CLOTH | Thao tác có tiền đề | Vải mềm giữa dây và vai |
| L04.NET | Thao tác có tiền đề | Lưới chưa thả, dây đã phải rõ |
| L04.LANDING | Phân người / vật theo giới hạn | Ba việc bên mạn thuyền |
| L05.REMAIN | Phân người / vật theo giới hạn | Đứng lại trong nhà giam |
| V01.PAGES | Sắp đặt mở, không chấm phản tư | Những trang chưa mang tên |
| V02.BALANCE | Phân người / vật theo giới hạn | Những nhịp cầu chia tải |
| V03.STRINGS | Sắp đặt mở, không chấm phản tư | Bàn tay đang giữ dây |
| V04.TABLE | Sắp đặt mở, không chấm phản tư | Một bàn còn chỗ trống |


Bản 0.5.0 đưa các luật này vào thao tác trực tiếp tại hiện trường, giữ bảng đối chiếu thay thế. Sáu phần việc quan hệ và 44 chi tiết 3D được ghi riêng ở [20 • Thực thi từng cảnh](20-scene-implementation.md) và [hợp đồng dàn dựng](craft-contract.json).

## Q01.LOAD • Gánh nào đang giữ gánh nào?

**Chủ cảnh:** Q01 · **Bước thay thế:** brace · **Loại:** Thao tác có tiền đề · **Luật:** revision 1.

Natan muốn thay chốt xe. Cần tạo một đường chịu lực mới trước khi tháo chốt cũ; dây chằng và phần hàng phía trên đều có vai trò riêng.

**Câu hỏi trải nghiệm:** Vì sao không được rút chốt đang nứt ngay?

**Hiểu lầm màn phải cho phép kiểm:** Tưởng rằng vật hỏng luôn phải được bỏ trước.

**Dấu cần đọc:** Vết xước bánh, hai vò trên cùng và chốt còn chịu tải.

**Lời mở đang hiển thị:** Natan — “Con nhìn chốt nứt trước rồi hãy nhìn phần trên xe. Chú vẫn đang nghe tiếng trục chịu tải.”

| Dấu / nguồn | Nội dung |
| --- | --- |
| Vết xước dưới bánh | Bánh còn có thể trôi theo dốc. |
| Vò nước ở tầng trên | Hai vò làm xe nghiêng về bên chưa có người đỡ. |
| Chốt đã nứt | Chốt vẫn đang chịu tải, chưa được rút. |


| Thao tác | Điều quan sát / công việc | Tiền đề |
| --- | --- | --- |
| Chèn bánh xe | Bánh không còn trôi khi chuyển tải. | Có thể chuẩn bị ngay |
| Hạ hai vò trên cùng | Hạ trọng tâm, cần bánh đã được chèn. | Chèn bánh xe |
| Đặt đòn kê dưới trục | Đòn kê nhận tải sau khi đã hạ hai vò. | Hạ hai vò trên cùng |
| Giữ dây chằng sang cọc | Dây ngăn xe nghiêng; có thể làm trước hoặc sau khi kê. | Chèn bánh xe |
| Thử tải bằng một nhịp ngắn | Chỉ thử khi cả đòn kê và dây chằng đã sẵn sàng. | Đặt đòn kê dưới trục; Giữ dây chằng sang cọc |
| Tháo chốt cũ | Chỉ tháo sau khi đường chịu lực mới đã qua thử. | Thử tải bằng một nhịp ngắn |


### Điều kiện và phản hồi

- Thực hiện đủ sáu thao tác; quan hệ chịu tải quyết định thứ tự.
- Kê trục và chằng dây có thể đổi thứ tự sau khi đã đáp ứng điều kiện.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Theo đường tải từ vò nước xuống trục và bánh.  
**Gợi ý 2:** Chèn bánh trước; thử tải sau cả kê và chằng.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Chốt cũ nằm trên bàn; xe còn đứng nhờ đường chịu lực bạn đã kiểm. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q04: Titus nhận ra cách bạn thử tải trước khi tháo chốt, rồi nhờ bạn kiểm cửa kho theo cùng nguyên tắc.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S26; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q02.PALIMPSEST • Một trang sửa nói được đến đâu?

**Chủ cảnh:** Q02 · **Bước thay thế:** patch · **Loại:** Ghép nguồn và giữ mức kết luận · **Luật:** revision 1.

Đặt các dấu quan sát cạnh nhận định. Một trang ghi B06 bị sửa chưa tự nói điều gì về lô G17.

**Câu hỏi trải nghiệm:** Trang bị sửa có cho biết ai sửa và lô nào bị ảnh hưởng?

**Hiểu lầm màn phải cho phép kiểm:** Gộp can thiệp vật lý, tác giả và trách nhiệm thành một nhận định.

**Dấu cần đọc:** Thớ giấy, nét mực và mã B06; mã không đổi thành G17.

**Lời mở đang hiển thị:** Miriam — “Tôi muốn giữ điều mình thực sự nhìn thấy, kể cả khi nó chưa giúp ta chỉ được một cái tên.”

| Thẻ | Nội dung | Dòng thông tin |
| --- | --- | --- |
| Thớ giấy bị bóc | Mé sợi dựng dưới lớp dán. | B06 |
| Nét mực chồng | Nét mới đè phần ghi lượng cũ. | B06 |
| Bản chép cùng trang | Sao lại chữ trên B06, không có người chép chứng kiến lúc sửa. | B06 |
| Vải bọc phổ biến | Nhiều người ở bến dùng cùng loại vải. | cloth |


| Nhận định | Mức kết luận | Lý do và giới hạn |
| --- | --- | --- |
| B06 có dấu can thiệp sau khi ghi. | Có nguồn đúng phạm vi | Hai dấu vật lý trên trang cùng củng cố việc trang bị sửa; không xác định người sửa. |
| Hanan là người trực tiếp sửa trang. | Chưa đủ căn cứ | Chưa có dấu quan sát nào gắn bàn tay một người với lần sửa. |
| Chỗ sửa này giải trình đủ hàng G17. | Chưa đủ căn cứ | B06 và G17 là hai lượt khác nhau. Không ghép mã chỉ vì cùng nằm trong kho. |


### Điều kiện và phản hồi

- Mỗi nhận định nhận tối đa hai dấu.
- “Chưa đủ căn cứ” cũng là một kết luận có giá trị; bản chép không thành nguồn độc lập.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Xem mã lượt trước khi đọc chữ sửa.  
**Gợi ý 2:** Chỉ nhận định về dấu sửa có đủ hai dấu vật lý; hai nhận định còn lại vẫn mở.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Bạn lưu dấu can thiệp trên B06 và giữ hai câu hỏi còn mở. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q06: bản sao chỉ giữ nội dung một nguồn; không nhân đôi số người đã thấy sự việc.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S23, S26; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q03.TRACK • Đường xe trước cổng kho

**Chủ cảnh:** Q03 · **Bước thay thế:** trace · **Loại:** Đọc tuyến có kết nối · **Luật:** revision 1.

Tìm đường xe có thể qua, ghé nơi đổi dây và chỗ nhận hàng. Vệt bánh chỉ cho phép dựng tuyến, chưa chỉ tên người chuyển.

**Câu hỏi trải nghiệm:** Xe có thể đi qua những điểm nào trước hiên nhận?

**Hiểu lầm màn phải cho phép kiểm:** Đường ngắn nhất hoặc nút dây giống nhau tự chỉ đúng thủ phạm.

**Dấu cần đọc:** Bề ngang bậc, chỗ đổi dây và dấu đặt bao ở hiên.

**Lời mở đang hiển thị:** Amon — “Tôi nhớ nơi xe dừng để đổi dây. Còn ai nhận bao sau đó, bạn phải hỏi người ở đầu kia.”

| Mốc | Dấu đọc được | Giới hạn |
| --- | --- | --- |
| Sân xuất | Vệt hai bánh bắt đầu tại mép sân. | Có thể khảo sát |
| Bậc hẹp | Bậc cao, không đủ bề ngang cho xe hai bánh. | Không đáp ứng điều kiện tuyến |
| Giếng | Nút dây mới nằm cạnh chỗ dừng lấy nước. | Có thể khảo sát |
| Ven tường | Nền cứng, lối vòng đủ cho xe. | Có thể khảo sát |
| Chỗ đổi dây | Sợi dây cũ có dấu tì cùng hướng với vệt bánh. | Có thể khảo sát |
| Hiên nhận | Có dấu đặt bao; lượng nhận phải hỏi riêng. | Có thể khảo sát |


| Từ | Đến | Tiếng dội | Lộ sáng |
| --- | --- | --- | --- |
| Sân xuất | Bậc hẹp | 0 | 0 |
| Bậc hẹp | Hiên nhận | 0 | 0 |
| Sân xuất | Giếng | 0 | 0 |
| Sân xuất | Ven tường | 0 | 0 |
| Giếng | Chỗ đổi dây | 0 | 0 |
| Ven tường | Chỗ đổi dây | 0 | 0 |
| Chỗ đổi dây | Hiên nhận | 0 | 0 |


### Điều kiện và phản hồi

- Tuyến phải liền mạch từ sân xuất đến hiên nhận.
- Xe không đi qua bậc hẹp; cần kiểm điểm đổi dây.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Lối ngắn trên bản đồ có thể không dành cho xe.  
**Gợi ý 2:** Cả giếng và ven tường đều tới được chỗ đổi dây.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Tuyến vận chuyển có thể kiểm tiếp đã được dựng, chưa có tên thủ phạm. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q05: hỏi người ở hiên về lượng thực nhận thay vì suy tên từ nút dây.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S26; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q04.NIGHTSHIFT • Ca cuối trước cửa kho

**Chủ cảnh:** Q04 · **Bước thay thế:** people · **Loại:** Phân người / vật theo giới hạn · **Luật:** revision 1.

Mỗi người chỉ nhận một vị trí. Người đi cuối cần đèn và người nhận; cửa kho cần cả tay nghề lẫn người giữ tải.

**Câu hỏi trải nghiệm:** Ai giữ cửa, ai đi cuối, ai đứng nhận khi đóng ca?

**Hiểu lầm màn phải cho phép kiểm:** Phân thật nhiều việc cho cùng một người chăm chỉ.

**Dấu cần đọc:** Sổ ca, đèn ở chỗ khuất và tải cửa chưa được giữ.

**Lời mở đang hiển thị:** Mattai — “Khi tôi khép sổ ca, tôi cần biết ai còn ở ngoài và ai sẽ đứng nhận họ.”

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Titus | Biết kiểm then; nhận việc ở cửa hoặc hỗ trợ đoàn. | Cửa kho; Nhóm cuối |
| Miriam | Biết các hộ đi cuối, có thể gọi đáp hoặc nhận người. | Nhóm cuối; Điểm nhận |
| Mattai | Giữ sổ ca, có thể kiểm cửa hoặc gọi đáp. | Cửa kho; Nhóm cuối |
| Rina | Có bữa đang chờ, chỉ nhận ở đầu bàn giao. | Điểm nhận |
| Bạn | Có thể giữ tải cửa hoặc đi cùng khóa đuôi. | Cửa kho; Nhóm cuối |
| Đèn chắn gió | Phải theo nhóm cuối, không được để trong kho. | Nhóm cuối |


| Điểm nhận | Điều kiện |
| --- | --- |
| Cửa kho | Hai người: một kiểm then, một giữ tải. |
| Nhóm cuối | Có người gọi đáp và đèn. |
| Điểm nhận | Rina giữ bữa, có thể có thêm người. |


### Điều kiện và phản hồi

- Không giao hai vị trí cùng lúc cho một người.
- Cửa có hai người với hai vai; nhóm cuối không bị mất đèn.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Titus và bạn đủ hai vai ở cửa.  
**Gợi ý 2:** Miriam và đèn đi cuối; Rina chờ ở điểm nhận; Mattai có thể theo nhóm cuối.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Ca cuối có người gọi đáp, giữ cửa và nhận bàn giao; không ai chỉ tồn tại như một con số. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q11: lần phân vai cuối giữ lại nguyên tắc mỗi người nhận một việc vừa sức.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S26, S29; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q05.RECONCILE • Bốn bao nằm ở dòng nào?

**Chủ cảnh:** Q05 · **Bước thay thế:** audit, check · **Loại:** Đối chiếu nhiều khoản · **Luật:** revision 1.

Ghép ba ghi nhận của G17 vào sổ đối chiếu. Đừng gộp lượng xuất, lượng nhận và lượng hỏng thành một khoản thiếu duy nhất.

**Câu hỏi trải nghiệm:** Khoản nào đã tới, khoản nào hỏng, khoản nào cần tìm đường?

**Hiểu lầm màn phải cho phép kiểm:** 24−18 thành sáu bao bị lấy; bỏ hai bao hỏng có ghi.

**Dấu cần đọc:** Ba nguồn đếm có phạm vi khác nhau.

**Lời mở đang hiển thị:** Người nhận ở Galilê — “Tôi đếm thứ đã tới tay mình. Đừng bắt con số ấy nói thay chuyện xảy ra ở dọc đường.”

| Dấu / nguồn | Nội dung |
| --- | --- |
| Sổ xuất Xêdarê | G17 xuất 24 bao. |
| Người nhận Galilê | Trực tiếp nhận 18 bao của G17. |
| Biên nhận hỏng | Hai bao G17 hỏng, ghi riêng; không nằm trong 18 bao đã nhận. |


| Khoản | Lượng đúng theo nguồn hư cấu |
| --- | --- |
| Đã nhận tại Galilê | 18 |
| Hỏng có ghi riêng | 2 |
| Chưa giải trình đường nhận | 4 |


### Điều kiện và phản hồi

- Ba khoản cộng lại phải bằng 24.
- Số chưa giải trình chưa phải bằng chứng về ý định của ai.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Tách hai bao hỏng khỏi 18 bao người nhận đã đếm.  
**Gợi ý 2:** 24 trừ 18 trừ 2 để lại một khoản cần tìm đường.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Sổ giữ ba khoản riêng: 18 nhận, 2 hỏng, 4 cần đối chiếu tiếp. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q10: chữ ký nhận trước của Haddai không tự giải trình bốn bao này.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S23; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q06.LINEAGE • Ba tờ giấy, mấy nguồn gốc?

**Chủ cảnh:** Q06 · **Bước thay thế:** custody, copy, counter · **Loại:** Ghép nguồn và giữ mức kết luận · **Luật:** revision 1.

So hồ sơ đang giữ với một lời xác nhận trực tiếp về sân phụ. Tìm nguồn cho từng nhận định mà không biến bản chép thành người chứng kiến.

**Câu hỏi trải nghiệm:** Có bao nhiêu đường thông tin gốc trong những giấy đang cầm?

**Hiểu lầm màn phải cho phép kiểm:** Nhiều bản chép đồng nghĩa nhiều lần đếm độc lập.

**Dấu cần đọc:** Dòng dẫn từ bản chép về sổ vận chuyển và thẻ sân phụ.

**Lời mở đang hiển thị:** Damar — “Tôi từng nghĩ giữ được vật gốc là xong. Lea hỏi một câu khó hơn: vật ấy thực sự cho ta biết điều gì?”

| Thẻ | Nội dung | Dòng thông tin |
| --- | --- | --- |
| E04 · Sổ vận chuyển | G17 xuất 24; hai bao hỏng ghi riêng. | dispatch |
| Bản chép đang lập | Chép từ E04; không quan sát việc nhận. | dispatch |
| Lời nhớ số đã đọc | Người nói đã đọc E04, không tự đếm. | dispatch |
| E06 · Thẻ sân phụ | Ghi riêng bốn bao được đặt ở sân phụ. | sideyard |


| Nhận định | Mức kết luận | Lý do và giới hạn |
| --- | --- | --- |
| G17 được ghi xuất 24 bao. | Có nguồn đúng phạm vi | Có thể dùng bản ghi hoặc dẫn xuất đúng phạm vi để nói nội dung sổ. |
| E04 và bản chép là hai lần đếm độc lập. | Chưa đủ căn cứ | Bản chép bắt nguồn từ E04, không có lần đếm mới. |
| Có ghi nhận riêng về bốn bao ở sân phụ. | Có nguồn đúng phạm vi | Nguồn sân phụ có phạm vi riêng; chưa tự gắn người chỉ đạo. |


### Điều kiện và phản hồi

- Một nhận định chỉ dùng nguồn có trực tiếp hỗ trợ nội dung ấy.
- Không thêm thủ phạm hoặc ý định vào điều nguồn chưa kể.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Nhìn đường đi của thông tin, đừng đếm số tờ giấy.  
**Gợi ý 2:** E04, bản chép và lời nhớ cùng gốc; E06 nói riêng về sân phụ.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Bản gốc, bản chép và lời nhớ được giữ đúng quan hệ; ghi nhận sân phụ đứng riêng. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q11: sổ ca E10 có giá trị vì trực tiếp ghi việc riêng, không vì thêm một tờ giấy.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S23, S26; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q07.PROMISE • Một lời hứa có người nhận

**Chủ cảnh:** Q07 · **Bước thay thế:** conversation, new-promise, handoff · **Loại:** Phân người / vật theo giới hạn · **Luật:** revision 1.

Sela chỉ rảnh một cuộc nói ngắn, Miriam cần giữ bữa đã nhận. Xếp lại người và vật để lời hứa có thể thực hiện mà không bắt một người ôm hết việc.

**Câu hỏi trải nghiệm:** Người nào thật sự có mặt khi giữ lời, và ai nhận phần bữa?

**Hiểu lầm màn phải cho phép kiểm:** Chọn một câu hứa rồi coi cuộc bàn giao đã xảy ra.

**Dấu cần đọc:** Phạm vi Sela nhận, việc bếp và người chuyển lời đã tự nguyện.

**Lời mở đang hiển thị:** Sela — “Tôi có thể nhận một cuộc nói ngắn. Phần việc còn lại cần có người đứng nhận, đừng hứa thay tôi.”

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Bạn | Có thể cùng nói hoặc giữ bữa thay. | Chỗ nói yên; Bữa đã nhận |
| Miriam | Đã nhận giữ bữa; chỉ đổi khi bạn đứng nhận thay. | Chỗ nói yên; Bữa đã nhận |
| Sela | Đồng ý một cuộc nói ở chỗ yên; không nhận việc khác. | Chỗ nói yên |
| Rina | Giữ bếp trong bữa. | Bữa đã nhận |
| Mảnh ghi phạm vi | Ghi điều đã hẹn, không phải lời hứa thay người nhận. | Chỗ nói yên |


| Điểm nhận | Điều kiện |
| --- | --- |
| Chỗ nói yên | Sela, một người nghe và mảnh phạm vi. |
| Bữa đã nhận | Rina và một người nhận phần Miriam để lại. |


### Điều kiện và phản hồi

- Có thể tự đi nói hoặc đổi việc với Miriam khi người nhận đồng ý.
- Mỗi người một vị trí, bữa chung vẫn có người giữ.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Cả cuộc nói và bữa đều cần một người biết lắng nghe.  
**Gợi ý 2:** Bạn và Miriam có thể đổi chỗ; Sela cùng mảnh phạm vi ở chỗ nói, Rina ở bếp.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Có người đứng nhận việc, có chỗ nói được đồng ý, và bữa chung vẫn tiếp tục. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q12: giữ lời bằng cách bàn giao phần việc, không chỉ đọc một câu hứa.

**Ba biến thể được thực thi:** `personally_keep` giữ Miriam và Sela ở chỗ nói, bạn cùng Rina ở bữa; `renegotiate` cho bạn và Miriam đổi vai khi đủ hai đầu; `delegated` thêm người chuyển lời đã nhận ở bước trước, người ấy ở bàn giao với Sela còn Miriam, bạn và Rina giữ bữa. Không ghi nhánh chuyển lời thành cuộc nói trực tiếp của hai chị em.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S23, S29; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q08.BANK • Đọc bờ trước khi bước xuống

**Chủ cảnh:** Q08 · **Bước thay thế:** read-bank · **Loại:** Đọc tuyến có kết nối · **Luật:** revision 1.

Khảo sát lối tới chỗ Amon đứng và đường về nơi có người nhận. Nền gần nước bị xói; tuyến vòng dài hơn nhưng có chỗ đứng và neo.

**Câu hỏi trải nghiệm:** Đường tới người gặp nạn có đường nhận và nhịp phối hợp chưa?

**Hiểu lầm màn phải cho phép kiểm:** Tới gần đồng nghĩa đã giúp; bắt đầu kéo trước mọi chuẩn bị.

**Dấu cần đọc:** Ván lệch, nền đứng, gốc neo và tiếng gọi đáp.

**Lời mở đang hiển thị:** Amon — “Tôi còn nghe được bạn. Hãy để người giữ dây và người nhận gọi đáp với nhau trước.”

| Mốc | Dấu đọc được | Giới hạn |
| --- | --- | --- |
| Bờ trên | Nền khô, nơi bắt đầu. | Có thể khảo sát |
| Ván lệch | Đầu ván đã rời gối kê. | Không đáp ứng điều kiện tuyến |
| Bờ rộng | Đủ chỗ cho người giữ dây. | Có thể khảo sát |
| Gốc neo | Gốc có thể kiểm phía nền khô. | Có thể khảo sát |
| Lối vòng | Dài hơn, vẫn nối nơi nhận. | Có thể khảo sát |
| Người nhận | Có người đứng nhận trước khi nhóm quay về. | Có thể khảo sát |
| Chỗ Amon | Đích khảo sát; việc cứu hộ được làm ở bước sau. | Có thể khảo sát |


| Từ | Đến | Tiếng dội | Lộ sáng |
| --- | --- | --- | --- |
| Bờ trên | Ván lệch | 0 | 0 |
| Ván lệch | Chỗ Amon | 0 | 0 |
| Bờ trên | Bờ rộng | 0 | 0 |
| Bờ rộng | Gốc neo | 0 | 0 |
| Gốc neo | Người nhận | 0 | 0 |
| Bờ rộng | Lối vòng | 0 | 0 |
| Lối vòng | Gốc neo | 0 | 0 |
| Người nhận | Chỗ Amon | 0 | 0 |


### Điều kiện và phản hồi

- Không dùng ván đã rời gối kê.
- Kiểm gốc neo và điểm nhận trước khi tới Amon.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Đọc chỗ có thể đứng, không chỉ khoảng cách tới người.  
**Gợi ý 2:** Bờ rộng nối gốc neo; từ đó qua người nhận rồi mới tới Amon.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Bạn biết đường neo, chỗ đứng và người nhận trước khi chọn phương án cứu hộ. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q08: kế hoạch cứu đã chuẩn bị vẫn cần neo, người hỗ trợ và bọc giấy ở ngoài cảnh.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S26; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q08.RESCUE • Một nhịp kéo có ba đầu

**Chủ cảnh:** Q08 · **Bước thay thế:** rescue · **Loại:** Thao tác có tiền đề · **Luật:** revision 1.

Thử phối hợp trước khi thực hiện kế hoạch đã chọn. Giấy và thương tích vẫn theo lựa chọn ngoài cảnh; thử sai trên bàn không làm ai bị nạn.

**Câu hỏi trải nghiệm:** Đường tới người gặp nạn có đường nhận và nhịp phối hợp chưa?

**Hiểu lầm màn phải cho phép kiểm:** Tới gần đồng nghĩa đã giúp; bắt đầu kéo trước mọi chuẩn bị.

**Dấu cần đọc:** Ván lệch, nền đứng, gốc neo và tiếng gọi đáp.

**Lời mở đang hiển thị:** Amon — “Tôi còn nghe được bạn. Hãy để người giữ dây và người nhận gọi đáp với nhau trước.”

| Thao tác | Điều quan sát / công việc | Tiền đề |
| --- | --- | --- |
| Kiểm người giữ neo | Phần neo đã kiểm phải có người trực tiếp giữ. | Có thể chuẩn bị ngay |
| Gọi đáp người nhận | Người nhận có thể chuẩn bị đồng thời với neo. | Có thể chuẩn bị ngay |
| Thống nhất một dấu gọi | Cần cả neo lẫn người nhận đã đáp. | Kiểm người giữ neo; Gọi đáp người nhận |
| Thu dây chùng vừa tay | Chỉ sau khi mọi đầu hiểu dấu gọi. | Thống nhất một dấu gọi |
| Đưa người qua từng nhịp | Theo nhịp đã thử, không giật dây. | Thu dây chùng vừa tay |
| Xác nhận người đã được nhận | Kết thúc sau bàn giao, không ở lúc bắt đầu kéo. | Đưa người qua từng nhịp |


### Điều kiện và phản hồi

- Neo và người nhận có thể chuẩn bị theo hai thứ tự.
- Phải thử nhịp chung trước khi chuyển người.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Đừng bắt đầu từ động tác kéo.  
**Gợi ý 2:** Hai đầu đáp → dấu gọi → thu chùng → chuyển người → bàn giao.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Bạn giữ được một nhịp có người đứng nhận ở cả hai đầu. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q12: bàn giao tới người thật, không kết thúc ở dấu trên bản đồ.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S26; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q09.READBACK • Đọc lại đúng nơi nhận

**Chủ cảnh:** Q09 · **Bước thay thế:** readback, mediate · **Loại:** Chia nội dung theo nơi nhận · **Luật:** revision 1.

Người cung cấp đã chọn phạm vi ở cuộc nói trước. Chuẩn bị bản đối chiếu để họ có thể kiểm lại mà không lộ dấu nhận diện ra sân.

**Câu hỏi trải nghiệm:** Một nội dung đúng được trao cho ai trong lần này?

**Hiểu lầm màn phải cho phép kiểm:** Xóa tên nhưng giữ địa chỉ hoặc mô tả nhận diện.

**Dấu cần đọc:** Phạm vi lời chứng đã chọn, nguồn E06 riêng và người giữ bản.

**Lời mở đang hiển thị:** Người giữ bản — “Bản này sẽ rời bàn của chúng ta. Bạn muốn người ở đầu kia có quyền đọc đến đâu?”

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Mã lô và lượng đã đối chiếu | Ghi nhận vật thể sân phụ; không phải lời nói của người vừa gặp. | Nhóm đối chiếu |
| Tên người cung cấp | Cần quyền dùng tên đúng đối tượng nghe. | Hồ sơ riêng; Chưa trao |
| Chỗ người thân đang ở | Không cần để đối chiếu hàng; không thuộc phạm vi công bố tên. | Hồ sơ riêng; Chưa trao |
| Dấu nhận diện có thể tìm lại người | Tên đã ẩn không làm mô tả nhận diện trở nên vô hại. | Hồ sơ riêng; Chưa trao |
| Nội dung lời chứng | Theo phạm vi đã được đồng ý; người từ chối vẫn được từ chối. | Nhóm đối chiếu; Chưa trao |
| Kết luận ý định từ lời đồn | Chưa có nguồn kiểm được. | Chưa trao |


| Điểm nhận | Điều kiện |
| --- | --- |
| Sân công khai | Ai ở sân cũng có thể nghe; không chứa địa chỉ. |
| Nhóm đối chiếu | Nhóm nhận bản có giới hạn, không phát tán. |
| Hồ sơ riêng | Giữ thông tin nhận diện riêng khỏi bản giao. |
| Chưa trao | Chưa có nguồn, chưa được phép hoặc tự chọn giữ lại. |


### Điều kiện và phản hồi

- Mỗi mảnh nội dung có một nơi nhận cụ thể.
- Dữ kiện được đối chiếu có thể công bố; dấu nhận diện phụ thuộc phạm vi người ấy đã đồng ý.
- Nội dung chưa có nguồn phải giữ lại, kể cả khi có lợi cho gia đình bạn.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Đọc phạm vi người nhận ở đầu mỗi phong bì.  
**Gợi ý 2:** Ẩn danh vẫn giữ mã lô và lượng; giữ riêng tên, chỗ ở và mô tả nhận diện khi chưa có phép công bố.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Bản giao giữ đủ nội dung được phép, còn thông tin riêng có nơi giữ cụ thể. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Lần nói sau vẫn cần hỏi lại phạm vi; một bản giao hôm nay không cho quyền dùng tên mãi mãi.

**Biến thể dữ liệu:** bảng trên minh họa hồ sơ đủ nguồn và consent `private_group`. Với từ chối hoặc chưa có E09, nội dung lời chứng phải ở “Chưa trao”. Chỉ công khai tên khi kế hoạch công khai, consent `public_named` tự nguyện và đã có bảo vệ. Chỗ ở và mô tả nhận diện luôn riêng/chưa trao. Với phân tán/đưa người đi, dữ kiện và phần cha tự nhận tới nhóm đối chiếu; không tự công khai. Thiếu E04/E05/E08 thì phần tương ứng giữ lại.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S23; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q10.RESPONSIBILITY • Hai phần trách nhiệm trên một bàn

**Chủ cảnh:** Q10 · **Bước thay thế:** compare · **Loại:** Ghép nguồn và giữ mức kết luận · **Luật:** revision 1.

Đặt lá thư của Haddai cạnh lượng nhận và sân phụ. Giữ điều bất lợi cho cha mà vẫn phân biệt những việc chưa được chứng minh.

**Câu hỏi trải nghiệm:** Việc cha tự nhận có giải thích được mọi khoản thiếu không?

**Hiểu lầm màn phải cho phép kiểm:** Minh oan tuyệt đối hoặc quy mọi việc về một chữ ký.

**Dấu cần đọc:** Lá thư, sổ tuyến, đầu nhận và thẻ sân phụ cùng nằm trên bàn.

**Lời mở đang hiển thị:** Lea — “Giữ cùng một thước đo cho cha mình là phần khó. Tôi sẽ ngồi đây đối chiếu cùng bạn.”

| Thẻ | Nội dung | Dòng thông tin |
| --- | --- | --- |
| E01 · Biên nhận gốc | Biên nhận có chữ ký Haddai xác thực theo phạm vi đã kiểm. | origin-sign |
| E08 · Thư Haddai | Tự nhận ký trước khi đếm đủ. | haddai |
| E05 · Lượng nhận | 18 bao nhận tại Galilê. | arrival |
| E06 · Sân phụ | Có ghi nhận riêng về bốn bao. | sideyard |
| E04 · Sổ vận chuyển | 24 bao xuất G17, hai bao hỏng ghi riêng. | dispatch |


| Nhận định | Mức kết luận | Lý do và giới hạn |
| --- | --- | --- |
| Haddai có trách nhiệm vì ký trước khi đếm. | Có nguồn đúng phạm vi | Biên nhận gốc xác nhận chữ ký và thư tự nhận việc ký trước; thiện ý không xóa việc đã làm. |
| Lượng chưa tới Galilê cần tách khỏi hai bao hỏng. | Có nguồn đúng phạm vi | Phải đối chiếu hai đầu để thấy khoản còn lại. |
| Chỉ lá thư đủ chứng minh Haddai chủ ý chuyển bốn bao. | Chưa đủ căn cứ | Tự nhận ký sai không tự chứng minh ý định chuyển hàng. |


### Điều kiện và phản hồi

- Mỗi nhận định nhận tối đa hai nguồn.
- Không bỏ lá thư chỉ vì bất lợi, cũng không suy thêm ý định từ nó.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Tách hành động đã tự nhận khỏi nguyên nhân của phần hàng khác.  
**Gợi ý 2:** Biên nhận gốc + thư → ký trước; sổ tuyến + lượng nhận → khoản cần tách; ý định vẫn mở.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Chữ ký sai được giữ nguyên; phần chuyển hàng vẫn cần đúng nguồn và đúng người chịu trách nhiệm. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q12: bạn có thể nhận lỗi của cha mà không nhận thay mọi cáo buộc.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S22, S23; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q11.SUPPLIES • Bữa hôm nay và người lên đường

**Chủ cảnh:** Q11 · **Bước thay thế:** supplies · **Loại:** Phân người / vật theo giới hạn · **Luật:** revision 1.

Hai phần đã có người chờ thuộc bữa hiện tại. Bạn còn 3 phần bữa dự trữ: dành 1 phần cho người lên đường và ghi đúng 2 phần còn lại cho ca sau. Đèn đi đường, bộ đồ sửa ở lại.

**Câu hỏi trải nghiệm:** Người đi có gì, người đang chờ và ca sau còn gì?

**Hiểu lầm màn phải cho phép kiểm:** Xem bữa người khác đã chờ là kho tài nguyên miễn phí.

**Dấu cần đọc:** Hai phần đã hẹn, hai phần dự trữ, đèn và bộ đồ sửa.

**Lời mở đang hiển thị:** Rina — “Hai phần bữa kia đã có người chờ. Bạn chia phần dự trữ, nhớ để ca mai còn mở được bếp.”

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Phần bữa đã hẹn 1 | Có người đang chờ. | Bữa đang chờ |
| Phần bữa đã hẹn 2 | Có người đang chờ. | Bữa đang chờ |
| Phần dự trữ 1 | Có thể chia cho chuyến đi hoặc ca sau. | Người lên đường; Ca sau |
| Phần dự trữ còn lại (2) | Gộp 2 phần còn lại, phải giữ đúng lượng. | Người lên đường; Ca sau |
| Đèn chắn gió | Theo người đi lúc tối. | Người lên đường |
| Bộ đồ sửa | Ở lại để mở bếp ca sau. | Ca sau |


| Điểm nhận | Điều kiện |
| --- | --- |
| Bữa đang chờ | Giữ hai phần đã nhận. |
| Người lên đường | Một phần dự trữ và đèn. |
| Ca sau | 2 phần dự trữ và bộ đồ sửa. |


### Điều kiện và phản hồi

- Hai phần đang có người chờ không nằm trong kho dự trữ để chia lại.
- Giữ đúng lượng thực có; chuyển một phần dự trữ khi còn, không tự thêm bữa.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Đồ dùng không phải phần bữa: đèn đi đường, bộ đồ ở ca sau.  
**Gợi ý 2:** Giữ hai phần đã hẹn tại bàn; chia đôi hai phần dự trữ cho đường đi và ca sau.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Hai phần đã hẹn được giữ; một phần dự trữ cùng đèn theo người đi, ca sau còn 2 phần và bộ đồ sửa. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Q12: kế hoạch còn người tiếp tục chăm bữa sau cuộc nói.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S23, S29; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## Q12.RELEASE • Bản sẽ tới tay người nào?

**Chủ cảnh:** Q12 · **Bước thay thế:** speak, separate, send-copy · **Loại:** Chia nội dung theo nơi nhận · **Luật:** revision 1.

Trước khi trao bản cuối, xếp mỗi mảnh nội dung vào đúng nơi nhận. Phương án công khai, phân tán hay đưa người đi có phạm vi khác nhau.

**Câu hỏi trải nghiệm:** Bản cuối thực sự tới người nhận nào, giữ đúng phần nào?

**Hiểu lầm màn phải cho phép kiểm:** Dùng chung một bản phát hành cho cả ba kế hoạch.

**Dấu cần đọc:** Phương án cuối, consent hiện tại và chứng cứ thực có trong bản lưu.

**Lời mở đang hiển thị:** Natan — “Con cứ đọc điều mình đã kiểm. Những người đang ngồi đây không cần con nói thay phần họ chưa trao.”

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Mã lô và lượng đã đối chiếu | Chỉ phần G17 có nguồn trong túi hồ sơ. | Sân công khai |
| Tên người cung cấp | Cần quyền dùng tên đúng đối tượng nghe. | Hồ sơ riêng; Chưa trao |
| Chỗ người thân đang ở | Không cần để đối chiếu hàng; không thuộc phạm vi công bố tên. | Hồ sơ riêng; Chưa trao |
| Dấu nhận diện có thể tìm lại người | Tên đã ẩn không làm mô tả nhận diện trở nên vô hại. | Hồ sơ riêng; Chưa trao |
| Nội dung lời chứng | Theo phạm vi đã được đồng ý; người từ chối vẫn được từ chối. | Nhóm đối chiếu; Chưa trao |
| Kết luận ý định từ lời đồn | Chưa có nguồn kiểm được. | Chưa trao |
| Phần Haddai tự nhận ký trước | Giữ phần bất lợi khi có lá thư, không sửa thành lời minh oan. | Sân công khai |


| Điểm nhận | Điều kiện |
| --- | --- |
| Sân công khai | Ai ở sân cũng có thể nghe; không chứa địa chỉ. |
| Nhóm đối chiếu | Nhóm nhận bản có giới hạn, không phát tán. |
| Hồ sơ riêng | Giữ thông tin nhận diện riêng khỏi bản giao. |
| Chưa trao | Chưa có nguồn, chưa được phép hoặc tự chọn giữ lại. |


### Điều kiện và phản hồi

- Mỗi mảnh nội dung có một nơi nhận cụ thể.
- Dữ kiện được đối chiếu có thể công bố; dấu nhận diện phụ thuộc phạm vi người ấy đã đồng ý.
- Nội dung chưa có nguồn phải giữ lại, kể cả khi có lợi cho gia đình bạn.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Đọc phạm vi người nhận ở đầu mỗi phong bì.  
**Gợi ý 2:** Ẩn danh vẫn giữ mã lô và lượng; giữ riêng tên, chỗ ở và mô tả nhận diện khi chưa có phép công bố.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Bản giao giữ đủ nội dung được phép, còn thông tin riêng có nơi giữ cụ thể. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Chi tiết trở lại / ghi chú sổ:** Lần nói sau vẫn cần hỏi lại phạm vi; một bản giao hôm nay không cho quyền dùng tên mãi mãi.

**Biến thể dữ liệu:** bảng trên minh họa hồ sơ đủ nguồn và consent `private_group`. Với từ chối hoặc chưa có E09, nội dung lời chứng phải ở “Chưa trao”. Chỉ công khai tên khi kế hoạch công khai, consent `public_named` tự nguyện và đã có bảo vệ. Chỗ ở và mô tả nhận diện luôn riêng/chưa trao. Với phân tán/đưa người đi, dữ kiện và phần cha tự nhận tới nhóm đối chiếu; không tự công khai. Thiếu E04/E05/E08 thì phần tương ứng giữ lại.

**Ranh giới:** Chỉ thao tác tại bước hiện tại mới ghi hoàn tất. Các cổng consent, route và hệ quả nền vẫn được model chiến dịch kiểm.

**Tham chiếu:** S23; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## L01.AXLE • Xe cuối đoàn trong gió

**Chủ cảnh:** L01 · **Bước thay thế:** clear · **Loại:** Thao tác có tiền đề · **Luật:** revision 1.

Bạn giúp một nhóm hư cấu chuẩn bị xe. Công việc chỉ giữ người và vật đời thường; con đường qua biển thuộc hành động Thiên Chúa trong Xh 14.

**Câu hỏi trải nghiệm:** Giữ nhóm cuối bằng chuẩn bị cụ thể thế nào?

**Hiểu lầm màn phải cho phép kiểm:** Tưởng làm đúng thao tác thì biển mới mở.

**Dấu cần đọc:** Tải xe, đàn vật, người nhận và tầm nhìn giữa hai đầu.

**Lời mở đang hiển thị:** Người cùng khóa đuôi · [H] — “Tôi sẽ đi chậm cùng xe. Hãy để lại một đốm sáng mà người đi thấp nhất vẫn nhìn thấy.”

| Thao tác | Điều quan sát / công việc | Tiền đề |
| --- | --- | --- |
| Đưa đàn vật khỏi phía nêm | Tránh chen vào nơi kê trục. | Có thể chuẩn bị ngay |
| Chuyển vò sang người nhận | Người nhận đứng trên nền cứng. | Có thể chuẩn bị ngay |
| Đưa đòn kê vào nền chắc | Sau khi đàn vật đã lùi và vò đã hạ. | Đưa đàn vật khỏi phía nêm; Chuyển vò sang người nhận |
| Phân người giữ xe | Có thể chuẩn bị song song với việc hạ vò. | Có thể chuẩn bị ngay |
| Thử tải trên đòn kê | Cần đòn kê và người giữ. | Đưa đòn kê vào nền chắc; Phân người giữ xe |
| Chuyển xe về hàng cuối | Chỉ sau khi thử xong. | Thử tải trên đòn kê |


### Điều kiện và phản hồi

- Có nhiều thứ tự chuẩn bị hợp lệ; cả người nhận và người giữ đều phải sẵn sàng.
- Không thao tác nào điều khiển gió, nước hoặc kết cục trình thuật.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Việc có thể chuẩn bị song song thì không phải học thuộc một chuỗi duy nhất.  
**Gợi ý 2:** Dọn đàn vật + hạ vò → kê; kê + người giữ → thử → chuyển xe.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Xe hư cấu được chuẩn bị để theo đoàn; nhịp nguồn Kinh Thánh tiếp tục nguyên vẹn. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Chỉ ghi tiến độ và phương án bên trong Legend; không thêm chứng cứ, vật phẩm, nguồn lực hoặc đổi kết cục nguồn.

**Tham chiếu:** S05, S26; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## L01.REARGUARD • Những đốm đèn nối khóa đuôi

**Chủ cảnh:** L01 · **Bước thay thế:** gather · **Loại:** Phân người / vật theo giới hạn · **Luật:** revision 1.

Đội cuối có một người nghe kém và một xe đi chậm. Phân người nhìn mốc, người giữ đèn và người đón thay vì chỉ đếm số người đã qua.

**Câu hỏi trải nghiệm:** Giữ nhóm cuối bằng chuẩn bị cụ thể thế nào?

**Hiểu lầm màn phải cho phép kiểm:** Tưởng làm đúng thao tác thì biển mới mở.

**Dấu cần đọc:** Tải xe, đàn vật, người nhận và tầm nhìn giữa hai đầu.

**Lời mở đang hiển thị:** Người cùng khóa đuôi · [H] — “Tôi sẽ đi chậm cùng xe. Hãy để lại một đốm sáng mà người đi thấp nhất vẫn nhìn thấy.”

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Gia đình đi chậm | Cần người đi kèm tại khóa đuôi. | Khóa đuôi |
| Người dẫn | Có thể đi kèm hoặc đứng đón. | Khóa đuôi; Điểm hội |
| Người phụ | Có thể đi kèm hoặc đứng đón. | Khóa đuôi; Điểm hội |
| Đèn che gió | Giữ tầm nhìn cho người nghe kém. | Khóa đuôi |
| Người đón | Giữ chỗ ở đầu bên kia. | Điểm hội |


| Điểm nhận | Điều kiện |
| --- | --- |
| Khóa đuôi | Gia đình + một người kèm + đèn. |
| Điểm hội | Người đón và một người nối tín hiệu. |


### Điều kiện và phản hồi

- Đổi người dẫn và người phụ được, nhưng hai đầu đều phải có người nối tín hiệu.
- Sơ đồ các hộ và vị trí đèn là [H], không là chi tiết được bản văn xác nhận.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Đặt đèn cạnh người cần nhìn thay cho nghe.  
**Gợi ý 2:** Gia đình và đèn ở khóa đuôi; chia hai người dẫn cho hai đầu.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Hai đầu còn nhìn thấy tín hiệu của nhau; không phát sinh vật phẩm hoặc chứng cứ đời thường. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Chỉ ghi tiến độ và phương án bên trong Legend; không thêm chứng cứ, vật phẩm, nguồn lực hoặc đổi kết cục nguồn.

**Tham chiếu:** S05, S17; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## L02.ACOUSTICS • Đường êm trong lòng hang

**Chủ cảnh:** L02 · **Bước thay thế:** approach · **Loại:** Đọc tuyến có kết nối · **Luật:** revision 1.

Đọc sơ đồ tiếng dội và luồng sáng. Chọn một đường lui cho toán hư cấu mà không tới gần Saun hoặc thay quyết định của Đavít.

**Câu hỏi trải nghiệm:** Đọc tiếng và ánh sáng để có khoảng lùi ra sao?

**Hiểu lầm màn phải cho phép kiểm:** Chọn tối nhất hoặc gần nhất mà bỏ âm dội và mốc quay về.

**Dấu cần đọc:** Sỏi, vách nhẵn, gờ cao, vệt nắng và dây mốc.

**Lời mở đang hiển thị:** Người cùng toán · [H] — “Tôi không muốn tiếng bước mình kéo cả nhóm về phía cửa. Cho tôi một mốc để quay lại.”

| Mốc | Dấu đọc được | Giới hạn |
| --- | --- | --- |
| Góc toán | Bắt đầu trong hốc sâu. | Có thể khảo sát |
| Sỏi rời | Tiếng lăn dội ra cửa. | Có thể khảo sát |
| Vách nhẵn | Bước êm, bóng tối không che mất chữ trên sơ đồ. | Có thể khảo sát |
| Gờ cao | Xa luồng sáng, thêm một nhịp vòng. | Có thể khảo sát |
| Mốc dây | Mốc quay lại cho cả toán. | Có thể khảo sát |
| Vệt nắng | Bị nhìn thấy từ cửa. | Không đáp ứng điều kiện tuyến |
| Hốc quay về | Chỗ hội toán, không phải vị trí Saun. | Có thể khảo sát |


| Từ | Đến | Tiếng dội | Lộ sáng |
| --- | --- | --- | --- |
| Góc toán | Sỏi rời | 4 | 0 |
| Sỏi rời | Mốc dây | 2 | 0 |
| Góc toán | Vách nhẵn | 1 | 0 |
| Góc toán | Gờ cao | 1 | 0 |
| Vách nhẵn | Mốc dây | 1 | 0 |
| Gờ cao | Mốc dây | 1 | 0 |
| Mốc dây | Vệt nắng | 0 | 4 |
| Vệt nắng | Hốc quay về | 0 | 0 |
| Mốc dây | Hốc quay về | 1 | 0 |


### Điều kiện và phản hồi

- Tổng tiếng dội không quá 3 nhịp, không đi vào vệt nắng.
- Luôn qua mốc dây trước hốc quay về; có hai lối êm.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Sỏi rời và ánh sáng gây hai kiểu lộ khác nhau.  
**Gợi ý 2:** Vách nhẵn hoặc gờ cao → mốc dây → hốc quay về.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Toán có đường lui được kiểm bằng cả tiếng và ánh sáng. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Chỉ ghi tiến độ và phương án bên trong Legend; không thêm chứng cứ, vật phẩm, nguồn lực hoặc đổi kết cục nguồn.

**Tham chiếu:** S06, S30, S17; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## L02.RESTRAINT • Giữ một khoảng lùi

**Chủ cảnh:** L02 · **Bước thay thế:** return-group · **Loại:** Phân người / vật theo giới hạn · **Luật:** revision 1.

Sau lời cấm của Đavít trong trình thuật, toán hư cấu cần về chỗ chờ. Chia người giữ mốc, đi cùng người nóng nảy và giữ nước; không dùng bạo lực để “kiềm chế”.

**Câu hỏi trải nghiệm:** Đọc tiếng và ánh sáng để có khoảng lùi ra sao?

**Hiểu lầm màn phải cho phép kiểm:** Chọn tối nhất hoặc gần nhất mà bỏ âm dội và mốc quay về.

**Dấu cần đọc:** Sỏi, vách nhẵn, gờ cao, vệt nắng và dây mốc.

**Lời mở đang hiển thị:** Người cùng toán · [H] — “Tôi không muốn tiếng bước mình kéo cả nhóm về phía cửa. Cho tôi một mốc để quay lại.”

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Người đang nóng nảy | Tự đồng ý lùi vào chỗ chờ với một bạn đi cùng. | Chỗ chờ |
| Bạn cùng toán | Có thể đi kèm hoặc giữ mốc. | Chỗ chờ; Mốc đường lui |
| Bạn | Có thể đi kèm hoặc giữ mốc. | Chỗ chờ; Mốc đường lui |
| Bầu nước | Để ở chỗ chờ, không gây tiếng va. | Chỗ chờ |
| Người giữ dây | Ở mốc đường lui. | Mốc đường lui |


| Điểm nhận | Điều kiện |
| --- | --- |
| Chỗ chờ | Người nóng nảy, người đi kèm và nước. |
| Mốc đường lui | Người giữ dây và người nối tín hiệu. |


### Điều kiện và phản hồi

- Không giao lệnh thay Đavít, không tự cắt áo hay tấn công Saun.
- Bạn và người cùng toán đổi vai được khi hai điểm vẫn đủ người.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Người nóng nảy cần người đi cùng, không cần bị khóa lại.  
**Gợi ý 2:** Giữ nước ở chỗ chờ và chia hai người đồng hành cho hai điểm.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Khoảng lùi được giữ bằng sự cùng ở lại; canon của Đavít không đổi. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Chỉ ghi tiến độ và phương án bên trong Legend; không thêm chứng cứ, vật phẩm, nguồn lực hoặc đổi kết cục nguồn.

**Tham chiếu:** S06, S23; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## L03.CLOTH • Vải mềm giữa dây và vai

**Chủ cảnh:** L03 · **Bước thay thế:** cloth · **Loại:** Thao tác có tiền đề · **Luật:** revision 1.

Gr 38,7–13 kể Ebed-melech dùng vải cũ lót nơi dây tì khi đưa Giêrêmia lên. Người phụ hư cấu chuẩn bị phần việc theo trình tự, không “mua” kết quả bằng điểm.

**Câu hỏi trải nghiệm:** Chi tiết nhỏ nào phải có trước khi chuyển tải?

**Hiểu lầm màn phải cho phép kiểm:** Bỏ qua tấm vải vì cho rằng chỉ lực kéo mới quan trọng.

**Dấu cần đọc:** Vải tới chỗ dây tì và tiếng xác nhận từ dưới hố.

**Lời mở đang hiển thị:** Người phụ cùng nhóm · [H] — “Vải đã tới dưới hố. Chúng ta còn chờ một tiếng đáp trước khi cùng mang tải.”

| Thao tác | Điều quan sát / công việc | Tiền đề |
| --- | --- | --- |
| Gọi đáp dưới hố | Xác nhận người dưới hố nghe được. | Có thể chuẩn bị ngay |
| Chuyển vải mềm xuống trước | Vải được đưa tới người dưới hố. | Gọi đáp dưới hố |
| Chờ xác nhận vải đã lót | Chờ lời đáp về chỗ dây tì. | Chuyển vải mềm xuống trước |
| Phân người giữ dây | Có thể chuẩn bị trong khi đưa vải xuống. | Có thể chuẩn bị ngay |
| Cùng đưa lên theo nhịp | Chỉ sau khi vải đã lót và người giữ đã sẵn sàng. | Chờ xác nhận vải đã lót; Phân người giữ dây |


### Điều kiện và phản hồi

- Lót vải trước khi mang tải.
- Không có bộ đếm gây tổn thương khi bạn đang học thao tác.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Vật liệu nhỏ thay đổi chỗ lực tì lên người.  
**Gợi ý 2:** Gọi đáp → chuyển vải → chờ xác nhận; có đủ người giữ rồi mới chuyển tải.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Vải được đặt đúng chỗ trước khi chuyển tải; trình thuật cứu Giêrêmia giữ nguyên. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Chỉ ghi tiến độ và phương án bên trong Legend; không thêm chứng cứ, vật phẩm, nguồn lực hoặc đổi kết cục nguồn.

**Tham chiếu:** S07; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## L04.NET • Lưới chưa thả, dây đã phải rõ

**Chủ cảnh:** L04 · **Bước thay thế:** net · **Loại:** Thao tác có tiền đề · **Luật:** revision 1.

Chuẩn bị dụng cụ trong đêm trắng tay. Gỡ dây chỉ là việc con người; kết quả mẻ cá trong Ga 21 không phụ thuộc điểm tối ưu.

**Câu hỏi trải nghiệm:** Con người có thể chuẩn bị phần nào cạnh thuyền?

**Hiểu lầm màn phải cho phép kiểm:** Tối ưu thuyền để tạo phép lạ hoặc thắng số cá.

**Dấu cần đọc:** Mép lưới, dây mạn, lối chân và người nhận trên bờ.

**Lời mở đang hiển thị:** Người phụ việc · [H] — “Tôi nhận phần dây này. Bạn xem lối chân còn vướng gì rồi mình cùng thu xếp.”

| Thao tác | Điều quan sát / công việc | Tiền đề |
| --- | --- | --- |
| Trải phần lưới đang rối | Nhìn thấy hai đầu dây. | Có thể chuẩn bị ngay |
| Tách mép nổi | Sau khi trải, nhận mép nổi bằng nút đánh dấu. | Trải phần lưới đang rối |
| Tách mép chì | Sau khi trải, nhận phần mang tải. | Trải phần lưới đang rối |
| Cuộn dây mạn khỏi lối chân | Không cần chờ xong cả hai mép. | Có thể chuẩn bị ngay |
| Kiểm đường thả không vướng chân | Cần đủ mép nổi, mép chì và dây mạn. | Tách mép nổi; Tách mép chì; Cuộn dây mạn khỏi lối chân |


### Điều kiện và phản hồi

- Hai mép có thể gỡ theo hai thứ tự; dây mạn cũng có thể chuẩn bị sớm.
- Bản văn không xác định cấu tạo lưới ba lớp; mọi lớp và nút thao tác ở đây là [H].

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Tìm hai mép trước khi xét lưới có thể thả.  
**Gợi ý 2:** Trải → tách hai mép; cuộn dây mạn; kiểm sau cùng.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Đường thao tác được dọn, không thay đổi việc đêm ấy các môn đệ không bắt được cá. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Chỉ ghi tiến độ và phương án bên trong Legend; không thêm chứng cứ, vật phẩm, nguồn lực hoặc đổi kết cục nguồn.

**Tham chiếu:** S09, S31; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## L04.LANDING • Ba việc bên mạn thuyền

**Chủ cảnh:** L04 · **Bước thay thế:** land · **Loại:** Phân người / vật theo giới hạn · **Luật:** revision 1.

Sau mẻ cá theo trình thuật, nhóm hư cấu giữ thuyền và lối lên bờ. Chia lực ở hai bên và giữ dây giữa; không có nhánh làm lưới Kinh Thánh bị rách.

**Câu hỏi trải nghiệm:** Con người có thể chuẩn bị phần nào cạnh thuyền?

**Hiểu lầm màn phải cho phép kiểm:** Tối ưu thuyền để tạo phép lạ hoặc thắng số cá.

**Dấu cần đọc:** Mép lưới, dây mạn, lối chân và người nhận trên bờ.

**Lời mở đang hiển thị:** Người phụ việc · [H] — “Tôi nhận phần dây này. Bạn xem lối chân còn vướng gì rồi mình cùng thu xếp.”

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Người phụ thứ nhất | Một đơn vị giữ thăng bằng. | Mạn trái; Mạn phải |
| Người phụ thứ hai | Một đơn vị giữ thăng bằng. | Mạn trái; Mạn phải |
| Bạn | Giữ đường dây giữa. | Dây giữa |
| Người nhận trên bờ | Giữ lối bước lên, không dồn ra một mạn. | Lối lên bờ |


| Điểm nhận | Điều kiện |
| --- | --- |
| Mạn trái | Một người giữ cân. |
| Mạn phải | Một người giữ cân. |
| Dây giữa | Một người giữ dây khỏi lối chân. |
| Lối lên bờ | Người nhận đứng chờ. |


### Điều kiện và phản hồi

- Hai người phụ đổi mạn được; lực hai bên phải cân.
- Đơn vị tải là mô hình game, không là tải trọng đo từ thuyền Ginosar.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Đừng dồn cả hai người giữ cân về cùng mạn.  
**Gợi ý 2:** Mỗi mạn một người; bạn giữ dây giữa; người nhận ở bờ.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Lối lên bờ có người nhận; trình thuật chuyển sang bếp than và bữa sáng. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Chỉ ghi tiến độ và phương án bên trong Legend; không thêm chứng cứ, vật phẩm, nguồn lực hoặc đổi kết cục nguồn.

**Tham chiếu:** S09, S31; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## L05.REMAIN • Đứng lại trong nhà giam

**Chủ cảnh:** L05 · **Bước thay thế:** remain · **Loại:** Phân người / vật theo giới hạn · **Luật:** revision 1.

Cv 16,25–34 không trở thành màn vượt ngục. Sau nhịp nguồn, nhóm người phụ hư cấu giữ tầm nhìn và gọi đáp để không ai suy rằng mọi người đã chạy.

**Câu hỏi trải nghiệm:** Ở lại được nhận biết bằng sự hiện diện thế nào?

**Hiểu lầm màn phải cho phép kiểm:** Biến cửa mở thành yêu cầu trốn ngục.

**Dấu cần đọc:** Ánh đèn ở cửa và lời đáp từ nhóm còn ở trong.

**Lời mở đang hiển thị:** Người cùng buồng · [H] — “Tôi còn ở đây. Giữ đèn để người bên cửa nhìn thấy chúng ta.”

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Bạn | Có thể giữ đèn hoặc gọi đáp. | Chỗ giữ ánh sáng; Cùng ở lại |
| Người cùng buồng | Có thể giữ đèn hoặc gọi đáp. | Chỗ giữ ánh sáng; Cùng ở lại |
| Đèn | Giữ ở cửa nhìn vào trong. | Chỗ giữ ánh sáng |
| Nhóm đang ở lại | Ở cùng nhau trong tầm đáp. | Cùng ở lại |


| Điểm nhận | Điều kiện |
| --- | --- |
| Chỗ giữ ánh sáng | Đèn và một người gọi đáp. |
| Cùng ở lại | Nhóm và một người nối lời đáp. |


### Điều kiện và phản hồi

- Không điều khiển Phaolô nói lời mới.
- Chấn động và lời can ngăn thuộc bản văn; mô hình phân người là [H].

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Ánh sáng phải nối được với tiếng trả lời.  
**Gợi ý 2:** Chia hai người biết gọi đáp cho cửa và nhóm; đèn ở cửa.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Nhóm hư cấu còn hiện diện trong tầm nhìn và tiếng đáp. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Chỉ ghi tiến độ và phương án bên trong Legend; không thêm chứng cứ, vật phẩm, nguồn lực hoặc đổi kết cục nguồn.

**Tham chiếu:** S10; xem [sổ nguồn](10-source-register.md) và [báo cáo nghiên cứu](16-depth-research.md).

## V01.PAGES • Những trang chưa mang tên

**Chủ cảnh:** V01 · **Bước thay thế:** place · **Loại:** Sắp đặt mở, không chấm phản tư · **Luật:** revision 1.

Đây là giấc mơ hư cấu. Đặt các trang vào nơi bạn muốn giữ, trao hoặc để chờ; bố cục không tiết lộ danh tính ngoài đời.

**Câu hỏi trải nghiệm:** Bạn muốn đặt trang ký ức ở đâu?

**Hiểu lầm màn phải cho phép kiểm:** Tưởng game đang tiết lộ danh tính hoặc đòi một lựa chọn đạo đức đúng.

**Dấu cần đọc:** Trang không tên, ba nơi đặt tự do và quyền để trống.

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Trang còn hơi ấm | Gợi một cuộc gặp chưa đặt tên. | Tự chọn trong các điểm |
| Trang gấp đôi | Một điều bạn chưa muốn mở. | Tự chọn trong các điểm |
| Trang trắng | Một khoảng chưa cần lấp. | Tự chọn trong các điểm |


| Điểm nhận | Điều kiện |
| --- | --- |
| Tự giữ | Giữ trong tầm tay. |
| Để người kia tự nhận | Không đặt hộ vào tay họ. |
| Để chờ | Một việc chưa đến lúc nói. |


### Điều kiện và phản hồi

- Có thể để trống hoặc sắp đặt theo cách bạn muốn.
- Không có đáp án đạo đức, điểm đức tin hay lời tiên báo.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Chỉ thử một cách đặt rồi nhìn lại cảm giác của bạn.  
**Gợi ý 2:** Bạn có thể xóa bố cục hoặc tiếp tục mà không ghi một lời phản tư.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Bạn rời bố cục bằng lựa chọn riêng; game không giải nghĩa thay bạn. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Tương tác tự chọn, không cung cấp bằng chứng hay kết luận cảm xúc; có thể bỏ toàn bộ Veil.

**Tham chiếu:** [H] giấc mơ ẩn dụ; xem giới hạn Veil ở [hồ sơ Kinh Thánh](08-scripture-reference.md).

## V02.BALANCE • Những nhịp cầu chia tải

**Chủ cảnh:** V02 · **Bước thay thế:** share · **Loại:** Phân người / vật theo giới hạn · **Luật:** revision 1.

Ẩn dụ hư cấu có luật cân bằng vật lý đơn giản: chuyển bốn khối để hai bệ cùng chịu hai đơn vị. Không dùng kết quả để chấm con người.

**Câu hỏi trải nghiệm:** Bệ có thể chia tải mà không cần khối đặc biệt nào không?

**Hiểu lầm màn phải cho phép kiểm:** Tìm một khối thần bí có đáp án duy nhất.

**Dấu cần đọc:** Bốn khối có cùng tải và hai bệ bằng nhau.

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Khối đá A | Một đơn vị tải. | Tự chọn trong các điểm |
| Khối đá B | Một đơn vị tải. | Tự chọn trong các điểm |
| Khối đá C | Một đơn vị tải. | Tự chọn trong các điểm |
| Khối đá D | Một đơn vị tải. | Tự chọn trong các điểm |


| Điểm nhận | Điều kiện |
| --- | --- |
| Bệ trái | Chịu hai đơn vị. |
| Bệ phải | Chịu hai đơn vị. |


### Điều kiện và phản hồi

- Mỗi khối một nơi; mỗi bệ hai đơn vị.
- Mọi cách chia cân bằng đều được chấp nhận; phản tư được để trống.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Không có khối nào đặc biệt hơn khối khác.  
**Gợi ý 2:** Đặt hai khối lên mỗi bệ.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Mặt cầu trong giấc mơ cân bằng; ngoài đời vẫn cần mở lời với người thật. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Tương tác tự chọn, không cung cấp bằng chứng hay kết luận cảm xúc; có thể bỏ toàn bộ Veil.

**Tham chiếu:** [H] giấc mơ ẩn dụ; xem giới hạn Veil ở [hồ sơ Kinh Thánh](08-scripture-reference.md).

## V03.STRINGS • Bàn tay đang giữ dây

**Chủ cảnh:** V03 · **Bước thay thế:** release · **Loại:** Sắp đặt mở, không chấm phản tư · **Luật:** revision 1.

Không có nhân vật thật bị điều khiển ở đây. Thử đặt ba sợi dây vào tay, lên cành hoặc xuống đất; ý nghĩa được để mở.

**Câu hỏi trải nghiệm:** Một bố cục dây có thể mang nhiều cách hiểu không?

**Hiểu lầm màn phải cho phép kiểm:** Tưởng phải buông hết mới được coi là người tốt.

**Dấu cần đọc:** Ba sợi dây và các nơi đặt đều để mở.

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Sợi dây lo sợ | Một điều bạn đang muốn nắm chắc. | Tự chọn trong các điểm |
| Sợi dây chăm sóc | Một ý muốn giúp người khác. | Tự chọn trong các điểm |
| Sợi dây mong đợi | Một kết quả bạn đang chờ. | Tự chọn trong các điểm |


| Điểm nhận | Điều kiện |
| --- | --- |
| Trong tay | Tiếp tục giữ. |
| Trên cành | Đặt sang một điểm khác. |
| Dưới đất | Để dây được nghỉ. |


### Điều kiện và phản hồi

- Có thể để trống hoặc sắp đặt theo cách bạn muốn.
- Không có đáp án đạo đức, điểm đức tin hay lời tiên báo.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Chỉ thử một cách đặt rồi nhìn lại cảm giác của bạn.  
**Gợi ý 2:** Bạn có thể xóa bố cục hoặc tiếp tục mà không ghi một lời phản tư.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Game lưu bố cục nếu bạn muốn, không kết luận bạn đã biết buông hay chưa. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Tương tác tự chọn, không cung cấp bằng chứng hay kết luận cảm xúc; có thể bỏ toàn bộ Veil.

**Tham chiếu:** [H] giấc mơ ẩn dụ; xem giới hạn Veil ở [hồ sơ Kinh Thánh](08-scripture-reference.md).

## V04.TABLE • Một bàn còn chỗ trống

**Chủ cảnh:** V04 · **Bước thay thế:** sit · **Loại:** Sắp đặt mở, không chấm phản tư · **Luật:** revision 1.

Giấc mơ không gọi người đã khuất trở về để trả lời điều tra. Đặt vài vật quen vào bàn, kệ hoặc túi rồi trở lại với người đang sống.

**Câu hỏi trải nghiệm:** Có thể trở về dù ký ức còn dang dở không?

**Hiểu lầm màn phải cho phép kiểm:** Tưởng phải đặt đúng đồ mới nghe được cha giải án.

**Dấu cần đọc:** Chén, chỉ, đèn và quyền không sắp gì.

| Người / vật | Giới hạn được nêu | Nơi được nhận |
| --- | --- | --- |
| Chén đất | Một bữa từng có người ngồi. | Tự chọn trong các điểm |
| Cuộn chỉ | Một việc còn có thể làm tiếp. | Tự chọn trong các điểm |
| Đèn nhỏ | Một khoảng sáng vừa đủ. | Tự chọn trong các điểm |


| Điểm nhận | Điều kiện |
| --- | --- |
| Trên bàn | Một chỗ còn để dành. |
| Trên kệ | Một điều cất lại. |
| Trong túi | Một vật muốn mang theo trong ký ức. |


### Điều kiện và phản hồi

- Có thể để trống hoặc sắp đặt theo cách bạn muốn.
- Không có đáp án đạo đức, điểm đức tin hay lời tiên báo.

Khi thử chưa đạt, bàn chỉ rõ tiền đề, vị trí, tổng khoản hoặc phạm vi còn thiếu. Bản nháp vẫn ở đó; người chơi có thể bỏ một bước, lùi một mốc, đổi nơi nhận hoặc xóa bố cục. Không tiêu tài nguyên khi thử.

**Gợi ý 1:** Chỉ thử một cách đặt rồi nhìn lại cảm giác của bạn.  
**Gợi ý 2:** Bạn có thể xóa bố cục hoặc tiếp tục mà không ghi một lời phản tư.  
**Gợi ý 3:** đặt một phương án mẫu để người chơi tự xem và quyết định thực hiện.

**Ghi nhận sau thực hiện:** Bố cục có thể còn dang dở; bạn vẫn được trở về và tiếp tục sống. Sổ kèm thứ tự, tuyến, phân vai hoặc mức kết luận thực sự đã chọn.

**Ranh giới:** Tương tác tự chọn, không cung cấp bằng chứng hay kết luận cảm xúc; có thể bỏ toàn bộ Veil.

**Tham chiếu:** [H] giấc mơ ẩn dụ; xem giới hạn Veil ở [hồ sơ Kinh Thánh](08-scripture-reference.md).

## Lưu, thực hiện và kiểm tra

Bản nháp gồm lựa chọn ở từng trường, không có cờ hoàn thành. “Thử phương án” chỉ phản hồi. “Thực hiện phương án” qua bộ kiểm model rồi mới ghi nhận bước hiện tại. Bản ghi có revision, payload và việc đã dùng hướng dẫn; không tự tạo đồng thuận hay quyền công bố. Save cũ thiếu trường workshop vẫn tải được. Legend giữ workshop trong checkpoint/record riêng và không ghi đè kết đã có khi replay.

Bản xem tóm tắt đủ nhịp của Legends mở cùng cổng như trước; không yêu cầu giải lại bàn thao tác để chứng minh niềm tin. Chuyển định dạng hoặc rời cảnh giữ đúng phạm vi tiến độ.

Sáu chi tiết được nhắc lại khi vào Q04, Q05, Q09, Q10, Q11, Q12, nếu có phương án nguồn: chốt cũ; lối đã chọn qua giếng/ven tường; gốc bản chép; ba khoản G17; ai đã có mặt ở cuộc hẹn; bữa và bộ đồ cho ca sau. Những ghi chú callback khác trong atlas là ý hướng biên tập trong sổ, không tự khẳng định đã có hoạt cảnh 3D.
