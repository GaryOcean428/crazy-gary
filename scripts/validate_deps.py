#!/usr/bin/env python3
"""
Dependency validation script for crazy-gary application.
Validates that all required modules are available before deployment.
"""
import sys
import importlib
import traceback

def validate_module(module_name, alias=None):
    """Validate that a module can be imported."""
    try:
        import_name = alias if alias else module_name
        importlib.import_module(import_name)
        print(f"✅ {module_name} available")
        return True
    except ImportError as e:
        print(f"❌ {module_name} MISSING: {e}")
        return False
    except Exception as e:
        print(f"⚠️  {module_name} ERROR: {e}")
        return False

def main():
    """Main validation function."""
    print("🔍 Validating dependencies for crazy-gary...")
    
    # Core Flask dependencies
    required_modules = [
        ('flask', 'flask'),
        ('flask-cors', 'flask_cors'),
        ('flask-sqlalchemy', 'flask_sqlalchemy'),
        ('flask-socketio', 'flask_socketio'),
        ('python-socketio', 'socketio'),
        ('python-engineio', 'engineio'),
        ('gevent', 'gevent'),
        ('bidict', 'bidict'),
        ('gunicorn', 'gunicorn'),
        ('redis', 'redis'),
        ('psycopg2-binary', 'psycopg2'),
        ('requests', 'requests'),
        ('aiohttp', 'aiohttp'),
        ('bcrypt', 'bcrypt'),
        ('pyjwt', 'jwt'),
        ('python-dotenv', 'dotenv'),
        ('psutil', 'psutil'),
    ]
    
    failed_modules = []
    
    for module_display, module_import in required_modules:
        if not validate_module(module_display, module_import):
            failed_modules.append(module_display)
    
    print("\n" + "="*50)
    
    if failed_modules:
        print(f"❌ Validation FAILED! Missing modules: {', '.join(failed_modules)}")
        print("\n💡 To fix, run:")
        print(f"   pip install {' '.join(failed_modules)}")
        sys.exit(1)
    else:
        print("✅ All dependencies are available!")
        print("🚀 Application is ready for deployment")
        
    # Test specific imports that have caused issues
    print("\n🧪 Testing critical imports...")
    
    try:
        from flask_socketio import emit, SocketIO
        print("✅ flask_socketio.emit and SocketIO imported successfully")
    except Exception as e:
        print(f"❌ flask_socketio import failed: {e}")
        sys.exit(1)
        
    try:
        import gevent
        print("✅ gevent imported successfully")
    except Exception as e:
        print(f"❌ gevent import failed: {e}")
        sys.exit(1)
    
    print("\n🎉 All validation checks passed!")

if __name__ == '__main__':
    main()