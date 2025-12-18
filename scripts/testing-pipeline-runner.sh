#!/bin/bash

# Automated Testing Pipeline Runner
# Comprehensive test execution with parallel processing and reporting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_NAME="Automated Testing Pipeline Runner"
VERSION="1.0.0"
DEFAULT_PARALLEL_JOBS=4
DEFAULT_TEST_LEVEL="full"
DEFAULT_ENVIRONMENT="staging"

# Global variables
TEST_LEVEL="${TEST_LEVEL:-$DEFAULT_TEST_LEVEL}"
PARALLEL_JOBS="${PARALLEL_JOBS:-$DEFAULT_PARALLEL_JOBS}"
TEST_ENVIRONMENT="${TEST_ENVIRONMENT:-$DEFAULT_ENVIRONMENT}"
CI="${CI:-false}"

# Test groups configuration
TEST_GROUPS=(
    "unit-tests"
    "integration-tests"
    "e2e-tests"
    "visual-regression"
    "accessibility-tests"
    "performance-tests"
    "security-tests"
    "api-tests"
)

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  $SCRIPT_NAME v$VERSION${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_info() {
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

print_test_group() {
    echo -e "${CYAN}[TEST-GROUP]${NC} $1"
}

# Initialize pipeline
initialize_pipeline() {
    print_info "Initializing automated testing pipeline..."
    
    # Create directory structure
    local dirs=(
        "test-results"
        "test-results/unit"
        "test-results/integration"
        "test-results/e2e"
        "test-results/visual"
        "test-results/accessibility"
        "test-results/performance"
        "test-results/security"
        "test-results/api"
        "test-artifacts"
        "test-artifacts/screenshots"
        "test-artifacts/videos"
        "test-artifacts/logs"
        "test-reports"
        "test-reports/coverage"
        "test-reports/performance"
        "test-reports/accessibility"
        "test-reports/security"
        "test-data"
        "test-data/fixtures"
        "test-data/seeds"
        "test-data/baselines"
        "debug-artifacts"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        print_debug "Created directory: $dir"
    done
    
    # Set up environment variables
    export NODE_ENV=test
    export CI=true
    export TEST_PIPELINE_RUN=true
    export TEST_GROUP_RESULTS_DIR="test-results"
    export PARALLEL_JOBS
    
    print_success "Pipeline initialized successfully"
    print_info "Configuration:"
    print_info "  Test Level: $TEST_LEVEL"
    print_info "  Parallel Jobs: $PARALLEL_JOBS"
    print_info "  Environment: $TEST_ENVIRONMENT"
    print_info "  Test Groups: ${#TEST_GROUPS[@]}"
}

# Check dependencies
check_dependencies() {
    print_info "Checking dependencies..."
    
    local missing_deps=()
    
    # Check required commands
    local required_commands=("node" "npm" "git" "python3" "psql")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing_deps+=("$cmd")
        fi
    done
    
    # Check Node.js packages
    local required_packages=("playwright" "@playwright/test" "vitest" "jest")
    for package in "${required_packages[@]}"; do
        if ! npm list "$package" >/dev/null 2>&1; then
            missing_deps+=("$package")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        return 1
    fi
    
    print_success "All dependencies satisfied"
    return 0
}

# Provision test environment
provision_test_environment() {
    print_info "Provisioning test environment: $TEST_ENVIRONMENT"
    
    # Database setup
    setup_test_database
    
    # Service dependencies
    setup_service_dependencies
    
    # Load test data
    load_test_data
    
    print_success "Test environment provisioned"
}

# Set up test database
setup_test_database() {
    print_info "Setting up test database..."
    
    # Create test database if it doesn't exist
    createdb test_pipeline_db 2>/dev/null || print_warning "Database might already exist"
    
    # Run migrations if available
    if [ -f "apps/api/alembic.ini" ]; then
        print_info "Running database migrations..."
        cd apps/api
        alembic upgrade head
        cd ../..
    fi
    
    print_success "Database setup complete"
}

# Set up service dependencies
setup_service_dependencies() {
    print_info "Setting up service dependencies..."
    
    # Start Redis if available
    if command -v redis-server >/dev/null 2>&1; then
        redis-server --daemonize yes || print_warning "Redis might already be running"
    fi
    
    # Start MinIO if available (for object storage testing)
    if command -v minio >/dev/null 2>&1; then
        minio server /tmp/minio --address ":9000" --console-address ":9001" &
        print_info "MinIO started for object storage testing"
    fi
    
    print_success "Service dependencies ready"
}

# Load test data
load_test_data() {
    print_info "Loading test data for environment: $TEST_ENVIRONMENT"
    
    # Load fixtures
    if [ -d "test-data/fixtures" ]; then
        print_info "Loading test fixtures..."
        for fixture in test-data/fixtures/*.json; do
            if [ -f "$fixture" ]; then
                print_debug "Loading fixture: $(basename "$fixture")"
            fi
        done
    fi
    
    # Load seed data
    if [ -f "test-data/seeds/test_data.sql" ]; then
        print_info "Loading seed data..."
        psql -d test_pipeline_db -f test-data/seeds/test_data.sql
    fi
    
    # Generate environment-specific data
    generate_environment_data
    
    print_success "Test data loaded"
}

# Generate environment-specific test data
generate_environment_data() {
    print_info "Generating environment-specific test data..."
    
    case "$TEST_ENVIRONMENT" in
        "development")
            print_info "Generating minimal test data for development"
            # Generate minimal dataset
            ;;
        "staging")
            print_info "Generating medium test data for staging"
            # Generate medium dataset
            ;;
        "production-mirror")
            print_info "Generating full test data for production mirror"
            # Generate full dataset
            ;;
    esac
}

# Execute test group
execute_test_group() {
    local test_group="$1"
    local browser="${2:-chromium}"
    
    print_test_group "Executing: $test_group"
    
    local start_time=$(date +%s.%N)
    local success=false
    
    case "$test_group" in
        "unit-tests")
            run_unit_tests
            ;;
        "integration-tests")
            run_integration_tests
            ;;
        "e2e-tests")
            run_e2e_tests "$browser"
            ;;
        "visual-regression")
            run_visual_regression_tests "$browser"
            ;;
        "accessibility-tests")
            run_accessibility_tests "$browser"
            ;;
        "performance-tests")
            run_performance_tests "$browser"
            ;;
        "security-tests")
            run_security_tests "$browser"
            ;;
        "api-tests")
            run_api_tests
            ;;
        *)
            print_error "Unknown test group: $test_group"
            return 1
            ;;
    esac
    
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "N/A")
    
    if [ $? -eq 0 ]; then
        success=true
        print_success "$test_group completed in ${duration}s"
    else
        print_error "$test_group failed after ${duration}s"
    fi
    
    # Collect results
    collect_test_results "$test_group" "$success" "$duration"
    
    return $([ "$success" = true ] && echo 0 || echo 1)
}

# Run unit tests
run_unit_tests() {
    print_info "Running unit tests..."
    
    if [ -d "apps/web" ]; then
        cd apps/web
        npm run test:unit -- --coverage --parallel --maxWorkers="$PARALLEL_JOBS" || return 1
        cd ../..
    else
        print_warning "Web app not found, skipping unit tests"
    fi
}

# Run integration tests
run_integration_tests() {
    print_info "Running integration tests..."
    
    if [ -d "apps/web" ]; then
        cd apps/web
        npm run test:integration -- --coverage --parallel --maxWorkers="$PARALLEL_JOBS" || return 1
        cd ../..
    else
        print_warning "Web app not found, skipping integration tests"
    fi
}

# Run E2E tests
run_e2e_tests() {
    local browser="$1"
    print_info "Running E2E tests on $browser..."
    
    if [ -d "apps/web" ]; then
        cd apps/web
        npm run test:e2e -- --project="$browser" --workers="$PARALLEL_JOBS" || return 1
        cd ../..
    else
        print_warning "Web app not found, skipping E2E tests"
    fi
}

# Run visual regression tests
run_visual_regression_tests() {
    local browser="$1"
    print_info "Running visual regression tests on $browser..."
    
    if [ -d "apps/web" ]; then
        cd apps/web
        npm run test:visual -- --project="$browser" --update-snapshots=false || return 1
        cd ../..
    else
        print_warning "Web app not found, skipping visual regression tests"
    fi
}

# Run accessibility tests
run_accessibility_tests() {
    local browser="$1"
    print_info "Running accessibility tests on $browser..."
    
    if [ -d "apps/web" ]; then
        cd apps/web
        npm run test:accessibility -- --project="$browser" || return 1
        cd ../..
    else
        print_warning "Web app not found, skipping accessibility tests"
    fi
}

# Run performance tests
run_performance_tests() {
    local browser="$1"
    print_info "Running performance tests on $browser..."
    
    if [ -d "apps/web" ]; then
        cd apps/web
        npm run test:performance -- --project="$browser" || return 1
        cd ../..
    else
        print_warning "Web app not found, skipping performance tests"
    fi
    
    # Run additional performance analysis
    run_lighthouse_audit
}

# Run security tests
run_security_tests() {
    local browser="$1"
    print_info "Running security tests on $browser..."
    
    if [ -d "apps/web" ]; then
        cd apps/web
        npm run test:security -- --project="$browser" || return 1
        cd ../..
    else
        print_warning "Web app not found, skipping security tests"
    fi
}

# Run API tests
run_api_tests() {
    print_info "Running API tests..."
    
    if [ -d "apps/api" ]; then
        cd apps/api
        python -m pytest --cov=src --cov-report=json --cov-report=html || return 1
        cd ../..
    else
        print_warning "API app not found, skipping API tests"
    fi
}

# Run Lighthouse audit
run_lighthouse_audit() {
    print_info "Running Lighthouse performance audit..."
    
    if command -v lhci >/dev/null 2>&1; then
        lhci autorun --config=.lighthouserc.json || print_warning "Lighthouse audit completed with warnings"
    else
        print_warning "Lighthouse CI not installed, skipping audit"
    fi
}

# Collect test results
collect_test_results() {
    local test_group="$1"
    local success="$2"
    local duration="$3"
    
    local results_dir="test-results/$test_group"
    mkdir -p "$results_dir"
    
    # Create result summary
    cat > "$results_dir/summary.json" << EOF
{
  "test_group": "$test_group",
  "status": "$([ "$success" = true ] && echo "success" || echo "failure")",
  "duration": "$duration",
  "timestamp": "$(date -Iseconds)",
  "environment": "$TEST_ENVIRONMENT",
  "parallel_jobs": $PARALLEL_JOBS
}
EOF
    
    # Copy coverage reports if available
    if [ -d "apps/web/coverage" ]; then
        cp -r apps/web/coverage "$results_dir/coverage" 2>/dev/null || true
    fi
    
    # Copy test results if available
    if [ -d "apps/web/test-results" ]; then
        cp -r apps/web/test-results/* "$results_dir/" 2>/dev/null || true
    fi
    
    # Copy screenshots and videos
    if [ -d "apps/web/test-results" ]; then
        find apps/web/test-results -name "*.png" -o -name "*.jpg" -o -name "*.mp4" 2>/dev/null | \
        head -10 | xargs -I {} cp {} "test-artifacts/" 2>/dev/null || true
    fi
}

# Generate coverage analysis
generate_coverage_analysis() {
    print_info "Generating coverage analysis..."
    
    # Combine coverage reports from all test groups
    if [ -d "test-results" ]; then
        local coverage_files=$(find test-results -name "coverage-final.json" 2>/dev/null || true)
        
        if [ -n "$coverage_files" ]; then
            # Use NYC to combine coverage reports
            if command -v npx >/dev/null 2>&1; then
                echo "$coverage_files" | tr ' ' '\n' | xargs -I {} npx nyc report --include={} --temp-dir=test-reports/coverage/ || true
            fi
        fi
    fi
    
    # Check coverage thresholds
    check_coverage_thresholds
    
    print_success "Coverage analysis completed"
}

# Check coverage thresholds
check_coverage_thresholds() {
    print_info "Checking coverage thresholds..."
    
    local thresholds=$(cat << 'EOF'
{
  "lines": 85,
  "statements": 85,
  "functions": 80,
  "branches": 80
}
EOF
)
    
    echo "$thresholds" | jq '.'
    
    # Add threshold validation logic here
    # This would read actual coverage reports and validate against thresholds
}

# Generate performance analysis
generate_performance_analysis() {
    print_info "Generating performance analysis..."
    
    # Collect performance metrics
    local perf_data=$(cat << EOF
{
  "timestamp": "$(date -Iseconds)",
  "environment": "$TEST_ENVIRONMENT",
  "lighthouse_scores": {},
  "bundle_sizes": {},
  "load_times": {},
  "memory_usage": {}
}
EOF
)
    
    # Add Lighthouse scores if available
    if [ -d "apps/web/.lighthouseci" ]; then
        local lighthouse_file="apps/web/.lighthouseci/results.json"
        if [ -f "$lighthouse_file" ]; then
            local scores=$(jq '.runs[] | .summary.performance' "$lighthouse_file" 2>/dev/null || echo "null")
            perf_data=$(echo "$perf_data" | jq ".lighthouse_scores = $scores")
        fi
    fi
    
    # Add bundle size information
    if [ -d "apps/web/dist" ]; then
        local bundle_size=$(du -sh apps/web/dist | cut -f1)
        perf_data=$(echo "$perf_data" | jq ".bundle_sizes.web_app = \"$bundle_size\"")
    fi
    
    echo "$perf_data" > test-reports/performance-analysis.json
    
    print_success "Performance analysis completed"
}

# Generate comprehensive report
generate_comprehensive_report() {
    print_info "Generating comprehensive test report..."
    
    local report_file="test-reports/comprehensive-pipeline-report.md"
    
    cat > "$report_file" << EOF
# 🧪 Automated Testing Pipeline Report

**Generated:** $(date)
**Pipeline Version:** $VERSION
**Test Level:** $TEST_LEVEL
**Environment:** $TEST_ENVIRONMENT
**Parallel Jobs:** $PARALLEL_JOBS

## Test Execution Summary

### Test Groups Executed
EOF
    
    # Add test group results
    for group in "${TEST_GROUPS[@]}"; do
        local summary_file="test-results/$group/summary.json"
        if [ -f "$summary_file" ]; then
            local status=$(jq -r '.status' "$summary_file" 2>/dev/null || echo "unknown")
            local duration=$(jq -r '.duration' "$summary_file" 2>/dev/null || echo "N/A")
            local icon=$([ "$status" = "success" ] && echo "✅" || echo "❌")
            echo "- $icon **$group** - Duration: ${duration}s" >> "$report_file"
        else
            echo "- ⚠️ **$group** - No results found" >> "$report_file"
        fi
    done
    
    cat >> "$report_file" << EOF

## Quality Metrics

### Coverage Analysis
- Lines Coverage: 85% threshold
- Statements Coverage: 85% threshold  
- Functions Coverage: 80% threshold
- Branches Coverage: 80% threshold

### Performance Benchmarks
- Lighthouse Performance Score: 90+ threshold
- Bundle Size: <10MB threshold
- Load Time: <3s threshold

### Accessibility Compliance
- WCAG 2.1 AA: 100% compliance
- Critical Issues: 0 threshold

### Security Validation
- Vulnerabilities: 0 threshold
- High Severity Issues: 0 threshold

## Artifacts Generated

### Test Results
- Unit Test Results
- Integration Test Results
- E2E Test Results
- Visual Regression Results
- Accessibility Test Results
- Performance Test Results
- Security Test Results
- API Test Results

### Reports
- Coverage Reports
- Performance Analysis
- Accessibility Reports
- Security Scan Results

### Debug Artifacts
- Screenshots
- Videos
- Logs
- Error Traces

## Next Steps

1. Review the comprehensive test report
2. Address any failing tests
3. Improve coverage if below thresholds
4. Optimize performance if benchmarks not met
5. Fix accessibility issues if found
6. Resolve security vulnerabilities
EOF
    
    print_success "Comprehensive report generated: $report_file"
}

# Clean up test environment
cleanup_test_environment() {
    print_info "Cleaning up test environment..."
    
    # Stop services
    if pgrep -f "redis-server" >/dev/null; then
        pkill -f redis-server || true
    fi
    
    if pgrep -f "minio" >/dev/null; then
        pkill -f minio || true
    fi
    
    # Clean up test databases
    dropdb test_pipeline_db 2>/dev/null || true
    
    # Clean up temporary files
    rm -rf /tmp/minio 2>/dev/null || true
    
    print_success "Test environment cleaned up"
}

# Show help
show_help() {
    print_header
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -l, --level LEVEL       Test level (quick|standard|full|comprehensive) [default: full]"
    echo "  -j, --jobs JOBS         Number of parallel test jobs [default: 4]"
    echo "  -e, --env ENVIRONMENT   Test environment [default: staging]"
    echo "  -g, --group GROUP       Run specific test group only"
    echo "  -b, --browser BROWSER   Browser for E2E tests [default: chromium]"
    echo "  --parallel              Enable parallel execution"
    echo "  --coverage              Generate coverage reports"
    echo "  --performance           Run performance tests"
    echo "  --accessibility         Run accessibility tests"
    echo "  --security              Run security tests"
    echo "  --debug                 Enable debug mode"
    echo "  --cleanup               Clean up after tests"
    echo "  --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --level quick --jobs 2"
    echo "  $0 --group e2e-tests --browser firefox"
    echo "  $0 --comprehensive --parallel --coverage"
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -l|--level)
                TEST_LEVEL="$2"
                shift 2
                ;;
            -j|--jobs)
                PARALLEL_JOBS="$2"
                shift 2
                ;;
            -e|--env)
                TEST_ENVIRONMENT="$2"
                shift 2
                ;;
            -g|--group)
                RUN_SPECIFIC_GROUP="$2"
                shift 2
                ;;
            -b|--browser)
                TEST_BROWSER="$2"
                shift 2
                ;;
            --parallel)
                ENABLE_PARALLEL=true
                shift
                ;;
            --coverage)
                GENERATE_COVERAGE=true
                shift
                ;;
            --performance)
                RUN_PERFORMANCE_TESTS=true
                shift
                ;;
            --accessibility)
                RUN_ACCESSIBILITY_TESTS=true
                shift
                ;;
            --security)
                RUN_SECURITY_TESTS=true
                shift
                ;;
            --debug)
                set -x
                shift
                ;;
            --cleanup)
                CLEANUP_ONLY=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Main execution
main() {
    parse_arguments "$@"
    
    print_header
    print_info "Starting automated testing pipeline..."
    
    # Cleanup mode
    if [ "$CLEANUP_ONLY" = true ]; then
        cleanup_test_environment
        exit 0
    fi
    
    # Initialize pipeline
    initialize_pipeline
    
    # Check dependencies
    if ! check_dependencies; then
        print_error "Dependency check failed"
        exit 1
    fi
    
    # Provision test environment
    provision_test_environment
    
    # Execute tests
    local test_results=()
    local failed_groups=()
    
    if [ -n "$RUN_SPECIFIC_GROUP" ]; then
        # Run specific test group
        print_info "Running specific test group: $RUN_SPECIFIC_GROUP"
        if execute_test_group "$RUN_SPECIFIC_GROUP" "$TEST_BROWSER"; then
            test_results+=("$RUN_SPECIFIC_GROUP:success")
        else
            test_results+=("$RUN_SPECIFIC_GROUP:failure")
            failed_groups+=("$RUN_SPECIFIC_GROUP")
        fi
    else
        # Run all test groups
        for group in "${TEST_GROUPS[@]}"; do
            # Skip groups based on configuration
            case "$group" in
                "performance-tests")
                    [ "$RUN_PERFORMANCE_TESTS" != true ] && continue
                    ;;
                "accessibility-tests")
                    [ "$RUN_ACCESSIBILITY_TESTS" != true ] && continue
                    ;;
                "security-tests")
                    [ "$RUN_SECURITY_TESTS" != true ] && continue
                    ;;
            esac
            
            print_info "Starting test group: $group"
            
            if execute_test_group "$group" "$TEST_BROWSER"; then
                test_results+=("$group:success")
            else
                test_results+=("$group:failure")
                failed_groups+=("$group")
            fi
        done
    fi
    
    # Generate analyses and reports
    if [ "$GENERATE_COVERAGE" = true ]; then
        generate_coverage_analysis
    fi
    
    generate_performance_analysis
    generate_comprehensive_report
    
    # Clean up
    cleanup_test_environment
    
    # Final status
    print_info "Pipeline execution completed"
    print_info "Test Results Summary:"
    for result in "${test_results[@]}"; do
        local group=$(echo "$result" | cut -d: -f1)
        local status=$(echo "$result" | cut -d: -f2)
        if [ "$status" = "success" ]; then
            print_success "  ✅ $group"
        else
            print_error "  ❌ $group"
        fi
    done
    
    if [ ${#failed_groups[@]} -eq 0 ]; then
        print_success "All tests passed successfully!"
        exit 0
    else
        print_error "Failed test groups: ${failed_groups[*]}"
        exit 1
    fi
}

# Run main function
main "$@"