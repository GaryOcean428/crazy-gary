#!/usr/bin/env python3
"""
Input Sanitization and XSS Prevention Utilities
Implements comprehensive input sanitization following OWASP guidelines
"""

import re
import html
import bleach
from typing import Any, Dict, List, Optional, Union
from urllib.parse import quote, unquote
import json
from datetime import datetime


class InputSanitizer:
    """Comprehensive input sanitization class"""
    
    # HTML tags allowed by default
    ALLOWED_TAGS = [
        'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol', 
        'strong', 'ul', 'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub'
    ]
    
    # HTML attributes allowed by default
    ALLOWED_ATTRIBUTES = {
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'span': ['class', 'id', 'title'],
        'div': ['class', 'id', 'title'],
        'p': ['class', 'id', 'title'],
        'table': ['class', 'id'],
        'th': ['class', 'id', 'colspan', 'rowspan'],
        'td': ['class', 'id', 'colspan', 'rowspan']
    }
    
    # Protocols allowed for links
    ALLOWED_PROTOCOLS = ['http', 'https', 'mailto', 'tel']
    
    def __init__(self, allowed_tags: Optional[List[str]] = None, allowed_attributes: Optional[Dict[str, List[str]]] = None):
        self.allowed_tags = allowed_tags or self.ALLOWED_TAGS
        self.allowed_attributes = allowed_attributes or self.ALLOWED_ATTRIBUTES
        self.allowed_protocols = self.ALLOWED_PROTOCOLS
    
    def sanitize_html(self, content: str, strict: bool = False) -> str:
        """
        Sanitize HTML content to prevent XSS attacks
        
        Args:
            content: HTML content to sanitize
            strict: If True, apply very strict sanitization
        
        Returns:
            Sanitized HTML content
        """
        if not content:
            return ""
        
        # Basic HTML escaping
        content = html.escape(content)
        
        if strict:
            # Strict mode: remove all HTML tags
            return content
        
        # Use bleach for advanced sanitization
        try:
            sanitized = bleach.clean(
                content,
                tags=self.allowed_tags,
                attributes=self.allowed_attributes,
                protocols=self.allowed_protocols,
                strip=True
            )
            return sanitized
        except Exception:
            # Fallback to basic escaping if bleach fails
            return content
    
    def sanitize_text(self, text: str, max_length: Optional[int] = None) -> str:
        """
        Sanitize plain text content
        
        Args:
            text: Text content to sanitize
            max_length: Maximum allowed length
        
        Returns:
            Sanitized text content
        """
        if not text:
            return ""
        
        # Remove null bytes
        text = text.replace('\x00', '')
        
        # Remove control characters except tab, newline, carriage return
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        # Trim whitespace
        text = text.strip()
        
        # Limit length if specified
        if max_length and len(text) > max_length:
            text = text[:max_length]
        
        return text
    
    def sanitize_email(self, email: str) -> Optional[str]:
        """
        Sanitize and validate email address
        
        Args:
            email: Email address to sanitize
        
        Returns:
            Sanitized email or None if invalid
        """
        if not email:
            return None
        
        email = email.strip().lower()
        
        # Basic email validation regex
        email_pattern = re.compile(
            r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        )
        
        if email_pattern.match(email) and len(email) <= 254:
            return email
        
        return None
    
    def sanitize_url(self, url: str, allow_relative: bool = True) -> Optional[str]:
        """
        Sanitize and validate URL
        
        Args:
            url: URL to sanitize
            allow_relative: Whether to allow relative URLs
        
        Returns:
            Sanitized URL or None if invalid
        """
        if not url:
            return None
        
        url = url.strip()
        
        # Remove whitespace and control characters
        url = re.sub(r'[\x00-\x20\x7F]', '', url)
        
        # Check for javascript: protocol
        if re.search(r'javascript:', url, re.IGNORECASE):
            return None
        
        # Check for data: protocol (unless it's for images)
        if re.search(r'^data:', url, re.IGNORECASE) and not re.search(r'^data:image/', url, re.IGNORECASE):
            return None
        
        # Validate absolute URLs
        if not allow_relative and not re.match(r'^https?://', url):
            return None
        
        # Basic URL validation
        if re.match(r'^[a-zA-Z][a-zA-Z0-9+\-.]*:', url):
            # Has scheme
            if not re.match(r'^(https?|ftp|mailto|tel):', url, re.IGNORECASE):
                return None
        
        return url
    
    def sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename for safe file operations
        
        Args:
            filename: Filename to sanitize
        
        Returns:
            Sanitized filename
        """
        if not filename:
            return ""
        
        # Remove path traversal attempts
        filename = re.sub(r'[/\\]+', '_', filename)
        
        # Remove null bytes and control characters
        filename = re.sub(r'[\x00-\x1F\x7F]', '', filename)
        
        # Remove dangerous characters
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # Remove leading/trailing dots and spaces
        filename = filename.strip('. ')
        
        # Limit length
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = f"{name[:255-len(ext)-1]}.{ext}" if ext else name[:255]
        
        return filename
    
    def sanitize_search_query(self, query: str, max_length: int = 100) -> str:
        """
        Sanitize search query
        
        Args:
            query: Search query to sanitize
            max_length: Maximum query length
        
        Returns:
            Sanitized search query
        """
        if not query:
            return ""
        
        # Basic text sanitization
        query = self.sanitize_text(query, max_length)
        
        # Remove SQL injection patterns
        sql_patterns = [
            r'(\bunion\b\s+select\b)',
            r'(\binsert\b\s+into\b)',
            r'(\bdelete\b\s+from\b)',
            r'(\bupdate\b\s+set\b)',
            r'(\bdrop\b\s+table\b)',
            r'(\bcreate\b\s+table\b)',
            r'(\balter\b\s+table\b)',
            r'(\bexec\b)',
            r'(\bexecute\b)'
        ]
        
        for pattern in sql_patterns:
            query = re.sub(pattern, '', query, flags=re.IGNORECASE)
        
        # Remove NoSQL injection patterns
        nosql_patterns = [
            r'(\$where)',
            r'(\$ne)',
            r'(\$lt)',
            r'(\$gt)',
            r'(\$lte)',
            r'(\$gte)',
            r'(\$in)',
            r'(\$nin)',
            r'(\$regex)',
            r'(\$options)',
            r'(\$size)'
        ]
        
        for pattern in nosql_patterns:
            query = re.sub(pattern, '', query, flags=re.IGNORECASE)
        
        return query
    
    def sanitize_json_input(self, data: Any) -> Any:
        """
        Sanitize JSON input data
        
        Args:
            data: JSON data to sanitize
        
        Returns:
            Sanitized JSON data
        """
        if isinstance(data, dict):
            sanitized = {}
            for key, value in data.items():
                # Sanitize keys
                sanitized_key = self.sanitize_text(str(key), 100)
                # Sanitize values recursively
                sanitized[sanitized_key] = self.sanitize_json_input(value)
            return sanitized
        
        elif isinstance(data, list):
            return [self.sanitize_json_input(item) for item in data]
        
        elif isinstance(data, str):
            return self.sanitize_text(data)
        
        else:
            return data
    
    def sanitize_form_data(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitize form data with field-specific rules
        
        Args:
            form_data: Form data to sanitize
        
        Returns:
            Sanitized form data
        """
        sanitized = {}
        
        for field_name, value in form_data.items():
            field_name = self.sanitize_text(field_name, 50)
            
            # Field-specific sanitization
            if 'email' in field_name.lower():
                if isinstance(value, str):
                    sanitized[field_name] = self.sanitize_email(value)
                else:
                    sanitized[field_name] = None
            
            elif 'url' in field_name.lower() or 'link' in field_name.lower():
                if isinstance(value, str):
                    sanitized[field_name] = self.sanitize_url(value)
                else:
                    sanitized[field_name] = None
            
            elif 'search' in field_name.lower() or 'query' in field_name.lower():
                if isinstance(value, str):
                    sanitized[field_name] = self.sanitize_search_query(value)
                else:
                    sanitized[field_name] = ""
            
            elif 'message' in field_name.lower() or 'content' in field_name.lower() or 'description' in field_name.lower():
                if isinstance(value, str):
                    sanitized[field_name] = self.sanitize_html(value)
                else:
                    sanitized[field_name] = ""
            
            elif 'name' in field_name.lower() or 'title' in field_name.lower():
                if isinstance(value, str):
                    sanitized[field_name] = self.sanitize_text(value, 200)
                else:
                    sanitized[field_name] = ""
            
            elif 'filename' in field_name.lower() or 'file' in field_name.lower():
                if isinstance(value, str):
                    sanitized[field_name] = self.sanitize_filename(value)
                else:
                    sanitized[field_name] = ""
            
            else:
                # Generic text sanitization
                if isinstance(value, str):
                    sanitized[field_name] = self.sanitize_text(value, 1000)
                else:
                    sanitized[field_name] = value
        
        return sanitized


# Decorators for input sanitization
def sanitize_request(f):
    """Decorator to sanitize request data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import request, g
        
        sanitizer = InputSanitizer()
        
        # Sanitize JSON data
        if request.is_json:
            try:
                json_data = request.get_json()
                g.sanitized_data = sanitizer.sanitize_json_input(json_data)
            except:
                g.sanitized_data = {}
        else:
            g.sanitized_data = {}
        
        # Sanitize form data
        if request.form:
            g.sanitized_form = sanitizer.sanitize_form_data(dict(request.form))
        else:
            g.sanitized_form = {}
        
        # Sanitize query parameters
        if request.args:
            g.sanitized_query = {
                key: sanitizer.sanitize_text(value, 200)
                for key, value in request.args.items()
            }
        else:
            g.sanitized_query = {}
        
        # Add sanitizer to g for use in route handlers
        g.sanitizer = sanitizer
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_input(schema_dict: Dict[str, Any]):
    """
    Input validation decorator using simple schema
    
    Args:
        schema_dict: Schema definition with field rules
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from flask import request, g
            
            # Get sanitized data from decorator
            data_to_validate = {}
            if hasattr(g, 'sanitized_form'):
                data_to_validate.update(g.sanitized_form)
            if hasattr(g, 'sanitized_query'):
                data_to_validate.update(g.sanitized_query)
            if hasattr(g, 'sanitized_data'):
                data_to_validate.update(g.sanitized_data)
            
            # Validate against schema
            errors = []
            for field, rules in schema_dict.items():
                value = data_to_validate.get(field)
                
                # Required check
                if rules.get('required', False) and (value is None or value == ''):
                    errors.append(f"{field} is required")
                    continue
                
                if value is None or value == '':
                    continue
                
                # Type validation
                expected_type = rules.get('type', 'string')
                if expected_type == 'string' and not isinstance(value, str):
                    errors.append(f"{field} must be a string")
                    continue
                elif expected_type == 'email' and not isinstance(value, str):
                    errors.append(f"{field} must be a string")
                    continue
                elif expected_type == 'email' and g.sanitizer.sanitize_email(value) is None:
                    errors.append(f"{field} must be a valid email")
                    continue
                elif expected_type == 'url' and not isinstance(value, str):
                    errors.append(f"{field} must be a string")
                    continue
                elif expected_type == 'url' and g.sanitizer.sanitize_url(value) is None:
                    errors.append(f"{field} must be a valid URL")
                    continue
                elif expected_type == 'int' and not isinstance(value, str):
                    errors.append(f"{field} must be a string")
                    continue
                elif expected_type == 'int':
                    try:
                        int(value)
                    except ValueError:
                        errors.append(f"{field} must be a valid integer")
                        continue
                
                # Length validation
                if expected_type == 'string':
                    min_length = rules.get('min_length', 0)
                    max_length = rules.get('max_length', float('inf'))
                    
                    if len(value) < min_length:
                        errors.append(f"{field} must be at least {min_length} characters")
                        continue
                    
                    if len(value) > max_length:
                        errors.append(f"{field} must be at most {max_length} characters")
                        continue
                
                # Range validation for integers
                if expected_type == 'int':
                    try:
                        int_value = int(value)
                        min_value = rules.get('min_value', float('-inf'))
                        max_value = rules.get('max_value', float('inf'))
                        
                        if int_value < min_value:
                            errors.append(f"{field} must be at least {min_value}")
                            continue
                        
                        if int_value > max_value:
                            errors.append(f"{field} must be at most {max_value}")
                            continue
                    except ValueError:
                        errors.append(f"{field} must be a valid integer")
                        continue
            
            if errors:
                from flask import jsonify
                return jsonify({
                    'error': 'Validation failed',
                    'details': errors
                }), 400
            
            # Store validated data
            g.validated_data = data_to_validate
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


# Common validation schemas
email_schema = {
    'email': {
        'required': True,
        'type': 'email',
        'max_length': 254
    }
}

contact_form_schema = {
    'name': {
        'required': True,
        'type': 'string',
        'min_length': 1,
        'max_length': 100
    },
    'email': {
        'required': True,
        'type': 'email',
        'max_length': 254
    },
    'message': {
        'required': True,
        'type': 'string',
        'min_length': 1,
        'max_length': 1000
    }
}

search_schema = {
    'query': {
        'required': True,
        'type': 'string',
        'min_length': 1,
        'max_length': 100
    }
}


# XSS Detection and Prevention
class XSSDetector:
    """Detect and prevent XSS attacks"""
    
    # Common XSS patterns
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=\s*["\'][^"\']*["\']',
        r'<iframe[^>]*>.*?</iframe>',
        r'<object[^>]*>.*?</object>',
        r'<embed[^>]*>.*?</embed>',
        r'<form[^>]*>.*?</form>',
        r'<link[^>]*>.*?</link>',
        r'<style[^>]*>.*?</style>',
        r'<meta[^>]*>.*?</meta>',
        r'<img[^>]*on\w+\s*=',
        r'document\.cookie',
        r'document\.location',
        r'eval\s*\(',
        r'alert\s*\(',
        r'confirm\s*\(',
        r'prompt\s*\(',
        r'<svg[^>]*>.*?</svg>',
        r'<math[^>]*>.*?</math>',
        r'vbscript:',
        r'data:text/html',
        r'<iframe[^>]*src\s*=\s*["\']javascript:',
        r'expression\s*\(',
        r'@import',
        r'url\s*\(',
        r'background-image:',
        r'-moz-binding'
    ]
    
    def __init__(self):
        self.patterns = [re.compile(pattern, re.IGNORECASE | re.DOTALL) for pattern in self.XSS_PATTERNS]
    
    def detect_xss(self, content: str) -> bool:
        """
        Detect potential XSS in content
        
        Args:
            content: Content to check for XSS patterns
        
        Returns:
            True if XSS patterns are detected
        """
        if not content:
            return False
        
        for pattern in self.patterns:
            if pattern.search(content):
                return True
        
        return False
    
    def sanitize_xss(self, content: str) -> str:
        """
        Remove XSS patterns from content
        
        Args:
            content: Content to sanitize
        
        Returns:
            Sanitized content
        """
        if not content:
            return ""
        
        sanitized = content
        
        # Remove script tags and their content
        sanitized = re.sub(r'<script[^>]*>.*?</script>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove javascript: protocols
        sanitized = re.sub(r'javascript:[^"\'\s]*', '', sanitized, flags=re.IGNORECASE)
        
        # Remove event handlers
        sanitized = re.sub(r'on\w+\s*=\s*["\'][^"\']*["\']', '', sanitized, flags=re.IGNORECASE)
        
        # Remove dangerous HTML tags
        dangerous_tags = ['script', 'object', 'embed', 'form', 'iframe', 'link', 'style', 'meta', 'svg', 'math']
        for tag in dangerous_tags:
            sanitized = re.sub(f'<{tag}[^>]*>.*?</{tag}>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
            sanitized = re.sub(f'<{tag}[^>]*/?>', '', sanitized, flags=re.IGNORECASE)
        
        # Remove data URIs except for safe content types
        sanitized = re.sub(r'data:text/html[^"\'\s]*', '', sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r'data:application/[^"\'\s]*', '', sanitized, flags=re.IGNORECASE)
        
        return sanitized


# Integration with Flask
def setup_input_sanitization(app):
    """Setup input sanitization middleware for Flask app"""
    
    @app.before_request
    def apply_sanitization():
        """Apply input sanitization to all requests"""
        from flask import g
        g.sanitizer = InputSanitizer()
        g.xss_detector = XSSDetector()
    
    @app.errorhandler(400)
    def handle_validation_error(error):
        """Handle validation errors"""
        from flask import jsonify
        return jsonify({
            'error': 'Invalid input',
            'message': 'The provided input does not meet security requirements'
        }), 400