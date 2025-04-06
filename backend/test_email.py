import asyncio
import sys
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv('.env')

# Print env vars for debugging
print("Environment variables:")
print(f"SMTP_USERNAME: {os.getenv('SMTP_USERNAME')}")
print(f"SMTP_PASSWORD length: {len(os.getenv('SMTP_PASSWORD', ''))}")
print(f"SMTP_HOST: {os.getenv('SMTP_HOST')}")
print(f"SMTP_PORT: {os.getenv('SMTP_PORT')}")
print(f"SMTP_FROM: {os.getenv('SMTP_FROM')}")

# Now import the email service
from email_service import send_verification_email

async def test_email():
    # Default test email and code
    email = "lironatar94@gmail.com"  # You can change this
    code = "123456"
    
    # Override with command line arguments if provided
    if len(sys.argv) > 1:
        email = sys.argv[1]
    if len(sys.argv) > 2:
        code = sys.argv[2]
    
    print(f"Sending test email to {email} with code {code}")
    
    try:
        result = await send_verification_email(email, code)
        print(f"Email sent result: {result}")
    except Exception as e:
        print(f"Error sending email: {e}")

if __name__ == "__main__":
    asyncio.run(test_email()) 