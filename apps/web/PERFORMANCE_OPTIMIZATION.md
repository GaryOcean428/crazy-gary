# Performance Optimization Guide

This document outlines the comprehensive performance optimization setup for the Vite-based web application.

## 🚀 Overview

The performance optimization system includes:

- **Enhanced Bundle Splitting**: Intelligent code splitting with optimized chunk naming
- **Performance Budgets**: Automatic enforcement of size and timing limits
- **Resource Preloading**: Strategic preloading and prefetching of critical resources
- **Bundle Analysis**: Detailed visualization and monitoring tools
- **Compression & Minification**: Advanced optimization for production builds
- **Performance Monitoring**: Real-time metrics collection and reporting

## 📊 Performance Budgets

The system enforces the following performance budgets:

| Resource Type | Budget | Purpose |
|---------------|--------|---------|
| Total JavaScript | 500KB | Overall bundle size limit |
| Initial JavaScript | 150KB | Above-the-fold content |
| Vendor Chunks | 200KB each | Third-party dependencies |
| CSS Size | 100KB | Stylesheet size limit |
| Individual Chunks | 250KB | Single file size limit |
| Images | 500KB each | Image optimization |
| Fonts | 100KB each | Font file size limit |
| Build Time | 60 seconds | Build process optimization |

## 🛠️ Available Scripts

### Build Commands

```bash
# Standard build
npm run build

# Production build with optimizations
npm run build:production

# Optimized build with full analysis
npm run build:optimized

# Performance-focused build
npm run build:performance

# Build with bundle analysis
npm run build:analyze
```

### Performance Monitoring

```bash
# Analyze current bundle
npm run analyze

# Detailed performance analysis
npm run analyze:detailed

# Performance budget validation
npm run check-performance

# Performance audit with recommendations
npm run performance:budget

# Real-time performance monitoring
npm run performance:monitor

# Watch performance changes
npm run watch:performance
```

### Optimization Tools

```bash
# Clean build artifacts and cache
npm run clean

# Clean only Vite cache
npm run clean:cache

# Optimize dependencies
npm run optimize:deps

# Optimize static assets
npm run optimize:assets

# Generate resource preloading hints
npm run preload:generate

# Test preloading configuration
npm run preload:test

# Serve production build locally
npm run serve:dist

# Serve with analysis tools
npm run serve:analyze
```

## 📁 File Structure

```
scripts/
├── build-optimizer.js       # Main build optimization orchestrator
├── performance-monitor.js   # Performance monitoring and analysis
└── resource-preloader.js    # Resource preloading utilities

dist/                        # Build output directory
├── assets/                  # Optimized assets
├── index.html              # Entry HTML with preload hints
├── sw.js                   # Service worker for caching
└── .htaccess               # Compression and caching headers
```

## 🔧 Configuration Details

### Vite Configuration Features

1. **Advanced Code Splitting**
   - Vendor chunk separation
   - Route-based lazy loading
   - UI component library splitting
   - Utility library bundling

2. **Tree Shaking Optimization**
   - Dead code elimination
   - Side effect analysis
   - Module side effects configuration

3. **Resource Optimization**
   - Image optimization with WebP
   - Font preloading and optimization
   - CSS code splitting and minification

4. **Caching Strategy**
   - Hash-based cache busting
   - Long-term caching headers
   - Service worker implementation

### Bundle Analysis Features

1. **Size Monitoring**
   - Real-time bundle size tracking
   - Individual chunk analysis
   - Asset composition breakdown

2. **Performance Metrics**
   - Build time monitoring
   - Load time analysis
   - Core Web Vitals tracking

3. **Budget Enforcement**
   - Automatic budget checking
   - Failure reporting
   - Optimization recommendations

## 📈 Usage Examples

### Basic Performance Check

```bash
# Run a complete performance audit
npm run performance:budget
```

This will:
1. Build the project with production optimizations
2. Analyze bundle composition
3. Check against performance budgets
4. Generate recommendations for improvements

### Detailed Bundle Analysis

```bash
# Generate detailed bundle analysis
npm run analyze:detailed
```

This will:
1. Create a visual bundle analyzer report
2. Provide size breakdown by chunk
3. Identify optimization opportunities
4. Save results to `dist/stats.html`

### Custom Optimization

```bash
# Run custom build optimization
npm run build:optimize -- --analyze --budget --preload
```

This will:
1. Clean previous build artifacts
2. Apply all optimizations
3. Generate bundle analysis
4. Validate performance budgets
5. Add resource preloading hints

## 🎯 Optimization Strategies

### 1. Code Splitting

The configuration automatically splits:
- **React Core**: `react`, `react-dom` → `react-vendor`
- **Routing**: `react-router-dom` → `react-router`
- **UI Components**: Radix UI libraries → Multiple chunks
- **Forms**: React Hook Form + resolvers → `forms`
- **Utils**: Utility libraries → `ui-utils`
- **Data**: Data handling libraries → `data-utils`

### 2. Resource Preloading

Critical resources are automatically preloaded:
- **CSS**: Main stylesheet with `fetchpriority="high"`
- **JavaScript**: Main bundle with preload
- **Fonts**: Web fonts with crossorigin
- **Images**: Hero images and logos

### 3. Caching Strategy

- **Service Worker**: Caches critical resources
- **Cache Headers**: Long-term caching for static assets
- **Hash-based URLs**: Automatic cache invalidation

### 4. Compression

- **JavaScript**: Terser minification with advanced options
- **CSS**: PostCSS with cssnano optimization
- **HTML**: HTML minification in production
- **Images**: WebP compression where supported

## 📊 Monitoring and Alerting

### Performance Metrics

The system monitors:
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.8s

### Automated Checks

- Build time monitoring
- Bundle size tracking
- Performance budget validation
- Asset optimization verification

### Reporting

Reports are generated in:
- `performance-report.json`: Detailed metrics
- `build-report.json`: Build optimization summary
- `dist/stats.html`: Visual bundle analysis

## 🚨 Troubleshooting

### Common Issues

1. **Build Timeouts**
   ```bash
   # Increase chunk size warning limit
   # Check for circular dependencies
   # Review dependency tree
   ```

2. **Bundle Size Exceeded**
   ```bash
   # Run analysis to identify large chunks
   # Implement lazy loading
   # Remove unused dependencies
   ```

3. **Performance Budget Failures**
   ```bash
   # Review performance report
   # Implement recommended optimizations
   # Adjust budgets if necessary
   ```

### Debug Commands

```bash
# Clean everything and start fresh
npm run clean

# Check bundle composition
npm run check-bundle

# Analyze specific chunk
npm run analyze

# Monitor build performance
npm run watch:performance
```

## 🔮 Future Enhancements

Planned improvements:
- **Critical CSS Extraction**: Automatic critical CSS inlining
- **Image Optimization**: Advanced compression and format selection
- **Bundle Splitting AI**: ML-based optimal chunking
- **Performance Regression Detection**: Automated budget monitoring
- **Progressive Loading**: Advanced loading strategies

## 📚 Resources

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [Core Web Vitals](https://web.dev/vitals/)
- [Performance Budgets](https://web.dev/performance-budgets-101/)

---

For questions or issues with performance optimization, please check the build logs and performance reports generated by the scripts.