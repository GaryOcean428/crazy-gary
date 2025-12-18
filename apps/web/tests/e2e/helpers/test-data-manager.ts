import { Page, APIRequestContext } from '@playwright/test'

export interface TestUser {
  id: string
  email: string
  name: string
  role: string
  token?: string
}

export interface TestTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'in-progress'
  priority?: 'low' | 'medium' | 'high'
  created_at?: string
}

export interface TestData {
  users: TestUser[]
  tasks: TestTask[]
  heavyQueries: string[]
}

/**
 * Test data management for E2E tests
 */
export class TestDataManager {
  private page: Page
  private request: APIRequestContext
  private testData: TestData

  constructor(page: Page, request: APIRequestContext) {
    this.page = page
    this.request = request
    this.testData = {
      users: [],
      tasks: [],
      heavyQueries: [
        'Analyze the impact of AI on software development in 2024',
        'What are the emerging trends in machine learning?',
        'How to optimize web application performance?',
        'Best practices for API design and development',
        'Security considerations for modern web applications'
      ]
    }
  }

  /**
   * Create a test user via API
   */
  async createTestUser(userData?: Partial<TestUser>): Promise<TestUser> {
    const user = {
      id: `test-user-${Date.now()}`,
      email: userData?.email || `test-${Date.now()}@example.com`,
      name: userData?.name || `Test User ${Date.now()}`,
      role: userData?.role || 'user',
      ...userData
    }

    try {
      const response = await this.request.post('/api/auth/register', {
        data: {
          name: user.name,
          email: user.email,
          password: 'testpassword123'
        }
      })

      if (response.ok()) {
        const data = await response.json()
        user.token = data.token
      }
    } catch (error) {
      console.warn('Could not create user via API, using local data:', error)
    }

    this.testData.users.push(user)
    return user
  }

  /**
   * Create a test task via API
   */
  async createTestTask(taskData?: Partial<TestTask>): Promise<TestTask> {
    const task = {
      id: `test-task-${Date.now()}`,
      title: taskData?.title || `Test Task ${Date.now()}`,
      description: taskData?.description || 'This is a test task created for E2E testing',
      status: taskData?.status || 'pending',
      priority: taskData?.priority || 'medium',
      created_at: new Date().toISOString(),
      ...taskData
    }

    try {
      const response = await this.request.post('/api/tasks', {
        data: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority
        }
      })

      if (response.ok()) {
        const data = await response.json()
        task.id = data.task?.id || task.id
      }
    } catch (error) {
      console.warn('Could not create task via API, using local data:', error)
    }

    this.testData.tasks.push(task)
    return task
  }

  /**
   * Create multiple test tasks
   */
  async createMultipleTasks(count: number, baseData?: Partial<TestTask>): Promise<TestTask[]> {
    const tasks: TestTask[] = []
    
    for (let i = 0; i < count; i++) {
      const task = await this.createTestTask({
        ...baseData,
        title: `${baseData?.title || 'Task'} ${i + 1}`,
        description: `${baseData?.description || 'Test task'} number ${i + 1}`
      })
      tasks.push(task)
    }
    
    return tasks
  }

  /**
   * Get a random test query for heavy mode
   */
  getRandomQuery(): string {
    const queries = this.testData.heavyQueries
    return queries[Math.floor(Math.random() * queries.length)]
  }

  /**
   * Set up test data in localStorage for demo mode
   */
  async setupLocalStorageData(): Promise<void> {
    await this.page.evaluate((testData) => {
      // Store test data in localStorage
      localStorage.setItem('test_data', JSON.stringify(testData))
      
      // Set demo mode
      localStorage.setItem('demo_mode', 'true')
      localStorage.setItem('auth_token', 'demo-token')
    }, this.testData)
  }

  /**
   * Clean up test data from localStorage
   */
  async cleanupLocalStorage(): Promise<void> {
    await this.page.evaluate(() => {
      // Remove test data
      localStorage.removeItem('test_data')
      
      // Keep demo mode for authenticated tests
      // localStorage.removeItem('demo_mode')
      // localStorage.removeItem('auth_token')
    })
  }

  /**
   * Create test data via UI interactions
   */
  async createTaskViaUI(title: string, description: string, status: TestTask['status'] = 'pending'): Promise<void> {
    await this.page.goto('/tasks')
    
    // Click new task button
    await this.page.click('[data-testid="new-task-button"]')
    
    // Fill form
    await this.page.fill('[data-testid="task-title-input"]', title)
    await this.page.fill('[data-testid="task-description-input"]', description)
    
    // Set status if needed
    if (status !== 'pending') {
      await this.page.selectOption('[data-testid="task-status-select"]', status)
    }
    
    // Submit
    await this.page.click('[data-testid="create-task-button"]')
    
    // Wait for task to appear
    await this.page.waitForSelector(`[data-testid="task-item"]:has-text("${title}")`)
  }

  /**
   * Clean up test tasks via UI
   */
  async cleanupTestTasks(): Promise<void> {
    await this.page.goto('/tasks')
    
    // Get all task items
    const taskItems = await this.page.locator('[data-testid="task-item"]').count()
    
    // Delete all tasks
    for (let i = 0; i < taskItems; i++) {
      try {
        await this.page.click('[data-testid="delete-task-button"]', { timeout: 1000 })
        await this.page.waitForTimeout(500)
      } catch (error) {
        // Task might already be deleted
        break
      }
    }
  }

  /**
   * Reset application state
   */
  async resetApplicationState(): Promise<void> {
    // Clear localStorage
    await this.page.evaluate(() => {
      localStorage.clear()
    })
    
    // Reload page
    await this.page.reload()
    await this.page.waitForLoadState('networkidle')
    
    // Set up fresh demo mode
    await this.setupLocalStorageData()
    await this.page.reload()
  }

  /**
   * Get current test data
   */
  getTestData(): TestData {
    return { ...this.testData }
  }

  /**
   * Create data for specific test scenarios
   */
  async createScenarioData(scenario: 'basic' | 'complex' | 'performance'): Promise<void> {
    switch (scenario) {
      case 'basic':
        await this.createTestUser()
        await this.createTestTask({ title: 'Basic Test Task' })
        break
        
      case 'complex':
        await this.createTestUser({ role: 'admin' })
        await this.createMultipleTasks(10, { priority: 'high' })
        break
        
      case 'performance':
        await this.createMultipleTasks(50)
        break
    }
  }

  /**
   * Validate test data integrity
   */
  async validateTestData(): Promise<boolean> {
    try {
      // Check if localStorage data is valid
      const localData = await this.page.evaluate(() => {
        const data = localStorage.getItem('test_data')
        return data ? JSON.parse(data) : null
      })
      
      return localData !== null && Array.isArray(localData.users) && Array.isArray(localData.tasks)
    } catch (error) {
      console.error('Test data validation failed:', error)
      return false
    }
  }

  /**
   * Export test data for debugging
   */
  async exportTestData(): Promise<string> {
    const data = await this.page.evaluate(() => {
      return {
        localStorage: {
          test_data: localStorage.getItem('test_data'),
          demo_mode: localStorage.getItem('demo_mode'),
          auth_token: localStorage.getItem('auth_token')
        },
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    })
    
    return JSON.stringify(data, null, 2)
  }
}

/**
 * Helper function to create test data manager
 */
export function createTestDataManager(page: Page, request: APIRequestContext): TestDataManager {
  return new TestDataManager(page, request)
}

/**
 * Fixture for test data management
 */
export async function setupTestData(page: Page, request: APIRequestContext, scenario?: string): Promise<TestDataManager> {
  const manager = createTestDataManager(page, request)
  
  if (scenario) {
    await manager.createScenarioData(scenario as any)
  }
  
  await manager.setupLocalStorageData()
  return manager
}

/**
 * Cleanup function
 */
export async function cleanupTestData(page: Page, manager: TestDataManager): Promise<void> {
  await manager.cleanupLocalStorage()
  
  // Reset application state
  await page.evaluate(() => {
    localStorage.clear()
  })
  
  await page.reload()
}