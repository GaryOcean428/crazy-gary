#!/usr/bin/env python3
"""
Security middleware for crazy-gary application
Implements security headers and protection measures for Railway deployment
"""

from flask import request, make_response, g
import os
import time
import hashlib
from functools import wraps


class SecurityHeaders:
    """Security headers middleware for Flask applications"""
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize security headers with Flask app"""
        app.after_request(self.add_security_headers)
        app.before_request(self.security_checks)
    
    def add_security_headers(self, response):
        """Add security headers to all responses"""
        environment = os.getenv('ENVIRONMENT', 'development')
        railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', '')
        
        # Content Security Policy
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # Allow inline scripts for development
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' ws: wss:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ]
        
        # Add Railway domain to CSP if available
        if railway_domain:
            csp_directives.extend([
                f"connect-src 'self' ws: wss: https://{railway_domain}",
                f"frame-src 'self' https://{railway_domain}"
            ])
        
        # Apply security headers
        security_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': '; '.join(csp_directives),
            'Permissions-Policy': (
                'camera=(), microphone=(), geolocation=(), '
                'payment=(), usb=(), magnetometer=(), gyroscope=()'
            )
        }
        
        # Add HSTS for production
        if environment == 'production' and request.scheme == 'https':
            security_headers['Strict-Transport-Security'] = (
                'max-age=31536000; includeSubDomains; preload'
            )
        
        # Add security headers to response
        for header, value in security_headers.items():
            response.headers[header] = value
        
        # Remove server header for security
        response.headers.pop('Server', None)
        
        return response
    
    def security_checks(self):
        """Perform security checks before handling requests"""
        # Rate limiting check (basic implementation)
        self._check_rate_limit()
        
        # Request size check
        self._check_request_size()
        
        # Host header validation
        self._validate_host_header()
    
    def _check_rate_limit(self):
        """Basic rate limiting implementation"""
        rate_limit = int(os.getenv('RATE_LIMIT_RPS', 10))
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        
        # Simple in-memory rate limiting (for production, use Redis)
        if not hasattr(g, 'rate_limits'):
            g.rate_limits = {}
        
        current_time = time.time()
        key = f"rate_limit:{client_ip}"
        
        if key in g.rate_limits:
            requests, last_reset = g.rate_limits[key]
            if current_time - last_reset > 1:  # Reset every second
                g.rate_limits[key] = (1, current_time)
            else:
                requests += 1
                g.rate_limits[key] = (requests, last_reset)
                if requests > rate_limit:
                    from flask import abort
                    abort(429)  # Too Many Requests
        else:
            g.rate_limits[key] = (1, current_time)
    
    def _check_request_size(self):
        """Check request size to prevent large payload attacks"""
        max_size = int(os.getenv('MAX_REQUEST_SIZE', 16 * 1024 * 1024))  # 16MB default
        
        if request.content_length and request.content_length > max_size:
            from flask import abort
            abort(413)  # Payload Too Large
    
    def _validate_host_header(self):
        """Validate Host header to prevent host header injection"""
        allowed_hosts = os.getenv('ALLOWED_HOSTS', '').split(',')
        railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', '')
        
        if railway_domain:
            allowed_hosts.append(railway_domain)
        
        # Allow localhost for development
        if os.getenv('ENVIRONMENT') != 'production':
            allowed_hosts.extend(['localhost', '127.0.0.1', '0.0.0.0'])
        
        if allowed_hosts and request.host:
            host_valid = any(
                request.host == allowed_host or 
                request.host.startswith(allowed_host.replace('*', ''))
                for allowed_host in allowed_hosts if allowed_host.strip()
            )
            
            if not host_valid:
                from flask import abort
                abort(400)  # Bad Request


def require_api_key(f):
    """Decorator to require API key for sensitive endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        expected_key = os.getenv('API_KEY')
        
        if expected_key and api_key != expected_key:
            from flask import abort
            abort(401)  # Unauthorized
        
        return f(*args, **kwargs)
    return decorated_function


def require_auth_token(f):
    """Decorator to require JWT token for protected endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            from flask import abort
            abort(401)  # Unauthorized
        
        token = auth_header.split(' ')[1]
        
        # Validate token (implement JWT validation here)
        if not validate_jwt_token(token):
            from flask import abort
            abort(401)  # Unauthorized
        
        return f(*args, **kwargs)
    return decorated_function


def validate_jwt_token(token):
    """Validate JWT token (placeholder implementation)"""
    # Implement proper JWT validation here
    # For now, just check if token exists and is not empty
    return bool(token and len(token) > 10)


def setup_security(app):
    """Setup security measures for the Flask app"""
    # Initialize security headers
    SecurityHeaders(app)
    
    # Add CORS headers specifically for Railway
    @app.after_request
    def add_cors_headers(response):
        """Add CORS headers for Railway deployment"""
        cors_origins = os.getenv('CORS_ORIGINS', '*')
        
        if cors_origins != '*':
            # Parse origins and check if request origin is allowed
            allowed_origins = [origin.strip() for origin in cors_origins.split(',')]
            origin = request.headers.get('Origin')
            
            if origin in allowed_origins:
                response.headers['Access-Control-Allow-Origin'] = origin
            else:
                # Don't set CORS headers for unauthorized origins
                pass
        else:
            # Development mode - allow all origins
            response.headers['Access-Control-Allow-Origin'] = '*'
        
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
        
        return response
    
    # Handle OPTIONS requests for CORS preflight
    @app.before_request
    def handle_preflight():
        """Handle CORS preflight requests"""
        if request.method == 'OPTIONS':
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
    
    # Error handlers
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        """Handle rate limit exceeded"""
        return {
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please slow down.',
            'retry_after': 60
        }, 429
    
    @app.errorhandler(413)
    def payload_too_large(error):
        """Handle payload too large"""
        return {
            'error': 'Payload too large',
            'message': 'Request payload exceeds maximum allowed size'
        }, 413
    
    @app.errorhandler(400)
    def bad_request(error):
        """Handle bad request"""
        return {
            'error': 'Bad request',
            'message': 'Invalid request'
        }, 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        """Handle unauthorized"""
        return {
            'error': 'Unauthorized',
            'message': 'Authentication required'
        }, 401


# Request logging for security monitoring
def log_security_event(event_type, details=None):
    """Log security events for monitoring"""
    import logging
    
    logger = logging.getLogger('security')
    logger.warning(f"Security event: {event_type}", extra={
        'event_type': event_type,
        'details': details or {},
        'ip': request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
        'user_agent': request.headers.get('User-Agent'),
        'timestamp': time.time()
    })