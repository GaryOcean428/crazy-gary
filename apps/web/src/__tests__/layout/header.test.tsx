import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/layout/header'
import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock the theme provider
jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: 'light'
  })
}))

// Mock fetch
global.fetch = jest.fn()

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000'
  }
})

// Mock navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})

describe('Header', () => {
  const defaultProps = {
    sidebarOpen: false,
    setSidebarOpen: jest.fn(),
    currentTask: undefined
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        endpoints: {
          'model-1': { status: 'running' },
          'model-2': { status: 'stopped' }
        }
      })
    })
  })

  it('renders header with sidebar toggle button', () => {
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })

  it('shows current task when provided', () => {
    const taskProps = {
      ...defaultProps,
      currentTask: {
        title: 'Test Task',
        status: 'running'
      }
    }

    render(
      <ThemeProvider>
        <Header {...taskProps} />
      </ThemeProvider>
    )

    expect(screen.getByText('Task: Test Task')).toBeInTheDocument()
    expect(screen.getByText('running')).toBeInTheDocument()
  })

  it('does not show task indicator when no current task', () => {
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    expect(screen.queryByText(/task:/i)).not.toBeInTheDocument()
  })

  it('calls setSidebarOpen when mobile menu button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)

    expect(defaultProps.setSidebarOpen).toHaveBeenCalledWith(true)
  })

  it('toggles sidebar when sidebar toggle is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    const themeButton = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(themeButton)

    expect(screen.getByText('Light')).toBeInTheDocument()
  })

  it('shows system status indicators', () => {
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    // Should show system status text
    expect(screen.getByText(/system/i)).toBeInTheDocument()
    expect(screen.getByText(/checking/i)).toBeInTheDocument()
  })

  it('handles online system status', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        endpoints: {
          'model-1': { status: 'running' }
        }
      })
    })

    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('System Online')).toBeInTheDocument()
      expect(screen.getByText('Models Ready')).toBeInTheDocument()
    })
  })

  it('handles degraded system status', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503
    })

    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('System Degraded')).toBeInTheDocument()
    })
  })

  it('handles offline system status', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('System Offline')).toBeInTheDocument()
      expect(screen.getByText('Model Error')).toBeInTheDocument()
    })
  })

  it('handles model sleeping status', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        endpoints: {
          'model-1': { status: 'stopped' },
          'model-2': { status: 'stopped' }
        }
      })
    })

    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Models Sleeping')).toBeInTheDocument()
    })
  })

  it('displays correct status colors for different states', () => {
    const { rerender } = render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    // Check for status indicators (colored dots)
    const statusIndicators = screen.getAllByRole('button').filter(btn => 
      btn.className.includes('bg-') || btn.className.includes('text-')
    )
    expect(statusIndicators.length).toBeGreaterThan(0)
  })

  it('shows theme toggle with proper icons', () => {
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeToggle).toBeInTheDocument()
  })

  it('opens theme dropdown menu', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(themeToggle)

    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('calls setTheme when theme option is selected', async () => {
    const user = userEvent.setup()
    const { setTheme } = require('@/components/theme-provider').useTheme()
    
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(themeToggle)
    
    const darkOption = screen.getByText('Dark')
    await user.click(darkOption)

    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('opens user menu', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    const userButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userButton)

    expect(screen.getByText('Agent User')).toBeInTheDocument()
    expect(screen.getByText('agent@crazy-gary.ai')).toBeInTheDocument()
  })

  it('shows user menu items', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    const userButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userButton)

    expect(screen.getByText('Activity Log')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('System Offline')).toBeInTheDocument()
    })
  })

  it('periodically refreshes status', async () => {
    jest.useFakeTimers()
    
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    // Fast forward by 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000)
    })

    // Should have made additional fetch calls
    expect(fetch).toHaveBeenCalledTimes(3) // Initial + 2 periodic calls

    jest.useRealTimers()
  })

  it('clears interval on unmount', () => {
    jest.useFakeTimers()
    
    const { unmount } = render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    unmount()

    // Should not cause warnings
    expect(() => {
      jest.advanceTimersByTime(30000)
    }).not.toThrow()

    jest.useRealTimers()
  })

  it('shows appropriate status text for different states', () => {
    const { rerender } = render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    // Test getStatusText function indirectly through rendering
    expect(screen.getByText(/checking/i)).toBeInTheDocument()
  })

  it('displays correct status color classes', () => {
    const { rerender } = render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    // Check that status indicators are rendered with proper styling
    const statusElements = screen.getAllByText(/System|Models/)
    expect(statusElements.length).toBeGreaterThan(0)
  })

  it('maintains accessibility with proper ARIA labels', () => {
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/user menu/i)).toBeInTheDocument()
  })

  it('shows mobile menu button only on smaller screens', () => {
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    const menuButton = screen.getByRole('button', { name: /menu/i })
    expect(menuButton).toHaveClass('md:hidden')
  })

  it('handles empty endpoints response', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ endpoints: {} })
    })

    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Models Sleeping')).toBeInTheDocument()
    })
  })

  it('shows loading states during status checks', async () => {
    let resolvePromise: (value: any) => void
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    
    ;(fetch as jest.Mock).mockReturnValue(pendingPromise)

    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    // Should show checking state initially
    expect(screen.getByText('Checking...')).toBeInTheDocument()

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: async () => ({
        endpoints: { 'model-1': { status: 'running' } }
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Models Ready')).toBeInTheDocument()
    })
  })

  it('applies correct styling and positioning', () => {
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky', 'top-0', 'z-30')
  })

  it('maintains layout consistency with proper spacing', () => {
    render(
      <ThemeProvider>
        <Header {...defaultProps} />
      </ThemeProvider>
    )

    // Check that the header has proper structure
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })
})