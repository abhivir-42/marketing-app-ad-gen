# Project Specification: AI-Powered Radio Ad Generation Tool

<!--
This file contains the complete product specification for the AI-powered radio ad generation tool.
It outlines the user interface requirements, backend integration details, crew AI system interactions,
and instructions for code generation. The file includes detailed instructions for each page of the tool,
including placeholders (marked with curly brackets {}) for further implementation. The Parler TTS API
integration is left as a placeholder with a "# TODO" comment. The backend is built using FastAPI,
and the crew integration with the script_generation and regenerate_script crews is performed via POST requests.
Please refer to the "crew-and-backend-integration.md" file in the Instructions folder for more details.
-->

---

## Overview

This project is an AI-powered tool for generating professional radio ads. Users can generate an ad script,
accompanying art direction, and audio output—all in one place. The tool leverages a FastAPI backend, integrates with
a crew AI system for generating and refining ad scripts, and uses a fine-tuned TTS service (Parler TTS) for audio generation.

No full database is required; this is a temporary-use tool where user inputs and outputs are processed on the fly.

---

## Code Generation Instructions for Cursor AI

- **Comments & Documentation:**  
  Include clear comments at the top of each generated code file describing:
  - What the file contains.
  - How the code works.
  - How to use the code.
- **Parler TTS API:**  
  Leave the TTS API integration as a placeholder. Add a comment with `# TODO` describing that the API call should:
  - Send a POST request containing the combined script, speed, and pitch parameters.
  - Receive and process an audio file URL or binary data.
- **Backend Framework:**  
  Use FastAPI for the backend.
- **Crew Integration:**  
  - Connect with the crew AI system via POST requests.
  - Reference the `crew-and-backend-integration.md` file in the Instructions folder for details.
- **Crews:**  
  - **script_generation:** Triggered by the "Generate Script" button on the Script Generation Page.
  - **regenerate_script:** Triggered by the "Refine with AI" button on the Script & Art Direction Results Page.  
    Only trigger if at least one sentence is selected and the improvement instruction is provided.  
    If not, display: "Please select the sentences to be refined and tell us what kind of change you want to make."
- **Output Format:**  
  Both crews output a list of tuples. Each tuple contains:
  1. A line of the script.
  2. The corresponding art direction.
- **User Interface:**  
  Display the tuples nicely with checkboxes next to each sentence for selection and refinement.

---

## Detailed Project Specification

### 1. Landing Page

**Purpose:**  
Attract users, explain the app’s value, and guide them to start creating.

**Key Elements:**

1. **Hero Section:**
   - **Headline:** "Generate Professional Radio Ads in Minutes—Powered by AI."
   - **Subheadline:** "Craft scripts, art direction, and audio—all in one place."
   - **CTA:** "Create Your Customised Ad →"  
     *Links to the Script Generation Page.*
   - **Preview of Sample Ad Output:**  
     Display an example product’s name and a “Play Audio” button.  
     **{leave a placeholder here that I can fill later, comment it in the code with “# TODO” along with another comment describing what needs to go in the placeholder}**

2. **How It Works:**
   - **3-Step Visual Guide:**
     1. **Input:** Describe your product (e.g., “Vegan protein powder for athletes”).
     2. **Generate:** Get a script + art direction (e.g., “Upbeat tone, woman speaking slowly” where the art direction provides voice instructions for the speaker).
     3. **Export:** Edit your ad script/art direction and then download your advertisement as audio or text.
   - **Animated Demo Video/Gif:**  
     Show the ad creation process.  
     **{leave a placeholder here that I can fill later, comment it in the code with “# TODO” along with another comment describing what needs to go in the placeholder}**

3. **Features Highlight:**
   - AI-generated scripts tailored to your product.
   - Art direction guidance for voice actors/producers.
   - One-click audio generation with our fine-tuned Text to Speech model.
   - Instant editing or refinement with AI feedback.
   - Responsive design.

4. **Testimonials/Use Cases:**
   - Include quotes from fictional early users (e.g., “Saved me 10 hours scripting ads for my bakery!”).
   - Provide industry-specific examples (e.g., SaaS, e-commerce, local services).  
     **{fill in example testimonials yourself, add a comment in the code saying “# TODO” where you have written these testimonials.}**

---

### 2. Core Pages

#### A. Script Generation Page

**When Opened:**  
After clicking “Create Your Customised Ad” on the Landing Page.

**Purpose:**  
Collect user inputs to generate the ad script.

**Key Elements:**
- **Form Fields:**
  - **Product Name:** (text field)
  - **Target Audience:** (dropdown, e.g., “Teens,” “Small Business Owners,” etc.)
  - **Key Selling Points:** (text area with examples)
  - **Tone:** (dropdown, e.g., “Fun,” “Professional,” “Urgent,” etc.)
  - **Ad Length:** (15s, 30s, 60s)
  - **Ad Speaker Voice:** (Male, Female, or Either)
- **Button:** "Generate Script"  
  *Triggers AI processing via the `script_generation` crew.*

#### B. Script & Art Direction Results Page

**When Opened:**  
After the script is generated by clicking the "Generate Script" button.

**Purpose:**  
Display and allow editing of the generated script and art direction.

**Key Elements:**

- **Script Panel:**
  - **Display:** List of sentences (e.g., “1. Tired of bland post-workout shakes?”)
  - **Art Direction Tag:** For each sentence (e.g., “Voice: Excited fit man asking a question while expecting yes as an answer.”)
  - **User Interactions:**
    - **Edit:** Click/hover on a sentence to edit text or art direction inline.
    - **Flag for AI Refinement:**
      - Users select sentences for refinement using checkboxes next to each sentence.
      - Provide a text box below with the label:  
        “How should we improve this line? (e.g., ‘Add a pun about coffee’).”
      - **Button:** "Refine with AI"  
        *Triggers the `regenerate_script` crew.*
      - **Validation:**  
        If no sentence is selected or the text box is empty, display:  
        "Please select the sentences to be refined and tell us what kind of change you want to make."

- **Audio Preview:**  
  At the top right, auto-generate a TTS version of the first 2 sentences for context.

- **Top Toolbar:**
  - **Regenerate Entire Script:**  
    Takes the user back to the Script Generation Page with new inputs.
  - **Generate Final Audio:**  
    Progresses the user to the TTS Generation & Export Page.

#### C. TTS Generation & Export Page

**When Opened:**  
After the user finalises the script and clicks “Generate Final Audio.”

**Purpose:**  
Generate and export the audio ad.

**Key Elements:**
- **Generate Audio Button:**  
  Runs the Parler-TTS process with the final script and art direction.
  - **TTS API Integration:**  
    **# TODO:**  
    Integrate with the Parler TTS API by sending a POST request with the combined script, speed, and pitch parameters.  
    The response should include an audio file URL or binary data.
- **Audio Player:**  
  To preview the generated audio.
- **Options:**
  - Adjust speed/pitch.
  - Download as MP3/WAV.
  - Share via link (for team feedback).

---

### 3. Backend and Crew Integration

**Backend Framework:**
- Use FastAPI for backend implementation.
- No persistent database is required; data is transient.

**Crew AI Integration:**
- **script_generation Crew:**  
  - Triggered when the "Generate Script" button is pressed.
  - Generates a list of tuples (each tuple: script line and corresponding art direction) via a POST request to the crew AI system.
  - Results are displayed on the Script & Art Direction Results Page.
- **regenerate_script Crew:**  
  - Triggered when the "Refine with AI" button is pressed.
  - Refines selected sentences based on user input.
  - **Validation:**  
    If no sentences are selected or the improvement instruction is empty, display:  
    "Please select the sentences to be refined and tell us what kind of change you want to make."
  - The refined output overwrites the previous script and art direction sentences.

**Output Format:**
- Both crews return a list of tuples:
  - Tuple format: `(script_line, art_direction)`.
- Display these tuples nicely with checkboxes for each sentence for further refinement.

---

## Summary

This document outlines a detailed project specification for an AI-powered radio ad generation tool that:
- Provides an engaging Landing Page to attract users.
- Collects detailed inputs on the Script Generation Page.
- Displays and allows editing of generated ad scripts on the Script & Art Direction Results Page.
- Generates final audio ads on the TTS Generation & Export Page using a placeholder Parler TTS integration.
- Integrates with crew AI systems via FastAPI using POST requests.
- Uses two separate crews (`script_generation` and `regenerate_script`) to generate and refine ad scripts.
- Returns results as a list of tuples, each containing a script line and its corresponding art direction.

All placeholder instructions (marked with curly brackets `{}` and `# TODO` comments) must be filled in during further development or by the respective code generator agent.

---
