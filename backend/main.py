from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import subprocess
import json
from pathlib import Path
from typing import List, Tuple, Literal, Dict, Any, Optional
import requests
import logging

app = FastAPI()

# Configure CORS to allow requests from Vercel and localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ad-craft-app.vercel.app",  # Vercel production app
        "http://localhost:3000",            # Local frontend development
        "http://127.0.0.1:3000",            # Alternative local address
        "http://localhost:3001",            # Alternative port for local development
        "https://marketing-app-ad-gen.vercel.app", # Vercel deployment
        "https://marketing-app-ad-gen-git-main.vercel.app", # Vercel preview branch
        "*"                                 # Allow all origins temporarily for testing
    ],
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

class ValidationMetadata(BaseModel):
    had_unauthorized_changes: bool = False
    reverted_changes: List[Dict[str, Any]] = Field(default_factory=list)
    had_length_mismatch: bool = False
    original_length: int = 0
    received_length: int = 0
    error: Optional[str] = None

class AudioRequest(BaseModel):
    script: List[Script]

class GenerateAudioResponse(BaseModel):
    audioUrl: str

class RefineScriptResponse(BaseModel):
    status: str
    data: List[Script]  # Now will only contain modified sentences
    modified_indices: List[int]  # Indices of the sentences that were modified
    validation: Optional[ValidationMetadata] = None

# Configure logging
logging.basicConfig(level=logging.DEBUG)

def parse_script_output(output: str) -> List[Dict[str, str]]:
    """Parse the script output from the crew into a list of script objects."""
    try:
        # Clean up the output string to handle common formatting issues
        output = output.strip()
        # Remove trailing period before closing bracket if present
        if output.endswith(').'):
            output = output[:-1] + ')'
        if output.endswith(').  ]'):
            output = output[:-5] + ')]'
            
        # First try to parse as JSON
        try:
            data = json.loads(output)
            if isinstance(data, list):
                # Each item should be a tuple/list of two strings
                scripts = []
                for item in data:
                    if isinstance(item, (list, tuple)) and len(item) == 2:
                        script_line = item[0]
                        art_direction = item[1]
                        # Remove any extra quotes if present
                        if isinstance(script_line, str) and isinstance(art_direction, str):
                            scripts.append({
                                "line": script_line,
                                "artDirection": art_direction
                            })
                return scripts
        except json.JSONDecodeError:
            # If not JSON, try to parse as Python literal
            import ast
            try:
                # Safely evaluate the string as a Python literal
                data = ast.literal_eval(output)
                if isinstance(data, list):
                    return [
                        {
                            "line": item[0],
                            "artDirection": item[1]
                        }
                        for item in data
                        if isinstance(item, (list, tuple)) and len(item) == 2
                    ]
            except (SyntaxError, ValueError):
                # Last resort: try to fix common formatting issues with regex
                import re
                # Find all pairs of quoted strings
                pattern = r'\("([^"]+)",\s*"([^"]+)"\)'
                matches = re.findall(pattern, output)
                if matches:
                    return [
                        {
                            "line": line,
                            "artDirection": art
                        }
                        for line, art in matches
                    ]

        # If all parsing attempts fail, log the raw output and raise an error
        logging.error(f"Could not parse output format. Raw output: {output}")
        raise ValueError("Output format not recognized")

    except Exception as e:
        logging.error(f"Error parsing script output: {str(e)}")
        logging.error(f"Raw output: {output}")
        raise ValueError(f"Failed to parse script output: {str(e)}")

async def run_crewai_script(inputs: dict) -> List[Dict[str, str]]:
    try:
        # Log the inputs for debugging
        logging.debug(f"Inputs to script generation: {json.dumps(inputs, indent=2)}")
        
        # Get absolute paths
        backend_dir = Path(__file__).parent.absolute()
        script_gen_dir = backend_dir / "script_generation"
        script_src_dir = script_gen_dir / "src"
        
        # Define possible output paths
        expected_output_path = script_gen_dir / "radio_script.md"
        possible_output_paths = [
            expected_output_path,
            Path("/home/azureuser/marketing-app-ad-gen/backend/script_generation/radio_script.md"),
            Path(script_src_dir) / "home" / "azureuser" / "marketing-app-ad-gen" / "backend" / "script_generation" / "radio_script.md",
            backend_dir / "script_generation" / "radio_script.md"
        ]
        
        # Clean up any existing files at these paths
        for output_path in possible_output_paths:
            if output_path.exists():
                try:
                    output_path.unlink()
                    logging.info(f"Deleted existing file: {output_path}")
                except Exception as e:
                    logging.warning(f"Failed to delete {output_path}: {str(e)}")
                    
        # Create directories if they don't exist
        expected_output_path.parent.mkdir(parents=True, exist_ok=True)
            
        # Print debug information
        logging.info(f"Current working directory before running script: {os.getcwd()}")
        logging.info(f"Expected script generation output path: {expected_output_path}")
        logging.info(f"All possible output paths: {possible_output_paths}")
        
        # Set environment variables for the subprocess, including the explicit output path
        env_vars = {
            **os.environ,
            "PYTHONPATH": str(script_src_dir),
            "CREW_INPUTS": json.dumps(inputs),
            "SCRIPT_OUTPUT_PATH": str(expected_output_path)
        }
        
        # Run the script generation process
        result = subprocess.run(
            ["python", "-m", "script_generation.main"],
            env=env_vars,
            cwd=str(script_src_dir),  # Set working directory explicitly
            capture_output=True,
            text=True
        )
        
        # Log the output for debugging
        logging.info(f"Script generation output: {result.stdout}")
        
        if result.stderr:
            logging.warning(f"Script generation errors: {result.stderr}")
        
        if result.returncode != 0:
            logging.error(f"CrewAI Error: {result.stderr}")
            raise RuntimeError(f"CrewAI Error: {result.stderr}")
        
        # Check all possible output paths
        for output_path in possible_output_paths:
            if output_path.exists():
                logging.info(f"Found output file at {output_path}")
                try:
                    output_text = output_path.read_text()
                    return parse_script_output(output_text)
                except Exception as e:
                    logging.error(f"Error reading {output_path}: {str(e)}")
        
        # Try to parse the output directly from stdout if no file is found
        if "Final Answer:" in result.stdout:
            logging.info("Trying to parse script from stdout")
            answer_text = result.stdout.split("Final Answer:")[1].strip()
            return parse_script_output(answer_text)
            
        # Additional debug information if file not found
        logging.error(f"Output file not found at any of the expected paths")
        all_md_files = list(Path(script_gen_dir).glob('**/*.md'))
        logging.error(f"All markdown files in script_gen_dir: {all_md_files}")
        logging.error(f"Directory contents: {list(Path(__file__).parent.glob('**/*.md'))}")
        raise FileNotFoundError("Script output file not generated")
    except Exception as e:
        logging.error(f"Script generation failed: {str(e)}")
        raise RuntimeError(f"Script generation failed: {str(e)}")
    finally:
        os.chdir(Path(__file__).parent)

async def run_regenerate_script_crew(inputs: dict) -> Tuple[List[Dict[str, str]], Dict[str, Any]]:
    try:
        # Create enhanced input structure with explicit marking of selected sentences
        enhanced_inputs = inputs.copy()
        
        # Extract the current script and selected sentences
        current_script = enhanced_inputs.get("current_script", [])
        selected_sentences = enhanced_inputs.get("selected_sentences", [])
        
        # Create a marked script that clearly highlights which sentences should be modified
        marked_script = []
        for idx, (line, art_direction) in enumerate(current_script):
            if idx in selected_sentences:
                # Mark selected sentences with special prefix/suffix
                marked_script.append([
                    f"[[SELECTED FOR MODIFICATION: {idx}]] {line} [[END SELECTED]]",
                    f"[[SELECTED FOR MODIFICATION: {idx}]] {art_direction} [[END SELECTED]]"
                ])
            else:
                # Mark non-selected sentences as should be preserved
                marked_script.append([
                    f"[[PRESERVE: {idx}]] {line} [[END PRESERVE]]",
                    f"[[PRESERVE: {idx}]] {art_direction} [[END PRESERVE]]"
                ])
        
        # Replace the original script with the marked version
        enhanced_inputs["current_script"] = marked_script
        
        # Add explicit instruction about only modifying selected sentences
        enhanced_inputs["explicit_instruction"] = f"""
IMPORTANT: You MUST ONLY modify sentences marked with [[SELECTED FOR MODIFICATION]].
DO NOT change ANY part of sentences marked with [[PRESERVE]].
Your task is to apply the improvement instruction ONLY to the selected sentences.
For any sentence not selected (marked with PRESERVE), return it EXACTLY as provided.
The indices that should be modified are: {selected_sentences}
"""
        
        logging.debug(f"Enhanced inputs to regenerate_script crew: {json.dumps(enhanced_inputs, indent=2)}")
        
        script_gen_dir = Path(__file__).parent / "regenerate_script" / "src"
        os.chdir(script_gen_dir)
        
        # Define possible output paths
        possible_output_paths = [
            Path("/home/azureuser/marketing-app-ad-gen/backend/regenerate_script/refined_script.md"),
            Path(script_gen_dir) / "home" / "azureuser" / "marketing-app-ad-gen" / "backend" / "regenerate_script" / "refined_script.md",
            Path(__file__).parent / "regenerate_script" / "refined_script.md"
        ]
        
        # Clean up any existing files at these paths
        for output_path in possible_output_paths:
            if output_path.exists():
                output_path.unlink()
            
        # Print debug information
        logging.info(f"Possible script regeneration output paths: {possible_output_paths}")
        logging.info(f"Current working directory: {os.getcwd()}")
        
        result = subprocess.run(
            ["python", "-m", "regenerate_script.main"],
            env={
                **os.environ,
                "PYTHONPATH": str(script_gen_dir),
                "CREW_INPUTS": json.dumps(enhanced_inputs)
            },
            capture_output=True,
            text=True
        )
        
        # Log the output for debugging
        logging.info(f"Script regeneration output: {result.stdout}")
        logging.info(f"Script regeneration errors: {result.stderr}")
        
        logging.debug(f"RegenerateScript result: {result.stdout}")
        if result.returncode != 0:
            logging.error(f"RegenerateScript Error: {result.stderr}")
            raise RuntimeError(f"RegenerateScript Error: {result.stderr}")
        
        # Check all possible output paths
        for output_path in possible_output_paths:
            if output_path.exists():
                logging.info(f"Found output file at {output_path}")
                output_text = output_path.read_text()
                # Process the output to remove the markers and enforce constraints
                processed_output, validation_meta = process_marked_output(output_text, current_script, selected_sentences)
                return processed_output, validation_meta
        
        # Try to parse the output directly from stdout if no file is found
        if "Final Answer:" in result.stdout:
            logging.info("Trying to parse script from stdout")
            answer_text = result.stdout.split("Final Answer:")[1].strip()
            processed_output, validation_meta = process_marked_output(answer_text, current_script, selected_sentences)
            return processed_output, validation_meta
                
        # Additional debug information if file not found
        logging.error(f"Output file not found at any of the expected paths")
        all_md_files = list(Path(script_gen_dir).glob('**/*.md'))
        logging.error(f"All markdown files in script_gen_dir: {all_md_files}")
        logging.error(f"Directory contents: {list(Path(__file__).parent.glob('**/*.md'))}")
        
        # If no output file was created, try to parse from stdout
        parsed_output, validation_meta = process_marked_output(result.stdout, current_script, selected_sentences)
        return parsed_output, validation_meta
    except Exception as e:
        logging.error(f"Failed to run regenerate_script crew: {str(e)}")
        raise RuntimeError(f"Failed to run regenerate_script crew: {str(e)}")
    finally:
        os.chdir(Path(__file__).parent)

def process_marked_output(output_text: str, original_script: List[Tuple[str, str]], selected_sentences: List[int]) -> Tuple[List[Dict[str, str]], Dict[str, Any]]:
    """
    Process the output from the crew to:
    1. Remove markers from the output
    2. Verify that only selected sentences have been modified
    3. Revert any unauthorized changes to non-selected sentences
    
    This creates a safety mechanism regardless of what the crew returns.
    
    Returns:
        A tuple containing:
        - The verified script with only authorized changes
        - Metadata about the validation process (reverted changes, etc.)
    """
    meta = {
        "reverted_changes": [],
        "had_unauthorized_changes": False,
        "had_length_mismatch": False,
        "original_length": len(original_script),
        "received_length": 0
    }
    
    try:
        # First, try to parse the output normally
        parsed_script = parse_script_output(output_text)
        meta["received_length"] = len(parsed_script)
        
        # Validate script length
        if len(parsed_script) != len(original_script):
            meta["had_length_mismatch"] = True
            logging.warning(f"Script length mismatch: original={len(original_script)}, received={len(parsed_script)}. Adjusting to match original length.")
            # If the lengths don't match, we'll keep the original script length
            # Truncate if too long, or extend with original sentences if too short
            if len(parsed_script) > len(original_script):
                parsed_script = parsed_script[:len(original_script)]
            else:
                for i in range(len(parsed_script), len(original_script)):
                    parsed_script.append({
                        "line": original_script[i][0],
                        "artDirection": original_script[i][1]
                    })
        
        # Remove markers from the generated script
        for item in parsed_script:
            for marker in ["[[SELECTED FOR MODIFICATION: ", "[[PRESERVE: ", "]] ", " [[END SELECTED]]", " [[END PRESERVE]]"]:
                if "line" in item and isinstance(item["line"], str):
                    item["line"] = item["line"].replace(marker, "")
                if "artDirection" in item and isinstance(item["artDirection"], str):
                    item["artDirection"] = item["artDirection"].replace(marker, "")
        
        # Step 2: Verify and enforce that only selected sentences were modified
        verified_script = []
        
        for i, (orig_line, orig_art) in enumerate(original_script):
            # Get the corresponding generated item
            gen_item = parsed_script[i] if i < len(parsed_script) else {"line": "", "artDirection": ""}
            
            # If this is not a selected sentence, ensure it remains unchanged
            if i not in selected_sentences:
                # Check if the line or art direction was modified
                if gen_item.get("line", "") != orig_line or gen_item.get("artDirection", "") != orig_art:
                    meta["had_unauthorized_changes"] = True
                    meta["reverted_changes"].append({
                        "index": i,
                        "original": {"line": orig_line, "artDirection": orig_art},
                        "attempted": {"line": gen_item.get("line", ""), "artDirection": gen_item.get("artDirection", "")}
                    })
                    logging.warning(f"Unauthorized change detected for sentence {i}. Reverting to original.")
                    verified_script.append({
                        "line": orig_line,
                        "artDirection": orig_art
                    })
                else:
                    # No changes detected, keep as is
                    verified_script.append(gen_item)
            else:
                # This is a selected sentence, accept the changes
                verified_script.append(gen_item)
        
        if meta["had_unauthorized_changes"]:
            logging.info(f"Some unauthorized changes were reverted in the generated script: {len(meta['reverted_changes'])} sentences affected.")
        
        return verified_script, meta
        
    except Exception as e:
        logging.error(f"Error processing marked output: {str(e)}")
        # Fall back to returning the original script if there's a critical error
        meta["error"] = str(e)
        return [{"line": line, "artDirection": art} for line, art in original_script], meta

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
        logging.info(f"Regenerate script request received for {len(request.selected_sentences)} selected sentences")
        
        # Validate the request
        if not request.selected_sentences:
            logging.warning("No sentences were selected for refinement")
            raise HTTPException(
                status_code=400, 
                detail="At least one sentence must be selected for refinement"
            )
        
        if not request.improvement_instruction:
            logging.warning("No improvement instruction was provided")
            raise HTTPException(
                status_code=400, 
                detail="An improvement instruction must be provided"
            )
        
        # Process the request
        original_script = request.current_script
        
        try:
            full_script_output, validation_meta = await run_regenerate_script_crew(request.dict())
            
            # Identify which selected sentences were actually modified
            modified_indices = []
            modified_sentences = []
            
            for i in request.selected_sentences:
                if i < len(full_script_output) and i < len(original_script):
                    orig_line = original_script[i][0]
                    orig_art = original_script[i][1]
                    
                    new_line = full_script_output[i].get("line", "")
                    new_art = full_script_output[i].get("artDirection", "")
                    
                    # Check if the sentence was actually modified
                    if new_line != orig_line or new_art != orig_art:
                        modified_indices.append(i)
                        modified_sentences.append(full_script_output[i])
            
            logging.info(f"Script regeneration complete. {len(modified_indices)} out of {len(request.selected_sentences)} selected sentences were modified.")
            
            return RefineScriptResponse(
                status="success",
                data=modified_sentences,
                modified_indices=modified_indices,
                validation=validation_meta
            )
        except Exception as e:
            logging.error(f"Error in regenerate_script_crew: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to regenerate script: {str(e)}")
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logging.error(f"Unexpected error in regenerate_script endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/generate_audio", response_model=GenerateAudioResponse)
async def generate_audio(request: AudioRequest):
    """
    Generate audio from a script using the Parler TTS model.
    """
    try:
        # Import here to avoid circular imports
        from utils.tts_integration.tts_integration import call_parler_tts_api
        
        # Convert our AudioRequest to a format expected by the TTS integration
        script = [(script.line, script.artDirection) for script in request.script]

        # Generate audio from the script
        audio_url = await call_parler_tts_api(script)
        
        # Return the audio URL
        return GenerateAudioResponse(audioUrl=audio_url)
    except Exception as e:
        logging.error(f"Audio generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate audio: {str(e)}")

@app.get("/test_connection")
async def test_connection():
    """Test endpoint to verify backend connectivity."""
    try:
        # Get the working directory and possible script paths for debugging
        current_dir = os.getcwd()
        script_gen_dir = Path(__file__).parent / "script_generation" / "src"
        
        # List possible script paths to verify they're correct
        possible_output_paths = [
            Path("/home/azureuser/marketing-app-ad-gen/backend/script_generation/radio_script.md"),
            Path(script_gen_dir) / "home" / "azureuser" / "marketing-app-ad-gen" / "backend" / "script_generation" / "radio_script.md",
            Path(__file__).parent / "script_generation" / "radio_script.md"
        ]
        
        # Check if we can access these paths
        path_access = {}
        for path in possible_output_paths:
            path_access[str(path)] = {
                "exists": path.exists(),
                "is_dir": path.is_dir() if path.exists() else None,
                "parent_exists": path.parent.exists(),
                "permissions": oct(os.stat(path).st_mode)[-3:] if path.exists() else None
            }
            
        return {
            "status": "connected",
            "message": "Backend is running properly",
            "working_directory": current_dir,
            "script_paths": path_access,
            "env_vars": {
                "PYTHONPATH": os.environ.get("PYTHONPATH", "Not set"),
                "CREW_API_KEY_SET": bool(os.environ.get("CREW_API_KEY")),
                "OPENAI_API_KEY_SET": bool(os.environ.get("OPENAI_API_KEY"))
            }
        }
    except Exception as e:
        logging.error(f"Error in test_connection: {str(e)}")
        return {
            "status": "error",
            "message": f"Backend encountered an error: {str(e)}"
        }

# Test function for validation mechanism (for development purposes)
def test_validation():
    """
    Test function that simulates various scenarios to verify the validation mechanism works correctly.
    This is intended for development/debugging only.
    """
    # Sample original script
    original_script = [
        ("Original line 1", "Original art direction 1"),
        ("Original line 2", "Original art direction 2"),
        ("Original line 3", "Original art direction 3"),
        ("Original line 4", "Original art direction 4"),
    ]
    
    # Test Case 1: Script with only authorized changes
    print("\n=== Test Case 1: Only authorized changes ===")
    selected_sentences = [1, 2]  # Indices 1 and 2 are selected
    generated_output = '''[
        ("Original line 1", "Original art direction 1"),
        ("Modified line 2", "Modified art direction 2"),
        ("Modified line 3", "Modified art direction 3"),
        ("Original line 4", "Original art direction 4")
    ]'''
    
    result, meta = process_marked_output(generated_output, original_script, selected_sentences)
    print(f"Selected sentences: {selected_sentences}")
    print(f"Original script: {original_script}")
    print(f"Generated script: {result}")
    print(f"Validation metadata: {json.dumps(meta, indent=2)}")
    
    # Test Case 2: Script with unauthorized changes
    print("\n=== Test Case 2: Unauthorized changes ===")
    selected_sentences = [1]  # Only index 1 is selected
    generated_output = '''[
        ("THIS SHOULD BE REVERTED", "THIS SHOULD ALSO BE REVERTED"),
        ("Modified line 2", "Modified art direction 2"),
        ("THIS SHOULD BE REVERTED TOO", "AND THIS"),
        ("YET ANOTHER UNAUTHORIZED CHANGE", "ANOTHER ONE")
    ]'''
    
    result, meta = process_marked_output(generated_output, original_script, selected_sentences)
    print(f"Selected sentences: {selected_sentences}")
    print(f"Original script: {original_script}")
    print(f"Generated script: {result}")
    print(f"Validation metadata: {json.dumps(meta, indent=2)}")
    
    # Test Case 3: Script with missing lines
    print("\n=== Test Case 3: Script with missing lines ===")
    selected_sentences = [2, 3]  # Indices 2 and 3 are selected
    generated_output = '''[
        ("Original line 1", "Original art direction 1"),
        ("Original line 2", "Original art direction 2")
    ]'''
    
    result, meta = process_marked_output(generated_output, original_script, selected_sentences)
    print(f"Selected sentences: {selected_sentences}")
    print(f"Original script: {original_script}")
    print(f"Generated script: {result}")
    print(f"Validation metadata: {json.dumps(meta, indent=2)}")
    
    # Test Case 4: Script with extra lines
    print("\n=== Test Case 4: Script with extra lines ===")
    selected_sentences = [0]  # Only index 0 is selected
    generated_output = '''[
        ("Modified line 1", "Modified art direction 1"),
        ("Original line 2", "Original art direction 2"),
        ("Original line 3", "Original art direction 3"),
        ("Original line 4", "Original art direction 4"),
        ("EXTRA LINE THAT SHOULD BE REMOVED", "EXTRA ART DIRECTION")
    ]'''
    
    result, meta = process_marked_output(generated_output, original_script, selected_sentences)
    print(f"Selected sentences: {selected_sentences}")
    print(f"Original script: {original_script}")
    print(f"Generated script: {result}")
    print(f"Validation metadata: {json.dumps(meta, indent=2)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
    # Uncomment the following line to run validation tests
    # test_validation() 