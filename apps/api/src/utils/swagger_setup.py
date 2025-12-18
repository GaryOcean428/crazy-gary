"""
Swagger UI setup for Crazy-Gary API Documentation
Provides interactive API documentation with OpenAPI 3.0 specification
"""

import os
import yaml
import json
from flask import Flask, jsonify, send_from_directory, request, render_template_string
from flask_swagger_ui import get_swaggerui_blueprint

def setup_swagger_ui(app):
    """Configure Swagger UI for the Flask application"""
    
    # Load the OpenAPI specification
    openapi_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docs', 'api', 'openapi.yaml')
    
    if not os.path.exists(openapi_path):
        print("⚠️ OpenAPI specification not found. Skipping Swagger UI setup.")
        return
    
    # Create a route to serve the OpenAPI spec as JSON
    @app.route('/openapi.json')
    def serve_openapi_spec():
        """Serve the OpenAPI specification as JSON"""
        try:
            with open(openapi_path, 'r') as file:
                spec = yaml.safe_load(file)
            
            # Update the server URL to match the current environment
            server_url = request.host_url.rstrip('/')
            spec['servers'] = [
                {
                    "url": server_url,
                    "description": "Current server"
                }
            ]
            
            return jsonify(spec)
        except Exception as e:
            print(f"❌ Failed to load OpenAPI spec: {e}")
            return jsonify({"error": "Failed to load API specification"}), 500
    
    # Create a route to serve the OpenAPI spec as YAML
    @app.route('/openapi.yaml')
    def serve_openapi_yaml():
        """Serve the OpenAPI specification as YAML"""
        try:
            return send_from_directory(
                os.path.dirname(openapi_path),
                'openapi.yaml',
                mimetype='text/yaml'
            )
        except Exception as e:
            print(f"❌ Failed to serve OpenAPI YAML: {e}")
            return "OpenAPI specification not found", 404
    
    # Setup Swagger UI blueprint
    SWAGGER_URL = '/docs/api'  # URL for exposing Swagger UI
    API_URL = '/openapi.json'  # Our API url (can be JSON or YAML)
    
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "Crazy-Gary API Documentation",
            'ui_theme': "material",  # Material theme for better UX
            'defaultModelsExpandDepth': 2,
            'defaultModelExpandDepth': 3,
            'docExpansion': 'list',  # Start with list view
            'deepLinking': True,
            'displayRequestDuration': True,
            'filter': True,
            'showExtensions': True,
            'showCommonExtensions': True,
            'tryItOutEnabled': True,
            'supportedSubmitMethods': ['get', 'post', 'put', 'delete', 'patch'],
            'tagsSorter': 'alpha',
            'operationsSorter': 'alpha',
        },
        blueprint_name='swagger_ui'
    )
    
    # Register the Swagger UI blueprint
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
    
    print("✅ Swagger UI configured successfully")
    print(f"📚 Interactive API documentation available at: {SWAGGER_URL}")
    print(f"📋 OpenAPI specification available at: {API_URL}")

def create_api_docs_homepage(app):
    """Create a custom API documentation homepage"""
    
    docs_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Crazy-Gary API Documentation</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            .header {
                text-align: center;
                color: white;
                margin-bottom: 3rem;
            }
            
            .header h1 {
                font-size: 3rem;
                margin-bottom: 0.5rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .header p {
                font-size: 1.2rem;
                opacity: 0.9;
            }
            
            .cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            
            .card {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 40px rgba(0,0,0,0.15);
            }
            
            .card-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                margin-bottom: 1rem;
            }
            
            .card-icon.interactive { background: linear-gradient(45deg, #ff6b6b, #ee5a24); }
            .card-icon.spec { background: linear-gradient(45deg, #4ecdc4, #44a08d); }
            .card-icon.postman { background: linear-gradient(45deg, #ff9a56, #feca57); }
            .card-icon.examples { background: linear-gradient(45deg, #a55eea, #764ba2); }
            
            .card h3 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
                color: #2c3e50;
            }
            
            .card p {
                color: #7f8c8d;
                margin-bottom: 1.5rem;
            }
            
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                transition: all 0.3s ease;
                text-align: center;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            
            .btn-secondary {
                background: linear-gradient(45deg, #95a5a6, #7f8c8d);
            }
            
            .footer {
                text-align: center;
                color: white;
                opacity: 0.8;
                margin-top: 3rem;
            }
            
            .quick-links {
                background: rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 2rem;
                margin-top: 2rem;
            }
            
            .quick-links h3 {
                color: white;
                margin-bottom: 1rem;
                text-align: center;
            }
            
            .links-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .quick-link {
                color: white;
                text-decoration: none;
                padding: 0.5rem;
                border-radius: 6px;
                transition: background 0.3s ease;
            }
            
            .quick-link:hover {
                background: rgba(255,255,255,0.2);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Crazy-Gary API</h1>
                <p>Comprehensive API Documentation & Interactive Tools</p>
            </div>
            
            <div class="cards-grid">
                <div class="card">
                    <div class="card-icon interactive">📚</div>
                    <h3>Interactive Documentation</h3>
                    <p>Explore and test the API endpoints directly in your browser with our Swagger UI interface.</p>
                    <a href="/docs/api" class="btn">Launch Interactive Docs</a>
                </div>
                
                <div class="card">
                    <div class="card-icon spec">📋</div>
                    <h3>OpenAPI Specification</h3>
                    <p>Complete API specification in both JSON and YAML formats for integration and code generation.</p>
                    <div style="margin-top: 1rem;">
                        <a href="/openapi.json" class="btn btn-secondary" style="margin-right: 0.5rem;">JSON</a>
                        <a href="/openapi.yaml" class="btn btn-secondary">YAML</a>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-icon postman">🧪</div>
                    <h3>Postman Collection</h3>
                    <p>Ready-to-use Postman collection with all endpoints, authentication, and example requests.</p>
                    <a href="/docs/api/crazy-gary-api.postman_collection.json" class="btn">Download Collection</a>
                </div>
                
                <div class="card">
                    <div class="card-icon examples">💡</div>
                    <h3>Usage Examples</h3>
                    <p>Comprehensive examples and tutorials to help you get started with the API quickly.</p>
                    <a href="/docs/api/usage-examples.md" class="btn">View Examples</a>
                </div>
            </div>
            
            <div class="quick-links">
                <h3>📖 Documentation</h3>
                <div class="links-grid">
                    <a href="/docs/api/authentication.md" class="quick-link">🔐 Authentication</a>
                    <a href="/docs/api/error-handling.md" class="quick-link">❌ Error Handling</a>
                    <a href="/docs/api/security.md" class="quick-link">🔒 Security</a>
                    <a href="/docs/api/api-versioning.md" class="quick-link">📦 API Versioning</a>
                    <a href="/docs/api/testing-guidelines.md" class="quick-link">🧪 Testing Guide</a>
                    <a href="/docs/api/api-reference.md" class="quick-link">📖 API Reference</a>
                </div>
            </div>
            
            <div class="footer">
                <p>Crazy-Gary API v1.0.0 | Powered by Flask & OpenAPI 3.0</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    @app.route('/docs')
    def api_docs_home():
        """Serve the API documentation homepage"""
        return render_template_string(docs_html)

def create_swagger_json_endpoint(app):
    """Create additional endpoints for better API discovery"""
    
    @app.route('/api')
    def api_info():
        """API information and links to documentation"""
        return {
            "name": "Crazy-Gary API",
            "version": "1.0.0",
            "description": "Advanced AI-powered coding assistant with Harmony integration",
            "documentation": {
                "interactive": "/docs/api",
                "openapi_json": "/openapi.json",
                "openapi_yaml": "/openapi.yaml",
                "homepage": "/docs"
            },
            "endpoints": {
                "health": "/health",
                "api_health": "/api/health",
                "readiness": "/health/ready",
                "liveness": "/health/live"
            },
            "features": [
                "AI-powered code generation",
                "Harmony model integration", 
                "MCP tool orchestration",
                "Real-time monitoring",
                "WebSocket support",
                "Comprehensive security"
            ]
        }
    
    @app.route('/api/version')
    def api_version():
        """Get API version information"""
        return {
            "api_version": "1.0.0",
            "service": "crazy-gary-api",
            "openapi_version": "3.0.3",
            "environment": os.getenv('ENVIRONMENT', 'development')
        }

def init_swagger_documentation(app):
    """Initialize complete Swagger documentation system"""
    print("🚀 Initializing API documentation system...")
    
    # Setup Swagger UI
    setup_swagger_ui(app)
    
    # Create documentation homepage
    create_api_docs_homepage(app)
    
    # Create additional API discovery endpoints
    create_swagger_json_endpoint(app)
    
    print("✅ API documentation system initialized successfully")