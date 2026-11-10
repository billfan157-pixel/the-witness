# THE WITNESS — AI agent

1. Xem `git status --short`, giữ thay đổi có sẵn và chọn **một skill** dưới đây.
2. Đọc [STATUS](docs/STATUS.md), rồi nguồn được skill dẫn trực tiếp. Không nạp
   toàn bộ Bible. [docs/README](docs/README.md) giải thích quyền sở hữu khi cần.

| Công việc | Quy trình |
| --- | --- |
| Sửa lỗi, code, tổ chức nguồn | [witness-change](.agents/skills/witness-change/SKILL.md) |
| Truyện, quest, Kinh Thánh, ID/contract | [witness-content](.agents/skills/witness-content/SKILL.md) |
| Cảnh 3D, renderer, asset, âm thanh | [witness-environment](.agents/skills/witness-environment/SKILL.md) |
| Build, kiểm candidate, push/deploy được giao | [witness-release](.agents/skills/witness-release/SKILL.md) |

Lấy tuyến đọc bằng `npm run agent:context -- <change|content|environment|release>`.
Quy trình sửa/kiểm/file/cập nhật sở hữu duy nhất tại [OPERATIONS](docs/OPERATIONS.md).
Bất biến sản phẩm tại [PRODUCT](docs/PRODUCT.md); skill không chép lại các luật đó.

Không reset/clean/ghi đè phần việc khác; không sửa bản sinh để né producer.
Không tự nâng schema/ID, canon, art gate hoặc trạng thái deploy. Contract chỉ ở
`docs/the-witness/`; archive/output không là nguồn điều hành. File mới phải có
owner/reason trong registry; nguồn đã nghỉ không được tái tạo để cứu caller cũ.
Chạy `npm run check:agents` và checks của miền; cập nhật đúng nguồn trong cùng
thay đổi. Không tự push/deploy nếu phạm vi hiện tại chưa cho phép.
