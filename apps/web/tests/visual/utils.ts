import { Page } from '@playwright/test'

/**
 * Wait for page to be fully loaded including animations
 */
export async function waitForPageToBeStable(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500) // Wait for animations
}

/**
 * Switch theme between light and dark mode
 */
export async function switchTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  // Look for theme toggle button - this will depend on your implementation
  const themeToggle = page.locator('[data-theme-toggle], [aria-label*="theme"], [aria-label*="dark"], [aria-label*="light"]').first()
  
  if (await themeToggle.isVisible()) {
    await themeToggle.click()
    await page.waitForTimeout(300) // Wait for theme transition
  }
}

/**
 * Take a screenshot with consistent naming
 */
export async function takeScreenshot(
  page: Page, 
  name: string, 
  options?: { fullPage?: boolean; threshold?: number }
): Promise<void> {
  await waitForPageToBeStable(page)
  
  const screenshotOptions = {
    fullPage: options?.fullPage || false,
    animations: 'disabled' as const,
  }
  
  await expect(page).toHaveScreenshot(`${name}.png`, {
    ...screenshotOptions,
    threshold: options?.threshold || 0.1,
  })
}

/**
 * Test responsive design at different breakpoints
 */
export async function testResponsiveBreakpoints(
  page: Page,
  testName: string,
  breakpoints: Array<{ width: number; height: number; name: string }>
): Promise<void> {
  for (const breakpoint of breakpoints) {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
    await page.waitForTimeout(200) // Wait for responsive layout
    
    await takeScreenshot(
      page,
      `${testName}-${breakpoint.name}`,
      { fullPage: true, threshold: 0.1 }
    )
  }
}

/**
 * Simulate loading states
 */
export async function simulateLoadingState(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector)
  if (await element.isVisible()) {
    // Add loading class or attribute
    await element.evaluate((el) => {
      el.setAttribute('data-loading', 'true')
    })
  }
}

/**
 * Test error states by triggering errors
 */
export async function testErrorStates(page: Page, testName: string): Promise<void> {
  // This will depend on your error handling implementation
  // You might need to mock API responses or trigger specific error conditions
  
  // Example: Test error boundary
  try {
    await page.evaluate(() => {
      throw new Error('Test error for visual regression')
    })
    await page.waitForTimeout(500)
  } catch (e) {
    // Expected error for testing
  }
  
  await takeScreenshot(page, `${testName}-error-state`, { fullPage: true })
}

/**
 * Test accessibility features visually
 */
export async function testAccessibilityVisual(page: Page, testName: string): Promise<void> {
  // Check for focus indicators
  const focusableElements = page.locator('button, [tabindex], input, select, textarea, a')
  const count = await focusableElements.count()
  
  if (count > 0) {
    await focusableElements.first().focus()
    await page.waitForTimeout(200)
    await takeScreenshot(page, `${testName}-focus-state`)
  }
  
  // Test high contrast mode simulation
  await page.addStyleTag({
    content: `
      * {
        filter: contrast(150%) brightness(120%);
      }
    `
  })
  await takeScreenshot(page, `${testName}-high-contrast`, { fullPage: true })
}

/**
 * Common test data for visual tests
 */
export const visualTestConfig = {
  breakpoints: [
    { width: 320, height: 568, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1024, height: 768, name: 'desktop-small' },
    { width: 1440, height: 900, name: 'desktop' },
    { width: 1920, height: 1080, name: 'desktop-large' },
  ],
  themes: ['light', 'dark'] as const,
  animationWaitTime: 500,
}