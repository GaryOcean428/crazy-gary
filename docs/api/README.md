# Crazy-Gary API Documentation System

## Overview

This repository contains a comprehensive API documentation system for the Crazy-Gary API, including interactive documentation, static websites, and developer resources.

## 🎯 Documentation Features

### ✅ Completed Features

1. **Interactive API Documentation (Swagger UI)**
   - Live interactive API explorer
   - Try-it-out functionality for all endpoints
   - OpenAPI 3.0 specification
   - Material theme with enhanced UX

2. **Comprehensive Documentation Website**
   - Professional HTML/CSS/JS website
   - Mobile-responsive design
   - Interactive navigation
   - Code examples with copy functionality

3. **Complete API Reference**
   - All endpoints documented with examples
   - Authentication guide
   - Error handling patterns
   - Security best practices

4. **Developer Resources**
   - Postman collection
   - Usage examples and tutorials
   - Testing guidelines
   - API versioning documentation

## 📚 Documentation Structure

```
/workspace/crazy-gary/docs/api/
├── openapi.yaml                      # Complete OpenAPI 3.0 specification
├── authentication.md                 # Authentication guide
├── api-reference.md                  # Comprehensive API reference
├── error-handling.md                 # Error codes and patterns
├── usage-examples.md                 # Usage tutorials and examples
├── security.md                       # Security and rate limiting docs
├── api-versioning.md                 # Versioning strategy
├── testing-guidelines.md             # API testing guide
└── crazy-gary-api.postman_collection.json  # Postman collection

/workspace/crazy-gary/apps/api/src/
├── static/api-docs/                  # Documentation website
│   ├── index.html                    # Main documentation page
│   ├── styles.css                    # Responsive CSS styles
│   └── script.js                     # Interactive JavaScript
└── utils/swagger_setup.py            # Swagger UI integration
```

## 🚀 How to Access Documentation

### 1. Interactive API Documentation (Swagger UI)
- **URL**: `http://localhost:8080/docs/api`
- **Features**: 
  - Interactive endpoint testing
  - Real-time API exploration
  - Request/response examples
  - Authentication testing

### 2. Documentation Website
- **URL**: `http://localhost:8080/docs/website`
- **Features**:
  - Professional documentation site
  - Mobile-responsive design
  - Quick start guide
  - Code examples with copy functionality

### 3. Documentation Homepage
- **URL**: `http://localhost:8080/docs`
- **Features**:
  - Central documentation hub
  - Links to all resources
  - Quick access to interactive tools

## 🔧 Installation & Setup

### Prerequisites
```bash
# Install required dependencies
pip install flask-swagger-ui pyyaml
```

### Start the API Server
```bash
cd /workspace/crazy-gary/apps/api
python src/main.py
```

### Access Points
- Main API: `http://localhost:8080`
- Interactive Docs: `http://localhost:8080/docs/api`
- Documentation Website: `http://localhost:8080/docs/website`
- Documentation Hub: `http://localhost:8080/docs`
- OpenAPI Spec: `http://localhost:8080/openapi.json`

## 📋 API Endpoints Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration  
- `POST /api/auth/refresh` - Token refresh

### Code Generation Endpoints
- `POST /api/generate` - AI code generation
- `POST /api/analyze` - Code analysis
- `POST /api/optimize` - Code optimization

### MCP Tools Endpoints
- `GET /api/tools` - List available tools
- `POST /api/tools/execute` - Execute tool
- `GET /api/tools/status` - Tool status

### Monitoring Endpoints
- `GET /api/monitoring/metrics` - System metrics
- `GET /api/monitoring/logs` - System logs
- `GET /api/monitoring/health` - Health status

## 🧪 Testing the API

### Using Interactive Documentation
1. Open `http://localhost:8080/docs/api`
2. Click on any endpoint
3. Click "Try it out"
4. Enter required parameters
5. Click "Execute" to test

### Using Postman Collection
1. Import `/docs/api/crazy-gary-api.postman_collection.json`
2. Set up authentication
3. Run individual requests or collections

### Using Command Line
```bash
# Health check
curl http://localhost:8080/health

# API info
curl http://localhost:8080/api

# Test authentication
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

## 🎨 Documentation Website Features

### Navigation
- **Fixed Header**: Always accessible navigation
- **Mobile Menu**: Responsive hamburger menu
- **Smooth Scrolling**: Animated section navigation
- **Active Highlighting**: Current section indication

### Content Sections
1. **Hero Section**: Overview and quick access
2. **Quick Start**: Step-by-step getting started guide
3. **API Overview**: Key features and capabilities
4. **Authentication**: Security and auth methods
5. **Endpoints**: Categorized endpoint listings
6. **SDKs**: Language-specific libraries

### Interactive Elements
- **Code Copy**: One-click code copying
- **Responsive Design**: Works on all devices
- **Search Ready**: Prepared for content search
- **Keyboard Shortcuts**: 
  - `Ctrl+K`: Focus search
  - `Ctrl+D`: Open interactive docs

## 🔍 OpenAPI Specification

The OpenAPI 3.0 specification (`openapi.yaml`) includes:
- Complete endpoint definitions
- Request/response schemas
- Authentication requirements
- Error response documentation
- Example requests and responses
- Server configurations

### Key Components
```yaml
info:
  title: Crazy-Gary API
  version: 1.0.0
  description: AI-powered coding assistant API

servers:
  - url: http://localhost:8080
    description: Development server

paths:
  /api/auth/login:
    post:
      summary: User authentication
      requestBody:
        required: true
      responses:
        200:
          description: Authentication successful
        401:
          description: Invalid credentials
```

## 📦 Postman Collection

The Postman collection includes:
- All API endpoints with examples
- Pre-configured authentication
- Environment variables
- Test scripts
- Response examples

### Import Instructions
1. Open Postman
2. Click "Import"
3. Select `crazy-gary-api.postman_collection.json`
4. Set up environment variables
5. Start testing!

## 🔧 Development

### Adding New Endpoints
1. Update the route files in `/src/routes/`
2. Update `/docs/api/openapi.yaml` with new endpoint definitions
3. Test in Swagger UI
4. Update documentation as needed

### Updating Documentation
1. Edit markdown files in `/docs/api/`
2. Update OpenAPI specification
3. Test changes in interactive docs
4. Deploy updated documentation

### Customizing the Website
- Edit `/src/static/api-docs/index.html` for content
- Modify `/src/static/api-docs/styles.css` for styling
- Update `/src/static/api-docs/script.js` for functionality

## 🚀 Deployment

### Production Setup
1. Set environment variables:
   ```bash
   export FLASK_ENV=production
   export JWT_SECRET=your-secret-key
   ```

2. Install production dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start with production server:
   ```bash
   gunicorn src.main:app --bind 0.0.0.0:8080
   ```

### Documentation URLs
- Production: `https://yourdomain.com/docs/api`
- Website: `https://yourdomain.com/docs/website`
- Spec: `https://yourdomain.com/openapi.json`

## 🆘 Troubleshooting

### Common Issues

**Swagger UI not loading:**
- Check that `flask-swagger-ui` is installed
- Verify `openapi.yaml` exists in `/docs/api/`
- Check browser console for errors

**Documentation website not accessible:**
- Ensure static files are properly served
- Check file permissions
- Verify route configuration

**API endpoints not appearing:**
- Update OpenAPI specification
- Restart the Flask application
- Check route registration

### Getting Help
- Check the interactive documentation for examples
- Review error handling documentation
- Use the testing guidelines for debugging

## 📈 Future Enhancements

Potential improvements for the documentation system:
- [ ] Search functionality
- [ ] Dark theme support
- [ ] Multi-language examples
- [ ] Video tutorials
- [ ] Interactive code playground
- [ ] API changelog
- [ ] Rate limiting visualization
- [ ] Performance metrics dashboard

## 📄 License

This documentation system is part of the Crazy-Gary project. See the main project LICENSE file for details.

---

**Happy coding with Crazy-Gary API! 🚀**