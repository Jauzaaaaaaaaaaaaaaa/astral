/* Bot Tanya-Jawab tanpa AI: mencari di basis pengetahuan lokal (knowledge.js). */
(() => {
  const KB = window.KB;
  const norm = s => " " + s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim() + " ";
  const has = (text, words) => words.some(w => text.includes(w));
  const articleLink = z => ({ title: "Artikel lengkap " + z.name, url: "zodiak/" + z.name.toLowerCase() + ".html" });

  function findZodiak(text) {
    const found = [];
    for (const z of KB.zodiak) {
      const keys = [z.name, ...z.alias].map(k => k.toLowerCase());
      if (keys.some(k => text.includes(" " + k + " "))) found.push(z);
    }
    return found;
  }

  function faq(text) {
    const hit = KB.faq.find(f => f.k.some(k => text.includes(" " + k + " ") || text.includes(k)));
    return hit ? { text: hit.a, sources: KB.sources } : null;
  }

  const lines = list => list.map(([t, d]) => `- **${t}**: ${d}`).join("\n");
  const LIFE = window.LIFE || { element: {}, zodiak: {} };
  const SUPER = window.SUPER || [];
  const ASTRO = ["zodiak", "zodiac", "astrologi", "horoskop", "bintang", "rasi", "elemen", "planet", "shio", "retrograde", "natal", "ascendant", "rising", "cusp"];
  const TOPICS = [
    ["food", ["makanan", "makan", "kuliner", "minuman", "jajanan", "camilan", "menu"]],
    ["travel", ["liburan", "wisata", "travel", "destinasi", "jalan jalan", "traveling", "berlibur", "vakansi"]],
    ["fashion", ["pakaian", "berpakaian", "fashion", "outfit", "gaya busana", "busana", "baju", "gaya style", "style"]],
    ["money", ["uang", "keuangan", "finansial", "menabung", "investasi", "boros", "hemat", "gaji", "kaya"]],
    ["work", ["gaya kerja", "sifat kerja", "cara kerja", "rekan kerja", "sebagai bos", "sebagai karyawan", "di kantor", "etos kerja"]]
  ];
  const detectTopic = text => (TOPICS.find(([, ks]) => ks.some(k => text.includes(" " + k + " "))) || [])[0];
  const bullets = items => "Alasannya:\n" + items.map(([t, d]) => t ? `- **${t}**: ${d}` : `- ${d}`).join("\n");

  /* Bank tanya-jawab hasil generate (tools/generate-qa.js): cocokkan dengan kemiripan kata */
  const STOP = new Set("apa apakah yang itu ini dong deh sih ya di ke dari untuk buat dan atau si adalah tentang soal".split(" "));
  const SYN = { favorit: "suka", kesukaan: "suka", disukai: "suka", menyukai: "suka", makan: "makanan", kuliner: "makanan", pakaian: "fashion", berpakaian: "fashion", busana: "fashion", outfit: "fashion", style: "fashion", berlibur: "liburan", wisata: "liburan", travel: "liburan", traveling: "liburan", destinasi: "liburan", karir: "karier", pekerjaan: "karier", profesi: "karier", cocok: "cocok", kecocokan: "cocok", pasangan: "cocok", jodoh: "cocok", keuangan: "uang", finansial: "uang", duit: "uang", sifat: "karakter", kepribadian: "karakter" };
  const tok = t => new Set(t.trim().split(" ").filter(w => w && !STOP.has(w)).map(w => SYN[w] || w));
  const zodSet = text => KB.zodiak.filter(z => [z.name, ...z.alias].some(k => text.includes(" " + k.toLowerCase() + " "))).map(z => z.name).sort().join(",");
  let bankIdx = null;
  function fromBank(text) {
    const bank = window.QABANK || [];
    if (!bank.length) return null;
    if (!bankIdx) bankIdx = bank.map(x => { const n = norm(x.q); return { x, t: tok(n), z: zodSet(n) }; });
    const q = tok(text), qz = zodSet(text);
    if (q.size < 2) return null;
    let best = null, bs = 0;
    for (const b of bankIdx) {
      if (b.z !== qz) continue;
      let inter = 0; for (const w of q) if (b.t.has(w)) inter++;
      const sc = inter / (q.size + b.t.size - inter);
      if (sc > bs) { bs = sc; best = b; }
    }
    if (!best || bs < 0.6) return null;
    const zs = KB.zodiak.filter(z => qz.split(",").includes(z.name));
    return { text: best.x.a, sources: [...zs.map(articleLink), ...KB.sources] };
  }

  function superlative(text) {
    if (!has(text, [" zodiak ", " zodiac ", " paling ", " bintang "])) return null;
    const hit = SUPER.find(x => x.k.some(k => text.includes(" " + k + " ") || text.includes(" " + k)));
    if (!hit) return null;
    const z = KB.zodiak.find(q => q.name === hit.z);
    return { text: `**${hit.z}** ${hit.a}\n` + bullets(hit.why), sources: [articleLink(z), ...KB.sources] };
  }

  function lifestyle(z, topic) {
    const d = (LIFE.zodiak[z.name] || {})[topic];
    if (!d) return null;
    const el = (LIFE.element[topic] || {})[z.element];
    const why = [];
    if (el) why.push([null, el]);
    why.push([null, d[1]]);
    return { text: `**${z.name}** ${d[0]}\n` + bullets(why), sources: [articleLink(z), ...KB.sources] };
  }

  function answer(question) {
    const text = norm(question.trim());
    const banked = fromBank(text);
    if (banked) return banked;
    const zs = findZodiak(text);

    if (zs.length === 0) {
      const hit = superlative(text) || faq(text);
      if (hit) return hit;
      if (!has(text, ASTRO.map(w => " " + w + " "))) {
        return {
          text: "Maaf, aku hanya bisa menjawab pertanyaan seputar zodiak dan astrologi. Coba tanyakan hal seperti \"zodiak paling setia\", \"makanan kesukaan Pisces\", atau \"kecocokan Taurus dan Cancer\".",
          sources: []
        };
      }
      return {
        text: "Aku belum punya jawaban untuk pertanyaan itu. Coba sebut zodiaknya atau sifat yang kamu cari, misalnya \"zodiak paling pendendam\", \"gaya berpakaian Scorpio\", atau \"pekerjaan ideal untuk Virgo\".",
        sources: []
      };
    }

    const z = zs[0];
    const src = [articleLink(z), ...KB.sources];

    if (zs.length >= 2) {
      const b = zs[1];
      const ok = z.match.includes(b.name) || b.match.includes(z.name);
      const bad = z.avoid.includes(b.name) || b.avoid.includes(z.name);
      const verdict = ok ? "tergolong cocok" : bad ? "kurang selaras" : "cukup netral";
      const rel = z.element === b.element ? `Sama-sama elemen ${z.element}, jadi ritme dan cara merasakan hidupnya mirip.`
        : (KB.elements[z.element] || "").includes(b.element.toLowerCase()) ? KB.elements[z.element]
        : `${z.name} (elemen ${z.element}) dan ${b.name} (elemen ${b.element}) punya energi yang berbeda, jadi butuh saling menyesuaikan.`;
      return {
        text: `**${z.name}** dan **${b.name}** ${verdict} menurut tradisi zodiak.\n` + bullets([
          ["Elemen", rel],
          [z.name, z.love],
          [b.name, b.love]
        ]),
        sources: [articleLink(z), articleLink(b), ...KB.sources]
      };
    }

    const topic = detectTopic(text);
    if (topic && !(topic === "money" && has(text, ["kelebihan", "kekurangan"]))) {
      const r = lifestyle(z, topic);
      if (r) return r;
    }

    if (has(text, ["kekurangan", "kelemahan", "negatif"])) {
      return { text: `Kekurangan **${z.name}**:\n` + lines(z.weaknesses), sources: src };
    }
    if (has(text, ["kelebihan", "keunggulan", "kekuatan", "positif"])) {
      return { text: `Kelebihan **${z.name}**:\n` + lines(z.strengths), sources: src };
    }
    if (has(text, ["sifat", "karakter", "ciri", "kepribadian"])) {
      return {
        text: `Sifat **${z.name}**:\n` + lines(z.strengths) + `\nKekurangan:\n` + lines(z.weaknesses),
        sources: src
      };
    }
    if (has(text, ["cinta", "pasangan", "jodoh", "kecocokan", "cocok", "hubungan", "pacar"])) {
      return {
        text: `**${z.name}** paling cocok dengan ${z.match.join(", ")}.\n` + bullets([
          ["Dalam hubungan", z.love],
          ["Elemen " + z.element, KB.elements[z.element] || ""],
          ["Kurang selaras", z.avoid.join(", ") + " cenderung butuh lebih banyak penyesuaian."]
        ]),
        sources: src
      };
    }
    if (has(text, ["karier", "karir", "kerja", "pekerjaan", "profesi"])) {
      const w = (LIFE.zodiak[z.name] || {}).work;
      return {
        text: `Pekerjaan ideal untuk **${z.name}**: ${z.career.join(", ")}.\n` + bullets([
          [null, (LIFE.element.work || {})[z.element] || ""],
          [null, w ? w[1] : ""]
        ].filter(x => x[1])),
        sources: src
      };
    }
    if (has(text, ["elemen"])) {
      return {
        text: `Elemen **${z.name}** adalah ${z.element}.\n${KB.elements[z.element] || ""}`.trim(),
        sources: [articleLink(z), KB.sources[0]]
      };
    }
    if (has(text, ["planet", "penguasa", "ruler"])) {
      return { text: `Planet penguasa **${z.name}** adalah ${z.ruler}.`, sources: [articleLink(z), KB.sources[0]] };
    }
    if (has(text, ["tanggal", "lahir", "kapan"])) {
      return { text: `**${z.name}** berlaku pada ${z.dates}.`, sources: [articleLink(z), KB.sources[0]] };
    }

    const traits = z.strengths.slice(0, 3).map(s => s[0].toLowerCase()).join(", ");
    return {
      text: `**${z.name}** (${z.dates}) adalah zodiak elemen ${z.element} yang dikuasai ${z.ruler}.\n` +
            `Sifat menonjolnya: ${traits}.\n` +
            `Tanyakan juga: kelebihan, kekurangan, cinta, atau karier ${z.name}.`,
      sources: src
    };
  }

  window.Bot = { answer };
})();
