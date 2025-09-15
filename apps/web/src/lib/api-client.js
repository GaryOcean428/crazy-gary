/**
 * Centralized API client with error handling, retry logic, and caching
 * Follows best practices for React applications
 */

class APIError extends Error {
  constructor(message, status, response) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.response = response
  }
}

class APIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL
    this.requestInterceptors = []
    this.responseInterceptors = []
    this.cache = new Map()
    this.abortControllers = new Map()
  }

  // Add request interceptor (e.g., for auth tokens)
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor)
  }

  // Add response interceptor (e.g., for global error handling)
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor)
  }

  // Generate cache key from URL and options
  getCacheKey(url, options = {}) {
    return `${url}-${JSON.stringify(options)}`
  }

  // Retry logic with exponential backoff
  async retryRequest(fn, retries = 3, delay = 1000) {
    try {
      return await fn()
    } catch (error) {
      if (retries === 0 || error.status < 500) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.retryRequest(fn, retries - 1, delay * 2)
    }
  }

  // Cancel pending request
  cancelRequest(requestId) {
    const controller = this.abortControllers.get(requestId)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(requestId)
    }
  }

  // Main request method
  async request(url, options = {}) {
    const requestId = `${url}-${Date.now()}`
    const controller = new AbortController()
    this.abortControllers.set(requestId, controller)

    try {
      // Check cache for GET requests
      if (options.method === 'GET' || !options.method) {
        const cacheKey = this.getCacheKey(url, options)
        const cached = this.cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < (options.cacheTime || 300000)) {
          return cached.data
        }
      }

      // Apply request interceptors
      let finalOptions = { ...options, signal: controller.signal }
      for (const interceptor of this.requestInterceptors) {
        finalOptions = await interceptor(finalOptions)
      }

      // Set default headers
      finalOptions.headers = {
        'Content-Type': 'application/json',
        ...finalOptions.headers,
      }

      // Make request with retry logic
      const response = await this.retryRequest(async () => {
        const res = await fetch(`${this.baseURL}${url}`, finalOptions)
        
        if (!res.ok) {
          throw new APIError(
            `HTTP ${res.status}: ${res.statusText}`,
            res.status,
            res
          )
        }
        
        return res
      })

      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        data = await interceptor(data, response)
      }

      // Cache GET requests
      if (options.method === 'GET' || !options.method) {
        const cacheKey = this.getCacheKey(url, options)
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
      }

      return data
    } catch (error) {
      // Handle different types of errors
      if (error.name === 'AbortError') {
        throw new APIError('Request was cancelled', 0, null)
      }
      
      if (error instanceof APIError) {
        throw error
      }
      
      throw new APIError('Network error occurred', 0, null)
    } finally {
      this.abortControllers.delete(requestId)
    }
  }

  // Convenience methods
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' })
  }

  post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' })
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }

  // Cancel all pending requests
  cancelAllRequests() {
    for (const [_requestId, controller] of this.abortControllers) {
      controller.abort()
    }
    this.abortControllers.clear()
  }
}

// Create singleton instance
const apiClient = new APIClient('/api')

// Add auth token interceptor
apiClient.addRequestInterceptor(async (options) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return options
})

// Add global error handling interceptor
apiClient.addResponseInterceptor(async (data, response) => {
  if (response.status === 401) {
    // Handle unauthorized - redirect to login
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  }
  return data
})

// React hook for API calls
export const useAPI = () => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  
  const makeRequest = React.useCallback(async (requestFn) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await requestFn()
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { makeRequest, loading, error }
}

export { APIClient, APIError }
export default apiClient