"""
Agent Loop and Task Execution Engine
Core autonomous planning, tool selection, execution, and verification system
"""
import asyncio
import json
import uuid
import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import logging

from src.models.harmony_client import HarmonyClient
from src.models.mcp_orchestrator import MCPOrchestrator, MCPToolCall
from src.models.endpoint_manager import HuggingFaceEndpointManager

logger = logging.getLogger(__name__)

class TaskStatus(Enum):
    PENDING = "pending"
    PLANNING = "planning"
    EXECUTING = "executing"
    VERIFYING = "verifying"
    COMPLETED = "completed"
    FAILED = "failed"
    STOPPED = "stopped"

class StepType(Enum):
    PLAN = "plan"
    TOOL_CALL = "tool_call"
    VERIFICATION = "verification"
    REFLECTION = "reflection"

@dataclass
class TaskStep:
    id: str
    type: StepType
    description: str
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    status: str = "pending"
    error: Optional[str] = None
    timestamp: float = None
    duration: Optional[float] = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()

@dataclass
class AgentTask:
    id: str
    title: str
    description: str
    status: TaskStatus
    model: str = "gpt-oss-120b"
    priority: str = "medium"
    created_at: float = None
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
    steps: List[TaskStep] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = time.time()
        if self.steps is None:
            self.steps = []
        if self.metadata is None:
            self.metadata = {}

class AgentLoop:
    def __init__(self):
        self.harmony_client = None
        self.mcp_orchestrator = None
        self.endpoint_manager = HuggingFaceEndpointManager()
        self.running_tasks: Dict[str, AgentTask] = {}
        self.task_history: List[AgentTask] = []
        self.max_concurrent_tasks = 3
        self.max_steps_per_task = 20
        self.step_timeout = 300  # 5 minutes per step
        
    async def __aenter__(self):
        self.harmony_client = HarmonyClient()
        await self.harmony_client.__aenter__()
        
        self.mcp_orchestrator = MCPOrchestrator()
        await self.mcp_orchestrator.__aenter__()
        
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.harmony_client:
            await self.harmony_client.__aexit__(exc_type, exc_val, exc_tb)
        if self.mcp_orchestrator:
            await self.mcp_orchestrator.__aexit__(exc_type, exc_val, exc_tb)

    async def create_task(self, title: str, description: str, model: str = "gpt-oss-120b", priority: str = "medium") -> str:
        """Create a new agentic task"""
        task_id = str(uuid.uuid4())
        task = AgentTask(
            id=task_id,
            title=title,
            description=description,
            status=TaskStatus.PENDING,
            model=model,
            priority=priority
        )
        
        self.running_tasks[task_id] = task
        logger.info(f"Created task {task_id}: {title}")
        
        return task_id

    async def start_task(self, task_id: str) -> bool:
        """Start executing a task"""
        if task_id not in self.running_tasks:
            logger.error(f"Task {task_id} not found")
            return False
        
        task = self.running_tasks[task_id]
        if task.status != TaskStatus.PENDING:
            logger.error(f"Task {task_id} is not in pending status")
            return False
        
        # Check if we can start another task
        active_tasks = sum(1 for t in self.running_tasks.values() 
                          if t.status in [TaskStatus.PLANNING, TaskStatus.EXECUTING, TaskStatus.VERIFYING])
        
        if active_tasks >= self.max_concurrent_tasks:
            logger.warning(f"Cannot start task {task_id}: max concurrent tasks reached")
            return False
        
        # Start the task execution in background
        asyncio.create_task(self._execute_task(task_id))
        return True

    async def stop_task(self, task_id: str) -> bool:
        """Stop a running task"""
        if task_id not in self.running_tasks:
            return False
        
        task = self.running_tasks[task_id]
        if task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.STOPPED]:
            return False
        
        task.status = TaskStatus.STOPPED
        task.completed_at = time.time()
        logger.info(f"Stopped task {task_id}")
        
        return True

    async def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get the current status of a task"""
        if task_id in self.running_tasks:
            task = self.running_tasks[task_id]
        else:
            # Check task history
            task = next((t for t in self.task_history if t.id == task_id), None)
        
        if not task:
            return None
        
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status.value,
            "model": task.model,
            "priority": task.priority,
            "created_at": task.created_at,
            "started_at": task.started_at,
            "completed_at": task.completed_at,
            "steps": [asdict(step) for step in task.steps],
            "result": task.result,
            "error": task.error,
            "metadata": task.metadata
        }

    async def list_tasks(self, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all tasks with optional status filter"""
        all_tasks = list(self.running_tasks.values()) + self.task_history
        
        if status_filter:
            all_tasks = [t for t in all_tasks if t.status.value == status_filter]
        
        return [await self.get_task_status(task.id) for task in all_tasks]

    async def _execute_task(self, task_id: str):
        """Main task execution loop"""
        task = self.running_tasks[task_id]
        task.status = TaskStatus.PLANNING
        task.started_at = time.time()
        
        try:
            logger.info(f"Starting execution of task {task_id}: {task.title}")
            
            # Phase 1: Planning
            await self._planning_phase(task)
            
            # Phase 2: Execution
            if task.status == TaskStatus.PLANNING:
                task.status = TaskStatus.EXECUTING
                await self._execution_phase(task)
            
            # Phase 3: Verification
            if task.status == TaskStatus.EXECUTING:
                task.status = TaskStatus.VERIFYING
                await self._verification_phase(task)
            
            # Mark as completed if we made it through all phases
            if task.status == TaskStatus.VERIFYING:
                task.status = TaskStatus.COMPLETED
                task.completed_at = time.time()
                logger.info(f"Task {task_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Task {task_id} failed: {str(e)}")
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.completed_at = time.time()
        
        finally:
            # Move completed task to history
            if task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.STOPPED]:
                self.task_history.append(task)
                del self.running_tasks[task_id]

    async def _planning_phase(self, task: AgentTask):
        """Generate a plan for the task"""
        step = TaskStep(
            id=str(uuid.uuid4()),
            type=StepType.PLAN,
            description="Generate execution plan",
            input_data={"task_description": task.description}
        )
        task.steps.append(step)
        
        try:
            # Ensure model is available
            await self._ensure_model_available(task.model)
            
            # Get available tools
            available_tools = self.mcp_orchestrator.get_all_tools()
            tool_descriptions = [
                f"- {tool.name}: {tool.description}"
                for tool in available_tools
            ]
            
            planning_prompt = f"""
You are an autonomous AI agent tasked with creating an execution plan.

Task: {task.title}
Description: {task.description}

Available MCP Tools:
{chr(10).join(tool_descriptions)}

Create a detailed step-by-step plan to accomplish this task. Consider:
1. What information you need to gather
2. What tools you should use and in what order
3. How to verify the results
4. What the final deliverable should be

Respond with a JSON plan in this format:
{{
    "plan": [
        {{
            "step": 1,
            "action": "tool_name or analysis",
            "description": "What this step accomplishes",
            "expected_output": "What you expect to get from this step"
        }}
    ],
    "success_criteria": "How to determine if the task is successful",
    "estimated_duration": "Estimated time in minutes"
}}
"""
            
            # Generate plan using Harmony
            harmony_response = await self.harmony_client.generate_response(
                messages=[{
                    "role": "user",
                    "content": [{"type": "text", "text": planning_prompt}]
                }],
                model_settings={"model": task.model, "fallback_model": "gpt-oss-20b"}
            )
            
            if harmony_response.get("error"):
                raise Exception(f"Planning failed: {harmony_response['error']}")
            
            # Extract plan from response
            plan_text = harmony_response["messages"][-1]["content"][0]["text"]
            
            # Try to parse JSON plan
            try:
                plan_data = json.loads(plan_text)
                step.output_data = plan_data
                step.status = "completed"
                task.metadata["plan"] = plan_data
                logger.info(f"Generated plan for task {task.id} with {len(plan_data.get('plan', []))} steps")
            except json.JSONDecodeError:
                # If not valid JSON, store as text plan
                step.output_data = {"plan_text": plan_text}
                step.status = "completed"
                task.metadata["plan_text"] = plan_text
                logger.warning(f"Plan for task {task.id} is not valid JSON, stored as text")
            
        except Exception as e:
            step.status = "failed"
            step.error = str(e)
            raise e
        finally:
            step.duration = time.time() - step.timestamp

    async def _execution_phase(self, task: AgentTask):
        """Execute the planned steps"""
        plan = task.metadata.get("plan", {})
        plan_steps = plan.get("plan", [])
        
        if not plan_steps:
            # If no structured plan, try to execute based on description
            await self._execute_freeform_task(task)
            return
        
        for i, plan_step in enumerate(plan_steps):
            if task.status != TaskStatus.EXECUTING:
                break  # Task was stopped
            
            if len(task.steps) >= self.max_steps_per_task:
                logger.warning(f"Task {task.id} reached maximum steps limit")
                break
            
            step = TaskStep(
                id=str(uuid.uuid4()),
                type=StepType.TOOL_CALL,
                description=plan_step.get("description", f"Execute step {i+1}"),
                input_data=plan_step
            )
            task.steps.append(step)
            
            try:
                action = plan_step.get("action", "")
                
                if action in [tool.name for tool in self.mcp_orchestrator.get_all_tools()]:
                    # Execute MCP tool
                    result = await self._execute_mcp_tool(action, plan_step, task)
                    step.output_data = result
                else:
                    # Execute analysis or reasoning step
                    result = await self._execute_analysis_step(plan_step, task)
                    step.output_data = result
                
                step.status = "completed"
                logger.info(f"Completed step {i+1} for task {task.id}")
                
            except Exception as e:
                step.status = "failed"
                step.error = str(e)
                logger.error(f"Step {i+1} failed for task {task.id}: {str(e)}")
                # Continue with next step unless it's a critical failure
                
            finally:
                step.duration = time.time() - step.timestamp

    async def _verification_phase(self, task: AgentTask):
        """Verify the task results and generate final output"""
        step = TaskStep(
            id=str(uuid.uuid4()),
            type=StepType.VERIFICATION,
            description="Verify results and generate final output",
            input_data={"task_steps": [asdict(s) for s in task.steps]}
        )
        task.steps.append(step)
        
        try:
            # Collect all step outputs
            step_outputs = []
            for task_step in task.steps:
                if task_step.output_data and task_step.status == "completed":
                    step_outputs.append({
                        "step": task_step.description,
                        "output": task_step.output_data
                    })
            
            verification_prompt = f"""
You are verifying the completion of an autonomous task.

Original Task: {task.title}
Description: {task.description}

Execution Steps and Outputs:
{json.dumps(step_outputs, indent=2)}

Please analyze the results and provide:
1. A summary of what was accomplished
2. Whether the task was completed successfully
3. Any key findings or results
4. Recommendations for follow-up actions (if any)

Respond in JSON format:
{{
    "success": true/false,
    "summary": "Brief summary of accomplishments",
    "key_findings": ["finding 1", "finding 2"],
    "final_result": "The main deliverable or outcome",
    "recommendations": ["recommendation 1", "recommendation 2"],
    "confidence": 0.0-1.0
}}
"""
            
            # Generate verification using Harmony
            harmony_response = await self.harmony_client.generate_response(
                messages=[{
                    "role": "user",
                    "content": [{"type": "text", "text": verification_prompt}]
                }],
                model_settings={"model": task.model, "fallback_model": "gpt-oss-20b"}
            )
            
            if harmony_response.get("error"):
                raise Exception(f"Verification failed: {harmony_response['error']}")
            
            verification_text = harmony_response["messages"][-1]["content"][0]["text"]
            
            try:
                verification_data = json.loads(verification_text)
                step.output_data = verification_data
                task.result = verification_data
                step.status = "completed"
                logger.info(f"Verification completed for task {task.id}")
            except json.JSONDecodeError:
                step.output_data = {"verification_text": verification_text}
                task.result = {"summary": verification_text}
                step.status = "completed"
                logger.warning(f"Verification for task {task.id} is not valid JSON")
            
        except Exception as e:
            step.status = "failed"
            step.error = str(e)
            task.result = {"error": str(e), "summary": "Verification failed"}
            raise e
        finally:
            step.duration = time.time() - step.timestamp

    async def _execute_freeform_task(self, task: AgentTask):
        """Execute a task without a structured plan"""
        step = TaskStep(
            id=str(uuid.uuid4()),
            type=StepType.TOOL_CALL,
            description="Execute freeform task",
            input_data={"task_description": task.description}
        )
        task.steps.append(step)
        
        try:
            # Use Harmony to determine what to do
            execution_prompt = f"""
You are an autonomous AI agent executing a task.

Task: {task.title}
Description: {task.description}

Based on this task, provide a detailed response that accomplishes the objective.
If you need to use external tools or gather information, describe what you would do.
Provide a comprehensive response that addresses the task requirements.
"""
            
            harmony_response = await self.harmony_client.generate_response(
                messages=[{
                    "role": "user",
                    "content": [{"type": "text", "text": execution_prompt}]
                }],
                model_settings={"model": task.model, "fallback_model": "gpt-oss-20b"}
            )
            
            if harmony_response.get("error"):
                raise Exception(f"Execution failed: {harmony_response['error']}")
            
            response_text = harmony_response["messages"][-1]["content"][0]["text"]
            step.output_data = {"response": response_text}
            step.status = "completed"
            
        except Exception as e:
            step.status = "failed"
            step.error = str(e)
            raise e
        finally:
            step.duration = time.time() - step.timestamp

    async def _execute_mcp_tool(self, tool_name: str, plan_step: Dict[str, Any], task: AgentTask) -> Dict[str, Any]:
        """Execute an MCP tool"""
        tool_call = MCPToolCall(
            name=tool_name,
            arguments=plan_step.get("parameters", {}),
            id=str(uuid.uuid4())
        )
        
        result = await self.mcp_orchestrator.execute_tool(tool_call)
        return asdict(result)

    async def _execute_analysis_step(self, plan_step: Dict[str, Any], task: AgentTask) -> Dict[str, Any]:
        """Execute an analysis or reasoning step"""
        analysis_prompt = f"""
You are executing a step in an autonomous task.

Current Step: {plan_step.get('description', 'Analysis step')}
Expected Output: {plan_step.get('expected_output', 'Analysis result')}

Context from original task:
- Title: {task.title}
- Description: {task.description}

Please provide a detailed analysis or response for this step.
"""
        
        harmony_response = await self.harmony_client.generate_response(
            messages=[{
                "role": "user",
                "content": [{"type": "text", "text": analysis_prompt}]
            }],
            model_settings={"model": task.model, "fallback_model": "gpt-oss-20b"}
        )
        
        if harmony_response.get("error"):
            raise Exception(f"Analysis step failed: {harmony_response['error']}")
        
        response_text = harmony_response["messages"][-1]["content"][0]["text"]
        return {"analysis": response_text}

    async def _ensure_model_available(self, model: str):
        """Ensure the specified model is available and running"""
        model_type = "120b" if "120b" in model else "20b"
        
        # Check if model is running
        status = await self.endpoint_manager.get_endpoint_status(model_type)
        
        if status.get("status") != "running":
            logger.info(f"Waking up {model_type} model for task execution")
            await self.endpoint_manager.wake_endpoint(model_type)
            
            # Wait for model to be ready (with timeout)
            for _ in range(30):  # 30 seconds timeout
                await asyncio.sleep(1)
                status = await self.endpoint_manager.get_endpoint_status(model_type)
                if status.get("status") == "running":
                    break
            else:
                raise Exception(f"Model {model_type} failed to start within timeout")

    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        active_tasks = [t for t in self.running_tasks.values() 
                       if t.status in [TaskStatus.PLANNING, TaskStatus.EXECUTING, TaskStatus.VERIFYING]]
        
        completed_tasks = [t for t in self.task_history if t.status == TaskStatus.COMPLETED]
        failed_tasks = [t for t in self.task_history if t.status == TaskStatus.FAILED]
        
        return {
            "active_tasks": len(active_tasks),
            "completed_tasks": len(completed_tasks),
            "failed_tasks": len(failed_tasks),
            "total_tasks": len(self.running_tasks) + len(self.task_history),
            "max_concurrent_tasks": self.max_concurrent_tasks,
            "running_task_ids": [t.id for t in active_tasks]
        }

