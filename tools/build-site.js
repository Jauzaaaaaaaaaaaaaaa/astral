#!/usr/bin/env node
/* Membangun halaman statis Astral dari site.config.js + data zodiak.
   Menghasilkan: index.html, zodiak/*.html (12 artikel + indeks), about/contact/privacy/terms/editorial/404,
   ads.txt, robots.txt, sitemap.xml.   Pakai:  node tools/build-site.js
   Multibahasa (opsional, dipakai versi AdSense): site.config.js berisi languages: ["en","id",...] dan defaultLang.
   Terjemahan ada di i18n/<kode>.json berbentuk {"teks Indonesia": "terjemahan"}. Bahasa default di akar situs,
   bahasa lain di /<kode>/. Tanpa languages, hasilnya sama persis dengan versi Indonesia sebelumnya.
   extraPages: true menambah halaman per tanggal (366), per bulan (12), dan kecocokan per zodiak (12) di tiap bahasa. */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const cfg = require(path.join(ROOT, "site.config.js"));

global.window = {};
for (const f of ["zodiac-data", "knowledge", "lifestyle", "zodiak-lengkap"]) eval(fs.readFileSync(path.join(ROOT, "assets/js", f + ".js"), "utf8"));
const Z = window.ZODIAC, KB = window.KB, LIFE = window.LIFE, ZX = window.ZX, ZI = window.ZINFO;

const URL_ = cfg.siteUrl.replace(/\/+$/, ""), NAME = cfg.siteName;
const adsOn = /^ca-pub-\d{10,20}$/.test(cfg.publisherId);
/* Palet: Kehampaan #060814, Rigel #a9c8ff, Nebula #7c5cff, Capella #f2d7a0. Elemen memakai turunan palet. */
const ACC = { Api: "#f2d7a0", Tanah: "#dfe6f5", Udara: "#a9c8ff", Air: "#a993ff" };
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const now = process.env.BUILD_DATE ? new Date(process.env.BUILD_DATE + "T00:00:00") : new Date();
const ISO = now.toISOString().slice(0, 10), YEAR = now.getFullYear();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const jsonLd = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
/* Versi aset diisi otomatis dari isi file, jadi browser selalu memuat versi terbaru setelah build. */
const hashCache = {};
const assetHash = rel => hashCache[rel] || (hashCache[rel] = (() => { try { return require("crypto").createHash("md5").update(fs.readFileSync(path.join(ROOT, rel))).digest("hex").slice(0, 8); } catch { return "0"; } })());
const stampAssets = txt => typeof txt === "string" ? txt.replace(/(assets\/[\w\-\/]+\.(?:js|css))\?v=[\w]+/g, (m, f) => `${f}?v=${assetHash(f)}`) : txt;
const write = (rel, txt) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, rel.endsWith(".html") ? stampAssets(txt) : txt); };
const kb = Object.fromEntries(KB.zodiak.map(k => [k.name, k]));

/* ---------- Bahasa ---------- */
/* Bahasa tanpa berkas i18n/<kode>.json dilewati, supaya halaman setengah Indonesia tidak ikut terbit. */
const adaKamus = l => l === "id" || fs.existsSync(path.join(ROOT, "i18n", l + ".json"));
const DILEWATI = (cfg.languages || []).filter(l => !adaKamus(l));
const LANGS = (cfg.languages || ["id"]).filter(adaKamus), DEF = cfg.defaultLang || LANGS[0], MULTI = LANGS.length > 1, EXTRA = !!cfg.extraPages;
const LANG_NAMA = { en: "English", id: "Bahasa Indonesia", es: "Español", pt: "Português", fr: "Français", de: "Deutsch", ja: "日本語" };
const kamus = l => { const f = path.join(ROOT, "i18n", l + ".json"); return l !== "id" && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {}; };
const DICTS = Object.fromEntries(LANGS.map(l => [l, kamus(l)]));
let LG = "id", D = {}, P = "";
const MISS = {};
/* Teks sumber selalu bahasa Indonesia; {nama} diisi dari v. Teks tanpa terjemahan tetap tampil dalam bahasa Indonesia dan dicatat. */
function T(s, v) {
  s = String(s);
  let r = s;
  if (LG !== "id") { if (D[s] != null) r = D[s]; else (MISS[LG] = MISS[LG] || new Set()).add(s); }
  return v ? r.replace(/\{(\w+)\}/g, (m, k) => (v[k] ?? m)) : r;
}
const N = n => T(n);
const lc = s => (LG === "de" ? s : s.toLowerCase()); /* kata benda Jerman selalu kapital */
const lcA = s => s.toLowerCase(); /* kata sifat (kelebihan/kekurangan) huruf kecil di semua bahasa */
const fold = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const SL = n => (LG === "id" ? n.toLowerCase() : D["@slug:" + n] || fold(T(n)) || n.toLowerCase());
const DIR = k => (LG === "id" ? k : D["@dir:" + k] || k);
const ZD = () => (LG === "id" ? "zodiak" : D["@dir"] || "zodiac");
const withLang = (l, fn) => { const s = [LG, D, P]; LG = l; D = DICTS[l]; P = l === DEF ? "" : l + "/"; try { return fn(); } finally { [LG, D, P] = s; } };
const tgl = () => `${now.getDate()} ${T(BULAN[now.getMonth()])} ${YEAR}`;
const listJoin = a => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + T(" dan ") + a[a.length - 1]);

/* Tanggal di tahun kabisat supaya 29 Februari ikut */
const RY = 2028, HARI_BULAN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const dateSlug = (m, d) => (LG === "id" ? `${d}-${fold(BULAN[m])}` : (D["@dateslug"] || "{m}-{d}").replace("{m}", D["@slug:" + BULAN[m]] || fold(T(BULAN[m])) || String(m + 1)).replace("{d}", d));
const monthSlug = m => (LG === "id" ? fold(BULAN[m]) : D["@slug:" + BULAN[m]] || fold(T(BULAN[m])) || String(m + 1));

/* Halaman dikenali lewat id yang sama di semua bahasa; nama berkasnya ikut bahasa. */
function fileOf(pid) {
  const [t, a, b] = pid.split(":");
  if (t === "home") return "index.html";
  if (t === "hub") return `${ZD()}/index.html`;
  if (t === "z") return `${ZD()}/${SL(a)}.html`;
  if (t === "page") return a + ".html";
  if (t === "dates") return `${DIR("tanggal")}/index.html`;
  if (t === "date") return `${DIR("tanggal")}/${dateSlug(+a, +b)}.html`;
  if (t === "month") return `${DIR("bulan")}/${monthSlug(+a)}.html`;
  if (t === "compats") return `${DIR("kecocokan")}/index.html`;
  if (t === "compat") return `${DIR("kecocokan")}/${SL(a)}.html`;
  throw new Error("pid tidak dikenal: " + pid);
}
const urlOf = (pid, l) => withLang(l, () => `${URL_}/${P}${pid === "home" ? "" : fileOf(pid)}`);
const upOf = file => "../".repeat((P + file).split("/").length - 1);
/* Tautan relatif dari halaman sekarang (b = jalan ke akar situs) ke halaman pid di bahasa l */
const linkTo = (b, pid, l = LG) => withLang(l, () => b + P + fileOf(pid));

/* ---------- Bagian bersama ---------- */
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">`;
const GL = s => s + "︎"; /* paksa glyph teks, bukan emoji berwarna */
const ADSENSE = adsOn ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.publisherId}" crossorigin="anonymous"></script>` : "";

/* Unit iklan manual. Tanpa ID slot, tidak ada yang dirender (Auto ads yang mengatur). */
function ad(key, cls = "") {
  const slot = (cfg.slots || {})[key];
  if (!adsOn || !slot) return "";
  return `<aside class="adwrap ${cls}" aria-label="${T("Iklan")}"><small>${T("Iklan")}</small><ins class="adsbygoogle" style="display:block" data-ad-client="${cfg.publisherId}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins></aside>`;
}

const alternates = pid => (MULTI ? "\n" + [...LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${urlOf(pid, l)}">`), `<link rel="alternate" hreflang="x-default" href="${urlOf(pid, DEF)}">`].join("\n") : "");
const langPick = (b, pid) => (MULTI ? `<details class="lang-pick mono"><summary aria-label="${T("Bahasa")}">${LG.toUpperCase()}</summary><div>${LANGS.map(l => `<a href="${linkTo(b, pid, l)}" hreflang="${l}" lang="${l}"${l === LG ? ' aria-current="true"' : ""}>${LANG_NAMA[l] || l}</a>`).join("")}</div></details>` : "");

const head = (b, pid) => { const hb = b + P; return `<header class="hud-top"><a class="brand" href="${hb}index.html" data-scr>${NAME.toUpperCase()}</a>
  <nav class="topnav mono" aria-label="${T("Utama")}"><a href="${hb}${ZD()}/index.html" data-scr>${T("Semua zodiak")}</a><a href="${EXTRA ? linkTo(b, "compats") : hb + "index.html#kecocokan"}" data-scr>${T("Kecocokan")}</a>${EXTRA ? `<a href="${linkTo(b, "dates")}" data-scr>${T("Tanggal")}</a>` : ""}${LG === "id" ? `<a href="${hb}index.html#tanya" data-scr>Tanya</a>` : ""}<a href="${hb}about.html" data-scr>${T("Tentang")}</a>${langPick(b, pid)}</nav>
  <span class="clock mono" id="clock" aria-hidden="true">00:00:00</span></header>`; };

const foot = (b, pid) => { const hb = b + P; return `<footer class="foot">
  <div class="foot-top">
    <div><a class="brand big" href="${hb}index.html">${NAME.toUpperCase()}</a><p>${T("Ensiklopedia zodiak dan tanya-jawab astrologi berbahasa Indonesia. Konten untuk hiburan.")}</p></div>
    <div><h5>${T("Zodiak")}</h5><nav class="cols" aria-label="${T("Zodiak")}">${Z.map(z => `<a href="${hb}${ZD()}/${SL(z.n)}.html">${N(z.n)}</a>`).join("")}</nav></div>
    <div><h5>${T("Informasi")}</h5><nav aria-label="${T("Informasi")}">${EXTRA ? `<a href="${linkTo(b, "dates")}">${T("Zodiak per tanggal")}</a><a href="${linkTo(b, "compats")}">${T("Kecocokan zodiak")}</a>` : ""}<a href="${hb}about.html">${T("Tentang Kami")}</a><a href="${hb}editorial.html">${T("Kebijakan Editorial")}</a><a href="${hb}contact.html">${T("Kontak")}</a><a href="${hb}privacy.html">${T("Kebijakan Privasi")}</a><a href="${hb}terms.html">${T("Syarat Layanan")}</a></nav></div>
  </div>
  <div class="foot-bot mono"><span>© ${YEAR} ${NAME}</span><span>${T("Konten untuk hiburan, bukan nasihat medis, hukum, atau keuangan.")}</span>${MULTI ? `<span class="foot-lang">${LANGS.map(l => `<a href="${linkTo(b, pid, l)}" hreflang="${l}" lang="${l}">${LANG_NAMA[l] || l}</a>`).join(" · ")}</span>` : ""}</div>
</footer>`; };

function shell({ title, desc, pid, body, ld = [], type = "website", ac = "", el = "", noindex = false }) {
  const file = fileOf(pid), b = upOf(file);
  const url = `${URL_}/${P}${file}`;
  return `<!doctype html>
<html lang="${LG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#060814">
<script>(function(r){r.classList.add("js");try{if(sessionStorage.getItem("astral-cv"))r.classList.add("cv")}catch(e){}})(document.documentElement)</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">${noindex ? '\n<meta name="robots" content="noindex">' : `\n<link rel="canonical" href="${url}">${alternates(pid)}`}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${NAME}">
<link rel="icon" href="${b}assets/images/favicon.svg" type="image/svg+xml">
${FONTS}
<link rel="stylesheet" href="${b}assets/css/main.css?v=1">
${ADSENSE}
${ld.map(jsonLd).join("\n")}
</head>
<body${el ? ` data-el="${el}"` : ""}${ac ? ` style="--ac:${ac}"` : ""}>
<canvas id="sky2d" aria-hidden="true"></canvas><div class="grain" aria-hidden="true"></div>
<div id="curtain" aria-hidden="true"><span class="mono">ASTRAL</span></div>
${head(b, pid)}
${body}
${foot(b, pid)}
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="${b}assets/js/fx.js?v=1"></script>
${adsOn ? `<script src="${b}assets/js/ads.js"></script>` : ""}
</body>
</html>
`;
}

const card = (z, b) => `<a class="scard" data-el="${z.e}" style="--ac:${ACC[z.e]}" href="${b}${P}${ZD()}/${SL(z.n)}.html"><span class="sy" aria-hidden="true">${GL(z.s)}</span><span class="sn">${N(z.n)}</span><span class="sd">${T(z.r)}</span><span class="sq">${esc(T(z.q))}</span><span class="se">${T(z.e)}</span></a>`;
const crumbs = (b, items) => `<p class="crumbs"><a href="${b}index.html">${NAME}</a> / ${items.join(" / ")}</p>`;

function figure(z) {
  const p = z.shape.pts;
  const ln = z.shape.ln.map(([a, c]) => `<path class="ln" pathLength="1" d="M${p[a][0]} ${p[a][1]}L${p[c][0]} ${p[c][1]}"/>`).join("");
  const st = p.map(q => `<circle class="st" cx="${q[0]}" cy="${q[1]}" r="${p.length > 12 ? 4.5 : 6}"/>`).join("");
  return `<div class="art-fig" aria-hidden="true"><div class="ring"></div><svg viewBox="0 0 400 400">${ln}${st}</svg></div>`;
}

/* ---------- Artikel zodiak ---------- */
function article(z, i) {
  const k = kb[z.n], L = LIFE.zodiak[z.n], ac = ACC[z.e], n = z.n, nn = N(n), pid = `z:${n}`, u = `${URL_}/${P}${fileOf(pid)}`;
  const prev = Z[(i + 11) % 12], next = Z[(i + 1) % 12];
  const zl = nm => `<a href="${SL(nm)}.html">${N(nm)}</a>`;
  const list = a => a.map(nm => zl(nm)).join(", ");
  const same = Z.filter(x => x.e === z.e && x.n !== n);
  const life = (key, label) => `<h3>${T(label)}</h3><p>${nn} ${esc(T(L[key][0]))}</p><p>${esc(T(L[key][1]))}</p>`;
  const x = ZX[n], opp = Z[(i + 6) % 12];

  const faq = [
    [T("Apa kelebihan utama {n}?", { n: nn }), T("{n} dikenal {s}.", { n: nn, s: k.strengths.slice(0, 3).map(s => lcA(T(s[0]))).join(", ") })],
    [T("Apa kekurangan {n} yang perlu diwaspadai?", { n: nn }), T("{n} cenderung {s}.", { n: nn, s: k.weaknesses.map(s => lcA(T(s[0]))).join(", ") })],
    [T("Zodiak apa yang cocok dengan {n}?", { n: nn }), T("Menurut tradisi zodiak, {n} cocok dengan {a}. Kurang cocok dengan {b}.", { n: nn, a: k.match.map(N).join(", "), b: k.avoid.map(N).join(", ") })],
    [T("Karier apa yang cocok untuk {n}?", { n: nn }), T("Pekerjaan yang sering dikaitkan dengan {n} antara lain {c}.", { n: nn, c: k.career.map(T).join(", ") })],
    [T("Apa elemen dan planet penguasa {n}?", { n: nn }), T("Elemen {n} adalah {e} dan planet penguasanya {r}.", { n: nn, e: T(z.e), r: T(z.ru) })],
    [T("Kapan {n} berlaku?", { n: nn }), T("{n} berlaku pada {d}.", { n: nn, d: T(k.dates) })],
    [T("Apa batu, warna, dan angka keberuntungan {n}?", { n: nn }), T("Menurut tradisi populer: batu {b}, warna {w}, angka {a}, dan hari {h}.", { b: lc(T(x.batu)), w: lc(T(x.warna)), a: x.angka, h: T(x.hari) })],
    [T("Apa kartu tarot {n}?", { n: nn }), T("Dalam tradisi tarot Barat, {n} dipasangkan dengan kartu {t}.", { n: nn, t: x.tarot })]
  ];
  const ld = [{
    "@context": "https://schema.org", "@graph": [
      { "@type": "Article", headline: T("{n}: Sifat, Kelebihan, Kekurangan & Kecocokan", { n: nn }), description: T(z.d), inLanguage: LG, datePublished: ISO, dateModified: ISO,
        author: { "@type": "Organization", name: NAME }, publisher: { "@type": "Organization", name: NAME, url: URL_ + "/" }, mainEntityOfPage: u },
      { "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      { "@type": "BreadcrumbList", itemListElement: [[NAME, urlOf("home", LG)], [T("Zodiak"), urlOf("hub", LG)], [nn, u]].map(([name, item], j) => ({ "@type": "ListItem", position: j + 1, name, item })) }
    ]
  }];

  const idRows = [
    [T("Nama Latin"), T(x.lat)], [T("Simbol"), `${GL(z.s)} ${T(x.glyph)}`], [T("Tanggal"), T(k.dates)], [T("Elemen"), T(z.e)], [T("Modalitas"), T(x.mod)], [T("Polaritas"), T(x.pol)],
    [T("Planet penguasa"), z.ru === x.ruTrad ? T(z.ru) : T("{a} (modern), {b} (tradisional)", { a: T(z.ru), b: T(x.ruTrad) })], [T("Rumah alami"), T("Rumah ke-{n}", { n: x.rumah })], [T("Tanda seberang"), `<a href="${SL(opp.n)}.html">${N(opp.n)}</a>`],
    [T("Bagian tubuh"), T(x.tubuh)], [T("Motto"), `"${T(x.motto)}"`], [T("Kartu tarot"), x.tarot], [T("Hari baik"), T(x.hari)], [T("Angka"), x.angka], [T("Warna"), T(x.warna)],
    [T("Batu"), T(x.batu)], [T("Logam"), T(x.logam)], [T("Bunga"), T(x.bunga)], [T("Musim"), T(x.musim)]
  ];
  const body = `<main class="article">
  <article>
    ${crumbs("../", [`<a href="index.html">${T("Zodiak")}</a>`, nn])}
    <header class="art-top">
      <div>
        <p class="idx mono" data-rv>${String(i + 1).padStart(2, "0")} / 12 · ${T(z.e)} · ${T(x.mod)} · ${T(k.dates)}</p>
        <h1 data-split>${nn}</h1>
        <p class="lead" data-rv><em>${esc(T(z.q))}</em></p>
      </div>
      ${figure(z)}
    </header>
    <p class="intro" data-rv>${esc(T(z.d))}</p>

    <section class="idcard" data-rv aria-labelledby="h-id">
      <h2 id="h-id" class="mono">${T("Kartu identitas")}</h2>
      <dl>${idRows.map(([a, v]) => `<div><dt class="mono">${a}</dt><dd>${typeof v === "string" && v.includes("<a ") ? v : esc(v)}</dd></div>`).join("")}</dl>
      <p class="note mono">${T("Angka, warna, batu, dan bunga mengikuti tradisi populer dan berbeda antarsumber.")}</p>
    </section>

    <h2>${T("Kelebihan {n}", { n: nn })}</h2>
    <ul class="traits">${k.strengths.map(s => `<li><b>${esc(T(s[0]))}</b><span>${esc(T(s[1]))}</span></li>`).join("")}</ul>

    <h2>${T("Kekurangan yang perlu diwaspadai")}</h2>
    <ul class="traits">${k.weaknesses.map(s => `<li><b>${esc(T(s[0]))}</b><span>${esc(T(s[1]))}</span></li>`).join("")}</ul>

    <h2>${T("Mitologi {n}", { n: nn })}</h2>
    <p>${esc(T(x.mitos))}</p>

    <h2>${T("{n} di langit malam", { n: nn })}</h2>
    <dl class="sky">
      <div><dt class="mono">${T("Bintang paling terang")}</dt><dd>${esc(T(x.rasi.terang))}</dd></div>
      <div><dt class="mono">${T("Luas rasi")}</dt><dd>${T("{a} derajat persegi, terbesar ke-{b} dari 88 rasi", { a: x.rasi.luas, b: x.rasi.peringkat })}</dd></div>
      <div><dt class="mono">${T("Objek menarik")}</dt><dd>${esc(T(x.rasi.objek))}</dd></div>
      <div><dt class="mono">${T("Paling mudah dilihat")}</dt><dd>${T("Malam hari di bulan {m}", { m: T(x.rasi.lihat) })}</dd></div>
      <div><dt class="mono">${T("Matahari benar-benar di rasi ini")}</dt><dd>${T("{d} (batas rasi IAU, bukan tanggal astrologi)", { d: T(x.rasi.matahari) })}</dd></div>
    </dl>

    <h2>${T("{n} dalam cinta", { n: nn })}</h2>
    <p>${esc(T(k.love))}</p>
    <p>${T("Pasangan yang sering dianggap serasi dengan {n} adalah {l}. Bagian kecocokan di bawah menjelaskan alasannya berdasarkan elemen.", { n: nn, l: list(k.match) })}</p>

    ${ad("article")}

    <h2>${T("Karier dan gaya kerja")}</h2>
    <p>${T("Pekerjaan yang sering dikaitkan dengan {n}: {c}.", { n: nn, c: k.career.map(T).join(", ") })}</p>
    <p>${nn} ${esc(T(L.work[0]))}</p>
    <p>${esc(T(L.work[1]))}</p>

    <h2>${T("Gaya hidup {n}", { n: nn })}</h2>
    ${life("food", "Makanan")}${life("travel", "Liburan")}${life("fashion", "Gaya berpakaian")}${life("money", "Keuangan")}

    <h2>${T("Kecocokan {n}", { n: nn })}</h2>
    <p>${T("Cocok dengan:")} <b>${list(k.match)}</b>.</p>
    <p>${T("Kurang cocok dengan:")} <b>${list(k.avoid)}</b>.</p>
    <p>${esc(T(KB.elements[k.element]))}</p>
    <p>${EXTRA
      ? T("Kecocokan ini hanya tradisi zodiak populer. Hubungan nyata lebih ditentukan oleh komunikasi, nilai hidup, dan usaha kedua pihak. Lihat skor {n} dengan 12 zodiak di <a href=\"{u}\">halaman kecocokan {n}</a>.", { n: nn, u: linkTo("../", `compat:${n}`) })
      : T("Kecocokan ini hanya tradisi zodiak populer. Hubungan nyata lebih ditentukan oleh komunikasi, nilai hidup, dan usaha kedua pihak. Coba juga <a href=\"../index.html#kecocokan\">kalkulator kecocokan</a>.")}</p>

    <h2>${T("Tokoh terkenal berzodiak {n}", { n: nn })}</h2>
    <ul class="pill-row plain-list">${x.tokoh.map(t => `<li>${esc(t)}</li>`).join("")}</ul>

    <h2>${T("Fakta sepele tentang {n}", { n: nn })}</h2>
    <ol class="facts">${x.sepele.map(t => `<li>${esc(T(t))}</li>`).join("")}</ol>

    <section class="faq">
      <h2>${T("Pertanyaan umum tentang {n}", { n: nn })}</h2>
      ${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
    </section>

    ${ad("articleEnd")}

    <h2>${T("Zodiak {e} lainnya", { e: T(z.e) })}</h2>
    <p>${T("{n} termasuk elemen {e} bersama {l}.", { n: nn, e: T(z.e), l: same.map(x => N(x.n)).join(T(" dan ")) })}</p>
    <div class="pill-row">${same.map(x => `<a href="${SL(x.n)}.html">${GL(x.s)} ${N(x.n)}</a>`).join("")}<a href="index.html">${T("Semua zodiak")}</a></div>

    <h2>${T("Sumber rujukan")}</h2>
    <ul class="src">${KB.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></li>`).join("")}<li><a href="https://www.iau.org/public/themes/constellations/" target="_blank" rel="noopener noreferrer">IAU — The Constellations</a></li></ul>
    <p>${T("Isi artikel ini adalah ringkasan dengan kata-kata sendiri dan dimaksudkan untuk hiburan, bukan fakta ilmiah. Lihat <a href=\"../editorial.html\">Kebijakan Editorial</a>.")}</p>
    <p class="stamp mono">${T("Terakhir diperbarui: {d}", { d: tgl() })}</p>

    <nav class="pn mono" aria-label="${T("Zodiak lain")}">
      <a href="${SL(prev.n)}.html" data-scr>← ${N(prev.n)}</a>
      <a href="../index.html#z-${n.toLowerCase()}" data-scr>${T("Lihat di langit")}</a>
      <a href="${SL(next.n)}.html" data-scr>${N(next.n)} →</a>
    </nav>
  </article>
</main>`;
  return shell({ title: T("{n}: Sifat, Kelebihan, Kekurangan & Kecocokan — {s}", { n: nn, s: NAME }), desc: T("{n} ({d}), elemen {e} dikuasai {r}. Kelebihan, kekurangan, cinta, karier, gaya hidup, dan pasangan yang cocok.", { n: nn, d: T(k.dates), e: T(z.e), r: T(z.ru) }), pid, body, ld, type: "article", ac, el: z.e });
}

/* ---------- Halaman tambahan: posisi Matahari, tanggal, bulan, kecocokan ---------- */
/* Bujur ekliptika Matahari, rumus presisi rendah Astronomical Almanac (galat < 0,01°), pukul 12.00 UTC */
function sunLon(y, m, d) {
  const n = Date.UTC(y, m, d, 12) / 86400000 + 2440587.5 - 2451545;
  const L = 280.46 + 0.9856474 * n, g = (357.528 + 0.9856003 * n) * Math.PI / 180;
  return (((L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) % 360) + 360) % 360;
}
const urut = Z.slice().sort((a, b) => a.st - b.st);
const tandaTgl = (m, d) => { const v = (m + 1) * 100 + d; let s = urut[urut.length - 1]; for (const z of urut) if (z.st <= v) s = z; return Z.indexOf(s); };
const awalTanda = i => [Math.floor(Z[i].st / 100) - 1, Z[i].st % 100];
const hariAntara = (a, b) => Math.round((Date.UTC(RY, b[0], b[1]) - Date.UTC(RY, a[0], a[1])) / 86400000);
const skor = (a, b) => {
  let dist = Math.abs(a - b); dist = Math.min(dist, 12 - dist);
  const [nama, s0, arti] = ZI.aspek[dist], ka = kb[Z[a].n];
  let s = s0; if (ka.match.includes(Z[b].n)) s += 4; if (ka.avoid.includes(Z[b].n)) s -= 6;
  return { nama, arti, skor: Math.max(5, Math.min(99, s)) };
};
const PASANGAN_EL = { Api: "Udara", Udara: "Api", Tanah: "Air", Air: "Tanah" };
const relasiEl = (a, b) => (Z[a].e === Z[b].e ? T("satu elemen, cara berpikirnya mirip") : PASANGAN_EL[Z[a].e] === Z[b].e ? T("elemen yang saling menghidupkan") : T("elemen yang berbeda arah"));
const tglTeks = (m, d) => T("{d} {m}", { d, m: T(BULAN[m]) });

function halamanTanggal(m, d) {
  const i = tandaTgl(m, d), z = Z[i], k = kb[z.n], nn = N(z.n), x = ZX[z.n], pid = `date:${m}:${d}`;
  const ni = (i + 1) % 12, mulai = awalTanda(i), awalBerikut = awalTanda(ni);
  const ke = (hariAntara(mulai, [m, d]) + 366) % 366 + 1, panjang = (hariAntara(mulai, awalBerikut) + 366) % 366, sisa = panjang - ke + 1;
  const dekan = Math.min(2, Math.floor((ke - 1) / (panjang / 3))), dz = Z[(i + 4 * dekan) % 12];
  const th = m === 1 && d === 29 ? RY : YEAR, lon = sunLon(th, m, d), zc = Math.floor(lon / 30), deg = Math.floor(lon % 30);
  const cuspDengan = ke <= 2 ? Z[(i + 11) % 12] : sisa <= 2 ? Z[ni] : null;
  const t = tglTeks(m, d), b = upOf(fileOf(pid));
  const prevD = d > 1 ? [m, d - 1] : [(m + 11) % 12, HARI_BULAN[(m + 11) % 12]], nextD = d < HARI_BULAN[m] ? [m, d + 1] : [(m + 1) % 12, 1];
  const body = `<main class="article plain">
  ${crumbs(b + P, [`<a href="index.html">${T("Zodiak per tanggal")}</a>`, `<a href="${linkTo(b, `month:${m}`)}">${T(BULAN[m])}</a>`, t])}
  <p class="idx mono">${GL(z.s)} ${nn} · ${T(z.e)} · ${T(k.dates)}</p>
  <h1>${T("Zodiak tanggal {t}: {z}", { t, z: nn })}</h1>
  <p class="lead"><em>${esc(T(z.q))}</em></p>
  <p class="intro">${T("Orang yang lahir tanggal {t} berzodiak {z}. {z} berlaku {r}, berelemen {e}, bermodalitas {mod}, dan dikuasai {ru}.", { t, z: nn, r: T(k.dates), e: T(z.e), mod: T(x.mod), ru: T(z.ru) })}</p>
  <h2>${T("Posisi Matahari pada {t}", { t })}</h2>
  <p>${T("Pada {t} {y} pukul 12.00 UTC, Matahari berada di sekitar {deg}° {zc} pada lingkaran zodiak (bujur ekliptika {lon}°).", { t, y: th, deg, zc: N(Z[zc].n), lon: lon.toFixed(1) })}</p>
  <p>${T("Tanggal ini adalah hari ke-{k} dari {p} hari musim {z}. Matahari masuk {nx} sekitar {nd}, {s} hari lagi.", { k: ke, p: panjang, z: nn, nx: N(Z[ni].n), nd: tglTeks(awalBerikut[0], awalBerikut[1]), s: sisa })}</p>
  ${cuspDengan ? `<p>${T("Tanggal ini termasuk cusp (perbatasan) {a}–{b}. Batas tanda bergeser sekitar satu hari antartahun dan tergantung jam lahir, jadi pastikan dengan tahun dan jam lahirmu.", { a: N((ke <= 2 ? cuspDengan : z).n), b: N((ke <= 2 ? z : cuspDengan).n) })}</p>` : ""}
  <h2>${T("Dekan")}</h2>
  <p>${dekan === 0
    ? T("Tanggal {t} jatuh di dekan pertama {z}, bagian yang dianggap paling murni sifat {z}-nya, dikuasai {ru}.", { t, z: nn, ru: T(z.ru) })
    : T("Tanggal {t} jatuh di dekan ke-{n} {z}. Menurut sistem triplisitas, dekan ini mendapat warna dari {dz}, yang dikuasai {dr}.", { t, n: dekan + 1, z: nn, dz: `<a href="${linkTo(b, `z:${dz.n}`)}">${N(dz.n)}</a>`, dr: T(dz.ru) })}</p>
  <h2>${T("Sifat {z} singkat", { z: nn })}</h2>
  <p>${esc(T(z.d))}</p>
  <ul class="traits">${k.strengths.slice(0, 3).map(s => `<li><b>${esc(T(s[0]))}</b><span>${esc(T(s[1]))}</span></li>`).join("")}</ul>
  <p>${T("Cocok dengan {l}. Baca selengkapnya di artikel <a href=\"{a}\">{z}</a> dan <a href=\"{c}\">kecocokan {z}</a>.", { l: k.match.map(N).join(", "), a: linkTo(b, `z:${z.n}`), c: linkTo(b, `compat:${z.n}`), z: nn })}</p>
  <nav class="pn mono" aria-label="${T("Tanggal lain")}">
    <a href="${linkTo(b, `date:${prevD[0]}:${prevD[1]}`)}">← ${tglTeks(prevD[0], prevD[1])}</a>
    <a href="${linkTo(b, `month:${m}`)}">${T("Zodiak bulan {m}", { m: T(BULAN[m]) })}</a>
    <a href="${linkTo(b, `date:${nextD[0]}:${nextD[1]}`)}">${tglTeks(nextD[0], nextD[1])} →</a>
  </nav>
  <p class="stamp mono">${T("Posisi Matahari dihitung dengan rumus Astronomical Almanac. Konten zodiak untuk hiburan.")}</p>
</main>`;
  const ld = [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: T("Zodiak tanggal {t} apa?", { t }), acceptedAnswer: { "@type": "Answer", text: T("Tanggal {t} termasuk zodiak {z} ({r}).", { t, z: nn, r: T(k.dates) }) } }] }];
  return shell({ title: T("Zodiak Tanggal {t} Apa? {z}, Sifat & Kecocokan — {s}", { t, z: nn, s: NAME }), desc: T("Lahir tanggal {t}? Zodiakmu {z} ({r}), elemen {e}. Posisi Matahari, dekan, cusp, sifat, dan kecocokan.", { t, z: nn, r: T(k.dates), e: T(z.e) }), pid, body, ld, ac: ACC[z.e], el: z.e });
}

function halamanBulan(m) {
  const pid = `month:${m}`, b = upOf(fileOf(pid)), hari = [...Array(HARI_BULAN[m])].map((_, j) => j + 1);
  const tanda = [...new Set(hari.map(d => tandaTgl(m, d)))];
  const rentang = tanda.map(i => { const ds = hari.filter(d => tandaTgl(m, d) === i); return [i, ds[0], ds[ds.length - 1]]; });
  const [[a, , aAkhir], [bb, bAwal]] = rentang, mm = T(BULAN[m]);
  const body = `<main class="article plain wide">
  ${crumbs(b + P, [`<a href="${linkTo(b, "dates")}">${T("Zodiak per tanggal")}</a>`, mm])}
  <h1>${T("Zodiak bulan {m}", { m: mm })}</h1>
  <p class="intro">${T("Orang yang lahir di bulan {m} berzodiak {a} (tanggal 1–{x}) atau {b} (tanggal {y}–{z}).", { m: mm, a: N(Z[a].n), x: aAkhir, b: N(Z[bb].n), y: bAwal, z: HARI_BULAN[m] })}</p>
  <div class="sgrid">${tanda.map(i => card(Z[i], b)).join("")}</div>
  <h2>${T("Pilih tanggal lahir")}</h2>
  <ul class="pill-row plain-list">${hari.map(d => { const z = Z[tandaTgl(m, d)]; return `<li><a href="${linkTo(b, `date:${m}:${d}`)}">${d} <span aria-hidden="true">${GL(z.s)}</span><span class="sr">${N(z.n)}</span></a></li>`; }).join("")}</ul>
  <nav class="pn mono" aria-label="${T("Bulan lain")}">
    <a href="${linkTo(b, `month:${(m + 11) % 12}`)}">← ${T(BULAN[(m + 11) % 12])}</a>
    <a href="${linkTo(b, "dates")}">${T("Semua bulan")}</a>
    <a href="${linkTo(b, `month:${(m + 1) % 12}`)}">${T(BULAN[(m + 1) % 12])} →</a>
  </nav>
</main>`;
  return shell({ title: T("Zodiak Bulan {m}: {a} dan {b}, Tanggal & Sifatnya — {s}", { m: mm, a: N(Z[a].n), b: N(Z[bb].n), s: NAME }), desc: T("Zodiak orang yang lahir di bulan {m}: {a} sampai tanggal {x}, lalu {b}. Pilih tanggal lahirmu untuk melihat posisi Matahari dan sifatnya.", { m: mm, a: N(Z[a].n), x: aAkhir, b: N(Z[bb].n) }), pid, body });
}

function halamanIndeksTanggal() {
  const pid = "dates", b = upOf(fileOf(pid));
  const body = `<main class="article plain wide">
  ${crumbs(b + P, [T("Zodiak per tanggal")])}
  <h1>${T("Zodiak berdasarkan tanggal lahir")}</h1>
  <p class="intro">${T("Pilih bulan lahirmu, lalu tanggalnya. Setiap halaman tanggal menunjukkan zodiak, posisi Matahari, dekan, dan apakah tanggal itu termasuk cusp.")}</p>
  <ul class="pill-row plain-list">${BULAN.map((_, m) => `<li><a href="${linkTo(b, `month:${m}`)}">${T(BULAN[m])}</a></li>`).join("")}</ul>
  <h2>${T("Tanggal tiap zodiak")}</h2>
  <div class="sgrid">${Z.map(z => card(z, b)).join("")}</div>
</main>`;
  return shell({ title: T("Zodiak Berdasarkan Tanggal Lahir: Cek 366 Tanggal — {s}", { s: NAME }), desc: T("Cari zodiak dari tanggal lahirmu. Daftar 12 bulan dan 366 tanggal lengkap dengan posisi Matahari, dekan, dan cusp."), pid, body });
}

function halamanKecocokan(i) {
  const z = Z[i], k = kb[z.n], nn = N(z.n), pid = `compat:${z.n}`, b = upOf(fileOf(pid));
  const baris = Z.map((_, j) => ({ j, ...skor(i, j) })).sort((p, q) => q.skor - p.skor);
  const body = `<main class="article plain wide">
  ${crumbs(b + P, [`<a href="index.html">${T("Kecocokan zodiak")}</a>`, nn])}
  <p class="idx mono">${GL(z.s)} ${nn} · ${T(z.e)} · ${T(k.dates)}</p>
  <h1>${T("Kecocokan {z} dengan 12 zodiak", { z: nn })}</h1>
  <p class="intro">${esc(T(k.love))}</p>
  <p>${T("Paling serasi menurut tradisi: {a}. Paling menantang: {b}.", { a: k.match.map(N).join(", "), b: k.avoid.map(N).join(", ") })}</p>
  <div class="matrix-wrap"><table class="matrix compat-tab">
    <thead><tr><th scope="col">${T("Pasangan")}</th><th scope="col">${T("Skor")}</th><th scope="col">${T("Sudut")}</th><th scope="col">${T("Artinya")}</th></tr></thead>
    <tbody>${baris.map(r => `<tr style="--ac:${ACC[Z[r.j].e]}"><th scope="row"><a href="${linkTo(b, `compat:${Z[r.j].n}`)}"><span aria-hidden="true">${GL(Z[r.j].s)}</span> ${N(Z[r.j].n)}</a></th><td class="mono">${r.skor}</td><td class="mono">${T(r.nama)}</td><td>${T(r.arti)} ${T("{a} dan {b}: {r}.", { a: nn, b: N(Z[r.j].n), r: relasiEl(i, r.j) })}</td></tr>`).join("")}</tbody>
  </table></div>
  <p>${T("Skor dihitung dari sudut kedua tanda di roda zodiak, kesamaan elemen, dan tradisi kecocokan populer. Untuk hiburan; hubungan nyata ditentukan komunikasi dan usaha bersama.")}</p>
  <p>${T("Baca juga artikel lengkap <a href=\"{u}\">{z}</a>.", { u: linkTo(b, `z:${z.n}`), z: nn })}</p>
</main>`;
  const ld = [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: T("Zodiak apa yang cocok dengan {n}?", { n: nn }), acceptedAnswer: { "@type": "Answer", text: T("Menurut tradisi zodiak, {n} cocok dengan {a}. Kurang cocok dengan {b}.", { n: nn, a: k.match.map(N).join(", "), b: k.avoid.map(N).join(", ") }) } }] }];
  return shell({ title: T("Kecocokan {z} dengan Semua Zodiak: Skor & Artinya — {s}", { z: nn, s: NAME }), desc: T("Seberapa cocok {z} dengan 11 zodiak lain? Skor kecocokan, sudut di roda zodiak, elemen, dan pasangan paling serasi.", { z: nn }), pid, body, ld, ac: ACC[z.e], el: z.e });
}

function halamanIndeksKecocokan() {
  const pid = "compats", b = upOf(fileOf(pid));
  const body = `<main class="article plain wide">
  ${crumbs(b + P, [T("Kecocokan zodiak")])}
  <h1>${T("Kecocokan zodiak")}</h1>
  <p class="intro">${T("Pilih zodiakmu untuk melihat skor kecocokannya dengan 12 zodiak, dari pasangan paling serasi sampai yang paling menantang.")}</p>
  <div class="sgrid">${Z.map(z => `<a class="scard" data-el="${z.e}" style="--ac:${ACC[z.e]}" href="${linkTo(b, `compat:${z.n}`)}"><span class="sy" aria-hidden="true">${GL(z.s)}</span><span class="sn">${N(z.n)}</span><span class="sd">${T(z.r)}</span><span class="sq">${T("Cocok dengan {l}", { l: kb[z.n].match.map(N).join(", ") })}</span><span class="se">${T(z.e)}</span></a>`).join("")}</div>
</main>`;
  return shell({ title: T("Kecocokan Zodiak: Skor 12 Tanda dengan Pasangannya — {s}", { s: NAME }), desc: T("Cek kecocokan zodiak dalam cinta dan pertemanan: skor tiap pasangan dari sudut roda zodiak, elemen, dan tradisi populer."), pid, body });
}

/* ---------- Halaman per bahasa ---------- */
const mail = `<a href="mailto:${cfg.email}">${cfg.email}</a>`;
const waShow = cfg.whatsapp ? ("0" + cfg.whatsapp.slice(2)).replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3") : "";
const wa = cfg.whatsapp ? `<a href="https://wa.me/${cfg.whatsapp}" target="_blank" rel="noopener">${waShow}</a>` : "";
const PAGES = [];

function bangunBahasa() {
  const hal = (pid, html) => { write(P + fileOf(pid), html); if (!/noindex/.test(html.slice(0, 1500))) PAGES.push(urlOf(pid, LG)); };
  Z.forEach((z, i) => hal(`z:${z.n}`, article(z, i)));

  /* ---------- Indeks zodiak ---------- */
  const hubBody = `<main class="article plain wide">
  ${crumbs("../", [T("Zodiak")])}
  <h1 data-split>${T("Semua zodiak")}</h1>
  <p class="lead"><em>${T("Dua belas tanda, empat elemen.")}</em></p>
  <p class="intro">${T("Pilih zodiak untuk membaca sifat, kelebihan, kekurangan, kecocokan cinta, karier, dan gaya hidupnya. Zodiak dikelompokkan menurut elemen karena elemen yang sama biasanya terasa serasi.")}</p>
  ${["Api", "Tanah", "Udara", "Air"].map(e => `<h2 style="--ac:${ACC[e]}" class="el-h">${T("Elemen {e}", { e: T(e) })}</h2><p class="el-p">${esc(T(KB.elements[e]))}</p><div class="sgrid">${Z.filter(z => z.e === e).map(z => card(z, upOf(fileOf("hub")))).join("")}</div>`).join("")}
  <p class="stamp mono">${T("Terakhir diperbarui: {d}", { d: tgl() })}</p>
</main>`;
  hal("hub", shell({ title: T("Semua Zodiak: Sifat dan Kecocokan 12 Tanda — {s}", { s: NAME }), desc: T("Daftar lengkap 12 zodiak berdasarkan elemen: tanggal, sifat, kelebihan, kekurangan, dan kecocokan."), pid: "hub", body: hubBody,
    ld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: T("Semua Zodiak"), url: urlOf("hub", LG), inLanguage: LG }] }));

  /* ---------- Halaman informasi ---------- */
  const plain = (title, upd, inner) => `<main class="article plain">
  ${crumbs("", [title])}
  <h1>${title}</h1>
  ${upd ? `<p class="upd">${T("Terakhir diperbarui: {d}", { d: tgl() })}</p>` : ""}
  ${inner}
</main>`;
  const id = LG === "id";

  hal("page:about", shell({ title: T("Tentang Kami — {s}", { s: NAME }), desc: T("Tentang {s}: penelusuran zodiak dan tanya-jawab astrologi berbahasa Indonesia.", { s: NAME }), pid: "page:about", body: plain(T("Tentang Kami"), false, `
  <p>${T("{s} adalah situs penelusuran zodiak dan tanya-jawab astrologi berbahasa Indonesia, dikelola oleh {o}. Kami membuatnya untuk siapa saja yang penasaran dengan dua belas zodiak: sifatnya, kecocokannya, dan cara tradisi astrologi memandang cinta, karier, serta gaya hidup.", { s: NAME, o: esc(cfg.owner) })}</p>
  <h2>${T("Apa yang tersedia")}</h2>
  <ul><li>${T("<b>Penelusuran zodiak</b>: dua belas zodiak dengan rasi bintang animasi, ringkasan karakter, dan ramalan harian singkat.")}</li><li>${T("<b>Artikel lengkap</b>: setiap zodiak punya halaman berisi kelebihan, kekurangan, cinta, karier, gaya hidup, kecocokan, dan tanya-jawab.")}</li>${id ? `<li><b>Tanya-jawab</b>: pertanyaan seputar astrologi dijawab dari basis pengetahuan situs, dan bila tersedia dibantu AI.</li>` : ""}${EXTRA ? `<li>${T("<b>Zodiak per tanggal</b>: 366 halaman tanggal lahir dengan posisi Matahari, dekan, dan cusp, serta skor kecocokan tiap zodiak.")}</li>` : ""}</ul>
  <h2>${T("Cara kami menulis")}</h2>
  <p>${id ? `Isi disusun ulang dengan kata-kata sendiri dari ringkasan umum astrologi, dengan sumber rujukan di setiap artikel. Jawaban tanya-jawab dapat dibantu AI, dan kami menandai konten ini untuk hiburan. Detailnya ada di <a href="editorial.html">Kebijakan Editorial</a>.` : T("Isi disusun ulang dengan kata-kata sendiri dari ringkasan umum astrologi, dengan sumber rujukan di setiap artikel, dan kami menandai konten ini untuk hiburan. Detailnya ada di <a href=\"editorial.html\">Kebijakan Editorial</a>.")}</p>
  <h2>${T("Penting diketahui")}</h2>
  <p>${T("Astrologi tidak didukung bukti ilmiah sebagai alat untuk memprediksi kepribadian atau masa depan. {s} bukan sumber nasihat medis, hukum, atau keuangan.", { s: NAME })}</p>
  <h2>${T("Hubungi kami")}</h2>
  <p>${T("Punya koreksi, saran, atau pertanyaan? Tulis lewat halaman <a href=\"contact.html\">Kontak</a> atau kirim email ke {m}", { m: mail })}${wa ? ` atau WhatsApp ${wa}` : ""}.</p>`) }));

  hal("page:contact", shell({ title: T("Kontak — {s}", { s: NAME }), desc: T("Hubungi {s} untuk koreksi, saran, atau pertanyaan.", { s: NAME }), pid: "page:contact", body: plain(T("Kontak"), false, `
  <p>${T("Kami membaca setiap pesan tentang koreksi isi, saran fitur, atau pertanyaan kerja sama. Kirim email ke {m}, atau isi formulir di bawah dan aplikasi email Anda akan terbuka dengan pesan yang sudah terisi.", { m: mail })}</p>
  ${wa ? `<p>Lebih cepat lewat WhatsApp: ${wa}.</p>` : ""}
  <form class="cform" id="cf">
    <input id="cn" placeholder="${T("Nama")}" aria-label="${T("Nama")}" required>
    <input id="cs" placeholder="${T("Subjek")}" aria-label="${T("Subjek")}" required>
    <textarea id="cm" placeholder="${T("Pesan Anda")}" aria-label="${T("Pesan")}" required></textarea>
    <button type="submit">${T("Buka email")}</button>
  </form>
  <script>document.getElementById("cf").addEventListener("submit",function(e){e.preventDefault();var g=function(i){return document.getElementById(i).value};location.href="mailto:${cfg.email}?subject="+encodeURIComponent(g("cs"))+"&body="+encodeURIComponent(g("cm")+"\\n\\n— "+g("cn"));});</script>
  <h2>${T("Koreksi isi")}</h2>
  <p>${T("Jika menemukan kesalahan tanggal, elemen, atau informasi lain, sebutkan halaman dan bagian yang dimaksud agar mudah kami periksa.")}</p>`) }));

  hal("page:terms", shell({ title: T("Syarat Layanan — {s}", { s: NAME }), desc: T("Syarat penggunaan situs {s}.", { s: NAME }), pid: "page:terms", body: plain(T("Syarat Layanan"), true, `
  <p>${T("Dengan memakai {s}, Anda menyetujui syarat berikut.", { s: NAME })}</p>
  <h2>${T("Konten untuk hiburan")}</h2>
  <p>${T("Seluruh konten astrologi disajikan untuk hiburan dan bukan nasihat medis, psikologis, hukum, atau keuangan. Jangan mengambil keputusan penting hanya berdasarkan zodiak.")}</p>
  <h2>${T("Penggunaan yang diizinkan")}</h2>
  <p>${T("Anda boleh membaca dan membagikan tautan ke halaman kami. Anda dilarang mengirim konten yang melanggar hukum, mengandung SARA, ujaran kebencian, atau spam, serta mengganggu kinerja situs, misalnya dengan permintaan otomatis berlebihan.")}</p>
  <h2>${T("Hak cipta")}</h2>
  <p>${T("Teks, desain, dan kode situs ini dimiliki {o}. Mengutip sebagian kecil dengan tautan ke halaman asal diperbolehkan; menyalin artikel secara utuh tidak.", { o: esc(cfg.owner) })}</p>
  <h2>${T("Tautan dan iklan pihak ketiga")}</h2>
  <p>${T("Situs ini memuat tautan ke sumber luar dan dapat menampilkan iklan dari pihak ketiga seperti Google AdSense. Kami tidak bertanggung jawab atas isi situs atau iklan pihak ketiga.")}</p>
  <h2>${T("Tanpa jaminan")}</h2>
  <p>${id ? "Konten disediakan apa adanya. Kami berusaha akurat, tetapi tidak menjamin bebas dari kekeliruan, dan jawaban yang dibantu AI dapat keliru." : T("Konten disediakan apa adanya. Kami berusaha akurat, tetapi tidak menjamin bebas dari kekeliruan.")}</p>
  <h2>${T("Perubahan")}</h2>
  <p>${T("Syarat ini dapat diperbarui sewaktu-waktu; tanggal pembaruan tertera di atas. Pertanyaan? Hubungi {m}.", { m: mail })}</p>`) }));

  hal("page:editorial", shell({ title: T("Kebijakan Editorial — {s}", { s: NAME }), desc: T("Cara {s} menyusun, memeriksa, dan memperbarui konten zodiak.", { s: NAME }), pid: "page:editorial", body: plain(T("Kebijakan Editorial"), true, `
  <p>${T("Halaman ini menjelaskan bagaimana konten {s} dibuat, agar Anda tahu apa yang bisa dan tidak bisa diandalkan.", { s: NAME })}</p>
  <h2>${T("Sumber")}</h2>
  <p>${T("Tanggal dan elemen zodiak dicocokkan dengan beberapa sumber berbahasa Indonesia, dan planet penguasa mengikuti tradisi astrologi umum. Setiap artikel mencantumkan sumber rujukannya.")} ${esc(T(KB.checked))}</p>
  <h2>${T("Penulisan")}</h2>
  <p>${T("Sifat, kecocokan, dan gaya hidup ditulis ulang dengan kata-kata sendiri dari ringkasan umum astrologi, bukan disalin dari satu sumber. Konten ini adalah tafsir tradisi, bukan temuan ilmiah.")}</p>
  ${id ? `<h2>Penggunaan AI</h2>
  <p>Bagian tanya-jawab dapat dibantu model AI. Jawaban AI diberi petunjuk agar berperan sebagai pakar zodiak yang berhati-hati, namun tetap dapat keliru. Jawaban tidak ditinjau satu per satu oleh editor.</p>` : `<h2>${T("Terjemahan")}</h2>
  <p>${T("Versi bahasa ini diterjemahkan dari naskah asli berbahasa Indonesia dan diperiksa ulang. Posisi Matahari dihitung, bukan diterjemahkan.")}</p>`}
  <h2>${T("Koreksi")}</h2>
  <p>${T("Kesalahan yang kami temukan atau dilaporkan akan diperbaiki dan tanggal pembaruan halaman diubah. Laporkan lewat {m}.", { m: mail })}</p>
  <h2>${T("Iklan")}</h2>
  <p>${T("Iklan, bila ada, ditampilkan oleh Google AdSense dan diberi label \"Iklan\". Iklan tidak memengaruhi isi artikel.")}</p>`) }));

  hal("page:privacy", shell({ title: T("Kebijakan Privasi — {s}", { s: NAME }), desc: T("Kebijakan privasi {s}: data yang kami proses, cookie, dan iklan Google AdSense.", { s: NAME }), pid: "page:privacy", body: plain(T("Kebijakan Privasi"), true, `
  <p>${T("{o} mengelola {s} ({u}). Halaman ini menjelaskan data apa yang diproses saat Anda memakai situs.", { o: esc(cfg.owner), s: NAME, u: URL_ })}</p>
  <h2>${T("Data yang kami simpan")}</h2>
  <p>${id ? "Kami tidak meminta akun, nama, atau data pribadi untuk memakai situs. Pertanyaan yang Anda kirim di Tanya-Jawab disimpan hanya di browser Anda (localStorage) dan tidak ditampilkan ke pengunjung lain. Anda dapat menghapusnya kapan saja lewat pengaturan browser." : T("Kami tidak meminta akun, nama, atau data pribadi untuk memakai situs.")}</p>
  ${id ? `<h2>Tanya-Jawab berbantuan AI</h2>
  <p>Bila fitur AI aktif, teks pertanyaan Anda dikirim lewat server kami ke layanan Google Gemini untuk membuat jawaban. Jangan menulis data pribadi atau rahasia di kolom pertanyaan. Bila AI tidak tersedia, jawaban dibuat di browser Anda tanpa mengirim apa pun.</p>` : ""}
  <h2>${T("Log dan layanan pihak ketiga")}</h2>
  <p>${T("Penyedia hosting kami dapat mencatat data teknis standar seperti alamat IP, jenis browser, dan waktu akses untuk keamanan dan statistik. Situs memuat font dari Google Fonts, sehingga browser Anda terhubung ke server Google.")}</p>
  <h2>${T("Iklan dan cookie Google AdSense")}</h2>
  <p>${T("Kami menggunakan Google AdSense untuk menampilkan iklan. Google dan mitra iklannya memakai cookie atau teknologi serupa untuk menayangkan iklan berdasarkan kunjungan Anda ke situs ini dan situs lain, serta mengukur kinerja iklan.")}</p>
  <ul>
    <li>${T("Anda dapat menonaktifkan personalisasi iklan di <a href=\"https://adssettings.google.com\" target=\"_blank\" rel=\"noopener noreferrer\">Pengaturan Iklan Google</a>.")}</li>
    <li>${T("Anda juga dapat memilih keluar dari iklan personalisasi pihak ketiga lewat <a href=\"https://www.aboutads.info/choices/\" target=\"_blank\" rel=\"noopener noreferrer\">aboutads.info</a>.")}</li>
    <li>${T("Cara Google memakai data dari situs mitra dijelaskan di <a href=\"https://policies.google.com/technologies/partner-sites\" target=\"_blank\" rel=\"noopener noreferrer\">policies.google.com/technologies/partner-sites</a>.")}</li>
  </ul>
  <p>${T("Pengunjung dari Wilayah Ekonomi Eropa, Inggris, dan Swiss dapat melihat pesan persetujuan cookie dan memilih apakah data dipakai untuk iklan.")}</p>
  <h2>${T("Anak-anak")}</h2>
  <p>${T("Situs ini tidak ditujukan untuk anak di bawah 13 tahun dan kami tidak dengan sengaja mengumpulkan data mereka.")}</p>
  <h2>${T("Perubahan dan kontak")}</h2>
  <p>${T("Kebijakan ini dapat diperbarui; tanggal pembaruan tertera di atas. Pertanyaan tentang privasi? Hubungi {m}.", { m: mail })}</p>`) }));

  if (LG === DEF) write("404.html", shell({ title: T("Halaman tidak ditemukan — {s}", { s: NAME }), desc: T("Halaman yang Anda cari tidak ditemukan."), pid: "page:404", noindex: true, body: `<main class="article plain nf"><b>404</b><h1>${T("Bintangnya tidak ketemu.")}</h1><p>${T("Halaman yang Anda cari tidak ada atau sudah pindah.")}</p><p><a class="more" href="/index.html">${T("Kembali ke beranda →")}</a></p></main>` }));

  if (EXTRA) {
    hal("dates", halamanIndeksTanggal());
    BULAN.forEach((_, m) => { hal(`month:${m}`, halamanBulan(m)); for (let d = 1; d <= HARI_BULAN[m]; d++) hal(`date:${m}:${d}`, halamanTanggal(m, d)); });
    hal("compats", halamanIndeksKecocokan());
    Z.forEach((_, i) => hal(`compat:${Z[i].n}`, halamanKecocokan(i)));
  }

  /* ---------- Beranda ---------- */
  let idx = fs.readFileSync(path.join(ROOT, "templates/index.src.html"), "utf8");
  const b = upOf("index.html");
  const steps = Z.map((z, i) => {
    const k = kb[z.n], x = ZX[z.n], opp = Z[(i + 6) % 12];
    return `<article class="step" id="z-${z.n.toLowerCase()}" data-i="${i}" style="--ac:${ACC[z.e]}">
      <div class="card">
        <p class="mono idx"><b>${String(i + 1).padStart(2, "0")}</b> / 12 <span>·</span> ${T(z.e)} <span>·</span> ${T(x.mod)}</p>
        <div class="zhead"><span class="glyph" aria-hidden="true">${GL(z.s)}</span><h2 class="zname" data-split>${N(z.n)}</h2></div>
        <p class="mono zmeta" data-scrin>${T(k.dates)} · ${T(z.ru)}</p>
        <p class="zq"><em>${esc(T(z.q))}</em></p>
        <p class="zd">${esc(T(z.d))}</p>
        <ul class="ztags">${z.t.map(t => `<li>${esc(T(t))}</li>`).join("")}</ul>
        <dl class="zmini">
          <div><dt class="mono">${T("Seberang")}</dt><dd>${N(opp.n)}</dd></div><div><dt class="mono">${T("Batu")}</dt><dd>${T(x.batu)}</dd></div><div><dt class="mono">${T("Tarot")}</dt><dd>${x.tarot}</dd></div><div><dt class="mono">${T("Tubuh")}</dt><dd>${T(x.tubuh).split(T(" dan "))[0].split(",")[0].split("、")[0]}</dd></div>
        </dl>
        <div class="zact"><button class="btn" type="button" data-open="${i}" data-scr>${T("Buka berkas lengkap")}</button><a class="lnk mono" href="${ZD()}/${SL(z.n)}.html" data-scr>${T("Artikel {n} →", { n: N(z.n) })}</a></div>
      </div>
    </article>`;
  }).join("\n    ");
  const MODS = ["Kardinal", "Tetap", "Mutable"], ELS = ["Api", "Tanah", "Udara", "Air"];
  const buku = `<section class="sec" id="buku">
    <div class="sec-head">
      <p class="kicker mono" data-rv>${T("[ 02 — Buku langit ]")}</p>
      <h2 class="h-sec" data-split>${T("Dasar-dasar zodiak")}</h2>
      <p class="sec-lead" data-rv>${T("Dari mana zodiak berasal, mengapa tanggalnya bergeser, dan apa bedanya tanda dengan rasi bintang.")}</p>
    </div>
    <ol class="entries">${ZI.dasar.map(([t, d], j) => `<li data-rv style="--d:${(j % 4) * 0.08}s"><span class="mono">${String(j + 1).padStart(2, "0")}</span><h3>${esc(T(t))}</h3><p>${esc(T(d))}</p></li>`).join("")}</ol>
    <div class="matrix-wrap" data-rv>
      <h3 class="mono sub-h">${T("Elemen × modalitas: tiap zodiak punya satu kombinasi unik")}</h3>
      <table class="matrix">
        <thead><tr><th></th>${MODS.map(m => `<th scope="col" class="mono">${T(m)}</th>`).join("")}</tr></thead>
        <tbody>${ELS.map(e => `<tr style="--ac:${ACC[e]}"><th scope="row"><b>${T(e)}</b><small>${esc(T(ZI.elemen.find(r => r[0] === e)[2]))}</small></th>${MODS.map(m => { const z = Z.find(q => q.e === e && ZX[q.n].mod === m); return `<td><a href="#z-${z.n.toLowerCase()}" data-jump="${Z.indexOf(z)}"><span aria-hidden="true">${GL(z.s)}</span>${N(z.n)}</a></td>`; }).join("")}</tr>`).join("")}</tbody>
      </table>
      <ul class="mods">${ZI.modalitas.map(([m, l, d]) => `<li><b class="mono">${T(m)}</b> ${esc(T(d))}</li>`).join("")}</ul>
    </div>
    <div class="peta">${ZI.peta.map(([t, d], j) => `<div class="pcard" data-rv style="--d:${(j % 3) * 0.08}s"><h3>${esc(T(t))}</h3><p>${esc(T(d))}</p></div>`).join("")}</div>
    <p class="sains" data-rv><span class="mono">${T("Catatan jujur")}</span>${esc(T(ZI.sains))}</p>
  </section>`;
  idx = idx.replace(/\{\{QA\}\}([\s\S]*?)\{\{\/QA\}\}/g, (m, isi) => (LG === "id" ? isi : ""))
    .replace(/\{\{tj:([\s\S]*?)\}\}/g, (m, s) => JSON.stringify(T(s)).slice(1, -1))
    .replace(/\{\{t:([\s\S]*?)\}\}/g, (m, s) => T(s));
  const map = {
    "{{URL}}": URL_, "{{NAME}}": NAME, "{{FONTS}}": FONTS, "{{ADSENSE}}": ADSENSE, "{{STEPS}}": steps, "{{BUKU}}": buku,
    "{{GLYPHS}}": Z.map((z, i) => `<span style="--i:${i}">${GL(z.s)}</span>`).join(""),
    "{{SIGNNAV}}": Z.map((z, i) => `<a href="#z-${z.n.toLowerCase()}" data-jump="${i}" title="${N(z.n)}"><span aria-hidden="true">${GL(z.s)}</span><span class="sr">${N(z.n)}</span></a>`).join(""),
    "{{AD:home}}": ad("home", "home"), "{{AD:side}}": ad("side", "side"), "{{FOOTER}}": foot(b, "home"), "{{ADS_JS}}": adsOn ? `<script src="${b}assets/js/ads.js"></script>` : "",
    "{{LANG}}": LG, "{{P}}": P, "{{B}}": b, "{{ALT}}": alternates("home"), "{{LANGPICK}}": langPick(b, "home"),
    "{{I18NJS}}": LG === "id" ? "" : `<script src="${b}assets/i18n/${LG}.js?v=1"></script>\n`
  };
  for (const [a, v] of Object.entries(map)) idx = idx.split(a).join(v);
  write(P + "index.html", idx);
  PAGES.unshift(urlOf("home", LG));
}

/* Kamus untuk beranda (kartu berkas, kalkulator, fakta) dimuat browser sebagai window.I18N */
for (const l of LANGS) if (l !== "id") write(`assets/i18n/${l}.js`, `window.I18N=${JSON.stringify(DICTS[l]).replace(/</g, "\\u003c")};\n`);
for (const l of [DEF, ...LANGS.filter(l => l !== DEF)]) withLang(l, bangunBahasa);

/* ---------- ads.txt, robots.txt, sitemap.xml ---------- */
write("ads.txt", adsOn ? `google.com, ${cfg.publisherId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n` : "# Belum aktif. Isi publisherId di site.config.js lalu jalankan build.\n");
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${URL_}/sitemap.xml\n`);
const urutPeta = MULTI || EXTRA ? PAGES : ["", "zodiak/index.html", ...Z.map(z => `zodiak/${z.n.toLowerCase()}.html`), "about.html", "editorial.html", "contact.html", "privacy.html", "terms.html"].map(p => `${URL_}/${p}`);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urutPeta.map(u => `  <url><loc>${u}</loc><lastmod>${ISO}</lastmod></url>`).join("\n")}\n</urlset>\n`);

/* ---------- Ringkasan ---------- */
const todo = [];
if (/contoh-domain/.test(cfg.siteUrl)) todo.push("siteUrl masih contoh-domain.com");
if (/contoh-domain/.test(cfg.email)) todo.push("email masih contoh-domain.com");
if (!adsOn) todo.push("publisherId belum diisi (iklan belum dipasang)");
else if (!Object.values(cfg.slots || {}).some(Boolean)) todo.push("ID slot kosong: hanya Auto ads yang akan tampil");
if (DILEWATI.length) todo.push(`bahasa dilewati karena belum ada kamusnya: ${DILEWATI.join(", ")}`);
for (const [l, s] of Object.entries(MISS)) if (s.size) todo.push(`${s.size} teks belum diterjemahkan ke "${l}" (lihat i18n/_belum-${l}.json)`);
for (const l of LANGS) if (l !== "id") { const f = path.join(ROOT, "i18n", `_belum-${l}.json`); if (MISS[l] && MISS[l].size) write(`i18n/_belum-${l}.json`, JSON.stringify([...MISS[l]], null, 1)); else if (fs.existsSync(f)) fs.unlinkSync(f); }
console.log(`Selesai: ${urutPeta.length + (MULTI || EXTRA ? 0 : 1)} halaman + ads.txt, robots.txt, sitemap.xml (${ISO}).`);
console.log(todo.length ? "Yang masih perlu diisi di site.config.js:\n - " + todo.join("\n - ") : "Konfigurasi lengkap.");
