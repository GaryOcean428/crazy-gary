/**
 * In-memory cache implementation with Redis-like features
 */

import { CacheEntry, CacheStats, CacheBackend } from './cache-types';

export class MemoryCache implements CacheBackend {
  private store = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalSize: 0,
    entryCount: 0,
    averageSize: 0
  };
  private readonly maxSize: number;
  private readonly ttl: number;
  private readonly namespace: string;

  constructor(maxSize: number = 1000, ttl: number = 300000, namespace: string = 'memory') {
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.namespace = namespace;
    
    // Start cleanup interval for expired entries
    this.startCleanupInterval();
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.store.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update stats
    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.value;
  }

  async set<T = any>(key: string, value: T, options?: { ttl?: number; priority?: 'low' | 'normal' | 'high' }): Promise<boolean> {
    try {
      // Check if we need to evict entries
      if (this.store.size >= this.maxSize) {
        await this.evictEntries();
      }

      const ttl = options?.ttl || this.ttl;
      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        size: this.calculateSize(value)
      };

      this.store.set(key, entry);
      this.updateStats();
      
      return true;
    } catch (error) {
      console.error(`MemoryCache.set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.store.delete(key);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  async clear(): Promise<void> {
    this.store.clear();
    this.updateStats();
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.store.delete(key);
      this.updateStats();
      return false;
    }
    
    return true;
  }

  async keys(): Promise<string[]> {
    const now = Date.now();
    const validKeys: string[] = [];
    
    for (const [key, entry] of this.store.entries()) {
      if (!this.isExpired(entry)) {
        validKeys.push(key);
      } else {
        this.store.delete(key);
      }
    }
    
    this.updateStats();
    return validKeys;
  }

  async size(): Promise<number> {
    return this.store.size;
  }

  async stats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  // Redis-like methods
  async setex<T = any>(key: string, ttlSeconds: number, value: T): Promise<boolean> {
    return this.set(key, value, { ttl: ttlSeconds * 1000 });
  }

  async exists(key: string): Promise<number> {
    const has = await this.has(key);
    return has ? 1 : 0;
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    
    entry.ttl = ttlSeconds * 1000;
    entry.timestamp = Date.now();
    this.store.set(key, entry);
    
    return true;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + 1;
    await this.set(key, newValue);
    return newValue;
  }

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

  // Hash operations
  async hkeys(hash: string): Promise<string[]> {
    const keys = await this.keys();
    return keys
      .filter(key => key.startsWith(`${hash}:`))
      .map(key => key.substring(hash.length + 1));
  }

  async hvals<T = any>(hash: string): Promise<T[]> {
    const keys = await this.keys();
    const values: T[] = [];
    
    for (const key of keys) {
      if (key.startsWith(`${hash}:`)) {
        const value = await this.get<T>(key);
        if (value !== null) {
          values.push(value);
        }
      }
    }
    
    return values;
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

  // Sorted set operations
  async zadd(sortedSet: string, score: number, member: string): Promise<number> {
    const fullKey = `${sortedSet}:zset`;
    const sortedSetData = await this.get<Map<string, number>>(fullKey) || new Map<string, number>();
    const existed = sortedSetData.has(member);
    sortedSetData.set(member, score);
    await this.set(fullKey, sortedSetData);
    return existed ? 0 : 1;
  }

  async zrevrange(sortedSet: string, start: number, stop: number): Promise<string[]> {
    const fullKey = `${sortedSet}:zset`;
    const sortedSetData = await this.get<Map<string, number>>(fullKey);
    if (!sortedSetData) return [];
    
    const entries = Array.from(sortedSetData.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(start, stop + 1);
    
    return entries.map(([member]) => member);
  }

  async zscore(sortedSet: string, member: string): Promise<number | null> {
    const fullKey = `${sortedSet}:zset`;
    const sortedSetData = await this.get<Map<string, number>>(fullKey);
    return sortedSetData?.get(member) ?? null;
  }

  // Private methods
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

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private updateStats(): void {
    const now = Date.now();
    let totalSize = 0;
    let expiredEntries = 0;
    
    for (const [key, entry] of this.store.entries()) {
      if (this.isExpired(entry)) {
        this.store.delete(key);
        expiredEntries++;
      } else {
        totalSize += entry.size;
      }
    }
    
    this.stats.totalSize = totalSize;
    this.stats.entryCount = this.store.size;
    this.stats.averageSize = this.stats.entryCount > 0 ? totalSize / this.stats.entryCount : 0;
    
    if (expiredEntries > 0) {
      this.stats.misses += expiredEntries;
      this.updateHitRate();
    }
  }

  private async evictEntries(): Promise<void> {
    const now = Date.now();
    const entries = Array.from(this.store.entries())
      .map(([key, entry]) => ({ key, ...entry }))
      .sort((a, b) => {
        // LRU eviction: prioritize by hits and timestamp
        const aScore = a.hits + (now - a.timestamp) / 1000;
        const bScore = b.hits + (now - b.timestamp) / 1000;
        return aScore - bScore;
      });
    
    const toEvict = Math.ceil(this.maxSize * 0.1); // Evict 10%
    const evicted = entries.slice(0, toEvict);
    
    for (const entry of evicted) {
      this.store.delete(entry.key);
    }
    
    this.updateStats();
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every 30 seconds
    setInterval(() => {
      this.updateStats();
    }, 30 * 1000);
  }
}

// Export singleton instance
export const memoryCache = new MemoryCache();