/* Satu-satunya file yang perlu Anda ubah sebelum deploy.
   Setelah mengubah, jalankan:  node tools/build-site.js  (atau klik jalankan-build.bat / bash jalankan-build.sh) */
module.exports = {
  siteName: "Astral",
  siteUrl: "https://zodiakastral.netlify.app",      // domain asli Anda, tanpa garis miring di akhir
  owner: "Tim Zodiak Astral",                        // nama Anda / tim, tampil di Tentang Kami & Kebijakan Privasi
  email: "zodiakastral@gmail.com",           // email kontak asli (dipakai di Kontak & Privasi)
  whatsapp: "6287733956352",                 // nomor WhatsApp dengan kode negara 62, tanpa 0 di depan

  /* AdSense. Isi publisherId setelah mendaftar di adsense.google.com
     (formatnya ca-pub- diikuti 16 angka). Selama masih XXXX, tidak ada kode iklan
     yang dipasang dan tidak ada kotak iklan kosong yang tampil. */
  publisherId: "ca-pub-XXXXXXXXXXXXXXXX",

  /* ID unit iklan (data-ad-slot) dari AdSense > Iklan > Per unit iklan.
     Boleh dikosongkan; kalau kosong, situs mengandalkan Auto ads. */
  slots: { home: "", side: "", article: "", articleEnd: "" }
};


