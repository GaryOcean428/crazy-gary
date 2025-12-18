import { test, expect } from '../fixtures/auth-fixtures'
import { DashboardPage } from '../pages/dashboard-page'

test.describe('Settings & Profile Management E2E Tests', () => {
  let dashboardPage: DashboardPage

  test.beforeEach(async ({ authenticatedPage }) => {
    dashboardPage = new DashboardPage(authenticatedPage)
  })

  test.describe('Profile Management', () => {
    test('should display user profile information correctly', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      
      // Verify user profile information is displayed
      await expect(authenticatedPage.locator('[data-testid="user-name"]')).toBeVisible()
      await expect(authenticatedPage.locator('[data-testid="user-email"]')).toBeVisible()
      await expect(authenticatedPage.locator('[data-testid="user-role"]')).toBeVisible()
    })

    test('should update user profile information', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Update profile information
      await authenticatedPage.fill('[data-testid="profile-name-input"]', 'Updated Test User')
      await authenticatedPage.fill('[data-testid="profile-bio-input"]', 'This is my updated bio')
      await authenticatedPage.click('[data-testid="save-profile-button"]')

      // Verify success message
      await expect(authenticatedPage.locator('[data-testid="profile-success-message"]')).toBeVisible()
    })

    test('should handle profile update validation errors', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Try to save with empty name
      await authenticatedPage.fill('[data-testid="profile-name-input"]', '')
      await authenticatedPage.click('[data-testid="save-profile-button"]')

      // Should show validation error
      await expect(authenticatedPage.locator('[data-testid="name-error-message"]')).toBeVisible()
    })

    test('should upload profile avatar', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Upload avatar
      await authenticatedPage.setInputFiles('[data-testid="avatar-upload"]', {
        name: 'test-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      })

      // Verify upload success
      await expect(authenticatedPage.locator('[data-testid="avatar-preview"]')).toBeVisible()
    })
  })

  test.describe('Account Settings', () => {
    test('should change password successfully', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Navigate to password section
      await authenticatedPage.click('[data-testid="password-tab"]')

      // Change password
      await authenticatedPage.fill('[data-testid="current-password-input"]', 'demo123')
      await authenticatedPage.fill('[data-testid="new-password-input"]', 'newpassword123')
      await authenticatedPage.fill('[data-testid="confirm-password-input"]', 'newpassword123')
      await authenticatedPage.click('[data-testid="change-password-button"]')

      // Verify success
      await expect(authenticatedPage.locator('[data-testid="password-success-message"]')).toBeVisible()
    })

    test('should validate password strength requirements', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      await authenticatedPage.click('[data-testid="password-tab"]')

      // Try weak password
      await authenticatedPage.fill('[data-testid="new-password-input"]', '123')
      await authenticatedPage.blur('[data-testid="new-password-input"]')

      // Should show password strength indicator
      await expect(authenticatedPage.locator('[data-testid="password-strength-indicator"]')).toBeVisible()
      await expect(authenticatedPage.locator('[data-testid="password-strength-weak"]')).toBeVisible()
    })

    test('should handle email preferences', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Navigate to notifications section
      await authenticatedPage.click('[data-testid="notifications-tab"]')

      // Toggle email notifications
      await authenticatedPage.click('[data-testid="email-notifications-toggle"]')
      await authenticatedPage.click('[data-testid="task-updates-toggle"]')
      await authenticatedPage.click('[data-testid="weekly-digest-toggle"]')

      // Save preferences
      await authenticatedPage.click('[data-testid="save-notifications-button"]')

      // Verify success
      await expect(authenticatedPage.locator('[data-testid="notifications-success-message"]')).toBeVisible()
    })

    test('should handle privacy settings', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Navigate to privacy section
      await authenticatedPage.click('[data-testid="privacy-tab"]')

      // Update privacy settings
      await authenticatedPage.selectOption('[data-testid="profile-visibility"]', 'private')
      await authenticatedPage.check('[data-testid="show-activity-status"]')
      await authenticatedPage.check('[data-testid="allow-analytics"]')

      // Save privacy settings
      await authenticatedPage.click('[data-testid="save-privacy-button"]')

      // Verify success
      await expect(authenticatedPage.locator('[data-testid="privacy-success-message"]')).toBeVisible()
    })
  })

  test.describe('Theme & Appearance', () => {
    test('should switch between light and dark theme', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Navigate to appearance section
      await authenticatedPage.click('[data-testid="appearance-tab"]')

      // Switch to dark theme
      await authenticatedPage.click('[data-testid="dark-theme-option"]')
      await authenticatedPage.click('[data-testid="apply-theme-button"]')

      // Verify theme change
      await expect(authenticatedPage.locator('html')).toHaveClass(/dark/)

      // Switch back to light theme
      await authenticatedPage.click('[data-testid="light-theme-option"]')
      await authenticatedPage.click('[data-testid="apply-theme-button"]')

      // Verify theme change back
      await expect(authenticatedPage.locator('html')).not.toHaveClass(/dark/)
    })

    test('should customize color scheme', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      await authenticatedPage.click('[data-testid="appearance-tab"]')

      // Select custom color scheme
      await authenticatedPage.selectOption('[data-testid="color-scheme"]', 'blue')
      await authenticatedPage.click('[data-testid="apply-theme-button"]')

      // Verify color scheme change
      await expect(authenticatedPage.locator('[data-testid="primary-color-preview"]')).toHaveCSS('background-color', /rgb\(59 130 246\)|rgb\(37 99 235\)/)
    })

    test('should save and restore theme preferences', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      await authenticatedPage.click('[data-testid="appearance-tab"]')

      // Set dark theme
      await authenticatedPage.click('[data-testid="dark-theme-option"]')
      await authenticatedPage.click('[data-testid="apply-theme-button"]')

      // Reload page to test persistence
      await authenticatedPage.reload()
      await authenticatedPage.waitForLoadState('networkidle')

      // Verify theme persisted
      await expect(authenticatedPage.locator('html')).toHaveClass(/dark/)
    })
  })

  test.describe('API & Integration Settings', () => {
    test('should manage API keys', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Navigate to API section
      await authenticatedPage.click('[data-testid="api-tab"]')

      // Generate new API key
      await authenticatedPage.click('[data-testid="generate-api-key-button"]')

      // Should show generated key
      await expect(authenticatedPage.locator('[data-testid="api-key-display"]')).toBeVisible()

      // Test API key functionality
      const apiKey = await authenticatedPage.locator('[data-testid="api-key-display"]').textContent()
      expect(apiKey).toMatch(/^sk-[a-zA-Z0-9]{32,}$/)
    })

    test('should handle webhook configurations', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      await authenticatedPage.click('[data-testid="integrations-tab"]')

      // Add webhook
      await authenticatedPage.click('[data-testid="add-webhook-button"]')
      await authenticatedPage.fill('[data-testid="webhook-name-input"]', 'Test Webhook')
      await authenticatedPage.fill('[data-testid="webhook-url-input"]', 'https://example.com/webhook')
      await authenticatedPage.selectOption('[data-testid="webhook-events"]', ['task.completed', 'agent.finished'])
      await authenticatedPage.click('[data-testid="save-webhook-button"]')

      // Verify webhook added
      await expect(authenticatedPage.locator('[data-testid="webhook-list"]')).toContainText('Test Webhook')
    })

    test('should test webhook connection', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      await authenticatedPage.click('[data-testid="integrations-tab"]')

      // Add test webhook
      await authenticatedPage.click('[data-testid="add-webhook-button"]')
      await authenticatedPage.fill('[data-testid="webhook-name-input"]', 'Test Webhook')
      await authenticatedPage.fill('[data-testid="webhook-url-input"]', 'https://httpbin.org/post')
      await authenticatedPage.click('[data-testid="test-webhook-button"]')

      // Should show test result
      await expect(authenticatedPage.locator('[data-testid="webhook-test-result"]')).toBeVisible()
      await expect(authenticatedPage.locator('[data-testid="webhook-test-success"]')).toBeVisible()
    })
  })

  test.describe('Security Settings', () => {
    test('should enable two-factor authentication', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Navigate to security section
      await authenticatedPage.click('[data-testid="security-tab"]')

      // Enable 2FA
      await authenticatedPage.click('[data-testid="enable-2fa-button"]')

      // Should show QR code for setup
      await expect(authenticatedPage.locator('[data-testid="2fa-qr-code"]')).toBeVisible()

      // Simulate 2FA code entry
      await authenticatedPage.fill('[data-testid="2fa-code-input"]', '123456')
      await authenticatedPage.click('[data-testid="verify-2fa-button"]')

      // Should show success message
      await expect(authenticatedPage.locator('[data-testid="2fa-enabled-message"]')).toBeVisible()
    })

    test('should show active sessions', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      await authenticatedPage.click('[data-testid="security-tab"]')

      // Should show current session
      await expect(authenticatedPage.locator('[data-testid="current-session"]')).toBeVisible()

      // Should show option to revoke other sessions
      await expect(authenticatedPage.locator('[data-testid="revoke-sessions-button"]')).toBeVisible()
    })

    test('should handle account deletion', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      await authenticatedPage.click('[data-testid="security-tab"]')
      await authenticatedPage.click('[data-testid="delete-account-button"]')

      // Should show confirmation dialog
      await expect(authenticatedPage.locator('[data-testid="delete-account-dialog"]')).toBeVisible()

      // Fill confirmation
      await authenticatedPage.fill('[data-testid="delete-confirmation-input"]', 'DELETE')
      await authenticatedPage.click('[data-testid="confirm-delete-button"]')

      // Should redirect to login or show success message
      await expect(authenticatedPage.locator('[data-testid="account-deletion-message"]')).toBeVisible()
    })
  })

  test.describe('Settings Navigation & Accessibility', () => {
    test('should navigate settings with keyboard', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Use tab navigation to move between settings sections
      await authenticatedPage.keyboard.press('Tab')
      await authenticatedPage.keyboard.press('Tab')
      await authenticatedPage.keyboard.press('Enter')

      // Should navigate to next section
      await expect(authenticatedPage.locator('[data-testid="settings-section-profile"]')).toBeFocused()
    })

    test('should save settings with keyboard shortcuts', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Use Ctrl+S shortcut to save
      await authenticatedPage.keyboard.down('Control')
      await authenticatedPage.keyboard.press('s')
      await authenticatedPage.keyboard.up('Control')

      // Should show save feedback
      await expect(authenticatedPage.locator('[data-testid="settings-saved-message"]')).toBeVisible()
    })

    test('should validate required form fields', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Try to save profile without required fields
      await authenticatedPage.fill('[data-testid="profile-name-input"]', '')
      await authenticatedPage.click('[data-testid="save-profile-button"]')

      // Should show validation errors
      await expect(authenticatedPage.locator('[data-testid="profile-name-error"]')).toBeVisible()
    })
  })

  test.describe('Settings Performance & Reliability', () => {
    test('should handle settings load performance', async ({ authenticatedPage }) => {
      const startTime = Date.now()

      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      const loadTime = Date.now() - startTime

      // Settings should load within reasonable time
      expect(loadTime).toBeLessThan(3000)
    })

    test('should handle network errors gracefully', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Simulate network error
      await authenticatedPage.route('**/api/settings/**', route => {
        route.abort('internetdisconnected')
      })

      // Try to save settings
      await authenticatedPage.fill('[data-testid="profile-name-input"]', 'Test User')
      await authenticatedPage.click('[data-testid="save-profile-button"]')

      // Should show error message
      await expect(authenticatedPage.locator('[data-testid="network-error-message"]')).toBeVisible()
    })

    test('should restore unsaved changes on navigation', async ({ authenticatedPage }) => {
      await dashboardPage.goto()
      await dashboardPage.openUserMenu()
      await dashboardPage.navigateToSettings()

      // Make changes
      await authenticatedPage.fill('[data-testid="profile-name-input"]', 'Unsaved Changes')

      // Navigate away and back
      await authenticatedPage.click('[data-testid="appearance-tab"]')
      await authenticatedPage.click('[data-testid="profile-tab"]')

      // Changes should be restored
      await expect(authenticatedPage.locator('[data-testid="profile-name-input"]')).toHaveValue('Unsaved Changes')
    })
  })
})