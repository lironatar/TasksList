from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from auth_service import generate_verification_code
from email_service import send_verification_email

router = APIRouter(tags=["verification"])

class EmailRequest(BaseModel):
    email: EmailStr

@router.post("/send-code")
async def send_verification_code(request: EmailRequest):
    """Send a verification code to the user's email"""
    code = generate_verification_code(request.email)
    
    if not code:
        raise HTTPException(status_code=500, detail="Failed to generate verification code")
    
    # Send verification email
    result = await send_verification_email(request.email, code)
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to send verification code")
    
    return {"message": "Verification code sent successfully"} 