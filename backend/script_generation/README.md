# Script Generation Module

This module provides AI-powered generation of radio ad scripts and accompanying art direction based on user inputs.

## Key Features

- Comprehensive script generation based on product details
- Tailored to specified audience, tone, and length requirements
- Includes accompanying art direction for each script line
- Professional output with natural language flow

## Script Generation Process

The script generation process follows these steps:

1. **Input Collection**: User provides product details, target audience, key selling points, tone preferences, and length requirements.

2. **AI Processing**: The CrewAI system processes these inputs to generate a professional radio ad script with art direction.

3. **Output Formatting**: The system returns a structured script with corresponding art direction for each line.

4. **Quality Assurance**: The script is optimized for the specified length, tone, and coherence.

## Input and Output Format

### Input Format

The input to the generation process includes:

- **product_name**: Name of the product or service
- **target_audience**: Description of the target audience
- **key_selling_points**: Key features and benefits
- **tone**: Desired tone of the ad (e.g., "Fun", "Professional", "Urgent")
- **ad_length**: Duration in seconds (15, 30, or 60)
- **speaker_voice**: Preferred voice type (Male, Female, or Either)

Example input:
```json
{
  "product_name": "Eco-Friendly Cleaning Products",
  "target_audience": "Environmentally conscious consumers",
  "key_selling_points": "green, sustainable, non-toxic, organic",
  "tone": "Professional",
  "ad_length": 30,
  "speaker_voice": "Either"
}
```

### Expected Output Format

The expected output is a list of tuples containing script lines and corresponding art direction:

```
[
  ("Line one of the script.", "Art direction for line one."),
  ("Line two of the script.", "Art direction for line two."),
  ("Line three of the script.", "Art direction for line three."),
  ...
]
```

## API Response

The API returns:
- **success**: Boolean indicating success
- **script**: List of script objects with line and art direction

```json
{
  "success": true,
  "script": [
    {
      "line": "Are you tired of harsh chemicals in your home?",
      "artDirection": "Speak with concern and slight frustration"
    },
    {
      "line": "Introducing Eco-Clean, the all-natural cleaning solution.",
      "artDirection": "Transition to an upbeat, positive tone"
    },
    {
      "line": "Made with organic ingredients, it's safe for your family and the planet.",
      "artDirection": "Speak warmly and reassuringly"
    }
  ]
}
```

## Integration with Script Refinement

Once a script is generated, it can be selectively refined using the Script Refinement module. The refinement process allows for precise improvements to specific parts of the script while preserving the rest.

See the [Script Refinement Module](../regenerate_script/README.md) documentation for details on how to refine generated scripts.

## Best Practices

For optimal script generation results:

1. **Be Specific**: Provide detailed information about the product and target audience
2. **Highlight Key Benefits**: Clearly articulate the unique selling points
3. **Define Tone Clearly**: Be specific about the desired tone (e.g., "professional but approachable")
4. **Consider Length**: Adjust the detail level based on the desired ad length
5. **Review and Refine**: Use the refinement process to perfect specific sections
