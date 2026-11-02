@echo off
chcp 65001 >nul
title Astral - Generator Acak Tanya-Jawab
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js belum terpasang. Unduh versi LTS di https://nodejs.org lalu jalankan file ini lagi.
  pause
  exit /b 1
)

echo ==============================================
echo  Generator Acak Tanya-Jawab Astral
echo  Membuat pertanyaan dan jawaban acak tentang zodiak
echo  terus-menerus sampai kuota atau saldo Gemini habis.
echo  Tekan Ctrl+C untuk berhenti kapan saja. Progres tersimpan.
echo  Paste GEMINI_API_KEY lalu tekan Enter.
echo  Key tidak disimpan ke file mana pun.
echo ==============================================
echo.
node tools\generate-qa.js --random
echo.
echo Selesai. Tekan tombol apa saja untuk menutup.
pause >nul
