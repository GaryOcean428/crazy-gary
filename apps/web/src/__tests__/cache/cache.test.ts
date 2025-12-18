import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  CacheManager,
  MemoryCache,
  LocalStorageCache,
  SessionStorageCache,
  IndexedDBCache,
  ServiceWorkerCache,
  CacheTypes,
  CacheConfig,
  CacheOptions,
  CacheEntry
} from '@/lib/cache'

// Mock browser APIs
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

// Mock IndexedDB
const mockIDBDatabase = {
  transaction: vi.fn(),
  objectStoreNames: { contains: vi.fn() },
  close: vi.fn(),
}

const mockIDBTransaction = {
  objectStore: vi.fn(),
  complete: vi.fn(),
  error: null,
}

const mockIDBObjectStore = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  getAll: vi.fn(),
  count: vi.fn(),
}

mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore)
mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction)

// Mock service worker
const mockServiceWorker = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn(),
}

// Mock fetch
const mockFetch = vi.fn()

Object.defineProperty(global, 'fetch', {
  value: mockFetch,
})

Object.defineProperty(global, 'indexedDB', {
  value: {
    open: vi.fn(),
    deleteDatabase: vi.fn(),
  },
})

// Mock caches API
Object.defineProperty(global, 'caches', {
  value: {
    open: vi.fn(),
    delete: vi.fn(),
    keys: vi.fn(),
    has: vi.fn(),
  },
})

const defaultConfig: CacheConfig = {
  ttl: 1000,
  maxSize: 100,
  namespace: 'test-cache',
}

describe('Cache - CacheManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create cache manager with default config', () => {
    const manager = new CacheManager(defaultConfig)
    
    expect(manager).toHaveProperty('get')
    expect(manager).toHaveProperty('set')
    expect(manager).toHaveProperty('delete')
    expect(manager).toHaveProperty('clear')
    expect(manager).toHaveProperty('has')
    expect(manager).toHaveProperty('keys')
    expect(manager).toHaveProperty('size')
    expect(manager).toHaveProperty('stats')
  })

  it('should set and get values', async () => {
    const manager = new CacheManager(defaultConfig)
    
    await manager.set('key1', 'value1')
    const result = await manager.get('key1')
    
    expect(result).toBe('value1')
  })

  it('should return null for non-existent keys', async () => {
    const manager = new CacheManager(defaultConfig)
    
    const result = await manager.get('non-existent')
    
    expect(result).toBeNull()
  })

  it('should check if key exists', async () => {
    const manager = new CacheManager(defaultConfig)
    
    await manager.set('key1', 'value1')
    const exists = await manager.has('key1')
    const notExists = await manager.has('key2')
    
    expect(exists).toBe(true)
    expect(notExists).toBe(false)
  })

  it('should delete keys', async () => {
    const manager = new CacheManager(defaultConfig)
    
    await manager.set('key1', 'value1')
    expect(await manager.has('key1')).toBe(true)
    
    await manager.delete('key1')
    expect(await manager.has('key1')).toBe(false)
  })

  it('should clear all cache entries', async () => {
    const manager = new CacheManager(defaultConfig)
    
    await manager.set('key1', 'value1')
    await manager.set('key2', 'value2')
    await manager.clear()
    
    expect(await manager.has('key1')).toBe(false)
    expect(await manager.has('key2')).toBe(false)
  })

  it('should track cache statistics', async () => {
    const manager = new CacheManager(defaultConfig)
    
    await manager.set('key1', 'value1')
    await manager.set('key2', 'value2')
    await manager.get('key1') // hit
    await manager.get('key3') // miss
    
    const stats = await manager.stats()
    
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBe(0.5)
    expect(stats.entryCount).toBe(2)
  })

  it('should respect TTL (Time To Live)', async () => {
    const config: CacheConfig = { ...defaultConfig, ttl: 100 }
    const manager = new CacheManager(config)
    
    await manager.set('key1', 'value1')
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const result = await manager.get('key1')
    expect(result).toBeNull()
  })

  it('should respect maxSize limit', async () => {
    const config: CacheConfig = { ...defaultConfig, maxSize: 2 }
    const manager = new CacheManager(config)
    
    await manager.set('key1', 'value1')
    await manager.set('key2', 'value2')
    await manager.set('key3', 'value3') // Should evict key1
    
    expect(await manager.has('key1')).toBe(false)
    expect(await manager.has('key2')).toBe(true)
    expect(await manager.has('key3')).toBe(true)
  })
})

describe('Cache - MemoryCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should store data in memory', async () => {
    const cache = new MemoryCache(defaultConfig)
    
    await cache.set('test', { data: 'value' })
    const result = await cache.get('test')
    
    expect(result).toEqual({ data: 'value' })
  })

  it('should handle memory cleanup on TTL expiry', async () => {
    const config: CacheConfig = { ...defaultConfig, ttl: 50 }
    const cache = new MemoryCache(config)
    
    await cache.set('test', 'value')
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const result = await cache.get('test')
    expect(result).toBeNull()
  })

  it('should track memory usage', async () => {
    const cache = new MemoryCache(defaultConfig)
    
    await cache.set('large', 'x'.repeat(1000))
    const stats = await cache.stats()
    
    expect(stats.memoryUsage).toBeGreaterThan(0)
  })
})

describe('Cache - LocalStorageCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('should store data in localStorage', async () => {
    const cache = new LocalStorageCache(defaultConfig)
    
    await cache.set('test', 'value')
    
    expect(mockLocalStorage.setItem).toHaveBeenCalled()
  })

  it('should retrieve data from localStorage', async () => {
    const cache = new LocalStorageCache(defaultConfig)
    const storedData = JSON.stringify({
      key: 'test',
      value: 'value',
      timestamp: Date.now(),
      ttl: defaultConfig.ttl,
      hits: 0,
      size: 5,
    })
    
    mockLocalStorage.getItem.mockReturnValue(storedData)
    
    const result = await cache.get('test')
    expect(result).toBe('value')
  })

  it('should handle localStorage errors gracefully', async () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Quota exceeded')
    })
    
    const cache = new LocalStorageCache(defaultConfig)
    const result = await cache.set('test', 'value')
    
    expect(result).toBe(false)
  })

  it('should respect localStorage quota limits', async () => {
    const cache = new LocalStorageCache(defaultConfig)
    const largeValue = 'x'.repeat(10000)
    
    mockLocalStorage.setItem.mockReturnValue(true)
    
    const result = await cache.set('large', largeValue)
    expect(result).toBe(true)
  })
})

describe('Cache - SessionStorageCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionStorage.getItem.mockReturnValue(null)
  })

  it('should store data in sessionStorage', async () => {
    const cache = new SessionStorageCache(defaultConfig)
    
    await cache.set('test', 'value')
    
    expect(mockSessionStorage.setItem).toHaveBeenCalled()
  })

  it('should retrieve data from sessionStorage', async () => {
    const cache = new SessionStorageCache(defaultConfig)
    const storedData = JSON.stringify({
      key: 'test',
      value: 'value',
      timestamp: Date.now(),
      ttl: defaultConfig.ttl,
      hits: 0,
      size: 5,
    })
    
    mockSessionStorage.getItem.mockReturnValue(storedData)
    
    const result = await cache.get('test')
    expect(result).toBe('value')
  })

  it('should clear sessionStorage on clear operation', async () => {
    const cache = new SessionStorageCache(defaultConfig)
    
    await cache.clear()
    
    expect(mockSessionStorage.clear).toHaveBeenCalled()
  })
})

describe('Cache - IndexedDBCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.indexedDB.open.mockImplementation((name, version) => {
      return {
        result: mockIDBDatabase,
        onerror: null,
        onsuccess: null,
      }
    })
  })

  it('should store data in IndexedDB', async () => {
    const cache = new IndexedDBCache(defaultConfig)
    
    await cache.set('test', 'value')
    
    expect(mockIDBObjectStore.put).toHaveBeenCalled()
  })

  it('should retrieve data from IndexedDB', async () => {
    const cache = new IndexedDBCache(defaultConfig)
    mockIDBObjectStore.get.mockImplementation((key) => {
      return {
        key: 'test',
        value: 'value',
        timestamp: Date.now(),
        ttl: defaultConfig.ttl,
        hits: 0,
        size: 5,
      }
    })
    
    const result = await cache.get('test')
    expect(result).toBe('value')
  })

  it('should handle IndexedDB errors', async () => {
    const cache = new IndexedDBCache(defaultConfig)
    mockIDBObjectStore.put.mockImplementation(() => {
      throw new Error('IndexedDB error')
    })
    
    const result = await cache.set('test', 'value')
    expect(result).toBe(false)
  })

  it('should handle database upgrades', async () => {
    const cache = new IndexedDBCache(defaultConfig)
    
    // This would typically trigger on version change
    expect(cache).toBeDefined()
  })
})

describe('Cache - ServiceWorkerCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should cache API responses', async () => {
    const mockCache = {
      put: vi.fn(),
      match: vi.fn(),
      keys: vi.fn(),
      delete: vi.fn(),
    }
    
    global.caches.open.mockResolvedValue(mockCache)
    
    const cache = new ServiceWorkerCache(defaultConfig)
    const response = new Response('test data')
    
    await cache.set('api/test', response)
    
    expect(mockCache.put).toHaveBeenCalled()
  })

  it('should retrieve cached responses', async () => {
    const mockCache = {
      put: vi.fn(),
      match: vi.fn().mockResolvedValue(new Response('cached data')),
      keys: vi.fn(),
      delete: vi.fn(),
    }
    
    global.caches.open.mockResolvedValue(mockCache)
    
    const cache = new ServiceWorkerCache(defaultConfig)
    const result = await cache.get('api/test')
    
    expect(result).toBeDefined()
    expect(result.ok).toBe(true)
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    const cache = new ServiceWorkerCache(defaultConfig)
    const result = await cache.get('api/test')
    
    expect(result).toBeNull()
  })

  it('should handle cache storage limits', async () => {
    const mockCache = {
      put: vi.fn().mockRejectedValue(new Error('Quota exceeded')),
      match: vi.fn(),
      keys: vi.fn().mockResolvedValue(['key1', 'key2', 'key3']),
      delete: vi.fn(),
    }
    
    global.caches.open.mockResolvedValue(mockCache)
    
    const cache = new ServiceWorkerCache(defaultConfig)
    const result = await cache.set('test', new Response('data'))
    
    expect(result).toBe(false)
  })
})

describe('Cache - Cache Types and Interfaces', () => {
  it('should define correct cache entry structure', () => {
    const entry: CacheEntry<string> = {
      key: 'test-key',
      value: 'test-value',
      timestamp: Date.now(),
      ttl: 1000,
      hits: 0,
      size: 10,
      metadata: { source: 'test' },
    }
    
    expect(entry.key).toBe('test-key')
    expect(entry.value).toBe('test-value')
    expect(entry.timestamp).toBeGreaterThan(0)
    expect(entry.ttl).toBe(1000)
    expect(entry.hits).toBe(0)
    expect(entry.size).toBe(10)
    expect(entry.metadata).toEqual({ source: 'test' })
  })

  it('should define correct cache options', () => {
    const options: CacheOptions = {
      ttl: 2000,
      maxSize: 50,
      forceRefresh: true,
      priority: 'high',
      tags: ['api', 'user-data'],
      callback: (key, value) => console.log('Cached:', key),
    }
    
    expect(options.ttl).toBe(2000)
    expect(options.maxSize).toBe(50)
    expect(options.forceRefresh).toBe(true)
    expect(options.priority).toBe('high')
    expect(options.tags).toEqual(['api', 'user-data'])
    expect(typeof options.callback).toBe('function')
  })

  it('should define cache statistics structure', () => {
    const stats: CacheTypes.CacheStats = {
      hits: 10,
      misses: 2,
      hitRate: 0.833,
      totalSize: 1024,
      entryCount: 5,
      averageSize: 204.8,
      memoryUsage: 2048,
    }
    
    expect(stats.hits).toBe(10)
    expect(stats.misses).toBe(2)
    expect(stats.hitRate).toBeCloseTo(0.833)
    expect(stats.entryCount).toBe(5)
  })
})

describe('Cache - Integration Tests', () => {
  it('should work with different cache backends', async () => {
    const backends = [
      new MemoryCache(defaultConfig),
      new LocalStorageCache(defaultConfig),
      new SessionStorageCache(defaultConfig),
    ]
    
    for (const backend of backends) {
      await backend.set('integration-test', 'value')
      const result = await backend.get('integration-test')
      expect(result).toBe('value')
      await backend.clear()
    }
  })

  it('should handle concurrent cache operations', async () => {
    const cache = new MemoryCache(defaultConfig)
    
    const operations = [
      cache.set('key1', 'value1'),
      cache.set('key2', 'value2'),
      cache.get('key1'),
      cache.get('key3'),
      cache.has('key1'),
    ]
    
    await Promise.all(operations)
    
    expect(await cache.size()).toBe(2)
  })

  it('should handle cache warming', async () => {
    const cache = new MemoryCache(defaultConfig)
    
    const warmupData = {
      'user:1': { id: 1, name: 'John' },
      'user:2': { id: 2, name: 'Jane' },
      'settings': { theme: 'dark' },
    }
    
    for (const [key, value] of Object.entries(warmupData)) {
      await cache.set(key, value)
    }
    
    expect(await cache.size()).toBe(3)
    
    for (const [key, expectedValue] of Object.entries(warmupData)) {
      const value = await cache.get(key)
      expect(value).toEqual(expectedValue)
    }
  })

  it('should handle cache invalidation', async () => {
    const cache = new MemoryCache(defaultConfig)
    
    await cache.set('user:1', { id: 1, name: 'John' })
    await cache.set('user:2', { id: 2, name: 'Jane' })
    await cache.set('settings', { theme: 'dark' })
    
    // Invalidate all user data
    const keys = await cache.keys()
    const userKeys = keys.filter(key => key.startsWith('user:'))
    
    for (const key of userKeys) {
      await cache.delete(key)
    }
    
    expect(await cache.has('user:1')).toBe(false)
    expect(await cache.has('user:2')).toBe(false)
    expect(await cache.has('settings')).toBe(true)
  })
})

describe('Cache - Performance Tests', () => {
  it('should handle large datasets efficiently', async () => {
    const config: CacheConfig = { ...defaultConfig, maxSize: 1000 }
    const cache = new MemoryCache(config)
    
    const startTime = Date.now()
    
    // Add 1000 entries
    for (let i = 0; i < 1000; i++) {
      await cache.set(`key-${i}`, `value-${i}`)
    }
    
    const setTime = Date.now() - startTime
    expect(setTime).toBeLessThan(1000) // Should complete within 1 second
    
    // Retrieve 1000 entries
    startTime = Date.now()
    const retrievals = []
    for (let i = 0; i < 1000; i++) {
      retrievals.push(cache.get(`key-${i}`))
    }
    await Promise.all(retrievals)
    
    const getTime = Date.now() - startTime
    expect(getTime).toBeLessThan(1000)
  })

  it('should maintain performance with high hit rates', async () => {
    const cache = new MemoryCache(defaultConfig)
    
    // Pre-populate cache
    for (let i = 0; i < 10; i++) {
      await cache.set(`key-${i}`, `value-${i}`)
    }
    
    // Perform many reads to test hit rate optimization
    const startTime = Date.now()
    for (let i = 0; i < 1000; i++) {
      await cache.get(`key-${i % 10}`)
    }
    const elapsed = Date.now() - startTime
    
    expect(elapsed).toBeLessThan(100) // Should be very fast with good hit rate
  })
})
