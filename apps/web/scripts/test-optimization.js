#!/usr/bin/env node

/**
 * Performance Optimization Test Suite
 * Tests all optimization features and validates configuration
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

class PerformanceTest {
  constructor() {
    this.testResults = []
    this.basePath = path.join(__dirname, '..')
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`)
  }

  async testCommand(command, description) {
    try {
      this.log(`  🧪 ${description}`, colors.cyan)
      execSync(command, { cwd: this.basePath, stdio: 'pipe' })
      this.log(`  ✅ ${description} - PASSED`, colors.green)
      this.testResults.push({ test: description, status: 'PASS', error: null })
      return true
    } catch (error) {
      this.log(`  ❌ ${description} - FAILED`, colors.red)
      this.log(`    Error: ${error.message}`, colors.red)
      this.testResults.push({ test: description, status: 'FAIL', error: error.message })
      return false
    }
  }

  async testFileExists(filePath, description) {
    const fullPath = path.join(this.basePath, filePath)
    if (fs.existsSync(fullPath)) {
      this.log(`  ✅ ${description} - EXISTS`, colors.green)
      this.testResults.push({ test: description, status: 'PASS', error: null })
      return true
    } else {
      this.log(`  ❌ ${description} - MISSING`, colors.red)
      this.testResults.push({ test: description, status: 'FAIL', error: 'File not found' })
      return false
    }
  }

  async testConfiguration() {
    this.log(`${colors.magenta}🔧 Testing Configuration...${colors.reset}`)
    
    const configTests = [
      { file: 'vite.config.ts', desc: 'Vite configuration file' },
      { file: 'scripts/performance-monitor.js', desc: 'Performance monitor script' },
      { file: 'scripts/build-optimizer.js', desc: 'Build optimizer script' },
      { file: 'scripts/resource-preloader.js', desc: 'Resource preloader script' },
      { file: 'PERFORMANCE_OPTIMIZATION.md', desc: 'Performance documentation' }
    ]
    
    let allPassed = true
    for (const test of configTests) {
      const passed = await this.testFileExists(test.file, test.desc)
      allPassed = allPassed && passed
    }
    
    return allPassed
  }

  async testPackageJson() {
    this.log(`${colors.magenta}📦 Testing Package Configuration...${colors.reset}`)
    
    const packagePath = path.join(this.basePath, 'package.json')
    if (!fs.existsSync(packagePath)) {
      this.log(`  ❌ package.json not found`, colors.red)
      return false
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      
      // Check for optimization scripts
      const requiredScripts = [
        'build:optimized',
        'build:performance',
        'analyze:detailed',
        'check-performance',
        'performance:budget'
      ]
      
      let allScriptsPresent = true
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          this.log(`  ❌ Missing script: ${script}`, colors.red)
          allScriptsPresent = false
        } else {
          this.log(`  ✅ Script present: ${script}`, colors.green)
        }
      }
      
      // Check for optimization dependencies
      const requiredDeps = [
        'rollup-plugin-visualizer',
        'vite-plugin-html',
        'cssnano',
        'autoprefixer',
        'postcss'
      ]
      
      let allDepsPresent = true
      for (const dep of requiredDeps) {
        if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
          this.log(`  ❌ Missing dependency: ${dep}`, colors.red)
          allDepsPresent = false
        } else {
          this.log(`  ✅ Dependency present: ${dep}`, colors.green)
        }
      }
      
      return allScriptsPresent && allDepsPresent
    } catch (error) {
      this.log(`  ❌ Error reading package.json: ${error.message}`, colors.red)
      return false
    }
  }

  async testBuildProcess() {
    this.log(`${colors.magenta}🏗️ Testing Build Process...${colors.reset}`)
    
    // Clean before testing
    try {
      execSync('npm run clean', { cwd: this.basePath, stdio: 'pipe' })
      this.log(`  ✅ Clean build directory`, colors.green)
    } catch (error) {
      this.log(`  ⚠️  Clean failed (may not exist): ${error.message}`, colors.yellow)
    }
    
    // Test basic build
    const buildSuccess = await this.testCommand(
      'npm run build',
      'Basic build process'
    )
    
    if (!buildSuccess) {
      return false
    }
    
    // Test production build
    const prodBuildSuccess = await this.testCommand(
      'npm run build:production',
      'Production build process'
    )
    
    if (!prodBuildSuccess) {
      return false
    }
    
    return true
  }

  async testPerformanceTools() {
    this.log(`${colors.magenta}📊 Testing Performance Tools...${colors.reset}`)
    
    // Test performance monitor
    const monitorSuccess = await this.testCommand(
      'node scripts/performance-monitor.js --analyze',
      'Performance monitor analysis'
    )
    
    // Test bundle analyzer (only if dist exists)
    const distPath = path.join(this.basePath, 'dist')
    if (fs.existsSync(distPath)) {
      const analyzerSuccess = await this.testCommand(
        'npm run analyze',
        'Bundle analyzer'
      )
      
      return monitorSuccess && analyzerSuccess
    } else {
      this.log(`  ⚠️  Skipping bundle analyzer (no dist directory)`, colors.yellow)
      return monitorSuccess
    }
  }

  async testOptimizationFeatures() {
    this.log(`${colors.magenta}⚡ Testing Optimization Features...${colors.reset}`)
    
    // Test build optimizer
    const optimizerSuccess = await this.testCommand(
      'node scripts/build-optimizer.js --optimize',
      'Build optimizer process'
    )
    
    // Test resource preloader
    const preloaderSuccess = await this.testCommand(
      'npm run preload:generate',
      'Resource preloader generation'
    )
    
    return optimizerSuccess && preloaderSuccess
  }

  async testOutputArtifacts() {
    this.log(`${colors.magenta}📁 Testing Output Artifacts...${colors.reset}`)
    
    const outputTests = [
      { file: 'dist/index.html', desc: 'Built HTML file' },
      { file: 'dist/assets', desc: 'Assets directory' },
      { file: 'dist/sw.js', desc: 'Service worker' },
      { file: 'performance-report.json', desc: 'Performance report' },
      { file: 'build-report.json', desc: 'Build report' }
    ]
    
    let allPresent = true
    for (const test of outputTests) {
      const present = await this.testFileExists(test.file, test.desc)
      allPresent = allPresent && present
    }
    
    return allPresent
  }

  async runTests() {
    this.log(`${colors.green}🚀 Starting Performance Optimization Test Suite${colors.reset}\n`)
    
    const tests = [
      { name: 'Configuration', fn: () => this.testConfiguration() },
      { name: 'Package Configuration', fn: () => this.testPackageJson() },
      { name: 'Build Process', fn: () => this.testBuildProcess() },
      { name: 'Performance Tools', fn: () => this.testPerformanceTools() },
      { name: 'Optimization Features', fn: () => this.testOptimizationFeatures() },
      { name: 'Output Artifacts', fn: () => this.testOutputArtifacts() }
    ]
    
    const results = []
    
    for (const test of tests) {
      this.log(`\n${colors.blue}🧪 Running ${test.name} Tests${colors.reset}`)
      try {
        const result = await test.fn()
        results.push({ suite: test.name, result })
      } catch (error) {
        this.log(`  ❌ ${test.name} test suite failed: ${error.message}`, colors.red)
        results.push({ suite: test.name, result: false })
      }
    }
    
    this.generateTestReport(results)
  }

  generateTestReport(results) {
    this.log(`\n${colors.cyan}📊 Test Results Summary${colors.reset}`)
    
    const passed = results.filter(r => r.result).length
    const total = results.length
    
    this.log(`Total Tests: ${total}`)
    this.log(`Passed: ${passed} ${colors.green}✅${colors.reset}`)
    this.log(`Failed: ${total - passed} ${colors.red}❌${colors.reset}`)
    
    if (passed === total) {
      this.log(`\n${colors.green}🎉 All tests passed! Performance optimization is working correctly.${colors.reset}`)
      
      // Generate summary report
      const report = {
        timestamp: new Date().toISOString(),
        totalTests: total,
        passed,
        failed: total - passed,
        successRate: `${((passed / total) * 100).toFixed(1)}%`,
        testResults: this.testResults,
        suiteResults: results
      }
      
      const reportPath = path.join(this.basePath, 'test-report.json')
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
      this.log(`\n📄 Test report saved: ${reportPath}`)
    } else {
      this.log(`\n${colors.yellow}⚠️  Some tests failed. Please review the output above.${colors.reset}`)
      
      // Show failed tests
      const failedTests = this.testResults.filter(t => t.status === 'FAIL')
      if (failedTests.length > 0) {
        this.log(`\n${colors.red}❌ Failed Tests:${colors.reset}`)
        failedTests.forEach(test => {
          this.log(`  • ${test.test}: ${test.error}`, colors.red)
        })
      }
    }
    
    this.log(`\n${colors.cyan}Next Steps:${colors.reset}`)
    this.log(`• Review the performance optimization guide: PERFORMANCE_OPTIMIZATION.md`)
    this.log(`• Run performance checks: npm run performance:budget`)
    this.log(`• Analyze bundle: npm run analyze:detailed`)
    this.log(`• Check individual test results in test-report.json`)
  }
}

// CLI execution
if (require.main === module) {
  const test = new PerformanceTest()
  test.runTests().catch(error => {
    console.error(`${colors.red}❌ Test suite failed: ${error.message}${colors.reset}`)
    process.exit(1)
  })
}

module.exports = PerformanceTest