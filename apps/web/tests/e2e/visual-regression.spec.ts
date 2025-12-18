import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { DashboardPage } from '../pages/dashboard-page'
import { HeavyPage } from '../pages/heavy-page'

test.describe('Visual Regression E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('should match login page snapshot', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match dashboard snapshot', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/')
    await authenticatedPage.waitForLoadState('networkidle')
    
    await expect(authenticatedPage).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match heavy mode page snapshot', async ({ authenticatedPage }) => {
    const heavyPage = new HeavyPage(authenticatedPage)
    await heavyPage.goto()
    await authenticatedPage.waitForLoadState('networkidle')
    
    await expect(authenticatedPage).toHaveScreenshot('heavy-mode.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match heavy mode execution state', async ({ authenticatedPage }) => {
    const heavyPage = new HeavyPage(authenticatedPage)
    await heavyPage.goto()
    
    await heavyPage.executeTask('Visual test query', 3)
    
    // Take screenshot during execution
    await expect(authenticatedPage).toHaveScreenshot('heavy-mode-executing.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match task manager page snapshot', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tasks')
    await authenticatedPage.waitForLoadState('networkidle')
    
    await expect(authenticatedPage).toHaveScreenshot('task-manager.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match collapsed sidebar state', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()
    
    await dashboardPage.toggleSidebar()
    await authenticatedPage.waitForTimeout(500) // Wait for animation
    
    await expect(authenticatedPage).toHaveScreenshot('dashboard-sidebar-collapsed.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match mobile responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('login-mobile.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match dark theme state', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Set dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    
    await page.waitForTimeout(500) // Wait for theme transition
    
    await expect(page).toHaveScreenshot('dashboard-dark-theme.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match loading states', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/heavy')
    
    // Start execution to show loading state
    await authenticatedPage.fill('[data-testid="heavy-query-input"]', 'Loading state test')
    await authenticatedPage.click('[data-testid="heavy-execute-button"]')
    
    // Capture loading spinner state
    await expect(authenticatedPage).toHaveScreenshot('heavy-mode-loading.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match error states', async ({ page }) => {
    await page.goto('/login')
    
    // Trigger error state
    await page.fill('[data-testid="email-input"]', 'invalid')
    await page.fill('[data-testid="password-input"]', 'invalid')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('login-error-state.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match form validation states', async ({ page }) => {
    await page.goto('/login')
    
    // Show validation errors
    await page.click('[data-testid="login-button"]') // Click without filling
    
    await expect(page).toHaveScreenshot('login-validation-errors.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match dropdown and modal states', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/')
    
    // Open user menu
    await authenticatedPage.click('[data-testid="user-menu"]')
    
    await expect(authenticatedPage).toHaveScreenshot('user-dropdown-open.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match navigation active states', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()
    
    // Navigate to heavy page
    await dashboardPage.navigateToPage('heavy')
    
    // Should show heavy page with active navigation
    await expect(authenticatedPage).toHaveScreenshot('navigation-active-heavy.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match different browser sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1366, height: 768, name: 'desktop-medium' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
        maxDiffPixelRatio: 0.01
      })
    }
  })

  test('should match content with long text', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/heavy')
    
    // Fill with long content
    await authenticatedPage.fill('[data-testid="heavy-query-input"]', 
      'This is a very long query that should test how the interface handles extended content and whether the layout adapts properly to accommodate the additional text without breaking or causing visual issues in the user interface components.')
    
    await expect(authenticatedPage).toHaveScreenshot('heavy-mode-long-text.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match empty states', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tasks')
    
    // Clear any existing tasks to show empty state
    // (This depends on your task management implementation)
    
    await expect(authenticatedPage).toHaveScreenshot('tasks-empty-state.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match data-rich states', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/monitoring')
    
    await expect(authenticatedPage).toHaveScreenshot('monitoring-data-rich.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match complex form layouts', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings')
    
    await expect(authenticatedPage).toHaveScreenshot('settings-complex-form.png', {
      maxDiffPixelRatio: 0.01
    })
  })

  test('should match animation states', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage)
    await dashboardPage.goto()
    
    // Trigger sidebar toggle animation
    await dashboardPage.toggleSidebar()
    await authenticatedPage.waitForTimeout(300) // Mid-animation
    
    await expect(authenticatedPage).toHaveScreenshot('sidebar-animation-mid.png', {
      maxDiffPixelRatio: 0.01
    })
  })
})