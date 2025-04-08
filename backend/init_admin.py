from auth_service import hash_password
from db_config import execute_query
from datetime import datetime
import uuid
import os

def create_admin_user():
    """Create admin user with predefined credentials"""
    
    admin_id = str(uuid.uuid4())
    admin_email = "admin"
    admin_password = "5327158Lir!"  # Should be stored in env variables in production
    admin_password_hash = hash_password(admin_password)
    
    # Check if admin exists
    check_query = "SELECT id FROM users WHERE email = %s"
    result = execute_query(check_query, (admin_email,))
    
    if result:
        print(f"Admin user already exists with ID: {result[0]['id']}")
        return
    
    # Insert admin into users table
    users_query = """
    INSERT INTO users (id, email, password, username, is_verified)
    VALUES (%s, %s, %s, %s, %s)
    """
    
    execute_query(users_query, (admin_id, admin_email, admin_password_hash, "Admin", True), fetch=False)
    
    # Insert admin into profiles table
    profiles_query = """
    INSERT INTO profiles (id, email, username, first_name, last_name, is_verified)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    execute_query(profiles_query, (admin_id, admin_email, "Admin", "System", "Administrator", True), fetch=False)
    
    print(f"Admin user created with ID: {admin_id}")
    print(f"Username: {admin_email}")
    print(f"Password: {admin_password}")

def ensure_profile_icons_table():
    """Create profile_icons table if it doesn't exist"""
    
    profile_icons_query = """
    CREATE TABLE IF NOT EXISTS profile_icons (
        id VARCHAR(36) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(255) NOT NULL, 
        label VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    
    execute_query(profile_icons_query, fetch=False)
    print("Profile icons table created or already exists")
    
def ensure_upload_directory():
    """Create upload directory if it doesn't exist"""
    upload_dir = os.path.join("public", "profile-images")
    os.makedirs(upload_dir, exist_ok=True)
    print(f"Created upload directory: {upload_dir}")

if __name__ == "__main__":
    try:
        print("Initializing admin account and profile icons functionality...")
        create_admin_user()
        ensure_profile_icons_table()
        ensure_upload_directory()
        print("Initialization complete!")
    except Exception as e:
        print(f"Error during initialization: {e}") 