import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Email configuration
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
# For Gmail, we need to remove spaces from the App Password
SMTP_PASSWORD_NO_SPACES = SMTP_PASSWORD.replace(' ', '') if SMTP_PASSWORD else ''
SMTP_FROM = os.getenv('SMTP_FROM', SMTP_USERNAME)

def test_gmail_connection():
    """Test connection to Gmail SMTP server"""
    print(f"SMTP Configuration:")
    print(f"Host: {SMTP_HOST}")
    print(f"Port: {SMTP_PORT}")
    print(f"Username: {SMTP_USERNAME}")
    print(f"Password (with spaces): {SMTP_PASSWORD}")
    print(f"Password (no spaces): {SMTP_PASSWORD_NO_SPACES}")
    print(f"From: {SMTP_FROM}")
    
    try:
        # Try creating an SMTP connection
        print("\nAttempting SMTP connection...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.set_debuglevel(1)  # Show debug output
        server.ehlo()
        
        print("\nAttempting STARTTLS...")
        server.starttls()
        server.ehlo()
        
        print("\nAttempting login...")
        server.login(SMTP_USERNAME, SMTP_PASSWORD_NO_SPACES)
        
        print("\nSMTP authentication successful!")
        server.quit()
        return True
    except Exception as e:
        print(f"\nError connecting to SMTP server: {e}")
        return False

def send_test_email(to_email):
    """Send a test email"""
    if not test_gmail_connection():
        print("Cannot send test email due to connection failure.")
        return False
    
    try:
        print(f"\nPreparing test email to {to_email}...")
        
        # Create message
        msg = MIMEMultipart()
        msg['Subject'] = 'Test Email from TasksLists App'
        msg['From'] = SMTP_FROM
        msg['To'] = to_email
        
        # Create text content
        text = "This is a test email from the TasksLists app. If you're receiving this, Gmail SMTP authentication is working!"
        msg.attach(MIMEText(text))
        
        # Connect to SMTP server and send email
        print("Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD_NO_SPACES)
        
        print("Sending email...")
        server.sendmail(SMTP_FROM, to_email, msg.as_string())
        server.quit()
        
        print("Test email sent successfully!")
        return True
    except Exception as e:
        print(f"Error sending test email: {e}")
        return False

if __name__ == "__main__":
    recipient = input("Enter the email address to send a test email to: ")
    send_test_email(recipient) 