from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets
import os
import shutil
import uuid
import hashlib
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from db_config import execute_query
from auth_service import hash_password

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

# Admin credentials - WARNING: This should be moved to environment variables in production
ADMIN_EMAIL = "admin"
ADMIN_PASSWORD_HASH = hash_password("5327158Lir!")

# Directory for profile images
UPLOAD_DIR = os.path.join("public", "profile-images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Security for admin endpoints
security = HTTPBasic()

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify admin credentials"""
    is_email_correct = credentials.username == ADMIN_EMAIL
    
    # Use passlib to verify the password
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    is_password_correct = pwd_context.verify(credentials.password, ADMIN_PASSWORD_HASH)
    
    if not (is_email_correct and is_password_correct):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True

# Response models
class ProfileIcon(BaseModel):
    id: str
    filename: str
    path: str
    created_at: str

@router.post("/profile-icons", response_model=ProfileIcon)
async def upload_profile_icon(
    file: UploadFile = File(...),
    label: str = Form(...),
    _: bool = Depends(verify_admin)
):
    """Upload a new profile icon (Admin only)"""
    # Validate file type
    valid_content_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in valid_content_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.")
    
    # Generate a unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_id = str(uuid.uuid4())
    unique_filename = f"{unique_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create relative URL path for serving
    relative_path = f"/api/v1/profile-images/{unique_filename}"
    
    # Insert into database
    query = """
    INSERT INTO profile_icons (id, filename, path, label, created_at)
    VALUES (%s, %s, %s, %s, %s)
    """
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Create the table if it doesn't exist
    create_table_query = """
    CREATE TABLE IF NOT EXISTS profile_icons (
        id VARCHAR(36) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(255) NOT NULL,
        label VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    
    execute_query(create_table_query, fetch=False)
    
    # Insert the record
    execute_query(query, (unique_id, unique_filename, relative_path, label, now), fetch=False)
    
    return {
        "id": unique_id,
        "filename": unique_filename,
        "path": relative_path,
        "created_at": now
    }

@router.get("/profile-icons", response_model=List[ProfileIcon])
async def get_profile_icons(_: bool = Depends(verify_admin)):
    """Get all available profile icons (Admin only)"""
    query = """
    SELECT id, filename, path, created_at FROM profile_icons
    ORDER BY created_at DESC
    """
    
    try:
        result = execute_query(query)
        # Convert datetime objects to strings
        for item in result:
            if isinstance(item.get('created_at'), datetime):
                item['created_at'] = item['created_at'].strftime("%Y-%m-%d %H:%M:%S")
        return result
    except Exception as e:
        # Table might not exist yet
        execute_query("""
        CREATE TABLE IF NOT EXISTS profile_icons (
            id VARCHAR(36) PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            path VARCHAR(255) NOT NULL,
            label VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """, fetch=False)
        return []

@router.delete("/profile-icons/{icon_id}")
async def delete_profile_icon(icon_id: str, _: bool = Depends(verify_admin)):
    """Delete a profile icon (Admin only)"""
    # Get the icon first to find the file
    query = """
    SELECT path FROM profile_icons WHERE id = %s
    """
    
    result = execute_query(query, (icon_id,))
    
    if not result:
        raise HTTPException(status_code=404, detail="Icon not found")
    
    # Delete from database
    delete_query = """
    DELETE FROM profile_icons WHERE id = %s
    """
    
    execute_query(delete_query, (icon_id,), fetch=False)
    
    # Delete the file
    try:
        # Get the filename from the path
        relative_path = result[0]["path"]
        filename = os.path.basename(relative_path)
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        # Log but continue
        print(f"Error deleting file: {e}")
    
    return {"message": "Icon deleted successfully"}

# Public endpoint to fetch available profile icons for users
@router.get("/public/profile-icons")
async def get_public_profile_icons():
    """Get all available profile icons (Public)"""
    query = """
    SELECT id, path, label FROM profile_icons
    ORDER BY created_at DESC
    """
    
    try:
        result = execute_query(query)
        return result
    except Exception as e:
        # Table might not exist yet
        return [] 