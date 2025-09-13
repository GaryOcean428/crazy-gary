"""
Authentication API Routes
User registration, login, and token management
"""
from flask import Blueprint, request, jsonify
from src.models.auth import auth_manager, require_auth, get_current_user
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('fullName') or data.get('name')  # Support both field names
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Validate email format
        if '@' not in email or '.' not in email:
            return jsonify({'error': 'Invalid email format'}), 400
        
        result = auth_manager.register_user(email, password, full_name)
        
        if 'error' in result:
            status_code = 409 if result.get('code') == 'USER_EXISTS' else 400
            return jsonify({'error': result['error']}), status_code
        
        return jsonify(result), 201
        
    except Exception as e:
        logger.error(f"Error in register endpoint: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user and return a token"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        result = auth_manager.login_user(email, password)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 401
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error in login endpoint: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@require_auth
def refresh_token():
    """Refresh an existing token"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header is required'}), 401
        
        token = auth_header.split(' ')[1]
        result = auth_manager.refresh_token(token)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 401
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error in refresh endpoint: {str(e)}")
        return jsonify({'error': 'Token refresh failed'}), 500

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_profile():
    """Get current user profile"""
    try:
        user = get_current_user()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in profile endpoint: {str(e)}")
        return jsonify({'error': 'Failed to get profile'}), 500

@auth_bp.route('/me', methods=['PUT'])
@require_auth
def update_profile():
    """Update current user profile"""
    try:
        user = get_current_user()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        # Update allowed fields
        if 'name' in data:
            user.name = data['name']
        
        # Note: Email changes would require verification in a production system
        # Password changes should go through a separate endpoint with current password verification
        
        from src.models.user import db
        db.session.commit()
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            }
        }), 200
        
    except Exception as e:
        from src.models.user import db
        db.session.rollback()
        logger.error(f"Error in update profile endpoint: {str(e)}")
        return jsonify({'error': 'Failed to update profile'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@require_auth
def change_password():
    """Change user password"""
    try:
        user = get_current_user()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Verify current password
        if not auth_manager.verify_password(current_password, user.password_hash):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Validate new password
        if len(new_password) < 8:
            return jsonify({'error': 'New password must be at least 8 characters long'}), 400
        
        # Update password
        user.password_hash = auth_manager.hash_password(new_password)
        
        from src.models.user import db
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        from src.models.user import db
        db.session.rollback()
        logger.error(f"Error in change password endpoint: {str(e)}")
        return jsonify({'error': 'Failed to change password'}), 500

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    """Logout user (client-side token removal)"""
    # In a JWT system, logout is typically handled client-side by removing the token
    # For enhanced security, you could maintain a blacklist of tokens
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/validate', methods=['GET'])
@require_auth
def validate_token():
    """Validate if the current token is valid"""
    try:
        user = get_current_user()
        
        if not user:
            return jsonify({'valid': False}), 401
        
        return jsonify({
            'valid': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in validate endpoint: {str(e)}")
        return jsonify({'valid': False}), 401

