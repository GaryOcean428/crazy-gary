#!/bin/bash

# Crazy Gary Git Hooks Installation Script
# Installs pre-commit, commit-msg, and pre-push hooks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[HOOKS]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run this script from the project root."
    exit 1
fi

print_status "Installing Crazy Gary Git Hooks..."

# Ensure hooks directory exists
mkdir -p .git/hooks

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || print_warning "Could not make scripts executable (permission issue)"

# Install pre-commit hook
print_status "Installing pre-commit hook..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Crazy Gary Pre-commit Hook with Quality Gates
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Source the pre-commit script
if [ -f "$PROJECT_ROOT/scripts/pre-commit.sh" ]; then
    bash "$PROJECT_ROOT/scripts/pre-commit.sh"
else
    echo "[ERROR] Pre-commit script not found at $PROJECT_ROOT/scripts/pre-commit.sh"
    exit 1
fi
EOF

print_success "Pre-commit hook installed"

# Install commit-msg hook
print_status "Installing commit-msg hook..."
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# Crazy Gary Commit Message Validation Hook
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Source the commit message validation script
if [ -f "$PROJECT_ROOT/scripts/commit-msg.sh" ]; then
    bash "$PROJECT_ROOT/scripts/commit-msg.sh" "$1"
else
    echo "[ERROR] Commit message validation script not found at $PROJECT_ROOT/scripts/commit-msg.sh"
    exit 1
fi
EOF

print_success "Commit-msg hook installed"

# Install pre-push hook
print_status "Installing pre-push hook..."
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# Crazy Gary Pre-push Hook with Comprehensive Testing
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Source the pre-push script
if [ -f "$PROJECT_ROOT/scripts/pre-push.sh" ]; then
    bash "$PROJECT_ROOT/scripts/pre-push.sh"
else
    echo "[ERROR] Pre-push script not found at $PROJECT_ROOT/scripts/pre-push.sh"
    exit 1
fi
EOF

print_success "Pre-push hook installed"

# Make hooks executable
chmod +x .git/hooks/pre-commit 2>/dev/null || print_warning "Could not make pre-commit hook executable"
chmod +x .git/hooks/commit-msg 2>/dev/null || print_warning "Could not make commit-msg hook executable"
chmod +x .git/hooks/pre-push 2>/dev/null || print_warning "Could not make pre-push hook executable"

# Verify installation
print_status "Verifying installation..."
HOOKS_INSTALLED=true

if [ -f ".git/hooks/pre-commit" ]; then
    print_success "Pre-commit hook: ✓"
else
    print_error "Pre-commit hook: ✗"
    HOOKS_INSTALLED=false
fi

if [ -f ".git/hooks/commit-msg" ]; then
    print_success "Commit-msg hook: ✓"
else
    print_error "Commit-msg hook: ✗"
    HOOKS_INSTALLED=false
fi

if [ -f ".git/hooks/pre-push" ]; then
    print_success "Pre-push hook: ✓"
else
    print_error "Pre-push hook: ✗"
    HOOKS_INSTALLED=false
fi

if [ "$HOOKS_INSTALLED" = true ]; then
    print_success "All hooks installed successfully!"
    print_status "Hooks will run automatically on git commit and git push"
    print_status "Manual execution: npm run quality:pre-commit, npm run quality:pre-push"
else
    print_error "Some hooks failed to install. Please check permissions and try again."
    exit 1
fi

print_status "Installation complete!"