/**
 * Cache manager that coordinates multiple cache backends
 */

import { 
  CacheBackend, 
  CacheStats, 
  CacheOptions, 
  CacheEntry,
  RedisLikeCache 
} from './cache-types';
import { memoryCache } from './memory-cache';
import { localStorageCache } from './local-storage-cache';
import { sessionStorageCache } from './session-storage-cache';
import { getCacheConfig, CACHE_KEYS } from './cache-config';

export class CacheManager implements CacheBackend {
  private caches: Map<string, CacheBackend> = new Map();
  private defaultBackend: CacheBackend;
  private config: ReturnType<typeof getCacheConfig>;

  constructor() {
    this.config = getCacheConfig();
    this.defaultBackend = memoryCache;
    
    // Register available caches
    this.registerCache('memory', memoryCache);
    this.registerCache('localStorage', localStorageCache);
    this.registerCache('sessionStorage', sessionStorageCache);
  }

  registerCache(name: string, cache: CacheBackend): void {
    this.caches.set(name, cache);
  }

  getCache(name: string): CacheBackend | undefined {
    return this.caches.get(name);
  }

  async get<T = any>(key: string, backendName?: string): Promise<T | null> {
    const cache = backendName ? this.caches.get(backendName) || this.defaultBackend : this.defaultBackend;
    
    // Try cache first
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not found and we have a backend specified, try the default
    if (!backendName) {
      const defaultCached = await this.defaultBackend.get<T>(key);
      if (defaultCached !== null) {
        return defaultCached;
      }
    }

    return null;
  }

  async set<T = any>(key: string, value: T, options?: CacheOptions & { backend?: string }): Promise<boolean> {
    const backendName = options?.backend;
    const cache = backendName ? this.caches.get(backendName) || this.defaultBackend : this.defaultBackend;
    
    const success = await cache.set(key, value, options);
    
    // Also store in default cache if different backend is specified
    if (backendName && cache !== this.defaultBackend) {
      await this.defaultBackend.set(key, value, options);
    }

    return success;
  }

  async delete(key: string, backendName?: string): Promise<boolean> {
    const cache = backendName ? this.caches.get(backendName) || this.defaultBackend : this.defaultBackend;
    return cache.delete(key);
  }

  async clear(backendName?: string): Promise<void> {
    if (backendName) {
      const cache = this.caches.get(backendName);
      if (cache) {
        await cache.clear();
      }
    } else {
      // Clear all caches
      for (const cache of this.caches.values()) {
        await cache.clear();
      }
    }
  }

  async has(key: string, backendName?: string): Promise<boolean> {
    const cache = backendName ? this.caches.get(backendName) || this.defaultBackend : this.defaultBackend;
    return cache.has(key);
  }

  async keys(backendName?: string): Promise<string[]> {
    if (backendName) {
      const cache = this.caches.get(backendName);
      return cache ? cache.keys() : [];
    } else {
      // Get keys from all caches (with duplicates)
      const allKeys: string[] = [];
      for (const cache of this.caches.values()) {
        const keys = await cache.keys();
        allKeys.push(...keys);
      }
      return [...new Set(allKeys)]; // Remove duplicates
    }
  }

  async size(backendName?: string): Promise<number> {
    if (backendName) {
      const cache = this.caches.get(backendName);
      return cache ? cache.size() : 0;
    } else {
      let totalSize = 0;
      for (const cache of this.caches.values()) {
        totalSize += await cache.size();
      }
      return totalSize;
    }
  }

  async stats(backendName?: string): Promise<CacheStats> {
    if (backendName) {
      const cache = this.caches.get(backendName);
      return cache ? cache.stats() : {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalSize: 0,
        entryCount: 0,
        averageSize: 0
      };
    } else {
      // Aggregate stats from all caches
      let totalHits = 0;
      let totalMisses = 0;
      let totalSize = 0;
      let totalEntries = 0;
      
      for (const cache of this.caches.values()) {
        const stats = await cache.stats();
        totalHits += stats.hits;
        totalMisses += stats.misses;
        totalSize += stats.totalSize;
        totalEntries += stats.entryCount;
      }
      
      const total = totalHits + totalMisses;
      return {
        hits: totalHits,
        misses: totalMisses,
        hitRate: total > 0 ? totalHits / total : 0,
        totalSize,
        entryCount: totalEntries,
        averageSize: totalEntries > 0 ? totalSize / totalEntries : 0
      };
    }
  }

  // Advanced cache operations
  async getOrSet<T = any>(
    key: string, 
    factory: () => Promise<T> | T, 
    options?: CacheOptions & { backend?: string }
  ): Promise<T> {
    let cached = await this.get<T>(key, options?.backend);
    
    if (cached === null) {
      cached = await factory();
      await this.set(key, cached, options);
    }
    
    return cached;
  }

  async invalidatePattern(pattern: string, backendName?: string): Promise<number> {
    const cache = backendName ? this.caches.get(backendName) || this.defaultBackend : this.defaultBackend;
    const keys = await cache.keys();
    const regex = new RegExp(pattern);
    let invalidated = 0;
    
    for (const key of keys) {
      if (regex.test(key)) {
        await cache.delete(key);
        invalidated++;
      }
    }
    
    return invalidated;
  }

  async getByTag(tag: string, backendName?: string): Promise<Record<string, any>> {
    const cache = backendName ? this.caches.get(backendName) || this.defaultBackend : this.defaultBackend;
    const keys = await cache.keys();
    const results: Record<string, any> = {};
    
    for (const key of keys) {
      try {
        const value = await cache.get(key);
        if (value !== null) {
          // Check if the value has a tag property
          const entry = value as any;
          if (entry && typeof entry === 'object' && entry.tags && Array.isArray(entry.tags) && entry.tags.includes(tag)) {
            results[key] = value;
          }
        }
      } catch {
        // Skip invalid entries
      }
    }
    
    return results;
  }

  async invalidateByTag(tag: string, backendName?: string): Promise<number> {
    const results = await this.getByTag(tag, backendName);
    const cache = backendName ? this.caches.get(backendName) || this.defaultBackend : this.defaultBackend;
    let invalidated = 0;
    
    for (const key of Object.keys(results)) {
      await cache.delete(key);
      invalidated++;
    }
    
    return invalidated;
  }

  // Multi-backend operations
  async getFromAll<T = any>(key: string): Promise<{ backend: string; value: T | null }[]> {
    const results: { backend: string; value: T | null }[] = [];
    
    for (const [name, cache] of this.caches.entries()) {
      const value = await cache.get<T>(key);
      results.push({ backend: name, value });
    }
    
    return results;
  }

  async setInAll<T = any>(key: string, value: T, options?: CacheOptions): Promise<{ backend: string; success: boolean }[]> {
    const results: { backend: string; success: boolean }[] = [];
    
    for (const [name, cache] of this.caches.entries()) {
      const success = await cache.set(key, value, options);
      results.push({ backend: name, success });
    }
    
    return results;
  }

  // Redis-like interface (delegates to memory cache)
  async getRedis(): Promise<RedisLikeCache> {
    return {
      get: <T = any>(key: string) => this.defaultBackend.get<T>(key),
      set: <T = any>(key: string, value: T, ttl?: number) => {
        if (ttl) {
          return (this.defaultBackend as any).setex(key, Math.floor(ttl / 1000), value);
        } else {
          return this.defaultBackend.set(key, value);
        }
      },
      setex: (key: string, ttl: number, value: any) => (this.defaultBackend as any).setex(key, ttl, value),
      del: (key: string) => this.defaultBackend.delete(key),
      exists: (key: string) => this.defaultBackend.exists(key),
      expire: (key: string, ttl: number) => (this.defaultBackend as any).expire(key, ttl),
      incr: (key: string) => (this.defaultBackend as any).incr(key),
      hget: <T = any>(hash: string, field: string) => (this.defaultBackend as any).hget<T>(hash, field),
      hset: (hash: string, field: string, value: any) => (this.defaultBackend as any).hset(hash, field, value),
      hgetall: <T = any>(hash: string) => (this.defaultBackend as any).hgetall<T>(hash),
      hdel: (hash: string, field: string) => (this.defaultBackend as any).hdel(hash, field),
      lpush: (key: string, value: any) => (this.defaultBackend as any).lpush(key, value),
      rpop: (key: string) => (this.defaultBackend as any).rpop(key),
      smembers: (set: string) => (this.defaultBackend as any).smembers(set),
      sadd: (set: string, member: string) => (this.defaultBackend as any).sadd(set, member),
      srem: (set: string, member: string) => (this.defaultBackend as any).srem(set, member),
      zadd: (sortedSet: string, score: number, member: string) => (this.defaultBackend as any).zadd(sortedSet, score, member),
      zrevrange: (sortedSet: string, start: number, stop: number) => (this.defaultBackend as any).zrevrange(sortedSet, start, stop)
    };
  }

  // Configuration methods
  getConfig() {
    return this.config;
  }

  async healthCheck(): Promise<{ backend: string; healthy: boolean; error?: string }[]> {
    const results: { backend: string; healthy: boolean; error?: string }[] = [];
    
    for (const [name, cache] of this.caches.entries()) {
      try {
        const testKey = `health-check-${Date.now()}`;
        await cache.set(testKey, { test: true }, { ttl: 1000 });
        const retrieved = await cache.get(testKey);
        await cache.delete(testKey);
        
        const healthy = retrieved && typeof retrieved === 'object' && 'test' in retrieved;
        results.push({ backend: name, healthy });
      } catch (error) {
        results.push({ 
          backend: name, 
          healthy: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  async cleanup(): Promise<void> {
    for (const cache of this.caches.values()) {
      // Trigger cleanup in each cache backend
      try {
        await cache.keys(); // This will trigger cleanup in some implementations
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Convenience methods
export const cache = {
  get: <T = any>(key: string, options?: CacheOptions) => cacheManager.get<T>(key, options?.backend),
  set: <T = any>(key: string, value: T, options?: CacheOptions) => cacheManager.set<T>(key, value, options),
  delete: (key: string, backendName?: string) => cacheManager.delete(key, backendName),
  clear: (backendName?: string) => cacheManager.clear(backendName),
  has: (key: string, backendName?: string) => cacheManager.has(key, backendName),
  keys: (backendName?: string) => cacheManager.keys(backendName),
  size: (backendName?: string) => cacheManager.size(backendName),
  stats: (backendName?: string) => cacheManager.stats(backendName),
  
  // Advanced methods
  getOrSet: <T = any>(key: string, factory: () => Promise<T> | T, options?: CacheOptions) => 
    cacheManager.getOrSet(key, factory, options),
  
  invalidatePattern: (pattern: string, backendName?: string) => 
    cacheManager.invalidatePattern(pattern, backendName),
  
  getByTag: (tag: string, backendName?: string) => 
    cacheManager.getByTag(tag, backendName),
  
  invalidateByTag: (tag: string, backendName?: string) => 
    cacheManager.invalidateByTag(tag, backendName)
};