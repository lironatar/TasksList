#!/bin/bash

echo "Installing required Python packages..."
pip install python-dotenv psycopg2-binary supabase

echo ""
echo "The script will use the .env file in the backend folder."
echo ""
echo "Running database migration..."
python apply_db_migration.py

echo ""
echo "If successful, your database should now have first_name and last_name columns"
echo "instead of the full_name column."
echo ""
read -p "Press Enter to continue..." 