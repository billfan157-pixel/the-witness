# Backend, tài khoản và bản lưu đám mây — 0.7.0

## Phạm vi triển khai

Bản trước là game tĩnh, dùng localStorage, bản dự phòng trên trình duyệt và xuất/nhập JSON. Bản 0.7.0 chuyển Site hiện có sang Cloudflare Worker + D1, giữ nguyên trò chơi một người chơi và bản HTML ngoại tuyến. Người có đường dẫn có thể chơi khách. Đăng nhập bằng ChatGPT để sử dụng dữ liệu riêng theo tài khoản và tiếp tục trên thiết bị khác.

Không tạo mật khẩu, OAuth hay cookie xác thực riêng. Sites xử lý đăng nhập ở cấp nền tảng và chuyển ID ổn định theo từng Site vào Worker. Tên hiển thị là tùy chọn, không lưu email. Trạng thái phiên được đọc qua `/api/session`; mọi API dữ liệu yêu cầu ID từ cổng xác thực trùng với `X-Witness-Account` của phiên đang mở. Header đối chiếu này ngăn dữ liệu của người A gửi nhầm vào tài khoản B sau khi đổi tài khoản trong một tab khác; nó không thay cho danh tính do cổng xác thực cung cấp.

## Mô hình dữ liệu và quyền sở hữu

| Bảng | Vai trò |
| --- | --- |
| `players` | ID tài khoản, tên hiển thị, ngày tạo/cập nhật |
| `game_saves` | Bản hiện tại của 3 ô, khóa chính `(user_id, slot)` |
| `save_revisions` | Snapshot bất biến, phiên bản, mã thao tác và SHA-256 |
| `save_audit` | Nhật ký save/delete có giới hạn 200 dòng/tài khoản; không chứa payload |
| `write_limits` | Giới hạn ghi dùng chung giữa các Worker, không phụ thuộc bộ nhớ isolate |

Mọi truy vấn dữ liệu có điều kiện chủ sở hữu từ danh tính đã xác thực, dùng prepared statements. Không lấy chủ sở hữu từ URL hay JSON. Xóa tài khoản cascade toàn bộ bảng phụ thuộc của đúng người đó. Không có endpoint đọc dữ liệu toàn bộ người chơi.

Mỗi ô giữ 10 phiên bản gần nhất cộng bản cuối mỗi ngày trong 14 ngày UTC. Các bản hằng ngày được giữ từ chính các phiên bản đã commit; không cần mở game đúng nửa đêm. Thao tác xóa ô tạo tombstone và tăng revision, nên thiết bị cũ không được tạo lại bằng revision 0. Khôi phục bản cũ tạo một revision mới; không sửa lịch sử cũ. Dung lượng mỗi trạng thái tối đa 512 KiB; tối đa 90 yêu cầu ghi/tài khoản/phút. Đọc và chơi ngoại tuyến tiếp tục hoạt động nếu ghi bị giới hạn.

## Quy trình lưu và đồng bộ

1. Game ghi bản trên máy và bản dự phòng như trước, vào namespace riêng cho từng tài khoản và ô lưu. Bản chơi khách được giữ riêng, chỉ chuyển vào tài khoản qua thao tác rõ ràng.
2. Client chuẩn hóa trạng thái bằng `WitnessModel.restore`, bỏ qua thay đổi chỉ ở `lastSaved` khi quyết định có cần gửi, và giữ hàng đợi bền vững trên trình duyệt theo từng tab.
3. Một request có `baseRevision`, `clientId`, `mutationId` và toàn bộ trạng thái. Request đang gửi được ghi xuống máy trước khi kết nối mạng. Thay đổi mới trong lúc gửi được xếp sau request này.
4. Worker kiểm tra tài khoản, Origin, đánh dấu client, JSON/dung lượng/độ sâu/khóa nguy hiểm, schema tiến trình và giới hạn ghi. Máy chủ dùng giờ máy chủ, tự tạo digest và metadata.
5. CAS cập nhật bản hiện tại khi revision khớp. Ghi bản hiện tại, lịch sử, audit và dọn lịch sử nằm trong một D1 batch transaction. Replay cùng mutationId và payload trả lại kết quả đã commit; retry không tạo tiến trình trùng.
6. Sau khi nhận xác nhận, client cập nhật revision và xóa request đã hoàn tất. Chỉ hiện “Đã lưu đám mây” khi mọi thay đổi hiện tại đã được xác nhận. Gửi lúc đóng tab là best effort; outbox vẫn còn để thử lại sau.
7. Nếu revision không khớp, dừng tự ghi và giữ cả hai bản. Người chơi chọn bản đám mây hoặc xác nhận thay bằng bản trên máy. Không dùng thời gian máy khách để tự chọn bản thắng.

Hai tab trên cùng máy giữ outbox riêng và revision gốc của từng bản chờ. Đồng bộ không dùng revision mới của tab khác để âm thầm ghi đè. Khởi động lại trình duyệt, mất xác nhận HTTP hoặc đổi tài khoản đều được kiểm thử.

## API v1

| Endpoint | Thao tác |
| --- | --- |
| `GET /api/health` | Kiểm tra binding, schema database và tính sẵn sàng |
| `GET /api/session` | Danh tính hiện tại, đường dẫn đăng nhập/đăng xuất và giới hạn |
| `GET/PUT /api/account` | Các ô lưu và tên hiển thị của chính tài khoản |
| `GET /api/account/export` | Xuất JSON các bản lưu và lịch sử còn giữ |
| `DELETE /api/account` | Xóa dữ liệu của chính tài khoản, yêu cầu `confirm: "XOA"` |
| `GET/PUT/DELETE /api/saves/{1..3}` | Đọc, lưu theo CAS hoặc tạo tombstone |
| `GET /api/saves/{slot}/history` | Danh sách phiên bản và bản ngày còn giữ |
| `GET /api/saves/{slot}/history/{revision}` | Snapshot đã kiểm digest để khôi phục |

API không được Service Worker cache. Trả `Cache-Control: private, no-store`, không mở CORS, kèm request ID để tra sự cố. Log máy chủ chỉ chứa mã request, route, thời gian và loại lỗi; không log ID, save JSON, email, cookie hoặc token. Giới hạn ghi trả HTTP 429 và Retry-After. Client giữ dữ liệu khi gặp lỗi 401, 409, 413, 422, lỗi mạng hoặc lỗi dịch vụ.

## Chạy và vận hành

`npm ci` cài phiên bản khóa trong lockfile. Dùng Node 22.13+; môi trường thực thi phát triển hiện tại là Node 24. `npm run dev:cloud` mở `http://127.0.0.1:8035` với Miniflare D1 bền vững trong `.witness-runtime/d1`. Trên loopback có đăng nhập demo `local_player_one`, hoàn toàn tách khỏi xác thực của bản thật. Server phát triển loại bỏ header danh tính do trình duyệt tự gửi. Bộ giả lập đăng nhập chỉ có trong công cụ phát triển, không được đưa vào Worker hay client.

`npm run test:backend` kiểm Worker thật trên workerd/D1 và state machine client; `npm test` kiểm luật campaign; `npm run build` dựng bản ngoại tuyến, client và Worker. `db/schema.ts` là nguồn schema. Dùng `npm run db:generate` để thêm migration; không sửa migration đã áp dụng. Migrations và metadata nằm ở `drizzle/` và được đóng gói vào `dist/.openai/drizzle`. Sites cấp binding DB và áp dụng migration trước khi triển khai Worker.

Theo dõi `/api/health`, request ID và Worker logs để chẩn đoán gián đoạn. Khi một save hỏng digest, tải phiên bản lịch sử và khôi phục qua giao diện, không sửa JSON trực tiếp. Trước một thay đổi dữ liệu lớn, xuất dữ liệu cần bảo vệ. Nếu rollback code, dùng bản Worker vẫn tương thích schema; không rollback về bản static làm mất đường truy cập lưu đám mây. Migration cộng thêm phải tương thích bản code trước trong cùng đợt triển khai.

D1 có cơ chế Time Travel ở cấp nhà cung cấp. Thời gian khôi phục phụ thuộc gói hosting (Cloudflare công bố 7 ngày cho Free, 30 ngày cho Paid). Quyền quản trị database và quy trình phục hồi toàn database do bên vận hành Sites kiểm soát; chưa thực hiện diễn tập phục hồi database production. Các snapshot trong game giúp khôi phục từng người chơi và không thay thế backup độc lập của nhà cung cấp. Xóa tài khoản không làm hết hạn ngay lập tức các backup phục hồi sự cố do nhà cung cấp quản lý.

Tài liệu nền: [D1 batch và tính giao dịch](https://developers.cloudflare.com/d1/worker-api/d1-database/), [Worker static assets](https://developers.cloudflare.com/workers/static-assets/binding/), [D1 Time Travel và backup](https://developers.cloudflare.com/d1/reference/time-travel/).

## Tiêu chí phát hành và giới hạn

Phải kiểm tra quyền sở hữu, CAS đồng thời, retry mất ACK, offline/reload, đổi tài khoản/tab, giới hạn ghi/dung lượng, khôi phục lịch sử, cascade xóa và khởi động lại Worker. Tiếp theo phải xác nhận deployment thành công, DB/schema thật hiện hữu, health thật trả 200 và truy cập ẩn danh đúng chính sách công khai. Không dùng một lần build hay một vòng test cục bộ để chứng nhận production.

Đây là backend cho trải nghiệm một người chơi hiện tại. Máy chủ xác thực cấu trúc và quy tắc phục hồi tiến trình, nhưng nguồn tương tác game vẫn ở client; không xem snapshot này là bằng chứng chống gian lận cho kinh tế tiền thật hoặc thi đấu xếp hạng. Chưa đo tải đồng thời ở quy mô thương mại, SLA, khả năng phục hồi cả vùng, hoặc dùng nhiều thiết bị vật lý. Kiểm thử tự động, preview cục bộ và xác nhận triển khai được báo riêng theo bằng chứng thực tế. Không có yêu cầu thanh toán hay chơi nhiều người trong phạm vi này.
