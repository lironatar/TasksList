#!/bin/bash

echo "TasksLists Database Migration Tool"
echo "================================"

if [ ! -f backend/schema_migrations.py ]; then
    echo "Error: Migration script not found. Make sure you are in the project root directory."
    exit 1
fi

if [ $# -eq 0 ]; then
    echo "No command specified."
    echo ""
    echo "Available commands:"
    echo "  status   - Check current database schema"
    echo "  run-all  - Run all migrations"
    echo "  add-cols - Add first_name and last_name columns"
    echo "  fix-trig - Fix the user trigger function"
    echo "  update   - Update existing user names"
    echo "  fix-rls  - Fix RLS policies"
    echo ""
    echo "Example: ./migrate_db.sh status"
    exit 1
fi

echo ""
echo "Installing required packages if needed..."
pip install python-dotenv supabase

echo ""
case "$1" in
    status)
        python backend/schema_migrations.py --status
        ;;
    run-all)
        python backend/schema_migrations.py --run all
        ;;
    add-cols)
        python backend/schema_migrations.py --run add_name_columns
        ;;
    fix-trig)
        python backend/schema_migrations.py --run fix_user_trigger
        ;;
    update)
        python backend/schema_migrations.py --run update_existing_users
        ;;
    fix-rls)
        python backend/schema_migrations.py --run fix_rls_policies
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use './migrate_db.sh' without arguments to see available commands."
        ;;
esac

echo ""
read -p "Press Enter to continue..." 