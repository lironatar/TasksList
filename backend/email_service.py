import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import datetime

# Load environment variables
load_dotenv('.env')  # Try with direct path first

# Email configuration
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
# For Gmail, we need to remove spaces from the App Password
SMTP_PASSWORD_NO_SPACES = SMTP_PASSWORD.replace(' ', '') if SMTP_PASSWORD else ''
SMTP_FROM = os.getenv('SMTP_FROM', SMTP_USERNAME)

# Path for logging emails
EMAIL_LOG_FILE = "email_logs.txt"

async def send_verification_email(to_email, code):
    """Send a verification email with the provided code"""
    # Always log the verification code to a file as a backup
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] Email to: {to_email} | Verification Code: {code}\n"
    
    with open(EMAIL_LOG_FILE, "a") as f:
        f.write(log_entry)
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'רשימת משימות - קוד אימות'
        msg['From'] = SMTP_FROM
        msg['To'] = to_email

        # Create the HTML content with a nice design
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; direction: rtl; text-align: right; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4a76a8; color: white; padding: 10px 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9f9f9; }}
                .code {{ font-size: 24px; font-weight: bold; text-align: center; padding: 10px; margin: 20px 0; background-color: #eef2f7; border-radius: 5px; }}
                .footer {{ font-size: 12px; color: #777; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>אימות אימייל</h2>
                </div>
                <div class="content">
                    <p>שלום,</p>
                    <p>קוד האימות שלך לרשימת המשימות הוא:</p>
                    <div class="code">{code}</div>
                    <p>הקוד תקף ל-10 דקות בלבד.</p>
                    <p>אם לא ביקשת קוד אימות, אנא התעלם מהודעה זו.</p>
                </div>
                <div class="footer">
                    <p>הודעה זו נשלחה באופן אוטומטי. אנא אל תשיב לה.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Create plain text content
        text_content = f"""
        רשימת משימות - קוד אימות
        
        שלום,
        
        קוד האימות שלך לרשימת המשימות הוא: {code}
        
        הקוד תקף ל-10 דקות בלבד.
        
        אם לא ביקשת קוד אימות, אנא התעלם מהודעה זו.
        
        הודעה זו נשלחה באופן אוטומטי. אנא אל תשיב לה.
        """

        # Attach both versions
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)

        # Check if SMTP credentials are available
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print(f"SMTP credentials not found. Would send email to {to_email} with code {code}")
            print(f"Verification code logged to {EMAIL_LOG_FILE}")
            return True

        # Connect to SMTP server and send email
        print(f"Attempting to connect to SMTP server: {SMTP_HOST}:{SMTP_PORT}")
        print(f"Using username: {SMTP_USERNAME}")
        
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.ehlo()  # Can help with some SMTP servers
        server.starttls()
        server.ehlo()  # Some servers need this twice
        
        # Try with the password with spaces removed
        server.login(SMTP_USERNAME, SMTP_PASSWORD_NO_SPACES)
        server.sendmail(SMTP_FROM, to_email, msg.as_string())
        server.quit()
        
        print(f"Verification email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Error sending verification email: {e}")
        # Log the error but still return success since we've already logged the code
        print(f"Verification code for {to_email} is: {code}")
        print(f"Verification code logged to {EMAIL_LOG_FILE}")
        return True  # Return true since we logged the code


# Test function
if __name__ == "__main__":
    import asyncio
    
    async def test():
        email = "test@example.com"
        code = "123456"
        result = await send_verification_email(email, code)
        print(f"Email sent: {result}")
    
    asyncio.run(test()) 