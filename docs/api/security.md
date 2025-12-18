# Security & Rate Limiting Documentation

## Overview

This document covers security best practices, rate limiting policies, and compliance requirements for the Crazy-Gary API.

## Authentication Security

### JWT Token Security

#### Token Generation
- **Algorithm**: HS256 (HMAC SHA-256)
- **Key Rotation**: Tokens are signed with rotating secrets
- **Expiration**: Access tokens expire after 1 hour
- **Refresh Tokens**: Long-lived tokens for obtaining new access tokens

#### Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": 123,
    "email": "user@example.com",
    "iat": 1640995200,
    "exp": 1640998800,
    "iss": "crazy-gary-api",
    "aud": "crazy-gary-clients"
  },
  "signature": "base64url-encoded-hmac-sha256-signature"
}
```

#### Secure Token Storage

**Web Applications (React/Vue/Angular):**
```typescript
// Use HTTP-only cookies when possible
document.cookie = `token=${accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`;

// If using localStorage (less secure but common)
localStorage.setItem('token', accessToken);

// Secure storage utility
class SecureTokenStorage {
  private static TOKEN_KEY = 'crazy_gary_token';
  
  static setToken(token: string): void {
    // Use secure storage if available (e.g., Web Crypto API)
    if (window.crypto && window.crypto.subtle) {
      this.encryptAndStore(token);
    } else {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }
  
  static getToken(): string | null {
    const encrypted = localStorage.getItem(this.TOKEN_KEY);
    if (encrypted && window.crypto && window.crypto.subtle) {
      return this.decryptAndRetrieve(encrypted);
    }
    return encrypted;
  }
  
  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
```

**Mobile Applications:**
```javascript
// React Native - Use SecureStore
import * as SecureStore from 'expo-secure-store';

async function storeToken(token) {
  await SecureStore.setItemAsync('crazy_gary_token', token);
}

async function getToken() {
  return await SecureStore.getItemAsync('crazy_gary_token');
}

// iOS Keychain example
import { Keychain } from 'react-native-keychain';

await Keychain.setInternetCredentials(
  'crazy_gary_token',
  'username', // not used for JWT
  token
);
```

**Server-to-Server Authentication:**
```python
# Use environment variables or secure configuration
import os
from typing import Optional

class ServerAuth:
    def __init__(self):
        self.api_token = os.getenv('CRAZY_GARY_API_TOKEN')
        if not self.api_token:
            raise ValueError("CRAZY_GARY_API_TOKEN environment variable is required")
    
    def get_headers(self) -> dict:
        return {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json'
        }
```

### Token Validation

#### Client-Side Validation
```typescript
function validateToken(token: string): { valid: boolean; payload?: any } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp < now) {
      return { valid: false };
    }
    
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// Usage
function isAuthenticated(): boolean {
  const token = SecureTokenStorage.getToken();
  if (!token) return false;
  
  const validation = validateToken(token);
  return validation.valid;
}
```

#### Server-Side Token Validation (Example for middleware)
```python
import jwt
import os
from functools import wraps
from flask import request, jsonify

class TokenValidator:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET')
        if not self.secret_key:
            raise ValueError("JWT_SECRET environment variable is required")
    
    def validate_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")
    
    def require_auth(self, f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = None
            
            # Get token from Authorization header
            auth_header = request.headers.get('Authorization')
            if auth_header:
                parts = auth_header.split()
                if len(parts) == 2 and parts[0] == 'Bearer':
                    token = parts[1]
            
            if not token:
                return jsonify({'error': 'Token is missing'}), 401
            
            try:
                payload = self.validate_token(token)
                request.current_user = payload
            except ValueError as e:
                return jsonify({'error': str(e)}), 401
            
            return f(*args, **kwargs)
        
        return decorated_function
```

## Rate Limiting

### Rate Limit Policies

| Endpoint Category | Limit | Window | Burst |
|------------------|-------|--------|-------|
| Authentication | 10 requests | 1 hour | 3 requests |
| General API | 1000 requests | 1 hour | 50 requests |
| Task Creation | 100 requests | 1 hour | 10 requests |
| Endpoint Management | 100 requests | 1 hour | 10 requests |
| Monitoring | 500 requests | 1 hour | 25 requests |
| MCP Tools | 200 requests | 1 hour | 20 requests |
| Health Checks | 60 requests | 1 minute | 5 requests |

### Rate Limit Headers

All responses include rate limiting information:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
X-RateLimit-Type: sliding
Retry-After: 60
```

### Rate Limit Implementation

#### Client-Side Rate Limiting
```typescript
class RateLimiter {
  private requests: number[] = [];
  private readonly limit: number;
  private readonly window: number; // in milliseconds
  
  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.window = windowMs;
  }
  
  async acquire(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.window);
    
    if (this.requests.length >= this.limit) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.window - (now - oldestRequest);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.acquire(); // Retry after waiting
      }
    }
    
    this.requests.push(now);
  }
}

// Usage
const apiRateLimiter = new RateLimiter(1000, 3600000); // 1000 per hour
const taskRateLimiter = new RateLimiter(100, 3600000); // 100 tasks per hour

async function makeAPICall(url: string, options: RequestInit) {
  await apiRateLimiter.acquire();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Request-ID': generateRequestId()
    }
  });
}

async function createTask(taskData: any) {
  await taskRateLimiter.acquire();
  
  return makeAPICall('/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
}
```

#### Exponential Backoff
```typescript
async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      
      if (error instanceof RateLimitError) {
        // Use server-provided retry-after if available
        const retryAfter = error.retryAfter || delay;
        await new Promise(resolve => setTimeout(resolve, retryAfter));
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
```

### Rate Limit Monitoring

#### Client-Side Rate Limit Tracking
```typescript
class RateLimitMonitor {
  private metrics = {
    totalRequests: 0,
    rateLimitedRequests: 0,
    successfulRequests: 0,
    failedRequests: 0
  };
  
  trackRequest(response: Response) {
    this.metrics.totalRequests++;
    
    if (response.status === 429) {
      this.metrics.rateLimitedRequests++;
      
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const remaining = response.headers.get('X-RateLimit-Remaining');
      
      console.warn(`Rate limited. Remaining: ${remaining}, Resets at: ${resetTime}`);
    } else if (response.ok) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 
        ? this.metrics.successfulRequests / this.metrics.totalRequests 
        : 0,
      rateLimitPercentage: this.metrics.totalRequests > 0
        ? this.metrics.rateLimitedRequests / this.metrics.totalRequests
        : 0
    };
  }
}
```

## Security Headers

### Required Security Headers

All API responses include security headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### CORS Configuration

```typescript
// Server CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://app.yourdomain.com',
      'https://admin.yourdomain.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-Client-Version'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID'
  ]
};
```

### Request ID Tracking

Every request includes a unique request ID for tracing:

```typescript
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function withRequestId(headers: Headers): Headers {
  const requestId = generateRequestId();
  headers.set('X-Request-ID', requestId);
  return headers;
}

// Usage in API client
class APIClient {
  async request(endpoint: string, options: RequestInit = {}) {
    const headers = withRequestId(new Headers(options.headers));
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Log request ID for debugging
    const requestId = response.headers.get('X-Request-ID');
    if (requestId) {
      console.log(`Request ${requestId} completed with status ${response.status}`);
    }
    
    return response;
  }
}
```

## Input Validation

### Client-Side Validation

```typescript
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null; // Returns error message or null
}

interface ValidationSchema {
  [field: string]: ValidationRule;
}

class FormValidator {
  constructor(private schema: ValidationSchema) {}
  
  validate(data: Record<string, any>): { valid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};
    
    for (const [field, rule] of Object.entries(this.schema)) {
      const value = data[field];
      const fieldErrors: string[] = [];
      
      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${field} is required`);
      }
      
      // Skip other validations if field is empty and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // String validations
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(`${field} must be at least ${rule.minLength} characters`);
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(`${field} must be no more than ${rule.maxLength} characters`);
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(`${field} format is invalid`);
        }
      }
      
      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          fieldErrors.push(customError);
        }
      }
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Usage
const taskValidationSchema: ValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  priority: {
    required: true,
    custom: (value) => {
      const allowed = ['low', 'medium', 'high', 'critical'];
      return allowed.includes(value) ? null : 'Priority must be one of: ' + allowed.join(', ');
    }
  }
};

const validator = new FormValidator(taskValidationSchema);

function validateTaskForm(data: any) {
  const result = validator.validate(data);
  
  if (!result.valid) {
    throw new ValidationError('Task validation failed', result.errors);
  }
  
  return data;
}
```

### Server-Side Validation Example

```python
from marshmallow import Schema, fields, validate, ValidationError
import bleach

class TaskSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    description = fields.Str(required=True, validate=validate.Length(min=10, max=1000))
    priority = fields.Str(required=True, validate=validate.OneOf(['low', 'medium', 'high', 'critical']))
    model = fields.Str(validate=validate.OneOf(['gpt-oss-120b', 'gpt-oss-20b']))
    
    def clean_title(self, title):
        # Sanitize HTML/script tags
        return bleach.clean(title, tags=[], strip=True)
    
    def clean_description(self, description):
        # Sanitize HTML/script tags
        return bleach.clean(description, tags=[], strip=True)

def validate_task_data(data):
    schema = TaskSchema()
    try:
        return schema.load(data)
    except ValidationError as err:
        raise ValueError(f"Validation failed: {err.messages}")
```

## Data Protection

### Sensitive Data Handling

```typescript
class SensitiveDataHandler {
  // Remove sensitive fields from logs and errors
  static sanitizeForLogging(data: any): any {
    const sensitiveFields = ['password', 'token', 'refresh_token', 'api_key', 'secret'];
    const sanitized = JSON.parse(JSON.stringify(data));
    
    function removeSensitive(obj: any) {
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            removeSensitive(obj[key]);
          }
        }
      }
    }
    
    removeSensitive(sanitized);
    return sanitized;
  }
  
  // Secure token transmission
  static async transmitToken(token: string, endpoint: string): Promise<Response> {
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Request-ID': this.generateRequestId()
      }
    });
  }
  
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Encryption for Client-Side Storage

```typescript
// Web Crypto API for encrypting tokens before storage
class EncryptedTokenStorage {
  private static async getEncryptionKey(): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('your-encryption-key'), // Use a proper key derivation
      { name: 'PBKDF2' },
      false,
      ['encrypt', 'decrypt']
    );
    
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('salt'), // Use a proper salt
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  static async storeToken(token: string): Promise<void> {
    const key = await this.getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(token)
    );
    
    const stored = {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };
    
    localStorage.setItem('encrypted_token', JSON.stringify(stored));
  }
  
  static async retrieveToken(): Promise<string | null> {
    const stored = localStorage.getItem('encrypted_token');
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      const key = await this.getEncryptionKey();
      
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(parsed.iv)
        },
        key,
        new Uint8Array(parsed.data)
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Failed to decrypt token:', error);
      localStorage.removeItem('encrypted_token');
      return null;
    }
  }
}
```

## API Key Management

### Environment Variables

```bash
# .env file (never commit to version control)
CRAZY_GARY_API_KEY=your_api_key_here
CRAZY_GARY_API_SECRET=your_api_secret_here
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

```typescript
// Environment variable usage
class Config {
  static get API_KEY(): string {
    const key = process.env.REACT_APP_CRAZY_GARY_API_KEY;
    if (!key) {
      throw new Error('REACT_APP_CRAZY_GARY_API_KEY is required');
    }
    return key;
  }
  
  static get API_SECRET(): string {
    const secret = process.env.REACT_APP_CRAZY_GARY_API_SECRET;
    if (!secret) {
      throw new Error('REACT_APP_CRAZY_GARY_API_SECRET is required');
    }
    return secret;
  }
}
```

### API Key Rotation

```typescript
class APIKeyManager {
  private currentKey: string;
  private backupKeys: string[] = [];
  private rotationInterval: NodeJS.Timeout;
  
  constructor(
    private getCurrentKey: () => string,
    private getBackupKeys: () => string[],
    private rotateKey: (newKey: string) => Promise<void>
  ) {
    this.currentKey = this.getCurrentKey();
    this.backupKeys = this.getBackupKeys();
    
    // Rotate key every 24 hours
    this.rotationInterval = setInterval(() => {
      this.rotateAPIKey();
    }, 24 * 60 * 60 * 1000);
  }
  
  async rotateAPIKey(): Promise<void> {
    try {
      // Generate new key (implement your key generation logic)
      const newKey = await this.generateNewKey();
      
      // Test new key
      const testResult = await this.testKey(newKey);
      if (!testResult.valid) {
        throw new Error('New key failed validation');
      }
      
      // Rotate to new key
      await this.rotateKey(newKey);
      
      // Update current key and add old key to backup
      this.backupKeys.push(this.currentKey);
      this.currentKey = newKey;
      
      // Keep only last 3 backup keys
      if (this.backupKeys.length > 3) {
        this.backupKeys = this.backupKeys.slice(-3);
      }
      
      console.log('API key rotated successfully');
    } catch (error) {
      console.error('API key rotation failed:', error);
      // Don't throw - keep using current key
    }
  }
  
  private async generateNewKey(): Promise<string> {
    // Implementation for generating new API key
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }
  
  private async testKey(key: string): Promise<{ valid: boolean }> {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      });
      
      return { valid: response.ok };
    } catch {
      return { valid: false };
    }
  }
  
  getCurrentAPIKey(): string {
    return this.currentKey;
  }
  
  getBackupKeys(): string[] {
    return [...this.backupKeys];
  }
  
  destroy(): void {
    clearInterval(this.rotationInterval);
  }
}
```

## Security Monitoring

### Security Event Tracking

```typescript
class SecurityMonitor {
  private events: SecurityEvent[] = [];
  
  trackEvent(event: SecurityEvent): void {
    const securityEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      ipAddress: null // Will be set by server
    };
    
    this.events.push(securityEvent);
    
    // Send to security monitoring service
    this.sendToSecurityService(securityEvent);
    
    // Check for suspicious patterns
    this.checkForSuspiciousActivity(securityEvent);
  }
  
  trackAuthentication(success: boolean, method: string, userId?: string): void {
    this.trackEvent({
      type: 'authentication',
      success,
      details: { method, userId }
    });
  }
  
  trackRateLimitBreach(endpoint: string, limit: number, actual: number): void {
    this.trackEvent({
      type: 'rate_limit_breach',
      success: false,
      details: { endpoint, limit, actual }
    });
  }
  
  trackSuspiciousActivity(reason: string, context: any): void {
    this.trackEvent({
      type: 'suspicious_activity',
      success: false,
      details: { reason, context }
    });
  }
  
  private checkForSuspiciousActivity(event: SecurityEvent): void {
    // Check for rapid authentication failures
    if (event.type === 'authentication' && !event.success) {
      const recentFailures = this.events.filter(e => 
        e.type === 'authentication' && 
        !e.success && 
        Date.now() - e.timestamp < 300000 // Last 5 minutes
      );
      
      if (recentFailures.length >= 5) {
        this.trackSuspiciousActivity('Multiple authentication failures', {
          failures: recentFailures.length,
          timeWindow: '5 minutes'
        });
      }
    }
    
    // Check for unusual API usage patterns
    if (event.type === 'api_request') {
      const recentRequests = this.events.filter(e =>
        e.type === 'api_request' &&
        Date.now() - e.timestamp < 60000 // Last minute
      );
      
      if (recentRequests.length >= 100) {
        this.trackSuspiciousActivity('High API request volume', {
          requests: recentRequests.length,
          timeWindow: '1 minute'
        });
      }
    }
  }
  
  private getSessionId(): string {
    return sessionStorage.getItem('session_id') || 
           this.generateSessionId();
  }
  
  private generateSessionId(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
    return sessionId;
  }
  
  private async sendToSecurityService(event: SecurityEvent): Promise<void> {
    try {
      await fetch('/api/monitoring/security-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send security event:', error);
    }
  }
}

interface SecurityEvent {
  type: 'authentication' | 'api_request' | 'rate_limit_breach' | 'suspicious_activity';
  success: boolean;
  details: Record<string, any>;
  timestamp?: number;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}
```

### Security Audit Logging

```python
import logging
import json
from datetime import datetime
from typing import Dict, Any

class SecurityLogger:
    def __init__(self):
        self.logger = logging.getLogger('security')
        self.logger.setLevel(logging.INFO)
        
        # Create file handler
        handler = logging.FileHandler('security-audit.log')
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def log_authentication_attempt(self, user_id: str, success: bool, ip_address: str, user_agent: str):
        event = {
            'event_type': 'authentication_attempt',
            'user_id': user_id,
            'success': success,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.logger.info(json.dumps(event))
    
    def log_api_access(self, user_id: str, endpoint: str, method: str, 
                      status_code: int, ip_address: str, request_id: str):
        event = {
            'event_type': 'api_access',
            'user_id': user_id,
            'endpoint': endpoint,
            'method': method,
            'status_code': status_code,
            'ip_address': ip_address,
            'request_id': request_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.logger.info(json.dumps(event))
    
    def log_security_incident(self, incident_type: str, severity: str, 
                            description: str, context: Dict[str, Any] = None):
        event = {
            'event_type': 'security_incident',
            'incident_type': incident_type,
            'severity': severity,
            'description': description,
            'context': context or {},
            'timestamp': datetime.utcnow().isoformat()
        }
        self.logger.error(json.dumps(event))
    
    def log_data_access(self, user_id: str, resource_type: str, 
                       resource_id: str, action: str, ip_address: str):
        event = {
            'event_type': 'data_access',
            'user_id': user_id,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'action': action,
            'ip_address': ip_address,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.logger.info(json.dumps(event))
```

## Compliance

### GDPR Compliance

```typescript
class GDPRCompliance {
  // Data export for users
  static async exportUserData(userId: string, authToken: string): Promise<UserDataExport> {
    const response = await fetch(`/api/users/${userId}/export`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to export user data');
    }
    
    return response.json();
  }
  
  // Data deletion request
  static async requestDataDeletion(userId: string, authToken: string): Promise<void> {
    const response = await fetch(`/api/users/${userId}/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to request data deletion');
    }
  }
  
  // Consent management
  static async updateConsent(userId: string, consent: ConsentSettings, authToken: string): Promise<void> {
    const response = await fetch(`/api/users/${userId}/consent`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(consent)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update consent');
    }
  }
}

interface UserDataExport {
  user_profile: {
    id: number;
    email: string;
    name: string;
    created_at: string;
  };
  tasks: Task[];
  activity_logs: ActivityLog[];
  consent_settings: ConsentSettings;
}

interface ConsentSettings {
  analytics: boolean;
  marketing: boolean;
  data_processing: boolean;
  last_updated: string;
}
```

### Data Retention Policy

```typescript
class DataRetentionManager {
  private retentionPeriods = {
    user_data: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years in milliseconds
    activity_logs: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
    security_logs: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
    task_data: 1 * 365 * 24 * 60 * 60 * 1000, // 1 year
  };
  
  async cleanupExpiredData(): Promise<CleanupResult> {
    const results: CleanupResult = {
      deleted_users: 0,
      deleted_tasks: 0,
      deleted_logs: 0,
      errors: []
    };
    
    try {
      // Cleanup expired user data
      results.deleted_users = await this.cleanupExpiredUsers();
      
      // Cleanup expired task data
      results.deleted_tasks = await this.cleanupExpiredTasks();
      
      // Cleanup expired logs
      results.deleted_logs = await this.cleanupExpiredLogs();
      
    } catch (error) {
      results.errors.push(error.message);
    }
    
    return results;
  }
  
  private async cleanupExpiredUsers(): Promise<number> {
    const cutoff = Date.now() - this.retentionPeriods.user_data;
    
    const response = await fetch('/api/admin/cleanup/expired-users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cutoff })
    });
    
    if (!response.ok) {
      throw new Error('Failed to cleanup expired users');
    }
    
    const result = await response.json();
    return result.deleted_count;
  }
  
  // Similar methods for other data types...
}

interface CleanupResult {
  deleted_users: number;
  deleted_tasks: number;
  deleted_logs: number;
  errors: string[];
}
```

## Security Checklist

### Development Checklist

- [ ] **Authentication**
  - [ ] JWT tokens expire after reasonable time
  - [ ] Refresh tokens are implemented and secure
  - [ ] Token storage is secure (HTTP-only cookies or encrypted storage)
  - [ ] Authentication errors don't leak sensitive information

- [ ] **Authorization**
  - [ ] All endpoints validate user permissions
  - [ ] Role-based access control is implemented
  - [ ] Resource ownership is verified

- [ ] **Input Validation**
  - [ ] All inputs are validated on both client and server
  - [ ] SQL injection prevention is implemented
  - [ ] XSS prevention is implemented
  - [ ] File upload security is enforced

- [ ] **Rate Limiting**
  - [ ] Rate limits are enforced per user/IP
  - [ ] Rate limit headers are included in responses
  - [ ] Exponential backoff is implemented

- [ ] **Data Protection**
  - [ ] Sensitive data is encrypted at rest
  - [ ] Data transmission is encrypted (HTTPS only)
  - [ ] Personal data is handled according to GDPR
  - [ ] Data retention policies are implemented

- [ ] **Security Headers**
  - [ ] CSP headers are configured
  - [ ] HSTS is enabled
  - [ ] X-Frame-Options is set
  - [ ] X-Content-Type-Options is set

- [ ] **Monitoring**
  - [ ] Security events are logged
  - [ ] Suspicious activity is detected
  - [ ] Audit trails are maintained
  - [ ] Security incidents are reported

### Production Checklist

- [ ] **Environment Security**
  - [ ] Environment variables are secure
  - [ ] API keys are rotated regularly
  - [ ] Database connections are encrypted
  - [ ] HTTPS is enforced

- [ ] **Infrastructure**
  - [ ] Firewall rules are configured
  - [ ] DDoS protection is enabled
  - [ ] Load balancers are configured
  - [ ] Backup and disaster recovery plans exist

- [ ] **Monitoring & Alerting**
  - [ ] Security monitoring is active
  - [ ] Alerting is configured for security events
  - [ ] Log aggregation is implemented
  - [ ] Incident response procedures are documented

- [ ] **Compliance**
  - [ ] GDPR requirements are met
  - [ ] Data processing agreements are in place
  - [ ] Privacy policy is published
  - [ ] Data retention policies are enforced

This comprehensive security documentation ensures that your integration with the Crazy-Gary API follows industry best practices and maintains the highest security standards.