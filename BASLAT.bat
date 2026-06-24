@echo off
chcp 65001 >nul
title keremalkan.com - Dev
cd /d "%~dp0"
node --version >nul 2>nul || ( echo Node.js gerekli: https://nodejs.org & start "" "https://nodejs.org" & pause & exit /b )
echo [1] Bagimliliklar kuruluyor...
call npm install || ( echo HATA: npm install. & pause & exit /b )
echo [2] Dev sunucusu: http://localhost:3000  (durdurmak icin Ctrl+C)
start "Tarayici" /min cmd /c "timeout /t 7 /nobreak >nul & explorer http://localhost:3000"
call npm run dev
pause
