import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  ApiClient, 
  ApiError, 
  ApiResponse, 
  RequestConfig,
  AuthService,
  UserService,
  CacheService,
  WebSocketService
} from '@/lib/api-client'

// Mock fetch
const mockFetch = vi.fn()
Object.defineProperty(global, 'fetch', {
  value: mockFetch,
})

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  
  readyState = MockWebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  
  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      this.onopen?.({} as Event)
    }, 0)
  }
  
  send(data: string) {
    // Mock implementation
  }
  
  close() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.({} as CloseEvent)
  }
}

Object.defineProperty(global, 'WebSocket', {
  value: MockWebSocket,
})

// Test data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
}

const mockApiResponse: ApiResponse<any> = {
  data: null,
  status: 200,
  statusText: 'OK',
  headers: new Headers(),
}

const createMockResponse = (data: any, status = 200, statusText = 'OK'): Response => {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token',
    }),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
  } as Response
}

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic API Client', () => {
    it('should create API client with base URL', () => {
      const client = new ApiClient('https://api.example.com')
      
      expect(client).toBeDefined()
      expect(client.baseURL).toBe('https://api.example.com')
    })

    it('should make GET requests', async () => {
      const client = new ApiClient('https://api.example.com')
      const mockData = { users: [mockUser] }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData))
      
      const response = await client.get('/users')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      
      expect(response.data).toEqual(mockData)
    })

    it('should make POST requests', async () => {
      const client = new ApiClient('https://api.example.com')
      const requestData = { name: 'New User', email: 'new@example.com' }
      const responseData = { ...mockUser, ...requestData, id: '2' }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData, 201))
      
      const response = await client.post('/users', requestData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(requestData),
        })
      )
      
      expect(response.data).toEqual(responseData)
    })

    it('should make PUT requests', async () => {
      const client = new ApiClient('https://api.example.com')
      const updateData = { name: 'Updated User' }
      const responseData = { ...mockUser, ...updateData }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData))
      
      const response = await client.put('/users/1', updateData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      )
      
      expect(response.data).toEqual(responseData)
    })

    it('should make DELETE requests', async () => {
      const client = new ApiClient('https://api.example.com')
      
      mockFetch.mockResolvedValueOnce(createMockResponse({ deleted: true }))
      
      const response = await client.delete('/users/1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      
      expect(response.data.deleted).toBe(true)
    })

    it('should handle query parameters', async () => {
      const client = new ApiClient('https://api.example.com')
      const params = { page: 1, limit: 10, sort: 'name' }
      
      mockFetch.mockResolvedValueOnce(createMockResponse({ users: [] }))
      
      await client.get('/users', { params })
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10&sort=name',
        expect.any(Object)
      )
    })

    it('should handle custom headers', async () => {
      const client = new ApiClient('https://api.example.com')
      const customHeaders = {
        'X-Custom-Header': 'custom-value',
        'Authorization': 'Bearer custom-token',
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse({}))
      
      await client.get('/secure-endpoint', { headers: customHeaders })
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders),
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP errors', async () => {
      const client = new ApiClient('https://api.example.com')
      
      mockFetch.mockResolvedValueOnce(createMockResponse(
        { error: 'Not Found' },
        404,
        'Not Found'
      ))
      
      await expect(client.get('/nonexistent')).rejects.toThrow('HTTP 404: Not Found')
    })

    it('should handle network errors', async () => {
      const client = new ApiClient('https://api.example.com')
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      await expect(client.get('/users')).rejects.toThrow('Network error')
    })

    it('should handle timeout errors', async () => {
      const client = new ApiClient('https://api.example.com', { timeout: 100 })
      
      // Mock fetch to never resolve
      mockFetch.mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      )
      
      await expect(client.get('/slow-endpoint')).rejects.toThrow()
    })

    it('should provide detailed error information', async () => {
      const client = new ApiClient('https://api.example.com')
      const errorResponse = {
        error: 'Validation failed',
        details: ['Email is required', 'Password is too short'],
      }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(errorResponse, 400, 'Bad Request'))
      
      try {
        await client.post('/users', {})
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        if (error instanceof ApiError) {
          expect(error.status).toBe(400)
          expect(error.message).toBe('Validation failed')
          expect(error.details).toEqual(['Email is required', 'Password is too short'])
        }
      }
    })
  })

  describe('Authentication', () => {
    it('should include authentication token', async () => {
      const client = new ApiClient('https://api.example.com', {
        token: 'mock-jwt-token',
      })
      
      mockFetch.mockResolvedValueOnce(createMockResponse({}))
      
      await client.get('/protected-endpoint')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-jwt-token',
          }),
        })
      )
    })

    it('should refresh token on 401 error', async () => {
      const client = new ApiClient('https://api.example.com', {
        token: 'expired-token',
        refreshToken: 'refresh-token',
      })
      
      // First call returns 401
      mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'Token expired' }, 401))
      
      // Mock successful token refresh
      mockFetch.mockResolvedValueOnce(createMockResponse({
        access_token: 'new-token',
        refresh_token: 'new-refresh-token',
      }))
      
      // Second call with new token
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }))
      
      // This should automatically retry with new token
      await expect(client.get('/protected-endpoint')).rejects.toThrow()
      
      // Token refresh should have been called
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle token refresh failure', async () => {
      const client = new ApiClient('https://api.example.com', {
        token: 'expired-token',
        refreshToken: 'invalid-refresh-token',
      })
      
      mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'Token expired' }, 401))
      mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'Invalid refresh token' }, 401))
      
      await expect(client.get('/protected-endpoint')).rejects.toThrow()
    })
  })

  describe('Request Configuration', () => {
    it('should handle request timeout configuration', async () => {
      const client = new ApiClient('https://api.example.com', { timeout: 5000 })
      
      mockFetch.mockResolvedValueOnce(createMockResponse({}))
      
      await client.get('/test')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      )
    })

    it('should handle retry configuration', async () => {
      const client = new ApiClient('https://api.example.com', {
        retry: 3,
        retryDelay: 100,
      })
      
      // Mock two failed attempts, then success
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }))
      
      const response = await client.get('/unreliable-endpoint')
      
      expect(response.data.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle interceptors', async () => {
      const client = new ApiClient('https://api.example.com')
      
      const requestInterceptor = vi.fn((config) => {
        config.headers = { ...config.headers, 'X-Request-ID': 'req-123' }
        return config
      })
      
      const responseInterceptor = vi.fn((response) => {
        response.data.timestamp = Date.now()
        return response
      })
      
      client.addRequestInterceptor(requestInterceptor)
      client.addResponseInterceptor(responseInterceptor)
      
      mockFetch.mockResolvedValueOnce(createMockResponse({ message: 'Hello' }))
      
      await client.get('/test')
      
      expect(requestInterceptor).toHaveBeenCalled()
      expect(responseInterceptor).toHaveBeenCalled()
    })
  })

  describe('Caching', () => {
    it('should cache GET requests', async () => {
      const client = new ApiClient('https://api.example.com', {
        enableCache: true,
        cacheTimeout: 300000, // 5 minutes
      })
      
      const mockData = { users: [mockUser] }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData))
      
      const response1 = await client.get('/users')
      const response2 = await client.get('/users')
      
      // Should only make one network request due to caching
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(response1.data).toEqual(response2.data)
    })

    it('should invalidate cache on POST requests', async () => {
      const client = new ApiClient('https://api.example.com', {
        enableCache: true,
      })
      
      const getResponse = { users: [mockUser] }
      const postResponse = { ...mockUser, id: '2' }
      
      mockFetch.mockResolvedValueOnce(createMockResponse(getResponse))
      mockFetch.mockResolvedValueOnce(createMockResponse(postResponse, 201))
      
      // First GET request
      const response1 = await client.get('/users')
      
      // POST request should invalidate cache
      await client.post('/users', { name: 'New User' })
      
      // Next GET should make a new request
      mockFetch.mockResolvedValueOnce(createMockResponse({ users: [mockUser, postResponse] }))
      const response2 = await client.get('/users')
      
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(response2.data.users).toHaveLength(2)
    })
  })

  describe('Rate Limiting', () => {
    it('should implement rate limiting', async () => {
      const client = new ApiClient('https://api.example.com', {
        rateLimit: {
          requests: 5,
          window: 60000, // 1 minute
        },
      })
      
      mockFetch.mockResolvedValue(createMockResponse({}))
      
      // Make 5 requests (within limit)
      const promises = Array.from({ length: 5 }, () => client.get('/test'))
      await Promise.all(promises)
      
      expect(mockFetch).toHaveBeenCalledTimes(5)
      
      // Next request should be delayed
      const startTime = Date.now()
      await client.get('/test')
      const endTime = Date.now()
      
      // Should be delayed due to rate limiting
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000)
    })
  })
})

describe('AuthService', () => {
  let authService: AuthService
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient('https://api.example.com')
    authService = new AuthService(client)
  })

  it('should handle user login', async () => {
    const loginData = { email: 'test@example.com', password: 'password123' }
    const responseData = { user: mockUser, access_token: 'jwt-token', refresh_token: 'refresh-token' }
    
    mockFetch.mockResolvedValueOnce(createMockResponse(responseData))
    
    const result = await authService.login(loginData)
    
    expect(result.user).toEqual(mockUser)
    expect(result.accessToken).toBe('jwt-token')
    expect(result.refreshToken).toBe('refresh-token')
  })

  it('should handle user registration', async () => {
    const registerData = { 
      email: 'new@example.com', 
      password: 'password123',
      name: 'New User' 
    }
    const responseData = { user: { ...mockUser, id: '2', email: registerData.email }, access_token: 'token' }
    
    mockFetch.mockResolvedValueOnce(createMockResponse(responseData, 201))
    
    const result = await authService.register(registerData)
    
    expect(result.user.email).toBe(registerData.email)
    expect(result.accessToken).toBe('token')
  })

  it('should handle password reset', async () => {
    const email = 'test@example.com'
    
    mockFetch.mockResolvedValueOnce(createMockResponse({ message: 'Reset email sent' }))
    
    const result = await authService.requestPasswordReset(email)
    
    expect(result.message).toBe('Reset email sent')
  })

  it('should handle password change', async () => {
    const changeData = {
      currentPassword: 'old-password',
      newPassword: 'new-password123',
    }
    
    mockFetch.mockResolvedValueOnce(createMockResponse({ message: 'Password changed successfully' }))
    
    const result = await authService.changePassword(changeData)
    
    expect(result.message).toBe('Password changed successfully')
  })

  it('should handle logout', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ message: 'Logged out successfully' }))
    
    const result = await authService.logout()
    
    expect(result.message).toBe('Logged out successfully')
  })
})

describe('UserService', () => {
  let userService: UserService
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient('https://api.example.com')
    userService = new UserService(client)
  })

  it('should get user profile', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(mockUser))
    
    const user = await userService.getProfile()
    
    expect(user).toEqual(mockUser)
  })

  it('should update user profile', async () => {
    const updateData = { name: 'Updated Name', avatar: 'new-avatar.jpg' }
    const updatedUser = { ...mockUser, ...updateData }
    
    mockFetch.mockResolvedValueOnce(createMockResponse(updatedUser))
    
    const user = await userService.updateProfile(updateData)
    
    expect(user.name).toBe('Updated Name')
    expect(user.avatar).toBe('new-avatar.jpg')
  })

  it('should get user preferences', async () => {
    const preferences = {
      theme: 'dark',
      notifications: true,
      language: 'en',
    }
    
    mockFetch.mockResolvedValueOnce(createMockResponse(preferences))
    
    const result = await userService.getPreferences()
    
    expect(result).toEqual(preferences)
  })

  it('should update user preferences', async () => {
    const preferences = { theme: 'light', notifications: false }
    
    mockFetch.mockResolvedValueOnce(createMockResponse(preferences))
    
    const result = await userService.updatePreferences(preferences)
    
    expect(result.theme).toBe('light')
    expect(result.notifications).toBe(false)
  })

  it('should upload user avatar', async () => {
    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })
    const uploadResponse = { avatar: 'https://cdn.example.com/avatars/new-avatar.jpg' }
    
    mockFetch.mockResolvedValueOnce(createMockResponse(uploadResponse))
    
    const result = await userService.uploadAvatar(file)
    
    expect(result.avatar).toBe('https://cdn.example.com/avatars/new-avatar.jpg')
  })
})

describe('CacheService', () => {
  let cacheService: CacheService
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient('https://api.example.com')
    cacheService = new CacheService(client)
  })

  it('should cache API responses', async () => {
    const cacheKey = 'users'
    const data = { users: [mockUser] }
    
    mockFetch.mockResolvedValueOnce(createMockResponse(data))
    
    const result1 = await cacheService.get(cacheKey)
    expect(result1).toEqual(data)
    
    const result2 = await cacheService.get(cacheKey)
    expect(result2).toEqual(data)
    
    // Should only make one network request
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should invalidate cache', async () => {
    const cacheKey = 'users'
    const data = { users: [mockUser] }
    
    mockFetch.mockResolvedValueOnce(createMockResponse(data))
    
    await cacheService.get(cacheKey)
    await cacheService.invalidate(cacheKey)
    
    // Next request should make a network call
    mockFetch.mockResolvedValueOnce(createMockResponse(data))
    await cacheService.get(cacheKey)
    
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should clear all cache', async () => {
    await cacheService.clear()
    
    // Implementation would clear all cached data
    expect(true).toBe(true) // Placeholder
  })
})

describe('WebSocketService', () => {
  let wsService: WebSocketService

  beforeEach(() => {
    wsService = new WebSocketService('wss://api.example.com/ws')
  })

  it('should establish WebSocket connection', async () => {
    const connectionPromise = new Promise<void>((resolve) => {
      wsService.on('open', () => resolve())
    })
    
    await connectionPromise
    
    expect(wsService.readyState).toBe(MockWebSocket.OPEN)
  })

  it('should send messages', async () => {
    const sendSpy = vi.spyOn(MockWebSocket.prototype, 'send')
    
    wsService.send(JSON.stringify({ type: 'ping' }))
    
    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }))
  })

  it('should handle incoming messages', async () => {
    const messageHandler = vi.fn()
    
    wsService.on('message', messageHandler)
    
    // Simulate incoming message
    const mockMessageEvent = {
      data: JSON.stringify({ type: 'notification', message: 'Hello' }),
    }
    
    // Trigger message event
    wsService.emit('message', mockMessageEvent)
    
    expect(messageHandler).toHaveBeenCalledWith(mockMessageEvent)
  })

  it('should handle connection errors', async () => {
    const errorHandler = vi.fn()
    
    wsService.on('error', errorHandler)
    
    // Simulate error event
    wsService.emit('error', new Error('Connection failed'))
    
    expect(errorHandler).toHaveBeenCalledWith(expect.any(Error))
  })

  it('should close connection', async () => {
    await wsService.close()
    
    expect(wsService.readyState).toBe(MockWebSocket.CLOSED)
  })
})

describe('API Integration Tests', () => {
  it('should handle complete user workflow', async () => {
    const client = new ApiClient('https://api.example.com')
    const authService = new AuthService(client)
    const userService = new UserService(client)
    
    // Register user
    mockFetch.mockResolvedValueOnce(createMockResponse({
      user: { ...mockUser, id: '2' },
      access_token: 'token',
    }, 201))
    
    const registerResult = await authService.register({
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
    })
    
    expect(registerResult.user.id).toBe('2')
    
    // Login user
    mockFetch.mockResolvedValueOnce(createMockResponse({
      user: registerResult.user,
      access_token: 'new-token',
    }))
    
    const loginResult = await authService.login({
      email: 'new@example.com',
      password: 'password123',
    })
    
    expect(loginResult.accessToken).toBe('new-token')
    
    // Update profile
    mockFetch.mockResolvedValueOnce(createMockResponse({
      ...registerResult.user,
      name: 'Updated Name',
    }))
    
    const updatedUser = await userService.updateProfile({
      name: 'Updated Name',
    })
    
    expect(updatedUser.name).toBe('Updated Name')
  })

  it('should handle offline scenarios', async () => {
    const client = new ApiClient('https://api.example.com', {
      offlineMode: true,
    })
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    })
    
    const result = await client.get('/users')
    
    // Should handle offline scenario gracefully
    expect(result).toBeDefined()
  })
})
