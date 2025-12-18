/**
 * Security Configuration for Crazy-Gary Frontend
 * Frontend security settings and utilities
 */

// Security environment variables
export const SECURITY_CONFIG = {
  // Content Security Policy settings
  csp: {
    enabled: import.meta.env.PROD,
    directives: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "worker-src 'none'",
      "child-src 'none'",
      "manifest-src 'self'"
    ].join('; '),
    reportOnly: import.meta.env.DEV
  },

  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-Download-Options': 'noopen',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  },

  // API security
  api: {
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000,
    retries: 3,
    rateLimitDelay: 1000,
    securityHeaders: true
  },

  // Authentication security
  auth: {
    tokenStorage: 'localStorage', // 'localStorage' | 'sessionStorage' | 'memory'
    tokenPrefix: 'crazy-gary-',
    tokenRefreshThreshold: 300000, // 5 minutes before expiry
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
    requireMFA: false,
    sessionTimeout: 1800000 // 30 minutes
  },

  // Input validation
  validation: {
    maxInputLength: 10000,
    sanitizeHTML: true,
    enableXSSProtection: true,
    validateEmail: true,
    validateURLs: true,
    blockFileUploads: false,
    allowedFileTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv'
    ],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    dangerousFileExtensions: [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
      '.vbs', '.js', '.jar', '.php', '.asp', '.aspx'
    ]
  },

  // CSRF protection
  csrf: {
    enabled: true,
    tokenHeader: 'X-CSRF-Token',
    cookieName: 'csrf_token',
    autoRefresh: true
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Local storage security
  storage: {
    prefix: 'crazy-gary-',
    encryptSensitive: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    autoCleanup: true,
    retentionDays: 30
  },

  // Security monitoring
  monitoring: {
    enabled: import.meta.env.PROD,
    reportErrors: true,
    reportPerformance: true,
    reportSecurityEvents: true,
    reportURL: '/api/security/metrics',
    sampleRate: 0.1 // 10% of users
  }
}

// Security utilities
export class SecurityUtils {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHTML(html: string): string {
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate URL format
   */
  static isValidURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if string contains potentially dangerous content
   */
  static containsSuspiciousContent(text: string): boolean {
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<\s*iframe/gi,
      /<\s*object/gi,
      /<\s*embed/gi,
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /\.\.\//gi
    ]

    return suspiciousPatterns.some(pattern => pattern.test(text))
  }

  /**
   * Generate secure random token
   */
  static generateToken(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Hash string using SHA-256
   */
  static async hashString(text: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Encrypt data (simplified - use proper encryption in production)
   */
  static encrypt(data: string, key: string): string {
    // This is a simplified implementation
    // In production, use proper encryption libraries like CryptoJS
    const encoded = btoa(data + key)
    return encoded
  }

  /**
   * Decrypt data (simplified)
   */
  static decrypt(encryptedData: string, key: string): string {
    try {
      const decoded = atob(encryptedData)
      return decoded.replace(key, '')
    } catch {
      return ''
    }
  }

  /**
   * Check if running in secure context
   */
  static isSecureContext(): boolean {
    return window.isSecureContext
  }

  /**
   * Check if CSP is supported
   */
  static isCSPSupported(): boolean {
    return 'csp' in document || 'webkitCSP' in document
  }

  /**
   * Set security headers dynamically
   */
  static setSecurityHeaders(headers: Record<string, string>): void {
    // This would typically be set by the server
    // but we can use it for validation/testing
    console.log('Security headers configured:', headers)
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > SECURITY_CONFIG.validation.maxFileSize) {
      return { valid: false, error: 'File size exceeds maximum allowed size' }
    }

    // Check file type
    if (!SECURITY_CONFIG.validation.allowedFileTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' }
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (SECURITY_CONFIG.validation.dangerousFileExtensions.includes(extension)) {
      return { valid: false, error: 'File extension not allowed' }
    }

    return { valid: true }
  }
}

// Secure storage wrapper
export class SecureStorage {
  private prefix: string

  constructor(prefix: string = SECURITY_CONFIG.storage.prefix) {
    this.prefix = prefix
  }

  /**
   * Set item in secure storage
   */
  setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value)
      const prefixedKey = this.prefix + key

      if (SECURITY_CONFIG.storage.encryptSensitive) {
        const encrypted = SecurityUtils.encrypt(serialized, this.generateKey())
        localStorage.setItem(prefixedKey, encrypted)
      } else {
        localStorage.setItem(prefixedKey, serialized)
      }
    } catch (error) {
      console.error('Failed to store secure data:', error)
    }
  }

  /**
   * Get item from secure storage
   */
  getItem<T>(key: string): T | null {
    try {
      const prefixedKey = this.prefix + key
      const stored = localStorage.getItem(prefixedKey)

      if (!stored) return null

      if (SECURITY_CONFIG.storage.encryptSensitive) {
        const decrypted = SecurityUtils.decrypt(stored, this.generateKey())
        return JSON.parse(decrypted)
      } else {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to retrieve secure data:', error)
      return null
    }
  }

  /**
   * Remove item from secure storage
   */
  removeItem(key: string): void {
    const prefixedKey = this.prefix + key
    localStorage.removeItem(prefixedKey)
  }

  /**
   * Clear all items with prefix
   */
  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  /**
   * Generate encryption key
   */
  private generateKey(): string {
    // In production, use a proper key derivation function
    return 'crazy-gary-security-key'
  }
}

// Rate limiter for client-side requests
export class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }

    const requests = this.requests.get(identifier)!
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier)
  }
}

// CSRF token manager
export class CSRFManager {
  private token: string | null = null

  /**
   * Get CSRF token
   */
  async getToken(): Promise<string | null> {
    if (this.token) {
      return this.token
    }

    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        this.token = data.csrf_token
        return this.token
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
    }

    return null
  }

  /**
   * Add CSRF token to request headers
   */
  async addToHeaders(headers: Headers): Promise<Headers> {
    const token = await this.getToken()
    if (token) {
      headers.set(SECURITY_CONFIG.csrf.tokenHeader, token)
    }
    return headers
  }

  /**
   * Clear token
   */
  clearToken(): void {
    this.token = null
  }
}

// Initialize security features
export function initializeSecurity() {
  // Check security context
  if (!SecurityUtils.isSecureContext() && location.protocol === 'https:') {
    console.warn('Secure context required for full security features')
  }

  // Check CSP support
  if (!SecurityUtils.isCSPSupported()) {
    console.warn('Content Security Policy not supported')
  }

  // Initialize rate limiter
  if (SECURITY_CONFIG.rateLimit.enabled) {
    window.clientRateLimiter = new ClientRateLimiter(
      SECURITY_CONFIG.rateLimit.maxRequests,
      SECURITY_CONFIG.rateLimit.windowMs
    )
  }

  // Initialize CSRF manager
  if (SECURITY_CONFIG.csrf.enabled) {
    window.csrfManager = new CSRFManager()
  }

  // Set up security monitoring
  if (SECURITY_CONFIG.monitoring.enabled) {
    setupSecurityMonitoring()
  }

  console.log('🔒 Security features initialized')
}

// Security monitoring setup
function setupSecurityMonitoring() {
  // Monitor JavaScript errors
  window.addEventListener('error', (event) => {
    if (SECURITY_CONFIG.monitoring.reportErrors) {
      reportSecurityEvent('JS_ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    }
  })

  // Monitor unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (SECURITY_CONFIG.monitoring.reportErrors) {
      reportSecurityEvent('UNHANDLED_PROMISE_REJECTION', {
        reason: event.reason
      })
    }
  })

  // Monitor security violations
  if ('security' in window && 'onsecuritypolicyviolation' in window.security) {
    window.security.onsecuritypolicyviolation = (violation) => {
      reportSecurityEvent('CSP_VIOLATION', {
        blockedURI: violation.blockedURI,
        violatedDirective: violation.violatedDirective,
        originalPolicy: violation.originalPolicy
      })
    }
  }
}

// Report security events
async function reportSecurityEvent(type: string, details: any) {
  try {
    if (Math.random() > SECURITY_CONFIG.monitoring.sampleRate) {
      return // Sample the events
    }

    await fetch(SECURITY_CONFIG.monitoring.reportURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    })
  } catch (error) {
    console.error('Failed to report security event:', error)
  }
}

// Export global instances
export const secureStorage = new SecureStorage()
export const rateLimiter = new ClientRateLimiter()
export const csrfManager = new CSRFManager()

// Make available globally for debugging
declare global {
  interface Window {
    secureStorage: SecureStorage
    clientRateLimiter: ClientRateLimiter
    csrfManager: CSRFManager
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeSecurity()
}