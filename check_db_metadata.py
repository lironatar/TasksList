import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from backend/.env
load_dotenv('backend/.env')

# Initialize Supabase client with service role key
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY", os.getenv("SUPABASE_KEY"))

if not supabase_url or not supabase_key:
    print("Error: Required Supabase credentials not found in .env file.")
    exit(1)

print(f"Connecting to Supabase at {supabase_url}")
supabase: Client = create_client(supabase_url, supabase_key)

# Check users in auth.users table
print("\n=== Checking auth.users table ===")
try:
    # Get a limited number of users
    response = supabase.table('auth.users').select('id, email, raw_user_meta_data').execute()
    users = response.data if hasattr(response, 'data') else []
    
    if not users:
        print("No users found in auth.users")
    else:
        print(f"Found {len(users)} users")
        for user in users:
            print(f"\nUser ID: {user.get('id')}")
            print(f"Email: {user.get('email')}")
            print(f"Metadata: {user.get('raw_user_meta_data')}")
            
            # Check if firstName/lastName are in metadata
            metadata = user.get('raw_user_meta_data', {})
            firstName = metadata.get('firstName')
            lastName = metadata.get('lastName')
            print(f"firstName in metadata: {firstName is not None}")
            print(f"lastName in metadata: {lastName is not None}")
            
except Exception as e:
    print(f"Error accessing auth.users: {e}")

# Check profiles table
print("\n=== Checking profiles table ===")
try:
    # Get profiles
    response = supabase.from_('profiles').select('id, email, username, first_name, last_name').execute()
    profiles = response.data if hasattr(response, 'data') else []
    
    if not profiles:
        print("No profiles found")
    else:
        print(f"Found {len(profiles)} profiles")
        for profile in profiles:
            print(f"\nProfile ID: {profile.get('id')}")
            print(f"Email: {profile.get('email')}")
            print(f"Username: {profile.get('username')}")
            print(f"First Name: {profile.get('first_name')}")
            print(f"Last Name: {profile.get('last_name')}")
            
            # Check if names are missing
            if profile.get('first_name') is None and profile.get('last_name') is None:
                print("⚠️ ISSUE: Both first_name and last_name are NULL")
            elif profile.get('first_name') is None:
                print("⚠️ ISSUE: first_name is NULL")
            elif profile.get('last_name') is None:
                print("⚠️ ISSUE: last_name is NULL")
                
except Exception as e:
    print(f"Error accessing profiles: {e}")

# Check if trigger function exists
print("\n=== Checking database triggers ===")
try:
    # Check the handle_new_user function
    response = supabase.rpc('get_function_definition', {'function_name': 'handle_new_user'}).execute()
    print("Trigger function definition:", response.data if hasattr(response, 'data') else "Not found")
except Exception as e:
    print(f"Error checking trigger: {e}")
    
# Provide summary and fix recommendations
print("\n=== DIAGNOSIS AND RECOMMENDATIONS ===")
print("If you see NULL values for first_name/last_name in profiles but the metadata exists in auth.users,")
print("here are the recommended fixes:")
print("1. Execute the SQL in supabase_update_trigger.sql in the Supabase SQL Editor")
print("2. Check RLS (Row Level Security) policies to ensure backend can update profiles")
print("3. For quick manual fix for a specific user, run:")
print("   UPDATE public.profiles SET first_name = 'FirstName', last_name = 'LastName' WHERE id = 'user-id';") 