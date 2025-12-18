# 🚀 Developer Quick Reference Guide

**Bookmark this page for quick access to the most common development commands and workflows.**

## 📋 Quick Setup Checklist

```bash
# 1. Clone and setup (one-time)
git clone https://github.com/GaryOcean428/crazy-gary.git
cd crazy-gary
npm run setup

# 2. Start development
npm run dev

# 3. Verify setup
open http://localhost:5173  # Frontend
curl http://localhost:3000/health  # Backend
```

## 🎯 Essential Commands

### Development Server
```bash
# Start all services
npm run dev

# Start individual services
npm run dev:web      # Frontend only (port 5173)
npm run dev:api      # Backend only (port 3000)

# Restart services
npm run restart
```

### Quality Gates
```bash
# Run before every commit
npm run quality:pre-commit

# Quick quality check
npm run quality:fast

# Install hooks
npm run hooks:install:enhanced

# Check status
npm run quality:validate
```

### Testing
```bash
# Run all tests
npm run test

# Tests with coverage
npm run test:coverage

# Watch mode
npm run test -- --watch

# Specific test file
npm test TaskManager.test.tsx

# E2E tests
npm run test:e2e
```

### Code Quality
```bash
# Lint and fix
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check

# Security scan
npm run security:scan
```

### Building & Deployment
```bash
# Production build
npm run build:production

# Check bundle size
npm run check-bundle

# Deploy to Railway
railway deploy

# Railway status
railway status
```

## 🔧 Environment & Configuration

### Environment Variables
```bash
# Copy and edit environment file
cp .env.example .env

# Required variables
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://...
HUGGINGFACE_API_KEY=your-key
HF_BASE_URL_120B=your-endpoint
HF_BASE_URL_20B=your-endpoint
```

### Database Operations
```bash
# Backend directory
cd apps/api

# Create migration
flask db migrate -m "Description"

# Apply migration
flask db upgrade

# Reset database (development only)
flask db drop && flask db create && flask db upgrade
```

## 🌿 Git Workflow

### Starting New Work
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Set upstream
git push -u origin feature/your-feature-name
```

### Commit Workflow
```bash
# Stage changes
git add .

# Commit with conventional format
git commit -m "feat(frontend): add new dashboard component"

# Push changes
git push origin feature/your-feature-name
```

### Branch Management
```bash
# Update with main
git fetch origin
git rebase origin/main

# Merge main into your branch
git checkout feature/your-feature-name
git merge main

# Delete branch (after merge)
git branch -d feature/your-feature-name
```

## 🐛 Common Issues & Solutions

### Port Conflicts
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Clean Restart
```bash
# Complete clean restart
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Reset database (dev only)
cd apps/api
source venv/bin/activate
flask db drop && flask db create && flask db upgrade
```

### Cache Issues
```bash
# Clear all caches
npm run clean
rm -rf node_modules/.vite
rm -rf apps/api/__pycache__
find . -name "*.pyc" -delete
```

## 📊 Monitoring & Debugging

### Health Checks
```bash
# API health
curl http://localhost:3000/health

# Ready status
curl http://localhost:3000/health/ready

# Live status
curl http://localhost:3000/health/live
```

### Logs
```bash
# View logs
docker-compose logs -f api
docker-compose logs -f web

# Railway logs
railway logs --tail 100
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=crazy-gary:*
npm run dev
```

## 🧪 Testing Quick Reference

### Test Commands
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage

# Specific test
npm test UserProfile.test.tsx
```

### Debugging Tests
```typescript
// Add debug output
console.log('Debug:', data);

// Run specific test
npm test -- --testNamePattern="should create user"

// Watch mode
npm test -- --watch
```

## 🔐 Security Quick Checks

### Before Committing
```bash
# Security scan
npm run security:scan

# Dependency audit
npm audit

# Quality gates
npm run quality:pre-commit
```

### Environment Security
```bash
# Check for secrets in code
npm run security:scan

# Environment variables
grep -r "SECRET" src/  # Should only be in .env
```

## 📈 Performance Monitoring

### Bundle Analysis
```bash
# Check bundle size
npm run check-bundle

# Analyze dependencies
npm run analyze:deps

# Performance monitoring
npm run performance:monitor
```

### Database Performance
```sql
-- Check slow queries (in psql)
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 🚀 Deployment

### Railway Deployment
```bash
# Deploy backend
cd apps/api
railway deploy

# Deploy frontend
cd ../../apps/web
railway deploy

# Check status
railway status
```

### Pre-deployment Checklist
```bash
# Quality gates
npm run quality:pre-commit

# Tests
npm run test:coverage

# Security
npm run security:scan

# Build
npm run build:production
```

## 📞 Getting Help

### Internal Resources
- **Slack**: #dev-help (general), #backend, #frontend
- **Office Hours**: Mon/Wed 2-3 PM, Fri 1-2 PM
- **Documentation**: [Developer Onboarding Guide](./DEVELOPER_ONBOARDING_GUIDE.md)

### Common Solutions
1. **Check health endpoints** first
2. **Run quality gates** before asking for help
3. **Check logs** for error details
4. **Restart services** if stuck
5. **Update dependencies** if having issues

## 💡 Pro Tips

### Development Speed
- Use `npm run dev` to start everything at once
- Set up shell aliases for common commands
- Enable hot reloading for faster iteration
- Use React DevTools for frontend debugging

### Code Quality
- Run `npm run quality:fast` before commits
- Write tests alongside new features
- Use TypeScript strict mode
- Monitor bundle size regularly

### Debugging
- Use `console.log` strategically
- Set breakpoints in VS Code
- Use browser DevTools
- Check network tab for API issues

---

**🎯 Remember**: When in doubt, run `npm run quality:pre-commit` and check the [full onboarding guide](./DEVELOPER_ONBOARDING_GUIDE.md)!

*Last updated: December 17, 2025*