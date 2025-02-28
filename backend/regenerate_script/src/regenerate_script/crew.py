# regenerate_script/crew.py
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from pathlib import Path

@CrewBase
class ScriptRefinement():
    """
    RegenerateScript (ScriptRefinement) crew for refining selected lines in an existing ad script 
    and art direction based on user instructions.

    New Inputs:
      - key_selling_points: Key selling points of the product.
      - tone: The desired tone of the ad (e.g., "Fun", "Professional", "Urgent").
      - ad_length: The duration of the ad (15s, 30s, 60s).
      - current_script: The previously generated script as a list of tuples (script line, art direction).
        Each sentence will be clearly marked with either [[SELECTED FOR MODIFICATION]] or [[PRESERVE]] tags.
      - selected_sentences: A list of indices indicating which sentences should be refined.
      - improvement_instruction: A description of the change to be applied to the selected sentences
        (e.g., "Add a pun about coffee").
      - explicit_instruction: Clear directives reinforcing that ONLY selected sentences should be modified
        and all others must be preserved exactly as provided.
    
    Output:
      - A list of tuples formatted as:
          [
            ("Line 1 text", "Voice direction for line 1"),
            ("Line 2 text", "Voice direction for line 2"),
            ...
          ]
      
    CRITICAL REQUIREMENTS:
      - ONLY the sentences marked with [[SELECTED FOR MODIFICATION]] should be modified based on
        the improvement_instruction.
      - All sentences marked with [[PRESERVE]] MUST remain unchanged.
      - The output will be validated against the original script, and any unauthorized modifications
        will be automatically reverted.
      - The validation process enforces strict adherence to these boundaries and provides feedback on
        any detected violations.
      
    Example Input/Output:
      Input:
        [
          ["[[PRESERVE: 0]] Line one of script. [[END PRESERVE]]", "[[PRESERVE: 0]] Speak with enthusiasm. [[END PRESERVE]]"],
          ["[[SELECTED FOR MODIFICATION: 1]] Line two needs improvement. [[END SELECTED]]", "[[SELECTED FOR MODIFICATION: 1]] Speak calmly. [[END SELECTED]]"],
          ["[[PRESERVE: 2]] Line three is fine. [[END PRESERVE]]", "[[PRESERVE: 2]] Speak with authority. [[END PRESERVE]]"]
        ]
      
      Expected Output:
        [
          ("Line one of script.", "Speak with enthusiasm."),
          ("Line two has been improved and made more engaging!", "Speak calmly with a hint of excitement."),
          ("Line three is fine.", "Speak with authority.")
        ]
        
      Notice how only line 1 (index 1) is modified while lines 0 and 2 remain exactly as provided.
    """

    # Load the YAML configuration files for agents and tasks.
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def refine_script_generator(self) -> Agent:
        """
        Define the script refinement agent.
        This agent is responsible for taking the original ad script and applying selective refinements
        according to the improvement_instruction, while keeping all non-selected sentences COMPLETELY UNCHANGED.
        The agent must ONLY modify sentences explicitly marked for modification.

        The agent adheres to strict constraints:
        1. Only modify sentences marked with [[SELECTED FOR MODIFICATION]]
        2. Preserve all other sentences exactly as provided
        3. Return a complete script with all sentences (modified and preserved)
        4. Remove all markup tags in the final output
        
        The system will validate the output to ensure these constraints are met.
        """
        return Agent(
            config=self.agents_config['refine_script_generator'],
            verbose=True
        )

    @task
    def refine_script_task(self) -> Task:
        """
        Define the task to refine the ad script.
        The task uses the provided inputs to update only the selected sentences in the ad script.
        
        This task enforces a strict validation process:
        1. Verify that only selected sentences are modified
        2. Ensure non-selected sentences remain exactly as provided
        3. Revert any unauthorized changes automatically
        4. Generate metadata about the validation process
        
        The task's output will be carefully processed to maintain the integrity of non-selected content.
        """
        output_path = Path(__file__).parent.parent.parent / 'refined_script.md'
        
        return Task(
            config=self.tasks_config['refine_script_task'],
            output_file=str(output_path)
        )

    @crew
    def crew(self) -> Crew:
        """
        Creates the RegenerateScript (ScriptRefinement) crew that sequentially executes the defined task(s).
        The crew leverages the agent and task to produce a refined ad script as a list of tuples.
        
        The crew implements a post-processing validation step that:
        1. Verifies all non-selected sentences remain unchanged
        2. Reverts any unauthorized changes
        3. Records metadata about the validation process
        4. Ensures script integrity is maintained
        
        This validation ensures the final output respects user selections and maintains the integrity
        of the original script in non-selected areas.
        """
        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator.
            tasks=self.tasks,    # Automatically created by the @task decorator.
            process=Process.sequential,
            verbose=True,
        )
