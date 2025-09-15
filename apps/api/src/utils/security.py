"""
Security utilities for Flask API
Provides authentication, authorization, and security middleware
"""

import jwt
import bcrypt
import redis
import time
import secrets
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Any, Optional, List
from flask import request, current_app, g
from .error_handling import AuthenticationError, AuthorizationError, RateLimitError

# Initialize Redis for rate limiting and caching (mock for now)
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
except:
    redis_client = None

class SecurityConfig:
    """Security configuration"""
    JWT_SECRET_KEY = None
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    BCRYPT_ROUNDS = 12
    RATE_LIMIT_DEFAULT = 100  # requests per hour
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = timedelta(minutes=15)

def generate_secure_token(length: int = 32) -> str:
    """Generate cryptographically secure random token"""
    return secrets.token_urlsafe(length)

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt(rounds=SecurityConfig.BCRYPT_ROUNDS)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_jwt_token(user_id: str, email: str, token_type: str = 'access') -> str:
    """Generate JWT token"""
    if not SecurityConfig.JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY not configured")
    
    expires_delta = (
        SecurityConfig.JWT_ACCESS_TOKEN_EXPIRES 
        if token_type == 'access' 
        else SecurityConfig.JWT_REFRESH_TOKEN_EXPIRES
    )
    
    payload = {
        'user_id': user_id,
        'email': email,
        'token_type': token_type,
        'exp': datetime.utcnow() + expires_delta,
        'iat': datetime.utcnow(),
        'jti': generate_secure_token(16)  # JWT ID for token blacklisting
    }
    
    return jwt.encode(payload, SecurityConfig.JWT_SECRET_KEY, algorithm='HS256')

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token"""
    if not SecurityConfig.JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY not configured")
    
    try:
        payload = jwt.decode(token, SecurityConfig.JWT_SECRET_KEY, algorithms=['HS256'])
        
        # Check if token is blacklisted
        if redis_client and redis_client.exists(f"blacklist:{payload['jti']}"):
            raise AuthenticationError("Token has been revoked")
        
        return payload
    
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token has expired")
    except jwt.InvalidTokenError:
        raise AuthenticationError("Invalid token")

def blacklist_token(jti: str, expires_at: datetime = None):
    """Add token to blacklist"""
    if not redis_client:
        return
    
    expires_at = expires_at or datetime.utcnow() + SecurityConfig.JWT_ACCESS_TOKEN_EXPIRES
    ttl = int((expires_at - datetime.utcnow()).total_seconds())
    
    if ttl > 0:
        redis_client.setex(f"blacklist:{jti}", ttl, "1")

def get_current_user() -> Optional[Dict[str, Any]]:
    """Get current authenticated user"""
    return getattr(g, 'current_user', None)

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            raise AuthenticationError("Authorization header missing or invalid")
        
        token = auth_header.split(' ')[1]
        payload = verify_jwt_token(token)
        
        # Store user info in Flask's g object
        g.current_user = {
            'id': payload['user_id'],
            'email': payload['email'],
            'token_type': payload.get('token_type', 'access')
        }
        
        return f(*args, **kwargs)
    
    return decorated_function

def require_roles(required_roles: List[str]):
    """Decorator to require specific roles"""
    def decorator(f):
        @wraps(f)
        @require_auth
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            user_roles = user.get('roles', [])
            
            if not any(role in user_roles for role in required_roles):
                raise AuthorizationError("Insufficient permissions")
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def rate_limit(max_requests: int = None, window: int = 3600, key_func=None):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not redis_client:
                # Skip rate limiting if Redis is not available
                return f(*args, **kwargs)
            
            # Determine rate limit key
            if key_func:
                key = key_func()
            else:
                user = get_current_user()
                if user:
                    key = f"rate_limit:user:{user['id']}"
                else:
                    key = f"rate_limit:ip:{request.remote_addr}"
            
            # Check current request count
            current_requests = redis_client.get(key)
            max_reqs = max_requests or SecurityConfig.RATE_LIMIT_DEFAULT
            
            if current_requests and int(current_requests) >= max_reqs:
                raise RateLimitError(f"Rate limit exceeded: {max_reqs} requests per hour")
            
            # Increment request count
            if current_requests:
                redis_client.incr(key)
            else:
                redis_client.setex(key, window, 1)
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def check_login_attempts(identifier: str) -> None:
    """Check if account is locked due to failed login attempts"""
    if not redis_client:
        return
    
    key = f"login_attempts:{identifier}"
    attempts = redis_client.get(key)
    
    if attempts and int(attempts) >= SecurityConfig.MAX_LOGIN_ATTEMPTS:
        ttl = redis_client.ttl(key)
        raise AuthenticationError(
            f"Account locked due to too many failed login attempts. "
            f"Try again in {ttl} seconds."
        )

def record_login_attempt(identifier: str, success: bool) -> None:
    """Record login attempt"""
    if not redis_client:
        return
    
    key = f"login_attempts:{identifier}"
    
    if success:
        # Clear failed attempts on successful login
        redis_client.delete(key)
    else:
        # Increment failed attempts
        current_attempts = redis_client.get(key)
        lockout_seconds = int(SecurityConfig.LOCKOUT_DURATION.total_seconds())
        
        if current_attempts:
            redis_client.incr(key)
            redis_client.expire(key, lockout_seconds)
        else:
            redis_client.setex(key, lockout_seconds, 1)

def sanitize_input(value: str, max_length: int = 255) -> str:
    """Sanitize user input"""
    if not isinstance(value, str):
        value = str(value)
    
    # Remove null bytes and control characters
    value = ''.join(char for char in value if ord(char) >= 32 or char in ['\n', '\r', '\t'])
    
    # Truncate to max length
    return value[:max_length].strip()

def validate_request_size(max_size: int = 1024 * 1024):  # 1MB default
    """Validate request content length"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            content_length = request.content_length
            
            if content_length and content_length > max_size:
                raise ValidationError(f"Request too large. Maximum size: {max_size} bytes")
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def cors_headers(origin: str = "*", methods: List[str] = None, headers: List[str] = None):
    """Add CORS headers"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            response = f(*args, **kwargs)
            
            # Handle both tuple and response object returns
            if isinstance(response, tuple):
                response_obj = response[0]
            else:
                response_obj = response
            
            # Add CORS headers
            response_obj.headers['Access-Control-Allow-Origin'] = origin
            response_obj.headers['Access-Control-Allow-Methods'] = ', '.join(
                methods or ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            )
            response_obj.headers['Access-Control-Allow-Headers'] = ', '.join(
                headers or ['Content-Type', 'Authorization', 'X-Requested-With']
            )
            response_obj.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
            
            return response
        
        return decorated_function
    return decorator

def init_security_config(app):
    """Initialize security configuration"""
    SecurityConfig.JWT_SECRET_KEY = app.config.get('JWT_SECRET_KEY')
    
    if not SecurityConfig.JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY must be configured")
    
    # Set other security configurations
    SecurityConfig.JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=app.config.get('JWT_ACCESS_TOKEN_EXPIRES_HOURS', 1)
    )
    SecurityConfig.JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=app.config.get('JWT_REFRESH_TOKEN_EXPIRES_DAYS', 30)
    )
    SecurityConfig.BCRYPT_ROUNDS = app.config.get('BCRYPT_ROUNDS', 12)
    SecurityConfig.RATE_LIMIT_DEFAULT = app.config.get('RATE_LIMIT_DEFAULT', 100)
    SecurityConfig.MAX_LOGIN_ATTEMPTS = app.config.get('MAX_LOGIN_ATTEMPTS', 5)
    SecurityConfig.LOCKOUT_DURATION = timedelta(
        minutes=app.config.get('LOCKOUT_DURATION_MINUTES', 15)
    )