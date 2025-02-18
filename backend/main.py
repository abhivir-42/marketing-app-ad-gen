from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Tuple

app = FastAPI()

# Define data models
class ScriptRequest(BaseModel):
    product_name: str
    target_audience: str
    key_selling_points: str
    tone: str
    ad_length: int
    ad_speaker_voice: str

class RefineRequest(BaseModel):
    selected_sentences: List[int]
    improvement_instruction: str
    current_script: List[Tuple[str, str]]

class AudioRequest(BaseModel):
    script: List[Tuple[str, str]]
    speed: float
    pitch: float

# Placeholder for crew integration
async def call_script_generation_crew(data: ScriptRequest):
    # TODO: Implement crew call
    return [("Sample script line", "Sample art direction")]

async def call_regenerate_script_crew(data: RefineRequest):
    # TODO: Implement crew call
    return [("Refined script line", "Refined art direction")]

# Define endpoints
@app.post("/generate_script")
async def generate_script(request: ScriptRequest):
    try:
        result = await call_script_generation_crew(request)
        return {"script": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refine_script")
async def refine_script(request: RefineRequest):
    if not request.selected_sentences or not request.improvement_instruction:
        raise HTTPException(status_code=400, detail="Please select sentences and provide an improvement instruction.")
    try:
        result = await call_regenerate_script_crew(request)
        return {"script": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_audio")
async def generate_audio(request: AudioRequest):
    # TODO: Implement Parler TTS API call
    return {"audio_url": "http://example.com/audio.mp3"} 