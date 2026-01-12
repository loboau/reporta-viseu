#!/bin/bash

# Reporta Viseu API Test Script
# This script tests the main API endpoints

BASE_URL="http://localhost:3001"

echo "=========================================="
echo "Testing Reporta Viseu API"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo "✓ Health check passed"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "✗ Health check failed (HTTP $http_code)"
    echo "$body"
fi
echo ""

# Test 2: Get Categories
echo "2. Testing Categories Endpoint..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/categories")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo "✓ Categories endpoint passed"
    categories_count=$(echo "$body" | jq '.data | length' 2>/dev/null)
    echo "   Found $categories_count categories"
else
    echo "✗ Categories endpoint failed (HTTP $http_code)"
    echo "$body"
fi
echo ""

# Test 3: Create a Report (requires category ID)
echo "3. Testing Create Report..."
# Get first category ID
category_id=$(curl -s "$BASE_URL/api/categories" | jq -r '.data[0].id' 2>/dev/null)

if [ -n "$category_id" ] && [ "$category_id" != "null" ]; then
    report_data='{
      "latitude": 40.6571,
      "longitude": -7.9139,
      "address": "Praça da República, Viseu",
      "freguesia": "Viseu",
      "categoryId": "'$category_id'",
      "description": "Este é um relatório de teste criado automaticamente. Por favor ignore.",
      "urgency": "MEDIA",
      "isAnonymous": false,
      "name": "Teste Sistema",
      "email": "teste@example.com",
      "phone": "912345678"
    }'

    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/reports" \
        -H "Content-Type: application/json" \
        -d "$report_data")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" -eq 201 ]; then
        echo "✓ Create report passed"
        reference=$(echo "$body" | jq -r '.data.reference' 2>/dev/null)
        echo "   Report reference: $reference"

        # Save reference for next test
        echo "$reference" > /tmp/reporta_test_reference.txt
    else
        echo "✗ Create report failed (HTTP $http_code)"
        echo "$body"
    fi
else
    echo "✗ Could not get category ID for test"
fi
echo ""

# Test 4: Get Report by Reference
if [ -f /tmp/reporta_test_reference.txt ]; then
    echo "4. Testing Get Report by Reference..."
    reference=$(cat /tmp/reporta_test_reference.txt)

    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/reports/$reference")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" -eq 200 ]; then
        echo "✓ Get report passed"
        echo "   Reference: $reference"
    else
        echo "✗ Get report failed (HTTP $http_code)"
        echo "$body"
    fi

    # Clean up
    rm /tmp/reporta_test_reference.txt
else
    echo "4. Skipping Get Report test (no reference available)"
fi
echo ""

echo "=========================================="
echo "API Tests Complete"
echo "=========================================="
