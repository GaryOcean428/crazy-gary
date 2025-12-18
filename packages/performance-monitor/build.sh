#!/bin/bash

# Performance Monitor Build Script
# This script builds the performance monitoring package and runs tests

set -e

echo "🚀 Building Performance Monitor Package"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "Please run this script from the performance-monitor package directory"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
if command -v yarn &> /dev/null; then
    yarn install
elif command -v npm &> /dev/null; then
    npm install
else
    print_error "Neither yarn nor npm found. Please install Node.js and npm/yarn."
    exit 1
fi

# Run type checking
print_status "Running type checking..."
if command -v yarn &> /dev/null; then
    yarn type-check
else
    npm run type-check
fi

# Run linting
print_status "Running linting..."
if command -v yarn &> /dev/null; then
    yarn lint
else
    npm run lint
fi

# Run tests
print_status "Running tests..."
if command -v yarn &> /dev/null; then
    yarn test
else
    npm run test
fi

# Build the package
print_status "Building package..."
if command -v yarn &> /dev/null; then
    yarn build
else
    npm run build
fi

# Generate bundle analysis
print_status "Generating bundle analysis..."
if command -v yarn &> /dev/null; then
    yarn analyze
else
    npm run analyze
fi

# Create examples directory if it doesn't exist
mkdir -p examples

# Copy integration example
print_status "Copying integration example..."
if [ -f "examples/IntegrationExample.tsx" ]; then
    print_status "Integration example already exists"
else
    print_warning "Integration example not found"
fi

# Run accessibility tests if available
if command -v yarn &> /dev/null && yarn list | grep -q axe-core; then
    print_status "Running accessibility tests..."
    yarn accessibility || print_warning "Accessibility tests failed"
fi

# Validate build output
print_status "Validating build output..."
if [ ! -d "dist" ]; then
    print_error "Build output directory 'dist' not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    print_error "Main entry point 'dist/index.js' not found"
    exit 1
fi

if [ ! -f "dist/index.d.ts" ]; then
    print_error "Type definitions 'dist/index.d.ts' not found"
    exit 1
fi

# Check bundle sizes
print_status "Checking bundle sizes..."
bundle_size=$(du -sh dist | cut -f1)
print_status "Bundle size: $bundle_size"

# Test the built package
print_status "Testing built package..."
if command -v node &> /dev/null; then
    node -e "
        try {
            const pkg = require('./dist/index.js');
            console.log('✓ Package loads successfully');
            console.log('✓ Available exports:', Object.keys(pkg));
        } catch (error) {
            console.error('✗ Package load failed:', error.message);
            process.exit(1);
        }
    "
else
    print_warning "Node.js not found, skipping package validation"
fi

# Create a simple test HTML file for manual testing
print_status "Creating test HTML file..."
cat > test-performance.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Monitor Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
        button { margin: 5px; padding: 10px 20px; cursor: pointer; }
        #output { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Performance Monitor Test Page</h1>
    
    <div class="test-section">
        <h3>Performance Monitoring Controls</h3>
        <button onclick="startMonitoring()">Start Monitoring</button>
        <button onclick="stopMonitoring()">Stop Monitoring</button>
        <button onclick="generateReport()">Generate Report</button>
        <button onclick="clearData()">Clear Data</button>
        <button onclick="showDashboard()">Show Dashboard</button>
    </div>

    <div class="test-section">
        <h3>Performance Test Actions</h3>
        <button onclick="simulateSlowOperation()">Simulate Slow Operation</button>
        <button onclick="simulateMemoryLeak()">Simulate Memory Leak</button>
        <button onclick="simulateLargeBundle()">Simulate Large Bundle</button>
        <button onclick="testUserInteraction()">Test User Interaction</button>
    </div>

    <div class="test-section">
        <h3>Output</h3>
        <div id="output">Click buttons above to test performance monitoring...</div>
    </div>

    <script type="module">
        // Import performance monitor (adjust path as needed)
        // import { PerformanceMonitor } from '../dist/index.js';
        
        const output = document.getElementById('output');
        
        function log(message) {
            output.innerHTML += new Date().toLocaleTimeString() + ': ' + message + '<br>';
            output.scrollTop = output.scrollHeight;
        }

        // Mock implementation for testing
        window.startMonitoring = () => {
            log('Performance monitoring started');
        };

        window.stopMonitoring = () => {
            log('Performance monitoring stopped');
        };

        window.generateReport = () => {
            log('Generating performance report...');
            setTimeout(() => {
                log('Report generated successfully');
            }, 1000);
        };

        window.clearData = () => {
            output.innerHTML = 'Performance data cleared<br>';
        };

        window.showDashboard = () => {
            log('Performance dashboard would open here');
        };

        window.simulateSlowOperation = () => {
            log('Starting slow operation...');
            const start = performance.now();
            
            // Simulate heavy computation
            let result = 0;
            for (let i = 0; i < 1000000; i++) {
                result += Math.sqrt(i);
            }
            
            const end = performance.now();
            log(`Slow operation completed in ${(end - start).toFixed(2)}ms`);
        };

        window.simulateMemoryLeak = () => {
            log('Simulating memory leak...');
            // This would create memory leaks in a real implementation
            setTimeout(() => {
                log('Memory leak simulation completed');
            }, 500);
        };

        window.simulateLargeBundle = () => {
            log('Loading simulated large bundle...');
            // This would simulate loading a large bundle
            setTimeout(() => {
                log('Large bundle loaded (simulated)');
            }, 2000);
        };

        window.testUserInteraction = () => {
            log('Testing user interaction metrics...');
            // This would trigger various user interactions
            setTimeout(() => {
                log('User interaction test completed');
            }, 1000);
        };

        log('Performance monitor test page loaded');
    </script>
</body>
</html>
EOF

print_status "Test HTML file created: test-performance.html"

# Summary
echo ""
echo "🎉 Performance Monitor Build Complete!"
echo ""
print_status "Build Summary:"
echo "  - Type checking: Passed"
echo "  - Linting: Passed"
echo "  - Tests: Passed"
echo "  - Bundle built: dist/"
echo "  - Bundle size: $bundle_size"
echo "  - Test file: test-performance.html"
echo ""
print_status "Next steps:"
echo "  1. Test the package in your application"
echo "  2. Run 'yarn link' to link the package locally"
echo "  3. Import in your app: import { PerformanceMonitor } from '@crazy-gary/performance-monitor'"
echo "  4. Check the test file: open test-performance.html"
echo ""

if [ "$1" = "--watch" ]; then
    print_status "Starting watch mode..."
    if command -v yarn &> /dev/null; then
        yarn dev
    else
        npm run dev
    fi
fi