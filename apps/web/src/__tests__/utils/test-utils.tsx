/**
 * Test utilities and helpers for the Crazy-Gary application
 */

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, Mock } from 'vitest'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

// ========================================
// Test Wrapper Components
// ========================================

interface TestWrapperProps {
  children: React.ReactNode
  initialEntries?: string[]
  authState?: {
    isAuthenticated: boolean
    user?: any
    token?: string
  }
  theme?: string
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialEntries = ['/'],
  authState = { isAuthenticated: false },
  theme = 'light',
}) => {
  return (
    <BrowserRouter initialEntries={initialEntries}>
      <ThemeProvider defaultTheme={theme} storageKey="crazy-gary-theme">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

// Custom render function with all providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> & TestWrapperProps = {}
) => {
  const { wrapper: Wrapper = TestWrapper, ...renderOptions } = options
  
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// ========================================
// Mock Data and Fixtures
// ========================================

export const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://example.com/avatars/admin.jpg',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    avatar: 'https://example.com/avatars/user.jpg',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
  {
    id: '3',
    email: 'guest@example.com',
    name: 'Guest User',
    role: 'guest',
    avatar: 'https://example.com/avatars/guest.jpg',
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
  },
]

export const mockTasks = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the new feature',
    status: 'in-progress',
    priority: 'high',
    assigneeId: '2',
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2023-12-01T15:30:00Z',
    dueDate: '2023-12-15T17:00:00Z',
    tags: ['documentation', 'feature'],
  },
  {
    id: '2',
    title: 'Fix authentication bug',
    description: 'Resolve login issue with social auth providers',
    status: 'todo',
    priority: 'critical',
    assigneeId: '1',
    createdAt: '2023-12-02T09:00:00Z',
    updatedAt: '2023-12-02T09:00:00Z',
    dueDate: '2023-12-05T17:00:00Z',
    tags: ['bug', 'authentication'],
  },
  {
    id: '3',
    title: 'Optimize database queries',
    description: 'Improve performance of user dashboard queries',
    status: 'done',
    priority: 'medium',
    assigneeId: '2',
    createdAt: '2023-11-28T14:00:00Z',
    updatedAt: '2023-12-01T16:45:00Z',
    completedAt: '2023-12-01T16:45:00Z',
    tags: ['performance', 'database'],
  },
]

export const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website',
    status: 'active',
    ownerId: '1',
    teamMembers: ['1', '2'],
    startDate: '2023-11-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    budget: 50000,
    progress: 65,
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android',
    status: 'planning',
    ownerId: '2',
    teamMembers: ['2', '3'],
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    budget: 120000,
    progress: 10,
  },
]

export const mockNotifications = [
  {
    id: '1',
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: 'You have been assigned to "Fix authentication bug"',
    read: false,
    userId: '2',
    createdAt: '2023-12-02T09:15:00Z',
    data: { taskId: '2', assigneeId: '2' },
  },
  {
    id: '2',
    type: 'project_update',
    title: 'Project Updated',
    message: 'Website Redesign project progress updated to 65%',
    read: true,
    userId: '1',
    createdAt: '2023-12-01T16:30:00Z',
    data: { projectId: '1', progress: 65 },
  },
]

// ========================================
// Mock Factories
// ========================================

export const createMockUser = (overrides = {}): any => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
})

export const createMockTask = (overrides = {}): any => ({
  id: '1',
  title: 'Test Task',
  description: 'This is a test task',
  status: 'todo',
  priority: 'medium',
  assigneeId: '1',
  createdAt: '2023-12-01T00:00:00Z',
  updatedAt: '2023-12-01T00:00:00Z',
  dueDate: '2023-12-31T23:59:59Z',
  tags: ['test'],
  ...overrides,
})

export const createMockProject = (overrides = {}): any => ({
  id: '1',
  name: 'Test Project',
  description: 'This is a test project',
  status: 'active',
  ownerId: '1',
  teamMembers: ['1'],
  startDate: '2023-12-01T00:00:00Z',
  endDate: '2024-12-31T23:59:59Z',
  budget: 10000,
  progress: 0,
  ...overrides,
})

export const createMockApiResponse = (data: any, status = 200): any => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: new Headers({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-token',
  }),
})

// ========================================
// Mock Generators
// ========================================

export const generateUsers = (count: number): any[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: (index + 1).toString(),
      email: `user${index + 1}@example.com`,
      name: `User ${index + 1}`,
    })
  )
}

export const generateTasks = (count: number): any[] => {
  const statuses = ['todo', 'in-progress', 'done']
  const priorities = ['low', 'medium', 'high', 'critical']
  
  return Array.from({ length: count }, (_, index) =>
    createMockTask({
      id: (index + 1).toString(),
      title: `Task ${index + 1}`,
      status: statuses[index % statuses.length],
      priority: priorities[index % priorities.length],
      assigneeId: ((index % 3) + 1).toString(),
    })
  )
}

export const generateProjects = (count: number): any[] => {
  const statuses = ['planning', 'active', 'on-hold', 'completed']
  
  return Array.from({ length: count }, (_, index) =>
    createMockProject({
      id: (index + 1).toString(),
      name: `Project ${index + 1}`,
      status: statuses[index % statuses.length],
      ownerId: ((index % 2) + 1).toString(),
    })
  )
}

// ========================================
// Test Data Generators
// ========================================

export const createTestFormData = (fields: Record<string, any>): FormData => {
  const formData = new FormData()
  
  Object.entries(fields).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, item)
      })
    } else {
      formData.append(key, value.toString())
    }
  })
  
  return formData
}

export const createTestFile = (
  name: string,
  content: string | ArrayBuffer,
  type: string = 'text/plain'
): File => {
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

// ========================================
// Async Test Helpers
// ========================================

export const waitFor = (callback: () => void | Promise<void>, options?: any) => {
  return import('@testing-library/react').then(({ waitFor }) =>
    waitFor(callback, options)
  )
}

export const waitForElementToBeRemoved = (element: any, options?: any) => {
  return import('@testing-library/react').then(({ waitForElementToBeRemoved }) =>
    waitForElementToBeRemoved(element, options)
  )
}

export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

// ========================================
// Mock Utilities
// ========================================

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
  
  Object.defineProperty(window, 'IntersectionObserver', {
    value: mockIntersectionObserver,
    writable: true,
  })
  
  return mockIntersectionObserver
}

export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
  
  Object.defineProperty(window, 'ResizeObserver', {
    value: mockResizeObserver,
    writable: true,
  })
  
  return mockResizeObserver
}

export const mockMatchMedia = (matches: boolean = true) => {
  const mockMatchMedia = vi.fn().mockImplementation(query => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  
  Object.defineProperty(window, 'matchMedia', {
    value: mockMatchMedia,
    writable: true,
  })
  
  return mockMatchMedia
}

export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
  
  return localStorageMock
}

export const mockSessionStorage = () => {
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  })
  
  return sessionStorageMock
}

// ========================================
// Event Simulation Utilities
// ========================================

export const simulateFileUpload = (
  input: HTMLElement,
  file: File
) => {
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(file)
  
  Object.defineProperty(input, 'files', {
    value: dataTransfer.files,
    writable: false,
  })
  
  fireEvent.change(input)
}

export const simulateDragAndDrop = (
  target: HTMLElement,
  items: { type: string; data: any }[]
) => {
  const dataTransfer = new DataTransfer()
  
  items.forEach(item => {
    dataTransfer.setData(item.type, JSON.stringify(item.data))
  })
  
  fireEvent.dragOver(target)
  fireEvent.drop(target, { dataTransfer })
}

export const simulateKeyboardNavigation = (
  element: HTMLElement,
  key: string,
  options: any = {}
) => {
  fireEvent.keyDown(element, { key, ...options })
  fireEvent.keyUp(element, { key, ...options })
}

export const simulateTouchGestures = {
  tap: (element: HTMLElement) => {
    fireEvent.touchStart(element, { touches: [{ clientX: 0, clientY: 0 }] })
    fireEvent.touchEnd(element)
  },
  
  swipe: (element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down') => {
    const startX = 100
    const startY = 100
    const endX = direction === 'left' ? 0 : direction === 'right' ? 200 : 100
    const endY = direction === 'up' ? 0 : direction === 'down' ? 200 : 100
    
    fireEvent.touchStart(element, {
      touches: [{ clientX: startX, clientY: startY }],
    })
    
    fireEvent.touchEnd(element, {
      changedTouches: [{ clientX: endX, clientY: endY }],
    })
  },
}

// ========================================
// Performance Test Helpers
// ========================================

export const measureRenderTime = async <T>(
  renderFn: () => T
): Promise<{ result: T; renderTime: number }> => {
  const startTime = performance.now()
  const result = renderFn()
  const endTime = performance.now()
  
  return {
    result,
    renderTime: endTime - startTime,
  }
}

export const measureAsyncOperation = async <T>(
  operation: () => Promise<T>
): Promise<{ result: T; executionTime: number }> => {
  const startTime = performance.now()
  const result = await operation()
  const endTime = performance.now()
  
  return {
    result,
    executionTime: endTime - startTime,
  }
}

// ========================================
// Accessibility Test Helpers
// ========================================

export const getAccessibleElements = (container: HTMLElement) => {
  const elements = container.querySelectorAll(
    'button, [role="button"], [role="link"], input, select, textarea, [tabindex]'
  )
  
  return Array.from(elements) as HTMLElement[]
}

export const getFocusableElements = (container: HTMLElement) => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]
  
  return Array.from(container.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[]
}

export const checkAriaLabels = (container: HTMLElement) => {
  const elements = container.querySelectorAll('[aria-label], [aria-labelledby]')
  
  return Array.from(elements).map(element => ({
    element,
    hasLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
    label: element.getAttribute('aria-label') || element.getAttribute('aria-labelledby'),
  }))
}

// ========================================
// Error Simulation Utilities
// ========================================

export const createMockError = (
  message: string,
  status?: number,
  code?: string
) => {
  const error = new Error(message) as any
  if (status) error.status = status
  if (code) error.code = code
  return error
}

export const simulateNetworkError = () => {
  return Promise.reject(new Error('Network error'))
}

export const simulateTimeoutError = () => {
  return Promise.reject(new Error('Request timeout'))
}

export const simulateValidationError = (field: string, message: string) => {
  return Promise.reject({
    name: 'ValidationError',
    errors: {
      [field]: [message],
    },
  })
}

// ========================================
// Test Environment Setup
// ========================================

export const setupTestEnvironment = () => {
  // Setup all common mocks
  mockIntersectionObserver()
  mockResizeObserver()
  mockMatchMedia()
  mockLocalStorage()
  mockSessionStorage()
  
  // Setup console mocks to reduce test noise
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'info').mockImplementation(() => {})
  vi.spyOn(console, 'debug').mockImplementation(() => {})
  
  // Setup performance mocks
  vi.spyOn(performance, 'now').mockReturnValue(1000)
  
  // Mock fetch
  vi.stubGlobal('fetch', vi.fn())
  
  // Mock URL.createObjectURL
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  })
}

export const cleanupTestEnvironment = () => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
}

// ========================================
// Test Configuration
// ========================================

export const testConfig = {
  // Timeouts
  defaultTimeout: 5000,
  shortTimeout: 1000,
  longTimeout: 10000,
  
  // Performance thresholds
  renderTimeThreshold: 16, // 60fps
  asyncOperationThreshold: 100,
  
  // Test data sizes
  smallDataset: 10,
  mediumDataset: 100,
  largeDataset: 1000,
  
  // User interaction delays
  typingDelay: 100,
  clickDelay: 50,
  hoverDelay: 100,
}

// ========================================
// Export all utilities
// ========================================

export * from '@testing-library/react'
export { userEvent }
export { vi as vitest }
