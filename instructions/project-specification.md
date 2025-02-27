# Project Specification: AI-Powered Radio Ad Generation Tool

## Overview

This project is an AI-powered tool for generating professional radio ads. Users can generate an ad script, accompanying art direction, and audio output—all in one place. The tool leverages a FastAPI backend, integrates with a crew AI system for generating and refining ad scripts, and uses a TTS service for audio generation.

The application follows a modern web architecture with a Next.js frontend and FastAPI backend, providing an intuitive workflow for iterative ad creation.

---

## System Architecture

### Frontend (Next.js)
- **Framework:** Next.js with TypeScript and Tailwind CSS
- **Key Pages:**
  - Landing Page - Introduction and overview of the tool
  - Script Generation Page - Collect user inputs to generate ad scripts
  - Results Page - Display and refine generated scripts
  - TTS Page - Generate and download audio output

### Backend (FastAPI)
- **Framework:** FastAPI with Python
- **Key Endpoints:**
  - `/generate_script` - Generate initial ad scripts
  - `/regenerate_script` - Refine selected script sentences
  - `/generate_audio` - Create audio from scripts (placeholder)

### Crew AI Integration
- **script_generation:** Generates initial ad scripts based on user inputs
- **regenerate_script:** Refines selected script sentences based on user instructions

---

## Detailed Feature Specification

### 1. Landing Page

**Purpose:**  
Introduce users to the tool and explain its value proposition.

**Key Elements:**
1. **Hero Section:**
   - **Headline:** "Generate, Iterate & Perfect Your Radio Ads with AI"
   - **Subheadline:** "Craft, refine, and produce professional ads—all in one iterative workflow"
   - **CTA:** "Create Your Perfect Ad →" (Links to Script Generation Page)

2. **How It Works Section:**
   - **Iterative Design Process:**
     1. **Create:** Start with product details to generate a professional script
     2. **Refine:** Iterate on specific sentences to improve the script
     3. **Generate:** Produce the final audio output
     4. **Export:** Download or share the final product

3. **Features Highlight:**
   - AI-generated scripts tailored to your product
   - Art direction guidance for voice actors/producers
   - One-click audio generation
   - Iterative refinement workflow
   - Version history tracking

4. **Testimonials/Use Cases:**
   - Industry-specific examples showing the tool's versatility

### 2. Script Generation Page

**Purpose:**  
Collect detailed user inputs to generate the initial ad script.

**Key Elements:**
- **Form Fields:**
  - **Product Name:** Text field for the product or service name
  - **Target Audience:** Text field for describing the target audience
  - **Key Selling Points:** Text area for listing product benefits and features
  - **Tone:** Selection for the desired tone of the ad
  - **Ad Length:** Options for 15s, 30s, or 60s
  - **Speaker Voice:** Male, Female, or Either
- **Industry Templates:** Pre-filled examples for different industries to help users get started
- **Submit Button:** "Generate Script" triggers the script_generation crew

### 3. Results Page

**Purpose:**  
Display and allow refinement of the generated script.

**Key Elements:**
- **Script Display:**
  - Each sentence shown with its corresponding art direction
  - Checkboxes for selecting sentences for refinement
  - Inline editing capabilities for manual adjustments
- **Refinement Tools:**
  - Text field for providing improvement instructions
  - "Refine with AI" button to trigger the regenerate_script crew
- **Version History:**
  - Automatic tracking of script versions
  - Ability to restore previous versions
- **Audio Preview:**
  - Generate preview audio with adjustable speed and pitch
- **Navigation:**
  - Proceed to TTS Page for final audio generation
  - Return to Script Generation Page for major revisions

### 4. TTS Generation & Export Page

**Purpose:**  
Generate the final audio output with customization options.

**Key Elements:**
- **Audio Generation Controls:**
  - Adjust speech speed and pitch
  - Generate high-quality audio output
- **Audio Player:**
  - Preview the generated audio
  - Download options for various formats
- **Progress Tracking:**
  - Visual indication of audio generation progress
- **Error Handling:**
  - Clear error messages with retry options

---

## Technical Implementation Details

### Backend API

#### 1. Generate Script Endpoint
- **Route:** `/generate_script`
- **Method:** POST
- **Request Body:**
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
- **Response:**
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

#### 2. Regenerate Script Endpoint
- **Route:** `/regenerate_script`
- **Method:** POST
- **Request Body:**
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
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "line": "Refined script sentence",
        "artDirection": "Updated art direction"
      }
    ]
  }
  ```

### Crew AI Integration

The backend uses subprocess calls to run the crew AI scripts, passing user inputs via environment variables and collecting outputs from generated markdown files.

#### script_generation Crew
- Takes product details, audience information, and tone preferences
- Outputs a structured list of script sentences with accompanying art direction

#### regenerate_script Crew
- Takes the current script, selected sentences, and improvement instructions
- Outputs refined sentences that maintain consistency with the rest of the script

### Frontend Services

The frontend uses an API service layer to communicate with the backend:

```typescript
const api = {
  generateScript: async (data) => {
    // Transform data and call backend
    const response = await axios.post('/generate_script', transformedData);
    return response.data.script;
  },
  
  refineScript: async (data) => {
    // Transform data and call backend
    const response = await axios.post('/regenerate_script', transformedData);
    return response.data.data;
  }
};
```

---

## Future Enhancements

1. **TTS Integration:** Complete integration with a production-ready TTS service
2. **User Accounts:** Add user authentication to save projects and preferences
3. **Export Options:** Enhance export capabilities with more formats and sharing options
4. **Analytics:** Add usage tracking and performance analytics
5. **Mobile Optimization:** Enhance responsive design for better mobile experience
6. **Advanced Customization:** Add more advanced customization options for script and audio generation

---

This specification reflects the current implementation of the AI-Powered Radio Ad Generation Tool, which provides an end-to-end solution for creating professional radio advertisements using AI.
