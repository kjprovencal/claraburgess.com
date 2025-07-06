@echo off
echo 🚀 Starting Clara's Baby Registry Website Development Servers
echo ==========================================================

echo.
echo 📦 Installing dependencies...

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo 🌐 Starting servers...

REM Start backend in background
echo Starting NestJS backend on port 3001...
cd ..\backend
start "Backend Server" cmd /k "npm run start:dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in background
echo Starting Next.js frontend on port 3000...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting up!
echo.
echo 🌍 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo 📊 Health:   http://localhost:3001/health
echo.
echo Both servers are now running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
