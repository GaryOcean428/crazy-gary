"""
Agent API Routes
Endpoints for managing agentic tasks and the agent loop
"""
from flask import Blueprint, request, jsonify
import asyncio
import logging
from src.models.agent_loop import AgentLoop

logger = logging.getLogger(__name__)

agent_bp = Blueprint('agent', __name__)

# Global agent loop instance
agent_loop = None

async def get_agent_loop():
    """Get or create the global agent loop instance"""
    global agent_loop
    if agent_loop is None:
        agent_loop = AgentLoop()
        await agent_loop.__aenter__()
    return agent_loop

@agent_bp.route('/tasks', methods=['POST'])
def create_task():
    """Create a new agentic task"""
    try:
        data = request.get_json()
        
        if not data or 'title' not in data or 'description' not in data:
            return jsonify({'error': 'Title and description are required'}), 400
        
        title = data['title']
        description = data['description']
        model = data.get('model', 'gpt-oss-120b')
        priority = data.get('priority', 'medium')
        
        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def _create():
            agent = await get_agent_loop()
            task_id = await agent.create_task(title, description, model, priority)
            return task_id
        
        task_id = loop.run_until_complete(_create())
        loop.close()
        
        return jsonify({
            'task_id': task_id,
            'status': 'created'
        })
        
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/tasks/<task_id>/start', methods=['POST'])
def start_task(task_id):
    """Start executing a task"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def _start():
            agent = await get_agent_loop()
            success = await agent.start_task(task_id)
            return success
        
        success = loop.run_until_complete(_start())
        loop.close()
        
        if success:
            return jsonify({'status': 'started'})
        else:
            return jsonify({'error': 'Failed to start task'}), 400
            
    except Exception as e:
        logger.error(f"Error starting task {task_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/tasks/<task_id>/stop', methods=['POST'])
def stop_task(task_id):
    """Stop a running task"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def _stop():
            agent = await get_agent_loop()
            success = await agent.stop_task(task_id)
            return success
        
        success = loop.run_until_complete(_stop())
        loop.close()
        
        if success:
            return jsonify({'status': 'stopped'})
        else:
            return jsonify({'error': 'Failed to stop task'}), 400
            
    except Exception as e:
        logger.error(f"Error stopping task {task_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/tasks/<task_id>', methods=['GET'])
def get_task_status(task_id):
    """Get the status of a specific task"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def _get_status():
            agent = await get_agent_loop()
            status = await agent.get_task_status(task_id)
            return status
        
        status = loop.run_until_complete(_get_status())
        loop.close()
        
        if status:
            return jsonify(status)
        else:
            return jsonify({'error': 'Task not found'}), 404
            
    except Exception as e:
        logger.error(f"Error getting task status {task_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/tasks', methods=['GET'])
def list_tasks():
    """List all tasks with optional status filter"""
    try:
        status_filter = request.args.get('status')
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def _list():
            agent = await get_agent_loop()
            tasks = await agent.list_tasks(status_filter)
            return tasks
        
        tasks = loop.run_until_complete(_list())
        loop.close()
        
        return jsonify({'tasks': tasks})
        
    except Exception as e:
        logger.error(f"Error listing tasks: {str(e)}")
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/chat', methods=['POST'])
def chat_with_agent():
    """Chat interface for creating and managing tasks"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        
        # Simple task creation from chat message
        # In a more sophisticated system, this would parse the intent
        task_title = f"Chat Task: {message[:50]}..."
        task_description = f"User request: {message}"
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def _chat():
            agent = await get_agent_loop()
            task_id = await agent.create_task(task_title, task_description)
            await agent.start_task(task_id)
            return task_id
        
        task_id = loop.run_until_complete(_chat())
        loop.close()
        
        return jsonify({
            'task_id': task_id,
            'response': f"I've created and started a task to handle your request. Task ID: {task_id}",
            'status': 'task_created'
        })
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/stats', methods=['GET'])
def get_system_stats():
    """Get system statistics"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def _stats():
            agent = await get_agent_loop()
            stats = agent.get_system_stats()
            return stats
        
        stats = loop.run_until_complete(_stats())
        loop.close()
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

@agent_bp.route('/health', methods=['GET'])
def agent_health():
    """Health check for the agent system"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        async def _health():
            agent = await get_agent_loop()
            return {
                'status': 'healthy',
                'agent_loop': 'running',
                'harmony_client': 'connected' if agent.harmony_client else 'disconnected',
                'mcp_orchestrator': 'connected' if agent.mcp_orchestrator else 'disconnected'
            }
        
        health = loop.run_until_complete(_health())
        loop.close()
        
        return jsonify(health)
        
    except Exception as e:
        logger.error(f"Error checking agent health: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

