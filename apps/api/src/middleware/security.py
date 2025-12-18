#!/usr/bin/env python3
"""
Enhanced Security middleware for crazy-gary application
Implements comprehensive security headers, protection measures, input validation,
rate limiting, and performance monitoring for production Railway deployment
"""

from flask import request, make_response, g, current_app
import os
import time
import hashlib
import re
import html
import json
import logging
# Optional redis import with fallback
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    redis = None
    REDIS_AVAILABLE = False
from functools import wraps
from typing import Dict, Any, Optional, List, Union
from urllib.parse import urlparse, parse_qs
# Optional bleach import with fallback
try:
    import bleach
    BLEACH_AVAILABLE = True
except ImportError:
    bleach = None
    BLEACH_AVAILABLE = False
    import re
from marshmallow import Schema, fields, ValidationError
# Optional psutil import with fallback
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    psutil = None
    PSUTIL_AVAILABLE = False
from datetime import datetime, timedelta
import threading
from collections import defaultdict
import uuid


class SecurityConfig:
    """Configuration class for security settings"""
    
    def __init__(self):
        self.environment = os.getenv('ENVIRONMENT', 'development')
        self.railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', '')
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.rate_limit_rps = int(os.getenv('RATE_LIMIT_RPS', 10))
        self.rate_limit_burst = int(os.getenv('RATE_LIMIT_BURST', 100))
        self.max_request_size = int(os.getenv('MAX_REQUEST_SIZE', 16 * 1024 * 1024))
        self.allowed_hosts = os.getenv('ALLOWED_HOSTS', '').split(',')
        self.api_key = os.getenv('API_KEY', '')
        self.jwt_secret = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
        self.allowed_origins = os.getenv('CORS_ORIGINS', '*').split(',')
        self.enable_security_logging = os.getenv('ENABLE_SECURITY_LOGGING', 'true').lower() == 'true'
        self.enable_performance_monitoring = os.getenv('ENABLE_PERFORMANCE_MONITORING', 'true').lower() == 'true'
        self.suspicious_patterns = self._load_suspicious_patterns()
    
    def _load_suspicious_patterns(self) -> List[str]:
        """Load patterns that indicate suspicious activity"""
        return [
            r'(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute)',
            r'(?i)(script|javascript|vbscript|onload|onerror|onclick)',
            r'(?i)(<script|</script|javascript:|vbscript:)',
            r'(?i)(sql\s+injection|xss|csrf|crlf)',
            r'(?i)(../../../|\.\.\\\.\\\.\\/)',  # Path traversal
            r'(?i)(cmd\.exe|powershell|/bin/|/etc/passwd)',  # System commands
            r'[\x00-\x1f\x7f-\x9f]',  # Control characters
        ]


class RedisRateLimiter:
    """Redis-based rate limiter for production environments"""
    
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.redis_client = None
        self._memory_cache = defaultdict(list)
        self._initialized = False
        self._logger = logging.getLogger('security.ratelimit')
    
    def _initialize(self):
        """Initialize Redis connection lazily"""
        if self._initialized:
            return
            
        if not REDIS_AVAILABLE or redis is None:
            self._logger.warning("Redis library not available, using memory-based rate limiting")
            self.redis_client = None
            self._initialized = True
            return
            
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            self.redis_client.ping()  # Test connection
            self._logger.info("Redis connection established successfully")
        except Exception as e:
            self._logger.warning(f"Redis connection failed, falling back to memory: {e}")
            self.redis_client = None
        
        self._initialized = True
    
    def check_rate_limit(self, key: str, limit: int, window: int) -> bool:
        """Check if request is within rate limit"""
        # Ensure Redis connection is initialized
        self._initialize()
        
        current_time = int(time.time())
        
        if self.redis_client:
            # Use Redis sorted set for sliding window
            pipe = self.redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, current_time - window)
            pipe.zcard(key)
            pipe.zadd(key, {str(uuid.uuid4()): current_time})
            pipe.expire(key, window)
            results = pipe.execute()
            current_requests = results[1]
        else:
            # Fallback to memory cache
            if key not in self._memory_cache:
                self._memory_cache[key] = []
            
            # Remove old entries
            self._memory_cache[key] = [
                req_time for req_time in self._memory_cache[key]
                if current_time - req_time < window
            ]
            
            # Add current request
            self._memory_cache[key].append(current_time)
            current_requests = len(self._memory_cache[key])
        
        return current_requests <= limit


class InputValidator:
    """Comprehensive input validation and sanitization"""
    
    # Class-level logger to avoid Flask context issues
    _logger = logging.getLogger('security.validator')
    
    # Dangerous patterns to block
    DANGEROUS_PATTERNS = [
        r'(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute)',
        r'(?i)(script|javascript|vbscript|onload|onerror|onclick)',
        r'(?i)(<script|</script|javascript:|vbscript:)',
        r'(?i)(sql\s+injection|xss|csrf|crlf)',
        r'(?i)(../../../|\.\.\\\.\\\.\\/)',
        r'(?i)(cmd\.exe|powershell|/bin/|/etc/passwd)',
        r'[\x00-\x1f\x7f-\x9f]',
    ]
    
    # Allowed HTML tags for content sanitization
    ALLOWED_TAGS = ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li']
    
    @classmethod
    def validate_input(cls, data: Union[str, dict, list], field_name: str = "") -> tuple[bool, Any]:
        """Validate and sanitize input data"""
        try:
            # String validation
            if isinstance(data, str):
                return cls._validate_string(data, field_name)
            
            # Dictionary validation
            elif isinstance(data, dict):
                sanitized = {}
                for key, value in data.items():
                    if not cls._validate_key(key):
                        return False, None
                    valid, sanitized_value = cls.validate_input(value, key)
                    if not valid:
                        return False, None
                    sanitized[key] = sanitized_value
                return True, sanitized
            
            # List validation
            elif isinstance(data, list):
                sanitized = []
                for i, item in enumerate(data):
                    valid, sanitized_item = cls.validate_input(item, f"{field_name}[{i}]")
                    if not valid:
                        return False, None
                    sanitized.append(sanitized_item)
                return True, sanitized
            
            # Other types
            else:
                return True, data
                
        except Exception as e:
            cls._logger.warning(f"Input validation error for {field_name}: {e}")
            return False, None
    
    @classmethod
    def _validate_string(cls, data: str, field_name: str) -> tuple[bool, str]:
        """Validate and sanitize a string"""
        if not isinstance(data, str):
            return False, None
        
        # Check for dangerous patterns
        for pattern in cls.DANGEROUS_PATTERNS:
            if re.search(pattern, data):
                cls._logger.warning(
                    f"Dangerous pattern detected in {field_name}: {pattern}"
                )
                return False, None
        
        # Sanitize HTML content
        if '<' in data and '>' in data:
            if BLEACH_AVAILABLE and bleach:
                sanitized = bleach.clean(data, tags=cls.ALLOWED_TAGS, strip=True)
            else:
                # Fallback HTML sanitizer when bleach is not available
                sanitized = cls._fallback_html_sanitizer(data)
        else:
            sanitized = data
        
        # Length validation
        if len(sanitized) > 10000:  # 10KB limit
            cls._logger.warning(f"Input too long for {field_name}")
            return False, None
        
        return True, sanitized
    
    @classmethod
    def _fallback_html_sanitizer(cls, content: str) -> str:
        """Fallback HTML sanitizer when bleach is not available"""
        if not BLEACH_AVAILABLE:
            # Log warning about missing bleach
            if hasattr(cls, '_logger') and cls._logger:
                cls._logger.warning(
                    "bleach library not available, using basic HTML sanitization. "
                    "Consider installing bleach for better security."
                )
        
        # Basic HTML sanitization - remove all tags except allowed ones
        import re
        
        # First, remove all script tags and their content
        content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove dangerous tags
        dangerous_tags = ['script', 'object', 'embed', 'link', 'style', 'iframe', 'frame', 'frameset', 
                         'noframes', 'noscript', 'applet', 'base', 'head', 'html', 'body']
        for tag in dangerous_tags:
            content = re.sub(f'<{tag}[^>]*>.*?</{tag}>', '', content, flags=re.IGNORECASE | re.DOTALL)
            content = re.sub(f'<{tag}[^>]*/?>', '', content, flags=re.IGNORECASE)
        
        # Remove dangerous attributes
        # Use raw strings for regex patterns
        content = re.sub(r'on\w+="[^"]*"', '', content, flags=re.IGNORECASE)
        content = re.sub(r'on\w+=[^\s>]+\s', '', content, flags=re.IGNORECASE)
        content = re.sub(r'javascript:"[^"]*"', '', content, flags=re.IGNORECASE)
        content = re.sub(r'javascript=[^\s>]+\s', '', content, flags=re.IGNORECASE)
        content = re.sub(r'vbscript:"[^"]*"', '', content, flags=re.IGNORECASE)
        content = re.sub(r'vbscript=[^\s>]+\s', '', content, flags=re.IGNORECASE)
        
        # Only keep allowed tags - remove all others
        allowed_tags_pattern = '|'.join([f'<{tag}[^>]*/?>' for tag in cls.ALLOWED_TAGS])
        # Remove tags not in allowed list
        content = re.sub(f'<(?!(?:{"|".join(cls.ALLOWED_TAGS)}))[^>]+>', '', content)
        
        return content.strip()
    
    @classmethod
    def _validate_key(cls, key: str) -> bool:
        """Validate dictionary key"""
        if not isinstance(key, str):
            return False
        
        # Check for dangerous patterns in keys
        for pattern in cls.DANGEROUS_PATTERNS:
            if re.search(pattern, key):
                return False
        
        # Check key length
        if len(key) > 100:
            return False
        
        return True


class SecurityLogger:
    """Security event logging and monitoring"""
    
    def __init__(self, enable_logging: bool = True):
        self.enable_logging = enable_logging
        if enable_logging:
            self.logger = logging.getLogger('security')
            self.logger.setLevel(logging.WARNING)
            
            # Create file handler
            file_handler = logging.FileHandler('security.log')
            file_handler.setLevel(logging.WARNING)
            
            # Create formatter
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    def log_security_event(self, event_type: str, details: Dict[str, Any], 
                          request_data: Optional[Dict] = None):
        """Log security events"""
        if not self.enable_logging:
            return
        
        event_data = {
            'event_type': event_type,
            'details': details,
            'timestamp': datetime.utcnow().isoformat(),
            'request_id': getattr(g, 'request_id', str(uuid.uuid4()))
        }
        
        if request_data:
            event_data.update(request_data)
        
        self.logger.warning(f"Security event: {event_type}", extra=event_data)
    
    def log_rate_limit_exceeded(self, client_ip: str, endpoint: str):
        """Log rate limit violations"""
        self.log_security_event(
            'RATE_LIMIT_EXCEEDED',
            {'client_ip': client_ip, 'endpoint': endpoint}
        )
    
    def log_suspicious_input(self, client_ip: str, field: str, value: str):
        """Log suspicious input attempts"""
        self.log_security_event(
            'SUSPICIOUS_INPUT',
            {'client_ip': client_ip, 'field': field, 'value_preview': value[:100]}
        )
    
    def log_auth_failure(self, client_ip: str, reason: str):
        """Log authentication failures"""
        self.log_security_event(
            'AUTH_FAILURE',
            {'client_ip': client_ip, 'reason': reason}
        )


class PerformanceMonitor:
    """Performance monitoring for API endpoints"""
    
    def __init__(self, enable_monitoring: bool = True):
        self.enable_monitoring = enable_monitoring
        self.request_metrics = defaultdict(list)
        self._lock = threading.Lock()
    
    def record_request(self, endpoint: str, duration: float, status_code: int):
        """Record request metrics"""
        if not self.enable_monitoring:
            return
        
        with self._lock:
            self.request_metrics[endpoint].append({
                'timestamp': time.time(),
                'duration': duration,
                'status_code': status_code
            })
            
            # Keep only last 1000 requests per endpoint
            if len(self.request_metrics[endpoint]) > 1000:
                self.request_metrics[endpoint] = self.request_metrics[endpoint][-1000:]
    
    def get_metrics(self, endpoint: str) -> Dict[str, Any]:
        """Get performance metrics for an endpoint"""
        if not self.enable_monitoring or endpoint not in self.request_metrics:
            return {}
        
        metrics = self.request_metrics[endpoint]
        if not metrics:
            return {}
        
        durations = [m['duration'] for m in metrics]
        status_codes = [m['status_code'] for m in metrics]
        
        return {
            'total_requests': len(metrics),
            'avg_duration': sum(durations) / len(durations),
            'min_duration': min(durations),
            'max_duration': max(durations),
            'p95_duration': sorted(durations)[int(len(durations) * 0.95)],
            'p99_duration': sorted(durations)[int(len(durations) * 0.99)],
            'success_rate': len([s for s in status_codes if s < 400]) / len(status_codes),
            'error_rate': len([s for s in status_codes if s >= 400]) / len(status_codes)
        }
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system performance metrics"""
        if not PSUTIL_AVAILABLE or psutil is None:
            return {'status': 'psutil_not_available'}
            
        try:
            return {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent,
                'active_connections': len(psutil.net_connections())
            }
        except Exception as e:
            return {'error': str(e)}


class SecurityHeaders:
    """Enhanced security headers middleware for Flask applications"""
    
    def __init__(self, app=None, config: Optional[SecurityConfig] = None):
        self.app = app
        self.config = config or SecurityConfig()
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize security headers with Flask app"""
        app.after_request(self.add_security_headers)
        app.before_request(self.security_checks)
    
    def add_security_headers(self, response):
        """Add comprehensive security headers to all responses"""
        # Content Security Policy
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' ws: wss:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "media-src 'self'",
            "worker-src 'none'",
            "child-src 'none'",
            "manifest-src 'self'"
        ]
        
        # Add Railway domain to CSP if available
        if self.config.railway_domain:
            csp_directives.extend([
                f"connect-src 'self' ws: wss: https://{self.config.railway_domain}",
                f"frame-src 'self' https://{self.config.railway_domain}"
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
                'payment=(), usb=(), magnetometer=(), gyroscope=(), '
                'accelerometer=(), bluetooth=(), display-capture=(), '
                'encrypted-media=(), fullscreen=(self), midi=(), '
                'picture-in-picture=(), screen-wake-lock=()'
            ),
            'X-Permitted-Cross-Domain-Policies': 'none',
            'X-Download-Options': 'noopen',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
        
        # Add HSTS for production
        if self.config.environment == 'production' and request.scheme == 'https':
            security_headers['Strict-Transport-Security'] = (
                'max-age=31536000; includeSubDomains; preload'
            )
        
        # Add security headers to response
        for header, value in security_headers.items():
            response.headers[header] = value
        
        # Remove server header for security
        response.headers.pop('Server', None)
        
        # Add custom security headers for development
        if self.config.environment != 'production':
            response.headers['X-Development-Mode'] = 'true'
        
        return response
    
    def security_checks(self):
        """Perform comprehensive security checks before handling requests"""
        # Generate request ID for tracking
        g.request_id = str(uuid.uuid4())
        g.start_time = time.time()
        
        # Rate limiting check
        self._check_rate_limit()
        
        # Request size check
        self._check_request_size()
        
        # Host header validation
        self._validate_host_header()
        
        # Input validation and sanitization
        self._validate_request_input()
        
        # Suspicious pattern detection
        self._check_suspicious_patterns()
        
        # Method validation
        self._validate_http_method()
        
        # User-Agent validation
        self._validate_user_agent()
        
        # Additional security headers validation
        self._validate_security_headers()
    
    def _check_rate_limit(self):
        """Enhanced rate limiting with Redis support"""
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        endpoint = request.endpoint or 'unknown'
        
        # Create rate limiter
        if not hasattr(g, 'rate_limiter'):
            g.rate_limiter = RedisRateLimiter(self.config.redis_url)
        
        # Check rate limit
        key = f"rate_limit:{client_ip}:{endpoint}"
        if not g.rate_limiter.check_rate_limit(key, self.config.rate_limit_rps, 60):
            SecurityLogger(self.config.enable_security_logging).log_rate_limit_exceeded(
                client_ip, endpoint
            )
            from flask import abort
            abort(429)  # Too Many Requests
        
        # Also check burst limit
        burst_key = f"burst_limit:{client_ip}"
        if not g.rate_limiter.check_rate_limit(burst_key, self.config.rate_limit_burst, 300):
            SecurityLogger(self.config.enable_security_logging).log_rate_limit_exceeded(
                client_ip, f"{endpoint}_burst"
            )
            from flask import abort
            abort(429)
    
    def _check_request_size(self):
        """Enhanced request size validation"""
        if request.content_length and request.content_length > self.config.max_request_size:
            SecurityLogger(self.config.enable_security_logging).log_security_event(
                'LARGE_REQUEST',
                {
                    'content_length': request.content_length,
                    'max_allowed': self.config.max_request_size
                }
            )
            from flask import abort
            abort(413)  # Payload Too Large
    
    def _validate_host_header(self):
        """Enhanced Host header validation"""
        if not request.host:
            return
        
        # Add Railway domain and localhost to allowed hosts
        allowed_hosts = self.config.allowed_hosts.copy()
        if self.config.railway_domain:
            allowed_hosts.append(self.config.railway_domain)
        
        # Allow localhost for development
        if self.config.environment != 'production':
            allowed_hosts.extend(['localhost', '127.0.0.1', '0.0.0.0'])
        
        # Check if host is allowed
        host_valid = False
        for allowed_host in allowed_hosts:
            if not allowed_host.strip():
                continue
            
            if '*' in allowed_host:
                # Wildcard matching
                pattern = allowed_host.replace('*', '.*')
                if re.match(pattern, request.host):
                    host_valid = True
                    break
            elif request.host == allowed_host:
                host_valid = True
                break
        
        if not host_valid:
            SecurityLogger(self.config.enable_security_logging).log_security_event(
                'INVALID_HOST_HEADER',
                {'host': request.host, 'allowed_hosts': allowed_hosts}
            )
            from flask import abort
            abort(400)  # Bad Request
    
    def _validate_request_input(self):
        """Validate and sanitize request input"""
        try:
            # Validate JSON data
            if request.is_json:
                data = request.get_json()
                if data:
                    valid, sanitized = InputValidator.validate_input(data)
                    if not valid:
                        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
                        SecurityLogger(self.config.enable_security_logging).log_security_event(
                            'INVALID_INPUT',
                            {'client_ip': client_ip, 'data': str(data)[:100]}
                        )
                        from flask import abort
                        abort(400)
                    
                    # Store sanitized data for use in the view
                    g.sanitized_data = sanitized
            
            # Validate form data
            if request.form:
                for key, value in request.form.items():
                    if not isinstance(key, str) or not isinstance(value, str):
                        continue
                    
                    valid, _ = InputValidator.validate_input(value, key)
                    if not valid:
                        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
                        SecurityLogger(self.config.enable_security_logging).log_suspicious_input(
                            client_ip, key, value
                        )
                        from flask import abort
                        abort(400)
            
            # Validate query parameters
            if request.args:
                for key, value in request.args.items():
                    if not isinstance(key, str) or not isinstance(value, str):
                        continue
                    
                    valid, _ = InputValidator.validate_input(value, f"query_{key}")
                    if not valid:
                        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
                        SecurityLogger(self.config.enable_security_logging).log_suspicious_input(
                            client_ip, f"query_{key}", value
                        )
                        from flask import abort
                        abort(400)
                        
        except Exception as e:
            try:
                current_app.logger.error(f"Input validation error: {e}")
            except RuntimeError:
                # Fallback if not in app context
                logging.getLogger('security').error(f"Input validation error: {e}")
            from flask import abort
            abort(400)
    
    def _check_suspicious_patterns(self):
        """Check for suspicious patterns in request"""
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        
        # Check URL path
        path = request.path
        for pattern in self.config.suspicious_patterns:
            if re.search(pattern, path):
                SecurityLogger(self.config.enable_security_logging).log_security_event(
                    'SUSPICIOUS_PATH',
                    {'client_ip': client_ip, 'path': path, 'pattern': pattern}
                )
                from flask import abort
                abort(400)
        
        # Check query string
        if request.query_string:
            query_str = request.query_string.decode('utf-8', errors='ignore')
            for pattern in self.config.suspicious_patterns:
                if re.search(pattern, query_str):
                    SecurityLogger(self.config.enable_security_logging).log_security_event(
                        'SUSPICIOUS_QUERY',
                        {'client_ip': client_ip, 'query': query_str, 'pattern': pattern}
                    )
                    from flask import abort
                    abort(400)
    
    def _validate_http_method(self):
        """Validate HTTP method"""
        allowed_methods = {'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'}
        if request.method not in allowed_methods:
            SecurityLogger(self.config.enable_security_logging).log_security_event(
                'INVALID_HTTP_METHOD',
                {'method': request.method}
            )
            from flask import abort
            abort(405)  # Method Not Allowed
    
    def _validate_user_agent(self):
        """Validate User-Agent header"""
        user_agent = request.headers.get('User-Agent', '')
        
        # Check for suspicious user agents
        suspicious_agents = [
            'bot', 'crawler', 'spider', 'scraper',
            'sqlmap', 'nmap', 'nikto', 'dirb'
        ]
        
        for suspicious in suspicious_agents:
            if suspicious.lower() in user_agent.lower():
                SecurityLogger(self.config.enable_security_logging).log_security_event(
                    'SUSPICIOUS_USER_AGENT',
                    {'user_agent': user_agent}
                )
                break
        
        # Check for empty or very short user agents
        if len(user_agent) < 10 and 'localhost' not in request.host:
            SecurityLogger(self.config.enable_security_logging).log_security_event(
                'MISSING_USER_AGENT',
                {'user_agent': user_agent}
            )
    
    def _validate_security_headers(self):
        """Validate incoming security headers"""
        # Check for potentially malicious headers
        dangerous_headers = [
            'X-Forwarded-Host',
            'X-Original-URL',
            'X-Rewrite-URL'
        ]
        
        for header in dangerous_headers:
            if header in request.headers:
                SecurityLogger(self.config.enable_security_logging).log_security_event(
                    'DANGEROUS_HEADER',
                    {'header': header, 'value': request.headers[header]}
                )
                from flask import abort
                abort(400)


def require_api_key(f):
    """Enhanced decorator to require API key for sensitive endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        
        if not api_key or api_key != SecurityConfig().api_key:
            SecurityLogger(SecurityConfig().enable_security_logging).log_auth_failure(
                client_ip, 'Invalid API key'
            )
            from flask import abort
            abort(401)  # Unauthorized
        
        return f(*args, **kwargs)
    return decorated_function


def require_auth_token(f):
    """Enhanced decorator to require JWT token for protected endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        
        if not auth_header or not auth_header.startswith('Bearer '):
            SecurityLogger(SecurityConfig().enable_security_logging).log_auth_failure(
                client_ip, 'Missing or invalid Authorization header'
            )
            from flask import abort
            abort(401)  # Unauthorized
        
        token = auth_header.split(' ')[1]
        
        # Validate token using enhanced JWT validation
        try:
            if not validate_jwt_token(token):
                SecurityLogger(SecurityConfig().enable_security_logging).log_auth_failure(
                    client_ip, 'Invalid JWT token'
                )
                from flask import abort
                abort(401)  # Unauthorized
            
            # Parse and store user info from token
            payload = parse_jwt_payload(token)
            g.user_id = payload.get('user_id')
            g.user_role = payload.get('role', 'user')
            
        except Exception as e:
            try:
                current_app.logger.error(f"JWT validation error: {e}")
            except RuntimeError:
                logging.getLogger('security').error(f"JWT validation error: {e}")
            SecurityLogger(SecurityConfig().enable_security_logging).log_auth_failure(
                client_ip, f'JWT validation error: {str(e)}'
            )
            from flask import abort
            abort(401)  # Unauthorized
        
        return f(*args, **kwargs)
    return decorated_function


def validate_jwt_token(token: str) -> bool:
    """Enhanced JWT token validation"""
    try:
        import jwt
        secret = SecurityConfig().jwt_secret
        
        # Decode and validate token
        payload = jwt.decode(
            token, 
            secret, 
            algorithms=['HS256'],
            options={'verify_exp': True, 'verify_nbf': True, 'verify_iat': True}
        )
        
        # Additional validation checks
        if not payload.get('user_id'):
            return False
        
        # Check if token is blacklisted (implement Redis blacklist check)
        # This is a placeholder - implement actual blacklist checking
        return True
        
    except jwt.ExpiredSignatureError:
        try:
            current_app.logger.warning("JWT token expired")
        except RuntimeError:
            logging.getLogger('security').warning("JWT token expired")
        return False
    except jwt.InvalidTokenError:
        try:
            current_app.logger.warning("Invalid JWT token")
        except RuntimeError:
            logging.getLogger('security').warning("Invalid JWT token")
        return False
    except Exception as e:
        try:
            current_app.logger.error(f"JWT validation error: {e}")
        except RuntimeError:
            logging.getLogger('security').error(f"JWT validation error: {e}")
        return False


def parse_jwt_payload(token: str) -> Dict[str, Any]:
    """Parse JWT payload"""
    import jwt
    secret = SecurityConfig().jwt_secret
    return jwt.decode(
        token, 
        secret, 
        algorithms=['HS256'],
        options={'verify_exp': True, 'verify_nbf': True, 'verify_iat': True}
    )


def require_role(required_role: str):
    """Decorator to require specific role for endpoints"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_role = getattr(g, 'user_role', 'user')
            
            # Role hierarchy check
            role_hierarchy = {
                'admin': 3,
                'moderator': 2,
                'user': 1,
                'guest': 0
            }
            
            user_level = role_hierarchy.get(user_role, 0)
            required_level = role_hierarchy.get(required_role, 0)
            
            if user_level < required_level:
                SecurityLogger(SecurityConfig().enable_security_logging).log_auth_failure(
                    request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
                    f'Insufficient role: {user_role} < {required_role}'
                )
                from flask import abort
                abort(403)  # Forbidden
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def require_https(f):
    """Decorator to require HTTPS in production"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if SecurityConfig().environment == 'production' and request.scheme != 'https':
            from flask import abort, url_for
            # Redirect to HTTPS
            secure_url = url_for(
                request.endpoint, 
                _scheme='https', 
                _external=True,
                **request.view_args
            )
            return secure_url, 301
        return f(*args, **kwargs)
    return decorated_function


def validate_request_schema(schema_class):
    """Decorator to validate request against a schema"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Get request data
                if request.is_json:
                    data = request.get_json() or {}
                elif request.form:
                    data = request.form.to_dict()
                else:
                    data = {}
                
                # Validate against schema
                schema = schema_class()
                result = schema.load(data)
                
                # Store validated data
                g.validated_data = result
                
            except ValidationError as e:
                try:
                    current_app.logger.warning(f"Schema validation error: {e.messages}")
                except RuntimeError:
                    logging.getLogger('security').warning(f"Schema validation error: {e.messages}")
                SecurityLogger(SecurityConfig().enable_security_logging).log_security_event(
                    'SCHEMA_VALIDATION_ERROR',
                    {'errors': e.messages}
                )
                from flask import abort
                return {'error': 'Validation failed', 'details': e.messages}, 400
            
            except Exception as e:
                try:
                    current_app.logger.error(f"Request validation error: {e}")
                except RuntimeError:
                    logging.getLogger('security').error(f"Request validation error: {e}")
                from flask import abort
                abort(400)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def monitor_performance(f):
    """Decorator to monitor endpoint performance"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        try:
            response = f(*args, **kwargs)
            status_code = response[1] if isinstance(response, tuple) else 200
            
        except Exception as e:
            status_code = 500
            raise
        
        finally:
            duration = time.time() - start_time
            endpoint = request.endpoint or 'unknown'
            
            # Record performance metrics
            if hasattr(g, 'performance_monitor'):
                g.performance_monitor.record_request(endpoint, duration, status_code)
        
        return response
    return decorated_function


def scan_vulnerability(f):
    """Decorator to scan for vulnerabilities in request"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for common vulnerability patterns
        vulnerability_patterns = [
            r'(?i)(union\s+select|select\s+.*\s+from|drop\s+table|insert\s+into)',
            r'(?i)(<script|javascript:|onload=|onerror=)',
            r'(?i)(../../../|\.\.\\\.\\\.\\/)',
            r'(?i)(cmd\.exe|powershell|/bin/bash|sh)',
            r'(?i)(etc/passwd|etc/shadow|boot.ini|win.ini)',
            r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]',
        ]
        
        # Scan various parts of the request
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        
        # Scan URL path
        for pattern in vulnerability_patterns:
            if re.search(pattern, request.path):
                SecurityLogger(SecurityConfig().enable_security_logging).log_security_event(
                    'VULNERABILITY_SCAN_PATH',
                    {'client_ip': client_ip, 'path': request.path, 'pattern': pattern}
                )
                from flask import abort
                abort(400)
        
        # Scan query parameters
        if request.query_string:
            query_str = request.query_string.decode('utf-8', errors='ignore')
            for pattern in vulnerability_patterns:
                if re.search(pattern, query_str):
                    SecurityLogger(SecurityConfig().enable_security_logging).log_security_event(
                        'VULNERABILITY_SCAN_QUERY',
                        {'client_ip': client_ip, 'query': query_str, 'pattern': pattern}
                    )
                    from flask import abort
                    abort(400)
        
        # Scan request body
        try:
            if request.is_json:
                data = request.get_json()
                if data:
                    data_str = json.dumps(data)
                    for pattern in vulnerability_patterns:
                        if re.search(pattern, data_str):
                            SecurityLogger(SecurityConfig().enable_security_logging).log_security_event(
                                'VULNERABILITY_SCAN_BODY',
                                {'client_ip': client_ip, 'pattern': pattern}
                            )
                            from flask import abort
                            abort(400)
        except:
            pass  # Skip body scan if can't parse JSON
        
        return f(*args, **kwargs)
    return decorated_function


def setup_security(app):
    """Enhanced security setup for the Flask app"""
    config = SecurityConfig()
    
    # Initialize security headers with configuration
    SecurityHeaders(app, config)
    
    # Initialize performance monitoring
    performance_monitor = PerformanceMonitor(config.enable_performance_monitoring)
    
    # Store security components in app context
    app.config['SECURITY_CONFIG'] = config
    app.config['PERFORMANCE_MONITOR'] = performance_monitor
    app.config['SECURITY_LOGGER'] = SecurityLogger(config.enable_security_logging)
    
    # Add enhanced CORS headers
    @app.after_request
    def add_cors_headers(response):
        """Enhanced CORS headers with security"""
        origin = request.headers.get('Origin')
        
        # Check if origin is allowed
        allowed_origins = config.allowed_origins
        if origin in allowed_origins or '*' in allowed_origins:
            if '*' in allowed_origins and config.environment == 'development':
                response.headers['Access-Control-Allow-Origin'] = '*'
            elif origin:
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Vary'] = 'Origin'
        
        # Security-focused CORS headers
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = (
            'Content-Type, Authorization, X-Requested-With, X-API-Key, '
            'X-CSRF-Token, Accept, Accept-Language, Content-Length'
        )
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
        response.headers['Access-Control-Expose-Headers'] = 'X-Request-ID'
        
        return response
    
    # Handle OPTIONS requests for CORS preflight
    @app.before_request
    def handle_preflight():
        """Handle CORS preflight requests"""
        if request.method == 'OPTIONS':
            response = make_response()
            origin = request.headers.get('Origin')
            allowed_origins = config.allowed_origins
            
            if origin in allowed_origins or '*' in allowed_origins:
                if '*' in allowed_origins and config.environment == 'development':
                    response.headers.add("Access-Control-Allow-Origin", "*")
                elif origin:
                    response.headers.add("Access-Control-Allow-Origin", origin)
                    response.headers.add('Vary', 'Origin')
            
            response.headers.add('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, PATCH, OPTIONS")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Max-Age', '86400')
            return response
    
    # Enhanced error handlers
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        """Enhanced rate limit error handler"""
        app.config['SECURITY_LOGGER'].log_security_event(
            'RATE_LIMIT_ERROR',
            {'error': str(error)}
        )
        
        response = {
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please slow down.',
            'retry_after': 60,
            'request_id': getattr(g, 'request_id', None)
        }
        
        return response, 429
    
    @app.errorhandler(413)
    def payload_too_large(error):
        """Enhanced payload too large error handler"""
        app.config['SECURITY_LOGGER'].log_security_event(
            'PAYLOAD_TOO_LARGE',
            {'error': str(error)}
        )
        
        response = {
            'error': 'Payload too large',
            'message': 'Request payload exceeds maximum allowed size',
            'max_size': f"{config.max_request_size // (1024*1024)}MB",
            'request_id': getattr(g, 'request_id', None)
        }
        
        return response, 413
    
    @app.errorhandler(400)
    def bad_request(error):
        """Enhanced bad request error handler"""
        app.config['SECURITY_LOGGER'].log_security_event(
            'BAD_REQUEST_ERROR',
            {'error': str(error)}
        )
        
        response = {
            'error': 'Bad request',
            'message': 'Invalid request format or parameters',
            'request_id': getattr(g, 'request_id', None)
        }
        
        return response, 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        """Enhanced unauthorized error handler"""
        app.config['SECURITY_LOGGER'].log_security_event(
            'UNAUTHORIZED_ERROR',
            {'error': str(error)}
        )
        
        response = {
            'error': 'Unauthorized',
            'message': 'Authentication required or invalid credentials',
            'request_id': getattr(g, 'request_id', None)
        }
        
        return response, 401
    
    @app.errorhandler(403)
    def forbidden(error):
        """Enhanced forbidden error handler"""
        app.config['SECURITY_LOGGER'].log_security_event(
            'FORBIDDEN_ERROR',
            {'error': str(error)}
        )
        
        response = {
            'error': 'Forbidden',
            'message': 'Insufficient permissions to access this resource',
            'request_id': getattr(g, 'request_id', None)
        }
        
        return response, 403
    
    @app.errorhandler(404)
    def not_found(error):
        """Enhanced not found error handler"""
        # Don't log 404s for security reasons (avoid information disclosure)
        response = {
            'error': 'Not found',
            'message': 'The requested resource was not found',
            'request_id': getattr(g, 'request_id', None)
        }
        
        return response, 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """Enhanced method not allowed error handler"""
        app.config['SECURITY_LOGGER'].log_security_event(
            'METHOD_NOT_ALLOWED',
            {'error': str(error), 'method': request.method}
        )
        
        response = {
            'error': 'Method not allowed',
            'message': f'The {request.method} method is not allowed for this endpoint',
            'allowed_methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'request_id': getattr(g, 'request_id', None)
        }
        
        return response, 405
    
    @app.errorhandler(500)
    def internal_server_error(error):
        """Enhanced internal server error handler"""
        app.config['SECURITY_LOGGER'].log_security_event(
            'INTERNAL_SERVER_ERROR',
            {'error': str(error), 'traceback': str(error.__traceback__)}
        )
        
        response = {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred',
            'request_id': getattr(g, 'request_id', None)
        }
        
        return response, 500
    
    # Add performance monitoring to all requests
    @app.after_request
    def monitor_performance(response):
        """Monitor request performance"""
        if config.enable_performance_monitoring and hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            endpoint = request.endpoint or 'unknown'
            status_code = response.status_code
            
            performance_monitor.record_request(endpoint, duration, status_code)
        
        # Add request ID to response headers
        if hasattr(g, 'request_id'):
            response.headers['X-Request-ID'] = g.request_id
        
        return response
    
    # Add security monitoring endpoint
    @app.route('/api/security/metrics')
    @require_api_key
    def security_metrics():
        """Get security and performance metrics"""
        metrics = {
            'security': {
                'total_requests': getattr(g, 'total_requests', 0),
                'blocked_requests': getattr(g, 'blocked_requests', 0),
                'suspicious_activity': getattr(g, 'suspicious_activity', 0)
            },
            'performance': performance_monitor.get_system_metrics(),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add endpoint-specific metrics
        if request.args.get('endpoint'):
            endpoint = request.args.get('endpoint')
            metrics['performance']['endpoints'] = {
                endpoint: performance_monitor.get_metrics(endpoint)
            }
        
        return metrics
    
    # Add security health check endpoint
    @app.route('/api/security/health')
    def security_health():
        """Security system health check"""
        health = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'components': {
                'security_headers': 'enabled',
                'rate_limiting': 'enabled',
                'input_validation': 'enabled',
                'logging': 'enabled' if config.enable_security_logging else 'disabled',
                'monitoring': 'enabled' if config.enable_performance_monitoring else 'disabled'
            }
        }
        
        # Test Redis connection if configured
        if config.redis_url != 'redis://localhost:6379':
            try:
                if REDIS_AVAILABLE and redis:
                    redis_client = redis.from_url(config.redis_url)
                    redis_client.ping()
                    health['components']['redis'] = 'connected'
                else:
                    health['components']['redis'] = 'library_not_available'
            except Exception:
                health['components']['redis'] = 'disconnected'
                health['status'] = 'degraded'
        
        status_code = 200 if health['status'] == 'healthy' else 503
        return health, status_code


# Additional security utilities

def create_secure_session(user_id: str, role: str = 'user', expires_in: int = 3600) -> str:
    """Create a secure session token"""
    import jwt
    import time
    
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': time.time() + expires_in,
        'iat': time.time(),
        'session_id': str(uuid.uuid4())
    }
    
    return jwt.encode(payload, SecurityConfig().jwt_secret, algorithm='HS256')


def invalidate_session(token: str) -> bool:
    """Invalidate a session token (add to blacklist)"""
    try:
        # In a production system, you would add the token to a Redis blacklist
        # This is a placeholder implementation
        try:
            current_app.logger.info(f"Invalidating session: {token[:20]}...")
        except RuntimeError:
            logging.getLogger('security').info(f"Invalidating session: {token[:20]}...")
        return True
    except Exception as e:
        try:
            current_app.logger.error(f"Session invalidation error: {e}")
        except RuntimeError:
            logging.getLogger('security').error(f"Session invalidation error: {e}")
        return False


def check_suspicious_activity(ip_address: str, timeframe: int = 300) -> Dict[str, Any]:
    """Check for suspicious activity from an IP address"""
    # This would typically query a database or Redis for activity patterns
    # Placeholder implementation
    return {
        'ip_address': ip_address,
        'suspicious_score': 0,
        'recent_requests': 0,
        'blocked_attempts': 0,
        'risk_level': 'low'
    }


def get_client_info(request) -> Dict[str, str]:
    """Extract client information from request"""
    return {
        'ip': request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
        'user_agent': request.headers.get('User-Agent', ''),
        'accept_language': request.headers.get('Accept-Language', ''),
        'referer': request.headers.get('Referer', ''),
        'origin': request.headers.get('Origin', '')
    }


def sanitize_html_content(content: str) -> str:
    """Sanitize HTML content using bleach or fallback"""
    if BLEACH_AVAILABLE and bleach:
        return bleach.clean(
            content, 
            tags=InputValidator.ALLOWED_TAGS,
            attributes={},
            protocols=['http', 'https', 'mailto'],
            strip=True
        )
    else:
        # Use fallback sanitizer
        return InputValidator._fallback_html_sanitizer(content)


def generate_csrf_token() -> str:
    """Generate a CSRF token"""
    import secrets
    return secrets.token_urlsafe(32)


def validate_csrf_token(token: str, session_token: str) -> bool:
    """Validate CSRF token"""
    import hmac
    import hashlib
    
    if not token or not session_token:
        return False
    
    # Simple token comparison (in production, use HMAC validation)
    return hmac.compare_digest(token, session_token)


def get_security_headers_template() -> Dict[str, str]:
    """Get security headers template for documentation"""
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'",
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Permitted-Cross-Domain-Policies': 'none'
    }


def create_security_report(timeframe_hours: int = 24) -> Dict[str, Any]:
    """Create a security report for the specified timeframe"""
    # This would typically query logs and metrics
    # Placeholder implementation
    return {
        'timeframe_hours': timeframe_hours,
        'total_requests': 0,
        'blocked_requests': 0,
        'suspicious_events': 0,
        'top_attack_types': [],
        'top_source_ips': [],
        'recommendations': [
            'Continue monitoring suspicious activities',
            'Review and update security rules',
            'Consider implementing additional rate limiting'
        ]
    }


# Export main classes and functions
__all__ = [
    'SecurityConfig',
    'RedisRateLimiter', 
    'InputValidator',
    'SecurityLogger',
    'PerformanceMonitor',
    'SecurityHeaders',
    'setup_security',
    'require_api_key',
    'require_auth_token',
    'require_role',
    'require_https',
    'validate_request_schema',
    'monitor_performance',
    'scan_vulnerability',
    'create_secure_session',
    'invalidate_session',
    'check_suspicious_activity',
    'get_client_info',
    'sanitize_html_content',
    'generate_csrf_token',
    'validate_csrf_token',
    'get_security_headers_template',
    'create_security_report'
]