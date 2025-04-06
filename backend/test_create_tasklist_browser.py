import requests
import json
import uuid
import time

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

def test_browser_patterns():
    """Test the creation of task lists with patterns commonly used by browsers"""
    token = get_auth_token()
    if not token:
        print("Could not obtain auth token, aborting")
        exit(1)
    
    # Base URL and headers
    base_url = "http://localhost:8000/api/v1/task-lists"
    base_headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Test 1: Simple form submission (multipart/form-data)
    print("\n=== Test 1: Multipart Form Data Submission ===")
    form_data = {
        "title": f"Form Task List {uuid.uuid4().hex[:8]}",
        "description": "Created using multipart/form-data"
    }
    headers_1 = base_headers.copy()
    # Note: Don't set Content-Type for multipart/form-data as requests handles it
    
    response_1 = requests.post(base_url, data=form_data, headers=headers_1)
    print(f"Status: {response_1.status_code}")
    print(f"Response: {json.dumps(response_1.json() if response_1.status_code < 300 else response_1.text, indent=2)}")
    
    # Test 2: JSON submission with Content-Type: application/json
    print("\n=== Test 2: JSON Submission with Content-Type ===")
    json_data = {
        "title": f"JSON Task List {uuid.uuid4().hex[:8]}",
        "description": "Created using application/json"
    }
    headers_2 = base_headers.copy()
    headers_2["Content-Type"] = "application/json"
    
    response_2 = requests.post(base_url, json=json_data, headers=headers_2)
    print(f"Status: {response_2.status_code}")
    print(f"Response: {json.dumps(response_2.json() if response_2.status_code < 300 else response_2.text, indent=2)}")
    
    # Test 3: JSON submission with custom Accept header
    print("\n=== Test 3: JSON with Accept Header ===")
    json_data = {
        "title": f"Accept Header Task List {uuid.uuid4().hex[:8]}",
        "description": "Created with Accept: application/json"
    }
    headers_3 = base_headers.copy()
    headers_3["Content-Type"] = "application/json"
    headers_3["Accept"] = "application/json"
    
    response_3 = requests.post(base_url, json=json_data, headers=headers_3)
    print(f"Status: {response_3.status_code}")
    print(f"Response: {json.dumps(response_3.json() if response_3.status_code < 300 else response_3.text, indent=2)}")
    
    # Test 4: URL-encoded form data (application/x-www-form-urlencoded)
    print("\n=== Test 4: URL-encoded Form Data ===")
    form_data = {
        "title": f"URLEncoded Task List {uuid.uuid4().hex[:8]}",
        "description": "Created using x-www-form-urlencoded"
    }
    headers_4 = base_headers.copy()
    headers_4["Content-Type"] = "application/x-www-form-urlencoded"
    
    response_4 = requests.post(base_url, data=form_data, headers=headers_4)
    print(f"Status: {response_4.status_code}")
    print(f"Response: {json.dumps(response_4.json() if response_4.status_code < 300 else response_4.text, indent=2)}")
    
    # Test 5: Empty tasks array
    print("\n=== Test 5: JSON with Empty Tasks Array ===")
    json_data = {
        "title": f"Empty Tasks Array List {uuid.uuid4().hex[:8]}",
        "description": "With empty tasks array",
        "tasks": []
    }
    headers_5 = base_headers.copy()
    headers_5["Content-Type"] = "application/json"
    
    response_5 = requests.post(base_url, json=json_data, headers=headers_5)
    print(f"Status: {response_5.status_code}")
    print(f"Response: {json.dumps(response_5.json() if response_5.status_code < 300 else response_5.text, indent=2)}")
    
    # Test Summary
    print("\n=== Test Summary ===")
    results = [
        response_1.status_code == 200,
        response_2.status_code == 200,
        response_3.status_code == 200,
        response_4.status_code == 200,
        response_5.status_code == 200
    ]
    
    print(f"Test 1 (Multipart Form): {'✓' if results[0] else '✗'}")
    print(f"Test 2 (JSON with Content-Type): {'✓' if results[1] else '✗'}")
    print(f"Test 3 (JSON with Accept): {'✓' if results[2] else '✗'}")
    print(f"Test 4 (URL-encoded): {'✓' if results[3] else '✗'}")
    print(f"Test 5 (Empty Tasks Array): {'✓' if results[4] else '✗'}")
    
    passed = sum(1 for r in results if r)
    print(f"\nPassed: {passed}/5")
    
    return all(results)

if __name__ == "__main__":
    print("=== Testing Browser Request Patterns ===")
    success = test_browser_patterns()
    print(f"\nOverall test result: {'Success' if success else 'Failure'}")
    exit(0 if success else 1) 