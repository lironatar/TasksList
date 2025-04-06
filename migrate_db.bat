@echo off
echo TasksLists Database Migration Tool
echo ================================

if not exist backend\schema_migrations.py (
    echo Error: Migration script not found. Make sure you are in the project root directory.
    exit /b 1
)

if "%1"=="" (
    echo No command specified.
    echo.
    echo Available commands:
    echo   status   - Check current database schema
    echo   run-all  - Run all migrations
    echo   add-cols - Add first_name and last_name columns
    echo   fix-trig - Fix the user trigger function
    echo   update   - Update existing user names
    echo   fix-rls  - Fix RLS policies
    echo.
    echo Example: migrate_db.bat status
    exit /b 1
)

echo.
echo Installing required packages if needed...
pip install python-dotenv supabase

echo.
if "%1"=="status" (
    python backend\schema_migrations.py --status
) else if "%1"=="run-all" (
    python backend\schema_migrations.py --run all
) else if "%1"=="add-cols" (
    python backend\schema_migrations.py --run add_name_columns
) else if "%1"=="fix-trig" (
    python backend\schema_migrations.py --run fix_user_trigger
) else if "%1"=="update" (
    python backend\schema_migrations.py --run update_existing_users
) else if "%1"=="fix-rls" (
    python backend\schema_migrations.py --run fix_rls_policies
) else (
    echo Unknown command: %1
    echo Use 'migrate_db.bat' without arguments to see available commands.
)

echo.
pause 