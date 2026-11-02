/* Astral FX v24 — gerak scroll, transisi halaman, kursor.
   Tanpa library. Semua efek dihitung dari posisi scroll, jadi bisa berjalan mundur dengan halus. */
(() => {
const d = document, root = d.documentElement;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const n2 = v => (+v).toFixed(2);
const E = {
  io3: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  out3: t => 1 - Math.pow(1 - t, 3)
};
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let VW = innerWidth, VH = innerHeight;
addEventListener("resize", () => { VW = innerWidth; VH = innerHeight; });

/* ---------- Pustaka bentuk transisi (clip-path) ----------
   Setiap fungsi menerima f (0 = tersembunyi, 1 = penuh) dan mengembalikan nilai clip-path. */
const SH = {
  /* Api: ledakan lingkaran */
  burst: (f, o = {}) => `circle(${n2(f * 150)}% at ${n2(o.x ?? 72)}% ${n2(o.y ?? 50)}%)`,
  /* Tanah: tirai naik dari bawah */
  rise: f => `inset(${n2((1 - f) * 100)}% 0 0 0)`,
  /* Gemini: dua pita menutup dari kedua sisi */
  twins: f => { const a = f * 50; return `polygon(0 0,${n2(a)}% 0,${n2(a)}% 99.9%,${n2(100 - a)}% 99.9%,${n2(100 - a)}% 0,100% 0,100% 100%,0 100%)`; },
  /* Air: gelombang pasang naik */
  wave: f => {
    const amp = 6, base = (100 + amp) - f * (100 + 2 * amp), ph = f * 9; let s = "";
    for (let x = 0; x <= 100; x += 5) s += `${x}% ${n2(base + amp * Math.sin(x * .085 + ph))}%,`;
    return `polygon(${s}100% 100%,0 100%)`;
  },
  /* Leo: bintang sinar matahari */
  star: f => {
    const ax = VH / VW, R = f * 210, r0 = R * (.45 + .35 * f), rot = (1 - f) * .9; let s = "";
    for (let k = 0; k < 24; k++) {
      const a = rot + k * Math.PI / 12, rr = k % 2 ? r0 : R;
      s += `${n2(50 + Math.cos(a) * rr * ax)}% ${n2(50 + Math.sin(a) * rr)}%,`;
    }
    return `polygon(${s.slice(0, -1)})`;
  },
  /* Virgo: bilah presisi bertingkat */
  blinds: f => {
    const n = 8, s = .9; let p = "0 0,";
    for (let j = 0; j < n; j++) {
      const w = clamp(f * (1 + s) - s * j / (n - 1)) * 100;
      p += `${n2(w)}% ${n2(j * 100 / n)}%,${n2(w)}% ${n2((j + 1) * 100 / n)}%,`;
    }
    return `polygon(${p}0 100%)`;
  },
  /* Libra: dua lengan timbangan, atas dari kiri, bawah dari kanan */
  scales: f => { const X = f * 100; return `polygon(0 0,${n2(X)}% 0,${n2(X)}% 50%,100% 50%,100% 100%,${n2(100 - X)}% 100%,${n2(100 - X)}% 50%,0 50%)`; },
  /* Scorpio: sabetan miring */
  slash: f => { const T = 60, xt = 100 - f * (100 + T); return `polygon(${n2(xt)}% 0,100% 0,100% 100%,${n2(xt + T)}% 100%)`; },
  /* Sagittarius: ujung panah melesat */
  arrow: f => { const a = 24, x = -a + f * (100 + a); return `polygon(0 0,${n2(x)}% 0,${n2(x + a)}% 50%,${n2(x)}% 100%,0 100%)`; },
  /* Capricorn: deretan puncak gunung naik */
  peaks: f => {
    const H = [0, 1, .35, .85, .2, 1, .45, .9, .25, .7, 0], amp = 22, base = (100 + amp) - f * (100 + 2 * amp); let s = "";
    H.forEach((h, i) => s += `${i * 10}% ${n2(base - h * amp)}%,`);
    return `polygon(${s}100% 100%,0 100%)`;
  },
  /* Aquarius: arus yang menyapu dari kanan */
  flow: f => {
    const amp = 7, base = (100 + amp) - f * (100 + 2 * amp), ph = f * 10; let s = "";
    for (let y = 0; y <= 100; y += 5) s += `${n2(base + amp * Math.sin(y * .11 + ph))}% ${y}%,`;
    return `polygon(${s}100% 100%,100% 0)`;
  },
  /* Pisces: larut (tanpa clip, diatur lewat opacity & blur di app.js) */
  dissolve: () => "none"
};
const CURTAIN_SHAPES = ["rise", "twins", "wave", "blinds", "scales", "slash", "arrow", "peaks", "flow", "star", "burst"];
const SHAPE_BY_EL = { Api: "burst", Tanah: "rise", Udara: "twins", Air: "wave" };

/* ---------- Transisi bagian bawah: tiap bagian masuk dengan bentuknya sendiri, mengikuti scroll ---------- */
const SEC = [];
const SECMAP = { ".signs": "star", ".finder": "scales", ".qa": "arrow", "footer.foot": "rise" };
function secFrame() {
  const atEnd = scrollY + VH >= d.documentElement.scrollHeight - 4;
  for (let i = 0; i < SEC.length; i++) {
    const s = SEC[i];
    const r = s.el.getBoundingClientRect();
    const f = reduce || atEnd ? 1 : clamp((VH - r.top) / (VH * .6));
    const v = f >= .999 ? "" : SH[s.shape](E.io3(f));
    if (v !== s.last) { s.last = v; s.el.style.clipPath = v; }
  }
}

/* ---------- Pembuka: tirai antarhalaman ---------- */
const curtain = d.getElementById("curtain");
let nav = null;
if (root.classList.contains("cv")) {
  try { nav = JSON.parse(sessionStorage.getItem("astral-nav")); sessionStorage.removeItem("astral-nav"); } catch (e) {}
}
let seen = false; try { seen = !!sessionStorage.getItem("astral-seen"); } catch (e) {}
const loaderPending = !!d.getElementById("loader") && !root.classList.contains("cv") && !seen;

function clearCurtain() {
  root.classList.remove("cv");
  if (curtain) { curtain.style.visibility = ""; curtain.style.clipPath = ""; }
}
function reveal(done) {
  if (!nav || !curtain || reduce) { clearCurtain(); return done(); }
  const sh = SH[nav.s] ? nav.s : "rise", t0 = performance.now(), D = 950;
  (function step(now) {
    const k = clamp((now - t0) / D);
    curtain.style.clipPath = SH[sh](1 - E.io3(k), { x: nav.x, y: nav.y });
    if (k < 1) requestAnimationFrame(step); else { clearCurtain(); done(); }
  })(t0);
}
function cover(url, shape, color, ox, oy) {
  if (!curtain || reduce) { location.href = url; return; }
  curtain.style.setProperty("--cv", color);
  curtain.style.visibility = "visible";
  const t0 = performance.now(), D = 820;
  (function step(now) {
    const k = clamp((now - t0) / D);
    curtain.style.clipPath = SH[shape](E.io3(k), { x: ox, y: oy });
    if (k < 1) requestAnimationFrame(step);
    else {
      try { sessionStorage.setItem("astral-nav", JSON.stringify({ s: shape, c: color, x: ox, y: oy })); } catch (e) {}
      location.href = url;
    }
  })(t0);
}
d.addEventListener("click", e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest("a[href]");
  if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
  let u; try { u = new URL(a.href, location.href); } catch (err) { return; }
  if (u.protocol !== location.protocol || (u.protocol !== "file:" && u.host !== location.host)) return;
  if (u.pathname === location.pathname && u.search === location.search) return; /* hanya anchor di halaman yang sama */
  e.preventDefault();
  const h = a.closest("[data-el],[data-e]");
  const el = h && (h.dataset.el || h.dataset.e);
  let shape = SHAPE_BY_EL[el], color = "";
  if (h) color = getComputedStyle(h).getPropertyValue("--ac").trim();
  if (!shape) shape = CURTAIN_SHAPES[[...u.pathname].reduce((s, c) => s + c.charCodeAt(0), 0) % CURTAIN_SHAPES.length];
  if (!color) color = (getComputedStyle(d.body).getPropertyValue("--ac") || "#e2c98f").trim() || "#e2c98f";
  cover(u.href, shape, color, clamp(e.clientX / VW * 100, 0, 100), clamp(e.clientY / VH * 100, 0, 100));
});
addEventListener("pageshow", e => { if (e.persisted) clearCurtain(); });

/* ---------- Reveal saat scroll (variasi berbeda per blok) ---------- */
let started = false;
const pending = new Set();
function show(el) {
  if (io) io.unobserve(el);
  pending.delete(el); watch.delete(el); el.classList.add("in");
  const dl = parseFloat(el.style.getPropertyValue("--d")) || 0;
  setTimeout(() => { if (el.dataset.fx !== "mask") { el.removeAttribute("data-fx"); el.dataset.fxd = "1"; } }, (dl + 1.8) * 1000);
}
/* Elemen yang awalnya terpotong penuh (clip-path) tidak terdeteksi IntersectionObserver di Chrome,
   jadi kartu dipantau lewat posisi langsung. */
const watch = new Set();
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) show(en.target); }), { threshold: .1, rootMargin: "0px 0px -6% 0px" }) : null;
const CLIPPED = ["card", "wipe-l", "wipe-d", "iris"];
function arm(el) { watch.add(el); }

function tag(el, fx, delay) {
  if (!el || el.dataset.fx || el.dataset.fxd) return;
  el.dataset.fx = fx;
  if (delay) el.style.setProperty("--d", n2(delay) + "s");
  if (reduce || !io) { el.classList.add("in"); return; }
  if (started) arm(el); else pending.add(el);
}
function split(el) {
  if (!el || el.dataset.split) return;
  el.dataset.split = "1";
  el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
  let i = 0;
  (function walk(node) {
    [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = d.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(d.createTextNode(" ")); return; }
          const w = d.createElement("span"), wi = d.createElement("span");
          w.className = "w"; wi.className = "wi"; wi.setAttribute("aria-hidden", "true");
          wi.style.setProperty("--i", i++); wi.textContent = t; w.appendChild(wi); frag.appendChild(w);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
    });
  })(el);
}
const BLK = ["rise", "wipe-l", "blur", "slide-r", "wipe-d", "iris"];
function hold(el, fx, delay) { if (!el) return; el.setAttribute("data-hold", ""); tag(el, fx, delay); }

function scan() {
  Object.entries(SECMAP).forEach(([sel, shape]) => d.querySelectorAll(sel).forEach(el => { if (!SEC.some(x => x.el === el)) SEC.push({ el, shape, last: "" }); }));
  /* beranda */
  d.querySelectorAll("[data-fx=mask]").forEach(split);
  d.querySelectorAll(".signs>h2,.finder h2,.qa h2").forEach(h => { split(h); tag(h, "mask"); });
  tag(d.querySelector(".signs .sub"), "rise", .12);
  const grid = d.querySelector(".sgrid");
  const cols = grid ? Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").length) : 4;
  /* tiap baris terbawa angin berurutan dari kiri; kotak selanjutnya menyusul sampai semua terisi */
  d.querySelectorAll(".sgrid .scard").forEach((c, i) => tag(c, "gust", Math.floor(i / cols) * .32 + (i % cols) * .07));
  tag(d.querySelector(".finder form"), "wipe-l", .15);
  tag(d.getElementById("askf"), "wipe-l", .1);
  tag(d.getElementById("chips"), "rise", .15);
  d.querySelectorAll(".q-item").forEach((q, i) => tag(q, "rise", Math.min(i * .05, .3)));
  d.querySelectorAll(".foot-top>div").forEach((c, i) => tag(c, ["rise", "slide-r", "blur"][i % 3], i * .12));
  tag(d.querySelector(".foot-bot"), "rise", .1);
  d.querySelectorAll(".signs,.finder,.qa").forEach(s => { s.classList.add("fx-line"); if (!s.dataset.ln) { s.dataset.ln = 1; if (io && !reduce) (started ? arm(s) : pending.add(s)); else s.classList.add("in"); } });

  /* artikel & halaman informasi */
  const main = d.querySelector("main.article");
  const cont = main && (main.querySelector(":scope > article") || main);
  if (!cont || main.dataset.fxscan) return;
  main.dataset.fxscan = "1";
  const crumbs = main.querySelector(".crumbs"); hold(crumbs, "rise", 0);
  const top = main.querySelector(".art-top");
  if (top) {
    hold(top.querySelector(".idx"), "rise", .15);
    hold(top.querySelector(".lead"), "rise", .55);
  }
  d.querySelectorAll(".art-fig .ln").forEach((p, i) => p.style.transitionDelay = n2(.5 + i * .14) + "s");
  d.querySelectorAll(".art-fig .st").forEach((c, i) => c.style.transitionDelay = n2(.3 + i * .12) + "s");
  let b = -1, k = 0;
  [...cont.children].forEach(el => {
    if (el.matches(".art-glow,.crumbs,.art-top")) return;
    if (el.tagName === "H1") { split(el); hold(el, "mask", .1); return; }
    if (el.tagName === "H2") { b++; k = 0; split(el); tag(el, "mask"); return; }
    if (el.tagName === "H3") { b++; k = 0; tag(el, ["slide-r", "rise", "blur"][b % 3], 0); return; }
    const v = BLK[Math.max(b, 0) % BLK.length], dl = Math.min(k++ * .07, .35);
    if (el.matches("ul,ol")) el.querySelectorAll(":scope>li").forEach((li, j) => tag(li, v === "wipe-l" || v === "iris" ? "rise" : v, Math.min(j * .06, .4)));
    else if (el.classList.contains("faq")) [...el.children].forEach((c, j) => { if (c.tagName === "H2") { split(c); tag(c, "mask"); } else tag(c, j % 2 ? "rise" : "slide-r", Math.min(j * .03, .25)); });
    else if (el.matches(".meta2")) el.querySelectorAll(":scope>div").forEach((c, j) => tag(c, "rise", j * .08));
    else if (el.matches(".pill-row")) el.querySelectorAll("a").forEach((c, j) => tag(c, "rise", j * .05));
    else tag(el, v, dl);
  });
}

/* ---------- Mulai ---------- */
function go() {
  if (started) return; started = true;
  root.classList.add("go");
  d.querySelectorAll("[data-hold]").forEach(el => el.classList.add("in"));
  d.querySelectorAll(".art-fig").forEach(el => el.classList.add("in"));
  pending.forEach(el => { if (io && !el.hasAttribute("data-hold")) arm(el); });
  pending.clear();
}

/* ---------- Bilah progres ---------- */
const prog = d.createElement("div"); prog.id = "prog"; prog.setAttribute("aria-hidden", "true"); d.body.appendChild(prog);

/* ---------- Langit berbintang: latar di semua halaman. Bintang berkedip, bergeser pelan mengikuti scroll
   (makin dekat makin cepat), dan sesekali ada bintang jatuh. ---------- */
const sky = d.createElement("canvas"); sky.id = "sky"; sky.setAttribute("aria-hidden", "true"); d.body.prepend(sky);
const sctx = sky.getContext("2d");
const SKY_COL = ["246,243,234", "226,201,143", "159,214,255"];
let stars = [], sw = 0, sh = 0, shoot = null, nextShoot = 4000;
function skyResize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  sw = innerWidth; sh = innerHeight;
  sky.width = Math.round(sw * dpr); sky.height = Math.round(sh * dpr);
  sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.round(Math.min(340, Math.max(120, sw * sh / 3800)));
  stars = Array.from({ length: n }, () => {
    const z = Math.random(), r = Math.random();
    return { x: Math.random() * sw, y: Math.random() * sh, z, r: .5 + z * 1.4, a: .42 + z * .58,
      sp: .5 + Math.random() * 1.8, ph: Math.random() * 6.283, c: r < .68 ? SKY_COL[0] : r < .88 ? SKY_COL[1] : SKY_COL[2] };
  });
}
function skyDraw(t) {
  sctx.clearRect(0, 0, sw, sh);
  const sy = scrollY;
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const tw = reduce ? 1 : .55 + .45 * Math.sin(t * .0012 * s.sp + s.ph);
    let y = (s.y - sy * (.03 + .12 * s.z)) % sh; if (y < 0) y += sh;
    sctx.fillStyle = `rgba(${s.c},${(s.a * tw).toFixed(3)})`;
    sctx.beginPath(); sctx.arc(s.x, y, s.r, 0, 6.283); sctx.fill();
  }
  if (!reduce) {
    if (!shoot && t > nextShoot) {
      shoot = { x: Math.random() * sw * .7, y: Math.random() * sh * .35, vx: 10 + Math.random() * 5, vy: 4.5 + Math.random() * 3, life: 0 };
      nextShoot = t + 9000 + Math.random() * 13000;
    }
    if (shoot) {
      const h = shoot, tx = h.x - h.vx * 11, ty = h.y - h.vy * 11;
      h.x += h.vx; h.y += h.vy; h.life++;
      const g = sctx.createLinearGradient(h.x, h.y, tx, ty);
      g.addColorStop(0, "rgba(246,243,234,.95)"); g.addColorStop(1, "rgba(246,243,234,0)");
      sctx.strokeStyle = g; sctx.lineWidth = 1.3;
      sctx.beginPath(); sctx.moveTo(h.x, h.y); sctx.lineTo(tx, ty); sctx.stroke();
      if (h.life > 60 || h.x > sw + 40) shoot = null;
    }
  }
}
(function skyLoop(t) { skyDraw(t); if (!reduce) requestAnimationFrame(skyLoop); })(0);
addEventListener("resize", skyResize); skyResize();

/* ---------- Kursor cincin (hanya mouse) ---------- */
let cur = null, mx = -100, my = -100, cx = -100, cy = -100;
if (matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
  cur = d.createElement("div"); cur.className = "cur"; cur.setAttribute("aria-hidden", "true"); d.body.appendChild(cur);
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; cur.classList.add("on"); });
  d.addEventListener("pointerover", e => cur.classList.toggle("hv", !!(e.target.closest && e.target.closest("a,button,input,select,textarea"))));
  d.addEventListener("mouseleave", () => cur.classList.remove("on"));
}

/* ---------- Hero & marquee (beranda) ---------- */
const hero = d.querySelector(".hero"), heroIn = d.querySelector(".hero-in"), cue = d.querySelector(".cue");
let marq = null, mw = 0, mx0 = 0;
if (hero) {
  const items = [["♈", "Aries"], ["♉", "Taurus"], ["♊", "Gemini"], ["♋", "Cancer"], ["♌", "Leo"], ["♍", "Virgo"], ["♎", "Libra"], ["♏", "Scorpio"], ["♐", "Sagittarius"], ["♑", "Capricorn"], ["♒", "Aquarius"], ["♓", "Pisces"]];
  const row = items.map(([s, n]) => `<span>${s}\uFE0E ${n}</span>`).join("");
  const wrap = d.createElement("div"); wrap.className = "marq"; wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML = `<div class="marq-in">${row}${row}</div>`;
  hero.appendChild(wrap); marq = wrap.firstChild;
  const measure = () => { mw = marq.scrollWidth / 2; };
  measure(); addEventListener("resize", measure); if (d.fonts && d.fonts.ready) d.fonts.ready.then(measure);
}

/* ---------- Loop utama ---------- */
const arGlow = d.querySelector(".art-glow"), arFig = d.querySelector(".art-fig");
let sy = scrollY, last = scrollY, vel = 0;
(function loop() {
  try {
    if (watch.size) {
      const lim = scrollY + VH >= d.documentElement.scrollHeight - 4 ? Infinity : VH * .97;
      watch.forEach(el => { if (el.getBoundingClientRect().top < lim) show(el); });
    }
    secFrame();
    const y = scrollY; vel = lerp(vel, y - last, .12); last = y;
    sy = reduce ? y : lerp(sy, y, .1);
    const max = d.documentElement.scrollHeight - VH;
    prog.style.transform = `scaleX(${max > 0 ? clamp(y / max).toFixed(4) : 0})`;
    if (hero) {
      const h = clamp(sy / VH);
      if (h < 1.05) {
        heroIn.style.transform = `translate3d(0,${n2(-h * 16)}vh,0) scale(${n2(1 - h * .1)})`;
        heroIn.style.opacity = n2(1 - h * 1.15);
        heroIn.style.filter = h > .05 ? `blur(${n2(h * 10)}px)` : "";
        if (cue) cue.style.opacity = n2(1 - h * 3);
      }
      if (marq && mw) {
        mx0 -= .7 + Math.abs(vel) * .35 * (vel < 0 ? -1 : 1);
        if (mx0 <= -mw) mx0 += mw; if (mx0 > 0) mx0 -= mw;
        marq.style.transform = `translate3d(${mx0.toFixed(1)}px,0,0)`;
      }
    }
    if (arGlow) arGlow.style.translate = `0 ${n2(sy * .22)}px`;
    if (arFig) { arFig.style.translate = `0 ${n2(-sy * .05)}px`; arFig.style.rotate = `${n2(sy * .02)}deg`; }
    if (cur) {
      cx = lerp(cx, mx, .18); cy = lerp(cy, my, .18);
      cur.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    }
  } catch (err) { console.error("Astral fx error:", err); }
  requestAnimationFrame(loop);
})();

window.AX = { SH, E, clamp, lerp, n2, scan, go, reduce, skipIntro: !loaderPending, vel: () => vel };
scan();
reveal(() => { if (!loaderPending) go(); });
setTimeout(() => { clearCurtain(); go(); }, 8000); /* pengaman */
})();
