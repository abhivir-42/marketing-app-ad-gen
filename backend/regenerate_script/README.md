# RegenerateScript Crew

Welcome to the RegenerateScript Crew project, powered by [crewAI](https://crewai.com). This template is designed to help you set up a multi-agent AI system with ease, leveraging the powerful and flexible framework provided by crewAI. Our goal is to enable your agents to collaborate effectively on complex tasks, maximizing their collective intelligence and capabilities.

## Installation

Ensure you have Python >=3.10 <3.13 installed on your system. This project uses [UV](https://docs.astral.sh/uv/) for dependency management and package handling, offering a seamless setup and execution experience.

First, if you haven't already, install uv:

```bash
pip install uv
```

Next, navigate to your project directory and install the dependencies:

(Optional) Lock the dependencies and install them by using the CLI command:
```bash
crewai install
```
### Customizing

**Add your `OPENAI_API_KEY` into the `.env` file**

- Modify `src/regenerate_script/config/agents.yaml` to define your agents
- Modify `src/regenerate_script/config/tasks.yaml` to define your tasks
- Modify `src/regenerate_script/crew.py` to add your own logic, tools and specific args
- Modify `src/regenerate_script/main.py` to add custom inputs for your agents and tasks

## Running the Project

To kickstart your crew of AI agents and begin task execution, run this from the root folder of your project:

```bash
$ crewai run
```

This command initializes the regenerate_script Crew, assembling the agents and assigning them tasks as defined in your configuration.

This example, unmodified, will run the create a `report.md` file with the output of a research on LLMs in the root folder.

## Understanding Your Crew

The regenerate_script Crew is composed of multiple AI agents, each with unique roles, goals, and tools. These agents collaborate on a series of tasks, defined in `config/tasks.yaml`, leveraging their collective skills to achieve complex objectives. The `config/agents.yaml` file outlines the capabilities and configurations of each agent in your crew.

## Support

For support, questions, or feedback regarding the RegenerateScript Crew or crewAI.
- Visit our [documentation](https://docs.crewai.com)
- Reach out to us through our [GitHub repository](https://github.com/joaomdmoura/crewai)
- [Join our Discord](https://discord.com/invite/X4JWnZnxPb)
- [Chat with our docs](https://chatg.pt/DWjSBZn)

Let's create wonders together with the power and simplicity of crewAI.

# Script Refinement Module

This module provides a controlled way to refine specific sentences in an ad script while strictly preserving the rest of the content.

## Key Features

- Selective refinement of only explicitly marked sentences
- Robust validation mechanism to prevent unauthorized changes
- Comprehensive error handling and reporting
- Detailed validation metadata for transparency

## Script Refinement Process

The script refinement process follows these steps:

1. **Input Preparation**: The original script is marked with special tags to indicate which sentences can be modified (`[[SELECTED FOR MODIFICATION]]`) and which must be preserved (`[[PRESERVE]]`).

2. **AI Processing**: The marked script is processed by a specialized AI agent that applies the requested improvements ONLY to selected sentences.

3. **Validation**: A robust validation mechanism verifies that only authorized changes were made and enforces script integrity.

4. **Response**: The system returns the refined script with only the authorized changes, along with validation metadata.

## Validation System

The validation system is a critical component that ensures the integrity of the refinement process:

### What It Does

- Verifies that only selected sentences are modified
- Reverts any unauthorized changes to non-selected sentences
- Handles script length mismatches
- Provides detailed metadata about the validation process

### Validation Checks

- **Unauthorized Changes**: Any changes to sentences not marked for modification are detected and reverted
- **Length Mismatches**: Scripts that are too long are truncated; scripts that are too short are extended with original content
- **Marker Removal**: All markers are removed from the final output

## Input and Output Format

### Input Format

The input to the refinement process includes:

- **current_script**: The original script with special markers
- **selected_sentences**: Indices of sentences that can be modified
- **improvement_instruction**: Description of how to improve the selected sentences

Example of marked input:
```
[
  ["[[PRESERVE: 0]] Line one of script. [[END PRESERVE]]", "[[PRESERVE: 0]] Speak with enthusiasm. [[END PRESERVE]]"],
  ["[[SELECTED FOR MODIFICATION: 1]] Line two needs improvement. [[END SELECTED]]", "[[SELECTED FOR MODIFICATION: 1]] Speak calmly. [[END SELECTED]]"],
  ["[[PRESERVE: 2]] Line three is fine. [[END PRESERVE]]", "[[PRESERVE: 2]] Speak with authority. [[END PRESERVE]]"]
]
```

### Expected Output Format

The expected output is a list of tuples WITHOUT any markers:

```
[
  ("Line one of script.", "Speak with enthusiasm."),
  ("Line two has been improved!", "Speak calmly with a hint of excitement."),
  ("Line three is fine.", "Speak with authority.")
]
```

## Validation Response Metadata

The validation process generates metadata about the validation result:

```json
{
  "had_unauthorized_changes": false,
  "reverted_changes": [],
  "had_length_mismatch": false,
  "original_length": 3,
  "received_length": 3,
  "error": null
}
```

If unauthorized changes are detected:

```json
{
  "had_unauthorized_changes": true,
  "reverted_changes": [
    {
      "index": 0,
      "original": {
        "line": "Original line",
        "artDirection": "Original direction"
      },
      "attempted": {
        "line": "Unauthorized change",
        "artDirection": "Unauthorized direction"
      }
    }
  ],
  "had_length_mismatch": false,
  "original_length": 3,
  "received_length": 3,
  "error": null
}
```

## API Response

The API returns:
- **status**: Result status
- **data**: Only modified sentences
- **modified_indices**: Indices of the modified sentences
- **validation**: Validation metadata

```json
{
  "status": "success",
  "data": [
    {
      "line": "Modified line two",
      "artDirection": "Modified direction two"
    }
  ],
  "modified_indices": [1],
  "validation": {
    "had_unauthorized_changes": false,
    "reverted_changes": [],
    "had_length_mismatch": false,
    "original_length": 3,
    "received_length": 3,
    "error": null
  }
}
```

## Running Examples

You can see examples of the validation process by running:

```bash
python run_validation_examples.py
```

This will demonstrate:
- Example 1: Only authorized changes (expected behavior)
- Example 2: Unauthorized changes that get reverted
- Example 3: Script with missing lines
- Example 4: Script with extra lines
- Example 5: Marker removal
