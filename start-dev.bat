@echo off
echo ========================================
echo  StreetOS AI - Starting Dev Servers
echo ========================================

echo.
echo Starting Redis check...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Redis is not running!
    echo Please start Redis first or update REDIS_URL in backend\.env to use Redis Cloud
    echo.
)

echo.
echo Starting Backend on port 5000...
start "StreetOS Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo.
echo Waiting 3 seconds before starting AI service...
timeout /t 3 /nobreak >nul

echo.
echo Starting AI Service on port 8000...
start "StreetOS AI Service" cmd /k "cd /d %~dp0ai-service && venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo ========================================
echo  Backend:    http://localhost:5000/health
echo  AI Service: http://localhost:8000/health
echo  AI Docs:    http://localhost:8000/docs
echo ========================================
echo.
echo To start the mobile app, open a NEW terminal and run:
echo   cd mobile
echo   npx expo start
echo.
pause
