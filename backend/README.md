# AI-Powered Radio Ad Generation Backend

This is the backend service for the AI-Powered Radio Ad Generation Tool, providing API endpoints for generating and refining professional radio ad scripts.

## System Architecture

The backend is built with FastAPI and integrates with CrewAI for script generation and refinement. It provides a robust validation system to ensure script integrity during the refinement process.

## Modules

### [Script Generation Module](./script_generation/README.md)

The Script Generation module creates professional radio ad scripts from scratch based on user inputs like product details, target audience, and desired tone.

**Key Features:**
- Complete ad script generation
- Professional art direction for each line
- Adapts to different ad lengths and tones
- Natural language flow and persuasive structure

[Read the Script Generation documentation](./script_generation/README.md)

### [Script Refinement Module](./regenerate_script/README.md)

The Script Refinement module allows for selective improvement of specific sentences in an existing script while preserving the rest of the content.

**Key Features:**
- Targeted refinement of selected sentences only
- Robust validation mechanism to prevent unauthorized changes
- Detailed validation metadata
- Reverts unauthorized modifications automatically

[Read the Script Refinement documentation](./regenerate_script/README.md)

## API Endpoints

### Generate Script

`POST /generate_script`

Generates a complete ad script based on product details and requirements.

**Request:**
```json
{
  "product_name": "Product Name",
  "target_audience": "Target Audience Description",
  "key_selling_points": "Key features and benefits",
  "tone": "Desired tone",
  "ad_length": 30,
  "speaker_voice": "Male|Female|Either"
}
```

**Response:**
```json
{
  "success": true,
  "script": [
    {
      "line": "Script sentence",
      "artDirection": "Art direction for this line"
    }
  ]
}
```

### Regenerate Script

`POST /regenerate_script`

Refines selected sentences in an existing script while preserving others.

**Request:**
```json
{
  "selected_sentences": [0, 2],
  "improvement_instruction": "Make it more engaging",
  "current_script": [["Line 1", "Art 1"], ["Line 2", "Art 2"]],
  "key_selling_points": "Key features",
  "tone": "Desired tone",
  "ad_length": 30
}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "line": "Refined script sentence",
      "artDirection": "Updated art direction"
    }
  ],
  "modified_indices": [0, 2],
  "validation": {
    "had_unauthorized_changes": false,
    "reverted_changes": [],
    "had_length_mismatch": false,
    "original_length": 3,
    "received_length": 3
  }
}
```

## Validation System

A key feature of this system is the robust validation mechanism implemented in the script refinement process. This ensures that:

1. Only selected sentences are modified
2. Unauthorized changes to non-selected sentences are automatically reverted
3. Script length integrity is maintained
4. Detailed validation metadata is provided

## Example Tools

- `run_validation_examples.py`: Demonstrates the validation process with detailed examples
- `test_validation()`: Function in main.py for testing the validation mechanism

## Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Testing

```bash
# Run validation examples
python run_validation_examples.py

# Uncomment in main.py to run validation tests
# test_validation()
```

## Development

This backend follows a modular design pattern with each function having a single responsibility. The main components are:

1. FastAPI endpoints for handling client requests
2. CrewAI integration for script generation and refinement
3. Validation system for ensuring script integrity
4. Error handling and logging for debugging

When modifying the code, pay special attention to the validation mechanism to maintain script integrity during refinement. 