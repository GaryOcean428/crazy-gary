#!/bin/bash

# Crazy Gary Git Hooks Uninstallation Script
# Removes pre-commit, commit-msg, and pre-push hooks

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

print_status "Uninstalling Crazy Gary Git Hooks..."

# Check if hooks exist
HOOKS_EXIST=false
if [ -f ".git/hooks/pre-commit" ]; then
    HOOKS_EXIST=true
fi
if [ -f ".git/hooks/commit-msg" ]; then
    HOOKS_EXIST=true
fi
if [ -f ".git/hooks/pre-push" ]; then
    HOOKS_EXIST=true
fi

if [ "$HOOKS_EXIST" = false ]; then
    print_warning "No Crazy Gary hooks found to uninstall."
    exit 0
fi

# Remove pre-commit hook
if [ -f ".git/hooks/pre-commit" ]; then
    print_status "Removing pre-commit hook..."
    rm -f .git/hooks/pre-commit
    print_success "Pre-commit hook removed"
fi

# Remove commit-msg hook
if [ -f ".git/hooks/commit-msg" ]; then
    print_status "Removing commit-msg hook..."
    rm -f .git/hooks/commit-msg
    print_success "Commit-msg hook removed"
fi

# Remove pre-push hook
if [ -f ".git/hooks/pre-push" ]; then
    print_status "Removing pre-push hook..."
    rm -f .git/hooks/pre-push
    print_success "Pre-push hook removed"
fi

# Verify removal
print_status "Verifying removal..."
HOOKS_REMAINING=false

if [ -f ".git/hooks/pre-commit" ]; then
    print_error "Pre-commit hook still exists"
    HOOKS_REMAINING=true
fi

if [ -f ".git/hooks/commit-msg" ]; then
    print_error "Commit-msg hook still exists"
    HOOKS_REMAINING=true
fi

if [ -f ".git/hooks/pre-push" ]; then
    print_error "Pre-push hook still exists"
    HOOKS_REMAINING=true
fi

if [ "$HOOKS_REMAINING" = false ]; then
    print_success "All hooks removed successfully!"
    print_status "Quality gates will no longer run automatically"
    print_status "You can still run quality checks manually using:"
    print_status "  npm run quality:pre-commit"
    print_status "  npm run quality:pre-push"
else
    print_error "Some hooks could not be removed. Please check permissions and try again."
    exit 1
fi

print_status "Uninstallation complete!"