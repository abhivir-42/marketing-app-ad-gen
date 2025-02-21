from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import subprocess
import json
from pathlib import Path
from typing import List, Tuple, Literal, Dict, Any
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
    ad_length: int = Field(..., ge=15, le=60)  # Validate length between 15 and 60 seconds
    speaker_voice: Literal["Male", "Female", "Either"]

class RefineRequest(BaseModel):
    selected_sentences: List[int]
    improvement_instruction: str
    current_script: List[Tuple[str, str]]
    key_selling_points: str
    tone: str
    ad_length: int = Field(..., ge=15, le=60)  # Validate length between 15 and 60 seconds

class Script(BaseModel):
    line: str
    artDirection: str

class GenerateScriptResponse(BaseModel):
    success: bool
    script: List[Script]

class RefineScriptResponse(BaseModel):
    status: str
    data: List[Script]

# Configure logging
logging.basicConfig(level=logging.DEBUG)

def parse_script_output(output: str) -> List[Dict[str, str]]:
    """Parse the script output from the crew into a list of script objects."""
    try:
        # First try to parse as JSON
        try:
            data = json.loads(output)
            if isinstance(data, list):
                return [{"line": item[0], "artDirection": item[1]} for item in data]
        except json.JSONDecodeError:
            pass

        # If not JSON, try to parse as line-by-line format
        scripts = []
        for line in output.strip().split('\n'):
            if '|' in line:
                script_line, art_direction = line.split('|', 1)
                scripts.append({
                    "line": script_line.strip(),
                    "artDirection": art_direction.strip()
                })
            else:
                # If no art direction, use empty string
                scripts.append({
                    "line": line.strip(),
                    "artDirection": ""
                })
        return scripts
    except Exception as e:
        logging.error(f"Error parsing script output: {str(e)}")
        logging.error(f"Raw output: {output}")
        raise ValueError(f"Failed to parse script output: {str(e)}")

async def run_crewai_script(inputs: dict) -> List[Dict[str, str]]:
    try:
        # Log the inputs for debugging
        logging.debug(f"Inputs to script generation: {json.dumps(inputs, indent=2)}")
        
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
            logging.error(f"CrewAI Error: {result.stderr}")
            raise RuntimeError(f"CrewAI Error: {result.stderr}")
        
        if output_path.exists():
            output_text = output_path.read_text()
            return parse_script_output(output_text)
        raise FileNotFoundError("Script output file not generated")
    except Exception as e:
        logging.error(f"Script generation failed: {str(e)}")
        raise RuntimeError(f"Script generation failed: {str(e)}")
    finally:
        os.chdir(Path(__file__).parent)

async def run_regenerate_script_crew(inputs: dict) -> List[Dict[str, str]]:
    try:
        logging.debug(f"Inputs to regenerate_script crew: {json.dumps(inputs, indent=2)}")
        script_gen_dir = Path(__file__).parent / "regenerate_script" / "src"
        os.chdir(script_gen_dir)
        output_path = Path("/Users/abhivir42/projects/marketing-app-ad-gen/backend/regenerate_script/src/Users/abhivir42/projects/marketing-app-ad-gen/backend/regenerate_script/refined_script.md")
        if output_path.exists():
            output_path.unlink()
        
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
        
        logging.debug(f"RegenerateScript result: {result.stdout}")
        if result.returncode != 0:
            logging.error(f"RegenerateScript Error: {result.stderr}")
            raise RuntimeError(f"RegenerateScript Error: {result.stderr}")
            
        if output_path.exists():
            output_text = output_path.read_text()
            return parse_script_output(output_text)
        return parse_script_output(result.stdout)
    except Exception as e:
        logging.error(f"Failed to run regenerate_script crew: {str(e)}")
        raise RuntimeError(f"Failed to run regenerate_script crew: {str(e)}")

@app.post("/generate_script", response_model=GenerateScriptResponse)
async def generate_script(request: ScriptRequest):
    try:
        script_output = await run_crewai_script(request.dict())
        return GenerateScriptResponse(success=True, script=script_output)
    except Exception as e:
        logging.error(f"Error in generate_script endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/regenerate_script", response_model=RefineScriptResponse)
async def regenerate_script(request: RefineRequest):
    try:
        script_output = await run_regenerate_script_crew(request.dict())
        return RefineScriptResponse(status="success", data=script_output)
    except Exception as e:
        logging.error(f"Error in regenerate_script endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 