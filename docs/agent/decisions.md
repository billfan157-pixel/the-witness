# Sổ quyết định

Chỉ ghi quyết định bền vững, không ghi từng bước làm. Không sửa ngược lịch sử;
nếu thay quyết định, thêm mục mới và liên kết mục bị thay thế. Các mục dưới là
quy ước quản trị trong phạm vi yêu cầu ngày 10/11/2026, không phê chuẩn thiết kế v6.

## D001 — Phân quyền nguồn theo miền (10/11/2026, áp dụng)

**Căn cứ:** cần nguồn follow/đối chứng cho agent, dự án đã có Bible và code.
**Quyết định:** AGENTS dẫn tới docs/agent; README chỉ định nguồn sở hữu từng miền.
Code sở hữu hiện trạng; Bible sở hữu thiết kế; evidence sở hữu claim đã kiểm chứng.
**Hệ quả:** không thay thế bộ Bible, không dùng một bản summary để ghi đè nguồn.
Mâu thuẫn có ID ở status và được giải quyết tại nguồn sở hữu.

## D002 — Một nơi biên tập và kiểm soát file mới (10/11/2026, áp dụng)

**Quyết định:** nguồn mới vào nhóm đã đăng ký, có admission/reason/owner; root
không nhận file tùy ý. Tạm ở vùng đã ignore, output qua producer.
**Hệ quả:** giữ nguyên kho cũ để tránh hỏng consumer; chưa có kế hoạch xóa hàng loạt.
Hai cặp contracts có nguồn ở docs, mirror gốc được giữ và kiểm giống byte.

## D003 — Giữ khoảng cách thiết kế/triển khai hiển thị (10/11/2026, áp dụng)

**Căn cứ:** Bible scene v6 mô tả thêm evidence/claims, runtime/tests vẫn v3.
**Quyết định:** ghi A01, chưa đổi schema/ID/truyện trong tác vụ quản trị này.
**Hệ quả:** agent phải xem A01 trước khi triển khai quest; kết quả validator v3
không được diễn giải thành nghiệm thu toàn bộ nội dung v6.

## D004 — Cổng quản trị trong lệnh npm chuẩn (10/11/2026, áp dụng)

**Quyết định:** thêm `check:agents`, `test:agents`; `pretest`/`prebuild` gọi checker
trước test/build chuẩn. Không đổi nội dung chuỗi test/build đã có.
**Hệ quả:** lỗi admission, mirror hay link sẽ dừng các lệnh npm này. Script Node
gọi trực tiếp vẫn có thể bỏ qua; chưa có CI bắt buộc hoặc chặn ghi ở cấp hệ điều hành.

Các quyết định D001–D004 ghi mốc lập hệ thống; thay đổi tiếp theo được ghi riêng.

## D005 — Dọn nguồn trùng và cách ly lịch sử (10/11/2026, áp dụng)

**Căn cứ:** người dùng yêu cầu dọn file lỗi thời, tính cả việc chưa commit và
nhánh/checkouts chưa nhập main. Đã fetch origin, so nhánh và rà sáu checkout Sites.
**Quyết định:** giữ nguồn contract duy nhất trong docs, chuyển test đọc trực
tiếp và loại hai bản sao root (thay phần mirror của D002). Archive ba tài liệu
còn giá trị lịch sử; loại các bản xuất/phát hành cũ, bằng chứng trùng byte,
probe một lần và script Word có nội dung Phase 3 cố định. Sổ cleanup ghi đủ
hash và Git object để khôi phục; không xóa thay đổi chưa commit ở checkout khác.
**Hệ quả:** các thư mục export có thể tạo lại được ignore. Checker chặn tái
tạo nguồn đã nghỉ và kiểm nơi lưu trữ. Lịch sử Git và evidence chính thức giữ lại.

## D006 — Đầu ra build sạch, reader phải còn khớp nguồn (10/11/2026, áp dụng)

**Quyết định:** static/cloud producer dọn đúng vùng sinh đã giới hạn, từ chối
symlink/junction và kiểm reader tùy chọn bằng hash nguồn trước đóng gói.
**Hệ quả:** loại nguyên nhân A06; reader lỗi thời sẽ chặn build, không được
copy lặng lẽ. Thay đổi source không chứng nhận art gate hoặc deployment mới.

## Cách ghi mục tiếp theo

Thêm D tiếp theo trong file này với ngày, trạng thái (đề xuất/áp dụng/thay thế),
căn cứ từ yêu cầu hoặc kiểm chứng, quyết định, nguồn sở hữu bị ảnh hưởng, kiểm
chứng cần làm và mục thay thế nếu có. Chỉ ghi người dùng đã duyệt khi có xác nhận
thực; không tự tạo tên người duyệt hoặc quyết định sản phẩm còn mở.
