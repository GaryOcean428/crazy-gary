import { FullConfig } from '@playwright/test'
import { startMockServer, setupTestData } from '../helpers/test-utils'

/**
 * Global setup runs once before all tests in the project.
 * This is where we set up the test environment, start mock servers,
 * and prepare test data.
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test environment setup...')
  
  // Set up demo mode for consistent testing
  process.env.DEMO_MODE = 'true'
  process.env.NODE_ENV = 'test'
  
  try {
    // Start mock API server if needed
    await startMockServer()
    
    // Set up test data
    await setupTestData()
    
    // Set up test artifacts directory
    const fs = require('fs')
    const path = require('path')
    
    const testResultsDir = path.join(process.cwd(), 'test-results')
    const screenshotsDir = path.join(testResultsDir, 'screenshots')
    const tracesDir = path.join(testResultsDir, 'traces')
    
    // Create directories if they don't exist
    for (const dir of [testResultsDir, screenshotsDir, tracesDir]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
    
    console.log('✅ Global test environment setup completed')
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}

export default globalSetup