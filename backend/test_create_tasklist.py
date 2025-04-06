import requests
import json

def get_auth_token():
    """Login and get an auth token"""
    login_url = "http://localhost:8000/api/v1/auth/login"
    login_data = {
        "email": "ufcvtiiy@example.com",  # Use your existing test user
        "password": "password123"
    }
    
    response = requests.post(login_url, json=login_data)
    if response.status_code == 200:
        token = response.json()['session']['access_token']
        print(f"Successfully logged in, token: {token[:10]}...")
        return token
    else:
        print(f"Login failed: {response.status_code} {response.text}")
        return None

def create_task_list(token):
    """Create a new task list"""
    url = "http://localhost:8000/api/v1/task-lists"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Simple test data
    data = {
        "title": "Test Task List",
        "description": "Created for testing"
    }
    
    print(f"Sending request to {url} with headers: {headers}")
    print(f"Request payload: {json.dumps(data)}")
    
    response = requests.post(url, json=data, headers=headers)
    print(f"Response status: {response.status_code}")
    
    try:
        print(f"Response content: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200 or response.status_code == 201
    except:
        print(f"Raw response: {response.text}")
        return False

if __name__ == "__main__":
    token = get_auth_token()
    if token:
        success = create_task_list(token)
        print(f"Task list creation {'successful' if success else 'failed'}")
    else:
        print("Could not obtain auth token, aborting") 