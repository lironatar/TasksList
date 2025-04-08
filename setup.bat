@echo off
setlocal enabledelayedexpansion

echo === TasksList Application Setup ===
echo This script will install all requirements for both backend and frontend.
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

REM Check if npm is installed
npm --version > nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not installed or not in PATH. Please install npm and try again.
    exit /b 1
)

echo Setting up backend...

REM Create and activate virtual environment
echo Creating Python virtual environment...
cd backend || (
    echo Backend directory not found
    exit /b 1
)

python -m venv venv
if not exist "venv" (
    echo Failed to create virtual environment. Please check your Python installation.
    exit /b 1
)

REM Activate the virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install backend dependencies
echo Installing backend dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Set up database if needed (currently commented out)
REM echo Setting up database...
REM python create_tables.py

REM Deactivate virtual environment
call deactivate

REM Return to the root directory
cd ..

REM Install frontend dependencies
echo Setting up frontend...
cd frontend || (
    echo Frontend directory not found
    exit /b 1
)
echo Installing frontend dependencies...
call npm install

REM Return to the root directory
cd ..

echo.
echo === Setup Complete! ===
echo Here's how to start the application:
echo.
echo Start the backend:
echo cd backend
echo venv\Scripts\activate
echo python -m uvicorn main:app --reload
echo.
echo Start the frontend (in a new terminal window):
echo cd frontend
echo npm start
echo.
echo Enjoy using TasksList!

pause 