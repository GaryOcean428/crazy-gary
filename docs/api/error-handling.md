# Error Handling Guide

## Overview

This guide covers error handling patterns, common error scenarios, and best practices for handling errors when working with the Crazy-Gary API.

## Error Response Format

All API errors follow a consistent format:

```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details",
    "validation_errors": ["Email is required", "Password too short"],
    "context": "Additional context information"
  },
  "timestamp": "2023-12-17T12:00:00Z",
  "request_id": "req_123e4567-e89b-12d3-a456-426614174000"
}
```

### Error Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `error` | string | Human-readable error message |
| `code` | string | Machine-readable error code |
| `details` | object | Additional error details and context |
| `timestamp` | string | ISO 8601 timestamp when error occurred |
| `request_id` | string | Unique request identifier for debugging |

## HTTP Status Codes

### Success Codes (2xx)
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no response body

### Client Error Codes (4xx)
- `400 Bad Request`: Invalid request data or format
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Valid authentication but insufficient permissions
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Resource already exists or conflict with current state
- `422 Unprocessable Entity`: Valid request but semantic errors
- `429 Too Many Requests`: Rate limit exceeded

### Server Error Codes (5xx)
- `500 Internal Server Error`: Server-side error
- `502 Bad Gateway`: Upstream service error
- `503 Service Unavailable`: Service temporarily unavailable
- `504 Gateway Timeout`: Upstream service timeout

## Error Codes Reference

### Authentication Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `AUTH_REQUIRED` | 401 | Authentication token missing or invalid | Include valid Bearer token |
| `TOKEN_EXPIRED` | 401 | Access token has expired | Refresh token or re-login |
| `TOKEN_INVALID` | 401 | Token format is invalid | Check token format |
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect | Verify credentials |
| `REFRESH_FAILED` | 401 | Refresh token invalid or expired | Re-login required |

**Example Authentication Error:**
```json
{
  "error": "Authentication token is required",
  "code": "AUTH_REQUIRED",
  "details": {
    "header_name": "Authorization",
    "expected_format": "Bearer <token>"
  },
  "timestamp": "2023-12-17T12:00:00Z",
  "request_id": "req_123e4567"
}
```

### Validation Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `VALIDATION_ERROR` | 400 | Request data validation failed | Check request format and required fields |
| `MISSING_FIELD` | 400 | Required field not provided | Include all required fields |
| `INVALID_FORMAT` | 400 | Field format is incorrect | Check field format (email, date, etc.) |
| `VALUE_OUT_OF_RANGE` | 400 | Value outside allowed range | Check min/max values |
| `UNSUPPORTED_VALUE` | 400 | Field value not supported | Check allowed values |

**Example Validation Error:**
```json
{
  "error": "Request validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "validation_errors": [
      "Email is required",
      "Email must be a valid email address"
    ],
    "provided_value": null
  },
  "timestamp": "2023-12-17T12:00:00Z",
  "request_id": "req_123e4567"
}
```

### Resource Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `USER_NOT_FOUND` | 404 | User does not exist | Verify user ID or email |
| `TASK_NOT_FOUND` | 404 | Task does not exist | Check task ID |
| `USER_EXISTS` | 409 | User already registered | Use different email |
| `TASK_ALREADY_EXISTS` | 409 | Task with same ID exists | Use different task ID |
| `RESOURCE_LOCKED` | 423 | Resource is locked by another operation | Wait and retry |

**Example Resource Error:**
```json
{
  "error": "Task not found",
  "code": "TASK_NOT_FOUND",
  "details": {
    "task_id": "task_123e4567",
    "suggestion": "Verify the task ID is correct"
  },
  "timestamp": "2023-12-17T12:00:00Z",
  "request_id": "req_123e4567"
}
```

### Rate Limiting Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait and retry |
| `QUOTA_EXCEEDED` | 429 | API quota exceeded | Upgrade plan or wait |
| `BANDWIDTH_EXCEEDED` | 429 | Bandwidth limit exceeded | Reduce request size |

**Example Rate Limit Error:**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 1000,
    "window": 3600,
    "retry_after": 300,
    "reset_time": "2023-12-17T13:00:00Z"
  },
  "timestamp": "2023-12-17T12:00:00Z",
  "request_id": "req_123e4567"
}
```

### System Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable | Wait and retry |
| `DATABASE_ERROR` | 500 | Database operation failed | Retry later |
| `EXTERNAL_SERVICE_ERROR` | 502 | External service (HuggingFace) error | Try different service or wait |
| `CONFIGURATION_ERROR` | 500 | Service configuration issue | Contact support |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Contact support with request_id |

**Example System Error:**
```json
{
  "error": "HuggingFace API is currently unavailable",
  "code": "EXTERNAL_SERVICE_ERROR",
  "details": {
    "service": "huggingface",
    "status_code": 503,
    "retry_after": 60,
    "fallback_suggestion": "Try using the 20B model instead"
  },
  "timestamp": "2023-12-17T12:00:00Z",
  "request_id": "req_123e4567"
}
```

## Client-Side Error Handling

### JavaScript/TypeScript Error Handler

```typescript
interface APIError {
  error: string;
  code: string;
  details: Record<string, any>;
  timestamp: string;
  request_id: string;
}

class APIErrorHandler {
  static handleError(response: Response, errorData?: APIError): Error {
    const requestId = errorData?.request_id || 'unknown';
    
    switch (response.status) {
      case 400:
        return new ValidationError(
          errorData?.error || 'Invalid request',
          errorData?.details?.validation_errors || [],
          requestId
        );
      
      case 401:
        return new AuthenticationError(
          errorData?.error || 'Authentication required',
          errorData?.code,
          requestId
        );
      
      case 403:
        return new PermissionError(
          errorData?.error || 'Insufficient permissions',
          requestId
        );
      
      case 404:
        return new NotFoundError(
          errorData?.error || 'Resource not found',
          requestId
        );
      
      case 409:
        return new ConflictError(
          errorData?.error || 'Resource conflict',
          requestId
        );
      
      case 429:
        const retryAfter = errorData?.details?.retry_after || 60;
        return new RateLimitError(
          errorData?.error || 'Rate limit exceeded',
          retryAfter,
          requestId
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(
          errorData?.error || 'Server error',
          response.status,
          requestId
        );
      
      default:
        return new APIError(
          errorData?.error || `HTTP ${response.status}`,
          errorData?.code || 'UNKNOWN_ERROR',
          requestId
        );
    }
  }

  static isRetryableError(error: Error): boolean {
    return error instanceof ServerError || 
           error instanceof RateLimitError ||
           error instanceof NetworkError;
  }

  static getRetryDelay(error: Error): number {
    if (error instanceof RateLimitError) {
      return error.retryAfter * 1000;
    }
    if (error instanceof ServerError) {
      // Exponential backoff for server errors
      return Math.min(30000, Math.pow(2, error.attemptCount || 0) * 1000);
    }
    return 1000;
  }
}

// Custom Error Classes
class ValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: string[],
    public requestId: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends Error {
  constructor(
    message: string,
    public errorCode?: string,
    public requestId?: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class PermissionError extends Error {
  constructor(message: string, public requestId: string) {
    super(message);
    this.name = ' }
}

class NotFoundError extends ErrorPermissionError';
  {
  constructor(message: string, public requestId: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends Error {
  constructor(message: string, public requestId: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number,
    public requestId: string
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

class ServerError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public requestId: string
  ) {
    super(message);
    this.name = 'ServerError';
  }
}

class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

### Usage Example

```typescript
async function makeAPICall(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = undefined;
      }
      
      throw APIErrorHandler.handleError(response, errorData);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network request failed', error);
    }
    throw error;
  }
}

// Retry logic with exponential backoff
async function makeAPICallWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3
): Promise<any> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await makeAPICall(url, options);
    } catch (error) {
      lastError = error;
      
      if (!APIErrorHandler.isRetryableError(error)) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = APIErrorHandler.getRetryDelay(error);
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Usage
async function createTask(title: string, description: string) {
  try {
    const response = await makeAPICallWithRetry('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ title, description })
    });
    
    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation errors:', error.validationErrors);
      showValidationErrors(error.validationErrors);
    } else if (error instanceof RateLimitError) {
      console.warn(`Rate limited. Retry after ${error.retryAfter} seconds.`);
      scheduleRetry(error.retryAfter);
    } else if (error instanceof AuthenticationError) {
      console.error('Authentication failed:', error.message);
      redirectToLogin();
    } else {
      console.error('Unexpected error:', error.message);
      showGenericError(error.message);
    }
    
    throw error;
  }
}
```

### Python Error Handler

```python
import requests
import time
from typing import Optional, Dict, Any
from dataclasses import dataclass

@dataclass
class APIError:
    error: str
    code: str
    details: Dict[str, Any]
    timestamp: str
    request_id: str

class ValidationError(Exception):
    def __init__(self, message: str, validation_errors: list, request_id: str):
        super().__init__(message)
        self.validation_errors = validation_errors
        self.request_id = request_id

class AuthenticationError(Exception):
    def __init__(self, message: str, error_code: Optional[str] = None, request_id: Optional[str] = None):
        super().__init__(message)
        self.error_code = error_code
        self.request_id = request_id

class PermissionError(Exception):
    def __init__(self, message: str, request_id: str):
        super().__init__(message)
        self.request_id = request_id

class NotFoundError(Exception):
    def __init__(self, message: str, request_id: str):
        super().__init__(message)
        self.request_id = request_id

class RateLimitError(Exception):
    def __init__(self, message: str, retry_after: int, request_id: str):
        super().__init__(message)
        self.retry_after = retry_after
        self.request_id = request_id

class ServerError(Exception):
    def __init__(self, message: str, status_code: int, request_id: str):
        super().__init__(message)
        self.status_code = status_code
        self.request_id = request_id

class APIErrorHandler:
    @staticmethod
    def handle_error(response: requests.Response, error_data: Optional[Dict] = None) -> Exception:
        request_id = error_data.get('request_id', 'unknown') if error_data else 'unknown'
        
        status_code = response.status_code
        
        if status_code == 400:
            validation_errors = error_data.get('details', {}).get('validation_errors', []) if error_data else []
            return ValidationError(
                error_data.get('error', 'Invalid request') if error_data else 'Invalid request',
                validation_errors,
                request_id
            )
        
        elif status_code == 401:
            return AuthenticationError(
                error_data.get('error', 'Authentication required') if error_data else 'Authentication required',
                error_data.get('code') if error_data else None,
                request_id
            )
        
        elif status_code == 403:
            return PermissionError(
                error_data.get('error', 'Insufficient permissions') if error_data else 'Insufficient permissions',
                request_id
            )
        
        elif status_code == 404:
            return NotFoundError(
                error_data.get('error', 'Resource not found') if error_data else 'Resource not found',
                request_id
            )
        
        elif status_code == 429:
            retry_after = error_data.get('details', {}).get('retry_after', 60) if error_data else 60
            return RateLimitError(
                error_data.get('error', 'Rate limit exceeded') if error_data else 'Rate limit exceeded',
                retry_after,
                request_id
            )
        
        elif status_code >= 500:
            return ServerError(
                error_data.get('error', 'Server error') if error_data else 'Server error',
                status_code,
                request_id
            )
        
        else:
            return Exception(f"HTTP {status_code}: {error_data.get('error', 'Unknown error') if error_data else 'Unknown error'}")
    
    @staticmethod
    def is_retryable_error(error: Exception) -> bool:
        return isinstance(error, (ServerError, RateLimitError))
    
    @staticmethod
    def get_retry_delay(error: Exception, attempt: int = 1) -> float:
        if isinstance(error, RateLimitError):
            return error.retry_after
        
        if isinstance(error, ServerError):
            # Exponential backoff for server errors
            return min(30.0, (2 ** attempt))
        
        return 1.0

class CrazyGaryClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })
    
    def make_api_call(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(method, url, **kwargs)
            
            if not response.ok:
                try:
                    error_data = response.json()
                except ValueError:
                    error_data = None
                
                raise APIErrorHandler.handle_error(response, error_data)
            
            return response.json() if response.content else {}
        
        except requests.RequestException as e:
            raise Exception(f"Network error: {str(e)}")
    
    def make_api_call_with_retry(self, method: str, endpoint: str, max_retries: int = 3, **kwargs) -> Dict[str, Any]:
        last_error = None
        
        for attempt in range(1, max_retries + 1):
            try:
                return self.make_api_call(method, endpoint, **kwargs)
            except Exception as error:
                last_error = error
                
                if not APIErrorHandler.is_retryable_error(error):
                    raise error
                
                if attempt == max_retries:
                    raise error
                
                delay = APIErrorHandler.get_retry_delay(error, attempt)
                print(f"Attempt {attempt} failed, retrying in {delay} seconds...")
                time.sleep(delay)
        
        raise last_error
    
    def create_task(self, title: str, description: str) -> Dict[str, Any]:
        try:
            return self.make_api_call_with_retry(
                'POST',
                '/api/tasks',
                json={'title': title, 'description': description}
            )
        except ValidationError as e:
            print(f"Validation errors: {e.validation_errors}")
            raise
        except RateLimitError as e:
            print(f"Rate limited. Retry after {e.retry_after} seconds.")
            raise
        except AuthenticationError:
            print("Authentication failed. Please login again.")
            raise
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            raise

# Usage example
client = CrazyGaryClient('https://crazy-gary-api.railway.app', 'your-jwt-token')

try:
    task = client.create_task('Analyze code', 'Scan for vulnerabilities')
    print(f"Created task: {task['task_id']}")
except ValidationError as e:
    print(f"Validation failed: {e.validation_errors}")
except RateLimitError as e:
    print(f"Rate limited. Try again in {e.retry_after} seconds.")
except AuthenticationError:
    print("Please log in again.")
except Exception as e:
    print(f"Error: {str(e)}")
```

## Error Handling Best Practices

### 1. Always Handle Errors
```typescript
// Bad: Not handling errors
const response = await fetch('/api/tasks');
const data = await response.json();

// Good: Handle errors properly
try {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }
  const data = await response.json();
} catch (error) {
  console.error('API call failed:', error);
  // Handle error appropriately
}
```

### 2. Use Specific Error Types
```typescript
// Bad: Generic error handling
} catch (error) {
  if (error.message.includes('401')) {
    redirectToLogin();
  } else if (error.message.includes('404')) {
    showNotFound();
  }
}

// Good: Use specific error types
} catch (error) {
  if (error instanceof AuthenticationError) {
    redirectToLogin();
  } else if (error instanceof NotFoundError) {
    showNotFound();
  }
}
```

### 3. Implement Retry Logic
```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !APIErrorHandler.isRetryableError(error)) {
        throw error;
      }
      
      const delay = APIErrorHandler.getRetryDelay(error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

### 4. Log Errors with Context
```typescript
function logError(error: Error, context: object = {}) {
  console.error('API Error:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
}
```

### 5. Show User-Friendly Messages
```typescript
function getUserFriendlyMessage(error: Error): string {
  if (error instanceof ValidationError) {
    return 'Please check your input and try again.';
  } else if (error instanceof RateLimitError) {
    return 'Too many requests. Please wait a moment and try again.';
  } else if (error instanceof NetworkError) {
    return 'Network connection problem. Please check your internet connection.';
  } else {
    return 'Something went wrong. Please try again later.';
  }
}
```

### 6. Handle Rate Limiting Gracefully
```typescript
async function handleRateLimit(response: Response) {
  if (response.status === 429) {
    const errorData = await response.json();
    const retryAfter = errorData.details?.retry_after || 60;
    
    // Show user-friendly message
    showMessage(`Please wait ${retryAfter} seconds before trying again.`);
    
    // Schedule automatic retry
    setTimeout(() => {
      // Retry the original operation
    }, retryAfter * 1000);
  }
}
```

## Debugging Tips

### 1. Enable Request Logging
```typescript
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API Request:', args);
  return originalFetch.apply(this, args).then(response => {
    console.log('API Response:', response.status, args[0]);
    return response;
  });
};
```

### 2. Log Request IDs
Always include the `request_id` from error responses when reporting issues:

```typescript
try {
  // API call
} catch (error) {
  if (error.requestId) {
    console.error(`Error (request_id: ${error.requestId}):`, error.message);
    // Include request_id in error reports
  }
}
```

### 3. Use Browser DevTools
- Check Network tab for failed requests
- Examine request/response headers
- Look at response body for error details

### 4. Test Error Scenarios
```typescript
// Test authentication failure
describe('Authentication Errors', () => {
  it('should handle 401 errors', async () => {
    const client = new CrazyGaryClient('invalid-token');
    await expect(client.getCurrentUser()).rejects.toThrow(AuthenticationError);
  });
  
  it('should handle rate limiting', async () => {
    // Mock rate limit response
    const response = new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        details: { retry_after: 60 }
      }),
      { status: 429 }
    );
    
    // Test rate limit handling
  });
});
```

## Error Monitoring

### Client-Side Error Tracking
```typescript
class ErrorTracker {
  static trackError(error: Error, context: object = {}) {
    // Send to error tracking service
    fetch('/api/monitoring/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        context,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    });
  }
}
```

### Server-Side Error Logging
```python
import logging
import json
from datetime import datetime

class ErrorLogger:
    def __init__(self):
        self.logger = logging.getLogger('api_errors')
        self.logger.setLevel(logging.ERROR)
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def log_error(self, error: Exception, request_data: dict):
        error_info = {
            'timestamp': datetime.utcnow().isoformat(),
            'error_type': type(error).__name__,
            'error_message': str(error),
            'request_data': request_data,
            'stack_trace': error.__traceback__ if hasattr(error, '__traceback__') else None
        }
        
        self.logger.error(json.dumps(error_info))
```

## Support and Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your domain is in the allowed origins list
   - Check that you're using HTTPS
   - Verify request headers are correct

2. **Token Expiration**
   - Implement automatic token refresh
   - Handle 401 responses gracefully
   - Clear invalid tokens from storage

3. **Rate Limiting**
   - Monitor rate limit headers
   - Implement exponential backoff
   - Cache responses when appropriate

### Getting Help

1. **Check Request IDs**: Always include the `request_id` from error responses
2. **Enable Debug Logging**: Log requests and responses during development
3. **Test Error Scenarios**: Write tests for error handling
4. **Contact Support**: Include request ID and error details when contacting support

For additional help:
- Check the [API Reference](./api-reference.md) for endpoint-specific details
- Review the [Authentication Guide](./authentication.md) for auth-related issues
- Contact support at dev@crazy-gary.com with the `request_id` from error responses