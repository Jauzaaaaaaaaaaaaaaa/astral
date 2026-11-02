@echo off
chcp 65001 >nul
title Astral - Generator Tanya-Jawab
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js belum terpasang. Unduh versi LTS di https://nodejs.org lalu jalankan file ini lagi.
  pause
  exit /b 1
)

echo ==============================================
echo  Generator Tanya-Jawab Astral
echo  Paste GEMINI_API_KEY lalu tekan Enter.
echo  Key tidak disimpan ke file mana pun.
echo ==============================================
echo.
node tools\generate-qa.js
echo.
echo Selesai. Tekan tombol apa saja untuk menutup.
pause >nul
