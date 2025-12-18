# Authentication & Authorization Guide

## Overview

Crazy-Gary API uses **JWT (JSON Web Tokens)** for authentication and authorization. This document provides comprehensive guidance on implementing authentication in your applications.

## Authentication Flow

### 1. User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "fullName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-12-17T10:30:00Z",
    "last_login": "2023-12-17T10:30:00Z"
  }
}
```

### 2. User Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-12-17T10:30:00Z",
    "last_login": "2023-12-17T10:30:00Z"
  }
}
```

### 3. Token Refresh

```http
POST /api/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

## Using Authentication in Requests

### Include Token in Headers

All authenticated endpoints require the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Example: Get User Profile

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-12-17T10:30:00Z",
    "last_login": "2023-12-17T10:30:00Z"
  }
}
```

## Token Management

### Token Expiration

- **Access Token**: Expires in 1 hour (3600 seconds)
- **Refresh Token**: Long-lived token for obtaining new access tokens

### Token Refresh Strategy

1. **Before Token Expiration**: Refresh token 5-10 minutes before expiration
2. **On 401 Response**: Automatically attempt to refresh token
3. **Refresh Failure**: Redirect user to login page

### Example Token Refresh Logic

```javascript
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.refreshTimeout = null;
  }

  async refreshAccessToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.refreshToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.token, this.refreshToken);
        this.scheduleRefresh(data.expires_in);
        return data.token;
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error) {
      this.clearTokens();
      window.location.href = '/login';
      throw error;
    }
  }

  scheduleRefresh(expiresIn) {
    // Refresh 5 minutes before expiration
    const refreshTime = (expiresIn - 300) * 1000;
    
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    
    this.refreshTimeout = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.token}`
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      const newToken = await this.refreshAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      
      // Retry the original request
      return fetch(url, {
        ...options,
        headers
      });
    }

    return response;
  }

  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
  }
}
```

## Client Implementation Examples

### JavaScript/TypeScript

```typescript
class CrazyGaryClient {
  private baseURL = 'https://crazy-gary-api.railway.app';
  private auth: AuthManager;

  constructor() {
    this.auth = new AuthManager();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.auth.setTokens(data.token, data.refresh_token);
    this.auth.scheduleRefresh(data.expires_in);
    
    return data.user;
  }

  async getCurrentUser() {
    const response = await this.auth.makeAuthenticatedRequest(
      `${this.baseURL}/api/auth/me`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    
    const data = await response.json();
    return data.user;
  }

  async createTask(title: string, description: string) {
    const response = await this.auth.makeAuthenticatedRequest(
      `${this.baseURL}/api/tasks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    
    return response.json();
  }

  async logout() {
    this.auth.clearTokens();
  }
}

// Usage example
const client = new CrazyGaryClient();

async function main() {
  try {
    // Login
    const user = await client.login('user@example.com', 'password123');
    console.log('Logged in as:', user.name);

    // Create a task
    const task = await client.createTask(
      'Analyze code',
      'Scan the repository for security vulnerabilities'
    );
    console.log('Created task:', task.task_id);

    // Get current user
    const currentUser = await client.getCurrentUser();
    console.log('Current user:', currentUser);

    // Logout
    await client.logout();
  } catch (error) {
    console.error('Authentication error:', error);
  }
}
```

### Python

```python
import requests
import json
from datetime import datetime, timedelta

class CrazyGaryClient:
    def __init__(self, base_url="https://crazy-gary-api.railway.app"):
        self.base_url = base_url
        self.token = None
        self.refresh_token = None
        self.token_expires = None
        
    def login(self, email, password):
        """Login and store tokens"""
        response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={"email": email, "password": password}
        )
        
        if response.status_code != 200:
            raise Exception("Login failed")
            
        data = response.json()
        self.token = data["token"]
        self.refresh_token = data["refresh_token"]
        
        # Set expiration time
        expires_in = data["expires_in"]
        self.token_expires = datetime.now() + timedelta(seconds=expires_in)
        
        return data["user"]
    
    def get_headers(self):
        """Get headers with authentication"""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers
    
    def refresh_token_if_needed(self):
        """Refresh token if it's about to expire"""
        if self.token_expires and datetime.now() >= self.token_expires - timedelta(minutes=5):
            self.refresh_access_token()
    
    def refresh_access_token(self):
        """Refresh the access token"""
        response = requests.post(
            f"{self.base_url}/api/auth/refresh",
            headers={"Authorization": f"Bearer {self.refresh_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.token = data["token"]
            expires_in = data["expires_in"]
            self.token_expires = datetime.now() + timedelta(seconds=expires_in)
        else:
            raise Exception("Token refresh failed")
    
    def get_current_user(self):
        """Get current user profile"""
        self.refresh_token_if_needed()
        
        response = requests.get(
            f"{self.base_url}/api/auth/me",
            headers=self.get_headers()
        )
        
        if response.status_code != 200:
            raise Exception("Failed to get user profile")
            
        return response.json()["user"]
    
    def create_task(self, title, description, model="gpt-oss-120b", priority="medium"):
        """Create a new task"""
        self.refresh_token_if_needed()
        
        response = requests.post(
            f"{self.base_url}/api/tasks",
            json={
                "title": title,
                "description": description,
                "model": model,
                "priority": priority
            },
            headers=self.get_headers()
        )
        
        if response.status_code != 201:
            raise Exception("Failed to create task")
            
        return response.json()
    
    def logout(self):
        """Clear stored tokens"""
        self.token = None
        self.refresh_token = None
        self.token_expires = None

# Usage example
client = CrazyGaryClient()

try:
    # Login
    user = client.login("user@example.com", "password123")
    print(f"Logged in as: {user['name']}")
    
    # Create a task
    task = client.create_task(
        "Analyze code repository",
        "Scan for security vulnerabilities"
    )
    print(f"Created task: {task['task_id']}")
    
    # Get current user
    current_user = client.get_current_user()
    print(f"Current user: {current_user['name']}")
    
    # Logout
    client.logout()
    
except Exception as e:
    print(f"Error: {e}")
```

### cURL Examples

```bash
# Register
curl -X POST https://crazy-gary-api.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "fullName": "John Doe"
  }'

# Login
curl -X POST https://crazy-gary-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'

# Get current user (replace YOUR_TOKEN)
curl -X GET https://crazy-gary-api.railway.app/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create task (replace YOUR_TOKEN)
curl -X POST https://crazy-gary-api.railway.app/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Analyze code repository",
    "description": "Scan for security vulnerabilities",
    "model": "gpt-oss-120b",
    "priority": "high"
  }'

# Refresh token (replace YOUR_REFRESH_TOKEN)
curl -X POST https://crazy-gary-api.railway.app/api/auth/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

## Security Best Practices

### 1. Token Storage
- **Web Applications**: Use secure HTTP-only cookies or secure storage mechanisms
- **Mobile Apps**: Use secure storage provided by the platform (Keychain/Keystore)
- **Single Page Applications**: Consider using sessionStorage instead of localStorage for reduced XSS risk

### 2. Token Validation
```javascript
function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (error) {
    return false;
  }
}
```

### 3. Automatic Logout
```javascript
// Logout on token expiration
function setupTokenWatcher(authManager) {
  setInterval(() => {
    if (!authManager.token || !isTokenValid(authManager.token)) {
      authManager.logout();
      window.location.href = '/login';
    }
  }, 60000); // Check every minute
}
```

### 4. Error Handling
```javascript
async function handleApiError(response) {
  switch (response.status) {
    case 401:
      // Unauthorized - redirect to login
      window.location.href = '/login';
      break;
    case 403:
      // Forbidden - show access denied message
      showError('Access denied');
      break;
    case 429:
      // Too many requests - show rate limit message
      showError('Too many requests. Please try again later.');
      break;
    default:
      // Other errors
      showError('An unexpected error occurred');
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authenticated requests**: 1000 requests per hour per user
- **Anonymous requests**: 100 requests per hour per IP
- **Registration**: 5 registrations per hour per IP
- **Login attempts**: 10 attempts per hour per IP

### Rate Limit Headers

All responses include rate limiting information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

### Handling Rate Limits

```javascript
async function handleRateLimit(response) {
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const retryAfter = resetTime ? parseInt(resetTime) - Math.floor(Date.now() / 1000) : 60;
    
    console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    
    // Retry the original request
    return true; // Indicate should retry
  }
  return false; // No retry needed
}
```

## Security Headers

The API includes several security headers:

```http
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Troubleshooting

### Common Authentication Errors

1. **401 Unauthorized**
   - Token missing or invalid
   - Token expired
   - Invalid token format

2. **403 Forbidden**
   - Valid token but insufficient permissions
   - User account suspended

3. **Token Refresh Failures**
   - Refresh token expired or invalid
   - User account deleted
   - System error

### Debugging Tips

1. **Check Token Format**
   ```javascript
   console.log('Token parts:', token.split('.'));
   console.log('Payload:', JSON.parse(atob(token.split('.')[1])));
   ```

2. **Verify Token Expiration**
   ```javascript
   const payload = JSON.parse(atob(token.split('.')[1]));
   const expires = new Date(payload.exp * 1000);
   console.log('Token expires:', expires);
   ```

3. **Network Request Logging**
   ```javascript
   // Add this to your fetch wrapper
   console.log('Request:', method, url, headers, body);
   console.log('Response:', status, responseData);
   ```

## Support

For authentication-related issues:

1. Check the [API Reference](./api-reference.md) for endpoint details
2. Review the [Error Handling Guide](./error-handling.md) for common solutions
3. Contact support at dev@crazy-gary.com