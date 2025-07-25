#!/bin/bash

echo "=== Testing Authentication Flow ==="
echo ""

# Test 1: Sign up a new user
echo "1. Testing Sign Up..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "name": "Flow Test User",
      "email": "flowtest@example.com",
      "password": "TestPassword123",
      "store_name": "Flow Test Store"
    }
  }')

echo "Sign Up Response: $SIGNUP_RESPONSE"

# Extract token from signup response
TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Extracted Token: $TOKEN"
echo ""

# Test 2: Test /me endpoint with token
echo "2. Testing /me endpoint with token..."
ME_RESPONSE=$(curl -s -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "Me Response: $ME_RESPONSE"
echo ""

# Test 3: Sign in with the same user
echo "3. Testing Sign In..."
SIGNIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "flowtest@example.com",
    "password": "TestPassword123"
  }')

echo "Sign In Response: $SIGNIN_RESPONSE"
echo ""

# Test 4: Test invalid credentials
echo "4. Testing invalid credentials..."
INVALID_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "flowtest@example.com",
    "password": "WrongPassword"
  }')

echo "Invalid Credentials Response: $INVALID_RESPONSE"
echo ""

# Test 5: Test duplicate email signup
echo "5. Testing duplicate email signup..."
DUPLICATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "name": "Duplicate User",
      "email": "flowtest@example.com",
      "password": "TestPassword123",
      "store_name": "Duplicate Store"
    }
  }')

echo "Duplicate Email Response: $DUPLICATE_RESPONSE"
echo ""

echo "=== Authentication Flow Test Complete ==="