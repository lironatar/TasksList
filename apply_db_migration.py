import os
import sys
from pathlib import Path

# Default .env file location (backend folder)
DEFAULT_ENV_PATH = Path("backend/.env")

def find_env_file():
    """Try to find the .env file in common locations"""
    possible_locations = [
        DEFAULT_ENV_PATH,  # backend/.env
        Path(".env"),      # .env in current directory
        Path("../.env"),   # .env in parent directory
    ]
    
    for location in possible_locations:
        if location.exists():
            print(f"Found .env file at: {location}")
            return location
            
    print("Warning: .env file not found in common locations.")
    print("Please specify the path to your .env file using --env argument.")
    print("Example: python apply_db_migration.py --env ./backend/.env")
    return None

# Check for command line arguments
env_path = None
for i, arg in enumerate(sys.argv):
    if arg == "--env" and i + 1 < len(sys.argv):
        env_path = Path(sys.argv[i + 1])
        if not env_path.exists():
            print(f"Error: Specified .env file not found at {env_path}")
            sys.exit(1)

# If no path specified via arguments, try to find it
if not env_path:
    env_path = find_env_file()
    if not env_path:
        sys.exit(1)

# Now import dotenv and load from the found path
from dotenv import load_dotenv
import psycopg2
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv(dotenv_path=env_path)

# Get Supabase credentials from environment variables
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
supabase_service_key = os.getenv('SUPABASE_SERVICE_KEY')  # Try to use service key if available
db_url = os.getenv('DATABASE_URL')

if not supabase_url or not (supabase_key or supabase_service_key):
    print("Error: Required Supabase credentials not found in .env file.")
    print(f"Please check your {env_path} file and ensure it contains:")
    print("  SUPABASE_URL=https://your-project-id.supabase.co")
    print("  SUPABASE_KEY=your-anon-key")
    print("  SUPABASE_SERVICE_KEY=your-service-role-key (preferred for migrations)")
    sys.exit(1)

# Use service key if available, otherwise fall back to anon key
supabase_api_key = supabase_service_key or supabase_key

# SQL migration script to update profiles table
migration_sql = """
-- Add first_name and last_name columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Move data from full_name to first/last name if possible
UPDATE public.profiles
SET 
  first_name = split_part(COALESCE(full_name, ''), ' ', 1),
  last_name = substr(COALESCE(full_name, ''), length(split_part(COALESCE(full_name, ''), ' ', 1)) + 2)
WHERE full_name IS NOT NULL;

-- Drop the full_name column
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS full_name;

-- Update the handle_new_user function to use first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        username, 
        first_name, 
        last_name,
        is_verified
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)), 
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'lastName',
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
"""

def apply_migration_via_psycopg2():
    """Apply migration using direct PostgreSQL connection"""
    try:
        print("Connecting to database using PostgreSQL connection...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        
        with conn.cursor() as cursor:
            print("Executing migration SQL...")
            cursor.execute(migration_sql)
            
        print("Migration completed successfully via direct PostgreSQL connection!")
        conn.close()
        return True
    except Exception as e:
        print(f"Error applying migration via PostgreSQL: {e}")
        return False

def apply_migration_via_supabase():
    """Apply migration using Supabase client"""
    try:
        print("Connecting to Supabase...")
        supabase: Client = create_client(supabase_url, supabase_api_key)
        
        print("Executing migration SQL via Supabase REST API...")
        # Try to use the SQL API directly if available
        try:
            response = supabase.rest.sql().execute(migration_sql)
            print("Migration completed successfully via Supabase SQL API!")
            return True
        except Exception as e:
            print(f"Warning: SQL API not available ({e}). Trying RPC fallback...")
            
            # Fall back to an RPC function if SQL API not available
            try:
                response = supabase.rpc('execute_sql', {'sql_query': migration_sql}).execute()
                print("Migration completed successfully via Supabase RPC function!")
                return True
            except Exception as rpc_error:
                print(f"Error with RPC fallback: {rpc_error}")
                return False
    except Exception as e:
        print(f"Error applying migration via Supabase: {e}")
        return False

def main():
    """Main function to apply database migration"""
    print("Starting database migration...")
    print(f"Using Supabase URL: {supabase_url}")
    
    success = False
    
    # Try direct PostgreSQL connection first if available
    if db_url:
        if apply_migration_via_psycopg2():
            success = True
        else:
            print("PostgreSQL connection failed, trying Supabase API...")
    else:
        print("No DATABASE_URL found. Skipping direct PostgreSQL connection.")
    
    # Fall back to Supabase client if PostgreSQL connection fails or not available
    if not success:
        if apply_migration_via_supabase():
            success = True
    
    if not success:
        print("\nAll migration methods failed. Please apply the migration manually using Supabase SQL Editor.")
        print("SQL to execute:")
        print("-------------------")
        print(migration_sql)
        print("-------------------")
        print("\nInstructions:")
        print("1. Go to your Supabase Dashboard")
        print("2. Select your project")
        print("3. Go to SQL Editor")
        print("4. Create a new query")
        print("5. Copy and paste the SQL above")
        print("6. Run the query")
    else:
        print("\nMigration completed successfully!")
        print("Your database schema has been updated to use first_name and last_name fields.")
    
if __name__ == "__main__":
    main() 