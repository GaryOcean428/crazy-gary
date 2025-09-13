# 🚀 Crazy-Gary Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.10+
- Git

### Automated Setup
```bash
# Clone the repository
git clone https://github.com/GaryOcean428/crazy-gary.git
cd crazy-gary

# Run automated setup (recommended)
./scripts/setup-dev.sh
```

### Manual Setup
```bash
# Install dependencies
npm install --legacy-peer-deps
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Build packages
npm run build

# Start development servers
# Terminal 1 - API
cd apps/api && python src/main.py

# Terminal 2 - Frontend  
cd apps/web && npm run dev
```

## Development Workflow

### Code Quality Standards
- **Zero tolerance for linting errors** ✅
- All TypeScript code must compile without errors
- React hooks must follow best practices
- 100% build success rate required

### Before Committing
```bash
# Run quality checks
npm run lint          # Must pass with 0 errors
npm run type-check    # Must pass all type checks  
npm run build         # Must build successfully
npm run test          # All tests must pass
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/amazing-improvement
git add .
git commit -m "Add amazing improvement with tests"

# Pre-commit hooks will automatically run:
# - Linting checks
# - Type checking 
# - Build validation
```

## Architecture Overview

### Frontend (React 19 + Vite)
```
apps/web/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route components
│   ├── hooks/         # Custom React hooks
│   ├── contexts/      # React contexts
│   └── lib/           # Utilities
├── public/            # Static assets
└── dist/              # Build output
```

### Backend (Flask + SQLAlchemy)
```
apps/api/
├── src/
│   ├── main.py        # Application entry point
│   ├── routes/        # API endpoints
│   ├── models/        # Database models
│   ├── services/      # Business logic
│   └── utils/         # Helper functions
└── static/            # Served static files
```

### Packages (TypeScript)
```
packages/
├── harmony-adapter/   # Message format adapter
└── mcp-clients/      # MCP client implementations
```

## Common Development Tasks

### Adding a New Page
1. Create component in `apps/web/src/pages/`
2. Add route in `apps/web/src/App.jsx`
3. Add navigation link in `apps/web/src/components/layout/sidebar.jsx`
4. Test the new page functionality

### Adding a New API Endpoint
1. Create route in `apps/api/src/routes/`
2. Add route handler with proper error handling
3. Update API documentation
4. Add integration tests

### Performance Optimization
```bash
# Analyze performance
./scripts/performance-monitor.sh

# Check bundle sizes
cd apps/web && npm run build
ls -lh dist/assets/

# Profile build time
time npm run build
```

## Testing Strategy

### Unit Tests
- Components: React Testing Library
- Hooks: Custom hook testing utilities
- API: pytest with mocking
- Utilities: Jest for JavaScript, pytest for Python

### Integration Tests
- API endpoints with real database
- Authentication flows
- Multi-component interactions

### E2E Tests
- Complete user workflows
- Cross-browser compatibility
- Performance benchmarks

## Debugging Guide

### Frontend Debugging
```bash
# Start with source maps
cd apps/web && npm run dev

# Use React DevTools browser extension
# Check browser console for errors
# Inspect network requests in DevTools
```

### Backend Debugging
```bash
# Start with debug mode
cd apps/api && FLASK_DEBUG=1 python src/main.py

# Check logs for errors
# Use pdb for step debugging
import pdb; pdb.set_trace()
```

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Check Node.js version
node --version  # Should be 18+
```

#### Linting Errors
```bash
# Auto-fix simple issues
npm run lint -- --fix

# Check for unused imports
# Remove unused variables
# Fix React hooks dependencies
```

#### TypeScript Errors
```bash
# Check compilation
npm run type-check

# Common fixes:
# - Add missing type definitions
# - Fix import paths
# - Update interface definitions
```

## Performance Guidelines

### Frontend Performance
- Bundle size < 500KB for main chunk
- Build time < 60 seconds
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s

### Backend Performance
- API response time < 200ms for simple requests
- Database query time < 100ms average
- Memory usage < 512MB for development

### Code Quality Metrics
- ESLint errors: 0
- TypeScript errors: 0
- Test coverage: >80%
- Build success rate: 100%

## Advanced Topics

### Custom MCP Client Development
```typescript
// packages/mcp-clients/src/custom-client.ts
import { BaseMCPClient } from './base-client'

export class CustomMCPClient extends BaseMCPClient {
  async connect(): Promise<void> {
    // Implementation
  }
  
  async callTool(name: string, args: any): Promise<any> {
    // Implementation
  }
}
```

### Adding New Agent Capabilities
```python
# apps/api/src/services/agent_service.py
class AgentService:
    def add_capability(self, capability: AgentCapability):
        # Implementation
        pass
```

### Monitoring and Observability
- Performance monitoring with custom metrics
- Error tracking and alerting
- User analytics and behavior tracking
- Infrastructure monitoring

## Deployment

### Development Deployment
```bash
# Build for production
npm run build

# Deploy to Railway
railway deploy
```

### Production Considerations
- Environment variable management
- Database migrations
- Asset optimization
- Monitoring setup
- Backup strategies

## Contributing

### Code Style
- Use meaningful variable names
- Write self-documenting code
- Add comments for complex logic
- Follow existing patterns

### Pull Request Guidelines
1. Create descriptive PR title and description
2. Ensure all checks pass
3. Request review from maintainers
4. Update documentation if needed

### Issue Reporting
- Use issue templates
- Provide reproduction steps
- Include environment details
- Add relevant labels

## Resources

- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

## Support

- 📚 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/GaryOcean428/crazy-gary/issues)
- 💬 [Discussions](https://github.com/GaryOcean428/crazy-gary/discussions)
- 📧 [Email Support](mailto:support@crazy-gary.dev)