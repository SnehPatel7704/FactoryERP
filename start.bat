@echo off
REM Script to start Backend, Frontend, and Prisma Studio
REM Usage: start.bat

echo.
echo 🚀 Starting FeatheraFine Development Environment...
echo.

REM Get the current directory
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0

REM Start Backend
echo 📦 Starting Backend (port 5000)...
start "Backend" cmd /k "cd /d %SCRIPT_DIR%backend && npm run dev"
timeout /t 2 /nobreak

REM Start Frontend
echo ⚛️  Starting Frontend (port 5173)...
start "Frontend" cmd /k "cd /d %SCRIPT_DIR%frontend && npm run dev"

echo.
echo ✅ Backend and Frontend started!
echo.
echo 📱 Services:
echo   • Frontend:        http://localhost:5173
echo   • Backend API:     http://localhost:5000
echo.
echo 💡 To also start Prisma Studio, run:
echo    start-studio.bat
echo.
echo 📝 Check the terminal windows for any errors or logs
echo.
timeout /t 3
