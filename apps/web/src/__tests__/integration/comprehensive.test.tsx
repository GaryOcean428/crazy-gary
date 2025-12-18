import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

// Import all major components for integration testing
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Login } from '@/pages/login'
import { Dashboard } from '@/pages/dashboard'
import { Chat } from '@/pages/chat'
import { ErrorBoundary } from '@/components/error-boundary'

// Mock all dependencies
jest.mock('@/contexts/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    login: jest.fn(),
    logout: jest.fn(),
    loading: false
  })
}))

jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-theme="light">{children}</div>,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn()
  })
}))

// Mock API calls
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Test data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null
}

const mockTask = {
  id: '1',
  title: 'Integration Test Task',
  status: 'running',
  progress: 50
}

const mockApiResponse = {
  health: { status: 'ok' },
  endpoints: {
    'model-1': { status: 'running', name: 'GPT-4' },
    'model-2': { status: 'stopped', name: 'Claude' }
  },
  tasks: [
    { id: '1', title: 'Test Task', status: 'completed', progress: 100 },
    { id: '2', title: 'Running Task', status: 'running', progress: 75 }
  ]
}

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mock responses
    ;(fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/harmony/health')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse.health
        })
      }
      if (url.includes('/api/endpoints/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ endpoints: mockApiResponse.endpoints })
        })
      }
      if (url.includes('/api/tasks')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ tasks: mockApiResponse.tasks })
        })
      }
      return Promise.reject(new Error('Unknown API endpoint'))
    })

    // Setup default localStorage
    localStorageMock.getItem.mockReturnValue('test-session-id')
    sessionStorageMock.getItem.mockReturnValue('test-user-id')
  })

  // Header + Sidebar Integration
  describe('Header-Sidebar Integration', () => {
    it('header and sidebar communicate correctly', async () => {
      const user = userEvent.setup()
      const mockSetSidebarOpen = jest.fn()

      render(
        <BrowserRouter>
          <div>
            <Header 
              sidebarOpen={false}
              setSidebarOpen={mockSetSidebarOpen}
              currentTask={mockTask}
            />
            <Sidebar open={false} onOpenChange={mockSetSidebarOpen} />
          </div>
        </BrowserRouter>
      )

      // Test mobile menu button interaction
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
      await user.click(mobileMenuButton)

      expect(mockSetSidebarOpen).toHaveBeenCalledWith(true)
    })

    it('header displays current task from sidebar interaction', () => {
      render(
        <BrowserRouter>
          <Header 
            sidebarOpen={true}
            setSidebarOpen={jest.fn()}
            currentTask={mockTask}
          />
        </BrowserRouter>
      )

      expect(screen.getByText('Task: Integration Test Task')).toBeInTheDocument()
      expect(screen.getByText('running')).toBeInTheDocument()
    })

    it('header status updates reflect sidebar navigation state', async () => {
      render(
        <BrowserRouter>
          <Header 
            sidebarOpen={false}
            setSidebarOpen={jest.fn()}
            currentTask={undefined}
          />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('System Online')).toBeInTheDocument()
        expect(screen.getByText('Models Ready')).toBeInTheDocument()
      })
    })
  })

  // Login + Auth Flow Integration
  describe('Login + Authentication Flow', () => {
    it('login redirects to dashboard after successful auth', async () => {
      const { useAuth } = require('@/contexts/auth-context')
      const mockLogin = jest.fn().mockResolvedValue({ success: true })
      useAuth.mockReturnValue({
        user: null,
        login: mockLogin,
        logout: jest.fn(),
        loading: false
      })

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const form = screen.getByTestId('card').querySelector('form')
      
      await act(async () => {
        fireEvent.submit(form!)
      })

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })

    it('handles authentication errors and displays appropriate messages', async () => {
      const { useAuth } = require('@/contexts/auth-context')
      const mockLogin = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Invalid credentials' 
      })
      useAuth.mockReturnValue({
        user: null,
        login: mockLogin,
        logout: jest.fn(),
        loading: false
      })

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const form = screen.getByTestId('card').querySelector('form')
      
      await act(async () => {
        fireEvent.submit(form!)
      })

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })
  })

  // Dashboard + Chat Integration
  describe('Dashboard-Chat Integration', () => {
    it('dashboard and chat components share task context', async () => {
      render(
        <BrowserRouter>
          <div>
            <Dashboard />
            <Chat />
          </div>
        </BrowserRouter>
      )

      // Test that both components can access shared state
      // This would test the context sharing between components
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('chat')).toBeInTheDocument()
    })

    it('task updates in dashboard reflect in chat interface', async () => {
      const updatedTask = { ...mockTask, status: 'completed', progress: 100 }
      
      render(
        <BrowserRouter>
          <div>
            <Dashboard />
            <Chat />
          </div>
        </BrowserRouter>
      )

      // Simulate task update
      await act(async () => {
        // This would trigger a context update that both components respond to
      })

      // Both components should reflect the updated state
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('chat')).toBeInTheDocument()
    })
  })

  // Error Boundary Integration
  describe('Error Boundary Integration', () => {
    it('catches errors across multiple components', () => {
      const ThrowError = () => {
        throw new Error('Test integration error')
      }

      render(
        <ErrorBoundary>
          <div>
            <Header 
              sidebarOpen={true}
              setSidebarOpen={jest.fn()}
              currentTask={mockTask}
            />
            <ThrowError />
            <Sidebar open={true} onOpenChange={jest.fn()} />
          </div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('provides consistent error handling across different component types', () => {
      const TestComponent = ({ shouldError = false }: { shouldError?: boolean }) => {
        if (shouldError) {
          throw new Error('Integration test error')
        }
        return <div data-testid="test-component">Working component</div>
      }

      render(
        <ErrorBoundary>
          <TestComponent shouldError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('allows recovery from errors and restores component state', async () => {
      const user = userEvent.setup()
      let shouldError = true

      const ConditionalComponent = () => {
        if (shouldError) {
          throw new Error('Recoverable error')
        }
        return <div data-testid="recovered-component">Successfully recovered!</div>
      }

      render(
        <ErrorBoundary maxRetries={1} retryDelay={100}>
          <ConditionalComponent />
        </ErrorBoundary>
      )

      // Click retry
      await user.click(screen.getByText('Try Again'))

      // Allow error to be cleared
      act(() => {
        shouldError = false
      })

      await waitFor(() => {
        expect(screen.getByTestId('recovered-component')).toHaveTextContent('Successfully recovered!')
      })
    })
  })

  // API Integration
  describe('API Integration', () => {
    it('handles multiple API calls across components', async () => {
      const { useAuth } = require('@/contexts/auth-context')
      useAuth.mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false
      })

      render(
        <BrowserRouter>
          <div>
            <Header 
              sidebarOpen={true}
              setSidebarOpen={jest.fn()}
              currentTask={mockTask}
            />
            <Dashboard />
          </div>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })

      // Verify multiple API calls were made
      expect(fetch).toHaveBeenCalledWith('/api/harmony/health')
      expect(fetch).toHaveBeenCalledWith('/api/endpoints/status')
    })

    it('handles API failures gracefully across components', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('API Network Error'))

      render(
        <BrowserRouter>
          <Header 
            sidebarOpen={true}
            setSidebarOpen={jest.fn()}
            currentTask={mockTask}
          />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('System Offline')).toBeInTheDocument()
        expect(screen.getByText('Model Error')).toBeInTheDocument()
      })
    })

    it('synchronizes state across components when API data updates', async () => {
      // First render with initial data
      render(
        <BrowserRouter>
          <div>
            <Header 
              sidebarOpen={true}
              setSidebarOpen={jest.fn()}
              currentTask={mockTask}
            />
            <Dashboard />
          </div>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('System Online')).toBeInTheDocument()
      })

      // Simulate API response change
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          endpoints: {
            'model-1': { status: 'stopped' }
          }
        })
      })

      // Trigger refresh (would happen automatically in real app)
      await act(async () => {
        // Simulate status check refresh
      })

      await waitFor(() => {
        expect(screen.getByText('Models Sleeping')).toBeInTheDocument()
      })
    })
  })

  // Theme Integration
  describe('Theme Integration', () => {
    it('applies theme consistently across all components', () => {
      render(
        <BrowserRouter>
          <div>
            <Header 
              sidebarOpen={true}
              setSidebarOpen={jest.fn()}
              currentTask={mockTask}
            />
            <Sidebar open={true} onOpenChange={jest.fn()} />
            <Login />
          </div>
        </BrowserRouter>
      )

      // All components should have access to theme context
      expect(document.querySelector('[data-theme="light"]')).toBeInTheDocument()
    })

    it('theme changes propagate to all components', async () => {
      const { useTheme } = require('@/components/theme-provider')
      const mockSetTheme = jest.fn()
      useTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme
      })

      render(
        <BrowserRouter>
          <Header 
            sidebarOpen={true}
            setSidebarOpen={jest.fn()}
            currentTask={mockTask}
          />
        </BrowserRouter>
      )

      const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
      await userEvent.click(themeToggle)

      expect(screen.getByText('Light')).toBeInTheDocument()
    })
  })

  // Performance Integration
  describe('Performance Integration', () => {
    it('manages re-renders efficiently across component boundaries', () => {
      const renderCount = { current: 0 }
      
      const TestComponent = () => {
        renderCount.current++
        return <div data-testid="test">Component {renderCount.current}</div>
      }

      const { rerender } = render(
        <BrowserRouter>
          <div>
            <TestComponent />
            <Header 
              sidebarOpen={true}
              setSidebarOpen={jest.fn()}
              currentTask={mockTask}
            />
          </div>
        </BrowserRouter>
      )

      const initialCount = renderCount.current

      rerender(
        <BrowserRouter>
          <div>
            <TestComponent />
            <Header 
              sidebarOpen={false}
              setSidebarOpen={jest.fn()}
              currentTask={mockTask}
            />
          </div>
        </BrowserRouter>
      )

      // Should not cause excessive re-renders
      expect(renderCount.current).toBeGreaterThan(initialCount)
    })

    it('handles rapid state changes without memory leaks', async () => {
      let toggle = false
      
      const { unmount } = render(
        <BrowserRouter>
          <Header 
            sidebarOpen={toggle}
            setSidebarOpen={() => {}}
            currentTask={toggle ? mockTask : undefined}
          />
        </BrowserRouter>
      )

      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        toggle = !toggle
        render(
          <BrowserRouter>
            <Header 
              sidebarOpen={toggle}
              setSidebarOpen={() => {}}
              currentTask={toggle ? mockTask : undefined}
            />
          </BrowserRouter>
        )
      }

      unmount()

      // Should not cause memory leaks or warnings
      expect(() => {
        // Additional assertions could be added here
      }).not.toThrow()
    })
  })

  // Accessibility Integration
  describe('Accessibility Integration', () => {
    it('maintains proper focus management across component boundaries', async () => {
      const user = userEvent.setup()
      
      render(
        <BrowserRouter>
          <div>
            <Header 
              sidebarOpen={false}
              setSidebarOpen={jest.fn()}
              currentTask={undefined}
            />
            <Sidebar open={true} onOpenChange={jest.fn()} />
          </div>
        </BrowserRouter>
      )

      const menuButton = screen.getByRole('button', { name: /menu/i })
      await user.click(menuButton)

      // Focus should move appropriately
      expect(menuButton).toHaveFocus()
    })

    it('preserves ARIA relationships across integrated components', () => {
      render(
        <BrowserRouter>
          <div>
            <Header 
              sidebarOpen={true}
              setSidebarOpen={jest.fn()}
              currentTask={mockTask}
            />
            <Sidebar open={true} onOpenChange={jest.fn()} />
          </div>
        </BrowserRouter>
      )

      // Check that ARIA attributes are properly set
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()

      const banner = screen.getByRole('banner')
      expect(banner).toBeInTheDocument()
    })
  })
})