import { Page, Locator, expect } from '@playwright/test'

export class TaskManagerPage {
  readonly page: Page
  readonly newTaskButton: Locator
  readonly taskTitleInput: Locator
  readonly taskDescriptionInput: Locator
  readonly createTaskButton: Locator
  readonly taskList: Locator
  readonly taskItems: Locator
  readonly deleteTaskButton: Locator
  readonly editTaskButton: Locator

  constructor(page: Page) {
    this.page = page
    this.newTaskButton = page.locator('[data-testid="new-task-button"]')
    this.taskTitleInput = page.locator('[data-testid="task-title-input"]')
    this.taskDescriptionInput = page.locator('[data-testid="task-description-input"]')
    this.createTaskButton = page.locator('[data-testid="create-task-button"]')
    this.taskList = page.locator('[data-testid="task-list"]')
    this.taskItems = page.locator('[data-testid="task-item"]')
    this.deleteTaskButton = page.locator('[data-testid="delete-task-button"]')
    this.editTaskButton = page.locator('[data-testid="edit-task-button"]')
  }

  async goto() {
    await this.page.goto('/tasks')
  }

  async createTask(title: string, description: string) {
    await this.newTaskButton.click()
    await this.taskTitleInput.fill(title)
    await this.taskDescriptionInput.fill(description)
    await this.createTaskButton.click()
  }

  async expectTaskCreated(title: string) {
    await expect(this.taskItems).toContainText(title)
  }

  async deleteTask(index: number = 0) {
    const taskItem = this.taskItems.nth(index)
    await taskItem.hover()
    await this.deleteTaskButton.nth(index).click()
  }

  async expectTaskDeleted(title: string) {
    await expect(this.taskItems).not.toContainText(title)
  }

  async expectTaskCount(count: number) {
    await expect(this.taskItems).toHaveCount(count)
  }

  async completeTask(index: number = 0) {
    const taskItem = this.taskItems.nth(index)
    const checkbox = taskItem.locator('input[type="checkbox"]')
    await checkbox.check()
  }

  async expectTaskCompleted(index: number = 0) {
    const taskItem = this.taskItems.nth(index)
    await expect(taskItem).toHaveClass(/completed|done/)
  }

  async filterTasks(status: 'all' | 'pending' | 'completed') {
    const filterButton = this.page.locator(`[data-testid="filter-${status}"]`)
    await filterButton.click()
  }

  async expectFilteredTasks(status: 'pending' | 'completed') {
    const visibleTasks = this.taskItems.filter({ hasNot: this.page.locator('[data-testid*="hidden"]') })
    
    if (status === 'pending') {
      await expect(visibleTasks).not.toHaveClass(/completed/)
    } else {
      await expect(visibleTasks).toHaveClass(/completed/)
    }
  }

  async expectToBeOnTaskManagerPage() {
    await expect(this.page).toHaveURL('/tasks')
    await expect(this.newTaskButton).toBeVisible()
  }
}