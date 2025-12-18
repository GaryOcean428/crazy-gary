#!/bin/bash

# Crazy Gary Quality Gates Status and Summary
# Comprehensive overview of the enhanced quality gates system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  🚀 Crazy Gary Quality Gates System${NC}"
echo -e "${BLUE}  Enhanced Pre-commit Hooks with Quality Gates${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# System Overview
echo -e "${CYAN}📋 System Overview${NC}"
echo "━" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Enhanced Pre-commit Hooks${NC}      < 30 seconds"
echo -e "${GREEN}✅ Commit Message Validation${NC}       < 1 second"
echo -e "${GREEN}✅ Comprehensive Pre-push Hooks${NC}    2-5 minutes"
echo -e "${GREEN}✅ Security Scanning${NC}               Comprehensive"
echo -e "${GREEN}✅ Documentation Generation${NC}        Automated"
echo ""

# Quality Gates Features
echo -e "${CYAN}🛡️  Quality Gates Features${NC}"
echo "━" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Pre-commit features
echo -e "${YELLOW}🔧 Pre-commit Checks (< 30s)${NC}"
echo "  • TypeScript compilation and type checking"
echo "  • ESLint code quality checks with auto-fix"
echo "  • Prettier formatting consistency"
echo "  • Code duplication analysis (jscpd)"
echo "  • Security pattern scanning"
echo "  • Conditional test execution"
echo "  • Complexity analysis"
echo "  • File size validation"
echo "  • Spell checking (cspell)"
echo "  • Bundle size analysis"
echo "  • Progress tracking and performance monitoring"
echo ""

# Commit message features
echo -e "${YELLOW}📝 Commit Message Validation${NC}"
echo "  • Conventional commits format enforcement"
echo "  • Type validation (feat, fix, docs, etc.)"
echo "  • Subject length limits (50 chars)"
echo "  • Breaking change detection"
echo "  • Interactive help and examples"
echo ""

# Pre-push features
echo -e "${YELLOW}🚀 Pre-push Comprehensive Testing (2-5min)${NC}"
echo "  • Full TypeScript compilation"
echo "  • Complete ESLint validation"
echo "  • Full test suite with coverage"
echo "  • Coverage threshold enforcement"
echo "  • Security audit (npm audit)"
echo "  • Performance analysis"
echo "  • Bundle size validation"
echo "  • Documentation generation"
echo "  • Dead code detection"
echo ""

# Security features
echo -e "${YELLOW}🔒 Security Scanning${NC}"
echo "  • Hardcoded secrets detection"
echo "  • SQL injection pattern detection"
echo "  • XSS vulnerability scanning"
echo "  • Command injection detection"
echo "  • Insecure HTTP usage check"
echo "  • Security headers validation"
echo "  • Dependency vulnerability scanning"
echo "  • CORS configuration analysis"
echo "  • Rate limiting detection"
echo ""

# Documentation features
echo -e "${YELLOW}📚 Documentation Generation${NC}"
echo "  • API documentation from TypeScript"
echo "  • Component documentation"
echo "  • Package documentation"
echo "  • Dependency documentation"
echo "  • Configuration documentation"
echo "  • Script documentation"
echo "  • Project overview generation"
echo ""

# Available Scripts
echo -e "${CYAN}🎯 Available Scripts${NC}"
echo "━" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${MAGENTA}Quality Gates:${NC}"
echo "  npm run quality:pre-commit         # Run pre-commit checks"
echo "  npm run quality:pre-commit:enhanced # Enhanced pre-commit (faster)"
echo "  npm run quality:pre-push           # Run pre-push checks"
echo "  npm run quality:full               # Run all quality checks"
echo "  npm run quality:fast               # Fast quality check"
echo "  npm run quality:validate           # Validate setup"
echo "  npm run quality:benchmark          # Performance benchmarks"
echo ""

echo -e "${MAGENTA}Security:${NC}"
echo "  npm run security:scan              # Basic security scan"
echo "  npm run security:scan:enhanced     # Enhanced security scan"
echo "  npm run security:report            # Generate security report"
echo ""

echo -e "${MAGENTA}Documentation:${NC}"
echo "  npm run docs:generate              # Generate documentation"
echo "  npm run docs:generate:enhanced     # Enhanced documentation"
echo "  npm run docs:report                # Generate quality report"
echo ""

echo -e "${MAGENTA}Hook Management:${NC}"
echo "  npm run hooks:install              # Install basic hooks"
echo "  npm run hooks:install:enhanced     # Install enhanced hooks"
echo "  npm run hooks:status               # Check hook status"
echo "  npm run hooks:manager              # Quality gate manager"
echo ""

echo -e "${MAGENTA}Quality Gate Manager:${NC}"
echo "  npm run quality:manager            # Main quality gate manager"
echo "  npm run quality:update             # Update dependencies"
echo ""

# Configuration
echo -e "${CYAN}⚙️  Configuration${NC}"
echo "━" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".quality-gates.json" ]; then
    echo -e "${GREEN}✅ Quality Gates Configuration${NC}"
    echo "  File: .quality-gates.json"
    
    # Extract some key settings
    if command -v node >/dev/null 2>&1; then
        MAX_TIME=$(node -e "try { console.log(require('./.quality-gates.json').performance.maxHookExecutionTime + 's') } catch(e) { console.log('N/A') }" 2>/dev/null || echo "N/A")
        MIN_COVERAGE=$(node -e "try { console.log(require('./.quality-gates.json').coverage.minimumLineCoverage + '%') } catch(e) { console.log('N/A') }" 2>/dev/null || echo "N/A")
        AUDIT_LEVEL=$(node -e "try { console.log(require('./.quality-gates.json').security.auditLevel) } catch(e) { console.log('N/A') }" 2>/dev/null || echo "N/A")
        
        echo "  Max hook execution time: $MAX_TIME"
        echo "  Minimum coverage: $MIN_COVERAGE"
        echo "  Security audit level: $AUDIT_LEVEL"
    fi
else
    echo -e "${RED}❌ Quality Gates Configuration${NC}"
    echo "  File: .quality-gates.json (missing)"
fi

if [ -f ".lintstagedrc.json" ]; then
    echo -e "${GREEN}✅ Lint-staged Configuration${NC}"
    echo "  File: .lintstagedrc.json"
else
    echo -e "${RED}❌ Lint-staged Configuration${NC}"
    echo "  File: .lintstagedrc.json (missing)"
fi

if [ -f ".eslintrc.json" ]; then
    echo -e "${GREEN}✅ ESLint Configuration${NC}"
    echo "  File: .eslintrc.json"
else
    echo -e "${RED}❌ ESLint Configuration${NC}"
    echo "  File: .eslintrc.json (missing)"
fi

echo ""

# Installation Status
echo -e "${CYAN}📦 Installation Status${NC}"
echo "━" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Git hooks
if [ -f ".git/hooks/pre-commit" ]; then
    echo -e "${GREEN}✅ Pre-commit hook${NC}        installed"
else
    echo -e "${RED}❌ Pre-commit hook${NC}        not installed"
fi

if [ -f ".git/hooks/commit-msg" ]; then
    echo -e "${GREEN}✅ Commit-msg hook${NC}        installed"
else
    echo -e "${RED}❌ Commit-msg hook${NC}        not installed"
fi

if [ -f ".git/hooks/pre-push" ]; then
    echo -e "${GREEN}✅ Pre-push hook${NC}          installed"
else
    echo -e "${RED}❌ Pre-push hook${NC}          not installed"
fi

# Check dependencies
echo ""
echo -e "${CYAN}📚 Dependencies${NC}"
echo "━" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm list husky >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Husky${NC}                    $(npm list husky --depth=0 2>/dev/null | grep husky | head -1 | cut -d@ -f2)"
else
    echo -e "${RED}❌ Husky${NC}                    not installed"
fi

if npm list lint-staged >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Lint-staged${NC}             $(npm list lint-staged --depth=0 2>/dev/null | grep lint-staged | head -1 | cut -d@ -f2)"
else
    echo -e "${RED}❌ Lint-staged${NC}             not installed"
fi

if npm list eslint >/dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint${NC}                  $(npm list eslint --depth=0 2>/dev/null | grep eslint | head -1 | cut -d@ -f2)"
else
    echo -e "${RED}❌ ESLint${NC}                  not installed"
fi

if npm list prettier >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Prettier${NC}                $(npm list prettier --depth=0 2>/dev/null | grep prettier | head -1 | cut -d@ -f2)"
else
    echo -e "${RED}❌ Prettier${NC}                not installed"
fi

if npm list typescript >/dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript${NC}              $(npm list typescript --depth=0 2>/dev/null | grep typescript | head -1 | cut -d@ -f2)"
else
    echo -e "${RED}❌ TypeScript${NC}              not installed"
fi

if npm list jscpd >/dev/null 2>&1; then
    echo -e "${GREEN}✅ jscpd${NC}                   $(npm list jscpd --depth=0 2>/dev/null | grep jscpd | head -1 | cut -d@ -f2)"
else
    echo -e "${RED}❌ jscpd${NC}                   not installed"
fi

if npm list cspell >/dev/null 2>&1; then
    echo -e "${GREEN}✅ cspell${NC}                  $(npm list cspell --depth=0 2>/dev/null | grep cspell | head -1 | cut -d@ -f2)"
else
    echo -e "${RED}❌ cspell${NC}                  not installed"
fi

# Performance Stats
echo ""
echo -e "${CYAN}📊 Performance Stats${NC}"
echo "━" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d ".git" ]; then
    TOTAL_COMMITS=$(git rev-list --all --count 2>/dev/null || echo "0")
    echo "Total commits: $TOTAL_COMMITS"
    
    if [ -f ".git/hooks/pre-commit" ]; then
        HOOK_DATE=$(stat -c %y .git/hooks/pre-commit 2>/dev/null | cut -d' ' -f1 || echo "unknown")
        echo "Hooks active since: $HOOK_DATE"
    fi
fi

# Quick Actions
echo ""
echo -e "${CYAN}🚀 Quick Actions${NC}"
echo "━" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${YELLOW}Installation:${NC}"
echo "  npm run hooks:install:enhanced     # Install enhanced quality gates"
echo ""

echo -e "${YELLOW}Testing:${NC}"
echo "  npm run quality:fast               # Quick quality check"
echo "  npm run quality:pre-commit         # Full pre-commit check"
echo "  npm run quality:pre-push           # Full pre-push check"
echo ""

echo -e "${YELLOW}Management:${NC}"
echo "  npm run quality:manager            # Open quality gate manager"
echo "  npm run quality:benchmark          # Run performance benchmarks"
echo "  npm run quality:validate           # Validate installation"
echo ""

echo -e "${YELLOW}Documentation:${NC}"
echo "  npm run docs:generate:enhanced     # Generate comprehensive docs"
echo "  cat PRE_COMMIT_HOOKS_SETUP.md      # Read setup guide"
echo ""

echo -e "${YELLOW}Troubleshooting:${NC}"
echo "  bash scripts/quality-gate-manager.sh validate  # Diagnose issues"
echo "  npm run hooks:status               # Check hook status"
echo ""

# Footer
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🎯 Enhanced Quality Gates Ready!${NC}"
echo -e "${BLUE}📚 Read PRE_COMMIT_HOOKS_SETUP.md for detailed guide${NC}"
echo -e "${BLUE}🔧 Use npm run quality:manager for management${NC}"
echo -e "${BLUE}================================================${NC}"