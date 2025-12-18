/**
 * Cache types and interfaces
 */

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  enableCompression?: boolean;
  enableEncryption?: boolean;
  namespace?: string;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
  metadata?: Record<string, any>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
  averageSize: number;
  memoryUsage?: number;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  forceRefresh?: boolean;
[];
  priority  dependencies?: string?: 'low' | 'normal' | 'high';
  tags?: string[];
  callback?: (key: string, value: any) => void;
}

export interface CacheBackend {
  get<T = any>(key: string): Promise<T | null> | T | null;
  set<T = any>(key: string, value: T, options?: CacheOptions): Promise<boolean> | boolean;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  has(key: string): Promise<boolean> | boolean;
  keys(): Promise<string[]> | string[];
  size(): Promise<number> | number;
  stats(): Promise<CacheStats> | CacheStats;
}

export interface RedisLikeCache {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<boolean>;
  setex<T = any>(key: string, ttl: number, value: T): Promise<boolean>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, ttl: number): Promise<boolean>;
  incr(key: string): Promise<number>;
  hget<T = any>(hash: string, field: string): Promise<T | null>;
  hset(hash: string, field: string, value: any): Promise<number>;
  hgetall<T = any>(hash: string): Promise<Record<string, T>>;
  hdel(hash: string, field: string): Promise<number>;
  lpush(key: string, value: any): Promise<number>;
  rpop(key: string): Promise<any>;
  smembers(set: string): Promise<string[]>;
  sadd(set: string, member: string): Promise<number>;
  srem(set: string, member: string): Promise<number>;
  zadd(sortedSet: string, score: number, member: string): Promise<number>;
  zrevrange(sortedSet: string, start: number, stop: number): Promise<string[]>;
}

export interface CacheInvalidationRule {
  pattern: string;
  action: 'clear' | 'invalidate' | 'tag' | 'dependency';
  dependencies?: string[];
  tags?: string[];
  conditions?: (entry: CacheEntry) => boolean;
}

export interface CacheWarmupConfig {
  enabled: boolean;
  strategies: {
    eager: string[]; // Keys to load eagerly
    lazy: string[]; // Keys to load on first access
    background: string[]; // Keys to load in background
    predictive: string[]; // Keys to load based on user behavior
  };
  intervals: {
    eager: number; // Load interval for eager keys
    lazy: number; // Stale time for lazy keys
    background: number; // Background refresh interval
    predictive: number; // Predictive loading interval
  };
}

export interface CacheMonitoringConfig {
  enabled: boolean;
  samplingRate: number; // 0-1, percentage of operations to sample
  metrics: {
    latency: boolean;
    hitRate: boolean;
    memoryUsage: boolean;
    errorRate: boolean;
    custom: Record<string, boolean>;
  };
  alerting: {
    hitRateThreshold: number; // Alert if hit rate drops below this
    memoryThreshold: number; // Alert if memory usage exceeds this
    latencyThreshold: number; // Alert if average latency exceeds this
  };
}

export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'cache-only' | 'network-only' | 'custom';

export interface CacheStrategyConfig {
  strategy: CacheStrategy;
  fallback?: CacheStrategy;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  errorHandler?: (error: Error) => Promise<any> | any;
}

export interface CacheDependency {
  key: string;
  dependencies: string[];
  ttl: number;
  invalidationCallback?: (invalidatedKeys: string[]) => void;
}