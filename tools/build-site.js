#!/usr/bin/env node
/* Membangun halaman statis Astral dari site.config.js + data zodiak.
   Menghasilkan: index.html, zodiak/*.html (12 artikel + indeks), about/contact/privacy/terms/editorial/404,
   ads.txt, robots.txt, sitemap.xml.   Pakai:  node tools/build-site.js */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const cfg = require(path.join(ROOT, "site.config.js"));

global.window = {};
for (const f of ["zodiac-data", "knowledge", "lifestyle"]) eval(fs.readFileSync(path.join(ROOT, "assets/js", f + ".js"), "utf8"));
const Z = window.ZODIAC, KB = window.KB, LIFE = window.LIFE;

const URL_ = cfg.siteUrl.replace(/\/+$/, ""), NAME = cfg.siteName;
const adsOn = /^ca-pub-\d{10,20}$/.test(cfg.publisherId);
const ACC = { Api: "#ff6a3d", Tanah: "#a4f06a", Udara: "#5fd8ff", Air: "#a98bff" };
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const now = process.env.BUILD_DATE ? new Date(process.env.BUILD_DATE + "T00:00:00") : new Date();
const ISO = now.toISOString().slice(0, 10), TGL = `${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`, YEAR = now.getFullYear();
const slug = n => n.toLowerCase();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const jsonLd = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
/* Versi aset diisi otomatis dari isi file, jadi browser selalu memuat versi terbaru setelah build. */
const hashCache = {};
const assetHash = rel => hashCache[rel] || (hashCache[rel] = (() => { try { return require("crypto").createHash("md5").update(fs.readFileSync(path.join(ROOT, rel))).digest("hex").slice(0, 8); } catch { return "0"; } })());
const stampAssets = txt => typeof txt === "string" ? txt.replace(/(assets\/[\w\-\/]+\.(?:js|css))\?v=[\w]+/g, (m, f) => `${f}?v=${assetHash(f)}`) : txt;
const write = (rel, txt) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, rel.endsWith(".html") ? stampAssets(txt) : txt); };
const byName = Object.fromEntries(Z.map(z => [z.n, z]));
const kb = Object.fromEntries(KB.zodiak.map(k => [k.name, k]));

/* ---------- Bagian bersama ---------- */
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Inter:wght@300;400;500&family=Space+Mono&display=swap" rel="stylesheet">`;
const ADSENSE = adsOn ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.publisherId}" crossorigin="anonymous"></script>` : "";

/* Unit iklan manual. Tanpa ID slot, tidak ada yang dirender (Auto ads yang mengatur). */
function ad(key, cls = "") {
  const slot = (cfg.slots || {})[key];
  if (!adsOn || !slot) return "";
  return `<aside class="adwrap ${cls}" aria-label="Iklan"><small>Iklan</small><ins class="adsbygoogle" style="display:block" data-ad-client="${cfg.publisherId}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins></aside>`;
}

const head = b => `<header class="sitehead"><a class="brand" href="${b}index.html">${NAME.toUpperCase()}</a>
  <nav aria-label="Utama"><a href="${b}zodiak/index.html">Semua zodiak</a><a href="${b}index.html#tanya">Tanya-Jawab</a><a href="${b}about.html">Tentang</a><a href="${b}contact.html">Kontak</a></nav></header>`;

const foot = b => `<footer class="foot">
  <div class="foot-top">
    <div><a class="brand" href="${b}index.html">${NAME.toUpperCase()}</a><p>Penelusuran zodiak dan tanya-jawab astrologi berbahasa Indonesia. Konten untuk hiburan.</p></div>
    <div><h5>Zodiak</h5><nav class="cols" aria-label="Zodiak">${Z.map(z => `<a href="${b}zodiak/${slug(z.n)}.html">${z.n}</a>`).join("")}</nav></div>
    <div><h5>Informasi</h5><nav aria-label="Informasi"><a href="${b}about.html">Tentang Kami</a><a href="${b}editorial.html">Kebijakan Editorial</a><a href="${b}contact.html">Kontak</a><a href="${b}privacy.html">Kebijakan Privasi</a><a href="${b}terms.html">Syarat Layanan</a></nav></div>
  </div>
  <div class="foot-bot">© ${YEAR} ${NAME} · Konten untuk hiburan, bukan nasihat medis, hukum, atau keuangan.</div>
</footer>`;

function shell({ title, desc, file, body, ld = [], b = "", type = "website", ac = "", el = "", noindex = false }) {
  const url = `${URL_}/${file}`;
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#07070a">
<script>(function(){var r=document.documentElement;r.classList.add("js");try{var n=JSON.parse(sessionStorage.getItem("astral-nav")||"null");if(n){r.classList.add("cv");r.style.setProperty("--cv",n.c||"#e2c98f")}}catch(e){}setTimeout(function(){if(!window.AX)r.classList.remove("js","cv")},5000)})()</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">${noindex ? '\n<meta name="robots" content="noindex">' : `\n<link rel="canonical" href="${url}">`}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${NAME}">
<link rel="icon" href="${b}assets/images/favicon.svg" type="image/svg+xml">
${FONTS}
<link rel="stylesheet" href="${b}assets/css/main.css?v=24">
<link rel="stylesheet" href="${b}assets/css/observatorium.css">
${ADSENSE}
${ld.map(jsonLd).join("\n")}
</head>
<body${el ? ` data-el="${el}"` : ""}${ac ? ` style="--ac:${ac}"` : ""}>
<div id="curtain" aria-hidden="true"><span>ASTRAL</span></div>
${head(b)}
${body}
${foot(b)}
<script src="${b}assets/js/fx.js?v=1"></script>
<script src="${b}assets/js/observatorium.js"></script>
${adsOn ? `<script src="${b}assets/js/ads.js"></script>` : ""}
</body>
</html>
`;
}

const card = (z, b) => `<a class="scard" data-el="${z.e}" style="--ac:${ACC[z.e]}" href="${b}zodiak/${slug(z.n)}.html"><span class="sy" aria-hidden="true">${z.s}</span><span class="sn">${z.n}</span><span class="sd">${z.r}</span><span class="sq">${esc(z.q)}</span><span class="se">${z.e}</span></a>`;
const crumbs = (b, items) => `<p class="crumbs"><a href="${b}index.html">${NAME}</a> / ${items.join(" / ")}</p>`;

function figure(z) {
  const p = z.shape.pts;
  const ln = z.shape.ln.map(([a, c]) => `<path class="ln" pathLength="1" d="M${p[a][0]} ${p[a][1]}L${p[c][0]} ${p[c][1]}"/>`).join("");
  const st = p.map(q => `<circle class="st" cx="${q[0]}" cy="${q[1]}" r="${p.length > 12 ? 4.5 : 6}"/>`).join("");
  return `<div class="art-fig" aria-hidden="true"><div class="ring"></div><svg viewBox="0 0 400 400">${ln}${st}</svg></div>`;
}

/* ---------- Artikel zodiak ---------- */
function article(z, i) {
  const k = kb[z.n], L = LIFE.zodiak[z.n], ac = ACC[z.e], n = z.n, u = `${URL_}/zodiak/${slug(n)}.html`;
  const prev = Z[(i + 11) % 12], next = Z[(i + 1) % 12];
  const zl = nm => `<a href="${slug(nm)}.html">${nm}</a>`;
  const list = a => a.map(nm => zl(nm)).join(", ");
  const same = Z.filter(x => x.e === z.e && x.n !== n);
  const life = (key, label) => `<h3>${label}</h3><p>${n} ${esc(L[key][0])}</p><p>${esc(L[key][1])}</p>`;

  const faq = [
    [`Apa kelebihan utama ${n}?`, `${n} dikenal ${k.strengths.slice(0, 3).map(s => s[0].toLowerCase()).join(", ")}.`],
    [`Apa kekurangan ${n} yang perlu diwaspadai?`, `${n} cenderung ${k.weaknesses.map(s => s[0].toLowerCase()).join(", ")}.`],
    [`Zodiak apa yang cocok dengan ${n}?`, `Menurut tradisi zodiak, ${n} cocok dengan ${k.match.join(", ")}. Kurang cocok dengan ${k.avoid.join(", ")}.`],
    [`Karier apa yang cocok untuk ${n}?`, `Pekerjaan yang sering dikaitkan dengan ${n} antara lain ${k.career.join(", ")}.`],
    [`Apa elemen dan planet penguasa ${n}?`, `Elemen ${n} adalah ${z.e} dan planet penguasanya ${z.ru}.`],
    [`Kapan ${n} berlaku?`, `${n} berlaku pada ${k.dates}.`]
  ];
  const ld = [{
    "@context": "https://schema.org", "@graph": [
      { "@type": "Article", headline: `${n}: Sifat, Kelebihan, Kekurangan & Kecocokan`, description: z.d, inLanguage: "id", datePublished: ISO, dateModified: ISO,
        author: { "@type": "Organization", name: NAME }, publisher: { "@type": "Organization", name: NAME, url: URL_ + "/" }, mainEntityOfPage: u },
      { "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      { "@type": "BreadcrumbList", itemListElement: [[NAME, URL_ + "/"], ["Zodiak", URL_ + "/zodiak/index.html"], [n, u]].map(([name, item], j) => ({ "@type": "ListItem", position: j + 1, name, item })) }
    ]
  }];

  const body = `<main class="article">
  <div class="art-glow" aria-hidden="true"></div>
  <article>
    ${crumbs("../", [`<a href="index.html">Zodiak</a>`, n])}
    <div class="art-top">
      <div>
        <p class="idx">${z.s} &nbsp;${k.dates}</p>
        <h1>${n}</h1>
        <p class="lead">${esc(z.q)}</p>
      </div>
      ${figure(z)}
    </div>
    <p>${esc(z.d)}</p>
    <dl class="meta2">
      <div><dt>Elemen</dt><dd>${z.e}</dd></div>
      <div><dt>Planet penguasa</dt><dd>${z.ru}</dd></div>
      <div><dt>Tanggal</dt><dd>${k.dates}</dd></div>
      <div><dt>Sifat kunci</dt><dd>${z.t.join(" · ")}</dd></div>
    </dl>

    <h2>Kelebihan ${n}</h2>
    <ul>${k.strengths.map(s => `<li><b>${esc(s[0])}</b>: ${esc(s[1])}</li>`).join("")}</ul>

    <h2>Kekurangan yang perlu diwaspadai</h2>
    <ul>${k.weaknesses.map(s => `<li><b>${esc(s[0])}</b>: ${esc(s[1])}</li>`).join("")}</ul>

    <h2>${n} dalam cinta</h2>
    <p>${esc(k.love)}</p>
    <p>Pasangan yang sering dianggap serasi dengan ${n} adalah ${list(k.match)}. Bagian kecocokan di bawah menjelaskan alasannya berdasarkan elemen.</p>

    ${ad("article")}

    <h2>Karier dan gaya kerja</h2>
    <p>Pekerjaan yang sering dikaitkan dengan ${n}: ${k.career.join(", ")}.</p>
    <p>${n} ${esc(L.work[0])}</p>
    <p>${esc(L.work[1])}</p>

    <h2>Gaya hidup ${n}</h2>
    ${life("food", "Makanan")}${life("travel", "Liburan")}${life("fashion", "Gaya berpakaian")}${life("money", "Keuangan")}

    <h2>Kecocokan ${n}</h2>
    <p>Cocok dengan: <b>${list(k.match)}</b>.</p>
    <p>Kurang cocok dengan: <b>${list(k.avoid)}</b>.</p>
    <p>${esc(KB.elements[k.element])}</p>
    <p>Kecocokan ini hanya tradisi zodiak populer. Hubungan nyata lebih ditentukan oleh komunikasi, nilai hidup, dan usaha kedua pihak.</p>

    <section class="faq">
      <h2>Pertanyaan umum tentang ${n}</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}
    </section>

    ${ad("articleEnd")}

    <h2>Zodiak ${z.e} lainnya</h2>
    <p>${n} termasuk elemen ${z.e} bersama ${same.map(x => x.n).join(" dan ")}.</p>
    <div class="pill-row">${same.map(x => `<a href="${slug(x.n)}.html">${x.s} ${x.n}</a>`).join("")}<a href="index.html">Semua zodiak</a></div>

    <h2>Sumber rujukan</h2>
    <ul class="src">${KB.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></li>`).join("")}</ul>
    <p>Isi artikel ini adalah ringkasan dengan kata-kata sendiri dan dimaksudkan untuk hiburan, bukan fakta ilmiah. Lihat <a href="../editorial.html">Kebijakan Editorial</a>.</p>
    <p class="stamp">Terakhir diperbarui: ${TGL}</p>

    <nav class="pn" aria-label="Zodiak lain">
      <a href="${slug(prev.n)}.html">← ${prev.n}</a>
      <a href="../index.html#tanya">Tanya-jawab</a>
      <a href="${slug(next.n)}.html">${next.n} →</a>
    </nav>
  </article>
</main>`;
  return shell({ title: `${n}: Sifat, Kelebihan, Kekurangan & Kecocokan — ${NAME}`, desc: `${n} (${k.dates}), elemen ${z.e} dikuasai ${z.ru}. Kelebihan, kekurangan, cinta, karier, gaya hidup, dan pasangan yang cocok.`, file: `zodiak/${slug(n)}.html`, body, ld, b: "../", type: "article", ac, el: z.e });
}

Z.forEach((z, i) => write(`zodiak/${slug(z.n)}.html`, article(z, i)));

/* ---------- Indeks zodiak ---------- */
const hubBody = `<main class="article plain" style="max-width:1100px">
  ${crumbs("../", ["Zodiak"])}
  <h1>Semua zodiak</h1>
  <p class="lead" style="font-size:1.5rem">Dua belas tanda, empat elemen.</p>
  <p style="max-width:62ch">Pilih zodiak untuk membaca sifat, kelebihan, kekurangan, kecocokan cinta, karier, dan gaya hidupnya. Zodiak dikelompokkan menurut elemen karena elemen yang sama biasanya terasa serasi.</p>
  ${["Api", "Tanah", "Udara", "Air"].map(e => `<h2 style="color:${ACC[e]}">Elemen ${e}</h2><p style="margin-bottom:1.4rem;max-width:62ch">${esc(KB.elements[e])}</p><div class="sgrid">${Z.filter(z => z.e === e).map(z => card(z, "../")).join("")}</div>`).join("")}
  <p class="stamp">Terakhir diperbarui: ${TGL}</p>
</main>`;
write("zodiak/index.html", shell({ title: `Semua Zodiak: Sifat dan Kecocokan 12 Tanda — ${NAME}`, desc: "Daftar lengkap 12 zodiak berdasarkan elemen: tanggal, sifat, kelebihan, kekurangan, dan kecocokan.", file: "zodiak/index.html", body: hubBody, b: "../",
  ld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Semua Zodiak", url: URL_ + "/zodiak/index.html", inLanguage: "id" }] }));

/* ---------- Halaman informasi ---------- */
const plain = (title, upd, inner) => `<main class="article plain">
  ${crumbs("", [title])}
  <h1>${title}</h1>
  ${upd ? `<p class="upd">Terakhir diperbarui: ${TGL}</p>` : ""}
  ${inner}
</main>`;
const mail = `<a href="mailto:${cfg.email}">${cfg.email}</a>`;
const waShow = cfg.whatsapp ? ("0" + cfg.whatsapp.slice(2)).replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3") : "";
const wa = cfg.whatsapp ? `<a href="https://wa.me/${cfg.whatsapp}" target="_blank" rel="noopener">${waShow}</a>` : "";

write("about.html", shell({ title: `Tentang Kami — ${NAME}`, desc: `Tentang ${NAME}: penelusuran zodiak dan tanya-jawab astrologi berbahasa Indonesia.`, file: "about.html", body: plain("Tentang Kami", false, `
  <p>${NAME} adalah situs penelusuran zodiak dan tanya-jawab astrologi berbahasa Indonesia, dikelola oleh ${esc(cfg.owner)}. Kami membuatnya untuk siapa saja yang penasaran dengan dua belas zodiak: sifatnya, kecocokannya, dan cara tradisi astrologi memandang cinta, karier, serta gaya hidup.</p>
  <h2>Apa yang tersedia</h2>
  <ul><li><b>Penelusuran zodiak</b>: dua belas zodiak dengan rasi bintang animasi, ringkasan karakter, dan ramalan harian singkat.</li><li><b>Artikel lengkap</b>: setiap zodiak punya halaman berisi kelebihan, kekurangan, cinta, karier, gaya hidup, kecocokan, dan tanya-jawab.</li><li><b>Tanya-jawab</b>: pertanyaan seputar astrologi dijawab dari basis pengetahuan situs, dan bila tersedia dibantu AI.</li></ul>
  <h2>Cara kami menulis</h2>
  <p>Isi disusun ulang dengan kata-kata sendiri dari ringkasan umum astrologi, dengan sumber rujukan di setiap artikel. Jawaban tanya-jawab dapat dibantu AI, dan kami menandai konten ini untuk hiburan. Detailnya ada di <a href="editorial.html">Kebijakan Editorial</a>.</p>
  <h2>Penting diketahui</h2>
  <p>Astrologi tidak didukung bukti ilmiah sebagai alat untuk memprediksi kepribadian atau masa depan. ${NAME} bukan sumber nasihat medis, hukum, atau keuangan.</p>
  <h2>Hubungi kami</h2>
  <p>Punya koreksi, saran, atau pertanyaan? Tulis lewat halaman <a href="contact.html">Kontak</a> atau kirim email ke ${mail}${wa ? ` atau WhatsApp ${wa}` : ""}.</p>`) }));

write("contact.html", shell({ title: `Kontak — ${NAME}`, desc: `Hubungi ${NAME} untuk koreksi, saran, atau pertanyaan.`, file: "contact.html", body: plain("Kontak", false, `
  <p>Kami membaca setiap pesan tentang koreksi isi, saran fitur, atau pertanyaan kerja sama. Kirim email ke ${mail}, atau isi formulir di bawah dan aplikasi email Anda akan terbuka dengan pesan yang sudah terisi.</p>
  ${wa ? `<p>Lebih cepat lewat WhatsApp: ${wa}.</p>` : ""}
  <form class="cform" id="cf">
    <input id="cn" placeholder="Nama" aria-label="Nama" required>
    <input id="cs" placeholder="Subjek" aria-label="Subjek" required>
    <textarea id="cm" placeholder="Pesan Anda" aria-label="Pesan" required></textarea>
    <button type="submit">Buka email</button>
  </form>
  <script>document.getElementById("cf").addEventListener("submit",function(e){e.preventDefault();var g=function(i){return document.getElementById(i).value};location.href="mailto:${cfg.email}?subject="+encodeURIComponent(g("cs"))+"&body="+encodeURIComponent(g("cm")+"\\n\\n— "+g("cn"));});</script>
  <h2>Koreksi isi</h2>
  <p>Jika menemukan kesalahan tanggal, elemen, atau informasi lain, sebutkan halaman dan bagian yang dimaksud agar mudah kami periksa.</p>`) }));

write("terms.html", shell({ title: `Syarat Layanan — ${NAME}`, desc: `Syarat penggunaan situs ${NAME}.`, file: "terms.html", body: plain("Syarat Layanan", true, `
  <p>Dengan memakai ${NAME}, Anda menyetujui syarat berikut.</p>
  <h2>Konten untuk hiburan</h2>
  <p>Seluruh konten astrologi disajikan untuk hiburan dan bukan nasihat medis, psikologis, hukum, atau keuangan. Jangan mengambil keputusan penting hanya berdasarkan zodiak.</p>
  <h2>Penggunaan yang diizinkan</h2>
  <p>Anda boleh membaca dan membagikan tautan ke halaman kami. Anda dilarang mengirim konten yang melanggar hukum, mengandung SARA, ujaran kebencian, atau spam, serta mengganggu kinerja situs, misalnya dengan permintaan otomatis berlebihan.</p>
  <h2>Hak cipta</h2>
  <p>Teks, desain, dan kode situs ini dimiliki ${esc(cfg.owner)}. Mengutip sebagian kecil dengan tautan ke halaman asal diperbolehkan; menyalin artikel secara utuh tidak.</p>
  <h2>Tautan dan iklan pihak ketiga</h2>
  <p>Situs ini memuat tautan ke sumber luar dan dapat menampilkan iklan dari pihak ketiga seperti Google AdSense. Kami tidak bertanggung jawab atas isi situs atau iklan pihak ketiga.</p>
  <h2>Tanpa jaminan</h2>
  <p>Konten disediakan apa adanya. Kami berusaha akurat, tetapi tidak menjamin bebas dari kekeliruan, dan jawaban yang dibantu AI dapat keliru.</p>
  <h2>Perubahan</h2>
  <p>Syarat ini dapat diperbarui sewaktu-waktu; tanggal pembaruan tertera di atas. Pertanyaan? Hubungi ${mail}.</p>`) }));

write("editorial.html", shell({ title: `Kebijakan Editorial — ${NAME}`, desc: `Cara ${NAME} menyusun, memeriksa, dan memperbarui konten zodiak.`, file: "editorial.html", body: plain("Kebijakan Editorial", true, `
  <p>Halaman ini menjelaskan bagaimana konten ${NAME} dibuat, agar Anda tahu apa yang bisa dan tidak bisa diandalkan.</p>
  <h2>Sumber</h2>
  <p>Tanggal dan elemen zodiak dicocokkan dengan beberapa sumber berbahasa Indonesia, dan planet penguasa mengikuti tradisi astrologi umum. Setiap artikel mencantumkan sumber rujukannya. ${esc(KB.checked)}</p>
  <h2>Penulisan</h2>
  <p>Sifat, kecocokan, dan gaya hidup ditulis ulang dengan kata-kata sendiri dari ringkasan umum astrologi, bukan disalin dari satu sumber. Konten ini adalah tafsir tradisi, bukan temuan ilmiah.</p>
  <h2>Penggunaan AI</h2>
  <p>Bagian tanya-jawab dapat dibantu model AI. Jawaban AI diberi petunjuk agar berperan sebagai pakar zodiak yang berhati-hati, namun tetap dapat keliru. Jawaban tidak ditinjau satu per satu oleh editor.</p>
  <h2>Koreksi</h2>
  <p>Kesalahan yang kami temukan atau dilaporkan akan diperbaiki dan tanggal pembaruan halaman diubah. Laporkan lewat ${mail}.</p>
  <h2>Iklan</h2>
  <p>Iklan, bila ada, ditampilkan oleh Google AdSense dan diberi label "Iklan". Iklan tidak memengaruhi isi artikel.</p>`) }));

write("privacy.html", shell({ title: `Kebijakan Privasi — ${NAME}`, desc: `Kebijakan privasi ${NAME}: data yang kami proses, cookie, dan iklan Google AdSense.`, file: "privacy.html", body: plain("Kebijakan Privasi", true, `
  <p>${esc(cfg.owner)} mengelola ${NAME} (${URL_}). Halaman ini menjelaskan data apa yang diproses saat Anda memakai situs.</p>
  <h2>Data yang kami simpan</h2>
  <p>Kami tidak meminta akun, nama, atau data pribadi untuk memakai situs. Pertanyaan yang Anda kirim di Tanya-Jawab disimpan hanya di browser Anda (localStorage) dan tidak ditampilkan ke pengunjung lain. Anda dapat menghapusnya kapan saja lewat pengaturan browser.</p>
  <h2>Tanya-Jawab berbantuan AI</h2>
  <p>Bila fitur AI aktif, teks pertanyaan Anda dikirim lewat server kami ke layanan Google Gemini untuk membuat jawaban. Jangan menulis data pribadi atau rahasia di kolom pertanyaan. Bila AI tidak tersedia, jawaban dibuat di browser Anda tanpa mengirim apa pun.</p>
  <h2>Log dan layanan pihak ketiga</h2>
  <p>Penyedia hosting kami dapat mencatat data teknis standar seperti alamat IP, jenis browser, dan waktu akses untuk keamanan dan statistik. Situs memuat font dari Google Fonts, sehingga browser Anda terhubung ke server Google.</p>
  <h2>Iklan dan cookie Google AdSense</h2>
  <p>Kami menggunakan Google AdSense untuk menampilkan iklan. Google dan mitra iklannya memakai cookie atau teknologi serupa untuk menayangkan iklan berdasarkan kunjungan Anda ke situs ini dan situs lain, serta mengukur kinerja iklan.</p>
  <ul>
    <li>Anda dapat menonaktifkan personalisasi iklan di <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Pengaturan Iklan Google</a>.</li>
    <li>Anda juga dapat memilih keluar dari iklan personalisasi pihak ketiga lewat <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a>.</li>
    <li>Cara Google memakai data dari situs mitra dijelaskan di <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>.</li>
  </ul>
  <p>Pengunjung dari Wilayah Ekonomi Eropa, Inggris, dan Swiss dapat melihat pesan persetujuan cookie dan memilih apakah data dipakai untuk iklan.</p>
  <h2>Anak-anak</h2>
  <p>Situs ini tidak ditujukan untuk anak di bawah 13 tahun dan kami tidak dengan sengaja mengumpulkan data mereka.</p>
  <h2>Perubahan dan kontak</h2>
  <p>Kebijakan ini dapat diperbarui; tanggal pembaruan tertera di atas. Pertanyaan tentang privasi? Hubungi ${mail}.</p>`) }));

write("404.html", shell({ title: `Halaman tidak ditemukan — ${NAME}`, desc: "Halaman yang Anda cari tidak ditemukan.", file: "404.html", noindex: true, body: `<main class="article plain nf"><b>404</b><h1>Bintangnya tidak ketemu.</h1><p>Halaman yang Anda cari tidak ada atau sudah pindah.</p><p><a class="more" href="/index.html">Kembali ke beranda →</a></p></main>` }));

/* ---------- Beranda ---------- */
let idx = fs.readFileSync(path.join(ROOT, "templates/index.src.html"), "utf8");
const signs = `<section class="signs" id="semua">
    <h2>Semua zodiak</h2>
    <p class="sub">${NAME} memuat dua belas zodiak lengkap dengan tanggal, elemen, planet penguasa, dan artikel mendalam tentang sifat serta kecocokannya. Pilih satu untuk mulai membaca.</p>
    <div class="sgrid">${Z.map(z => card(z, "")).join("")}</div>
  </section>`;
const map = { "{{URL}}": URL_, "{{NAME}}": NAME, "{{ADSENSE}}": ADSENSE, "{{SIGNS}}": signs, "{{AD:home}}": ad("home", "home"), "{{AD:side}}": ad("side", "side"), "{{FOOTER}}": foot(""), "{{ADS_JS}}": adsOn ? '<script src="assets/js/ads.js"></script>' : "" };
for (const [a, v] of Object.entries(map)) idx = idx.split(a).join(v);
write("index.html", idx);

/* ---------- ads.txt, robots.txt, sitemap.xml ---------- */
write("ads.txt", adsOn ? `google.com, ${cfg.publisherId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n` : "# Belum aktif. Isi publisherId di site.config.js lalu jalankan build.\n");
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${URL_}/sitemap.xml\n`);
const pages = ["", "zodiak/index.html", ...Z.map(z => `zodiak/${slug(z.n)}.html`), "about.html", "editorial.html", "contact.html", "privacy.html", "terms.html"];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${URL_}/${p}</loc><lastmod>${ISO}</lastmod></url>`).join("\n")}\n</urlset>\n`);

/* ---------- Ringkasan ---------- */
const todo = [];
if (/contoh-domain/.test(cfg.siteUrl)) todo.push("siteUrl masih contoh-domain.com");
if (/contoh-domain/.test(cfg.email)) todo.push("email masih contoh-domain.com");
if (!adsOn) todo.push("publisherId belum diisi (iklan belum dipasang)");
else if (!Object.values(cfg.slots || {}).some(Boolean)) todo.push("ID slot kosong: hanya Auto ads yang akan tampil");
console.log(`Selesai: ${pages.length + 1} halaman + ads.txt, robots.txt, sitemap.xml (${ISO}).`);
console.log(todo.length ? "Yang masih perlu diisi di site.config.js:\n - " + todo.join("\n - ") : "Konfigurasi lengkap.");
