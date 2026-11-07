(() => {
  "use strict";

  // Visual interpretation, not recovered portraits. Evidence and dating are in
  // docs/character-research.md. A name reused by an illustrative NPC does not
  // identify that NPC with a person in Scripture.
  const eras = {
    patriarchs: "Thế giới truyện các tổ phụ",
    exodus: "Bối cảnh truyện Xuất Hành",
    monarchy: "Israel và Giuđa thời quân chủ",
    gospel: "Giuđê và Galilê · thế kỷ I"
  };
  const profiles = {};
  function person(id, name, era, values) {
    profiles[id] = {
      id, name, era, period: eras[era], kind: "biblical", gender: "male",
      skin: "#aa7654", hairColor: "#30251f", tunic: "#c7b38f", mantle: "#766348", trim: "#bca47c",
      eyeColor: "#4b3021", age: .25, face: "oval", faceWidth: 0, cheek: .25, noseWidth: .12, noseBridge: .22, chin: .12,
      build: 1, height: 1, hem: .28, sleeve: .80, cloth: "linen", cloak: "shoulder",
      headcover: "bare", hair: "waves", hairLength: .045, beard: .045, belt: "cord",
      gesture: "listen", item: null, stride: 1, stoop: 0, ornament: "none", ...values
    };
  }
  person("abram", "Ápram", "patriarchs", {
    age: .80, face: "rectangular", faceWidth: .15, chin: .48, noseBridge: .44,
    tunic: "#b49a74", mantle: "#6c5342", hairColor: "#8a8172", hair: "receding",
    beard: .105, headcover: "shawl", cloth: "wool", hem: .24, item: "staff", gesture: "watch", stoop: .025,
    culture: "Áo dệt giản dị, áo khoác chống gió và hành trang đoàn lữ hành; niên đại chính xác của truyện tổ phụ còn được thảo luận.",
    evidence: "St 12,1–9 cho biết hành trình; kiểu áo, màu và gương mặt được suy dựng."
  });
  person("sarai", "Sarai", "patriarchs", {
    gender: "female", age: .65, face: "oval", faceWidth: -.10, cheek: .52,
    tunic: "#a07660", mantle: "#c7b694", hairColor: "#51453a", hair: "braids", beard: 0,
    headcover: "veil", hem: .075, sleeve: 1, build: .95, height: .96,
    culture: "Áo dài, khăn choàng che đầu và túi hành trang trong bối cảnh đoàn lữ hành.",
    evidence: "St 12,5 xác định Sarai cùng đi; thiết kế phục trang là suy dựng."
  });
  person("moses", "Môsê", "exodus", {
    age: .66, face: "rectangular", faceWidth: .10, chin: .40, noseBridge: .42, cheek: .4,
    tunic: "#a99875", mantle: "#675d47", cloth: "wool", headcover: "shawl", hem: .37,
    hairColor: "#625a4c", beard: .09, item: "staff", gesture: "watch", build: 1.035,
    culture: "Người chăn đàn ở Mađian; gậy gỗ, áo khoác thô và dép da có thể tháo.",
    evidence: "Xh 3,1.5–6: chăn đàn, cởi dép và che mặt. Không xác định được chân dung lịch sử."
  });
  person("nathan", "Ngôn sứ Nathan", "monarchy", {
    age: .67, face: "invertedtriangular", faceWidth: -.05, chin: .35, cheek: .52,
    tunic: "#c6b38f", mantle: "#786a57", hairColor: "#7b7163", beard: .08, headcover: "shawl",
    cloth: "wool", gesture: "explain", hem: .20,
    culture: "Áo dệt và áo khoác hình chữ nhật; không dùng phẩm phục giáo sĩ thời sau.",
    evidence: "2 Sm 7,1–17 kể lời sấm; màu áo và tuổi biểu kiến là lựa chọn nghệ thuật."
  });
  person("isaiah", "Ngôn sứ Isaia", "monarchy", {
    age: .48, face: "oval", faceWidth: -.18, noseBridge: .44, cheek: .55,
    tunic: "#b6a88a", mantle: "#756658", hairColor: "#3d3229", beard: .068, headcover: "bare",
    cloth: "wool", gesture: "explain", hem: .23, item: "scroll",
    culture: "Ngôn sứ ở Giuđa; mang cuộn sấm ngôn da dê, trang phục dệt địa phương, dép da và áo khoác giữ ấm.",
    evidence: "Is 7,1–9 đặt cảnh ở Giuđa thời Akhát; cuộn sấm ngôn và chân dung là suy dựng có căn cứ khảo cổ."
  });
  person("david", "Vua Đavít", "monarchy", {
    age: .58, face: "rectangular", faceWidth: .28, chin: .6, noseWidth: .2,
    tunic: "#c4af88", mantle: "#815448", trim: "#c29f62", hairColor: "#655447", beard: .075,
    cloth: "wool", hem: .12, sleeve: 1, ornament: "woven-border", headcover: "bare", build: 1.06, belt: "sash",
    culture: "Chất vải và đường viền phân biệt địa vị hoàng gia đồ sắt; thắt đai dệt trang trọng, tránh vương miện châu Âu thời Trung cổ.",
    evidence: "2 Sm 7 không mô tả bộ áo; áo khoác viền là suy dựng về địa vị."
  });
  person("ahaz", "Vua Akhát", "monarchy", {
    age: .30, face: "round", faceWidth: .22, chin: .20, cheek: .3,
    tunic: "#bba98d", mantle: "#6e5966", trim: "#b49460", beard: .028, hair: "crop",
    hem: .12, sleeve: 1, ornament: "woven-border", build: 1.035, belt: "sash",
    culture: "Vua Giuđa trong Is 7; áo dệt có viền và đai thắt biểu thị triều đình, không mặc giáp hiệp sĩ.",
    evidence: "Is 7,1 xác định Akhát là vua Giuđa; phục trang và khuôn mặt được suy dựng."
  });
  person("jesus", "Đức Giêsu", "gospel", {
    age: .34, face: "oval", faceWidth: .02, chin: .43, cheek: .50, noseWidth: .16, noseBridge: .34,
    skin: "#ad7958", tunic: "#cabb9e", mantle: "#9a8668", hairColor: "#33271f", hair: "waves",
    hairLength: .145, beard: .034, hem: .24, sleeve: .83, gesture: "teach", belt: "cord",
    culture: "Người Do Thái ở Galilê thế kỷ I; tunic lanh mộc dệt liền, áo khoác len sa mạc, dép quai da và tua áo tzitzit bốn góc theo Luật Mô-sê.",
    evidence: "Ga 19,23: tunic dệt liền; Mt 9,20 nhắc tua áo; Mt 5,1 ngồi giảng dạy. Kinh Thánh không lưu một chân dung xác định."
  });
  person("jesus-supper", "Đức Giêsu · rửa chân", "gospel", {
    ...profiles.jesus, id: "jesus-supper", name: "Đức Giêsu · rửa chân", cloak: "none", belt: "towel", gesture: "serve", item: "basin",
    culture: "Áo ngoài được cởi, tấm khăn vải lanh trắng dài buộc ngang lưng, quỳ gối rửa chân các môn đệ trong cử chỉ yêu thương phục vụ.", evidence: "Ga 13,4–12. Cùng gương mặt với Đức Giêsu ở các chặng khác."
  });
  person("john-baptist", "Gioan Tẩy Giả", "gospel", {
    age: .29, face: "rectangular", faceWidth: -.18, cheek: .65, chin: .34, noseBridge: .46,
    tunic: "#88714f", mantle: "#a48a61", cloth: "haircloth", cloak: "none", belt: "leather",
    headcover: "bare", hair: "curls", hairLength: .09, beard: .095, hem: .46, sleeve: .42,
    build: .94, gesture: "explain",
    culture: "Áo lông lạc đà, đai da, dáng sống hoang địa; không dùng áo choàng cung đình.",
    evidence: "Mt 3,4 trực tiếp mô tả áo lông lạc đà và đai da. Kiểu cắt và gương mặt là suy dựng."
  });
  person("andrew", "Anrê", "gospel", {
    age: .33, face: "rectangular", faceWidth: .15, cheek: .34, chin: .5,
    tunic: "#a8a184", mantle: "#62716b", hair: "curls", beard: .046, hem: .40,
    sleeve: .63, build: 1.05, gesture: "work",
    culture: "Người làm nghề chài lưới; áo làm việc gọn, vai áo có vết mòn và dây buộc giản dị.",
    evidence: "Mt 4,18–20: Simôn và Anrê đang thả lưới. Màu và vết mòn là lựa chọn tạo hình."
  });
  person("peter", "Simôn Phêrô", "gospel", {
    age: .43, face: "round", faceWidth: .25, chin: .54, cheek: .32, noseWidth: .29,
    tunic: "#ae9a79", mantle: "#75634e", hairColor: "#51483d", hair: "receding", beard: .057,
    hem: .37, sleeve: .66, build: 1.10, gesture: "explain", stride: 1.03,
    culture: "Giữ cùng gương mặt ở bờ Giođan, Tiệc Ly, vườn ô liu và lễ Ngũ Tuần.",
    evidence: "Ga 1,40–42; Ga 13; Cv 2. Tuổi biểu kiến và đường chân tóc là diễn giải nghệ thuật."
  });
  person("mary", "Đức Maria", "gospel", {
    gender: "female", age: .66, face: "oval", faceWidth: -.08, cheek: .43,
    tunic: "#a7987c", mantle: "#6b7780", hairColor: "#5e5449", hair: "braids", beard: 0,
    hem: .075, sleeve: 1, headcover: "veil", height: .955, build: .95, gesture: "listen",
    culture: "Áo dài và khăn khoác giản dị. Sắc lam trầm là lựa chọn mỹ thuật, không phải màu áo đã được xác minh.",
    evidence: "Ga 19,25–27 xác định sự hiện diện bên thập giá; không mô tả gương mặt hay màu áo."
  });
  person("magdalene", "Maria Mácđala", "gospel", {
    gender: "female", age: .30, face: "invertedtriangular", faceWidth: .04, cheek: .48,
    tunic: "#a98c78", mantle: "#796a77", hair: "braids", beard: 0, headcover: "veil",
    hem: .08, sleeve: 1, build: .96, height: .97, gesture: "listen",
    culture: "Trang phục người nữ địa phương; không gán dấu hiệu nghề nghiệp hay tiểu sử không có trong đoạn Tin Mừng.",
    evidence: "Ga 20,1–18. Khăn, màu vải và gương mặt là diễn giải, không phải chân dung khảo cổ."
  });
  person("philip", "Philípphê", "gospel", {
    age: .28, face: "invertedtriangular", faceWidth: -.13, cheek: .5, chin: .2,
    tunic: "#b8a98b", mantle: "#657175", beard: .031, hem: .34, hair: "crop",
    culture: "Áo dệt, áo khoác gấp trên vai và dép; khác gương mặt và dáng người Anrê.", evidence: "Ga 6,5–9 đặt Philípphê trong cảnh; phục trang suy dựng."
  });
  person("cleopas", "Clêôpát", "gospel", {
    age: .48, face: "oval", faceWidth: .1, cheek: .32, noseBridge: .4,
    tunic: "#b4a184", mantle: "#716d5e", headcover: "shawl", beard: .055, item: "bag", gesture: "greet",
    culture: "Người đi đường dốc tới Emmau; áo khoác giữ ấm buổi chiều, túi hành trang và cử chỉ hiếu khách mời người lữ hành ở lại dùng bữa.", evidence: "Lc 24,13–35; kiểu túi, cử chỉ và khuôn mặt là suy dựng."
  });
  person("samaritan", "Người Samari", "gospel", {
    kind: "parable", age: .4, face: "rectangular", faceWidth: .12, chin: .37,
    tunic: "#b6aa8e", mantle: "#68817b", beard: .045, item: "bag", gesture: "serve", hem: .32,
    culture: "Nhân vật trong dụ ngôn; túi hành trang, dầu và băng vải gợi hành động chăm sóc. Không tạo khác biệt sắc tộc bằng khuôn mặt cường điệu.",
    evidence: "Lc 10,30–37. Đồ mặc và chân dung là minh họa dụ ngôn."
  });
  person("scholar", "Người thông luật", "gospel", {
    age: .54, face: "invertedtriangular", faceWidth: -.05, cheek: .48,
    tunic: "#c6baa1", mantle: "#756b61", hairColor: "#63584b", beard: .06, hem: .17, sleeve: .95,
    item: "scroll", gesture: "explain",
    culture: "Người đối thoại thông thái trong Lc 10; mang cuộn da chép lề luật Mô-sê, áo dài dệt tinh xảo có viền thanh lịch và tua áo tzitzit.", evidence: "Lc 10,25–29; phục trang và tuổi được diễn giải có căn cứ khảo cổ."
  });
  person("disciple", "Một môn đệ", "gospel", {
    age: .18, face: "oval", faceWidth: -.1, beard: .016, tunic: "#b2aa8f", mantle: "#6b7782",
    culture: "Tunic dệt đơn giản, áo khoác và dép; không đồng nhất người môn đệ vô danh với một Tông đồ xác định.", evidence: "Gương mặt minh họa cho vai người môn đệ trong các cảnh."
  });
  person("beloved", "Người môn đệ được yêu mến", "gospel", {
    ...profiles.disciple, id: "beloved", name: "Người môn đệ được yêu mến", face: "invertedtriangular", age: .18,
    mantle: "#827365", beard: .013, evidence: "Ga 19,26–27 không nêu tên người môn đệ trong đoạn này. Chân dung được diễn giải."
  });
  person("shepherd", "Một mục đồng", "gospel", {
    age: .28, face: "round", faceWidth: .18, tunic: "#a59775", mantle: "#645e49", cloth: "wool",
    hem: .43, sleeve: .64, item: "staff", headcover: "shawl", beard: .026, gesture: "watch",
    culture: "Lớp áo khoác len chống lạnh khi trông đàn ban đêm; gậy gỗ và dép da.", evidence: "Lc 2,8 nói mục đồng thức đêm ngoài đồng; áo khoác là suy dựng theo công năng."
  });
  person("angel", "Sứ thần", "gospel", {
    age: .2, face: "oval", beard: 0, tunic: "#dfd6c0", mantle: "#c9c0ab", hairColor: "#504537",
    hem: .09, sleeve: 1, headcover: "bare", gesture: "explain",
    culture: "Áo sáng biểu thị ngôn ngữ bản văn; không coi sứ thần là một nhóm người có thể phục dựng bằng khảo cổ.",
    evidence: "Ga 20,12 mô tả hai thiên thần mặc áo trắng. Tạo hình là diễn giải tôn giáo."
  });
  person("traveler", "Người lữ hành", "gospel", {
    age: .35, face: "rectangular", faceWidth: -.08, beard: .036, tunic: "#b09b7c", mantle: "#7c6a55", item: "bag",
    kind: "illustrative", culture: "Người đi đường với túi nhỏ và áo khoác.", evidence: "Nhân vật minh họa, không phải chân dung lịch sử."
  });
  person("patient", "Người bị nạn", "gospel", {
    ...profiles.traveler, id: "patient", name: "Người bị nạn", kind: "parable", item: null, cloak: "none",
    tunic: "#b3a28c", evidence: "Lc 10,30–35; minh họa người bị nạn trong dụ ngôn, không thêm thương tích đồ họa."
  });

  const npcNames = {
    naor: "Ông Naor", abinoam: "Ông Abinoam", hanani: "Ông Hanani", elia: "Bà Elia", zimri: "Ông Zimri",
    maacah: "Ông Maacah", "maacah-loaves": "Bà Maacah", deborah: "Bà Deborah", amos: "Ông Amos",
    zipporah: "Bà Zipporah", ahio: "Ông Ahio", tabeal: "Bà Tabeal", jephunneh: "Ông Jephunneh",
    ruth: "Bà Ruth", ezra: "Ông Ezra", damar: "Ông Đamar", nera: "Bà Nêra"
  };
  const npcEras = { naor: "patriarchs", damar: "patriarchs", nera: "patriarchs", abinoam: "exodus", hanani: "monarchy", elia: "monarchy" };
  const women = new Set(["elia", "maacah-loaves", "deborah", "zipporah", "tabeal", "ruth", "nera"]);
  Object.entries(npcNames).forEach(([id, name], index) => {
    const old = AdventureCast.people[id];
    const [tunic, mantle, trim, skin, hairColor] = old.palette;
    const female = women.has(id);
    person(id, name, npcEras[id] ?? "gospel", {
      ...old, id, name, kind: "illustrative", gender: female ? "female" : "male",
      tunic, mantle, trim, skin, hairColor, age: ["naor", "abinoam", "hanani", "zimri", "jephunneh", "damar"].includes(id) ? .78 : .22 + index % 4 * .10,
      face: ["oval", "round", "rectangular", "invertedtriangular"][index % 4], faceWidth: ((index * 7) % 9 - 4) * .06,
      cheek: .18 + (index % 5) * .1, noseWidth: ((index * 3) % 7) * .065, chin: (index % 4) * .16,
      hair: female ? "braids" : index % 3 === 0 ? "receding" : index % 3 === 1 ? "curls" : "crop",
      headcover: female ? "veil" : ["naor", "abinoam", "jephunneh"].includes(id) ? "shawl" : "bare",
      beard: female ? 0 : old.palette[6], hem: female ? .075 : .26 + index % 3 * .055,
      cloth: ["naor", "abinoam", "zimri"].includes(id) ? "wool" : "linen",
      sleeve: ["maacah", "nera", "ahio"].includes(id) ? .58 : .82,
      item: id === "amos" ? "oil-lamp" : id === "maacah" ? "net" : old.item,
      culture: { net: "Vá lưới với sợi lanh và nút thắt; tay giữ phần lưới đang làm.", tablet: "Bảng ghi và bút sậy minh họa công việc ghi chép; hình thức cụ thể tùy bối cảnh.", jar: "Vò gốm và tay nâng đỡ, áo làm việc có dấu đất và bụi.", basket: "Giỏ đan và hai tay đỡ vật nặng trước thân.", staff: "Gậy gỗ, áo khoác giữ ấm và dáng quan sát đàn.", rope: "Cuộn dây, đai buộc vải và bàn tay đang làm việc." }[old.item] ?? "Đồ dệt, túi vải và vật dụng phù hợp công việc trong cảnh minh họa.",
      evidence: "NPC do game sáng tác. Tên riêng không đồng nhất với nhân vật trùng tên trong Kinh Thánh."
    });
  });
  person("yiftach", "Ông Yiftach", "exodus", {
    ...profiles.traveler, id: "yiftach", name: "Ông Yiftach", era: "exodus", period: eras.exodus,
    headcover: "shawl", item: "staff", beard: .058, age: .55,
    evidence: "NPC dẫn đường do game sáng tác; không phải thủ lãnh Giéptác."
  });
  person("guard", "Người hướng dẫn sân gậy", "gospel", {
    ...profiles.traveler, id: "guard", name: "Người hướng dẫn sân gậy", item: null,
    tunic: "#8c866a", mantle: "#74664e", cloak: "none", hem: .46, sleeve: .5, build: 1.08,
    culture: "Áo làm việc ngắn, gậy tập bằng gỗ; hoạt động luyện tập là lớp minh họa của game."
  });
  const aliases = { loaves: "andrew", supper: "peter", garden: "peter", sent: "peter", simon: "peter", cross: "beloved", emmaus: "cleopas", mount: "disciple", neighbor: "scholar", woman: "mary", elder: "traveler", man: "traveler", guide: "traveler" };
  function get(id) { return profiles[id] ?? profiles[aliases[id]] ?? profiles.traveler; }
  function resolve(role, appearance) { return get(appearance || role); }
  globalThis.CharacterProfiles = { profiles, eras, get, resolve, version: "character-portrait-3" };
})();
