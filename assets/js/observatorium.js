/* ZODIAK: peta langit yang berputar saat scroll, dan bacaan instrumen dari waktu nyata. */
(function () {
  var d = document, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ns = 'http://www.w3.org/2000/svg';

  var milky = d.createElement('div');
  milky.id = 'obs-milky';
  milky.setAttribute('aria-hidden', 'true');
  d.body.appendChild(milky);

  /* Garis deklinasi (lingkaran) dan asensio rekta (jari-jari), jam 0 sampai 23 */
  var s = '';
  [90, 180, 270, 360, 450, 540, 630].forEach(function (r, i) {
    s += '<circle cx="700" cy="700" r="' + r + '"' + (i % 3 === 2 ? ' class="obs-major"' : '') + '/>';
  });
  for (var h = 0; h < 24; h++) {
    var a = h / 24 * Math.PI * 2, c = Math.cos(a), n = Math.sin(a);
    s += '<line x1="' + (700 + c * 90) + '" y1="' + (700 + n * 90) + '" x2="' + (700 + c * 630) + '" y2="' + (700 + n * 630) + '"' + (h % 6 === 0 ? ' class="obs-major"' : '') + '/>';
    var tx = 700 + c * 648, ty = 700 + n * 648;
    s += '<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="middle" transform="rotate(' + (h * 15 + 90) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')">' + (h < 10 ? '0' : '') + h + 'h</text>';
  }
  /* Ekliptika: lingkaran miring tempat dua belas zodiak berada */
  s += '<circle class="obs-major" cx="760" cy="640" r="430" stroke-dasharray="3 6"/>';
  for (var t = 0; t < 360; t += 5) {
    var p = t * Math.PI / 180, r1 = t % 30 === 0 ? 618 : 626;
    s += '<line x1="' + (700 + Math.cos(p) * r1) + '" y1="' + (700 + Math.sin(p) * r1) + '" x2="' + (700 + Math.cos(p) * 630) + '" y2="' + (700 + Math.sin(p) * 630) + '"/>';
  }
  var chart = d.createElementNS(ns, 'svg');
  chart.id = 'obs-chart';
  chart.setAttribute('viewBox', '0 0 1400 1400');
  chart.setAttribute('aria-hidden', 'true');
  chart.innerHTML = s;
  d.body.appendChild(chart);

  /* Fase bulan dari siklus sinodis, acuan bulan baru 6 Januari 2000 18:14 UTC */
  var SYN = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14);
  var age = (((Date.now() - ref) / 864e5) % SYN + SYN) % SYN, frac = age / SYN;
  var names = ['Bulan Baru', 'Sabit Awal', 'Paruh Awal', 'Cembung Awal', 'Purnama', 'Cembung Akhir', 'Paruh Akhir', 'Sabit Akhir'];
  var moon = names[Math.floor(frac * 8 + .5) % 8];
  var lit = (1 - Math.cos(frac * 2 * Math.PI)) / 2;
  var shade = 'linear-gradient(' + (frac < .5 ? '270deg' : '90deg') + ',#f6f3ea ' + (lit * 100).toFixed(0) + '%,#2a2838 ' + (lit * 100).toFixed(0) + '%)';

  var hud = d.createElement('div');
  hud.id = 'obs-hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = '<span>RA <b id="obs-ra"></b> &nbsp; Dek <b id="obs-dec"></b></span>' +
    '<span>Waktu bintang <b id="obs-lst"></b></span>' +
    '<span><i id="obs-moon" style="background:' + shade + '"></i>' + moon + ' <b>' + Math.round(lit * 100) + '%</b></span>';
  d.body.appendChild(hud);

  var ra = d.getElementById('obs-ra'), dec = d.getElementById('obs-dec'), lst = d.getElementById('obs-lst');
  var pad = function (v) { return (v < 10 ? '0' : '') + v; };
  var progress = 0, drift = 0;

  function aim() {
    var hours = (progress * 24 + 5.5) % 24, H = Math.floor(hours), M = Math.floor((hours - H) * 60);
    var deg = 23.4 * Math.sin(progress * 2 * Math.PI);
    ra.textContent = pad(H) + 'h ' + pad(M) + 'm';
    dec.textContent = (deg >= 0 ? '+' : '-') + pad(Math.floor(Math.abs(deg))) + '°';
  }
  function clock() {
    /* Waktu sideris lokal pada bujur Surakarta, 110,8 derajat timur */
    var J = Date.now() / 864e5 + 2440587.5 - 2451545;
    var g = (280.46061837 + 360.98564736629 * J + 110.8) % 360;
    var total = (g < 0 ? g + 360 : g) / 15;
    lst.textContent = pad(Math.floor(total)) + ':' + pad(Math.floor((total % 1) * 60));
  }
  clock(); setInterval(clock, 30000);

  var pending = false;
  function apply() {
    pending = false;
    chart.style.transform = 'rotate(' + (progress * 150 + drift).toFixed(2) + 'deg)';
    aim();
  }
  function onScroll() {
    var max = d.documentElement.scrollHeight - innerHeight;
    progress = max > 0 ? scrollY / max : 0;
    if (!pending) { pending = true; requestAnimationFrame(apply); }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (!reduce) setInterval(function () { drift += .012; if (!pending) { pending = true; requestAnimationFrame(apply); } }, 80);

  /* Bingkai bidik pada panel yang ada */
  d.querySelectorAll('details, .card').forEach(function (el) { el.classList.add('obs-frame'); });
})();
