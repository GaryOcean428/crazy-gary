import { test, expect } from '../fixtures/auth-fixtures'
import { LoginPage } from '../pages/login-page'
import { DashboardPage } from '../pages/dashboard-page'

test.describe('Authentication E2E Tests', () => {
  let loginPage: LoginPage
  let dashboardPage: DashboardPage

  test.beforeEach(({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
  })

  test('should display login page correctly', async ({ page }) => {
    await loginPage.goto()
    
    await expect(page).toHaveTitle(/Crazy-Gary|Login/)
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.loginButton).toBeVisible()
    await expect(loginPage.registerLink).toBeVisible()
  })

  test('should login successfully with demo credentials', async ({ page }) => {
    await loginPage.goto()
    await loginPage.loginWithDemo()
    await loginPage.expectToBeLoggedIn()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.goto()
    await loginPage.login('invalid@example.com', 'wrongpassword')
    await loginPage.expectErrorMessage(/Invalid|Incorrect|Credentials/)
  })

  test('should validate required fields', async ({ page }) => {
    await loginPage.goto()
    
    // Try to login without email
    await loginPage.passwordInput.fill('password')
    await loginPage.loginButton.click()
    await loginPage.expectValidationError('email')
    
    // Try to login without password
    await loginPage.emailInput.fill('test@example.com')
    await loginPage.passwordInput.clear()
    await loginPage.loginButton.click()
    await loginPage.expectValidationError('password')
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await loginPage.goto()
    await loginPage.loginWithDemo()
    
    await expect(page).toHaveURL(/.*dashboard.*|.*\//)
    await expect(dashboardPage.sidebar).toBeVisible()
  })

  test('should handle demo mode correctly', async ({ page }) => {
    // Set demo mode
    await page.evaluate(() => {
      localStorage.setItem('demo_mode', 'true')
      localStorage.setItem('auth_token', 'demo-token')
    })
    
    await page.goto('/')
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard.*|.*\//)
    await expect(dashboardPage.sidebar).toBeVisible()
  })

  test('should logout successfully', async ({ authenticatedPage }) => {
    await dashboardPage.logout()
    await dashboardPage.expectToBeLoggedOut()
    
    // Verify localStorage is cleared
    const token = await authenticatedPage.evaluate(() => localStorage.getItem('auth_token'))
    expect(token).toBeNull()
  })

  test('should persist login state across page reloads', async ({ authenticatedPage }) => {
    // User should be logged in
    await expect(dashboardPage.sidebar).toBeVisible()
    
    // Reload page
    await authenticatedPage.reload()
    
    // Should still be logged in
    await expect(dashboardPage.sidebar).toBeVisible()
  })

  test('should redirect to login when accessing protected routes without auth', async ({ page }) => {
    // Clear localStorage to simulate no auth
    await page.evaluate(() => localStorage.clear())
    
    // Try to access protected route
    await page.goto('/')
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })
})