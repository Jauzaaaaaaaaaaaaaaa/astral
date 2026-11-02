#!/usr/bin/env bash
# Membangun ulang halaman situs dari site.config.js. Jalankan: bash jalankan-build.sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "[!] Node.js belum terpasang. Unduh versi LTS di https://nodejs.org lalu jalankan lagi."
  exit 1
fi
node tools/build-site.js
