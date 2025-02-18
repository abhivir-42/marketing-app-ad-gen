# Ad Generation Tool Product Requirements

This file contains the complete Product Requirements Document for the AI-powered ad generation tool. Cursor AI can refer to this file to generate the code corresponding to the requirements below.

---

## Overview

This ad generation tool enables users to create professional radio ads in minutes by:
- Accepting product and creative inputs.
- Generating a script with accompanying art direction.
- Refining selected parts of the script using AI.
- Producing final audio output using a text-to-speech (TTS) service.

The tool consists of the following core pages:
1. **Landing Page**  
   - Attracts users with an overview, sample ad output, a demo, and testimonials.
2. **Script Generation Page**  
   - Collects user inputs such as product name, target audience, key selling points, tone, ad length, and speaker voice.
   - Contains a "Generate Script" button that triggers the `script_generation` crew.
3. **Script & Art Direction Results Page**  
   - Displays the generated script as a list of tuples (each tuple: script line and art direction).
   - Allows inline editing and selection of sentences for refinement.
   - Contains a "Refine with AI" button that triggers the `regenerate_script` crew.
   - Displays an audio preview of the first two sentences.
   - Includes toolbar options for "Regenerate Entire Script" and "Generate Final Audio."
4. **TTS Generation & Export Page**  
   - Provides a "Generate Audio" button to produce the final audio ad.
   - Offers options to adjust speed/pitch, download as MP3/WAV, or share via link.
   - The Parler TTS API integration is a placeholder for now.

---

## Cursor AI Instructions (Curly Brackets {})

- **{leave a placeholder here that I can fill later, comment it in the code with “# TODO” along with another comment describing what needs to go in the placeholder}**  
  - In the Landing Page sample ad output area, add a placeholder for the example product’s name and a “Play Audio” button.
- **{leave a placeholder here that I can fill later, comment it in the code with “# TODO” along with another comment describing what needs to go in the placeholder}**  
  - In the Landing Page section for the animated demo video/gif.
- **{fill in example testimonials yourself, add a comment in the code saying # TODO where you have written these testimonials.}**  
  - In the Landing Page testimonials section, include fictional early user quotes.

---

## Backend Code Details

The backend is implemented using FastAPI with the following endpoints:

1. **`/generate_script` Endpoint**
   - **Purpose**: Generate an ad script and corresponding art direction.
   - **How it Works**: Accepts user inputs via a POST request, calls the `script_generation` crew (using a POST request), and returns a list of tuples (each tuple contains a script line and its art direction).
   - **Crew Integration**: Refer to `crew-and-backend-integration.md` for details.

2. **`/refine_script` Endpoint**
   - **Purpose**: Refine selected sentences of the generated script.
   - **How it Works**: Receives selected sentence indices, an improvement instruction, and the current script. It validates that at least one sentence is selected and that a change description is provided. If not, it returns an error message. Otherwise, it calls the `regenerate_script` crew and returns the updated list of tuples.
   - **Crew Integration**: Refer to `crew-and-backend-integration.md` for details.

3. **`/generate_audio` Endpoint**
   - **Purpose**: Generate the final audio ad using Parler TTS.
   - **How it Works**: Combines the final script, applies TTS parameters (speed and pitch), and calls the Parler TTS API (currently a placeholder with a `# TODO` note).
   - **TTS Integration**: Update with the actual API call to Parler TTS as needed.

---

## How to Run & Use

- **Running the Application**:  
  Use the command:  
  ```bash
  uvicorn ad_generation_tool:app --reload
