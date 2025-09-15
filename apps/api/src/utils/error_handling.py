"""
Enhanced error handling for Flask API
Provides consistent error responses and logging
"""

import logging
import traceback
from functools import wraps
from typing import Dict, Any, Optional, Tuple
from flask import request, jsonify, current_app
from werkzeug.exceptions import HTTPException
import jwt
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom API error class"""
    
    def __init__(self, message: str, status_code: int = 400, payload: Optional[Dict] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload or {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for JSON response"""
        return {
            'success': False,
            'error': {
                'message': self.message,
                'code': self.status_code,
                **self.payload
            },
            'timestamp': datetime.utcnow().isoformat()
        }

class ValidationError(APIError):
    """Validation error class"""
    
    def __init__(self, message: str, errors: Dict[str, str] = None):
        super().__init__(message, 422, {'validation_errors': errors or {}})

class AuthenticationError(APIError):
    """Authentication error class"""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, 401)

class AuthorizationError(APIError):
    """Authorization error class"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, 403)

class RateLimitError(APIError):
    """Rate limit error class"""
    
    def __init__(self, message: str = "Too many requests"):
        super().__init__(message, 429)

def handle_api_error(error: APIError) -> Tuple[Dict[str, Any], int]:
    """Handle API errors"""
    logger.warning(f"API Error: {error.message} (Status: {error.status_code})")
    return jsonify(error.to_dict()), error.status_code

def handle_http_error(error: HTTPException) -> Tuple[Dict[str, Any], int]:
    """Handle HTTP errors"""
    logger.warning(f"HTTP Error: {error.description} (Status: {error.code})")
    return jsonify({
        'success': False,
        'error': {
            'message': error.description,
            'code': error.code
        },
        'timestamp': datetime.utcnow().isoformat()
    }), error.code

def handle_generic_error(error: Exception) -> Tuple[Dict[str, Any], int]:
    """Handle generic errors"""
    logger.error(f"Unexpected error: {str(error)}")
    logger.error(traceback.format_exc())
    
    # Don't expose internal errors in production
    message = str(error) if current_app.debug else "Internal server error"
    
    return jsonify({
        'success': False,
        'error': {
            'message': message,
            'code': 500
        },
        'timestamp': datetime.utcnow().isoformat()
    }), 500

def error_handler(f):
    """Decorator for handling errors in route functions"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except APIError as e:
            return handle_api_error(e)
        except HTTPException as e:
            return handle_http_error(e)
        except Exception as e:
            return handle_generic_error(e)
    return decorated_function

def validate_json():
    """Validate that request contains valid JSON"""
    if not request.is_json:
        raise ValidationError("Request must contain valid JSON")
    
    if not request.get_json():
        raise ValidationError("Request body cannot be empty")

def validate_required_fields(data: Dict[str, Any], required_fields: list) -> None:
    """Validate that required fields are present"""
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            missing_fields.append(field)
    
    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            {'missing_fields': missing_fields}
        )

def validate_email(email: str) -> bool:
    """Simple email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password_strength(password: str) -> None:
    """Validate password strength"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")
    
    if errors:
        raise ValidationError(
            "Password does not meet security requirements",
            {'password_errors': errors}
        )

def rate_limit_key(identifier: str = None) -> str:
    """Generate rate limit key"""
    if identifier:
        return f"rate_limit:{identifier}"
    
    # Use IP address as fallback
    return f"rate_limit:{request.remote_addr}"

def success_response(data: Any = None, message: str = None, status_code: int = 200) -> Tuple[Dict[str, Any], int]:
    """Generate success response"""
    response = {
        'success': True,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if data is not None:
        response['data'] = data
    
    if message:
        response['message'] = message
    
    return jsonify(response), status_code

def paginate_response(items: list, page: int, per_page: int, total: int) -> Dict[str, Any]:
    """Generate paginated response"""
    total_pages = (total + per_page - 1) // per_page
    
    return {
        'items': items,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'total_pages': total_pages,
            'has_next': page < total_pages,
            'has_prev': page > 1
        }
    }

def log_api_call(endpoint: str, method: str, user_id: str = None, duration: float = None):
    """Log API call for monitoring"""
    log_data = {
        'endpoint': endpoint,
        'method': method,
        'ip': request.remote_addr,
        'user_agent': request.headers.get('User-Agent', ''),
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if user_id:
        log_data['user_id'] = user_id
    
    if duration:
        log_data['duration_ms'] = round(duration * 1000, 2)
    
    logger.info(f"API Call: {log_data}")

class RequestLogger:
    """Context manager for logging API requests"""
    
    def __init__(self, endpoint: str, user_id: str = None):
        self.endpoint = endpoint
        self.user_id = user_id
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.utcnow()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.utcnow() - self.start_time).total_seconds()
        log_api_call(self.endpoint, request.method, self.user_id, duration)

def secure_headers(response):
    """Add security headers to response"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response