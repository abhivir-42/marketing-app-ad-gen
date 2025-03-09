# script_generation/crew.py
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from pathlib import Path

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

	# If you want to run a snippet of code before or after the crew starts, 
    # you can use the @before_kickoff and @after_kickoff decorators
 	# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators

    # Load the YAML configuration files for agents and tasks.
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

	# If you would like to add tools to your agents, you can learn more about it here:
	# https://docs.crewai.com/concepts/agents#agent-tools

    @agent
    def ad_script_generator(self) -> Agent:
        return Agent(
            config=self.agents_config['ad_script_generator'],
            verbose=True
        )


	# To learn more about structured task outputs, 
	# task dependencies, and task callbacks, check out the documentation:
	# https://docs.crewai.com/concepts/tasks#overview-of-a-task
    @task
    def ad_script_task(self) -> Task:
        # Use an absolute path that will work on the server
        output_path = Path("/home/azureuser/marketing-app-ad-gen/backend/script_generation/radio_script.md")
        print(f"Expected output path: {output_path}")  # Debugging line
        print("Starting ad script task...")  # Debugging line
        task = Task(
            config=self.tasks_config['ad_script_task'],
            output_file=str(output_path)
        )
        print("Task created, returning task...")  # Debugging line
        return task

    @crew
    def crew(self) -> Crew:
        """
        Creates the ScriptGeneration crew that sequentially executes the defined task(s).
        """
		# To learn how to add knowledge sources to your crew, check out the documentation:
		# https://docs.crewai.com/concepts/knowledge#what-is-knowledge
        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator.
            tasks=self.tasks,    # Automatically created by the @task decorator.
            process=Process.sequential,
            verbose=True,
			# process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )
