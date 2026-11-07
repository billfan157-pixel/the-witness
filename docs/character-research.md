# Cẩm Nang Nghiên Cứu Chuyên Sâu & Định Hướng Tạo Hình 3D Nhân Vật Kinh Thánh
## Dự án: Hành Trình Lời Chúa · Visual Bible Archaeology & 3D Character Master Documentation

Tài liệu sản xuất và định hướng mỹ thuật 3D cho toàn bộ nhân vật Kinh Thánh và NPC minh họa trong trò chơi *Hành Trình Lời Chúa*.
Ngày cập nhật: 07/11/2026.
Phạm vi dữ liệu: Toàn bộ 15 chặng Kinh Thánh (`story-data.js`), hệ thống nhánh cốt truyện (`expedition-branch.js`), bạn đồng hành (`expedition-companion.js`), kế hoạch cảnh 3D (`expedition-plan.js`), hồ sơ nhân vật (`character-profiles.js`) và bộ máy dựng hình 3D (`adventure-character.js`).

---

## 1. Nguyên Tắc & Phương Pháp Luận Nghiên Cứu

Để tái hiện các nhân vật Kinh Thánh một cách chuyên nghiệp, chân thực và đầy tính tôn trọng, dự án thiết lập hệ thống 3 cấp độ căn cứ khoa học nghiêm ngặt:

1. **[K] — Căn cứ Văn bản Kinh Thánh Trực tiếp (Scriptural Textual Evidence):**
   - Sự kiện, lời thoại, phục trang cụ thể (áo lông lạc đà của Gioan Tẩy Giả trong Mt 3,4; áo tunic dệt liền và tua áo của Đức Giêsu trong Ga 19,23 và Mt 9,20; gậy và dép của Môsê trong Xh 3-4), cũng như động tác được bản văn xác định rõ ràng.
   - Giữ tuyệt đối trung thực với bản văn; không tự ý thêm thắt các yếu tố đi ngược lại lời Kinh Thánh.

2. **[V] — Hiện vật Khảo Cổ & So sánh Lịch sử Cùng Thời (Archaeological & Material Evidence):**
   - Di vật khảo cổ tại vùng Cận Đông (Levant), bao gồm: tàn tích vải dệt, thuốc nhuộm và dép da tại Hang Thư tín (Cave of Letters, 132–135 CN), Masada, Qumran (Biển Chết); phù điêu đồ sắt vây hãm Lachish (British Museum); đồ gốm Herodian thế kỷ I; con dấu đất nung bullae thời Đồ Sắt II tại Giêrusalem; khung dệt đứng thời Cổ đại.
   - Tôn trọng giới hạn niên đại: ghi chú rõ ràng khoảng cách thời gian giữa hiện vật và thời điểm xảy ra câu chuyện Kinh Thánh. Không áp dụng niên đại muộn (như hoa văn Coptic thế kỷ V hoặc tranh Phục Hưng châu Âu) cho nhân vật thời Tân Ước hoặc Tổ phụ.

3. **[D] — Quyết Định Diễn Họa & Mỹ Thuật 3D (Artistic Interpretation & Direction):**
   - Các yếu tố bản văn không mô tả (như đường nét khuôn mặt cụ thể, chiều cao chính xác, số đo hình thể, nhịp thở, độ dài nếp vải) là quyết định nghệ thuật có căn cứ nhân học và phục trang.
   - Tránh tuyệt đối các khuôn mẫu định kiến (stereotype), không gán nét mặt hung dữ hay da sẫm cho người đối lập, không biến tất cả người già thành một khuôn mặt giống nhau.

```
       [K] Văn bản Kinh Thánh trực tiếp (Luật, Phúc Âm, Sách Lịch Sử)
                              │
                              ▼
    [V] Khảo cổ Levant & Cận Đông (Cave of Letters, Masada, Lachish)
                              │
                              ▼
        [D] Quyết định Tạo hình 3D (Giải phẫu, Vải dệt PBR, Rig 53 khớp)
```

---

## 2. Phân Tầng Thời Đại Lịch Sử & Bối Cảnh Khảo Cổ

Trò chơi trải dài qua 4 kỷ nguyên lịch sử lớn. Việc phân biệt rõ 4 thời kỳ này giúp tránh sự đồng nhất hóa sai lầm về trang phục:

| Kỷ nguyên | Niên đại ước tính | Chặng trong game | Bối cảnh khảo cổ & văn hóa | Định hướng tạo hình 3D |
| :--- | :--- | :--- | :--- | :--- |
| **Kỷ nguyên Tổ Phụ (Patriarchal Era)** | Thời đại Đồng Trung (Middle Bronze Age, ~2000–1550 TCN) | `abram`, vụ nước Đamar–Nêra tại Kharan | Văn hóa du mục mục súc Lưỡng Hà - Canaan. Len cừu mộc, lông dê đen, đồ dệt thô trên khung dệt nguyên sơ; lều du mục, vò gốm tròn vai thô. | Áo quấn chéo (wrap tunic) có viền mép tự nhiên; áo choàng len dày chống gió sa mạc; cuộn dây thừng gai, gậy gỗ chăn thả, túi nải da cừu. Không áo toga La Mã, không vương miện Trung Cổ. |
| **Kỷ nguyên Xuất Hành (Exodus Era)** | Thời đại Đồng Muộn (Late Bronze Age, ~1300–1200 TCN) | `moses` tại Khôrếp/Mađian | Đời sống chăn thả sương gió vùng bán đảo Sinai và Mađian. Khí hậu khắc nghiệt, đá hoa cương và cát nóng. | Áo tunic lao động ngắn ngang bắp chân để leo núi; gậy gỗ mục đồng; dép da mỏng có quai xỏ ngón và quai cổ chân có thể cởi bỏ khi bước vào Đất Thánh (Xh 3,5). |
| **Kỷ nguyên Vương Quốc (Monarchy Era)** | Thời đại Đồ Sắt II (Iron Age II, ~1000–586 TCN) | `david`, `nathan`, `isaiah`, `ahaz` tại Giêrusalem | Vương quốc Israel và Giuđa. Phù điêu Lachish, đồ gốm Iron Age II, con dấu bullae chữ Hebrew cổ, kênh dẫn nước hồ trên Giêrusalem. | Phân hóa giai cấp rõ rệt: Vua (Đavít, Akhát) mặc áo len dệt tinh xảo, viền thổ cẩm (woven-border) trang trọng nhưng mộc mạc, thắt đai dệt; Ngôn sứ (Nathan, Isaia) mặc trang phục sợi dệt địa phương, áo choàng vuông, bước đi đĩnh đạc; Thư lại cầm bảng viết. |
| **Kỷ nguyên Tin Mừng & Tân Ước (Second Temple / Roman Period)** | Thế kỷ I TCN – Thế kỷ I CN | `shepherd` đến `sent` (10 chặng Tân Ước) | Do Thái giáo Đền Thờ Thứ Hai dưới ách La Mã. Di vật Masada, Cave of Letters, làng chài Galilê, Biển Hồ Tiberias, Giêrusalem. | Áo tunic dệt liền hoặc ghép hai mảnh; áo choàng vuông (himation/tallit); tua áo (tzitzit) ở bốn góc theo luật Mô-sê; khăn trùm đầu mềm (tichel/sudarium); dép da quai quấn; lưới gai, vò gốm Herodian, giỏ bánh cá. |

---

## 3. Nghiên Cứu Ngoại Hình, Vải Dệt & Văn Hóa Do Thái Thế Kỷ I

### 3.1. Luật Halakha về Trang Phục & Tục Lệ Bản Địa

1. **Quy định về Tua Áo (Tzitzit / Fringes):**
   - Theo Dân Số 15:37–41 và Đệ Nhị Luật 22:12, người nam Do Thái phải gắn các tua áo ở bốn góc của tấm áo choàng ngoài (tallit / himation) để tưởng nhớ các giới răn của Thiên Chúa.
   - Tin Mừng nhắc trực tiếp chi tiết người phụ nữ bị băng huyết chạm vào "tua áo của Ngài" (Mt 9,20; Lc 8,44), và Tin Mừng Ga 19,23 nhắc áo trong của Đức Giêsu là "áo dệt liền từ trên xuống dưới, không có đường khâu".
   - *Tạo hình 3D:* Các nhân vật nam Do Thái sùng đạo (Đức Giêsu, Phêrô, Anrê, các Tông đồ, người thông luật, ngôn sứ) có các cụm tua áo thắt nút bằng sợi tự nhiên ở 4 góc của lớp áo mantle ngoài.

2. **Luật Cấm Pha Trộn Sợi (Sha'atnez):**
   - Theo Lê-vi 19:19 và Đệ Nhị Luật 22:11, nghiêm cấm việc mặc áo kết hợp đồng thời sợi len (wool) và sợi lanh (linen).
   - *Tạo hình 3D:* Mỗi bộ trang phục được phân định rõ chất liệu: hoặc thuần lanh dệt cho áo trong mùa hè / trang phục làm việc nhẹ, hoặc thuần len cho áo khoác ngoài giữ ấm mùa đông. Riêng Gioan Tẩy Giả mặc áo dệt từ lông lạc đà thô ráp (Mt 3,4).

3. **Khăn Trùm Đầu & Tóc:**
   - **Phụ nữ (Đức Maria, Maria Mácđala, Sarai, Tabeal...):** Trong văn hóa Do Thái cổ đại, phụ nữ khi ra chốn công cộng thường đội khăn phủ đầu (veil/shawl dệt từ lanh hoặc len mềm), phủ qua mái tóc buông rủ ngang vai hoặc lưng, thể hiện sự đoan trang và bảo vệ khỏi nắng gió sa mạc. Mái tóc bên trong được tết bím gọn gàng (braids) hoặc búi sau gáy.
   - **Đàn ông:** Thường để đầu trần khi lao động trong nhà hoặc bóng râm, nhưng quấn khăn vải mềm (sudarium) quanh đầu khi đi đường trường hoặc làm việc ngoài nắng gắt sa mạc. Người cao niên (Ápram, Môsê, Nathan, Zimri) dùng khăn trùm đầu buông vai (shawl).
   - **Râu và Tóc nam giới:** Theo luật Lê-vi 19:27 ("Các ngươi không được cạo tròn mép tóc quanh đầu, cũng không được cắt mép râu"), đàn ông Do Thái giữ râu tự nhiên. Tùy độ tuổi và nghề nghiệp, râu có thể cắt tỉa gọn (người trẻ, thư lại) hoặc để dài uy nghi (ngôn sứ, bậc tổ phụ, người cao niên).

4. **Dép Da (Sandals):**
   - Khảo cổ tại Cave of Letters và Masada đã phát hiện nhiều mẫu dép da thật thế kỷ I–II CN: đế dép gồm nhiều lớp da bò ép chặt khâu viền, quai da xỏ qua kẽ ngón chân cái và hai quai chéo ôm lấy cổ chân.
   - *Tạo hình 3D:* Mô hình 3D trang bị dép da cấu trúc 3 phần (đế da cong theo bàn chân, quai xỏ ngón, vòng da ôm mắt cá). Có khả năng ẩn/hiện độc lập để phục vụ cảnh Môsê cởi dép trước Bụi Gai Cháy trên Đất Thánh (Xh 3,5).

5. **Bảng Màu Sợi & Thuốc Nhuộm Cổ Đại:**
   - Người bình dân và lao động chủ yếu dùng màu sợi tự nhiên không nhuộm: trắng kem của lanh, nâu vàng, xám tro, nâu hạt dẻ của lông cừu và lông dê.
   - Thuốc nhuộm thực vật tự nhiên: rễ cây thiến thảo (madder) cho sắc đỏ đất trầm ấm; lá cây chàm (woad) cho sắc lam sẫm; vỏ quả lựu và hạt dẻ cho sắc vàng nâu; đất son (ochre) cho màu nâu đỏ. Sắc tím murex đắt đỏ chỉ dành cho hoàng tộc hoặc người cực kỳ giàu có.
   - *Tạo hình 3D:* Tránh bảng màu neon hiện đại; sử dụng bảng màu đất hữu cơ (earth tones) trầm ấm, hài hòa với ánh sáng tự nhiên của từng vùng địa lý trong game.

---

## 4. Phong Tục, Nghi Thức Giao Tiếp & Ngôn Ngữ Cơ Thể

Hệ thống cử chỉ và chuyển động 3D trong game được thiết kế dựa trên các phong tục tập quán Do Thái cổ đại:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CỬ CHỈ VĂN HÓA KINH THÁNH                       │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│    SHALOM GREET  │   TEACH & BLESS  │    HOSPITALITY   │   RECLINING   │
│   (Chào Bình An) │  (Giảng Dạy/Ban) │ (Rửa Chân/Phục Vụ│ (Tiệc Ngả Lưng│
│                  │                  │                  │               │
│ Tay phải đặt tim │ Tay phải mở ngửa │ Quỳ gối một chân │ Chống khuỷu   │
│ Đầu cúi nhẹ      │ Đưa về thính giả │ Hai tay nâng đỡ  │ Tay phải lấy  │
│ Mắt nhìn chân tình│ Thân hướng đối diện│ Trọng tâm hạ thấp│ Thân nghiêng  │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

1. **Lời Chào Bình An (Shalom / Shalom Aleichem):**
   - Cử chỉ: Tay phải đặt nhẹ lên ngực trái (vị trí trái tim), đầu hơi cúi trang trọng, ánh mắt ấm áp nhìn thẳng vào người đối thoại. Không bắt tay công sở kiểu phương Tây hiện đại, không chắp tay kiểu Đông Á.

2. **Nghi Thức Tiếp Khách & Rửa Chân (Hospitality & Footwashing):**
   - Lữ khách đi bộ trên đường sa mạc đầy cát bụi khi bước vào nhà được chủ nhà hoặc tôi tớ mang chậu gốm/đồng và khăn lanh đến rửa chân.
   - Trong Ga 13, Đức Giêsu cởi áo ngoài, lấy khăn vải lanh thắt lưng, đổ nước vào chậu và quỳ xuống rửa chân cho từng môn đệ. Đây là đỉnh cao của tinh thần phục vụ khiêm hạ.
   - *Tạo hình 3D:* Biến thể `jesus-supper` cởi bỏ mantle, thắt khăn vải lanh quanh eo; tư thế `serve` quỳ một gối, trọng tâm hạ thấp, hai tay nâng chậu nước.

3. **Tư Thế Ngả Lưng Dùng Bữa (Reclining / Triclinium):**
   - Trong các bữa tiệc trang trọng thế kỷ I (đặc biệt là Bữa Tiệc Ly mừng Lễ Vượt Qua - Mc 14,18), người Do Thái chịu ảnh hưởng văn hóa Hy-La dùng bữa trên các sập/đệm thấp bao quanh bàn ăn. Khách ngả nghiêng sang bên trái, tựa cùi chỏ trái lên đệm, dùng tay phải để lấy thức ăn và bánh. Người ngồi bên phải tựa đầu gần ngực người bên trái (Ga 13,23: "Một trong các môn đệ, người được Đức Giêsu yêu mến, đang ngả đầu vào lòng Đức Giêsu").

4. **Tư Thế Giảng Dạy & Tuyên Sấm (Teaching & Proclaiming):**
   - Các Thầy dạy (Rabbi) Do Thái thời cổ khi giảng dạy chính thức thường ngồi xuống trang trọng (Mt 5,1: "Thấy đám đông, Ngài lên núi; Ngài ngồi xuống, các môn đệ đến gần, và Ngài mở miệng dạy họ").
   - Các Ngôn sứ (Nathan, Isaia) khi tuyên sấm đứng thẳng, ánh mắt kiên định, cánh tay giơ lên truyền đạt lời Đấng Tối Cao.

5. **Tư Thế Cầu Nguyện Do Thái (Tefillah / Amidah / Prostration):**
   - Cầu nguyện đứng: Thân thẳng hướng về Đền Thờ Giêrusalem, hai bàn tay ngửa mở ra trước ngực đón nhận ân sủng (tư thế Orans cổ xưa).
   - Cầu nguyện khẩn thiết: Quỳ gối hoặc phủ phục sát đất trong nỗi thống thiết tâm hồn (Đức Giêsu tại Ghếtsêmani - Lc 22,41; Mt 26,39).

---

## 5. Danh Mục Hồ Sơ Nhân Vật 3D Chuyên Nghiệp

### 5.1. Nhóm Nhân Vật Kinh Thánh Trực Tiếp

#### 1. Ápram (`abram`) · Tổ phụ đức tin
- **Bối cảnh & Văn bản:** St 12,1–9: Lên đường rời Kharan theo tiếng gọi của Chúa lúc 75 tuổi; dựng bàn thờ tại Canaan.
- **Tạo hình 3D:**
  - Nam cao niên (~75–80 tuổi diễn họa), dáng người rắn rỏi của bậc tộc trưởng lữ hành lâu năm, vai rộng, lưng hơi khom nhẹ tự nhiên (`stoop: .025`).
  - Râu dài hoa râm dầy dặn, tóc gợn sóng bạc điểm sẫm; khăn choàng đầu `shawl` len xám mộc che nắng gió; áo tunic len thô (`#b49a74`) quấn đai dây thừng; áo khoác mantle len dày màu đất sẫm (`#6c5342`).
  - Đạo cụ: Gậy gỗ du mục (`staff`) cầm chắc tay phải; túi da lữ hành đeo hông.
  - Cử chỉ: Ánh mắt dõi nhìn chân trời phía trước (`watch`), bước chân vững chãi trên cát sỏi.

#### 2. Sarai (`sarai`) · Mẹ của các dân tộc
- **Bối cảnh & Văn bản:** St 12,5: Cùng Ápram và Lót lên đường từ Kharan đến đất Canaan.
- **Tạo hình 3D:**
  - Nữ trưởng thành cao niên (~65 tuổi diễn họa), gương mặt đoan trang, ánh mắt từng trải và dịu hiền.
  - Tóc dài tết bím (`braids`) giấu khéo léo dưới khăn trùm đầu dài `veil` màu cát mộc (`#c7b694`) rủ mềm qua vai xuống ngang hông.
  - Áo dài tunic chấm mắt cá chân màu đất nung ấm (`#a07660`), tay áo dài ôm cổ tay; thắt lưng vải dệt.
  - Cử chỉ: Động tác chỉnh quai túi nải, quay đầu nhìn lại quê hương Kharan với niềm tin cậy.

#### 3. Môsê (`moses`) · Người chăn chiên & Người tôi trung
- **Bối cảnh & Văn bản:** Xh 3,1–6; Xh 4,2: Chăn đàn chiên của cha vợ rể tại Mađian; ngọn lửa bụi gai cháy không tàn trên núi Khôrếp; lệnh cởi dép vì đang đứng trên Đất Thánh; cây gậy chăn chiên.
- **Tạo hình 3D:**
  - Nam trung niên cứng cáp (~66 tuổi diễn họa), vóc dáng gân guốc của người đi núi sa mạc (`build: 1.035`).
  - Râu rậm phong trần, ánh mắt bừng sáng kinh ngạc và cung kính; khăn trùm đầu `shawl` len thô; áo tunic lao động ngang bắp chân (`hem: .37`) để dễ leo dốc đá; áo khoác mantle len cừu (`#675d47`).
  - Đạo cụ: Cây gậy gỗ chăn chiên (`staff`) có đầu khom mộc mạc.
  - Hoạt ảnh đặc biệt: Cơ chế cởi dép độc lập (`barefoot`), cánh tay che mặt trước ánh sáng thánh thiêng của Bụi Gai Cháy.

#### 4. Ngôn sứ Nathan (`nathan`)
- **Bối cảnh & Văn bản:** 2 Sm 7,1–17: Cuộc đối thoại với vua Đavít về việc xây cất Đền Thờ; truyền lại lời sấm của Thiên Chúa về triều đại vĩnh cửu.
- **Tạo hình 3D:**
  - Nam cao niên (~67 tuổi diễn họa), khuôn mặt gầy thanh tú, đôi mắt sâu sắc lắng nghe và thấu suốt (`face: invertedtriangular`).
  - Râu dài màu tro bạc cắt tỉa trang nghiêm; áo tunic len dệt mộc (`#c6b38f`), áo mantle quấn chéo qua vai (`#786a57`); không mặc phẩm phục tư tế rườm rà.
  - Cử chỉ: Lắng nghe chăm chú rồi đưa tay trình bày lời sấm một cách trầm tĩnh, dứt khoát (`explain`).

#### 5. Vua Đavít (`david`)
- **Bối cảnh & Văn bản:** 2 Sm 7,1–18: Vua trong cung điện gỗ bá hương; ngồi trước nhan Thiên Chúa mà cầu nguyện khiêm hạ.
- **Tạo hình 3D:**
  - Nam trung niên oai phong (~58 tuổi diễn họa), vóc dáng vạm vỡ của chiến binh và vị vua (`build: 1.06`), quai hàm vuông vức (`chin: .6`).
  - Râu tóc sẫm màu cắt tỉa quý phái; áo tunic dệt sợi tinh xảo màu cát vàng (`#c4af88`), áo choàng hoàng gia màu đỏ bã trầu đất (`#815448`) có đường viền thổ cẩm dệt kim tuyến mộc (`ornament: woven-border`).
  - Cử chỉ: Ngồi suy tư trầm mặc, hai tay mở hướng lên trời cầu nguyện khiêm nhu. Không dùng vương miện sắt kiểu hiệp sĩ châu Âu.

#### 6. Bộ dựng nhân vật hiện tại · portrait3

Nguồn chạy trong game là `adventure-character.js` và `character-detail.js`, trên Three.js. Đây là tạo hình thời gian thực theo hướng tự nhiên hơn; chưa phải bộ nhân vật photoreal được sculpt và groom thủ công trong một phần mềm 3D chuyên dụng.

1. **Hình thể và khuôn mặt:** giữ bộ xương MakeHuman 53 khớp; chỉnh hình học quanh gò má, hốc mắt, chân mày, hàm và rãnh mũi–má với mức dịch chuyển nhỏ. Có 5 morph động: chớp mắt trái/phải, mở hàm, nhấc nhẹ khóe môi và thả lỏng chân mày. Hai biến thể Đức Giêsu dùng cùng khuôn mặt và màu mắt. Da dưới phần tay áo được che theo phạm vi trang phục.

2. **Da và mắt:** normal map và roughness map 256×256 được tạo tại chỗ và dùng chung; nếp trán nhỏ được thể hiện bằng normal. Độ nhám thay đổi ở môi, mũi và vùng trán. Tán xạ da là xấp xỉ theo nguồn sáng và độ mỏng vùng tai/mũi, không phải hiệu ứng phát sáng viền hay SSS đa lớp đầy đủ. Mắt có củng mạc ngà, mống mắt nâu độc lập với màu tóc, đồng tử, lớp giác mạc, mí, viền lệ và khóe mắt. Không dùng màu tóc bạc để tạo mống mắt.

3. **Tóc và râu:** dùng hair cards cong với atlas sợi 4 cụm 256×512 có khoảng trong suốt; bỏ khối râu đặc. Chân tóc không đều, râu có các sợi nhấn riêng và bóng đổ có khoảng hở. Tóc dài có độ trễ theo bước đi và quay đầu; râu theo khẩu hình. Đây là groom phù hợp bản trình duyệt, không phải Unreal Groom Strands.

4. **Trang phục:** áo trong có thân, tay áo có đầu vai, mép cổ và gấu hoàn thiện. Áo khoác biểu diễn tấm vải chữ nhật khoác qua lưng và phần vắt phía trước. Lưới vải được ổn định bằng trọng lực, ràng buộc giãn và chéo, có va chạm với thể tích thân đơn giản. Hoạt ảnh dùng lò xo tắt dần và biến dạng GPU cho tà áo, kết hợp khung xương và nếp nén ở khuỷu. Chưa có va chạm vải–vải hay mô phỏng tự va chạm đầy đủ. Chất liệu phân biệt lanh, len, vải lông thô và da bằng normal/roughness riêng. Không dùng Marvelous Designer hoặc Chaos Cloth trong bản này.

5. **Chi phí và kiểm tra:** các phần trang phục cùng chất liệu được gộp để giảm số lượt vẽ; lớp mắt chi tiết ngừng vẽ khi xa hơn khoảng 9,5 đơn vị thế giới. Số tam giác, mesh và lượt vẽ thực tế nằm trong `outputs/characters/render-report.json`; con số 12–16 nghìn tam giác và 8–12 lượt vẽ trong bản ghi trước không mô tả bộ nhân vật hoàn chỉnh. Kiểm tra phần mềm dựng hình không chứng minh 60 FPS trên điện thoại thật.

### Căn cứ phục trang đã đối chiếu cho lần sửa này

- [Carol Bakhos / Posen Library, Early Jewish Dress and Adornment](https://www.posenlibrary.com/guide/early-jewish-dress-and-adornment): tunic, mantle, len và lanh; nhiều mẫu còn lại thuộc cuộc khởi nghĩa Bar Kokhba ở thế kỷ II. Dùng làm đối chiếu gần thời kỳ, không coi là bộ áo cụ thể của Đức Giêsu.
- [Orit Shamir, Reused and Recycled Textiles from Judean Desert Sites](https://www.archaeopress.com/Archaeopress/download/9781805830801): đối chiếu hiện vật tunic ở Cave of Letters, trong đó có IAA 1996-9132 và 1996-9116. Không lấy hoa văn Byzantine hay kiểu cắt may trung đại làm bằng chứng cho thế kỷ I.
- [Three.js, SubsurfaceScatteringShader](https://github.com/mrdoob/three.js/blob/r170/examples/jsm/shaders/SubsurfaceScatteringShader.js): tham khảo phương pháp xấp xỉ tán xạ theo đèn; bộ shader hiện tại được điều chỉnh cho chất liệu da PBR của game.

Màu áo, độ dài tóc, tuổi biểu kiến và nét mặt vẫn là lựa chọn mỹ thuật. Cụm từ mô tả tính cách trong các hồ sơ là định hướng diễn họa, không phải kết luận nhân học hay chân dung đã được xác định.

---

## 7. Vua Akhát (`ahaz`)
- **Bối cảnh & Văn bản:** Is 7,1–12: Vua Giuđa đứng trước nỗi kinh hoàng của cuộc chiến tranh Syro-Ephraimite bên bờ kênh hồ trên; lòng nao núng "như cây rừng rung rinh trước gió".
- **Tạo hình 3D:**
  - Nam thanh niên (~30 tuổi diễn họa), vóc người vương giả nhưng nét mặt căng thẳng, âu lo (`chin: .20`, mắt mở to quan sát).
  - Tóc cắt ngắn kiểu quý tộc Giuđa; áo tunic sang trọng có viền vàng mộc (`#bba98d`), áo choàng tím than trầm (`#6e5966`); đai lưng gấm dệt.
  - Cử chỉ: Đứng khoanh tay hoặc chống hông bồn chồn, thỉnh thoảng quay nhìn về phía bờ kênh.

#### 8. Mục đồng Bêlem (`shepherd` / `zimri`)
- **Bối cảnh & Văn bản:** Lc 2,8–20: Thức đêm canh giữ đàn chiên ngoài đồng hoang Bêlem; nghe sứ thần loan báo Tin Mừng trọng đại và hối hả đến máng cỏ.
- **Tạo hình 3D:**
  - Nam thanh niên hoặc cao niên sương gió, làn da rám nắng sa mạc đêm, áo tunic len thô ngắn để thuận tiện chạy đuổi thú hoang (`hem: .43`).
  - Áo choàng mantle len cừu dầy cộp hai lớp giữ ấm sương lạnh đêm đông (`#645e49`); khăn len quấn đầu `shawl`.
  - Đạo cụ: Cây gậy chăn chiên bằng gỗ sồi có móc cong (`staff`); đèn dầu đất nung hoặc túi da cừu đựng lương khô.
  - Cử chỉ: Đưa tay che mắt ngước nhìn ánh sáng vinh hiển của sứ thần trời cao, bước chân vội vã đầy hân hoan.

#### 9. Gioan Tẩy Giả (`john-baptist`)
- **Bối cảnh & Văn bản:** Mt 3,4; Ga 1,19–34: Tiếng kêu trong hoang địa Giođan; mặc áo lông lạc đà, thắt lưng bằng đai da; làm chứng cho Chiên Thiên Chúa.
- **Tạo hình 3D:**
  - Nam thanh niên gầy guộc, rắn rỏi (~29 tuổi diễn họa, `build: .94`), cơ bắp săn chắc do cuộc sống khổ hạnh sa mạc.
  - Tóc dài xoăn bồng bềnh (`hair: curls`, `hairLength: .09`), râu rậm hoang dã; trang phục bằng vải dệt thô từ lông lạc đà nguyên chất (`cloth: haircloth`, `#88714f`); đai thắt lưng bằng da bò thô màu nâu sẫm (`belt: leather`). Không mặc áo choàng mantle.
  - Cử chỉ: Cánh tay gầy giơ cao chỉ về phía Đức Giêsu: "Đây là Chiên Thiên Chúa, Đấng xóa tội trần gian" (`explain`).

#### 10. Đức Giêsu Kitô (`jesus`)
- **Bối cảnh & Văn bản:** Ga 19,23 (áo tunic dệt liền từ trên xuống dưới); Mt 9,20 (tua áo bốn góc); Mt 5,1 (ngồi giảng dạy); Ga 13,4–12 (rửa chân các môn đệ).
- **Tạo hình 3D Toàn Diện:**
  - Nam nhân thế kỷ I (~33 tuổi diễn họa), tỷ lệ cơ thể cân đối thanh thoát (`build: 1.0`, `height: 1.0`).
  - Gương mặt mang nét đặc trưng Do Thái Galilê: làn da nâu ấm màu mật ong (`#ad7958`), sống mũi cao thanh tú (`noseBridge: .34`), đôi mắt sâu thẳm giàu lòng trắc ẩn, tóc màu nâu sẫm gợn sóng tự nhiên rủ chạm vai (`hair: waves`), râu ngắn mộc mạc theo lựa chọn mỹ thuật (`beard: .034`).
  - **Trang phục:** Áo trong tunic dài dệt liền từ sợi lanh mộc màu kem ấm (`#cabb9e`), đai thắt lưng bằng dây dệt; áo choàng mantle vuông dệt từ len màu cát sa mạc (`#9a8668`) vắt qua vai trái, rủ nếp gấp tự nhiên; tại 4 góc áo choàng gắn 4 cụm tua áo (tzitzit) theo luật Mô-sê; chân đi dép quai da Masada.
  - **Biến thể Rửa Chân (`jesus-supper`):** Cởi bỏ áo choàng mantle, dùng tấm khăn vải lanh trắng dài thắt ngang lưng (`belt: towel`), hai tay nâng chậu nước gốm đất nung, tư thế quỳ phục vụ đầy xúc động.
  - **Hoạt ảnh đặc trưng:** Cử chỉ giảng dạy ngửa bàn tay đón nhận (`teach`), cử chỉ ban bình an (`greet`), tư thế ngả lưng dùng bữa Tiệc Ly (`recline`).

#### 11. Simôn Phêrô (`peter`)
- **Bối cảnh & Văn bản:** Mt 4,18 (ngư phủ thả lưới); Ga 13 (phản ứng khi được rửa chân); Ga 21; Cv 2 (đứng lên tuyên xưng trong ngày Lễ Ngũ Tuần).
- **Tạo hình 3D:**
  - Nam trung niên rắn rỏi (~43 tuổi diễn họa, `build: 1.10`), cẳng tay nổi cơ bắp của người kéo lưới Biển Hồ nhiều năm.
  - Trán cao hơi hói (`hair: receding`), tóc và râu xoăn hoa râm sương gió (`hairColor: #51483d`); khuôn mặt chữ điền cương nghị, bộc trực (`face: round`, `chin: .54`).
  - Áo tunic làm việc màu xám tro ngắn ngang bắp chân (`hem: .37`), tay áo xốc cao quá khuỷu; áo mantle khoác vội; đai vải dệt chắc chắn.
  - Cử chỉ: Cử chỉ bộc trực, tay giơ lên khi nói chuyện nhiệt thành (`explain`), bước đi dài dứt khoát (`stride: 1.03`). Nhất quán cùng một nhân diện từ bờ hồ qua Tiệc Ly tới ngày Ngũ Tuần.

#### 12. Anrê (`andrew`)
- **Bối cảnh & Văn bản:** Ga 1,40; Ga 6,8–9: Ngư phủ Galilê, em ông Simôn; người chú ý đến cậu bé có 5 chiếc bánh lúa mạch và 2 con cá nhỏ.
- **Tạo hình 3D:**
  - Nam thanh niên khỏe khoắn (~33 tuổi diễn họa), gương mặt chữ nhật hiền hòa, tóc xoăn đen (`hair: curls`).
  - Áo tunic ngư dân màu xanh rêu nhạt sương gió (`#a8a184`), áo mantle xanh sẫm dạt nước hồ (`#62716b`); vai áo có nếp vải mòn tự nhiên.
  - Đạo cụ: Lưới đánh cá sợi lanh (`net`) hoặc giỏ nan (`basket`).
  - Cử chỉ: Nghiêng người lắng nghe người khác, ân cần chỉ về phía cậu bé dâng bánh cá.

#### 13. Philípphê (`philip`)
- **Bối cảnh & Văn bản:** Ga 6,5–7: Người môn đệ quê ở Bết-xai-đa; trả lời tính toán thực tế về số tiền mua bánh cho đám đông.
- **Tạo hình 3D:**
  - Nam thanh niên (~28 tuổi diễn họa), mặt thon (`face: invertedtriangular`), râu ngắn tỉa gọn (`beard: .031`).
  - Áo tunic gọn gàng màu cát (`#b8a98b`), áo mantle xanh xám (`#657175`).
  - Cử chỉ: Đưa tay tính toán nhẩm tính, ánh mắt nhìn bao quát đám đông trên sườn đồi.

#### 14. Đức Mẹ Maria (`mary`)
- **Bối cảnh & Văn bản:** Ga 19,25–27: Đứng bên cạnh thập giá Chúa Giêsu cùng với người môn đệ được yêu mến.
- **Tạo hình 3D:**
  - Người mẹ cao niên uy nghiêm và đau đớn (~66 tuổi diễn họa), vóc người mảnh mai (`height: .955`, `build: .95`), khuôn mặt trái xoan thánh thiện mang nét đau thương sâu thẳm.
  - Tóc điểm hoa râm tết gọn; khăn trùm đầu dài `veil` màu lam xám trầm (`#6b7780`) phủ kín tóc và buông dài xuống ngực và lưng; áo tunic dài chạm mắt cá chân màu đất mộc (`#a7987c`).
  - Cử chỉ: Đứng lặng lẽ dưới chân thập giá, hai bàn tay đan trước ngực hoặc đặt lên tim, đầu hơi cúi nhìn lên Con với trọn niềm phó thác. Tuyệt đối không có cử chỉ nhảy nhót hay cử động đột ngột.

#### 15. Maria Mácđala (`magdalene`)
- **Bối cảnh & Văn bản:** Ga 20,1–18: Ra viếng mộ lúc trời còn tối mịt; khóc bên mộ trống; nhận ra Thầy phục sinh khi Ngài gọi "Maria!"; hối hả chạy đi loan báo cho các Tông đồ.
- **Tạo hình 3D:**
  - Nữ thanh niên nhanh nhẹn (~30 tuổi diễn họa), gương mặt thanh tú, đôi mắt sáng bừng xúc động.
  - Tóc tết bím dưới khăn trùm đầu `veil` màu tím nhạt trầm (`#796a77`); áo tunic đi đường màu đất hồng ấm (`#a98c78`).
  - Cử chỉ: Tư thế quay người ngỡ ngàng khi nhận ra Chúa, hai tay dang rộng xúc động thốt lên "Ráp-bu-ni!", rồi bước chân hối hả lên đường mang Tin Mừng Phục Sinh.

#### 16. Người Môn Đệ Được Yêu Mến (`beloved`)
- **Bối cảnh & Văn bản:** Ga 19,26–27; Ga 20,4: Đứng bên Mẹ Maria dưới chân thập giá; tiếp nhận Mẹ về nhà mình; chạy nhanh hơn Phêrô tới mộ trống.
- **Tạo hình 3D:**
  - Nam thanh niên trẻ tuổi nhất nhóm môn đệ (~18–20 tuổi diễn họa), nét mặt khôi ngô trong sáng, râu tơ mờ (`beard: .013`).
  - Áo tunic màu be nhạt (`#b2aa8f`), áo choàng mantle len màu nâu ấm (`#827365`).
  - Cử chỉ: Đứng sát nâng đỡ Mẹ Maria dưới chân thập giá, ánh mắt đau đớn nhưng tràn đầy trung thành.

#### 17. Người Samari Nhân Hậu (`samaritan`)
- **Bối cảnh & Văn bản:** Lc 10,33–35: Đi đường gặp người bị cướp đánh nhừ tử; động lòng trắc ẩn, lấy dầu và rượu xức vết thương rồi băng bó lại; đưa nạn nhân về quán trọ săn sóc.
- **Tạo hình 3D:**
  - Nam trung niên lữ hành (~40 tuổi diễn họa), vóc người vững chắc, gương mặt hiền hòa cương nghị.
  - Áo tunic đi đường chịu bụi cát màu be (`#b6aa8e`), áo mantle len sẫm quấn gọn (`#68817b`).
  - Đạo cụ: Túi nải lữ hành (`bag`) chứa bình dầu ô liu nhỏ, bầu rượu và cuộn băng vải lanh.
  - Cử chỉ: Tư thế quỳ một chân (`serve`), hai tay nâng niu chăm sóc băng bó cho người bị nạn.

#### 18. Người Thông Luật (`scholar`)
- **Bối cảnh & Văn bản:** Lc 10,25–29: Đứng lên hỏi Đức Giêsu để thử Ngài: "Ai là người thân cận của tôi?".
- **Tạo hình 3D:**
  - Nam trung niên trí thức (~54 tuổi diễn họa), râu cắt tỉa chỉnh tề, ánh mắt sắc sảo tập trung (`face: invertedtriangular`).
  - Áo tunic dài dệt sợi lanh cao cấp màu ngà (`#c6baa1`) có viền dệt thanh nhã, áo choàng mantle len màu nâu xám sẫm (`#756b61`); tại góc áo có tua áo tzitzit.
  - Cử chỉ: Đứng đĩnh đạc, tay đưa ra tranh luận khúc chiết rồi chăm chú lắng nghe dụ ngôn.

#### 19. Clêôpát & Bạn Đồng Hành (`cleopas`)
- **Bối cảnh & Văn bản:** Lc 24,13–35: Hai môn đệ trên đường đi Emmau lúc chiều tà; buồn bã thất vọng; mời Người Lữ Khách lạ vào dùng bữa: "Xin ở lại với chúng tôi vì trời đã xế chiều"; nhận ra Chúa khi Ngài bẻ bánh.
- **Tạo hình 3D:**
  - Nam trung niên đi đường dài mệt mỏi (~48 tuổi diễn họa), áo mantle choàng giữ ấm chiều đông (`#716d5e`), khăn quấn trùm đầu `shawl`, túi vải đeo vai.
  - Cử chỉ: Bước đi trĩu nặng lúc đầu, sau đó dang tay hướng về cửa nhà mời khách (`hospitality`), mắt mở to kinh ngạc khi thấy tấm bánh được bẻ ra.

#### 20. Sứ Thần / Thiên Thần Phục Sinh (`angel`)
- **Bối cảnh & Văn bản:** Mt 28,2–4; Ga 20,12: Hai thiên thần mặc y phục trắng tinh ngời sáng ngồi nơi đặt thi hài Đức Giêsu.
- **Tạo hình 3D:**
  - Tạo hình nhân dạng siêu nhiên cao quý, khuôn mặt thanh khiết vô tì vết, không râu, ánh sáng hào quang dịu nhẹ tỏa quanh thân thể.
  - Toàn bộ trang phục bằng vải dệt trắng sáng rực rỡ (`tunic: #dfd6c0`, `mantle: #c9c0ab`), nếp vải buông thẳng tĩnh lặng.
  - Không gắn đôi cánh lông vũ sân khấu nhân tạo (bản văn Kinh Thánh hai cảnh mộ và Bêlem không mô tả thiên thần có cánh chim), nhấn mạnh vẻ đẹp thánh thiêng uy nghi.

---

### 5.2. Danh Mục 15 NPC Minh Họa Đời Sống & Nghề Nghiệp Do Thái Cổ Đại

Các NPC trong trò chơi được xây dựng để tái hiện chân thực bức tranh sinh hoạt kinh tế - xã hội của vùng đất Kinh Thánh:

| Mã NPC | Tên NPC | Kỷ nguyên | Nghề nghiệp / Bối cảnh | Đặc trưng ngoại hình & Đạo cụ 3D | Động tác nghề nghiệp (Tend / Work) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `naor` | Ông Naor | Tổ phụ (Kharan) | Giữ trại & Dựng lều lữ hành | Nam cao niên vai rộng, áo khoác len có tua ngắn, đai dây thừng; cầm cuộn dây thừng gai (`rope`). | Luồn hai tay kiểm tra cọc lều, siết nút dây chắn gió sa mạc. |
| `abinoam` | Ông Abinoam | Xuất hành (Mađian) | Chăn dê núi Mađian | Người gầy gò nhanh nhẹn, râu sẫm hoa râm; áo tunic cộc ngang gối, gậy gỗ chăn thả (`staff`). | Dừng chân tựa gậy, ngẩng nhìn vách đá đếm đàn dê. |
| `hanani` | Ông Hanani | Quân chủ (Giêrusalem) | Thư lại triều đình Đavít | Gương mặt dài trí thức, râu chăm chút; áo dệt viền nhỏ; cầm bảng viết sáp gỗ và bút trâm (`tablet`). | Mắt nhìn xuống bảng sáp, tay cầm bút ghi chép, ngẩng lên lắng nghe. |
| `elia` | Bà Elia | Quân chủ (Giuđa) | Coi kênh nước hồ trên | Nữ trung niên khỏe khoắn, tóc buộc gọn dưới khăn hẹp; cầm vò gốm nhỏ (`jar`) kiểm tra mực nước. | Đỡ đáy vò nước ven miệng cống dẫn, xem dòng nước chảy. |
| `zimri` | Ông Zimri | Tân Ước (Bêlem) | Canh giữ bầy chiên đêm | Vai xuôi, áo mantle len dầy cộm chống rét sương đêm, râu bạc dài; tay cầm gậy chăn chiên (`staff`). | Một tay tựa gậy, tay kia che ngọn đèn đất nung trước gió lạnh. |
| `maacah` | Ông Maacah | Tân Ước (Galilê) | Ngư phủ vá lưới ven hồ | Cẳng tay rắn rỏi, áo ngắn không vướng víu, quàng khăn chống nắng; cầm lưới đánh cá (`net`). | Ngồi trên mỏm đá, hai tay thoăn thoắt gỡ và thắt nút mắt lưới. |
| `deborah` | Bà Deborah | Tân Ước (Núi Bát Phúc) | Đón tiếp thính giả nghe giảng | Nữ trưởng thành phúc hậu, khăn trùm đầu nới rộng qua vai; túi vải nhỏ (`bag`). | Đứng ở thềm đá, mở rộng bàn tay chào đón người hành hương lên núi. |
| `maacah-loaves`| Bà Maacah | Tân Ước (Bên kia Biển Hồ)| Chuẩn bị lương thực | Dáng người thấp đậm, quấn khăn gọn gàng; hai tay nâng giỏ nan đan (`basket`) đựng bánh cá. | Đỡ giỏ bánh trước thân, hai tay kiểm tra và sắp xếp từng ổ bánh. |
| `amos` | Ông Amos | Tân Ước (Đường Giêricô)| Trông coi quán trọ đường đèo | Mặt vuông chữ điền, râu ngắn phong trần, áo khoác có nếp may mộc; cầm đèn dầu đất nung (`oil-lamp`). | Nâng đèn dầu soi rõ khúc cua hiểm trở trong đêm. |
| `zipporah` | Bà Zipporah | Tân Ước (Sân Tiệc Ly) | Phục vụ mang nước giếng | Dáng người thanh thoát, khăn trùm đầu thắt nút sau gáy; hai tay nâng vò nước gốm lớn (`jar`). | Tay phải đỡ quai vò, tay trái nâng đáy vò khi hạ nước cho khách. |
| `ahio` | Ông Ahio | Tân Ước (Ghếtsêmani) | Trông sóc vườn cây ô liu | Nam trung niên da sạm nắng, đai vải có túi đựng dụng cụ; kiểm tra cành ghép ô liu. | Cúi người xem xét thân cây ô liu già, ngẩng lên khi có tiếng bước chân. |
| `tabeal` | Bà Tabeal | Tân Ước (Đồi Sọ) | An ủi người lữ hành đau thương| Nữ cao niên đượm vẻ xót xa, khăn choàng dài buông rủ; bước đi chậm rãi nâng đỡ. | Đưa tay chỉ lối an toàn qua dốc đá, dìu dắt người kiệt sức. |
| `jephunneh`| Ông Jephunneh | Tân Ước (Vườn Mộ Đá) | Trông nom khu vườn mộ | Nam cao niên mảnh khảnh, râu bạc ngắn, gậy gỗ mộc (`staff`); kiểm tra các bậc đá. | Chống gậy ngắm nhìn cửa mộ đá hoa cương, chỉ dấu đường cho khách. |
| `ruth` | Bà Ruth | Tân Ước (Emmau) | Nhóm bếp & Nướng bánh | Người chắc nịch, tay áo cuốn cao, giỏ nan đựng củi vụn khô (`basket`); chuẩn bị bữa chiều. | Cúi nhóm bếp than hồng, tay sắp xếp bánh lúa mạch trên phiến đá nướng. |
| `ezra` | Ông Ezra | Tân Ước (Giêrusalem) | Đón khách hành hương Ngũ Tuần| Nam trung niên lữ khách phương xa, áo đi đường nhiều lớp, túi nải lữ hành (`bag`). | Đứng giữa sân Đền Thờ, giơ tay chào hỏi đồng bào trở về từ muôn phương. |
| `damar` | Ông Đamar | Tổ phụ (Kharan) | Giữ giếng nước bộ tộc | Nam cao niên, áo len mộc tổ phụ, râu dài; nâng vò nước thử độ trong mát (`jar`). | Hạ gàu múc nước giếng sâu, chia sẻ nước cho khách đường xa. |
| `nera` | Bà Nêra | Tổ phụ (Kharan) | Thợ nặn vò gốm | Nữ thợ thủ công, tóc buộc cao, tạp dề vải lanh dính vết đất sét; kiểm tra miệng vò (`jar`). | Hai tay xoay tròn vuốt cạnh vò gốm đất sét trên bàn xoay. |

---

## 6. Tiêu Chuẩn Kỹ Thuật Đồ Họa 3D Trong Engine Game

Để đạt được chất lượng hình ảnh chân thực và chuyển động sống động trong khi vẫn duy trì tốc độ 60 FPS mượt mà trên cả trình duyệt máy tính lẫn thiết bị di động, hệ thống 3D tuân thủ các chỉ tiêu kỹ thuật sau:

1. **Bộ Khung Xương (53-Bone Anatomical Rig):**
   - Bộ khung xương hoàn chỉnh từ dữ liệu giải phẫu MakeHuman CC0:
     - Xương trục: `Root`, `pelvis`, `spine_01`, `spine_02`, `spine_03`, `neck_01`, `head`.
     - Tay & Bàn tay: `clavicle_l/r`, `upperarm_l/r`, `lowerarm_l/r`, `hand_l/r` cùng đủ 3 đốt cho từng ngón tay (`thumb`, `index`, `middle`, `ring`, `pinky_01..03`). Cho phép bàn tay nắm chặt cán gậy, quai giỏ, bình gốm tự nhiên mà không bị xuyên thủng mesh.
     - Chân: `thigh_l/r`, `calf_l/r`, `foot_l/r`, `toes_l/r`.

2. **Hệ Thống Biến Dạng Khuôn Mặt (Facial Morph Targets):**
   - 3 morph targets động: `eye-left-closure`, `eye-right-closure` (chớp mắt tự nhiên), `mouth-open` (khép mở môi khi trò chuyện).
   - 12 morph targets cấu trúc khuôn mặt: `head-age-incr` (nếp nhăn tuổi tác), `head-scale-horiz-incr`, `chin-bones-incr`, `nose-greek-incr`, `nose-width1-incr`, `nose-hump-incr`, `head-oval`, `head-round`, `head-rectangular`, `head-invertedtriangular`, `l/r-cheek-bones-incr`.

3. **Mô Phỏng Nếp Vải Động (Dynamic Cloth & Vertex Shaders):**
   - Shader tùy biến `onBeforeCompile` trên `MeshStandardMaterial` tính toán dao động tà áo tunic và áo mantle theo bước chân (`clothPace`) và thời gian thực (`clothTime`).
   - Sóng vải cong dọc từ đai lưng xuống gấu áo, tạo độ rủ tự nhiên của vải len và lanh dày, không bị cứng như khối trụ đơn điệu.

4. **Kết Cấu Sợi Dệt Thủ Công (Procedural Procedural Normal Maps):**
   - Normal map dệt thủ công tạo sợi sợi ngang dọc (warp & weft) siêu nhẹ, phân biệt rõ độ thô ráp của lông lạc đà (`haircloth`), độ lì của da thuộc (`leather`), độ gân của vải len thô (`wool`) và độ mịn của vải lanh (`linen`).

5. **Chi Phí Tính Toán & Tối Ưu Hóa (Performance Budget):**
   - Số đa giác: ~12,000–16,000 tam giác cho toàn bộ nhân vật (gồm thân thể, áo trong, áo ngoài, khăn trùm, tóc, râu, dép và đạo cụ).
   - Render calls: Tối đa 8–12 draw calls cho mỗi nhân vật.
   - Chiếu bóng (Shadows): Soft shadows PCF với bias khử sọc sọc (shadow acne) và normal bias tối ưu.

---

## 7. Danh Mục Tài Liệu Tham Khảo Đối Chiếu

1. **Văn bản Kinh Thánh:** Bản dịch Phụng Vụ / USCCB / Vatican (St 12; Xh 3–4; 2 Sm 7; Is 7; Mt 2, 3, 5, 9, 26; Mc 14; Lc 2, 10, 22, 24; Ga 1, 6, 13, 19, 20, 21; Cv 2).
2. **Khảo cổ học Vải dệt Masada & Cave of Letters:** Yigael Yadin (1963), *The Finds from the Bar Kokhba Period in the Cave of Letters*; Orit Shamir (2015), *Textiles from the Judean Desert*.
3. **Phục trang Kinh Thánh & Bối cảnh Lịch sử:** Joan E. Taylor (2018), *What Did Jesus Wear? An Introduction to Christ's Appearance and Clothes in the First Century*, T&T Clark.
4. **Nghệ thuật & Khảo cổ Cận Đông Cổ đại:** The Metropolitan Museum of Art, *Ancient Near Eastern Art*, Bulletin 41/4 (1984); British Museum, *A Researcher's Guide to the Lachish Collection* (2006).
5. **Hệ thống Dữ liệu Giải phẫu 3D:** MakeHuman Team / MPFB project, CC0 mesh topology & skeletal weighting commit `6ff1eb35`.
