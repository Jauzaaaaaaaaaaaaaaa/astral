#!/usr/bin/env node
/* Membuat bank tanya-jawab zodiak memakai Gemini, sekali jalan dari terminal.
   Hasilnya disimpan ke assets/js/qa-bank.js sehingga situs menjawab tanpa memanggil AI saat dipakai pengunjung.

   Pakai:
     GEMINI_API_KEY=xxxx node tools/generate-qa.js            (Mac/Linux)
     $env:GEMINI_API_KEY="xxxx"; node tools/generate-qa.js    (Windows PowerShell)
   Atau jalankan tanpa env, nanti diminta memasukkan key.
   Opsi: --per-zodiac 40  --batch 8  --model gemini-2.5-flash  --dry (hanya hitung rencana, tidak memanggil AI)
   Mode acak: --random (terus membuat pertanyaan & jawaban acak sampai kuota habis; opsional --token-limit N, --cycles N, --delay ms)
   Bisa dihentikan (Ctrl+C) lalu dijalankan lagi: progres tersimpan di data/qa-generated.json. */
const fs = require("fs"), path = require("path"), readline = require("readline");
const { SYSTEM_PROMPT } = require("../lib/prompt.js");

const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "data", "qa-generated.json");
const OUT_JS = path.join(ROOT, "assets", "js", "qa-bank.js");
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : true); };
const PER_ZODIAC = +arg("per-zodiac", 40), BATCH = +arg("batch", 8), DRY = !!arg("dry", false), DELAY = +arg("delay", 7000);
let MODEL = arg("model", process.env.GEMINI_MODEL || "");
const BASE = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const ZODIAC = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let usedTokens = 0;

async function getKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const k = await new Promise(r => rl.question("Masukkan GEMINI_API_KEY: ", r)); rl.close();
  return k.trim();
}

/* Ambil daftar model yang tersedia untuk key ini dan pilih Flash terbaru (bukan lite/image/tts). */
async function pickModel(key) {
  const r = await fetch(`${BASE}/models?pageSize=200`, { headers: { "x-goog-api-key": key } });
  if (!r.ok) throw new Error("Tidak bisa mengambil daftar model (HTTP " + r.status + "). Cek API key.");
  const d = await r.json();
  const names = (d.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map(m => m.name.replace(/^models\//, ""))
    .filter(n => /flash/.test(n) && !/lite|image|tts|live|embed|audio|omni/.test(n) && /^gemini-/.test(n));
  if (!names.length) throw new Error("Tidak ada model Gemini Flash yang tersedia untuk key ini.");
  const stable = names.filter(n => /^gemini-[\d.]+-flash$/.test(n));
  const pool = stable.length ? stable : names.filter(n => !/preview|exp/.test(n)).concat(names);
  pool.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  return pool[0];
}

async function gemini(key, system, user) {
  if (!MODEL) {
    MODEL = await pickModel(key);
    console.log(`Model dipakai: ${MODEL}`);
  }
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await fetch(`${BASE}/models/${MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json", maxOutputTokens: 8192 }
        })
      });
      if (r.status === 404 && !process.env.GEMINI_MODEL && !arg("model", false)) {
        console.log(`Model ${MODEL} tidak ditemukan, mencari model lain...`);
        MODEL = await pickModel(key);
        console.log(`Model dipakai: ${MODEL}`);
        attempt--; continue;
      }
      if (r.status === 400 || r.status === 401 || r.status === 403 || r.status === 404) {
        throw Object.assign(new Error(`Gemini menolak permintaan (HTTP ${r.status}). Cek API key dan nama model "${MODEL}".`), { fatal: true });
      }
      if (r.status === 429) {
        const body = await r.text().catch(() => "");
        if (/PerDay|per ?day|daily|prepayment|credits? (are |is )?depleted|insufficient_quota/i.test(body))
          throw Object.assign(new Error("kuota harian atau saldo/token API sudah habis"), { stop: true });
        throw Object.assign(new Error("HTTP 429 (batas per menit tercapai)"), { quota: true });
      }
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      usedTokens += (d.usageMetadata && d.usageMetadata.totalTokenCount) || 0;
      const parts = (((d.candidates || [])[0] || {}).content || {}).parts || [];
      return JSON.parse(parts.map(p => p.text || "").join(""));
    } catch (e) {
      if (e.stop || e.fatal || attempt === 5) throw e;
      const wait = e.quota ? 60000 * attempt : 2000 * 2 ** attempt;
      console.log(`  ! ${e.message}, coba lagi dalam ${wait / 1000} dtk`);
      await sleep(wait);
    }
  }
}

const TOPICS = [
  "kebiasaan saat gabut", "apa yang dilakukan saat sendirian di rumah", "gaya tidur", "kebiasaan saat bangun tidur",
  "reaksi saat dapat kejutan", "cara ngambek", "cara menghadapi saat lagi stres", "gaya chatting dan emoji favorit",
  "lagu yang cocok didengarkan", "film dan genre favorit", "game yang disukai", "hewan peliharaan yang cocok",
  "kalau jadi hewan apa", "kalau jadi superhero", "kalau jadi karakter film", "kalau menang lotre",
  "kalau dapat waktu libur seminggu bebas", "kalau reuni sekolah", "kalau ikut lomba", "gaya belajar",
  "gaya bekerja di kantor", "kalau jadi bos", "kalau jadi guru", "kalau jadi chef", "kalau jadi detektif",
  "kebiasaan belanja", "barang yang selalu dibawa", "hobi tersembunyi", "ketakutan terbesar", "impian masa kecil",
  "kelemahan yang lucu", "sifat paling menyebalkan", "sifat yang bikin nyaman", "tipe sahabat yang cocok",
  "tipe pasangan romantis", "cara menyatakan perasaan", "cara menghadapi konflik", "saat patah hati",
  "saat ulang tahun", "hadiah yang disukai", "warna favorit", "angka keberuntungan", "bunga favorit",
  "batu permata", "minuman saat hujan", "jajanan sore", "makanan saat begadang", "tempat nongkrong",
  "kota impian untuk liburan", "gaya berpakaian sehari-hari", "parfum yang cocok", "gaya rambut",
  "olahraga yang disukai", "cara menghilangkan stres", "kebiasaan pamer", "kebiasaan overthinking",
  "kalau dikasih uang satu miliar", "cara mengatur keuangan", "investasi yang cocok", "jurusan kuliah yang cocok",
  "profesi impian", "cara bangun pagi", "gaya saat mengemudi", "kalau jadi musuh di film", "dialog atau quote favorit"
];
const STYLES = [
  "santai seperti orang mengetik di kolom pencarian", "lucu dan sedikit nyeleneh", "sangat pendek, 3 sampai 6 kata",
  "lengkap, 8 sampai 14 kata", "seperti curhat ringan", "iseng seperti bertanya ke teman"
];
const pick = a => a[Math.floor(Math.random() * a.length)];

/* Membuat pertanyaan baru dengan tema acak. Hanya pertanyaan yang menyebut nama zodiak yang diterima. */
async function genRandomQuestions(key, st, cycle) {
  const have = new Set(st.questions.map(normQ));
  const topic = pick(TOPICS), style = pick(STYLES);
  console.log(`Putaran ${cycle}: tema "${topic}" (${style})`);
  const prompt = `Buat 25 pertanyaan singkat yang realistis dari pengguna Indonesia tentang zodiak, dengan tema: ${topic}. Gaya bahasa: ${style}. Setiap pertanyaan WAJIB menyebut salah satu nama zodiak ini: ${ZODIAC.join(", ")}. Pakai nama zodiak yang berbeda-beda, jangan semuanya sama. Kembalikan JSON array berisi string saja.`;
  let res;
  try {
    res = await gemini(key, "Kamu membantu membuat daftar pertanyaan uji untuk fitur Tanya-Jawab zodiak. Jawab hanya dengan JSON.", prompt);
  } catch (e) {
    if (e.stop) throw e;
    console.log("  ! gagal membuat pertanyaan, dilewati: " + e.message);
    return 0;
  }
  let added = 0;
  for (const x of Array.isArray(res) ? res : []) {
    const t = String(x).trim();
    if (t.length < 6 || t.length > 120) continue;
    if (!ZODIAC.some(z => t.toLowerCase().includes(z.toLowerCase()))) continue;
    if (have.has(normQ(t))) continue;
    have.add(normQ(t)); st.questions.push(t); added++;
  }
  save(st);
  console.log(`  +${added} pertanyaan baru (total ${st.questions.length})`);
  await sleep(DELAY);
  return added;
}

/* Mode --random: jawab yang tertunda dulu, lalu terus membuat pertanyaan dan jawaban baru
   sampai kuota/saldo habis, batas --token-limit tercapai, atau --cycles selesai. */
async function randomLoop(key, st) {
  const LIMIT = +arg("token-limit", 0), CYCLES = +arg("cycles", 0);
  console.log("Mode acak: menjawab yang tertunda dulu, lalu membuat pertanyaan baru terus-menerus.");
  if (LIMIT) console.log(`Batas token: ${LIMIT}`);
  if (CYCLES) console.log(`Batas putaran: ${CYCLES}`);
  try {
    await genAnswers(key, st);
    let empty = 0;
    for (let c = 1; !CYCLES || c <= CYCLES; c++) {
      if (LIMIT && usedTokens >= LIMIT) { console.log("Batas token tercapai."); break; }
      const added = await genRandomQuestions(key, st, c);
      empty = added ? 0 : empty + 1;
      if (empty >= 5) { console.log("5 putaran berturut-turut tanpa pertanyaan baru. Berhenti."); break; }
      await genAnswers(key, st);
    }
  } finally {
    writeBank(st);
  }
}

const load = () => { try { return JSON.parse(fs.readFileSync(OUT_JSON, "utf8")); } catch { return { questions: [], answers: [] }; } };
const save = st => { fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true }); fs.writeFileSync(OUT_JSON, JSON.stringify(st, null, 1)); };
const normQ = q => q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

function validAnswer(a) {
  if (typeof a !== "string" || a.length < 40 || a.length > 1200) return false;
  if (/^(tentu|berikut|sebagai ai)/i.test(a.trim())) return false;
  return true;
}

async function genQuestions(key, st) {
  const have = new Set(st.questions.map(normQ));
  const add = qs => { for (const q of qs) { const t = String(q).trim(); if (t.length > 5 && t.length < 120 && !have.has(normQ(t))) { have.add(normQ(t)); st.questions.push(t); } } };

  // 1. Semua pasangan zodiak (66)
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) add([`kecocokan ${ZODIAC[i]} dan ${ZODIAC[j]}`]);
  save(st);

  // 2. Pertanyaan per zodiak
  for (const z of ZODIAC) {
    const have_z = st.questions.filter(q => !/^kecocokan \w+ dan \w+$/.test(q) && q.toLowerCase().includes(z.toLowerCase())).length;
    if (have_z >= PER_ZODIAC) continue;
    console.log(`Membuat pertanyaan untuk ${z}...`);
    const prompt = `Buat ${PER_ZODIAC} pertanyaan singkat yang realistis dari pengguna Indonesia tentang zodiak ${z}. Variasikan: sifat, kelebihan, kekurangan, makanan, minuman, tempat liburan, gaya berpakaian, hobi, cinta, pasangan ideal, persahabatan, karier, pekerjaan ideal, keuangan, cara kerja, kebiasaan, warna, kota yang cocok. Gaya santai seperti orang mengetik di kolom pencarian (contoh: "makanan kesukaan ${z}"). Setiap pertanyaan harus menyebut ${z}. Kembalikan JSON array berisi string saja.`;
    add(await gemini(key, "Kamu membantu membuat daftar pertanyaan uji untuk fitur Tanya-Jawab zodiak. Jawab hanya dengan JSON.", prompt));
    save(st); await sleep(DELAY);
  }

  // 3. Pertanyaan "zodiak paling ..."
  const have_s = st.questions.filter(q => /paling/i.test(q) && !ZODIAC.some(z => q.includes(z))).length;
  if (have_s < 80) {
    console.log("Membuat pertanyaan 'zodiak paling ...'...");
    const prompt = `Buat 100 pertanyaan singkat bergaya orang Indonesia berbentuk "zodiak apa yang paling ..." atau "zodiak paling ..." tentang berbagai sifat dan kebiasaan (sentimental, pendendam, overthinking, boros, pelit, romantis, cuek, humoris, ambisius, pemalas, dan banyak lagi yang lain). Jangan menyebut nama zodiak di pertanyaan. Kembalikan JSON array berisi string saja.`;
    add(await gemini(key, "Kamu membantu membuat daftar pertanyaan uji untuk fitur Tanya-Jawab zodiak. Jawab hanya dengan JSON.", prompt));
    save(st);
  }
}

async function genAnswers(key, st) {
  const done = new Set(st.answers.map(a => normQ(a.q)));
  const todo = st.questions.filter(q => !done.has(normQ(q)));
  console.log(`Pertanyaan: ${st.questions.length} | sudah dijawab: ${st.answers.length} | tersisa: ${todo.length}`);
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    const prompt = `Jawab setiap pertanyaan berikut mengikuti SEMUA aturan penulisan dan contoh di instruksi sistem. Kembalikan JSON array berisi objek {"q": "<pertanyaan persis seperti diberikan>", "a": "<jawaban>"} dengan urutan sama. Gunakan karakter \\n untuk baris baru di dalam jawaban.\n\nPertanyaan:\n` + batch.map((q, n) => `${n + 1}. ${q}`).join("\n");
    const res = await gemini(key, SYSTEM_PROMPT, prompt);
    let ok = 0;
    for (const item of Array.isArray(res) ? res : []) {
      const q = batch.find(b => normQ(b) === normQ(String(item.q || "")));
      if (q && validAnswer(item.a)) { st.answers.push({ q, a: item.a.trim() }); ok++; }
    }
    save(st); writeBank(st);
    console.log(`  batch ${i / BATCH + 1}/${Math.ceil(todo.length / BATCH)}: ${ok}/${batch.length} valid | total token: ${usedTokens}`);
    await sleep(DELAY);
  }
}

function writeBank(st) {
  const bank = st.answers.map(x => ({ q: x.q, a: x.a }));
  fs.writeFileSync(OUT_JS, `/* Dibuat otomatis oleh tools/generate-qa.js. Jangan diedit manual. */\nwindow.QABANK = ${JSON.stringify(bank)};\n`);
  console.log(`Tersimpan: ${bank.length} tanya-jawab ditulis ke assets/js/qa-bank.js (token terpakai: ${usedTokens})`);
}

(async () => {
  const st = load();
  if (DRY) {
    const calls = Math.ceil((12 * PER_ZODIAC + 66 + 100) / BATCH) + 13;
    console.log(`Rencana: sekitar ${12 * PER_ZODIAC + 66 + 100} pertanyaan, sekitar ${calls} panggilan (model dipilih otomatis saat dijalankan). Tidak ada panggilan dilakukan (--dry).`);
    return;
  }
  if (arg("export", false)) { writeBank(st); console.log("Ekspor dari progres yang ada, tanpa memanggil AI."); return; }
  const key = await getKey();
  if (!key) { console.error("API key kosong."); process.exit(1); }
  if (arg("random", false)) { await randomLoop(key, st); return; }
  await genQuestions(key, st);
  await genAnswers(key, st);
  writeBank(st);
})().catch(e => {
  if (e.stop) {
    console.log(`\nBerhenti: ${e.message}.`);
    console.log("Progres dan qa-bank.js sudah tersimpan. Jalankan lagi nanti setelah kuota atau saldo tersedia.");
    process.exit(0);
  }
  console.error("\nGagal:", e.message, "\nProgres tersimpan; jalankan lagi untuk melanjutkan.");
  process.exit(1);
});
