@echo off
echo Installing required dependencies for MySQL backend...
pip install fastapi uvicorn python-dotenv mysql-connector-python pyjwt pydantic email-validator python-multipart
echo.
echo Dependencies installed successfully!
echo.
echo Next steps:
echo 1. Run the setup_local_db.py script to create the database schema:
echo    python backend/setup_local_db.py
echo.
echo 2. Start the backend server:
echo    cd backend
echo    python main.py
echo.
pause 