#!/bin/bash

# GitHub Actions Workflow Verification Script
# This script validates the comprehensive GitHub Actions workflows

set -e

echo "🔍 GitHub Actions Workflow Verification"
echo "======================================"

WORKFLOW_DIR=".github/workflows"
FAILED=0
PASSED=0

# Function to validate YAML syntax
validate_yaml() {
    local file="$1"
    if command -v yq &> /dev/null; then
        if yq eval '.' "$file" > /dev/null 2>&1; then
            echo "✅ $file - Valid YAML syntax"
            ((PASSED++))
        else
            echo "❌ $file - Invalid YAML syntax"
            ((FAILED++))
        fi
    else
        echo "⚠️  $file - Skipping YAML validation (yq not installed)"
    fi
}

# Function to check required fields
check_required_fields() {
    local file="$1"
    local basename=$(basename "$file")
    
    echo "Checking required fields for $basename..."
    
    # Check for required top-level fields
    if grep -q "^name:" "$file"; then
        echo "  ✅ name field present"
    else
        echo "  ❌ name field missing"
        ((FAILED++))
    fi
    
    if grep -q "^on:" "$file"; then
        echo "  ✅ on field present"
    else
        echo "  ❌ on field missing"
        ((FAILED++))
    fi
    
    if grep -q "^jobs:" "$file"; then
        echo "  ✅ jobs field present"
    else
        echo "  ❌ jobs field missing"
        ((FAILED++))
    fi
    
    # Check for proper indentation
    if grep -q "^[a-zA-Z]" "$file" | head -1 | grep -q "^jobs:"; then
        echo "  ⚠️  Potential indentation issue detected"
    fi
}

# Function to check for common issues
check_common_issues() {
    local file="$1"
    local basename=$(basename "$file")
    
    echo "Checking common issues for $basename..."
    
    # Check for hardcoded secrets
    if grep -qi "password\|secret\|key.*=.*['\"][^'\"]*['\"]" "$file"; then
        echo "  ⚠️  Potential hardcoded secrets found"
    fi
    
    # Check for proper timeout configuration
    if ! grep -q "timeout-minutes:" "$file"; then
        echo "  ⚠️  No timeout-minutes specified (recommended for long-running jobs)"
    fi
    
    # Check for proper permissions
    if ! grep -q "permissions:" "$file"; then
        echo "  ℹ️  No permissions specified (using defaults)"
    fi
    
    # Check for environment configuration
    if grep -q "environment:" "$file" && ! grep -q "url:" "$file"; then
        echo "  ❌ Environment defined without url field"
        ((FAILED++))
    fi
}

# Function to check workflow-specific requirements
check_workflow_specific() {
    local file="$1"
    local basename=$(basename "$file")
    
    echo "Checking workflow-specific requirements for $basename..."
    
    case "$basename" in
        "comprehensive-ci-cd.yml")
            # Check for multi-stage pipeline
            if grep -q "needs:" "$file"; then
                echo "  ✅ Job dependencies defined"
            else
                echo "  ❌ No job dependencies found"
                ((FAILED++))
            fi
            
            # Check for artifact handling
            if grep -q "upload-artifact\|download-artifact" "$file"; then
                echo "  ✅ Artifact handling configured"
            else
                echo "  ⚠️  No artifact handling found"
            fi
            ;;
            
        "dependency-updates.yml")
            # Check for security focus
            if grep -q "security" "$file"; then
                echo "  ✅ Security focus detected"
            else
                echo "  ❌ No security focus found"
                ((FAILED++))
            fi
            ;;
            
        "enhanced-security-scanning.yml")
            # Check for multiple security tools
            tools_found=0
            for tool in "semgrep" "safety" "bandit" "trufflehog\|gitleaks"; do
                if grep -qi "$tool" "$file"; then
                    ((tools_found++))
                fi
            done
            
            if [ $tools_found -ge 3 ]; then
                echo "  ✅ Multiple security tools configured ($tools_found found)"
            else
                echo "  ❌ Insufficient security tools configured ($tools_found found)"
                ((FAILED++))
            fi
            ;;
            
        "environment-management.yml")
            # Check for environment validation
            if grep -q "environment.*choice" "$file"; then
                echo "  ✅ Environment selection configured"
            else
                echo "  ❌ Environment selection not configured"
                ((FAILED++))
            fi
            ;;
            
        "branch-protection.yml")
            # Check for GitHub API usage
            if grep -q "gh api\|github.com/repos" "$file"; then
                echo "  ✅ GitHub API integration found"
            else
                echo "  ❌ No GitHub API integration found"
                ((FAILED++))
            fi
            ;;
    esac
}

# Function to check documentation
check_documentation() {
    local file="$1"
    
    echo "Checking documentation references..."
    
    if [ -f "$file" ]; then
        # Check for workflow documentation
        if grep -q "# .*workflow\|# .*GitHub Actions" "$file" || [ -f ".github/WORKFLOW_DOCUMENTATION.md" ]; then
            echo "  ✅ Documentation references found"
        else
            echo "  ⚠️  No documentation references found"
        fi
        
        # Check for comments explaining complex logic
        comment_lines=$(grep -c "^#" "$file" || echo "0")
        total_lines=$(wc -l < "$file")
        comment_ratio=$(echo "scale=2; $comment_lines * 100 / $total_lines" | bc)
        
        if (( $(echo "$comment_ratio > 10" | bc -l) )); then
            echo "  ✅ Good documentation ratio ($comment_ratio%)"
        else
            echo "  ⚠️  Low documentation ratio ($comment_ratio%)"
        fi
    fi
}

# Function to check security best practices
check_security_best_practices() {
    local file="$1"
    
    echo "Checking security best practices..."
    
    # Check for token usage
    if grep -q "secrets\." "$file"; then
        echo "  ✅ Secrets usage detected"
    else
        echo "  ℹ️  No secrets usage found"
    fi
    
    # Check for safe script practices
    if grep -q "set -e\|set -o pipefail" "$file"; then
        echo "  ✅ Error handling configured"
    else
        echo "  ⚠️  No error handling found"
    fi
    
    # Check for input validation
    if grep -q "validate\|validation" "$file"; then
        echo "  ✅ Input validation detected"
    else
        echo "  ℹ️  No input validation found"
    fi
}

# Main verification process
echo "📁 Scanning workflow directory: $WORKFLOW_DIR"

if [ ! -d "$WORKFLOW_DIR" ]; then
    echo "❌ Workflow directory not found: $WORKFLOW_DIR"
    exit 1
fi

# Get list of YAML workflow files
workflow_files=$(find "$WORKFLOW_DIR" -name "*.yml" -type f)

if [ -z "$workflow_files" ]; then
    echo "❌ No workflow files found in $WORKFLOW_DIR"
    exit 1
fi

echo "📊 Found ${#workflow_files[@]} workflow files"
echo ""

# Verify each workflow file
for file in $workflow_files; do
    echo "🔍 Verifying: $(basename "$file")"
    echo "----------------------------------------"
    
    # Basic validation
    validate_yaml "$file"
    check_required_fields "$file"
    check_common_issues "$file"
    check_workflow_specific "$file"
    check_documentation "$file"
    check_security_best_practices "$file"
    
    echo ""
done

# Summary
echo "📋 Verification Summary"
echo "======================="
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All workflows passed verification!"
    echo ""
    echo "📚 Next steps:"
    echo "1. Configure required repository secrets"
    echo "2. Test workflows on a feature branch"
    echo "3. Monitor initial workflow runs"
    echo "4. Review and optimize performance"
    echo ""
    echo "📖 Documentation: .github/WORKFLOW_DOCUMENTATION.md"
    echo "📋 Implementation Guide: GITHUB_ACTIONS_IMPLEMENTATION.md"
    exit 0
else
    echo "⚠️  Some workflows have issues that need attention"
    echo "Please review the failed checks above"
    exit 1
fi