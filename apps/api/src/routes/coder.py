"""
Coder service integration routes for Crazy-Gary.
Provides endpoints to interact with the Coder development environment.
"""

import os
import requests
from flask import Blueprint, jsonify, request
from ..middleware.request_logging import log_request

coder_bp = Blueprint('coder', __name__)

@coder_bp.route('/status', methods=['GET'])
@log_request
def get_coder_status():
    """Get Coder service status and connection info."""
    try:
        # Get Coder service URLs from environment variables
        coder_access_url = os.getenv('CODER_ACCESS_URL')
        coder_http_address = os.getenv('CODER_HTTP_ADDRESS')
        
        status = {
            'service': 'coder',
            'connected': False,
            'access_url': coder_access_url,
            'http_address': coder_http_address,
            'environment_variables': {
                'CODER_ACCESS_URL': bool(coder_access_url),
                'CODER_HTTP_ADDRESS': bool(coder_http_address)
            }
        }
        
        # Test connection to Coder service if URL is available
        if coder_access_url:
            try:
                # Simple health check to Coder service
                response = requests.get(f"{coder_access_url}/api/v2/buildinfo", timeout=5)
                if response.status_code == 200:
                    status['connected'] = True
                    status['build_info'] = response.json()
            except requests.RequestException as e:
                status['connection_error'] = str(e)
        
        return jsonify(status), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get Coder status',
            'message': str(e)
        }), 500

@coder_bp.route('/workspaces', methods=['GET'])
@log_request
def get_workspaces():
    """Get list of Coder workspaces."""
    try:
        coder_access_url = os.getenv('CODER_ACCESS_URL')
        
        if not coder_access_url:
            return jsonify({
                'error': 'Coder service not configured',
                'message': 'CODER_ACCESS_URL environment variable not set'
            }), 400
        
        # Get workspaces from Coder API
        try:
            response = requests.get(f"{coder_access_url}/api/v2/workspaces", timeout=10)
            if response.status_code == 200:
                workspaces = response.json()
                return jsonify({
                    'workspaces': workspaces,
                    'count': len(workspaces)
                }), 200
            else:
                return jsonify({
                    'error': 'Failed to fetch workspaces',
                    'status_code': response.status_code
                }), response.status_code
                
        except requests.RequestException as e:
            return jsonify({
                'error': 'Connection to Coder service failed',
                'message': str(e)
            }), 503
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get workspaces',
            'message': str(e)
        }), 500

@coder_bp.route('/templates', methods=['GET'])
@log_request
def get_templates():
    """Get list of Coder templates."""
    try:
        coder_access_url = os.getenv('CODER_ACCESS_URL')
        
        if not coder_access_url:
            return jsonify({
                'error': 'Coder service not configured',
                'message': 'CODER_ACCESS_URL environment variable not set'
            }), 400
        
        # Get templates from Coder API
        try:
            response = requests.get(f"{coder_access_url}/api/v2/templates", timeout=10)
            if response.status_code == 200:
                templates = response.json()
                return jsonify({
                    'templates': templates,
                    'count': len(templates)
                }), 200
            else:
                return jsonify({
                    'error': 'Failed to fetch templates',
                    'status_code': response.status_code
                }), response.status_code
                
        except requests.RequestException as e:
            return jsonify({
                'error': 'Connection to Coder service failed',
                'message': str(e)
            }), 503
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get templates',
            'message': str(e)
        }), 500

