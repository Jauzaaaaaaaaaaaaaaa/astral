/* Astral FX, dipakai semua halaman: teks acak, huruf terpecah, reveal saat gulir, smooth scroll (Lenis),
   tirai antarhalaman, kursor, jam, dan langit 2D untuk halaman artikel. Beranda memanggil AX.start() setelah pemuat selesai. */
(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const CH = "♈♉♊♋♌♍♎♏♐♑♒♓✦✧+*·ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Teks acak: huruf berganti simbol lalu terkunci dari kiri ke kanan */
  function scramble(el, to, dur = 650) {
    if (!el) return;
    to = to == null ? el.textContent : String(to);
    cancelAnimationFrame(el._scr);
    if (reduce) { el.textContent = to; return; }
    const len = to.length, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      let out = "";
      for (let i = 0; i < len; i++) {
        const c = to[i];
        out += k >= (i / len) * 0.65 + 0.35 || c === " " ? c : CH[(Math.random() * CH.length) | 0];
      }
      el.textContent = out;
      if (k < 1) el._scr = requestAnimationFrame(step);
    };
    el._scr = requestAnimationFrame(step);
  }

  /* Pecah teks menjadi huruf; urutan berlanjut di dalam satu judul agar jeda mengalir */
  const counters = new WeakMap();
  function split(el) {
    if (el._split) return;
    el._split = 1;
    const box = el.closest("h1,h2,h3") || el, text = el.textContent;
    let i = counters.get(box) || 0;
    if (!el.closest("[aria-label]")) el.setAttribute("aria-label", text);
    el.innerHTML = text.split(" ").map(w => `<span class="w" aria-hidden="true">${[...w].map(c => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join("")}</span>`).join(" ");
    counters.set(box, i);
  }

  /* Reveal saat gulir: sekali jalan untuk teks, berulang untuk kartu zodiak */
  let io, ioStep;
  function scan(scope = d) {
    scope.querySelectorAll("[data-split]").forEach(split);
    if (!io) return;
    scope.querySelectorAll("[data-rv]:not(.in),[data-split]:not(.in)").forEach(el => io.observe(el));
    scope.querySelectorAll(".step").forEach(el => ioStep.observe(el));
  }
  function start() {
    if (io) return;
    io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    ioStep = new IntersectionObserver(es => es.forEach(e => {
      const card = e.target;
      card.classList.toggle("in", e.isIntersecting);
      if (e.isIntersecting) card.querySelectorAll("[data-scrin]").forEach(s => scramble(s, s.dataset.t || (s.dataset.t = s.textContent), 900));
    }), { rootMargin: "-22% 0px -22% 0px" });
    scan();
    if (lenis) lenis.start();
  }

  /* Smooth scroll */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (d.body.classList.contains("is-loading")) lenis.stop();
  }
  function scrollToY(y, immediate) {
    if (lenis) lenis.scrollTo(y, { duration: 1.6, immediate: !!immediate, force: true });
    else scrollTo({ top: y, behavior: immediate || reduce ? "auto" : "smooth" });
  }

  d.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    /* tautan jangkar di halaman yang sama */
    if (url.pathname === location.pathname && url.hash) {
      const t = d.querySelector(url.hash);
      if (!t || a.hasAttribute("data-jump")) return;
      e.preventDefault();
      scrollToY(t.getBoundingClientRect().top + scrollY);
      history.replaceState(null, "", url.hash);
      return;
    }
    if (/^(mailto|tel):/.test(a.href)) return;
    /* pindah halaman lewat tirai */
    e.preventDefault();
    try { sessionStorage.setItem("astral-cv", "1"); } catch {}
    curtain && curtain.classList.add("in");
    setTimeout(() => { location.href = a.href; }, reduce ? 0 : 720);
  });

  /* Tirai: kalau datang dari halaman lain, tirai menutupi lalu naik */
  const curtain = d.getElementById("curtain");
  function curtainOut() {
    if (!curtain || !root.classList.contains("cv")) return;
    try { sessionStorage.removeItem("astral-cv"); } catch {}
    requestAnimationFrame(() => {
      root.classList.remove("cv");
      curtain.classList.add("in");
      requestAnimationFrame(() => {
        curtain.classList.add("out");
        setTimeout(() => { curtain.style.transition = "none"; curtain.classList.remove("in", "out"); requestAnimationFrame(() => curtain.style.transition = ""); }, 900);
      });
    });
  }
  addEventListener("pageshow", e => { if (e.persisted && curtain) curtain.classList.remove("in", "out"); });

  /* Teks acak saat disorot */
  d.addEventListener("mouseover", e => {
    const el = e.target.closest("[data-scr]");
    if (!el || el.children.length || el._hov) return;
    el._hov = 1;
    scramble(el, el.dataset.t || (el.dataset.t = el.textContent), 450);
    setTimeout(() => { el._hov = 0; }, 500);
  });

  /* Kursor */
  if (fine && !reduce) {
    const c = d.createElement("div"), r = d.createElement("div");
    c.className = "cur"; r.className = "cur-r";
    d.body.append(c, r);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; c.style.transform = `translate(${x}px,${y}px)`; }, { passive: true });
    d.addEventListener("mouseover", e => r.classList.toggle("hov", !!e.target.closest("a,button,input,[data-open]")));
    (function loop() { rx += (x - rx) * 0.16; ry += (y - ry) * 0.16; r.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  }

  /* Jam di HUD */
  const clock = d.getElementById("clock");
  if (clock) {
    const tick = () => { clock.textContent = new Date().toLocaleTimeString("id-ID", { hour12: false }).replace(/\./g, ":"); };
    tick(); setInterval(tick, 1000);
  }

  /* Langit 2D untuk halaman tanpa WebGL (artikel, halaman informasi) */
  const sky = d.getElementById("sky2d");
  if (sky) {
    const g = sky.getContext("2d");
    let W, H, stars = [];
    const size = () => {
      const p = Math.min(devicePixelRatio || 1, 2);
      W = sky.width = innerWidth * p; H = sky.height = innerHeight * p;
      stars = Array.from({ length: Math.round(innerWidth * innerHeight / 5200) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() ** 3 * 1.6 + 0.3) * p, t: Math.random() * 6.28, c: Math.random() < 0.18 ? "242,215,160" : Math.random() < 0.5 ? "169,200,255" : "232,236,247" }));
    };
    size(); addEventListener("resize", size);
    const draw = t => {
      g.fillStyle = "#060814"; g.fillRect(0, 0, W, H);
      const gr = g.createRadialGradient(W * 0.78, H * 0.18, 0, W * 0.78, H * 0.18, W * 0.6);
      gr.addColorStop(0, "rgba(124,92,255,.16)"); gr.addColorStop(1, "rgba(124,92,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const off = (scrollY * 0.08) % H;
      for (const s of stars) {
        const a = reduce ? 0.7 : 0.45 + 0.55 * Math.abs(Math.sin(t / 1400 + s.t));
        g.fillStyle = `rgba(${s.c},${a})`;
        g.beginPath(); g.arc(s.x, (s.y - off * (s.r) + H) % H, s.r, 0, 6.283); g.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  window.AX = { scramble, split, scan, start, scrollToY, get lenis() { return lenis; }, reduce };
  curtainOut();
  /* Halaman selain beranda langsung mulai */
  if (!d.body.classList.contains("home")) start();
})();
