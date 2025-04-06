from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from routes.auth import get_current_user
from db_config import execute_query

router = APIRouter(prefix="/api/v1/users", tags=["users"])

class ProfileIconUpdate(BaseModel):
    profile_icon: str

# Add migration to create profile_icon column if it doesn't exist
@router.on_event("startup")
async def startup_db_client():
    try:
        # Check if profile_icon column exists in users table
        check_users_query = """
        SELECT COUNT(*) as column_exists
        FROM information_schema.COLUMNS 
        WHERE TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'profile_icon'
        """
        users_result = execute_query(check_users_query)
        
        # Add the column if it doesn't exist
        if users_result and users_result[0]['column_exists'] == 0:
            add_users_query = """
            ALTER TABLE users 
            ADD COLUMN profile_icon TEXT
            """
            execute_query(add_users_query, fetch=False)
            print("Added profile_icon column to users table")
        
        # Check if profile_icon column exists in profiles table
        check_profiles_query = """
        SELECT COUNT(*) as column_exists
        FROM information_schema.COLUMNS 
        WHERE TABLE_NAME = 'profiles' 
        AND COLUMN_NAME = 'profile_icon'
        """
        profiles_result = execute_query(check_profiles_query)
        
        # Add the column if it doesn't exist
        if profiles_result and profiles_result[0]['column_exists'] == 0:
            add_profiles_query = """
            ALTER TABLE profiles 
            ADD COLUMN profile_icon TEXT
            """
            execute_query(add_profiles_query, fetch=False)
            print("Added profile_icon column to profiles table")
            
        print("Ensured profile_icon column exists in users and profiles tables")
    except Exception as e:
        print(f"Error setting up profile_icon column: {str(e)}")

@router.put("/profile-icon")
async def update_profile_icon(data: ProfileIconUpdate, user = Depends(get_current_user)):
    """Update the user's profile icon"""
    try:
        # Update the user's profile icon in both tables
        users_query = """
        UPDATE users 
        SET profile_icon = %s 
        WHERE id = %s
        """
        
        execute_query(users_query, (data.profile_icon, user["id"]), fetch=False)
        
        # Also update profiles table
        profiles_query = """
        UPDATE profiles 
        SET profile_icon = %s 
        WHERE id = %s
        """
        
        execute_query(profiles_query, (data.profile_icon, user["id"]), fetch=False)
        
        return {"message": "Profile icon updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile icon: {str(e)}")

@router.get("/profile")
async def get_profile(user = Depends(get_current_user)):
    """Get the current user's profile information"""
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "profile_icon": user.get("profile_icon", "")
    } 