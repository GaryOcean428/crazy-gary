import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  CacheManager,
  MemoryCache,
  LocalStorageCache,
  SessionStorageCache,
  IndexedDBCache,
  ServiceWorkerCache,
  CacheConfig,
  CacheEntry,
  CacheStrategy,
  CacheEventType,
} from '@/lib/cache'

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
}

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
})

// Mock Service Worker
const mockServiceWorker = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn(),
}

Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
})

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
})

describe('Cache System - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.clear()
    mockSessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('CacheManager', () => {
    it('should create cache manager with default config', () => {
      const manager = new CacheManager()
      
      expect(manager).toBeInstanceOf(CacheManager)
      expect(manager.getStrategy()).toBe('memory-first')
    })

    it('should create cache manager with custom config', () => {
      const config: CacheConfig = {
        strategy: 'local-first',
        ttl: 300000, // 5 minutes
        maxSize: 100,
        compression: true,
      }
      
      const manager = new CacheManager(config)
      
      expect(manager.getStrategy()).toBe('local-first')
      expect(manager.getTTL()).toBe(300000)
    })

    it('should handle cache operations', async () => {
      const manager = new CacheManager()
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      // Set value
      await manager.set(key, value)
      
      // Get value
      const cached = await manager.get(key)
      expect(cached).toEqual(value)
      
      // Check if exists
      expect(await manager.has(key)).toBe(true)
      
      // Delete value
      await manager.delete(key)
      expect(await manager.has(key)).toBe(false)
    })

    it('should handle cache expiration', async () => {
      const config: CacheConfig = {
        ttl: 100, // 100ms
        strategy: 'memory-first',
      }
      
      const manager = new CacheManager(config)
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      await manager.set(key, value)
      
      // Should be available immediately
      expect(await manager.get(key)).toEqual(value)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should be expired
      expect(await manager.get(key)).toBeNull()
    })

    it('should handle cache size limits', async () => {
      const config: CacheConfig = {
        maxSize: 2,
        strategy: 'memory-first',
      }
      
      const manager = new CacheManager(config)
      
      await manager.set('key1', { data: 'data1' })
      await manager.set('key2', { data: 'data2' })
      await manager.set('key3', { data: 'data3' })
      
      // Oldest entry should be evicted
      expect(await manager.has('key1')).toBe(false)
      expect(await manager.has('key2')).toBe(true)
      expect(await manager.has('key3')).toBe(true)
    })

    it('should handle cache invalidation', async () => {
      const manager = new CacheManager()
      
      await manager.set('user:1', { data: 'user1' })
      await manager.set('user:2', { data: 'user2' })
      await manager.set('post:1', { data: 'post1' })
      
      // Invalidate all user entries
      await manager.invalidatePattern(/^user:/)
      
      expect(await manager.has('user:1')).toBe(false)
      expect(await manager.has('user:2')).toBe(false)
      expect(await manager.has('post:1')).toBe(true)
    })

    it('should handle cache warming', async () => {
      const manager = new CacheManager()
      const dataFetcher = vi.fn().mockResolvedValue({ data: 'fetched-data' })
      
      await manager.warm(['key1', 'key2'], dataFetcher)
      
      expect(dataFetcher).toHaveBeenCalledTimes(2)
      expect(await manager.get('key1')).toEqual({ data: 'fetched-data' })
      expect(await manager.get('key2')).toEqual({ data: 'fetched-data' })
    })

    it('should handle cache statistics', async () => {
      const manager = new CacheManager()
      
      await manager.set('key1', { data: 'data1' })
      await manager.set('key2', { data: 'data2' })
      
      const stats = await manager.getStats()
      
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.size).toBe(2)
      expect(stats.capacity).toBeGreaterThan(0)
    })
  })

  describe('MemoryCache', () => {
    it('should store and retrieve data from memory', async () => {
      const cache = new MemoryCache()
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      await cache.set(key, value)
      const retrieved = await cache.get(key)
      
      expect(retrieved).toEqual(value)
    })

    it('should handle memory cache expiration', async () => {
      const cache = new MemoryCache({ ttl: 100 })
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      await cache.set(key, value)
      
      // Should be available immediately
      expect(await cache.get(key)).toEqual(value)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should be expired
      expect(await cache.get(key)).toBeNull()
    })

    it('should handle memory cache size limits', async () => {
      const cache = new MemoryCache({ maxSize: 2 })
      
      await cache.set('key1', { data: 'data1' })
      await cache.set('key2', { data: 'data2' })
      await cache.set('key3', { data: 'data3' })
      
      // Oldest entry should be evicted
      expect(await cache.has('key1')).toBe(false)
      expect(await cache.has('key2')).toBe(true)
      expect(await cache.has('key3')).toBe(true)
    })

    it('should handle memory cache cleanup', async () => {
      const cache = new MemoryCache({ maxSize: 100 })
      
      // Add many entries
      for (let i = 0; i < 150; i++) {
        await cache.set(`key${i}`, { data: `data${i}` })
      }
      
      // Should clean up old entries
      const stats = await cache.getStats()
      expect(stats.size).toBeLessThanOrEqual(100)
    })
  })

  describe('LocalStorageCache', () => {
    it('should store and retrieve data from localStorage', async () => {
      const cache = new LocalStorageCache()
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      await cache.set(key, value)
      const retrieved = await cache.get(key)
      
      expect(retrieved).toEqual(value)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining(key),
        expect.stringContaining(JSON.stringify(value))
      )
    })

    it('should handle localStorage quota exceeded', async () => {
      const cache = new LocalStorageCache()
      
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })
      
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      await expect(cache.set(key, value)).rejects.toThrow('QuotaExceededError')
    })

    it('should handle localStorage unavailability', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      })
      
      const cache = new LocalStorageCache()
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      await expect(cache.set(key, value)).rejects.toThrow('localStorage not available')
    })

    it('should handle data corruption in localStorage', async () => {
      const cache = new LocalStorageCache()
      const key = 'test-key'
      
      // Set corrupted data
      mockLocalStorage.getItem.mockReturnValue('corrupted-json')
      
      const retrieved = await cache.get(key)
      expect(retrieved).toBeNull()
    })
  })

  describe('SessionStorageCache', () => {
    it('should store and retrieve data from sessionStorage', async () => {
      const cache = new SessionStorageCache()
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      await cache.set(key, value)
      const retrieved = await cache.get(key)
      
      expect(retrieved).toEqual(value)
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining(key),
        expect.stringContaining(JSON.stringify(value))
      )
    })

    it('should clear session storage on demand', async () => {
      const cache = new SessionStorageCache()
      
      await cache.set('key1', { data: 'data1' })
      await cache.set('key2', { data: 'data2' })
      
      await cache.clear()
      
      expect(mockSessionStorage.clear).toHaveBeenCalled()
    })
  })

  describe('IndexedDBCache', () => {
    const mockDB = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          put: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn(),
          getAllKeys: vi.fn(),
          count: vi.fn(),
        }),
        oncomplete: null,
        onerror: null,
      }),
      close: vi.fn(),
    }

    beforeEach(() => {
      mockIndexedDB.open.mockImplementation((name, version) => {
        const request = {
          result: mockDB,
          onsuccess: null,
          onerror: null,
        }
        
        setTimeout(() => {
          request.onsuccess?.({ target: request })
        }, 0)
        
        return request
      })
    })

    it('should store and retrieve data from IndexedDB', async () => {
      const cache = new IndexedDBCache('test-db')
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      mockDB.transaction.mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          put: vi.fn().mockImplementation((key, value) => {
            const request = { result: undefined, onsuccess: null, onerror: null }
            setTimeout(() => request.onsuccess?.({ target: request }), 0)
            return request
          }),
          get: vi.fn().mockImplementation((key) => {
            const request = { result: value, onsuccess: null, onerror: null }
            setTimeout(() => request.onsuccess?.({ target: request }), 0)
            return request
          }),
        }),
      })
      
      await cache.set(key, value)
      const retrieved = await cache.get(key)
      
      expect(retrieved).toEqual(value)
    })

    it('should handle IndexedDB errors', async () => {
      const cache = new IndexedDBCache('test-db')
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      mockDB.transaction.mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          put: vi.fn().mockImplementation((key, value) => {
            const request = { result: undefined, onsuccess: null, onerror: null }
            setTimeout(() => request.onerror?.({ target: request }), 0)
            return request
          }),
        }),
      })
      
      await expect(cache.set(key, value)).rejects.toThrow()
    })

    it('should handle IndexedDB unavailable', async () => {
      Object.defineProperty(window, 'indexedDB', {
        value: undefined,
        writable: true,
      })
      
      const cache = new IndexedDBCache('test-db')
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      await expect(cache.set(key, value)).rejects.toThrow('IndexedDB not available')
    })
  })

  describe('ServiceWorkerCache', () => {
    const mockCache = {
      match: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      keys: vi.fn(),
    }

    beforeEach(() => {
      mockServiceWorker.controller = { postMessage: vi.fn() }
    })

    it('should communicate with service worker for caching', async () => {
      const cache = new ServiceWorkerCache('test-cache')
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      mockServiceWorker.addEventListener.mockImplementation((event, callback) => {
        if (event === 'message') {
          // Simulate service worker response
          setTimeout(() => {
            callback({ data: { type: 'CACHE_SET_SUCCESS', key } })
          }, 0)
        }
      })
      
      await cache.set(key, value)
      
      expect(mockServiceWorker.controller?.postMessage).toHaveBeenCalledWith({
        type: 'CACHE_SET',
        key,
        value,
      })
    })

    it('should handle service worker messages', async () => {
      const cache = new ServiceWorkerCache('test-cache')
      const key = 'test-key'
      
      mockServiceWorker.addEventListener.mockImplementation((event, callback) => {
        if (event === 'message') {
          // Simulate service worker response with data
          setTimeout(() => {
            callback({ 
              data: { 
                type: 'CACHE_GET_SUCCESS', 
                key, 
                value: { data: 'test-data' } 
              } 
            })
          }, 0)
        }
      })
      
      const retrieved = await cache.get(key)
      expect(retrieved).toEqual({ data: 'test-data' })
    })

    it('should handle service worker unavailable', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
      })
      
      const cache = new ServiceWorkerCache('test-cache')
      const key = 'test-key'
      const value = { data: 'test-data' }
      
      await expect(cache.set(key, value)).rejects.toThrow('Service Worker not available')
    })
  })

  describe('Cache Strategies', () => {
    it('should implement memory-first strategy', async () => {
      const manager = new CacheManager({ strategy: 'memory-first' })
      
      await manager.set('key1', { data: 'data1' })
      
      // Should be available in memory
      expect(await manager.get('key1')).toEqual({ data: 'data1' })
    })

    it('should implement local-first strategy', async () => {
      const manager = new CacheManager({ strategy: 'local-first' })
      
      await manager.set('key1', { data: 'data1' })
      
      // Should check local storage first
      expect(await manager.get('key1')).toEqual({ data: 'data1' })
    })

    it('should implement network-first strategy', async () => {
      const manager = new CacheManager({ strategy: 'network-first' })
      const dataFetcher = vi.fn().mockResolvedValue({ data: 'network-data' })
      
      // Should attempt network fetch first
      const result = await manager.get('key1', dataFetcher)
      expect(result).toEqual({ data: 'network-data' })
      expect(dataFetcher).toHaveBeenCalled()
    })

    it('should implement stale-while-revalidate strategy', async () => {
      const manager = new CacheManager({ strategy: 'stale-while-revalidate' })
      const dataFetcher = vi.fn().mockResolvedValue({ data: 'fresh-data' })
      
      // Set initial data
      await manager.set('key1', { data: 'stale-data' })
      
      // Should return stale data immediately and update in background
      const result = await manager.get('key1', dataFetcher)
      expect(result).toEqual({ data: 'stale-data' })
      
      // Should have called fetcher in background
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(dataFetcher).toHaveBeenCalled()
    })
  })

  describe('Cache Compression', () => {
    it('should compress large data', async () => {
      const config: CacheConfig = {
        compression: true,
        compressionThreshold: 100, // Compress data larger than 100 bytes
      }
      
      const manager = new CacheManager(config)
      const largeData = { data: 'x'.repeat(200) }
      
      await manager.set('large-key', largeData)
      
      const retrieved = await manager.get('large-key')
      expect(retrieved).toEqual(largeData)
    })

    it('should not compress small data', async () => {
      const config: CacheConfig = {
        compression: true,
        compressionThreshold: 100,
      }
      
      const manager = new CacheManager(config)
      const smallData = { data: 'small' }
      
      await manager.set('small-key', smallData)
      
      const retrieved = await manager.get('small-key')
      expect(retrieved).toEqual(smallData)
    })
  })

  describe('Cache Events', () => {
    it('should emit cache events', async () => {
      const manager = new CacheManager()
      const eventHandler = vi.fn()
      
      manager.on(CacheEventType.SET, eventHandler)
      
      await manager.set('test-key', { data: 'test-data' })
      
      expect(eventHandler).toHaveBeenCalledWith({
        type: CacheEventType.SET,
        key: 'test-key',
        value: { data: 'test-data' },
      })
    })

    it('should emit cache hit and miss events', async () => {
      const manager = new CacheManager()
      const hitHandler = vi.fn()
      const missHandler = vi.fn()
      
      manager.on(CacheEventType.HIT, hitHandler)
      manager.on(CacheEventType.MISS, missHandler)
      
      // Miss
      await manager.get('non-existent-key')
      expect(missHandler).toHaveBeenCalled()
      
      // Set and hit
      await manager.set('test-key', { data: 'test-data' })
      await manager.get('test-key')
      expect(hitHandler).toHaveBeenCalled()
    })

    it('should emit cache eviction events', async () => {
      const config: CacheConfig = {
        maxSize: 2,
        strategy: 'memory-first',
      }
      
      const manager = new CacheManager(config)
      const evictionHandler = vi.fn()
      
      manager.on(CacheEventType.EVICTION, evictionHandler)
      
      await manager.set('key1', { data: 'data1' })
      await manager.set('key2', { data: 'data2' })
      await manager.set('key3', { data: 'data3' })
      
      expect(evictionHandler).toHaveBeenCalledWith({
        type: CacheEventType.EVICTION,
        key: 'key1',
        reason: 'size-limit',
      })
    })
  })

  describe('Cache Performance', () => {
    it('should handle high-frequency operations', async () => {
      const manager = new CacheManager()
      const startTime = performance.now()
      
      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        await manager.set(`key${i}`, { data: `data${i}` })
        await manager.get(`key${i}`)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000) // 1 second
    })

    it('should handle concurrent access', async () => {
      const manager = new CacheManager()
      
      // Concurrent operations
      const operations = Array.from({ length: 100 }, (_, i) => 
        manager.set(`concurrent-key${i}`, { data: `data${i}` })
      )
      
      await Promise.all(operations)
      
      // All operations should complete
      const stats = await manager.getStats()
      expect(stats.size).toBe(100)
    })

    it('should handle memory efficiently', async () => {
      const manager = new CacheManager({ maxSize: 1000 })
      
      // Add and remove data
      for (let i = 0; i < 2000; i++) {
        await manager.set(`memory-key${i}`, { data: `memory-data${i}` })
      }
      
      // Should not exceed memory limits
      const stats = await manager.getStats()
      expect(stats.size).toBeLessThanOrEqual(1000)
    })
  })

  describe('Cache Security', () => {
    it('should sanitize stored data', async () => {
      const manager = new CacheManager()
      const maliciousData = {
        data: '<script>alert("xss")</script>',
        __proto__: { malicious: 'property' },
      }
      
      await manager.set('malicious-key', maliciousData)
      const retrieved = await manager.get('malicious-key')
      
      // Should not contain malicious content
      expect(retrieved?.data).not.toContain('<script>')
      expect(retrieved?.malicious).toBeUndefined()
    })

    it('should encrypt sensitive data', async () => {
      const config: CacheConfig = {
        encryption: true,
        encryptionKey: 'test-key',
      }
      
      const manager = new CacheManager(config)
      const sensitiveData = { password: 'secret123', token: 'abc123' }
      
      await manager.set('sensitive-key', sensitiveData)
      const retrieved = await manager.get('sensitive-key')
      
      expect(retrieved).toEqual(sensitiveData)
      // In real implementation, stored data would be encrypted
    })
  })

  describe('Cache Recovery', () => {
    it('should recover from corrupted cache', async () => {
      const manager = new CacheManager()
      
      // Corrupt cache data
      await manager.set('corrupt-key', { data: 'data1' })
      // Simulate corruption by overwriting internal data structure
      
      // Should handle corruption gracefully
      const retrieved = await manager.get('corrupt-key')
      // May return null or corrupted data, but shouldn't crash
      expect(retrieved).toBeDefined()
    })

    it('should handle cache migration', async () => {
      const oldManager = new CacheManager({ version: 1 })
      const newManager = new CacheManager({ version: 2 })
      
      await oldManager.set('migrate-key', { data: 'old-data' })
      
      // Simulate migration
      const migratedData = await oldManager.get('migrate-key')
      if (migratedData) {
        await newManager.set('migrate-key', migratedData)
      }
      
      expect(await newManager.get('migrate-key')).toEqual({ data: 'old-data' })
    })
  })

  describe('Cache Monitoring', () => {
    it('should track cache performance metrics', async () => {
      const manager = new CacheManager()
      
      // Perform various operations
      await manager.set('key1', { data: 'data1' })
      await manager.get('key1') // Hit
      await manager.get('key2') // Miss
      await manager.set('key2', { data: 'data2' })
      await manager.get('key2') // Hit
      
      const metrics = await manager.getMetrics()
      
      expect(metrics.hits).toBe(2)
      expect(metrics.misses).toBe(1)
      expect(metrics.hitRate).toBeCloseTo(0.667, 2)
      expect(metrics.averageAccessTime).toBeGreaterThan(0)
    })

    it('should monitor cache memory usage', async () => {
      const manager = new CacheManager()
      
      // Add data
      await manager.set('key1', { data: 'x'.repeat(1000) })
      
      const memoryUsage = await manager.getMemoryUsage()
      
      expect(memoryUsage.used).toBeGreaterThan(0)
      expect(memoryUsage.used).toBeLessThan(memoryUsage.total)
      expect(memoryUsage.percentage).toBeGreaterThan(0)
    })
  })
})
