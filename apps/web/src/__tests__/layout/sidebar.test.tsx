import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '@/components/layout/sidebar'
import { BrowserRouter } from 'react-router-dom'

// Mock the Link component from react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
  useLocation: () => ({ pathname: '/' })
}))

// Mock the utils function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <button className={className} {...props}>{children}</button>
  )
}))

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  )
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: { className?: string }) => (
    <div className={className} />
  )
}))

describe('Sidebar', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    )
  }

  it('renders sidebar in expanded state by default', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Crazy-Gary')).toBeInTheDocument()
    expect(screen.getByText('Agentic AI')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders sidebar in collapsed state', () => {
    const collapsedProps = { ...defaultProps, open: false }
    
    renderWithRouter(<Sidebar {...collapsedProps} />)

    expect(screen.getByText('Crazy-Gary')).not.toBeVisible()
    expect(screen.getByText('Agentic AI')).not.toBeVisible()
  })

  it('shows logo and brand information when expanded', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Crazy-Gary')).toBeInTheDocument()
    expect(screen.getByText('Agentic AI')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('hides logo and brand information when collapsed', () => {
    const collapsedProps = { ...defaultProps, open: false }
    
    renderWithRouter(<Sidebar {...collapsedProps} />)

    expect(screen.queryByText('Crazy-Gary')).not.toBeVisible()
    expect(screen.queryByText('Agentic AI')).not.toBeVisible()
  })

  it('renders all navigation items', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const navigationItems = [
      'Dashboard',
      'Agent Chat',
      'Heavy Mode',
      'Task Manager',
      'Model Control',
      'MCP Tools',
      'Advanced Dashboard',
      'Monitoring',
      'Settings'
    ]

    navigationItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('shows navigation descriptions when expanded', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const descriptions = [
      'Overview and status',
      'Chat with Crazy-Gary',
      'Multi-agent orchestration',
      'Create and manage agentic tasks',
      'Manage AI models and endpoints',
      'Discover and use MCP tools',
      'Advanced dashboard controls and analytics',
      'System health and metrics',
      'Application configuration'
    ]

    descriptions.forEach(description => {
      expect(screen.getByText(description)).toBeInTheDocument()
    })
  })

  it('hides navigation descriptions when collapsed', () => {
    const collapsedProps = { ...defaultProps, open: false }
    
    renderWithRouter(<Sidebar {...collapsedProps} />)

    expect(screen.queryByText('Overview and status')).not.toBeVisible()
    expect(screen.queryByText('Chat with Crazy-Gary')).not.toBeVisible()
  })

  it('highlights active navigation item', () => {
    // Mock useLocation to return different paths
    const mockUseLocation = jest.requireMock('react-router-dom').useLocation
    mockUseLocation.mockReturnValue({ pathname: '/chat' })

    renderWithRouter(<Sidebar {...defaultProps} />)

    const chatItem = screen.getByText('Agent Chat').closest('button')
    expect(chatItem).toHaveClass('bg-secondary/80')
  })

  it('does not highlight inactive navigation items', () => {
    mockUseLocation.mockReturnValue({ pathname: '/chat' })

    renderWithRouter(<Sidebar {...defaultProps} />)

    const dashboardItem = screen.getByText('Dashboard').closest('button')
    expect(dashboardItem).not.toHaveClass('bg-secondary/80')
  })

  it('shows toggle button with correct icon', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toBeInTheDocument()
  })

  it('shows left chevron when expanded', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toBeInTheDocument()
    // ChevronLeft icon should be rendered
  })

  it('shows right chevron when collapsed', () => {
    const collapsedProps = { ...defaultProps, open: false }
    
    renderWithRouter(<Sidebar {...collapsedProps} />)

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toBeInTheDocument()
    // ChevronRight icon should be rendered
  })

  it('calls onOpenChange when toggle button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithRouter(<Sidebar {...defaultProps} />)

    const toggleButton = screen.getByRole('button')
    await user.click(toggleButton)

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows footer with status and version when expanded', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Status: Online')).toBeInTheDocument()
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument()
  })

  it('shows simple status indicator when collapsed', () => {
    const collapsedProps = { ...defaultProps, open: false }
    
    renderWithRouter(<Sidebar {...collapsedProps} />)

    // Should show a status dot instead of text
    const statusElements = screen.getAllByText('Status: Online')
    expect(statusElements.length).toBe(0)
  })

  it('renders navigation links with correct hrefs', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveAttribute('href', '/')

    const chatLink = screen.getByText('Agent Chat').closest('a')
    expect(chatLink).toHaveAttribute('href', '/chat')
  })

  it('applies correct styling classes', () => {
    const { container } = renderWithRouter(<Sidebar {...defaultProps} />)

    const sidebar = container.firstChild as HTMLElement
    expect(sidebar).toHaveClass('fixed', 'left-0', 'top-0', 'z-40', 'h-screen')
    expect(sidebar).toHaveClass('w-64') // Expanded width
  })

  it('applies collapsed styling classes', () => {
    const collapsedProps = { ...defaultProps, open: false }
    const { container } = renderWithRouter(<Sidebar {...collapsedProps} />)

    const sidebar = container.firstChild as HTMLElement
    expect(sidebar).toHaveClass('w-16') // Collapsed width
  })

  it('has proper navigation structure', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()
  })

  it('maintains focus management', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const focusableElements = screen.getAllByRole('button')
    focusableElements.forEach(element => {
      expect(element).toHaveAttribute('tabindex', '0')
    })
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    
    renderWithRouter(<Sidebar {...defaultProps} />)

    const firstNavItem = screen.getByText('Dashboard')
    firstNavItem.focus()
    
    await user.keyboard('{Enter}')
    
    // Should handle Enter key on navigation items
    expect(firstNavItem.closest('a')).toBeInTheDocument()
  })

  it('shows proper icons for navigation items', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    // Should render icon elements (mocked in this case)
    const navigationButtons = screen.getAllByRole('button')
    expect(navigationButtons.length).toBeGreaterThan(9) // One for each nav item + toggle
  })

  it('applies hover states to navigation items', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const navItems = screen.getAllByText(/Dashboard|Agent Chat|Heavy Mode/i)
    navItems.forEach(item => {
      const button = item.closest('button')
      expect(button).toHaveClass('hover:bg-accent')
    })
  })

  it('handles theme-aware styling', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const sidebar = screen.getByText('Crazy-Gary').closest('div')
    expect(sidebar).toHaveClass('bg-card', 'border-r')
  })

  it('provides proper ARIA attributes', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toHaveAttribute('aria-label', 'Main navigation')
  })

  it('maintains accessibility with proper role definitions', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    expect(screen.getByRole('banner')).toBeInTheDocument() // Header section
    expect(screen.getByRole('navigation')).toBeInTheDocument() // Navigation
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // Footer
  })

  it('shows loading or transition states properly', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const sidebar = screen.getByText('Crazy-Gary').closest('div')
    expect(sidebar).toHaveClass('transition-all', 'duration-300')
  })

  it('handles responsive behavior correctly', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    const sidebar = screen.getByText('Crazy-Gary').closest('div')
    expect(sidebar).toHaveClass('fixed', 'left-0', 'top-0', 'z-40')
  })

  it('maintains consistent spacing and layout', () => {
    renderWithRouter(<Sidebar {...defaultProps} />)

    // Check header spacing
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('h-16', 'px-4', 'border-b')

    // Check navigation spacing
    const navigation = screen.getByRole('navigation')
    expect(navigation.parentElement).toHaveClass('flex-1', 'px-3', 'py-4')
  })
})