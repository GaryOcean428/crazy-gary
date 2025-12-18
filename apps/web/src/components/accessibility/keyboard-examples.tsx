/**
 * Keyboard Navigation Examples and Testing Scenarios
 * Provides comprehensive examples and automated testing for keyboard-only navigation
 */

import React, { useState, useRef, useEffect } from 'react'
import { 
  useEnhancedKeyboardNavigation, 
  useKeyboardShortcuts,
  keyboardShortcutManager,
  DEFAULT_SHORTCUT_CONTEXTS 
} from './keyboard-shortcuts'
import { EnhancedFocusTrap } from './focus-management'
import { useAnnouncements } from './live-regions'

// Keyboard navigation test scenarios
export interface KeyboardTestScenario {
  id: string
  name: string
  description: string
  component: string
  testSteps: TestStep[]
  expectedBehavior: string[]
  accessibilityRequirements: string[]
}

export interface TestStep {
  step: number
  action: string
  keys: string
  expectedResult: string
  selector?: string
}

// Predefined test scenarios
export const KEYBOARD_TEST_SCENARIOS: KeyboardTestScenario[] = [
  {
    id: 'modal-navigation',
    name: 'Modal Navigation',
    description: 'Test keyboard navigation within modal dialogs',
    component: 'ModalDialog',
    testSteps: [
      {
        step: 1,
        action: 'Open modal',
        keys: 'Enter',
        expectedResult: 'Modal opens and focus moves to first focusable element',
        selector: '[data-modal="test-modal"]'
      },
      {
        step: 2,
        action: 'Navigate forward',
        keys: 'Tab',
        expectedResult: 'Focus moves to next focusable element',
        selector: '[data-modal="test-modal"] button'
      },
      {
        step: 3,
        action: 'Navigate backward',
        keys: 'Shift+Tab',
        expectedResult: 'Focus moves to previous focusable element',
        selector: '[data-modal="test-modal"] button'
      },
      {
        step: 4,
        action: 'Close modal',
        keys: 'Escape',
        expectedResult: 'Modal closes and focus returns to trigger',
        selector: '[data-modal-trigger]'
      }
    ],
    expectedBehavior: [
      'Focus should be trapped within modal',
      'Tab navigation should cycle through modal elements',
      'Escape should close modal',
      'Focus should return to trigger element'
    ],
    accessibilityRequirements: [
      'Modal should have role="dialog"',
      'Modal should have aria-modal="true"',
      'Focus should be trapped within modal',
      'Escape key should close modal',
      'Focus should return to trigger'
    ]
  },
  {
    id: 'menu-navigation',
    name: 'Menu Navigation',
    description: 'Test keyboard navigation within dropdown menus',
    component: 'DropdownMenu',
    testSteps: [
      {
        step: 1,
        action: 'Open menu',
        keys: 'Enter',
        expectedResult: 'Menu opens and focus moves to first menu item',
        selector: '[role="menu"]'
      },
      {
        step: 2,
        action: 'Navigate down',
        keys: 'ArrowDown',
        expectedResult: 'Focus moves to next menu item',
        selector: '[role="menuitem"]'
      },
      {
        step: 3,
        action: 'Navigate up',
        keys: 'ArrowUp',
        expectedResult: 'Focus moves to previous menu item',
        selector: '[role="menuitem"]'
      },
      {
        step: 4,
        action: 'Select item',
        keys: 'Enter',
        expectedResult: 'Menu item is selected and menu closes',
        selector: '[data-menu-item]'
      }
    ],
    expectedBehavior: [
      'Menu should open with Enter or Space',
      'Arrow keys should navigate menu items',
      'Enter should select item',
      'Menu should close on selection'
    ],
    accessibilityRequirements: [
      'Menu should have role="menu"',
      'Items should have role="menuitem"',
      'Keyboard navigation should be supported',
      'Selected state should be indicated'
    ]
  },
  {
    id: 'tab-navigation',
    name: 'Tab Navigation',
    description: 'Test keyboard navigation within tab interfaces',
    component: 'Tabs',
    testSteps: [
      {
        step: 1,
        action: 'Focus first tab',
        keys: 'Tab',
        expectedResult: 'Focus moves to first tab',
        selector: '[role="tab"]:first-child'
      },
      {
        step: 2,
        action: 'Navigate to next tab',
        keys: 'ArrowRight',
        expectedResult: 'Focus moves to next tab',
        selector: '[role="tab"]:nth-child(2)'
      },
      {
        step: 3,
        action: 'Activate tab',
        keys: 'Enter',
        expectedResult: 'Tab becomes active and content updates',
        selector: '[role="tabpanel"]'
      },
      {
        step: 4,
        action: 'Navigate to previous tab',
        keys: 'ArrowLeft',
        expectedResult: 'Focus moves to previous tab',
        selector: '[role="tab"]:first-child'
      }
    ],
    expectedBehavior: [
      'Arrow keys should navigate between tabs',
      'Enter/Space should activate selected tab',
      'Tab focus should be properly managed',
      'Active tab should be indicated'
    ],
    accessibilityRequirements: [
      'Tabs should have role="tablist"',
      'Tab elements should have role="tab"',
      'Tab panels should have role="tabpanel"',
      'Active tab should be indicated with aria-selected'
    ]
  },
  {
    id: 'grid-navigation',
    name: 'Grid Navigation',
    description: 'Test keyboard navigation within data grids',
    component: 'DataGrid',
    testSteps: [
      {
        step: 1,
        action: 'Focus first cell',
        keys: 'Tab',
        expectedResult: 'Focus moves to first grid cell',
        selector: '[role="gridcell"]:first-child'
      },
      {
        step: 2,
        action: 'Move right',
        keys: 'ArrowRight',
        expectedResult: 'Focus moves to next cell in row',
        selector: '[role="gridcell"]:nth-child(2)'
      },
      {
        step: 3,
        action: 'Move down',
        keys: 'ArrowDown',
        expectedResult: 'Focus moves to cell in next row',
        selector: '[role="gridcell"]:nth-child(3)'
      },
      {
        step: 4,
        action: 'Move to row start',
        keys: 'Home',
        expectedResult: 'Focus moves to first cell in row',
        selector: '[role="gridcell"]:first-child'
      },
      {
        step: 5,
        action: 'Move to row end',
        keys: 'End',
        expectedResult: 'Focus moves to last cell in row',
        selector: '[role="gridcell"]:last-child'
      }
    ],
    expectedBehavior: [
      'Arrow keys should navigate grid cells',
      'Home/End should move to row boundaries',
      'Focus should be visually indicated',
      'Selection should be properly managed'
    ],
    accessibilityRequirements: [
      'Grid should have role="grid"',
      'Cells should have role="gridcell"',
      'Headers should be properly associated',
      'Focus should be clearly visible'
    ]
  }
]

// Keyboard navigation test runner
export const KeyboardTestRunner: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<KeyboardTestScenario | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [results, setResults] = useState<{ [key: string]: boolean }>({})
  const { announce } = useAnnouncements()

  const runTestStep = async (step: TestStep) => {
    announce(`Running test step ${step.step}: ${step.action}`)
    
    // Simulate key press
    const keyEvent = new KeyboardEvent('keydown', {
      key: step.keys,
      bubbles: true,
      cancelable: true
    })
    
    document.dispatchEvent(keyEvent)
    
    // Wait for DOM update
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check if expected element is focused
    let passed = false
    if (step.selector) {
      const element = document.querySelector(step.selector) as HTMLElement
      passed = element && document.activeElement === element
    } else {
      // General check for focus movement
      passed = true // Assume passed if no specific selector
    }
    
    setResults(prev => ({
      ...prev,
      [`${currentScenario?.id}-step-${step.step}`]: passed
    }))
    
    announce(`Test step ${step.step} ${passed ? 'passed' : 'failed'}`)
  }

  const runFullScenario = async (scenario: KeyboardTestScenario) => {
    setCurrentScenario(scenario)
    setCurrentStep(0)
    setResults({})
    
    announce(`Starting test scenario: ${scenario.name}`)
    
    for (const step of scenario.testSteps) {
      setCurrentStep(step.step)
      await runTestStep(step)
      
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    announce(`Test scenario ${scenario.name} completed`)
    setCurrentScenario(null)
  }

  const runAllTests = async () => {
    announce('Starting all keyboard navigation tests')
    
    for (const scenario of KEYBOARD_TEST_SCENARIOS) {
      await runFullScenario(scenario)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    announce('All keyboard navigation tests completed')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4">
        <button 
          onClick={runAllTests}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Run All Tests
        </button>
        
        {KEYBOARD_TEST_SCENARIOS.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => runFullScenario(scenario)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          >
            {scenario.name}
          </button>
        ))}
      </div>

      {currentScenario && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">
            Running: {currentScenario.name}
          </h3>
          <p className="text-muted-foreground mb-4">
            {currentScenario.description}
          </p>
          
          <div className="space-y-2">
            {currentScenario.testSteps.map(step => (
              <div 
                key={step.step}
                className={`p-2 rounded border ${
                  step.step === currentStep ? 'border-primary bg-primary/10' : 'border-muted'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>Step {step.step}: {step.action}</span>
                  <span className="text-sm text-muted-foreground">
                    {step.keys}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Expected: {step.expectedResult}
                </div>
                {results[`${currentScenario.id}-step-${step.step}`] !== undefined && (
                  <div className={`text-sm ${
                    results[`${currentScenario.id}-step-${step.step}`] 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {results[`${currentScenario.id}-step-${step.step}`] ? '✓ Passed' : '✗ Failed'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Interactive examples of keyboard navigation patterns

// Accessible Modal Example
export const AccessibleModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const { announce } = useAnnouncements()

  const openModal = () => {
    setIsOpen(true)
    announce('Modal opened', 'assertive')
  }

  const closeModal = () => {
    setIsOpen(false)
    firstFocusableRef.current?.focus()
    announce('Modal closed', 'polite')
  }

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal()
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className="space-y-4">
      <button
        ref={firstFocusableRef}
        onClick={openModal}
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
        data-modal-trigger
      >
        Open Accessible Modal
      </button>

      {isOpen && (
        <EnhancedFocusTrap
          active={true}
          onDeactivate={closeModal}
          options={{
            initialFocus: '[data-focus="first"]',
            returnFocusOnDeactivate: true
          }}
        >
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            ref={modalRef}
          >
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h2 id="modal-title" className="text-lg font-semibold mb-2">
                Accessible Modal Dialog
              </h2>
              <p id="modal-description" className="text-muted-foreground mb-4">
                This modal demonstrates proper keyboard navigation. 
                Use Tab to navigate, Shift+Tab to go backwards, and Escape to close.
              </p>
              
              <div className="flex gap-2 justify-end">
                <button
                  data-focus="first"
                  onClick={closeModal}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </EnhancedFocusTrap>
      )}
    </div>
  )
}

// Accessible Menu Example
export const AccessibleMenuExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { announce } = useAnnouncements()

  const menuItems = ['Profile', 'Settings', 'Help', 'Logout']

  const { 
    activeIndex, 
    handleKeyDown, 
    handleFocus 
  } = useEnhancedKeyboardNavigation(
    menuItems,
    {
      orientation: 'vertical',
      loop: true,
      onActivate: (item) => {
        setSelectedItem(item as string)
        setIsOpen(false)
        buttonRef.current?.focus()
        announce(`Selected ${item}`, 'polite')
      }
    }
  )

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      announce('Menu opened', 'polite')
    } else {
      announce('Menu closed', 'polite')
    }
  }

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    
    handleKeyDown(e.nativeEvent)
    
    if (e.key === 'Escape') {
      setIsOpen(false)
      buttonRef.current?.focus()
      announce('Menu closed', 'polite')
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={`User menu, ${selectedItem ? `${selectedItem} selected` : 'no selection'}`}
        >
          Menu {selectedItem && `(${selectedItem})`}
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="User menu"
            className="absolute top-full left-0 mt-1 bg-background border rounded shadow-lg min-w-32 z-10"
            onKeyDown={handleMenuKeyDown}
          >
            {menuItems.map((item, index) => (
              <button
                key={item}
                role="menuitem"
                className={`w-full text-left px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none ${
                  index === activeIndex ? 'bg-muted' : ''
                }`}
                onClick={() => {
                  setSelectedItem(item)
                  setIsOpen(false)
                  buttonRef.current?.focus()
                  announce(`Selected ${item}`, 'polite')
                }}
                onFocus={() => handleFocus({ target: { getAttribute: () => index.toString() } } as any)}
                data-index={index}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Keyboard Shortcuts Help Modal
export const KeyboardShortcutsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const { announce } = useAnnouncements()

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault()
        setIsOpen(!isOpen)
        if (!isOpen) {
          announce('Keyboard shortcuts help opened', 'polite')
        }
      }
    }

    document.addEventListener('keydown', handleGlobalShortcuts)
    return () => document.removeEventListener('keydown', handleGlobalShortcuts)
  }, [isOpen, announce])

  if (!isOpen) return null

  const contexts = keyboardShortcutManager.getAllContexts()

  return (
    <EnhancedFocusTrap
      active={true}
      onDeactivate={() => setIsOpen(false)}
      options={{
        initialFocus: '[data-focus="close"]',
        returnFocusOnDeactivate: true
      }}
    >
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        data-modal="shortcuts-help"
        ref={modalRef}
      >
        <div className="bg-background p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 id="shortcuts-title" className="text-xl font-semibold">
              Keyboard Shortcuts
            </h2>
            <button
              data-focus="close"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close keyboard shortcuts help"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {contexts.map(context => (
              <div key={context.id}>
                <h3 className="font-semibold mb-2">{context.name}</h3>
                <div className="space-y-1">
                  {context.shortcuts
                    .filter(shortcut => shortcut.enabled !== false)
                    .map((shortcut, index) => (
                      <div key={index} className="flex justify-between py-1">
                        <span className="text-sm">{shortcut.description}</span>
                        <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">
                          {formatShortcut(shortcut)}
                        </kbd>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded">
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-background border rounded text-xs">?</kbd> to close this dialog.
            </p>
          </div>
        </div>
      </div>
    </EnhancedFocusTrap>
  )
}

// Helper function to format shortcuts
const formatShortcut = (shortcut: any): string => {
  const parts = []
  
  if (shortcut.modifiers?.includes('ctrl')) parts.push('Ctrl')
  if (shortcut.modifiers?.includes('alt')) parts.push('Alt')
  if (shortcut.modifiers?.includes('shift')) parts.push('Shift')
  if (shortcut.modifiers?.includes('meta')) parts.push('Cmd')
  
  parts.push(shortcut.key.toUpperCase())
  return parts.join(' + ')
}

// Complete keyboard navigation examples page
export const KeyboardNavigationExamples: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Keyboard Navigation Examples</h1>
        <p className="text-muted-foreground mb-6">
          Interactive examples demonstrating comprehensive keyboard navigation patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Interactive Examples</h2>
          <AccessibleModalExample />
          <AccessibleMenuExample />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Testing</h2>
          <KeyboardTestRunner />
        </div>
      </div>

      <KeyboardShortcutsModal />
    </div>
  )
}

export default {
  KEYBOARD_TEST_SCENARIOS,
  KeyboardTestRunner,
  AccessibleModalExample,
  AccessibleMenuExample,
  KeyboardShortcutsModal,
  KeyboardNavigationExamples
}