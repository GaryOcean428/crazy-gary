#!/bin/bash

# 🚀 Crazy-Gary Automated Deployment Script
# This script deploys the complete Crazy-Gary system to Railway

set -e  # Exit on any error

echo "🚀 Starting Crazy-Gary Deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    curl -fsSL https://railway.app/install.sh | sh
    export PATH="$HOME/.railway/bin:$PATH"
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run 'railway login' first."
    exit 1
fi

echo "✅ Railway CLI ready"

# Deploy API Service
echo "📡 Deploying API Service..."
cd apps/api

# Create API service
echo "Creating API service..."
railway service create crazy-gary-api || echo "Service may already exist"

# Set root directory for API
railway service settings --root-directory apps/api

# Set start command
railway service settings --start-command "python src/main.py"

# Deploy API
echo "Deploying API code..."
railway up --detach

echo "✅ API Service deployed"

# Go back to root
cd ../..

# Deploy Frontend Service
echo "🌐 Deploying Frontend Service..."
cd apps/web

# Build frontend first
echo "Building frontend..."
npm install
npm run build

# Create web service
echo "Creating web service..."
railway service create crazy-gary-web || echo "Service may already exist"

# Set root directory for web
railway service settings --root-directory apps/web

# Set build and start commands
railway service settings --build-command "npm run build"
railway service settings --start-command "npm run preview"

# Deploy web
echo "Deploying web code..."
railway up --detach

echo "✅ Frontend Service deployed"

# Go back to root
cd ../..

echo "🎉 Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure environment variables in Railway dashboard"
echo "2. Set up database connection strings"
echo "3. Add API keys for full functionality"
echo "4. Test the deployment using the testing checklist"
echo ""
echo "🔗 Railway Project: https://railway.com/project/86984e4c-673e-4089-ae39-30c6744e5daa"
echo ""
echo "📚 See COMPLETE_DEPLOYMENT_GUIDE.md for detailed configuration instructions"

