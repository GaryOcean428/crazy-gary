import { test, expect } from '../fixtures/auth-fixtures'
import { HeavyPage } from '../pages/heavy-page'

test.describe('Heavy Mode Orchestration E2E Tests', () => {
  let heavyPage: HeavyPage

  test.beforeEach(async ({ authenticatedPage }) => {
    heavyPage = new HeavyPage(authenticatedPage)
  })

  test('should display Heavy Mode page correctly', async () => {
    await heavyPage.goto()
    
    await expect(heavyPage.page).toHaveTitle(/Heavy|Brain/)
    await expect(heavyPage.queryInput).toBeVisible()
    await expect(heavyPage.numAgentsInput).toBeVisible()
    await expect(heavyPage.executeButton).toBeVisible()
    await expect(heavyPage.orchestrateTab).toBeVisible()
  })

  test('should execute heavy task successfully', async () => {
    await heavyPage.goto()
    
    const testQuery = 'Analyze the impact of AI on software development in 2024'
    await heavyPage.executeTask(testQuery, 4)
    
    // Wait for execution to complete
    await heavyPage.waitForExecution()
    
    // Check results
    await heavyPage.expectExecutionComplete()
    await heavyPage.expectResultsWithAgents(4)
  })

  test('should show agent progress during execution', async () => {
    await heavyPage.goto()
    
    await heavyPage.executeTask('Test query for progress tracking', 3)
    
    // Should show agent progress
    await heavyPage.expectAgentProgress()
    
    // Wait for completion
    await heavyPage.waitForExecution()
  })

  test('should validate query input', async () => {
    await heavyPage.goto()
    
    // Try to execute without query
    await heavyPage.executeButton.click()
    
    // Should show validation error or prevent execution
    await expect(heavyPage.executeButton).toBeDisabled()
    
    // Add query and try again
    await heavyPage.setQuery('Valid query')
    await expect(heavyPage.executeButton).toBeEnabled()
  })

  test('should validate number of agents input', async () => {
    await heavyPage.goto()
    
    // Test minimum value
    await heavyPage.setNumAgents(0)
    await heavyPage.setQuery('Test query')
    await expect(heavyPage.executeButton).toBeDisabled()
    
    // Test maximum value
    await heavyPage.setNumAgents(9)
    await expect(heavyPage.executeButton).toBeDisabled()
    
    // Test valid value
    await heavyPage.setNumAgents(4)
    await expect(heavyPage.executeButton).toBeEnabled()
  })

  test('should display tools tab correctly', async () => {
    await heavyPage.goto()
    await heavyPage.expectToolsVisible()
  })

  test('should display config tab correctly', async () => {
    await heavyPage.goto()
    await heavyPage.expectConfigVisible()
  })

  test('should update configuration', async () => {
    await heavyPage.goto()
    
    const newAgentCount = 6
    await heavyPage.updateConfig(newAgentCount)
    
    // Verify the configuration was updated
    await expect(heavyPage.numAgentsInput).toHaveValue(newAgentCount.toString())
  })

  test('should handle execution errors gracefully', async ({ page }) => {
    await heavyPage.goto()
    
    // Mock a failed API response
    await page.route('**/api/heavy/orchestrate', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })
    
    await heavyPage.executeTask('Test query that will fail', 2)
    
    // Should handle error gracefully
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('should show loading state during execution', async () => {
    await heavyPage.goto()
    
    await heavyPage.executeTask('Test query for loading state', 2)
    
    // Should show loading spinner
    await expect(heavyPage.loadingSpinner).toBeVisible()
    
    // Should hide loading spinner after completion
    await heavyPage.waitForExecution()
    await expect(heavyPage.loadingSpinner).toBeHidden()
  })

  test('should maintain state across tab switches', async () => {
    await heavyPage.goto()
    
    const testQuery = 'Test query for state management'
    await heavyPage.setQuery(testQuery)
    await heavyPage.setNumAgents(3)
    
    // Switch to different tabs and back
    await heavyPage.switchToTab('tools')
    await heavyPage.switchToTab('config')
    await heavyPage.switchToTab('orchestrate')
    
    // Query should still be there
    await expect(heavyPage.queryInput).toHaveValue(testQuery)
    await expect(heavyPage.numAgentsInput).toHaveValue('3')
  })

  test('should display execution results correctly', async () => {
    await heavyPage.goto()
    
    await heavyPage.executeTask('Generate comprehensive analysis of market trends', 4)
    await heavyPage.waitForExecution()
    
    // Switch to results tab
    await heavyPage.switchToTab('results')
    
    // Should show synthesized result
    await expect(heavyPage.executionResults).toContainText('comprehensive analysis')
    
    // Should show individual agent results
    await expect(heavyPage.page.locator('[data-testid="agent-result"]')).toHaveCount(4)
  })

  test('should handle timeout gracefully', async ({ page }) => {
    await heavyPage.goto()
    
    // Mock a slow response
    await page.route('**/api/heavy/orchestrate', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          response: 'Delayed response',
          metadata: { num_agents: 2, successful_agents: 2 },
          agents: []
        })
      })
    })
    
    await heavyPage.executeTask('Test timeout handling', 2)
    
    // Should handle timeout gracefully
    // Note: This might show a timeout error or handle it as expected
    await page.waitForTimeout(2000)
    
    // Should not leave UI in broken state
    await expect(heavyPage.executeButton).toBeEnabled()
  })
})