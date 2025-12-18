import { test as base, Page, expect } from '@playwright/test'

export interface TestFixtures {
  // Add custom fixtures here
}

export interface WorkerFixtures {
  // Add worker fixtures here
}

export const test = base.extend<TestFixtures, WorkerFixtures>({})

export { expect }