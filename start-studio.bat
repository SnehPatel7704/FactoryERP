@echo off
REM Script to start Prisma Studio
REM Usage: start-studio.bat

echo.
echo 🚀 Starting Prisma Studio...
echo.

REM Get the current directory
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0

REM Start Prisma Studio
echo 🗄️  Starting Prisma Studio (port 5555)...
start "Prisma Studio" cmd /k "cd /d %SCRIPT_DIR%backend && npx prisma studio"

echo.
echo ✅ Prisma Studio started!
echo.
echo 📱 Access:
echo   • Prisma Studio:   http://localhost:5555
echo.
echo 💡 Tip: Make sure your Backend is running (port 5000)
echo.
echo ⏹️  To stop, close this terminal window or press Ctrl+C
echo.
timeout /t 3
