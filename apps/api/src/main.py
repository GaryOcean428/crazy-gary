import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.harmony import harmony_bp
from src.routes.endpoints import endpoints_bp
from src.routes.mcp import mcp_bp
from src.routes.agent import agent_bp
from src.routes.auth import auth_bp
from src.routes.monitoring import monitoring_bp
from src.routes.heavy import heavy_bp
from src.middleware.request_logging import init_request_logging

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configure CORS for all routes
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

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

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

# Health check endpoint
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'service': 'crazy-gary-api', 'version': '1.0.0'}

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

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3000))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('FLASK_ENV') != 'production'
    
    print(f"🚀 Starting Crazy-Gary API server on {host}:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🌍 Environment: {os.getenv('FLASK_ENV', 'development')}")
    print(f"🧠 Heavy orchestration enabled")
    print(f"⚡ MCP tools integrated")
    
    app.run(host=host, port=port, debug=debug)
