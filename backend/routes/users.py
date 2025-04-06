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
        # Add profile_icon column to users table if it doesn't exist
        query = """
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS profile_icon TEXT;
        """
        execute_query(query, fetch=False)
        
        # Add profile_icon column to profiles table if it doesn't exist
        query = """
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS profile_icon TEXT;
        """
        execute_query(query, fetch=False)
        
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