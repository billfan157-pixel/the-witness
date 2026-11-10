# Nhật ký công việc nhiều bước

Giữ mục đang làm và bàn giao có ích. Không ghi chain-of-thought, transcript,
token, dữ liệu save thật hoặc mọi câu lệnh. Khi một mục hoàn tất, giữ kết quả
ngắn; nguồn chi tiết vẫn ở tài liệu sở hữu.

## 10/11/2026 — Hệ quản trị AI agent

- **Yêu cầu:** rà dự án và xây hệ skill/nguồn chuẩn, kiểm soát file và cập nhật.
- **Nguồn:** inventory, Bible/contract, pipeline, schema, gates và test hiện hành.
- **Phạm vi:** AGENTS, `.agents/skills/witness-*`, `docs/agent/`, checker/test và
  liên kết từ ba README; thêm bốn script/hook npm, ignore vùng tạm, sửa yêu cầu
  Node trong README môi trường. Giữ code game và phần phát triển có sẵn.
- **Tiêu chí:** tuyến đọc rõ, owner mỗi miền, phân biệt planned/implemented/verified,
  đăng ký file mới, phát hiện mirror/link/path sai, kiểm chứng checker cả ca lỗi.
- **Trạng thái:** hoàn tất hệ quản trị cục bộ. 17 file mới có admission; registry
  nhận diện 175 file nguồn baseline, 77 nguồn bắt buộc và hai mirror contract.
- **Kiểm chứng:** governance kiểm 741 file Git/untracked không bị ignore, 0 lỗi/
  0 cảnh báo; 11 ca hành vi checker pass trong repository tạm; bốn skill đạt
  validator chuẩn; 105 JS/CJS/MJS qua kiểm cú pháp; 35 Markdown thiết kế/môi trường
  có link file hợp lệ, 33 script entrypoint đều có nguồn. `npm test` pass sau
  pretest mới; backend baseline 24/24 pass; validator thiết kế 545 assertions pass
  sau thay đổi. `npm run prebuild` pass; chuỗi build/test gốc không bị thay đổi.
- **Giới hạn:** không chạy full build để tránh ghi đè engine/dist/SW đang có
  việc dở; không tái chạy toàn bộ browser/GPU, art review, playtest hoặc live
  deployment. Checker chỉ là cổng cục bộ, có thể bỏ qua khi gọi script trực tiếp.
- **Bảo toàn:** hash baseline của 99 file thay đổi sẵn được đối chiếu. Các sửa
  có chủ đích trên file baseline chỉ là `.gitignore`, `package.json` và hai
  README miền; không có thay đổi ngoài dự kiến trên nguồn game/asset/dist.
- **Còn mở:** A01–A07 ngoài phạm vi sửa runtime/art/deploy của tác vụ này.

## 10/11/2026 — Dọn kho cũ, tính cả nhánh và việc chưa commit

- **Yêu cầu:** thực sự dọn file không còn giá trị/sai/lỗi thời, tính cả các
  nhánh/checkouts và thay đổi chưa commit hay nhập main.
- **Đối chiếu:** fetch origin; nhánh codex/q01-phase-b-environment và main cùng
  ac01bcc, không có commit riêng, một worktree đăng ký, không có stash. Đã rà
  sáu checkout Sites, giữ nguyên hai checkout bẩn. Không có file nguồn mới duy
  nhất cần chép từ đó; bản Phase B khác main chủ yếu do phần Q03 đã thêm ở main.
- **Thực hiện:** dọn 208 file tracked sạch bằng Git có kiểm tra; archive ba tài
  liệu lịch sử; chuyển hai test contract sang docs, bỏ hai JSON root trùng.
  Dựng lại cloud output để loại tiếp 28 bản reader cũ không tracked. Sổ
  cleanup-record.json ghi từng file, lý do, SHA256 và Git object để phục hồi.
- **Ngăn tái diễn:** ignore export có thể tạo lại; checker kiểm nguồn đã nghỉ;
  build dọn đúng vùng sinh, từ chối junction và reader lệch hash. Không sửa hay
  xóa bản lưu, migration, nguồn art, candidate Q01/Q03 hoặc evidence chính thức.
- **Kiểm chứng:** npm test pass; backend 24/24; design validator 545 assertions;
  governance 13 ca; output pipeline 8 ca. Full npm build trong staging từ nguồn
  hiện tại pass, revision b7de9c43268f; file tồn dư giả lập bị loại và Worker/
  client/standalone được tạo. Cloud packaging cục bộ pass. Chưa deploy/live test.
- **Kết quả cuối:** 236 file dư/cũ đã loại bỏ (208 tracked, 28 bản client bị
  ignore), giảm 169.849.337 byte trong cây làm việc; ba tài liệu archive giữ lại.
  Không có đường đã nghỉ còn tồn tại, không có link Markdown hỏng hoặc sửa
  ngoài dự kiến trên nguồn cũ. Thư mục staging tạm đã xóa sau kiểm chứng.
- **Trạng thái:** hoàn tất cục bộ, giữ các thay đổi chưa commit ngoài phạm vi
  dọn; index để trống như ban đầu. Không commit, merge hoặc push trong tác vụ này.

## 10/11/2026 — Chốt toàn bộ thay đổi lên GitHub

- **Ủy quyền:** người dùng yêu cầu commit và push tất cả thay đổi của dự án.
- **Phạm vi candidate:** nguồn Q01 Phase B/GI, công việc Q03 và truyện v6 đang
  dở, tài liệu/skill quản trị, đợt dọn kho và bản sinh được dựng lại từ cùng nguồn.
  Các giới hạn A01/A02/A04/A05/A07 vẫn giữ, không nhận là đã nghiệm thu art/v6.
- **Kiểm chứng:** build thực trong repository pass, revision b7de9c43268f;
  governance 13 ca và pipeline output 8 ca pass. Campaign, backend 24 ca và
  validator thiết kế 545 assertions đã pass ở vòng kiểm trước, cùng nguồn code.
- **Phát hành:** đợt này chốt mã nguồn lên GitHub main; không thực hiện deploy
  hoặc chứng nhận trạng thái production. File bị ignore là đầu ra tạm/cục bộ,
  không được ép thêm vào commit.
