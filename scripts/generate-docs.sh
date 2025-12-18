#!/bin/bash

# Crazy Gary Documentation Generation Script
# Automatically generates documentation from code and configuration

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

# Create docs directory if it doesn't exist
mkdir -p docs/generated

print_status "Generating documentation..."

# 1. Generate API documentation from TypeScript
print_status "Generating API documentation..."
if command_exists typedoc 2>/dev/null; then
    if [ -d "apps/web/src" ]; then
        npx typedoc apps/web/src --out docs/generated/api --excludeExternals --excludePrivate --excludeProtected
        print_success "API documentation generated in docs/generated/api"
    fi
else
    print_warning "typedoc not found - skipping API documentation"
fi

# 2. Generate component documentation
print_status "Generating component documentation..."
if [ -d "apps/web/src/components" ]; then
    # Simple component listing
    cat > docs/generated/components.md << 'EOF'
# Component Documentation

This document lists all React components in the project.

EOF
    
    find apps/web/src/components -name "*.tsx" -o -name "*.ts" | while read -r component; do
        component_name=$(basename "$component" | sed 's/\.[^.]*$//')
        component_path="${component#apps/web/src/}"
        echo "## $component_name" >> docs/generated/components.md
        echo "" >> docs/generated/components.md
        echo "**File:** \`$component_path\`" >> docs/generated/components.md
        echo "" >> docs/generated/components.md
        
        # Extract basic info from component file
        if grep -q "export.*$component_name" "$component"; then
            echo "**Export:** $(grep -o "export.*$component_name" "$component" | head -1)" >> docs/generated/components.md
            echo "" >> docs/generated/components.md
        fi
        
        echo "---" >> docs/generated/components.md
        echo "" >> docs/generated/components.md
    done
    
    print_success "Component documentation generated in docs/generated/components.md"
fi

# 3. Generate package documentation
print_status "Generating package documentation..."
if [ -d "packages" ]; then
    cat > docs/generated/packages.md << 'EOF'
# Package Documentation

This document lists all packages in the monorepo.

EOF
    
    for package_dir in packages/*; do
        if [ -d "$package_dir" ]; then
            package_name=$(basename "$package_dir")
            if [ -f "$package_dir/package.json" ]; then
                package_version=$(grep -o '"version":\s*"[^"]*"' "$package_dir/package.json" | sed 's/"version":\s*"//;s/"//' || echo "unknown")
                echo "## $package_name" >> docs/generated/packages.md
                echo "" >> docs/generated/packages.md
                echo "**Version:** $package_version" >> docs/generated/packages.md
                echo "" >> docs/generated/packages.md
                
                # Add package description if available
                if grep -q '"description"' "$package_dir/package.json"; then
                    description=$(grep -o '"description":\s*"[^"]*"' "$package_dir/package.json" | sed 's/"description":\s*"//;s/"//')
                    echo "**Description:** $description" >> docs/generated/packages.md
                    echo "" >> docs/generated/packages.md
                fi
                
                echo "---" >> docs/generated/packages.md
                echo "" >> docs/generated/packages.md
            fi
        fi
    done
    
    print_success "Package documentation generated in docs/generated/packages.md"
fi

# 4. Generate dependency documentation
print_status "Generating dependency documentation..."
if [ -f "apps/web/package.json" ]; then
    cat > docs/generated/dependencies.md << 'EOF'
# Dependency Documentation

This document lists all project dependencies and their purposes.

EOF
    
    echo "## Production Dependencies" >> docs/generated/dependencies.md
    echo "" >> docs/generated/dependencies.md
    
    # Extract production dependencies
    node -e "
        const pkg = require('./apps/web/package.json');
        const deps = pkg.dependencies || {};
        Object.keys(deps).forEach(dep => {
            console.log('- **' + dep + '**: ' + deps[dep]);
        });
    " >> docs/generated/dependencies.md
    
    echo "" >> docs/generated/dependencies.md
    echo "## Development Dependencies" >> docs/generated/dependencies.md
    echo "" >> docs/generated/dependencies.md
    
    # Extract dev dependencies
    node -e "
        const pkg = require('./apps/web/package.json');
        const deps = pkg.devDependencies || {};
        Object.keys(deps).forEach(dep => {
            console.log('- **' + dep + '**: ' + deps[dep]);
        });
    " >> docs/generated/dependencies.md
    
    print_success "Dependency documentation generated in docs/generated/dependencies.md"
fi

# 5. Generate configuration documentation
print_status "Generating configuration documentation..."
cat > docs/generated/configuration.md << 'EOF'
# Configuration Documentation

This document describes all configuration files and their purposes.

EOF

# Document various config files
CONFIG_FILES=(
    "tsconfig.json:TypeScript configuration"
    "vite.config.ts:Vite build configuration"
    "eslint.config.js:ESLint configuration"
    ".prettierrc.json:Prettier configuration"
    "vitest.config.js:Vitest configuration"
    "tailwind.config.js:Tailwind CSS configuration"
    ".cspell.json:Spell checking configuration"
    ".quality-gates.json:Quality gates configuration"
    "commitlint.config.json:Commit message linting configuration"
)

for config_info in "${CONFIG_FILES[@]}"; do
    IFS=':' read -r file desc <<< "$config_info"
    if [ -f "$file" ]; then
        echo "## $file" >> docs/generated/configuration.md
        echo "" >> docs/generated/configuration.md
        echo "**Purpose:** $desc" >> docs/generated/configuration.md
        echo "" >> docs/generated/configuration.md
        echo "\`\`\`json" >> docs/generated/configuration.md
        cat "$file" >> docs/generated/configuration.md
        echo "\`\`\`" >> docs/generated/configuration.md
        echo "" >> docs/generated/configuration.md
        echo "---" >> docs/generated/configuration.md
        echo "" >> docs/generated/configuration.md
    fi
done

print_success "Configuration documentation generated in docs/generated/configuration.md"

# 6. Generate script documentation
print_status "Generating script documentation..."
cat > docs/generated/scripts.md << 'EOF'
# Script Documentation

This document describes all available scripts and their purposes.

EOF

if [ -f "package.json" ]; then
    echo "## Root Package Scripts" >> docs/generated/scripts.md
    echo "" >> docs/generated/scripts.md
    
    node -e "
        const pkg = require('./package.json');
        const scripts = pkg.scripts || {};
        Object.keys(scripts).forEach(script => {
            console.log('### ' + script);
            console.log('');
            console.log('\`\`\`bash');
            console.log('npm run $script');
            console.log('\`\`\`');
            console.log('');
            console.log('**Command:** \`' + scripts[script] + '\`');
            console.log('');
            console.log('---');
            console.log('');
        });
    " >> docs/generated/scripts.md
    
    print_success "Script documentation generated in docs/generated/scripts.md"
fi

# 7. Generate project overview
print_status "Generating project overview..."
cat > docs/generated/project-overview.md << 'EOF'
# Project Overview

This document provides an overview of the Crazy Gary project structure and architecture.

## Project Structure

```
crazy-gary/
├── apps/                    # Application packages
│   ├── web/                # React web application
│   ├── api/                # Python API server
│   └── frontend/           # Frontend utilities
├── packages/               # Shared packages
│   ├── harmony-adapter/    # Harmony protocol adapter
│   ├── mcp-clients/        # MCP client implementations
│   └── performance-monitor/ # Performance monitoring
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
├── tests/                  # Test files
└── tools/                  # Development tools
```

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Vitest** for testing
- **ESLint + Prettier** for code quality

### Backend
- **Python** with Flask/FastAPI
- **Redis** for caching
- **SQLite/PostgreSQL** for data storage

### Development Tools
- **Yarn Workspaces** for monorepo management
- **Git Hooks** for quality gates
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting

### Deployment
- **Railway** for hosting
- **Docker** for containerization
- **GitHub Actions** for CI/CD

EOF

print_success "Project overview generated in docs/generated/project-overview.md"

print_success "Documentation generation completed!"
print_status "Generated files:"
ls -la docs/generated/ 2>/dev/null || echo "No files generated"
print_status "View documentation in docs/generated/"#!/bin/bash

# Crazy Gary Documentation Generation Script
set -e

print_status() {
    echo -e "\033[0;34m[DOCS]\033[0m $1"
}

print_success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

mkdir -p docs/generated

print_status "Generating documentation..."

# Generate component documentation
if [ -d "apps/web/src/components" ]; then
    cat > docs/generated/components.md << 'EOF'
# Component Documentation

This document lists all React components in the project.

EOF
    find apps/web/src/components -name "*.tsx" | while read component; do
        component_name=$(basename "$component" | sed 's/\.[^.]*$//')
        echo "## $component_name" >> docs/generated/components.md
        echo "" >> docs/generated/components.md
        echo "**File:** \`$component\`" >> docs/generated/components.md
        echo "" >> docs/generated/components.md
    done
    print_success "Component documentation generated"
fi

# Generate project overview
cat > docs/generated/project-overview.md << 'EOF'
# Project Overview

Crazy Gary is a modern web application with comprehensive quality gates.

## Structure
- apps/web: React frontend with TypeScript
- apps/api: Python backend
- packages: Shared utilities
- scripts: Build and quality scripts

## Quality Gates
- Pre-commit: TypeScript, ESLint, Prettier, tests
- Commit messages: Conventional commits format
- Pre-push: Full test suite with coverage, security audit
EOF

print_success "Documentation generated in docs/generated/"