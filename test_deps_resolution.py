#!/usr/bin/env python3
"""
Simple test to verify Flask-SocketIO dependency resolution.
This test focuses on the core issue that was preventing deployment.
"""
import sys

def test_core_imports():
    """Test the core imports that were failing."""
    print("🧪 Testing core Flask-SocketIO imports...")
    
    try:
        # This was the failing import
        from flask_socketio import emit
        print("✅ flask_socketio.emit imported successfully")
    except ImportError as e:
        print(f"❌ flask_socketio.emit import failed: {e}")
        return False
    
    try:
        from flask_socketio import SocketIO
        print("✅ flask_socketio.SocketIO imported successfully")
    except ImportError as e:
        print(f"❌ flask_socketio.SocketIO import failed: {e}")
        return False
    
    try:
        import gevent
        print("✅ gevent imported successfully")
    except ImportError as e:
        print(f"❌ gevent import failed: {e}")
        return False
        
    return True

def test_socketio_basic_functionality():
    """Test basic SocketIO functionality."""
    print("\n🧪 Testing basic SocketIO functionality...")
    
    try:
        from flask import Flask
        from flask_socketio import SocketIO
        
        app = Flask(__name__)
        socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')
        
        print("✅ SocketIO app creation successful")
        print(f"✅ Async mode: {socketio.async_mode}")
        
        return True
    except Exception as e:
        print(f"❌ SocketIO functionality test failed: {e}")
        return False

def main():
    """Run the dependency resolution verification."""
    print("🔍 Flask-SocketIO Dependency Resolution Test")
    print("=" * 50)
    
    # Test core imports
    if not test_core_imports():
        print("\n❌ Core import test failed!")
        return False
    
    # Test basic functionality  
    if not test_socketio_basic_functionality():
        print("\n❌ Basic functionality test failed!")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 SUCCESS: All Flask-SocketIO dependency issues have been resolved!")
    print("📦 The following packages are now working:")
    print("   - flask-socketio")
    print("   - python-socketio") 
    print("   - python-engineio")
    print("   - gevent (async mode)")
    print("   - bidict")
    print("\n🚀 The application should now deploy successfully on Railway!")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)