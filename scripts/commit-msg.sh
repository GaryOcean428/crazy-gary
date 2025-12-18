#!/bin/bash

# Crazy Gary Commit Message Validation
# This script validates commit messages against conventional commits format

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the commit message from the file provided as argument
COMMIT_MSG_FILE="$1"

# Read the commit message
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Function to print colored output
print_error() {
    echo -e "${RED}[COMMIT ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[COMMIT OK]${NC} $1"
}

# Skip merge commits and commit message fixes
if [[ "$COMMIT_MSG" =~ ^Merge ]] || [[ "$COMMIT_MSG" =~ ^"fixup!" ]] || [[ "$COMMIT_MSG" =~ ^squash! ]]; then
    print_success "Merge or fixup commit - skipping validation"
    exit 0
fi

# Conventional commit pattern
# Format: type(scope): subject
# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, security, deps
PATTERN="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security|deps)(\(.+\))?: .{1,50}"

if [[ ! "$COMMIT_MSG" =~ $PATTERN ]]; then
    print_error "Commit message does not follow conventional commit format!"
    echo ""
    echo "Expected format: <type>(<scope>): <subject>"
    echo ""
    echo "Valid types:"
    echo "  feat:     A new feature"
    echo "  fix:      A bug fix"
    echo "  docs:     Documentation only changes"
    echo "  style:    Changes that do not affect the meaning of the code"
    echo "  refactor: A code change that neither fixes a bug nor adds a feature"
    echo "  perf:     A code change that improves performance"
    echo "  test:     Adding missing tests or correcting existing tests"
    echo "  build:    Changes that affect the build system or external dependencies"
    echo "  ci:       Changes to CI configuration files and scripts"
    echo "  chore:    Other changes that don't modify src or test files"
    echo "  revert:   Reverts a previous commit"
    echo "  security: Security improvements"
    echo "  deps:     Dependency updates"
    echo ""
    echo "Examples:"
    echo "  feat(auth): add user authentication"
    echo "  fix(api): resolve memory leak in endpoint"
    echo "  docs(readme): update installation instructions"
    echo ""
    echo "Current commit message:"
    echo "$COMMIT_MSG"
    echo ""
    echo "Please fix your commit message and try again."
    exit 1
fi

# Check commit message length (subject should be <= 50 chars)
SUBJECT=$(echo "$COMMIT_MSG" | sed -E 's/^(.+?): (.+)$/\2/')
if [ ${#SUBJECT} -gt 50 ]; then
    print_error "Commit subject is too long (${#SUBJECT} chars). Maximum is 50 characters."
    echo "Subject: $SUBJECT"
    exit 1
fi

print_success "Commit message validation passed!"
exit 0