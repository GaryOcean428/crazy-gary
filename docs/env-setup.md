# Environment Setup Guide

This document provides instructions for setting up the development and production environments for the Crazy-Gary project.

## Local Development

### Prerequisites

- Node.js 18+ and npm 8+
- Python 3.11+
- Docker and Docker Compose
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crazy-gary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start development servers**
   ```bash
   # Start all services
   npm run dev

   # Or start individually
   cd apps/web && npm run dev
   cd apps/api && source venv/bin/activate && python src/main.py
   ```

### Environment Variables

#### Required Variables

- `HF_BASE_URL_120B`: Hugging Face 120B model endpoint
- `HF_BASE_URL_20B`: Hugging Face 20B model endpoint
- `HUGGINGFACE_API_KEY`: Hugging Face API key
- `JWT_SECRET`: Secret for JWT token signing

#### Optional Variables

- `SENTRY_DSN`: Sentry error reporting
- `RATE_LIMIT_RPS`: Rate limiting (default: 3)
- `NODE_ENV`: Environment mode (development/production)

## Production Deployment

### Railway Configuration

The application is configured for deployment on Railway with the following requirements:

#### Binding Configuration

- **MUST** bind to `0.0.0.0:$PORT`
- Replace all `localhost` references with Railway domains
- Use `RAILWAY_PRIVATE_DOMAIN` for internal service communication
- Use `RAILWAY_PUBLIC_DOMAIN` for external access

#### CORS Configuration

- **NO** wildcard (`*`) origins in production
- Configure specific allowed origins
- Enable credentials for authenticated requests

#### WebSocket Configuration

- Use `wss://` protocol for HTTPS environments
- Configure WebSocket URLs to match deployment protocol

### Health Checks

The application implements health check endpoints:

- `/health`: Basic health check
- `/health/ready`: Readiness probe
- `/health/live`: Liveness probe

### Database

- Use PostgreSQL in production
- Configure connection pooling
- Run migrations before deployment
- Set up automated backups

### Monitoring

#### Structured Logging

- JSON format logs
- Include trace IDs
- Log levels: ERROR, WARN, INFO, DEBUG
- Redact sensitive information

#### Metrics

- Request count and latency
- Tool call success/failure rates
- Model response times
- Error rates by endpoint

#### Error Reporting

- Sentry integration for error tracking
- Alert on critical errors
- Performance monitoring

### Security

#### Secrets Management

- Use Railway's environment variables
- Never commit secrets to repository
- Rotate secrets regularly
- Use different secrets for each environment

#### Network Security

- Enable HTTPS only
- Configure proper CORS headers
- Implement rate limiting
- Use secure session cookies

### Scaling

#### Auto-scaling Configuration

- CPU-based scaling (target: 70%)
- Memory-based scaling (target: 80%)
- Minimum 1 instance
- Maximum 10 instances

#### Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries

## Development Best Practices

### Docker Development

Use Docker for consistent development environments:

```bash
# Build and start all services
docker-compose up --build

# Start specific service
docker-compose up web

# View logs
docker-compose logs -f api
```

### Testing

```bash
# Run all tests
npm run test

# Run specific test suite
cd packages/harmony-adapter && npm test

# Run with coverage
npm run test -- --coverage
```

### Code Quality

```bash
# Lint all code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 5000, 5432 are available
2. **Environment variables**: Check all required variables are set
3. **Database connection**: Verify PostgreSQL is running
4. **API endpoints**: Ensure API server is accessible from frontend

### Debug Mode

Enable debug logging:

```bash
export DEBUG=crazy-gary:*
npm run dev
```

### Health Check Verification

Test health endpoints:

```bash
curl http://localhost:5000/health
curl http://localhost:5000/health/ready
curl http://localhost:5000/health/live
```

