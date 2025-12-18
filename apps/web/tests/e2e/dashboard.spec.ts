import { test, expect } from '../fixtures/auth-fixtures'
import { DashboardPage } from '../pages/dashboard-page'
import { HeavyPage } from '../pages/heavy-page'
import { TaskManagerPage } from '../pages/task-manager-page'

test.describe('Dashboard Navigation E2E Tests', () => {
  let dashboardPage: DashboardPage
  let heavyPage: HeavyPage
  let taskManagerPage: TaskManagerPage

  test.beforeEach(async ({ authenticatedPage }) => {
    dashboardPage = new DashboardPage(authenticatedPage)
    heavyPage = new HeavyPage(authenticatedPage)
    taskManagerPage = new TaskManagerPage(authenticatedPage)
  })

  test('should display dashboard correctly', async () => {
    await dashboardPage.goto()
    
    await expect(dashboardPage.sidebar).toBeVisible()
    await expect(dashboardPage.header).toBeVisible()
    await expect(dashboardPage.dashboardContent).toBeVisible()
  })

  test('should toggle sidebar correctly', async () => {
    await dashboardPage.goto()
    
    // Sidebar should be visible by default
    await dashboardPage.expectSidebarVisible()
    
    // Toggle sidebar
    await dashboardPage.toggleSidebar()
    
    // Sidebar should be collapsed
    await dashboardPage.expectSidebarCollapsed()
    
    // Toggle again
    await dashboardPage.toggleSidebar()
    
    // Sidebar should be visible again
    await dashboardPage.expectSidebarVisible()
  })

  test('should navigate to Heavy Mode page', async () => {
    await dashboardPage.goto()
    await dashboardPage.navigateToPage('heavy')
    
    await heavyPage.expectToBeOnHeavyPage()
  })

  test('should navigate to Task Manager page', async () => {
    await dashboardPage.goto()
    await dashboardPage.navigateToPage('tasks')
    
    await taskManagerPage.expectToBeOnTaskManagerPage()
  })

  test('should navigate to Chat page', async () => {
    await dashboardPage.goto()
    await dashboardPage.navigateToPage('chat')
    
    await expect(dashboardPage.page).toHaveURL('/chat')
  })

  test('should navigate to Model Control page', async () => {
    await dashboardPage.goto()
    await dashboardPage.navigateToPage('models')
    
    await expect(dashboardPage.page).toHaveURL('/models')
  })

  test('should navigate to MCP Tools page', async () => {
    await dashboardPage.goto()
    await dashboardPage.navigateToPage('tools')
    
    await expect(dashboardPage.page).toHaveURL('/tools')
  })

  test('should navigate to Monitoring page', async () => {
    await dashboardPage.goto()
    await dashboardPage.navigateToPage('monitoring')
    
    await expect(dashboardPage.page).toHaveURL('/monitoring')
  })

  test('should navigate to Settings page', async () => {
    await dashboardPage.goto()
    await dashboardPage.navigateToPage('settings')
    
    await expect(dashboardPage.page).toHaveURL('/settings')
  })

  test('should maintain navigation state across page reloads', async () => {
    await dashboardPage.goto()
    await dashboardPage.navigateToPage('heavy')
    
    // Reload page
    await dashboardPage.page.reload()
    
    // Should still be on heavy page
    await expect(dashboardPage.page).toHaveURL('/heavy')
  })

  test('should show active navigation item', async () => {
    await dashboardPage.goto()
    await dashboardPage.navigateToPage('heavy')
    
    // Heavy navigation item should be active
    const heavyNavItem = dashboardPage.page.locator('[data-testid="nav-heavy"]')
    await expect(heavyNavItem).toHaveClass(/active|selected/)
  })

  test('should handle sidebar responsive behavior', async ({ page }) => {
    await dashboardPage.goto()
    
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Sidebar should be hidden on mobile by default
    await expect(dashboardPage.sidebar).not.toBeVisible()
    
    // Click menu button to open sidebar
    const menuButton = page.locator('[data-testid="mobile-menu-button"]')
    await menuButton.click()
    
    // Sidebar should be visible
    await expect(dashboardPage.sidebar).toBeVisible()
  })
})