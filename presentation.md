# AI-Powered Radio Ad Generation Tool
## A Next.js & FastAPI Application with Multi-Layer Validation

<div align="center">

![Application Banner](https://mermaid.ink/img/pako:eNp1kc1OwzAQhF_F8qEHiFMo4dchQeIAiAPITaAH19k6xvUfZe0GRXl3nDgFFe145zvfeCUf3ZaF0UlmdWFXbs8r30Ix9iHNuLqaln5_0EZnzO1c2QQIxpJuIdv-6BxXGq5jHr7cKHQPvh1KCS645L3kx_8NVOXIuiEWQgzO5i5-fBgcVOOP7TcIqQfNeteoWM7Z8_SoxTtYOZeUUVMOHhrEwUPFLK5FkuQsZc5OV232SRG2AcDM4fRWgdXn-GJfEGzVBnIps9JHopSBQ2AUDgSc5LDTfgBhcDBbdGGMs-TrkCDXUOk72Eu5U3g4AQZJXrEDu-9aYXLcB9AVY2fRo3b4xzDOecF2xZuKwpnXNMErlMIfjXqO-7GcXk5eRdDXeXWz2P7zTxLgixcpspw9ZAc7sUvUvlZ7cXuYTBbnOvM0FD9dGOjA?type=png)

</div>

---

<div align="center">
<h3>Interactive Table of Contents</h3>
</div>

1. [System Overview](#system-overview)
2. [Key Technologies](#key-technologies)
3. [Application Flow](#application-flow)
4. [Multi-Layer Validation System](#multi-layer-validation-system)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Implementation](#backend-implementation)
7. [User Experience & Interface](#user-experience--interface)
8. [Technical Challenges & Solutions](#technical-challenges--solutions)
9. [Future Enhancements](#future-enhancements)

---

## System Overview

This application is a comprehensive tool for generating professional radio ads with AI assistance. It enables users to:

1. Generate customised ad scripts based on product and audience information
2. Refine scripts with AI assistance using a sophisticated validation system
3. Add audio direction alongside script content
4. Convert scripts to audio using text-to-speech technology
5. Track version history of both scripts and audio outputs

<div align="center">

![System Architecture](https://mermaid.ink/img/pako:eNp1kc1OwzAQhF_F8qEHiFMo4dchQeIAiAPITaAH19k6xvUfZe0GRXl3nDgFFe145zvfeCUf3ZaF0UlmdWFXbs8r30Ix9iHNuLqaln5_0EZnzO1c2QQIxpJuIdv-6BxXGq5jHr7cKHQPvh1KCS645L3kx_8NVOXIuiEWQgzO5i5-fBgcVOOP7TcIqQfNeteoWM7Z8_SoxTtYOZeUUVMOHhrEwUPFLK5FkuQsZc5OV232SRG2AcDM4fRWgdXn-GJfEGzVBnIps9JHopSBQ2AUDgSc5LDTfgBhcDBbdGGMs-TrkCDXUOk72Eu5U3g4AQZJXrEDu-9aYXLcB9AVY2fRo3b4xzDOecF2xZuKwpnXNMErlMIfjXqO-7GcXk5eRdDXeXWz2P7zTxLgixcpspw9ZAc7sUvUvlZ7cXuYTBbnOvM0FD9dGOjA?type=png)

*Interactive architecture diagram - Click to explore*

</div>

### Key Components:

- **Next.js Frontend**: TypeScript, React, and Tailwind CSS for a responsive UI
- **FastAPI Backend**: Python-based API with CrewAI integration
- **Multi-Layer Validation System**: Ensures script integrity during refinement
- **Version History**: Tracks changes to both scripts and audio outputs

---

## Key Technologies

<div style="display: flex; justify-content: space-around; flex-wrap: wrap; margin-bottom: 20px;">
  <div style="text-align: center; margin: 10px; padding: 15px; border-radius: 8px; background-color: #f8f9fa; width: 150px;">
    <strong>Next.js</strong><br/>
    Frontend Framework
  </div>
  <div style="text-align: center; margin: 10px; padding: 15px; border-radius: 8px; background-color: #f8f9fa; width: 150px;">
    <strong>TypeScript</strong><br/>
    Type Safety
  </div>
  <div style="text-align: center; margin: 10px; padding: 15px; border-radius: 8px; background-color: #f8f9fa; width: 150px;">
    <strong>Tailwind CSS</strong><br/>
    Styling
  </div>
  <div style="text-align: center; margin: 10px; padding: 15px; border-radius: 8px; background-color: #f8f9fa; width: 150px;">
    <strong>FastAPI</strong><br/>
    Backend Framework
  </div>
  <div style="text-align: center; margin: 10px; padding: 15px; border-radius: 8px; background-color: #f8f9fa; width: 150px;">
    <strong>CrewAI</strong><br/>
    AI Orchestration
  </div>
  <div style="text-align: center; margin: 10px; padding: 15px; border-radius: 8px; background-color: #f8f9fa; width: 150px;">
    <strong>Parler TTS</strong><br/>
    Text-to-Speech
  </div>
</div>

---

## Application Flow

<div align="center">

![Application Flow](https://mermaid.ink/img/pako:eNp1k01v2zAMhv-KoNMOXYNsTdvTgGFACxzWoYcNO3Q6BIpER4QsGZLsNSj63yfZSfPVnSw-Jh-SEn1kVZEznfBMlSY3B1bYGpwzJ9ELKtZ9xmm0WDFxV-R7B8ZISE6Cn-9SStmeP3cWRHrGVmjhj9rlYSdpA-GtJyFx4G_W97n7bJ2P35Z2XqYOEiLQpQ7ozcyJd3-m3rTQS0NsL0qe-9A68FiULjwLtnG7d2a3G1K1sCp32_16tykrVa_mNP1sXh8eH5u3wFUfVkMG6xY0BMpPnmA1Hj6ZBxpL0JYiLFatWjQrnXOHo1bK4fQ2hAYm8dwb8nj2_JyQ-U73OQyAP1f9sMphhDx9G6N1sbsaIl-XD7eKO6vKVsNeEJVRuYHvKtnVoBuzecZGlrQnCGbUQAdhzxk3tLrPodHI_3YKSs1UEVkUXaqBn7RakSJSRFvl57TzYuZXofP1HmS9KxVOsw4rQXwfFWZazMwf7JLBP9QlVXUFhXlDxcCSWFKT6fwU8hEpcCLyQDiJHZxaoCsmPpIK4-ZM_qEX9Zf-P1cSOk0lsYLXNKsAQ3G4GQ5X2LZdDO7efd3D3M_T01h-AYtouS4?type=png)

*User journey through the application - Click to explore*

</div>

### The user journey follows these key steps:

1. **Input Collection**: User provides product details, target audience, tone, etc.
2. **Script Generation**: AI generates an initial script with art direction
3. **Script Refinement**: User selects specific sentences for AI refinement
4. **Validation Process**: Multi-layer validation ensures only selected sentences are modified
5. **Audio Generation**: Text-to-speech converts the script to audio
6. **Version Management**: User can save, compare, and restore different script versions

---

## Multi-Layer Validation System

### The Challenge

When refining scripts, we needed to ensure:

- **Only selected sentences are modified**
- **Unselected sentences remain unchanged**
- **Script structure is preserved**
- **Unauthorised changes are detected and reverted**

<div align="center">

![Validation Flow](https://mermaid.ink/img/pako:eNp1kstuwjAQRX9l5EUrpAREeXmRqKpUdcOiXXRDs3DiqWPVsSOPKaEI8e-dGNqoqN15nHtnxs4xUCE5QASpVkvVsMJKQLvGpTEVZ9_a_7k0MiJmZdLag4UAvJe8N-Nd6v3W6Lx_hcGnY0aZMpuIcsnlAtJ4ZEHdY4_DpY-9wLPrJLYoImTWJm0dWHCQnPAFEqXH2O-b8TjwrY-tK0lZv0dDmW_QCuAkCqUbvF4tnXlNE5gllVBGddpYqJH1wJbsoAkkoKQFc7Ysy1p54rCVyBMOu6ZSE3-Y-vYNtmwFKRdR7iLVRqKtAa5lRVcpLJ6-UNPIFWwU1_TxfpypQkuUoK-0mKPkAoISoEfh0HyhlBosGrq7GrJUUU2m4aTyYUKpeDQdRN-UL5fRUDTzKbv_DUUbZ00YgCKQpW32nzH-zTFdDlXZ1DVm_EZ7YLefigFE5Xm-FLf5Ju6Np9vNfm-fE_M81OrdmQ?type=png)

*Multi-layer validation flow - Click to explore*

</div>

### Implementation Details

The validation system operates at two crucial layers:

#### 1. Backend Validation Layer

Located in `backend/main.py`, the `process_marked_output` function handles server-side validation:

```python
def process_marked_output(output_text, original_script, selected_sentences):
    """
    Validates and processes the marked output from the refinement process.
    Ensures only selected sentences are modified.
    """
    meta = {
        "had_unauthorized_changes": False,
        "reverted_changes": [],
        "had_length_mismatch": False,
        "original_length": len(original_script),
        "received_length": 0
    }
    
    # Validation logic:
    # 1. Checks script length matches original
    # 2. Removes any special markers from output
    # 3. Verifies only selected sentences were modified
    # 4. Reverts unauthorised changes to preserve integrity
    # 5. Returns validation metadata for frontend feedback
```

Key code reference: [`backend/main.py` lines 237-327](backend/main.py)

#### 2. Frontend Safeguard Layer

The frontend implements an additional validation layer in `api.ts`:

```typescript
// STEP 4: FRONTEND SAFEGUARD - ADDITIONAL VALIDATION LAYER
const frontendValidation: ValidationMetadata = {
  had_unauthorized_changes: false,
  reverted_changes: [],
  had_length_mismatch: false,
  original_length: currentScript.length,
  received_length: response.data.data ? response.data.data.length : 0
};

// Only apply changes to sentences that were explicitly selected for modification
response.data.modified_indices.forEach((index: number, i: number) => {
  // Verify the index is valid and was selected for modification
  const isValidModification = index >= 0 && 
                            index < modifiedScript.length && 
                            i < response.data.data.length &&
                            data.selected_sentences.includes(index); // KEY CHECK
  
  if (!isValidModification && index < modifiedScript.length) {
    // UNAUTHORISED CHANGE DETECTED: Log and track for reporting to user
    frontendValidation.had_unauthorized_changes = true;
    // Track details for user feedback
  }
});
```

Key code reference: [`ad-generation-tool/src/services/api.ts` lines 78-103](ad-generation-tool/src/services/api.ts)

#### 3. User Feedback System

The `ValidationFeedback` component in `ResultsPage.tsx` displays detailed alerts:

```tsx
const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({ validation, selectedLines }) => {
  // Skip rendering if no validation data is present
  if (!validation) return null;
  
  // Only show validation feedback if there are issues to report
  const hasIssues = validation.had_unauthorized_changes || validation.had_length_mismatch;
  if (!hasIssues) return null;
  
  return (
    <div className={`mt-4 p-4 ${bgColor} ${borderColor} border rounded-md ${textColor}`}>
      {/* Detailed validation feedback UI */}
      {validation.had_unauthorized_changes && (
        <div className="mb-2">
          <p className="font-medium">⚠️ Unauthorized changes detected and reverted:</p>
          <ul className="ml-6 list-disc">
            {validation.reverted_changes.map((change, idx) => (
              <li key={idx}>
                {/* Display original vs attempted change */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

Key code reference: [`ad-generation-tool/src/app/ResultsPage.tsx` lines 78-149](ad-generation-tool/src/app/ResultsPage.tsx)

### Testing the Validation System

The backend includes a dedicated testing function for the validation mechanism, which is crucial for ensuring script integrity during refinement:

```python
def test_validation():
    """
    Test function that simulates various scenarios to verify the validation mechanism works correctly.
    This is intended for development/debugging only.
    """
    # Runs test cases for:
    # 1. Scripts with only authorized changes
    # 2. Scripts with unauthorised changes (which should be reverted)
    # 3. Scripts with missing lines
    # 4. Scripts with extra lines
```

To run the validation tests, you can use either of these methods:

1. **Use the dedicated test runner:**
   ```bash
   python backend/run_validation_test.py
   ```

2.  **Uncomment the test line in main.py:**
   ```bash
   # Near the end of backend/main.py, uncomment:
   # test_validation()
   
   # Then run:
   python backend/main.py
   ```

These tests are essential to understand and verify the multi-layer validation system that protects script integrity.

Key code reference: [`backend/main.py` lines 393-473](backend/main.py)

---

## Frontend Implementation

### Key Components & Features

#### 1. Script Generation Page

The script generation page collects user inputs to create the initial script:

```tsx
// ScriptGenerationPage.tsx
const ScriptGenerationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    productName: '',
    targetAudience: '',
    keySellingPoints: '',
    tone: 'Conversational',
    adLength: '30s',
    speakerVoice: 'Male',
  });
  
  // Form handling, validation, and API integration
  // ...
}
```

Key code reference: [`ad-generation-tool/src/app/ScriptGenerationPage.tsx`](ad-generation-tool/src/app/ScriptGenerationPage.tsx)

#### 2. Script Selection & Refinement

The core of the validation system begins with sentence selection:

```tsx
/**
 * toggleSentenceSelection - Critical function for the validation system
 * -----------------------------------------------------------------------------
 * This function manages which sentences are eligible for modification during refinement.
 * The validation system ONLY allows changes to sentences selected through this function.
 */
const toggleSentenceSelection = (index: number) => {
  setSelectedLines((prev) =>
    prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
  );
  setHasUnsavedChanges(true);
};
```

Key code reference: [`ad-generation-tool/src/app/ResultsPage.tsx` lines 474-480](ad-generation-tool/src/app/ResultsPage.tsx)

#### 3. Refinement Execution

The refinement process integrates with the validation system:

```tsx
/**
 * executeAIRefinement - Handles the process of refining specific sentences
 * -----------------------------------------------------------------------------
 * Workflow:
 * 1. Prepares data for backend including only selected sentences
 * 2. Calls API with validation safeguards
 * 3. Updates the script with validated changes
 * 4. Stores validation results for user feedback
 */
const executeAIRefinement = async () => {
  // ...validate user inputs...
  
  try {
    // STEP 1: Prepare request data
    const formData = JSON.parse(localStorage.getItem('scriptGenerationFormData') || '{}');
    const currentScript = script.map(item => [item.line, item.artDirection]);
    
    // STEP 2: Call API with validation safeguards
    const result = await api.refineScriptWithValidation({
      selected_sentences: selectedLines,  // Only these sentences should be modified
      improvement_instruction: improvementInstruction,
      current_script: currentScript,
      // ...additional parameters...
    });
    
    // STEP 3-8: Process results, handle validation, update UI
    // ...
  } catch (error) {
    // Error handling
  }
};
```

Key code reference: [`ad-generation-tool/src/app/ResultsPage.tsx` lines 315-395](ad-generation-tool/src/app/ResultsPage.tsx)

#### 4. Version History Management

The application tracks script versions for comparison and restoration:

```tsx
const saveScriptVersion = (description: string = 'Manual update') => {
  const newVersion: ScriptVersion = {
    id: generateVersionId(),
    timestamp: new Date(),
    script: [...script],
    description,
  };
  
  const updatedVersions = [newVersion, ...versions];
  setVersions(updatedVersions);
  saveVersionHistory(updatedVersions);
};
```

---

## Backend Implementation

### API Endpoints

The FastAPI backend implements these key endpoints:

#### 1. Script Generation Endpoint

```python
@app.post("/generate_script", response_model=GenerateScriptResponse)
async def generate_script(request: ScriptRequest):
    """
    Generates an initial script based on user inputs.
    Uses CrewAI to create a professional radio ad script with art direction.
    """
    try:
        crew_inputs = {
            "product_name": request.product_name,
            "target_audience": request.target_audience,
            "key_selling_points": request.key_selling_points,
            "tone": request.tone,
            "ad_length": request.ad_length,
            "speaker_voice": request.speaker_voice
        }
        
        # Generate script using CrewAI
        script_objects = await run_crewai_script(crew_inputs)
        
        return GenerateScriptResponse(
            success=True,
            script=script_objects
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 2. Script Refinement with Validation

```python
@app.post("/regenerate_script", response_model=RefineScriptResponse)
async def regenerate_script(request: RefineRequest):
    """
    Refines selected portions of a script while ensuring unselected
    portions remain unchanged through the validation system.
    """
    try:
        crew_inputs = {
            # Script data and refinement instructions
            "selected_sentences": request.selected_sentences,
            "improvement_instruction": request.improvement_instruction,
            "current_script": request.current_script,
            # Additional context from original request
            "key_selling_points": request.key_selling_points,
            "tone": request.tone,
            "ad_length": request.ad_length
        }
        
        # Get refinement results
        modified_script, validation_metadata = await run_regenerate_script_crew(crew_inputs)
        
        # Return both the refined script and validation metadata
        return RefineScriptResponse(
            status="success",
            data=modified_script,
            modified_indices=request.selected_sentences,
            validation=validation_metadata
        )
    except Exception as e:
        # Error handling
```

### Validation Processing

The critical validation function ensures script integrity:

```python
def process_marked_output(output_text, original_script, selected_sentences):
    """
    Validates and processes refinement output to ensure only
    authorised changes are applied to the script.
    """
    # Initialise validation metadata
    meta = {
        "reverted_changes": [],
        "had_unauthorized_changes": False,
        "had_length_mismatch": False,
        "original_length": len(original_script),
        "received_length": 0
    }
    
    try:
        # Parse and process the generated script
        parsed_script = parse_script_output(output_text)
        meta["received_length"] = len(parsed_script)
        
        # Validate script length and adjust if needed
        if len(parsed_script) != len(original_script):
            meta["had_length_mismatch"] = True
            # Length adjustment logic...
        
        # Remove markers from the generated script
        # ...
        
        # Verify only selected sentences were modified
        verified_script = []
        for i, (orig_line, orig_art) in enumerate(original_script):
            gen_item = parsed_script[i] if i < len(parsed_script) else {"line": "", "artDirection": ""}
            
            # If this is not a selected sentence, ensure it remains unchanged
            if i not in selected_sentences:
                if gen_item.get("line", "") != orig_line or gen_item.get("artDirection", "") != orig_art:
                    # Unauthorised change detected - revert and track
                    meta["had_unauthorized_changes"] = True
                    meta["reverted_changes"].append({
                        "index": i,
                        "original": {"line": orig_line, "artDirection": orig_art},
                        "attempted": {"line": gen_item.get("line", ""), "artDirection": gen_item.get("artDirection", "")}
                    })
                    verified_script.append({
                        "line": orig_line,
                        "artDirection": orig_art
                    })
                else:
                    # No changes, keep as is
                    verified_script.append(gen_item)
            else:
                # Selected sentence, accept changes
                verified_script.append(gen_item)
        
        return verified_script, meta
        
    except Exception as e:
        # Exception handling
```

Key code reference: [`backend/main.py` lines 237-327](backend/main.py)

---

## User Experience & Interface

### 1. Script Selection UX

<div align="center">

![Script Selection UX](https://mermaid.ink/img/pako:eNptUMFqwzAM_RXh0w7dCjs0l4VCYYcdWthhsDSHxlJjsETGljdK8vFz3K6wQnWS3tN7ejqDtVqCBOZc4-xJmRHQeeuzlFcX_XHej51TWTVql3cBHToonuQbT6fecyNVlU-yxeQW09yzDt2YZJUSUr1yt0aFoNkRdhN-y_h2-_xkL27sEGR4gO2uc2hjNYHBrDZ_0LUlEbJ3ZlQgPcgDGf_IQqy2VTuTnPKuaFrzR7GXpzv5BDvTwmZ6qYQkZw0t2FfXwZHCB8nzXMJGGBbGGKiCXj9ODfaUr1D4Qd_LY_bepHrllUVXw5A2KBuT9oaOzEPbMRIpSGaFuC_Eh6jvittiJ9b_ynl9?type=png)

*Script selection interface where users choose sentences for refinement*

</div>

The UI clearly indicates which sentences are selected for modification:

```tsx
// Script rendering with selection functionality
{script.map((item, index) => (
  <div 
    key={index}
    className={`p-4 mb-4 rounded-lg border-2 ${
      selectedLines.includes(index) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`}
    onClick={(e) => handleScriptLineClick(index, e)}
  >
    {/* Script content */}
    <div className="flex items-center mb-2">
      <input
        type="checkbox"
        className="mr-2 h-5 w-5 text-blue-600"
        checked={selectedLines.includes(index)}
        onChange={() => toggleSentenceSelection(index)}
      />
      <span className="font-medium">Line {index + 1}</span>
    </div>
    
    {/* Script text and art direction */}
  </div>
))}
```

### 2. Validation Feedback UI

<div align="center">

![Validation Feedback](https://mermaid.ink/img/pako:eNp9kk1v2zAMhv8K4dMO3QpvaN0LBgwYkEMPLbCD0ENgC7VFWFIgye2aIP9-tLOhaY_bSXof8hH5kr5JrSRJRGXkSu1YZRtAw9qnKRXnc-Vr9ZRrlRDTt3njwYCB7Eim_vDP3mG4dOdg3ck-gzQ5tPvqw4iDYHIXPxwG-77hr6tPYBa34xkbqQZJBtuaWE3scXzU-hVAVgVlVOetAzQnVbBDhzYl0myqQs5WVW1gVLEWovyOUGO9JQnZyjVkXCaFi9RYhaYB-KNqusoOr2v8TQqFwcBs0QjG2GSyVahljit1A42UCkIy_1_s1T2Xyx1qAz2raaNyDLNDRv_Jt0Wg7Tskb-xP1nLcEOa5nIL8Lk3kIFLpmByOwpE-jKhm_wWfLrIIjXZ1xxn_Jmlh-VDQQqaZ45PROOJNe3c4vrdPK_NTG_jyBQ?type=png)

*Validation feedback component displaying unauthorised changes*

</div>

The `ValidationFeedback` component shows detailed information about validation issues:

```tsx
{validation.had_unauthorized_changes && (
  <div className="mb-2">
    <p className="font-medium">⚠️ Unauthorized changes detected and reverted:</p>
    <p className="text-sm mb-2">
      The system protected sentences you didn't select for modification.
      Only sentences you explicitly select can be changed.
    </p>
    <ul className="ml-6 list-disc">
      {validation.reverted_changes.map((change, idx) => (
        <li key={idx}>
          Line {change.index}: 
          {/* Show attempted change (crossed out in red) */}
          <span className="line-through text-red-600 mx-2">
            {change.attempted.line.substring(0, 40)}
            {change.attempted.line.length > 40 ? '...' : ''}
          </span>
          {/* Show preserved original content (in green) */}
          <span className="text-green-600">
            → {change.original.line.substring(0, 40)}
            {change.original.line.length > 40 ? '...' : ''}
          </span>
        </li>
      ))}
    </ul>
    <p className="mt-2 text-sm italic">
      Note: Only sentences at indices [{selectedLines.join(', ')}] were authorized for modification.
    </p>
  </div>
)}
```

### 3. Version History Management

<div align="center">

![Version History UI](https://mermaid.ink/img/pako:eNptkMFqwzAMhl9F-NRDu9IOzWWhsK3QQw87DJYWE6uxwRIZW95oyMvPcbfCCtVJ-v_vl3R1Zs0CGVQu76o9z7wGdOxdZoVo8afP13Phoyb26t91AD4yVGeV9SYDPOOy4KXxrtYwYTDKVW_Dy4_-nktKCXmrpg_9CcGFKoR9gHVH2e8XQqHs4MO4xOBB3g17Kv4WOeWd3zqTTMQ2b7z_oJMoPZIvuHMdLPRzUygXTGFhYgJb1T44jjxRekZ7fptLgudL4VYYZlWj5ZvElDJ0F-zYYSKRCkLwmbhJ-D7qumzXwS_RUnK6?type=png)

*Version history interface for tracking script revisions*

</div>

The version history system allows users to track and restore previous versions:

```tsx
<div className="border rounded-lg p-4 mb-4">
  <h3 className="text-lg font-semibold mb-2">Version History</h3>
  <div className="space-y-2 max-h-60 overflow-y-auto">
    {versions.map((version) => (
      <div 
        key={version.id} 
        className="p-2 border rounded flex justify-between items-center hover:bg-gray-50"
      >
        <div>
          <div className="font-medium">{version.description}</div>
          <div className="text-sm text-gray-500">{formatTimestamp(version.timestamp)}</div>
        </div>
        <div className="space-x-2">
          <button 
            className="px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
            onClick={() => setComparingVersion(
              comparingVersion?.id === version.id ? null : version
            )}
          >
            {comparingVersion?.id === version.id ? 'Hide Diff' : 'Compare'}
          </button>
          <button 
            className="px-2 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
            onClick={() => restorePreviousVersion(version)}
          >
            Restore
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## Technical Challenges & Solutions

### 1. Ensuring Script Integrity

**Challenge**: Ensuring that only selected sentences were modified during refinement, while preserving others exactly as they were.

**Solution**: Implemented the multi-layer validation system that independently verifies changes at both backend and frontend levels:

```
Backend Validation → API Service Verification → User Feedback
```

### 2. State Persistence

**Challenge**: Maintaining validation state and feedback across page refreshes.

**Solution**: Implemented localStorage-based persistence:

```tsx
// Save validation data when issues are detected
if (result.validation) {
  setValidationData(result.validation);
  localStorage.setItem('validationData', JSON.stringify(result.validation));
}

// Load validation data on page load
useEffect(() => {
  const savedValidationData = localStorage.getItem('validationData');
  if (savedValidationData) {
    try {
      setValidationData(JSON.parse(savedValidationData));
    } catch (e) {
      console.error('Error parsing saved validation data', e);
    }
  }
}, []);
```

### 3. Processing Various Script Formats

**Challenge**: Handling different output formats from the AI model.

**Solution**: Implemented robust parsing and normalization:

```python
def parse_script_output(output: str) -> List[Dict[str, str]]:
    """Parse the script output from the crew into a list of script objects."""
    try:
        # Multiple parsing strategies:
        # 1. JSON parsing
        # 2. Python literal evaluation
        # 3. Regex-based extraction
        # Each serves as a fallback if the previous method fails
        
        # First try to parse as JSON
        try:
            data = json.loads(output)
            # processing...
        except json.JSONDecodeError:
            # Try Python literal evaluation
            import ast
            try:
                data = ast.literal_eval(output)
                # processing...
            except (SyntaxError, ValueError):
                # Last resort: regex pattern matching
                import re
                pattern = r'\("([^"]+)",\s*"([^"]+)"\)'
                matches = re.findall(pattern, output)
                # processing...
```

---

## Future Enhancements

<div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 20px;">
  <div style="width: 48%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px;">
    <h4>Real-time Collaborative Editing</h4>
    <p>Implement WebSocket-based collaboration to allow multiple users to work on the same script simultaneously.</p>
  </div>
  <div style="width: 48%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px;">
    <h4>Enhanced TTS Options</h4>
    <p>Integrate with more advanced TTS services with emotion control, emphasis markers, and multiple voice options.</p>
  </div>
  <div style="width: 48%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px;">
    <h4>Script Templates</h4>
    <p>Create and save reusable script templates for faster ad generation with consistent structure.</p>
  </div>
  <div style="width: 48%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px;">
    <h4>Analytics Dashboard</h4>
    <p>Add metrics tracking for script generation, refinement patterns, and user engagement.</p>
  </div>
</div>

---

<div align="center">
<h2>Thank You!</h2>
<p>For questions or further information, please contact the development team.</p>
</div> 
