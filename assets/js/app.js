(() => {
const Z = window.ZODIAC, H = window.HORO, N = Z.length, $ = s => document.querySelector(s);
const AX = window.AX, SH = AX.SH, clamp = AX.clamp, root = document.documentElement;
const ACC = { Api: "#ff6a3d", Tanah: "#a4f06a", Udara: "#5fd8ff", Air: "#a98bff" };
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const seed = str => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const pick = (a, n) => a[(n >>> 0) % a.length];

/* Loader: hanya tampil di kunjungan pertama sesi; selebihnya masuk lewat tirai halaman */
const ld = $("#loader"), pc = $("#pc"), t0 = performance.now();
if (AX.skipIntro) {
  if (ld) ld.remove();
  document.body.classList.remove("loading");
} else {
  let loaded = document.readyState === "complete";
  addEventListener("load", () => loaded = true);
  (function tick() {
    const n = performance.now() - t0, k = Math.min(1, n / 1800);
    pc.textContent = String(Math.round(k * 100)).padStart(3, "0");
    if (k < 1 || (!loaded && n < 6000)) return requestAnimationFrame(tick);
    ld.classList.add("done"); document.body.classList.remove("loading");
    try { sessionStorage.setItem("astral-seen", "1"); } catch {}
    setTimeout(AX.go, 450);
    setTimeout(() => ld.remove(), 1200);
  })();
}

/* ---------- Cerita zodiak: tiap pergantian punya transisi sendiri ----------
   Slide ditumpuk. Slide berikutnya tampil lewat clip-path khas elemennya sementara slide
   sebelumnya keluar dengan gerak yang melengkapi. Semuanya dihitung dari satu posisi scroll. */
const wrap = $("#zwrap"), pin = $("#pin"), track = $("#track"), dots = $("#dots"), cnt = $("#cnt");
wrap.style.setProperty("--n", N);

/* Vektor gerak: x (vw), y (vh), s (skala), r (derajat), k (skewX), b (blur px), o (opasitas awal).
   t/f = teks & gambar saat MASUK; out = gerak slide sebelumnya saat KELUAR; fm = pengali paralaks gambar. */
const V = [
  { shape: "burst" },                                                                                         /* Aries   : ledakan api     */
  { shape: "rise",     t: { y: 22 }, f: { y: 38, s: .9 },                 out: { y: -16, s: .98, o: .4 }, fm: 1.4 },  /* Taurus  : tirai tanah     */
  { shape: "twins",    t: { x: -14 }, f: { x: 14 },                        out: { s: .9, o: .3 },          fm: 1 },    /* Gemini  : dua pita        */
  { shape: "wave",     t: { y: 12, b: 10, o: 0 }, f: { y: 20, r: 18, s: .85, b: 8, o: 0 }, out: { y: -8, b: 8, o: .2 }, fm: 1.3 }, /* Cancer  : pasang naik */
  { shape: "star",     t: { s: .82, o: .2 }, f: { s: .3, r: -50, o: 0 }, out: { s: 1.22, o: 0 },         fm: 1.5 },  /* Leo     : sinar surya     */
  { shape: "blinds",   t: { x: -8 }, f: { x: 10 },                        out: { x: -20, o: .2 },         fm: 1.2 },  /* Virgo   : bilah presisi   */
  { shape: "scales",   t: { y: 6, r: -5 }, f: { r: 16, y: 10, s: .8 },    out: { r: 3, y: 5, o: .2 },     fm: 1 },    /* Libra   : timbangan       */
  { shape: "slash",    t: { x: 16, k: -10 }, f: { x: 26, r: -12 },        out: { x: -10, k: 8, o: .2 },   fm: 1.4 },  /* Scorpio : sabetan         */
  { shape: "arrow",    t: { x: -26, k: 16 }, f: { x: -34, s: .9 },        out: { x: 16, k: -12, o: .2 },  fm: 1.5 },  /* Sagittarius : panah       */
  { shape: "peaks",    t: { y: 26 }, f: { y: 40, s: .88 },                out: { y: -10, s: .96, o: .3 },  fm: 1.2 },  /* Capricorn : puncak gunung */
  { shape: "flow",     t: { x: 18, b: 8 }, f: { x: 28, r: 28, b: 6 },     out: { x: -12, b: 6, o: .2 },    fm: 1.3 },  /* Aquarius : arus           */
  { shape: "dissolve", t: { s: 1.1, b: 16, o: 0 }, f: { r: -30, s: 1.35, b: 12, o: 0 }, out: { s: .94, b: 12, o: 0 }, fm: 1 } /* Pisces  : larut           */
];
/* Gerak huruf & baris teks mengikuti sifat elemen */
const LET = {
  Api:   l => `translate3d(0,${(1 - l) * 110}%,0) rotate(${(1 - l) * 9}deg)`,
  Tanah: l => `translate3d(0,${-(1 - l) * 110}%,0)`,
  Udara: l => `translate3d(${-(1 - l) * 70}%,0,0) skewX(${-(1 - l) * 14}deg)`,
  Air:   (l, j) => `translate3d(0,${((1 - l) * 60 + Math.sin(j * 1.3 + (1 - l) * 5) * (1 - l) * 30).toFixed(1)}%,0) scale(${(.6 + .4 * l).toFixed(3)})`
};
const KID = {
  Api:   l => `translate3d(0,${(1 - l) * 40}px,0)`,
  Tanah: l => `translate3d(0,${(1 - l) * 70}px,0)`,
  Udara: l => `translate3d(${-(1 - l) * 50}px,0,0)`,
  Air:   l => `translate3d(0,${(1 - l) * 30}px,0) scale(${(.94 + .06 * l).toFixed(3)})`
};
const pf = x => AX.E.io3(clamp((x - .1) / .8));   /* jeda singkat di tiap slide supaya terbaca */

function figure(z) {
  const p = z.shape.pts;
  const ln = z.shape.ln.map(([a, b]) => `<path class="ln" pathLength="1" d="M${p[a][0]} ${p[a][1]}L${p[b][0]} ${p[b][1]}"/>`).join("");
  const st = p.map(q => `<circle class="st" cx="${q[0]}" cy="${q[1]}" r="${p.length > 12 ? 4.2 : 5.5}"/>`).join("");
  return `<svg viewBox="0 0 400 400" aria-hidden="true">${ln}${st}</svg>`;
}
const letters = n => [...n].map((c, i, a) => `<span class="ch" style="background-size:${a.length * 100}% 100%;background-position:${a.length > 1 ? (i / (a.length - 1) * 100).toFixed(1) : 0}% 0">${c}</span>`).join("");
function slide(z, i) {
  const k = seed(z.n + new Date().toDateString());
  return `<article class="slide" data-e="${z.e}" style="--ac:${ACC[z.e]};--len:${z.n.length};z-index:${i}" aria-label="${z.n}">
    <div class="bg" aria-hidden="true"></div>
    <div class="sky" aria-hidden="true"></div>
    <div class="ghost" aria-hidden="true">${z.s}\uFE0E</div>
    <div class="txt">
      <p class="idx">${String(i + 1).padStart(2, "0")} / ${N} &nbsp;·&nbsp; ${z.r}</p>
      <h2 class="zn" aria-label="${z.n}">${letters(z.n)}</h2>
      <p class="q">${esc(z.q)}</p>
      <p class="desc">${esc(z.d)}</p>
      <a class="more" href="zodiak/${z.n.toLowerCase()}.html">Artikel lengkap →</a>
      <ul class="traits">${z.t.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <dl class="meta">
        <div><dt>Elemen</dt><dd>${z.e}</dd></div>
        <div><dt>Planet</dt><dd>${z.ru}</dd></div>
        <div><dt>Cocok</dt><dd>${z.c.join(" · ")}</dd></div>
      </dl>
      <div class="today">
        <p><b>Cinta</b> ${pick(H.love, k)}</p>
        <p><b>Karier</b> ${pick(H.work, k >>> 3)}</p>
        <p><b>Keberuntungan</b> ${pick(H.luck, k >>> 5)}</p>
      </div>
    </div>
    <div class="fig"><div class="ring"></div>${figure(z)}</div>
    <div class="shade" aria-hidden="true"></div>
  </article>`;
}
track.innerHTML = Z.map(slide).join("");
dots.innerHTML = Z.map(z => `<button aria-label="${z.n}"></button>`).join("");
const dotEls = [...dots.children];
const S = [...track.children].map((el, i) => {
  const txt = el.querySelector(".txt"), e = Z[i].e;
  const lns = [...el.querySelectorAll(".ln")], sts = [...el.querySelectorAll(".st")];
  return { el, e, txt, fig: el.querySelector(".fig"), bg: el.querySelector(".bg"), ghost: el.querySelector(".ghost"), shade: el.querySelector(".shade"),
    chs: [...el.querySelectorAll(".ch")], kids: [...txt.children].filter(c => !c.classList.contains("zn")), lns, sts,
    ls: .4 / Math.max(1, lns.length - 1), ss: .55 / Math.max(1, sts.length - 1) };
});
const range = () => wrap.offsetHeight - pin.offsetHeight;
const goTo = i => scrollTo({ top: wrap.offsetTop + (i / (N - 1)) * range(), behavior: "smooth" });
dots.onclick = e => { const b = e.target.closest("button"); if (b) goTo(dotEls.indexOf(b)); };

function put(el, v, k) {
  if (!v) { el.style.transform = ""; el.style.opacity = ""; el.style.filter = ""; return; }
  const s = 1 + ((v.s == null ? 1 : v.s) - 1) * k, b = (v.b || 0) * k;
  el.style.transform = `translate3d(${((v.x || 0) * k).toFixed(2)}vw,${((v.y || 0) * k).toFixed(2)}vh,0) rotate(${((v.r || 0) * k).toFixed(2)}deg) skewX(${((v.k || 0) * k).toFixed(2)}deg) scale(${s.toFixed(3)})`;
  el.style.opacity = v.o == null ? "" : (1 - (1 - v.o) * k).toFixed(3);
  el.style.filter = b > .2 ? `blur(${b.toFixed(1)}px)` : "";
}
const par = (v, m) => v && { x: (v.x || 0) * m, y: (v.y || 0) * m, s: v.s, r: v.r, k: v.k, b: v.b, o: v.o };

/* Teks, huruf, dan rasi: muncul bertahap menurut kemajuan g (0..1) */
function reveal(s, g) {
  const n = s.chs.length, L = LET[s.e], K = KID[s.e], fade = s.e === "Udara" || s.e === "Air";
  s.chs.forEach((c, j) => {
    const l = clamp((g - .25 - (j / n) * .4) / .35);
    c.style.transform = l >= 1 ? "" : L(l, j);
    c.style.opacity = fade ? l.toFixed(3) : "";
  });
  s.kids.forEach((c, j) => {
    const l = clamp((g - .3 - j * .06) / .32);
    c.style.transform = l >= 1 ? "" : K(l);
    c.style.opacity = l >= 1 ? "" : l.toFixed(3);
  });
  s.lns.forEach((p, j) => p.style.strokeDashoffset = (1 - clamp((g - .35 - j * s.ls) / .25)).toFixed(3));
  s.sts.forEach((c, j) => { const l = clamp((g - .2 - j * s.ss) / .25); c.style.opacity = l.toFixed(3); c.style.transform = `scale(${l.toFixed(3)})`; });
}

const reduce = AX.reduce;
let t = 0, p = 0, cur = -1, lastMask = "";
function onScroll() { t = Math.min(N - 1, Math.max(0, (scrollY - wrap.offsetTop) / range() * (N - 1))); }
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
(function frame() {
  try {
    p = reduce ? t : p + (t - p) * .12;
    if (Math.abs(t - p) < .0005) p = t;
    const r0 = wrap.getBoundingClientRect(), vh = innerHeight;
    const enter = clamp(1 - r0.top / vh), exit = clamp(1 - r0.bottom / vh);
    /* tepi atas & bawah panel memudar ke warna latar supaya tidak ada potongan warna yang tiba-tiba */
    const fT = enter < 1 ? 30 * clamp((1 - enter) * 10) : 0, fB = exit > 0 ? 34 * clamp(exit * 10) : 0;
    const mk = fT || fB ? `linear-gradient(to bottom,transparent 0,#000 ${fT.toFixed(1)}vh,#000 calc(100% - ${fB.toFixed(1)}vh),transparent 100%)` : "";
    if (mk !== lastMask) { lastMask = mk; pin.style.webkitMaskImage = mk; pin.style.maskImage = mk; }
    for (let i = 0; i < N; i++) {
      const s = S[i], d = i - p, ad = Math.abs(d);
      let fi = 1, fo = 0;
      if (i === 0) fi = AX.E.out3(enter);
      else if (d > 0) fi = pf(1 - d);
      else fo = pf(-d);
      const incoming = i === 0 ? enter < 1 : d > 0;
      const show = (i === 0 ? enter > .002 : ad < 1) && !(incoming && fi <= .002);
      s.el.style.visibility = show ? "visible" : "hidden";
      if (!show) continue;

      /* bentuk transisi masuk */
      const shape = V[i].shape;
      s.el.style.clipPath = incoming && fi < .999 ? SH[shape](fi) : "none";
      s.el.style.opacity = shape === "dissolve" && incoming ? fi.toFixed(3) : "";

      /* gerak isi */
      if (i === 0) { put(s.txt, { y: 9, s: 1 }, 1 - fi); put(s.fig, { y: 14, s: 1.25 }, 1 - fi); }
      else if (d > 0) { put(s.txt, V[i].t, 1 - fi); put(s.fig, V[i].f, 1 - fi); }
      else if (i + 1 < N && fo > 0) { put(s.txt, V[i + 1].out, fo); put(s.fig, par(V[i + 1].out, V[i + 1].fm), fo); }
      else if (i === N - 1 && exit > 0) { put(s.txt, { y: -7, o: .15 }, exit); put(s.fig, { y: -11, s: .92, o: .1 }, exit); }
      else { put(s.txt, null); put(s.fig, null); }

      /* latar & simbol raksasa bergerak dengan kecepatan berbeda (paralaks berlapis) */
      s.bg.style.transform = `translate3d(${(-d * 7).toFixed(2)}vw,0,0)`;
      s.ghost.style.transform = `translate3d(${(-d * 24).toFixed(2)}vw,-50%,0) rotate(${(d * 10).toFixed(2)}deg)`;
      s.shade.style.opacity = d < 0 ? (fo * .7).toFixed(3) : "0";

      reveal(s, i === 0 ? fi : (d > 0 ? fi : 1));
    }
    const r = Math.round(p);
    if (r !== cur) {
      cur = r;
      S.forEach((s, i) => s.el.classList.toggle("on", i === r));
      dotEls.forEach((dt, i) => dt.classList.toggle("on", i === r));
      cnt.textContent = String(r + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");
    }
  } catch (err) {
    console.error("Astral frame error:", err);
  }
  requestAnimationFrame(frame);
})();
onScroll();

/* Finder */
const sorted = [...Z].sort((a, b) => a.st - b.st);
function signFromDate(m, d) {
  const v = m * 100 + d;
  let s = sorted[sorted.length - 1];
  for (const z of sorted) if (z.st <= v) s = z;
  return Z.indexOf(s);
}
$("#finder").onsubmit = e => {
  e.preventDefault();
  const q = $("#q").value.trim().toLowerCase(), dt = $("#dob").value, msg = $("#msg");
  let i = -1;
  if (dt) { const d = new Date(dt + "T00:00"); i = signFromDate(d.getMonth() + 1, d.getDate()); }
  else if (q) i = Z.findIndex(z => z.n.toLowerCase().includes(q));
  if (i < 0) { msg.textContent = "Zodiak tidak ditemukan. Coba nama lain atau isi tanggal lahir."; return; }
  msg.textContent = "Menuju " + Z[i].n + "…";
  goTo(i);
};

/* Q&A: jawaban dari basis pengetahuan lokal (tanpa AI, tanpa server) */
const KEY = "astral-qa-v4", CATS = ["Umum", "Cinta", "Karier"];
/* Kategori ditentukan otomatis dari kata dalam pertanyaan. Karier dicek dulu, lalu Cinta (termasuk kecocokan). */
const CAT_KEYS = {
  Karier: ["karier", "karir", "kerja", "pekerjaan", "profesi", "jabatan", "bisnis", "usaha", "wirausaha", "gaji", "magang"],
  Cinta: ["cinta", "percintaan", "pacar", "pasangan", "jodoh", "kencan", "romantis", "menikah", "nikah", "hubungan", "kecocokan", "cocok"]
};
const catOf = text => {
  const t = String(text || "").toLowerCase();
  for (const c of ["Karier", "Cinta"]) if (CAT_KEYS[c].some(k => t.includes(k))) return c;
  return "Umum";
};
let filter = "Semua";
let Q = []; try { Q = JSON.parse(localStorage.getItem(KEY)) || []; } catch { Q = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(Q)); } catch {} };
const qitem = (x, fxd) => `<article class="q-item"${fxd ? ' data-fxd="1"' : ""}>
      <div>
        <small>${esc(catOf(x.q))}</small>
        <h4>${esc(x.q)}</h4>
        <p class="ans">${esc(x.a).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>
        ${x.s && x.s.length ? `<ul class="src">${x.s.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></li>`).join("")}</ul>` : ""}
      </div>
    </article>`;
const MAXQ = 2;
function qa(bury) {
  $("#chips").innerHTML = ["Semua", ...CATS].map(c => `<button class="${c === filter ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
  const all = Q.filter(x => filter === "Semua" || catOf(x.q) === filter).slice().reverse();
  const box = $("#qlist");
  if (!all.length) box.innerHTML = `<p class="muted-note">Belum ada pertanyaan. Coba tanyakan "kelebihan Pisces" atau "cocok Leo dengan Scorpio".</p>`;
  else {
    /* hanya MAXQ jawaban terbaru yang tampil; jawaban yang terdorong keluar tenggelam di bawah pembatas */
    const shown = all.slice(0, MAXQ), out = bury ? all[MAXQ] : null;
    box.innerHTML = shown.map((x, i) => qitem(x, bury && i > 0)).join("") + `<div class="q-div" aria-hidden="true"></div>` + (out ? `<div class="q-bury">${qitem(out, true)}</div>` : "");
    const bu = box.querySelector(".q-bury");
    if (bu) { bu.addEventListener("animationend", () => bu.remove()); setTimeout(() => bu.remove(), 3500); }
  }
  document.querySelectorAll("#chips button").forEach(b => b.onclick = () => { filter = b.dataset.c; qa(); });
  if (window.AX) AX.scan();
}
/* Coba AI lewat /api/ask (butuh deploy + GEMINI_API_KEY). Jika tidak tersedia, pakai bot lokal. */
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
$("#askf").onsubmit = async e => {
  e.preventDefault();
  const t = $("#qt").value.trim(); if (!t || busy) return;
  const btn = $("#askf button");
  busy = true; btn.disabled = true; btn.textContent = "Mencari…";
  const local = window.Bot.answer(t);
  const ai = await askAI(t);
  const src = local.sources.filter(s => !/^https?:/.test(s.url));
  Q.push({ id: Date.now(), c: catOf(t), q: t, a: ai || local.text, s: ai ? src : local.sources });
  save(); $("#qt").value = ""; qa(true);
  busy = false; btn.disabled = false; btn.textContent = "Kirim";
};
qa();
})();
