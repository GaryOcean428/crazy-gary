#!/bin/bash

# Crazy-Gary Development Setup Script
# This script automates the complete development environment setup

set -e

echo "🚀 Setting up Crazy-Gary development environment..."

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed."
        echo "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v python &> /dev/null; then
        echo "❌ Python is required but not installed."
        echo "Please install Python 3.10+ from https://python.org/"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "⚠️  Docker is recommended but not installed."
        echo "You can install it later for containerized development."
    fi
    
    echo "✅ Prerequisites check completed"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Install root dependencies
    echo "Installing root dependencies..."
    npm install --legacy-peer-deps
    
    # Install Python dependencies
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Install API dependencies
    echo "Installing API dependencies..."
    cd apps/api
    pip install -r requirements.txt
    cd ../..
    
    echo "✅ Dependencies installed"
}

# Setup environment
setup_environment() {
    echo "🔧 Setting up environment..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "📝 Created .env file from template"
        echo "⚠️  Please edit .env file and add your API keys:"
        echo "   - HUGGINGFACE_API_TOKEN"
        echo "   - OPENAI_API_KEY"
        echo "   - OPENROUTER_API_KEY"
        echo "   - Database credentials"
    else
        echo "✅ .env file already exists"
    fi
}

# Build packages
build_packages() {
    echo "🔨 Building packages..."
    npm run build
    echo "✅ Build completed"
}

# Run tests
run_tests() {
    echo "🧪 Running tests..."
    npm run test
    echo "✅ Tests completed"
}

# Setup git hooks
setup_git_hooks() {
    echo "🪝 Setting up git hooks..."
    
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
npm run lint
npm run type-check
echo "Pre-commit checks passed!"
EOF
    
    chmod +x .git/hooks/pre-commit
    echo "✅ Git hooks configured"
}

# Print startup instructions
print_instructions() {
    echo ""
    echo "🎉 Development environment setup complete!"
    echo ""
    echo "📚 Next steps:"
    echo "1. Edit .env file with your API keys"
    echo "2. Start the development servers:"
    echo ""
    echo "   # Terminal 1 - API Server"
    echo "   cd apps/api"
    echo "   python src/main.py"
    echo ""
    echo "   # Terminal 2 - Frontend"
    echo "   cd apps/web"
    echo "   npm run dev"
    echo ""
    echo "3. Open http://localhost:5173 in your browser"
    echo ""
    echo "🔗 Useful commands:"
    echo "   npm run dev       - Start all services"
    echo "   npm run build     - Build for production"
    echo "   npm run test      - Run test suite"
    echo "   npm run lint      - Run linting"
    echo ""
    echo "📖 Documentation available in docs/ directory"
    echo "🐛 Report issues at: https://github.com/GaryOcean428/crazy-gary/issues"
}

# Main execution
main() {
    check_prerequisites
    install_dependencies
    setup_environment
    build_packages
    run_tests
    setup_git_hooks
    print_instructions
}

# Run main function
main "$@"