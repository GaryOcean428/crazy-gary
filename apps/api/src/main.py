import os
import sys
import time
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Setup frontend before importing anything else
try:
    from src.utils.frontend_setup import setup_frontend
    setup_frontend()
except Exception as e:
    print(f"⚠️ Frontend setup failed: {e}")

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from src.models.user import db
from src.models.migrations import run_all_migrations
from src.routes.user import user_bp
from src.routes.harmony import harmony_bp
from src.routes.endpoints import endpoints_bp
from src.routes.mcp import mcp_bp
from src.routes.agent import agent_bp
from src.routes.auth import auth_bp
from src.routes.monitoring import monitoring_bp
from src.routes.heavy import heavy_bp
from src.routes.coder import coder_bp
from src.routes.observability import observability_bp, setup_websocket_handlers
from src.middleware.request_logging import init_request_logging
from src.middleware.security import setup_security
from src.utils.monitoring import setup_monitoring, setup_railway_monitoring
from src.utils.json_encoder import CustomJSONEncoder

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configure custom JSON encoder for proper serialization
app.json_encoder = CustomJSONEncoder

# Configure CORS for Railway deployment
cors_origins = os.getenv('CORS_ORIGINS', '*')
if cors_origins != '*':
    # Parse comma-separated origins for production
    origins_list = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
else:
    # Fallback to wildcard for development
    origins_list = "*"

CORS(app, 
     origins=origins_list, 
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True)

# Initialize SocketIO with Railway-compatible configuration
socketio_cors_origins = os.getenv('CORS_ORIGINS', '*')
if socketio_cors_origins != '*':
    # Parse comma-separated origins for production
    socketio_origins = [origin.strip() for origin in socketio_cors_origins.split(',') if origin.strip()]
else:
    # Fallback for development
    socketio_origins = "*"

socketio = SocketIO(
    app,
    cors_allowed_origins=socketio_origins,
    async_mode='gevent',
    message_queue=os.environ.get('REDIS_URL', None),
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25,
    transports=['websocket', 'polling']
)

# Load configuration from environment variables
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'asdf#FGSgvasgf$5$WGT')

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(harmony_bp)
app.register_blueprint(endpoints_bp)
app.register_blueprint(mcp_bp)
app.register_blueprint(agent_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(monitoring_bp, url_prefix='/api/monitoring')
app.register_blueprint(heavy_bp, url_prefix='/api/heavy')
app.register_blueprint(coder_bp, url_prefix='/api/coder')
app.register_blueprint(observability_bp, url_prefix='/api/observability')

# Database configuration
database_url = os.getenv('DATABASE_URL')
if database_url:
    # Use PostgreSQL from Railway
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # Fallback to SQLite for local development
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)
try:
    with app.app_context():
        db.create_all()
        print("✅ Database initialized successfully")
        
        # Run migrations to update existing tables
        migration_success = run_all_migrations()
        if migration_success:
            print("✅ Database migrations completed successfully")
        else:
            print("⚠️ Some database migrations failed (might be expected)")
            
except Exception as e:
    print(f"❌ Database initialization failed: {e}")
    # Continue running even if database fails

# Health check endpoint
@app.route('/health')
def health_check():
    """Basic health check for Railway"""
    return {
        'status': 'healthy', 
        'service': 'crazy-gary-api', 
        'version': '1.0.0',
        'environment': os.getenv('ENVIRONMENT', 'development'),
        'railway_env': os.getenv('RAILWAY_ENVIRONMENT', 'not_set'),
        'timestamp': time.time()
    }

@app.route('/api/health')
def api_health_check():
    """Simple health check for Railway deployment"""
    from datetime import datetime
    return {'status': 'healthy', 'service': 'crazy-gary', 'timestamp': datetime.utcnow().isoformat()}, 200

@app.route('/health/ready')
def readiness_check():
    # Check if all required environment variables are set
    required_vars = ['HUGGINGFACE_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        return {'status': 'not ready', 'missing_env_vars': missing_vars}, 503
    
    return {'status': 'ready'}

@app.route('/health/live')
def liveness_check():
    return {'status': 'alive'}

# Serve static assets
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    static_folder_path = app.static_folder
    if static_folder_path:
        assets_path = os.path.join(static_folder_path, 'assets')
        if os.path.exists(os.path.join(assets_path, filename)):
            return send_from_directory(assets_path, filename)
    return "Asset not found", 404

# Serve favicon
@app.route('/favicon.ico')
def serve_favicon():
    static_folder_path = app.static_folder
    if static_folder_path:
        favicon_path = os.path.join(static_folder_path, 'favicon.ico')
        if os.path.exists(favicon_path):
            return send_from_directory(static_folder_path, 'favicon.ico')
    return "Favicon not found", 404

# Serve the frontend for all non-API routes
@app.route('/')
@app.route('/<path:path>')
def serve(path=''):
    # Don't intercept API routes - let them be handled by blueprints
    if path.startswith('api/') or path.startswith('health') or path.startswith('docs'):
        return None  # This will let Flask continue to other routes
    
    # For all other routes (SPA routing), serve index.html
    static_folder_path = app.static_folder
    if static_folder_path:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
    
    # Fallback API response if no frontend is available
    return {
        "service": "Monkey Coder API",
        "version": "1.0.0", 
        "status": "running",
        "message": "Frontend not available - API only mode",
        "frontend_build_missing": True,
        "endpoints": {
            "health": "/health",
            "api_health": "/api/health"
        }
    }


# Initialize middleware
init_request_logging(app)

# Setup security middleware
setup_security(app)

# Setup monitoring and metrics
setup_monitoring(app)

# Setup Railway-specific monitoring
railway_config = setup_railway_monitoring()

# Setup WebSocket handlers for observability
setup_websocket_handlers(socketio)

if __name__ == '__main__':
    # Railway sets PORT environment variable, default to 8080 for Railway compatibility
    port = int(os.getenv('PORT', 8080))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('FLASK_ENV') != 'production'
    
    print(f"🚀 Starting Crazy-Gary API server on {host}:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🌍 Environment: {os.getenv('FLASK_ENV', 'development')}")
    print(f"🗄️ Database: {'PostgreSQL (Railway)' if os.getenv('DATABASE_URL') else 'SQLite (Local)'}")
    print(f"🧠 Heavy orchestration enabled")
    print(f"⚡ MCP tools integrated")
    print(f"🌐 WebSocket support enabled with SocketIO")
    
    # Environment variable status for debugging
    env_status = {
        'HUGGINGFACE_API_KEY': '✅ Set' if os.getenv('HUGGINGFACE_API_KEY') else '❌ Missing',
        'DATABASE_URL': '✅ Set' if os.getenv('DATABASE_URL') else '❌ Missing (using SQLite)',
        'JWT_SECRET': '✅ Set' if os.getenv('JWT_SECRET') else '⚠️ Using default',
        'PORT': f"✅ {port}",
    }
    print("📋 Environment Variables:")
    for key, status in env_status.items():
        print(f"   {key}: {status}")
    
    socketio.run(app, host=host, port=port, debug=debug)
