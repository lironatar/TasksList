from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils.supabase_client import get_supabase_client, supabase
from supabase import Client
from typing import Optional
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), 
                          supabase: Client = Depends(get_supabase_client)):
    """
    Dependency to get the current authenticated user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the token with Supabase Auth
        # This will throw an error if the token is invalid
        user = supabase.auth.get_user(token)
        if user is None:
            raise credentials_exception
        return user.user
    except Exception:
        raise credentials_exception 