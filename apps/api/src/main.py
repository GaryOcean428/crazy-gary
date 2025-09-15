import os
import sys
import time
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

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
from src.routes.observability import observability_bp, setup_websocket_handlers
from src.middleware.request_logging import init_request_logging
from src.utils.json_encoder import CustomJSONEncoder

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configure custom JSON encoder for proper serialization
app.json_encoder = CustomJSONEncoder

# Configure CORS for all routes
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# Initialize SocketIO with Redis message queue for Railway
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='gevent',
    message_queue=os.environ.get('REDIS_URL', None),
    logger=True,
    engineio_logger=True
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
    return {'status': 'healthy', 'service': 'crazy-gary-api', 'version': '1.0.0'}

@app.route('/api/health')
def api_health_check():
    """Enhanced health check for API monitoring"""
    try:
        import psutil
        import redis
        import psycopg2
        
        checks = {
            "status": "healthy",
            "timestamp": time.time(),
            "memory_percent": psutil.virtual_memory().percent,
            "cpu_percent": psutil.cpu_percent(interval=1),
            "flask_async": True,  # We now support async
            "server_type": "hypercorn_asgi"
        }
        
        # Check Redis connection
        try:
            redis_url = os.getenv('REDIS_URL')
            if redis_url:
                r = redis.from_url(redis_url)
                r.ping()
                checks["redis"] = "connected"
            else:
                checks["redis"] = "not_configured"
        except Exception as e:
            checks["redis"] = f"disconnected: {str(e)}"
            checks["status"] = "degraded"
        
        # Check PostgreSQL connection
        try:
            db_url = os.getenv('DATABASE_URL')
            if db_url:
                conn = psycopg2.connect(db_url)
                conn.close()
                checks["postgres"] = "connected"
            else:
                checks["postgres"] = "sqlite_fallback"
        except Exception as e:
            checks["postgres"] = f"disconnected: {str(e)}"
            checks["status"] = "degraded"
        
        status_code = 200 if checks["status"] == "healthy" else 503
        return checks, status_code
        
    except ImportError:
        # Fallback if monitoring packages not available
        return {
            "status": "healthy", 
            "service": "crazy-gary-api",
            "flask_async": True,
            "server_type": "hypercorn_asgi"
        }, 200

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

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


# Initialize middleware
init_request_logging(app)

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
