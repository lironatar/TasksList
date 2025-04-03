from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client
from datetime import datetime, timedelta, timezone
import os
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel
from config import (
    SUPABASE_URL, SUPABASE_KEY,
    SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD,
    VERIFICATION_CODE_EXPIRY_MINUTES, VERIFICATION_CODE_RESEND_COOLDOWN_MINUTES,
    VERIFICATION_EMAIL_SUBJECT, VERIFICATION_EMAIL_BODY,
    ERROR_MESSAGES, SUCCESS_MESSAGES
)
import random
import uuid

router = APIRouter()

# Initialize Supabase client with anon key for auth operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Supabase admin client for database operations
# This bypasses RLS policies
supabase_admin: Client = create_client(
    SUPABASE_URL, 
    os.getenv("SUPABASE_SERVICE_KEY", SUPABASE_KEY)
)

class EmailRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

def send_verification_email(email: str, code: str):
    msg = MIMEMultipart()
    msg['From'] = SMTP_USERNAME
    msg['To'] = email
    msg['Subject'] = VERIFICATION_EMAIL_SUBJECT
    
    body = VERIFICATION_EMAIL_BODY.format(
        code=code,
        expiry_minutes=VERIFICATION_CODE_EXPIRY_MINUTES
    )
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail=ERROR_MESSAGES["email_send_failed"])

@router.post("/send-code")
async def send_verification_code(request: EmailRequest):
    try:
        # Generate a 6-digit code directly in Python
        code = str(random.randint(100000, 999999))
        
        # Set expiration time - make it timezone-aware
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=VERIFICATION_CODE_EXPIRY_MINUTES)
        
        # Store the code in the database using admin client to bypass RLS
        data = {
            "email": request.email,
            "code": code,
            "expires_at": expires_at.isoformat()
        }
        
        supabase_admin.table('verification_codes').insert(data).execute()
        
        # Check if a profile exists for this email
        profile_result = supabase_admin.table('profiles')\
            .select('id')\
            .eq('email', request.email)\
            .execute()
        
        if not profile_result.data or len(profile_result.data) == 0:
            print(f"No profile found for email: {request.email}")
            # Check if user exists in auth.users
            try:
                # Get user by email - do this through auth API
                users = supabase_admin.auth.admin.list_users()
                user = next((u for u in users if u.email == request.email), None)
                
                if user:
                    # User exists in auth.users but no profile
                    try:
                        # Create the profile
                        profile_data = {
                            "id": user.id,
                            "email": request.email,
                            "username": user.user_metadata.get('username', f"user_{user.id[:8]}"),
                            "is_verified": False,
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                        
                        supabase_admin.table('profiles').insert(profile_data).execute()
                        print(f"Created profile for existing user with ID {user.id}")
                    except Exception as e:
                        print(f"Error creating profile for existing user: {e}")
            except Exception as e:
                print(f"Error checking for user in auth.users: {e}")
        
        # Send the code via email
        send_verification_email(request.email, code)
        
        return {"message": SUCCESS_MESSAGES["verification_sent"]}
    except Exception as e:
        print(f"Error in send_verification_code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-code")
async def verify_code(request: VerifyCodeRequest):
    try:
        # Get the latest verification code for the email using admin client
        result = supabase_admin.table('verification_codes')\
            .select('*')\
            .eq('email', request.email)\
            .eq('is_used', False)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail=ERROR_MESSAGES["invalid_verification_code"])
        
        verification = result.data[0]
        
        # Check if code is expired - Fix datetime comparison issue
        # Make sure both datetimes are timezone-aware
        expires_at = datetime.fromisoformat(verification['expires_at'].replace('Z', '+00:00'))
        current_time = datetime.now(timezone.utc)
        
        if expires_at < current_time:
            raise HTTPException(status_code=400, detail=ERROR_MESSAGES["verification_code_expired"])
        
        # Check if code matches
        if verification['code'] != request.code:
            raise HTTPException(status_code=400, detail=ERROR_MESSAGES["invalid_verification_code"])
        
        # Mark code as used using admin client
        supabase_admin.table('verification_codes')\
            .update({"is_used": True})\
            .eq('id', verification['id'])\
            .execute()
        
        # Find the user profile by email and update is_verified to true
        try:
            # Find the profile by email
            profile_result = supabase_admin.table('profiles')\
                .select('id')\
                .eq('email', request.email)\
                .execute()
            
            if profile_result.data and len(profile_result.data) > 0:
                # Profile exists, update it
                user_id = profile_result.data[0]['id']
                supabase_admin.table('profiles')\
                    .update({
                        "is_verified": True,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    })\
                    .eq('id', user_id)\
                    .execute()
                print(f"Updated profile {user_id} to verified")
            else:
                # Profile doesn't exist for this email
                # This can happen if the user verification is done before registration completes fully
                # Return a specific message advising the user
                print(f"No profile found for email: {request.email}")
                return {"message": "Email verified! Please complete your registration or login now."}
        except Exception as profile_error:
            print(f"Error finding/updating profile: {profile_error}")
            # Continue even if we can't find/update the profile
        
        return {"message": SUCCESS_MESSAGES["verification_complete"]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in verify_code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resend-code")
async def resend_code(request: EmailRequest):
    try:
        # Check if there's a recent code using admin client
        recent_code = supabase_admin.table('verification_codes')\
            .select('*')\
            .eq('email', request.email)\
            .eq('is_used', False)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if recent_code.data:
            # Fix datetime comparison issue - make both timezone-aware
            last_code_time = datetime.fromisoformat(recent_code.data[0]['created_at'].replace('Z', '+00:00'))
            current_time = datetime.now(timezone.utc)
            
            if current_time - last_code_time < timedelta(minutes=VERIFICATION_CODE_RESEND_COOLDOWN_MINUTES):
                raise HTTPException(
                    status_code=400,
                    detail=ERROR_MESSAGES["resend_cooldown"].format(
                        minutes=VERIFICATION_CODE_RESEND_COOLDOWN_MINUTES
                    )
                )
        
        # Generate a new 6-digit code directly in Python
        code = str(random.randint(100000, 999999))
        
        # Set expiration time - make it timezone-aware
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=VERIFICATION_CODE_EXPIRY_MINUTES)
        
        # Store the code in the database using admin client
        data = {
            "email": request.email,
            "code": code,
            "expires_at": expires_at.isoformat()
        }
        
        supabase_admin.table('verification_codes').insert(data).execute()
        
        # Send the code via email
        send_verification_email(request.email, code)
        
        return {"message": SUCCESS_MESSAGES["verification_sent"]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in resend_code: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 