# Railway Deployment Guide for crazy-gary

> **🔥 NEW: Railway Deployment Master Cheat Sheet Available!**  
> **📖 See [RAILWAY_DEPLOYMENT_CHEAT_SHEET.md](../RAILWAY_DEPLOYMENT_CHEAT_SHEET.md) for comprehensive troubleshooting of the 6 most common Railway deployment issues and their solutions.**

This guide provides step-by-step instructions for deploying the crazy-gary application to Railway.com with optimal configuration and security.

## Prerequisites

- Railway account and CLI installed
- GitHub repository access
- Required environment variables (see below)

## Quick Deployment

### 1. Connect to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link
```

### 2. Configure Environment Variables

Set the following environment variables in your Railway service:

**Required Variables:**
```bash
PORT=${PORT}                    # Automatically set by Railway
HOST=0.0.0.0                   # Required for Railway
ENVIRONMENT=production
NODE_ENV=production
SERVE_FRONTEND=true
```

**Railway-Specific Variables:**
```bash
RAILWAY_ENVIRONMENT=production
RAILWAY_PUBLIC_DOMAIN=${RAILWAY_PUBLIC_DOMAIN}
RAILWAY_PRIVATE_DOMAIN=${RAILWAY_PRIVATE_DOMAIN}
CORS_ORIGINS=https://${RAILWAY_PUBLIC_DOMAIN},https://*.up.railway.app,https://*.railway.app
```

**Application Variables:**
```bash
JWT_SECRET=your_secure_jwt_secret_at_least_32_characters
DATABASE_URL=${DATABASE_URL}           # If using Railway PostgreSQL
REDIS_URL=${REDIS_URL}                 # If using Railway Redis
HUGGINGFACE_API_KEY=your_hf_api_key
```

**Optional Variables:**
```bash
LOG_LEVEL=info
RATE_LIMIT_RPS=10
SENTRY_DSN=your_sentry_dsn             # For error monitoring
```

### 3. Deploy

```bash
# Deploy to Railway
railway up

# Or deploy specific service
railway up --service api
```

## Configuration Files

### railpack.json

The application includes comprehensive `railpack.json` configurations for each service:

- **Root Configuration**: Main application configuration
- **API Configuration**: Python/Flask backend service  
- **Web Configuration**: Node.js/React frontend service
- **Build Configuration**: Multi-stage build with dependency management
- **Deploy Configuration**: Health checks, restart policies, and start commands

### Build Process

The deployment uses a custom build script (`build_frontend.py`) that:

1. Installs frontend dependencies (npm/yarn/pnpm)
2. Builds the React frontend with production optimizations
3. Copies build output to Flask static directory
4. Validates build completion

## Security Features

### CORS Configuration

- **Production**: Restricted to Railway domains only
- **Development**: Wildcard allowed for local development
- **Headers**: Proper CORS headers with credentials support

### Security Headers

- Content Security Policy (CSP)
- X-Frame-Options, X-Content-Type-Options
- HSTS for HTTPS traffic
- Rate limiting and request size limits

### Authentication

- JWT token validation for protected endpoints
- API key authentication for sensitive operations
- Secure session management

## Monitoring and Health Checks

### Health Check Endpoints

- **Basic**: `/health` - Simple status check
- **Detailed**: `/api/health/detailed` - Comprehensive health with dependencies
- **Metrics**: `/api/metrics` - Performance and system metrics

### Monitoring Features

- Request/response logging
- Performance monitoring
- Error tracking and alerting
- System resource monitoring

## Validation and Testing

### Pre-deployment Validation

```bash
# Validate Railway configuration
npm run validate:railway

# Run all tests
npm run test

# Check configuration
python scripts/validate_railway_config.py
```

### Continuous Integration

The project includes GitHub Actions workflow (`.github/workflows/railway-validate.yml`) that:

- Validates Railway configuration
- Checks for security issues
- Tests build process
- Validates environment variables

## Performance Optimizations

### Frontend Optimizations

- Code splitting with manual chunks
- Tree shaking and minification
- Asset optimization and compression
- Lazy loading for improved performance

### Backend Optimizations

- GZip compression middleware
- Request/response caching
- Database connection pooling
- Resource monitoring

## Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Check build logs
railway logs --service api

# Validate frontend build locally
python build_frontend.py
```

**2. CORS Issues**
```bash
# Verify CORS_ORIGINS environment variable
railway variables

# Check allowed origins in logs
railway logs --tail | grep CORS
```

**3. Database Connection Issues**
```bash
# Check DATABASE_URL
railway variables | grep DATABASE

# Test database connection
railway run python -c "from apps.api.src.main import app; print('DB OK')"
```

**4. Environment Variable Issues**
```bash
# List all variables
railway variables

# Validate configuration
railway run python scripts/validate_railway_config.py
```

### Debugging Commands

```bash
# View application logs
railway logs --tail

# Connect to service shell
railway shell

# Check service status
railway status

# View deployment history
railway deployments
```

## Best Practices

### Environment Management

1. **Never commit secrets** to version control
2. **Use Railway environment variables** for all configuration
3. **Validate configuration** before deployment
4. **Use different configurations** for production/development

### Security

1. **Set secure JWT secrets** (32+ characters)
2. **Restrict CORS origins** to your domains only
3. **Enable rate limiting** for production
4. **Monitor security events** through logging

### Performance

1. **Enable GZip compression** for all responses
2. **Use CDN** for static assets when possible
3. **Monitor resource usage** through metrics endpoint
4. **Optimize database queries** and connections

### Monitoring

1. **Set up health checks** for dependencies
2. **Monitor application metrics** regularly
3. **Configure alerting** for critical errors
4. **Use structured logging** for better debugging

## Support

### Documentation Links

- [Railway Documentation](https://docs.railway.app/)
- [Railway Private Networking](https://docs.railway.app/reference/private-networking)
- [Railway Environment Variables](https://docs.railway.app/deploy/variables)

### Project Resources

- **Configuration Validator**: `scripts/validate_railway_config.py`
- **Build Script**: `build_frontend.py`
- **Test Suite**: `tests/test_railway_config.py`
- **Railway Configs**: `railpack.json` (root), `apps/api/railpack.json`, `apps/web/railpack.json`

### Getting Help

1. Check Railway logs for error details
2. Run configuration validator
3. Review this documentation
4. Check Railway status page for service issues

---

**Note**: This deployment configuration has been optimized for Railway.com and includes comprehensive security measures, performance optimizations, and monitoring capabilities.