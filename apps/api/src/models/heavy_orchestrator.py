"""
Heavy Orchestrator - Multi-Agent System Integration
Integrates make-it-heavy framework with Crazy-Gary for advanced multi-agent capabilities
"""
import json
import time
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging

from src.models.harmony_client import HarmonyClient
from src.models.mcp_orchestrator import MCPOrchestrator
from src.models.observability import observability_manager, timed_operation

logger = logging.getLogger(__name__)

class AgentStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"
    TIMEOUT = "timeout"

@dataclass
class AgentTask:
    agent_id: int
    question: str
    status: AgentStatus = AgentStatus.PENDING
    result: Optional[str] = None
    error: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    execution_time: Optional[float] = None

@dataclass
class OrchestrationResult:
    success: bool
    final_response: str
    agent_tasks: List[AgentTask]
    total_execution_time: float
    synthesis_time: float
    error: Optional[str] = None

class HeavyOrchestrator:
    """
    Advanced multi-agent orchestrator inspired by make-it-heavy framework
    Provides parallel agent execution with intelligent synthesis
    """
    
    def __init__(self, num_agents: int = 4, task_timeout: int = 300):
        self.num_agents = num_agents
        self.task_timeout = task_timeout
        self.harmony_client = HarmonyClient()
        self.mcp_orchestrator = MCPOrchestrator()
        
        # Progress tracking
        self.agent_progress = {}
        self.agent_results = {}
        self.progress_lock = threading.Lock()
        
        # Configuration
        self.question_generation_prompt = """
You are an orchestrator that needs to create {num_agents} different questions to thoroughly analyze this topic from multiple angles.

Original user query: {user_input}

Generate exactly {num_agents} different, specific questions that will help gather comprehensive information about this topic.
Each question should approach the topic from a different angle (research, analysis, verification, alternatives, etc.).

Return your response as a JSON array of strings, like this:
["question 1", "question 2", "question 3", "question 4"]

Only return the JSON array, nothing else.
"""
        
        self.synthesis_prompt = """
You have {num_responses} different AI agents that analyzed the same query from different perspectives. 
Your job is to synthesize their responses into ONE comprehensive final answer.

Original user query: {original_query}

Here are all the agent responses:

{agent_responses}

IMPORTANT: Synthesize these into ONE final comprehensive answer that combines the best information from all agents. 
Do NOT mention that you are synthesizing multiple responses. 
Simply provide the final synthesized answer directly as your response.
"""
    
    @timed_operation("question_generation")
    async def decompose_task(self, user_input: str) -> List[str]:
        """Use AI to dynamically generate different questions based on user input"""
        try:
            # Create question generation prompt
            prompt = self.question_generation_prompt.format(
                user_input=user_input,
                num_agents=self.num_agents
            )
            
            # Generate questions using Harmony
            messages = [
                {
                    "type": "text",
                    "content": prompt,
                    "metadata": {
                        "timestamp": time.time(),
                        "source": "orchestrator"
                    }
                }
            ]
            
            response = await self.harmony_client.generate_response(messages, "20b")
            
            if response and "choices" in response:
                content = response["choices"][0]["message"]["content"]
                
                # Try to parse JSON response
                try:
                    questions = json.loads(content.strip())
                    
                    # Validate we got the right number of questions
                    if isinstance(questions, list) and len(questions) == self.num_agents:
                        return questions
                except json.JSONDecodeError:
                    pass
            
            # Fallback: create simple variations if AI fails
            logger.warning("Question generation failed, using fallback questions")
            return self._create_fallback_questions(user_input)
            
        except Exception as e:
            logger.error(f"Error in task decomposition: {str(e)}")
            return self._create_fallback_questions(user_input)
    
    def _create_fallback_questions(self, user_input: str) -> List[str]:
        """Create fallback questions if AI generation fails"""
        return [
            f"Research comprehensive information about: {user_input}",
            f"Analyze and provide detailed insights about: {user_input}",
            f"Find alternative perspectives and approaches to: {user_input}",
            f"Verify facts and provide additional context about: {user_input}"
        ][:self.num_agents]
    
    def update_agent_progress(self, agent_id: int, status: AgentStatus, result: str = None, error: str = None):
        """Thread-safe progress tracking"""
        with self.progress_lock:
            self.agent_progress[agent_id] = status
            if result is not None:
                self.agent_results[agent_id] = result
            
            # Log progress for observability
            observability_manager.record_metric(
                f"agent_{agent_id}_status",
                1.0,
                labels={"status": status.value}
            )
    
    async def run_agent_task(self, agent_task: AgentTask) -> AgentTask:
        """Run a single agent with the given subtask"""
        try:
            agent_task.start_time = time.time()
            agent_task.status = AgentStatus.PROCESSING
            self.update_agent_progress(agent_task.agent_id, AgentStatus.PROCESSING)
            
            # Create messages for the agent
            messages = [
                {
                    "type": "text",
                    "content": agent_task.question,
                    "metadata": {
                        "timestamp": time.time(),
                        "source": "orchestrator",
                        "agent_id": agent_task.agent_id
                    }
                }
            ]
            
            # Use Harmony client to generate response
            response = await self.harmony_client.generate_response(messages, "20b")
            
            if response and "choices" in response:
                agent_task.result = response["choices"][0]["message"]["content"]
                agent_task.status = AgentStatus.COMPLETED
                agent_task.end_time = time.time()
                agent_task.execution_time = agent_task.end_time - agent_task.start_time
                
                self.update_agent_progress(agent_task.agent_id, AgentStatus.COMPLETED, agent_task.result)
                
                # Log performance
                observability_manager.log_performance(
                    f"agent_{agent_task.agent_id}_execution",
                    agent_task.execution_time * 1000,
                    {"question_length": len(agent_task.question)}
                )
            else:
                raise Exception("No response from Harmony client")
            
        except asyncio.TimeoutError:
            agent_task.status = AgentStatus.TIMEOUT
            agent_task.error = "Agent execution timed out"
            agent_task.end_time = time.time()
            self.update_agent_progress(agent_task.agent_id, AgentStatus.TIMEOUT, error="Timeout")
            
        except Exception as e:
            agent_task.status = AgentStatus.ERROR
            agent_task.error = str(e)
            agent_task.end_time = time.time()
            self.update_agent_progress(agent_task.agent_id, AgentStatus.ERROR, error=str(e))
            
            # Log error
            observability_manager.log_error(
                "agent_execution_error",
                f"Agent {agent_task.agent_id} failed: {str(e)}",
                stack_trace=str(e)
            )
        
        return agent_task
    
    @timed_operation("parallel_agent_execution")
    async def run_parallel_agents(self, questions: List[str]) -> List[AgentTask]:
        """Run multiple agents in parallel"""
        # Create agent tasks
        agent_tasks = [
            AgentTask(agent_id=i, question=question)
            for i, question in enumerate(questions)
        ]
        
        # Run agents in parallel with timeout
        try:
            completed_tasks = await asyncio.wait_for(
                asyncio.gather(*[
                    self.run_agent_task(task) for task in agent_tasks
                ]),
                timeout=self.task_timeout
            )
            return completed_tasks
            
        except asyncio.TimeoutError:
            logger.error("Parallel agent execution timed out")
            # Mark incomplete tasks as timed out
            for task in agent_tasks:
                if task.status == AgentStatus.PROCESSING:
                    task.status = AgentStatus.TIMEOUT
                    task.error = "Global timeout"
            return agent_tasks
    
    @timed_operation("response_synthesis")
    async def synthesize_responses(self, original_query: str, agent_tasks: List[AgentTask]) -> str:
        """Synthesize multiple agent responses into a comprehensive answer"""
        try:
            # Collect successful responses
            successful_responses = []
            for task in agent_tasks:
                if task.status == AgentStatus.COMPLETED and task.result:
                    successful_responses.append(f"Agent {task.agent_id}: {task.result}")
            
            if not successful_responses:
                return "I apologize, but I was unable to generate a comprehensive response due to agent execution failures."
            
            # Create synthesis prompt
            agent_responses_text = "\n\n".join(successful_responses)
            synthesis_prompt = self.synthesis_prompt.format(
                num_responses=len(successful_responses),
                original_query=original_query,
                agent_responses=agent_responses_text
            )
            
            # Generate synthesis using Harmony
            messages = [
                {
                    "type": "text",
                    "content": synthesis_prompt,
                    "metadata": {
                        "timestamp": time.time(),
                        "source": "synthesizer"
                    }
                }
            ]
            
            response = await self.harmony_client.generate_response(messages, "120b")  # Use larger model for synthesis
            
            if response and "choices" in response:
                return response["choices"][0]["message"]["content"]
            else:
                # Fallback: return concatenated responses
                return f"Based on comprehensive analysis:\n\n{agent_responses_text}"
                
        except Exception as e:
            logger.error(f"Synthesis failed: {str(e)}")
            # Fallback: return best available response
            for task in agent_tasks:
                if task.status == AgentStatus.COMPLETED and task.result:
                    return f"Analysis result: {task.result}"
            return "I apologize, but I was unable to synthesize the responses due to technical difficulties."
    
    async def orchestrate(self, user_input: str) -> OrchestrationResult:
        """Main orchestration method - coordinates the entire multi-agent process"""
        start_time = time.time()
        
        try:
            # Step 1: Decompose task into questions
            logger.info(f"Starting orchestration for: {user_input[:100]}...")
            questions = await self.decompose_task(user_input)
            
            # Step 2: Run agents in parallel
            logger.info(f"Running {len(questions)} agents in parallel")
            agent_tasks = await self.run_parallel_agents(questions)
            
            # Step 3: Synthesize responses
            synthesis_start = time.time()
            final_response = await self.synthesize_responses(user_input, agent_tasks)
            synthesis_time = time.time() - synthesis_start
            
            total_execution_time = time.time() - start_time
            
            # Log orchestration metrics
            observability_manager.log_performance(
                "orchestration_complete",
                total_execution_time * 1000,
                {
                    "num_agents": len(agent_tasks),
                    "successful_agents": len([t for t in agent_tasks if t.status == AgentStatus.COMPLETED]),
                    "synthesis_time_ms": synthesis_time * 1000
                }
            )
            
            return OrchestrationResult(
                success=True,
                final_response=final_response,
                agent_tasks=agent_tasks,
                total_execution_time=total_execution_time,
                synthesis_time=synthesis_time
            )
            
        except Exception as e:
            total_execution_time = time.time() - start_time
            error_msg = f"Orchestration failed: {str(e)}"
            logger.error(error_msg)
            
            observability_manager.log_error(
                "orchestration_error",
                error_msg,
                stack_trace=str(e)
            )
            
            return OrchestrationResult(
                success=False,
                final_response="I apologize, but I encountered an error while processing your request.",
                agent_tasks=[],
                total_execution_time=total_execution_time,
                synthesis_time=0.0,
                error=error_msg
            )
    
    def get_progress_status(self) -> Dict[str, Any]:
        """Get current progress status for real-time updates"""
        with self.progress_lock:
            return {
                "agent_progress": dict(self.agent_progress),
                "agent_results": dict(self.agent_results),
                "timestamp": time.time()
            }

# Global heavy orchestrator instance
heavy_orchestrator = HeavyOrchestrator()

