import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

describe('Focus Management and Tab Order', () => {
  describe('Initial Focus Management', () => {
    it('sets initial focus on page load', () => {
      const TestComponent = () => (
        <div>
          <button autoFocus data-testid="initial-focus">
            First focusable element
          </button>
          <button data-testid="second-button">
            Second button
          </button>
        </div>
      )
      
      render(<TestComponent />)
      
      const initialFocus = screen.getByTestId('initial-focus')
      expect(initialFocus).toHaveFocus()
    })

    it('sets focus on form first input when no autoFocus element', () => {
      render(
        <form>
          <label htmlFor="first-input">First Input</label>
          <Input id="first-input" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const firstInput = screen.getByLabelText('First Input')
      expect(firstInput).toHaveFocus()
    })

    it('respects custom focus order with tabIndex', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <button tabIndex={3} data-testid="third">Third</button>
          <button tabIndex={1} data-testid="first">First</button>
          <button tabIndex={2} data-testid="second">Second</button>
        </div>
      )
      
      // Focus should go to tabIndex 1 first
      await user.tab()
      expect(screen.getByTestId('first')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('second')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('third')).toHaveFocus()
    })
  })

  describe('Focus Trapping in Modals and Dialogs', () => {
    it('traps focus within modal dialog', async () => {
      const user = userEvent.setup()
      
      const TestModal = ({ isOpen }: { isOpen: boolean }) => {
        const modalRef = React.useRef<HTMLDivElement>(null)
        
        React.useEffect(() => {
          if (isOpen && modalRef.current) {
            const firstFocusable = modalRef.current.querySelector('button') as HTMLElement
            firstFocusable?.focus()
          }
        }, [isOpen])
        
        if (!isOpen) return null
        
        return (
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <h2 id="modal-title">Modal Title</h2>
            <button data-testid="modal-button-1">Modal Button 1</button>
            <button data-testId="modal-button-2">Modal Button 2</button>
            <button data-testId="close-button">Close</button>
          </div>
        )
      }
      
      render(<TestModal isOpen={true} />)
      
      const modalButton1 = screen.getByTestId('modal-button-1')
      const modalButton2 = screen.getByTestId('modal-button-2')
      const closeButton = screen.getByTestId('close-button')
      
      // Initial focus should be on first modal button
      expect(modalButton1).toHaveFocus()
      
      // Tab should cycle through modal buttons
      await user.tab()
      expect(modalButton2).toHaveFocus()
      
      await user.tab()
      expect(closeButton).toHaveFocus()
      
      // Next tab should cycle back to first modal button
      await user.tab()
      expect(modalButton1).toHaveFocus()
    })

    it('restores focus when modal closes', async () => {
      const user = userEvent.setup()
      
      const TestModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
        const modalRef = React.useRef<HTMLDivElement>(null)
        
        React.useEffect(() => {
          if (isOpen && modalRef.current) {
            const firstFocusable = modalRef.current.querySelector('button') as HTMLElement
            firstFocusable?.focus()
          }
        }, [isOpen])
        
        if (!isOpen) return null
        
        return (
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
          >
            <button onClick={onClose} data-testid="close-button">
              Close
            </button>
          </div>
        )
      }
      
      const TestComponent = () => {
        const [isModalOpen, setIsModalOpen] = React.useState(false)
        const openButtonRef = React.useRef<HTMLButtonElement>(null)
        
        const openModal = () => {
          setIsModalOpen(true)
        }
        
        const closeModal = () => {
          setIsModalOpen(false)
          // Restore focus to the trigger button
          setTimeout(() => {
            openButtonRef.current?.focus()
          }, 0)
        }
        
        return (
          <div>
            <button 
              ref={openButtonRef}
              onClick={openModal}
              data-testid="open-modal-button"
            >
              Open Modal
            </button>
            
            <TestModal isOpen={isModalOpen} onClose={closeModal} />
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const openButton = screen.getByTestId('open-modal-button')
      
      // Focus the open button first
      await user.click(openButton)
      
      // Modal should be open and focused
      const closeButton = screen.getByTestId('close-button')
      expect(closeButton).toHaveFocus()
      
      // Close the modal
      await user.click(closeButton)
      
      // Wait for focus restoration
      await waitFor(() => {
        expect(openButton).toHaveFocus()
      })
    })

    it('prevents focus from leaving modal with Shift+Tab', async () => {
      const user = userEvent.setup()
      
      const TestModal = ({ isOpen }: { isOpen: boolean }) => {
        const modalRef = React.useRef<HTMLDivElement>(null)
        
        React.useEffect(() => {
          if (isOpen && modalRef.current) {
            const firstFocusable = modalRef.current.querySelector('button') as HTMLElement
            firstFocusable?.focus()
          }
        }, [isOpen])
        
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen || !modalRef.current) return
            
            const focusableElements = modalRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
            
            if (e.key === 'Tab') {
              if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                  e.preventDefault()
                  lastElement.focus()
                }
              } else {
                if (document.activeElement === lastElement) {
                  e.preventDefault()
                  firstElement.focus()
                }
              }
            }
          }
          
          document.addEventListener('keydown', handleKeyDown)
          return () => document.removeEventListener('keydown', handleKeyDown)
        }, [isOpen])
        
        if (!isOpen) return null
        
        return (
          <div ref={modalRef} role="dialog" aria-modal="true">
            <button data-testid="modal-first">First</button>
            <button data-testId="modal-last">Last</button>
          </div>
        )
      }
      
      render(<TestModal isOpen={true} />)
      
      const modalFirst = screen.getByTestId('modal-first')
      const modalLast = screen.getByTestId('modal-last')
      
      // Start at first modal button
      expect(modalFirst).toHaveFocus()
      
      // Shift+Tab should go to last modal button
      await user.tab({ shift: true })
      expect(modalLast).toHaveFocus()
      
      // Tab should go back to first modal button
      await user.tab()
      expect(modalFirst).toHaveFocus()
    })
  })

  describe('Focus Management in Complex Components', () => {
    it('manages focus in tab component', async () => {
      const user = userEvent.setup()
      
      const TestTabs = () => {
        const [activeTab, setActiveTab] = React.useState(0)
        
        const tabs = ['Tab 1', 'Tab 2', 'Tab 3']
        
        return (
          <div>
            <div role="tablist" aria-label="Sample tabs">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  role="tab"
                  aria-selected={index === activeTab}
                  aria-controls={`panel-${index}`}
                  tabIndex={index === activeTab ? 0 : -1}
                  onClick={() => setActiveTab(index)}
                  data-testid={`tab-${index}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div role="tabpanel" id={`panel-${activeTab}`}>
              Content for {tabs[activeTab]}
            </div>
          </div>
        )
      }
      
      render(<TestTabs />)
      
      const tab0 = screen.getByTestId('tab-0')
      const tab1 = screen.getByTestId('tab-1')
      
      // First tab should be focused
      expect(tab0).toHaveFocus()
      
      // Click second tab
      await user.click(tab1)
      
      // Tab order should update
      expect(tab1).toHaveAttribute('tabIndex', '0')
      expect(tab0).toHaveAttribute('tabIndex', '-1')
    })

    it('manages focus in dropdown menu', async () => {
      const user = userEvent.setup()
      
      const TestDropdown = () => {
        const [isOpen, setIsOpen] = React.useState(false)
        const [focusedIndex, setFocusedIndex] = React.useState(-1)
        const menuRef = React.useRef<HTMLDivElement>(null)
        
        const menuItems = ['Item 1', 'Item 2', 'Item 3']
        
        React.useEffect(() => {
          if (isOpen && menuRef.current) {
            setFocusedIndex(0)
          }
        }, [isOpen])
        
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return
            
            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault()
                setFocusedIndex(prev => Math.min(prev + 1, menuItems.length - 1))
                break
              case 'ArrowUp':
                e.preventDefault()
                setFocusedIndex(prev => Math.max(prev - 1, 0))
                break
              case 'Escape':
                setIsOpen(false)
                break
            }
          }
          
          document.addEventListener('keydown', handleKeyDown)
          return () => document.removeEventListener('keydown', handleKeyDown)
        }, [isOpen, menuItems.length])
        
        return (
          <div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              data-testid="dropdown-button"
            >
              Menu
            </button>
            
            {isOpen && (
              <div ref={menuRef} role="menu" data-testid="dropdown-menu">
                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    role="menuitem"
                    tabIndex={index === focusedIndex ? 0 : -1}
                    data-testid={`menu-item-${index}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }
      
      render(<TestDropdown />)
      
      const dropdownButton = screen.getByTestId('dropdown-button')
      const menuItem0 = screen.getByTestId('menu-item-0')
      
      // Open dropdown
      await user.click(dropdownButton)
      
      // First menu item should be focused
      expect(menuItem0).toHaveFocus()
      
      // Arrow down should move focus to next item
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      
      const menuItem1 = screen.getByTestId('menu-item-1')
      expect(menuItem1).toHaveFocus()
    })
  })

  describe('Focus Restoration', () => {
    it('restores focus to previous element after action', async () => {
      const user = userEvent.setup()
      
      const TestComponent = () => {
        const [isDetailOpen, setIsDetailOpen] = React.useState(false)
        const triggerRef = React.useRef<HTMLButtonElement>(null)
        
        const openDetail = () => {
          setIsDetailOpen(true)
        }
        
        const closeDetail = () => {
          setIsDetailOpen(false)
          // Restore focus after a short delay
          setTimeout(() => {
            triggerRef.current?.focus()
          }, 0)
        }
        
        return (
          <div>
            <button
              ref={triggerRef}
              onClick={openDetail}
              data-testid="trigger-button"
            >
              Show Details
            </button>
            
            {isDetailOpen && (
              <div role="dialog" aria-modal="true">
                <button onClick={closeDetail} data-testid="close-button">
                  Close
                </button>
              </div>
            )}
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const triggerButton = screen.getByTestId('trigger-button')
      const closeButton = screen.getByTestId('close-button')
      
      // Click trigger to open dialog
      await user.click(triggerButton)
      expect(closeButton).toHaveFocus()
      
      // Close dialog
      await user.click(closeButton)
      
      // Focus should be restored to trigger button
      await waitFor(() => {
        expect(triggerButton).toHaveFocus()
      })
    })

    it('handles focus restoration with multiple focus changes', async () => {
      const user = userEvent.setup()
      
      const TestComponent = () => {
        const [activeStep, setActiveStep] = React.useState(0)
        const stepRefs = [
          React.useRef<HTMLButtonElement>(null),
          React.useRef<HTMLButtonElement>(null),
          React.useRef<HTMLButtonElement>(null),
        ]
        
        const nextStep = () => {
          const currentStepRef = stepRefs[activeStep]
          currentStepRef.current?.blur()
          setActiveStep(prev => Math.min(prev + 1, 2))
        }
        
        React.useEffect(() => {
          // Focus new step after state update
          const timer = setTimeout(() => {
            stepRefs[activeStep].current?.focus()
          }, 0)
          return () => clearTimeout(timer)
        }, [activeStep])
        
        return (
          <div>
            {stepRefs.map((ref, index) => (
              <button
                key={index}
                ref={ref}
                onClick={index === activeStep ? nextStep : undefined}
                data-testid={`step-${index}`}
              >
                Step {index + 1}
              </button>
            ))}
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const step0 = screen.getByTestId('step-0')
      const step1 = screen.getByTestId('step-1')
      
      // First step should be focused initially
      expect(step0).toHaveFocus()
      
      // Click to move to next step
      await user.click(step0)
      
      // Should focus second step
      await waitFor(() => {
        expect(step1).toHaveFocus()
      })
    })
  })

  describe('Keyboard Navigation Patterns', () => {
    it('supports roving tabindex pattern', async () => {
      const user = userEvent.setup()
      
      const TestRovingTabs = () => {
        const [activeIndex, setActiveIndex] = React.useState(0)
        const items = ['Item 1', 'Item 2', 'Item 3']
        
        const handleKeyDown = (e: KeyboardEvent) => {
          switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
              e.preventDefault()
              setActiveIndex(prev => (prev + 1) % items.length)
              break
            case 'ArrowUp':
            case 'ArrowLeft':
              e.preventDefault()
              setActiveIndex(prev => (prev - 1 + items.length) % items.length)
              break
          }
        }
        
        return (
          <div
            role="listbox"
            aria-label="Selectable items"
            onKeyDown={handleKeyDown}
          >
            {items.map((item, index) => (
              <div
                key={index}
                role="option"
                aria-selected={index === activeIndex}
                tabIndex={index === activeIndex ? 0 : -1}
                data-testid={`option-${index}`}
              >
                {item}
              </div>
            ))}
          </div>
        )
      }
      
      render(<TestRovingTabs />)
      
      const option0 = screen.getByTestId('option-0')
      const option1 = screen.getByTestId('option-1')
      const option2 = screen.getByTestId('option-2')
      
      // First option should be focusable
      expect(option0).toHaveAttribute('tabIndex', '0')
      expect(option1).toHaveAttribute('tabIndex', '-1')
      expect(option2).toHaveAttribute('tabIndex', '-1')
      
      // Arrow key should change active option
      fireEvent.keyDown(option0, { key: 'ArrowDown' })
      
      expect(option1).toHaveAttribute('tabIndex', '0')
      expect(option0).toHaveAttribute('tabIndex', '-1')
      expect(option2).toHaveAttribute('tabIndex', '-1')
    })

    it('supports home/end key navigation', async () => {
      const user = userEvent.setup()
      
      const TestComponent = () => {
        const [focusedIndex, setFocusedIndex] = React.useState(0)
        const items = ['First', 'Second', 'Third', 'Last']
        
        const handleKeyDown = (e: KeyboardEvent) => {
          switch (e.key) {
            case 'Home':
              e.preventDefault()
              setFocusedIndex(0)
              break
            case 'End':
              e.preventDefault()
              setFocusedIndex(items.length - 1)
              break
          }
        }
        
        return (
          <div onKeyDown={handleKeyDown}>
            {items.map((item, index) => (
              <button
                key={index}
                tabIndex={index === focusedIndex ? 0 : -1}
                onFocus={() => setFocusedIndex(index)}
                data-testid={`nav-item-${index}`}
              >
                {item}
              </button>
            ))}
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const firstItem = screen.getByTestId('nav-item-0')
      const lastItem = screen.getByTestId('nav-item-3')
      
      // Home key should focus first item
      fireEvent.keyDown(firstItem, { key: 'Home' })
      expect(firstItem).toHaveFocus()
      
      // End key should focus last item
      fireEvent.keyDown(firstItem, { key: 'End' })
      expect(lastItem).toHaveFocus()
    })
  })

  describe('Focus Visibility and Indicators', () => {
    it('provides visible focus indicators', () => {
      const TestComponent = () => (
        <div>
          <button 
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            data-testid="focusable-button"
          >
            Focusable Button
          </button>
          <a 
            href="#"
            className="focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            data-testid="focusable-link"
          >
            Focusable Link
          </a>
        </div>
      )
      
      render(<TestComponent />)
      
      const button = screen.getByTestId('focusable-button')
      const link = screen.getByTestId('focusable-link')
      
      // Check that focus styles are defined
      expect(button.className).toContain('focus:ring-2')
      expect(link.className).toContain('focus:ring-2')
    })

    it('maintains focus visibility across different states', async () => {
      const user = userEvent.setup()
      
      const TestComponent = () => {
        const [isLoading, setIsLoading] = React.useState(false)
        
        return (
          <div>
            <button
              disabled={isLoading}
              className="focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              data-testid="loading-button"
              onClick={() => setIsLoading(true)}
            >
              {isLoading ? 'Loading...' : 'Click Me'}
            </button>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const button = screen.getByTestId('loading-button')
      
      // Focus button
      await user.click(button)
      
      // Button should be focused and loading
      expect(button).toHaveFocus()
      expect(button).toBeDisabled()
      expect(button.textContent).toBe('Loading...')
      
      // Focus styles should still be visible even when disabled
      expect(button.className).toContain('focus:ring-2')
    })
  })

  describe('Focus and Screen Reader Integration', () => {
    it('announces focus changes to screen readers', () => {
      const TestComponent = () => (
        <div>
          <button aria-describedby="button-help" data-testid="described-button">
            Complex Button
          </button>
          <div id="button-help" className="sr-only">
            This button performs a complex action
          </div>
        </div>
      )
      
      render(<TestComponent />)
      
      const button = screen.getByTestId('described-button')
      
      // Button should have description for screen readers
      expect(button).toHaveAttribute('aria-describedby', 'button-help')
    })

    it('provides context for focus changes', async () => {
      const user = userEvent.setup()
      
      const TestComponent = () => {
        const [selectedItem, setSelectedItem] = React.useState('')
        
        return (
          <div>
            <h2 id="list-heading">Select an item</h2>
            <ul role="listbox" aria-labelledby="list-heading">
              {['Apple', 'Banana', 'Cherry'].map((item, index) => (
                <li
                  key={index}
                  role="option"
                  aria-selected={selectedItem === item}
                  tabIndex={selectedItem === item ? 0 : -1}
                  onClick={() => setSelectedItem(item)}
                  data-testid={`option-${index}`}
                >
                  {item}
                </li>
              ))}
            </ul>
            <div aria-live="polite" data-testid="selection-announcement">
              {selectedItem && `Selected: ${selectedItem}`}
            </div>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const heading = screen.getByText('Select an item')
      const announcement = screen.getByTestId('selection-announcement')
      
      // List should be properly labelled
      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute('aria-labelledby', 'list-heading')
      
      // Should announce selections
      const option0 = screen.getByTestId('option-0')
      await user.click(option0)
      
      expect(announcement).toHaveTextContent('Selected: Apple')
    })
  })
})
