from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import subprocess
import json
from pathlib import Path
from typing import List, Tuple
import logging

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScriptRequest(BaseModel):
    product_name: str
    target_audience: str
    key_selling_points: str
    tone: str
    ad_length: int

class RefineRequest(BaseModel):
    selected_sentences: List[int]
    improvement_instruction: str
    current_script: List[Tuple[str, str]]
    key_selling_points: str
    tone: str
    ad_length: int

# Configure logging
logging.basicConfig(level=logging.DEBUG)

async def run_crewai_script(inputs: dict) -> str:
    try:
        script_gen_dir = Path(__file__).parent / "script_generation" / "src"
        os.chdir(script_gen_dir)
        output_path = Path("/Users/abhivir42/projects/marketing-app-ad-gen/backend/script_generation/src/Users/abhivir42/projects/marketing-app-ad-gen/backend/script_generation/radio_script.md")
        if output_path.exists():
            output_path.unlink()
        result = subprocess.run(
            ["python", "-m", "script_generation.main"],
            env={
                **os.environ,
                "PYTHONPATH": str(script_gen_dir),
                "CREW_INPUTS": json.dumps(inputs)
            },
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            raise RuntimeError(f"CrewAI Error: {result.stderr}")
        if output_path.exists():
            return output_path.read_text()
        raise FileNotFoundError("Script output file not generated")
    except Exception as e:
        raise RuntimeError(f"Script generation failed: {str(e)}")
    finally:
        os.chdir(Path(__file__).parent)

async def run_regenerate_script_crew(inputs: dict) -> str:
    try:
        # Log the inputs for debugging
        logging.debug(f"Inputs to regenerate_script crew: {json.dumps(inputs, indent=2)}")
        script_gen_dir = Path(__file__).parent / "regenerate_script" / "src"
        os.chdir(script_gen_dir)
        output_path = Path("/Users/abhivir42/projects/marketing-app-ad-gen/backend/regenerate_script/src/Users/abhivir42/projects/marketing-app-ad-gen/backend/regenerate_script/refined_script.md")
        if output_path.exists():
            output_path.unlink()
        # Log the environment variables
        logging.debug(f"Environment Variables: {json.dumps(dict(os.environ), indent=2)}")
        # Run the regenerate_script main module
        result = subprocess.run(
            ["python", "-m", "regenerate_script.main"],
            env={
                **os.environ,
                "PYTHONPATH": str(script_gen_dir),
                "CREW_INPUTS": json.dumps(inputs)
            },
            capture_output=True,
            text=True
        )
        # Log the result for debugging
        logging.debug(f"RegenerateScript result: {result.stdout}")
        if result.returncode != 0:
            logging.error(f"RegenerateScript Error: {result.stderr}")
            raise RuntimeError(f"RegenerateScript Error: {result.stderr}")
        return result.stdout
    except Exception as e:
        logging.error(f"Failed to run regenerate_script crew: {str(e)}")
        raise RuntimeError(f"Failed to run regenerate_script crew: {str(e)}")

@app.post("/generate_script")
async def generate_script(request: ScriptRequest):
    try:
        inputs = request.dict()
        script_output = await run_crewai_script(inputs)
        return {"success": True, "script": script_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/regenerate_script")
async def regenerate_script(request: RefineRequest):
    try:
        inputs = request.dict()
        result = await run_regenerate_script_crew(inputs)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 