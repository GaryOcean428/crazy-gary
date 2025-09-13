"""
Agent Observability System
Real-time monitoring and logging of agent activities, decisions, and tool executions
"""
import asyncio
import time
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, UTC
from enum import Enum
from typing import Dict, List, Any, Optional, Callable
import json
import logging

logger = logging.getLogger(__name__)

class AgentEventType(Enum):
    """Types of agent events for observability"""
    TASK_START = "task_start"
    TASK_COMPLETE = "task_complete"
    TASK_FAILED = "task_failed"
    STEP_START = "step_start"
    STEP_COMPLETE = "step_complete"
    STEP_FAILED = "step_failed"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    PLANNING = "planning"
    REASONING = "reasoning"
    DECISION = "decision"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    MONOLOGUE = "monologue"

class AgentState(Enum):
    """Current state of the agent"""
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    THINKING = "thinking"
    TOOL_USING = "tool_using"
    VERIFYING = "verifying"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

@dataclass
class AgentEvent:
    """Individual agent event for logging and monitoring"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = field(default_factory=time.time)
    event_type: AgentEventType = AgentEventType.INFO
    agent_id: str = ""
    task_id: Optional[str] = None
    step_id: Optional[str] = None
    message: str = ""
    data: Dict[str, Any] = field(default_factory=dict)
    duration_ms: Optional[float] = None
    success: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary for serialization"""
        return {
            'id': self.id,
            'timestamp': self.timestamp,
            'datetime': datetime.fromtimestamp(self.timestamp, UTC).isoformat(),
            'event_type': self.event_type.value,
            'agent_id': self.agent_id,
            'task_id': self.task_id,
            'step_id': self.step_id,
            'message': self.message,
            'data': self.data,
            'duration_ms': self.duration_ms,
            'success': self.success
        }

@dataclass
class AgentTrace:
    """Trace of an agent's execution path"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str = ""
    task_id: str = ""
    start_time: float = field(default_factory=time.time)
    end_time: Optional[float] = None
    events: List[AgentEvent] = field(default_factory=list)
    current_state: AgentState = AgentState.IDLE
    success: bool = True
    
    @property
    def duration_ms(self) -> Optional[float]:
        """Calculate total duration in milliseconds"""
        if self.end_time:
            return (self.end_time - self.start_time) * 1000
        return None
    
    def add_event(self, event: AgentEvent):
        """Add an event to this trace"""
        event.agent_id = self.agent_id
        event.task_id = self.task_id
        self.events.append(event)
        
        # Update current state based on event type
        state_mapping = {
            AgentEventType.PLANNING: AgentState.PLANNING,
            AgentEventType.STEP_START: AgentState.EXECUTING,
            AgentEventType.TOOL_CALL: AgentState.TOOL_USING,
            AgentEventType.REASONING: AgentState.THINKING,
            AgentEventType.TASK_COMPLETE: AgentState.COMPLETED,
            AgentEventType.TASK_FAILED: AgentState.FAILED,
        }
        
        if event.event_type in state_mapping:
            self.current_state = state_mapping[event.event_type]
    
    def complete(self, success: bool = True):
        """Mark trace as completed"""
        self.end_time = time.time()
        self.success = success
        self.current_state = AgentState.COMPLETED if success else AgentState.FAILED
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert trace to dictionary for serialization"""
        return {
            'id': self.id,
            'agent_id': self.agent_id,
            'task_id': self.task_id,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'duration_ms': self.duration_ms,
            'current_state': self.current_state.value,
            'success': self.success,
            'events': [event.to_dict() for event in self.events],
            'event_count': len(self.events)
        }

class AgentObserver:
    """Central observability system for monitoring agent activities"""
    
    def __init__(self):
        self.active_traces: Dict[str, AgentTrace] = {}
        self.completed_traces: List[AgentTrace] = []
        self.event_listeners: List[Callable[[AgentEvent], None]] = []
        self.trace_listeners: List[Callable[[AgentTrace], None]] = []
        self.max_completed_traces = 1000  # Keep last 1000 completed traces
        
    async def start_trace(self, agent_id: str, task_id: str) -> str:
        """Start a new trace for an agent task"""
        trace = AgentTrace(agent_id=agent_id, task_id=task_id)
        self.active_traces[trace.id] = trace
        
        # Log trace start event
        await self.log_event(
            AgentEvent(
                event_type=AgentEventType.TASK_START,
                agent_id=agent_id,
                task_id=task_id,
                message=f"Started tracing task {task_id[:8]} for agent {agent_id}"
            )
        )
        
        # Notify listeners
        for listener in self.trace_listeners:
            try:
                listener(trace)
            except Exception as e:
                logger.error(f"Error in trace listener: {e}")
        
        return trace.id
    
    async def end_trace(self, trace_id: str, success: bool = True):
        """End an active trace"""
        if trace_id not in self.active_traces:
            logger.warning(f"Attempted to end non-existent trace: {trace_id}")
            return
        
        trace = self.active_traces.pop(trace_id)
        trace.complete(success)
        
        # Log trace end event
        await self.log_event(
            AgentEvent(
                event_type=AgentEventType.TASK_COMPLETE if success else AgentEventType.TASK_FAILED,
                agent_id=trace.agent_id,
                task_id=trace.task_id,
                message=f"{'Completed' if success else 'Failed'} task {trace.task_id[:8]} in {trace.duration_ms:.1f}ms",
                data={'duration_ms': trace.duration_ms, 'event_count': len(trace.events)}
            )
        )
        
        # Move to completed traces
        self.completed_traces.append(trace)
        
        # Trim completed traces if needed
        if len(self.completed_traces) > self.max_completed_traces:
            self.completed_traces = self.completed_traces[-self.max_completed_traces:]
        
        # Notify listeners
        for listener in self.trace_listeners:
            try:
                listener(trace)
            except Exception as e:
                logger.error(f"Error in trace listener: {e}")
    
    async def log_event(self, event: AgentEvent):
        """Log an agent event"""
        # Add to active trace if applicable
        for trace in self.active_traces.values():
            if (trace.agent_id == event.agent_id and 
                (not event.task_id or trace.task_id == event.task_id)):
                trace.add_event(event)
                break
        
        # Notify event listeners
        for listener in self.event_listeners:
            try:
                listener(event)
            except Exception as e:
                logger.error(f"Error in event listener: {e}")
        
        logger.info(f"Agent Event: {event.event_type.value} - {event.message}")
    
    def add_event_listener(self, listener: Callable[[AgentEvent], None]):
        """Add an event listener for real-time monitoring"""
        self.event_listeners.append(listener)
    
    def add_trace_listener(self, listener: Callable[[AgentTrace], None]):
        """Add a trace listener for monitoring trace lifecycle"""
        self.trace_listeners.append(listener)
    
    def get_active_traces(self) -> List[Dict[str, Any]]:
        """Get all currently active traces"""
        return [trace.to_dict() for trace in self.active_traces.values()]
    
    def get_completed_traces(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recently completed traces"""
        return [trace.to_dict() for trace in self.completed_traces[-limit:]]
    
    def get_trace_by_id(self, trace_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific trace by ID"""
        # Check active traces first
        if trace_id in self.active_traces:
            return self.active_traces[trace_id].to_dict()
        
        # Check completed traces
        for trace in self.completed_traces:
            if trace.id == trace_id:
                return trace.to_dict()
        
        return None
    
    def get_agent_events(self, agent_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent events for a specific agent"""
        events = []
        
        # Collect from active traces
        for trace in self.active_traces.values():
            if trace.agent_id == agent_id:
                events.extend(trace.events)
        
        # Collect from completed traces
        for trace in self.completed_traces:
            if trace.agent_id == agent_id:
                events.extend(trace.events)
        
        # Sort by timestamp and limit
        events.sort(key=lambda e: e.timestamp, reverse=True)
        return [event.to_dict() for event in events[:limit]]
    
    def get_task_events(self, task_id: str) -> List[Dict[str, Any]]:
        """Get all events for a specific task"""
        events = []
        
        # Collect from active traces
        for trace in self.active_traces.values():
            if trace.task_id == task_id:
                events.extend(trace.events)
        
        # Collect from completed traces
        for trace in self.completed_traces:
            if trace.task_id == task_id:
                events.extend(trace.events)
        
        # Sort by timestamp
        events.sort(key=lambda e: e.timestamp)
        return [event.to_dict() for event in events]
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get observability metrics"""
        active_count = len(self.active_traces)
        completed_count = len(self.completed_traces)
        
        # Calculate success rate
        success_count = sum(1 for trace in self.completed_traces if trace.success)
        success_rate = (success_count / completed_count) if completed_count > 0 else 0
        
        # Calculate average duration
        durations = [trace.duration_ms for trace in self.completed_traces if trace.duration_ms]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        # Event type distribution
        event_types = {}
        for trace in list(self.active_traces.values()) + self.completed_traces:
            for event in trace.events:
                event_type = event.event_type.value
                event_types[event_type] = event_types.get(event_type, 0) + 1
        
        return {
            'active_traces': active_count,
            'completed_traces': completed_count,
            'success_rate': success_rate,
            'average_duration_ms': avg_duration,
            'event_type_distribution': event_types,
            'total_events': sum(len(trace.events) for trace in list(self.active_traces.values()) + self.completed_traces)
        }

# Global observer instance
_observer = None

def get_agent_observer() -> AgentObserver:
    """Get the global agent observer instance"""
    global _observer
    if _observer is None:
        _observer = AgentObserver()
    return _observer

# Convenience functions for easier usage
async def start_agent_trace(agent_id: str, task_id: str) -> str:
    """Start tracing an agent task"""
    return await get_agent_observer().start_trace(agent_id, task_id)

async def end_agent_trace(trace_id: str, success: bool = True):
    """End an agent trace"""
    await get_agent_observer().end_trace(trace_id, success)

async def log_agent_event(event_type: AgentEventType, message: str, 
                         agent_id: str = "", task_id: str = "", 
                         step_id: str = "", data: Dict[str, Any] = None,
                         duration_ms: float = None, success: bool = True):
    """Log an agent event"""
    event = AgentEvent(
        event_type=event_type,
        agent_id=agent_id,
        task_id=task_id,
        step_id=step_id,
        message=message,
        data=data or {},
        duration_ms=duration_ms,
        success=success
    )
    await get_agent_observer().log_event(event)

async def log_agent_monologue(agent_id: str, task_id: str, thoughts: str, reasoning: str = ""):
    """Log agent's internal monologue"""
    await log_agent_event(
        event_type=AgentEventType.MONOLOGUE,
        message=thoughts,
        agent_id=agent_id,
        task_id=task_id,
        data={'reasoning': reasoning, 'type': 'monologue'}
    )

async def log_agent_planning(agent_id: str, task_id: str, plan: str, steps: List[str] = None):
    """Log agent planning phase"""
    await log_agent_event(
        event_type=AgentEventType.PLANNING,
        message=f"Planning: {plan}",
        agent_id=agent_id,
        task_id=task_id,
        data={'plan': plan, 'steps': steps or [], 'type': 'planning'}
    )

async def log_tool_execution(agent_id: str, task_id: str, tool_name: str, 
                           tool_args: Dict[str, Any], result: Any = None, 
                           duration_ms: float = None, success: bool = True):
    """Log tool execution"""
    event_type = AgentEventType.TOOL_RESULT if result is not None else AgentEventType.TOOL_CALL
    message = f"{'Executed' if result is not None else 'Calling'} tool: {tool_name}"
    
    await log_agent_event(
        event_type=event_type,
        message=message,
        agent_id=agent_id,
        task_id=task_id,
        data={
            'tool_name': tool_name,
            'tool_args': tool_args,
            'result': str(result) if result is not None else None,
            'type': 'tool_execution'
        },
        duration_ms=duration_ms,
        success=success
    )