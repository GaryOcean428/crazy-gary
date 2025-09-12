"""
Harmony API routes for model interaction
"""
import json
import asyncio
from flask import Blueprint, request, jsonify, Response
from flask_cors import cross_origin
from src.models.harmony_client import HarmonyClient, HarmonyMessage, Message, ModelSettings, Content
from typing import Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

harmony_bp = Blueprint('harmony', __name__, url_prefix='/api/harmony')

def validate_harmony_message(data: Dict[str, Any]) -> HarmonyMessage:
    """Validate and convert request data to HarmonyMessage"""
    try:
        # Convert messages
        messages = []
        for msg_data in data.get('messages', []):
            content = []
            for content_data in msg_data.get('content', []):
                content.append(Content(**content_data))
            messages.append(Message(
                role=msg_data['role'],
                content=content,
                timestamp=msg_data.get('timestamp'),
                id=msg_data.get('id')
            ))
        
        # Convert settings if provided
        settings = None
        if 'settings' in data:
            settings = ModelSettings(**data['settings'])
        
        # Convert tools if provided
        tools = data.get('tools', [])
        
        return HarmonyMessage(
            messages=messages,
            tools=tools,
            settings=settings,
            metadata=data.get('metadata', {})
        )
    except Exception as e:
        raise ValueError(f"Invalid Harmony message format: {str(e)}")

def harmony_message_to_dict(harmony_msg: HarmonyMessage) -> Dict[str, Any]:
    """Convert HarmonyMessage to dictionary for JSON response"""
    result = {
        'messages': [],
        'tools': harmony_msg.tools or [],
        'metadata': harmony_msg.metadata or {}
    }
    
    # Convert messages
    for msg in harmony_msg.messages:
        msg_dict = {
            'role': msg.role,
            'content': [],
            'timestamp': msg.timestamp,
            'id': msg.id
        }
        
        # Convert content
        for content in msg.content:
            content_dict = {'type': content.type}
            if content.text:
                content_dict['text'] = content.text
            if content.value:
                content_dict['value'] = content.value
            if content.url:
                content_dict['url'] = content.url
            if content.alt:
                content_dict['alt'] = content.alt
            if content.steps:
                content_dict['steps'] = content.steps
            if content.name:
                content_dict['name'] = content.name
            if content.parameters:
                content_dict['parameters'] = content.parameters
            if content.id:
                content_dict['id'] = content.id
            if content.tool_call_id:
                content_dict['tool_call_id'] = content.tool_call_id
            if content.result:
                content_dict['result'] = content.result
            if content.error:
                content_dict['error'] = content.error
            
            msg_dict['content'].append(content_dict)
        
        result['messages'].append(msg_dict)
    
    # Convert settings
    if harmony_msg.settings:
        result['settings'] = {
            'model': harmony_msg.settings.model,
            'temperature': harmony_msg.settings.temperature,
            'top_p': harmony_msg.settings.top_p,
            'top_k': harmony_msg.settings.top_k,
            'max_tokens': harmony_msg.settings.max_tokens,
            'presence_penalty': harmony_msg.settings.presence_penalty,
            'frequency_penalty': harmony_msg.settings.frequency_penalty,
            'seed': harmony_msg.settings.seed
        }
    
    return result

@harmony_bp.route('/generate', methods=['POST'])
@cross_origin()
def generate_response():
    """Generate a response using the Harmony format"""
    try:
        # Validate request data
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate Harmony message format
        try:
            harmony_message = validate_harmony_message(data)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Generate response using async client
        async def generate():
            async with HarmonyClient() as client:
                response = await client.generate_response(harmony_message)
                return response
        
        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            response_message = loop.run_until_complete(generate())
        finally:
            loop.close()
        
        # Convert response to dictionary
        response_dict = harmony_message_to_dict(response_message)
        
        logger.info(f"Generated response for {len(harmony_message.messages)} messages")
        return jsonify(response_dict)
    
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@harmony_bp.route('/validate', methods=['POST'])
@cross_origin()
def validate_message():
    """Validate a Harmony message format"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Try to validate the message
        try:
            harmony_message = validate_harmony_message(data)
            return jsonify({
                'valid': True,
                'message': 'Harmony message is valid',
                'message_count': len(harmony_message.messages)
            })
        except ValueError as e:
            return jsonify({
                'valid': False,
                'error': str(e)
            }), 400
    
    except Exception as e:
        logger.error(f"Error validating message: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@harmony_bp.route('/models/status', methods=['GET'])
@cross_origin()
def get_model_status():
    """Get the status of available models"""
    try:
        async def check_models():
            async with HarmonyClient() as client:
                model_120b_available = await client.is_model_available('120b')
                model_20b_available = await client.is_model_available('20b')
                return {
                    '120b': {
                        'available': model_120b_available,
                        'url': client.hf_120b_url
                    },
                    '20b': {
                        'available': model_20b_available,
                        'url': client.hf_20b_url
                    }
                }
        
        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            status = loop.run_until_complete(check_models())
        finally:
            loop.close()
        
        return jsonify(status)
    
    except Exception as e:
        logger.error(f"Error checking model status: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@harmony_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'harmony-api',
        'version': '1.0.0'
    })

# Error handlers
@harmony_bp.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@harmony_bp.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@harmony_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

