import requests
import json
import random
import string

def generate_random_email():
    """Generate a random email address for testing"""
    letters = string.ascii_lowercase
    random_string = ''.join(random.choice(letters) for i in range(8))
    return f"{random_string}@example.com"

def test_register():
    """Test user registration"""
    url = "http://localhost:8000/api/v1/auth/register"
    email = generate_random_email()
    print(f"Using test email: {email}")
    
    data = {
        "email": email,
        "password": "password123",
        "firstName": "Test",
        "lastName": "User"
    }
    
    response = requests.post(url, json=data)
    print(f"Register status code: {response.status_code}")
    print(f"Register response: {response.text}")
    
    return response.status_code == 200, email

def test_login(email):
    """Test user login"""
    url = "http://localhost:8000/api/v1/auth/login"
    data = {
        "email": email,
        "password": "password123"
    }
    
    response = requests.post(url, json=data)
    print(f"Login status code: {response.status_code}")
    print(f"Login response: {response.text}")
    
    return response.status_code == 200

def test_verify(email):
    """Test verification endpoint"""
    # First, get the verification code
    query = """
    SELECT code FROM verification_codes WHERE email = %s ORDER BY created_at DESC LIMIT 1
    """
    
    try:
        from db_config import execute_query
        result = execute_query(query, (email,))
        if result and len(result) > 0:
            code = result[0]['code']
            print(f"Found verification code: {code}")
            
            # Now verify the code
            url = "http://localhost:8000/api/v1/auth/verify"
            data = {
                "email": email,
                "code": code
            }
            
            response = requests.post(url, json=data)
            print(f"Verify status code: {response.status_code}")
            print(f"Verify response: {response.text}")
            
            return response.status_code == 200
        else:
            print("No verification code found")
            return False
    except Exception as e:
        print(f"Error getting verification code: {e}")
        return False

if __name__ == "__main__":
    # Try to register a new user
    register_result, email = test_register()
    
    # Verify the user
    if register_result:
        verify_result = test_verify(email)
    else:
        verify_result = False
    
    # Try to login
    login_result = test_login(email)
    
    print("\nTest Results:")
    print(f"Registration: {'Success' if register_result else 'Failed'}")
    print(f"Verification: {'Success' if verify_result else 'Failed'}")
    print(f"Login: {'Success' if login_result else 'Failed'}") 