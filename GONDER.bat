@echo off
chcp 65001 >nul
title keremalkan.com - Deploy
cd /d "%~dp0"
echo.
echo   keremalkan.com  --^>  GitHub (main)  --^>  Vercel
echo.
git add -A
git commit -m "update: site" 1>nul 2>nul
git push origin main
if errorlevel 1 (
  echo.
  echo   HATA: push basarisiz. Ilk kez ise acilan pencerede GitHub girisi yap, tekrar calistir.
  pause
  exit /b
)
echo.
echo   OK: Gonderildi. Vercel 1-2 dk icinde www.keremalkan.com'a deploy eder.
pause
