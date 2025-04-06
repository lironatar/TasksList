from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from routes.auth import get_current_user
from db_config import execute_query

router = APIRouter(prefix="/api/v1/users", tags=["users"])

class ProfileIconUpdate(BaseModel):
    profile_icon: str

@router.put("/profile-icon")
async def update_profile_icon(data: ProfileIconUpdate, user = Depends(get_current_user)):
    """Update the user's profile icon"""
    try:
        # Update the user's profile icon in the database
        query = """
        UPDATE users 
        SET profile_icon = %s 
        WHERE id = %s
        """
        
        execute_query(query, (data.profile_icon, user["id"]), fetch=False)
        
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
        "profile_icon": user["profile_icon"]
    } 