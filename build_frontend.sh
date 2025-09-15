#!/bin/bash
set -e

echo "🎨 Building and deploying frontend for monkey-coder service..."

# Navigate to web directory and build
cd apps/web
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building frontend..."
npm run build

echo "📁 Copying build to static directory..."
rm -rf ../api/src/static/*
cp -r dist/* ../api/src/static/

echo "✅ Frontend build and deployment completed!"
echo "📄 Files copied to: apps/api/src/static/"
ls -la ../api/src/static/

echo "🚀 Frontend is ready to be served by Flask!"