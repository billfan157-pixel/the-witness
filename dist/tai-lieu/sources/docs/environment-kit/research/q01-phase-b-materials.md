# Q01 Phase B — vật liệu, mép cảng và chuyển tiếp vào kho

Kiểm tra nguồn: **10-11-2026**. Bổ sung cho [q01-gold-materials.md](q01-gold-materials.md),
[look-bible.md](../look-bible.md), [standards.md](../standards.md) và
[nguồn texture](../../../assets/architecture/sources.json). Phạm vi là cảnh chơi
Caesarea khoảng 58–60 CN; không là hồ sơ phục dựng một căn kho được khai quật.

`[L]` dưới đây chỉ áp dụng cho nhận định được dẫn nguồn; `[H]` là thiết kế cảnh.
Nguồn tại Caesarea không tự xác nhận mặt bằng, cửa, nội thất hoặc vị trí kho Q01.
Chưa tìm được chứng cứ trực tiếp đủ để chốt các chi tiết đó. Tất cả kích thước
module, thông số shader, mức hư hại và bố trí ánh sáng vẫn là `[H]`.

## Căn cứ bổ sung và giới hạn

- **[L, B1] Khối xây không đồng nhất.** Các vòm Herodian cạnh cảng có đá cát
  đẽo, vữa kê và lớp trát; một nhóm có lớp lõi đá vụn xen khối đẽo. Đó là phần
  đỡ cầu thang lên đền, không phải bằng chứng cho mọi kho hàng. Phải phân biệt
  đá mặt, mạch vữa, lớp trát và lõi; không biến mọi bức tường thành cùng một
  bề mặt đá vụn hoặc vòm đền.
- **[L, B2] Bê tông cảng có vai trò riêng.** ROMACONS lấy lõi từ các khối của
  đê chắn sóng; vật liệu là vữa vôi–pozzolana với cốt liệu, phần lớn cốt liệu
  thô quan sát được là kurkar. Gỗ ván và ghép mộng thuộc ván khuôn biển đã
  được ghi nhận. Điều này không chứng minh cầu cảng được lát gỗ, hay cửa kho
  có cùng cấu tạo với ván khuôn.
- **[L, B3] Mép bến có công năng.** Hồ sơ ghi đá buộc thuyền Roman và bậc đi
  xuống tại bến phía đông; các bến giữa cảng có khối đá đặt kiểu header.
  Một mặt khối lớn hiện chìm từng được gọi là nền lát, nhưng tác giả nêu khả
  năng nó vốn được xây dưới nước. Không dùng độ sâu hiện nay để suy chiều cao
  bến năm 60, hoặc coi tất cả đáy biển là đường đi cổ.
- **[L, B3–B4] Cảnh hiện tại có nhiều thời kỳ.** Khối đá, bờ và đê đã chịu
  thay đổi; nghiên cứu 2025 phân biệt kiểu xây ở hai phía cửa cảng nhưng còn
  để ngỏ niên đại và các lần sửa. Không sao chép đống đổ nát hiện đại, cột tái
  dụng thời Crusader hoặc phần sửa muộn vào cảnh thế kỷ I như dữ kiện chắc chắn.
- **[L đối chiếu, B5] Gỗ và dây.** Hiện vật Qumran cùng khoảng thế kỷ I
  TCN–I CN cho thấy đồ gỗ, dây bện và vật đan được bảo tồn; đây là đối chiếu
  vùng, không là mẫu cửa hay hàng hóa của kho Caesarea. Chưa xác minh loài gỗ,
  bản lề, chốt khóa hoặc cơ cấu đóng cửa cụ thể của Q01.

## Quyết định mỹ thuật để sản xuất [H]

| Phần cảnh | Ràng buộc thực hành | Tránh |
| --- | --- | --- |
| Đá và mảng tường | Giữ bảng đá vàng xám dịu. Dùng ba nhịp: mặt khối tương đối phẳng, góc/cạnh chịu va chạm, chân/mép tiếp biển. Đổi tông nhẹ theo khối và mức phơi ngoài trời; giữ cùng tỷ lệ hạt. | Đổi texture ngẫu nhiên mỗi mặt; rãnh đẽo sâu như nhau toàn cảnh; để mạch texture cắt ngang một khối nẹp rời. |
| Trát và lõi | Mảng trát lớn, yên, sáng ấm; mép bong có bề dày. Chỉ lộ lõi tại chỗ có lý do xây dựng hoặc hư hại. Góc cửa và chân tường có mặt hồi thật. | Vết nứt phủ đều; dùng normal thô của đá cho trát; làm mọi kiến trúc trông như phế tích bỏ hoang. |
| Mặt đi và ngưỡng | Lối ngoài trời dùng nhịp phiến lớn hơn chi tiết sàn trong; ngưỡng, chiếu nghỉ và bậc có hình học riêng. Mạch đổi theo mép công trình. Độ mòn ưu tiên tuyến đi và điểm đặt hàng. | Gọi texture `monastery_stone_floor` là nền Caesarea đã xác minh; sao chép một sơ đồ lát khảo cổ chưa rõ niên đại; nâng/gãy sàn làm vướng nhân vật. |
| Cửa, gỗ và mái che | Mỗi cửa đọc được khung, tấm ván, cạnh dày và điểm đỡ; thớ chạy theo chiều thanh. Ít nhất có biến thể cửa đóng, mở ép sát tường và lối kho đang làm việc. Chọn cách ghép, chốt và phần kim loại tiết chế rồi ghi là thiết kế của dự án. | Nhân một tấm phẳng lên mọi cửa; tự gán loài gỗ; dùng ván khuôn biển làm bằng chứng cho cửa; thanh giằng hoặc cánh cửa xuyên lối chơi. |
| Đạo cụ và tiếp xúc | Xếp bình có giá/chèn; dây nối đúng điểm buộc, cuộn chạm sàn; gỗ tựa vào giá hoặc tường. Bụi và vết cọ tập trung dưới chân kiện, gần tay nắm, cạnh bậc. Tái dùng căn cứ loại bình và dây từ hồ sơ trước. | Bình nổi, dây kết thúc trong không khí, prop chỉ đẹp từ trước; bóng đen vẽ sẵn tràn ra ngoài vật khi đổi vị trí. |
| Cảng → kho | Tổ chức chuỗi đọc được: nước → mặt đứng mép bến → mặt đi khô → vùng dỡ/chuyển hàng → ngưỡng → kho. Mép bến có đá nắp, mặt đứng và chỗ xuống nước có chủ đích; bãi thấp dùng dải đá/cát liên tục với địa hình. | Tấm nước giao cắt tường, đường bờ thẳng vô tận, toàn bộ mép đều rêu/ướt; bến gỗ dài được trình bày như phục dựng khảo cổ. |

Các dải ẩm, muối, cát, vết dây và mức đánh bóng do sử dụng là diễn giải hình
ảnh `[H]`, chưa được đo trên bề mặt kho cổ. Dải ướt phải theo cao độ nước và
mức che chắn; dừng hợp lý khi đi sâu vào kho. Không giảm roughness toàn cảnh
để tạo cảm giác có chi tiết. Các map CC0 hiện có vẫn là vật liệu đối chiếu,
không xác nhận đúng loại đá hoặc lớp hoàn thiện cổ.

## Ánh sáng và tính liên tục ở góc chơi [H]

- Tách ánh trời, vùng cửa nhận sáng và kho sâu; cho đá/trát gần cửa truyền
  sắc ấm nhẹ, giữ hướng nắng thống nhất. Sàn–tường, chân cột và đáy hàng phải
  có tiếp xúc mềm, không viền đen dày. Static GI/bounce là cách dựng hình,
  không là nhận định khảo cổ và không được gọi là bake nếu chưa bake thật.
- Đèn dầu là điểm sáng cục bộ có nguồn; đừng dùng đèn ẩn vô lý để làm kho sáng
  đều. Vẫn phải đọc được cửa, bậc và vùng tương tác khi nhìn từ trong ra ngoài.
- Kiểm cùng bộ vật liệu tại: tiếp cận bến; nhìn dọc mép nước; cửa kho từ hai
  phía; ngưỡng nhìn chéo; kho sâu nhìn ngược cửa; bàn Titus; cầu thang/chiếu
  nghỉ/mái; góc người chơi có thể quay lại sau nhiệm vụ. Kiểm thêm mặt hồi,
  mặt sau và phía dưới mái từ các vị trí hợp lệ.
- Duyệt ban ngày và tối ở cả tầm mắt lẫn góc ba. Một bề mặt không được đổi tỷ
  lệ hạt, hướng thớ hoặc độ sáng đột ngột khi qua module/LOD. Tạo khác biệt bằng
  công năng và mức phơi ngoài trời; hình học, collision và tuyến nhiệm vụ phải
  khớp nhau sau khi thêm đạo cụ. Danh sách này là tiêu chí kiểm, chưa là kết quả đạt.

## Sổ nguồn ngắn

| Mã | Nguồn trực tiếp đã mở | Phần dùng / mức chứng cứ | Giới hạn |
| --- | --- | --- | --- |
| B1 | Shor và cộng sự (2026), [*Mortars and plasters at Herod’s Caesarea Maritima*](https://link.springer.com/article/10.1617/s11527-026-03228-9), DOI 10.1617/s11527-026-03228-9. | Nghiên cứu mẫu gốc; abstract, §2.1.1, §4: công năng vật liệu và lớp hoàn thiện ở kiến trúc Herodian. | Không lấy mẫu căn kho Q01; thành phần vữa khác nhau theo cấu kiện. Không suy màu shader từ ảnh mẫu. |
| B2 | Hohlfelder, Brandon và Oleson, [*ROMACONS field campaign of October 2005*](https://web.uvic.ca/~jpoleson/ROMACONS/Caesarea2005.htm), University of Victoria; bản gần tương đương xuất bản IJNA 36.2 (2007), 409–415. | Báo cáo nhóm nghiên cứu; Background, CAE.2005.01–05, Analysis: bê tông, cốt liệu và ván khuôn. | Mẫu từ kết cấu biển; một số diễn giải được ghi là sơ bộ. Không chuyển dấu ván khuôn sang mọi tường hoặc cửa. |
| B3 | Galili, Salamon, Gambash và Zviely (2021), [*Archaeological and Natural Indicators of Sea-Level and Coastal Changes*](https://www.mdpi.com/2076-3263/11/8/306), DOI 10.3390/geosciences11080306. | Nghiên cứu đánh giá lại dấu chỉ địa hình/khảo cổ; §3.3 (2), (3), (5), hình 7: bến, mặt đá chìm, đá buộc thuyền và bậc. | Phân biệt quan sát với diễn giải; không xác nhận một mực nước hay sơ đồ bến duy nhất cho Q01. |
| B4 | Gambash và cộng sự (2025), [*Caesarea SubMaritima*](https://www.mdpi.com/2077-1312/13/5/940), DOI 10.3390/jmse13050940. | Khảo sát gốc của nhóm Haifa–Malta; §§3–4: hình học cửa cảng hiện còn và giả thuyết nhiều giai đoạn xây/sửa. | Chỉ khảo sát một phần cảng; kiểu xây và thời điểm sửa còn được thảo luận, không cung cấp mặt bằng kho thế kỷ I. |
| B5 | Library of Congress / IAA, [*Artifacts from the Qumran Site*](https://www.loc.gov/exhibits/scrolls/art2.html). | Hồ sơ cơ quan lưu giữ/trưng bày; Wood, Basketry and Cordage, Cords and Ropes. | Đối chiếu cùng vùng và giai đoạn rộng; không là bằng chứng tại Caesarea. |

Chỉ liên kết và diễn ý; chưa đưa ảnh, drawing hoặc model của các nguồn này
vào game. Kiểm giấy phép từng hình nếu sử dụng về sau. Nghiên cứu này không
chốt mặt bằng kho, tỷ lệ cửa, hệ mái, vị trí buộc tàu hoặc khẳng định chất lượng
mỹ thuật/gameplay đã được nghiệm thu.
