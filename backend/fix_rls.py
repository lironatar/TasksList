import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

# SQL commands to fix RLS policies
sql_commands = """
-- Drop existing policies for verification_codes
DROP POLICY IF EXISTS "Users can insert their own verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Users can view their own verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Users can update their own verification codes" ON verification_codes;

-- Create new policies that allow unauthenticated access for verification
CREATE POLICY "Allow anyone to insert verification codes"
ON verification_codes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anyone to view verification codes"
ON verification_codes FOR SELECT
USING (true);

CREATE POLICY "Allow anyone to update verification codes"
ON verification_codes FOR UPDATE
USING (true)
WITH CHECK (true);

-- Make sure RLS is enabled
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
"""

def fix_rls_policies():
    try:
        # Execute the SQL commands
        result = supabase.rpc('exec_sql', {'sql': sql_commands}).execute()
        print("RLS policies updated successfully!")
        return True
    except Exception as e:
        print(f"Error updating RLS policies: {e}")
        return False

if __name__ == "__main__":
    fix_rls_policies() 