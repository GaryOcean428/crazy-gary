#!/usr/bin/env python3
"""
Run server script for Railway deployment
This is an alternative entry point for running the application
"""
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the main application
if __name__ == '__main__':
    from apps.api.src.main import app, socketio
    
    # Railway sets PORT environment variable, default to 8080 for Railway compatibility
    port = int(os.getenv('PORT', 8080))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('FLASK_ENV') != 'production'
    
    print(f"🚀 Starting Crazy-Gary server on {host}:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🌍 Environment: {os.getenv('FLASK_ENV', 'development')}")
    
    socketio.run(app, host=host, port=port, debug=debug)