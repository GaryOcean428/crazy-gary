#!/usr/bin/env python3
"""
Railway-compatible frontend build script
Builds the React frontend for deployment on Railway
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def log(message):
    """Print log message with timestamp"""
    print(f"[BUILD] {message}")

def run_command(command, cwd=None, check=True):
    """Run a command and handle errors"""
    log(f"Running: {command}")
    try:
        result = subprocess.run(
            command.split() if isinstance(command, str) else command,
            cwd=cwd,
            check=check,
            capture_output=True,
            text=True
        )
        if result.stdout:
            print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        log(f"❌ Command failed: {e}")
        if e.stderr:
            print(e.stderr)
        if check:
            sys.exit(1)
        return e

def main():
    """Main build process"""
    log("🚀 Starting Railway frontend build...")
    
    # Get directories
    base_dir = Path(__file__).parent
    web_dir = base_dir / "apps" / "web"
    api_static_dir = base_dir / "apps" / "api" / "src" / "static"
    
    log(f"Base directory: {base_dir}")
    log(f"Web directory: {web_dir}")
    log(f"API static directory: {api_static_dir}")
    
    # Check if web directory exists
    if not web_dir.exists():
        log("❌ Web directory not found")
        sys.exit(1)
    
    # Change to web directory
    os.chdir(web_dir)
    log(f"Changed to: {web_dir}")
    
    # Check if package.json exists
    if not (web_dir / "package.json").exists():
        log("❌ package.json not found in web directory")
        sys.exit(1)
    
    # Install dependencies
    log("📦 Installing frontend dependencies...")
    
    # Check which package manager is available
    package_manager = None
    if (web_dir / "pnpm-lock.yaml").exists():
        try:
            subprocess.run(["pnpm", "--version"], capture_output=True, check=True)
            package_manager = "pnpm"
        except (subprocess.CalledProcessError, FileNotFoundError):
            log("⚠️ pnpm lockfile found but pnpm not available, falling back to npm")
    
    if not package_manager and (web_dir / "yarn.lock").exists():
        try:
            subprocess.run(["yarn", "--version"], capture_output=True, check=True)
            package_manager = "yarn"
        except (subprocess.CalledProcessError, FileNotFoundError):
            log("⚠️ yarn lockfile found but yarn not available, falling back to npm")
    
    if not package_manager:
        package_manager = "npm"
    
    log(f"Using package manager: {package_manager}")
    
    # Install dependencies based on available package manager
    if package_manager == "pnpm":
        run_command("pnpm install --frozen-lockfile")
    elif package_manager == "yarn":
        run_command("yarn install --frozen-lockfile")
    else:
        run_command("npm install --legacy-peer-deps")
    
    # Set build environment variables
    env = os.environ.copy()
    env.update({
        'NODE_ENV': 'production',
        'VITE_API_URL': '/api',  # Use relative URL for Railway
        'CI': 'true'
    })
    
    # Build the frontend
    log("🎨 Building frontend...")
    
    # Determine build command based on package manager
    if package_manager == "pnpm":
        build_cmd = ["pnpm", "run", "build"]
    elif package_manager == "yarn":
        build_cmd = ["yarn", "build"]
    else:
        build_cmd = ["npm", "run", "build"]
    
    result = subprocess.run(
        build_cmd,
        env=env,
        check=True,
        capture_output=True,
        text=True
    )
    
    if result.stdout:
        print(result.stdout)
    
    # Check if dist directory was created
    dist_dir = web_dir / "dist"
    if not dist_dir.exists():
        log("❌ Frontend build failed - dist directory not found")
        sys.exit(1)
    
    # Copy build output to API static directory
    log("📁 Copying build output to API static directory...")
    
    # Create API static directory if it doesn't exist
    api_static_dir.mkdir(parents=True, exist_ok=True)
    
    # Remove existing static files
    if api_static_dir.exists():
        for item in api_static_dir.iterdir():
            if item.is_file():
                item.unlink()
            elif item.is_dir() and item.name != '__pycache__':
                shutil.rmtree(item)
    
    # Copy all files from dist to static
    for item in dist_dir.rglob('*'):
        if item.is_file():
            # Calculate relative path
            rel_path = item.relative_to(dist_dir)
            target_path = api_static_dir / rel_path
            
            # Create parent directories if needed
            target_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy file
            shutil.copy2(item, target_path)
    
    log("✅ Frontend build completed successfully!")
    
    # Verify build output
    index_file = api_static_dir / "index.html"
    if index_file.exists():
        log(f"✅ index.html found: {index_file}")
    else:
        log("❌ index.html not found in build output")
        sys.exit(1)
    
    # List build output for verification
    assets_dir = api_static_dir / "assets"
    if assets_dir.exists():
        asset_files = list(assets_dir.glob('*'))
        log(f"✅ Built assets: {len(asset_files)} files")
        for asset in asset_files[:5]:  # Show first 5 files
            log(f"   - {asset.name}")
        if len(asset_files) > 5:
            log(f"   ... and {len(asset_files) - 5} more files")
    
    log("🎉 Build process completed successfully!")

if __name__ == "__main__":
    main()