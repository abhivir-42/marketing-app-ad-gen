from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import subprocess
import json
from pathlib import Path

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

@app.post("/generate_script")
async def generate_script(request: ScriptRequest):
    try:
        inputs = request.dict()
        script_output = await run_crewai_script(inputs)
        return {"success": True, "script": script_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 