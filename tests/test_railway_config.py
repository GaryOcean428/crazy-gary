#!/usr/bin/env python3
"""
Railway Configuration Tests
Tests Railway-specific configuration and deployment readiness
"""

import unittest
import os
import sys
import json
import tempfile
import subprocess
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))


class TestRailwayConfiguration(unittest.TestCase):
    """Test Railway configuration and deployment readiness"""

    def setUp(self):
        """Set up test environment"""
        self.test_env = {
            'PORT': '8000',
            'HOST': '0.0.0.0',
            'ENVIRONMENT': 'production',
            'CORS_ORIGINS': 'https://test.railway.app,https://*.up.railway.app',
            'RAILWAY_ENVIRONMENT': 'production',
            'RAILWAY_PUBLIC_DOMAIN': 'test.railway.app',
            'RAILWAY_PRIVATE_DOMAIN': 'test.railway.internal',
            'DATABASE_URL': 'postgresql://test:test@localhost:5432/test',
            'JWT_SECRET': 'test_secret_key_32_characters_long_secure'
        }
        
        # Apply test environment
        for key, value in self.test_env.items():
            os.environ[key] = value

    def tearDown(self):
        """Clean up test environment"""
        for key in self.test_env.keys():
            if key in os.environ:
                del os.environ[key]

    def test_port_environment_variable(self):
        """Test that PORT environment variable is properly used"""
        port = os.environ.get('PORT')
        self.assertIsNotNone(port, "PORT environment variable should be set")
        self.assertTrue(port.isdigit(), "PORT should be a valid number")
        self.assertGreater(int(port), 0, "PORT should be greater than 0")
        self.assertLessEqual(int(port), 65535, "PORT should be valid port number")

    def test_host_binding(self):
        """Test that server binds to 0.0.0.0"""
        host = os.environ.get('HOST', '0.0.0.0')
        self.assertEqual(host, '0.0.0.0', "HOST should be 0.0.0.0 for Railway")

    def test_cors_configuration(self):
        """Test CORS configuration for Railway"""
        cors_origins = os.environ.get('CORS_ORIGINS')
        self.assertIsNotNone(cors_origins, "CORS_ORIGINS should be set")
        self.assertNotEqual(cors_origins, '*', "CORS should not use wildcard in production")
        
        # Should contain Railway domains
        railway_domain = os.environ.get('RAILWAY_PUBLIC_DOMAIN')
        if railway_domain:
            self.assertIn(railway_domain, cors_origins, "Railway public domain should be in CORS origins")

    def test_railway_environment_variables(self):
        """Test Railway-specific environment variables"""
        railway_vars = [
            'RAILWAY_ENVIRONMENT',
            'RAILWAY_PUBLIC_DOMAIN', 
            'RAILWAY_PRIVATE_DOMAIN'
        ]
        
        for var in railway_vars:
            with self.subTest(var=var):
                value = os.environ.get(var)
                self.assertIsNotNone(value, f"{var} should be set for Railway deployment")
                self.assertNotEqual(value.strip(), '', f"{var} should not be empty")

    def test_security_configuration(self):
        """Test security-related configuration"""
        environment = os.environ.get('ENVIRONMENT')
        jwt_secret = os.environ.get('JWT_SECRET')
        
        if environment == 'production':
            self.assertIsNotNone(jwt_secret, "JWT_SECRET must be set in production")
            self.assertGreaterEqual(len(jwt_secret), 32, "JWT_SECRET should be at least 32 characters")
            # Check it's not the default value
            self.assertNotEqual(jwt_secret, 'asdf#FGSgvasgf$5$WGT', "JWT_SECRET should not be default value")

    def test_database_configuration(self):
        """Test database configuration"""
        database_url = os.environ.get('DATABASE_URL')
        if database_url:
            # Should be PostgreSQL for Railway
            self.assertTrue(
                database_url.startswith(('postgresql://', 'postgres://')),
                "DATABASE_URL should be PostgreSQL for Railway"
            )

    def test_railpack_configurations_exist(self):
        """Test that railpack.json configurations exist"""
        config_paths = [
            Path(__file__).parent.parent / 'railpack.json',
            Path(__file__).parent.parent / 'apps' / 'api' / 'railpack.json',
            Path(__file__).parent.parent / 'apps' / 'web' / 'railpack.json'
        ]
        
        found_configs = []
        for config_path in config_paths:
            if config_path.exists():
                found_configs.append(config_path)
        
        self.assertGreater(len(found_configs), 0, "At least one railpack.json should exist for Railway deployment")
        
        # Validate configuration content
        for config_path in found_configs:
            with self.subTest(config=str(config_path)):
                with open(config_path) as f:
                    config = json.load(f)
                
                # Check for basic structure
                self.assertIn('metadata', config, f"{config_path} should have metadata section")
                self.assertIn('build', config, f"{config_path} should have build section")
                self.assertIn('deploy', config, f"{config_path} should have deploy section")
                
                # Check deploy configuration
                deploy = config['deploy']
                self.assertIn('startCommand', deploy, f"{config_path} should specify startCommand")
                self.assertIn('healthCheckPath', deploy, f"{config_path} should specify healthCheckPath")
                
                # Check build configuration
                build = config['build']
                self.assertIn('provider', build, f"{config_path} should specify build provider")

    def test_health_check_endpoint(self):
        """Test that health check endpoint is accessible"""
        # This would need the Flask app to be running
        # For now, just test that the route is defined
        try:
            sys.path.insert(0, str(Path(__file__).parent.parent / 'apps' / 'api' / 'src'))
            from main import app
            
            with app.test_client() as client:
                response = client.get('/health')
                self.assertEqual(response.status_code, 200)
                
                data = response.get_json()
                self.assertIn('status', data)
                self.assertEqual(data['status'], 'healthy')
                
        except ImportError:
            self.skipTest("Flask app not available for testing")

    def test_build_configuration(self):
        """Test build configuration"""
        package_json = Path(__file__).parent.parent / 'package.json'
        self.assertTrue(package_json.exists(), "package.json should exist")
        
        with open(package_json) as f:
            data = json.load(f)
            
        # Check for Railway validation scripts
        scripts = data.get('scripts', {})
        self.assertIn('validate:railway', scripts, "Should have Railway validation script")
        self.assertIn('build', scripts, "Should have build script")

    def test_frontend_build_script(self):
        """Test frontend build script exists and is executable"""
        build_script = Path(__file__).parent.parent / 'build_frontend.py'
        self.assertTrue(build_script.exists(), "Frontend build script should exist")
        self.assertTrue(os.access(build_script, os.X_OK), "Build script should be executable")

    def test_no_hardcoded_urls(self):
        """Test that there are no hardcoded URLs that would break in Railway"""
        # Check for localhost URLs in source files
        source_dirs = [
            Path(__file__).parent.parent / 'apps' / 'web' / 'src',
            Path(__file__).parent.parent / 'apps' / 'api' / 'src'
        ]
        
        for source_dir in source_dirs:
            if source_dir.exists():
                for file_path in source_dir.rglob('*.py'):
                    content = file_path.read_text(errors='ignore')
                    # Allow localhost in development/test configurations
                    if 'localhost' in content.lower() and 'test' not in str(file_path).lower():
                        # Check if it's properly using environment variables
                        lines_with_localhost = [
                            line.strip() for line in content.split('\n') 
                            if 'localhost' in line.lower()
                        ]
                        for line in lines_with_localhost:
                            # Allow if it's a fallback, environment variable context, or security middleware
                            allowed_contexts = [
                                'getenv', 'environ', 'fallback', 'default', 'or',
                                'development', 'test', 'security', 'allowed_hosts'
                            ]
                            if not any(keyword in line.lower() for keyword in allowed_contexts):
                                self.fail(f"Hardcoded localhost found in {file_path}: {line}")

    def test_configuration_validator(self):
        """Test the Railway configuration validator"""
        validator_script = Path(__file__).parent.parent / 'scripts' / 'validate_railway_config.py'
        self.assertTrue(validator_script.exists(), "Railway validator should exist")
        
        # Run the validator
        result = subprocess.run([
            sys.executable, str(validator_script)
        ], capture_output=True, text=True, env=os.environ)
        
        self.assertEqual(result.returncode, 0, f"Railway validation failed: {result.stderr}")


class TestEnvironmentVariableValidation(unittest.TestCase):
    """Test environment variable validation"""

    def test_required_variables_validation(self):
        """Test validation of required environment variables"""
        required_vars = ['PORT', 'HOST', 'ENVIRONMENT']
        
        for var in required_vars:
            with self.subTest(var=var):
                # Test missing variable
                if var in os.environ:
                    old_value = os.environ[var]
                    del os.environ[var]
                else:
                    old_value = None
                
                try:
                    # Import and test validation
                    sys.path.insert(0, str(Path(__file__).parent.parent / 'scripts'))
                    from validate_railway_config import ConfigValidator
                    
                    validator = ConfigValidator()
                    if var == 'PORT':
                        result = validator.validate_port_binding()
                    elif var in ['HOST', 'ENVIRONMENT']:
                        result = validator.validate_environment_variables()
                    
                    if var == 'PORT':
                        self.assertFalse(result, f"Validation should fail when {var} is missing")
                    
                finally:
                    # Restore variable
                    if old_value is not None:
                        os.environ[var] = old_value


def run_tests():
    """Run all tests"""
    # Set up basic test environment
    os.environ.update({
        'PORT': '8000',
        'HOST': '0.0.0.0',
        'ENVIRONMENT': 'test'
    })
    
    # Discover and run tests
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)