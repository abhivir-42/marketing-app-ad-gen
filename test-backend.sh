#!/bin/bash
# Simple test script for the backend API endpoints

echo "Testing backend API endpoints..."

# Test generate_script endpoint
echo -e "\nTesting /generate_script endpoint:"
curl -X POST -H "Content-Type: application/json" \
  -d '{"product_name":"Test Product","target_audience":"Test Audience","key_selling_points":"Great features","tone":"Professional","ad_length":30,"speaker_voice":"Male"}' \
  http://localhost:8000/generate_script

# Test regenerate_script endpoint
echo -e "\n\nTesting /regenerate_script endpoint:"
curl -X POST -H "Content-Type: application/json" \
  -d '{"selected_sentences":[0],"improvement_instruction":"Make it more exciting","current_script":[["This is a test script","Speak clearly"]],"key_selling_points":"Great features","tone":"Professional","ad_length":30}' \
  http://localhost:8000/regenerate_script

echo -e "\n\nTests completed. Check the responses above." 