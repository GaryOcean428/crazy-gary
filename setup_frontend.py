#!/usr/bin/env python3
"""
Startup script to ensure frontend is built and available
"""
import os
import subprocess
import shutil
from pathlib import Path

def setup_frontend():
    """Setup frontend at startup"""
    print("🔧 Checking frontend setup...")
    
    base_dir = Path("/app")
    web_dir = base_dir / "apps" / "web"
    static_dir = base_dir / "apps" / "api" / "src" / "static"
    
    # Check if we have a web build
    dist_dir = web_dir / "dist"
    
    if dist_dir.exists() and any(dist_dir.iterdir()):
        print("✅ Frontend build found, copying to static directory...")
        
        # Clear and copy static files
        if static_dir.exists():
            shutil.rmtree(static_dir)
        static_dir.mkdir(parents=True)
        
        # Copy dist contents to static
        for item in dist_dir.iterdir():
            if item.is_file():
                shutil.copy2(item, static_dir)
            elif item.is_dir():
                shutil.copytree(item, static_dir / item.name)
        
        print(f"✅ Frontend deployed to {static_dir}")
        
    else:
        print("⚠️ No frontend build found, attempting to build...")
        
        # Try to build frontend
        try:
            if web_dir.exists():
                os.chdir(web_dir)
                
                # Install dependencies
                subprocess.run(["npm", "install", "--legacy-peer-deps"], check=True)
                
                # Build
                subprocess.run(["npm", "run", "build"], check=True)
                
                # Copy to static
                if dist_dir.exists():
                    if static_dir.exists():
                        shutil.rmtree(static_dir)
                    static_dir.mkdir(parents=True)
                    
                    for item in dist_dir.iterdir():
                        if item.is_file():
                            shutil.copy2(item, static_dir)
                        elif item.is_dir():
                            shutil.copytree(item, static_dir / item.name)
                    
                    print("✅ Frontend built and deployed!")
                else:
                    print("❌ Build failed - no output directory")
                    
        except Exception as e:
            print(f"❌ Frontend build failed: {e}")
            print("⚠️ Continuing with API-only mode")

if __name__ == "__main__":
    setup_frontend()