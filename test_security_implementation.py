#!/usr/bin/env python3
"""
Security Implementation Test Suite
Tests all security features and validates proper functionality
"""

import os
import sys
import json
import time
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps', 'api', 'src'))

from flask import Flask, request, g
from middleware.security import (
    SecurityConfig, RedisRateLimiter, InputValidator, SecurityLogger,
    PerformanceMonitor, SecurityHeaders, setup_security,
    require_api_key, require_auth_token, require_role, validate_jwt_token,
    scan_vulnerability, monitor_performance
)
from utils.enhanced_security import (
    SecurityValidator, DataSanitizer, CryptographicUtils,
    SecuritySchemas, SecurityMetrics
)
from utils.security_monitor import (
    SecurityMonitor, SecurityAlert, AlertSeverity, SecurityConfigManager
)


class TestSecurityConfig:
    """Test SecurityConfig class"""
    
    def test_default_config(self):
        """Test default configuration values"""
        config = SecurityConfig()
        
        assert config.rate_limit_rps == 10
        assert config.rate_limit_burst == 100
        assert config.max_request_size == 16 * 1024 * 1024
        assert config.enable_security_logging is True
        assert config.enable_performance_monitoring is True
        assert isinstance(config.allowed_content_types, list)
    
    def test_environment_config(self):
        """Test configuration from environment variables"""
        with patch.dict(os.environ, {
            'RATE_LIMIT_RPS': '20',
            'RATE_LIMIT_BURST': '200',
            'ENABLE_SECURITY_LOGGING': 'false'
        }):
            config = SecurityConfig()
            assert config.rate_limit_rps == 20
            assert config.rate_limit_burst == 200
            assert config.enable_security_logging is False
    
    def test_suspicious_patterns(self):
        """Test suspicious pattern loading"""
        config = SecurityConfig()
        patterns = config.suspicious_patterns
        
        assert len(patterns) > 0
        assert any('union' in pattern for pattern in patterns)
        assert any('script' in pattern for pattern in patterns)


class TestInputValidator:
    """Test InputValidator class"""
    
    def test_sql_injection_detection(self):
        """Test SQL injection pattern detection"""
        malicious_inputs = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "admin'--",
            "UNION SELECT * FROM users"
        ]
        
        for input_data in malicious_inputs:
            assert InputValidator.validate_input(input_data, "test_field")[0] is False
    
    def test_xss_detection(self):
        """Test XSS pattern detection"""
        malicious_inputs = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "onload=alert('xss')"
        ]
        
        for input_data in malicious_inputs:
            assert InputValidator.validate_input(input_data, "test_field")[0] is False
    
    def test_path_traversal_detection(self):
        """Test path traversal detection"""
        malicious_inputs = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2f"
        ]
        
        for input_data in malicious_inputs:
            assert InputValidator.validate_input(input_data, "test_field")[0] is False
    
    def test_valid_input_sanitization(self):
        """Test valid input passes validation and gets sanitized"""
        valid_inputs = [
            "Hello World",
            "User <b>name</b>",
            "Simple text input"
        ]
        
        for input_data in valid_inputs:
            valid, sanitized = InputValidator.validate_input(input_data, "test_field")
            assert valid is True
            assert isinstance(sanitized, str)
    
    def test_html_sanitization(self):
        """Test HTML content sanitization"""
        html_input = "Hello <b>world</b> with <script>alert('bad')</script>"
        valid, sanitized = InputValidator.validate_input(html_input, "test_field")
        
        assert valid is True
        assert "<script>" not in sanitized
        assert "<b>world</b>" in sanitized
    
    def test_dict_validation(self):
        """Test dictionary input validation"""
        test_dict = {
            "name": "John Doe",
            "email": "john@example.com",
            "bio": "Software engineer"
        }
        
        valid, sanitized = InputValidator.validate_input(test_dict, "user_data")
        assert valid is True
        assert sanitized["name"] == "John Doe"
    
    def test_malicious_dict_validation(self):
        """Test malicious dictionary input validation"""
        malicious_dict = {
            "name": "John",
            "bio": "<script>alert('xss')</script>",
            "special": "../../../etc/passwd"
        }
        
        valid, sanitized = InputValidator.validate_input(malicious_dict, "user_data")
        assert valid is False


class TestSecurityValidator:
    """Test SecurityValidator class"""
    
    def test_sql_injection_validation(self):
        """Test SQL injection validation"""
        validator = SecurityValidator()
        
        # Test malicious inputs
        assert validator.validate_sql_injection("'; DROP TABLE users; --") is True
        assert validator.validate_sql_injection("UNION SELECT * FROM users") is True
        assert validator.validate_sql_injection("admin' OR '1'='1") is True
        
        # Test safe inputs
        assert validator.validate_sql_injection("Hello World") is False
        assert validator.validate_sql_injection("User123") is False
    
    def test_xss_validation(self):
        """Test XSS validation"""
        validator = SecurityValidator()
        
        # Test malicious inputs
        assert validator.validate_xss("<script>alert('xss')</script>") is True
        assert validator.validate_xss("javascript:alert('xss')") is True
        assert validator.validate_xss("<img src=x onerror=alert('xss')>") is True
        
        # Test safe inputs
        assert validator.validate_xss("Hello World") is False
        assert validator.validate_xss("Simple text") is False
    
    def test_email_validation(self):
        """Test email validation"""
        validator = SecurityValidator()
        
        # Valid emails
        assert validator.validate_email("user@example.com") is True
        assert validator.validate_email("test.user@domain.co.uk") is True
        
        # Invalid emails
        assert validator.validate_email("invalid-email") is False
        assert validator.validate_email("user@") is False
        assert validator.validate_email("user@domain") is False
        assert validator.validate_email("user..name@example.com") is False
    
    def test_password_strength_validation(self):
        """Test password strength validation"""
        validator = SecurityValidator()
        
        # Weak passwords
        result = validator.validate_password_strength("12345678")
        assert result['valid'] is False
        assert 'uppercase' in str(result['issues']).lower()
        
        result = validator.validate_password_strength("password")
        assert result['valid'] is False
        
        # Strong password
        result = validator.validate_password_strength("MyStr0ng!Pass123")
        assert result['valid'] is True
        assert result['strength'] == 'strong'


class TestDataSanitizer:
    """Test DataSanitizer class"""
    
    def test_html_sanitization(self):
        """Test HTML content sanitization"""
        sanitizer = DataSanitizer()
        
        dirty_html = "<p>Hello</p> <script>alert('bad')</script> <b>world</b>"
        clean_html = sanitizer.sanitize_html(dirty_html)
        
        assert "<script>" not in clean_html
        assert "<p>Hello</p>" in clean_html
        assert "<b>world</b>" in clean_html
    
    def test_filename_sanitization(self):
        """Test filename sanitization"""
        sanitizer = DataSanitizer()
        
        # Test dangerous characters
        dirty_filename = "../../../etc/passwd"
        clean_filename = sanitizer.sanitize_filename(dirty_filename)
        assert ".." not in clean_filename
        
        # Test length limit
        long_filename = "a" * 300 + ".txt"
        clean_filename = sanitizer.sanitize_filename(long_filename)
        assert len(clean_filename) <= 255
    
    def test_user_input_sanitization(self):
        """Test user input sanitization"""
        sanitizer = DataSanitizer()
        
        dirty_input = "Hello <script>alert('xss')</script> World"
        clean_input = sanitizer.sanitize_user_input(dirty_input)
        
        assert "<script>" not in clean_input
        assert "Hello" in clean_input
        assert "World" in clean_input


class TestCryptographicUtils:
    """Test CryptographicUtils class"""
    
    def test_secure_token_generation(self):
        """Test secure token generation"""
        crypto = CryptographicUtils()
        
        token1 = crypto.generate_secure_token()
        token2 = crypto.generate_secure_token()
        
        assert len(token1) > 0
        assert len(token2) > 0
        assert token1 != token2  # Tokens should be unique
    
    def test_password_hashing(self):
        """Test password hashing and verification"""
        crypto = CryptographicUtils()
        
        password = "MySecret123!"
        password_hash, salt = crypto.hash_password(password)
        
        assert len(password_hash) > 0
        assert len(salt) > 0
        
        # Verify correct password
        assert crypto.verify_password(password, password_hash, salt) is True
        
        # Verify wrong password
        assert crypto.verify_password("WrongPassword", password_hash, salt) is False
    
    def test_signature_generation(self):
        """Test HMAC signature generation and verification"""
        crypto = CryptographicUtils()
        
        data = "test data"
        secret = "test secret"
        
        signature = crypto.generate_signature(data, secret)
        assert len(signature) > 0
        
        # Verify correct signature
        assert crypto.verify_signature(data, signature, secret) is True
        
        # Verify wrong signature
        assert crypto.verify_signature(data, "wrong_signature", secret) is False


class TestRedisRateLimiter:
    """Test RedisRateLimiter class"""
    
    @patch('redis.from_url')
    def test_rate_limiting(self, mock_redis):
        """Test rate limiting functionality"""
        # Mock Redis client
        mock_client = Mock()
        mock_redis.return_value = mock_client
        
        limiter = RedisRateLimiter("redis://localhost:6379")
        
        # Test rate limit check (should pass)
        result = limiter.check_rate_limit("test_key", 10, 60)
        assert result is True
        
        # Mock Redis to return exceeded requests
        mock_client.pipeline.return_value.execute.return_value = [0, 11]  # 11 requests
        result = limiter.check_rate_limit("test_key", 10, 60)
        assert result is False
    
    def test_memory_fallback(self):
        """Test memory cache fallback when Redis fails"""
        with patch('redis.from_url') as mock_redis:
            # Make Redis connection fail
            mock_redis.side_effect = Exception("Connection failed")
            
            limiter = RedisRateLimiter("redis://localhost:6379")
            assert limiter.redis_client is None
            assert hasattr(limiter, '_memory_cache')


class TestSecurityMonitor:
    """Test SecurityMonitor class"""
    
    def test_security_metrics(self):
        """Test security metrics collection"""
        config = SecurityConfig()
        monitor = SecurityMonitor(config)
        
        # Record some requests
        monitor.record_request("192.168.1.100", suspicious=True)
        monitor.record_request("192.168.1.101", blocked=True)
        monitor.record_request("192.168.1.102")
        
        metrics = monitor.get_metrics()
        
        assert metrics['requests_total'] == 3
        assert metrics['requests_blocked'] == 1
        assert metrics['suspicious_requests'] == 1
        assert metrics['unique_ips'] == 3
    
    def test_auth_failure_recording(self):
        """Test authentication failure recording"""
        config = SecurityConfig()
        monitor = SecurityMonitor(config)
        
        # Record multiple auth failures
        for i in range(3):
            monitor.record_auth_failure("192.168.1.100", f"user{i}")
        
        metrics = monitor.get_metrics()
        assert metrics['auth_failures'] == 3
    
    def test_alert_creation(self):
        """Test security alert creation"""
        config = SecurityConfig()
        monitor = SecurityMonitor(config)
        
        monitor.create_alert(
            alert_type="TEST_ALERT",
            severity=AlertSeverity.WARNING,
            message="Test alert message",
            source_ip="192.168.1.100"
        )
        
        assert len(monitor.alerts) == 1
        assert monitor.alerts[0].alert_type == "TEST_ALERT"
        assert monitor.alerts[0].severity == AlertSeverity.WARNING


class TestSecurityHeaders:
    """Test SecurityHeaders class"""
    
    def test_security_headers_configuration(self):
        """Test security headers are properly configured"""
        app = Flask(__name__)
        
        with app.app_context():
            config = SecurityConfig()
            headers = SecurityHeaders(app, config)
            
            # Test that headers are configured
            assert hasattr(headers, 'add_security_headers')
            assert hasattr(headers, 'security_checks')


class TestFlaskIntegration:
    """Test Flask integration"""
    
    def test_security_setup(self):
        """Test Flask security setup"""
        app = Flask(__name__)
        
        # Setup security
        setup_security(app)
        
        # Check that security is configured
        assert 'SECURITY_CONFIG' in app.config
        assert 'PERFORMANCE_MONITOR' in app.config
        assert 'SECURITY_LOGGER' in app.config
    
    def test_api_key_decorator(self):
        """Test API key decorator"""
        app = Flask(__name__)
        app.config['TESTING'] = True
        
        with app.test_client() as client:
            with app.app_context():
                setup_security(app)
                
                @app.route('/test')
                @require_api_key
                def test_endpoint():
                    return {'message': 'success'}
                
                # Test without API key
                response = client.get('/test')
                assert response.status_code == 401
                
                # Test with wrong API key
                response = client.get('/test', headers={'X-API-Key': 'wrong'})
                assert response.status_code == 401
                
                # Test with correct API key (set environment variable for testing)
                os.environ['API_KEY'] = 'test_key'
                response = client.get('/test', headers={'X-API-Key': 'test_key'})
                assert response.status_code == 200


class TestVulnerabilityScanning:
    """Test vulnerability scanning functionality"""
    
    def test_vulnerability_scan_decorator(self):
        """Test vulnerability scanning decorator"""
        app = Flask(__name__)
        
        with app.test_client() as client:
            with app.app_context():
                setup_security(app)
                
                @app.route('/test')
                @scan_vulnerability
                def test_endpoint():
                    return {'message': 'success'}
                
                # Test with safe input
                response = client.get('/test?query=safe')
                assert response.status_code == 200
                
                # Test with SQL injection attempt
                response = client.get('/test?query=UNION%20SELECT')
                assert response.status_code == 400


class TestPerformanceMonitoring:
    """Test performance monitoring"""
    
    def test_performance_monitoring_decorator(self):
        """Test performance monitoring decorator"""
        app = Flask(__name__)
        
        with app.test_client() as client:
            with app.app_context():
                setup_security(app)
                
                @app.route('/test')
                @monitor_performance
                def test_endpoint():
                    time.sleep(0.01)  # Simulate some processing
                    return {'message': 'success'}
                
                response = client.get('/test')
                assert response.status_code == 200


class TestSecuritySchemas:
    """Test security schemas"""
    
    def test_user_registration_schema(self):
        """Test user registration schema validation"""
        schema = SecuritySchemas.UserRegistrationSchema()
        
        # Valid data
        valid_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!'
        }
        
        result = schema.load(valid_data)
        assert 'username' in result
        
        # Invalid data - password mismatch
        invalid_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'SecurePass123!',
            'confirm_password': 'DifferentPass123!'
        }
        
        try:
            schema.load(invalid_data)
            assert False, "Should have raised ValidationError"
        except ValidationError:
            pass  # Expected
    
    def test_login_schema(self):
        """Test login schema validation"""
        schema = SecuritySchemas.LoginSchema()
        
        # Valid data
        valid_data = {
            'username': 'testuser',
            'password': 'password123'
        }
        
        result = schema.load(valid_data)
        assert result['username'] == 'testuser'


class TestSecurityConfigManager:
    """Test SecurityConfigManager class"""
    
    def test_default_config_creation(self):
        """Test default configuration creation"""
        config = SecurityConfigManager.create_default_config('test_config.yaml')
        
        assert isinstance(config, SecurityConfig)
        assert config.rate_limit_rps == 10
    
    def test_config_validation(self):
        """Test configuration validation"""
        config = SecurityConfig()
        issues = SecurityConfigManager.validate_config(config)
        
        # Should have no issues with default config
        assert len(issues) == 0
        
        # Test with invalid config
        config.rate_limit_rps = -1
        issues = SecurityConfigManager.validate_config(config)
        assert len(issues) > 0


def run_security_tests():
    """Run all security tests"""
    print("Running Security Implementation Tests...")
    print("=" * 50)
    
    test_classes = [
        TestSecurityConfig,
        TestInputValidator,
        TestSecurityValidator,
        TestDataSanitizer,
        TestCryptographicUtils,
        TestRedisRateLimiter,
        TestSecurityMonitor,
        TestSecurityHeaders,
        TestFlaskIntegration,
        TestVulnerabilityScanning,
        TestPerformanceMonitoring,
        TestSecuritySchemas,
        TestSecurityConfigManager
    ]
    
    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    
    for test_class in test_classes:
        print(f"\nTesting {test_class.__name__}:")
        print("-" * 30)
        
        # Get all test methods
        test_methods = [method for method in dir(test_class) if method.startswith('test_')]
        
        for test_method_name in test_methods:
            total_tests += 1
            test_method = getattr(test_class, test_method_name)
            
            try:
                # Create test instance and run method
                test_instance = test_class()
                test_method(test_instance)
                print(f"✓ {test_method_name}")
                passed_tests += 1
            except Exception as e:
                print(f"✗ {test_method_name}: {str(e)}")
                failed_tests += 1
    
    print("\n" + "=" * 50)
    print("Test Results:")
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if failed_tests == 0:
        print("\n🎉 All security tests passed!")
        return True
    else:
        print(f"\n⚠️  {failed_tests} tests failed. Please review the implementation.")
        return False


if __name__ == '__main__':
    # Set test environment variables
    os.environ['ENVIRONMENT'] = 'test'
    os.environ['API_KEY'] = 'test_key'
    
    # Run tests
    success = run_security_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)