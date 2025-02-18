from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fal_client
import os
from typing import Dict, Any
import subprocess
import json
from pathlib import Path
from dotenv import load_dotenv
import torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import soundfile as sf
from pydub import AudioSegment
import base64
import io
import numpy as np

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScriptRequest(BaseModel):
    niche: str
    keywords: str
    audience: str

class TTSRequest(BaseModel):
    text: str

def run_crewai_script(inputs: Dict[str, Any]) -> str:
    try:
        # Determine the absolute path to the script_generation folder
        script_gen_dir = Path(__file__).parent.parent / "script_generation"
        
        # Log the current working directory for debugging
        print("Working directory before change:", os.getcwd())
        
        # Change to the correct working directory
        os.chdir(script_gen_dir)
        print("Working directory after change:", os.getcwd())
        
        # Define the expected output file path (relative to the new working directory)
        output_path = Path("radio_script.md")  # Use a relative path from the working directory
        print("Expected output path:", output_path.resolve())
        
        # Delete existing output file if it exists
        if output_path.exists():
            output_path.unlink()
        
        # Run the crewAI process using the subprocess module
        result = subprocess.run(
            ["python", "-m", "script_generation.main"],
            env={
                **os.environ,
                "PYTHONPATH": str(script_gen_dir / "src"),
                "CREW_INPUTS": json.dumps(inputs)
            },
            capture_output=True,
            text=True
        )
        
        # Log the output and error for debugging
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        
        if result.returncode != 0:
            raise RuntimeError(f"CrewAI Error: {result.stderr}")
        
        # Check and read the generated file
        if output_path.exists():
            return output_path.read_text()
                
        raise FileNotFoundError("Script output file not generated")
        
    except Exception as e:
        raise RuntimeError(f"Script generation failed: {str(e)}")
    finally:
        # Change back to the original directory to prevent side effects
        os.chdir(Path(__file__).parent)

@app.post("/api/generate-script")
async def generate_script(request: ScriptRequest):
    try:
        inputs = {
            "niche": request.niche,
            "keywords": request.keywords,
            "audience": request.audience,
            "ad_script": ""
        }
        
        script_output = run_crewai_script(inputs)
        return {"success": True, "script": script_output}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))