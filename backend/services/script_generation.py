import subprocess
import json
import os
from pathlib import Path
from backend.main import ScriptRequest

async def call_script_generation_crew(data: ScriptRequest):
    try:
        # Determine the absolute path to the script_generation folder
        script_gen_dir = Path(__file__).parent.parent / "script_generation"
        
        # Change to the correct working directory
        original_dir = Path.cwd()
        os.chdir(script_gen_dir)
        
        # Define the expected output file path
        output_path = Path("radio_script.md")
        
        # Delete existing output file if it exists
        if output_path.exists():
            output_path.unlink()
        
        # Run the crewAI process using the subprocess module
        result = subprocess.run(
            ["python", "-m", "script_generation.main"],
            env={
                **os.environ,
                "PYTHONPATH": str(script_gen_dir / "src"),
                "CREW_INPUTS": json.dumps(data.dict())
            },
            capture_output=True,
            text=True
        )
        
        # Log the output and error for debugging
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        
        # Check and read the generated file
        if output_path.exists():
            return output_path.read_text()
        
        raise FileNotFoundError("Script output file not generated")
        
    except Exception as e:
        return f"Script generation failed: {str(e)}"
    finally:
        # Change back to the original directory to prevent side effects
        os.chdir(original_dir)