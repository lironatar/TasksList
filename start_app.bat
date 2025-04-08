@echo off
setlocal enabledelayedexpansion

echo === Starting TasksList Application ===
echo.

REM Check if Python is installed
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python and try again.
    exit /b 1
)

REM Check if Node.js is installed
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH. Please install Node.js and try again.
    exit /b 1
)

REM Check if the virtual environment exists
if not exist "backend\venv" (
    echo Virtual environment not found. Please run setup.bat first.
    exit /b 1
)

REM Start the backend in a new window
echo Starting backend server...
start cmd /k "cd backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload"

REM Wait for the backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

REM Start the frontend in a new window
echo Starting frontend server...
start cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting in separate windows.
echo.
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo To stop the servers, close their respective command windows.
echo.

echo Application started! The frontend should open automatically in your browser. 