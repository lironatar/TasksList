from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.task_models import UserCreate, UserResponse
from app.utils.supabase_client import get_supabase_client
from supabase import Client
from typing import Dict

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@router.post("/register", response_model=Dict)
async def register(user_data: UserCreate, supabase: Client = Depends(get_supabase_client)):
    """
    Register a new user with email, password, and username.
    """
    try:
        # Register user through Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })
        
        # Store additional user data in profiles table
        user_id = auth_response.user.id
        
        # Create user profile with username
        supabase.table("profiles").insert({
            "id": user_id,
            "username": user_data.username,
            "email": user_data.email
        }).execute()
        
        return {"message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), 
                supabase: Client = Depends(get_supabase_client)):
    """
    Authenticate a user and return a JWT token.
    """
    try:
        # Sign in user with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": form_data.username,  # OAuth2 uses 'username' field
            "password": form_data.password
        })
        
        # Return session and user data
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "user": auth_response.user
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme), 
                 supabase: Client = Depends(get_supabase_client)):
    """
    Log out a user by invalidating their session.
    """
    try:
        supabase.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 