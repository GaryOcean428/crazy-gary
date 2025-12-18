import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  SkipToMain,
  ScreenReaderOnly,
  VisuallyHidden,
  FocusTrap,
  LiveRegion,
  AccessibleButton,
  AccessibleField,
  useAnnouncements,
  useFocusManagement,
  useKeyboardNavigation
} from '@/components/accessibility'

// Mock IntersectionObserver for tests
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('Accessibility Components', () => {
  describe('SkipToMain', () => {
    it('renders skip link with proper attributes', () => {
      render(
        <>
          <SkipToMain />
          <main id="main-content">Main content</main>
        </>
      )
      
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
      expect(skipLink).toHaveClass('sr-only')
    })

    it('has proper focus styling', () => {
      render(
        <>
          <SkipToMain />
          <main id="main-content">Main content</main>
        </>
      )
      
      const skipLink = screen.getByText('Skip to main content')
      skipLink.focus()
      
      expect(skipLink).toHaveClass('focus:not-sr-only')
      expect(skipLink).toHaveClass('focus:absolute')
      expect(skipLink).toHaveClass('focus:top-4')
      expect(skipLink).toHaveClass('focus:left-4')
      expect(skipLink).toHaveClass('focus:z-50')
    })
  })

  describe('ScreenReaderOnly', () => {
    it('renders content that is only visible to screen readers', () => {
      render(<ScreenReaderOnly>Screen reader only text</ScreenReaderOnly>)
      
      const element = screen.getByText('Screen reader only text')
      expect(element).toBeInTheDocument()
      expect(element).toHaveClass('sr-only')
    })

    it('accepts custom component types', () => {
      render(<ScreenReaderOnly as="div">Hidden content</ScreenReaderOnly>)
      
      const element = screen.getByText('Hidden content')
      expect(element).toHaveClass('sr-only')
      expect(element.tagName).toBe('DIV')
    })
  })

  describe('VisuallyHidden', () => {
    it('hides content visually while keeping it accessible', () => {
      render(<VisuallyHidden>Hidden but accessible</VisuallyHidden>)
      
      const element = screen.getByText('Hidden but accessible')
      expect(element).toBeInTheDocument()
      expect(element).toHaveClass('absolute', 'w-px', 'h-px', 'overflow-hidden')
      expect(element.style.clip).toBe('rect(0, 0, 0, 0)')
      expect(element.style.clipPath).toBe('inset(50%)')
    })
  })

  describe('FocusTrap', () => {
    it('traps focus within container when active', async () => {
      const user = userEvent.setup()
      
      render(
        <FocusTrap active={true}>
          <button type="button">First button</button>
          <button type="button">Second button</button>
        </FocusTrap>
      )
      
      const firstButton = screen.getByText('First button')
      const secondButton = screen.getByText('Second button')
      
      // Focus first button
      await user.click(firstButton)
      expect(firstButton).toHaveFocus()
      
      // Tab to second button
      await user.tab()
      expect(secondButton).toHaveFocus()
      
      // Tab again should cycle back to first button
      await user.tab()
      expect(firstButton).toHaveFocus()
    })

    it('does not trap focus when inactive', async () => {
      const user = userEvent.setup()
      
      render(
        <FocusTrap active={false}>
          <button type="button">First button</button>
          <button type="button">Second button</button>
        </FocusTrap>
      )
      
      const firstButton = screen.getByText('First button')
      const secondButton = screen.getByText('Second button')
      
      await user.click(firstButton)
      expect(firstButton).toHaveFocus()
      
      await user.tab()
      expect(secondButton).toHaveFocus()
      
      // Should not cycle back when trap is inactive
      await user.tab()
      expect(secondButton).not.toHaveFocus()
    })
  })

  describe('LiveRegion', () => {
    it('renders with proper ARIA attributes', () => {
      render(
        <LiveRegion _politeness="assertive" atomic={true}>
          Important announcement
        </LiveRegion>
      )
      
      const liveRegion = screen.getByText('Important announcement')
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive')
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
      expect(liveRegion).toHaveClass('sr-only')
    })
  })

  describe('useAnnouncements Hook', () => {
    it('provides announcement functionality', () => {
      const TestComponent = () => {
        const { announcement, announce, LiveRegion } = useAnnouncements()
        
        return (
          <div>
            <button onClick={() => announce('Test announcement')}>Announce</button>
            <LiveRegion />
            <div data-testid="announcement">{announcement}</div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const button = screen.getByText('Announce')
      const announcementDiv = screen.getByTestId('announcement')
      
      expect(announcementDiv).toBeEmptyDOMElement()
      
      fireEvent.click(button)
      
      expect(announcementDiv).toHaveTextContent('Test announcement')
    })
  })

  describe('useFocusManagement Hook', () => {
    it('manages focus state correctly', () => {
      const TestComponent = () => {
        const { saveFocus, restoreFocus, focusFirst } = useFocusManagement()
        const containerRef = React.useRef<HTMLDivElement>(null)
        
        return (
          <div ref={containerRef}>
            <button id="button1">Button 1</button>
            <button id="button2">Button 2</button>
            <button onClick={() => {
              saveFocus()
              focusFirst(containerRef.current)
            }}>Save & Focus</button>
            <button onClick={restoreFocus}>Restore Focus</button>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const button1 = screen.getByText('Button 1')
      const saveFocusButton = screen.getByText('Save & Focus')
      
      // Focus button 1 and save focus
      fireEvent.click(button1)
      fireEvent.click(saveFocusButton)
      
      // Should focus first element in container
      expect(button1).toHaveFocus()
    })
  })

  describe('useKeyboardNavigation Hook', () => {
    it('handles keyboard navigation', () => {
      const TestComponent = () => {
        const items = ['Item 1', 'Item 2', 'Item 3']
        const { activeIndex, handleKeyDown } = useKeyboardNavigation(items)
        
        return (
          <div>
            <ul>
              {items.map((item, index) => (
                <li
                  key={index}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onKeyDown={handleKeyDown}
                  data-active={index === activeIndex}
                >
                  {item}
                </li>
              ))}
            </ul>
            <div data-testid="active-index">{activeIndex}</div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const activeIndexDisplay = screen.getByTestId('active-index')
      expect(activeIndexDisplay).toHaveTextContent('0')
      
      const firstItem = screen.getByText('Item 1')
      fireEvent.keyDown(firstItem, { key: 'ArrowDown' })
      
      expect(activeIndexDisplay).toHaveTextContent('1')
      
      fireEvent.keyDown(firstItem, { key: 'ArrowUp' })
      
      expect(activeIndexDisplay).toHaveTextContent('0')
    })
  })

  describe('AccessibleButton', () => {
    it('renders with proper accessibility attributes', () => {
      render(
        <AccessibleButton
          ariaLabel="Custom button"
          ariaDescribedBy="description"
          loading={true}
        >
          Button Text
        </AccessibleButton>
      )
      
      const button = screen.getByText('Button Text')
      expect(button).toHaveAttribute('aria-label', 'Custom button')
      expect(button).toHaveAttribute('aria-describedby', 'description')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toHaveAttribute('disabled')
    })

    it('handles loading state with spinner', () => {
      render(
        <AccessibleButton loading={true}>
          Loading Button
        </AccessibleButton>
      )
      
      const button = screen.getByText('Loading Button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toBeDisabled()
    })

    it('shows spinner when loading', () => {
      render(<AccessibleButton loading={true}>Loading Button</AccessibleButton>)
      
      const spinner = button => button.querySelector('.animate-spin')
      const buttonElement = screen.getByRole('button', { name: 'Loading Button' })
      
      expect(spinner(buttonElement)).toBeInTheDocument()
    })
  })

  describe('AccessibleField', () => {
    it('associates label with input correctly', () => {
      render(
        <AccessibleField label="Email" id="email" required={true}>
          <input type="email" />
        </AccessibleField>
      )
      
      const label = screen.getByText('Email')
      const input = screen.getByRole('textbox', { name: 'Email' })
      
      expect(label).toHaveAttribute('for', 'email')
      expect(input).toHaveAttribute('id', 'email')
      expect(input).toHaveAttribute('aria-required', 'true')
    })

    it('displays error messages with proper ARIA attributes', () => {
      render(
        <AccessibleField
          label="Password"
          id="password"
          error="Password is required"
        >
          <input type="password" />
        </AccessibleField>
      )
      
      const errorElement = screen.getByText('Password is required')
      expect(errorElement).toHaveAttribute('role', 'alert')
      
      const input = screen.getByRole('textbox', { name: 'Password' })
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('associates help text correctly', () => {
      render(
        <AccessibleField
          label="Username"
          id="username"
          help="Choose a unique username"
        >
          <input type="text" />
        </AccessibleField>
      )
      
      const helpText = screen.getByText('Choose a unique username')
      expect(helpText).toHaveAttribute('id')
      
      const input = screen.getByRole('textbox', { name: 'Username' })
      expect(input).toHaveAttribute('aria-describedby')
    })

    it('marks required fields correctly', () => {
      render(
        <AccessibleField
          label="Required Field"
          id="required"
          required={true}
        >
          <input type="text" />
        </AccessibleField>
      )
      
      const requiredIndicator = screen.getByText('*')
      expect(requiredIndicator).toHaveAttribute('aria-label', 'required')
    })
  })
})

// Integration test with axe-core
describe('Accessibility Integration Tests', () => {
  it('should not have accessibility violations in accessibility components', async () => {
    render(
      <>
        <SkipToMain />
        <main id="main-content">
          <ScreenReaderOnly>Hidden content</ScreenReaderOnly>
          <VisuallyHidden>Visually hidden</VisuallyHidden>
          <FocusTrap>
            <button>Trapped button</button>
          </FocusTrap>
          <LiveRegion>
            <div>Live content</div>
          </LiveRegion>
          <AccessibleButton>Accessible Button</AccessibleButton>
          <AccessibleField label="Test Field">
            <input type="text" />
          </AccessibleField>
        </main>
      </>
    )
    
    expect(document.body).toHaveNoViolations()
  })
})
