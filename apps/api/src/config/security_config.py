#!/usr/bin/env python3
"""
Security Configuration for Crazy-Gary Application
Centralized security settings and configurations
"""

import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import timedelta


@dataclass
class SecuritySettings:
    """Security configuration settings"""
    
    # Environment settings
    environment: str = os.getenv('ENVIRONMENT', 'development')
    
    # API and authentication settings
    api_key: str = os.getenv('API_KEY', '')
    jwt_secret_key: str = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    jwt_access_token_expires: int = 3600  # 1 hour
    jwt_refresh_token_expires: int = 2592000  # 30 days
    
    # Rate limiting settings
    rate_limit_rps: int = int(os.getenv('RATE_LIMIT_RPS', '10'))
    rate_limit_burst: int = int(os.getenv('RATE_LIMIT_BURST', '100'))
    rate_limit_storage_url: str = os.getenv('REDIS_URL', 'memory://')
    
    # Request limits
    max_request_size: int = int(os.getenv('MAX_REQUEST_SIZE', str(16 * 1024 * 1024)))  # 16MB
    max_json_size: int = int(os.getenv('MAX_JSON_SIZE', str(1 * 1024 * 1024)))  # 1MB
    
    # CORS settings
    cors_origins: List[str] = None
    cors_credentials: bool = True
    
    # Security headers
    enable_security_headers: bool = True
    strict_transport_security: bool = True
    content_security_policy: bool = True
    
    # Input validation
    enable_input_validation: bool = True
    enable_xss_protection: bool = True
    enable_sql_injection_protection: bool = True
    
    # CSRF protection
    enable_csrf_protection: bool = True
    csrf_secret_key: str = os.getenv('CSRF_SECRET_KEY', '')
    csrf_token_timeout: int = 3600  # 1 hour
    
    # Session security
    session_timeout: int = int(os.getenv('SESSION_TIMEOUT', '1800'))  # 30 minutes
    session_cookie_secure: bool = environment == 'production'
    session_cookie_http_only: bool = True
    session_cookie_same_site: str = 'Lax'
    
    # Password security
    password_min_length: int = 8
    password_require_uppercase: bool = True
    password_require_lowercase: bool = True
    password_require_numbers: bool = True
    password_require_special_chars: bool = True
    password_max_age: int = int(os.getenv('PASSWORD_MAX_AGE', '2592000'))  # 30 days
    
    # Account security
    max_login_attempts: int = 5
    lockout_duration: int = 900  # 15 minutes
    account_lockout_threshold: int = 5
    
    # Monitoring and logging
    enable_security_logging: bool = True
    enable_performance_monitoring: bool = True
    log_level: str = os.getenv('LOG_LEVEL', 'WARNING')
    security_event_retention_days: int = 30
    
    # External integrations
    smtp_server: str = os.getenv('SMTP_SERVER', '')
    smtp_port: int = int(os.getenv('SMTP_PORT', '587'))
    smtp_username: str = os.getenv('SMTP_USERNAME', '')
    smtp_password: str = os.getenv('SMTP_PASSWORD', '')
    alert_email: str = os.getenv('ALERT_EMAIL', '')
    webhook_url: str = os.getenv('WEBHOOK_URL', '')
    
    # Database security
    database_url: str = os.getenv('DATABASE_URL', '')
    database_pool_size: int = int(os.getenv('DB_POOL_SIZE', '10'))
    database_pool_timeout: int = 20
    database_pool_recycle: int = 3600
    
    # File upload security
    max_file_size: int = int(os.getenv('MAX_FILE_SIZE', str(5 * 1024 * 1024)))  # 5MB
    allowed_file_types: List[str] = None
    upload_directory: str = os.getenv('UPLOAD_DIR', './uploads')
    
    # IP filtering
    allowed_ips: List[str] = None
    blocked_ips: List[str] = None
    geo_block_countries: List[str] = None
    
    # SSL/TLS settings
    ssl_verify: bool = environment == 'production'
    ssl_ca_bundle: str = os.getenv('SSL_CA_BUNDLE', '')
    
    def __post_init__(self):
        """Initialize default values for list fields"""
        if self.cors_origins is None:
            if self.environment == 'development':
                self.cors_origins = ['http://localhost:3000', 'http://localhost:5173']
            else:
                self.cors_origins = []
        
        if self.allowed_file_types is None:
            self.allowed_file_types = [
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf', 'text/plain', 'text/csv'
            ]
        
        if self.allowed_ips is None:
            self.allowed_ips = []
        
        if self.blocked_ips is None:
            self.blocked_ips = []
        
        if self.geo_block_countries is None:
            self.geo_block_countries = []
    
    def validate(self) -> List[str]:
        """Validate security settings and return list of errors"""
        errors = []
        
        # Check critical secrets
        if self.environment == 'production':
            if not self.jwt_secret_key or self.jwt_secret_key == 'your-secret-key-change-in-production':
                errors.append("JWT_SECRET_KEY must be set to a secure value in production")
            
            if not self.csrf_secret_key:
                errors.append("CSRF_SECRET_KEY must be set in production")
            
            if not self.api_key:
                errors.append("API_KEY must be set in production")
        
        # Validate numeric values
        if self.rate_limit_rps <= 0:
            errors.append("RATE_LIMIT_RPS must be greater than 0")
        
        if self.max_request_size <= 0:
            errors.append("MAX_REQUEST_SIZE must be greater than 0")
        
        if self.password_min_length < 6:
            errors.append("Password minimum length should be at least 6 characters")
        
        if self.max_login_attempts <= 0:
            errors.append("MAX_LOGIN_ATTEMPTS must be greater than 0")
        
        # Validate URLs
        if self.webhook_url and not (self.webhook_url.startswith('http://') or self.webhook_url.startswith('https://')):
            errors.append("WEBHOOK_URL must be a valid HTTP or HTTPS URL")
        
        return errors
    
    def get_rate_limit_config(self) -> Dict[str, Any]:
        """Get rate limiting configuration"""
        return {
            'default': f"{self.rate_limit_rps} per minute",
            'burst': f"{self.rate_limit_burst} per 5 minutes",
            'login': "5 per minute",
            'registration': "3 per 10 minutes",
            'api': "1000 per hour",
            'storage_url': self.rate_limit_storage_url
        }
    
    def get_csp_directives(self) -> List[str]:
        """Get Content Security Policy directives"""
        directives = [
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
        
        # Add Railway domain if in production
        if self.environment == 'production' and os.getenv('RAILWAY_PUBLIC_DOMAIN'):
            domain = os.getenv('RAILWAY_PUBLIC_DOMAIN')
            directives.extend([
                f"connect-src 'self' ws: wss: https://{domain}",
                f"frame-src 'self' https://{domain}"
            ])
        
        return directives
    
    def get_security_headers(self) -> Dict[str, str]:
        """Get security headers configuration"""
        headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': (
                'camera=(), microphone=(), geolocation=(), '
                'payment=(), usb=(), magnetometer=(), gyroscope=(), '
                'accelerometer=(), bluetooth=(), display-capture=(), '
                'encrypted-media=(), fullscreen=(self), midi=(), '
                'picture-in-picture=(), screen-wake-lock=()'
            ),
            'X-Permitted-Cross-Domain-Policies': 'none',
            'X-Download-Options': 'noopen'
        }
        
        # Add HSTS for production
        if self.environment == 'production' and self.strict_transport_security:
            headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        # Add CSP for production
        if self.environment == 'production' and self.content_security_policy:
            headers['Content-Security-Policy'] = '; '.join(self.get_csp_directives())
        
        # Add cache control headers
        headers.update({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        })
        
        return headers


# Security rules and patterns
class SecurityRules:
    """Security rules and validation patterns"""
    
    # Suspicious patterns
    SQL_INJECTION_PATTERNS = [
        r'(\bunion\b\s+select\b)',
        r'(\bor\b\s+1=1\b)',
        r'(\bdrop\s+table\b)',
        r'(\binsert\s+into\b)',
        r'(\bdelete\s+from\b)',
        r'(\bupdate\s+set\b)',
        r'(\bcreate\s+table\b)',
        r'(\bexec\b)',
        r'(\bexecute\b)',
        r"'?\bor'?\s*'1'='1",
        r"'\s*union\s*select",
        r";\s*drop\s*",
        r"';\s*--"
    ]
    
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=\s*',
        r'<iframe[^>]*>',
        r'<object[^>]*>',
        r'<embed[^>]*>',
        r'<svg[^>]*>.*?</svg>',
        r'expression\s*\(',
        r'eval\s*\(',
        r'document\.cookie',
        r'document\.location'
    ]
    
    PATH_TRAVERSAL_PATTERNS = [
        r'\.\./',
        r'\.\.\\',
        r'%2e%2e%2f',
        r'%2e%2e%5c',
        r'\.\.%2f',
        r'\.\.%5c'
    ]
    
    COMMAND_INJECTION_PATTERNS = [
        r'[;&|`$]\s*(?:cat|ls|rm|cp|mv|chmod|chown|wget|curl|nc|netcat|telnet|ssh)',
        r'\|\s*(?:cat|ls|rm|cp|mv|chmod|chown|wget|curl|nc|netcat|telnet|ssh)',
        r'&\s*(?:cat|ls|rm|cp|mv|chmod|chown|wget|curl|nc|netcat|telnet|ssh)',
        r'whoami',
        r'id',
        r'uname',
        r'ps\s+aux'
    ]
    
    # File upload restrictions
    DANGEROUS_FILE_EXTENSIONS = [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
        '.php', '.asp', '.aspx', '.jsp', '.sh', '.py', '.rb', '.pl'
    ]
    
    DANGEROUS_MIME_TYPES = [
        'application/x-executable',
        'application/x-msdownload',
        'application/x-msdos-program',
        'application/x-shellscript',
        'text/x-scripting',
        'application/javascript',
        'text/javascript'
    ]
    
    # User agent patterns
    SUSPICIOUS_USER_AGENTS = [
        'sqlmap', 'nmap', 'nikto', 'dirb', 'gobuster',
        'bot', 'crawler', 'spider', 'scraper'
    ]
    
    # HTTP methods
    ALLOWED_METHODS = {'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'}
    
    # Reserved routes
    RESERVED_ROUTES = [
        '/admin', '/wp-admin', '/phpmyadmin', '/api/admin',
        '/.env', '/.git', '/config', '/debug'
    ]


# Validation schemas
from marshmallow import Schema, fields, validate, ValidationError


class LoginSchema(Schema):
    """Login request validation schema"""
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=6, max=128))
    remember_me = fields.Bool(missing=False)


class RegistrationSchema(Schema):
    """Registration request validation schema"""
    username = fields.Str(
        required=True, 
        validate=validate.Length(min=3, max=50),
        validate=validate.Regexp(r'^[a-zA-Z0-9_]+$', error='Username can only contain letters, numbers, and underscores')
    )
    email = fields.Email(required=True)
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=128)
    )
    confirm_password = fields.Str(required=True)
    
    def validate(self, data, **kwargs):
        """Custom validation for registration"""
        if data.get('password') != data.get('confirm_password'):
            raise ValidationError('Passwords do not match', 'confirm_password')
        
        # Check password strength
        password = data.get('password', '')
        if not any(c.isupper() for c in password):
            raise ValidationError('Password must contain at least one uppercase letter', 'password')
        if not any(c.islower() for c in password):
            raise ValidationError('Password must contain at least one lowercase letter', 'password')
        if not any(c.isdigit() for c in password):
            raise ValidationError('Password must contain at least one number', 'password')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            raise ValidationError('Password must contain at least one special character', 'password')
        
        return data


class ContactSchema(Schema):
    """Contact form validation schema"""
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True)
    subject = fields.Str(validate=validate.Length(max=200))
    message = fields.Str(required=True, validate=validate.Length(min=10, max=1000))


class SearchSchema(Schema):
    """Search request validation schema"""
    query = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    filters = fields.Dict(missing=dict)
    limit = fields.Int(validate=validate.Range(min=1, max=100), missing=20)
    offset = fields.Int(validate=validate.Range(min=0), missing=0)


# Global security settings instance
security_settings = SecuritySettings()

# Validation functions
def validate_file_upload(file_data: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate uploaded file
    
    Args:
        file_data: File data dictionary with 'filename', 'content_type', 'size'
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    filename = file_data.get('filename', '')
    content_type = file_data.get('content_type', '')
    size = file_data.get('size', 0)
    
    # Check file size
    if size > security_settings.max_file_size:
        return False, f"File size exceeds maximum allowed size of {security_settings.max_file_size // (1024*1024)}MB"
    
    # Check file extension
    import os
    _, ext = os.path.splitext(filename.lower())
    if ext in SecurityRules.DANGEROUS_FILE_EXTENSIONS:
        return False, f"File extension {ext} is not allowed"
    
    # Check MIME type
    if content_type in SecurityRules.DANGEROUS_MIME_TYPES:
        return False, f"MIME type {content_type} is not allowed"
    
    # Check if MIME type is in allowed list
    if content_type not in security_settings.allowed_file_types:
        return False, f"MIME type {content_type} is not allowed"
    
    return True, ""


def validate_ip_address(ip: str) -> tuple[bool, str]:
    """
    Validate IP address format
    
    Args:
        ip: IP address string
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    import ipaddress
    
    try:
        ipaddress.ip_address(ip)
        return True, ""
    except ValueError:
        return False, "Invalid IP address format"


def is_ip_allowed(ip: str) -> bool:
    """
    Check if IP address is allowed
    
    Args:
        ip: IP address to check
    
    Returns:
        True if IP is allowed
    """
    # Check if IP is explicitly blocked
    if ip in security_settings.blocked_ips:
        return False
    
    # Check if there are allowed IPs and this IP is not in the list
    if security_settings.allowed_ips and ip not in security_settings.allowed_ips:
        return False
    
    return True


# Configuration validation
def validate_security_config() -> Dict[str, Any]:
    """
    Validate entire security configuration
    
    Returns:
        Dictionary with validation results
    """
    errors = security_settings.validate()
    
    result = {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': [],
        'settings': security_settings.__dict__
    }
    
    # Add warnings for development settings in production
    if security_settings.environment == 'production':
        if security_settings.enable_security_logging:
            result['warnings'].append("Security logging is enabled in production")
        
        if 'localhost' in security_settings.cors_origins:
            result['warnings'].append("Localhost in CORS origins for production")
    
    return result