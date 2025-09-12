"""
Endpoint management API routes
"""
import asyncio
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from src.models.harmony_client import HarmonyClient
import logging

logger = logging.getLogger(__name__)

endpoints_bp = Blueprint('endpoints', __name__, url_prefix='/api/endpoints')

@endpoints_bp.route('/status', methods=['GET'])
@cross_origin()
def get_all_endpoint_status():
    """Get status of all endpoints"""
    try:
        async def get_status():
            async with HarmonyClient() as client:
                return await client.get_all_endpoint_status()
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            status = loop.run_until_complete(get_status())
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'endpoints': status
        })
    
    except Exception as e:
        logger.error(f"Error getting endpoint status: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@endpoints_bp.route('/status/<model_type>', methods=['GET'])
@cross_origin()
def get_endpoint_status(model_type):
    """Get status of a specific endpoint"""
    try:
        if model_type not in ['120b', '20b']:
            return jsonify({
                'success': False,
                'error': 'Invalid model type. Must be 120b or 20b'
            }), 400
        
        async def get_status():
            async with HarmonyClient() as client:
                return await client.get_endpoint_status(model_type)
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            status = loop.run_until_complete(get_status())
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'model_type': model_type,
            'status': status
        })
    
    except Exception as e:
        logger.error(f"Error getting endpoint status for {model_type}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@endpoints_bp.route('/wake', methods=['POST'])
@cross_origin()
def wake_all_endpoints():
    """Wake up all endpoints"""
    try:
        async def wake_all():
            async with HarmonyClient() as client:
                return await client.wake_all_endpoints()
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            results = loop.run_until_complete(wake_all())
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'message': 'Wake-up requests sent to all endpoints',
            'results': results
        })
    
    except Exception as e:
        logger.error(f"Error waking all endpoints: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@endpoints_bp.route('/wake/<model_type>', methods=['POST'])
@cross_origin()
def wake_endpoint(model_type):
    """Wake up a specific endpoint"""
    try:
        if model_type not in ['120b', '20b']:
            return jsonify({
                'success': False,
                'error': 'Invalid model type. Must be 120b or 20b'
            }), 400
        
        async def wake():
            async with HarmonyClient() as client:
                return await client.wake_endpoint(model_type)
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            success = loop.run_until_complete(wake())
        finally:
            loop.close()
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Wake-up request sent to {model_type} endpoint',
                'model_type': model_type
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to wake {model_type} endpoint'
            }), 500
    
    except Exception as e:
        logger.error(f"Error waking endpoint {model_type}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@endpoints_bp.route('/sleep', methods=['POST'])
@cross_origin()
def sleep_all_endpoints():
    """Put all endpoints to sleep"""
    try:
        async def sleep_all():
            async with HarmonyClient() as client:
                return await client.sleep_all_endpoints()
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            results = loop.run_until_complete(sleep_all())
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'message': 'Sleep requests sent to all endpoints',
            'results': results
        })
    
    except Exception as e:
        logger.error(f"Error sleeping all endpoints: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@endpoints_bp.route('/sleep/<model_type>', methods=['POST'])
@cross_origin()
def sleep_endpoint(model_type):
    """Put a specific endpoint to sleep"""
    try:
        if model_type not in ['120b', '20b']:
            return jsonify({
                'success': False,
                'error': 'Invalid model type. Must be 120b or 20b'
            }), 400
        
        async def sleep():
            async with HarmonyClient() as client:
                return await client.sleep_endpoint(model_type)
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            success = loop.run_until_complete(sleep())
        finally:
            loop.close()
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Sleep request sent to {model_type} endpoint',
                'model_type': model_type
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to sleep {model_type} endpoint'
            }), 500
    
    except Exception as e:
        logger.error(f"Error sleeping endpoint {model_type}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@endpoints_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """Health check for endpoint management service"""
    return jsonify({
        'status': 'healthy',
        'service': 'endpoint-management',
        'version': '1.0.0'
    })

# Error handlers
@endpoints_bp.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@endpoints_bp.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'success': False, 'error': 'Method not allowed'}), 405

@endpoints_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

