#!/usr/bin/env python
import sys
import warnings
import os
import dotenv
import json

from script_generation.crew import ScriptGeneration

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")
dotenv.load_dotenv()

# This main file is intended to be a way for you to run your
# crew locally, so refrain from adding unnecessary logic into this file.
# Replace with inputs you want to test with, it will automatically
# interpolate any tasks and agents information

openai_api_key = os.environ.get("OPENAI_API_KEY")

def run(inputs: dict):
    """
    Run the ScriptGeneration crew with inputs for generating an ad script and art direction.
    """
    try:
        ScriptGeneration().crew().kickoff(inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")


def train():
    """
    Train the crew for a given number of iterations.
    """
    inputs = {
        "product_name": "Eco-Friendly Cleaning Products",
        "target_audience": "Environmentally conscious consumers",
        "key_selling_points": "green, sustainable, non-toxic, organic",
        "tone": "Professional",
        "ad_length": "30s",
        "speaker_voice": "Either"
    }
    try:
        ScriptGeneration().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")

def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        ScriptGeneration().crew().replay(task_id=sys.argv[1])
    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")


def test():
    """
    Test the crew execution and return the results.
    """
    inputs = {
        "product_name": "Eco-Friendly Cleaning Products",
        "target_audience": "Environmentally conscious consumers",
        "key_selling_points": "green, sustainable, non-toxic, organic",
        "tone": "Professional",
        "ad_length": "30s",
        "speaker_voice": "Either"
    }
    try:
        ScriptGeneration().crew().test(n_iterations=int(sys.argv[1]), openai_model_name=sys.argv[2], inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")
    
if __name__ == "__main__":
    # Accept inputs from an environment variable or command-line argument.
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
