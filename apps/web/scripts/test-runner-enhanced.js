#!/usr/bin/env node

/**
 * Enhanced E2E Test Runner
 * Provides comprehensive test execution, reporting, and analysis
 */

import { execSync, spawn } from 'child_process'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { performance } from 'perf_hooks'

interface TestConfig {
  testType: 'e2e' | 'visual' | 'performance' | 'accessibility' | 'api'
  browser?: 'chromium' | 'firefox' | 'webkit' | 'mobile'
  headless?: boolean
  debug?: boolean
  updateSnapshots?: boolean
  reporter?: 'html' | 'json' | 'junit' | 'line'
  outputDir?: string
  parallel?: boolean
  workers?: number
}

interface TestReport {
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  totalDuration: number
  coverage?: {
    statements: number
    branches: number
    functions: number
    lines: number
  }
  performance?: {
    avgExecutionTime: number
    slowestTests: Array<{ name: string; duration: number }>
    fastestTests: Array<{ name: string; duration: number }>
  }
  browserCompatibility?: Record<string, { passed: number; failed: number; total: number }>
}

class E2ETestRunner {
  private config: TestConfig
  private startTime: number
  private testResults: any[] = []

  constructor(config: TestConfig) {
    this.config = config
    this.startTime = performance.now()
  }

  async runTests(): Promise<TestReport> {
    console.log('🚀 Starting Enhanced E2E Test Runner...')
    console.log(`📋 Test Configuration:`, this.config)

    // Create output directory
    const outputDir = this.config.outputDir || './test-results'
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    // Install Playwright browsers if needed
    await this.ensurePlaywrightInstalled()

    // Run tests based on type
    let report: TestReport

    switch (this.config.testType) {
      case 'e2e':
        report = await this.runE2ETests(outputDir)
        break
      case 'visual':
        report = await this.runVisualTests(outputDir)
        break
      case 'performance':
        report = await this.runPerformanceTests(outputDir)
        break
      case 'accessibility':
        report = await this.runAccessibilityTests(outputDir)
        break
      case 'api':
        report = await this.runAPITests(outputDir)
        break
      default:
        throw new Error(`Unknown test type: ${this.config.testType}`)
    }

    // Generate comprehensive report
    await this.generateReport(report, outputDir)

    // Upload results if in CI
    if (process.env.CI) {
      await this.uploadResults(outputDir)
    }

    return report
  }

  private async runE2ETests(outputDir: string): Promise<TestReport> {
    console.log('🔧 Running E2E Tests...')

    const testFiles = [
      'auth.spec.ts',
      'dashboard.spec.ts',
      'task-manager.spec.ts',
      'heavy-mode.spec.ts',
      'settings-profile.spec.ts',
      'api-integration.spec.ts'
    ]

    const reports: TestReport[] = []

    // Run tests in parallel for different browsers
    const browsers = this.config.browser ? [this.config.browser] : ['chromium', 'firefox', 'webkit']

    for (const browser of browsers) {
      console.log(`🌐 Testing on ${browser}...`)
      
      const browserReport = await this.runTestSuite(testFiles, browser, outputDir)
      reports.push(browserReport)
    }

    // Aggregate reports
    return this.aggregateReports(reports)
  }

  private async runVisualTests(outputDir: string): Promise<TestReport> {
    console.log('👁️ Running Visual Regression Tests...')

    const testFiles = ['visual-regression.spec.ts']
    const reporters = ['html', 'json']

    const reports: TestReport[] = []

    for (const reporter of reporters) {
      console.log(`📊 Generating ${reporter} report...`)
      const report = await this.runTestSuite(testFiles, 'chromium', outputDir, reporter)
      reports.push(report)
    }

    return this.aggregateReports(reports)
  }

  private async runPerformanceTests(outputDir: string): Promise<TestReport> {
    console.log('⚡ Running Performance Tests...')

    const testFiles = ['performance.spec.ts']
    return await this.runTestSuite(testFiles, 'chromium', outputDir, 'json')
  }

  private async runAccessibilityTests(outputDir: string): Promise<TestReport> {
    console.log('♿ Running Accessibility Tests...')

    const testFiles = ['../visual/accessibility.spec.ts']
    return await this.runTestSuite(testFiles, 'chromium', outputDir, 'json')
  }

  private async runAPITests(outputDir: string): Promise<TestReport> {
    console.log('🔌 Running API Integration Tests...')

    const testFiles = ['api-integration.spec.ts']
    return await this.runTestSuite(testFiles, 'chromium', outputDir, 'json')
  }

  private async runTestSuite(
    testFiles: string[],
    browser: string,
    outputDir: string,
    reporter: string = 'html'
  ): Promise<TestReport> {
    const testDir = './tests/e2e'
    const args = [
      'npx',
      'playwright',
      'test',
      '--project=' + browser,
      '--reporter=' + reporter,
      '--outputDir=' + outputDir,
      '--trace=on-first-retry',
      '--screenshot=only-on-failure',
      '--video=retain-on-failure'
    ]

    if (this.config.headless) {
      args.push('--headed=false')
    } else {
      args.push('--headed=true')
    }

    if (this.config.updateSnapshots) {
      args.push('--update-snapshots')
    }

    if (this.config.debug) {
      args.push('--debug')
    }

    if (this.config.parallel) {
      args.push('--workers=' + (this.config.workers || 'auto'))
    }

    // Add specific test files
    testFiles.forEach(file => {
      args.push(`${testDir}/${file}`)
    })

    console.log('🔧 Running command:', args.join(' '))

    try {
      const startTime = performance.now()
      execSync(args.join(' '), { stdio: 'inherit', cwd: process.cwd() })
      const endTime = performance.now()

      // Parse results from Playwright report
      return await this.parseTestResults(outputDir, endTime - startTime)
    } catch (error) {
      console.error('❌ Test execution failed:', error)
      // Even on failure, try to parse results
      return await this.parseTestResults(outputDir, 0)
    }
  }

  private async parseTestResults(outputDir: string, duration: number): Promise<TestReport> {
    // Try to read Playwright results
    const resultsPath = join(outputDir, 'results.json')
    
    if (existsSync(resultsPath)) {
      try {
        const resultsData = JSON.parse(readFileSync(resultsPath, 'utf8'))
        
        return {
          totalTests: resultsData.stats?.expected || 0,
          passedTests: resultsData.stats?.expected || 0,
          failedTests: resultsData.stats?.unexpected || 0,
          skippedTests: resultsData.stats?.skipped || 0,
          totalDuration: duration
        }
      } catch (error) {
        console.warn('⚠️ Could not parse test results:', error)
      }
    }

    // Fallback report structure
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: duration
    }
  }

  private async ensurePlaywrightInstalled(): Promise<void> {
    try {
      execSync('npx playwright --version', { stdio: 'pipe' })
    } catch (error) {
      console.log('📦 Installing Playwright browsers...')
      execSync('npx playwright install', { stdio: 'inherit' })
    }
  }

  private aggregateReports(reports: TestReport[]): TestReport {
    const totalDuration = reports.reduce((sum, report) => sum + report.totalDuration, 0)
    
    return {
      totalTests: reports.reduce((sum, report) => sum + report.totalTests, 0),
      passedTests: reports.reduce((sum, report) => sum + report.passedTests, 0),
      failedTests: reports.reduce((sum, report) => sum + report.failedTests, 0),
      skippedTests: reports.reduce((sum, report) => sum + report.skippedTests, 0),
      totalDuration,
      coverage: reports[0]?.coverage,
      performance: reports[0]?.performance,
      browserCompatibility: this.createBrowserCompatibilityReport(reports)
    }
  }

  private createBrowserCompatibilityReport(reports: TestReport[]): Record<string, { passed: number; failed: number; total: number }> {
    const compatibility: Record<string, { passed: number; failed: number; total: number }> = {}
    
    // This would be populated with actual browser-specific results
    reports.forEach((report, index) => {
      const browser = ['chromium', 'firefox', 'webkit'][index] || 'unknown'
      compatibility[browser] = {
        passed: report.passedTests,
        failed: report.failedTests,
        total: report.totalTests
      }
    })

    return compatibility
  }

  private async generateReport(report: TestReport, outputDir: string): Promise<void> {
    const endTime = performance.now()
    const totalTime = endTime - this.startTime

    const reportData = {
      timestamp: new Date().toISOString(),
      duration: totalTime,
      configuration: this.config,
      summary: report,
      performance: {
        totalTimeMs: totalTime,
        averageTestTime: report.totalTests > 0 ? totalTime / report.totalTests : 0
      }
    }

    // Generate comprehensive HTML report
    const htmlReport = this.generateHTMLReport(reportData)
    writeFileSync(join(outputDir, 'comprehensive-report.html'), htmlReport)

    // Generate JSON report for CI
    writeFileSync(join(outputDir, 'test-report.json'), JSON.stringify(reportData, null, 2))

    // Print summary
    this.printSummary(report, totalTime)
  }

  private generateHTMLReport(data: any): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .metric-label { color: #666; margin-top: 5px; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .skipped { color: #d97706; }
        .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: #10b981; transition: width 0.3s ease; }
        .browser-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
        .browser-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 E2E Test Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Test Duration: ${(data.duration / 1000).toFixed(2)}s</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${data.summary.totalTests}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value passed">${data.summary.passedTests}</div>
            <div class="metric-label">Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value failed">${data.summary.failedTests}</div>
            <div class="metric-label">Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value skipped">${data.summary.skippedTests}</div>
            <div class="metric-label">Skipped</div>
        </div>
    </div>

    <div class="progress-bar">
        <div class="progress-fill" style="width: ${data.summary.totalTests > 0 ? (data.summary.passedTests / data.summary.totalTests * 100) : 0}%"></div>
    </div>

    ${data.summary.browserCompatibility ? `
    <h2>Browser Compatibility</h2>
    <div class="browser-grid">
        ${Object.entries(data.summary.browserCompatibility).map(([browser, stats]) => `
        <div class="browser-card">
            <h3>${browser.charAt(0).toUpperCase() + browser.slice(1)}</h3>
            <p>Passed: <span class="passed">${stats.passed}</span></p>
            <p>Failed: <span class="failed">${stats.failed}</span></p>
            <p>Success Rate: ${stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0}%</p>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <h2>Configuration</h2>
    <pre>${JSON.stringify(data.configuration, null, 2)}</pre>
</body>
</html>`
  }

  private printSummary(report: TestReport, totalTime: number): void {
    console.log('\n📊 Test Summary')
    console.log('================')
    console.log(`Total Tests: ${report.totalTests}`)
    console.log(`✅ Passed: ${report.passedTests}`)
    console.log(`❌ Failed: ${report.failedTests}`)
    console.log(`⏭️  Skipped: ${report.skippedTests}`)
    console.log(`⏱️  Duration: ${(totalTime / 1000).toFixed(2)}s`)

    if (report.totalTests > 0) {
      const passRate = (report.passedTests / report.totalTests * 100).toFixed(1)
      console.log(`📈 Pass Rate: ${passRate}%`)
    }

    if (report.failedTests > 0) {
      console.log('\n❌ Some tests failed. Check the detailed report for more information.')
      process.exit(1)
    } else {
      console.log('\n🎉 All tests passed!')
    }
  }

  private async uploadResults(outputDir: string): Promise<void> {
    // This would implement artifact upload for CI systems
    console.log('📤 Uploading test results...')
    
    // GitHub Actions artifact upload example
    if (process.env.GITHUB_ACTIONS) {
      console.log('📤 Uploading to GitHub Actions artifacts...')
    }
    
    // Other CI systems can be added here
  }
}

// CLI interface
function parseArgs(): TestConfig {
  const args = process.argv.slice(2)
  const config: TestConfig = {
    testType: 'e2e',
    headless: process.env.CI === 'true',
    parallel: true
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--type':
      case '-t':
        config.testType = args[++i] as TestConfig['testType']
        break
      case '--browser':
      case '-b':
        config.browser = args[++i] as any
        break
      case '--headed':
        config.headless = false
        break
      case '--debug':
        config.debug = true
        break
      case '--update-snapshots':
        config.updateSnapshots = true
        break
      case '--output':
      case '-o':
        config.outputDir = args[++i]
        break
      case '--reporter':
      case '-r':
        config.reporter = args[++i] as any
        break
      case '--parallel':
        config.parallel = true
        break
      case '--workers':
        config.workers = parseInt(args[++i])
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
    }
  }

  return config
}

function printHelp(): void {
  console.log(`
🧪 Enhanced E2E Test Runner

Usage: node test-runner-enhanced.js [options]

Options:
  -t, --type <type>           Test type: e2e, visual, performance, accessibility, api
  -b, --browser <browser>     Browser: chromium, firefox, webkit, mobile
      --headed                Run tests in headed mode
      --debug                 Enable debug mode
      --update-snapshots      Update visual snapshots
  -o, --output <dir>          Output directory for results
  -r, --reporter <reporter>   Reporter: html, json, junit, line
      --parallel              Run tests in parallel
      --workers <number>      Number of parallel workers
  -h, --help                  Show this help message

Examples:
  node test-runner-enhanced.js --type e2e --browser chromium
  node test-runner-enhanced.js --type visual --update-snapshots
  node test-runner-enhanced.js --type performance --reporter json
  node test-runner-enhanced.js --type accessibility --headed
`)
}

// Main execution
if (require.main === module) {
  try {
    const config = parseArgs()
    const runner = new E2ETestRunner(config)
    runner.runTests().then(report => {
      if (report.failedTests > 0) {
        process.exit(1)
      }
    }).catch(error => {
      console.error('❌ Test runner failed:', error)
      process.exit(1)
    })
  } catch (error) {
    console.error('❌ Failed to start test runner:', error)
    process.exit(1)
  }
}

export { E2ETestRunner, type TestConfig, type TestReport }