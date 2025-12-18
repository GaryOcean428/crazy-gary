import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly registerLink: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('[data-testid="email-input"]')
    this.passwordInput = page.locator('[data-testid="password-input"]')
    this.loginButton = page.locator('[data-testid="login-button"]')
    this.registerLink = page.locator('[data-testid="register-link"]')
    this.errorMessage = page.locator('[data-testid="error-message"]')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async loginWithDemo() {
    await this.login('demo@crazy-gary.ai', 'demo123')
  }

  async expectToBeLoggedIn() {
    await expect(this.page).toHaveURL(/.*dashboard.*|.*\//)
    await expect(this.page.locator('[data-testid="sidebar"]')).toBeVisible()
  }

  async expectErrorMessage(text: string) {
    await expect(this.errorMessage).toContainText(text)
  }

  async expectValidationError(field: 'email' | 'password') {
    const input = field === 'email' ? this.emailInput : this.passwordInput
    await expect(input).toHaveAttribute('aria-invalid', 'true')
  }
}