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
print(f"Using key: {supabase_key[:10]}...{supabase_key[-10:]}")
supabase: Client = create_client(supabase_url, supabase_key)

def test_update_profile():
    try:
        # Get all profiles
        print("\nFetching profiles...")
        response = supabase.from_('profiles').select('*').execute()
        profiles = response.data
        
        if not profiles:
            print("No profiles found. Can't test update.")
            return
            
        print(f"Found {len(profiles)} profiles")
        test_profile = profiles[0]
        profile_id = test_profile['id']
        
        print(f"\nSelected profile for testing: {profile_id}")
        print(f"Current values: first_name={test_profile.get('first_name')}, last_name={test_profile.get('last_name')}")
        
        # Prepare test values
        test_first_name = "TestFirstName"
        test_last_name = "TestLastName"
        
        # Test direct update
        print(f"\nAttempting direct update with first_name='{test_first_name}', last_name='{test_last_name}'...")
        update_response = supabase.from_('profiles').update({
            'first_name': test_first_name,
            'last_name': test_last_name
        }).eq('id', profile_id).execute()
        
        print("Update response:")
        print(update_response.data if hasattr(update_response, 'data') else "No data returned")
        
        # Verify the update
        print("\nVerifying update...")
        verify_response = supabase.from_('profiles').select('first_name, last_name').eq('id', profile_id).execute()
        updated_profile = verify_response.data[0] if verify_response.data else None
        
        if updated_profile:
            print(f"Updated values: first_name={updated_profile.get('first_name')}, last_name={updated_profile.get('last_name')}")
            if updated_profile.get('first_name') == test_first_name and updated_profile.get('last_name') == test_last_name:
                print("\n✅ SUCCESS: Profile update worked correctly")
            else:
                print("\n❌ ERROR: Profile was not updated correctly")
        else:
            print("\n❌ ERROR: Could not verify update")
        
    except Exception as e:
        print(f"\n❌ ERROR during test: {e}")

# Test updating a user's profile directly
test_update_profile()

# Also check the policies to see if they might be blocking updates
print("\n=== Checking RLS Policies ===")
try:
    # This requires admin access to the database which might not be available via API
    response = supabase.rpc('get_policies', {'table_name': 'profiles'}).execute()
    print("Policies:", response.data if hasattr(response, 'data') else "Not accessible via API")
except Exception as e:
    print(f"Could not retrieve policies via API: {e}")
    print("You'll need to check policies directly in the Supabase dashboard > Authentication > Policies") 