# 09 • Sản xuất và hợp đồng triển khai v3

## 1. Thiết kế và bản chơi

V3 đổi cấu trúc theo quyết định Legends làm trục. Bản THE WITNESS 0.1.0 trong thư mục dự án này vẫn theo v2, gồm cơ chế Legends cũ; game Hành Trình Lời Chúa là sản phẩm riêng ở thư mục anh em `../hanh-trinh-loi-chua/`. Đợt hồ sơ này không sửa save, cache, runtime hoặc triển khai website. Kiểm 0.1.0 không chứng minh gate/level/thời lượng v3 đã chạy.

Browser phù hợp thử truyện/state; ứng viên 3D sản xuất chỉ chốt sau cùng blockout, máy tham chiếu và thời gian iteration được đo. S21 mô tả World Partition của Unreal, không chứng minh đội hiện tại nên chọn engine ấy. Chưa cài/chuyển engine hay cam kết chất lượng AAA.

## 2. Thứ tự giao việc

| Thứ tự | Đầu ra | Phụ thuộc | Tiêu chí nhận |
|---|---|---|---|
| P0.1 | Pitch/bất biến hồ sơ 13 | Quyết định chủ dự án | Bible là truyện chính, cổng/định dạng rõ |
| P0.2 | Contract v3, ID/beat/gate/format | P0.1 | Không đường bỏ trắng nguồn để kết |
| P0.3 | Sáu packet, vị trí duyệt | P0.2 | Source, [H/C], khoảng mở, phạm vi ký |
| P0.4 | Greybox slice L01 27 phút + cầu nối | P0.2–3 | Ma trận hồ sơ 07, namespace riêng |
| P0.5 | Thử 12 người, hỏi mở trước | P0.4 | Số thật, không đánh đồng gate với cảm giác lõi |
| P1.1 | L01 đủ 80 phút dự kiến | Tín hiệu slice, sửa/duyệt | Đo thám hiểm, thời lượng, chi phí |
| P1.2 | Greybox L02/L04 + Q07/Q11 | P1.1 và packet | Động từ/không gian mỗi chương khác nhau |
| P2 | 12 cầu nối và nhánh tự chọn | Ba trục khả thi | Budget/nguồn/owner thật |

Hiện chưa có người nhận vai sản xuất hoặc estimate ngày công đã đo. Trong đợt v3 hiện tại P0.1–3 là đầu ra hồ sơ; P0.4 trở đi chưa triển khai. Không điền tên giả hoặc tính tài liệu như gameplay đã hoàn thành.

## 3. Miền dữ liệu và quyền ghi

`sourceRegistry` giữ căn cứ; `canonicalScenes` giữ lock/beat; `legendProgress` giữ phần trình bày; `campaignProgress` kiểm gate; `worldState` giữ vật chất; `knowledge` giữ ai biết gì; `consent` giữ scope; `presentation` giữ format/hỗ trợ. Tên hiển thị không làm khóa. Revision nguồn tách với version save.

Legends xuất receipt beat/kết, reducer campaign cấp quyền đi tiếp. Chúng không viết evidence, inventory Mortal, consent, guilt hoặc relationships. `unlockedBridgeContext` mở ngữ cảnh có thể nói, không truyền tri thức vào NPC. `ReflectionShared` mới chia sẻ nội dung avatar chọn. Veil chỉ ghi trải nghiệm/phản tư, không mở cổng nguồn.

| Cổng | Điều kiện đời thường | Nguồn cần đủ | Mở |
|---|---|---|---|
| GATE.L01 | Q03 committed | L01 B01–B06, revision 3.0.0, xác nhận kết | Q04 |
| GATE.L02 | Q06 committed và cổng trước | L02 B01–B05, cùng quy tắc | Q07 |
| GATE.L04 | Q10 committed và cổng trước | L04 B01–B05, cùng quy tắc | Q11 |

Transaction: kiểm Q trước → receipt đúng thứ tự/revision → phần kết → `LegendCommitted` có idempotency → mở Q kế → autosave. Ngắt trước commit giữ checkpoint bền và cổng chưa mở; sau commit load không phát lần hai. Replay tách snapshot, không gọi reducer ghi campaign.

Receipt có legend/beat/revision/format/scene hoặc summaryPage và thứ tự trình bày. Tóm tắt có transcript/điều hướng/nút kết, không quiz hay tối thiểu giây. Ghi đã trình bày không chứng minh người chơi hiểu/đồng ý. Đổi format giữ thứ tự core, không biến chọn format thành completion. Q commit và L commit là hai transaction, không cái nào tự làm hành động của cái còn lại.

## 4. Save và di trú

Đề xuất save/progression schema **2**, document v3.0, core revision 3.0.0, namespace `the-witness-spine-v3`. Bản 0.1.0 vẫn schema 1; chưa có migration thực thi. Xuất/sao lưu trước, đọc version rồi sao sang namespace mới, giữ nguồn cũ.

Giữ settings, lựa chọn Mortal, tài nguyên, consent và lịch sử cũ. Boolean `legend.completed` không có core receipt nên vào lịch sử legacy, mốc v3 là `needs_revisit`. Save đã đi xa tiếp nhận chương thiếu theo thứ tự tại điểm an toàn, không lùi/xóa hành động Mortal. Chặn xác nhận kết campaign v3 đến khi đủ ba mốc. Không bắt bỏ save chỉ vì đổi thiết kế.

Sửa source quan trọng cần bảng beat nào còn hợp lệ; không tự xóa tất cả. Chính tả/format không buộc chơi lại; thay ý nghĩa phải mở lại phạm vi duyệt và chốt migration. Không áp schema mới vào game cũ chỉ bằng thay JSON.

## 5. Pipeline nguồn

Đầu vào [hồ sơ 15](15-source-world-packets.md), R01–R07 chưa phân công. Đọc nguồn/context → lock/beat → greybox có nhãn → duyệt → sửa → khóa lời/asset đúng phạm vi → thu âm/animation → QA. Được dựng hình khối nội bộ trước duyệt; chưa khóa tạo hình/lời nguồn hoặc phát hành như bản thẩm định.

Khóa chữ cần R01/R02/R04/R05; art lịch sử cần R01/R03/R05; trải nghiệm/gate cần R06/R07 và thử người chơi. Tóm tắt giữ cùng revision/coverage và tiêu chuẩn duyệt văn cảnh. Xem được trang nguồn không đồng nghĩa được dùng ảnh/chữ/âm trong game. Chưa có bản Việt/quyền cuối.

## 6. Cổng sản xuất

**G0 — Hồ sơ dựng được:** source/beat/scene/format/gate truy được, budget đúng, bible hết blanket skip. Validator tài liệu kiểm cấu trúc này; không xác nhận sáng tạo hay chuyên môn.

**G1 — Slice:** hồ sơ 07, 90 phút, namespace riêng. Thử 12 người; C1/C3 ≥9/12, E1 ≥6/8 tương tác, G1 ≥10/12, F1 ≥3/4 tóm tắt; không mở cổng sai hoặc thiếu beat. Lưu câu trả lời, bỏ dở/hỗ trợ, báo hai format riêng. Chưa có kết quả. Một câu “Legends là lõi” do prompt không đủ chứng minh.

**G2 — L01 đủ độ dài:** 80 phút dự kiến với hai đường có ích; active exploration mục tiêu 60 phút, source/summary được duyệt, kiểm load/switch/abort/replay/tiếp cận trong build. Đo chi phí mỗi phút và cảnh nước/nhóm trên máy tham chiếu. Không hứa FPS trước đo.

**G3 — Ba chương trục:** L02/L04 khác ngữ pháp, ba chuỗi cổng chơi thông. Tuyến chuẩn đo Legends khoảng 27–33% first traversal, tóm tắt báo riêng. Lệch thì sửa budget/scene. Chỉ mở rộng khi có đội/ngân sách thật.

**G4–G7:** production, alpha đủ tuyến, beta tiếp cận/quyền, phát hành sau kiểm build/triển khai. Hồ sơ không tự qua các cổng này.

## 7. Ma trận chặn lỗi

| Rủi ro | Ca kiểm | Hành vi cần có |
|---|---|---|
| Bỏ trắng nguồn | Tóm tắt rồi đóng/thoát B01 | Gate còn thiếu, resume rõ |
| Format khác | Interactive/summary/mixed, reflection null | Cùng gate/cơ hội, không đo đức tin |
| Beat thiếu/lộn/revision cũ | Record không hợp lệ | Từ chối commit, chỉ phần cần tiếp |
| Trộn lớp | L/V định ghi evidence/consent/inventory | Từ chối, báo nội bộ; không tạo nguồn |
| Commit lặp | Replay/load/bấm đôi | Idempotency, không tăng tài nguyên |
| Thiếu Q trước | Đủ L nhưng Q chưa commit | Chưa cấp Q kế |
| Save cũ | Completed boolean không receipt | Legacy history, needs_revisit, giữ save |
| Người kể vắng | Không Natan/Damar/Miriam | Journal thay, không khóa nguồn |
| Tiếp cận | Không âm/chữ lớn/không mash, auto-traverse | Cùng nội dung/cơ hội |
| Tri thức NPC | Phản tư chưa chia sẻ | NPC không biết câu riêng |

Thử từng cổng với mọi route Q trước và hai format/mixed; Q06 và Q10 đều ba route. QA claim/consent và ca hồ sơ 12 vẫn cần chạy. Validator độc lập là mô hình kiểm đặc tả, không chứng minh UI/runtime thực thi đúng.

## 8. Chi phí và giới hạn

Giữ 3 hub/4 companion/12 Q/6 B/5 L/4 V. Set-piece ưu tiên ba Legends. Nếu 80/70/66 phút thiếu thám hiểm đáng làm, sửa ngân sách thật và pitch, không padding. L03/L05/Veil/cinematic kho là phạm vi giảm trước. Nhánh thêm nơi/người phải có phương án bù phạm vi.

Ước tính bằng ngày công bộ môn + quyền/công cụ/outsource + QA/bản địa hóa + quản lý/dự phòng từ đo thật. Chưa owner/quote nên chưa ghi tiền hay ngày ship giả. Tên THE WITNESS là tên làm việc có rủi ro nhận diện S19, chưa có kết luận pháp lý/thương mại.

**Đầu ra v3:** Markdown, hai contract, pitch một trang, reader HTML, ZIP và báo cáo kiểm tài liệu. Các đầu ra làm thiết kế review được; chưa đưa cơ chế mới vào game đang chơi.
