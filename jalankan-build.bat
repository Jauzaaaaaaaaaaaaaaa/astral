@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js belum terpasang. Unduh versi LTS di https://nodejs.org lalu jalankan lagi.
  pause
  exit /b 1
)
node tools/build-site.js
echo.
pause
