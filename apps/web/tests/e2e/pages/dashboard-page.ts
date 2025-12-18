import { Page, Locator, expect } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly sidebar: Locator
  readonly header: Locator
  readonly sidebarToggle: Locator
  readonly logoutButton: Locator
  readonly userMenu: Locator
  readonly dashboardContent: Locator

  constructor(page: Page) {
    this.page = page
    this.sidebar = page.locator('[data-testid="sidebar"]')
    this.header = page.locator('[data-testid="header"]')
    this.sidebarToggle = page.locator('[data-testid="sidebar-toggle"]')
    this.logoutButton = page.locator('[data-testid="logout-button"]')
    this.userMenu = page.locator('[data-testid="user-menu"]')
    this.dashboardContent = page.locator('[data-testid="dashboard-content"]')
  }

  async goto() {
    await this.page.goto('/')
  }

  async toggleSidebar() {
    await this.sidebarToggle.click()
  }

  async expectSidebarVisible() {
    await expect(this.sidebar).toBeVisible()
  }

  async expectSidebarCollapsed() {
    await expect(this.sidebar).toHaveClass(/collapsed|w-16/)
  }

  async openUserMenu() {
    await this.userMenu.click()
  }

  async logout() {
    await this.openUserMenu()
    await this.logoutButton.click()
  }

  async expectToBeLoggedOut() {
    await expect(this.page).toHaveURL('/login')
  }

  async expectWelcomeMessage() {
    await expect(this.dashboardContent).toContainText(/Welcome|Dashboard/)
  }

  async navigateToPage(pageName: string) {
    const navLink = this.page.locator(`[data-testid="nav-${pageName}"]`)
    await navLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  async expectOnPage(pageName: string) {
    await expect(this.page).toHaveURL(new RegExp(pageName))
  }

  async navigateToSettings() {
    // Navigate to settings page
    const settingsLink = this.page.locator('[data-testid="settings-link"]')
    await settingsLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  async openSettingsTab(tabName: string) {
    const tabLink = this.page.locator(`[data-testid="${tabName}-tab"]`)
    await tabLink.click()
  }

  async getUserInfo() {
    return {
      name: await this.page.locator('[data-testid="user-name"]').textContent(),
      email: await this.page.locator('[data-testid="user-email"]').textContent(),
      role: await this.page.locator('[data-testid="user-role"]').textContent()
    }
  }

  async expectSettingsPage() {
    await expect(this.page.locator('[data-testid="settings-page"]')).toBeVisible()
    await expect(this.page).toHaveURL(/.*settings.*/)
  }
}