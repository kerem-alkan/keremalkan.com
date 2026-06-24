@echo off
chcp 65001 >nul
title keremalkan.com - GitHub'a Gonder
cd /d "%~dp0"
echo keremalkan.com -^> GitHub (main)
git add -A
git commit -m "update: site guncellemeleri" 1>nul 2>nul
git push origin main
if errorlevel 1 ( echo. & echo HATA: push basarisiz. Ilk kez ise acilan pencerede GitHub girisi yap, tekrar calistir. & pause & exit /b )
echo. & echo OK: Gonderildi. Vercel otomatik deploy eder (1-2 dk).
pause
