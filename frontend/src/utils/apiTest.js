const axios = require('axios');

// Test script to check if the API service is working
async function testApi() {
  try {
    console.log('Testing API connectivity...');
    
    // Test basic connectivity to root endpoint
    const rootResponse = await axios.get('http://localhost:8000/');
    console.log('Root endpoint response:', rootResponse.status, rootResponse.data);
    
    // Test auth endpoints
    try {
      const loginResponse = await axios.post('http://localhost:8000/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      });
      console.log('Login endpoint response:', loginResponse.status);
    } catch (loginError) {
      console.log('Login endpoint error (expected if user does not exist):', 
        loginError.response?.status, loginError.response?.data);
    }
    
    console.log('API test completed');
  } catch (error) {
    console.error('API Test Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might be down.');
    }
  }
}

testApi(); 