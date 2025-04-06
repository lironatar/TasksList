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

def test_create_tasklist(token, payload):
    """Test creating a task list with a specific payload"""
    url = "http://localhost:8000/api/v1/task-lists"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\nTesting with payload: {json.dumps(payload)}")
    
    response = requests.post(url, json=payload, headers=headers)
    print(f"Response status: {response.status_code}")
    
    try:
        print(f"Response content: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200 or response.status_code == 201
    except:
        print(f"Raw response: {response.text}")
        return False

if __name__ == "__main__":
    token = get_auth_token()
    if not token:
        print("Could not obtain auth token, aborting")
        exit(1)
    
    # Test various payload formats
    test_payloads = [
        # Basic payload with just a title
        {
            "title": "Test List 1 - Title Only"
        },
        
        # Payload with title and description
        {
            "title": "Test List 2 - With Description",
            "description": "This is a test description"
        },
        
        # Payload with empty tasks array
        {
            "title": "Test List 3 - Empty Tasks Array",
            "tasks": []
        },
        
        # Payload with tasks that have only title
        {
            "title": "Test List 4 - Tasks with Title Only",
            "tasks": [
                {
                    "title": "Task 1"
                },
                {
                    "title": "Task 2"
                }
            ]
        },
        
        # Payload with fully specified tasks
        {
            "title": "Test List 5 - Complete Tasks",
            "description": "With complete task objects",
            "tasks": [
                {
                    "title": "Task 1",
                    "description": "Task 1 description",
                    "priority": "high",
                    "status": "pending"
                },
                {
                    "title": "Task 2",
                    "description": "Task 2 description",
                    "priority": "medium",
                    "status": "in_progress"
                }
            ]
        }
    ]
    
    # Test each payload
    results = []
    for i, payload in enumerate(test_payloads):
        result = test_create_tasklist(token, payload)
        results.append(result)
        print(f"Test {i+1}: {'Success' if result else 'Failure'}")
    
    # Summary
    print("\nTest Summary:")
    for i, result in enumerate(results):
        print(f"Test {i+1}: {'Success' if result else 'Failure'}")
    
    if all(results):
        print("\nAll tests passed!")
    else:
        print("\nSome tests failed. Check the logs for details.") 