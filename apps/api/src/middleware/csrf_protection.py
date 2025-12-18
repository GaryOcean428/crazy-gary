#!/usr/bin/env python3
"""
CSRF (Cross-Site Request Forgery) Protection Middleware
Implements CSRF protection following OWASP guidelines
"""

import secrets
import hashlib
import hmac
import time
import json
from typing import Optional, Dict, Any
from functools import wraps
from flask import request, session, g, jsonify, make_response
from werkzeug.exceptions import BadRequest
import os


class CSRFProtection:
    """CSRF Protection implementation for Flask applications"""
    
    def __init__(self, secret_key: Optional[str] = None, token_timeout: int = 3600):
        """
        Initialize CSRF protection
        
        Args:
            secret_key: Secret key for token generation and validation
            token_timeout: Token timeout in seconds (default: 1 hour)
        """
        self.secret_key = secret_key or os.getenv('CSRF_SECRET_KEY', secrets.token_hex(32))
        self.token_timeout = token_timeout
        self.token_store = {}  # In-memory token store (use Redis in production)
        self.double_submit_cookie = True
    
    def _generate_token(self, session_id: str, timestamp: float) -> str:
        """
        Generate CSRF token
        
        Args:
            session_id: Session identifier
            timestamp: Token generation timestamp
        
        Returns:
            Generated CSRF token
        """
        data = f"{session_id}:{timestamp}"
        signature = hmac.new(
            self.secret_key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()
        
        token_data = {
            'session_id': session_id,
            'timestamp': timestamp,
            'signature': signature
        }
        
        return hashlib.sha256(json.dumps(token_data, sort_keys=True).encode()).hexdigest()
    
    def _verify_token(self, token: str, session_id: str) -> bool:
        """
        Verify CSRF token
        
        Args:
            token: Token to verify
            session_id: Session identifier
        
        Returns:
            True if token is valid
        """
        # Check if token exists in store
        if token not in self.token_store:
            return False
        
        stored_data = self.token_store[token]
        
        # Verify session ID matches
        if stored_data['session_id'] != session_id:
            return False
        
        # Check if token has expired
        current_time = time.time()
        if current_time - stored_data['timestamp'] > self.token_timeout:
            del self.token_store[token]
            return False
        
        # Verify signature
        expected_signature = hmac.new(
            self.secret_key.encode(),
            f"{session_id}:{stored_data['timestamp']}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(stored_data['signature'], expected_signature):
            return False
        
        return True
    
    def generate_csrf_token(self) -> str:
        """
        Generate and store CSRF token
        
        Returns:
            Generated CSRF token
        """
        if not hasattr(g, 'session_id') or not g.session_id:
            g.session_id = self._get_or_create_session_id()
        
        timestamp = time.time()
        token = self._generate_token(g.session_id, timestamp)
        
        # Store token
        self.token_store[token] = {
            'session_id': g.session_id,
            'timestamp': timestamp,
            'signature': hmac.new(
                self.secret_key.encode(),
                f"{g.session_id}:{timestamp}".encode(),
                hashlib.sha256
            ).hexdigest()
        }
        
        # Clean up expired tokens periodically
        if len(self.token_store) % 100 == 0:
            self._cleanup_expired_tokens()
        
        return token
    
    def _get_or_create_session_id(self) -> str:
        """Get or create session ID"""
        if hasattr(g, 'session_id') and g.session_id:
            return g.session_id
        
        # Try to get session ID from Flask session
        if hasattr(g, 'flask_session') and 'csrf_session_id' in g.flask_session:
            return g.flask_session['csrf_session_id']
        
        # Generate new session ID
        session_id = secrets.token_hex(16)
        
        # Store in Flask session if available
        if hasattr(g, 'flask_session'):
            g.flask_session['csrf_session_id'] = session_id
        
        return session_id
    
    def _cleanup_expired_tokens(self):
        """Clean up expired tokens from store"""
        current_time = time.time()
        expired_tokens = []
        
        for token, data in self.token_store.items():
            if current_time - data['timestamp'] > self.token_timeout:
                expired_tokens.append(token)
        
        for token in expired_tokens:
            del self.token_store[token]
    
    def set_csrf_cookie(self, response, token: str):
        """Set CSRF token as cookie"""
        response.set_cookie(
            'csrf_token',
            token,
            httponly=False,  # Must be accessible to JavaScript
            secure=True if request.is_secure else False,
            samesite='Strict',
            max_age=self.token_timeout,
            path='/'
        )
    
    def validate_csrf_token(self, session_id: str) -> bool:
        """
        Validate CSRF token from request
        
        Args:
            session_id: Session identifier
        
        Returns:
            True if token is valid
        """
        # Get token from header
        token = request.headers.get('X-CSRF-Token')
        
        # If no header token, try cookie
        if not token:
            token = request.cookies.get('csrf_token')
        
        # If no token found, check for token in form data or JSON
        if not token:
            if request.is_json:
                data = request.get_json()
                if isinstance(data, dict):
                    token = data.get('csrf_token')
            else:
                token = request.form.get('csrf_token')
        
        if not token:
            return False
        
        return self._verify_token(token, session_id)


# Flask decorators and middleware
csrf_protection = CSRFProtection()


def require_csrf(f):
    """
    Decorator to require CSRF token for state-changing operations
    
    Usage:
        @app.route('/api/endpoint', methods=['POST'])
        @require_csrf
        def my_endpoint():
            return jsonify({'success': True})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Skip CSRF check for GET, HEAD, OPTIONS requests
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return f(*args, **kwargs)
        
        # Skip CSRF check for API endpoints with proper authentication
        # (e.g., API keys, OAuth tokens)
        if _is_api_request():
            return f(*args, **kwargs)
        
        # Get or create session ID
        if not hasattr(g, 'session_id'):
            g.session_id = csrf_protection._get_or_create_session_id()
        
        # Validate CSRF token
        if not csrf_protection.validate_csrf_token(g.session_id):
            return jsonify({
                'error': 'CSRF token missing or invalid',
                'message': 'Invalid CSRF token. Please refresh the page and try again.'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def _is_api_request() -> bool:
    """
    Check if request is from API and has proper authentication
    
    Returns:
        True if request should skip CSRF check
    """
    # Check for API key
    api_key = request.headers.get('X-API-Key')
    if api_key:
        return True
    
    # Check for Bearer token
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return True
    
    # Check if request path starts with /api/
    if request.path.startswith('/api/'):
        return True
    
    return False


def generate_csrf_token():
    """Generate CSRF token and set cookie"""
    token = csrf_protection.generate_csrf_token()
    
    # Create response with token
    response = make_response({
        'csrf_token': token,
        'expires_in': csrf_protection.token_timeout
    })
    
    # Set CSRF cookie
    csrf_protection.set_csrf_cookie(response, token)
    
    return response


def setup_csrf_middleware(app):
    """
    Setup CSRF protection middleware for Flask app
    
    Args:
        app: Flask application instance
    """
    
    # Add CSRF token generation endpoint
    @app.route('/api/csrf-token', methods=['GET'])
    def get_csrf_token():
        """Get CSRF token for the current session"""
        return generate_csrf_token()
    
    # Middleware to handle session ID
    @app.before_request
    def setup_session():
        """Setup session handling for CSRF protection"""
        # Initialize Flask session handling
        if hasattr(app, 'session_interface'):
            g.flask_session = session
        
        # Get or create session ID
        if not hasattr(g, 'session_id'):
            g.session_id = csrf_protection._get_or_create_session_id()
    
    # Add CSRF headers to all responses
    @app.after_request
    def add_csrf_headers(response):
        """Add CSRF-related headers to responses"""
        # Add CSRF token for AJAX requests
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if not request.cookies.get('csrf_token'):
                token = csrf_protection.generate_csrf_token()
                csrf_protection.set_csrf_cookie(response, token)
        
        # Add CSRF header for token validation
        response.headers['X-CSRF-Token'] = 'required'
        
        return response
    
    # Error handlers
    @app.errorhandler(403)
    def handle_csrf_error(error):
        """Handle CSRF token errors"""
        if 'CSRF' in str(error.description or '').lower():
            return jsonify({
                'error': 'CSRF token invalid',
                'message': 'Your session has expired or the CSRF token is invalid. Please refresh the page.',
                'code': 'CSRF_TOKEN_INVALID'
            }), 403
        return error


# CSRF protection for forms
class CSRFForm:
    """CSRF protection for HTML forms"""
    
    @staticmethod
    def generate_form_token(session_id: str) -> str:
        """Generate CSRF token for HTML forms"""
        return csrf_protection.generate_csrf_token()
    
    @staticmethod
    def generate_form_html(token: str) -> str:
        """Generate hidden input field for CSRF token"""
        return f'<input type="hidden" name="csrf_token" value="{token}">'


# Double Submit Cookie pattern (alternative to session-based CSRF)
class DoubleSubmitCookieCSRF:
    """Double Submit Cookie CSRF protection"""
    
    @staticmethod
    def generate_double_submit_token(secret_key: str, data: str) -> str:
        """
        Generate double submit cookie token
        
        Args:
            secret_key: Secret key for HMAC
            data: Data to sign
        
        Returns:
            Generated token
        """
        timestamp = str(int(time.time()))
        message = f"{data}:{timestamp}"
        signature = hmac.new(
            secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return f"{timestamp}:{signature}"
    
    @staticmethod
    def verify_double_submit_token(token: str, secret_key: str, data: str, max_age: int = 3600) -> bool:
        """
        Verify double submit cookie token
        
        Args:
            token: Token to verify
            secret_key: Secret key for HMAC
            data: Data that was signed
            max_age: Maximum token age in seconds
        
        Returns:
            True if token is valid
        """
        try:
            parts = token.split(':')
            if len(parts) != 2:
                return False
            
            timestamp_str, signature = parts
            timestamp = int(timestamp_str)
            
            # Check if token is expired
            current_time = int(time.time())
            if current_time - timestamp > max_age:
                return False
            
            # Verify signature
            message = f"{data}:{timestamp_str}"
            expected_signature = hmac.new(
                secret_key.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
        
        except (ValueError, IndexError):
            return False


# Integration utilities
def get_csrf_token_from_request() -> Optional[str]:
    """
    Extract CSRF token from request
    
    Returns:
        CSRF token if found, None otherwise
    """
    # Try header first
    token = request.headers.get('X-CSRF-Token')
    if token:
        return token
    
    # Try cookie
    token = request.cookies.get('csrf_token')
    if token:
        return token
    
    # Try form data
    token = request.form.get('csrf_token')
    if token:
        return token
    
    # Try JSON data
    if request.is_json:
        data = request.get_json()
        if isinstance(data, dict):
            token = data.get('csrf_token')
            if token:
                return token
    
    return None


def is_csrf_exempt() -> bool:
    """
    Check if current request should be exempt from CSRF protection
    
    Returns:
        True if request should be exempt
    """
    # Skip for certain methods
    if request.method in ['GET', 'HEAD', 'OPTIONS']:
        return True
    
    # Skip for API endpoints
    if request.path.startswith('/api/'):
        return True
    
    # Skip if has proper API authentication
    if _is_api_request():
        return True
    
    # Skip for webhooks (add webhook endpoints to this list)
    webhook_endpoints = ['/api/webhook/', '/api/hooks/']
    for endpoint in webhook_endpoints:
        if request.path.startswith(endpoint):
            return True
    
    return False