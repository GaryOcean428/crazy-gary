"""
Heavy Orchestration API Routes
Multi-agent system endpoints for advanced task processing
"""
import asyncio
import time
from flask import Blueprint, request, jsonify
from src.models.auth import require_auth, get_current_user
from src.models.heavy_orchestrator import heavy_orchestrator, AgentStatus
from src.models.heavy_tools import get_heavy_tool_manager
from src.models.safety_limits import safety_manager, LimitType
from src.models.observability import observability_manager
import logging

logger = logging.getLogger(__name__)

heavy_bp = Blueprint('heavy', __name__)

@heavy_bp.route('/orchestrate', methods=['POST'])
@require_auth
def orchestrate_task():
    """Execute a task using the heavy multi-agent orchestrator"""
    from src.utils.async_helpers import run_async_in_flask
    
    async def _orchestrate_async():
        try:
            user = get_current_user()
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            data = request.get_json()
            if not data or 'query' not in data:
                return jsonify({'error': 'Query is required'}), 400
            
            query = data['query']
            num_agents = data.get('num_agents', 4)
            
            # Check rate limits
            allowed, message = safety_manager.check_rate_limit(user.id, LimitType.REQUESTS_PER_MINUTE)
            if not allowed:
                return jsonify({'error': message}), 429
            
            # Check content safety
            is_safe, safety_message = safety_manager.check_content_safety(query)
            if not is_safe:
                return jsonify({'error': safety_message}), 400
            
            # Check concurrent task limits
            allowed, message = safety_manager.increment_concurrent_tasks(user.id)
            if not allowed:
                return jsonify({'error': message}), 429
            
            try:
                # Set number of agents for this orchestration
                heavy_orchestrator.num_agents = min(num_agents, 8)  # Max 8 agents
                
                # Execute orchestration
                result = await heavy_orchestrator.orchestrate(query)
                
                # Track usage
                total_tokens = len(query) + len(result.final_response)  # Rough estimate
                estimated_cost = safety_manager.estimate_cost("20b", len(query), len(result.final_response))
                safety_manager.track_request(user.id, "heavy_orchestrate", total_tokens, estimated_cost)
                
                # Prepare response
                response_data = {
                    'success': result.success,
                    'response': result.final_response,
                    'execution_time': result.total_execution_time,
                    'synthesis_time': result.synthesis_time,
                    'agents': [
                        {
                            'agent_id': task.agent_id,
                            'question': task.question,
                            'status': task.status.value,
                            'result': task.result,
                            'error': task.error,
                            'execution_time': task.execution_time
                        }
                        for task in result.agent_tasks
                    ],
                    'metadata': {
                        'num_agents': len(result.agent_tasks),
                        'successful_agents': len([t for t in result.agent_tasks if t.status == AgentStatus.COMPLETED]),
                        'estimated_cost': estimated_cost,
                        'total_tokens': total_tokens
                    }
                }
                
                if result.error:
                    response_data['error'] = result.error
                
                return jsonify(response_data), 200 if result.success else 500
                
            finally:
                # Always decrement concurrent tasks
                safety_manager.decrement_concurrent_tasks(user.id)
            
        except Exception as e:
            logger.error(f"Heavy orchestration error: {str(e)}")
            observability_manager.log_error(
                "heavy_orchestration_error",
                str(e),
                stack_trace=str(e),
                user_id=user.id if user else None
            )
            return jsonify({'error': 'Internal server error'}), 500
    
    # Run the async function
    return run_async_in_flask(_orchestrate_async)

@heavy_bp.route('/progress', methods=['GET'])
@require_auth
def get_orchestration_progress():
    """Get real-time progress of orchestration"""
    try:
        progress = heavy_orchestrator.get_progress_status()
        return jsonify(progress), 200
        
    except Exception as e:
        logger.error(f"Error getting orchestration progress: {str(e)}")
        return jsonify({'error': 'Failed to get progress'}), 500

@heavy_bp.route('/tools', methods=['GET'])
@require_auth
def get_heavy_tools():
    """Get available heavy tools"""
    try:
        tool_manager = get_heavy_tool_manager()
        tools = tool_manager.get_available_tools()
        return jsonify(tools), 200
        
    except Exception as e:
        logger.error(f"Error getting heavy tools: {str(e)}")
        return jsonify({'error': 'Failed to get tools'}), 500

@heavy_bp.route('/tools/search', methods=['GET'])
@require_auth
def search_heavy_tools():
    """Search for heavy tools"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'error': 'Query parameter q is required'}), 400
        
        tool_manager = get_heavy_tool_manager()
        tools = tool_manager.search_tools(query)
        return jsonify(tools), 200
        
    except Exception as e:
        logger.error(f"Error searching heavy tools: {str(e)}")
        return jsonify({'error': 'Failed to search tools'}), 500

@heavy_bp.route('/tools/execute', methods=['POST'])
@require_auth
def execute_heavy_tool():
    """Execute a heavy tool directly"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data or 'tool_name' not in data:
            return jsonify({'error': 'Tool name is required'}), 400
        
        tool_name = data['tool_name']
        parameters = data.get('parameters', {})
        
        # Check rate limits
        allowed, message = safety_manager.check_rate_limit(user.id, LimitType.REQUESTS_PER_MINUTE)
        if not allowed:
            return jsonify({'error': message}), 429
        
        # Execute tool
        tool_manager = get_heavy_tool_manager()
        result = tool_manager.execute_tool(tool_name, **parameters)
        
        # Track usage
        safety_manager.track_request(user.id, f"tool_{tool_name}")
        
        response_data = {
            'success': result.success,
            'result': result.result,
            'execution_time': result.execution_time,
            'tool_name': tool_name,
            'parameters': parameters
        }
        
        if result.error:
            response_data['error'] = result.error
        
        return jsonify(response_data), 200 if result.success else 500
        
    except Exception as e:
        logger.error(f"Heavy tool execution error: {str(e)}")
        return jsonify({'error': 'Tool execution failed'}), 500

@heavy_bp.route('/config', methods=['GET'])
@require_auth
def get_heavy_config():
    """Get heavy orchestrator configuration"""
    try:
        config = {
            'num_agents': heavy_orchestrator.num_agents,
            'task_timeout': heavy_orchestrator.task_timeout,
            'available_models': ['120b', '20b'],
            'max_agents': 8,
            'features': {
                'parallel_execution': True,
                'dynamic_questions': True,
                'intelligent_synthesis': True,
                'tool_integration': True,
                'real_time_progress': True
            }
        }
        return jsonify(config), 200
        
    except Exception as e:
        logger.error(f"Error getting heavy config: {str(e)}")
        return jsonify({'error': 'Failed to get configuration'}), 500

@heavy_bp.route('/config', methods=['POST'])
@require_auth
def update_heavy_config():
    """Update heavy orchestrator configuration"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Configuration data is required'}), 400
        
        # Update configuration
        if 'num_agents' in data:
            num_agents = min(max(data['num_agents'], 1), 8)  # Between 1 and 8
            heavy_orchestrator.num_agents = num_agents
        
        if 'task_timeout' in data:
            timeout = min(max(data['task_timeout'], 30), 600)  # Between 30s and 10min
            heavy_orchestrator.task_timeout = timeout
        
        # Return updated config
        config = {
            'num_agents': heavy_orchestrator.num_agents,
            'task_timeout': heavy_orchestrator.task_timeout,
            'updated': True
        }
        
        return jsonify(config), 200
        
    except Exception as e:
        logger.error(f"Error updating heavy config: {str(e)}")
        return jsonify({'error': 'Failed to update configuration'}), 500

@heavy_bp.route('/status', methods=['GET'])
@require_auth
def get_heavy_status():
    """Get heavy orchestrator system status"""
    try:
        tool_manager = get_heavy_tool_manager()
        
        status = {
            'orchestrator': {
                'active': True,
                'num_agents': heavy_orchestrator.num_agents,
                'task_timeout': heavy_orchestrator.task_timeout
            },
            'tools': {
                'total_tools': len(tool_manager.tools),
                'available_tools': list(tool_manager.tools.keys())
            },
            'progress': heavy_orchestrator.get_progress_status(),
            'timestamp': time.time()
        }
        
        return jsonify(status), 200
        
    except Exception as e:
        logger.error(f"Error getting heavy status: {str(e)}")
        return jsonify({'error': 'Failed to get status'}), 500

