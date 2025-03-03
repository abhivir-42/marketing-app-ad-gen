from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the necessary functions from your existing backend
from main import app, RefineRequest

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        request_data = json.loads(post_data)
        
        # Create a RefineRequest instance
        refine_request = RefineRequest(
            selected_sentences=request_data.get('selected_sentences'),
            improvement_instruction=request_data.get('improvement_instruction'),
            current_script=request_data.get('current_script'),
            key_selling_points=request_data.get('key_selling_points'),
            tone=request_data.get('tone'),
            ad_length=request_data.get('ad_length')
        )
        
        # Process the request using your existing backend logic
        from main import regenerate_script
        result = regenerate_script(refine_request)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        self.wfile.write(json.dumps(result).encode())
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 