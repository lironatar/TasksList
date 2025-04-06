import os
import argparse
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env
load_dotenv('backend/.env')

# Supabase credentials
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY", os.getenv("SUPABASE_KEY"))

if not supabase_url or not supabase_key:
    print("Error: Required Supabase credentials not found in .env file")
    exit(1)

# Initialize Supabase client
supabase: Client = create_client(supabase_url, supabase_key)

# Migration SQL for each migration
MIGRATIONS = {
    # Add first_name and last_name columns migration
    "add_name_columns": """
        -- Add first_name and last_name columns if they don't exist
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS first_name TEXT,
        ADD COLUMN IF NOT EXISTS last_name TEXT;
    """,
    
    # Fix the trigger function to handle the columns correctly
    "fix_user_trigger": """
        -- Drop the existing trigger
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        
        -- Then drop the function to completely recreate it
        DROP FUNCTION IF EXISTS public.handle_new_user();
        
        -- Create a trigger function to handle new user creation
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER 
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql
        AS $$
        BEGIN
            -- Log the user data to help with debugging
            RAISE LOG 'Creating profile for user %: %', NEW.id, NEW.raw_user_meta_data;
            
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
        EXCEPTION
            WHEN OTHERS THEN
                -- Log any errors
                RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
                RETURN NEW;
        END;
        $$;
        
        -- Recreate the trigger
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    """,
    
    # Extract names from emails for existing users
    "update_existing_users": """
        -- Update profiles that have NULL first_name
        UPDATE public.profiles 
        SET first_name = split_part(email, '@', 1)
        WHERE first_name IS NULL;
    """,
    
    # RLS policies
    "fix_rls_policies": """
        -- Enable RLS on the profiles table if not already enabled
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Drop any conflicting policies
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Service role can create profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Auth service can create/update profiles" ON public.profiles;
        
        -- Allow authenticated users to view their own profile
        CREATE POLICY "Users can view their own profile"
        ON public.profiles
        FOR SELECT
        USING (auth.uid() = id);
        
        -- Allow authenticated users to update their own profile
        CREATE POLICY "Users can update their own profile"
        ON public.profiles
        FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
        
        -- Create a policy to allow the service role and trigger function to create profiles
        CREATE POLICY "Auth service can create/update profiles"
        ON public.profiles
        FOR ALL
        USING (true)
        WITH CHECK (true);
        
        -- Create a policy to allow the frontend registration to create/insert profiles
        CREATE POLICY "New users can create their profile"
        ON public.profiles
        FOR INSERT
        WITH CHECK (auth.uid() = id OR auth.jwt() IS NULL);
    """
}

def run_migration(migration_name):
    """Run a specific migration by name"""
    if migration_name not in MIGRATIONS:
        print(f"Error: Migration '{migration_name}' not found")
        return False
    
    sql = MIGRATIONS[migration_name]
    
    try:
        # Execute the SQL
        print(f"Running migration: {migration_name}")
        response = execute_sql(sql)
        print(f"Migration '{migration_name}' completed successfully")
        return True
    except Exception as e:
        print(f"Error running migration '{migration_name}': {e}")
        return False

def run_all_migrations():
    """Run all migrations in order"""
    success = True
    for name in ["add_name_columns", "fix_user_trigger", "update_existing_users", "fix_rls_policies"]:
        if not run_migration(name):
            success = False
    return success

def execute_sql(sql):
    """Execute SQL via Supabase service role"""
    try:
        # First try direct SQL execution if available
        try:
            response = supabase.rest.sql().execute(sql)
            return response
        except Exception as e:
            # If that doesn't work, try RPC
            print(f"SQL API not available ({e}), trying RPC fallback...")
            response = supabase.rpc('exec_sql', {'sql': sql}).execute()
            return response
    except Exception as e:
        raise Exception(f"Failed to execute SQL: {e}")

def get_migration_status():
    """Check the current status of the database"""
    try:
        # Check if first_name, last_name columns exist
        print("\nChecking database schema...")
        
        sql = """
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles';
        """
        
        response = execute_sql(sql)
        if hasattr(response, 'data'):
            columns = response.data
            print("\nCurrent 'profiles' table columns:")
            for column in columns:
                print(f"  {column.get('column_name')}: {column.get('data_type')}")
        
        # Check existing profiles
        print("\nChecking existing profiles...")
        response = supabase.from_('profiles').select('id, email, first_name, last_name').limit(5).execute()
        profiles = response.data if hasattr(response, 'data') else []
        
        if profiles:
            print(f"\nFound {len(profiles)} profiles (showing first 5):")
            for profile in profiles:
                print(f"  {profile.get('email')}: first_name={profile.get('first_name')}, last_name={profile.get('last_name')}")
                
            # Check for missing names
            missing_names = [p for p in profiles if p.get('first_name') is None]
            if missing_names:
                print(f"\n⚠️ {len(missing_names)} profiles are missing first_name values")
            else:
                print("\n✅ All checked profiles have first_name values")
        else:
            print("No profiles found")
            
    except Exception as e:
        print(f"Error checking migration status: {e}")

def main():
    parser = argparse.ArgumentParser(description='Run database migrations for TasksLists app')
    parser.add_argument('--status', action='store_true', help='Check current migration status')
    parser.add_argument('--run', choices=list(MIGRATIONS.keys()) + ['all'], help='Run specific migration or all')
    
    args = parser.parse_args()
    
    print(f"Connected to Supabase: {supabase_url}")
    
    if args.status:
        get_migration_status()
    elif args.run:
        if args.run == 'all':
            if run_all_migrations():
                print("\n✅ All migrations completed successfully")
            else:
                print("\n❌ Some migrations failed")
        else:
            if run_migration(args.run):
                print("\n✅ Migration completed successfully")
            else:
                print("\n❌ Migration failed")
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 