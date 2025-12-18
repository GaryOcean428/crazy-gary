import { test, expect } from '../fixtures'
import { takeScreenshot, testResponsiveBreakpoints, switchTheme, visualTestConfig } from '../utils'

test.describe('Page Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Homepage', () => {
    test('should match homepage in light theme', async ({ page }) => {
      await takeScreenshot(page, 'homepage-light', { fullPage: true })
    })

    test('should match homepage in dark theme', async ({ page }) => {
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'homepage-dark', { fullPage: true })
    })

    test('should match homepage at different breakpoints', async ({ page }) => {
      await testResponsiveBreakpoints(page, 'homepage', visualTestConfig.breakpoints)
    })
  })

  test.describe('Dashboard', () => {
    test('should match dashboard page', async ({ page }) => {
      await page.goto('/dashboard')
      await takeScreenshot(page, 'dashboard-light', { fullPage: true })
    })

    test('should match dashboard page in dark theme', async ({ page }) => {
      await page.goto('/dashboard')
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'dashboard-dark', { fullPage: true })
    })

    test('should match dashboard at mobile size', async ({ page }) => {
      await page.goto('/dashboard')
      await page.setViewportSize({ width: 320, height: 568 })
      await takeScreenshot(page, 'dashboard-mobile', { fullPage: true })
    })
  })

  test.describe('Login Page', () => {
    test('should match login page', async ({ page }) => {
      await page.goto('/login')
      await takeScreenshot(page, 'login-light', { fullPage: true })
    })

    test('should match login page in dark theme', async ({ page }) => {
      await page.goto('/login')
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'login-dark', { fullPage: true })
    })

    test('should match login form states', async ({ page }) => {
      await page.goto('/login')
      
      // Test empty form
      await takeScreenshot(page, 'login-form-empty')
      
      // Test form with validation errors
      await page.fill('input[type="email"]', 'invalid-email')
      await page.fill('input[type="password"]', '123')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(500)
      await takeScreenshot(page, 'login-form-errors')
    })
  })

  test.describe('Settings Page', () => {
    test('should match settings page', async ({ page }) => {
      await page.goto('/settings')
      await takeScreenshot(page, 'settings-light', { fullPage: true })
    })

    test('should match settings page in dark theme', async ({ page }) => {
      await page.goto('/settings')
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'settings-dark', { fullPage: true })
    })

    test('should match settings form interactions', async ({ page }) => {
      await page.goto('/settings')
      
      // Test form in loading state
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.evaluate(btn => {
        btn.setAttribute('data-loading', 'true')
        btn.setAttribute('disabled', 'true')
      })
      await takeScreenshot(page, 'settings-form-loading')
    })
  })

  test.describe('Task Manager', () => {
    test('should match task manager page', async ({ page }) => {
      await page.goto('/task-manager')
      await takeScreenshot(page, 'task-manager-light', { fullPage: true })
    })

    test('should match task manager in dark theme', async ({ page }) => {
      await page.goto('/task-manager')
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'task-manager-dark', { fullPage: true })
    })

    test('should match task manager modal states', async ({ page }) => {
      await page.goto('/task-manager')
      
      // Test modal open state
      const addTaskButton = page.locator('button:has-text("Add Task"), [aria-label*="Add"]').first()
      if (await addTaskButton.isVisible()) {
        await addTaskButton.click()
        await page.waitForTimeout(300)
        await takeScreenshot(page, 'task-manager-modal-open')
      }
    })
  })

  test.describe('Chat Page', () => {
    test('should match chat page', async ({ page }) => {
      await page.goto('/chat')
      await takeScreenshot(page, 'chat-light', { fullPage: true })
    })

    test('should match chat page in dark theme', async ({ page }) => {
      await page.goto('/chat')
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'chat-dark', { fullPage: true })
    })

    test('should match chat at different breakpoints', async ({ page }) => {
      await page.goto('/chat')
      await testResponsiveBreakpoints(page, 'chat', visualTestConfig.breakpoints)
    })
  })

  test.describe('Model Control', () => {
    test('should match model control page', async ({ page }) => {
      await page.goto('/model-control')
      await takeScreenshot(page, 'model-control-light', { fullPage: true })
    })

    test('should match model control in dark theme', async ({ page }) => {
      await page.goto('/model-control')
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'model-control-dark', { fullPage: true })
    })
  })

  test.describe('Monitoring Page', () => {
    test('should match monitoring page', async ({ page }) => {
      await page.goto('/monitoring')
      await takeScreenshot(page, 'monitoring-light', { fullPage: true })
    })

    test('should match monitoring page in dark theme', async ({ page }) => {
      await page.goto('/monitoring')
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'monitoring-dark', { fullPage: true })
    })

    test('should match monitoring charts', async ({ page }) => {
      await page.goto('/monitoring')
      await page.waitForTimeout(1000) // Wait for charts to render
      await takeScreenshot(page, 'monitoring-charts', { fullPage: true })
    })
  })

  test.describe('Observability Page', () => {
    test('should match observability page', async ({ page }) => {
      await page.goto('/observability')
      await takeScreenshot(page, 'observability-light', { fullPage: true })
    })

    test('should match observability in dark theme', async ({ page }) => {
      await page.goto('/observability')
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'observability-dark', { fullPage: true })
    })
  })

  test.describe('MCP Tools', () => {
    test('should match MCP tools page', async ({ page }) => {
      await page.goto('/mcp-tools')
      await takeScreenshot(page, 'mcp-tools-light', { fullPage: true })
    })

    test('should match MCP tools in dark theme', async ({ page }) => {
      await page.goto('/mcp-tools')
      await switchTheme(page, 'dark')
      await takeScreenshot(page, 'mcp-tools-dark', { fullPage: true })
    })
  })

  test.describe('Heavy Page', () => {
    test('should match heavy page', async ({ page }) => {
      await page.goto('/heavy')
      await page.waitForTimeout(1000) // Wait for heavy content to load
      await takeScreenshot(page, 'heavy-light', { fullPage: true })
    })

    test('should match heavy page in dark theme', async ({ page }) => {
      await page.goto('/heavy')
      await switchTheme(page, 'dark')
      await page.waitForTimeout(1000)
      await takeScreenshot(page, 'heavy-dark', { fullPage: true })
    })
  })
})