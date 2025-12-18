/**
 * localStorage-based cache implementation
 */

import { CacheEntry, CacheStats, CacheBackend } from './cache-types';

export class LocalStorageCache implements CacheBackend {
  private readonly prefix: string;
  private readonly maxSize: number;
  private readonly ttl: number;
  private readonly namespace: string;

  constructor(maxSize: number = 100, ttl: number = 1800000, namespace: string = 'local') {
    this.prefix = `cache:${namespace}:`;
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.namespace = namespace;
    
    // Start cleanup interval for expired entries
    this.startCleanupInterval();
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const item = localStorage.getItem(fullKey);
      
      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if entry is expired
      if (this.isExpired(entry)) {
        localStorage.removeItem(fullKey);
        return null;
      }

      return entry.value;
    } catch (error) {
      console.error(`LocalStorageCache.get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, options?: { ttl?: number }): Promise<boolean> {
    try {
      // Check if we need to evict entries
      const currentSize = await this.size();
      if (currentSize >= this.maxSize) {
        await this.evictEntries();
      }

      const fullKey = this.getFullKey(key);
      const ttl = options?.ttl || this.ttl;
      
      const entry: CacheEntry<T> = {
        key: fullKey,
        value,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        size: this.calculateSize(value)
      };

      const serialized = JSON.stringify(entry);
      localStorage.setItem(fullKey, serialized);
      
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Storage quota exceeded, try to evict and retry
        await this.evictEntries();
        try {
          const fullKey = this.getFullKey(key);
          const entry: CacheEntry<T> = {
            key: fullKey,
            value,
            timestamp: Date.now(),
            ttl: options?.ttl || this.ttl,
            hits: 0,
            size: this.calculateSize(value)
          };
          localStorage.setItem(fullKey, JSON.stringify(entry));
          return true;
        } catch (retryError) {
          console.error(`LocalStorageCache.set retry error for key ${key}:`, retryError);
          return false;
        }
      }
      console.error(`LocalStorageCache.set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error(`LocalStorageCache.delete error for key ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('LocalStorageCache.clear error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    try {
      const item = localStorage.getItem(fullKey);
      if (!item) return false;
      
      const entry = JSON.parse(item);
      if (this.isExpired(entry)) {
        localStorage.removeItem(fullKey);
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  async keys(): Promise<string[]> {
    const keys: string[] = [];
    const prefix = this.prefix;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          // Check if entry is still valid
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const entry = JSON.parse(item);
              if (!this.isExpired(entry)) {
                keys.push(key.substring(prefix.length));
              } else {
                localStorage.removeItem(key);
              }
            } catch {
              // Invalid entry, remove it
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('LocalStorageCache.keys error:', error);
    }
    
    return keys;
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }

  async stats(): Promise<CacheStats> {
    const keys = await this.keys();
    let totalSize = 0;
    let hitCount = 0;
    
    for (const key of keys) {
      try {
        const fullKey = this.getFullKey(key);
        const item = localStorage.getItem(fullKey);
        if (item) {
          const entry = JSON.parse(item);
          totalSize += entry.size || 0;
          hitCount += entry.hits || 0;
        }
      } catch {
        // Skip invalid entries
      }
    }
    
    const entryCount = keys.length;
    
    return {
      hits: hitCount,
      misses: 0, // We don't track misses in localStorage
      hitRate: 1, // Default to 1 since we don't track misses
      totalSize,
      entryCount,
      averageSize: entryCount > 0 ? totalSize / entryCount : 0
    };
  }

  // Redis-like methods (adapted for localStorage)
  async setex<T = any>(key: string, ttlSeconds: number, value: T): Promise<boolean> {
    return this.set(key, value, { ttl: ttlSeconds * 1000 });
  }

  async exists(key: string): Promise<number> {
    const has = await this.has(key);
    return has ? 1 : 0;
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const item = localStorage.getItem(fullKey);
      if (!item) return false;
      
      const entry = JSON.parse(item);
      entry.timestamp = Date.now();
      entry.ttl = ttlSeconds * 1000;
      localStorage.setItem(fullKey, JSON.stringify(entry));
      
      return true;
    } catch {
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + 1;
    await this.set(key, newValue);
    return newValue;
  }

  // Hash operations
  async hget<T = any>(hash: string, field: string): Promise<T | null> {
    const fullKey = `${hash}:${field}`;
    return this.get<T>(fullKey);
  }

  async hset(hash: string, field: string, value: any): Promise<number> {
    const fullKey = `${hash}:${field}`;
    const exists = await this.has(fullKey);
    await this.set(fullKey, value);
    return exists ? 0 : 1;
  }

  async hgetall<T = any>(hash: string): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    const keys = await this.keys();
    
    for (const key of keys) {
      if (key.startsWith(`${hash}:`)) {
        const field = key.substring(hash.length + 1);
        const value = await this.get<T>(key);
        if (value !== null) {
          results[field] = value;
        }
      }
    }
    
    return results;
  }

  async hdel(hash: string, field: string): Promise<number> {
    const fullKey = `${hash}:${field}`;
    return (await this.delete(fullKey)) ? 1 : 0;
  }

  // Set operations
  async sadd(set: string, member: string): Promise<number> {
    const fullKey = `${set}:set`;
    const members = await this.get<Set<string>>(fullKey) || new Set<string>();
    const size = members.size;
    members.add(member);
    await this.set(fullKey, members);
    return members.size > size ? 1 : 0;
  }

  async srem(set: string, member: string): Promise<number> {
    const fullKey = `${set}:set`;
    const members = await this.get<Set<string>>(fullKey);
    if (!members) return 0;
    
    const size = members.size;
    members.delete(member);
    await this.set(fullKey, members);
    return size > members.size ? 1 : 0;
  }

  async smembers(set: string): Promise<string[]> {
    const fullKey = `${set}:set`;
    const members = await this.get<Set<string>>(fullKey);
    return members ? Array.from(members) : [];
  }

  async scard(set: string): Promise<number> {
    const fullKey = `${set}:set`;
    const members = await this.get<Set<string>>(fullKey);
    return members ? members.size : 0;
  }

  // Private methods
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  private async evictEntries(): Promise<void> {
    const keys = await this.keys();
    if (keys.length <= this.maxSize) return;
    
    // Sort by timestamp (LRU - remove oldest first)
    const keyAges: Array<{ key: string; age: number }> = [];
    
    for (const key of keys) {
      try {
        const fullKey = this.getFullKey(key);
        const item = localStorage.getItem(fullKey);
        if (item) {
          const entry = JSON.parse(item);
          keyAges.push({
            key: fullKey,
            age: Date.now() - entry.timestamp
          });
        }
      } catch {
        // Skip invalid entries
      }
    }
    
    // Sort by age (oldest first)
    keyAges.sort((a, b) => b.age - a.age);
    
    // Remove 20% of entries
    const toRemove = Math.ceil(this.maxSize * 0.2);
    for (let i = 0; i < Math.min(toRemove, keyAges.length); i++) {
      localStorage.removeItem(keyAges[i].key);
    }
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
  }

  private async cleanupExpired(): Promise<void> {
    try {
      const keys = await this.keys();
      const prefix = this.prefix;
      
      for (const key of keys) {
        const fullKey = prefix + key;
        const item = localStorage.getItem(fullKey);
        
        if (item) {
          try {
            const entry = JSON.parse(item);
            if (this.isExpired(entry)) {
              localStorage.removeItem(fullKey);
            }
          } catch {
            // Remove corrupted entries
            localStorage.removeItem(fullKey);
          }
        }
      }
    } catch (error) {
      console.error('LocalStorage cleanup error:', error);
    }
  }
}

// Export singleton instance
export const localStorageCache = new LocalStorageCache();