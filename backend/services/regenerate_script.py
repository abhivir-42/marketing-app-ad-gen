import requests
from backend.main import RefineRequest

async def call_regenerate_script_crew(data: RefineRequest):
    # Example URL, replace with actual crew endpoint
    url = "http://crew-api.example.com/refine"
    payload = data.dict()
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        return response.json().get("script", [])
    else:
        raise Exception("Failed to refine script") 