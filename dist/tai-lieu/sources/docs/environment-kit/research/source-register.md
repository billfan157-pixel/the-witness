# Nguồn tham chiếu môi trường Q01 và L04

Ngày kiểm tra: 9 tháng 11 năm 2026. Dữ liệu dùng để dựng board nằm trong
`references.json`: tám thẻ Q01 và tám thẻ L04. Đây là các mục quan sát khác
nhau, không phải mười sáu nguồn độc lập. Mỗi thẻ có claim, vị trí trong nguồn,
niên đại, quyết định áp dụng, giới hạn, quyền ảnh và hướng quan sát hình.

## Cách dùng để build

Mở nguồn gốc ở vị trí đã ghi, đối chiếu hình trước khi dựng asset. Đọc
`visualFocus`, rồi áp dụng `assetDecision` như một quyết định [H] dựa trên
claim [L] hoặc [K]; không đổi toàn bộ model thành bằng chứng khảo cổ.
Một kích thước module hoặc chiều rộng cửa phục vụ điều khiển nhân vật vẫn
là [H], trừ khi chính kích thước đó được chứng minh trong nguồn.

Thứ tự quan sát Q01: CAE-01/02 để hiểu đường bờ và lớp thời gian;
CAE-03/05/08 để hiểu vòm, tầng đỡ và đường lên; CAE-04 để phân biệt vật liệu;
CAE-06/07 để tránh đưa tầng muộn và phục dựng chưa chắc chắn vào cảnh 58–60 CN.
L04: GAL-01/02/03 là cấu tạo nhà và không gian đi lại, GAL-04 là kết nối
đường với bờ hồ, GAL-05/06 là thuyền so sánh, GAL-07 là ranh giới bản văn,
GAL-08 là các chi tiết cần loại khỏi cảnh thế kỷ I.

Không dùng các kích thước của vòm đỡ đền làm kích thước mặc định cho mọi
kho nhỏ. Không coi tháp cầu thang được đề xuất trong một nghiên cứu là
hình dạng đã khai quật nguyên vẹn. Không biến mẫu thuyền khảo cổ thành
lời khẳng định đây là chiếc thuyền của Đức Giêsu hoặc các môn đệ.

## Các điều chỉnh quan trọng

Custodia mô tả nhà basalt dùng chất chèn đất/bùn; yêu cầu cũ “không vữa”
quá tuyệt đối. Dựng đá không đều và mạch đất dịu; tránh cả mạch xi măng hiện
đại lẫn khối đá xếp khô đồng nhất trên mọi công trình.

Nghiên cứu của Shor và cộng sự năm 2026 phân biệt vật liệu theo chức năng
và mô tả lớp trát trên một số khối ashlar. Vì vậy không phủ toàn bộ Q01
bằng cùng một shader đá hộc hoặc cùng chi tiết boss-and-margin.

Giai đoạn khác nhau cùng tồn tại trong ảnh di tích hiện nay. Đối với Q01,
phải lọc Crusader, Byzantine, Islamic và hạ tầng du lịch hiện đại. Với L04,
đừng dùng nhà thờ hiện đại hoặc hội đường đá trắng muộn làm kiến trúc của Ga 21.

Board hiện dùng mô tả khoảng 8 m của bảo tàng Yigal Allon. Báo cáo
khai quật Wachsmann là nguồn đọc tiếp trước khi làm hero thuyền; chưa lấy
8,2 × 2,3 m làm hợp đồng model hay suy ra tải trọng.


## Quyền hình và board

Không tải hoặc chép ảnh Custodia: trang nguồn cấm bên thứ ba dùng text/ảnh
khi chưa có đồng ý rõ ràng. Chỉ dùng liên kết xem ngoài trong board. Ảnh trên
trang công viên có tên nhiếp ảnh gia và không có giấy phép mở đã được xác
minh: cũng chỉ liên kết. Ảnh bảo tàng thuyền và kỷ yếu INA chưa có phép tái
phân phối được xác minh; không đưa vào gói game.

Bài Shor 2026 có CC BY 4.0. Hình 4–6 được ghi trong dữ liệu là ứng viên
tham chiếu có thể tái dùng theo giấy phép bài, khi giữ đủ credit và kiểm tra
lại credit line của từng hình trước khi đóng gói. Hình 2 có ghi nguồn courtesy
IAA; chưa coi đó là ảnh được phép sao chép chỉ vì bài là open access.
Các ảnh kính hiển vi là chứng cứ về thành phần/cấu trúc vật liệu, không phải
albedo được chụp ở tỷ lệ người chơi và không được dùng trực tiếp làm texture.

Board có thể trình bày thẻ quan sát, sơ đồ tự dựng [H], swatch của dự án,
và nút mở nguồn ảnh ngoài. Màu swatch, mức nhám và mức phong hóa cần được
ghi là quyết định mỹ thuật; ảnh khảo cổ dưới ánh sáng không kiểm soát không
đủ để suy ra albedo PBR chính xác. Không tạo “ảnh khảo cổ” bằng AI rồi gắn [L].

## Những điểm còn chưa thể coi là chứng minh

- Quy tắc boss/rãnh đẽo 8 cm và sâu 2 cm áp dụng cho mọi nhà Caesarea.
- Hình dáng, chiều cao và tầng trên hoàn chỉnh của hải đăng Sebastos.
- Vị trí chính xác của bữa ăn Ga 21 là Capernaum.
- Chiều cao mái, kích thước cửa và dốc cầu thang cụ thể của căn nhà Q01 hư cấu.
- Tất cả bậc thang và mái đang thấy ở Capernaum đều thuộc thế kỷ I.

Các câu hỏi này không ngăn xây một tuyến chơi [H] có căn cứ. Chúng yêu cầu
ghi nhãn phục dựng và tránh đưa chi tiết chưa chắc chắn vào phần giải thích
như một sự kiện đã xác minh.

## Nguồn chính đã kiểm tra

- Israel Nature and Parks Authority, [Caesarea National Park](https://static-en.parks.org.il/wp-content/uploads/2026/02/ENG_Caesarea-Park.pdf).
- INPA, [Caesarea Harbor Visitors’ Center](https://en.parks.org.il/new/spectacular-vaults-and-treasures-caesarea-harbor-visitors-center/), 2021.
- Shor et al., [Mortars and plasters at Herod’s Caesarea Maritima](https://doi.org/10.1617/s11527-026-03228-9), Materials and Structures 59, 379, 2026.
- ‘Ad, Arbel, Gendelman, IAA, [Caesarea Area LL](https://hadashot.iaa.org.il/Report_Detail_Eng.aspx?id=25450), 2018.
- Patrich, [The ascent to the temple platform in Caesarea from the Harbor side](https://cris.huji.ac.il/en/publications/the-ascent-to-the-temple-platform-in-caesarea-from-the-harbor-sid/), 2022; abstract và hồ sơ tác giả được kiểm tra, không khẳng định đã đọc toàn chương.
- Custodia di Terra Santa, [Capernaum](https://www.custodia.org/en/sanctuaries/capernaum/), các mục The Village, Insula 2 và Memorial.
- Wachsmann, [The Kinneret Boat: The Discovery and Excavation](https://nauticalarch.org/wp-content/uploads/2016/01/Tzalas-1990-Tropis-II.pdf), Tropis II, 1990; nguồn đọc tiếp; chưa dùng bản đo cho model cuối.
- Yigal Allon Centre, [The Ancient Boat](https://yigal-allon-centre.org.il/en/the-museum/the-ancient-boat/).
- USCCB, [John 21](https://bible.usccb.org/bible/john/21), câu 1, 4, 8–13.
