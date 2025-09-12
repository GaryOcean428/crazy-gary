"""
MCP API routes for tool discovery and execution
"""
import asyncio
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from src.models.mcp_orchestrator import MCPOrchestrator, MCPToolCall
import logging

logger = logging.getLogger(__name__)

mcp_bp = Blueprint('mcp', __name__, url_prefix='/api/mcp')

@mcp_bp.route('/tools', methods=['GET'])
@cross_origin()
def get_all_tools():
    """Get all available MCP tools"""
    try:
        async def get_tools():
            async with MCPOrchestrator() as orchestrator:
                tools = orchestrator.get_all_tools()
                return [
                    {
                        'name': tool.name,
                        'description': tool.description,
                        'parameters': tool.parameters
                    }
                    for tool in tools
                ]
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            tools = loop.run_until_complete(get_tools())
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'tools': tools,
            'count': len(tools)
        })
    
    except Exception as e:
        logger.error(f"Error getting MCP tools: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@mcp_bp.route('/tools/<client_name>', methods=['GET'])
@cross_origin()
def get_tools_by_client(client_name):
    """Get tools from a specific MCP client"""
    try:
        if client_name not in ['disco', 'browserbase', 'supabase']:
            return jsonify({
                'success': False,
                'error': 'Invalid client name. Must be disco, browserbase, or supabase'
            }), 400
        
        async def get_tools():
            async with MCPOrchestrator() as orchestrator:
                tools = orchestrator.get_tools_by_client(client_name)
                return [
                    {
                        'name': tool.name,
                        'description': tool.description,
                        'parameters': tool.parameters
                    }
                    for tool in tools
                ]
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            tools = loop.run_until_complete(get_tools())
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'client': client_name,
            'tools': tools,
            'count': len(tools)
        })
    
    except Exception as e:
        logger.error(f"Error getting tools for {client_name}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@mcp_bp.route('/tools/search', methods=['GET'])
@cross_origin()
def search_tools():
    """Search for tools by name or description"""
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query parameter "q" is required'
            }), 400
        
        async def search():
            async with MCPOrchestrator() as orchestrator:
                tools = orchestrator.search_tools(query)
                return [
                    {
                        'name': tool.name,
                        'description': tool.description,
                        'parameters': tool.parameters
                    }
                    for tool in tools
                ]
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            tools = loop.run_until_complete(search())
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'query': query,
            'tools': tools,
            'count': len(tools)
        })
    
    except Exception as e:
        logger.error(f"Error searching tools: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@mcp_bp.route('/execute', methods=['POST'])
@cross_origin()
def execute_tool():
    """Execute an MCP tool"""
    try:
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['name', 'arguments', 'id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        tool_call = MCPToolCall(
            name=data['name'],
            arguments=data['arguments'],
            id=data['id']
        )
        
        async def execute():
            async with MCPOrchestrator() as orchestrator:
                return await orchestrator.execute_tool(tool_call)
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(execute())
        finally:
            loop.close()
        
        response = {
            'success': result.error is None,
            'tool_call_id': result.tool_call_id,
            'result': result.result
        }
        
        if result.error:
            response['error'] = result.error
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error executing tool: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@mcp_bp.route('/status', methods=['GET'])
@cross_origin()
def get_client_status():
    """Get the status of all MCP clients"""
    try:
        async def get_status():
            async with MCPOrchestrator() as orchestrator:
                return orchestrator.get_client_status()
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            status = loop.run_until_complete(get_status())
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'clients': status
        })
    
    except Exception as e:
        logger.error(f"Error getting client status: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@mcp_bp.route('/tool/<tool_name>', methods=['GET'])
@cross_origin()
def get_tool_info(tool_name):
    """Get information about a specific tool"""
    try:
        async def get_tool():
            async with MCPOrchestrator() as orchestrator:
                tool = orchestrator.get_tool(tool_name)
                if tool:
                    return {
                        'name': tool.name,
                        'description': tool.description,
                        'parameters': tool.parameters
                    }
                return None
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            tool = loop.run_until_complete(get_tool())
        finally:
            loop.close()
        
        if tool:
            return jsonify({
                'success': True,
                'tool': tool
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Tool "{tool_name}" not found'
            }), 404
    
    except Exception as e:
        logger.error(f"Error getting tool info for {tool_name}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@mcp_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """Health check for MCP service"""
    return jsonify({
        'status': 'healthy',
        'service': 'mcp-orchestrator',
        'version': '1.0.0'
    })

# Error handlers
@mcp_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@mcp_bp.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'success': False,
        'error': 'Method not allowed'
    }), 405

@mcp_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

