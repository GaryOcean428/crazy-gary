#!/bin/bash

# Development Environment Setup Script for Crazy Gary
# Sets up complete development environment with all dependencies

set -e

echo "🚀 Setting up Crazy Gary development environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Node.js version
echo -e "\n${YELLOW}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${RED}Error: Node.js 22.x or higher is required${NC}"
    echo "Please install Node.js 22.x from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version is compatible${NC}"

# Check Python version
echo -e "\n${YELLOW}Checking Python version...${NC}"
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
REQUIRED_VERSION="3.10"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}Error: Python 3.10 or higher is required${NC}"
    echo "Please install Python 3.10+ from https://www.python.org/"
    exit 1
fi
echo -e "${GREEN}✅ Python version is compatible${NC}"

# Install Yarn 4
echo -e "\n${YELLOW}Setting up Yarn 4...${NC}"
if ! command -v yarn &> /dev/null; then
    echo "Installing Yarn..."
    corepack enable
    corepack prepare yarn@4.0.2 --activate
fi
echo -e "${GREEN}✅ Yarn 4 is installed${NC}"

# Remove old node_modules and lockfiles if migrating from npm
if [ -f "package-lock.json" ]; then
    echo -e "\n${YELLOW}Migrating from npm to Yarn...${NC}"
    rm -rf node_modules package-lock.json
    rm -rf apps/*/node_modules apps/*/package-lock.json
    rm -rf packages/*/node_modules packages/*/package-lock.json
    echo -e "${GREEN}✅ Cleaned up npm artifacts${NC}"
fi

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
yarn install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Setup Python virtual environment for backend
echo -e "\n${YELLOW}Setting up Python environment...${NC}"
if [ ! -d "apps/api/venv" ]; then
    echo "Creating Python virtual environment..."
    cd apps/api
    python3 -m venv venv
    cd ../..
fi

# Activate venv and install Python dependencies
cd apps/api

# OS-aware venv activation
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    venv\Scripts\activate
else
    # Unix-like
    source venv/bin/activate
fi

echo "Installing Python dependencies..."
pip install --upgrade pip
if [ -f "requirements-updated.txt" ]; then
    pip install -r requirements-updated.txt
else
    pip install -r requirements.txt
fi

deactivate
cd ../..
echo -e "${GREEN}✅ Python environment setup complete${NC}"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "\n${YELLOW}Creating .env file from example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${YELLOW}⚠️  Please update .env with your API keys and configuration${NC}"
    else
        echo -e "${YELLOW}⚠️  No .env.example found - please create .env manually${NC}"
    fi
fi

# Setup git hooks
echo -e "\n${YELLOW}Setting up git hooks...${NC}"
if [ -d ".git" ]; then
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
yarn lint
yarn type-check
yarn test
EOF
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✅ Git hooks configured${NC}"
fi

# Run initial quality checks
echo -e "\n${YELLOW}Running initial quality checks...${NC}"
echo "Running linter..."
yarn lint:fix || true
echo "Running type check..."
yarn type-check || true
echo "Running tests..."
yarn test || true

# Database setup instructions
echo -e "\n${YELLOW}Database Setup${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found${NC}"
    echo "Please install PostgreSQL from https://www.postgresql.org/download/"
fi

# Summary
echo -e "\n${GREEN}🎉 Development environment setup complete!${NC}"
echo -e "\nNext steps:"
echo "1. Update .env with your configuration"
echo "2. Set up PostgreSQL database"
echo "3. Run 'yarn dev' to start development servers"
echo "4. Visit http://localhost:5675 for the frontend"
echo "5. API will be available at http://localhost:8000"
echo -e "\n${YELLOW}Available commands:${NC}"
echo "  yarn dev          - Start development servers"
echo "  yarn build        - Build for production"
echo "  yarn test         - Run tests"
echo "  yarn lint         - Check code quality"
echo "  yarn type-check   - Check TypeScript types"
echo "  yarn security     - Run security audit"
echo "  yarn performance  - Analyze performance"

echo -e "\n${GREEN}Happy coding! 🚀${NC}"

exit 0