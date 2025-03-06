import os
import base64
import io
import torch
import numpy as np
import soundfile as sf
from transformers import AutoModelForSeq2SeqLM
from typing import Optional, List, Tuple
from pydantic import BaseModel
import requests

# Model cache to avoid reloading
_MODEL_CACHE = {}

# Define a local version of the AudioRequest class to avoid circular imports
class AudioRequestLocal(BaseModel):
    script: List[dict]  # List of {"line": str, "artDirection": str}
    speed: float = 1.0
    pitch: float = 1.0
    voiceId: Optional[str] = None

def get_parler_tts_model():
    """
    Get or load the Parler TTS model from cache or Hugging Face.
    This prevents reloading the model for each request.
    """
    model_name = "c0derish/parler-tts-mini-v1-segp-colab"
    
    if model_name not in _MODEL_CACHE:
        print(f"Loading model {model_name} from Hugging Face...")
        # In production, this would run on the server with GPU
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        model.to(device)
        _MODEL_CACHE[model_name] = model
        print(f"Model loaded and moved to {device}")
    
    return _MODEL_CACHE[model_name]

async def generate_audio_from_text(text: str, speed: float = 1.0, pitch: float = 1.0, voice_id: Optional[str] = None) -> str:
    """
    Generate audio from text using the Parler TTS model.
    Returns a base64-encoded data URL for the audio.
    
    For now, this is a mock implementation since we don't have direct access to the virtual machine.
    The real implementation would:
    1. Load the model (using the cache)
    2. Generate the audio
    3. Apply any speed/pitch adjustments
    4. Return the audio as a data URL
    """
    try:
        # In a real implementation, this would call the model for inference
        # For now, we'll print that we would use the model if we had access
        print(f"Would generate audio for text: '{text}' with speed={speed}, pitch={pitch}")
        
        # Check if we're in a development environment where we can't run the model
        if not os.environ.get("USE_REAL_MODEL"):
            # In development without the model, return a placeholder audio
            # This would be replaced with actual model inference in production
            print("Development mode: Returning placeholder audio")
            # Include a message in the returned audio indicating this is a placeholder
            return "data:audio/mpeg;base64,PLACEHOLDER_FOR_PARLER_TTS_AUDIO"
        
        # The real implementation would look like this:
        """
        model = get_parler_tts_model()
        
        # Prepare the input for the model
        # Note: This would need to be adjusted based on the specific input format
        # required by the Parler TTS model
        inputs = ... # appropriate format for the model
        
        # Generate audio
        with torch.no_grad():
            audio_output = model.generate(inputs)
        
        # Process the audio (e.g., adjust speed and pitch)
        # This would depend on the exact format of the model's output
        
        # Convert to WAV format
        output_buffer = io.BytesIO()
        sf.write(output_buffer, audio_output, samplerate=22050, format='WAV')
        
        # Convert to base64
        audio_base64 = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
        
        return f"data:audio/wav;base64,{audio_base64}"
        """
        
        # For now, just return a placeholder
        return "data:audio/mpeg;base64,PLACEHOLDER_FOR_PARLER_TTS_AUDIO"
        
    except Exception as e:
        print(f"Error generating audio: {str(e)}")
        raise

async def generate_audio_from_script(script_lines: List[Tuple[str, str]], speed: float = 1.0, pitch: float = 1.0, voice_id: Optional[str] = None) -> str:
    """
    Generate audio from a list of script lines and their art directions.
    This concatenates the lines and generates a single audio file.
    """
    # Extract just the text from the script lines (ignoring art direction for now)
    full_text = " ".join([line for line, _ in script_lines])
    
    # Generate audio from the full text
    return await generate_audio_from_text(full_text, speed, pitch, voice_id)

async def call_parler_tts_api(data):
    """
    Process an audio request using the Parler TTS model.
    This is the main entry point from the FastAPI endpoint.
    
    The data can be either:
    - An AudioRequestLocal instance
    - A dict with script, speed, pitch, voiceId fields
    """
    try:
        # Handle either dict or Pydantic model input
        if isinstance(data, dict):
            script = data.get("script", [])
            speed = data.get("speed", 1.0)
            pitch = data.get("pitch", 1.0)
            voice_id = data.get("voiceId")
            
            # Extract script lines from the request
            script_lines = [(item["line"], item["artDirection"]) for item in script]
        else:
            # Extract script lines from the request
            script_lines = [(script["line"], script["artDirection"]) for script in data.script]
            speed = data.speed
            pitch = data.pitch
            voice_id = data.voiceId
        
        # Generate audio from the script lines
        audio_url = await generate_audio_from_script(
            script_lines,
            speed=speed,
            pitch=pitch,
            voice_id=voice_id
        )
        
        return audio_url
    except Exception as e:
        print(f"Error in call_parler_tts_api: {str(e)}")
        raise Exception(f"Failed to generate audio: {str(e)}") 