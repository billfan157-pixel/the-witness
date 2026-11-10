# Tiêu chuẩn bộ tài nguyên môi trường

Đọc roadmap.md trước khi tạo hoặc tích hợp asset. AI đảm nhận sản xuất và sửa
lỗi. Q01 bắt buộc, L04 mở rộng; nghiệm thu theo chất lượng thay vì hạn tám tuần.

## Dữ liệu và nguồn

Đơn vị mét, Y hướng lên, pivot ở chân module. Module kiến trúc bám lưới 0,5 m;
chiều rộng tham chiếu 2 và 4 m. Kích thước cửa, bậc thang và trần phải được
kiểm tra với capsule nhân vật trước khi chốt model đẹp.

Mỗi asset có ID, vùng, giai đoạn, nguồn có thể tái tạo, giấy phép, trạng thái
mỹ thuật, ngân sách và phạm vi truy cập. Dùng hệ mã hiện có của dự án: [K]
Kinh Thánh, [L] lịch sử khảo cổ, [G] giáo huấn, [H] sáng tác, [C] chưa xác minh.
Các mã [V]/[D] của tài liệu gốc tương ứng [L]/[H]. Gắn nguồn và mức tin cậy
vào từng nhận định, không đóng dấu khảo cổ cho toàn bộ model phục dựng.

## Vật liệu và hình học

Albedo ở sRGB; normal và AO/roughness/metalness ở linear. Atlas terrain hiện
có dùng AO/roughness/height nên không được gán nhầm thành ORM kim loại.
Khởi điểm là 13 họ vật liệu trong tài liệu gốc; chỉ sản xuất những họ cần
cho cảnh đang thực hiện. Mục tiêu texel density 256 px/m cho terrain và
512 px/m cho kiến trúc, có ngoại lệ theo khoảng cách quan sát và bộ nhớ.

Tường tối đa 800 tam giác, cột 1.500, prop nhỏ 3.000, hero 12.000, cây LOD0
8.000, đá 2.500 là ngân sách khởi điểm. Các biến thể và LOD phải có ích trong
cảnh thật. Không yêu cầu tạo LOD máy móc cho mọi asset trên 1.000 tam giác.
Gom instance theo mesh/material và vùng không gian để giữ hiệu quả culling.

R/G/B dùng cho AO/wear/wind chỉ khi shader đã đọc đúng các kênh mặt nạ.
Vertex color RGB thông thường và các mặt nạ này không dùng lẫn nhau.

## Transform và va chạm

Footprint [x,z,r] của node phải áp dụng transform node và instance. Asset nén
khai báo extras.footprintSpace=asset ở scene để giữ footprint trong hệ tọa độ
asset; không nhân thêm matrix giải lượng tử của mesh. Scale không đều dùng bán kính
bảo thủ. Footprint phục vụ vật cản mặt bằng; nó chưa thay thế collision 3D.
Metadata access phân biệt closed, walkable, interior, stairs và roof.

Collision 3D, sàn đỡ nhân vật, trần, cửa và điều hướng nhiều tầng là điều kiện
của kiến trúc trải nghiệm được. Thử tương tác và dẫn đường phải tính chênh
lệch tầng. Giữ ID và tọa độ NPC/quest chưa đủ để xác nhận gameplay an toàn.

## Loader và ngoại tuyến

Loader được khởi tạo tường minh bằng cùng Three instance và renderer của
engine. Pin Three r187; không đưa một bản Three thứ hai vào bundle addon.
KTX2 cần phát hiện hỗ trợ renderer và đóng gói JS/WASM transcoder cùng ứng dụng.
Mẫu hiện tại dùng Meshopt cho mesh, ETC1S cho albedo/ORM và UASTC cho normal,
có mười mip ở 512 px; PNG raw làm đối chứng, PNG 256 là bản nhẹ không cần
transcoder. Chỉ thêm Draco nếu asset thật cần. Pin encoder và kiểm SHA256.

Dùng WitnessKit.create(T, renderer) và createScope(scene). Scope sở hữu các
instance, pack lease và cancellation; gọi close khi rời cảnh. Nhiều scope có
thể dùng chung template, chỉ chủ sở hữu cuối cùng giải phóng geometry/material.
Không dispose trực tiếp texture hoặc material dùng chung từ code cảnh.

Mỗi gói có version và hash. Runtime cache phải ghi response thành công, xử
lý dung lượng và tải lỗi. Bản HTML nhẹ được phép giảm model/texture/effect,
nhưng giữ tuyến nhà, cầu thang, mái và tiến trình. Khả năng offline phải được
kiểm tra với mạng bị chặn, gồm cả decoder và tài nguyên phụ trợ.

## Nghiệm thu

Ngân sách cảnh tham chiếu: desktop 1,2 triệu tam giác, 250 draw calls và
256 MiB texture; mobile balanced 400 nghìn, 120 và 128 MiB. Đây là mục tiêu,
chưa phải số đo. Báo cáo riêng render targets, tổng bộ nhớ ước tính và frame
time; đếm các pass shadow/AO/postprocessing khi đo toàn khung hình.

Static budget test kiểm tra GLB và catalog, không xác nhận FPS hoặc bộ nhớ
GPU thực tế. Chạy model tests, browser/craft tests và graphics tests khi thay
runtime; lưu bằng chứng cùng build revision. Không ghi một cổng đạt khi còn
thiếu bất kỳ tiêu chí bắt buộc nào của cổng đó.
