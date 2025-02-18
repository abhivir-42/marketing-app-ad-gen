import requests
from backend.main import AudioRequest

async def call_parler_tts_api(data: AudioRequest):
    # Example URL, replace with actual TTS API endpoint
    url = "http://tts-api.example.com/generate"
    payload = data.dict()
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        return response.json().get("audio_url", "")
    else:
        raise Exception("Failed to generate audio") 