#!/usr/bin/env python3
"""
Frontend setup utility for Railway deployment
"""
import os
import subprocess
import shutil
from pathlib import Path

def setup_frontend():
    """Setup frontend at startup"""
    print("🔧 Checking frontend setup...")
    
    # Use relative paths from the app root
    base_dir = Path.cwd()
    web_dir = base_dir / "apps" / "web"
    static_dir = base_dir / "apps" / "api" / "src" / "static"
    
    # Check if we have a web build
    dist_dir = web_dir / "dist"
    
    # If we're in production and have a dist directory, copy it
    if dist_dir.exists() and os.getenv('ENVIRONMENT') == 'production':
        print(f"📁 Found frontend build at {dist_dir}")
        
        # Create static directory if it doesn't exist
        static_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy frontend build to static directory
        try:
            if (static_dir / "index.html").exists():
                print("✅ Frontend already copied to static directory")
            else:
                print(f"📋 Copying frontend build to {static_dir}")
                shutil.copytree(dist_dir, static_dir, dirs_exist_ok=True)
                print("✅ Frontend build copied successfully")
        except Exception as e:
            print(f"⚠️ Failed to copy frontend build: {e}")
    else:
        print("📝 Frontend build not found or not in production mode")
    
    print("🔧 Frontend setup completed")

if __name__ == "__main__":
    setup_frontend()