import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase URL and Key from environment variables
# Using placeholder values for development
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://placeholder-supabase-url.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_client() -> Client:
    """
    Returns the Supabase client instance.
    This function can be used as a dependency in FastAPI.
    """
    return supabase 