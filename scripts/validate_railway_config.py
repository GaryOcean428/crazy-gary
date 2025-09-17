#!/usr/bin/env python3
"""
Railway Configuration Validator
Validates environment variables and configurations for Railway deployment
Based on Railway Deployment Master Cheat Sheet (RAILWAY_DEPLOYMENT_CHEAT_SHEET.md)
"""

import os
import sys
import json
from typing import Dict, List, Tuple, Optional


class ConfigValidator:
    """Validates Railway configuration and environment variables"""
    
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.required_vars = [
            'PORT',
            'HOST', 
            'ENVIRONMENT'
        ]
        self.recommended_vars = [
            'DATABASE_URL',
            'HUGGINGFACE_API_KEY',
            'JWT_SECRET',
            'CORS_ORIGINS'
        ]
        self.railway_vars = [
            'RAILWAY_PUBLIC_DOMAIN',
            'RAILWAY_PRIVATE_DOMAIN', 
            'RAILWAY_ENVIRONMENT'
        ]

    def validate_port_binding(self) -> bool:
        """Validate PORT environment variable usage"""
        port = os.getenv('PORT')
        host = os.getenv('HOST', '0.0.0.0')
        
        if not port:
            self.errors.append("PORT environment variable not set")
            return False
            
        try:
            port_int = int(port)
            if port_int < 1 or port_int > 65535:
                self.errors.append(f"PORT value {port_int} is not a valid port number")
                return False
        except ValueError:
            self.errors.append(f"PORT value '{port}' is not a valid integer")
            return False
            
        if host != '0.0.0.0':
            self.warnings.append(f"HOST is set to '{host}', Railway recommends '0.0.0.0'")
            
        return True

    def validate_cors_configuration(self) -> bool:
        """Validate CORS configuration for Railway"""
        cors_origins = os.getenv('CORS_ORIGINS')
        
        if not cors_origins:
            self.warnings.append("CORS_ORIGINS not set, using wildcard (not recommended for production)")
            return True
            
        if cors_origins == '*':
            self.warnings.append("CORS_ORIGINS is wildcard '*' (not recommended for production)")
            return True
            
        # Check if Railway domains are included
        railway_public = os.getenv('RAILWAY_PUBLIC_DOMAIN')
        if railway_public and railway_public not in cors_origins:
            self.warnings.append(f"Railway public domain {railway_public} not in CORS_ORIGINS")
            
        return True

    def validate_environment_variables(self) -> bool:
        """Validate required and recommended environment variables"""
        all_valid = True
        
        # Check required variables
        for var in self.required_vars:
            if not os.getenv(var):
                self.errors.append(f"Required environment variable '{var}' is not set")
                all_valid = False
        
        # Check recommended variables
        for var in self.recommended_vars:
            if not os.getenv(var):
                self.warnings.append(f"Recommended environment variable '{var}' is not set")
        
        # Check Railway-specific variables
        railway_env = os.getenv('RAILWAY_ENVIRONMENT')
        if railway_env:
            for var in self.railway_vars:
                if not os.getenv(var):
                    self.warnings.append(f"Railway environment variable '{var}' is not set")
        
        return all_valid

    def validate_database_configuration(self) -> bool:
        """Validate database configuration"""
        database_url = os.getenv('DATABASE_URL')
        
        if not database_url:
            self.warnings.append("DATABASE_URL not set, will use SQLite fallback")
            return True
            
        if not database_url.startswith(('postgresql://', 'postgres://')):
            self.warnings.append("DATABASE_URL does not appear to be PostgreSQL (Railway default)")
            
        return True

    def validate_security_configuration(self) -> bool:
        """Validate security-related configuration"""
        jwt_secret = os.getenv('JWT_SECRET')
        environment = os.getenv('ENVIRONMENT', 'development')
        
        if environment == 'production':
            if not jwt_secret or jwt_secret == 'asdf#FGSgvasgf$5$WGT':
                self.errors.append("JWT_SECRET must be set to a secure value in production")
                return False
                
            if len(jwt_secret) < 32:
                self.warnings.append("JWT_SECRET should be at least 32 characters long")
        
        return True

    def check_railpack_config(self) -> bool:
        """Check if railpack.json exists and is valid"""
        railpack_paths = ['railpack.json', 'apps/api/railpack.json', 'apps/web/railpack.json']
        found_configs = []
        
        for path in railpack_paths:
            if os.path.exists(path):
                found_configs.append(path)
        
        if not found_configs:
            self.warnings.append("No railpack.json configurations found - Railway will use defaults")
            return True
            
        # Validate each found configuration
        for config_path in found_configs:
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    
                # Check required sections
                if 'deploy' in config:
                    deploy = config['deploy']
                    if 'startCommand' not in deploy:
                        self.warnings.append(f"{config_path} missing deploy.startCommand")
                    if 'healthCheckPath' not in deploy:
                        self.warnings.append(f"{config_path} missing deploy.healthCheckPath")
                else:
                    self.warnings.append(f"{config_path} missing deploy section")
                    
                if 'build' in config:
                    build = config['build']
                    if 'provider' not in build:
                        self.warnings.append(f"{config_path} missing build.provider")
                        
            except json.JSONDecodeError as e:
                self.errors.append(f"Error parsing {config_path}: {e}")
                return False
            except Exception as e:
                self.errors.append(f"Error reading {config_path}: {e}")
                return False
                
        return True
    
    def check_build_conflicts(self) -> bool:
        """Check for competing build configurations (cheat sheet issue #1)"""
        competing_files = ['Dockerfile', 'railway.toml', 'nixpacks.toml']
        found_conflicts = []
        
        for file in competing_files:
            if os.path.exists(file):
                found_conflicts.append(file)
        
        if found_conflicts:
            self.warnings.append(f"Found competing build configs: {', '.join(found_conflicts)}. Consider using only railpack.json for Railway deployment")
        
        return True  # Not an error, just a warning
    
    def check_theme_configuration(self) -> bool:
        """Check for proper theme configuration to prevent FOUC (cheat sheet issue #3)"""
        main_tsx_path = 'apps/web/src/main.tsx'
        if os.path.exists(main_tsx_path):
            try:
                with open(main_tsx_path, 'r') as f:
                    content = f.read()
                    if 'document.documentElement.className' not in content:
                        self.warnings.append("Theme not applied before React renders - may cause FOUC (Flash of Unstyled Content)")
                        return False
            except Exception as e:
                self.warnings.append(f"Could not check theme configuration: {e}")
                return False
        
        # Check for proper CSS import order
        index_css_path = 'apps/web/src/index.css'
        if os.path.exists(index_css_path):
            try:
                with open(index_css_path, 'r') as f:
                    content = f.read()
                    if not content.strip():
                        self.warnings.append("index.css is empty - ensure proper CSS imports for Railway deployment")
            except Exception as e:
                self.warnings.append(f"Could not check CSS configuration: {e}")
        
        return True

    def run_validation(self) -> Tuple[bool, Dict]:
        """Run all validations and return results"""
        print("🔍 Running Railway configuration validation...")
        
        # Run all validation checks
        checks = [
            ("Port Binding", self.validate_port_binding),
            ("CORS Configuration", self.validate_cors_configuration), 
            ("Environment Variables", self.validate_environment_variables),
            ("Database Configuration", self.validate_database_configuration),
            ("Security Configuration", self.validate_security_configuration),
            ("Railpack Configuration", self.check_railpack_config),
            ("Build Conflicts", self.check_build_conflicts),
            ("Theme Configuration", self.check_theme_configuration)
        ]
        
        all_passed = True
        for check_name, check_func in checks:
            try:
                result = check_func()
                status = "✅" if result else "❌"
                print(f"{status} {check_name}")
                if not result:
                    all_passed = False
            except Exception as e:
                print(f"❌ {check_name} - Error: {e}")
                self.errors.append(f"{check_name} validation failed: {e}")
                all_passed = False
        
        # Print summary
        print("\n📊 Validation Summary:")
        print(f"Errors: {len(self.errors)}")
        print(f"Warnings: {len(self.warnings)}")
        
        if self.errors:
            print("\n❌ Errors:")
            for error in self.errors:
                print(f"  • {error}")
        
        if self.warnings:
            print("\n⚠️ Warnings:")
            for warning in self.warnings:
                print(f"  • {warning}")
        
        if all_passed and not self.errors:
            print("\n🎉 Configuration validation passed!")
        
        return all_passed, {
            'passed': all_passed,
            'errors': self.errors,
            'warnings': self.warnings
        }


def main():
    """Main entry point"""
    validator = ConfigValidator()
    success, results = validator.run_validation()
    
    # Exit with appropriate code
    if results['errors']:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()