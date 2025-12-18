# Pre-commit Hooks with Quality Gates - Setup Guide

This guide explains how to set up and use the comprehensive pre-commit hooks with quality gates system for the Crazy Gary project.

## 🚀 Quick Start

### Installation

```bash
# Navigate to project directory
cd crazy-gary

# Install all quality gates and hooks
npm run hooks:install

# Verify installation
npm run hooks:status
```

### Manual Setup (Alternative)

If the automatic installation fails, you can set up manually:

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Install hooks manually
bash scripts/install-hooks.sh

# Generate documentation
bash scripts/generate-docs.sh
```

## 📋 What's Included

### 1. Pre-commit Hooks (< 30 seconds)

The pre-commit hook runs automatically on `git commit` and performs:

- ✅ **TypeScript Compilation** - Type safety validation
- ✅ **ESLint Validation** - Code quality and style checks
- ✅ **Prettier Formatting** - Code formatting consistency
- ✅ **Code Duplication Analysis** - jscpd integration
- ✅ **Security Scanning** - Pattern-based security checks
- ✅ **Test Execution** - Conditional test running
- ✅ **Complexity Analysis** - Cyclomatic complexity checking
- ✅ **File Size Validation** - Performance impact assessment
- ✅ **Spell Checking** - cspell integration
- ✅ **Bundle Analysis** - Build size validation

### 2. Commit Message Validation

Ensures all commits follow conventional commits format:

```
feat(auth): add user authentication
fix(api): resolve memory leak in endpoint
docs(readme): update installation instructions
```

### 3. Pre-push Hooks (2-5 minutes)

Runs comprehensive checks before pushing:

- ✅ **Full Build Validation** - Production build testing
- ✅ **Complete Test Suite** - All tests with coverage
- ✅ **Security Audit** - npm audit with configured severity
- ✅ **Performance Analysis** - Bundle size and performance checks
- ✅ **Documentation Generation** - Automated documentation updates

## 🛠️ Configuration

### Quality Gate Settings (`.quality-gates.json`)

```json
{
  "performance": {
    "maxHookExecutionTime": 30,
    "maxBundleSize": "10MB",
    "maxFileSize": "50KB",
    "fastMode": true,
    "parallelJobs": 4
  },
  "coverage": {
    "minimumLineCoverage": 80,
    "minimumBranchCoverage": 75,
    "minimumFunctionCoverage": 80
  },
  "security": {
    "auditLevel": "moderate",
    "blockOnHighSeverity": true,
    "blockOnModerateSeverity": false
  }
}
```

### Lint-staged Configuration (`.lintstagedrc.json`)

```json
{
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write",
    "npm run type-check",
    "jscpd --threshold 5"
  ],
  "*.{js,jsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
```

## 🎯 Usage

### Automatic Execution

Quality gates run automatically:

```bash
# Pre-commit (automatic)
git add .
git commit -m "feat: add new feature"

# Pre-push (automatic)
git push origin feature-branch
```

### Manual Execution

Run quality gates manually:

```bash
# Run pre-commit checks
npm run quality:pre-commit

# Run all quality checks
npm run quality:full

# Run security scan
npm run security:scan

# Run specific checks
npm run type-check
npm run lint
npm run test
```

### Using the Quality Gate Manager

The new quality gate manager provides comprehensive management:

```bash
# Install quality gates
bash scripts/quality-gate-manager.sh install

# Check status
bash scripts/quality-gate-manager.sh status

# Run specific checks
bash scripts/quality-gate-manager.sh run pre-commit

# Generate reports
bash scripts/quality-gate-manager.sh report quality

# Validate installation
bash scripts/quality-gate-manager.sh validate
```

## ⚡ Performance Optimization

### Fast Mode

Enable fast mode for quicker execution:

```json
{
  "performance": {
    "fastMode": true,
    "parallelJobs": 4,
    "maxHookExecutionTime": 30
  }
}
```

### Caching

The system uses caching for better performance:

- **ESLint**: `--cache --cache-location .eslintcache`
- **Prettier**: Built-in caching
- **TypeScript**: Incremental compilation

### Conditional Execution

Quality gates run intelligently:

- Tests only when test files change
- Build checks only on configuration changes
- Security scans optimized for speed

## 🔧 Troubleshooting

### Common Issues

#### 1. Hooks Not Running

```bash
# Check if hooks are installed
ls -la .git/hooks/

# Reinstall hooks
npm run hooks:install

# Make scripts executable
chmod +x .git/hooks/*
```

#### 2. Slow Execution

```bash
# Check commit size
git diff --cached --name-only | wc -l

# Enable fast mode in configuration
# Review .quality-gates.json

# Clean cache
rm -rf .eslintcache node_modules/.vite
```

#### 3. TypeScript Errors

```bash
# Check TypeScript configuration
cat apps/web/tsconfig.json

# Run type check manually
npm run type-check

# Fix type errors in your code
```

#### 4. ESLint Failures

```bash
# Auto-fix linting issues
npm run lint:fix

# Check ESLint configuration
cat .eslintrc.json
```

#### 5. Test Failures

```bash
# Run tests manually
npm test

# Run with coverage
npm run test:coverage

# Check test configuration
cat apps/web/vitest.config.js
```

### Performance Tuning

#### Speed Up Quality Gates

1. **Reduce File Count**
   - Keep commits focused and small
   - Split large changes into smaller commits

2. **Enable Caching**
   ```bash
   mkdir -p .eslintcache
   ```

3. **Optimize Configuration**
   - Use fast mode
   - Adjust parallel job count
   - Limit scope of checks

4. **Regular Maintenance**
   ```bash
   # Update dependencies
   npm update
   
   # Clean cache
   npm run clean:cache
   
   # Reinstall hooks
   npm run hooks:install
   ```

## 📊 Quality Metrics

### Coverage Thresholds

- **Lines**: Minimum 80%
- **Branches**: Minimum 75%
- **Functions**: Minimum 80%
- **Statements**: Minimum 80%

### Complexity Limits

- **Cyclomatic Complexity**: Maximum 10
- **Cognitive Complexity**: Maximum 15
- **Nesting Level**: Maximum 4
- **Function Length**: Maximum 50 lines

### Security Thresholds

- **Audit Level**: Moderate
- **High Severity**: Block deployment
- **Moderate Severity**: Warning (configurable)

## 📚 Documentation

### Generated Documentation

The system automatically generates comprehensive documentation:

```bash
# Generate all documentation
npm run docs:generate

# View documentation
open docs/generated/
```

Documentation includes:

- **API Documentation**: `docs/api/README.md`
- **Hooks Documentation**: `docs/hooks/README.md`
- **Quality Gates Documentation**: `docs/quality-gates/README.md`
- **Development Process**: `docs/development/README.md`

### Quality Reports

Generate detailed quality reports:

```bash
# Quality metrics report
npm run quality:report

# Security report
npm run security:report

# Coverage report
npm run coverage:report

# Performance report
npm run performance:report
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Quality Gates
on: [push, pull_request]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run quality gates
        run: |
          npm run quality:pre-commit
          npm run quality:pre-push
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Other CI/CD Platforms

The quality gates are designed to work with any CI/CD platform:

```bash
# Install dependencies
npm ci

# Run quality checks
npm run quality:full

# Generate reports
npm run docs:generate
```

## 🎯 Best Practices

### For Developers

1. **Keep Commits Small**
   - Focus on single features/bugs
   - Keep changes atomic and focused

2. **Write Good Commit Messages**
   - Use conventional commit format
   - Write descriptive subjects
   - Reference issues when applicable

3. **Test Locally**
   - Run quality gates before committing
   - Fix issues promptly
   - Monitor performance

4. **Monitor Quality Metrics**
   - Watch coverage trends
   - Address complexity warnings
   - Maintain security standards

### For Teams

1. **Establish Quality Standards**
   - Document team expectations
   - Regular configuration reviews
   - Training on quality tools

2. **Configuration Management**
   - Version control settings
   - Document changes
   - Coordinate updates

3. **Monitoring and Improvement**
   - Track quality trends
   - Identify regression patterns
   - Continuous improvement

## 🚨 Emergency Procedures

### Bypass Quality Gates

In emergency situations, you can bypass quality gates:

```bash
# Skip pre-commit checks
git commit --no-verify -m "emergency: hotfix"

# Skip pre-push checks
git push --no-verify origin feature-branch
```

**Note**: Use sparingly and follow up with proper quality checks.

### Quick Fixes

```bash
# Fix common issues quickly
npm run lint:fix
npm run format
npm test -- --run

# Then commit
git add .
git commit -m "fix: resolve quality gate issues"
```

## 📞 Support

### Getting Help

1. **Check Documentation**
   - Read this guide
   - Check generated docs
   - Review configuration

2. **Run Diagnostics**
   ```bash
   bash scripts/quality-gate-manager.sh validate
   npm run hooks:status
   ```

3. **Check Logs**
   - Review console output
   - Check error messages
   - Examine configuration

4. **Contact Support**
   - Create detailed issue
   - Include execution logs
   - Provide context and steps

### Contributing

To improve the quality gates system:

1. **Follow the existing patterns**
2. **Test thoroughly**
3. **Update documentation**
4. **Submit pull requests**

---

This comprehensive setup guide ensures you can effectively use and maintain the pre-commit hooks with quality gates system. The system is designed to be fast, reliable, and provide meaningful feedback to help maintain high code quality.