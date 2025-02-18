import requests
from backend.main import ScriptRequest

async def call_script_generation_crew(data: ScriptRequest):
    # Example URL, replace with actual crew endpoint
    url = "http://crew-api.example.com/generate"
    payload = data.dict()
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        return response.json().get("script", [])
    else:
        raise Exception("Failed to generate script") 