#!/usr/bin/env node

/**
 * Test runner script for Crazy-Gary application
 * Provides comprehensive testing capabilities with coverage reporting
 */

import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import chalk from 'chalk'

// Configuration
const CONFIG = {
  testDir: resolve(__dirname, '../src/__tests__'),
  coverageDir: resolve(__dirname, '../coverage'),
  reportsDir: resolve(__dirname, '../test-reports'),
  vitestConfig: resolve(__dirname, '../vitest.config.js'),
  
  // Test categories
  categories: {
    unit: 'Unit Tests',
    integration: 'Integration Tests', 
    e2e: 'End-to-End Tests',
    ui: 'UI Component Tests',
    hooks: 'Custom Hook Tests',
    utils: 'Utility Tests',
    cache: 'Cache Tests',
    api: 'API Tests',
    contexts: 'Context Tests',
  },
  
  // Coverage thresholds
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

const createDirectories = () => {
  const dirs = [CONFIG.coverageDir, CONFIG.reportsDir]
  
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      log(`Created directory: ${dir}`, 'cyan')
    }
  })
}

const runCommand = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })
    
    child.on('error', (error) => {
      reject(error)
    })
  })
}

// Test runners
const runAllTests = async (watch = false, coverage = true) => {
  log('\n🧪 Running All Tests', 'bright')
  log('====================================', 'blue')
  
  createDirectories()
  
  const args = [
    'npx', 'vitest',
    'run',
    '--config', CONFIG.vitestConfig,
    '--reporter', 'verbose',
  ]
  
  if (coverage) {
    args.push('--coverage')
  }
  
  if (watch) {
    args.push('--watch')
  }
  
  try {
    await runCommand('node', args, { cwd: resolve(__dirname, '..') })
    log('\n✅ All tests passed!', 'green')
  } catch (error) {
    log(`\n❌ Tests failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

const runTestsByCategory = async (category, watch = false) => {
  log(`\n🧪 Running ${CONFIG.categories[category]} Tests`, 'bright')
  log('=========================================', 'blue')
  
  const patterns = {
    unit: ['src/__tests__/utils/**/*.test.{ts,tsx}', 'src/__tests__/lib/**/*.test.{ts,tsx}'],
    integration: ['src/__tests__/integration/**/*.test.{ts,tsx}'],
    e2e: ['src/__tests__/e2e/**/*.test.{ts,tsx}'],
    ui: ['src/__tests__/ui/**/*.test.{ts,tsx}', 'src/__tests__/components/**/*.test.{ts,tsx}'],
    hooks: ['src/__tests__/hooks/**/*.test.{ts,tsx}'],
    utils: ['src/__tests__/utils/**/*.test.{ts,tsx}'],
    cache: ['src/__tests__/cache/**/*.test.{ts,tsx}'],
    api: ['src/__tests__/api/**/*.test.{ts,tsx}'],
    contexts: ['src/__tests__/contexts/**/*.test.{ts,tsx}'],
  }
  
  const args = [
    'npx', 'vitest',
    'run',
    '--config', CONFIG.vitestConfig,
    '--reporter', 'verbose',
    '--coverage',
  ]
  
  // Add test patterns
  if (patterns[category]) {
    args.push(...patterns[category])
  }
  
  if (watch) {
    args.push('--watch')
  }
  
  try {
    await runCommand('node', args, { cwd: resolve(__dirname, '..') })
    log(`\n✅ ${CONFIG.categories[category]} passed!`, 'green')
  } catch (error) {
    log(`\n❌ ${CONFIG.categories[category]} failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

const runTestsWithCoverage = async () => {
  log('\n📊 Running Tests with Coverage Report', 'bright')
  log('=========================================', 'blue')
  
  createDirectories()
  
  const args = [
    'npx', 'vitest',
    'run',
    '--config', CONFIG.vitestConfig,
    '--coverage',
    '--reporter', 'verbose',
  ]
  
  try {
    await runCommand('node', args, { cwd: resolve(__dirname, '..') })
    
    log('\n📈 Coverage Report Generated', 'green')
    log(`   HTML Report: ${join(CONFIG.coverageDir, 'index.html')}`, 'cyan')
    log(`   JSON Report: ${join(CONFIG.coverageDir, 'coverage-final.json')}`, 'cyan')
    
    // Check coverage thresholds
    await checkCoverageThresholds()
    
  } catch (error) {
    log(`\n❌ Coverage tests failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

const checkCoverageThresholds = async () => {
  const coverageFile = join(CONFIG.coverageDir, 'coverage-final.json')
  
  if (!existsSync(coverageFile)) {
    log('⚠️  Coverage file not found, skipping threshold check', 'yellow')
    return
  }
  
  try {
    const { readFileSync } = await import('fs')
    const coverageData = JSON.parse(readFileSync(coverageFile, 'utf8'))
    
    // Calculate overall coverage
    const total = Object.values(coverageData).reduce((acc, file) => {
      const { s, f, b, l } = file
      return {
        statements: acc.statements + s,
        functions: acc.functions + f,
        branches: acc.branches + b,
        lines: acc.lines + l,
      }
    }, { statements: 0, functions: 0, branches: 0, lines: 0 })
    
    const calculatePercentage = (covered, total) => 
      total > 0 ? ((covered / total) * 100).toFixed(2) : '0.00'
    
    log('\n📊 Coverage Summary', 'bright')
    log('====================', 'blue')
    
    Object.entries(total).forEach(([key, value]) => {
      const percentage = calculatePercentage(value, value)
      const status = parseFloat(percentage) >= CONFIG.thresholds[key] ? '✅' : '❌'
      const color = parseFloat(percentage) >= CONFIG.thresholds[key] ? 'green' : 'red'
      
      log(`${status} ${key.charAt(0).toUpperCase() + key.slice(1)}: ${percentage}%`, color)
    })
    
  } catch (error) {
    log(`⚠️  Could not read coverage data: ${error.message}`, 'yellow')
  }
}

const runWatchMode = () => {
  log('\n👀 Starting Watch Mode', 'bright')
  log('=======================', 'blue')
  
  const args = [
    'npx', 'vitest',
    'run',
    '--config', CONFIG.vitestConfig,
    '--watch',
    '--reporter', 'verbose',
  ]
  
  runCommand('node', args, { cwd: resolve(__dirname, '..') })
}

const runPerformanceTests = async () => {
  log('\n⚡ Running Performance Tests', 'bright')
  log('==============================', 'blue')
  
  const args = [
    'npx', 'vitest',
    'run',
    '--config', CONFIG.vitestConfig,
    '--grep', 'performance|Performance',
    '--reporter', 'verbose',
  ]
  
  try {
    await runCommand('node', args, { cwd: resolve(__dirname, '..') })
    log('\n✅ Performance tests passed!', 'green')
  } catch (error) {
    log(`\n❌ Performance tests failed: ${error.message}`, 'red')
  }
}

const runAccessibilityTests = async () => {
  log('\n♿ Running Accessibility Tests', 'bright')
  log('================================', 'blue')
  
  const args = [
    'npx', 'vitest',
    'run',
    '--config', CONFIG.vitestConfig,
    '--grep', 'accessibility|Accessibility|aria|ARIA',
    '--reporter', 'verbose',
  ]
  
  try {
    await runCommand('node', args, { cwd: resolve(__dirname, '..') })
    log('\n✅ Accessibility tests passed!', 'green')
  } catch (error) {
    log(`\n❌ Accessibility tests failed: ${error.message}`, 'red')
  }
}

// Main CLI interface
const main = async () => {
  const args = process.argv.slice(2)
  const command = args[0]
  
  log('🚀 Crazy-Gary Test Runner', 'bright')
  log('=========================', 'blue')
  
  switch (command) {
    case 'all':
      await runAllTests(false, true)
      break
      
    case 'watch':
      await runAllTests(true, false)
      break
      
    case 'coverage':
      await runTestsWithCoverage()
      break
      
    case 'unit':
    case 'integration':
    case 'e2e':
    case 'ui':
    case 'hooks':
    case 'utils':
    case 'cache':
    case 'api':
    case 'contexts':
      await runTestsByCategory(command, args.includes('--watch'))
      break
      
    case 'performance':
      await runPerformanceTests()
      break
      
    case 'accessibility':
      await runAccessibilityTests()
      break
      
    case 'watch-ui':
      runWatchMode()
      break
      
    case 'help':
      showHelp()
      break
      
    default:
      log('\n📖 Usage:', 'cyan')
      showHelp()
      process.exit(1)
  }
}

const showHelp = () => {
  log('\nAvailable Commands:', 'bright')
  log('===================', 'blue')
  
  log('\n🎯 Main Commands:', 'yellow')
  log('  test-runner all          - Run all tests with coverage')
  log('  test-runner coverage     - Run tests with detailed coverage report')
  log('  test-runner watch        - Run all tests in watch mode')
  log('  test-runner watch-ui     - Run tests with UI interface')
  
  log('\n🏷️  Test Categories:', 'yellow')
  Object.entries(CONFIG.categories).forEach(([key, value]) => {
    log(`  test-runner ${key.padEnd(12)} - Run ${value}`)
  })
  
  log('\n🔍 Specialized Tests:', 'yellow')
  log('  test-runner performance  - Run performance tests only')
  log('  test-runner accessibility - Run accessibility tests only')
  
  log('\n💡 Examples:', 'cyan')
  log('  npm run test:coverage')
  log('  npm run test:watch')
  log('  node scripts/test-runner.js unit')
  log('  node scripts/test-runner.js integration --watch')
  
  log('\n📊 Coverage Targets:', 'magenta')
  Object.entries(CONFIG.thresholds).forEach(([key, value]) => {
    log(`  ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}%`)
  })
}

// Error handling
process.on('unhandledRejection', (reason) => {
  log(`\n❌ Unhandled rejection: ${reason}`, 'red')
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  log(`\n❌ Uncaught exception: ${error.message}`, 'red')
  process.exit(1)
})

// Run main function
main().catch((error) => {
  log(`\n❌ Test runner error: ${error.message}`, 'red')
  process.exit(1)
})
