import React, { Component, ErrorInfo, ReactNode, ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Info, AlertCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Type definitions for error handling
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
}

export interface ErrorReport {
  id: string;
  error: Error;
  errorInfo: ErrorInfo;
  context: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  componentType: string;
  userAction?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isRetrying: boolean;
  lastRetryAt: number | null;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
  componentType?: string;
  context?: Record<string, unknown>;
  enableRetry?: boolean;
  enableErrorReporting?: boolean;
  enableRecovery?: boolean;
}

export interface ErrorBoundaryFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isRetrying: boolean;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onReportError: () => void;
  onDismiss: () => void;
  maxRetries: number;
  enableRetry: boolean;
  enableErrorReporting: boolean;
}

// Error severity icons
const getSeverityIcon = (severity: ErrorReport['severity']) => {
  switch (severity) {
    case 'low': return <Info className="h-4 w-4" />
    case 'medium': return <AlertCircle className="h-4 w-4" />
    case 'high': return <AlertTriangle className="h-4 w-4" />
    case 'critical': return <XCircle className="h-4 w-4" />
    default: return <Bug className="h-4 w-4" />
  }
}

// Error severity colors
const getSeverityColor = (severity: ErrorReport['severity']) => {
  switch (severity) {
    case 'low': return 'secondary'
    case 'medium': return 'outline'
    case 'high': return 'destructive'
    case 'critical': return 'destructive'
    default: return 'outline'
  }
}

// Error reporting service
class ErrorReportingService {
  private static instance: ErrorReportingService
  private reports: ErrorReport[] = []
  private maxReports = 100

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService()
    }
    return ErrorReportingService.instance
  }

  generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getErrorInfo(error: Error, componentStack: string): ErrorInfo {
    return {
      componentStack,
      errorBoundary: this.getComponentType(),
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    }
  }

  private getComponentType(): string {
    // This would be set by the error boundary context
    return 'unknown'
  }

  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('sessionId') || undefined
    } catch {
      return undefined
    }
  }

  private getUserId(): string | undefined {
    try {
      return localStorage.getItem('userId') || undefined
    } catch {
      return undefined
    }
  }

  determineSeverity(error: Error, context: Record<string, unknown>): ErrorReport['severity'] {
    const errorMessage = error.message.toLowerCase()
    const errorName = error.name.toLowerCase()

    // Critical errors
    if (
      errorName.includes('chunk') ||
      errorMessage.includes('loading chunk') ||
      errorMessage.includes('network error') ||
      context.severity === 'critical'
    ) {
      return 'critical'
    }

    // High severity errors
    if (
      errorName.includes('syntax') ||
      errorName.includes('reference') ||
      errorName.includes('type') ||
      errorMessage.includes('cannot read property') ||
      errorMessage.includes('undefined is not an object')
    ) {
      return 'high'
    }

    // Medium severity errors
    if (
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('permission denied')
    ) {
      return 'medium'
    }

    return 'low'
  }

  reportError(
    error: Error,
    errorInfo: ErrorInfo,
    context: Record<string, unknown> = {},
    componentType: string = 'unknown'
  ): ErrorReport {
    const report: ErrorReport = {
      id: this.generateErrorId(),
      error,
      errorInfo,
      context,
      severity: this.determineSeverity(error, context),
      componentType
    }

    // Store report locally
    this.reports.push(report)
    if (this.reports.length > this.maxReports) {
      this.reports.shift()
    }

    // Log to console in development
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Report')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Context:', context)
      console.error('Severity:', report.severity)
      console.error('Component Type:', componentType)
      console.groupEnd()
    }

    // Send to external service in production
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendToExternalService(report)
    }

    return report
  }

  private async sendToExternalService(report: ErrorReport): Promise<void> {
    try {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
      // Example integration:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // })
      
      console.info('Error report sent:', report.id)
    } catch (err) {
      console.error('Failed to send error report:', err)
    }
  }

  getReports(): ErrorReport[] {
    return [...this.reports]
  }

  clearReports(): void {
    this.reports = []
  }
}

// Error Recovery Service
class ErrorRecoveryService {
  static retryWithBackoff(fn: () => Promise<unknown>, maxRetries = 3, baseDelay = 1000): Promise<unknown> {
    return new Promise((resolve, reject) => {
      let retries = 0

      const attemptRetry = async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          retries++
          
          if (retries >= maxRetries) {
            reject(error)
            return
          }

          const delay = baseDelay * Math.pow(2, retries - 1) // Exponential backoff
          setTimeout(attemptRetry, delay)
        }
      }

      attemptRetry()
    })
  }

  static async safeAsyncOperation<T>(
    operation: () => Promise<T>,
    fallback: T,
    onError?: (error: Error) => void
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      onError?.(error as Error)
      return fallback
    }
  }

  static createSafeComponent<T extends Record<string, unknown>>(
    Component: React.ComponentType<T>,
    fallback: React.ComponentType<{ error?: Error }>
  ) {
    return function SafeComponent(props: T) {
      const [hasError, setHasError] = React.useState(false)
      const [error, setError] = React.useState<Error | undefined>()

      const handleError = React.useCallback((err: Error) => {
        setError(err)
        setHasError(true)
        onError?.(err)
      }, [])

      if (hasError) {
        const FallbackComponent = fallback
        return <FallbackComponent error={error} />
      }

      try {
        return <Component {...props} />
      } catch (err) {
        handleError(err as Error)
        const FallbackComponent = fallback
        return <FallbackComponent error={err as Error} />
      }
    }
  }
}

// Main Error Boundary Component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorReportingService = ErrorReportingService.getInstance()
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false,
      lastRetryAt: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: ErrorReportingService.getInstance().generateErrorId()
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const enhancedErrorInfo = this.errorReportingService.getErrorInfo(
      error,
      errorInfo.componentStack
    )

    const report = this.errorReportingService.reportError(
      error,
      enhancedErrorInfo,
      this.props.context || {},
      this.props.componentType || 'unknown'
    )

    this.setState({
      error,
      errorInfo: enhancedErrorInfo,
      errorId: report.id
    })

    // Call custom error handler
    this.props.onError?.(error, enhancedErrorInfo)
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    if (this.state.isRetrying) return

    const maxRetries = this.props.maxRetries || 3
    const retryDelay = this.props.retryDelay || 1000

    if (this.state.retryCount >= maxRetries) {
      return
    }

    this.setState({
      isRetrying: true,
      retryCount: this.state.retryCount + 1,
      lastRetryAt: Date.now()
    })

    // Call custom retry handler
    this.props.onRetry?.(this.state.error!)

    // Clear error state after delay
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      })
    }, retryDelay)
  }

  handleReload = () => {
    window.location.reload()
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

  handleReportError = () => {
    if (this.state.error && this.state.errorInfo) {
      const report = this.errorReportingService.reportError(
        this.state.error,
        this.state.errorInfo,
        this.props.context || {},
        this.props.componentType || 'unknown'
      )
      
      // You could show a toast or modal here
      console.log('Error reported:', report.id)
    }
  }

  handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false,
      lastRetryAt: null
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          isRetrying={this.state.isRetrying}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          onReportError={this.handleReportError}
          onDismiss={this.handleDismiss}
          maxRetries={this.props.maxRetries || 3}
          enableRetry={this.props.enableRetry !== false}
          enableErrorReporting={this.props.enableErrorReporting !== false}
        />
      )
    }

    return this.props.children
  }
}

// Default Error Fallback Component
function DefaultErrorFallback(props: ErrorBoundaryFallbackProps) {
  const maxRetries = props.maxRetries
  const canRetry = props.enableRetry && props.retryCount < maxRetries
  const progress = (props.retryCount / maxRetries) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. We're working to fix this issue.
          </CardDescription>
          
          {props.errorId && (
            <Badge variant="outline" className="mt-2">
              Error ID: {props.errorId}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error Progress */}
          {props.isRetrying && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Retrying... (Attempt {props.retryCount + 1})</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Error Details in Development */}
          {typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && props.error && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertTitle>Development Error Details</AlertTitle>
              <AlertDescription>
                <details className="text-sm mt-2">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details
                  </summary>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {props.error.toString()}
                    {props.errorInfo?.componentStack}
                  </pre>
                </details>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {canRetry && (
              <Button 
                onClick={props.onRetry} 
                disabled={props.isRetrying}
                className="flex-1 min-w-[120px]"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${props.isRetrying ? 'animate-spin' : ''}`} />
                {props.isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
            
            <Button onClick={props.onReload} variant="outline" className="flex-1 min-w-[120px]">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
            
            <Button onClick={props.onGoHome} variant="outline" className="flex-1 min-w-[120px]">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="flex justify-center gap-2 pt-2">
            {props.enableErrorReporting && (
              <Button onClick={props.onReportError} variant="ghost" size="sm">
                <Bug className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            )}
            
            <Button onClick={props.onDismiss} variant="ghost" size="sm">
              <XCircle className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
          </div>

          {/* Retry Attempts Info */}
          {props.retryCount > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Retry attempts: {props.retryCount} / {maxRetries}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Specialized Error Boundary Components

// Page-level error boundary
export class PageErrorBoundary extends ErrorBoundary {
  constructor(props: Omit<ErrorBoundaryProps, 'componentType'>) {
    super({
      ...props,
      componentType: 'page',
      enableRetry: true,
      enableErrorReporting: true,
      maxRetries: 2
    })
  }
}

// Component-level error boundary
export class ComponentErrorBoundary extends ErrorBoundary {
  constructor(props: Omit<ErrorBoundaryProps, 'componentType'>) {
    super({
      ...props,
      componentType: 'component',
      enableRetry: true,
      enableErrorReporting: true,
      maxRetries: 3
    })
  }
}

// API error boundary
export class ApiErrorBoundary extends ErrorBoundary {
  constructor(props: Omit<ErrorBoundaryProps, 'componentType'>) {
    super({
      ...props,
      componentType: 'api',
      enableRetry: true,
      enableErrorReporting: true,
      maxRetries: 5,
      retryDelay: 2000
    })
  }
}

// Chunk loading error boundary
export class ChunkErrorBoundary extends ErrorBoundary {
  constructor(props: Omit<ErrorBoundaryProps, 'componentType'>) {
    super({
      ...props,
      componentType: 'chunk',
      enableRetry: true,
      enableErrorReporting: true,
      maxRetries: 1,
      retryDelay: 3000
    })
  }
}

// Simple inline error boundary for functional components
export const InlineErrorBoundary: React.FC<{
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>
  onError?: (error: Error) => void
}> = ({ children, fallback, onError }) => {
  const [error, setError] = React.useState<Error | null>(null)

  const handleRetry = React.useCallback(() => {
    setError(null)
  }, [])

  if (error) {
    const FallbackComponent = fallback || DefaultInlineFallback
    return <FallbackComponent error={error} retry={handleRetry} />
  }

  return (
    <ErrorBoundary
      componentType="inline"
      onError={(err) => {
        setError(err)
        onError?.(err)
      }}
      enableRetry={true}
      enableErrorReporting={true}
      maxRetries={2}
      retryDelay={500}
    >
      {children}
    </ErrorBoundary>
  )
}

// Default inline fallback
function DefaultInlineFallback({ error, retry }: { error?: Error; retry?: () => void }) {
  return (
    <Alert className="my-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Component Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">
          {error?.message || 'An unexpected error occurred'}
        </span>
        {retry && (
          <Button size="sm" variant="outline" onClick={retry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Higher-order components
export const withErrorBoundary = <P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

export const withPageErrorBoundary = <P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>
) => {
  return withErrorBoundary(WrappedComponent, {
    componentType: 'page',
    enableRetry: true,
    enableErrorReporting: true,
    maxRetries: 2
  })
}

export const withComponentErrorBoundary = <P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>
) => {
  return withErrorBoundary(WrappedComponent, {
    componentType: 'component',
    enableRetry: true,
    enableErrorReporting: true,
    maxRetries: 3
  })
}

// Enhanced error handling hook
export const useErrorHandler = () => {
  const { toast } = useToast()
  const errorReportingService = ErrorReportingService.getInstance()

  const handleError = React.useCallback((
    error: Error | string,
    context: Record<string, unknown> = {},
    options: {
      showToast?: boolean
      reportError?: boolean
      severity?: ErrorReport['severity']
    } = {}
  ) => {
    const { showToast = true, reportError = true, severity } = options
    const errorObj = typeof error === 'string' ? new Error(error) : error

    // Report error if enabled
    if (reportError) {
      const errorInfo = errorReportingService.getErrorInfo(errorObj, '')
      errorReportingService.reportError(
        errorObj,
        errorInfo,
        { ...context, ...(severity && { severity }) },
        'hook'
      )
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: "Something went wrong",
        description: errorObj.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }

    // Log to console in development
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Error handled by useErrorHandler:', errorObj, context)
    }
  }, [toast])

  const handleAsyncError = React.useCallback(async <T extends unknown>(
    operation: () => Promise<T>,
    fallback?: T,
    context: Record<string, unknown> = {}
  ): Promise<T | undefined> => {
    try {
      return await operation()
    } catch (error) {
      handleError(error as Error, context)
      return fallback
    }
  }, [handleError])

  const createSafeCallback = React.useCallback(<T extends unknown[]>(
    callback: (...args: T) => void,
    context: Record<string, unknown> = {}
  ) => {
    return (...args: T) => {
      try {
        callback(...args)
      } catch (error) {
        handleError(error as Error, context)
      }
    }
  }, [handleError])

  return {
    handleError,
    handleAsyncError,
    createSafeCallback,
    errorReportingService
  }
}

// Error recovery utilities
export const errorRecovery = {
  withRetry: ErrorRecoveryService.retryWithBackoff,
  safeAsync: ErrorRecoveryService.safeAsyncOperation,
  createSafeComponent: ErrorRecoveryService.createSafeComponent
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
