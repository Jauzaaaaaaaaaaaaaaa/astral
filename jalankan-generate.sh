#!/usr/bin/env bash
# Generator Tanya-Jawab Astral (macOS / Linux). Jalankan: bash jalankan-generate.sh
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "[!] Node.js belum terpasang. Unduh versi LTS di https://nodejs.org lalu jalankan lagi."
  exit 1
fi

echo "=============================================="
echo " Generator Tanya-Jawab Astral"
echo " Paste GEMINI_API_KEY lalu tekan Enter."
echo " Key tidak disimpan ke file mana pun."
echo "=============================================="
echo
node tools/generate-qa.js
echo
read -n 1 -s -r -p "Selesai. Tekan tombol apa saja untuk menutup."
echo
