#!/usr/bin/env python3
"""
Integration test for Flask-SocketIO functionality.
Tests the core SocketIO imports and basic functionality.
"""
import sys
import os

# Add the API src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'apps', 'api', 'src'))

def test_socketio_imports():
    """Test that all SocketIO related imports work correctly."""
    try:
        from flask_socketio import SocketIO, emit
        from flask import Flask
        print("✅ Flask-SocketIO imports successful")
        return True
    except ImportError as e:
        print(f"❌ Flask-SocketIO import failed: {e}")
        return False

def test_socketio_initialization():
    """Test that SocketIO can be initialized with gevent."""
    try:
        from flask_socketio import SocketIO
        from flask import Flask
        
        app = Flask(__name__)
        socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')
        print("✅ SocketIO initialization with gevent successful")
        return True
    except Exception as e:
        print(f"❌ SocketIO initialization failed: {e}")
        return False

def test_observability_imports():
    """Test that observability module imports correctly."""
    try:
        from src.routes.observability import observability_bp, setup_websocket_handlers
        print("✅ Observability module imports successful")
        return True
    except ImportError as e:
        print(f"❌ Observability module import failed: {e}")
        return False

def test_websocket_handlers_setup():
    """Test that WebSocket handlers can be set up."""
    try:
        from flask_socketio import SocketIO
        from flask import Flask
        from src.routes.observability import setup_websocket_handlers
        
        app = Flask(__name__)
        socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')
        
        # This should not raise an exception
        setup_websocket_handlers(socketio)
        print("✅ WebSocket handlers setup successful")
        return True
    except Exception as e:
        print(f"❌ WebSocket handlers setup failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Running Flask-SocketIO integration tests...\n")
    
    tests = [
        test_socketio_imports,
        test_socketio_initialization,
        test_observability_imports,
        test_websocket_handlers_setup,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            failed += 1
        print()
    
    print("="*50)
    print(f"🧪 Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! SocketIO integration is working correctly.")
        return True
    else:
        print("❌ Some tests failed. Check the output above.")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)