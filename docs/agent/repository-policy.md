# Chính sách file và tài nguyên

Mục đích: một file có nơi ở, consumer/chủ sở hữu và vòng đời rõ. Quy tắc này
không ra lệnh dọn kho cũ hàng loạt; các ngoại lệ hiện hữu được ghi trong registry.

## Nơi đặt file

| Vị trí | Dùng cho | Quy tắc thêm mới |
| --- | --- | --- |
| Gốc | Entry/runtime/config hiện hành, AGENTS và README | Ưu tiên module đang có; file mới cần lý do trong `admissions` của registry |
| `.agents/skills/<name>/SKILL.md` | Quy trình agent riêng cho dự án | Đặt tên `witness-*`, có name/description; trỏ tới nguồn hiện có, không nhân đôi Bible |
| `docs/agent/` | Quản trị, bản đồ, trạng thái và quyết định | Cập nhật tài liệu sở hữu trước; không thêm report/plan cho mỗi tác vụ |
| `docs/archive/` | Nghiên cứu/mốc cũ còn giá trị lịch sử | Gắn nhãn không phải nguồn hiện hành; giữ đường phục hồi trong cleanup-record |
| `docs/the-witness/` | Thiết kế, canon, truyện, contracts | Giữ ID tài liệu hiện tại, không đánh số tiếp chỉ để có file mới |
| `docs/environment-kit/` | Chuẩn sản xuất, research, catalog, gate | Dùng hồ sơ cảnh/phase hiện có; evidence chính thức ở validation |
| `tools/`, `test/` | Công cụ tái sử dụng, kiểm thử có ý nghĩa | Tách helper khi có consumer thật; probe một lần vào vùng tạm |
| `assets/` | Asset dùng bởi runtime/pipeline | Đăng ký catalog/ART-CREDITS và ledger nguồn, license, provenance; raw/intermediate theo pipeline hiện có |
| `vendor/` | Thư viện pin, bundle và tùy biến runtime cũ | Đọc architecture, không tự tải hay thay engine thứ hai |
| `db/`, `drizzle/`, `server/`, `.openai/` | Dữ liệu, migration, backend, hosting | Theo nguồn schema và release workflow; không chứa khóa bí mật |
| `outputs/`, `test/artifacts/` | Sản phẩm xuất và bằng chứng tác vụ | Dùng bucket của miền có sẵn; tạm mới đặt trong `outputs/agent-work/<slug>/` đã ignore |

`registry.json` sở hữu allowlist nguồn hiện hữu (`knownFiles`), root files,
path groups, tài liệu/skill bắt buộc và liên kết tới sổ file đã nghỉ. Nó là dữ liệu quản trị,
không phải manifest build hoặc danh mục asset thay thế.

## Trước khi tạo một file nguồn

1. Tìm consumer và file tương tự bằng `rg`; xác định vì sao sửa file cũ chưa đủ.
2. Chọn group và owner hiện hữu. Không tạo folder root, cây project song song,
   hoặc file `new/final/fixed/backup` cạnh bản đang dùng.
3. Thêm vào `admissions` của registry với `path`, `owner`, `reason`. File root
   mới cũng cần vào `rootFiles`. Không tự thêm vào `knownFiles` để lách lý do;
   danh sách đó là baseline audit. File chưa tồn tại không đăng ký trước.
4. Cập nhật caller/build nếu là runtime, nguồn sở hữu và test liên quan.
5. Chạy checker; báo file mới và vai trò trong bàn giao.

Assets, generated outputs và evidence theo các group riêng không cần kê từng
file vào admissions, nhưng vẫn phải theo catalog/ledger và producer. Checker chỉ
kiểm vị trí của các file đó; không xác thực license, nội dung ảnh hoặc chất lượng.

## Vòng đời và dọn dẹp

- Nguồn bền vững: theo dõi bằng Git và giữ một nơi biên tập. Giữ lockfile khi
  đổi dependency. Không sao chép nguồn sang output để sửa độc lập.
- Bản sinh: tái tạo bằng producer và kiểm diff/hash; chỉ đưa artifact vào commit
  khi phạm vi phát hành/repository cần nó. Hiện dist và outputs đã có file tracked;
  ignore không ngừng theo dõi chúng. Không tự chạy `git rm --cached` hàng loạt.
- Tạm: dùng thư mục tạm hệ điều hành hoặc `outputs/agent-work/<slug>/`, không
  commit mặc định. Chỉ xóa đường dẫn tuyệt đối đã xác nhận thuộc việc mình.
- Evidence cần giữ: chọn report/ảnh có giá trị tái hiện, ghi build/hash/môi trường
  và giới hạn trong hồ sơ miền; không commit mọi trace/frame hoặc dữ liệu người chơi.
- Trước khi xóa/di chuyển: tra `rg`, script build, manifest, link và consumer
  của path; kiểm save/migration/license. Thay đổi lớn phải có kế hoạch chuyển
  consumer và phục hồi; không dùng xóa như cách che lỗi validation.

## Cơ chế kiểm soát thực tế

`node tools/check-agent-governance.cjs` chạy read-only: đối chiếu file Git đang
tracked và untracked không bị ignore, root/group, admissions, link của bộ quản trị,
skill frontmatter, nguồn bắt buộc và sổ file đã nghỉ. Nó không tự đăng ký,
tạo/xóa file, sửa gameplay hoặc tự khẳng định tài liệu đúng ngữ nghĩa.

Đây là cổng kiểm tra cục bộ: `pretest` và `prebuild` chạy checker trước lệnh npm
chuẩn. Lệnh Node gọi thẳng có thể bỏ qua hook; chưa có CI bắt buộc trên remote.
File bị ignore không được kiểm kê trừ các file quản trị bắt buộc. Chưa có chặn
ghi file ở cấp hệ điều hành. Không được báo hệ thống có enforcement tuyệt đối.

Sau đợt dọn 10/11, hai contract root đã nghỉ; consumer đọc nguồn trong docs.
Sổ cleanup lưu Git object từng file; checker chặn tái tạo nguồn đã nghỉ và kiểm
đường archive. Export có thể sinh lại không bị coi là nguồn đã nghỉ vĩnh viễn.
