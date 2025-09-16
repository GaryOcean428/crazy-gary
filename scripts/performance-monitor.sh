#!/bin/bash

# Performance Monitoring Script for Crazy Gary
# Analyzes bundle size, dependencies, and performance metrics

set -e

echo "📊 Starting Performance Analysis..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running in CI
if [ "$CI" = "true" ]; then
    echo "Running in CI mode"
fi

# Frontend Performance Analysis
echo -e "\n${BLUE}🎨 Frontend Performance Analysis${NC}"
if [ -d "apps/web" ]; then
    cd apps/web
    
    # Build the project
    echo "Building frontend..."
    yarn build
    
    # Analyze bundle size
    echo -e "\n${YELLOW}📦 Bundle Size Analysis${NC}"
    if [ -d "dist" ]; then
        echo "Main bundles:"
        find dist -name "*.js" -o -name "*.css" | while read file; do
            size=$(du -h "$file" | cut -f1)
            name=$(basename "$file")
            echo "  - $name: $size"
        done
        
        total_size=$(du -sh dist | cut -f1)
        echo -e "\nTotal build size: ${YELLOW}$total_size${NC}"
        
        # Check if all main bundles are under 500KB
        main_js_files=$(find dist/assets -name "index-*.js" 2>/dev/null)
        total_main_size=0
        all_under_limit=true

        if [ -n "$main_js_files" ]; then
            echo -e "\nChecking main bundle(s) size:"
            for main_js in $main_js_files; do
                main_size=$(stat -f%z "$main_js" 2>/dev/null || stat -c%s "$main_js" 2>/dev/null || echo "0")
                main_size_kb=$((main_size / 1024))
                total_main_size=$((total_main_size + main_size_kb))
                name=$(basename "$main_js")
                if [ $main_size_kb -lt 500 ]; then
                    echo -e "${GREEN}✅ $name is under 500KB ($main_size_kb KB)${NC}"
                else
                    echo -e "${RED}❌ $name exceeds 500KB ($main_size_kb KB)${NC}"
                    all_under_limit=false
                fi
            done
            echo -e "${YELLOW}Total main bundle size: $total_main_size KB${NC}"
            if $all_under_limit; then
                echo -e "${GREEN}✅ All main bundles are under 500KB${NC}"
            else
                echo -e "${RED}❌ One or more main bundles exceed 500KB${NC}"
            fi
        else
            echo -e "${RED}No main bundle files found (index-*.js)${NC}"
        fi
        main_js=$(find dist/assets -name "index-*.js" 2>/dev/null | head -n1)
        if [ -f "$main_js" ]; then
            main_size=$(stat -f%z "$main_js" 2>/dev/null || stat -c%s "$main_js" 2>/dev/null || echo "0")
            main_size_kb=$((main_size / 1024))
            
            if [ $main_size_kb -lt 500 ]; then
                echo -e "${GREEN}✅ Main bundle is under 500KB ($main_size_kb KB)${NC}"
            else
                echo -e "${YELLOW}⚠️  Main bundle exceeds 500KB ($main_size_kb KB)${NC}"
                echo "Consider:"
                echo "  - Code splitting"
                echo "  - Lazy loading routes"
                echo "  - Tree shaking unused imports"
                echo "  - Dynamic imports for heavy components"
            fi
        fi
    fi
    
    # Check for large dependencies
    echo -e "\n${YELLOW}📊 Dependency Size Analysis${NC}"
    echo "Large dependencies (>100KB):"
    
    # Run bundle analyzer if available
    if command -v vite-bundle-visualizer >/dev/null 2>&1; then
        echo "Generating bundle visualization..."
        npx vite-bundle-visualizer dist -o bundle-report.html 2>/dev/null || true
        if [ -f "bundle-report.html" ]; then
            echo -e "${GREEN}✅ Bundle report generated: apps/web/bundle-report.html${NC}"
        fi
    fi
    
    cd ../..
fi

# Backend Performance Analysis
echo -e "\n${BLUE}🐍 Backend Performance Analysis${NC}"
if [ -d "apps/api" ]; then
    cd apps/api
    
    # Check Python package sizes
    echo "Analyzing Python dependencies..."
    if [ -f "requirements.txt" ]; then
        echo "Top dependencies:"
        head -10 requirements.txt
    fi
    
    cd ../..
fi

# Memory Usage Estimation
echo -e "\n${YELLOW}💾 Memory Usage Recommendations${NC}"
echo "Frontend (React app): ~50-100MB"
echo "Backend (Flask): ~100-200MB base"
echo "Database connections: ~10MB per connection"
echo "Redis cache: Configure based on usage"

# Performance Optimizations Checklist
echo -e "\n${BLUE}⚡ Performance Optimization Checklist${NC}"
echo "Frontend:"
echo "  [ ] Code splitting implemented"
echo "  [ ] Lazy loading for routes"
echo "  [ ] Images optimized (WebP/AVIF)"
echo "  [ ] CSS purged of unused styles"
echo "  [ ] Service worker for caching"
echo "  [ ] Compression enabled (gzip/brotli)"
echo "  [ ] CDN for static assets"
echo "\nBackend:"
echo "  [ ] Database queries optimized"
echo "  [ ] Caching strategy implemented"
echo "  [ ] Rate limiting configured"
echo "  [ ] Connection pooling enabled"
echo "  [ ] Background tasks for heavy operations"
echo "  [ ] Response compression"
echo "  [ ] Monitoring and APM configured"

# Lighthouse Metrics (if available)
echo -e "\n${YELLOW}🏁 Performance Metrics Targets${NC}"
echo "Target Web Vitals:"
echo "  - LCP (Largest Contentful Paint): < 2.5s"
echo "  - FID (First Input Delay): < 100ms"
echo "  - CLS (Cumulative Layout Shift): < 0.1"
echo "  - FCP (First Contentful Paint): < 1.8s"
echo "  - TTI (Time to Interactive): < 3.8s"

# Generate Performance Report
REPORT_FILE="performance-report.md"
echo -e "\n${GREEN}📄 Generating performance report...${NC}"
cat > $REPORT_FILE << EOF
# Performance Report

## Date: $(date)

## Frontend Bundle Analysis
- Total build size: $(du -sh apps/web/dist 2>/dev/null | cut -f1 || echo "N/A")
- Main bundle: Check dist/assets for details

## Recommendations
1. Implement code splitting for large routes
2. Use dynamic imports for heavy components
3. Enable compression in production
4. Configure CDN for static assets
5. Implement service worker for offline support

## Next Steps
- Run Lighthouse audit in production
- Set up continuous performance monitoring
- Implement performance budgets in CI/CD
EOF

echo -e "${GREEN}✅ Performance analysis complete!${NC}"
echo "Report saved to: $REPORT_FILE"

exit 0