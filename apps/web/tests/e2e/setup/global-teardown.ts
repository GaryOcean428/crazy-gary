import { FullConfig } from '@playwright/test'
import { cleanupTestData, stopMockServer } from '../helpers/test-utils'

/**
 * Global teardown runs once after all tests in the project.
 * This is where we clean up the test environment, stop servers,
 * and remove test data.
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test environment cleanup...')
  
  try {
    // Clean up test data
    await cleanupTestData()
    
    // Stop mock server
    await stopMockServer()
    
    // Clean up any test artifacts if needed
    console.log('✅ Global test environment cleanup completed')
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown