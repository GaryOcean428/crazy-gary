#!/usr/bin/env node

/**
 * Performance Monitor for Vite Builds
 * Monitors bundle sizes, build times, and performance budgets
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Performance Budget Configuration
const PERFORMANCE_BUDGETS = {
  TOTAL_JS: 500,      // Total JavaScript bundle should not exceed 500KB
  INITIAL_JS: 150,    // Initial JavaScript payload should not exceed 150KB
  VENDOR_JS: 200,     // Vendor chunks should not exceed 200KB each
  CHUNK_SIZE: 250,    // Individual chunks should not exceed 250KB
  CSS_SIZE: 100,      // CSS bundle should not exceed 100KB
  IMAGE_SIZE: 500,    // Individual images should not exceed 500KB
  FONT_SIZE: 100,     // Individual fonts should not exceed 100KB
  BUILD_TIME: 60      // Build should complete within 60 seconds
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function checkFileSize(filePath, budget, fileType) {
  if (!fs.existsSync(filePath)) return null
  
  const stats = fs.statSync(filePath)
  const size = stats.size
  const sizeKB = size / 1024
  
  const status = sizeKB <= budget ? '✅' : '❌'
  const color = sizeKB <= budget ? colors.green : colors.red
  
  console.log(`${color}${status} ${fileType}: ${formatBytes(size)} (Budget: ${budget}KB)${colors.reset}`)
  
  return {
    file: filePath,
    size,
    sizeKB,
    budget,
    passed: sizeKB <= budget
  }
}

function analyzeBundle() {
  console.log(`${colors.cyan}🔍 Analyzing bundle performance...${colors.reset}\n`)
  
  const distPath = path.join(__dirname, '../dist')
  const assetsPath = path.join(distPath, 'assets')
  
  if (!fs.existsSync(assetsPath)) {
    console.error(`${colors.red}❌ Dist directory not found. Run 'npm run build' first.${colors.reset}`)
    process.exit(1)
  }
  
  const results = []
  
  // Analyze JavaScript files
  const jsFiles = fs.readdirSync(assetsPath)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(assetsPath, file))
  
  let totalJS = 0
  jsFiles.forEach(file => {
    const stats = fs.statSync(file)
    totalJS += stats.size
  })
  
  // Check total JavaScript size
  const totalKBytes = totalJS / 1024
  const totalStatus = totalKBytes <= PERFORMANCE_BUDGETS.TOTAL_JS ? '✅' : '❌'
  const totalColor = totalKBytes <= PERFORMANCE_BUDGETS.TOTAL_JS ? colors.green : colors.red
  
  console.log(`${colors.cyan}📊 Bundle Analysis:${colors.reset}`)
  console.log(`${totalColor}${totalStatus} Total JavaScript: ${formatBytes(totalJS)} (Budget: ${PERFORMANCE_BUDGETS.TOTAL_JS}KB)${colors.reset}`)
  
  // Check individual file sizes
  console.log(`\n${colors.cyan}📁 Individual Files:${colors.reset}`)
  jsFiles.forEach(file => {
    const stats = fs.statSync(file)
    const sizeKB = stats.size / 1024
    const isVendor = file.includes('vendor') || file.includes('chunk')
    const budget = isVendor ? PERFORMANCE_BUDGETS.VENDOR_JS : PERFORMANCE_BUDGETS.CHUNK_SIZE
    const status = sizeKB <= budget ? '✅' : '⚠️'
    const color = sizeKB <= budget ? colors.green : colors.yellow
    
    console.log(`${color}${status} ${path.basename(file)}: ${formatBytes(stats.size)} (Budget: ${budget}KB)${colors.reset}`)
  })
  
  // Analyze CSS files
  const cssFiles = fs.readdirSync(assetsPath)
    .filter(file => file.endsWith('.css'))
    .map(file => path.join(assetsPath, file))
  
  if (cssFiles.length > 0) {
    let totalCSS = 0
    cssFiles.forEach(file => {
      const stats = fs.statSync(file)
      totalCSS += stats.size
    })
    
    const cssStatus = totalCSS <= PERFORMANCE_BUDGETS.CSS_SIZE ? '✅' : '❌'
    const cssColor = totalCSS <= PERFORMANCE_BUDGETS.CSS_SIZE ? colors.green : colors.red
    
    console.log(`\n${colors.cyan}🎨 CSS Analysis:${colors.reset}`)
    console.log(`${cssColor}${cssStatus} Total CSS: ${formatBytes(totalCSS)} (Budget: ${PERFORMANCE_BUDGETS.CSS_SIZE}KB)${colors.reset}`)
  }
  
  // Generate performance report
  const report = {
    timestamp: new Date().toISOString(),
    totals: {
      javascript: totalJS,
      css: cssFiles.reduce((acc, file) => acc + fs.statSync(file).size, 0),
      files: jsFiles.length + cssFiles.length
    },
    budgets: PERFORMANCE_BUDGETS,
    passed: totalKBytes <= PERFORMANCE_BUDGETS.TOTAL_JS,
    recommendations: generateRecommendations(totalKBytes, jsFiles)
  }
  
  // Save report
  const reportPath = path.join(__dirname, '../performance-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`\n${colors.cyan}📝 Performance report saved to: ${reportPath}${colors.reset}`)
  
  return report
}

function generateRecommendations(totalSize, jsFiles) {
  const recommendations = []
  const totalKB = totalSize / 1024
  
  if (totalKB > PERFORMANCE_BUDGETS.TOTAL_JS) {
    recommendations.push({
      type: 'critical',
      message: `Total bundle size (${totalKB.toFixed(1)}KB) exceeds budget (${PERFORMANCE_BUDGETS.TOTAL_JS}KB)`,
      actions: [
        'Implement lazy loading for route components',
        'Split vendor chunks more aggressively',
        'Remove unused dependencies',
        'Consider code splitting by feature'
      ]
    })
  }
  
  const largeFiles = jsFiles.filter(file => {
    const stats = fs.statSync(file)
    return stats.size / 1024 > PERFORMANCE_BUDGETS.CHUNK_SIZE
  })
  
  if (largeFiles.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `${largeFiles.length} chunk(s) exceed recommended size`,
      actions: [
        'Review chunk composition',
        'Implement dynamic imports',
        'Optimize dependencies'
      ]
    })
  }
  
  return recommendations
}

function runPerformanceAudit() {
  console.log(`${colors.blue}🚀 Running Performance Audit...${colors.reset}\n`)
  
  const startTime = Date.now()
  
  try {
    // Build the project
    console.log(`${colors.yellow}Building project...${colors.reset}`)
    execSync('npm run build', { stdio: 'pipe' })
    
    const buildTime = Date.now() - startTime
    const buildStatus = buildTime <= PERFORMANCE_BUDGETS.BUILD_TIME * 1000 ? '✅' : '❌'
    const buildColor = buildTime <= PERFORMANCE_BUDGETS.BUILD_TIME * 1000 ? colors.green : colors.red
    
    console.log(`\n${buildColor}${buildStatus} Build completed in ${formatTime(buildTime)} (Budget: ${PERFORMANCE_BUDGETS.BUILD_TIME}s)${colors.reset}`)
    
    // Analyze the bundle
    const report = analyzeBundle()
    
    // Display recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n${colors.yellow}💡 Recommendations:${colors.reset}`)
      report.recommendations.forEach(rec => {
        console.log(`\n${rec.type === 'critical' ? colors.red : colors.yellow}${rec.type.toUpperCase()}: ${rec.message}${colors.reset}`)
        rec.actions.forEach(action => {
          console.log(`  • ${action}`)
        })
      })
    }
    
    // Exit with appropriate code
    if (!report.passed) {
      console.log(`\n${colors.red}❌ Performance budget exceeded!${colors.reset}`)
      process.exit(1)
    } else {
      console.log(`\n${colors.green}✅ All performance budgets passed!${colors.reset}`)
      process.exit(0)
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Performance audit failed: ${error.message}${colors.reset}`)
    process.exit(1)
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--analyze')) {
    analyzeBundle()
  } else if (args.includes('--audit')) {
    runPerformanceAudit()
  } else {
    console.log(`
${colors.cyan}Performance Monitor CLI${colors.reset}

Usage:
  node scripts/performance-monitor.js --analyze    Analyze current bundle
  node scripts/performance-monitor.js --audit      Run full performance audit

Options:
  --analyze    Only analyze the built bundle
  --audit      Build and analyze (with recommendations)
    `)
  }
}

module.exports = {
  analyzeBundle,
  runPerformanceAudit,
  PERFORMANCE_BUDGETS
}