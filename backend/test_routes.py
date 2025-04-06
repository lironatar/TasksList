import requests
import json

def test_route(method, url, payload=None, headers=None, expected_status=200):
    """Test a route with specified method, URL, and payload"""
    if headers is None:
        headers = {'Content-Type': 'application/json'}
    
    print(f"\nTesting {method.upper()} {url}")
    print(f"Headers: {headers}")
    if payload:
        print(f"Payload: {json.dumps(payload)}")
    
    try:
        if method.lower() == 'get':
            response = requests.get(url, headers=headers)
        elif method.lower() == 'post':
            response = requests.post(url, json=payload, headers=headers)
        elif method.lower() == 'put':
            response = requests.put(url, json=payload, headers=headers)
        elif method.lower() == 'delete':
            response = requests.delete(url, headers=headers)
        else:
            print(f"Unsupported method: {method}")
            return False
        
        status_ok = response.status_code == expected_status
        print(f"Status: {response.status_code} {'✓' if status_ok else '✗'} (expected {expected_status})")
        
        try:
            json_response = response.json()
            print(f"Response: {json.dumps(json_response, indent=2)}")
        except:
            print(f"Response: {response.text[:200]}...")
        
        return status_ok
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def get_auth_token():
    """Login and get an auth token"""
    login_url = "http://localhost:8000/api/v1/auth/login"
    login_data = {
        "email": "ufcvtiiy@example.com",  # Use existing test user
        "password": "password123"
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code == 200:
            token = response.json()['session']['access_token']
            print(f"Successfully logged in, token: {token[:10]}...")
            return token
        else:
            print(f"Login failed: {response.status_code} {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {str(e)}")
        return None

def test_all_routes():
    """Test all the main routes of the API"""
    base_url = "http://localhost:8000"
    
    # Get auth token for authenticated routes
    token = get_auth_token()
    auth_headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    } if token else {'Content-Type': 'application/json'}
    
    # Define routes to test
    routes = [
        # Public routes (no auth needed)
        {'method': 'get', 'url': f"{base_url}/", 'headers': None, 'payload': None, 'expected_status': 200},
        
        # Auth routes
        {'method': 'get', 'url': f"{base_url}/api/v1/auth/me", 'headers': auth_headers, 'payload': None, 'expected_status': 200},
        
        # Task list routes
        {'method': 'get', 'url': f"{base_url}/api/v1/task-lists", 'headers': auth_headers, 'payload': None, 'expected_status': 200},
        {'method': 'post', 'url': f"{base_url}/api/v1/task-lists", 'headers': auth_headers, 'payload': {"title": "Test Route Task List"}, 'expected_status': 200},
    ]
    
    # Run tests
    results = []
    for i, route in enumerate(routes):
        print(f"\n--- Test {i+1}/{len(routes)} ---")
        result = test_route(
            method=route['method'],
            url=route['url'],
            payload=route['payload'],
            headers=route['headers'],
            expected_status=route['expected_status']
        )
        results.append(result)
    
    # Print summary
    print("\n=== Test Summary ===")
    passed = sum(1 for r in results if r)
    failed = sum(1 for r in results if not r)
    print(f"Passed: {passed}/{len(results)}")
    print(f"Failed: {failed}/{len(results)}")
    
    return all(results)

if __name__ == "__main__":
    print("=== API Route Testing ===")
    success = test_all_routes()
    print(f"\nOverall test result: {'Success' if success else 'Failure'}")
    exit(0 if success else 1) 