# Presentation Script: AI-Powered Radio Ad Generation Tool

This script provides a step-by-step guide for presenting the AI-Powered Radio Ad Generation Tool to the Marshall Wace technology team. Follow these instructions to navigate through the presentation smoothly while demonstrating key aspects of the implementation.

## Introduction (2 minutes)

1. Open `project-presentation.md` in presentation mode
2. **Introduction**: "Today I'll be presenting my AI-Powered Radio Ad Generation Tool, a full-stack application that streamlines the process of creating professional radio advertisements."
3. Briefly explain your motivation for building this tool: "This application addresses key challenges in radio ad production by reducing time and cost while maintaining high quality through AI assistance."

## System Architecture (3 minutes)

1. Scroll to the [System Architecture](#system-architecture) section
2. Walk through the architecture diagram: "The application follows a modern architecture with clear separation of concerns between the frontend, backend, and AI services."
3. Open `backend/main.py` and show the FastAPI app setup (lines 1-20)
   ```
   from fastapi import FastAPI, HTTPException
   from fastapi.middleware.cors import CORSMiddleware
   from pydantic import BaseModel, Field
   ...
   
   app = FastAPI()
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
4. Open `ad-generation-tool/src/app/page.tsx` to show the Next.js app entry point
5. Explain: "I chose Next.js for the frontend and FastAPI for the backend to create a modern, responsive application with strong type safety and performance."

## Key Technologies & Implementation Choices (3 minutes)

1. Scroll to the [Key Technologies & Implementation Choices](#key-technologies--implementation-choices) section
2. Discuss the reasoning behind technology choices: "TypeScript provides type safety throughout the frontend, while Pydantic ensures data validation on the backend."
3. Open `ad-generation-tool/src/types/index.ts` to show TypeScript types
4. Scroll back to `backend/main.py` around lines 20-50 to show Pydantic models for API contracts
   ```python
   class ScriptRequest(BaseModel):
       product_name: str
       target_audience: str
       key_selling_points: str
       tone: str
       ad_length: int = Field(..., ge=15, le=60)  # Validate length between 15 and 60 seconds
       speaker_voice: Literal["Male", "Female", "Either"]
   ```
5. Explain: "I've implemented an API-first design with contracts defined by Pydantic models and TypeScript interfaces, ensuring consistency between frontend and backend."

## Detailed Code Flow (5 minutes)

1. Scroll to [Detailed Code Flow](#detailed-code-flow) section
2. For each flow (Script Generation, Script Refinement, Audio Generation):
   - Walk through the sequence diagram
   - Show the corresponding code implementation

### Script Generation Flow
1. Open `ad-generation-tool/src/app/ScriptGenerationPage.tsx` (form submission component)
2. Highlight the form submission function
3. Open `backend/main.py` and show the `/generate_script` endpoint (around line 327)
4. Open `backend/script_generation/src/script_generation/crew.py` to show CrewAI integration
5. Explain: "The script generation flow starts with user input, gets processed through CrewAI agents, and returns with both script content and voice direction."

### Script Refinement Flow
1. Open `ad-generation-tool/src/app/ResultsPage.tsx` and show the sentence selection UI
2. Highlight the refinement request function
3. Open `backend/main.py` and show the `/regenerate_script` endpoint (around line 336)
4. Show the `process_marked_output` function that ensures script integrity
5. Explain: "The refinement flow includes our multi-layer validation system, which is one of the most innovative aspects of this application."

## Multi-Layer Validation System (5 minutes)

1. Scroll to [Multi-Layer Validation System](#multi-layer-validation-system) section
2. Walk through the validation architecture diagram
3. Open `backend/main.py` and show the full `process_marked_output` function (around line 237)
   ```python
   def process_marked_output(output_text: str, original_script: List[Tuple[str, str]], 
                          selected_sentences: List[int]) -> Tuple[List[Dict[str, str]], Dict[str, Any]]:
       """
       Process the output from the crew to:
       1. Remove markers from the output
       2. Verify that only selected sentences have been modified
       3. Revert any unauthorized changes to non-selected sentences
       ...
       """
   ```
4. Open `ad-generation-tool/src/services/api.ts` and show the frontend validation layer
5. Open `ad-generation-tool/src/app/ResultsPage.tsx` and locate the `ValidationFeedback` component
6. Explain: "This dual-layer validation system is crucial for maintaining script integrity, ensuring that AI refinements only modify the content the user has explicitly selected."

## AI Integration with CrewAI (4 minutes)

1. Scroll to [AI Integration with CrewAI](#ai-integration-with-crewai) section
2. Walk through the CrewAI diagram
3. Open `backend/script_generation/src/script_generation/config/agents.yaml` and show agent configuration
4. Open `backend/script_generation/src/script_generation/config/tasks.yaml` and show task configuration
5. Explain: "CrewAI enables orchestration of specialized AI agents, each with specific roles and responsibilities, to produce higher quality content through collaboration."

## User Experience & Interface Design (3 minutes)

1. Scroll to [User Experience & Interface Design](#user-experience--interface-design) section
2. Open the [Script Review Interface](#script-review-and-refinement-ui) diagram
3. Demo the application UI (if possible) or show screenshots
4. Explain: "The interface is designed for intuitive workflow, with clear progression from script generation to refinement and audio production."

## Technical Challenges & Solutions (3 minutes)

1. Scroll to [Technical Challenges & Solutions](#technical-challenges--solutions) section
2. For each challenge, briefly discuss:
   - The problem faced
   - Your approach to solving it
   - Technical implementation details
3. Focus particularly on the Script Integrity and AI Orchestration challenges
4. Explain: "These challenges required innovative solutions, particularly the validation system which required both backend and frontend implementation."

## Demo & Key Features (Optional - 2 minutes)

1. Scroll to [Demo & Key Features](#demo--key-features) section
2. If time permits, quickly demonstrate:
   - Script generation
   - Sentence selection for refinement
   - Validation feedback
   - Audio generation

## Conclusion & Q&A Preparation (1 minute)

1. Scroll to the conclusion section
2. Summarize the key innovations in your application:
   - Multi-layer validation system
   - CrewAI agent orchestration
   - Full-stack architecture with clear separation of concerns
3. Prepare for Q&A by having these files ready to show:
   - `backend/main.py` for validation system details
   - `backend/script_generation/src/script_generation/crew.py` for CrewAI implementation
   - `ad-generation-tool/src/app/ResultsPage.tsx` for frontend implementation of script refinement
   - `ad-generation-tool/src/services/api.ts` for API integration and frontend validation

## Files to Reference During Q&A

Be prepared to open and discuss these files during the Q&A session:

1. **Backend API Implementation**
   - `backend/main.py`
   - `backend/script_generation/src/script_generation/crew.py`
   - `backend/script_generation/src/script_generation/config/agents.yaml`
   - `backend/script_generation/src/script_generation/config/tasks.yaml`

2. **Frontend Implementation**
   - `ad-generation-tool/src/app/ScriptGenerationPage.tsx`
   - `ad-generation-tool/src/app/ResultsPage.tsx`
   - `ad-generation-tool/src/services/api.ts`
   - `ad-generation-tool/src/types/index.ts`

3. **Validation System**
   - `backend/main.py` (specifically the `process_marked_output` function)
   - `ad-generation-tool/src/services/api.ts` (specifically the `validateScriptIntegrity` function)
   - `ad-generation-tool/src/app/ResultsPage.tsx` (specifically the `ValidationFeedback` component)

## Timing Guide

- Introduction: 2 minutes
- System Architecture: 3 minutes
- Key Technologies: 3 minutes
- Detailed Code Flow: 5 minutes
- Multi-Layer Validation: 5 minutes
- AI Integration: 4 minutes
- User Experience: 3 minutes
- Technical Challenges: 3 minutes
- Demo (optional): 2 minutes
- Conclusion: 1 minute
- Q&A: 20 minutes

Total presentation time: ~28-30 minutes, leaving 20 minutes for Q&A and code review 