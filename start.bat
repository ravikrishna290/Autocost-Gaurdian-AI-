@echo off
echo ==============================================
echo  AutoCost Guardian AI - Start Script
echo ==============================================

echo.
echo [1/2] Starting FastAPI Backend (port 8000)...
start "AutoCost Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting React Frontend (port 5173)...
start "AutoCost Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==============================================
echo  Both servers are starting...
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo ==============================================
echo  Open http://localhost:5173 in your browser!
echo ==============================================

timeout /t 5 /nobreak >nul
start http://localhost:5173
