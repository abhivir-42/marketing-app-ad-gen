#!/usr/bin/env python
import sys
import warnings
import os
import json
from regenerate_script.crew import ScriptRefinement
import dotenv 

# Add dotenv loading at the top of the file
# load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
dotenv.load_dotenv()
openai_api_key = os.environ.get("OPENAI_API_KEY")

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

def run(inputs: dict):
    """
    Run the ScriptRefinement crew with inputs for refining an ad script and art direction.
    
    Expected Inputs (JSON):
      - product_name: The name of the product.
      - target_audience: The target audience (e.g., "Teens", "Small Business Owners").
      - key_selling_points: Key selling points of the product.
      - tone: The desired tone (e.g., "Fun", "Professional", "Urgent").
      - ad_length: The duration of the ad (15s, 30s, 60s).
      - speaker_voice: The voice (Male, Female, or Either).
      - current_script: List of tuples representing the current script and art direction.
        Each sentence is marked with either [[SELECTED FOR MODIFICATION]] or [[PRESERVE]] tags.
      - selected_sentences: List of indices indicating which sentences to refine.
      - improvement_instruction: A description of how the selected lines should be changed.
      - explicit_instruction: Specific instructions emphasizing that ONLY selected sentences should be modified.
    
    This crew will refine ONLY the selected sentences per the improvement_instruction,
    while keeping all other sentences COMPLETELY UNCHANGED.
    
    Validation Process:
    After the crew generates the refined script, a validation process will:
    1. Verify that only the specified sentences were modified
    2. Revert any changes to non-selected sentences
    3. Report metadata about validation results
    
    The validation enforces the following constraints:
    - Only sentences marked with [[SELECTED FOR MODIFICATION]] can be changed
    - All sentences marked with [[PRESERVE]] must remain exactly as provided
    - The script length must match the original script length
    
    Example of Expected Output Format:
    [
      ("First line of the script", "Speak with enthusiasm"),
      ("Second line with refinements applied", "Speak softly with increasing intensity"),
      ("Third line of the script", "Dramatic pause, then continue with authority")
    ]
    
    Note that:
    - Only the selected sentences will be modified based on the improvement instruction
    - All markers will be removed from the final output
    - The system will verify compliance with modification constraints
    """
    try:
        ScriptRefinement().crew().kickoff(inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while running the refinement crew: {e}")

def train():
    """
    Train the ScriptRefinement crew for a given number of iterations.
    """
    inputs = {
        "product_name": "Eco-Friendly Cleaning Products",
        "target_audience": "Environmentally conscious consumers",
        "key_selling_points": "green, sustainable, non-toxic, organic",
        "tone": "Professional",
        "ad_length": "30s",
        "speaker_voice": "Either",
        "current_script": [
            ("Original line 1 text", "Original art direction for line 1"),
            ("Original line 2 text", "Original art direction for line 2"),
            ("Original line 3 text", "Original art direction for line 3")
        ],
        "selected_sentences": [1],  # Example: refine the second sentence (index 1)
        "improvement_instruction": "Make the tone more upbeat and add a humorous twist."
    }
    try:
        ScriptRefinement().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while training the refinement crew: {e}")

def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        ScriptRefinement().crew().replay(task_id=sys.argv[1])
    except Exception as e:
        raise Exception(f"An error occurred while replaying the refinement crew: {e}")

def test():
    """
    Test the ScriptRefinement crew execution and return the results.
    """
    inputs = {
        "product_name": "Eco-Friendly Cleaning Products",
        "target_audience": "Environmentally conscious consumers",
        "key_selling_points": "green, sustainable, non-toxic, organic",
        "tone": "Professional",
        "ad_length": "30s",
        "speaker_voice": "Either",
        "current_script": [
            ("Original line 1 text", "Original art direction for line 1"),
            ("Original line 2 text", "Original art direction for line 2"),
            ("Original line 3 text", "Original art direction for line 3")
        ],
        "selected_sentences": [1, 2],
        "improvement_instruction": "Emphasize the eco-friendly aspect and add a witty comment."
    }
    try:
        ScriptRefinement().crew().test(n_iterations=int(sys.argv[1]), openai_model_name=sys.argv[2], inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while testing the refinement crew: {e}")

if __name__ == "__main__":
    # Accept inputs from the CREW_INPUTS environment variable or from the command-line argument.
    input_str = os.environ.get("CREW_INPUTS")
    if input_str:
        try:
            inputs = json.loads(input_str)
        except json.JSONDecodeError:
            print("Invalid JSON in CREW_INPUTS environment variable.")
            sys.exit(1)
    elif len(sys.argv) > 1:
        try:
            inputs = json.loads(sys.argv[1])
        except json.JSONDecodeError:
            print("Invalid JSON argument provided.")
            sys.exit(1)
    else:
        print("No input provided. Please supply a JSON string as a command-line argument or set the CREW_INPUTS environment variable.")
        sys.exit(1)
    
    run(inputs)
