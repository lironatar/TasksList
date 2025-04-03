import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client with service role key
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY", os.getenv("SUPABASE_KEY"))
supabase: Client = create_client(supabase_url, supabase_key)

def create_task_list_function():
    try:
        # Read the SQL file
        with open('database/get_task_lists_with_count.sql', 'r') as file:
            sql = file.read()
        
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print("Task list function created successfully!")
        return result
    except Exception as e:
        print(f"Error creating task list function: {e}")
        return None

if __name__ == "__main__":
    create_task_list_function() 