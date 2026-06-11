@echo off
echo ========================================
echo  StreetOS AI - Mobile App
echo ========================================
echo.
echo Make sure backend ^& AI service are running first!
echo Backend:    http://localhost:5000/health
echo AI Service: http://localhost:8000/health
echo.
echo Starting Expo...
cd /d %~dp0mobile
npx expo start
