# Presentation Script: AI-Powered Radio Ad Generation Tool (Technical)

This script provides detailed technical guidance for presenting the AI-Powered Radio Ad Generation Tool to the Marshall Wace technology team. Follow these instructions to demonstrate both high-level architecture and low-level implementation details.

## Introduction (2 minutes)

1. Open `project-presentation.md` in presentation mode
2. **Introduction**: "Today I'll be presenting my AI-Powered Radio Ad Generation Tool, a modern full-stack application built with Next.js and FastAPI. This system leverages multiple specialized AI agents to generate, refine, and audio-render professional radio advertisements with robust validation mechanisms."
3. Technical motivation: "From an engineering perspective, this tool addresses several complex challenges: managing stateful transformations across a distributed system, orchestrating multiple specialized AI agents to work collaboratively, and implementing multi-layer validation to maintain data integrity throughout refinement processes."

## System Architecture (3 minutes)

1. Scroll to the [System Architecture](#system-architecture) section in `project-presentation.md`
2. "The architecture follows a clean separation of concerns pattern with three distinct layers. The frontend is built with Next.js, providing both server-side rendering for SEO and client-side interactivity. The backend uses FastAPI for high-performance asynchronous request handling. The AI services layer leverages CrewAI for orchestrating specialized agents."
3. Open `backend/main.py` and highlight lines 1-20:
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
4. Explain: "Here we can see the FastAPI application initialization with CORS middleware configuration. This middleware is crucial since our Next.js frontend communicates with this API from a different origin. The wildcard origins configuration is appropriate for development but would be restricted in production."
5. Open `ad-generation-tool/src/app/page.tsx` to show the Next.js entry point
6. "The frontend uses Next.js 14's App Router, which provides a file-system based routing approach. This entry point redirects to our main landing page component that initiates the user experience flow."

## Key Technologies & Implementation Choices (3 minutes)

1. Scroll to the [Key Technologies & Implementation Choices](#key-technologies--implementation-choices) section
2. Open `backend/main.py` around lines 20-50:
   ```python
   class ScriptRequest(BaseModel):
       product_name: str
       target_audience: str
       key_selling_points: str
       tone: str
       ad_length: int = Field(..., ge=15, le=60)  # Validate length between 15 and 60 seconds
       speaker_voice: Literal["Male", "Female", "Either"]
   ```
3. "Pydantic models are a cornerstone of our backend validation strategy. Looking at the `ScriptRequest` model, we can see both type enforcement and validation rules like minimum and maximum ad length. FastAPI automatically deserializes JSON requests into these strongly-typed models, rejecting malformed requests before they reach our business logic."

4. Open `ad-generation-tool/src/types/index.ts` to show TypeScript type definitions:
   ```typescript
   export interface Script {
     line: string;
     artDirection: string;
   }
   
   export interface ValidationMetadata {
     had_unauthorized_changes: boolean;
     reverted_changes: Array<{
       index: number;
       original: Script;
       attempted: Script;
     }>;
     had_length_mismatch: boolean;
     original_length: number;
     received_length: number;
     error?: string;
   }
   ```
5. "On the frontend, TypeScript interfaces provide similar benefits to Pydantic models. Notice how the `ValidationMetadata` interface mirrors its backend counterpart, ensuring type safety across the entire request/response lifecycle. This is essential for our multi-layer validation system that spans both frontend and backend."

6. Open `ad-generation-tool/src/app/ScriptGenerationForm.tsx` and highlight React Hook Form implementation:
   ```typescript
   const {
     register,
     handleSubmit,
     formState: { errors, isSubmitting },
   } = useForm<FormData>({
     defaultValues: {
       productName: '',
       targetAudience: '',
       keySellingPoints: '',
       tone: 'professional',
       adLength: 30
     }
   });
   ```
7. "For form management, we use React Hook Form which provides uncontrolled components for performance. The `register` function attaches validation and reference tracking to form fields without requiring state updates on every keystroke, while `handleSubmit` ensures validation before processing."

## Detailed Code Flow (5 minutes)

### Script Generation Flow

1. Open `ad-generation-tool/src/app/ScriptGenerationPage.tsx` and show the submission handler:
   ```typescript
   const handleSubmit = async (data: FormData) => {
     setIsLoading(true);
     try {
       const scriptResult = await api.generateScript({
         product_name: data.productName,
         target_audience: data.targetAudience,
         key_selling_points: data.keySellingPoints,
         tone: data.tone,
         ad_length: data.adLength.toString() + 's',
         speaker_voice: data.speakerVoice
       });
       
       // Store the result in context
       setScriptData({
         script: scriptResult,
         formData: data
       });
       
       // Navigate to results page
       router.push('/results');
     } catch (error) {
       console.error('Error generating script:', error);
       setError('Failed to generate script. Please try again.');
     } finally {
       setIsLoading(false);
     }
   };
   ```
2. "The form submission process initiates with the `handleSubmit` function. Notice how we prepare the frontend data model for API consumption by converting values when necessary, like appending 's' to the ad length. The API call is wrapped in error handling, and we use React's context API to maintain state when navigating to the results page."

3. Open `backend/main.py` and show the `/generate_script` endpoint (around line 327):
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

4. "On the backend, the `/generate_script` endpoint is defined with FastAPI's decorator pattern. The function is declared as `async` to handle multiple concurrent requests efficiently. After the Pydantic model validates the incoming request, we extract the necessary fields and pass them to the `run_crewai_script` function. The resulting script data is then formatted into our `Script` data model before being returned to the client."

5. Open `backend/script_generation/src/script_generation/crew.py` to show CrewAI implementation:
   ```python
   @CrewBase
   class ScriptGeneration():
       """
       ScriptGeneration crew for generating ad script and art direction 
       based on new product requirements.
       """
       
       # Load the YAML configuration files for agents and tasks
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
           task = Task(
               config=self.tasks_config['ad_script_task'],
               output_file=str(output_path)
           )
           return task
       
       @crew
       def crew(self) -> Crew:
           return Crew(
               agents=self.agents,
               tasks=self.tasks,
               process=Process.sequential,
               verbose=True,
           )
   ```

6. "The CrewAI integration is implemented using a declarative style with Python decorators. The `@CrewBase` class decorator transforms our `ScriptGeneration` class into a crew configuration. The `@agent` decorator defines agent capabilities, while `@task` sets up the specific tasks each agent will perform. Finally, the `@crew` decorator assembles agents and tasks into an executable workflow."

### Script Refinement Flow with Multi-Layer Validation (10 minutes)

1. Open `ad-generation-tool/src/app/ResultsPage.tsx` and show the sentence selection UI:
   ```tsx
   {script.map((item, index) => (
     <div key={index} className={`script-line ${selectedIndices.includes(index) ? 'selected' : ''}`}>
       <div className="flex items-start space-x-2">
         <Checkbox
           id={`sentence-${index}`}
           checked={selectedIndices.includes(index)}
           onCheckedChange={() => toggleSentenceSelection(index)}
         />
         <div className="flex-1">
           <p 
             className={`line ${selectedIndices.includes(index) ? 'font-semibold' : ''}`}
             onClick={() => toggleSentenceSelection(index)}
           >
             {item.line}
           </p>
           <p className="art-direction text-sm text-gray-500 italic">
             <span className="font-medium">Voice direction:</span> {item.artDirection}
           </p>
         </div>
       </div>
     </div>
   ))}
   ```

2. "In the sentence selection UI, we generate checkboxes for each script line, tracking selected indices in component state. The `toggleSentenceSelection` function adds or removes indices from this state array, which will be used in the refinement request. This allows users to precisely control which parts of the script should be modified."

3. Show the refinement request function in the same file:
   ```tsx
   const handleRefineScript = async () => {
     if (selectedIndices.length === 0) {
       setError('Please select at least one sentence to refine');
       return;
     }
     
     if (!improvementInstruction) {
       setError('Please provide instructions for improvement');
       return;
     }
     
     setIsRefining(true);
     setError('');
     
     try {
       // Convert script to backend format [line, artDirection]
       const currentScriptFormatted: [string, string][] = 
         script.map(item => [item.line, item.artDirection]);
       
       // Call API with selected sentences and instruction
       const result = await api.refineScriptWithValidation({
         selected_sentences: selectedIndices,
         improvement_instruction: improvementInstruction,
         current_script: currentScriptFormatted,
         key_selling_points: formData.keySellingPoints,
         tone: formData.tone,
         ad_length: formData.adLength.toString() + 's'
       });
       
       // Update script with refinements
       setScriptData({
         script: result.script,
         formData: formData
       });
       
       // Show validation feedback if needed
       if (result.validation && (
         result.validation.had_unauthorized_changes || 
         result.validation.had_length_mismatch
       )) {
         setValidationFeedback(result.validation);
       }
       
       setImprovementInstruction('');
       setSelectedIndices([]);
     } catch (error) {
       console.error('Error refining script:', error);
       setError('Failed to refine script. Please try again.');
     } finally {
       setIsRefining(false);
     }
   };
   ```

4. "The refinement function handles client-side validation first, ensuring users have selected sentences and provided instructions. It then formats the current script as tuples of `[line, artDirection]` to match the backend API contract. After calling the API, it updates the script state and checks for validation feedback to display."

5. Open `ad-generation-tool/src/services/api.ts` and focus on the `refineScriptWithValidation` function:
   ```typescript
   refineScriptWithValidation: async (data: Omit<RefineScriptRequest, 'ad_length'> & { ad_length: string }): Promise<RefineScriptResult> => {
     try {
       // STEP 1: PREPARE REQUEST DATA
       const transformedData: RefineScriptRequest = {
         ...data,
         ad_length: parseAdLengthToSeconds(data.ad_length),
         current_script: data.current_script.map(([line, artDirection]) => [
           line.toString(),
           artDirection.toString()
         ])
       };
       
       // STEP 2: SEND REQUEST TO BACKEND WITH SELECTED SENTENCES
       const response = await axios.post(`${API_BASE_URL}/regenerate_script`, transformedData);
       
       // STEP 3: PREPARE FOR FRONTEND VALIDATION
       const currentScript: Script[] = transformedData.current_script.map(([line, artDirection]) => ({
         line,
         artDirection
       }));
       
       // Create a new script by applying modifications only to the specified indices
       const modifiedScript = [...currentScript];
       
       // STEP 4: FRONTEND SAFEGUARD - ADDITIONAL VALIDATION LAYER
       const frontendValidation: ValidationMetadata = {
         had_unauthorized_changes: false,
         reverted_changes: [],
         had_length_mismatch: false,
         original_length: currentScript.length,
         received_length: response.data.data ? response.data.data.length : 0
       };
       
       // STEP 5: APPLY MODIFICATIONS WITH FRONTEND VERIFICATION
       if (response.data.modified_indices && response.data.data) {
         response.data.modified_indices.forEach((index: number, i: number) => {
           // Verify the index is valid and was selected for modification
           const isValidModification = index >= 0 && 
                                      index < modifiedScript.length && 
                                      i < response.data.data.length &&
                                      data.selected_sentences.includes(index);
           
           if (!isValidModification && index < modifiedScript.length) {
             // UNAUTHORIZED CHANGE DETECTED
             frontendValidation.had_unauthorized_changes = true;
             frontendValidation.reverted_changes.push({
               index,
               original: modifiedScript[index],
               attempted: {
                 line: response.data.data[i].line || response.data.data[i][0],
                 artDirection: response.data.data[i].artDirection || response.data.data[i][1]
               }
             });
             
             console.warn(`Frontend safeguard: Prevented unauthorized change to sentence ${index}`);
           } else if (isValidModification) {
             // Apply authorized change
             const modifiedSentence = response.data.data[i];
             modifiedScript[index] = {
               line: modifiedSentence.line || modifiedSentence[0],
               artDirection: modifiedSentence.artDirection || modifiedSentence[1]
             };
           }
         });
       }
       
       return {
         script: modifiedScript,
         validation: frontendValidation
       };
     } catch (error) {
       console.error('Error refining script:', error);
       throw error;
     }
   };
   ```

6. "Here we see the sophisticated frontend validation layer, which acts as a secondary safeguard. Even after backend validation, the frontend performs its own independent check to ensure only authorized changes are applied to the script. This multi-layered approach is crucial for maintaining data integrity across distributed systems."

7. Open `backend/main.py` and show the `/regenerate_script` endpoint (around line 336):
   ```python
   @app.post("/regenerate_script", response_model=RefineScriptResponse)
   async def regenerate_script(request: RefineRequest):
       try:
           logging.info(f"Regenerate script request received for {len(request.selected_sentences)} selected sentences")
           
           # Validate the request
           if not request.selected_sentences:
               logging.warning("No sentences were selected for refinement")
               raise HTTPException(
                   status_code=400, 
                   detail="At least one sentence must be selected for refinement"
               )
           
           if not request.improvement_instruction:
               logging.warning("No improvement instruction was provided")
               raise HTTPException(
                   status_code=400, 
                   detail="An improvement instruction must be provided"
               )
           
           # Run the crew to generate the refinements
           refined_script, validation_metadata = await run_regenerate_script_crew({
               "selected_sentences": request.selected_sentences,
               "improvement_instruction": request.improvement_instruction,
               "current_script": request.current_script,
               "key_selling_points": request.key_selling_points,
               "tone": request.tone, 
               "ad_length": request.ad_length
           })
           
           # Extract only the modified sentences for the response
           modified_sentences = []
           modified_indices = []
           
           for idx in request.selected_sentences:
               if idx < len(refined_script):
                   modified_sentences.append(refined_script[idx])
                   modified_indices.append(idx)
           
           return RefineScriptResponse(
               status="success",
               data=modified_sentences,  # Only return modified sentences
               modified_indices=modified_indices,  # Include indices of modified sentences
               validation=validation_metadata  # Include validation metadata
           )
       except Exception as e:
           logging.error(f"Error in regenerate_script endpoint: {str(e)}")
           raise HTTPException(status_code=500, detail=str(e))
   ```

8. "The `/regenerate_script` endpoint performs initial request validation, then calls `run_regenerate_script_crew` to generate refinements. Importantly, the response structure is optimized to only return modified sentences rather than the entire script, reducing payload size and focusing the frontend on the specific changes."

9. Scroll to the `run_regenerate_script_crew` function (around line 163):
   ```python
   async def run_regenerate_script_crew(inputs: dict) -> Tuple[List[Dict[str, str]], Dict[str, Any]]:
       try:
           selected_sentences = inputs["selected_sentences"]
           current_script = inputs["current_script"]
           improvement_instruction = inputs["improvement_instruction"]
           
           # Create a marked version of the script, clearly indicating which sentences should be modified
           # and which should be preserved
           marked_script = []
           for i, (line, art) in enumerate(current_script):
               if i in selected_sentences:
                   marked_line = f"[[SELECTED FOR MODIFICATION: {line}]] [[END SELECTED]]"
                   marked_art = f"[[SELECTED FOR MODIFICATION: {art}]] [[END SELECTED]]"
               else:
                   marked_line = f"[[PRESERVE: {line}]] [[END PRESERVE]]"
                   marked_art = f"[[PRESERVE: {art}]] [[END PRESERVE]]"
               marked_script.append((marked_line, marked_art))
           
           # Add explicit instructions emphasizing the importance of only modifying selected sentences
           explicit_instruction = """
           IMPORTANT: Only modify sentences marked with [[SELECTED FOR MODIFICATION]]. 
           Do NOT change sentences marked with [[PRESERVE]].
           Maintain the same structure and format for each line.
           Your output MUST include all the original sentences, with only the selected ones modified.
           """
           
           # Create combined input for the crew
           crew_inputs = {
               "script": marked_script,
               "improvement_instruction": improvement_instruction + "\n\n" + explicit_instruction,
               "key_selling_points": inputs["key_selling_points"],
               "tone": inputs["tone"],
               "ad_length": inputs["ad_length"]
           }
           
           # Run the regenerate script crew, which returns a modified version of the script
           # with the selected sentences refined based on the instruction
           result = subprocess.run(
               ["python", "-m", "script_generation", "regenerate", 
                "--script", json.dumps(crew_inputs["script"]),
                "--instruction", crew_inputs["improvement_instruction"],
                "--key_selling_points", crew_inputs["key_selling_points"],
                "--tone", crew_inputs["tone"],
                "--ad_length", str(crew_inputs["ad_length"])],
               capture_output=True,
               text=True,
               cwd=os.path.join(os.path.dirname(__file__), "regenerate_script")
           )
           
           if result.returncode != 0:
               raise RuntimeError(f"Failed to run regenerate_script crew: {result.stderr}")
           
           # Process the output to remove markers and validate that only selected sentences were modified
           parsed_output, validation_meta = process_marked_output(result.stdout, current_script, selected_sentences)
           return parsed_output, validation_meta
       except Exception as e:
           logging.error(f"Failed to run regenerate_script crew: {str(e)}")
           raise RuntimeError(f"Failed to run regenerate_script crew: {str(e)}")
   ```

10. "In `run_regenerate_script_crew`, we see the enhanced input structure with explicit markers. Each sentence is wrapped with either `[[SELECTED FOR MODIFICATION]]` or `[[PRESERVE]]` tags, providing clear visual cues to the AI agents. We also inject an explicit instruction emphasizing the importance of only modifying selected sentences."

11. Scroll to the `process_marked_output` function (around line 237):
    ```python
    def process_marked_output(output_text: str, original_script: List[Tuple[str, str]], selected_sentences: List[int]) -> Tuple[List[Dict[str, str]], Dict[str, Any]]:
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
                logging.warning(f"Script length mismatch: original={len(original_script)}, received={len(parsed_script)}. Adjusting to match original length.")
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
                for marker in ["[[SELECTED FOR MODIFICATION: ", "[[PRESERVE: ", "]] ", " [[END SELECTED]]", " [[END PRESERVE]]"]:
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
                            "attempted": {"line": gen_item.get("line", ""), "artDirection": gen_item.get("artDirection", "")}
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
            
            if meta["had_unauthorized_changes"]:
                logging.info(f"Some unauthorized changes were reverted in the generated script: {len(meta['reverted_changes'])} sentences affected.")
            
            return verified_script, meta
            
        except Exception as e:
            logging.error(f"Error processing marked output: {str(e)}")
            # Fall back to returning the original script if there's a critical error
            meta["error"] = str(e)
            return [{"line": line, "artDirection": art} for line, art in original_script], meta
    ```

12. "The `process_marked_output` function implements our post-processing validation system. It first removes all the marker tags from the output, then meticulously compares each sentence with its original version. For non-selected sentences, any differences are flagged as unauthorized changes and reverted to the original content. This creates a robust safety mechanism that works regardless of what the AI agents return."

13. Highlight the frontend `ValidationFeedback` component in `ResultsPage.tsx`:
    ```tsx
    {validationFeedback && (validationFeedback.had_unauthorized_changes || validationFeedback.had_length_mismatch) && (
      <Alert variant="warning" className="mb-4">
        <AlertTitle>Script Validation Information</AlertTitle>
        <AlertDescription>
          {validationFeedback.had_unauthorized_changes && (
            <p>Some attempted changes to non-selected sentences were prevented ({validationFeedback.reverted_changes.length} sentences).</p>
          )}
          {validationFeedback.had_length_mismatch && (
            <p>The script length was adjusted to match the original ({validationFeedback.original_length} sentences).</p>
          )}
        </AlertDescription>
      </Alert>
    )}
    ```

14. "Finally, the `ValidationFeedback` component provides transparent user feedback when validation issues occur. This ensures users understand exactly what happened during refinement, highlighting any unauthorized changes that were prevented or structure adjustments that were made."

## AI Integration with CrewAI (3 minutes)

1. Scroll to the [AI Integration with CrewAI](#ai-integration-with-crewai) section
2. Open `backend/script_generation/src/script_generation/crew.py`:
   ```python
   @CrewBase
   class ScriptGeneration():
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
           task = Task(
               config=self.tasks_config['ad_script_task'],
               output_file=str(output_path)
           )
           return task
       
       @crew
       def crew(self) -> Crew:
           return Crew(
               agents=self.agents,
               tasks=self.tasks,
               process=Process.sequential,
               verbose=True,
           )
   ```

3. "The CrewAI framework enables sophisticated agent orchestration through a declarative programming model. The `@agent` decorator creates specialized agents with different capabilities and expertise, while `@task` defines specific responsibilities. The `@crew` decorator then assembles these components into an executable workflow. In our implementation, we load configuration from YAML files to maintain separation between code and configuration."

4. Open the agents config file at `backend/script_generation/src/script_generation/config/agents.yaml`:
   ```yaml
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

5. "Each agent is configured with a specific role, goal, and backstory to guide its behavior. This approach to AI system design is known as 'agent-based modeling' and allows us to create specialized experts that contribute their unique capabilities to the overall task."

## Technical Challenges & Solutions (3 minutes)

1. Scroll to the [Technical Challenges & Solutions](#technical-challenges--solutions) section
2. "One of the most significant technical challenges was maintaining script integrity during refinement. The solution required multiple layers of protection:"

3. "First, the enhanced input structure in `run_regenerate_script_crew` explicitly marks each sentence with `[[SELECTED FOR MODIFICATION]]` or `[[PRESERVE]]` tags, providing clear visual cues to the AI agents about which parts they should modify."

4. "Second, we added explicit instructions in the prompt, emphasizing the importance of only modifying selected sentences and preserving the rest."

5. "Third, we implemented a post-processing validation step in `process_marked_output` that rigorously compares the original script with the generated one, accepting changes only to selected sentences and reverting any unauthorized modifications."

6. "Fourth, we restructured the API response to only return modified sentences instead of the entire script, reducing payload size and focusing the frontend on specific changes."

7. "Finally, we added a frontend safeguard in `api.ts` that performs an independent verification, applying changes only to sentences that were explicitly selected for modification."

8. "Together, these mechanisms create a multi-layered defense system that maintains data integrity across the distributed system, regardless of what the AI agents return."

## Conclusion & Q&A Preparation (1 minute)

1. Scroll to the conclusion section
2. "To summarize the key technical achievements of this application:
   - A clean architecture with clear separation of concerns across frontend, backend, and AI layers
   - A sophisticated multi-layer validation system that maintains data integrity during AI-powered refinements
   - Efficient agent orchestration through CrewAI, enabling complex collaborative tasks
   - Type-safe data flow using TypeScript interfaces and Pydantic models
   - Performance optimization with React Hook Form and asynchronous processing"

3. "I'm now ready to address any questions about the implementation details, technical decisions, or potential enhancements to the system."

## Files to Reference During Q&A

Prepare to open these files during the Q&A session:

- **Backend Implementation**
  - `backend/main.py` (especially the validation system)
  - `backend/script_generation/src/script_generation/crew.py`
  - `backend/script_generation/src/script_generation/config/agents.yaml`

- **Frontend Implementation**
  - `ad-generation-tool/src/app/ScriptGenerationPage.tsx`
  - `ad-generation-tool/src/app/ResultsPage.tsx`
  - `ad-generation-tool/src/services/api.ts`
  - `ad-generation-tool/src/types/index.ts`