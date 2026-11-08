# Chứng Nhân — Di Sản Giao Ước

Bản dựng 0.2.0 triển khai trục hồ sơ v3.0: Kinh Thánh là cốt truyện chính, ba Legends bắt buộc và 12 cầu nối đời thường. Đây là prototype 3D có thể chơi, chưa đạt thời lượng và mức sản xuất dài hạn của GDD.

## Chơi

Chạy `npm run dev`, mở địa chỉ Local được in ra. Bản đóng gói nằm ở `dist/ban-choi-ngoai-tuyen.html`; có thể mở trực tiếp mà không cần mạng hoặc cài thư viện.

WASD đi, kéo chuột nhìn, Q/R xoay, C đặt lại góc, E tương tác, F dẫn hướng, J mở sổ, M bản đồ, Escape menu. Cảm ứng dùng nửa trái để đi, nửa phải để nhìn. Tay cầm hỗ trợ cần trái/phải, A tương tác, Y sổ, Start menu. Sân luyện dùng K đánh, H đỡ, Space né; có nút cảm ứng và ba nhịp đối phương.

## Phần đã triển khai

- Ba cổng bắt buộc: Q03 → Môsê / Xh 14 → Q04; Q06 → Đavít / 1 Sm 24 → Q07; Q10 → Phêrô / Ga 21 → Q11. Kết campaign cần đủ cả ba.
- 16 nhịp nguồn bằng lời diễn ý có tham chiếu; không chế lời Đức Giêsu như trích dẫn. Mỗi chương có đường khám phá, địa vật tự chọn, thao tác, phần nguồn và kết.
- Chơi hoặc tóm tắt từng trang có cùng quyền mở cổng. Chọn tóm tắt/thoát chưa hoàn thành; đổi định dạng và tiếp tục giữ nhịp đã tiếp nhận.
- 12 cầu nối có điều kiện, kế hoạch, hành động thực hiện và commit riêng; ba tuyến hậu truyện.
- Ba vùng chính cùng các tuyến liên kết; nhân vật và vật tương tác trong 3D.
- Mười nguồn chứng cứ, bốn kết luận theo nguồn độc lập; phân biệt lô G17 và B06.
- Phạm vi lời chứng, sửa áp lực, bản ẩn danh, bảo vệ còn dang dở và đường thay.
- Hai Legend mở rộng và bốn giấc mơ tự chọn có thể bỏ hẳn. Cảnh nguồn không tạo chứng cứ, tài nguyên, đồng thuận hay điểm cứu độ.
- Sáu nhiệm vụ quan hệ: nhận kế hoạch rồi thực hiện tại bàn làm việc, không tự hoàn tất khi chọn.
- Ký ức lựa chọn, cứu người/giấy/thương tích, hậu quả trong sổ và đạo cụ.
- Vùng lưu v3, bản dự phòng và xuất/nhập JSON. Chuyển save THE WITNESS v2 giữ nguyên bản gốc, lựa chọn, tài nguyên và consent; boolean cũ không xác nhận đủ core mới. Save đã đi xa tiếp nhận các chương thiếu theo thứ tự. Save Hành Trình Lời Chúa cũ tách riêng.
- Chuột/bàn phím, cảm ứng, tay cầm, chữ lớn, hướng dẫn và âm thanh tùy chọn.
- Sân luyện tự vệ tùy chọn: không điểm cho việc đánh người và không đổi chứng cứ.
- Bản HTML tự chứa và cache offline có namespace riêng.

## Phạm vi còn lại của sản xuất

Trục và core nguồn đã vào prototype; dàn cảnh chưa đạt 80/70/66 phút. Mục tiêu campaign 216/720 phút (30%) chưa được đo/đạt trong bản browser. Còn level art cuối, đám đông/diễn xuất/cinematic, thu âm/bản dịch được phép, cây kỹ năng/trang bị đầy đủ và AI companion tự do. Quan hệ phụ còn dùng công việc ngắn. Bảy vị trí duyệt chuyên môn chưa phân công; chưa có playtest người thật theo protocol 12 người. Kiểm tự động không xác nhận các cổng ấy.

## Kiểm tra và đóng gói

`npm test` kiểm campaign và core v3: gate, hai định dạng, thoát/đổi định dạng, replay, di trú, địa vật, thao tác và dữ liệu. `node test/browser.mjs` kiểm điều khiển/Q02/offline; `node test/spine-browser.mjs` đi ba level và kiểm summary/cổng trên desktop/mobile. Cần Local đang chạy. Ảnh/báo cáo trong `test/artifacts`; scripted input không là playtest người thật. `npm run build` tạo dist, cache nội dung và HTML offline. Không cần npm install.

Nguồn sở hữu thiết kế: `docs/the-witness/`. Các file vendor và asset được sao riêng từ bản game hiện hữu, không sửa bundle gốc. Mở rộng không gian/nhân vật dùng các điểm tích hợp công khai trong bộ dựng. Thư mục này có dự án và Site riêng, hoàn toàn độc lập với game Hành Trình Lời Chúa nằm ở thư mục anh em `../hanh-trinh-loi-chua/`.
