#!/bin/bash

echo "Testing backend connectivity..."
echo "Sending request to http://localhost:8001/test_connection"
curl -s http://localhost:8001/test_connection | jq .

# Also test script generation with a simple example
echo -e "\nTesting script generation with sample data..."
curl -X POST http://localhost:8001/generate_script \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "TestProduct",
    "target_audience": "Test Users",
    "key_selling_points": "Fast, Reliable, Easy to use",
    "tone": "Professional",
    "ad_length": 30,
    "speaker_voice": "Male"
  }' | jq .

echo -e "\nDone!" 