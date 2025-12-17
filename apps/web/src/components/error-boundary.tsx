import React, { Component, ErrorInfo, ReactNode, ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug, Shield, Zap } from 'lucide-react'

// Error context and types
interface ErrorInfo {
  componentStack: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  maxRetries?: number
  retryDelay?: number
}

interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo
  errorId: string
  retryCount: number
  onRetry: () => void
  onGoHome: () => void
  onReportIssue: () => void
}

// Enhanced error reporting service
class ErrorReportingService {
  private static instance: ErrorReportingService
  private events: Array<{
    id: string
    timestamp: Date
    error: Error
    errorInfo: ErrorInfo
    severity: 'critical' | 'high' | 'medium' | 'low'
    userAgent: string
    url: string
  }> = []

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService()
    }
    return ErrorReportingService.instance
  }

  reportError(error: Error, errorInfo: ErrorInfo, severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const event = {
      id: errorId,
      timestamp: new Date(),
      error,
      errorInfo,
      severity,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    this.events.push(event)
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100)
    }

    // In production, this would send to external service like Sentry
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(event)
    } else {
      console.error(`[ErrorBoundary] Error ${errorId}:`, error, errorInfo)
    }

    return errorId
  }

  private async sendToExternalService(event: any) {
    try {
      // Integration with external error tracking service
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          errorId: event.id,
          message: event.error.message,
          stack: event.error.stack,
          componentStack: event.errorInfo.componentStack,
          severity: event.severity,
          userAgent: event.userAgent,
          url: event.url,
          timestamp: event.timestamp.toISOString()
        })
      })
    } catch (e) {
      console.error('Failed to send error to external service:', e)
    }
  }

  getRecentErrors() {
    return this.events.slice(-10)
  }

  getErrorById(id: string) {
    return this.events.find(e => e.id === id)
  }
}

// Enhanced default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  retryCount,
  onRetry,
  onGoHome,
  onReportIssue
}) => {
  const isRetryExhausted = retryCount >= 3
  
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">
            {isRetryExhausted ? 'Persistent Error' : 'Something went wrong'}
          </CardTitle>
          <CardDescription>
            {isRetryExhausted 
              ? 'We\'ve tried multiple times but the error persists. Please try refreshing the page or contact support.'
              : 'An unexpected error occurred. Don\'t worry, your data is safe.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error ID for support */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bug className="h-4 w-4" />
              <span>Error ID: {errorId}</span>
            </div>
          </div>
          
          {/* Error message (in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-red-50 p-3 rounded-lg">
              <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
                Error Details (Development)
              </summary>
              <div className="text-xs text-red-700 space-y-2">
                <div>
                  <strong>Message:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            {!isRetryExhausted && (
              <Button 
                onClick={onRetry} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again ({retryCount}/3)
              </Button>
            )}
            
            <Button 
              onClick={onGoHome} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            
            <Button 
              onClick={onReportIssue}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Error Boundary component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorReportingService: ErrorReportingService
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0
    }
    
    this.errorReportingService = ErrorReportingService.getInstance()
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const maxRetries = this.props.maxRetries || 3
    const retryDelay = this.props.retryDelay || 1000
    
    // Report error
    const errorId = this.errorReportingService.reportError(
      error, 
      errorInfo, 
      this.determineSeverity(error)
    )
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId
    })
    
    // Auto-retry logic
    if (this.state.retryCount < maxRetries) {
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          retryCount: prevState.retryCount + 1
        }))
      }, retryDelay * Math.pow(2, this.state.retryCount)) // Exponential backoff
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  private determineSeverity(error: Error): 'critical' | 'high' | 'medium' | 'low' {
    const message = error.message.toLowerCase()
    
    if (message.includes('chunk') || message.includes('loading')) {
      return 'high'
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium'
    }
    
    return 'medium'
  }

  private handleRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: this.state.retryCount + 1
    })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReportIssue = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
    
    // In a real app, this would open a support form or email client
    const mailtoLink = `mailto:support@example.com?subject=Error Report - ${this.state.errorId}&body=${encodeURIComponent(
      JSON.stringify(errorDetails, null, 2)
    )}`
    
    window.open(mailtoLink)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onReportIssue={this.handleReportIssue}
        />
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for error handling
export function useErrorHandler() {
  const errorReportingService = ErrorReportingService.getInstance()
  
  const handleError = React.useCallback(
    (error: Error, errorInfo?: ErrorInfo, severity: 'critical' | 'high' | 'medium' | 'low' = 'medium') => {
      return errorReportingService.reportError(error, errorInfo || { componentStack: '' }, severity)
    },
    [errorReportingService]
  )
  
  return { handleError }
}

// Specialized error boundary components
export const PageErrorBoundary: React.FC<{
  children: ReactNode
  fallback?: ComponentType<ErrorFallbackProps>
}> = ({ children, fallback }) => (
  <ErrorBoundary
    maxRetries={2}
    retryDelay={2000}
    fallback={fallback}
  >
    {children}
  </ErrorBoundary>
)

export const ComponentErrorBoundary: React.FC<{
  children: ReactNode
  fallback?: ComponentType<ErrorFallbackProps>
}> = ({ children, fallback }) => (
  <ErrorBoundary
    maxRetries={3}
    retryDelay={1000}
    fallback={fallback}
  >
    {children}
  </ErrorBoundary>
)

export const ApiErrorBoundary: React.FC<{
  children: ReactNode
  onApiError?: (error: Error) => void
}> = ({ children, onApiError }) => (
  <ErrorBoundary
    maxRetries={5}
    retryDelay={2000}
    onError={(error) => {
      if (error.message.includes('API') || error.message.includes('fetch')) {
        onApiError?.(error)
      }
    }}
  >
    {children}
  </ErrorBoundary>
)

export default ErrorBoundary
