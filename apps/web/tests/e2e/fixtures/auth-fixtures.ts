import { test as base, Page, BrowserContext } from '@playwright/test'
import { setDemoMode, clearLocalStorage } from '../helpers/test-utils'

export interface TestFixtures {
  authenticatedPage: Page
  demoPage: Page
}

/**
 * Test fixtures for authentication and common page setup
 */
export const test = base.extend<TestFixtures>({
  // Create an authenticated page for testing
  authenticatedPage: async ({ page }, use) => {
    // Set up authentication state
    await setDemoMode(page)
    
    // Navigate to dashboard to establish session
    await page.goto('/')
    
    // Wait for the page to be authenticated
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 })
    
    await use(page)
  },

  // Create a page with demo mode enabled
  demoPage: async ({ page }, use) => {
    await setDemoMode(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await use(page)
  },

  // Page fixture with automatic cleanup
  page: async ({ page }, use) => {
    // Clean up localStorage before each test
    await clearLocalStorage(page)
    
    await use(page)
    
    // Clean up after test
    await clearLocalStorage(page)
  }
})

export { expect } from '@playwright/test'