#!/usr/bin/env node

/**
 * Build Optimization Script
 * Orchestrates the entire build process with performance optimizations
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

class BuildOptimizer {
  constructor() {
    this.buildStartTime = Date.now()
    this.config = {
      analyze: process.argv.includes('--analyze'),
      optimize: process.argv.includes('--optimize'),
      budget: process.argv.includes('--budget'),
      preload: process.argv.includes('--preload'),
      monitor: process.argv.includes('--monitor')
    }
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`)
  }

  async runCommand(command, description) {
    this.log(`\n${colors.blue}🔄 ${description}${colors.reset}`)
    this.log(`Running: ${command}`)
    
    try {
      const result = execSync(command, { 
        stdio: 'inherit',
        encoding: 'utf8'
      })
      this.log(`${colors.green}✅ ${description} completed${colors.reset}`)
      return true
    } catch (error) {
      this.log(`${colors.red}❌ ${description} failed: ${error.message}${colors.reset}`)
      return false
    }
  }

  async cleanPreviousBuild() {
    this.log(`${colors.yellow}🧹 Cleaning previous build artifacts...${colors.reset}`)
    
    const distPath = path.join(__dirname, '../dist')
    const cachePath = path.join(__dirname, '../node_modules/.vite')
    
    try {
      if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true })
        this.log('  ✅ Removed dist directory')
      }
      
      if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true, force: true })
        this.log('  ✅ Cleared Vite cache')
      }
      
      return true
    } catch (error) {
      this.log(`${colors.red}  ❌ Failed to clean: ${error.message}${colors.reset}`)
      return false
    }
  }

  async optimizeDependencies() {
    this.log(`${colors.magenta}📦 Optimizing dependencies...${colors.reset}`)
    
    // Check for unused dependencies
    const packageJsonPath = path.join(__dirname, '../package.json')
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // List potential unused dependencies
      const potentialUnused = [
        '@types/node', // Only needed for development
        'vitest', // Test dependency
        'eslint', // Linting dependency
        'prettier' // Formatting dependency
      ]
      
      this.log('  💡 Consider removing these dev dependencies in production:')
      potentialUnused.forEach(dep => {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          this.log(`    • ${dep}`)
        }
      })
    }
    
    return true
  }

  async generateBundle() {
    this.log(`${colors.cyan}🏗️ Generating optimized bundle...${colors.reset}`)
    
    const buildCommand = 'npm run build:production'
    const success = await this.runCommand(buildCommand, 'Building optimized bundle')
    
    if (!success) {
      return false
    }
    
    // Analyze bundle if requested
    if (this.config.analyze) {
      await this.analyzeBundle()
    }
    
    return true
  }

  async analyzeBundle() {
    this.log(`${colors.magenta}🔍 Analyzing bundle composition...${colors.reset}`)
    
    try {
      const analyzerCommand = 'npm run analyze'
      await this.runCommand(analyzerCommand, 'Bundle analysis')
      
      // Open analysis report if in development
      if (process.env.NODE_ENV === 'development') {
        const reportPath = path.join(__dirname, '../dist/stats.html')
        if (fs.existsSync(reportPath)) {
          this.log(`  📊 Analysis report: ${reportPath}`)
        }
      }
      
      return true
    } catch (error) {
      this.log(`${colors.red}  ❌ Bundle analysis failed: ${error.message}${colors.reset}`)
      return false
    }
  }

  async validatePerformanceBudgets() {
    this.log(`${colors.yellow}🎯 Validating performance budgets...${colors.reset}`)
    
    try {
      // Run performance monitor
      const monitorCommand = 'node scripts/performance-monitor.js --analyze'
      await this.runCommand(monitorCommand, 'Performance budget validation')
      
      return true
    } catch (error) {
      this.log(`${colors.red}  ❌ Performance validation failed: ${error.message}${colors.reset}`)
      return false
    }
  }

  async generatePreloadHints() {
    this.log(`${colors.cyan}⚡ Generating resource preloading hints...${colors.reset}`)
    
    const distPath = path.join(__dirname, '../dist')
    const indexPath = path.join(distPath, 'index.html')
    
    if (!fs.existsSync(indexPath)) {
      this.log(`${colors.red}  ❌ index.html not found${colors.reset}`)
      return false
    }
    
    try {
      let html = fs.readFileSync(indexPath, 'utf8')
      
      // Add resource preloading hints
      const preloadHints = this.generatePreloadHints()
      html = html.replace(
        '</head>',
        `  ${preloadHints}
</head>`
      )
      
      fs.writeFileSync(indexPath, html)
      this.log('  ✅ Added resource preloading hints')
      
      return true
    } catch (error) {
      this.log(`${colors.red}  ❌ Failed to add preload hints: ${error.message}${colors.reset}`)
      return false
    }
  }

  generatePreloadHints() {
    return `
  <!-- Critical resource preloading -->
  <link rel="preload" href="/assets/main.css" as="style" fetchpriority="high">
  <link rel="preload" href="/assets/main.js" as="script" fetchpriority="high">
  
  <!-- Font preloading -->
  <link rel="preload" href="/assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- DNS prefetch for external resources -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//api.example.com">
  
  <!-- Preconnect for critical third-party resources -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Route prefetching hints -->
  <link rel="prefetch" href="/dashboard">
  <link rel="prefetch" href="/analytics">`
  }

  async createServiceWorker() {
    this.log(`${colors.cyan}🔧 Creating service worker for caching...${colors.reset}`)
    
    const swPath = path.join(__dirname, '../dist/sw.js')
    
    const serviceWorkerContent = `
// Service Worker for Performance Optimization
const CACHE_NAME = 'crazy-gary-v1'
const urlsToCache = [
  '/',
  '/assets/main.css',
  '/assets/main.js',
  '/manifest.json'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      }
    )
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
`
    
    try {
      fs.writeFileSync(swPath, serviceWorkerContent)
      this.log('  ✅ Service worker created')
      
      // Register service worker in index.html
      await this.registerServiceWorker()
      
      return true
    } catch (error) {
      this.log(`${colors.red}  ❌ Failed to create service worker: ${error.message}${colors.reset}`)
      return false
    }
  }

  async registerServiceWorker() {
    const indexPath = path.join(__dirname, '../dist/index.html')
    
    if (!fs.existsSync(indexPath)) {
      return false
    }
    
    try {
      let html = fs.readFileSync(indexPath, 'utf8')
      
      const swScript = `
  <!-- Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration)
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError)
          })
      })
    }
  </script>`
      
      html = html.replace('</body>', `${swScript}
</body>`)
      
      fs.writeFileSync(indexPath, html)
      this.log('  ✅ Service worker registration added')
      
      return true
    } catch (error) {
      this.log(`${colors.red}  ❌ Failed to register service worker: ${error.message}${colors.reset}`)
      return false
    }
  }

  async optimizeAssets() {
    this.log(`${colors.magenta}🗜️ Optimizing static assets...${colors.reset}`)
    
    const distPath = path.join(__dirname, '../dist')
    
    try {
      // Optimize images (if imagemin is available)
      const imageFiles = this.getFilesByExtension(distPath, ['.jpg', '.jpeg', '.png', '.svg', '.webp'])
      
      if (imageFiles.length > 0) {
        this.log(`  📸 Found ${imageFiles.length} image files to optimize`)
        
        // Try to optimize images if imagemin is available
        try {
          const imagemin = require('imagemin')
          const imageminWebp = require('imagemin-webp')
          
          await imagemin(imageFiles, {
            destination: distPath,
            plugins: [
              imageminWebp({ quality: 80 })
            ]
          })
          
          this.log('  ✅ Images optimized with WebP compression')
        } catch (error) {
          this.log('  ⚠️  Image optimization skipped (imagemin not available)')
        }
      }
      
      // Add gzip compression headers suggestion
      const htaccessContent = `
# Compression for performance
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache control for static assets
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
`
      
      const htaccessPath = path.join(distPath, '.htaccess')
      fs.writeFileSync(htaccessPath, htaccessContent)
      this.log('  ✅ Added .htaccess for compression and caching')
      
      return true
    } catch (error) {
      this.log(`${colors.red}  ❌ Asset optimization failed: ${error.message}${colors.reset}`)
      return false
    }
  }

  getFilesByExtension(dir, extensions) {
    let files = []
    
    if (!fs.existsSync(dir)) return files
    
    const items = fs.readdirSync(dir)
    
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files = files.concat(this.getFilesByExtension(fullPath, extensions))
      } else if (extensions.some(ext => item.toLowerCase().endsWith(ext))) {
        files.push(fullPath)
      }
    })
    
    return files
  }

  async generateBuildReport() {
    this.log(`${colors.cyan}📊 Generating build report...${colors.reset}`)
    
    const buildTime = Date.now() - this.buildStartTime
    const distPath = path.join(__dirname, '../dist')
    
    let report = {
      timestamp: new Date().toISOString(),
      buildTime: buildTime / 1000,
      optimizations: {
        analyzed: this.config.analyze,
        budgets: this.config.budget,
        preloaded: this.config.preload,
        monitored: this.config.monitor
      },
      files: {},
      success: true
    }
    
    // Analyze output files
    if (fs.existsSync(distPath)) {
      const files = this.analyzeOutputFiles(distPath)
      report.files = files
    }
    
    // Save report
    const reportPath = path.join(__dirname, '../build-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    this.log(`  📄 Build report saved: ${reportPath}`)
    this.log(`  ⏱️  Total build time: ${(buildTime / 1000).toFixed(2)}s`)
    
    return report
  }

  analyzeOutputFiles(dir) {
    const analysis = {}
    
    const analyzeDirectory = (currentDir, baseName = '') => {
      const items = fs.readdirSync(currentDir)
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        const name = baseName ? `${baseName}/${item}` : item
        
        if (stat.isDirectory()) {
          analyzeDirectory(fullPath, name)
        } else {
          const ext = path.extname(item).toLowerCase()
          const size = stat.size
          
          if (!analysis[ext]) {
            analysis[ext] = { count: 0, totalSize: 0, files: [] }
          }
          
          analysis[ext].count++
          analysis[ext].totalSize += size
          analysis[ext].files.push({
            name,
            size,
            sizeFormatted: this.formatBytes(size)
          })
        }
      })
    }
    
    analyzeDirectory(dir)
    return analysis
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  async run() {
    this.log(`${colors.green}🚀 Starting optimized build process...${colors.reset}`)
    
    const steps = [
      { name: 'Clean previous build', fn: () => this.cleanPreviousBuild() },
      { name: 'Optimize dependencies', fn: () => this.optimizeDependencies() },
      { name: 'Generate bundle', fn: () => this.generateBundle() },
      { name: 'Validate performance budgets', fn: () => this.validatePerformanceBudgets() },
      { name: 'Generate preload hints', fn: () => this.generatePreloadHints() },
      { name: 'Create service worker', fn: () => this.createServiceWorker() },
      { name: 'Optimize assets', fn: () => this.optimizeAssets() },
      { name: 'Generate build report', fn: () => this.generateBuildReport() }
    ]
    
    for (const step of steps) {
      const success = await step.fn()
      if (!success) {
        this.log(`${colors.red}❌ Build failed at step: ${step.name}${colors.reset}`)
        process.exit(1)
      }
    }
    
    this.log(`${colors.green}🎉 Build optimization completed successfully!${colors.reset}`)
    this.log(`${colors.cyan}📦 Optimized build ready in dist/ directory${colors.reset}`)
  }
}

// CLI execution
if (require.main === module) {
  const optimizer = new BuildOptimizer()
  optimizer.run().catch(error => {
    console.error(`${colors.red}❌ Build optimization failed: ${error.message}${colors.reset}`)
    process.exit(1)
  })
}

module.exports = BuildOptimizer