/* Endpoint Tanya-Jawab berbasis AI (Gemini). Jalan sebagai Vercel Serverless Function.
   API key HANYA dibaca dari environment variable di server, tidak pernah dikirim ke browser.
   Env: GEMINI_API_KEY (wajib), GEMINI_MODEL (opsional, default gemini-2.5-flash). */

const { SYSTEM_PROMPT } = require("../lib/prompt.js");

const MAX_Q = 300;
const hits = new Map(); // pembatas sederhana per IP (per instance server)

function limited(ip) {
  const now = Date.now(), win = 60_000, max = 12;
  const arr = (hits.get(ip) || []).filter(t => now - t < win);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "AI belum dikonfigurasi" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (limited(ip)) return res.status(429).json({ error: "Terlalu banyak permintaan, coba lagi sebentar." });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const question = String((body && body.question) || "").trim().slice(0, MAX_Q);
  if (!question) return res.status(400).json({ error: "Pertanyaan kosong" });

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
      })
    });
    if (!r.ok) return res.status(502).json({ error: "Layanan AI sedang bermasalah" });
    const data = await r.json();
    const text = (((data.candidates || [])[0] || {}).content || {}).parts;
    const out = Array.isArray(text) ? text.map(p => p.text || "").join("").trim() : "";
    if (!out) return res.status(502).json({ error: "Jawaban kosong" });
    return res.status(200).json({ text: out });
  } catch {
    return res.status(502).json({ error: "Gagal menghubungi layanan AI" });
  }
};
