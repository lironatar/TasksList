import os
import sys

def check_verification_code(email=None):
    """Check the verification code log file for a specific email or all codes"""
    log_file = "email_logs.txt"
    
    if not os.path.exists(log_file):
        print(f"Log file {log_file} does not exist yet.")
        return
    
    print(f"Checking verification codes in {log_file}:")
    print("-" * 60)
    
    with open(log_file, "r") as f:
        logs = f.readlines()
    
    if not logs:
        print("No verification codes have been logged yet.")
        return
    
    # Filter by email if specified
    if email:
        logs = [log for log in logs if email in log]
        if not logs:
            print(f"No verification codes found for email: {email}")
            return
    
    # Print the logs
    for log in logs:
        print(log.strip())
    
    print("-" * 60)
    print(f"Found {len(logs)} verification code entries")

if __name__ == "__main__":
    email = None
    if len(sys.argv) > 1:
        email = sys.argv[1]
    
    check_verification_code(email) 