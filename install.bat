@echo off
echo ========================================
echo  StreetOS AI - Install Dependencies
echo ========================================

echo.
echo [1/3] Installing Backend dependencies...
cd backend
call npm install
cd ..

echo.
echo [2/3] Installing Mobile dependencies...
cd mobile
call npm install
cd ..

echo.
echo [3/3] Installing AI Service dependencies...
cd ai-service
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo.
echo ========================================
echo  All dependencies installed!
echo  Next: Configure your .env files
echo  Then run: start-dev.bat
echo ========================================
pause
