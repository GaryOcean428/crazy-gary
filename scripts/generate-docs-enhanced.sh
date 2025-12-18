#!/bin/bash

# Crazy Gary Enhanced Documentation Generator
# Comprehensive documentation for hooks, quality gates, and development processes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[DOCS]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create docs directory structure
mkdir -p docs/hooks docs/quality-gates docs/development docs/api

print_status "Generating comprehensive documentation..."

# 1. Hooks Documentation
print_status "Generating hooks documentation..."
cat > docs/hooks/README.md << 'EOF'
# Git Hooks Documentation

This document describes the comprehensive Git hooks system implemented in Crazy Gary for maintaining code quality and security.

## Overview

Our Git hooks system provides multiple layers of quality gates:

- **Pre-commit**: Fast quality checks (< 30 seconds)
- **Commit message**: Conventional commits validation
- **Pre-push**: Comprehensive testing and security checks

## Hooks Configuration

### Installation

```bash
# Install all hooks
npm run hooks:install

# Check hook status
npm run hooks:status

# Uninstall hooks
npm run hooks:uninstall
```

### Manual Execution

```bash
# Run pre-commit quality gates manually
npm run quality:pre-commit

# Run commit message validation
npm run quality:commit-msg

# Run pre-push comprehensive tests
npm run quality:pre-push
```

## Quality Gates

### Pre-commit Hooks (scripts/pre-commit.sh)

**Execution Time**: < 30 seconds
**Triggered**: On `git commit`

**Checks Performed**:

1. **TypeScript Compilation**
   - Fast type checking using `tsc --noEmit`
   - Timeout: 10 seconds
   - Blocking: Yes

2. **ESLint Validation**
   - Code quality and style checks
   - Auto-fix enabled for minor issues
   - Caching for performance
   - Blocking: Yes (errors only)

3. **Prettier Formatting**
   - Code formatting consistency
   - Auto-formatting on changes
   - Non-blocking with warnings

4. **Code Duplication Analysis**
   - jscpd integration
   - Threshold: 5% duplication
   - Blocking: Warnings only

5. **Test Execution** (conditional)
   - Runs only if test files are modified
   - Fast test execution with dot reporter
   - Timeout: 30 seconds
   - Blocking: Yes

6. **Security Scanning**
   - Pattern-based security checks
   - Secret detection
   - XSS pattern detection
   - Blocking: High severity only

7. **Complexity Analysis**
   - Cyclomatic complexity checking
   - Nesting level validation
   - Warning-based feedback

8. **File Size Validation**
   - Maximum file size: 50KB
   - Large file warnings
   - Performance impact assessment

9. **Spell Checking**
   - cspell integration
   - Markdown and documentation files
   - Non-blocking warnings

10. **Bundle Analysis** (conditional)
    - Build size validation
    - Configuration change detection
    - Performance impact assessment

11. **Coverage Validation**
    - Minimum coverage: 80%
    - Coverage threshold enforcement
    - Detailed reporting

### Commit Message Hook (scripts/commit-msg.sh)

**Triggered**: On commit message creation

**Validation Rules**:

- **Format**: `type(scope): subject`
- **Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, security, deps
- **Subject Length**: Maximum 50 characters
- **Body Length**: Maximum 100 characters
- **Breaking Changes**: Must include `BREAKING CHANGE:` footer

**Examples**:
```
feat(auth): add user authentication
fix(api): resolve memory leak in endpoint
docs(readme): update installation instructions
```

### Pre-push Hook (scripts/pre-push.sh)

**Execution Time**: 2-5 minutes
**Triggered**: On `git push`

**Comprehensive Checks**:

1. **Full TypeScript Compilation**
   - Production build validation
   - Bundle size analysis
   - Performance impact assessment

2. **Complete ESLint Check**
   - Full codebase validation
   - No warnings allowed
   - Security rule enforcement

3. **Full Test Suite with Coverage**
   - All tests must pass
   - Coverage thresholds enforced
   - Performance benchmarks

4. **Security Audit**
   - npm audit with configured level
   - Dependency vulnerability scanning
   - Security header validation

5. **Performance Analysis**
   - Bundle size validation
   - Performance regression detection
   - Resource optimization checks

6. **Documentation Generation**
   - API documentation update
   - Coverage report generation
   - Dependency documentation

## Quality Gate Configuration

The system uses `.quality-gates.json` for configuration:

```json
{
  "performance": {
    "maxHookExecutionTime": 30,
    "maxBundleSize": "10MB",
    "maxFileSize": "50KB"
  },
  "coverage": {
    "minimumLineCoverage": 80,
    "minimumBranchCoverage": 75
  },
  "security": {
    "auditLevel": "moderate",
    "blockOnHighSeverity": true
  }
}
```

## Lint-staged Integration

File-specific processing with `.lintstagedrc.json`:

```json
{
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write",
    "npm run type-check",
    "jscpd --threshold 5"
  ]
}
```

## Performance Optimization

### Caching
- ESLint: `--cache --cache-location`
- Prettier: Built-in caching
- TypeScript: Incremental compilation

### Parallel Processing
- File-level parallel execution
- Background processing where possible
- Optimized task ordering

### Conditional Execution
- Test execution only when needed
- Build checks only on config changes
- Smart dependency analysis

## Error Handling

### Fail Fast
- Early termination on critical errors
- Clear error messages with fixes
- Non-blocking warnings for minor issues

### Recovery Options
- Auto-fix for formatting issues
- Interactive mode for complex decisions
- Bypass mechanisms for emergency commits

## Monitoring and Metrics

### Execution Tracking
- Time measurement for each check
- Performance trend analysis
- Success/failure rate monitoring

### Reporting
- Detailed console output
- JSON reports for CI/CD integration
- Coverage reports with thresholds

## Troubleshooting

### Common Issues

1. **Hooks not running**
   ```bash
   npm run hooks:install
   chmod +x .git/hooks/*
   ```

2. **Slow execution**
   - Check file count in commit
   - Verify caching is working
   - Review quality gate configuration

3. **False positives**
   - Adjust thresholds in `.quality-gates.json`
   - Add ignore patterns
   - Update security rules

4. **Test failures**
   ```bash
   npm test -- --run
   npm run lint:fix
   npm run format
   ```

### Performance Tuning

1. **Reduce hook execution time**
   - Use `fastMode: true` in configuration
   - Limit parallel jobs
   - Optimize test execution

2. **Improve cache performance**
   - Ensure cache directories exist
   - Regular cache cleanup
   - Monitor cache hit rates

## Best Practices

### For Developers

1. **Commit Strategy**
   - Keep commits focused and small
   - Write descriptive commit messages
   - Test locally before pushing

2. **Code Quality**
   - Run quality gates manually before commit
   - Address warnings promptly
   - Maintain test coverage

3. **Performance**
   - Monitor hook execution times
   - Optimize large files
   - Use appropriate file organization

### For Teams

1. **Configuration Management**
   - Version control quality gate settings
   - Document team-specific rules
   - Regular configuration reviews

2. **Training**
   - Onboard developers on hooks system
   - Share troubleshooting guides
   - Maintain documentation updates

## Integration

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Quality Gates
  run: |
    npm run quality:pre-commit
    npm run quality:pre-push
```

### IDE Integration
- ESLint plugins for real-time feedback
- Prettier integration for formatting
- TypeScript for type checking

## Support

For issues or questions:
1. Check troubleshooting section
2. Review configuration documentation
3. Contact development team
4. Submit issue with execution logs

EOF

print_success "Hooks documentation generated in docs/hooks/README.md"

# 2. Quality Gates Documentation
print_status "Generating quality gates documentation..."
cat > docs/quality-gates/README.md << 'EOF'
# Quality Gates Documentation

This document provides detailed information about the quality gates system in Crazy Gary.

## Architecture

### Layered Quality Approach

```
┌─────────────────────────────────────┐
│           Pre-commit               │  < 30 seconds
│    - Type checking                 │
│    - Linting                      │
│    - Formatting                   │
│    - Basic tests                  │
│    - Security scan                │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│         Commit Message             │  < 1 second
│    - Format validation             │
│    - Conventional commits          │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│           Pre-push                 │  2-5 minutes
│    - Full test suite               │
│    - Coverage analysis             │
│    - Security audit                │
│    - Performance checks            │
│    - Documentation generation      │
└─────────────────────────────────────┘
```

## Quality Metrics

### Code Quality Metrics

#### Coverage Thresholds
- **Lines**: Minimum 80%
- **Branches**: Minimum 75%
- **Functions**: Minimum 80%
- **Statements**: Minimum 80%

#### Complexity Limits
- **Cyclomatic Complexity**: Maximum 10
- **Cognitive Complexity**: Maximum 15
- **Nesting Level**: Maximum 4
- **Function Length**: Maximum 50 lines
- **File Length**: Maximum 500 lines

#### Duplication Limits
- **Duplication Percentage**: Maximum 5%
- **Duplication Lines**: Maximum 6 lines
- **Duplicated Blocks**: Maximum 3 occurrences

### Performance Metrics

#### Execution Time Limits
- **Pre-commit Hooks**: 30 seconds maximum
- **Individual Checks**: 10 seconds maximum
- **Test Execution**: 30 seconds maximum
- **Type Checking**: 10 seconds maximum

#### Bundle Size Limits
- **Maximum Bundle Size**: 10MB
- **Maximum File Size**: 50KB
- **Maximum Chunk Size**: 1MB

### Security Metrics

#### Vulnerability Thresholds
- **Audit Level**: Moderate
- **High Severity**: Block deployment
- **Moderate Severity**: Warning (configurable)
- **Low Severity**: Informational only

#### Security Patterns
- **Secret Detection**: All patterns
- **XSS Prevention**: Strict mode
- **SQL Injection**: All patterns
- **Command Injection**: All patterns

## Configuration

### Quality Gate Settings

The system is configured via `.quality-gates.json`:

```json
{
  "performance": {
    "maxHookExecutionTime": 30,
    "parallelJobs": 4,
    "fastMode": true
  },
  "coverage": {
    "minimumLineCoverage": 80,
    "excludeFromCoverage": [
      "**/*.d.ts",
      "**/*.test.*"
    ]
  },
  "complexity": {
    "maxCyclomaticComplexity": 10,
    "complexityWarningThreshold": 8
  },
  "security": {
    "auditLevel": "moderate",
    "checkForSecrets": true,
    "requiredSecurityHeaders": [
      "Content-Security-Policy",
      "X-Frame-Options"
    ]
  }
}
```

### ESLint Configuration

ESLint rules are configured in `.eslintrc.json`:

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/strict-type-checked",
    "plugin:security/recommended"
  ],
  "rules": {
    "complexity": ["error", 10],
    "max-depth": ["error", 4],
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### Prettier Configuration

Code formatting rules in `.prettierrc.json`:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

## Quality Tools

### Code Analysis Tools

#### ESLint
- **Purpose**: Code quality and style
- **Configuration**: `.eslintrc.json`
- **Cache**: `.eslintcache`
- **Integration**: Pre-commit and pre-push

#### TypeScript
- **Purpose**: Type safety
- **Configuration**: `tsconfig.json`
- **Mode**: Incremental compilation
- **Integration**: All hooks

#### Prettier
- **Purpose**: Code formatting
- **Configuration**: `.prettierrc.json`
- **Cache**: Built-in
- **Integration**: Auto-formatting

#### jscpd
- **Purpose**: Code duplication detection
- **Threshold**: 5% duplication
- **Output**: JSON reports
- **Integration**: Pre-commit

### Testing Tools

#### Vitest
- **Purpose**: Unit and integration testing
- **Configuration**: `vitest.config.js`
- **Coverage**: v8 provider
- **Integration**: Conditional execution

#### Playwright
- **Purpose**: End-to-end testing
- **Configuration**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit
- **Integration**: Pre-push only

### Security Tools

#### npm audit
- **Purpose**: Dependency vulnerability scanning
- **Levels**: low, moderate, high, critical
- **Integration**: Pre-push and security scans

#### cspell
- **Purpose**: Spell checking
- **Configuration**: `.cspell.json`
- **Integration**: Documentation files

#### Custom Security Scanner
- **Purpose**: Pattern-based security analysis
- **Patterns**: Custom security rules
- **Integration**: Pre-commit and pre-push

## Workflow Integration

### Developer Workflow

1. **Development**
   - Write code with IDE integration
   - Run local quality checks
   - Fix issues as they arise

2. **Pre-commit**
   - Stage changes
   - Run quality gates automatically
   - Address any failures
   - Commit with validated message

3. **Pre-push**
   - Push to remote branch
   - Run comprehensive checks
   - Address any failures
   - Merge after validation

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
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
      
      - name: Run pre-commit checks
        run: npm run quality:pre-commit
      
      - name: Run pre-push checks
        run: npm run quality:pre-push
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### IDE Integration

#### VS Code
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

## Monitoring and Reporting

### Quality Metrics Dashboard

Track quality metrics over time:

- **Code Coverage**: Trends and thresholds
- **Complexity**: Distribution and limits
- **Security**: Vulnerability counts
- **Performance**: Execution times

### Reports

#### Coverage Reports
- **Format**: HTML, JSON, LCOV
- **Location**: `coverage/`
- **Integration**: CI/CD pipelines

#### Security Reports
- **Format**: JSON, SARIF
- **Location**: `security-reports/`
- **Integration**: Security tools

#### Performance Reports
- **Format**: JSON, HTML
- **Location**: `performance-reports/`
- **Integration**: Performance monitoring

## Best Practices

### For Individual Developers

1. **Run Quality Gates Locally**
   ```bash
   npm run quality:pre-commit
   npm run quality:pre-push
   ```

2. **Address Issues Promptly**
   - Fix linting errors immediately
   - Maintain test coverage
   - Monitor complexity metrics

3. **Use Configuration Wisely**
   - Understand threshold implications
   - Document team-specific rules
   - Regular configuration reviews

### For Teams

1. **Establish Quality Standards**
   - Document team quality expectations
   - Regular quality gate reviews
   - Training on quality tools

2. **Monitor Quality Trends**
   - Track quality metrics over time
   - Identify regression patterns
   - Continuous improvement process

3. **Manage Configuration**
   - Version control quality settings
   - Document configuration changes
   - Coordinate team updates

## Troubleshooting

### Common Issues

#### Slow Quality Gates
```bash
# Check file count
git diff --cached --name-only | wc -l

# Verify caching
ls -la .eslintcache

# Optimize configuration
# Review .quality-gates.json
```

#### Coverage Failures
```bash
# Generate coverage report
npm run test:coverage

# View detailed coverage
open coverage/index.html

# Fix coverage gaps
# Add missing tests
```

#### Security Issues
```bash
# Run security scan
npm run security:scan

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Performance Tuning

#### Optimize Execution Time
1. **Use Fast Mode**
   ```json
   {
     "performance": {
       "fastMode": true,
       "parallelJobs": 4
     }
   }
   ```

2. **Enable Caching**
   ```bash
   # Ensure cache directories exist
   mkdir -p .eslintcache
   ```

3. **Limit Scope**
   ```bash
   # Check only changed files
   git diff --name-only --cached
   ```

## Evolution and Updates

### Regular Maintenance

1. **Dependency Updates**
   - Regular tool updates
   - Security patch application
   - Performance improvements

2. **Rule Updates**
   - Industry standard adoption
   - Team feedback incorporation
   - Best practice alignment

3. **Configuration Optimization**
   - Performance monitoring
   - Threshold adjustments
   - Process refinement

### Version Management

- **Semantic Versioning**: For quality gate changes
- **Configuration Versioning**: Track setting changes
- **Migration Guides**: For breaking changes

EOF

print_success "Quality gates documentation generated in docs/quality-gates/README.md"

# 3. Development Process Documentation
print_status "Generating development process documentation..."
cat > docs/development/README.md << 'EOF'
# Development Process Documentation

This document outlines the development process, quality gates, and best practices for the Crazy Gary project.

## Development Workflow

### 1. Pre-Development Setup

```bash
# Clone repository
git clone <repository-url>
cd crazy-gary

# Install dependencies
npm install

# Install hooks
npm run hooks:install

# Verify setup
npm run quality:check
```

### 2. Development Process

#### Feature Development
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
# ... development work ...

# Run quality gates locally
npm run quality:pre-commit

# If tests fail, fix them
npm test
npm run lint:fix
npm run format

# Commit with conventional format
git commit -m "feat(auth): add user authentication"
```

#### Bug Fixes
```bash
# Create bug fix branch
git checkout -b fix/bug-description

# Fix the issue
# ... bug fix work ...

# Run quality gates
npm run quality:pre-commit

# Commit with fix format
git commit -m "fix(api): resolve memory leak in endpoint"
```

#### Documentation Updates
```bash
# Create docs branch
git checkout -b docs/update-description

# Update documentation
# ... documentation work ...

# Run quality gates
npm run quality:pre-commit

# Commit with docs format
git commit -m "docs(readme): update installation instructions"
```

### 3. Code Review Process

#### Before Submitting PR
1. **Self-Review**
   - Run all quality gates
   - Check test coverage
   - Verify documentation

2. **Local Testing**
   ```bash
   npm run test
   npm run test:coverage
   npm run build
   npm run quality:pre-push
   ```

3. **Commit Message Check**
   ```bash
   npm run quality:commit-msg
   ```

#### Pull Request Guidelines
- **Title**: Use conventional commit format
- **Description**: Include testing instructions
- **Screenshots**: For UI changes
- **Breaking Changes**: Document in detail

### 4. Quality Standards

#### Code Quality Requirements

1. **TypeScript**
   - No `any` types unless absolutely necessary
   - Strict type checking enabled
   - Proper error handling
   - Interface definitions for all data structures

2. **Testing**
   - Minimum 80% code coverage
   - Unit tests for all components
   - Integration tests for critical paths
   - E2E tests for user workflows

3. **Documentation**
   - JSDoc comments for public APIs
   - README files for all modules
   - Inline comments for complex logic
   - API documentation for endpoints

4. **Security**
   - No hardcoded secrets
   - Input validation
   - Output encoding
   - Dependency vulnerability scanning

#### Performance Standards

1. **Bundle Size**
   - Maximum bundle size: 10MB
   - Code splitting where appropriate
   - Tree shaking optimization
   - Lazy loading for large components

2. **Runtime Performance**
   - Fast initial load (< 3 seconds)
   - Smooth interactions (< 100ms)
   - Efficient re-renders
   - Proper memoization

3. **Development Experience**
   - Fast build times (< 30 seconds)
   - Hot module replacement
   - Quick test execution
   - Efficient quality gates

### 5. Testing Strategy

#### Test Types

1. **Unit Tests**
   - Component testing with React Testing Library
   - Function testing with Jest/Vitest
   - Utility function testing
   - Mock external dependencies

2. **Integration Tests**
   - API endpoint testing
   - Database interaction testing
   - Service integration testing
   - Cross-component interaction testing

3. **End-to-End Tests**
   - User workflow testing with Playwright
   - Cross-browser compatibility
   - Mobile responsiveness
   - Performance testing

4. **Accessibility Tests**
   - WCAG compliance testing
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast validation

#### Test Execution

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test component.test.ts

# Run in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:accessibility
```

### 6. Security Practices

#### Secure Development

1. **Code Security**
   - No hardcoded credentials
   - Input sanitization
   - Output encoding
   - SQL injection prevention

2. **Dependency Security**
   - Regular vulnerability scanning
   - Dependency updates
   - License compatibility
   - Supply chain security

3. **Infrastructure Security**
   - Environment variable management
   - Secure configuration
   - Access control
   - Monitoring and logging

#### Security Testing

```bash
# Run security scan
npm run security:scan

# Audit dependencies
npm audit

# Check for secrets
npm run security:scan -- --secrets

# Validate security headers
npm run security:scan -- --headers
```

### 7. Performance Optimization

#### Performance Best Practices

1. **Code Optimization**
   - Minimize bundle size
   - Optimize images and assets
   - Use efficient algorithms
   - Implement proper caching

2. **Build Optimization**
   - Code splitting
   - Tree shaking
   - Asset optimization
   - Compression

3. **Runtime Optimization**
   - Lazy loading
   - Memoization
   - Virtual scrolling
   - Efficient state management

#### Performance Monitoring

```bash
# Analyze bundle
npm run analyze

# Performance monitoring
npm run performance:monitor

# Lighthouse audit
npm run lighthouse

# Load testing
npm run test:performance
```

### 8. Documentation Standards

#### Documentation Types

1. **Code Documentation**
   - JSDoc comments
   - Type definitions
   - Inline comments
   - README files

2. **API Documentation**
   - Endpoint documentation
   - Request/response examples
   - Error handling
   - Authentication details

3. **User Documentation**
   - User guides
   - Feature descriptions
   - Troubleshooting guides
   - FAQ sections

#### Documentation Generation

```bash
# Generate API documentation
npm run docs:generate

# Generate component documentation
npm run docs:components

# Generate dependency documentation
npm run docs:dependencies

# Generate configuration documentation
npm run docs:configuration
```

### 9. Deployment Process

#### Pre-Deployment Checklist

1. **Quality Gates**
   ```bash
   npm run quality:pre-push
   npm run security:scan
   npm run test:coverage
   ```

2. **Performance Validation**
   ```bash
   npm run build:production
   npm run performance:budget
   npm run lighthouse
   ```

3. **Security Validation**
   ```bash
   npm audit
   npm run security:scan
   ```

#### Deployment Steps

1. **Staging Deployment**
   - Deploy to staging environment
   - Run full test suite
   - Perform smoke tests
   - Validate performance

2. **Production Deployment**
   - Deploy to production
   - Monitor health checks
   - Validate functionality
   - Monitor performance

3. **Post-Deployment**
   - Verify deployment success
   - Monitor error rates
   - Check performance metrics
   - Review logs

### 10. Team Collaboration

#### Git Workflow

1. **Branch Strategy**
   - `main`: Production-ready code
   - `develop`: Integration branch
   - `feature/*`: Feature development
   - `fix/*`: Bug fixes
   - `docs/*`: Documentation updates

2. **Commit Standards**
   - Use conventional commits
   - Write descriptive messages
   - Keep commits focused
   - Reference issues where applicable

3. **Code Review Process**
   - All changes require review
   - Use pull requests
   - Automated checks must pass
   - Manual review for critical changes

#### Communication

1. **Documentation**
   - Keep README files updated
   - Document new features
   - Maintain changelog
   - Update API documentation

2. **Issue Tracking**
   - Use structured issue templates
   - Provide clear reproduction steps
   - Include relevant context
   - Label appropriately

3. **Knowledge Sharing**
   - Code review discussions
   - Technical design documents
   - Best practice guides
   - Troubleshooting resources

### 11. Continuous Improvement

#### Process Evolution

1. **Regular Reviews**
   - Quality gate effectiveness
   - Performance metrics
   - Team feedback
   - Industry best practices

2. **Tool Updates**
   - Regular dependency updates
   - Security patch application
   - Performance improvements
   - New feature adoption

3. **Training and Development**
   - Team skill development
   - Tool training
   - Best practice sharing
   - External learning

#### Metrics and Monitoring

1. **Quality Metrics**
   - Code coverage trends
   - Bug rates
   - Security vulnerabilities
   - Performance metrics

2. **Process Metrics**
   - Development velocity
   - Review cycle time
   - Deployment frequency
   - Issue resolution time

3. **Team Metrics**
   - Code review participation
   - Documentation contributions
   - Knowledge sharing
   - Skill development

EOF

print_success "Development process documentation generated in docs/development/README.md"

# 4. API Documentation
print_status "Generating API documentation..."
cat > docs/api/README.md << 'EOF'
# API Documentation

This document provides comprehensive API documentation for the Crazy Gary quality gates system.

## Overview

The quality gates system provides a comprehensive set of APIs for managing code quality, security, and development processes.

## Script APIs

### Quality Gates

#### `npm run quality:pre-commit`

Executes pre-commit quality checks.

**Returns**: Exit code 0 for success, 1 for failure

**Checks Performed**:
- TypeScript compilation
- ESLint validation
- Prettier formatting
- Code duplication analysis
- Security scanning
- Test execution (conditional)
- Complexity analysis
- File size validation
- Spell checking

**Example**:
```bash
npm run quality:pre-commit
```

#### `npm run quality:commit-msg`

Validates commit message format.

**Parameters**:
- `$1`: Commit message file path

**Returns**: Exit code 0 for valid message, 1 for invalid

**Example**:
```bash
npm run quality:commit-msg .git/COMMIT_EDITMSG
```

#### `npm run quality:pre-push`

Executes comprehensive pre-push checks.

**Returns**: Exit code 0 for success, 1 for failure

**Checks Performed**:
- Full TypeScript compilation
- Complete ESLint check
- Full test suite with coverage
- Security audit
- Performance analysis
- Documentation generation

**Example**:
```bash
npm run quality:pre-push
```

### Testing APIs

#### `npm test`

Runs unit tests.

**Options**:
- `--watch`: Watch mode
- `--run`: Run once
- `--coverage`: Generate coverage

**Example**:
```bash
npm test -- --coverage
```

#### `npm run test:coverage`

Runs tests with coverage reporting.

**Output**: HTML coverage report in `coverage/`

**Example**:
```bash
npm run test:coverage
```

### Quality APIs

#### `npm run lint`

Runs ESLint validation.

**Options**:
- `--fix`: Auto-fix issues

**Example**:
```bash
npm run lint:fix
```

#### `npm run type-check`

Runs TypeScript type checking.

**Example**:
```bash
npm run type-check
```

#### `npm run format`

Formats code with Prettier.

**Example**:
```bash
npm run format
```

### Security APIs

#### `npm run security:audit`

Runs npm security audit.

**Options**:
- `--audit-level`: Severity level

**Example**:
```bash
npm run security:audit
```

#### `npm run security:scan`

Runs comprehensive security scan.

**Example**:
```bash
npm run security:scan
```

### Documentation APIs

#### `npm run docs:generate`

Generates project documentation.

**Output**: Documentation in `docs/generated/`

**Example**:
```bash
npm run docs:generate
```

### Hook Management APIs

#### `npm run hooks:install`

Installs Git hooks.

**Example**:
```bash
npm run hooks:install
```

#### `npm run hooks:status`

Shows Git hooks status.

**Example**:
```bash
npm run hooks:status
```

#### `npm run hooks:uninstall`

Uninstalls Git hooks.

**Example**:
```bash
npm run hooks:uninstall
```

## Configuration APIs

### Quality Gate Configuration

The system uses `.quality-gates.json` for configuration.

**Structure**:
```json
{
  "performance": {
    "maxHookExecutionTime": 30,
    "maxBundleSize": "10MB",
    "maxFileSize": "50KB"
  },
  "coverage": {
    "minimumLineCoverage": 80,
    "minimumBranchCoverage": 75
  },
  "security": {
    "auditLevel": "moderate",
    "blockOnHighSeverity": true
  }
}
```

### Accessing Configuration

```javascript
// Load configuration
const config = require('./.quality-gates.json');

// Access performance settings
const maxTime = config.performance.maxHookExecutionTime;

// Access coverage settings
const minCoverage = config.coverage.minimumLineCoverage;

// Access security settings
const auditLevel = config.security.auditLevel;
```

## Hook Integration

### Pre-commit Hook

The pre-commit hook is triggered automatically on `git commit`.

**Location**: `.git/hooks/pre-commit`

**Execution Flow**:
1. Load quality gate configuration
2. Get list of staged files
3. Run quality checks in parallel
4. Report results and block on failures
5. Auto-fix formatting issues
6. Exit with appropriate code

**Configuration**: 
```json
{
  "performance": {
    "fastMode": true,
    "parallelJobs": 4
  }
}
```

### Commit Message Hook

The commit message hook validates commit messages.

**Location**: `.git/hooks/commit-msg`

**Validation Rules**:
- Conventional commit format
- Type enumeration
- Subject length limits
- Breaking change detection

### Pre-push Hook

The pre-push hook runs comprehensive checks.

**Location**: `.git/hooks/pre-push`

**Execution Flow**:
1. Full build validation
2. Complete test suite execution
3. Coverage analysis
4. Security audit
5. Performance validation
6. Documentation generation

## Quality Gate Library

### JavaScript/Node.js APIs

#### Running Quality Checks Programmatically

```javascript
const { execSync } = require('child_process');
const fs = require('fs');

// Run pre-commit checks
function runPreCommit() {
  try {
    execSync('npm run quality:pre-commit', { stdio: 'inherit' });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Run security scan
function runSecurityScan() {
  try {
    const result = execSync('npm run security:scan', { encoding: 'utf8' });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get coverage report
function getCoverageReport() {
  try {
    const coveragePath = 'apps/web/coverage/coverage-summary.json';
    if (fs.existsSync(coveragePath)) {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      return {
        success: true,
        coverage: {
          lines: coverage.total.lines.pct,
          branches: coverage.total.branches.pct,
          functions: coverage.total.functions.pct
        }
      };
    }
    return { success: false, error: 'Coverage report not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### Configuration Management

```javascript
const configPath = '.quality-gates.json';

class QualityGateConfig {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load configuration:', error);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      performance: {
        maxHookExecutionTime: 30,
        fastMode: false,
        parallelJobs: 2
      },
      coverage: {
        minimumLineCoverage: 80,
        excludeFromCoverage: []
      },
      security: {
        auditLevel: 'moderate',
        blockOnHighSeverity: true
      }
    };
  }

  getPerformanceConfig() {
    return this.config.performance;
  }

  getCoverageConfig() {
    return this.config.coverage;
  }

  getSecurityConfig() {
    return this.config.security;
  }

  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
  }
}
```

## Error Handling

### Common Error Codes

| Code | Description | Action |
|------|-------------|--------|
| 1 | General failure | Check logs and fix issues |
| 2 | TypeScript error | Fix type errors |
| 3 | ESLint error | Fix linting issues |
| 4 | Test failure | Fix failing tests |
| 5 | Security violation | Address security issues |
| 6 | Coverage failure | Add missing tests |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": 3,
    "message": "ESLint validation failed",
    "details": [
      {
        "file": "src/components/Button.tsx",
        "line": 42,
        "column": 10,
        "rule": "@typescript-eslint/no-explicit-any",
        "message": "Unexpected any value in conditional context"
      }
    ],
    "fix": "Run 'npm run lint:fix' to auto-fix issues"
  }
}
```

## Monitoring and Metrics

### Performance Metrics

```javascript
// Track execution time
function trackExecution(name, fn) {
  const start = Date.now();
  const result = fn();
  const duration = Date.now() - start;
  
  console.log(`${name}: ${duration}ms`);
  return result;
}

// Usage
trackExecution('TypeScript check', () => {
  execSync('npm run type-check');
});
```

### Quality Metrics

```javascript
// Collect quality metrics
function collectQualityMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    coverage: getCoverageMetrics(),
    complexity: getComplexityMetrics(),
    security: getSecurityMetrics(),
    performance: getPerformanceMetrics()
  };
  
  return metrics;
}
```

## Integration Examples

### CI/CD Integration

```yaml
# GitHub Actions
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

### IDE Integration

```json
// VS Code settings
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

## Best Practices

### Performance Optimization

1. **Use Caching**
   ```javascript
   // Enable ESLint caching
   execSync('eslint --cache --cache-location .eslintcache');
   ```

2. **Parallel Execution**
   ```javascript
   // Run checks in parallel
   const checks = [
     () => execSync('npm run type-check'),
     () => execSync('npm run lint'),
     () => execSync('npm run test')
   ];
   
   Promise.all(checks.map(check => {
     return new Promise(resolve => {
       check();
       resolve();
     });
   }));
   ```

3. **Smart Filtering**
   ```javascript
   // Only run relevant checks
   const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
   
   if (stagedFiles.includes('.test.')) {
     execSync('npm test');
   }
   ```

### Error Recovery

1. **Graceful Degradation**
   ```javascript
   function runQualityCheck(name, command, required = true) {
     try {
       execSync(command);
       console.log(`${name}: PASS`);
       return true;
     } catch (error) {
       if (required) {
         throw new Error(`${name}: FAIL - ${error.message}`);
       } else {
         console.warn(`${name}: WARN - ${error.message}`);
         return false;
       }
     }
   }
   ```

2. **Auto-fix Integration**
   ```javascript
   // Try auto-fix first
   try {
     execSync('npm run lint:fix');
   } catch (error) {
     console.error('Auto-fix failed:', error.message);
     throw error;
   }
   ```

This API documentation provides comprehensive information for integrating with and extending the quality gates system.

EOF

print_success "API documentation generated in docs/api/README.md"

print_success "All documentation generated successfully!"
print_status "Documentation locations:"
echo "  - Hooks: docs/hooks/README.md"
echo "  - Quality Gates: docs/quality-gates/README.md"
echo "  - Development Process: docs/development/README.md"
echo "  - API Reference: docs/api/README.md"