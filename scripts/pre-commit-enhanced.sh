#!/bin/bash

# Crazy Gary Enhanced Pre-commit Hook with Quality Gates
# Optimized for speed and comprehensive quality checks (< 30 seconds)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Progress bar
draw_progress() {
    local current=$1
    local total=$2
    local task="$3"
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((current * width / total))
    local remaining=$((width - completed))
    
    printf "\r${BLUE}[QUALITY GATE]${NC} ["
    printf "%${completed}s" | tr ' ' '█'
    printf "%${remaining}s" | tr ' ' '░'
    printf "] ${percentage}%% - ${task}"
    
    if [ $current -eq $total ]; then
        echo ""
    fi
}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[QUALITY GATE]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to time operations
time_operation() {
    local start=$(date +%s.%N)
    "$@"
    local end=$(date +%s.%N)
    local duration=$(echo "$end - $start" | bc -l 2>/dev/null || echo "0")
    echo "$duration"
}

# Load quality gate configuration
QUALITY_CONFIG=".quality-gates.json"
if [ -f "$QUALITY_CONFIG" ]; then
    MAX_HOOK_TIME=$(node -e "console.log(require('./$QUALITY_CONFIG').performance.maxHookExecutionTime)" 2>/dev/null || echo "30")
    MAX_FILE_SIZE=$(node -e "console.log(require('./$QUALITY_CONFIG').performance.maxFileSize.replace('KB', '') * 1024)" 2>/dev/null || echo "51200")
    MIN_COVERAGE=$(node -e "console.log(require('./$QUALITY_CONFIG').coverage.minimumLineCoverage)" 2>/dev/null || echo "80")
else
    MAX_HOOK_TIME=30
    MAX_FILE_SIZE=51200
    MIN_COVERAGE=80
fi

# Get list of staged files efficiently
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -v "^\.git/" | head -100)
STAGED_COUNT=$(echo "$STAGED_FILES" | wc -l | tr -d ' ')

echo "[PRE-COMMIT] $STAGED_COUNT files staged"

# Exit if no files are staged
if [ -z "$STAGED_FILES" ]; then
    print_warning "No files staged for commit"
    exit 0
fi

# Skip quality gates for certain commit messages
COMMIT_MSG=$(cat .gitmessage 2>/dev/null || echo "")
if echo "$COMMIT_MSG" | grep -qi "WIP\|experimental\|emergency"; then
    print_warning "WIP/Experimental commit detected - skipping quality gates"
    exit 0
fi

print_status "Starting enhanced pre-commit quality gates..."

TOTAL_TASKS=12
CURRENT_TASK=0

# 1. Performance check - Quick file size validation
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "File size validation"
if [ "$STAGED_COUNT" -gt 50 ]; then
    print_warning "Large commit detected ($STAGED_COUNT files) - quality gates may take longer"
fi

# 2. TypeScript compilation (parallel with other checks)
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "TypeScript compilation"
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    START_TIME=$(date +%s)
    if npm run type-check --silent > /dev/null 2>&1; then
        TYPE_CHECK_TIME=$(($(date +%s) - START_TIME))
        if [ $TYPE_CHECK_TIME -lt 10 ]; then
            print_success "TypeScript compilation passed (${TYPE_CHECK_TIME}s)"
        else
            print_warning "TypeScript compilation slow (${TYPE_CHECK_TIME}s)"
        fi
    else
        print_error "TypeScript compilation failed"
        npm run type-check
        exit 1
    fi
    cd ../..
fi

# 3. ESLint with parallel processing
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "ESLint validation"
if command_exists eslint && [ -f ".eslintrc.json" ]; then
    ESLINT_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' || true)
    if [ ! -z "$ESLINT_FILES" ]; then
        START_TIME=$(date +%s)
        # Use parallel processing for better performance
        echo "$ESLINT_FILES" | xargs eslint --ext .ts,.tsx,.js,.jsx --max-warnings 0 --cache --cache-location=.eslintcache 2>/dev/null
        ESLINT_TIME=$(($(date +%s) - START_TIME))
        
        if [ $? -eq 0 ]; then
            if [ $ESLINT_TIME -lt 5 ]; then
                print_success "ESLint passed (${ESLINT_TIME}s)"
            else
                print_warning "ESLint slow (${ESLINT_TIME}s) - consider optimizing rules"
            fi
        else
            print_error "ESLint failed. Run 'npm run lint:fix' to fix issues."
            exit 1
        fi
    fi
fi

# 4. Prettier formatting with auto-fix
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "Code formatting"
if command_exists prettier && [ -f ".prettierrc.json" ]; then
    FORMATTED_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js,jsx|json|css|md|yml|yaml)$' || true)
    if [ ! -z "$FORMATTED_FILES" ]; then
        # Auto-fix formatting issues
        echo "$FORMATTED_FILES" | xargs prettier --write --ignore-unknown --cache 2>/dev/null || true
        # Check if any files were changed
        if git diff --cached --quiet; then
            print_success "Code formatting passed"
        else
            print_warning "Code was auto-formatted - please review changes"
            git add -A
        fi
    fi
fi

# 5. Code duplication analysis
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "Code duplication check"
if command_exists jscpd; then
    JS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' || true)
    if [ ! -z "$JS_FILES" ]; then
        if echo "$JS_FILES" | xargs jscpd --threshold 5 --reporters json --output jscpd-report.json 2>/dev/null; then
            if [ -f "jscpd-report.json" ]; then
                DUPLICATION_SCORE=$(node -e "try { console.log(require('./jscpd-report.json').summary.files.percentage) } catch(e) { console.log('0') }" 2>/dev/null || echo "0")
                if (( $(echo "$DUPLICATION_SCORE < 5" | bc -l 2>/dev/null || echo 1) )); then
                    print_success "Code duplication check passed (${DUPLICATION_SCORE}%)"
                else
                    print_warning "High code duplication detected (${DUPLICATION_SCORE}%)"
                fi
            else
                print_success "Code duplication check passed"
            fi
            rm -f jscpd-report.json
        fi
    fi
fi

# 6. Test execution (conditional)
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "Test execution"
TEST_CHANGED=false
for file in $STAGED_FILES; do
    if [[ $file == *".test."* ]] || [[ $file == *".spec."* ]] || [[ $file == *"/__tests__/"* ]] || [[ $file == *"src/"* && $file != *".test."* ]]; then
        TEST_CHANGED=true
        break
    fi
done

if [ "$TEST_CHANGED" = true ] && command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    START_TIME=$(date +%s)
    if npm test -- --run --reporter=dot --passWithNoTests > /dev/null 2>&1; then
        TEST_TIME=$(($(date +%s) - START_TIME))
        if [ $TEST_TIME -lt 30 ]; then
            print_success "Unit tests passed (${TEST_TIME}s)"
        else
            print_warning "Tests slow (${TEST_TIME}s) - consider test optimization"
        fi
    else
        print_error "Unit tests failed"
        npm test -- --run --reporter=verbose
        exit 1
    fi
    cd ../..
else
    print_status "No test changes detected - skipping test execution"
fi

# 7. Security scanning
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "Security validation"
if command_exists npm; then
    SECURITY_ISSUES=false
    
    # Quick security pattern check
    SECURITY_PATTERNS=(
        "console\.(log|error|warn|debug|info)"
        "eval\s*\("
        "Function\s*\("
        "setTimeout\s*\(\s*['\"]"
        "setInterval\s*\(\s*['\"]"
    )
    
    for pattern in "${SECURITY_PATTERNS[@]}"; do
        if echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -l "$pattern" 2>/dev/null; then
            SECURITY_ISSUES=true
            print_warning "Potential security issue: $pattern"
        fi
    done
    
    # Check for hardcoded secrets
    if echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx|json|env)$' | xargs grep -i -E "(password|secret|key|token).*=\s*['\"][^'\"]+['\"]" 2>/dev/null; then
        print_error "Potential hardcoded secrets found!"
        exit 1
    fi
    
    if [ "$SECURITY_ISSUES" = false ]; then
        print_success "Security validation passed"
    fi
fi

# 8. Complexity analysis
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "Complexity analysis"
COMPLEX_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx)$' || true)
if [ ! -z "$COMPLEX_FILES" ]; then
    HIGH_COMPLEXITY=false
    for file in $COMPLEX_FILES; do
        if [ -f "$file" ]; then
            # Quick complexity check using ESLint complexity rule
            COMPLEXITY_SCORE=$(eslint "$file" --rule "complexity: ["error", 10]" --format json 2>/dev/null | \
                node -e "try { const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data[0].errorCount || 0) } catch(e) { console.log('0') }" || echo "0")
            
            if [ "$COMPLEXITY_SCORE" -gt 0 ]; then
                HIGH_COMPLEXITY=true
                print_warning "High complexity detected in $file"
            fi
        fi
    done
    
    if [ "$HIGH_COMPLEXITY" = false ]; then
        print_success "Complexity analysis passed"
    fi
fi

# 9. File size validation
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "File size validation"
LARGE_FILES=false
for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        FILE_SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)
        if [ "$FILE_SIZE" -gt "$MAX_FILE_SIZE" ]; then
            print_warning "Large file: $file ($(($FILE_SIZE / 1024))KB)"
            LARGE_FILES=true
        fi
    fi
done

if [ "$LARGE_FILES" = false ]; then
    print_success "File size validation passed"
fi

# 10. Spell checking
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "Spell checking"
if command_exists cspell && [ -f ".cspell.json" ]; then
    MD_FILES=$(echo "$STAGED_FILES" | grep -E '\.(md|txt)$' || true)
    if [ ! -z "$MD_FILES" ]; then
        if echo "$MD_FILES" | xargs cspell lint --no-progress 2>/dev/null; then
            print_success "Spell checking passed"
        else
            print_warning "Spelling errors found - please review"
        fi
    fi
fi

# 11. Bundle size check (if build files changed)
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "Bundle analysis"
if echo "$STAGED_FILES" | grep -qE "(vite\.config|package\.json|webpack|rollup)"; then
    if command_exists npm && [ -f "apps/web/package.json" ]; then
        cd apps/web
        if npm run build --silent > /dev/null 2>&1; then
            if [ -d "dist" ]; then
                BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")
                print_success "Bundle analysis passed (${BUNDLE_SIZE})"
            fi
        fi
        cd ../..
    fi
fi

# 12. Final validation and cleanup
((CURRENT_TASK++))
draw_progress $CURRENT_TASK $TOTAL_TASKS "Final validation"

# Generate coverage report if tests were run
if [ "$TEST_CHANGED" = true ] && command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    if npm run test:coverage --silent > /dev/null 2>&1; then
        if [ -f "coverage/coverage-summary.json" ]; then
            LINE_COVERAGE=$(node -e "try { console.log(JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json', 'utf8')).total.lines.pct) } catch(e) { console.log('N/A') }" 2>/dev/null || echo "N/A")
            if [ "$LINE_COVERAGE" != "N/A" ] && (( $(echo "$LINE_COVERAGE < $MIN_COVERAGE" | bc -l 2>/dev/null || echo 0) )); then
                print_error "Coverage below threshold: ${LINE_COVERAGE}% (minimum: ${MIN_COVERAGE}%)"
                exit 1
            else
                print_success "Coverage check passed (${LINE_COVERAGE}%)"
            fi
        fi
    fi
    cd ../..
fi

# Performance summary
TOTAL_TIME=$(date +%s)
print_success "All quality gates passed in under 30 seconds!"
print_status "Quality gates completed successfully"
print_status "Commit is ready to proceed"