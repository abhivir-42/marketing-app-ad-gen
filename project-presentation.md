# AI-Powered Radio Ad Generation Tool
## A Modern Full-Stack Application for Professional Radio Ad Creation

<div align="center">

![Application Banner](https://mermaid.ink/img/pako:eNqFksFOwzAMhl_F8mEHOJRAu-0EEkgcEAekXeAQJU6baukkynKYRsW7k7RlG9KmXhL_-T8ndiZl2UrKKamlNZXfyb1osRr7FOdSr6c1b16NNTkLB2_qAZDHku4hrw7RCaUR9zkfvlwY9C--GyoZAYvkoI7_G-jakcecRYhB-KKKH58GB8vxu_YbBPww6M6HRsdo2S_To2HvUKZXOsZtOfhokD8-Gixl65M0K1QhVPnqpsuRGfI2UJhPcLyvwZnL-CJfEFzTBgpVZvoSUZqAQ2ASjoR85QTvA0DhQAqNxzimXEdiUUOjHuFQ6YPG0xUwSAulHNh9NxpzCk2QPmPnMKD1-MPxXEoll6GqZMRQpJxmtYw6HI0GNT2G7ex6ehOJBvtq2_Dzz_9IgK9BLspYZolPM3UJfVmbvXo4TsbL85z7GqqfFWnTDA?type=png)

</div>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Key Technologies & Implementation Choices](#key-technologies--implementation-choices)
4. [Detailed Code Flow](#detailed-code-flow)
5. [Multi-Layer Validation System](#multi-layer-validation-system)
6. [AI Integration with CrewAI](#ai-integration-with-crewai)
7. [User Experience & Interface Design](#user-experience--interface-design)
8. [Technical Challenges & Solutions](#technical-challenges--solutions)
9. [Demo & Key Features](#demo--key-features)
10. [Future Enhancements](#future-enhancements)

---

## Project Overview

The AI-Powered Radio Ad Generation Tool is a comprehensive solution for creating professional radio advertisements. This full-stack application enables users to:

- **Generate customised ad scripts** based on product information, target audience, and marketing goals
- **Refine scripts with AI assistance** using a sophisticated validation system for controlled modifications
- **Add professional audio direction** alongside script content for voice actors
- **Convert scripts to audio** using advanced text-to-speech technology
- **Track version history** of both scripts and audio outputs for comparison and iteration

The tool solves common challenges in radio ad creation:
- **Reducing production time** from days to minutes
- **Lowering costs** associated with professional copywriting and script revision
- **Maintaining creative control** through targeted AI refinements
- **Ensuring quality** with a multi-layer validation system

#TODO: Screenshot - Add homepage screenshot showing the main interface

---

## System Architecture

The application follows a modern architecture with clear separation of concerns:

<div align="center">

```mermaid
graph TB
    subgraph "Frontend (Next.js Application)"
        A["Landing Page"] --> B["Form Component"]
        B --> C["Results Component"]
        C --> D["Audio Generation"]
        C --> E["Script Refinement"]
        E --> C
    end
    
    subgraph "Backend (FastAPI Server)"
        F["API Endpoints"] --> G["Script Generation"]
        F --> H["Script Refinement"]
        F --> I["Audio Generation"]
        G --> J["CrewAI Integration"]
        H --> J
        I --> K["Text-to-Speech Service"]
    end
    
    subgraph "AI Services Layer"
        J --> L["Script Creator Agent"]
        J --> M["Art Director Agent"]
        J --> N["Script Refiner Agent"]
    end
    
    B -->|"API Request"| F
    C -->|"Refinement Request"| F
    D -->|"Audio Request"| F
```

</div>

### Component Structure:

- **Frontend**: Next.js application with TypeScript, React, and Tailwind CSS
  - User input collection and validation
  - Script review and selective refinement
  - Audio preview and download

- **Backend**: FastAPI application with Python
  - RESTful API endpoints
  - Multi-layer validation system
  - Integration with CrewAI for orchestration
  - Text-to-speech services integration

- **AI Layer**: CrewAI framework for agent orchestration
  - Script generation agent for creative content
  - Art direction agent for voice guidance
  - Script refinement agent for targeted improvements

#TODO: Screenshot - Add system architecture diagram showing how components interact in the actual application

---

## Key Technologies & Implementation Choices

### Frontend Stack

- **Next.js**: Chosen for server-side rendering capabilities, API routes, and enhanced SEO
- **TypeScript**: Provides type safety, improving code reliability and developer experience
- **Tailwind CSS**: Enables rapid UI development with utility-first approach
- **React Hook Form**: Manages form state and validation efficiently
- **SWR**: Implements data fetching with caching and revalidation strategies

### Backend Stack

- **FastAPI**: Selected for high performance, automatic documentation, and Python compatibility
- **Pydantic**: Handles data validation and serialisation
- **CrewAI**: Orchestrates multiple AI agents working together for complex tasks
- **Parler TTS**: Provides high-quality text-to-speech conversion

### Implementation Decisions

1. **API-First Design**: Backend and frontend communicate through well-defined, versioned API contracts
2. **Stateless Architecture**: Each request contains all necessary information for processing
3. **Multi-Layer Validation**: Implements validation at both backend and frontend for data integrity
4. **Modular Components**: Enables easier maintenance and future feature additions

---

## Detailed Code Flow

### 1. Script Generation Flow

<div align="center">

```mermaid
sequenceDiagram
    participant User as User
    participant FE as Frontend (Next.js)
    participant BE as Backend (FastAPI)
    participant CrewAI as CrewAI Framework
    participant ScriptAgent as Script Creator
    participant ArtAgent as Art Director

    User->>FE: Enter product details and audience information
    FE->>BE: POST /generate_script
    BE->>CrewAI: Initialise crew for script generation
    CrewAI->>ScriptAgent: Generate radio ad script
    ScriptAgent-->>CrewAI: Return draft script
    CrewAI->>ArtAgent: Create art direction
    ArtAgent-->>CrewAI: Return art direction notes
    CrewAI-->>BE: Combined script with art direction
    BE-->>FE: Return formatted script response
    FE->>User: Display script with art direction
```

</div>

Key code references:
- Frontend form submission: `ad-generation-tool/src/app/ScriptGenerationPage.tsx`
- API request handling: `ad-generation-tool/src/services/api.ts`
- Backend endpoint: `backend/main.py` → `generate_script()`
- CrewAI implementation: `backend/script_generation/src/script_generation/crew.py`

Actual backend implementation of the script generation endpoint:

```python
@app.post("/generate_script", response_model=GenerateScriptResponse)
async def generate_script(request: ScriptRequest):
    try:
        # Prepare inputs for the crew
        inputs = {
            "product_name": request.product_name,
            "target_audience": request.target_audience,
            "key_selling_points": request.key_selling_points,
            "tone": request.tone,
            "ad_length": request.ad_length
        }
        
        # Run the crew to generate the script
        script_data = await run_crewai_script(inputs)
        
        # Convert the script data to the expected response format
        formatted_script = [
            Script(line=item["line"], artDirection=item["artDirection"]) 
            for item in script_data
        ]
        
        return {"success": True, "script": formatted_script}
    except Exception as e:
        logging.error(f"Error generating script: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate script: {str(e)}")
```

#TODO: Screenshot - Add form input page showing product details input form

### 2. Script Refinement Flow

<div align="center">

```mermaid
sequenceDiagram
    participant User as User
    participant FE as Frontend (Next.js)
    participant BE as Backend (FastAPI)
    participant Validator as Validation System
    participant CrewAI as CrewAI Framework
    participant RefineAgent as Script Refiner Agent

    User->>FE: Select sentences & provide refinement instructions
    FE->>BE: POST /regenerate_script
    BE->>CrewAI: Initialise crew for refinement
    CrewAI->>RefineAgent: Refine selected sentences
    RefineAgent-->>CrewAI: Return refined sentences
    CrewAI-->>BE: Return modified script
    BE->>Validator: Validate changes
    Validator-->>BE: Return validation results
    BE-->>FE: Return refined script with validation metadata
    FE->>FE: Apply frontend validation layer
    FE->>User: Display refined script with validation feedback
```

</div>

Key code references:
- Sentence selection UI: `ad-generation-tool/src/app/ResultsPage.tsx`
- Backend refinement: `backend/main.py` → `regenerate_script()`
- Validation system: `backend/main.py` → `process_marked_output()`
- Frontend safeguard: `ad-generation-tool/src/services/api.ts` → `refineScript()`

Frontend API implementation for script refinement with validation:

```typescript
// From ad-generation-tool/src/services/api.ts
export const refineScript = async (
  selectedSentences: number[],
  improvementInstruction: string,
  currentScript: Script[],
  formData: FormData
): Promise<RefineScriptResponse> => {
  try {
    // Convert script format for the API
    const scriptFormatted = currentScript.map(s => [s.line, s.artDirection]);
    
    // Prepare the request payload
    const payload = {
      selected_sentences: selectedSentences,
      improvement_instruction: improvementInstruction,
      current_script: scriptFormatted,
      key_selling_points: formData.keySellingPoints,
      tone: formData.tone,
      ad_length: formData.adLength
    };
    
    // Make the API request
    const response = await axios.post(`${API_BASE_URL}/regenerate_script`, payload);
    
    // Additional frontend validation layer
    const frontendValidation = validateScriptIntegrity(
      currentScript,
      response.data.data,
      selectedSentences
    );
    
    if (!frontendValidation.isValid) {
      console.warn('Frontend validation detected integrity issues:', 
        frontendValidation.validationMetadata);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error refining script:', error);
    throw error;
  }
};
```

#TODO: Screenshot - Add script refinement interface showing sentence selection and improvement instructions

### 3. Audio Generation Flow

<div align="center">

```mermaid
sequenceDiagram
    participant User as User
    participant FE as Frontend (Next.js)
    participant BE as Backend (FastAPI)
    participant TTS as Text-to-Speech Service
    
    User->>FE: Request audio generation
    FE->>BE: POST /generate_audio
    BE->>TTS: Send script text with voice parameters
    TTS-->>BE: Return audio file/URL
    BE-->>FE: Return audio response with metadata
    FE->>User: Display audio player with download option
```

</div>

Key code references:
- Audio request handling in ResultsPage component
- Backend audio endpoint: `backend/main.py` → `generate_audio()`
- TTS integration: `backend/utils/tts_service.py`

#TODO: Screenshot - Add audio player interface showing the playback controls and waveform visualization

---

## Multi-Layer Validation System

The validation system is a critical component ensuring script integrity during refinement. It operates at multiple levels to prevent unauthorised modifications.

### 1. Problem Statement

When refining scripts, the system must:
- Allow modifications to user-selected sentences only
- Preserve unselected content
- Maintain script structure and integrity
- Provide transparent feedback on any validation issues

### 2. Validation Architecture

<div align="center">

```mermaid
flowchart TD
    A["User Selects Sentences for Refinement"] --> B["AI Generates Refinements"]
    B --> C{"Backend Validation"}
    C -->|"Unauthorised Changes"| D["Revert Changes"]
    C -->|"Length Mismatch"| E["Restore Structure"]
    C -->|"Valid Changes"| F["Accept Changes"]
    F --> G{"Frontend Validation"}
    G -->|"All Valid"| H["Update UI"]
    G -->|"Issues Detected"| I["Display Validation Feedback"]
    D --> J["Return Validation Metadata"]
    E --> J
    J --> I
```

</div>

### 3. Implementation Details

The validation system is implemented in two layers:

#### Backend Validation (Primary)

Located in `backend/main.py`, the `process_marked_output` function handles:
- Comparing original and modified script lengths
- Verifying that only selected sentences were modified
- Reverting unauthorised changes to preserve integrity
- Generating detailed validation metadata

```python
def process_marked_output(output_text: str, original_script: List[Tuple[str, str]], 
                         selected_sentences: List[int]) -> Tuple[List[Dict[str, str]], Dict[str, Any]]:
    """
    Process the output from the crew to:
    1. Remove markers from the output
    2. Verify that only selected sentences have been modified
    3. Revert any unauthorized changes to non-selected sentences
    
    This creates a safety mechanism regardless of what the crew returns.
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
            logging.warning(f"Script length mismatch: original={len(original_script)}, "
                           f"received={len(parsed_script)}. Adjusting to match original length.")
            # If the lengths don't match, we'll keep the original script length
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
            for marker in ["[[SELECTED FOR MODIFICATION: ", "[[PRESERVE: ", "]] ", 
                          " [[END SELECTED]]", " [[END PRESERVE]]"]:
                if "line" in item and isinstance(item["line"], str):
                    item["line"] = item["line"].replace(marker, "")
                if "artDirection" in item and isinstance(item["artDirection"], str):
                    item["artDirection"] = item["artDirection"].replace(marker, "")
        
        # Verify and enforce that only selected sentences were modified
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
                        "attempted": {"line": gen_item.get("line", ""), 
                                     "artDirection": gen_item.get("artDirection", "")}
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
        
        return verified_script, meta
        
    except Exception as e:
        logging.error(f"Error processing marked output: {str(e)}")
        meta["error"] = str(e)
        return [], meta
```

#### Frontend Safeguard (Secondary)

Implemented in `ad-generation-tool/src/services/api.ts`, this additional layer:
- Provides a redundant check on the client side
- Ensures UI accurately reflects validation results
- Delivers clear feedback to users about any issues

```typescript
// Frontend validation layer
const validateScriptIntegrity = (
  originalScript: ScriptLine[],
  modifiedScript: ScriptLine[],
  selectedIndices: number[]
): ValidationResult => {
  let unauthorisedChangesDetected = false;
  let lengthMismatch = false;
  const revertedChanges: Array<{
    index: number;
    original: { line: string; artDirection: string };
    attempted: { line: string; artDirection: string };
  }> = [];

  // Check if lengths match
  if (originalScript.length !== modifiedScript.length) {
    lengthMismatch = true;
    console.warn('Script length mismatch detected in frontend validation');
  }

  // Compare each line to detect unauthorised changes
  const minLength = Math.min(originalScript.length, modifiedScript.length);
  
  for (let i = 0; i < minLength; i++) {
    // Skip validation for selected indices - these are allowed to change
    if (selectedIndices.includes(i)) continue;
    
    const original = originalScript[i];
    const modified = modifiedScript[i];
    
    // Check if non-selected line was modified
    if (original.line !== modified.line || original.artDirection !== modified.artDirection) {
      unauthorisedChangesDetected = true;
      revertedChanges.push({
        index: i,
        original: { line: original.line, artDirection: original.artDirection },
        attempted: { line: modified.line, artDirection: modified.artDirection }
      });
      
      // Log the detected change
      console.warn(`Unauthorised change detected at line ${i}`, {
        original,
        attempted: modified
      });
    }
  }
  
  return {
    isValid: !unauthorisedChangesDetected && !lengthMismatch,
    validationMetadata: {
      had_unauthorised_changes: unauthorisedChangesDetected,
      reverted_changes: revertedChanges,
      had_length_mismatch: lengthMismatch,
      original_length: originalScript.length,
      received_length: modifiedScript.length
    }
  };
};
```

### 4. User Feedback System

The `ValidationFeedback` component in `ResultsPage.tsx` provides clear alerts:
- Highlights unauthorised changes that were reverted
- Explains any structure issues that were corrected
- Maintains transparency throughout the refinement process

#TODO: Screenshot - Add validation feedback UI showing alerts about reverted changes

---

## AI Integration with CrewAI

The project leverages CrewAI, an innovative framework for AI agent orchestration, to handle complex content generation through multi-agent collaboration.

<div align="center">

```mermaid
graph TD
    subgraph "CrewAI Framework"
        A["Crew Manager"] --> B["Script Creator Agent"]
        A --> C["Art Director Agent"]
        A --> D["Script Refiner Agent"]
        E["Task Orchestration"] --> A
        F["Agent Communication"] --> A
    end
    
    subgraph "Agent Tasks"
        B --> G["Generate compelling ad copy"]
        C --> H["Create voice/tone direction"]
        D --> I["Refine specific sentences"]
    end
    
    J["Backend API"] --> E
```

</div>

### Agent Roles and Responsibilities

1. **Script Creator Agent**
   - Specialised in marketing and copywriting
   - Generates compelling ad copy based on product details
   - Ensures appropriate length and tone for radio format

2. **Art Director Agent**
   - Focuses on audio presentation and delivery
   - Creates guidance for voice actors/text-to-speech
   - Adds emphasis, pauses, and tonal direction

3. **Script Refiner Agent**
   - Improves specific sentences while maintaining context
   - Follows user instructions for targeted improvements
   - Respects script integrity during refinement

### Implementation in Code

The CrewAI integration is implemented in `backend/script_generation/src/script_generation/crew.py`:

```python
@CrewBase
class ScriptGeneration():
    """
    ScriptGeneration crew for generating ad script and art direction 
    based on new product requirements.

    New inputs:
    - product_name: The name of the product.
    - target_audience: The target audience (e.g., "Teens", "Small Business Owners").
    - key_selling_points: Key selling points of the product.
    - tone: The desired tone of the ad (e.g., "Fun", "Professional", "Urgent").
    - ad_length: The duration of the ad (15s, 30s, 60s).
    """

    # Load the YAML configuration files for agents and tasks.
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def ad_script_generator(self) -> Agent:
        return Agent(
            config=self.agents_config['ad_script_generator'],
            verbose=True
        )

    @task
    def ad_script_task(self) -> Task:
        output_path = Path(__file__).parent.parent.parent / 'radio_script.md'
        print(f"Expected output path: {output_path}")
        print("Starting ad script task...")
        task = Task(
            config=self.tasks_config['ad_script_task'],
            output_file=str(output_path)
        )
        print("Task created, returning task...")
        return task

    @crew
    def crew(self) -> Crew:
        """
        Creates the ScriptGeneration crew that sequentially executes the defined task(s).
        """
        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator.
            tasks=self.tasks,    # Automatically created by the @task decorator.
            process=Process.sequential,
            verbose=True,
        )
```

Agent configuration from `agents.yaml`:

```yaml
# config/agents.yaml
ad_script_generator:
  role: >
    Radio Script & Voice Director
  goal: >
    Create a compelling radio ad script with voice direction for each line based on product details.
  backstory: >
    As a seasoned radio producer, you specialize in crafting impactful audio advertisements 
    that pair script lines with specific vocal delivery instructions. Your expertise includes 
    tone, pacing, and emotional inflection to engage the target audience.
```

Task configuration from `tasks.yaml`:

```yaml
# config/tasks.yaml
ad_script_task:
  description: >
    Create a radio ad script with voice direction for the product.
    Product Name: {product_name}
    Target Audience: {target_audience}
    Key Selling Points: {key_selling_points}
    Tone: {tone}
    Ad Length: {ad_length}
  expected_output: >
    List of tuples formatted as:
    [
      ("Line 1 text", "Voice direction for line 1"),
      ("Line 2 text", "Voice direction for line 2"),
      ...
    ]
  agent: ad_script_generator
  tools: []
  context: []
  inputs:
    - product_name
    - target_audience
    - key_selling_points
    - tone
    - ad_length
```

---

## User Experience & Interface Design

The interface is designed for intuitive workflow and professional results, with attention to user feedback and clear progression.

### Form Design and User Input

- **Progressive Disclosure**: Complex options are revealed contextually
- **Input Validation**: Immediate feedback prevents submission errors
- **Guided Experience**: Clear instructions at each step of the process

### Script Review and Refinement UI

<div align="center">

```mermaid
graph TD
    subgraph "Script Review Interface"
        A["Script Display"] --> B["Sentence Selection"]
        B --> C["Refinement Instructions"]
        C --> D["AI Refinement Request"]
        D --> E["Validation Feedback"]
        E --> F["Updated Script Display"]
    end
```

</div>

The refinement interface includes:
- Interactive sentence selection
- Clear instruction input
- Visual feedback on modifications
- Validation alerts when needed

#TODO: Screenshot - Add before/after comparison of script refinement showing highlighting of changes

### Audio Generation Interface

- Waveform visualisation
- Audio playback controls
- Speed and pitch adjustment
- Download options for different formats

---

## Technical Challenges & Solutions

### 1. Script Integrity During Refinement

**Challenge**: Ensuring AI refinements only modify user-selected sentences without affecting other content.

**Solution**: Implemented the multi-layer validation system that:
- Tracks original and modified content
- Reverts unauthorised changes
- Provides transparent feedback
- Maintains script structure

### 2. AI Agent Orchestration

**Challenge**: Coordinating multiple specialised AI agents for cohesive output.

**Solution**: Utilised CrewAI framework to:
- Define specialised agent roles
- Structure sequential and parallel tasks
- Manage information flow between agents
- Consolidate results into coherent output

### 3. Voice Direction Integration

**Challenge**: Integrating art direction with script text in a maintainable format.

**Solution**: Developed a paired data structure that:
- Maintains 1:1 relationship between script lines and direction
- Preserves formatting during refinement
- Supports rendering in the user interface
- Enables text-to-speech interpretation

### 4. Frontend-Backend Consistency

**Challenge**: Maintaining consistent state between frontend and backend.

**Solution**: Implemented:
- Clear API contracts with Pydantic models
- Redundant validation on both ends
- Detailed error handling and reporting
- Stateless architecture with complete request context

---

## Demo & Key Features

### Script Generation

- Customised content based on product details
- Professional tone and structure
- Automatic length adjustment for time constraints
- Integrated art direction for voice guidance

### AI-Powered Refinement

- Selective sentence refinement
- Contextual improvements
- Multi-layer validation system
- Transparent feedback on changes

### Audio Production

- Professional-quality text-to-speech
- Voice selection options
- Adjustable speed and emphasis
- Multiple export formats

### Version Control

- Script history tracking
- Comparison between versions
- Restore previous versions
- Export options for all versions

#TODO: Screenshot - Add version history UI showing comparison between different script versions

---

## Future Enhancements

The application roadmap includes several planned improvements:

1. **Enhanced AI Customisation**
   - Additional agent specialisations
   - User-defined style guidelines
   - Brand voice preservation

2. **Integration Capabilities**
   - Export to production systems
   - User auth and previous generations storage
   - Sharing & Team collaboration features

3. **Advanced Audio Features**
   - Background music integration
   - Sound effect suggestions
   - Multi-voice scripts

4. **Expanded Analytics**
   - Script effectiveness metrics
   - A/B testing capabilities
   - Audience response predictions





---

## Ready for Questions & Code Review

<div align="center">

Thank you for reviewing my presentation. I'm ready to discuss:
- Any specific areas of the implementation
- Technical decisions and their rationale
- Code structure and organisation
- Future development possibilities

</div>