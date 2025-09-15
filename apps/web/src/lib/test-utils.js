/**
 * Testing utilities for React components
 * Provides helpers for better test coverage and accessibility testing
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from '../components/error-boundary'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock API responses
export const mockApiResponse = (data, success = true, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: success,
        status: success ? 200 : 400,
        json: () => Promise.resolve({
          success,
          data: success ? data : undefined,
          error: success ? undefined : data
        })
      })
    }, delay)
  })
}

// Mock fetch with customizable responses
export const createMockFetch = (responses = {}) => {
  return jest.fn().mockImplementation((url, options) => {
    const method = options?.method || 'GET'
    const key = `${method} ${url}`
    
    if (responses[key]) {
      return Promise.resolve(responses[key])
    }
    
    // Default response
    return mockApiResponse({ message: 'Default response' })
  })
}

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialEntries = ['/'],
    ...renderOptions
  } = options

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </BrowserRouter>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Accessibility testing helper
export const testAccessibility = async (component) => {
  const { container } = renderWithProviders(component)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// Keyboard navigation testing
export const testKeyboardNavigation = async (component, expectedFocusableElements) => {
  renderWithProviders(component)
  const user = userEvent.setup()
  
  // Test Tab navigation
  for (let i = 0; i < expectedFocusableElements.length; i++) {
    await user.tab()
    const element = screen.getByRole(expectedFocusableElements[i].role, {
      name: expectedFocusableElements[i].name
    })
    expect(element).toHaveFocus()
  }
  
  // Test Shift+Tab navigation
  for (let i = expectedFocusableElements.length - 1; i >= 0; i--) {
    await user.tab({ shift: true })
    const element = screen.getByRole(expectedFocusableElements[i].role, {
      name: expectedFocusableElements[i].name
    })
    expect(element).toHaveFocus()
  }
}

// Screen reader testing
export const testScreenReaderContent = (component, expectedAnnouncements = []) => {
  renderWithProviders(component)
  
  expectedAnnouncements.forEach(announcement => {
    expect(screen.getByText(announcement)).toBeInTheDocument()
  })
  
  // Check for proper heading structure
  const headings = screen.getAllByRole('heading')
  let currentLevel = 0
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1))
    expect(level).toBeGreaterThanOrEqual(currentLevel)
    expect(level - currentLevel).toBeLessThanOrEqual(1)
    currentLevel = level
  })
}

// Form testing utilities
export const testFormValidation = async (formComponent, validationTests) => {
  renderWithProviders(formComponent)
  const user = userEvent.setup()
  
  for (const test of validationTests) {
    // Clear all form fields
    const inputs = screen.getAllByRole('textbox')
    for (const input of inputs) {
      await user.clear(input)
    }
    
    // Fill form with test data
    for (const [fieldName, value] of Object.entries(test.data)) {
      const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
      await user.type(field, value)
    }
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    // Check for expected validation messages
    if (test.expectValid) {
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    } else {
      await waitFor(() => {
        expect(screen.getByText(test.expectedError)).toBeInTheDocument()
      })
    }
  }
}

// Performance testing
export const testPerformance = async (component, performanceBudget = {}) => {
  const startTime = performance.now()
  
  renderWithProviders(component)
  
  const endTime = performance.now()
  const renderTime = endTime - startTime
  
  if (performanceBudget.maxRenderTime) {
    expect(renderTime).toBeLessThan(performanceBudget.maxRenderTime)
  }
  
  // Test re-render performance
  if (performanceBudget.maxReRenderTime) {
    const reRenderStart = performance.now()
    
    // Force re-render
    fireEvent.click(screen.getByText(/./))
    
    const reRenderEnd = performance.now()
    const reRenderTime = reRenderEnd - reRenderStart
    
    expect(reRenderTime).toBeLessThan(performanceBudget.maxReRenderTime)
  }
  
  return { renderTime }
}

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: new Date().toISOString(),
  ...overrides
})

export const generateMockApiResponse = (data, overrides = {}) => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
  ...overrides
})

export const generateMockError = (message = 'Test error', code = 400) => ({
  success: false,
  error: {
    message,
    code
  },
  timestamp: new Date().toISOString()
})

// Test utilities for async operations
export const waitForApiCall = async (mockFn, timeout = 5000) => {
  await waitFor(() => {
    expect(mockFn).toHaveBeenCalled()
  }, { timeout })
}

export const waitForElement = async (selector, timeout = 5000) => {
  await waitFor(() => {
    expect(screen.getByTestId(selector)).toBeInTheDocument()
  }, { timeout })
}

// Mock intersection observer for lazy loading tests
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  
  window.IntersectionObserver = mockIntersectionObserver
  window.IntersectionObserverEntry = jest.fn()
}

// Mock resize observer for responsive tests
export const mockResizeObserver = () => {
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
}

// Mock matchMedia for responsive tests
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Test suite generator for components
export const createComponentTestSuite = (Component, options = {}) => {
  const {
    props = {},
    testAccessibility: shouldTestA11y = true,
    testPerformance: shouldTestPerf = false,
    performanceBudget = {},
    requiredProps = [],
    optionalProps = []
  } = options

  describe(Component.name || 'Component', () => {
    beforeEach(() => {
      // Setup common mocks
      mockIntersectionObserver()
      mockResizeObserver()
      mockMatchMedia()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('renders without crashing', () => {
      expect(() => {
        renderWithProviders(<Component {...props} />)
      }).not.toThrow()
    })

    if (shouldTestA11y) {
      it('meets accessibility standards', async () => {
        await testAccessibility(<Component {...props} />)
      })
    }

    if (shouldTestPerf) {
      it('meets performance budget', async () => {
        await testPerformance(<Component {...props} />, performanceBudget)
      })
    }

    if (requiredProps.length > 0) {
      it('requires specified props', () => {
        // Test that component throws/warns without required props
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        
        renderWithProviders(<Component />)
        
        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
      })
    }

    if (optionalProps.length > 0) {
      it('handles optional props correctly', () => {
        const propsWithOptional = { ...props }
        optionalProps.forEach(prop => {
          propsWithOptional[prop.name] = prop.value
        })
        
        expect(() => {
          renderWithProviders(<Component {...propsWithOptional} />)
        }).not.toThrow()
      })
    }
  })
}

// Integration test helpers
export const createIntegrationTest = (scenario, steps) => {
  return async () => {
    const user = userEvent.setup()
    
    for (const step of steps) {
      switch (step.type) {
        case 'render':
          renderWithProviders(step.component)
          break
          
        case 'click':
          await user.click(screen.getByRole(step.role, { name: step.name }))
          break
          
        case 'type':
          await user.type(
            screen.getByLabelText(step.label),
            step.text
          )
          break
          
        case 'wait':
          await waitFor(() => {
            expect(screen.getByText(step.text)).toBeInTheDocument()
          })
          break
          
        case 'expect':
          expect(screen.getByText(step.text)).toBeInTheDocument()
          break
          
        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }
      
      // Add delay between steps for realism
      if (step.delay) {
        await new Promise(resolve => setTimeout(resolve, step.delay))
      }
    }
  }
}

export default {
  renderWithProviders,
  testAccessibility,
  testKeyboardNavigation,
  testScreenReaderContent,
  testFormValidation,
  testPerformance,
  generateMockUser,
  generateMockApiResponse,
  generateMockError,
  createMockFetch,
  mockApiResponse,
  createComponentTestSuite,
  createIntegrationTest
}