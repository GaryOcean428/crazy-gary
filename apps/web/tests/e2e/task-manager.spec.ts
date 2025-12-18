import { test, expect } from '../fixtures/auth-fixtures'
import { TaskManagerPage } from '../pages/task-manager-page'

test.describe('Task Manager E2E Tests', () => {
  let taskManagerPage: TaskManagerPage

  test.beforeEach(async ({ authenticatedPage }) => {
    taskManagerPage = new TaskManagerPage(authenticatedPage)
  })

  test('should display task manager page correctly', async () => {
    await taskManagerPage.goto()
    
    await expect(taskManagerPage.page).toHaveTitle(/Task|Tasks/)
    await expect(taskManagerPage.newTaskButton).toBeVisible()
    await expect(taskManagerPage.taskList).toBeVisible()
  })

  test('should create a new task', async () => {
    await taskManagerPage.goto()
    
    const taskTitle = 'E2E Test Task'
    const taskDescription = 'This is a task created during E2E testing'
    
    await taskManagerPage.createTask(taskTitle, taskDescription)
    await taskManagerPage.expectTaskCreated(taskTitle)
  })

  test('should validate task creation form', async () => {
    await taskManagerPage.goto()
    
    await taskManagerPage.newTaskButton.click()
    
    // Try to create task without title
    await taskManagerPage.taskDescriptionInput.fill('Description without title')
    await taskManagerPage.createTaskButton.click()
    
    // Should show validation error
    await expect(taskManagerPage.taskTitleInput).toHaveAttribute('aria-invalid', 'true')
    
    // Fill in title and try again
    await taskManagerPage.taskTitleInput.fill('Valid task title')
    await taskManagerPage.createTaskButton.click()
    
    // Should create task successfully
    await taskManagerPage.expectTaskCreated('Valid task title')
  })

  test('should delete a task', async () => {
    await taskManagerPage.goto()
    
    // Create a task first
    await taskManagerPage.createTask('Task to Delete', 'This task will be deleted')
    
    // Get initial task count
    const initialCount = await taskManagerPage.taskItems.count()
    
    // Delete the task
    await taskManagerPage.deleteTask(0)
    
    // Task count should decrease
    await taskManagerPage.expectTaskCount(initialCount - 1)
  })

  test('should complete a task', async () => {
    await taskManagerPage.goto()
    
    // Create a task first
    await taskManagerPage.createTask('Task to Complete', 'This task will be completed')
    
    // Complete the task
    await taskManagerPage.completeTask(0)
    await taskManagerPage.expectTaskCompleted(0)
  })

  test('should filter tasks by status', async () => {
    await taskManagerPage.goto()
    
    // Create tasks with different statuses
    await taskManagerPage.createTask('Pending Task 1', 'First pending task')
    await taskManagerPage.createTask('Pending Task 2', 'Second pending task')
    
    // Complete one task
    await taskManagerPage.completeTask(0)
    
    // Filter by pending tasks
    await taskManagerPage.filterTasks('pending')
    
    // Should only show pending tasks
    await taskManagerPage.expectFilteredTasks('pending')
    
    // Filter by completed tasks
    await taskManagerPage.filterTasks('completed')
    
    // Should only show completed tasks
    await taskManagerPage.expectFilteredTasks('completed')
    
    // Show all tasks
    await taskManagerPage.filterTasks('all')
    
    // Should show all tasks
    await expect(taskManagerPage.taskItems).toHaveCount(2)
  })

  test('should persist tasks across page reloads', async ({ page }) => {
    await taskManagerPage.goto()
    
    // Create a task
    await taskManagerPage.createTask('Persistent Task', 'This task should persist')
    
    // Reload page
    await page.reload()
    
    // Task should still be there
    await taskManagerPage.expectTaskCreated('Persistent Task')
  })

  test('should handle empty task list', async () => {
    await taskManagerPage.goto()
    
    // Delete all existing tasks
    const taskCount = await taskManagerPage.taskItems.count()
    for (let i = 0; i < taskCount; i++) {
      await taskManagerPage.deleteTask(0)
    }
    
    // Should show empty state
    await expect(taskManagerPage.page.locator('[data-testid="empty-state"]')).toBeVisible()
    
    // Should still be able to create new tasks
    await taskManagerPage.createTask('First Task', 'After empty state')
    await taskManagerPage.expectTaskCreated('First Task')
  })

  test('should handle task editing', async ({ page }) => {
    await taskManagerPage.goto()
    
    // Create a task
    await taskManagerPage.createTask('Original Task', 'Original description')
    
    // Click edit button
    await taskManagerPage.editTaskButton.click()
    
    // Should open edit modal or form
    await expect(page.locator('[data-testid="edit-task-modal"]')).toBeVisible()
    
    // Update task details
    await page.locator('[data-testid="edit-title-input"]').fill('Updated Task')
    await page.locator('[data-testid="edit-description-input"]').fill('Updated description')
    await page.locator('[data-testid="save-edit-button"]').click()
    
    // Should show updated task
    await taskManagerPage.expectTaskCreated('Updated Task')
  })

  test('should handle bulk operations', async ({ page }) => {
    await taskManagerPage.goto()
    
    // Create multiple tasks
    await taskManagerPage.createTask('Task 1', 'First task')
    await taskManagerPage.createTask('Task 2', 'Second task')
    await taskManagerPage.createTask('Task 3', 'Third task')
    
    // Select multiple tasks
    const checkboxes = page.locator('[data-testid="task-checkbox"]')
    await checkboxes.first().check()
    await checkboxes.nth(1).check()
    
    // Click bulk delete
    await page.locator('[data-testid="bulk-delete-button"]').click()
    
    // Confirm deletion
    await page.locator('[data-testid="confirm-bulk-delete"]').click()
    
    // Should have one task left
    await expect(taskManagerPage.taskItems).toHaveCount(1)
  })

  test('should handle task priorities', async ({ page }) => {
    await taskManagerPage.goto()
    
    // Create tasks with different priorities
    await taskManagerPage.createTask('High Priority Task', 'High priority task')
    await taskManagerPage.createTask('Low Priority Task', 'Low priority task')
    
    // Set priority for first task
    const firstTask = taskManagerPage.taskItems.first()
    await firstTask.locator('[data-testid="priority-selector"]').selectOption('high')
    
    // Verify priority is set
    await expect(firstTask.locator('[data-testid="priority-badge"]')).toContainText('High')
  })

  test('should handle task deadlines', async ({ page }) => {
    await taskManagerPage.goto()
    
    // Create a task with deadline
    await taskManagerPage.createTask('Task with Deadline', 'This task has a deadline')
    
    // Set deadline
    await page.locator('[data-testid="deadline-selector"]').fill('2024-12-31')
    
    // Verify deadline is set
    await expect(page.locator('[data-testid="deadline-display"]')).toContainText('2024-12-31')
  })

  test('should handle task search', async ({ page }) => {
    await taskManagerPage.goto()
    
    // Create multiple tasks
    await taskManagerPage.createTask('Search Me Task', 'This should be found')
    await taskManagerPage.createTask('Hide This Task', 'This should be hidden')
    
    // Search for a specific task
    await page.locator('[data-testid="task-search"]').fill('Search Me')
    
    // Should filter results
    await expect(taskManagerPage.taskItems).toHaveCount(1)
    await taskManagerPage.expectTaskCreated('Search Me Task')
    
    // Clear search
    await page.locator('[data-testid="task-search"]').clear()
    
    // Should show all tasks again
    await expect(taskManagerPage.taskItems).toHaveCount(2)
  })

  test('should handle task sorting', async ({ page }) => {
    await taskManagerPage.goto()
    
    // Create tasks with different creation dates
    await taskManagerPage.createTask('First Task', 'Created first')
    await taskManagerPage.createTask('Second Task', 'Created second')
    
    // Sort by creation date (newest first)
    await page.locator('[data-testid="sort-selector"]').selectOption('created-desc')
    
    // Tasks should be reordered
    const firstTaskTitle = await taskManagerPage.taskItems.first().locator('[data-testid="task-title"]').textContent()
    expect(firstTaskTitle).toContain('Second Task')
  })
})