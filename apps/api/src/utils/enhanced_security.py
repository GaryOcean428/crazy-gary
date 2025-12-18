#!/usr/bin/env python3
"""
Enhanced Security Utilities for Crazy Gary Application
Provides additional security functions, validators, and utilities
"""

import re
import hashlib
import hmac
import secrets
import time
import json
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs
import bleach
from marshmallow import Schema, fields, ValidationError


class SecurityValidator:
    """Comprehensive security validation utilities"""
    
    # Common attack patterns
    SQL_INJECTION_PATTERNS = [
        r"(?i)(union\s+select|select\s+.*\s+from|insert\s+into|update\s+.*\s+set|delete\s+from|drop\s+table|create\s+table)",
        r"(?i)(;|--|\/\*|\*\/|xp_cmdshell|sp_executesql)",
        r"(?i)(information_schema|sys\.|mysql\.|pg_|oracle\.|\.\./\.\./)",
        r"(?i)(char\(|ascii\(|substring\(|length\(|sleep\(|benchmark\()",
        r"(?i)(load_file\(|into\s+outfile|into\s+dumpfile)"
    ]
    
    XSS_PATTERNS = [
        r"(?i)(<script|javascript:|vbscript:|onload=|onerror=|onclick=)",
        r"(?i)(<iframe|<object|<embed|<link|<style|<meta)",
        r"(?i)(document\.|window\.|eval\(|expression\(|url\()",
        r"(?i)(data:text\/html|data:application\/javascript)"
    ]
    
    PATH_TRAVERSAL_PATTERNS = [
        r"(\.\./){2,}",  # ../../../ etc
        r"(\.\.\\){2,}", # ..\\..\\ etc
        r"%2e%2e%2f",    # URL encoded ../
        r"%2e%2e%5c",    # URL encoded ..\
        r"\.\.%2f",      # Mixed encoding
    ]
    
    COMMAND_INJECTION_PATTERNS = [
        r"(?i)(cmd\.exe|powershell|bash|sh|perl|python|ruby)",
        r"(?i)(wget|curl|nc|netcat|telnet|ssh|ftp)",
        r"(?i)(/bin/|/usr/bin/|/sbin/|/usr/sbin/)",
        r"(?i)(&&|\|\||;|`|\$\(|\\\(|\\\)",
    ]
    
    # Password strength patterns
    WEAK_PASSWORD_PATTERNS = [
        r"^(.)\1{7,}$",  # All same character
        r"^(?:123|012|abc|qwe|asd|zxc){3,}",  # Sequential patterns
        r"^(?:password|admin|root|user|guest|test){1}",  # Common words
        r"^(?:!|@|#|\$|%|\^|&|\*|\(|\)){3,}",  # Only special chars
    ]
    
    @classmethod
    def validate_sql_injection(cls, text: str) -> bool:
        """Check if text contains SQL injection patterns"""
        if not isinstance(text, str):
            return False
        
        text_lower = text.lower()
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, text_lower):
                return True
        return False
    
    @classmethod
    def validate_xss(cls, text: str) -> bool:
        """Check if text contains XSS patterns"""
        if not isinstance(text, str):
            return False
        
        text_lower = text.lower()
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, text_lower):
                return True
        return False
    
    @classmethod
    def validate_path_traversal(cls, text: str) -> bool:
        """Check if text contains path traversal patterns"""
        if not isinstance(text, str):
            return False
        
        for pattern in cls.PATH_TRAVERSAL_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    @classmethod
    def validate_command_injection(cls, text: str) -> bool:
        """Check if text contains command injection patterns"""
        if not isinstance(text, str):
            return False
        
        text_lower = text.lower()
        for pattern in cls.COMMAND_INJECTION_PATTERNS:
            if re.search(pattern, text_lower):
                return True
        return False
    
    @classmethod
    def validate_email(cls, email: str) -> bool:
        """Enhanced email validation"""
        if not isinstance(email, str):
            return False
        
        # Basic email pattern
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(email_pattern, email):
            return False
        
        # Additional checks
        if len(email) > 254:  # RFC 5321 limit
            return False
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'\.\.',  # Double dots
            r'@.*@',  # Multiple @ signs
            r'^\.',   # Starts with dot
            r'\.$',   # Ends with dot
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, email):
                return False
        
        return True
    
    @classmethod
    def validate_url(cls, url: str) -> bool:
        """Enhanced URL validation"""
        if not isinstance(url, str):
            return False
        
        try:
            parsed = urlparse(url)
            
            # Basic checks
            if not parsed.scheme or not parsed.netloc:
                return False
            
            # Only allow http/https
            if parsed.scheme not in ['http', 'https']:
                return False
            
            # Check for suspicious patterns
            if any(pattern in url.lower() for pattern in ['javascript:', 'data:', 'vbscript:']):
                return False
            
            return True
            
        except Exception:
            return False
    
    @classmethod
    def validate_password_strength(cls, password: str) -> Dict[str, Any]:
        """Validate password strength"""
        if not isinstance(password, str):
            return {'valid': False, 'score': 0, 'issues': ['Password must be a string']}
        
        issues = []
        score = 0
        
        # Length check
        if len(password) < 8:
            issues.append('Password must be at least 8 characters long')
        elif len(password) >= 12:
            score += 2
        elif len(password) >= 8:
            score += 1
        
        # Character variety checks
        if not re.search(r'[a-z]', password):
            issues.append('Password must contain at least one lowercase letter')
        else:
            score += 1
        
        if not re.search(r'[A-Z]', password):
            issues.append('Password must contain at least one uppercase letter')
        else:
            score += 1
        
        if not re.search(r'[0-9]', password):
            issues.append('Password must contain at least one number')
        else:
            score += 1
        
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:,.<>?]', password):
            issues.append('Password must contain at least one special character')
        else:
            score += 1
        
        # Check for weak patterns
        for pattern in cls.WEAK_PASSWORD_PATTERNS:
            if re.search(pattern, password, re.IGNORECASE):
                issues.append('Password contains weak patterns')
                score = max(0, score - 2)
                break
        
        # Common password check (basic)
        common_passwords = [
            'password', '123456', 'qwerty', 'admin', 'letmein',
            'welcome', 'monkey', 'dragon', 'master', 'login'
        ]
        
        if password.lower() in common_passwords:
            issues.append('Password is too common')
            score = 0
        
        return {
            'valid': len(issues) == 0,
            'score': score,
            'issues': issues,
            'strength': 'weak' if score < 3 else 'medium' if score < 5 else 'strong'
        }


class DataSanitizer:
    """Data sanitization utilities"""
    
    @classmethod
    def sanitize_html(cls, html_text: str, allowed_tags: List[str] = None) -> str:
        """Sanitize HTML content"""
        if not isinstance(html_text, str):
            return ""
        
        allowed_tags = allowed_tags or ['b', 'i', 'u', 'em', 'strong', 'p', 'br']
        
        return bleach.clean(
            html_text,
            tags=allowed_tags,
            attributes={},
            protocols=['http', 'https', 'mailto'],
            strip=True
        )
    
    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """Sanitize filename"""
        if not isinstance(filename, str):
            return "unnamed_file"
        
        # Remove or replace dangerous characters
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # Remove leading/trailing dots and spaces
        filename = filename.strip('. ')
        
        # Limit length
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = name[:255-len(ext)-1] + ('.' + ext if ext else '')
        
        # Ensure not empty
        if not filename:
            filename = "unnamed_file"
        
        return filename
    
    @classmethod
    def sanitize_user_input(cls, text: str, max_length: int = 1000) -> str:
        """Comprehensive user input sanitization"""
        if not isinstance(text, str):
            return ""
        
        # Remove control characters
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
        
        # Trim length
        if len(text) > max_length:
            text = text[:max_length]
        
        # Remove potential XSS
        text = bleach.clean(text, tags=[], strip=True)
        
        return text.strip()
    
    @classmethod
    def sanitize_json(cls, data: Any) -> Any:
        """Sanitize JSON data recursively"""
        if isinstance(data, dict):
            return {cls.sanitize_json(k): cls.sanitize_json(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [cls.sanitize_json(item) for item in data]
        elif isinstance(data, str):
            return cls.sanitize_user_input(data)
        else:
            return data


class CryptographicUtils:
    """Cryptographic utility functions"""
    
    @classmethod
    def generate_secure_token(cls, length: int = 32) -> str:
        """Generate cryptographically secure token"""
        return secrets.token_urlsafe(length)
    
    @classmethod
    def generate_api_key(cls, prefix: str = "ck") -> str:
        """Generate API key with prefix"""
        token = secrets.token_urlsafe(32)
        return f"{prefix}_{token}"
    
    @classmethod
    def hash_password(cls, password: str, salt: str = None) -> tuple[str, str]:
        """Hash password with salt"""
        if salt is None:
            salt = secrets.token_hex(16)
        
        # Use PBKDF2 with SHA256
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return password_hash.hex(), salt
    
    @classmethod
    def verify_password(cls, password: str, password_hash: str, salt: str) -> bool:
        """Verify password against hash"""
        computed_hash, _ = cls.hash_password(password, salt)
        return hmac.compare_digest(computed_hash, password_hash)
    
    @classmethod
    def generate_signature(cls, data: str, secret: str) -> str:
        """Generate HMAC signature for data"""
        return hmac.new(secret.encode(), data.encode(), hashlib.sha256).hexdigest()
    
    @classmethod
    def verify_signature(cls, data: str, signature: str, secret: str) -> bool:
        """Verify HMAC signature"""
        expected_signature = cls.generate_signature(data, secret)
        return hmac.compare_digest(signature, expected_signature)


class SecuritySchemas:
    """Marshmallow schemas for request validation"""
    
    class UserRegistrationSchema(Schema):
        """User registration schema"""
        username = fields.Str(required=True, validate=lambda x: 3 <= len(x) <= 50)
        email = fields.Email(required=True)
        password = fields.Str(required=True, validate=lambda x: len(x) >= 8)
        confirm_password = fields.Str(required=True)
        
        def validate(self, data, **kwargs):
            # Check password confirmation
            if data.get('password') != data.get('confirm_password'):
                raise ValidationError('Passwords do not match')
            
            # Validate password strength
            password_validator = SecurityValidator()
            strength_result = password_validator.validate_password_strength(data.get('password', ''))
            if not strength_result['valid']:
                raise ValidationError(strength_result['issues'])
            
            return data
    
    class LoginSchema(Schema):
        """Login schema"""
        username = fields.Str(required=True)
        password = fields.Str(required=True)
        remember_me = fields.Bool(load_default=False)
    
    class PasswordResetSchema(Schema):
        """Password reset schema"""
        email = fields.Email(required=True)
    
    class ChangePasswordSchema(Schema):
        """Change password schema"""
        current_password = fields.Str(required=True)
        new_password = fields.Str(required=True, validate=lambda x: len(x) >= 8)
        confirm_password = fields.Str(required=True)
        
        def validate(self, data, **kwargs):
            # Check password confirmation
            if data.get('new_password') != data.get('confirm_password'):
                raise ValidationError('New passwords do not match')
            
            # Validate password strength
            password_validator = SecurityValidator()
            strength_result = password_validator.validate_password_strength(data.get('new_password', ''))
            if not strength_result['valid']:
                raise ValidationError(strength_result['issues'])
            
            return data
    
    class APIKeyCreateSchema(Schema):
        """API key creation schema"""
        name = fields.Str(required=True, validate=lambda x: 1 <= len(x) <= 100)
        permissions = fields.List(fields.Str(), load_default=[])
        expires_in_days = fields.Int(load_default=30, validate=lambda x: 1 <= x <= 365)


class SecurityMetrics:
    """Security metrics and reporting"""
    
    @classmethod
    def calculate_threat_score(cls, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate threat score based on security events"""
        if not events:
            return {'threat_score': 0, 'risk_level': 'low', 'factors': []}
        
        score = 0
        factors = []
        
        # Count different types of events
        event_types = {}
        for event in events:
            event_type = event.get('event_type', 'unknown')
            event_types[event_type] = event_types.get(event_type, 0) + 1
        
        # Scoring based on event types
        threat_multipliers = {
            'SQL_INJECTION_ATTEMPT': 10,
            'XSS_ATTEMPT': 8,
            'PATH_TRAVERSAL_ATTEMPT': 6,
            'COMMAND_INJECTION_ATTEMPT': 10,
            'RATE_LIMIT_EXCEEDED': 3,
            'INVALID_INPUT': 5,
            'AUTH_FAILURE': 4,
            'SUSPICIOUS_USER_AGENT': 2,
        }
        
        for event_type, count in event_types.items():
            multiplier = threat_multipliers.get(event_type, 1)
            event_score = min(count * multiplier, 20)  # Cap per event type
            score += event_score
            
            if count > 0:
                factors.append(f"{event_type}: {count} occurrences")
        
        # Determine risk level
        if score >= 50:
            risk_level = 'critical'
        elif score >= 30:
            risk_level = 'high'
        elif score >= 15:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'threat_score': min(score, 100),  # Cap at 100
            'risk_level': risk_level,
            'factors': factors,
            'event_summary': event_types
        }
    
    @classmethod
    def generate_security_summary(cls, timeframe_hours: int = 24) -> Dict[str, Any]:
        """Generate security summary report"""
        # This would typically query actual logs and metrics
        # Placeholder implementation
        return {
            'timeframe_hours': timeframe_hours,
            'summary': {
                'total_requests': 0,
                'blocked_requests': 0,
                'successful_auth': 0,
                'failed_auth': 0,
                'unique_ips': 0,
                'top_attack_types': [],
                'threat_level': 'low'
            },
            'recommendations': [
                'Continue monitoring for suspicious activities',
                'Review and update security rules regularly',
                'Consider implementing additional rate limiting',
                'Monitor for new attack patterns'
            ],
            'generated_at': datetime.utcnow().isoformat()
        }


class SecurityAuditor:
    """Security auditing utilities"""
    
    @classmethod
    def audit_request_security(cls, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Audit a request for security issues"""
        issues = []
        recommendations = []
        
        # Check for missing security headers
        headers = request_data.get('headers', {})
        
        security_headers = [
            'User-Agent', 'Accept', 'Accept-Language', 'Content-Type'
        ]
        
        for header in security_headers:
            if header not in headers:
                issues.append(f"Missing security header: {header}")
        
        # Check for suspicious patterns in URL
        url = request_data.get('url', '')
        if SecurityValidator.validate_path_traversal(url):
            issues.append("URL contains path traversal patterns")
            recommendations.append("Implement path traversal protection")
        
        # Check query parameters
        query_params = request_data.get('query_params', {})
        for param_name, param_value in query_params.items():
            if isinstance(param_value, str):
                if SecurityValidator.validate_sql_injection(param_value):
                    issues.append(f"SQL injection pattern in parameter: {param_name}")
                    recommendations.append("Implement SQL injection protection")
                
                if SecurityValidator.validate_xss(param_value):
                    issues.append(f"XSS pattern in parameter: {param_name}")
                    recommendations.append("Implement XSS protection")
        
        return {
            'issues': issues,
            'recommendations': recommendations,
            'risk_level': 'high' if len(issues) > 3 else 'medium' if len(issues) > 0 else 'low'
        }
    
    @classmethod
    def audit_password_policy(cls, password: str) -> Dict[str, Any]:
        """Audit password against security policy"""
        validator = SecurityValidator()
        return validator.validate_password_strength(password)


# Export all classes and functions
__all__ = [
    'SecurityValidator',
    'DataSanitizer',
    'CryptographicUtils',
    'SecuritySchemas',
    'SecurityMetrics',
    'SecurityAuditor'
]