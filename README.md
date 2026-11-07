# Chứng Nhân — Di Sản Giao Ước

Bản chơi đầu tiên 0.1.0, triển khai từ hồ sơ thiết kế THE WITNESS v2.0. Đây là nền chiến dịch trên trình duyệt với môi trường 3D, không phải bản sản xuất AAA hoàn chỉnh.

## Chơi

Chạy `npm run dev`, mở địa chỉ Local được in ra. Bản đóng gói nằm ở `dist/ban-choi-ngoai-tuyen.html`; có thể mở trực tiếp mà không cần mạng hoặc cài thư viện.

WASD đi, kéo chuột nhìn, Q/R xoay, C đặt lại góc, E tương tác, F dẫn hướng, J mở sổ, M bản đồ, Escape menu. Cảm ứng dùng nửa trái để đi, nửa phải để nhìn. Tay cầm hỗ trợ cần trái/phải, A tương tác, Y sổ, Start menu. Sân luyện dùng K đánh, H đỡ, Space né; có nút cảm ứng và ba nhịp đối phương.

## Phần đã triển khai

- 12 chương có điều kiện, kế hoạch, phần thực hiện và event commit riêng; ba tuyến thực hiện kết thúc.
- Ba vùng chính cùng các tuyến liên kết; nhân vật và vật tương tác trong 3D.
- Mười nguồn chứng cứ, bốn kết luận theo nguồn độc lập; phân biệt lô G17 và B06.
- Phạm vi lời chứng, sửa áp lực, bản ẩn danh, bảo vệ còn dang dở và đường thay.
- Năm Legends có nhãn nguồn, bốn giấc mơ hư cấu, cách bỏ qua giữ nguyên trạng thái đời thường.
- Sáu nhiệm vụ quan hệ: nhận kế hoạch rồi thực hiện tại bàn làm việc, không tự hoàn tất khi chọn.
- Ký ức lựa chọn, cứu người/giấy/thương tích, hậu quả trong sổ và đạo cụ.
- Bản lưu riêng, bản dự phòng, kiểm định bản nhập, xuất JSON; không đọc kho lưu game cũ.
- Chuột/bàn phím, cảm ứng, tay cầm, chữ lớn, hướng dẫn và âm thanh tùy chọn.
- Sân luyện tự vệ tùy chọn: không điểm cho việc đánh người và không đổi chứng cứ.
- Bản HTML tự chứa và cache offline có namespace riêng.

## Phạm vi còn lại của sản xuất

Nội dung đang ở mức dựng thử hệ thống và chuỗi nhiệm vụ. Các cảnh Legends là dàn cảnh ngắn có tương tác, chưa là screenplay điện ảnh đầy đủ. Chưa triển khai toàn bộ cây kỹ năng/trang bị của GDD, AI đồng hành đi tự do/chiến đấu, motion capture, thu âm, mọi hội thoại điều kiện, toàn bộ phản ứng địa hình hoặc thời lượng mục tiêu 13–22 giờ. Quan hệ phụ hiện dùng cảnh công việc ngắn; cần nâng dàn cảnh riêng sau thử người chơi. Chưa có thẩm định chuyên gia Kinh Thánh/lịch sử hoặc thử người chơi theo cỡ mẫu trong hồ sơ G1. Không coi kiểm tra tự động là chứng nhận những cổng ấy đã đạt.

## Kiểm tra và đóng gói

`npm test` kiểm chiến dịch, mọi route, ba ending, phạm vi lời chứng, sandbox, giao dịch hộ tống, lưu/khôi phục và chống lặp phần thưởng. `node test/browser.mjs` kiểm trình duyệt trên bản Local đang chạy; ảnh và báo cáo trong `test/artifacts`. `npm run build` tạo `dist`, cache phiên bản và HTML offline. Không cần npm install.

Nguồn sở hữu thiết kế: `../docs/the-witness/`. Các file vendor được sao riêng từ bản game hiện hữu, không sửa bundle gốc. Mở rộng không gian/nhân vật dùng các điểm tích hợp công khai trong bộ dựng. Thư mục này có dự án và Site riêng, giữ bản Hành Trình Lời Chúa đang có độc lập.
