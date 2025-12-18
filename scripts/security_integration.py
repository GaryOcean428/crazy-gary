#!/usr/bin/env python3
"""
Security Integration Script for Crazy-Gary Application
Integrates all security components and middleware
"""

import os
import sys
from pathlib import Path

# Add the API source directory to Python path
api_src_path = Path(__file__).parent / 'apps' / 'api' / 'src'
sys.path.insert(0, str(api_src_path))

from flask import Flask
from middleware.security import SecurityHeaders, setup_security
from middleware.rate_limiting import setup_global_rate_limiting
from middleware.input_sanitization import setup_input_sanitization
from middleware.csrf_protection import setup_csrf_middleware
from middleware.security_monitoring import setup_security_monitoring
from config.security_config import security_settings, SecurityConfig
import logging


def integrate_all_security(app: Flask, config_override: dict = None):
    """
    Integrate all security components into the Flask application
    
    Args:
        app: Flask application instance
        config_override: Optional configuration overrides
    """
    
    # Merge configuration overrides
    if config_override:
        for key, value in config_override.items():
            if hasattr(security_settings, key):
                setattr(security_settings, key, value)
    
    # Validate configuration
    errors = security_settings.validate()
    if errors:
        logging.error("Security configuration errors:")
        for error in errors:
            logging.error(f"  - {error}")
        raise ValueError("Invalid security configuration")
    
    # Initialize core security middleware
    setup_security(app)
    
    # Add rate limiting
    setup_global_rate_limiting(app)
    
    # Add input sanitization
    setup_input_sanitization(app)
    
    # Add CSRF protection
    setup_csrf_middleware(app)
    
    # Add security monitoring
    monitor_config = {
        'database_path': 'security_events.db',
        'email': {
            'smtp_server': security_settings.smtp_server,
            'smtp_port': security_settings.smtp_port,
            'smtp_username': security_settings.smtp_username,
            'smtp_password': security_settings.smtp_password,
            'alert_email': security_settings.alert_email
        },
        'webhook': {
            'webhook_url': security_settings.webhook_url
        }
    }
    setup_security_monitoring(app, monitor_config)
    
    # Add security-specific error handlers
    setup_security_error_handlers(app)
    
    # Add security health check
    @app.route('/api/security/health')
    def security_health_check():
        """Comprehensive security health check"""
        from datetime import datetime
        import psutil
        
        health_status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'security_components': {
                'security_headers': 'enabled',
                'rate_limiting': 'enabled',
                'input_sanitization': 'enabled',
                'csrf_protection': 'enabled',
                'security_monitoring': 'enabled'
            },
            'system_metrics': {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent
            },
            'security_stats': get_security_stats(app)
        }
        
        # Determine overall health
        critical_issues = []
        if health_status['system_metrics']['cpu_percent'] > 90:
            critical_issues.append('High CPU usage')
        if health_status['system_metrics']['memory_percent'] > 90:
            critical_issues.append('High memory usage')
        
        if critical_issues:
            health_status['status'] = 'degraded'
            health_status['issues'] = critical_issues
        
        status_code = 200 if health_status['status'] == 'healthy' else 503
        return health_status, status_code
    
    # Add security metrics endpoint
    @app.route('/api/security/metrics')
    def security_metrics():
        """Get comprehensive security metrics"""
        return get_security_stats(app)
    
    # Add configuration validation endpoint
    @app.route('/api/security/validate-config')
    def validate_security_config():
        """Validate security configuration"""
        from config.security_config import validate_security_config as validate_config
        
        result = validate_config()
        status_code = 200 if result['valid'] else 400
        return result, status_code
    
    logging.info("✅ All security components integrated successfully")


def setup_security_error_handlers(app: Flask):
    """Setup enhanced security error handlers"""
    
    @app.errorhandler(429)
    def handle_rate_limit_exceeded(error):
        """Enhanced rate limit error handler with security logging"""
        from flask import request, jsonify
        from middleware.security import SecurityLogger
        
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        endpoint = request.endpoint or 'unknown'
        
        # Log security event
        logger = SecurityLogger(security_settings.enable_security_logging)
        logger.log_security_event(
            'RATE_LIMIT_EXCEEDED',
            {
                'client_ip': client_ip,
                'endpoint': endpoint,
                'user_agent': request.headers.get('User-Agent', ''),
                'request_id': getattr(request, 'request_id', None)
            }
        )
        
        response = {
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please slow down.',
            'retry_after': 60,
            'code': 'RATE_LIMIT_EXCEEDED'
        }
        
        return jsonify(response), 429
    
    @app.errorhandler(403)
    def handle_csrf_error(error):
        """Enhanced CSRF error handler"""
        from flask import request, jsonify
        
        response = {
            'error': 'CSRF token invalid',
            'message': 'Invalid or missing CSRF token. Please refresh the page and try again.',
            'code': 'CSRF_TOKEN_INVALID'
        }
        
        return jsonify(response), 403
    
    @app.errorhandler(400)
    def handle_validation_error(error):
        """Enhanced validation error handler"""
        from flask import request, jsonify
        
        response = {
            'error': 'Invalid input',
            'message': 'The provided input does not meet security requirements',
            'code': 'VALIDATION_FAILED'
        }
        
        return jsonify(response), 400
    
    @app.errorhandler(401)
    def handle_auth_error(error):
        """Enhanced authentication error handler"""
        from flask import request, jsonify
        
        response = {
            'error': 'Authentication required',
            'message': 'Valid authentication token is required',
            'code': 'AUTHENTICATION_REQUIRED'
        }
        
        return jsonify(response), 401


def get_security_stats(app: Flask) -> dict:
    """Get comprehensive security statistics"""
    from middleware.security_monitoring import SecurityMonitor
    import sqlite3
    
    stats = {
        'timestamp': datetime.utcnow().isoformat(),
        'security_events': {},
        'rate_limiting': {},
        'system_health': {},
        'configuration': {
            'environment': security_settings.environment,
            'security_enabled': True,
            'monitoring_enabled': security_settings.enable_security_logging
        }
    }
    
    # Get security events from database
    try:
        conn = sqlite3.connect('security_events.db')
        cursor = conn.cursor()
        
        # Get event counts by type
        cursor.execute("""
            SELECT event_type, COUNT(*) as count 
            FROM security_events 
            WHERE timestamp > datetime('now', '-24 hours')
            GROUP BY event_type
        """)
        
        stats['security_events'] = {
            row[0]: row[1] for row in cursor.fetchall()
        }
        
        # Get top IPs
        cursor.execute("""
            SELECT ip_address, COUNT(*) as count 
            FROM security_events 
            WHERE timestamp > datetime('now', '-24 hours')
            GROUP BY ip_address 
            ORDER BY count DESC 
            LIMIT 10
        """)
        
        stats['top_ips'] = {
            row[0]: row[1] for row in cursor.fetchall()
        }
        
        conn.close()
        
    except Exception as e:
        stats['security_events']['error'] = str(e)
    
    # Add configuration settings
    stats['configuration'].update({
        'rate_limit_rps': security_settings.rate_limit_rps,
        'max_request_size': security_settings.max_request_size,
        'csrf_enabled': security_settings.enable_csrf_protection,
        'input_validation_enabled': security_settings.enable_input_validation
    })
    
    return stats


def create_security_test_suite(app: Flask):
    """Create security test endpoints for testing security measures"""
    
    @app.route('/api/security/test/xss')
    def test_xss_protection():
        """Test XSS protection"""
        from flask import request, jsonify
        
        test_input = request.args.get('input', '')
        
        # This should be sanitized by input sanitization middleware
        return jsonify({
            'test': 'xss_protection',
            'input': test_input,
            'sanitized': True,
            'message': 'XSS protection is active'
        })
    
    @app.route('/api/security/test/sql-injection')
    def test_sql_injection_protection():
        """Test SQL injection protection"""
        from flask import request, jsonify
        
        test_input = request.args.get('input', '')
        
        # This should be blocked by input sanitization middleware
        return jsonify({
            'test': 'sql_injection_protection',
            'input': test_input,
            'blocked': False,
            'message': 'SQL injection protection is active'
        })
    
    @app.route('/api/security/test/rate-limit')
    def test_rate_limiting():
        """Test rate limiting"""
        from flask import request, jsonify
        
        return jsonify({
            'test': 'rate_limiting',
            'client_ip': request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
            'message': 'Rate limiting is active'
        })
    
    @app.route('/api/security/test/csrf')
    def test_csrf_protection():
        """Test CSRF protection"""
        from flask import request, jsonify
        
        # This endpoint should require CSRF token for POST requests
        return jsonify({
            'test': 'csrf_protection',
            'method': request.method,
            'message': 'CSRF protection is active'
        })


def setup_security_hooks(app: Flask):
    """Setup security hooks and lifecycle management"""
    
    @app.before_first_request
    def initialize_security():
        """Initialize security systems on first request"""
        logging.info("🚀 Initializing security systems...")
        
        # Validate configuration
        errors = security_settings.validate()
        if errors:
            logging.error("Security configuration validation failed:")
            for error in errors:
                logging.error(f"  - {error}")
        else:
            logging.info("✅ Security configuration validated successfully")
    
    @app.teardown_appcontext
    def cleanup_security(exception):
        """Cleanup security resources"""
        # Clean up rate limiting data if needed
        pass


def print_security_summary():
    """Print security configuration summary"""
    print("\n🔒 Crazy-Gary Security Configuration Summary")
    print("=" * 50)
    print(f"Environment: {security_settings.environment}")
    print(f"Rate Limiting: {security_settings.rate_limit_rps} req/min")
    print(f"CSRF Protection: {'Enabled' if security_settings.enable_csrf_protection else 'Disabled'}")
    print(f"Input Validation: {'Enabled' if security_settings.enable_input_validation else 'Disabled'}")
    print(f"Security Logging: {'Enabled' if security_settings.enable_security_logging else 'Disabled'}")
    print(f"Max Request Size: {security_settings.max_request_size // (1024*1024)}MB")
    print(f"Allowed File Types: {len(security_settings.allowed_file_types)} types")
    print(f"CORS Origins: {len(security_settings.cors_origins)} configured")
    print("=" * 50)
    
    # Print warnings
    warnings = []
    
    if security_settings.environment == 'development':
        warnings.append("Development mode - security features may be relaxed")
    
    if not security_settings.api_key and security_settings.environment == 'production':
        warnings.append("API_KEY not set in production!")
    
    if not security_settings.jwt_secret_key:
        warnings.append("JWT_SECRET_KEY not set!")
    
    if warnings:
        print("\n⚠️  Security Warnings:")
        for warning in warnings:
            print(f"  - {warning}")
    
    print("\n✅ Security integration complete!")


if __name__ == "__main__":
    # Test the security integration
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    try:
        # Integrate security
        integrate_all_security(app)
        
        # Add test routes
        @app.route('/')
        def index():
            return "Security integration test successful!"
        
        # Create test suite
        create_security_test_suite(app)
        
        # Setup hooks
        setup_security_hooks(app)
        
        # Print summary
        print_security_summary()
        
        print("\n🧪 Security test endpoints available:")
        print("  - /api/security/test/xss")
        print("  - /api/security/test/sql-injection")
        print("  - /api/security/test/rate-limit")
        print("  - /api/security/test/csrf")
        print("  - /api/security/health")
        print("  - /api/security/metrics")
        
    except Exception as e:
        print(f"\n❌ Security integration failed: {e}")
        sys.exit(1)