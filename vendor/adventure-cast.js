(() => {
  "use strict";

  // The order within each portrait sheet is left to right, then top to bottom.
  const sheets = {
    "portraits-rpg-kharan": ["naor", "abinoam", "hanani", "elia", "zimri", "maacah"],
    "portraits-rpg-galilee": ["deborah", "maacah-loaves", "amos", "zipporah", "ahio", "tabeal"],
    "portraits-rpg-jerusalem": ["jephunneh", "ruth", "ezra", "damar", "nera", "sarai"]
  };
  const portraits = {};
  for (const [sheet, ids] of Object.entries(sheets)) {
    ids.forEach((id, index) => {
      if (id) portraits[id] = {
        file: sheet + ".webp", size: "300% 200%", position: (index % 3) * 50 + "% " + (index > 2 ? 100 : 0) + "%",
        column: index % 3, row: index > 2 ? 1 : 0, columns: 3, rows: 2
      };
    });
  }

  function look(palette, build, height, item, gesture, activity) {
    return { palette, build, height, item, gesture, activity };
  }

  const people = {
    naor: look(["#6b5036", "#96703f", "#bc995e", "#af7756", "#aca096", "hood", .115, .27],
      1.04, 1.00, "rope", "work", "Đang cuộn dây lều"),
    abinoam: look(["#7e7154", "#654534", "#bda278", "#b5825b", "#44312b", "wrap", .035, .39],
      .92, 1.03, "staff", "watch", "Đang nhìn về phía đàn dê"),
    hanani: look(["#b39b75", "#713a37", "#c79858", "#bd8663", "#92847a", "hood", .055, .28],
      .96, .97, "tablet", "read", "Đang xem lại bảng trực"),
    elia: look(["#b6a27d", "#606543", "#c2ae83", "#b7805e", "#584339", "veil", 0, .24],
      .92, .94, "jar", "carry", "Đang coi nước ven kênh"),
    zimri: look(["#6b6654", "#3d4d5b", "#a9a080", "#ad7756", "#bdb4a6", "hood", .104, .29],
      1.04, .98, "staff", "watch", "Đang trông đàn"),
    maacah: look(["#4e6b66", "#845441", "#bca077", "#a66c4d", "#382923", "wrap", .055, .39],
      1.09, 1.03, "rope", "work", "Đang gỡ một nút lưới"),
    deborah: look(["#465868", "#a38052", "#c5a16a", "#b57e5d", "#7a6a5d", "veil", 0, .23],
      .97, .96, "bag", "watch", "Đang đợi khách đến muộn"),
    "maacah-loaves": look(["#82513f", "#3b4567", "#aa7561", "#b98364", "#3f2e2b", "veil", 0, .23],
      .95, .95, "basket", "carry", "Đang sắp giỏ"),
    amos: look(["#925e43", "#605841", "#ac8d60", "#a96d4d", "#49382d", "wrap", .058, .36],
      1.05, 1.02, "lantern", "watch", "Đang để mắt tới khúc cua"),
    zipporah: look(["#9e5942", "#454d69", "#c09e75", "#b27e5d", "#47332c", "veil", 0, .24],
      .94, .97, "jar", "carry", "Đang mang nước"),
    ahio: look(["#60644a", "#7c7d67", "#b4a485", "#ab7454", "#887567", "wrap", .062, .34],
      .97, 1.00, "bag", "work", "Đang xem gốc ô liu"),
    tabeal: look(["#b5a08a", "#753c45", "#c3a77c", "#b68163", "#3a2923", "veil", 0, .25],
      .94, 1.01, "bag", "watch", "Đang nhìn lối qua dốc"),
    jephunneh: look(["#938568", "#777c63", "#afa485", "#ad7c59", "#bcad98", "hood", .122, .25],
      .98, .97, "staff", "watch", "Đang trông vườn"),
    ruth: look(["#365b5e", "#b08a4f", "#c7a577", "#b27b55", "#685044", "veil", 0, .25],
      .99, .95, "basket", "carry", "Đang lo bữa tối"),
    ezra: look(["#bcaa8d", "#535e75", "#a79372", "#bc8360", "#3b2c26", "wrap", .046, .33],
      1.04, 1.02, "tablet", "read", "Đang xem đường cho khách"),
    damar: look(["#b19a75", "#784e3e", "#c4a474", "#b4805b", "#bcb1a1", "hood", .052, .33],
      1.00, 1.01, "jar", "carry", "Đang kiểm tra vò nước"),
    nera: look(["#6b4c44", "#8b483c", "#bd9167", "#b48262", "#46322a", "wrap", 0, .24],
      .93, .96, "jar", "work", "Đang xem miệng vò"),
    sarai: look(["#8c4650", "#c2b092", "#d1ba8d", "#b7815e", "#564338", "veil", 0, .25],
      .96, .97)
  };

  function asset(file) {
    return globalThis.AdventureAssets?.[file] ?? "./assets/" + file;
  }

  function portrait(id) {
    const art = portraits[id];
    return art ? { ...art, url: asset(art.file) } : null;
  }

  globalThis.AdventureCast = { people, portrait, asset };
})();
