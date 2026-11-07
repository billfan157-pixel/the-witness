# 09 • Sản xuất và kiến trúc hệ thống

## 1. Hiện trạng đã quan sát

Workspace `C:\hanh-trinh-loi-chua` chứa bản browser/offline hiện có: `story-data.js`, các module `expedition-*`, `adventure-3d.js`, `character-*`, `ban-choi-ngoai-tuyen.html`, tài liệu R&D và nghiên cứu nhân vật. Đọc mẫu `expedition-world.js` cho thấy cơ chế nối dấu lựa chọn giữa chặng. Chưa audit toàn bộ mã, chưa chạy lại game hoặc test trong đợt tài liệu này; không suy ra chất lượng hiện tại từ tên file.

`LOI-TRINH-RD.md` đặt nguyên tắc giữ dữ liệu Kinh Thánh riêng và sáng tác ở tầng minh họa. Hướng mới tiếp tục mục tiêu phân biệt ấy, nhưng bổ sung canon lock, scene source và nhãn Veil. Không dùng việc bảo vệ một file như thay thế cho việc duyệt ý nghĩa toàn scene.

Nghiên cứu tạo hình cũ có phân tầng văn bản/khảo cổ/nghệ thuật, có thể tái sử dụng phương pháp. Những niên đại hoặc phong tục cụ thể trong tài liệu cũ chưa được mặc định là đã xác minh cho THE WITNESS.

## 2. Hai tuyến công nghệ

**Browser prototype:** giữ nguyên bản cũ như baseline; dựng thử state, dialogue và cách chuyển tầng bằng asset rẻ, đo dễ hiểu và sức nặng lựa chọn. Không bắt prototype web chứng minh chất lượng đồ họa AAA.

**3D production candidate:** Unreal Engine là ứng viên vì có hệ thống quản lý/streaming thế giới như World Partition [S21]. Đây là thông tin tính năng, không chứng minh phù hợp đội hiện tại. Godot/Unity hay công nghệ khác chỉ so sánh khi có ràng buộc nhân sự, thiết bị và pipeline thật; chưa có quyết định chuyển engine hoặc cài đặt.

Bài spike trước chốt: cùng blockout slice, 1 companion, đối thoại có điều kiện, lưu/khôi phục và một chuyển tầng. So thời gian iteration, độ ổn định save, pipeline nội dung và frame-time trên **một cấu hình tham chiếu được ghi rõ**. Không gọi “chạy 60 FPS” khi chưa có máy, độ phân giải và cảnh thử.

## 3. Kiến trúc dữ liệu

Tách 6 miền: `sourceRegistry`, `canonicalScenes`, `fictionalQuests`, `worldState`, `relationships`, `presentation`. Tất cả dùng ID bền, không dùng tên dịch làm khóa. Hệ thống thoại đọc điều kiện nhưng không tự sửa nguồn canon. Renderer không tự suy tội trạng từ màu đèn hoặc metric gameplay.

Event mẫu: `EvidenceObserved`, `StatementRecorded`, `ConsentChanged`, `PromiseMade`, `PromiseKept`, `PlanStarted`, `PlanCompleted`, `LegendCompleted`, `VeilCompleted`, `ReflectionShared`. Lưu payload tối thiểu: ID sự kiện, quest, nhân vật, nguồn, revision, thời điểm logic, dữ liệu. Một event “đã nghe nói” không nâng chứng cứ thành “đã thấy”.

Trạng thái Q02 theo hợp đồng JSON đi kèm. Hoàn thành kế hoạch là transaction: kiểm điều kiện → tạo snapshot → chạy phần chơi → commit kết quả → áp callback → autosave. Nếu quit giữa đoạn, dùng checkpoint kế hoạch với NPC đã spawn đúng vai trò; không commit một nửa đồng thuận.

Canon scene chạy trong sandbox: nhập `sceneId`, cài đặt tiếp cận và trạng thái xem lại; xuất completion và lựa chọn giao diện hợp lệ. Không ghi trạng thái kiểu `saul.dead=true`. Veil chỉ xuất completion/reflection; schema chặn `evidence.*`, inventory và phán quyết đạo đức. Đây là yêu cầu để triển khai, chưa phải code đã thực hiện.

## 4. Save và di trú

Save mới có `schemaVersion`, `contentVersion`, `campaignId`, `worldState`, `questStates`, `companions`, `legendProgress`, `veilProgress`, `settings`. Namespace THE WITNESS tách khỏi save game cũ. Trước di trú đọc phiên bản, sao lưu, cho preview phần mang sang; không ghi đè save cũ khi chỉ mở game mới.

Không mang XP cũ sang thành điểm năng lực một cách máy móc. Có thể ghi nhận tiến độ đọc/chặng cũ như huy hiệu lưu niệm không tác động cân bằng; cần chốt chính sách sau audit save. Quyết định của một avatar đi qua nhiều thời đại cũ không được đưa nguyên thành tiểu sử của người sống 58–60 CN. Cần lệnh xuất/nhập và bản dự phòng dễ tìm; chưa thực hiện đổi cache/service-worker.

## 5. Pipeline nội dung

**Quest:** brief → sơ đồ điều kiện → blockout với lời tạm → thử lối cơ bản và lối hỏng → duyệt nguồn → viết thoại → blocking → thu âm → QA nhánh. Không motion capture trước khi khóa điều kiện và nhiệm vụ.

**Nguồn:** biên kịch gắn nguồn → chuyên gia Kinh Thánh duyệt điều bất biến → lịch sử/khảo cổ duyệt phần tái dựng → art ghi diễn giải → production kiểm quyền ảnh/chữ/âm → khóa revision. Quyền tác giả và độ xác thực là hai trường khác nhau.

**Cinematic:** ba mức: hội thoại hệ thống; cảnh có blocking và camera chuẩn bị; set-piece thủ công. Dùng mức cao cho điểm chuyển không thể truyền đạt tốt bằng mức thấp. Bài giới thiệu GDC của Larian chỉ được dùng như tham chiếu về bài toán pipeline, không là dự toán nhân lực [S15].

## 6. Cổng chất lượng

### G0 — Hồ sơ thiết kế nền

Đầu ra là bộ hiện tại: luận đề, GDD, bible, campaign, script mẫu, nguồn và hợp đồng dữ liệu. **Tình trạng v2:** đã bổ sung scene/route cho 12 chương, truth/knowledge/claim và quan hệ/callback; còn các cổng chuyên gia và chưa qua G1. Tiêu chí qua G0: không mâu thuẫn nội bộ về số lượng/nhánh, mỗi scene Kinh Thánh có nguồn và canon lock, [H] được đánh dấu.

### G1 — Prototype giấy và narrative greybox

Chỉ Q02, L03, V01; asset hình khối, không làm đủ 3 vùng. Mục tiêu vòng 1: 8–12 người chơi trưởng thành tự nguyện, có nhóm biết và chưa biết Kinh Thánh; số này cho phát hiện lỗi định tính, không đại diện thị trường. Ghi cỡ mẫu và số đếm thật, không chỉ phần trăm.

Ngưỡng thiết kế đề xuất: ít nhất 8/10 người thử khi cỡ mẫu 10 phân biệt Veil/Legends không được gợi đáp án; ít nhất 7/10 nêu được đánh đổi chính; không ai bị khóa tiến độ do thiếu kỹ năng bắt buộc; đa số tìm được hai nguồn trong 15 phút với gợi ý mặc định. Ngưỡng chưa đạt không được đổi câu hỏi để số đẹp; sửa scene và thử lại với người mới.

### G2 — Vertical slice đạt chất lượng mục tiêu

Đủ 3 route Q02, phản hồi hub, một companion, điều tra, encounter tùy chọn, Legends, Veil, phụ đề và lưu/khôi phục. Không lỗi hỏng save/chặn truyện trong ma trận đã định; tất cả ID nguồn/thoại hợp lệ; frame-time đo trên máy được chốt. Thiết lập mục tiêu 60 FPS ở cấu hình tham chiếu sau spike, không tuyên bố hỗ trợ mọi PC. Kiểm tra GPU/CPU trong cảnh đại diện thay vì số FPS ở menu.

### G3 — Duyệt mở rộng

Chỉ xây campaign đầy đủ khi có số giờ làm mỗi phút nội dung hoàn thiện, số lượng sửa trung bình và kế hoạch đội ngũ được tài trợ. G4 production, G5 alpha đủ tuyến, G6 beta/tiếp cận/quyền nội dung, G7 phát hành sau kiểm chứng build và triển khai. Hồ sơ thiết kế không thể thay chứng nhận kết quả các cổng này.

## 7. Backlog ưu tiên

**P0:** chốt charter ba tầng; khóa source packet Gr 38; thẩm định lời dẫn/nhãn; blockout Q02; state+consent; sổ chứng cứ; ba route; callback; save giữa kế hoạch; cách skip L/V; glossary; ghi log cho QA.

**P1:** companion một người; tactile interactions dây/vải; combat/rút tùy chọn; phụ đề và hỗ trợ điều khiển; greybox âm thanh; prototype nguồn đối chiếu trong codex; đo chi phí nội dung.

**P2 sau G2:** các Legends còn lại, thêm vùng, 3 companion còn lại, cinematic cao cấp, motion capture, bản địa hóa mở rộng. Không ưu tiên logo/đồ họa hào nhoáng trước độ rõ vòng chơi.

Mỗi item cần owner, estimate khoảng, phụ thuộc và tiêu chí nhận. Chưa có owner hoặc báo giá thật nên không dựng ngân sách AAA bằng con số giả. Lịch làm việc là lịch theo cổng, chưa có ngày ship được cam kết.

## 8. Ước lượng và đội ngũ

Công thức dự trù: tổng ngày công theo bộ môn + chi phí outsource/quyền/công cụ + QA/bản địa hóa + quản lý + dự phòng dựa trên rủi ro. Dùng số thực đo ở slice để ngoại suy, ghi kịch bản tối thiểu/cơ sở/mở rộng; không nhân thời lượng game với một đơn giá tưởng tượng rồi coi là ngân sách được xác nhận.

Vai trò tối thiểu cần có người chịu trách nhiệm: creative/game direction, narrative/quest, engineering/tools/save, level design, environment/character art, animation/cinematic, audio, UX/accessibility, QA/production. Chuyên gia Kinh Thánh và lịch sử là đối tác duyệt nội dung với lịch rõ. Một người có thể kiêm ở prototype nhưng không vì vậy suy ra có thể tự làm AAA đầy đủ.

## 9. Rủi ro chính và cách giảm

| Rủi ro | Tác động | Dấu hiệu sớm | Biện pháp |
|---|---|---|---|
| Ba tầng như ba game rời | Người chơi mất mạch | Không nhớ vấn đề lúc trở lại | Dùng cùng câu hỏi, callback có hành động; thử skip |
| Veil bị hiểu là mặc khải | Sai căn tính nội dung | Người thử tin giấc mơ xác định thủ phạm | Sửa cơ chế và cách kể, không chỉ nhãn |
| Nhánh nổ chi phí | Không hoàn tất được | Mỗi lựa chọn cần level/voice mới | Hội tụ có state, kiểm budget scene |
| Nội dung cổ đại đồng nhất | Sai bối cảnh | Một costume cho mọi thế kỷ | Source packet và niên đại từng asset |
| Nhầm AAA với mục tiêu đã đạt | Kỳ vọng sai | Trailer vượt khả năng build | Chỉ quảng bá phần đã chứng minh |
| Tên trùng game đã tồn tại | Khó nhận diện thương mại | Tìm kiếm trả về sản phẩm khác | Giữ tên làm việc, kiểm tra độc lập trước phát hành [S19] |
| Save/canon bị ghi sai | Mất tiến độ/sai bản văn | Xem lại L đổi world state | Sandbox, transaction, test load và replay |
| Nhân chứng thành công cụ | Lệch chủ đề | Đe dọa luôn là đường hiệu quả nhất | Đồng thuận từng người, callback tổn hại, đường khôi phục |

## 10. Ma trận kiểm chứng cần thực hiện

Logic: route hợp lệ/không hợp lệ; sửa lời sau gây áp lực; load trước/sau commit; replay; skip; vắng companion; ẩn danh thật trong mọi UI. Narrative: nguồn/lời diễn ý; ai biết điều gì; ending theo bằng chứng; cảnh mơ không tạo chứng cứ. Accessibility: hoàn tất không mash, không âm thanh, không màu, tăng chữ và tắt rung; test người dùng phù hợp. Kỹ thuật: versioning save, content IDs, hiệu năng cảnh đại diện, controller hot swap.

Trong đợt này chỉ kiểm cấu trúc tài liệu, link cục bộ và hợp đồng JSON; không báo các kiểm chứng gameplay trên là đã chạy.

## 11. Gói nghiên cứu và dựng thử tiếp sau v2

**R1 / Narrative + Biblical reviewer:** source packet L03 và cách giới thiệu Ebed-melech; đầu ra là pericope/bản dịch/lời tạm đánh dấu và kết luận duyệt. Chưa chỉ định người thật, chưa gọi là đã duyệt. **R2 / Historical advisor + environment:** A01/A03/A08 ở World Bible; đầu ra context công trình/giấy/đường và vật liệu được phép dựng, chưa cần cả thành phố. **R3 / Quest + UX:** dựng Q02 để thử claim/scope và ba phần thực hiện; đầu ra là lượt thử có quan sát, không chỉ state đúng. **R4 / Narrative + systems:** đọc bàn Q05→Q09→Q10 và Q04→Q08→Q11 để bắt callback vô nghĩa/thiếu nguồn. Không dựng hết 12 Q trước khi thử hai chuỗi này ở mức giấy.

`campaign-contract.json` là catalog thiết kế v2; `design-contract.json` tiếp tục minh họa schema save 1 và slice Q02. Không loader nào của game cũ được đổi để đọc hai file trong đợt tài liệu. Trước prototype phải viết nguồn event và projection riêng cho `knownBy`, `sourceLineage`, `claimStatus`, `consentScopes`, `promises`, `planAssignments`. Các trường đó chưa là tính năng runtime đã có.

Budget cảnh v2: 12 Q, 6 B, 5 L, 4 V vẫn cố định. Vai người nhận Galilê/nhân chứng Giêrusalem/người thay ca là vai chức năng, không thêm companion/NPC tái xuất vào cam kết. Nếu muốn nâng một vai thành nhân vật xuyên game, cần duyệt phạm vi thật trước thu âm.

**Đầu ra đợt này:** cập nhật các bible/GDD, hai hồ sơ chi tiết mới, catalog campaign, bản đọc/nguồn/ZIP v2 và báo cáo kiểm tài liệu. Giữ gói v1.0 riêng. Kiểm HTML không chứng minh các nhánh đã chơi được; file nguồn game, save và service worker không đổi bởi gói tài liệu.
