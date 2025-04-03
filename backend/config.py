import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# Verification Code Settings
VERIFICATION_CODE_LENGTH = 6
VERIFICATION_CODE_EXPIRY_MINUTES = 10
VERIFICATION_CODE_RESEND_COOLDOWN_MINUTES = 2

# JWT Settings
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = 60

# API Settings
API_V1_PREFIX = "/api/v1"
BACKEND_CORS_ORIGINS = [
    "http://localhost:3000",  # React frontend
    "http://localhost:8000",  # FastAPI backend
]

# Task Settings
TASK_PRIORITIES = ["low", "medium", "high"]
TASK_STATUSES = ["pending", "in_progress", "completed"]

# Email Templates
VERIFICATION_EMAIL_SUBJECT = "Your Verification Code"
VERIFICATION_EMAIL_BODY = """
Hello,

Your verification code is: {code}

This code will expire in {expiry_minutes} minutes.

If you didn't request this code, please ignore this email.
"""

# Error Messages
ERROR_MESSAGES = {
    "invalid_credentials": "Invalid email or password",
    "email_not_verified": "Please verify your email first",
    "verification_code_expired": "Verification code has expired",
    "invalid_verification_code": "Invalid verification code",
    "resend_cooldown": "Please wait {minutes} minutes before requesting a new code",
    "email_send_failed": "Failed to send verification email",
    "invalid_url": "Invalid URL provided",
    "database_error": "Database operation failed",
}

# Success Messages
SUCCESS_MESSAGES = {
    "verification_sent": "Verification code sent successfully",
    "verification_complete": "Email verified successfully",
    "login_success": "Logged in successfully",
    "logout_success": "Logged out successfully",
} 