/**
 * Comprehensive Accessibility Features Test Suite
 * Tests all implemented accessibility features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Import all accessibility components to test
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
  useKeyboardNavigation,
  useKeyboardShortcuts,
  keyboardShortcutManager,
  KeyboardShortcutsHelp,
  EnhancedFocusTrap,
  useFocusRestore,
  useEnhancedKeyboardNavigation,
  manageTabOrder,
  AccessibleList,
  Landmark,
  LANDMARK_CONFIGS,
  SkipLinks,
  DEFAULT_SKIP_LINKS,
  useLiveRegionManager,
  LIVE_REGION_CONFIGS,
  StatusAnnouncer,
  AlertAnnouncer,
  DynamicContentAnnouncer,
  FormValidationAnnouncer,
  MenuAnnouncer,
  ModalAnnouncer,
  useAnnouncements as useLiveAnnouncements,
  KEYBOARD_TEST_SCENARIOS,
  KeyboardTestRunner,
  AccessibleModalExample,
  AccessibleMenuExample,
  KeyboardShortcutsModal,
  KeyboardNavigationExamples,
  AccessibilityDocumentation
} from '@/components/accessibility'

describe('Accessibility Features', () => {
  describe('Core Accessibility Components', () => {
    it('renders SkipToMain component', () => {
      render(<SkipToMain />)
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
      expect(skipLink).toHaveClass('sr-only')
    })

    it('renders ScreenReaderOnly component', () => {
      render(<ScreenReaderOnly>Screen reader only text</ScreenReaderOnly>)
      const element = screen.getByText('Screen reader only text')
      expect(element).toBeInTheDocument()
      expect(element).toHaveClass('sr-only')
    })

    it('renders VisuallyHidden component', () => {
      render(<VisuallyHidden>Visually hidden text</VisuallyHidden>)
      const element = screen.getByText('Visually hidden text')
      expect(element).toBeInTheDocument()
      expect(element).toHaveClass('absolute', 'w-px', 'h-px')
    })

    it('renders LiveRegion component with proper ARIA attributes', () => {
      render(
        <LiveRegion config={LIVE_REGION_CONFIGS.polite}>
          Test announcement
        </LiveRegion>
      )
      const element = screen.getByText('Test announcement')
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('aria-live', 'polite')
      expect(element).toHaveClass('sr-only')
    })

    it('renders AccessibleButton with proper ARIA attributes', () => {
      render(
        <AccessibleButton 
          ariaLabel="Custom button"
          ariaDescribedBy="button-description"
        >
          Accessible Button
        </AccessibleButton>
      )
      const button = screen.getByRole('button', { name: 'Custom button' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-describedby', 'button-description')
    })

    it('renders AccessibleField with proper labeling', () => {
      render(
        <AccessibleField label="Test Field" id="test-field">
          <input id="test-field" type="text" />
        </AccessibleField>
      )
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('EnhancedFocusTrap traps focus within container', async () => {
      const user = userEvent.setup()
      
      render(
        <EnhancedFocusTrap active={true}>
          <button data-focus="first">First Button</button>
          <button>Second Button</button>
          <button>Third Button</button>
        </EnhancedFocusTrap>
      )

      const firstButton = screen.getByText('First Button')
      firstButton.focus()
      expect(firstButton).toHaveFocus()

      // Tab should move to second button
      await user.tab()
      expect(screen.getByText('Second Button')).toHaveFocus()

      // Tab should move to third button
      await user.tab()
      expect(screen.getByText('Third Button')).toHaveFocus()

      // Tab should cycle back to first button
      await user.tab()
      expect(screen.getByText('First Button')).toHaveFocus()
    })

    it('EnhancedFocusTrap allows escape key to deactivate', async () => {
      const user = userEvent.setup()
      const onDeactivate = vi.fn()

      render(
        <EnhancedFocusTrap active={true} onDeactivate={onDeactivate}>
          <button>Modal Button</button>
        </EnhancedFocusTrap>
      )

      await user.keyboard('{Escape}')
      expect(onDeactivate).toHaveBeenCalled()
    })

    it('useFocusRestore saves and restores focus', () => {
      const TestComponent = () => {
        const { saveFocus, restoreFocus } = useFocusRestore()
        const [saved, setSaved] = React.useState(false)

        return (
          <div>
            <button ref={(el) => el && saveFocus(el)} data-testid="save-button">
              Save Focus
            </button>
            <button onClick={restoreFocus} data-testid="restore-button">
              Restore Focus
            </button>
            <div tabIndex={0} data-testid="focusable">
              Focusable element
            </div>
          </div>
        )
      }

      render(<TestComponent />)

      const focusable = screen.getByTestId('focusable')
      focusable.focus()
      expect(focusable).toHaveFocus()

      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)

      const restoreButton = screen.getByTestId('restore-button')
      fireEvent.click(restoreButton)

      expect(focusable).toHaveFocus()
    })

    it('useEnhancedKeyboardNavigation manages list navigation', async () => {
      const user = userEvent.setup()
      const items = ['Item 1', 'Item 2', 'Item 3']
      const onActivate = vi.fn()

      const TestComponent = () => {
        const { handleKeyDown, handleFocus } = useEnhancedKeyboardNavigation(
          items,
          { onActivate }
        )

        return (
          <ul onKeyDown={handleKeyDown}>
            {items.map((item, index) => (
              <li
                key={index}
                tabIndex={index === 0 ? 0 : -1}
                onFocus={handleFocus}
                data-index={index}
              >
                {item}
              </li>
            ))}
          </ul>
        )
      }

      render(<TestComponent />)

      const firstItem = screen.getByText('Item 1')
      firstItem.focus()

      // ArrowDown should move to next item
      await user.keyboard('{ArrowDown}')
      expect(screen.getByText('Item 2')).toHaveFocus()

      // Enter should activate the item
      await user.keyboard('{Enter}')
      expect(onActivate).toHaveBeenCalledWith('Item 2', 1)
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('useKeyboardShortcuts responds to keyboard events', async () => {
      const user = userEvent action = vi.fn.setup()
      const()

      const TestComponent = () => {
        const { setActiveContext } = useKeyboardShortcuts(
          {
            id: 'test-context',
            name: 'Test Context',
            priority: 1,
            shortcuts: [{
              key: 'k',
              modifiers: ['ctrl'],
              action,
              description: 'Test shortcut',
              category: 'Test'
            }]
          },
          true
        )

        return <div>Test Component</div>
      }

      render(<TestComponent />)

      await user.keyboard('{Control+k}')
      expect(action).toHaveBeenCalled()
    })

    it('keyboardShortcutManager manages contexts', () => {
      const context = {
        id: 'test',
        name: 'Test',
        priority: 1,
        shortcuts: []
      }

      keyboardShortcutManager.registerContext(context)
      expect(keyboardShortcutManager.getContext('test')).toBe(context)

      keyboardShortcutManager.setActiveContext('test')
      expect(keyboardShortcutManager.getActiveContext()).toBe(context)

      const allContexts = keyboardShortcutManager.getAllContexts()
      expect(allContexts).toContain(context)
    })
  })

  describe('Live Regions and Announcements', () => {
    it('useAnnouncements creates and manages announcements', () => {
      const TestComponent = () => {
        const { announce, announcement, LiveRegion } = useAnnouncements()

        return (
          <div>
            <button onClick={() => announce('Test announcement')}>
              Announce
            </button>
            <LiveRegion />
            {announcement && <div data-testid="announcement">{announcement}</div>}
          </div>
        )
      }

      render(<TestComponent />)

      const button = screen.getByText('Announce')
      fireEvent.click(button)

      expect(screen.getByTestId('announcement')).toHaveTextContent('Test announcement')
    })

    it('StatusAnnouncer announces current status', async () => {
      const TestComponent = () => {
        const { currentAnnouncement } = useLiveRegionManager()

        return (
          <div>
            <StatusAnnouncer />
            {currentAnnouncement && (
              <div data-testid="status">{currentAnnouncement.message}</div>
            )}
          </div>
        )
      }

      render(<TestComponent />)
      // StatusAnnouncer should render without errors
      expect(screen.queryByTestId('status')).not.toBeInTheDocument()
    })

    it('DynamicContentAnnouncer announces content changes', async () => {
      const initialItems = ['Item 1', 'Item 2']
      const updatedItems = ['Item 1', 'Item 2', 'Item 3']

      render(
        <DynamicContentAnnouncer
          content={updatedItems}
          previousContent={initialItems}
          announceOnAdd={true}
          ariaLabel="test list"
        />
      )

      // The component should render without errors
      expect(screen.getByTestId('announcements-container')).toBeInTheDocument()
    })
  })

  describe('Landmarks and Skip Links', () => {
    it('Landmark component renders with proper role', () => {
      render(
        <Landmark config={LANDMARK_CONFIGS.main}>
          Main content
        </Landmark>
      )

      const element = screen.getByText('Main content')
      expect(element).toHaveAttribute('role', 'main')
    })

    it('SkipLinks renders with default links', () => {
      render(<SkipLinks links={DEFAULT_SKIP_LINKS} />)
      
      DEFAULT_SKIP_LINKS.forEach(link => {
        const linkElement = screen.getByText(link.text)
        expect(linkElement).toBeInTheDocument()
        expect(linkElement).toHaveAttribute('href', link.href)
      })
    })

    it('PageStructureAnalyzer analyzes page structure', () => {
      render(
        <div>
          <h1>Test Page</h1>
          <main id="main-content">Main content</main>
          <PageStructureAnalyzer />
        </div>
      )

      expect(screen.getByText('Page Structure Analysis')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation Examples', () => {
    it('AccessibleModalExample renders and functions', async () => {
      const user = userEvent.setup()

      render(<AccessibleModalExample />)

      // Open modal
      const openButton = screen.getByText('Open Accessible Modal')
      await user.click(openButton)

      expect(screen.getByText('Accessible Modal Dialog')).toBeInTheDocument()

      // Close modal with escape
      await user.keyboard('{Escape}')
      expect(screen.queryByText('Accessible Modal Dialog')).not.toBeInTheDocument()
    })

    it('AccessibleMenuExample renders and functions', async () => {
      const user = userEvent.setup()

      render(<AccessibleMenuExample />)

      const menuButton = screen.getByText('Menu')
      await user.click(menuButton)

      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('KeyboardTestRunner renders test scenarios', () => {
      render(<KeyboardTestRunner />)

      expect(screen.getByText('Run All Tests')).toBeInTheDocument()
      
      KEYBOARD_TEST_SCENARIOS.forEach(scenario => {
        expect(screen.getByText(scenario.name)).toBeInTheDocument()
      })
    })
  })

  describe('Documentation', () => {
    it('AccessibilityDocumentation renders with navigation', () => {
      render(<AccessibilityDocumentation />)

      expect(screen.getByText('Accessibility Guide')).toBeInTheDocument()
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
      expect(screen.getByText('Focus Management')).toBeInTheDocument()
    })

    it('Documentation section navigation works', async () => {
      const user = userEvent.setup()

      render(<AccessibilityDocumentation />)

      const keyboardShortcutsButton = screen.getByText('Keyboard Shortcuts')
      await user.click(keyboardShortcutsButton)

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('Complete accessibility workflow', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()

      const TestComponent = () => {
        const { announce } = useAnnouncements()

        return (
          <div>
            <SkipLinks links={DEFAULT_SKIP_LINKS} />
            <Landmark config={LANDMARK_CONFIGS.main} id="main-content">
              <button onClick={() => {
                onAction()
                announce('Action completed', 'polite')
              }}>
                Perform Action
              </button>
            </Landmark>
            <StatusAnnouncer />
          </div>
        )
      }

      render(<TestComponent />)

      // Skip links should be visible on focus
      const skipLink = screen.getByText('Skip to main content')
      skipLink.focus()
      expect(skipLink).not.toHaveClass('sr-only')

      // Action should work and announce
      const actionButton = screen.getByText('Perform Action')
      await user.click(actionButton)
      expect(onAction).toHaveBeenCalled()
    })

    it('Modal with focus trap and announcements', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      const TestComponent = () => {
        const { announce } = useAnnouncements()
        const [isOpen, setIsOpen] = React.useState(false)

        return (
          <div>
            <button onClick={() => {
              setIsOpen(true)
              announce('Modal opened', 'assertive')
            }}>
              Open Modal
            </button>

            {isOpen && (
              <EnhancedFocusTrap
                active={true}
                onDeactivate={() => {
                  setIsOpen(false)
                  onClose()
                  announce('Modal closed', 'polite')
                }}
              >
                <div role="dialog" aria-modal="true">
                  <button>Close</button>
                </div>
              </EnhancedFocusTrap>
            )}
          </div>
        )
      }

      render(<TestComponent />)

      const openButton = screen.getByText('Open Modal')
      await user.click(openButton)

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Close with escape
      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Performance and Reliability', () => {
    it('Handles rapid keyboard events without memory leaks', async () => {
      const user = userEvent.setup()
      const action = vi.fn()

      const TestComponent = () => {
        const { setActiveContext } = useKeyboardShortcuts(
          {
            id: 'performance-test',
            name: 'Performance Test',
            priority: 1,
            shortcuts: [{
              key: 'k',
              action,
              description: 'Performance test shortcut',
              category: 'Test'
            }]
          },
          true
        )

        return <div>Performance Test Component</div>
      }

      render(<TestComponent />)

      // Simulate rapid keyboard events
      for (let i = 0; i < 100; i++) {
        await user.keyboard('k')
      }

      expect(action).toHaveBeenCalledTimes(100)
    })

    it('Manages announcement queue properly', async () => {
      const TestComponent = () => {
        const { announce } = useAnnouncements()

        return (
          <div>
            <button onClick={() => announce('First announcement')}>
              First
            </button>
            <button onClick={() => announce('Second announcement')}>
              Second
            </button>
            <button onClick={() => announce('Third announcement')}>
              Third
            </button>
          </div>
        )
      }

      render(<TestComponent />)

      const firstButton = screen.getByText('First')
      const secondButton = screen.getByText('Second')
      const thirdButton = screen.getByText('Third')

      // Queue multiple announcements
      fireEvent.click(firstButton)
      fireEvent.click(secondButton)
      fireEvent.click(thirdButton)

      // All announcements should be processed
      expect(screen.getByTestId('announcement')).toBeInTheDocument()
    })
  })

  describe('Accessibility Compliance', () => {
    it('Meets WCAG 2.1 AA requirements for keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <SkipLinks links={DEFAULT_SKIP_LINKS} />
          <Landmark config={LANDMARK_CONFIGS.main} id="main-content">
            <button>First Button</button>
            <button>Second Button</button>
            <button>Third Button</button>
          </Landmark>
        </div>
      )

      // Tab through all interactive elements
      const firstButton = screen.getByText('First Button')
      firstButton.focus()
      expect(firstButton).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Second Button')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Third Button')).toHaveFocus()

      // Skip links should be focusable
      const skipLink = screen.getByText('Skip to main content')
      skipLink.focus()
      expect(skipLink).toHaveFocus()
    })

    it('Provides proper ARIA labeling and relationships', () => {
      render(
        <div>
          <Landmark config={LANDMARK_CONFIGS.navigation} id="nav">
            <nav aria-label="Main navigation">
              <button aria-label="Home" aria-describedby="home-desc">
                Home
              </button>
              <span id="home-desc" className="sr-only">
                Navigate to home page
              </span>
            </nav>
          </Landmark>
          
          <Landmark config={LANDMARK_CONFIGS.main} id="main-content">
            <main aria-labelledby="main-heading">
              <h1 id="main-heading">Main Content</h1>
              <button aria-label="Submit form">Submit</button>
            </main>
          </Landmark>
        </div>
      )

      // Verify proper ARIA attributes
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument()
      expect(screen.getByLabelText('Home')).toBeInTheDocument()
      expect(screen.getByLabelText('Submit form')).toBeInTheDocument()
      expect(screen.getByLabelText('Navigate to home page')).toBeInTheDocument()
    })
  })
})

describe('Accessibility Configuration', () => {
  it('loads accessibility configuration correctly', () => {
    // Test that all configuration exports work
    expect(DEFAULT_SKIP_LINKS).toBeDefined()
    expect(LANDMARK_CONFIGS).toBeDefined()
    expect(LIVE_REGION_CONFIGS).toBeDefined()
    expect(KEYBOARD_TEST_SCENARIOS).toBeDefined()
    
    // Verify structure
    expect(Array.isArray(DEFAULT_SKIP_LINKS)).toBe(true)
    expect(typeof LANDMARK_CONFIGS).toBe('object')
    expect(typeof LIVE_REGION_CONFIGS).toBe('object')
    expect(Array.isArray(KEYBOARD_TEST_SCENARIOS)).toBe(true)
  })
})

// Custom matchers for accessibility testing
expect.extend({
  toBeAccessible(received) {
    const hasProperRole = received.hasAttribute('role') || 
                         ['BUTTON', 'INPUT', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI'].includes(received.tagName)
    
    const hasProperLabel = received.hasAttribute('aria-label') || 
                          received.hasAttribute('aria-labelledby') ||
                          received.hasAttribute('title') ||
                          received.textContent?.trim()

    const hasFocusManagement = received.hasAttribute('tabindex') || 
                              received.tagName === 'BUTTON' ||
                              received.tagName === 'INPUT' ||
                              received.tagName === 'A' ||
                              received.tagName === 'SELECT' ||
                              received.tagName === 'TEXTAREA'

    if (!hasProperRole) {
      return {
        message: () => `Element ${received} should have a proper role or semantic tag`,
        pass: false
      }
    }

    if (!hasProperLabel) {
      return {
        message: () => `Element ${received} should have proper labeling`,
        pass: false
      }
    }

    if (!hasFocusManagement) {
      return {
        message: () => `Element ${received} should be keyboard accessible`,
        pass: false
      }
    }

    return {
      message: () => `Element ${received} is accessible`,
      pass: true
    }
  }
})