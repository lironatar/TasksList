from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from typing import Optional
from auth_service import register_user, login_user, verify_token, verify_code, get_user, generate_verification_code
from email_service import send_verification_email
import uuid
import random
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import os
from db_config import execute_query

# Create router
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# OAuth2 scheme for bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Available profile icons
PROFILE_ICONS = [
    "https://img.icons8.com/color/96/user-male-circle--v1.png",
    "https://img.icons8.com/color/96/user-female-circle--v1.png",
    "https://img.icons8.com/fluency/96/user-male-circle.png",
    "https://img.icons8.com/fluency/96/user-female-circle.png",
    "https://img.icons8.com/bubbles/100/user-male.png",
    "https://img.icons8.com/bubbles/100/user-female.png",
    "https://img.icons8.com/emoji/96/person-superhero.png",
    "https://img.icons8.com/emoji/96/detective.png"
]

def get_random_profile_icon():
    """Return a random profile icon from the available options"""
    return random.choice(PROFILE_ICONS)

# Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyRequest(BaseModel):
    email: EmailStr
    code: str

class UpdateProfileIcon(BaseModel):
    profile_icon: str

# Dependency to get current user
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        print(f"Authorization header: {authorization}")
        token = authorization.split("Bearer ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        # Try a safer query first without the profile_icon column
        try:
            query = """
            SELECT u.id, u.email, u.username, u.raw_user_meta_data, p.is_verified, 
                p.first_name, p.last_name
            FROM users u
            JOIN profiles p ON u.id = p.id
            WHERE u.id = %s
            """
            
            result = execute_query(query, (user_id,))
            
            if not result:
                raise HTTPException(status_code=401, detail="User not found")
            
            user = result[0]
            
            # Check if user is verified using the correct column name from profiles table
            if not user.get("is_verified", False):
                raise HTTPException(status_code=401, detail="Email not verified")
            
            # Get first name from profiles directly if available
            first_name = user.get('first_name', '')
            last_name = user.get('last_name', '')

            # If not available, try to get from metadata
            if (not first_name or not last_name) and user.get('raw_user_meta_data'):
                try:
                    import json
                    if isinstance(user['raw_user_meta_data'], str):
                        metadata = json.loads(user['raw_user_meta_data'])
                        if not first_name and metadata.get('firstName'):
                            first_name = str(metadata.get('firstName')).encode('ascii', 'ignore').decode('ascii')
                        if not last_name and metadata.get('lastName'):
                            last_name = str(metadata.get('lastName')).encode('ascii', 'ignore').decode('ascii')
                except Exception as e:
                    print(f"Error parsing user metadata: {e}")
            
            # Combine first and last name
            user_name = f"{first_name} {last_name}".strip() or user.get('username', '')
            
            # Try to get profile_icon with a separate query if needed
            profile_icon = ""
            try:
                # Try to get from users table first
                icon_query = "SELECT profile_icon FROM users WHERE id = %s"
                icon_result = execute_query(icon_query, (user_id,))
                if icon_result and icon_result[0].get('profile_icon'):
                    profile_icon = icon_result[0]['profile_icon']
                else:
                    # Try profiles table as fallback
                    icon_query = "SELECT profile_icon FROM profiles WHERE id = %s"
                    icon_result = execute_query(icon_query, (user_id,))
                    if icon_result and icon_result[0].get('profile_icon'):
                        profile_icon = icon_result[0]['profile_icon']
            except Exception as e:
                print(f"Couldn't get profile icon, probably column doesn't exist yet: {e}")
            
            return {
                "id": user["id"],
                "email": user["email"],
                "name": user_name,
                "first_name": first_name,
                "profile_icon": profile_icon
            }
            
        except Exception as e:
            print(f"Error with main query: {e}")
            # Fallback to basic query without profile_icon
            query = """
            SELECT u.id, u.email, u.username, p.is_verified
            FROM users u
            JOIN profiles p ON u.id = p.id
            WHERE u.id = %s
            """
            
            result = execute_query(query, (user_id,))
            
            if not result:
                raise HTTPException(status_code=401, detail="User not found")
            
            user = result[0]
            
            # Check if user is verified
            if not user.get("is_verified", False):
                raise HTTPException(status_code=401, detail="Email not verified")
            
            return {
                "id": user["id"],
                "email": user["email"],
                "name": user.get("username", ""),
                "profile_icon": ""
            }
            
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# Routes
@router.post("/register")
async def register(user: RegisterRequest):
    """Register a new user"""
    # Check if email already exists
    query = """
    SELECT email FROM users WHERE email = %s
    """
    
    result = execute_query(query, (user.email,))
    
    if result:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password with our helper function
    hashed_password = get_password_hash(user.password)
    
    # Generate verification code
    verification_code = str(random.randint(100000, 999999))
    verification_code_expires = datetime.utcnow() + timedelta(hours=24)
    
    # Create username from email if not provided
    username = user.email.split('@')[0]
    
    # Create user metadata
    user_metadata = {
        "firstName": user.firstName,
        "lastName": user.lastName
    }
    
    # Convert to JSON string
    import json
    user_metadata_json = json.dumps(user_metadata)
    
    # Insert user into database
    user_id = str(uuid.uuid4())
    
    # Insert into users table
    query = """
    INSERT INTO users (id, email, password, username, raw_user_meta_data)
    VALUES (%s, %s, %s, %s, %s)
    """
    
    execute_query(query, (
        user_id, 
        user.email, 
        hashed_password, 
        username, 
        user_metadata_json
    ), fetch=False)
    
    # Also insert into profiles table
    profile_query = """
    INSERT INTO profiles (id, email, username, first_name, last_name, is_verified)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    execute_query(profile_query, (
        user_id,
        user.email,
        username,
        user.firstName,
        user.lastName,
        False
    ), fetch=False)
    
    # Insert verification code
    query = """
    INSERT INTO verification_codes (email, code, expires_at)
    VALUES (%s, %s, %s)
    """
    
    execute_query(query, (user.email, verification_code, verification_code_expires), fetch=False)
    
    # Send verification email
    await send_verification_email(user.email, verification_code)
    
    return {"message": "User registered successfully. Please check your email for verification code."}

@router.post("/login")
async def login(request: LoginRequest):
    """Login a user"""
    result = login_user(request.email, request.password)
    
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return result

@router.post("/verify")
async def verify(request: VerifyRequest):
    """Verify an email verification code or request a new one if code is empty"""
    # If code is empty, generate and send a new verification code
    if not request.code:
        try:
            # Generate verification code
            verification_code = str(random.randint(100000, 999999))
            verification_code_expires = datetime.utcnow() + timedelta(hours=24)
            
            # Insert verification code
            query = """
            INSERT INTO verification_codes (email, code, expires_at)
            VALUES (%s, %s, %s)
            """
            
            execute_query(query, (request.email, verification_code, verification_code_expires), fetch=False)
            
            # Send verification email
            await send_verification_email(request.email, verification_code)
            
            return {"message": "Verification code sent"}
        except Exception as e:
            print(f"Error sending verification code: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to send verification code: {str(e)}")
    
    # Otherwise, verify the code using the auth_service function
    from auth_service import verify_code
    
    result = verify_code(request.email, request.code)
    
    if not result:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    return {"message": "Email verified successfully"}

@router.get("/me")
async def get_me(user = Depends(get_current_user)):
    """Get the current user's profile"""
    return user

@router.post("/logout")
async def logout():
    """Logout a user (client-side only)"""
    return {"message": "Logged out successfully"}

def verify_password(plain_password, hashed_password):
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hash a password"""
    return pwd_context.hash(password) 