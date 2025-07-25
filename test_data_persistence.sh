#!/bin/bash

echo "=== Testing Data Persistence ==="
echo ""

# Test 1: Create a user and verify it's stored
echo "1. Creating a new user..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "name": "Persistence Test User",
      "email": "persistence@example.com",
      "password": "TestPassword123",
      "store_name": "Persistence Test Store"
    }
  }')

echo "Signup Response: $SIGNUP_RESPONSE"

# Extract user ID
USER_ID=$(echo $SIGNUP_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Created User ID: $USER_ID"
echo ""

# Test 2: Sign in with the user to verify password was stored correctly
echo "2. Testing sign in with created user..."
SIGNIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "persistence@example.com",
    "password": "TestPassword123"
  }')

echo "Signin Response: $SIGNIN_RESPONSE"

# Extract token
TOKEN=$(echo $SIGNIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token received: $TOKEN"
echo ""

# Test 3: Use token to access protected endpoint
echo "3. Testing protected endpoint access..."
ME_RESPONSE=$(curl -s -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "Me Response: $ME_RESPONSE"
echo ""

# Test 4: Verify user data integrity
echo "4. Verifying user data integrity..."
STORED_NAME=$(echo $ME_RESPONSE | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
STORED_EMAIL=$(echo $ME_RESPONSE | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
STORED_STORE=$(echo $ME_RESPONSE | grep -o '"store_name":"[^"]*"' | cut -d'"' -f4)

echo "Stored Name: $STORED_NAME"
echo "Stored Email: $STORED_EMAIL"
echo "Stored Store Name: $STORED_STORE"

# Verify data matches what we sent
if [ "$STORED_NAME" = "Persistence Test User" ] && \
   [ "$STORED_EMAIL" = "persistence@example.com" ] && \
   [ "$STORED_STORE" = "Persistence Test Store" ]; then
    echo "✅ Data integrity verified - all fields match!"
else
    echo "❌ Data integrity failed - fields don't match!"
fi
echo ""

# Test 5: Test wrong password
echo "5. Testing wrong password..."
WRONG_PASSWORD_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "persistence@example.com",
    "password": "WrongPassword"
  }')

echo "Wrong Password Response: $WRONG_PASSWORD_RESPONSE"

if echo $WRONG_PASSWORD_RESPONSE | grep -q "Invalid email or password"; then
    echo "✅ Password security verified - wrong password rejected!"
else
    echo "❌ Password security failed - wrong password accepted!"
fi
echo ""

echo "=== Data Persistence Test Complete ==="