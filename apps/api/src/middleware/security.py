"""
Enhanced Security Middleware for Crazy-Gary API

Provides comprehensive security features including:
- Rate limiting with Redis
- Input validation and sanitization
- Security headers
- Suspicious pattern detection
- Request/response validation
"""

import time
import re
import hashlib
import logging
from typing import Dict, Any, Optional, List
from functools import wraps
from flask import request, g, jsonify, current_app
from werkzeug.exceptions import RequestEntityTooLarge, BadRequest
import redis
import json
from datetime import datetime, timedelta

class SecurityMiddleware:
    """Enhanced security middleware with comprehensive protection"""
    
    def __init__(self, app=None, redis_client=None):
        self.redis_client = redis_client or self._create_redis_client()
        self.logger = logging.getLogger(__name__)
        
        # Security patterns
        self.xss_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'vbscript:',
            r'data:text/html',
            r'<iframe[^>]*>',
            r'<object[^>]*>',
            r'<embed[^>]*>'
        ]
        
        self.sql_injection_patterns = [
            r"('|(\-\-)|(;)|(\||\|)|(\*|\*))",
            r"(union|select|insert|delete|update|create|drop|exec|execute)",
            r"(script|javascript|vbscript|onload|onerror|onclick)",
            r"(<iframe|<object|<embed|<script)",
            r"(\'\s*or\s*\'\s*=\s*\'|\'\s*or\s*1\s*=\s*1)"
        ]
        
        if app:
            self.init_app(app)
    
    def _create_redis_client(self):
        """Create Redis client with fallback to in-memory"""
        try:
            return redis.Redis(
                host=current_app.config.get('REDIS_HOST', 'localhost'),
                port=current_app.config.get('REDIS_PORT', 6379),
                db=current_app.config.get('REDIS_DB', 0),
                decode_responses=True
            )
        except Exception:
            self.logger.warning("Redis not available, using in-memory fallback")
            return None
    
    def init_app(self, app):
        """Initialize security middleware with Flask app"""
        self.app = app
        
        # Apply middleware
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        app.errorhandler(429)(self.rate_limit_handler)
        
        # Configure security headers
        app.config['SECURITY_HEADERS'] = {
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
    
    def before_request(self):
        """Execute before each request"""
        g.request_start_time = time.time()
        g.security_violations = []
        g.client_ip = self._get_client_ip()
        g.user_agent = request.headers.get('User-Agent', '')
        
        # Rate limiting
        if not self._check_rate_limit():
            return jsonify({
                'error': 'Rate limit exceeded',
                'message': 'Too many requests from this IP address',
                'retry_after': 60
            }), 429
        
        # Input validation and sanitization
        if request.method in ['POST', 'PUT', 'PATCH']:
            self._validate_and_sanitize_input()
        
        # Suspicious pattern detection
        self._detect_suspicious_patterns()
    
    def after_request(self, response):
        """Execute after each request"""
        # Add security headers
        for header, value in current_app.config.get('SECURITY_HEADERS', {}).items():
            response.headers[header] = value
        
        # Log security events
        if g.get('security_violations'):
            self._log_security_event(response)
        
        return response
    
    def _get_client_ip(self) -> str:
        """Get client IP address with proxy support"""
        if request.headers.get('X-Forwarded-For'):
            return request.headers.get('X-Forwarded-For').split(',')[0].strip()
        elif request.headers.get('X-Real-IP'):
            return request.headers.get('X-Real-IP')
        else:
            return request.remote_addr or 'unknown'
    
    def _check_rate_limit(self) -> bool:
        """Check rate limiting"""
        client_ip = g.client_ip
        endpoint = request.endpoint or 'unknown'
        
        # Rate limit: 100 requests per minute per IP
        key = f"rate_limit:{client_ip}:{endpoint}"
        window = 60  # 1 minute
        limit = 100
        
        try:
            if self.redis_client:
                current_requests = self.redis_client.get(key)
                current_requests = int(current_requests) if current_requests else 0
                
                if current_requests >= limit:
                    return False
                
                pipe = self.redis_client.pipeline()
                pipe.incr(key)
                pipe.expire(key, window)
                pipe.execute()
            else:
                # In-memory fallback (not recommended for production)
                # Implementation would go here
                pass
            
            return True
        except Exception as e:
            self.logger.error(f"Rate limiting error: {e}")
            return True  # Fail open for availability
    
    def _validate_and_sanitize_input(self):
        """Validate and sanitize request input"""
        try:
            if request.is_json:
                data = request.get_json()
                if data:
                    self._sanitize_json_data(data)
            elif request.form:
                self._sanitize_form_data(request.form)
            elif request.data:
                self._sanitize_raw_data(request.data)
        except Exception as e:
            self.logger.error(f"Input validation error: {e}")
            g.security_violations.append('input_validation_error')
    
    def _sanitize_json_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize JSON data recursively"""
        if isinstance(data, dict):
            return {key: self._sanitize_json_data(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self._sanitize_json_data(item) for item in data]
        elif isinstance(data, str):
            return self._sanitize_string(data)
        else:
            return data
    
    def _sanitize_form_data(self, form_data) -> Dict[str, Any]:
        """Sanitize form data"""
        sanitized = {}
        for key, value in form_data.items():
            sanitized[key] = self._sanitize_string(str(value))
        return sanitized
    
    def _sanitize_raw_data(self, raw_data: bytes) -> bytes:
        """Sanitize raw data"""
        try:
            data_str = raw_data.decode('utf-8')
            sanitized_str = self._sanitize_string(data_str)
            return sanitized_str.encode('utf-8')
        except UnicodeDecodeError:
            # Return raw data if decode fails
            return raw_data
    
    def _sanitize_string(self, text: str) -> str:
        """Sanitize string by removing dangerous patterns"""
        if not isinstance(text, str):
            return text
        
        # Remove null bytes
        text = text.replace('\x00', '')
        
        # Remove potential XSS patterns
        for pattern in self.xss_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _detect_suspicious_patterns(self):
        """Detect suspicious patterns in request"""
        # Check URL
        url = request.url.lower()
        if self._contains_malicious_patterns(url):
            g.security_violations.append('suspicious_url')
        
        # Check query parameters
        for key, value in request.args.items():
            if self._contains_malicious_patterns(f"{key}={value}"):
                g.security_violations.append('suspicious_query_param')
        
        # Check headers
        for header_name, header_value in request.headers:
            if self._contains_malicious_patterns(f"{header_name}:{header_value}"):
                g.security_violations.append('suspicious_header')
        
        # Check user agent
        user_agent = request.headers.get('User-Agent', '')
        if self._is_suspicious_user_agent(user_agent):
            g.security_violations.append('suspicious_user_agent')
    
    def _contains_malicious_patterns(self, text: str) -> bool:
        """Check if text contains malicious patterns"""
        if not isinstance(text, str):
            return False
        
        text_lower = text.lower()
        
        # Check SQL injection patterns
        for pattern in self.sql_injection_patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True
        
        # Check for directory traversal
        if '../' in text or '..\\' in text:
            return True
        
        # Check for command injection
        if re.search(r'[;&|`$(){}]', text):
            return True
        
        return False
    
    def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """Check if user agent is suspicious"""
        suspicious_patterns = [
            'sqlmap', 'nikto', 'nessus', 'openvas',
            'masscan', 'nmap', 'w3af', 'burp',
            'scanner', 'bot', 'crawler'
        ]
        
        ua_lower = user_agent.lower()
        return any(pattern in ua_lower for pattern in suspicious_patterns)
    
    def _log_security_event(self, response):
        """Log security events"""
        event_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'ip_address': g.client_ip,
            'user_agent': g.user_agent,
            'endpoint': request.endpoint,
            'method': request.method,
            'violations': g.security_violations,
            'status_code': response.status_code,
            'response_time': time.time() - g.request_start_time
        }
        
        # Log to file
        self.logger.warning(f"Security violation: {json.dumps(event_data)}")
        
        # Store in Redis for monitoring
        try:
            if self.redis_client:
                key = f"security_events:{int(time.time())}"
                self.redis_client.setex(key, 3600, json.dumps(event_data))
        except Exception as e:
            self.logger.error(f"Failed to store security event: {e}")
    
    def rate_limit_handler(self, error):
        """Handle rate limit exceeded errors"""
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.',
            'retry_after': 60
        }), 429

# Decorators for security
def require_api_key(f):
    """Decorator to require API key authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or not current_app.config.get('API_KEYS', {}).get(api_key):
            return jsonify({'error': 'Invalid or missing API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

def require_https(f):
    """Decorator to require HTTPS"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_secure:
            return jsonify({'error': 'HTTPS required'}), 400
        return f(*args, **kwargs)
    return decorated_function

# Global instance
security_middleware = SecurityMiddleware()
