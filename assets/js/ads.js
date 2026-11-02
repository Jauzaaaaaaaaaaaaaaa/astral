/* Mengaktifkan unit iklan AdSense yang terlihat. Unit yang disembunyikan (mis. sidebar di HP) dilewati
   agar tidak muncul galat "availableWidth=0". */
(function () {
  function run() {
    document.querySelectorAll("ins.adsbygoogle").forEach(function (el) {
      if (el.dataset.started || !el.parentElement.offsetWidth) return;
      el.dataset.started = "1";
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }
  if (document.readyState === "complete") run(); else addEventListener("load", run);
})();
