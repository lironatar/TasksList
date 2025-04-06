import sys
from auth_service import verify_code, generate_verification_code
from db_config import execute_query
import datetime

def test_verify_code(email, code):
    """Test verifying a code with debug information"""
    print(f"Testing verification for email: {email}, code: {code}")
    
    # Check if code exists in database
    query = """
    SELECT * FROM verification_codes 
    WHERE email = %s
    ORDER BY created_at DESC
    """
    
    try:
        results = execute_query(query, (email,))
        
        print(f"\nFound {len(results) if results else 0} verification codes for {email}:")
        if results:
            for result in results:
                created = result['created_at']
                expires = result['expires_at']
                now = datetime.datetime.now()
                is_expired = expires < now if expires else True
                
                print(f"- Code: {result['code']} (Created: {created}, Expires: {expires})")
                print(f"  Is expired: {is_expired}, Matches input: {result['code'] == code}")
        
        # Try to verify the code
        result = verify_code(email, code)
        
        print(f"\nVerification result: {result}")
        
        if result:
            print("Code was verified successfully!")
        else:
            print("Code verification failed.")
        
        return result
    except Exception as e:
        print(f"Error during verification: {e}")
        return False

def generate_new_code(email):
    """Generate a new code for testing"""
    code = generate_verification_code(email)
    print(f"Generated new code for {email}: {code}")
    return code

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_verification.py <email> [code]")
        print("  - If code is not provided, a new one will be generated")
        sys.exit(1)
    
    email = sys.argv[1]
    
    if len(sys.argv) > 2:
        # Use provided code
        code = sys.argv[2]
        test_verify_code(email, code)
    else:
        # Generate new code and then verify it
        code = generate_new_code(email)
        print("\nTesting verification with the newly generated code:")
        test_verify_code(email, code) 