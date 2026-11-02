/* Data tambahan untuk Tanya-Jawab: gaya hidup (makanan, liburan, fashion, uang, gaya kerja)
   dan pertanyaan "zodiak apa yang paling ...". Ditulis sebagai ringkasan astrologi populer, untuk hiburan. */
window.LIFE = {
  topics: {
    food:    { label: "makanan" },
    travel:  { label: "liburan" },
    fashion: { label: "gaya berpakaian" },
    money:   { label: "keuangan" },
    work:    { label: "gaya kerja" }
  },
  /* Alasan berdasarkan elemen: topik -> elemen -> kalimat */
  element: {
    food: {
      Api: "Elemen Api: energi tinggi membuat mereka suka rasa yang berani, pedas, dan bikin semangat.",
      Tanah: "Elemen Tanah: membumi, jadi menyukai makanan yang mengenyangkan, bahan segar, dan rasa yang konsisten.",
      Udara: "Elemen Udara: suka variasi dan hal baru, jadi gampang tergoda mencoba kuliner yang unik atau sedang tren.",
      Air: "Elemen Air: emosional, jadi makanan sering menjadi penghibur suasana hati, biasanya yang hangat, berkuah, atau manis."
    },
    travel: {
      Api: "Elemen Api: butuh aksi dan tantangan, jadi liburan yang terlalu pasif cepat membosankan.",
      Tanah: "Elemen Tanah: mengutamakan kenyamanan dan kualitas, bukan banyaknya destinasi.",
      Udara: "Elemen Udara: haus pengalaman dan interaksi baru, jadi suka tempat dengan budaya dan orang yang beragam.",
      Air: "Elemen Air: mencari ketenangan dan makna emosional, sering tertarik pada laut, danau, atau tempat penuh kenangan."
    },
    fashion: {
      Api: "Elemen Api: percaya diri, jadi berani tampil mencolok.",
      Tanah: "Elemen Tanah: mengutamakan kualitas bahan dan kenyamanan yang tahan lama.",
      Udara: "Elemen Udara: suka bereksperimen dan mengikuti ide yang unik.",
      Air: "Elemen Air: memilih pakaian sesuai suasana hati, cenderung lembut dan mengalir."
    },
    money: {
      Api: "Elemen Api: spontan dan berani ambil risiko, jadi uang cepat berpindah ke hal yang menyenangkan.",
      Tanah: "Elemen Tanah: praktis dan terencana, nyaman menabung untuk jangka panjang.",
      Udara: "Elemen Udara: pikirannya ke ide dan pengalaman, jadi pengeluaran bisa kurang teratur.",
      Air: "Elemen Air: keputusan keuangan sering dipengaruhi perasaan dan kebutuhan akan rasa aman."
    },
    work: {
      Api: "Elemen Api: bergerak cepat dan senang memimpin, tetapi cepat bosan dengan rutinitas.",
      Tanah: "Elemen Tanah: tekun, rapi, dan konsisten menyelesaikan pekerjaan.",
      Udara: "Elemen Udara: kuat di komunikasi dan ide, nyaman dengan cara kerja yang fleksibel.",
      Air: "Elemen Air: intuitif dan empatik, bekerja terbaik di lingkungan yang suportif."
    }
  },
  /* Per zodiak dan topik: [jawaban langsung (tanpa nama zodiak di depan), alasan khusus] */
  zodiak: {
    Aries: {
      food:    ["menyukai makanan pedas, panggang, dan praktis seperti sate, BBQ, burger, dan ayam geprek.", "Dikuasai Mars: planet energi ini membuat mereka suka rasa yang menantang dan makan cepat tanpa ribet."],
      travel:  ["paling cocok dengan liburan penuh aksi seperti mendaki gunung, arung jeram, atau olahraga ekstrem.", "Dikuasai Mars: butuh adrenalin dan tantangan fisik, bukan sekadar bersantai di hotel."],
      fashion: ["bergaya sporty, tegas, dan berani, dengan jaket, sneakers, dan warna merah.", "Mars identik dengan warna merah dan gerak cepat, jadi pakaian harus praktis agar leluasa bergerak."],
      money:   ["cenderung cepat membelanjakan uang dan berani mengambil risiko, jadi perlu anggaran yang tegas.", "Dikuasai Mars: impulsif, melihat sesuatu yang bagus langsung dibeli tanpa menimbang lama."],
      work:    ["bekerja paling baik sebagai pemimpin inisiatif yang bergerak cepat dan mandiri.", "Sebagai tanda pertama zodiak, mereka suka menjadi yang memulai, tetapi cepat bosan di tahap detail."]
    },
    Taurus: {
      food:    ["menyukai makanan enak, mengenyangkan, dan berkualitas seperti steak, keju, cokelat, dan kue.", "Dikuasai Venus: planet kenikmatan ini membuat mereka sangat menikmati rasa dan tekstur makanan."],
      travel:  ["suka liburan santai dan nyaman seperti villa, spa, atau pedesaan yang indah.", "Dikuasai Venus: akomodasi nyaman dan makanan enak lebih penting daripada jadwal yang padat."],
      fashion: ["bergaya klasik dan nyaman dengan bahan berkualitas serta warna earth tone dan hijau.", "Venus membuat mereka peka pada tekstur, jadi lebih memilih kain lembut yang tahan lama daripada tren sesaat."],
      money:   ["termasuk paling jago mengelola uang: hemat, rajin menabung, dan suka aset yang nyata.", "Dikuasai Venus: menghargai rasa aman secara materi, tetapi sesekali royal untuk barang berkualitas."],
      work:    ["cocok dengan pekerjaan stabil yang butuh ketekunan, seperti keuangan, kuliner, atau desain.", "Mereka lambat memulai tetapi sangat konsisten, dan tidak suka diburu-buru atau perubahan mendadak."]
    },
    Gemini: {
      food:    ["menyukai makanan yang beragam dan praktis, seperti street food dan camilan yang bisa dicicipi banyak jenis.", "Dikuasai Merkurius: rasa ingin tahu membuat mereka cepat bosan jika makan itu-itu saja."],
      travel:  ["suka city trip dengan banyak tempat, museum, kafe, dan orang baru.", "Dikuasai Merkurius: haus informasi dan obrolan, jadi tempat yang ramai cerita lebih menarik daripada resor yang sepi."],
      fashion: ["bergaya serba bisa dan playful, suka mix and match, motif, dan aksesori unik.", "Lambang kembar membuat gaya mereka sering berganti mengikuti suasana hari itu."],
      money:   ["pandai mencari peluang penghasilan dari banyak sumber, tetapi pengeluarannya sulit diprediksi.", "Dikuasai Merkurius: gesit dan multitasking, cocok dengan side hustle, tetapi kurang sabar mencatat keuangan."],
      work:    ["cocok dengan pekerjaan komunikasi seperti penulis, marketing, jurnalis, atau sales.", "Dikuasai Merkurius, planet komunikasi: mudah menjelaskan ide dan beradaptasi, tetapi cepat bosan di tugas yang monoton."]
    },
    Cancer: {
      food:    ["menyukai masakan rumahan dan comfort food seperti sup, bubur, dan makanan buatan keluarga.", "Dikuasai Bulan: memori dan emosi sangat lekat dengan makanan masa kecil, jadi rasa nostalgia paling menenangkan."],
      travel:  ["suka liburan dekat air dan tempat yang terasa seperti rumah, seperti pantai, vila, atau berkumpul bersama keluarga.", "Dikuasai Bulan: butuh rasa aman, jadi tempat yang familier dan hangat lebih disukai daripada yang terlalu asing."],
      fashion: ["bergaya lembut, nyaman, dan sedikit vintage dengan warna putih, krem, dan biru pastel.", "Bulan melambangkan kelembutan, dan mereka sering menyimpan pakaian yang punya nilai kenangan."],
      money:   ["hemat dan protektif soal uang, suka punya dana darurat demi rasa aman keluarga.", "Naluri melindungi dari Bulan membuat mereka menabung, tetapi bisa boros untuk orang tersayang."],
      work:    ["cocok dengan pekerjaan yang merawat dan mengasuh seperti guru, perawat, HR, atau kuliner.", "Mereka peka terhadap suasana tim dan sangat loyal, tetapi mudah terbawa perasaan saat dikritik."]
    },
    Leo: {
      food:    ["menyukai makanan mewah dan tampil mengesankan seperti steak, sushi premium, dan fine dining.", "Dikuasai Matahari: suka menjadi pusat perhatian, jadi makan di tempat bergengsi dan mentraktir teman terasa istimewa."],
      travel:  ["suka liburan mewah dan berkesan seperti resor, kapal pesiar, atau festival besar.", "Dikuasai Matahari: ingin pengalaman yang wah dan layak dikenang."],
      fashion: ["bergaya glamor dan berani, dengan warna emas, oranye, dan aksesori mencolok.", "Matahari melambangkan kilau, jadi mereka suka outfit yang membuat orang menoleh."],
      money:   ["royal dan dermawan, suka mentraktir, sehingga perlu batas pengeluaran gaya hidup.", "Hati yang hangat dan rasa bangga membuat mereka mudah menghabiskan uang demi tampil terbaik."],
      work:    ["cocok menjadi pemimpin, performer, atau kreator yang bisa tampil di depan.", "Mereka memotivasi tim dengan karisma, tetapi butuh apresiasi untuk tetap bersemangat."]
    },
    Virgo: {
      food:    ["menyukai makanan sehat, bersih, dan teratur seperti salad, smoothie, dan menu bergizi.", "Dikuasai Merkurius: analitis dan teliti, jadi mereka memperhatikan bahan, kebersihan, dan porsi."],
      travel:  ["suka liburan yang terencana, rapi, dan dekat alam seperti trekking ringan atau desa wisata.", "Dikuasai Merkurius: gemar menyusun itinerary detail agar semuanya tidak berantakan."],
      fashion: ["bergaya rapi, minimalis, dan bersih dengan warna netral.", "Sifat perfeksionis membuat mereka memperhatikan potongan dan detail kecil."],
      money:   ["teliti mencatat pengeluaran dan jago menyusun anggaran.", "Mereka analitis dan hati-hati sehingga jarang belanja impulsif, tetapi bisa terlalu khawatir soal uang."],
      work:    ["cocok dengan pekerjaan analisis dan detail seperti akuntan, editor, peneliti, atau tenaga kesehatan.", "Mereka teliti dan suka memperbaiki proses, tetapi bisa terlalu kritis pada diri sendiri."]
    },
    Libra: {
      food:    ["menyukai makanan yang cantik, seimbang, dan manis seperti dessert, kopi, dan hidangan ala kafe.", "Dikuasai Venus: kepekaan pada estetika membuat tampilan dan suasana sama pentingnya dengan rasa."],
      travel:  ["suka liburan romantis dan estetik seperti kota seni, Paris, atau Santorini.", "Dikuasai Venus: mencari keindahan, harmoni, dan teman perjalanan yang menyenangkan."],
      fashion: ["bergaya elegan dan serasi dengan warna pastel dan potongan yang chic.", "Venus memberi mereka selera keseimbangan, tetapi sering sulit memilih karena semuanya terlihat bagus."],
      money:   ["senang membelanjakan uang untuk keindahan dan pengalaman bersama, sehingga perlu kontrol.", "Mereka sulit memutuskan dan suka barang cantik, jadi belanja bisa melebihi rencana."],
      work:    ["cocok dengan pekerjaan yang butuh diplomasi seperti hukum, desain, HR, atau mediator.", "Mereka adil dan pandai menengahi, tetapi sulit mengambil keputusan dengan cepat."]
    },
    Scorpio: {
      food:    ["menyukai makanan intens dan bercita rasa kuat seperti pedas, kopi pekat, dan cokelat hitam.", "Sifat intens dan misterius membuat mereka tertarik pada rasa yang dalam dan tidak biasa."],
      travel:  ["suka tempat misterius dan sepi seperti hutan, kota tua, atau destinasi bersejarah.", "Mereka butuh privasi dan suasana yang punya cerita."],
      fashion: ["bergaya gelap, misterius, dan tegas dengan warna hitam, merah marun, dan kulit.", "Mereka intens dan tertutup, jadi gaya berpakaiannya memberi kesan kuat tanpa banyak bicara."],
      money:   ["strategis dan tertutup soal uang, suka investasi dan menyimpan rahasia keuangannya sendiri.", "Dikuasai Pluto: tajam membaca peluang dan risiko, dan suka punya kendali penuh."],
      work:    ["cocok dengan pekerjaan riset, investigasi, psikologi, atau strategi.", "Mereka fokus dan gigih, bekerja dalam diam tetapi hasilnya mendalam."]
    },
    Sagittarius: {
      food:    ["menyukai makanan dari berbagai budaya seperti kari, tacos, dan street food lokal saat bepergian.", "Dikuasai Jupiter: planet ekspansi ini membuat mereka ingin mencoba rasa dari seluruh dunia."],
      travel:  ["bermimpi keliling dunia, backpacking, dan berpetualang ke negara baru.", "Dikuasai Jupiter dan berlambang pemanah: selalu mengejar cakrawala baru."],
      fashion: ["bergaya kasual dan siap petualang dengan sneakers dan warna cerah.", "Kebebasan bergerak lebih penting bagi mereka daripada tampil formal."],
      money:   ["cenderung royal untuk pengalaman dan perjalanan, serta kurang suka mencatat pengeluaran.", "Dikuasai Jupiter: optimis dan yakin rezeki akan datang, jadi tabungan perlu diingatkan."],
      work:    ["cocok dengan pekerjaan yang bebas dan luas seperti travel, pengajar, atau penulis.", "Mereka antusias dan jujur, tetapi tidak betah di rutinitas yang kaku."]
    },
    Capricorn: {
      food:    ["menyukai makanan klasik dan mengenyangkan seperti masakan tradisional, kopi hitam, dan steak.", "Dikuasai Saturnus: disiplin dan praktis, jadi mereka suka menu yang pasti dan tidak neko-neko."],
      travel:  ["suka liburan terencana dan bermakna seperti situs bersejarah, pegunungan, atau hotel bintang.", "Dikuasai Saturnus: efisien, jadi mereka menghargai liburan yang benar-benar sepadan."],
      fashion: ["bergaya formal, rapi, dan elegan dengan warna hitam, abu-abu, dan navy.", "Citra profesional penting bagi mereka, jadi mereka berinvestasi pada pakaian berkualitas."],
      money:   ["termasuk paling disiplin soal uang: rajin menabung dan berinvestasi jangka panjang.", "Dikuasai Saturnus: planet kerja keras dan tanggung jawab, jadi mereka selalu berpikir ke masa depan."],
      work:    ["cocok menjadi manajer, pengusaha, atau insinyur.", "Mereka ambisius dan tahan banting, tetapi sering terlalu gila kerja."]
    },
    Aquarius: {
      food:    ["menyukai makanan unik dan eksperimental seperti fusion, vegan, atau menu yang jarang dikenal.", "Dikuasai Uranus: planet inovasi ini membuat mereka tertarik pada hal yang tidak biasa."],
      travel:  ["suka destinasi unik dan non-mainstream seperti kota teknologi atau festival komunitas.", "Dikuasai Uranus: mereka menolak jalur turis yang itu-itu saja."],
      fashion: ["bergaya nyentrik dan anti-mainstream dengan perpaduan yang tak terduga.", "Mereka mandiri dan berpakaian untuk diri sendiri, bukan untuk mengikuti tren."],
      money:   ["tidak terlalu terikat materi dan rasional, tetapi suka berinvestasi di teknologi atau tujuan sosial.", "Visioner dan objektif: uang dilihat sebagai alat, bukan simbol status."],
      work:    ["cocok dengan bidang teknologi, riset, atau proyek sosial.", "Mereka inovatif dan mandiri, tetapi kurang betah dengan aturan yang kaku."]
    },
    Pisces: {
      food:    ["menyukai comfort food hangat dan olahan laut seperti sup, ramen, sushi, dan dessert manis.", "Dikuasai Neptunus: imajinasi dan rasa nostalgia membuat mereka suka penyajian yang estetik dan rasa yang autentik."],
      travel:  ["suka pantai, pulau, dan tempat tenang yang puitis.", "Dikuasai Neptunus, planet laut dan mimpi, sehingga mereka merasa pulih di dekat air."],
      fashion: ["bergaya dreamy dan lembut dengan bahan mengalir, warna pastel, dan biru laut.", "Mereka imajinatif, jadi pakaian adalah cara mengekspresikan suasana hati."],
      money:   ["murah hati dan mudah membantu orang lain, sehingga uangnya sering mengalir keluar.", "Empati tinggi dan kurang tegas membuat mereka sulit berkata tidak."],
      work:    ["cocok dengan bidang seni, musik, penulisan, atau terapi.", "Mereka intuitif dan kreatif, tetapi butuh suasana kerja yang mendukung."]
    }
  }
};

/* Pertanyaan "zodiak apa yang paling ...". k = kata kunci, z = zodiak, a = jawaban langsung (tanpa nama), why = alasan */
window.SUPER = [
  { k: ["sentimental", "baper", "melankolis", "nostalgia"], z: "Cancer", a: "dikenal paling sentimental dan emosional dibandingkan zodiak lainnya.",
    why: [["Dikuasai oleh Bulan", "Bulan mengendalikan emosi dan kenangan, sehingga Cancer sangat terikat pada masa lalu, barang peninggalan, dan momen bersama orang tersayang."], ["Empati tinggi", "mereka menyimpan perasaan sangat dalam dan mudah tersentuh oleh hal-hal kecil."]] },
  { k: ["pendendam", "dendam", "sulit memaafkan", "susah memaafkan"], z: "Scorpio", a: "sering disebut sebagai zodiak paling pendendam.",
    why: [["Elemen Air yang dalam", "perasaannya intens dan tersimpan lama, jadi luka karena dikhianati sulit dilupakan."], ["Dikuasai Pluto", "planet transformasi dan kekuatan ini membuat mereka butuh kendali dan sangat menjaga kepercayaan."]] },
  { k: ["overthinking", "over thinking", "kebanyakan mikir", "banyak pikiran", "terlalu banyak berpikir"], z: "Virgo", a: "paling sering dikaitkan dengan overthinking, dan Pisces menyusul tidak jauh di belakang.",
    why: [["Dikuasai Merkurius", "pikirannya analitis dan tidak berhenti menimbang kemungkinan dari berbagai sisi."], ["Perfeksionis", "mereka takut salah, sehingga sering memutar ulang keputusan dan percakapan."]] },
  { k: ["paling setia", "kesetiaan"], z: "Taurus", a: "sering disebut sebagai zodiak paling setia, bersama Scorpio.",
    why: [["Elemen Tanah", "stabil dan teguh, jadi mereka memegang komitmen dengan serius."], ["Dikuasai Venus", "menghargai hubungan yang aman dan penuh kasih sayang."]] },
  { k: ["cemburu", "posesif", "cemburuan"], z: "Scorpio", a: "dikenal paling pencemburu, dengan Taurus yang juga cenderung posesif.",
    why: [["Intensitas Air", "perasaan yang dalam membuat mereka sangat protektif terhadap orang yang disayang."], ["Sulit percaya", "mereka butuh bukti kesetiaan dan mudah curiga ketika kepercayaan terganggu."]] },
  { k: ["pelit", "irit", "paling hemat", "hemat"], z: "Capricorn", a: "dikenal paling hemat dan perhitungan soal uang.",
    why: [["Dikuasai Saturnus", "planet disiplin dan tanggung jawab ini membuat mereka selalu berpikir jangka panjang."], ["Elemen Tanah", "praktis dan mengutamakan rasa aman finansial."]] },
  { k: ["boros", "royal", "konsumtif", "suka belanja", "shopaholic"], z: "Leo", a: "sering dianggap paling royal dan boros dalam membelanjakan uang.",
    why: [["Dikuasai Matahari", "mereka suka tampil terbaik dan menjadi pusat perhatian."], ["Hati yang dermawan", "mereka senang mentraktir dan memberi hadiah, sehingga uang mudah keluar."]] },
  { k: ["pemalas", "malas", "mager"], z: "Taurus", a: "sering disebut paling betah bermalas-malasan.",
    why: [["Dikuasai Venus", "planet kenikmatan ini membuat mereka sangat menikmati kenyamanan, tidur, dan makan enak."], ["Elemen Tanah", "mereka bergerak pelan tetapi pasti, dan tidak suka diburu-buru."]] },
  { k: ["ambisius", "workaholic", "gila kerja", "pekerja keras"], z: "Capricorn", a: "dikenal paling ambisius dan gila kerja.",
    why: [["Dikuasai Saturnus", "planet kerja keras dan tanggung jawab membuat mereka tekun mengejar target jangka panjang."], ["Elemen Tanah", "mereka realistis dan sabar menaiki tangga karier selangkah demi selangkah."]] },
  { k: ["humoris", "lucu", "kocak", "jenaka", "receh"], z: "Sagittarius", a: "dikenal paling humoris dan menyenangkan diajak bercanda, dengan Gemini di urutan berikutnya.",
    why: [["Dikuasai Jupiter", "planet keberuntungan dan optimisme membuat mereka melihat sisi ringan dari banyak hal."], ["Elemen Api", "spontan dan blak-blakan, jadi candaannya mengalir apa adanya."]] },
  { k: ["misterius", "tertutup", "susah ditebak", "sulit ditebak", "rahasia"], z: "Scorpio", a: "adalah zodiak yang paling misterius dan tertutup.",
    why: [["Elemen Air yang dalam", "mereka jarang menunjukkan perasaan sebenarnya sebelum benar-benar percaya."], ["Dikuasai Pluto", "planet yang identik dengan hal tersembunyi dan transformasi."]] },
  { k: ["romantis", "romantisme"], z: "Pisces", a: "dikenal paling romantis, dengan Libra dan Cancer yang juga sangat manis.",
    why: [["Dikuasai Neptunus", "planet mimpi dan imajinasi membuat mereka mencintai dengan penuh fantasi dan perhatian."], ["Elemen Air", "peka dan penyayang, jadi mereka pandai membuat pasangan merasa istimewa."]] },
  { k: ["keras kepala", "ngotot", "bandel"], z: "Taurus", a: "dikenal paling keras kepala.",
    why: [["Elemen Tanah", "teguh dan stabil, jadi sekali sudah yakin, sulit mengubah pendirian mereka."], ["Tanda tetap", "Taurus termasuk tanda fixed yang tidak suka perubahan mendadak."]] },
  { k: ["blak blakan", "blakblakan", "ceplas ceplos", "paling jujur", "terus terang"], z: "Sagittarius", a: "dikenal paling blak-blakan dan jujur apa adanya, dengan Aries yang juga terus terang.",
    why: [["Dikuasai Jupiter", "terbuka dan mencari kebenaran, sehingga kurang suka basa-basi."], ["Elemen Api", "spontan, jadi ucapan kadang keluar sebelum dipikirkan dampaknya."]] },
  { k: ["cuek", "dingin", "tidak peduli", "acuh"], z: "Aquarius", a: "sering terlihat paling cuek dan dingin.",
    why: [["Dikuasai Uranus", "mereka mandiri dan berpikir objektif, sehingga tampak menjaga jarak."], ["Elemen Udara", "lebih nyaman di wilayah ide dan logika dibanding mengekspresikan emosi."]] },
  { k: ["kreatif", "imajinatif", "artistik", "seniman"], z: "Pisces", a: "dikenal paling kreatif dan imajinatif.",
    why: [["Dikuasai Neptunus", "planet seni dan mimpi membuat imajinasinya mengalir deras."], ["Elemen Air", "perasaan yang dalam menjadi bahan bakar untuk karya seni, musik, dan tulisan."]] },
  { k: ["inovatif", "nyentrik", "anti mainstream"], z: "Aquarius", a: "dikenal paling unik dan inovatif.",
    why: [["Dikuasai Uranus", "planet perubahan dan inovasi membuat mereka berpikir di luar kebiasaan."], ["Elemen Udara", "pikirannya terbuka pada ide yang belum umum."]] },
  { k: ["perfeksionis", "teliti", "cerewet"], z: "Virgo", a: "dikenal paling perfeksionis dan teliti.",
    why: [["Dikuasai Merkurius", "pikiran analitis membuat mereka cepat melihat kekurangan sekecil apa pun."], ["Elemen Tanah", "praktis dan ingin semuanya berjalan rapi dan berfungsi dengan baik."]] },
  { k: ["pemimpin", "leader", "jadi bos"], z: "Aries", a: "dikenal sebagai pemimpin alami yang berani memulai, dengan Leo dan Capricorn sebagai pesaing kuat.",
    why: [["Dikuasai Mars", "planet keberanian dan aksi membuat mereka maju lebih dulu."], ["Tanda pertama zodiak", "mereka terbiasa mengambil inisiatif tanpa menunggu aba-aba."]] },
  { k: ["moody", "mood swing", "mood berubah", "suasana hati", "gampang berubah"], z: "Cancer", a: "dikenal paling moody karena suasana hatinya mudah naik turun.",
    why: [["Dikuasai Bulan", "Bulan terus berganti fase, dan emosi Cancer ikut berubah mengikuti pasang surutnya."], ["Elemen Air", "perasaan mengalir dan sangat dipengaruhi lingkungan sekitar."]] },
  { k: ["jatuh cinta", "gampang suka", "mudah suka"], z: "Libra", a: "dikenal paling mudah jatuh cinta, dengan Pisces yang juga cepat terbawa perasaan.",
    why: [["Dikuasai Venus", "planet cinta membuat mereka menyukai keindahan dan hubungan yang harmonis."], ["Elemen Udara", "senang berinteraksi, jadi mudah terpikat pada orang yang nyambung."]] },
  { k: ["sabar", "kesabaran"], z: "Taurus", a: "sering dikaitkan dengan kesabaran paling tinggi, dengan Virgo dan Capricorn yang juga tekun.",
    why: [["Elemen Tanah", "stabil dan terbiasa menikmati proses panjang."], ["Dikuasai Venus", "mereka tenang dan tidak suka keributan."]] },
  { k: ["pintar", "cerdas", "jenius", "genius", "paling pinter"], z: "Gemini", a: "dikenal paling cepat tanggap dan cerdas secara verbal, dengan Aquarius dan Virgo yang kuat dalam analisis.",
    why: [["Dikuasai Merkurius", "planet pikiran dan komunikasi membuat mereka cepat belajar dan menyerap informasi."], ["Elemen Udara", "rasa ingin tahunya luas dan mereka senang bertukar ide."]] },
  { k: ["dramatis", "sombong", "gengsi", "haus perhatian", "cari perhatian"], z: "Leo", a: "sering dianggap paling dramatis dan suka menjadi pusat perhatian.",
    why: [["Dikuasai Matahari", "mereka merasa harus bersinar dan dihargai."], ["Elemen Api", "ekspresif dan penuh gaya, jadi emosinya tampak besar."]] },
  { k: ["pemaaf", "mudah memaafkan", "baik hati", "paling baik"], z: "Pisces", a: "dikenal paling pemaaf dan berhati lembut.",
    why: [["Dikuasai Neptunus", "empati dan welas asih yang tinggi membuat mereka mudah memberi kesempatan kedua."], ["Elemen Air", "mereka peka dan tidak betah menyimpan konflik."]] },
  { k: ["beruntung", "keberuntungan", "hoki"], z: "Sagittarius", a: "sering disebut paling beruntung dalam tradisi astrologi.",
    why: [["Dikuasai Jupiter", "Jupiter adalah planet keberuntungan dan pertumbuhan dalam astrologi."], ["Optimisme", "mereka berani mencoba hal baru, sehingga peluang lebih sering datang."]] },
  { k: ["gampang bosan", "mudah bosan", "cepat bosan", "plin plan"], z: "Gemini", a: "dikenal paling cepat bosan dan sering berubah pikiran.",
    why: [["Dikuasai Merkurius", "pikirannya bergerak cepat dan selalu mencari rangsangan baru."], ["Lambang kembar", "dua sisi dalam dirinya membuat minat dan pendapat mudah bergeser."]] },
  { k: ["peka", "intuitif", "empati", "perasa"], z: "Pisces", a: "dikenal paling peka dan intuitif.",
    why: [["Dikuasai Neptunus", "planet intuisi dan imajinasi membuat mereka mudah membaca perasaan orang lain."], ["Elemen Air", "mereka menyerap suasana hati orang di sekitarnya."]] },
  { k: ["berani", "pemberani", "nekat"], z: "Aries", a: "dikenal paling berani dan nekat.",
    why: [["Dikuasai Mars", "planet perang dan keberanian membuat mereka tidak takut menghadapi tantangan."], ["Elemen Api", "spontan dan bergerak sebelum rasa takut sempat muncul."]] }
];
