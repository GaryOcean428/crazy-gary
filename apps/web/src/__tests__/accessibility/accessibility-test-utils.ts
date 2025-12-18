/**
 * Accessibility Testing Utilities and Helpers
 * Provides reusable functions and utilities for comprehensive accessibility testing
 */

import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { axe, AxeResults, Result, Violation } from 'axe-core'
import userEvent from '@testing-library/user-event'

// Type definitions for accessibility testing
export interface AccessibilityTestConfig {
  rules?: {
    [key: string]: {
      enabled?: boolean
      [key: string]: any
    }
  }
  tags?: string[]
  reporter?: 'v1' | 'v2'
}

export interface AccessibilityViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  help: string
  helpUrl: string
  nodes: Array<{
    html: string
    target: string[]
    failureSummary?: string
  }>
}

export interface KeyboardNavigationStep {
  key: string
  description: string
  expectedFocusTarget?: string
  expectedElementState?: {
    [attribute: string]: string
  }
}

export interface ColorContrastTest {
  foreground: string
  background: string
  minRatio: number
  description: string
}

// Utility function to run axe accessibility tests
export const runAxeTest = async (
  element: HTMLElement | Document,
  config?: AccessibilityTestConfig
): Promise<AxeResults> => {
  return await axe.run(element, config)
}

// Utility function to check for specific accessibility violations
export const checkAccessibilityViolations = (
  results: AxeResults,
  allowedViolations: string[] = []
): AccessibilityViolation[] => {
  return results.violations.filter(violation => 
    !allowedViolations.includes(violation.id)
  )
}

// Utility function to assert no accessibility violations
export const assertNoAccessibilityViolations = async (
  element: HTMLElement | Document,
  allowedViolations: string[] = [],
  config?: AccessibilityTestConfig
): Promise<void> => {
  const results = await runAxeTest(element, config)
  const violations = checkAccessibilityViolations(results, allowedViolations)
  
  if (violations.length > 0) {
    const violationMessages = violations.map(v => 
      `${v.id}: ${v.description} (Impact: ${v.impact})`
    ).join('\n')
    
    throw new Error(`Accessibility violations found:\n${violationMessages}`)
  }
}

// Utility function to test keyboard navigation
export const testKeyboardNavigation = async (
  initialElement: HTMLElement,
  steps: KeyboardNavigationStep[],
  user = userEvent.setup()
): Promise<void> => {
  // Focus the initial element
  await user.click(initialElement)
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    
    // Trigger the key event
    fireEvent.keyDown(document.activeElement as Element, { key: step.key })
    
    // Wait for any state changes
    await waitFor(() => {
      // Check expected focus target if specified
      if (step.expectedFocusTarget) {
        const expectedElement = document.querySelector(step.expectedFocusTarget)
        expect(expectedElement).toHaveFocus()
      }
      
      // Check expected element state if specified
      if (step.expectedElementState) {
        Object.entries(step.expectedElementState).forEach(([attr, value]) => {
          expect(document.activeElement).toHaveAttribute(attr, value)
        })
      }
    }, { timeout: 100 })
  }
}

// Utility function to test focus management
export const testFocusManagement = async (
  focusHandler: () => void | Promise<void>,
  expectedFocusTarget?: string
): Promise<void> => {
  // Execute focus handler
  await act(async () => {
    await focusHandler()
  })
  
  // Wait for focus changes
  await waitFor(() => {
    if (expectedFocusTarget) {
      const element = document.querySelector(expectedFocusTarget)
      expect(element).toHaveFocus()
    } else {
      // Just check that something has focus
      expect(document.activeElement).toBeInstanceOf(Element)
    }
  })
}

// Utility function to test focus trapping
export const testFocusTrap = async (
  trapContainer: HTMLElement,
  focusableElements: HTMLElement[],
  user = userEvent.setup()
): Promise<void> => {
  // Focus first element
  await user.click(focusableElements[0])
  expect(focusableElements[0]).toHaveFocus()
  
  // Tab through all elements and verify they cycle
  for (let i = 1; i < focusableElements.length; i++) {
    await user.tab()
    expect(focusableElements[i]).toHaveFocus()
  }
  
  // Tab from last should cycle back to first
  await user.tab()
  expect(focusableElements[0]).toHaveFocus()
  
  // Shift+Tab from first should cycle to last
  await user.tab({ shift: true })
  expect(focusableElements[focusableElements.length - 1]).toHaveFocus()
}

// Utility function to test color contrast
export const testColorContrast = (
  element: HTMLElement,
  testCases: ColorContrastTest[]
): void => {
  const computedStyles = window.getComputedStyle(element)
  
  testCases.forEach(testCase => {
    const ratio = calculateContrastRatio(
      testCase.foreground,
      testCase.background
    )
    
    expect(ratio).toBeGreaterThanOrEqual(
      testCase.minRatio,
      `Color contrast ratio (${ratio.toFixed(2)}) is below minimum (${testCase.minRatio}) for: ${testCase.description}`
    )
  })
}

// Utility function to calculate color contrast ratio
export const calculateContrastRatio = (foreground: string, background: string): number => {
  const fg = parseColor(foreground)
  const bg = parseColor(background)
  
  if (!fg || !bg) return 0
  
  const fgLuminance = getRelativeLuminance(fg.r, fg.g, fg.b)
  const bgLuminance = getRelativeLuminance(bg.r, bg.g, bg.b)
  
  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// Utility function to parse color values
export const parseColor = (color: string): { r: number; g: number; b: number } | null => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      return { r, g, b }
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return { r, g, b }
    }
  }
  
  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    }
  }
  
  return null
}

// Utility function to get relative luminance
export const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Utility function to test ARIA attributes
export const testAriaAttributes = (
  element: HTMLElement,
  expectedAttributes: Record<string, string | boolean | null>
): void => {
  Object.entries(expectedAttributes).forEach(([attr, expectedValue]) => {
    const actualValue = element.getAttribute(attr)
    
    if (expectedValue === null) {
      expect(actualValue).toBeNull()
    } else if (typeof expectedValue === 'boolean') {
      if (expectedValue) {
        expect(actualValue).not.toBeNull()
      } else {
        expect(actualValue).toBeNull()
      }
    } else {
      expect(actualValue).toBe(expectedValue)
    }
  })
}

// Utility function to test live region announcements
export const testLiveRegion = async (
  triggerElement: HTMLElement,
  announcement: string,
  liveRegionSelector = '[aria-live]',
  politeness: 'polite' | 'assertive' = 'polite'
): Promise<void> => {
  // Find the live region
  const liveRegion = document.querySelector(liveRegionSelector) as HTMLElement
  expect(liveRegion).toBeInTheDocument()
  expect(liveRegion).toHaveAttribute('aria-live', politeness)
  
  // Clear any existing content
  liveRegion.textContent = ''
  
  // Trigger the announcement
  fireEvent.click(triggerElement)
  
  // Wait for the announcement to be made
  await waitFor(() => {
    expect(liveRegion.textContent).toBe(announcement)
  }, { timeout: 100 })
}

// Utility function to test skip links
export const testSkipLinks = async (
  skipLinkSelector: string,
  targetSelector: string,
  user = userEvent.setup()
): Promise<void> => {
  // Focus the skip link
  const skipLink = document.querySelector(skipLinkSelector) as HTMLElement
  expect(skipLink).toBeInTheDocument()
  
  await user.tab()
  expect(skipLink).toHaveFocus()
  
  // Activate the skip link
  fireEvent.click(skipLink)
  
  // Check that focus moved to target
  const target = document.querySelector(targetSelector) as HTMLElement
  expect(target).toBeInTheDocument()
  await waitFor(() => {
    expect(target).toHaveFocus()
  })
}

// Utility function to test form accessibility
export const testFormAccessibility = async (
  formElement: HTMLFormElement,
  expectedLabels: Array<{
    input: string
    label: string
    required?: boolean
    error?: string
  }>
): Promise<void> => {
  expectedLabels.forEach(({ input, label, required, error }) => {
    const inputElement = formElement.querySelector(input) as HTMLInputElement
    const labelElement = formElement.querySelector(`label[for="${inputElement.id}"]`) as HTMLLabelElement
    
    expect(inputElement).toBeInTheDocument()
    expect(labelElement).toBeInTheDocument()
    expect(labelElement.textContent).toContain(label)
    
    if (required) {
      expect(inputElement).toHaveAttribute('aria-required', 'true')
      expect(labelElement.textContent).toContain('*')
    }
    
    if (error) {
      const errorElement = formElement.querySelector(`#${inputElement.id}-error`) as HTMLElement
      expect(errorElement).toBeInTheDocument()
      expect(errorElement).toHaveAttribute('role', 'alert')
      expect(errorElement.textContent).toBe(error)
      expect(inputElement).toHaveAttribute('aria-invalid', 'true')
      expect(inputElement).toHaveAttribute('aria-describedby', `${inputElement.id}-error`)
    }
  })
}

// Utility function to test heading hierarchy
export const testHeadingHierarchy = (
  container: HTMLElement,
  expectedLevels: number[]
): void => {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  
  expect(headings).toHaveLength(expectedLevels.length)
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    expect(level).toBe(expectedLevels[index])
  })
}

// Utility function to test landmark roles
export const testLandmarkRoles = (
  container: HTMLElement,
  expectedLandmarks: Array<{
    role: string
    label?: string
  }>
): void => {
  expectedLandmarks.forEach(({ role, label }) => {
    const landmark = container.querySelector(`[role="${role}"]`) as HTMLElement
    expect(landmark).toBeInTheDocument()
    
    if (label) {
      expect(landmark).toHaveAttribute('aria-label', label)
    }
  })
}

// Utility function to test table accessibility
export const testTableAccessibility = (
  table: HTMLTableElement,
  options: {
    hasCaption?: boolean
    expectedHeaders?: string[]
    hasScopeAttributes?: boolean
  } = {}
): void => {
  if (options.hasCaption) {
    const caption = table.querySelector('caption')
    expect(caption).toBeInTheDocument()
  }
  
  if (options.expectedHeaders) {
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent)
    expect(headers).toEqual(options.expectedHeaders)
  }
  
  if (options.hasScopeAttributes) {
    const headerCells = table.querySelectorAll('th')
    headerCells.forEach(cell => {
      expect(cell).toHaveAttribute('scope')
    })
  }
}

// Utility function to test responsive accessibility
export const testResponsiveAccessibility = async (
  element: HTMLElement,
  viewportSizes: Array<{ width: number; height: number }>
): Promise<void> => {
  for (const { width, height } of viewportSizes) {
    // Mock viewport size
    Object.defineProperty(window, 'innerWidth', { writable: true, value: width })
    Object.defineProperty(window, 'innerHeight', { writable: true, value: height })
    
    // Trigger resize event
    fireEvent(window, new Event('resize'))
    
    // Check that element is still accessible
    expect(element.offsetWidth).toBeGreaterThan(0)
    expect(element.offsetHeight).toBeGreaterThan(0)
  }
}

// Common test configurations
export const axeConfig = {
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'aria-roles': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-roles': { enabled: true },
    'skip-link': { enabled: true },
    'form-labels': { enabled: true },
    'table-structure': { enabled: true }
  }
}

export const wcag21AAConfig = {
  rules: {
    'color-contrast': { enabled: true, options: { minContrastRatio: 4.5 } },
    'large-text-contrast': { enabled: true, options: { minContrastRatio: 3 } },
    'focus-order-semantics': { enabled: true },
    'label-title-only': { enabled: true },
    'landmark-one-main': { enabled: true },
    'region-img-alt': { enabled: true },
    'skip-link': { enabled: true }
  },
  tags: ['wcag2a', 'wcag2aa']
}

// Mock functions for common testing scenarios
export const mockResizeObserver = () => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

export const mockIntersectionObserver = () => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Export commonly used test patterns
export const accessibilityTestPatterns = {
  // Button accessibility tests
  testButtonAccessibility: (button: HTMLElement) => {
    testAriaAttributes(button, {
      'aria-label': null, // Should not have aria-label if it has text content
      'aria-describedby': null, // Optional
      'aria-expanded': null, // Only for toggle buttons
      'aria-pressed': null, // Only for toggle buttons
      'aria-disabled': null, // Only when disabled
    })
  },
  
  // Form field accessibility tests
  testFormFieldAccessibility: (field: HTMLElement, label: string, required: boolean = false) => {
    const input = field.querySelector('input, select, textarea') as HTMLInputElement
    const labelElement = field.querySelector('label') as HTMLLabelElement
    
    expect(labelElement).toHaveAttribute('for', input.id)
    expect(labelElement.textContent).toContain(label)
    
    if (required) {
      expect(input).toHaveAttribute('aria-required', 'true')
    }
  },
  
  // Dialog accessibility tests
  testDialogAccessibility: (dialog: HTMLElement, title: string) => {
    expect(dialog).toHaveAttribute('role', 'dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
    
    const titleElement = dialog.querySelector(`#${dialog.getAttribute('aria-labelledby')}`)
    expect(titleElement?.textContent).toBe(title)
  }
}

// Export test data and utilities
export const testData = {
  colorCombinations: {
    accessible: [
      { fg: '#000000', bg: '#ffffff', ratio: 21 },
      { fg: '#1a1a1a', bg: '#ffffff', ratio: 16.7 },
      { fg: '#ffffff', bg: '#000000', ratio: 21 },
    ],
    inaccessible: [
      { fg: '#666666', bg: '#ffffff', ratio: 4.5 },
      { fg: '#ffffff', bg: '#666666', ratio: 4.5 },
    ]
  },
  
  keyboardKeys: {
    navigation: ['Tab', 'Shift+Tab', 'Enter', 'Space', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
    activation: ['Enter', 'Space'],
    cancellation: ['Escape'],
    navigation: ['Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  },
  
  ariaRoles: {
    landmarks: ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search'],
    widgets: ['button', 'checkbox', 'combobox', 'grid', 'listbox', 'menu', 'menubar', 'progressbar', 'radio', 'scrollbar', 'slider', 'spinbutton', 'status', 'tab', 'tablist', 'tabpanel', 'textbox', 'toolbar', 'tooltip', 'tree', 'treegrid']
  }
}
