# Error Boundary System Guide

A comprehensive error handling system for React applications with granular error boundaries, retry mechanisms, error reporting, and recovery patterns.

## Table of Contents

- [Overview](#overview)
- [Core Components](#core-components)
- [Types](#types)
- [Usage Examples](#usage-examples)
- [Error Reporting](#error-reporting)
- [Error Recovery](#error-recovery)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Overview

The error boundary system provides multiple layers of error handling:

1. **Granular Error Boundaries** - Different types for pages, components, API calls, and chunks
2. **Error Reporting** - Comprehensive logging and external service integration
3. **Retry Mechanisms** - Configurable retry logic with exponential backoff
4. **Recovery Patterns** - Utilities for safe operations and fallback components
5. **Type Safety** - Full TypeScript support with proper error typing

## Core Components

### ErrorBoundary
The base error boundary component with full customization options.

```tsx
<ErrorBoundary
  componentType="custom"
  enableRetry={true}
  maxRetries={3}
  retryDelay={1000}
  onError={(error, errorInfo) => console.error('Error:', error)}
  onRetry={(error) => console.log('Retrying:', error)}
>
  <YourComponent />
</ErrorBoundary>
```

### Specialized Boundaries

#### PageErrorBoundary
For page-level components with enhanced error handling.

```tsx
<PageErrorBoundary>
  <YourPageComponent />
</PageErrorBoundary>
```

#### ComponentErrorBoundary
For individual components that need error isolation.

```tsx
<ComponentErrorBoundary maxRetries={3}>
  <YourComponent />
</ComponentErrorBoundary>
```

#### ApiErrorBoundary
For API-related components with extended retry logic.

```tsx
<ApiErrorBoundary maxRetries={5} retryDelay={2000}>
  <ApiComponent />
</ApiErrorBoundary>
```

#### ChunkErrorBoundary
For chunk loading errors with minimal retry attempts.

```tsx
<ChunkErrorBoundary maxRetries={1} retryDelay={3000}>
  <LazyComponent />
</ChunkErrorBoundary>
```

### InlineErrorBoundary
For simple inline error handling without full boundary wrapper.

```tsx
<InlineErrorBoundary
  fallback={({ error, retry }) => (
    <Alert>
      <AlertDescription>
        Error: {error?.message}
        <Button onClick={retry}>Retry</Button>
      </AlertDescription>
    </Alert>
  )}
>
  <RiskyInlineComponent />
</InlineErrorBoundary>
```

## Types

### ErrorReport
```typescript
interface ErrorReport {
  id: string;
  error: Error;
  errorInfo: ErrorInfo;
  context: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  componentType: string;
  userAction?: string;
}
```

### ErrorInfo
```typescript
interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
}
```

### ErrorBoundaryProps
```typescript
interface ErrorBoundaryProps {
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
```

## Usage Examples

### Basic Usage

```tsx
import { ErrorBoundary } from '@/components/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <YourMainApplication />
    </ErrorBoundary>
  )
}
```

### Page-Level Error Handling

```tsx
import { PageErrorBoundary } from '@/components/error-boundary'

function DashboardPage() {
  return (
    <PageErrorBoundary>
      <DashboardContent />
    </PageErrorBoundary>
  )
}
```

### Component-Level Error Handling

```tsx
import { ComponentErrorBoundary } from '@/components/error-boundary'

function UserProfile() {
  return (
    <div>
      <ComponentErrorBoundary>
        <UserAvatar />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary>
        <UserStats />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary>
        <UserActivity />
      </ComponentErrorBoundary>
    </div>
  )
}
```

### Higher-Order Components

```tsx
import { withErrorBoundary, withPageErrorBoundary } from '@/components/error-boundary'

// Wrap any component with error boundary
const SafeComponent = withErrorBoundary(YourComponent, {
  componentType: 'safe-component',
  maxRetries: 3
})

// Wrap page components
const SafePage = withPageErrorBoundary(YourPageComponent)
```

### Error Handler Hook

```tsx
import { useErrorHandler } from '@/components/error-boundary'

function MyComponent() {
  const { handleError, handleAsyncError, createSafeCallback } = useErrorHandler()

  const handleClick = createSafeCallback(() => {
    // This function is automatically wrapped in error handling
    performRiskyOperation()
  }, { operation: 'click-handler' })

  const handleAsync = async () => {
    const result = await handleAsyncError(
      async () => {
        const data = await fetch('/api/data')
        return data.json()
      },
      'default-value', // Fallback if error occurs
      { operation: 'fetch-data' }
    )
    setData(result)
  }

  return (
    <div>
      <button onClick={handleClick}>Safe Click</button>
      <button onClick={handleAsync}>Safe Async</button>
    </div>
  )
}
```

## Error Reporting

### Console Logging
In development, errors are automatically logged to the console with detailed information:

```typescript
🚨 Error Report
Error: [Error details]
Error Info: { componentStack, timestamp, userAgent, url, ... }
Context: { custom context data }
Severity: high
Component Type: api
```

### External Service Integration
In production, errors can be sent to external services like Sentry:

```typescript
// The system automatically sends to external services in production
// Configure your service in the ErrorReportingService.sendToExternalService method
```

### Error Report Structure
Each error report includes:

- **Unique ID**: For tracking and correlation
- **Error Details**: Stack trace and error message
- **Context Information**: Component type, user actions, custom data
- **Severity Level**: Automatic determination based on error type
- **Metadata**: Timestamp, user agent, URL, session info

## Error Recovery

### Retry with Backoff
```tsx
import { errorRecovery } from '@/components/error-boundary'

// Retry operation with exponential backoff
const result = await errorRecovery.withRetry(
  async () => {
    const response = await fetch('/api/data')
    return response.json()
  },
  3, // max retries
  1000 // base delay in ms
)
```

### Safe Async Operations
```tsx
// Wrap async operations with automatic fallback
const result = await errorRecovery.safeAsync(
  async () => {
    const data = await fetch('/api/data')
    return data.json()
  },
  { defaultValue: 'fallback-data' }, // Fallback value
  (error) => {
    // Error handler callback
    console.log('Caught error:', error)
  }
)
```

### Safe Component Creation
```tsx
// Create components that automatically handle errors
const SafeComponent = errorRecovery.createSafeComponent(
  RiskyComponent,
  ({ error }) => (
    <div className="error-fallback">
      Component failed: {error?.message}
    </div>
  )
)
```

## Best Practices

### 1. Placement Strategy

**Application Level**: Wrap the entire app for global error handling
```tsx
<ErrorBoundary componentType="app">
  <App />
</ErrorBoundary>
```

**Page Level**: Wrap individual pages for navigation continuity
```tsx
<PageErrorBoundary>
  <YourPage />
</PageErrorBoundary>
```

**Component Level**: Wrap individual components for granular control
```tsx
<ComponentErrorBoundary>
  <Widget />
</ComponentErrorBoundary>
```

### 2. Retry Configuration

- **Pages**: 2 retries with 1s delay
- **Components**: 3 retries with 500ms delay  
- **API Calls**: 5 retries with 2s delay
- **Chunks**: 1 retry with 3s delay

### 3. Error Context

Always provide meaningful context for error reporting:

```tsx
<ErrorBoundary
  context={{
    userId: user.id,
    page: 'dashboard',
    action: 'data-fetch',
    timestamp: Date.now()
  }}
>
  <Component />
</ErrorBoundary>
```

### 4. Custom Fallbacks

Create context-appropriate fallback UI:

```tsx
const ChartErrorFallback = ({ error, retry }) => (
  <Card>
    <CardContent>
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Chart Error</AlertTitle>
        <AlertDescription>
          Unable to load chart data
          <Button onClick={retry} size="sm">Retry</Button>
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
)

<ErrorBoundary fallback={ChartErrorFallback}>
  <ChartComponent />
</ErrorBoundary>
```

### 5. Performance Considerations

- Use `React.memo` for expensive components
- Limit retry attempts to prevent infinite loops
- Clear error state appropriately
- Use inline boundaries for simple cases

### 6. Development vs Production

**Development**: Show detailed error information
**Production**: Show user-friendly messages, hide technical details

```tsx
{process.env.NODE_ENV === 'development' && (
  <details>
    <summary>Error Details</summary>
    <pre>{error.stack}</pre>
  </details>
)}
```

## API Reference

### ErrorBoundary Component

#### Props
- `children`: React node to render
- `fallback`: Custom fallback component
- `onError`: Error handler callback
- `onRetry`: Retry handler callback
- `maxRetries`: Maximum retry attempts (default: 3)
- `retryDelay`: Delay between retries in ms (default: 1000)
- `componentType`: Type identifier for reporting
- `context`: Additional context data
- `enableRetry`: Enable retry functionality (default: true)
- `enableErrorReporting`: Enable error reporting (default: true)

### useErrorHandler Hook

#### Returns
- `handleError(error, context, options)`: Handle errors manually
- `handleAsyncError(operation, fallback, context)`: Handle async operations safely
- `createSafeCallback(callback, context)`: Create error-safe callback functions
- `errorReportingService`: Access to error reporting service

### errorRecovery Utilities

#### Methods
- `withRetry(operation, maxRetries, baseDelay)`: Retry with exponential backoff
- `safeAsync(operation, fallback, onError)`: Safe async operation wrapper
- `createSafeComponent(Component, fallback)`: Create error-safe component wrapper

### ErrorReportingService

#### Methods
- `reportError(error, errorInfo, context, componentType)`: Report error
- `getReports()`: Get all reported errors
- `clearReports()`: Clear error reports
- `generateErrorId()`: Generate unique error ID

## Integration with External Services

### Sentry Integration
```typescript
// In ErrorReportingService.sendToExternalService
const { captureException } = require('@sentry/react')
captureException(error, {
  extra: {
    errorInfo,
    context,
    componentType
  }
})
```

### LogRocket Integration
```typescript
// In ErrorReportingService.sendToExternalService
LogRocket.captureException(error, {
  extra: {
    errorInfo,
    context
  }
})
```

## Troubleshooting

### Common Issues

1. **Error boundary not catching errors**: Ensure the error occurs in the component's render method or event handlers
2. **Infinite retry loops**: Set appropriate `maxRetries` limits
3. **Memory leaks**: Clear timeouts and subscriptions in `componentWillUnmount`
4. **Performance issues**: Use appropriate boundary granularity

### Debug Mode

Enable debug logging:
```typescript
// Set environment variable
DEBUG_ERROR_BOUNDARIES=true
```

### Testing

Use the provided test utilities:
```typescript
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '@/components/error-boundary'

test('renders children when no error', () => {
  render(
    <ErrorBoundary>
      <div>Test content</div>
    </ErrorBoundary>
  )
  expect(screen.getByText('Test content')).toBeInTheDocument()
})
```

This error boundary system provides a robust foundation for handling errors in React applications with proper user feedback, automatic recovery, and comprehensive error reporting.