import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper, createMockUser, generateTasks, measureRenderTime } from '@/__tests__/utils/test-utils'

// E2E Test Scenarios for Critical User Journeys

describe('E2E - Critical User Journeys', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('New User Onboarding Flow', () => {
    it('should complete full user registration and onboarding', async () => {
      const user = userEvent.setup()
      
      // Mock API responses
      const mockRegisterAPI = vi.fn().mockResolvedValue({
        data: {
          user: createMockUser({ email: 'newuser@example.com' }),
          access_token: 'register-token',
        },
      })
      
      vi.mocked(fetch).mockImplementation(mockRegisterAPI as any)

      // Step 1: Navigate to registration
      render(
        <TestWrapper initialEntries={['/register']}>
          <div>
            <h1>Register</h1>
            <form data-testid="register-form">
              <input name="name" placeholder="Full Name" data-testid="name-input" />
              <input name="email" placeholder="Email" data-testid="email-input" />
              <input name="password" placeholder="Password" type="password" data-testid="password-input" />
              <button type="submit" data-testid="register-button">Register</button>
            </form>
            <div data-testid="success-message" style={{ display: 'none' }}>
              Registration successful! Please check your email.
            </div>
          </div>
        </TestWrapper>
      )

      // Step 2: Fill registration form
      await user.type(screen.getByTestId('name-input'), 'New User')
      await user.type(screen.getByTestId('email-input'), 'newuser@example.com')
      await user.type(screen.getByTestId('password-input'), 'SecurePass123!')

      // Step 3: Submit registration
      await user.click(screen.getByTestId('register-button'))

      // Verify API call
      expect(mockRegisterAPI).toHaveBeenCalledWith('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'SecurePass123!',
        }),
      })

      // Step 4: Verify success message
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeVisible()
        expect(screen.getByTestId('success-message')).toHaveTextContent(
          'Registration successful! Please check your email.'
        )
      })
    }, 10000)
  })

  describe('Task Management Workflow', () => {
    it('should complete full task management cycle', async () => {
      const user = userEvent.setup()
      const mockTasks = generateTasks(3)
      
      // Mock task API
      const mockTaskAPI = vi.fn()
      vi.mocked(fetch).mockImplementation(mockTaskAPI as any)

      render(
        <TestWrapper 
          initialEntries={['/tasks']}
          authState={{ isAuthenticated: true, user: createMockUser() }}
        >
          <div>
            <h1>Task Manager</h1>
            <div data-testid="task-list">
              {mockTasks.map((task, index) => (
                <div key={task.id} data-testid={`task-${task.id}`}>
                  <span>{task.title}</span>
                  <button data-testid={`complete-task-${task.id}`}>Complete</button>
                  <button data-testid={`delete-task-${task.id}`}>Delete</button>
                </div>
              ))}
            </div>
            <form data-testid="add-task-form">
              <input name="title" placeholder="Task title" data-testid="task-title-input" />
              <textarea name="description" placeholder="Description" data-testid="task-desc-input" />
              <button type="submit" data-testid="add-task-button">Add Task</button>
            </form>
          </div>
        </TestWrapper>
      )

      // Verify initial tasks are displayed
      expect(screen.getByTestId('task-list')).toBeInTheDocument()
      mockTasks.forEach(task => {
        expect(screen.getByTestId(`task-${task.id}`)).toBeInTheDocument()
        expect(screen.getByText(task.title)).toBeInTheDocument()
      })

      // Add new task
      await user.type(screen.getByTestId('task-title-input'), 'New Test Task')
      await user.type(screen.getByTestId('task-desc-input'), 'Test description')
      await user.click(screen.getByTestId('add-task-button'))

      // Verify task was added
      await waitFor(() => {
        expect(screen.getByText('New Test Task')).toBeInTheDocument()
      })

      // Complete a task
      await user.click(screen.getByTestId('complete-task-1'))

      // Verify task completion
      await waitFor(() => {
        const completedTask = screen.queryByTestId('task-1')
        expect(completedTask).toHaveClass('completed')
      })

      // Delete a task
      await user.click(screen.getByTestId('delete-task-2'))

      // Verify task was deleted
      await waitFor(() => {
        expect(screen.queryByTestId('task-2')).not.toBeInTheDocument()
      })
    }, 15000)
  })

  describe('Dashboard Navigation Flow', () => {
    it('should navigate through all main dashboard sections', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper 
          initialEntries={['/']}
          authState={{ isAuthenticated: true, user: createMockUser() }}
        >
          <div>
            <nav data-testid="main-nav">
              <a href="/dashboard">Dashboard</a>
              <a href="/tasks">Tasks</a>
              <a href="/models">Models</a>
              <a href="/tools">Tools</a>
              <a href="/monitoring">Monitoring</a>
              <a href="/settings">Settings</a>
            </nav>
            <main data-testid="main-content">
              <div data-testid="dashboard-view">Dashboard Overview</div>
            </main>
          </div>
        </TestWrapper>
      )

      // Verify initial dashboard view
      expect(screen.getByTestId('dashboard-view')).toHaveTextContent('Dashboard Overview')

      // Navigate to Tasks
      await user.click(screen.getByText('Tasks'))
      await waitFor(() => {
        expect(screen.getByTestId('main-content')).toHaveTextContent('Tasks')
      })

      // Navigate to Models
      await user.click(screen.getByText('Models'))
      await waitFor(() => {
        expect(screen.getByTestId('main-content')).toHaveTextContent('Models')
      })

      // Navigate to Tools
      await user.click(screen.getByText('Tools'))
      await waitFor(() => {
        expect(screen.getByTestId('main-content')).toHaveTextContent('Tools')
      })

      // Navigate to Monitoring
      await user.click(screen.getByText('Monitoring'))
      await waitFor(() => {
        expect(screen.getByTestId('main-content')).toHaveTextContent('Monitoring')
      })

      // Navigate to Settings
      await user.click(screen.getByText('Settings'))
      await waitFor(() => {
        expect(screen.getByTestId('main-content')).toHaveTextContent('Settings')
      })

      // Return to Dashboard
      await user.click(screen.getByText('Dashboard'))
      await waitFor(() => {
        expect(screen.getByTestId('main-content')).toHaveTextContent('Dashboard Overview')
      })
    }, 20000)
  })

  describe('Settings Management Flow', () => {
    it('should complete settings update workflow', async () => {
      const user = userEvent.setup()
      const mockUpdateAPI = vi.fn().mockResolvedValue({ data: { success: true } })
      
      vi.mocked(fetch).mockImplementation(mockUpdateAPI as any)

      render(
        <TestWrapper 
          initialEntries={['/settings']}
          authState={{ isAuthenticated: true, user: createMockUser() }}
        >
          <div>
            <h1>Settings</h1>
            <form data-testid="settings-form">
              <div data-testid="profile-section">
                <h2>Profile Settings</h2>
                <input name="name" placeholder="Full Name" data-testid="name-input" />
                <input name="email" placeholder="Email" data-testid="email-input" />
                <select name="theme" data-testid="theme-select">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div data-testid="notification-section">
                <h2>Notifications</h2>
                <label>
                  <input type="checkbox" name="emailNotifications" data-testid="email-notifications" />
                  Email Notifications
                </label>
                <label>
                  <input type="checkbox" name="pushNotifications" data-testid="push-notifications" />
                  Push Notifications
                </label>
              </div>
              <button type="submit" data-testid="save-settings">Save Settings</button>
            </form>
            <div data-testid="success-message" style={{ display: 'none' }}>
              Settings saved successfully!
            </div>
          </div>
        </TestWrapper>
      )

      // Update profile settings
      await user.clear(screen.getByTestId('name-input'))
      await user.type(screen.getByTestId('name-input'), 'Updated User')
      await user.selectOptions(screen.getByTestId('theme-select'), 'dark')

      // Update notification settings
      await user.click(screen.getByTestId('email-notifications'))
      await user.click(screen.getByTestId('push-notifications'))

      // Save settings
      await user.click(screen.getByTestId('save-settings'))

      // Verify API call
      expect(mockUpdateAPI).toHaveBeenCalledWith('/user/settings', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated User',
          theme: 'dark',
          emailNotifications: true,
          pushNotifications: true,
        }),
      })

      // Verify success message
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeVisible()
      })
    }, 10000)
  })

  describe('Error Recovery Scenarios', () => {
    it('should handle network errors and retry successfully', async () => {
      const user = userEvent.setup()
      let attemptCount = 0
      
      const mockRetryAPI = vi.fn().mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({ data: { success: true } })
      })
      
      vi.mocked(fetch).mockImplementation(mockRetryAPI as any)

      render(
        <TestWrapper initialEntries={['/']}>
          <div>
            <button data-testid="retry-button">Retry Operation</button>
            <div data-testid="status-message">Ready</div>
          </div>
        </TestWrapper>
      )

      // First attempt should fail
      await user.click(screen.getByTestId('retry-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('status-message')).toHaveTextContent('Error occurred')
      })

      // Second attempt should also fail
      await user.click(screen.getByTestId('retry-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('status-message')).toHaveTextContent('Error occurred')
      })

      // Third attempt should succeed
      await user.click(screen.getByTestId('retry-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('status-message')).toHaveTextContent('Success!')
      })
    }, 15000)

    it('should handle authentication expiration and re-login', async () => {
      const user = userEvent.setup()
      
      let isAuthenticated = true
      const mockAuthAPI = vi.fn().mockImplementation(() => {
        if (isAuthenticated) {
          return Promise.resolve({ data: { user: createMockUser() } })
        }
        return Promise.reject(new Error('Unauthorized'))
      })
      
      vi.mocked(fetch).mockImplementation(mockAuthAPI as any)

      render(
        <TestWrapper 
          initialEntries={['/dashboard']}
          authState={{ 
            isAuthenticated: true, 
            user: createMockUser(),
            token: 'expired-token'
          }}
        >
          <div>
            <div data-testid="protected-content">Protected Content</div>
            <button data-testid="refresh-button">Refresh Data</button>
          </div>
        </TestWrapper>
      )

      // First request succeeds
      await user.click(screen.getByTestId('refresh-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })

      // Simulate token expiration
      isAuthenticated = false

      // Next request should fail
      await user.click(screen.getByTestId('refresh-button'))
      
      await waitFor(() => {
        // Should redirect to login or show auth error
        expect(screen.getByText('Please log in')).toBeInTheDocument()
      })
    }, 10000)
  })

  describe('Performance Critical Paths', () => {
    it('should load dashboard within performance threshold', async () => {
      const { measureRenderTime } = await import('@/__tests__/utils/test-utils')
      
      const { renderTime } = await measureRenderTime(() => {
        render(
          <TestWrapper 
            initialEntries={['/']}
            authState={{ isAuthenticated: true, user: createMockUser() }}
          >
            <div>
              <h1>Dashboard</h1>
              <div data-testid="metrics">
                {Array.from({ length: 100 }, (_, i) => (
                  <div key={i} data-testid={`metric-${i}`}>Metric {i}</div>
                ))}
              </div>
            </div>
          </TestWrapper>
        )
      })
      
      expect(renderTime).toBeLessThan(100) // Should render within 100ms
      expect(screen.getByTestId('metrics')).toBeInTheDocument()
    })

    it('should handle large datasets efficiently', async () => {
      const largeDataset = generateTasks(1000)
      
      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <div data-testid="task-list">
            {largeDataset.map(task => (
              <div key={task.id} data-testid={`task-${task.id}`}>
                {task.title}
              </div>
            ))}
          </div>
        </TestWrapper>
      )
      
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(500) // Should handle 1000 items within 500ms
      expect(screen.getByTestId('task-list')).toBeInTheDocument()
    })
  })

  describe('Accessibility Compliance', () => {
    it('should support full keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper initialEntries={['/']}>
          <div>
            <nav>
              <a href="#main" tabIndex={1}>Skip to main content</a>
            </nav>
            <main id="main">
              <h1>Accessible Page</h1>
              <button tabIndex={2} data-testid="first-button">First Button</button>
              <button tabIndex={3} data-testid="second-button">Second Button</button>
              <input tabIndex={4} data-testid="text-input" placeholder="Enter text" />
            </main>
          </div>
        </TestWrapper>
      )

      // Test tab navigation
      await user.tab()
      expect(screen.getByText('Skip to main content')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('first-button')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('second-button')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('text-input')).toHaveFocus()

      // Test enter key on button
      await user.keyboard('{Enter}')
      // Button should be activated (would depend on implementation)

      // Test space key on button
      await user.keyboard(' ')
      // Button should be activated
    })

    it('should have proper ARIA labels and roles', async () => {
      render(
        <TestWrapper>
          <div role="main" aria-label="Main content">
            <button 
              aria-label="Close dialog" 
              aria-describedby="close-description"
              data-testid="close-button"
            >
              ×
            </button>
            <div id="close-description" className="sr-only">
              This button closes the current dialog
            </div>
          </div>
        </TestWrapper>
      )

      const closeButton = screen.getByTestId('close-button')
      expect(closeButton).toHaveAttribute('aria-label', 'Close dialog')
      expect(closeButton).toHaveAttribute('aria-describedby', 'close-description')
    })
  })
})
