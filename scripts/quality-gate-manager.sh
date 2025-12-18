#!/bin/bash

# Crazy Gary Quality Gate Management Script
# Comprehensive management of quality gates, hooks, and configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_NAME="Quality Gate Manager"
VERSION="1.0.0"

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  $SCRIPT_NAME v$VERSION${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

print_debug() {
    echo -e "${MAGENTA}[DEBUG]${NC} $1"
}

# Command functions
show_help() {
    print_header
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  install              Install all quality gates and hooks"
    echo "  uninstall            Remove all quality gates and hooks"
    echo "  status               Show installation status"
    echo "  run [type]           Run quality gates manually"
    echo "  config [action]      Manage configuration"
    echo "  report [type]        Generate quality reports"
    echo "  validate             Validate quality gate setup"
    echo "  update               Update quality gate dependencies"
    echo "  benchmark            Run performance benchmarks"
    echo "  debug                Enable debug mode"
    echo "  help                 Show this help message"
    echo ""
    echo "Types:"
    echo "  pre-commit          Run pre-commit checks"
    echo "  pre-push            Run pre-push checks"
    echo "  commit-msg          Validate commit message"
    echo "  security            Run security scan"
    echo "  full                Run all quality checks"
    echo ""
    echo "Config Actions:"
    echo "  show                Show current configuration"
    echo "  reset               Reset to defaults"
    echo "  backup              Backup current configuration"
    echo "  restore [file]      Restore configuration from file"
    echo ""
    echo "Report Types:"
    echo "  quality             Generate quality metrics report"
    echo "  security            Generate security report"
    echo "  coverage            Generate coverage report"
    echo "  performance         Generate performance report"
    echo ""
    echo "Examples:"
    echo "  $0 install"
    echo "  $0 run pre-commit"
    echo "  $0 config show"
    echo "  $0 report quality"
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    # Check for required commands
    local required_commands=("git" "node" "npm" "bash")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing_deps+=("$cmd")
        fi
    done
    
    # Check for npm packages
    local required_packages=("eslint" "prettier" "typescript")
    for package in "${required_packages[@]}"; do
        if ! npm list "$package" >/dev/null 2>&1; then
            missing_deps+=("$package")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install missing dependencies and try again"
        return 1
    fi
    
    return 0
}

# Install quality gates and hooks
install_quality_gates() {
    print_status "Installing quality gates and hooks..."
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please run from project root."
        return 1
    fi
    
    # Install dependencies
    print_status "Installing npm dependencies..."
    if npm install --silent; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        return 1
    fi
    
    # Create necessary directories
    print_status "Creating directories..."
    mkdir -p .git/hooks
    mkdir -p docs/generated
    mkdir -p reports
    
    # Make scripts executable
    print_status "Making scripts executable..."
    chmod +x scripts/*.sh 2>/dev/null || true
    
    # Install Husky (if not already installed)
    print_status "Setting up Husky..."
    if [ ! -d ".husky" ]; then
        npx husky install 2>/dev/null || print_warning "Husky already installed or failed to install"
    fi
    
    # Install Git hooks
    print_status "Installing Git hooks..."
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Crazy Gary Pre-commit Hook
set -e

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Run pre-commit checks
if [ -f "scripts/pre-commit.sh" ]; then
    bash "scripts/pre-commit.sh"
else
    echo "[ERROR] Pre-commit script not found"
    exit 1
fi
EOF
    
    # Commit message hook
    cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
# Crazy Gary Commit Message Hook
set -e

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Run commit message validation
if [ -f "scripts/commit-msg.sh" ]; then
    bash "scripts/commit-msg.sh" "$1"
else
    echo "[ERROR] Commit message validation script not found"
    exit 1
fi
EOF
    
    # Pre-push hook
    cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
# Crazy Gary Pre-push Hook
set -e

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Run pre-push checks
if [ -f "scripts/pre-push.sh" ]; then
    bash "scripts/pre-push.sh"
else
    echo "[ERROR] Pre-push script not found"
    exit 1
fi
EOF
    
    # Make hooks executable
    chmod +x .git/hooks/pre-commit
    chmod +x .git/hooks/commit-msg
    chmod +x .git/hooks/pre-push
    
    # Install lint-staged configuration
    if [ -f ".lintstagedrc.json" ]; then
        print_status "Installing lint-staged..."
        npx husky add .husky/pre-commit "npx lint-staged"
    fi
    
    # Generate initial documentation
    print_status "Generating documentation..."
    if [ -f "scripts/generate-docs.sh" ]; then
        bash "scripts/generate-docs.sh"
    fi
    
    # Validate installation
    print_status "Validating installation..."
    if validate_installation; then
        print_success "Quality gates installed successfully!"
        print_status "Hooks will run automatically on git commit and push"
    else
        print_error "Installation validation failed"
        return 1
    fi
}

# Uninstall quality gates and hooks
uninstall_quality_gates() {
    print_status "Uninstalling quality gates and hooks..."
    
    # Remove Git hooks
    if [ -d ".git/hooks" ]; then
        rm -f .git/hooks/pre-commit
        rm -f .git/hooks/commit-msg
        rm -f .git/hooks/pre-push
        print_success "Git hooks removed"
    fi
    
    # Remove Husky configuration
    if [ -d ".husky" ]; then
        rm -rf .husky
        print_success "Husky configuration removed"
    fi
    
    # Remove cache files
    rm -rf .eslintcache
    rm -rf node_modules/.vite
    rm -f jscpd-report.json
    
    print_success "Quality gates uninstalled successfully"
}

# Show installation status
show_status() {
    print_status "Quality Gate Installation Status"
    echo ""
    
    # Check Git hooks
    print_status "Git Hooks:"
    if [ -f ".git/hooks/pre-commit" ]; then
        print_success "  pre-commit: installed"
    else
        print_error "  pre-commit: not installed"
    fi
    
    if [ -f ".git/hooks/commit-msg" ]; then
        print_success "  commit-msg: installed"
    else
        print_error "  commit-msg: not installed"
    fi
    
    if [ -f ".git/hooks/pre-push" ]; then
        print_success "  pre-push: installed"
    else
        print_error "  pre-push: not installed"
    fi
    
    echo ""
    
    # Check configuration files
    print_status "Configuration Files:"
    if [ -f ".quality-gates.json" ]; then
        print_success "  .quality-gates.json: present"
    else
        print_warning "  .quality-gates.json: missing"
    fi
    
    if [ -f ".lintstagedrc.json" ]; then
        print_success "  .lintstagedrc.json: present"
    else
        print_warning "  .lintstagedrc.json: missing"
    fi
    
    if [ -f ".eslintrc.json" ]; then
        print_success "  .eslintrc.json: present"
    else
        print_warning "  .eslintrc.json: missing"
    fi
    
    if [ -f ".prettierrc.json" ]; then
        print_success "  .prettierrc.json: present"
    else
        print_warning "  .prettierrc.json: missing"
    fi
    
    echo ""
    
    # Check dependencies
    print_status "Dependencies:"
    local deps=("eslint" "prettier" "typescript" "husky" "lint-staged")
    for dep in "${deps[@]}"; do
        if npm list "$dep" >/dev/null 2>&1; then
            print_success "  $dep: installed"
        else
            print_error "  $dep: not installed"
        fi
    done
    
    echo ""
    
    # Show hook execution count
    if [ -f ".git/hooks/pre-commit" ]; then
        local commit_count=$(git rev-list --all --count 2>/dev/null || echo "0")
        print_status "Repository Statistics:"
        print_status "  Total commits: $commit_count"
        print_status "  Hooks active since: $(stat -c %y .git/hooks/pre-commit 2>/dev/null | cut -d' ' -f1 || echo 'unknown')"
    fi
}

# Run quality gates manually
run_quality_gates() {
    local type="${1:-pre-commit}"
    
    case "$type" in
        "pre-commit")
            print_status "Running pre-commit quality gates..."
            if [ -f "scripts/pre-commit.sh" ]; then
                bash "scripts/pre-commit.sh"
            else
                print_error "Pre-commit script not found"
                return 1
            fi
            ;;
        "pre-push")
            print_status "Running pre-push quality gates..."
            if [ -f "scripts/pre-push.sh" ]; then
                bash "scripts/pre-push.sh"
            else
                print_error "Pre-push script not found"
                return 1
            fi
            ;;
        "commit-msg")
            print_status "Validating commit message..."
            if [ -f "scripts/commit-msg.sh" ]; then
                bash "scripts/commit-msg.sh" "$2"
            else
                print_error "Commit message script not found"
                return 1
            fi
            ;;
        "security")
            print_status "Running security scan..."
            if [ -f "scripts/security-scan.sh" ]; then
                bash "scripts/security-scan.sh"
            else
                print_error "Security scan script not found"
                return 1
            fi
            ;;
        "full")
            print_status "Running all quality gates..."
            run_quality_gates "pre-commit" || return 1
            run_quality_gates "security" || return 1
            run_quality_gates "pre-push" || return 1
            ;;
        *)
            print_error "Unknown quality gate type: $type"
            return 1
            ;;
    esac
    
    print_success "Quality gates completed successfully"
}

# Configuration management
manage_config() {
    local action="$1"
    
    case "$action" in
        "show")
            print_status "Current Quality Gate Configuration"
            if [ -f ".quality-gates.json" ]; then
                cat ".quality-gates.json"
            else
                print_warning "Configuration file not found"
            fi
            ;;
        "reset")
            print_status "Resetting configuration to defaults..."
            if [ -f ".quality-gates.json.bak" ]; then
                cp ".quality-gates.json.bak" ".quality-gates.json"
                print_success "Configuration restored from backup"
            else
                print_warning "No backup found, using default configuration"
                # Create default configuration
                cat > ".quality-gates.json" << 'EOF'
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
EOF
            fi
            ;;
        "backup")
            print_status "Backing up configuration..."
            if [ -f ".quality-gates.json" ]; then
                cp ".quality-gates.json" ".quality-gates.json.bak"
                print_success "Configuration backed up to .quality-gates.json.bak"
            else
                print_error "No configuration file to backup"
            fi
            ;;
        "restore")
            local file="$2"
            if [ -f "$file" ]; then
                cp "$file" ".quality-gates.json"
                print_success "Configuration restored from $file"
            else
                print_error "Backup file not found: $file"
            fi
            ;;
        *)
            print_error "Unknown config action: $action"
            return 1
            ;;
    esac
}

# Generate quality reports
generate_report() {
    local type="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    case "$type" in
        "quality")
            print_status "Generating quality metrics report..."
            local report_file="reports/quality_report_${timestamp}.json"
            
            # Collect quality metrics
            local metrics=$(cat << 'EOF'
{
  "timestamp": "$(date -Iseconds)",
  "coverage": {},
  "complexity": {},
  "duplication": {},
  "performance": {}
}
EOF
)
            
            # Add coverage data
            if [ -f "apps/web/coverage/coverage-summary.json" ]; then
                local coverage=$(cat apps/web/coverage/coverage-summary.json)
                metrics=$(echo "$metrics" | jq ".coverage = $coverage")
            fi
            
            # Add complexity data
            if command -v eslint >/dev/null 2>&1; then
                local complexity=$(eslint . --format json 2>/dev/null | jq '[.[] | .messages[] | select(.ruleId == "complex")] | length' || echo "0")
                metrics=$(echo "$metrics" | jq ".complexity = { \"complexity_issues\": $complexity }")
            fi
            
            # Add duplication data
            if command -v jscpd >/dev/null 2>&1; then
                local duplication=$(jscpd --reporters json --output "reports/jscpd_${timestamp}.json" 2>/dev/null || echo "{}")
                metrics=$(echo "$metrics" | jq ".duplication = $duplication")
            fi
            
            echo "$metrics" > "$report_file"
            print_success "Quality report generated: $report_file"
            ;;
        "security")
            print_status "Generating security report..."
            local report_file="reports/security_report_${timestamp}.json"
            
            # Run security scan and capture output
            if [ -f "scripts/security-scan.sh" ]; then
                bash "scripts/security-scan.sh" > "reports/security_scan_${timestamp}.log" 2>&1 || true
                print_success "Security report generated: $report_file"
            else
                print_error "Security scan script not found"
            fi
            ;;
        "coverage")
            print_status "Generating coverage report..."
            if [ -f "apps/web/package.json" ]; then
                cd apps/web
                npm run test:coverage > /dev/null 2>&1
                cd ../..
                print_success "Coverage report generated in apps/web/coverage/"
            else
                print_error "Web app not found"
            fi
            ;;
        "performance")
            print_status "Generating performance report..."
            local report_file="reports/performance_report_${timestamp}.json"
            
            # Run performance benchmarks
            local perf_data=$(cat << EOF
{
  "timestamp": "$(date -Iseconds)",
  "hook_execution_times": {},
  "bundle_sizes": {},
  "test_execution_times": {}
}
EOF
)
            
            # Measure bundle size
            if [ -d "apps/web/dist" ]; then
                local bundle_size=$(du -sh apps/web/dist | cut -f1)
                perf_data=$(echo "$perf_data" | jq ".bundle_sizes.web_app = \"$bundle_size\"")
            fi
            
            echo "$perf_data" > "$report_file"
            print_success "Performance report generated: $report_file"
            ;;
        *)
            print_error "Unknown report type: $type"
            return 1
            ;;
    esac
}

# Validate installation
validate_installation() {
    local errors=0
    
    # Check Git repository
    if [ ! -d ".git" ]; then
        print_error "Not in a Git repository"
        ((errors++))
    fi
    
    # Check required files
    local required_files=(".quality-gates.json" ".lintstagedrc.json" "scripts/pre-commit.sh")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            ((errors++))
        fi
    done
    
    # Check Git hooks
    local required_hooks=("pre-commit" "commit-msg" "pre-push")
    for hook in "${required_hooks[@]}"; do
        if [ ! -f ".git/hooks/$hook" ]; then
            print_error "Git hook missing: $hook"
            ((errors++))
        fi
    done
    
    # Check dependencies
    if ! check_dependencies; then
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "Installation validation passed"
        return 0
    else
        print_error "Installation validation failed with $errors errors"
        return 1
    fi
}

# Update quality gate dependencies
update_dependencies() {
    print_status "Updating quality gate dependencies..."
    
    # Update npm packages
    print_status "Updating npm packages..."
    npm update
    
    # Update Husky
    print_status "Updating Husky..."
    npm update husky
    
    # Update lint-staged
    print_status "Updating lint-staged..."
    npm update lint-staged
    
    # Clean cache
    print_status "Cleaning cache..."
    rm -rf .eslintcache
    rm -rf node_modules/.vite
    
    print_success "Dependencies updated successfully"
}

# Run performance benchmarks
run_benchmarks() {
    print_status "Running performance benchmarks..."
    
    # Benchmark pre-commit execution
    print_status "Benchmarking pre-commit execution..."
    local start_time=$(date +%s.%N)
    if [ -f "scripts/pre-commit.sh" ]; then
        bash "scripts/pre-commit.sh" > /dev/null 2>&1
    fi
    local end_time=$(date +%s.%N)
    local pre_commit_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "N/A")
    
    # Benchmark type checking
    print_status "Benchmarking TypeScript compilation..."
    local start_time=$(date +%s.%N)
    if [ -f "apps/web/package.json" ]; then
        cd apps/web
        npm run type-check > /dev/null 2>&1
        cd ../..
    fi
    local end_time=$(date +%s.%N)
    local type_check_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "N/A")
    
    # Benchmark linting
    print_status "Benchmarking ESLint execution..."
    local start_time=$(date +%s.%N)
    if command -v eslint >/dev/null 2>&1; then
        eslint . --max-warnings 0 > /dev/null 2>&1
    fi
    local end_time=$(date +%s.%N)
    local lint_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "N/A")
    
    # Display results
    print_success "Benchmark Results:"
    echo "  Pre-commit execution: ${pre_commit_time}s"
    echo "  TypeScript compilation: ${type_check_time}s"
    echo "  ESLint execution: ${lint_time}s"
    
    # Performance recommendations
    print_status "Performance Recommendations:"
    if (( $(echo "$pre_commit_time > 30" | bc -l 2>/dev/null || echo 0) )); then
        print_warning "Pre-commit execution is slow (>30s). Consider enabling fast mode."
    fi
    
    if (( $(echo "$type_check_time > 10" | bc -l 2>/dev/null || echo 0) )); then
        print_warning "TypeScript compilation is slow (>10s). Consider using incremental compilation."
    fi
    
    if (( $(echo "$lint_time > 5" | bc -l 2>/dev/null || echo 0) )); then
        print_warning "ESLint execution is slow (>5s). Consider enabling caching."
    fi
}

# Main script logic
main() {
    local command="$1"
    shift || true
    
    case "$command" in
        "install")
            install_quality_gates
            ;;
        "uninstall")
            uninstall_quality_gates
            ;;
        "status")
            show_status
            ;;
        "run")
            run_quality_gates "$@"
            ;;
        "config")
            manage_config "$@"
            ;;
        "report")
            generate_report "$@"
            ;;
        "validate")
            validate_installation
            ;;
        "update")
            update_dependencies
            ;;
        "benchmark")
            run_benchmarks
            ;;
        "debug")
            set -x
            print_status "Debug mode enabled"
            if [ $# -gt 0 ]; then
                "$@"
            fi
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            print_status "No command specified. Showing help:"
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"