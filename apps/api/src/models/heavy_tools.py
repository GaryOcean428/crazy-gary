"""
Heavy Tools Integration
Integrates make-it-heavy tool system with Crazy-Gary's MCP tools
"""
import json
import time
import inspect
import importlib
import importlib.util
import os
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass
import logging

from src.models.mcp_orchestrator import MCPOrchestrator
from src.models.observability import observability_manager

logger = logging.getLogger(__name__)

class BaseTool(ABC):
    """Base class for all heavy tools"""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Tool name"""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """Tool description"""
        pass
    
    @property
    @abstractmethod
    def parameters(self) -> dict:
        """Tool parameters schema"""
        pass
    
    @abstractmethod
    def execute(self, **kwargs) -> dict:
        """Execute the tool"""
        pass
    
    def to_openrouter_schema(self) -> dict:
        """Convert tool to OpenRouter function calling schema"""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters
            }
        }

@dataclass
class ToolResult:
    success: bool
    result: Any
    error: Optional[str] = None
    execution_time: Optional[float] = None

class WebSearchTool(BaseTool):
    """Web search tool using MCP integration"""
    
    def __init__(self, mcp_orchestrator: MCPOrchestrator):
        self.mcp_orchestrator = mcp_orchestrator
    
    @property
    def name(self) -> str:
        return "search_web"
    
    @property
    def description(self) -> str:
        return "Search the web for information using various search engines"
    
    @property
    def parameters(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query"
                },
                "max_results": {
                    "type": "integer",
                    "description": "Maximum number of results to return",
                    "default": 5
                }
            },
            "required": ["query"]
        }
    
    def execute(self, query: str, max_results: int = 5) -> dict:
        """Execute web search"""
        try:
            # Use MCP orchestrator for web search
            # This would integrate with available MCP tools
            result = {
                "results": [
                    {
                        "title": f"Search result for: {query}",
                        "url": "https://example.com",
                        "snippet": f"Information about {query}"
                    }
                ],
                "query": query,
                "total_results": 1
            }
            return {"success": True, "data": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

class CalculatorTool(BaseTool):
    """Safe mathematical calculator tool"""
    
    @property
    def name(self) -> str:
        return "calculate"
    
    @property
    def description(self) -> str:
        return "Perform safe mathematical calculations"
    
    @property
    def parameters(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Mathematical expression to evaluate"
                }
            },
            "required": ["expression"]
        }
    
    def execute(self, expression: str) -> dict:
        """Execute calculation safely"""
        try:
            # Safe evaluation - only allow basic math operations
            allowed_names = {
                k: v for k, v in __builtins__.items()
                if k in ('abs', 'round', 'min', 'max', 'sum', 'pow')
            }
            allowed_names.update({
                'pi': 3.141592653589793,
                'e': 2.718281828459045
            })
            
            # Evaluate expression safely
            result = eval(expression, {"__builtins__": {}}, allowed_names)
            return {"success": True, "result": result, "expression": expression}
            
        except Exception as e:
            return {"success": False, "error": f"Calculation error: {str(e)}"}

class FileReadTool(BaseTool):
    """File reading tool with safety checks"""
    
    @property
    def name(self) -> str:
        return "read_file"
    
    @property
    def description(self) -> str:
        return "Read contents of a text file"
    
    @property
    def parameters(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Path to the file to read"
                },
                "head": {
                    "type": "integer",
                    "description": "Number of lines from the beginning",
                    "default": None
                },
                "tail": {
                    "type": "integer",
                    "description": "Number of lines from the end",
                    "default": None
                }
            },
            "required": ["path"]
        }
    
    def execute(self, path: str, head: Optional[int] = None, tail: Optional[int] = None) -> dict:
        """Read file contents safely"""
        try:
            # Security check - only allow reading from safe directories
            safe_dirs = ['/tmp', '/home/ubuntu/crazy-gary', '/home/ubuntu/make-it-heavy']
            if not any(path.startswith(safe_dir) for safe_dir in safe_dirs):
                return {"success": False, "error": "Access denied: unsafe file path"}
            
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Apply head/tail filters
            if head is not None:
                lines = lines[:head]
            elif tail is not None:
                lines = lines[-tail:]
            
            content = ''.join(lines)
            return {
                "success": True,
                "content": content,
                "path": path,
                "lines_read": len(lines)
            }
            
        except Exception as e:
            return {"success": False, "error": f"File read error: {str(e)}"}

class FileWriteTool(BaseTool):
    """File writing tool with safety checks"""
    
    @property
    def name(self) -> str:
        return "write_file"
    
    @property
    def description(self) -> str:
        return "Write content to a text file"
    
    @property
    def parameters(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Path to the file to write"
                },
                "content": {
                    "type": "string",
                    "description": "Content to write to the file"
                }
            },
            "required": ["path", "content"]
        }
    
    def execute(self, path: str, content: str) -> dict:
        """Write file contents safely"""
        try:
            # Security check - only allow writing to safe directories
            safe_dirs = ['/tmp', '/home/ubuntu/crazy-gary/output']
            if not any(path.startswith(safe_dir) for safe_dir in safe_dirs):
                return {"success": False, "error": "Access denied: unsafe file path"}
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(path), exist_ok=True)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return {
                "success": True,
                "path": path,
                "bytes_written": len(content.encode('utf-8'))
            }
            
        except Exception as e:
            return {"success": False, "error": f"File write error: {str(e)}"}

class TaskCompleteTool(BaseTool):
    """Task completion signaling tool"""
    
    @property
    def name(self) -> str:
        return "mark_task_complete"
    
    @property
    def description(self) -> str:
        return "Mark the current task as complete with a summary"
    
    @property
    def parameters(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "task_summary": {
                    "type": "string",
                    "description": "Summary of what was accomplished"
                },
                "completion_message": {
                    "type": "string",
                    "description": "Final message for the user"
                }
            },
            "required": ["task_summary", "completion_message"]
        }
    
    def execute(self, task_summary: str, completion_message: str) -> dict:
        """Mark task as complete"""
        return {
            "success": True,
            "task_complete": True,
            "summary": task_summary,
            "message": completion_message
        }

class MCPToolBridge(BaseTool):
    """Bridge to MCP tools"""
    
    def __init__(self, mcp_orchestrator: MCPOrchestrator):
        self.mcp_orchestrator = mcp_orchestrator
    
    @property
    def name(self) -> str:
        return "use_mcp_tool"
    
    @property
    def description(self) -> str:
        return "Execute an MCP tool (Browserbase, Disco, Supabase, etc.)"
    
    @property
    def parameters(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "tool_name": {
                    "type": "string",
                    "description": "Name of the MCP tool to execute"
                },
                "parameters": {
                    "type": "object",
                    "description": "Parameters for the MCP tool"
                }
            },
            "required": ["tool_name", "parameters"]
        }
    
    def execute(self, tool_name: str, parameters: dict) -> dict:
        """Execute MCP tool"""
        try:
            # This would integrate with the MCP orchestrator
            result = {
                "tool_name": tool_name,
                "parameters": parameters,
                "result": "MCP tool execution result would go here"
            }
            return {"success": True, "data": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

class HeavyToolManager:
    """Manages all heavy tools and provides discovery capabilities"""
    
    def __init__(self, mcp_orchestrator: MCPOrchestrator):
        self.mcp_orchestrator = mcp_orchestrator
        self.tools: Dict[str, BaseTool] = {}
        self.tool_mapping: Dict[str, Callable] = {}
        
        # Initialize built-in tools
        self._initialize_builtin_tools()
        
        # Discover additional tools
        self._discover_tools()
    
    def _initialize_builtin_tools(self):
        """Initialize built-in heavy tools"""
        builtin_tools = [
            WebSearchTool(self.mcp_orchestrator),
            CalculatorTool(),
            FileReadTool(),
            FileWriteTool(),
            TaskCompleteTool(),
            MCPToolBridge(self.mcp_orchestrator)
        ]
        
        for tool in builtin_tools:
            self.register_tool(tool)
    
    def _discover_tools(self):
        """Discover additional tools from tools directory"""
        tools_dir = "/home/ubuntu/crazy-gary/tools"
        if os.path.exists(tools_dir):
            try:
                for filename in os.listdir(tools_dir):
                    if filename.endswith('.py') and not filename.startswith('__'):
                        self._load_tool_from_file(os.path.join(tools_dir, filename))
            except Exception as e:
                logger.warning(f"Error discovering tools: {str(e)}")
    
    def _load_tool_from_file(self, filepath: str):
        """Load a tool from a Python file"""
        try:
            # Dynamic import of tool file
            spec = importlib.util.spec_from_file_location("custom_tool", filepath)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Find tool classes
            for name, obj in inspect.getmembers(module):
                if (inspect.isclass(obj) and 
                    issubclass(obj, BaseTool) and 
                    obj != BaseTool):
                    tool_instance = obj()
                    self.register_tool(tool_instance)
                    logger.info(f"Loaded custom tool: {tool_instance.name}")
                    
        except Exception as e:
            logger.warning(f"Failed to load tool from {filepath}: {str(e)}")
    
    def register_tool(self, tool: BaseTool):
        """Register a tool"""
        self.tools[tool.name] = tool
        self.tool_mapping[tool.name] = tool.execute
        logger.info(f"Registered tool: {tool.name}")
    
    def get_tool_schemas(self) -> List[dict]:
        """Get OpenRouter schemas for all tools"""
        return [tool.to_openrouter_schema() for tool in self.tools.values()]
    
    def execute_tool(self, tool_name: str, **kwargs) -> ToolResult:
        """Execute a tool by name"""
        start_time = time.time()
        
        try:
            if tool_name not in self.tools:
                return ToolResult(
                    success=False,
                    result=None,
                    error=f"Unknown tool: {tool_name}"
                )
            
            result = self.tool_mapping[tool_name](**kwargs)
            execution_time = time.time() - start_time
            
            # Log tool execution
            observability_manager.log_performance(
                f"tool_execution_{tool_name}",
                execution_time * 1000,
                {"parameters": list(kwargs.keys())}
            )
            
            return ToolResult(
                success=True,
                result=result,
                execution_time=execution_time
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            error_msg = f"Tool execution failed: {str(e)}"
            
            observability_manager.log_error(
                "tool_execution_error",
                error_msg,
                stack_trace=str(e)
            )
            
            return ToolResult(
                success=False,
                result=None,
                error=error_msg,
                execution_time=execution_time
            )
    
    def get_available_tools(self) -> Dict[str, dict]:
        """Get information about all available tools"""
        return {
            name: {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters
            }
            for name, tool in self.tools.items()
        }
    
    def search_tools(self, query: str) -> List[dict]:
        """Search for tools by name or description"""
        query_lower = query.lower()
        matching_tools = []
        
        for tool in self.tools.values():
            if (query_lower in tool.name.lower() or 
                query_lower in tool.description.lower()):
                matching_tools.append({
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters
                })
        
        return matching_tools

# Global tool manager instance
heavy_tool_manager = None

def get_heavy_tool_manager() -> HeavyToolManager:
    """Get or create the global heavy tool manager"""
    global heavy_tool_manager
    if heavy_tool_manager is None:
        from src.models.mcp_orchestrator import mcp_orchestrator
        heavy_tool_manager = HeavyToolManager(mcp_orchestrator)
    return heavy_tool_manager

