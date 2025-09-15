#!/bin/bash

# Performance Monitoring and Optimization Script
# This script provides comprehensive performance analysis and optimization

set -e

echo "⚡ Crazy-Gary Performance Monitor & Optimizer"

# Bundle size analysis
analyze_bundle_size() {
    echo "📊 Analyzing bundle sizes..."
    
    cd apps/web
    npm run build
    
    echo "Frontend bundle analysis:"
    ls -lh dist/assets/*.js | awk '{print $5 "\t" $9}'
    
    echo ""
    echo "🎯 Bundle optimization recommendations:"
    echo "- Main bundle: <500KB (currently: $(du -h dist/assets/index-*.js | cut -f1))"
    echo "- Vendor bundle: <200KB (currently: $(du -h dist/assets/vendor-*.js | cut -f1))"
    echo "- Router bundle: <50KB (currently: $(du -h dist/assets/router-*.js | cut -f1))"
    
    cd ../..
}

# Build performance analysis
analyze_build_performance() {
    echo "🔨 Analyzing build performance..."
    
    start_time=$(date +%s)
    npm run build > /dev/null 2>&1
    end_time=$(date +%s)
    build_time=$((end_time - start_time))
    
    echo "Build time: ${build_time}s"
    
    if [ $build_time -gt 60 ]; then
        echo "⚠️  Build time is slow (>60s). Consider:"
        echo "   - Enabling build caching"
        echo "   - Optimizing dependencies"
        echo "   - Using parallel builds"
    else
        echo "✅ Build time is acceptable"
    fi
}

# Memory usage analysis
analyze_memory_usage() {
    echo "💾 Analyzing memory usage..."
    
    if command -v python &> /dev/null; then
        python3 << 'EOF'
try:
    import psutil
    
    # Check current memory usage
    memory = psutil.virtual_memory()
    print(f"Memory usage: {memory.percent}%")
    print(f"Available: {memory.available / (1024**3):.1f}GB")
    print(f"Total: {memory.total / (1024**3):.1f}GB")
    
    if memory.percent > 80:
        print("⚠️  High memory usage detected")
        print("   - Consider optimizing database queries")
        print("   - Check for memory leaks in long-running processes")
    else:
        print("✅ Memory usage is normal")
except ImportError:
    print("⚠️  psutil not available - skipping detailed memory analysis")
    print("✅ Using basic system memory check")
    # Basic memory check using system commands
    import os
    if os.name == 'posix':
        os.system('free -h 2>/dev/null || echo "Memory info not available"')
EOF
    else
        echo "⚠️  Python not available - skipping memory analysis"
    fi
}

# Database performance check
check_database_performance() {
    echo "🗄️  Checking database performance..."
    
    echo "Database optimization tips:"
    echo "- Add indexes for frequently queried columns"
    echo "- Use connection pooling"
    echo "- Implement query result caching"
    echo "- Monitor slow query logs"
}

# Frontend performance optimization
optimize_frontend() {
    echo "🎨 Frontend optimization recommendations:"
    echo ""
    echo "1. Code Splitting:"
    echo "   - Implement route-based code splitting"
    echo "   - Lazy load heavy components"
    echo "   - Split vendor bundles by usage frequency"
    echo ""
    echo "2. Asset Optimization:"
    echo "   - Compress images and use WebP format"
    echo "   - Enable gzip/brotli compression"
    echo "   - Implement CDN for static assets"
    echo ""
    echo "3. Runtime Optimization:"
    echo "   - Use React.memo for expensive components"
    echo "   - Implement virtual scrolling for large lists"
    echo "   - Optimize re-renders with useCallback/useMemo"
}

# API performance optimization
optimize_api() {
    echo "🔧 API optimization recommendations:"
    echo ""
    echo "1. Response Optimization:"
    echo "   - Implement response compression"
    echo "   - Use pagination for large datasets"
    echo "   - Add response caching headers"
    echo ""
    echo "2. Database Optimization:"
    echo "   - Use database connection pooling"
    echo "   - Implement query result caching"
    echo "   - Add database indexes for common queries"
    echo ""
    echo "3. Infrastructure:"
    echo "   - Use Redis for session storage"
    echo "   - Implement API rate limiting"
    echo "   - Add health check endpoints"
}

# Generate performance report
generate_report() {
    echo "📈 Generating performance report..."
    
    cat > performance-report.md << EOF
# Performance Report - $(date)

## Bundle Sizes
$(cd apps/web && ls -lh dist/assets/*.js | awk '{print "- " $9 ": " $5}')

## Build Performance
- Last build time: ${build_time}s
- Build status: $([ $build_time -gt 60 ] && echo "Needs optimization" || echo "Good")

## Recommendations
### High Priority
- [ ] Implement code splitting for large routes
- [ ] Add bundle analysis to CI/CD pipeline
- [ ] Set up performance monitoring

### Medium Priority
- [ ] Optimize image assets and add WebP support
- [ ] Implement service worker for caching
- [ ] Add database query optimization

### Low Priority
- [ ] Add performance budgets
- [ ] Implement advanced caching strategies
- [ ] Set up CDN for static assets

## Monitoring
- Set up build time tracking
- Monitor bundle size growth
- Track Core Web Vitals in production
EOF

    echo "📄 Performance report saved to performance-report.md"
}

# Main execution
main() {
    analyze_bundle_size
    echo ""
    analyze_build_performance
    echo ""
    analyze_memory_usage
    echo ""
    check_database_performance
    echo ""
    optimize_frontend
    echo ""
    optimize_api
    echo ""
    generate_report
    
    echo ""
    echo "🎉 Performance analysis complete!"
    echo "📄 Check performance-report.md for detailed recommendations"
}

# Run main function
main "$@"