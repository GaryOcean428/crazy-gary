#!/usr/bin/env python3
"""
Monkey Coder Unified Server
Serves both the FastAPI backend and React frontend for the monkey-coder service.
"""

import os
import sys
import logging
import subprocess
import asyncio
from pathlib import Path
from typing import Optional
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment configuration
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 8000))
SERVE_FRONTEND = os.getenv('SERVE_FRONTEND', 'true').lower() == 'true'

# Path configuration
BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "apps" / "web"
WEB_DIST_DIR = WEB_DIR / "dist"
API_DIR = BASE_DIR / "apps" / "api"
STATIC_FALLBACK_DIR = API_DIR / "src" / "static"

def check_node_environment():
    """Check if Node.js and npm/yarn are available."""
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        logger.warning("Node.js or npm not available for frontend builds")
        return False

def build_frontend_if_missing():
    """Build the frontend if the dist directory is missing or empty."""
    if WEB_DIST_DIR.exists() and any(WEB_DIST_DIR.iterdir()):
        logger.info(f"Frontend build found at {WEB_DIST_DIR}")
        return True
    
    logger.info("Frontend build missing, attempting to build...")
    
    if not check_node_environment():
        logger.error("Cannot build frontend: Node.js environment not available")
        return False
    
    if not WEB_DIR.exists():
        logger.error(f"Web directory not found: {WEB_DIR}")
        return False
    
    try:
        # Change to web directory
        os.chdir(WEB_DIR)
        
        # Install dependencies
        logger.info("Installing frontend dependencies...")
        subprocess.run(["npm", "install", "--legacy-peer-deps"], check=True)
        
        # Build the frontend
        logger.info("Building frontend...")
        subprocess.run(["npm", "run", "build"], check=True)
        
        # Change back to base directory
        os.chdir(BASE_DIR)
        
        if WEB_DIST_DIR.exists() and any(WEB_DIST_DIR.iterdir()):
            logger.info("✅ Frontend build completed successfully")
            return True
        else:
            logger.error("❌ Frontend build completed but no output found")
            return False
            
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Frontend build failed: {e}")
        os.chdir(BASE_DIR)  # Ensure we're back in base directory
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error during frontend build: {e}")
        os.chdir(BASE_DIR)
        return False

def create_app():
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Monkey Coder API",
        description="Advanced AI-powered coding assistant",
        version="1.0.0",
        debug=DEBUG
    )
    
    # Add GZip compression middleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Configure CORS
    cors_origins = os.getenv('CORS_ORIGINS', '*')
    if cors_origins != '*':
        # Parse comma-separated origins for production
        origins_list = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
    else:
        # Fallback to wildcard for development
        origins_list = ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    )
    
    # Import and include API routes
    try:
        sys.path.insert(0, str(API_DIR))
        from src.main import app as api_app
        
        # Mount the API routes under /api prefix
        app.mount("/api", api_app)
        logger.info("✅ API routes mounted successfully")
        
    except ImportError as e:
        logger.error(f"❌ Failed to import API routes: {e}")
        
        # Create fallback API health endpoint
        @app.get("/api/health")
        async def fallback_health():
            return {"status": "degraded", "message": "API routes not available"}
    
    # Configure frontend serving
    if SERVE_FRONTEND:
        frontend_available = False
        
        # Try to build frontend if missing
        if build_frontend_if_missing():
            frontend_available = True
            static_dir = WEB_DIST_DIR
        elif STATIC_FALLBACK_DIR.exists():
            logger.warning("Using fallback static directory")
            frontend_available = True
            static_dir = STATIC_FALLBACK_DIR
        
        if frontend_available:
            # Mount static files
            app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")
            
            # Serve index.html for all non-API routes (SPA routing)
            @app.get("/{full_path:path}")
            async def serve_frontend(full_path: str):
                # Don't intercept API routes
                if full_path.startswith("api/"):
                    raise HTTPException(status_code=404, detail="API endpoint not found")
                
                # Serve specific files if they exist
                file_path = static_dir / full_path
                if file_path.is_file():
                    return FileResponse(file_path)
                
                # Serve index.html for SPA routing
                index_path = static_dir / "index.html"
                if index_path.exists():
                    return FileResponse(index_path)
                else:
                    raise HTTPException(status_code=404, detail="Frontend not available")
            
            logger.info(f"✅ Frontend serving enabled from {static_dir}")
        else:
            # Serve API fallback page
            @app.get("/")
            async def api_fallback():
                return JSONResponse({
                    "service": "Monkey Coder API",
                    "version": "1.0.0",
                    "status": "running",
                    "message": "Frontend not available - API only mode",
                    "endpoints": {
                        "health": "/api/health",
                        "docs": "/docs",
                        "redoc": "/redoc"
                    }
                })
            logger.warning("⚠️ Frontend not available - serving API fallback")
    
    # Health check endpoint
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "service": "monkey-coder",
            "version": "1.0.0",
            "environment": ENVIRONMENT,
            "frontend_enabled": SERVE_FRONTEND,
            "frontend_available": WEB_DIST_DIR.exists() and any(WEB_DIST_DIR.iterdir()) if SERVE_FRONTEND else False
        }
    
    return app

async def run_server():
    """Run the server with proper configuration."""
    logger.info("🚀 Starting Monkey Coder Unified Server...")
    logger.info(f"🔧 Environment: {ENVIRONMENT}")
    logger.info(f"🌍 Host: {HOST}:{PORT}")
    logger.info(f"🎨 Frontend serving: {'enabled' if SERVE_FRONTEND else 'disabled'}")
    
    # Create the application
    app = create_app()
    
    # Configure uvicorn
    config = uvicorn.Config(
        app,
        host=HOST,
        port=PORT,
        log_level="info" if DEBUG else "warning",
        access_log=DEBUG,
        reload=False,  # Disable reload in production
        workers=1
    )
    
    server = uvicorn.Server(config)
    
    try:
        await server.serve()
    except KeyboardInterrupt:
        logger.info("🛑 Server shutdown requested")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(run_server())
    except KeyboardInterrupt:
        logger.info("👋 Goodbye!")
    except Exception as e:
        logger.error(f"💥 Fatal error: {e}")
        sys.exit(1)