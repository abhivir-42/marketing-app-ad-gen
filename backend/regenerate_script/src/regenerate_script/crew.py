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
      IMPORTANT: Only the sentences marked with [[SELECTED FOR MODIFICATION]] should be modified based on
      the improvement_instruction. All sentences marked with [[PRESERVE]] MUST remain unchanged.
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
        """
        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator.
            tasks=self.tasks,    # Automatically created by the @task decorator.
            process=Process.sequential,
            verbose=True,
        )
