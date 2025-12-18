import { test, expect } from '../fixtures/auth-fixtures'

test.describe('API Integration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable request interception for API testing
    await page.route('**/api/**', route => {
      // Handle API requests
      const url = route.request().url()
      
      if (url.includes('/auth/validate')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            user: {
              id: 'demo',
              email: 'demo@crazy-gary.ai',
              name: 'Demo User',
              role: 'admin'
            }
          })
        })
      } else {
        route.continue()
      }
    })
  })

  test('should handle API authentication flow', async ({ page }) => {
    await page.goto('/login')
    
    // Test login API call
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'test-user',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user'
          },
          token: 'test-token-123'
        })
      })
    })
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL(/.*dashboard.*|.*\//)
  })

  test('should handle API network errors gracefully', async ({ page }) => {
    await page.goto('/login')
    
    // Mock network failure
    await page.route('**/api/auth/login', route => {
      route.abort('failed')
    })
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // Should show network error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/Network|Connection|Failed/)
  })

  test('should handle API server errors', async ({ page }) => {
    await page.goto('/login')
    
    // Mock server error
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      })
    })
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // Should show server error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/Server|Error|500/)
  })

  test('should handle API timeout errors', async ({ page }) => {
    await page.goto('/login')
    
    // Mock slow response
    await page.route('**/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 'test', email: 'test@example.com', name: 'Test' },
          token: 'token'
        })
      })
    })
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // Should show timeout error
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/Timeout|Slow/)
  })

  test('should handle invalid API responses', async ({ page }) => {
    await page.goto('/login')
    
    // Mock malformed API response
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'Invalid JSON'
      })
    })
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // Should handle JSON parsing error gracefully
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('should retry failed API requests', async ({ page }) => {
    let attemptCount = 0
    
    await page.goto('/login')
    
    // Mock API that fails twice then succeeds
    await page.route('**/api/auth/login', async route => {
      attemptCount++
      if (attemptCount <= 2) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Temporary failure' })
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { id: 'test', email: 'test@example.com', name: 'Test' },
            token: 'token'
          })
        })
      }
    })
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // Should eventually succeed after retries
    await expect(page).toHaveURL(/.*dashboard.*|.*\//)
  })

  test('should handle heavy mode API integration', async ({ page }) => {
    await page.goto('/heavy')
    
    // Mock heavy orchestration API
    await page.route('**/api/heavy/orchestrate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          response: 'Analysis complete',
          metadata: { num_agents: 4, successful_agents: 4 },
          execution_time: 2.5,
          agents: [
            { agent_id: 1, status: 'completed', result: 'Agent 1 result' },
            { agent_id: 2, status: 'completed', result: 'Agent 2 result' },
            { agent_id: 3, status: 'completed', result: 'Agent 3 result' },
            { agent_id: 4, status: 'completed', result: 'Agent 4 result' }
          ]
        })
      })
    })
    
    await page.fill('[data-testid="heavy-query-input"]', 'Test analysis query')
    await page.click('[data-testid="heavy-execute-button"]')
    
    // Should show execution results
    await expect(page.locator('[data-testid="execution-results"]')).toContainText('Analysis complete')
  })

  test('should handle task management API integration', async ({ page }) => {
    await page.goto('/tasks')
    
    // Mock tasks API
    await page.route('**/api/tasks', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            tasks: [
              { id: '1', title: 'Test Task', description: 'Test description', status: 'pending' }
            ]
          })
        })
      } else if (route.request().method() === 'POST') {
        const requestBody = route.request().postData()
        const taskData = JSON.parse(requestBody || '{}')
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            task: {
              id: '2',
              ...taskData,
              status: 'pending',
              created_at: new Date().toISOString()
            }
          })
        })
      }
    })
    
    await page.click('[data-testid="new-task-button"]')
    await page.fill('[data-testid="task-title-input"]', 'API Test Task')
    await page.fill('[data-testid="task-description-input"]', 'Created via API test')
    await page.click('[data-testid="create-task-button"]')
    
    // Should show the created task
    await expect(page.locator('[data-testid="task-item"]')).toContainText('API Test Task')
  })

  test('should handle CORS errors', async ({ page }) => {
    await page.goto('/login')
    
    // Mock CORS error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 0,
        statusText: 'CORS Error'
      })
    })
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // Should handle CORS error gracefully
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/CORS|Access/)
  })

  test('should handle rate limiting', async ({ page }) => {
    await page.goto('/login')
    
    // Mock rate limit response
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          retry_after: 60
        })
      })
    })
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // Should show rate limit message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/Rate|Limit|429/)
  })

  test('should show loading states during API calls', async ({ page }) => {
    await page.goto('/heavy')
    
    // Mock slow API response
    await page.route('**/api/heavy/orchestrate', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          response: 'Analysis complete',
          metadata: { num_agents: 2, successful_agents: 2 },
          agents: []
        })
      })
    })
    
    await page.fill('[data-testid="heavy-query-input"]', 'Test query')
    await page.click('[data-testid="heavy-execute-button"]')
    
    // Should show loading spinner
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    
    // Should hide loading spinner after response
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeHidden({ timeout: 5000 })
  })

  test('should handle API response validation', async ({ page }) => {
    await page.goto('/heavy')
    
    // Mock API with invalid response structure
    await page.route('**/api/heavy/orchestrate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          invalid_structure: true,
          missing_required_fields: true
        })
      })
    })
    
    await page.fill('[data-testid="heavy-query-input"]', 'Test query')
    await page.click('[data-testid="heavy-execute-button"]')
    
    // Should handle invalid response gracefully
    // This test verifies the app doesn't crash on malformed API responses
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })
})