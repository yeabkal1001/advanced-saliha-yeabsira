// Test frontend API integration
const API_BASE = 'http://localhost:3000';

// Test 1: Valid signup
console.log('=== Testing Frontend API Integration ===\n');

async function testValidSignup() {
    console.log('1. Testing valid signup...');
    try {
        const response = await fetch(`${API_BASE}/api/v1/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: {
                    name: 'Frontend Integration Test',
                    email: 'frontend-integration@example.com',
                    password: 'TestPassword123',
                    store_name: 'Frontend Integration Store'
                }
            })
        });
        
        const data = await response.json();
        console.log('✅ Signup successful:', data);
        return data.token;
    } catch (error) {
        console.log('❌ Signup failed:', error);
        return null;
    }
}

async function testValidSignin() {
    console.log('\n2. Testing valid signin...');
    try {
        const response = await fetch(`${API_BASE}/api/v1/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'frontend-integration@example.com',
                password: 'TestPassword123'
            })
        });
        
        const data = await response.json();
        console.log('✅ Signin successful:', data);
        return data.token;
    } catch (error) {
        console.log('❌ Signin failed:', error);
        return null;
    }
}

async function testProtectedEndpoint(token) {
    console.log('\n3. Testing protected endpoint...');
    try {
        const response = await fetch(`${API_BASE}/api/v1/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('✅ Protected endpoint access successful:', data);
        return true;
    } catch (error) {
        console.log('❌ Protected endpoint access failed:', error);
        return false;
    }
}

async function testInvalidSignup() {
    console.log('\n4. Testing invalid signup (validation errors)...');
    try {
        const response = await fetch(`${API_BASE}/api/v1/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: {
                    name: '',
                    email: 'invalid-email',
                    password: '123',
                    store_name: ''
                }
            })
        });
        
        const data = await response.json();
        console.log('✅ Validation errors handled correctly:', data);
        return true;
    } catch (error) {
        console.log('❌ Validation error handling failed:', error);
        return false;
    }
}

async function testInvalidSignin() {
    console.log('\n5. Testing invalid signin...');
    try {
        const response = await fetch(`${API_BASE}/api/v1/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            })
        });
        
        const data = await response.json();
        console.log('✅ Invalid signin handled correctly:', data);
        return true;
    } catch (error) {
        console.log('❌ Invalid signin handling failed:', error);
        return false;
    }
}

// Run all tests
async function runTests() {
    const token = await testValidSignup();
    if (token) {
        await testProtectedEndpoint(token);
    }
    
    await testValidSignin();
    await testInvalidSignup();
    await testInvalidSignin();
    
    console.log('\n=== Frontend Integration Tests Complete ===');
}

runTests();