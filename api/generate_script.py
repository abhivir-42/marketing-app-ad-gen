from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import tempfile
from pathlib import Path

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the necessary functions from your existing backend
from main import app, ScriptRequest

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        request_data = json.loads(post_data)
        
        # Create a ScriptRequest instance
        script_request = ScriptRequest(
            product_name=request_data.get('product_name'),
            target_audience=request_data.get('target_audience'),
            key_selling_points=request_data.get('key_selling_points'),
            tone=request_data.get('tone'),
            ad_length=request_data.get('ad_length'),
            speaker_voice=request_data.get('speaker_voice')
        )
        
        # Process the request using your existing backend logic
        # Note: You need to implement this logic based on your existing main.py
        from main import generate_script
        try:
            result = generate_script(script_request)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            error_message = str(e)
            self.wfile.write(json.dumps({"error": error_message}).encode())
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 