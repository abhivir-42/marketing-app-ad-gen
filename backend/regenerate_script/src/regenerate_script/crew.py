# regenerate_script/crew.py

"""
RegenerateScript Crew for Refining Selected Ad Script Lines

This module implements the RegenerateScript crew which refines specific lines of a previously 
generated ad script based on user feedback. It uses the crew AI system to process the following inputs:

New Inputs:
- product_name: The name of the product.
- target_audience: The target audience (e.g., "Teens", "Small Business Owners").
- key_selling_points: Key selling points of the product.
- tone: The desired tone of the ad (e.g., "Fun", "Professional", "Urgent").
- ad_length: The duration of the ad (15s, 30s, 60s).
- speaker_voice: The voice to be used (Male, Female, or Either).
- current_script: The previously generated ad script, as a list of tuples (script_line, art_direction).
- selected_sentences: A list of indices indicating which lines in the script should be refined.
- improvement_instruction: A description of how the selected lines should be modified 
  (e.g., "Add a pun about coffee").

How It Works:
1. The crew receives the original ad details along with the current script and refinement inputs.
2. The agent (ad_script_refinement) uses these inputs to generate a new ad script where only the selected
   lines are refined according to the improvement instruction, while the rest of the script remains mostly unchanged.
3. The output is a list of tuples (script_line, art_direction) which will be returned to the backend and 
   displayed on the Script & Art Direction Results Page.

Usage:
- To run this crew, call the kickoff() method with a JSON containing all required inputs.
- Ensure the configuration files (config/agents.yaml and config/tasks.yaml) contain the corresponding 
  entries for 'ad_script_refinement' and 'ad_script_refinement_task'.

Note: This module is part of the backend integration and is invoked via a POST request from the 
"Refine with AI" button on the Script & Art Direction Results Page.
"""

from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from pathlib import Path

@CrewBase
class RegenerateScript():
    """
    RegenerateScript crew for refining selected lines of ad script and art direction.

    Expected Inputs:
    - product_name: str
    - target_audience: str
    - key_selling_points: str
    - tone: str
    - ad_length: str
    - speaker_voice: str
    - current_script: List[Tuple[str, str]]
    - selected_sentences: List[int]
    - improvement_instruction: str
    """

    # Load the YAML configuration files for agents and tasks.
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def ad_script_refinement(self) -> Agent:
        """
        Agent responsible for refining selected ad script lines based on user input.
        Uses the 'ad_script_refinement' configuration from config/agents.yaml.
        """
        return Agent(
            config=self.agents_config['ad_script_refinement'],
            verbose=True
        )

    @task
    def ad_script_refinement_task(self) -> Task:
        """
        Task to refine the ad script.
        Generates an updated ad script (list of tuples) where only the selected lines are modified
        according to the improvement_instruction while preserving the other lines.
        The result is saved to a file (refined_radio_script.md) for reference.
        """
        output_path = Path(__file__).parent.parent.parent / 'refined_radio_script.md'
        return Task(
            config=self.tasks_config['ad_script_refinement_task'],
            output_file=str(output_path)
        )

    @crew
    def crew(self) -> Crew:
        """
        Creates the RegenerateScript crew that sequentially executes the defined task(s).
        """
        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator.
            tasks=self.tasks,    # Automatically created by the @task decorator.
            process=Process.sequential,
            verbose=True,
        )
