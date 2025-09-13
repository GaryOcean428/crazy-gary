"""
Redis-Enhanced Authentication API Routes
"""
from flask import Blueprint, request, jsonify
from src.models.auth_redis import redis_auth_manager, require_redis_auth, get_current_user
from src.models.redis_client import redis_client
import logging

logger = logging.getLogger(__name__)

auth_redis_bp = Blueprint('auth_redis', __name__, url_prefix='/api/auth')

@auth_redis_bp.route('/register', methods=['POST'])
def register():
    """Register a new user with Redis session management"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        # Validation
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        if '@' not in email:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Register user
        result = redis_auth_manager.register_user(email, password, name)
        
        if 'error' in result:
            status_code = 409 if result.get('code') == 'USER_EXISTS' else 400
            return jsonify(result), status_code
        
        return jsonify(result), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_redis_bp.route('/login', methods=['POST'])
def login():
    """Login user with Redis session management"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validation
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Login user
        result = redis_auth_manager.login_user(email, password)
        
        if 'error' in result:
            return jsonify(result), 401
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_redis_bp.route('/logout', methods=['POST'])
@require_redis_auth
def logout():
    """Logout user and invalidate Redis session"""
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            token = auth_header.split(' ')[1]
            result = redis_auth_manager.logout_user(token)
            return jsonify(result), 200
        
        return jsonify({'error': 'No token provided'}), 400
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'error': 'Logout failed'}), 500

@auth_redis_bp.route('/refresh', methods=['POST'])
def refresh():
    """Refresh JWT token"""
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No token provided'}), 400
        
        token = auth_header.split(' ')[1]
        result = redis_auth_manager.refresh_token(token)
        
        if 'error' in result:
            return jsonify(result), 401
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        return jsonify({'error': 'Token refresh failed'}), 500

@auth_redis_bp.route('/me', methods=['GET'])
@require_redis_auth
def get_profile():
    """Get current user profile"""
    try:
        user = get_current_user()
        session_data = getattr(request, 'current_session', {})
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            },
            'session': {
                'login_time': session_data.get('login_time'),
                'last_activity': session_data.get('last_activity')
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Profile error: {str(e)}")
        return jsonify({'error': 'Failed to get profile'}), 500

@auth_redis_bp.route('/status', methods=['GET'])
def auth_status():
    """Get authentication system status"""
    try:
        redis_connected = redis_client.is_connected()
        
        return jsonify({
            'auth_system': 'Redis-Enhanced Authentication',
            'redis_connected': redis_connected,
            'session_management': 'Redis' if redis_connected else 'Fallback',
            'features': [
                'JWT tokens with session validation',
                'Redis session storage',
                'Real-time session management',
                'Rate limiting support',
                'Session activity tracking'
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Auth status error: {str(e)}")
        return jsonify({'error': 'Failed to get auth status'}), 500

@auth_redis_bp.route('/validate', methods=['POST'])
def validate_token():
    """Validate a JWT token without requiring authentication"""
    try:
        data = request.get_json()
        token = data.get('token') if data else None
        
        if not token:
            # Try to get from header
            auth_header = request.headers.get('Authorization')
            if auth_header:
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'valid': False, 'error': 'No token provided'}), 400
        
        user, session_data = redis_auth_manager.get_user_from_token(token)
        
        if user and session_data:
            return jsonify({
                'valid': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name
                },
                'session_active': session_data.get('is_active', False)
            }), 200
        else:
            return jsonify({'valid': False, 'error': 'Invalid or expired token'}), 401
            
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        return jsonify({'valid': False, 'error': 'Validation failed'}), 500

