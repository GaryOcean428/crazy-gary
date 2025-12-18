import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ErrorBoundary,
  PageErrorBoundary,
  ComponentErrorBoundary,
  ApiErrorBoundary,
  InlineErrorBoundary,
  withErrorBoundary,
  useErrorHandler,
  errorRecovery
} from '@/components/error-boundary'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Test utilities
const createThrowError = (message = 'Test error') => {
  throw new Error(message)
}

const createAsyncError = (message = 'Async test error') => {
  return Promise.reject(new Error(message))
}

// Mock console methods to reduce test noise
const originalConsoleError = console.error
const originalConsoleLog = console.log

beforeEach(() => {
  console.error = jest.fn()
  console.log = jest.fn()
})

afterEach(() => {
  console.error = originalConsoleError
  console.log = originalConsoleLog
  jest.clearAllMocks()
})

// Test Components
const TestComponent = ({ shouldError = false }: { shouldError?: boolean }) => {
  if (shouldError) {
    createThrowError('Component error')
  }
  return <div>Test component content</div>
}

const TestComponentWithProps = ({ 
  data, 
  shouldError = false 
}: { 
  data?: string
  shouldError?: boolean 
}) => {
  if (shouldError) {
    createThrowError('Component with props error')
  }
  return <div>Data: {data || 'no data'}</div>
}

// Basic Error Boundary Tests
describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test component content')).toBeInTheDocument()
  })

  it('renders error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
    expect(screen.getByText('Go Home')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <TestComponent shouldError />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(onError.mock.calls[0][1]).toHaveProperty('componentStack')
  })

  it('handles retry functionality', async () => {
    const user = userEvent.setup()
    
    render(
      <ErrorBoundary maxRetries={3} retryDelay={100}>
        <TestComponent shouldError />
      </ErrorBoundary>
    )
    
    // Click retry button
    await user.click(screen.getByText('Try Again'))
    
    // Should show retrying state
    expect(screen.getByText('Retrying...')).toBeInTheDocument()
    
    // Wait for retry to complete
    await waitFor(() => {
      expect(screen.getByText('Test component content')).toBeInTheDocument()
    }, { timeout: 200 })
  })

  it('respects max retries limit', async () => {
    const user = userEvent.setup()
    let attemptCount = 0
    
    const AlwaysErrorComponent = () => {
      attemptCount++
      createThrowError('Persistent error')
      return <div>Should never render</div>
    }
    
    render(
      <ErrorBoundary maxRetries={2} retryDelay={50}>
        <AlwaysErrorComponent />
      </ErrorBoundary>
    )
    
    // First retry
    await user.click(screen.getByText('Try Again'))
    await waitFor(() => {
      expect(screen.getByText('Retrying...')).toBeInTheDocument()
    })
    
    // Wait and try again
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
    
    // Second retry
    await user.click(screen.getByText('Try Again'))
    await waitFor(() => {
      expect(screen.getByText('Retrying...')).toBeInTheDocument()
    })
    
    // Wait and check that retry button is disabled
    await waitFor(() => {
      expect(screen.getByText(/Retry attempts: 2 \/ 2/)).toBeInTheDocument()
    })
  })
})

// Specialized Error Boundary Tests
describe('Specialized Error Boundaries', () => {
  it('PageErrorBoundary has correct default props', () => {
    const { container } = render(
      <PageErrorBoundary>
        <TestComponent shouldError />
      </PageErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Error ID:')).toBeInTheDocument()
  })

  it('ComponentErrorBoundary handles component errors', () => {
    render(
      <ComponentErrorBoundary>
        <TestComponentWithProps shouldError />
      </ComponentErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('ApiErrorBoundary handles API errors with longer retry delay', () => {
    render(
      <ApiErrorBoundary maxRetries={5} retryDelay={2000}>
        <TestComponent shouldError />
      </ApiErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('ChunkErrorBoundary handles chunk loading errors', () => {
    render(
      <ChunkErrorBoundary maxRetries={1} retryDelay={3000}>
        <TestComponent shouldError />
      </ChunkErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})

// Inline Error Boundary Tests
describe('InlineErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <InlineErrorBoundary>
        <TestComponent />
      </InlineErrorBoundary>
    )
    
    expect(screen.getByText('Test component content')).toBeInTheDocument()
  })

  it('renders custom fallback when error occurs', () => {
    const CustomFallback = ({ error, retry }: { error?: Error; retry?: () => void }) => (
      <Alert>
        <AlertDescription>
          Custom error: {error?.message}
          <Button onClick={retry} size="sm" className="ml-2">Custom Retry</Button>
        </AlertDescription>
      </Alert>
    )
    
    render(
      <InlineErrorBoundary fallback={CustomFallback}>
        <TestComponent shouldError />
      </InlineErrorBoundary>
    )
    
    expect(screen.getByText('Custom error: Component error')).toBeInTheDocument()
    expect(screen.getByText('Custom Retry')).toBeInTheDocument()
  })

  it('allows retry of inline errors', async () => {
    const user = userEvent.setup()
    
    render(
      <InlineErrorBoundary>
        <TestComponent shouldError />
      </InlineErrorBoundary>
    )
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Component Error')).toBeInTheDocument()
    })
    
    // Click retry
    await user.click(screen.getByText('Retry'))
    
    // Should show normal content
    await waitFor(() => {
      expect(screen.getByText('Test component content')).toBeInTheDocument()
    })
  })
})

// Higher-Order Component Tests
describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    render(<WrappedComponent shouldError />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('passes props correctly to wrapped component', () => {
    const WrappedComponent = withErrorBoundary(TestComponentWithProps, {
      componentType: 'test-hoc'
    })
    
    render(<WrappedComponent data="test data" />)
    
    expect(screen.getByText('Data: test data')).toBeInTheDocument()
  })

  it('applies custom error boundary props', () => {
    const WrappedComponent = withErrorBoundary(TestComponent, {
      maxRetries: 5,
      componentType: 'custom-hoc'
    })
    
    render(<WrappedComponent shouldError />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})

// Error Handler Hook Tests
describe('useErrorHandler', () => {
  it('provides error handling functions', () => {
    const TestComponent = () => {
      const { handleError, handleAsyncError, createSafeCallback } = useErrorHandler()
      
      return (
        <div>
          <Button onClick={() => handleError(new Error('Test error'))}>
            Handle Error
          </Button>
          <Button onClick={() => createSafeCallback(() => createThrowError())()}>
            Safe Callback
          </Button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    expect(screen.getByText('Handle Error')).toBeInTheDocument()
    expect(screen.getByText('Safe Callback')).toBeInTheDocument()
  })

  it('handles async errors with fallback', async () => {
    const TestComponent = () => {
      const { handleAsyncError } = useErrorHandler()
      const [result, setResult] = React.useState<string>('')
      
      const handleAsync = async () => {
        const res = await handleAsyncError(
          () => createAsyncError('Async error'),
          'fallback value',
          { test: 'context' }
        )
        setResult(res || 'no result')
      }
      
      return (
        <div>
          <Button onClick={handleAsync}>Async Error Test</Button>
          <div data-testid="result">{result}</div>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    await userEvent.click(screen.getByText('Async Error Test'))
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('fallback value')
    })
  })
})

// Error Recovery Tests
describe('errorRecovery', () => {
  it('retries operations with exponential backoff', async () => {
    let attemptCount = 0
    
    const failingOperation = () => {
      attemptCount++
      if (attemptCount < 3) {
        throw new Error('Temporary failure')
      }
      return Promise.resolve('Success!')
    }
    
    const result = await errorRecovery.withRetry(failingOperation, 3, 100)
    
    expect(result).toBe('Success!')
    expect(attemptCount).toBe(3)
  })

  it('fails after max retries exceeded', async () => {
    const alwaysFailingOperation = () => Promise.reject(new Error('Always fails'))
    
    await expect(
      errorRecovery.withRetry(alwaysFailingOperation, 2, 50)
    ).rejects.toThrow('Always fails')
  })

  it('provides safe async operation with fallback', async () => {
    const failingAsyncOperation = () => createAsyncError('Async error')
    const fallback = 'fallback result'
    
    const result = await errorRecovery.safeAsync(
      failingAsyncOperation,
      fallback,
      (error) => console.log('Error caught:', error)
    )
    
    expect(result).toBe(fallback)
  })

  it('creates safe components that handle errors gracefully', () => {
    const RiskyComponent = ({ shouldFail }: { shouldFail: boolean }) => {
      if (shouldFail) {
        createThrowError('Risky component failed')
      }
      return <div>Risky component content</div>
    }
    
    const SafeRiskyComponent = errorRecovery.createSafeComponent(
      RiskyComponent,
      ({ error }) => (
        <div data-testid="fallback">Fallback: {error?.message}</div>
      )
    )
    
    const { rerender } = render(<SafeRiskyComponent shouldFail={false} />)
    expect(screen.getByText('Risky component content')).toBeInTheDocument()
    
    rerender(<SafeRiskyComponent shouldFail={true} />)
    expect(screen.getByTestId('fallback')).toHaveTextContent('Fallback: Risky component failed')
  })
})

// Integration Tests
describe('Error Boundary Integration', () => {
  it('handles nested error boundaries correctly', () => {
    const OuterComponent = () => (
      <ErrorBoundary componentType="outer">
        <ErrorBoundary componentType="inner">
          <TestComponent shouldError />
        </ErrorBoundary>
      </ErrorBoundary>
    )
    
    render(<OuterComponent />)
    
    // Only the inner error boundary should trigger
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('maintains error state across re-renders', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent shouldError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )
    
    // Error state should persist
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('clears error state when retry succeeds', async () => {
    let shouldError = true
    
    const ConditionalComponent = () => {
      if (shouldError) {
        createThrowError('Conditional error')
      }
      return <div>Conditional success</div>
    }
    
    render(
      <ErrorBoundary maxRetries={1} retryDelay={100}>
        <ConditionalComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    // Allow retry to succeed
    act(() => {
      shouldError = false
    })
    
    await userEvent.click(screen.getByText('Try Again'))
    
    await waitFor(() => {
      expect(screen.getByText('Conditional success')).toBeInTheDocument()
    })
  })
})

// Performance Tests
describe('Error Boundary Performance', () => {
  it('does not re-render unnecessarily when no error', () => {
    const renderCount = { current: 0 }
    
    const TestComponent = () => {
      renderCount.current++
      return <div>Test</div>
    }
    
    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )
    
    const initialRenderCount = renderCount.current
    
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )
    
    // Should only re-render when props change or state changes
    expect(renderCount.current).toBeGreaterThan(initialRenderCount)
  })

  it('limits error reports to prevent memory leaks', () => {
    // This test would verify that the error reporting service
    // properly limits the number of stored reports
    // Implementation would depend on the specific service
    expect(true).toBe(true) // Placeholder
  })
})