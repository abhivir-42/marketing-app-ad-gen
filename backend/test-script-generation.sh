#!/bin/bash
# Test script specifically for script generation

echo "Testing script generation with verbose logging..."

# Test environment variables
echo "Environment variables:"
echo "CREW_API_KEY set: $(if [ -n \"$CREW_API_KEY\" ]; then echo 'Yes'; else echo 'No'; fi)"
echo "OPENAI_API_KEY set: $(if [ -n \"$OPENAI_API_KEY\" ]; then echo 'Yes'; else echo 'No'; fi)"

# If keys are not set, try to source them from .env
if [ -z "$CREW_API_KEY" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "Loading keys from .env file..."
    export $(grep -v '^#' .env | xargs)
    echo "After loading from .env:"
    echo "CREW_API_KEY set: $(if [ -n \"$CREW_API_KEY\" ]; then echo 'Yes'; else echo 'No'; fi)"
    echo "OPENAI_API_KEY set: $(if [ -n \"$OPENAI_API_KEY\" ]; then echo 'Yes'; else echo 'No'; fi)"
fi

# Test generate_script endpoint
echo -e "\nTesting /generate_script endpoint:"
curl -vX POST -H "Content-Type: application/json" \
  -d '{"product_name":"Test Product","target_audience":"Test Audience","key_selling_points":"Great features, easy to use, affordable","tone":"Professional","ad_length":30,"speaker_voice":"Male"}' \
  http://localhost:8000/generate_script

echo -e "\n\nTest completed." 