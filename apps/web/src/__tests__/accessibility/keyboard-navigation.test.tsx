import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Test keyboard navigation patterns
describe('Keyboard Navigation', () => {
  describe('Tab Order', () => {
    it('maintains logical tab order through interactive elements', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <div>
            <label htmlFor="first-input">First Input</label>
            <Input id="first-input" data-testid="first-input" />
          </div>
          <div>
            <Button type="button" data-testid="first-button">First Button</Button>
          </div>
          <div>
            <label htmlFor="second-input">Second Input</label>
            <Input id="second-input" data-testid="second-input" />
          </div>
          <div>
            <Button type="button" data-testid="second-button">Second Button</Button>
          </div>
        </form>
      )
      
      // Focus first element
      await user.tab()
      expect(screen.getByTestId('first-input')).toHaveFocus()
      
      // Tab to button
      await user.tab()
      expect(screen.getByTestId('first-button')).toHaveFocus()
      
      // Tab to second input
      await user.tab()
      expect(screen.getByTestId('second-input')).toHaveFocus()
      
      // Tab to second button
      await user.tab()
      expect(screen.getByTestId('second-button')).toHaveFocus()
    })

    it('respects custom tabIndex values', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <button tabIndex={3} data-testid="high-priority">High Priority</button>
          <button tabIndex={1} data-testid="normal-priority">Normal Priority</button>
          <button tabIndex={2} data-testid="medium-priority">Medium Priority</button>
        </div>
      )
      
      // Start tabbing - should go to tabIndex 1 first
      await user.tab()
      expect(screen.getByTestId('normal-priority')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('medium-priority')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('high-priority')).toHaveFocus()
    })

    it('skips disabled elements', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <button data-testid="first">First Button</button>
          <button disabled data-testid="disabled">Disabled Button</button>
          <button data-testid="second">Second Button</button>
        </div>
      )
      
      await user.tab()
      expect(screen.getByTestId('first')).toHaveFocus()
      
      await user.tab()
      // Should skip disabled button and focus second button
      expect(screen.getByTestId('second')).toHaveFocus()
    })
  })

  describe('Arrow Key Navigation', () => {
    it('supports arrow key navigation in lists', async () => {
      const user = userEvent.setup()
      
      const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4']
      
      render(
        <ul role="listbox" aria-label="Test List">
          {items.map((item, index) => (
            <li
              key={index}
              role="option"
              aria-selected={index === 0}
              tabIndex={index === 0 ? 0 : -1}
              data-testid={`item-${index + 1}`}
            >
              {item}
            </li>
          ))}
        </ul>
      )
      
      const firstItem = screen.getByTestId('item-1')
      await user.click(firstItem)
      
      // Arrow down should move to next item
      fireEvent.keyDown(firstItem, { key: 'ArrowDown' })
      
      const secondItem = screen.getByTestId('item-2')
      expect(secondItem).toHaveAttribute('aria-selected', 'true')
      expect(secondItem).toHaveFocus()
      
      // Arrow up should move to previous item
      fireEvent.keyDown(secondItem, { key: 'ArrowUp' })
      
      expect(firstItem).toHaveAttribute('aria-selected', 'true')
      expect(firstItem).toHaveFocus()
    })

    it('wraps around in cyclic navigation', async () => {
      const user = userEvent.setup()
      
      const items = ['First', 'Second', 'Third']
      
      render(
        <div role="group" aria-label="Cyclic Navigation" data-testid="container">
          {items.map((item, index) => (
            <button
              key={index}
              tabIndex={index === 0 ? 0 : -1}
              data-testid={`button-${index + 1}`}
            >
              {item}
            </button>
          ))}
        </div>
      )
      
      const firstButton = screen.getByTestId('button-1')
      await user.click(firstButton)
      
      // Navigate down and wrap around
      fireEvent.keyDown(firstButton, { key: 'ArrowDown' })
      expect(screen.getByTestId('button-2')).toHaveFocus()
      
      fireEvent.keyDown(screen.getByTestId('button-2'), { key: 'ArrowDown' })
      expect(screen.getByTestId('button-3')).toHaveFocus()
      
      // Should wrap to first
      fireEvent.keyDown(screen.getByTestId('button-3'), { key: 'ArrowDown' })
      expect(screen.getByTestId('button-1')).toHaveFocus()
    })

    it('handles horizontal arrow navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <div role="tablist" aria-label="Horizontal Tabs">
          <button role="tab" aria-selected={true} tabIndex={0} data-testid="tab-1">
            Tab 1
          </button>
          <button role="tab" aria-selected={false} tabIndex={-1} data-testid="tab-2">
            Tab 2
          </button>
          <button role="tab" aria-selected={false} tabIndex={-1} data-testid="tab-3">
            Tab 3
          </button>
        </div>
      )
      
      const firstTab = screen.getByTestId('tab-1')
      await user.click(firstTab)
      
      // Arrow right should move to next tab
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
      expect(screen.getByTestId('tab-2')).toHaveFocus()
      
      // Arrow left should move to previous tab
      fireEvent.keyDown(screen.getByTestId('tab-2'), { key: 'ArrowLeft' })
      expect(screen.getByTestId('tab-1')).toHaveFocus()
    })
  })

  describe('Enter and Space Key Activation', () => {
    it('activates buttons with Enter and Space keys', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(
        <Button onClick={handleClick} data-testid="test-button">
          Click Me
        </Button>
      )
      
      const button = screen.getByTestId('test-button')
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledTimes(2)
      
      // Test Space key
      fireEvent.keyDown(button, { key: ' ' })
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('activates links with Enter key', async () => {
      const user = userEvent.setup()
      
      render(
        <a href="#test" data-testid="test-link">
          Test Link
        </a>
      )
      
      const link = screen.getByTestId('test-link')
      await user.click(link)
      
      // Enter key should also activate the link
      fireEvent.keyDown(link, { key: 'Enter' })
    })

    it('does not activate disabled buttons', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(
        <Button disabled onClick={handleClick} data-testid="disabled-button">
          Disabled Button
        </Button>
      )
      
      const button = screen.getByTestId('disabled-button')
      
      // Should not be able to focus disabled button
      await user.tab()
      expect(button).not.toHaveFocus()
      
      // Manual key events should not trigger click
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Escape Key Handling', () => {
    it('closes modals with Escape key', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()
      
      const TestModal = () => {
        const [isOpen, setIsOpen] = React.useState(true)
        
        React.useEffect(() => {
          const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              setIsOpen(false)
              handleClose()
            }
          }
          
          if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
          }
        }, [isOpen])
        
        if (!isOpen) return null
        
        return (
          <div role="dialog" aria-modal="true" data-testid="modal">
            <button>Close</button>
          </div>
        )
      }
      
      render(<TestModal />)
      
      const modal = screen.getByTestId('modal')
      expect(modal).toBeInTheDocument()
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(handleClose).toHaveBeenCalled()
    })

    it('dismisses dropdowns with Escape key', async () => {
      const user = userEvent.setup()
      const handleDismiss = vi.fn()
      
      const TestDropdown = () => {
        const [isOpen, setIsOpen] = React.useState(true)
        
        React.useEffect(() => {
          const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              setIsOpen(false)
              handleDismiss()
            }
          }
          
          document.addEventListener('keydown', handleEscape)
          return () => document.removeEventListener('keydown', handleEscape)
        }, [])
        
        return (
          <div role="menu" aria-label="Test Menu" data-testid="dropdown">
            {isOpen && (
              <ul>
                <li role="menuitem">Item 1</li>
                <li role="menuitem">Item 2</li>
              </ul>
            )}
          </div>
        )
      }
      
      render(<TestDropdown />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(handleDismiss).toHaveBeenCalled()
    })
  })

  describe('Home and End Keys', () => {
    it('navigates to first and last items with Home and End keys', async () => {
      const user = userEvent.setup()
      
      const items = ['First', 'Second', 'Third', 'Last']
      
      render(
        <ul role="listbox" aria-label="Navigation Test">
          {items.map((item, index) => (
            <li
              key={index}
              role="option"
              aria-selected={index === 0}
              tabIndex={index === 0 ? 0 : -1}
              data-testid={`nav-item-${index + 1}`}
            >
              {item}
            </li>
          ))}
        </ul>
      )
      
      const firstItem = screen.getByTestId('nav-item-1')
      await user.click(firstItem)
      
      // Home key should go to first item
      fireEvent.keyDown(firstItem, { key: 'Home' })
      expect(firstItem).toHaveFocus()
      
      // End key should go to last item
      fireEvent.keyDown(firstItem, { key: 'End' })
      const lastItem = screen.getByTestId('nav-item-4')
      expect(lastItem).toHaveFocus()
    })
  })

  describe('Skip Links', () => {
    it('provides keyboard access to skip navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <a href="#main-content" className="skip-link" data-testid="skip-link">
            Skip to main content
          </a>
          <nav>
            <a href="#">Navigation Link 1</a>
            <a href="#">Navigation Link 2</a>
          </nav>
          <main id="main-content" data-testid="main-content">
            Main content
          </main>
        </div>
      )
      
      const skipLink = screen.getByTestId('skip-link')
      
      // Skip link should be focusable
      await user.tab()
      expect(skipLink).toHaveFocus()
      
      // Activating skip link should focus main content
      fireEvent.click(skipLink)
      expect(screen.getByTestId('main-content')).toHaveFocus()
    })
  })
})
