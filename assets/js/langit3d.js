/* Langit 3D Astral (Three.js). Satu awan partikel yang berubah bentuk mengikuti window.SKY.s dari app.js:
   -2 debu awal → -1 roda zodiak → 0..11 rasi tiap zodiak (+ glyph samar) → 12 galaksi spiral.
   Setiap perpindahan memakai dua set atribut (asal, tujuan) dan uMix; partikel berputar seperti pusaran di tengah jalan. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";

const SKY = window.SKY || (window.SKY = { s: -1, side: 0, ac: "#f2d7a0" });
const Z = window.ZODIAC, cv = document.getElementById("gl");
const ready = () => dispatchEvent(new Event("sky-ready"));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

let R;
try {
  R = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: "high-performance" });
} catch (e) {
  document.documentElement.classList.add("no-gl"); ready(); throw e;
}
const small = innerWidth < 760;
const N = small ? 5200 : 9000;
/* shortcut: piksel dibatasi 1,75x, tanpa penyesuaian otomatis bila FPS turun; tambahkan bila ada keluhan di laptop lemah */
R.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
R.setSize(innerWidth, innerHeight, false);
R.setClearColor(0x060814, 1);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 300);
cam.position.set(0, 0, 12);

const C = { rigel: [0.663, 0.784, 1], nebula: [0.486, 0.361, 1], capella: [0.949, 0.843, 0.627], white: [0.93, 0.94, 0.98] };
function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const gauss = r => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * r()); };

/* Titik dari bentuk glyph: digambar di kanvas kecil lalu diambil piksel yang terisi */
const gcv = document.createElement("canvas"); gcv.width = gcv.height = 128;
const g = gcv.getContext("2d", { willReadFrequently: true });
const glyphCache = {};
function glyphPts(ch) {
  if (glyphCache[ch]) return glyphCache[ch];
  g.clearRect(0, 0, 128, 128); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = '100px "Segoe UI Symbol","Noto Sans Symbols 2","Apple Symbols",sans-serif';
  g.fillText(ch + "︎", 64, 68);
  const px = g.getImageData(0, 0, 128, 128).data, out = [];
  for (let y = 0; y < 128; y += 2) for (let x = 0; x < 128; x += 2) if (px[(y * 128 + x) * 4 + 3] > 120) out.push([(x - 64) / 64, -(y - 64) / 64]);
  return (glyphCache[ch] = out.length ? out : [[0, 0]]);
}

/* ---------- Bentuk tujuan ---------- */
const mk = () => ({ p: new Float32Array(N * 3), s: new Float32Array(N), c: new Float32Array(N * 3) });
function put(t, i, x, y, z, s, col, b) {
  t.p[i * 3] = x; t.p[i * 3 + 1] = y; t.p[i * 3 + 2] = z; t.s[i] = s;
  t.c[i * 3] = col[0] * b; t.c[i * 3 + 1] = col[1] * b; t.c[i * 3 + 2] = col[2] * b;
}
const DUST = [], rD = rng(99);
for (let i = 0; i < N; i++) {
  const u = rD() * 2 - 1, a = rD() * 6.2832, r = 6 + Math.pow(rD(), 0.6) * 12, q = Math.sqrt(1 - u * u);
  DUST.push([Math.cos(a) * q * r, u * r * 0.7, Math.sin(a) * q * r - 4, 0.35 + rD() * 0.9, rD() < 0.5 ? C.nebula : C.rigel, 0.22 + rD() * 0.3]);
}
function dust(t, from, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let i = from; i < N; i++) { const d = DUST[i]; put(t, i, d[0] * c - d[2] * s, d[1], d[0] * s + d[2] * c, d[3], d[4], d[5]); }
}
function intro() {
  const t = mk(), r = rng(3);
  for (let i = 0; i < N; i++) {
    const u = r() * 2 - 1, a = r() * 6.2832, rr = 28 + r() * 40, q = Math.sqrt(1 - u * u);
    put(t, i, Math.cos(a) * q * rr, u * rr, Math.sin(a) * q * rr - 10, 0.3, C.white, 0.4);
  }
  return t;
}
function hero() { /* roda zodiak di bidang XY; dimiringkan lewat matriks rotasi */
  const t = mk(), r = rng(7); let i = 0;
  const ring = (n, rad, w, col, b, s0) => { for (let j = 0; j < n; j++, i++) { const a = r() * 6.2832, rr = rad + gauss(r) * w; put(t, i, Math.cos(a) * rr, Math.sin(a) * rr, gauss(r) * w, s0 + r() * 0.5, col, b); } };
  ring(N * 0.2 | 0, 4.35, 0.025, C.rigel, 1, 0.6);
  ring(N * 0.09 | 0, 3.3, 0.02, C.capella, 0.6, 0.45);
  ring(N * 0.05 | 0, 5.1, 0.06, C.nebula, 0.5, 0.4);
  for (let j = 0, n = N * 0.05 | 0; j < n; j++, i++) { const a = (j % 12) * Math.PI / 6, rr = 3.3 + r() * 1.05; put(t, i, Math.cos(a) * rr, Math.sin(a) * rr, 0, 0.45, C.rigel, 0.55); }
  for (let j = 0, n = N * 0.17 | 0; j < n; j++, i++) {
    const k = j % 12, gp = glyphPts(Z[k].s), q = gp[(r() * gp.length) | 0], a = Math.PI / 2 - (k + 0.5) * Math.PI / 6;
    put(t, i, Math.cos(a) * 3.82 + q[0] * 0.34, Math.sin(a) * 3.82 + q[1] * 0.34, 0, 0.7 + r() * 0.4, C.capella, 1.2);
  }
  for (let j = 0, n = N * 0.05 | 0; j < n; j++, i++) put(t, i, gauss(r) * 0.28, gauss(r) * 0.28, gauss(r) * 0.28, 0.8 + r() * 1.4, C.capella, 0.9);
  for (let j = 0; j < 12; j++, i++) put(t, i, 0, 0, 0, 14 + j, C.capella, 0.05);
  dust(t, i, 0);
  return t;
}
function sign(k) {
  const t = mk(), z = Z[k], r = rng(100 + k * 31), P = z.shape.pts, L = z.shape.ln, S = 1.15 / 46;
  const st = P.map(([x, y]) => [(x - 200) * S, -(y - 200) * S, (r() - 0.5) * 1.4]);
  let i = 0;
  st.forEach(p => { for (let h = 0; h < 3; h++, i++) put(t, i, p[0], p[1], p[2], 8 + r() * 8, C.capella, 0.1); });
  for (let j = 0, n = N * 0.11 | 0; j < n; j++, i++) {
    const p = st[j % st.length], sg = j < st.length ? 0 : j % 5 === 0 ? 0.12 : 0.035;
    put(t, i, p[0] + gauss(r) * sg, p[1] + gauss(r) * sg, p[2] + gauss(r) * sg, j < st.length ? 3.4 : 0.5 + r() * 1.2, r() < 0.5 ? C.white : C.capella, 0.9);
  }
  const lens = L.map(([a, b]) => Math.hypot(st[a][0] - st[b][0], st[a][1] - st[b][1], st[a][2] - st[b][2])), tot = lens.reduce((x, y) => x + y, 0);
  for (let j = 0, n = N * 0.3 | 0; j < n; j++, i++) {
    let u = r() * tot, m = 0;
    while (u > lens[m] && m < lens.length - 1) { u -= lens[m]; m++; }
    const A = st[L[m][0]], B = st[L[m][1]], f = r();
    put(t, i, A[0] + (B[0] - A[0]) * f + gauss(r) * 0.012, A[1] + (B[1] - A[1]) * f + gauss(r) * 0.012, A[2] + (B[2] - A[2]) * f, 0.38 + r() * 0.35, C.rigel, 0.55);
  }
  const gp = glyphPts(z.s);
  for (let j = 0, n = N * 0.09 | 0; j < n; j++, i++) { const q = gp[(r() * gp.length) | 0]; put(t, i, q[0] * 3.6, q[1] * 3.6, -4 + gauss(r) * 0.06, 0.6 + r() * 0.4, C.nebula, 0.75); }
  dust(t, i, (k + 1) * 0.45);
  return t;
}
function galaxy() {
  const t = mk(), r = rng(4242), n = N * 0.66 | 0; let i = 0;
  for (; i < n; i++) {
    const rr = 0.12 + Math.pow(r(), 0.75) * 8, a = (i % 3) * 2.0944 + rr * 0.85 + gauss(r) * 0.26 * (1 + rr * 0.08), f = rr / 8;
    put(t, i, Math.cos(a) * rr, Math.sin(a) * rr, gauss(r) * 0.14 * (1.4 - f), (f < 0.18 ? 1.4 : 0.6) + r() * 0.7, f < 0.22 ? C.capella : r() < 0.5 ? C.rigel : C.nebula, f < 0.22 ? 1.1 : 0.85);
  }
  for (let j = 0; j < 10; j++, i++) put(t, i, 0, 0, 0, 16 + j * 2, C.capella, 0.05);
  dust(t, i, 2.3);
  return t;
}
const cache = {};
const target = k => cache[k] || (cache[k] = k === 0 ? intro() : k === 1 ? hero() : k === 14 ? galaxy() : sign(k - 2));

/* ---------- Partikel ---------- */
const geo = new THREE.BufferGeometry();
const A3 = () => new THREE.BufferAttribute(new Float32Array(N * 3), 3), A1 = () => new THREE.BufferAttribute(new Float32Array(N), 1);
const aR = new Float32Array(N), rr = rng(5); for (let i = 0; i < N; i++) aR[i] = rr();
geo.setAttribute("position", A3()); geo.setAttribute("aTo", A3());
geo.setAttribute("aS0", A1()); geo.setAttribute("aS1", A1());
geo.setAttribute("aC0", A3()); geo.setAttribute("aC1", A3());
geo.setAttribute("aR", new THREE.BufferAttribute(aR, 1));
geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);

const U = {
  uMix: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1 }, uSw: { value: reduce ? 0 : 1 },
  uR0: { value: new THREE.Matrix3() }, uR1: { value: new THREE.Matrix3() }
};
const mat = new THREE.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `
    attribute vec3 aTo, aC0, aC1; attribute float aS0, aS1, aR;
    uniform float uMix, uTime, uPx, uSw; uniform mat3 uR0, uR1;
    varying vec3 vC;
    void main(){
      float d = aR * .4;
      float m = smoothstep(d, d + .6, uMix);
      vec3 p = mix(uR0 * position, uR1 * aTo, m);
      float mid = sin(3.14159265 * m) * uSw;
      float ang = mid * (1.1 + aR * 2.4);
      float cs = cos(ang), sn = sin(ang);
      p.xz = mat2(cs, -sn, sn, cs) * p.xz;
      p.y += mid * (aR - .5) * 2.6;
      p += .03 * uSw * vec3(sin(uTime * .7 + aR * 61.), cos(uTime * .6 + aR * 37.), sin(uTime * .5 + aR * 13.));
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      gl_Position = projectionMatrix * mv;
      float tw = .72 + .28 * sin(uTime * (1. + aR * 3.) + aR * 90.) * (uSw * .8 + .2);
      gl_PointSize = min(mix(aS0, aS1, m) * tw * uPx / -mv.z, 96.);
      vC = mix(aC0, aC1, m) * (1. + mid * .7);
    }`,
  fragmentShader: `
    varying vec3 vC;
    void main(){
      float r = length(gl_PointCoord - .5);
      float a = smoothstep(.5, 0., r);
      gl_FragColor = vec4(vC, a * a);
    }`
});
const pts = new THREE.Points(geo, mat);
pts.frustumCulled = false;
scene.add(pts);

let pair = -1;
function setPair(a) {
  if (a === pair) return;
  pair = a;
  const F = target(a), T = target(Math.min(a + 1, 14)), at = geo.attributes;
  at.position.array.set(F.p); at.aTo.array.set(T.p);
  at.aS0.array.set(F.s); at.aS1.array.set(T.s);
  at.aC0.array.set(F.c); at.aC1.array.set(T.c);
  for (const k of ["position", "aTo", "aS0", "aS1", "aC0", "aC1"]) at[k].needsUpdate = true;
}

/* Bintang jauh (latar) */
const SN = small ? 1400 : 2600, sg = new THREE.BufferGeometry(), sp = new Float32Array(SN * 3), sr = new Float32Array(SN), r2 = rng(11);
for (let i = 0; i < SN; i++) {
  const u = r2() * 2 - 1, a = r2() * 6.2832, q = Math.sqrt(1 - u * u), d = 60 + r2() * 40;
  sp[i * 3] = Math.cos(a) * q * d; sp[i * 3 + 1] = u * d; sp[i * 3 + 2] = Math.sin(a) * q * d; sr[i] = r2();
}
sg.setAttribute("position", new THREE.BufferAttribute(sp, 3)); sg.setAttribute("aR", new THREE.BufferAttribute(sr, 1));
const stars = new THREE.Points(sg, new THREE.ShaderMaterial({
  uniforms: { uTime: U.uTime, uPx: U.uPx }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `attribute float aR; uniform float uTime, uPx; varying float vA; varying vec3 vC;
    void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
      vA = .35 + .65 * abs(sin(uTime * (.3 + aR) + aR * 50.));
      vC = aR < .15 ? vec3(.95,.84,.63) : aR < .55 ? vec3(.66,.78,1.) : vec3(.93,.94,.98);
      gl_PointSize = (1. + aR * aR * 3.) * uPx * .9 / -mv.z * 2.; }`,
  fragmentShader: `varying float vA; varying vec3 vC; void main(){ float r = length(gl_PointCoord - .5); gl_FragColor = vec4(vC, smoothstep(.5, 0., r) * vA); }`
}));
stars.frustumCulled = false;
scene.add(stars);

/* Nebula: kabut ungu bergerak di belakang semuanya, diwarnai elemen zodiak yang aktif */
const ng = new THREE.BufferGeometry();
ng.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
const NU = { uTime: U.uTime, uS: { value: 0 }, uAc: { value: new THREE.Color(SKY.ac) }, uAsp: { value: innerWidth / innerHeight } };
const neb = new THREE.Mesh(ng, new THREE.ShaderMaterial({
  uniforms: NU, depthTest: false, depthWrite: false,
  vertexShader: `varying vec2 vU; void main(){ vU = position.xy * .5 + .5; gl_Position = vec4(position.xy, .999, 1.); }`,
  fragmentShader: `varying vec2 vU; uniform float uTime, uS, uAsp; uniform vec3 uAc;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
      return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++){ v += a * n(p); p *= 2.03; a *= .5; } return v; }
    void main(){
      vec2 p = vec2(vU.x * uAsp, vU.y) * 1.7 + vec2(uTime * .008, uS * .07);
      float q = fbm(p + fbm(p * 1.4 + uTime * .012));
      vec3 col = vec3(.024, .031, .078);
      col += vec3(.486, .361, 1.) * pow(q, 3.) * .5;
      col += uAc * pow(fbm(p * .7 - 3.1 + uS * .04), 4.) * .45;
      float v = smoothstep(1.25, .15, length(vU - .5) * 1.7);
      gl_FragColor = vec4(col * (.5 + .5 * v), 1.);
    }`
}));
neb.frustumCulled = false; neb.renderOrder = -1;
scene.add(neb);

/* ---------- Rotasi tiap bentuk ---------- */
const m4 = new THREE.Matrix4(), m4b = new THREE.Matrix4();
function rotFor(k, time, out) {
  if (k === 1) m4.makeRotationX(-1.02).multiply(m4b.makeRotationZ(-time * 0.045));
  else if (k === 14) m4.makeRotationX(-0.95).multiply(m4b.makeRotationZ(time * 0.03));
  else if (k >= 2) m4.makeRotationY(Math.sin(time * 0.25 + k) * 0.22);
  else m4.identity();
  return out.setFromMatrix4(m4);
}

/* ---------- Ukuran layar dan mouse ---------- */
function size() {
  R.setSize(innerWidth, innerHeight, false);
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  U.uPx.value = innerHeight * R.getPixelRatio() * 0.05;
  NU.uAsp.value = cam.aspect;
}
size(); addEventListener("resize", size);
let mx = 0, my = 0;
addEventListener("pointermove", e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });

/* ---------- Bingkai ---------- */
let s = SKY.s, side = 0;
const acNow = new THREE.Color(SKY.ac), acTo = new THREE.Color();
function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden) return;
  const time = now / 1000;
  s += (SKY.s - s) * (Math.abs(SKY.s - s) > 3 ? 0.06 : 0.1);
  const x = Math.min(Math.max(s + 2, 0), 14);
  const a = Math.min(Math.floor(x), 13), f = x - a;
  setPair(a);
  U.uMix.value = f; U.uTime.value = time;
  rotFor(a, time, U.uR0.value); rotFor(a + 1, time, U.uR1.value);

  side += (SKY.side - side) * 0.06;
  const journey = s > -0.6 && s < 11.6 ? 1 : 0;
  pts.position.x += ((small ? 0 : side * 2.7) - pts.position.x) * 0.08;
  pts.position.y += ((small ? journey * 2.3 : 0) - pts.position.y) * 0.08;
  const dolly = Math.sin(Math.PI * f) * (a >= 2 && a < 13 ? 1.8 : 0.9);
  cam.position.x += (mx * 0.7 - cam.position.x) * 0.04;
  cam.position.y += (-my * 0.45 - cam.position.y) * 0.04;
  cam.position.z = (small ? 13.5 : 12) - dolly;
  cam.lookAt(0, small ? journey * 0.4 : 0, 0);
  stars.rotation.y = s * 0.045 + time * 0.004;
  stars.rotation.x = s * 0.012;

  acNow.lerp(acTo.set(SKY.ac), 0.04);
  NU.uAc.value.copy(acNow); NU.uS.value = s;
  R.render(scene, cam);
}
setPair(0);
requestAnimationFrame(t => { frame(t); ready(); });
/* Siapkan semua bentuk di sela waktu luang agar pergantian rasi tidak tersendat */
const idle = window.requestIdleCallback || (cb => setTimeout(cb, 60));
let pre = 1;
(function warm() { if (pre > 14) return; target(pre++); idle(warm); })();
