import React, { useState } from 'react'
import {
  ErrorBoundary,
  PageErrorBoundary,
  ComponentErrorBoundary,
  ApiErrorBoundary,
  ChunkErrorBoundary,
  InlineErrorBoundary,
  withErrorBoundary,
  withPageErrorBoundary,
  withComponentErrorBoundary,
  useErrorHandler,
  errorRecovery
} from '@/components/error-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Example 1: Basic Error Boundary Usage
const BasicErrorExample = () => {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('This is a deliberate error for demonstration')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Error Boundary</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShouldError(true)}>
          Trigger Error
        </Button>
      </CardContent>
    </Card>
  )
}

const WrappedBasicExample = withErrorBoundary(BasicErrorExample, {
  componentType: 'example-basic',
  enableRetry: true,
  maxRetries: 3
})

// Example 2: Page-level Error Boundary
const PageWithError = () => {
  const [pageError, setPageError] = useState(false)

  if (pageError) {
    throw new Error('Page-level error occurred')
  }

  return (
    <div>
      <h2>Page Content</h2>
      <Button onClick={() => setPageError(true)}>
        Cause Page Error
      </Button>
    </div>
  )
}

const SafePage = withPageErrorBoundary(PageWithError)

// Example 3: API Error Boundary with Retry
const ApiComponent = () => {
  const [data, setData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Simulate API call that might fail
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.3) {
            reject(new Error('API request failed'))
          } else {
            resolve('Success!')
          }
        }, 1000)
      })
      setData('API Data Retrieved')
    } catch (error) {
      throw error // This will be caught by the error boundary
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Component</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </Button>
        {data && <p className="mt-2">{data}</p>}
      </CardContent>
    </Card>
  )
}

const SafeApiComponent = withComponentErrorBoundary(ApiComponent)

// Example 4: Using the Error Handler Hook
const ComponentWithErrorHook = () => {
  const { handleError, handleAsyncError, createSafeCallback } = useErrorHandler()
  const [message, setMessage] = useState('')

  const handleSafeOperation = createSafeCallback(() => {
    // This might throw an error
    if (Math.random() > 0.5) {
      throw new Error('Random error in safe operation')
    }
    setMessage('Operation succeeded!')
  }, { operation: 'safe-callback' })

  const handleAsyncSafeOperation = async () => {
    const result = await handleAsyncError(
      async () => {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.4) {
              reject(new Error('Async operation failed'))
            } else {
              resolve('Async success!')
            }
          }, 1000)
        })
        return 'Async data'
      },
      'Default value',
      { operation: 'async-safe' }
    )
    setMessage(result || 'No result')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Handler Hook Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-x-2">
          <Button onClick={handleSafeOperation}>
            Safe Callback
          </Button>
          <Button onClick={handleAsyncSafeOperation}>
            Async Safe Operation
          </Button>
        </div>
        {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}
      </CardContent>
    </Card>
  )
}

// Example 5: Inline Error Boundary
const InlineErrorExample = () => {
  const [shouldError, setShouldError] = useState(false)

  return (
    <div>
      <h3>Inline Error Boundary Example</h3>
      <InlineErrorBoundary
        fallback={({ error, retry }) => (
          <Alert>
            <AlertDescription className="flex justify-between items-center">
              <span>Inline error: {error?.message}</span>
              <Button size="sm" onClick={retry}>Retry</Button>
            </AlertDescription>
          </Alert>
        )}
      >
        {shouldError ? (
          <div>This will cause an inline error</div>
        ) : (
          <div>Inline content is working fine</div>
        )}
      </InlineErrorBoundary>
      <Button 
        onClick={() => setShouldError(true)} 
        className="mt-2"
        size="sm"
      >
        Trigger Inline Error
      </Button>
    </div>
  )
}

// Example 6: Error Recovery Patterns
const RecoveryExample = () => {
  const [data, setData] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const fetchWithRecovery = async () => {
    setStatus('loading')
    
    try {
      // Using error recovery with retry
      const result = await errorRecovery.withRetry(
        async () => {
          // Simulate API call
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              if (Math.random() > 0.3) {
                reject(new Error('Network error'))
              } else {
                resolve('Recovered data!')
              }
            }, 1000)
          })
          return 'Success!'
        },
        3, // maxRetries
        1000 // baseDelay
      )
      
      setData(result as string)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      console.error('Failed after retries:', error)
    }
  }

  const safeAsyncExample = async () => {
    const result = await errorRecovery.safeAsync(
      async () => {
        // This might fail but won't crash
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.7) {
              reject(new Error('Safe async error'))
            } else {
              resolve('Safe async success!')
            }
          }, 500)
        })
        return 'Safe result'
      },
      'Default fallback value', // fallback value
      (error) => {
        console.log('Caught error in safe async:', error)
      }
    )
    
    setData(result)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Recovery Patterns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-x-2">
          <Button 
            onClick={fetchWithRecovery} 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Recovering...' : 'Retry with Backoff'}
          </Button>
          <Button onClick={safeAsyncExample} variant="outline">
            Safe Async Operation
          </Button>
        </div>
        {status === 'success' && data && (
          <Alert>
            <AlertDescription>Success: {data}</AlertDescription>
          </Alert>
        )}
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>Failed after all retry attempts</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

// Example 7: Safe Component Creation
const RiskyComponent = ({ data }: { data: string }) => {
  // This component might throw errors
  if (!data) {
    throw new Error('Data is required')
  }
  return <div>Risky component data: {data.toUpperCase()}</div>
}

const SafeRiskyComponent = errorRecovery.createSafeComponent(
  RiskyComponent,
  ({ error }) => (
    <Alert variant="destructive">
      <AlertDescription>
        Safe fallback: {error?.message || 'Component failed to render'}
      </AlertDescription>
    </Alert>
  )
)

const SafeComponentExample = () => {
  const [data, setData] = useState('')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Safe Component Creation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-x-2">
          <Button onClick={() => setData('valid data')}>
            Set Valid Data
          </Button>
          <Button onClick={() => setData('')} variant="outline">
            Clear Data (will cause error)
          </Button>
        </div>
        <div>
          <SafeRiskyComponent data={data} />
        </div>
      </CardContent>
    </Card>
  )
}

// Main Examples Component
export const ErrorBoundaryExamples = () => {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Error Boundary Examples</h1>
      
      <div className="grid gap-6">
        <ErrorBoundary componentType="examples-page">
          <WrappedBasicExample />
        </ErrorBoundary>

        <ErrorBoundary componentType="examples-page">
          <SafePage />
        </ErrorBoundary>

        <ErrorBoundary componentType="examples-page">
          <SafeApiComponent />
        </ErrorBoundary>

        <ErrorBoundary componentType="examples-page">
          <ComponentWithErrorHook />
        </ErrorBoundary>

        <ErrorBoundary componentType="examples-page">
          <InlineErrorExample />
        </ErrorBoundary>

        <ErrorBoundary componentType="examples-page">
          <RecoveryExample />
        </ErrorBoundary>

        <ErrorBoundary componentType="examples-page">
          <SafeComponentExample />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default ErrorBoundaryExamples