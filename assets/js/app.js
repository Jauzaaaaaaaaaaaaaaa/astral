/* Beranda Astral: pemuat, peta gulir ke langit 3D (window.SKY), HUD, berkas lengkap, kecocokan, pencari, fakta, tanya-jawab. */
(() => {
const Z = window.ZODIAC, KB = window.KB, LIFE = window.LIFE, ZX = window.ZX, ZI = window.ZINFO, AX = window.AX;
const d = document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad = n => String(n).padStart(2, "0"), slug = n => n.toLowerCase(), GL = s => s + "︎";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ACC = { Api: "#f2d7a0", Tanah: "#dfe6f5", Udara: "#a9c8ff", Air: "#a993ff" };
const KBZ = Object.fromEntries(KB.zodiak.map(k => [k.name, k]));
/* Terjemahan: window.I18N berisi {teks Indonesia: terjemahan}. Tanpa I18N (versi Indonesia) teks tampil apa adanya. */
const I18 = window.I18N, T = (s, v) => { const r = I18 && I18[s] != null ? I18[s] : String(s); return v ? r.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m) : r; };
const ZD = (I18 && I18["@dir"]) || "zodiak", SL = n => (I18 && I18["@slug:" + n]) || slug(n);
/* Titik tengah tiap rasi (asensio rekta, deklinasi), dibulatkan */
const COORD = [["02h 38m", "+20°"], ["04h 42m", "+15°"], ["07h 04m", "+22°"], ["08h 39m", "+20°"], ["10h 40m", "+13°"], ["13h 24m", "−04°"], ["15h 12m", "−15°"], ["16h 53m", "−27°"], ["19h 06m", "−28°"], ["21h 03m", "−18°"], ["22h 17m", "−11°"], ["00h 29m", "+13°"]];
const SKY = window.SKY = { s: -2, side: 0, ac: ACC.Api };

/* ---------- Pemuat ---------- */
const ld = $("#loader"), ldp = $("#ldp"), ldb = $("#ldb"), lit = $$(".ld-ring span");
let seen = false; try { seen = !!sessionStorage.getItem("astral-seen"); } catch {}
let skyReady = false, started = false, introAt = 0;
addEventListener("sky-ready", () => { skyReady = true; }, { once: true });
const MIN = seen ? 700 : 2000, MAX = 7000, t0 = performance.now();
AX.scramble($(".ld-word"), "ASTRAL", MIN * 0.8);
(function tick() {
  const n = performance.now() - t0;
  const k = Math.min(n / MIN, skyReady || n > MAX ? 1 : 0.92);
  ldp.textContent = String(Math.round(k * 100)).padStart(3, "0");
  ldb.style.transform = `scaleX(${k})`;
  lit.forEach((s, i) => s.classList.toggle("on", i < Math.round(k * 12)));
  if (k < 1) return requestAnimationFrame(tick);
  ld.classList.add("done");
  d.body.classList.remove("is-loading");
  try { sessionStorage.setItem("astral-seen", "1"); } catch {}
  introAt = performance.now();
  setTimeout(() => { started = true; AX.start(); }, 250);
  setTimeout(() => ld.remove(), 1400);
})();

/* ---------- Peta gulir ke status langit ----------
   -2 = debu awal, -1 = roda zodiak, 0..11 = rasi tiap zodiak, 12 = galaksi.
   Di antara dua zodiak ada jeda diam supaya rasi sempat terbentuk utuh saat kartu dibaca. */
const steps = $$(".step"), buku = $("#buku");
let anchors = [];
function measure() {
  const vh = innerHeight;
  anchors = [[0, -1]];
  steps.forEach((el, i) => { const r = el.getBoundingClientRect(); anchors.push([r.top + scrollY + r.height / 2 - vh / 2, i]); });
  anchors.push([buku.getBoundingClientRect().top + scrollY - vh * 0.15, 12]);
}
const smooth = t => t * t * (3 - 2 * t);
const hold = f => f < 0.2 ? 0 : f > 0.8 ? 1 : smooth((f - 0.2) / 0.6);
function stateAt(y) {
  for (let j = 1; j < anchors.length; j++) {
    const [y0, s0] = anchors[j - 1], [y1, s1] = anchors[j];
    if (y <= y1) return s0 + (s1 - s0) * hold(clamp((y - y0) / (y1 - y0), 0, 1));
  }
  return 12;
}
const sideOf = s => (s < 0 ? 0.4 : s > 11 ? 0 : s % 2 === 0 ? 1 : -1);
measure();
addEventListener("resize", measure);
addEventListener("load", measure);
if (d.fonts) d.fonts.ready.then(measure);
new ResizeObserver(measure).observe($("main"));

/* ---------- HUD ---------- */
const hudSec = $("#hudSec"), hudCoord = $("#hudCoord"), rail = $("#rail"), navs = $$("#signnav a");
let active = -9;
function setActive(i) {
  if (i === active) return;
  active = i;
  const on = i >= 0 && i <= 11;
  d.body.classList.toggle("in-journey", on);
  if (!on) return;
  const z = Z[i];
  SKY.ac = ACC[z.e];
  d.documentElement.style.setProperty("--ac", SKY.ac);
  AX.scramble(hudSec, `${pad(i + 1)} / 12 · ${T(z.n)}`, 600);
  AX.scramble(hudCoord, `RA ${COORD[i][0]} · DEK ${COORD[i][1]}`, 700);
  navs.forEach((a, j) => a.classList.toggle("on", j === i));
}

(function frame(now) {
  requestAnimationFrame(frame);
  let s = stateAt(scrollY);
  /* Intro: debu berkumpul menjadi roda zodiak */
  if (introAt) { const k = clamp((now - introAt) / 2600, 0, 1); s = -2 + (s + 2) * (1 - Math.pow(1 - k, 3)); }
  else s = -2;
  SKY.s = s;
  const a = Math.floor(s), f = s - a;
  SKY.side = sideOf(a) + (sideOf(a + 1) - sideOf(a)) * f;
  setActive(s > -0.5 && s < 11.5 ? Math.round(s) : -1);
  rail.style.transform = `scaleY(${clamp((s + 0.5) / 12, 0, 1)})`;
})(performance.now());

/* Navigasi atas menyala sesuai bagian yang sedang dibaca */
const topLinks = $$(".topnav a");
const secIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) topLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-50% 0px -50% 0px" });
["perjalanan", "buku", "kecocokan", "sepele", "tanya"].filter(id => d.getElementById(id)).forEach(id => secIO.observe(d.getElementById(id)));

/* Lompat ke zodiak: tengah kartu tepat di tengah layar */
function jump(i, immediate) {
  const el = steps[i], r = el.getBoundingClientRect();
  AX.scrollToY(r.top + scrollY + r.height / 2 - innerHeight / 2, immediate);
}

/* ---------- Berkas lengkap ---------- */
const ds = $("#dossier"), dsIn = $("#dsIn");
let dsI = -1, lastFocus = null;
const dl = rows => `<dl>${rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>`;
const pills = a => `<div class="pills">${a.map(x => `<span>${esc(T(x))}</span>`).join("")}</div>`;
function dossierHTML(i) {
  const z = Z[i], k = KBZ[z.n], x = ZX[z.n], L = LIFE.zodiak[z.n], opp = Z[(i + 6) % 12], pv = Z[(i + 11) % 12], nx = Z[(i + 1) % 12];
  const blk = (title, body, cls = "") => `<section class="blk ${cls}"><h3>${title}</h3>${body}</section>`;
  const blocks = [
    blk(T("Ringkasan"), `<p>${esc(T(z.d))}</p>`, "big"),
    blk(T("Identitas"), dl([[T("Latin"), esc(T(x.lat))], [T("Simbol"), esc(T(x.glyph))], [T("Polaritas"), T(x.pol)], [T("Penguasa"), z.ru === x.ruTrad ? T(z.ru) : T("{a} (modern), {b} (tradisional)", { a: T(z.ru), b: T(x.ruTrad) })], [T("Rumah"), T("Ke-{n}", { n: x.rumah })], [T("Seberang"), T(opp.n)], [T("Tubuh"), T(x.tubuh)], [T("Motto"), `"${T(x.motto)}"`], [T("Tarot"), x.tarot], [T("Musim"), esc(T(x.musim))]])),
    blk(T("Kelebihan"), `<ul>${k.strengths.map(s => `<li><b>${esc(T(s[0]))}</b> — ${esc(T(s[1]))}</li>`).join("")}</ul>`),
    blk(T("Kekurangan"), `<ul>${k.weaknesses.map(s => `<li><b>${esc(T(s[0]))}</b> — ${esc(T(s[1]))}</li>`).join("")}</ul>`),
    blk(T("Cinta"), `<p>${esc(T(k.love))}</p><p><b>${T("Cocok")}</b></p>${pills(k.match)}<p><b>${T("Kurang cocok")}</b></p>${pills(k.avoid)}`),
    blk(T("Keberuntungan"), dl([[T("Hari"), T(x.hari)], [T("Angka"), x.angka], [T("Warna"), T(x.warna)], [T("Batu"), T(x.batu)], [T("Logam"), T(x.logam)], [T("Bunga"), T(x.bunga)]]) + `<p class="mono" style="margin-top:10px;font-size:10px;color:var(--dim)">${T("Tradisi populer, berbeda antarsumber")}</p>`),
    blk(T("Mitologi"), `<p>${esc(T(x.mitos))}</p>`),
    blk(T("Karier &amp; uang"), `${pills(k.career)}<p>${T(z.n)} ${esc(T(L.work[0]))}</p><p>${T(z.n)} ${esc(T(L.money[0]))}</p>`),
    blk(T("Di langit malam"), dl([[T("Terang"), esc(T(x.rasi.terang))], [T("Luas"), T("{a}°², ke-{b} dari 88", { a: x.rasi.luas, b: x.rasi.peringkat })], [T("Objek"), esc(T(x.rasi.objek))], [T("Terlihat"), T("Malam, bulan {m}", { m: T(x.rasi.lihat) })], [T("Matahari"), T(x.rasi.matahari)]])),
    blk(T("Gaya hidup"), `<p><b>${T("Makanan.")}</b> ${T(z.n)} ${esc(T(L.food[0]))}</p><p><b>${T("Liburan.")}</b> ${T(z.n)} ${esc(T(L.travel[0]))}</p><p><b>${T("Busana.")}</b> ${T(z.n)} ${esc(T(L.fashion[0]))}</p>`),
    blk(T("Tokoh terkenal"), pills(x.tokoh)),
    blk(T("Fakta sepele"), `<ul>${x.sepele.map((t, j) => `<li><b class="mono">${pad(j + 1)}</b> ${esc(T(t))}</li>`).join("")}</ul>`)
  ].map((b, j) => b.replace('class="blk', `style="transition-delay:${0.25 + j * 0.05}s" class="blk`));
  return `<button class="btn ghost ds-close" type="button" data-close data-scr>${T("Tutup [Esc]")}</button>
  <header class="ds-top" style="--ac:${ACC[z.e]}">
    <div class="ds-g" aria-hidden="true">${GL(z.s)}</div>
    <div><p class="mono">${pad(i + 1)} / 12 · ${T(k.dates)} · ${T(z.e)} · ${T(x.mod)}</p><h2 id="dsName">${T(z.n)}</h2><p class="zq"><em>${esc(T(z.q))}</em></p></div>
  </header>
  <div class="ds-grid" style="--ac:${ACC[z.e]}">${blocks.join("")}</div>
  <nav class="ds-nav" aria-label="${T("Zodiak lain")}"><button class="btn ghost" type="button" data-ds="${(i + 11) % 12}">← ${T(pv.n)}</button><a class="btn" href="${ZD}/${SL(z.n)}.html">${T("Artikel lengkap {n}", { n: T(z.n) })}</a><button class="btn ghost" type="button" data-ds="${(i + 1) % 12}">${T(nx.n)} →</button></nav>`;
}
function openDs(i, from) {
  dsI = i; lastFocus = d.activeElement;
  dsIn.innerHTML = dossierHTML(i);
  const r = from && from.getBoundingClientRect();
  ds.style.setProperty("--ox", r ? r.left + r.width / 2 + "px" : "50%");
  ds.style.setProperty("--oy", r ? r.top + r.height / 2 + "px" : "50%");
  ds.hidden = false; ds.scrollTop = 0;
  if (AX.lenis) AX.lenis.stop();
  d.body.style.overflow = "hidden";
  requestAnimationFrame(() => requestAnimationFrame(() => { ds.classList.add("open"); setTimeout(() => ds.classList.add("shown"), 200); }));
  ds.querySelector("[data-close]").focus({ preventScroll: true });
}
function closeDs() {
  if (ds.hidden) return;
  ds.classList.remove("shown", "open");
  d.body.style.overflow = "";
  if (AX.lenis) AX.lenis.start();
  setTimeout(() => { ds.hidden = true; dsIn.innerHTML = ""; }, 1000);
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
function switchDs(i) {
  ds.classList.remove("shown");
  jump(i, true); /* langit di belakang ikut berganti rasi */
  setTimeout(() => { dsI = i; dsIn.innerHTML = dossierHTML(i); ds.scrollTop = 0; ds.classList.add("shown"); ds.querySelector("[data-close]").focus({ preventScroll: true }); }, 420);
}
d.addEventListener("keydown", e => {
  if (ds.hidden) return;
  if (e.key === "Escape") closeDs();
  if (e.key === "Tab") { /* fokus tetap di dalam dialog */
    const f = [...ds.querySelectorAll("button,a[href]")], a = f[0], b = f[f.length - 1];
    if (e.shiftKey && d.activeElement === a) { e.preventDefault(); b.focus(); }
    else if (!e.shiftKey && d.activeElement === b) { e.preventDefault(); a.focus(); }
  }
});

d.addEventListener("click", e => {
  const t = e.target;
  const op = t.closest("[data-open]"); if (op) return openDs(+op.dataset.open, op);
  const sw = t.closest("[data-ds]"); if (sw) return switchDs(+sw.dataset.ds);
  if (t.closest("[data-close]")) return closeDs();
  const j = t.closest("[data-jump]"); if (j) { e.preventDefault(); closeDs(); jump(+j.dataset.jump); }
});

/* ---------- Kecocokan ---------- */
const ASP = ZI.aspek;
const PAIR = { Api: "Udara", Udara: "Api", Tanah: "Air", Air: "Tanah" };
let cA = 0, cB = 4, shown = 0;
const cpA = $("#cpA"), cpB = $("#cpB"), cpScore = $("#cpScore"), cpArc = $("#cpArc");
function picker(box, get, set) {
  box.innerHTML = Z.map((z, i) => `<button type="button" role="radio" aria-checked="${i === get()}" aria-label="${T(z.n)}" title="${T(z.n)}" data-i="${i}">${GL(z.s)}</button>`).join("");
  box.onclick = e => { const b = e.target.closest("button"); if (!b) return; set(+b.dataset.i); box.querySelectorAll("button").forEach(x => x.setAttribute("aria-checked", x === b)); compat(); };
}
picker(cpA, () => cA, v => { cA = v; });
picker(cpB, () => cB, v => { cB = v; });
function compat() {
  const A = Z[cA], B = Z[cB], ka = KBZ[A.n];
  let dist = Math.abs(cA - cB); dist = Math.min(dist, 12 - dist);
  let [name, score, desc] = ASP[dist];
  if (ka.match.includes(B.n)) score += 4;
  if (ka.avoid.includes(B.n)) score -= 6;
  score = clamp(score, 5, 99);
  const rel = A.e === B.e ? T("satu elemen, cara berpikirnya mirip") : PAIR[A.e] === B.e ? T("elemen yang saling menghidupkan") : T("elemen yang berbeda arah");
  AX.scramble($("#cpAspect"), T(name), 600);
  AX.scramble($("#cpPair"), `${T(A.n)} & ${T(B.n)}`, 700);
  $("#cpDesc").textContent = T("{d} {a} ({ea}) dan {b} ({eb}): {r}. Untuk hiburan; hubungan nyata ditentukan komunikasi dan usaha bersama.", { d: T(desc), a: T(A.n), ea: T(A.e), b: T(B.n), eb: T(B.e), r: rel });
  cpArc.style.strokeDashoffset = 100 - score;
  const from = shown, t0 = performance.now();
  (function count(now) {
    const k = Math.min(1, (now - t0) / 1200), v = Math.round(from + (score - from) * (1 - Math.pow(1 - k, 3)));
    cpScore.textContent = v; shown = v;
    if (k < 1) requestAnimationFrame(count);
  })(t0);
}
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { compat(); o.disconnect(); } }, { threshold: 0.3 }).observe($(".compat"));

/* ---------- Pencari tanggal lahir ---------- */
const sorted = Z.slice().sort((a, b) => a.st - b.st);
function signFromDate(m, day) {
  const v = m * 100 + day;
  let s = sorted[sorted.length - 1];
  for (const z of sorted) if (z.st <= v) s = z;
  return Z.indexOf(s);
}
$("#finder").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("#dob").value; if (!v) return;
  const dt = new Date(v + "T00:00"), i = signFromDate(dt.getMonth() + 1, dt.getDate()), z = Z[i], x = ZX[z.n];
  $("#findOut").innerHTML = `<div class="find-res" style="--ac:${ACC[z.e]}"><div class="g" aria-hidden="true">${GL(z.s)}</div><div>
    <p class="mono" style="color:var(--capella)">${T("Matahari lahirmu berada di")}</p><h3 id="fName">${T(z.n)}</h3>
    <p>${T(KBZ[z.n].dates)} · ${T(z.e)} · ${T(x.mod)} · ${T("dikuasai {p}", { p: T(z.ru) })}. <em>${esc(T(z.q))}.</em></p>
    <div class="zact"><button class="btn" type="button" data-open="${i}">${T("Buka berkas")}</button><a class="lnk mono" href="#z-${slug(z.n)}" data-jump="${i}">${T("Lihat di langit →")}</a></div></div></div>`;
  AX.scramble($("#fName"), T(z.n), 900);
});

/* ---------- Fakta sepele ---------- */
const POOL = [...ZI.sepele.map(t => [T("Umum"), T(t)]), ...Z.flatMap(z => ZX[z.n].sepele.map(t => [T(z.n), T(t)]))];
let tv = Math.floor(Math.random() * POOL.length);
const tvT = $("#tvT"), tvN = $("#tvN");
function showFact(j, now) {
  tv = (j + POOL.length) % POOL.length;
  const [tag, t] = POOL[tv], put = () => { tvT.textContent = t; tvT.classList.remove("swap"); };
  AX.scramble(tvN, `${T("Fakta")} ${pad(tv + 1)} / ${POOL.length} · ${tag}`, 600);
  if (now) return put();
  tvT.classList.add("swap");
  setTimeout(put, 420);
}
showFact(tv, true);
$("#tvPrev").onclick = () => showFact(tv - 1);
$("#tvNext").onclick = () => showFact(tv + 1);
$("#tvRnd").onclick = () => { let j; do j = Math.floor(Math.random() * POOL.length); while (j === tv); showFact(j); };

/* ---------- Tanya-jawab (bot lokal, AI bila /api/ask tersedia). Hanya versi Indonesia. ---------- */
if ($("#askf")) {
const KEY = "astral-qa-v4", CATS = ["Umum", "Cinta", "Karier"];
const CAT_KEYS = {
  Karier: ["karier", "karir", "kerja", "pekerjaan", "profesi", "jabatan", "bisnis", "usaha", "wirausaha", "gaji", "magang"],
  Cinta: ["cinta", "percintaan", "pacar", "pasangan", "jodoh", "kencan", "romantis", "menikah", "nikah", "hubungan", "kecocokan", "cocok"]
};
const catOf = text => { const t = String(text || "").toLowerCase(); for (const c of ["Karier", "Cinta"]) if (CAT_KEYS[c].some(k => t.includes(k))) return c; return "Umum"; };
let filter = "Semua", Q = [];
try { Q = JSON.parse(localStorage.getItem(KEY)) || []; } catch { Q = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(Q)); } catch {} };
function qa() {
  $("#chips").innerHTML = ["Semua", ...CATS].map(c => `<button type="button" class="${c === filter ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
  const all = Q.filter(x => filter === "Semua" || catOf(x.q) === filter).slice().reverse().slice(0, 3);
  $("#qlist").innerHTML = all.length ? all.map(x => `<article class="q-item"><small>${esc(catOf(x.q))}</small><h4>${esc(x.q)}</h4>
    <p class="ans">${esc(x.a).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>
    ${x.s && x.s.length ? `<ul class="src">${x.s.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></li>`).join("")}</ul>` : ""}</article>`).join("")
    : `<p class="muted-note">Belum ada pertanyaan. Coba "kelebihan Pisces" atau "cocok Leo dengan Scorpio".</p>`;
}
$("#chips").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { filter = b.dataset.c; qa(); } });
async function askAI(q) {
  if (!/^https?:$/.test(location.protocol)) return null;
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }), signal: ctl.signal });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.text ? j.text : null;
  } catch { return null; } finally { clearTimeout(to); }
}
let busy = false;
$("#askf").addEventListener("submit", async e => {
  e.preventDefault();
  const t = $("#qt").value.trim(); if (!t || busy) return;
  const btn = $("#askf button");
  busy = true; btn.disabled = true; btn.textContent = "Mencari…";
  const local = window.Bot.answer(t), ai = await askAI(t);
  Q.push({ id: Date.now(), c: catOf(t), q: t, a: ai || local.text, s: ai ? local.sources.filter(s => !/^https?:/.test(s.url)) : local.sources });
  save(); $("#qt").value = ""; filter = "Semua"; qa();
  busy = false; btn.disabled = false; btn.textContent = "Kirim";
});
qa();
}

/* Datang dari artikel lewat #z-nama: langsung ke zodiak itu setelah pemuat */
const hashI = Z.findIndex(z => location.hash === "#z-" + slug(z.n));
if (hashI >= 0) { history.scrollRestoration = "manual"; const wait = setInterval(() => { if (started) { clearInterval(wait); measure(); jump(hashI, true); } }, 100); }
})();
