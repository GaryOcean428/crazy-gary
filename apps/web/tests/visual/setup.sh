#!/bin/bash

# Visual Regression Testing Setup Script
# This script sets up the visual regression testing environment for Crazy-Gary

set -e

echo "🚀 Setting up Visual Regression Testing for Crazy-Gary..."

# Navigate to the web app directory
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the apps/web directory."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm install
elif [ -f "pnpm-lock.yaml" ]; then
    pnpm install
elif [ -f "yarn.lock" ]; then
    yarn install
else
    echo "❌ No lock file found. Please install dependencies manually."
    exit 1
fi

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install --with-deps

# Build the application
echo "🏗️ Building application..."
npm run build

# Create test directories if they don't exist
echo "📁 Creating test directories..."
mkdir -p tests/visual/__snapshots__
mkdir -p test-results
mkdir -p playwright-report

# Initialize git repository for snapshots (if not already initialized)
if [ ! -d ".git" ]; then
    echo "⚠️ Not a git repository. Visual baselines won't be tracked automatically."
else
    echo "✅ Git repository detected."
    # Check if .gitattributes exists for proper line ending handling
    if [ ! -f ".gitattributes" ]; then
        echo "*.png binary diff=lingua" > .gitattributes
        echo "*.jpg binary diff=lingua" >> .gitattributes
        echo "*.jpeg binary diff=lingua" >> .gitattributes
        echo "✅ Created .gitattributes for binary file handling"
    fi
fi

# Run a quick test to ensure everything is working
echo "🧪 Running quick test..."
npm run test:visual -- --project=chromium --grep="should match homepage"

echo ""
echo "✅ Visual regression testing setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review the test files in tests/visual/"
echo "   2. Run baseline tests: npm run test:visual:update"
echo "   3. Start development server: npm run dev"
echo "   4. In another terminal, run: npm run test:visual:headed"
echo ""
echo "📚 Documentation: tests/visual/README.md"
echo "🔧 Configuration: playwright.config.ts"
echo ""
echo "🎯 Quick commands:"
echo "   npm run test:visual           - Run all visual tests"
echo "   npm run test:visual:headed    - Run tests with browser visible"
echo "   npm run test:visual:update    - Update baseline screenshots"
echo "   npm run test:visual:debug     - Debug mode"
echo ""
echo "🔍 To see test results:"
echo "   npx playwright show-report"
echo ""
echo "Happy testing! 🎨✨"